/** Ninety-Nine: David Parlett's game where three of your cards secretly say how many tricks you will win. */
import { C, P, S, T, at, flip, mv, tabletop, zone, type Act, type Item } from '../compose'
import { hand, pc } from '../playing'

/** A hand whose face-down copies at other seats get their own faces: seen['0@1'] is card 0 of seat 1. */
const dealt = (id: string, mine: string, seen: Record<string, string>, title: string, body: string, o: { cols?: number } = {}): Item => {
  const it = hand(id, mine, title, body, o)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); const s = seen[`${k}${seat ?? ''}`]; return s ? { ...m, props: { ...m.props, face: pc(s) } } : m } }
}
const SPOT: [number, number][] = [[0.7, 0.75], [0.3, 0.75], [0.5, 0.25]]
const MINE = 'A♣ K♣ 9♣ A♥ 10♥ 7♥ K♠ J♠ 8♠ 6♠ Q♦ 7♦'
const BID = [0.2, 0.5, 0.8]

export const ninetyNine = tabletop('ninety-nine', 'Ninety-Nine', [3, 3], 3, '30–45 min', 'Medium', 'Bid your tricks with three discards.', ['#1f6f4a', '#c0392b', '#1c1917'], () => ({
  setup: [
    S('Make the 36-card pack', 'From a standard deck take out the 2s, 3s, 4s and 5s, leaving 36 cards that run from 6 up to ace in each suit. Cards rank A (high), K, Q, J, 10, 9, 8, 7, 6.', 'c', [
      C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The highest trump, or the highest card of the suit led, takes the trick.')),
    ], 'Devised by David Parlett in 1968, first published in 1975, and written 99 for short. This is the original three-player game; he also gives versions for two, four and five. A joker can be added as a 37th card for an optional rule.'),
    S('Deal twelve cards each', 'Deal all the cards one at a time, face down. Each of the three players has 12.', 'you', [
      P(dealt('hand', MINE, { '0@1': '8♣', '0@2': '10♣' }, 'Hand', 'Each player is dealt 12 cards: 3 become the bid and 9 are played.', { cols: 6 })),
      P(zone('bid', 3.2, 1.4, 'Bid cards', 'Three cards laid face down. Their suits add up to the number of tricks you are promising to win.'), zone('won', 1.4, 1.4, 'Tricks won', 'Tricks you have taken. You want exactly as many as you bid.')),
    ]),
    S('Settle the trump suit', 'The first deal is played with no trumps. In later deals the trump suit depends on how many players made their bid last time: none makes it diamonds, one spades, two hearts and all three clubs.', 'c', [], 'With the optional joker, the 37th card is turned up to show the trump suit instead, and a nine turned up means no trumps.'),
    S('Learn the bidding code', 'You bid by putting three cards aside, and only their suits count: each club stands for 3 tricks, each heart for 2, each spade for 1 and each diamond for 0.', 'bid', [], 'Three diamonds is a bid of no tricks and three clubs is a bid of all nine.'),
    S('Keep score on paper', 'You need a pencil and paper with a column for each player.', 'c'),
    S('Ready to play', 'Everyone lays three bid cards face down, leaving 9 cards in hand. The player on the dealer\'s left leads to the first trick, and you must follow suit if you can.', 'all', [], 'Before the lead, one player may offer to "declare" by turning the bid cards face up, or to "reveal" by also playing with the whole hand exposed, for a bigger bonus.'),
  ],
  turn: [
    T('Make your bid', 'You expect to win three tricks, so you lay aside a heart, a spade and a diamond face down: 2 + 1 + 0 = 3.', 'bid', [4, 8, 11].flatMap((k, i): Act[] => [flip(`hand.${k}`, false), mv(`hand.${k}`, at('bid', BID[i], 0.5))]), 9),
    T('The others bid', 'The other two players each put three cards face down as well. Nobody knows what anyone else has bid.', 'all', [1, 2].flatMap((s) => [9, 10, 11].map((k, i) => mv(`hand.${k}@${s}`, at(`bid@${s}`, BID[i], 0.5), 0.3 + i * 0.3))), 9),
    T('The first trick', 'The player on your right dealt, so you lead. You play the A♣ and the others, going clockwise, must each follow with a club.', 'trick', [
      mv('hand.0', at('trick', ...SPOT[0])), flip('hand.0@1'), mv('hand.0@1', at('trick', ...SPOT[1])), flip('hand.0@2'), mv('hand.0@2', at('trick', ...SPOT[2])),
    ], 9),
    T('Take the trick', 'The highest card of the suit led wins, unless a trump is played. That is one of the three tricks you need, and you lead to the next.', 'you', [
      flip('hand.0', false), mv('hand.0', at('won', 0.5, 0.5)), flip('hand.0@1', false), mv('hand.0@1', at('won', 0.5, 0.5, 0.02)), flip('hand.0@2', false), mv('hand.0@2', at('won', 0.5, 0.5, 0.04)),
    ]),
    T('Score the deal', 'After nine tricks everyone scores 1 point per trick won. Each player who took exactly the number bid adds a bonus: 10 if all three succeeded, 20 if two did, and 30 if only one did.', 'all', [], 8),
    T('How it ends', 'A successful declare adds 30 and a successful reveal 60; if it fails, each opponent gets that bonus instead. The first player to reach 100 points wins the game and scores a 100-point bonus. In the original joker version, a game is nine deals instead.', 'all'),
  ],
}))
