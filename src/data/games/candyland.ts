/** Candy Land: a winding rainbow path, a deck of color cards and one pawn each. */
import type { V3 } from '../../engine/types'
import { SWEET } from '../../components/pieces/boardArt'
import { BH, COLORS, Kit, OVER, game, info, look, onBoard } from './kit'
import { CANDY_PATH } from './layouts'

const HUE = ['red', 'purple', 'yellow', 'blue', 'orange', 'green']
function build(n: number) {
  const b = new Kit()
  const P = onBoard(13, 8.6)
  const START = look(-5, 3.4, 6)
  const DECK = look(8.6, 0, 6)
  const BOARD = b.s('Open the board', 'Lay the board flat where every player can reach it: the path winds from the start in one corner up to the castle.', OVER, undefined, ['1 board'])
  const CARDS = b.s('Shuffle the cards', 'Shuffle the deck of color cards and place it face down beside the board.', DECK, 'Most cards show one or two colored squares; a few show a picture of a special space on the path.', ['1 deck of cards'])
  const PAWNS = b.s('Pawns on the start', 'Each player picks a pawn and puts it on the start space.', START, undefined, [`${n} pawns`])
  b.s('Ready to play', 'You are set up: the youngest player goes first, and play passes to the left.', OVER, 'There is no reading needed: just match colors. First to reach the rainbow space by the castle wins.')

  b.board('board', BOARD, 13, 8.6, 'b:candy', info('Game board', 'A single path of colored squares that repeats six colors, from the start to the castle. There is 1.'), { edge: '#d9539a' })
  const deck = b.deck('deck', CARDS, [8.6, 0, -0.8], 64, { panel: '#f7a8c8', border: '#ffffff', ink: '#ffffff', glyph: '♥' }, info('Card deck', 'Draw one card on your turn, move as it shows, then put it on a discard pile. Reshuffle the discards if the deck runs out.'))
  const spot = (i: number, k: number): V3 => P(CANDY_PATH[i], BH, (k % 2 ? 0.2 : -0.2), k < 2 ? -0.18 : 0.2)
  const pawns = Array.from({ length: n }, (_, k) => b.pawn(`pawn-${k}`, PAWNS, spot(0, k), COLORS[k], info(`${k === 0 ? 'Your' : `Player ${k + 1}’s`} pawn`, 'Moves forward along the path to the next space matching the card you draw.'), { delay: k * 0.15, scale: 0.6 }))
  const draw = (id: string, step: number, face: object, body: string, slot: number) =>
    b.add({ id, kind: 'card', spawnFrom: [8.6, 0.8, -0.8], props: { w: 0.9, d: 1.26, faceUp: true, face }, keys: [{ step, pos: [8.6 + slot * 0.08, 0.02 * slot, 1 + slot * 0.06], delay: 0.4 }], info: info('Card drawn', body) })

  const T1 = b.t('Draw a card', 'You turn over the top card: it shows a single blue square.', DECK)
  draw('c1', T1, { bg: '#ffffff', panel: SWEET[3] }, 'One blue square: move to the next blue space.', 0)
  deck.keys.push({ step: T1, pos: [8.6, 0, -0.8], props: { count: 63 } })
  pawns[0].keys.push({ step: b.t('Move to that color', 'You move your pawn forward to the first blue space ahead of it on the path.', START), pos: spot(4, 0), delay: 0.5 })
  const T3 = b.t('Next player draws a double', 'The next player turns over a card with two red squares.', DECK)
  draw('c2', T3, { bg: '#ffffff', panel: SWEET[0], glyph: '2×' }, 'Two red squares: move to the second red space ahead.', 1)
  pawns[1].keys.push({ step: b.t('Jump two of that color', 'With a double card they skip the first red space and move on to the second one.', START), pos: spot(7, 1), delay: 0.5 })
  b.t('Picture cards, shortcuts and licorice', 'A picture card sends you to the pink space with that picture, forward or back. Land exactly on a shortcut space and you may take the shortcut; land on a licorice space and you miss your next turn.', OVER, 7)
  b.t('First to the castle wins', 'Keep drawing and moving in turn: the first pawn to reach the rainbow space at the castle wins.', look(4, -3, 7))
  void HUE
  return b.done({ w: 32, d: 20 })
}

export const candyland = game('candy-land', 'Candy Land', [2, 4], 4, '15–20 min', 'Easy', 'Match colors along the path to the castle.', ['#f7a8c8', '#f1c40f', '#2e6fb7'], build)
