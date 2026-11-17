/** Euchre: five cards each, a turned-up card, and the two jacks called bowers on top. */
import { C, P, R, S, T, at, flip, mv, tabletop, zone, type Item } from '../compose'
import { hand, pc, shown, stock } from '../playing'

/** A hand whose face-down copies at other seats get their own faces: seen['0@1'] is card 0 of seat 1. */
const dealt = (id: string, mine: string, seen: Record<string, string>, title: string, body: string, o: { cols?: number } = {}): Item => {
  const it = hand(id, mine, title, body, o)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); const s = seen[`${k}${seat ?? ''}`]; return s ? { ...m, props: { ...m.props, face: pc(s) } } : m } }
}
const SPOT: [number, number][] = [[0.7, 0.75], [0.3, 0.75], [0.3, 0.25], [0.7, 0.25]]

export const euchre = tabletop('euchre', 'Euchre', [4, 4], 4, '20–30 min', 'Easy', 'Call trumps and take three of five tricks.', ['#27457a', '#c0392b', '#1c1917'], () => ({
  setup: [
    S('Make the 24-card pack', 'From a standard deck keep only the 9, 10, J, Q, K and A of each suit. That is 24 cards, with no joker.', 'c', [
      C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The highest trump, or the highest card of the suit led, takes the trick.')),
    ], 'This is the usual North American game for four. Elsewhere, Euchre is often played with 32 cards or with a joker as top trump, and Bid Euchre and Buck Euchre are relatives.'),
    S('Sit opposite your partner', 'Four players form two teams, with partners facing each other across the table.', 'all', [], 'Many players keep score with two spare cards per team, such as the fives, sliding one over the other to show pips.'),
    S('Deal five cards each', 'Deal clockwise in two rounds, giving each player a batch of 2 or 3 cards each time so that everyone ends up with 5.', 'you', [
      P(dealt('hand', 'J♥ J♦ A♥ K♣ 9♠', { '0@1': '9♥', '0@2': 'Q♣' }, 'Hand', 'Each player holds 5 cards. You can see only your own.')),
      P(zone('won', 2, 1.4, 'Tricks won', 'Tricks your side has taken, kept face down.')),
    ]),
    S('Turn up the next card', 'Put the 4 cards left over face down in the middle and turn the top one face up. This card offers its suit as trumps.', 'r', [
      R(stock('kitty', 3, 'Kitty', 'The three undealt cards. They stay face down and are not used in this hand.'), shown('up', '10♥', 'Turned-up card', 'The suit of this card is offered as trumps in the first round of bidding.')),
    ]),
    S('Learn the trump order', 'In the trump suit the jack is highest (the right bower), then the other jack of the same color (the left bower), then A, K, Q, 10, 9. Other suits rank A, K, Q, J, 10, 9.', 'hand', [], 'The left bower counts as a trump in every way, not as a card of the suit printed on it.'),
    S('Choose trumps', 'Starting on the dealer\'s left, each player in turn may pass or accept the turned-up suit as trumps. If someone accepts, the dealer takes that card into hand and discards one face down.', 'r', [], 'If all four pass, the card is turned down and each player in turn may name a different suit or pass. If everyone passes again the next player deals, though many groups make the dealer choose.'),
    S('Ready to play', 'The side that chose trumps are the makers and must win at least 3 of the 5 tricks. The player on the dealer\'s left leads first, and you must follow suit if you can.', 'all', [], 'The player who chose trumps may announce "alone": the partner lays their cards down and sits out the hand.'),
  ],
  turn: [
    T('You order it up', 'The player on your right dealt, so you speak first. With both red jacks and the A♥ you accept hearts. The dealer picks up the 10♥ and discards a card face down.', 'r', [
      flip('up', false), mv('up', at('hand@3', 1.12, 0.5, 0.02)), mv('hand.4@3', at('kitty', 0.5, 0.5, 0.01)),
    ], 9),
    T('You lead', 'You are on the dealer\'s left, so you lead to the first trick. You play the J♥, the right bower, which is the highest card in the game.', 'trick', [mv('hand.0', at('trick', ...SPOT[0]))]),
    T('The others follow', 'Going clockwise, each player must play a heart if they have one. Your partner has none and throws away a club, and the dealer has to give up the 10♥.', 'trick', [
      flip('hand.0@1'), mv('hand.0@1', at('trick', ...SPOT[1])), flip('hand.0@2'), mv('hand.0@2', at('trick', ...SPOT[2])), flip('up'), mv('up', at('trick', ...SPOT[3])),
    ], 9),
    T('Take the trick', 'Your bower wins. Gather the four cards face down in front of you and lead to the next trick.', 'you', [
      flip('hand.0', false), mv('hand.0', at('won', 0.5, 0.5)), flip('hand.0@1', false), mv('hand.0@1', at('won', 0.5, 0.5, 0.02)), flip('hand.0@2', false), mv('hand.0@2', at('won', 0.5, 0.5, 0.04)), flip('up', false), mv('up', at('won', 0.5, 0.5, 0.06)),
    ]),
    T('Score the hand', 'Makers who win 3 or 4 tricks score 1 point, and all 5 tricks score 2. If the makers win fewer than 3 they are euchred and the other side scores 2.', 'all', [], 8),
    T('How it ends', 'A player who goes alone and wins all 5 tricks scores 4. Deal again, passing the deal to the left, until one team reaches 10 points and wins; some groups play to a different total.', 'all'),
  ],
}))
