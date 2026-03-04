

## Plan: Smooth CSS transition on theme change

Add a global CSS transition on `background-color`, `color`, and `border-color` to all elements when the theme toggles, so the switch feels fluid rather than instant.

### Changes

**`src/index.css`** — Add a utility class `.theme-transition` that applies smooth transitions to all elements:

```css
.theme-transition,
.theme-transition *,
.theme-transition *::before,
.theme-transition *::after {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
}
```

**`src/components/ThemeToggle.tsx`** — On toggle click, temporarily add `.theme-transition` to `<html>` for 400ms, then remove it. This avoids performance overhead during normal interactions (scroll, hover) while giving a smooth theme switch animation.

```typescript
const toggle = () => {
  document.documentElement.classList.add("theme-transition");
  setIsDark(prev => !prev);
  setTimeout(() => {
    document.documentElement.classList.remove("theme-transition");
  }, 400);
};
```

This approach is lightweight — no permanent transition overhead, respects `prefers-reduced-motion` (the existing media query will override with `0.01ms` duration), and works across all components automatically.

