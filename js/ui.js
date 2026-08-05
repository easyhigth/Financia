// Petites briques d'interface partagées par les vues.

/** Échappement HTML — tout contenu injecté passe par ici. */
export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Échappe puis convertit les retours à la ligne en <br>. */
export const nl2br = (s) => esc(s).replace(/\n/g, '<br>');

export function toast(msg, ms = 2200) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 250);
  }, ms);
}

/** Formatage numérique français. */
export function num(v, dec = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (!Number.isFinite(v)) return '∞';
  return v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
export const pct = (v, dec = 2) => `${num(v * 100, dec)} %`;
export const eur = (v, dec = 2) => `${num(v, dec)} €`;

export function dateFr(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Lecture d'un champ numérique de formulaire, avec valeur de repli. */
export function fieldNum(root, name, fallback = 0) {
  const el = root.querySelector(`[name="${name}"]`);
  if (!el) return fallback;
  const v = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(v) ? v : fallback;
}

/** Mélange (Fisher-Yates) — utilisé pour l'ordre des sessions. */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Barre de filtres par module. `onPick` reçoit l'id (ou '' pour « tous »). */
export function moduleChips(modules, current, onPick) {
  const wrap = document.createElement('div');
  wrap.className = 'chips';
  const mk = (id, label) => {
    const b = document.createElement('button');
    b.className = 'chip' + (current === id ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', () => onPick(id));
    return b;
  };
  wrap.appendChild(mk('', 'Tous'));
  modules.forEach((m) => wrap.appendChild(mk(m.id, m.short || m.name)));
  return wrap;
}

/** Titre de page standard. */
export function pageHead(title, sub) {
  return `<div class="page-head"><h1>${esc(title)}</h1>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>`;
}

/** Délègue un clic sur tous les éléments correspondant au sélecteur. */
export function on(root, selector, event, handler) {
  root.querySelectorAll(selector).forEach((el) => el.addEventListener(event, handler));
}

export const fmtDuration = (sec) => {
  const m = Math.floor(Math.abs(sec) / 60);
  const s = Math.abs(sec) % 60;
  return `${sec < 0 ? '−' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
