
# Audit Premium des outils IA et pages -- Corrections

## Etat actuel par feature IA

| Outil IA | Accessible a | Gate Frontend | Gate Backend | Probleme |
|----------|-------------|---------------|--------------|----------|
| Chatbot (AIChatbot) | TOUS | Aucun gate | Aucun auth, aucun tier check | Ouvert a tous, meme non connectes. Pas de restriction par tier |
| Suggestions de tags (AITagSuggest) | Tous les soumetteurs | Aucun gate (dans Compete.tsx) | Aucun auth, aucun tier check | Accessible a tous ceux qui soumettent, mais la soumission est gate Pro/Elite. OK par transitivite, mais le backend est ouvert |
| Recommandations IA (AIRecommendations) | TOUS connectes | `if (user)` seulement | Auth OK, aucun tier check | Accessible a tous les utilisateurs connectes, meme Free |
| Resume IA des votes (AIVoteSummary) | Pro + Elite | `tier === "pro" \|\| tier === "elite"` | Auth OK, aucun tier check backend | Gate frontend OK mais le backend n'a aucune verification de tier. Un utilisateur Free peut appeler directement l'edge function |
| Feedback IA (AIFeedback) | Elite | `tier === "elite"` | Auth OK, aucun tier check backend | Gate frontend OK mais le backend n'a aucune verification de tier |
| Stats graphiques (VoteStatsChart) | Pro + Elite | `tier !== "free"` | N/A (requete directe) | OK |
| Banner upload | Elite | `tier === "elite"` | N/A (storage direct) | OK |

## 5 problemes a corriger

### 1. Chatbot IA accessible a TOUS sans restriction
`AIChatbot` est rendu dans `Layout.tsx` pour TOUT le monde. L'edge function `ai-chat` n'a ni authentification ni verification de tier. N'importe qui peut l'utiliser.

**Correction :** 
- Dans `Layout.tsx`, conditionner l'affichage du chatbot aux utilisateurs Pro/Elite
- Ajouter l'auth + tier check dans `ai-chat/index.ts`

### 2. Recommandations IA accessibles aux Free
`AIRecommendations` dans `Vote.tsx` est affiche pour tout utilisateur connecte (`if (user)`). L'edge function `ai-recommendations` ne verifie pas le tier.

**Correction :**
- Dans `Vote.tsx`, conditionner aux Pro/Elite
- Ajouter un tier check dans `ai-recommendations/index.ts`

### 3. Backend des edge functions IA sans verification de tier
Les edge functions `ai-vote-summary`, `ai-feedback`, `ai-chat`, `ai-recommendations` et `ai-suggest-tags` ne verifient pas le tier de l'utilisateur. Un utilisateur Free peut contourner le frontend et appeler directement les endpoints.

**Correction :** Ajouter dans chaque edge function IA (sauf `ai-suggest-tags` qui est gate par la soumission) un appel a `check-subscription` pour verifier le tier avant de traiter la requete.

### 4. VoteButton sur SubmissionDetail sans infos de tier/commentaires
Dans `SubmissionDetail.tsx`, le `VoteButton` est rendu sans passer `tier`, `commentsUsed`, `commentsMax`. Il utilise les valeurs par defaut (`tier="free"`, `commentsMax=0`) ce qui empeche tout commentaire meme pour les Pro/Elite.

**Correction :** Ajouter `useSubscription` et `useVoteState` dans `SubmissionDetail.tsx` et passer les props au `VoteButton`.

### 5. Features IA non listees dans les plans /pricing
Les outils IA (chatbot, recommandations, resume IA) ne sont pas mentionnes dans `subscription-tiers.ts`. Les utilisateurs ne savent pas qu'ils y ont droit.

**Correction :** Ajouter les features IA dans les listes de chaque plan :
- Pro : "Resume IA des votes recus", "Recommandations IA personnalisees", "Chatbot assistant musical"
- Elite : idem + "Feedback IA structure" (deja present)

---

## Fichiers a modifier

1. **`src/lib/subscription-tiers.ts`** -- Ajouter les features IA dans les listes Pro et Elite
2. **`src/components/layout/Layout.tsx`** -- Conditionner le chatbot au tier Pro/Elite
3. **`src/pages/Vote.tsx`** -- Conditionner les recommandations au tier Pro/Elite
4. **`src/pages/SubmissionDetail.tsx`** -- Passer tier/commentsUsed/commentsMax au VoteButton
5. **`supabase/functions/ai-chat/index.ts`** -- Ajouter auth + tier check (Pro/Elite)
6. **`supabase/functions/ai-recommendations/index.ts`** -- Ajouter tier check (Pro/Elite)
7. **`supabase/functions/ai-vote-summary/index.ts`** -- Ajouter tier check (Pro/Elite)
8. **`supabase/functions/ai-feedback/index.ts`** -- Ajouter tier check (Elite uniquement)

### Methode de verification du tier dans les edge functions

Chaque edge function IA appelera `check-subscription` en interne via le Supabase client pour recuperer le tier de l'utilisateur, puis refusera l'acces si le tier ne correspond pas au minimum requis.

