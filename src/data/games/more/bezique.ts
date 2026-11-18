/** Bezique: two packs, eight cards each, and points for the melds you declare after winning a trick. */
import { C, P, R, S, T, at, draw, flip, mv, tabletop, zone, type Item } from '../compose'
import { hand, pc, shown, slot, stock } from '../playing'

/** A hand whose face-down copies at other seats get their own faces: seen['0@1'] is card 0 of seat 1. */
const dealt = (id: string, mine: string, seen: Record<string, string>, title: string, body: string, o: { cols?: number } = {}): Item => {
  const it = hand(id, mine, title, body, o)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); const s = seen[`${k}${seat ?? ''}`]; return s ? { ...m, props: { ...m.props, face: pc(s) } } : m } }
}
const MINE = 'A♣ K♠ Q♠ 10♦ J♣ 9♥ 8♣ 7♦'

export const bezique = tabletop('bezique', 'Bezique', [2, 2], 2, '30–45 min', 'Medium', 'Win tricks to declare marriages and beziques.', ['#27457a', '#9b2c2c', '#ffffff'], () => ({
  setup: [
    S('Shuffle two short packs together', 'Take two standard decks and keep only the A, K, Q, J, 10, 9, 8 and 7 of each suit. Shuffle the two 32-card packs together to make 64 cards, with every card appearing twice.', 'c', [
      C(zone('trick', 3, 3, 'Trick', 'The leader plays a card here and the other player answers with one.')),
    ], 'The French name is Bésigue. This is the basic two-player game; Rubicon Bezique and Chinese Bezique use more packs and bigger hands.'),
    S('Learn the card order', 'In every suit the cards rank A (high), 10, K, Q, J, 9, 8, 7. The ten beats the king.', 'c', [], 'If two identical cards meet in a trick, the one played first wins.'),
    S('Deal eight cards each', 'The dealer gives each player 8 cards in batches of 3, then 2, then 3.', 'you', [
      P(dealt('hand', MINE, { '3@1': '8♦' }, 'Hand', 'Each player holds 8 cards. You can see only your own.', { cols: 4 })),
      P(zone('melds', 2.4, 1.4, 'Melds', 'Combinations you declare are laid face up here. They still count as part of your hand and can be played to tricks.'), zone('won', 1.4, 1.4, 'Tricks won', 'Cards you have won, kept face down. Aces and tens in this pile score at the end.')),
    ]),
    S('Turn up the trump card', 'Turn the next card face up: its suit is trumps. Put the other 47 cards face down next to it as the stock.', 'r', [
      R(stock('stock', 47, 'Stock pile', 'The 47 undealt cards. After every trick both players draw one, so hands stay at 8 until the stock runs out.'), shown('trump', 'K♥', 'Trump card', 'The turned-up card shows the trump suit. It is the last card drawn from the stock.')),
    ], 'If the turned-up card is a 7, the dealer scores 10 at once. Later, a player who has just won a trick may swap the 7 of trumps for the turned-up card and score 10.'),
    S('Know the melds', 'Melds score when declared: K and Q of one suit 20 (40 in trumps), Q♠ with J♦ (a bezique) 40, four jacks 40, four queens 60, four kings 80, four aces 100, and A 10 K Q J of trumps 250.', 'melds', [], 'Both Q♠ and both J♦ together are a double bezique worth 500. Groups differ on the finer points of reusing a melded card in another meld.'),
    S('Keep score', 'Use paper and pencil or a pair of bezique markers. Scores are written down as they happen.', 'c'),
    S('Ready to play', 'The non-dealer leads any card. While the stock lasts you may answer with any card at all: you need not follow suit.', 'all', [], 'A trick goes to the higher card of the suit led, or to a trump played on a plain suit. The winner may declare one meld, then both players draw.'),
  ],
  turn: [
    T('You lead a card', 'You did not deal, so you lead. You play the A♣.', 'trick', [mv('hand.0', at('trick', 0.5, 0.75))]),
    T('Your opponent answers', 'Your opponent may play anything and throws a low diamond. It is not a club or a trump, so your ace wins.', 'trick', [flip('hand.3@1'), mv('hand.3@1', at('trick', 0.5, 0.25))]),
    T('Take the trick and declare', 'Take the two cards. Having just won a trick you may declare one meld: lay down the K♠ and Q♠, a marriage, and score 20.', 'you', [
      flip('hand.0', false), mv('hand.0', at('won', 0.5, 0.5)), flip('hand.3@1', false), mv('hand.3@1', at('won', 0.5, 0.5, 0.02)),
      mv('hand.1', at('melds', 0.3, 0.5)), mv('hand.2', at('melds', 0.7, 0.5)),
    ], 9),
    T('Both draw a card', 'The winner of the trick draws the top card of the stock, then the loser draws the next. The winner leads again.', 'r', [
      draw('stock', at('hand', ...slot(0, 4, 2)), pc('Q♥'), 'new'), draw('stock', at('hand@1', ...slot(3, 4, 2))),
    ]),
    T('The last eight tricks', 'When the stock is gone, the loser of that trick takes the face-up trump card and melds go back into the hands. No more melds are declared, and now you must follow suit and win the trick if you can.', 'all'),
    T('How it ends', 'Winning the very last trick scores 10, and every ace and ten in your tricks, called a brisque, scores 10. Deal again until someone reaches 1000 points; some groups play to a different total.', 'all'),
  ],
}))
