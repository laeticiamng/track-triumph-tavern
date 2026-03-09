

## Plan: Sélecteur de thème 3 options (clair / sombre / système)

Remplacer le toggle binaire par un sélecteur cyclique à 3 états : `light` → `dark` → `system` → `light`.

### Changements

**`src/components/ThemeToggle.tsx`**
- Remplacer l'état `isDark: boolean` par `theme: "light" | "dark" | "system"`
- En mode `system`, écouter `window.matchMedia("(prefers-color-scheme: dark)")` pour appliquer la classe `dark` automatiquement
- Au clic, cycler entre les 3 modes avec la transition CSS existante
- Icones : Sun (light), Moon (dark), Monitor (system) — `Monitor` vient de lucide-react
- `localStorage.setItem("theme", theme)` pour persister le choix
- Ajouter un `useEffect` avec `matchMedia.addEventListener("change", ...)` pour le mode system

**`src/i18n/locales/fr.json`**, **`en.json`**, **`de.json`**
- Ajouter les clés `theme.light`, `theme.dark`, `theme.system` pour les aria-labels

### Logique

```text
Click cycle:  light → dark → system → light → ...

system mode:
  - Read prefers-color-scheme
  - Listen for OS changes
  - Apply dark/light accordingly
```

Pas de changement de base de données ni de CSS supplémentaire — la transition `.theme-transition` existante couvre déjà le changement.

