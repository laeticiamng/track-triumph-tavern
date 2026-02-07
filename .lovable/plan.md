

# Audit des fonctionnalites Pro et Elite -- Corrections

## Resultat de l'audit

### PRO -- 6 features annoncees

| Feature | Statut | Detail |
|---------|--------|--------|
| Soumettre 1 morceau/semaine | OK | Gate `tier !== "free"` dans Compete.tsx + verification `alreadySubmitted` |
| Votes illimites | OK | `votes_per_week: Infinity` + cast-vote sans limite |
| 5 commentaires/semaine | Backend OK, UX manquante | cast-vote strip les commentaires au-dela de 5, mais le formulaire ne montre aucun compteur ni message. L'utilisateur ne sait pas que son commentaire a ete ignore |
| Profil personnalise (avatar, liens sociaux) | OK | Avatar upload + liens sociaux dans Profile.tsx pour `tier !== "free"` |
| Statistiques de votes sur profil | Partiel | 3 chiffres simples (soumissions, votes donnes, votes recus). Pas de graphique ni d'evolution temporelle |
| Ecoute, classement inclus | OK | Acces identique a Free |

### ELITE -- 6 features annoncees

| Feature | Statut | Detail |
|---------|--------|--------|
| Soumettre 1 morceau/semaine | OK | Meme logique que Pro |
| Votes et commentaires illimites | OK | Backend gere correctement (`comments_per_week: Infinity`) |
| Feedback IA structure | OK | AIFeedback.tsx appelle `ai-feedback`, gate par `tier === "elite"`, affiche 4 sections |
| Profil premium (avatar, banner, liens sociaux) | Avatar OK, Banner ABSENT | Aucun upload de banner dans Profile.tsx. Le champ `banner_url` existe en base et s'affiche sur ArtistProfile.tsx mais ne peut pas etre rempli |
| Badge Elite sur profil | OK | Badge dore sur Profile.tsx + badge sur ArtistProfile.tsx via check-subscription-public |
| Statistiques de votes detaillees | ABSENT | Aucune difference avec les stats Pro. Pas de graphique d'evolution |

---

## 3 problemes a corriger

### 1. Upload de banner manquant (Elite)
La feature annonce "avatar, banner, liens sociaux" mais seul l'avatar est editable. Le champ `banner_url` existe en base et s'affiche sur la page artiste, mais il n'y a aucun moyen de l'uploader.

**Correction :** Ajouter un bouton d'upload de banner sur Profile.tsx, visible uniquement pour les Elite (`tier === "elite"`). Upload vers le bucket `cover-images` sous le path `{user_id}/banner.{ext}`.

### 2. Retour UX sur le quota de commentaires (Pro)
Le backend strip silencieusement les commentaires quand le quota est atteint (Pro: 5/semaine). Le formulaire de vote (VoteButton.tsx) ne montre aucune indication. L'utilisateur pense avoir laisse un commentaire alors qu'il a ete ignore.

**Correction :**
- Passer le `tier` et un compteur de commentaires restants au VoteButton
- Afficher un message sous le champ commentaire : "X/5 commentaires cette semaine" pour Pro
- Desactiver le champ commentaire quand le quota est atteint avec message explicatif
- Pour Free : masquer le champ commentaire avec un message "Passez a Pro pour commenter"
- Pour Elite : afficher "Commentaires illimites"

### 3. Section statistiques enrichie (Pro/Elite)
Les "Statistiques de votes" annoncees se limitent a 3 chiffres. Pour justifier la promesse, ajouter une section avec un graphique recharts montrant les votes recus par jour sur les 7 derniers jours.

**Correction :**
- Ajouter une section "Statistiques" sur Profile.tsx, visible pour Pro et Elite
- Requete : grouper les votes recus par date sur les 7 derniers jours pour les soumissions de l'utilisateur
- Afficher un graphique recharts (AreaChart) avec les votes par jour
- Pour Elite, ajouter aussi la repartition par categorie (PieChart)

---

## Fichiers a modifier

1. **`src/pages/Profile.tsx`** -- Upload banner (Elite), section statistiques (Pro/Elite)
2. **`src/components/vote/VoteButton.tsx`** -- Afficher le quota de commentaires, gater le champ selon le tier
3. **`src/pages/Vote.tsx`** -- Passer les infos de tier/commentaires au VoteButton
4. **`src/hooks/use-vote-state.ts`** -- Ajouter le compteur de commentaires utilises cette semaine
5. **`src/components/vote/VoteFeed.tsx`** -- Propager le tier au VoteButton

