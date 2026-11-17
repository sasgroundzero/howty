/** Pure board geometry shared by the board artwork and the game data. UV = [0..1, 0..1], v grows toward the near edge. */
export type UV = [number, number]

/** Square boards: n cells of `cell` plus a margin all round. */
export const sqSize = (n: number, cell: number, margin: number) => n * cell + margin * 2
export const SQ8 = { n: 8, cell: 1.2, margin: 0.4 }
export const SQ10 = { n: 10, cell: 1, margin: 0.3 }
export const SEA = { n: 10, cell: 0.5, margin: 0.4 }
export const SQ20 = { n: 20, cell: 0.5, margin: 0.3 }
export const SQ15 = { n: 15, cell: 0.68, margin: 0.3 }

/** Property-trading ring: 40 spaces, 0 is the near-right corner, running clockwise. */
export const RING_K = 0.135
const RING_S = (1 - 2 * RING_K) / 9
export function ringCenter(i: number): UV {
  const side = Math.floor(i / 10) % 4
  const j = i % 10
  const a = j === 0 ? RING_K / 2 : RING_K + (j - 0.5) * RING_S
  const e = RING_K / 2
  return side === 0 ? [1 - a, 1 - e] : side === 1 ? [e, 1 - a] : side === 2 ? [a, e] : [1 - e, a]
}
export function ringRect(i: number) {
  const [u, v] = ringCenter(i)
  const side = Math.floor(i / 10) % 4
  const corner = i % 10 === 0
  const w = corner || side % 2 === 1 ? RING_K : RING_S
  const h = corner || side % 2 === 0 ? RING_K : RING_S
  return { x: u - w / 2, y: v - h / 2, w, h, side, corner }
}

/** A path that snakes up the board from the near-left corner. */
export function snake(n: number, cols: number, mx = 0.08, my = 0.1): UV[] {
  const rows = Math.ceil(n / cols)
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / cols)
    const c = row % 2 ? cols - 1 - (i % cols) : i % cols
    return [mx + ((c + 0.5) * (1 - 2 * mx)) / cols, 1 - my - ((row + 0.5) * (1 - 2 * my)) / rows] as UV
  })
}
export const CANDY_PATH = snake(60, 10)
export const LIFE_PATH = snake(48, 8)
export const SKETCH_PATH = snake(55, 11)
export const BRAIN_PATH = snake(40, 8)

/** Trivia wheel: 42 rim spaces (every 7th is a wedge space), 6 spokes of 5, one hub. */
export const WHEEL_R = 0.43
export const wheelRim = (i: number): UV => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / 42
  return [0.5 + WHEEL_R * Math.cos(a), 0.5 + WHEEL_R * Math.sin(a)]
}
/** j = 1 is next to the hub, j = 5 is next to the rim. */
export const wheelSpoke = (k: number, j: number): UV => {
  const a = -Math.PI / 2 + (k * Math.PI * 2) / 6
  const r = (WHEEL_R * j) / 6
  return [0.5 + r * Math.cos(a), 0.5 + r * Math.sin(a)]
}

/** Mystery mansion: 9 rooms round the edge, the solution envelope in the middle. */
export const ROOMS: { name: string; r: [number, number, number, number] }[] = [
  { name: 'KITCHEN', r: [0.04, 0.04, 0.3, 0.28] },
  { name: 'BALLROOM', r: [0.37, 0.04, 0.63, 0.3] },
  { name: 'CONSERVATORY', r: [0.7, 0.04, 0.96, 0.26] },
  { name: 'DINING ROOM', r: [0.04, 0.38, 0.3, 0.64] },
  { name: 'BILLIARD ROOM', r: [0.72, 0.33, 0.96, 0.49] },
  { name: 'LIBRARY', r: [0.72, 0.55, 0.96, 0.7] },
  { name: 'LOUNGE', r: [0.04, 0.74, 0.3, 0.96] },
  { name: 'HALL', r: [0.38, 0.72, 0.62, 0.96] },
  { name: 'STUDY', r: [0.72, 0.78, 0.96, 0.96] },
]
export const roomCenter = (i: number): UV => [(ROOMS[i].r[0] + ROOMS[i].r[2]) / 2, (ROOMS[i].r[1] + ROOMS[i].r[3]) / 2 + 0.03]
export const MANSION_STARTS: UV[] = [[0.66, 0.975], [0.975, 0.74], [0.66, 0.025], [0.34, 0.025], [0.025, 0.33], [0.025, 0.69]]

/** World conquest map: six continents, 42 territories. */
export const CONTINENTS: { name: string; color: string; r: [number, number, number, number]; cols: number; n: number }[] = [
  { name: 'NORTH AMERICA', color: '#e3c15a', r: [0.03, 0.07, 0.31, 0.5], cols: 3, n: 9 },
  { name: 'SOUTH AMERICA', color: '#d9824a', r: [0.12, 0.58, 0.31, 0.95], cols: 2, n: 4 },
  { name: 'EUROPE', color: '#6f95c9', r: [0.36, 0.07, 0.58, 0.46], cols: 3, n: 7 },
  { name: 'AFRICA', color: '#b98a5e', r: [0.37, 0.54, 0.57, 0.95], cols: 2, n: 6 },
  { name: 'ASIA', color: '#7fb069', r: [0.63, 0.05, 0.97, 0.56], cols: 4, n: 12 },
  { name: 'AUSTRALIA', color: '#a779b8', r: [0.72, 0.65, 0.93, 0.95], cols: 2, n: 4 },
]
export const TERRITORIES: UV[] = CONTINENTS.flatMap((k) => {
  const rows = Math.ceil(k.n / k.cols)
  const [x0, y0, x1, y1] = k.r
  return Array.from({ length: k.n }, (_, i) => {
    const row = Math.floor(i / k.cols)
    const inRow = row === rows - 1 ? k.n - row * k.cols : k.cols
    const c = (i % k.cols) + (k.cols - inRow) / 2
    return [x0 + ((c + 0.5) * (x1 - x0)) / k.cols, y0 + 0.07 + ((row + 0.5) * (y1 - y0 - 0.08)) / rows] as UV
  })
})

/** Pit-and-stones board: pit(side, i) with i counted left to right from that player's seat. */
export const PITS = { w: 12.4, d: 4, gap: 1.3, row: 0.9, store: 5.35 }
export const pitXZ = (side: number, i: number): [number, number] => [(side ? -1 : 1) * (i - 2.5) * PITS.gap, side ? -PITS.row : PITS.row]
export const storeXZ = (side: number): [number, number] => [side ? -PITS.store : PITS.store, 0]

/** Word-game premium squares, by distance from the nearest edges. */
export function premium(c: number, r: number): 'TW' | 'DW' | 'TL' | 'DL' | '' {
  const a = Math.min(r, 14 - r)
  const b = Math.min(c, 14 - c)
  const k = `${a},${b}`
  if (['0,0', '0,7', '7,0'].includes(k)) return 'TW'
  if (['1,1', '2,2', '3,3', '4,4', '7,7'].includes(k)) return 'DW'
  if (['1,5', '5,1', '5,5'].includes(k)) return 'TL'
  if (['0,3', '3,0', '2,6', '6,2', '3,7', '7,3', '6,6'].includes(k)) return 'DL'
  return ''
}

/* ---- Generic boards (art ids "g:style:arg:bg:accent:label", see genericArt) ---- */
const GM = 0.05
/** Cell centers of a C x R square grid board; row 0 is the near row. */
export const gridUV = (C: number, R: number) => (c: number, r: number): UV => [GM + ((c + 0.5) * (1 - 2 * GM)) / C, 1 - GM - ((r + 0.5) * (1 - 2 * GM)) / R]
/** Cell centers of a C x R hex board (odd rows shifted half a cell right); row 0 is the near row. */
export const hexUV = (C: number, R: number) => (c: number, r: number): UV => [GM + ((c + 0.5 + (r % 2) * 0.5) * (1 - 2 * GM)) / (C + 0.5), 1 - GM - ((r + 0.5) * (1 - 2 * GM)) / R]
/** A loop of 4k spaces round the board edge; space 0 is the near-right corner, then clockwise. */
export const loopUV = (k: number) => (i: number): UV => {
  const s = 1 / (k + 1)
  const t = (((i % (4 * k)) + 4 * k) % (4 * k)) % k
  const a = s / 2 + t * s
  return [[1 - a, 1 - s / 2], [s / 2, 1 - a], [a, s / 2], [1 - s / 2, a]][Math.floor((((i % (4 * k)) + 4 * k) % (4 * k)) / k)] as UV
}
/** Action spaces of a "slots" board: C x R boxes inside the score track; slot 0 is far-left, reading order. */
export const slotUV = (C: number, R: number) => (i: number): UV => [0.14 + (((i % C) + 0.5) * 0.72) / C, 0.16 + ((Math.floor(i / C) + 0.5) * 0.68) / R]
/** Lanes running away from you: lane 0 is the left one, t = 0 at the near end and 1 at the far end. */
export const laneUV = (k: number) => (lane: number, t: number): UV => [GM + ((lane + 0.5) * (1 - 2 * GM)) / k, 0.9 - t * 0.8]
/** The 15 cities of a "map" board (3 rows of 5; city 0 is far-left) and the routes that join them. */
export const cityUV = (i: number): UV => [0.12 + (i % 5) * 0.19 + 0.05 * Math.sin(i * 2.4), 0.2 + Math.floor(i / 5) * 0.3 + 0.06 * Math.cos(i * 1.7)]
export const CITY_LINKS: [number, number][] = Array.from({ length: 15 }, (_, i) => [...(i % 5 < 4 ? [[i, i + 1]] : []), ...(i < 10 ? [[i, i + 5]] : []), ...(i % 5 < 4 && i < 10 && i % 2 ? [[i, i + 6]] : [])] as [number, number][]).flat()
