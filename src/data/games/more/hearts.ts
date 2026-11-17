/** Hearts: no trumps, and every heart you win counts against you. */
import { C, P, S, T, at, flip, mv, tabletop, zone } from '../compose'
import { hand, slot } from '../playing'

/** Cards each player holds, and what is taken out so the deal comes out even. */
const DEAL: Record<number, [number, string]> = {
  3: [17, 'Remove the 2♦ so that 51 cards are left.'],
  4: [13, 'Use all 52 cards.'],
  5: [10, 'Remove the 2♦ and 2♣ so that 50 cards are left.'],
  6: [8, 'Remove the 2♦, 3♦, 2♣ and 3♣ so that 48 cards are left.'],
  7: [7, 'Remove the 2♦, 3♦ and 2♣ so that 49 cards are left.'],
}
const FULL = '2♣ 9♣ K♣ 4♦ J♦ 3♠ 7♠ Q♠ A♠ 5♥ 8♥ 10♥ K♥ 6♣ 9♦ 2♠ 6♥'

export const hearts = tabletop('hearts', 'Hearts', [3, 7], 4, '30–60 min', 'Easy', 'Dodge the hearts and the queen of spades.', ['#c0392b', '#1c1917', '#ffffff'], (n) => {
  const [size, removed] = DEAL[n]
  const mine = FULL.split(' ').slice(0, size).join(' ')
  const rows = Math.ceil(size / 7)
  return {
    setup: [
      S('Sort out the deck', `Hearts uses one standard 52-card deck with no jokers. ${removed}`, 'c', [
        C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The highest card of the suit that was led takes all of them.')),
      ], n === 4 ? undefined : 'With a different number of players the low cards taken out change, so everyone always holds the same number.'),
      S('Deal out every card', `Shuffle and deal the cards one at a time, face down, until they are gone. Everyone has ${size}.`, 'you', [
        P(hand('hand', mine, 'Your hand', `Your ${size} cards. Sort them by suit and keep them hidden from the other players.`, { cols: 7 })),
      ]),
      S('Pass three cards', 'Choose 3 cards you do not want and pass them face down to the player on your left. You must choose before you look at the cards passed to you.', 'hand', [], 'The direction changes each deal: left, then right, then across, then no pass at all. With other than four players, groups agree their own rotation.'),
      S('Keep score on paper', 'You need a pencil and paper. Each heart you take is 1 penalty point and the queen of spades is 13.', 'c', [], 'There are 26 penalty points in every deal.'),
      S('Ready to play', 'Whoever holds the 2 of clubs leads it to the first trick. If it was removed, the lowest club still in play leads instead.', 'all', [], 'You must follow the suit that was led if you can. There are no trumps.'),
    ],
    turn: [
      T('The 2 of clubs leads', 'You hold the 2♣, so you play it to the middle to start the first trick.', 'trick', [mv('hand.0', at('trick', 0.5, 0.78))]),
      T('Everyone follows suit', 'Going clockwise, each player plays one card and must play a club if they have one. A player with no clubs may play any card, but not a heart or the Q♠ on this first trick.', 'trick', [
        flip('hand.1@1'), mv('hand.1@1', at('trick', 0.2, 0.5)), flip('hand.2@2'), mv('hand.2@2', at('trick', 0.5, 0.22), 0.5),
      ]),
      T('Highest club takes the trick', 'The highest card of the suit led wins. The winner gathers the cards face down and leads the next trick.', 'trick', [
        mv('hand.0', at('hand@2', ...slot(2, 7, rows))), mv('hand.1@1', at('hand@2', ...slot(2, 7, rows), 0.02)),
      ]),
      T('Hearts must be broken', 'Nobody may lead a heart until a heart or the Q♠ has been discarded on an earlier trick, unless they hold nothing else.', 'you'),
      T('Score the deal', 'After the last trick, count 1 point per heart and 13 for the Q♠ in the tricks you took. Take all 26 and you "shoot the moon": you score 0 and everyone else scores 26.', 'all'),
      T('How it ends', 'Deal again until someone reaches 100 points. The player with the lowest score at that moment wins.', 'all'),
    ],
  }
})
