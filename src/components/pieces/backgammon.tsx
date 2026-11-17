/** Backgammon's hinged wooden board: two trays joined at the bar, drawn with 24 triangular points. */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { KindProps } from '../../engine/types'
import { canvasTex, lerp } from '../../engine/util'
import { GEO, Ink } from './common'

export const BG = { half: 8, depth: 12, rim: 0.5, bar: 0.5, floor: 0.15, wall: 0.35, pointW: 7 / 6, pointLen: 4.8 }

function floorTex(flip: boolean) {
  return canvasTex(`bg-floor-${flip}`, 700, 1100, (c) => {
    c.fillStyle = '#ecdcb4'
    c.fillRect(0, 0, 700, 1100)
    const w = 700 / 6
    for (let i = 0; i < 6; i++)
      for (const top of [true, false]) {
        c.fillStyle = (i % 2 === 0) === (top !== flip) ? '#9c3b2a' : '#3f6f8f'
        c.beginPath()
        c.moveTo(i * w + 4, top ? 0 : 1100)
        c.lineTo((i + 1) * w - 4, top ? 0 : 1100)
        c.lineTo((i + 0.5) * w, top ? 480 : 620)
        c.closePath()
        c.fill()
      }
  })
}

function Half({ side }: { side: 1 | -1 }) {
  const tex = useMemo(() => floorTex(side === 1), [side])
  const wood = '#7a4a26'
  const inner = BG.half - BG.rim - BG.bar
  const cx = side * (BG.bar + inner / 2)
  const box = (x: number, z: number, w: number, d: number, key: string) => (
    <mesh key={key} geometry={GEO.unit} position={[x, 0, z]} scale={[w, BG.wall, d]} castShadow receiveShadow>
      <meshStandardMaterial color={wood} roughness={0.6} />
      <Ink />
    </mesh>
  )
  return (
    <group>
      <mesh geometry={GEO.unit} position={[side * (BG.half / 2), 0, 0]} scale={[BG.half, BG.floor - 0.01, BG.depth]} receiveShadow castShadow>
        <meshStandardMaterial color={wood} roughness={0.6} />
      </mesh>
      <mesh geometry={GEO.plane} position={[cx, BG.floor, 0]} scale={[inner, 1, BG.depth - BG.rim * 2]} receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      {box(side * (BG.bar / 2), 0, BG.bar, BG.depth, 'bar')}
      {box(side * (BG.half - BG.rim / 2), 0, BG.rim, BG.depth, 'edge')}
      {box(cx, -(BG.depth - BG.rim) / 2, inner, BG.rim, 'far')}
      {box(cx, (BG.depth - BG.rim) / 2, inner, BG.rim, 'near')}
    </group>
  )
}

export function BackgammonBoard({ open }: KindProps['bgBoard']) {
  const hinge = useRef<THREE.Group>(null!)
  const cur = useRef(open)
  useFrame((_, dt) => {
    cur.current = Math.abs(open - cur.current) < 0.002 ? open : lerp(cur.current, open, Math.min(1, dt * 3.2))
    hinge.current.rotation.z = (1 - cur.current) * Math.PI
  })
  return (
    <group>
      <Half side={-1} />
      <group ref={hinge} position={[0, BG.wall, 0]} rotation={[0, 0, (1 - open) * Math.PI]}>
        <group position={[0, -BG.wall, 0]}>
          <Half side={1} />
        </group>
      </group>
    </group>
  )
}
