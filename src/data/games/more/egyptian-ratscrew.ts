/** Egyptian Ratscrew: turn cards onto a shared pile, pay for face cards, and slap the pairs. */
import { C, P, S, T, at, draw, flip, mv, tabletop, zone } from '../compose'
import { pc, stock } from '../playing'

export const egyptianRatscrew = tabletop('egyptian-ratscrew', 'Egyptian Ratscrew', [2, 8], 4, '10–30 min', 'Easy', 'Flip cards fast and slap the pile first.', ['#b45309', '#1c1917', '#ffffff'], (n) => {
  const q = Math.floor(52 / n)
  const extra = 52 % n
  return {
    setup: [
      S('Take one pack', 'Egyptian Ratscrew uses one standard 52-card deck. Leave room in the middle for a single shared pile that everyone can reach.', 'c', [
        C(zone('pile', 2.8, 1.8, 'Pile', 'Cards are turned face up onto one pile here. Whoever wins it adds it to the bottom of their own cards.')),
      ], 'The game is also called Egyptian Rat Screw, Egyptian War or Slap. Some groups add the jokers. More than 8 can play, but this guide stops at 8.'),
      S('Deal out every card', `Shuffle and deal the whole pack face down, one card at a time. Everyone gets ${q} cards${extra ? `, and ${extra === 1 ? 'one player gets' : `${extra} players get`} one more` : ''}.`, 'you', [
        P(stock('deck', q, 'Your pile', `Your ${q} cards in a neat face-down pile. You play from the top and add winnings to the bottom.`)),
      ]),
      S('Do not look at your cards', 'Square your cards into a face-down pile in front of you. Nobody may look at their own cards at any point in the game.', 'deck'),
      S('Learn what the face cards demand', 'When a jack, queen, king or ace is turned, the next player must try to turn another one: they get 1 try after a jack, 2 after a queen, 3 after a king and 4 after an ace.', 'c'),
      S('Agree which slaps count', 'Everyone plays that a double (two cards of the same rank in a row) can be slapped. Decide now whether to add other slaps.', 'pile', [], 'Common extras are the sandwich (two matching cards with one card between them) and a king next to a queen. Groups vary a great deal here.'),
      S('Ready to play', 'The player on the dealer\'s left goes first and play runs clockwise. A turn is simply flipping the top card of your pile onto the middle.', 'all', [], 'Here you are on the dealer\'s left, so you start.'),
    ],
    turn: [
      T('Turn your top card', 'Flip the top card of your pile straight onto the middle, turning it away from you so that you do not see it first. It is a 5, so nothing happens and play passes on.', 'pile', [
        draw('deck', at('pile', 0.26, 0.5), pc('5♦'), 'c1'),
      ]),
      T('A face card is a challenge', 'The player on your left turns a queen. The player after them now has two tries to turn a jack, queen, king or ace.', 'pile', [
        draw('deck@1', at('pile', 0.42, 0.5, 0.02), pc('Q♣'), 'c2'),
      ]),
      T('Pay the cards one at a time', 'The challenged player turns an 8 and then a 3. Neither is a face card or an ace, so the challenge has failed. Had one appeared, they would stop at once and the next player would be challenged instead.', 'pile', [
        draw('deck@2', at('pile', 0.58, 0.5, 0.04), pc('8♥'), 'c3'), draw('deck@2', at('pile', 0.74, 0.5, 0.06), pc('3♠'), 'c4', 1.6),
      ]),
      T('The pile is won', 'The player who turned the queen takes the whole pile, puts it face down under their own cards and starts the next pile.', 'pile', [
        flip('c1', false), mv('c1', at('deck@1', 0.5, 0.5, 0.02)), flip('c2', false), mv('c2', at('deck@1', 0.5, 0.5, 0.04)),
        flip('c3', false), mv('c3', at('deck@1', 0.5, 0.5, 0.06)), flip('c4', false), mv('c4', at('deck@1', 0.5, 0.5, 0.08)),
      ]),
      T('Slap a double', 'A 7 is turned and then another 7. Two of the same rank in a row is a double: the first player to slap the pile wins all of it, even in the middle of a challenge. Slap at the wrong time and you must put a card from your pile under the middle pile (two cards in some groups).', 'pile', [
        draw('deck@1', at('pile', 0.4, 0.5), pc('7♦'), 'd1'), draw('deck@2', at('pile', 0.6, 0.5, 0.02), pc('7♣'), 'd2', 1.6),
      ], 9),
      T('How it ends', 'A player with no cards left cannot take turns but may still slap a valid pile to get back in. The game ends when one player holds every card, and that player wins.', 'all'),
    ],
  }
})
