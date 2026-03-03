

## Ajouter un filtre de période (7j / 30j / 90j) au dashboard analytics admin

### Modifications dans `src/components/admin/AnalyticsTab.tsx`

1. Ajouter un état `period` (7 | 30 | 90), défaut 30
2. Ajouter un `ToggleGroup` (ou `Select`) en haut du composant avec les 3 options
3. Remplacer le `subDays(new Date(), 30)` codé en dur par `subDays(new Date(), period)`
4. Adapter le `groupByDay` pour pré-remplir `period` jours au lieu de 30
5. Mettre `period` dans le `useEffect` deps pour recharger au changement
6. Mettre à jour le titre "Analytics (X derniers jours)" dynamiquement

Composant utilisé : `ToggleGroup` + `ToggleGroupItem` déjà disponibles dans le projet.

Aucune migration DB, aucun nouveau fichier. Un seul fichier modifié.

