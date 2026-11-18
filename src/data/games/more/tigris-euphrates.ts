/** Tigris & Euphrates: a river-land grid with ten starting temples, a tile bag, and four leaders each behind a screen. */
import { C, On, P, R, S, T, at, board, box, by, cubes, discs, f, mv, pile, spawn, tabletop, tiles } from '../compose'
import { gridUV } from '../layouts'

const g = gridUV(16, 11)
const [RED, BLUE, GREEN, BLACK] = ['#b5442e', '#2e6fb7', '#3d8b4a', '#3a3a3a']
const TEMPLES: [number, number][] = [[1, 1], [5, 2], [10, 1], [14, 2], [3, 5], [8, 5], [12, 6], [2, 9], [7, 8], [13, 9]]
const HAND = [RED, BLUE, BLACK, GREEN, RED, BLACK]
const point = (id: string, color: string) => cubes(id, 1, color, 'Victory point', 'A point in the color of the tile that earned it. Points are kept hidden behind your screen.', { s: 0.2 })

export const tigrisEuphrates = tabletop('tigris-euphrates', 'Tigris & Euphrates', [2, 4], 3, '90 min', 'Hard', 'Grow kingdoms; score in your weakest color.', ['#d9c89a', '#b5442e', '#2e6fb7'], () => ({
  setup: [
    S('Lay out the board', 'Put the board in the middle of the table.', 'c', [
      C(board('land', 13, 8.6, 'g:grid:16x11:#d9c89a:#8a6a3a:Tigris and Euphrates', 'Game board', 'A grid of land and river spaces, 16 by 11. The real board shows the two rivers, where only blue farm tiles may go; this drawing is schematic.')),
    ]),
    S('Place temples and treasures', 'Put a red temple tile on each of the 10 marked spaces, and a treasure on top of each temple.', 'land', TEMPLES.map(([c, r], i) => On('land', ...g(c, r), tiles(`temple${i}`, 1, 0.6, 0.6, f(RED, '◆', '#f0d778'), 'Temple with treasure', 'One of 10 starting temples, each holding a treasure. A trader collects treasures when kingdoms join. The positions drawn here are schematic.'))),
    ),
    S('Fill the bag', 'Put all the other civilization tiles in the bag and mix them.', 'bag', [
      R(box('bag', 1.3, 0.9, 1.3, '#7a5a3a', 'Tile bag', '153 civilization tiles in all: 57 red temples, 36 blue farms, 30 green markets and 30 black settlements. All but the 10 starting temples go in the bag.', { round: true }), pile('points', [RED, BLUE, GREEN, BLACK], 'Victory points', 'Cubes in the four colors. You earn one when a tile is added to a kingdom where you have the leader of that color.')),
    ]),
    S('Set out the monuments', 'Put the 6 monuments beside the board.', 'monu', [
      R(tiles('monu', 6, 0.9, 0.9, [RED, BLUE, GREEN, BLACK, RED, BLUE], 'Monuments', '6 two-colored monuments. One can be built on a square of four tiles of the same color and then earns points every turn.', { cols: 3, h: 0.5 })),
    ]),
    S('Take a dynasty', 'Each player takes the screen, the 4 leaders, the unification tile and the 2 catastrophe tiles that show one dynasty symbol.', 'you', [
      P(box('screen', 4.3, 0.9, 0.15, '$', 'Screen', 'Hides your tiles and the points you have won from the other players.')),
      P(tiles('hand', 6, 0.6, 0.6, HAND, 'Your tiles', '6 tiles drawn from the bag and kept behind your screen. You refill to 6 at the end of each turn.')),
      P(discs('leader', 4, 0.28, [BLACK, RED, BLUE, GREEN], 'Your leaders', 'A king (black), a priest (red), a farmer (blue) and a trader (green). All four share your dynasty symbol; the colors do not belong to any one player.', { label: ['K', 'P', 'F', 'T'], ink: '#ffffff', h: 0.14 }), tiles('cata', 2, 0.6, 0.6, f('#c9a23a', '✖', '#2b241c'), 'Catastrophe tiles', '2 per player. Placed on a space, one destroys the tile there and blocks the space for the rest of the game.'), tiles('unify', 1, 0.6, 0.6, f('#e9dfc8', '✦', '#2b241c'), 'Unification tile', 'One per player. Marks the tile that joins two kingdoms while any conflicts it causes are settled.')),
    ]),
    S('Draw six tiles', 'Each player draws 6 tiles from the bag and stands them behind their screen.', 'hand'),
    S('Ready to play', 'Pick a starting player at random, then play passes clockwise.', 'all', [], 'On your turn you take 2 actions, in any mix: place a leader, place a tile, play a catastrophe, or swap up to 6 tiles with the bag.'),
  ],
  turn: [
    T('First action: place a leader', 'You place your king on an empty land space next to a temple. A leader must always stand beside a temple. The king and that temple now form a small kingdom.', 'land', [
      mv('leader.0', at('land', ...g(9, 5))),
    ]),
    T('Second action: place a tile', 'You add a black settlement tile next to your king. The kingdom has a black leader, yours, so you earn 1 black victory point and hide it behind your screen.', 'land', [
      mv('hand.2', at('land', ...g(9, 6))),
      spawn(point('vp0', BLACK), by('screen', 0, 0.33), 'points', undefined, 1.2),
    ]),
    T('Refill to six tiles', 'After your 2 actions you draw from the bag until you have 6 tiles again.', 'you', [
      spawn(tiles('newtile', 1, 0.6, 0.6, BLUE, 'New tile', 'Drawn from the bag at the end of your turn.'), by('hand', -0.37, 0), 'bag'),
    ]),
    T('Next player', 'The player on your left places their priest beside another temple and then a red temple tile next to it, earning 1 red point.', 'land', [
      mv('leader.1@1', at('land', ...g(4, 5))),
      mv('hand.0@1', at('land', ...g(4, 6)), 1),
      spawn(point('vp1', RED), by('screen@1', 0, 0.33), 'points', undefined, 1.8),
    ]),
    T('Conflicts and monuments', 'A conflict breaks out when a leader joins a kingdom that already has a leader of its color, or when a tile joins two kingdoms that hold leaders of the same color. It is fought with supporting tiles and the loser’s leader leaves the board. The rulebook covers these in detail.', 'land'),
    T('End of the game', 'The game ends when the bag cannot refill a hand, or when only 1 or 2 treasures remain on the board at the end of a turn. Treasures count as any color you like. Your score is the number of points in your weakest color, and the best such score wins.', 'all'),
  ],
}))
