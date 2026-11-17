/** Jass (Schieber): the Swiss partnership game where the jack and nine of trumps outrank the ace. */
import { C, P, S, T, at, flip, mv, tabletop, zone, type Item } from '../compose'
import { hand, pc } from '../playing'

/** A hand whose face-down copies at other seats get their own faces: seen['0@1'] is card 0 of seat 1. */
const dealt = (id: string, mine: string, seen: Record<string, string>, title: string, body: string, o: { cols?: number } = {}): Item => {
  const it = hand(id, mine, title, body, o)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); const s = seen[`${k}${seat ?? ''}`]; return s ? { ...m, props: { ...m.props, face: pc(s) } } : m } }
}
const SPOT: [number, number][] = [[0.7, 0.75], [0.3, 0.75], [0.3, 0.25], [0.7, 0.25]]

export const jass = tabletop('jass', 'Jass', [4, 4], 4, '45–60 min', 'Medium', 'Swiss Schieber: jack and nine of trumps rule.', ['#b3261e', '#c9a227', '#1f6f4a'], () => ({
  setup: [
    S('Make the 36-card pack', 'This is Schieber, the Swiss form of Jass for four players in two partnerships. Use a 36-card Jass pack, or take the 2s to 5s out of a standard deck so that each suit runs from 6 up to ace.', 'c', [
      C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The highest trump, or the highest card of the suit led, takes the trick.')),
    ], 'Also called Schieber or Schieber Jass. In German-speaking Switzerland the cards have bells, shields, roses and acorns as suits, with a Banner for the ten, an Ober for the queen and an Under for the jack.'),
    S('Sit opposite your partner', 'Partners sit across the table from each other. Dealing and play both go anticlockwise, to the right.', 'all'),
    S('Deal nine cards each', 'Deal all the cards in batches of 3, starting with the player on the dealer\'s right. Everyone has 9.', 'you', [
      P(dealt('hand', 'J♥ 9♥ A♥ 7♥ A♠ K♠ 10♣ 8♦ 6♦', { '0@3': '8♥', '0@2': 'Q♥', '0@1': '6♥' }, 'Hand', 'Each player holds 9 cards. You can see only your own.', { cols: 5 })),
      P(zone('won', 2, 1.4, 'Tricks won', 'Tricks your side has taken, kept face down. Their card points are counted at the end of the hand.')),
    ]),
    S('Learn the trump order', 'In the trump suit the jack is highest and worth 20 points, then the nine, worth 14, then A, K, Q, 10, 8, 7, 6. In the other suits the order is A, K, Q, J, 10, 9, 8, 7, 6.', 'hand', [], 'In every suit an ace counts 11, a ten 10, a king 4, a queen 3 and a plain jack 2. Winning the last trick adds 5, so a hand holds 157 points.'),
    S('Keep score', 'Scores are kept on a Jass slate with chalk, or on paper, with one side for each team.', 'c', [], 'Agree a target before you start. Totals of 1000, 2500 and 3000 are all common, and many groups count some trump suits double. The full game also scores melds shown during the first trick (Weis) and 20 for holding the king and queen of trumps (Stöck).'),
    S('Ready to play', 'The player on the dealer\'s right, called forehand, either names the trump suit or "shoves" the choice to their partner, who then has to name it. Forehand leads to the first trick either way.', 'all', [], 'Many groups also allow two games with no trumps: Obenabe, where aces are high, and Undenufe, where sixes are high. In the first hand of a session, a common rule is that whoever holds a particular seven is forehand.'),
  ],
  turn: [
    T('You choose trumps', 'The dealer is on your left, so you are forehand. With the jack, nine and ace of hearts you name hearts rather than shove.', 'you'),
    T('You lead', 'You lead the J♥, the top trump.', 'trick', [mv('hand.0', at('trick', ...SPOT[0]))]),
    T('The others follow', 'Play goes anticlockwise, starting on your right. Trumps were led, so each player must play a trump if they have one, except that the jack of trumps never has to be played.', 'trick', [
      flip('hand.0@3'), mv('hand.0@3', at('trick', ...SPOT[3])), flip('hand.0@2'), mv('hand.0@2', at('trick', ...SPOT[2])), flip('hand.0@1'), mv('hand.0@1', at('trick', ...SPOT[1])),
    ], 9),
    T('Take the trick', 'Your jack wins. Gather the cards face down and lead again. This trick is worth 23 points: 20 for the jack and 3 for the queen.', 'you', [
      flip('hand.0', false), mv('hand.0', at('won', 0.5, 0.5)), flip('hand.0@3', false), mv('hand.0@3', at('won', 0.5, 0.5, 0.02)), flip('hand.0@2', false), mv('hand.0@2', at('won', 0.5, 0.5, 0.04)), flip('hand.0@1', false), mv('hand.0@1', at('won', 0.5, 0.5, 0.06)),
    ]),
    T('Following suit', 'When a plain suit is led you must follow suit or play a trump, and you may trump even if you could follow. You may not play a lower trump than one already in the trick unless you hold nothing but trumps.', 'all', [], 8),
    T('How it ends', 'After nine tricks each team counts its card points, and a team that took all nine adds 100. Deal again, passing the deal to the right, until one team reaches the agreed target and wins.', 'all', [], 8),
  ],
}))
