/** Through the Desert: pastel camel caravans on a hex desert, with oases and water holes to reach. */
import { C, L, On as On0, P, R, S, T, at, board, cubes, discs, mv, pawns, pile, spawn, tabletop, zone } from '../compose'
import type { Item, Place } from '../compose'
import { hexUV } from '../layouts'

/** On() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })

const H = hexUV(14, 9)
const PC = ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a', '#7a4fa3']
const CAMEL = ['#e7a9a0', '#a9d3b0', '#a9c4e6', '#ead98f', '#cfb0e0']
const CNAME = ['Rose', 'Mint', 'Sky', 'Sand', 'Lilac']
const OASIS: [number, number][] = [[2, 5], [5, 2], [8, 6], [11, 2], [12, 7]]
const WATER: [number, number][] = [[5, 0], [11, 0], [1, 1], [6, 1], [11, 1], [2, 3], [6, 3], [11, 4], [8, 4], [3, 5], [12, 5], [2, 6], [8, 8], [6, 8], [1, 7]]
const SPOT: [number, number][] = [
  [1, 0], [7, 0], [13, 0], [3, 1], [9, 1], [0, 2], [7, 2], [13, 2], [3, 3], [9, 3], [0, 4], [5, 4], [7, 4],
  [13, 4], [4, 5], [10, 5], [0, 6], [5, 6], [11, 6], [2, 7], [7, 7], [10, 7], [0, 8], [4, 8], [9, 8],
]
const camel = (id: string, k: number) => cubes(id, 1, CAMEL[k], `${CNAME[k]} camel`, 'A camel in one of the five caravan colors. Camels belong to nobody: only the rider at the head of a caravan shows whose it is.', { s: 0.34 })

export const throughTheDesert = tabletop('through-the-desert', 'Through the Desert', [2, 5], 4, '45 min', 'Easy', 'Grow camel caravans across the desert.', ['#e6cf9a', '#a9c4e6', '#3d8b4a'], (n) => {
  const lead = n === 5 ? 4 : 5
  return {
    setup: [
      S('Lay out the desert', 'Place the board in the middle of the table.', 'c', [
        C(board('desert', 12, 8, 'g:hex:14x9:#e6cf9a:#c98f4a:Desert', 'Desert board', 'A desert of hexagonal spaces ringed by mountains. This drawing is schematic, not the real map.')),
      ], 'With fewer players the rules close off part of the board: check the rulebook for which part.'),
      S('Plant the oases', 'Stand the 5 palm trees on oasis spaces marked on the board.', 'desert',
        OASIS.map(([c, r], i) => On('desert', ...H(c, r), pawns(`palm${i}`, 1, '#3d8b4a', 'Palm tree (oasis)', '5 palm trees. A caravan that reaches a space next to an oasis scores 5 points, once per caravan per oasis.', { scale: 0.5 }))),
      ),
      S('Scatter the water holes', 'Mix the water hole tokens and place one face up on every marked water hole space.', 'desert', [
        ...WATER.map(([c, r], i) => On('desert', ...H(c, r), discs(`wh${i}`, 1, 0.2, '#5fa8d3', 'Water hole token', 'Worth 1, 2 or 3 points. Put a camel on its space and you take the token. Only some of the tokens are drawn here.', { label: ['1', '2', '3'][i % 3], h: 0.06 }))),
        R(discs('chips', 1, 0.3, '#e0b12f', 'Point chips', 'Chips handed out for reaching oases, enclosing areas and, at the end, the longest caravans.', { label: '5', h: 0.3 })),
      ]),
      S('Sort the camels', 'Sort the camels into five supplies by color beside the board.', 'l', [
        L(...[0, 1, 2].map((k) => pile(`camels${k}`, CAMEL[k], `${CNAME[k]} camels`, 'A shared supply of one camel color. With fewer players some camels are left in the box: the rulebook lists how many.'))),
        L(...[3, 4].map((k) => pile(`camels${k}`, CAMEL[k], `${CNAME[k]} camels`, 'A shared supply of one camel color. The game ends the moment any one color runs out.'))),
      ]),
      S('Take your riders', 'Each player takes the riders of one color and seats one on a camel of each caravan color. Keep a spare rider in front of you to show your color.', 'you', [
        P(pawns('rider', 1, '$', 'Spare rider', 'Shows which color you are playing. Your other riders sit on your caravan leaders.', { scale: 0.5 }), zone('haul', 3.6, 1.6, 'Your points', 'Keep the water hole tokens and point chips you collect here, face down.')),
      ], n === 5 ? 'With five players each player runs one caravan fewer: check the rulebook for which color you leave out.' : undefined),
      S('Place the caravan leaders', `Starting with the first player and going clockwise, take turns placing one mounted leader on an empty space until all ${lead} of yours are out.`, 'desert',
        Array.from({ length: n * lead }, (_, i) => i).flatMap((i) => [
          On('desert', ...H(...SPOT[i]), camel(`lead${i % n}_${Math.floor(i / n)}`, Math.floor(i / n))),
          On(`lead${i % n}_${Math.floor(i / n)}`, 0.5, 0.5, pawns(`ride${i % n}_${Math.floor(i / n)}`, 1, PC[i % n], 'Caravan leader', 'A rider marks the first camel of one of your caravans. Every camel you add in that color must connect to it.', { scale: 0.34 })),
        ]),
        'A leader may not start on a water hole or next to an oasis. The rulebook has further limits on starting next to other leaders.',
      ),
      S('Ready to play', 'The first player begins, then play passes clockwise. On your turn you take 2 camels from the supplies and add each to one of your caravans.', 'all', [], 'Some editions limit the opening turns to a single camel: check your rulebook.'),
    ],
    turn: [
      T('Add two camels', 'You take two rose camels. The first goes next to your rose leader, the second onto the water hole beside it, so you collect that token.', 'desert', [
        mv('wh2', at('haul', 0.2, 0.5)),
        spawn(camel('c1', 0), at('desert', ...H(2, 0)), 'camels0'),
        spawn(camel('c2', 0), at('desert', ...H(1, 1)), 'camels0'),
      ]),
      T('Next player extends a caravan', 'The player on your left adds two camels to their own rose caravan. Two caravans of the same color owned by different players may never touch.', 'desert', [
        spawn(camel('c3', 0), at('desert', ...H(8, 0)), 'camels0'),
        spawn(camel('c4', 0), at('desert', ...H(6, 0)), 'camels0'),
      ]),
      T('Reach an oasis', 'Later, when one of your caravans reaches a space next to a palm tree, you take 5 points straight away.', 'haul', [
        spawn(discs('oasis5', 1, 0.3, '#e0b12f', 'Oasis points', '5 points for linking a caravan to an oasis.', { label: '5', h: 0.08 }), at('haul', 0.5, 0.5), 'chips'),
      ]),
      T('Fence off an area', 'If one caravan closes off part of the desert, using the board edge or mountains if you like, you score every space inside and take any water holes there.', 'desert'),
      T('The last camel', 'The game ends at once when the last camel of any color is taken. Whoever has the longest caravan in each color earns a bonus, then the most points wins.', 'all'),
    ],
  }
})
