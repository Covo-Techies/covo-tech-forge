# Logo & Favicon Redesign

## 1. New Logo Component
Create `src/components/Logo.tsx` — a reusable component exposing the icon mark and wordmark.

**Icon mark (36×36 SVG):**
- Rounded square (rx=10) filled with a linear gradient `#7C3AED → #5B21B6`
- Bold, geometric white "C" (custom SVG path, not a font glyph) — open-ended ring with squared terminals
- Subtle lightning-bolt accent inside the C opening (white, ~60% opacity) to signal tech
- Soft inner highlight (white 8% gradient) for depth

**Wordmark:**
- Single line, 18px, Inter, letter-spacing 0.05em
- `COVO` — weight 700, `text-[#1a1a2e] dark:text-white`
- `TECH` — weight 400, `text-[#7C3AED]`
- 8px gap (`gap-2`) between icon and wordmark

## 2. Header Integration
In `src/components/layout/Header.tsx`, replace both logo blocks (mobile row + desktop row) with `<Logo />`. Mobile uses icon-only variant (`<Logo showWordmark={false} />`) to preserve current compactness; desktop uses full lockup.

## 3. Favicon
- Generate matching purple rounded-square "C" as `public/favicon.svg` (same SVG used in the component, exported standalone at 32×32 viewBox)
- Also write a 180×180 `public/apple-touch-icon.png` rendering (via image generation) for iOS
- Update `index.html`:
  - Add `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` before the existing `.ico` link
  - Keep `.ico` as fallback
- Update `public/site.webmanifest` `theme_color` stays `#7C3AED` (already matches)

## 4. Inter Font
Inter isn't currently loaded. Add a Google Fonts `<link>` in `index.html` (`Inter:wght@400;700`) and apply via `font-family: 'Inter', system-ui` on the wordmark only (no global font change — keeps current site typography intact).

## Technical Details
- All colors hardcoded in the Logo SVG (brand mark — intentionally outside the design token system, like a real brand asset)
- Wordmark colors use Tailwind arbitrary values so they stay brand-locked in both themes
- Icon SVG uses `<defs>` with a unique gradient id to avoid collisions if rendered twice on the page
- No changes to routing, business logic, or other components

## Files Touched
- `src/components/Logo.tsx` (new)
- `src/components/layout/Header.tsx` (swap two logo blocks)
- `public/favicon.svg` (new)
- `public/apple-touch-icon.png` (regenerated)
- `index.html` (favicon link + Inter font link)
