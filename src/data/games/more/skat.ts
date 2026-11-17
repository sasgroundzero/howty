/** Skat: Germany's three-player game of bidding, jacks and 120 card points. */
import { C, P, R, S, T, at, mv, set, tabletop, zone, type Act } from '../compose'
import { BACK, hand, hidden, pc, slot, stock } from '../playing'

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

const MINE = 'J♣ J♠ A♣ 10♣ K♣ 8♣ A♥ 10♥ 9♦ 7♠'

export const skat = tabletop('skat', 'Skat', [3, 3], 3, '45–90 min', 'Hard', 'One declarer against two, and jacks rule.', ['#1c1917', '#c0392b', '#d4a017'], () => {
  const n = 3
  return {
    setup: [
      S('Strip the deck to 32 cards', 'Skat uses 32 cards: the 7 up to the ace in each suit. Take out every 2, 3, 4, 5 and 6.', 'r', [
        C(zone('trick', 3.4, 3, 'Trick', 'Each of the three players plays one card here. The highest trump wins, or the highest card of the suit led if no trump was played.')),
        R(stock('out', 20, 'Cards taken out', 'The twenty cards from 2 to 6. They are not used.')),
      ], 'The game is known as Skat everywhere; this is the modern German game, and older American forms differ. Three people play each hand. With four at the table the dealer sits out and deals to the other three.'),
      S('Name the seats', 'The player on the dealer\'s left is forehand, the next is middlehand and the third is rearhand. With three players the dealer is rearhand.', 'all', [
        P(zone('won', 2.2, 1.5, 'Tricks won', 'Tricks this player has taken, face down. The two defenders pool theirs when the hand is counted.')),
      ], 'Here the dealer is on your right, so you are forehand.'),
      S('Deal ten cards each', 'Deal clockwise in packets: three cards to each player, then two to the middle, then four each, then three each.', 'you', [
        P(hand('hand', MINE, 'Hand', 'A hand of 10 cards. Sort yours with the jacks together, because in most games they are the top trumps.', { cols: 6 })),
      ]),
      S('Set the skat aside', 'The two cards dealt to the middle stay face down. They are called the skat and belong to whoever wins the bidding.', 'skat', [
        C(hidden('skat', 'Q♣ 8♦', 'Skat', 'Two face-down cards. The declarer may pick them up to improve their hand, and their points count for the declarer at the end.')),
      ]),
      S('Learn the card values', 'An ace is worth 11 points, a ten 10, a king 4, a queen 3 and a jack 2; the 9, 8 and 7 are worth nothing. That makes 120 points.', 'c', [], 'In a suit game the four jacks are the highest trumps, in the order clubs, spades, hearts, diamonds, followed by the trump suit\'s ace, ten, king, queen, 9, 8, 7. The other suits run ace, ten, king, queen, 9, 8, 7.'),
      S('Ready to bid', 'Bids are numbers that stand for the value of the game you think you can play; the lowest is 18. Middlehand bids to forehand first, who answers yes or passes. Then rearhand bids against whoever is left.', 'all', [], 'Have paper and a pencil ready to record each hand. If nobody bids, forehand may play at 18 or the hand is thrown in.'),
    ],
    turn: [
      T('Win the bidding', 'Say you hold the bid at 20 and the others pass. You are the declarer and play alone against the other two. You pick up the skat.', 'skat', [0, 1].flatMap((i) => [set(`skat.${i}`, { faceUp: true }), mv(`skat.${i}`, at('hand', ...slot(10 + i, 6, 2)), 0.3 + i * 0.5)])),
      T('Discard two and declare', 'Put any two cards face down as the new skat, then announce your game. You name clubs as trumps. You could also choose grand, where only jacks are trumps, or null, where you try to lose every trick.', 'skat', ['hand.8', 'skat.1'].flatMap((id, i) => [set(id, { faceUp: false, back: BACK }), mv(id, at('skat', ...slot(i, 2)), 0.3 + i * 0.5)]), 9),
      T('Forehand leads', 'Forehand always leads to the first trick, whoever the declarer is. That is you, and you lead the J♣, the highest trump.', 'trick', [mv('hand.0', at('trick', ...spot(0, n)))]),
      T('Follow suit', 'The other two must follow suit if they can, and all the jacks count as trumps, not as cards of their own suits. With no card of the suit led a player may play anything.', 'trick', [...play(1, 0, '9♣', n), ...play(2, 0, 'J♦', n)]),
      T('Take the trick', 'Your J♣ beats everything, so you take the trick and lead again. It holds two jacks, worth 4 points.', 'won', take(['hand.0', 'hand.0@1', 'hand.0@2'], 0)),
      T('Scoring and winning', 'In a suit or grand game the declarer needs at least 61 of the 120 points, counting the skat. A won game scores its value and a lost one costs double; the value comes from the trump suit and the run of top trumps held or missing. Play an equal number of deals each: the highest total wins.', 'all', [], 10),
    ],
  }
})
