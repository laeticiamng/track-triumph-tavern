
# Reward Pool Sponsorise Complet + Tables Winners/Rewards

## Analyse de l'existant

**Ce qui existe deja :**
- Table `reward_pools` avec colonnes week_id, minimum_cents, current_cents, top1/2/3_amount_cents, sponsors, fallback_label, status
- Enum `reward_pool_status` : `active | inactive | threshold_met`
- Edge function `update-reward-pool` (admin)
- Edge function `compute-results` (calcule vote_count + publie results_published_at)
- Composant `RewardPoolBanner` sur la page Results
- Admin dashboard avec onglet Rewards (formulaire basique)

**Ce qui manque :**
1. Tables `winners` et `rewards` absentes
2. L'enum status ne correspond pas au spec (`pending/active/locked` demande vs `active/inactive/threshold_met` actuel)
3. `compute-results` ne verifie pas le reward_pool_status avant publication
4. Pas d'edge function separee `publish-results`
5. L'admin ne peut pas gerer les sponsors (nom + lien) - le formulaire envoie un tableau vide
6. Pas de persistance des gagnants apres calcul des resultats

---

## Plan d'implementation

### 1. Migration base de donnees

**Modifier l'enum `reward_pool_status`** : ajouter `locked` et `pending`, supprimer `threshold_met` si possible. Alternativement, ajouter les valeurs manquantes a l'enum existant.

**Creer table `winners`** :
```text
winners (
  id uuid PK default gen_random_uuid(),
  week_id uuid FK -> weeks(id) NOT NULL,
  category_id uuid FK -> categories(id) NOT NULL,
  submission_id uuid FK -> submissions(id) NOT NULL,
  user_id uuid NOT NULL,
  rank integer NOT NULL (1, 2, 3),
  vote_count integer NOT NULL default 0,
  created_at timestamptz default now()
)
- Unique constraint: (week_id, category_id, rank)
- RLS: SELECT public, ALL admin only
```

**Creer table `rewards`** :
```text
rewards (
  id uuid PK default gen_random_uuid(),
  winner_id uuid FK -> winners(id) NOT NULL,
  week_id uuid FK -> weeks(id) NOT NULL,
  reward_type text NOT NULL ('cash' | 'fallback'),
  amount_cents bigint default 0,
  label text,
  status text default 'pending' ('pending' | 'claimed' | 'paid'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
- RLS: SELECT pour user_id du winner, ALL admin only
```

### 2. Edge Function `publish-results`

Nouvelle edge function qui remplace l'appel direct a `compute-results` depuis l'admin :

```text
1. Verifier admin
2. Recevoir week_id
3. Charger reward_pool pour ce week_id
4. Si reward_pool.status === 'active' ou 'locked' : mode cash rewards
5. Si reward_pool.status === 'pending' ou 'inactive' : mode fallback rewards
6. Calculer vote_count par submission (votes valides)
7. Mettre a jour submissions.vote_count
8. Pour chaque categorie : determiner top 3 par vote_count
9. Inserer dans winners (week_id, category_id, submission_id, user_id, rank, vote_count)
10. Inserer dans rewards :
    - Si cash : amount_cents = top1/2/3_amount_cents, type = 'cash'
    - Si fallback : amount_cents = 0, label = fallback_label, type = 'fallback'
11. Mettre a jour weeks.results_published_at
12. Si cash mode : mettre reward_pool.status = 'locked'
13. Retourner resume (winners count, reward mode)
```

### 3. Admin Dashboard - Gestion sponsors

Modifier l'onglet Rewards dans `AdminDashboard.tsx` :

- Ajouter un champ dynamique pour les sponsors : nom + URL (ajouter/supprimer)
- Afficher les sponsors existants du pool selectionne
- Pre-remplir le formulaire quand un pool existant est selectionne
- Ajouter un bouton "Verrouiller" pour passer le status a `locked` (confirmation des cash rewards)

### 4. Modifier `compute-results` ou le remplacer

Deux options :
- **Option A** : Renommer/supprimer `compute-results`, tout mettre dans `publish-results`
- **Option B** : Garder `compute-results` pour le calcul seul, `publish-results` ajoute les winners + rewards

Option retenue : **Option A** - une seule edge function `publish-results` qui fait tout. Garder `compute-results` mais le rendre interne (l'admin appellera `publish-results`).

### 5. Mettre a jour la page Results

- Charger les winners depuis la table `winners` au lieu de calculer le top 3 a la volee
- Afficher les rewards associes (cash ou fallback) a cote de chaque gagnant
- Le `RewardPoolBanner` reste inchange (fonctionne deja)

### 6. Mettre a jour le config.toml

Ajouter la config pour `publish-results`.

---

## Fichiers a creer/modifier

| Fichier | Action |
|---|---|
| Migration SQL | Creer tables `winners` et `rewards`, ajouter valeurs enum |
| `supabase/functions/publish-results/index.ts` | Creer : edge function complete |
| `supabase/config.toml` | Ajouter `[functions.publish-results]` |
| `src/pages/AdminDashboard.tsx` | Modifier : sponsors dynamiques, bouton verrouiller, appeler publish-results |
| `src/pages/Results.tsx` | Modifier : charger winners + rewards depuis les nouvelles tables |

---

## Detail technique - Edge Function publish-results

```text
Flux :
1. Auth + admin check (identique a compute-results)
2. Input: { week_id }
3. Charger reward_pool pour week_id
4. Charger toutes les categories
5. Charger votes valides pour week_id -> compter par submission_id
6. Mettre a jour submissions.vote_count
7. Pour chaque categorie :
   a. Trier submissions par vote_count desc
   b. Prendre top 3
   c. Inserer dans winners (rank 1, 2, 3)
   d. Inserer dans rewards :
      - Si pool.status in ('active','locked','threshold_met') :
        rank 1 -> pool.top1_amount_cents, type='cash'
        rank 2 -> pool.top2_amount_cents, type='cash'
        rank 3 -> pool.top3_amount_cents, type='cash'
      - Sinon :
        type='fallback', label=pool.fallback_label
8. weeks.results_published_at = now()
9. Retourner { success, winners_count, reward_mode }
```

## Securite

- Tables `winners` et `rewards` : RLS SELECT public pour les winners, admin ALL
- Rewards : les users ne voient que leurs propres rewards via un policy filtre sur user_id du winner associe
- Edge function `publish-results` : admin-only via verification user_roles
