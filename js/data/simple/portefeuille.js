// Explications « en clair » — module Gestion de portefeuille.

const C = {
  rendementPf: "Le gain attendu d'un ensemble de placements, c'est simplement la moyenne des gains attendus de chacun, en tenant compte de la part investie dans chaque. Rien de sorcier ici. Ce qui est beaucoup moins intuitif, c'est le risque : lui, ne se calcule pas en faisant une moyenne.",

  variancePf: "Mélange deux placements et le risque total sera plus petit que la moyenne de leurs risques. Pourquoi ? Parce qu'ils ne baissent pas forcément le même jour. C'est le seul repas gratuit de la finance : tu réduis le risque sans réduire le gain espéré.",

  diversification: "Ne pas mettre tous ses œufs dans le même panier. Plus les placements réagissent différemment aux mêmes événements, plus ça fonctionne. Le piège cruel : pendant les vraies crises, tout baisse en même temps, et cette protection disparaît exactement quand on en aurait le plus besoin.",

  systematiqueSpecifique: "Il y a deux risques dans une action. Celui qui lui est propre (l'usine brûle, le patron démissionne) : il disparaît si tu détiens beaucoup d'entreprises différentes. Et celui du marché entier (une crise, une guerre) : celui-là, tu ne peux pas y échapper. Comme personne ne te paie pour un risque que tu pouvais éviter gratuitement, seul le second est récompensé.",

  frontiere: "Dessine tous les mélanges possibles de placements, avec le risque en abscisse et le gain espéré en ordonnée. Certains mélanges sont bêtes : même risque, mais moins de gain. Élimine-les, il reste une courbe : les meilleurs mélanges possibles. C'est ça, la frontière efficiente.",

  gmv: "Le mélange le moins risqué de tous, tout à gauche de la courbe. Son gros avantage : pour le calculer, tu n'as pas besoin de deviner les gains futurs — or deviner les gains futurs, personne ne sait le faire. C'est pour ça qu'il donne des résultats plus solides en pratique.",

  cml: "Si tu peux aussi placer une partie de ton argent sans aucun risque, tout devient plus simple : tu mélanges du « sans risque » avec UN seul portefeuille risqué, et tu ajustes les proportions selon ton tempérament. Prudent : beaucoup de sans-risque. Audacieux : l'inverse.",

  separation: "Conséquence directe : tout le monde devrait détenir le même panier d'actifs risqués, et ne faire varier que la dose. Le choix des placements et le choix du niveau de risque sont deux décisions séparées. C'est la base de l'approche « un socle solide + quelques satellites ».",

  medaf: "Le modèle qui dit combien un placement devrait rapporter. La logique : tu es payé pour le risque que tu ne pouvais pas éviter, point. Un placement deux fois plus sensible au marché doit rapporter deux fois la prime du marché. Le modèle est simpliste, mais c'est le langage commun de toute la profession.",

  smlCml: "Deux droites qui se ressemblent mais ne disent pas la même chose. L'une juge les portefeuilles bien construits en fonction de leur risque TOTAL. L'autre juge n'importe quel placement en fonction de son seul risque de marché. Un placement peut être correctement valorisé par la seconde tout en étant un mauvais choix selon la première.",

  alpha: "La partie de la performance qu'on ne peut pas expliquer par la simple prise de risque. Autrement dit : le gérant a-t-il vraiment apporté quelque chose, ou a-t-il juste appuyé plus fort sur l'accélérateur ? Souvent, un alpha qui semble brillant n'est qu'un risque caché qu'on n'avait pas mesuré.",

  sharpe: "Combien tu gagnes en plus du sans-risque, divisé par les émotions que ça t'a coûté. Ça permet de comparer un placement calme et un placement agité sur la même échelle. Un défaut connu : il flatte les stratégies qui rapportent tranquillement pendant des années avant de tout perdre d'un coup.",

  treynor: "Même idée que le précédent, mais divisé par la seule sensibilité au marché. On l'utilise quand le placement n'est qu'une brique parmi d'autres : dans ce cas, son risque propre est déjà dilué par le reste, et seule sa sensibilité au marché compte encore.",

  informationRatio: "Quand un gérant doit battre un indice de référence, on mesure de combien il le bat, divisé par l'ampleur de ses écarts par rapport à cet indice. Ça répond à : « prend-il des paris intelligents, ou juste beaucoup de paris ? ».",

  trackingError: "De combien un fonds s'écarte de son indice de référence. Presque zéro pour un fonds qui copie l'indice. Beaucoup plus pour un gérant qui fait ses propres choix. C'est une limite très surveillée : dépasser sa marge de manœuvre autorisée déclenche une alerte.",

  sortino: "Une variante du Sharpe qui ne compte que les mauvaises surprises. La logique est de bon sens : personne ne se plaint quand ça monte plus vite que prévu. Ne mesurer que la douleur est plus proche de ce que ressent vraiment un investisseur.",

  drawdown: "La pire dégringolade vécue : la chute entre le meilleur moment et le pire qui a suivi. C'est le chiffre que tout le monde comprend immédiatement, parce qu'il correspond à ce qu'on a réellement encaissé — contrairement à des moyennes qui ne font mal à personne.",

  saaTaa: "Deux niveaux de décision. Le grand plan sur dix ans : combien en actions, combien en obligations — c'est ce qui explique l'essentiel du résultat final. Et les petits ajustements de court terme autour de ce plan, quand on a une conviction. Le second ne doit jamais faire dérailler le premier.",

  rebalancement: "Ton plan prévoyait moitié-moitié. Les actions ont bien monté : tu es maintenant à 60/40, donc plus risqué que voulu, sans l'avoir décidé. Rebalancer, c'est revendre ce qui a monté pour racheter le reste. C'est désagréable psychologiquement, et c'est exactement pour ça que ça marche.",

  contributionRisque: "Un portefeuille 60 % actions / 40 % obligations semble équilibré. En réalité, comme les actions bougent trois fois plus, elles représentent environ 90 % du risque réel. Le partage de l'argent et le partage du risque n'ont presque rien à voir — c'est la découverte qui surprend le plus les débutants.",

  riskParity: "Puisque partager l'argent équitablement ne partage pas le risque équitablement, partageons directement le risque. Ça oblige à emprunter pour renforcer les placements calmes. Ça a très bien marché... jusqu'en 2022, où actions et obligations ont chuté ensemble et où l'emprunt a amplifié les dégâts.",

  factoriels: "Plutôt que d'expliquer la performance par le seul marché, on identifie des familles : les petites entreprises, les entreprises bon marché, celles qui montent déjà. Beaucoup de gérants « géniaux » n'étaient en fait exposés qu'à l'une de ces familles — ce qu'on peut acheter pour bien moins cher.",

  brinson: "Un gérant a battu son indice : grâce à quoi ? Parce qu'il a misé sur les bons secteurs (la vision d'ensemble), ou parce qu'il a choisi les bonnes entreprises dans chaque secteur (le travail de détail) ? Cette décomposition dit si le talent est là où le gérant prétend qu'il est.",

  erreurEstimation: "Les outils d'optimisation demandent de prévoir les gains futurs. Or on prévoit très mal. Et le pire, c'est que la machine amplifie les erreurs : une prévision légèrement trop optimiste et elle met 90 % de l'argent au même endroit. On l'a surnommée « la machine à maximiser les erreurs ».",

  blackLitterman: "Une façon plus sage de procéder. On part de ce que le marché pense déjà collectivement, puis on ajuste seulement là où on a une vraie conviction, en pondérant selon sa confiance. Résultat : des portefeuilles raisonnables au lieu des propositions absurdes de la machine brute.",

  passifActif: "Copier l'indice, c'est peu cher et ça donne exactement la performance du marché. Essayer de faire mieux coûte plus cher et ne réussit pas toujours. Le raisonnement gênant : la moyenne de tous les investisseurs EST le marché, donc collectivement, après frais, la gestion active perd forcément.",

  liquidite: "Un placement peut valoir 100 sur le papier mais n'être vendable qu'à 80 si tu es pressé — ou pas vendable du tout. C'est ce qui a forcé certains fonds à fermer leurs portes, empêchant les clients de récupérer leur argent. On mesure donc combien du portefeuille est réellement vendable en un jour, en une semaine.",

  risqueRelatif: "Quand ton travail est de battre un indice, ne rien détenir est aussi un pari. Si un secteur pèse 15 % de l'indice et que tu n'en as pas une seule action, tu paries lourdement contre lui — souvent sans t'en rendre compte. Le vrai risque n'est pas de perdre de l'argent, c'est de s'écarter de la référence.",

  coutsTransaction: "Acheter et vendre coûte plus cher que les frais affichés. Il y a l'écart entre le prix d'achat et de vente, le fait que ton propre gros ordre fasse bouger le prix contre toi, et les occasions manquées pendant que tu hésites. Mis bout à bout, ça mange une part sérieuse de la performance.",

  horizonAlm: "Si tu dois verser des retraites dans trente ans, garder de l'argent sur un compte n'est PAS sans risque : tu n'es pas sûr de pouvoir tenir la promesse. Le vrai « sans risque » dépend de ce que tu dois, à qui, et quand. On raisonne alors sur l'écart entre ce qu'on possède et ce qu'on doit.",
};

export default {
  'pf-f01': C.rendementPf,
  'pf-f02': C.variancePf,
  'pf-f03': C.diversification,
  'pf-f04': C.systematiqueSpecifique,
  'pf-f05': C.frontiere,
  'pf-f06': C.gmv,
  'pf-f07': C.cml,
  'pf-f08': C.separation,
  'pf-f09': C.medaf,
  'pf-f10': C.smlCml,
  'pf-f11': C.alpha,
  'pf-f12': C.sharpe,
  'pf-f13': C.treynor,
  'pf-f14': C.informationRatio,
  'pf-f15': C.trackingError,
  'pf-f16': C.sortino,
  'pf-f17': C.drawdown,
  'pf-f18': C.saaTaa,
  'pf-f19': C.rebalancement,
  'pf-f20': C.contributionRisque,
  'pf-f21': C.riskParity,
  'pf-f22': C.factoriels,
  'pf-f23': C.brinson,
  'pf-f24': C.erreurEstimation,
  'pf-f25': C.blackLitterman,
  'pf-f26': C.passifActif,
  'pf-f27': C.liquidite,
  'pf-f28': C.risqueRelatif,
  'pf-f29': C.coutsTransaction,
  'pf-f30': C.horizonAlm,
  // ------- glossaire
  'pf-g01': C.frontiere,
  'pf-g02': C.medaf,
  'pf-g03': C.systematiqueSpecifique,
  'pf-g04': C.sharpe,
  'pf-g05': C.treynor,
  'pf-g06': C.informationRatio,
  'pf-g07': C.alpha,
  'pf-g08': C.trackingError,
  'pf-g09': C.sortino,
  'pf-g10': C.drawdown,
  'pf-g11': C.contributionRisque,
  'pf-g12': C.riskParity,
  'pf-g13': C.saaTaa,
  'pf-g14': C.blackLitterman,
  'pf-g15': C.brinson,
  'pf-g16': C.factoriels,
  'pf-g17': C.erreurEstimation,
  'pf-g18': C.horizonAlm,
  'pf-g19': C.liquidite,
  'pf-g20': C.coutsTransaction,
};
