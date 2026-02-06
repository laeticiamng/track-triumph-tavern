

# Weekly Music Awards — Plan d'implémentation complet

## Vision
Plateforme premium de concours musical hebdomadaire. Style Apple-like, mobile-first. Juridiquement un concours artistique basé sur le mérite, jamais un jeu de hasard.

---

## Phase 1 — Fondations & Design System
- **Design system premium** : palette sombre/claire minimaliste, typographie moderne, micro-interactions subtiles, aucune esthétique "casino"
- **Layout mobile-first** avec navigation responsive (bottom nav mobile, sidebar desktop)
- **Landing page premium** : hero avec vidéo/animation, section "Comment ça marche" (3 étapes visuelles), section catégories, CTA inscription
- **Pages légales** (CGU, Privacy RGPD, Règlement concours, Cookies) — versions génériques MVP
- **Auth** : inscription email + mot de passe, login, vérification email obligatoire, redirection post-auth

## Phase 2 — Base de données & Backend Core
- **Lovable Cloud** (Supabase) : tables principales avec RLS strict
  - `profiles` (artiste info, avatar, bio, liens sociaux)
  - `seasons`, `weeks` (calendrier concours avec périodes soumission/vote/résultats)
  - `categories` (Rap/Trap, Pop, Afro, Electronic, R&B, Lofi, Rock/Indé, Open)
  - `submissions` (titre, artiste, catégorie, audio, cover, statut modération)
  - `votes` + `vote_events` (audit trail anti-fraude, 1 vote/user/catégorie/semaine)
  - `reward_pools` (budget sponsorisé, seuil, statut actif/inactif, fallback)
  - `user_roles` (admin/moderator/user — table séparée, security definer)
- **Storage** : bucket audio (extraits 30-60s) + bucket covers
- **Seed data** : catégories, 1 saison, 1 semaine active

## Phase 3 — Soumissions & Modération
- **Formulaire de soumission** (Pro/Elite uniquement) : titre, artiste, catégorie, tags, description, upload audio extrait (obligatoire), cover image (obligatoire), lien externe optionnel, case déclaration droits + règlement
- **Player audio intégré** pour écoute des extraits
- **Modération admin** : liste soumissions pending, approve/reject en 1 clic, motif de rejet
- **Page Explorer** : parcourir les sons approuvés, filtres par catégorie/semaine, tri par popularité/récent
- **Page détail soumission** : player, infos artiste, votes, commentaires

## Phase 4 — Système de Vote
- **Vote mobile-first** : écouter + voter en 1 clic par catégorie
- **Règles strictes** : 1 vote/user/catégorie/semaine, uniquement pendant période vote, compteur votes restants (Free = 5/semaine)
- **Notes secondaires optionnelles** : originalité, production, émotion
- **Commentaire optionnel** sur chaque vote
- **Anti-fraude** : rate limiting (edge function), détection rafales/IP clusters, audit trail complet, invalidation votes suspects
- **Edge functions** : `cast_vote` avec validation serveur complète

## Phase 5 — Scoring, Résultats & Hall of Fame
- **Calcul score** : somme votes validés + bonus jury optionnel (plafonné à 15%)
- **Edge functions** : `compute_results`, `publish_results`
- **Page Résultats** : podium Top 3 par catégorie, animation de révélation, option Grand Gagnant toutes catégories
- **Hall of Fame** : archives de tous les gagnants par semaine/saison
- **Page "Méthode de classement"** : explication transparente du scoring
- **Export CSV gagnants** pour admin

## Phase 6 — Abonnements & Monétisation (Stripe)
- **3 plans** : Free (0€), Pro (9,99€/mois), Elite (19,99€/mois) + options annuelles
- **Page Pricing** premium avec comparaison des features
- **Stripe Subscriptions** via intégration Lovable
- **Gating** : soumissions réservées Pro/Elite, votes limités Free (5/sem), commentaires limités Free (5/sem)
- **Aucun avantage compétitif payant** — les abonnements offrent uniquement des services SaaS

## Phase 7 — Profils Artistes & Analytics
- **Profil artiste public** : bio, photo, banner, liens (Spotify/Apple/YouTube/SoundCloud), historique participations, badges
- **Dashboard utilisateur** : mes soumissions, mes votes, mes résultats
- **Analytics Pro** : écoutes, votes reçus, lien de partage tracké
- **Analytics Elite** : stats jour par jour, rétention écoute, sources trafic
- **Page artiste premium** (Pro/Elite) avec personnalisation

## Phase 8 — Reward Pool & Récompenses
- **Système "Reward Pool Sponsored Threshold"** : budget sponsorisé, jamais cagnotte des participants
- **Affichage** : "Cash Rewards: ACTIVE" ou "INACTIVE" selon seuil atteint
- **Fallback rewards** automatiques si seuil non atteint (plugins, coaching, visibilité, badge)
- **Admin** : définir seuil, montants Top 1/2/3, gérer sponsors, activer fallback
- **Edge function** : `update_reward_pool`

## Phase 9 — Admin Dashboard Complet
- **Gestion semaines** : créer/éditer semaines, définir périodes, publier résultats
- **Modération** : soumissions, commentaires, utilisateurs
- **Fraud Monitoring** : votes suspects, utilisateurs suspects, patterns détectés, logs détaillés, exports CSV
- **Reward Pool management** : sponsors, seuils, montants
- **Gestion utilisateurs** : rôles, bans, vérification

## Phase 10 — Features Elite & Polish
- **Feedback IA structuré** (vibe, structure, prod, suggestions) via Lovable AI
- **Kit marketing automatique** : texte promo, story IG, miniatures
- **Press Kit / EPK export PDF**
- **Section "Découverte Elite"** (hors compétition, mise en avant)
- **Badge Elite** visible sur profil
- **Micro-interactions** et animations finales
- **Tests end-to-end** du parcours complet

---

## Notes techniques
- **React + Vite + Tailwind + shadcn/ui** (stack Lovable)
- **Lovable Cloud** pour auth, base de données, storage, edge functions
- **Stripe** pour abonnements
- **RLS strict** sur toutes les tables
- **Mobile-first** sur chaque page
- Chaque phase sera implémentée séquentiellement pour garantir la qualité

