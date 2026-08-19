// Explications « en clair » — module Cas réels.

const C = {
  barings: "Un employé d'une banque anglaise très ancienne pariait sur la bourse japonaise et cachait ses pertes dans un tiroir comptable prévu pour les erreurs. Le problème n'était pas qu'il joue : c'est qu'il était à la fois le joueur ET l'arbitre. Personne d'autre ne vérifiait ses comptes. Un tremblement de terre au Japon a fait chuter la bourse, la banque n'a pas survécu et a été vendue pour une livre.",

  baringsLecon: "Règle absolue depuis : celui qui prend les risques ne peut jamais être celui qui les vérifie. Comme dans un magasin, celui qui tient la caisse ne fait pas les comptes du soir tout seul. Ça paraît évident, ça ne l'était pas encore en 1995 dans certaines succursales lointaines.",

  metall: "Une entreprise avait promis de livrer du pétrole à prix fixe pendant dix ans. Pour se protéger, elle achetait des contrats courts qu'elle renouvelait sans arrêt. Sur le papier, le calcul tenait. Le problème : elle devait payer des sommes énormes TOUT DE SUITE à chaque renouvellement, alors que ses gains n'arrivaient que dans dix ans. Elle avait raison, mais elle n'avait plus d'argent en caisse pour attendre.",

  metallLecon: "Avoir raison à la fin ne sert à rien si on fait faillite avant. Une protection financière crée des besoins de trésorerie immédiats qu'il faut anticiper. C'est exactement ce qui a fait tomber les fonds de retraite britanniques en 2022 — trente ans plus tard, la même erreur.",

  ltcmStrategie: "Un fonds dirigé par les plus grands noms de la finance, dont deux prix Nobel. Leur idée : repérer deux placements presque identiques dont les prix se sont écartés anormalement, et parier qu'ils vont se rejoindre. Les écarts étaient minuscules, alors ils empruntaient vingt-cinq fois leur capital pour que ça rapporte.",

  ltcmChute: "En 1998, la Russie fait défaut. Tout le monde se rue vers les placements sûrs, et les écarts sur lesquels ils pariaient s'élargissent au lieu de se réduire. Toutes leurs positions perdent en même temps, parce qu'en réalité elles étaient toutes le même pari déguisé. Et comme le fonds était énorme, impossible de sortir sans écraser les prix. Il a fallu que la banque centrale américaine réunisse quatorze banques pour éviter la contagion.",

  ltcmLecons: "Quatre leçons qui reviennent partout. Emprunter beaucoup transforme une mauvaise semaine en faillite. Des placements qui semblent différents peuvent cacher un pari unique. Une position trop grosse pour le marché ne se revend pas. Et un modèle bâti sur des années calmes ne sait rien des années de crise.",

  orange: "Le trésorier d'un comté américain gérait l'argent public — écoles, routes, pompiers. Au lieu de le placer prudemment, il a parié à crédit que les taux d'intérêt resteraient bas. Ils ont monté toute l'année 1994. Le comté a fait faillite. Personne au-dessus de lui n'avait compris ce qu'il achetait vraiment.",

  amaranth: "Un opérateur avait accumulé sur le gaz naturel une position tellement énorme qu'elle représentait plusieurs fois ce qui s'échange en une journée. Tant que le marché allait dans son sens, tout allait bien. Le jour où il a voulu sortir, il n'y avait personne en face : chaque tentative de vente faisait tomber le prix contre lui. Environ 6 milliards partis en quelques semaines.",

  socgen: "Un opérateur français a pris des paris gigantesques sans autorisation — l'équivalent du bilan entier de certaines banques — en saisissant de fausses opérations en sens inverse pour que ça paraisse équilibré. Détail décisif : il avait travaillé au service des contrôles et savait exactement quand et comment ils étaient faits.",

  socgenLecons: "Les parades sont étonnamment simples. Vérifier les paris bruts et pas seulement le solde. Confirmer chaque opération auprès de la contrepartie — une opération inventée n'a personne en face. Imposer des vacances : une tricherie qui demande une retouche quotidienne ne survit pas à deux semaines d'absence.",

  subprimeChaine: "On prêtait à des gens qui ne pouvaient pas rembourser, on regroupait ces prêts en paquets, on découpait les paquets en tranches, on revendait les tranches, et on recommençait avec les morceaux. À chaque étage, celui qui vendait se débarrassait du risque. Résultat : à la fin, plus personne ne savait qui portait quoi.",

  subprimeModele: "L'erreur technique centrale. Les calculs supposaient que les propriétaires ne feraient pas faillite tous en même temps — hypothèse vérifiée tant que les prix de l'immobilier montaient partout. Quand ils ont baissé partout à la fois, tout le monde a fait défaut ensemble, et les tranches réputées les plus sûres ont été touchées. La sécurité venait d'une supposition, pas d'une garantie.",

  subprimeLecons: "Ne jamais sous-traiter son jugement à une note attribuée par quelqu'un d'autre. Se méfier des produits dont la valeur dépend d'un chiffre que personne ne peut observer. Vérifier que chacun, dans la chaîne, a intérêt à bien faire son travail. Et tester ses modèles dans des situations qu'ils n'ont jamais connues.",

  whale: "Une équipe d'une grande banque américaine avait bâti un portefeuille si gros que les autres opérateurs le voyaient venir et se plaçaient contre. Perte d'environ 6 milliards. Mais le plus inquiétant est ailleurs : peu avant, un nouveau modèle de calcul avait divisé par deux le risque affiché — sans que les positions changent d'un iota.",

  whaleLecon: "Quand un chiffre de risque baisse alors que rien n'a bougé dans le portefeuille, ce n'est pas une bonne nouvelle : c'est une alerte. Tout changement de méthode de calcul doit être validé par des gens qui n'ont pas intérêt au résultat.",

  archegos: "Un investisseur avait pris d'énormes paris sur quelques actions, mais en passant par plusieurs banques différentes et par des contrats qui ne l'obligeaient pas à se déclarer. Chaque banque voyait sa petite partie et trouvait ça raisonnable. Aucune ne voyait le total. Quand les actions ont chuté, il n'a pas pu payer : environ 10 milliards de pertes réparties entre les banques.",

  archegosLecons: "Exiger de savoir combien un client doit AILLEURS, pas seulement chez soi. Demander plus de garanties quand tout est concentré sur quelques titres. Et ne jamais laisser l'envie de garder un bon client dicter le niveau de sécurité — c'est exactement comme ça que les garde-fous ont cédé.",

  knight: "Une société de courtage a installé une mise à jour informatique de travers. Un vieux programme oublié s'est réveillé et a passé des ordres absurdes pendant quarante-cinq minutes. Perte : 440 millions, plus que ce que valait l'entreprise. Aucun pari, aucune spéculation — juste un déploiement raté.",

  filRouge: "Aucune de ces catastrophes n'est due à des maths trop compliquées. On retrouve toujours les mêmes ingrédients : trop emprunté, trop concentré au même endroit, pas assez d'argent en caisse au bon moment, des contrôles qu'on peut contourner, ou un modèle utilisé dans une situation pour laquelle il n'était pas prévu. Souvent plusieurs à la fois.",

  regulateur: "Chaque grande règle actuelle est née d'un accident précis. Les contrôles internes viennent de Barings et de la Société Générale, les règles sur l'endettement de LTCM, presque tout Bâle III de 2008, et le durcissement des garanties sur dérivés d'Archegos. Apprendre la réglementation comme une liste d'accidents est infiniment plus efficace que d'apprendre des articles par cœur.",

  raconter: "En entretien, ne récite pas cinq affaires en surface. Prends-en une seule et déroule : le contexte en une phrase, comment la perte s'est produite exactement, quel contrôle a manqué, et ce que tu ferais autrement. Deux minutes bien construites valent mieux qu'un catalogue, et ça montre que tu as compris au lieu d'avoir lu.",
};

export default {
  'cas-f01': C.barings,
  'cas-f02': C.baringsLecon,
  'cas-f03': C.metall,
  'cas-f04': C.metallLecon,
  'cas-f05': C.ltcmStrategie,
  'cas-f06': C.ltcmChute,
  'cas-f07': C.ltcmLecons,
  'cas-f08': C.orange,
  'cas-f09': C.amaranth,
  'cas-f10': C.socgen,
  'cas-f11': C.socgenLecons,
  'cas-f12': C.subprimeChaine,
  'cas-f13': C.subprimeModele,
  'cas-f14': C.subprimeLecons,
  'cas-f15': C.whale,
  'cas-f16': C.whaleLecon,
  'cas-f17': C.archegos,
  'cas-f18': C.archegosLecons,
  'cas-f19': C.knight,
  'cas-f20': C.filRouge,
  'cas-f21': C.regulateur,
  'cas-f22': C.raconter,
  // ------- glossaire
  'cas-g01': C.socgen,
  'cas-g02': C.metall,
  'cas-g03': C.ltcmStrategie,
  'cas-g04': C.amaranth,
  'cas-g05': C.subprimeChaine,
  'cas-g06': C.subprimeModele,
  'cas-g07': C.whaleLecon,
  'cas-g08': C.archegos,
  'cas-g09': C.filRouge,
  'cas-g10': C.knight,
};
