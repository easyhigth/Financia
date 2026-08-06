// Réglages d'affichage, mémorisés sur l'appareil (localStorage : lecture synchrone,
// nécessaire au rendu immédiat des vues).

const KEY = 'financia.settings';
const DEFAULTS = {
  // Mode « Expliquer simplement » : affiche partout un bloc « En clair »,
  // rédigé sans jargon, avant la définition technique.
  simple: false,
};

let cache = null;

function read() {
  if (cache) return cache;
  try {
    cache = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

export const getSetting = (k) => read()[k];

export function setSetting(k, v) {
  const s = read();
  s[k] = v;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* stockage plein ou bloqué */ }
  document.documentElement.classList.toggle('simple-on', !!read().simple);
  return v;
}

export const isSimple = () => !!getSetting('simple');
export const toggleSimple = () => setSetting('simple', !isSimple());

/** À appeler une fois au démarrage pour refléter le réglage dans le DOM. */
export function applySettings() {
  document.documentElement.classList.toggle('simple-on', isSimple());
}
