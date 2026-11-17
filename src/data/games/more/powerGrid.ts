/** Power Grid: a power plant auction, a resource market that rises in price, and houses spreading over a map. */
import { C, L, On as On0, OnP, P, R, S, T, at, board, by, cards, cubes, deck, draw, f, ft, hide, mv, pile, spawn, tabletop, zone } from '../compose'
import type { Item, Place } from '../compose'
import { cityUV, gridUV } from '../layouts'

/** On() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })

const CELL = gridUV(12, 1)
const PC = ['#c0392b', '#2e6fb7']
const FUEL = ['oil', 'coal', 'coal or oil', 'garbage', 'oil', 'coal', 'oil', 'coal']
const plant = (k: number) => ft('#f3e7c5', `${k + 3}`.padStart(2, '0'), FUEL[k], '▲')
const res = (id: string, color: string, name: string) => cubes(id, 3, color, name, `Each market space holds up to 3 ${name.toLowerCase()} tokens. The cheapest tokens are always bought first.`, { s: 0.18, gap: 0.06 })

export const powerGrid = tabletop('power-grid', 'Power Grid', [2, 6], 4, '120 min', 'Hard', 'Bid for power plants and light up cities.', ['#3d6b4a', '#e0b12f', '#8a5a34'], (n) => {
  const regions = n < 4 ? 3 : n === 4 ? 4 : 5
  const removed = n < 4 ? 8 : n === 4 ? 4 : 0
  const goal = [0, 0, 21, 17, 17, 15, 14][n]
  return {
    setup: [
      S('Choose the map', `Place the board and agree which ${regions} neighbouring regions to play in. Cities outside them are out of the game.`, 'c', [
        C(board('map', 13, 8.6, 'g:map:0:#cfd8b8:#6b8f5a:Power Grid', 'Map board', 'Cities joined by connections with a cost printed on each. This drawing is schematic, not the real map.')),
      ], 'The number of regions depends on the player count: 3 for two or three players, 4 for four, 5 for five or six.'),
      S('Houses and money', 'Each player takes the 22 houses of one color and 50 Elektro.', 'you', [
        P(
          pile('houses', '$', 'Houses', '22 houses per player. Build one in a city to connect it to your network.'),
          deck('cash', 10, f('#6fae6f', '50'), 'Your Elektro', 'Each player starts with 50 Elektro. Money may be kept hidden.'),
          zone('plants', 3.2, 1.4, 'Your power plants', 'You may own up to 3 power plants (4 in a two-player game).'),
        ),
        L(pile('bank', '#6fae6f', 'Bank', 'The rest of the Elektro notes.', 'disc')),
      ]),
      S('Scoring track and player order', 'Each player puts one house on 0 of the scoring track and one on the player order track. Draw lots for the starting order.', 'map', [
        OnP('map', 0.5, 0.03, cubes('order', 1, '$', 'Player order marker', 'Order is random at the start and reset each round: the player with the most cities goes first.', { s: 0.2 }), [0.36, 0]),
        OnP('map', 0.5, 0.97, cubes('cities', 1, '$', 'Scoring marker', 'Shows how many cities you have connected.', { s: 0.2 }), [0.36, 0]),
      ]),
      S('Fill the resource market', 'Put 3 coal on each space from 1 to 8, 3 oil on each space from 3 to 8, 3 garbage on spaces 7 and 8, and 1 uranium on spaces 14 and 16.', 'market', [
        C(board('market', 11, 2.2, 'g:grid:12x1:#e8dcc0:#8a5a34:Resource market', 'Resource market', 'Spaces priced 1 to 8 Elektro, then single uranium spaces up to 16. Prices rise as resources are bought and fall as the market is restocked.')),
        ...[0, 1, 2, 3, 4, 5, 6, 7].map((c) => On('market', CELL(c, 0)[0], 0.2, res(`coal${c}`, '#8a5a34', 'Coal'))),
        ...[2, 3, 4, 5, 6, 7].map((c) => On('market', CELL(c, 0)[0], 0.5, res(`oil${c}`, '#2b2b2b', 'Oil'))),
        ...[6, 7].map((c) => On('market', CELL(c, 0)[0], 0.8, res(`garb${c}`, '#e0b12f', 'Garbage'))),
        ...[10, 11].map((c) => On('market', CELL(c, 0)[0], 0.5, cubes(`uran${c}`, 1, '#c0392b', 'Uranium', 'Uranium starts only on the 14 and 16 spaces, so it is expensive early on.', { s: 0.2 }))),
        L(pile('supply', ['#8a5a34', '#2b2b2b', '#e0b12f', '#c0392b'], 'Resource supply', '24 coal, 24 oil, 24 garbage and 12 uranium in the game. Whatever is not on the market waits here.')),
      ], 'This fills the market with 24 coal, 18 oil, 6 garbage and 2 uranium.'),
      S('Power plant market', 'Lay out plants 03 to 10 in two rows of four: 03 to 06 are the actual market and 07 to 10 the future market.', 'r', [
        R(cards('actual', 4, [0, 1, 2, 3].map(plant), 'Actual market', 'The four cheapest plants. Only these can be put up for auction.')),
        R(cards('future', 4, [4, 5, 6, 7].map(plant), 'Future market', 'The next four plants. They slide into the actual market as cheaper ones are bought.')),
      ]),
      S('Build the plant deck', `Set aside plant 13 and the Step 3 card, and shuffle the rest. ${removed ? `With ${n} players remove ${removed} random plants unseen. ` : ''}Put the Step 3 card under the deck and plant 13 on top.`, 'pdeck', [
        R(deck('pdeck', 42 - 8 - removed + 1, f('#3d6b4a', '▲'), 'Power plant deck', '42 power plants in the game. Plant 13 starts on top and the Step 3 card at the bottom.')),
      ], removed ? undefined : 'With five or six players no plants are removed.'),
      S('Ready to play', 'Each round has five phases: set player order, auction power plants, buy resources, build houses, then bureaucracy.', 'all', [], 'In the first round everyone must buy a power plant, and player order is set again straight after the auction.'),
    ],
    turn: [
      T('Auction a power plant', 'The first player picks a plant from the actual market and bids at least its number. You win plant 04. A new plant is drawn and all eight are put back in number order.', 'r', [
        mv('actual.1', at('plants', 0.2, 0.5)),
        mv('future.0', by('actual.0', 1.04, 0)),
        draw('pdeck', by('future.1', -1.04, 0), ft('#f3e7c5', '13', 'wind', '▲')),
      ]),
      T('Everyone buys one', 'The next player in order starts a new auction. Once you have bought a plant this round you are out of the bidding.', 'r', [
        mv('actual.0', at('plants@1', 0.2, 0.5)),
        draw('pdeck', by('actual.2', -2.08, 0), ft('#f3e7c5', '11', 'uranium', '▲')),
      ]),
      T('Buy resources', 'Starting with the last player in order, buy fuel for your plants from the cheapest spaces. You take 2 coal for plant 04; the other player takes 2 oil for plant 03.', 'market', [
        mv('oil2.0', at('actual.0', 0.3, 0.5)),
        mv('oil2.1', at('actual.0', 0.7, 0.5)),
        mv('coal0.0', at('actual.1', 0.3, 0.5)),
        mv('coal0.1', at('actual.1', 0.7, 0.5)),
      ]),
      T('Build houses', 'Again starting with the last player, pay to connect cities. A first house in a city costs 10 Elektro; later ones also pay the connections between your cities.', 'map', [
        spawn(cubes('h1', 1, '$', 'House', 'A house connects that city to its owner\'s network.', { s: 0.26 }), at('map', cityUV(6)[0], cityUV(6)[1] + 0.045), 'houses@1', PC[1]),
        spawn(cubes('h0', 1, '$', 'House', 'A house connects that city to its owner\'s network.', { s: 0.26 }), at('map', cityUV(8)[0], cityUV(8)[1] + 0.045), 'houses', PC[0]),
      ]),
      T('Bureaucracy', 'Burn fuel to power your cities and collect income: 22 Elektro for one city. Then restock the resource market and put the highest plant of the future market under the deck.', 'you', [
        hide('coal0.0'), hide('coal0.1'), hide('oil2.0'), hide('oil2.1'),
        spawn(cards('income', 1, f('#6fae6f', '22'), 'Income', 'Money paid by the bank for the cities you powered this round.'), at('cash', 0.5, 0.5, 0.02), 'bank'),
      ]),
      T('The final round', `The game ends in the round when someone has connected ${goal} cities${n === 2 ? ' (check your edition: the two-player target differs between printings)' : ''}. The winner is whoever can power the most cities that round, with money as the tie-break.`, 'all'),
    ],
  }
})
