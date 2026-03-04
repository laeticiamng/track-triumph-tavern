

## Test Results: Theme Toggle on Landing Page

### What works well
- **Dark mode**: Looks polished and cohesive across all sections (hero, content, CTA, footer).
- **Toggle functionality**: Switching between modes works correctly, icon updates (sun/moon), and preference persists in localStorage.
- **Light mode content sections**: Cards, categories, FAQ, and footer all look clean with good contrast.

### Issues found in Light Mode

1. **Hero section**: The `bg-gradient-hero` applies a vibrant purple gradient (same as dark mode since the last edit changed it to `hsl(263, 65%, 52%) → hsl(300, 55%, 50%)`). All text is hardcoded `text-white` which works on the dark gradient, but the overall effect feels heavy and out of place in a "light" theme context.

2. **CTA section**: Same issue -- the `bg-gradient-hero` creates a very bold purple block. The "View plans" button (`border-white/30 text-white`) is nearly invisible against this gradient.

3. **"Learn more" button in Hero**: Uses `border-white/30 text-white` styling, making it barely visible against the gradient in light mode.

These are not blocking bugs since the gradient intentionally provides a dark background for white text (this is a design pattern). However, the contrast on outline buttons could be improved.

### Proposed Fixes

1. **Improve outline button contrast on gradient sections**: In both `HeroSection.tsx` and `CTASection.tsx`, increase the border opacity for the outline buttons from `border-white/30` to `border-white/50` so they're more visible against the gradient.

2. **No changes needed for the gradient itself**: The hero/CTA gradient is intentionally bold in both modes -- this is standard for landing pages (e.g., Spotify, Apple Music). Changing it to a pale gradient in light mode would make the white text unreadable.

### Files to modify
- `src/components/landing/HeroSection.tsx` -- line 126: `border-white/30` → `border-white/50`
- `src/components/landing/CTASection.tsx` -- line 51: `border-white/30` → `border-white/50`

