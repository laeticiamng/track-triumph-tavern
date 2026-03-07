

# AUDIT V5 — Post-corrections — 7 mars 2026

## RESUME EXECUTIF

Toutes les corrections P0/P1/P2 des audits V3 et V4 ont ete appliquees avec succes :
- Email aligne sur `contact@weeklymusicawards.com` dans About.tsx et Footer.tsx
- `.maybeSingle()` applique dans HeroSection, Explore, Vote, Results, Compete
- auth-schemas.ts nettoye (imports i18n morts retires)
- i18n `compete.play` / `compete.pause` en place dans les 3 langues
- TikTok retire du footer
- Partial unique index `idx_weeks_single_active` en place

**Cependant, 5 fichiers utilisent encore `.single()` pour la requete active week** — ce sont des cas identiques au bug corrige dans V4 mais qui n'ont pas ete traites :
1. `src/pages/Badges.tsx:36`
2. `src/hooks/use-active-week.ts:15`
3. `src/pages/LiveReveal.tsx:315`
4. `src/components/rewards/RewardPoolBanner.tsx:16`
5. `src/pages/Stats.tsx:56`

La contrainte unique DB empeche 2 semaines actives, mais `.single()` crashe aussi quand il y a **0 resultat** (erreur PGRST116). Seul `use-active-week.ts` gere cette erreur manuellement (code `!== "PGRST116"`), les autres non.

De plus, la timeline About mentionne encore "Beta ouverte" (P3 non traite).

**Verdict : OUI — GO-LIVE AUTORISE**
**Note globale : 17/20**

## CORRECTIONS RESTANTES

### P1 — `.single()` restants sur requetes active week

| Fichier | Ligne | Risque |
|---|---|---|
| `src/pages/Badges.tsx` | 36 | Crash si 0 semaine active |
| `src/hooks/use-active-week.ts` | 15 | Gere manuellement PGRST116 mais devrait utiliser `.maybeSingle()` pour coherence |
| `src/pages/LiveReveal.tsx` | 315 | Crash si 0 semaine active |
| `src/components/rewards/RewardPoolBanner.tsx` | 16 | Crash si 0 semaine active |
| `src/pages/Stats.tsx` | 56 | Crash si 0 semaine active |

**Action** : Remplacer `.single()` par `.maybeSingle()` dans les 5 fichiers. Pour `use-active-week.ts`, simplifier en retirant le check `PGRST116` devenu inutile.

### P3 — Timeline "Beta ouverte" dans About

**Action** : Changer les cles i18n `aboutPage.betaOpen` dans fr/en/de :
- FR : "Bêta ouverte" → "Lancement"  
- EN : "Open beta" → "Launch"
- DE : "Offene Beta" → "Start"

Et les descriptions correspondantes pour retirer la notion de test/beta.

## PLAN D'IMPLEMENTATION

1. Fix `.single()` → `.maybeSingle()` dans les 5 fichiers restants
2. Simplifier `use-active-week.ts` (retirer le check PGRST116 manuel)
3. Mettre a jour les 3 cles i18n `betaOpen` / `betaOpenDesc` pour retirer "Beta"

Estimation : 5 minutes de corrections.

