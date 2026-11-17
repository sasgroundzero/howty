/** Pictionary: teams, a sketch track, word cards, a one-minute timer and plenty of paper. */
import type { V3 } from '../../engine/types'
import { BH, COLORS, Kit, OVER, WIDE, game, info, look, onBoard, seats } from './kit'
import { SKETCH_PATH } from './layouts'

function build(n: number) {
  const b = new Kit()
  const P = onBoard(13, 8.6)
  const S = seats(n, 9.2, 7.8)
  const START = look(-5, 3.4, 6)
  const SIDE = look(0, -5.4, 6)
  const TEAMS = b.s('Split into teams', `Divide everyone into ${n} teams and sit teammates together.`, WIDE, 'With only three people, one person draws for both teams.', [`${n} teams`])
  const BOARD = b.s('Place the board', 'Put the board in the middle of the table with the box of word cards beside it.', OVER, 'Each square’s letter tells you which category of word to draw from the card.', ['1 board', 'Word cards'])
  const PADS = b.s('Hand out pads and pencils', 'Give every team a pad of paper and a pencil.', WIDE, undefined, [`${n} pads`, `${n} pencils`])
  const PAWNS = b.s('Pawns on the start', 'Each team places its pawn on the start square.', START, undefined, [`${n} pawns`])
  const TIMER = b.s('Timer and die', 'Put the one-minute sand timer and the die where everyone can see them.', SIDE, undefined, ['1 timer', '1 die'])
  b.s('Ready to play', 'You are set up: every team rolls the die, and the highest roll goes first.', WIDE, 'Each team picks a first "picturist"; the job passes to a teammate every turn.')

  b.board('board', BOARD, 13, 8.6, 'b:sketch', info('Game board', 'A track of squares marked P (person, place or animal), O (object), A (action), D (difficult) and AP (all play). There is 1.'), { edge: '#2b241c' })
  const cards = b.deck('cards', BOARD, [-1.8, 0, -5.5], 100, { panel: '#2b241c', border: '#e0b12f', ink: '#e0b12f', glyph: '✎' }, info('Word cards', 'Each card lists one word per category. Draw from the front and put used cards at the back.'), { w: 1.1, d: 1.6, delay: 0.4 })
  const spot = (i: number, k: number): V3 => P(SKETCH_PATH[i], BH, (k % 2 ? 0.2 : -0.2), k < 2 ? -0.18 : 0.2)
  const pawns = S.map((s) => b.pawn(`pawn-${s.i}`, PAWNS, spot(0, s.i), COLORS[s.i], info(`Team ${s.i + 1}’s pawn`, 'Shows how far the team has moved. It advances when the team guesses a word in time.'), { delay: s.i * 0.15, scale: 0.6 }))
  S.forEach((s) => {
    b.sheet(`pad-${s.i}`, PADS, s.at(0, 0, 0), 1.5, 1.9, { bg: '#ffffff', border: COLORS[s.i] }, info(`Team ${s.i + 1}’s pad`, 'The picturist sketches here. No letters, numbers or talking allowed.'), { rotY: s.rot, delay: s.i * 0.12 })
    b.box(`pencil-${s.i}`, PADS, s.at(1.1, 0, 0), 0.08, 0.08, 1.4, '#e0b12f', info('Pencil', 'One per team.'), { rotY: s.rot + 0.3, delay: 0.2 + s.i * 0.12 })
  })
  const timer = b.box('timer', TIMER, [0.4, 0, -5.4], 0.6, 1, 0.6, '#c9a36a', info('Sand timer', 'Runs for one minute. The team must guess the word before the sand runs out. There is 1.'), { round: true })
  const die = b.die('die', TIMER, [1.6, 0, -5.3], 3, info('Die', 'Rolled to move your pawn after a correct guess.'), { delay: 0.2 })

  const T1 = b.t('Draw a word card', 'Your picturist takes the top card and secretly reads the word that matches the square your pawn is on.', SIDE, 7)
  b.add({ id: 'word', kind: 'card', spawnFrom: [-1.8, 0.9, -5.5], props: { w: 0.9, d: 1.26, faceUp: true, face: { bg: '#fbf6ea', border: '#2b241c', lines: ['P  lighthouse', 'O  ladder', 'A  juggle', 'D  gravity', 'AP  pirate'] } }, keys: [{ step: T1, pos: S[0].at(-1.9, 0, 0), delay: 0.6 }], info: info('Word card', 'Five words, one per category. Only the picturist may look.') })
  cards.keys.push({ step: T1, pos: [-1.8, 0, -5.5], props: { count: 99 } })
  timer.keys.push({ step: b.t('Flip the timer', 'Someone turns the timer over, and the picturist has one minute to sketch.', look(0, 5, 8), 6), pos: [3, 0, 6.2], delay: 0.5 })
  b.t('Sketch, no words', 'The picturist draws clues while teammates shout guesses. No letters, numbers, speaking or gestures.', look(0, 7.8, 5), 7)
  const T4 = b.t('Guessed it: roll and move', 'Your team gets the word before time runs out, so you roll the die and move your pawn that many squares.', START, 7)
  die.keys.push({ step: T4, pos: [-3.2, 0, 5.4], rotY: 1.4, props: { value: 4 } })
  pawns[0].keys.push({ step: T4, pos: spot(4, 0), delay: 1.4 })
  b.t('Keep going or pass', 'A team that guesses correctly takes another turn with a new picturist; if time runs out, play passes to the team on the left.', OVER, 7)
  b.t('All Play and the finish', 'On an All Play square every team draws the same word at once. The first team to reach the last square and guess a final word wins.', look(4, -3, 7), 7)
  void TEAMS
  return b.done({ w: 34, d: 21 })
}

export const pictionary = game('pictionary', 'Pictionary', [2, 4], 2, '30–60 min', 'Easy', 'Sketch the word so your team can guess it (pick the number of teams).', ['#2b241c', '#e0b12f', '#2e6fb7'], build)
