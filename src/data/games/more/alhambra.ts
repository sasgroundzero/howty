/** Alhambra: collect money in four currencies and buy building tiles to grow your own palace. */
import { C, L, On, type Place, OnP, P, R, S, T, at, board, box, by, cards, deck, discs, draw, f, ft, hide, mat, mv, spawn, tabletop, tiles } from '../compose'
import { loopUV } from '../layouts'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const CUR = ['#2e6fb7', '#3d8b4a', '#d9772b', '#e0b12f']
const money = (c: number, v: number) => f(CUR[c], String(v))
const bld = (id: string) => tiles(id, 1, 1.1, 1.1, ft('#efe6d2', '', 'cost', '⌂'), 'Building tile', '54 building tiles of six kinds, each with a price and some with walls along their edges. They are bought from the market and added to your Alhambra.', { h: 0.1 })
const loop = loopUV(6)

export const alhambra = tabletop('alhambra', 'Alhambra', [2, 6], 4, '60 min', 'Easy', 'Buy buildings with the right money.', ['#c96b3a', '#2e6fb7', '#e0b12f'], (n) => ({
  setup: [
    S('Boards', 'Put the building market in the middle of the table and the scoring board beside it.', 'c', [
      C(board('market', 7.4, 2.2, 'g:plain:0:#e3d2ad:#c96b3a:Building market', 'Building market', 'Four spaces, one for each currency. A tile on a space can only be bought with money of that currency.')),
      L(board('track', 4.2, 4.2, 'g:ring:6:#efe6d2:#c96b3a:Scoring', 'Scoring board', 'A track round the edge records points from the three scoring rounds. The real track is longer than this drawing.')),
    ]),
    S('Fill the market', 'Put all the building tiles in the bag, then draw 4 and place one on each space of the market.', 'market', [
      R(box('bag', 1.6, 0.9, 1.6, '#7a4a2a', 'Tile bag', 'Holds the building tiles. The market is refilled from here at the end of every turn.', { round: true })),
      ...[0, 1, 2, 3].map((k) => on('market', 0.2 + k * 0.2, 0.5, bld(`b${k}`))),
    ]),
    S('Starting tiles and markers', 'Each player takes a starting tile with the fountain, a reserve board and a scoring marker, which goes at the start of the scoring track.', 'you', [
      P(tiles('fountain', 1, 1.1, 1.1, ft('#cfe0ea', '', '', '✦'), 'Starting tile', 'The fountain at the heart of your Alhambra. Every building you add must be reachable from it on foot.', { h: 0.1 }), mat('reserve', 2.4, 1.3, '$', 'Reserve', 'Reserve board', 'Tiles you buy but do not place yet wait here. They score nothing until built in.')),
      OnP('track', ...loop(3), discs('score', 1, 0.12, '$', 'Scoring marker', 'Records your points.'), [0.28, 0]),
    ]),
    S('Starting money', 'Shuffle the money cards. Deal cards face up to each player one at a time until that player’s total is 20 or more, then they take the cards into their hand.', 'you', [
      R(deck('mdeck', Math.max(20, 104 - 4 * n), f('#7a4a2a', '●'), 'Money deck', '108 money cards in four currencies, worth 1 to 9. Two scoring cards are shuffled into it.')),
      P(cards('money', 4, [money(0, 6), money(1, 3), money(2, 7), money(3, 5)], 'Your money', 'Your hand, hidden from the others. Players begin with different numbers of cards because dealing stops once the total reaches 20.')),
    ], 'The player with the fewest cards goes first. If tied, the one with the lowest total.'),
    S('Open money and scoring cards', 'Turn 4 money cards face up beside the deck. Then split the rest of the deck into 5 roughly equal piles, shuffle the first scoring card into the second pile and the other into the fourth, and stack the piles in order.', 'r', [
      R(cards('open', 4, [money(0, 2), money(3, 8), money(1, 4), money(2, 1)], 'Face-up money', 'On your turn you may take one of these cards, or several whose values add up to 5 or less.')),
    ]),
    S('Ready to play', 'The player with the fewest starting cards begins, then play passes clockwise.', 'all', [], n === 2 ? 'With 2 players the rules add an imaginary third player who collects tiles: see the rulebook for how it works. On your turn take money, buy a building, or rearrange your Alhambra.' : 'On your turn do one thing: take money, buy a building, or rearrange your Alhambra.'),
  ],
  turn: [
    T('Take money', 'You take one face-up money card into your hand.', 'r', [mv('open.1', at('money.3', 1.15, 0.5, 0.02))]),
    T('Next player buys a building', 'The next player pays at least the price of a market tile in that space’s currency and adds the tile to their Alhambra. No change is given, but paying the exact price earns another action.', 'market', [
      hide('money.0@1'),
      mv('b1', by('fountain@1', -1.2, 0)),
    ]),
    T('Refill', 'At the end of each turn, empty market spaces are refilled from the bag and face-up money is topped back up to 4 cards.', 'market', [
      draw('mdeck', by('open.0', 1.04, 0), money(1, 5)),
      spawn(bld('b4'), at('market', 0.4, 0.5), 'bag'),
    ]),
    T('Scoring cards', 'When a scoring card is drawn from the money deck, scoring happens at once. For each kind of building, the players with the most tiles of that kind score points, and everyone scores their longest outer wall.', 'track', [
      mv('score@1', at('track', ...loop(6))),
    ]),
    T('The finish', 'The game ends when the market cannot be refilled. The leftover tiles go to whoever holds the most money in each currency, a third scoring takes place, and the highest total wins.', 'all'),
  ],
}))
