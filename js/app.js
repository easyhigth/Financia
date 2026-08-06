// Point d'entrée : routeur par hash + enregistrement du service worker.
import { currentStreak } from './store.js';
import { toast } from './ui.js';

import dashboard from './views/dashboard.js';
import flashcards from './views/flashcards.js';
import quiz from './views/quiz.js';
import calculateurs from './views/calculateurs.js';
import glossaire from './views/glossaire.js';
import graphiques from './views/graphiques.js';
import entretien from './views/entretien.js';
import reglages from './views/reglages.js';
import marques from './views/marques.js';

const ROUTES = {
  dashboard, flashcards, quiz, calculateurs, glossaire,
  graphiques, entretien, reglages, marques,
};

const viewEl = document.getElementById('view');

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  return {
    name: parts[0] || 'dashboard',
    parts: parts.slice(1),
    params: new URLSearchParams(qs || ''),
  };
}

let renderToken = 0;

async function render() {
  const route = parseHash();
  const view = ROUTES[route.name] || dashboard;
  const token = ++renderToken;

  document.querySelectorAll('.tabbar a').forEach((a) => {
    a.classList.toggle('active', a.dataset.tab === route.name);
  });

  viewEl.innerHTML = '<div class="loading">Chargement…</div>';
  try {
    // Une vue reçoit l'élément conteneur : elle peut soit y écrire elle-même
    // (et poser ses écouteurs), soit renvoyer une chaîne HTML.
    const html = await view(route, { navigate, refresh: render, el: viewEl });
    if (token !== renderToken) return; // une navigation plus récente a pris le relais
    if (typeof html === 'string') viewEl.innerHTML = html;
  } catch (err) {
    console.error(err);
    viewEl.innerHTML = `<div class="card"><h2>Erreur</h2><p class="muted">${String(err && err.message || err)}</p></div>`;
  }
  window.scrollTo({ top: 0 });
  updateStreakBadge();
}

export function navigate(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

async function updateStreakBadge() {
  const el = document.getElementById('streak-badge');
  if (!el) return;
  const s = await currentStreak();
  el.textContent = s > 0 ? `🔥 ${s} j` : '0 j';
  el.title = s > 0 ? `${s} jour(s) consécutif(s) de révision` : 'Aucune révision aujourd’hui';
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/dashboard';
  render();
});

// Le rendu peut démarrer avant DOMContentLoaded si le module est évalué tardivement.
if (document.readyState !== 'loading') {
  if (!location.hash) location.hash = '#/dashboard';
  render();
}

// ---------------------------------------------------------------- Service worker
// Cycle de mise à jour : le navigateur détecte un nouveau sw.js, la nouvelle version
// s'installe en arrière-plan puis attend. On propose alors la bascule en un tap ;
// tant que l'utilisateur ne l'accepte pas, l'application continue de tourner
// normalement, y compris hors ligne, sur la version en place.
function showUpdateBar(waiting) {
  if (document.getElementById('update-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'update-bar';
  bar.className = 'update-bar';
  bar.innerHTML = `
    <span>Nouvelle version disponible</span>
    <button id="update-now" class="btn-sm btn-primary">Recharger</button>
    <button id="update-later" class="btn-sm btn-ghost" aria-label="Plus tard">✕</button>`;
  document.body.appendChild(bar);
  requestAnimationFrame(() => bar.classList.add('show'));

  bar.querySelector('#update-later').addEventListener('click', () => bar.remove());
  bar.querySelector('#update-now').addEventListener('click', () => {
    bar.querySelector('#update-now').textContent = 'Mise à jour…';
    waiting.postMessage({ type: 'SKIP_WAITING' });
  });
}

if ('serviceWorker' in navigator) {
  let reloading = false;
  // Le nouveau service worker a pris la main : on recharge une seule fois.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      // Une version peut déjà être en attente au chargement de la page.
      if (reg.waiting && navigator.serviceWorker.controller) showUpdateBar(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          // controller absent = toute première installation, rien à proposer.
          if (sw.state === 'installed' && navigator.serviceWorker.controller) showUpdateBar(sw);
        });
      });

      // Recherche d'une mise à jour au lancement, puis à chaque retour au premier plan
      // (le cas typique sur iPhone : l'application reste ouverte en arrière-plan des jours).
      const check = () => { if (navigator.onLine) reg.update().catch(() => {}); };
      check();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
      window.addEventListener('online', check);
    }).catch((e) => console.warn('SW non enregistré :', e));
  });
}
