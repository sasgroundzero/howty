/** Oh Hell: say exactly how many tricks you will take, then take exactly that many. */
import { C, On, P, S, T, at, mv, set, tabletop, zone, type Act } from '../compose'
import { BACK, hand, pc, shown, stock } from '../playing'

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

/** Cards each player holds in the first hand (the common scheme: 10, or fewer when the pack would run out). */
const START: Record<number, number> = { 3: 10, 4: 10, 5: 10, 6: 8, 7: 7 }
const FULL = 'A♠ 9♠ 4♠ K♥ 8♥ J♦ 5♦ Q♣ 7♣ 3♣'
const THEIRS = ['', '6♠', 'Q♠', '2♠', '10♠', 'J♠', '3♠']

export const ohHell = tabletop('oh-hell', 'Oh Hell', [3, 7], 4, '45–60 min', 'Easy', 'Bid your tricks exactly, no more and no less.', ['#1f6f4a', '#c0392b', '#ffffff'], (n) => {
  const size = START[n]
  const mine = FULL.split(' ').slice(0, size).join(' ')
  const left = 52 - n * size - 1
  const others = Array.from({ length: n - 1 }, (_, i) => i + 1)
  return {
    setup: [
      S('Take one full deck', 'Oh Hell uses one standard 52-card deck with no jokers. Aces are high and twos are low.', 'c', [
        C(
          zone('trick', Math.max(3.4, Math.ceil(n / 2) * 1.15), 3, 'Trick', 'Each player plays one card here in turn. The highest trump wins, or the highest card of the suit led if nobody played a trump.'),
          stock('stock', left, 'Undealt cards', `The ${left} card${left === 1 ? '' : 's'} left over after the deal. They stay face down and are not used in this hand.`),
        ),
      ], 'The game has many other names: Oh Pshaw, Blackout, Up and Down the River, Elevator, Bust and Contract Whist among them. It is usually played by 3 to 7 people and is best with 4 to 6.'),
      S('Set up a score sheet', 'You need paper and a pencil. Make one column for each player, with room to write a bid and a score for every hand.', 'c', [
        P(zone('won', 2.2, 1.5, 'Tricks won', 'Stack each trick you win face down here, a little apart, so everyone can count how many you have taken.')),
      ]),
      S('Deal the first hand', `Shuffle and deal the cards one at a time, face down, until everyone has ${size}.`, 'you', [
        P(hand('hand', mine, 'Your hand', `Your ${size} cards for the first hand. Later hands are smaller.`, { cols: 7 })),
      ], `With ${n} players the first hand is ${size} cards each. Groups vary a lot here: some start at 1 card and work up, others start at 7.`),
      S('Turn up the trump card', 'Turn the next card face up on top of the undealt cards. Its suit is trump for this hand.', 'trump', [
        On('stock', 0.5, 0.5, shown('trump', '7♦', 'Trump card', 'One card turned up after the deal. Its suit, here diamonds, beats the other three suits in this hand.')),
      ]),
      S('Everyone bids', 'Starting on the dealer\'s left and going clockwise, each player says how many tricks they will win, from zero up to the number of cards dealt. Write every bid down.', 'all', [], 'In the usual rule the dealer, who bids last, may not choose a number that makes the bids add up to the number of tricks, so somebody has to fail. Some groups drop this rule.'),
      S('Ready to play', 'The player on the dealer\'s left leads any card to the first trick. Here the dealer sits on your right, so you lead.', 'all', [], 'You must follow the suit led if you can. If you cannot, you may play any card, including a trump.'),
    ],
    turn: [
      T('You lead', 'You play the A♠ to the middle to start the first trick.', 'trick', [mv('hand.0', at('trick', ...spot(0, n)))]),
      T('Everyone follows suit', 'Going clockwise, each player adds one card and must play a spade if they hold one.', 'trick', others.flatMap((i) => play(i, 0, THEIRS[i], n, 0.3 + i * 0.5))),
      T('Take the trick', 'Nobody played a trump, so the highest spade wins: your ace. Gather the cards face down in front of you. You lead the next trick.', 'won', take(['hand.0', ...others.map((i) => `hand.0@${i}`)], 0), 8),
      T('When you cannot follow', 'A player with no card of the suit led may throw away any card or play a trump. A trump beats every card of the other suits, and the highest trump played wins.', 'you'),
      T('Score the hand', 'When the cards run out, compare tricks with bids. In the most common scoring you get 1 point for each trick you took, plus 10 more if you took exactly what you bid.', 'all', [], 7),
      T('How it ends', 'The deal passes to the left and each hand has one card fewer, down to a single card, then one more each hand back up to the starting size. The highest total after the last hand wins.', 'all'),
    ],
  }
})
