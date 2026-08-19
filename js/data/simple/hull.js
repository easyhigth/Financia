// Explications « en clair » — module Dérivés : approfondissement.

const C = {
  aoa: "Règle numéro un de toute la finance : on ne peut pas gagner d'argent à coup sûr sans rien mettre au départ. Si deux choses rapportent exactement la même chose demain, elles coûtent la même chose aujourd'hui — sinon on achèterait la moins chère et vendrait la plus chère en boucle, gratuitement. C'est cette impossibilité qui fixe le prix de tous les produits dérivés.",

  replication: "Idée géniale et simple : au lieu de deviner ce que vaut une option, on fabrique la même chose soi-même avec des ingrédients de base — des actions et de l'argent. Si ta recette maison donne exactement le même résultat que l'option dans tous les cas de figure, alors l'option vaut le prix des ingrédients. Ni plus, ni moins.",

  arbre1: "On simplifie le monde à l'extrême : demain, l'action ne peut faire que deux choses, monter ou baisser. Avec seulement deux possibilités, on peut construire un mélange d'actions et d'option qui vaut la même somme dans les deux cas. Ce mélange ne risque donc rien, et une chose sans risque doit rapporter le taux sans risque. En remontant le calcul, on obtient le prix de l'option.",

  deltaArbre: "Combien d'actions faut-il détenir pour annuler le risque d'une option vendue ? Réponse : l'écart entre ce que vaut l'option dans les deux cas, divisé par l'écart entre ce que vaut l'action. Ce nombre s'appelle le delta. Ce n'est pas une abstraction de mathématicien : c'est très concrètement le nombre d'actions à acheter.",

  probaRN: "Attention, gros piège de vocabulaire. Ce chiffre ressemble à une probabilité de hausse, mais ce n'en est pas une. C'est un coefficient de calcul, choisi exprès pour que les comptes tombent juste. Personne ne pense que l'action a 55 % de chances de monter — c'est juste le nombre qui fait fonctionner la formule. En entretien, ne dis jamais « probabilité que ça monte ».",

  evalRN: "Le prix d'une option, c'est la moyenne de ce qu'elle rapportera, calculée avec ces coefficients bizarres, puis ramenée à aujourd'hui. Le résultat est exact, alors même que les coefficients ne correspondent à aucune croyance réelle. C'est déroutant la première fois, et c'est pourtant la base de tout le métier.",

  probaDisparait: "Le plus contre-intuitif de toute la théorie : ton avis sur l'avenir de l'action ne change PAS le prix de l'option. Pourquoi ? Parce que ton avis est déjà dans le prix de l'action elle-même, que tu utilises pour fabriquer ta recette. Le réutiliser reviendrait à le compter deux fois. Deux personnes en total désaccord sur une action s'accordent sur le prix de son option.",

  induction: "On raisonne à l'envers, en partant de la fin. Le dernier jour, on sait exactement ce que vaut l'option dans chaque cas. On recule alors d'un cran : que vaut-elle la veille, sachant ce qui peut arriver le lendemain ? Puis encore un cran, jusqu'à aujourd'hui. Comme un jeu de labyrinthe qu'on résout en partant de la sortie.",

  crr: "Deux réglages du modèle. D'abord, l'ampleur des hausses et des baisses est calée sur la nervosité réelle de l'action. Ensuite, on s'arrange pour qu'une hausse suivie d'une baisse ramène exactement au point de départ : sinon, avec 30 étapes, il faudrait calculer plus d'un milliard de cas au lieu de trente et un.",

  americaine: "Certaines options peuvent être utilisées à n'importe quel moment, pas seulement à la fin. Le modèle en tient compte simplement : à chaque étape, on se demande « est-ce que j'ai intérêt à arrêter maintenant, ou à continuer ? » et on garde le meilleur des deux. C'est justement ce que la fameuse formule de Black-Scholes ne sait pas faire.",

  convergence: "Plus on découpe le temps en petits morceaux, plus le résultat du modèle simple se rapproche de celui de la grande formule. Les deux ne sont pas rivaux : c'est la même idée, l'une expliquée pas à pas, l'autre condensée en une ligne. On utilise en général entre 30 et 100 étapes.",

  delta: "Si l'action monte d'un euro, ma position gagne combien ? C'est ça, le delta. Il sert directement à savoir combien d'actions acheter ou vendre pour ne plus dépendre de la direction du marché. Un vendeur d'options qui ne fait pas cela parie sans le savoir.",

  gamma: "Le problème du delta, c'est qu'il ne reste pas en place : il change dès que l'action bouge. Le gamma mesure à quelle vitesse il change. Gros gamma, c'est un volant très nerveux — tu passes ton temps à corriger, et chaque correction coûte des frais. C'est là que la couverture devient chère et fragile.",

  thetaGamma: "Une loi d'équilibre imparable : si ta position profite des mouvements du marché, elle perd de la valeur chaque jour qui passe. Et inversement. Impossible d'avoir les deux. C'est la version financière du « on n'a rien sans rien » — et c'est démontrable, pas seulement un dicton.",

  vega: "La nervosité attendue du marché a un prix, et ce prix bouge tout seul. Tu peux avoir parfaitement neutralisé le risque de direction et perdre gros simplement parce que le climat général est devenu plus calme. Ce risque-là ne se couvre qu'avec d'autres options — acheter ou vendre des actions n'y change rien.",

  neutraliser: "Ordre des opérations, et il n'est pas négociable. Les actions ne servent qu'à corriger une seule chose : la direction. Pour tout le reste, il faut d'autres options. Donc on corrige d'abord avec les options, et on ajuste la direction avec les actions à la toute fin — sinon les options ajoutées déséquilibrent à nouveau ce qu'on venait de régler.",

  coutHedge: "Sur le papier, la fabrication maison de l'option coûte exactement son prix théorique. Dans la vraie vie, on ne peut pas ajuster en permanence : il y a des frais à chaque opération, l'écart entre prix d'achat et de vente, et les jours où le marché saute brutalement sans laisser le temps de réagir. Tout l'art du métier est de doser la fréquence des ajustements.",

  assurancePf: "Stratégie qui consiste à se protéger d'une baisse en vendant automatiquement quand ça descend et rachetant quand ça remonte. Le problème saute aux yeux quand tout le monde le fait en même temps : tout le monde vend pendant la baisse, ce qui accélère la baisse. C'est un des mécanismes qui ont amplifié le krach de 1987.",

  spread: "Tu penses que ça va monter, mais pas énormément. Alors tu achètes une réservation et tu en revends une autre plus haut. La revente paie une partie de ton achat, donc ça te coûte moins cher. En échange, tu renonces au gain si ça s'envole vraiment. Moins cher, mais plafonné.",

  straddle: "Tu es convaincu que ça va bouger fort — annonce de résultats, décision politique — mais tu n'as aucune idée du sens. Tu réserves donc les deux directions à la fois. Tu gagnes si ça bouge beaucoup, peu importe où ; tu perds si tout reste tranquille. Attention : le marché a déjà mis un prix sur l'agitation attendue, il faut bouger PLUS que ça.",

  butterfly: "Un pari sur le fait qu'il ne va rien se passer. On combine plusieurs réservations pour gagner si le prix reste sagement autour de son niveau actuel. Gain limité, perte limitée : c'est une position calme, qui rapporte quand tout le monde s'ennuie.",

  collar: "Tu possèdes des actions et tu veux dormir tranquille. Tu achètes une protection contre la chute, et pour la payer, tu revends une partie de ton potentiel de hausse. Tu ne feras plus fortune, mais tu ne perdras pas ta chemise non plus. C'est ce que font beaucoup de gros investisseurs.",

  calendar: "Deux réservations sur la même chose mais pas pour la même date : on vend la proche et on achète la lointaine. L'idée : la réservation courte perd sa valeur beaucoup plus vite que la longue, et on empoche la différence.",

  box: "Un assemblage de quatre réservations dont le résultat est connu d'avance, quoi qu'il arrive. C'est donc un placement sans risque déguisé, et son prix doit être exactement celui d'un placement sans risque. Piège réel : avec certaines options utilisables à tout moment, la belle mécanique se casse — des particuliers ont perdu beaucoup d'argent sur ce point précis.",

  payoff: "Un diagramme de gain se lit toujours en trois questions. À partir de quel prix je commence à gagner ? Combien puis-je gagner au maximum ? Et surtout : combien puis-je perdre au maximum ? C'est l'écart entre les deux dernières réponses qui dit si la position est raisonnable.",

  bornes: "Avant même de sortir la moindre formule, le simple bon sens borne le prix d'une option : elle ne peut pas valoir plus que l'action elle-même, ni moins que ce qu'elle rapporterait immédiatement. Un prix en dehors de ces bornes serait de l'argent gratuit à ramasser. Ça sert de contrôle rapide : si ton modèle sort un prix hors bornes, il est faux.",

  exerciceAnticipe: "Utiliser sa réservation d'achat en avance, c'est presque toujours idiot : on jette la partie « il peut encore se passer des choses » et on paie plus tôt que nécessaire. Mieux vaut revendre la réservation. En revanche pour une réservation de vente, encaisser l'argent tout de suite et le placer a une vraie valeur — là, ça peut se justifier.",
};

export default {
  'hull-f01': C.aoa,
  'hull-f02': C.replication,
  'hull-f03': C.arbre1,
  'hull-f04': C.deltaArbre,
  'hull-f05': C.probaRN,
  'hull-f06': C.evalRN,
  'hull-f07': C.probaDisparait,
  'hull-f08': C.induction,
  'hull-f09': C.crr,
  'hull-f10': C.americaine,
  'hull-f11': C.convergence,
  'hull-f12': C.delta,
  'hull-f13': C.gamma,
  'hull-f14': C.thetaGamma,
  'hull-f15': C.vega,
  'hull-f16': C.neutraliser,
  'hull-f17': C.coutHedge,
  'hull-f18': C.assurancePf,
  'hull-f19': C.spread,
  'hull-f20': C.straddle,
  'hull-f21': C.butterfly,
  'hull-f22': C.collar,
  'hull-f23': C.calendar,
  'hull-f24': C.box,
  'hull-f25': C.payoff,
  'hull-f26': C.bornes,
  'hull-f27': C.exerciceAnticipe,
  // ------- glossaire
  'hull-g01': C.aoa,
  'hull-g02': C.replication,
  'hull-g03': C.crr,
  'hull-g04': C.probaRN,
  'hull-g05': C.evalRN,
  'hull-g06': C.induction,
  'hull-g07': C.crr,
  'hull-g08': C.delta,
  'hull-g09': C.gamma,
  'hull-g10': C.thetaGamma,
  'hull-g11': C.coutHedge,
  'hull-g12': C.bornes,
  'hull-g13': C.spread,
  'hull-g14': C.straddle,
  'hull-g15': C.butterfly,
  'hull-g16': C.calendar,
  'hull-g17': C.box,
  'hull-g18': C.assurancePf,
};
