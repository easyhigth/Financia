// Parcours « Comprendre » — les bases posées à zéro, sans supposer aucune connaissance.
// À lire dans l'ordre : chaque leçon ne s'appuie que sur les précédentes.

export default [
  {
    id: 'dec-01',
    title: 'À quoi sert la finance de marché ?',
    sub: 'Le point de départ, avant tout vocabulaire',
    minutes: 4,
    sections: [
      { h: "Le problème de base", p: "D'un côté, des gens ont de l'argent qui dort : ton livret, l'épargne retraite de millions de salariés, la trésorerie d'une entreprise. De l'autre, des gens ont besoin d'argent maintenant : un État qui construit des hôpitaux, une entreprise qui ouvre une usine. La finance de marché, c'est simplement le lieu où les deux se rencontrent." },
      { h: "Deux façons de donner son argent", p: "Tu peux PRÊTER : on te rend ton argent à une date connue, avec un loyer au passage. Tu ne deviens propriétaire de rien, mais tu sais à quoi t'attendre. Ou tu peux POSSÉDER un morceau de l'entreprise : personne ne te promet de te rembourser, mais si l'entreprise réussit, ta part vaut plus cher. Prêter s'appelle une obligation. Posséder s'appelle une action. Tout le reste de la finance découle de ces deux idées." },
      { h: "Pourquoi ça s'échange ?", p: "Si tu as prêté pour dix ans mais que tu as besoin de ton argent au bout de deux ans, il te faut quelqu'un pour te racheter ta place. C'est ça, un marché : un endroit où on peut changer d'avis. Cette possibilité de revendre s'appelle la liquidité, et c'est bien plus important qu'on ne le croit — quand elle disparaît, tout se grippe." },
      { h: "Et le risque dans tout ça ?", p: "À chaque fois que tu donnes ton argent, quelque chose peut mal tourner : on ne te rembourse pas, l'entreprise s'effondre, ou tu dois revendre au pire moment. Personne ne prend ces risques gratuitement : on exige d'être payé pour ça. Toute la finance de marché tient dans cette phrase — plus c'est risqué, plus on veut être rémunéré." },
    ],
    retenir: "Prêter (obligation) ou posséder (action). Le marché permet de changer d'avis. Et on n'accepte un risque que si on est payé pour.",
    mots: [
      ['Actif', "N'importe quoi qui a de la valeur et peut s'acheter ou se vendre : une action, une obligation, de l'or."],
      ['Émetteur', "Celui qui a besoin d'argent et qui émet le titre : un État, une entreprise."],
      ['Liquidité', "La facilité à revendre rapidement sans brader le prix."],
    ],
  },

  {
    id: 'dec-02',
    title: "Le taux d'intérêt : le prix du temps",
    sub: "Pourquoi 100 € demain valent moins que 100 € aujourd'hui",
    minutes: 5,
    sections: [
      { h: "L'intuition", p: "Si je te propose 100 € tout de suite ou 100 € dans cinq ans, tu prends tout de suite — sans même réfléchir. Pourquoi ? Parce que tu pourrais les utiliser, parce que les prix augmenteront, et parce que je pourrais disparaître entre-temps. Donc pour que tu acceptes d'attendre, il faut me payer. Ce paiement s'appelle l'intérêt." },
      { h: "Actualiser : la seule opération à comprendre", p: "Puisque de l'argent futur vaut moins, on le rapetisse avant de le comparer à de l'argent d'aujourd'hui. Avec un taux de 5 %, recevoir 105 € dans un an équivaut à avoir 100 € maintenant. On dit que 105 € actualisés valent 100 €. C'est tout. Absolument tous les calculs de prix en finance ne sont que des variations de cette seule idée." },
      { h: "Combien vaut un placement ?", p: "Additionne tout ce qu'il va te rapporter dans le futur, en rapetissant chaque versement selon son éloignement dans le temps. Le total, c'est son prix. Un placement qui te verse 5 € par an pendant 3 ans puis te rend 100 € vaut la somme de ces quatre versements, chacun ramené à aujourd'hui." },
      { h: "La conséquence qui surprend tout le monde", p: "Si le taux utilisé pour rapetisser augmente, tous les versements futurs deviennent plus petits, donc le prix baisse. Voilà pourquoi, dès que les taux d'intérêt montent, la valeur des obligations déjà existantes chute. Ce n'est pas une bizarrerie de marché, c'est de l'arithmétique pure." },
    ],
    retenir: "L'intérêt est le prix de l'attente. Actualiser, c'est rapetisser l'argent futur. Quand les taux montent, le prix de ce qui existe déjà baisse.",
    mots: [
      ['Actualiser', "Ramener une somme future à sa valeur d'aujourd'hui."],
      ['Coupon', "Le loyer versé régulièrement par une obligation."],
      ['Nominal', "Le montant prêté au départ, qu'on te rendra à la fin."],
    ],
  },

  {
    id: 'dec-03',
    title: "L'obligation, en détail",
    sub: 'Le placement qui structure tout le métier du risque',
    minutes: 5,
    sections: [
      { h: "Le contrat", p: "Tu prêtes 100 € à l'État français pour 10 ans. Chaque année il te verse 3 €. Au bout de 10 ans, il te rend tes 100 €. Voilà. Une obligation, ce n'est rien de plus compliqué que ça — le reste n'est que du vocabulaire posé sur cette histoire." },
      { h: "Pourquoi son prix bouge", p: "Trois raisons seulement. Un : les taux du marché changent, donc ton vieux contrat devient plus ou moins attractif que ceux du jour. Deux : la confiance en l'emprunteur change — si on doute qu'il rembourse, ton titre vaut moins. Trois : le temps passe simplement, et l'échéance se rapproche." },
      { h: "Les deux chiffres à connaître", p: "La DURATION répond à « si les taux bougent, je perds ou gagne combien ? ». Une duration de 7 signifie environ 7 % de perte pour 1 % de hausse des taux. La CONVEXITÉ est la correction fine : dans la réalité tu perds un peu moins que ce que la duration annonce, et tu gagnes un peu plus. C'est un petit bonus dans les deux sens." },
      { h: "Pourquoi c'est central en gestion des risques", p: "Les assureurs et les fonds de retraite détiennent des montagnes d'obligations, parce qu'ils doivent verser des sommes connues à des dates connues. Un mouvement de taux de 1 % déplace donc des milliards. Savoir mesurer et encadrer ça, c'est le cœur du métier." },
    ],
    retenir: "Une obligation est un prêt avec un loyer. Son prix baisse quand les taux montent. La duration mesure de combien, la convexité corrige l'estimation.",
    mots: [
      ['Duration', "Le baromètre de sensibilité aux taux."],
      ['Échéance / maturité', "La date à laquelle on te rend ton argent."],
      ['Spread', "Le supplément de rémunération exigé d'un emprunteur moins sûr qu'un État solide."],
    ],
  },

  {
    id: 'dec-04',
    title: 'La courbe des taux',
    sub: "Le graphique le plus regardé de la finance",
    minutes: 4,
    sections: [
      { h: "Ce que c'est", p: "Place sur un dessin ce que rapporte un placement selon sa durée : 3 mois, 1 an, 5 ans, 10 ans, 30 ans. Relie les points. Cette courbe te dit combien coûte l'argent selon le temps qu'on l'immobilise." },
      { h: "Sa forme normale", p: "En général elle monte : prêter longtemps rapporte plus que prêter peu de temps. Logique — plus tu bloques ton argent longtemps, plus il peut t'arriver des choses, donc plus tu exiges d'être payé." },
      { h: "Quand elle s'inverse", p: "Parfois, prêter à 10 ans rapporte MOINS qu'à 2 ans. Ça paraît absurde. En réalité, ça veut dire que les gens sont convaincus que les taux vont beaucoup baisser, donc que l'économie va ralentir. Aux États-Unis, ce signal a précédé presque toutes les récessions depuis 1970. C'est pour ça que tout le monde la surveille." },
      { h: "Comment elle bouge", p: "Presque toujours de trois manières : soit toute la courbe monte ou descend ensemble (le cas le plus fréquent de loin), soit elle penche d'un côté, soit elle se bombe au milieu. Résumer un phénomène compliqué en trois mouvements simples est exactement ce que fait un gestionnaire de risques toute la journée." },
    ],
    retenir: "La courbe montre le prix de l'argent selon la durée. Normalement elle monte. Quand elle s'inverse, le marché anticipe des ennuis.",
    mots: [
      ['Court terme / long terme', "Quelques mois d'un côté, plusieurs années de l'autre."],
      ['Point de base (bp)', "Un centième de pour cent. « +50 bp » veut dire +0,50 %."],
      ['Pentification / aplatissement', "L'écart entre taux longs et courts qui grandit ou rétrécit."],
    ],
  },

  {
    id: 'dec-05',
    title: "L'action et le risque de marché",
    sub: 'Posséder un morceau d\'entreprise',
    minutes: 4,
    sections: [
      { h: "Ce que tu achètes vraiment", p: "Une action, c'est une toute petite part d'une entreprise. Si elle gagne de l'argent, tu peux en recevoir une portion (le dividende) et ta part prend de la valeur. Si elle coule, tu es le dernier servi — après les banques, après les fournisseurs, après l'État. Voilà pourquoi c'est plus risqué qu'un prêt, et pourquoi ça rapporte davantage sur longue période." },
      { h: "Pourquoi le prix bouge tout le temps", p: "Le prix d'aujourd'hui reflète ce que les gens pensent des profits futurs. Or cette opinion change à chaque nouvelle information. Ce n'est donc pas l'entreprise qui bouge chaque seconde, c'est l'opinion collective à son sujet." },
      { h: "La nervosité, ça se mesure", p: "On appelle volatilité l'ampleur des mouvements. Une action qui varie de 3 % par jour est plus nerveuse qu'une autre qui bouge de 0,5 %. Attention : nerveux ne veut pas dire perdant. Ça veut dire imprévisible — et c'est justement l'imprévisibilité qu'on appelle risque en finance." },
      { h: "Deux risques dans une seule action", p: "Celui propre à l'entreprise : un scandale, une usine qui brûle. Et celui du marché entier : une crise mondiale. Le premier peut disparaître si tu détiens des dizaines d'entreprises différentes. Le second, jamais. Retiens ça, c'est la clé de la leçon suivante." },
    ],
    retenir: "Une action = un morceau d'entreprise, plus risqué qu'un prêt. La volatilité mesure la nervosité. Un des deux risques peut disparaître, l'autre non.",
    mots: [
      ['Dividende', "La part des bénéfices reversée aux actionnaires."],
      ['Volatilité', "L'ampleur des variations de prix. Le mot que la finance emploie pour dire « risque »."],
      ['Indice', "Un panier représentatif — le CAC 40 suit 40 grandes entreprises françaises."],
    ],
  },

  {
    id: 'dec-06',
    title: 'Ne pas mettre ses œufs dans le même panier',
    sub: 'La seule chose gratuite en finance',
    minutes: 4,
    sections: [
      { h: "L'expérience", p: "Tu vends des glaces : magnifique en été, catastrophique en hiver. Tu vends aussi des parapluies : l'inverse. Séparément, chaque activité est très irrégulière. Ensemble, ton revenu est presque stable. Tu n'as rien sacrifié — tu as juste combiné des choses qui ne réagissent pas pareil." },
      { h: "Le repas gratuit", p: "En finance, c'est identique : mélange des placements qui ne baissent pas les mêmes jours et le risque global devient plus petit que la moyenne de leurs risques individuels, sans réduire le gain attendu. C'est la seule chose qu'on obtient sans rien payer. Tout le reste se paie." },
      { h: "Combien de paniers ?", p: "L'essentiel du bénéfice est atteint vers 25 ou 30 placements bien répartis. Au-delà, on n'y gagne presque plus. Et le risque du marché entier, lui, reste : la diversification élimine les accidents individuels, jamais les tempêtes générales." },
      { h: "Le piège cruel", p: "Pendant les vraies crises, tout baisse ensemble. Les liens entre les placements se resserrent au pire moment, et la protection s'évapore précisément quand on en aurait besoin. Un gestionnaire de risques ne suppose donc jamais que les protections d'hier fonctionneront demain — il teste des scénarios où tout tombe en même temps." },
    ],
    retenir: "Combiner des choses qui réagissent différemment réduit le risque gratuitement. Mais en crise, tout baisse ensemble et cette protection disparaît.",
    mots: [
      ['Diversification', "Répartir pour éviter qu'un seul accident fasse tout tomber."],
      ['Corrélation', "La tendance de deux placements à bouger ensemble. Élevée = ils se ressemblent trop."],
      ['Portefeuille', "L'ensemble de ce que tu détiens."],
    ],
  },

  {
    id: 'dec-07',
    title: 'Les produits dérivés',
    sub: 'Des contrats dont la valeur dépend d\'autre chose',
    minutes: 5,
    sections: [
      { h: "L'idée de base", p: "Un dérivé, c'est un contrat dont la valeur DÉPEND du prix de quelque chose d'autre — d'où son nom, il en dérive. Tu ne possèdes pas le blé, l'action ou la devise : tu possèdes un accord dont le résultat suit leur prix." },
      { h: "L'ancêtre : l'agriculteur", p: "Un agriculteur craint que le blé s'effondre avant sa récolte. Un boulanger craint l'inverse. Ils se mettent d'accord aujourd'hui sur un prix pour dans six mois. Les deux dorment tranquilles. Voilà le premier dérivé de l'histoire — inventé pour supprimer de l'incertitude, pas pour spéculer." },
      { h: "Deux usages, opposés", p: "Se PROTÉGER : j'ai un risque, j'achète un contrat qui gagne quand mon risque se réalise, les deux s'annulent. Ou SPÉCULER : je n'ai aucun risque particulier, je parie parce que je pense savoir. Le contrat est exactement le même — seule l'intention diffère. C'est pour ça qu'on ne juge jamais un dérivé isolément, mais toujours à côté de ce qu'il est censé couvrir." },
      { h: "Pourquoi c'est dangereux", p: "Avec très peu d'argent, on contrôle des montants énormes. C'est ce qu'on appelle l'effet de levier. Comme conduire une voiture de course : plus rapide, mais l'accident est bien plus grave. La quasi-totalité des grandes catastrophes financières implique un levier que personne n'avait correctement mesuré." },
    ],
    retenir: "Un dérivé suit le prix d'autre chose. Il sert à se protéger ou à parier — même outil. Son danger vient du levier : peu d'argent, énormément d'exposition.",
    mots: [
      ['Sous-jacent', "La chose dont le contrat suit le prix."],
      ['Notionnel', "Le montant de référence du contrat — souvent bien plus gros que l'argent réellement engagé."],
      ['Couverture (hedge)', "Une opération faite pour annuler un risque existant."],
    ],
  },

  {
    id: 'dec-08',
    title: "Les options, sans mathématiques",
    sub: 'La réservation : payer un peu pour avoir le choix',
    minutes: 5,
    sections: [
      { h: "L'analogie qui marche", p: "Tu verses 50 € pour réserver une voiture à 10 000 € pendant un mois. Si tu la trouves ailleurs à 9 000 €, tu abandonnes ta réservation : tu as perdu 50 €. Si son prix grimpe à 12 000 €, tu utilises ta réservation et tu économises 2 000 €. Une option, c'est exactement ça : un droit, jamais une obligation." },
      { h: "Les deux sens", p: "Réserver le droit d'ACHETER à un prix fixé, c'est un call — tu l'utilises si le prix monte. Réserver le droit de VENDRE, c'est un put — tu l'utilises si le prix baisse. Le put est l'assurance du monde financier : tu paies une prime, et si la catastrophe arrive, tu es couvert." },
      { h: "Ce qui fait le prix", p: "Trois choses de bon sens. Le temps qui reste : plus il y en a, plus il peut se passer quelque chose, plus c'est cher. La nervosité : sur un marché agité, la réservation a plus de chances de devenir gagnante, donc elle coûte plus. Et la distance au prix actuel : réserver un truc très loin du prix du jour, c'est peu probable, donc pas cher." },
      { h: "Les deux côtés du contrat", p: "L'acheteur peut perdre au maximum sa prime, et gagner beaucoup. Le vendeur encaisse la prime tout de suite mais peut perdre énormément. C'est un métier de compagnie d'assurance : on encaisse tranquillement pendant des années, jusqu'au sinistre. Les gestionnaires de risques passent beaucoup de temps sur ceux qui vendent." },
    ],
    retenir: "Une option est une réservation payante : un droit, pas une obligation. Call = acheter, put = vendre. L'acheteur risque sa prime, le vendeur risque gros.",
    mots: [
      ['Prime', "Le prix payé pour obtenir la réservation."],
      ["Strike (prix d'exercice)", "Le prix fixé d'avance dans le contrat."],
      ['Payoff', "Ce que rapporte le contrat au dénouement, selon le prix atteint."],
    ],
  },

  {
    id: 'dec-09',
    title: 'Mesurer un risque',
    sub: "VaR, stress tests : mettre un chiffre sur l'inquiétude",
    minutes: 5,
    sections: [
      { h: "Le problème du dirigeant", p: "Une banque possède des milliers de positions différentes. Le directeur pose une seule question : « globalement, on risque combien ? ». Il faut donc un chiffre unique, compréhensible, à partir d'un fouillis énorme. C'est tout le métier — et c'est plus difficile qu'il n'y paraît." },
      { h: "La VaR, et son piège", p: "La réponse la plus répandue : « dans une journée normalement mauvaise, on perd moins de 3 millions ». Plus précisément : 99 jours sur 100, la perte reste sous ce seuil. Le piège est énorme et il faut le comprendre : elle ne dit RIEN du centième jour. Elle mesure la profondeur habituelle de la rivière, pas la hauteur de la crue." },
      { h: "Regarder dans le trou", p: "D'où une deuxième mesure : « et les mauvais jours, quand ça dépasse, on perd combien en moyenne ? ». Elle regarde à l'intérieur de la catastrophe au lieu de s'arrêter au bord. Après 2008, les régulateurs ont basculé vers elle — parce que la première laissait justement les vraies crises hors du champ." },
      { h: "Le test de résistance", p: "Les deux mesures précédentes se fondent sur le passé. Alors on ajoute une question qui s'en affranchit : « si la crise de 2008 recommençait demain, on perd combien ? ». Pas de probabilités, juste un scénario dur et son résultat. Et sa version inversée, la plus utile : qu'est-ce qui devrait arriver pour que l'on coule ? Ça oblige à imaginer ce à quoi personne n'avait pensé." },
    ],
    retenir: "La VaR = la perte d'une journée normalement mauvaise, aveugle au pire. On la complète en regardant dans le trou, et par des scénarios de catastrophe.",
    mots: [
      ['VaR', "Value at Risk : la perte à ne pas dépasser dans 99 % des cas."],
      ['Stress test', "Un scénario catastrophe volontairement brutal, sans probabilité."],
      ['Limite', "Le plafond de risque autorisé pour une équipe. Le dépasser déclenche une alerte."],
    ],
  },

  {
    id: 'dec-10',
    title: 'Le risque de ne pas être remboursé',
    sub: 'Le risque de crédit, en trois questions',
    minutes: 4,
    sections: [
      { h: "Trois questions, une réponse", p: "Tu as prêté à quelqu'un. Pour savoir ce que ça peut te coûter, demande-toi : quelle chance qu'il ne rembourse pas ? Si ça arrive, quelle part je récupère quand même (en revendant sa maison, par exemple) ? Et combien exactement me devra-t-il à ce moment-là ? Multiplie les trois réponses : voilà ta perte moyenne attendue." },
      { h: "Attendu ≠ surprise", p: "Sur mille prêts, tu sais d'avance qu'une poignée tournera mal. Ce n'est pas une surprise, c'est un coût prévisible : on l'intègre au prix et on met la somme de côté. Le vrai danger, c'est l'année où il y en a dix fois plus que prévu. Pour ça, il faut du capital en réserve. Toute la réglementation bancaire repose sur cette distinction." },
      { h: "Pas besoin d'attendre la faillite", p: "Erreur classique du débutant : croire qu'on ne perd que si l'emprunteur fait faillite. Faux. Il suffit que sa situation se dégrade et que le marché en doute pour que ton titre perde de la valeur immédiatement. On perd le plus souvent bien avant le défaut." },
      { h: "Le thermomètre public", p: "Il existe une assurance contre la faillite d'une entreprise, qui s'achète et se vend librement. Son prix est donc visible par tous, en temps réel : c'est le thermomètre de la confiance en cet emprunteur. Quand il s'envole, tout le monde le voit le jour même." },
    ],
    retenir: "Perte attendue = probabilité × part non récupérée × montant dû. L'attendu se provisionne, la surprise se couvre avec du capital. Et on perd bien avant la faillite.",
    mots: [
      ['Défaut', "Le fait de ne pas honorer un remboursement."],
      ['Notation (rating)', "La note attribuée à un emprunteur, de AAA à D."],
      ['CDS', "L'assurance contre le défaut d'un emprunteur."],
    ],
  },

  {
    id: 'dec-11',
    title: "Le métier : que fait un Risk Manager ?",
    sub: "Concrètement, au quotidien, dans une société de gestion",
    minutes: 5,
    sections: [
      { h: "Le principe des trois niveaux", p: "Ceux qui prennent les risques (les gérants qui investissent). Ceux qui les mesurent, fixent les règles et alertent (le service des risques et la conformité). Ceux qui vérifient que les deux premiers font bien leur travail (l'audit). Un stage en gestion des risques, c'est le deuxième niveau : on contrôle, on challenge, on alerte — on ne décide jamais des investissements." },
      { h: "Une journée type", p: "Le matin, on vérifie que rien n'a dépassé les limites pendant la nuit. On analyse les mouvements inhabituels : pourquoi ce fonds a-t-il autant bougé hier ? On produit les rapports de risque pour les gérants et la direction. On prépare des scénarios de crise. Et on discute avec les gérants — souvent le plus intéressant, et le plus délicat." },
      { h: "Ce qu'on attend vraiment de toi", p: "Pas d'être le meilleur en mathématiques. D'être capable de dire « attention, ce chiffre est faux » ou « je ne comprends pas d'où vient ce résultat », y compris face à quelqu'un de plus expérimenté. L'indépendance d'esprit est la compétence centrale : un contrôleur qui n'ose pas contredire ne sert à rien." },
      { h: "Les grandes familles de risque", p: "Le risque de marché : les prix bougent contre nous. Le risque de crédit : quelqu'un ne rembourse pas. Le risque de liquidité : impossible de vendre, ou de payer ce qu'on doit demain. Le risque opérationnel : une erreur, une fraude, une panne. Et le risque de conformité : ne pas respecter les règles. Retenir ces cinq familles, c'est déjà avoir le plan de tout entretien." },
    ],
    retenir: "Le Risk Manager est en deuxième ligne : il mesure, encadre, challenge et alerte — sans jamais décider des investissements. Cinq familles de risques à connaître.",
    mots: [
      ['Première / deuxième / troisième ligne', "Ceux qui prennent le risque / ceux qui contrôlent / ceux qui auditent."],
      ['Limite et escalade', "Le plafond autorisé, et la procédure pour prévenir quand il est franchi."],
      ["Appétit au risque", "Ce que l'entreprise accepte de risquer, décidé au plus haut niveau."],
    ],
  },

  {
    id: 'dec-12',
    title: 'Qui surveille tout ça ?',
    sub: 'Les règles, et pourquoi elles existent',
    minutes: 4,
    sections: [
      { h: "Une règle = une catastrophe passée", p: "Chaque texte réglementaire répond à un accident précis. Des banques trop fragiles en 2008 : on leur impose de garder plus d'argent de côté. Des clients à qui on a vendu n'importe quoi : on impose des vérifications avant toute vente. Un gérant qui inventait ses relevés pendant vingt ans : on impose qu'une société extérieure garde les titres. Lire la réglementation comme une liste d'accidents rend tout beaucoup plus facile à retenir." },
      { h: "Pour les banques", p: "L'accord international qui porte le nom d'une ville suisse, Bâle. Il tient sur trois pieds : un minimum d'argent de côté calculé par une formule commune, un examen personnalisé par le superviseur, et l'obligation de publier ses chiffres. Contrainte, surveillance, transparence." },
      { h: "Pour la gestion d'actifs", p: "D'autres textes s'appliquent : ceux qui protègent le client au moment de la vente, ceux qui encadrent les fonds grand public (ne pas tout mettre au même endroit, ne pas s'endetter à outrance), et ceux qui imposent qu'un service de gestion des risques existe et soit indépendant. C'est littéralement le texte qui crée le poste que tu vises." },
      { h: "Le mot à retenir en entretien", p: "Indépendance. Celui qui mesure les risques ne doit pas dépendre de celui qui les prend, et doit pouvoir alerter directement la direction. Si tu ne devais retenir qu'une chose de toute la réglementation pour un entretien en gestion des risques, c'est celle-là." },
    ],
    retenir: "Chaque règle vient d'un accident. Bâle pour les banques, d'autres textes pour la gestion d'actifs — et partout, le même principe : l'indépendance du contrôle.",
    mots: [
      ['Régulateur / superviseur', "L'autorité qui édicte les règles et vérifie qu'on les respecte (AMF, BCE, ACPR)."],
      ['Fonds propres', "L'argent qui appartient vraiment à la banque, sa réserve d'absorption des pertes."],
      ['Conformité', "L'équipe chargée du respect des règles et de la protection du client."],
    ],
  },
];
