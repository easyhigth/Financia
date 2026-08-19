// Briques de calcul du risque : génération de scénarios reproductibles,
// VaR historique, Expected Shortfall, back-testing, volatilité conditionnelle
// et modèle de Merton.
import { N, normInv } from './bs.js';

/**
 * Générateur pseudo-aléatoire déterministe (mulberry32).
 * Une même graine redonne exactement la même série : indispensable pour qu'un
 * calculateur pédagogique soit reproductible d'une session à l'autre.
 */
export function rng(seed = 42) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tirage normal centré réduit (Box-Muller). */
export function randNorm(u) {
  const a = Math.max(u(), 1e-12), b = u();
  return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
}

/**
 * Tirage de Student à df degrés de liberté, normalisé à variance 1.
 * Sert à produire des queues épaisses — les rendements réels en ont, la loi
 * normale n'en a pas, et c'est toute la limite de la VaR paramétrique.
 */
export function randStudent(u, df) {
  // Au-delà d'une trentaine de degrés de liberté, la loi de Student est déjà
  // indiscernable d'une normale : on économise autant de tirages.
  if (!Number.isFinite(df) || df > 30) return randNorm(u);
  const d = Math.max(3, Math.round(df));
  let chi2 = 0;
  for (let i = 0; i < d; i++) { const z = randNorm(u); chi2 += z * z; }
  const t = randNorm(u) / Math.sqrt(chi2 / d);
  return t * Math.sqrt((d - 2) / d);          // renormalisation à variance 1
}

/** Série de rendements simulés, de volatilité et d'épaisseur de queue choisies. */
export function simulate({ n = 500, vol = 0.012, df = 4, seed = 42, mu = 0 } = {}) {
  const u = rng(seed);
  return Array.from({ length: n }, () => mu + vol * randStudent(u, df));
}

/** Quantile empirique (interpolation linéaire), sur un tableau non trié. */
export function quantile(arr, p) {
  const a = arr.slice().sort((x, y) => x - y);
  if (!a.length) return NaN;
  const idx = (a.length - 1) * Math.min(Math.max(p, 0), 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return lo === hi ? a[lo] : a[lo] + (a[hi] - a[lo]) * (idx - lo);
}

/**
 * VaR et Expected Shortfall historiques, exprimés en perte positive.
 * @param {number[]} rendements  rendements en décimal (−0,02 = −2 %)
 * @param {number} alpha         niveau de confiance (0,99)
 * @param {number} V             valeur du portefeuille
 */
export function histVarES(rendements, alpha, V) {
  const pertes = rendements.map((r) => -r * V);          // perte = rendement négatif
  const varAbs = quantile(pertes, alpha);
  const queue = pertes.filter((x) => x >= varAbs);
  const es = queue.length ? queue.reduce((a, b) => a + b, 0) / queue.length : varAbs;
  return { varAbs, es, nQueue: queue.length, pertes };
}

/** VaR et ES gaussiens, pour comparaison avec l'historique. */
export function paramVarES(sigma, alpha, V) {
  const z = normInv(alpha);
  const phi = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  return { varAbs: z * sigma * V, es: (phi / (1 - alpha)) * sigma * V, z };
}

/**
 * Test de Kupiec (couverture non conditionnelle).
 * Vérifie que le nombre d'exceptions observées est compatible avec le niveau
 * de confiance annoncé. Seuil à 95 % : LR > 3,841 ⇒ modèle rejeté.
 */
export function kupiec(n, x, p) {
  if (n <= 0) return { LR: NaN, rejete: false, attendu: 0, taux: 0 };
  const attendu = n * p;
  const taux = x / n;
  if (x === 0) {
    const LR = -2 * n * Math.log(1 - p);
    return { LR, rejete: LR > 3.841, attendu, taux };
  }
  if (x === n) return { LR: Infinity, rejete: true, attendu, taux };
  const lnL0 = (n - x) * Math.log(1 - p) + x * Math.log(p);
  const lnL1 = (n - x) * Math.log(1 - taux) + x * Math.log(taux);
  const LR = -2 * (lnL0 - lnL1);
  return { LR, rejete: LR > 3.841, attendu, taux };
}

/**
 * Zone du dispositif de Bâle (250 jours, 99 %) et majoration du multiplicateur.
 * Le multiplicateur de base est de 3 ; il monte jusqu'à 4 en zone rouge.
 */
export function baleZone(exceptions) {
  const x = Math.max(0, Math.round(exceptions));
  const majorations = { 5: 0.40, 6: 0.50, 7: 0.65, 8: 0.75, 9: 0.85 };
  if (x <= 4) return { zone: 'verte', majoration: 0, multiplicateur: 3.0,
                       message: "Nombre d'exceptions compatible avec le modèle : aucune mesure." };
  if (x <= 9) return { zone: 'orange', majoration: majorations[x], multiplicateur: 3 + majorations[x],
                       message: "Zone d'attention : le multiplicateur de fonds propres est majoré et le modèle doit être examiné." };
  return { zone: 'rouge', majoration: 1.0, multiplicateur: 4.0,
           message: "Modèle présumé défaillant : majoration maximale, revue du modèle et information du superviseur." };
}

/**
 * Volatilité conditionnelle EWMA (RiskMetrics : λ = 0,94 en données quotidiennes).
 * Renvoie la série des écarts-types estimés, jour après jour.
 */
export function ewma(rendements, lambda = 0.94, sigma0 = null) {
  if (!rendements.length) return [];
  const init = sigma0 !== null ? sigma0 * sigma0
    : rendements.slice(0, Math.min(20, rendements.length))
        .reduce((a, r) => a + r * r, 0) / Math.min(20, rendements.length);
  let v = init;
  return rendements.map((r) => {
    v = lambda * v + (1 - lambda) * r * r;
    return Math.sqrt(v);
  });
}

/** Volatilité historique glissante à poids égaux, sur une fenêtre donnée. */
export function volGlissante(rendements, fenetre = 60) {
  return rendements.map((_, i) => {
    if (i < fenetre - 1) return null;
    const f = rendements.slice(i - fenetre + 1, i + 1);
    const m = f.reduce((a, b) => a + b, 0) / f.length;
    return Math.sqrt(f.reduce((a, r) => a + (r - m) * (r - m), 0) / (f.length - 1));
  });
}

/**
 * Modèle de Merton : les fonds propres sont un call sur l'actif de l'entreprise,
 * de strike égal à la dette. On en déduit une probabilité de défaut.
 * @param {object} p { V (valeur de l'actif), D (dette), T, r, sigmaV }
 */
export function merton({ V, D, T, r, sigmaV }) {
  const t = Math.max(T, 1e-8), s = Math.max(sigmaV, 1e-8);
  const sq = s * Math.sqrt(t);
  const d1 = (Math.log(V / D) + (r + 0.5 * s * s) * t) / sq;
  const d2 = d1 - sq;
  const capitaux = V * N(d1) - D * Math.exp(-r * t) * N(d2);
  const dette = V - capitaux;
  const pd = N(-d2);
  const recouvrement = pd > 1e-12 ? Math.min(1, (D * Math.exp(-r * t) - (D * Math.exp(-r * t) - dette) / pd) / (D * Math.exp(-r * t))) : 1;
  return {
    d1, d2, capitaux, dette, pd,
    distanceDefaut: d2,                                   // en écarts-types
    spread: -Math.log(dette / (D * Math.exp(-r * t))) / t, // spread de crédit continu
    recouvrement,
  };
}

/**
 * Probabilité de défaut implicite d'un spread de crédit, sous forme réduite.
 * spread ≈ λ × (1 − R) ⇒ λ = spread/(1 − R), puis PD cumulée = 1 − e^(−λT).
 */
export function pdImplicite(spreadBp, recouvrement, T) {
  const s = spreadBp / 10000;
  const lgd = Math.max(1e-6, 1 - recouvrement);
  const lambda = s / lgd;                                  // intensité de défaut annuelle
  return { lambda, pdAn: 1 - Math.exp(-lambda), pdCumulee: 1 - Math.exp(-lambda * T), lgd };
}
