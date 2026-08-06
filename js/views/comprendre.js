// Vue Comprendre : parcours de découverte, à lire dans l'ordre, sans prérequis.
import LECONS from '../data/decouverte.js';
import { esc, nl2br, pageHead, toast } from '../ui.js';
import { pushRecent, toggleBookmark, setNote, getNote } from '../store.js';
import * as db from '../db.js';

const KEY = 'lecturesDecouverte';

export default async function comprendre(route, ctx) {
  const id = route.parts[0];
  return id ? lecon(id, ctx) : index(ctx);
}

async function lues() {
  return (await db.getMeta(KEY, [])) || [];
}

// ------------------------------------------------------------------ Index
async function index({ el }) {
  const lu = new Set(await lues());
  const total = LECONS.length;
  const faits = LECONS.filter((l) => lu.has(l.id)).length;
  const suivante = LECONS.find((l) => !lu.has(l.id));

  el.innerHTML = `
    ${pageHead('Comprendre', "Les bases posées à zéro — aucun prérequis, à lire dans l'ordre")}

    <div class="card">
      <h3>Par où commencer ?</h3>
      <p class="muted" style="font-size:.9rem">Ces douze leçons expliquent la finance de marché avec des mots
      de tous les jours. Chacune ne s'appuie que sur les précédentes. Une fois ces bases posées, les flashcards
      et le glossaire deviennent nettement plus faciles à digérer.</p>
      <div class="bar-mini" style="margin:10px 0 8px"><i style="width:${Math.round((faits / total) * 100)}%"></i></div>
      <small>${faits} / ${total} leçon(s) lue(s)</small>
      ${suivante ? `<a class="btn btn-primary btn-block" href="#/comprendre/${esc(suivante.id)}" style="margin-top:10px">
        ${faits ? 'Continuer' : 'Commencer'} — ${esc(suivante.title)}</a>` : ''}
    </div>

    <div class="sep"></div>
    <div class="list">
      ${LECONS.map((l, i) => `
        <a class="list-item" href="#/comprendre/${esc(l.id)}">
          <div class="row between">
            <span class="t">${i + 1}. ${esc(l.title)}</span>
            <span class="pill${lu.has(l.id) ? ' accent' : ''}">${lu.has(l.id) ? '✓ lu' : `${l.minutes} min`}</span>
          </div>
          <div class="d">${esc(l.sub)}</div>
        </a>`).join('')}
    </div>

    <div class="sep"></div>
    <div class="card tight"><small>Astuce : activez le bouton 💡 en haut de l'écran pour que toutes les cartes
    et fiches de l'application affichent aussi une explication en langage courant.</small></div>
  `;
}

// ---------------------------------------------------------------- Leçon
async function lecon(id, { el, refresh }) {
  const i = LECONS.findIndex((l) => l.id === id);
  const l = LECONS[i];
  if (!l) {
    el.innerHTML = `<div class="empty">Leçon introuvable.</div>`;
    return;
  }
  const lu = new Set(await lues());
  const prev = LECONS[i - 1];
  const next = LECONS[i + 1];
  const note = await getNote(l.id);

  el.innerHTML = `
    <div class="row between" style="margin-bottom:10px">
      <a class="btn btn-sm btn-ghost" href="#/comprendre">← Leçons</a>
      <span class="pill">${i + 1} / ${LECONS.length}</span>
    </div>

    ${pageHead(l.title, l.sub)}

    ${l.sections.map((s) => `
      <div class="card" style="margin-bottom:12px">
        <h3>${esc(s.h)}</h3>
        <p style="margin:0;font-size:.95rem;line-height:1.6">${nl2br(s.p)}</p>
      </div>`).join('')}

    <div class="card plain plain-key" style="margin-bottom:12px">
      <div class="plain-h">À retenir</div>
      <div class="plain-b">${nl2br(l.retenir)}</div>
    </div>

    ${l.mots?.length ? `
      <div class="card">
        <h3>Les mots que tu vas entendre</h3>
        ${l.mots.map(([m, d]) => `<div class="kv" style="align-items:flex-start">
          <span class="k" style="min-width:34%;color:var(--accent-2)">${esc(m)}</span>
          <span style="flex:1;text-align:right;font-size:.88rem">${esc(d)}</span>
        </div>`).join('')}
      </div>` : ''}

    <div class="tool-row">
      <button id="l-note">${note ? '✎ Ma note' : '＋ Note'}</button>
      <button id="l-bm">☆ À revoir</button>
    </div>
    ${note ? `<div class="note-body">${nl2br(note.text)}</div>` : ''}

    <div class="sep"></div>
    <button class="btn-primary btn-block" id="l-done">
      ${lu.has(l.id) ? '✓ Déjà lue' : "J'ai compris, marquer comme lue"}${next ? ' et continuer' : ''}
    </button>
    <div class="tool-row">
      ${prev ? `<a class="btn" href="#/comprendre/${esc(prev.id)}">← Précédente</a>` : ''}
      ${next ? `<a class="btn" href="#/comprendre/${esc(next.id)}">Suivante →</a>` : ''}
    </div>
  `;

  el.querySelector('#l-done').addEventListener('click', async () => {
    const set = new Set(await lues());
    set.add(l.id);
    await db.setMeta(KEY, [...set]);
    toast('Leçon marquée comme lue');
    location.hash = next ? `#/comprendre/${next.id}` : '#/comprendre';
  });

  el.querySelector('#l-bm').addEventListener('click', async () => {
    const on = await toggleBookmark(l.id, { title: l.title, type: 'Leçon', href: `#/comprendre/${l.id}` });
    toast(on ? 'Leçon marquée à revoir' : 'Marque-page retiré');
  });

  el.querySelector('#l-note').addEventListener('click', async () => {
    const cur = (await getNote(l.id))?.text || '';
    const txt = prompt(`Note personnelle — ${l.title} :`, cur);
    if (txt === null) return;
    await setNote(l.id, txt, { title: l.title, type: 'Leçon', href: `#/comprendre/${l.id}` });
    toast(txt.trim() ? 'Note enregistrée' : 'Note supprimée');
    refresh();
  });

  pushRecent(l.id, l.title, 'Leçon · Comprendre', `#/comprendre/${l.id}`);
}
