// Contrôle d'intégrité du contenu pédagogique, exécuté avant chaque déploiement.
// Usage : node scripts/check-content.mjs
import { MODULES, STATS, ALL_CARDS, ALL_QUIZ, ALL_GLOSSARY, ALL_INTERVIEW } from '../js/data/index.js';

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

console.log(`Modules ${STATS.modules} · flashcards ${STATS.cards} · quiz ${STATS.quiz} · glossaire ${STATS.glossary} · entretien ${STATS.interview}`);

if (erreurs.length) {
  console.error(`\n${erreurs.length} problème(s) :`);
  erreurs.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
console.log('Contenu valide.');
