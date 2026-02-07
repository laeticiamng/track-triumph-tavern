

# Audit UX complet -- Weekly Music Awards

## 1) Test "3 secondes"

- **En 3 secondes, je crois que cette plateforme sert a** : Un concours de musique gratuit ou on soumet des morceaux et les gens votent
- **Public cible** : Artistes musicaux independants / amateurs francophones
- **2 confusions possibles** :
  1. On pourrait croire que c'est une plateforme d'ecoute / streaming type SoundCloud
  2. "100% gratuit" en gros + page Pricing avec abonnements a 9.99/19.99 euros -- contradiction qui casse la confiance immediatement
- **Note de clarte** : 6/10 -- Le message principal est clair mais la contradiction gratuit/payant est tres deroutante

## 2) Parcours utilisateur

| Etape | Ce que j'ai essaye | Ce qui s'est passe | Ressenti | Blocage | Attendu |
|-------|-------------------|---------------------|----------|---------|---------|
| Decouverte | Lire le hero | Texte clair, badge semaine en haut, gradient violet | Propre, premium | Rien | OK |
| Premier clic | "Participer gratuitement" | Redirige vers /auth?tab=signup | Logique | Rien | OK |
| Inscription | Remplir le formulaire | Formulaire simple, mail+mdp | Correct | Pas de Google/social login, friction | Connexion sociale |
| Explorer | Aller sur /explore | Page vide "Aucune soumission" | Deceevant, plateforme fantome | Pas de contenu, pas de demo | Des exemples ou du contenu seed |
| Vote | Aller sur /vote (bottom nav) | Page vide "Aucune soumission" | Idem, rien a voir | Idem | Du contenu |
| Concours | /compete | "Abonnement requis" pour soumettre (Free ne peut pas) | Frustration -- on m'a dit "gratuit" ! | Contradiction majeure | Pouvoir soumettre gratuitement OU ne pas dire 100% gratuit |
| Pricing | /pricing | 3 plans, Free/Pro/Elite | Correct visuellement | Le plan Free ne permet pas de soumettre -- le hero ment | Coherence du messaging |
| Navigation retour | Bottom nav / header | Fonctionne bien, pas de perte | OK | Rien | OK |

## 3) Audit confiance -- Note : 4/10

**Ce qui casse la confiance :**
- **Contradiction majeure** : Hero dit "100% gratuit", "Participation gratuite", "Aucun frais" mais il faut un abonnement Pro (9.99 euros/mois) pour soumettre un morceau -- c'est trompeur
- **Plateforme vide** : Aucune soumission visible, aucun artiste, aucun contenu -- impression de site fantome / arnaque
- **Pas de preuve sociale** : Zero temoignages, zero statistiques (nombre d'artistes, de votes), zero screenshots
- **Pas de visage humain** : Qui est derriere ? Pas de page "A propos", pas de photo d'equipe
- **Contact** : Seulement un mailto dans le footer, pas de formulaire, pas de chat
- **Pas de FAQ** : Questions courantes sans reponse
- **"Recompenses sponsorisees"** : Aucune info sur les sponsors, montants, historique de versement
- **Hall of Fame** : Probablement vide aussi -- renforce l'impression de coquille vide
- **Aucune mention legale d'entreprise** dans le footer (SIREN, adresse)

## 4) Audit comprehension et guidance

- **Premier clic evident ?** OUI -- "Participer gratuitement" est clair et bien place
- **Apres le premier clic ?** NON -- On arrive sur inscription, mais ensuite ? Pas de onboarding, pas de guide
- **Ou je me sens perdu** : Apres inscription, page Explore vide, page Vote vide, page Compete bloquee
- **Copies floues/inutiles** :
  - "Concours base sur le merite -- le classement ne depend d'aucun paiement" -- bien mais contredit par le paywall de soumission
  - "Recompenses sponsorisees" -- sponsorisees par qui ? Combien ?
  - "Kit marketing automatique" (Elite) -- c'est quoi exactement ?
  - "Feedback IA structure" -- vague pour un non-initie

## 5) Audit visuel

- **Ce qui fait premium** : Gradient hero violet, typographie Space Grotesk, animations fluides framer-motion, glass effect header, bottom nav propre
- **Ce qui fait cheap** : Pages vides sans contenu, pas d'images/illustrations, pas de visuels de mockup, footer minimaliste
- **Ce qui est trop charge** : Rien -- c'est plutot trop vide
- **Ce qui manque** : Visuels (mockups, screenshots), preuve sociale, contenu seed, illustrations, une section "Pourquoi nous choisir", FAQ
- **Lisibilite mobile** : OK globalement -- bottom nav fonctionnelle, textes lisibles, pas de chevauchement visible

## 6) Liste des problemes

| Probleme | Ou | Gravite | Impact utilisateur | Suggestion |
|----------|-----|---------|-------------------|------------|
| Hero dit "100% gratuit" mais soumission payante | Hero + Compete | Bloquant | Perte de confiance totale, sentiment d'arnaque | Soit rendre la soumission gratuite, soit changer le hero en "Votez gratuitement, soumettez avec Pro" |
| Aucun contenu / plateforme vide | Explore, Vote | Bloquant | Aucune valeur percue, abandon immediat | Ajouter du contenu seed (demo) ou un etat vide engageant |
| Pas de preuve sociale | Landing | Majeur | Pas de confiance | Ajouter compteurs, temoignages, logos sponsors |
| Pas de section "A propos" | Global | Majeur | Qui etes-vous ? | Ajouter une section ou page About |
| Pas de FAQ | Global | Majeur | Questions sans reponse | Ajouter une FAQ sur la landing |
| "Recompenses sponsorisees" sans details | Hero, Results | Moyen | Promesse vide | Montrer montants, sponsors passes |
| Pas de social login (Google) | Auth | Moyen | Friction a l'inscription | Ajouter Google OAuth |
| Pas d'onboarding post-inscription | Post-auth | Moyen | Utilisateur perdu | Ajouter un flow d'onboarding |
| Bottom nav "Vote" vs Header "Explorer" -- duplication confuse | Navigation | Moyen | 2 pages qui font presque la meme chose | Unifier ou differencier clairement |
| Footer sans mentions legales entreprise | Footer | Moyen | Manque de legalite | Ajouter SIREN/adresse |

## 7) Top 15 ameliorations

### P0 -- Bloquants avant publication

1. **Corriger le messaging "100% gratuit"** : Le hero doit refle ter la realite. Proposition : "Le concours musical ouvert a tous" avec sous-titre "Votez gratuitement. Soumettez avec un abonnement Pro." Supprimer les badges trompeurs "Aucun frais" / "Participation gratuite" ou les contextualiser ("Vote gratuit, soumission des 9.99 euros/mois").

2. **Ajouter du contenu seed / etat vide engageant** : Quand Explore/Vote sont vides, afficher un visuel attractif avec un countdown vers la prochaine semaine, ou des soumissions d'exemple en mode demo.

3. **Ajouter une section preuve sociale sur la landing** : Compteurs animes (meme a zero pour l'instant avec un texte "Lancement imminent"), ou une section "Comment ca marche" avec des visuels/mockups au lieu d'icones seules.

4. **Ajouter une FAQ** sur la landing page : 5-6 questions cles (C'est vraiment gratuit ? Qui peut participer ? Comment sont calculees les notes ? Quelles recompenses ?).

5. **Ajouter une page/section "A propos"** : Qui est derriere le projet, quelle est la mission, comment fonctionne le financement des recompenses.

### P1 -- Ameliore fortement la conversion

6. **Ameliorer le CTA du hero** : Au lieu de "Participer gratuitement" (trompeur), utiliser "Decouvrir le concours" ou "Creer mon compte gratuit" avec une mention claire en dessous.

7. **Ajouter une section avantages/differenciateurs** entre HowItWorks et Categories : "Pourquoi Weekly Music Awards ?" avec 3-4 points (Meritocratique, Anti-fraude IA, Recompenses reelles, Communaute).

8. **Ameliorer les etats vides** : Explore/Vote vides doivent montrer un CTA engageant + illustration, pas juste une icone triste.

9. **Ajouter des visuels/illustrations** : La landing est 100% texte + icones. Ajouter au moins un mockup ou une image d'ambiance dans le hero.

10. **Preciser les recompenses** : Section dediee sur la landing montrant les montants, le fonctionnement du reward pool, les sponsors eventuels.

### P2 -- Polish premium

11. **Ajouter une animation de hero plus dynamique** : Waveform animee ou equalizer visuel derriere le titre pour renforcer l'identite musicale.

12. **Dark/Light mode toggle** : Le site force le dark mode (class="dark" sur html) sans option de switch.

13. **Ameliorer le footer** : Ajouter liens reseaux sociaux, adresse/mentions legales, logo plus visible.

14. **Ajouter un badge/bandeau "Lancement Beta"** : Pour justifier le manque de contenu et creer de l'urgence/exclusivite.

15. **Micro-interactions sur les cards de categories** : Ajouter un compteur "X artistes cette semaine" sous chaque categorie pour donner de la vie.

## 8) Verdict final

- **Publiable aujourd'hui ?** NON

- **5 raisons exactes :**
  1. Le messaging "100% gratuit" est trompeur -- la soumission necessite un abonnement payant
  2. La plateforme est completement vide -- aucun contenu a decouvrir
  3. Zero preuve sociale / credibilite -- qui etes-vous ? ou sont les sponsors ?
  4. Pas de FAQ -- les questions critiques restent sans reponse
  5. Pas de page A propos / mentions legales completes

- **Phrase HERO ideale** : "Soumettez votre musique. La communaute vote. Montez sur le podium."

- **CTA ideal** : "Creer mon compte gratuit" (si le vote est gratuit) ou "Decouvrir le concours" (plus honnete)

---

## Plan d'implementation des corrections

### Fichiers a modifier :

1. **`src/components/landing/HeroSection.tsx`**
   - Changer le titre H1 : "Le concours musical ouvert a tous" (supprimer "100% gratuit")
   - Modifier les badges : "Vote gratuit" / "Base sur le merite" / "Recompenses chaque semaine"
   - Changer le CTA principal : "Decouvrir le concours" pointant vers /explore
   - Changer le CTA secondaire : "Creer mon compte" pointant vers /auth?tab=signup
   - Supprimer la mention "Aucun frais" trompeuse

2. **`src/components/landing/CTASection.tsx`**
   - Adapter le texte pour etre coherent avec le nouveau messaging

3. **Creer `src/components/landing/SocialProof.tsx`** (nouvelle section)
   - Compteurs animes : Artistes inscrits, Votes cette semaine, Morceaux soumis
   - Fetch des vraies donnees depuis la DB

4. **Creer `src/components/landing/FAQ.tsx`** (nouvelle section)
   - 6 questions/reponses avec composant Accordion
   - Questions cles sur la gratuite, la participation, les recompenses, l'anti-fraude

5. **Creer `src/components/landing/WhyUs.tsx`** (nouvelle section)
   - 4 blocs : Meritocratique, Anti-fraude IA, Recompenses, Communaute

6. **`src/pages/Index.tsx`**
   - Ajouter les nouvelles sections dans l'ordre : Hero > HowItWorks > WhyUs > Categories > SocialProof > FAQ > CTA > Footer

7. **`src/pages/Explore.tsx` et `src/pages/Vote.tsx`**
   - Ameliorer les etats vides avec illustrations SVG, countdown vers prochaine semaine, CTA engageant

8. **`src/components/landing/HowItWorks.tsx`**
   - Ajouter une etape gratuite claire : "1. Creez un compte (gratuit) 2. Ecoutez et Votez (gratuit) 3. Soumettez avec Pro"

9. **`src/components/layout/Footer.tsx`**
   - Ajouter liens reseaux sociaux, mention "Beta", et lien A propos

10. **Creer `src/pages/About.tsx`** + route dans App.tsx
    - Page simple : Mission, equipe, fonctionnement des recompenses

