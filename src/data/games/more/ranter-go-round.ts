/** Ranter-Go-Round: one card each, one chance to swap, and the lowest card loses a life. */
import { C, P, S, T, by, discs, draw, hide, mv, set, tabletop } from '../compose'
import { BACK, hand, pc, stock } from '../playing'

const show = (id: string, s: string) => set(id, { face: pc(s), faceUp: true })
const OTHERS = ['J♥', '6♣', '10♠', 'Q♦', '8♣']
/** A player's card sits this far behind the middle of their row of lives. */
const HOME = 1.43

export const ranterGoRound = tabletop('ranter-go-round', 'Ranter-Go-Round', [3, 8], 5, '15–30 min', 'Easy', 'Pass on a bad card before it costs a life.', ['#27457a', '#e0b12f', '#c0392b'], (n) => {
  const dealer = n - 1
  return {
    setup: [
      S('Sort out the deck', 'Use one standard 52-card deck with no jokers. Kings are the highest cards and aces are the lowest. Suits do not matter.', 'c', [], 'This game is also called Chase the Ace, Cuckoo and Screw Your Neighbour. It works with any large group: this guide stops at 8 players, but more can join.'),
      S('Give everyone three lives', 'Each player takes 3 counters as lives. Coins, chips or matchsticks all work.', 'you', [
        P(discs('lives', 3, 0.3, '#e0b12f', 'Your lives', 'You start with 3. You lose one each time you hold the lowest card, and you are out when they are gone.')),
      ], 'Three lives is the usual number, but agree it before you start. Some groups also put a stake in a pot for the winner.'),
      S('Deal one card each', 'The dealer shuffles and deals a single card face down to every player. The rest of the pack stays face down in the middle.', 'all', [
        C(stock('pack', 52 - n, 'The pack', `The ${52 - n} cards left after the deal. Only the dealer may take a card from it.`)),
        P(hand('card', '4♦', 'Your card', 'Your only card this deal. Look at it but keep it secret. A low card is dangerous, so you will want to pass it on.')),
      ]),
      S('Look at your card', 'Everyone looks at their own card without showing it. You hold a 4, which is low enough to be worried about.', 'card'),
      S('Ready to play', 'The player to the left of the dealer goes first, and the dealer goes last. In this example you go first. On your turn you either keep your card or swap it with the player on your left.', 'all', [], 'Your neighbour cannot refuse the swap unless they hold a king.'),
    ],
    turn: [
      T('You swap with your neighbour', 'You do not want the 4, so you trade cards with the player on your left without showing them to anyone else. You get a 9 in return.', 'you', [
        set('card', { faceUp: false, back: BACK }), mv('card', by('lives@1', 0, HOME)),
        show('card@1', '9♣'), mv('card@1', by('lives', 0, HOME)),
      ]),
      T('A king blocks the swap', 'Your neighbour is now stuck with the 4 and tries to pass it on. The next player turns over a king, which stops the swap, so your neighbour keeps the 4.', 'card@2', [
        show('card@2', 'K♠'),
      ]),
      n === 3
        ? T('The dealer goes last', 'The dealer may cut the pack and swap for the card cut, unless that card is a king. Here the dealer already holds the king, so they keep it.', 'pack')
        : T('The dealer goes last', 'Each player in turn keeps or swaps. The dealer, who has nobody left to swap with, may cut the pack and swap for the card cut instead, but if it is a king they must keep their own card. Here the dealer cuts a 7 and takes it.', 'pack', [
          hide(`card@${dealer}`), draw('pack', by(`lives@${dealer}`, 0, HOME), pc('7♥'), 'cut'),
        ]),
      T('Everyone shows their card', 'Once the dealer has played, all cards are turned face up and compared.', 'all', [
        set('card', { faceUp: true }),
        ...OTHERS.slice(0, Math.max(0, n - 4)).map((c, k) => show(`card@${k + 3}`, c)),
      ]),
      T('The lowest card loses a life', 'Your old 4 is the lowest card on the table, so your neighbour gives up one life. If two or more players tie for lowest, they all lose one.', 'lives@1', [
        hide('lives.2@1'),
      ]),
      T('How it ends', 'The deal passes to the left and everyone gets a new card. A player with no lives left is out, and the last player still in wins.', 'all'),
    ],
  }
})
