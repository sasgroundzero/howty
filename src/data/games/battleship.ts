/** Battleship: each player hides five ships on an ocean grid and tracks shots on an upright target grid. */
import type { PieceSpec, V3 } from '../../engine/types'
import { seatAt } from '../../engine/util'
import { BH, Kit, cam, game, info } from './kit'
import { SEA, sqSize } from './layouts'

const SIZE = sqSize(SEA.n, SEA.cell, SEA.margin)
const OCEAN_Z = 4.6
const TILT = 1.35
const HINGE = OCEAN_Z - SIZE / 2 - 0.1
/** [name, length, column, row, lengthwise along the row?] */
const FLEET: [string, number, number, number, boolean][] = [
  ['Carrier', 5, 1, 8, true], ['Battleship', 4, 7, 2, false], ['Cruiser', 3, 2, 3, true], ['Submarine', 3, 4, 5, false], ['Destroyer', 2, 7, 7, true],
]

function build() {
  const b = new Kit()
  const SIDES = [seatAt([0, 0, 0], 0), seatAt([0, 0, 0], Math.PI)]
  /** Center of ocean-grid cell (col, row) for a side; row 0 is nearest that player. */
  const sea = (s: number, c: number, r: number, y = BH): V3 => SIDES[s]((c - 4.5) * SEA.cell, y, OCEAN_Z + (4.5 - r) * SEA.cell)
  /** A point just in front of target-grid cell (col, row) on the tilted board. */
  const target = (s: number, c: number, r: number): V3 => {
    const t = SEA.margin + (r + 0.5) * SEA.cell
    return SIDES[s]((c - 4.5) * SEA.cell, t * Math.sin(TILT) - 0.02, HINGE - t * Math.cos(TILT) + 0.2)
  }
  const ALL = cam(0, 17, 17, 0, 1, 0)
  const MINE = cam(0, 9.5, 12.5, 0, 0.6, 3.6)
  const LID = cam(0, 5.5, 10.5, 0, 2.4, 0)
  const UNITS = b.s('Sit facing each other', 'Each player takes one game unit and sits so that neither can see the other’s ocean grid.', ALL, 'A unit is two 10 by 10 grids: a flat ocean grid for your own fleet and an upright target grid for tracking your shots.', ['2 game units'])
  const LIDS = b.s('Stand up the target grid', 'Open your unit so the target grid stands upright between you, hiding your ocean grid.', ALL, 'Both grids use letters A to J and numbers 1 to 10 to name each square.')
  const SHIPS = b.s('Hide your fleet', 'Secretly place all 5 ships on your ocean grid, each one straight along a row or column, never diagonally.', MINE, 'Ships may not overlap or hang off the grid, and they cannot be moved once the game starts.', ['5 ships each'])
  const PEGS = b.s('Sort the pegs', 'Keep a supply of white pegs for misses and red pegs for hits within reach of each player.', MINE, undefined, ['White pegs', 'Red pegs'])
  b.s('Ready to play', 'You are set up: decide who goes first, then take turns calling out one square at a time.', ALL, 'Sink all five enemy ships before yours are sunk.')

  const ships = new Map<string, PieceSpec<'block'>>()
  for (const s of [0, 1]) {
    const mine = s === 0
    b.board(`ocean-${s}`, UNITS, SIZE, SIZE, 'b:sea', info(`${mine ? 'Your' : 'Opponent’s'} ocean grid`, 'Where this player hides their 5 ships and marks the opponent’s shots. 10 by 10 squares.'), { pos: SIDES[s](0, 0, OCEAN_Z), rotY: s * Math.PI, delay: s * 0.3, edge: '#1d3b57' })
    const lid = b.board(`target-${s}`, UNITS, SIZE, SIZE, 'b:target', info(`${mine ? 'Your' : 'Opponent’s'} target grid`, 'Stands upright facing its owner. They mark every shot they call here: white for a miss, red for a hit.'), { pos: SIDES[s](0, 0, HINGE - SIZE / 2), rotY: s * Math.PI, delay: s * 0.3, edge: '#1d3b57' })
    lid.keys.push({ step: LIDS, pos: SIDES[s](0, 0, HINGE - SIZE / 2), rotY: s * Math.PI, props: { tilt: TILT } })
    FLEET.forEach(([name, len, c, r, along], i) => {
      const mid = sea(s, c + (along ? (len - 1) / 2 : 0), r + (along ? 0 : (len - 1) / 2))
      ships.set(`${s}-${name}`, b.add({
        id: `ship-${s}-${i}`, kind: 'block',
        props: { w: len * SEA.cell - 0.1, h: 0.24, d: 0.32, color: mine ? '#7d8791' : '#5f6a75' },
        keys: [{ step: SHIPS, pos: mid, rotY: s * Math.PI + (along ? 0 : Math.PI / 2), delay: i * 0.25 + s * 0.2 }],
        info: info(`${mine ? 'Your' : 'Enemy'} ${name}`, `Covers ${len} squares and is sunk when all ${len} have been hit. Each fleet has a Carrier (5), Battleship (4), Cruiser (3), Submarine (3) and Destroyer (2).`),
      }))
    })
    ;[['white', '#f4f1e8', 'misses'], ['red', '#c0392b', 'hits']].forEach(([name, color, what], k) =>
      b.box(`pegs-${s}-${name}`, PEGS, SIDES[s](3.8 + k * 1, 0, OCEAN_Z + 1.6 - k * 0), 0.8, 0.3, 1.2, color, info(`${name[0].toUpperCase()}${name.slice(1)} pegs`, `A tray of ${name} pegs, used to mark ${what}.`), { delay: k * 0.2 + s * 0.2 }),
    )
  }
  const peg = (id: string, step: number, pos: V3, color: string, upright: boolean, what: string) =>
    b.add({ id, kind: 'token', props: { r: 0.14, h: upright ? 0.16 : 0.34, color, upright }, keys: [{ step, pos, delay: 1 }], info: info(what, 'One peg marks one shot.') })
  peg('shot-1', b.t('Call a shot', 'You call out a square by its letter and number, for example "D-4". Your opponent checks their ocean grid: it is a miss.', LID, 7), target(0, 3, 3), '#f4f1e8', true, 'Miss')
  b.t('Mark the miss', 'You put a white peg in D-4 on your upright target grid so you never call that square twice.', LID, 5)
  peg('shot-2', b.t('Your opponent fires', 'Now your opponent calls "E-6", which is one of the squares your Submarine sits on, so you must say "Hit".', MINE, 7), sea(0, 4, 5, BH + 0.24), '#c0392b', false, 'Hit')
  peg('shot-2b', b.t('Both players mark the hit', 'You put a red peg in your ship, and your opponent marks a red peg on E-6 of their own target grid.', ALL), target(1, 4, 5), '#c0392b', true, 'Hit')
  b.t('"You sank my ship!"', 'When every square of a ship has a red peg, its owner must announce which ship was sunk.', MINE)
  b.t('Sink the fleet', 'Keep trading one shot per turn: the first player to sink all five enemy ships wins.', ALL)
  void ships
  return b.done({ w: 26, d: 23 })
}

export const battleship = game('battleship', 'Battleship', [2, 2], 2, '20–30 min', 'Easy', 'Hide five ships, then hunt your opponent’s.', ['#3f7fb0', '#7d8791', '#c0392b'], build)
