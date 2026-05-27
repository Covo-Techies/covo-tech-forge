# Fix cramped hero section

## Changes

**1. `src/components/layout/Header.tsx` (line 108)**
Make the brand name responsive so it doesn't crowd the header on tablet/mobile:
- Show `COVO` by default
- Show full `COVO Technologies` only on `md` and up

```tsx
<span className="font-bold text-xl">
  COVO<span className="hidden md:inline"> Technologies</span>
</span>
```

**2. `src/pages/Index.tsx` (hero, ~line 99 & 120)**
Reveal the right-side floating cards earlier so the hero feels balanced on tablet-sized screens (~768px+) instead of leaving a large empty space:
- Change grid from `lg:grid-cols-2` → `md:grid-cols-2`
- Change the visual wrapper from `hidden lg:block` → `hidden md:block`
- Slightly reduce hero vertical padding on smaller screens (`py-16 md:py-24`) and tighten headline scale (`text-4xl md:text-5xl lg:text-6xl`) so text + cards fit comfortably side-by-side at 768–1024px.

## Files changed
| File | Change |
|---|---|
| `src/components/layout/Header.tsx` | Responsive brand wordmark (COVO / COVO Technologies) |
| `src/pages/Index.tsx` | Hero grid + cards visible from `md`, tighter padding & headline scale |

No business logic, routing, or data changes.
