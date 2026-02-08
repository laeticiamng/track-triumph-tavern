

# Corrections restantes

## Problemes identifies

### 1. HallOfFame ne utilise pas la table `winners`
La page `HallOfFame.tsx` recupere le top 3 depuis la table `submissions` triee par `vote_count` au lieu d'utiliser la table `winners` qui contient le vrai classement pondere. Le Hall of Fame affiche donc potentiellement les mauvais gagnants.

**Correction** : Utiliser la table `winners` avec `weighted_score` et joindre `submissions` pour les metadonnees.

### 2. Grand gagnant dans Results.tsx trie par `vote_count`
A la ligne 66, le grand gagnant est determine par `vote_count` au lieu de `weighted_score`. Incoherent avec la methode de classement ponderee.

**Correction** : Trier par `weighted_score` au lieu de `vote_count`.

### 3. Interface `ScoringCriterion` obsolete dans les edge functions
Dans `compute-results` et `publish-results`, l'interface `ScoringCriterion` declare `name: string` alors que la DB utilise `criterion`. Le code runtime fonctionne grace au fallback `(c as any).criterion`, mais le type est trompeur.

**Correction** : Renommer `name` en `criterion` dans l'interface.

### 4. Reglement du concours (ContestRules.tsx) obsolete
L'article 5 mentionne encore "somme des votes valides + bonus jury (max 15%)" au lieu du score moyen pondere par criteres.

**Correction** : Mettre a jour l'article 5 pour decrire la vraie methode de classement.

### 5. La page Vote (TikTok feed) ne passe pas le `categoryId` au VoteCard
Le `VoteCard` appelle `cast-vote` sans passer de scores detailles. C'est acceptable pour un vote rapide, mais le `categoryId` est deja present dans `submission.category_id` et pourrait etre utilise pour des ameliorations futures. Pas de changement requis ici car le composant fonctionne correctement.

---

## Plan technique

### Etape 1 : Corriger les interfaces dans les edge functions

**`compute-results/index.ts`** et **`publish-results/index.ts`** :
- Remplacer `name: string` par `criterion: string` dans l'interface `ScoringCriterion`
- Simplifier le `getWeights()` pour lire directement `c.criterion` au lieu du fallback double

### Etape 2 : Corriger `Results.tsx` — grand gagnant

- Ligne 66 : remplacer le tri par `vote_count` par un tri par `weighted_score` pour determiner le grand gagnant

### Etape 3 : Refactorer `HallOfFame.tsx`

- Remplacer la requete `submissions` par une requete sur `winners` avec jointure `submissions(title, artist_name, cover_image_url)`
- Afficher `weighted_score` et `rank` au lieu du simple `vote_count`
- Grouper les gagnants par semaine comme actuellement

### Etape 4 : Mettre a jour `ContestRules.tsx`

- Article 5 : remplacer la formule obsolete par la description du score moyen pondere avec les 3 criteres (Emotion, Originalite, Production)
- Mentionner que les poids varient par categorie

---

## Fichiers concernes

1. **`supabase/functions/compute-results/index.ts`** : interface `ScoringCriterion` corrigee
2. **`supabase/functions/publish-results/index.ts`** : interface `ScoringCriterion` corrigee
3. **`src/pages/Results.tsx`** : tri du grand gagnant par `weighted_score`
4. **`src/pages/HallOfFame.tsx`** : utiliser la table `winners` au lieu de `submissions`
5. **`src/pages/ContestRules.tsx`** : article 5 mis a jour

