/** 2-7 Triple Draw: five-card lowball with three chances to swap cards, ranked deuce-to-seven. */
import { C, On, P, S, T, at, discs, draw, flip, hide, mv, set, spawn, tabletop, zone, type Act, type Item } from '../compose'
import { hand, pc, slot, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const HAND = 'Five private cards. Only you may look at them. You get three chances to swap cards, and the lowest hand at the showdown wins.'
const chip = (id: string, label: string, title: string, body: string, h = 0.08) => discs(id, 1, 0.25, label === '2' ? '#2e6fb7' : '#e9e4d8', title, body, { label, h })
/** Throw one of your cards on the discard pile face down. */
const toss = (id: string, k: number, t = 0.3): Act[] => [flip(id, false), mv(id, at('muck', 0.5, 0.5, k * 0.02), t)]

export const tripleDraw = tabletop('triple-draw', '2-7 Triple Draw', [2, 6], 5, '1–3 hr', 'Hard', 'Three draws to make the lowest hand.', ['#1f6b43', '#5b4a8a', '#e9e4d8'], (n) => {
  const dealer = n === 2 ? 0 : n - 1
  const folds: Act[] = Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 2).flatMap((s) => [0, 1, 2, 3, 4].map((k) => hide(`hand.${k}@${s}`, 0.3)))
  return {
    setup: [
      S('Cards and chips', 'This is Deuce-to-Seven Triple Draw, a draw poker game in which the lowest hand wins. It uses one standard 52-card deck with no jokers. Give every player the same starting stack of chips.', 'you', [
        P(zone('bet', 2.6, 1, 'Bets', 'Chips you bet in the current round sit here in front of you. When the round is over they are swept into the pot.')),
        P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. How many chips everyone starts with, and what they are worth, is up to the group.', { h: 0.4 })),
      ], 'Also written 2-7 Triple Draw or Deuce-to-Seven Lowball; the hand ranking is also known as Kansas City lowball. With three draws the deck is used up quickly, so 6 players is the usual limit. Agree the chip values and the size of the two blinds before you start.'),
      S('Lay out the table', 'Leave room in the middle for the pot and for a pile of discards.', 'c', [
        C(zone('muck', 1.6, 1.5, 'Discards', 'Cards thrown away in the draws, and the hands of players who fold, go here face down. If the deck runs out, this pile is shuffled to make a new one.'), zone('pot', 2, 1.5, 'Pot', 'All the chips bet in the hand. The winner of the hand takes it.')),
      ]),
      S('Place the dealer button', `Pick a first dealer, for example by dealing one card each and giving the button to the highest. ${n === 2 ? 'Here you have the button.' : 'Here the player on your right has the button.'}`, 'button', [
        On(`bet@${dealer}`, 0.85, 0.5, discs('button', 1, 0.28, '#f5f1e6', 'Dealer button', 'Marks the dealer for this hand. It moves one seat clockwise after every hand, so the blinds move round too.', { label: 'D', h: 0.08, ink: '#1c1917' })),
      ], 'How the first dealer is picked varies.'),
      S('Post the blinds', n === 2
        ? 'With only two players the dealer posts the small blind and the other player posts the big blind. You put in 1 chip and your opponent puts in 2.'
        : 'The player to the left of the button posts the small blind and the next player posts the big blind. Here you put in 1 chip and the player on your left puts in 2.', 'bet', [
        On('bet@0', 0.25, 0.5, chip('sb', '1', 'Small blind', 'A forced bet, usually half the big blind, posted before any cards are dealt.')),
        On('bet@1', 0.25, 0.5, chip('bb', '2', 'Big blind', 'A forced bet equal to the small bet, posted before any cards are dealt.', 0.16)),
      ], 'The amounts are whatever your group agrees; 1 and 2 are used here as an example. With two players this guide uses the usual heads-up convention, in which the dealer posts the small blind.'),
      S('Deal five cards each', 'Starting with the player to the left of the button, deal one card at a time clockwise, face down, until everyone has 5 cards.', 'hand', [
        P(seated(hand('hand', '2♠ 3♦ 7♣ K♥ Q♠', 'Your hand', HAND), hand('hand', '3♥ 4♣ 6♦ K♣ J♥', 'Your hand', HAND))),
        C(stock('deck', 52 - 5 * n, 'Deck', `The ${52 - 5 * n} cards left after the deal. Replacement cards in the three draws come from the top.`)),
      ]),
      S('Know what a low hand is', 'The lowest hand wins, ranked deuce-to-seven: aces are always high, and straights and flushes count against you. The best possible hand is 7-5-4-3-2 in mixed suits.', 'hand', [], 'Compare hands from the highest card down, so 8-6-4-3-2 beats 8-7-4-3-2. Any hand with no pair beats any pair. A-5-4-3-2 is not a straight here, just a poor ace-high hand.'),
      S('Ready to play', n === 2
        ? 'There are four betting rounds with a draw between each. The dealer acts first in the first round; after each draw the other player does.'
        : 'There are four betting rounds with a draw between each. The player to the left of the big blind acts first in the first round; after each draw the first player still in to the left of the button does.', 'all', [], 'The game is usually played fixed-limit: every bet and raise is the size of the big blind in the first two rounds and double that in the last two.'),
    ],
    turn: [
      T('First betting round', n === 2
        ? 'You act first. The big blind counts as a bet of 2, so you add one chip to call. Your opponent could raise but checks.'
        : 'Each player in turn folds, calls 2 or raises. Here the others fold. You have already put in 1, so you add one chip to call, and the big blind checks.', 'bet', [
        ...folds, spawn(chip('call', '1', 'Your call', 'The extra chip that brings your small blind up to the size of the big blind.'), at('bet', 0.55, 0.5), 'chips.0', undefined, 0.9),
      ], 8),
      T('The first draw', 'Sweep the bets into the pot. Starting on the dealer\'s left, each player still in discards any number of cards face down and is dealt as many new ones. You throw away the king and queen; your opponent also swaps two. Then bet again.', 'you', [
        mv('sb', at('pot', 0.25, 0.3), 0.2), mv('call', at('pot', 0.25, 0.72), 0.3), mv('bb', at('pot', 0.72, 0.3), 0.4),
        ...toss('hand.3', 0, 1), ...toss('hand.4', 1, 1.2), draw('deck', at('hand', ...slot(3, 5)), pc('5♥'), 'a3', 1.9), draw('deck', at('hand', ...slot(4, 5)), pc('J♦'), 'a4', 2.2),
        mv('hand.3@1', at('muck', 0.5, 0.5, 0.04), 3), mv('hand.4@1', at('muck', 0.5, 0.5, 0.06), 3.2),
        draw('deck', at('hand@1', ...slot(3, 5)), undefined, 'their3', 3.8), draw('deck', at('hand@1', ...slot(4, 5)), undefined, 'their4', 4.1),
      ], 11),
      T('The second draw', 'After the second betting round comes another draw. You swap the jack and get a 9. Your opponent keeps all five cards, which is called standing pat. A third betting round follows, with bets now doubled.', 'you', [
        ...toss('a4', 4), draw('deck', at('hand', ...slot(4, 5)), pc('9♣'), 'b4', 1.2),
      ], 9),
      T('The third draw', 'One last draw: you swap the 9 and get an 8, for 8-7-5-3-2. The fourth and final betting round follows.', 'you', [
        ...toss('b4', 5), draw('deck', at('hand', ...slot(4, 5)), pc('8♦'), 'c4', 1.2),
      ], 9),
      T('Showdown', 'If two or more players are still in, they show their hands and the lowest wins. Your 8-7-5-3-2 is lower than 9-8-6-4-3, so you take the pot.', 'all', [
        ...[0, 1, 2].map((k) => flip(`hand.${k}@1`)), set('their3', { face: pc('8♥'), faceUp: true }), set('their4', { face: pc('9♠'), faceUp: true }),
        mv('sb', at('bet', 0.2, 0.5), 1.4), mv('call', at('bet', 0.4, 0.5), 1.5), mv('bb', at('bet', 0.6, 0.5), 1.6),
      ], 9),
      T('How it ends', 'If everyone else folds, the last player in wins the pot without showing. The button then moves one seat to the left for the next hand. Play for as long as you agreed, or until one player holds all the chips.', 'all'),
    ],
  }
})
