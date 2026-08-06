// Vue Glossaire : recherche instantanée sur termes, définitions, formules et pièges.
import { ALL_GLOSSARY, MODULES } from '../data/index.js';
import { esc, nl2br, pageHead, moduleChips, toast, plainBlock, plainToggleButton, bindPlainButtons } from '../ui.js';
import { getNote, setNote, getBookmark, toggleBookmark, allBookmarks, allNotes, pushRecent } from '../store.js';

const norm = (s) => String(s).toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default async function glossaire(route, { el }) {
  let query = route.params.get('q') || '';
  let moduleId = route.params.get('module') || '';
  const [bms, notes] = await Promise.all([allBookmarks(), allNotes()]);
  const bmSet = new Set(bms.map((b) => b.id));
  const noteMap = Object.fromEntries(notes.map((n) => [n.id, n.text]));

  el.innerHTML = `
    ${pageHead('Glossaire', `${ALL_GLOSSARY.length} fiches — définition, formule, piège à connaître`)}
    <div class="searchbar">
      <input id="g-search" type="search" placeholder="Rechercher un terme, une formule…" value="${esc(query)}" autocomplete="off">
      <div id="g-chips" style="margin-top:8px"></div>
    </div>
    <div id="g-results"></div>`;

  const results = el.querySelector('#g-results');
  const input = el.querySelector('#g-search');
  const chipsHost = el.querySelector('#g-chips');

  function renderChips() {
    chipsHost.innerHTML = '';
    chipsHost.appendChild(moduleChips(MODULES, moduleId, (id) => {
      moduleId = id;
      renderChips();
      renderList();
    }));
  }

  function renderList() {
    const q = norm(query.trim());
    const terms = q.split(/\s+/).filter(Boolean);
    let list = ALL_GLOSSARY.filter((g) => !moduleId || g.moduleId === moduleId);
    if (terms.length) {
      list = list
        .map((g) => {
          const hay = norm(`${g.term} ${g.def} ${g.formula || ''} ${g.trap || ''} ${g.moduleName}`);
          const nt = norm(g.term);
          if (!terms.every((t) => hay.includes(t))) return null;
          // score : préfixe du terme > terme > corps
          let score = 3;
          if (nt.startsWith(terms[0])) score = 0;
          else if (nt.includes(terms[0])) score = 1;
          return { g, score };
        })
        .filter(Boolean)
        .sort((a, b) => a.score - b.score || a.g.term.localeCompare(b.g.term, 'fr'))
        .map((x) => x.g);
    } else {
      list = list.slice().sort((a, b) => a.term.localeCompare(b.term, 'fr'));
    }

    if (!list.length) {
      results.innerHTML = `<div class="empty">Aucun résultat pour « ${esc(query)} ».</div>`;
      return;
    }

    results.innerHTML = `
      <div class="row between" style="margin:10px 0 4px">
        <small>${list.length} fiche(s)</small>
      </div>
      <div class="card">
        ${list.map((g) => `
          <div class="gloss-entry" data-id="${esc(g.id)}">
            <div class="row between">
              <span class="term">${highlight(g.term, terms)}</span>
              <span class="pill">${esc(g.moduleName)}</span>
            </div>
            <div class="dim" style="font-size:.92rem;margin-top:4px">${highlight(g.def, terms)}</div>
            ${g.formula ? `<div class="formula">${esc(g.formula)}</div>` : ''}
            ${g.trap ? `<div class="trap">⚠ ${highlight(g.trap, terms)}</div>` : ''}
            ${plainBlock(g.id)}
            ${noteMap[g.id] ? `<div class="note-body">${nl2br(noteMap[g.id])}</div>` : ''}
            <div class="row" style="margin-top:8px;gap:6px">
              <button class="btn-sm" data-bm="${esc(g.id)}">${bmSet.has(g.id) ? '★ Prioritaire' : '☆ À revoir'}</button>
              <button class="btn-sm" data-note="${esc(g.id)}">${noteMap[g.id] ? '✎ Note' : '＋ Note'}</button>
              ${plainToggleButton(g.id)}
            </div>
          </div>`).join('')}
      </div>`;

    bindPlainButtons(results);
    results.querySelectorAll('[data-bm]').forEach((b) => b.addEventListener('click', async () => {
      const id = b.dataset.bm;
      const g = ALL_GLOSSARY.find((x) => x.id === id);
      const on = await toggleBookmark(id, { title: g.term, type: 'Glossaire', href: `#/glossaire?q=${encodeURIComponent(g.term)}` });
      on ? bmSet.add(id) : bmSet.delete(id);
      toast(on ? 'Fiche marquée à revoir' : 'Marque-page retiré');
      renderList();
    }));

    results.querySelectorAll('[data-note]').forEach((b) => b.addEventListener('click', async () => {
      const id = b.dataset.note;
      const g = ALL_GLOSSARY.find((x) => x.id === id);
      const txt = prompt(`Note personnelle — ${g.term} :`, noteMap[id] || '');
      if (txt === null) return;
      await setNote(id, txt, { title: g.term, type: 'Glossaire', href: `#/glossaire?q=${encodeURIComponent(g.term)}` });
      if (txt.trim()) noteMap[id] = txt.trim(); else delete noteMap[id];
      toast(txt.trim() ? 'Note enregistrée' : 'Note supprimée');
      renderList();
    }));

    results.querySelectorAll('.gloss-entry').forEach((entry) => {
      entry.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const g = ALL_GLOSSARY.find((x) => x.id === entry.dataset.id);
        if (g) pushRecent(g.id, g.term, `Glossaire · ${g.moduleName}`, `#/glossaire?q=${encodeURIComponent(g.term)}`);
      });
    });
  }

  function highlight(text, terms) {
    let out = esc(text);
    if (!terms.length) return out;
    terms.forEach((t) => {
      if (t.length < 2) return;
      const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      out = out.replace(re, '<mark style="background:#2b4d6e;color:#eaf3fb;border-radius:3px;padding:0 2px">$1</mark>');
    });
    return out;
  }

  let t = null;
  input.addEventListener('input', () => {
    query = input.value;
    clearTimeout(t);
    t = setTimeout(renderList, 60); // recherche as-you-type, légèrement temporisée
  });

  renderChips();
  renderList();
}
