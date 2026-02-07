

# Audit "Musicien & Participant" -- Ameliorations recommandees

## Ce que voit un musicien aujourd'hui

En tant qu'artiste qui decouvre la plateforme, les pages de categories sont informatives mais manquent d'elements qui parlent vraiment a un musicien. Voici les constats et les ameliorations proposees.

---

## Constats depuis l'oeil d'un musicien

### 1. Le texte historique est un pave
L'histoire est un long bloc de texte continu (`whitespace-pre-line` dans un seul `<p>`). C'est decourageant a lire, surtout sur mobile. Un musicien veut des infos rapides et visuelles, pas un cours d'histoire de la musique.

### 2. Pas de conseil pour participer
Un musicien qui arrive sur la page Reggae se dit : "OK cool, mais moi, concretement, je soumets quoi ?". Il n'y a aucun conseil de production, aucune indication sur ce que les votants attendent, aucune astuce.

### 3. Les artistes sont juste des badges plats
Les grandes figures sont de simples badges texte. Pas d'epoque, pas de contexte. Pas de "pourquoi cet artiste est important pour ce genre".

### 4. Pas de sous-genres visibles
Un musicien qui fait du dancehall ne sait pas s'il doit soumettre en Reggae. Quelqu'un qui fait du boom-bap ne sait pas si c'est Rap/Trap ou Lofi. Il manque les sous-genres acceptes.

### 5. Pas de citation ou de phrase inspirante
Les pages manquent de "soul". Une citation d'un artiste legendaire du genre donnerait du caractere et de l'emotion.

### 6. L'experience est statique
Pas de navigation entre categories. Un musicien qui hesite entre deux genres doit revenir a l'accueil pour voir l'autre.

### 7. Le bouton "Retour" ramene a l'accueil
Il devrait ramener a la page precedente ou au moins proposer d'explorer d'autres categories.

---

## Plan d'ameliorations

### A. Enrichissement des donnees (base de donnees)

Ajouter 3 nouvelles colonnes a la table `categories` :

| Colonne | Type | Description |
|---------|------|-------------|
| `sub_genres` | text[] | Liste des sous-genres acceptes (ex: dancehall, dub, roots pour Reggae) |
| `mood_tags` | text[] | Ambiances typiques du genre (ex: chill, melancolique, energique) |
| `fun_fact` | text | Citation celebre ou anecdote marquante du genre |

Remplir ces colonnes pour les 12 categories avec du contenu pertinent.

Exemples :

**Reggae** :
- Sub-genres : Roots, Dancehall, Dub, Ska, Rocksteady, Lovers Rock
- Moods : Spirituel, Chill, Festif, Conscient
- Fun fact : "One good thing about music, when it hits you, you feel no pain." -- Bob Marley

**Jazz** :
- Sub-genres : Bebop, Cool Jazz, Jazz Fusion, Free Jazz, Smooth Jazz, Jazz Manouche
- Moods : Sophistique, Intimiste, Experimental, Groovy
- Fun fact : "Do not fear mistakes. There are none." -- Miles Davis

**Rap / Trap** :
- Sub-genres : Boom-bap, Trap, Drill, Cloud Rap, Rap Conscient, Freestyle
- Moods : Brut, Melodique, Sombre, Energique
- Fun fact : "I'm not a businessman, I'm a business, man." -- Jay-Z

**Lofi** :
- Sub-genres : Lofi Hip-Hop, Chillhop, Jazz Hop, Lofi House, Ambient Lofi
- Moods : Chill, Nocturne, Nostalgique, Studieux
- Fun fact : Nujabes, le parrain du lofi, signifie "Jun Seba" a l'envers -- son vrai nom.

*(Les 8 autres categories suivront le meme modele)*

### B. Refonte de la page CategoryDetail

Transformer la page en une experience riche et engageante :

**1. Section Citation / Fun Fact**
- Afficher la citation ou anecdote dans un encadre stylise avec une grande typographie et un fond colore, juste sous la banniere hero. Ca donne immediatement du caractere.

**2. Section "Sous-genres acceptes"**
- Afficher les sous-genres sous forme de badges colores avec une petite description : "Tu fais du dancehall ? Du dub ? Du ska ? Tout rentre ici."
- Ca repond directement a la question "Est-ce que mon style rentre dans cette categorie ?"

**3. Section "Ambiances typiques" (Mood Tags)**
- Afficher les moods sous forme de petites pastilles colorees (ex: Chill, Energique, Melancolique)
- Ca aide le votant a comprendre ce qu'il va entendre et le musicien a positionner son morceau

**4. Histoire reformatee en paragraphes distincts**
- Separer les paragraphes visuellement avec des espacements clairs au lieu d'un bloc continu
- Chaque paragraphe dans son propre element `<p>` pour un meilleur rendu typographique

**5. Navigation entre categories**
- Ajouter des boutons "Categorie precedente" / "Categorie suivante" en bas de page
- Permettre de naviguer sans revenir a l'accueil

**6. Bouton "Retour" ameliore**
- Remplacer le lien vers "/" par un lien vers la section categories de la landing page (ancre `/#categories`)

---

## Fichiers concernes

1. **Migration SQL** : Ajout des colonnes `sub_genres` (text[]), `mood_tags` (text[]), `fun_fact` (text) + UPDATE des 12 categories
2. **`src/pages/CategoryDetail.tsx`** : Refonte avec les nouvelles sections (citation, sous-genres, moods, navigation inter-categories, histoire reformatee)
3. **`src/components/landing/CategoriesSection.tsx`** : Ajout d'un `id="categories"` sur la section pour l'ancre de retour

