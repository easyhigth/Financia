# Financia — révision finance de marché (PWA)

Application web progressive **100 % personnelle, locale et hors ligne**, en français, pour réviser la
**finance de marché** dans le cadre d'une préparation de stage en **Risk Management** en asset management.

Aucun serveur, aucun compte, aucune donnée transmise : tout est stocké dans le navigateur (IndexedDB).

---

## Périmètre du contenu

Finance de marché uniquement — le corporate finance (M&A, LBO, valorisation d'entreprise, structure de
capital) est volontairement exclu.

| Module | Contenu |
|---|---|
| **Taux & obligations** | Courbe des taux, pricing, duration, convexité, spreads, swaps, repo, carry |
| **Actions & dérivés** | Options, grecques, Black-Scholes, volatilité, futures, stratégies optionnelles |
| **Change / FX** | Cotations, CIP/UIP, forwards et swaps de change, couverture, carry trade |
| **Gestion de portefeuille** | Diversification, frontière efficiente, MEDAF, ratios, allocation, attribution |
| **Risques** | VaR, Expected Shortfall, stress testing, crédit, contrepartie, opérationnel, RCSA, KRI, liquidité |
| **Réglementaire** | Bâle III/IV, FRTB, MiFID II, EMIR, UCITS/AIFM, SFDR, PRIIPs, MAR, CSDR, DORA |
| **Dérivés — approfondissement** | Arbitrage et réplication, arbres binomiaux, évaluation risque-neutre, grecques, stratégies optionnelles |

**Contenu embarqué dès le premier lancement** : 215 flashcards · 162 questions de quiz ·
142 fiches de glossaire · 64 questions d'entretien · 16 leçons de découverte ·
357 explications en langage courant.

Le module d'approfondissement suit la progression de J. C. Hull, *Options, Futures and Other
Derivatives* (11ᵉ éd.), utilisé comme ouvrage de référence. Les explications sont rédigées en propre
et les schémas redessinés ; chaque carte, fiche et outil porte la référence du chapitre
(« Hull ch. 13 ») pour aller lire le détail à la source.

---

## Pour débuter sans aucune base

Le vocabulaire de la finance de marché est un mur pour un non-initié. Deux dispositifs y répondent :

- **Onglet « Bases »** — 12 leçons progressives qui expliquent la finance de marché avec des mots
  de tous les jours, à lire dans l'ordre : à quoi sert un marché, le taux d'intérêt, l'obligation,
  la courbe des taux, l'action, la diversification, les dérivés, les options, la mesure du risque,
  le risque de crédit, le métier de Risk Manager, la réglementation. Chaque leçon se termine par
  un « À retenir » et un mini-lexique des mots qu'on va entendre.
- **Bouton 💡 « Expliquer simplement »** (en haut de l'écran) — une fois activé, **chaque** flashcard
  et **chaque** fiche de glossaire affiche en plus un bloc « En clair » : la même notion racontée
  avec une image du quotidien, sans jargon. Le réglage est mémorisé.
  Sans l'activer, un bouton « 💡 Expliquer simplement » reste disponible au cas par cas.

---

## Fonctionnalités

- **Flashcards à répétition espacée** — algorithme de type SM-2, notation en quatre niveaux
  (« À revoir » / « Difficile » / « Correct » / « Facile ») avec aperçu du prochain intervalle.
- **Quiz QCM par module** — feedback immédiat avec explication, historique des scores dans le temps.
- **Calculateurs** — pricing obligataire (prix, duration, convexité, DV01), Black-Scholes et grecques,
  **arbre binomial** (européen et américain, avec prime d'exercice anticipé et convergence vers
  Black-Scholes), **grecques agrégées d'un portefeuille** et couverture associée,
  VaR paramétrique et Expected Shortfall, P&L avec effet de levier, cross de change et taux à terme.
  Chacun affiche **la formule utilisée et le détail des étapes**, pas seulement le résultat.
- **Glossaire** — recherche instantanée (as-you-type, insensible aux accents), fiches denses :
  définition, formule, piège à connaître.
- **Graphiques interactifs** — courbe des taux (normale / plate / inversée / bossue, avec forwards
  implicites), **arbre binomial cliquable** avec repérage de l'exercice anticipé, **12 stratégies
  optionnelles** (spreads, straddle, butterfly, condor, collar, box…) avec points morts et bornes de
  gain, **profils des quatre grecques** selon le spot et la maturité, payoff d'options, relation
  prix-taux avec tangente de duration, frontière efficiente avec GMV, portefeuille tangent et CML.
  SVG généré à la volée, sans librairie externe.
- **Simulateur d'entretien** — questions ouvertes chronométrées, sans correction automatique,
  avec trame de réponse affichable a posteriori.
- **Notes & marque-pages** — note libre sur n'importe quelle carte, fiche ou question, et marquage
  « à revoir en priorité », regroupés dans une vue dédiée.
- **Dashboard** — cartes dues du jour, série de jours consécutifs, module le plus faible, accès rapides
  et derniers éléments consultés.
- **Export / import JSON** — sauvegarde complète des données utilisateur, restauration en remplacement
  ou en fusion.
- **Hors ligne complet** — service worker avec précache de l'intégralité de l'application.

---

## Déployer sur GitHub Pages

Le projet est entièrement statique : ni build, ni dépendance, ni outillage à maintenir.

### Réglage initial (une seule fois)

1. Dans le dépôt : **Settings → Pages**.
2. *Source* : **GitHub Actions**. C'est tout — rien d'autre à configurer.

Ensuite, **chaque push publie automatiquement le site** via `.github/workflows/deploy.yml`
(branches `main` et `claude/**`). Le workflow :

1. contrôle l'intégrité du contenu (`scripts/check-content.mjs`) et échoue si un identifiant est
   dupliqué ou si un index de bonne réponse est hors bornes ;
2. injecte le SHA du commit dans `sw.js` à la place du marqueur `__BUILD_ID__`, ce qui garantit
   qu'une nouvelle version est détectée par les appareils déjà installés ;
3. publie uniquement les fichiers de l'application (ni `.git`, ni workflow, ni scripts).

L'URL du site s'affiche à la fin du job, dans l'onglet **Actions**, et sous **Settings → Pages**.

> Alternative sans workflow : *Source : Deploy from a branch*, branche voulue, dossier `/ (root)`.
> Dans ce cas l'injection du SHA n'a pas lieu et il faut incrémenter `SW_REVISION` dans `sw.js`
> à chaque modification, sans quoi les appareils déjà installés conservent l'ancienne version.

Tous les chemins sont relatifs (`./js/…`, `./icons/…`), l'application fonctionne donc dans un
sous-répertoire sans configuration supplémentaire. Le fichier `.nojekyll` désactive le traitement Jekyll.

> **HTTPS est nécessaire** pour le service worker et l'installation — GitHub Pages le fournit
> automatiquement. En local, `http://localhost` fonctionne également.

### Test en local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

---

## Installer sur iPhone (écran d'accueil)

1. Ouvrez l'URL du site dans **Safari** — l'installation ne fonctionne pas depuis Chrome ou Firefox sur iOS.
2. Touchez le bouton **Partager** (le carré avec une flèche vers le haut).
3. Faites défiler et choisissez **« Sur l'écran d'accueil »**.
4. Validez avec **Ajouter**.
5. Lancez Financia depuis l'icône : elle s'ouvre en plein écran, sans barre d'adresse, et fonctionne
   **hors ligne** dès que le premier chargement a été effectué.

Sur Android, Chrome propose directement « Installer l'application ».

### Recevoir les mises à jour

Rien à faire de particulier. À l'ouverture de l'application, et à chaque retour au premier plan,
le service worker vérifie discrètement s'il existe une nouvelle version (si le réseau est disponible).
Le cas échéant, elle est téléchargée en arrière-plan et une barre **« Nouvelle version disponible —
Recharger »** apparaît en bas de l'écran. Un tap applique la mise à jour et recharge l'application.

Points importants :

- tant que vous ne tapez pas **Recharger**, l'ancienne version continue de tourner : aucune session
  de révision n'est interrompue en cours de route ;
- vous pouvez fermer la barre (✕), elle réapparaîtra à la prochaine ouverture ;
- sans réseau, rien ne change : l'application fonctionne normalement sur la version installée ;
- **votre progression n'est jamais affectée** — la mise à jour ne touche que le cache des fichiers,
  pas la base IndexedDB qui contient répétition espacée, scores, notes et marque-pages.

---

## Structure du projet

```
index.html              Shell de l'application (barre de navigation, conteneur de vue)
manifest.json           Manifeste PWA (nom, icônes, mode standalone, raccourcis)
sw.js                   Service worker : précache complet, cache-first, mise à jour contrôlée
.nojekyll               Désactive Jekyll sur GitHub Pages
.github/workflows/      Déploiement automatique sur GitHub Pages à chaque push
scripts/check-content.mjs  Contrôle d'intégrité du contenu (exécuté au déploiement)
css/styles.css          Thème sombre, palette bleu marine
icons/                  Icônes 192/512/maskable/apple-touch + source SVG
js/
  app.js                Routeur par hash, enregistrement du service worker
  db.js                 Couche IndexedDB + export/import
  srs.js                Algorithme de répétition espacée (SM-2 adapté)
  store.js              Logique métier : SRS, streak, scores, notes, marque-pages
  ui.js                 Utilitaires d'interface (échappement, formats, toasts)
  settings.js           Réglages d'affichage (mode « Expliquer simplement »)
  lib/bs.js             Briques de calcul partagées : loi normale, Black-Scholes, grecques, arbre binomial
  data/
    index.js            Agrégation et index du contenu
    decouverte.js       Les 12 leçons du parcours « Bases »
    simple/             Explications en langage courant, par module
    taux.js             Module Taux & obligations
    derives.js          Module Actions & dérivés
    fx.js               Module Change / FX
    portefeuille.js     Module Gestion de portefeuille
    risques.js          Module Risques
    reglementaire.js    Module Réglementaire
    hull.js             Module Dérivés — approfondissement
  views/
    dashboard.js  comprendre.js  flashcards.js  quiz.js  calculateurs.js
    glossaire.js  graphiques.js  entretien.js  marques.js  reglages.js
```

**Stack** : HTML/CSS/JavaScript vanilla en modules ES natifs. Pas de framework, pas de bundler,
pas de `node_modules` — un choix délibéré pour une PWA installable et maintenable sur le long terme,
sans chaîne de build à entretenir.

---

## Ajouter ou modifier du contenu

Chaque module est un fichier autonome dans `js/data/`. Les identifiants doivent rester uniques
(ils servent de clés pour la progression enregistrée).

```js
// Flashcard
{ id: 'taux-f36', front: 'Terme ou notion', back: 'Définition', example: 'Exemple concret / piège' }

// Question de quiz — « answer » est l'index de la bonne option
{ id: 'taux-q25', q: 'Question ?', options: ['A', 'B', 'C', 'D'], answer: 2, explain: 'Pourquoi.' }

// Fiche de glossaire
{ id: 'taux-g22', term: 'Terme', def: 'Définition', formula: 'F = …', trap: 'Nuance à connaître.' }

// Question d'entretien — « seconds » = temps conseillé
{ id: 'taux-i11', q: 'Expliquez-moi X.', seconds: 150, answer: 'Trame de réponse attendue.' }
```

Toute nouvelle flashcard ou fiche de glossaire doit aussi recevoir son explication en langage
courant dans `js/data/simple/<module>.js` — le contrôle de contenu échoue si elle manque, pour
éviter qu'une partie de l'application reste muette quand le mode 💡 est activé :

```js
// js/data/simple/taux.js
export default { 'taux-f36': "L'explication avec une image du quotidien, sans jargon." };
```

Après modification, un simple push suffit : le workflow contrôle le contenu, publie le site et
injecte un nouvel identifiant de build dans `sw.js`, ce qui déclenche la proposition de mise à jour
sur les appareils déjà installés. Pour vérifier le contenu en local avant de pousser :

```bash
node scripts/check-content.mjs
```

---

## Données et vie privée

Toutes les données de progression (états de répétition espacée, scores de quiz, notes, marque-pages,
série de révision) sont conservées dans **IndexedDB**, sur l'appareil. Il n'y a ni requête réseau vers
un tiers, ni mesure d'audience, ni synchronisation.

Deux conséquences pratiques :

- effacer les données du site dans le navigateur efface la progression ;
- iOS peut purger le stockage des sites web non utilisés pendant plusieurs semaines — **installer
  l'application sur l'écran d'accueil réduit ce risque**, et un export JSON régulier depuis l'onglet
  Réglages reste la sauvegarde la plus sûre.
