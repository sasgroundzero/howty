/** Chess: 16 men a side on an 8x8 board. */
import type { KindProps, PieceSpec } from '../../engine/types'
import { BH, Kit, OVER, TOP, cells, game, info, look } from './kit'
import { SQ8, sqSize } from './layouts'

type Man = KindProps['chess']['type']
const BACK: Man[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
const ABOUT: Record<Man, string> = {
  rook: 'Moves any distance along a row or column. Each side has 2, in the corners.',
  knight: 'Moves in an L (two squares then one sideways) and can jump over pieces. Each side has 2.',
  bishop: 'Moves any distance diagonally and stays on one color all game. Each side has 2.',
  queen: 'Moves any distance in any direction. Each side has 1, and she starts on her own color.',
  king: 'Moves one square in any direction, or castles once with a rook. Trap the enemy king to win. Each side has 1.',
  pawn: 'Moves one square forward (two on its first move) and captures diagonally (en passant too). On the far rank it becomes a queen, rook, bishop or knight. Each side has 8.',
}

function build() {
  const b = new Kit()
  const g = cells(8, 8, SQ8.cell)
  const size = sqSize(SQ8.n, SQ8.cell, SQ8.margin)
  const NEARF = look(0, 3.6, 8)
  const BOARD = b.s('Place the board', 'Set the board between you so that each player has a light square in their near-right corner.', OVER, '"Light on right" is the quick check that the board is the right way round.', ['1 board'])
  const ROOKS = b.s('Rooks in the corners', 'Each player puts their 2 rooks on the two corner squares of their back row.', OVER, undefined, ['2 rooks each'])
  const KNIGHTS = b.s('Knights next to the rooks', 'Put your 2 knights on the squares beside the rooks.', NEARF, undefined, ['2 knights each'])
  const BISHOPS = b.s('Bishops next to the knights', 'Put your 2 bishops beside the knights, leaving the two middle squares empty.', NEARF, undefined, ['2 bishops each'])
  const QUEENS = b.s('Queen on her own color', 'Place the queen on the middle square that matches her color: white queen on light, black queen on dark.', NEARF, 'The two queens end up facing each other on the same file.', ['1 queen each'])
  const KINGS = b.s('King beside the queen', 'The king takes the last empty square of the back row, next to the queen.', NEARF, undefined, ['1 king each'])
  const PAWNS = b.s('Line up the pawns', 'Fill the whole row in front of your pieces with your 8 pawns.', OVER, undefined, ['8 pawns each'])
  b.s('Ready to play', 'You are set up: White always moves first, then players alternate one move at a time.', OVER, 'Each side starts with 16 men. Checkmate the enemy king to win.')
  const stepOf: Record<Man, number> = { rook: ROOKS, knight: KNIGHTS, bishop: BISHOPS, queen: QUEENS, king: KINGS, pawn: PAWNS }

  b.board('board', BOARD, size, size, 'b:chess', info('Chessboard', '64 squares in an 8 by 8 grid. Columns are files a to h, rows are ranks 1 to 8. There is 1.'), { edge: '#4a3423' })
  const men = new Map<string, PieceSpec<'chess'>>()
  for (const white of [true, false])
    for (let c = 0; c < 8; c++)
      for (const pawn of [false, true]) {
        const type = pawn ? 'pawn' : BACK[c]
        const r = white ? (pawn ? 1 : 0) : pawn ? 6 : 7
        const sq = `${'abcdefgh'[c]}${r + 1}`
        men.set(sq, b.add({
          id: sq, kind: 'chess',
          props: { type, color: white ? '#f1e7d0' : '#3a302b' },
          keys: [{ step: stepOf[type], pos: g(c, r), rotY: white ? 0 : Math.PI, delay: (pawn ? c * 0.08 : 0) + (white ? 0 : 0.4) }],
          info: info(`${white ? 'White' : 'Black'} ${type}`, ABOUT[type]),
        }))
      }
  const move = (from: string, to: [number, number], step: number) => {
    const m = men.get(from)!
    m.keys.push({ step, pos: g(to[0], to[1]), rotY: m.keys[0].rotY, delay: 0.6 })
  }
  move('e2', [4, 3], b.t('White opens', 'White moves the king’s pawn two squares forward, which a pawn may do only on its first move.', TOP))
  move('e7', [4, 4], b.t('Black replies', 'Black answers by pushing their own king’s pawn two squares to meet it.', TOP))
  move('g1', [5, 2], b.t('A knight jumps out', 'White’s knight hops over the pawns in an L shape and now attacks Black’s pawn.', look(1.5, 1.5, 9)))
  move('b8', [2, 5], b.t('Black defends', 'Black brings out a knight of their own to protect the pawn.', look(-1.5, -1.5, 10)))
  b.t('Capturing and check', 'You capture by moving onto an enemy piece’s square, and a king under attack is "in check" and must escape at once.', OVER)
  b.t('Checkmate wins', 'Keep developing your pieces: you win when the enemy king is in check and has no way out. No legal move without being in check is stalemate, a draw.', OVER)
  void BH
  return b.done({ w: 30, d: 21 })
}

export const chess = game('chess', 'Chess', [2, 2], 2, '10–60 min', 'Hard', 'Trap the enemy king with 16 men each.', ['#8a5a3c', '#f0dcb8', '#3a302b'], build)
