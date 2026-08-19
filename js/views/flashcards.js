// Vue Flashcards : sélection de module puis session de révision espacée.
import { MODULES, MODULE_BY_ID } from '../data/index.js';
import { cardStats, dueCards, gradeCard, srsMap, getNote, setNote, getBookmark, toggleBookmark, pushRecent } from '../store.js';
import { GRADES, previewLabel, newState } from '../srs.js';
import { esc, nl2br, pageHead, shuffle, toast, num, plainBlock, plainToggleButton, bindPlainButtons } from '../ui.js';
import { ALL_CARDS } from '../data/index.js';

export default async function flashcards(route, ctx) {
  if (route.parts[0] === 'session') return session(route, ctx);
  return index(route, ctx);
}

// ------------------------------------------------------------------ Index
async function index(route, { el }) {
  const rows = await Promise.all(MODULES.map(async (m) => ({ m, s: await cardStats(m.id) })));
  const total = await cardStats();

  el.innerHTML = `
    ${pageHead('Flashcards', 'Répétition espacée (SM-2) — notez votre maîtrise pour planifier la suite')}
    <a class="btn btn-primary btn-block" href="#/flashcards/session">Réviser tout ce qui est dû (${total.due})</a>
    <div class="sep"></div>
    <div class="list">
      ${rows.map(({ m, s }) => `
        <a class="list-item" href="#/flashcards/session?module=${esc(m.id)}">
          <div class="row between"><span class="t">${esc(m.name)}</span>
          <span class="pill${s.due ? ' accent' : ''}">${s.due} dues</span></div>
          <div class="bar-mini" style="margin:7px 0 5px"><i style="width:${Math.round(s.avgStrength * 100)}%"></i></div>
          <div class="d">${s.total} cartes · ${s.seen} vues · ${s.mature} consolidées (&ge; 21 j)</div>
        </a>`).join('')}
    </div>
    <div class="sep"></div>
    <div class="card tight"><small>Une carte notée « À revoir » revient dans la même session.
    « Difficile », « Correct » et « Facile » espacent progressivement les révisions selon un algorithme de type SM-2.</small></div>
  `;
}

// ---------------------------------------------------------------- Session
async function session(route, { el, navigate }) {
  const moduleId = route.params.get('module') || '';
  const mode = route.params.get('mode') || 'due'; // 'due' | 'all' | 'marques'
  const mod = MODULE_BY_ID[moduleId];

  let queue;
  if (mode === 'all') {
    const map = await srsMap();
    queue = shuffle(ALL_CARDS.filter((c) => !moduleId || c.moduleId === moduleId))
      .map((c) => ({ ...c, srs: map[c.id] || null }));
  } else {
    queue = shuffle(await dueCards(moduleId));
  }

  const title = mod ? mod.name : 'Toutes les cartes';
  if (!queue.length) {
    el.innerHTML = `
      ${pageHead(title, 'Session de révision')}
      <div class="card"><h3>Rien à réviser ici ✓</h3>
      <p class="muted">Aucune carte n'est due dans ce périmètre.</p>
      <a class="btn btn-block" href="#/flashcards/session?module=${esc(moduleId)}&mode=all">Réviser quand même (mode libre)</a></div>
      <div class="sep"></div><a class="btn btn-ghost btn-block" href="#/flashcards">← Retour aux modules</a>`;
    return;
  }

  const total = queue.length;
  let done = 0;
  let idx = 0;
  let revealed = false;

  el.innerHTML = `
    <div class="row between" style="margin-bottom:8px">
      <a class="btn btn-sm btn-ghost" href="#/flashcards">← Modules</a>
      <span class="pill" id="fc-count"></span>
    </div>
    <div class="progress" style="margin-bottom:12px"><i id="fc-prog" style="width:0%"></i></div>
    <div id="fc-body"></div>
  `;

  const body = el.querySelector('#fc-body');
  const prog = el.querySelector('#fc-prog');
  const count = el.querySelector('#fc-count');

  async function draw() {
    if (idx >= queue.length) return finish();
    const card = queue[idx];
    const [note, bm] = await Promise.all([getNote(card.id), getBookmark(card.id)]);
    count.textContent = `${done + 1} / ${total}${queue.length > total ? ' (+ reprises)' : ''}`;
    prog.style.width = `${Math.round((done / total) * 100)}%`;

    const st = card.srs || newState(card.id);
    body.innerHTML = `
      <div class="flash">
        <div class="tagline">${esc(card.moduleName)}${card.ref ? ` · ${esc(card.ref)}` : ''}</div>
        <div class="front">${nl2br(card.front)}</div>
        ${revealed ? `
          <div class="back">
            <div class="def">${nl2br(card.back)}</div>
            ${card.example ? `<div class="ex"><strong>Exemple / piège :</strong> ${nl2br(card.example)}</div>` : ''}
            ${plainBlock(card.id)}
            ${plainToggleButton(card.id)}
          </div>` : ''}
      </div>

      ${revealed ? `
        <div class="grade-row">
          ${GRADES.map((g) => `<button class="${g.cls}" data-grade="${g.g}">
            ${esc(g.label)}<br><small style="color:inherit;opacity:.7">${esc(previewLabel(st, g.g))}</small>
          </button>`).join('')}
        </div>` : `
        <button class="btn-primary btn-block" id="fc-reveal" style="margin-top:12px">Afficher la réponse</button>`}

      <div class="tool-row">
        <button id="fc-bm">${bm ? '★ Prioritaire' : '☆ À revoir en priorité'}</button>
        <button id="fc-note">${note ? '✎ Note' : '＋ Note'}</button>
      </div>
      ${note ? `<div class="note-body">${nl2br(note.text)}</div>` : ''}
      <div class="card tight" style="margin-top:12px"><small>
        ${st.last ? `Vu ${st.reps} fois · intervalle ${st.interval} j · facilité ${num(st.ease, 2)}${st.lapses ? ` · ${st.lapses} rechute(s)` : ''}` : 'Nouvelle carte'}
      </small></div>
    `;

    bindPlainButtons(body);
    body.querySelector('#fc-reveal')?.addEventListener('click', () => { revealed = true; draw(); });
    body.querySelectorAll('[data-grade]').forEach((b) => b.addEventListener('click', () => onGrade(card, +b.dataset.grade)));
    body.querySelector('#fc-bm').addEventListener('click', async () => {
      const now = await toggleBookmark(card.id, { title: card.front, type: 'Flashcard', href: `#/flashcards/session?module=${card.moduleId}&mode=all` });
      toast(now ? 'Marquée à revoir en priorité' : 'Marque-page retiré');
      draw();
    });
    body.querySelector('#fc-note').addEventListener('click', async () => {
      const current = (await getNote(card.id))?.text || '';
      const txt = prompt('Note personnelle sur cette carte :', current);
      if (txt === null) return;
      await setNote(card.id, txt, { title: card.front, type: 'Flashcard', href: `#/flashcards/session?module=${card.moduleId}&mode=all` });
      toast(txt.trim() ? 'Note enregistrée' : 'Note supprimée');
      draw();
    });

    pushRecent(card.id, card.front, `Flashcard · ${card.moduleName}`, `#/flashcards/session?module=${card.moduleId}&mode=all`);
  }

  async function onGrade(card, grade) {
    const next = await gradeCard(card.id, grade);
    if (grade === 0) {
      // remise en fin de file pour un second passage dans la session
      queue.push({ ...card, srs: next });
    } else {
      done++;
    }
    idx++;
    revealed = false;
    draw();
  }

  function finish() {
    prog.style.width = '100%';
    count.textContent = `${total} / ${total}`;
    body.innerHTML = `
      <div class="card"><h2>Session terminée ✓</h2>
      <p class="muted">${total} carte(s) révisée(s) dans « ${esc(title)} ».</p>
      <div class="tool-row">
        <a class="btn btn-primary" href="#/dashboard">Tableau de bord</a>
        <a class="btn" href="#/quiz${moduleId ? '/' + esc(moduleId) : ''}">Enchaîner sur un quiz</a>
      </div></div>`;
  }

  draw();
}
