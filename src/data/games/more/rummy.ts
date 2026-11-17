/** Rummy: draw, meld sets and runs, discard, and be first to empty your hand. */
import { C, P, S, T, at, draw, mv, set, tabletop, zone } from '../compose'
import { BACK, hand, pc, shown, stock } from '../playing'

const FULL = '7♠ 7♦ 3♣ 4♣ K♥ 9♦ J♠ 2♥ 5♥ 10♦'.split(' ')
const show = (id: string, s: string) => set(id, { face: pc(s), faceUp: true })

export const rummy = tabletop('rummy', 'Rummy', [2, 6], 4, '20–40 min', 'Easy', 'Draw and discard to build sets and runs.', ['#3d8b4a', '#c0392b', '#ffffff'], (n) => {
  const size = n === 2 ? 10 : n <= 4 ? 7 : 6
  const last = size - 1
  return {
    setup: [
      S('Sort out the deck', 'Rummy uses one standard 52-card deck with no jokers. Leave room in front of each player for the melds they will lay down.', 'you', [
        P(zone('melds', 3.4, 1.4, 'Your melds', 'Sets and runs you lay down go here face up. Once a meld is on the table, anyone may add matching cards to it.')),
      ], 'This is the plain game, often called Straight Rummy or Basic Rummy. Up to 6 can play, but it is best with 2 to 4.'),
      S(`Deal ${size} cards each`, `Shuffle and deal the cards one at a time, face down, until everyone has ${size}.`, 'you', [
        P(hand('hand', FULL.slice(0, size).join(' '), 'Your hand', `Your ${size} cards. Keep them hidden and look for groups that could become melds.`, { cols: 7 })),
      ], 'The deal depends on the player count: 10 cards each for two players, 7 each for three or four, and 6 each for five or six.'),
      S('Make the stock and discard pile', 'Put the rest of the cards face down in the middle as the stock. Turn its top card face up beside it to start the discard pile.', 'c', [
        C(stock('stock', 52 - n * size - 1, 'Stock', 'The undealt cards, face down. You may take the top one at the start of your turn.'), shown('disc', '8♠', 'Discard pile', 'Face-up cards that players have thrown away. Only the top card may be taken.')),
      ]),
      S('Know the melds', 'A set is 3 or 4 cards of the same rank. A run is 3 or more cards of the same suit in order, such as 4♥ 5♥ 6♥.', 'hand', [], 'In the standard game the ace is low: A-2-3 is a run but Q-K-A is not. Some groups let it count high as well.'),
      S('Keep score on paper', 'You need a pencil and paper. Agree before you start on a target score or a number of deals.', 'c'),
      S('Ready to play', `${n === 2 ? 'The player who did not deal goes first.' : 'The player to the left of the dealer goes first and play runs clockwise.'} In this example that is you. A turn is: draw one card, meld if you can and wish to, then discard one card.`, 'all', [], 'In the strict rules you may lay down only one new meld per turn, though many groups allow more.'),
    ],
    turn: [
      T('Draw a card', 'Start every turn by taking either the top card of the stock or the top card of the discard pile. You take from the stock and get the 7♥.', 'you', [
        draw('stock', at(`hand.${last}`, 1.15, 0.5, 0.02), pc('7♥'), 'got'),
      ]),
      T('Lay down a meld', 'You now hold three sevens, so you place them face up in front of you as a set. You may also add cards to melds already on the table.', 'melds', [
        mv('hand.0', at('melds', 0.2, 0.5)), mv('hand.1', at('melds', 0.5, 0.5)), mv('got', at('melds', 0.8, 0.5)),
      ]),
      T('Discard to end your turn', 'Finish by placing one card face up on the discard pile. You throw away the king, which would cost you 10 points if you were caught holding it.', 'c', [
        mv('hand.4', at('disc', 0.5, 0.5, 0.01)),
      ]),
      T('The next player takes your discard', 'The player on your left wants your king and takes it instead of drawing from the stock. They then discard a different card: you may not throw back the card you just picked up.', 'c', [
        set('hand.4', { faceUp: false, back: BACK }), mv('hand.4', at('hand.0@1', 1.15, 0.5, 0.02)),
        show('hand.1@1', '2♣'), mv('hand.1@1', at('disc', 0.5, 0.5, 0.01), 1.4),
      ], 8),
      T('Going out', 'The deal ends the moment a player gets rid of their last card, whether by melding it, adding it to a meld or discarding it. If the stock runs out first, turn the discard pile over to make a new stock.', 'all'),
      T('How it ends', 'The player who went out scores the value of all cards left in the other hands: 10 for each king, queen and jack, 1 for an ace and face value for the rest. Deal again until someone reaches the agreed target and wins.', 'all'),
    ],
  }
})
