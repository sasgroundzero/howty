/** Yokohama: a town of area boards, a president and assistants for each player, and a warehouse board. */
import { C, L, On, OnP, P, R, S, T, at, board, by, cards, cubes, deck, discs, f, ft, hide, mat, mv, pawns, pile, spawn, tabletop, tiles } from '../compose'

const GOODS = ['#b8733a', '#e9e4d8', '#3d8b4a', '#4f8fb7']
const AREA = ['#d8c9a3', '#c9d3b0', '#d9c2a8', '#c2cfd6', '#d6cdb8', '#cbbfa6'].map((c) => ft(c, 'AREA', 'action', '⌂'))
const MGMT = ['CHURCH', 'CUSTOMS', 'PORT', 'LABORATORY', 'PORT', 'LABORATORY']
const helper = (id: string, k: number) => pawns(id, k, '$', 'Assistant', 'An assistant on an area adds 1 to your power there, and lets your president walk through or stop there.', { scale: 0.4, gap: 0.08 })

export const yokohama = tabletop('yokohama', 'Yokohama', [2, 4], 3, '90 min', 'Hard', 'Send your president around a trading port.', ['#b8733a', '#3d6b8a', '#e0b12f'], (n) => {
  const A = n === 2 ? 10 : n === 3 ? 14 : 18
  const M = n + 2
  return {
    setup: [
      S('Build the town', `Shuffle the area boards face down and lay out ${A} of them face up in the pattern the rulebook shows for ${n} players.`, 'c', [
        C(tiles('area', A, 1.9, 1.4, AREA, 'Area boards', `18 area boards in the box; ${A} are used with ${n} players (10, 14 or 18 for 2, 3 or 4). Each offers one action, which is stronger the more power you have there.`, { cols: n === 4 ? 6 : 5, gap: 0.12, h: 0.05 })),
      ], 'The scene uses a plain grid. The rulebook shows the real shape for each player count and which boards to leave out.'),
      S('Building sites and bonus tokens', 'Put one building site card beside each area board and one 5-power token on each board. Return the spares to the box.', 'c',
        Array.from({ length: A }, (_, k) => On(`area.${k}`, 0.84, 0.22, discs(`five${k}`, 1, 0.14, '#e0b12f', '5-power token', 'A one-time bonus for the first player to take this area action with 5 power.', { h: 0.06 }))),
        'Building site cards are where shophouses and trading houses go. They are left out of this scene to keep it readable.',
      ),
      S('Management boards', `Place the ${M} management boards used with ${n} players around the town and fill their spaces with order cards and technology cards.`, 'l', [
        L(tiles('mgmt', M, 2.2, 1.6, MGMT.slice(0, M).map((m) => ft('#e3d6b8', m, 'board', '≡')), 'Management boards', `Church, Customs, Port and Laboratory boards. 4 are used with 2 players, 5 with 3 and 6 with 4, so ${M} here.`, { cols: 2, h: 0.05 })),
        R(deck('orders', n === 2 ? 20 : n === 3 ? 31 : 36, f('#3d6b8a', '⚑'), 'Order card deck', `Order cards ask for trade goods and pay out points and rewards. ${n === 2 ? '20' : n === 3 ? '31' : 'All 36'} are used with ${n} players.`), deck('tech', 30, f('#6b4a7a', '✦'), 'Technology card deck', '30 technology cards, bought at the laboratory for lasting abilities. Fill the Laboratory boards from this deck.'), cards('achieve', 3, ft('#f3e7c5', 'GOAL', 'A / B / C', '★'), 'Achievement cards', 'Draw one each from the A, B and C decks. Meet a card’s condition and place an assistant on it to score.')),
      ]),
      S('Supplies and the score track', 'Set out the trade goods, imported goods, yen and foreign agent tokens, and lay the victory point track beside the town.', 'all', [
        C(board('vp', 10, 1, 'g:plain:0:#e3d6b8:#8a5a2b:Victory points', 'Victory point track', 'Each player has a scoring disc that starts on 0.')),
        OnP('vp', 0.08, 0.5, discs('score', 1, 0.14, '$', 'Scoring disc', 'Tracks your victory points.'), [0.34, 0]),
        R(pile('goods', GOODS, 'Trade goods', 'Copper, raw silk, tea and seafood, used to fill orders. There are also imported goods tokens, worth a point each at the end.'), pile('bank', '#e0b12f', 'Yen', 'The money supply.', 'disc'), tiles('agents', 1, 0.8, 0.8, f('#7a2e2e', '⚔'), 'Foreign agent tokens', 'Earned by collecting country icons. Flip one to take an extra area action without your president.', { h: 0.2 })),
      ]),
      S('Player pieces', 'Each player takes a warehouse board, a president, 8 assistants and 2 shophouses in hand, and one each of copper, raw silk, tea and seafood. The rest of their pieces start on the warehouse.', 'you', [
        P(mat('ware', 4.2, 2.4, '$', 'Warehouse', 'Warehouse board', 'Stores the pieces you have not yet unlocked: 12 more assistants, 6 more shophouses and your 4 trading houses.'), pawns('pres', 1, '$', 'President', 'Your one president. Where it stops is where you take an action.')),
        On('ware', 0.3, 0.55, pile('stock', '$', 'Assistants in the warehouse', '12 assistants start here. The Employment Agency area lets you bring them out.', 'meeple')),
        P(pile('asst', '$', 'Assistants in hand', '8 assistants to begin with. You place them on areas each turn and get them back when you act there.', 'meeple'), cubes('mine', 4, GOODS, 'Starting trade goods', 'One copper, one raw silk, one tea and one seafood.', { s: 0.26 }), discs('yen', 1, 0.2, '#e0b12f', 'Starting yen', 'The starting player begins with 3 yen and everyone else with 4.', { label: '¥', ink: '#2b241c' }), cards('order', 1, ft('#dfe8ee', 'ORDER', 'goods', '⚑'), 'Starting order card', 'Draw 2 order cards, keep 1 secretly and return the other to the box. You may hold at most 3 orders.', { down: true })),
      ]),
      S('Ready to play', 'Give the start player card to whoever most recently visited Yokohama. It never changes hands, and play passes clockwise.', 'all', [], 'A turn is: place assistants, move your president, take the action of the area where it stops, then take back your assistants from there. Orders, achievements and foreign agents can be used before or after.'),
    ],
    turn: [
      T('Place assistants', 'Place either 1 assistant in each of 3 different areas, or 2 assistants in the same area. You spread three across the town.', 'c', [1, 2, 3].map((k) => spawn(helper(`a${k}`, 1), at(`area.${k}`, 0.3, 0.62), 'asst'))),
      T('Move your president', 'Your president moves step by step and may only enter areas that hold one of your assistants. It cannot stop where another president stands (passing through costs that owner 1 yen) or go back to where it started. On your first turn it comes from your hand onto any such area.', 'c', [mv('pres', at('area.2', 0.62, 0.6))]),
      T('Take the area action', 'Your power is 2 here: the president plus one assistant. More power means a bigger reward, here a trade good. Then every assistant in that area returns to your hand.', 'area.2', [
        spawn(cubes('gain', 1, GOODS[2], 'Trade good', 'Gained from an area action and spent to fill orders.', { s: 0.26 }), by('mine.0', -0.5, 0), 'goods'),
        hide('a2', 1.6),
      ]),
      T('Next player', 'The next player stacks 2 assistants in a single area to build power there quickly. Placing where another president stands costs 1 yen to its owner per assistant.', 'c', [
        spawn(helper('b', 2), at('area.6', 0.4, 0.62), 'asst@1', '#2e6fb7'),
      ]),
      T('Building and orders', 'With 4 or more power you may also build a shophouse or trading house there. Before or after your main action you can fill an order for points, claim an achievement or use a foreign agent.', 'you', [hide('order'), mv('score', at('vp', 0.3, 0.5))]),
      T('End of the game', `The end is triggered when someone builds all 8 shophouses or all 4 trading houses, the order deck runs dry, or ${n + 2} assistants stand on the Church or the Customs board. Finish the round, play one more full round, then score the Church, Customs, technology and country bonuses and leftovers; most points wins.`, 'all'),
    ],
  }
})
