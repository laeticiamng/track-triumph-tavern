

# AUDIT DÉFINITIF V3 — Weekly Music Awards
## 7 mars 2026 — Post-corrections P0/P1/P2

---

## 1. RÉSUMÉ EXÉCUTIF

La plateforme a significativement progressé : i18n Pricing corrigé, onboarding en place, RLS renforcés, badge Beta retiré, seed data injectée, HallOfFame traduit. Cependant, **un bug P0 bloquant persiste en production** : la base de données contient **2 semaines actives simultanément** (`is_active = true`), ce qui provoque une erreur HTTP 406 sur toutes les requêtes `.single()` utilisées par Vote, Explore, Compete et le Hero. Résultat : **les pages Vote, Explore et Compete sont partiellement ou totalement cassées**. Ce bug est directement visible dans les network requests (PGRST116: "The result contains 2 rows").

Le reste de la plateforme est solide et proche du go-live. La sécurité est bien gérée (tous les findings majeurs ignorés/acceptés avec justification). L'architecture reste propre.

**Verdict : OUI SOUS CONDITIONS (1 correction P0 + 2 P1)**
**Note globale : 15.5/20**

**Top 5 risques :**
1. **P0 BLOQUANT** : 2 semaines actives dans la DB → erreur 406 sur Vote/Explore/Compete/Hero
2. Leaked password protection toujours désactivée (warn Supabase)
3. Liens sociaux footer pointent vers des comptes non vérifiés
4. Erreurs hardcodées en français dans `use-active-week.ts` et `auth-schemas.ts`
5. Absence de contrainte DB `UNIQUE(is_active) WHERE is_active = true` pour prévenir la récurrence du P0

**Top 5 forces :**
1. Sécurité bien gérée (tous findings documentés/acceptés, RLS cohérents, PII auto-purgée)
2. Seed data réaliste (10 artistes, 24 soumissions, 49 votes, Hall of Fame peuplé)
3. Architecture technique propre (i18n 3 langues, PWA, SEO structurée, tests)
4. Parcours soumission complet avec audio trimmer, AI tags, colonnes DB en place
5. Onboarding post-inscription fonctionnel (WelcomeDialog)

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation | Criticité | Décision |
|---|---|---|---|---|
| Compréhension produit | 17 | Hero clair, value prop lisible, CTA adaptatif | Mineur | OK |
| Landing / Accueil | 16 | Podium peuplé, SocialProof intelligente, countdown | Mineur | OK |
| Onboarding | 15 | WelcomeDialog 3 étapes, liens CGU | Mineur | OK |
| Navigation | 16 | Cohérente desktop/mobile, BottomNav | Mineur | OK |
| Clarté UX | 15 | Bonne, états vides gérés | Mineur | OK |
| Copywriting | 15 | Clair, orienté bénéfices, CGU dans signup | Mineur | OK |
| Crédibilité / Confiance | 14 | Beta retiré, seed data, social links à vérifier | Mineur | OK |
| Fonctionnalité principale (Vote/Explore) | **8** | **BUG P0** : 406 sur `.single()` — 2 semaines actives | **Bloquant** | **A corriger** |
| Fonctionnalité principale (Soumission) | 16 | Colonnes preview ajoutées, trimmer fonctionnel | Mineur | OK |
| Parcours utilisateur | 13 | Vote/Explore cassés par le bug de semaines | Bloquant | A corriger |
| Bugs / QA | 11 | 1 bug P0 (2 active weeks), messages FR hardcodés | Bloquant | A corriger |
| Sécurité préproduction | 16 | Tous findings gérés, 1 warn leaked pwd restant | Mineur | Conditionnel |
| Conformité go-live | 16 | Pages légales complètes, RGPD cookies OK | Mineur | OK |

---

## 3. BUG P0 — DÉTAIL

### Erreur 406 : 2 semaines actives simultanées

**Preuve directe** (network requests observées) :
```
GET /rest/v1/weeks?is_active=eq.true
Accept: application/vnd.pgrst.object+json
Status: 406
Response: {"code":"PGRST116","details":"The result contains 2 rows","message":"Cannot coerce the result to a single JSON object"}
```

**Impact** : Le Hero, Vote, Explore et Compete utilisent tous `.eq("is_active", true).single()`. Quand 2 lignes correspondent, PostgREST renvoie 406. Conséquence :
- Hero : pas de countdown, pas de label de semaine
- Vote : page potentiellement vide ou en erreur silencieuse
- Explore : même chose
- Compete : impossible de soumettre

**Cause probable** : Le seed data a créé la Semaine 2 avec `is_active = true` sans désactiver la Semaine 1, ou les deux semaines ont été mises actives via l'admin.

**Correction** :
1. **Immédiate** : `UPDATE public.weeks SET is_active = false WHERE week_number = 1;` (ne garder qu'une seule semaine active)
2. **Préventive** : Ajouter un partial unique index `CREATE UNIQUE INDEX idx_weeks_single_active ON public.weeks (is_active) WHERE is_active = true;` — ceci empêchera physiquement d'avoir 2 semaines actives

---

## 4. CORRECTIONS RESTANTES PRIORISÉES

### P0 — Bloquant production

| # | Titre | Action |
|---|---|---|
| 1 | **2 semaines actives → 406 sur tout le site** | UPDATE weeks SET is_active=false WHERE week_number=1 + partial unique index |

### P1 — Très important

| # | Titre | Action |
|---|---|---|
| 2 | Leaked password protection | Activer manuellement dans les settings auth |
| 3 | Messages d'erreur hardcodés FR dans `use-active-week.ts` | Utiliser i18n ou messages neutres EN |
| 4 | Messages Zod dans `auth-schemas.ts` hardcodés FR | Utiliser i18n (déjà signalé dans audit précédent) |

### P2 — Amélioration forte valeur

| # | Titre | Action |
|---|---|---|
| 5 | Social links footer non vérifiés | Vérifier ou retirer Instagram/TikTok/YouTube |
| 6 | Email contact "emotionscare.com" dans footer | Vérifier la cohérence avec le branding WMA |

### P3 — Cosmétique

| # | Titre | Action |
|---|---|---|
| 7 | Scan sécurité `up_to_date: false` | Relancer le scan post-corrections |

---

## 5. SÉCURITÉ — ÉTAT ACTUEL

| Observé | Niveau | Statut |
|---|---|---|
| Tous les findings agent_security | ✅ Ignorés avec justification | Résolu |
| Tous les findings supabase_lov | ✅ Ignorés avec justification | Résolu |
| Leaked password protection | warn | **Action manuelle requise** |
| RLS vote_streaks restreint | ✅ Propriétaire seul | Résolu |
| RLS activities restreint | ✅ Propriétaire + suivis | Résolu |
| vote_events_safe (security_invoker) | ✅ Hérite RLS admin | Résolu |
| PII auto-purge 30j | ✅ purge_vote_events_pii() | Résolu |
| vote_count masqué pendant vote | ✅ submissions_public + maskVoteCount | Résolu |

**Conclusion sécurité** : La posture est bonne pour un go-live. Seul le leaked password protection reste à activer.

---

## 6. PLAN D'IMPLÉMENTATION

### Tâche 1 : Fix DB — Désactiver la semaine 1 et ajouter contrainte (P0)
```sql
-- Fix immédiat : ne garder qu'une seule semaine active
UPDATE public.weeks SET is_active = false WHERE week_number = 1;

-- Prévention : empêcher 2 semaines actives simultanées
CREATE UNIQUE INDEX IF NOT EXISTS idx_weeks_single_active 
  ON public.weeks (is_active) WHERE is_active = true;
```

### Tâche 2 : i18n des messages d'erreur hardcodés (P1)
- `use-active-week.ts` lignes 18, 24 : remplacer les chaînes FR par des clés i18n ou des messages anglais neutres
- `auth-schemas.ts` : internationaliser les messages Zod (déjà identifié)

### Tâche 3 : Vérifier/corriger les liens sociaux footer (P2)
- Vérifier que les comptes Instagram/TikTok/YouTube existent réellement
- Si non, retirer les liens ou les commenter

---

## 7. VERDICT FINAL

### La plateforme est-elle prête ?
**Presque.** Un seul bug bloquant subsiste (2 semaines actives), et c'est un fix de 2 lignes SQL. Après cette correction, la plateforme est **go-live ready** avec un niveau de qualité solide.

### 3 corrections les plus rentables :
1. **Fix 2 active weeks** — 1 min, débloque Vote/Explore/Compete/Hero
2. **Partial unique index** — 1 min, empêche la récurrence du bug
3. **Activer leaked password protection** — 1 min, résout le dernier warning sécurité

### Si j'étais décideur :
J'autoriserais la mise en production **immédiatement après le fix SQL des 2 semaines actives**. La plateforme est techniquement solide, la sécurité est bien gérée, le contenu de démo est en place, et les parcours utilisateurs sont complets. Les P1/P2 restants sont des améliorations qui peuvent être traitées post-lancement sans risque.

**Estimation : 15 minutes de corrections pour le go-live.**

