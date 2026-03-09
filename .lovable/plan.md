

# Plan: Make all 5 social features clearly visible from the homepage

## Current State
The homepage already includes `SocialMissionSection` (covers Inclusion Tracks, Cultural Exchange, Impact Dashboard) and `MentorshipResidencySection` (covers Mentor Match, Virtual Residency). These are placed after `CategoriesSection`, relatively far down the page. The hero section mentions nothing about the social/inclusion angle.

## Problem
1. **Hero section** only talks about "100% community-driven contest" and prizes — no mention of social mission, inclusion or European cultural exchange.
2. **No quick-access preview** — the 5 programs are buried below the fold in 2 dense sections. A first-time visitor scrolling fast could miss them entirely.
3. **Trust badges** in the hero only mention "free voting", "anti-fraud", "€200/week" — nothing about inclusion or cultural diversity.
4. **"How it works"** doesn't mention the social programs at all.
5. **Section ordering** places Social Mission and Mentorship after Categories, which feels like an afterthought rather than a core differentiator.

## Plan

### 1. Update Hero section to reflect the social positioning
- Add a 4th trust badge: "European Inclusion" or "Inclusion & Diversity" with a Heart/Globe icon
- Update `hero.subtitle` to mention social inclusion angle (e.g., "Submit your music, celebrate European diversity, get community votes and win up to €200 every week.")
- Add i18n keys in FR/EN/DE

### 2. Add a new "5 Programs at a glance" quick-nav strip
Create a new lightweight component `ProgramsOverview` placed right after `WhyParticipate` (before `CategoriesSection`). This is a compact horizontal strip with 5 icon cards linking to each program:
- Inclusion Tracks → `/categories/inclusion`
- Cultural Exchange → `/cultural-exchange`
- Mentor Match → `/mentor-match`
- Virtual Residency → `/virtual-residency`
- Impact Dashboard → `/impact`

Each card: icon + short label + one-line description. Clean, compact, clickable. Not a full section — just a quick-nav bridge to make the programs immediately scannable.

### 3. Reorder homepage sections
Move `SocialMissionSection` and `MentorshipResidencySection` **higher** — right after `WeeklyPodium`, before `WhyParticipate`. This positions the social angle as a key differentiator early on.

New order:
1. Hero
2. ActivityFeed
3. HowItWorks
4. WeeklyPodium
5. **SocialMissionSection** (moved up)
6. **MentorshipResidencySection** (moved up)
7. WhyParticipate
8. CategoriesSection
9. **ProgramsOverview** (new compact strip)
10. SocialProof
11. CTASection
12. StickyMobileCTA
13. Footer

### 4. i18n additions
Add keys in FR/EN/DE for:
- Updated hero subtitle and new trust badge
- `programsOverview` section: title, subtitle, 5 card labels + descriptions

### Files to modify
- `src/pages/Index.tsx` — reorder sections + add ProgramsOverview import
- `src/components/landing/HeroSection.tsx` — add 4th trust badge, update subtitle reference
- `src/components/landing/ProgramsOverview.tsx` — **new file**, compact 5-program strip
- `src/i18n/locales/fr.json` — new keys
- `src/i18n/locales/en.json` — new keys
- `src/i18n/locales/de.json` — new keys

