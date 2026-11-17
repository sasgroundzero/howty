/** 500: bid for the kitty, then make your tricks with the joker and the two bowers on top. */
import { C, P, R, S, T, at, draw, flip, hide, mv, tabletop, zone, type Item } from '../compose'
import { hand, pc, stock } from '../playing'

/** A hand whose face-down copies at other seats get their own faces: seen['0@1'] is card 0 of seat 1. */
const dealt = (id: string, mine: string, seen: Record<string, string>, title: string, body: string, o: { cols?: number } = {}): Item => {
  const it = hand(id, mine, title, body, o)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); const s = seen[`${k}${seat ?? ''}`]; return s ? { ...m, props: { ...m.props, face: pc(s) } } : m } }
}
const SPOT: [number, number][] = [[0.7, 0.75], [0.3, 0.75], [0.3, 0.25], [0.7, 0.25]]
const MINE = 'JK J♥ J♦ A♥ K♥ 9♥ A♠ K♠ 7♣ 5♦'

export const fiveHundred = tabletop('five-hundred', '500', [4, 4], 4, '45–60 min', 'Medium', 'Bid for the kitty, then make your tricks.', ['#7a4fa3', '#c0392b', '#1c1917'], () => ({
  setup: [
    S('Make the 43-card pack', 'From a standard 52-card deck take out the 2s, the 3s and the two black 4s, then add one joker. That leaves 43 cards.', 'c', [
      C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The highest trump, or the highest card of the suit led, takes all four.')),
    ], 'Also called Five Hundred, and Cinq Cents in French Canada. This is the four-player partnership game; versions for two, three, five and six players use different packs.'),
    S('Sit opposite your partner', 'The four players form two teams of two. Partners sit across the table from each other and share one score.', 'all'),
    S('Deal ten cards each and a kitty', 'Deal clockwise in batches: 3 cards to each player and 1 to the kitty, then 4 each and 1 to the kitty, then 3 each and 1 to the kitty.', 'you', [
      P(dealt('hand', MINE, { '0@1': '10♥', '0@2': '5♥', '0@3': '8♥' }, 'Hand', 'Each player holds 10 cards. You can see only your own.', { cols: 5 })),
      P(zone('won', 2, 1.4, 'Tricks won', 'Tricks your side has taken are stacked here face down.')),
      R(stock('kitty', 3, 'Kitty', 'Three face-down cards. The player who wins the bidding picks them up.')),
    ], 'Everyone ends up with 10 cards and the kitty has 3.'),
    S('Learn the trump order', 'In the trump suit the joker is highest, then the jack of trumps (right bower), then the other jack of the same color (left bower), then A, K, Q, 10, 9 and down.', 'hand', [], 'The left bower counts as a trump, not as a card of its printed suit. In the other suits cards rank A, K, Q, J, 10 and down.'),
    S('Bid for the contract', 'Starting on the dealer\'s left, each player in turn passes or bids a number of tricks, at least six, with a trump suit or no trumps. Each bid must beat the last.', 'all', [], 'For the same number of tricks the order is spades, clubs, diamonds, hearts, then no trumps. Once you pass you are out of the bidding. Groups vary on this and on the losing bids called misere.'),
    S('Keep score on paper', 'You need a pencil and paper with one column for each team. A team wins by reaching 500 points on a contract it made, and loses if it falls to minus 500.', 'c', [], 'Bids are worth 40 for six spades up to 520 for ten no trumps: each extra trick adds 100, and each step up in suit adds 20.'),
    S('Ready to play', 'The highest bidder is the contractor, who takes the kitty, discards three cards and leads to the first trick.', 'all', [], 'You must follow the suit that was led if you can. If everyone passes, the cards are thrown in and dealt again.'),
  ],
  turn: [
    T('You win the bidding', 'The player on your right dealt, so you bid first. You say "seven hearts" and the other three pass, so you are the contractor and hearts are trumps.', 'you'),
    T('Pick up the kitty', 'Take the three kitty cards into your hand. You now hold 13.', 'you', [
      draw('kitty', at('hand.9', 1.15, 0.5, 0.02), pc('Q♥'), 'k0'), draw('kitty', at('hand.9', 1.5, 0.5, 0.04), pc('6♣'), 'k1'), draw('kitty', at('hand.9', 1.85, 0.5, 0.06), pc('4♦'), 'k2'), hide('kitty'),
    ]),
    T('Discard three cards', 'Put any three cards face down out of play, so that you are back to 10. They can include cards you just picked up.', 'r', [
      flip('hand.9', false), mv('hand.9', at('kitty', 0.5, 0.5)), flip('k1', false), mv('k1', at('kitty', 0.5, 0.5, 0.02)), flip('k2', false), mv('k2', at('kitty', 0.5, 0.5, 0.04)),
    ]),
    T('Lead to the first trick', 'You lead the joker, the highest trump. Going clockwise, the others must each play a trump if they have one.', 'trick', [
      mv('hand.0', at('trick', ...SPOT[0])), flip('hand.0@1'), mv('hand.0@1', at('trick', ...SPOT[1])), flip('hand.0@2'), mv('hand.0@2', at('trick', ...SPOT[2])), flip('hand.0@3'), mv('hand.0@3', at('trick', ...SPOT[3])),
    ], 9),
    T('Take the trick', 'The highest trump wins, or the highest card of the suit led if nobody played a trump. You gather the four cards face down and lead the next trick.', 'you', [
      flip('hand.0', false), mv('hand.0', at('won', 0.5, 0.5)), flip('hand.0@1', false), mv('hand.0@1', at('won', 0.5, 0.5, 0.02)), flip('hand.0@2', false), mv('hand.0@2', at('won', 0.5, 0.5, 0.04)), flip('hand.0@3', false), mv('hand.0@3', at('won', 0.5, 0.5, 0.06)),
    ]),
    T('How it ends', 'After ten tricks, your side scores the value of the bid (200 for seven hearts) if you took at least that many tricks and loses that value if you did not. The other side scores 10 for each trick it took.', 'all', [], 8),
  ],
}))
