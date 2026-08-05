// Répétition espacée — variante de SM-2 (SuperMemo 2) adaptée à 4 boutons.
//
// Grades utilisateur :
//   0 « À revoir » (échec)  1 « Difficile »  2 « Correct »  3 « Facile »
//
// Facteur de facilité (ease) : borné à [1.3 ; 2.8], départ 2.5.
// Un échec remet l'intervalle à zéro (carte replacée dans la file du jour)
// et incrémente le compteur de rechutes (lapses).

export const GRADES = [
  { g: 0, label: 'À revoir', hint: 'Je ne savais pas', cls: 'g0' },
  { g: 1, label: 'Difficile', hint: 'Retrouvé avec peine', cls: 'g1' },
  { g: 2, label: 'Correct', hint: 'Su, avec effort', cls: 'g2' },
  { g: 3, label: 'Facile', hint: 'Immédiat', cls: 'g3' },
];

export const DAY = 86400000;

/** Début de journée locale, en ms epoch. */
export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function todayKey(d = new Date()) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

/** État initial d'une carte jamais vue. */
export function newState(id) {
  return { id, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: 0, last: 0, grade: null };
}

/**
 * Applique une note à l'état d'une carte et renvoie le nouvel état.
 * @param {object} st  état courant (ou undefined pour une carte neuve)
 * @param {0|1|2|3} grade
 */
export function review(st, grade, now = Date.now()) {
  const s = { ...(st || newState(st?.id)) };
  const q = [0, 3, 4, 5][grade]; // conversion vers l'échelle SM-2 (0-5)

  if (grade === 0) {
    s.lapses += 1;
    s.reps = 0;
    s.interval = 0;
    s.ease = clamp(s.ease - 0.2, 1.3, 2.8);
    s.due = now; // à repasser dans la même session
  } else {
    s.reps += 1;
    s.ease = clamp(s.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), 1.3, 2.8);
    if (s.reps === 1) s.interval = grade === 1 ? 1 : grade === 2 ? 1 : 3;
    else if (s.reps === 2) s.interval = grade === 1 ? 3 : grade === 2 ? 6 : 8;
    else s.interval = Math.round(s.interval * s.ease * (grade === 1 ? 0.6 : grade === 3 ? 1.15 : 1));
    s.interval = Math.max(1, Math.min(s.interval, 365));
    s.due = startOfDay(new Date(now)) + s.interval * DAY;
  }
  s.last = now;
  s.grade = grade;
  return s;
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Une carte est due si elle n'a jamais été vue ou si son échéance est passée. */
export function isDue(st, now = Date.now()) {
  if (!st || !st.last) return true;
  return st.due <= now;
}

/** Libellé de la prochaine échéance, pour l'aperçu sous les boutons de notation. */
export function previewLabel(st, grade) {
  const next = review(st, grade);
  if (grade === 0) return 'maintenant';
  return next.interval === 1 ? 'demain' : `${next.interval} j`;
}

/** Niveau de maîtrise 0→1 d'une carte (sert au calcul du module le plus faible). */
export function strength(st) {
  if (!st || !st.last) return 0;
  const byInterval = Math.min(st.interval / 30, 1);
  const byEase = (st.ease - 1.3) / 1.5;
  return Math.max(0, Math.min(1, 0.65 * byInterval + 0.35 * byEase));
}
