

# AUDIT BETA-TESTEUR NON TECHNIQUE — Weekly Music Awards

---

## 1. RESUME EXECUTIF

### Ce qu'un novice comprend en arrivant
Un visiteur qui arrive pour la premiere fois comprend rapidement qu'il s'agit d'un **concours musical hebdomadaire** avec des gains financiers (200 EUR/semaine). Le hero est clair sur la promesse principale. Le badge "Concours en cours" avec le compte a rebours cree un sentiment d'urgence efficace. Le branding est propre et professionnel.

### Ce qu'il ne comprend PAS
1. **Le rapport entre "concours musical" et "inclusion europeenne"** — Le badge "Inclusion europeenne" dans le hero n'est pas explique. Un novice ne sait pas ce que cela signifie dans le contexte d'un concours musical.
2. **Pourquoi il y a autant de sections sur la homepage** — La page d'accueil est TRES longue (Hero > ActivityFeed > HowItWorks > WeeklyPodium > SocialMission > MentorshipResidency > WhyParticipate > Categories > ProgramsOverview > SocialProof > CTA > Footer). Un novice scroll pendant 30 secondes sans fin.
3. **Ce qui est reel vs "en preparation"** — Les pages Mentor Match, Virtual Residency, Cultural Exchange, Impact Dashboard existent dans la navigation et la homepage, mais sont des programmes futurs. Le visiteur clique, decouvre que rien ne fonctionne, et perd confiance.
4. **Qui est derriere la plateforme** — "EMOTIONSCARE SASU" dans le footer ne dit rien a personne. Le lien entre une SASU et un concours musical est opaque.
5. **Quel est le modele economique** — "200 EUR / semaine finances par nos sponsors" mais aucun sponsor visible. Cela sonne creux.

### Les 5 plus gros freins

| # | Frein |
|---|-------|
| 1 | **Homepage trop longue et repetitive** — 12 sections, beaucoup de redondance entre SocialMission, MentorshipResidency, ProgramsOverview, WhyParticipate. Le visiteur decroche. |
| 2 | **4 pages "fantomes"** (Mentor Match, Virtual Residency, Cultural Exchange, Impact Dashboard) prominentes dans la navigation et la homepage mais 100% non fonctionnelles. Cela donne une impression de produit inacheve. |
| 3 | **"Finances par nos sponsors" sans aucun sponsor visible** — Affirmation non credible, repetee plusieurs fois. |
| 4 | **Contact page : texte hardcode en francais** — "Lun - Ven : 9h00 - 18h00 · Reponse sous 24-48h ouvrees" reste en francais meme en anglais/allemand. |
| 5 | **Le CTA principal change selon le contenu** ("Decouvrir le concours" vs "Rejoindre le concours") sans que le visiteur comprenne pourquoi. Si aucun contenu approuve n'existe, le CTA dit "Rejoindre le concours" et renvoie vers signup, ce qui est premature — le visiteur n'a encore rien vu. |

### Les 5 priorites absolues

| # | Priorite |
|---|----------|
| 1 | **Raccourcir la homepage** : fusionner/supprimer les sections redondantes. Passer de 12 sections a 7-8 maximum. |
| 2 | **Retirer les 4 programmes futurs de la navigation prominente** : les deplacer dans une sous-section discrete "A venir" ou les supprimer de la homepage. |
| 3 | **Reformuler "finances par nos sponsors"** en quelque chose de credible sans nommer de sponsors inexistants. |
| 4 | **Traduire les textes hardcodes de la page Contact**. |
| 5 | **Simplifier le hero** : un seul CTA clair, supprimer le badge "Inclusion europeenne" qui ne parle pas a un novice. |

---

## 2. TABLEAU D'AUDIT COMPLET

| Prio | Page / Zone | Probleme observe | Ressenti novice | Impact | Recommandation | Faisable ? |
|------|-------------|------------------|-----------------|--------|----------------|-----------|
| P0 | Homepage | 12 sections, scroll interminable | "C'est trop long, je ne sais plus ou je suis" | Abandon, perte d'attention | Supprimer ProgramsOverview (doublon de SocialMission+MentorshipResidency), fusionner WhyParticipate avec HowItWorks | Oui |
| P0 | Homepage / Hero | Badge "Inclusion europeenne" non explique | "C'est quoi l'inclusion europeenne dans un concours musical ?" | Confusion | Remplacer par un badge plus concret : "Ouvert a tous" ou "Artistes europeens" | Oui |
| P0 | Homepage / SocialMission + MentorshipResidency + ProgramsOverview | 3 sections pour des programmes non fonctionnels, tres prominentes | "Il y a plein de trucs mais rien ne marche quand je clique" | Perte de confiance majeure | Regrouper en UNE section discrete "Nos engagements — bientot disponible" | Oui |
| P0 | WhyParticipate | "200 EUR, 100 EUR et 50 EUR pour les trois premiers, finances par nos sponsors" | "Quels sponsors ? C'est louche." | Perte de credibilite | Reformuler : "finances par la cagnotte communautaire" ou "par les abonnements Pro/Elite" | Oui |
| P0 | Contact.tsx L161 | "Lun - Ven : 9h00 - 18h00 · Reponse sous 24-48h ouvrees" hardcode en francais | Texte francais en mode anglais/allemand | Incohérence i18n, impression d'amateurisme | Ajouter cles i18n | Oui |
| P1 | Homepage ordering | SocialMission et MentorshipResidency places AVANT WhyParticipate et CategoriesSection | "Je dois scroller a travers des programmes futurs avant de voir les categories du concours actuel" | Friction, depriorisation du contenu reel | Remonter CategoriesSection et WhyParticipate, descendre les programmes | Oui |
| P1 | Hero | Deux CTAs dont le secondaire change (Creer mon compte / En savoir plus) selon hasContent | Confusion : pourquoi le bouton change ? | Friction cognitive | Fixer : CTA1 = "Decouvrir les morceaux", CTA2 = "Comment ca marche ?" | Oui |
| P1 | Footer | 5 colonnes dont "Programmes" avec 4 liens vers pages non fonctionnelles | "Encore des liens qui menent a des pages vides" | Erosion de confiance | Fusionner Programmes dans Navigation avec label "(Bientot)" ou retirer | Oui |
| P1 | BottomNav mobile | 5 items : Accueil, Decouvrir, Soumettre, Resultats, Profil/Connexion | "Soumettre" emmene vers une page qui demande un abonnement payant. Frustrant. | Friction mobile | Remplacer "Soumettre" par "Voter" dans la nav mobile | Oui |
| P1 | Header desktop | "Soumettre" dans la nav principale est un paywall | Novice clique, decouvre qu'il faut payer | Deception | Renommer en "Participer" ou garder mais ajouter un indicateur "Pro" | Oui |
| P1 | Pricing | "Le plus populaire" badge sur Pro sans preuve | "Populaire d'apres qui ? Il y a combien d'utilisateurs ?" | Credibilite | Retirer le badge "Le plus populaire" ou le justifier avec des chiffres reels | Oui |
| P1 | SocialProof | Se masque si 0 donnees — bon. Mais si peu de donnees (ex: 3 artistes, 0 votes), affiche "3" ce qui est ridicule | "3 artistes inscrits... c'est vide" | Contre-productif | Masquer si < seuil minimum (ex: 10) | Oui |
| P2 | ActivityFeed | Visible uniquement pour les utilisateurs connectes | Non-connecte ne voit rien, la section disparait, l'espace est vide | Section invisible pour le public cible (non connectes) | OK en termes de logique, mais un novice non connecte perd cette section sans le savoir — pas un probleme reel | Non |
| P2 | About page | Timeline : "Lancement bêta ouvert — En cours" | "C'est encore en beta ?" (contredit la strategie anti-MVP) | Contradiction avec les memories | Selon les memories, "beta" devrait etre retire. Reformuler | Oui |
| P2 | Contact page L163 | LinkedIn personnels de la dirigeante + LinkedIn entreprise | "C'est qui Laeticia Motongane ?" Un novice ne sait pas | Info non pertinente pour un novice | Retirer le LinkedIn personnel, garder uniquement le LinkedIn entreprise | Oui |
| P2 | CookieConsent | Apparait en position bottom-20 sur mobile, chevauche potentiellement le BottomNav | Cookies banner + sticky CTA + bottom nav = 3 elements superposes en bas d'ecran mobile | Clics parasites, frustration | Ajuster le z-index et le positionnement | Oui |
| P2 | Pricing page | Tableau comparatif en fin de page avec colonnes "Free / Pro / Elite" — les headers ne sont pas traduits | "Free" "Pro" "Elite" affiches tels quels sans traduction | Incohérence legere mais acceptable (noms de plans) | Acceptable, ce sont des noms propres | Non |
| P2 | HowItWorks | Etape 3 : "Avec un abonnement Pro, soumettez..." | "Ah, il faut payer pour participer vraiment ?" Deception | Le novice comprend qu'ecouter/voter est gratuit mais soumettre est payant. C'est honnete mais decevant. | Reformuler positivement : "Passez Pro pour soumettre vos morceaux et viser le podium" | Oui |
| P3 | Explore page | Mode toggle "Ecouter / Voter" — concept original mais pas evident | "C'est quoi la difference ?" | Legere confusion | Ajouter une micro-description sous le toggle | Non urgent |
| P3 | Pricing | Section "Pourquoi choisir Elite ?" en dessous du tableau comparatif | Redondance avec les features deja listees dans les cartes | Section de trop, un peu pushy | Laisser ou retirer, pas critique | Non urgent |
| P3 | Toutes pages | La police "font-display" est bien utilisee mais les titres h1 sont parfois tres grands sur mobile (text-4xl) | Titres un peu ecrasants sur petit ecran | UX mobile mineure | Reduire les titres h1 a text-3xl sur mobile | Oui |

---

## 3. AMELIORATIONS PRIORITAIRES A IMPLEMENTER IMMEDIATEMENT

### A. Homepage : supprimer la section ProgramsOverview
La section ProgramsOverview est un doublon exact des informations deja presentes dans SocialMissionSection et MentorshipResidencySection. 3 sections pour dire la meme chose = trop. Supprimer ProgramsOverview.

### B. Homepage : reordonner les sections
Nouvel ordre propose :
1. Hero
2. HowItWorks
3. WeeklyPodium
4. CategoriesSection (remonter — c'est le contenu reel)
5. WhyParticipate
6. SocialMissionSection (descendre)
7. MentorshipResidencySection (descendre)
8. SocialProof
9. CTASection
10. StickyMobileCTA + Footer

Supprimer : ActivityFeed de la homepage (visible uniquement pour les connectes, inutile en landing page) et ProgramsOverview (doublon).

### C. Hero : simplifier les badges
Remplacer le badge "Inclusion europeenne" par "Ouvert a tous les artistes" — plus concret et comprehensible.

### D. Contact.tsx : traduire les textes hardcodes
Ajouter des cles i18n pour les horaires et les labels LinkedIn.

### E. "Finances par nos sponsors" : reformuler
Remplacer dans toutes les occurrences par "finances par les abonnements de la communaute" — c'est plus honnete et correspond au modele economique reel (les Pro/Elite financent la cagnotte).

### F. SocialProof : seuil minimum
Ne pas afficher la section si le total des stats est < 10.

### G. BottomNav mobile : remplacer "Soumettre" par "Voter"
"Soumettre" est un paywall frustrant pour un novice. "Voter" est gratuit et plus engageant.

### H. About page : retirer "beta"
Remplacer "Lancement beta ouvert" par "Lancement" conformement a la strategie de credibilite.

---

## 4. PLAN D'IMPLEMENTATION

### Fichiers a modifier

1. **`src/pages/Index.tsx`** — Supprimer import ProgramsOverview, retirer ActivityFeed, reordonner sections
2. **`src/components/landing/HeroSection.tsx`** — Changer badge "Inclusion europeenne" en "Ouvert a tous"
3. **`src/components/landing/SocialProof.tsx`** — Ajouter seuil minimum (total > 10)
4. **`src/components/layout/BottomNav.tsx`** — Changer "Soumettre" (Compete) par "Voter" (Vote)
5. **`src/pages/Contact.tsx`** — Extraire textes hardcodes vers i18n
6. **`src/i18n/locales/fr.json`** — Reformuler "finances par nos sponsors", ajouter cles contact, changer badge hero, retirer "beta"
7. **`src/i18n/locales/en.json`** — Memes changements
8. **`src/i18n/locales/de.json`** — Memes changements
9. **`src/pages/About.tsx`** — Retirer "beta" de la timeline

### Textes a reecrire

| Localisation | Ancien | Nouveau (FR) |
|---|---|---|
| hero.badgeInclusion | "Inclusion europeenne" | "Ouvert a tous les artistes" |
| whyParticipate.prizeDesc | "...finances par nos sponsors" | "...finances par les abonnements de la communaute" |
| whyUs.rewardsDesc | "...finance par nos sponsors" | "...finances par les abonnements de la communaute" |
| aboutPage.betaOpen | "Lancement beta ouvert" | "Lancement" |
| contact.hours | (hardcode FR) | Cle i18n trilingue |
| contact.responseTime | (hardcode FR) | Cle i18n trilingue |

