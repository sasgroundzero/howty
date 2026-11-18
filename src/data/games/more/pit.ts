/** Pit: nine cards each, everyone trading at once, and a bell for the first corner. */
import { C, L, P, S, T, at, box, cards, flip, ft, mv, set, tabletop, zone } from '../compose'

const com = (bg: string, name: string) => ft(bg, name, 'commodity', '◆')
const [WHEAT, CORN, OATS, BARLEY] = [com('#f3e2a8', 'Wheat'), com('#f6d37a', 'Corn'), com('#e6dcc6', 'Oats'), com('#d9c79a', 'Barley')]
const HAND = [WHEAT, WHEAT, CORN, CORN, CORN, OATS, OATS, BARLEY, BARLEY]
/** UV of card k inside the 5-wide, 2-deep hand block. */
const slot = (k: number): [number, number] => [(0.45 + (k % 5) * 1.04) / 5.06, (0.63 + Math.floor(k / 5) * 1.4) / 2.66]

export const pit = tabletop('pit', 'Pit', [3, 8], 5, '30 min', 'Easy', 'Shout, swap and corner the market.', ['#c0392b', '#e0b12f', '#2b241c'], (n) => ({
  setup: [
    S('One commodity per player', `Each commodity is a suit of 9 cards. With ${n} players use ${n} complete suits and put the others back in the box.`, 'l', [
      L(box('lid', 2.6, 0.5, 1.8, '#8a2f2a', 'Game box', 'Unused suits stay here. Modern editions have 8 commodities and seat up to 8; older ones have 7. The Bull and Bear cards are an optional extra and are left out of this basic game.', { top: ft('#f3e7c5', 'PIT', 'spare suits', '◆') })),
    ]),
    S('Shuffle and deal everything', 'Shuffle the chosen suits together and deal out all the cards face down. Everyone gets 9.', 'you', [
      P(cards('hand', 9, HAND, 'Your hand', '9 commodity cards. Your aim is to hold all 9 cards of a single commodity. Keep them hidden from the other players.', { cols: 5 })),
    ]),
    S('Sort your hand', 'Give everyone a minute to pick up their cards, sort them by commodity, and decide which one to collect.', 'hand', [], 'Every card shows the points its commodity is worth. Higher values are a bigger prize for the same work.'),
    S('Bell in the middle', 'If your edition has a bell, put it in the middle of the table within reach of everyone. Leave space around it for trades.', 'c', [
      C(
        box('bell', 1.1, 0.6, 1.1, '#c9a227', 'Bell', 'The dealer rings it to open trading and the first player to corner a commodity rings it to end the round. Editions without a bell just have you shout.', { round: true }),
        zone('floor', 5.2, 1.7, 'Trading floor', 'Trades are held out here face down. Both players swap the same number of cards without seeing them first.'),
      ),
    ]),
    S('Ready to play', 'There are no turns. When the dealer opens the market, everybody trades at the same time.', 'all', [], 'To trade, hold out 1 to 4 cards of one commodity face down and call out how many. Swap with anyone offering the same number.'),
  ],
  turn: [
    T('The market opens', 'The dealer rings the bell and trading starts. You decide to collect Corn and hold out your 2 Wheat cards face down, calling "Two! Two! Two!".', 'c', [
      flip('hand.0', false), flip('hand.1', false),
      mv('hand.0', at('floor', 0.1, 0.5)), mv('hand.1', at('floor', 0.3, 0.5)),
    ]),
    T('Someone matches your call', 'The player on your left is also offering two cards. All cards in one offer must be the same commodity, but you do not say which.', 'c', [
      set('hand.5@1', { faceUp: false }), set('hand.6@1', { faceUp: false }),
      mv('hand.5@1', at('floor', 0.7, 0.5)), mv('hand.6@1', at('floor', 0.9, 0.5)),
    ]),
    T('Swap', 'You exchange the cards and each look at what you got. You received 2 Oats, so the hunt goes on with new offers.', 'you', [
      mv('hand.5@1', at('hand', ...slot(0))), mv('hand.6@1', at('hand', ...slot(1))),
      flip('hand.5@1'), flip('hand.6@1'),
      mv('hand.0', at('hand@1', ...slot(5))), mv('hand.1', at('hand@1', ...slot(6))),
    ]),
    T('Corner!', 'The first player holding all 9 cards of one commodity rings the bell and calls out the corner, for example "Corner on Corn!". Trading stops at once.', 'bell'),
    T('Score and play again', 'That player scores the value printed on the commodity, then shuffles and deals the next round. The first to reach 500 points wins, or 250 for a shorter game.', 'all'),
  ],
}))
