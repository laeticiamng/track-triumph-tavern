
# Audit utilisateur complet -- Resultats

## Test effectue

J'ai cree un compte "AuditTestUser" (audituser2026@test.com) et navigue sur toutes les pages principales comme le ferait un beta testeur.

---

## Ce qui FONCTIONNE

- **Inscription** : Le compte est cree en base, l'email est auto-confirme, le profil et le role sont correctement generes par le trigger
- **Page d'accueil** : S'affiche correctement avec les stats communautaires et la saison active
- **Page Explorer** : Fonctionne, categories filtrables, message "pas encore de soumissions" clair
- **Page Vote (feed TikTok)** : S'affiche avec le quota de votes et les filtres par categorie
- **Page Concours** : Le verrou "Abonnement requis" fonctionne pour les utilisateurs gratuits
- **Page Profil** : Affiche correctement les stats, le plan, le nom d'artiste
- **Page Resultats** : Affiche le message d'attente quand pas de resultats publies
- **Page Tarifs** : Les 3 plans (Free/Pro/Elite) s'affichent correctement
- **Page Hall of Fame** : S'affiche (vide pour l'instant, normal)
- **Redirection auth** : Le `?redirect=/profile` fonctionne sur la page Profil
- **Pre-remplissage artiste** : Le nom d'artiste est pre-rempli dans le formulaire de soumission
- **Navigation mobile** : La barre de navigation du bas est presente et fonctionnelle

---

## BUG CRITIQUE trouve

### Apres inscription, l'utilisateur voit "Verifiez votre email" au lieu d'etre redirige

**Scenario** : L'utilisateur remplit le formulaire d'inscription et clique "S'inscrire gratuitement".

**Comportement actuel** : L'ecran "Inscription reussie ! Verifiez votre email" s'affiche avec un bouton "Renvoyer l'email". L'utilisateur est perdu -- il ne sait pas qu'il est en fait deja connecte.

**Comportement attendu** : Avec l'auto-confirmation activee, l'utilisateur devrait etre redirige directement vers son profil (ou la page d'origine).

**Cause technique** : Dans `Auth.tsx` ligne 78-80, le `handleSignup` appelle `setView("confirmation")` sur succes AVANT que le `onAuthStateChange` ne detecte la session. Il y a une course entre le rendu de l'ecran de confirmation et la redirection. L'utilisateur voit l'ecran de confirmation alors qu'il est deja connecte.

**Correction** : Dans `handleSignup`, verifier si `signUp` retourne une session (ce qui arrive quand auto-confirm est active). Si oui, ne pas afficher l'ecran de confirmation -- laisser le `useEffect` de redirection agir. Ne montrer l'ecran de confirmation que quand aucune session n'est retournee (confirmation email requise).

---

## Bug mineur

### Ancien utilisateur `testbeta@example.com` bloque

Cet utilisateur a ete cree AVANT l'activation de l'auto-confirmation. Son `email_confirmed_at` est `null`, donc il ne peut pas se connecter. Ce n'est pas un bug de l'application mais un cas a gerer : soit purger ces comptes, soit les confirmer manuellement en base.

---

## Plan de correction

### Etape unique : Corriger le flux post-inscription avec auto-confirm

**Fichier** : `src/pages/Auth.tsx`

Dans `handleSignup`, modifier la logique de succes :

```text
Actuel :
  signUp() -> succes -> setView("confirmation") toujours

Corrige :
  signUp() -> succes -> verifier si data.session existe
    -> OUI (auto-confirm) : ne rien faire, le useEffect de redirection prend le relais
    -> NON (confirmation requise) : setView("confirmation") + setConfirmEmail()
```

Concretement, recuperer `data` du `signUp()` et conditionner l'affichage :
- Si `data.session` est present, l'utilisateur est deja connecte, la redirection se fera automatiquement
- Si `data.session` est null, afficher l'ecran de confirmation comme aujourd'hui

---

## Fichiers concernes

1. **`src/pages/Auth.tsx`** : Conditionner l'ecran de confirmation a l'absence de session
