

# Audit complet pre-production — Weekly Music Awards

---

## 1. SECURITE

### 1.1 Critiques (P0 — a corriger avant le lancement)

**`dangerouslySetInnerHTML` avec input utilisateur**
- `AuthConfirmationScreen.tsx:28` — l'email de l'utilisateur est injecte dans du HTML via `dangerouslySetInnerHTML`. Un email malicieux (ex. `<img onerror=alert(1)>@test.com`) pourrait executer du XSS.
- `ScoringMethod.tsx` — utilise `dangerouslySetInnerHTML` sur des cles i18n. Risque faible (contenu controle) mais mauvaise pratique.
- `ArticleDetail.tsx:162` — contenu d'articles rendu en HTML brut. Si les articles proviennent d'un CMS ou de la DB, c'est un vecteur XSS.
- **Correction** : sanitiser avec DOMPurify ou utiliser un composant de rendu securise. Pour l'email, utiliser un `<span>` classique avec interpolation React.

**`delete-account` edge function manquante dans `config.toml`**
- La fonction existe dans le code mais n'est pas declaree dans `supabase/config.toml`. Elle sera deployee avec `verify_jwt = true` par defaut, mais c'est un oubli a formaliser.

**CORS trop permissif sur `stripe-webhook`**
- `stripe-webhook/index.ts` utilise `Access-Control-Allow-Origin: *` au lieu du helper `getCorsHeaders()`. Webhook Stripe n'a pas besoin de CORS du tout (appels serveur-a-serveur). La wildcard est inutile et expose a des appels navigateur non desires.

**IP spoofable via `X-Forwarded-For`**
- `cast-vote/index.ts:246` — l'IP est lue depuis `X-Forwarded-For` qui est facilement falsifiable. Les signaux anti-fraude bases sur l'IP sont contournables. Documenter cette limitation ou utiliser un header plus fiable fourni par l'infra (ex. `CF-Connecting-IP`).

**Admin check cote client dans `Header.tsx`**
- Le role admin est verifie cote client en lisant `user_roles`. C'est correct pour le rendu UI, mais l'`AdminDashboard` doit aussi valider cote serveur. Verifier que les RLS sur les tables admin empechent tout acces non-admin (c'est le cas d'apres les policies).

### 1.2 Moderees (P1)

**Pas de rate limiting sur `delete-account`**
- Un utilisateur pourrait appeler cette fonction en boucle. Ajouter un rate limit ou un delai.

**Logs contenant des donnees sensibles (RGPD)**
- Les edge functions loguent des user IDs et emails. En production, les emails ne devraient pas apparaitre dans les logs. Remplacer par des identifiants anonymises.

**`SUPABASE_PUBLISHABLE_KEY` dans les edge functions**
- Utilise dans `cast-vote`, `compute-results`, `fraud-scan`, etc. pour creer un client "user". C'est correct (cle publique) mais la variable d'environnement n'est pas dans la liste des secrets declares. S'assurer qu'elle est bien disponible en runtime.

---

## 2. BASE DE DONNEES & RLS

### 2.1 Points positifs
- RLS active sur toutes les tables sensibles
- Fonction `has_role()` en `SECURITY DEFINER` pour eviter la recursion
- Vue `submissions_public` avec `security_barrier` pour masquer les `vote_count`
- Vue `vote_events_safe` pour masquer IP/User-Agent
- Purge automatique des PII apres 30 jours

### 2.2 Points d'attention
- **Pas de trigger enregistre en DB** — les triggers definis dans les fonctions SQL (`update_vote_streak`, `notify_vote_received`, etc.) existent comme fonctions mais les triggers eux-memes ne sont pas visibles. Verifier qu'ils sont bien attaches aux tables via les migrations.
- **Table `vote_events` sans DELETE policy** — correct pour l'integrite, mais la purge PII via `UPDATE` fonctionne car la policy admin le permet.
- **`webhook_events` INSERT policy `WITH CHECK (true)`** — permet a n'importe quel utilisateur authentifie d'inserer. Devrait etre restreint au service role uniquement.

---

## 3. EDGE FUNCTIONS

### 3.1 Architecture
- 20+ edge functions couvrant vote, paiement, IA, badges, notifications push
- Anti-fraude IA integre au flow de vote (blocking)
- Stripe webhook avec verification de signature

### 3.2 Problemes
- **Inconsistance CORS** : `stripe-webhook` utilise ses propres headers au lieu du helper partage `_shared/cors.ts`
- **`check-subscription` appele toutes les 60s** (`use-subscription.ts:52`) — potentiellement couteux (appel Stripe a chaque fois). Considerer un cache local de 5-10 minutes.
- **Product IDs differents entre `cast-vote` et `check-subscription`** :
  - `cast-vote`: `prod_TvnnCLdThflvd5` (pro), `prod_Tvnn1RBP7qVms7` (elite)
  - `check-subscription`: `prod_U6y4cllNm98nSu` (pro), `prod_U6y4DZWCM4jaZ3` (elite)
  - **C'est un bug critique** — les deux fonctions ne reconnaissent pas les memes produits Stripe. Un abonne Pro selon `check-subscription` sera vu comme free par `cast-vote`.

---

## 4. FRONTEND

### 4.1 Performance
- Code splitting avec `lazy()` sur toutes les pages sauf Index — bien
- Google Fonts charge via CSS `@import` — bloque le rendu. Migrer vers `<link rel="preload">` dans `index.html`
- Service Worker avec strategie network-first pour navigation et cache-first pour assets — correct
- `QueryClient` instancie hors du composant — correct, pas de re-creation a chaque render

### 4.2 UX / Accessibilite
- Skip-to-content link present
- `aria-label` sur les navigations principales et footer
- `prefers-reduced-motion` respecte dans le CSS
- Theme toggle et language switcher accessibles
- **Manque** : pas de `aria-live` pour les notifications toast (gere par Radix, OK)

### 4.3 i18n
- 3 langues (FR/EN/DE) avec scripts de validation CI
- `index.html` hardcode `lang="fr"` — devrait etre dynamique selon la langue detectee
- Les JSON-LD dans `index.html` sont en francais uniquement — pas de variante EN/DE

### 4.4 PWA
- Manifest correct avec icones 192/512
- Service Worker avec push notifications
- Offline fallback page
- Install prompt fonctionnel

---

## 5. SEO

### 5.1 Points positifs
- `SEOHead` avec Open Graph, Twitter Cards, JSON-LD
- `robots.txt` avec exclusions admin/auth/profile
- Sitemap dynamique
- Canonical URLs
- Schemas structures riches (Organization, WebSite, FAQPage, HowTo, Event, MusicGroup, BreadcrumbList)

### 5.2 Points d'attention
- **JSON-LD duplique** : `index.html` ET `SEOHead` emettent les memes schemas sur la homepage — duplication
- **`og:image`** defini dans `index.html` mais pas systematiquement dans `SEOHead` (image optionnelle)

---

## 6. CONFORMITE JURIDIQUE / RGPD

### 6.1 Points positifs
- Cookie consent avec 3 niveaux (essential/analytics/marketing)
- Bouton "Gerer mes cookies" dans le footer
- Pages legales completes : CGU, CGV, Mentions legales, Politique de confidentialite, Reglement du concours, Politique cookies
- Suppression de compte fonctionnelle (`delete-account`)
- Purge automatique des PII (IP/User-Agent) apres 30 jours
- Email de confirmation obligatoire (auto-confirm desactive)

### 6.2 Points d'attention
- **Le consentement cookies n'est pas verifie avant le tracking** — `trackEvent()` dans `analytics.ts` envoie des events sans verifier si l'utilisateur a consenti aux cookies analytics
- **Pas de banniere "droit a la portabilite"** — RGPD exige l'export des donnees personnelles, pas seulement la suppression

---

## 7. TESTS & CI

### 7.1 Points positifs
- Vitest + Testing Library configures
- Tests pour les composants critiques (Auth, Footer, Header, AudioPlayer, FAQ, etc.)
- Tests edge functions (cast-vote, compute-results, check-subscription, fraud-scan, etc.)
- Scripts i18n automatises dans le CI
- Lint + type-check dans le pipeline

### 7.2 Manques
- **Pas de tests E2E** (Playwright/Cypress) — le flow complet inscription > soumission > vote > resultats n'est pas couvert
- **Pas de test de regression visuelle**

---

## 8. RESUME PRIORITAIRE

```text
┌─────────────────────────────────────────────────────────┬──────────┐
│ Probleme                                                │ Priorite │
├─────────────────────────────────────────────────────────┼──────────┤
│ Product IDs Stripe incoherents cast-vote/check-sub      │ P0       │
│ dangerouslySetInnerHTML avec email utilisateur (XSS)    │ P0       │
│ Google Fonts bloquant le rendu                          │ P1       │
│ Consentement cookies non verifie avant tracking         │ P1       │
│ CORS wildcard sur stripe-webhook                        │ P1       │
│ check-subscription appele toutes les 60s (cout Stripe)  │ P1       │
│ delete-account absent de config.toml                    │ P1       │
│ webhook_events INSERT trop permissif                    │ P1       │
│ index.html lang="fr" hardcode                           │ P2       │
│ JSON-LD duplique (index.html + SEOHead)                 │ P2       │
│ Logs RGPD (emails dans les logs edge functions)         │ P2       │
│ Pas de tests E2E                                        │ P2       │
│ Pas d'export de donnees personnelles (portabilite)      │ P2       │
└─────────────────────────────────────────────────────────┴──────────┘
```

---

## 9. RECOMMANDATION

Les deux **bloquants absolus** avant mise en production sont :
1. **Harmoniser les Product IDs Stripe** entre `cast-vote` et `check-subscription` — sans cela, les abonnes payants seront traites comme des utilisateurs gratuits lors du vote
2. **Corriger le XSS** sur `AuthConfirmationScreen` en remplacant `dangerouslySetInnerHTML` par une interpolation React securisee

Souhaitez-vous que je corrige ces P0 en priorite ?

