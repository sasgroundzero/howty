/** Piquet: the classic two-player game of exchanging, declaring and then playing twelve tricks. */
import { C, P, R, S, T, at, draw, hide, mv, set, tabletop, zone, type Act } from '../compose'
import { BACK, hand, pc, slot, stock } from '../playing'

const spot = (i: number, n: number): [number, number] => {
  const near = Math.ceil(n / 2)
  return i < near ? [1 - (i + 0.5) / near, 0.76] : [(i - near + 0.5) / (n - near), 0.24]
}
/** Another player turns a card from their hand face up and plays it to the trick. */
const play = (seat: number, k: number, card: string, n: number, delay?: number): Act[] => [
  set(`hand.${k}@${seat}`, { faceUp: true, face: pc(card) }), mv(`hand.${k}@${seat}`, at('trick', ...spot(seat, n)), delay),
]
/** The winner gathers the trick face down onto their pile of won tricks. */
const take = (ids: string[], winner: number): Act[] => ids.flatMap((id, j) => [set(id, { faceUp: false, back: BACK }), mv(id, at(`won@${winner}`, 0.5, 0.5, j * 0.02))])

const MINE = 'A♠ K♠ Q♠ J♠ 8♠ A♥ K♥ 9♥ Q♦ 7♦ 9♣ 8♣'
/** Cards you throw away, and what you draw into the same places. */
const SWAP: [number, string][] = [[4, '10♠'], [7, 'Q♥'], [9, 'A♦'], [10, 'J♦'], [11, 'K♣']]

export const piquet = tabletop('piquet', 'Piquet', [2, 2], 2, '30–45 min', 'Hard', 'Exchange, declare, then play twelve tricks.', ['#9b2c2c', '#1c1917', '#ffffff'], () => {
  const n = 2
  return {
    setup: [
      S('Strip the deck to 32 cards', 'Piquet is for two players and uses 32 cards: the 7 up to the ace in each suit. Take out every 2, 3, 4, 5 and 6.', 'r', [
        C(zone('trick', 3.4, 3, 'Trick', 'The leader plays a card here and the other player answers. The higher card of the suit led wins. There are no trumps.')),
        R(stock('out', 20, 'Cards taken out', 'The twenty cards from 2 to 6. They are not used.')),
      ], 'The form described here, scored over six deals, is known as Rubicon Piquet. An older form, Piquet au Cent, is played to 100 points. Aces are high.'),
      S('Deal twelve cards each', 'The dealer deals 12 cards to each player, in packets of two or three.', 'you', [
        P(hand('hand', MINE, 'Hand', 'A hand of 12 cards. Sort yours by suit.', { cols: 6 })),
      ], 'The dealer is called younger hand and the other player elder hand. Here you are elder hand.'),
      S('Set out the talon', 'Place the 8 remaining cards face down between you. This pile is the talon.', 'talon', [
        C(stock('talon', 8, 'Talon', 'The 8 cards left after the deal. Both players swap cards with it before play begins.')),
      ]),
      S('Leave room for discards and tricks', 'Each player needs a place for the cards they throw away and for the tricks they win.', 'you', [
        P(
          zone('disc', 2.2, 1.5, 'Discards', 'Cards this player has exchanged, face down. You may look at your own discards during play.'),
          zone('won', 2.2, 1.5, 'Tricks won', 'Tricks this player has taken. The player with more than six of the twelve earns a bonus.'),
        ),
      ]),
      S('Keep score on paper', 'Points are scored during every stage of a deal, so each player keeps a running count out loud and writes down the total at the end of the deal.', 'c', [], 'A hand dealt with no king, queen or jack at all is called carte blanche and scores 10 straight away.'),
      S('Ready to play', 'Each deal has three stages: exchange cards with the talon, declare your best combinations, then play 12 tricks. Elder hand goes first in each stage.', 'all'),
    ],
    turn: [
      T('Elder hand exchanges', 'You must discard at least one card and may discard up to five, face down, then draw the same number from the top of the talon. You swap five.', 'you', [
        ...SWAP.map(([k], i) => mv(`hand.${k}`, at('disc', 0.5, 0.5, i * 0.02), 0.2 + i * 0.3)),
        ...SWAP.map(([k], i) => set(`hand.${k}`, { faceUp: false, back: BACK })),
        ...SWAP.map(([k, card], i) => draw('talon', at('hand', ...slot(k, 6, 2)), pc(card), `new${i}`, 2 + i * 0.4)),
      ], 9),
      T('Younger hand exchanges', 'The dealer then discards at least one card and may take as many as are left in the talon, here three.', 'talon', [
        ...[0, 1, 2].map((k) => mv(`hand.${k}@1`, at('disc@1', 0.5, 0.5, k * 0.02), 0.2 + k * 0.3)),
        ...[0, 1, 2].map((k) => draw('talon', at('hand@1', ...slot(k, 6, 2)), undefined, undefined, 1.6 + k * 0.4)),
        hide('talon', 3),
      ], 8),
      T('Declare your combinations', 'You announce, in order, your point (most cards in one suit), your best sequence (three or more in a row in one suit) and your best set (three or four aces, kings, queens, jacks or tens). In each class only the player with the better holding scores.', 'you', [], 10),
      T('Lead to the first trick', 'Elder hand leads. You play the A♠ and score 1 point for leading. The dealer must follow suit if able and plays the 7♠.', 'trick', [mv('hand.0', at('trick', ...spot(0, n))), ...play(1, 5, '7♠', n, 1.4)]),
      T('Win tricks for points', 'The higher card of the suit led wins and its winner leads next. You score 1 for each card you lead, 1 for winning a trick the other player led, and 1 extra for the last trick.', 'won', take(['hand.0', 'hand.5@1'], 0)),
      T('Scoring and winning', 'Whoever wins more of the 12 tricks adds 10, or 40 for winning all of them. A game, called a partie, is six deals with the deal alternating, and the higher total wins, with 100 extra if the loser stays under 100. Reaching 30 before your opponent scores anything earns a bonus: 60 for a repique from declarations alone, 30 for a pique counting play.', 'all', [], 10),
    ],
  }
})
