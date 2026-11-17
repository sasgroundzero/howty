/** Mancala (Kalah): 12 pits, 2 stores and 48 stones, four to a pit. */
import type { PieceSpec, V3 } from '../../engine/types'
import { BH, Kit, cam, game, info } from './kit'
import { PITS, pitXZ, storeXZ } from './layouts'

const GEMS = ['#3f86b8', '#d9584a', '#e0b12f', '#3d8b4a']
function build() {
  const b = new Kit()
  const ALL = cam(0, 11, 9.5, 0, 0, 0.2)
  const MINE = cam(0, 7, 7.5, 0, 0, 0.8)
  const BOARD = b.s('Place the board', 'Set the board lengthwise between you, so each player has a row of 6 small pits in front of them.', ALL, undefined, ['1 board'])
  const STORES = b.s('Find your store', 'The large pit at the end on your right is your store (your mancala); the one on your left belongs to your opponent.', ALL, 'Stones in a store are safe and count as points.')
  const NEAR = b.s('Four stones in each of your pits', 'Drop 4 stones into each of the 6 small pits on your side.', MINE, 'The colors of the stones do not matter.', ['24 stones'])
  const FAR = b.s('Your opponent does the same', 'Your opponent puts 4 stones into each of their 6 pits, so all 48 stones are on the board.', ALL, undefined, ['24 stones'])
  b.s('Ready to play', 'You are set up: both stores start empty. Decide who goes first.', ALL, 'Whoever has the most stones in their store at the end wins.')

  b.board('board', BOARD, PITS.w, PITS.d, 'b:pits', info('Mancala board', 'Two rows of 6 pits with a long store at each end. There is 1.'), { edge: '#7a4f28' })
  for (const s of [0, 1])
    b.add({ id: `store-${s}`, kind: 'mat', props: { w: 1.7, d: 0.6, color: '#f3ead8', label: s ? 'OPPONENT’S STORE' : 'YOUR STORE', ink: '#3a2c20' }, keys: [{ step: STORES, pos: [storeXZ(s)[0] * 1.02, 0, s ? -2.5 : 2.5], delay: s * 0.3 }], info: info(s ? 'Opponent’s store' : 'Your store', 'The big pit on a player’s right. Stones you sow here are scored and never move again.') })
  /** Where the k-th stone in a pit or store rests. */
  const rest = (xz: [number, number], k: number, store = false): V3 =>
    store ? [xz[0] + ((k % 2) - 0.5) * 0.4, BH, xz[1] - 1 + Math.floor(k / 2) * 0.4] : [xz[0] + (k % 2 ? 0.2 : -0.2) * (k < 4 ? 1 : 0), BH + (k < 4 ? 0 : 0.13), xz[1] + (k % 4 < 2 ? -0.2 : 0.2) * (k < 4 ? 1 : 0)]
  const pits: PieceSpec<'token'>[][][] = [[], []]
  for (const s of [0, 1])
    for (let i = 0; i < 6; i++) {
      pits[s][i] = []
      for (let k = 0; k < 4; k++)
        pits[s][i].push(b.add({
          id: `stone-${s}-${i}-${k}`, kind: 'token',
          props: { r: 0.17, h: 0.13, color: GEMS[(i + k + s) % 4] },
          keys: [{ step: s ? FAR : NEAR, pos: rest(pitXZ(s, i), k), delay: i * 0.18 + k * 0.05 }],
          info: info('Stone', 'One of 48. Each of the 12 small pits starts with 4.'),
        }))
    }
  let stored = 0
  /** Picks up every stone in one of your pits and sows them one by one, counter-clockwise. */
  const sow = (from: number, step: number) => {
    const hand = pits[0][from].splice(0)
    let s = 0
    let i = from
    hand.forEach((stone, k) => {
      i++
      if (i === 6 && s === 0) {
        stone.keys.push({ step, pos: rest(storeXZ(0), stored++, true), delay: 0.5 + k * 0.45 })
        s = 1
        i = -1
        return
      }
      pits[s][i].push(stone)
      stone.keys.push({ step, pos: rest(pitXZ(s, i), pits[s][i].length - 1), delay: 0.5 + k * 0.45 })
    })
  }
  sow(2, b.t('Pick up a pit and sow', 'You scoop up all 4 stones from your third pit and drop them one at a time into the pits to its right.', MINE, 8))
  b.t('Last stone in your store', 'The fourth stone lands in your own store. That scores a point and earns you another turn.', cam(3.5, 6, 6, 3.6, 0, 0.3), 6)
  sow(5, b.t('Go again', 'You take the 5 stones from your last pit: one goes into your store and the rest carry on round into your opponent’s pits.', ALL, 8))
  b.t('Skip their store', 'You sow into your own store as you pass it, but you always skip your opponent’s store.', ALL)
  b.t('Capture across the board', 'If your last stone lands in an empty pit on your side, you capture it and everything in the pit directly opposite.', ALL, 7)
  b.t('Count your store', 'The game ends when one side’s six pits are empty; the other player keeps what is left on their side, and the bigger store wins.', ALL, 7)
  return b.done({ w: 24, d: 15 })
}

export const mancala = game('mancala', 'Mancala', [2, 2], 2, '10–20 min', 'Easy', 'Sow stones round the board into your store.', ['#a8713f', '#3f86b8', '#e0b12f'], build)
