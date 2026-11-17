/** Palace: play out your hand, then your three face-up cards, then three you have never seen. */
import { C, On, P, S, T, at, draw, mv, set, tabletop, zone, type Item } from '../compose'
import { hand, hidden, pc, pcs, shown, slot, stock } from '../playing'

const show = (id: string, card: string) => set(id, { faceUp: true, face: pc(card) })
/** Face-up table cards differ from seat to seat, since everyone can see them. */
const UPS = ['K♠ 4♥ 9♦', 'Q♥ 8♠ 2♦', 'J♣ 10♥ 6♠', 'A♣ 5♦ Q♠', '9♣ K♦ 7♥']
const ups = (title: string, body: string): Item => {
  const it = shown('up', UPS[0], title, body)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); return { ...m, props: { ...m.props, face: pcs(UPS[Number((seat || '@0').slice(1)) % 5])[k] } } } }
}

export const palace = tabletop('palace', 'Palace', [2, 5], 4, '15–30 min', 'Easy', 'Shed your hand, then the cards on the table.', ['#6d28d9', '#facc15', '#ffffff'], (n) => ({
  setup: [
    S('Take one pack', 'Palace uses one standard 52-card deck with no jokers. Cards rank from 3, the lowest, up to the ace. Twos and tens are special.', 'c', [],
      'The game goes by several other names, such as Karma or Ten-Two Slide. Up to five can play with one deck. Bigger groups add jokers or a second deck, and their rules vary.'),
    S('Deal three cards face down', 'Deal each player a row of three cards face down. Nobody may look at these, not even their owner, until they are played at the very end.', 'you', [
      P(hidden('down', '5♠ J♦ 8♣', 'Face-down cards', 'Three unseen cards. They are the last ones you play, one at a time, without looking first.')),
    ]),
    S('Deal three cards face up on top', 'Deal each player three more cards face up, one on top of each face-down card.', 'you', [
      On('down', 0.5, 0.5, ups('Face-up cards', 'Three cards everyone can see. You play these once your hand and the stock are both used up.')),
    ]),
    S('Deal three cards to each hand', 'Deal each player a hand of three cards. Pick yours up and keep them hidden.', 'you', [
      P(hand('hand', '3♣ A♦ 7♣', 'Your hand', 'You play from your hand first and refill it to three cards from the stock after every turn.')),
    ]),
    S('Set out the stock', `Put the ${52 - 9 * n} cards that are left face down in the middle as the stock. Leave room beside it for the pile.`, 'c', [
      C(stock('stock', 52 - 9 * n, 'Stock', `The ${52 - 9 * n} cards left after the deal. Draw from here to bring your hand back up to three.`), zone('pile', 1.6, 1.7, 'Pile', 'Everyone plays face up onto one pile here. If you cannot beat the top card, you pick the whole pile up.')),
    ]),
    S('Swap cards before you start', 'Before play begins, you may swap any cards in your hand with any of your face-up cards. Strong cards are best left on the table for later.', 'you', [], 'This is the first thing you will see in the walkthrough.'),
    S('Ready to play', 'Play runs clockwise. On your turn you play a card equal to or higher than the top card of the pile, then draw back up to three cards.', 'all', [],
      'A common way to pick the starter: the first player dealt a 3 face up begins, or failing that the first to show a 3 from their hand, then a 4 and so on. Other groups just start on the dealer\'s left.'),
  ],
  turn: [
    T('Swap for a better table', 'You would rather keep your ace for the endgame, so you put it face up on the table and take the 4♥ into your hand in its place.', 'you', [
      mv('hand.1', at('down', ...slot(1, 3))), mv('up.1', at('hand', ...slot(1, 3))),
    ]),
    T('Play a card and draw back to three', 'Nobody has a 3 face up and you hold one, so you start by playing the 3♣ to the pile. Then take a card from the stock so that you have three again.', 'pile', [
      mv('hand.0', at('pile', 0.5, 0.5)), draw('stock', at('hand', ...slot(0, 3)), pc('J♥'), 'n1', 1.4),
    ]),
    T('Equal or higher', 'The player on your left must play a card that is equal to or higher than your 3. They play the 8♦ and draw. Two or more cards of the same rank may be played together.', 'pile', [
      show('hand.2@1', '8♦'), mv('hand.2@1', at('pile', 0.5, 0.5, 0.02)), draw('stock', at('hand@1', ...slot(2, 3)), undefined, 'n2', 1.6),
    ], 9),
    T('Twos, tens and four of a kind', 'A 2 can be played on anything and the next player may play anything on it. A 10 removes the whole pile from the game, and so does completing four cards of one rank on top: whoever did it plays again. Groups differ on whether a 10 may go on a higher card.', 'pile', [], 9),
    T('Pick up if you cannot play', 'If you cannot or do not want to beat the top card, take the whole pile into your hand. The next player starts a new pile with any card.', 'you', [], 6),
    T('How it ends', 'When the stock and your hand are both empty you play your face-up cards, and after those your face-down cards, turning one over blind each turn. The first player to get rid of every card wins. Many groups play on until only one player, the loser, is left.', 'all', [], 9),
  ],
}))
