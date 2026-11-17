/**
 * Declarative table composer. A game lists WHAT goes on the table and in which zone;
 * the composer works out where, sizes the table, aims the camera and checks for overlaps.
 *
 * Zones (each call is one row of items, laid out left to right):
 *   C(...)  centre of the table, rows stacked far to near (put the board here)
 *   R(...)  right of the centre, L(...) left of it: shared supplies and markets
 *   P(...)  one copy in front of EVERY player; the first P row is nearest the centre
 *   On(parent, u, v, item)   on top of a placed item, at UV of its footprint (v = 0 far edge, 1 near edge)
 *   OnP(parent, u, v, item, [dx, dz])  one per player on a shared parent, fanned out by dx/dz
 *   OnMe(parent, u, v, item)  only on your own copy of a per-player parent
 * Ids: an item with n copies makes pieces "id.0", "id.1"...; per-player items add "@seat"
 * ("hand.2@1"). A bare id means seat 0 (you). Color '$' means "the owner's player color".
 * Seat 0 is you, on the near side; seats then run clockwise.
 *
 * Focus strings: 'all', 'c', 'r', 'l', 'you', or any item/piece id.
 */
import { Builder } from '../../engine/builder'
import type { AnyPiece, Face, Focus, GameDef, GameMeta, GameSetup, V3 } from '../../engine/types'
import { BH, COLORS, cam, game } from './kit'

type Made = { kind: string; props: Record<string, unknown>; tumble?: boolean }
export interface Item {
  id: string; w: number; d: number; top: number; title: string; body: string
  n: number; cols: number; gap: number; stagger?: boolean; ghost?: boolean; cluster?: boolean
  /** `seat` is '@0' for you, '@1', '@2'... for the other players, and '' for a shared item. */
  make: (playerColor: string, k: number, seat?: string) => Made
}
interface Opt { n?: number; cols?: number; gap?: number; /** shift every other row half a step, for hex tiles */ stagger?: boolean }
const mk = (id: string, w: number, d: number, top: number, title: string, body: string, make: Item['make'], o: Opt = {}): Item => ({
  id, w, d, top, title, body, make, n: o.n ?? 1, cols: o.cols ?? o.n ?? 1, gap: o.gap ?? 0.14, stagger: o.stagger,
})
const pick = <T,>(v: T | T[], k: number): T => (Array.isArray(v) ? v[k % v.length] : v)
const col = (c: string, pc: string) => (c === '$' ? pc : c)

/** Card-face shorthands: a colored panel with a glyph, or a pale card with a title and subtitle. */
export const f = (panel: string, glyph = '', ink = '#ffffff'): Face => ({ panel, glyph, ink })
export const ft = (bg: string, title: string, sub = '', glyph = ''): Face => ({ bg, border: '#2b241c', ink: '#2b241c', title, sub, glyph })

export const board = (id: string, w: number, d: number, art: string, title: string, body: string, edge = '#3a2c20') =>
  mk(id, w, d, BH, title, body, () => ({ kind: 'board', props: { w, d, art, h: BH, edge } }))
/** A flat player board or mat. Color '$' gives a pale mat edged in the player's color. */
export const mat = (id: string, w: number, d: number, color: string, label: string, title: string, body: string) =>
  mk(id, w, d, 0.02, title, body, (pc) => ({ kind: 'mat', props: { w, d, color: color === '$' ? '#efe6d2' : color, border: color === '$' ? pc : '#3a2c20', label, labelAt: 'corner', ink: '#2b241c' } }))
/** A dashed outline that reserves an empty space (discard pile, play area, tableau). */
export const zone = (id: string, w: number, d: number, label: string, body: string): Item => ({
  ...mk(id, w, d, 0, label, body, () => ({ kind: 'mat', props: { w, d, color: '#ffffff', border: '#2b241c', label, labelAt: 'center', ink: '#2b241c', opacity: 0.3, dashed: true } })),
  ghost: true,
})
export const deck = (id: string, count: number, face: Face | Face[], title: string, body: string, o: Opt & { w?: number; d?: number; per?: number } = {}) => {
  const [w, d, per] = [o.w ?? 0.9, o.d ?? 1.26, o.per ?? 0.012]
  return mk(id, w, d, count * per, title, body, (_, k) => ({ kind: 'stack', props: { w, d, count, face: pick(face, k), per } }), o)
}
/** n single cards in a row (or grid with `cols`). `down` deals them face down. */
export const cards = (id: string, n: number, face: Face | Face[], title: string, body: string, o: Opt & { w?: number; d?: number; down?: boolean; back?: Face } = {}) => {
  const [w, d] = [o.w ?? 0.9, o.d ?? 1.26]
  return mk(id, w, d, 0.015, title, body, (_, k) => ({ kind: 'card', props: { w, d, face: pick(face, k), faceUp: !o.down, ...(o.back ? { back: o.back } : {}) } }), { ...o, n })
}
/** n thick tiles; `face` is a Face or a plain color. */
export const tiles = (id: string, n: number, w: number, d: number, face: Face | string | (Face | string)[], title: string, body: string, o: Opt & { h?: number } = {}) =>
  mk(id, w, d, o.h ?? 0.08, title, body, (pc, k) => {
    const v = pick(face as (Face | string)[] | Face | string, k)
    return { kind: 'block', props: typeof v === 'string' ? { w, h: o.h ?? 0.08, d, color: col(v, pc) } : { w, h: o.h ?? 0.08, d, color: '#e9dfc8', top: v } }
  }, { ...o, n })
export const discs = (id: string, n: number, r: number, color: string | string[], title: string, body: string, o: Opt & { label?: string | string[]; h?: number; ink?: string } = {}) =>
  mk(id, r * 2, r * 2, o.h ?? 0.12, title, body, (pc, k) => ({ kind: 'token', props: { r, h: o.h ?? 0.12, color: col(pick(color, k), pc), label: o.label ? pick(o.label, k) : undefined, ink: o.ink } }), { ...o, n })
export const cubes = (id: string, n: number, color: string | string[], title: string, body: string, o: Opt & { s?: number } = {}) => {
  const s = o.s ?? 0.3
  return mk(id, s, s, s, title, body, (pc, k) => ({ kind: 'block', props: { w: s, h: s, d: s, color: col(pick(color, k), pc) } }), { ...o, n })
}
/** n standing figures: scale 0.7 is a pawn, 0.5 a meeple. */
export const pawns = (id: string, n: number, color: string | string[], title: string, body: string, o: Opt & { scale?: number; shape?: 'hero' | 'brute' | 'boss' } = {}) => {
  const s = o.scale ?? 0.7
  return mk(id, s * 0.8, s * 0.8, s, title, body, (pc, k) => ({ kind: 'mini', props: { color: col(pick(color, k), pc), scale: s, shape: o.shape } }), { ...o, n })
}
export const dice = (id: string, n: number, color: string | string[], title: string, body: string, o: Opt & { values?: number[]; ink?: string; sides?: 4 | 6 | 8 | 10 | 12 | 20; size?: number } = {}) => {
  const s = o.size ?? 0.7
  return mk(id, s * 1.1, s * 1.1, s, title, body, (pc, k) => ({ kind: 'die', tumble: true, props: { sides: o.sides ?? 6, value: o.values?.[k] ?? ((k * 2) % 6) + 1, color: col(pick(color, k), pc), ink: o.ink ?? '#2e2622', size: s } }), { ...o, n })
}
export const hexes = (id: string, n: number, r: number, color: string | string[], title: string, body: string, o: Opt & { label?: string | string[] } = {}) =>
  mk(id, r * 1.75, r * 2, 0.14, title, body, (pc, k) => ({ kind: 'hex', props: { r, color: col(pick(color, k), pc), label: o.label ? pick(o.label, k) : undefined } }), { ...o, n })
/** A solid box, tray, bag (round) or tower. */
export const box = (id: string, w: number, h: number, d: number, color: string, title: string, body: string, o: { round?: boolean; top?: Face } = {}) =>
  mk(id, w, d, h, title, body, (pc) => ({ kind: 'block', props: { w, h, d, color: col(color, pc), round: o.round, top: o.top } }))
/** A loose heap of small bits standing in for a whole supply (say how many there are in `body`). */
export const pile = (id: string, color: string | string[], title: string, body: string, shape: 'cube' | 'disc' | 'meeple' = 'cube'): Item => ({
  ...mk(id, 1.25, 0.95, 0.3, title, body, (pc, k) => {
    const c = col(pick(color, k), pc)
    return shape === 'disc' ? { kind: 'token', props: { r: 0.17, h: 0.1, color: c } } : shape === 'meeple' ? { kind: 'mini', props: { color: c, scale: 0.42 } } : { kind: 'block', props: { w: 0.26, h: 0.26, d: 0.26, color: c } }
  }, { n: 5 }),
  cluster: true,
})
const CLUSTER = [[-0.4, -0.2], [0, -0.26], [0.4, -0.2], [-0.2, 0.2], [0.2, 0.2]]

/* ---- Placements, steps and first-turn actions ---------------------------------- */
export interface Place { zone: 'c' | 'r' | 'l' | 'p' | 'on'; items: Item[]; parent?: string; u?: number; v?: number; per?: boolean; me?: boolean; spread?: [number, number] }
export const C = (...items: Item[]): Place => ({ zone: 'c', items })
export const R = (...items: Item[]): Place => ({ zone: 'r', items })
export const L = (...items: Item[]): Place => ({ zone: 'l', items })
export const P = (...items: Item[]): Place => ({ zone: 'p', items })
export const On = (parent: string, u: number, v: number, item: Item): Place => ({ zone: 'on', items: [item], parent, u, v })
export const OnP = (parent: string, u: number, v: number, item: Item, spread: [number, number] = [0.45, 0]): Place => ({ zone: 'on', items: [item], parent, u, v, per: true, spread })

/** Like On, but only on YOUR copy of a per-player parent (a first-player marker, say). */
export const OnMe = (parent: string, u: number, v: number, item: Item): Place => ({ zone: 'on', items: [item], parent, u, v, me: true })

export type FocusKey = string | Focus
export interface SetupStep { title: string; text: string; focus: FocusKey; places: Place[]; detail?: string }
export const S = (title: string, text: string, focus: FocusKey, places: Place[] = [], detail?: string): SetupStep => ({ title, text, focus, places, detail })

/** Where a moving piece lands: on top of `p` at UV, or beside it (dx to its owner's right, dz toward its owner). */
export interface Tgt { p: string; u?: number; v?: number; lift?: number; dx?: number; dz?: number }
export const at = (p: string, u = 0.5, v = 0.5, lift = 0): Tgt => ({ p, u, v, lift })
export const by = (p: string, dx: number, dz: number): Tgt => ({ p, dx, dz })

export type Act =
  | { a: 'mv'; id: string; to: Tgt; delay?: number }
  | { a: 'draw'; from: string; to: Tgt; face?: Face; id?: string; delay?: number }
  | { a: 'spawn'; item: Item; to: Tgt; from?: string; color?: string; delay?: number }
  | { a: 'set'; id: string; props: Record<string, unknown> }
  | { a: 'hide'; id: string; delay?: number }
/** Slide a piece somewhere else. */
export const mv = (id: string, to: Tgt, delay?: number): Act => ({ a: 'mv', id, to, delay })
/** Take the top card of a deck. Give a `face` to reveal it, and an `id` to move it again later. */
export const draw = (from: string, to: Tgt, face?: Face, id?: string, delay?: number): Act => ({ a: 'draw', from, to, face, id, delay })
/** Bring a new piece onto the table, flying in from `from` if given. `color` resolves '$'. */
export const spawn = (item: Item, to: Tgt, from?: string, color?: string, delay?: number): Act => ({ a: 'spawn', item, to, from, color, delay })
/** Change a piece's props (a deck's count, a card's faceUp, a token's label...). */
export const set = (id: string, props: Record<string, unknown>): Act => ({ a: 'set', id, props })
export const roll = (id: string, value: number): Act => ({ a: 'set', id, props: { value } })
export const flip = (id: string, faceUp = true): Act => ({ a: 'set', id, props: { faceUp } })
export const hide = (id: string, delay?: number): Act => ({ a: 'hide', id, delay })

export interface TurnStep { title: string; text: string; focus: FocusKey; acts: Act[]; dur: number }
export const T = (title: string, text: string, focus: FocusKey, acts: Act[] = [], dur = 7): TurnStep => ({ title, text, focus, acts, dur })
export interface Spec { setup: SetupStep[]; turn: TurnStep[] }

/* ---- Layout ---------------------------------------------------------------------- */
interface Rect { x: number; z: number; w: number; d: number; rot: number; y: number; top: number; ghost?: boolean; piece?: boolean; gone?: boolean }
const GAP = 0.5
const foot = (it: Item): [number, number] => {
  if (it.cluster) return [it.w, it.d]
  const rows = Math.ceil(it.n / it.cols)
  return [(it.cols + (it.stagger ? 0.5 : 0)) * it.w + (it.cols - 1) * it.gap, it.stagger ? (rows - 1) * (it.d * 0.75 + it.gap) + it.d : rows * it.d + (rows - 1) * it.gap]
}
const rowSize = (row: Item[]): [number, number] => [row.reduce((a, it) => a + foot(it)[0], 0) + GAP * (row.length - 1), Math.max(...row.map((it) => foot(it)[1]))]
const blockSize = (rows: Item[][]): [number, number] => (rows.length ? [Math.max(...rows.map((r) => rowSize(r)[0])), rows.reduce((a, r) => a + rowSize(r)[1], 0) + GAP * (rows.length - 1)] : [0, 0])

/** Overlap warnings from the last build of each game, for scripts/check-games. */
export const AUDIT: Record<string, string[]> = {}

export function compose(gameId: string, n: number, spec: Spec): GameSetup {
  const b = new Builder()
  const rects = new Map<string, Rect>()
  const pieces = new Map<string, AnyPiece>()
  const perPlayer = new Set<string>()
  const warn: string[] = []
  const fail = (m: string): never => {
    throw new Error(`[${gameId}] ${m}`)
  }
  /** A seat number past the last player wraps round, so "@2" still works in a 2-player game. */
  const norm = (id: string) => id.replace(/@(\d+)$/, (_, k) => `@${Number(k) % n}`)
  const rect = (raw: string, id = norm(raw)) => rects.get(id) ?? rects.get(`${id}@0`) ?? fail(`unknown id "${id}"`)
  const pidOf = (raw: string, id = norm(raw)) => (pieces.has(id) ? id : pieces.has(`${id}@0`) ? `${id}@0` : pieces.has(`${id}.0`) ? `${id}.0` : `${id}.0@0`)
  const pieceOf = (id: string) => pieces.get(pidOf(id)) ?? fail(`"${id}" is not a single piece`)

  const rowsOf = (z: Place['zone']) => spec.setup.flatMap((s, step) => s.places.filter((p) => p.zone === z).map((p) => ({ items: p.items, step })))
  const [cRows, rRows, lRows, pRows] = [rowsOf('c'), rowsOf('r'), rowsOf('l'), rowsOf('p')]
  const [cW, cD] = blockSize(cRows.map((r) => r.items))
  const [pW, pD] = blockSize(pRows.map((r) => r.items))
  const near = Math.ceil(n / 2)
  const pitch = Math.max(pW, 3) + 1.4
  const z0 = Math.max(cD / 2, 1) + 1
  const seatX = (i: number) => (i < near ? ((near - 1) / 2 - i) * pitch : (i - near - (n - near - 1) / 2) * pitch)
  const xs = Math.max(cW / 2, ((near - 1) * pitch + pW) / 2) + 1.3

  let order = 0
  /** Puts every copy of an item down with its footprint centred on (cx, cz). */
  const put = (it: Item, cx: number, cz: number, rot: number, y: number, step: number, suffix: string, pc: string, from?: V3, delay?: number) => {
    const s = Math.cos(rot) < 0 ? -1 : 1
    const [fw, fd] = foot(it)
    const rows = Math.ceil(it.n / it.cols)
    for (let k = 0; k < it.n; k++) {
      const [dx, dz] = it.cluster
        ? CLUSTER[k % 5]
        : [((k % it.cols) - (it.cols - 1) / 2 + (it.stagger && Math.floor(k / it.cols) % 2 ? 0.5 : 0)) * (it.w + it.gap), (Math.floor(k / it.cols) - (rows - 1) / 2) * (it.stagger ? it.d * 0.75 + it.gap : it.d + it.gap)]
      const id = it.id + (it.n > 1 ? `.${k}` : '') + suffix
      if (pieces.has(id)) fail(`duplicate id "${id}"`)
      const m = it.make(pc, k, suffix)
      const pos: V3 = [cx + s * dx, y, cz + s * dz]
      const piece = { id, kind: m.kind, props: m.props, tumble: m.tumble, spawnFrom: from, info: { title: it.title, body: it.body }, keys: [{ step, pos, rotY: rot, delay: delay ?? Math.min(1.4, (order++ % 24) * 0.06) }] } as unknown as AnyPiece
      pieces.set(id, b.add(piece as never) as AnyPiece)
      const sub = it.cluster ? 0.3 : 1
      rects.set(id, { x: pos[0], z: pos[2], w: it.cluster ? 0.3 : it.w, d: it.cluster ? 0.3 : it.d, rot, y, top: y + it.top * sub + (it.cluster ? 0 : 0), ghost: it.ghost, piece: true })
    }
    if (it.n > 1) rects.set(it.id + suffix, { x: cx, z: cz, w: fw, d: fd, rot, y, top: y + it.top })
  }
  /** Lays rows out inside a block whose top-left corner (as its owner sees it) is at local (x0, z0). */
  const flow = (rows: { items: Item[]; step: number }[], place: (it: Item, lx: number, lz: number, step: number) => void, align: -1 | 0 | 1, blockW: number) => {
    let z = 0
    rows.forEach((r) => {
      const [w, d] = rowSize(r.items)
      let x = align === 0 ? -w / 2 : align === -1 ? 0 : blockW - w
      r.items.forEach((it) => {
        const [fw] = foot(it)
        place(it, x + fw / 2, z + d / 2, r.step)
        x += fw + GAP
      })
      z += d + GAP
    })
  }
  const bounds = (key: string, x: number, z: number, w: number, d: number) => rects.set(key, { x, z, w: Math.max(w, 2), d: Math.max(d, 2), rot: 0, y: 0, top: 0, ghost: true })

  flow(cRows, (it, lx, lz, step) => put(it, lx, lz - cD / 2, 0, 0, step, '', COLORS[0]), 0, cW)
  bounds('c', 0, 0, cW, cD)
  const [rW, rD] = blockSize(rRows.map((r) => r.items))
  flow(rRows, (it, lx, lz, step) => put(it, xs + lx, lz - rD / 2, 0, 0, step, '', COLORS[0]), -1, rW)
  bounds('r', xs + rW / 2, 0, rW, rD)
  const [lW, lD] = blockSize(lRows.map((r) => r.items))
  flow(lRows, (it, lx, lz, step) => put(it, -xs - lW + lx, lz - lD / 2, 0, 0, step, '', COLORS[0]), 1, lW)
  bounds('l', -xs - lW / 2, 0, lW, lD)
  for (let i = 0; i < n; i++) {
    const s = i < near ? 1 : -1
    order = i * 3
    flow(pRows, (it, lx, lz, step) => put(it, seatX(i) + s * lx, s * (z0 + lz), s > 0 ? 0 : Math.PI, 0, step, `@${i}`, COLORS[i % COLORS.length]), 0, pW)
    bounds(`seat${i}`, seatX(i), s * (z0 + pD / 2), pW, pD)
  }
  pRows.forEach((r) => r.items.forEach((it) => perPlayer.add(it.id)))
  rects.set('you', rects.get('seat0')!)

  const resolve = (t: Tgt): { pos: V3; rot: number } => {
    const r = rect(t.p)
    const s = Math.cos(r.rot) < 0 ? -1 : 1
    return t.dx !== undefined || t.dz !== undefined
      ? { pos: [r.x + s * (t.dx ?? 0), r.y, r.z + s * (t.dz ?? 0)], rot: r.rot }
      : { pos: [r.x + s * ((t.u ?? 0.5) - 0.5) * r.w, r.top + (t.lift ?? 0), r.z + s * ((t.v ?? 0.5) - 0.5) * r.d], rot: r.rot }
  }
  spec.setup.forEach((s, step) =>
    s.places.filter((p) => p.zone === 'on').forEach((p) => {
      const it = p.items[0]
      const own = perPlayer.has(p.parent!) && !p.me
      order = 0
      for (let i = 0; i < (own || p.per ? n : 1); i++) {
        const { pos, rot } = resolve(at(own ? `${p.parent}@${i}` : p.parent!, p.u, p.v))
        const off = p.per && !own ? i - (n - 1) / 2 : 0
        put(it, pos[0] + off * (p.spread?.[0] ?? 0), pos[2] + off * (p.spread?.[1] ?? 0), rot, pos[1], step, own || p.per ? `@${i}` : '', COLORS[i % COLORS.length])
      }
      if (own || p.per) perPlayer.add(it.id)
    }),
  )

  /* Table size and camera */
  const live = () => [...rects.entries()].filter(([, r]) => r.piece && !r.gone)
  const ext = (axis: 'x' | 'z') => Math.max(...live().map(([, r]) => Math.abs(r[axis]) + (axis === 'x' ? r.w : r.d) / 2))
  // a small game gets a smaller table, and the overview camera frames what is on it rather than the bare wood
  const table = { w: Math.max(20, ext('x') * 2 + 4), d: Math.max(14, ext('z') * 2 + 3.5) }
  bounds('all', 0, 0, Math.max(11, ext('x') * 2 + 1.5), Math.max(8, ext('z') * 2 + 1.5))
  const focus = (k: FocusKey): Focus => {
    if (typeof k !== 'string') return k
    const r = rect(k)
    const h = Math.max(5.5, (r.w + 3) / 1.5, (r.d + 3) / 0.85)
    return cam(r.x, h, r.z + h * 0.8, r.x, 0, r.z + h * 0.1)
  }
  const audit = (label: string) => {
    const xs = live().filter(([, r]) => !r.ghost)
    xs.forEach(([a, p], i) =>
      xs.slice(i + 1).forEach(([c, q]) => {
        if (Math.abs(p.y - q.y) < 0.012 && Math.abs(p.x - q.x) < (p.w + q.w) / 2 - 0.06 && Math.abs(p.z - q.z) < (p.d + q.d) / 2 - 0.06) warn.push(`${label}: ${a} overlaps ${c}`)
      }),
    )
  }

  spec.setup.forEach((s) => {
    const needs = [...new Set(s.places.flatMap((p) => p.items.filter((it) => !it.ghost).map((it) => it.title)))]
    b.step({ title: s.title, instruction: s.text, detail: s.detail, needs: needs.length ? needs : undefined, focus: focus(s.focus) })
  })
  audit(`setup n=${n}`)

  let auto = 0
  spec.turn.forEach((t, ti) => {
    const step = spec.setup.length + ti
    t.acts.forEach((act, ai) => {
      const delay = 'delay' in act && act.delay !== undefined ? act.delay : 0.3 + ai * 0.5
      if (act.a === 'mv') {
        const id = pidOf(act.id)
        const [p, r] = [pieceOf(act.id), rect(id)]
        const { pos, rot } = resolve(act.to)
        p.keys.push({ step, pos, rotY: rot, delay } as never)
        rects.set(id, { ...r, x: pos[0], z: pos[2], rot, top: pos[1] + (r.top - r.y), y: pos[1] })
      } else if (act.a === 'draw') {
        const [src, r] = [pieceOf(act.from), rect(pidOf(act.from))]
        const sp = src.props as { w: number; d: number; face: Face; count: number }
        const left = Math.max(1, ((src.keys.map((k) => (k.props as { count?: number } | undefined)?.count).filter(Boolean).pop() as number) ?? sp.count) - 1)
        src.keys.push({ step, pos: src.keys[src.keys.length - 1].pos, rotY: src.keys[src.keys.length - 1].rotY, props: { count: left }, delay } as never)
        const { pos, rot } = resolve(act.to)
        const item = cards(act.id ?? `${act.from}~${auto++}`, 1, act.face ?? sp.face, src.info?.title.replace(/ (deck|pile|stack)$/i, ' card') ?? 'Card', src.info?.body ?? '', { w: sp.w, d: sp.d, down: !act.face, back: sp.face })
        put(item, pos[0], pos[2], rot, pos[1], step, '', COLORS[0], [r.x, r.top + 0.2, r.z], delay)
      } else if (act.a === 'spawn') {
        const { pos, rot } = resolve(act.to)
        const fr = act.from ? rect(act.from) : undefined
        put(act.item, pos[0], pos[2], rot, pos[1], step, '', act.color ?? COLORS[0], fr ? [fr.x, fr.top + 0.2, fr.z] : undefined, delay)
      } else if (act.a === 'set') {
        const p = pieceOf(act.id)
        const last = p.keys[p.keys.length - 1]
        p.keys.push({ step, pos: last.pos, rotY: (last.rotY ?? 0) + (p.tumble ? 1 : 0), props: act.props, delay: 0.2 } as never)
      } else {
        const id = pidOf(act.id)
        const p = pieceOf(act.id)
        p.keys.push({ step, pos: p.keys[p.keys.length - 1].pos, hide: true, delay } as never)
        rects.get(id)!.gone = true
      }
    })
    b.turn({ title: t.title, instruction: t.text, focus: focus(t.focus), duration: t.dur })
    audit(`turn ${ti + 1} n=${n}`)
  })
  AUDIT[`${gameId}/${n}`] = warn
  return b.done(table)
}

/** A GameDef whose table is described with the composer. Player counts above 8 are not supported. */
export const tabletop = (
  id: string, title: string, players: [number, number], defaultPlayers: number, playTime: string,
  difficulty: GameMeta['difficulty'], blurb: string, swatch: string[], spec: (n: number) => Spec,
): GameDef => game(id, title, players, defaultPlayers, playTime, difficulty, blurb, swatch, (n) => compose(id, n, spec(n)))
