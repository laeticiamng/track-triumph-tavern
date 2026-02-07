

# Audit fonctionnel complet -- /pricing et pages associees

## Score global : 8.5/10

---

## 1. Page /pricing -- Score : 9/10

### Ce qui fonctionne bien
- Titre "Choisissez votre plan" -- vouvoiement coherent
- Sous-titre clair : "Ecoutez et votez gratuitement. Debloquez la soumission..."
- Mention anti-manipulation : "Les abonnements n'influencent pas le classement"
- 3 cards bien structurees avec animations framer-motion
- Badge "Populaire" sur Pro, badge "Votre plan" sur le plan actif
- Plan Free enrichi avec 6 features (plus de sensation de "plan vide")
- Pro et Elite avec features explicites (plus de jargon "Tout Free +")
- Reassurance Stripe en bas de page
- Bouton "Gerer mon abonnement" visible pour les abonnes (appelle customer-portal)
- Toast "Paiement annule" sur retour `?checkout=cancelled`

### Problemes restants

| Probleme | Gravite | Detail |
|----------|---------|--------|
| Bouton Free "Plan actuel" disabled quand connecte en Free -- OK. Mais si connecte et deja Pro/Elite, le bouton Free dit toujours "Creer mon compte" au lieu de "Plan Free" | Mineur | Confusion legere pour un abonne qui voit "Creer mon compte" sur le plan Free |
| Checkout ouvre dans un nouvel onglet (`window.open`) | Mineur | L'utilisateur quitte le contexte de l'app -- `window.location.href` serait plus fluide pour un checkout |
| Pas de distinction visuelle entre Pro et Elite quand l'un est le plan actuel et l'autre non | Mineur | Si l'utilisateur est Pro, le bouton Elite dit juste "S'abonner" sans mentionner "Upgrader" |

---

## 2. Page /auth -- Score : 8/10

### Ce qui fonctionne
- Redirect parameter fonctionne : `useEffect` lit `searchParams.get("redirect")` et redirige correctement
- Messaging clarifie : "Inscription gratuite -- ecoutez, votez et decouvrez des artistes"
- Toggle connexion/inscription fluide
- Validation : email requis, mot de passe min 6 caracteres
- Gestion erreur "already registered" avec message clair

### Problemes restants

| Probleme | Gravite | Detail |
|----------|---------|--------|
| Si l'utilisateur est deja connecte et visite /auth, il est redirige -- mais l'ecran blanc flash brievement avant la redirection | Mineur | Manque un etat de chargement pendant la verification de session |
| Pas de lien "Mot de passe oublie" | Moyen | Fonctionnalite basique absente -- l'utilisateur ne peut pas recuperer son compte |
| Pas de social login (Google/Discord) | Moyen | Friction a l'inscription pour le public cible (artistes musicaux) |

---

## 3. Page /compete -- Score : 9/10

### Ce qui fonctionne
- Gate Free : Message "Abonnement requis" avec icone Lock, texte clair et CTA vers /pricing
- Gate "Deja soumis" : Message correct avec lien vers /explore
- Formulaire complet : titre, artiste, categorie, description, tags, audio, cover, lien externe
- Declarations checkboxes (droits + reglement)
- Upload vers storage buckets (audio-excerpts, cover-images)
- Gestion de la periode de soumission (open/close)

### Problemes restants

| Probleme | Gravite | Detail |
|----------|---------|--------|
| Pas de validation de taille de fichier audio | Moyen | Un utilisateur pourrait uploader un fichier de 100MB -- pas de limite visible |
| Pas de preview audio avant envoi | Mineur | L'utilisateur ne peut pas verifier son extrait |
| Le redirect non-connecte va vers `/auth?tab=signup` sans `redirect=/compete` | Moyen | Apres inscription, l'utilisateur est redirige vers /profile au lieu de revenir sur /compete |

---

## 4. Page /profile -- Score : 8.5/10

### Ce qui fonctionne
- Card abonnement avec badge Actif/Gratuit et icone par tier
- Bouton "Gerer l'abonnement" (customer-portal) pour les abonnes
- Bouton "Voir les plans Pro & Elite" pour les non-abonnes
- Toast de succes apres checkout (`?checkout=success`)
- Stats : soumissions, votes donnes, votes recus
- Edition profil (nom d'artiste, bio) fonctionnelle
- Liste des soumissions avec statut (En attente/Approuve/Rejete)

### Problemes restants

| Probleme | Gravite | Detail |
|----------|---------|--------|
| Pas d'avatar/photo de profil | Mineur | Profil basique sans image |
| La date de renouvellement s'affiche mais pas le montant du plan | Mineur | L'utilisateur ne voit pas combien il paie |

---

## 5. Edge Functions -- Score : 9/10

### check-subscription
- Mapping produit/tier correct (prod_TvnnCLdThflvd5 = pro, prod_Tvnn1RBP7qVms7 = elite)
- Retourne `tier`, `subscribed`, `subscription_end`
- Fallback "free" pour client Stripe sans abonnement actif
- Logging detaille

### create-checkout
- Verifie l'existence du client Stripe, bloque la double souscription
- Success URL : `/profile?checkout=success`
- Cancel URL : `/pricing?checkout=cancelled`
- Gestion d'erreurs propre

### customer-portal
- Retourne l'URL du portail Stripe
- Return URL vers `/profile`
- Gestion erreur "No Stripe customer found"

### Probleme edge function

| Probleme | Gravite | Detail |
|----------|---------|--------|
| `create-checkout` retourne status 500 meme pour des erreurs metier ("deja abonne") | Mineur | Devrait retourner 400 pour les erreurs utilisateur vs 500 pour les erreurs serveur |

---

## 6. Coherence inter-pages

| Flux | Statut | Detail |
|------|--------|--------|
| Pricing -> Auth (signup) -> redirect /pricing | OK | Le parametre redirect est supporte |
| Pricing -> Checkout -> Stripe -> retour success | OK | Redirige vers /profile avec toast |
| Pricing -> Checkout -> Stripe -> retour annule | OK | Redirige vers /pricing avec toast |
| Pricing -> Gerer abonnement -> Stripe Portal | OK | Ouvre le portail dans un nouvel onglet |
| Compete -> Gate Free -> Pricing | OK | Lien "Voir les offres" fonctionne |
| Compete -> redirect non-connecte | BUG | Manque `redirect=/compete` dans la redirection vers /auth |
| Profile -> Gerer abonnement -> Stripe Portal | OK | Fonctionne |
| Profile -> Voir les plans -> Pricing | OK | Lien fonctionne |

---

## Plan de corrections

### 1. Corriger le redirect de /compete vers /auth (`Compete.tsx` ligne 55)
Changer `navigate("/auth?tab=signup")` en `navigate("/auth?tab=signup&redirect=/compete")` pour que l'utilisateur revienne sur /compete apres inscription.

### 2. Changer le texte du bouton Free pour les abonnes (`Pricing.tsx` ligne 179)
Si l'utilisateur est connecte ET n'est pas sur le plan Free, afficher "Plan Free" au lieu de "Creer mon compte".

### 3. Ameliorer le bouton d'upgrade (`Pricing.tsx` ligne 190)
Quand l'utilisateur est Pro et regarde Elite, afficher "Upgrader" au lieu de "S'abonner".

### 4. Rediriger le checkout dans le meme onglet (`Pricing.tsx` ligne 60)
Remplacer `window.open(result.url, "_blank")` par `window.location.href = result.url` pour un flux plus fluide.

### 5. Meme correction pour le portail (`Pricing.tsx` ligne 75 et `Profile.tsx` ligne 90)
Remplacer `window.open(result.url, "_blank")` par `window.location.href = result.url`.

---

## Fichiers a modifier

1. **`src/pages/Compete.tsx`** -- Ajouter `redirect=/compete` dans le navigate vers /auth
2. **`src/pages/Pricing.tsx`** -- Texte bouton Free dynamique, label "Upgrader", checkout dans le meme onglet
3. **`src/pages/Profile.tsx`** -- Portail dans le meme onglet

