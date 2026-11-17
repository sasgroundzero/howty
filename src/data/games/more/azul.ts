/** Azul: factory displays of four tiles each, a shared centre, and a player board with pattern lines and a wall. */
import { C, On, P, R, S, T, at, box, cubes, discs, f, mat, mv, spawn, tabletop, tiles, zone } from '../compose'

const TILE = ['#2e6fb7', '#e0b12f', '#c0392b', '#2b2b2b', '#7fc8c8']
const mix = (i: number) => (i === 0 ? [TILE[0], TILE[0], TILE[2], TILE[1]] : [0, 1, 2, 3].map((k) => TILE[(i * 3 + k * 2 + (k > 1 ? 1 : 0)) % 5]))
const TILE_BODY = '100 tiles in all, 20 in each of 5 patterns. You draft them onto your pattern lines and then move them to your wall.'

export const azul = tabletop('azul', 'Azul', [2, 4], 2, '30–45 min', 'Easy', 'Draft tiles and build a patterned wall.', ['#2e6fb7', '#e9e4d8', '#c0392b'], (n) => {
  const F = 2 * n + 1
  return {
    setup: [
      S('Player boards', 'Give each player a board, with the colored wall side face up, and a scoring marker on space 0 of the score track.', 'you', [
        P(mat('pb', 4.4, 4.2, '$', 'Player board', 'Player board', 'Score track along the top, five pattern lines (1 to 5 spaces) on the left, the 5 by 5 wall on the right and the floor line along the bottom.')),
        On('pb', 0.08, 0.07, cubes('score', 1, '#2b2b2b', 'Scoring marker', 'One per player. It starts on 0 and moves along the score track as you place tiles on your wall.', { s: 0.22 })),
      ]),
      S('Factory displays', `Lay out ${F} factory displays in a ring, leaving space in the middle.`, 'c', [
        C(discs('fac', F, 0.8, '#e8dcc0', 'Factory display', `Use 5 displays with 2 players, 7 with 3 and 9 with 4, so ${F} in this game. Each holds 4 tiles at the start of a round.`, { h: 0.04, cols: n === 3 ? 4 : 5, gap: 0.3 })),
        C(zone('centre', 5, 1.6, 'Centre of the table', 'Tiles left behind when someone takes from a factory are pushed here, where they can be taken later.')),
      ], 'The scene lays the displays out in rows to keep things tidy. On a real table they form a circle around the centre.'),
      S('Fill the bag', 'Put all 100 tiles in the bag and keep the box lid nearby for discarded tiles.', 'r', [
        R(box('bag', 1.6, 1.1, 1.6, '#6d5a8a', 'Tile bag', 'Holds the 100 tiles: 20 of each of the 5 patterns. When it runs empty, refill it from the box lid.', { round: true }), box('lid', 2.2, 0.25, 2.2, '#3a5a8a', 'Box lid', 'Tiles removed from finished pattern lines and from floor lines are dropped here until the bag needs refilling.')),
      ]),
      S('Starting player marker', 'Pick a starting player (the rules suggest whoever most recently visited Portugal). They place the starting player marker in the centre of the table.', 'centre', [
        On('centre', 0.5, 0.5, tiles('first', 1, 0.42, 0.42, f('#f3ecdc', '1', '#2b241c'), 'Starting player marker', 'One marker. The first player to take tiles from the centre each round takes it too, and starts the next round.')),
      ]),
      S('Fill the factories', 'The starting player draws tiles from the bag at random and puts exactly 4 on each factory display.', 'c',
        Array.from({ length: F }, (_, i) => On(`fac.${i}`, 0.5, 0.5, tiles(`t${i}`, 4, 0.36, 0.36, mix(i), 'Tiles', TILE_BODY, { cols: 2, gap: 0.08 }))),
      ),
      S('Ready to play', 'The starting player takes the first turn and play passes clockwise.', 'all', [], 'On your turn take all the tiles of one color from one factory or from the centre, and add them to one of your pattern lines.'),
    ],
    turn: [
      T('Take one color from a factory', 'You take both blue tiles from a factory and put them on your 2-space pattern line. The other two tiles on that factory slide into the centre.', 'c', [
        mv('t0.0', at('pb', 0.3, 0.38)), mv('t0.1', at('pb', 0.4, 0.38)),
        mv('t0.2', at('centre', 0.25, 0.5)), mv('t0.3', at('centre', 0.36, 0.5)),
      ]),
      T('Next player takes from the centre', 'The next player takes the red tile from the centre instead. Being first to take from the centre, they also take the starting player marker, which sits on their floor line and costs them a point.', 'centre', [
        mv('t0.2', at('pb@1', 0.42, 0.25)), mv('first', at('pb@1', 0.1, 0.92)),
      ]),
      T('Tile the wall', 'When every tile has been taken, each full pattern line sends one tile across to the matching wall space and scores at once. The rest of that line goes to the box lid.', 'you', [
        mv('t0.1', at('pb', 0.68, 0.38)), mv('t0.0', at('lid', 0.4, 0.4)), mv('score', at('pb', 0.14, 0.07)),
      ]),
      T('Set up the next round', 'Whoever holds the starting player marker returns it to the centre, refills every factory with 4 tiles from the bag and takes the first turn.', 'c', [
        mv('first', at('centre', 0.5, 0.5)),
        spawn(tiles('refill', 4, 0.36, 0.36, [TILE[3], TILE[1], TILE[4], TILE[2]], 'Tiles', TILE_BODY, { cols: 2, gap: 0.08 }), at('fac.0', 0.5, 0.5), 'bag'),
      ]),
      T('End of the game', 'The game ends after the round in which someone completes a horizontal row of 5 tiles on their wall. Add bonuses for complete rows, columns and colors; the highest score wins.', 'all'),
    ],
  }
})
