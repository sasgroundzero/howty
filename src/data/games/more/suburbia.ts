/** Suburbia: a real estate market of hex tiles, a borough for each player and a shared population track. */
import { C, L, On as On0, OnP, P, R, S, T, at, board, by, cards, cubes, discs, f, ft, hexes, hide, mat, mv, pile, set, spawn, tabletop, zone } from '../compose'
import type { Item, Place } from '../compose'

/** On() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })

const SLOT = (i: number) => 0.1 + i * 0.133
const KIND = ['#3d8b4a', '#8a8f98', '#e0b12f', '#2e6fb7']
const COST = ['+10', '+8', '+6', '+4', '+2', '+0', '+0']
const market = (id: string, k: number) => hexes(id, 1, 0.5, KIND[k % 4], 'Market tile', 'A building for sale. You pay the price printed on the tile plus the extra cost of the market slot it sits in.')

export const suburbia = tabletop('suburbia', 'Suburbia', [1, 4], 3, '90 min', 'Medium', 'Buy hex buildings and grow your borough.', ['#3d8b4a', '#e0b12f', '#2e6fb7'], (n) => ({
  setup: [
    S('Set out the boards', 'Put the real estate market board in the middle of the table with the population board below it.', 'c', [
      C(board('market', 10.5, 2.2, 'g:plain:0:#d9d2c0:#6b7a8f:Real Estate Market', 'Real estate market', 'Seven slots for tiles. The slots add from 10 down to 0 to the price, cheapest at the far end from where new tiles arrive.')),
      C(board('pop', 10.5, 1.6, 'g:lanes:14:#efe6d2:#b0563a:Population', 'Population board', 'The scoring track. Population is your score, and crossing each red line on the track lowers your income and reputation by 1.')),
    ]),
    S('Build the tile stacks', 'Sort the building tiles by the letter on their backs into A, B and C stacks, using the number of tiles the rulebook gives for your player count. Mix the "1 More Round" tile into the C stack as the rulebook describes.', 'stacks', [
      R(hexes('stacks', 3, 0.5, ['#c9b48a', '#b89a6a', '#9c7d52'], 'Building tile stacks', 'Face-down stacks marked A, B and C, used in that order. The size of each stack depends on the player count: check the rulebook.', { label: ['A', 'B', 'C'], gap: 0.3 })),
      R(hexes('basic', 3, 0.5, [KIND[0], KIND[1], KIND[2]], 'Basic tiles', 'Three stacks that are always for sale: Suburbs, Community Park and Heavy Factory.', { label: ['S', 'P', 'F'], gap: 0.3 })),
    ]),
    S('Fill the market', 'Turn over tiles from the A stack to fill all 7 slots of the market.', 'market',
      [0, 1, 2, 3, 4, 5, 6].map((i) => On('market', SLOT(i), 0.5, market(`mk${i}`, i + 1))),
      `Slot costs from left to right: ${COST.join(', ')} (in millions).`,
    ),
    S('Reveal the goals', n > 1 ? `Turn ${n} goal tiles face up beside the board, one per player. Then deal 2 goal tiles to each player, who keeps 1 secretly and returns the other to the box.` : 'Set out goal tiles as the solo rules in the rulebook describe.', 'goals', [
      L(cards('goals', n, ft('#f3e7c5', 'GOAL', 'most or fewest', '★'), 'Public goals', '20 goal tiles in the game. A public goal gives bonus population at the end to the one player who meets it best.', { w: 1, d: 1 })),
      L(pile('bank', '#e0b12f', 'Money', 'Coins in millions of dollars. Income is paid from here at the end of every turn.', 'disc')),
    ], n === 1 ? 'Solo play uses its own variant rules, which change the goals and the market: check the rulebook.' : undefined),
    S('Borough boards and starting tiles', 'Each player takes a borough board and places one Suburbs, one Community Park and one Heavy Factory in a column below it, in that order.', 'you', [
      P(mat('borough', 4, 1.6, '$', 'Borough', 'Borough board', 'Tracks your income (money gained or lost each turn) and your reputation (population gained or lost each turn).')),
      P(
        hexes('start', 3, 0.5, [KIND[0], KIND[1], KIND[2]], 'Starting tiles', 'Suburbs on top, then Community Park, then Heavy Factory. Every tile you add must touch a tile you already have.', { cols: 1, gap: 0.02, label: ['S', 'P', 'F'] }),
        zone('grow', 1, 3, 'Build here', 'Your borough grows outward from the starting column.'),
        cards('goal', 1, f('#5a4634', '★'), 'Secret goal', 'Only you can score this goal at the end of the game.', { down: true, w: 0.9, d: 0.9 }),
        discs('cash', 1, 0.3, '#e0b12f', 'Your money', 'Each player starts with 15 million dollars.', { label: '15', h: 0.2, ink: '#2b241c' }),
        cubes('invest', 3, '$', 'Investment markers', '3 per player. Pay a tile\'s price again to put one on it and double its effect.', { s: 0.25, gap: 0.1 }),
      ),
    ]),
    S('Set the starting markers', 'Put your income cylinder on 0 and your reputation cylinder on 1, and your population marker on the starting space of the population board.', 'borough', [
      On('borough', 0.3, 0.55, discs('inc', 1, 0.14, '#e0b12f', 'Income marker', 'Starts at 0. At the end of each turn you gain or pay this much money.', { h: 0.25 })),
      On('borough', 0.7, 0.55, discs('rep', 1, 0.14, '#2e6fb7', 'Reputation marker', 'Starts at 1. At the end of each turn your population changes by this much.', { h: 0.25 })),
      OnP('pop', 0.08, 0.5, cubes('score', 1, '$', 'Population marker', 'Your score. The rulebook marks the starting space on the population board.', { s: 0.22 }), [0, 0.28]),
    ]),
    S('Ready to play', 'Pick a start player at random and give them the start player marker. Play passes clockwise.', 'all', [], 'On your turn: take a tile or place an investment marker, collect or pay income, adjust your population, then refill the market.'),
  ],
  turn: [
    T('Buy a tile', 'You take a tile from one of the free slots, pay the 6 million printed on it, and add it next to your starting column.', 'market', [
      mv('mk5', by('start.1', 0.92, 0)),
      set('cash', { label: '9' }),
    ]),
    T('Apply its effects', 'The tile raises your income by 1, so slide the income marker up. Then take your income and add your reputation to your population.', 'you', [
      mv('inc', at('borough', 0.38, 0.55)),
      mv('score', at('pop', 0.15, 0.5)),
    ]),
    T('Refill the market', 'Slide the remaining tiles toward the cheap end to close the gap, and turn over a new tile into the most expensive slot.', 'market', [
      ...[4, 3, 2, 1, 0].map((i) => mv(`mk${i}`, at('market', SLOT(i + 1), 0.5))),
      spawn(market('mk7', 3), at('market', SLOT(0), 0.5), 'stacks.0'),
    ]),
    T('Or take a basic tile', n > 1
      ? 'The player on your left takes a basic Suburbs tile instead. Whoever does this, or builds a lake or invests, must also remove one market tile and pay its slot cost.'
      : 'On a later turn you might take a basic Suburbs tile instead. When you do this, build a lake or invest, you must also remove one market tile and pay its slot cost.', 'basic', [
      spawn(hexes('extra', 1, 0.5, KIND[0], 'Suburbs tile', 'A basic tile: cheap, and it adds population straight away.', { label: 'S' }), by('start.2@1', 0.92, 0), 'basic.0'),
      hide('mk6'),
    ]),
    T('One more round', 'When the "1 More Round" tile turns up, finish the current round and play one more full round. Then score the goals and convert money to population: the biggest population wins.', 'all'),
  ],
}))
