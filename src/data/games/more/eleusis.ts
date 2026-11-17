/** Eleusis: the dealer invents a secret rule and everyone else works it out by playing cards. */
import { C, On, P, R, S, T, at, deck, draw, ft, tabletop, zone, type Item } from '../compose'
import { BACK, pc, shown, stock } from '../playing'

/** Seat 0 (you) is the dealer and holds only the written rule; every other seat holds a packet of 14 cards. */
const seats: Item = (() => {
  const base = deck('hand', 14, BACK, 'Hands and the secret rule', 'Each player holds 14 cards and tries to get rid of them. The dealer has no cards, only the rule written on a slip of paper that stays hidden until the round is over.')
  return { ...base, make: (c, k, seat) => (seat === '@0' ? { kind: 'card', props: { w: 0.9, d: 1.26, face: ft('#fbf6ea', 'Rule', 'red, black, red...', '?'), faceUp: true } } : base.make(c, k, seat)) }
})()
const line = (k: number) => 0.07 + (k * 1.04) / 8.4

export const eleusis = tabletop('eleusis', 'Eleusis', [4, 8], 5, '60 min', 'Hard', 'Guess the dealer\'s secret rule.', ['#7a4fa3', '#27457a', '#ffffff'], (n) => {
  const left = 104 - 14 * (n - 1) - 1
  return {
    setup: [
      S('Shuffle two decks together', 'Eleusis uses two standard 52-card decks shuffled into one pack of 104 cards, with no jokers. You also need pencil and paper.', 'c', [
        C(zone('main', 8.4, 1.5, 'Mainline', 'The row of correct cards, running left to right from the starter. Each card played here obeyed the secret rule.')),
        C(zone('side', 8.4, 1.5, 'Sidelines', 'Wrong cards are laid below the mainline card they tried to follow, so everyone can see what failed there.')),
      ], 'This is Robert Abbott\'s game in its later form, sometimes called New Eleusis. It suits 4 to 8 players. Some groups manage with a single deck at a small table.'),
      S('Choose a dealer', 'One player is the dealer for the round and takes no cards. In this walkthrough you are the dealer. Everyone should get a turn as dealer over the game.', 'you'),
      S('Write down a secret rule', 'The dealer invents a rule that says which card may follow the cards already played, and writes it down without showing it. The example rule here is: if the last card was red play a black card, and if it was black play a red one.', 'hand', [], 'The dealer scores best when the rule is neither too easy nor too hard, so do not make it impossible.'),
      S('Deal fourteen cards each', `The dealer gives 14 cards to each of the other ${n - 1} players and none to themselves.`, 'all', [
        P(seats),
      ]),
      S('Turn up the starter', `Put the remaining ${left} cards aside as the stock after turning one card face up at the left end of the mainline. This starter card begins the row.`, 'main', [
        On('main', line(0), 0.5, shown('starter', '5♥', 'Starter card', 'The first card of the mainline. The first play has to follow it according to the secret rule.')),
        R(stock('stock', left, 'Stock', `The ${left} cards left over. Penalty cards are dealt from here.`)),
      ]),
      S('Ready to play', 'Pick a player to go first; play then passes clockwise, skipping the dealer. On your turn you play one card to the end of the mainline and the dealer calls it right or wrong.', 'all', [], 'The dealer never explains the rule. Players learn it only from which cards are accepted and which are refused.'),
    ],
    turn: [
      T('A correct play', 'The player on your left tries a black 7 after the red starter. That fits your rule, so you say "right" and the card stays on the mainline.', 'main', [
        draw('hand@1', at('main', line(1), 0.5), pc('7♣'), 'p1'),
      ]),
      T('A wrong play', 'The next player tries another black card. You say "wrong". The card goes to a sideline below the last correct card, and you deal that player 2 penalty cards from the stock.', 'side', [
        draw('hand@2', at('side', line(1), 0.5), pc('2♠'), 'p2'),
        draw('stock', at('hand@2', 0.5, 0.5, 0.01), undefined, undefined, 1.3), draw('stock', at('hand@2', 0.5, 0.5, 0.03), undefined, undefined, 1.6),
      ], 9),
      T('Playing a string', 'A player who feels sure may play a string of two, three or four cards at once. If every card is right they all join the mainline. If any is wrong the whole string is sidelined and the penalty is twice the number of cards played.', 'main', [
        draw('hand@3', at('main', line(2), 0.5), pc('9♦'), 'p3'), draw('hand@3', at('main', line(3), 0.5), pc('K♠'), 'p4'),
      ], 9),
      T('Declaring no play', 'If you think none of your cards can be played, show your hand. If you are right and hold more than four cards, you swap them for a new hand four cards smaller. If you are wrong, the dealer plays one correct card for you and you take 5 penalty cards.', 'all', [], 10),
      T('Becoming the prophet', 'A player who believes they know the rule may declare themselves the prophet after a correct play. The prophet stops playing cards and calls right or wrong in the dealer\'s place. A prophet who calls wrongly is overthrown and takes 5 penalty cards.', 'all', [], 10),
      T('How it ends', 'The round ends when a player runs out of cards, or when everyone has been expelled: once about 40 cards have been played, a wrong play puts you out of the round. Fewer cards left means a better score, with a bonus for going out. The highest total after everyone has dealt wins.', 'all', [], 10),
    ],
  }
})
