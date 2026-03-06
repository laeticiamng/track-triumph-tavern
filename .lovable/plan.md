

# AUDIT DÉFINITIF V2 — Weekly Music Awards
## 6 mars 2026 — Post-corrections P0/P1

---

## 1. RÉSUMÉ EXÉCUTIF

La plateforme a progressé depuis l'audit précédent : le bug i18n Pricing est corrigé (clés restaurées), les liens CGU/Privacy sont dans le formulaire d'inscription, et le WelcomeDialog d'onboarding est en place. Cependant, **un nouveau bug bloquant P0 a été identifié** : le formulaire de soumission (`/compete`) tente d'insérer des colonnes `preview_start_sec` et `preview_end_sec` qui n'existent pas dans la table `submissions`, ce qui provoquera systématiquement une erreur 400 et empêchera toute soumission. Les 4 findings de sécurité "error" persistent. Le badge "Beta" reste dans le footer.

**Verdict : OUI SOUS CONDITIONS**
**Note globale : 14.5/20** (vs 13.5 précédemment)

**Top 5 risques :**
1. **P0 NOUVEAU** : Soumission impossible — colonnes `preview_start_sec`/`preview_end_sec` absentes de la table DB
2. Données `profiles`, `activities`, `vote_streaks`, `follows` lisibles par tous les authentifiés (4 findings "error")
3. Leaked password protection toujours désactivée
4. Vues `submissions_public` et `vote_events_safe` sans RLS explicite (2 findings "warn")
5. Badge "Beta" dans le footer nuit à la crédibilité production

**Top 5 forces :**
1. Bug i18n Pricing corrigé — page de conversion fonctionnelle
2. Onboarding post-inscription en place (WelcomeDialog)
3. Liens légaux CGU/Privacy dans le formulaire d'inscription
4. Architecture technique propre et bien testée (125 tests passing)
5. SocialProof avec gestion intelligente du cas "0 données"

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation | Criticité | Décision |
|---|---|---|---|---|
| Compréhension produit | 16 | Hero clair, value prop lisible | Mineur | OK |
| Landing / Accueil | 15 | SocialProof gère le cas vide, badge Beta reste | Majeur | Conditionnel |
| Onboarding | 15 | WelcomeDialog en place (+3 vs précédent) | Mineur | OK |
| Navigation | 16 | Cohérente, BottomNav mobile | Mineur | OK |
| Clarté UX | 14 | Bonne, états vides corrects | Mineur | OK |
| Copywriting | 15 | CGU/Privacy ajoutés, textes clairs | Mineur | OK |
| Crédibilité / Confiance | 12 | Badge "Beta" + 0 contenu + social links non vérifiés | Critique | A corriger |
| Fonctionnalité principale (Soumission) | **6** | **BUG BLOQUANT** : insert échoue sur colonnes manquantes | **Bloquant** | **A corriger** |
| Fonctionnalité principale (Vote) | 15 | Bien conçu, fonctionnel quand contenu existe | Mineur | OK |
| Parcours utilisateur | 14 | Amélioré avec onboarding, mais soumission cassée | Bloquant | A corriger |
| Bugs / QA | 11 | 1 bug P0 critique (soumission) | Bloquant | A corriger |
| Sécurité préproduction | 11 | 4 "error" + 2 "warn" + leaked pwd | Critique | A corriger |
| Conformité go-live | 15 | Pages légales OK, CGU dans signup OK | Mineur | OK |

---

## 3. AUDIT DÉTAILLÉ — NOUVEAU BUG P0

### Page Compete (/compete) — 6/20 (BUG BLOQUANT)

**Bug exact** : `Compete.tsx` lignes 222-223 insèrent `preview_start_sec` et `preview_end_sec` dans la table `submissions`. Or, la table `submissions` ne contient PAS ces colonnes (vérifié dans le schéma DB). Résultat : **toute tentative de soumission échouera avec une erreur Supabase**.

**Conséquence** : La fonctionnalité principale pour les utilisateurs payants (Pro/Elite) est totalement cassée. Un utilisateur qui paye 9.99€/mois ou 19.99€/mois ne peut pas utiliser la feature pour laquelle il paye.

**Correction P0** : Deux options :
- Option A : Ajouter les colonnes `preview_start_sec` (integer, nullable) et `preview_end_sec` (integer, nullable) à la table `submissions` via migration
- Option B : Retirer ces champs de l'insert dans `Compete.tsx` (perte de la feature trimmer mais soumission fonctionnelle)
- **Recommandation** : Option A — la feature audio trimmer est un vrai différenciateur UX

---

## 4. CORRECTIONS RESTANTES PRIORISÉES

### P0 — Bloquant production

| # | Titre | Statut | Action |
|---|---|---|---|
| 1 | **Colonnes `preview_start_sec`/`preview_end_sec` manquantes** | NOUVEAU | Migration DB pour ajouter les 2 colonnes integer nullable |
| 2 | ~~Clés i18n pricing manquantes~~ | ✅ CORRIGÉ | — |
| 3 | ~~Données IP/UA exposées via RLS~~ | ✅ CORRIGÉ (vue `vote_events_safe`) | — |

### P1 — Très important

| # | Titre | Statut | Action |
|---|---|---|---|
| 4 | Profils/activités/streaks/follows lisibles par tous | OUVERT (4 findings "error") | Restreindre RLS `activities` aux suivis ou propriétaire ; `vote_streaks` au propriétaire ou agrégat |
| 5 | Leaked password protection désactivée | OUVERT ("warn") | Activer manuellement dans les settings auth |
| 6 | ~~Pas d'onboarding post-inscription~~ | ✅ CORRIGÉ (WelcomeDialog) | — |
| 7 | ~~Mention CGU/Privacy absente du signup~~ | ✅ CORRIGÉ | — |
| 8 | Badge "Beta" dans le footer | OUVERT | Retirer ou remplacer par un message de confiance |
| 9 | Vues `submissions_public` et `vote_events_safe` sans RLS | OUVERT (2 "warn") | Confirmer l'intentionnalité ou ajouter des policies |

### P2 — Amélioration forte valeur

| # | Titre | Action |
|---|---|---|
| 10 | Seed data réaliste | Créer saison/semaine/catégories/soumissions de démo |
| 11 | Labels HallOfFame "1er"/"2e"/"3e" hardcodés FR | Utiliser clés i18n |
| 12 | "Prochaine session dans" ambigu | Clarifier le libellé du countdown |
| 13 | Profil : pas clair ce que le plan Free ne donne pas | Ajouter liste des limitations |

### P3 — Cosmétique

| # | Titre | Action |
|---|---|---|
| 14 | Social links footer potentiellement morts | Vérifier les comptes ou retirer |
| 15 | Dark mode contraste certains badges | Vérifier |

---

## 5. SÉCURITÉ — ÉTAT ACTUEL

| Observé | Niveau | Statut |
|---|---|---|
| `vote_events` IP/UA masqués via `vote_events_safe` | ✅ Corrigé | — |
| `profiles` lisible par tous authentifiés | Error | **Intentionnel** (feed social, profils publics) — documenter |
| `activities` lisible par tous authentifiés | Error | A restreindre ou documenter comme intentionnel |
| `vote_streaks` lisible par tous | Error | A restreindre au propriétaire |
| `follows` lisible par tous | Error | **Intentionnel** (compteurs followers) — documenter |
| `submissions_public` sans RLS | Warn | A vérifier (vue `security_invoker = true` hérite du RLS de `submissions`) |
| `vote_events_safe` sans RLS | Warn | A vérifier (idem, `security_invoker = true`) |
| Leaked password protection | Warn | Action manuelle requise |

**Note importante** : Les 4 findings "error" sur `profiles`, `activities`, `vote_streaks` et `follows` sont **partiellement intentionnels** pour une plateforme sociale (profils publics, feed d'activité, compteurs de followers). Il faut :
1. Confirmer explicitement ceux qui sont intentionnels
2. Restreindre ceux qui ne le sont pas (`vote_streaks` au minimum)
3. Documenter les choix de design dans un fichier SECURITY.md

---

## 6. PLAN D'IMPLÉMENTATION

### Tâche 1 : Migration DB — Ajouter colonnes preview audio (P0)
```sql
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS preview_start_sec integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preview_end_sec integer DEFAULT 30;
```

### Tâche 2 : Sécurité — Restreindre RLS (P1)
- `activities` : policy restrictive pour le feed (uniquement les activités des utilisateurs suivis + les siennes)
- `vote_streaks` : restreindre SELECT au propriétaire uniquement (retirer la policy "all streaks for leaderboard")
- Documenter `profiles` et `follows` comme intentionnellement publics

### Tâche 3 : Retirer le badge "Beta" du footer (P1)
- Supprimer la ligne `{t("footer.beta")}` dans `Footer.tsx`

### Tâche 4 : HallOfFame — i18n des labels de rang (P2)
- Remplacer les labels hardcodés `"1er"`, `"2e"`, `"3e"` par des clés i18n `hallOfFame.rank1`, `hallOfFame.rank2`, `hallOfFame.rank3`

### Tâche 5 : Acknowledger les findings de sécurité intentionnels
- Utiliser `manage_security_finding` pour marquer les findings `profiles` et `follows` comme acceptés avec justification

---

## 7. VERDICT FINAL

### La plateforme est-elle prête ?
**Non, pas encore.** Le bug de soumission est un showstopper absolu : la feature payante centrale ne fonctionne pas. Après correction de cette migration (5 minutes), la plateforme sera **très proche du go-live**.

### 3 corrections les plus rentables :
1. **Migration DB** pour `preview_start_sec`/`preview_end_sec` — 5 min, débloque la soumission
2. **Retirer le badge "Beta"** — 1 min, impact crédibilité immédiat
3. **Restreindre RLS `vote_streaks`** — 10 min, corrige 1 finding de sécurité

### Si j'étais décideur :
Je refuserais aujourd'hui à cause du bug de soumission. Après la migration DB + retrait du badge Beta + restriction `vote_streaks`, j'autoriserais le go-live avec les findings `profiles`/`follows`/`activities` documentés comme choix de design intentionnels.

**Estimation : 1-2 heures de travail pour atteindre le go-live.**

