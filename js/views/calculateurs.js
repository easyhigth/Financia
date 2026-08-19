// Vue Calculateurs : chaque outil affiche la formule employée et le détail des étapes.
import { esc, pageHead, num, fieldNum, toast } from '../ui.js';
import { phi, N, normInv, bs, binomial } from '../lib/bs.js';

// ---------------------------------------------------------------- Calculateurs
const CALCS = {
  obligation: {
    title: 'Pricing obligataire',
    sub: 'Prix, duration de Macaulay, duration modifiée, convexité et DV01',
    formula: `P = Σ C/(1+y/f)^(f·t) + N/(1+y/f)^(f·T)
D_Mac = Σ t·PV(CFt)/P     MD = D_Mac/(1+y/f)
C = Σ t(t+1/f)·PV(CFt)/[P·(1+y/f)²]
ΔP/P ≈ −MD·Δy + ½·C·Δy²`,
    fields: [
      { name: 'nominal', label: 'Nominal (€)', value: 100 },
      { name: 'coupon', label: 'Coupon annuel (%)', value: 4 },
      { name: 'ytm', label: 'Rendement exigé y (%)', value: 5 },
      { name: 'maturite', label: 'Maturité (années)', value: 5 },
      { name: 'freq', label: 'Coupons par an', value: 2 },
      { name: 'choc', label: 'Choc de taux simulé (bp)', value: 100 },
    ],
    compute(v) {
      const f = Math.max(1, Math.round(v.freq));
      const n = Math.round(v.maturite * f);
      const y = v.ytm / 100, c = v.coupon / 100;
      const cf = (v.nominal * c) / f;
      const yf = y / f;
      let P = 0, wSum = 0, cxSum = 0;
      const rows = [];
      for (let i = 1; i <= n; i++) {
        const t = i / f;
        const flow = cf + (i === n ? v.nominal : 0);
        const df = Math.pow(1 + yf, -i);
        const pv = flow * df;
        P += pv; wSum += t * pv;
        cxSum += pv * t * (t + 1 / f);
        if (i <= 3 || i === n) rows.push(`  t=${num(t, 2)} an : ${num(flow, 2)} × ${num(df, 6)} = ${num(pv, 4)}`);
        else if (i === 4) rows.push('  …');
      }
      const dmac = wSum / P;
      const md = dmac / (1 + yf);
      const cx = cxSum / (P * Math.pow(1 + yf, 2));
      const dv01 = md * P * 0.0001;
      const dy = v.choc / 10000;
      const approxDur = -md * dy;
      const approxTot = approxDur + 0.5 * cx * dy * dy;
      // repricing exact sous le choc, pour comparer à l'approximation
      let P2 = 0;
      const y2 = (y + dy) / f;
      for (let i = 1; i <= n; i++) P2 += (cf + (i === n ? v.nominal : 0)) * Math.pow(1 + y2, -i);
      const exact = P2 / P - 1;
      return {
        main: `${num(P, 4)} €`,
        mainLabel: `Prix (soit ${num((P / v.nominal) * 100, 3)} % du nominal)`,
        kv: [
          ['Coupon périodique', `${num(cf, 4)} €`],
          ['Nombre de flux', String(n)],
          ['Duration de Macaulay', `${num(dmac, 4)} ans`],
          ['Duration modifiée', num(md, 4)],
          ['Convexité', num(cx, 3)],
          ['DV01 (par 1 bp)', `${num(dv01, 4)} €`],
          [`Effet duration seule (${v.choc} bp)`, `${num(approxDur * 100, 3)} %`],
          ['Effet duration + convexité', `${num(approxTot * 100, 3)} %`],
          ['Repricing exact', `${num(exact * 100, 3)} %`],
        ],
        steps: `1) Actualisation des flux au taux périodique y/f = ${num(yf * 100, 4)} %
${rows.join('\n')}
   P = Σ PV = ${num(P, 4)} €

2) Duration de Macaulay = Σ t·PV / P = ${num(wSum, 2)} / ${num(P, 4)} = ${num(dmac, 4)} ans

3) Duration modifiée = D_Mac / (1 + y/f) = ${num(dmac, 4)} / ${num(1 + yf, 5)} = ${num(md, 4)}

4) DV01 = MD × P × 0,0001 = ${num(md, 4)} × ${num(P, 4)} × 0,0001 = ${num(dv01, 4)} €

5) Choc de ${v.choc} bp (Δy = ${num(dy, 4)})
   duration seule      : −${num(md, 4)} × ${num(dy, 4)} = ${num(approxDur * 100, 3)} %
   + convexité         : + ½ × ${num(cx, 3)} × ${num(dy, 4)}² = ${num(0.5 * cx * dy * dy * 100, 3)} %
   → approximation     : ${num(approxTot * 100, 3)} %
   → repricing exact   : ${num(exact * 100, 3)} %
   L'écart illustre l'apport de la convexité : la duration seule surestime la perte.`,
      };
    },
  },

  blackscholes: {
    title: 'Black-Scholes',
    sub: 'Prix des options call et put européennes, avec les grecques',
    formula: `d₁ = [ln(S/K) + (r − q + σ²/2)T] / (σ√T)
d₂ = d₁ − σ√T
C = S·e^(−qT)·N(d₁) − K·e^(−rT)·N(d₂)
P = K·e^(−rT)·N(−d₂) − S·e^(−qT)·N(−d₁)`,
    fields: [
      { name: 'S', label: 'Spot S', value: 100 },
      { name: 'K', label: 'Strike K', value: 100 },
      { name: 'T', label: 'Maturité T (années)', value: 1 },
      { name: 'r', label: 'Taux sans risque r (%)', value: 3 },
      { name: 'q', label: 'Dividende / rendement q (%)', value: 0 },
      { name: 'sigma', label: 'Volatilité σ (%)', value: 20 },
    ],
    compute(v) {
      const { S, K } = v;
      const T = Math.max(v.T, 1e-8);
      const r = v.r / 100, q = v.q / 100, s = Math.max(v.sigma / 100, 1e-8);
      const g = bs({ S, K, T, r, q, sigma: s });
      const { d1, d2, call, put, dfR, dfQ } = g;
      const sq = s * Math.sqrt(T);
      const parity = call - put - (S * dfQ - K * dfR);
      return {
        main: `Call ${num(call, 4)}  ·  Put ${num(put, 4)}`,
        mainLabel: 'Primes théoriques',
        kv: [
          ['d₁', num(d1, 5)], ['d₂', num(d2, 5)],
          ['N(d₁)', num(N(d1), 5)], ['N(d₂) — prob. risque-neutre d’exercice', num(N(d2), 5)],
          ['Delta call / put', `${num(g.deltaCall, 4)} / ${num(g.deltaPut, 4)}`],
          ['Gamma', num(g.gamma, 5)],
          ['Vega (+1 pt de vol)', num(g.vega, 4)],
          ['Theta call / put (par jour)', `${num(g.thetaCall, 4)} / ${num(g.thetaPut, 4)}`],
          ['Rho call / put (+1 % de taux)', `${num(g.rhoCall, 4)} / ${num(g.rhoPut, 4)}`],
          ['Valeur intrinsèque call / put', `${num(Math.max(S - K, 0), 4)} / ${num(Math.max(K - S, 0), 4)}`],
          ['Contrôle parité call-put', num(parity, 8)],
        ],
        steps: `1) σ√T = ${num(s, 4)} × √${num(T, 4)} = ${num(sq, 5)}

2) d₁ = [ln(${num(S, 2)}/${num(K, 2)}) + (${num(r, 4)} − ${num(q, 4)} + ${num(s * s / 2, 5)})×${num(T, 3)}] / ${num(sq, 5)}
      = [${num(Math.log(S / K), 5)} + ${num((r - q + 0.5 * s * s) * T, 5)}] / ${num(sq, 5)} = ${num(d1, 5)}
   d₂ = d₁ − σ√T = ${num(d1, 5)} − ${num(sq, 5)} = ${num(d2, 5)}

3) Facteurs d'actualisation : e^(−rT) = ${num(dfR, 6)} ; e^(−qT) = ${num(dfQ, 6)}

4) Call = ${num(S, 2)}×${num(dfQ, 5)}×${num(N(d1), 5)} − ${num(K, 2)}×${num(dfR, 5)}×${num(N(d2), 5)}
        = ${num(S * dfQ * N(d1), 4)} − ${num(K * dfR * N(d2), 4)} = ${num(call, 4)}

5) Put par la parité : P = C − S·e^(−qT) + K·e^(−rT)
        = ${num(call, 4)} − ${num(S * dfQ, 4)} + ${num(K * dfR, 4)} = ${num(put, 4)}

Lecture : N(d₂) = ${num(N(d2) * 100, 2)} % est la probabilité risque-neutre d'exercice ;
le delta du call, ${num(g.deltaCall, 4)}, est le nombre d'actions à détenir pour couvrir une option vendue.`,
      };
    },
  },


  binomial: {
    title: 'Arbre binomial',
    sub: 'Prix et delta par réplication, options européennes et américaines',
    ref: 'Hull ch. 13',
    formula: `u = e^(σ√Δt)   d = 1/u   Δt = T/n
p = (e^((r−q)Δt) − d) / (u − d)          ← probabilité risque-neutre
f = e^(−rΔt)·[p·f_haut + (1−p)·f_bas]    ← induction rétrograde
Δ = (f_haut − f_bas) / (S·u − S·d)       ← portefeuille de réplication`,
    fields: [
      { name: 'S', label: 'Spot S', value: 100 },
      { name: 'K', label: 'Strike K', value: 100 },
      { name: 'T', label: 'Maturité T (années)', value: 1 },
      { name: 'r', label: 'Taux sans risque r (%)', value: 3 },
      { name: 'q', label: 'Dividende q (%)', value: 0 },
      { name: 'sigma', label: 'Volatilité σ (%)', value: 20 },
      { name: 'steps', label: "Nombre d'étapes n", value: 4 },
      { name: 'type', label: 'Type : 1 = call, 0 = put', value: 1 },
      { name: 'american', label: 'Exercice : 0 = européen, 1 = américain', value: 0 },
    ],
    compute(v) {
      const type = v.type >= 0.5 ? 'call' : 'put';
      const american = v.american >= 0.5;
      const p = { S: v.S, K: v.K, T: Math.max(v.T, 1e-8), r: v.r / 100, q: v.q / 100,
                  sigma: Math.max(v.sigma / 100, 1e-8), type };
      const t = binomial({ ...p, steps: v.steps, american });
      const euro = american ? binomial({ ...p, steps: v.steps, american: false }).price : t.price;
      const ref = bs(p);
      const bsPrice = type === 'put' ? ref.put : ref.call;
      const fin = binomial({ ...p, steps: 300, american });

      // détail des deux premiers nœuds, pour montrer le mécanisme
      const l1 = t.n >= 1
        ? `   nœud haut : S = ${num(t.stock[1][t.n >= 1 ? 1 : 0], 4)} → option ${num(t.val[1][1], 4)}
   nœud bas  : S = ${num(t.stock[1][0], 4)} → option ${num(t.val[1][0], 4)}`
        : '';

      return {
        main: `${num(t.price, 4)}`,
        mainLabel: `${type === 'call' ? 'Call' : 'Put'} ${american ? 'américain' : 'européen'} · ${t.n} étape(s)`,
        kv: [
          ['Δt (durée d’une étape)', `${num(t.dt, 5)} an`],
          ['u (facteur de hausse)', num(t.u, 5)],
          ['d (facteur de baisse)', num(t.d, 5)],
          ['p (probabilité risque-neutre)', num(t.p, 5)],
          ['Delta initial', num(t.delta, 4)],
          ['Prix avec 300 étapes', num(fin.price, 4)],
          ['Référence Black-Scholes', num(bsPrice, 4)],
          ['Écart au modèle continu', `${num(t.price - bsPrice, 4)}`],
          ...(american ? [
            ['Équivalent européen', num(euro, 4)],
            ["Prime d'exercice anticipé", num(t.price - euro, 4)],
          ] : []),
        ],
        steps: `1) Découpage du temps : Δt = T/n = ${num(p.T, 4)}/${t.n} = ${num(t.dt, 5)} an

2) Amplitude des mouvements (Cox-Ross-Rubinstein)
   u = e^(σ√Δt) = e^(${num(p.sigma, 4)}×${num(Math.sqrt(t.dt), 5)}) = ${num(t.u, 5)}
   d = 1/u = ${num(t.d, 5)}
   L'arbre est recombinant : une hausse puis une baisse ramène au point de départ.

3) Probabilité risque-neutre
   p = (e^((r−q)Δt) − d)/(u − d) = (${num(Math.exp((p.r - p.q) * t.dt), 6)} − ${num(t.d, 5)})/(${num(t.u, 5)} − ${num(t.d, 5)}) = ${num(t.p, 5)}
   Ce n'est PAS la probabilité de hausse : c'est le poids qui rend l'actif rentable au taux sans risque.

4) Valeurs à l'échéance : payoff = ${type === 'call' ? 'max(S − K, 0)' : 'max(K − S, 0)'} sur les ${t.n + 1} nœuds terminaux

5) Induction rétrograde jusqu'à la racine${american ? `,
   en comparant à chaque nœud la valeur de continuation à l'exercice immédiat` : ''}
${l1}
   → prix aujourd'hui = ${num(t.price, 4)}

6) Couverture : Δ = (f_haut − f_bas)/(S·u − S·d) = ${num(t.delta, 4)}
   Détenir ${num(t.delta, 4)} action(s) par option vendue neutralise le risque sur la première étape.

Convergence : avec 300 étapes le prix vaut ${num(fin.price, 4)}, contre ${num(bsPrice, 4)} pour Black-Scholes.
L'arbre est la version discrète du même raisonnement de réplication.${american ? `
L'écart de ${num(t.price - euro, 4)} avec l'équivalent européen est la valeur du droit d'exercer plus tôt.` : ''}`,
      };
    },
  },

  grecques: {
    title: "Grecques d'un portefeuille",
    sub: 'Agrégation des sensibilités de plusieurs positions optionnelles',
    ref: 'Hull ch. 19',
    formula: `Δ_portefeuille = Σ qᵢ·Δᵢ      (idem Γ, ν, Θ)
Actions à acheter pour la neutralité : −Δ_portefeuille
Portefeuille delta-neutre : Θ + ½·σ²·S²·Γ = r·Π`,
    fields: [
      { name: 'S', label: 'Spot S', value: 100 },
      { name: 'sigma', label: 'Volatilité σ (%)', value: 20 },
      { name: 'r', label: 'Taux sans risque r (%)', value: 3 },
      { name: 'q1', label: 'Position 1 : quantité (− = vendu)', value: -100 },
      { name: 'K1', label: 'Position 1 : strike', value: 100 },
      { name: 'T1', label: 'Position 1 : maturité (années)', value: 0.25 },
      { name: 'c1', label: 'Position 1 : 1 = call, 0 = put', value: 1 },
      { name: 'q2', label: 'Position 2 : quantité', value: 60 },
      { name: 'K2', label: 'Position 2 : strike', value: 110 },
      { name: 'T2', label: 'Position 2 : maturité (années)', value: 0.5 },
      { name: 'c2', label: 'Position 2 : 1 = call, 0 = put', value: 1 },
      { name: 'actions', label: 'Actions déjà détenues', value: 0 },
    ],
    compute(v) {
      const S = v.S, r = v.r / 100, sigma = Math.max(v.sigma / 100, 1e-8);
      const legs = [
        { q: v.q1, K: v.K1, T: Math.max(v.T1, 1e-6), call: v.c1 >= 0.5 },
        { q: v.q2, K: v.K2, T: Math.max(v.T2, 1e-6), call: v.c2 >= 0.5 },
      ].filter((l) => l.q !== 0);

      let delta = v.actions, gamma = 0, vega = 0, theta = 0, valeur = v.actions * S;
      const lignes = [];
      legs.forEach((l, i) => {
        const g = bs({ S, K: l.K, T: l.T, r, q: 0, sigma });
        const d = l.call ? g.deltaCall : g.deltaPut;
        const th = l.call ? g.thetaCall : g.thetaPut;
        const prix = l.call ? g.call : g.put;
        delta += l.q * d; gamma += l.q * g.gamma;
        vega += l.q * g.vega; theta += l.q * th;
        valeur += l.q * prix;
        lignes.push(`   position ${i + 1} : ${num(l.q, 0)} ${l.call ? 'call' : 'put'} K=${num(l.K, 2)} T=${num(l.T, 3)}
      prix ${num(prix, 4)} · Δ ${num(d, 4)} · Γ ${num(g.gamma, 5)} · ν ${num(g.vega, 4)} · Θ ${num(th, 4)}
      contribution : Δ ${num(l.q * d, 2)} · Γ ${num(l.q * g.gamma, 4)} · ν ${num(l.q * g.vega, 2)} · Θ ${num(l.q * th, 2)}`);
      });

      // Contrôle : la relation de BSM doit être vérifiée pour un portefeuille delta-neutre
      const pnlGamma1pct = 0.5 * gamma * Math.pow(S * 0.01, 2);
      return {
        main: `Δ ${num(delta, 2)}`,
        mainLabel: `Valeur du portefeuille : ${num(valeur, 2)}`,
        kv: [
          ['Delta total', num(delta, 3)],
          ['Gamma total', num(gamma, 5)],
          ['Vega total (+1 pt de vol)', num(vega, 3)],
          ['Theta total (par jour)', num(theta, 3)],
          ['Actions à négocier pour Δ = 0', num(-delta, 2)],
          ['Coût de cette couverture', num(-delta * S, 2)],
          ['Gain gamma si S bouge de 1 %', num(pnlGamma1pct, 3)],
          ['Perte theta sur 1 jour', num(theta, 3)],
          ['Solde gamma − theta (mouvement 1 %)', num(pnlGamma1pct + theta, 3)],
        ],
        steps: `1) Grecques position par position (valeurs unitaires puis contribution)
${lignes.join('\n')}

2) Agrégation — les grecques s'additionnent, pondérées par les quantités
   Δ = ${num(delta, 3)}   Γ = ${num(gamma, 5)}   ν = ${num(vega, 3)}   Θ = ${num(theta, 3)}

3) Neutralisation du delta
   Négocier ${num(-delta, 2)} action(s), soit ${num(-delta * S, 2)} en montant.
   Rappel d'ordre : le sous-jacent a un gamma et un vega NULS. Il ne corrige que le delta.
   Pour annuler gamma et vega, il faut d'autres options — et ajuster le delta seulement après.

4) Lecture du couple gamma / theta
   Un mouvement de 1 % du sous-jacent rapporte ½·Γ·(ΔS)² = ${num(pnlGamma1pct, 3)}
   Le passage d'une journée coûte ${num(theta, 3)}
   Solde : ${num(pnlGamma1pct + theta, 3)} → ${pnlGamma1pct + theta >= 0
     ? "le marché bouge assez pour payer l'érosion de la valeur temps."
     : "le marché doit bouger davantage pour compenser l'érosion de la valeur temps."}
   C'est l'arbitrage central d'un book d'options : Θ + ½σ²S²Γ = rΠ.`,
      };
    },
  },

  var: {
    title: 'VaR paramétrique',
    sub: 'Value at Risk et Expected Shortfall sous hypothèse gaussienne',
    formula: `VaR = z_α × σ_quotidienne × V × √h
ES  = φ(z_α)/(1−α) × σ × V × √h
z(95 %) = 1,645   z(99 %) = 2,326`,
    fields: [
      { name: 'V', label: 'Valeur du portefeuille (€)', value: 10000000 },
      { name: 'vol', label: 'Volatilité quotidienne (%)', value: 1.2 },
      { name: 'conf', label: 'Niveau de confiance (%)', value: 99 },
      { name: 'h', label: 'Horizon (jours)', value: 1 },
      { name: 'mu', label: 'Dérive quotidienne attendue (%)', value: 0 },
    ],
    compute(v) {
      const alpha = Math.min(Math.max(v.conf / 100, 0.5), 0.9999);
      const z = normInv(alpha);
      const sig = v.vol / 100, mu = v.mu / 100;
      const h = Math.max(v.h, 0);
      const sqh = Math.sqrt(h);
      const varAbs = (z * sig * sqh - mu * h) * v.V;
      const esZ = phi(z) / (1 - alpha);
      const esAbs = (esZ * sig * sqh - mu * h) * v.V;
      const days = Math.round(250 * (1 - alpha));
      return {
        main: `${num(varAbs, 0)} €`,
        mainLabel: `VaR ${num(v.conf, 1)} % à ${num(h, 0)} jour(s)`,
        kv: [
          ['Quantile z', num(z, 4)],
          ['Volatilité sur l’horizon', `${num(sig * sqh * 100, 4)} %`],
          ['VaR en % du portefeuille', `${num((varAbs / v.V) * 100, 3)} %`],
          ['Expected Shortfall', `${num(esAbs, 0)} €`],
          ['ES en % du portefeuille', `${num((esAbs / v.V) * 100, 3)} %`],
          ['Multiplicateur ES/VaR', num(esAbs / varAbs, 3)],
          ['Exceptions attendues sur 250 j', String(days)],
        ],
        steps: `1) Quantile normal à ${num(v.conf, 2)} % : z = ${num(z, 4)}

2) Mise à l'horizon par la racine du temps : σ_h = ${num(sig * 100, 4)} % × √${num(h, 0)} = ${num(sig * sqh * 100, 4)} %

3) VaR = z × σ_h × V ${v.mu ? '− μ·h × V ' : ''}
       = ${num(z, 4)} × ${num(sig * sqh, 6)} × ${num(v.V, 0)}${v.mu ? ` − ${num(mu * h, 6)} × ${num(v.V, 0)}` : ''}
       = ${num(varAbs, 0)} €

4) Expected Shortfall = φ(z)/(1−α) × σ_h × V
       = ${num(phi(z), 5)}/${num(1 - alpha, 4)} × ${num(sig * sqh, 6)} × ${num(v.V, 0)} = ${num(esAbs, 0)} €

Limites à garder en tête :
• hypothèse de normalité — les queues réelles sont plus épaisses, la VaR est sous-estimée ;
• √h suppose des rendements i.i.d. sans autocorrélation ni illiquidité ;
• la VaR ne dit rien de l'ampleur des pertes au-delà du seuil : d'où l'ES (FRTB retient ES 97,5 %) ;
• sur un portefeuille optionnel, cette approche linéaire n'est pas valide (utiliser delta-gamma ou du repricing complet).`,
      };
    },
  },

  levier: {
    title: 'P&L avec effet de levier',
    sub: 'Position à levier : exposition, P&L, rendement sur capital et prix d’appel de marge',
    formula: `Exposition = Capital × Levier
P&L brut = Exposition × (P_sortie/P_entrée − 1) × sens
Coût de financement = (Exposition − Capital) × r × jours/360
Rendement = P&L net / Capital`,
    fields: [
      { name: 'capital', label: 'Capital engagé (€)', value: 100000 },
      { name: 'levier', label: 'Levier (×)', value: 5 },
      { name: 'entree', label: "Prix d'entrée", value: 100 },
      { name: 'sortie', label: 'Prix de sortie', value: 104 },
      { name: 'sens', label: 'Sens : 1 = long, −1 = short', value: 1 },
      { name: 'taux', label: 'Taux de financement (% annuel)', value: 4 },
      { name: 'jours', label: 'Durée de détention (jours)', value: 30 },
      { name: 'frais', label: 'Frais aller-retour (% de l’exposition)', value: 0.05 },
    ],
    compute(v) {
      const sens = v.sens >= 0 ? 1 : -1;
      const expo = v.capital * v.levier;
      const qte = v.entree > 0 ? expo / v.entree : 0;
      const perf = v.entree > 0 ? v.sortie / v.entree - 1 : 0;
      const brut = expo * perf * sens;
      const emprunt = Math.max(expo - v.capital, 0);
      const cout = emprunt * (v.taux / 100) * (v.jours / 360);
      const frais = expo * (v.frais / 100);
      const net = brut - cout - frais;
      const rdt = net / v.capital;
      // Perte totale du capital : variation adverse de 1/levier
      const seuil = 1 / Math.max(v.levier, 1e-9);
      const prixRuine = sens === 1 ? v.entree * (1 - seuil) : v.entree * (1 + seuil);
      return {
        main: `${net >= 0 ? '+' : ''}${num(net, 2)} €`,
        mainLabel: `P&L net · rendement sur capital ${num(rdt * 100, 2)} %`,
        kv: [
          ['Exposition notionnelle', `${num(expo, 2)} €`],
          ['Quantité', num(qte, 4)],
          ['Performance du sous-jacent', `${num(perf * 100, 3)} %`],
          ['P&L brut', `${num(brut, 2)} €`],
          ['Coût de financement', `−${num(cout, 2)} €`],
          ['Frais', `−${num(frais, 2)} €`],
          ['P&L net', `${num(net, 2)} €`],
          ['Rendement sur capital', `${num(rdt * 100, 2)} %`],
          ['Effet de levier réalisé', `${num(perf !== 0 ? rdt / (perf * sens) : 0, 2)}×`],
          ['Prix de perte totale du capital', `${num(prixRuine, 4)}`],
        ],
        steps: `1) Exposition = ${num(v.capital, 2)} × ${num(v.levier, 2)} = ${num(expo, 2)} €
   dont ${num(emprunt, 2)} € financés

2) Performance = ${num(v.sortie, 4)}/${num(v.entree, 4)} − 1 = ${num(perf * 100, 3)} %  (position ${sens === 1 ? 'longue' : 'courte'})

3) P&L brut = ${num(expo, 2)} × ${num(perf, 5)} × ${sens} = ${num(brut, 2)} €

4) Financement = ${num(emprunt, 2)} × ${num(v.taux, 2)} % × ${num(v.jours, 0)}/360 = ${num(cout, 2)} €
   Frais = ${num(expo, 2)} × ${num(v.frais, 3)} % = ${num(frais, 2)} €

5) P&L net = ${num(brut, 2)} − ${num(cout, 2)} − ${num(frais, 2)} = ${num(net, 2)} €
   Rendement sur capital = ${num(net, 2)} / ${num(v.capital, 2)} = ${num(rdt * 100, 2)} %

Lecture risque : avec un levier de ${num(v.levier, 2)}×, une variation adverse de ${num(seuil * 100, 2)} %
(prix ${num(prixRuine, 4)}) efface la totalité du capital, hors appel de marge intermédiaire.
Le levier amplifie symétriquement gains et pertes, mais le coût de financement, lui, est certain.`,
      };
    },
  },

  change: {
    title: 'Change : cross et taux à terme',
    sub: 'Taux croisé, conversion et report/déport par la parité couverte',
    formula: `A/B = (A/USD) / (B/USD)
F = S × (1 + r_cot × n/360) / (1 + r_base × n/360)
Points de swap = F − S`,
    fields: [
      { name: 'ausd', label: 'Cours A/USD (ex. EUR/USD)', value: 1.085 },
      { name: 'busd', label: 'Cours B/USD (ex. GBP/USD)', value: 1.27 },
      { name: 'montant', label: 'Montant à convertir (en A)', value: 1000000 },
      { name: 'rbase', label: 'Taux devise de base A (%)', value: 3.4 },
      { name: 'rcot', label: 'Taux devise de cotation USD (%)', value: 5.1 },
      { name: 'jours', label: 'Échéance du terme (jours)', value: 90 },
    ],
    compute(v) {
      const cross = v.busd !== 0 ? v.ausd / v.busd : NaN;
      const enUsd = v.montant * v.ausd;
      const enB = v.montant * cross;
      const n = v.jours / 360;
      const F = v.ausd * (1 + (v.rcot / 100) * n) / (1 + (v.rbase / 100) * n);
      const points = F - v.ausd;
      const annualise = (points / v.ausd) * (360 / Math.max(v.jours, 1e-9));
      return {
        main: num(cross, 6),
        mainLabel: 'Taux croisé A/B',
        kv: [
          ['A/USD', num(v.ausd, 6)],
          ['B/USD', num(v.busd, 6)],
          ['Cross A/B', num(cross, 6)],
          ['Cross inverse B/A', num(1 / cross, 6)],
          [`Conversion de ${num(v.montant, 0)} A`, `${num(enUsd, 2)} USD`],
          ['Équivalent en B', num(enB, 2)],
          [`Cours à terme A/USD ${num(v.jours, 0)} j`, num(F, 6)],
          ['Points de swap', `${points >= 0 ? '+' : ''}${num(points * 10000, 1)} pips`],
          ['Report/déport annualisé', `${num(annualise * 100, 3)} %`],
        ],
        steps: `1) Taux croisé : A/B = (A/USD)/(B/USD) = ${num(v.ausd, 6)} / ${num(v.busd, 6)} = ${num(cross, 6)}
   Contrôle d'arbitrage triangulaire : A → USD → B → A doit boucler à l'identique.

2) Conversion : ${num(v.montant, 0)} A × ${num(v.ausd, 6)} = ${num(enUsd, 2)} USD
                soit ${num(enB, 2)} unités de B

3) Parité couverte sur ${num(v.jours, 0)} jours (base 360) :
   F = ${num(v.ausd, 6)} × (1 + ${num(v.rcot, 3)} % × ${num(n, 5)}) / (1 + ${num(v.rbase, 3)} % × ${num(n, 5)})
     = ${num(v.ausd, 6)} × ${num(1 + (v.rcot / 100) * n, 7)} / ${num(1 + (v.rbase / 100) * n, 7)}
     = ${num(F, 6)}

4) Points de swap = ${num(F, 6)} − ${num(v.ausd, 6)} = ${points >= 0 ? '+' : ''}${num(points * 10000, 1)} pips
   ${points >= 0
     ? "La devise de base cote en report : son taux est inférieur à celui de la devise de cotation."
     : "La devise de base cote en déport : son taux est supérieur — le carry est neutralisé par le terme."}

Rappel : les points de swap reflètent le différentiel de taux, pas une prévision de change.`,
      };
    },
  },
};

// -------------------------------------------------------------------- Vue
export default async function calculateurs(route, { el }) {
  const id = route.parts[0];
  if (!id || !CALCS[id]) {
    el.innerHTML = `
      ${pageHead('Calculateurs', 'Chaque outil détaille la formule et les étapes du calcul')}
      <div class="list">
        ${Object.entries(CALCS).map(([k, c]) => `<a class="list-item" href="#/calculateurs/${k}">
          <div class="t">${esc(c.title)}</div><div class="d">${esc(c.sub)}</div></a>`).join('')}
      </div>`;
    return;
  }

  const calc = CALCS[id];
  const saved = JSON.parse(localStorage.getItem(`financia.calc.${id}`) || 'null');

  el.innerHTML = `
    <div class="row between" style="margin-bottom:10px">
      <a class="btn btn-sm btn-ghost" href="#/calculateurs">← Calculateurs</a>
    </div>
    ${pageHead(calc.title, calc.sub)}
    ${calc.ref ? `<div class="pill" style="margin-bottom:10px">Référence : ${esc(calc.ref)}</div>` : ''}
    <div class="formula-box">${esc(calc.formula)}</div>
    <div class="card" style="margin-top:12px">
      <form id="calc-form">
        <div class="fields">
          ${calc.fields.map((f) => `<div class="field">
            <label for="c-${f.name}">${esc(f.label)}</label>
            <input id="c-${f.name}" name="${f.name}" type="text" inputmode="decimal"
                   value="${esc(saved && saved[f.name] !== undefined ? saved[f.name] : f.value)}">
          </div>`).join('')}
        </div>
        <div class="tool-row">
          <button type="button" id="calc-reset">Réinitialiser</button>
          <button type="submit" class="btn-primary">Calculer</button>
        </div>
      </form>
      <div id="calc-out"></div>
    </div>`;

  const form = el.querySelector('#calc-form');
  const out = el.querySelector('#calc-out');

  function run() {
    const v = {};
    calc.fields.forEach((f) => { v[f.name] = fieldNum(form, f.name, Number(f.value)); });
    localStorage.setItem(`financia.calc.${id}`, JSON.stringify(v));
    let res;
    try {
      res = calc.compute(v);
    } catch (e) {
      out.innerHTML = `<div class="result-box"><span class="muted">Paramètres invalides : ${esc(e.message)}</span></div>`;
      return;
    }
    out.innerHTML = `
      <div class="result-box">
        <div class="result-main">${esc(res.main)}</div>
        <small>${esc(res.mainLabel)}</small>
        <div style="margin-top:12px">
          ${res.kv.map(([k, val]) => `<div class="kv"><span class="k">${esc(k)}</span><span class="v">${esc(val)}</span></div>`).join('')}
        </div>
        <div class="sep" style="margin:12px 0"></div>
        <strong style="font-size:.85rem">Étapes du calcul</strong>
        <div class="steps">${esc(res.steps)}</div>
      </div>`;
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
  form.addEventListener('input', run);
  el.querySelector('#calc-reset').addEventListener('click', () => {
    calc.fields.forEach((f) => { form.querySelector(`[name="${f.name}"]`).value = f.value; });
    localStorage.removeItem(`financia.calc.${id}`);
    toast('Valeurs par défaut restaurées');
    run();
  });

  run();
}
