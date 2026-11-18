/** Pinochle (double deck): bid, show your melds, then fight for aces, tens and kings. */
import { C, P, S, T, at, mv, set, tabletop, zone, type Act } from '../compose'
import { BACK, hand, pc, slot } from '../playing'

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

/** 20 cards: a royal marriage (K♠ Q♠), a pinochle (J♦ Q♠) and a club marriage (K♣ Q♣). */
const MINE = 'A♠ 10♠ 10♠ K♠ Q♠ A♥ A♥ K♥ J♥ J♥ 10♦ 10♦ Q♦ J♦ A♣ 10♣ K♣ K♣ Q♣ J♣'
const MELD: [number, number, number][] = [[3, 0.2, 0.26], [4, 0.5, 0.26], [13, 0.8, 0.26], [16, 0.35, 0.76], [18, 0.65, 0.76]]

export const pinochle = tabletop('pinochle', 'Pinochle', [4, 4], 4, '60 min', 'Hard', 'Meld your sets, then win the counters.', ['#9b2c2c', '#27457a', '#ffffff'], () => {
  const n = 4
  return {
    setup: [
      S('Build the 80-card deck', 'This is four-player double-deck partnership Pinochle. The deck has only aces, tens, kings, queens and jacks, with four identical copies of each card: 80 cards in all.', 'c', [
        C(zone('trick', 3.4, 3, 'Table centre', 'Melds are shown here before play, and then each trick is played here one card at a time.')),
      ], 'You can make it from two pinochle packs with the nines taken out. Single-deck partnership Pinochle is the older form: 48 cards, nines included, and 12 cards each. Partners sit opposite each other.'),
      S('Learn the card order', 'In every suit the ten is the second-highest card. From high to low the order is ace, ten, king, queen, jack.', 'c', [], 'When two identical cards are played to the same trick, the one played first beats the other.'),
      S('Deal twenty cards each', 'Deal out the whole deck face down so everyone has 20. There is no kitty.', 'you', [
        P(hand('hand', MINE, 'Hand', 'A hand of 20 cards. Sort yours by suit and look for melds: marriages, runs, pinochles and four of a kind in different suits.', { cols: 7 })),
      ], 'Cards are usually dealt four or five at a time; groups have their own habits.'),
      S('Set up the score sheet', 'Keep score on paper with a column for each side. Meld points and trick points are both written down each hand.', 'won', [
        P(zone('won', 2.2, 1.5, 'Tricks won', 'Tricks this player has taken, kept face down. Each ace, ten and king in them is worth 1 point to the side.')),
      ]),
      S('Ready to bid', 'Bidding starts with the player on the dealer\'s left. A bid is the number of points your side promises to score from melds and tricks together; the lowest bid is 50, and a player who passes is out of the auction.', 'all', [], 'Bids go up by 1 to 60, then by 5. If the first three players pass, the dealer must bid 50. Some groups let the winning bidder and partner swap a few cards; the basic game has no passing.'),
    ],
    turn: [
      T('Win the auction', 'Players keep raising until three have passed. Say you win at 52. You name the trump suit, and you must hold at least a king and queen of it: you choose spades.', 'you'),
      T('Show your melds', 'All four players lay their melds face up and partners add theirs together. You show a royal marriage (K♠ Q♠, 4 points), a pinochle (Q♠ J♦, 4) and a club marriage (K♣ Q♣, 2).', 'trick', MELD.map(([k, u, v], i) => mv(`hand.${k}`, at('trick', u, v), 0.3 + i * 0.4)), 9),
      T('Pick up and lead', 'Once the melds are written down, everyone takes their cards back. As the winning bidder you lead to the first trick: the A♣.', 'trick', [
        ...MELD.map(([k], i) => mv(`hand.${k}`, at('hand', ...slot(k, 7, 3)), 0.2 + i * 0.3)), mv('hand.14', at('trick', ...spot(0, n)), 2.4),
      ], 9),
      T('Follow suit and try to win', 'Each player must follow suit and, if they can, play a card that beats the best one so far. A player with none of the suit must play a trump if they have one.', 'trick', [...play(1, 0, 'J♣', n), ...play(2, 0, 'K♣', n), ...play(3, 0, '10♣', n)]),
      T('Take the trick', 'Nothing beats your ace, so you take the trick: the ace, ten and king in it are 3 points for your side. The winner leads next, and the last trick of the hand is worth 2 extra points.', 'won', take(['hand.14', 'hand.0@1', 'hand.0@2', 'hand.0@3'], 0), 8),
      T('Scoring and winning', 'There are 50 points in the tricks. If your side\'s melds plus trick points reach the bid, you score them all; if not, you score nothing and lose the amount of the bid. The other side always scores what it made. The first side to 500 wins.', 'all', [], 9),
    ],
  }
})
