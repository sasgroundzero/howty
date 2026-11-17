/** Lost Cities: The Board Game: five expedition paths, a deck of numbered cards and five explorers each. */
import { C, On, P, R, S, T, at, board, cards, deck, discs, draw, f, mv, pawns, tabletop, zone } from '../compose'
import { laneUV } from '../layouts'

const lane = laneUV(5)
const COL = ['#e0b12f', '#2e6fb7', '#e9e4d8', '#3d8b4a', '#c0392b']
const card = (c: number, v: number) => f(COL[c], String(v), '#2b241c')
const HAND = [card(0, 3), card(0, 6), card(1, 2), card(1, 9), card(2, 5), card(3, 0), card(3, 7), card(4, 4)]
const TOKENS: [number, number][] = [[0, 3], [1, 5], [3, 2], [4, 4], [2, 6]]

export const lostCitiesBoard = tabletop('lost-cities-board', 'Lost Cities: The Board Game', [2, 4], 3, '30–60 min', 'Easy', 'Play rising cards to push explorers onward.', ['#c9b27a', '#3d8b4a', '#c0392b'], (n) => ({
  setup: [
    S('Lay out the board', 'Put the board in the middle of the table. Each of its five colored paths leads to a lost city.', 'c', [
      C(board('paths', 9.5, 8, 'g:lanes:5:#d9c89a:#6b7f52:Expedition paths', 'Game board', 'Five paths, one per color. The first steps of a path lose points and the later ones gain more and more. The number of steps here is schematic.')),
    ]),
    S('Place the event tokens', 'Shuffle the event tokens and put one on each marked space of the paths.', 'paths', TOKENS.map(([l, k], i) => On('paths', ...lane(l, k / 8), discs(`ev${i}`, 1, 0.2, '#b08d57', 'Event token', 'An explorer who lands here takes or uses the token: artifacts, bonus points or an extra step. The rulebook shows which spaces get one.', { label: '?', h: 0.08 }))), 'How many tokens there are and exactly where they go is printed on the board and in the rulebook.'),
    S('Take your explorers', 'Each player takes the 5 explorers of one color: 4 ordinary ones and 1 larger leader.', 'you', [
      P(zone('cols', 5.6, 1.5, 'Your card columns', 'Cards you play go here face up, in one column per color, so everyone can see the last number in each.')),
      P(pawns('explorer', 4, '$', 'Explorers', '4 ordinary explorers. Each one travels along a single path and never changes path.', { scale: 0.5 }), pawns('leader', 1, '$', 'Leader', '1 larger explorer. It moves like the others, but the points for the space it ends on count double.', { scale: 0.7 })),
    ], 'Explorers wait at the foot of the board until they set out.'),
    S('Shuffle and deal eight cards', 'Shuffle the expedition cards and deal 8 to each player. The rest form the draw deck.', 'you', [
      R(deck('deck', 110 - 8 * n, f('#5a4634', '≡'), 'Expedition deck', '110 cards: five colors numbered 0 to 10, with two copies of each. When this deck runs out the round ends at once.')),
      P(cards('hand', 8, HAND, 'Your hand', '8 cards, kept hidden from the other players. You always end your turn with 8 again.', { cols: 4 })),
    ], 'With 2 players the rules have you set some cards aside unseen first. Check the rulebook for the number.'),
    S('Leave room for discards', 'Keep a space beside the board for five face-up discard piles, one per color.', 'discards', [
      R(zone('discards', 5.6, 1.5, 'Discard piles', 'One face-up pile per color. Instead of drawing from the deck you may take the top card of any of these piles.')),
    ]),
    S('Ready to play', 'Choose a starting player, then play passes clockwise.', 'all', [], 'On your turn you play a card to move an explorer or discard a card, and then draw one card.'),
  ],
  turn: [
    T('Play a card', 'You play a yellow 3 into your yellow column. Because it is your first yellow card, one of your explorers steps onto the start of the yellow path.', 'paths', [
      mv('hand.0', at('cols', 0.1, 0.5)),
      mv('explorer.0', at('paths', ...lane(0, 0)), 1),
    ]),
    T('Draw back up', 'You end your turn by drawing one card, from the deck or from the top of any discard pile.', 'you', [
      draw('deck', at('hand.7', 1.15, 0.5, 0.02)),
    ]),
    T('Next player discards', 'The player on your left has nothing they want to play, so they discard a card face up to the pile of its color and draw a replacement.', 'discards', [
      mv('hand.2@1', at('discards', 0.3, 0.5)),
      draw('deck', at('hand.7@1', 1.15, 0.5, 0.02), undefined, undefined, 1.4),
    ]),
    T('Climb the path', 'On a later turn you add a yellow 6. A card must not be lower than the last one in its column, and it moves the same explorer one step further.', 'paths', [
      mv('hand.1', at('cols', 0.1, 0.72, 0.02)),
      mv('explorer.0', at('paths', ...lane(0, 1 / 8)), 1),
    ], 8),
    T('End of the round', 'The round ends when the deck runs out or when a set number of explorers have crossed the bridges near the end of their paths (five in most printings, but check your rulebook). Score each explorer by its space, add tokens and artifacts, and the most points wins.', 'all'),
  ],
}))
