

# UI Refresh: Orange Accent + Animated Hero

## Color Changes

Update `src/index.css` CSS variables to an orange/warm palette:

- **Primary**: warm orange (`24 95% 53%` ~ #f97316)
- **Primary foreground**: white
- **Accent**: lighter orange tint for hover states
- Dark mode variants adjusted accordingly

## Hero Section Redesign

Replace the current flat gradient hero in `src/pages/Index.tsx` with:

- **Background**: warm gradient from deep orange to amber
- **Left side**: bold headline + subtitle + CTA buttons (kept)
- **Right side**: 3-4 floating product cards with CSS animations (gentle float/bob), showcasing featured categories with icons
- Cards will use `animate-[float]` keyframes with staggered delays for a lively feel
- Subtle background shapes/circles for depth

## New Keyframes

Add to `tailwind.config.ts`:
- `float` keyframe: gentle up/down bobbing motion
- Staggered animation delay utility classes

## Files Changed

| File | Change |
|------|--------|
| `src/index.css` | Update CSS variables to orange/warm palette (light + dark) |
| `tailwind.config.ts` | Add float keyframe animation |
| `src/pages/Index.tsx` | Redesign hero with gradient background + floating animated cards on the right |

