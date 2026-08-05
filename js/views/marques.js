// Vue Notes & marque-pages : tout ce que l'utilisateur a annoté ou marqué « à revoir ».
import { allBookmarks, allNotes, setNote, toggleBookmark } from '../store.js';
import { esc, nl2br, pageHead, dateFr, toast } from '../ui.js';

export default async function marques(route, { el, refresh }) {
  const [bms, notes] = await Promise.all([allBookmarks(), allNotes()]);
  bms.sort((a, b) => b.createdAt - a.createdAt);
  notes.sort((a, b) => b.updatedAt - a.updatedAt);

  el.innerHTML = `
    ${pageHead('Notes & priorités', 'Vos annotations et les éléments marqués à revoir en priorité')}

    <h2>★ À revoir en priorité <small style="font-weight:400">(${bms.length})</small></h2>
    ${bms.length ? `<div class="list">
      ${bms.map((b) => `<div class="list-item">
        <div class="row between">
          <a class="t" href="${esc(b.href || '#/dashboard')}" style="flex:1;color:inherit">${esc(b.title || b.id)}</a>
          <button class="btn-sm" data-unbm="${esc(b.id)}">Retirer</button>
        </div>
        <div class="d">${esc(b.type || '—')} · ${dateFr(b.createdAt)}</div>
      </div>`).join('')}
    </div>` : `<div class="empty">Aucun élément marqué. Utilisez le bouton ☆ sur une carte, une fiche ou une question.</div>`}

    <div class="sep"></div>
    <h2>✎ Notes personnelles <small style="font-weight:400">(${notes.length})</small></h2>
    ${notes.length ? `<div class="list">
      ${notes.map((n) => `<div class="list-item">
        <div class="row between">
          <a class="t" href="${esc(n.href || '#/dashboard')}" style="flex:1;color:inherit">${esc(n.title || n.id)}</a>
          <button class="btn-sm" data-editnote="${esc(n.id)}">Modifier</button>
        </div>
        <div class="d">${esc(n.type || '—')} · ${dateFr(n.updatedAt)}</div>
        <div class="note-body">${nl2br(n.text)}</div>
      </div>`).join('')}
    </div>` : `<div class="empty">Aucune note pour l'instant.</div>`}
  `;

  el.querySelectorAll('[data-unbm]').forEach((b) => b.addEventListener('click', async () => {
    await toggleBookmark(b.dataset.unbm);
    toast('Marque-page retiré');
    refresh();
  }));

  el.querySelectorAll('[data-editnote]').forEach((b) => b.addEventListener('click', async () => {
    const id = b.dataset.editnote;
    const n = notes.find((x) => x.id === id);
    const txt = prompt('Modifier la note (laisser vide pour supprimer) :', n?.text || '');
    if (txt === null) return;
    await setNote(id, txt, { title: n?.title, type: n?.type, href: n?.href });
    toast(txt.trim() ? 'Note mise à jour' : 'Note supprimée');
    refresh();
  }));
}
