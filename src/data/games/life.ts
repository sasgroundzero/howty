/** The Game of Life: spinner, cars and pegs, a bank and a winding road from start to retirement. */
import type { V3 } from '../../engine/types'
import { BH, COLORS, Kit, OVER, WIDE, game, info, look, onBoard, seats } from './kit'
import { LIFE_PATH } from './layouts'

const DECKS: [string, string, string][] = [
  ['Career', '#2e6fb7', 'Jobs you can take straight away. Each lists a salary you collect on paydays.'],
  ['College career', '#7a4fa3', 'Better-paid jobs you can only draw after taking the college route.'],
  ['House', '#d9772b', 'Homes you can buy during the game and sell at the end.'],
  ['Action', '#e0b12f', 'Drawn when you land on an action space. Each one is worth money at the end.'],
]
function build(n: number) {
  const b = new Kit()
  const P = onBoard(13, 9.4)
  const S = seats(n, 10, 8.4)
  const START = look(-5, 3.8, 6)
  const BANKF = look(12.5, -1, 8)
  const BOARD = b.s('Open the board', 'Lay out the board and put the spinner beside it, making sure it turns freely.', OVER, 'The road runs from the start in one corner to retirement at the other end.', ['1 board', '1 spinner'])
  const BANK = b.s('Set up the bank', 'Choose a banker, who sorts the money by value and keeps it beside the board.', BANKF, undefined, ['Play money'])
  const CARDS = b.s('Shuffle the card decks', 'Shuffle each deck of cards separately and place them face down near the board.', BANKF, 'Deck names and counts vary by edition. Recent editions have Career, College Career, House and Action decks.', ['4 decks'])
  const CARS = b.s('Pick a car and a peg', 'Each player chooses a car, puts one peg in the driver’s seat, and parks on the start space.', START, undefined, [`${n} cars`, `${n} pegs`])
  const CASH = b.s('Collect your starting money', 'The banker gives each player their starting money.', WIDE, 'Recent editions start everyone with $200K. Older editions use a different amount, so check your rulebook.', ['Starting money each'])
  b.s('Ready to play', 'You are set up: everyone spins, and the highest number takes the first turn.', OVER, 'Travel the road collecting money and life events. The richest player at retirement wins.')

  b.board('board', BOARD, 13, 9.4, 'b:life', info('Game board', 'One long road of spaces. Red STOP spaces make everyone stop, and green spaces are paydays. There is 1.'), { edge: '#3d6b3a' })
  const spinner = b.add({ id: 'spinner', kind: 'token', tumble: false, props: { r: 0.95, h: 0.35, color: '#f4f1e6', label: '1–10', ink: '#c0392b' }, keys: [{ step: BOARD, pos: [0, 0, -5.9], delay: 0.5 }], info: info('Spinner', 'Numbered 1 to 10. Spin it instead of rolling dice and move that many spaces. There is 1.') })
  ;['$10K', '$20K', '$50K', '$100K'].forEach((v, i) => b.deck(`bank-${i}`, BANK, [11.4 + (i % 2) * 1.6, 0, -3.4 + Math.floor(i / 2) * 0.95], 30, { bg: ['#f6e58d', '#b8e0b0', '#a9d0ea', '#f2b56b'][i], border: '#5a6b5a', glyph: v }, info(`Bank: ${v} bills`, 'The banker pays out salaries and collects payments from this supply.'), { w: 1.4, d: 0.75, delay: i * 0.1 }))
  DECKS.forEach(([name, color, body], i) => b.deck(`deck-${i}`, CARDS, [11 + (i % 2) * 1.3, 0, -0.9 + Math.floor(i / 2) * 1.6], 20, { panel: color, ink: '#ffffff', sub: name.toUpperCase(), glyph: '★' }, info(`${name} deck`, body), { delay: i * 0.12 }))
  const spot = (i: number, k: number): V3 => P(LIFE_PATH[i], BH, ((k % 3) - 1) * 0.42, k < 3 ? -0.2 : 0.3)
  const cars = S.map((s) => {
    const car = b.box(`car-${s.i}`, CARS, spot(0, s.i), 0.34, 0.2, 0.6, COLORS[s.i], info(`${s.whose} car`, 'Your playing piece. It has seats for the pegs you collect along the way.'), { delay: s.i * 0.12 })
    const peg = b.disc(`peg-${s.i}`, CARS, [spot(0, s.i)[0], BH + 0.2, spot(0, s.i)[2]], 0.08, 0.26, s.i % 2 ? '#f7a8c8' : '#9ed3ee', info('Peg', 'You. More pegs join the car if you marry or have children or pets.'), { delay: 0.3 + s.i * 0.12 })
    return { car, peg }
  })
  const cash = S.map((s) => b.deck(`cash-${s.i}`, CASH, s.at(0, 0, 0), 8, { bg: '#f2b56b', border: '#5a6b5a', glyph: '$200K' }, info(`${s.whose} money`, 'Starting money. Keep it in front of you.'), { w: 1.4, d: 0.75, rotY: s.rot, delay: s.i * 0.12 }))
  const drive = (k: number, to: number, step: number, delay = 1.2) => {
    const p = spot(to, k)
    cars[k].car.keys.push({ step, pos: p, delay })
    cars[k].peg.keys.push({ step, pos: [p[0], BH + 0.2, p[2]], delay })
  }

  const T1 = b.t('Choose your route', 'Before your first move, decide whether to start a career right away or go to college for a better-paid job later.', START, 7)
  b.add({ id: 'job', kind: 'card', spawnFrom: [11, 0.4, -0.9], props: { w: 0.9, d: 1.26, faceUp: true, face: { bg: '#fbf6ea', panel: '#2e6fb7', title: 'CAREER', glyph: '✎', sub: 'Salary $50K' } }, keys: [{ step: T1, pos: S[0].at(1.6, 0, 0), delay: 1 }], info: info('Your career card', 'You chose the career route, so you take a career card now. Its salary is what you collect on every payday.') })
  const T2 = b.t('Spin and drive', 'You spin a 6 and drive your car six spaces along the road.', look(-2, 3.6, 7), 7)
  spinner.keys.push({ step: T2, pos: [0, 0, -5.9], rotY: Math.PI * 4, props: { label: '6' } })
  drive(0, 6, T2)
  const T3 = b.t('Payday', 'You passed a green payday space on the way, so the banker pays you your salary.', WIDE, 7)
  cash[0].keys.push({ step: T3, pos: S[0].at(0, 0, 0), rotY: S[0].rot, props: { count: 10, face: { bg: '#f2b56b', border: '#5a6b5a', glyph: '$250K' } } })
  const T4 = b.t('Next player spins', 'The next player spins a 9, but must stop early on the red STOP space and follow its instructions.', look(-2, 2.6, 8), 7)
  spinner.keys.push({ step: T4, pos: [0, 0, -5.9], rotY: Math.PI * 8, props: { label: '9' } })
  drive(1, 8, T4)
  b.t('Follow each space', 'Whatever space you land on tells you what happens: draw a card, pay a bill, or add a peg to your car.', OVER)
  b.t('Retire rich', 'When everyone has reached retirement, cash in your houses and cards: the player with the most money wins.', look(4, -3, 8))
  return b.done({ w: 38, d: 23 })
}

export const life = game('game-of-life', 'The Game of Life', [2, 6], 4, '60 min', 'Easy', 'Spin your way from first job to retirement.', ['#7fbf7a', '#f6d32d', '#2e6fb7'], build)
