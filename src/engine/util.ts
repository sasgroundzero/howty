import * as THREE from 'three'
import type { V3 } from './types'

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOutBounce = (t: number) => {
  const n = 7.5625
  const d = 2.75
  if (t < 1 / d) return n * t * t
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
  return n * (t -= 2.625 / d) * t + 0.984375
}

/** Cached canvas textures: all labels and card faces are drawn, never loaded. */
const texCache = new Map<string, THREE.CanvasTexture>()
export function canvasTex(key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const hit = texCache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  draw(canvas.getContext('2d')!)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  texCache.set(key, tex)
  return tex
}

export function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

/** Local-to-world for a seat: local +z points at the seated player. */
export const seatAt =
  (pos: V3, rot: number) =>
  (lx: number, y: number, lz: number): V3 => {
    const c = Math.cos(rot)
    const s = Math.sin(rot)
    return [pos[0] + lx * c + lz * s, y, pos[2] - lx * s + lz * c]
  }
