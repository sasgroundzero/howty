/** Risk: 42 territories, armies for every player, a deck of 44 cards and five dice. */
import type { V3 } from '../../engine/types'
import { BH, COLORS, Kit, NAMES, WIDE, cam, game, info, look, onBoard, seats } from './kit'
import { TERRITORIES } from './layouts'

const START: Record<number, number> = { 2: 40, 3: 35, 4: 30, 5: 25, 6: 20 }
function build(n: number) {
  const b = new Kit()
  const P = onBoard(15, 9.6)
  const S = seats(n, 10.6, 8)
  const owners = n === 2 ? 3 : n
  const tint = (o: number) => (n === 2 && o === 2 ? '#8d8d92' : COLORS[o])
  const MAP = cam(0, 16, 10.5, 0, 0, 0.2)
  const NA = look(-5.6, -1.6, 8)
  const BOARD = b.s('Unfold the map', 'Lay the world map in the middle of the table: it shows 42 territories grouped into 6 continents.', MAP, undefined, ['1 board'])
  const ARMIES = b.s('Count out your armies', `Each player picks a color and counts out ${START[n]} armies${n === 2 ? ', and a third "neutral" color gets 40 as well' : ''}.`, WIDE, 'The fewer the players, the more armies each: 35 for three players, 30 for four, 25 for five and 20 for six.', [`${START[n]} armies each`])
  const CLAIM = b.s('Claim the territories', n === 2 ? 'Remove the 2 wild cards and deal the 42 territory cards into three piles of 14: yours, your opponent’s and neutral. Put one army of that color on each territory in each pile.' : 'Roll to see who starts, then take turns placing one army on any empty territory until all 42 are claimed.', MAP, 'A territory belongs to whoever has armies on it.', ['42 armies in total'])
  const FORT = b.s('Reinforce', n === 2 ? 'Take turns placing 2 of your armies on territories you own, then 1 neutral army on any neutral territory, until all starting armies are placed.' : 'Keep taking turns adding one army at a time to territories you already own until everyone’s starting armies are placed.', MAP, 'Every territory must always have at least one army on it.')
  const CARDS = b.s('Shuffle the cards', 'Shuffle the deck of 42 territory cards and 2 wild cards and place it face down by the board.', look(2.2, 2.9, 6), 'If your edition includes mission cards, remove them for the classic world-conquest game.', ['44 cards'])
  const DICE = b.s('Get the dice ready', 'Put the 3 red attack dice and the 2 white defense dice within everyone’s reach.', look(-5, 6, 6), undefined, ['3 red dice', '2 white dice'])
  b.s('Ready to play', 'You are set up: the player who placed the first army takes the first turn.', WIDE, 'Each turn you get new armies, attack if you want to, then fortify. Eliminate every opponent to win.')

  b.board('board', BOARD, 15, 9.6, 'b:world', info('World map', '42 territories in 6 continents. Holding a whole continent earns bonus armies every turn. There is 1.'), { edge: '#2c5a78' })
  const left = START[n] - Math.ceil(42 / owners)
  S.forEach((s) => b.box(`reserve-${s.i}`, ARMIES, s.at(0, 0, 0), 1.3, 0.5, 0.9, COLORS[s.i], info(`${s.whose} armies`, `${NAMES[s.i]} starts with ${START[n]} armies. About ${left} are left to place as reinforcements once the territories are claimed.`), { rotY: s.rot, delay: s.i * 0.12 }))
  const army = (id: string, step: number, pos: V3, o: number, delay: number, from?: V3) =>
    b.add({ id, kind: 'block', spawnFrom: from, props: { w: 0.3, h: 0.34, d: 0.3, color: tint(o) }, keys: [{ step, pos, delay }], info: info(`${n === 2 && o === 2 ? 'Neutral' : NAMES[o]} army`, 'One infantry piece is one army. Cavalry pieces are worth 5 and artillery 10 when you need to make change.') })
  const first = TERRITORIES.map((uv, i) => army(`army-${i}`, CLAIM, P(uv), i % owners, i * 0.05))
  TERRITORIES.forEach((uv, i) => i % 3 === 0 && army(`extra-${i}`, FORT, P(uv, BH, 0.36, 0.1), i % owners, i * 0.04))
  b.deck('cards', CARDS, P([0.645, 0.8]), 44, { panel: '#2c5a78', border: '#e3c15a', ink: '#e3c15a', glyph: '✪' }, info('Risk cards', '42 territory cards and 2 wilds. You earn one at the end of any turn in which you conquered a territory, and trade sets of three for extra armies.'))
  const dice = [0, 1, 2, 3, 4].map((k) => b.die(`die-${k}`, DICE, [-6 + k * 0.7, 0, 5.9], 3, info(k < 3 ? 'Attack die' : 'Defense die', k < 3 ? 'The attacker rolls up to 3 red dice, one per attacking army, and must have at least one more army in the territory than dice rolled.' : 'The defender rolls up to 2 white dice, but needs at least 2 armies in the territory to roll 2.'), k < 3 ? { color: '#c0392b', ink: '#ffffff', delay: k * 0.08 } : { delay: k * 0.08 }))

  const home = P(TERRITORIES[0])
  const T1 = b.t('Collect new armies', 'Count your territories, divide by three, and take that many new armies (never fewer than 3), plus a bonus for any continent you hold, to place on your territories.', NA, 7)
  const fresh = [0, 1, 2].map((k) => army(`new-${k}`, T1, [home[0] - 0.36 + k * 0.36, BH, home[2] + 0.4], 0, 0.5 + k * 0.25, S[0].at(0, 0.5, 0)))
  const T2 = b.t('Attack a neighbor', 'You attack the territory next door: you roll 3 red dice for your 3 attacking armies, and the defender rolls 1 white die.', NA, 8)
  ;[6, 4, 2].forEach((v, k) => dice[k].keys.push({ step: T2, pos: [-8.4, 0, -2.6 + k * 0.7], rotY: k, props: { value: v }, delay: 0.4 + k * 0.1 }))
  dice[3].keys.push({ step: T2, pos: [-8.4, 0, 0.2], rotY: 2, props: { value: 5 }, delay: 0.8 })
  const T3 = b.t('Highest dice decide', 'Compare the highest die on each side: your 6 beats their 5, so the defender loses an army. Ties go to the defender.', NA, 7)
  first[1].keys.push({ step: T3, pos: first[1].keys[0].pos, hide: true, delay: 0.8 })
  const T4 = b.t('Move in', 'The territory is empty, so you conquer it and must move in at least as many armies as the dice you rolled.', NA, 7)
  const there = P(TERRITORIES[1])
  fresh.forEach((a, k) => a.keys.push({ step: T4, pos: [there[0] - 0.36 + k * 0.36, BH, there[2]], delay: 0.4 + k * 0.2 }))
  b.t('Fortify and draw a card', 'Take a card for conquering, then end your turn with one optional move of armies from one of your territories into one adjacent territory you own.', MAP)
  b.t('Conquer the world', 'Play passes to the left: keep going until one player holds all 42 territories.', MAP)
  return b.done({ w: 40, d: 23 })
}

export const risk = game('risk', 'Risk', [2, 6], 4, '2–4 hours', 'Medium', 'Deploy armies and conquer the world.', ['#9cc7e0', '#c0392b', '#e3c15a'], build)
