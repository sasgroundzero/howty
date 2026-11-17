/** Canasta: partners meld cards of the same rank and build seven-card canastas. */
import { C, P, S, T, at, draw, mv, set, tabletop, zone } from '../compose'
import { hand, pc, shown, stock } from '../playing'

const show = (id: string, s: string) => set(id, { face: pc(s), faceUp: true })

export const canasta = tabletop('canasta', 'Canasta', [4, 4], 4, '60–90 min', 'Hard', 'Partners race to meld sevens of a kind.', ['#c0392b', '#27457a', '#7a4fa3'], () => ({
  setup: [
    S('Shuffle two packs together', 'Canasta uses two standard 52-card decks plus four jokers, 108 cards in all. The four players form two partnerships, with partners sitting opposite each other.', 'c', [], 'This is Classic Canasta for four. The name is Spanish for "basket". Versions for two or three players, and the modern American game, have different rules.'),
    S('Deal eleven cards each', 'Shuffle everything together and deal 11 cards to each player, one at a time and face down.', 'you', [
      P(hand('hand', '4♠ 5♦ 7♣ 7♥ 9♠ J♦ K♣ K♥ K♠ A♦ A♣', 'Your hand', 'Your 11 cards. Keep them hidden, even from your partner.', { cols: 6 })),
    ]),
    S('Make the stock and discard pile', 'Put the rest of the cards face down in the middle as the stock and turn the top card face up beside it to start the discard pile.', 'c', [
      C(stock('stock', 63, 'Stock', 'The 63 undealt cards. Most turns begin by drawing the top one.'), shown('disc', '8♦', 'Discard pile', 'Everyone discards here. You take the whole pile or none of it, and only if you can meld its top card.')),
    ], 'If the turned card is a joker, a two or a red three, turn another card on top of it until an ordinary card shows.'),
    S('Set out any red threes', 'Red threes are bonus cards and are never kept in the hand. If you were dealt one, lay it face up in front of you and draw a replacement from the stock. Do the same whenever you draw one.', 'you', [
      P(zone('melds', 5, 1.4, 'Your melds', 'Melds are laid face up here. Partners keep their melds together in front of one of them.')),
    ], 'Each red three is worth 100 points to a side that has melded, and costs 100 to a side that has not.'),
    S('Learn the special cards', 'Jokers and twos are wild. A meld is three or more cards of the same rank, with at least two natural cards and no more than three wild ones. Black threes cannot be melded except when going out.', 'hand', [], 'Card values: jokers 50, aces and twos 20, kings down to eights 10, sevens down to fours and black threes 5.'),
    S('Know the first meld rule', 'The first time your side melds in a deal, the cards you lay down in that turn must be worth at least 50 points. You need a pencil and paper to keep score.', 'c', [], 'The minimum rises as you score: 90 points once your side has 1,500, and 120 once it has 3,000. A side with a negative score needs only 15.'),
    S('Ready to play', 'The player to the left of the dealer goes first and play runs clockwise. In this example that is you. A turn is: draw, meld if you can and wish to, then discard one card.', 'all'),
  ],
  turn: [
    T('Draw from the stock', 'You take the top card of the stock. It is a two, which is a wild card.', 'you', [
      draw('stock', at('hand.10', 1.15, 0.5, 0.02), pc('2♥'), 'got'),
    ]),
    T('Make your first meld', 'You lay down three kings with the wild two. Kings are worth 10 each and the two is worth 20, which makes exactly the 50 points your side needs.', 'melds', [
      mv('hand.6', at('melds', 0.2, 0.5)), mv('hand.7', at('melds', 0.4, 0.5)), mv('hand.8', at('melds', 0.6, 0.5)), mv('got', at('melds', 0.8, 0.5)),
    ], 8),
    T('Discard to end your turn', 'Every turn ends with one card placed face up on the discard pile. You throw the 4♠.', 'c', [
      mv('hand.0', at('disc', 0.5, 0.5, 0.01)),
    ]),
    T('The next player blocks the pile', 'The player on your left draws from the stock and discards a black three. A black three on top stops the next player from taking the discard pile.', 'c', [
      draw('stock', at('hand.10@1', 1.15, 0.5, 0.02)),
      show('hand.0@1', '3♣'), mv('hand.0@1', at('disc', 0.5, 0.5, 0.03), 1.4),
    ], 8),
    T('Taking the pile and making canastas', 'Instead of drawing you may take the whole discard pile, if you can meld its top card with two matching natural cards from your hand. The rule is looser once your side has melded, unless a wild card in the pile has frozen it. A meld of seven or more cards is a canasta.', 'all', [], 9),
    T('How it ends', 'You may go out, by getting rid of your last card, only when your side has a canasta. Each side then scores its melded cards and bonuses, including 500 for a canasta with no wild cards, 300 for a mixed one and 100 for going out, minus the cards left in hand. The first side to 5,000 wins.', 'all', [], 9),
  ],
}))
