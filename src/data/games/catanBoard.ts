import type { CatanResource as Resource, CatanTerrain as Terrain, V3 } from '../../engine/types'
export type { Resource, Terrain }

export const RES: Record<Resource, { label: string; color: string }> = {
  lumber: { label: 'Lumber', color: '#2f7a3b' },
  brick: { label: 'Brick', color: '#c8643b' },
  wool: { label: 'Wool', color: '#8cc152' },
  grain: { label: 'Grain', color: '#e2b93b' },
  ore: { label: 'Ore', color: '#7d8590' },
}
export const RES_ORDER: Resource[] = ['lumber', 'brick', 'wool', 'grain', 'ore']

export const TERRAIN: Record<Terrain, { label: string; color: string; res: Resource | null; count: number }> = {
  forest: { label: 'Forest', color: '#2f7a3b', res: 'lumber', count: 4 },
  hills: { label: 'Hills', color: '#c8643b', res: 'brick', count: 3 },
  pasture: { label: 'Pasture', color: '#9ccb5a', res: 'wool', count: 4 },
  fields: { label: 'Fields', color: '#e8c547', res: 'grain', count: 4 },
  mountains: { label: 'Mountains', color: '#8a9099', res: 'ore', count: 3 },
  desert: { label: 'Desert', color: '#e3cf9a', res: null, count: 1 },
}

export const PLAYERS = [
  { name: 'Red', color: '#d64545', tint: '#f3d2cf' },
  { name: 'Blue', color: '#3b6fd6', tint: '#cfdcf5' },
  { name: 'White', color: '#f4f1e8', tint: '#efece4' },
  { name: 'Orange', color: '#f08a24', tint: '#f8dfc3' },
]

/** Seats go clockwise: south, west, north, east. Local +z points at the player. */
export const SEATS: { pos: V3; rot: number }[] = [
  { pos: [0, 0, 8.7], rot: 0 },
  { pos: [-10.6, 0, 0], rot: -Math.PI / 2 },
  { pos: [0, 0, -8.7], rot: Math.PI },
  { pos: [10.6, 0, 0], rot: Math.PI / 2 },
]
export const seatWorld = (seat: number, lx: number, y: number, lz: number): V3 => {
  const s = SEATS[seat]
  const c = Math.cos(s.rot)
  const sn = Math.sin(s.rot)
  return [s.pos[0] + lx * c + lz * sn, y, s.pos[2] - lx * sn + lz * c]
}

/* ---- Hex math (pointy-top, axial coordinates, circumradius 1) ------------ */

export const SQ3 = Math.sqrt(3)
export const DIRS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]
export const hexCenter = (q: number, r: number): [number, number] => [SQ3 * (q + r / 2), 1.5 * r]
export const hexCorner = (cx: number, cz: number, i: number): [number, number] => {
  const a = ((30 + 60 * i) * Math.PI) / 180
  return [cx + Math.cos(a), cz + Math.sin(a)]
}
export function ring(k: number) {
  if (k === 0) return [{ q: 0, r: 0 }]
  let q = DIRS[4][0] * k
  let r = DIRS[4][1] * k
  const out: { q: number; r: number }[] = []
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < k; j++) {
      out.push({ q, r })
      q += DIRS[i][0]
      r += DIRS[i][1]
    }
  return out
}

/** Outer ring, inner ring, center: the same spiral the rulebook uses for A to R. */
export const SPIRAL = [...ring(2), ...ring(1), ...ring(0)]
export const TERRAIN_ORDER: Terrain[] = [
  'forest', 'pasture', 'fields', 'hills', 'mountains', 'pasture',
  'forest', 'fields', 'hills', 'forest', 'pasture', 'mountains',
  'fields', 'forest', 'hills', 'pasture', 'fields', 'mountains',
]
export const TOKEN_ORDER = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11]
export const pips = (n: number) => 6 - Math.abs(7 - n)

export const TILE_TOP = 0.18
export const FRAME_TOP = 0.22
export const FRAME_IN = 4.75
export const FRAME_OUT = 6.0

export interface Tile {
  q: number
  r: number
  cx: number
  cz: number
  terrain: Terrain
  token: number | null
  letter: string | null
}
export const TILES: Tile[] = SPIRAL.map((h, i) => {
  const [cx, cz] = hexCenter(h.q, h.r)
  return {
    ...h,
    cx,
    cz,
    terrain: i < 18 ? TERRAIN_ORDER[i] : 'desert',
    token: i < 18 ? TOKEN_ORDER[i] : null,
    letter: i < 18 ? 'ABCDEFGHIJKLMNOPQR'[i] : null,
  }
})

/* ---- Board graph: corners (settlement spots) and edges (road spots) ------ */

export interface Vertex {
  id: number
  x: number
  z: number
  tiles: number[]
  adj: number[]
}
export const VERTS: Vertex[] = []
export const COAST: { mx: number; mz: number; ax: number; az: number; bx: number; bz: number; dx: number; dz: number }[] = []
;(() => {
  const byKey = new Map<string, Vertex>()
  const vkey = (x: number, z: number) => `${Math.round(x * 50)}|${Math.round(z * 50)}`
  TILES.forEach((t, ti) => {
    const ids: number[] = []
    for (let i = 0; i < 6; i++) {
      const [x, z] = hexCorner(t.cx, t.cz, i)
      let v = byKey.get(vkey(x, z))
      if (!v) {
        v = { id: VERTS.length, x, z, tiles: [], adj: [] }
        byKey.set(vkey(x, z), v)
        VERTS.push(v)
      }
      v.tiles.push(ti)
      ids.push(v.id)
    }
    for (let i = 0; i < 6; i++) {
      const a = VERTS[ids[i]]
      const b = VERTS[ids[(i + 1) % 6]]
      if (!a.adj.includes(b.id)) a.adj.push(b.id)
      if (!b.adj.includes(a.id)) b.adj.push(a.id)
      // An edge is coastline if no tile sits on its far side
      const mx = (a.x + b.x) / 2
      const mz = (a.z + b.z) / 2
      const nx = 2 * mx - t.cx
      const nz = 2 * mz - t.cz
      if (!TILES.some((o) => Math.hypot(o.cx - nx, o.cz - nz) < 0.2)) {
        const d = Math.hypot(mx - t.cx, mz - t.cz)
        COAST.push({ mx, mz, ax: a.x, az: a.z, bx: b.x, bz: b.z, dx: (mx - t.cx) / d, dz: (mz - t.cz) / d })
      }
    }
  })
  COAST.sort((p, q) => Math.atan2(p.mz, p.mx) - Math.atan2(q.mz, q.mx))
})()

export const HARBOR_SLOTS = [0, 3, 7, 10, 13, 17, 20, 23, 27]
export const HARBOR_TYPES: (Resource | null)[] = [null, 'wool', null, 'ore', 'grain', null, 'brick', 'lumber', null]

/** Deterministic opening: each player takes the best open corner, in snake order. */
export function openingPlacements(n: number) {
  const score = (v: Vertex) => {
    const kinds = new Set<string>()
    let s = 0
    v.tiles.forEach((ti) => {
      const t = TILES[ti]
      if (t.token) {
        s += pips(t.token)
        kinds.add(t.terrain)
      }
    })
    return s + kinds.size * 0.6
  }
  const taken = new Set<number>()
  const roads = new Set<string>()
  const open = (v: Vertex) => !taken.has(v.id) && !v.adj.some((a) => taken.has(a))
  const order = [...Array(n).keys(), ...[...Array(n).keys()].reverse()]
  return order.map((player, turn) => {
    const v = VERTS.filter(open).sort((a, b) => score(b) - score(a) || a.id - b.id)[0]
    taken.add(v.id)
    const w = v.adj
      .map((id) => VERTS[id])
      .filter((o) => !roads.has(`${Math.min(v.id, o.id)}-${Math.max(v.id, o.id)}`))
      .sort((a, b) => score(b) - score(a) || a.id - b.id)[0]
    roads.add(`${Math.min(v.id, w.id)}-${Math.max(v.id, w.id)}`)
    return { player, round: turn < n ? 1 : 2, order: turn < n ? turn : turn - n, v, w }
  })
}
export const BANK_X = 14.9
export const bankPos = (i: number): V3 => [BANK_X, 0.02, -3.6 + i * 1.5]
