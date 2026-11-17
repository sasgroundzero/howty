/** German Whist: play thirteen tricks to build your hand, then thirteen more that count. */
import { C, L, On, P, R, S, T, at, draw, flip, mv, tabletop, zone, type Item } from '../compose'
import { hand, pc, shown, slot, stock } from '../playing'

/** A hand whose face-down copies at other seats get their own faces: seen['0@1'] is card 0 of seat 1. */
const dealt = (id: string, mine: string, seen: Record<string, string>, title: string, body: string, o: { cols?: number } = {}): Item => {
  const it = hand(id, mine, title, body, o)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); const s = seen[`${k}${seat ?? ''}`]; return s ? { ...m, props: { ...m.props, face: pc(s) } } : m } }
}
const MINE = 'A♠ 9♠ 6♠ Q♥ 8♥ 3♥ K♦ 10♦ 4♦ J♣ 7♣ 5♣ 2♣'

export const germanWhist = tabletop('german-whist', 'German Whist', [2, 2], 2, '20–30 min', 'Easy', 'Whist for two: build a hand, then play it.', ['#1f6f4a', '#1c1917', '#c0392b'], () => ({
  setup: [
    S('Take a 52-card deck', 'German Whist uses one standard 52-card deck with no jokers. Cards rank from ace (high) down to 2.', 'c', [
      C(zone('trick', 3, 3, 'Trick', 'The leader plays a card here and the other player answers with one.')),
    ], 'Despite the name it is a British game, a version of Whist for two players. Honeymoon Whist is a close relative.'),
    S('Deal thirteen cards each', 'Deal the cards one at a time until each player has 13.', 'you', [
      P(dealt('hand', MINE, { '2@1': '4♠' }, 'Hand', 'Each player holds 13 cards. You can see only your own.', { cols: 7 })),
      P(zone('won', 2, 1.4, 'Tricks won', 'Tricks you win once the stock has run out. Only these count.')),
    ]),
    S('Place the stock', 'Put the remaining 26 cards face down in a pile between you.', 'r', [
      R(stock('stock', 25, 'Stock pile', 'The 26 undealt cards, including the one turned up on top. One card goes to each player after every trick until the pile is gone.')),
      L(zone('waste', 1.4, 1.8, 'Played cards', 'Tricks played while the stock lasts are turned down here. They do not score.')),
    ]),
    S('Turn up the top card', 'Turn the top card of the stock face up. Its suit is trumps for the whole hand.', 'r', [
      On('stock', 0.5, 0.5, shown('up', 'K♥', 'Top card', 'The face-up card on the stock. The winner of the next trick takes it.')),
    ]),
    S('Ready to play', 'The non-dealer leads to the first trick. You must follow suit if you can; otherwise you may play any card, including a trump.', 'all', [], 'The winner of each trick takes the face-up card, the loser takes the hidden card under it, and then the next card is turned up. Some groups do not require following suit while the stock lasts.'),
  ],
  turn: [
    T('You lead', 'You did not deal, so you lead. The K♥ on the stock is a high trump worth having, so you lead the A♠ to win it.', 'trick', [mv('hand.0', at('trick', 0.5, 0.75))]),
    T('Your opponent follows suit', 'Your opponent holds a spade and so has to play one. The highest card of the suit led wins unless a trump is played.', 'trick', [flip('hand.2@1'), mv('hand.2@1', at('trick', 0.5, 0.25))]),
    T('Each take a card', 'You won, so you take the face-up K♥ into your hand. Your opponent takes the next card without showing it. The two played cards are turned down and set aside.', 'r', [
      mv('up', at('hand', ...slot(0, 7, 2))), draw('stock', at('hand@1', ...slot(2, 7, 2))),
      flip('hand.0', false), mv('hand.0', at('waste', 0.5, 0.5)), flip('hand.2@1', false), mv('hand.2@1', at('waste', 0.5, 0.5, 0.02)),
    ], 9),
    T('Turn up the next card', 'Turn the new top card of the stock face up and lead to the next trick, since you won the last one. If the card on show is poor, you may prefer to lose the trick.', 'r', [draw('stock', at('stock', 0.5, 0.5, 0.01), pc('3♦'), 'up2')]),
    T('Play out the hands', 'After 13 tricks the stock is empty and each player holds 13 cards. Play these out in 13 more tricks with the same trumps and no drawing, keeping the tricks you win.', 'all'),
    T('How it ends', 'Whoever wins the majority of the last 13 tricks, which means 7 or more, wins the hand. Some groups count the tricks from both halves instead.', 'all'),
  ],
}))
