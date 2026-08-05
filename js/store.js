// Logique métier au-dessus d'IndexedDB : SRS, streak, notes, marque-pages, historique.
import * as db from './db.js';
import { review, isDue, newState, todayKey, strength, DAY } from './srs.js';
import { ALL_CARDS, MODULES } from './data/index.js';

const cache = { srs: null };

export async function srsMap() {
  if (!cache.srs) {
    const rows = await db.getAll('srs');
    cache.srs = Object.fromEntries(rows.map((r) => [r.id, r]));
  }
  return cache.srs;
}

export function invalidate() { cache.srs = null; }

/** Enregistre une notation de flashcard et met à jour le streak. */
export async function gradeCard(cardId, grade) {
  const map = await srsMap();
  const next = review(map[cardId] || newState(cardId), grade);
  map[cardId] = next;
  await db.put('srs', next);
  await touchStreak();
  return next;
}

/** Cartes à réviser aujourd'hui, éventuellement filtrées par module. */
export async function dueCards(moduleId = '', now = Date.now()) {
  const map = await srsMap();
  return ALL_CARDS
    .filter((c) => (!moduleId || c.moduleId === moduleId) && isDue(map[c.id], now))
    .map((c) => ({ ...c, srs: map[c.id] || null }));
}

export async function cardStats(moduleId = '') {
  const map = await srsMap();
  const cards = moduleId ? ALL_CARDS.filter((c) => c.moduleId === moduleId) : ALL_CARDS;
  const now = Date.now();
  let seen = 0, due = 0, mature = 0, sumStrength = 0;
  cards.forEach((c) => {
    const st = map[c.id];
    if (st && st.last) { seen++; if (st.interval >= 21) mature++; }
    if (isDue(st, now)) due++;
    sumStrength += strength(st);
  });
  return { total: cards.length, seen, due, mature, avgStrength: cards.length ? sumStrength / cards.length : 0 };
}

// ---------------------------------------------------------------- Streak
export async function touchStreak() {
  const today = todayKey();
  const last = await db.getMeta('lastStudyDay', null);
  if (last === today) return;
  let streak = await db.getMeta('streak', 0);
  const yesterday = todayKey(new Date(Date.now() - DAY));
  streak = last === yesterday ? streak + 1 : 1;
  await db.setMeta('streak', streak);
  await db.setMeta('lastStudyDay', today);
  const best = await db.getMeta('bestStreak', 0);
  if (streak > best) await db.setMeta('bestStreak', streak);
}

/** Streak courant, remis à zéro si l'utilisateur a sauté plus d'une journée. */
export async function currentStreak() {
  const last = await db.getMeta('lastStudyDay', null);
  const streak = await db.getMeta('streak', 0);
  if (!last) return 0;
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - DAY));
  return last === today || last === yesterday ? streak : 0;
}

// ---------------------------------------------------------------- Quiz
export async function saveQuizAttempt(moduleId, correct, total) {
  await db.put('quiz', { moduleId, correct, total, date: Date.now() });
  await touchStreak();
}

export async function quizHistory(moduleId = '') {
  const rows = await db.getAll('quiz');
  return rows
    .filter((r) => !moduleId || r.moduleId === moduleId)
    .sort((a, b) => b.date - a.date);
}

/** Score moyen par module (sur les 5 dernières tentatives) + module le plus faible. */
export async function moduleScores() {
  const rows = await db.getAll('quiz');
  const out = {};
  MODULES.forEach((m) => { out[m.id] = { attempts: 0, score: null, name: m.name }; });
  MODULES.forEach((m) => {
    const rs = rows.filter((r) => r.moduleId === m.id).sort((a, b) => b.date - a.date).slice(0, 5);
    out[m.id].attempts = rows.filter((r) => r.moduleId === m.id).length;
    if (rs.length) {
      const c = rs.reduce((s, r) => s + r.correct, 0);
      const t = rs.reduce((s, r) => s + r.total, 0);
      out[m.id].score = t ? c / t : null;
    }
  });
  return out;
}

/**
 * Module le plus faible : priorité aux scores quiz les plus bas ;
 * à défaut de scores, on retient le module dont la maîtrise SRS est la plus faible.
 */
export async function weakestModule() {
  const scores = await moduleScores();
  const withScore = MODULES.filter((m) => scores[m.id].score !== null);
  if (withScore.length) {
    const worst = withScore.reduce((a, b) => (scores[a.id].score <= scores[b.id].score ? a : b));
    return { module: worst, score: scores[worst.id].score, basis: 'quiz' };
  }
  const map = await srsMap();
  let worst = null, worstVal = Infinity;
  for (const m of MODULES) {
    const cards = ALL_CARDS.filter((c) => c.moduleId === m.id);
    const seen = cards.filter((c) => map[c.id]?.last);
    if (!seen.length) continue;
    const v = seen.reduce((s, c) => s + strength(map[c.id]), 0) / seen.length;
    if (v < worstVal) { worstVal = v; worst = m; }
  }
  return worst ? { module: worst, score: worstVal, basis: 'srs' } : null;
}

// ---------------------------------------------------------------- Notes & marque-pages
export const getNote = (refId) => db.get('notes', refId);
export const allNotes = () => db.getAll('notes');

export async function setNote(refId, text, meta = {}) {
  if (!text || !text.trim()) return db.del('notes', refId);
  return db.put('notes', { id: refId, text: text.trim(), updatedAt: Date.now(), ...meta });
}

export const allBookmarks = () => db.getAll('bookmarks');
export const getBookmark = (refId) => db.get('bookmarks', refId);

export async function toggleBookmark(refId, meta = {}) {
  const existing = await db.get('bookmarks', refId);
  if (existing) { await db.del('bookmarks', refId); return false; }
  await db.put('bookmarks', { id: refId, createdAt: Date.now(), ...meta });
  return true;
}

// ---------------------------------------------------------------- Consultations récentes
export async function pushRecent(refId, title, type, href) {
  await db.put('recent', { id: refId, title, type, href, ts: Date.now() });
  const rows = await db.getAll('recent');
  if (rows.length > 40) {
    const old = rows.sort((a, b) => a.ts - b.ts).slice(0, rows.length - 40);
    for (const r of old) await db.del('recent', r.id);
  }
}

export async function recentItems(n = 8) {
  const rows = await db.getAll('recent');
  return rows.sort((a, b) => b.ts - a.ts).slice(0, n);
}

// ---------------------------------------------------------------- Simulateur d'entretien
export async function logInterview(qId, seconds) {
  const prev = await db.get('interview', qId);
  await db.put('interview', {
    id: qId,
    doneCount: (prev?.doneCount || 0) + 1,
    lastSeconds: seconds,
    lastAt: Date.now(),
  });
  await touchStreak();
}

export const interviewLog = () => db.getAll('interview');
