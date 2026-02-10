# Audit technique — Track Triumph Tavern

_Date : 2026-02-10_

## 1) État général du projet

Le projet est **fonctionnel en build production** et les tests Vitest existants passent.

### Vérifications exécutées
- `npm run test` ✅
- `npm run build` ✅
- `npm run lint` ❌ (nombreuses dettes TypeScript/ESLint historiques)

## 2) Constat détaillé

### Front-end (React + TypeScript + Vite + Tailwind)
- Routing principal en place avec routes publiques, admin et redirections FR.
- Pages légales et marketing présentes (`about`, `terms`, `privacy`, etc.).
- Le pied de page contenait un TODO explicite concernant la section sociale.
- Le composant de sitemap utilisait un `let` inutile (signalé par ESLint `prefer-const`).

### Backend Supabase (Edge functions + SQL)
- Les fonctions métier sont présentes (votes, checkout, résultats, anti-fraude, etc.).
- Dette de typage notable (`any`) dans plusieurs fonctions et pages.

## 3) Éléments incomplets traités

1. **Footer complété** : ajout de la section “Suivez-nous” avec icônes/CTA externes.
2. **Sitemap durci** : correction `let -> const` pour conformité lint basique.

## 4) Dette technique restante (non bloquante build)

- Lint global non vert à cause de:
  - `@typescript-eslint/no-explicit-any` (frontend + edge functions),
  - quelques règles `react-hooks/exhaustive-deps`,
  - règles shadcn/fast-refresh dans des composants UI,
  - quelques anomalies ponctuelles (e.g. `no-unused-expressions`).

## 5) Recommandations de suite (priorisées)

1. Créer des types partagés pour payloads Supabase (votes, rewards, moderation, fraud scan).
2. Corriger les erreurs lint “hard fail” par lots fonctionnels (admin, results, supabase/functions).
3. Garder les warnings fast-refresh comme dette basse priorité (non bloquants).
4. Ajouter tests d’intégration UI (routes critiques: vote/compete/results/admin).

