/** For Sale: bid coins for properties, then flip those properties for cheques. */
import { C, P, S, T, at, by, cards, deck, discs, draw, f, ft, hide, mv, spawn, tabletop, zone } from '../compose'
import { COLORS } from '../kit'

const prop = (v: number) => ft('#e9f0dc', String(v), 'property', '⌂')
const cheque = (v: number) => ft('#f3e7c5', `$${v}`, 'thousand', '◆')
const VALS = [4, 9, 13, 18, 24, 29]
const coin = (id: string, k: number) => discs(id, k, 0.22, '#d8b24a', 'Bid', 'Coins pushed forward as a bid.', { h: 0.08 })

export const forSale = tabletop('for-sale', 'For Sale', [3, 6], 4, '30 min', 'Easy', 'Buy houses cheap, then sell them dear.', ['#3d8b4a', '#e0b12f', '#f3e7c5'], (n) => {
  const out = n === 3 ? 6 : n === 4 ? 2 : 0
  return {
    setup: [
      S('Sort the two decks', `Shuffle the 30 property cards and the 30 currency cards separately. ${out ? `With ${n} players remove ${out} cards from each deck unseen and return them to the box.` : `With ${n} players all the cards are used.`}`, 'c', [
        C(deck('props', 30 - out - n, f('#3d8b4a', '⌂'), 'Property deck', 'Properties numbered 1 to 30, from a cardboard box to a space station. Higher is better.')),
        C(deck('cheques', 30 - out, f('#b88a2a', '$'), 'Currency deck', '30 cheques: two each of the values from $2,000 to $15,000, and two worth nothing. Set aside until the second half.')),
      ], 'Three players remove 6 cards from each deck, four players remove 2, and five or six players use them all.'),
      S('Hand out coins', `Give every player ${n <= 4 ? '$18,000 in coins (two $2,000 and fourteen $1,000)' : '$14,000 in coins (two $2,000 and ten $1,000)'}. Players keep their coins hidden.`, 'you', [
        P(discs('coins', 1, 0.3, '#d8b24a', 'Your coins', 'Your bidding money: $18,000 each with 3 or 4 players and $14,000 each with 5 or 6.', { h: 0.3, label: '$' }), zone('bid', 1.3, 1.3, 'Bid', 'Push the coins you are bidding here.'), zone('owned', 2.6, 1.4, 'Your cards', 'Properties you buy, and later the cheques you sell them for, are kept face down here.')),
      ]),
      S('Turn up the first properties', `Turn ${n} property cards face up in the middle, one for each player.`, 'c', [
        C(cards('lot', n, VALS.slice(0, n).map(prop), 'Properties for sale', 'One property per player is turned up each round, and everyone ends the round with one of them.')),
      ]),
      S('Choose a starting bidder', 'Pick someone to open the bidding. Afterwards the player who took the most valuable property opens the next round.', 'all', []),
      S('Ready to play', 'The game has two halves: first buy all the properties with coins, then sell them all for cheques.', 'all', [], 'When bidding, you must either bid more than the last bid or pass.'),
    ],
    turn: [
      T('Open the bidding', 'You bid $2,000. The player on your left raises to $3,000.', 'you', [
        spawn(coin('b0', 2), at('bid', 0.5, 0.5), 'coins'),
        spawn(coin('b1', 3), at('bid@1', 0.5, 0.5), 'coins@1', COLORS[1], 1.2),
      ]),
      T('Pass and take the lowest', 'You pass. Take the lowest property still on the table and get back half of your bid; the other half goes to the bank.', 'c', [
        mv('lot.0', at('owned', 0.25, 0.5)),
        hide('b0.0'),
        mv('b0.1', by('coins', 0, 0.75)),
      ], 8),
      T('Last bidder pays in full', 'Bidding goes on until one player is left. That player pays their whole bid and takes the highest property. Then a new set of properties is turned up.', 'c', [
        hide('b1.0'), hide('b1.1'), hide('b1.2'),
        mv(`lot.${n - 1}`, at('owned@1', 0.25, 0.5)),
      ]),
      T('Second half: sell', `Once every property is bought, turn up ${n} cheques. Everyone secretly picks one of their properties and all reveal together: the highest property takes the highest cheque, and so on down.`, 'c', Array.from({ length: n }, (_, k) => draw('cheques', by('cheques', 1.1 + k * 1.04, 0), cheque([0, 5, 8, 11, 13, 15][k]), undefined, 0.3 + k * 0.3))),
      T('The finish', 'When all properties are sold, add up your cheques and any coins you kept. The richest player wins; a tie goes to whoever has more coins left.', 'all'),
    ],
  }
})
