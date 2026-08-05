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

**Contenu embarqué dès le premier lancement** : 188 flashcards · 144 questions de quiz ·
124 fiches de glossaire · 58 questions d'entretien.

---

## Fonctionnalités

- **Flashcards à répétition espacée** — algorithme de type SM-2, notation en quatre niveaux
  (« À revoir » / « Difficile » / « Correct » / « Facile ») avec aperçu du prochain intervalle.
- **Quiz QCM par module** — feedback immédiat avec explication, historique des scores dans le temps.
- **Calculateurs** — pricing obligataire (prix, duration, convexité, DV01), Black-Scholes et grecques,
  VaR paramétrique et Expected Shortfall, P&L avec effet de levier, cross de change et taux à terme.
  Chacun affiche **la formule utilisée et le détail des étapes**, pas seulement le résultat.
- **Glossaire** — recherche instantanée (as-you-type, insensible aux accents), fiches denses :
  définition, formule, piège à connaître.
- **Graphiques interactifs** — courbe des taux (normale / plate / inversée / bossue, avec forwards
  implicites), payoff d'options, relation prix-taux avec tangente de duration, frontière efficiente
  avec GMV, portefeuille tangent et CML. SVG généré à la volée, sans librairie externe.
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

1. Poussez le dépôt sur GitHub.
2. Dans le dépôt : **Settings → Pages**.
3. *Source* : **Deploy from a branch**.
4. *Branch* : la branche voulue (par exemple `main`), dossier **`/ (root)`**. Enregistrez.
5. Après une minute, le site est disponible sur `https://<utilisateur>.github.io/<depot>/`.

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

**Après une mise à jour du contenu** : rouvrez l'application en étant connecté ; le service worker
récupère la nouvelle version (un message le signale). Le numéro `CACHE_VERSION` dans `sw.js` doit
être incrémenté à chaque modification pour forcer le rafraîchissement.

---

## Structure du projet

```
index.html              Shell de l'application (barre de navigation, conteneur de vue)
manifest.json           Manifeste PWA (nom, icônes, mode standalone, raccourcis)
sw.js                   Service worker : précache complet, cache-first
.nojekyll               Désactive Jekyll sur GitHub Pages
css/styles.css          Thème sombre, palette bleu marine
icons/                  Icônes 192/512/maskable/apple-touch + source SVG
js/
  app.js                Routeur par hash, enregistrement du service worker
  db.js                 Couche IndexedDB + export/import
  srs.js                Algorithme de répétition espacée (SM-2 adapté)
  store.js              Logique métier : SRS, streak, scores, notes, marque-pages
  ui.js                 Utilitaires d'interface (échappement, formats, toasts)
  data/
    index.js            Agrégation et index du contenu
    taux.js             Module Taux & obligations
    derives.js          Module Actions & dérivés
    fx.js               Module Change / FX
    portefeuille.js     Module Gestion de portefeuille
    risques.js          Module Risques
    reglementaire.js    Module Réglementaire
  views/
    dashboard.js  flashcards.js  quiz.js  calculateurs.js
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

Après modification, incrémentez `CACHE_VERSION` dans `sw.js` pour que les appareils déjà installés
récupèrent la nouvelle version.

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
