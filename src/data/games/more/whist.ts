/** Whist: the plain partnership trick game that Bridge grew out of. */
import { C, P, S, T, at, flip, mv, set, tabletop, zone, type Act, type Item } from '../compose'
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

const MINE = 'K♠ 10♠ 6♠ 2♠ A♥ J♥ 5♥ Q♦ 8♦ 3♦ J♣ 7♣ 4♣'
/** The dealer sits on your right; the last card dealt to them is turned up to show trumps. */
const DEALER = 3
const dealt = (it: Item): Item => ({
  ...it,
  make: (c, k, seat) => {
    const m = it.make(c, k, seat)
    return seat === `@${DEALER}` && k === 12 ? { ...m, props: { ...m.props, faceUp: true, face: pc('9♥') } } : m
  },
})

export const whist = tabletop('whist', 'Whist', [4, 4], 4, '30–45 min', 'Easy', 'Two partnerships race to win the odd tricks.', ['#27457a', '#c0392b', '#ffffff'], () => {
  const n = 4
  return {
    setup: [
      S('Pair up and take a deck', 'Whist is for four players in two partnerships, with partners sitting opposite each other. It uses one standard 52-card deck with no jokers, aces high.', 'c', [
        C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The highest trump wins, or the highest card of the suit led if no trump was played.')),
      ], 'This is the classic game, also called English Whist or Straight Whist; Short Whist and Long Whist are the same game played to different targets. Draw cards to settle partners and the first dealer if you like.'),
      S('Deal thirteen cards each', 'The dealer deals the whole deck one card at a time, face down, starting on their left. Everyone ends up with 13.', 'you', [
        P(dealt(hand('hand', MINE, 'Hand', 'A hand of 13 cards. Sort yours by suit and keep it hidden. The one card showing in the dealer\'s hand is the trump card.', { cols: 7 }))),
      ]),
      S('Turn up the last card', 'The very last card, which belongs to the dealer, is turned face up for all to see. Its suit is trump for this deal.', 'hand@3', [], 'Here it is the 9♥, so hearts are trumps. The card stays on the table until the dealer plays to the first trick, then goes into the dealer\'s hand.'),
      S('Leave room for tricks', 'One partner on each side collects the tricks that side wins. Keep them face down and slightly apart so they can be counted.', 'won', [
        P(zone('won', 2.2, 1.5, 'Tricks won', 'Tricks won by this player\'s side, stacked face down. The first six a side wins are called the book and score nothing.')),
      ]),
      S('Agree the score', 'Have paper and a pencil ready. After each deal the side that won more tricks scores 1 point for every trick over six.', 'c', [], 'Many players now ignore honours, the old bonus for holding the top trumps.'),
      S('Ready to play', 'The player on the dealer\'s left leads any card to the first trick. The dealer is on your right, so you lead.', 'all', [], 'You must follow the suit led if you can. If you cannot, you may play any card, including a trump. There is no bidding.'),
    ],
    turn: [
      T('You lead', 'You lead the 4♣ to the middle of the table.', 'trick', [mv('hand.12', at('trick', ...spot(0, n)))]),
      T('Everyone follows suit', 'Going clockwise, the other three each play a club. As the dealer plays, they pick the turned-up trump card back up into their hand.', 'trick', [
        ...play(1, 0, '9♣', n), ...play(2, 0, 'A♣', n), ...play(3, 0, '6♣', n), flip(`hand.12@${DEALER}`, false),
      ]),
      T('Highest card wins', 'Your partner\'s ace is the highest club and nobody trumped, so your side wins the trick. Your partner gathers it face down.', 'won@2', take(['hand.12', 'hand.0@1', 'hand.0@2', 'hand.0@3'], 2), 8),
      T('The winner leads next', 'Whoever won a trick leads to the next one. Your partner leads the K♣ and everyone follows in turn.', 'trick', [
        ...play(2, 1, 'K♣', n), ...play(3, 1, '2♣', n), mv('hand.11', at('trick', ...spot(0, n))), ...play(1, 1, '10♣', n),
      ]),
      T('Score the deal', 'After all 13 tricks, the side with seven or more scores 1 point for each trick beyond six. The other side scores nothing for tricks.', 'all'),
      T('How it ends', 'The deal passes to the left and you play again. The first side to reach the target wins the game: 5 points in the British game, 7 in the traditional American one. Many play a rubber, the best of three games.', 'all'),
    ],
  }
})
