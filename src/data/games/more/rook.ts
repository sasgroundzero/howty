/** Rook (Kentucky Discard, the tournament game): bid for the nest, name a trump color, win the counters. */
import type { Face } from '../../../engine/types'
import { C, P, R, S, T, at, cards, f, ft, mv, set, tabletop, zone, type Act, type Item } from '../compose'
import { BACK, slot, stock } from '../playing'

const INK: Record<string, string> = { R: '#c0392b', G: '#2e8b57', Y: '#d4a017', B: '#1c1917' }
/** A Rook card from shorthand: 'G14' is the green 14, 'ROOK' is the bird card. */
const rk = (s: string): Face => (s === 'ROOK' ? ft('#f3ead7', 'Rook', '20 points', '✦') : f(INK[s[0]], s.slice(1)))
const rks = (s: string) => s.split(' ').map(rk)
/** A hand of Rook cards: yours face up, everyone else's face down. */
const rhand = (id: string, s: string, title: string, body: string): Item => {
  const it = cards(id, rks(s).length, rks(s), title, body, { cols: 7 })
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); return seat && seat !== '@0' ? { ...m, props: { ...m.props, faceUp: false, back: BACK } } : m } }
}

const spot = (i: number, n: number): [number, number] => {
  const near = Math.ceil(n / 2)
  return i < near ? [1 - (i + 0.5) / near, 0.76] : [(i - near + 0.5) / (n - near), 0.24]
}
/** Another player turns a card from their hand face up and plays it to the trick. */
const play = (seat: number, k: number, card: string, n: number, delay?: number): Act[] => [
  set(`hand.${k}@${seat}`, { faceUp: true, face: rk(card) }), mv(`hand.${k}@${seat}`, at('trick', ...spot(seat, n)), delay),
]
/** The winner gathers the trick face down onto their pile of won tricks. */
const take = (ids: string[], winner: number): Act[] => ids.flatMap((id, j) => [set(id, { faceUp: false, back: BACK }), mv(id, at(`won@${winner}`, 0.5, 0.5, j * 0.02))])

const MINE = 'G14 G12 G11 G7 R14 R5 B10 Y9 Y6'
const NEST = 'ROOK G13 B5 Y7 R8'

export const rook = tabletop('rook', 'Rook', [4, 4], 4, '45–60 min', 'Medium', 'Bid for the nest and let the Rook fly.', ['#2e8b57', '#c0392b', '#d4a017'], () => {
  const n = 4
  return {
    setup: [
      S('Sort the Rook deck', 'A Rook deck has 57 cards: four colors (black, red, green and yellow) numbered 1 to 14, plus the Rook bird card. For this game take out every 1, 2, 3 and 4, leaving 41 cards.', 'r', [
        C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The highest trump wins, or the highest card of the color led if no trump was played.')),
        R(stock('out', 16, 'Cards taken out', 'The sixteen 1s, 2s, 3s and 4s. They go back in the box and are not used.')),
      ], 'This version is called Kentucky Discard or Tournament Rook, and is the partnership game in the official rules. Other versions use all 57 cards or leave the 1s in as high cards.'),
      S('Sit opposite your partner', 'Rook is for four players in two partnerships. Partners sit across the table from each other.', 'all', [
        P(zone('won', 2.2, 1.5, 'Tricks won', 'Tricks this player has taken, kept face down. Only the counters in them score.')),
      ]),
      S('Deal nine cards each', 'Deal one card at a time, face down. Everyone ends up with 9 cards.', 'you', [
        P(rhand('hand', MINE, 'Hand', 'A hand of 9 cards. Sort yours by color and count how many point cards you hold.')),
      ]),
      S('Make the nest', 'During the deal, after each of the first five rounds, the dealer puts one card face down in the middle. These 5 cards are the nest.', 'nest', [
        C(cards('nest', 5, rks(NEST), 'Nest', 'Five face-down cards. The winner of the bidding picks them up and puts five cards back.', { down: true, back: BACK })),
      ]),
      S('Know the counters', 'Only some cards score: each 5 is worth 5 points, each 10 and each 14 is worth 10, and the Rook bird is worth 20. That is 120 points in every hand.', 'c', [], 'Keep score on paper, one column for each side.'),
      S('Ready to bid', 'Starting on the dealer\'s left, players bid how many of the 120 points their side will take. The lowest bid is 70 and bids go up in fives; a player who passes is out.', 'all', [], 'The dealer is on your right. Some rule sets have a different player open the bidding.'),
    ],
    turn: [
      T('Win the bid', 'The bidding goes round until three players have passed. Say you win it at 85. You now pick up the nest.', 'nest', [0, 1, 2, 3, 4].flatMap((i) => [set(`nest.${i}`, { faceUp: true }), mv(`nest.${i}`, at('hand', ...slot(9 + i, 7, 2)), 0.3 + i * 0.4)]), 8),
      T('Discard five and name trump', 'Put any five cards face down as the new nest, then name the trump color: you choose green. You may bury counters, but whoever wins the last trick scores them.', 'nest', ['hand.7', 'hand.8', 'nest.2', 'nest.3', 'nest.4'].flatMap((id, i) => [set(id, { faceUp: false, back: BACK }), mv(id, at('nest', ...slot(i, 5)), 0.3 + i * 0.4)]), 9),
      T('The first lead', 'The player on the dealer\'s left leads any card. That is you, and you lead the green 14.', 'trick', [mv('hand.0', at('trick', ...spot(0, n)))]),
      T('Follow the color', 'Going clockwise, each player must play a card of the color led if they have one, and otherwise may play anything. Your partner gives you the green 10.', 'trick', [...play(1, 0, 'G6', n), ...play(2, 0, 'G10', n), ...play(3, 0, 'G9', n)]),
      T('Take the trick', 'The 14 is the highest green card, so you win the trick and lead next. The 14 and the 10 in it are 20 points for your side.', 'won', take(['hand.0', 'hand.0@1', 'hand.0@2', 'hand.0@3'], 0), 8),
      T('The Rook, scoring and winning', 'The Rook bird is the highest trump and may be played at any time, even when you could follow color. The winner of the last trick also takes the nest. A side that makes its bid scores its counters; if not, it loses the bid instead. The first side to 300 wins.', 'all', [], 10),
    ],
  }
})
