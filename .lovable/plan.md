
# Corrections suite au retour bêta-testeur

## Probleme 1 : La plus-value artiste n'est pas claire

**Constat** : Un visiteur ne comprend pas en 3 secondes ce qu'il gagne a poster sa musique.

### Actions :

**A. Nouvelle section "Ce que vous gagnez" sur la landing page** (`src/pages/Index.tsx` + nouveau composant `src/components/landing/ArtistBenefits.tsx`)

Ajout d'une section entre "WhyUs" et "CategoriesSection" qui liste clairement les benefices concrets pour l'artiste :

- Visibilite : "Les gagnants sont mis en avant chaque semaine sur la page d'accueil"
- Cash : "Jusqu'a 200 EUR de recompenses chaque semaine"
- Feedback : "Recevez des votes detailles sur 3 criteres (emotion, originalite, production)"
- Communaute : "Faites-vous connaitre aupres d'une communaute de passionnes"
- Credibilite : "Affichez vos badges et classements sur votre profil artiste"

**B. Sous-titre Hero plus explicite** (`src/components/landing/HeroSection.tsx`)

Remplacer le sous-titre actuel par un message plus oriente benefice artiste :
"Soumettez votre musique, recevez des votes de la communaute, et gagnez jusqu'a 200 EUR chaque semaine."

---

## Probleme 2 : Les gagnants de la semaine ne sont pas visibles

**Constat** : Les gagnants sont uniquement sur /results et /hall-of-fame. Un visiteur qui arrive sur la page d'accueil ou sur /explore ne les voit jamais.

### Actions :

**C. Nouveau composant "Podium de la semaine"** (`src/components/landing/WeeklyPodium.tsx`)

Un bandeau/section qui affiche les 3 derniers gagnants (de la semaine precedente dont les resultats sont publies) avec :
- Photo de couverture du morceau
- Nom de l'artiste + titre
- Medaille (or, argent, bronze)
- Lien vers la soumission
- Message "Aucun podium encore" si pas de resultats publies

Donnees : requete sur `winners` + `submissions` pour la derniere semaine avec `results_published_at` non null.

**D. Afficher le podium sur la page d'accueil** (`src/pages/Index.tsx`)

Inserer le composant `WeeklyPodium` entre HowItWorks et WhyUs pour que les visiteurs voient immediatement les gagnants.

**E. Afficher le podium sur la page Explore** (`src/pages/Explore.tsx`)

Ajouter un bandeau compact en haut de la page Explore montrant les 3 gagnants de la semaine precedente, avec un lien vers /results.

---

## Resume technique

| Fichier | Action |
|---|---|
| `src/components/landing/ArtistBenefits.tsx` | Creer — nouvelle section "Ce que vous gagnez" |
| `src/components/landing/WeeklyPodium.tsx` | Creer — composant podium gagnants de la semaine |
| `src/components/landing/HeroSection.tsx` | Modifier — sous-titre plus explicite |
| `src/pages/Index.tsx` | Modifier — inserer ArtistBenefits + WeeklyPodium |
| `src/pages/Explore.tsx` | Modifier — ajouter bandeau podium en haut |

5 fichiers touches (2 crees, 3 modifies). Aucun changement de base de donnees necessaire, les tables `winners` et `submissions` existent deja.
