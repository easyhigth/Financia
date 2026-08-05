// Vue Accueil : révisions du jour, streak, module le plus faible, accès rapides.
import { MODULES, STATS } from '../data/index.js';
import { cardStats, currentStreak, weakestModule, recentItems, moduleScores, allBookmarks } from '../store.js';
import { esc, pageHead, num } from '../ui.js';
import * as dbm from '../db.js';

export default async function dashboard(route, { el }) {
  const [stats, streak, weakest, recents, scores, bookmarks, best] = await Promise.all([
    cardStats(), currentStreak(), weakestModule(), recentItems(5),
    moduleScores(), allBookmarks(), dbm.getMeta('bestStreak', 0),
  ]);

  const perModule = await Promise.all(MODULES.map(async (m) => ({ m, s: await cardStats(m.id) })));

  const weakHtml = weakest ? `
    <a class="card card-link" href="#/quiz/${esc(weakest.module.id)}">
      <div class="row between">
        <div>
          <div class="lbl kpi"><span class="lbl">Point faible actuel</span></div>
          <h3 style="margin:.3rem 0 .2rem">${esc(weakest.module.name)}</h3>
          <small>${weakest.basis === 'quiz'
            ? `Score quiz moyen : ${num(weakest.score * 100, 0)} %`
            : `Maîtrise des cartes : ${num(weakest.score * 100, 0)} %`}</small>
        </div>
        <span class="pill accent">Réviser →</span>
      </div>
      <div class="bar-mini ${weakest.score < 0.5 ? 'bad' : weakest.score < 0.75 ? 'warn' : 'good'}" style="margin-top:10px">
        <i style="width:${Math.round(Math.max(0.03, weakest.score) * 100)}%"></i>
      </div>
    </a>` : `
    <div class="card">
      <h3>Point faible</h3>
      <p class="muted" style="margin:0">Faites quelques quiz pour identifier le module à travailler en priorité.</p>
    </div>`;

  el.innerHTML = `
    ${pageHead('Tableau de bord', 'Préparation stage Risk Management — finance de marché')}

    <div class="grid cols-3">
      <a class="card card-link" href="#/flashcards/session">
        <div class="kpi"><span class="val" style="color:var(--accent-2)">${stats.due}</span><span class="lbl">À réviser</span></div>
      </a>
      <div class="card">
        <div class="kpi"><span class="val">${streak}</span><span class="lbl">Jours d'affilée</span></div>
      </div>
      <div class="card">
        <div class="kpi"><span class="val">${num(stats.avgStrength * 100, 0)}<small style="font-size:1rem"> %</small></span><span class="lbl">Maîtrise</span></div>
      </div>
    </div>

    <div class="sep"></div>

    ${stats.due > 0
      ? `<a class="btn btn-primary btn-block" href="#/flashcards/session">Lancer la session du jour (${stats.due} cartes)</a>`
      : `<div class="card"><h3>Session du jour terminée ✓</h3><p class="muted" style="margin:0">Aucune carte due. Vous pouvez réviser librement, faire un quiz ou vous entraîner à l'oral.</p></div>`}

    <div class="sep"></div>
    ${weakHtml}

    <div class="sep"></div>
    <h2>Progression par module</h2>
    <div class="list">
      ${perModule.map(({ m, s }) => {
        const sc = scores[m.id];
        const p = Math.round(s.avgStrength * 100);
        return `<a class="list-item" href="#/flashcards/session?module=${esc(m.id)}">
          <div class="row between">
            <span class="t">${esc(m.name)}</span>
            <span class="d">${s.due} à revoir</span>
          </div>
          <div class="bar-mini" style="margin:7px 0 5px"><i style="width:${p}%"></i></div>
          <div class="d">${s.seen}/${s.total} cartes vues · maîtrise ${p} %${
            sc.score !== null ? ` · quiz ${num(sc.score * 100, 0)} %` : ' · quiz non passé'}</div>
        </a>`;
      }).join('')}
    </div>

    <div class="sep"></div>
    <div class="grid cols-2">
      <a class="card card-link" href="#/entretien"><h3>Simulateur d'entretien</h3><small>${STATS.interview} questions ouvertes, chrono</small></a>
      <a class="card card-link" href="#/calculateurs"><h3>Calculateurs</h3><small>Obligation, Black-Scholes, VaR…</small></a>
      <a class="card card-link" href="#/graphiques"><h3>Graphiques</h3><small>Courbe des taux, payoffs, frontière</small></a>
      <a class="card card-link" href="#/marques"><h3>Notes & priorités</h3><small>${bookmarks.length} marque-page(s)</small></a>
    </div>

    ${recents.length ? `
      <div class="sep"></div>
      <h2>Consultés récemment</h2>
      <div class="list">
        ${recents.map((r) => `<a class="list-item" href="${esc(r.href)}">
          <div class="t">${esc(r.title)}</div><div class="d">${esc(r.type)}</div></a>`).join('')}
      </div>` : ''}

    <div class="sep"></div>
    <div class="card tight">
      <small>Contenu embarqué : ${STATS.cards} flashcards · ${STATS.quiz} questions de quiz ·
      ${STATS.glossary} fiches de glossaire · ${STATS.interview} questions d'entretien.
      Record de série : ${best} jour(s). Données stockées localement sur cet appareil.</small>
    </div>
  `;
}
