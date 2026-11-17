/** Stratego: 40 hidden pieces a side on a 10x10 board with two lakes. */
import type { PieceSpec } from '../../engine/types'
import { Kit, OVER, TOP, cells, game, info, look } from './kit'
import { SQ10, sqSize } from './layouts'

/** [name, glyph, count, what it does] */
const ARMY: [string, string, number, string][] = [
  ['Flag', '⚑', 1, 'Cannot move. If it is captured, you lose.'],
  ['Bomb', '●', 6, 'Cannot move. Destroys any piece that attacks it, except a Miner.'],
  ['Marshal', '10', 1, 'The strongest piece. Only the Spy can capture it, and only by attacking first.'],
  ['General', '9', 1, 'Second strongest piece.'],
  ['Colonel', '8', 2, 'High-ranking officer.'],
  ['Major', '7', 3, 'Mid-ranking officer.'],
  ['Captain', '6', 4, 'Mid-ranking officer.'],
  ['Lieutenant', '5', 4, 'Low-ranking officer.'],
  ['Sergeant', '4', 4, 'Low-ranking officer.'],
  ['Miner', '3', 5, 'The only piece that can defuse a Bomb.'],
  ['Scout', '2', 8, 'Weak, but may move any number of open squares in a straight line.'],
  ['Spy', 'S', 1, 'Loses to everything, but captures the Marshal if the Spy attacks first.'],
]
const RED = '#b8352a'
const BLUE = '#2e5fa3'

function build() {
  const b = new Kit()
  const g = cells(10, 10, SQ10.cell)
  const size = sqSize(SQ10.n, SQ10.cell, SQ10.margin)
  const MINE = look(0, 3.2, 9)
  const BOARD = b.s('Place the board', 'Set the board between you: each player owns the four rows nearest them, and the two lakes sit in the middle.', OVER, 'Pieces can never enter the lake squares.', ['1 board'])
  const FLAG = b.s('Hide your Flag', 'Stand your Flag somewhere in your back rows with its face toward you so your opponent cannot see it.', MINE, 'All of your pieces face you. Your opponent only ever sees their blank backs.', ['1 Flag each'])
  const BOMBS = b.s('Guard it with Bombs', 'Place your 6 Bombs, usually with a few of them around the Flag.', MINE, undefined, ['6 Bombs each'])
  const RANKS = b.s('Place your officers', 'Arrange your Marshal, General, Colonels, Majors, Captains, Lieutenants and Sergeants wherever you like in your four rows.', MINE, 'The layout is your secret strategy: no two games need start the same.', ['19 officers each'])
  const REST = b.s('Fill the gaps', 'Fill every remaining square of your four rows with your Miners, Scouts and Spy.', OVER, 'You should have exactly 40 pieces filling a 10 by 4 block.', ['5 Miners', '8 Scouts', '1 Spy'])
  b.s('Ready to play', 'You are set up: the two middle rows are empty, and Red moves first.', OVER, 'Find and capture the enemy Flag to win.')
  const stepFor = (name: string) => (name === 'Flag' ? FLAG : name === 'Bomb' ? BOMBS : ['Miner', 'Scout', 'Spy'].includes(name) ? REST : RANKS)

  b.board('board', BOARD, size, size, 'b:stratego', info('Battlefield', '10 by 10 squares with two 2 by 2 lakes in the middle that no piece may enter. There is 1.'), { edge: '#5b4a2e' })
  // Fixed spots for the Flag and Bombs, then everything else fills in order with Scouts at the front.
  const fixed: [number, number][] = [[4, 0], [3, 0], [5, 0], [4, 1], [0, 0], [9, 1], [8, 0]]
  const free: [number, number][] = []
  for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) if (!fixed.some(([x, y]) => x === c && y === r)) free.push([c, r])
  const roster = ARMY.flatMap((a) => Array.from({ length: a[2] }, () => a))
  const at = new Map<string, PieceSpec<'block'>>()
  for (const red of [true, false])
    roster.forEach((a, i) => {
      const [c0, r0] = i < 7 ? fixed[i] : free[i - 7]
      const [c, r] = red ? [c0, r0] : [9 - c0, 9 - r0]
      at.set(`${red ? 'r' : 'b'}${c},${r}`, b.add({
        id: `${red ? 'red' : 'blue'}-${i}`, kind: 'block',
        props: { w: 0.74, h: 0.8, d: 0.3, color: red ? RED : BLUE, top: red ? { bg: RED, ink: '#ffe9b0', glyph: a[1] } : undefined },
        keys: [{ step: stepFor(a[0]), pos: g(c, r), rotY: red ? 0 : Math.PI, delay: (i % 10) * 0.05 + (red ? 0 : 0.4) }],
        info: red ? info(`Your ${a[0]}`, `${a[3]} You have ${a[2]}.`) : info('Enemy piece', 'Its rank faces the other player. You only find out what it is when one of you attacks.'),
      }))
    })
  const scout = at.get('r4,3')!
  const MIDF = look(0, 0.5, 9)
  scout.keys.push({ step: b.t('Red moves first', 'You move one piece per turn: most go one square forward, back or sideways, but your Scout can run any distance in a straight line.', MIDF, 7), pos: g(4, 5), delay: 0.6 })
  at.get('b5,6')!.keys.push({ step: b.t('Blue moves', 'Blue moves one piece a single square forward. You still do not know what it is.', MIDF), pos: g(5, 5), rotY: Math.PI, delay: 0.6 })
  const HIT = b.t('Attack to reveal', 'Move onto an enemy piece to attack: both players say their rank out loud, and the lower rank is removed.', MIDF, 7)
  scout.keys.push({ step: HIT, pos: g(4, 5.55), delay: 0.5 })
  scout.keys.push({ step: b.t('The Scout is captured', 'Your Scout (2) attacked a Sergeant (4), so the Scout comes off the board, but now you know where that Sergeant is.', MIDF, 7), pos: g(4, 5.55), hide: true, delay: 0.8 })
  b.t('Bombs and the Spy', 'Bombs destroy any attacker except a Miner, and the Spy takes the Marshal only if the Spy attacks first.', TOP)
  b.t('Capture the Flag', 'Keep scouting and attacking: the first player to capture the enemy Flag wins.', OVER)
  return b.done({ w: 30, d: 21 })
}

export const stratego = game('stratego', 'Stratego', [2, 2], 2, '45–60 min', 'Medium', 'Hide your Flag and hunt for theirs.', ['#b8352a', '#2e5fa3', '#a9bb7a'], build)
