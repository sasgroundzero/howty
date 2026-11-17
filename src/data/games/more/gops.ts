/** GOPS (Goofspiel): both players secretly bid cards from their own suit for each diamond in turn. */
import { C, L, P, S, T, at, draw, flip, hide, mv, set, tabletop, zone } from '../compose'
import { hand, pc, stock } from '../playing'

const show = (id: string, card: string) => set(id, { faceUp: true, face: pc(card) })

export const gops = tabletop('gops', 'GOPS', [2, 2], 2, '10–15 min', 'Easy', 'Outbid your rival for thirteen diamonds.', ['#c0392b', '#1c1917', '#ffffff'], () => ({
  setup: [
    S('Split one pack into suits', 'GOPS uses one standard 52-card deck with no jokers. Sort it into its four suits and put the hearts away: they are not used with two players.', 'l', [
      L(stock('spare', 13, 'Hearts', 'The 13 hearts. They are set aside and take no part in a two-player game.')),
    ], 'GOPS stands for "Game of Pure Strategy". It is also called Goofspiel. Three or more can play if each takes a suit, but this guide covers the classic two-player game.'),
    S('Make the prize pile', 'Shuffle the 13 diamonds and stack them face down in the middle. These are the prizes you will bid for, one at a time.', 'c', [
      C(stock('prize', 13, 'Prize pile', 'The 13 diamonds, shuffled. The top one is turned up at the start of every round.'), zone('offer', 1.2, 1.5, 'Prize', 'The diamond currently being bid for sits here.')),
    ]),
    S('Take a suit each', 'One player takes all 13 spades and the other takes all 13 clubs. You have the spades. This is your hand for the whole game.', 'you', [
      P(zone('bid', 1.2, 1.5, 'Bid', 'Each round you put one card from your hand here, face down.'), zone('won', 1.2, 1.5, 'Won', 'Diamonds you win are kept here, face up.')),
      P(hand('hand', 'A♠ 2♠ 3♠ 4♠ 5♠ 6♠ 7♠ 8♠ 9♠ 10♠ J♠ Q♠ K♠', 'Bidding hand', 'One complete suit of 13 cards. Each card can be used for one bid only.', { cols: 7 })),
    ]),
    S('Learn the card values', 'An ace counts 1, number cards count their number, a jack 11, a queen 12 and a king 13. This is true both for the cards you bid and for the diamonds you win.', 'c'),
    S('Ready to play', 'There are no separate turns: both players act at the same time. Each of the 13 rounds starts by turning up the next diamond.', 'all'),
  ],
  turn: [
    T('Turn up a prize', 'Turn the top card of the prize pile face up. This round you are both bidding for the 8♦, worth 8 points.', 'c', [
      draw('prize', at('offer', 0.5, 0.5), pc('8♦'), 'p1'),
    ]),
    T('Bid in secret', 'Each of you chooses one card from your hand and puts it face down in front of you. You decide the 8 is worth your queen.', 'all', [
      flip('hand.11', false), mv('hand.11', at('bid', 0.5, 0.5)), mv('hand.8@1', at('bid@1', 0.5, 0.5)),
    ]),
    T('Reveal both bids', 'When both cards are down, turn them over together. Your queen counts 12 and your opponent bid the 9♣.', 'all', [
      flip('hand.11'), show('hand.8@1', '9♣'),
    ]),
    T('The higher bid wins the prize', 'You bid higher, so you take the 8♦ and keep it face up beside you. Both bid cards are thrown away and cannot be used again.', 'you', [
      mv('p1', at('won', 0.5, 0.5)), hide('hand.11', 1.2), hide('hand.8@1', 1.2),
    ]),
    T('When the bids tie', 'If you both bid the same rank, the bid cards are still thrown away but the diamond stays put. Turn up the next diamond as well, and the next winning bid takes them all.', 'c', [], 6),
    T('How it ends', 'After 13 rounds both hands are empty. Add up the diamonds you won: the higher total wins. There are 91 points in all, so 46 is always enough.', 'all', [], 6),
  ],
}))
