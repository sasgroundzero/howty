/** Cranium: teams, four activity card boxes, sculpting clay, a timer and a colored die. */
import type { V3 } from '../../engine/types'
import { BRAIN } from '../../components/pieces/boardArt'
import { BH, COLORS, Kit, OVER, WIDE, game, info, look, onBoard, seats } from './kit'
import { BRAIN_PATH } from './layouts'

const BOXES: [string, string][] = [
  ['Creative Cat', 'Sculpt with the clay, draw, or draw with your eyes closed.'],
  ['Data Head', 'Trivia questions: true or false, multiple choice and more.'],
  ['Word Worm', 'Spell words, unscramble them, or guess definitions.'],
  ['Star Performer', 'Hum a tune, act out a clue, or impersonate someone.'],
]
function build(n: number) {
  const b = new Kit()
  const P = onBoard(12.4, 9)
  const S = seats(n, 9.6, 8)
  const START = look(-4.6, 3.6, 6)
  const BOARD = b.s('Place the board', 'Lay the board in the middle of the table.', OVER, 'The track’s four colors match the four kinds of activity, and the purple spaces let you pick any of them.', ['1 board'])
  const CARDS = b.s('Set out the four card boxes', 'Put one box of activity cards beside each side of the board.', WIDE, 'Each box is a different color and a different kind of challenge.', ['4 card boxes'])
  const TEAMS = b.s('Form teams', `Split into ${n} teams of two or more, and give each team a pad of paper and a pencil.`, WIDE, undefined, [`${n} pads`, `${n} pencils`])
  const MOVERS = b.s('Movers on the start', 'Each team picks a mover and puts it on the purple start space.', START, undefined, [`${n} movers`])
  const BITS = b.s('Clay, timer and die', 'Put the tub of clay, the sand timer and the die within reach of every team.', look(8.6, 3.2, 6), undefined, ['1 tub of clay', '1 timer', '1 die'])
  b.s('Ready to play', 'You are set up: the team with the player whose birthday is coming up next goes first.', OVER, 'Race round the track by completing activities, then win a final challenge to finish.')

  b.board('board', BOARD, 12.4, 9, 'b:brain', info('Game board', 'A track of colored spaces. The color you are on decides which card box your next activity comes from. There is 1.'), { edge: '#7a4fa3' })
  const boxAt: V3[] = [[0, 0, -5.9], [-7.6, 0, 0], [7.6, 0, -1], [0, 0, 5.8]]
  BOXES.forEach(([name, body], i) => b.deck(`box-${i}`, CARDS, boxAt[i], 60, { panel: BRAIN[i], ink: '#ffffff', sub: name.toUpperCase(), glyph: ['✎', '?', 'Aa', '♪'][i] }, info(`${name} cards`, body), { w: 1.2, d: 1.7, rotY: i === 1 || i === 2 ? Math.PI / 2 : 0, delay: i * 0.2 }))
  S.forEach((s) => b.sheet(`pad-${s.i}`, TEAMS, s.at(0, 0, 0.4), 1.4, 1.8, { bg: '#ffffff', border: COLORS[s.i] }, info(`Team ${s.i + 1}’s pad`, 'For drawing and spelling activities.'), { rotY: s.rot, delay: s.i * 0.12 }))
  const spot = (i: number, k: number): V3 => P(BRAIN_PATH[i], BH, (k % 2 ? 0.22 : -0.22), k < 2 ? -0.2 : 0.22)
  const movers = S.map((s) => b.pawn(`mover-${s.i}`, MOVERS, spot(0, s.i), COLORS[s.i], info(`Team ${s.i + 1}’s mover`, 'Moves forward when the team completes an activity before the timer runs out.'), { delay: s.i * 0.15, scale: 0.6 }))
  const clay = b.box('clay', BITS, [8.4, 0, 3], 1, 0.7, 1, '#7a4fa3', info('Clay', 'Used for sculpting activities. Roll it back into a ball afterwards. There is 1 tub.'), { round: true })
  const timer = b.box('timer', BITS, [9.7, 0, 3.4], 0.5, 0.9, 0.5, '#c9a36a', info('Sand timer', 'Most activities must be finished before the sand runs out. There is 1.'), { round: true, delay: 0.15 })
  const die = b.add({ id: 'die', kind: 'die', tumble: true, props: { sides: 10, value: 1, text: '●', color: '#f4f1e6', ink: BRAIN[0] }, keys: [{ step: BITS, pos: [8.9, 0, 4.4], delay: 0.3 }], info: info('Colored die', 'Its faces show the track colors instead of numbers. After a success, roll it and move to the next space of that color. There is 1.') })
  void clay

  const T1 = b.t('Pick an activity', 'On a purple space your team chooses the category, and the team on your right draws the card: a Creative Cat sculpting challenge.', look(0, -4.6, 6), 7)
  b.add({ id: 'card', kind: 'card', spawnFrom: [0, 0.9, -5.9], props: { w: 0.9, d: 1.26, faceUp: true, face: { bg: '#fbf6ea', panel: BRAIN[0], title: 'SCULPT', glyph: '✎', sub: 'a snowman' } }, keys: [{ step: T1, pos: [1.6, 0, -5.9], delay: 0.6 }], info: info('Activity card', 'One teammate reads it in secret and performs the activity for the others to guess.') })
  timer.keys.push({ step: b.t('Start the timer', 'The timer is flipped and one teammate starts sculpting while the others call out guesses.', look(0, 6.6, 6), 7), pos: [2.2, 0, 6.6], delay: 0.5 })
  const T3 = b.t('Success: roll the die', 'Your team guesses it in time, so you roll the die: it comes up blue.', look(-2, 4.6, 6), 6)
  die.keys.push({ step: T3, pos: [-1.6, 0, 5.6], rotY: 1.1 })
  movers[0].keys.push({ step: b.t('Move to that color', 'You move your mover forward to the next blue space, and that is the end of your turn.', START, 6), pos: spot(4, 0), delay: 0.6 })
  b.t('Fail and you stay put', 'If the timer runs out, your mover stays where it is and play passes to the team on your left.', OVER)
  b.t('Finish with one of each', 'Teams must stop at every purple space on the way; at the end, win one activity from each box to take the game.', OVER, 7)
  return b.done({ w: 34, d: 22 })
}

export const cranium = game('cranium', 'Cranium', [2, 4], 2, '45–60 min', 'Easy', 'Sculpt, sketch, spell and act as a team (pick the number of teams).', ['#7a4fa3', '#e0b12f', '#3d8b4a'], build)
