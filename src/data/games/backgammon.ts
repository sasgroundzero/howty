/** Backgammon: hinged board, 15 checkers a side in the 2-5-3-5 start, dice and doubling cube. */
import { Builder } from '../../engine/builder'
import type { Focus, GameDef, PieceSpec, V3 } from '../../engine/types'
import { BG } from '../../components/pieces/backgammon'

const FOCUS: Record<string, Focus> = {
  overview: { pos: [0, 19, 15], target: [0, 0, 0.4] },
  top: { pos: [0, 21, 6], target: [0, 0, 0] },
  right: { pos: [4.5, 11, 9], target: [4.3, 0, 0] },
  left: { pos: [-4.5, 11, 9], target: [-4.3, 0, 0] },
  bar: { pos: [0, 8.5, 9.5], target: [0, 0.3, 0] },
  home: { pos: [4.3, 11, 12.5], target: [4.3, 0, 3] },
}
const WHITE = '#f3ead8'
const DARK = '#2e2622'

/** Points are numbered from White's side: 1 to 6 is White's home board (near right), 24 is far right. */
const pointX = (p: number) => {
  const q = p > 12 ? 25 - p : p
  return q <= 6 ? BG.half - BG.rim - (q - 0.5) * BG.pointW : -BG.bar - (q - 6.5) * BG.pointW
}
/** Resting place of the k-th checker (0 = against the rail) on a point. */
const spot = (p: number, k: number): V3 => [pointX(p), BG.floor, (p > 12 ? -1 : 1) * (BG.depth / 2 - BG.rim - 0.5 - k * 0.98)]

function build(): ReturnType<Builder['done']> {
  const b = new Builder()
  const BOARD = b.step({
    title: 'Set the board between you',
    instruction: 'Place the folded board between the two players, with the hinge running from one player to the other.',
    detail: 'Backgammon is always a two-player game. You sit facing each other across the long sides.',
    needs: ['1 folding board'],
    focus: FOCUS.overview,
  })
  const OPEN = b.step({
    title: 'Open the board',
    instruction: 'Unfold the board flat so you can see all 24 narrow triangles, called points, 12 on each side.',
    detail: 'The raised strip down the middle is the bar. It splits the board into four quarters of 6 points.',
    needs: ['24 points', '1 bar'],
    focus: FOCUS.top,
  })
  const QUARTERS = b.step({
    title: 'Find your home board',
    instruction: 'The quarter nearest you on your right is your home board, and your opponent’s home board is directly across from it.',
    detail: 'Points are numbered 1 to 24 from your own home board, so your 1-point is your opponent’s 24-point.',
    needs: [],
    focus: FOCUS.overview,
  })
  const C24 = b.step({
    title: 'Two on the 24-point',
    instruction: 'Each player puts 2 checkers on their 24-point, the far corner of the opponent’s home board.',
    detail: 'These two are your back checkers. They have the longest trip home.',
    needs: ['2 checkers each'],
    focus: FOCUS.right,
  })
  const C13 = b.step({
    title: 'Five on the mid-point',
    instruction: 'Each player lines up 5 checkers on their 13-point, the far-left corner on the other side of the board.',
    detail: 'The 13-point is called the mid-point.',
    needs: ['5 checkers each'],
    focus: FOCUS.left,
  })
  const C8 = b.step({
    title: 'Three on the 8-point',
    instruction: 'Each player puts 3 checkers on their 8-point, two points to the left of the bar on their own side.',
    needs: ['3 checkers each'],
    focus: FOCUS.left,
  })
  const C6 = b.step({
    title: 'Five on the 6-point',
    instruction: 'Each player puts their last 5 checkers on their 6-point, right next to the bar in their home board.',
    detail: 'That makes 2 + 5 + 3 + 5 = 15 checkers each, and the two sides mirror each other.',
    needs: ['5 checkers each'],
    focus: FOCUS.right,
  })
  const DICE = b.step({
    title: 'Take two dice each',
    instruction: 'Give each player their own pair of dice (and a dice cup if you have them).',
    needs: ['2 dice each'],
    focus: FOCUS.overview,
  })
  const CUBE = b.step({
    title: 'Place the doubling cube',
    instruction: 'Set the doubling cube on the middle of the bar with 64 facing up.',
    detail: 'The cube tracks the stakes. With 64 on top it means the game is still worth 1 point.',
    needs: ['1 doubling cube'],
    focus: FOCUS.bar,
  })
  b.step({
    title: 'Ready to play',
    instruction: 'You are set up: White moves counter-clockwise toward the near-right quarter and Dark moves the opposite way.',
    detail: 'Bring all 15 checkers into your home board, then bear them off. First to bear off everything wins.',
    focus: FOCUS.overview,
  })

  b.add({
    id: 'board',
    kind: 'bgBoard',
    props: { open: 0 },
    keys: [
      { step: BOARD, pos: [0, 0, 0] },
      { step: OPEN, pos: [0, 0, 0], props: { open: 1 } },
    ],
    info: { title: 'Backgammon board', body: 'A hinged board with 24 points in four quarters of 6, split by the bar. There is 1.' },
  })

  ;[
    { id: 'white-home', x: 4.25, z: 6.75, label: 'WHITE HOME BOARD · POINTS 1–6', body: 'White must bring all 15 checkers here before bearing any off.' },
    { id: 'white-outer', x: -4.25, z: 6.75, label: 'WHITE OUTER BOARD · POINTS 7–12', body: 'The quarter next to White’s home board, on the other side of the bar.' },
    { id: 'dark-home', x: 4.25, z: -6.75, label: 'DARK HOME BOARD · WHITE’S 19–24', body: 'Dark must bring all 15 checkers here before bearing any off.' },
    { id: 'dark-outer', x: -4.25, z: -6.75, label: 'DARK OUTER BOARD · WHITE’S 13–18', body: 'The quarter next to Dark’s home board. White’s mid-point (13) is its far-left point.' },
  ].forEach((q, i) =>
    b.add({
      id: q.id,
      kind: 'mat',
      props: { w: 7, d: 0.8, color: i < 2 ? '#efe6d2' : '#3a302a', ink: i < 2 ? '#3a302a' : '#efe6d2', label: q.label },
      keys: [{ step: QUARTERS, pos: [q.x, 0, q.z], delay: i * 0.2 }],
      info: { title: q.label.split(' · ')[0].toLowerCase().replace(/^\w/, (m) => m.toUpperCase()), body: q.body },
    }),
  )

  /** White's layout by White's point numbers; Dark mirrors it across the board. */
  const layout: [number, number, number][] = [[24, 2, C24], [13, 5, C13], [8, 3, C8], [6, 5, C6]]
  const checkers = new Map<string, PieceSpec<'token'>>()
  for (const side of ['white', 'dark'] as const)
    layout.forEach(([wp, count, step]) => {
      const p = side === 'white' ? wp : 25 - wp
      for (let k = 0; k < count; k++)
        checkers.set(
          `${side}-${wp}-${k}`,
          b.add({
            id: `${side}-${wp}-${k}`,
            kind: 'token',
            props: { r: 0.47, h: 0.16, color: side === 'white' ? WHITE : DARK },
            keys: [{ step, pos: spot(p, k), delay: k * 0.16 + (side === 'dark' ? 0.5 : 0) }],
            info: {
              title: `${side === 'white' ? 'White' : 'Dark'} checker`,
              body: `One of ${count} that start on this player's ${wp}-point. Each player has 15: 2 on the 24-point, 5 on the 13-point, 3 on the 8-point and 5 on the 6-point.`,
            },
          }),
        )
    })

  const die = (id: string, white: boolean, pos: V3, value: number, delay: number) =>
    b.add({
      id,
      kind: 'die',
      props: { sides: 6, value, color: white ? '#f7f1e3' : '#3a2f2a', ink: white ? '#2e2622' : '#f7f1e3', size: 0.85 },
      keys: [{ step: DICE, pos, rotY: 0.3 - delay, delay }],
      tumble: true,
      info: { title: `${white ? 'White' : 'Dark'}'s dice`, body: 'Each player has their own pair. Roll both on your turn and move one checker for each die (or the same checker twice).' },
    })
  const w1 = die('die-w1', true, [9.2, 0, 3.6], 3, 0)
  const w2 = die('die-w2', true, [9.9, 0, 4.2], 5, 0.1)
  const d1 = die('die-d1', false, [-9.2, 0, -3.6], 1, 0.3)
  const d2 = die('die-d2', false, [-9.9, 0, -4.2], 2, 0.4)

  b.add({
    id: 'cube',
    kind: 'die',
    props: { sides: 6, value: 6, text: '64', color: '#efe3c2', ink: '#7a2a1f', size: 1.5 },
    keys: [{ step: CUBE, pos: [0, BG.wall, 0] }],
    info: { title: 'Doubling cube', body: 'Shows 2, 4, 8, 16, 32 and 64. Before rolling, you may offer to double the stakes: your opponent accepts and takes the cube, or gives up the game. There is 1.' },
  })

  /* ---- Simulate First Turn ------------------------------------------------ */
  const T1 = b.turn({
    title: 'Roll for the first move',
    instruction: 'Each player rolls one die: White rolls a 3 and Dark rolls a 1, so White goes first and plays that 3 and 1.',
    focus: FOCUS.top,
    duration: 7,
  })
  w1.keys.push({ step: T1, pos: [3.4, BG.floor, 0.5], rotY: 0.5, props: { value: 3 } })
  d1.keys.push({ step: T1, pos: [-3.4, BG.floor, -0.5], rotY: -0.4, delay: 0.3, props: { value: 1 } })

  const T2 = b.turn({
    title: 'White plays the 3',
    instruction: 'White moves one checker 3 points, from the 8-point down to the 5-point.',
    focus: FOCUS.home,
  })
  checkers.get('white-8-2')!.keys.push({ step: T2, pos: spot(5, 0), delay: 0.6 })

  const T3 = b.turn({
    title: 'White plays the 1',
    instruction: 'White moves a second checker 1 point, from the 6-point to the 5-point, so two checkers now hold that point.',
    detail: 'Two or more checkers on a point "make" it: your opponent cannot land there.',
    focus: FOCUS.home,
  })
  checkers.get('white-6-4')!.keys.push({ step: T3, pos: spot(5, 1), delay: 0.6 })

  const T4 = b.turn({
    title: 'Dark rolls 6 and 4',
    instruction: 'White picks up their die to end the turn, then Dark rolls both dice and gets a 6 and a 4.',
    focus: FOCUS.top,
    duration: 7,
  })
  w1.keys.push({ step: T4, pos: [9.2, 0, 3.6], rotY: 0.3 })
  d1.keys.push({ step: T4, pos: [-3.6, BG.floor, -0.6], rotY: 0.7, delay: 0.5, props: { value: 6 } })
  d2.keys.push({ step: T4, pos: [-2.6, BG.floor, -1.3], rotY: -0.2, delay: 0.6, props: { value: 4 } })

  const T5 = b.turn({
    title: 'Dark runs a back checker',
    instruction: 'Dark uses both dice on one checker, running it 6 and then 4 points out of White’s home board.',
    focus: FOCUS.overview,
    duration: 7,
  })
  checkers.get('dark-24-1')!.keys.push({ step: T5, pos: spot(11, 0), delay: 0.5 })

  b.turn({
    title: 'Hits and the doubling cube',
    instruction: 'A lone checker can be hit and sent to the bar, and before any roll a player may offer the cube to double the stakes.',
    focus: FOCUS.bar,
  })
  b.turn({
    title: 'Race home',
    instruction: 'Keep taking turns until one player has all 15 checkers in their home board and bears every one of them off.',
    focus: FOCUS.overview,
  })
  void w2
  return b.done({ w: 34, d: 21 })
}

export const backgammon: GameDef = {
  id: 'backgammon',
  meta: {
    title: 'Backgammon',
    players: [2, 2],
    defaultPlayers: 2,
    playTime: '15–30 min',
    difficulty: 'Easy',
    blurb: 'Race 15 checkers home and bear them off.',
    swatch: ['#7a4a26', '#9c3b2a', '#f3ead8'],
  },
  build,
}
