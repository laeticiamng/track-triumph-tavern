
ALTER TABLE public.categories ADD COLUMN scoring_criteria jsonb DEFAULT '[]'::jsonb;

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 30, "description": "Le flow transmet-il une énergie, une rage, une mélancolie ? Le texte touche-t-il ?"},
  {"criterion": "Originalité", "weight": 40, "description": "Le morceau se démarque-t-il du tout-venant ? Punchlines, flows inventifs, concepts frais."},
  {"criterion": "Production", "weight": 30, "description": "Qualité du beat, mix vocal propre, mastering équilibré."}
]'::jsonb WHERE slug = 'rap-trap';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 40, "description": "La mélodie accroche-t-elle ? Le refrain reste-t-il en tête ? Ressent-on quelque chose ?"},
  {"criterion": "Originalité", "weight": 25, "description": "Le morceau apporte-t-il sa touche personnelle ou sonne-t-il générique ?"},
  {"criterion": "Production", "weight": 35, "description": "Arrangements soignés, mix clair, voix bien traitée."}
]'::jsonb WHERE slug = 'pop';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 35, "description": "Le groove donne-t-il envie de bouger ? L''énergie est-elle communicative ?"},
  {"criterion": "Originalité", "weight": 30, "description": "Mélange de traditions et de modernité, identité sonore africaine assumée."},
  {"criterion": "Production", "weight": 35, "description": "Percussions bien mixées, basse présente, espace sonore aéré."}
]'::jsonb WHERE slug = 'afro';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 30, "description": "Le morceau crée-t-il un voyage sonore ? Le drop provoque-t-il une réaction ?"},
  {"criterion": "Originalité", "weight": 35, "description": "Sound design unique, structures non conventionnelles, textures inédites."},
  {"criterion": "Production", "weight": 35, "description": "Qualité du mixage, mastering puissant, transitions maîtrisées."}
]'::jsonb WHERE slug = 'electronic';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 45, "description": "La voix transmet-elle de la vulnérabilité, de la sensualité, de la profondeur ?"},
  {"criterion": "Originalité", "weight": 25, "description": "Harmonies inattendues, arrangements qui surprennent, identité vocale unique."},
  {"criterion": "Production", "weight": 30, "description": "Voix bien produite, arrangements subtils, basse et batterie en place."}
]'::jsonb WHERE slug = 'rnb';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 45, "description": "L''ambiance est-elle immersive ? Ressent-on la nostalgie, le calme, la contemplation ?"},
  {"criterion": "Originalité", "weight": 30, "description": "Choix de samples surprenants, textures lo-fi créatives, atmosphère unique."},
  {"criterion": "Production", "weight": 25, "description": "L''imperfection est bienvenue, mais le morceau doit rester agréable à écouter."}
]'::jsonb WHERE slug = 'lofi';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 35, "description": "L''énergie est-elle palpable ? Le morceau donne-t-il des frissons ou envie de headbanger ?"},
  {"criterion": "Originalité", "weight": 35, "description": "Riffs mémorables, structures inventives, identité propre au-delà des influences."},
  {"criterion": "Production", "weight": 30, "description": "Son brut accepté, mais guitares/basse/batterie doivent être lisibles dans le mix."}
]'::jsonb WHERE slug = 'rock-indie';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 35, "description": "Le morceau raconte-t-il quelque chose ? Provoque-t-il une réaction forte ?"},
  {"criterion": "Originalité", "weight": 40, "description": "C''est LA catégorie de l''expérimentation. On attend de la surprise et de l''audace."},
  {"criterion": "Production", "weight": 25, "description": "Cohérence sonore, même dans le chaos. Le morceau doit tenir debout."}
]'::jsonb WHERE slug = 'open';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 30, "description": "Le mix crée-t-il une montée d''énergie ? Donne-t-il envie de danser sans s''arrêter ?"},
  {"criterion": "Originalité", "weight": 40, "description": "Sélection musicale pointue, transitions créatives, signature sonore du DJ."},
  {"criterion": "Production", "weight": 30, "description": "Calage parfait, mix propre, effets bien dosés."}
]'::jsonb WHERE slug = 'dj';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 40, "description": "Le riddim touche-t-il l''âme ? Les paroles portent-elles un message fort ?"},
  {"criterion": "Originalité", "weight": 25, "description": "Réinterprétation du genre avec une touche personnelle, fusion avec d''autres styles."},
  {"criterion": "Production", "weight": 35, "description": "Basse profonde et claire, offbeat précis, voix bien placée dans le mix."}
]'::jsonb WHERE slug = 'reggae';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 45, "description": "L''histoire racontée est-elle touchante ? La voix transmet-elle de la sincérité ?"},
  {"criterion": "Originalité", "weight": 25, "description": "Approche fraîche du storytelling country, mélange moderne/traditionnel."},
  {"criterion": "Production", "weight": 30, "description": "Instruments acoustiques bien enregistrés, voix naturelle, mix organique."}
]'::jsonb WHERE slug = 'country';

UPDATE public.categories SET scoring_criteria = '[
  {"criterion": "Émotion", "weight": 35, "description": "Le morceau crée-t-il une atmosphère ? Les improvisations sont-elles habitées ?"},
  {"criterion": "Originalité", "weight": 35, "description": "Harmonie, rythme ou structure qui sortent des sentiers battus."},
  {"criterion": "Production", "weight": 30, "description": "Captation fidèle des instruments, espace sonore, dynamique naturelle."}
]'::jsonb WHERE slug = 'jazz';
