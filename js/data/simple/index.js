// Index des explications « en clair », toutes cartes et fiches confondues.
import taux from './taux.js';
import derives from './derives.js';
import fx from './fx.js';
import portefeuille from './portefeuille.js';
import risques from './risques.js';
import reglementaire from './reglementaire.js';
import hull from './hull.js';

export const SIMPLE = {
  ...taux, ...derives, ...fx, ...portefeuille, ...risques, ...reglementaire, ...hull,
};

/** Explication en langage courant d'un élément, ou null s'il n'y en a pas. */
export const simpleFor = (id) => SIMPLE[id] || null;

export const SIMPLE_COUNT = Object.keys(SIMPLE).length;
