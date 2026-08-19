// Vue Graphiques : tracés SVG générés à la volée, sans librairie externe (contrainte offline).
import { esc, pageHead, num, fieldNum } from '../ui.js';
import { bs, binomial, legPayoff, legCost } from '../lib/bs.js';

// ------------------------------------------------------------ Moteur de tracé
const W = 640, H = 366, PAD = { l: 54, r: 18, t: 30, b: 36 };

function plot({ series, xLabel, yLabel, xTicks = 6, yTicks = 5, xFmt = (v) => num(v, 0), yFmt = (v) => num(v, 2), zeroLine = false }) {
  const pts = series.flatMap((s) => s.points);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  let x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (x1 === x0) x1 = x0 + 1;
  const padY = (y1 - y0) * 0.1 || 1;
  y0 -= padY; y1 += padY;

  const X = (v) => PAD.l + ((v - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);
  const Y = (v) => H - PAD.b - ((v - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);

  const grid = [];
  for (let i = 0; i <= yTicks; i++) {
    const v = y0 + ((y1 - y0) * i) / yTicks;
    grid.push(`<line class="grid-l" x1="${PAD.l}" y1="${Y(v).toFixed(1)}" x2="${W - PAD.r}" y2="${Y(v).toFixed(1)}"/>`);
    grid.push(`<text x="${PAD.l - 6}" y="${(Y(v) + 3).toFixed(1)}" text-anchor="end">${esc(yFmt(v))}</text>`);
  }
  for (let i = 0; i <= xTicks; i++) {
    const v = x0 + ((x1 - x0) * i) / xTicks;
    grid.push(`<text x="${X(v).toFixed(1)}" y="${H - PAD.b + 15}" text-anchor="middle">${esc(xFmt(v))}</text>`);
  }

  const zero = zeroLine && y0 < 0 && y1 > 0
    ? `<line class="zero" x1="${PAD.l}" y1="${Y(0).toFixed(1)}" x2="${W - PAD.r}" y2="${Y(0).toFixed(1)}"/>` : '';

  const paths = series.map((s, i) => {
    const d = s.points.map((p, j) => `${j ? 'L' : 'M'}${X(p[0]).toFixed(2)},${Y(p[1]).toFixed(2)}`).join(' ');
    const cls = ['serie', 'serie serie-2', 'serie serie-3'][i % 3];
    const dash = s.dashed ? ' stroke-dasharray="5 4"' : '';
    return `<path class="${cls}" d="${d}"${dash}${s.color ? ` style="stroke:${s.color}"` : ''}/>`;
  }).join('');

  const dots = series.flatMap((s) => (s.markers || []).map((m) =>
    `<circle cx="${X(m[0]).toFixed(2)}" cy="${Y(m[1]).toFixed(2)}" r="4" fill="${s.color || '#5b9bd5'}"/>`
  )).join('');

  const legend = series.map((s, i) => {
    const c = s.color || ['#5b9bd5', '#d2a14a', '#4fae7d'][i % 3];
    return `<span><i style="background:${c}"></i>${esc(s.name)}</span>`;
  }).join('');

  return `
    <div class="chart-wrap">
      <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(yLabel)} en fonction de ${esc(xLabel)}">
        ${grid.join('')}
        <line class="axis" x1="${PAD.l}" y1="${PAD.t}" x2="${PAD.l}" y2="${H - PAD.b}"/>
        <line class="axis" x1="${PAD.l}" y1="${H - PAD.b}" x2="${W - PAD.r}" y2="${H - PAD.b}"/>
        ${zero}${paths}${dots}
        <text x="${W - PAD.r}" y="${H - 4}" text-anchor="end">${esc(xLabel)}</text>
        <text x="6" y="14">${esc(yLabel)}</text>
      </svg>
    </div>
    <div class="legend">${legend}</div>`;
}


/**
 * Rendu d'un arbre binomial : chaque nœud porte le prix du sous-jacent et la
 * valeur de l'option. Les nœuds où l'exercice anticipé est optimal sont marqués.
 */
function tree(t, { type, american }) {
  const n = t.n;
  // Largeur proportionnelle au nombre d'étapes : les petits arbres tiennent dans
  // l'écran, les grands défilent horizontalement plutôt que de devenir illisibles.
  const W2 = 150 + n * 120, H2 = 66 + n * 78;
  const padL = 46, padR = 46, padT = 38, padB = 24;
  const dx = (W2 - padL - padR) / Math.max(n, 1);
  const dy = (H2 - padT - padB) / Math.max(n, 1);
  const X = (i) => padL + i * dx;
  const Y = (i, j) => padT + ((H2 - padT - padB) / 2) + (i - 2 * j) * dy / 2;

  const edges = [];
  const nodes = [];
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= i; j++) {
      const x = X(i), y = Y(i, j);
      if (i < n) {
        edges.push(`<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${X(i + 1).toFixed(1)}" y2="${Y(i + 1, j + 1).toFixed(1)}" stroke="#2c4666" stroke-width="1.2"/>`);
        edges.push(`<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${X(i + 1).toFixed(1)}" y2="${Y(i + 1, j).toFixed(1)}" stroke="#2c4666" stroke-width="1.2"/>`);
      }
      const ex = t.exercised[i][j] && american && i > 0;
      const w = 74, h = 34;
      const dansMonnaie = t.val[i][j] > 1e-9;
      nodes.push(`
        <g>
          <rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="7"
                fill="${ex ? '#1d3a2b' : dansMonnaie ? '#14273c' : '#111d2c'}"
                stroke="${ex ? '#4fae7d' : '#2c4666'}" stroke-width="1.3"/>
          <text x="${x.toFixed(1)}" y="${(y - 3).toFixed(1)}" text-anchor="middle" fill="#c8d6e5" font-size="12">${num(t.stock[i][j], 2)}</text>
          <text x="${x.toFixed(1)}" y="${(y + 11).toFixed(1)}" text-anchor="middle" fill="${ex ? '#7fd0a5' : '#5b9bd5'}" font-size="12" font-weight="600">${num(t.val[i][j], 2)}</text>
        </g>`);
    }
  }

  return `
    <div class="chart-wrap">
      <svg class="chart" viewBox="0 0 ${W2} ${H2}" role="img"
           style="min-width:${Math.min(W2, 150 + n * 120)}px"
           aria-label="Arbre binomial à ${n} étapes pour un ${type}">
        <text x="8" y="16" fill="#8ba3ba" font-size="11">prix du sous-jacent (haut) · valeur de l'option (bas)</text>
        ${edges.join('')}
        ${nodes.join('')}
      </svg>
    </div>
    <div class="legend">
      <span><i style="background:#c8d6e5"></i>sous-jacent</span>
      <span><i style="background:#5b9bd5"></i>option</span>
      ${american ? '<span><i style="background:#4fae7d"></i>exercice anticipé optimal</span>' : ''}
    </div>`;
}

const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

// ------------------------------------------------------------------ Graphiques
const CHARTS = {
  courbe: {
    title: 'Courbe des taux',
    sub: 'Forme normale, plate ou inversée — et courbe des taux forward implicites',
    fields: [
      { name: 'court', label: 'Taux 3 mois (%)', value: 3.0 },
      { name: 'long', label: 'Taux 30 ans (%)', value: 4.2 },
      { name: 'bosse', label: 'Bosse / creux au milieu (bp)', value: 20 },
    ],
    presets: [
      { label: 'Normale', v: { court: 2.5, long: 4.2, bosse: 15 } },
      { label: 'Plate', v: { court: 3.5, long: 3.6, bosse: 5 } },
      { label: 'Inversée', v: { court: 4.5, long: 3.2, bosse: -10 } },
      { label: 'Bossue', v: { court: 3.0, long: 3.4, bosse: 70 } },
    ],
    render(v) {
      const mats = [0.25, 0.5, 1, 2, 3, 5, 7, 10, 15, 20, 30];
      const lnMin = Math.log(0.25), lnMax = Math.log(30);
      const spot = mats.map((m) => {
        const u = (Math.log(m) - lnMin) / (lnMax - lnMin);
        const hump = (v.bosse / 100) * Math.sin(Math.PI * u);
        return [m, v.court + (v.long - v.court) * u + hump];
      });
      // forwards 1 an implicites, par non-arbitrage sur les taux composés annuellement
      const fwd = [];
      for (let i = 1; i < spot.length; i++) {
        const [t1, z1] = spot[i - 1], [t2, z2] = spot[i];
        const f = (Math.pow(1 + z2 / 100, t2) / Math.pow(1 + z1 / 100, t1)) ** (1 / (t2 - t1)) - 1;
        fwd.push([t1, f * 100]);
      }
      const pente = spot.find((p) => p[0] === 10)[1] - spot.find((p) => p[0] === 2)[1];
      const forme = pente > 0.3 ? 'normale (pentue)' : pente > 0.05 ? 'légèrement croissante' : pente > -0.05 ? 'plate' : 'inversée';
      return {
        svg: plot({
          series: [
            { name: 'Taux spot (zéro-coupon)', points: spot, markers: spot },
            { name: 'Taux forward implicites', points: fwd, dashed: true },
          ],
          xLabel: 'maturité (années)', yLabel: '%',
          xFmt: (x) => `${num(x, 0)}a`, yFmt: (y) => `${num(y, 2)}`,
        }),
        notes: `Pente 2 ans / 10 ans : ${pente >= 0 ? '+' : ''}${num(pente * 100, 0)} bp — courbe ${forme}.
Les taux forward « exagèrent » la pente : ils se situent au-dessus de la courbe spot quand elle monte, en dessous quand elle s'inverse.
Une inversion durable signale une anticipation de baisse des taux directeurs, historiquement associée à un ralentissement.`,
      };
    },
  },



  arbre: {
    title: 'Arbre binomial',
    sub: "Le prix d'une option construit pas à pas, par réplication",
    ref: 'Hull ch. 13',
    fields: [
      { name: 'S', label: 'Spot S', value: 100 },
      { name: 'K', label: 'Strike K', value: 100 },
      { name: 'T', label: 'Maturité (années)', value: 1 },
      { name: 'sigma', label: 'Volatilité σ (%)', value: 25 },
      { name: 'r', label: 'Taux sans risque (%)', value: 4 },
      { name: 'n', label: "Nombre d'étapes (1 à 6)", value: 3 },
      { name: 'type', label: 'Type : 1 = call, 0 = put', value: 1 },
      { name: 'american', label: 'Exercice : 0 = européen, 1 = américain', value: 0 },
    ],
    presets: [
      { label: 'Call européen', v: { type: 1, american: 0, n: 3 } },
      { label: 'Put européen', v: { type: 0, american: 0, n: 3 } },
      { label: 'Put américain', v: { type: 0, american: 1, n: 4 } },
      { label: '1 seule étape', v: { n: 1 } },
    ],
    render(v) {
      const type = v.type >= 0.5 ? 'call' : 'put';
      const american = v.american >= 0.5;
      const steps = Math.max(1, Math.min(Math.round(v.n), 6));
      const p = { S: v.S, K: v.K, T: Math.max(v.T, 1e-6), r: v.r / 100, q: 0,
                  sigma: Math.max(v.sigma / 100, 1e-6), type };
      const t = binomial({ ...p, steps, american });
      const ref = bs(p);
      const bsPrix = type === 'put' ? ref.put : ref.call;
      const fin = binomial({ ...p, steps: 300, american }).price;
      const euro = american ? binomial({ ...p, steps, american: false }).price : null;

      return {
        svg: tree(t, { type, american }),
        notes: `${type === 'call' ? 'Call' : 'Put'} ${american ? 'américain' : 'européen'}, ${steps} étape(s) — prix obtenu : ${num(t.price, 4)}
u = ${num(t.u, 4)} · d = ${num(t.d, 4)} · p (risque-neutre) = ${num(t.p, 4)} · Δt = ${num(t.dt, 4)} an
Delta initial : ${num(t.delta, 4)} — soit le nombre d'actions à détenir par option vendue.

Comment lire l'arbre : chaque case donne le prix du sous-jacent (en haut) et la valeur de l'option (en bas).
Au-delà de deux étapes, l'arbre défile horizontalement — faites glisser le schéma du doigt.
On calcule d'abord la colonne de droite (les payoffs à l'échéance), puis on remonte case par case vers la gauche.
${american ? `Les cases vertes sont celles où il vaut mieux exercer immédiatement que continuer.
Équivalent européen : ${num(euro, 4)} — la différence de ${num(t.price - euro, 4)} est la valeur du droit d'exercer plus tôt.` : ''}
Avec 300 étapes le prix vaut ${num(fin, 4)}, contre ${num(bsPrix, 4)} pour Black-Scholes : l'arbre converge vers la formule continue.

La probabilité p n'est PAS la probabilité que le titre monte. C'est le poids qui rend le sous-jacent
rentable au taux sans risque — et c'est ce qui permet d'ignorer complètement les anticipations de marché.`,
      };
    },
  },

  strategies: {
    title: 'Stratégies optionnelles',
    sub: "Profil de gain à l'échéance des combinaisons classiques",
    ref: 'Hull ch. 12',
    fields: [
      { name: 'strat', label: 'Stratégie (1 à 12, ou touchez un bouton)', value: 3 },
      { name: 'S', label: 'Spot actuel S', value: 100 },
      { name: 'K', label: 'Strike central K', value: 100 },
      { name: 'ecart', label: 'Écart entre strikes', value: 10 },
      { name: 'sigma', label: 'Volatilité σ (%)', value: 25 },
      { name: 'T', label: 'Maturité (années)', value: 0.5 },
      { name: 'r', label: 'Taux sans risque (%)', value: 3 },
    ],
    presets: [
      { label: 'Call acheté', v: { strat: 1 } },
      { label: 'Put acheté', v: { strat: 2 } },
      { label: 'Spread haussier', v: { strat: 3 } },
      { label: 'Spread baissier', v: { strat: 4 } },
      { label: 'Straddle', v: { strat: 5 } },
      { label: 'Strangle', v: { strat: 6 } },
      { label: 'Butterfly', v: { strat: 7 } },
      { label: 'Condor', v: { strat: 8 } },
      { label: 'Covered call', v: { strat: 9 } },
      { label: 'Protective put', v: { strat: 10 } },
      { label: 'Collar', v: { strat: 11 } },
      { label: 'Box spread', v: { strat: 12 } },
    ],
    render(v) {
      const K = v.K, e = Math.max(v.ecart, 0.01);
      const params = { S: v.S, T: Math.max(v.T, 1e-6), r: v.r / 100, q: 0, sigma: Math.max(v.sigma / 100, 1e-6) };
      const CATALOGUE = {
        1: ['Call acheté', [{ kind: 'call', K, qty: 1 }],
            "Perte plafonnée à la prime, gain non borné. La position de base d'une vue haussière."],
        2: ['Put acheté', [{ kind: 'put', K, qty: 1 }],
            "L'assurance : perte plafonnée à la prime, gain important si le sous-jacent s'effondre."],
        3: ['Spread haussier', [{ kind: 'call', K: K - e, qty: 1 }, { kind: 'call', K: K + e, qty: -1 }],
            "Vue haussière modérée. La vente du call haut finance une partie de l'achat ; en échange le gain est plafonné."],
        4: ['Spread baissier', [{ kind: 'put', K: K + e, qty: 1 }, { kind: 'put', K: K - e, qty: -1 }],
            "Vue baissière modérée, construction symétrique du spread haussier."],
        5: ['Straddle', [{ kind: 'call', K, qty: 1 }, { kind: 'put', K, qty: 1 }],
            "Pari sur l'amplitude, sans vue directionnelle. Long en gamma et en vega, theta négatif : il faut que ça bouge, et vite."],
        6: ['Strangle', [{ kind: 'call', K: K + e, qty: 1 }, { kind: 'put', K: K - e, qty: 1 }],
            "Straddle moins cher, mais qui exige un mouvement plus ample pour devenir gagnant."],
        7: ['Butterfly', [{ kind: 'call', K: K - e, qty: 1 }, { kind: 'call', K, qty: -2 }, { kind: 'call', K: K + e, qty: 1 }],
            "Pari sur l'immobilité. Gain maximal si le sous-jacent finit au strike central ; perte et gain bornés."],
        8: ['Condor', [{ kind: 'call', K: K - 2 * e, qty: 1 }, { kind: 'call', K: K - e, qty: -1 },
                       { kind: 'call', K: K + e, qty: -1 }, { kind: 'call', K: K + 2 * e, qty: 1 }],
            "Butterfly étalé : zone de gain plus large, gain maximal plus faible."],
        9: ['Covered call', [{ kind: 'stock', qty: 1 }, { kind: 'call', K: K + e, qty: -1 }],
            "Actions détenues + vente de call : on encaisse un revenu, on plafonne le potentiel de hausse."],
        10: ['Protective put', [{ kind: 'stock', qty: 1 }, { kind: 'put', K: K - e, qty: 1 }],
            "Actions détenues + achat de put : la perte est bornée, au prix d'une prime."],
        11: ['Collar', [{ kind: 'stock', qty: 1 }, { kind: 'put', K: K - e, qty: 1 }, { kind: 'call', K: K + e, qty: -1 }],
            "Protection financée par le plafonnement du gain. Souvent construit à coût nul."],
        12: ['Box spread', [{ kind: 'call', K: K - e, qty: 1 }, { kind: 'call', K: K + e, qty: -1 },
                            { kind: 'put', K: K + e, qty: 1 }, { kind: 'put', K: K - e, qty: -1 }],
            "Payoff certain quelles que soient les circonstances : c'est un placement sans risque déguisé."],
      };
      const [nom, legs, commentaire] = CATALOGUE[Math.round(v.strat)] || CATALOGUE[3];

      const cout = legs.reduce((acc, l) => acc + legCost(l, params), 0);
      const s0 = Math.max(K - 3 * e, 0.01), s1 = K + 3 * e;
      const xs = range(s0, s1, 160);
      const pnl = xs.map((S) => [S, legs.reduce((a, l) => a + legPayoff(l, S), 0) - cout]);
      const brut = xs.map((S) => [S, legs.reduce((a, l) => a + legPayoff(l, S), 0)]);

      // points morts : changements de signe du P&L
      const morts = [];
      for (let i = 1; i < pnl.length; i++) {
        const [x0, y0] = pnl[i - 1], [x1, y1] = pnl[i];
        if ((y0 <= 0 && y1 > 0) || (y0 >= 0 && y1 < 0)) morts.push(x0 + (x1 - x0) * (-y0 / (y1 - y0)));
      }
      const ys = pnl.map((p) => p[1]);
      const gainMax = Math.max(...ys), perteMax = Math.min(...ys);
      const bornéHaut = Math.abs(ys[ys.length - 1] - gainMax) > 1e-6;
      const bornéBas = Math.abs(ys[ys.length - 1] - perteMax) > 1e-6 || perteMax >= 0;

      return {
        svg: plot({
          series: [
            { name: `P&L net — ${nom}`, points: pnl, markers: morts.map((m) => [m, 0]) },
            { name: 'Payoff brut (hors prime)', points: brut, dashed: true },
          ],
          xLabel: "prix du sous-jacent à l'échéance", yLabel: 'P&L',
          xFmt: (x) => num(x, 0), yFmt: (y) => num(y, 1), zeroLine: true,
        }),
        notes: `${nom} — ${legs.length} jambe(s), primes calculées par Black-Scholes.
${legs.map((l) => `• ${l.qty > 0 ? '+' : ''}${num(l.qty, 0)} ${l.kind === 'stock' ? 'action(s)' : `${l.kind} K=${num(l.K, 2)}`}`).join('\n')}
Coût initial de mise en place : ${num(cout, 2)} ${cout >= 0 ? '(décaissé)' : '(encaissé)'}
Point(s) mort(s) : ${morts.length ? morts.map((m) => num(m, 2)).join(' et ') : 'aucun dans la plage affichée'}
Gain maximal : ${bornéHaut ? num(gainMax, 2) : 'non borné'} · Perte maximale : ${bornéBas && perteMax < 0 ? num(perteMax, 2) : perteMax >= 0 ? 'aucune perte possible' : 'non bornée'}

${commentaire}
Lecture en entretien : citer toujours les trois mêmes chiffres — point mort, gain maximal, perte maximale.`,
      };
    },
  },

  grecques: {
    title: 'Profil des grecques',
    sub: 'Comment delta, gamma, vega et theta évoluent avec le spot et la maturité',
    ref: 'Hull ch. 19',
    fields: [
      { name: 'grec', label: 'Grecque : 1=delta, 2=gamma, 3=vega, 4=theta', value: 1 },
      { name: 'K', label: 'Strike K', value: 100 },
      { name: 'sigma', label: 'Volatilité σ (%)', value: 25 },
      { name: 'r', label: 'Taux sans risque (%)', value: 3 },
      { name: 'type', label: 'Type : 1 = call, 0 = put', value: 1 },
    ],
    presets: [
      { label: 'Delta', v: { grec: 1 } },
      { label: 'Gamma', v: { grec: 2 } },
      { label: 'Vega', v: { grec: 3 } },
      { label: 'Theta', v: { grec: 4 } },
    ],
    render(v) {
      const K = v.K, call = v.type >= 0.5;
      const r = v.r / 100, sigma = Math.max(v.sigma / 100, 1e-6);
      const grec = Math.round(v.grec);
      const NOMS = { 1: 'Delta', 2: 'Gamma', 3: 'Vega', 4: 'Theta' };
      const nom = NOMS[grec] || 'Delta';
      const valeur = (S, T) => {
        const g = bs({ S, K, T, r, q: 0, sigma });
        if (grec === 2) return g.gamma;
        if (grec === 3) return g.vega;
        if (grec === 4) return call ? g.thetaCall : g.thetaPut;
        return call ? g.deltaCall : g.deltaPut;
      };
      const xs = range(K * 0.55, K * 1.45, 140);
      const maturites = [[1, '1 an'], [0.25, '3 mois'], [1 / 52, '1 semaine']];
      const series = maturites.map(([T, lbl]) => ({
        name: `${lbl} avant échéance`,
        points: xs.map((S) => [S, valeur(S, T)]),
      }));

      const atm = valeur(K, 0.25);
      const COMMENT = {
        1: `Le delta passe de 0 à ${call ? '1' : '−1'} : c'est la probabilité approximative de finir dans la monnaie, et surtout la quantité d'actions à détenir pour se couvrir.
Plus l'échéance approche, plus la marche devient raide : le delta bascule d'un extrême à l'autre autour du strike.`,
        2: `Le gamma est une cloche centrée sur le strike, et il devient explosif à l'approche de l'échéance.
C'est précisément là que la couverture coûte le plus cher : le delta change si vite qu'il faut rebalancer sans arrêt.
Le gamma est identique pour un call et un put de mêmes caractéristiques.`,
        3: `Le vega est maximal à la monnaie et croît avec la maturité : une option longue est bien plus sensible à la volatilité qu'une option courte.
Il tend vers zéro à l'approche de l'échéance — il ne reste plus assez de temps pour que la volatilité change quoi que ce soit.
Comme le gamma, il est identique pour le call et le put.`,
        4: `Le theta est négatif pour un acheteur : chaque jour qui passe érode la position.
Il est le plus destructeur à la monnaie et juste avant l'échéance — exactement là où le gamma est maximal.
Ce n'est pas un hasard : Θ + ½σ²S²Γ = rΠ. Gagner sur les mouvements se paie en valeur temps.`,
      };

      return {
        svg: plot({
          series,
          xLabel: 'prix du sous-jacent', yLabel: nom,
          xFmt: (x) => num(x, 0),
          yFmt: (y) => num(y, grec === 2 ? 4 : grec === 4 ? 3 : 2),
          zeroLine: true,
        }),
        notes: `${nom} d'un ${call ? 'call' : 'put'} de strike ${num(K, 2)} — valeur à la monnaie à 3 mois : ${num(atm, grec === 2 ? 5 : 4)}.

${COMMENT[grec] || COMMENT[1]}`,
      };
    },
  },

  payoff: {
    title: "Payoff d'options",
    sub: 'Profil à l’échéance, avec et sans la prime payée',
    fields: [
      { name: 'K', label: 'Strike K', value: 100 },
      { name: 'prime', label: 'Prime', value: 6 },
      { name: 'type', label: 'Type : 1 = call, 0 = put', value: 1 },
      { name: 'sens', label: 'Sens : 1 = achat, −1 = vente', value: 1 },
      { name: 'qte', label: 'Quantité', value: 1 },
    ],
    presets: [
      { label: 'Call acheté', v: { type: 1, sens: 1, K: 100, prime: 6 } },
      { label: 'Put acheté', v: { type: 0, sens: 1, K: 100, prime: 6 } },
      { label: 'Call vendu', v: { type: 1, sens: -1, K: 100, prime: 6 } },
      { label: 'Put vendu', v: { type: 0, sens: -1, K: 100, prime: 6 } },
    ],
    render(v) {
      const isCall = v.type >= 0.5, long = v.sens >= 0;
      const s0 = Math.max(v.K * 0.4, 0.01), s1 = v.K * 1.6;
      const xs = range(s0, s1, 120);
      const intr = (S) => (isCall ? Math.max(S - v.K, 0) : Math.max(v.K - S, 0));
      const sign = long ? 1 : -1;
      const brut = xs.map((S) => [S, sign * intr(S) * v.qte]);
      const net = xs.map((S) => [S, sign * (intr(S) - v.prime) * v.qte]);
      const be = isCall ? v.K + v.prime : v.K - v.prime;
      const maxGain = long ? (isCall ? '∞ (non borné)' : `${num((v.K - v.prime) * v.qte, 2)}`) : `${num(v.prime * v.qte, 2)} (la prime)`;
      const maxPerte = long ? `${num(v.prime * v.qte, 2)} (la prime)` : (isCall ? '∞ (non bornée)' : `${num((v.K - v.prime) * v.qte, 2)}`);
      return {
        svg: plot({
          series: [
            { name: 'Payoff net de la prime', points: net, markers: [[be, 0]] },
            { name: 'Valeur intrinsèque (hors prime)', points: brut, dashed: true },
          ],
          xLabel: 'prix du sous-jacent à l’échéance', yLabel: 'P&L',
          xFmt: (x) => num(x, 0), yFmt: (y) => num(y, 1), zeroLine: true,
        }),
        notes: `${long ? 'Achat' : 'Vente'} de ${num(v.qte, 0)} ${isCall ? 'call' : 'put'}(s) K = ${num(v.K, 2)}, prime ${num(v.prime, 2)}.
Point mort : ${num(be, 2)}.
Gain maximal : ${maxGain} · Perte maximale : ${maxPerte}.
${long
  ? 'La perte de l’acheteur est plafonnée à la prime : c’est le prix de la convexité (gamma long, theta négatif).'
  : 'Le vendeur encaisse la prime mais porte le risque de queue — un call nu vendu a une perte théoriquement illimitée.'}`,
      };
    },
  },

  prixtaux: {
    title: 'Relation prix — taux',
    sub: 'Convexité de la courbe et approximation par la duration',
    fields: [
      { name: 'nominal', label: 'Nominal', value: 100 },
      { name: 'coupon', label: 'Coupon (%)', value: 4 },
      { name: 'maturite', label: 'Maturité (années)', value: 10 },
      { name: 'y0', label: 'Rendement de référence (%)', value: 4 },
    ],
    presets: [
      { label: '10 ans 4 %', v: { maturite: 10, coupon: 4, y0: 4 } },
      { label: '30 ans 2 %', v: { maturite: 30, coupon: 2, y0: 4 } },
      { label: '2 ans 5 %', v: { maturite: 2, coupon: 5, y0: 4 } },
      { label: 'Zéro-coupon 10 ans', v: { maturite: 10, coupon: 0, y0: 4 } },
    ],
    render(v) {
      const n = Math.max(1, Math.round(v.maturite));
      const price = (y) => {
        let p = 0;
        for (let i = 1; i <= n; i++) p += (v.nominal * v.coupon / 100 + (i === n ? v.nominal : 0)) / Math.pow(1 + y, i);
        return p;
      };
      const y0 = v.y0 / 100;
      const P0 = price(y0);
      // duration modifiée par différences finies
      const dy = 1e-5;
      const md = -(price(y0 + dy) - price(y0 - dy)) / (2 * dy * P0);
      const cx = (price(y0 + dy) + price(y0 - dy) - 2 * P0) / (P0 * dy * dy);
      const ys = range(Math.max(0.001, y0 - 0.04), y0 + 0.04, 80);
      const courbe = ys.map((y) => [y * 100, price(y)]);
      const tangente = ys.map((y) => [y * 100, P0 * (1 - md * (y - y0))]);
      return {
        svg: plot({
          series: [
            { name: 'Prix exact', points: courbe, markers: [[y0 * 100, P0]] },
            { name: 'Approximation par la duration', points: tangente, dashed: true },
          ],
          xLabel: 'rendement (%)', yLabel: 'prix',
          xFmt: (x) => num(x, 1), yFmt: (y) => num(y, 0),
        }),
        notes: `Prix au rendement de référence : ${num(P0, 3)} · Duration modifiée : ${num(md, 3)} · Convexité : ${num(cx, 1)}.
La droite tangente est l'approximation par la duration seule : elle passe systématiquement SOUS la courbe réelle.
Conséquence : la duration surestime la perte en cas de hausse des taux et sous-estime le gain en cas de baisse — l'écart est la convexité.
Pour +100 bp : approximation ${num(-md * 100, 2)} % vs exact ${num((price(y0 + 0.01) / P0 - 1) * 100, 2)} %.`,
      };
    },
  },

  frontiere: {
    title: 'Frontière efficiente',
    sub: 'Deux actifs, effet de la corrélation, portefeuille de variance minimale et CML',
    fields: [
      { name: 'r1', label: 'Rendement actif 1 (%)', value: 8 },
      { name: 's1', label: 'Volatilité actif 1 (%)', value: 18 },
      { name: 'r2', label: 'Rendement actif 2 (%)', value: 3.5 },
      { name: 's2', label: 'Volatilité actif 2 (%)', value: 6 },
      { name: 'rho', label: 'Corrélation ρ', value: 0.15 },
      { name: 'rf', label: 'Taux sans risque (%)', value: 2 },
    ],
    presets: [
      { label: 'Actions / oblig.', v: { r1: 8, s1: 18, r2: 3.5, s2: 6, rho: 0.15, rf: 2 } },
      { label: 'ρ = −0,5', v: { rho: -0.5 } },
      { label: 'ρ = 0', v: { rho: 0 } },
      { label: 'ρ = +0,9', v: { rho: 0.9 } },
    ],
    render(v) {
      const r1 = v.r1 / 100, r2 = v.r2 / 100, s1 = v.s1 / 100, s2 = v.s2 / 100, rf = v.rf / 100;
      const rho = Math.max(-1, Math.min(1, v.rho));
      const cov = rho * s1 * s2;
      const port = (w) => {
        const sd = Math.sqrt(w * w * s1 * s1 + (1 - w) * (1 - w) * s2 * s2 + 2 * w * (1 - w) * cov);
        return [sd * 100, (w * r1 + (1 - w) * r2) * 100];
      };
      const ws = range(0, 1, 100);
      const curve = ws.map(port);
      // portefeuille de variance minimale
      const wGmv = (s2 * s2 - cov) / (s1 * s1 + s2 * s2 - 2 * cov);
      const gmv = port(Math.max(0, Math.min(1, wGmv)));
      // portefeuille tangent (maximise le Sharpe)
      let best = null;
      ws.forEach((w) => {
        const [sd, r] = port(w);
        const sh = sd > 0 ? (r / 100 - rf) / (sd / 100) : -Infinity;
        if (!best || sh > best.sh) best = { w, sd, r, sh };
      });
      const maxSd = Math.max(...curve.map((p) => p[0])) * 1.15;
      const cml = [[0, rf * 100], [maxSd, rf * 100 + best.sh * maxSd]];
      return {
        svg: plot({
          series: [
            { name: 'Combinaisons possibles', points: curve },
            { name: 'CML (avec actif sans risque)', points: cml, dashed: true },
            { name: 'GMV → portefeuille tangent', points: [gmv, [best.sd, best.r]], color: '#4fae7d', markers: [gmv, [best.sd, best.r]] },
          ],
          xLabel: 'volatilité (%)', yLabel: 'rendement (%)',
          xFmt: (x) => num(x, 0), yFmt: (y) => num(y, 1),
        }),
        notes: `Variance minimale : ${num(Math.max(0, Math.min(1, wGmv)) * 100, 1)} % en actif 1 → σ = ${num(gmv[0], 2)} %, E(R) = ${num(gmv[1], 2)} %.
Portefeuille tangent : ${num(best.w * 100, 1)} % en actif 1 → Sharpe = ${num(best.sh, 3)} (pente de la CML).
Avec ρ = ${num(rho, 2)}, la volatilité du portefeuille est inférieure à la moyenne pondérée des volatilités : c'est l'effet de diversification.
Plus ρ baisse, plus la courbe se creuse vers la gauche ; à ρ = +1 elle devient un segment de droite et le bénéfice disparaît.`,
      };
    },
  },
};

// -------------------------------------------------------------------- Vue
export default async function graphiques(route, { el }) {
  const id = route.parts[0];
  if (!id || !CHARTS[id]) {
    el.innerHTML = `
      ${pageHead('Graphiques', 'Visualisations paramétrables des relations clés')}
      <div class="list">
        ${Object.entries(CHARTS).map(([k, c]) => `<a class="list-item" href="#/graphiques/${k}">
          <div class="t">${esc(c.title)}</div><div class="d">${esc(c.sub)}</div></a>`).join('')}
      </div>`;
    return;
  }

  const chart = CHARTS[id];
  const state = {};
  chart.fields.forEach((f) => { state[f.name] = Number(f.value); });

  el.innerHTML = `
    <div class="row between" style="margin-bottom:10px">
      <a class="btn btn-sm btn-ghost" href="#/graphiques">← Graphiques</a>
    </div>
    ${pageHead(chart.title, chart.sub)}
    ${chart.ref ? `<div class="pill" style="margin-bottom:10px">Référence : ${esc(chart.ref)}</div>` : ''}
    <div id="g-plot"></div>
    <div class="card" style="margin-top:12px">
      ${chart.presets ? `<div class="chips" style="margin-bottom:10px">
        ${chart.presets.map((p, i) => `<button class="chip" data-preset="${i}">${esc(p.label)}</button>`).join('')}
      </div>` : ''}
      <form id="g-form" class="fields">
        ${chart.fields.map((f) => `<div class="field">
          <label for="g-${f.name}">${esc(f.label)}</label>
          <input id="g-${f.name}" name="${f.name}" type="text" inputmode="decimal" value="${esc(f.value)}">
        </div>`).join('')}
      </form>
    </div>
    <div class="card" style="margin-top:12px"><small id="g-notes" style="white-space:pre-wrap"></small></div>`;

  const form = el.querySelector('#g-form');
  const host = el.querySelector('#g-plot');
  const notes = el.querySelector('#g-notes');

  function draw() {
    chart.fields.forEach((f) => { state[f.name] = fieldNum(form, f.name, Number(f.value)); });
    let out;
    try {
      out = chart.render(state);
    } catch (e) {
      host.innerHTML = `<div class="empty">Paramètres invalides.</div>`;
      notes.textContent = '';
      return;
    }
    host.innerHTML = out.svg;
    notes.textContent = out.notes;
  }

  form.addEventListener('input', draw);
  el.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const p = chart.presets[+b.dataset.preset];
    Object.entries(p.v).forEach(([k, val]) => {
      const input = form.querySelector(`[name="${k}"]`);
      if (input) input.value = val;
    });
    el.querySelectorAll('[data-preset]').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    draw();
  }));

  draw();
}
