

# AUDIT DÉFINITIF AVANT MISE EN PRODUCTION
## Weekly Music Awards — 6 mars 2026

---

## 1. RÉSUMÉ EXÉCUTIF

La plateforme Weekly Music Awards est un concours musical hebdomadaire communautaire avec vote, soumission, gamification et abonnements payants. L'architecture technique est solide (React/Supabase/Stripe/i18n), les parcours utilisateur principaux sont cohérents, et l'UX globale est au-dessus de la moyenne pour un MVP. Cependant, **un bug de régression critique** (noms de plans affichés comme clés i18n brutes), **des failles de sécurité/confidentialité flagrantes** (données IP/activité exposées, RLS manquant), et **un manque de contenu réel** (0 soumission, 0 vote, 0 artiste) rendent la plateforme **NON PUBLIABLE EN L'ÉTAT**.

**Verdict : NON — publiable sous conditions (3-5 jours de corrections P0/P1)**

**Note globale : 13.5/20**

**Top 5 risques :**
1. Bug i18n P0 : `pricing.freeName`, `pricing.proName`, `pricing.eliteName` affichés en clair sur la page Pricing
2. Données sensibles exposées (IP, user-agents, activités) via RLS trop permissifs
3. Vue `submissions_public` sans RLS — fuite de données potentielle
4. Absence de contenu réel (0 soumission) — première impression catastrophique
5. Leaked password protection désactivée

**Top 5 forces :**
1. Proposition de valeur claire dès le hero ("The only music contest 100% community-driven")
2. Architecture technique propre (code splitting, i18n 3 langues, PWA, SEO structurée)
3. Système de vote/gamification complet (streaks, badges, quotas, anti-fraude)
4. Parcours soumission bien construit avec audio trimmer et suggestions IA de tags
5. Admin dashboard complet avec modération, gestion des semaines et cagnottes

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation | Criticité | Décision |
|---|---|---|---|---|
| Compréhension produit | 16 | Claire en 5 secondes, hero efficace | Mineur | OK |
| Landing / Accueil | 15 | Bien structurée, mais vide de contenu réel | Majeur | Conditionnel |
| Onboarding | 12 | Pas d'onboarding post-inscription | Critique | A corriger |
| Navigation | 16 | Cohérente desktop/mobile, BottomNav efficace | Mineur | OK |
| Clarté UX | 14 | Bonne globalement, quelques états vides confus | Majeur | A améliorer |
| Copywriting | 14 | Clair et orienté bénéfices, quelques jargons | Mineur | OK |
| Crédibilité / Confiance | 11 | Social proof à 0, footer avec liens sociaux potentiellement morts, badge "Beta" | Critique | A corriger |
| Fonctionnalité principale (Vote) | 14 | Bien conçu mais 0 contenu à voter | Majeur | Conditionnel |
| Parcours utilisateur | 13 | Fluide quand il y a du contenu, frustrant à vide | Critique | A corriger |
| Bugs / QA | 10 | Bug i18n P0 sur Pricing, régression du nettoyage | Bloquant | A corriger |
| Sécurité préproduction | 10 | 4 findings "error" dans le scan, RLS insuffisants | Bloquant | A corriger |
| Conformité go-live | 13 | Pages légales présentes, RGPD cookies OK, pas de purge PII visible | Majeur | A vérifier |

---

## 3. AUDIT PAGE PAR PAGE

### Landing Page (/) — 15/20
- **Objectif** : Convertir un visiteur en inscrit
- **Perçu** : Concours musical communautaire avec votes et prix
- **Clair** : Titre hero, 3 badges de confiance, countdown, CTA
- **Flou** : "Next session in 6d" — session de quoi exactement ? Le terme "session" est ambigu (devrait être "Prochaine semaine de votes")
- **Manque** : Contenu vivant (les compteurs SocialProof sont à 0, le podium est vide)
- **Freine** : Un sceptique voit "0 artistes, 0 votes, 0 tracks" et part
- **Nuit crédibilité** : Badge "Beta" en footer + compteurs à zéro = produit pas lancé
- **Correction P0** : Cacher les compteurs SocialProof quand ils sont à 0 (déjà géré partiellement avec `hasData`)
- **Correction P1** : Remplacer "Next session in" par un label plus explicite

### Page Explore (/explore) — 14/20
- **Clair** : Titre, filtres par catégorie, recherche
- **Flou** : "Contest starts soon" quand il y a des soumissions mais 0 approuvées — confusion entre "pas commencé" et "en attente de modération"
- **Manque** : Aucune explication de ce que chaque catégorie contient (les emojis ℹ️ sont une bonne idée mais peu visibles)
- **Correction P2** : Différencier l'état "pas de semaine active" vs "semaine active mais 0 contenu approuvé"

### Page Vote (/vote) — 14/20
- **Clair** : Interface feed type TikTok, quota de votes visible
- **Flou** : Sans contenu, l'utilisateur voit "Contest starts soon" sans comprendre quand ni pourquoi
- **Manque** : Explication des critères de vote (originalité, production, émotion) AVANT le premier vote
- **Correction P1** : Ajouter un mini-guide au premier vote

### Page Submit (/compete) — 15/20
- **Points forts** : Gate free/pro claire, audio trimmer, AI tag suggest, production tips par catégorie, pré-remplissage du nom d'artiste
- **Flou** : "Submissions not open" quand hors période — pas de date concrète de réouverture
- **Manque** : Prévisualisation de la soumission avant envoi
- **Correction P2** : Afficher clairement la prochaine date d'ouverture

### Page Pricing (/pricing) — 8/20 (BUG BLOQUANT)
- **BUG P0** : Les noms de plans affichent `pricing.freeName`, `pricing.proName`, `pricing.eliteName` en clair — clés i18n supprimées par erreur lors du nettoyage
- **Source** : `Pricing.tsx` ligne 208 : `t(\`pricing.${key}Name\`)` — les clés `pricing.freeName`, `pricing.proName`, `pricing.eliteName` ont été supprimées des fichiers JSON comme "orphelines" alors qu'elles sont utilisées dynamiquement
- **Points forts** : Tableau comparatif complet, message "Plans don't influence rankings", réassurances
- **Correction P0** : Restaurer les clés `pricing.freeName`, `pricing.proName`, `pricing.eliteName` dans les 3 fichiers JSON

### Page Results (/results) — 14/20
- **Clair** : Titre, état "podium en préparation" avec explication
- **Points forts** : Realtime via Supabase channels, lien vers la méthode de scoring, cagnottes
- **Manque** : Lien vers le reveal live depuis cette page

### Page Profile (/profile) — 15/20
- **Points forts** : Stats, streak, badges, AI summary, gestion avatar/banner, liens sociaux
- **Flou** : Section "Plan Free" vs "Voir les offres" — pas immédiatement clair ce que le plan actuel donne/ne donne pas
- **Correction P2** : Ajouter une liste rapide des limitations du plan actuel

### Page Auth (/auth) — 16/20
- **Points forts** : Validation Zod, gestion email déjà existant, confirmation email, forgot password
- **Flou** : Pas de lien vers les CGU/Privacy dans le formulaire d'inscription
- **Correction P1** : Ajouter "En créant un compte, vous acceptez nos CGU et notre Politique de confidentialité"

### Page About (/about) — 16/20
- **Points forts** : Story authentique, timeline beta, contact email, SIREN affiché
- **Correction cosmétique** : Les liens sociaux en footer pointent vers des comptes qui n'existent peut-être pas encore

### Page Hall of Fame (/hall-of-fame) — 14/20
- **Clair** : État vide bien géré ("L'histoire commence ici")
- **Problème mineur** : Labels hardcodés "1er", "2e", "3e" en français dans le code (ligne 37), non traduits

### Pages légales (Terms, Privacy, CGV, Cookies, MentionsLegales, ContestRules) — 15/20
- **Présentes et complètes** — bon signe de maturité
- **Correction mineure** : Vérifier que toutes sont accessibles depuis le footer ✓ (confirmé)

### Page 404 — 17/20
- **Propre, fonctionnelle, branded** — rien à signaler

---

## 4. AUDIT FONCTIONNALITÉ PAR FONCTIONNALITÉ

| Fonctionnalité | Utilité | Clarté | Fluidité | Confiance | Note /20 | Défaut principal |
|---|---|---|---|---|---|---|
| Système de vote | Haute | Bonne | Bonne | Bonne | 15 | Pas de contenu pour tester |
| Soumission de track | Haute | Bonne | Bonne | Bonne | 15 | Pas de preview avant envoi |
| Audio player | Haute | Bonne | Bonne | Bonne | 16 | — |
| Gamification (streaks/badges) | Moyenne | Moyenne | Bonne | Bonne | 14 | Pas clair pour un novice |
| AI features (recommandations, summary, tags) | Moyenne | Bonne | Bonne | Bonne | 15 | Réservé Pro/Elite, pas visible par défaut |
| Pricing/Checkout | Haute | **Cassée** | — | **Brisée** | 8 | Bug i18n P0 |
| Notifications | Moyenne | Bonne | Bonne | Bonne | 14 | — |
| Follow/Social | Basse | Bonne | Bonne | Moyenne | 13 | Peu de valeur sans utilisateurs |
| Admin Dashboard | Haute | Bonne | Bonne | Bonne | 16 | — |
| PWA/Install | Basse | Bonne | Bonne | Bonne | 15 | — |
| i18n (FR/EN/DE) | Haute | Bonne | Bonne | **Cassée** | 10 | Régression pricing |
| Cookie Consent | Moyenne | Bonne | Bonne | Bonne | 16 | — |

---

## 5. PARCOURS UTILISATEUR CRITIQUES

### Parcours 1 : Découverte -> Inscription — 13/20
1. Landing page : claire ✓
2. CTA "Join the contest" -> page Auth : fluide ✓
3. Inscription : formulaire propre ✓
4. Confirmation email requise (pas d'auto-confirm) ✓
5. **Rupture** : après confirmation, redirection vers /profile sans aucun onboarding. L'utilisateur ne sait pas quoi faire ensuite.
6. **Abandon probable** : 40% — pas de "next step" clair

### Parcours 2 : Voter sur un track — 14/20 (quand il y a du contenu)
1. Aller sur /vote ou /explore
2. **Blocage actuel** : 0 contenu, état vide "Contest starts soon"
3. Quand il y a du contenu : feed TikTok-like, vote sur 3 critères, quota visible
4. **Friction** : pas d'explication des critères avant le premier vote
5. **Abandon probable** : 20% si contenu présent, 90% si vide

### Parcours 3 : Soumettre un track — 15/20
1. Gate clear : "Subscription required" pour les free
2. Formulaire complet avec audio trimmer
3. **Friction** : pas de préview avant soumission
4. **Abandon probable** : 15% — parcours bien guidé

### Parcours 4 : S'abonner Pro/Elite — 8/20 (BUG)
1. Page Pricing : **noms de plans illisibles** (clés i18n brutes)
2. **Abandon quasi certain** : un utilisateur qui voit `pricing.freeName` ne cliquera jamais sur "Start winning"
3. Checkout Stripe : non testable sans contenu
4. **Correction P0 obligatoire**

---

## 6. SÉCURITÉ / GO-LIVE READINESS

| Observé | Risque | Action avant prod |
|---|---|---|
| `vote_events` expose IP/user-agent aux utilisateurs | **RGPD violation** — l'utilisateur peut voir son propre historique IP | P0 : Retirer la policy "Users can view own vote events" ou masquer les colonnes sensibles |
| `submissions_public` vue sans RLS | Fuite de données potentielle | P1 : Ajouter RLS ou vérifier que c'est intentionnel |
| `activities` lisible par tous les authentifiés | Exposition des comportements utilisateur | P1 : Restreindre au propriétaire |
| `vote_streaks` lisible par tous | Patterns de vote individuels exposés | P2 : OK si leaderboard, mais documenter |
| Leaked password protection désactivée | Comptes compromis par mots de passe fuités | P1 : Activer via config auth |
| Pas de rate limiting visible sur les formulaires | Brute force possible sur login | P2 : Supabase gère par défaut, mais vérifier |
| Admin dashboard protégé par rôle serveur (user_roles) | ✓ Sécurisé correctement | — |
| Stripe secrets en edge functions | ✓ Correctement gérés via env vars | — |
| Auth : email redirect configuré | ✓ `emailRedirectTo` présent | — |
| RLS sur toutes les tables principales | ✓ Politiques cohérentes | — |
| CORS headers via `_shared/cors.ts` | ✓ Centralisé | — |

---

## 7. LISTE DES PROBLÈMES PRIORISÉS

### P0 — Bloquant production

| # | Titre | Impact | Où | Criticité |
|---|---|---|---|---|
| 1 | **Clés i18n `pricing.*Name` manquantes** | Noms de plans illisibles, checkout impossible | `/pricing`, 3 fichiers JSON | Bloquant |
| 2 | **Données IP/UA exposées via RLS** | Violation RGPD potentielle | Table `vote_events` | Bloquant |
| 3 | **`submissions_public` sans RLS** | Fuite de données non contrôlée | Vue DB | Bloquant |

### P1 — Très important

| # | Titre | Impact | Où |
|---|---|---|---|
| 4 | Activer leaked password protection | Sécurité comptes | Config auth |
| 5 | Table `activities` accessible à tous les authentifiés | Privacy | RLS |
| 6 | Pas d'onboarding post-inscription | Perte utilisateurs | Parcours auth -> profile |
| 7 | Mention CGU/Privacy absente du formulaire d'inscription | Conformité légale | `/auth` signup |
| 8 | Liens sociaux footer potentiellement morts | Crédibilité | Footer |

### P2 — Amélioration forte valeur

| # | Titre | Impact | Où |
|---|---|---|---|
| 9 | Seed data / contenu de démonstration | Première impression | Toutes les pages de contenu |
| 10 | Guide des critères de vote | UX novice | `/vote` |
| 11 | Preview soumission avant envoi | UX soumission | `/compete` |
| 12 | Labels HallOfFame hardcodés FR | i18n | `HallOfFame.tsx` |
| 13 | "Next session in" ambigu | Clarté hero | Landing |

### P3 — Confort / Finition

| # | Titre | Impact |
|---|---|---|
| 14 | Compteurs social proof quand 0 | Cosmétique (déjà partiellement géré) |
| 15 | Dark mode : contraste de certains badges | Accessibilité mineure |

---

## 8. VERDICT FINAL FRANC

### La plateforme est-elle prête ?
**Non.** Un bug de régression bloquant (noms de plans i18n cassés) rend la page Pricing inutilisable — c'est la page de conversion principale. Les failles de sécurité/confidentialité (IP exposées, vue sans RLS) sont des risques RGPD réels. L'absence totale de contenu rend l'expérience première désastreuse.

### Ce qui empêche un expert d'autoriser la production :
1. Bug i18n P0 sur la page Pricing — directement issu du dernier nettoyage de clés
2. 3 findings de sécurité de niveau "error" non résolus
3. Aucun contenu de démonstration — un utilisateur voit une plateforme vide

### Ce qui donne confiance :
1. L'architecture est professionnelle et bien structurée
2. Les parcours fonctionnels sont complets quand il y a du contenu
3. La sécurité admin/rôles est correctement implémentée
4. Le code est propre, testé, et bien organisé

### 3 corrections les plus rentables :
1. **Restaurer les 3 clés i18n pricing** (5 min, impact maximal — page de conversion réparée)
2. **Corriger les 3 RLS critiques** (30 min, conformité RGPD + go-live security)
3. **Créer un jeu de seed data réaliste** (1h, première impression transformée)

### Si j'étais décideur externe :
Je **refuserais** la mise en production aujourd'hui. Mais je l'autoriserais après correction des 3 P0 et des 5 P1, ce qui représente environ 2-3 jours de travail. La plateforme a un bon potentiel et une base technique solide — elle est à 80% du niveau production.

