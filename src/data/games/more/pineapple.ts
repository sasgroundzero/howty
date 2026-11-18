/** Crazy Pineapple: Hold'em with three hole cards, one of which is thrown away after the flop betting. */
import { C, On, P, S, T, at, discs, draw, flip, hide, mv, spawn, tabletop, zone, type Act, type Item } from '../compose'
import { hand, pc, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const HOLE = 'Three private cards. You must throw one away after the betting on the flop, and you finish the hand with two.'
const chip = (id: string, label: string, title: string, body: string, h = 0.08) => discs(id, 1, 0.25, label === '2' ? '#2e6fb7' : '#e9e4d8', title, body, { label, h })
/** Where the k-th community card lands on the board zone. */
const spot = (k: number) => at('board', 0.5 + ((k - 2) * 1.04) / 5.4, 0.5)

export const pineapple = tabletop('pineapple', 'Crazy Pineapple', [2, 8], 6, '1–3 hr', 'Medium', 'Hold\'em with three hole cards: discard one.', ['#1f6b43', '#d9a514', '#e9e4d8'], (n) => {
  const dealer = n === 2 ? 0 : n - 1
  const folds: Act[] = Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 2).flatMap((s) => [0, 1, 2].map((k) => hide(`hole.${k}@${s}`, 0.3)))
  return {
    setup: [
      S('Cards and chips', 'Crazy Pineapple is played like Texas Hold\'em, except that you start with three hole cards and discard one after the flop. It uses one standard 52-card deck with no jokers. Give every player a stack of chips.', 'you', [
        P(zone('bet', 2.6, 1, 'Bets', 'Chips you bet in the current round sit here in front of you. When the round is over they are swept into the pot.')),
        P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. How many chips everyone starts with, and what they are worth, is whatever the group agrees.', { h: 0.4 })),
      ], 'It belongs to the Pineapple family. In plain Pineapple you discard one of your three cards before the first betting round. In Lazy Pineapple you keep all three until the betting is over and then discard one; in Tahoe you keep all three to the end but may use no more than two of them. This guide shows up to 8 players.'),
      S('Lay out the table', 'Leave room in the middle for the five shared cards, the pot, the burned cards and the discards.', 'c', [
        C(zone('burn', 1.1, 1.5, 'Burn', 'Before each set of shared cards is dealt, the top card of the deck is discarded here face down.'), zone('board', 5.4, 1.5, 'Community cards', 'Five cards are dealt here face up over the course of the hand: three on the flop, one on the turn and one on the river. Everyone shares them.'), zone('pot', 2, 1.5, 'Pot', 'All the chips bet in the hand. The winner of the hand takes it.')),
        C(zone('muck', 1.3, 1.5, 'Discards', 'The hole card each player throws away after the flop goes here face down, as do folded hands.')),
      ]),
      S('Place the dealer button', `The button marks the dealer for this hand and moves one seat clockwise after every hand. ${n === 2 ? 'Here you have the button.' : 'Here the player on your right has the button.'}`, 'button', [
        On(`bet@${dealer}`, 0.85, 0.5, discs('button', 1, 0.28, '#f5f1e6', 'Dealer button', 'Marks the dealer for this hand. It moves one seat clockwise after every hand, so the blinds move round too.', { label: 'D', h: 0.08, ink: '#1c1917' })),
      ], 'How the first dealer is picked is up to the group; drawing for high card is common.'),
      S('Post the blinds', n === 2
        ? 'With only two players the dealer posts the small blind and the other player posts the big blind. You put in 1 chip and your opponent puts in 2.'
        : 'The player to the left of the button posts the small blind and the next player posts the big blind. Here you put in 1 chip and the player on your left puts in 2.', 'bet', [
        On('bet@0', 0.25, 0.5, chip('sb', '1', 'Small blind', 'A forced bet, usually half the big blind, posted before any cards are dealt.')),
        On('bet@1', 0.25, 0.5, chip('bb', '2', 'Big blind', 'A forced bet equal to the minimum bet, posted before any cards are dealt.', 0.16)),
      ], 'The amounts are whatever your group agrees; 1 and 2 are used here as an example.'),
      S('Deal three hole cards each', 'Starting with the player to the left of the button, deal one card at a time clockwise until everyone has 3 cards face down.', 'hole', [
        P(seated(hand('hole', 'A♠ K♠ 7♦', 'Your hole cards', HOLE), hand('hole', 'Q♥ Q♣ 3♦', 'Your hole cards', HOLE))),
        C(stock('deck', 52 - 3 * n, 'Deck', `The ${52 - 3 * n} cards left after the deal. The burn cards and the five community cards come from the top.`)),
      ]),
      S('Ready to play', n === 2
        ? 'Betting works exactly as in Texas Hold\'em. Before the flop the dealer acts first; on every later round the other player acts first. On your turn you fold, call the current bet, or raise.'
        : 'Betting works exactly as in Texas Hold\'em. Before the flop the player to the left of the big blind acts first; on every later round the first player still in to the left of the button does. On your turn you fold, call the current bet, or raise.', 'all', [], 'Agree beforehand whether you are playing limit, pot-limit or no-limit.'),
    ],
    turn: [
      T('Betting before the flop', n === 2
        ? 'You act first, holding all three cards. The big blind counts as a bet of 2, so you add one chip to call. Your opponent could raise but checks.'
        : 'Each player in turn folds, calls 2 or raises, still holding all three cards. Here the others fold. You have already put in 1, so you add one chip to call, and the big blind checks.', 'bet', [
        ...folds, spawn(chip('call', '1', 'Your call', 'The extra chip that brings your small blind up to the size of the big blind.'), at('bet', 0.55, 0.5), 'chips.0', undefined, 0.9),
      ], 8),
      T('The flop', 'Sweep the bets into the pot. The dealer burns one card face down, then deals three cards face up. A second betting round follows, and you still have three hole cards for it.', 'board', [
        mv('sb', at('pot', 0.25, 0.3), 0.2), mv('call', at('pot', 0.25, 0.72), 0.3), mv('bb', at('pot', 0.72, 0.3), 0.4),
        draw('deck', at('burn'), undefined, undefined, 1), draw('deck', spot(0), pc('K♦'), 'f0', 1.5), draw('deck', spot(1), pc('8♣'), 'f1', 1.9), draw('deck', spot(2), pc('2♠'), 'f2', 2.3),
      ], 9),
      T('Discard one hole card', 'When the betting on the flop is over, every player still in throws away one hole card face down, before the turn card is dealt. You keep the A♠ and K♠ and discard the 7♦.', 'hole', [
        flip('hole.2', false), mv('hole.2', at('muck'), 0.5), mv('hole.2@1', at('muck', 0.5, 0.5, 0.02), 1.2),
      ], 8),
      T('The turn and the river', 'Burn a card and deal the fourth community card, then bet. Burn once more, deal the fifth and last community card, and have the final betting round.', 'board', [
        draw('deck', at('burn', 0.5, 0.5, 0.02)), draw('deck', spot(3), pc('9♥'), 't', 0.9), draw('deck', at('burn', 0.5, 0.5, 0.04), undefined, undefined, 2), draw('deck', spot(4), pc('4♦'), 'r', 2.6),
      ], 9),
      T('Showdown', 'If two or more players are still in, they show their two cards. Each makes the best five-card hand from any mix of their two cards and the five on the table. Your pair of kings beats a pair of queens, so you take the pot.', 'all', [
        flip('hole.0@1'), flip('hole.1@1'),
      ], 9),
      T('How it ends', 'If everyone else folds, the last player in wins the pot without showing. The button then moves one seat to the left for the next hand. Play for as long as you agreed, or until one player holds all the chips.', 'all'),
    ],
  }
})
