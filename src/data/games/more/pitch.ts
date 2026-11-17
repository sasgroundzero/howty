/** Pitch: a short auction game where the first card led names the trump suit. */
import { C, P, R, S, T, at, mv, set, tabletop, zone, type Act } from '../compose'
import { BACK, hand, pc, stock } from '../playing'

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

const MINE = 'A♠ J♠ 7♠ K♥ 10♦ 4♣'

export const pitch = tabletop('pitch', 'Pitch', [4, 4], 4, '30 min', 'Medium', 'Bid for High, Low, Jack and Game.', ['#7a4fa3', '#1c1917', '#ffffff'], () => {
  const n = 4
  return {
    setup: [
      S('Pair up and take a deck', 'This is four-player partnership Pitch: partners sit opposite each other. It uses one standard 52-card deck with no jokers, aces high.', 'c', [
        C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The highest trump wins, or the highest card of the suit led if no trump was played.')),
      ], 'Pitch is also called Setback, Auction Pitch or High-Low-Jack. It can be played by two to seven people, each for themselves, and there are many local versions with more cards or extra points.'),
      S('Deal six cards each', 'Deal three cards at a time, face down, until everyone has 6. The rest of the deck is put aside and not used in this hand.', 'you', [
        P(hand('hand', MINE, 'Hand', 'A hand of 6 cards. Only 24 of the 52 cards are in play, so you cannot be sure which high cards are out.')),
        R(stock('rest', 28, 'Undealt cards', 'The 28 cards left after the deal. They stay face down and take no part in this hand.')),
      ]),
      S('Learn the four points', 'Each hand has up to four points to win: High, Low, Jack and Game. A bid is a promise that your side will win at least that many.', 'c', [], 'High is the highest trump in play, Low the lowest trump in play, Jack the jack of trumps (often it was never dealt), and Game the greater total of card values in tricks.'),
      S('Bid once round the table', 'Starting on the dealer\'s left, each player in turn passes or bids two, three or four, and each bid must beat the last. There is only one round.', 'all', [
        P(zone('won', 2.2, 1.5, 'Tricks won', 'Tricks this player has taken, kept face down. Partners count theirs together when the hand is over.')),
      ], 'Details vary by group: many let the dealer take the contract by matching the highest bid, make the dealer bid two if everyone else passes, or allow a top bid to take everything.'),
      S('Ready to play', 'The highest bidder is the pitcher and leads to the first trick. The suit of the card they lead, or pitch, becomes trump. Say you bid three and nobody went higher.', 'all', [], 'Keep the score on paper. Both sides start at zero.'),
    ],
    turn: [
      T('Pitch the first card', 'You lead the A♠. That makes spades the trump suit for this hand.', 'trick', [mv('hand.0', at('trick', ...spot(0, n)))]),
      T('The others play', 'Going clockwise, each player adds a card. When a trump is led you must play a trump if you have one.', 'trick', [...play(1, 0, '6♠', n), ...play(2, 0, '2♠', n), ...play(3, 0, 'Q♠', n)]),
      T('Take the trick', 'Your ace is the highest trump, so you take the trick and lead again. Your side has also captured the 2♠, which will count for Low.', 'won', take(['hand.0', 'hand.0@1', 'hand.0@2', 'hand.0@3'], 0), 8),
      T('Follow suit or trump', 'You lead the K♥. A player who holds the suit led must either follow it or play a trump: trumping is allowed even when you could follow. With none of the suit you may play anything. Here your right-hand opponent wins with the 9♠.', 'trick', [
        mv('hand.3', at('trick', ...spot(0, n))), ...play(1, 1, '8♥', n), ...play(2, 1, '3♥', n), ...play(3, 1, '9♠', n),
      ], 9),
      T('Count the points', 'After six tricks, award the four points. For Game, each side adds up its cards: tens are 10, aces 4, kings 3, queens 2 and jacks 1. In the partnership game Low usually goes to the side that wins it in a trick; in some groups it goes to whoever was dealt it.', 'all', [], 9),
      T('Scoring and winning', 'If the pitcher\'s side won at least what was bid, it scores every point it won; if not, it is set back and loses the bid. The other side always scores its own points. The usual target is 21, and many groups say you can only win on a hand where you made your own bid.', 'all', [], 9),
    ],
  }
})
