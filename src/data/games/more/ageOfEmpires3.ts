/** Age of Empires III: The Age of Discovery: place colonists on event boxes, then resolve them in order. */
import { C, On as OnBase, OnP, P, R, S, T, at, board, discs, ft, mv, pawns, pile, tabletop, tiles, zone } from '../compose'
import { cityUV, slotUV } from '../layouts'

/** compose.On leaves `spread` unset, which the composer reads for every "on" placement, so set it here. */
const On = (...a: Parameters<typeof OnBase>) => ({ ...OnBase(...a), spread: [0, 0] as [number, number] })

const BOX = slotUV(8, 1)
const BOXES = ['Initiative', 'Colonist dock', 'Trade goods', 'Merchant ship', 'Capital building', 'Discovery', 'Specialists', 'Warfare']
const REGIONS = [0, 1, 2, 3, 5, 7, 8, 10]

export const ageOfEmpires3 = tabletop('age-of-empires-3', 'Age of Empires III: The Age of Discovery', [2, 5], 4, '2 hours', 'Medium', 'Send colonists to claim the New World.', ['#cdbf96', '#2e6fb7', '#8a5a2b'], () => ({
  setup: [
    S('Lay out the board', 'Place the board in the middle. It shows the regions of the New World and, on the real board, the row of event boxes.', 'c', [
      C(board('map', 13, 7.6, 'g:map:0:#cdbf96:#6f9a8a:New World', 'New World map', 'Regions of the Americas to discover and colonise. This drawing is schematic, not the real map.')),
      C(board('events', 13, 2.2, 'g:slots:8x1:#d8cfae:#8a5a2b:Event boxes', 'Event boxes', 'Eight boxes, resolved from left to right each turn: initiative, colonist dock, trade goods, merchant shipping, capital buildings, discovery, specialists and warfare. On the real board they are printed along the side of the map.')),
    ]),
    S('Discovery tiles', 'Shuffle the discovery tiles and place one face down on each region that has not been discovered yet. The starting region stays open.', 'map', [
      ...REGIONS.map((c, k) => On('map', cityUV(c)[0], cityUV(c)[1], tiles(`disc${k}`, 1, 0.7, 0.7, '#6f5a3c', 'Discovery tile', 'Face down on an undiscovered region. It hides how many natives defend the region and the reward for discovering it.', { h: 0.05 }))),
    ], 'Which region starts open is marked on the board.'),
    S('Capital buildings and trade goods', 'Lay out the first age\'s capital buildings face up, and draw trade good tiles onto the trade goods box.', 'r', [
      R(tiles('buildings', 5, 1.0, 1.0, ft('#e6d9b8', 'I', '', '⌂'), 'Capital buildings', 'Buildings give lasting bonuses. The standard rules show five at a time from the current age: check the rulebook if your edition differs.', { cols: 3 })),
      R(
        tiles('goods', 4, 0.7, 0.7, [ft('#f3e7c5', '', '', '●'), ft('#f3e7c5', '', '', '◆'), ft('#f3e7c5', '', '', '▲'), ft('#f3e7c5', '', '', '★')], 'Trade goods on offer', '4 trade goods are available each turn. Sets of goods raise your income.', { cols: 2 }),
        tiles('goodsbag', 1, 0.7, 0.7, '#8a5a2b', 'Trade good supply', 'The rest of the trade good tiles, drawn to refill the box each turn.', { h: 0.4 }),
      ),
    ]),
    S('Bank and specialists', 'Sort the coins and the specialist figures into a supply.', 'r', [
      R(
        pile('coins', '#e0b12f', 'Doubloons', 'Money for buying capital buildings and paying for warfare.', 'disc'),
        pile('specs', ['#3a3a3a', '#e9e4d8', '#7a4fa3', '#c0392b', '#3d8b4a'], 'Specialists', 'Captains, merchants, missionaries and soldiers. Each is a colonist with an extra power.', 'meeple'),
      ),
    ]),
    S('Take your colonists', 'Each player takes the figures of one color and starts with 5 colonists ready to place, plus starting money.', 'you', [
      P(
        pawns('col', 5, '$', 'Colonists', 'You begin each turn with 5 basic colonists to place, plus any specialists you earned.', { scale: 0.5, gap: 0.1 }),
        zone('hold', 2.4, 1.3, 'Your goods and buildings', 'Keep your money, trade goods and capital buildings here.'),
      ),
      OnP('events', BOX(0)[0], 0.14, discs('order', 1, 0.12, '$', 'Turn order marker', 'Shows the order in which players place colonists. It changes through the initiative box.', { h: 0.06 }), [0.3, 0]),
    ], 'Starting money depends on your place in the turn order: check the rulebook for the amounts.'),
    S('Ready to play', 'Decide the turn order at random. Players then take turns placing one colonist at a time on the event boxes until all are placed.', 'all', [], 'The game lasts 8 turns spread over three ages.'),
  ],
  turn: [
    T('Place a colonist on the dock', 'You put your first colonist on the colonist dock. Figures here sail to the New World when the box is resolved.', 'events', [mv('col.0', at('events', BOX(1)[0] - 0.02, BOX(1)[1]))]),
    T('The others place too', 'The next player also chooses the dock. Placement continues round the table, one figure each.', 'events', [mv('col.0@1', at('events', BOX(1)[0] + 0.02, BOX(1)[1]))]),
    T('Claim a trade good', 'On your next placement you take a space in the trade goods box, which will let you pick one of the tiles on offer.', 'events', [mv('col.1', at('events', BOX(2)[0], BOX(2)[1]))]),
    T('Resolve the boxes', 'When everyone has placed, the boxes are resolved left to right. Your dock colonist sails to a discovered region, and you take your trade good.', 'map', [
      mv('col.0', at('map', cityUV(6)[0], cityUV(6)[1])),
      mv('goods.0', at('hold', 0.25, 0.5)),
      mv('col.1', at('hold', 0.8, 0.5), 1.4),
    ], 8),
    T('Income and the finish', 'Each turn ends with income from trade goods and buildings. Regions are scored for colonist majorities at the end of each age. After the eighth turn, add points for discoveries and buildings: the most points wins.', 'all'),
  ],
}))
