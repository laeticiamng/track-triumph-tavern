

# Corrections finales avant publication

## Audit rapide -- Etat actuel

Apres verification approfondie, la majorite des corrections des audits precedents sont en place :
- Hero dynamique avec countdown et CTA adaptatif
- SocialProof masque les compteurs a zero
- Empty states engageants sur Explore et Vote
- Traductions "cagnotte" effectuees partout (About, Admin, FAQ, WhyUs, RewardPool, Results)
- BottomNav reorganise (Accueil, Explorer, Soumettre, Resultats, Profil)
- Footer avec section "Suivez-nous"

## Problemes restants a corriger

### 1. Header desktop : renommer "Concours" en "Soumettre" (P0 -- coherence)
Le BottomNav dit "Soumettre" mais le Header desktop dit encore "Concours". Un visiteur qui navigue sur desktop et mobile verra deux labels differents pour la meme page. Correction : aligner sur "Soumettre".

### 2. Header desktop : ajouter "A propos" (P1 -- confiance)
Le lien /about existe dans le footer mais pas dans la navigation principale desktop. Ajouter un lien discret pour renforcer la credibilite (un visiteur presse veut savoir "qui etes-vous ?" sans scroller jusqu'au footer).

### 3. Footer : liens reseaux sociaux placeholders (P1 -- credibilite)
Les liens pointent vers instagram.com, x.com et discord.gg (pages d'accueil generiques). Deux options :
- Soit les retirer temporairement pour eviter de paraitre amateur
- Soit les garder en ajoutant un commentaire code pour remplacement futur

Je recommande de les retirer pour la publication et de les remettre une fois les comptes crees.

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/components/layout/Header.tsx` | Renommer "Concours" en "Soumettre" dans navItems + ajouter lien "A propos" |
| `src/components/layout/Footer.tsx` | Retirer la section "Suivez-nous" avec les liens placeholders |

Total : 2 fichiers modifies, 0 fichier cree.

## Detail technique

**Header.tsx** (ligne 11) :
- Changer `{ label: "Concours", href: "/compete", icon: Music }` en `{ label: "Soumettre", href: "/compete", icon: Music }`
- Ajouter `{ label: "A propos", href: "/about", icon: Info }` apres "Tarifs"

**Footer.tsx** (lignes 48-53) :
- Supprimer le bloc "Suivez-nous" avec les 3 liens placeholders (Instagram, X, Discord)
- Le remettre une fois les vrais comptes reseaux sociaux crees

