
ALTER TABLE public.categories ADD COLUMN production_tips jsonb DEFAULT '[]'::jsonb;

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "70-170 selon le sous-genre"},
  {"label": "Instruments clés", "value": "808, hi-hats, synthés, voix auto-tunées ou brutes"},
  {"label": "Durée idéale", "value": "2min30 - 3min30"},
  {"label": "Conseil", "value": "Soigne ton mix vocal : le rap met la voix au centre. Les couplets doivent groover, le refrain doit accrocher."}
]'::jsonb WHERE slug = 'rap-trap';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "100-130"},
  {"label": "Instruments clés", "value": "Synthés, guitare acoustique, piano, drops vocaux"},
  {"label": "Durée idéale", "value": "3min - 3min45"},
  {"label": "Conseil", "value": "La mélodie est reine. Un bon hook vocal qui reste en tête fait toute la différence. Pense structure couplet-refrain-pont."}
]'::jsonb WHERE slug = 'pop';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "100-125"},
  {"label": "Instruments clés", "value": "Percussions (djembé, congas, shakers), guitare, basse groovy, cuivres"},
  {"label": "Durée idéale", "value": "3min - 4min"},
  {"label": "Conseil", "value": "Le groove est sacré. Laisse respirer tes percussions et construis des couches rythmiques qui donnent envie de danser."}
]'::jsonb WHERE slug = 'afro';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "120-150"},
  {"label": "Instruments clés", "value": "Synthétiseurs, drum machines, samples, effets (reverb, delay, sidechain)"},
  {"label": "Durée idéale", "value": "3min - 5min"},
  {"label": "Conseil", "value": "Le sound design fait la différence. Crée des textures uniques et soigne tes transitions. Un bon build-up + drop = émotion garantie."}
]'::jsonb WHERE slug = 'electronic';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "60-90"},
  {"label": "Instruments clés", "value": "Piano, guitare, basse, cordes, voix avec harmonies"},
  {"label": "Durée idéale", "value": "3min - 4min"},
  {"label": "Conseil", "value": "L''émotion dans la voix prime sur la technique. Les harmonies vocales et les arrangements subtils font la magie du R&B."}
]'::jsonb WHERE slug = 'rnb';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "70-90"},
  {"label": "Instruments clés", "value": "Samples de jazz/soul, vinyle crackle, piano rhodes, boom-bap drums"},
  {"label": "Durée idéale", "value": "1min30 - 3min"},
  {"label": "Conseil", "value": "Moins c''est plus. Laisse de l''espace, joue sur les textures lo-fi (saturation, bitcrushing) et crée une ambiance immersive."}
]'::jsonb WHERE slug = 'lofi';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "110-180"},
  {"label": "Instruments clés", "value": "Guitare électrique/acoustique, basse, batterie, synthés"},
  {"label": "Durée idéale", "value": "3min - 5min"},
  {"label": "Conseil", "value": "L''énergie et l''authenticité comptent plus que la perfection. Un bon riff + une dynamique couplet calme / refrain explosif = formule gagnante."}
]'::jsonb WHERE slug = 'rock-indie';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "Libre (60-200+)"},
  {"label": "Instruments clés", "value": "Tout est permis : orchestre, instruments traditionnels, electronics, voix"},
  {"label": "Durée idéale", "value": "2min - 6min"},
  {"label": "Conseil", "value": "C''est ta catégorie pour expérimenter sans limites. Surprends-nous avec des mélanges inattendus et une identité sonore forte."}
]'::jsonb WHERE slug = 'open';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "120-140"},
  {"label": "Instruments clés", "value": "Platines, CDJ, contrôleurs, effets live, samples"},
  {"label": "Durée idéale", "value": "3min - 6min"},
  {"label": "Conseil", "value": "Montre ta patte : transitions créatives, sélection musicale pointue et énergie constante. Le mix doit raconter une histoire."}
]'::jsonb WHERE slug = 'dj';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "65-95"},
  {"label": "Instruments clés", "value": "Basse (obligatoire), guitare skank, orgue, cuivres, percussions"},
  {"label": "Durée idéale", "value": "3min - 4min30"},
  {"label": "Conseil", "value": "Le offbeat est la signature du reggae. Une basse profonde et un riddim solide sont non-négociables. Laisse le groove respirer."}
]'::jsonb WHERE slug = 'reggae';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "100-140"},
  {"label": "Instruments clés", "value": "Guitare acoustique/électrique, banjo, fiddle, steel guitar, voix"},
  {"label": "Durée idéale", "value": "3min - 4min"},
  {"label": "Conseil", "value": "Le storytelling est l''âme du country. Une bonne histoire + une mélodie sincère + des arrangements organiques = un morceau qui touche."}
]'::jsonb WHERE slug = 'country';

UPDATE public.categories SET production_tips = '[
  {"label": "BPM", "value": "80-200 (très variable)"},
  {"label": "Instruments clés", "value": "Piano, contrebasse, batterie jazz, cuivres (saxophone, trompette), guitare"},
  {"label": "Durée idéale", "value": "3min - 7min"},
  {"label": "Conseil", "value": "Le jazz, c''est la conversation entre musiciens. Laisse de la place à l''improvisation, joue avec les tensions harmoniques et surprends l''oreille."}
]'::jsonb WHERE slug = 'jazz';
