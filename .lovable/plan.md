

# Audit complet du flux de creation de compte

## Resultats de l'audit

J'ai teste le signup de bout en bout et inspecte la base de donnees, les logs, le code et le comportement reel de l'application.

### Ce qui FONCTIONNE correctement

1. **Le formulaire d'inscription** s'affiche bien avec les 3 champs (Nom d'artiste, Email, Mot de passe)
2. **L'appel Supabase Auth `signUp`** cree bien l'utilisateur en base (verifie : l'utilisateur `testbeta@example.com` a ete cree avec succes)
3. **Le trigger `handle_new_user`** fonctionne : un profil et un role `user` sont automatiquement crees a l'inscription
4. **Le `display_name`** est bien transmis via les metadata et correctement enregistre dans le profil
5. **Les validations client** (email requis, mot de passe min 6 caracteres) fonctionnent
6. **Les messages d'erreur** pour les cas speciaux (compte existant, etc.) sont en place

---

### PROBLEME PRINCIPAL : la confirmation email bloque les utilisateurs

**Constat** : Apres l'inscription, le champ `email_confirmed_at` reste `null`. L'utilisateur ne peut donc PAS se connecter tant qu'il n'a pas clique sur le lien de confirmation email.

Le toast affiche "Verifiez votre email pour confirmer votre compte" -- mais en phase de beta, les utilisateurs s'attendent a pouvoir se connecter immediatement.

**Impact** : C'est tres probablement la raison pour laquelle les beta testeurs rapportent que "la creation de compte ne fonctionne pas". L'inscription reussit techniquement, mais ils ne peuvent pas se connecter ensuite car l'email de confirmation n'est peut-etre jamais recu (pas de service d'email configure type Resend, ou les emails tombent en spam).

### PROBLEMES SECONDAIRES identifies

1. **Pas de feedback clair apres inscription** : Le toast "Verifiez votre email" apparait brievement mais l'utilisateur reste sur la meme page sans savoir quoi faire. Il n'y a pas d'ecran de confirmation dedié.
2. **Tentative de connexion apres inscription sans confirmation** : Si un utilisateur essaie de se connecter avant d'avoir confirme son email, il recoit "Email ou mot de passe incorrect" -- un message trompeur alors que le vrai probleme est l'email non confirme.
3. **Pas d'option "Renvoyer l'email de confirmation"** : En cas de non-reception de l'email, l'utilisateur est bloque sans recours.
4. **Pas de "Mot de passe oublie"** : Aucun lien de recuperation de mot de passe n'est propose.

---

## Plan de correction

### Etape 1 : Activer l'auto-confirmation des emails (pour la beta)

Utiliser l'outil `configure-auth` pour desactiver la confirmation par email. C'est la solution la plus rapide pour debloquer les beta testeurs. Les utilisateurs pourront se connecter immediatement apres l'inscription.

> Note : A reactiver en production avec un vrai service d'envoi d'emails.

### Etape 2 : Ameliorer le message d'erreur pour les emails non confirmes

Dans `Auth.tsx`, ajouter une detection specifique du message "Email not confirmed" retourne par Supabase lors du `signInWithPassword`, et afficher un message explicite : "Votre email n'est pas encore confirme. Verifiez votre boite de reception." au lieu du generique "Email ou mot de passe incorrect".

### Etape 3 : Ajouter un ecran de confirmation post-inscription

Au lieu de juste un toast, afficher un message visible et persistant : "Un email de confirmation vous a ete envoye. Verifiez votre boite de reception (et vos spams)." avec un bouton "Renvoyer l'email" qui appelle `supabase.auth.resend()`.

### Etape 4 : Ajouter "Mot de passe oublie"

Ajouter un lien "Mot de passe oublie ?" sous le champ mot de passe en mode connexion, qui affiche un formulaire simplifie appelant `supabase.auth.resetPasswordForEmail()`.

### Etape 5 : Ameliorer la validation des entrees

Ajouter une validation avec `zod` pour l'email et le mot de passe, avec des messages d'erreur inline (pas seulement des toasts).

---

## Details techniques

### Fichiers a modifier

1. **Configuration auth** : activer auto-confirm via l'outil configure-auth
2. **`src/pages/Auth.tsx`** : 
   - Ajouter detection "Email not confirmed" dans le handler d'erreur login
   - Ajouter ecran post-inscription avec bouton "Renvoyer"
   - Ajouter lien "Mot de passe oublie"
   - Ajouter un formulaire de reset password (toggle dans le meme composant)
   - Ajouter validation zod pour email/password
3. **Aucune migration SQL necessaire** : le schema fonctionne correctement

### Priorite

```text
[CRITIQUE] Auto-confirm email (debloque la beta)
[HAUTE]    Message d'erreur "email non confirme"
[HAUTE]    Ecran confirmation + renvoyer email
[MOYENNE]  Mot de passe oublie
[BASSE]    Validation zod avancee
```

