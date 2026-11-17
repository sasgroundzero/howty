# Howty design standard

Every screen in Howty is checked against seven questions. They come from Griffin Wooldridge's
"How to Make AI-Generated UI Look Expensive (7 Fixes)"; what follows is how each one is applied
here. If a change cannot answer "yes" to all seven, it is not done.

The tokens live in `tailwind.config.js`, the shared components in `src/ui/kit.tsx`, and the
motion rules at the bottom of `src/index.css`. Use those; do not hand-roll a new button or shadow.

## Page layout

The layout follows the same shape on every page, modelled on usebygga.com:

- **A thin bar across the top** with the name, two links and the GitHub star. It stays put while you scroll.
- **Home is one full-width column** (max 72rem): headline and search at the top left, then the live 3D
  table in a large rounded panel with its caption and one button, then tabs to swap the game, then
  "How it works" as three ruled columns, then the library.
- **A game page is two panels side by side:** the 3D table on the left, and a card on the right that
  ends in the one primary button. On a phone they stack, table first.
- **The step view is the only full-screen page.** The table fills the screen and the controls float over it.
- There is one 3D canvas. It is moved into whichever panel is showing, so pages switch without reloading the scene.

## 1. Focal point: what is this screen for?

Each screen has one job and one loudest element. Everything else is turned down.

| Screen | Its one job | The focal point |
| --- | --- | --- |
| Home | Find your game | The headline and the search box |
| Game cover | Begin | The "Start setup" button |
| A step | Do this step | The instruction and the Next button |
| Daily table | Guess | The four choices |

- One `primary` (or `accent`) button per screen. A second action is `secondary`; a third is `quiet`.
- Fixing a crowded screen means removing things. No stat bars, badges or feature-card rows for decoration.

## 2. Spacing: one scale

Gaps come from **4, 8, 12, 16, 24, 32, 48, 64** pixels (Tailwind 1, 2, 3, 4, 6, 8, 12, 16) and nothing else.
No `1.5`, `2.5`, `3.5`, `5`, `7` or `10`.

- Things that belong together sit 4–12 apart; groups sit 24–32 apart; sections sit 48–64 apart.
- Grouping is shown by distance first. Add a box only when distance is not enough.

## 3. Typography: weight and color before size

Two typefaces: Fraunces (`font-display`) for names and headings, DM Sans for everything else.
Six sizes, and no arbitrary `text-[13px]`:

| Class | Size | Used for |
| --- | --- | --- |
| `text-hero` | 38–56, scales with the window | The home page headline |
| `text-page` | 28 | A step's title, a dialog's title |
| `text-title` | 20 | Section headings |
| `text-body` | 16 | Reading text, names in lists |
| `text-ui` | 14 | Controls and secondary text |
| `text-meta` | 12 | Facts and fine print |

- Make something more important by making it bolder and darker (`text-ink`), not bigger.
  Secondary text is `stone-600`, meta is `stone-500`.
- Headings get slightly tight letter spacing (built into the sizes). Paragraphs are capped near 60 characters wide.
- No all-caps, letter-spaced, colored eyebrow labels.

## 4. Color: neutrals, and one accent that means something

- The page is warm neutrals: `paper` background, `ink` text, `stone-*` grays, `line` borders.
- `accent` (amber) appears only on: step progress, keyboard focus, the "Watch the first turn"
  button, the daily-table tile, and the tick on a correct answer. Never on headlines, backgrounds or plain links.
- No gradients for decoration. The only strong color on a page belongs to the games themselves
  (their swatches and the 3D table), which is content, not chrome.

## 5. Content: real, or absent

- Every number shown is true: real game counts, real player counts, real step counts.
- Never show a row of zeros or placeholder copy. If there is nothing to show yet, show nothing
  (the shelf and daily stats appear only once they have data).
- Write for someone holding a game box: plain words, no marketing adjectives.
- Things you cannot press must not look pressable. Facts are plain text separated by " · ", not chips.

## 6. Details: the same everywhere

- **Radius:** surfaces `rounded-2xl` (16), things inside a surface `rounded-xl` (12), controls inside
  those `rounded-lg` (8). Buttons, chips and the search box are pills. Nothing else.
- **Borders:** 1px `border-line`, always. No 2px borders, no dark outlines.
- **Shadows:** `shadow-soft` for resting panels, `shadow-lift` for things floating above the page.
  Both are two soft layers; never a single heavy blur.
- **Icons:** the inline set in `src/ui/icons.tsx`, 2px stroke, at 16 or 20 only. No emoji and no
  text glyphs standing in for icons.
- **Illustrations:** the drawings in `src/ui/art.tsx`. They follow the icon rules at a larger size: 2px ink
  strokes, warm neutral fills, a soft ground shadow, and amber on the one object the drawing is about.
  New artwork is drawn in that style, never pulled from a stock set.

## 7. Motion: from where you acted

- A page slides in from the side you are heading toward: deeper from the right, back from the left.
- A step's text slides from the side of the button you pressed (Next from the right, Back from the left).
- A menu or hover card grows out of the thing that opened it (`animate-grow` with a matching `origin-*`).
- Everything is short (150–240 ms) with an ease-out curve. Closing is instant so it gets out of the way.
- Pressing a button gives a small scale-down. Nothing loops or pulses to ask for attention.
- All of it is switched off for people who prefer reduced motion.

## The checklist

1. What is the one thing this screen is for, and is it the most obvious thing on it?
2. Is every gap on the scale, and do related things sit closer than unrelated ones?
3. Does hierarchy come from weight and color, with only the six sizes?
4. Is the accent used only where the list above says?
5. Is every word and number real?
6. Do radius, borders, shadows and icons match the rules?
7. Does every animation start from where the person acted?
