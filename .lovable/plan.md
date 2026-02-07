

# Ajout de la catégorie DJ et personnalisation de chaque genre musical

## Ce qui change

Chaque catégorie musicale aura sa propre page avec :
- Une breve histoire du genre
- Les grandes figures / artistes emblematiques
- Un lien depuis la landing page et la page Explore

Une nouvelle categorie "DJ" sera ajoutee.

---

## Modifications

### 1. Base de donnees

Ajouter 3 colonnes a la table `categories` :
- `description` (text) : courte presentation du genre
- `history` (text) : histoire du genre musical (quelques paragraphes)
- `notable_artists` (text[]) : liste des grandes figures

Inserer la categorie "DJ" (slug: `dj`, sort_order: 9).

Remplir les donnees pour toutes les categories (Rap/Trap, Pop, Afro, Electronic, R&B, Lofi, Rock/Indie, Open, DJ) avec :
- Une description courte
- Un texte d'histoire du genre (origines, evolution, moments cles)
- 5-8 artistes emblematiques par genre

### 2. Page de detail par categorie

Creer `src/pages/CategoryDetail.tsx` accessible sur `/categories/:slug` :
- Banniere avec icone et nom du genre
- Section "A propos" avec la description
- Section "Histoire" avec le texte historique
- Section "Grandes figures" avec la liste des artistes emblematiques
- Bouton "Voir les soumissions" qui redirige vers `/explore?category={id}`

Ajouter la route dans `App.tsx`.

### 3. Mise a jour du frontend

**`src/components/landing/CategoriesSection.tsx`** :
- Mettre a jour le titre "10 categories musicales" (8 existantes + DJ + Open = 10, ou adapter dynamiquement)
- Ajouter l'entree `dj` dans `categoryMeta` avec une icone `Disc3` et un gradient
- Les liens pointent vers `/categories/{slug}` au lieu de `/explore?category={id}`

**`src/pages/Explore.tsx`** :
- Ajouter un lien "En savoir plus" a cote de chaque filtre de categorie qui pointe vers `/categories/{slug}`

---

## Contenu prevu par categorie

| Genre | Grandes figures (exemples) |
|-------|---------------------------|
| Rap / Trap | Tupac, Notorious B.I.G., Eminem, Kendrick Lamar, Travis Scott, Future |
| Pop | Michael Jackson, Madonna, Beyonce, Taylor Swift, The Weeknd |
| Afro | Fela Kuti, Burna Boy, Wizkid, Tiwa Savage, Angelique Kidjo |
| Electronic | Daft Punk, Kraftwerk, Aphex Twin, Deadmau5, Skrillex |
| R&B | Stevie Wonder, Whitney Houston, Usher, Frank Ocean, SZA |
| Lofi | Nujabes, J Dilla, ChilledCow, Tomppabeats |
| Rock / Indie | The Beatles, Nirvana, Radiohead, Arctic Monkeys, Tame Impala |
| DJ | David Guetta, Carl Cox, Nina Kraviz, Tiesto, Black Coffee, DJ Snake |
| Open | Categorie libre -- tous les styles non couverts |

---

## Fichiers concernes

1. **Migration SQL** : ajout colonnes + insertion DJ + remplissage donnees
2. **`src/pages/CategoryDetail.tsx`** (nouveau) : page de detail du genre
3. **`src/App.tsx`** : ajout route `/categories/:slug`
4. **`src/components/landing/CategoriesSection.tsx`** : icone DJ, liens vers detail, titre dynamique
5. **`src/pages/Explore.tsx`** : lien optionnel vers la page categorie
