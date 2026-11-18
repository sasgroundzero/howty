/** Tikal: place a jungle tile, then spend 10 action points on your expedition. */
import { C, On as OnBase, OnP, P, R, S, T, at, board, discs, f, ft, hexes, mv, pawns, pile, spawn, tabletop, tiles } from '../compose'
import { hexUV } from '../layouts'

/** compose.On leaves `spread` unset, which the composer reads for every "on" placement, so set it here. */
const On = (...a: Parameters<typeof OnBase>) => ({ ...OnBase(...a), spread: [0, 0] as [number, number] })

const H = hexUV(6, 5)

export const tikal = tabletop('tikal', 'Tikal', [2, 4], 4, '90 min', 'Medium', 'Spend action points exploring jungle temples.', ['#5f7f4a', '#d9c9a0', '#8a5a2b'], () => ({
  setup: [
    S('Lay out the jungle board', 'Place the board in the middle of the table. Four spaces are already printed on it: the base camp where every expedition begins, two temples and a jungle space.', 'c', [
      C(board('map', 11, 8, 'g:hex:6x5:#5f7f4a:#2f4a2a:Jungle', 'Jungle board', 'A field of empty hex spaces that fills up with terrain tiles. The scoring track runs round the edge. This drawing is schematic.')),
      On('map', H(2, 0)[0], H(2, 0)[1], discs('base', 1, 0.5, '#d9c9a0', 'Base camp', 'The printed starting space. New expedition members enter the board here.', { label: '⌂', h: 0.03, ink: '#2b241c' })),
    ]),
    S('Stack the terrain tiles', 'Sort the 36 hex terrain tiles by the letter on the back, shuffle each letter group, and stack them face down with A on top and G at the bottom.', 'r', [
      R(tiles('terrain', 1, 1.3, 1.3, f('#2f4a2a', 'A'), 'Terrain tile stack', '36 hex tiles lettered A to G: jungle, temples, treasure sites and 3 volcanoes. You draw and place one at the start of every turn.', { h: 0.6 })),
    ]),
    S('Temple tiles and treasures', 'Sort the square temple tiles by number into stacks. Shuffle the 24 round treasure tokens face down into two stacks.', 'r', [
      R(
        tiles('temples', 4, 0.6, 0.6, [2, 3, 4, 5].map((v) => ft('#d9c9a0', `${v}`)), 'Temple tiles', 'Numbered temple levels, stacked by value. Uncovering a level makes a temple worth more points.', { h: 0.3 }),
        discs('treasure', 1, 0.3, '#8a5a2b', 'Treasure tokens', '24 tokens, 8 kinds with 3 of each. Sets of the same kind score more.', { label: '?', h: 0.4 }),
      ),
    ]),
    S('Take your expedition', 'Each player takes the pieces of one color: 18 expedition members, 1 expedition leader and 2 camps. Put your scoring marker beside space 1 of the scoring track.', 'you', [
      P(
        pile('crew', '$', 'Expedition members', '18 workers per player. They enter at a camp and count 1 each toward controlling a temple.', 'meeple'),
        pawns('leader', 1, '$', 'Expedition leader', '1 per player. The leader counts as 3 workers when deciding who controls a temple.', { scale: 0.7, shape: 'hero' }),
        tiles('camps', 2, 0.6, 0.6, '$', 'Camps', '2 per player. A camp placed in the jungle becomes a second place where your workers can enter.', { h: 0.2 }),
      ),
      OnP('map', 0.5, 0.975, discs('score', 1, 0.13, '$', 'Scoring marker', 'Moves along the track in each scoring round.', { h: 0.08 }), [0.34, 0]),
    ]),
    S('Ready to play', 'The oldest player starts; play then runs clockwise.', 'all', [], 'On your turn you first draw and place the top terrain tile, then spend up to 10 action points.'),
  ],
  turn: [
    T('Draw and place a terrain tile', 'You turn over the top tile and place it on any empty space next to a tile or printed space, so that it can be reached.', 'map', [
      spawn(hexes('newtile', 1, 0.8, '#b9a36a', 'Temple tile', 'A terrain tile showing a temple. The stones on its edges show what it costs to step across.', { label: '1' }), at('map', H(2, 1)[0], H(2, 1)[1]), 'terrain'),
    ]),
    T('Bring in workers', 'Placing a worker in the base camp costs 1 action point each. You bring in two.', 'map', [
      spawn(pawns('w', 2, '$', 'Expedition member', 'One of your workers on the board.', { scale: 0.5, gap: 0.1 }), at('base', 0.5, 0.5), 'crew', '#c0392b'),
    ]),
    T('Move into the jungle', 'Moving to the next tile costs 1 action point for each stone on the border you cross.', 'map', [mv('w.1', at('newtile', 0.5, 0.55))]),
    T('Uncover a temple level', 'With a worker at a temple you can pay 2 action points to add the next higher temple tile on top, raising its value.', 'map', [
      spawn(tiles('lvl', 1, 0.45, 0.45, ft('#d9c9a0', '2'), 'Temple level', 'A higher temple level. The top number is what the temple is worth.', { h: 0.1 }), at('newtile', 0.5, 0.18), 'temples.0'),
    ], 8),
    T('Volcanoes and the finish', 'When a volcano tile is drawn, each player in turn takes 10 action points and then scores the temples they control and their treasures. After the last tile there is one final scoring, and the highest score wins.', 'all'),
  ],
}))
