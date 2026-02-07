

# Audit complet de /pricing et pages associees -- Corrections et ameliorations

## Audit de la page /pricing (score actuel : 7.5/10)

### Points positifs
- Messaging honnete ("Vote gratuit, soumission payante") -- bien corrige depuis le dernier audit
- Mention explicite que les abonnements n'influencent pas le classement
- Reassurance Stripe + sans engagement presente
- Animations framer-motion fluides
- Badge "Votre plan" et "Populaire" bien places
- Logique checkout fonctionnelle avec gestion d'erreurs

### Problemes identifies

| Probleme | Gravite | Impact |
|----------|---------|--------|
| Incoherence tutoiement/vouvoiement : "Choisis ton plan" (tu) vs "Ecoutez et votez" (vous) | Majeur | Impression non-professionnelle |
| Plan Free parait vide (3 features vs 6-7 pour Pro/Elite) | Majeur | Devalorisation de l'offre gratuite, impression que "gratuit = rien" |
| "Tout Free +" et "Tout Pro +" = jargon SaaS, pas clair | Moyen | Confusion pour non-inities |
| Pas de bouton "Gerer mon abonnement" pour les abonnes | Moyen | Utilisateur abonne doit aller sur /profile pour gerer |
| Bouton "Creer mon compte" du Free plan fait rien si deja connecte et pas sur Free | Mineur | Pas de feedback |
| Pas de gestion du retour `?checkout=cancelled` | Mineur | Aucun feedback apres annulation checkout |
| Auth.tsx redirige toujours vers /profile apres login, ignore le `redirect=/pricing` | Majeur | Utilisateur perd le contexte apres inscription depuis /pricing |

---

## Audit des pages associees

### /auth (page d'inscription/connexion)
- Le parametre `redirect` dans l'URL (`/auth?tab=signup&redirect=/pricing`) est **ignore** -- le code redirige toujours vers `/profile` (ligne 44)
- Inscription dit "participez au concours chaque semaine" -- legerement trompeur car il faut un abonnement pour soumettre

### /compete (page de soumission)
- Fonctionne correctement : bloque les Free avec message clair et lien vers /pricing
- Le message "Abonnement requis" est correct et non trompeur

### /profile (page profil)
- Gestion d'abonnement via "Gerer l'abonnement" fonctionne bien (customer-portal)
- Toast de succes apres checkout (`?checkout=success`) present
- Lien "Voir les plans Pro & Elite" pour les non-abonnes : OK

### Edge functions
- `check-subscription` : Mapping produit/tier correct, retourne `tier` dans la reponse
- `create-checkout` : Verifie l'abonnement actif existant, bloque la double souscription
- `customer-portal` : Fonctionnel, retourne l'URL du portail Stripe

---

## Plan de corrections

### 1. Standardiser le ton en vouvoiement (`Pricing.tsx`)
- Changer "Choisis ton plan" en "Choisissez votre plan"

### 2. Enrichir le plan Free (`subscription-tiers.ts`)
- Ajouter des features visibles au plan Free :
  - "Acces au classement en direct"
  - "Decouvrir tous les artistes"
  - "Notifications hebdomadaires"
- Remplacer "Tout Free +" par les features explicites pour Pro
- Remplacer "Tout Pro +" par les features explicites pour Elite

### 3. Ajouter un bouton "Gerer mon abonnement" pour les abonnes (`Pricing.tsx`)
- Si l'utilisateur est connecte ET abonne, afficher un bouton en haut de page ou sous les cards
- Ce bouton appelle `customer-portal` pour ouvrir le portail Stripe

### 4. Gerer le redirect apres inscription (`Auth.tsx`)
- Lire le parametre `redirect` depuis l'URL
- Rediriger vers `redirect` au lieu de `/profile` si present

### 5. Gerer le retour `?checkout=cancelled` (`Pricing.tsx`)
- Afficher un toast informatif quand l'utilisateur revient apres annulation du checkout

### 6. Clarifier la description d'inscription (`Auth.tsx`)
- Changer "participez au concours chaque semaine" en "Ecoutez, votez et decouvrez des artistes"

---

## Fichiers modifies

1. **`src/pages/Pricing.tsx`** -- Vouvoiement, bouton "Gerer l'abonnement", toast checkout annule
2. **`src/lib/subscription-tiers.ts`** -- Features enrichies pour Free, suppression du jargon "Tout X +"
3. **`src/pages/Auth.tsx`** -- Support du parametre `redirect`, description d'inscription clarifiee

