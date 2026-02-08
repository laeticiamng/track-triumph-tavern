
# Corrections finales

## Problemes identifies

### 1. Liens casses dans HallOfFame.tsx
Les liens vers les soumissions des gagnants utilisent `w.id` (l'ID du winner) au lieu de l'ID de la soumission. Resultat : cliquer sur un gagnant mene a une page "Soumission introuvable".

**Ligne 122** : `to={/submissions/${w.submissions ? w.id : ""}}` devrait utiliser l'ID de la soumission, pas celui du winner.

**Correction** : Ajouter `submission_id` dans la requete select des winners et l'utiliser pour le lien.

### 2. Meme bug dans Results.tsx
Les liens vers les soumissions des gagnants ne sont pas presents du tout. Quand on clique sur un gagnant (grand gagnant ou podium par categorie), il n'y a aucun lien pour naviguer vers la page de detail. L'utilisateur ne peut pas ecouter le morceau gagnant depuis la page des resultats.

**Correction** : Envelopper les elements du podium dans des `Link` vers `/submissions/{submission_id}`.

### 3. Page Profile ne protege pas les routes correctement
La page Profile redirige vers `/auth` mais sans parametre `redirect=/profile`. Apres connexion, l'utilisateur n'est pas redirige vers le profil.

**Correction** : Ajouter `?redirect=/profile` au lien de redirection.

### 4. Page Compete n'auto-remplit pas le nom d'artiste
Le champ "Nom d'artiste" est vide alors que l'utilisateur a deja un `display_name` dans son profil. C'est une friction inutile pour le musicien qui doit le retaper a chaque soumission.

**Correction** : Pre-remplir `artistName` avec le `display_name` du profil.

### 5. VoteCard n'est pas cliquable pour aller au detail
Dans le feed TikTok, le bouton "Detail" (icone MessageCircle) est le seul moyen d'acceder a la page de detail. L'ensemble de la zone titre/artiste devrait etre cliquable aussi, comme c'est le cas sur Explore.

**Correction** : Rendre le titre cliquable avec un `Link` vers `/submissions/{id}`.

### 6. Pas de trigger `handle_new_user` detecte en base
La section `<db-triggers>` indique "There are no triggers in the database", mais le code depend du trigger `handle_new_user` pour creer le profil et le role. Si ce trigger n'existe pas, les nouveaux inscrits n'auront ni profil ni role.

**Correction** : Ajouter une migration SQL pour creer le trigger s'il n'existe pas.

---

## Plan technique

### Etape 1 : Migration SQL -- s'assurer que le trigger `handle_new_user` existe

Creer une migration idempotente qui cree le trigger `on_auth_user_created` si absent.

### Etape 2 : Corriger HallOfFame.tsx -- liens des gagnants

- Ajouter `submission_id` dans la requete select des winners
- Remplacer `w.id` par `w.submission_id` dans le `Link`

### Etape 3 : Rendre Results.tsx navigable

- Envelopper le grand gagnant et chaque element du podium dans des `Link` vers `/submissions/{submission_id}`
- Ajouter `submission_id` dans la requete si pas deja present

### Etape 4 : Corriger la redirection dans Profile.tsx

- Changer `navigate("/auth")` en `navigate("/auth?redirect=/profile")`

### Etape 5 : Pre-remplir le nom d'artiste dans Compete.tsx

- Charger le profil de l'utilisateur au chargement
- Pre-remplir `artistName` avec `profile.display_name`

### Etape 6 : Rendre le titre cliquable dans VoteCard.tsx

- Envelopper le titre dans un `Link` vers `/submissions/{submission.id}`

---

## Fichiers concernes

1. **Migration SQL** : creer le trigger `on_auth_user_created` si absent
2. **`src/pages/HallOfFame.tsx`** : corriger les liens des gagnants
3. **`src/pages/Results.tsx`** : ajouter navigation vers les soumissions gagnantes
4. **`src/pages/Profile.tsx`** : ajouter `?redirect=/profile` a la redirection auth
5. **`src/pages/Compete.tsx`** : pre-remplir le nom d'artiste depuis le profil
6. **`src/components/vote/VoteCard.tsx`** : rendre le titre cliquable
