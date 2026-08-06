// Explications « en clair » — module Change / FX.

const C = {
  cotation: "« EUR/USD = 1,08 » veut dire : avec 1 euro, j'obtiens 1,08 dollar. Le premier de la paire est la marchandise, le second est l'étiquette de prix. Quand le chiffre monte, l'euro devient plus cher — donc plus fort. Retenir l'ordre évite 90 % des erreurs de débutant.",

  bidAsk: "Comme au bureau de change de l'aéroport : on t'achète tes euros à un prix, on te les revend à un autre, et l'écart est la marge du commerçant. Sur les grandes devises cet écart est minuscule ; sur des devises exotiques il devient énorme, surtout en période de panique.",

  pip: "L'unité de mesure minimale du change, c'est-à-dire le dernier chiffre après la virgule. Ça paraît ridicule, mais quand on échange des millions, quelques-unes de ces unités représentent des dizaines de milliers d'euros. C'est le « centime » du monde des devises.",

  cross: "Tu veux le prix de l'euro en livres, mais tu ne connais que le prix de chacun en dollars ? Tu passes par le dollar, comme en changeant deux fois de train. Le résultat est forcément cohérent : sinon on pourrait tourner en rond entre trois devises et ressortir plus riche à chaque tour.",

  triangulaire: "Convertir A en B, puis B en C, puis C en A doit te ramener exactement à ton point de départ. Si ce n'est pas le cas, il y a de l'argent gratuit à ramasser. Des ordinateurs surveillent ça en permanence et corrigent l'écart en quelques millionièmes de seconde.",

  cip: "Si placer son argent en dollars rapporte plus qu'en euros, tout le monde voudrait des dollars. Pour que ça reste équitable, le prix du dollar « pour plus tard » est automatiquement moins avantageux, exactement de la différence de rémunération. Résultat : on ne peut pas gagner d'argent sans risque juste en changeant de monnaie.",

  pointsSwap: "L'écart entre le prix d'aujourd'hui et le prix « pour plus tard ». Beaucoup croient que c'est une prévision : c'est faux. C'est purement la différence entre les taux d'intérêt des deux pays, rien d'autre. Personne ne prédit quoi que ce soit là-dedans.",

  uip: "En théorie, une devise qui rapporte beaucoup devrait perdre de la valeur pour compenser. Dans les faits, ça ne se passe pas comme ça — en tout cas pas tout de suite. C'est l'une des plus vieilles énigmes de la finance, et c'est ce qui rend le pari sur les devises à haut rendement rentable... jusqu'au jour où ça se retourne.",

  forwardFx: "Tu sais que tu recevras des dollars dans trois mois et tu ne veux pas dépendre du hasard. Tu bloques le taux de conversion dès maintenant. Tu perds la possibilité d'une bonne surprise, mais tu élimines la mauvaise. C'est le b.a.-ba de la protection contre le change.",

  fxSwap: "Tu as des euros, tu as besoin de dollars pendant un mois. Tu échanges maintenant et tu t'engages à ré-échanger dans l'autre sens dans un mois, à un prix connu d'avance. Ce n'est pas un pari sur les devises : c'est un simple prêt déguisé. C'est l'opération la plus fréquente du marché des changes.",

  ccs: "Comme le précédent, mais sur plusieurs années et avec l'échange régulier des intérêts. Ça sert typiquement à une entreprise qui gagne dans une monnaie et emprunte dans une autre. Sur une aussi longue durée, le risque que le partenaire fasse faillite devient une vraie préoccupation.",

  basis: "En théorie, emprunter des dollars directement ou passer par le change devrait coûter la même chose. Depuis la crise de 2008, ce n'est plus vrai : passer par le change coûte plus cher, parce que les banques n'ont plus la place dans leurs comptes pour corriger l'écart. Cet écart mesure la tension mondiale sur le dollar.",

  transaction: "Le risque le plus concret : tu as signé un contrat en dollars, tu seras payé dans six mois, et tu ne sais pas ce que ça vaudra en euros. Le montant est connu, seule la conversion est incertaine. C'est le plus facile des risques de change à supprimer.",

  translation: "Une entreprise avec des filiales à l'étranger doit tout convertir dans une seule monnaie pour ses comptes annuels. Si les devises ont bougé, les comptes changent — mais aucun argent ne circule réellement. C'est un effet sur la photo comptable, pas sur le portefeuille.",

  economique: "Le risque le plus sournois, parce qu'il ne se voit sur aucune facture. Si l'euro devient très fort, tes produits deviennent chers pour les clients étrangers et tu vends moins. Aucun contrat n'est concerné, mais ton activité souffre. Impossible à couvrir avec de simples outils financiers.",

  hedgedClass: "Tu achètes un fonds investi en actions américaines mais tu vis en zone euro. Sans protection, tu subis deux paris à la fois : les actions ET le dollar. La version « couverte » du fonds supprime le pari sur le dollar. Ça a un coût, égal à la différence de taux entre les deux pays.",

  rebalancement: "Tu as protégé 100 € contre le change. Trois mois plus tard, ton placement en vaut 120 : les 20 € supplémentaires ne sont plus protégés. Il faut donc réajuster régulièrement, sinon la protection se décale petit à petit sans qu'on s'en aperçoive.",

  optionFx: "Une réservation, mais sur une devise. Détail amusant : réserver l'achat d'euros contre dollars, c'est exactement la même chose que réserver la vente de dollars contre euros. Deux façons de dire une chose identique — ce qui perturbe beaucoup de débutants.",

  reglement: "Deux devises, deux pays, deux fuseaux horaires. Tu envoies tes euros le matin, tu attends tes dollars l'après-midi — et entre les deux, la banque d'en face fait faillite. C'est réellement arrivé en 1974. Aujourd'hui un système spécialisé fait tout partir en même temps, comme un échange simultané dans une cour de récréation.",

  regimes: "Certains pays laissent leur monnaie bouger librement, d'autres la maintiennent artificiellement à un niveau fixe. Le second cas est trompeur : tout paraît calme pendant des années, puis le jour où le pays lâche prise, la monnaie bouge de 30 % en quelques minutes. Le calme apparent cachait le vrai danger.",

  refuges: "Quand les gens ont peur, ils se ruent tous sur les mêmes monnaies jugées sûres : dollar, franc suisse, yen. Problème : ces habitudes changent avec le temps, et les liens entre devises se resserrent tous en même temps précisément pendant les crises — au moment où on comptait sur eux pour se protéger.",

  carryTrade: "Emprunter là où l'argent ne coûte presque rien, placer là où il rapporte beaucoup, et empocher la différence. Ça marche merveilleusement pendant des mois... puis tout le monde sort en même temps et les pertes de quelques jours effacent des années de gains. La grande illusion du gain facile.",

  pnlFx: "Tu as acheté un million d'euros à 1,08 dollar, tu revends à 1,09 : tu gagnes un centime par euro, soit dix mille dollars. Simple, à condition de ne pas se tromper sur le sens de la paire — l'erreur classique.",

  varFx: "Pour savoir ce que tu risques vraiment sur les devises, il faut regarder ton exposition NETTE dans chaque monnaie, pas la somme de toutes tes opérations. Être acheteur ici et vendeur là, ça se compense en grande partie. Additionner sans compenser fait paraître le risque bien plus gros qu'il n'est.",

  fixing: "Chaque jour à 16 h à Londres, un taux de référence est figé, et des milliers de fonds l'utilisent pour calculer leur valeur. Comme tout le monde passe ses ordres à ce moment-là, certains ont été tentés de pousser le prix dans leur sens. Des banques ont payé des amendes énormes pour ça.",

  coutCouverture: "Se protéger a un coût connu d'avance ; ne pas se protéger a un coût inconnu. Beaucoup se plaignent d'avoir « perdu » en se protégeant alors que la devise avait bougé en leur faveur — c'est confondre une assurance avec un pari. On n'achète pas une assurance incendie en espérant que sa maison brûle.",

  ndf: "Certaines monnaies ne peuvent pas sortir de leur pays. On passe alors un accord où personne ne livre réellement la devise : on se contente de se verser la différence en dollars. Pratique, mais tu dépends du taux officiel publié par un pays — qui peut le geler quand ça l'arrange.",
};

export default {
  'fx-f01': C.cotation,
  'fx-f02': C.bidAsk,
  'fx-f03': C.pip,
  'fx-f04': C.cross,
  'fx-f05': C.triangulaire,
  'fx-f06': C.cip,
  'fx-f07': C.pointsSwap,
  'fx-f08': C.uip,
  'fx-f09': C.forwardFx,
  'fx-f10': C.fxSwap,
  'fx-f11': C.ccs,
  'fx-f12': C.basis,
  'fx-f13': C.transaction,
  'fx-f14': C.translation,
  'fx-f15': C.economique,
  'fx-f16': C.hedgedClass,
  'fx-f17': C.rebalancement,
  'fx-f18': C.optionFx,
  'fx-f19': C.reglement,
  'fx-f20': C.regimes,
  'fx-f21': C.refuges,
  'fx-f22': C.carryTrade,
  'fx-f23': C.pnlFx,
  'fx-f24': C.varFx,
  'fx-f25': C.fixing,
  'fx-f26': C.coutCouverture,
  'fx-f27': C.ndf,
  // ------- glossaire
  'fx-g01': C.cotation,
  'fx-g02': C.cross,
  'fx-g03': C.cip,
  'fx-g04': C.uip,
  'fx-g05': C.pointsSwap,
  'fx-g06': C.fxSwap,
  'fx-g07': C.ccs,
  'fx-g08': C.basis,
  'fx-g09': C.ndf,
  'fx-g10': C.transaction,
  'fx-g11': C.economique,
  'fx-g12': C.hedgedClass,
  'fx-g13': C.carryTrade,
  'fx-g14': C.reglement,
  'fx-g15': C.reglement,
  'fx-g16': C.optionFx,
  'fx-g17': C.fixing,
  'fx-g18': C.regimes,
};
