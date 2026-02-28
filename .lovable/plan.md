

# Fix Build Errors

## Error 1: Edge Functions - Invalid npm import

3 edge functions use `npm:@supabase/supabase-js@2.57.2` which is not supported. Replace with `https://esm.sh/@supabase/supabase-js@2` (the pattern used by all other edge functions).

**Files:**
- `supabase/functions/check-subscription/index.ts` (line 3)
- `supabase/functions/create-checkout/index.ts` (line 3)
- `supabase/functions/customer-portal/index.ts` (line 3)

## Error 2: FraudMonitoring - Type mismatch

In `src/components/admin/FraudMonitoring.tsx` line 102, the `ip_address` field from the database is typed as `unknown` (it's an `inet` column), but the code expects `string`. Fix by casting properly.

**Change:** Replace the map callback type annotation to match the actual Supabase return type, casting `ip_address` to `string` explicitly.

## Error 3: `.catch()` on PromiseLike

The Supabase client's `.then()` returns `PromiseLike<void>` which does not have a `.catch()` method. The fix is to wrap each call in `Promise.resolve()` before chaining `.catch()`.

**12 occurrences across 8 files:**
- `src/components/landing/CategoriesSection.tsx` (line 39)
- `src/components/landing/HeroSection.tsx` (line 45)
- `src/components/layout/Header.tsx` (line 33)
- `src/components/vote/VoteButton.tsx` (line 48)
- `src/hooks/use-active-week.ts` (line 23)
- `src/hooks/use-vote-state.ts` (line 50)
- `src/pages/AdminDashboard.tsx` (line 85)
- `src/pages/Compete.tsx` (lines 130, 136, 147, 164)
- `src/pages/Explore.tsx` (lines 34, 49, 72)

**Pattern:** Change `supabase.from(...).select(...).then(...).catch(...)` to `Promise.resolve(supabase.from(...).select(...)).then(...).catch(...)` -- or restructure to use `async/await` with try/catch inside the useEffect.

---

**Summary:** 11 files modified, 0 files created. All fixes are mechanical (import paths, type casts, Promise wrapping). No functional changes.

