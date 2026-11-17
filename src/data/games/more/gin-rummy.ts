/** Gin Rummy: draw and discard to build sets and runs, then knock. */
import { C, P, S, T, at, draw, flip, mv, tabletop, type Item } from '../compose'
import { hand, pc, shown, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const BODY = 'Ten cards. Group them into sets of three or four of a rank and runs of three or more in one suit. Cards that fit nowhere are your deadwood.'

export const ginRummy = tabletop('gin-rummy', 'Gin Rummy', [2, 2], 2, '30 min', 'Easy', 'Meld sets and runs, then knock.', ['#27457a', '#c0392b', '#ffffff'], () => ({
  setup: [
    S('Take one deck', 'Gin Rummy is for two players and uses a standard 52-card deck with no jokers. Kings are high and aces are always low.', 'c', [], 'Often just called Gin. Picture cards count 10 points, aces 1, and other cards their number.'),
    S('Choose the dealer', 'Each player draws a card from the shuffled deck. The lower card deals the first hand.', 'c', [], 'Groups vary on who deals later hands: the winner of the last hand, the loser, or simply taking turns. In this walkthrough your opponent deals.'),
    S('Deal ten cards each', 'The dealer gives each player 10 cards, one at a time and face down.', 'you', [
      P(seated(
        hand('hand', '4♠ 5♠ 6♠ 9♥ 9♦ 9♣ J♦ Q♦ 2♣ K♥', 'Your hand', BODY, { cols: 5 }),
        hand('hand', 'A♥ 2♥ 8♣ 8♠ 10♦ J♣ 5♥ 3♣ Q♥ 7♣', 'Your hand', BODY, { cols: 5 }),
      )),
    ]),
    S('Stock and upcard', 'Put the rest of the deck face down in the middle as the stock. Turn its top card face up beside it to start the discard pile.', 'c', [
      C(stock('stock', 31, 'Stock', 'The 31 cards left after the deal and the upcard. You may draw the top one, unseen, at the start of your turn.'), shown('up', '3♦', 'Discard pile', 'The face-up pile. Only its top card may be taken. Every turn ends with a discard onto it.')),
    ]),
    S('Ready to play', 'The non-dealer goes first. On your turn you take one card, either the top of the stock or the top discard, and then discard one card face up.', 'all', [], 'The very first turn is special: the non-dealer may take the upcard or pass, then the dealer may take it or pass. If both pass, the non-dealer draws from the stock.'),
  ],
  turn: [
    T('The upcard is offered', 'The 3 of diamonds does not help you, so you pass. The dealer passes too, so you start by drawing from the stock.', 'c', [draw('stock', at('hand.9', 1.15, 0.5, 0.02), pc('7♥'), 'drawn')]),
    T('Discard one card', 'You now hold eleven cards and must throw one. You keep your run of spades and your three nines and discard the king, your most costly loose card.', 'up', [mv('hand.9', at('up', 0.5, 0.5, 0.02))]),
    T('Your opponent\'s turn', 'They may take your discard or draw from the stock. They draw from the stock, then discard a queen. You may not take a discard and throw the same card back in one turn.', 'up', [
      draw('stock', at('hand.9@1', 1.15, 0.5, 0.02)), flip('hand.8@1'), mv('hand.8@1', at('up', 0.5, 0.5, 0.04), 1.4),
    ]),
    T('Knock when you are ready', 'After drawing, if your deadwood adds up to 10 points or less you may knock: discard face down and lay out your hand in melds. With no deadwood at all you have gone gin, which earns a bonus (20 or 25 points, by agreement).', 'you', [], 8),
    T('Lay off and score', 'The other player lays out their melds and may add loose cards to the knocker\'s melds, unless it was gin. The knocker scores the difference in deadwood. If the knocker is not lower, the opponent scores the difference plus an undercut bonus, usually 10.', 'all', [], 9),
    T('How it ends', 'If only two cards are left in the stock and nobody has knocked, the hand is void and dealt again. Play hands until someone reaches 100 points, then add the bonuses to settle the game.', 'all', [], 8),
  ],
}))
