# How Howty was built, and how its 176 guides were checked

Howty shows board and card game setup step by step on a 3D table. This is a write-up of the engineering
decisions behind it, how the guides were checked, what AI did and didn't do, and the trade-offs that
are still open.

## In numbers

| | |
| --- | --- |
| Games | 176: 113 board games, 63 traditional card games |
| Guides checked against published rules | 174 of 176 |
| Source code | about 17,000 lines of TypeScript |
| A typical game | about 50 lines of data, 4–5 kB gzipped, fetched only when opened |
| App shell | 80 kB gzipped, plus three.js (274 kB gzipped, cached once) |
| Image, model or sound files | none: every board, card, piece and sound is drawn or synthesised in code |
| Backend | none: static files on Vercel, no accounts, no cookies |
| Time from first commit to launch-ready | four days (16–19 November 2026) |

## The problem

Rulebook setup pages are dense. Setup is a spatial task, but the rulebook describes it in
paragraphs and one crowded diagram. The person teaching ends up reading aloud while everyone else waits.
Howty turns that page into a sequence: each step places its pieces on a 3D table, with the
instruction beside it, and then a short first turn plays out.

## Decisions that shaped it

**Games are data, not code.** A game is a list of steps and a list of pieces. Each piece says where it
rests from a given step onward. The engine works out the motion: it drops, slides, flips or hides pieces
to match the step you're on. Going backwards, jumping to step 7 from a link, or changing the player count
mid-setup all fall out of that for free, because the table is always a function of
(game, player count, step).

**A table composer instead of coordinates.** Hand-placing 176 games' worth of pieces in 3D coordinates
would not have scaled or stayed consistent. The composer (`src/data/games/compose.ts`, about 300 lines) lets a
game say *what* goes in the centre, at the sides and in front of each player. It then positions
everything, seats 2 to 8 players around the table, sizes the table and aims the camera at each step. A new
game is mostly vocabulary: `C(board(...))`, `P(deck(...))`, `mv('ship', at('map', ...))`.

**Reusable primitives.** Cards, stacks, dice, tokens, mats, tiles, hexes and pawns are shared components
with procedural faces. No game ships its own mesh code. That is what keeps a game at 50 lines and the
download small.

**One canvas for the whole app.** The 3D canvas is created once and moved between page panels as you
navigate, so going from the home page to a game to its steps never rebuilds the scene or drops frames.

**Static, but still findable and shareable.** Each game gets a prerendered page with its steps as plain
HTML, schema.org HowTo data and its own preview image. The preview images are drawn from the game's
layout at build time. Search engines and link previews see the real guide, not an empty app shell.
Every step has its own URL.

**Offline by default.** A service worker caches the app after one visit. If the signal is too weak to
answer within a few seconds (a basement, a cabin), the saved copy opens instead. Game nights don't
always have Wi-Fi.

**Sharing that works at a table.** Every guide has a QR code so the whole table can follow on their own
phones. It can also be saved as a vertical video, recorded in the browser with the table's sounds and step
captions, or embedded in another site with one line of HTML. None of this needs a server.

## How quality is enforced

A setup guide that is confidently wrong is worse than no guide. Two separate checks guard against that.

**1. A machine check for layout.** `npm test` builds every game at every supported player count. It
fails on any build error, on a game with no first-turn steps, and on any two pieces that overlap at any
step. That last check catches most layout mistakes: a deck dealt onto a player board, or tokens stacked
inside each other at 7 players. CI runs it on every push.

**2. A source check for rules.** Each guide was checked step by step against a published source, under
a fixed policy:

- Board games: the publisher's own rulebook. A mirror of the publisher's PDF counts; fan summaries don't.
- Traditional card games: [pagat.com](https://www.pagat.com) (54 guides) or Bicycle's published rules.
- Casino games: state gaming regulators' published rules (for example Pennsylvania's 58 Pa. Code).
- Wikipedia alone is not a source.

The edition each guide was checked against is recorded in
[`src/data/games/verified.ts`](../src/data/games/verified.ts) and shown on the game's page. Two games
aren't marked: Age of Empires III and Eleusis. No publisher rulebook for either could be found
online, so their pages say so and ask anyone with the box to check them.

The checking found real errors, which is the point of doing it. Examples:

- Wasabi!'s recipe setup and end condition were wrong.
- Daybreak's card counts and loss conditions were wrong.
- Pirate's Cove's island numbering and starting gold were wrong.
- Gift Trap was listed as 3–8 players; the rulebook says 4–8.
- Monopoly's player count changed to 2–6 to match Hasbro's 2021 rules.

**3. A visible error path.** Every page links to a one-tap "report a rules error" issue, and the README asks
for rules checks as the most valuable kind of contribution.

## Where AI fit in

Howty was built with an AI coding agent (Claude, in Claude Code), and the commit history says so. The
split was:

- **The author** decided what to build and what not to. They also set the guardrails: front-end only,
  no secrets, reusable primitives, and a written design standard ([DESIGN.md](../DESIGN.md)) that UI
  changes are reviewed against. They decided which sources count as authoritative, and they made every
  launch decision.
- **The agent** wrote most of the code and the first drafts of the guides. It then checked those drafts
  against the sources above, in batches of about 15 games, with each batch recorded in the commit
  history.
- **Machines checked the agent:** the type checker, the layout check at every player count, a full build,
  and screenshots of real pages at phone and desktop sizes in a headless browser.

AI makes a first draft of 176 guides cheap. It doesn't make that draft correct. The engineering effort
went into the parts that make the output trustworthy: a data model that is easy to check, an automated
check that catches whole classes of layout mistakes, a written policy for what counts as a source, and an
honest checked/unchecked state on every page.

## Trade-offs and known gaps

- **Schematic art, not the real components.** Boards and cards are drawn in code, partly to keep the
  download small and partly because the published artwork belongs to its publishers. The cost is
  that a few complex boards (Cities, Jamaica) are simplified, and their pages say so.
- **Some official variants are left out.** Ingenious has a solo mode, and Project L supports more players
  with an expansion. Guides cover the base game at its common player counts.
- **Firefox saves videos as WebM**, which some apps won't accept. Chrome and Safari save MP4.
  Converting in the browser would mean a much larger download, so the app says so instead.
- **Safari saves videos without a length in the file.** They play and share normally, but Safari's own
  preview shows them as a live broadcast with no seek bar. Writing the length in afterwards gave wrong
  results, so the file is left as Safari makes it.
- **Narration isn't in saved videos.** Speech uses the device's own voices, which browsers don't let
  pages record.
- **"Add your own game" reads rulebook text with heuristics**, not AI, so it stays free and works offline.
  It handles common setup phrasing well and unusual phrasing less well.

## Stack

React 18, TypeScript, Vite, Tailwind, three.js with React Three Fiber, Vercel Web Analytics (anonymous page
counts only). Layout check, prerendering, preview images and the offline worker are scripts in
[`scripts/`](../scripts).
