/**
 * Howty: app shell, routing and the step HUD.
 *
 *   src/engine/              game-agnostic engine (schema types, animation, camera, audio, voice)
 *   src/components/pieces/   reusable 3D primitives + the kind -> component registry
 *   src/data/games/          one schema builder per game
 *   src/custom/              client-side rulebook parser and "+ Add Custom Game" modal
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Canvas } from '@react-three/fiber'
import { Scene, type Nav } from './engine/Engine'
import { audio, unlockAudio } from './engine/audio'
import { hoverStore } from './engine/hover'
import { canListen, hush, listen, primeSpeech, speak, voice } from './engine/voice'
import { CATALOG } from './data/games/catalog'
import { loadGame, loaded } from './data/games/load'
import type { GameDef, GameInfo } from './engine/types'
import { Recorder } from './ui/Recorder'
import { ShareSheet } from './ui/ShareSheet'
import { CustomGameModal } from './custom/CustomGameModal'
import { SITE } from './site'
import { Cover, PlayerPicker } from './ui/Cover'
import { Daily } from './ui/Daily'
import { Home, TopBar, playersLabel } from './ui/Home'
import { dailyPuzzle, today, update, useMe } from './ui/me'
import { Icon, Logo, type IconName } from './ui/icons'
import { Button, cx, panel, surface } from './ui/kit'
import { decodeShare, encodeShare, loadCustoms, saveCustoms, toGameDef, type CustomEntry } from './custom/parser'

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
    <button onClick={onClick} title={title ?? label} aria-label={title ?? label} aria-pressed={on} className={cx(panel, 'flex h-10 min-w-10 items-center justify-center gap-2 px-3 text-ui font-semibold transition duration-150 ease-out hover:bg-white active:scale-[0.97]', on ? 'text-accent' : 'text-ink')}>
      <Icon name={icon} />
      <span className="hidden xl:inline">{label}</span>
    </button>
  )
}

export default function App() {
  const first = useMemo(readRoute, [])
  const [customs, setCustoms] = useState<CustomEntry[]>(loadCustoms)
  const [sharedNote, setSharedNote] = useState('')
  const customDefs = useMemo(() => customs.map(toGameDef), [customs])
  /** Everything the library lists. Built-in games' 3D setups are fetched on demand (see data/games/load.ts). */
  const games: GameInfo[] = useMemo(() => [...CATALOG, ...customDefs], [customDefs])
  const full = (id: string): GameDef | undefined => customDefs.find((g) => g.id === id) ?? loaded(id)
  const known = (id: string | null): id is string => !!id && games.some((g) => g.id === id)
  const puzzle = useMemo(() => dailyPuzzle(CATALOG), [])
  const me = useMe()
  const guessed = me.daily?.day === today()
  const [gameId, setGameId] = useState(() => (first.view === 'daily' ? puzzle.answer.id : known(first.id) ? first.id : 'catan'))
  const [view, setView] = useState<View>(() => (first.view === 'daily' || known(first.id) ? first.view : 'home'))
  const started = view === 'play'
  // pages slide in from the side you are heading toward: deeper from the right, back from the left
  const depth = { home: 0, daily: 1, cover: 1, play: 2 }[view]
  const lastDepth = useRef(depth)
  const from = depth < lastDepth.current ? -16 : 16
  useEffect(() => {
    lastDepth.current = depth
  }, [depth])
  // main.tsx fetches the first game before the app starts, and every switch waits for its game to arrive
  const def = full(gameId) ?? loaded('catan')!
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
  // One 3D canvas for the whole app. It lives in its own element, which is moved into whichever
  // page panel is on screen, so switching pages never rebuilds the scene.
  const host = useMemo(() => Object.assign(document.createElement('div'), { className: 'h-full w-full' }), [])
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    slot?.appendChild(host)
  }, [slot, host])
  const page = useRef<HTMLDivElement>(null)
  useEffect(() => {
    page.current?.scrollTo(0, 0)
  }, [view, gameId])
  const [muted, setMuted] = useState(false)
  const [narrate, setNarrate] = useState(false)
  const [listening, setListening] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [showList, setShowList] = useState(false)
  const [adding, setAdding] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [teaching, setTeaching] = useState(false)
  const [recording, setRecording] = useState(false)

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
  const pickGame = async (id: string, to: View = started ? 'play' : 'cover', n = 0) => {
    const g = full(id) ?? (await loadGame(id))
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
      setNav({ step: loaded('catan')!.build(4).setupCount - 1, dir: -1, jump: true })
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
  /** Teach mode: every setup step plays by itself and is read aloud, then the first turn runs. */
  const teach = () => {
    unlockAudio()
    primeSpeech()
    voice.on = true
    setNarrate(true)
    setView('play')
    setNav({ step: 0, dir: -1, jump: true })
    setTeaching(true)
  }
  const watch = () => {
    setView('play')
    simulate()
  }
  /** Save as video: the setup plays through once in a portrait frame while the browser records it. */
  const record = () => {
    hoverStore.clear()
    hush()
    voice.on = false
    setNarrate(false)
    setTeaching(false)
    setPlaying(false)
    setSharing(false)
    setView('play')
    setRecording(true)
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

  /* Teach mode moves on after roughly the time it takes to read the step aloud */
  useEffect(() => {
    if (!started) return setTeaching(false)
    if (!teaching || inSim) return
    const words = `${s.title} ${s.instruction}`.split(/\s+/).length
    const t = window.setTimeout(() => {
      if (step < setupCount - 1) go(step + 1)
      else {
        setTeaching(false)
        simulate()
      }
    }, Math.max(4500, words * 400 + 1800))
    return () => window.clearTimeout(t)
  }, [teaching, started, inSim, step, setupCount, s, go]) // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    if (!started) setRecording(false)
  }, [started])

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
      if (!started || document.querySelector('[data-recording]')) return
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
    const onPop = async () => {
      const r = readRoute()
      if (r.view === 'daily') {
        where.current = 'daily'
        return openDaily()
      }
      const g = games.find((x) => x.id === r.id)
      where.current = g ? `${r.view}:${g.id}` : 'home:' + gameId
      if (!g) return goHome()
      await pickGame(g.id, r.view, r.players)
      if (r.view === 'play') setNav({ step: Math.max(0, r.step - 1), dir: 0, jump: true })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }) // eslint-disable-line react-hooks/exhaustive-deps


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
    <div className="relative h-full w-full select-none bg-paper text-ink">
      {createPortal(
        <Canvas shadows gl={{ preserveDrawingBuffer: true }} camera={{ position: [2, 25, 20], fov: 40, near: 0.1, far: 400 }} dpr={[1, 2]} onPointerMissed={() => hoverStore.clear()}>
          <Scene game={game} gameKey={gameId} nav={{ ...nav, step }} nonce={nonce} idle={!started} quiet={view === 'daily' && !guessed} backdrop={started ? '#e7e5e4' : '#f5f5f4'} />
        </Canvas>,
        host,
      )}
      {started ? (
        !recording && <div ref={setSlot} className="absolute inset-0" />
      ) : (
        <div ref={page} className="absolute inset-0 select-text overflow-y-auto overflow-x-hidden">
          <TopBar onHome={goHome} onDaily={openDaily} onAdd={() => setAdding(true)} />
          {view === 'home' ? (
            <div key="home" className="animate-slide" style={{ ['--from' as string]: `${from}px` }}>
              <Home
                games={games}
                note={sharedNote}
                demo={def}
                demoPlayers={players}
                demoSteps={setupCount}
                table={setSlot}
                onDemo={async (id) => {
                  const g = full(id) ?? (await loadGame(id))
                  hoverStore.clear()
                  setGameId(g.id)
                  setPlayers(g.meta.defaultPlayers)
                  setNav({ step: g.build(g.meta.defaultPlayers).setupCount - 1, dir: 0, jump: true })
                }}
                onOpen={(id) => pickGame(id, 'cover')}
                onAdd={() => setAdding(true)}
                onDaily={openDaily}
              />
            </div>
          ) : (
            /* A game page: the table on the left, what to do on the right */
            <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6 lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-[1.5fr_1fr]">
              <div className={cx(surface, 'relative h-[34dvh] min-h-[240px] overflow-hidden shadow-soft lg:h-auto')}>
                <div ref={setSlot} className="absolute inset-0" />
              </div>
              <div className={cx(surface, 'overflow-x-hidden p-6 shadow-soft lg:overflow-y-auto')}>
                <div key={`${view}:${gameId}`} className="animate-slide h-full" style={{ ['--from' as string]: `${from}px` }}>
                  {view === 'daily' ? (
                    <Daily puzzle={puzzle} onOpen={(id) => pickGame(id, 'cover')} onHome={goHome} />
                  ) : (
                    <Cover def={def} game={game} players={players} note={sharedNote} onPlayers={changePlayers} onStart={start} onTeach={teach} onWatch={watch} onHome={goHome} onShare={() => setSharing(true)} onRemove={removeCustom} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {adding && <CustomGameModal onClose={() => setAdding(false)} onCreate={addCustom} />}
      {sharing && <ShareSheet url={window.location.href} title={def.meta.title} onVideo={record} onClose={() => setSharing(false)} />}
      {recording && started && (
        <Recorder
          host={host}
          slot={setSlot}
          title={def.meta.title}
          link={def.custom ? window.location.host : `${window.location.host}/g/${gameId}`}
          steps={game.steps.slice(0, setupCount)}
          step={step}
          onStep={(i) => (i === 0 ? setNav({ step: 0, dir: -1, jump: true }) : go(i))}
          onClose={() => setRecording(false)}
        />
      )}

      {started && (
        <>
          {/* Top left: game switcher + player count */}
          <div className="absolute left-2 top-2 z-20 flex max-w-[calc(100%-4rem)] flex-col items-start gap-2 sm:left-4 sm:top-4">
            <div className={cx(panel, 'flex flex-wrap items-center gap-2 p-2')}>
              <button onClick={goHome} title="All games" aria-label="All games" className="rounded-lg p-1 transition duration-150 ease-out hover:bg-ink/5 active:scale-[0.96]">
                <Logo size={24} />
              </button>
              <select
                value={gameId}
                aria-label="Game"
                onChange={(e) => (e.target.value === '+' ? setAdding(true) : pickGame(e.target.value))}
                className="h-10 max-w-[11rem] rounded-xl border border-line bg-white px-3 font-display text-body font-bold text-ink sm:max-w-[16rem]"
              >
                {[...games].sort((x, y) => x.meta.title.localeCompare(y.meta.title)).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.meta.title}
                  </option>
                ))}
                <option value="+">Add a game…</option>
              </select>
              {range[0] !== range[1] && (
                <div className="hidden sm:block">
                  <PlayerPicker range={range} value={players} onChange={changePlayers} />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowList((v) => !v)} aria-expanded={showList} className={cx(panel, 'flex h-8 items-center gap-2 px-3 text-ui font-medium text-ink transition duration-150 ease-out hover:bg-white active:scale-[0.98]')}>
                <Icon name={showList ? 'x' : 'list'} /> Steps
              </button>
              <button onClick={() => pickGame(gameId, 'cover', players)} className={cx(panel, 'flex h-8 items-center px-3 text-ui font-medium text-ink transition duration-150 ease-out hover:bg-white active:scale-[0.98]')}>
                {playersLabel(range)} · {def.meta.playTime}
              </button>
            </div>
            {/* The list grows out of the button that opened it */}
            {showList && (
              <ol className={cx(panel, 'animate-grow max-h-[42dvh] w-64 origin-top-left overflow-auto p-2')}>
                {game.steps.slice(0, setupCount).map((st, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        setPlaying(false)
                        go(i)
                      }}
                      className={cx('flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-ui transition duration-150 ease-out', i === step ? 'bg-ink font-semibold text-paper' : 'text-stone-700 hover:bg-ink/5')}
                    >
                      <span className={cx('w-4 shrink-0 text-center text-meta', i === step ? 'text-paper' : 'text-stone-400')}>{i < step ? <Icon name="check" size={16} /> : i + 1}</span>
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
                else primeSpeech()
                setNarrate(!narrate)
              }}
            />
            {canListen() && (
              <IconButton icon="mic" on={listening} label={listening ? 'Listening' : 'Voice control'} title='Voice commands: say "Next", "Back" or "Repeat"' onClick={() => setListening(!listening)} />
            )}
            <IconButton icon="target" label="Recenter" onClick={() => setNonce((n) => n + 1)} />
            <IconButton icon="share" label="Share" title={def.custom ? 'Share a link that includes this game’s rules, or a QR code for the table' : 'Share this step, or show a QR code for the table'} onClick={() => setSharing(true)} />
          </div>

          {/* Bottom: the step. Its one focal point is the instruction and the Next button. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-4">
            <div className={cx(panel, 'pointer-events-auto w-full max-w-3xl p-4 sm:p-6')}>
              <div className="flex gap-1">
                {(inSim ? game.steps.slice(setupCount) : game.steps.slice(0, setupCount)).map((_, i) => (
                  <button key={i} aria-label={`Go to step ${i + 1}`} onClick={() => go(inSim ? setupCount + i : i)} className={cx('h-1 flex-1 rounded-full transition-colors duration-300 ease-out', i <= (inSim ? simIndex : step) ? 'bg-accent' : 'bg-ink/10 hover:bg-ink/25')} />
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                <div key={step} className="animate-slide min-w-0 flex-1" style={{ ['--from' as string]: `${nav.dir < 0 ? -8 : 8}px` }}>
                  <div className="flex items-center gap-2 text-meta font-semibold">
                    <button onClick={() => inSim && exitSim()} className={inSim ? 'text-stone-400 transition hover:text-ink' : 'text-ink'}>
                      Setup{!inSim && ` ${step + 1} of ${setupCount}`}
                    </button>
                    <span className="text-stone-300">/</span>
                    <button onClick={() => !inSim && simulate()} className={inSim ? 'text-ink' : 'text-stone-400 transition hover:text-ink'}>
                      First turn{inSim && ` ${simIndex + 1} of ${simTotal}`}
                    </button>
                  </div>
                  <h2 className="mt-1 font-display text-title font-bold text-ink sm:text-page">{s.title}</h2>
                  <p className="mt-2 max-w-[60ch] text-body text-stone-800">{s.instruction}</p>
                  {s.detail && <p className="mt-1 hidden max-w-[60ch] text-ui text-stone-500 sm:block">{s.detail}</p>}
                  {!!s.needs?.length && <p className="mt-2 hidden text-meta text-stone-500 sm:block">{s.needs.join(' · ')}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  {inSim ? (
                    <>
                      <Button icon="back" onClick={exitSim} className="flex-1 sm:flex-none">
                        Setup
                      </Button>
                      {step < total - 1 ? (
                        <Button kind="primary" icon={playing ? 'pause' : 'play'} onClick={() => setPlaying(!playing)} className="flex-1 sm:flex-none">
                          {playing ? 'Pause' : 'Resume'}
                        </Button>
                      ) : (
                        <>
                          <Button icon="replay" onClick={simulate} className="flex-1 sm:flex-none">
                            Replay
                          </Button>
                          <Button kind="accent" icon="share" onClick={() => setSharing(true)} className="flex-1 sm:flex-none">
                            <span className="whitespace-nowrap sm:hidden">Share</span>
                            <span className="hidden whitespace-nowrap sm:inline">Send to your group</span>
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Button icon="back" onClick={() => go(step - 1)} disabled={step === 0}>
                        Back
                      </Button>
                      {teaching ? (
                        <Button kind="primary" icon="pause" onClick={() => setTeaching(false)} className="flex-1 sm:flex-none">
                          Pause
                        </Button>
                      ) : step < setupCount - 1 ? (
                        <Button kind="primary" iconRight="arrow" onClick={() => go(step + 1)} className="flex-1 sm:flex-none">
                          Next
                        </Button>
                      ) : (
                        <Button kind="accent" icon="play" onClick={simulate} className="flex-1 sm:flex-none">
                          Watch the first turn
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
