

# Vitrine Marketing Parfaite -- Plan de corrections finales

## Audit multi-perspective : resume des problemes restants

### Marketing (CMO)
- Le titre About contient encore "reward pool" en anglais
- La page About manque de personnalite et d'equipe (normal en beta, mais le texte peut etre ameliore)
- Pas de lien vers les reseaux sociaux dans le footer
- Le header desktop n'a pas de lien "Explorer" en tant que premier lien visible pour les visiteurs

### UX / Beta-testeur
- La page Vote a des pills de filtre avec `bg-white/15 text-white/80` qui sont illisibles sur fond clair (hors contexte hero)
- Le bottom nav n'a pas "Explorer" alors que c'est une action cle
- Le label "Concours" dans le bottom nav est ambigu -- mieux : "Soumettre"

### Branding / Design
- Le hero est deja bien. Les sections HowItWorks, WhyUs, Categories, FAQ sont propres
- Le CTA "S'inscrire" dans le header pourrait etre plus visible (gradient deja present, OK)
- La SocialProof gere deja le cas 0 correctement (affiche "Lancement imminent")

### RGPD / DPO
- Cookie consent present
- CGU, Privacy, Cookies, Contest Rules presents -- OK
- Le mailto contact est acceptable en beta

### Securite / CISO
- Deja audite et corrige dans les messages precedents
- RLS en place, edge functions securisees

---

## Corrections a implementer

### 1. Traduire "reward pool" dans About.tsx (P0)
- Ligne 23 : remplacer "un reward pool est constitue" par "une cagnotte est constituee"

### 2. Traduire "Reward Pool" dans AdminDashboard.tsx (P1)
- Lignes 148, 315, 358 : remplacer "Reward Pool" par "Cagnotte"
- Note : c'est l'admin dashboard, moins critique, mais coherent

### 3. Ameliorer la lisibilite des pills de filtre sur la page Vote (P0)
- Les pills `bg-white/15 text-white/80` sont pensees pour un fond sombre mais la page Vote n'a pas de fond sombre permanent
- Changer vers des styles coherents avec le theme : `bg-secondary text-secondary-foreground` pour inactif, `bg-primary text-primary-foreground` pour actif

### 4. Ajouter "Explorer" au bottom nav et renommer "Concours" (P1)
- Remplacer les items du BottomNav pour inclure "Explorer" (/explore) avec l'icone Search
- Renommer "Concours" en "Soumettre" pour plus de clarte
- Garder 5 onglets max : Accueil, Explorer, Soumettre, Resultats, Profil
- Note : "Vote" est accessible depuis Explorer, donc on peut le retirer du bottom nav pour simplifier

### 5. Ajouter des liens reseaux sociaux dans le Footer (P2)
- Ajouter une section "Suivez-nous" avec des placeholders pour Instagram, Twitter/X, Discord
- Utiliser des icones lucide (pas de logos de marques, juste des liens texte)

### 6. Ameliorer la page About (P1)
- Traduire "reward pool" (deja mentionne)
- Ajouter une phrase sur la beta et la date de lancement previsionnelle
- Rendre le contact plus engageant

### 7. Ajouter un lien "A propos" dans le header desktop (P2)
- Integrer dans les navItems du Header un lien vers /about

---

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/pages/About.tsx` | Traduire "reward pool" en "cagnotte" |
| `src/pages/AdminDashboard.tsx` | Traduire "Reward Pool" en "Cagnotte" (3 occurrences) |
| `src/pages/Vote.tsx` | Corriger les styles des pills de filtre pour lisibilite |
| `src/components/layout/BottomNav.tsx` | Reorganiser : Accueil, Explorer, Soumettre, Resultats, Profil |
| `src/components/layout/Footer.tsx` | Ajouter section reseaux sociaux |

Total : 5 fichiers modifies, 0 fichier cree.

