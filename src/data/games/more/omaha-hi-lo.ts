/** Omaha Hi-Lo (eight or better): Omaha in which the best high hand and the best qualifying low hand split the pot. */
import { C, On, P, S, T, at, discs, draw, flip, hide, mv, spawn, tabletop, zone, type Act, type Item } from '../compose'
import { hand, pc, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const HOLE = 'Four private cards. Only you may look at them. For your high hand and for your low hand you must use exactly two of them, together with exactly three of the shared cards.'
const chip = (id: string, label: string, title: string, body: string, h = 0.08) => discs(id, 1, 0.25, label === '2' ? '#2e6fb7' : '#e9e4d8', title, body, { label, h })
/** Where the k-th community card lands on the board zone. */
const spot = (k: number) => at('board', 0.5 + ((k - 2) * 1.04) / 5.4, 0.5)

export const omahaHiLo = tabletop('omaha-hi-lo', 'Omaha Hi-Lo', [2, 8], 6, '1–3 hr', 'Hard', 'Omaha where high and low split the pot.', ['#1f6b43', '#b7791f', '#e9e4d8'], (n) => {
  const dealer = n === 2 ? 0 : n - 1
  const folds: Act[] = Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 2).flatMap((s) => [0, 1, 2, 3].map((k) => hide(`hole.${k}@${s}`, 0.3)))
  return {
    setup: [
      S('Cards and chips', 'Omaha Hi-Lo is Omaha in which the pot is shared between the highest hand and the lowest. It uses one standard 52-card deck with no jokers. Give every player the same starting stack of chips.', 'you', [
        P(zone('bet', 2.6, 1, 'Bets', 'Chips you bet in the current round sit here in front of you. When the round is over they are swept into the pot.')),
        P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. You can only bet what is in front of you at the start of a hand, and how many chips everyone starts with is up to the group.', { h: 0.4 })),
      ], 'Also called Omaha Eight or Better, Omaha/8 or Omaha high-low split. Real tables seat up to 10 players; this guide shows up to 8. Agree the chip values and the size of the two blinds before you start.'),
      S('Lay out the table', 'Leave room in the middle for the five shared cards, the pot and a pile of burned cards.', 'c', [
        C(zone('burn', 1.1, 1.5, 'Burn', 'Before each set of shared cards is dealt, the top card of the deck is discarded here face down.'), zone('board', 5.4, 1.5, 'Community cards', 'Five cards are dealt here face up over the course of the hand: three on the flop, one on the turn and one on the river. Everyone shares them.'), zone('pot', 2, 1.5, 'Pot', 'All the chips bet in the hand. At the showdown it is divided between the best high hand and the best low hand.')),
      ]),
      S('Place the dealer button', `Pick a first dealer, for example by dealing one card each and giving the button to the highest. ${n === 2 ? 'Here you have the button.' : 'Here the player on your right has the button.'}`, 'button', [
        On(`bet@${dealer}`, 0.85, 0.5, discs('button', 1, 0.28, '#f5f1e6', 'Dealer button', 'Marks the dealer for this hand. It moves one seat clockwise after every hand, so the blinds move round too.', { label: 'D', h: 0.08, ink: '#1c1917' })),
      ], 'How the first dealer is picked varies; drawing for high card is common.'),
      S('Post the blinds', n === 2
        ? 'With only two players the dealer posts the small blind and the other player posts the big blind. You put in 1 chip and your opponent puts in 2.'
        : 'The player to the left of the button posts the small blind and the next player posts the big blind. Here you put in 1 chip and the player on your left puts in 2.', 'bet', [
        On('bet@0', 0.25, 0.5, chip('sb', '1', 'Small blind', 'A forced bet, usually half the big blind, posted before any cards are dealt.')),
        On('bet@1', 0.25, 0.5, chip('bb', '2', 'Big blind', 'A forced bet equal to the minimum bet, posted before any cards are dealt.', 0.16)),
      ], 'The amounts are whatever your group agrees; 1 and 2 are used here as an example. There is no ante.'),
      S('Deal four hole cards each', 'Starting with the player to the left of the button, deal one card at a time clockwise until everyone has 4 cards face down.', 'hole', [
        P(seated(hand('hole', 'A♠ 3♠ K♥ Q♣', 'Your hole cards', HOLE), hand('hole', '6♥ 7♣ J♦ J♠', 'Your hole cards', HOLE))),
        C(stock('deck', 52 - 4 * n, 'Deck', `The ${52 - 4 * n} cards left after the deal. The burn cards and the five community cards come from the top.`)),
      ]),
      S('Ready to play', n === 2
        ? 'Before the flop the dealer acts first; on every later round the other player acts first. On your turn you fold, call the current bet, or raise.'
        : 'Before the flop the player to the left of the big blind acts first; on every later round the first player still in to the left of the button does. On your turn you fold, call the current bet, or raise.', 'all', [], 'This game is most often played fixed-limit: every bet and raise is the size of the big blind before and on the flop, and double that on the turn and river. It is also played pot-limit. Agree which before you start.'),
    ],
    turn: [
      T('Betting before the flop', n === 2
        ? 'You act first. The big blind counts as a bet of 2, so you add one chip to call. Your opponent could raise but checks.'
        : 'Each player in turn folds, calls 2 or raises. Here the others fold. You have already put in 1, so you add one chip to call, and the big blind checks.', 'bet', [
        ...folds, spawn(chip('call', '1', 'Your call', 'The extra chip that brings your small blind up to the size of the big blind.'), at('bet', 0.55, 0.5), 'chips.0', undefined, 0.9),
      ], 8),
      T('The flop', 'Sweep the bets into the pot. The dealer burns one card face down, then deals three cards face up. A new betting round follows, in which you may check if nobody has bet.', 'board', [
        mv('sb', at('pot', 0.25, 0.3), 0.2), mv('call', at('pot', 0.25, 0.72), 0.3), mv('bb', at('pot', 0.72, 0.3), 0.4),
        draw('deck', at('burn'), undefined, undefined, 1), draw('deck', spot(0), pc('2♠'), 'f0', 1.5), draw('deck', spot(1), pc('5♦'), 'f1', 1.9), draw('deck', spot(2), pc('8♣'), 'f2', 2.3),
      ], 9),
      T('The turn and the river', 'Burn a card and deal a fourth community card face up, then bet. Burn once more, deal the fifth and last card, and bet for the final time.', 'board', [
        draw('deck', at('burn', 0.5, 0.5, 0.02)), draw('deck', spot(3), pc('K♦'), 't', 0.9),
        draw('deck', at('burn', 0.5, 0.5, 0.04), undefined, undefined, 2.2), draw('deck', spot(4), pc('9♥'), 'r', 2.8),
      ], 9),
      T('High hand and low hand', 'Each player makes a high hand and, if they can, a low hand, each from exactly two hole cards and three shared cards; the two may use different cards. A low hand is five cards of different ranks, none higher than 8. Aces count low and straights and flushes are ignored, so 5-4-3-2-A is the best low.', 'you', [], 9),
      T('Showdown', 'Players still in show all four cards. Your opponent plays the 6 and 7 with the 5, 8 and 9 for a straight, the best high hand. You play the ace and 3 with the 2, 5 and 8 for the best low, and your opponent has no low that beats it. You take half the pot each.', 'all', [
        ...[0, 1, 2, 3].map((k) => flip(`hole.${k}@1`)),
        mv('sb', at('bet', 0.2, 0.5), 1.2), mv('call', at('bet', 0.4, 0.5), 1.3), mv('bb', at('bet@1', 0.25, 0.5), 1.4),
      ], 10),
      T('How it ends', 'If nobody has a qualifying low, the best high hand takes the whole pot, and players who tie for high or for low share that half. If everyone else folds, the last player in wins it all. The button then moves one seat left; play for as long as you agreed.', 'all'),
    ],
  }
})
