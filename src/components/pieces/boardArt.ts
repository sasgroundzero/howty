/** Canvas artwork for every flat game board. Each routine registers itself in ART under a short id. */
import { roundRect } from '../../engine/util'
import * as L from '../../data/games/layouts'
import { ART } from './common'

type C = CanvasRenderingContext2D
const INK = '#2b241c'

function text(c: C, s: string, x: number, y: number, px: number, color = INK, rot = 0) {
  c.save()
  c.translate(x, y)
  c.rotate(rot)
  c.fillStyle = color
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.font = `bold ${px}px Georgia, serif`
  c.fillText(s, 0, 0)
  c.restore()
}
function dot(c: C, x: number, y: number, r: number, fill: string, stroke?: string, lw = 3) {
  c.beginPath()
  c.arc(x, y, r, 0, Math.PI * 2)
  c.fillStyle = fill
  c.fill()
  if (stroke) {
    c.strokeStyle = stroke
    c.lineWidth = lw
    c.stroke()
  }
}
function box(c: C, x: number, y: number, w: number, h: number, fill: string, stroke = INK, lw = 2) {
  c.fillStyle = fill
  c.fillRect(x, y, w, h)
  c.strokeStyle = stroke
  c.lineWidth = lw
  c.strokeRect(x, y, w, h)
}

/** A square grid board. `fill(col, row)` colors a cell; row 0 is the near row. */
function gridArt(
  g: { n: number; cell: number; margin: number }, bg: string, fill: (c: number, r: number) => string,
  o: { line?: string; labels?: string; after?: (c: C, cellAt: (col: number, row: number) => [number, number], cp: number) => void } = {},
) {
  return (c: C, W: number, H: number) => {
    const px = W / L.sqSize(g.n, g.cell, g.margin)
    const m = g.margin * px
    const cp = g.cell * px
    const cellAt = (col: number, row: number): [number, number] => [m + col * cp, H - m - (row + 1) * cp]
    c.fillStyle = bg
    c.fillRect(0, 0, W, H)
    for (let col = 0; col < g.n; col++)
      for (let row = 0; row < g.n; row++) {
        const [x, y] = cellAt(col, row)
        c.fillStyle = fill(col, row)
        c.fillRect(x, y, cp + 0.5, cp + 0.5)
        if (o.line) {
          c.strokeStyle = o.line
          c.lineWidth = Math.max(1, cp * 0.03)
          c.strokeRect(x, y, cp, cp)
        }
      }
    if (o.labels)
      for (let i = 0; i < g.n; i++) {
        text(c, String.fromCharCode(65 + i), m + (i + 0.5) * cp, H - m / 2, m * 0.6, o.labels)
        text(c, String(i + 1), m / 2, H - m - (i + 0.5) * cp, m * 0.6, o.labels)
      }
    o.after?.(c, cellAt, cp)
  }
}

ART['b:chess'] = gridArt(L.SQ8, '#4a3423', (c, r) => ((c + r) % 2 ? '#f0dcb8' : '#8a5a3c'), { labels: '#f0dcb8' })
ART['b:checkers'] = gridArt(L.SQ8, '#2f2620', (c, r) => ((c + r) % 2 ? '#e8d2ad' : '#3f5f48'))
ART['b:othello'] = gridArt(L.SQ8, '#1f2a22', () => '#2f8a57', {
  line: '#143524',
  after: (c, at, cp) => [[2, 2], [6, 2], [2, 6], [6, 6]].forEach(([x, y]) => dot(c, at(x, y)[0], at(x, y)[1] + cp, cp * 0.07, '#143524')),
})
ART['b:stratego'] = gridArt(L.SQ10, '#5b4a2e', (c, r) => ((r === 4 || r === 5) && [2, 3, 6, 7].includes(c) ? '#4f8fb5' : (c + r) % 2 ? '#b9c98a' : '#a9bb7a'), { line: '#6f7f4c' })
ART['b:sea'] = gridArt(L.SEA, '#1d3b57', () => '#3f7fb0', { line: '#cfe6f5', labels: '#ffffff' })
ART['b:target'] = gridArt(L.SEA, '#1d3b57', () => '#27557c', { line: '#9cc4de', labels: '#ffffff' })
ART['b:blokus'] = gridArt(L.SQ20, '#8d8d92', () => '#e9e9ec', { line: '#b9b9c0' })
const PREMIUM = { TW: '#d9584a', DW: '#eeb0a4', TL: '#3f86b8', DL: '#aed3e6', '': '#e8dfc6' }
ART['b:words'] = gridArt(L.SQ15, '#2f5d50', (c, r) => PREMIUM[L.premium(c, r)], {
  line: '#ffffff',
  after: (c, at, cp) => {
    for (let col = 0; col < 15; col++)
      for (let row = 0; row < 15; row++) {
        const p = L.premium(col, row)
        const [x, y] = at(col, row)
        if (col === 7 && row === 7) text(c, '★', x + cp / 2, y + cp / 2, cp * 0.7)
        else if (p) text(c, p, x + cp / 2, y + cp / 2, cp * 0.4, p === 'TW' || p === 'TL' ? '#ffffff' : INK)
      }
  },
})

/* ---- Property-trading ring ------------------------------------------------ */
const GROUPS: Record<number, string> = {
  1: '#8b5a3c', 3: '#8b5a3c', 6: '#9ed3ee', 8: '#9ed3ee', 9: '#9ed3ee', 11: '#d9539a', 13: '#d9539a', 14: '#d9539a',
  16: '#f0932b', 18: '#f0932b', 19: '#f0932b', 21: '#d63031', 23: '#d63031', 24: '#d63031', 26: '#f6d32d', 27: '#f6d32d', 29: '#f6d32d',
  31: '#2e9e5b', 32: '#2e9e5b', 34: '#2e9e5b', 37: '#2c4fa3', 39: '#2c4fa3',
}
const SPECIAL: Record<number, string> = { 2: 'CHEST', 17: 'CHEST', 33: 'CHEST', 7: '?', 22: '?', 36: '?', 4: 'TAX', 38: 'TAX', 5: 'RR', 15: 'RR', 25: 'RR', 35: 'RR', 12: 'UTIL', 28: 'UTIL' }
const CORNERS = ['GO', 'JAIL', 'FREE PARKING', 'GO TO JAIL']
ART['b:ring'] = (c, W, H) => {
  c.fillStyle = '#d3e8d6'
  c.fillRect(0, 0, W, H)
  for (let i = 0; i < 40; i++) {
    const q = L.ringRect(i)
    const [x, y, w, h] = [q.x * W, q.y * H, q.w * W, q.h * H]
    box(c, x, y, w, h, '#eef6ee')
    const rot = [0, Math.PI / 2, Math.PI, -Math.PI / 2][q.side]
    if (q.corner) {
      CORNERS[q.side].split(' ').forEach((word, k, all) => text(c, word, x + w / 2, y + h / 2 + (k - (all.length - 1) / 2) * 24, word.length > 5 ? 19 : 26, i === 0 ? '#c0392b' : INK))
      continue
    }
    if (GROUPS[i]) {
      const t = Math.min(w, h) * 0.5 > 30 ? 30 : 26
      const bar: [number, number, number, number] = q.side === 0 ? [x, y, w, t] : q.side === 1 ? [x + w - t, y, t, h] : q.side === 2 ? [x, y + h - t, w, t] : [x, y, t, h]
      box(c, ...bar, GROUPS[i])
    } else text(c, SPECIAL[i], x + w / 2, y + h / 2, SPECIAL[i].length > 2 ? 17 : 34, SPECIAL[i] === '?' ? '#d9772b' : '#555555', rot)
  }
  const slot = (cx: number, cy: number, label: string, color: string) => {
    c.save()
    c.translate(cx * W, cy * H)
    c.rotate(-Math.PI / 4)
    c.setLineDash([12, 8])
    c.strokeStyle = color
    c.lineWidth = 5
    c.strokeRect(-110, -70, 220, 140)
    c.restore()
    text(c, label, cx * W, cy * H + 0.105 * H, 22, color, -Math.PI / 4)
  }
  slot(0.3, 0.3, 'COMMUNITY CHEST', '#2e6fb7')
  slot(0.7, 0.7, 'CHANCE', '#d9772b')
  text(c, 'PROPERTY TRADING', W / 2, H / 2, 44, '#7fae8a', -Math.PI / 4)
}

/* ---- Mystery mansion ------------------------------------------------------- */
ART['b:mansion'] = (c, W, H) => {
  c.fillStyle = '#e2c98f'
  c.fillRect(0, 0, W, H)
  c.strokeStyle = 'rgba(90,60,20,0.35)'
  c.lineWidth = 1.5
  for (let i = 0; i <= 24; i++) {
    c.strokeRect((i * W) / 24, 0, 0, H)
    c.strokeRect(0, (i * H) / 24, W, 0)
  }
  L.ROOMS.forEach(({ name, r }) => {
    box(c, r[0] * W, r[1] * H, (r[2] - r[0]) * W, (r[3] - r[1]) * H, '#f4ecd6', '#5a4326', 6)
    text(c, name, ((r[0] + r[2]) / 2) * W, r[1] * H + 26, 21, '#5a4326')
  })
  box(c, 0.4 * W, 0.4 * H, 0.2 * W, 0.2 * H, '#7a2f2a', '#3a1513', 6)
  text(c, 'SOLUTION', W / 2, H * 0.58, 20, '#f4ecd6')
  L.MANSION_STARTS.forEach(([u, v], i) => dot(c, u * W, v * H, 20, ['#c0392b', '#e0b12f', '#f3f1ea', '#3d8b4a', '#2e6fb7', '#7a4fa3'][i], INK))
}

/* ---- Trivia wheel ---------------------------------------------------------- */
export const WEDGE_COLORS = ['#2e6fb7', '#d9539a', '#e0b12f', '#8b5a3c', '#3d8b4a', '#d9772b']
ART['b:wheel'] = (c, W, H) => {
  c.fillStyle = '#20324a'
  c.fillRect(0, 0, W, H)
  for (let i = 0; i < 42; i++) {
    const [u, v] = L.wheelRim(i)
    const hq = i % 7 === 0
    dot(c, u * W, v * H, hq ? 40 : 27, i % 7 === 3 ? '#f4f1e6' : WEDGE_COLORS[(i * 5 + (hq ? 0 : 2)) % 6], '#ffffff', hq ? 7 : 3)
    if (i % 7 === 3) text(c, '↻', u * W, v * H, 30)
  }
  for (let k = 0; k < 6; k++)
    for (let j = 1; j <= 5; j++) {
      const [u, v] = L.wheelSpoke(k, j)
      dot(c, u * W, v * H, 25, WEDGE_COLORS[(k + j * 2) % 6], '#ffffff')
    }
  c.beginPath()
  for (let k = 0; k < 6; k++) c.lineTo(W / 2 + 50 * Math.cos((k * Math.PI) / 3), H / 2 + 50 * Math.sin((k * Math.PI) / 3))
  c.closePath()
  c.fillStyle = '#f4f1e6'
  c.fill()
  text(c, 'HUB', W / 2, H / 2, 24)
}

/* ---- Winding paths --------------------------------------------------------- */
function pathArt(pts: L.UV[], bg: string, color: (i: number) => string, o: { start?: string; end?: string; mark?: (i: number) => string; size?: number } = {}) {
  return (c: C, W: number, H: number) => {
    c.fillStyle = bg
    c.fillRect(0, 0, W, H)
    c.strokeStyle = 'rgba(255,255,255,0.75)'
    c.lineWidth = 46
    c.lineJoin = 'round'
    c.beginPath()
    pts.forEach(([u, v]) => c.lineTo(u * W, v * H))
    c.stroke()
    const s = o.size ?? 58
    pts.forEach(([u, v], i) => {
      c.fillStyle = color(i)
      roundRect(c, u * W - s / 2, v * H - s / 2, s, s, 10)
      c.fill()
      c.strokeStyle = INK
      c.lineWidth = 2.5
      c.stroke()
      const m = o.mark?.(i)
      if (m) text(c, m, u * W, v * H + 2, m.length > 2 ? 17 : 26, '#ffffff')
    })
    if (o.start) text(c, o.start, pts[0][0] * W, pts[0][1] * H + s * 0.8, 22)
    const e = pts[pts.length - 1]
    if (o.end) text(c, o.end, e[0] * W, e[1] * H - s * 0.8, 24)
  }
}
export const SWEET = ['#d63031', '#7a4fa3', '#f1c40f', '#2e6fb7', '#e67e22', '#2e9e5b']
ART['b:candy'] = pathArt(L.CANDY_PATH, '#fbe3ee', (i) => (i === 0 ? '#ffffff' : i === 59 ? '#f7a8c8' : SWEET[(i - 1) % 6]), { start: 'START', end: 'CASTLE', mark: (i) => (i === 59 ? '♛' : [9, 22, 37, 48].includes(i) ? '★' : '') })
ART['b:life'] = pathArt(L.LIFE_PATH, '#7fbf7a', (i) => (i === 0 ? '#ffffff' : i === 47 ? '#f6d32d' : [8, 17, 26, 36].includes(i) ? '#d63031' : i % 6 === 3 ? '#2e9e5b' : '#f4f1e6'), {
  size: 70, start: 'START', end: 'RETIRE', mark: (i) => ([8, 17, 26, 36].includes(i) ? 'STOP' : i % 6 === 3 ? '$' : ''),
})
const SKETCH = [['P', '#e0b12f'], ['O', '#2e6fb7'], ['A', '#d9772b'], ['D', '#3d8b4a'], ['AP', '#c0392b']]
ART['b:sketch'] = pathArt(L.SKETCH_PATH, '#f3ead8', (i) => (i === 54 ? '#2b241c' : SKETCH[i % 5][1]), { size: 62, start: 'START', end: 'FINISH', mark: (i) => (i === 54 ? '★' : SKETCH[i % 5][0]) })
export const BRAIN = ['#2e6fb7', '#c0392b', '#e0b12f', '#3d8b4a']
ART['b:brain'] = pathArt(L.BRAIN_PATH, '#efe6f5', (i) => (i % 10 === 0 || i === 39 ? '#7a4fa3' : BRAIN[i % 4]), { size: 70, start: 'START', end: 'FINISH', mark: (i) => (i % 10 === 0 || i === 39 ? '✦' : '') })

/* ---- World map and pit board ---------------------------------------------- */
ART['b:world'] = (c, W, H) => {
  c.fillStyle = '#9cc7e0'
  c.fillRect(0, 0, W, H)
  let t = 0
  L.CONTINENTS.forEach((k) => {
    const [x0, y0, x1, y1] = k.r
    c.fillStyle = k.color
    roundRect(c, x0 * W, y0 * H, (x1 - x0) * W, (y1 - y0) * H, 34)
    c.fill()
    c.strokeStyle = INK
    c.lineWidth = 4
    c.stroke()
    text(c, k.name, ((x0 + x1) / 2) * W, y0 * H + 20, 17)
    for (let i = 0; i < k.n; i++, t++) dot(c, L.TERRITORIES[t][0] * W, L.TERRITORIES[t][1] * H, 21, 'rgba(255,255,255,0.55)', INK, 2)
  })
}
ART['b:pits'] = (c, W, H) => {
  c.fillStyle = '#a8713f'
  c.fillRect(0, 0, W, H)
  const px = W / L.PITS.w
  const hollow = (x: number, z: number, rx: number, rz: number) => {
    c.beginPath()
    c.ellipse(W / 2 + x * px, H / 2 + z * px, rx * px, rz * px, 0, 0, Math.PI * 2)
    c.fillStyle = '#6b4424'
    c.fill()
    c.strokeStyle = '#4a2d15'
    c.lineWidth = 5
    c.stroke()
  }
  for (const side of [0, 1]) {
    for (let i = 0; i < 6; i++) hollow(...L.pitXZ(side, i), 0.55, 0.55)
    hollow(...L.storeXZ(side), 0.55, 1.5)
  }
}

/* ---- Domino faces: 'dom:a-b' has a on the far half and b on the near half -- */
const PIPS: [number, number][][] = [[], [[1, 1]], [[0, 0], [2, 2]], [[0, 0], [1, 1], [2, 2]], [[0, 0], [2, 0], [0, 2], [2, 2]], [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]]]
for (let a = 0; a <= 6; a++)
  for (let b = 0; b <= 6; b++)
    ART[`dom:${a}-${b}`] = (c, W, H) => {
      c.fillStyle = '#f6f1e4'
      c.fillRect(0, 0, W, H)
      c.fillStyle = INK
      c.fillRect(W * 0.12, H / 2 - 3, W * 0.76, 6)
      ;[a, b].forEach((n, half) => PIPS[n].forEach(([x, y]) => dot(c, W * (0.24 + x * 0.26), (half * H) / 2 + (H / 2) * (0.24 + y * 0.26), W * 0.085, INK)))
    }

/* ---- Generic boards ------------------------------------------------------------ */
function rng(seed: string) {
  let a = 2166136261
  for (const ch of seed) a = Math.imul(a ^ ch.charCodeAt(0), 16777619)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const dark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11 < 110
}

/**
 * A schematic board drawn from its id alone: "g:style:arg:bg:accent:label".
 * Styles: map, hex (arg CxR), grid (CxR), slots (CxR), ring (spaces per side), lanes (count), space, plain.
 * The matching coordinates live in data/games/layouts (cityUV, hexUV, gridUV, slotUV, loopUV, laneUV).
 */
export function genericArt(id: string) {
  const [, style, arg, bg, ac, label = ''] = id.split(':')
  const [A = 1, B = 1] = arg.split('x').map(Number)
  return (c: C, W: number, H: number) => {
    const rnd = rng(label + style)
    const m = Math.min(W, H)
    const ink = dark(bg) ? '#f3ecdc' : INK
    const at = ([u, v]: L.UV): [number, number] => [u * W, v * H]
    const tint = (a: number) => {
      c.globalAlpha = a
      c.fillStyle = ac
    }
    c.fillStyle = bg
    c.fillRect(0, 0, W, H)
    if (style === 'map' || style === 'space') {
      for (let i = 0; i < (style === 'map' ? 7 : 4); i++) {
        const [x, y, r] = [rnd() * W, rnd() * H, m * (0.12 + rnd() * 0.16)]
        c.beginPath()
        for (let k = 0; k < 12; k++) {
          const q = r * (0.7 + rnd() * 0.5)
          c.lineTo(x + Math.cos((k / 12) * Math.PI * 2) * q, y + Math.sin((k / 12) * Math.PI * 2) * q * (style === 'map' ? 1 : 1))
        }
        c.closePath()
        tint(style === 'map' ? 0.22 : 0.3)
        c.fill()
      }
      c.globalAlpha = 1
      if (style === 'space') for (let i = 0; i < 160; i++) dot(c, rnd() * W, rnd() * H, m * (0.001 + rnd() * 0.003), '#ffffff')
      else {
        c.strokeStyle = ink
        c.globalAlpha = 0.55
        c.lineWidth = m * 0.012
        c.setLineDash([m * 0.03, m * 0.012])
        L.CITY_LINKS.forEach(([a, b]) => {
          c.beginPath()
          c.moveTo(...at(L.cityUV(a)))
          c.lineTo(...at(L.cityUV(b)))
          c.stroke()
        })
        c.setLineDash([])
        c.globalAlpha = 1
        for (let i = 0; i < 15; i++) dot(c, ...at(L.cityUV(i)), m * 0.022, '#fbf6ea', INK, m * 0.005)
      }
    }
    if (style === 'hex') {
      const hw = (0.9 * W) / (A + 0.5) / 2
      const hh = ((0.9 * H) / B) * (2 / 3)
      for (let r = 0; r < B; r++)
        for (let q = 0; q < A; q++) {
          const [x, y] = at(L.hexUV(A, B)(q, r))
          c.beginPath()
          ;[[0, -hh], [hw, -hh / 2], [hw, hh / 2], [0, hh], [-hw, hh / 2], [-hw, -hh / 2]].forEach(([dx, dy]) => c.lineTo(x + dx, y + dy))
          c.closePath()
          tint([0.1, 0.22, 0.34, 0.46][Math.floor(rnd() * 4)])
          c.fill()
          c.globalAlpha = 0.6
          c.strokeStyle = ink
          c.lineWidth = m * 0.004
          c.stroke()
        }
    }
    if (style === 'grid') {
      const [cw, ch] = [(0.9 * W) / A, (0.9 * H) / B]
      for (let r = 0; r < B; r++)
        for (let q = 0; q < A; q++) {
          const [x, y] = at(L.gridUV(A, B)(q, r))
          tint((q + r) % 2 ? 0.12 : 0.26)
          c.fillRect(x - cw / 2, y - ch / 2, cw, ch)
          c.globalAlpha = 0.5
          c.strokeStyle = ink
          c.lineWidth = m * 0.004
          c.strokeRect(x - cw / 2, y - ch / 2, cw, ch)
        }
    }
    if (style === 'slots') {
      const [sw, sh] = [(0.72 * W) / A, (0.68 * H) / B]
      for (let i = 0; i < A * B; i++) {
        const [x, y] = at(L.slotUV(A, B)(i))
        roundRect(c, x - sw * 0.44, y - sh * 0.42, sw * 0.88, sh * 0.84, m * 0.02)
        tint(0.2 + (i % 3) * 0.08)
        c.fill()
        c.globalAlpha = 0.7
        c.strokeStyle = ink
        c.lineWidth = m * 0.005
        c.stroke()
      }
      c.globalAlpha = 0.5
      for (let i = 0; i < 100; i++) {
        const [x, y] = at(L.loopUV(25)(i))
        c.strokeStyle = ink
        c.lineWidth = m * 0.003
        c.strokeRect(x - W / 60, y - H / 60, W / 30, H / 30)
      }
    }
    if (style === 'ring') {
      const [sw, sh] = [W / (A + 1), H / (A + 1)]
      for (let i = 0; i < 4 * A; i++) {
        const [x, y] = at(L.loopUV(A)(i))
        tint(i % A === 0 ? 0.5 : 0.14 + (i % 3) * 0.1)
        c.fillRect(x - sw / 2, y - sh / 2, sw, sh)
        c.globalAlpha = 0.7
        c.strokeStyle = ink
        c.lineWidth = m * 0.005
        c.strokeRect(x - sw / 2, y - sh / 2, sw, sh)
      }
    }
    if (style === 'lanes')
      for (let l = 0; l < A; l++)
        for (let k = 0; k < 9; k++) {
          const [x, y] = at(L.laneUV(A)(l, k / 8))
          const [sw, sh] = [(0.9 * W) / A, (0.8 * H) / 8]
          roundRect(c, x - sw * 0.4, y - sh * 0.42, sw * 0.8, sh * 0.84, m * 0.012)
          tint(0.12 + k * 0.035)
          c.fill()
          c.globalAlpha = 0.6
          c.strokeStyle = ink
          c.lineWidth = m * 0.004
          c.stroke()
        }
    c.globalAlpha = 1
    c.strokeStyle = ac
    c.lineWidth = m * 0.012
    c.strokeRect(m * 0.012, m * 0.012, W - m * 0.024, H - m * 0.024)
    c.globalAlpha = style === 'plain' || style === 'ring' ? 0.75 : 0.5
    if (label) text(c, label.toUpperCase(), W / 2, style === 'plain' || style === 'ring' ? H / 2 : H - m * 0.028, style === 'plain' || style === 'ring' ? Math.min(m * 0.1, (W * 1.3) / label.length) : m * 0.03, ink)
    c.globalAlpha = 1
  }
}
