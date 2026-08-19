// Service worker — précache complet de l'application pour un fonctionnement 100 % hors ligne.
//
// Nom du cache = révision manuelle + identifiant de build.
// Le marqueur ci-dessous est remplacé par le SHA du commit lors du déploiement
// GitHub Actions : chaque publication change donc le contenu de ce fichier, ce qui
// déclenche automatiquement la détection de mise à jour par le navigateur.
// SW_REVISION sert de filet si le site est déployé sans passer par le workflow.
const SW_REVISION = 'r5';
const BUILD_ID = '__BUILD_ID__';
const CACHE_VERSION = `financia-${SW_REVISION}-${BUILD_ID}`;

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/db.js',
  './js/srs.js',
  './js/store.js',
  './js/ui.js',
  './js/settings.js',
  './js/lib/bs.js',
  './js/lib/risk.js',
  './js/data/index.js',
  './js/data/decouverte.js',
  './js/data/simple/index.js',
  './js/data/simple/taux.js',
  './js/data/simple/derives.js',
  './js/data/simple/fx.js',
  './js/data/simple/portefeuille.js',
  './js/data/simple/risques.js',
  './js/data/simple/reglementaire.js',
  './js/data/simple/hull.js',
  './js/data/taux.js',
  './js/data/derives.js',
  './js/data/fx.js',
  './js/data/portefeuille.js',
  './js/data/risques.js',
  './js/data/reglementaire.js',
  './js/data/hull.js',
  './js/views/dashboard.js',
  './js/views/comprendre.js',
  './js/views/flashcards.js',
  './js/views/quiz.js',
  './js/views/calculateurs.js',
  './js/views/glossaire.js',
  './js/views/graphiques.js',
  './js/views/entretien.js',
  './js/views/marques.js',
  './js/views/reglages.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      // addAll échouerait entièrement si une seule ressource manquait : on tolère les absences.
      .then((c) => Promise.all(ASSETS.map((u) => c.add(u).catch((err) => console.warn('précache ignoré', u, err)))))
      .then(() => {
        // Première installation : on prend la main tout de suite (aucune page à interrompre).
        // Mise à jour : on reste en attente, c'est l'utilisateur qui déclenche la bascule
        // via le bouton « Recharger » (message SKIP_WAITING).
        if (!self.registration.active) return self.skipWaiting();
      })
  );
});

// Bascule immédiate demandée par la page (bouton « Recharger maintenant »).
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // rien d'externe : l'app est autonome

  // Navigation : on sert toujours le shell depuis le cache (application mono-page).
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(req).catch(() => caches.match('./')))
    );
    return;
  }

  // Ressources : cache d'abord, réseau en repli, puis mise en cache silencieuse.
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
