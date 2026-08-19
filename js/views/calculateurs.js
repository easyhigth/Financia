// Vue Calculateurs : chaque outil affiche la formule employée et le détail des étapes.
import { esc, pageHead, num, fieldNum, toast } from '../ui.js';
import { phi, N, normInv, bs, binomial } from '../lib/bs.js';
import { simulate, histVarES, paramVarES, kupiec, baleZone, merton, pdImplicite } from '../lib/risk.js';

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


  varhist: {
    title: 'VaR historique & Expected Shortfall',
    sub: "Ce que la loi normale ne voit pas : l'effet des queues épaisses",
    ref: 'Hull ch. 22',
    formula: `VaR historique = quantile des pertes observées
ES = moyenne des pertes AU-DELÀ de la VaR
VaR gaussienne = z_α × σ × V          ES gaussien = φ(z_α)/(1−α) × σ × V`,
    fields: [
      { name: 'V', label: 'Valeur du portefeuille (€)', value: 10000000 },
      { name: 'vol', label: 'Volatilité quotidienne (%)', value: 1.2 },
      { name: 'conf', label: 'Niveau de confiance (%)', value: 99 },
      { name: 'n', label: 'Nombre de scénarios simulés', value: 10000 },
      { name: 'df', label: 'Épaisseur des queues (3 = extrême, 30 = normale)', value: 4 },
      { name: 'seed', label: 'Graine (même valeur = même série)', value: 42 },
    ],
    compute(v) {
      const alpha = Math.min(Math.max(v.conf / 100, 0.5), 0.9995);
      const sigma = v.vol / 100;
      const n = Math.max(50, Math.min(Math.round(v.n), 50000));
      const df = Math.max(3, v.df);
      const serie = simulate({ n, vol: sigma, df, seed: Math.round(v.seed) });
      const h = histVarES(serie, alpha, v.V);
      const p = paramVarES(sigma, alpha, v.V);
      const ecart = (h.varAbs - p.varAbs) / p.varAbs;
      const pires = h.pertes.slice().sort((a, b) => b - a).slice(0, 5);
      const kurt = (() => {
        const m = serie.reduce((a, b) => a + b, 0) / n;
        const sd = Math.sqrt(serie.reduce((a, r) => a + (r - m) ** 2, 0) / n);
        return serie.reduce((a, r) => a + ((r - m) / sd) ** 4, 0) / n;
      })();
      return {
        main: `${num(h.varAbs, 0)} €`,
        mainLabel: `VaR historique ${num(v.conf, 1)} % à 1 jour`,
        kv: [
          ['VaR historique', `${num(h.varAbs, 0)} €`],
          ['VaR gaussienne', `${num(p.varAbs, 0)} €`],
          ['Écart', `${ecart >= 0 ? '+' : ''}${num(ecart * 100, 1)} %`],
          ['Expected Shortfall historique', `${num(h.es, 0)} €`],
          ['Expected Shortfall gaussien', `${num(p.es, 0)} €`],
          ['Rapport ES / VaR (historique)', num(h.es / h.varAbs, 3)],
          ['Scénarios dans la queue', `${h.nQueue} sur ${n}`],
          ['Kurtosis de l’échantillon', `${num(kurt, 2)} (3 = loi normale)`],
          ['Pire perte simulée', `${num(pires[0], 0)} €`],
        ],
        steps: `1) Génération de ${n} scénarios de rendement quotidien
   volatilité ${num(v.vol, 3)} %, loi de Student à ${num(df, 0)} degrés de liberté
   (plus ce nombre est petit, plus les évènements extrêmes sont fréquents)
   Kurtosis obtenue : ${num(kurt, 2)} — une loi normale donnerait 3.

2) Conversion en pertes : perte = −rendement × ${num(v.V, 0)} €

3) VaR historique = quantile à ${num(v.conf, 2)} % des pertes triées
   → ${num(h.varAbs, 0)} €   (${h.nQueue} scénarios la dépassent)

4) Expected Shortfall = moyenne de ces ${h.nQueue} pertes
   → ${num(h.es, 0)} €, soit ${num(h.es / h.varAbs, 2)} fois la VaR
   Les cinq pires : ${pires.map((x) => num(x, 0)).join(' · ')} €

5) Comparaison avec l'hypothèse gaussienne
   VaR = z × σ × V = ${num(p.z, 4)} × ${num(sigma, 5)} × ${num(v.V, 0)} = ${num(p.varAbs, 0)} €
   ES  = φ(z)/(1−α) × σ × V = ${num(p.es, 0)} €

6) Fiabilité de l'estimation
   La VaR à ${num(v.conf, 1)} % ne repose que sur les ${h.nQueue} pires scénarios sur ${n}.
   C'est la faiblesse structurelle de la VaR historique : dans la réalité on utilise 250 à 500 jours,
   donc le quantile à 99 % s'appuie sur 2 à 5 observations seulement — autant dire presque rien.
   Réduisez le nombre de scénarios à 500 pour voir le résultat devenir instable d'une graine à l'autre.

Lecture : la loi normale ${ecart > 0.02 ? `SOUS-ESTIME la VaR de ${num(ecart * 100, 1)} %` : ecart < -0.02 ? `surestime la VaR de ${num(-ecart * 100, 1)} %` : 'donne ici un résultat proche'}.
C'est le reproche central fait à la VaR paramétrique : les rendements réels ont des queues
plus épaisses qu'une gaussienne, et l'écart se creuse précisément dans les scénarios qui comptent.
Faites varier l'épaisseur des queues de 100 (normale) à 3 (extrême) pour voir l'effet.
L'Expected Shortfall, lui, regarde à l'intérieur de la queue — d'où son adoption par le régulateur.`,
      };
    },
  },

  backtest: {
    title: 'Back-testing de la VaR',
    sub: 'Test de Kupiec et dispositif des feux tricolores de Bâle',
    ref: 'Hull ch. 22',
    formula: `Exceptions attendues = n × (1 − α)
LR = −2·ln[ (1−p)^(n−x)·p^x / ((1−x/n)^(n−x)·(x/n)^x ) ]
Rejet du modèle à 95 % si LR > 3,841
Bâle (250 jours, 99 %) : vert 0-4 · orange 5-9 · rouge ≥ 10`,
    fields: [
      { name: 'n', label: "Nombre de jours observés", value: 250 },
      { name: 'conf', label: 'Niveau de confiance annoncé (%)', value: 99 },
      { name: 'x', label: "Exceptions constatées", value: 5 },
    ],
    compute(v) {
      const n = Math.max(1, Math.round(v.n));
      const x = Math.max(0, Math.round(v.x));
      const pNiveau = 1 - Math.min(Math.max(v.conf / 100, 0.5), 0.9999);
      const k = kupiec(n, x, pNiveau);
      const z = baleZone(x);
      const pertinent = n === 250 && Math.abs(v.conf - 99) < 0.01;
      return {
        main: `${x} exception(s)`,
        mainLabel: `pour ${num(k.attendu, 1)} attendue(s) sur ${n} jours`,
        kv: [
          ['Exceptions attendues', num(k.attendu, 2)],
          ['Exceptions constatées', String(x)],
          ['Taux constaté', `${num(k.taux * 100, 2)} % (annoncé ${num(pNiveau * 100, 2)} %)`],
          ['Statistique de Kupiec (LR)', num(k.LR, 3)],
          ['Seuil de rejet à 95 %', '3,841'],
          ['Verdict statistique', k.rejete ? 'modèle rejeté' : 'modèle non rejeté'],
          ['Zone de Bâle', z.zone],
          ['Majoration du multiplicateur', num(z.majoration, 2)],
          ['Multiplicateur applicable', num(z.multiplicateur, 2)],
        ],
        steps: `1) Combien d'exceptions devrait-on observer ?
   n × (1 − α) = ${n} × ${num(pNiveau, 4)} = ${num(k.attendu, 2)}
   Constaté : ${x}. ${x > k.attendu ? "Davantage qu'attendu — le modèle pourrait sous-estimer le risque."
                    : x < k.attendu ? "Moins qu'attendu — le modèle est peut-être trop prudent."
                    : "Exactement la valeur attendue."}

2) Test de Kupiec — l'écart est-il statistiquement significatif ?
   LR = ${num(k.LR, 3)}, à comparer au seuil de 3,841 (khi-deux à 1 degré de liberté, 95 %)
   → ${k.rejete ? "LR dépasse le seuil : l'hypothèse « le modèle est correctement calibré » est REJETÉE."
                : "LR reste sous le seuil : on ne peut pas rejeter le modèle sur ce seul critère."}

3) Dispositif prudentiel des feux tricolores${pertinent ? '' : `
   (calibré pour 250 jours à 99 % — vos paramètres diffèrent, lecture indicative)`}
   Zone ${z.zone.toUpperCase()} : ${z.message}
   Multiplicateur de fonds propres : 3,00 + ${num(z.majoration, 2)} = ${num(z.multiplicateur, 2)}

Deux lectures à ne pas confondre — et c'est un excellent point d'entretien :
le test statistique et le dispositif prudentiel ne coïncident pas. Avec 5 exceptions sur 250 jours,
Kupiec ne rejette pas le modèle, alors que Bâle place déjà l'établissement en zone orange.
Le régulateur est délibérément plus sévère que la statistique pure.

À vérifier aussi : l'INDÉPENDANCE des exceptions (test de Christoffersen). Cinq exceptions
dispersées dans l'année sont acceptables ; cinq exceptions la même semaine signalent un modèle
qui ne réagit pas assez vite aux changements de régime de volatilité.
Enfin, le back-testing se fait sur un P&L hypothétique (positions figées), jamais sur le P&L réel.`,
      };
    },
  },

  credit: {
    title: 'Risque de crédit : PD implicite et Merton',
    sub: "Du spread de marché à la probabilité de défaut, et le modèle structurel",
    ref: 'Hull ch. 24',
    formula: `Forme réduite :  spread ≈ λ × (1 − R)  ⇒  λ = spread/(1 − R)
PD cumulée sur T = 1 − e^(−λT)
Merton : capitaux propres = call sur l'actif, de strike la dette
d₂ = [ln(V/D) + (r − σ²/2)T] / (σ√T)      PD = N(−d₂)`,
    fields: [
      { name: 'spread', label: 'Spread de crédit (bp)', value: 150 },
      { name: 'recov', label: 'Taux de recouvrement R (%)', value: 40 },
      { name: 'horizon', label: 'Horizon (années)', value: 5 },
      { name: 'V', label: "Merton : valeur de l'actif", value: 100 },
      { name: 'D', label: 'Merton : dette à rembourser', value: 80 },
      { name: 'sigmaV', label: "Merton : volatilité de l'actif (%)", value: 25 },
      { name: 'r', label: 'Taux sans risque (%)', value: 3 },
      { name: 'T', label: 'Merton : échéance de la dette (années)', value: 1 },
      { name: 'EAD', label: 'Exposition au défaut EAD (€)', value: 10000000 },
    ],
    compute(v) {
      const R = Math.min(Math.max(v.recov / 100, 0), 0.999);
      const T = Math.max(v.horizon, 0.01);
      const red = pdImplicite(v.spread, R, T);
      const m = merton({ V: v.V, D: v.D, T: Math.max(v.T, 0.01), r: v.r / 100, sigmaV: Math.max(v.sigmaV / 100, 1e-4) });
      const EL = red.pdCumulee * red.lgd * v.EAD;
      const ELan = red.pdAn * red.lgd * v.EAD;
      return {
        main: `${num(red.pdCumulee * 100, 2)} %`,
        mainLabel: `Probabilité de défaut cumulée sur ${num(T, 1)} an(s)`,
        kv: [
          ['LGD (perte en cas de défaut)', `${num(red.lgd * 100, 1)} %`],
          ['Intensité de défaut λ', `${num(red.lambda * 100, 3)} % par an`],
          ['PD sur 1 an', `${num(red.pdAn * 100, 3)} %`],
          [`PD cumulée sur ${num(T, 1)} ans`, `${num(red.pdCumulee * 100, 2)} %`],
          ['Perte attendue annuelle', `${num(ELan, 0)} €`],
          [`Perte attendue sur ${num(T, 1)} ans`, `${num(EL, 0)} €`],
          ['— Merton : capitaux propres', num(m.capitaux, 3)],
          ['— Merton : valeur de la dette', num(m.dette, 3)],
          ['— Merton : distance au défaut', `${num(m.distanceDefaut, 3)} écarts-types`],
          ['— Merton : PD', `${num(m.pd * 100, 2)} %`],
          ['— Merton : spread impliqué', `${num(m.spread * 10000, 0)} bp`],
        ],
        steps: `PARTIE 1 — Ce que le marché dit du risque (forme réduite)

1) LGD = 1 − R = 1 − ${num(R, 3)} = ${num(red.lgd, 3)}
   On ne perd pas tout en cas de défaut : on récupère une partie en liquidant.

2) Le spread rémunère la perte attendue par unité de temps
   λ = spread / LGD = ${num(v.spread / 10000, 5)} / ${num(red.lgd, 3)} = ${num(red.lambda, 5)} par an
   soit ${num(red.lambda * 100, 3)} % de chances de faire défaut dans l'année.

3) PD cumulée = 1 − e^(−λT) = 1 − e^(−${num(red.lambda, 5)}×${num(T, 2)}) = ${num(red.pdCumulee * 100, 2)} %
   Ce n'est pas λ × T : la survie se compose, comme des intérêts.

4) Perte attendue = PD × LGD × EAD = ${num(red.pdCumulee, 4)} × ${num(red.lgd, 3)} × ${num(v.EAD, 0)}
   = ${num(EL, 0)} € sur l'horizon (${num(ELan, 0)} € pour la première année)

PARTIE 2 — Le modèle structurel de Merton

5) L'idée : les actionnaires possèdent un call sur l'actif de l'entreprise.
   Si à l'échéance l'actif dépasse la dette, ils remboursent et gardent le surplus.
   Sinon ils abandonnent l'entreprise aux créanciers : leur perte est plafonnée à leur mise.
   Les fonds propres sont donc évalués exactement comme une option d'achat.

6) Actif ${num(v.V, 2)}, dette ${num(v.D, 2)}, volatilité ${num(v.sigmaV, 1)} %, échéance ${num(v.T, 2)} an
   d₂ = ${num(m.d2, 4)} → c'est la distance au défaut, en écarts-types
   PD = N(−d₂) = ${num(m.pd * 100, 2)} %

7) Répartition de la valeur : capitaux propres ${num(m.capitaux, 3)} + dette ${num(m.dette, 3)} = ${num(m.capitaux + m.dette, 3)}
   La somme redonne bien la valeur de l'actif : rien ne se crée ni ne se perd.
   Spread de crédit impliqué : ${num(m.spread * 10000, 0)} bp

Limites à citer en entretien : Merton suppose une dette unique à échéance connue, une valeur
d'actif observable et continue — donc pas de saut. Les probabilités obtenues sont
« risque-neutre », systématiquement plus élevées que les probabilités historiques, car elles
contiennent une prime de risque. Ne jamais présenter une PD extraite d'un spread comme une
probabilité réelle de faillite.`,
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
