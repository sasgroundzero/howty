/** Catan-specific meshes: sea frame, terrain hexes, number tokens, harbors, buildings. */
import { useMemo } from 'react'
import * as THREE from 'three'
import type { KindProps } from '../../engine/types'
import { canvasTex, roundRect } from '../../engine/util'
import { FRAME_IN, FRAME_OUT, FRAME_TOP, RES, RES_ORDER, TERRAIN, pips, type Resource, type Terrain } from '../../data/games/catanBoard'
import { ART, Ink } from './common'

function tokenTex(n: number) {
  return canvasTex(`token-${n}`, 256, 256, (c) => {
    const hot = n === 6 || n === 8
    c.fillStyle = '#f4e8c8'
    c.beginPath()
    c.arc(128, 128, 126, 0, Math.PI * 2)
    c.fill()
    c.strokeStyle = '#b89f6d'
    c.lineWidth = 8
    c.beginPath()
    c.arc(128, 128, 114, 0, Math.PI * 2)
    c.stroke()
    c.fillStyle = hot ? '#c62f2f' : '#2b241c'
    c.font = `bold ${n >= 10 ? 112 : 128}px Georgia, serif`
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(String(n), 128, 112)
    const k = pips(n)
    for (let i = 0; i < k; i++) {
      c.beginPath()
      c.arc(128 + (i - (k - 1) / 2) * 22, 192, 8, 0, Math.PI * 2)
      c.fill()
    }
  })
}

function drawResIcon(c: CanvasRenderingContext2D, r: Resource, x: number, y: number, s: number) {
  c.save()
  c.translate(x, y)
  c.scale(s, s)
  c.fillStyle = '#ffffff'
  if (r === 'lumber') {
    for (const dx of [-26, 0, 26]) {
      c.beginPath()
      c.moveTo(dx, -42)
      c.lineTo(dx + 20, 22)
      c.lineTo(dx - 20, 22)
      c.closePath()
      c.fill()
      c.fillRect(dx - 4, 22, 8, 16)
    }
  } else if (r === 'brick') {
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 2; col++) c.fillRect(-44 + col * 46 + (row % 2) * 12 - 6, -32 + row * 24, 40, 18)
  } else if (r === 'wool') {
    for (const [dx, dy, rad] of [[-22, 0, 22], [8, -12, 26], [30, 6, 18], [0, 14, 20]]) {
      c.beginPath()
      c.arc(dx, dy, rad, 0, Math.PI * 2)
      c.fill()
    }
  } else if (r === 'grain') {
    c.fillRect(-3, -10, 6, 52)
    for (let i = 0; i < 4; i++)
      for (const side of [-1, 1]) {
        c.beginPath()
        c.ellipse(side * 13, -36 + i * 16, 12, 6, side * 0.7, 0, Math.PI * 2)
        c.fill()
      }
  } else {
    c.beginPath()
    c.moveTo(-40, 30)
    c.lineTo(-22, -24)
    c.lineTo(6, -38)
    c.lineTo(38, -6)
    c.lineTo(42, 30)
    c.closePath()
    c.fill()
  }
  c.restore()
}

ART['catan:costs'] = (c, W, H) => {
    c.save()
    c.scale(W / 300, H / 404)
    c.fillStyle = '#5a431c'
    c.font = 'bold 30px Georgia, serif'
    c.textAlign = 'left'
    c.fillText('Building costs', 22, 48)
    const rows: [string, Resource[]][] = [
      ['Road', ['lumber', 'brick']],
      ['Settlement', ['lumber', 'brick', 'wool', 'grain']],
      ['City', ['grain', 'grain', 'ore', 'ore', 'ore']],
      ['Dev card', ['wool', 'grain', 'ore']],
    ]
    rows.forEach(([name, cost], i) => {
      const y = 96 + i * 78
      c.fillStyle = '#5a431c'
      c.font = '24px Georgia, serif'
      c.fillText(name, 22, y)
      cost.forEach((r, j) => {
        c.fillStyle = RES[r].color
        roundRect(c, 22 + j * 52, y + 12, 44, 34, 6)
        c.fill()
      })
    })
  c.restore()
}

function harborTex(type: Resource | null) {
  return canvasTex(`harbor-${type}`, 256, 256, (c) => {
    c.fillStyle = type ? RES[type].color : '#4a4038'
    c.beginPath()
    c.arc(128, 128, 126, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#fbf6ea'
    c.beginPath()
    c.arc(128, 128, 100, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#2b241c'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.font = 'bold 84px Georgia, serif'
    c.fillText(type ? '2:1' : '3:1', 128, 110)
    c.font = 'bold 34px Georgia, serif'
    c.fillStyle = type ? RES[type].color : '#4a4038'
    c.fillText(type ? RES[type].label : 'Any', 128, 174)
  })
}

const GEO = (() => {
  const house = new THREE.Shape()
  house.moveTo(-0.12, 0)
  house.lineTo(0.12, 0)
  house.lineTo(0.12, 0.14)
  house.lineTo(0, 0.26)
  house.lineTo(-0.12, 0.14)
  house.closePath()
  const settlement = new THREE.ExtrudeGeometry(house, { depth: 0.2, bevelEnabled: false })
  settlement.translate(0, 0, -0.1)

  const hall = new THREE.Shape()
  hall.moveTo(-0.19, 0)
  hall.lineTo(0.19, 0)
  hall.lineTo(0.19, 0.16)
  hall.lineTo(0, 0.16)
  hall.lineTo(0, 0.28)
  hall.lineTo(-0.095, 0.38)
  hall.lineTo(-0.19, 0.28)
  hall.closePath()
  const city = new THREE.ExtrudeGeometry(hall, { depth: 0.22, bevelEnabled: false })
  city.translate(0, 0, -0.11)

  const road = new THREE.BoxGeometry(0.52, 0.08, 0.1)
  road.translate(0, 0.04, 0)

  const robber = new THREE.LatheGeometry(
    [
      [0, 0], [0.17, 0], [0.17, 0.05], [0.11, 0.1], [0.14, 0.26], [0.1, 0.38],
      [0.075, 0.42], [0.12, 0.5], [0.1, 0.6], [0, 0.64],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    14,
  )

  const tile = new THREE.CylinderGeometry(0.97, 0.97, 0.14, 6)
  tile.translate(0, 0.07, 0)
  const token = new THREE.CylinderGeometry(0.33, 0.33, 0.05, 28)
  token.translate(0, 0.025, 0)
  const water = new THREE.CylinderGeometry(FRAME_IN + 0.05, FRAME_IN + 0.05, 0.03, 6)

  const frame = Array.from({ length: 6 }, (_, k) => {
    const a0 = (k * Math.PI) / 3
    const a1 = ((k + 1) * Math.PI) / 3
    const sh = new THREE.Shape()
    // Shape lives in XY; rotating -90deg about X maps shape y to world -z
    sh.moveTo(FRAME_IN * Math.cos(a0), -FRAME_IN * Math.sin(a0))
    sh.lineTo(FRAME_OUT * Math.cos(a0), -FRAME_OUT * Math.sin(a0))
    sh.lineTo(FRAME_OUT * Math.cos(a1), -FRAME_OUT * Math.sin(a1))
    sh.lineTo(FRAME_IN * Math.cos(a1), -FRAME_IN * Math.sin(a1))
    sh.closePath()
    return new THREE.ExtrudeGeometry(sh, { depth: FRAME_TOP, bevelEnabled: false })
  })

  return { settlement, city, road, robber, tile, token, water, frame }
})()

function FramePiece({ k }: { k: number }) {
  return (
    <mesh geometry={GEO.frame[k]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={k % 2 ? '#2f74ad' : '#3581bd'} roughness={0.6} flatShading />
      <Ink t={0.015} />
    </mesh>
  )
}

function Water() {
  return (
    <mesh geometry={GEO.water} position={[0, 0.015, 0]} rotation={[0, Math.PI / 6, 0]} receiveShadow>
      <meshStandardMaterial color="#58a6dd" roughness={0.35} />
    </mesh>
  )
}

/** Small low-poly props so each terrain reads at a glance, kept clear of the token. */
function TileMesh({ terrain, seed }: { terrain: Terrain; seed: number }) {
  const T = TERRAIN[terrain]
  const spots = useMemo(() => {
    const n = terrain === 'fields' ? 6 : 5
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + seed * 0.9
      const rad = 0.56 + ((i * 37 + seed * 13) % 10) * 0.012
      return [Math.cos(a) * rad, Math.sin(a) * rad, 0.85 + ((i * 53 + seed * 7) % 10) * 0.035] as const
    })
  }, [terrain, seed])

  return (
    <group>
      <mesh geometry={GEO.tile} castShadow receiveShadow>
        <meshStandardMaterial color={T.color} roughness={0.85} flatShading />
        <Ink t={0.014} />
      </mesh>
      <group position={[0, 0.14, 0]}>
        {spots.map(([x, z, s], i) => {
          if (terrain === 'forest')
            return (
              <group key={i} position={[x, 0, z]} scale={s}>
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.1, 5]} />
                  <meshStandardMaterial color="#6b4423" />
                </mesh>
                <mesh position={[0, 0.25, 0]} castShadow>
                  <coneGeometry args={[0.14, 0.34, 6]} />
                  <meshStandardMaterial color="#1f5a2a" flatShading />
                </mesh>
              </group>
            )
          if (terrain === 'mountains')
            return (
              <group key={i} position={[x, 0, z]} scale={s}>
                <mesh position={[0, 0.16, 0]} castShadow>
                  <coneGeometry args={[0.2, 0.32, 5]} />
                  <meshStandardMaterial color="#666d77" flatShading />
                </mesh>
                <mesh position={[0, 0.27, 0]}>
                  <coneGeometry args={[0.075, 0.12, 5]} />
                  <meshStandardMaterial color="#f5f7fa" flatShading />
                </mesh>
              </group>
            )
          if (terrain === 'hills')
            return (
              <mesh key={i} position={[x, 0.04, z]} rotation={[0, i * 1.1, 0]} scale={s} castShadow>
                <boxGeometry args={[0.2, 0.08, 0.11]} />
                <meshStandardMaterial color="#9c4526" flatShading />
              </mesh>
            )
          if (terrain === 'pasture')
            return (
              <group key={i} position={[x, 0, z]} rotation={[0, i * 1.7, 0]} scale={s}>
                <mesh position={[0, 0.07, 0]} castShadow>
                  <boxGeometry args={[0.16, 0.1, 0.11]} />
                  <meshStandardMaterial color="#fbfaf5" flatShading />
                </mesh>
                <mesh position={[0.1, 0.09, 0]}>
                  <boxGeometry args={[0.06, 0.06, 0.07]} />
                  <meshStandardMaterial color="#3a332c" />
                </mesh>
              </group>
            )
          if (terrain === 'fields')
            return (
              <mesh key={i} position={[x, 0.07, z]} scale={s} castShadow>
                <coneGeometry args={[0.07, 0.16, 5]} />
                <meshStandardMaterial color="#b98a1c" flatShading />
              </mesh>
            )
          return (
            <mesh key={i} position={[x, 0, z]} scale={[s * 0.26, 0.07, s * 0.2]}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color="#d2b97d" flatShading />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function NumberToken({ n }: { n: number }) {
  const tex = useMemo(() => tokenTex(n), [n])
  return (
    <mesh geometry={GEO.token} castShadow>
      <meshStandardMaterial attach="material-0" color="#d8c7a0" />
      <meshStandardMaterial attach="material-1" map={tex} roughness={0.8} />
      <meshStandardMaterial attach="material-2" color="#d8c7a0" />
    </mesh>
  )
}

function Harbor({ type, planks }: { type: Resource | null; planks: [number, number][] }) {
  const tex = useMemo(() => harborTex(type), [type])
  return (
    <group>
      {planks.map(([x, z], i) => (
        <mesh key={i} position={[x / 2, 0.02, z / 2]} rotation={[0, -Math.atan2(z, x), 0]} castShadow>
          <boxGeometry args={[Math.hypot(x, z), 0.04, 0.12]} />
          <meshStandardMaterial color="#8a5a2e" flatShading />
        </mesh>
      ))}
      <mesh geometry={GEO.token} rotation={[0, Math.PI / 2, 0]} position={[0, 0.04, 0]} scale={1.15} castShadow>
        <meshStandardMaterial attach="material-0" color="#efe3c2" />
        <meshStandardMaterial attach="material-1" map={tex} roughness={0.8} />
        <meshStandardMaterial attach="material-2" color="#efe3c2" />
      </mesh>
    </group>
  )
}

function Robber() {
  return (
    <mesh geometry={GEO.robber} castShadow>
      <meshStandardMaterial color="#4a4a52" roughness={0.5} flatShading />
      <Ink />
    </mesh>
  )
}

const Settlement = ({ color }: { color: string }) => (
  <mesh geometry={GEO.settlement} castShadow>
    <meshStandardMaterial color={color} roughness={0.55} flatShading />
    <Ink />
  </mesh>
)
const City = ({ color }: { color: string }) => (
  <mesh geometry={GEO.city} castShadow>
    <meshStandardMaterial color={color} roughness={0.55} flatShading />
    <Ink />
  </mesh>
)
const Road = ({ color }: { color: string }) => (
  <mesh geometry={GEO.road} castShadow>
    <meshStandardMaterial color={color} roughness={0.55} flatShading />
    <Ink />
  </mesh>
)

for (const r of RES_ORDER) ART[`catan:${r}`] = (c, W, H) => drawResIcon(c, r, W / 2, H * 0.41, (1.5 * W) / 256)

export const FramePieceK = ({ k }: KindProps['catanFrame']) => <FramePiece k={k} />
export const CatanTile = ({ terrain, seed }: KindProps['catanTile']) => <TileMesh terrain={terrain} seed={seed} />
export const CatanNumber = ({ n }: KindProps['catanNumber']) => <NumberToken n={n} />
export const CatanHarbor = ({ type, planks }: KindProps['catanHarbor']) => <Harbor type={type} planks={planks} />
export const CatanWater = () => <Water />
export function CatanPiece({ shape, color }: KindProps['catanPiece']) {
  if (shape === 'robber') return <Robber />
  if (shape === 'city') return <City color={color} />
  if (shape === 'road') return <Road color={color} />
  return <Settlement color={color} />
}
