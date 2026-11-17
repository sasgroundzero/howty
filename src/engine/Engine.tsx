/**
 * The game-agnostic 3D engine: it renders any GameSetup. AnimatedPiece moves
 * each piece to wherever its keyframes put it for the current step, CameraRig
 * glides between step focuses, and Tooltip shows the inspection card.
 */
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { AnyPiece, Focus, GameSetup, Kind, TableDef } from './types'
import { easeInOutCubic, easeOutBounce, lerp } from './util'
import { play, type Sfx } from './audio'
import { hoverStore, useHover, type HoverHit } from './hover'
import { PieceView } from '../components/pieces'
import { GEO, woodTex } from '../components/pieces/common'

export interface Nav {
  step: number
  dir: number
  jump: boolean
}
const NavContext = createContext<Nav>({ step: 0, dir: 0, jump: false })

const DROP_H = 3.2
const SFX: Partial<Record<Kind, Sfx>> = { card: 'card', stack: 'card', die: 'dice' }

interface Anim {
  kind: 'drop' | 'arc' | 'hide'
  from: THREE.Vector3
  to: THREE.Vector3
  fromRot: number
  toRot: number
  fromScale: number
  toScale: number
  start: number
  dur: number
  h: number
  sounded: boolean
}

function AnimatedPiece({ spec }: { spec: AnyPiece }) {
  const { step, dir, jump } = useContext(NavContext)
  const clock = useThree((s) => s.clock)
  const outer = useRef<THREE.Group>(null!)
  const inner = useRef<THREE.Group>(null!)
  const glow = useRef<THREE.Mesh>(null!)
  const anim = useRef<Anim | null>(null)
  const shown = useRef(false)
  const lastSig = useRef<string | null>(null)
  const hoverAmt = useRef(0)
  const measured = useRef(false)
  const flat = spec.kind === 'mat'
  const sfx = SFX[spec.kind] ?? 'wood'

  let idx = -1
  spec.keys.forEach((k, i) => {
    if (k.step <= step) idx = i
  })
  const key = idx >= 0 && !spec.keys[idx].hide ? spec.keys[idx] : null
  const sig = key ? `${idx}:${key.pos.join(',')}:${key.rotY ?? 0}` : 'off'

  // Props are the base props plus every override up to the current keyframe
  const propsKey = JSON.stringify(spec.keys.slice(0, idx + 1).map((k) => k.props ?? 0))
  const props = useMemo(
    () => Object.assign({}, spec.props, ...spec.keys.slice(0, idx + 1).map((k) => k.props ?? {})) as object,
    [spec, propsKey], // eslint-disable-line react-hooks/exhaustive-deps
  )

  useLayoutEffect(() => {
    if (lastSig.current === sig) return
    const firstMount = lastSig.current === null
    lastSig.current = sig
    const g = outer.current
    const now = clock.elapsedTime

    if (!key) {
      const wasShown = shown.current
      shown.current = false
      if (!wasShown || jump || firstMount) {
        g.visible = false
        g.scale.setScalar(0)
        anim.current = null
      } else {
        anim.current = {
          kind: 'hide', from: g.position.clone(), to: g.position.clone(), fromRot: g.rotation.y, toRot: g.rotation.y,
          fromScale: g.scale.x, toScale: 0, start: now, dur: 0.22, h: 0, sounded: true,
        }
      }
      return
    }

    const to = new THREE.Vector3(...key.pos)
    const toRot = key.rotY ?? 0
    const instant = firstMount ? key.step < step : jump
    const wasShown = shown.current
    shown.current = true
    g.visible = true

    if (instant) {
      g.position.copy(to)
      g.rotation.set(0, toRot, 0)
      g.scale.setScalar(1)
      anim.current = null
      return
    }

    const back = dir < 0
    const delay = back ? 0 : key.delay ?? 0
    if (!wasShown) {
      const from = spec.spawnFrom ? new THREE.Vector3(...spec.spawnFrom) : to.clone().setY(to.y + DROP_H)
      g.position.copy(from)
      g.rotation.set(0, toRot, 0)
      g.scale.setScalar(0)
      anim.current = {
        kind: spec.spawnFrom ? 'arc' : 'drop', from, to, fromRot: toRot, toRot, fromScale: 0, toScale: 1,
        start: now + delay, dur: spec.spawnFrom ? 0.95 : 0.7, h: 1.6, sounded: false,
      }
    } else {
      const from = g.position.clone()
      const dist = from.distanceTo(to)
      if (dist < 0.001 && Math.abs(g.rotation.y - toRot) < 0.001 && !spec.tumble) return
      anim.current = {
        kind: 'arc', from, to, fromRot: g.rotation.y, toRot, fromScale: 1, toScale: 1,
        start: now + delay, dur: back ? 0.45 : 0.95, h: Math.min(2.2, 0.5 + dist * 0.12), sounded: back,
      }
    }
  }, [sig]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    const g = outer.current
    const a = anim.current
    if (a) {
      const now = clock.elapsedTime
      if (now >= a.start) {
        const p = Math.min(1, (now - a.start) / a.dur)
        if (a.kind === 'drop') {
          g.position.set(a.to.x, a.to.y + (1 - easeOutBounce(p)) * DROP_H, a.to.z)
          g.scale.setScalar(Math.min(1, p * 5))
          if (!a.sounded && p > 0.36) {
            a.sounded = true
            play(sfx)
          }
        } else if (a.kind === 'arc') {
          const e = easeInOutCubic(p)
          g.position.lerpVectors(a.from, a.to, e)
          g.position.y += Math.sin(Math.PI * e) * a.h
          g.rotation.y = lerp(a.fromRot, a.toRot, e)
          if (spec.tumble) {
            g.rotation.x = (1 - e) * Math.PI * 4
            g.rotation.z = (1 - e) * Math.PI * 2
          }
          g.scale.setScalar(lerp(a.fromScale, a.toScale, Math.min(1, p * 3)))
          if (!a.sounded && p >= (sfx === 'dice' ? 0.55 : 1)) {
            a.sounded = true
            play(sfx)
          }
        } else {
          g.scale.setScalar(lerp(a.fromScale, 0, p))
        }
        if (p >= 1) {
          if (a.kind === 'hide') g.visible = false
          anim.current = null
        }
      }
    }

    // Highlight: lift the piece a little and fade in an amber glow sized to its footprint
    const want = hoverStore.hover?.id === spec.id || hoverStore.pinned?.id === spec.id ? 1 : 0
    if (want && !measured.current && !a) {
      measured.current = true
      const ry = g.rotation.y
      g.rotation.y = 0
      g.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(inner.current)
      g.rotation.y = ry
      const size = box.getSize(new THREE.Vector3())
      const c = box.getCenter(new THREE.Vector3())
      glow.current.scale.set(size.x + (flat ? 0 : 0.24), 1, size.z + (flat ? 0 : 0.24))
      glow.current.position.set(c.x - g.position.x, flat ? 0.034 : 0.012, c.z - g.position.z)
    }
    if (Math.abs(want - hoverAmt.current) > 0.001) {
      hoverAmt.current = lerp(hoverAmt.current, want, Math.min(1, dt * 14))
      if (!flat) {
        inner.current.position.y = hoverAmt.current * 0.07
        inner.current.scale.setScalar(1 + hoverAmt.current * 0.05)
      }
      const m = glow.current.material as THREE.MeshBasicMaterial
      m.opacity = hoverAmt.current * (flat ? 0.22 : 0.55)
      glow.current.visible = measured.current && hoverAmt.current > 0.01
    }
  })

  const hit = (e: ThreeEvent<PointerEvent | MouseEvent>): HoverHit | null => {
    if (!spec.info || !shown.current) return null
    e.stopPropagation()
    return { id: spec.id, info: spec.info, point: [e.point.x, e.point.y, e.point.z] }
  }

  return (
    <group
      ref={outer}
      visible={false}
      scale={0}
      onPointerOver={(e) => {
        const h = hit(e)
        if (h) hoverStore.setHover(h)
      }}
      onPointerOut={() => {
        if (hoverStore.hover?.id === spec.id) hoverStore.setHover(null)
      }}
      onClick={(e) => {
        const h = hit(e)
        if (h) hoverStore.setPinned(hoverStore.pinned?.id === h.id ? null : h)
      }}
    >
      <group ref={inner}>
        <PieceView kind={spec.kind} props={props} />
      </group>
      <mesh ref={glow} geometry={GEO.plane} visible={false} raycast={() => null}>
        <meshBasicMaterial color="#f59e0b" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

type Controls = { target: THREE.Vector3; update: () => void; addEventListener: (t: string, f: () => void) => void; removeEventListener: (t: string, f: () => void) => void }

/** Glides the camera to each step's focus, then hands control back to the user. */
function CameraRig({ focus, nonce, back = 1 }: { focus: Focus; nonce: number; /** extra pull-back, for showing the whole table in a page panel */ back?: number }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const controls = useThree((s) => s.controls) as unknown as Controls | null
  const flight = useRef<{ fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3; t: number } | null>(null)
  const first = useRef(true)
  const fkey = focus.pos.join(',') + focus.target.join(',')
  // Narrow (portrait) screens see less of the table, so pull the camera back to compensate
  const pull = Math.min(3, Math.max(1, 1.45 / (size.width / size.height))) * back

  useEffect(() => {
    if (!controls) return
    const toT = new THREE.Vector3(...focus.target)
    const toP = new THREE.Vector3(...focus.pos).sub(toT).multiplyScalar(pull).add(toT)
    if (first.current) {
      first.current = false
      camera.position.copy(toP)
      controls.target.copy(toT)
      controls.update()
      return
    }
    flight.current = { fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT, t: 0 }
  }, [fkey, nonce, controls, pull]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!controls) return
    const cancel = () => (flight.current = null)
    controls.addEventListener('start', cancel)
    return () => controls.removeEventListener('start', cancel)
  }, [controls])

  useFrame((_, dt) => {
    const f = flight.current
    if (!f || !controls) return
    f.t = Math.min(1, f.t + dt / 1.5)
    const e = easeInOutCubic(f.t)
    camera.position.lerpVectors(f.fromP, f.toP, e)
    controls.target.lerpVectors(f.fromT, f.toT, e)
    controls.update()
    if (f.t >= 1) flight.current = null
  })
  return null
}

/** Shifts the picture up a little so the bottom HUD never covers the action. */
function ViewOffset({ on }: { on: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  useEffect(() => {
    if (on) camera.setViewOffset(size.width, size.height, 0, Math.min(120, size.height * 0.13), size.width, size.height)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
  }, [on, size, camera])
  return null
}

/** The floating inspection card for the hovered or tapped piece. */
function Tooltip() {
  const { hover, pinned } = useHover()
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.domElement.style.cursor = hover ? 'pointer' : 'grab'
  }, [hover, gl])
  const show = hover ?? pinned
  if (!show) return null
  return (
    <Html position={[show.point[0], show.point[1] + 0.35, show.point[2]]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <div className="w-56 -translate-x-1/2 -translate-y-full">
        <div className="animate-grow origin-bottom rounded-xl border border-line bg-white px-4 py-3 shadow-lift">
          <div className="font-display text-ui font-bold text-ink">{show.info.title}</div>
          <div className="mt-1 text-meta text-stone-600">{show.info.body}</div>
        </div>
      </div>
    </Html>
  )
}

function Table({ table }: { table: TableDef }) {
  const tex = useMemo(woodTex, [])
  return (
    <mesh position={[0, -0.3, 0]} receiveShadow onClick={() => hoverStore.clear()}>
      <boxGeometry args={[table.w, 0.6, table.d]} />
      <meshStandardMaterial map={tex} color={table.tint ?? '#ffffff'} roughness={0.78} />
    </mesh>
  )
}

export function Scene({ game, gameKey, nav, nonce, idle, quiet, backdrop = '#d9cfc0' }: { game: GameSetup; gameKey: string; nav: Nav; nonce: number; idle: boolean; /** background color behind the table */ backdrop?: string; /** hide the hover cards (the daily table must not name its pieces) */ quiet?: boolean }) {
  const step = Math.min(nav.step, game.steps.length - 1)
  return (
    <NavContext.Provider value={nav}>
      <color attach="background" args={[backdrop]} />
      <fog attach="fog" args={[backdrop, 110, 230]} />
      <hemisphereLight args={['#fff4e2', '#8c6b4a', 0.75]} />
      <directionalLight
        position={[9, 22, 12]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-far={60}
      />
      <Table table={game.table} />
      {game.pieces.map((p) => (
        <AnimatedPiece key={`${gameKey}:${p.id}`} spec={p} />
      ))}
      {!quiet && <Tooltip />}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={130}
        maxPolarAngle={Math.PI * 0.47}
        autoRotate={idle}
        autoRotateSpeed={0.5}
      />
      <ViewOffset on={!idle} />
      <CameraRig focus={game.steps[step].focus} nonce={nonce} back={idle ? 1.3 : 1} />
    </NavContext.Provider>
  )
}
