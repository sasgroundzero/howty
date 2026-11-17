/** Checkers (draughts): 12 men a side on the dark squares. */
import type { PieceSpec } from '../../engine/types'
import { Kit, OVER, TOP, cells, game, info, look } from './kit'
import { SQ8, sqSize } from './layouts'

function build() {
  const b = new Kit()
  const g = cells(8, 8, SQ8.cell)
  const size = sqSize(SQ8.n, SQ8.cell, SQ8.margin)
  const BOARD = b.s('Place the board', 'Set the board between you so that each player has a dark square in their near-left corner.', OVER, 'All play happens on the 32 dark squares. The light squares are never used.', ['1 board'])
  const ROW = [
    b.s('Fill your back row', 'Each player places 4 checkers on the dark squares of the row nearest them.', OVER, undefined, ['4 checkers each']),
    b.s('Fill the second row', 'Place 4 more on the dark squares of your second row.', OVER, undefined, ['4 checkers each']),
    b.s('Fill the third row', 'Place your last 4 on the dark squares of your third row, for 12 checkers each.', OVER, undefined, ['4 checkers each']),
  ]
  b.s('Leave the middle open', 'The two middle rows stay empty: this is the gap the armies cross.', TOP)
  b.s('Ready to play', 'You are set up: the darker color moves first. Men move only diagonally forward, and if you can jump, you must.', OVER, 'Capture all of your opponent’s pieces, or leave them with no legal move, to win.')

  b.board('board', BOARD, size, size, 'b:checkers', info('Checkerboard', 'An 8 by 8 board. Only the 32 dark squares are used. There is 1.'), { edge: '#2f2620' })
  const men = new Map<string, PieceSpec<'token'>>()
  for (const near of [true, false])
    for (let k = 0; k < 3; k++) {
      const r = near ? k : 7 - k
      for (let c = 0; c < 8; c++)
        if ((c + r) % 2 === 0)
          men.set(`${c},${r}`, b.add({
            id: `man-${c}-${r}`, kind: 'token',
            props: { r: 0.46, h: 0.2, color: near ? '#2b2522' : '#b8352a' },
            keys: [{ step: ROW[k], pos: g(c, r), delay: c * 0.06 + (near ? 0 : 0.4) }],
            info: info(near ? 'Black checker' : 'Red checker', 'A single man moves one square diagonally forward, or jumps an enemy piece to capture it. Each player starts with 12. Reach the far row and it is crowned a king, which can also move backward.'),
          }))
    }
  const move = (from: string, c: number, r: number, step: number) => men.get(from)!.keys.push({ step, pos: g(c, r), delay: 0.6 })
  const take = (at: string, step: number) => men.get(at)!.keys.push({ step, pos: g(0, 0), hide: true, delay: 1.4 })
  const F = look(0.6, 0, 9)
  move('2,2', 3, 3, b.t('Black moves first', 'Black slides a checker one square diagonally forward onto an empty dark square.', F))
  move('5,5', 4, 4, b.t('Red answers', 'Red moves a checker diagonally forward too, and it ends up right next to Black’s.', F))
  const J = b.t('Black must jump', 'Black jumps over the red checker into the empty square behind it and removes it from the board.', F, 7)
  move('2,2', 5, 5, J)
  take('5,5', J)
  const J2 = b.t('Red jumps back', 'Jumps are compulsory, so Red now jumps the black checker and takes it off in return.', F, 7)
  move('6,6', 4, 4, J2)
  take('2,2', J2)
  b.t('Crown your kings', 'A checker that reaches the far row gets a second checker stacked on top and becomes a king that can move both ways. Crowning ends that turn.', OVER)
  b.t('Clear the board', 'Keep trading moves until one player has no pieces left, or no move they can make.', OVER)
  return b.done({ w: 30, d: 21 })
}

export const checkers = game('checkers', 'Checkers', [2, 2], 2, '15–30 min', 'Easy', 'Jump and capture all 12 enemy checkers.', ['#3f5f48', '#b8352a', '#2b2522'], build)
