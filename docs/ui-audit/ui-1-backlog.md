# UI-1 implementation backlog

## Scope

Create the reusable visual system inside `apps/web`; do not move or import the
Vite application as a package.

## Deliverables

1. Install/configure Tailwind CSS and shadcn/ui for the Next app.
2. Add local `next/font` font loading for Inter and Source Serif 4.
3. Define semantic CSS/Tailwind tokens from the approved UI-0 palette.
4. Build `SiteHeader`, `MobileNav`, `SiteFooter`, `LanguageSwitcher`, `Button`,
   `Section`, `Eyebrow`, `Card`, `LevelBadge`, and accessible `Dialog` primitives.
5. Create route map: Home, Learn, TOEIC, IELTS, Vocabulary, Grammar,
   Pronunciation, Dashboard, Login.
6. Implement locale routing/message catalogues for Vietnamese and English; no
   document reload and no mixed-language UI chrome.
7. Replace the temporary root page and TOEIC runner styles with the shared
   component system without changing attempt/scoring behaviour.

## Acceptance criteria

- A mobile and desktop header works with keyboard and Escape to close the menu.
- UI chrome is entirely Vietnamese or entirely English after a language switch.
- All components retain visible focus and honor reduced-motion preferences.
- No external hot-linked production imagery is introduced.
- `pnpm test`, typecheck and production build remain green.

