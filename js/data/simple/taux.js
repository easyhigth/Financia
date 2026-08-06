// Explications « en clair » — module Taux & obligations.
// Chaque texte doit être compréhensible sans aucune connaissance financière préalable :
// une image du quotidien d'abord, le mot technique ensuite.
// Les concepts sont définis une fois puis rattachés aux cartes ET aux fiches de glossaire.

const C = {
  prixOblig: "Une obligation, c'est un prêt que tu fais à un État ou à une entreprise. Tu donnes 100 €, on te verse un petit loyer chaque année (le coupon) et on te rend tes 100 € à la fin. Le « prix » de cette obligation, c'est ce que quelqu'un accepte de payer aujourd'hui pour recevoir tous ces versements futurs. Comme de l'argent demain vaut moins que de l'argent tout de suite, on rapetisse chaque versement futur avant de tout additionner : c'est ça, « actualiser ».",

  prixTaux: "Imagine que tu as prêté de l'argent à 2 % et que, le lendemain, tout le monde peut prêter à 4 %. Ton vieux prêt à 2 % devient moins intéressant : si tu veux le revendre, tu devras baisser ton prix. C'est la règle numéro un : quand les taux montent, le prix des obligations baisse. Et inversement.",

  durationMac: "C'est la réponse à : « en moyenne, dans combien de temps est-ce que je récupère mon argent ? ». Si on te rembourse tout à la fin dans 10 ans, la réponse est 10 ans. Si on te verse des petits bouts chaque année en chemin, tu récupères ton argent plus tôt en moyenne, donc le chiffre est plus petit que 10.",

  durationMod: "C'est le baromètre de fragilité d'une obligation. Une duration de 7 veut dire : si les taux montent de 1 %, je perds à peu près 7 % de valeur. Plus le chiffre est gros, plus ça secoue quand les taux bougent. C'est le premier chiffre qu'un gestionnaire de risques regarde.",

  convexite: "La duration te dit « je perds 7 % ». Mais dans la vraie vie, tu perds un peu moins que prévu quand ça va mal, et tu gagnes un peu plus que prévu quand ça va bien. Ce petit bonus dans les deux sens, c'est la convexité. C'est comme un airbag : tu ne le remarques pas quand tout va bien, il t'aide quand ça tape fort.",

  convexiteBonus: "Entre deux placements aussi risqués, celui qui a le plus de convexité (le plus gros airbag) est le meilleur : il perd moins quand ça descend et gagne plus quand ça monte. Comme tout le monde le sait, il coûte un peu plus cher : on paie l'airbag en acceptant un rendement légèrement plus faible.",

  dv01: "C'est le même baromètre que la duration, mais exprimé en euros au lieu d'en pourcentage. « Mon DV01 est de 6 000 € » veut dire : si les taux bougent d'un tout petit cran (un centième de pour cent), je gagne ou je perds 6 000 €. Les professionnels préfèrent ça, parce qu'un montant en euros parle immédiatement.",

  ytm: "C'est le rendement affiché d'une obligation : « ce placement rapporte 4 % par an ». Attention au piège : ce chiffre n'est vrai que si tu gardes le placement jusqu'au bout ET que tu replaces chaque loyer reçu au même taux. Si les taux baissent entre-temps, tu replaces moins bien, et tu n'obtiens pas vraiment les 4 % promis.",

  currentYield: "Deux façons de mesurer ce que rapporte une obligation. La première, très simple : le loyer annuel divisé par le prix payé. Elle oublie un détail important — si tu as payé 95 € un truc qui te rendra 100 €, tu gagnes aussi 5 € à la fin. Le rendement complet (YTM), lui, compte ce bonus.",

  spot: "Le taux « spot » répond à une question toute simple : si je place mon argent aujourd'hui et que je ne touche à rien pendant exactement 5 ans, combien ça me rapporte par an ? Un seul versement, à la fin, pas de complication. C'est la brique de base : tous les calculs sérieux partent de là.",

  forward: "C'est un taux pour plus tard, mais fixé aujourd'hui. « Emprunter pendant un an, mais en commençant dans un an » : le marché sait déjà te donner ce prix. Ce n'est pas une prédiction magique, c'est juste de l'arithmétique — si placer 2 ans rapporte plus que placer 1 an, la deuxième année doit forcément combler la différence.",

  bootstrap: "Les prix qu'on observe sur le marché sont des mélanges (plusieurs versements à plusieurs dates). Le bootstrapping, c'est démêler ce mélange étape par étape, comme un sudoku : je trouve d'abord le taux à 1 an, ce qui me permet de trouver celui à 2 ans, puis celui à 3 ans, et ainsi de suite.",

  courbe: "Mets sur un dessin ce que rapporte un placement selon sa durée : 3 mois, 2 ans, 10 ans, 30 ans. Relie les points, tu obtiens la courbe des taux. C'est la photo la plus regardée de toute la finance : sa forme raconte ce que les gens pensent de l'avenir.",

  formesCourbe: "Normalement, prêter longtemps rapporte plus que prêter peu de temps (la courbe monte) — c'est logique, tu prends plus de risques sur la durée. Quand elle est plate, personne ne sait trop. Quand elle descend (« inversée »), c'est un signal inquiétant : les gens parient que l'économie va ralentir et que les taux vont baisser. Historiquement, ça a souvent précédé les crises.",

  theories: "Pourquoi les taux longs ne sont-ils pas égaux aux taux courts ? Trois explications qui se cumulent : les gens anticipent ce qui va se passer ; ils réclament une récompense supplémentaire pour immobiliser leur argent longtemps ; et certains acteurs (assureurs, fonds de retraite) n'achètent que certaines durées, ce qui déforme les prix.",

  primeTerme: "Prêter pour 30 ans, c'est accepter de ne pas pouvoir changer d'avis pendant très longtemps. On exige donc une petite récompense en plus. C'est cette récompense qu'on appelle la prime de terme — comme payer plus cher un billet remboursable.",

  facteursCourbe: "Quand la courbe des taux bouge, elle le fait presque toujours de trois façons : soit tout monte ou tout descend ensemble (le plus fréquent, de loin), soit elle penche d'un côté, soit elle se bombe au milieu. Savoir ça permet de résumer un phénomène compliqué avec trois chiffres au lieu de vingt.",

  krd: "La duration classique suppose que TOUS les taux bougent en même temps, ce qui est faux. La key rate duration découpe la sensibilité durée par durée : « si seulement le taux à 5 ans bouge, je perds combien ? ». Deux portefeuilles qui se ressemblent en apparence peuvent réagir de façon opposée quand seule une partie de la courbe bouge.",

  durationEff: "Quand un placement contient une clause spéciale (par exemple : l'emprunteur a le droit de te rembourser plus tôt), les formules toutes faites ne marchent plus. Alors on fait au plus simple et au plus honnête : on recalcule le prix pour de vrai dans plusieurs scénarios, et on regarde ce que ça donne.",

  convexiteNeg: "C'est l'airbag qui se retourne contre toi. Certains placements plafonnent quand ça va bien mais chutent normalement quand ça va mal : tu as tous les inconvénients sans les avantages. Ça arrive quand l'emprunteur peut te rembourser plus tôt, précisément au moment où ça t'arrangerait de continuer.",

  callable: "« Callable » veut dire que celui qui t'a emprunté l'argent peut te rembourser en avance s'il le souhaite. Il le fera quand ça l'arrange lui, donc quand ça t'arrange le moins. En échange de cette mauvaise surprise possible, on te paie un peu plus. « Puttable », c'est l'inverse : c'est toi qui peux rendre le placement plus tôt, donc ça te coûte un peu.",

  spreadCredit: "Prêter à un État solide, c'est assez sûr. Prêter à une entreprise fragile, beaucoup moins. La différence de rémunération entre les deux, c'est le spread : c'est le prix du risque de ne pas être remboursé. Quand tout le monde a peur, cet écart s'écarte brutalement.",

  zspread: "Une façon plus honnête de mesurer ce fameux écart. Au lieu de comparer grossièrement deux chiffres, on regarde combien il faut ajouter à chaque étape du calcul pour retomber exactement sur le prix réel du marché. Plus précis, surtout quand les taux courts et longs sont très différents.",

  oas: "Quand un placement contient une clause spéciale (remboursement anticipé, par exemple), une partie de sa rémunération sert à payer cette clause, pas le risque de non-remboursement. L'OAS, c'est ce qui reste une fois qu'on a retiré le prix de la clause : ça permet enfin de comparer des choses comparables.",

  asw: "Une manière très courante en Europe d'exprimer « combien ce placement rapporte-t-il de plus que la référence du marché ». On échange la partie « taux » du placement contre un taux variable, et ce qui reste au-dessus de la référence, c'est la mesure du risque de l'emprunteur.",

  cs01: "Il y a deux baromètres différents à ne surtout pas confondre. Le premier mesure : que se passe-t-il si les taux généraux bougent ? Le second (le CS01) mesure : que se passe-t-il si c'est la confiance en CET emprunteur précis qui se dégrade ? On peut être totalement protégé du premier et complètement exposé au second.",

  swap: "Deux personnes s'échangent leurs mensualités. L'une avait un prêt à taux fixe et préfère du variable, l'autre l'inverse : elles s'arrangent entre elles. Personne ne se prête le capital, on échange seulement les intérêts. C'est l'outil le plus utilisé au monde pour changer son exposition aux taux sans vendre quoi que ce soit.",

  swapValo: "Au départ, l'échange est équilibré : ni l'un ni l'autre ne paie quoi que ce soit, c'est un match nul. Ensuite les taux bougent, et l'échange devient gagnant pour l'un et perdant pour l'autre. Valoriser le contrat, c'est chiffrer de combien on est en train de gagner ou de perdre.",

  ois: "Trois références de taux à ne pas mélanger. €STR : le taux au jour le jour, le plus sûr, celui d'une nuit. Euribor : le taux auquel les banques se prêtent pour plusieurs mois — il contient une pincée de risque en plus. Quand l'écart entre les deux se creuse, c'est que les banques commencent à se méfier les unes des autres : un très bon détecteur de crise.",

  fra: "Un contrat pour bloquer aujourd'hui le taux d'un emprunt que tu feras plus tard. Comme réserver le prix d'un billet d'avion pour cet été alors qu'on est en hiver : tu ne voyages pas maintenant, mais tu ne subiras pas la hausse des prix.",

  future: "Un contrat standardisé, acheté et vendu sur une place de marché organisée, qui permet de parier sur le prix futur d'obligations. Standardisé veut dire que tout le monde échange exactement le même produit : c'est ce qui le rend très facile à revendre. C'est l'outil rapide pour se protéger quand on gère beaucoup d'argent.",

  immunisation: "Un assureur sait qu'il devra verser de l'argent dans 12 ans. Il achète donc des placements calés sur ce même horizon. Résultat : si les taux bougent, ce qu'il possède et ce qu'il doit bougent ensemble, et se compensent. Comme deux enfants de même poids sur une balançoire — ça reste à l'équilibre.",

  reinvest: "Quand les taux montent, il t'arrive deux choses opposées : la valeur de ce que tu détiens baisse (mauvais), mais tous les loyers que tu encaisses se replacent mieux (bon). Ces deux effets se compensent exactement au bout d'une certaine durée. C'est cette idée qui permet de se protéger des mouvements de taux.",

  inflationLinked: "Un placement classique te promet 100 € dans 10 ans. Si les prix ont beaucoup augmenté d'ici là, ces 100 € achèteront moins de choses : tu t'es appauvri sans t'en rendre compte. Un placement indexé, lui, augmente automatiquement avec les prix. Comparer les deux permet de savoir quelle inflation le marché anticipe.",

  repo: "Tu as besoin d'argent liquide pour quelques jours. Tu donnes tes titres en garantie, on te prête du cash, et tu récupères tes titres en les rachetant un peu plus cher. C'est un prêt sur gage, version professionnelle — et c'est le circuit sanguin de la finance : quand il se bloque, tout se bloque.",

  carry: "Deux façons de gagner de l'argent sans que rien ne bouge. Le carry : les loyers que tu encaisses sont supérieurs à ce que te coûte l'argent emprunté pour acheter — tu gagnes juste en attendant. Le roll-down : simplement parce que le temps passe, ton placement à 5 ans devient un placement à 4 ans, mieux valorisé.",

  accrued: "Le prix affiché à l'écran n'est pas ce que tu paies vraiment. Si le prochain loyer tombe dans un mois et que le vendeur l'a « mérité » pendant onze mois, tu dois le lui rembourser au passage. Prix affiché + part de loyer déjà courue = ce que tu règles réellement.",

  frn: "Un placement dont le loyer se remet à jour tout seul, à intervalles réguliers, selon les taux du moment. Du coup, une hausse des taux ne lui fait presque rien : il s'adapte. Attention quand même, il reste exposé au risque que l'emprunteur inspire moins confiance.",

  ctd: "Sur certains contrats, le vendeur a le choix entre plusieurs titres à livrer. Comme n'importe qui, il livre le moins cher pour lui. Ce titre-là, le « moins cher à livrer », change selon les conditions du marché — et quand il change, le comportement de ta protection change brutalement aussi.",
};

export default {
  // ------- flashcards
  'taux-f01': C.prixOblig,
  'taux-f02': C.prixTaux,
  'taux-f03': C.durationMac,
  'taux-f04': C.durationMod,
  'taux-f05': C.convexite,
  'taux-f06': C.convexiteBonus,
  'taux-f07': C.dv01,
  'taux-f08': C.ytm,
  'taux-f09': C.currentYield,
  'taux-f10': C.spot,
  'taux-f11': C.forward,
  'taux-f12': C.bootstrap,
  'taux-f13': C.formesCourbe,
  'taux-f14': C.theories,
  'taux-f15': C.facteursCourbe,
  'taux-f16': C.krd,
  'taux-f17': C.durationEff,
  'taux-f18': C.convexiteNeg,
  'taux-f19': C.callable,
  'taux-f20': C.spreadCredit,
  'taux-f21': C.zspread,
  'taux-f22': C.oas,
  'taux-f23': C.asw,
  'taux-f24': C.cs01,
  'taux-f25': C.swap,
  'taux-f26': C.swapValo,
  'taux-f27': C.ois,
  'taux-f28': C.fra,
  'taux-f29': C.future,
  'taux-f30': C.immunisation,
  'taux-f31': C.reinvest,
  'taux-f32': C.inflationLinked,
  'taux-f33': C.repo,
  'taux-f34': C.carry,
  'taux-f35': C.accrued,
  // ------- glossaire
  'taux-g01': C.durationMod,
  'taux-g02': C.durationMac,
  'taux-g03': C.convexite,
  'taux-g04': C.dv01,
  'taux-g05': C.ytm,
  'taux-g06': C.spot,
  'taux-g07': C.forward,
  'taux-g08': C.zspread,
  'taux-g09': C.oas,
  'taux-g10': C.krd,
  'taux-g11': C.bootstrap,
  'taux-g12': C.primeTerme,
  'taux-g13': C.immunisation,
  'taux-g14': C.asw,
  'taux-g15': C.ois,
  'taux-g16': C.repo,
  'taux-g17': C.carry,
  'taux-g18': C.frn,
  'taux-g19': C.inflationLinked,
  'taux-g20': C.ctd,
  'taux-g21': C.courbe,
};
