/** Five-Card Stud: one card face down, four face up, and a betting round after each face-up card. */
import { C, On, P, S, T, at, discs, draw, flip, hide, mv, spawn, tabletop, zone, type Act, type Item } from '../compose'
import { hand, pc, shown, slot, stock } from '../playing'

/** One item per seat: the first is yours, the last is repeated for any seats beyond the list. */
const bySeat = (items: Item[]): Item => ({ ...items[0], make: (c, k, seat) => items[Math.min(Number((seat || '@0').slice(1)), items.length - 1)].make(c, k, seat) })
const HOLE = 'The one card dealt face down. Only its owner may look at it; it stays hidden until the showdown.'
const DOOR = 'The first face-up card. Everyone can see it, and the best cards showing decide who bets first.'
const DOORS = ['K♦', '9♣', '4♠', 'J♥', '6♦', '10♠', '7♥', '3♣']
const chip = (id: string, title: string, body: string, h = 0.08) => discs(id, 1, 0.25, '#e9e4d8', title, body, { h })
/** Deal a face-up card to the player on your left and to you: k is the slot in the face-up row. */
const street = (k: number, mine: string, theirs: string, t = 0.3): Act[] => [
  draw('deck', at('ups@1', ...slot(k, 4)), pc(theirs), `their${k}`, t), draw('deck', at('ups', ...slot(k, 4)), pc(mine), `my${k}`, t + 0.6),
]

export const fiveCardStud = tabletop('five-card-stud', 'Five-Card Stud', [2, 8], 6, '1–2 hr', 'Medium', 'One card hidden, four on show.', ['#1f6b43', '#9b2c2c', '#e9e4d8'], (n) => {
  const folds: Act[] = Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 2).flatMap((s) => [hide(`hole@${s}`, 1.2), hide(`door@${s}`, 1.2)])
  return {
    setup: [
      S('Cards and chips', 'Five-Card Stud uses one standard 52-card deck with no jokers. There are no shared cards and no swapping. Give every player the same starting stack of chips.', 'you', [
        P(zone('bet', 2.6, 1, 'Bets', 'Chips you bet in the current round sit here in front of you. When the round is over they join the pot.')),
        P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. How many chips everyone starts with, and what they are worth, is up to the group.', { h: 0.4 })),
      ], 'Sometimes called California stud; stud games in general are also known as open poker. The deck could cover 10 players; this guide shows up to 8. Agree the ante, the bet sizes and any limit on raises before you start.'),
      S('Everyone antes', `Before the deal each of the ${n} players puts the same small stake, the ante, into the pot in the middle.`, 'pot', [
        C(zone('pot', 2, 1.5, 'Pot', 'The antes and all the chips bet in the hand. The winner of the hand takes it.')),
        On('pot', 0.5, 0.5, discs('antes', 1, 0.25, '#e9e4d8', 'Antes', `One ante from each of the ${n} players. It gives everyone something to play for from the start.`, { h: 0.05 * n })),
      ], 'There are no blinds. The deal passes to the left after each hand.'),
      S('Deal one down and one up', 'Starting on the dealer\'s left, deal each player one card face down and then one card face up. Look at your own face-down card and keep it hidden.', 'you', [
        P(bySeat([hand('hole', 'A♠', 'Your hole card', HOLE), hand('hole', 'J♣', 'Hole card', HOLE)]), zone('ups', 4.02, 1.26, 'Face-up cards', 'Your face-up cards line up here for everyone to see: one now, and one more before each later betting round.')),
        On('ups', slot(0, 4)[0], 0.5, bySeat(DOORS.map((c) => shown('door', c, 'Upcard', DOOR)))),
        C(stock('deck', 52 - 2 * n, 'Deck', `The ${52 - 2 * n} cards left after the first deal. Every later card comes from the top.`)),
      ]),
      S('See who bets first', 'In the traditional game the player showing the highest face-up card opens the first betting round. Here that is you, with a king.', 'door', [], 'Formal casino games do it the other way round: the player showing the lowest card must post a small forced bet called the bring-in. Agree which you are using. Ties are settled by suit in some games (spades high, then hearts, diamonds, clubs) and by nearness to the dealer\'s left in others.'),
      S('Ready to play', 'There are four betting rounds, one after each face-up card. In each, play goes clockwise from the opener: check or bet, and once someone has bet, fold, call or raise.', 'all', [], 'Stud is usually played with fixed limits: a small bet in the early rounds and a big bet of twice the size later. The exact amounts are whatever your group agrees.'),
    ],
    turn: [
      T('First betting round', n === 2
        ? 'Your king is the highest card showing, so you act first and bet. Your opponent calls.'
        : 'Your king is the highest card showing, so you act first and bet. The player on your left calls and the others fold.', 'bet', [
        spawn(chip('open', 'Your bet', 'The opening bet of the first round.'), at('bet', 0.2, 0.5), 'chips.0'),
        spawn(chip('see', 'Call', 'A call matches the bet that has been made.'), at('bet@1', 0.2, 0.5), 'chips.0@1', undefined, 0.8), ...folds,
      ], 8),
      T('The third card', 'Each player still in is dealt another card face up. From now on the best poker hand showing acts first. A pair of nines beats your king-high, so the player on your left opens this round.', 'you', street(1, '8♠', '9♥'), 9),
      T('The fourth and fifth cards', 'Two more rounds follow in the same way: one more face-up card each, then betting. Only pairs and better count for who acts first, not part-made straights or flushes. Your pair of kings showing puts you first.', 'you', [
        ...street(2, 'K♣', '2♦'), ...street(3, '5♥', 'Q♣', 2.2),
      ], 10),
      T('Showdown', 'After the last betting round, players still in turn over their hole cards. Each has exactly five cards. Your pair of kings beats a pair of nines, so you take the pot.', 'all', [
        flip('hole@1'), mv('antes', at('bet', 0.7, 0.5), 1.2),
      ], 9),
      T('How it ends', 'If everyone else folds, the last player in wins the pot without showing the hole card. The deal then passes to the left. Play for as long as you agreed, or until one player holds all the chips.', 'all'),
    ],
  }
})
