/** Monopoly: bank, title deeds, two card decks, tokens on GO and $1,500 each. */
import type { V3 } from '../../engine/types'
import { BH, COLORS, Kit, OVER, WIDE, game, info, look, onBoard, seats } from './kit'
import { ringCenter } from './layouts'

const BILLS: [string, string][] = [['$1', '#f4f1e8'], ['$5', '#f3c9cf'], ['$10', '#f6e58d'], ['$20', '#b8e0b0'], ['$50', '#a9d0ea'], ['$100', '#f0d7a0'], ['$500', '#f2b56b']]

function build(n: number) {
  const b = new Kit()
  const P = onBoard(11, 11)
  const S = seats(n, 9.3, 8.3)
  const BANK = look(15, 0, 8)
  const GO = look(4.6, 4.6, 6)
  const BOARD = b.s('Unfold the board', 'Lay the board in the middle of the table with GO in a corner everyone can reach.', OVER, 'The track has 40 spaces: 28 properties, 4 corners and 8 special spaces.', ['1 board'])
  const DECKS = b.s('Place the two card decks', 'Shuffle the Chance and Community Chest cards separately and put each deck face down on its outline on the board.', look(0, 0, 9), undefined, ['16 Chance cards', '16 Community Chest cards'])
  const BANKER = b.s('Choose a banker', 'Pick one player to be the banker, who looks after the bank’s money, the title deeds, the houses and the hotels.', BANK, 'The banker can still play, but must keep their own money separate from the bank’s.', ['Bank money', '28 title deeds', '32 houses', '12 hotels'])
  const MONEY = b.s('Hand out $1,500 each', 'The banker gives every player $1,500 in a mix of bills.', WIDE, 'The exact mix of bills differs between editions, so check your rulebook, but the total is always $1,500.', ['$1,500 per player'])
  const TOKENS = b.s('Tokens on GO', 'Each player chooses a token and places it on the GO corner.', GO, undefined, [`${n} tokens`])
  const DICE = b.s('Roll to see who starts', 'Everyone rolls both dice: the highest total goes first, and play passes to the left.', OVER, undefined, ['2 dice'])
  b.s('Ready to play', 'You are set up: on your turn, roll both dice and move your token clockwise that many spaces.', OVER, 'Buy property, collect rent, and be the last player who is not bankrupt.')

  b.board('board', BOARD, 11, 11, 'b:ring', info('Game board', 'A square track of 40 spaces. Colored bars mark the property groups, and you travel clockwise from GO. There is 1.'), { edge: '#2f5d50' })
  b.deck('chest', DECKS, P([0.3, 0.3]), 16, { panel: '#2e6fb7', ink: '#ffffff', glyph: '▣' }, info('Community Chest deck', '16 cards. Draw the top one when you land on a Community Chest space, do what it says, then return it to the bottom. A Get Out of Jail Free card is kept until you use it.'), { w: 1.3, d: 2, rotY: -Math.PI / 4 })
  b.deck('chance', DECKS, P([0.7, 0.7]), 16, { panel: '#d9772b', ink: '#ffffff', glyph: '?' }, info('Chance deck', '16 cards. Draw the top one when you land on a Chance space, do what it says, then return it to the bottom. A Get Out of Jail Free card is kept until you use it.'), { w: 1.3, d: 2, rotY: -Math.PI / 4, delay: 0.3 })
  BILLS.forEach(([v, color], i) =>
    b.deck(`bank-${i}`, BANKER, [13.4 + (i % 4) * 1.5, 0, i < 4 ? -3.2 : -1.6], 30, { bg: color, border: '#5a6b5a', glyph: v }, info(`Bank: ${v} bills`, 'The bank never runs out of money: if it does, the banker may write IOUs on paper.'), { w: 1.3, d: 0.7, delay: i * 0.08 }),
  )
  b.deck('deeds', BANKER, [13.6, 0, 0.6], 28, { bg: '#fbf6ea', border: '#2b241c', title: 'TITLE DEED', glyph: '⌂' }, info('Title deeds', '28 cards, one per property. When you buy a property you take its deed, which lists the rent.'), { delay: 0.6 })
  b.box('houses', BANKER, [15.3, 0, 0.4], 1.4, 0.4, 1, '#2e9e5b', info('Houses', '32 green houses. Once you own a whole color group you can buy houses for it, built evenly across the group, to raise the rent.'), { delay: 0.7 })
  b.box('hotels', BANKER, [17, 0, 0.4], 1.2, 0.5, 1, '#c0392b', info('Hotels', '12 red hotels. Once every property in a group has four houses, pay the hotel price and return a property’s four houses to swap them for one hotel.'), { delay: 0.8 })
  const cash = S.map((s) =>
    b.deck(`cash-${s.i}`, MONEY, s.at(-0.9, 0, 0), 16, { bg: '#f0d7a0', border: '#5a6b5a', glyph: '$1,500' }, info(`${s.whose} money`, 'Every player starts with $1,500. Keep it in front of you where everyone can see it.'), { w: 1.5, d: 0.8, rotY: s.rot, delay: s.i * 0.12 }),
  )
  const spot = (space: number, k: number): V3 => P(ringCenter(space), BH, ((k % 4) - 1.5) * 0.3, (k < 4 ? -0.2 : 0.25))
  const tokens = S.map((s) => b.pawn(`token-${s.i}`, TOKENS, spot(0, s.i), COLORS[s.i], info(`${s.whose} token`, 'Marks where you are on the track. Everyone starts on GO.'), { delay: s.i * 0.12, scale: 0.55 }))
  const dice = [0, 1].map((k) => b.die(`die-${k}`, DICE, [-2.2 + k * 0.7, BH, 1.6 + k * 0.4], 3 + k, info('Dice', 'Roll both and add them up. Doubles earn you another turn, but three doubles in a row send you to Jail.'), { delay: k * 0.1 }))
  const roll = (step: number, a: number, c: number) =>
    [a, c].forEach((v, k) => dice[k].keys.push({ step, pos: [-1.6 + k * 1.1, BH, 0.6 - k * 0.5], rotY: k + step, props: { value: v }, delay: 0.2 + k * 0.1 }))

  const T1 = b.t('Roll and move', 'You roll a 4 and a 2, so you move your token 6 spaces clockwise from GO.', look(0, 4.2, 8), 7)
  roll(T1, 4, 2)
  tokens[0].keys.push({ step: T1, pos: spot(6, 0), delay: 1.6 })
  const T2 = b.t('Buy the property', 'Nobody owns the light-blue property you landed on, so you pay the bank its price and take the title deed. If you don’t want it, the banker must auction it.', look(0, 6, 8), 7)
  cash[0].keys.push({ step: T2, pos: cash[0].keys[0].pos, rotY: S[0].rot, props: { count: 14, face: { bg: '#f0d7a0', border: '#5a6b5a', glyph: '$1,400' } } })
  b.add({ id: 'deed-1', kind: 'card', spawnFrom: [13.6, 0.4, 0.6], props: { w: 0.9, d: 1.26, faceUp: true, face: { bg: '#fbf6ea', panel: '#9ed3ee', ink: '#2b241c', title: 'TITLE DEED', sub: 'Rent $6' } }, keys: [{ step: T2, pos: S[0].at(0.9, 0, 0), delay: 0.8 }], info: info('Your title deed', 'Proof that you own this property. Anyone else who lands on it pays you the rent shown.') })
  const T3 = b.t('Next player rolls', 'The player on your left rolls a 3 and a 4 and moves 7 spaces to a Chance space.', look(0, 4.2, 8), 7)
  roll(T3, 3, 4)
  tokens[1].keys.push({ step: T3, pos: spot(7, 1), delay: 1.6 })
  b.t('Draw a card', 'They take the top Chance card, follow its instructions, and slide it back under the deck.', look(2.2, 2.2, 6))
  b.t('Rent, GO and doubles', 'Land on someone else’s property and you pay them rent; pass GO to collect $200; roll doubles to go again.', OVER)
  b.t('Last player standing', 'Collect color groups, build houses and hotels, and bankrupt everyone else to win.', WIDE)
  return b.done({ w: 40, d: 23 })
}

export const monopoly = game('monopoly', 'Monopoly', [2, 8], 4, '60–180 min', 'Medium', 'Buy property and bankrupt your rivals.', ['#d3e8d6', '#d63031', '#2c4fa3'], build)
