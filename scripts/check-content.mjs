// Contrôle d'intégrité du contenu pédagogique, exécuté avant chaque déploiement.
// Usage : node scripts/check-content.mjs
import { MODULES, STATS, ALL_CARDS, ALL_QUIZ, ALL_GLOSSARY, ALL_INTERVIEW } from '../js/data/index.js';
import { SIMPLE } from '../js/data/simple/index.js';
import LECONS from '../js/data/decouverte.js';

const ids = new Set();
const erreurs = [];

function verifier(liste, type, regle) {
  for (const item of liste) {
    if (!item.id) erreurs.push(`${type} : identifiant manquant`);
    else if (ids.has(item.id)) erreurs.push(`${type} ${item.id} : identifiant en double`);
    ids.add(item.id);
    const probleme = regle(item);
    if (probleme) erreurs.push(`${type} ${item.id} : ${probleme}`);
  }
}

verifier(ALL_CARDS, 'flashcard', (c) => (!c.front || !c.back ? 'recto ou verso vide' : null));
verifier(ALL_QUIZ, 'quiz', (q) => {
  if (!Array.isArray(q.options) || q.options.length < 2) return 'moins de deux options';
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) return 'index de bonne réponse hors bornes';
  if (!q.explain) return 'explication manquante';
  return null;
});
verifier(ALL_GLOSSARY, 'glossaire', (g) => (!g.term || !g.def ? 'terme ou définition vide' : null));
verifier(ALL_INTERVIEW, 'entretien', (q) => (!q.q || !q.answer || !q.seconds ? 'question, trame ou durée manquante' : null));

for (const m of MODULES) {
  if (!m.flashcards?.length || !m.quiz?.length) erreurs.push(`module ${m.id} : contenu incomplet`);
}

// --- Mode « Expliquer simplement » : chaque carte et chaque fiche doit avoir sa version en clair,
// sinon le mode paraît cassé (activé, mais vide pour la moitié du contenu).
const sansSimple = [...ALL_CARDS, ...ALL_GLOSSARY].filter((x) => !SIMPLE[x.id]);
sansSimple.forEach((x) => erreurs.push(`explication simple manquante pour ${x.id}`));

// Les identifiants d'explications simples doivent tous correspondre à un contenu réel.
const idsConnus = new Set([...ALL_CARDS, ...ALL_GLOSSARY, ...ALL_QUIZ, ...ALL_INTERVIEW].map((x) => x.id));
Object.keys(SIMPLE).forEach((id) => {
  if (!idsConnus.has(id)) erreurs.push(`explication simple orpheline : ${id} ne correspond à aucun contenu`);
});

// --- Parcours découverte
LECONS.forEach((l, i) => {
  if (!l.id || !l.title || !l.sections?.length || !l.retenir) erreurs.push(`leçon ${i + 1} incomplète`);
  if (ids.has(l.id)) erreurs.push(`leçon ${l.id} : identifiant en double`);
  ids.add(l.id);
});

console.log(`Modules ${STATS.modules} · flashcards ${STATS.cards} · quiz ${STATS.quiz} · glossaire ${STATS.glossary} · entretien ${STATS.interview}`);
console.log(`Explications « en clair » ${Object.keys(SIMPLE).length} · leçons découverte ${LECONS.length}`);

if (erreurs.length) {
  console.error(`\n${erreurs.length} problème(s) :`);
  erreurs.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
console.log('Contenu valide.');
