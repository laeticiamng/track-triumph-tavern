

# Ajout des categories Reggae, Country, Jazz et mise a jour de Open

## Ce qui change

3 nouvelles categories musicales seront ajoutees avec leur histoire et grandes figures. La categorie "Open" sera mise a jour pour retirer les references aux genres desormais couverts (reggae, jazz).

---

## 1. Base de donnees (INSERT + UPDATE)

Inserer 3 nouvelles categories :

| Slug | Nom | sort_order | Description | Grandes figures |
|------|-----|-----------|-------------|-----------------|
| `reggae` | Reggae | 10 | Musique nee en Jamaique, portee par des rythmes offbeat et des messages de paix | Bob Marley, Peter Tosh, Jimmy Cliff, Burning Spear, Damian Marley, Alpha Blondy, Lee "Scratch" Perry |
| `country` | Country | 11 | Musique americaine aux racines folk, portee par la guitare et le storytelling | Johnny Cash, Dolly Parton, Willie Nelson, Patsy Cline, Hank Williams, Taylor Swift, Chris Stapleton |
| `jazz` | Jazz | 12 | Genre ne a La Nouvelle-Orleans, berceau de l'improvisation et du swing | Miles Davis, John Coltrane, Louis Armstrong, Duke Ellington, Ella Fitzgerald, Thelonious Monk, Herbie Hancock |

Chaque categorie aura un texte d'histoire complet (origines, evolution, moments cles).

Mettre a jour **Open** :
- Retirer Bob Marley et Miles Davis des `notable_artists` (ils seront dans Reggae et Jazz)
- Mettre a jour la description et l'histoire pour ne plus mentionner reggae/jazz comme exemples

---

## 2. Frontend -- icones et couleurs

Ajouter dans `CategoriesSection.tsx` et `CategoryDetail.tsx` les entrees pour les 3 nouveaux slugs :

| Slug | Icone Lucide | Gradient |
|------|-------------|----------|
| `reggae` | `Palmtree` | from-green-500/20 to-yellow-500/20 |
| `country` | `Wheat` | from-yellow-500/20 to-amber-500/20 |
| `jazz` | `Music2` | from-blue-500/20 to-indigo-500/20 |

Le titre dynamique s'adaptera automatiquement (passera a "12 categories musicales").

---

## Fichiers concernes

1. **Donnees SQL** (via outil d'insertion) : INSERT des 3 categories + UPDATE de Open
2. **`src/components/landing/CategoriesSection.tsx`** : ajout des 3 entrees dans `categoryMeta` + import des icones
3. **`src/pages/CategoryDetail.tsx`** : ajout des 3 entrees dans `iconMap` et `gradientMap` + import des icones

