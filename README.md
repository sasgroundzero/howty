<p align="center"><img src="docs/home.png" alt="The Howty home page: the headline 'Set up any board game, step by step', a search box, and a 3D table set up for Catan" width="840" /></p>

# Howty

**Set up any board game, step by step.** Pick the game on your table and Howty places every
piece on a 3D table one step at a time, then plays a short first turn. 176 games, free, no account.

**Try it: [howty.vercel.app](https://howty.vercel.app)**

<p align="center"><img src="docs/demo.gif" alt="Scrolling the home page, searching for Wingspan, opening its game page, stepping through setup and watching the first turn" width="840" /></p>

- **176 games built in**, from Chess and Catan to Wingspan and Terraforming Mars, plus 63 card games: Hearts, Solitaire, Blackjack and 18 kinds of poker among them.
- **Teach it hands-free.** One button plays every step by itself and reads it aloud, then the first turn,
  so the person explaining the game can watch the table instead of the rulebook. Voice commands
  ("next", "back", "repeat") work too, where the browser supports them.
- **Bring the whole table in.** Share opens your phone's share sheet and shows a QR code, so everyone can
  follow the same guide on their own phone.
- **Works offline.** After one visit every guide opens without a connection, and phones can add Howty to the
  home screen like an app. Handy in basements and cabins.
- **Print a checklist.** Every game has a one-page setup checklist, on screen or on paper.
- **Find it by any name.** Search knows other names (Thirty-One, Klondike, Scum, Settlers), and the library
  can be browsed by kind: party, co-op, family, strategy, classics, trick-taking, poker and casino.
- **Add your own.** Paste the setup section of any rulebook and get a 3D table. Share it with a link:
  the rules travel in the link itself, so nothing is uploaded.
- **Daily table.** A finished setup with the name hidden: one guess, a new table every day, a streak, and a
  result you can share as a picture ([/daily](https://howty.vercel.app/daily)).
- **Your shelf.** Tag games as "own it", "want to learn" or "taught it" and see what you have set up. It is
  saved in your browser only.
- **A page per game** (`/g/azul`), with a link to any step (`/g/azul?step=3&players=4`). Each page carries its
  steps as plain text and its own preview image, so search engines and link previews show the real guide.
- **Runs entirely in the browser.** No backend, no account, no API keys, no AI calls, no cookies. The only
  measurement is Vercel Web Analytics' anonymous page counts.
- **Light.** Each game's 3D setup is its own small file, fetched when you open it.

## Run it

    npm install
    npm run dev        # local dev server
    npm run build      # type-check, build, and write one HTML page per game into dist/
    npm test           # build every game at every player count and fail on overlapping pieces

Deploying is covered in [DEPLOY.md](DEPLOY.md). To show the GitHub links in the app, set `repo` in
[`src/site.ts`](src/site.ts).

## How it is built

React, TypeScript, Tailwind and React Three Fiber. There are no image, model or sound files:
every board, card face and sound is drawn or synthesised in code.

| Path | What lives there |
| --- | --- |
| `src/engine/` | Game-agnostic engine: schema types, piece animation, camera, audio, voice |
| `src/components/pieces/` | Reusable 3D primitives (card, stack, die, token, board...) and drawn board art |
| `src/data/games/` | One file per game. `more/` holds the games written with the table composer; `catalog.ts` (generated) lists them all and loads each on demand; `tags.ts` has other names and kinds |
| `src/custom/` | The rulebook reader behind "Add your own game", and share-link packing |
| `src/ui/` | Home page, game page, daily table, shared components, icons and illustrations |
| `scripts/` | Layout checker, index and catalog generators, per-game page and preview-image writer, offline worker, authoring guide |

A game is plain data: a list of steps and a list of pieces, where each piece says where it rests
from a given step onward. The engine drops, slides, flips and hides pieces to match.

## The design

Howty is laid out to do one thing per screen, on a pure white page with neutral grays and a single amber accent.

**Home** is one wide column: the headline and search, a live 3D table you can swap between games,
"How it works" in three columns with line drawings made for Howty, then the library, with every
game scrolling past as a row of box lids.

<p align="center"><img src="docs/how.png" alt="The 'How it works' section: three numbered columns, each with an original line drawing, above a grid of popular setups" width="840" /></p>

**A game page** is two panels: the table on the left, and on the right a card with the facts, the
player count, your shelf tags and one "Start setup" button. On a phone the panels stack, table first.
**The step view** is the only full-screen page; the table fills it and the controls float on top.

<table>
  <tr>
    <td width="72%"><img src="docs/game.png" alt="The Wingspan game page on a desktop: 3D table on the left, details and the Start setup button on the right" /></td>
    <td width="28%"><img src="docs/phone.png" alt="The same Wingspan page on a phone, with the table stacked above the details" /></td>
  </tr>
</table>

The rules behind this are written down in [DESIGN.md](DESIGN.md): one focal point per screen, one
spacing scale, six type sizes, neutral colors with a single accent, real content only, matching details,
and motion that starts from where you acted. Changes to the UI are checked against its seven questions.
Icons and illustrations are drawn in code ([`src/ui/icons.tsx`](src/ui/icons.tsx),
[`src/ui/art.tsx`](src/ui/art.tsx)), in the same 2-pixel ink line.

## Add or fix a game

Most games are about 50 lines using the table composer: you say what goes in the centre, at the
sides and in front of each player, and it positions everything, sizes the table and aims the camera.
See [CONTRIBUTING.md](CONTRIBUTING.md) and [scripts/AUTHORING.md](scripts/AUTHORING.md).

**Rules checks are the most valuable contribution.** The guides were written from memory or from
public rules references. One hundred and twenty-seven of the most popular (listed in
`src/data/games/verified.ts`) have been checked step by step against the published rules; the rest have not. Each unchecked page says so and links to a "Verify"
issue: if you have the box, check the guide and report back, and the page is marked "Checked against the
published rules" with your edition (see `src/data/games/verified.ts`).
Spotted a mistake? Open a "Rules error" issue or a pull request.

**Want a game added?** [Request it](https://github.com/sasgroundzero/howty/issues/new?template=game-request.md), or
[vote on open requests](https://github.com/sasgroundzero/howty/issues?q=is%3Aissue+is%3Aopen+label%3Agame-request+sort%3Areactions-%2B1-desc)
with a thumbs-up. The most-wanted games are built first.

## Unofficial

Howty is an independent fan project. It is not affiliated with, sponsored or endorsed by the
publishers of any game it describes, and game names are trademarks of their owners. Boards and
cards are schematic drawings, not the published artwork, and no rulebook text is reproduced.
If you are a rights holder and want something changed or removed, please open an issue.

## License

[MIT](LICENSE) for the code and drawings. It grants no rights to any game's name or trademarks.
