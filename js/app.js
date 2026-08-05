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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Mise à jour disponible — rouvrez l’application');
          }
        });
      });
    }).catch((e) => console.warn('SW non enregistré :', e));
  });
}
