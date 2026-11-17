/** Authoring shortcuts shared by the classic board-game setups. */
import { Builder } from '../../engine/builder'
import type { Face, Focus, GameDef, GameMeta, GameSetup, Info, V3 } from '../../engine/types'
import { seatAt } from '../../engine/util'
import type { UV } from './layouts'

export const cam = (x: number, y: number, z: number, tx = 0, ty = 0, tz = 0): Focus => ({ pos: [x, y, z], target: [tx, ty, tz] })
export const OVER = cam(0, 19, 15, 0, 0, 0.4)
export const TOP = cam(0, 22, 6)
export const WIDE = cam(0, 25, 19, 0, 0, 0.6)
/** Look at a spot on the table from the near side, `h` units up. */
export const look = (x: number, z: number, h = 9): Focus => cam(x, h, z + h * 0.8, x, 0, z)
export const info = (title: string, body: string): Info => ({ title, body })

export const COLORS = ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a', '#7a4fa3', '#d9772b', '#3a3a3a', '#e9e4d8']
export const NAMES = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'Black', 'White']
/** Height of a standard board, so pieces can rest on top of it. */
export const BH = 0.12

/** Seats spread evenly round the table; seat 0 is you, on the near side, then clockwise. */
export function seats(n: number, rx: number, rz: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = Math.PI / 2 + (i * Math.PI * 2) / n
    const rot = Math.atan2(Math.cos(a), Math.sin(a))
    const pos: V3 = [rx * Math.cos(a), 0, rz * Math.sin(a)]
    return { i, at: seatAt(pos, rot), rot, pos, color: COLORS[i], name: i === 0 ? 'You' : `Player ${i + 1}`, whose: i === 0 ? 'Your' : `Player ${i + 1}'s` }
  })
}

/** Cell centers of a grid centered on (cx, cz); row 0 is the near row, column 0 the left one. */
export const cells =
  (cols: number, rows: number, cell: number, cx = 0, cz = 0) =>
  (c: number, r: number, y = BH): V3 => [cx + (c - (cols - 1) / 2) * cell, y, cz + ((rows - 1) / 2 - r) * cell]
/** Board UV to world, for a board of w x d centered on the origin. */
export const onBoard =
  (w: number, d: number) =>
  ([u, v]: UV, y = BH, dx = 0, dz = 0): V3 => [(u - 0.5) * w + dx, y, (v - 0.5) * d + dz]

export class Kit extends Builder {
  s(title: string, instruction: string, focus: Focus, detail?: string, needs?: string[]) {
    return this.step({ title, instruction, detail, needs, focus })
  }
  t(title: string, instruction: string, focus: Focus, duration = 6) {
    return this.turn({ title, instruction, focus, duration })
  }
  board(id: string, step: number, w: number, d: number, art: string, inf: Info, o: { pos?: V3; edge?: string; tilt?: number; rotY?: number; delay?: number } = {}) {
    return this.add({ id, kind: 'board', props: { w, d, art, h: BH, edge: o.edge, tilt: o.tilt }, keys: [{ step, pos: o.pos ?? [0, 0, 0], rotY: o.rotY, delay: o.delay }], info: inf })
  }
  die(id: string, step: number, pos: V3, value: number, inf: Info, o: { color?: string; ink?: string; delay?: number; size?: number } = {}) {
    return this.add({
      id, kind: 'die', tumble: true, info: inf,
      props: { sides: 6, value, color: o.color ?? '#f7f1e3', ink: o.ink ?? '#2e2622', size: o.size ?? 0.9 },
      keys: [{ step, pos, rotY: 0.3, delay: o.delay }],
    })
  }
  deck(id: string, step: number, pos: V3, count: number, face: Face, inf: Info, o: { w?: number; d?: number; rotY?: number; delay?: number } = {}) {
    return this.add({ id, kind: 'stack', props: { w: o.w ?? 0.9, d: o.d ?? 1.26, count, face }, keys: [{ step, pos, rotY: o.rotY, delay: o.delay }], info: inf })
  }
  sheet(id: string, step: number, pos: V3, w: number, d: number, face: Face, inf: Info, o: { rotY?: number; delay?: number } = {}) {
    return this.add({ id, kind: 'card', props: { w, d, face, faceUp: true }, keys: [{ step, pos, rotY: o.rotY, delay: o.delay }], info: inf })
  }
  box(id: string, step: number, pos: V3, w: number, h: number, d: number, color: string, inf: Info, o: { rotY?: number; delay?: number; round?: boolean; top?: Face } = {}) {
    return this.add({ id, kind: 'block', props: { w, h, d, color, round: o.round, top: o.top }, keys: [{ step, pos, rotY: o.rotY, delay: o.delay }], info: inf })
  }
  disc(id: string, step: number, pos: V3, r: number, h: number, color: string, inf: Info, o: { delay?: number; label?: string; ink?: string } = {}) {
    return this.add({ id, kind: 'token', props: { r, h, color, label: o.label, ink: o.ink }, keys: [{ step, pos, delay: o.delay }], info: inf })
  }
  pawn(id: string, step: number, pos: V3, color: string, inf: Info, o: { delay?: number; scale?: number } = {}) {
    return this.add({ id, kind: 'mini', props: { color, scale: o.scale ?? 0.8 }, keys: [{ step, pos, delay: o.delay }], info: inf })
  }
}

export const game = (
  id: string, title: string, players: [number, number], defaultPlayers: number, playTime: string,
  difficulty: GameMeta['difficulty'], blurb: string, swatch: string[], build: (n: number) => GameSetup,
): GameDef => ({ id, meta: { title, players, defaultPlayers, playTime, difficulty, blurb, swatch }, build })
