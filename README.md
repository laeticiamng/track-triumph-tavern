# 🎵 Track Triumph

![CI](https://github.com/laeticiamng/track-triumph-tavern/actions/workflows/ci.yml/badge.svg)

Plateforme musicale communautaire orientée compétition, découverte, vote, récompenses et suivi artiste, propulsée par React + Supabase.

## Vision produit

Track Triumph relie trois parcours réels, déjà câblés au backend :

- **Artistes** : soumission hebdomadaire de titres, gestion du profil public, suivi des résultats, badges et récompenses.
- **Votants** : feed immersif, votes multi-critères, suivi d’artistes, recommandations IA, notifications et progression de quota.
- **Administration** : modération, analytique, calcul/publication des résultats, monitoring fraude, reward pool et paiements Stripe.

Aucune brique “core” ne doit reposer sur des données mockées côté produit : les pages utilisateur doivent lire l’état réel Supabase dès que le backend expose les tables/fonctions nécessaires.

## Fonctionnalités actuellement branchées au backend

### Expérience utilisateur

- **Explore / Vote unifiés** : écoute en grille, passage en mode feed de vote, filtres catégories, compteur de semaine active, recommandations IA, progression de vote et suggestions sociales.
- **Platform Pulse** : bloc de pilotage UX premium dans `/explore`, alimenté par les tables `submissions`, `votes`, `weekly_badges`, `follows`, `reward_pools` et `winners`.
- **Compete** : dépôt de morceaux, upload audio + cover, découpe du preview 30s, déclaration de droits, verrouillage par plan, contrôle de période et contrôle d’unicité hebdomadaire.
- **Profil utilisateur** : édition du profil, bio, liens sociaux, export des données, suppression du compte, gestion d’avatar/bannière, portail Stripe, historique des soumissions.
- **Profils artistes** : pages publiques, statistiques, catalogue de titres, follow/unfollow, badge de plan, liens externes.
- **Résultats & Hall of Fame** : podiums, winners par catégorie, reward pool, récompenses et reveal en temps réel.
- **Badges / Following / Articles / FAQ / Contact / Categories** : pages publiques connectées au backend existant.
- **Impact dashboard live** : la page `/impact` s’appuie désormais sur les données réelles (soumissions approuvées, votes valides, follows, badges, reward pools, semaines publiées) au lieu d’un jeu de démo.

### IA et automatisations

Fonctions Supabase Edge déjà présentes dans le dépôt :

- `ai-chat`
- `ai-feedback`
- `ai-recommendations`
- `ai-suggest-tags`
- `ai-vote-summary`
- `cast-vote`
- `check-subscription` / `check-subscription-public`
- `compute-badges`
- `compute-results`
- `create-checkout`
- `customer-portal`
- `delete-account`
- `export-data`
- `fraud-scan`
- `notify-status-change`
- `publish-results`
- `push-subscribe` / `push-unsubscribe` / `send-push`
- `retry-webhooks`
- `stripe-webhook`
- `update-reward-pool`

## Pages principales

| Route | Description |
|-------|-------------|
| `/` | Landing page marketing + podium hebdomadaire |
| `/explore` | Découverte des titres, mode écoute + mode vote |
| `/vote` | Redirection vers `/explore?mode=vote` |
| `/compete` | Soumission d’un morceau |
| `/results` | Classements et récompenses de la semaine |
| `/reveal` | Reveal live des résultats |
| `/pricing` | Offres Free / Pro / Elite |
| `/profile` | Espace membre complet |
| `/artist/:id` | Profil public artiste |
| `/badges` | Badges hebdomadaires attribués |
| `/following` | Artistes suivis |
| `/impact` | Tableau d’impact branché aux données réelles |
| `/admin` | Back-office de modération et pilotage |

## Stack technique

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Framer Motion
- Recharts
- React Query
- React Router
- i18next

### Backend / data

- **Supabase Auth** pour l’authentification
- **Supabase Postgres** pour les tables métier (`profiles`, `submissions`, `votes`, `weeks`, `winners`, `rewards`, `reward_pools`, etc.)
- **Supabase Storage** pour les covers et extraits audio
- **Supabase Edge Functions** pour la logique serveur, l’IA, les webhooks et le cycle des résultats
- **Stripe** pour checkout, portail client et gestion des abonnements

## Schéma produit important côté front

Le front s’appuie notamment sur les tables suivantes :

- `profiles`
- `categories`
- `weeks`
- `submissions`
- `votes`
- `winners`
- `rewards`
- `reward_pools`
- `weekly_badges`
- `follows`
- `notifications`
- `activities`
- `contact_messages`
- `push_subscriptions`
- `webhook_events`

Les types générés sont centralisés dans `src/integrations/supabase/types.ts`.

## Démarrage local

```bash
git clone <YOUR_GIT_URL>
cd track-triumph-tavern
npm install
npm run dev
```

## Variables et configuration attendues

### Frontend (`VITE_*`)

Créer un fichier `.env.local` avec au minimum :

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### Edge Functions / Supabase secrets

Selon les fonctions utilisées, prévoir notamment :

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
OPENAI_API_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

## Scripts utiles

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Qualité et règles produit

- **0 donnée mockée** sur les vues opérationnelles quand la donnée existe en base.
- **Frontend orienté backend-first** : auditer la table / fonction Supabase avant d’ajouter un placeholder fonctionnel.
- **Typescript strict** : éviter `@ts-nocheck`, `any` et les contournements silencieux quand un type précis est possible.
- **Ergonomie mobile d’abord** : les parcours `/explore`, `/vote`, `/compete` et `/profile` restent les surfaces prioritaires.

## Déploiement

### Application

```bash
npm run build
```

Publier ensuite via votre plateforme d’hébergement front habituelle ou via Lovable si vous utilisez encore ce flux.

### Fonctions Supabase

Déployer les Edge Functions avec Supabase CLI sur votre projet cible.

## Prochain audit recommandé

- Vérifier toutes les pages utilisateur qui affichent encore des fallbacks texte quand les données publiques manquent.
- Réduire les warnings ESLint restants sur les dépendances de hooks.
- Continuer la séparation des chunks lourds (`vendor-charts`, `index`) pour améliorer le TTI mobile.
