/** Reusable, game-agnostic 3D primitives: cards, stacks, dice, tokens, minis, blocks, hexes, mats. */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DieSides, KindProps } from '../../engine/types'
import { canvasTex, lerp } from '../../engine/util'
import { GEO, Ink, boxMats, faceTex, matTex } from './common'

const DEFAULT_BACK = { panel: '#4b3b6b', border: '#d9c88f', glyph: '?', ink: '#d9c88f' }

/** A single card. Flips over (with a little lift) whenever `faceUp` changes. */
export function Card({ w, d, face, back = DEFAULT_BACK, faceUp = true }: KindProps['card']) {
  const ref = useRef<THREE.Group>(null!)
  const angle = useRef(faceUp ? 0 : Math.PI)
  const top = useMemo(() => faceTex(face, w, d), [face, w, d])
  const bottom = useMemo(() => faceTex(back, w, d), [back, w, d])
  useFrame((_, dt) => {
    const want = faceUp ? 0 : Math.PI
    if (Math.abs(want - angle.current) > 0.001) angle.current = lerp(angle.current, want, Math.min(1, dt * 7))
    else angle.current = want
    ref.current.rotation.z = angle.current
    ref.current.position.y = 0.0075 + Math.sin(angle.current) * w * 0.55
  })
  return (
    <group ref={ref} rotation={[0, 0, angle.current]} position={[0, 0.0075, 0]}>
      <mesh geometry={GEO.centered} scale={[w, 0.015, d]} castShadow receiveShadow>
        {boxMats(top, '#f1ead9', bottom)}
      </mesh>
    </group>
  )
}

/** A pile of cards whose height tracks how many are left. */
export function Stack({ w, d, count, face, per = 0.012 }: KindProps['stack']) {
  const ref = useRef<THREE.Mesh>(null!)
  const tex = useMemo(() => faceTex(face, w, d), [face, w, d])
  const h = Math.max(0.012, count * per)
  useFrame((_, dt) => {
    ref.current.scale.y = lerp(ref.current.scale.y, h, Math.min(1, dt * 6))
  })
  return (
    <mesh ref={ref} geometry={GEO.unit} scale={[w, h, d]} castShadow receiveShadow>
      {boxMats(tex)}
    </mesh>
  )
}

/* ---- Dice ----------------------------------------------------------------- */

function pipTex(n: number, color: string, pip: string) {
  return canvasTex(`pip-${n}-${color}-${pip}`, 128, 128, (c) => {
    c.fillStyle = color
    c.fillRect(0, 0, 128, 128)
    c.fillStyle = pip
    const spots: Record<number, [number, number][]> = {
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [2, 0], [0, 2], [2, 2]],
      5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
      6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
    }
    spots[n].forEach(([x, y]) => {
      c.beginPath()
      c.arc(30 + x * 34, 30 + y * 34, 11, 0, Math.PI * 2)
      c.fill()
    })
  })
}

function numTex(text: string, ink: string, bg?: string) {
  return canvasTex(`num-${text}-${ink}-${bg}`, 128, 128, (c) => {
    if (bg) {
      c.fillStyle = bg
      c.fillRect(0, 0, 128, 128)
    }
    c.fillStyle = ink
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.font = `bold ${text.length > 2 ? 52 : text.length > 1 ? 70 : 88}px Georgia, serif`
    c.fillText(text, 64, 68)
    if (text === '6' || text === '9') c.fillRect(44, 108, 40, 6)
  })
}

/** Pentagonal trapezohedron: the real shape of a d10. */
function d10Geometry(r: number) {
  const e = 0.116
  const pts: THREE.Vector3[] = []
  const T = new THREE.Vector3(0, 1.1, 0)
  const B = new THREE.Vector3(0, -1.1, 0)
  const hi = (k: number) => new THREE.Vector3(Math.cos((k * 72 * Math.PI) / 180), e, Math.sin((k * 72 * Math.PI) / 180))
  const lo = (k: number) => new THREE.Vector3(Math.cos(((k * 72 + 36) * Math.PI) / 180), -e, Math.sin(((k * 72 + 36) * Math.PI) / 180))
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    const n = b.clone().sub(a).cross(c.clone().sub(a))
    const out = n.dot(a.clone().add(b).add(c)) > 0
    pts.push(a, out ? b : c, out ? c : b)
  }
  for (let k = 0; k < 5; k++) {
    tri(T, hi(k), lo(k))
    tri(T, lo(k), hi(k + 1))
    tri(B, lo(k), hi(k + 1))
    tri(B, hi(k + 1), lo(k + 1))
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts)
  g.scale(r, r, r)
  return g
}

/** Rotates a polyhedron so one face is flat on top (or on the table) and reports where that face is. */
function settle(geo: THREE.BufferGeometry, faceDown = false) {
  const g = geo.index ? geo.toNonIndexed() : geo
  const p = g.attributes.position
  const v = [0, 1, 2].map((i) => new THREE.Vector3().fromBufferAttribute(p, i))
  const n = v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).normalize()
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(n, new THREE.Vector3(0, faceDown ? -1 : 1, 0)))
  g.computeBoundingBox()
  g.translate(0, -g.boundingBox!.min.y, 0)
  const top = g.boundingBox!.max.y - g.boundingBox!.min.y
  const seen = new Map<string, [number, number]>()
  for (let i = 0; i < p.count; i++)
    if (p.getY(i) > top - 0.02) seen.set(`${p.getX(i).toFixed(2)}|${p.getZ(i).toFixed(2)}`, [p.getX(i), p.getZ(i)])
  const pts = [...seen.values()]
  g.computeVertexNormals()
  return {
    geo: g,
    top,
    cx: pts.reduce((s, q) => s + q[0], 0) / pts.length,
    cz: pts.reduce((s, q) => s + q[1], 0) / pts.length,
  }
}

const dieShapes = new Map<DieSides, ReturnType<typeof settle>>()
function dieShape(sides: DieSides) {
  let s = dieShapes.get(sides)
  if (!s) {
    s =
      sides === 4 ? settle(new THREE.TetrahedronGeometry(0.4), true)
      : sides === 8 ? settle(new THREE.OctahedronGeometry(0.36))
      : sides === 12 ? settle(new THREE.DodecahedronGeometry(0.34))
      : sides === 20 ? settle(new THREE.IcosahedronGeometry(0.38))
      : settle(d10Geometry(0.33))
    dieShapes.set(sides, s)
  }
  return s
}
const LABEL_SIZE: Partial<Record<DieSides, number>> = { 8: 0.3, 10: 0.26, 100: 0.26, 12: 0.3, 20: 0.24 }

/** Any die from d4 to d20 (plus d%), resting with `value` on top. A d6 shows pips unless `text` is set. */
export function Die({ sides, value, color, ink, text, size = 1 }: KindProps['die']) {
  if (sides === 6) {
    // Box face order is +x, -x, +y, -y, +z, -z. Opposite faces add up to 7.
    const v = Math.min(6, Math.max(1, value))
    const rest = [1, 2, 3].filter((n) => n !== v && n !== 7 - v)
    const faces = [rest[0], 7 - rest[0], v, 7 - v, rest[1], 7 - rest[1]]
    return (
      <mesh geometry={GEO.unit} scale={0.42 * size} castShadow>
        {faces.map((n, i) => (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            map={text ? numTex(i === 2 ? text : '', ink, color) : pipTex(n, color, ink)}
            roughness={0.4}
          />
        ))}
        <Ink />
      </mesh>
    )
  }
  const s = dieShape(sides)
  const label = text ?? (sides === 100 ? String(value).padStart(2, '0') : String(value))
  const tex = numTex(label, ink)
  return (
    <group scale={size}>
      <mesh geometry={s.geo} castShadow>
        <meshStandardMaterial color={color} roughness={0.35} flatShading />
        <Ink />
      </mesh>
      {sides === 4 ? (
        <sprite position={[0, s.top + 0.2, 0]} scale={0.34}>
          <spriteMaterial map={numTex(label, '#ffffff', color)} />
        </sprite>
      ) : (
        <mesh geometry={GEO.plane} position={[s.cx, s.top + 0.004, s.cz]} scale={LABEL_SIZE[sides] ?? 0.28}>
          <meshBasicMaterial map={tex} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

/* ---- Tokens, minis, blocks, hexes ---------------------------------------- */

const DISC = new THREE.CylinderGeometry(1, 1, 1, 32)
DISC.translate(0, 0.5, 0)

function discTex(label: string, color: string, ink: string) {
  return canvasTex(`disc-${label}-${color}-${ink}`, 256, 256, (c) => {
    c.fillStyle = color
    c.fillRect(0, 0, 256, 256)
    c.strokeStyle = ink
    c.globalAlpha = 0.35
    c.lineWidth = 8
    c.beginPath()
    c.arc(128, 128, 104, 0, Math.PI * 2)
    c.stroke()
    c.globalAlpha = 1
    c.fillStyle = ink
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.font = `bold ${label.length > 3 ? 54 : label.length > 1 ? 86 : 120}px Georgia, serif`
    c.fillText(label, 128, 134)
  })
}

/** A disc: checkers, counters, coins, number chips. */
export function Token({ r, h, color, label, ink = '#2b241c', upright }: KindProps['token']) {
  const mesh = (
    <mesh geometry={DISC} scale={[r, h, r]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
      <meshStandardMaterial attach="material-0" color={color} roughness={0.5} />
      {label ? (
        <meshStandardMaterial attach="material-1" map={discTex(label, color, ink)} roughness={0.6} />
      ) : (
        <meshStandardMaterial attach="material-1" color={color} roughness={0.5} />
      )}
      <meshStandardMaterial attach="material-2" color={color} />
      <Ink />
    </mesh>
  )
  return upright ? (
    <group position={[0, r, -h / 2]} rotation={[Math.PI / 2, 0, 0]}>
      {mesh}
    </group>
  ) : (
    mesh
  )
}

const lathe = (pts: number[][]) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 16)
const MINI = {
  hero: lathe([[0, 0.06], [0.24, 0.06], [0.2, 0.14], [0.11, 0.22], [0.15, 0.5], [0.2, 0.62], [0.08, 0.68], [0.15, 0.78], [0.15, 0.88], [0.08, 0.96], [0, 0.98]]),
  brute: lathe([[0, 0.06], [0.28, 0.06], [0.3, 0.3], [0.26, 0.5], [0.12, 0.56], [0.18, 0.64], [0.16, 0.74], [0, 0.8]]),
  boss: lathe([[0, 0.06], [0.3, 0.06], [0.34, 0.34], [0.38, 0.6], [0.2, 0.7], [0.24, 0.8], [0.2, 0.94], [0, 1]]),
}

/** A miniature on a round black base. */
export function Mini({ color, shape = 'hero', scale = 1 }: KindProps['mini']) {
  return (
    <group scale={scale}>
      <mesh geometry={DISC} scale={[0.38, 0.06, 0.38]} castShadow>
        <meshStandardMaterial color="#26221f" roughness={0.6} />
      </mesh>
      <mesh geometry={MINI[shape]} castShadow>
        <meshStandardMaterial color={color} roughness={0.5} flatShading />
        <Ink />
      </mesh>
      {shape !== 'hero' &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.13, shape === 'boss' ? 1 : 0.8, 0]} rotation={[0, 0, -s * 0.5]}>
            <coneGeometry args={[0.05, 0.18, 5]} />
            <meshStandardMaterial color="#efe6d2" flatShading />
          </mesh>
        ))}
    </group>
  )
}

/** A box or pillar: walls, cubes, generic components. */
export function Block({ w, h, d, color, round, top }: KindProps['block']) {
  const tex = useMemo(() => (top ? faceTex(top, w, d) : null), [top, w, d])
  return (
    <mesh geometry={round ? DISC : GEO.unit} scale={round ? [w / 2, h, d / 2] : [w, h, d]} castShadow receiveShadow>
      {tex && !round ? boxMats(tex, color) : <meshStandardMaterial color={color} roughness={0.75} flatShading />}
      <Ink />
    </mesh>
  )
}

const HEXGEO = new THREE.CylinderGeometry(1, 1, 1, 6)
HEXGEO.translate(0, 0.5, 0)

export function Hex({ r, h = 0.14, color, label }: KindProps['hex']) {
  return (
    <group>
      <mesh geometry={HEXGEO} scale={[r, h, r]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} flatShading />
        <Ink t={0.014} />
      </mesh>
      {label && (
        <mesh geometry={GEO.plane} position={[0, h + 0.004, 0]} scale={r * 0.9}>
          <meshBasicMaterial map={numTex(label, '#ffffff')} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

/** Playmat, board, battle grid or (when translucent) a labeled zone marker. */
export function Mat(p: KindProps['mat']) {
  const tex = useMemo(() => matTex(p), [JSON.stringify(p)]) // eslint-disable-line react-hooks/exhaustive-deps
  if ((p.opacity ?? 1) < 1)
    return (
      <mesh geometry={GEO.plane} position={[0, 0.004, 0]} scale={[p.w, 1, p.d]}>
        <meshBasicMaterial map={tex} transparent depthWrite={false} />
      </mesh>
    )
  return (
    <mesh geometry={GEO.unit} scale={[p.w, 0.02, p.d]} receiveShadow>
      {boxMats(tex, p.color)}
    </mesh>
  )
}

/** A three-panel folding screen (the GM's side is the far side). */
export function Screen({ w, h, color, label }: KindProps['screen']) {
  const tex = useMemo(
    () => faceTex({ bg: color, border: '#d9c88f', ink: '#f1e4bd', glyph: '⚔', sub: label }, w * 0.4, h),
    [w, h, color, label],
  )
  const side = (s: number) => (
    <group position={[s * w * 0.2, 0, 0]} rotation={[0, s * 0.6, 0]}>
      <mesh geometry={GEO.unit} position={[s * w * 0.15, 0, 0]} scale={[w * 0.3, h, 0.05]} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
        <Ink />
      </mesh>
    </group>
  )
  return (
    <group>
      <mesh geometry={GEO.unit} scale={[w * 0.4, h, 0.05]} castShadow>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color={i === 4 ? '#ffffff' : color} map={i === 4 ? tex : null} roughness={0.8} />
        ))}
        <Ink />
      </mesh>
      {side(-1)}
      {side(1)}
    </group>
  )
}
