/** Solitaire (Klondike): seven columns, a stock, and four foundations built from ace to king. */
import { C, On, S, T, at, draw, mv, tabletop, zone } from '../compose'
import { pc, shown, stock } from '../playing'

const UP = ['7♣', 'Q♥', '6♦', 'A♠', '9♠', 'J♣', '4♥']
const W = 7.34
const col = (k: number) => (0.55 + k * 1.04) / W
const SUIT = ['♠', '♥', '♦', '♣']

export const solitaire = tabletop('solitaire', 'Solitaire', [1, 1], 1, '10–15 min', 'Easy', 'Klondike: sort the deck into four suits.', ['#1f6b43', '#27457a', '#ffffff'], () => ({
  setup: [
    S('Shuffle one deck', 'This is Klondike, the game most people mean by Solitaire. It is for one player and uses a standard 52-card deck with no jokers. Leave space along the top for the stock, the waste pile and four foundations.', 'c', [
      C(zone('stockz', 1.1, 1.5, 'Stock', 'The undealt cards go here, face down.'), zone('waste', 2.3, 1.5, 'Waste', 'Cards turned from the stock land here face up. Only the top one may be played.'),
        ...SUIT.map((s, i) => zone(`f${i}`, 1.1, 1.5, s, 'A foundation. Each one starts with an ace and is built up in the same suit to the king. Any suit may go in any space.'))),
    ], 'Known as Patience in Britain. Klondike is its proper name, which tells it apart from the many other solitaire games.'),
    S('Deal seven columns', 'Deal a row of seven piles from left to right: 1 card in the first, 2 in the second, and so on up to 7 in the last. That uses 28 cards.', 'tab', [
      C(zone('tab', W, 3.1, 'Tableau', 'The seven columns where most of the play happens. Face-up cards are built downward in alternating colors.')),
      ...[1, 2, 3, 4, 5, 6].map((k) => On('tab', col(k), 0.24, stock(`down${k}`, k, 'Face-down cards', `The ${k} hidden card${k > 1 ? 's' : ''} at the back of this column. One is turned over whenever nothing face up is left on top of it.`))),
    ], 'In a real game the cards of a column overlap so that you can see how many are face down.'),
    S('Turn up the front cards', 'The last card dealt to each column is face up. Everything behind it stays face down.', 'tab', [
      On('tab', col(0), 0.24, shown('up0', UP[0], 'Face-up card', 'The front card of a column. It can move onto another column or up to a foundation.')),
      ...[1, 2, 3, 4, 5, 6].map((k) => On(`down${k}`, 0.5, 0.8, shown(`up${k}`, UP[k], 'Face-up card', 'The front card of a column. It can move onto another column or up to a foundation.'))),
    ]),
    S('Set down the stock', 'Place the remaining 24 cards face down at the top left. This is the stock.', 'stock', [
      On('stockz', 0.5, 0.5, stock('stock', 24, 'Stock', 'The 24 cards left after the deal. You turn them over a few at a time to find cards you can play.')),
    ]),
    S('Ready to play', 'There are no turns: you simply make any move you like, one at a time. The aim is to build all four suits from ace up to king on the foundations.', 'all', [], 'This guide uses the usual draw-three rule, turning three stock cards at a time. Draw-one, turning a single card, is a common and easier alternative.'),
  ],
  turn: [
    T('Send an ace to a foundation', 'The ace of spades is free, so move it up to start a foundation. That leaves a face-down card at the front of its column: turn it over.', 'tab', [
      mv('up3', at('f0')), draw('down3', at('down3', 0.5, 0.8), pc('10♦'), 'new3', 1.2),
    ], 8),
    T('Build down in alternating colors', 'A card may go onto a card one rank higher of the other color. Move the red 6 onto the black 7, then turn over the card it uncovered.', 'tab', [
      mv('up2', at('up0', 0.5, 0.8, 0.02)), draw('down2', at('down2', 0.5, 0.8), pc('2♠'), 'new2', 1.2),
    ], 8),
    T('Turn three from the stock', 'When you want new cards, turn three from the stock onto the waste pile as a group. Only the top one, here the 8 of diamonds, can be played.', 'waste', [
      draw('stock', at('waste', 0.25, 0.5), pc('K♣'), 'w0'), draw('stock', at('waste', 0.5, 0.5, 0.02), pc('3♥'), 'w1'), draw('stock', at('waste', 0.75, 0.5, 0.04), pc('8♦'), 'w2'),
    ], 8),
    T('Play from the waste pile', 'The red 8 fits on the black 9. Playing it frees the card beneath it in the waste pile.', 'tab', [mv('w2', at('up4', 0.5, 0.8, 0.02))]),
    T('Runs, spaces and the stock', 'You may move a whole face-up run from one column to another as a unit. Only a king, or a run headed by a king, may fill an empty column. When the stock runs out, turn the waste pile over without shuffling and go through it again.', 'tab', [], 9),
    T('How it ends', 'You win when all 52 cards are on the foundations, each suit running from ace to king. If no move is left, the game is lost. Most people allow any number of passes through the stock; some allow only three, or just one when turning a single card at a time.', 'all', [], 8),
  ],
}))
