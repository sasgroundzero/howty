/**
 * Link-preview images: one 1200x630 PNG per game, showing that game's finished setup drawn from above
 * next to its name. Called by prerender.mjs; needs no browser, so it also runs on Vercel.
 * Fonts are the site's own (Fraunces, DM Sans), bundled in scripts/fonts under the SIL Open Font License.
 */
import { Resvg } from '@resvg/resvg-js'
import { resolve } from 'node:path'

const fonts = ['Fraunces.ttf', 'DMSans.ttf'].map((f) => resolve(import.meta.dirname, 'fonts', f))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const players = ([a, b]) => (a === b ? `${a} player${a > 1 ? 's' : ''}` : `${a}–${b} players`)

/** A fill color for a piece, from whatever its props say about color. */
function fill(kind, p) {
  if (p.color) return p.color
  if (p.terrain) return { forest: '#2f7a3b', hills: '#c8643b', pasture: '#9ccb5a', fields: '#e8c547', mountains: '#8a9099', desert: '#e3d3a4' }[p.terrain]
  const face = p.faceUp === false ? p.back ?? { panel: '#27457a' } : p.face ?? p.top
  if (face) return face.panel ?? face.bg ?? '#ffffff'
  if (p.art) return p.art.startsWith('g:') ? `#${p.art.split(':')[3]?.replace('#', '') || 'd9c7a0'}`.replace('##', '#') : '#e6dcc4'
  return { catanTile: '#9ccb5a', catanFrame: '#2e6fb7', catanWater: '#5b9bd5', catanNumber: '#f3e7c5', bgBoard: '#c69c6d', c4frame: '#2e6fb7', chess: '#1c1917' }[kind] ?? '#a8a29e'
}
const valid = (c) => (/^#[0-9a-f]{3,8}$/i.test(c) || /^rgba?\(/.test(c) ? c : '#a8a29e')

/** The table as it stands after the last setup step, seen from directly above, fitted into a w x h box. */
function tableSvg(setup, w, h) {
  const last = setup.setupCount - 1
  const shown = []
  for (const pc of setup.pieces) {
    const keys = pc.keys.filter((k) => k.step <= last)
    if (!keys.length || keys[keys.length - 1].hide) continue
    const k = keys[keys.length - 1]
    const props = Object.assign({}, pc.props, ...keys.map((x) => x.props ?? {}))
    if (props.opacity !== undefined && props.opacity < 1) continue // dashed zone markers
    shown.push({ kind: pc.kind, p: props, x: k.pos[0], y: k.pos[1], z: k.pos[2], rot: k.rotY ?? 0 })
  }
  const T = setup.table
  const s = Math.min(w / T.w, h / T.d)
  const [tw, td] = [T.w * s, T.d * s]
  const ox = (w - tw) / 2 + tw / 2
  const oz = (h - td) / 2 + td / 2
  const area = (q) => (q.p.w ?? (q.p.r ?? 0.3) * 2) * (q.p.d ?? (q.p.r ?? 0.3) * 2)
  shown.sort((a, b) => a.y - b.y || area(b) - area(a))
  const shapes = shown.map(({ kind, p, x, z, rot }) => {
    const c = valid(fill(kind, p))
    const at = `transform="translate(${(ox + x * s).toFixed(1)} ${(oz + z * s).toFixed(1)}) rotate(${((-rot * 180) / Math.PI).toFixed(1)})"`
    const stroke = 'stroke="#1c1917" stroke-opacity="0.35" stroke-width="1"'
    if (kind === 'poly') return p.cells.map(([i, j]) => `<rect ${at} x="${(i * p.size - p.size / 2) * s}" y="${(-j * p.size - p.size / 2) * s}" width="${p.size * s}" height="${p.size * s}" fill="${c}" ${stroke}/>`).join('')
    if (kind === 'hex' || kind === 'catanTile') {
      const r = (p.r ?? 1) * s
      const pts = Array.from({ length: 6 }, (_, i) => `${(r * Math.cos((Math.PI / 3) * i + Math.PI / 6)).toFixed(1)},${(r * Math.sin((Math.PI / 3) * i + Math.PI / 6)).toFixed(1)}`).join(' ')
      return `<polygon ${at} points="${pts}" fill="${c}" ${stroke}/>`
    }
    if (p.w && p.d) {
      const [pw, pd] = [p.w * s, p.d * s]
      return `<rect ${at} x="${-pw / 2}" y="${-pd / 2}" width="${pw}" height="${pd}" rx="${Math.min(pw, pd) * 0.08}" fill="${c}" ${stroke}/>`
    }
    const r = (p.r ?? (p.size ?? (p.scale ?? 0.5) * 0.6) / 2) * s
    return `<circle ${at} r="${Math.max(2, r).toFixed(1)}" fill="${c}" ${stroke}/>`
  })
  return `<rect x="${ox - tw / 2}" y="${oz - td / 2}" width="${tw}" height="${td}" rx="6" fill="#b5835a"/>
<rect x="${ox - tw / 2}" y="${oz - td / 2}" width="${tw}" height="${td}" rx="6" fill="none" stroke="#7c5537" stroke-width="2"/>${shapes.join('')}`
}

/** Splits a long title over at most three lines of roughly `max` characters. */
function lines(text, max) {
  const out = ['']
  for (const word of text.split(' ')) {
    if (out[out.length - 1] && (out[out.length - 1] + ' ' + word).length > max) out.push(word)
    else out[out.length - 1] = out[out.length - 1] ? `${out[out.length - 1]} ${word}` : word
  }
  return out.slice(0, 3)
}

const LOGO = `<rect x="2" y="2" width="28" height="28" rx="8" fill="#1c1917"/><circle cx="11" cy="11" r="2.6" fill="#f59e0b"/><circle cx="21" cy="21" r="2.6" fill="#f59e0b"/><circle cx="21" cy="11" r="2.6" fill="#fff"/><circle cx="11" cy="21" r="2.6" fill="#fff"/>`

/** The preview image for one game, as PNG bytes. */
export function gameImage(g, setup) {
  const t = lines(g.meta.title, g.meta.title.length > 24 ? 14 : 12)
  const size = t.length === 1 ? 76 : t.length === 2 ? 68 : 56
  const top = 210
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#ffffff"/>
<g transform="translate(72 64) scale(1.5)">${LOGO}</g>
<text x="128" y="101" font-family="Fraunces" font-weight="700" font-size="40" fill="#1c1917">howty</text>
<text x="72" y="${top - 24}" font-family="DM Sans" font-weight="500" font-size="26" fill="#78716c">How to set up</text>
${t.map((l, i) => `<text x="72" y="${top + 50 + i * size * 1.04}" font-family="Fraunces" font-weight="700" font-size="${size}" letter-spacing="-1.5" fill="#1c1917">${esc(l)}</text>`).join('\n')}
<text x="72" y="${top + 50 + (t.length - 1) * size * 1.04 + 64}" font-family="DM Sans" font-size="26" fill="#57534e">${esc(players(g.meta.players))} · ${esc(g.meta.playTime)} · ${setup.setupCount} steps</text>
<text x="72" y="566" font-family="DM Sans" font-weight="500" font-size="22" fill="#78716c">Every piece placed on a 3D table, step by step</text>
<rect x="600" y="64" width="560" height="502" rx="28" fill="#f5f5f4" stroke="#e7e5e4"/>
<g transform="translate(628 92)">${tableSvg(setup, 504, 446)}</g>
</svg>`
  return new Resvg(svg, { font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'DM Sans' } }).render().asPng()
}
