/** Trivial Pursuit: a wheel-shaped track, six categories and a wedge to win in each. */
import type { V3 } from '../../engine/types'
import { WEDGE_COLORS } from '../../components/pieces/boardArt'
import { BH, COLORS, Kit, OVER, WIDE, game, info, look, onBoard, seats } from './kit'
import { wheelRim, wheelSpoke } from './layouts'

function build(n: number) {
  const b = new Kit()
  const P = onBoard(11, 11)
  const S = seats(n, 8.8, 8)
  const HUB = look(0, 0, 6)
  const BOARD = b.s('Place the board', 'Put the wheel-shaped board in the middle of the table.', OVER, 'Six spokes run from the hub in the center out to six large wedge spaces on the rim.', ['1 board'])
  const BOXES = b.s('Set out the question cards', 'Put the boxes of question cards beside the board where every player can reach them.', look(-8, 0, 7), 'Each card has one question for each of the six colored categories, with the answers on the back.', ['2 card boxes'])
  const PIECES = b.s('Choose a playing piece', 'Each player takes an empty round playing piece and places it on the hub.', HUB, 'The piece has six slots, one for a wedge of each color.', [`${n} playing pieces`])
  const WEDGES = b.s('Sort the wedges', 'Keep the small scoring wedges in a pile by the board, sorted by color.', look(8, 0, 7), 'You earn a wedge by answering correctly on that color’s large wedge space.', ['Wedges in 6 colors'])
  const DIE = b.s('Roll to see who starts', 'Everyone rolls the die: the highest roll goes first, and play passes to the left.', OVER, undefined, ['1 die'])
  b.s('Ready to play', 'You are set up: on your turn, roll the die and move that many spaces in any direction.', OVER, 'Collect one wedge of every color, then return to the hub for a final question.')

  b.board('board', BOARD, 11, 11, 'b:wheel', info('Game board', 'A circular track with six spokes. The six big spaces on the rim are where wedges are won. There is 1.'), { edge: '#20324a' })
  for (const k of [0, 1])
    b.deck(`cards-${k}`, BOXES, [-8, 0, -1.4 + k * 2.8], 120, { panel: '#20324a', border: '#e0b12f', ink: '#e0b12f', glyph: '?' }, info('Question card box', 'Draw from the front and return used cards to the back. The player to your right usually reads your question.'), { w: 1.1, d: 1.7, delay: k * 0.2 })
  const hub = (i: number): V3 => [Math.cos((i * Math.PI * 2) / n) * 0.36, BH, Math.sin((i * Math.PI * 2) / n) * 0.36]
  const pieces = S.map((s) => b.disc(`piece-${s.i}`, PIECES, n === 1 ? [0, BH, 0] : hub(s.i), 0.26, 0.2, COLORS[s.i], info(`${s.whose} playing piece`, 'Holds up to six wedges. It starts empty on the hub.'), { delay: s.i * 0.15 }))
  WEDGE_COLORS.forEach((color, i) => b.box(`wedges-${i}`, WEDGES, [7.4 + (i % 2) * 1.1, 0, -1.6 + Math.floor(i / 2) * 1.5], 0.8, 0.3, 0.8, color, info('Wedges', 'One pile per category color. Take a wedge when you answer correctly on the matching wedge space.'), { delay: i * 0.1 }))
  const die = b.die('die', DIE, [-3.4, 0, 6.6], 4, info('Die', 'Roll and move exactly that many spaces. You may go in any direction but cannot double back in one move.'))

  const far = (j: number) => P(wheelSpoke(0, j))
  const T1 = b.t('Roll and move', 'You roll a 3 and move three spaces out along one of the spokes.', HUB, 7)
  die.keys.push({ step: T1, pos: [2.2, BH, 2.6], rotY: 1.2, props: { value: 3 } })
  pieces[0].keys.push({ step: T1, pos: far(3), delay: 1.4 })
  b.t('Answer a question', 'Another player draws a card and asks you the question whose color matches the space you landed on.', look(0, -2, 7), 7)
  const T3 = b.t('Correct: roll again', 'You answer correctly, so you roll again: another 3 takes you to the big wedge space at the end of the spoke.', look(0, -3, 7), 7)
  die.keys.push({ step: T3, pos: [2.6, BH, 1.8], rotY: 2.2, props: { value: 3 } })
  pieces[0].keys.push({ step: T3, pos: P(wheelRim(0)), delay: 1.4 })
  const T4 = b.t('Win a wedge', 'A correct answer on a wedge space earns you a wedge of that color, which slots into your playing piece.', look(0, -4, 6), 7)
  b.add({ id: 'won', kind: 'token', spawnFrom: [7.4, 0.3, -1.6], props: { r: 0.12, h: 0.26, color: WEDGE_COLORS[0] }, keys: [{ step: T4, pos: P(wheelRim(0), BH, 0.1, 0), delay: 0.6 }], info: info('Your first wedge', 'One down, five to go.') })
  b.t('Wrong answer ends your turn', 'Your turn continues until you get one wrong; then the player on your left rolls.', OVER)
  b.t('Six wedges, then the hub', 'Fill your piece with all six colors, get back to the hub, and answer one last question to win.', OVER)
  void WIDE
  return b.done({ w: 34, d: 23 })
}

export const trivia = game('trivial-pursuit', 'Trivial Pursuit', [2, 6], 4, '45–90 min', 'Medium', 'Answer questions to win six wedges.', ['#20324a', '#e0b12f', '#d9539a'], build)
