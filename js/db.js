// Couche de persistance locale — IndexedDB uniquement, aucune donnée ne sort de l'appareil.
const DB_NAME = 'financia';
const DB_VERSION = 1;

export const STORES = ['srs', 'quiz', 'notes', 'bookmarks', 'recent', 'meta', 'interview'];

let dbp = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      // srs      : { id (cardId), ease, interval, reps, lapses, due, last, grade }
      if (!db.objectStoreNames.contains('srs')) db.createObjectStore('srs', { keyPath: 'id' });
      // quiz     : { id auto, moduleId, correct, total, date }
      if (!db.objectStoreNames.contains('quiz')) {
        const s = db.createObjectStore('quiz', { keyPath: 'id', autoIncrement: true });
        s.createIndex('moduleId', 'moduleId');
        s.createIndex('date', 'date');
      }
      // notes    : { id (refId), text, title, type, updatedAt }
      if (!db.objectStoreNames.contains('notes')) db.createObjectStore('notes', { keyPath: 'id' });
      // bookmarks: { id (refId), title, type, createdAt }
      if (!db.objectStoreNames.contains('bookmarks')) db.createObjectStore('bookmarks', { keyPath: 'id' });
      // recent   : { id (refId), title, type, href, ts }
      if (!db.objectStoreNames.contains('recent')) {
        const s = db.createObjectStore('recent', { keyPath: 'id' });
        s.createIndex('ts', 'ts');
      }
      // meta     : { key, value }  — streak, réglages, date de dernière révision…
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
      // interview: { id (questionId), doneCount, lastSeconds, lastAt }
      if (!db.objectStoreNames.contains('interview')) db.createObjectStore('interview', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

function tx(store, mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => resolve(req && 'result' in req ? req.result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

export const get = (store, key) => tx(store, 'readonly', (s) => s.get(key));
export const getAll = (store) => tx(store, 'readonly', (s) => s.getAll());
export const put = (store, value) => tx(store, 'readwrite', (s) => s.put(value));
export const del = (store, key) => tx(store, 'readwrite', (s) => s.delete(key));
export const clear = (store) => tx(store, 'readwrite', (s) => s.clear());

export async function putMany(store, values) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, 'readwrite');
    const os = t.objectStore(store);
    values.forEach((v) => os.put(v));
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
  });
}

export async function getMeta(key, fallback = null) {
  const r = await get('meta', key);
  return r === undefined || r === null ? fallback : r.value;
}
export const setMeta = (key, value) => put('meta', { key, value });

/** Exporte l'intégralité des données utilisateur (format de sauvegarde JSON). */
export async function exportAll() {
  const data = {};
  for (const s of STORES) data[s] = await getAll(s);
  return {
    app: 'financia',
    schema: DB_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

/**
 * Importe une sauvegarde.
 * @param {object} backup  contenu du fichier JSON
 * @param {'replace'|'merge'} mode  remplace tout, ou fusionne par-dessus l'existant
 */
export async function importAll(backup, mode = 'replace') {
  if (!backup || backup.app !== 'financia' || !backup.data) {
    throw new Error('Fichier de sauvegarde invalide (champ « app » attendu : "financia").');
  }
  for (const s of STORES) {
    const rows = backup.data[s];
    if (!Array.isArray(rows)) continue;
    if (mode === 'replace') await clear(s);
    // le store « quiz » a une clé auto-incrémentée : on laisse les id d'origine s'ils existent
    await putMany(s, rows);
  }
}

export async function wipe() {
  for (const s of STORES) await clear(s);
}
