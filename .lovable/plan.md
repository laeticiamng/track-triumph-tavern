

# AUDIT TECHNIQUE COMPLET V4 — Weekly Music Awards

## 1. RESUME EXECUTIF

**Etat global** : La plateforme est a 80% de maturite production. Le coeur (auth, vote, soumission, paiement Stripe, admin, RLS, i18n) est solide et bien structure. Les corrections de l'audit precedent (demo warnings, disabled CTAs, i18n des nouvelles pages, og:image, footer programs, 12 mois cultural exchange, prefers-reduced-motion) ont ete implementees.

**Verdict go-live** : **NON EN L'ETAT** — Restent des problemes P0 non resolus.

### 5 P0

| # | Probleme |
|---|----------|
| 1 | **Impact Dashboard : donnees 100% hardcodees** — Les KPIs (2 430, 612, 19, 184) et les graphiques geo/demographics restent des constantes JavaScript. Le bandeau "demo" attenupas le risque mais les chiffres sont toujours affiches comme des faits. |
| 2 | **Mentor Match : mentors fictifs** — 6 mentors inventes (Elena V., Lars E., etc.) affiches avec avatars et specialites. Le bandeau "programme en preparation" est present mais les donnees restent trompeuses pour un visiteur. |
| 3 | **MentorshipResidencySection : titres "Mentor Match" et "Virtual Residency" hardcodes** — Ligne 74 : `<h3>{p.title}</h3>` utilise la propriete `title` en dur ("Mentor Match", "Virtual Residency") au lieu d'une cle i18n. Casse en EN/DE. |
| 4 | **ImpactDashboard : geoData country names hardcodes en francais** — "Allemagne", "Espagne", "Pays-Bas" dans le graphique, non traduits. Casse en EN/DE. |
| 5 | **Aucune protection d'acces sur /impact** — Le dashboard institutionnel est accessible sans authentification. Decision produit requise mais non tranchee. |

### 5 P1

| # | Probleme |
|---|----------|
| 1 | **Doublon de requetes notifications** — A chaque navigation, 2 requetes identiques `GET notifications` sont envoyees simultanement (visible dans les network requests). Gaspillage + potentiel race condition. |
| 2 | **check-subscription appele a chaque navigation** — Pas de cache cote client. Chaque changement de page declenche un appel POST a check-subscription. Latence + cout Stripe API. |
| 3 | **verify_jwt = false sur toutes les Edge Functions** — 27 fonctions sans verification JWT au gateway. La validation est faite en code mais la premiere couche de defense est absente. |
| 4 | **CategoriesSection : icon `Accessibility` vs `Heart`** — L'audit precedent recommandait `Accessibility`, c'est maintenant `Accessibility` (corrige). Mais SocialMissionSection utilise aussi `Accessibility` pour le pilier inclusion — OK, coherent. |
| 5 | **Pas de hreflang** — Site trilingue (FR/EN/DE) mais aucune balise hreflang dans le HTML. Impact SEO pour le trafic international. |

---

## 2. TABLEAU D'AUDIT

| Prio | Domaine | Localisation | Probleme | Risque | Recommandation | Faisable ? |
|------|---------|-------------|----------|--------|----------------|-----------|
| P0 | Frontend | ImpactDashboard.tsx L11-16, L18-27 | KPIs et geoData hardcodes, affiches comme reels | Tromperie | Connecter a DB ou retirer les chiffres | Partiellement (retirer chiffres = oui) |
| P0 | Frontend | MentorMatch.tsx L12-19 | 6 mentors fictifs avec noms/pays/specialites | Tromperie | Retirer la grille de mentors fictifs ou ajouter explicitement "Exemples fictifs" | Oui |
| P0 | i18n | MentorshipResidencySection.tsx L14,24 | `title: "Mentor Match"` / `"Virtual Residency"` hardcodes | Casse EN/DE | Remplacer par cle i18n | Oui |
| P0 | i18n | ImpactDashboard.tsx L18-27 | Noms de pays hardcodes en francais dans geoData | Casse EN/DE | Utiliser cles i18n pour les noms de pays | Oui |
| P0 | Security | /impact route | Dashboard institutionnel sans auth | Acces public indu | Ajouter guard auth ou decision produit | Decision requise |
| P1 | Performance | Network requests | 2x GET notifications en doublon a chaque nav | Gaspillage | Deduplicquer dans le hook ou React Query | Oui |
| P1 | Performance | check-subscription | Appel POST a chaque navigation, pas de cache | Latence + cout API | Ajouter staleTime dans React Query | Oui |
| P1 | Security | config.toml | verify_jwt = false sur 27 fonctions | Defense en profondeur absente | Documenter ou activer sur fonctions sensibles | Non (config auto-generee) |
| P1 | SEO | Toutes pages | Aucun hreflang pour FR/EN/DE | SEO international degrade | Ajouter dans SEOHead | Oui |
| P2 | i18n | ImpactDashboard.tsx L79 | `k.changeKey` affiche "+18%", "+32%" etc. non traduit | Mineure mais incoherent | Utiliser cles i18n | Oui |
| P2 | UX | MentorMatch.tsx L46 | Texte "Mentor Match" dans le badge hardcode en anglais | Incoherence i18n | Utiliser cle | Oui |
| P2 | UX | VirtualResidency.tsx L37 | Texte "Virtual Residency" dans le badge hardcode en anglais | Incoherence i18n | Utiliser cle | Oui |
| P2 | Accessibility | Framer motion animations | SocialMissionSection utilise useReducedMotion mais les 4 nouvelles pages (Impact, Mentor, Residency, Cultural) ne l'utilisent pas | A11y | Ajouter useReducedMotion | Oui |
| P3 | SEO | JSON-LD | organizationJsonLd.description et howItWorksJsonLd en francais uniquement | SEO multilingue | Pas critique | Non urgent |

---

## 3. DETAIL PAR CATEGORIE

### Frontend & Rendu
- **Fonctionne** : Toutes les routes chargent, lazy loading OK, ErrorBoundary present, Layout coherent, 404 OK.
- **Probleme** : ImpactDashboard, MentorMatch, VirtualResidency = pages vitrines avec donnees hardcodees. Les bandeaux "demo"/"coming soon" sont presents (corrige audit precedent).

### QA Fonctionnelle
- **Fonctionne** : Auth (signup/login/reset), vote, soumission, profil, admin (guard OK), contact form, pricing checkout, portail client.
- **Probleme** : Les boutons des nouvelles pages sont disabled (OK). Aucun flux reel pour mentor/residency/impact.

### Auth & Autorisations
- **Fonctionne** : Guard sur Profile, Admin, Following, SubmissionReview. Admin verifie user_roles. Non-admin redirige vers /.
- **Probleme** : /impact accessible sans auth (decision produit en suspens).

### APIs & Edge Functions
- **Fonctionne** : cast-vote, check-subscription, create-checkout, compute-results, fraud-scan, stripe-webhook, retry-webhooks — tous deployes et fonctionnels.
- **Probleme** : check-subscription appele a chaque navigation sans cache. Notifications en doublon.

### Database & RLS
- **Fonctionne** : RLS bien structure, vote_events et webhook_events verrouilles, vues securisees, has_role() SECURITY DEFINER avec search_path fixe, handle_new_user() cree profil + role, purge PII automatique.
- **Rien de nouveau a signaler.**

### Securite
- **Fonctionne** : CORS whitelist, rate limiting analytics, fraud detection IA, webhook signature verification, PII purge.
- **Probleme** : verify_jwt = false partout (acceptable avec validation en code mais perte de defense en profondeur).

### Paiement & Billing
- **Fonctionne** : Checkout Stripe, portail client, subscription tiers, webhook processing, anti-double-subscription check.
- **Non confirme** : Mode live vs test.

### Performance
- **Fonctionne** : Lazy loading routes, code splitting, Suspense fallback.
- **Probleme** : Doublons requetes notifications, check-subscription sans cache.

### SEO
- **Fonctionne** : SEOHead avec title/desc/canonical/OG/Twitter/JSON-LD, sitemap, robots.txt, og-image par defaut.
- **Manque** : hreflang, JSON-LD multilingue.

### i18n
- **Fonctionne** : 1488 lignes en.json, couverture des nouvelles pages (impact, mentorMatch, virtualResidency, culturalExchange, socialMission, mentorship, footer2).
- **Casse** : 3 textes hardcodes restants (MentorshipResidencySection titles, badge labels sur MentorMatch/VirtualResidency, noms pays ImpactDashboard geoData).

### Accessibilite
- **Fonctionne** : Skip to content, aria labels, prefers-reduced-motion dans SocialMissionSection.
- **Manque** : prefers-reduced-motion sur les 4 nouvelles pages.

### Observabilite / Go-live
- **Fonctionne** : Analytics custom, logs structures, purge automatique, pages legales completes, cookie consent.
- **Manque** : Sentry, health endpoint.

---

## 4. PLAN D'ACTION

### P0 — Implementation immediate

1. **MentorshipResidencySection.tsx** — Remplacer `title: "Mentor Match"` et `title: "Virtual Residency"` par des cles i18n (`mentorship.programs.mentorTitle` et `mentorship.programs.residencyTitle`). Ajouter ces cles dans fr/en/de.json.

2. **ImpactDashboard.tsx** — Remplacer les noms de pays hardcodes dans `geoData` par des cles i18n (`impact.geo.france`, `impact.geo.germany`, etc.). Ajouter les cles dans les 3 fichiers.

3. **MentorMatch.tsx L46** — Remplacer le badge hardcode "Mentor Match" par `t("mentorMatch.badge")`. Ajouter la cle.

4. **VirtualResidency.tsx L37** — Remplacer le badge hardcode "Virtual Residency" par `t("virtualResidency.badge")`. Ajouter la cle.

### P1 — Corrections rapides

5. **SEOHead.tsx** — Ajouter un `<link rel="alternate" hreflang>` pour fr/en/de.

6. **Deduplication notifications** — Identifier la source du doublon dans les hooks et corriger.

7. **check-subscription cache** — Ajouter `staleTime` dans le hook useSubscription pour eviter les appels repetitifs.

### P2

8. Ajouter `useReducedMotion` dans ImpactDashboard, MentorMatch, VirtualResidency, CulturalExchange.

### Fichiers a modifier

- `src/components/landing/MentorshipResidencySection.tsx` (cles i18n pour titles)
- `src/pages/ImpactDashboard.tsx` (i18n geoData)
- `src/pages/MentorMatch.tsx` (badge i18n)
- `src/pages/VirtualResidency.tsx` (badge i18n)
- `src/components/seo/SEOHead.tsx` (hreflang)
- `src/i18n/locales/fr.json` (nouvelles cles)
- `src/i18n/locales/en.json` (nouvelles cles)
- `src/i18n/locales/de.json` (nouvelles cles)
- `src/hooks/use-notifications.ts` (deduplication)
- `src/hooks/use-subscription.tsx` (staleTime cache)

### Non faisable sans decision

- Protection auth sur /impact (decision produit)
- verify_jwt activation (config auto-generee)
- Connexion Impact Dashboard aux vraies donnees DB (tables pas encore creees)
- Sentry / monitoring externe

