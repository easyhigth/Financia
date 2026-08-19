// Agrégation du contenu pédagogique. Tout est statique et embarqué : aucune requête réseau.
import taux from './taux.js';
import derives from './derives.js';
import fx from './fx.js';
import portefeuille from './portefeuille.js';
import risques from './risques.js';
import reglementaire from './reglementaire.js';
import hull from './hull.js';
import cas from './cas.js';

export const MODULES = [taux, derives, fx, portefeuille, risques, reglementaire, hull, cas];

export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m]));

export const moduleName = (id) => MODULE_BY_ID[id]?.name || id;

/** Toutes les flashcards, enrichies de leur module. */
export const ALL_CARDS = MODULES.flatMap((m) =>
  m.flashcards.map((c) => ({ ...c, moduleId: m.id, moduleName: m.name })));

export const ALL_QUIZ = MODULES.flatMap((m) =>
  m.quiz.map((q) => ({ ...q, moduleId: m.id, moduleName: m.name })));

export const ALL_GLOSSARY = MODULES.flatMap((m) =>
  m.glossary.map((g) => ({ ...g, moduleId: m.id, moduleName: m.name })));

export const ALL_INTERVIEW = MODULES.flatMap((m) =>
  m.interview.map((q) => ({ ...q, moduleId: m.id, moduleName: m.name })));

export const CARD_BY_ID = Object.fromEntries(ALL_CARDS.map((c) => [c.id, c]));
export const GLOSSARY_BY_ID = Object.fromEntries(ALL_GLOSSARY.map((g) => [g.id, g]));

export const STATS = {
  modules: MODULES.length,
  cards: ALL_CARDS.length,
  quiz: ALL_QUIZ.length,
  glossary: ALL_GLOSSARY.length,
  interview: ALL_INTERVIEW.length,
};
