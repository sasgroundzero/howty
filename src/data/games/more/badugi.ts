/** Badugi: four-card triple-draw lowball in which only cards of different suits and ranks count. */
import { C, On, P, S, T, at, discs, draw, flip, hide, mv, spawn, tabletop, zone, type Act, type Item } from '../compose'
import { hand, hidden, pc, slot, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const HAND = 'Four private cards. You are trying to end up with four low cards of four different suits and four different ranks.'
const chip = (id: string, label: string, title: string, body: string, h = 0.08) => discs(id, 1, 0.25, label === '2' ? '#2e6fb7' : '#e9e4d8', title, body, { label, h })

export const badugi = tabletop('badugi', 'Badugi', [2, 8], 6, '1–3 hr', 'Medium', 'Draw three times for four low, unmatched cards.', ['#1f6b43', '#2e6fb7', '#e9e4d8'], (n) => {
  const dealer = n === 2 ? 0 : n - 1
  const folds: Act[] = Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 2).flatMap((s) => [0, 1, 2, 3].map((k) => hide(`hand.${k}@${s}`, 0.3)))
  return {
    setup: [
      S('Cards and chips', 'Badugi is a draw poker game for 2 to 8 players in which the lowest hand wins. It uses one standard 52-card deck with no jokers. Give every player a stack of chips.', 'you', [
        P(zone('bet', 2.6, 1, 'Bets', 'Chips you bet in the current round sit here in front of you. When the round is over they are swept into the pot.')),
        P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. How many chips everyone starts with, and what they are worth, is whatever the group agrees.', { h: 0.4 })),
      ], 'The name is also spelled Badougi, Paduki or Padooki. Agree the chip values, the two blinds and the betting limit before you start.'),
      S('Lay out the table', 'Leave room in the middle for the discards and the pot.', 'c', [
        C(zone('muck', 1.3, 1.5, 'Discards', 'Cards thrown away on a draw, and the hands of players who fold, go here face down.'), zone('pot', 2, 1.5, 'Pot', 'All the chips bet in the hand. The winner of the hand takes it.')),
      ]),
      S('Place the dealer button', `The button marks the dealer for this hand and moves one seat clockwise after every hand. ${n === 2 ? 'Here you have the button.' : 'Here the player on your right has the button.'}`, 'button', [
        On(`bet@${dealer}`, 0.85, 0.5, discs('button', 1, 0.28, '#f5f1e6', 'Dealer button', 'Marks the dealer for this hand. The blinds sit to its left, and the draws start to its left.', { label: 'D', h: 0.08, ink: '#1c1917' })),
      ], 'How the first dealer is picked is up to the group; drawing for high card is common.'),
      S('Post the blinds', n === 2
        ? 'With only two players the dealer posts the small blind and the other player posts the big blind. You put in 1 chip and your opponent puts in 2.'
        : 'The player to the left of the button posts the small blind and the next player posts the big blind. Here you put in 1 chip and the player on your left puts in 2.', 'bet', [
        On('bet@0', 0.25, 0.5, chip('sb', '1', 'Small blind', 'A forced bet, normally half the big blind, posted before any cards are dealt.')),
        On('bet@1', 0.25, 0.5, chip('bb', '2', 'Big blind', 'A forced bet, normally twice the small blind, posted before any cards are dealt.', 0.16)),
      ], 'The amounts are whatever your group agrees; 1 and 2 are used here as an example.'),
      S('Deal four cards each', 'Deal one card at a time clockwise until everyone has 4 cards face down. There are no shared cards.', 'hand', [
        P(seated(hand('hand', 'A♠ 4♦ 7♥ K♥', 'Your hand', HAND), hand('hand', '2♣ 5♦ 8♠ Q♠', 'Your hand', HAND))),
        C(stock('deck', 52 - 4 * n, 'Deck', `The ${52 - 4 * n} cards left after the deal. Replacement cards on the three draws come from the top.`)),
      ]),
      S('Know what a badugi is', 'Aces are low. Only cards that differ from each other in both suit and rank count, so four such cards make a "badugi" and the best possible hand is A-2-3-4 in four suits.', 'hand', [], 'If two of your cards share a suit or a rank, one of them does not count and you have a three-card hand. Any four-card hand beats any three-card hand. Between hands of the same size, compare the highest cards: the lower one wins, then the next highest, and so on.'),
      S('Ready to play', n === 2
        ? 'There are four betting rounds with a draw between each. Before the first draw the dealer acts first. On your turn you fold, call the current bet, or raise.'
        : 'There are four betting rounds with a draw between each. Before the first draw the player to the left of the big blind acts first. On your turn you fold, call the current bet, or raise.', 'all', [], 'Badugi is often played with fixed limits, the bet size doubling for the last two rounds, but pot-limit and other structures are used too. Agree this beforehand.'),
    ],
    turn: [
      T('Betting before the first draw', n === 2
        ? 'You act first. The big blind counts as a bet of 2, so you add one chip to call. Your opponent could raise but checks.'
        : 'Each player in turn folds, calls 2 or raises. Here the others fold. You have already put in 1, so you add one chip to call, and the big blind checks.', 'bet', [
        ...folds, spawn(chip('call', '1', 'Your call', 'The extra chip that brings your small blind up to the size of the big blind.'), at('bet', 0.55, 0.5), 'chips.0', undefined, 0.9),
      ], 8),
      T('The first draw', 'Sweep the bets into the pot. Starting with the first player still in to the left of the button, each player discards as many cards as they like, from none to all four, and is dealt the same number. You throw away the K♥, your second heart, and draw the J♣.', 'hand', [
        mv('sb', at('pot', 0.25, 0.3), 0.2), mv('call', at('pot', 0.25, 0.72), 0.3), mv('bb', at('pot', 0.72, 0.3), 0.4),
        flip('hand.3', false), mv('hand.3', at('muck'), 1), draw('deck', at('hand', ...slot(3, 4)), pc('J♣'), 'new', 1.6),
        mv('hand.3@1', at('muck', 0.5, 0.5, 0.02), 2.2), spawn(hidden('opp', 'Q♥', 'Replacement card', 'The card your opponent drew in place of the one they threw away.'), at('hand@1', ...slot(3, 4)), 'deck', undefined, 2.8),
      ], 10, ),
      T('Two more draws', 'A betting round follows each draw, then there is a second draw, more betting, a third draw and a final betting round. From the second round on, the first player still in to the left of the button acts first. You now hold A-4-7-J in four suits, a jack-high badugi, so you draw no cards: this is called standing pat.', 'hand', [], 9),
      T('Showdown', 'If two or more players are left after the last betting round, they show all four cards. Your opponent has a queen-high badugi. Your highest card, the jack, is lower than the queen, so you win the pot.', 'all', [
        flip('hand.0@1'), flip('hand.1@1'), flip('hand.2@1'), flip('opp'),
      ], 9),
      T('How it ends', 'If everyone else folds, the last player in wins the pot without showing. Equal hands split the pot. The button then moves one seat to the left for the next hand, and you play for as long as you agreed or until one player holds all the chips.', 'all'),
    ],
  }
})
