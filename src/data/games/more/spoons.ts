/** Spoons: pass cards round as fast as you can, and grab a spoon when someone has four of a kind. */
import { C, P, R, S, T, at, by, discs, draw, mv, set, tabletop, zone } from '../compose'
import { BACK, hand, pc, stock } from '../playing'

export const spoons = tabletop('spoons', 'Spoons', [3, 8], 5, '15–20 min', 'Easy', 'Four of a kind? Grab a spoon, quick.', ['#9aa3ad', '#27457a', '#c0392b'], (n) => {
  const last = n - 1
  return {
    setup: [
      S('Sort out the deck', 'Spoons uses one standard 52-card deck with no jokers.', 'c', [], 'Pig and Donkey are the same game without the spoons: players touch their nose instead. One deck is enough for up to 13 players, but this guide stops at 8.'),
      S('Put the spoons in the middle', `Lay ${n - 1} spoons in the centre of the table, within reach of everyone. That is one fewer than the number of players.`, 'spoon', [
        C(discs('spoon', n - 1, 0.28, '#c9ccd1', 'Spoons', `${n - 1} spoons for ${n} players, always one fewer than the number playing. These discs stand in for them.`, { h: 0.06, gap: 0.3 })),
      ]),
      S('Deal four cards each', 'Shuffle and deal 4 cards face down to each player.', 'you', [
        P(hand('hand', '9♠ 9♦ 4♣ 9♣', 'Your hand', 'You hold 4 cards and are trying to make them all the same rank.')),
      ]),
      S('Set the stock beside the dealer', 'The rest of the pack goes face down next to the dealer as the stock. Leave a space on the other side of the dealer for a discard pile.', 'r', [
        R(stock('stock', 52 - 4 * n, 'Stock', `The ${52 - 4 * n} undealt cards. Only the dealer draws from here, one card at a time.`), zone('trash', 1.1, 1.4, 'Discards', 'The last player in the circle throws unwanted cards here. If the stock runs out, shuffle these to make a new one.')),
      ], 'In this example you are the dealer.'),
      S('Keep score on paper', 'You need a pencil and paper to note each player\'s letters. Every round you lose earns you the next letter of S-P-O-O-N.', 'c'),
      S('Ready to play', 'There are no turns. The dealer starts by drawing from the stock, and from then on everyone passes cards to the left as fast as they like.', 'all', [], 'Take one card at a time: pass one on before you pick up the next.'),
    ],
    turn: [
      T('The dealer draws', 'As dealer, you take the top card of the stock into your hand. It is a fourth 9.', 'you', [
        draw('stock', at('hand.3', 1.15, 0.5, 0.02), pc('9♥'), 'got'),
      ]),
      T('Pass a card to the left', 'Choose a card you do not want and slide it face down to the player on your left. They pick it up, then pass one of their own cards on in the same way.', 'you', [
        set('hand.2', { faceUp: false, back: BACK }), mv('hand.2', by('hand@1', 2.65, 0)),
      ]),
      T('Round the circle', 'Cards keep moving round the table. The last player, on the dealer\'s right, puts each unwanted card on the discard pile, and the dealer keeps drawing from the stock.', 'r', [
        mv(`hand.0@${last}`, at('trash', 0.5, 0.5)),
      ]),
      T('Four of a kind', 'You now hold four 9s. The moment you have four cards of the same rank, take a spoon. You can be sneaky about it or snatch it.', 'c', [
        mv('spoon.0', by('hand', 0, -1.05)),
      ]),
      T('Everyone grabs', 'As soon as one spoon is gone, everybody else may grab one too, whatever they hold. One player ends up with nothing and gets a letter.', 'c', [
        ...Array.from({ length: n - 2 }, (_, k) => mv(`spoon.${k + 1}`, by(`hand@${k + 1}`, 0, -1.05), 0.2 + k * 0.15)),
      ]),
      T('How it ends', 'A player who has collected all five letters of SPOON is out, and one spoon is removed. The last player left wins. Some groups skip the letters and knock out the loser of every round.', 'all'),
    ],
  }
})
