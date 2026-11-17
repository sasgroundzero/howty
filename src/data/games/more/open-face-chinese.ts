/** Open-Face Chinese Poker: build three poker hands face up, five cards first and then one at a time. */
import { C, On, P, S, T, at, discs, draw, flip, mv, tabletop, zone, type Act, type Item } from '../compose'
import { hand, pc, stock } from '../playing'

/** One block of cards per player, with different faces for each seat. Seat 0 is listed first. */
const dealt = (id: string, sets: string[], title: string, body: string): Item => {
  const its = sets.map((s) => hand(id, s, title, body))
  return { ...its[0], make: (c, k, seat) => its[Number((seat || '@0').slice(1)) % its.length].make(c, k, seat) }
}
/** Card space k of a row: the front row holds 3 cards and the others 5. */
const sp = (row: string, k: number) => (row.startsWith('front') ? at(row, 0.5 + ((k - 1) * 1.04) / 3.2, 0.5) : at(row, 0.5 + ((k - 2) * 1.04) / 5.3, 0.5))
/** A player's first five cards go to the back, middle and front rows: `rows[k]` is where card k lands. */
const place = (seat: number, rows: string[]): Act[] => {
  const used: Record<string, number> = {}
  return rows.flatMap((r, k) => [...(seat ? [flip(`start.${k}@${seat}`)] : []), mv(`start.${k}@${seat}`, sp(`${r}@${seat}`, (used[r] = (used[r] ?? -1) + 1)), 0.3 + k * 0.4)])
}

export const openFaceChinese = tabletop('open-face-chinese', 'Open-Face Chinese Poker', [2, 3], 2, '20–40 min', 'Medium', 'Build three poker hands face up, card by card.', ['#1f4e79', '#d9a514', '#f5f1e6'], (n) => ({
  setup: [
    S('Cards and stakes', 'Open-Face Chinese Poker uses one standard 52-card deck with no jokers. There is no betting during the hand: you score points against each opponent and settle up afterwards.', 'all', [], 'Often shortened to OFC or OFCP. Two or three players is usual and is what this guide shows; four can also play the basic game, which then uses the whole deck. Agree what a point is worth, in chips or on paper.'),
    S('Mark out three rows each', 'Each player will build a front hand of 3 cards, a middle hand of 5 and a back hand of 5, all face up. Leave room for the three rows in front of every player.', 'you', [
      P(zone('front', 3.2, 1.5, 'Front', 'Your three-card hand, nearest the middle of the table. It must end up as your weakest hand. Only three of a kind, a pair or high cards count here.')),
      P(zone('middle', 5.3, 1.5, 'Middle', 'A five-card hand. It must end up better than your front hand and no better than your back hand.')),
      P(zone('back', 5.3, 1.5, 'Back', 'A five-card hand, nearest to you. It must end up as your strongest hand.')),
    ]),
    S('Place the dealer button', `One player is the dealer. Here ${n === 2 ? 'your opponent has' : 'the player on your right has'} the button, so you are to the dealer's left and will act first.`, 'button', [
      On(`front@${n - 1}`, 1.18, 0.5, discs('button', 1, 0.28, '#f5f1e6', 'Dealer button', 'Marks the dealer. The player to the dealer\'s left acts first and the dealer acts last. It normally moves one seat to the left after each hand.', { label: 'D', h: 0.08, ink: '#1c1917' })),
    ]),
    S('Deal five cards each', 'The dealer deals 5 cards to each player, one at a time and face down. The rest of the deck stays in the middle.', 'you', [
      On('middle', 0.5, 0.5, dealt('start', ['A♠ A♦ 9♥ 8♥ 4♣', 'K♠ K♣ 10♦ 7♦ 3♠', 'Q♥ J♥ 10♥ 6♠ 2♣'], 'Starting cards', 'The five cards you begin with. On your first turn you place all of them face up in your rows.')),
      C(stock('deck', 52 - 5 * n, 'Deck', `The ${52 - 5 * n} cards left after the deal. Players take one at a time from the top.`)),
    ]),
    S('Ready to play', 'Starting with the player to the dealer\'s left, each player in turn sets their first five cards. After that players take one card at a time until everyone has 13.', 'all', [], 'Once a card has been placed in a row it cannot be moved.'),
  ],
  turn: [
    T('Set your first five cards', 'You go first. Turn your five cards face up and put each one in a row of your choice. Here the pair of aces starts your back hand, the 9♥ and 8♥ start the middle, and the 4♣ goes in front.', 'you', place(0, ['back', 'back', 'middle', 'middle', 'front']), 9),
    T('The others set theirs', `Going clockwise, ${n === 2 ? 'your opponent now does the same' : 'each of the other players now does the same, the dealer last'}. Everyone can see where every card goes.`, 'all', [
      ...place(1, ['back', 'back', 'middle', 'middle', 'front']), ...(n > 2 ? place(2, ['back', 'back', 'back', 'middle', 'front']) : []),
    ], 9),
    T('Take one card at a time', 'Now, starting again to the dealer\'s left, each player in turn takes the top card of the deck, shows it, and adds it to any row that still has space. You draw the 9♣ and put it in the middle for a pair of nines. Keep going round until everyone has 13 cards: 3 in front and 5 in each other row.', 'all', [
      draw('deck', sp('middle', 2), pc('9♣'), 'd0', 0.4), draw('deck', sp('middle@1', 2), pc('7♠'), 'd1', 1.4), ...(n > 2 ? [draw('deck', sp('middle@2', 1), pc('5♦'), 'd2', 2.4)] : []),
    ], 10),
    T('Check for fouls and score', 'Your back hand must be at least as good as your middle hand, and your middle hand better than your front. If not, your hand is fouled. Otherwise compare each row with each opponent: 1 point for each row won and, in the usual scoring, 3 extra for winning all three.', 'all', [], 10),
    T('Fouls, royalties and Fantasyland', 'A fouled hand loses all three rows and the bonus to every opponent who has not fouled, 6 points in the usual scoring. Most groups also pay bonus points (royalties) for strong hands, by a table you should agree first. A player who finishes with a pair of queens or better in front, without fouling, is in "Fantasyland" next hand: they get all 13 cards at once and set them face down.', 'all', [], 11),
    T('How it ends', 'The button moves one seat to the left and you deal again. Play as many hands as you like: whoever is ahead on points when you stop has won. In the popular Pineapple version, for 2 or 3 players, after the first five you take three cards at a time, place two and discard one.', 'all', [], 9),
  ],
}))
