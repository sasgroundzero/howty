/** Six-card Golf: swap cards in and out of a 3 x 2 grid to finish with the lowest score. */
import { C, P, S, T, at, draw, flip, mv, tabletop, type Item } from '../compose'
import { hidden, pc, pcs, shown, slot, stock } from '../playing'

/** One six-card grid per seat, so that no two players show the same cards. */
const DEALS = ['4♠ 10♦ 6♠ J♥ 9♥ 3♣', '6♥ 2♠ K♣ 10♣ Q♦ 5♠', '8♦ A♣ 7♥ 3♠ J♠ 4♦', '5♥ Q♣ 9♠ 2♦ 7♣ K♥', 'A♠ 8♥ J♦ 6♦ 3♥ 10♠', '7♦ 4♣ Q♥ 9♣ A♥ 5♦', '2♥ J♣ 8♠ K♠ 6♣ 4♥', '9♦ 5♣ A♦ Q♠ 10♥ 7♠']
const grid = (title: string, body: string): Item => {
  const it = hidden('grid', DEALS[0], title, body, { cols: 3 })
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); return { ...m, props: { ...m.props, face: pcs(DEALS[Number((seat || '@0').slice(1)) % 8])[k] } } } }
}

export const golf = tabletop('golf', 'Golf', [2, 8], 4, '30–45 min', 'Easy', 'Swap your six cards down to the lowest score.', ['#15803d', '#fef3c7', '#1c1917'], (n) => {
  const packs = n > 4 ? 2 : 1
  const left = packs * 52 - 6 * n - 1
  const seats = Array.from({ length: n }, (_, i) => i)
  return {
    setup: [
      S(packs === 1 ? 'Take one pack' : 'Shuffle two packs together', `With ${n} players, six-card Golf uses ${packs === 1 ? 'one standard 52-card deck' : 'two standard 52-card decks shuffled together'}, with no jokers.`, 'c', [],
        'Two to four players use one pack and five or more use two. More than 8 can play with a third pack, but this guide stops at 8. Some groups add jokers. The game is also called Six-Card Golf, and it has a four-card and a nine-card relative.'),
      S('Deal six cards each', 'Deal six cards to each player, one at a time and face down. Without looking at them, arrange yours in two rows of three.', 'you', [
        P(grid('Your layout', 'Six cards in two rows of three. Each one scores points against you at the end, so you want low cards.')),
      ]),
      S('Set out the stock and the discard pile', 'Put the rest of the cards face down in the middle as the stock, and turn its top card face up beside it to start the discard pile.', 'c', [
        C(stock('stock', left, 'Stock', `The ${left} cards left after the deal. You may draw the unseen top card on your turn.`), shown('discard', '8♣', 'Discard pile', 'One face-up pile. You may take its top card instead of drawing from the stock.')),
      ]),
      S('Learn the card values', 'An ace scores 1, a two scores minus 2, cards from 3 to 10 score their number, a jack or queen scores 10 and a king scores 0. Two cards of the same rank in one column cancel out and score 0.', 'c', [], 'These are the most usual values. Groups vary, especially over twos, jacks and jokers.'),
      S('Ready to play', 'Before the first turn, everyone turns any two of their six cards face up. The player on the dealer\'s left then goes first and play runs clockwise.', 'all', [], 'Here you are on the dealer\'s left. Some groups say the two cards must be in the same column, or must not be.'),
    ],
    turn: [
      T('Turn two cards face up', 'Everyone picks any two of their own cards and turns them over. The other four stay face down, and you may not peek at them.', 'all', seats.flatMap((i) => [flip(`grid.0@${i}`), flip(`grid.4@${i}`)])),
      T('Draw and swap', 'Take the top card of the stock or of the discard pile. You draw a king from the stock, worth 0, so you put it face up in place of one of your face-down cards. The card it replaces is turned over onto the discard pile.', 'you', [
        flip('grid.2'), mv('grid.2', at('discard', 0.5, 0.5, 0.02)), draw('stock', at('grid', ...slot(2, 3, 2)), pc('K♦'), 'k1', 1.4),
      ], 9),
      T('Or just discard it', 'If you do not want a card you drew from the stock, put it straight on the discard pile and your turn is over. A card taken from the discard pile must go into your layout.', 'c', [], 6),
      T('The next player makes a pair', 'The player on your left has a 6 showing. They take the 6♠ you just discarded and put it in the same column, throwing out the card that was there. A matching column scores 0.', 'grid@1', [
        mv('grid.2', at('grid@1', ...slot(3, 3, 2))), flip('grid.3@1'), mv('grid.3@1', at('discard', 0.5, 0.5, 0.02), 1.4),
      ], 9),
      T('Ending the deal', 'The deal ends when one player has all six cards face up. Usually every other player then takes one more turn. All remaining cards are turned over and everyone adds up their layout.', 'all'),
      T('How it ends', 'Write down the scores and deal again. A game is nine deals, like nine holes, and the player with the lowest total wins.', 'all', [], 6),
    ],
  }
})
