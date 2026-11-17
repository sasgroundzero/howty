# Contributing to Howty

Thanks for helping. The three most useful things, in order:

1. **Fix a rules mistake.** Find the game's file in `src/data/games/` (newer ones are in `more/`),
   correct the step text or the counts, and say in the pull request which rulebook edition you
   checked against. Not a coder? Open a "Rules error" issue instead.
2. **Add a game.** Read [scripts/AUTHORING.md](scripts/AUTHORING.md), copy a similar game in
   `src/data/games/more/`, then run `npm run index` to register it.
3. **Improve the engine or the look.** Open an issue first for anything large.
   UI changes must follow [DESIGN.md](DESIGN.md) and use the components in `src/ui/kit.tsx`.

## Before you open a pull request

    npm test         # every game must build at every player count with no overlapping pieces
    npm run build    # type-check and build

## Ground rules for game content

- Write in your own words. Do not paste rulebook text, card text or artwork.
- Boards and cards stay schematic: generic shapes and symbols, no logos or scanned art.
- State a number only if you are sure of it for the standard base game. Otherwise say it
  depends on the edition and point to the rulebook.
- Keep it friendly for someone opening the box for the first time: short sentences, one action per step.
