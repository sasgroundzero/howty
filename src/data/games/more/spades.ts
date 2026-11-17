/** Spades: partners bid a number of tricks, and spades are always trumps. */
import { C, P, S, T, at, mv, set, tabletop, zone, type Act } from '../compose'
import { BACK, hand, pc } from '../playing'

const spot = (i: number, n: number): [number, number] => {
  const near = Math.ceil(n / 2)
  return i < near ? [1 - (i + 0.5) / near, 0.76] : [(i - near + 0.5) / (n - near), 0.24]
}
/** Another player turns a card from their hand face up and plays it to the trick. */
const play = (seat: number, k: number, card: string, n: number, delay?: number): Act[] => [
  set(`hand.${k}@${seat}`, { faceUp: true, face: pc(card) }), mv(`hand.${k}@${seat}`, at('trick', ...spot(seat, n)), delay),
]
/** The winner gathers the trick face down onto their pile of won tricks. */
const take = (ids: string[], winner: number): Act[] => ids.flatMap((id, j) => [set(id, { faceUp: false, back: BACK }), mv(id, at(`won@${winner}`, 0.5, 0.5, j * 0.02))])

const MINE = 'A♠ Q♠ 7♠ 3♠ K♥ 9♥ 4♥ A♦ K♦ 6♦ J♣ 8♣ 2♣'

export const spades = tabletop('spades', 'Spades', [4, 4], 4, '45–60 min', 'Medium', 'Bid your tricks. Spades always trump.', ['#1c1917', '#27457a', '#ffffff'], () => {
  const n = 4
  return {
    setup: [
      S('Pair up and take a deck', 'Spades is for four players in two partnerships, with partners sitting opposite each other. It uses one standard 52-card deck with no jokers, aces high.', 'c', [
        C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The highest spade wins, or the highest card of the suit led if no spade was played.')),
      ], 'The game is known simply as Spades; there are also versions for two, three or six players and versions that add jokers, which are not shown here.'),
      S('Deal thirteen cards each', 'Deal the whole deck one card at a time, face down, starting on the dealer\'s left. Everyone has 13.', 'you', [
        P(hand('hand', MINE, 'Hand', 'A hand of 13 cards. Sort yours by suit and keep it hidden, even from your partner.', { cols: 7 })),
      ]),
      S('Everyone bids once', 'Starting on the dealer\'s left, each player names a number of tricks from 0 to 13. Nobody may pass, and a bid does not have to beat the one before.', 'all', [], 'Your bid and your partner\'s are added together: that total is what your side must win. A bid of 0 is called nil and is a promise to take no tricks at all.'),
      S('Set up the score sheet', 'Write both sides\' bids on paper. You will also keep count of overtricks, called bags.', 'won', [
        P(zone('won', 2.2, 1.5, 'Tricks won', 'Tricks this player has taken, stacked face down and slightly apart. Partners count theirs together at the end of the deal.')),
      ]),
      S('Ready to play', 'The player on the dealer\'s left leads to the first trick with any card that is not a spade. The dealer is on your right, so you lead.', 'all', [], 'You must follow the suit led if you can; otherwise play anything. Some groups instead start with everyone playing their lowest club.'),
    ],
    turn: [
      T('You lead', 'You lead the A♦ to the middle of the table.', 'trick', [mv('hand.7', at('trick', ...spot(0, n)))]),
      T('Everyone follows suit', 'Going clockwise, each of the others plays a diamond, because they must follow suit when they can.', 'trick', [...play(1, 0, '5♦', n), ...play(2, 0, '2♦', n), ...play(3, 0, '9♦', n)]),
      T('Take the trick', 'No spade was played, so the highest diamond wins: your ace. Gather the cards face down. The winner of a trick leads the next one.', 'won', take(['hand.7', 'hand.0@1', 'hand.0@2', 'hand.0@3'], 0), 8),
      T('Spades are broken', 'You lead the K♦. The player on your left has no diamonds left and plays the 4♠, which wins the trick because spades beat everything.', 'trick', [
        mv('hand.8', at('trick', ...spot(0, n))), ...play(1, 1, '4♠', n), ...play(2, 1, '7♦', n), ...play(3, 1, '10♦', n),
      ], 8),
      T('Leading spades', 'Nobody may lead a spade until a spade has been played on another suit like this, unless they hold nothing but spades.', 'you'),
      T('Scoring and winning', 'A side that makes its bid scores 10 points per trick bid plus 1 for each extra trick, or bag; a side that falls short loses 10 per trick bid. Every tenth bag costs 100, and a nil scores 100 if it works and loses 100 if it fails. The first side to 500 wins.', 'all', [], 9),
    ],
  }
})
