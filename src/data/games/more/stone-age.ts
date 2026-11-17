/** Stone Age: a village board with resource sites, hut stacks, civilization cards and five figures each. */
import { C, L, On, OnMe, OnP, P, R, S, T, at, board, cards, cubes, deck, dice, discs, f, ft, mat, mv, pawns, pile, roll, set, spawn, tabletop, tiles } from '../compose'
import { slotUV } from '../layouts'

const slot = slotUV(4, 2)
const SITE = ['Hunting grounds', 'Forest', 'Clay pit', 'Quarry', 'River', 'Tool maker', 'Hut', 'Field']
const RES: [string, string, string, 'cube' | 'disc'][] = [
  ['Food', '#c9a36a', 'Food tokens. Each figure sent hunting rolls a die, and every full 2 pips is 1 food.', 'disc'],
  ['Wood', '#8a5a2b', 'Wood from the forest: every full 3 pips rolled is 1 wood.', 'cube'],
  ['Brick', '#c0623a', 'Brick from the clay pit: every full 4 pips rolled is 1 brick.', 'cube'],
  ['Stone', '#8d8d8d', 'Stone from the quarry: every full 5 pips rolled is 1 stone.', 'cube'],
  ['Gold', '#e0b12f', 'Gold from the river: every full 6 pips rolled is 1 gold.', 'cube'],
]
const figU = (k: number) => 0.4 + ((k - 2) * 0.54) / 4.2
const COLS = ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a']

export const stoneAge = tabletop('stone-age', 'Stone Age', [2, 4], 4, '60–90 min', 'Medium', 'Send your tribe to gather, build and feed.', ['#c9b27a', '#8a5a2b', '#3d8b4a'], (n) => ({
  setup: [
    S('Lay out the board', 'Put the board in the middle of the table.', 'c', [
      C(board('board', 12, 8, 'g:slots:4x2:#d9c89a:#7a5a2e:Stone Age village', 'Game board', `The places your figures can go. In this schematic the boxes are, from far left: ${SITE.join(', ')}. The score track runs round the edge.`)),
    ]),
    S('Stock the resource sites', 'Put the food on the hunting grounds and the wood, brick, stone and gold on the forest, clay pit, quarry and river. Put the tools by the tool maker.', 'board', [
      ...RES.map(([name, color, body, shape], i) => On('board', slot(i)[0], slot(i)[1] - 0.1, pile(`res${i}`, color, `${name} supply`, body, shape))),
      On('board', slot(5)[0], slot(5)[1] - 0.1, tiles('tools', 1, 0.7, 0.7, ft('#e9dfc8', '1/2', 'tool', '▲'), 'Tool tiles', 'A figure at the tool maker earns a tool. A tool adds its value to one of your dice rolls each round.', { h: 0.3 })),
    ]),
    S('Civilization cards and huts', `Shuffle the civilization cards and turn 4 face up on their spaces. Shuffle the building tiles into stacks of 7 and use ${n} of the stacks, one per player, each with its top tile face up.`, 'r', [
      R(deck('civdeck', 32, f('#5b6f8a', '✦'), 'Civilization deck', '36 civilization cards. You buy them with resources for an instant bonus and for points at the end.'), cards('civ', 4, ft('#f3e7c5', 'CARD', 'bonus', '✦'), 'Civilization cards', '4 on offer. They cost 1 to 4 resources depending on the space they sit on, and slide toward the cheap end as cards are bought.')),
      R(deck('huts', 7, ft('#d7c49a', 'HUT', 'points', '⌂'), 'Building stacks', `28 building tiles in the box. ${n} stacks of 7 are used with ${n} players. Pay the resources shown to score the points at once.`, { w: 1.1, d: 1.1, per: 0.08, n })),
    ], 'These sit on marked spaces along the board in the real game; they are shown beside it here to keep the picture clear.'),
    S('Dice and spare figures', 'Put the 7 dice and the leather cup within reach. Figures not yet in play wait beside the board.', 'r', [
      R(dice('dice', 7, '#e8dcc0', 'Dice', '7 dice. You roll one die for each figure you sent to a resource site.', { size: 0.5, cols: 7, values: [3, 5, 2, 6, 1, 4, 2] })),
      L(pile('spare', COLS.slice(0, n), 'Spare figures', 'Each player owns 10 figures but starts with 5. A pair of figures sent to the hut adds one more to your tribe.', 'meeple')),
    ]),
    S('Take a player board and five figures', 'Each player takes a player board, 5 figures of one color and 12 food.', 'you', [
      P(mat('pboard', 4.2, 2.6, '$', 'Tribe', 'Player board', 'Holds your figures, food, resources, tools and the buildings you have built.')),
      On('pboard', 0.4, 0.72, pawns('fig', 5, '$', 'Your figures', '5 figures to start with. Each round you send all of them out to places on the board.', { scale: 0.5 })),
      On('pboard', 0.14, 0.28, discs('food', 1, 0.3, '#c9a36a', 'Your food', 'You start with 12 food. At the end of every round each of your figures eats 1 food.', { label: '12', h: 0.2 })),
    ]),
    S('Place your markers', 'Each player puts one marker at the start of the score track and one at the bottom of the food track.', 'board', [
      OnP('board', 0.5, 0.981, discs('score', 1, 0.12, '$', 'Score marker', 'Counts the points you score during the game.', { h: 0.2 }), [0.32, 0]),
      OnP('board', 0.94, 0.5, discs('agri', 1, 0.12, '$', 'Food track marker', 'Each step up the food track feeds one of your figures for free every round.', { h: 0.1 }), [0, 0.32]),
    ]),
    S('Ready to play', 'Choose a start player and give them the start player figure. It passes to the left after every round.', 'all', [
      OnMe('pboard', 0.88, 0.25, discs('first', 1, 0.24, '#f6f1e4', 'Start player figure', 'Whoever holds this places the first figure this round.', { label: '1', h: 0.16 })),
    ], n < 4 ? 'With fewer than 4 players some places are restricted: only two of the tool maker, hut and field are used each round, and the resource sites take fewer tribes. Check the rulebook for your player count.' : 'A round has three parts: everyone places figures, everyone carries out their actions, and everyone feeds their tribe.'),
  ],
  turn: [
    T('Place figures', 'Starting with the start player, you take turns putting any number of your figures on one place. You send 2 to the forest.', 'board', [
      mv('fig.0', at('board', slot(1)[0] - 0.025, slot(1)[1] + 0.14)),
      mv('fig.1', at('board', slot(1)[0] + 0.025, slot(1)[1] + 0.14)),
    ]),
    T('Next player places', 'The player on your left sends 1 figure to the tool maker, which has room for only one.', 'board', [
      mv('fig.0@1', at('board', slot(5)[0], slot(5)[1] + 0.14)),
    ]),
    T('Keep placing', 'Placement goes round until every figure is out. Your other 3 go hunting, where there is no limit.', 'board', [0, 1, 2].map((k) => mv(`fig.${k + 2}`, at('board', slot(0)[0] + (k - 1) * 0.05, slot(0)[1] + 0.14)))),
    T('Use the forest', 'Now each player in turn resolves all of their places. For your 2 figures in the forest you roll 2 dice: 4 and 5 make 9, and 9 divided by 3 is 3 wood.', 'pboard', [
      roll('dice.0', 4), roll('dice.1', 5),
      spawn(cubes('mywood', 3, '#8a5a2b', 'Your wood', 'Resources you have gathered. Spend them on buildings and civilization cards.', { s: 0.22 }), at('pboard', 0.55, 0.28), 'res1', undefined, 1.2),
      mv('fig.0', at('pboard', figU(0), 0.72), 1.8), mv('fig.1', at('pboard', figU(1), 0.72), 2),
    ], 8),
    T('Hunt, then feed the tribe', 'Your 3 hunters roll 2, 3 and 3: 8 pips is 4 food. When all actions are done, each figure eats 1 food, so you pay 5 and have 11 left.', 'pboard', [
      roll('dice.0', 2), roll('dice.1', 3), roll('dice.2', 3),
      ...[2, 3, 4].map((k) => mv(`fig.${k}`, at('pboard', figU(k), 0.72), 1 + k * 0.2)),
      set('food', { label: '11' }),
    ], 8),
    T('End of the game', 'The game ends when the civilization cards cannot be refilled to 4 at the start of a round, or when a building stack is empty at the end of one. Add the points from your civilization cards to your score, and the highest total wins.', 'all'),
  ],
}))
