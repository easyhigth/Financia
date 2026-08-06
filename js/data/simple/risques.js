// Explications « en clair » — module Risques.

const C = {
  var: "La VaR répond à : « dans une journée normalement mauvaise, je perds combien au maximum ? ». Une VaR de 3 millions à 99 % veut dire : 99 jours sur 100, je perds moins que ça. Le piège énorme : elle ne dit RIEN sur le centième jour. Elle mesure la profondeur habituelle de la rivière, pas la crue.",

  methodesVar: "Trois façons de calculer la même chose. Supposer que tout se comporte gentiment selon une formule (rapide, mais faux dès qu'il y a des options). Rejouer ce qui s'est réellement passé les mille derniers jours (honnête, mais aveugle à ce qui n'est jamais arrivé). Ou simuler des milliers de futurs imaginaires (souple, mais dépend entièrement de la qualité de l'imagination).",

  varParam: "La version la plus rapide : on suppose que les pertes suivent une belle courbe en cloche, on prend l'agitation habituelle, on multiplie par un coefficient et par la taille du portefeuille. Ça tient en une ligne de calcul. Ça marche à peu près en temps normal, et pas du tout pendant les crises.",

  limitesVar: "Quatre défauts à connaître par cœur. Elle ne dit rien de l'ampleur des catastrophes. Elle peut prétendre que diversifier augmente le risque, ce qui est absurde. Elle dépend entièrement du passé qu'on lui donne à manger. Et elle sous-estime systématiquement les événements rares, qui sont pourtant ceux qui tuent.",

  es: "La question suivante, celle qui manquait : « et quand ça dépasse quand même, je perds combien EN MOYENNE ? ». Au lieu de s'arrêter au bord du gouffre, on regarde dedans. C'est pour ça que les régulateurs l'ont adoptée après 2008 : la VaR seule laissait les vraies catastrophes hors du champ.",

  backtesting: "On a promis de ne dépasser la limite que 1 jour sur 100. On vérifie donc, chaque jour, si c'est vrai. Trop de dépassements ? Le modèle ment. Des dépassements groupés sur la même semaine ? Le modèle est trop lent à réagir. C'est le contrôle qualité du gestionnaire de risques, et le régulateur regarde le résultat.",

  stressTest: "La VaR raisonne en probabilités. Le stress test, lui, refuse de parier : il pose simplement « et si la crise de 2008 recommençait demain, il se passe quoi ? ». Pas de statistiques, juste un scénario brutal et son résultat chiffré. Les deux se complètent, l'un ne remplace jamais l'autre.",

  reverseStress: "On prend le problème à l'envers. Au lieu de demander « combien je perds si X arrive ? », on demande « qu'est-ce qui devrait arriver pour que je coule ? ». Ça oblige à imaginer les scénarios auxquels personne n'avait pensé — précisément ceux qui font tomber les entreprises.",

  sensibilitesVsVar: "Les sensibilités disent « si ce truc précis bouge d'un cran, je gagne ou perds tant » — sans dire si c'est probable. La VaR mélange tout et ajoute une probabilité. On a besoin des deux : les sensibilités pour piloter au jour le jour, la VaR pour dimensionner le risque global.",

  elPdLgdEad: "Pour estimer ce que coûte un prêt qui tourne mal, trois questions. Quelle chance que l'emprunteur ne rembourse pas ? Si ça arrive, quelle part je récupère quand même (en revendant la maison, par exemple) ? Et combien me devra-t-il exactement à ce moment-là ? Multiplie les trois : voilà ta perte moyenne attendue.",

  elUl: "Sur mille prêts, tu sais d'avance qu'une poignée tournera mal. Ça, ce n'est pas une surprise, c'est un coût du métier : on le met de côté et on l'intègre au prix. Le vrai danger, c'est l'année où il y en a beaucoup plus que prévu. Pour ça, il faut du capital en réserve. Toute la réglementation bancaire tient dans cette distinction.",

  notations: "Des agences attribuent des notes aux emprunteurs, de AAA (très solide) à D (déjà en défaut). Une chose que les débutants ratent : perdre de l'argent ne demande pas d'attendre la faillite. Il suffit que la note baisse pour que la valeur de ce que tu détiens chute immédiatement.",

  cds: "Une assurance contre la faillite de quelqu'un. Tu paies une prime chaque année ; si l'entreprise tombe, on t'indemnise. Comme ça s'échange librement, le prix de cette assurance devient le thermomètre public de la confiance en cette entreprise — actualisé en temps réel.",

  ccr: "Avec un prêt classique, tu sais exactement combien on te doit. Avec un contrat d'échange, ça dépend de l'évolution des marchés : aujourd'hui ton partenaire te doit un million, demain c'est toi qui lui en dois deux. Le risque n'est pas un montant fixe mais un montant mouvant — beaucoup plus difficile à encadrer.",

  cva: "Un contrat vaut moins si celui qui doit te payer risque de disparaître. La CVA, c'est ce rabais qu'on applique pour tenir compte de ce risque. Comme ce rabais bouge tous les jours avec la santé des partenaires, il crée à son tour des gains et des pertes : un risque né du fait de mesurer un risque.",

  wrongWay: "Le pire assemblage possible : ton assurance grossit exactement quand ton assureur s'affaiblit. Comme t'assurer contre l'incendie auprès de ton voisin de palier — le jour où l'immeuble brûle, il est ruiné aussi. Ça paraît évident dit comme ça, et ça a pourtant coûté des milliards en 2008.",

  concentration: "Beaucoup de modèles supposent que tu détiens un peu de tout. Si en réalité un quart de ton argent est chez le même emprunteur ou dans le même secteur, ces modèles te rassurent à tort. Un seul mauvais événement, et c'est un quart du portefeuille qui part.",

  liquidite: "Deux problèmes différents portent le même nom. Ne pas pouvoir vendre sans brader (mon actif ne trouve pas d'acheteur). Et ne pas avoir de quoi payer demain matin (je manque de liquide). Le second oblige à vendre en catastrophe, ce qui aggrave le premier : c'est la spirale qui transforme une secousse en crise.",

  risqueOp: "Tout ce qui peut mal tourner sans que le marché n'y soit pour rien : une erreur de saisie, un employé malhonnête, une panne informatique, un procès, une inondation. Ce n'est pas glamour, mais ça représente une part énorme des pertes réelles des institutions financières.",

  rcsa: "Une fois par an, chaque équipe fait son propre bilan : qu'est-ce qui peut mal tourner chez nous, à quelle fréquence, avec quelles conséquences, et nos garde-fous tiennent-ils vraiment ? Ceux qui font le travail sont ceux qui le connaissent le mieux. Le service des risques les challenge ensuite, parce que personne n'aime noter sa propre copie sévèrement.",

  kri: "Un voyant d'alerte. La jauge d'essence prévient AVANT la panne — c'est ça, un bon indicateur de risque : il annonce le problème au lieu de le constater. « Trois erreurs ce mois-ci contre zéro d'habitude » doit déclencher une réaction avant que la quatrième ne coûte cher.",

  kriKpiKci: "Trois familles de voyants qu'on confond tout le temps. La performance : ai-je bien fait le travail ? Le risque : suis-je en train de m'exposer à un problème ? Le contrôle : mes garde-fous fonctionnent-ils réellement ? Trois questions distinctes, trois tableaux de bord distincts.",

  cartographie: "La liste organisée de tout ce qui peut mal tourner, activité par activité, avec deux notes : quelle fréquence, quelle gravité. On les place sur une grille et on traite en priorité le coin « fréquent ET grave ». Simple sur le principe, mais ça n'a de valeur que si on la met vraiment à jour.",

  baseIncidents: "Le carnet de bord de tout ce qui a mal tourné — y compris ce qui a failli mal tourner sans conséquence. Contre-intuitif : une entreprise qui déclare beaucoup d'incidents n'est pas mal gérée, c'est souvent l'inverse. Celle qui n'en déclare aucun ne les voit simplement pas.",

  troisLignes: "Trois niveaux de protection. Ceux qui font le travail et gèrent leurs risques au quotidien. Ceux qui fixent les règles et vérifient (le service des risques et la conformité). Et ceux qui vérifient que les deux premiers font correctement leur travail (l'audit). Un stage en gestion des risques, c'est le deuxième niveau : on contrôle, on ne décide pas des investissements.",

  appetit: "Avant de fixer des limites, il faut répondre à une question simple : quel niveau de risque acceptons-nous de prendre, et lequel refusons-nous absolument ? Cette réponse se traduit ensuite en chiffres précis, en alertes et en « qui prévenir quand on dépasse ». Sans cette dernière partie, ce n'est qu'un beau document.",

  risqueModele: "Une formule est une maquette du monde, pas le monde. Si la maquette est fausse, ou utilisée dans une situation pour laquelle elle n'était pas prévue, toutes les décisions qui en découlent sont fausses. D'où des équipes dont le métier est uniquement de vérifier les modèles des autres.",

  valorisation: "Certains placements ont un prix affiché publiquement : facile. D'autres ne s'échangent presque jamais, et leur valeur repose sur un calcul maison. Comme le calcul est fait par ceux qui ont intérêt à ce que ça vaille cher, ces valeurs-là sont vérifiées séparément, et on met de l'argent de côté pour l'incertitude.",

  reglementLivraison: "Tu as acheté des titres, tu as payé, et ils n'arrivent pas à la date prévue. Ça arrive plus souvent qu'on ne le croit, et depuis quelques années ça déclenche des pénalités automatiques. C'est un indicateur suivi de près dans les équipes opérationnelles d'une société de gestion.",

  conduite: "Le risque de mal se comporter envers ses clients ou envers le marché : vendre un produit inadapté, favoriser un client au détriment d'un autre, utiliser une information confidentielle. Les amendes se comptent en milliards, et la réputation abîmée met des années à se reconstruire.",

  contagion: "Les acteurs financiers sont reliés entre eux. Quand l'un tombe, il entraîne ceux qui lui avaient prêté, qui vendent en catastrophe, ce qui fait baisser les prix de tout le monde, ce qui oblige d'autres à vendre... C'est un jeu de dominos, aggravé par le fait que tout le monde utilise les mêmes modèles et détient les mêmes choses.",

  varDecomposition: "Ton risque total, il vient d'où exactement ? On le découpe position par position. Souvent, une seule ligne, qui paraissait modeste, consomme la moitié du budget de risque. Sans cette décomposition, on gère à l'aveugle.",

  racineTemps: "Pour passer d'un risque sur une journée à un risque sur dix jours, on multiplie par la racine de dix, pas par dix. Ça suppose que chaque journée est indépendante de la précédente — ce qui est faux quand une tendance s'installe ou quand tu ne peux plus vendre. Dans ces cas-là, la formule ment, et dans le mauvais sens.",

  esgClimat: "Deux risques différents. Le physique : les inondations et les canicules abîment vraiment des actifs. Et celui de transition : les règles, les technologies et les goûts des clients changent, et certaines entreprises perdent brutalement de la valeur. Le grand défi n'est pas la théorie, c'est de trouver des données fiables.",

  irrbb: "Une banque emprunte à court terme et prête à long terme. Si les taux bougent, l'écart entre ce qu'elle gagne et ce qu'elle paie se déforme. On mesure ça de deux façons : l'effet sur sa valeur globale, et l'effet sur ses revenus de l'année. L'hypothèse la plus délicate : combien de temps les clients laissent-ils leur argent sur leur compte ?",

  volatilites: "Plusieurs façons de mesurer l'agitation. Regarder les derniers mois en donnant le même poids à tous les jours (simple, mais lent à réagir). Donner plus de poids aux jours récents (plus réactif). Ou lire ce que le marché des options anticipe pour le futur. Aucune n'est « la » bonne : elles répondent à des questions différentes.",

  netting: "Si tu me dois 100 et que je te dois 80, on peut se contenter d'un virement de 20 — à condition qu'un juge le reconnaisse en cas de faillite. Ce détail juridique change tout : sans lui, le risque affiché est cinq fois plus gros. D'où des avocats consultés pays par pays.",

  pfe: "Ton exposition à un partenaire n'est pas figée : elle grandit et rétrécit avec les marchés. La PFE répond à « dans le pire des cas raisonnables, jusqu'où peut-elle monter d'ici trois ans ? ». C'est cette projection, et non le montant d'aujourd'hui, qui sert à fixer les limites.",

  prudentValuation: "Quand la valeur d'un actif est incertaine, le régulateur exige de retenir volontairement une estimation prudente plutôt que la plus flatteuse. La différence est retirée des fonds propres de la banque. Une façon de dire : « tant que ce n'est pas vendu, ne comptez pas dessus ».",
};

export default {
  'ris-f01': C.var,
  'ris-f02': C.methodesVar,
  'ris-f03': C.varParam,
  'ris-f04': C.limitesVar,
  'ris-f05': C.es,
  'ris-f06': C.backtesting,
  'ris-f07': C.stressTest,
  'ris-f08': C.reverseStress,
  'ris-f09': C.sensibilitesVsVar,
  'ris-f10': C.elPdLgdEad,
  'ris-f11': C.elUl,
  'ris-f12': C.notations,
  'ris-f13': C.cds,
  'ris-f14': C.ccr,
  'ris-f15': C.cva,
  'ris-f16': C.wrongWay,
  'ris-f17': C.concentration,
  'ris-f18': C.liquidite,
  'ris-f19': C.risqueOp,
  'ris-f20': C.rcsa,
  'ris-f21': C.kri,
  'ris-f22': C.kriKpiKci,
  'ris-f23': C.cartographie,
  'ris-f24': C.baseIncidents,
  'ris-f25': C.troisLignes,
  'ris-f26': C.appetit,
  'ris-f27': C.risqueModele,
  'ris-f28': C.valorisation,
  'ris-f29': C.reglementLivraison,
  'ris-f30': C.conduite,
  'ris-f31': C.contagion,
  'ris-f32': C.varDecomposition,
  'ris-f33': C.racineTemps,
  'ris-f34': C.esgClimat,
  'ris-f35': C.irrbb,
  'ris-f36': C.volatilites,
  // ------- glossaire
  'ris-g01': C.var,
  'ris-g02': C.es,
  'ris-g03': C.backtesting,
  'ris-g04': C.stressTest,
  'ris-g05': C.elUl,
  'ris-g06': C.elPdLgdEad,
  'ris-g07': C.cds,
  'ris-g08': C.pfe,
  'ris-g09': C.cva,
  'ris-g10': C.wrongWay,
  'ris-g11': C.netting,
  'ris-g12': C.rcsa,
  'ris-g13': C.kri,
  'ris-g14': C.cartographie,
  'ris-g15': C.troisLignes,
  'ris-g16': C.appetit,
  'ris-g17': C.risqueModele,
  'ris-g18': C.liquidite,
  'ris-g19': C.varDecomposition,
  'ris-g20': C.volatilites,
  'ris-g21': C.irrbb,
  'ris-g22': C.prudentValuation,
  'ris-g23': C.conduite,
};
