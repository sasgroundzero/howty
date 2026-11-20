/**
 * The embeddable guide at /embed/<id>: one game's 3D table with Back and Next, sized to sit inside another
 * page (a blog post, a forum thread, a Kickstarter page). Sound stays off and every link opens Howty in a
 * new tab, so the host page is never taken over.
 */
import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene, type Nav } from '../engine/Engine'
import { hoverStore } from '../engine/hover'
import { loaded } from '../data/games/load'
import { SITE } from '../site'
import { Icon, Logo } from './icons'
import { Button, cx, panel } from './kit'

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

export function Embed({ id }: { id: string }) {
  const def = loaded(id)
  const q = new URLSearchParams(window.location.search)
  const players = def ? clamp(Number(q.get('players')) || def.meta.defaultPlayers, def.meta.players[0], def.meta.players[1]) : 0
  const game = useMemo(() => def?.build(players), [def, players])
  const setupCount = game?.setupCount ?? 1
  const total = game?.steps.length ?? 1
  const [started, setStarted] = useState(false)
  const [nav, setNav] = useState<Nav>({ step: setupCount - 1, dir: 0, jump: true })
  const go = (to: number) =>
    setNav((v) => {
      const next = clamp(to, 0, total - 1)
      if (next === v.step) return v
      hoverStore.clear()
      return { step: next, dir: Math.sign(next - v.step), jump: Math.abs(next - v.step) > 1 }
    })
  const start = () => {
    setStarted(true)
    setNav({ step: 0, dir: -1, jump: true })
  }

  useEffect(() => {
    document.title = def ? `How to set up ${def.meta.title} | ${SITE.name}` : SITE.name
    const onKey = (e: KeyboardEvent) => {
      if (!started) return
      if (e.key === 'ArrowRight') go(nav.step + 1)
      if (e.key === 'ArrowLeft') go(nav.step - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const link = `/g/${id}${players !== def?.meta.defaultPlayers ? `?players=${players}` : ''}`
  if (!def || !game)
    return (
      <div className="flex h-full items-center justify-center bg-mist p-4 text-center text-ui text-stone-600">
        <a href="/" target="_blank" rel="noopener" className="underline">
          This guide isn’t on {SITE.name}. Browse every guide
        </a>
      </div>
    )

  const step = Math.min(nav.step, total - 1)
  const s = game.steps[step]
  const inTurn = step >= setupCount
  const last = step === total - 1
  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-mist text-ink">
      <Canvas shadows camera={{ position: [2, 25, 20], fov: 40, near: 0.1, far: 400 }} dpr={[1, 2]} onPointerMissed={() => hoverStore.clear()}>
        <Scene game={game} gameKey={id} nav={{ ...nav, step }} nonce={0} idle={!started} backdrop={started ? '#e7e5e4' : '#f5f5f4'} />
      </Canvas>

      <a href={link} target="_blank" rel="noopener" className={cx(panel, 'absolute left-2 top-2 flex max-w-[calc(100%-1rem)] items-center gap-2 py-1.5 pl-1.5 pr-3 text-ui font-semibold transition hover:bg-white')}>
        <Logo size={24} />
        <span className="truncate">How to set up {def.meta.title}</span>
        <Icon name="arrow" size={14} />
      </a>

      {!started ? (
        <div className="absolute inset-x-2 bottom-2 flex flex-wrap items-center justify-between gap-2 sm:inset-x-3 sm:bottom-3">
          <p className={cx(panel, 'px-3 py-2 text-ui text-stone-600')}>
            {players} {players === 1 ? 'player' : 'players'} · {setupCount} setup steps · {def.meta.playTime}
          </p>
          <Button kind="accent" icon="play" onClick={start}>
            Start setup
          </Button>
        </div>
      ) : (
        // a narrow card in the corner on wider embeds, so most of the table stays in view
        <div className={cx(panel, 'absolute inset-x-2 bottom-2 p-3 sm:inset-x-auto sm:bottom-3 sm:left-3 sm:w-[22rem]')}>
          <div className="flex gap-1" aria-hidden>
            {game.steps.map((_, i) => (
              <span key={i} className={cx('h-1 flex-1 rounded-full', i <= step ? (i >= setupCount ? 'bg-ink' : 'bg-accent') : 'bg-ink/10')} />
            ))}
          </div>
          <p className="mt-2 text-meta font-semibold text-stone-500">{inTurn ? `First turn ${step - setupCount + 1} of ${total - setupCount}` : `Step ${step + 1} of ${setupCount}`}</p>
          <h1 className="font-display text-title font-bold">{s.title}</h1>
          <p className="mt-1 line-clamp-2 text-ui text-stone-700 sm:line-clamp-4" title={s.instruction} aria-live="polite">
            {s.instruction}
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button size="sm" icon="back" onClick={() => go(step - 1)} disabled={step === 0}>
              Back
            </Button>
            {last ? (
              <a href={link} target="_blank" rel="noopener" className="inline-flex h-8 items-center gap-2 rounded-full bg-accent px-3 text-ui font-semibold text-white transition hover:bg-amber-700">
                Full guide on {SITE.name}
                <Icon name="arrow" size={16} />
              </a>
            ) : (
              <Button size="sm" kind={step === setupCount - 1 ? 'accent' : 'primary'} iconRight="arrow" onClick={() => go(step + 1)}>
                {step === setupCount - 1 ? 'First turn' : 'Next'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
