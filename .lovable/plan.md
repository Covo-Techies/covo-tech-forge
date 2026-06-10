# Hero fixes

## 1. Hero image
Replace `/placeholder.svg` in `src/pages/Index.tsx` (line 122) with a high-quality Unsplash laptop-on-dark-background photo, loaded via the Unsplash CDN URL with explicit width/quality params so it stays sharp:

```
https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80
```

Keep existing classes (`w-full h-auto rounded-lg shadow-2xl`) and update `alt` to "Modern laptop on dark background". Add `loading="eager"` since it's above-the-fold.

## 2. "View Deals" button
The current outline button (line 115) renders invisibly because shadcn's `outline` variant applies `bg-background` (white) which combined with the custom `text-primary-foreground` (also near-white) hides the label on the purple hero.

Switch to `variant="ghost"` and apply explicit transparent/white-border/white-text classes that win against the variant defaults:

```tsx
<Button
  size="lg"
  variant="ghost"
  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary"
  asChild
>
  <Link to="/products?sort=deals">View Deals</Link>
</Button>
```

Also wrap it in a `<Link>` so the CTA actually navigates (matches the Shop Now pattern).

## Files touched
- `src/pages/Index.tsx` — two edits in the hero block (lines ~115 and ~122)
