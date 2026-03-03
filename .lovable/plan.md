

# Analyse des 8 tickets — Statut et plan d'action

## Tickets déjà résolus (rien à faire)

| # | Sujet | Statut |
|---|-------|--------|
| 1 | Leaked Password Protection | ⚠️ Non actionnable code — paramètre plateforme Auth uniquement (documenté en mémoire projet) |
| 2 | Publier + vérifier routes GEO | ✅ Routes OK dans `App.tsx`. Action = cliquer **Publish** |
| 3 | Dashboard admin analytics | ✅ Déjà implémenté (`AnalyticsTab.tsx`, onglet dans `AdminDashboard.tsx`, route `/admin/analytics`). KPIs, graphiques recharts, top pages — tout est en place |

## Tickets à implémenter (5 restants)

### Ticket 4 — Indexes + rétention analytics_events
**Migration SQL :**
- Ajouter index `(event_name, created_at)` et `(created_at)` sur `analytics_events`
- Créer une edge function `purge-analytics` qui supprime les lignes > 90 jours
- RLS déjà correcte (insert auth/anon, select admin-only)

**Fichiers :** 1 migration, 1 nouvelle edge function `supabase/functions/purge-analytics/index.ts`

### Ticket 5 — Normaliser events + déduplier page_view
**Modifications :**
- `src/lib/analytics.ts` : ajouter un guard de déduplication (stocker `lastPath + lastTs` en mémoire module, ignorer si même path < 3s)
- Ajouter `referrer: document.referrer` dans les properties de `page_view`
- Standardiser les properties des autres events (déjà assez propre, juste s'assurer d'un schéma cohérent)

**Fichiers :** `src/lib/analytics.ts`

### Ticket 6 — Cron compute-badges automatique
**Modifications :**
- Modifier `compute-badges` pour accepter un appel sans `week_id` : dans ce cas, trouver automatiquement la semaine dont `voting_close_at` vient de passer
- Permettre l'appel sans auth header (pour le cron) en vérifiant un secret ou en bypassant quand pas de header
- Configurer un cron via `pg_cron` + `pg_net` qui appelle la fonction chaque lundi à 00:05

**Fichiers :** `supabase/functions/compute-badges/index.ts`, 1 SQL insert (cron.schedule)

### Ticket 7 — Blog maillage avancé
Les articles connexes + CTA `/compete` + lien catégorie sont déjà en place dans `ArticleDetail.tsx`. Ce qui reste :
- Page `/articles` : ajouter un regroupement par catégorie/tags et un CTA concours
- ArticleDetail : ajouter un 2e CTA en haut de l'article (above the fold)

**Fichiers :** `src/pages/Articles.tsx`, `src/pages/ArticleDetail.tsx`

### Ticket 8 — Pricing preuve sociale + FAQ
La section WhyElite existe déjà. Ce qui reste :
- Ajouter des compteurs dynamiques (nombre d'artistes, votes, gagnants) récupérés depuis la DB
- Ajouter une mini-FAQ pricing (3 Q/R) avec lien vers `/faq`
- Vérifier la cohérence des CTA

**Fichiers :** `src/pages/Pricing.tsx`, `src/components/pricing/WhyEliteSection.tsx`

## Résumé

| # | Sujet | Statut | Effort |
|---|-------|--------|--------|
| 1 | Leaked Password | ⚠️ Paramètre plateforme | — |
| 2 | Publish + routes | ✅ Cliquer Publish | 0 |
| 3 | Dashboard analytics | ✅ Déjà fait | 0 |
| 4 | Indexes + rétention | 🔨 À faire | Migration + 1 edge fn |
| 5 | Dédup page_view | 🔨 À faire | 1 fichier |
| 6 | Cron badges | 🔨 À faire | 1 edge fn + 1 SQL |
| 7 | Blog maillage avancé | 🔨 À faire | 2 fichiers |
| 8 | Pricing social proof | 🔨 À faire | 2 fichiers |

**Ordre recommandé :** Ticket 5 (rapide, données propres) → Ticket 4 (perf/coût) → Ticket 6 (automatisation) → Ticket 7 (SEO) → Ticket 8 (conversion).

