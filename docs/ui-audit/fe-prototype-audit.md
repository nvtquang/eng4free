# UI-0 audit — `/fe` landing prototype

Audited on 2026-09-21. `/fe` is an internal Vite/React prototype, not a
production dependency. It has a full bilingual marketing page rendered from
two raw HTML documents, a global stylesheet, and a legacy browser-interaction
script.

## What exists

| Area | Evidence | UI-1 decision |
| --- | --- | --- |
| Design direction | `styles.css` uses a warm editorial education aesthetic | Keep as the visual direction |
| Typography | Inter for UI; Source Serif 4 for editorial headings | Keep the pairing; load through `next/font` instead of Google `<link>` |
| Palette | Cream backgrounds, forest green primary, navy utility, terracotta/ochre accents | Keep semantic intent; convert into Tailwind tokens |
| Layout | 72px sticky header, wide readable container, large editorial rhythm, low-radius cards | Keep; make responsive components |
| Accessibility | Skip link, focus styles, reduced-motion branch, labels and semantic sections | Preserve and improve in React components |
| Localization | Separate `landing.html` and `landing.vi.html`, i18next, localStorage switcher | Do not copy; replace with typed locale messages and locale-aware SSR |
| Hero/marketing | Hero, CEFR, skills, exams, path, lessons, vocabulary, grammar, writing, schedule, progress, stories, CTA, footer | Split into independently composed server components |
| Demo interactions | Nav, reveal, fake pronunciation/flashcard/grammar/writing feedback, accordions | Port only generic interactions; replace fake learning logic with domain APIs |
| Assets | Five hot-linked Unsplash images | Do not hot-link in production; replace with owned/licensed assets in UI-2 |

## Approved visual tokens

| Token role | Prototype value | UI-1 token name |
| --- | --- | --- |
| Canvas | `#F7F5EF` | `background` |
| Surface | `#FCFBF7` | `card` |
| Primary | `#506A58` | `primary` |
| Primary dark | `#435A4A` | `primary-foreground-hover` |
| Ink | `#202522` | `foreground` |
| Muted text | `#5C635D` | `muted-foreground` |
| Utility navy | `#405266` | `info` |
| Accent terracotta | `#BF765B` | `accent` |
| Accent ochre | `#C69A4B` | `highlight` |
| Radius | 4 / 6 / 10px | `sm` / `md` / `lg` |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px | 4px-based spacing scale |

## Port decisions

### Port into UI-1

- Brand mark, header structure, mobile-navigation behaviour, footer shape.
- Button hierarchy: primary, secondary and text link.
- Section eyebrow, editorial heading, level tag, card and progress visual language.
- Skip link, visible focus ring and `prefers-reduced-motion` treatment.
- Existing Vietnamese/English marketing copy, after copy review.

### Rebuild, do not copy

- `dangerouslySetInnerHTML` rendering of whole HTML pages.
- `window.location.reload()` language switching and duplicated full HTML language files.
- `legacy/interactions.js`, including DOM queries and fake scoring/AI feedback.
- All Vite-specific entry points, build files and local-storage-only state.
- Hash-anchor navigation for real product routes; use Next `Link` and route-aware navigation.

### Deferred to domain phases

| Prototype demonstration | Replacement phase |
| --- | --- |
| Pronunciation recording and waveform | Phase 3 / 3b Media + SpeechService |
| Flashcards | Phase 2b Vocabulary + FSRS UI |
| Grammar answer feedback | Phase 2b Lesson Question Engine |
| Writing feedback | Phase 8 AI Writing |
| Schedule/progress dashboard mockups | Phase 4 Progress & Dashboard |
| TOEIC/IELTS cards | Phase 6 / 7 exam catalogue with real data |

## Quality findings

1. Source files are UTF-8. Any `Tiáº¿ng...` appearance in a PowerShell read is
   terminal encoding, not source-file corruption.
2. The prototype has strong semantic HTML and accessibility foundations worth
   preserving.
3. Its content is currently a marketing demo, not a true reflection of the
   available Phase 1/2 product capabilities. UI-2 copy must avoid promises for
   unavailable AI, IELTS and speech features.
4. Unsplash URLs must be replaced before release with assets that have recorded
   licenses and accessible alt text.

