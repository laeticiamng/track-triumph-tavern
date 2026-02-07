

# Page Vote - Experience Feed Mobile-First Premium

## Contexte

Actuellement, la decouverte et le vote se font via la page Explore (grille de cards) et la page SubmissionDetail (detail individuel). L'experience n'est pas optimisee pour un usage mobile rapide type "feed". Ce plan cree une page `/vote` dediee avec un flow vertical immersif.

## Architecture

### Nouvelle page : `src/pages/Vote.tsx`

Page principale avec feed vertical plein ecran. Chaque "carte" occupe la hauteur visible (100vh - header - bottom nav). L'utilisateur scroll verticalement pour passer d'un son a l'autre.

**Donnees chargees :**
- Semaine active (`weeks` ou `is_active = true`)
- Soumissions approuvees de la semaine avec join sur `categories` et `profiles`
- Votes existants de l'utilisateur pour la semaine (pour savoir quelles categories sont deja votees)
- Tier de l'utilisateur via `useSubscription` (pour afficher quota Free)

### Nouveau composant : `src/components/vote/VoteFeed.tsx`

Le conteneur scroll snap vertical. Utilise CSS `scroll-snap-type: y mandatory` et `scroll-snap-align: start` sur chaque carte pour un defilement "page par page" natif, performant, sans librairie externe.

### Nouveau composant : `src/components/vote/VoteCard.tsx`

Une carte plein ecran par soumission :
- Cover image en fond (plein ecran, gradient overlay)
- Mini profil artiste (avatar + nom, lien vers `/artist/:id`)
- Titre + tags + badge categorie
- Player audio sticky en bas de la carte (play/pause + progress bar)
- Barre d'actions : Vote / Commenter / Partager
- Indicateur "Deja vote dans cette categorie" si applicable
- Message "Merci, ton vote compte." apres vote (animation fade)

### Nouveau composant : `src/components/vote/VoteQuotaBar.tsx`

Barre affichee en haut du feed pour les utilisateurs Free :
- "3/5 votes utilises cette semaine"
- Progress bar visuelle
- CTA discret "Passer a Pro pour des votes illimites"
- Masquee pour Pro/Elite (ou affiche "Votes illimites")

### Nouveau composant : `src/components/vote/ShareSheet.tsx`

Bottom sheet (via Vaul drawer) pour le partage :
- Copier le lien
- Partager sur Twitter/X, Instagram, WhatsApp
- Utilise `navigator.share` sur mobile si disponible

### Hook : `src/hooks/use-vote-state.ts`

Hook centralise pour gerer :
- Les votes de l'utilisateur pour la semaine active
- Le compteur de votes utilises (Free)
- La verification "deja vote dans cette categorie"
- Le rafraichissement apres vote

### Sticky Audio Player

Le player audio est integre dans chaque VoteCard. Quand l'utilisateur scroll vers une nouvelle carte, le son precedent s'arrete automatiquement. Pas de player global : chaque carte gere son propre audio pour eviter les conflits.

**Auto-play** : quand une carte entre en viewport (via IntersectionObserver), le son demarre automatiquement. Quand elle sort, il s'arrete.

---

## Modifications des fichiers existants

| Fichier | Modification |
|---|---|
| `src/App.tsx` | Ajouter route `/vote` |
| `src/components/layout/BottomNav.tsx` | Remplacer "Explorer" par "Vote" (ou ajouter "Vote" entre Explorer et Concours) |

---

## Fichiers a creer

| Fichier | Role |
|---|---|
| `src/pages/Vote.tsx` | Page principale : charge donnees, gere le state global |
| `src/components/vote/VoteFeed.tsx` | Conteneur scroll-snap vertical |
| `src/components/vote/VoteCard.tsx` | Carte immersive plein ecran par soumission |
| `src/components/vote/VoteQuotaBar.tsx` | Indicateur quota Free |
| `src/components/vote/ShareSheet.tsx` | Bottom sheet partage |
| `src/hooks/use-vote-state.ts` | Hook centralise vote state + quota |

---

## Detail technique

### VoteCard - Structure visuelle

```text
+----------------------------------+
| [Quota Bar - Free only]          |
+----------------------------------+
|                                  |
|     COVER IMAGE (full bleed)     |
|     gradient overlay bottom      |
|                                  |
|  [Badge Categorie]  [Tags]       |
|                                  |
|  TITRE DU MORCEAU               |
|  par Artiste  [avatar]           |
|                                  |
|  [Player: Play/Pause + Bar]      |
|                                  |
|  +-----+ +--------+ +--------+  |
|  | Vote | |Commenter| |Partager| |
|  +-----+ +--------+ +--------+  |
|                                  |
|  "Deja vote dans Pop cette sem." |
|  ou                              |
|  "Merci, ton vote compte."       |
+----------------------------------+
```

### Scroll-snap CSS

```text
Conteneur : overflow-y: auto, scroll-snap-type: y mandatory, h-[calc(100dvh-4rem-4rem)]
Carte : scroll-snap-align: start, min-h-full, position relative
```

### IntersectionObserver pour auto-play

Chaque VoteCard utilise un `useEffect` + `IntersectionObserver` avec `threshold: 0.7`. Quand la carte est visible a 70%, l'audio demarre. Quand elle sort, pause automatique.

### Vote State (use-vote-state.ts)

```text
Input : user, activeWeekId
Output :
  - votedCategories: Set<string> (categories deja votees)
  - voteCount: number (nombre de votes cette semaine)
  - tier: SubscriptionTier
  - canVote(categoryId): boolean
  - remainingVotes: number | "unlimited"
  - recordVote(categoryId): void
```

### Partage

ShareSheet utilise le composant Drawer de Vaul (deja installe). Sur mobile, tente `navigator.share()` en natif d'abord. Fallback vers le bottom sheet avec liens manuels.

### Filtre par categorie

En haut du feed (sous la quota bar), barre horizontale scrollable de filtres par categorie (pilules). Meme pattern que Explore.tsx mais en overlay transparent sur le feed.

---

## Conformite

- Aucun mot interdit (loto, jackpot, mise, etc.)
- Message post-vote : "Merci, ton vote compte." (sobre, premium)
- Quota Free clairement affiche sans urgence artificielle
- CTA Pro discret, jamais agressif
- 1 vote par categorie par semaine respecte cote client + serveur

