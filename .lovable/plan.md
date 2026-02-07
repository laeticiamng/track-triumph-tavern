

# Audit des features annoncees dans les abonnements /pricing

## Methodologie
Verification feature par feature : chaque element liste dans les plans Free, Pro et Elite a ete trace dans le code source pour verifier s'il est implemente, fonctionnel et accessible.

---

## Plan FREE (6 features annoncees)

| Feature annoncee | Statut | Detail |
|------------------|--------|--------|
| Ecouter toutes les soumissions | OK | Pages /explore et /vote avec AudioPlayer fonctionnel |
| 5 votes par semaine | OK | `use-vote-state.ts` lit `votes_per_week: 5` et bloque au-dela. VoteQuotaBar affiche le compteur |
| Acces au classement en direct | OK | Pages /results et /hall-of-fame accessibles sans abonnement |
| Decouvrir tous les artistes | OK | Page /explore + /artist/:id accessible sans restriction |
| Notifications hebdomadaires | ABSENT | Aucun systeme de notifications implemente (ni email, ni push, ni in-app). La feature est promise mais inexistante |
| Profil basique | OK | Page /profile avec edition nom + bio |

---

## Plan PRO (6 features annoncees)

| Feature annoncee | Statut | Detail |
|------------------|--------|--------|
| Soumettre 1 morceau par semaine | OK | Page /compete gate par `tier !== "free"`, verifie `alreadySubmitted` pour limiter a 1/semaine |
| Votes illimites | OK | `votes_per_week: Infinity` dans les limits, `use-vote-state.ts` retourne `"unlimited"` |
| Analytics de base | ABSENT | `limits.analytics: true` est defini mais aucune page/composant analytics n'existe. Pas de dashboard de stats pour les artistes Pro |
| Profil artiste personnalise | PARTIEL | Le profil /profile permet nom + bio, mais pas d'avatar, pas de banner, pas de liens sociaux. La page /artist/:id affiche ces champs mais ils ne sont pas editables |
| 5 commentaires par semaine | ABSENT | Le systeme de commentaires dans VoteButton est optionnel et non limite. Aucun quota de 5 commentaires/semaine n'est implemente |
| Ecoute, classement et decouverte inclus | OK | Meme acces que Free |

---

## Plan ELITE (7 features annoncees)

| Feature annoncee | Statut | Detail |
|------------------|--------|--------|
| Soumettre 1 morceau par semaine | OK | Meme logique que Pro |
| Votes et commentaires illimites | PARTIEL | Votes illimites OK. Commentaires : aucun quota n'est en place (ni pour Pro ni pour Elite), donc c'est deja illimite pour tous |
| Analytics avances (evolution jour par jour) | ABSENT | Meme probleme que Pro : aucune page analytics n'existe |
| Feedback IA structure (analyse detaillee) | OK | Composant `AIFeedback.tsx` gate par `tier === "elite"`, appelle la edge function `ai-feedback`, affiche vibe/structure/production/suggestions |
| Kit marketing automatique (visuels promo) | ABSENT | `marketing_kit: true` est defini dans les limits mais aucun composant, page ou edge function ne genere de visuels promo. Feature promise mais totalement absente |
| Badge Elite sur le profil | ABSENT | Aucun badge Elite n'est affiche sur la page /profile ni sur /artist/:id. Le code ArtistProfile.tsx a un state `tier` mais il reste toujours `"free"` (jamais mis a jour) |
| Page artiste premium | ABSENT | La page /artist/:id est identique pour tous les tiers. Aucune difference visuelle ou fonctionnelle pour les Elite |

---

## Resume des problemes

### Features totalement absentes (a implementer ou retirer de la liste)

1. **Notifications hebdomadaires** (Free) -- Aucun systeme de notifications
2. **Analytics de base** (Pro) -- Aucune page analytics
3. **Analytics avances** (Elite) -- Idem
4. **Kit marketing automatique** (Elite) -- Aucune implementation
5. **Badge Elite sur le profil** (Elite) -- Non affiche
6. **Page artiste premium** (Elite) -- Pas de difference avec les autres tiers

### Features partiellement implementees (a corriger)

7. **Profil artiste personnalise** (Pro) -- Edition avatar, banner et liens sociaux manquante
8. **5 commentaires par semaine** (Pro) -- Aucun quota en place, commentaires illimites pour tous
9. **Votes et commentaires illimites** (Elite) -- Les commentaires sont deja illimites pour tous, donc pas de difference avec Free/Pro

---

## Plan de corrections recommande

### Option A : Implementer les features manquantes (effort eleve)
Creer les pages/composants pour : analytics basique (Pro), analytics avances (Elite), kit marketing (Elite), badge Elite, page artiste premium, systeme de notifications, quota commentaires Pro, edition profil etendue.

### Option B : Ajuster les features annoncees (effort faible)
Retirer ou reformuler les features non implementees dans `subscription-tiers.ts` pour ne promettre que ce qui existe reellement. Par exemple :
- Retirer "Notifications hebdomadaires" du Free
- Remplacer "Analytics de base" par "Statistiques de votes (sur votre profil)"
- Retirer "Kit marketing automatique" de Elite
- Remplacer "Badge Elite sur le profil" par "Badge Elite (a venir)"
- Remplacer "5 commentaires par semaine" par "Commentaires sur les votes"

### Option C : Approche mixte (recommandee)
- Implementer les corrections rapides : Badge Elite sur profil/artist, edition avatar + liens sociaux
- Reformuler les features complexes non implementees (analytics avances, kit marketing) avec mention "a venir" ou les retirer
- Ajouter un quota de commentaires pour Pro (5/semaine) pour differencier reellement des tiers

---

## Fichiers concernes

1. `src/lib/subscription-tiers.ts` -- Ajuster les features annoncees
2. `src/pages/Profile.tsx` -- Ajouter badge Elite, edition avatar
3. `src/pages/ArtistProfile.tsx` -- Afficher badge Elite, differencier page premium
4. `src/components/vote/VoteButton.tsx` -- Implementer quota commentaires Pro
5. Nouveaux fichiers potentiels : page analytics, composant kit marketing

