/** Othello / Reversi: 64 two-sided discs, four in the middle to start. */
import { Kit, OVER, TOP, cells, game, info, look } from './kit'
import { SQ8, sqSize } from './layouts'

const BLACK = '#22201f'
const WHITE = '#f4f1e8'
function build() {
  const b = new Kit()
  const grid = cells(8, 8, SQ8.cell)
  /** Row 1 is the far side, as in the published diagrams. */
  const g = (c: number, r: number) => grid(c, 7 - r)
  const size = sqSize(SQ8.n, SQ8.cell, SQ8.margin)
  const MID = look(0, 0, 7)
  const BOARD = b.s('Place the board', 'Set the green 8 by 8 board between the two players.', OVER, undefined, ['1 board'])
  const SPLIT = b.s('Share out the discs', 'Split the 64 discs evenly so each player has 32, and decide who plays Black and who plays White.', OVER, 'Every disc is black on one side and white on the other.', ['64 discs'])
  const W = b.s('White’s two discs', 'Place two discs white side up on the middle squares d4 and e5, touching corner to corner.', MID, undefined, ['2 discs'])
  const B = b.s('Black’s two discs', 'Place two discs black side up on the other two middle squares, d5 and e4, to finish the square.', MID, undefined, ['2 discs'])
  b.s('Ready to play', 'You are set up: Black moves first, and each player has 30 discs left to place.', OVER, 'If you cannot flip a disc you pass. If you run out of discs while you can still move, your opponent gives you one. Whoever has more discs showing their color when neither player can move wins.')

  b.board('board', BOARD, size, size, 'b:othello', info('Board', '64 squares. Columns are a to h from the left, rows are 1 to 8 from the far side. There is 1.'), { edge: '#1f2a22' })
  for (const side of [0, 1])
    for (let k = 0; k < 5; k++)
      b.disc(`supply-${side}-${k}`, SPLIT, [(side ? -1 : 1) * 6.4, 0, (side ? -1 : 1) * (3.2 - k * 1.05)], 0.46, 0.9, side ? WHITE : BLACK,
        info(`${side ? 'White' : 'Black'}’s discs`, 'A stack of 6 discs. Each player starts with 32 and has 30 left after the opening four are placed.'), { delay: k * 0.1 + side * 0.3 })
  const disc = (id: string, step: number, c: number, r: number, color: string, delay = 0) =>
    b.add({ id, kind: 'token', props: { r: 0.48, h: 0.14, color }, keys: [{ step, pos: g(c, r), delay }], info: info('Disc', 'Black on one side, white on the other. Trap a row of enemy discs between two of yours and they all flip to your color.') })
  const d4 = disc('d4', W, 3, 3, WHITE)
  disc('e5', W, 4, 4, WHITE, 0.25)
  disc('d5', B, 3, 4, BLACK)
  disc('e4', B, 4, 3, BLACK, 0.25)

  const T1 = b.t('Black plays d3', 'Black places a disc so that a white disc is trapped in a straight line between it and another black disc.', MID)
  disc('d3', T1, 3, 2, BLACK, 0.5)
  d4.keys.push({ step: b.t('Flip the trapped disc', 'The white disc on d4 is now sandwiched between two black ones, so it flips over to black.', MID), pos: g(3, 3), props: { color: BLACK }, delay: 0.5 })
  const T3 = b.t('White plays c3', 'White answers on c3, trapping the disc on d4 along the diagonal that ends at White’s e5.', MID)
  disc('c3', T3, 2, 2, WHITE, 0.5)
  d4.keys.push({ step: b.t('It flips back', 'That same disc flips back to white: discs can change sides many times in one game.', MID), pos: g(3, 3), props: { color: WHITE }, delay: 0.5 })
  b.t('You must flip to move', 'Every move has to flip at least one disc; if you cannot, you pass and your opponent goes again.', TOP)
  b.t('Count the colors', 'When neither player can move, count the discs: the color with the most showing wins.', OVER)
  return b.done({ w: 30, d: 21 })
}

export const othello = game('othello', 'Othello', [2, 2], 2, '20–30 min', 'Easy', 'Trap and flip discs to own the board.', ['#2f8a57', '#22201f', '#f4f1e8'], build)
