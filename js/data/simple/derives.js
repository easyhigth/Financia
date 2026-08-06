// Explications « en clair » — module Actions & dérivés.

const C = {
  option: "Une option, c'est une réservation. Tu paies une petite somme aujourd'hui pour avoir le DROIT (pas l'obligation) d'acheter quelque chose à un prix fixé d'avance. Si le prix monte, tu utilises ta réservation et tu fais une bonne affaire. S'il baisse, tu laisses tomber : tu as juste perdu la petite somme. Un « call » = réserver un achat, un « put » = réserver une vente.",

  intrinsequeTemps: "Le prix d'une option se coupe en deux morceaux. Le premier : ce qu'elle rapporterait si tout s'arrêtait maintenant. Le deuxième : ce qu'on paie pour l'espoir que ça bouge encore d'ici la fin. Ce deuxième morceau fond un peu chaque jour, comme un glaçon, et il vaut zéro le dernier jour.",

  parite: "Il existe une relation mathématique obligatoire entre le prix d'une réservation d'achat et celui d'une réservation de vente. Si quelqu'un affiche des prix qui ne la respectent pas, on peut gagner de l'argent à coup sûr, sans risque. Comme personne ne veut offrir de l'argent gratuit, la relation tient toujours.",

  bsHypotheses: "Toute la formule magique de la finance repose sur des hypothèses très arrangeantes : les prix bougent doucement et régulièrement, on peut acheter et vendre sans frais et à tout moment, rien ne saute brutalement. Dans la vraie vie, c'est faux — et c'est exactement pour ça que le métier de gestionnaire de risques existe.",

  bsFormule: "La formule de Black-Scholes calcule combien vaut une réservation. L'idée derrière est astucieuse : si je peux fabriquer la même chose moi-même en achetant et revendant l'action au bon rythme, alors l'option ne peut pas coûter plus cher que ma fabrication maison. Son prix, c'est le coût de la recette.",

  delta: "Si l'action monte d'un euro, de combien monte mon option ? C'est ça, le delta. Un delta de 0,5 veut dire : « je suis à moitié exposé, comme si je détenais une demi-action ». Ça sert directement à savoir combien d'actions acheter pour se protéger.",

  gamma: "Le delta n'est pas fixe : il change quand l'action bouge. Le gamma mesure à quelle vitesse il change. Un gros gamma, c'est un volant très nerveux : tu dois corriger sans arrêt. Ça peut rapporter quand ça bouge beaucoup, mais ça se paie tous les jours.",

  vega: "Le vega mesure la sensibilité à la nervosité du marché. Si tout le monde devient anxieux, les réservations deviennent plus chères — parce qu'un marché agité, c'est plus de chances que ta réservation devienne gagnante. Tu peux gagner de l'argent juste parce que l'ambiance a changé, sans que le prix ait bougé.",

  theta: "C'est le glaçon qui fond. Chaque jour qui passe, ton option perd un peu de valeur, simplement parce qu'il reste moins de temps pour que quelque chose se produise. Celui qui achète subit cette fonte ; celui qui vend l'encaisse. Et ça s'accélère beaucoup dans les derniers jours.",

  rho: "La sensibilité aux taux d'intérêt. C'est en général le paramètre le moins important — sauf quand les taux bougent beaucoup, ou quand la réservation porte sur une période très longue.",

  volImplicite: "Ce n'est pas une prévision, c'est un prix. Quand quelqu'un paie cher une option, il dit implicitement « je m'attends à ce que ça bouge beaucoup ». On traduit ce prix en un chiffre de nervosité attendue. C'est devenu la façon standard de coter les options : on ne discute pas du prix en euros, on discute du niveau de nervosité.",

  skew: "Se protéger d'une chute coûte plus cher que parier sur une hausse. Pourquoi ? Parce que les marchés s'effondrent vite mais montent lentement, et parce que tout le monde veut la même assurance en même temps. Comme une assurance incendie qui coûterait plus cher qu'une assurance beau temps.",

  surfaceVol: "Le niveau de nervosité n'est pas le même selon le prix visé ET selon l'échéance. En mettant tout ça sur un même graphique en relief, on obtient une « surface ». En période calme, la nervosité lointaine est plus élevée ; en pleine panique, c'est l'inverse : c'est maintenant que ça fait peur.",

  deltaHedge: "Tu as vendu une réservation, tu ne veux pas parier sur la direction. Alors tu achètes des actions pour compenser, et tu ajustes cette quantité en permanence. Résultat : tu gagnes si le marché bouge plus que ce que tu avais payé, tu perds s'il bouge moins. Tu ne paries plus sur la direction, mais sur l'agitation.",

  futures: "Un contrat standard, échangé sur une place organisée, pour acheter ou vendre plus tard à un prix fixé aujourd'hui. Particularité : chaque soir, les comptes sont réglés — le perdant du jour paie tout de suite. Ça évite les mauvaises surprises à la fin, mais ça demande d'avoir toujours du liquide sous la main.",

  costOfCarry: "Pourquoi le prix « pour plus tard » diffère-t-il du prix d'aujourd'hui ? Parce que si tu achetais maintenant, tu devrais emprunter l'argent (ça coûte) mais tu toucherais les dividendes (ça rapporte). Le prix futur, c'est simplement le prix d'aujourd'hui plus ces coûts, moins ces gains.",

  contango: "Si le prix « pour plus tard » est plus cher que celui d'aujourd'hui, quelqu'un qui doit renouveler sa position sans arrêt revend bon marché et rachète cher : il perd un peu à chaque fois, comme un abonnement qui grignote. C'est le piège classique des placements sur le pétrole ou les matières premières.",

  base: "Tu veux te protéger, mais l'outil de protection ne correspond jamais exactement à ce que tu possèdes. L'écart entre les deux, c'est la base. Comme mettre une housse de vélo sur une moto : ça couvre l'essentiel, mais il reste des trous — et c'est dans ces trous que naissent les mauvaises surprises.",

  ratioCouverture: "Combien de contrats vendre pour protéger un portefeuille ? Ça dépend de sa taille et de sa nervosité par rapport au marché. Un portefeuille plus nerveux que la moyenne demande davantage de protection. Le calcul tient en une ligne, mais se tromper de sens coûte très cher.",

  equitySwap: "Au lieu d'acheter réellement des actions, tu passes un accord : quelqu'un te verse exactement ce que ces actions auraient rapporté, et tu lui verses des intérêts. Tu as le résultat sans posséder quoi que ce soit. Pratique — mais si ton partenaire fait faillite, tu n'as rien dans les mains.",

  bullSpread: "Tu penses que ça va monter un peu, pas énormément. Alors tu achètes une réservation et tu en revends une autre plus haut : la revente paie une partie de ton achat. Tu dépenses moins, mais tu renonces au gain si ça s'envole vraiment. Un compromis coût/potentiel.",

  straddle: "Tu es sûr que ça va bouger fort, mais tu n'as aucune idée du sens. Alors tu réserves les deux directions à la fois. Tu gagnes si ça bouge beaucoup, peu importe le sens ; tu perds si tout reste calme. C'est la stratégie typique avant l'annonce d'un résultat.",

  collar: "Tu possèdes des actions et tu veux dormir tranquille. Tu achètes une protection contre la chute, et pour la financer tu revends une partie de ton potentiel de hausse. Tu ne gagneras plus de fortune, mais tu ne perdras pas non plus la chemise. Très utilisé par les gros investisseurs.",

  butterfly: "Un pari sur le fait qu'il ne se passera rien. Tu combines plusieurs réservations pour gagner si le prix reste sagement autour de son niveau actuel. Gain limité, perte limitée : c'est une position calme, qui rapporte quand tout le monde s'ennuie.",

  americaine: "Certaines réservations ne s'utilisent qu'à la date prévue (dites « européennes »), d'autres à n'importe quel moment avant (dites « américaines »). Pouvoir choisir vaut toujours au moins autant, jamais moins. Mais en pratique, utiliser sa réservation trop tôt revient souvent à jeter la partie « espoir » de sa valeur.",

  exotiques: "Des options avec des règles particulières : celle qui s'annule si le prix touche un certain seuil, celle qui regarde la moyenne au lieu du prix final, celle qui paie une somme fixe ou rien du tout. Plus la règle est tordue, plus il est difficile de savoir ce que ça vaut vraiment — et plus le risque de se tromper est élevé.",

  risqueModele: "Un modèle est une maquette de la réalité, pas la réalité. Si la maquette est fausse, le prix est faux, et toutes les décisions prises à partir de ce prix sont fausses aussi. D'où un vrai métier : vérifier les modèles des autres, les tester, et mettre de l'argent de côté pour l'incertitude qu'ils ne captent pas.",

  levier: "Avec peu d'argent, les produits dérivés permettent de contrôler beaucoup. C'est comme conduire une voiture bien plus puissante : ça va plus vite, mais l'accident est bien plus grave. Voilà pourquoi on ne regarde jamais combien quelqu'un a investi, mais combien il contrôle.",

  ccp: "Pour éviter que la faillite d'un acteur n'entraîne tous les autres, on met un intermédiaire au milieu de toutes les transactions. Chacun dépose une garantie chez lui, réajustée tous les jours. Le problème se déplace : cet intermédiaire devient tellement central qu'il ne doit surtout jamais tomber.",

  varianceSwap: "Un contrat qui paie uniquement en fonction de l'agitation du marché, sans se soucier de la direction. Attention : les pertes n'augmentent pas de façon régulière mais s'emballent. Vendre ce genre de contrat, c'est ramasser des pièces devant un rouleau compresseur : ça marche longtemps, puis plus du tout.",

  beta: "Le bêta répond à : quand le marché entier monte de 1 %, cette action monte de combien ? Un bêta de 1,3, c'est une action plus nerveuse que la moyenne. Un bêta de 0,7, plus calme. C'est la mesure du risque qu'on ne peut PAS faire disparaître en achetant plein de choses différentes.",

  dividendes: "Une entreprise qui s'apprête à distribuer de l'argent à ses actionnaires vaudra mécaniquement un peu moins juste après. Toutes les réservations d'achat en tiennent compte à l'avance. Du coup, une simple annonce sur les dividendes futurs fait bouger le prix de toutes les options d'un coup.",

  gammaScalping: "Quand tu détiens de la convexité, chaque secousse du marché te force à vendre un peu quand ça monte et racheter un peu quand ça descend. Fait mécaniquement, ça rapporte — à condition que le marché bouge assez pour couvrir ce que tu paies chaque jour en valeur temps.",

  pinRisk: "Le pire scénario le dernier jour : le prix finit pile sur ton seuil. Impossible de savoir si l'acheteur va utiliser sa réservation ou non — et tu peux te réveiller le lendemain avec une position dont tu ne voulais pas.",

  structure: "Un produit vendu au grand public qui mélange une partie très sûre et une partie pari. Le vendeur promet souvent de rendre ton capital, plus une part des gains. À retenir : cette promesse ne vaut que ce que vaut la banque qui la fait, et ces produits sont souvent difficiles à revendre avant la fin.",
};

export default {
  'der-f01': C.option,
  'der-f02': C.intrinsequeTemps,
  'der-f03': C.parite,
  'der-f04': C.bsHypotheses,
  'der-f05': C.bsFormule,
  'der-f06': C.delta,
  'der-f07': C.gamma,
  'der-f08': C.vega,
  'der-f09': C.theta,
  'der-f10': C.rho,
  'der-f11': C.volImplicite,
  'der-f12': C.skew,
  'der-f13': C.surfaceVol,
  'der-f14': C.deltaHedge,
  'der-f15': C.futures,
  'der-f16': C.costOfCarry,
  'der-f17': C.contango,
  'der-f18': C.base,
  'der-f19': C.ratioCouverture,
  'der-f20': C.equitySwap,
  'der-f21': C.bullSpread,
  'der-f22': C.straddle,
  'der-f23': C.collar,
  'der-f24': C.butterfly,
  'der-f25': C.americaine,
  'der-f26': C.exotiques,
  'der-f27': C.risqueModele,
  'der-f28': C.levier,
  'der-f29': C.ccp,
  'der-f30': C.varianceSwap,
  'der-f31': C.beta,
  'der-f32': C.dividendes,
  // ------- glossaire
  'der-g01': C.delta,
  'der-g02': C.gamma,
  'der-g03': C.vega,
  'der-g04': C.theta,
  'der-g05': C.volImplicite,
  'der-g06': C.parite,
  'der-g07': C.skew,
  'der-g08': C.costOfCarry,
  'der-g09': C.contango,
  'der-g10': C.base,
  'der-g11': C.varianceSwap,
  'der-g12': C.exotiques,
  'der-g13': C.exotiques,
  'der-g14': C.ccp,
  'der-g15': C.ccp,
  'der-g16': C.equitySwap,
  'der-g17': C.gammaScalping,
  'der-g18': C.beta,
  'der-g19': C.pinRisk,
  'der-g20': C.structure,
};
