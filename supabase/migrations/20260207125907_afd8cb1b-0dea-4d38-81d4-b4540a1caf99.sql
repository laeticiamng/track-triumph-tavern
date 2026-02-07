
-- Add new columns to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS history text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS notable_artists text[];

-- Insert DJ category
INSERT INTO public.categories (name, slug, sort_order)
VALUES ('DJ', 'dj', 9)
ON CONFLICT DO NOTHING;

-- Populate data for all categories
UPDATE public.categories SET
  description = 'Du boom-bap au trap, le rap est le porte-voix des rues devenu culture mondiale.',
  history = 'Né dans le Bronx à la fin des années 1970, le rap est une expression artistique issue de la culture hip-hop. Des block parties animées par DJ Kool Herc aux premiers enregistrements de Sugarhill Gang, le genre a rapidement évolué. Les années 1990 ont vu l''âge d''or avec le duel East Coast/West Coast, portés par Tupac et Notorious B.I.G. Le nouveau millénaire a apporté le crunk, le snap, puis le trap d''Atlanta qui domine aujourd''hui les charts mondiaux. Le rap est devenu le genre musical le plus écouté en streaming.',
  notable_artists = ARRAY['Tupac', 'Notorious B.I.G.', 'Eminem', 'Kendrick Lamar', 'Travis Scott', 'Future', 'Jay-Z']
WHERE slug = 'rap-trap';

UPDATE public.categories SET
  description = 'Mélodies accrocheuses et production léchée : la pop transcende les frontières.',
  history = 'La pop moderne trouve ses racines dans le rock ''n'' roll des années 1950 et la Beatlemania des années 1960. Michael Jackson a redéfini le genre dans les années 1980 avec des clips révolutionnaires. Madonna a repoussé les limites culturelles. Les années 2000 ont vu l''explosion de la pop numérique avec Britney Spears et les boys bands, avant que des artistes comme Beyoncé, Taylor Swift et The Weeknd ne fusionnent la pop avec le R&B, l''indie et l''électronique pour créer un son toujours en mutation.',
  notable_artists = ARRAY['Michael Jackson', 'Madonna', 'Beyoncé', 'Taylor Swift', 'The Weeknd', 'Adele']
WHERE slug = 'pop';

UPDATE public.categories SET
  description = 'Rythmes envoûtants venus d''Afrique qui conquièrent le monde entier.',
  history = 'L''Afrobeat est né au Nigeria dans les années 1970 sous l''impulsion de Fela Kuti, qui a fusionné jazz, funk et rythmes yoruba pour créer un son politique et dansant. Après des décennies d''évolution locale, le genre a explosé mondialement dans les années 2010 grâce à Wizkid, Burna Boy et Davido. L''Afro-fusion, l''Amapiano sud-africain et l''Afro-pop ont conquis les charts internationaux, faisant de la musique africaine une force incontournable de la pop culture mondiale.',
  notable_artists = ARRAY['Fela Kuti', 'Burna Boy', 'Wizkid', 'Tiwa Savage', 'Angélique Kidjo', 'Davido']
WHERE slug = 'afro';

UPDATE public.categories SET
  description = 'Synthétiseurs, beats et basses : l''électronique repousse les limites sonores.',
  history = 'La musique électronique est née dans les laboratoires des années 1960-70 avec Kraftwerk et les premiers synthétiseurs. La house music de Chicago et la techno de Detroit dans les années 1980 ont créé les fondations des clubs modernes. Les années 1990 ont vu la rave culture exploser en Europe. Daft Punk a révolutionné le genre avec leur French Touch. Aujourd''hui, l''EDM, la bass music et les sous-genres comme le dubstep et la future bass continuent de repousser les frontières sonores.',
  notable_artists = ARRAY['Daft Punk', 'Kraftwerk', 'Aphex Twin', 'Deadmau5', 'Skrillex', 'Calvin Harris']
WHERE slug = 'electronic';

UPDATE public.categories SET
  description = 'Soul, groove et émotion : le R&B est la bande-son de l''intime.',
  history = 'Le Rhythm and Blues est né dans les communautés afro-américaines des années 1940, fusionnant gospel, jazz et blues. Stevie Wonder et Marvin Gaye ont porté le genre vers de nouveaux sommets dans les années 1970. Whitney Houston et Michael Jackson ont dominé les années 1980-90. Le new jack swing puis le R&B contemporain d''Usher, Aaliyah et TLC ont modernisé le son. Aujourd''hui, Frank Ocean, SZA et Daniel Caesar mêlent R&B avec indie, électronique et hip-hop pour un son plus introspectif.',
  notable_artists = ARRAY['Stevie Wonder', 'Whitney Houston', 'Usher', 'Frank Ocean', 'SZA', 'Daniel Caesar']
WHERE slug = 'rnb';

UPDATE public.categories SET
  description = 'Beats chill et ambiances relaxantes pour étudier, créer ou rêver.',
  history = 'Le Lo-fi hip-hop puise ses racines dans le boom-bap des années 1990 et le travail de producteurs comme J Dilla et Nujabes, qui ont transformé des samples jazz et soul en instrumentaux contemplatifs. Le genre a explosé grâce aux livestreams YouTube comme "lofi hip hop radio - beats to relax/study to" de ChilledCow (devenu Lofi Girl) au milieu des années 2010. Aujourd''hui, le lo-fi est devenu un véritable mode de vie, avec une communauté mondiale de producteurs indépendants.',
  notable_artists = ARRAY['Nujabes', 'J Dilla', 'Lofi Girl', 'Tomppabeats', 'idealism', 'Jinsang']
WHERE slug = 'lofi';

UPDATE public.categories SET
  description = 'Guitares, énergie brute et esprit indépendant depuis les années 60.',
  history = 'Le rock est né dans les années 1950 de la fusion du blues, du country et du rhythm and blues. Les Beatles et les Rolling Stones ont révolutionné la musique dans les années 1960. Le punk des années 1970, le post-punk des années 1980, puis le grunge de Nirvana dans les années 1990 ont chacun réinventé le genre. Le rock indépendant a émergé comme une alternative aux majors, avec des groupes comme Radiohead, Arctic Monkeys et Tame Impala qui continuent de repousser les limites du genre.',
  notable_artists = ARRAY['The Beatles', 'Nirvana', 'Radiohead', 'Arctic Monkeys', 'Tame Impala', 'The Strokes']
WHERE slug = 'rock-indie';

UPDATE public.categories SET
  description = 'Catégorie libre : tous les styles musicaux non couverts par les autres catégories.',
  history = 'La catégorie Open est un espace d''expression libre pour tous les genres musicaux qui ne rentrent pas dans les cases traditionnelles. Qu''il s''agisse de world music, de jazz expérimental, de musique classique contemporaine, de reggae, de folk ou de tout autre genre, cette catégorie célèbre la diversité musicale et l''innovation artistique sans frontières.',
  notable_artists = ARRAY['Bob Marley', 'Miles Davis', 'Björk', 'Anoushka Shankar']
WHERE slug = 'open';

UPDATE public.categories SET
  description = 'L''art du mix et de la performance live : le DJ est le maître de la piste.',
  history = 'L''art du DJing est né dans les années 1970 avec les pionniers du hip-hop comme DJ Kool Herc et Grandmaster Flash, qui ont inventé le scratching et le beatmatching. Les années 1980-90 ont vu l''émergence des DJ de club avec la house et la techno. Les superstar DJs des années 2000 comme Tiësto et David Guetta ont rempli les stades. Aujourd''hui, des artistes comme Black Coffee, Nina Kraviz et DJ Snake mêlent virtuosité technique, production originale et spectacle visuel pour créer des expériences live inoubliables.',
  notable_artists = ARRAY['David Guetta', 'Carl Cox', 'Nina Kraviz', 'Tiësto', 'Black Coffee', 'DJ Snake']
WHERE slug = 'dj';
