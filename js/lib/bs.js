// Briques de calcul partagées par les calculateurs et les graphiques :
// loi normale, Black-Scholes, grecques et arbre binomial.

/** Densité de la loi normale centrée réduite. */
export const phi = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

/** Fonction de répartition normale (Abramowitz & Stegun 7.1.26, erreur < 7,5e-8). */
export function N(x) {
  const s = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);
  return 0.5 * (1 + s * y);
}

/** Quantile de la loi normale (algorithme d'Acklam). */
export function normInv(p) {
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pl = 0.02425;
  let q, r;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - pl) return -normInv(1 - p);
  q = p - 0.5; r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
         (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/**
 * Black-Scholes complet : primes et grecques.
 * @param {object} p  { S, K, T (années), r, q, sigma } — taux en décimal
 * @returns {object}  d1, d2, call, put et les grecques des deux sens
 */
export function bs({ S, K, T, r = 0, q = 0, sigma }) {
  const t = Math.max(T, 1e-8);
  const s = Math.max(sigma, 1e-8);
  const sq = s * Math.sqrt(t);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * s * s) * t) / sq;
  const d2 = d1 - sq;
  const dfR = Math.exp(-r * t), dfQ = Math.exp(-q * t);
  const call = S * dfQ * N(d1) - K * dfR * N(d2);
  const put = K * dfR * N(-d2) - S * dfQ * N(-d1);
  const deltaCall = dfQ * N(d1);
  return {
    d1, d2, call, put, dfR, dfQ,
    deltaCall,
    deltaPut: deltaCall - dfQ,
    gamma: (dfQ * phi(d1)) / (S * sq),
    vega: S * dfQ * phi(d1) * Math.sqrt(t) / 100,                    // pour +1 point de volatilité
    thetaCall: (-(S * dfQ * phi(d1) * s) / (2 * Math.sqrt(t)) - r * K * dfR * N(d2) + q * S * dfQ * N(d1)) / 365,
    thetaPut: (-(S * dfQ * phi(d1) * s) / (2 * Math.sqrt(t)) + r * K * dfR * N(-d2) - q * S * dfQ * N(-d1)) / 365,
    rhoCall: K * t * dfR * N(d2) / 100,
    rhoPut: -K * t * dfR * N(-d2) / 100,
  };
}

/** Prime d'une option européenne, dans le sens demandé. */
export const bsPrice = (p, type) => (type === 'put' ? bs(p).put : bs(p).call);

/**
 * Arbre binomial de Cox-Ross-Rubinstein.
 * Renvoie le prix, le delta initial, les paramètres et la grille complète des
 * nœuds — de quoi afficher l'arbre autant que le résultat.
 *
 * @param {object} p { S, K, T, r, q, sigma, steps, type:'call'|'put', american:boolean }
 */
export function binomial({ S, K, T, r = 0, q = 0, sigma, steps = 3, type = 'call', american = false }) {
  const n = Math.max(1, Math.min(Math.round(steps), 400));
  const dt = Math.max(T, 1e-8) / n;
  const u = Math.exp(Math.max(sigma, 1e-8) * Math.sqrt(dt));
  const d = 1 / u;
  const disc = Math.exp(-r * dt);
  const p = (Math.exp((r - q) * dt) - d) / (u - d);
  const payoff = (x) => (type === 'put' ? Math.max(K - x, 0) : Math.max(x - K, 0));

  // prix du sous-jacent : stock[i][j], i = étape, j = nombre de hausses
  const stock = [];
  for (let i = 0; i <= n; i++) {
    stock[i] = [];
    for (let j = 0; j <= i; j++) stock[i][j] = S * Math.pow(u, j) * Math.pow(d, i - j);
  }

  // valeurs de l'option, par induction rétrograde
  const val = [];
  val[n] = stock[n].map(payoff);
  const exercised = [];                       // exercice anticipé optimal ? (options américaines)
  exercised[n] = stock[n].map((x) => payoff(x) > 0);
  for (let i = n - 1; i >= 0; i--) {
    val[i] = []; exercised[i] = [];
    for (let j = 0; j <= i; j++) {
      const cont = disc * (p * val[i + 1][j + 1] + (1 - p) * val[i + 1][j]);
      const ex = payoff(stock[i][j]);
      const takeEx = american && ex > cont;
      val[i][j] = takeEx ? ex : cont;
      exercised[i][j] = takeEx;
    }
  }

  const delta = n >= 1
    ? (val[1][1] - val[1][0]) / (stock[1][1] - stock[1][0])
    : 0;

  return { price: val[0][0], delta, u, d, p, dt, disc, n, stock, val, exercised };
}

/** Payoff à l'échéance d'une jambe optionnelle ou de sous-jacent. */
export function legPayoff(leg, S) {
  const q = leg.qty;
  if (leg.kind === 'stock') return q * S;
  const intr = leg.kind === 'put' ? Math.max(leg.K - S, 0) : Math.max(S - leg.K, 0);
  return q * intr;
}

/** Coût initial d'une jambe (prime payée si positive, encaissée si négative). */
export function legCost(leg, params) {
  if (leg.kind === 'stock') return leg.qty * params.S;
  return leg.qty * bsPrice({ ...params, K: leg.K }, leg.kind);
}
