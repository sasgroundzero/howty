/** Nertz: everyone plays their own solitaire at once and races to empty a 13-card pile. */
import { C, P, S, T, at, deck, draw, f, mv, set, tabletop, zone, type Item } from '../compose'
import type { Face } from '../../../engine/types'
import { BACK, BACK2, pc, pcs, slot, stock } from '../playing'

const seatOf = (seat?: string) => (seat ? Number(seat.slice(1)) : 0)
/** Every player's deck has its own back: blue for you, red for the next player, then the player colors. */
const backOf = (seat: number, color: string): Face => (seat === 0 ? BACK : seat === 1 ? BACK2 : f(color, '✦', color === '#e9e4d8' || color === '#e0b12f' ? '#1c1917' : '#ffffff'))
const WORK = ['9♠ 5♦ A♣ 8♥', 'J♦ A♥ 6♣ 10♠', '3♣ Q♦ 7♠ 2♦', 'K♥ 4♠ 10♦ 6♥']
const TOP = ['2♥', 'K♣', '5♠', '9♦']

const work: Item = (() => {
  const base = deck('work', 1, pc('A♠'), 'Work piles', 'Four face-up piles, your own to build on. They are built downward in alternating colors, like the columns in Klondike, and only you may play to them.', { n: 4 })
  return { ...base, make: (_c, k, seat) => ({ kind: 'card', props: { w: 0.9, d: 1.26, face: pcs(WORK[seatOf(seat) % 4])[k], faceUp: true } }) }
})()
const nerts: Item = (() => {
  const base = deck('nerts', 13, pc('A♠'), 'Nertz pile', 'Thirteen cards with only the top one face up. Getting rid of this pile is the whole point: the first player to empty it may end the round.')
  return { ...base, make: (_c, _k, seat) => ({ kind: 'stack', props: { w: 0.9, d: 1.26, count: 13, face: pc(TOP[seatOf(seat) % 4]), per: 0.012 } }) }
})()
const own: Item = (() => {
  const base = stock('stock', 35, 'Stock', 'The 35 cards left from your own deck, held face down. You turn them three at a time onto your waste pile.')
  return { ...base, make: (c, _k, seat) => ({ kind: 'stack', props: { w: 0.9, d: 1.26, count: 35, face: backOf(seatOf(seat), c), per: 0.012 } }) }
})()

export const nertz = tabletop('nertz', 'Nertz', [2, 8], 4, '15–30 min', 'Medium', 'A frantic race of simultaneous solitaire.', ['#27457a', '#9b2c2c', '#ffffff'], (n) => ({
  setup: [
    S('One deck per player', `Every player needs their own standard 52-card deck with no jokers, and each deck must have a different back so the cards can be sorted out afterwards. For ${n} players that is ${n} decks. Leave the middle of the table clear.`, 'c', [
      C(zone('lake', 4.6 + n * 0.5, 3, 'Foundations', 'The shared area in the middle. Anyone may start a pile here with an ace and anyone may add the next card of the same suit, up to the king.')),
    ], `Also known as Nerts, Pounce, Racing Demon, Peanuts or Squeal. It is best with two to four; bigger groups often play in pairs sharing a deck.${n > 2 ? ' Here your deck is blue, the next is red, and the others match their players\' colors.' : ' Here your deck is blue and your opponent\'s is red.'}`),
    S('Deal your Nertz pile', 'Each player shuffles their own deck and deals 13 cards into a pile: 12 face down with the last one face up on top.', 'nerts', [
      P(nerts),
    ]),
    S('Deal four work piles', 'Next to it, deal 4 cards face up in a row. These start your four work piles.', 'work', [
      P(work),
    ], 'Four work piles is the usual number. Some groups change it with the number of players.'),
    S('Hold your stock', 'The remaining 35 cards are your stock. Keep them face down in your hand or on the table in front of you.', 'stock', [
      P(own, zone('waste', 2.3, 1.5, 'Waste pile', 'Cards you turn from your stock land here face up. Only the top one may be played.')),
    ]),
    S('Ready to play', 'There are no turns. When everyone is ready someone says "go" and all players play at the same time, as fast as they like, using one hand and moving one card at a time.', 'all', [], 'You may move cards onto the shared foundations, around your own work piles, and from your stock to your waste pile three at a time.'),
  ],
  turn: [
    T('Aces start the foundations', 'You have an ace in a work pile, so you shoot it into the middle. Fill the gap it leaves with the top card of your Nertz pile and turn the next Nertz card face up.', 'lake', [
      mv('work.2', at('lake', 0.3, 0.5)), draw('nerts', at('work', ...slot(2, 4)), pc('2♥'), 'n1', 1.1), set('nerts', { face: pc('7♠') }),
    ], 8),
    T('Build on anyone\'s pile', 'Another player puts out the ace of hearts. Foundations belong to everyone, so you slap your 2 of hearts on top of it. If two players go for the same spot, the card that lands first stays.', 'lake', [
      mv('work.1@1', at('lake', 0.6, 0.5)), mv('n1', at('lake', 0.6, 0.5, 0.02), 1.3),
    ], 8),
    T('Tidy your work piles', 'On your own work piles you build downward in alternating colors: the red 8 goes on the black 9. A space may be filled from your Nertz pile, your waste pile or another work pile.', 'work', [
      mv('work.3', at('work.0', 0.5, 0.8, 0.02)), draw('nerts', at('work', ...slot(2, 4)), pc('7♠'), 'n2', 1.1), set('nerts', { face: pc('Q♦') }),
    ], 8),
    T('Turn three from your stock', 'When nothing else moves, turn three stock cards at once onto your waste pile. Only the top card can be played: here the 2 of clubs, which goes on your ace in the middle. When the stock is used up, turn the waste pile over and carry on.', 'waste', [
      draw('stock', at('waste', 0.25, 0.5), pc('J♣'), 'w0'), draw('stock', at('waste', 0.5, 0.5, 0.02), pc('4♦'), 'w1'), draw('stock', at('waste', 0.75, 0.5, 0.04), pc('2♣'), 'w2'), mv('w2', at('work.2', 0.5, 0.5, 0.02), 2.4),
    ], 9),
    T('Call Nertz', 'The moment your Nertz pile is empty you may shout "Nertz!" and play stops at once. Sort the foundation cards by their backs: you score 1 point for each of your cards in the middle and lose 2 for each card left in your Nertz pile.', 'all', [], 9),
    T('How it ends', 'Deal again and keep a running total. The first player to reach the agreed target, commonly 100 points, wins. If everyone gets stuck, each player turns their waste pile over as a new stock, moves its top card to the bottom and play goes on.', 'all', [], 8),
  ],
}))
