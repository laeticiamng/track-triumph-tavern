

# Corrections Restantes - Pre-Publication

## Lacunes identifiees

### 1. CRITIQUE : Compete.tsx - Pas de gating abonnement
Les utilisateurs Free peuvent soumettre des morceaux. Le spec exige Pro/Elite uniquement.
- Ajouter `useSubscription()` pour verifier le tier
- Si Free : afficher un message + CTA vers `/pricing` au lieu du formulaire
- Verifier que la date est dans la periode `submission_open_at` / `submission_close_at`
- Verifier qu'aucune soumission n'existe deja pour `user_id + week_id`

### 2. CRITIQUE : Explore.tsx - Pas de filtre par semaine active
Affiche toutes les soumissions approuvees de toutes les semaines. Doit filtrer par `week_id` de la semaine active.
- Charger la semaine active (`is_active = true`)
- Ajouter `.eq("week_id", activeWeekId)` a la requete

### 3. IMPORTANT : cast-vote - Pas de quota hebdomadaire Free (5 votes/semaine)
L'edge function a un rate limit par minute mais pas de quota par tier.
- Appeler Stripe pour determiner le tier de l'utilisateur (via email)
- Si Free : compter les votes de la semaine, bloquer au-dela de 5

### 4. POLISH : Pages manquantes
- `/scoring-method` : methode de classement transparente (score = votes + bonus jury plafonne a 15%)
- `/hall-of-fame` : archives des gagnants (semaines passees avec `results_published_at` non null)

### 5. POLISH : Footer - liens manquants
- Ajouter liens vers "Methode de classement" et "Hall of Fame"

---

## Fichiers a modifier/creer

| Fichier | Action |
|---|---|
| `src/pages/Compete.tsx` | Modifier : gating tier + periode soumission + doublon check |
| `src/pages/Explore.tsx` | Modifier : filtrer par semaine active |
| `supabase/functions/cast-vote/index.ts` | Modifier : quota Free 5 votes/semaine via Stripe |
| `src/pages/ScoringMethod.tsx` | Creer : page methode de classement |
| `src/pages/HallOfFame.tsx` | Creer : page archives gagnants |
| `src/App.tsx` | Modifier : ajouter routes |
| `src/components/layout/Footer.tsx` | Modifier : ajouter liens |

---

## Detail technique

### Compete.tsx - Gating
```text
1. Importer useSubscription
2. Charger semaine active avec dates completes (submission_open_at, submission_close_at)
3. Verifier : tier !== "free" sinon afficher CTA pricing
4. Verifier : now >= submission_open_at && now <= submission_close_at
5. Verifier : aucune soumission existante pour user_id + week_id
```

### Explore.tsx - Filtre semaine
```text
1. Charger semaine active (is_active = true) -> weekId
2. Ajouter .eq("week_id", weekId) a la requete submissions
3. Si pas de semaine active, afficher message vide
```

### cast-vote - Quota Free
```text
1. Apres authentification, appeler Stripe pour obtenir le tier
2. Si pas de client Stripe ou pas d'abonnement actif -> tier = "free"
3. Si free : compter votes de la semaine pour cet utilisateur
4. Si count >= 5 : retourner erreur 403 "Limite de 5 votes/semaine atteinte"
```

### ScoringMethod.tsx
```text
Page statique expliquant :
- Score = votes valides + bonus jury (max 15%)
- Aucun hasard, aucun tirage
- Anti-fraude : verification email, rate limiting, detection clusters
- Participation gratuite, abonnements = services SaaS uniquement
```

### HallOfFame.tsx
```text
- Charger toutes les semaines avec results_published_at non null
- Pour chaque semaine : charger top 3 submissions par vote_count
- Afficher en liste chronologique inversee (plus recent en premier)
```

