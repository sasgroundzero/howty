/** Connect 4: an upright 7x6 grid and 21 discs a side. */
import type { V3 } from '../../engine/types'
import { Kit, cam, game, info } from './kit'

const RED = '#d63031'
const YEL = '#f6d32d'
function build() {
  const b = new Kit()
  const slot = (c: number, r: number): V3 => [c - 3, 0.3 + r + 0.08, 0]
  const FRONT = cam(0, 9.5, 17, 0, 2, 0)
  const SIDE = cam(9, 11, 16, 0, 2, 0)
  const FRAME = b.s('Stand the grid up', 'Stand the grid upright between the two players and make sure the release bar at the bottom is closed.', FRONT, 'The grid has 7 columns, and each column holds 6 discs.', ['1 grid'])
  const DISCS = b.s('Pick a color', 'One player takes all 21 red discs and the other takes all 21 yellow discs.', SIDE, undefined, ['21 red discs', '21 yellow discs'])
  b.s('Ready to play', 'You are set up: the youngest player goes first, then take turns dropping one disc into any column that is not full.', FRONT, 'Line up four of your own discs in a row (across, up and down, or diagonally) to win.')

  b.add({ id: 'frame', kind: 'c4frame', props: { cols: 7, rows: 6, cell: 1, color: '#2456b8' }, keys: [{ step: FRAME, pos: [0, 0, 0] }], info: info('Grid', 'An upright rack with 7 columns of 6 slots, 42 in all. Discs dropped in the top fall to the lowest empty slot. There is 1.') })
  const loose: ReturnType<Kit['add']>[][] = [[], []]
  for (const s of [0, 1]) {
    const color = s ? YEL : RED
    const z = s ? -3.4 : 3.4
    ;[6, 6, 5].forEach((n, k) =>
      b.disc(`pile-${s}-${k}`, DISCS, [(s ? -1 : 1) * (2.2 + k * 1), 0, z], 0.42, n * 0.14, color, info(`${s ? 'Yellow' : 'Red'} discs`, `A stack of ${n}. Each player has 21 discs, exactly enough to fill half the grid.`), { delay: k * 0.12 + s * 0.3 }),
    )
    for (let k = 0; k < 4; k++)
      loose[s].push(b.add({
        id: `disc-${s}-${k}`, kind: 'token', props: { r: 0.42, h: 0.14, color },
        keys: [{ step: DISCS, pos: [(s ? 1 : -1) * (1.2 + k * 0.95), 0, z], delay: 0.4 + k * 0.1 + s * 0.3 }],
        info: info(`${s ? 'Yellow' : 'Red'} disc`, 'Drop one disc per turn. It falls to the lowest empty slot in the column you choose.'),
      }))
  }
  const drop = (s: number, k: number, c: number, r: number, step: number) =>
    loose[s][k].keys.push({ step, pos: slot(c, r), props: { upright: true }, delay: 0.6 })
  drop(0, 0, 3, 0, b.t('Red drops first', 'Red drops a disc into the middle column, and it falls all the way to the bottom row.', FRONT))
  drop(1, 0, 3, 1, b.t('Yellow stacks on top', 'Yellow picks the same column, so the yellow disc lands on top of the red one.', FRONT))
  drop(0, 1, 4, 0, b.t('Red builds a row', 'Red drops a disc beside their first one and now has two in a row along the bottom.', FRONT))
  drop(1, 1, 2, 0, b.t('Yellow blocks', 'Yellow drops into the column on the other side to stop the row from growing that way.', FRONT))
  drop(0, 2, 5, 0, b.t('Three in a row', 'Red adds a third disc: one more on the open end would make four, so Yellow must block it next turn.', FRONT))
  b.t('Four in a row wins', 'The first player to line up four discs in any direction wins. The winner slides the bar to empty the grid for the next game.', SIDE)
  return b.done({ w: 24, d: 18 })
}

export const connect4 = game('connect4', 'Connect 4', [2, 2], 2, '10 min', 'Easy', 'Drop discs to line up four in a row.', ['#2456b8', '#d63031', '#f6d32d'], build)
