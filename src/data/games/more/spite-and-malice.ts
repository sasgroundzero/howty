/** Spite & Malice: race to empty your pay-off pile onto shared stacks built from ace to queen. */
import { C, P, S, T, at, deck, draw, flip, mv, set, tabletop, zone, type Item } from '../compose'
import { hand, pc, slot, stock } from '../playing'

const seatOf = (seat?: string) => (seat ? Number(seat.slice(1)) : 0)
const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const TOP = ['10♠', '6♦', '4♣', '9♥']
const HAND = 'Five cards. You refill your hand to five at the start of each of your turns.'
const payoff: Item = (() => {
  const base = deck('pay', 20, pc('A♠'), 'Pay-off pile', '20 cards, face down except for the top one. You win by playing every card of this pile to the centre, and only its top card may ever be played.')
  return { ...base, make: (_c, _k, seat) => ({ kind: 'stack', props: { w: 0.9, d: 1.26, count: 20, face: pc(TOP[seatOf(seat) % 4]), per: 0.012 } }) }
})()

export const spiteAndMalice = tabletop('spite-and-malice', 'Spite & Malice', [2, 4], 2, '30–45 min', 'Easy', 'Empty your pay-off pile before your rival.', ['#9b2c2c', '#27457a', '#ffffff'], (n) => {
  const packs = n === 2 ? 2 : 3
  const left = packs * 52 - 25 * n
  return {
    setup: [
      S('Shuffle the packs together', n === 2
        ? 'Spite & Malice is at heart a two-player game. Shuffle two standard 52-card decks together, without jokers, to make 104 cards.'
        : `Spite & Malice is at heart a two-player game, so with ${n} players you need more cards. This guide shuffles three standard 52-card decks together, without jokers, to make 156 cards.`, 'c', [
        C(zone('c0', 1.1, 1.5, 'Centre', 'A centre stack. It must start with an ace and is built upward, ignoring suits, as far as the queen.'), zone('c1', 1.1, 1.5, 'Centre', 'A centre stack. It must start with an ace and is built upward, ignoring suits, as far as the queen.'), zone('c2', 1.1, 1.5, 'Centre', 'A centre stack. It must start with an ace and is built upward, ignoring suits, as far as the queen.')),
      ], `Also called Cat and Mouse; the shop game Skip-Bo is a close relative. Cards rank from ace (low) up to queen, and kings are wild.${n === 2 ? '' : ' Groups differ on how to play with more than two: some add a deck per player and some deal shorter pay-off piles, so agree before you start.'}`),
      S('Deal the pay-off piles', 'Deal 20 cards face down to each player as a pay-off pile. Each player turns the top card of their pile face up.', 'pay', [
        P(zone('s0', 1.05, 1.4, 'Side', 'One of your four side stacks, used for discards.'), zone('s1', 1.05, 1.4, 'Side', 'One of your four side stacks, used for discards.'), zone('s2', 1.05, 1.4, 'Side', 'One of your four side stacks, used for discards.'), zone('s3', 1.05, 1.4, 'Side', 'One of your four side stacks, used for discards.')),
        P(payoff),
      ], 'Twenty is the size given by the standard reference rules. Many families deal 26, or fewer for a quicker game.'),
      S('Deal five cards each', 'Deal a hand of 5 more cards to each player.', 'hand', [
        P(seated(hand('hand', 'A♣ 2♦ 3♠ K♥ 8♣', 'Your hand', HAND), hand('hand', '4♥ 5♣ 9♠ Q♦ 7♥', 'Your hand', HAND))),
      ]),
      S('Place the stock', `Put the remaining ${left} cards face down in the middle as the stock, next to the space for the centre stacks.`, 'stock', [
        C(stock('stock', left, 'Stock', `The ${left} cards left after the deal. Players draw from it to refill their hands, and finished centre stacks are shuffled back into it.`)),
      ]),
      S('Side stacks and centre stacks', 'Each player has room for four side stacks of their own in front of them. The centre stacks are shared and there may be up to three at a time.', 'you', [], 'Some groups allow four centre stacks, or any number.'),
      S('Ready to play', `The player whose pay-off pile shows the higher card goes first${n === 2 ? '' : ', and play then passes clockwise'}. If the top cards tie, shuffle those piles and turn new ones. Your 10 is highest, so you start.`, 'all', [], 'On your turn you draw up to five cards, play as many cards to the centre as you like, and finish by discarding one card to a side stack.'),
    ],
    turn: [
      T('Play to the centre', 'You already hold five cards, so there is nothing to draw. You start a centre stack with your ace, then add the 2 and the 3. Each card must be one higher than the last; suits do not matter.', 'c', [
        mv('hand.0', at('c0')), mv('hand.1', at('c0', 0.5, 0.5, 0.02)), mv('hand.2', at('c0', 0.5, 0.5, 0.04)),
      ], 8),
      T('Discard to end your turn', 'When you can do no more, or choose to stop, discard one card from your hand onto one of your side stacks. That ends your turn. You place the 8 and keep your wild king.', 's0', [mv('hand.4', at('s0'))]),
      T('The next player\'s turn', 'They add a 4 and a 5 from their hand, then the 6 from the top of their pay-off pile, and turn up the next pay-off card. They finish by discarding to a side stack.', 'c', [
        flip('hand.0@1'), mv('hand.0@1', at('c0', 0.5, 0.5, 0.06)), flip('hand.1@1'), mv('hand.1@1', at('c0', 0.5, 0.5, 0.08)),
        draw('pay@1', at('c0', 0.5, 0.5, 0.1), pc('6♦'), 'paid', 1.5), set('pay@1', { face: pc('J♠') }),
        flip('hand.2@1'), mv('hand.2@1', at('s0@1'), 2.2),
      ], 10),
      T('Draw back up to five', 'At the start of your next turn you draw from the stock until you hold five cards again. You draw four, and the 7 you pick up goes straight onto the centre stack.', 'you', [
        draw('stock', at('hand', ...slot(0, 5)), pc('7♣'), 'd0'), draw('stock', at('hand', ...slot(1, 5)), pc('J♦'), 'd1'), draw('stock', at('hand', ...slot(2, 5)), pc('2♠'), 'd2'), draw('stock', at('hand', ...slot(4, 5)), pc('5♥'), 'd3'),
        mv('d0', at('c0', 0.5, 0.5, 0.12), 2.6),
      ], 9),
      T('Kings, queens and side stacks', 'A king is wild and stands for whatever card the stack needs next. When a stack reaches the queen it is shuffled into the stock, leaving a space. You may also play the top card of any of your side stacks to the centre, but never move cards between side stacks.', 'c', [], 9),
      T('How it ends', 'If you play all five hand cards without discarding, draw five more and carry on. The first player to play the last card of their pay-off pile wins. If the stock runs out first, the game is a draw.', 'all', [], 8),
    ],
  }
})
