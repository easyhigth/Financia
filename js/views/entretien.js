// Vue Simulateur d'entretien : questions ouvertes, chrono, auto-évaluation.
import { ALL_INTERVIEW, MODULES, MODULE_BY_ID } from '../data/index.js';
import { esc, nl2br, pageHead, shuffle, fmtDuration, toast, num } from '../ui.js';
import { logInterview, interviewLog, toggleBookmark, setNote, getNote, pushRecent } from '../store.js';

export default async function entretien(route, ctx) {
  if (route.parts[0] === 'session') return session(route, ctx);
  return index(ctx);
}

async function index({ el }) {
  const log = await interviewLog();
  const doneMap = Object.fromEntries(log.map((l) => [l.id, l]));
  const doneCount = ALL_INTERVIEW.filter((q) => doneMap[q.id]).length;

  el.innerHTML = `
    ${pageHead("Simulateur d'entretien", "Questions ouvertes chronométrées — l'auto-évaluation est de votre ressort")}
    <div class="card">
      <h3>Comment l'utiliser</h3>
      <ul class="tight">
        <li>Répondez à voix haute, comme en entretien, avant d'afficher l'élément de réponse.</li>
        <li>Le chrono indique le temps conseillé ; il continue au-delà pour mesurer votre débit réel.</li>
        <li>Aucune correction automatique : comparez votre plan de réponse à la trame proposée.</li>
      </ul>
      <a class="btn btn-primary btn-block" href="#/entretien/session" style="margin-top:10px">Session aléatoire (8 questions)</a>
    </div>

    <div class="sep"></div>
    <h2>Par module</h2>
    <div class="list">
      ${MODULES.map((m) => {
        const qs = m.interview;
        const done = qs.filter((q) => doneMap[q.id]).length;
        return `<a class="list-item" href="#/entretien/session?module=${esc(m.id)}">
          <div class="row between"><span class="t">${esc(m.name)}</span>
          <span class="pill${done === qs.length ? ' accent' : ''}">${done}/${qs.length}</span></div>
          <div class="d">${qs.length} question(s) d'entretien</div>
        </a>`;
      }).join('')}
    </div>

    <div class="sep"></div>
    <div class="card tight"><small>${doneCount}/${ALL_INTERVIEW.length} question(s) déjà travaillée(s).</small></div>

    <div class="sep"></div>
    <h2>Toutes les questions</h2>
    <div class="list">
      ${ALL_INTERVIEW.map((q) => `<a class="list-item" href="#/entretien/session?id=${esc(q.id)}">
        <div class="t" style="font-weight:500">${esc(q.q)}</div>
        <div class="d">${esc(q.moduleName)} · ${Math.round(q.seconds / 60)} min conseillées${
          doneMap[q.id] ? ` · déjà vue ${doneMap[q.id].doneCount}×` : ''}</div>
      </a>`).join('')}
    </div>`;
}

async function session(route, { el }) {
  const moduleId = route.params.get('module') || '';
  const only = route.params.get('id') || '';
  let questions;
  if (only) questions = ALL_INTERVIEW.filter((q) => q.id === only);
  else if (moduleId) questions = shuffle(MODULE_BY_ID[moduleId]?.interview || []).map((q) => ({ ...q, moduleName: MODULE_BY_ID[moduleId].name }));
  else questions = shuffle(ALL_INTERVIEW).slice(0, 8);

  if (!questions.length) {
    el.innerHTML = `<div class="empty">Aucune question dans ce périmètre.</div>`;
    return;
  }

  let idx = 0, revealed = false, elapsed = 0, timer = null, running = false;

  el.innerHTML = `
    <div class="row between" style="margin-bottom:8px">
      <a class="btn btn-sm btn-ghost" href="#/entretien">← Entretien</a>
      <span class="pill" id="e-count"></span>
    </div>
    <div id="e-body"></div>`;

  const body = el.querySelector('#e-body');
  const count = el.querySelector('#e-count');

  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } running = false; }

  function tick() {
    elapsed++;
    const q = questions[idx];
    const remain = q.seconds - elapsed;
    const t = el.querySelector('#e-timer');
    if (!t) return;
    t.textContent = fmtDuration(remain);
    t.classList.toggle('over', remain < 0);
  }

  async function draw() {
    stopTimer();
    if (idx >= questions.length) return finish();
    const q = questions[idx];
    elapsed = 0;
    const note = await getNote(q.id);
    count.textContent = `${idx + 1} / ${questions.length}`;

    body.innerHTML = `
      <div class="card">
        <div class="row between" style="margin-bottom:10px">
          <span class="pill">${esc(q.moduleName)}</span>
          <span class="timer" id="e-timer">${fmtDuration(q.seconds)}</span>
        </div>
        <div class="question-big">${nl2br(q.q)}</div>
        <div class="tool-row">
          <button id="e-play" class="btn-primary">▶ Démarrer</button>
          <button id="e-reveal">Élément de réponse</button>
        </div>
        <small class="muted" style="display:block;margin-top:8px">Temps conseillé : ${Math.round(q.seconds / 60)} min environ. Répondez à voix haute avant d'afficher la trame.</small>
        ${revealed ? `
          <div class="sep"></div>
          <strong style="font-size:.85rem">Trame de réponse attendue</strong>
          <div class="explain" style="margin-top:8px">${nl2br(q.answer)}</div>
          <div class="tool-row">
            <button id="e-bm">☆ À revoir</button>
            <button id="e-note">${note ? '✎ Note' : '＋ Note'}</button>
            <button class="btn-primary" id="e-next">${idx + 1 < questions.length ? 'Question suivante →' : 'Terminer →'}</button>
          </div>
          ${note ? `<div class="note-body">${nl2br(note.text)}</div>` : ''}
        ` : ''}
      </div>`;

    const play = body.querySelector('#e-play');
    play.addEventListener('click', () => {
      if (running) { stopTimer(); play.textContent = '▶ Reprendre'; }
      else { running = true; timer = setInterval(tick, 1000); play.textContent = '⏸ Pause'; }
    });

    body.querySelector('#e-reveal').addEventListener('click', async () => {
      stopTimer();
      revealed = true;
      await logInterview(q.id, elapsed);
      pushRecent(q.id, q.q, `Entretien · ${q.moduleName}`, `#/entretien/session?id=${q.id}`);
      draw();
    });

    if (revealed) {
      body.querySelector('#e-next').addEventListener('click', () => { idx++; revealed = false; draw(); });
      body.querySelector('#e-bm').addEventListener('click', async () => {
        const on = await toggleBookmark(q.id, { title: q.q, type: "Question d'entretien", href: `#/entretien/session?id=${q.id}` });
        toast(on ? 'Question marquée à revoir' : 'Marque-page retiré');
      });
      body.querySelector('#e-note').addEventListener('click', async () => {
        const cur = (await getNote(q.id))?.text || '';
        const txt = prompt('Votre plan de réponse / points oubliés :', cur);
        if (txt === null) return;
        await setNote(q.id, txt, { title: q.q, type: "Question d'entretien", href: `#/entretien/session?id=${q.id}` });
        toast(txt.trim() ? 'Note enregistrée' : 'Note supprimée');
        draw();
      });
    }
  }

  async function finish() {
    const log = await interviewLog();
    const ids = new Set(questions.map((q) => q.id));
    const times = log.filter((l) => ids.has(l.id)).map((l) => l.lastSeconds || 0);
    const moy = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    count.textContent = `${questions.length} / ${questions.length}`;
    body.innerHTML = `
      <div class="card">
        <h2>Session terminée</h2>
        <p class="muted">${questions.length} question(s) travaillée(s) · temps moyen de réponse ${fmtDuration(Math.round(moy))}.</p>
        <p class="muted">Notez ce que vous avez oublié : c'est exactement ce que l'on vous redemandera.</p>
        <div class="tool-row">
          <a class="btn" href="#/marques">Voir mes notes</a>
          <a class="btn btn-primary" href="#/entretien/session">Nouvelle session</a>
        </div>
      </div>`;
  }

  draw();
}
