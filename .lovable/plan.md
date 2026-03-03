

# Analyse des 8 tickets — Statut réel et plan d'action

## Tickets déjà résolus (rien à faire)

### Ticket 2 (JSON-LD statique) — ✅ FAIT
`index.html` contient déjà les 4 schémas statiques : `Organization`, `WebSite`, `FAQPage`, `HowTo`. C'est le dernier diff appliqué. Aucune action requise.

### Ticket 3 (Routes GEO / 404) — ✅ FAIT (côté code)
Toutes les routes (`/articles`, `/scoring-method`, `/faq`, `/categories/:slug`) sont déclarées dans `App.tsx`. Lovable gère le SPA fallback automatiquement. Il suffit de **publier** pour que tout fonctionne en prod. Aucune modification de code nécessaire.

### Ticket 4 (Streak) — ✅ FAIT
Le trigger `update_vote_streak` est en place en base, le hook `use-vote-streak.ts` et le composant `StreakBadge.tsx` sont fonctionnels. La logique semaine consécutive/reset est correcte. Les RLS empêchent INSERT/UPDATE/DELETE côté client — seul le trigger SECURITY DEFINER écrit.

### Ticket 5 (Badges hebdomadaires) — ✅ FAIT
L'edge function `compute-badges` est complète (4 types de badges, upsert avec contrainte d'unicité). Le hook `use-weekly-badges.ts` et la page `/badges` existent. L'unique point à vérifier : le déclenchement automatique en fin de semaine (cron), mais c'est opérationnel en appel admin.

## Ticket non-actionnable via le code

### Ticket 1 (Leaked Password Protection) — ⚠️ NON ACTIONNABLE
Comme déjà documenté dans la mémoire du projet, cette protection est un **paramètre plateforme** qui ne peut pas être activé via le code source. Il faut une intervention dans les paramètres Auth de la plateforme backend. Je peux marquer ce finding comme "difficulté élevée" dans le panneau sécurité si tu le souhaites, mais aucune modification de code ne résoudra ce point.

## Tickets à implémenter (3 restants)

### Ticket 6 — Analytics/Tracking conversion
**Statut** : Aucun système de tracking n'existe actuellement (0 résultat pour analytics/gtag/posthog dans le code).

**Plan d'implémentation** :
1. Créer `src/lib/analytics.ts` — module léger avec une fonction `trackEvent(name, properties)` qui envoie les événements vers une table `analytics_events` en base
2. Créer la table `analytics_events` (user_id nullable, event_name, properties jsonb, created_at)
3. Instrumenter les 5 points clés : `signup_completed` (Auth.tsx), `submission_created` (Compete.tsx), `vote_cast` (VoteButton.tsx), `plan_upgrade_clicked` (Pricing.tsx), `page_view` (Layout.tsx)
4. Fichiers modifiés : ~6 fichiers + 1 migration

### Ticket 7 — Blog maillage interne
**Statut** : Les articles existent dans `src/lib/articles-data.ts` et les pages `/articles` et `/articles/:slug` sont en place, mais il n'y a pas de liens croisés entre articles ni de CTA vers `/compete`.

**Plan d'implémentation** :
1. Ajouter un bloc "Articles connexes" en bas de chaque `ArticleDetail.tsx` (2-3 articles liés par catégorie)
2. Ajouter des liens contextuels vers les pages catégories (`/categories/:slug`)
3. Ajouter un CTA "Soumettez votre morceau" vers `/compete` dans chaque article
4. Fichiers modifiés : `ArticleDetail.tsx`, `articles-data.ts` (ajout champ `relatedSlugs`)

### Ticket 8 — Pricing émotionnel
**Statut** : La page Pricing existe (351 lignes) avec un comparatif, mais manque une section "Pourquoi passer Elite" avec des arguments émotionnels.

**Plan d'implémentation** :
1. Ajouter une section "Pourquoi les artistes choisissent Elite" avec témoignages/bénéfices concrets avant le comparatif
2. Améliorer les CTA avec un langage orienté bénéfice ("Commencez à gagner" plutôt que "S'abonner")
3. Ajouter des badges sociaux (nombre d'artistes inscrits, etc.)
4. Fichier modifié : `Pricing.tsx`

## Résumé

| Ticket | Statut | Action |
|--------|--------|--------|
| 1 Leaked Password | ⚠️ Non actionnable code | Config plateforme uniquement |
| 2 JSON-LD statique | ✅ Déjà fait | — |
| 3 Routes GEO | ✅ Fait, publier | Cliquer "Publish" |
| 4 Streak | ✅ Fait | — |
| 5 Badges | ✅ Fait | — |
| 6 Analytics | 🔨 À faire | ~6 fichiers + 1 migration |
| 7 Blog maillage | 🔨 À faire | 2 fichiers |
| 8 Pricing | 🔨 À faire | 1 fichier |

**Recommandation pour traction rapide** : Ticket 7 (maillage blog) → Ticket 8 (pricing conversion) → Ticket 6 (analytics). Le maillage interne améliore immédiatement le SEO, le pricing améliore la conversion, et l'analytics permet de mesurer l'impact.

Souhaites-tu que j'implémente les 3 tickets restants (6, 7, 8) dans cet ordre ?

