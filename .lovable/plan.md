

# Internationalisation FR / EN / DE — Plan d'implémentation

## Scope

La plateforme contient **~30 pages** et **~40 composants** avec du texte en dur en français. L'ajout de 3 langues (FR, EN, DE) nécessite une refonte structurelle du système de textes.

## Architecture retenue

**Librairie : `react-i18next` + `i18next`** — standard de facto pour React, léger, supporté par TypeScript.

```text
src/
├── i18n/
│   ├── index.ts              ← config i18next (détection langue, fallback FR)
│   ├── locales/
│   │   ├── fr.json            ← toutes les clés FR
│   │   ├── en.json            ← toutes les clés EN
│   │   └── de.json            ← toutes les clés DE
├── components/
│   └── LanguageSwitcher.tsx   ← sélecteur de langue (Header + Footer)
```

## Etapes d'implémentation

### 1. Installer les dépendances
- `i18next`, `react-i18next`, `i18next-browser-languagedetector`

### 2. Créer la config i18n + les 3 fichiers de traduction

**`src/i18n/index.ts`** — initialise i18next avec :
- Détection automatique de la langue du navigateur
- Fallback sur `fr`
- Namespace unique `translation`
- Stockage du choix utilisateur dans `localStorage`

**Fichiers JSON** — structurés par section :
```json
{
  "nav": { "explore": "Explorer", "vote": "Voter", ... },
  "hero": { "title": "Le seul concours musical...", "subtitle": "..." },
  "footer": { "navigation": "Navigation", "legal": "Légal", ... },
  "auth": { "login": "Connexion", "signup": "S'inscrire", ... },
  "pricing": { ... },
  "common": { "loading": "Chargement...", "back": "Retour", ... }
}
```

Environ **300-400 clés** réparties sur les sections : `nav`, `hero`, `howItWorks`, `whyUs`, `artistBenefits`, `categories`, `socialProof`, `faq`, `cta`, `footer`, `auth`, `pricing`, `vote`, `results`, `profile`, `admin`, `badges`, `legal`, `common`, `errors`, `cookies`.

### 3. Créer le composant LanguageSwitcher
- Dropdown compact (drapeau + code langue) dans le Header
- Utilise `i18n.changeLanguage()`
- Persiste le choix dans `localStorage`

### 4. Brancher i18n dans l'app
- Importer `src/i18n/index.ts` dans `src/main.tsx`
- Wrapper avec `<Suspense>` pour le chargement initial

### 5. Migrer les composants — remplacement des textes en dur

Chaque composant est modifié pour utiliser `const { t } = useTranslation()` et remplacer les chaînes par `t("section.key")`.

**Composants impactés** (liste non exhaustive) :
- **Layout** : Header, Footer, BottomNav
- **Landing** : HeroSection, HowItWorks, WhyUs, ArtistBenefits, CategoriesSection, SocialProof, FAQ, CTASection, WeeklyPodium
- **Auth** : AuthLoginForm, AuthSignupForm, AuthForgotPassword, AuthConfirmationScreen
- **Vote** : VoteCard, VoteButton, VoteFeed, VoteQuotaBar, ShareSheet, CategoryProgressBar
- **Pricing** : PricingFAQ, SocialProofCounters, WhyEliteSection
- **Pages** : Pricing, Profile, Results, Explore, Compete, Stats, About, Badges, HallOfFame, Faq, NotFound
- **Legal** : Terms, Privacy, ContestRules, Cookies, CGV, MentionsLegales (contenu long)
- **Shared** : WeekCountdown, CookieConsent, ErrorBoundary
- **Admin** : AnalyticsTab, FraudMonitoring
- **Gamification** : BadgeProgress, BadgeShowcase, StreakBadge
- **AI** : AIChatbot, AIRecommendations, AITagSuggest, AIVoteSummary
- **SEO** : SEOHead (titres et descriptions)

### 6. Pages légales (Terms, Privacy, Cookies, CGV, ContestRules, MentionsLegales)

Ces pages contiennent des textes longs. Les traductions seront stockées dans les JSON sous des clés dédiées (ex: `legal.terms.article1`). Chaque article/section aura sa propre clé.

## Points d'attention

- **SEO** : Les balises `<title>` et `<meta description>` dans SEOHead utiliseront aussi `t()` pour être traduites
- **Dates** : `date-fns` supporte déjà les locales — on importera `fr`, `enUS`, `de` selon la langue active
- **Routes** : Les routes restent en anglais (pas de `/fr/`, `/en/`, `/de/` prefix) — la langue est gérée par le sélecteur, pas par l'URL
- **Volume** : C'est un changement massif (~50+ fichiers modifiés, ~1500 lignes de JSON par langue). L'implémentation sera faite par lots.

