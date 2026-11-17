import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import type { Face, KindProps } from '../../engine/types'
import { canvasTex, roundRect } from '../../engine/util'

export const OUTLINE = '#2a2118'
export const Ink = ({ t = 0.012 }: { t?: number }) => <Outlines thickness={t} color={OUTLINE} />

/** Shared geometry: a unit box sitting on the ground, and one centered on its origin. */
export const GEO = (() => {
  const unit = new THREE.BoxGeometry(1, 1, 1)
  unit.translate(0, 0.5, 0)
  const centered = new THREE.BoxGeometry(1, 1, 1)
  const plane = new THREE.PlaneGeometry(1, 1)
  plane.rotateX(-Math.PI / 2)
  return { unit, centered, plane }
})()

/** Materials for a box whose top (and optionally bottom) carries a texture. */
export function boxMats(top: THREE.Texture, edge = '#f1ead9', bottom?: THREE.Texture) {
  return [0, 1, 2, 3, 4, 5].map((i) =>
    i === 2 || (i === 3 && bottom) ? (
      <meshStandardMaterial key={i} attach={`material-${i}`} map={i === 2 ? top : bottom} roughness={0.7} />
    ) : (
      <meshStandardMaterial key={i} attach={`material-${i}`} color={edge} roughness={0.9} />
    ),
  )
}

/** Extra drawing routines a Face can reference by id (game modules register their own). */
export const ART: Record<string, (c: CanvasRenderingContext2D, w: number, h: number) => void> = {}

function fitText(c: CanvasRenderingContext2D, text: string, maxW: number, size: number, weight = 'bold') {
  let s = size
  do c.font = `${weight} ${s}px Georgia, serif`
  while (c.measureText(text).width > maxW && (s -= 2) > 8)
}

/** Draws any card, sheet or tile face from its Face description. */
export function faceTex(f: Face, w: number, d: number) {
  const s = Math.min(256 / Math.min(w, d), 1024 / Math.max(w, d))
  const W = Math.round(w * s)
  const H = Math.round(d * s)
  return canvasTex(`face:${W}x${H}:${JSON.stringify(f)}`, W, H, (c) => {
    const u = Math.min(W, H) / 256
    const ink = f.ink ?? (f.panel ? '#ffffff' : '#2b241c')
    c.fillStyle = f.bg ?? '#fbf6ea'
    c.fillRect(0, 0, W, H)
    if (f.panel) {
      c.fillStyle = f.panel
      roundRect(c, 14 * u, 14 * u, W - 28 * u, H - 28 * u, 20 * u)
      c.fill()
    }
    if (f.border) {
      c.strokeStyle = f.border
      c.lineWidth = 7 * u
      roundRect(c, 24 * u, 24 * u, W - 48 * u, H - 48 * u, 14 * u)
      c.stroke()
    }
    if (f.art) ART[f.art]?.(c, W, H)
    c.fillStyle = ink
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    if (f.glyph) {
      fitText(c, f.glyph, W - 60 * u, 120 * u)
      c.fillText(f.glyph, W / 2, f.lines ? H * 0.3 : H * 0.47)
    }
    if (f.title) {
      fitText(c, f.title, W - 56 * u, 34 * u)
      c.fillText(f.title, W / 2, 52 * u)
    }
    if (f.sub) {
      fitText(c, f.sub, W - 56 * u, 26 * u)
      c.fillText(f.sub, W / 2, H - 46 * u)
    }
    if (f.lines) {
      c.textAlign = 'left'
      const top = (f.title ? 96 : 50) * u
      const gap = Math.min(34 * u, (H - top - 30 * u) / f.lines.length)
      f.lines.forEach((line, i) => {
        fitText(c, line, W - 60 * u, Math.min(24 * u, gap * 0.74), '')
        c.fillText(line, 30 * u, top + i * gap)
      })
    }
  })
}

/** Playmats, boards, grids and translucent zone markers. */
export function matTex(p: KindProps['mat']) {
  const s = Math.min(90, 1024 / Math.max(p.w, p.d))
  const W = Math.round(p.w * s)
  const H = Math.round(p.d * s)
  const tex = canvasTex(`mat:${JSON.stringify(p)}`, W, H, (c) => {
    const zone = (p.opacity ?? 1) < 1
    c.globalAlpha = p.opacity ?? 1
    c.fillStyle = p.color
    if (zone) {
      roundRect(c, 2, 2, W - 4, H - 4, s * 0.1)
      c.fill()
    } else c.fillRect(0, 0, W, H)
    c.globalAlpha = 1
    if (p.grid) {
      c.strokeStyle = 'rgba(60,45,30,0.38)'
      c.lineWidth = Math.max(1.5, s * 0.03)
      for (let x = 0; x <= p.w + 0.01; x += p.grid) {
        c.beginPath()
        c.moveTo(x * s, 0)
        c.lineTo(x * s, H)
        c.stroke()
      }
      for (let z = 0; z <= p.d + 0.01; z += p.grid) {
        c.beginPath()
        c.moveTo(0, z * s)
        c.lineTo(W, z * s)
        c.stroke()
      }
    }
    if (p.border) {
      const lw = zone ? s * 0.05 : s * 0.12
      c.strokeStyle = p.border
      c.lineWidth = lw
      if (p.dashed) c.setLineDash([s * 0.16, s * 0.1])
      roundRect(c, lw, lw, W - lw * 2, H - lw * 2, s * (zone ? 0.1 : 0.25))
      c.stroke()
      c.setLineDash([])
    }
    if (p.label) {
      c.fillStyle = p.ink ?? p.border ?? '#2b241c'
      const at = p.labelAt ?? 'center'
      const size = at === 'center' ? Math.min(H * 0.5, s * 0.6) : s * (zone ? 0.22 : 0.4)
      c.textBaseline = 'middle'
      c.textAlign = at === 'corner' ? 'right' : 'center'
      fitText(c, p.label, W - s * 0.3, size)
      if (at === 'center') c.fillText(p.label, W / 2, H / 2)
      else if (at === 'bottom') c.fillText(p.label, W / 2, H - s * 0.2)
      else c.fillText(p.label, W - s * 0.35, H - s * 0.42)
    }
  })
  return tex
}

export function woodTex() {
  const t = canvasTex('wood', 1024, 1024, (c) => {
    c.fillStyle = '#b98352'
    c.fillRect(0, 0, 1024, 1024)
    for (let plank = 0; plank < 4; plank++) {
      const y0 = plank * 256
      c.fillStyle = ['#bd8755', '#b27c4c', '#c08b5a', '#b6804f'][plank]
      c.fillRect(0, y0, 1024, 256)
      for (let i = 0; i < 70; i++) {
        const y = y0 + Math.random() * 256
        c.strokeStyle = `rgba(${Math.random() < 0.5 ? '90,55,25' : '225,180,130'},${0.05 + Math.random() * 0.1})`
        c.lineWidth = 1 + Math.random() * 2
        c.beginPath()
        c.moveTo(0, y)
        const wob = Math.random() * 10
        c.bezierCurveTo(340, y + wob, 680, y - wob, 1024, y)
        c.stroke()
      }
      c.fillStyle = 'rgba(70,40,15,0.35)'
      c.fillRect(0, y0, 1024, 3)
    }
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 1.25)
  return t
}
