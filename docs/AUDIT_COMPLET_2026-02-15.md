# AUDIT COMPLET — Weekly Music Awards (Track Triumph)

_Date : 2026-02-15 | Plateforme : https://track-triumph-tavern.lovable.app/_
_Éditeur : EMOTIONSCARE SASU — SIREN 944 505 445_

---

## TABLEAU DE BORD

| Domaine | Score | Statut |
|---------|-------|--------|
| **Build production** | ✅ | Compile sans erreur (17s) |
| **Tests** | ⚠️ 1/1 | 1 test placeholder, 0% couverture réelle |
| **Lint (ESLint)** | ❌ | 48 erreurs, 16 warnings |
| **Vulnérabilités npm** | ⚠️ | 4 high, 4 moderate |
| **Sécurité backend** | 7.5/10 | JWT désactivé globalement (critique) |
| **Conformité légale FR** | 85/100 | 7/7 pages, RCS en attente |
| **RGPD** | 80/100 | Base solide, lacunes processeurs |
| **SEO** | 65/100 | Meta OK, structured data partiel |
| **Accessibilité (WCAG 2.1)** | 62/100 | Alt textes manquants, ARIA lacunaire |
| **Architecture code** | 8/10 | Bien structuré, composants modulaires |

---

## 1. ARCHITECTURE & STACK

### 1.1 Stack technique

| Couche | Technologie | Version |
|--------|------------|---------|
| Frontend | React + TypeScript | 18.3.1 / 5.8.3 |
| Bundler | Vite + SWC | 5.4.19 |
| UI | shadcn/ui + Tailwind CSS | 48 composants / 3.4.17 |
| State | @tanstack/react-query | 5.83.0 |
| Forms | react-hook-form + Zod | 7.61.1 / 3.25.76 |
| Backend | Supabase (Auth, DB, Storage, Edge Functions) | 2.95.3 |
| Paiement | Stripe | Via edge functions |
| Animations | Framer Motion | 12.33.0 |
| Charts | Recharts | 2.15.4 |
| SEO | react-helmet-async | 2.0.5 |
| Tests | Vitest + Testing Library | 3.2.4 / 16.0.0 |

### 1.2 Structure du projet

```
src/
├── pages/          26 pages (lazy-loaded sauf Index)
├── components/     85 composants (37 métier + 48 shadcn/ui)
│   ├── admin/      FraudMonitoring
│   ├── ai/         AIChatbot, AIRecommendations, AITagSuggest, AIVoteSummary
│   ├── audio/      AudioPlayer
│   ├── auth/       LoginForm, SignupForm, ForgotPassword, ConfirmationScreen
│   ├── elite/      AIFeedback
│   ├── landing/    9 composants (Hero, HowItWorks, FAQ, etc.)
│   ├── layout/     Header, Footer, BottomNav, Layout
│   ├── profile/    VoteStatsChart
│   ├── rewards/    RewardPoolBanner
│   ├── seo/        SEOHead, Sitemap
│   ├── shared/     WeekCountdown
│   ├── vote/       VoteFeed, VoteCard, VoteButton, VoteQuotaBar, etc.
│   └── ui/         48 composants shadcn/ui
├── hooks/          6 hooks (auth, subscription, vote-state, active-week, mobile, toast)
├── lib/            utils, subscription-tiers, auth-schemas
├── integrations/   Supabase client + types auto-générés
└── test/           setup + 1 test placeholder

supabase/
├── functions/      17 edge functions
├── migrations/     14 fichiers SQL
├── config.toml     Configuration
└── seed.sql        Données de démonstration
```

### 1.3 Build & Bundle

- **Build** : ✅ Réussi en 17.29s (3058 modules)
- **Bundle principal** : 699 kB (213 kB gzip) — au-dessus du seuil recommandé de 500 kB
- **Chunks volumineux** : Auth (93 kB), Profile (60 kB), Vote (52 kB), Recharts (367 kB)
- **Code splitting** : Toutes les pages sauf Index sont lazy-loaded ✅

**Recommandation** : Diviser le chunk Recharts via `manualChunks` dans Vite config. Évaluer le tree-shaking de date-fns et lodash.

---

## 2. SÉCURITÉ

### 2.1 Problèmes CRITIQUES

#### 🔴 JWT désactivé sur toutes les edge functions
- **Fichier** : `supabase/config.toml`
- **Impact** : `verify_jwt = false` sur les 17 fonctions. Chaque fonction doit manuellement vérifier le token Authorization. Un oubli = endpoint ouvert.
- **Action** : Activer `verify_jwt = true` au niveau global.

#### 🔴 Absence de Content Security Policy (CSP)
- Aucun header CSP nulle part (ni CORS, ni index.html).
- Vulnérable à l'injection de scripts inline.
- **Action** : Ajouter CSP via meta tag ou headers serveur.

#### 🔴 Headers de sécurité manquants dans CORS
- **Fichier** : `supabase/functions/_shared/cors.ts`
- Manquent : `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`
- **Action** : Ajouter ces headers à toutes les réponses.

### 2.2 Problèmes ÉLEVÉS

| # | Problème | Fichier(s) | Impact |
|---|----------|-----------|--------|
| 1 | Routes admin non protégées côté frontend | `App.tsx:73-77` | Le composant charge avant le check de rôle, flash de contenu admin |
| 2 | `dangerouslySetInnerHTML` dans chart.tsx | `ui/chart.tsx:70-86` | Risque XSS si les couleurs venaient d'input utilisateur |
| 3 | Données sensibles dans les logs | `cast-vote`, `fraud-scan` | Emails, user IDs loggués — violation RGPD |
| 4 | IP spoofable via X-Forwarded-For | `cast-vote:246` | Contournement possible de la détection de fraude |
| 5 | Extraction JWT manuelle et incohérente | Toutes les edge functions | Implémentation fragile, risque de bypass |

### 2.3 Problèmes MOYENS

| # | Problème | Détail |
|---|----------|--------|
| 1 | Pas de mot de passe spécial requis | `auth-schemas.ts` — seulement 8 car + maj + min + chiffre |
| 2 | Rate limiting applicatif uniquement | Pas de protection DDoS au niveau infra |
| 3 | localStorage pour les tokens auth | Vulnérable si XSS exploité |
| 4 | Pas de CSRF sur actions admin | Une seule vérification de rôle |
| 5 | Pas de rate limit sur appels IA | Risque d'explosion de coûts API |

### 2.4 Vulnérabilités npm (8 total)

| Package | Sévérité | Problème |
|---------|----------|----------|
| react-router 6.0–6.30.2 | HIGH | XSS via open redirects |
| @remix-run/router ≤1.23.1 | HIGH | Idem (dépendance) |
| glob 10.2–10.4.5 | HIGH | Injection de commande via CLI |
| esbuild ≤0.24.2 | MODERATE | Requêtes non autorisées au dev server |
| vite ≤6.1.6 | MODERATE | Dépend d'esbuild vulnérable |
| js-yaml 4.0–4.1.0 | MODERATE | Prototype pollution via merge |
| lodash 4.0–4.17.21 | MODERATE | Prototype pollution via unset/omit |

**Action** : Exécuter `npm audit fix` immédiatement pour react-router et glob.

### 2.5 Bug logique — reward-pool

- **Fichier** : `supabase/functions/update-reward-pool/index.ts`
- Le statut `threshold_met` ne peut jamais être atteint car la condition est écrasée par `active`.
- **Action** : Corriger avec `else if`.

---

## 3. TESTS

### 3.1 État actuel

| Métrique | Valeur |
|----------|--------|
| Fichiers de test | 1 |
| Tests | 1 (placeholder `expect(true).toBe(true)`) |
| Couverture réelle | **0%** |
| Framework | Vitest 3.2.4 + Testing Library |
| Résultat | ✅ 1 passed (4.78s) |

### 3.2 Zones critiques non testées

| Zone | Fichiers | Priorité |
|------|----------|----------|
| Hooks d'authentification | `use-auth.ts`, `use-subscription.ts` | CRITIQUE |
| Logique de vote | `use-vote-state.ts`, `VoteCard`, `VoteButton` | CRITIQUE |
| Schémas de validation | `auth-schemas.ts` | HAUTE |
| Tiers d'abonnement | `subscription-tiers.ts` | HAUTE |
| Pages principales | Vote, Auth, Profile, Results | HAUTE |
| Edge functions | cast-vote, fraud-scan, publish-results | HAUTE |

### 3.3 Infrastructure de test manquante

- Pas de mock Supabase dans `setup.ts`
- Pas de mock React Query
- Pas de mock localStorage
- Pas de configuration CI/CD pour les tests

### 3.4 Recommandations

1. Mocker Supabase dans `src/test/setup.ts`
2. Écrire des tests unitaires pour les 6 hooks custom
3. Tester les schémas Zod (`auth-schemas.ts`)
4. Tests d'intégration pour les flux critiques (vote, auth, soumission)
5. Objectif court terme : 50% de couverture sur hooks + utils

---

## 4. LINT & QUALITÉ DE CODE

### 4.1 État ESLint

- **48 erreurs** / **16 warnings**
- `npm run lint` : ❌ FAIL

### 4.2 Répartition des erreurs

| Règle | Occurrences | Type |
|-------|-------------|------|
| `@typescript-eslint/no-explicit-any` | 38 | error |
| `@typescript-eslint/no-empty-object-type` | 2 | error |
| `@typescript-eslint/no-unused-expressions` | 1 | error |
| `@typescript-eslint/no-require-imports` | 1 | error |
| `react-hooks/exhaustive-deps` | 3 | warning |
| `react-refresh/only-export-components` | 13 | warning |

### 4.3 TypeScript strict mode

Le mode strict est **désactivé** dans `tsconfig.app.json` :
- `noUnusedLocals: false`
- `noUnusedParameters: false`
- `noImplicitAny: false` (implicite, pas configuré)

### 4.4 Plan de correction

1. **Phase 1** : Typer les edge functions Supabase (élimine ~20 `any`)
2. **Phase 2** : Typer les composants frontend (Results, Admin, Profile, etc.)
3. **Phase 3** : Corriger les `exhaustive-deps` (3 cas)
4. **Phase 4** : Activer progressivement le strict mode

---

## 5. BASE DE DONNÉES & SUPABASE

### 5.1 Schéma (13 tables)

| Table | Description | RLS |
|-------|-------------|-----|
| `profiles` | Profils utilisateurs (avatar, bio, social_links) | ✅ |
| `user_roles` | Rôles (admin, moderator, user) | ✅ |
| `categories` | 9 catégories musicales avec metadata riche | ✅ |
| `seasons` | Saisons de compétition | ✅ |
| `weeks` | Semaines avec fenêtres soumission/vote | ✅ |
| `submissions` | Soumissions musicales (audio, cover, tags) | ✅ |
| `votes` | Votes multi-critères (emotion, originality, production) | ✅ |
| `vote_events` | Audit trail pour anti-fraude | ✅ |
| `winners` | Top 3 par catégorie par semaine | ✅ |
| `rewards` | Récompenses attribuées | ✅ |
| `reward_pools` | Budget hebdomadaire (200€/100€/50€) | ✅ |

**RLS** : ✅ Activé sur toutes les tables avec politiques appropriées.

### 5.2 Edge Functions (17)

| Fonction | Auth | Qualité |
|----------|------|---------|
| cast-vote | ✅ Manuel | 9/10 — anti-fraude IA, rate-limiting, audit trail |
| compute-results | ✅ Admin | 8/10 — scoring pondéré par catégorie |
| publish-results | ✅ Admin | 8/10 — classement + récompenses |
| fraud-scan | ✅ Admin | 9/10 — 4 signaux de détection |
| create-checkout | ✅ Manuel | 9/10 — intégration Stripe |
| check-subscription | ✅ Manuel | 9/10 — mapping tiers |
| check-subscription-public | Variable | Non audité en détail |
| customer-portal | ✅ Manuel | 9/10 — portail Stripe |
| update-reward-pool | ✅ Admin | 6/10 — **bug logique status** |
| ai-chat | ✅ Pro/Elite | 7/10 — dépendance LovableAI |
| ai-feedback | ✅ Elite | 7/10 — idem |
| ai-recommendations | ✅ Pro/Elite | 7/10 — idem |
| ai-suggest-tags | ✅ Auth | 7/10 — idem |
| ai-vote-summary | ✅ Pro/Elite | 7/10 — idem |
| notify-status-change | Variable | Non audité en détail |

### 5.3 Procedures stockées

| Fonction | Rôle | Sécurité |
|----------|------|----------|
| `has_role()` | Vérification de rôle pour RLS | SECURITY DEFINER ✅ |
| `increment_vote_count()` | Compteur atomique de votes | SECURITY DEFINER ✅ |
| `handle_new_user()` | Auto-création profil + rôle user | SECURITY DEFINER ✅ |
| `update_updated_at_column()` | Mise à jour automatique timestamps | Trigger ✅ |

---

## 6. PAGES & COMPOSANTS

### 6.1 Pages (26)

| Catégorie | Pages | État |
|-----------|-------|------|
| Accueil | Index | ✅ Excellent |
| Auth | Auth | ✅ Multi-vues (login, signup, forgot, confirm) |
| Compétition | Vote, Compete, Results, Explore | ✅ Complets |
| Profil | Profile, ArtistProfile, ArtistStats | ✅ |
| Navigation | HallOfFame, CategoryDetail, Stats, SubmissionDetail, SubmissionReview | ✅ |
| Commercial | Pricing, About, FAQ, ScoringMethod | ✅ |
| Admin | AdminDashboard (5 sous-routes) | ⚠️ Monolithique (571 lignes) |
| Légal | Terms, Privacy, ContestRules, Cookies, MentionsLegales, CGV | ✅ 7/7 |
| Erreur | NotFound | ✅ |

### 6.2 Problèmes de composants

| Problème | Localisation | Sévérité |
|----------|-------------|----------|
| AdminDashboard trop gros (571 lignes) | `pages/AdminDashboard.tsx` | Moyenne |
| Ancien nom "SoundClash" dans AIChatbot | `ai/AIChatbot.tsx:144` | Basse |
| WeekCountdown se met à jour toutes les 60s (pas 1s) | `shared/WeekCountdown.tsx:38` | Basse |
| Doublons FAQ.tsx / Faq.tsx | `pages/FAQ.tsx` + `pages/Faq.tsx` | Basse |
| Pas d'Error Boundaries | Global | Moyenne |

### 6.3 Modèle d'abonnement (implémenté)

| Tier | Prix | Votes | Soumissions | Commentaires | IA |
|------|------|-------|------------|-------------|-----|
| Free | 0€ | 5/semaine | ❌ | ❌ | ❌ |
| Pro | 9.99€/mois | Illimités | 1/semaine/catégorie | 5/semaine | Chatbot, Summary, Reco |
| Elite | 19.99€/mois | Illimités | 1/semaine/catégorie | Illimités | + Feedback détaillé |

---

## 7. SEO

### 7.1 Ce qui fonctionne

- ✅ `<html lang="fr">` dans index.html
- ✅ Meta title, description, viewport, canonical
- ✅ Open Graph (title, description, type, url, site_name)
- ✅ Twitter Card (summary_large_image)
- ✅ robots.txt avec exclusions admin/auth/profile
- ✅ Sitemap dynamique (routes statiques + catégories + soumissions + artistes)
- ✅ JSON-LD : Organization, WebSite, Event, MusicGroup, CollectionPage

### 7.2 Ce qui manque

| Élément | Impact |
|---------|--------|
| `og:image` manquant sur homepage | Pas de preview visuelle au partage |
| `og:locale` absent | Google ne sait pas que c'est fr_FR |
| `twitter:site` absent | Pas de lien vers le compte Twitter |
| Pas de `BreadcrumbList` structured data | Navigation non structurée |
| Pas de `FAQPage` structured data | FAQ non indexée en rich results |
| `sameAs` vide dans Organization JSON-LD | Pas de lien social dans les données structurées |
| Sitemap servi en client-side React | Content-Type potentiellement HTML au lieu de XML |
| Pas d'`apple-touch-icon` | Icône manquante pour bookmark mobile |
| Pas de `theme-color` meta | PWA non optimisé |

---

## 8. ACCESSIBILITÉ (WCAG 2.1 AA)

### 8.1 Problèmes CRITIQUES

#### Images sans alt text (~50+ occurrences)
- `alt=""` sur toutes les images de soumissions, avatars, covers dans :
  - VoteCard, Explore, SubmissionDetail, Results, Profile, ArtistProfile, AdminDashboard
- **Impact** : Contenu invisible pour les utilisateurs de lecteurs d'écran

### 8.2 Problèmes ÉLEVÉS

| Problème | Localisation |
|----------|-------------|
| AudioPlayer : boutons play/pause sans aria-label | `audio/AudioPlayer.tsx` |
| Sliders audio sans aria-label | `AudioPlayer.tsx`, `VoteCard.tsx` |
| Pas de skip-to-content link | `layout/Layout.tsx` (note: un lien sr-only existe mais pointe-t-il correctement?) |
| Bouton "Tout accepter" cookies plus proéminent que "Refuser" | `CookieConsent.tsx` — violation EDPB |

### 8.3 Problèmes MOYENS

| Problème | Détail |
|----------|--------|
| Pas de `prefers-reduced-motion` | Les animations Framer Motion ne s'adaptent pas |
| Pas de `aria-live` sur messages de statut | "Voté", compteur de caractères, etc. |
| Contraste non vérifié | Opacités Tailwind (`text-white/50`, `text-muted-foreground`) |
| Pas de `role="timer"` sur le countdown | `WeekCountdown.tsx` |
| Pas de re-consentement cookies accessible | Pas de lien "Gérer les cookies" dans le footer |

---

## 9. CONFORMITÉ LÉGALE (DROIT FRANÇAIS)

### 9.1 Pages légales : 7/7 ✅

| Page | Route | État |
|------|-------|------|
| Mentions Légales | `/legal/mentions` | ✅ Excellent — SASU, SIREN, DPO, hébergeur |
| CGU | `/terms` | ✅ Bon — mérite, non-influence paiement |
| CGV | `/legal/cgv` | ✅ Excellent — 11 articles, médiation, remboursement |
| Politique de confidentialité | `/privacy` | ✅ Bon — droits RGPD, bases légales |
| Politique cookies | `/cookies` | ⚠️ Incomplet — catégorie marketing non détaillée |
| Règlement du concours | `/contest-rules` | ✅ Excellent — méritocratique, transparent |
| FAQ | `/faq` | ✅ Bonus |

### 9.2 Points forts légaux

- ✅ Concours clairement positionné comme **méritocratique** (pas jeu de hasard)
- ✅ "Aucun paiement n'influence les résultats" — déclaré dans CGU, CGV et Règlement
- ✅ DPO désigné : `dpo@emotionscare.com`
- ✅ Bases légales RGPD listées (consentement, contrat, intérêt légitime)
- ✅ Durée de conservation : 3 ans après suppression du compte
- ✅ Droits des personnes : accès, rectification, effacement, portabilité
- ✅ Médiation consommation mentionnée dans CGV Article 10
- ✅ Droit de rétractation traité (Article L.221-28 Code de la consommation)
- ✅ Fiscalité des gains : responsabilité du gagnant clairement indiquée

### 9.3 Points à corriger

| Problème | Sévérité | Action |
|----------|----------|--------|
| RCS "En cours d'immatriculation" | HAUTE | Mettre à jour dès réception du numéro RCS |
| Politique cookies : marketing non détaillé | MOYENNE | Ajouter section marketing avec noms de cookies |
| Médiateur non spécifié dans CGV Art. 10 | MOYENNE | Indiquer le médiateur choisi (ex: Mediafor) |
| Sous-traitants non listés dans Privacy | MOYENNE | Ajouter Supabase, Stripe, Netlify/Lovable |
| Procédure de fuite de données absente | MOYENNE | Ajouter section notification de brèche |
| Cookies consent : boutons inégaux | MOYENNE | Rendre "Refuser tout" aussi visible que "Accepter" |
| Horodatage du consentement cookies absent | BASSE | Stocker `timestamp` en plus des préférences |
| Pas de lien "Gérer les cookies" en footer | BASSE | Ajouter lien pour modifier les préférences |

---

## 10. LOGIQUE MÉTIER

### 10.1 Flux de vote

```
Utilisateur → VoteFeed → VoteCard → cast-vote (edge function)
                                        ├── Vérif auth + email confirmé
                                        ├── Vérif période de vote active
                                        ├── Vérif pas d'auto-vote
                                        ├── Vérif quota (Free: 5/sem)
                                        ├── Vérif pas de doublon (1 vote/catégorie/semaine)
                                        ├── IA anti-fraude (LovableAI)
                                        ├── Rate limiting (50/h, 5/min)
                                        ├── Insertion vote + audit trail
                                        └── Incrément compteur soumission
```
**Évaluation** : 9/10 — Flux robuste avec anti-fraude multi-couches.

### 10.2 Flux de soumission

```
Artiste (Pro/Elite) → Compete → Upload audio + cover → Supabase Storage
                               → Insert submission (status: pending)
                               → Admin → Modération → approve/reject
                               → Si approuvé → visible dans Explore + Vote
```

### 10.3 Flux de résultats

```
Admin → compute-results → Score pondéré par catégorie
      → publish-results → Top 3 par catégorie
                        → Création winners + rewards
                        → Mise à jour reward_pool
```

### 10.4 Système anti-fraude

4 signaux de détection (fraud-scan) :
1. **Burst** : 3+ votes en 2 minutes
2. **IP clustering** : 3+ utilisateurs distincts depuis la même IP
3. **Nouveaux comptes** : Compte < 24h votant
4. **Concentration IP** : > 50% des votes d'une soumission depuis la même IP

Plus : détection IA en temps réel via LovableAI sur chaque vote.

### 10.5 Problème identifié : statut reward_pool

Le statut `threshold_met` ne peut jamais être atteint :
```typescript
// Bug : la 2e condition écrase la 1ère
if (current_cents >= minimum_cents && minimum_cents > 0) { status = "threshold_met"; }
if (current_cents >= minimum_cents && minimum_cents > 0) { status = "active"; } // ← écrase
```
**Impact** : Le pool passe directement de `inactive` à `active`, sautant `threshold_met`.

---

## 11. PERFORMANCE

### 11.1 Points positifs

- ✅ Code splitting (lazy loading toutes les pages sauf Index)
- ✅ Vite + SWC (compilation rapide)
- ✅ Animations via `transform`/`opacity` (performant GPU)
- ✅ Images lazy loading
- ✅ Requêtes parallèles avec Promise.all

### 11.2 Points d'attention

| Problème | Impact | Action |
|----------|--------|--------|
| Bundle principal 699 kB (gzip 213 kB) | Chargement initial lent | Optimiser manualChunks |
| Recharts 367 kB | Chunk chart trop gros | Import sélectif ou alternative légère |
| Auth chunk 93 kB | Lourd pour la page login | Évaluer si zod est tree-shakable |
| Pas de Service Worker | Pas de cache offline | Ajouter PWA si pertinent |
| browserslist obsolète (8 mois) | Build warnings | `npx update-browserslist-db@latest` |

---

## 12. STRINGS & I18N

### 12.1 État actuel

Toute l'application est en **français** avec des strings hardcodées. Aucun framework i18n n'est en place.

### 12.2 Incohérences trouvées

| Problème | Localisation |
|----------|-------------|
| "Assistant SoundClash" au lieu de "Weekly Music Awards" | `ai/AIChatbot.tsx:144` |
| Emails incohérents : `contact@emotionscare.com` vs domaine `weeklymusicawards.com` | Footer, pages légales |
| Typo : "categories votees" (manque accents) | `CategoryProgressBar.tsx` |
| Typo : "Decouvrez" (manque accent) | `SocialProof.tsx` |

---

## 13. PLAN D'ACTION PRIORISÉ

### 🔴 URGENT (Semaine 1)

1. **Activer `verify_jwt = true`** dans `supabase/config.toml`
2. **`npm audit fix`** pour corriger react-router XSS et glob injection
3. **Corriger le bug reward-pool** (status threshold_met)
4. **Ajouter headers de sécurité** dans CORS (X-Frame-Options, HSTS, etc.)
5. **Protéger les routes admin** avec un composant ProtectedRoute

### 🟠 HAUTE PRIORITÉ (Semaines 2-3)

6. Ajouter `og:image` sur la homepage (1200x630)
7. Corriger tous les `alt=""` sur les images (~50 occurrences)
8. Ajouter aria-labels sur AudioPlayer et sliders
9. Égaliser les boutons cookies (Accept/Refuser même importance visuelle)
10. Compléter la politique cookies (section marketing)
11. Lister les sous-traitants dans la Privacy Policy
12. Écrire les premiers vrais tests (hooks auth, subscription, vote-state)
13. Supprimer les PII des logs edge functions

### 🟡 MOYENNE PRIORITÉ (Mois 1-2)

14. Typer les edge functions (éliminer ~20 `any`)
15. Typer les composants frontend (éliminer ~18 `any` restants)
16. Ajouter structured data BreadcrumbList et FAQPage
17. Implémenter `prefers-reduced-motion`
18. Ajouter `aria-live` sur les messages de statut dynamiques
19. Splitter AdminDashboard en sous-composants
20. Ajouter Error Boundaries aux pages principales
21. Optimiser le bundle (manualChunks pour Recharts)
22. Mettre à jour RCS dès réception du numéro
23. Spécifier le médiateur dans CGV

### 🟢 BASSE PRIORITÉ (Backlog)

24. Framework i18n si expansion internationale prévue
25. Corriger le nom "SoundClash" dans AIChatbot
26. Countdown toutes les secondes (pas 60s)
27. Service Worker / PWA
28. Tests d'intégration E2E
29. Activer TypeScript strict mode progressivement
30. Consolider les doublons FAQ.tsx / Faq.tsx

---

## 14. MÉTRIQUES DU PROJET

| Métrique | Valeur |
|----------|--------|
| Fichiers source total | 150+ |
| Pages | 26 |
| Composants métier | 37 |
| Composants UI (shadcn) | 48 |
| Hooks custom | 6 |
| Edge functions | 17 |
| Migrations SQL | 14 |
| Tables DB | 13 |
| Tests | 1 (placeholder) |
| Erreurs lint | 48 |
| Vulnérabilités npm | 8 |
| Catégories musicales | 9 |

---

_Rapport généré le 2026-02-15 par audit automatisé du codebase._
_Prochain audit recommandé : après implémentation des actions urgentes (2-3 semaines)._
