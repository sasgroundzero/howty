/**
 * Howty: app shell, routing and the step HUD.
 *
 *   src/engine/              game-agnostic engine (schema types, animation, camera, audio, voice)
 *   src/components/pieces/   reusable 3D primitives + the kind -> component registry
 *   src/data/games/          one schema builder per game
 *   src/custom/              client-side rulebook parser and "+ Add Custom Game" modal
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene, type Nav } from './engine/Engine'
import { audio, unlockAudio } from './engine/audio'
import { hoverStore } from './engine/hover'
import { canListen, hush, listen, speak, voice } from './engine/voice'
import { GAMES } from './data/games'
import { CustomGameModal } from './custom/CustomGameModal'
import { SITE } from './site'
import { Cover, PlayerPicker } from './ui/Cover'
import { Daily } from './ui/Daily'
import { Home, playersLabel } from './ui/Home'
import { dailyPuzzle, today, update, useMe } from './ui/me'
import { Icon, Logo, type IconName } from './ui/icons'
import { decodeShare, encodeShare, loadCustoms, saveCustoms, toGameDef, type CustomEntry } from './custom/parser'

const panel = 'rounded-2xl border border-stone-900/10 bg-[#fbf7ef]/90 shadow-lg backdrop-blur-md'
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

type View = 'home' | 'cover' | 'play' | 'daily'
/** "/" is home, "/g/azul" a cover page, "/g/azul?step=3&players=4" a step. Old "?game=azul" links still work. */
function readRoute() {
  const q = new URLSearchParams(window.location.search)
  const id = window.location.pathname.match(/^\/g\/([\w-]+)\/?$/)?.[1] ?? q.get('game')
  const step = Number(q.get('step')) || 0
  if (/^\/daily\/?$/.test(window.location.pathname)) return { id: null, step: 0, players: 0, view: 'daily' as View }
  return { id, step, players: Number(q.get('players')) || 0, view: (id ? (step ? 'play' : 'cover') : 'home') as View }
}

function IconButton({ on, label, icon, onClick, title }: { on?: boolean; label: string; icon: IconName; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title ?? label}
      aria-label={title ?? label}
      aria-pressed={on}
      className={`flex h-10 min-w-10 items-center justify-center gap-1.5 px-2.5 text-sm font-semibold transition hover:bg-white ${panel} ${on ? '!border-amber-600 !bg-amber-100' : ''}`}
    >
      <Icon name={icon} />
      <span className="hidden xl:inline">{label}</span>
    </button>
  )
}

export default function App() {
  const first = useMemo(readRoute, [])
  const [customs, setCustoms] = useState<CustomEntry[]>(loadCustoms)
  const [sharedNote, setSharedNote] = useState('')
  const games = useMemo(() => [...GAMES, ...customs.map(toGameDef)], [customs])
  const known = (id: string | null): id is string => !!id && games.some((g) => g.id === id)
  const puzzle = useMemo(() => dailyPuzzle(GAMES), [])
  const me = useMe()
  const guessed = me.daily?.day === today()
  const [gameId, setGameId] = useState(() => (first.view === 'daily' ? puzzle.answer.id : known(first.id) ? first.id : 'catan'))
  const [view, setView] = useState<View>(() => (first.view === 'daily' || known(first.id) ? first.view : 'home'))
  const started = view === 'play'
  const def = games.find((g) => g.id === gameId) ?? games[0]
  const [players, setPlayers] = useState(() => clamp(first.players || def.meta.defaultPlayers, def.meta.players[0], def.meta.players[1]))
  const game = useMemo(() => def.build(players), [def, players])
  const { setupCount } = game
  const total = game.steps.length

  // On the home and cover pages the finished table turns slowly beside the text
  const [nav, setNav] = useState<Nav>(() => {
    const n = def.build(players).setupCount
    return { step: started ? clamp(first.step - 1, 0, n - 1) : n - 1, dir: 0, jump: true }
  })
  const [nonce, setNonce] = useState(0)
  const [muted, setMuted] = useState(false)
  const [narrate, setNarrate] = useState(false)
  const [listening, setListening] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [showList, setShowList] = useState(false)
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)

  const step = Math.min(nav.step, total - 1)
  const s = game.steps[step]
  const inSim = step >= setupCount
  const range = def.meta.players

  const go = useCallback(
    (to: number) => {
      setNav((v) => {
        const next = clamp(to, 0, total - 1)
        if (next === v.step) return v
        hoverStore.clear()
        return { step: next, dir: Math.sign(next - v.step), jump: Math.abs(next - v.step) > 1 }
      })
    },
    [total],
  )
  const say = useCallback(() => speak(`${s.title}. ${s.instruction}`), [s])

  /** Shows a game: its cover page, or straight into the steps when switching from the step view. */
  const pickGame = (id: string, to: View = started ? 'play' : 'cover', n = 0) => {
    const g = games.find((x) => x.id === id) ?? games[0]
    const count = clamp(n || g.meta.defaultPlayers, g.meta.players[0], g.meta.players[1])
    hoverStore.clear()
    hush()
    setPlaying(false)
    setGameId(g.id)
    setPlayers(count)
    setView(to)
    setNav({ step: to === 'play' ? 0 : g.build(count).setupCount - 1, dir: -1, jump: true })
  }
  const goHome = () => {
    hoverStore.clear()
    hush()
    setPlaying(false)
    setSharedNote('')
    setView('home')
    // leaving an unanswered daily table must not leave its game showing on the home page
    if (view === 'daily' && !guessed) {
      setGameId('catan')
      setPlayers(4)
      setNav({ step: GAMES[0].build(4).setupCount - 1, dir: -1, jump: true })
    } else setNav({ step: setupCount - 1, dir: -1, jump: true })
  }
  const openDaily = () => {
    pickGame(puzzle.answer.id, 'daily')
    setSharedNote('')
  }
  const start = () => {
    unlockAudio()
    setView('play')
    setNav({ step: 0, dir: -1, jump: true })
  }

  const simulate = () => {
    unlockAudio()
    hoverStore.clear()
    // Snap back to the finished setup first so a replay starts clean
    setNav({ step: setupCount - 1, dir: -1, jump: true })
    requestAnimationFrame(() => {
      setNav({ step: setupCount, dir: 1, jump: false })
      setPlaying(true)
    })
  }
  const watch = () => {
    setView('play')
    simulate()
  }
  const exitSim = () => {
    setPlaying(false)
    setNav({ step: setupCount - 1, dir: -1, jump: true })
  }

  /* Auto-advance while the first-turn simulation is playing */
  useEffect(() => {
    if (!inSim || !playing) return
    const t = window.setTimeout(() => (step < total - 1 ? go(step + 1) : setPlaying(false)), (s.duration ?? 6) * 1000)
    return () => window.clearTimeout(t)
  }, [inSim, playing, step, total, s, go])

  /* Remember what you have followed: steps walked, and setups seen through to the end */
  const seen = useRef('')
  useEffect(() => {
    if (!started || inSim) return
    const key = `${gameId}:${step}`
    if (seen.current === key) return
    const fresh = seen.current.split(':')[0] === gameId && step > Number(seen.current.split(':')[1])
    seen.current = key
    if (fresh) update((m) => ({ ...m, steps: m.steps + 1, done: step === setupCount - 1 ? { ...m.done, [gameId]: (m.done[gameId] ?? 0) + 1 } : m.done }))
  }, [started, inSim, gameId, step, setupCount])

  /* Narration */
  useEffect(() => {
    if (started && narrate) say()
  }, [started, narrate, step, gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Keyboard and voice commands share one handler */
  const command = useRef<(c: 'next' | 'back' | 'repeat') => void>(() => undefined)
  command.current = (c) => {
    unlockAudio()
    if (c === 'next') {
      if (step === setupCount - 1) simulate()
      else go(step + 1)
    } else if (c === 'back') go(step - 1)
    else {
      voice.on = true
      say()
      voice.on = narrate
    }
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return
      if (!started) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        if (stepRef.current !== setupRef.current - 1) command.current('next')
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        command.current('back')
      } else if (e.key.toLowerCase() === 'r') command.current('repeat')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started])
  const stepRef = useRef(step)
  stepRef.current = step
  const setupRef = useRef(setupCount)
  setupRef.current = setupCount

  useEffect(() => {
    if (!listening) return
    const stop = listen((c) => command.current(c), () => setListening(false))
    if (!stop) setListening(false)
    return () => stop?.()
  }, [listening])

  /* A link to a custom game carries its rules after the #, so a friend's browser can rebuild it. */
  const [packed, setPacked] = useState('')
  const custom = def.custom ? customs.find((c) => c.id === gameId) : undefined
  useEffect(() => {
    let live = true
    setPacked('')
    if (custom) void encodeShare(custom).then((s) => live && setPacked(s))
    return () => {
      live = false
    }
  }, [custom])
  const [pending, setPending] = useState(() => /^#rules=[zu]\./.test(window.location.hash))
  useEffect(() => {
    const m = window.location.hash.match(/^#rules=([zu]\.[\w-]+)$/)
    if (!m) return setPending(false)
    void decodeShare(m[1], first.id ?? '').then((e) => {
      setPending(false)
      if (!e) return setSharedNote('That shared game link is damaged, so it could not be opened.')
      setCustoms((old) => {
        const list = [...old.filter((c) => c.id !== e.id), e]
        saveCustoms(list)
        return list
      })
      const g = toGameDef(e)
      const count = clamp(first.players || g.meta.defaultPlayers, g.meta.players[0], g.meta.players[1])
      setGameId(e.id)
      setPlayers(count)
      setView('cover')
      setNav({ step: g.build(count).setupCount - 1, dir: 0, jump: true })
      setSharedNote(`“${g.meta.title}” was shared with you and has been added to your games.`)
    })
  }, [first])

  /* The address bar follows the view, so every game and step has a link and Back works. */
  const where = useRef('')
  useEffect(() => {
    if (pending) return
    const q = new URLSearchParams()
    if (started) q.set('step', String(Math.min(step, setupCount - 1) + 1))
    if (view !== 'home' && range[0] !== range[1] && (started || players !== def.meta.defaultPlayers)) q.set('players', String(players))
    const url = view === 'home' ? '/' : view === 'daily' ? '/daily' : `/g/${gameId}${q.size ? `?${q}` : ''}${def.custom && packed ? `#rules=${packed}` : ''}`
    const key = view === 'daily' ? 'daily' : `${view}:${gameId}`
    if (where.current && where.current !== key) window.history.pushState(null, '', url)
    else window.history.replaceState(null, '', url)
    where.current = key
    document.title = view === 'home' ? `${SITE.name}: ${SITE.tagline.toLowerCase().replace(/\.$/, '')}` : view === 'daily' ? `Daily table #${puzzle.number} | ${SITE.name}` : `How to set up ${def.meta.title} | ${SITE.name}`
  }, [pending, view, started, gameId, step, players, setupCount, range, def, packed])
  useEffect(() => {
    const onPop = () => {
      const r = readRoute()
      if (r.view === 'daily') {
        where.current = 'daily'
        return openDaily()
      }
      const g = games.find((x) => x.id === r.id)
      where.current = g ? `${r.view}:${g.id}` : 'home:' + gameId
      if (!g) return goHome()
      pickGame(g.id, r.view, r.players)
      if (r.view === 'play') setNav({ step: Math.max(0, r.step - 1), dir: 0, jump: true })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.prompt('Copy this link', window.location.href)
    }
  }

  const addCustom = (e: CustomEntry) => {
    const list = [...customs.filter((c) => c.id !== e.id), e]
    setCustoms(list)
    saveCustoms(list)
    setAdding(false)
    const g = toGameDef(e)
    unlockAudio()
    hoverStore.clear()
    pickGame(g.id, 'cover')
    setGameId(g.id)
  }
  const removeCustom = () => {
    const list = customs.filter((c) => c.id !== gameId)
    setCustoms(list)
    saveCustoms(list)
    setGameId('catan')
    goHome()
  }
  const changePlayers = (n: number) => {
    unlockAudio()
    hoverStore.clear()
    setPlayers(n)
    setNav((v) => ({ step: started ? Math.min(v.step, setupCount - 1) : def.build(n).setupCount - 1, dir: 0, jump: !started }))
    setPlaying(false)
  }

  const simIndex = step - setupCount
  const simTotal = total - setupCount

  return (
    <div className="relative h-full w-full select-none text-stone-900">
      {/* The 3D table fills the screen while playing; on the home and cover pages it sits beside (or above) the text. */}
      <div className={started ? 'absolute inset-0' : 'absolute inset-x-0 top-0 h-[34dvh] lg:inset-y-0 lg:left-[46%] lg:h-auto'}>
        <Canvas shadows camera={{ position: [2, 25, 20], fov: 40, near: 0.1, far: 400 }} dpr={[1, 2]} onPointerMissed={() => hoverStore.clear()}>
          <Scene game={game} gameKey={gameId} nav={{ ...nav, step }} nonce={nonce} idle={!started} quiet={view === 'daily' && !guessed} />
        </Canvas>
        {view === 'home' && (
          <button onClick={() => pickGame(gameId, 'cover')} className={`absolute bottom-3 left-3 flex items-center gap-2 px-3 py-2 text-sm font-semibold hover:bg-white ${panel}`}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" /> Live: {def.meta.title}, set up for {players} <Icon name="arrow" size={15} />
          </button>
        )}
      </div>
      {!started && (
        <main className="absolute inset-x-0 bottom-0 top-[34dvh] select-text overflow-y-auto rounded-t-3xl bg-[#fbf7ef] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:inset-y-0 lg:right-auto lg:w-[46%] lg:rounded-none lg:shadow-[8px_0_30px_rgba(0,0,0,0.08)]">
          {view === 'home' ? (
            <Home games={games} note={sharedNote} onOpen={(id) => pickGame(id, 'cover')} onAdd={() => setAdding(true)} onDaily={openDaily} />
          ) : view === 'daily' ? (
            <Daily puzzle={puzzle} onOpen={(id) => pickGame(id, 'cover')} onHome={goHome} />
          ) : (
            <Cover def={def} game={game} players={players} note={sharedNote} copied={copied} onPlayers={changePlayers} onStart={start} onWatch={watch} onHome={goHome} onShare={() => void share()} onRemove={removeCustom} />
          )}
        </main>
      )}
      {adding && <CustomGameModal onClose={() => setAdding(false)} onCreate={addCustom} />}

      {started && (
        <>
          {/* Top left: game switcher + player count */}
          <div className="absolute left-2 top-2 z-20 flex max-w-[calc(100%-4rem)] flex-col items-start gap-2 sm:left-4 sm:top-4">
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-2.5 py-2 sm:px-3 sm:py-2.5 ${panel}`}>
              <button onClick={goHome} title="All games" aria-label="All games" className="rounded-lg transition hover:opacity-70">
                <Logo size={30} />
              </button>
              <label className="flex items-center gap-2">
                <select
                  value={gameId}
                  onChange={(e) => (e.target.value === '+' ? setAdding(true) : pickGame(e.target.value))}
                  className="max-w-[11.5rem] rounded-lg border border-stone-300 bg-white px-2 py-1.5 font-display text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 sm:max-w-none sm:text-base"
                >
                  {[...games].sort((x, y) => x.meta.title.localeCompare(y.meta.title)).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.meta.title}
                    </option>
                  ))}
                  <option value="+">+ Add Custom Game…</option>
                </select>
              </label>
              {range[0] !== range[1] && (
                <div className="flex items-center gap-2">
                  <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-stone-500 sm:inline">Players</span>
                  <PlayerPicker range={range} value={players} onChange={changePlayers} />
                </div>
              )}
              <div className="hidden items-center gap-1.5 text-[11px] font-medium text-stone-600 xl:flex">
                {range[0] === range[1] && <span className="rounded-full border border-stone-300 bg-white px-2 py-0.5">{playersLabel(range)}</span>}
                <span className="rounded-full border border-stone-300 bg-white px-2 py-0.5">{def.meta.playTime}</span>
                <span className="rounded-full border border-stone-300 bg-white px-2 py-0.5">{def.meta.difficulty}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowList((v) => !v)} className={`px-3 py-1.5 text-xs font-semibold hover:bg-white ${panel}`}>
                {showList ? 'Hide steps' : 'All steps'}
              </button>
              <button onClick={() => pickGame(gameId, 'cover', players)} className={`px-3 py-1.5 text-xs font-semibold hover:bg-white ${panel}`}>
                About this game
              </button>
            </div>
            {showList && (
              <ol className={`max-h-[42dvh] w-60 overflow-auto p-1.5 ${panel}`}>
                {game.steps.slice(0, setupCount).map((st, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        setPlaying(false)
                        go(i)
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition ${
                        i === step ? 'bg-stone-900 font-semibold text-white' : 'text-stone-700 hover:bg-stone-900/5'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          i === step ? 'bg-white text-stone-900' : i < step ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {i < step ? '✓' : i + 1}
                      </span>
                      {st.title}
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Top right: floating controls (a column on phones, a row on larger screens) */}
          <div className="absolute right-2 top-2 z-20 flex flex-col gap-2 sm:right-4 sm:top-4 sm:flex-row">
            <IconButton
              icon={muted ? 'mute' : 'sound'}
              label={muted ? 'Sound off' : 'Sound on'}
              title="Toggle sound effects"
              onClick={() => {
                audio.muted = !muted
                setMuted(!muted)
                if (muted) unlockAudio()
              }}
            />
            <IconButton
              icon="speak"
              on={narrate}
              label={narrate ? 'Narration on' : 'Narration'}
              title="Read each step aloud"
              onClick={() => {
                voice.on = !narrate
                if (narrate) hush()
                setNarrate(!narrate)
              }}
            />
            {canListen() && (
              <IconButton icon="mic" on={listening} label={listening ? 'Listening' : 'Voice control'} title='Voice commands: say "Next", "Back" or "Repeat"' onClick={() => setListening(!listening)} />
            )}
            <IconButton icon="target" label="Recenter" onClick={() => setNonce((n) => n + 1)} />
            <IconButton icon="link" label={copied ? 'Copied!' : 'Share'} on={copied} title={def.custom ? 'Copy a link that includes this game’s rules, so a friend can open it' : 'Copy a link to this step'} onClick={() => void share()} />
          </div>

          {/* Bottom: step HUD */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-5">
            <div className={`pointer-events-auto w-full max-w-3xl p-3 sm:p-5 ${panel} ${inSim ? '!border-amber-500/60' : ''}`}>
              <div className="flex gap-1">
                {(inSim ? game.steps.slice(setupCount) : game.steps.slice(0, setupCount)).map((_, i) => {
                  const at = inSim ? simIndex : step
                  return (
                    <button
                      key={i}
                      aria-label={`Go to step ${i + 1}`}
                      onClick={() => go(inSim ? setupCount + i : i)}
                      className={`h-2 flex-1 rounded-full transition-colors sm:h-1.5 ${i <= at ? 'bg-amber-600' : 'bg-stone-300 hover:bg-stone-400'}`}
                    />
                  )
                })}
              </div>
              <div className="mt-2.5 flex flex-col gap-3 sm:mt-3 sm:flex-row sm:items-end sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                    <button onClick={() => inSim && exitSim()} className={inSim ? 'text-stone-400 hover:text-stone-700' : 'text-amber-700'}>
                      Setup{!inSim && ` · ${step + 1} of ${setupCount}`}
                    </button>
                    <span className="text-stone-300">→</span>
                    <button onClick={() => !inSim && simulate()} className={inSim ? 'text-amber-700' : 'text-stone-400 hover:text-stone-700'}>
                      First turn{inSim && ` · ${simIndex + 1} of ${simTotal}`}
                    </button>
                  </div>
                  <h2 className="font-display text-lg font-bold leading-tight sm:text-2xl">{s.title}</h2>
                  <p className="mt-1 text-sm leading-snug text-stone-800 sm:text-[15px]">{s.instruction}</p>
                  {s.detail && <p className="mt-1 hidden text-[13px] leading-snug text-stone-500 sm:block">{s.detail}</p>}
                  {!!s.needs?.length && (
                    <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
                      {s.needs.map((n) => (
                        <span key={n} className="rounded-full border border-stone-300 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-600">
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {inSim ? (
                    <>
                      <button onClick={exitSim} className="h-11 flex-1 rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold transition hover:bg-stone-50 sm:flex-none">
                        ← Setup
                      </button>
                      {step < total - 1 ? (
                        <button onClick={() => setPlaying(!playing)} className="h-11 flex-1 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-stone-700 sm:flex-none">
                          {playing ? '❚❚ Pause' : '▶ Resume'}
                        </button>
                      ) : (
                        <button onClick={simulate} className="h-11 flex-1 rounded-full bg-amber-600 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-700 sm:flex-none">
                          ↻ Replay
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => go(step - 1)}
                        disabled={step === 0}
                        className="h-11 rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold transition hover:bg-stone-50 disabled:opacity-35"
                      >
                        ← Back
                      </button>
                      {step < setupCount - 1 ? (
                        <button onClick={() => go(step + 1)} className="h-11 flex-1 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-stone-700 sm:flex-none">
                          Next →
                        </button>
                      ) : (
                        <button
                          onClick={simulate}
                          className="h-12 flex-1 animate-pulse rounded-full bg-amber-600 px-6 text-base font-bold text-white shadow-lg ring-4 ring-amber-300/60 transition hover:animate-none hover:bg-amber-700 sm:flex-none"
                        >
                          ▶ Simulate First Turn
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2 hidden text-[11px] text-stone-400 sm:block">
                ← → change steps · R repeats narration · drag to orbit · scroll or pinch to zoom · right-drag or two fingers to pan · hover or tap any piece
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
