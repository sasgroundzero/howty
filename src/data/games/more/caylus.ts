/** Caylus: workers along a road of buildings, with the provost and bailiff deciding how far the road is active. */
import { C, L, On as On0, OnP, P, R, S, T, at, board, by, cubes, discs, ft, mv, pawns, pile, spawn, tabletop, tiles } from '../compose'
import type { Item, Place } from '../compose'
import { slotUV } from '../layouts'

/** On() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })

const SLOT = slotUV(7, 4)
const spot = (i: number, du = 0, dv = 0): [number, number] => [SLOT(i)[0] + du, SLOT(i)[1] + dv]
const GOODS = ['#e39ab0', '#8a5a34', '#8a8f98', '#7a4fa3', '#e0b12f']

export const caylus = tabletop('caylus', 'Caylus', [2, 5], 4, '90–150 min', 'Hard', 'Place workers and build the king\'s castle.', ['#8a8f98', '#e39ab0', '#2e6fb7'], (n) => ({
  setup: [
    S('Unfold the board', 'Place the board in the middle of the table.', 'c', [
      C(board('town', 12.5, 8, 'g:slots:7x4:#d8cfae:#7a6a4a:Caylus', 'Game board', 'A road of building spaces leading away from the castle, with the prestige track round the edge. This drawing is schematic: the real road winds across the board.')),
    ]),
    S('Neutral buildings', 'Shuffle the 6 pink neutral building tiles and place them face up at random on the first 6 empty spaces of the road, after the printed special buildings.', 'town',
      [7, 8, 9, 10, 11, 12].map((s, i) => On('town', ...spot(s, 0, -0.025), tiles(`pink${i}`, 1, 0.9, 0.7, ft('#f3c9d3', '', '', '⌂'), 'Neutral building', '6 pink tiles. A worker placed here earns its owner the goods or service shown when the building is activated.'))),
    ),
    S('Bailiff and provost', 'Put the white bailiff and provost together on the last of the six pink neutral buildings.', 'town', [
      On('town', ...spot(12, -0.03, 0.045), pawns('bailiff', 1, '#e9e4d8', 'Bailiff', 'The tall white piece. It moves steadily along the road and its position triggers the three castle scorings.', { scale: 0.5 })),
      On('town', ...spot(12, 0.03, 0.045), discs('provost', 1, 0.16, '#e9e4d8', 'Provost', 'The white disc. Only buildings up to the provost are activated each turn, and players can pay to move it.', { h: 0.2 })),
    ], 'Both start on the sixth pink tile, so the first turn activates the road only as far as that tile unless the provost is moved.'),
    S('Stock the supplies', 'Sort the brown, grey and blue building tiles face up by color beside the board, pile the green ones nearby, and put the goods cubes and deniers in a general stock.', 'r', [
      R(tiles('build', 4, 0.9, 0.9, ['#8a5a34', '#8a8f98', '#3d8b4a', '#2e6fb7'], 'Building tiles', 'Wooden (brown), stone (grey), residential (green) and prestige (blue) buildings that players add to the road.', { h: 0.3 })),
      L(pile('stock', GOODS, 'Goods cubes', 'Food (pink), wood (brown), stone (grey), cloth (purple) and gold (yellow).'), pile('bank', '#c9c9c9', 'Deniers', 'The money of the game.', 'disc')),
    ]),
    S('Player pieces', 'Each player takes the 6 workers, 20 houses and 7 marker discs of one color.', 'you', [
      P(
        pawns('worker', 6, '$', 'Workers', '6 workers per player. Each turn you pay to place them on buildings one at a time.', { scale: 0.4, cols: 3 }),
        pile('houses', '$', 'Houses', 'Mark the buildings you construct and the parts of the castle you build.'),
        discs('cash', 1, 0.25, '#c9c9c9', 'Your deniers', n === 2 ? 'With 2 players both start with 5 deniers.' : 'Starting money depends on turn order: 5 deniers for the first player, 6 for the second and third, 7 for the fourth and fifth.', { label: '◆', h: 0.14, ink: '#2b241c' }),
        cubes('goods', 3, [GOODS[0], GOODS[0], GOODS[1]], 'Your goods', 'Each player starts with 2 food cubes and 1 wood cube.', { s: 0.26 }),
      ),
    ], 'Everyone starts with 2 food and 1 wood. Deniers are handed out once turn order is set.'),
    S('Markers on the board', 'Decide turn order at random and put one marker each on the turn order track. Put one on 0 of the prestige track, one on the bridge by the passing scale and four on the starting spaces of the royal favor table.', 'town', [
      OnP('town', 0.07, 0.4, discs('order', 1, 0.13, '$', 'Turn order marker', 'Shows who acts first. A special building lets you change your place in the order.'), [0, 0.32]),
      OnP('town', 0.5, 0.975, discs('score', 1, 0.11, '$', 'Prestige marker', 'Your score. You gain prestige by building and by sending goods to the castle.'), [0.3, 0]),
    ], n === 2 ? 'Both players take 5 deniers. With 2 players turn order alternates every turn and the stables are not used.' : 'First player takes 5 deniers, second and third take 6, fourth and fifth take 7.'),
    S('Ready to play', 'The first player on the turn order track begins.', 'all', [], 'Each turn: collect income, place workers, activate the special buildings, move the provost, activate the road, build the castle, then move the bailiff.'),
  ],
  turn: [
    T('Collect income', 'Everyone takes 2 deniers from the stock, plus 1 for each residence they own later in the game.', 'you', [
      spawn(discs('inc', 1, 0.25, '#c9c9c9', 'Income', '2 deniers of income.', { label: '2', h: 0.06, ink: '#2b241c' }), at('cash', 0.5, 0.5), 'bank'),
    ]),
    T('Place workers', 'In turn order each player pays 1 denier to put a worker on an empty building, or passes. The first to pass gets 1 denier, and placing on any building but your own costs more once others have passed.', 'town', [
      mv('worker.0', at('town', ...spot(8, 0, 0.045))),
      mv('worker.0@1', at('town', ...spot(10, 0, 0.045))),
    ]),
    T('Move the provost', 'In passing order, each player may pay deniers to move the provost up to 3 spaces either way. Here someone pays 1 to push it one space forward.', 'town', [mv('provost', at('town', ...spot(13, 0.03, 0.045)))]),
    T('Activate the buildings', 'Going along the road as far as the provost, each worker takes the effect of its building and comes home. Your building gives you a cube.', 'town', [
      spawn(cubes('gain', 1, GOODS[2], 'Stone cube', 'A good produced by a building.', { s: 0.26 }), by('goods', 0.94, 0), 'stock'),
      mv('worker.0', by('worker.1', -0.46, 0)),
      mv('worker.0@1', by('worker.1@1', -0.46, 0)),
    ]),
    T('Castle, then the bailiff', 'Workers at the castle hand in batches of food plus two other different goods for prestige. Then the bailiff moves 1 space, or 2 if the provost is ahead of it, and the provost joins it.', 'town', [
      mv('bailiff', at('town', ...spot(14, -0.03, 0.045))),
      mv('provost', at('town', ...spot(14, 0.03, 0.045))),
    ]),
    T('Three scorings', 'The dungeon, the walls and the towers are each scored when the bailiff reaches their mark or the section is full. The game ends after the towers are scored. Leftover gold, other goods and deniers add a few points, and the most prestige wins.', 'all'),
  ],
}))
