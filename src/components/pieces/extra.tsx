/** Pieces for the classic board games: drawn boards, chess men, polyominoes and an upright disc frame. */
import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { KindProps } from '../../engine/types'
import { canvasTex } from '../../engine/util'
import { ART, GEO, Ink, boxMats } from './common'
import { genericArt } from './boardArt'

/** A board whose top is painted by ART[art]. `tilt` stands it up on its near edge. */
export function Board({ w, d, art, h = 0.12, edge = '#3a2c20', tilt = 0 }: KindProps['board']) {
  const tex = useMemo(() => {
    const s = 1024 / Math.max(w, d)
    const W = Math.round(w * s)
    const H = Math.round(d * s)
    return canvasTex(`board:${art}:${W}x${H}`, W, H, (c) => (ART[art] ?? genericArt(art))(c, W, H))
  }, [art, w, d])
  return (
    <group position={[0, 0, d / 2]} rotation={[tilt, 0, 0]}>
      <mesh geometry={GEO.unit} position={[0, 0, -d / 2]} scale={[w, h, d]} castShadow receiveShadow>
        {boxMats(tex, edge)}
        <Ink />
      </mesh>
    </group>
  )
}

const lathe = (pts: number[][]) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 20)
const MEN = {
  pawn: lathe([[0, 0], [0.26, 0], [0.26, 0.08], [0.12, 0.18], [0.09, 0.4], [0.15, 0.45], [0.06, 0.5], [0.15, 0.62], [0.13, 0.72], [0, 0.78]]),
  rook: lathe([[0, 0], [0.3, 0], [0.3, 0.1], [0.17, 0.2], [0.15, 0.62], [0.24, 0.68], [0.24, 0.92], [0.16, 0.92], [0.16, 0.84], [0, 0.84]]),
  knight: lathe([[0, 0], [0.3, 0], [0.3, 0.1], [0.17, 0.2], [0.15, 0.32], [0, 0.32]]),
  bishop: lathe([[0, 0], [0.3, 0], [0.3, 0.1], [0.13, 0.22], [0.09, 0.62], [0.18, 0.68], [0.08, 0.74], [0.15, 0.9], [0.1, 1.04], [0.03, 1.12], [0.05, 1.17], [0, 1.2]]),
  queen: lathe([[0, 0], [0.32, 0], [0.32, 0.1], [0.15, 0.24], [0.1, 0.8], [0.2, 0.86], [0.1, 0.92], [0.2, 1.16], [0.12, 1.2], [0.06, 1.27], [0, 1.3]]),
  king: lathe([[0, 0], [0.32, 0], [0.32, 0.1], [0.16, 0.24], [0.11, 0.86], [0.21, 0.92], [0.11, 0.98], [0.19, 1.22], [0, 1.24]]),
}

/** A chess man. Knights face local -z, so rotate the far side's by half a turn. */
export function ChessPiece({ type, color }: KindProps['chess']) {
  const mat = <meshStandardMaterial color={color} roughness={0.45} />
  const part = (pos: [number, number, number], size: [number, number, number], rx = 0) => (
    <mesh geometry={GEO.centered} position={pos} scale={size} rotation={[rx, 0, 0]} castShadow>
      {mat}
    </mesh>
  )
  return (
    <group>
      <mesh geometry={MEN[type]} castShadow>
        {mat}
        <Ink />
      </mesh>
      {type === 'knight' && part([0, 0.58, 0.02], [0.2, 0.6, 0.26], -0.25)}
      {type === 'knight' && part([0, 0.84, -0.14], [0.2, 0.22, 0.44], 0.3)}
      {type === 'king' && part([0, 1.36, 0], [0.06, 0.26, 0.06])}
      {type === 'king' && part([0, 1.38, 0], [0.2, 0.06, 0.06])}
    </group>
  )
}

const polyCache = new Map<string, THREE.BufferGeometry>()
export function Poly({ cells, size, h, color }: KindProps['poly']) {
  const geo = useMemo(() => {
    const key = `${size}|${h}|${cells.join(';')}`
    let g = polyCache.get(key)
    if (!g) {
      g = mergeGeometries(cells.map(([i, j]) => new THREE.BoxGeometry(size * 0.96, h, size * 0.96).translate(i * size, h / 2, -j * size)))
      polyCache.set(key, g)
    }
    return g
  }, [cells, size, h])
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.35} transparent opacity={0.92} />
    </mesh>
  )
}

const UPRIGHT = new THREE.PlaneGeometry(1, 1)
/** The upright grid for a four-in-a-row game. Disc (col, row) sits at x = (col - (cols-1)/2) * cell, y = 0.3 + row * cell. */
export function C4Frame({ cols, rows, cell, color }: KindProps['c4frame']) {
  const tex = useMemo(
    () =>
      canvasTex(`c4:${cols}x${rows}:${color}`, cols * 96, rows * 96, (c) => {
        c.fillStyle = color
        c.fillRect(0, 0, cols * 96, rows * 96)
        c.globalCompositeOperation = 'destination-out'
        for (let x = 0; x < cols; x++)
          for (let y = 0; y < rows; y++) {
            c.beginPath()
            c.arc(x * 96 + 48, y * 96 + 48, 38, 0, Math.PI * 2)
            c.fill()
          }
      }),
    [cols, rows, color],
  )
  const w = cols * cell
  const hgt = rows * cell
  return (
    <group>
      {[-0.14, 0.14].map((z) => (
        <mesh key={z} geometry={UPRIGHT} position={[0, 0.3 + hgt / 2, z]} scale={[w, hgt, 1]} castShadow>
          <meshStandardMaterial map={tex} transparent alphaTest={0.5} side={THREE.DoubleSide} roughness={0.5} />
        </mesh>
      ))}
      <mesh geometry={GEO.unit} scale={[w + 0.3, 0.3, 0.5]} castShadow>
        <meshStandardMaterial color={color} roughness={0.5} />
        <Ink />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={GEO.unit} position={[s * (w / 2 + 0.12), 0, 0]} scale={[0.24, hgt + 0.5, 1.6]} castShadow>
          <meshStandardMaterial color={color} roughness={0.5} />
          <Ink />
        </mesh>
      ))}
    </group>
  )
}
