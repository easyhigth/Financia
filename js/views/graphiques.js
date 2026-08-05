// Vue Graphiques : tracés SVG générés à la volée, sans librairie externe (contrainte offline).
import { esc, pageHead, num, fieldNum } from '../ui.js';

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
