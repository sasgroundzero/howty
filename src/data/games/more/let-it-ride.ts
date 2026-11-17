/** Let It Ride: three equal bets, three cards each and two shared cards; pull bets back or let them ride. */
import { C, On, P, S, T, at, discs, flip, hide, mv, spawn, tabletop, zone, type Item } from '../compose'
import { hand, hidden, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const CARDS = 'Three cards dealt face down. Only you may look at them. With the two community cards they make your five-card poker hand.'
const chip = (id: string, title: string, body: string, color = '#c0392b') => discs(id, 1, 0.25, color, title, body, { label: '1', h: 0.08 })

export const letItRide = tabletop('let-it-ride', 'Let It Ride', [1, 6], 3, '15–30 min', 'Easy', 'Three bets down: pull one back or let it ride.', ['#1f6b43', '#d9a514', '#c0392b'], (n) => ({
  setup: [
    S('The table', 'Let It Ride is a casino game in which you are paid for making a good five-card poker hand. Nobody plays against anyone else, and the dealer has no hand. It uses one standard 52-card deck with no jokers. Each player has three betting spots.', 'you', [
      P(zone('b1', 1.2, 1, '1', 'Your first bet. You may take it back after looking at your three cards.'), zone('b2', 1.2, 1, '2', 'Your second bet. You may take it back after the first community card is shown.'), zone('b3', 1.2, 1, '$', 'Your third bet. It always stays in play.')),
    ], 'The dealer is not one of the players shown: the two community cards go in the middle. A casino table has room for several players; this guide shows up to 6.'),
    S('Take your chips', 'Each player needs chips to bet with. In a home game one person acts as dealer and banker.', 'chips', [
      P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. What the chips are worth, and the betting limits, are whatever the group agrees.', { h: 0.4 })),
    ]),
    S('Place three equal bets', 'Before any cards are dealt, put the same amount on each of your three spots. Here everyone bets 1 chip on each.', 'you', [
      On('b1', 0.5, 0.5, chip('c1', 'First bet', 'One of three equal bets. This is the one you can take back first.')),
      On('b2', 0.5, 0.5, chip('c2', 'Second bet', 'One of three equal bets. You can take it back at the second decision.')),
      On('b3', 0.5, 0.5, chip('c3', 'Third bet', 'One of three equal bets. It can never be taken back.')),
    ], 'Casinos usually offer optional side bets as well; they are separate from the main game.'),
    S('Deal the cards', 'The dealer gives each player 3 cards face down and places 2 community cards face down in the middle. Everyone will share those two cards.', 'c', [
      P(seated(hand('hand', 'J♥ 9♣ 4♠', 'Your cards', CARDS), hand('hand', 'K♠ Q♠ 5♥', 'Your cards', CARDS))),
      C(hidden('comm', 'J♣ 7♦', 'Community cards', 'Two cards shared by every player. They are turned up one at a time, and each completes everyone\'s five-card hand.'), stock('deck', 52 - 3 * n - 2, 'Deck', 'The rest of the deck. It is not used again this round.')),
    ]),
    S('Ready to play', 'Look at your own three cards. You will now get two chances to take one bet back. Leaving a bet where it is is called letting it ride.', 'all', [], 'You may not show your cards to other players.'),
  ],
  turn: [
    T('First decision', `With only your three cards to go on, you may take back your first bet or let it ride. You have no pair yet, so you pull the first bet back.${n > 1 ? ' The player on your left lets theirs ride.' : ''}`, 'you', [
      mv('c1', at('chips.0', 0.5, 0.5), 0.5),
    ], 8),
    T('First community card', 'The dealer turns over the first community card: the J♣. It gives you a pair of jacks. You may now take back your second bet, even if you let the first one ride, but with a winning hand already made you let it ride.', 'c', [
      flip('comm.0'),
    ], 8),
    T('Second community card', 'The dealer turns over the second community card and then each player\'s three cards. Your five-card hand is your three cards plus the two community cards.', 'c', [
      flip('comm.1'), ...(n > 1 ? [flip('hand.0@1'), flip('hand.1@1'), flip('hand.2@1')] : []),
    ], 8),
    T('Get paid', `A pair of tens or better wins; anything less loses. Your pair of jacks pays even money on each bet you still have on the table, so you win on two bets.${n > 1 ? ' The player on your left made no pair and loses all three bets.' : ''}`, 'you', [
      spawn(chip('win2', 'Winnings', 'Even money on your second bet.', '#e9e4d8'), at('b2', 0.5, 0.5, 0.08), 'comm.0', undefined, 0.4),
      spawn(chip('win3', 'Winnings', 'Even money on your third bet.', '#e9e4d8'), at('b3', 0.5, 0.5, 0.08), 'comm.0', undefined, 0.8),
      ...(n > 1 ? [hide('c1@1', 1.3), hide('c2@1', 1.4), hide('c3@1', 1.5)] : []),
    ], 9),
    T('How it ends', 'Two pair and better hands pay more than even money, up to a very large prize for a royal flush, but the paytable varies from casino to casino, so read the one at the table. The cards are then collected and shuffled for a new round. There is no overall winner: you play as many rounds as you like.', 'all'),
  ],
}))
