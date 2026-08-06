// Vue Quiz : QCM par module, feedback immédiat, historique des scores.
import { MODULES, MODULE_BY_ID } from '../data/index.js';
import { moduleScores, quizHistory, saveQuizAttempt, toggleBookmark, setNote } from '../store.js';
import { esc, nl2br, pageHead, shuffle, num, dateFr, toast, plainBlock, plainToggleButton, bindPlainButtons } from '../ui.js';

const SESSION_SIZE = 10;

export default async function quiz(route, ctx) {
  const moduleId = route.parts[0];
  if (moduleId && MODULE_BY_ID[moduleId]) return run(moduleId, route, ctx);
  return index(ctx);
}

// ------------------------------------------------------------------ Index
async function index({ el }) {
  const [scores, history] = await Promise.all([moduleScores(), quizHistory()]);

  el.innerHTML = `
    ${pageHead('Quiz', 'QCM par module — feedback immédiat et suivi de progression')}
    <div class="list">
      ${MODULES.map((m) => {
        const s = scores[m.id];
        const p = s.score === null ? null : Math.round(s.score * 100);
        const cls = p === null ? '' : p < 50 ? 'bad' : p < 75 ? 'warn' : 'good';
        return `<a class="list-item" href="#/quiz/${esc(m.id)}">
          <div class="row between">
            <span class="t">${esc(m.name)}</span>
            <span class="pill${p !== null && p >= 75 ? ' accent' : ''}">${p === null ? 'jamais' : p + ' %'}</span>
          </div>
          <div class="bar-mini ${cls}" style="margin:7px 0 5px"><i style="width:${p === null ? 0 : p}%"></i></div>
          <div class="d">${m.quiz.length} questions · ${s.attempts} session(s) passée(s)</div>
        </a>`;
      }).join('')}
    </div>

    ${history.length ? `
      <div class="sep"></div>
      <h2>Historique</h2>
      <div class="list">
        ${history.slice(0, 15).map((h) => `<div class="list-item">
          <div class="row between">
            <span class="t">${esc(MODULE_BY_ID[h.moduleId]?.name || h.moduleId)}</span>
            <span class="pill">${num((h.correct / h.total) * 100, 0)} %</span>
          </div>
          <div class="d">${h.correct}/${h.total} · ${dateFr(h.date)}</div>
        </div>`).join('')}
      </div>` : `<div class="sep"></div><div class="empty">Aucun quiz passé pour l'instant.</div>`}
  `;
}

// -------------------------------------------------------------- Session
async function run(moduleId, route, { el }) {
  const mod = MODULE_BY_ID[moduleId];
  const questions = shuffle(mod.quiz).slice(0, Math.min(SESSION_SIZE, mod.quiz.length));
  let idx = 0, correct = 0, answered = false;

  el.innerHTML = `
    <div class="row between" style="margin-bottom:8px">
      <a class="btn btn-sm btn-ghost" href="#/quiz">← Modules</a>
      <span class="pill" id="q-count"></span>
    </div>
    <div class="progress" style="margin-bottom:12px"><i id="q-prog" style="width:0%"></i></div>
    <div id="q-body"></div>`;

  const body = el.querySelector('#q-body');
  const prog = el.querySelector('#q-prog');
  const count = el.querySelector('#q-count');

  function draw() {
    if (idx >= questions.length) return finish();
    const q = questions[idx];
    count.textContent = `${idx + 1} / ${questions.length}`;
    prog.style.width = `${Math.round((idx / questions.length) * 100)}%`;
    answered = false;

    body.innerHTML = `
      <div class="card">
        <div class="tagline" style="font-size:.72rem;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em">${esc(mod.name)}</div>
        <h2 style="margin:.5rem 0 .8rem;font-size:1.02rem;line-height:1.45">${nl2br(q.q)}</h2>
        <div id="q-opts">
          ${q.options.map((o, i) => `<button class="qopt" data-i="${i}">${esc(o)}</button>`).join('')}
        </div>
        <div id="q-feedback"></div>
      </div>`;

    body.querySelectorAll('.qopt').forEach((b) => b.addEventListener('click', () => pick(q, +b.dataset.i)));
  }

  function pick(q, i) {
    if (answered) return;
    answered = true;
    const ok = i === q.answer;
    if (ok) correct++;

    body.querySelectorAll('.qopt').forEach((b) => {
      const bi = +b.dataset.i;
      b.classList.add('disabled');
      if (bi === q.answer) b.classList.add('correct');
      else if (bi === i) b.classList.add('wrong');
    });

    body.querySelector('#q-feedback').innerHTML = `
      <div class="explain">
        <strong>${ok ? '✓ Correct' : '✗ Incorrect'}</strong> — ${nl2br(q.explain)}
      </div>
      ${plainBlock(q.id)}
      ${plainToggleButton(q.id)}
      <div class="tool-row">
        <button id="q-bm">☆ À revoir</button>
        <button id="q-note">＋ Note</button>
        <button class="btn-primary" id="q-next">${idx + 1 < questions.length ? 'Suivante →' : 'Résultat →'}</button>
      </div>`;

    bindPlainButtons(body);
    body.querySelector('#q-next').addEventListener('click', () => { idx++; draw(); });
    body.querySelector('#q-bm').addEventListener('click', async () => {
      const on = await toggleBookmark(q.id, { title: q.q, type: 'Question de quiz', href: `#/quiz/${moduleId}` });
      toast(on ? 'Question marquée à revoir' : 'Marque-page retiré');
    });
    body.querySelector('#q-note').addEventListener('click', async () => {
      const txt = prompt('Note personnelle sur cette question :', '');
      if (txt === null) return;
      await setNote(q.id, txt, { title: q.q, type: 'Question de quiz', href: `#/quiz/${moduleId}` });
      toast(txt.trim() ? 'Note enregistrée' : 'Note supprimée');
    });
  }

  async function finish() {
    prog.style.width = '100%';
    count.textContent = `${questions.length} / ${questions.length}`;
    await saveQuizAttempt(moduleId, correct, questions.length);
    const p = Math.round((correct / questions.length) * 100);
    const verdict = p >= 80 ? 'Solide — passez au module suivant.'
      : p >= 60 ? 'Correct, mais quelques notions à consolider.'
      : 'À retravailler : reprenez les flashcards de ce module.';
    body.innerHTML = `
      <div class="card">
        <h2>Résultat</h2>
        <div class="kpi" style="margin:.6rem 0"><span class="val">${correct}/${questions.length}</span><span class="lbl">${p} % de bonnes réponses</span></div>
        <div class="bar-mini ${p < 50 ? 'bad' : p < 75 ? 'warn' : 'good'}"><i style="width:${p}%"></i></div>
        <p class="muted" style="margin-top:12px">${esc(verdict)}</p>
        <div class="tool-row">
          <a class="btn" href="#/flashcards/session?module=${esc(moduleId)}">Flashcards du module</a>
          <a class="btn btn-primary" href="#/quiz/${esc(moduleId)}">Refaire un quiz</a>
        </div>
      </div>`;
  }

  draw();
}
