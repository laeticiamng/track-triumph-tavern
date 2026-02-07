

# Anti-Fraude Complet - Weekly Music Awards

## Analyse de l'existant

**Deja en place :**
- Rate limiting basique (5 votes/min) dans `cast-vote`
- 1 vote par categorie par semaine
- Detection auto-vote
- Table `vote_events` avec `ip_address`, `user_agent`, `event_type`
- Colonne `votes.is_valid`
- Onglet "Anti-fraude" basique dans AdminDashboard (compteurs seulement)

**Ce qui manque :**
1. Aucune Edge Function d'analyse de patterns (fraud-scan)
2. Pas de verification email_confirmed dans cast-vote
3. Pas de detection de clusters IP
4. Pas de detection de comptes recents votant massivement
5. Pas de detection de rafales sur une meme soumission
6. L'onglet admin Fraud est vide (juste compteurs + texte)
7. Pas d'export CSV des logs d'evenements

---

## Plan d'implementation

### 1. Renforcer `cast-vote` : verification email + enrichir vote_events

Ajouter dans le flux existant de `cast-vote/index.ts` :

- **Verification email confirmee** : rejeter le vote si `user.email_confirmed_at` est null ou absent
- **Detection compte recent** : si le compte a ete cree il y a moins de 1 heure, enregistrer un flag `is_new_account` dans vote_events
- **Enrichir vote_events** : ajouter un champ `metadata` (jsonb) pour stocker des signaux supplementaires (compte recent, rafale detectee, etc.)

### 2. Migration base de donnees

Ajouter une colonne `metadata` (jsonb, default `{}`) a la table `vote_events` pour stocker des signaux de fraude sans modifier le schema existant.

### 3. Creer Edge Function `fraud-scan`

Nouvelle edge function admin-only qui analyse les patterns de vote pour une semaine donnee.

**Analyses effectuees :**

| Analyse | Logique |
|---|---|
| Rafales par user | Users avec plus de 3 votes en 2 minutes |
| Clusters IP | Adresses IP avec plus de 3 votes distincts (users differents) |
| Comptes recents | Comptes crees il y a moins de 24h ayant vote |
| Concentration sur soumission | Soumissions recevant plus de 50% de leurs votes depuis la meme IP |

**Sortie :**
```text
{
  suspicious_users: [{ user_id, email, vote_count, flags: string[] }],
  suspicious_ips: [{ ip, distinct_users, vote_count }],
  suspicious_submissions: [{ submission_id, title, flags: string[] }],
  summary: { total_votes, flagged_votes, flagged_users, flagged_ips }
}
```

**Actions possibles** (parametres optionnels) :
- `invalidate: true` : marquer les votes suspects comme `is_valid = false` et inserer un evenement `invalidated` dans vote_events
- `dry_run: true` (par defaut) : analyse uniquement, aucune modification

### 4. Refondre l'onglet Admin "Anti-fraude"

Remplacer le contenu actuel par un dashboard complet :

**Section 1 : Lancer un scan**
- Selecteur de semaine
- Bouton "Analyser" (appelle fraud-scan en dry_run)
- Bouton "Invalider les suspects" (appelle fraud-scan avec invalidate=true, confirmation requise)

**Section 2 : Resultats du scan**
- Cards resumant : total votes, votes flagges, users suspects, IPs suspectes

**Section 3 : Tables de resultats**
- **Top Users suspects** : user_id (masque partiellement), nombre de votes, flags detectes
- **Top IPs suspectes** : IP (masquee partiellement pour RGPD), nombre d'utilisateurs distincts, nombre de votes
- **Top Soumissions suspectes** : titre, artiste, flags

**Section 4 : Export**
- Bouton export CSV des vote_events pour la semaine selectionnee
- Bouton export CSV des resultats du scan

### 5. Config.toml

Ajouter `[functions.fraud-scan]` avec `verify_jwt = false`.

---

## Fichiers a creer

| Fichier | Role |
|---|---|
| Migration SQL | Ajouter colonne `metadata` jsonb a `vote_events` |
| `supabase/functions/fraud-scan/index.ts` | Edge function d'analyse anti-fraude |

## Fichiers a modifier

| Fichier | Modifications |
|---|---|
| `supabase/functions/cast-vote/index.ts` | Ajouter verification email_confirmed, enrichir metadata vote_events |
| `supabase/config.toml` | Ajouter entry fraud-scan |
| `src/pages/AdminDashboard.tsx` | Refondre onglet Fraud avec scan interactif, tables, exports |

---

## Detail technique - fraud-scan

```text
Flux :
1. Auth + admin check
2. Input: { week_id, invalidate?: boolean, dry_run?: boolean }
3. Charger tous les vote_events pour le week_id (join votes)
4. Analyse 1 - Rafales : grouper par user_id, trier par created_at, detecter 3+ votes en 120s
5. Analyse 2 - Clusters IP : grouper par ip_address, compter distinct user_ids, flaguer si 3+
6. Analyse 3 - Comptes recents : join auth.users via profiles.created_at, flaguer si < 24h
7. Analyse 4 - Concentration : par submission_id, grouper les IPs, flaguer si 1 IP > 50% des votes
8. Si invalidate=true et dry_run=false :
   a. UPDATE votes SET is_valid=false WHERE id IN (flagged_vote_ids)
   b. INSERT vote_events (event_type='invalidated') pour chaque vote invalide
9. Retourner resultats structures
```

## Conformite RGPD

- Les IPs sont masquees partiellement dans l'UI admin (ex: `192.168.xxx.xxx`)
- Aucune IP n'est exposee via RLS aux utilisateurs normaux (table vote_events : admin-only en lecture)
- Les exports CSV sont reserves aux administrateurs
- Les donnees de vote_events ne sont pas exposees publiquement
- Les emails sont masques dans l'affichage admin (ex: `j***@gmail.com`)

## Securite

- fraud-scan : admin-only via verification user_roles
- vote_events : RLS SELECT admin-only (deja en place)
- Aucune donnee sensible dans les reponses publiques de cast-vote
