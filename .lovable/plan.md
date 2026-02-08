

# Completion des elements manquants

## Problemes identifies

### 1. Bug critique : les edge functions ne lisent pas les poids correctement
Les fonctions `compute-results` et `publish-results` cherchent `c.name` dans les criteres, mais la base de donnees utilise `c.criterion`. Les poids ne sont donc **jamais appliques** -- le systeme retombe toujours sur les valeurs par defaut (33/34/33).

**Correction** : Modifier `getWeights()` dans les deux edge functions pour chercher `c.criterion` au lieu de `c.name`.

### 2. Page "Methode de classement" obsolete
La page `ScoringMethod.tsx` affiche encore l'ancienne formule "Score = Votes valides + Bonus jury (max 15%)" alors que le systeme utilise maintenant un score moyen pondere par criteres. Le contenu ne mentionne ni les poids par categorie, ni les criteres (Emotion, Originalite, Production).

**Correction** : Mettre a jour la page pour expliquer la formule de score moyen pondere, mentionner les 3 criteres, et indiquer que chaque categorie a ses propres poids.

### 3. Score pondere non affiche sur la page Resultats
La page `Results.tsx` affiche uniquement le nombre de votes (`vote_count`). Le score moyen pondere, qui est le vrai critere de classement, n'est pas visible. C'est un manque de transparence.

**Correction** : Stocker le score moyen pondere dans la table `winners` (nouvelle colonne `weighted_score`) et l'afficher sur la page Resultats a cote du nombre de votes.

### 4. VoteButton sur Explore passe sans categoryId
Dans `Explore.tsx`, le `VoteButton` est utilise en mode compact sans passer `categoryId`. Les tips contextuels ne peuvent donc pas se charger si l'utilisateur deplie les details (meme si c'est compact, c'est une donnee manquante pour la coherence).

**Correction** : Passer `categoryId={sub.category_id}` au `VoteButton` dans Explore.

### 5. Page Compete n'affiche pas les conseils de production
Quand un musicien selectionne une categorie dans le formulaire de soumission, il ne voit aucun des conseils de production (BPM, instruments, duree) qu'on a soigneusement remplis. C'est une occasion manquee de guider l'artiste.

**Correction** : Afficher les `production_tips` de la categorie selectionnee sous le selecteur de categorie dans le formulaire.

---

## Plan technique

### Etape 1 : Migration SQL -- ajouter `weighted_score` a `winners`

```sql
ALTER TABLE winners ADD COLUMN weighted_score numeric DEFAULT 0;
```

### Etape 2 : Corriger les edge functions

**`compute-results/index.ts`** et **`publish-results/index.ts`** :
- Remplacer `c.name` par `c.criterion` dans `getWeights()`
- Dans `publish-results`, ecrire `weighted_score` dans la table `winners` lors de l'insertion

### Etape 3 : Mettre a jour `Results.tsx`

- Fetcher `weighted_score` depuis la table `winners`
- Afficher le score pondere (ex: "4.2/5") a cote du nombre de votes pour chaque gagnant

### Etape 4 : Mettre a jour `ScoringMethod.tsx`

- Remplacer la formule obsolete par la vraie formule de score pondere
- Expliquer les 3 criteres (Emotion, Originalite, Production) et leurs poids variables par categorie
- Ajouter une mention que les poids sont visibles sur chaque page de categorie

### Etape 5 : Corriger `Explore.tsx`

- Passer `categoryId={sub.category_id}` au `VoteButton`

### Etape 6 : Enrichir `Compete.tsx`

- Quand une categorie est selectionnee, afficher les `production_tips` correspondants sous le selecteur
- Utiliser les donnees deja chargees dans le state `categories`

---

## Fichiers concernes

1. **Migration SQL** : ajout colonne `weighted_score` sur `winners`
2. **`supabase/functions/compute-results/index.ts`** : fix `c.name` -> `c.criterion`
3. **`supabase/functions/publish-results/index.ts`** : fix `c.name` -> `c.criterion` + ecriture `weighted_score`
4. **`src/pages/Results.tsx`** : affichage du score pondere
5. **`src/pages/ScoringMethod.tsx`** : mise a jour complete du contenu
6. **`src/pages/Explore.tsx`** : passer `categoryId` au `VoteButton`
7. **`src/pages/Compete.tsx`** : afficher les conseils de production selon la categorie choisie

