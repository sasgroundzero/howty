# Authoring a game with the composer

You are adding setup tutorials to a 3D "Tabletop Setup Visualizer" (React + three.js, front-end only).
Each game is ONE file in `src/data/games/more/<game-id>.ts` that exports one `tabletop(...)` constant.

Read first (all short):
- `src/data/games/compose.ts` – the whole API, documented in its header and per function.
- `src/data/games/more/ticketToRide.ts` and `src/data/games/more/splendor.ts` – worked examples (a board game and a boardless card game).
- `src/data/games/layouts.ts` (bottom section "Generic boards") and the `genericArt` comment at the bottom of
  `src/components/pieces/boardArt.ts` – board art ids `g:style:arg:bg:accent:label` and the matching UV helpers
  (`cityUV`, `hexUV`, `gridUV`, `slotUV`, `loopUV`, `laneUV`). The label must not contain a colon.

## Games played with ordinary playing cards
- Import the card helpers from `src/data/games/playing.ts` (read it: it is short) and follow `src/data/games/more/hearts.ts`.
- `hand(id, 'A♠ 10♥ K♦', ...)` in a `P(...)` row is face up for you and face down for everyone else. When another
  player plays a card, turn it over as it moves: `flip('hand.1@1'), mv('hand.1@1', at('trick', 0.2, 0.5))`.
- `stock(id, count, ...)` is a face-down pack; `draw('stock', at(...), pc('7♣'), 'newId')` turns its top card up.
  `shown(...)` is face up for everyone, `hidden(...)` face down for everyone, `slot(k, cols, rows)` is the UV of a hand card.
- Wrap hands of more than 7 cards with `{ cols: 7 }`. Suits are written ♠ ♥ ♦ ♣ and tens as `10`.
- Say in the first step exactly which cards are used (52, a stripped pack, two packs, jokers or not) and deal the
  number of cards that is right for `n` players.

## What each game needs
- `tabletop(id, title, [minPlayers, maxPlayers], defaultPlayers, playTime, 'Easy'|'Medium'|'Hard', blurb, [3 swatch colors], (n) => ({ setup, turn }))`.
  Use the exact `id` you were given. Max players is capped at 8 (and solo games may start at 1); if the real game
  allows more, cap at 8 and say so in a step's detail. The blurb is under 50 characters.
- `setup`: 5 to 9 `S(...)` steps in the order the rulebook has you do them, ending with a "Ready to play" step
  (who goes first, what a turn is). Everything that scales with player count must use `n`.
- `turn`: 4 to 6 `T(...)` steps that walk through a real first turn or round. At least 3 of them must move things
  (`mv`, `draw`, `spawn`, `set`/`roll`/`flip`, `hide`). The last one says how the game ends and who wins.
- Every item has hover text: `title` (what it is) and `body` (how many there are and what it is for), 1–2 sentences.
- Step text: `text` is 1–2 plain sentences telling the reader what to do; `detail` is an optional extra sentence.

## Rules for the content
- Accuracy matters more than detail. State a number (cards dealt, starting money, component counts) only if you are
  confident it is right for the standard base game. If you are unsure, or it varies by edition, say so in plain words
  ("the number depends on the player count: check the rulebook") rather than guessing. Never invent rules.
- Write everything in your own words. Do not reproduce rulebook text, card text or artwork. Boards and cards are
  schematic: generic faces (`f`, `ft`) with simple symbols. Real component names (e.g. "Chance card") are fine.
- Glyphs must be plain Unicode symbols (★ ◆ ● ▲ ♛ ⚑ ✦ ⚔ ⌂ ≡ ?), never emoji.
- Use `—` nowhere; write plain sentences. Use "you" for seat 0.

## Layout rules
- The centre `C(...)` holds the main board (if any) or the shared card/tile display. Shared supplies, decks and
  markets go in `R(...)` or `L(...)`. Per-player things go in `P(...)`: keep each `P` row under about 6.5 units wide
  and use at most 3 `P` rows. A standard card is 0.9 x 1.26; a typical main board is 9–13 wide and 7–9 deep;
  a player board/mat is 3–5 wide.
- Things that sit on a board or mat use `On` / `OnP` / `OnMe` with UV coordinates.
- Reserve empty landing spots with `zone(...)` (discard pile, play area, tableau) so turn-step moves have somewhere
  to land. To add a card to a hand, fan it over the last card: `at('hand.3', 1.15, 0.5, 0.02)` (raise `lift` by 0.02
  for each further card).
- In `turn` steps refer only to seat 0 (bare id or `@0`) and seat 1 (`@1`) unless the game needs at least 3 players.
- Keep the piece count sensible: stand a `pile(...)` or a tall `discs(..., {h})` stack in for a big supply.

## Checking your work (required)
- `node scripts/check.mjs src/data/games/more/<file>.ts [more files]` builds each game at every player count and
  reports unknown ids and overlapping pieces. It must print "OK".
- `npx tsc --noEmit` must show no errors in YOUR files (ignore errors in files you did not write: other people are
  adding games at the same time).
- Do not edit any file other than the game files you were assigned. Do not edit compose.ts, index files or
  package.json. Do not start a dev server or open a browser. Do not read or write outside this project folder.
  If the composer cannot express something, simplify the scene rather than working around it.

## Report back
A short list: each game id, whether the checker is clean, and any rule you hedged or were unsure about.
