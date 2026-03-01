export interface Article {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  readTime: number;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  sections: ArticleSection[];
}

export interface ArticleSection {
  heading: string;
  content: string; // supports simple markdown-like formatting
  tip?: string;
}

export const articles: Article[] = [
  {
    slug: "guide-mixage-vocal-rap",
    title: "Guide complet du mixage vocal en Rap : de l'enregistrement au master",
    subtitle: "Les techniques pro pour un rendu vocal percutant",
    description:
      "Apprenez à mixer des voix rap comme un professionnel : chaîne de traitement, compression, EQ, ad-libs, doubles et spatialisation. Guide étape par étape avec des réglages concrets.",
    category: "Rap / Trap",
    readTime: 12,
    publishedAt: "2026-02-10",
    author: "Weekly Music Awards",
    tags: ["mixage", "vocal", "rap", "compression", "EQ", "production musicale"],
    sections: [
      {
        heading: "Pourquoi le mixage vocal est crucial en Rap",
        content:
          "En Rap, la voix est l'instrument principal. Un bon mixage vocal fait la différence entre un morceau amateur et un titre professionnel. La voix doit être intelligible, percutante et parfaitement intégrée dans le beat, sans jamais le masquer ni être noyée dedans.\n\nLa qualité du mixage vocal influence directement le critère **Production** sur Weekly Music Awards, qui représente 30 % du score en catégorie Rap/Trap. Un mixage soigné peut faire gagner un point complet sur ce critère.",
      },
      {
        heading: "1. L'enregistrement : la base de tout",
        content:
          "Avant même de mixer, la qualité de l'enregistrement détermine 80 % du résultat final. Voici les fondamentaux :\n\n• **Microphone** : Un micro à condensateur large membrane (type AT2020, Rode NT1-A) est le standard. En budget serré, un SM58 dynamique donne d'excellents résultats en Trap.\n• **Traitement acoustique** : Même un simple filtre anti-réflexion derrière le micro améliore drastiquement la prise de son.\n• **Distance** : 15-20 cm du micro, avec un filtre anti-pop. Trop près = effet de proximité excessif. Trop loin = prise de son ambiante.\n• **Gain staging** : Visez un pic entre -12 dB et -6 dB. Jamais de clipping à l'entrée.",
        tip: "Enregistrez toujours en 24 bits / 48 kHz minimum. L'espace dynamique supplémentaire du 24 bits est crucial pour le traitement ultérieur.",
      },
      {
        heading: "2. La chaîne de traitement vocal",
        content:
          "L'ordre des plugins dans votre chaîne vocale a un impact majeur sur le résultat :\n\n**1. Nettoyage** : Noise gate (threshold autour de -40 dB) pour éliminer le bruit de fond entre les phrases.\n\n**2. EQ soustractive** : Coupez les fréquences inutiles. High-pass filter à 80-100 Hz pour éliminer les grondements. Réduisez les fréquences boueuses autour de 200-300 Hz si nécessaire.\n\n**3. Compression** : C'est le cœur du mixage rap. Ratio 3:1 à 4:1, attaque rapide (1-5 ms) pour contrôler les transitoires, release moyen (50-100 ms). Visez 3-6 dB de réduction de gain.\n\n**4. EQ additive** : Boostez légèrement la présence (2-5 kHz, +2 dB) et l'air (10-12 kHz, +1-2 dB en shelf).\n\n**5. De-esser** : Réduisez les sibilances excessives autour de 5-8 kHz. Soyez subtil — un de-essing trop agressif rend la voix sourde.",
        tip: "Utilisez deux compresseurs en série avec des réductions de gain modérées (3 dB chacun) plutôt qu'un seul compresseur poussé à -6 dB. Le résultat est plus musical et transparent.",
      },
      {
        heading: "3. Ad-libs, doubles et harmonies",
        content:
          "Les ad-libs et les doubles vocaux sont la signature du Rap moderne :\n\n• **Doubles** : Enregistrez une deuxième prise identique (pas de copier-coller). Panoramisez légèrement L/R (-15/+15). Réduisez le volume de 3-4 dB par rapport au lead.\n• **Ad-libs** : Plus d'effets autorisés — delay, reverb, pitch shift. Panoramisez plus large (L30/R30). Volume à -6/-8 dB du lead.\n• **Harmonies** : Si votre flow le permet, une tierce supérieure ou inférieure panoramisée large ajoute de la profondeur.\n\nLe traitement des ad-libs est un excellent moyen de se démarquer sur le critère **Originalité** (40 % du score en Rap/Trap sur Weekly Music Awards).",
      },
      {
        heading: "4. Spatialisation et effets",
        content:
          "La reverb et le delay donnent de la profondeur à la voix :\n\n• **Reverb** : En Rap, moins c'est plus. Un room court (0.5-1s) avec un pré-delay de 20-30 ms. Mix à 10-15 %. Trop de reverb = perte d'intelligibilité.\n• **Delay** : Un slap-back delay (30-80 ms, mono, 1 répétition) épaissit la voix sans la noyer. Un delay en 1/4 ou 1/8 de note crée du rythme.\n• **Saturation** : Une légère saturation (tape ou tube) ajoute de la chaleur et aide la voix à percer dans le mix.\n\nEnvoyez ces effets sur des bus auxiliaires (sends), jamais en insert direct sur la voix.",
        tip: "Automatisez le volume de la reverb : plus de reverb sur les fins de phrases, moins pendant les couplets rapides. Cela crée une respiration naturelle dans le mix.",
      },
      {
        heading: "5. Le mastering pour la compétition",
        content:
          "Pour soumettre un morceau sur Weekly Music Awards, le mastering final compte :\n\n• **Loudness** : Visez -14 LUFS intégrés pour un bon équilibre entre volume et dynamique. Les plateformes de streaming normalisent à ce niveau.\n• **True peak** : Ne dépassez jamais -1 dBTP pour éviter la distorsion lors de la conversion en formats compressés.\n• **Spectre** : Vérifiez que votre mix est équilibré avec un analyseur de spectre. Les basses (60-200 Hz) ne doivent pas dominer le reste.\n\nUn mastering soigné montre aux votants que vous maîtrisez votre production de bout en bout.",
      },
    ],
  },
  {
    slug: "creer-ambiance-lofi-parfaite",
    title: "Comment créer l'ambiance Lofi parfaite : atmosphère, texture et émotion",
    subtitle: "L'art de l'imperfection maîtrisée",
    description:
      "Maîtrisez les techniques de production Lofi : vinyle crackle, side-chain subtil, accords jazz, sampling, et comment créer une atmosphère émotionnelle authentique qui touche les auditeurs.",
    category: "Lofi / Chill",
    readTime: 10,
    publishedAt: "2026-02-15",
    author: "Weekly Music Awards",
    tags: ["lofi", "chill", "ambiance", "production", "sampling", "atmosphère"],
    sections: [
      {
        heading: "Le Lofi, c'est quoi exactement ?",
        content:
          "Le Lofi (Low Fidelity) est un genre musical qui embrasse l'imperfection comme outil artistique. Né de la culture du sampling hip-hop et du jazz, il se caractérise par des textures granuleuses, des craquements de vinyle, des harmonies jazz et une atmosphère intimiste.\n\nSur Weekly Music Awards, la catégorie Lofi/Chill accorde **45 % du score à l'Émotion** — la capacité du morceau à créer un espace émotionnel authentique. C'est le critère le plus élevé de toutes les catégories, ce qui reflète l'essence même du genre.",
      },
      {
        heading: "1. Les fondations harmoniques",
        content:
          "Le Lofi repose sur des progressions d'accords riches et mélancoliques :\n\n• **Accords jazz** : Utilisez des 7èmes (maj7, min7), des 9èmes et des accords suspendus. La progression ii-V-I en mineur est un classique du genre.\n• **Voicings** : Évitez les accords plaqués basiques. Utilisez des voicings ouverts avec des notes communes entre les accords pour créer de la fluidité.\n• **Rhodes / Wurlitzer** : Le piano électrique est l'instrument roi du Lofi. Appliquez un léger chorus et un tremolo pour cette chaleur caractéristique.\n• **Tempo** : 70-90 BPM. Le sweet spot se situe autour de 80 BPM — assez lent pour être relaxant, assez rapide pour maintenir un groove.",
        tip: "Jouez vos accords légèrement en avance ou en retard par rapport à la grille (humanisation). Le Lofi déteste la perfection mécanique.",
      },
      {
        heading: "2. La batterie et le groove",
        content:
          "Le pattern de batterie Lofi est déceptivement simple :\n\n• **Kick** : Doux, arrondi, sans claquement. Filtrez les hautes fréquences au-dessus de 5 kHz.\n• **Snare** : Un rimshot étouffé ou un clap lo-fi. Ajoutez du bruit de fond (noise layer) pour la texture.\n• **Hi-hats** : Swing à 60-70 %. Variez les vélocités manuellement. Ajoutez des ghost notes entre les temps principaux.\n• **Side-chain** : Un side-chain très subtil (1-2 dB) sur les pads et le piano crée cette respiration caractéristique sans être aussi prononcé qu'en EDM.\n\nLe secret : chaque élément doit sonner comme s'il venait d'un sampler MPC des années 90.",
      },
      {
        heading: "3. Textures et ambiances",
        content:
          "Les textures sont ce qui transforme un beat en une ambiance :\n\n• **Vinyle crackle** : Le son de craquement de vinyle est la signature du Lofi. Utilisez des samples de bruit de vinyle en boucle, mixés à -20/-25 dB.\n• **Foley** : Bruits de pluie, café qui coule, pages qui tournent, conversations lointaines. Ces éléments créent un décor sonore immersif.\n• **Tape saturation** : Appliquez une saturation de bande (tape emulation) sur le bus master pour coller tous les éléments ensemble.\n• **Bitcrusher** : Un léger bit-crushing (12-14 bits) sur certains éléments ajoute cette qualité lo-fi sans détruire la lisibilité.",
        tip: "Superposez 2-3 couches de texture à des volumes très bas. L'auditeur ne les entend pas consciemment, mais il les ressent. C'est ce qui fait la différence sur le critère Émotion.",
      },
      {
        heading: "4. Le sampling avec respect",
        content:
          "Le sampling est au cœur de la culture Lofi, mais il faut le faire intelligemment :\n\n• **Sources libres** : Utilisez des samples du domaine public (jazz pre-1926, Creative Commons) ou des packs de samples dédiés.\n• **Transformation** : Ne vous contentez pas de boucler un sample. Changez la tonalité, le tempo, appliquez des effets, réarrangez les sections.\n• **Originalité** : Sur Weekly Music Awards, 25 % du score Lofi est attribué à l'Originalité. Un sample trop reconnaissable sans transformation significative sera pénalisé par les votants.\n\n**Important pour la compétition** : Vous devez détenir les droits sur tous les éléments de votre morceau. Déclarez-le lors de la soumission.",
      },
      {
        heading: "5. Mixage et finalisation",
        content:
          "Le mixage Lofi a ses propres règles :\n\n• **High-cut global** : Un filtre passe-bas léger à 12-15 kHz sur le bus master adoucit l'ensemble. Le Lofi n'a pas besoin de brillance excessive.\n• **Mono-compatibilité** : Beaucoup d'auditeurs écoutent le Lofi sur des enceintes de téléphone. Vérifiez que votre mix fonctionne en mono.\n• **Dynamique** : Ne sur-compressez pas le master. Le Lofi a besoin de respiration dynamique. Visez -16 à -14 LUFS.\n• **Longueur** : 1:30 à 3:00 minutes. Le Lofi est un genre de moments, pas de développements symphoniques.\n\nPour soumettre sur Weekly Music Awards, votre extrait audio (30-60 secondes) doit capturer l'essence de l'ambiance. Choisissez le passage le plus atmosphérique.",
      },
    ],
  },
  {
    slug: "sound-design-edm-debutant",
    title: "Sound design en EDM : créer des sons uniques qui marquent les esprits",
    subtitle: "De la synthèse soustractive au design de drops mémorables",
    description:
      "Apprenez les fondamentaux du sound design en musique électronique : synthèse soustractive, wavetable, FM, design de basses, leads, et comment créer un drop EDM percutant. Guide pratique avec exemples.",
    category: "Électro / EDM",
    readTime: 14,
    publishedAt: "2026-02-20",
    author: "Weekly Music Awards",
    tags: ["sound design", "EDM", "synthèse", "électro", "production", "serum", "basse"],
    sections: [
      {
        heading: "Le sound design, arme secrète de l'EDM",
        content:
          "En musique électronique, le sound design est ce qui différencie un producteur amateur d'un artiste reconnu. Là où d'autres genres s'appuient sur l'interprétation ou le songwriting, l'EDM repose sur la création de sons inédits.\n\nSur Weekly Music Awards, la catégorie Électro/EDM accorde **40 % du score à la Production** — le plus haut coefficient de toutes les catégories. Le sound design est au cœur de ce critère : qualité des sons, originalité des textures, et maîtrise technique du mixage.",
      },
      {
        heading: "1. Les 3 types de synthèse essentiels",
        content:
          "Chaque type de synthèse a ses forces :\n\n**Synthèse soustractive** (Serum, Massive, Sylenth1)\nPrincipe : partir d'une forme d'onde riche (saw, square) et sculpter le son en filtrant des fréquences. C'est la base de 90 % des sons EDM.\n• Leads : Supersaw (3-7 voix désaccordées) + filtre passe-bas avec envelope.\n• Basses : Square wave + sub sine layer + distortion.\n\n**Synthèse wavetable** (Serum, Vital)\nPrincipe : parcourir une table d'ondes pour créer des sons évolutifs. Parfait pour les pads cinématiques et les textures.\n• Avantage : Possibilité d'importer vos propres wavetables à partir de samples.\n\n**Synthèse FM** (FM8, Operator)\nPrincipe : modulation de fréquence entre oscillateurs. Produit des harmoniques métalliques et complexes.\n• Usage : Basses FM (style Skrillex), bells, textures cristallines.\n• Attention : Plus difficile à maîtriser, mais les résultats sont uniques.",
        tip: "Commencez par maîtriser la synthèse soustractive dans Serum ou Vital (gratuit). 80 % des sons EDM professionnels sont créés avec cette technique.",
      },
      {
        heading: "2. Créer une basse EDM percutante",
        content:
          "La basse est le pilier de tout morceau EDM :\n\n• **Layer 1 — Sub** : Onde sinusoïdale pure à l'octave inférieure. C'est la fondation. Pas de traitement, juste du volume.\n• **Layer 2 — Mid-bass** : Onde carrée ou saw avec un filtre passe-bande (200-800 Hz). C'est ici que se joue le caractère du son.\n• **Layer 3 — Harmoniques** : Distortion, waveshaping ou FM pour ajouter du contenu harmonique au-dessus de 1 kHz.\n\n**Traitement** :\n• Sidechain le sub au kick (4-6 dB de réduction, release rapide).\n• Saturation sur le mid-bass pour faire ressortir les harmoniques sur petites enceintes.\n• Limiteur doux sur le bus basse pour contenir les pics.\n\nLa clé : le sub doit être mono, le mid-bass peut être légèrement stéréo, les harmoniques peuvent être larges.",
      },
      {
        heading: "3. Designer un lead mémorable",
        content:
          "Un bon lead EDM est reconnaissable en 2 secondes :\n\n• **Supersaw** : 5-7 voix désaccordées (detune 10-25 cents). Filtre passe-bas avec envelope (attack 0, decay moyen, sustain 70%). Ajoutez du chorus et un léger delay.\n• **Pluck** : Attack instantanée, decay court (100-300 ms), pas de sustain. Parfait pour les mélodies arpégées. Ajoutez de la reverb pour la spatialisation.\n• **Vocal chop lead** : Samplez une voix (même la vôtre), découpez-la en syllabes, pitch-shiftez et jouez-la comme un instrument. Très original et excellent pour le critère Originalité (35 %).\n\n**Automation** : Automatisez le cutoff du filtre, le detune, et la largeur stéréo tout au long du morceau. Un son qui évolue est un son qui captive.",
        tip: "Référencez les leads de vos morceaux préférés. Analysez-les avec un spectrogramme pour comprendre leur contenu fréquentiel, puis recréez-les avec vos propres réglages.",
      },
      {
        heading: "4. Structurer un drop efficace",
        content:
          "Le drop est le moment de vérité en EDM :\n\n**Build-up** (8-16 mesures avant le drop) :\n• Riser (bruit blanc avec filtre passe-haut qui monte progressivement)\n• Snare roll avec accélération (1/4 → 1/8 → 1/16 → 1/32)\n• Filtre passe-haut progressif sur le bus master\n• Automation de la reverb (de plus en plus de reverb)\n\n**Impact** (le moment du drop) :\n• Silence d'1/8 de mesure juste avant le drop (le silence crée l'impact)\n• Crash cymbal + impact FX\n• Kick + sub en pleine puissance\n• Retrait immédiat de tous les effets du build-up\n\n**Le drop lui-même** :\n• Énergie maximale concentrée dans les 8 premières mesures\n• Lead principal + basse + drums à pleine puissance\n• Variation toutes les 4 mesures pour maintenir l'attention",
      },
      {
        heading: "5. Mixage et mastering EDM",
        content:
          "L'EDM a des exigences techniques élevées :\n\n• **Headroom** : Laissez -6 dB de headroom sur le bus master avant le mastering.\n• **Sidechain** : Tout doit respirer avec le kick. Appliquez un sidechain au moins sur les basses, pads et leads.\n• **Stéréo** : Sub en mono, kicks en mono, tout le reste peut être en stéréo. Vérifiez la compatibilité mono.\n• **Loudness** : L'EDM est le genre le plus fort. Visez -8 à -6 LUFS pour le master, mais attention à la distorsion.\n• **True peak** : -0.5 dBTP maximum.\n\nPour Weekly Music Awards, soumettez un extrait de 30-60 secondes qui inclut idéalement un build-up et un drop. C'est la séquence la plus représentative de votre production.",
        tip: "Comparez votre mix avec des références professionnelles du même sous-genre (Progressive House, Dubstep, Future Bass…). Le level matching est essentiel : baissez la référence au même volume que votre mix avant de comparer.",
      },
    ],
  },
  {
    slug: "ecrire-chanson-pop-accrocheuse",
    title: "Écrire une chanson Pop accrocheuse : structure, mélodie et hook",
    subtitle: "Les secrets des hits qui restent en tête",
    description:
      "Découvrez les techniques de songwriting Pop : structure couplet-refrain, écriture de hooks mémorables, progression d'accords, et comment captiver les auditeurs dès les 10 premières secondes.",
    category: "Pop",
    readTime: 11,
    publishedAt: "2026-02-25",
    author: "Weekly Music Awards",
    tags: ["pop", "songwriting", "mélodie", "hook", "structure", "composition"],
    sections: [
      {
        heading: "La Pop : l'art de l'accessibilité",
        content:
          "La Pop est le genre musical le plus exigeant en termes de craft. Contrairement à l'idée reçue, écrire une chanson Pop accrocheuse est extrêmement difficile : il faut être mémorable en 3 minutes, toucher un public large sans être générique, et maîtriser une production impeccable.\n\nSur Weekly Music Awards, la catégorie Pop répartit ses scores de manière équilibrée : **30 % Émotion, 35 % Originalité, 35 % Production**. Cet équilibre reflète la triple exigence du genre : une chanson Pop doit toucher, surprendre et sonner parfaitement.",
      },
      {
        heading: "1. La structure qui fonctionne",
        content:
          "La structure Pop standard a fait ses preuves :\n\n**Intro (4-8 mesures)** : Établissez l'ambiance immédiatement. En 2026, les intros longues sont mortes — captivez en 5 secondes.\n\n**Couplet 1 (8-16 mesures)** : Racontez l'histoire, posez le contexte. Mélodie plus basse et intime que le refrain.\n\n**Pré-refrain (4-8 mesures)** : Montez la tension. Accélérez le rythme harmonique, montez la mélodie.\n\n**Refrain (8-16 mesures)** : Le hook principal. C'est ici que se joue tout. Si votre refrain n'est pas mémorable, rien d'autre ne compte.\n\n**Pont (4-8 mesures)** : Cassez la routine. Nouveau point de vue, nouvelle couleur harmonique.\n\n**Durée totale** : 2:30 à 3:30. Pour votre extrait de soumission sur Weekly Music Awards, choisissez un passage qui inclut le refrain — c'est votre meilleur atout.",
        tip: "Testez votre chanson en la fredonnant sans accompagnement. Si la mélodie est mémorable a cappella, elle fonctionnera avec n'importe quelle production.",
      },
      {
        heading: "2. Écrire un hook qui reste en tête",
        content:
          "Le hook est la phrase musicale qu'on ne peut pas oublier :\n\n• **Simplicité** : Les meilleurs hooks utilisent 3-5 notes maximum. Pensez « Happy Birthday » — 6 notes, connu universellement.\n• **Répétition** : Répétez le hook 3-4 fois dans le refrain, avec de légères variations.\n• **Rythme** : Un bon hook a un rythme distinctif, pas seulement une mélodie. Mélangez valeurs longues et courtes.\n• **Interval leap** : Un saut d'intervalle (quarte, quinte, octave) au début du hook le rend immédiatement reconnaissable.\n• **Paroles** : Le hook lyrique doit être universel mais spécifique. « I Will Always Love You » est simple mais puissant.\n\nLe critère Originalité (35 %) sur Weekly Music Awards récompense les hooks qui surprennent — trouvez un angle mélodique que personne n'a encore exploré.",
      },
      {
        heading: "3. Progressions d'accords Pop",
        content:
          "Les progressions qui fonctionnent en Pop :\n\n• **I-V-vi-IV** : La progression la plus utilisée (Let It Be, Someone Like You). Efficace mais attendue — ajoutez votre touche.\n• **vi-IV-I-V** : Version mineure de la précédente. Plus mélancolique, très utilisée en Pop actuelle.\n• **I-vi-IV-V** : Classique des années 50-60, retour en force avec un traitement moderne.\n• **I-IV-vi-V** : Variante ouverte, sensation d'élan constant.\n\n**Pour se démarquer** : Ajoutez des accords de passage, des substitutions (♭VII au lieu de V), ou changez la progression entre couplet et refrain. Les votants sur Weekly Music Awards apprécient l'originalité harmonique.",
        tip: "Essayez de commencer votre chanson sur un accord inattendu (IV ou vi au lieu de I). Cela crée immédiatement une tension qui donne envie d'écouter la suite.",
      },
      {
        heading: "4. Production Pop moderne",
        content:
          "Les standards de production Pop en 2026 :\n\n• **Voix** : Traitée mais naturelle. Pitch correction subtile (pas d'effet autotune sauf choix artistique). Doubles et harmonies pour le refrain.\n• **Drums** : Samples modernes et cleans. Kick avec du punch (60-80 Hz), snare avec du corps (200 Hz) et du snap (5 kHz). Hi-hats programmés mais humanisés.\n• **Synthés** : Pads chauds (analog-style), plucks pour le rythme harmonique, arps pour le mouvement.\n• **Basse** : Ronde et présente. Sub + harmoniques. Suit la ligne mélodique de la voix sans la masquer.\n• **Espace** : Couplet minimal → pré-refrain en build → refrain dense. Le contraste de densité crée l'impact.",
      },
      {
        heading: "5. Optimiser votre soumission",
        content:
          "Pour maximiser votre score sur Weekly Music Awards en catégorie Pop :\n\n• **Extrait** : Choisissez les 30-60 secondes qui incluent votre refrain. Les votants doivent entendre votre hook.\n• **Couverture** : L'image de couverture est la première impression. Investissez dans un visuel professionnel.\n• **Description** : Décrivez votre processus créatif et vos influences. Les votants engagés lisent les descriptions.\n• **Tags** : Utilisez des tags précis (pop, synthpop, indie-pop…) pour que les auditeurs qui aiment votre sous-genre vous trouvent.\n\nRappel : le classement est 100 % méritocratique. Aucun abonnement ne booste votre position. Seule la qualité de votre musique et l'engagement de la communauté comptent.",
      },
    ],
  },
  {
    slug: "guide-production-rnb-soul",
    title: "Produire du R&B/Soul authentique : groove, harmonies et émotion",
    subtitle: "Créer une connexion émotionnelle profonde par la musique",
    description:
      "Guide de production R&B et Soul : groove rythmique, harmonies sophistiquées, traitement vocal, et comment créer un morceau qui touche profondément les auditeurs. Techniques et conseils d'experts.",
    category: "R&B / Soul",
    readTime: 11,
    publishedAt: "2026-03-01",
    author: "Weekly Music Awards",
    tags: ["r&b", "soul", "groove", "harmonies", "production", "vocal"],
    sections: [
      {
        heading: "R&B et Soul : l'émotion avant tout",
        content:
          "Le R&B et la Soul sont les genres de l'émotion pure. Plus que tout autre style, ils reposent sur la capacité de l'artiste à transmettre un sentiment authentique — qu'il s'agisse d'amour, de douleur, de joie ou de vulnérabilité.\n\nSur Weekly Music Awards, la catégorie R&B/Soul accorde **40 % du score à l'Émotion**, le deuxième coefficient le plus élevé après le Lofi. Si votre morceau ne touche pas les auditeurs au cœur, la technique seule ne suffira pas.",
      },
      {
        heading: "1. Le groove R&B",
        content:
          "Le groove est l'ADN du R&B :\n\n• **Tempo** : 65-100 BPM. Le R&B contemporain se situe souvent autour de 70-85 BPM.\n• **Kick** : Profond et arrondi, souvent en syncope. Moins d'attaque que dans le hip-hop, plus de corps.\n• **Snare/Clap** : Sur le 2 et le 4, mais avec des ghost notes sur le 2.5 ou le 3.5 pour le swing.\n• **Hi-hats** : Swing prononcé (70-80 %). Variez constamment les vélocités et les patterns. Les triolets de hi-hats sont une signature du R&B moderne.\n• **Percussion** : Ajoutez des shakers, finger snaps, ou rim clicks pour la texture.\n\nLe groove R&B doit donner envie de bouger la tête inconsciemment.",
        tip: "Programmez votre batterie en jouant sur un pad controller plutôt qu'en dessinant des notes sur une grille. Le feeling humain est irremplaçable en R&B.",
      },
      {
        heading: "2. Harmonies sophistiquées",
        content:
          "Le R&B est le genre des accords riches :\n\n• **Extensions** : Utilisez systématiquement des 7èmes, 9èmes, 11èmes et 13èmes. Un accord Cmaj7 sonne R&B, un accord C sonne Pop.\n• **Chromatisme** : Les mouvements chromatiques entre les accords (ii-♭II-I, ou I-♯I°-ii) ajoutent de la sophistication.\n• **Neo-soul** : Accords diminués, augmentés et altérés. Les substitutions tritoniques sont courantes.\n• **Voicings** : Jouez les accords en inversions, pas en position fondamentale. Un Fmaj9/A sonne beaucoup plus R&B qu'un Fmaj9.\n\nLes harmonies sont un excellent moyen de se démarquer sur le critère Originalité (30 %).",
      },
      {
        heading: "3. La voix : instrument central",
        content:
          "En R&B/Soul, la performance vocale est tout :\n\n• **Enregistrement** : Micro à condensateur de qualité (U87, C414, ou TLM103). Préparez la session avec un warm-up vocal.\n• **Ad-libs** : Les runs, riffs et ad-libs vocaux sont la signature du genre. Enregistrez plusieurs prises et gardez les meilleurs moments.\n• **Harmonies** : Construisez des harmonies à 3-4 voix sur les refrains. Tierces et sixtes sont les intervalles de base, ajoutez des 7èmes et 9èmes pour la richesse.\n• **Traitement** : Compression douce (2:1-3:1), EQ chaude (boost autour de 300 Hz pour le corps, 3-5 kHz pour la présence). Reverb plate ou hall douce.\n• **Falsetto** : Le passage chest-falsetto est un moment émotionnel puissant en R&B. Pratiquez les transitions douces.\n\nC'est sur la voix que se joue principalement le critère Émotion (40 %).",
        tip: "Enregistrez la même section 4-5 fois et compilez (comping) les meilleures syllabes de chaque prise. C'est la technique standard en R&B professionnel.",
      },
      {
        heading: "4. Instruments et textures",
        content:
          "Les ingrédients sonores du R&B moderne :\n\n• **Rhodes/Wurlitzer** : Piano électrique avec tremolo et légère saturation. L'instrument signature du genre.\n• **Guitare** : Clean, avec chorus léger. Accords jazz ou arpeggios délicats. La guitare ajoute de l'humanité.\n• **Basse** : Fingerstyle ou synthé, mais toujours groovy. La basse R&B dialogue avec le kick, elle ne se contente pas de jouer la fondamentale.\n• **Strings** : Cordes arrangées en pad, pas en staccato. Volume bas, elles créent de la profondeur émotionnelle.\n• **808** : Le R&B moderne emprunte le 808 au hip-hop, mais avec moins de distortion et plus de sustain.\n\nMélanger instruments live et programmation électronique est la marque du R&B contemporain.",
      },
      {
        heading: "5. Conseils pour la compétition",
        content:
          "Maximisez votre impact sur Weekly Music Awards :\n\n• **Extrait** : Choisissez le passage le plus émotionnel — souvent le refrain ou le pont avec les harmonies complètes.\n• **Authenticité** : Les votants R&B sont des connaisseurs. Ils reconnaissent l'émotion authentique versus l'émotion fabriquée. Soyez sincère.\n• **Production** : Un mix équilibré où la voix est mise en avant sans écraser les instruments. Le R&B est un genre de nuances.\n• **Originalité** : Fusionnez le R&B avec d'autres influences (Afro, Jazz, Électro) pour vous démarquer. Les plus belles innovations viennent des croisements de genres.\n\nLe R&B est un genre où l'émotion prime sur la technique. Un morceau techniquement imparfait mais sincère touchera davantage qu'une production cliniquement parfaite mais froide.",
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
