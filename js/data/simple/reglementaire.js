// Explications « en clair » — module Réglementaire.

const C = {
  piliers: "Les règles bancaires mondiales tiennent sur trois pieds. Le premier : un minimum d'argent de côté, calculé par une formule identique pour tous. Le deuxième : le superviseur regarde ta situation particulière et peut exiger davantage. Le troisième : tu publies tes chiffres, pour que tout le monde puisse juger. Contrainte, surveillance, transparence.",

  cet1: "Combien d'argent vraiment solide une banque doit-elle garder par rapport aux risques qu'elle prend ? Il y a un minimum, puis des couches supplémentaires empilées par-dessus. Descendre en dessous n'entraîne pas la fermeture, mais interdit de verser des dividendes ou des bonus — une sanction très dissuasive.",

  rwa: "Prêter à un État très solide et prêter à une start-up fragile, ce n'est pas le même risque. Alors on pondère : chaque prêt compte plus ou moins selon sa dangerosité. Le total obtenu sert de base au calcul des réserves. Tout le débat porte sur qui décide de ces pondérations.",

  levier: "Une règle volontairement bête, sans aucune pondération : quel que soit le risque affiché, ne dépasse pas tant de fois tes fonds propres. Pourquoi cette rusticité ? Parce qu'avant 2008, des banques affichaient de superbes ratios pondérés tout en étant terriblement fragiles. C'est le garde-fou du garde-fou.",

  lcr: "Une banque doit pouvoir tenir un mois entier si tous ses clients se mettent à retirer leur argent en même temps. On vérifie donc qu'elle détient assez de placements immédiatement revendables pour encaisser ce choc. C'est la réponse directe aux files d'attente devant les guichets qu'on a vues en 2008.",

  nsfr: "Complément du précédent, mais sur un an. L'idée : si tu prêtes pour vingt ans, ne finance pas ça avec de l'argent qui peut repartir demain matin. Ça limite le grand écart entre la durée de ce qu'on prête et celle de ce qu'on emprunte.",

  frtb: "La grande réforme du calcul des risques de marché après 2008. Elle remplace la mesure qui s'arrêtait au bord du gouffre par celle qui regarde dedans, tient compte du fait que certains actifs prennent des semaines à vendre, et surtout : chaque équipe doit prouver individuellement que son modèle fonctionne, sinon elle repasse à la formule standard, plus coûteuse.",

  outputFloor: "Les banques qui calculent leurs risques avec leurs propres modèles trouvaient toujours des chiffres plus flatteurs que la formule officielle. Nouvelle règle : ton résultat ne peut pas descendre en dessous d'environ trois quarts de ce que donnerait la formule standard. Un plancher, pour limiter l'optimisme.",

  icaap: "Au-delà des formules imposées, chaque banque doit faire son propre examen de conscience : compte tenu de MES activités particulières, ai-je assez d'argent de côté ? Et assez de liquidités ? Le superviseur lit ces travaux, les note, et peut exiger un supplément.",

  mifid: "Le grand texte européen qui encadre la vente de produits financiers. Objectif : que le client comprenne ce qu'il achète, connaisse tous les frais, obtienne le meilleur traitement possible, et qu'on ne lui vende pas un produit compliqué s'il n'est pas capable d'en mesurer les risques.",

  bestExecution: "Quand tu passes un ordre pour un client, tu dois chercher le meilleur résultat possible — et le prouver. Attention, ce n'est pas seulement le meilleur prix : la rapidité, la certitude que l'ordre passe vraiment, et la taille comptent aussi. Il faut une politique écrite et des vérifications régulières.",

  marcheCible: "Avant de vendre un produit, on définit à qui il est destiné — et surtout à qui il ne l'est PAS. Un produit compliqué à effet de levier ne doit pas se retrouver chez un particulier qui cherche à placer son épargne tranquillement. Le fabricant et le vendeur doivent se parler tout au long de la vie du produit.",

  adequation: "Deux niveaux de vérification selon ce que tu fais pour le client. Si tu le conseilles ou gères son argent : tu dois tout vérifier — ses connaissances, sa situation, ses objectifs. S'il passe ses ordres lui-même sur un produit compliqué : tu vérifies juste qu'il comprend de quoi il s'agit.",

  recherche: "Avant, les banques offraient leurs analyses financières « gratuitement » aux gérants, en échange de quoi ceux-ci leur passaient leurs ordres. Conflit d'intérêts évident, payé par le client final sans qu'il le sache. Depuis, tout doit être facturé séparément — la transparence a fait chuter les budgets d'analyse.",

  emir: "Après 2008, on a réalisé que personne ne savait qui devait quoi à qui sur les contrats d'échange. Nouvelles règles : les contrats standards passent par un intermédiaire central, les autres exigent des garanties déposées, et tout doit être déclaré. Conséquence pratique : il faut en permanence du liquide disponible pour ces garanties.",

  ucits: "Le label européen des fonds destinés au grand public. Il impose des règles de bon sens : ne pas tout mettre chez le même émetteur, ne pas s'endetter à outrance, ne détenir que des actifs revendables. C'est ce qui permet de vendre un fonds français en Allemagne sans refaire toutes les démarches.",

  expositionGlobale: "Un fonds grand public n'a pas le droit d'utiliser les produits dérivés pour doubler ou tripler ses paris à l'infini. Deux méthodes de mesure sont acceptées, avec un plafond dans les deux cas. C'est vérifié tous les jours, et un dépassement doit être signalé et corrigé.",

  aifm: "L'équivalent pour les fonds réservés aux investisseurs professionnels, moins encadrés dans leurs choix mais très surveillés dans leur organisation. C'est ce texte qui impose qu'un service de gestion des risques existe et soit indépendant de ceux qui décident des investissements — la base du métier.",

  depositaire: "Une société extérieure garde physiquement les titres du fonds et vérifie que le gérant respecte ses propres règles. Pourquoi ? Parce que si l'argent et sa surveillance sont dans les mêmes mains, on obtient l'affaire Madoff : des relevés inventés pendant des années sans que personne ne vérifie l'existence réelle des actifs.",

  sfdr: "Le classement européen des fonds selon leur ambition écologique et sociale : ceux qui n'en revendiquent aucune, ceux qui mettent en avant certaines qualités, et ceux dont c'est l'objectif central. Le risque associé est simple : annoncer plus vert qu'on ne l'est vraiment, ce qui se paie en amende et en réputation.",

  priips: "Une fiche standardisée de trois pages maximum, obligatoire avant d'acheter, avec une note de risque de 1 à 7, des scénarios de gains et de pertes, et le total des frais. L'idée est bonne ; l'exécution a été critiquée, parce que des scénarios calculés sur un passé favorable donnaient des promesses trompeuses.",

  mar: "Interdiction d'utiliser une information confidentielle pour gagner de l'argent, de la refiler à un ami, ou de manipuler les prix. Concrètement, dans une société de gestion : la liste de qui sait quoi, la surveillance des transactions personnelles des employés, et l'obligation de signaler tout comportement suspect.",

  csdr: "Quand un échange de titres ne se termine pas à la date prévue, une pénalité tombe automatiquement chaque jour de retard. Un peu comme les frais de retard d'une bibliothèque. C'est devenu un indicateur suivi de très près par les équipes qui traitent les opérations.",

  dora: "Depuis 2025, les acteurs financiers doivent prouver qu'ils résistent aux pannes informatiques et aux cyberattaques : tests réguliers, déclaration des incidents graves, et surveillance de leurs prestataires. Nouveauté importante : dépendre massivement d'un grand fournisseur de cloud est désormais reconnu comme un risque à part entière.",

  solva2: "L'équivalent de Bâle mais pour les assureurs. Grosse différence de philosophie : une banque se demande ce qu'elle risque en dix jours, un assureur ce qu'il risque sur un an entier. Ça explique pourquoi les deux mondes ne raisonnent pas pareil et n'achètent pas les mêmes placements.",

  remuneration: "Si un trader touche un énorme bonus en décembre pour des paris qui exploseront dans trois ans, il a intérêt à prendre des risques démesurés. D'où les règles : une partie du bonus est versée bien plus tard, et peut être reprise si les résultats se dégradent. Aligner l'horizon de la récompense sur celui du risque.",

  reporting: "Les fonds et les banques envoient régulièrement des rapports détaillés aux autorités : positions, endettement, liquidité, durabilité. C'est massif, très technique, et c'est un vrai risque en soi — un retard ou une erreur de chiffre est un manquement réglementaire, avec un indicateur de suivi dédié.",

  independance: "La règle qui définit le métier : celui qui mesure et surveille les risques ne doit pas dépendre de celui qui les prend. Un gestionnaire de risques doit pouvoir dire « non » sans que sa carrière en dépende, et pouvoir alerter directement la direction. Sans cette indépendance, le contrôle n'est que du théâtre.",
};

export default {
  'reg-f01': C.piliers,
  'reg-f02': C.cet1,
  'reg-f03': C.rwa,
  'reg-f04': C.levier,
  'reg-f05': C.lcr,
  'reg-f06': C.nsfr,
  'reg-f07': C.frtb,
  'reg-f08': C.outputFloor,
  'reg-f09': C.icaap,
  'reg-f10': C.mifid,
  'reg-f11': C.bestExecution,
  'reg-f12': C.marcheCible,
  'reg-f13': C.adequation,
  'reg-f14': C.recherche,
  'reg-f15': C.emir,
  'reg-f16': C.ucits,
  'reg-f17': C.expositionGlobale,
  'reg-f18': C.aifm,
  'reg-f19': C.depositaire,
  'reg-f20': C.sfdr,
  'reg-f21': C.priips,
  'reg-f22': C.mar,
  'reg-f23': C.csdr,
  'reg-f24': C.dora,
  'reg-f25': C.solva2,
  'reg-f26': C.remuneration,
  'reg-f27': C.reporting,
  'reg-f28': C.independance,
  // ------- glossaire
  'reg-g01': C.piliers,
  'reg-g02': C.rwa,
  'reg-g03': C.levier,
  'reg-g04': C.lcr,
  'reg-g05': C.nsfr,
  'reg-g06': C.frtb,
  'reg-g07': C.icaap,
  'reg-g08': C.icaap,
  'reg-g09': C.mifid,
  'reg-g10': C.bestExecution,
  'reg-g11': C.marcheCible,
  'reg-g12': C.emir,
  'reg-g13': C.ucits,
  'reg-g14': C.aifm,
  'reg-g15': C.depositaire,
  'reg-g16': C.sfdr,
  'reg-g17': C.priips,
  'reg-g18': C.mar,
  'reg-g19': C.csdr,
  'reg-g20': C.dora,
  'reg-g21': C.solva2,
  'reg-g22': C.expositionGlobale,
};
