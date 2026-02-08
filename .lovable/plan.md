
# Correction du flux post-inscription

## Probleme
Apres inscription, l'utilisateur voit l'ecran "Verifiez votre email" alors qu'il est deja connecte (auto-confirm actif). Il devrait etre redirige automatiquement vers son profil.

## Correction

**Fichier** : `src/pages/Auth.tsx`

Modifier `handleSignup` (lignes 64-81) :
- Recuperer `data` en plus de `error` depuis `signUp()`
- Si `data.session` existe (auto-confirm actif) : ne rien faire, le `useEffect` existant detectera la session et redirigera l'utilisateur
- Si `data.session` est null (confirmation email requise) : afficher l'ecran de confirmation comme avant

```text
Avant :
  const { error } = await supabase.auth.signUp(...)
  if (!error) -> setView("confirmation") toujours

Apres :
  const { data, error } = await supabase.auth.signUp(...)
  if (!error && !data.session) -> setView("confirmation")
  if (!error && data.session)  -> ne rien faire, redirection automatique
```

Un seul fichier modifie, une seule ligne de logique changee.
