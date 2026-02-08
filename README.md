# 🎵 Track Triumph

Plateforme de compétition musicale communautaire — soumettez vos morceaux, votez pour vos favoris, grimpez dans le classement.

## Fonctionnalités

- **Soumissions** : Les artistes Pro et Elite soumettent un morceau par semaine dans une catégorie musicale
- **Votes communautaires** : Feed immersif style TikTok avec notation multi-critères (émotion, originalité, production)
- **Abonnements** : 3 plans — Free (5 votes/semaine), Pro (9,99 €/mois), Elite (19,99 €/mois)
- **Classements** : Résultats hebdomadaires par catégorie avec score pondéré
- **Hall of Fame** : Historique des gagnants par saison
- **Profils artistes** : Avatar, bannière, liens sociaux, statistiques de votes
- **IA intégrée** : Feedback structuré, recommandations personnalisées, chatbot musical, résumé des votes
- **Administration** : Dashboard admin, modération des soumissions, détection de fraude
- **Reward Pool** : Cagnotte hebdomadaire pour les top 3

## Pages principales

| Route | Description |
|-------|-------------|
| `/` | Accueil (landing page) |
| `/explore` | Explorer les catégories et soumissions |
| `/vote` | Feed de vote immersif |
| `/compete` | Soumettre un morceau |
| `/results` | Classements de la semaine |
| `/pricing` | Plans et abonnements |
| `/hall-of-fame` | Palmarès des gagnants |
| `/profile` | Profil utilisateur |
| `/admin` | Tableau de bord admin |

## Stack technique

- **Frontend** : React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Backend** : Lovable Cloud (authentification, base de données, stockage, fonctions serveur)
- **Paiements** : Stripe (checkout, portail client, webhooks)

## Développement local

```sh
# Cloner le dépôt
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Installer les dépendances
npm i

# Lancer le serveur de développement
npm run dev
```

## Déploiement

Ouvrez [Lovable](https://lovable.dev) → **Share** → **Publish**.

Pour connecter un domaine custom : **Project** → **Settings** → **Domains** → **Connect Domain**.
