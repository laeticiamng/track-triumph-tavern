# AUDIT DÉFINITIF PRÉPRODUCTION — Weekly Music Awards
**Date :** 7 mars 2026  
**Auditeur :** Audit externe senior multi-expertise  
**Version :** 1.0  

---

## 1. RÉSUMÉ EXÉCUTIF

**Verdict global :** La plateforme est **prometteuse et techniquement solide** mais présente des **frictions UX significatives** et des **zones de confusion** qui empêchent une mise en production optimale. Le produit est compréhensible pour un utilisateur attentif mais pas pour un utilisateur pressé ou novice.

**La plateforme est-elle publiable aujourd'hui ?** **OUI SOUS CONDITIONS** — Les P0 doivent être corrigés avant go-live.

**Note globale : 14.5/20**

**Niveau de confiance : Moyen-élevé**

### Top 5 des risques avant production
1. **Page Vote vide sans connexion** — L'utilisateur non connecté voit une page quasi-vide (0/5 votes, bouton "All", rien d'autre). Aucun contenu, aucune explication, aucun CTA. Abandon garanti.
2. **Mélange de langues incohérent** — Badge "Contest live" en anglais avec "Saison 1 — Semaine 2 open" en français. "Saison" dans le live badge même en mode anglais. Confusion.
3. **Page Submit (/compete) redirige vers signup sans explication** — Un utilisateur non connecté qui clique "Submit" dans la nav arrive sur un formulaire d'inscription sans comprendre pourquoi ni ce qu'il va pouvoir faire ensuite.
4. **Absence d'état vide informatif sur Vote** — La page Vote ne montre aucune soumission, aucun message d'explication, aucune guidance. C'est un écran mort.
5. **Icônes sociales dans le footer (Instagram, YouTube) sans vrais comptes** — Clics qui ne mènent nulle part = perte de crédibilité.

### Top 5 des forces réelles
1. **Proposition de valeur immédiatement claire sur le Hero** — On comprend le concept en <5 secondes.
2. **Système de notation multi-critères solide** — 3 axes (émotion, originalité, production) bien pensés et pondérés par catégorie.
3. **Architecture technique robuste** — RLS, edge functions sécurisées, auth propre, migration DB structurée.
4. **12 catégories musicales riches** — Chacune avec historique, artistes notables, tips de production. Contenu éditorial de qualité.
5. **Pricing transparent et non-intrusif** — "Plans don't influence rankings" est un excellent message de confiance. Grille tarifaire claire.

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation synthétique | Criticité | Décision |
|---|---|---|---|---|
| Compréhension produit | 16 | Hero très clair, subtitle efficace | Mineur | Prêt |
| Landing / accueil | 15 | Structure solide, quelques incohérences linguistiques | Majeur | Correctifs requis |
| Onboarding | 11 | Pas de WelcomeDialog activé, pas de guide post-inscription | Critique | Correctifs requis |
| Navigation | 15 | Header et BottomNav cohérents, bonne structure | Mineur | Prêt |
| Clarté UX | 13 | Page Vote vide catastrophique, états vides insuffisants | Critique | Correctifs requis |
| Copywriting | 14 | Bon en général, incohérences de langue | Majeur | Correctifs requis |
| Crédibilité / confiance | 14 | Solide sauf icônes sociales vides et compteurs | Majeur | Correctifs requis |
| Fonctionnalité principale (vote) | 12 | Fonctionne mais UX dégradée sans connexion | Critique | Correctifs requis |
| Parcours utilisateur | 13 | Ruptures sur Vote et Submit pour non-connectés | Critique | Correctifs requis |
| Bugs / QA | 16 | Tests passent, pas de bug majeur visible | Mineur | Prêt |
| Sécurité préproduction | 16 | RLS solides, auth correcte, edge functions protégées | Mineur | Prêt |
| Conformité / go-live | 15 | Pages légales complètes, RGPD cookie consent | Mineur | Prêt |

---

## 3. AUDIT PAGE PAR PAGE

### 3.1 Landing Page (/)
**Note : 15/20**

| Critère | Évaluation |
|---|---|
| Objectif supposé | Présenter le produit, convertir en inscription |
| Objectif perçu | ✅ Immédiatement clair |
| Ce qui est clair | Concept, prix, fonctionnement en 3 étapes |
| Ce qui est flou | "Contest live · Saison 1 — Saison 1 — Semaine 2 open" — double "Saison 1" redondant |
| Ce qui manque | Aucun extrait audio jouable sur la landing (on parle de musique mais on n'en entend pas) |
| Ce qui freine | Cookie banner masque le countdown |
| Ce qui nuit à la crédibilité | Icônes Instagram/YouTube dans le footer sans vrais liens |
| Correction P0 | Supprimer la redondance "Saison 1 — Saison 1" dans le live badge |
| Correction P1 | Ajouter un aperçu audio ou un player sur la landing |
| Correction P2 | Retirer les icônes sociales si pas de comptes actifs |

### 3.2 Page Explore (/explore)
**Note : 16/20**

| Critère | Évaluation |
|---|---|
| Objectif perçu | ✅ Découvrir les soumissions de la semaine |
| Ce qui est clair | Filtres par catégorie, recherche, podium précédent, countdown |
| Ce qui est flou | "Switch to vote mode" — peu clair pour un novice |
| Ce qui manque | Explication de ce que signifient les badges colorés sur les catégories |
| Points forts | Bon layout, search fonctionnel, informations contextuelles |
| Correction P2 | Clarifier le CTA "Switch to vote mode" |

### 3.3 Page Vote (/vote)
**Note : 8/20 — PROBLÈME SÉRIEUX**

| Critère | Évaluation |
|---|---|
| Objectif perçu | ❌ Page quasi-vide, incompréhensible |
| Ce qui est clair | Rien. Barre "0/5 votes this week" sans contexte |
| Ce qui est flou | TOUT. Pourquoi c'est vide ? Que dois-je faire ? Faut-il être connecté ? |
| Ce qui manque | État vide informatif, CTA de connexion, explication du fonctionnement |
| Ce qui freine | L'utilisateur ne voit aucun contenu, aucune instruction. Abandon immédiat |
| Correction P0 | Ajouter un état vide avec explication + CTA connexion/inscription |

### 3.4 Page Submit/Compete (/compete)
**Note : 14/20**

| Critère | Évaluation |
|---|---|
| Objectif perçu | S'inscrire pour participer (redirect vers signup si non connecté) |
| Ce qui est clair | Formulaire d'inscription clair et bien structuré |
| Ce qui manque | Message expliquant POURQUOI on est redirigé vers l'inscription. L'utilisateur ne sait pas que Submit requiert un compte Pro |
| Correction P1 | Ajouter un écran intermédiaire expliquant les prérequis avant redirect |

### 3.5 Page Auth (/auth)
**Note : 16/20**

| Critère | Évaluation |
|---|---|
| Objectif perçu | ✅ Connexion/inscription claire |
| Points forts | Design propre, validation en temps réel, liens légaux, micro-copy rassurant ("Free · No credit card · Sign up in 30s") |
| Ce qui manque | Pas de social login (Google/GitHub) — attendu par les utilisateurs modernes |
| Correction P3 | Envisager social login pour réduire la friction d'inscription |

### 3.6 Page Results (/results)
**Note : 15/20**

| Critère | Évaluation |
|---|---|
| Objectif perçu | ✅ Voir les résultats du concours |
| Points forts | Reward pool visible, état vide informatif ("The podium is being prepared..."), CTAs pertinents |
| Ce qui est flou | "Saison 1 — Semaine 2 — Awaiting publication" — mélange français/anglais |
| Correction P1 | Harmoniser la langue (tout en anglais ou tout en français selon la locale) |

### 3.7 Page Pricing (/pricing)
**Note : 17/20**

| Critère | Évaluation |
|---|---|
| Objectif perçu | ✅ Comparer et choisir un plan |
| Points forts | Grille claire, badge "Your plan", message de confiance ("Plans don't influence rankings"), feature comparison détaillée |
| Ce qui est flou | "3 tools" et "4 tools (+ feedback)" — quels outils concrètement ? |
| Correction P2 | Détailler les outils IA dans un tooltip ou une section dédiée |

### 3.8 Footer
**Note : 14/20**

| Critère | Évaluation |
|---|---|
| Ce qui est clair | Structure 4 colonnes, liens légaux complets |
| Ce qui nuit à la crédibilité | Icônes Instagram et YouTube présentes sans comptes réels |
| Correction P1 | Retirer les icônes sociales tant qu'il n'y a pas de comptes actifs |

---

## 4. AUDIT FONCTIONNALITÉ PAR FONCTIONNALITÉ

| Fonctionnalité | Utilité | Clarté | Fluidité | Confiance | Note /20 | Défauts |
|---|---|---|---|---|---|---|
| Écoute audio | Haute | Bonne | Bonne | Haute | 16 | Player fonctionnel, waveform |
| Vote multi-critères | Haute | Moyenne | Bonne | Haute | 14 | Page Vote vide sans auth |
| Soumission musicale | Haute | Bonne | Bonne | Haute | 15 | Requiert Pro mais pas expliqué |
| Système de streak | Moyenne | Bonne | Bonne | Moyenne | 15 | Gamification claire |
| AI Chatbot | Moyenne | Bonne | Bonne | Haute | 15 | Réservé Pro/Elite, bien signalé |
| AI Tag Suggest | Moyenne | Bonne | Bonne | Haute | 16 | Bien intégré |
| Countdown | Haute | Bonne | Bonne | Haute | 17 | Clair et visible |
| Cookie Consent | Obligatoire | Bonne | Bonne | Haute | 16 | Conforme RGPD |
| PWA Install | Basse | Bonne | Bonne | Moyenne | 15 | Bouton discret |
| Notifications | Moyenne | Bonne | — | Moyenne | 14 | Non testable sans auth |

---

## 5. PARCOURS UTILISATEUR CRITIQUES

### 5.1 Parcours "Découverte → Inscription"
**Note : 14/20**
- Landing → Hero compris → Scroll → CTA "Join the contest" → Auth signup → ✅ Parcours fluide
- **Friction :** Aucun onboarding post-inscription visible

### 5.2 Parcours "Voter pour un morceau"
**Note : 10/20**
- Nav → Vote → Page VIDE → ❌ **ABANDON**
- L'utilisateur devrait être guidé vers Explore ou invité à se connecter
- **Correction P0 :** État vide informatif sur /vote

### 5.3 Parcours "Soumettre un morceau"
**Note : 13/20**
- Nav → Submit → Redirect signup (si non connecté) → Inscription → Retour sur formulaire → Besoin Pro
- **Friction :** L'utilisateur ne sait pas qu'il faut un plan Pro AVANT de commencer le parcours

### 5.4 Parcours "Consulter les résultats"
**Note : 15/20**
- Nav → Results → État vide bien géré → CTAs vers explore/submit → ✅ Correct

---

## 6. SÉCURITÉ / GO-LIVE READINESS

| Observé | Risque | Action avant prod |
|---|---|---|
| RLS sur toutes les tables critiques | Faible | ✅ Vérifié |
| Auth JWT sur edge functions | Faible | ✅ Vérifié |
| Sanitization des entrées IA | Faible | ✅ Troncature + nettoyage |
| Stripe checkout server-side | Faible | ✅ Vérifié |
| Rôles admin via user_roles (pas localStorage) | Faible | ✅ Bonne pratique |
| Pas de secrets exposés côté client | Faible | ✅ Seul l'anon key est exposé (normal) |
| Vote events avec IP logging | Moyen | Vérifier conformité RGPD (purge PII existante ✅) |
| Icônes sociales pointant vers # | Faible | Retirer avant prod |
| Pas de rate limiting visible côté client | Moyen | Edge functions ont du rate limiting AI (429), mais pas de rate limit global |

---

## 7. LISTE DES PROBLÈMES PRIORISÉS

### P0 — À corriger impérativement avant production

| # | Titre | Impact | Où | Criticité |
|---|---|---|---|---|
| 1 | **Page Vote vide sans contenu ni guidance** | Abandon immédiat de tout utilisateur non connecté | /vote | Bloquant |
| 2 | **Redondance "Saison 1 — Saison 1" dans le live badge** | Impression de bug/non-fini | Landing hero | Critique |
| 3 | **Icônes sociales (Instagram/YouTube) sans vrais liens** | Perte de crédibilité, clics morts | Footer | Critique |

### P1 — Très important

| # | Titre | Impact | Où |
|---|---|---|---|
| 4 | Mélange de langues dans les labels dynamiques (Saison vs Season) | Confusion | Hero, Results |
| 5 | Submit redirige vers signup sans explication des prérequis (Pro) | Frustration | /compete |
| 6 | Pas d'onboarding post-inscription (WelcomeDialog semble existant mais non activé) | Perte d'engagement | Post-signup |

### P2 — Amélioration forte valeur

| # | Titre | Impact | Où |
|---|---|---|---|
| 7 | "Switch to vote mode" peu clair pour novice | Confusion | /explore |
| 8 | Détailler les "3 tools" / "4 tools" IA dans le pricing | Manque de transparence | /pricing |
| 9 | Aucun extrait audio sur la landing page | On parle de musique sans en jouer | / |

### P3 — Confort / finition

| # | Titre | Impact | Où |
|---|---|---|---|
| 10 | Pas de social login | Friction d'inscription | /auth |
| 11 | Countdown labels (D, H, M, S) non traduits | Détail linguistique | Hero |

---

## 8. VERDICT FINAL FRANC

**La plateforme est-elle réellement prête ?**
Presque. Le produit est **solide techniquement**, le design est **cohérent et professionnel**, la proposition de valeur est **claire**. Mais la **page Vote est un point de rupture critique** : un utilisateur non connecté qui y arrive voit un écran mort. C'est inacceptable pour une mise en production.

**Ce qui empêcherait un expert d'autoriser la mise en production :**
1. La page Vote vide — c'est la fonctionnalité CORE du produit
2. Les incohérences linguistiques qui donnent une impression de non-fini
3. Les icônes sociales mortes dans le footer

**Ce qui donne confiance :**
- Architecture technique solide (RLS, edge functions, auth)
- Design cohérent et professionnel
- Pricing transparent et honnête
- Contenu éditorial riche (catégories)

**3 corrections les plus rentables à faire immédiatement :**
1. Ajouter un état vide informatif sur /vote avec CTA de connexion
2. Fixer le label "Saison 1 — Saison 1" redondant
3. Retirer les icônes sociales du footer

**Si j'étais décideur externe, publierais-je aujourd'hui ?**
**NON**, pas avant d'avoir corrigé les 3 P0. Après correction des P0, **OUI** — le produit est suffisamment mature pour un lancement.
