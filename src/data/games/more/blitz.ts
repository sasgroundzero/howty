/** Blitz (Thirty-One, Scat): three cards each, and you want the most points in a single suit. */
import { C, P, R, S, T, at, discs, draw, flip, mv, set, tabletop, zone } from '../compose'
import { hand, pc, shown, stock } from '../playing'

const show = (id: string, card: string) => set(id, { faceUp: true, face: pc(card) })

export const blitz = tabletop('blitz', 'Blitz', [2, 8], 4, '15–30 min', 'Easy', 'Three cards, one suit, as close to 31 as you can.', ['#1d6b4f', '#d4a017', '#ffffff'], (n) => ({
  setup: [
    S('Take one pack and three counters each', 'Blitz uses one standard 52-card deck with no jokers. Give every player three coins or counters: these are their lives.', 'you', [
      P(discs('lives', 3, 0.22, '#d4a017', 'Lives', 'Three counters each. You pay one into the middle every time you lose a hand.', { h: 0.08 })),
    ], 'The same game is also called Thirty-One or Scat. More than 8 can play, but this guide stops at 8.'),
    S('Deal three cards each', 'Shuffle and deal three cards to each player, one at a time and face down, starting on the dealer\'s left.', 'you', [
      P(hand('hand', 'K♥ 7♥ 5♣', 'Your hand', 'Your three cards. You always hold exactly three between turns.')),
    ]),
    S('Set out the stock and the discard pile', 'Put the rest of the pack face down in the middle as the stock, and turn its top card face up beside it to start the discard pile.', 'c', [
      C(stock('stock', 52 - 3 * n - 1, 'Stock', `The ${52 - 3 * n - 1} cards left after the deal. You may draw the unseen top card on your turn.`), shown('up', '9♠', 'Discard pile', 'One face-up pile. You may take its top card instead of drawing from the stock.')),
      R(zone('kitty', 1.8, 1.4, 'Kitty', 'Lives that players have lost are paid in here.')),
    ]),
    S('Know what a hand is worth', 'Only cards of one suit count together. Add up your best suit: an ace is 11, a king, queen or jack is 10 and other cards are their number. The best possible hand is 31.', 'hand', [],
      'Your K♥ and 7♥ make 17. The 5♣ is a different suit, so it adds nothing. Some groups also count three of a kind as 30 or 30½: agree this first.'),
    S('Ready to play', 'The player on the dealer\'s left goes first and play runs clockwise. On your turn you draw one card and then discard one.', 'all', [], 'Here you are sitting on the dealer\'s left, so you start.'),
  ],
  turn: [
    T('Draw a card', 'Take either the top card of the stock or the top card of the discard pile. You do not want the 9♠, so you draw from the stock and get the A♥.', 'you', [
      draw('stock', at('hand.2', 1.15, 0.5, 0.02), pc('A♥'), 'drawn'),
    ]),
    T('Discard a card', 'Throw one card face up on the discard pile to get back to three. You drop the 5♣ and now hold 28 in hearts.', 'c', [
      mv('hand.2', at('up', 0.5, 0.5, 0.02)),
    ]),
    T('The next player takes a turn', 'The player on your left picks up your 5♣ and discards the Q♦. If you take the top discard you may not throw that same card straight back.', 'c', [
      flip('hand.2', false), mv('hand.2', at('hand.2@1', 1.15, 0.5, 0.02)), show('hand.0@1', 'Q♦'), mv('hand.0@1', at('up', 0.5, 0.5, 0.02), 1.4),
    ]),
    T('Knock, or show 31', 'Instead of drawing, you may knock on the table. Everyone else then gets one last turn and all hands are shown. If you ever hold exactly 31, show it at once: the hand ends and every other player loses a life.', 'you'),
    T('The lowest hand loses a life', 'After a knock, the player with the lowest total pays one counter into the kitty. Everyone tied for lowest pays, except a knocker who ties, who is safe. If the knocker has the lowest hand outright, the knocker pays two.', 'kitty', [
      mv('lives.0@1', at('kitty', 0.5, 0.5)),
    ]),
    T('How it ends', 'Deal again, passing the deal to the left. A player with no counters left may keep playing until they lose once more, and then they are out. The last player still in wins.', 'all'),
  ],
}))
