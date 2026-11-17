/** Blokus: four colors, 21 polyomino pieces each, on a 20x20 grid. */
import type { PieceSpec } from '../../engine/types'
import { BH, Kit, TOP, WIDE, cells, game, info, look, seats } from './kit'
import { SQ20, sqSize } from './layouts'

const SHAPES: [number, number][][] = [
  [[0, 0]],
  [[0, 0], [1, 0]],
  [[0, 0], [1, 0], [2, 0]], [[0, 0], [1, 0], [0, 1]],
  [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]], [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1]],
  [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]], [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1]], [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]],
]
const TINT = ['#2e6fb7', '#e0b12f', '#c0392b', '#3d8b4a']
const NAME = ['Blue', 'Yellow', 'Red', 'Green']
/** Opening piece per color: [shape index, column, row] chosen so it covers that color's corner. */
const OPEN: [number, number, number][] = [[16, 0, 0], [2, 0, 19], [4, 16, 19], [7, 18, 0]]

function build(n: number) {
  const b = new Kit()
  const g = cells(20, 20, SQ20.cell)
  const size = sqSize(SQ20.n, SQ20.cell, SQ20.margin)
  const who = n === 4 ? 'Each player takes one color' : n === 3 ? 'Each player takes one color, and the players take turns playing the fourth color' : 'Each player takes two colors (blue and red against yellow and green)'
  const BOARD = b.s('Place the board', 'Put the 20 by 20 grid in the middle of the table where everyone can reach it.', WIDE, undefined, ['1 board'])
  const COLORS = b.s('Choose colors', `${who}: all four colors are always in play.`, WIDE, 'Each color has 21 pieces: one of every shape you can make from 1 to 5 squares.', ['4 sets of 21 pieces'])
  b.s('Check your 21 pieces', 'Lay your pieces out in front of you: 1 single square, 1 domino, 2 threes, 5 fours and 12 fives.', look(0, 7.6, 7), 'Together a color’s pieces cover 89 squares.')
  b.s('Ready to play', 'You are set up: play goes Blue, Yellow, Red, then Green, clockwise round the board.', WIDE, 'Fit as many of your squares onto the board as you can.')

  b.board('board', BOARD, size, size, 'b:blokus', info('Board', 'A grid of 400 squares. Each color starts from its own corner. There is 1.'), { edge: '#8d8d92' })
  const S = seats(4, 7.4, 7.4)
  const tiles: PieceSpec<'poly'>[][] = [[], [], [], []]
  S.forEach((seat, p) =>
    SHAPES.forEach((cellsOf, i) => {
      const row = Math.floor(i / 7)
      tiles[p].push(b.add({
        id: `tile-${p}-${i}`, kind: 'poly',
        props: { cells: cellsOf, size: 0.3, h: 0.1, color: TINT[p] },
        keys: [{ step: COLORS, pos: seat.at(((i % 7) - 3) * 1.6 - 0.5, 0, -0.9 + row * 1.15), rotY: seat.rot, delay: i * 0.04 + p * 0.25 }],
        info: info(`${NAME[p]} piece`, `Covers ${cellsOf.length} square${cellsOf.length > 1 ? 's' : ''}. Every color has the same 21 shapes, and each can be turned or flipped any way you like.`),
      }))
    }),
  )
  const play = (p: number, shape: number, c: number, r: number, step: number) =>
    tiles[p][shape].keys.push({ step, pos: g(c, r, BH), rotY: 0, props: { size: SQ20.cell }, delay: 0.6 })
  const corner = ['near-left', 'far-left', 'far-right', 'near-right']
  OPEN.forEach(([shape, c, r], p) =>
    play(p, shape, c, r, b.t(`${NAME[p]} starts in a corner`, `${NAME[p]}’s first piece must cover the ${corner[p]} corner square of the board.`, p === 0 || p === 3 ? look(p ? 3.5 : -3.5, 3.5, 8) : look(p === 1 ? -3.5 : 3.5, -3.5, 10), 5)),
  )
  play(0, 6, 3, 3, b.t('Corners touch, edges never', 'Every later piece must touch a corner of one of your own pieces, but may never share an edge with your own color.', look(-3.2, 3.2, 7), 8))
  b.t('Other colors are fair game', 'Your pieces may sit edge to edge with other colors, so use that to squeeze past and block your opponents.', TOP)
  b.t('Fewest squares left wins', 'When nobody can place another piece, count the squares in your unplayed pieces: the lowest total wins.', WIDE)
  return b.done({ w: 34, d: 25 })
}

export const blokus = game('blokus', 'Blokus', [2, 4], 4, '20–30 min', 'Easy', 'Fit your 21 pieces corner to corner.', TINT, build)
