/** The home page. Its one job is to get you to your game, so the search box is the loudest thing on it. */
import { useMemo, useState } from 'react'
import type { GameDef } from '../engine/types'
import { CARD_IDS } from '../data/games/more'
import { DISCLAIMER, FEATURED, SITE, TRY } from '../site'
import { ArtFind, ArtFollow, ArtWatch } from './art'
import { Icon, Logo } from './icons'
import { Button, Chip, H2, Note, Stats, cx, surface } from './kit'
import { STATUS, dayNumber, liveStreak, today, useMe, type Status } from './me'

export const playersLabel = ([a, b]: [number, number]) => (a === b ? `${a} player${a > 1 ? 's' : ''}` : `${a}–${b} players`)
const mins = (g: GameDef) => Math.max(...(g.meta.playTime.match(/\d+/g) ?? ['999']).map(Number))
/** Lists are plain filters over each game's own facts, so they never go stale. */
const LISTS: [string, string, (g: GameDef) => boolean][] = [
  ['All', 'Everything', () => true],
  ['Easy', 'Easy to learn', (g) => g.meta.difficulty === 'Easy'],
  ['Cards', 'A deck of cards', (g) => CARD_IDS.has(g.id)],
  ['Two', 'Works with two', (g) => g.meta.players[0] <= 2 && g.meta.players[1] >= 2],
  ['Solo', 'Playable solo', (g) => g.meta.players[0] === 1],
  ['Crowd', 'Six or more', (g) => g.meta.players[1] >= 6],
  ['Quick', 'Under 30 minutes', (g) => mins(g) <= 30],
  ['Hard', 'Big-brain games', (g) => g.meta.difficulty === 'Hard'],
]
const dark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11 < 150
}
const open = (id: string, onOpen: (id: string) => void) => ({
  href: `/g/${id}`,
  onClick: (e: React.MouseEvent) => {
    e.preventDefault()
    onOpen(id)
  },
})

/** Every game drifting past as a drawn "box lid" in its own colors. Each row is doubled so the loop is seamless. */
function Marquee({ games, onOpen }: { games: GameDef[]; onOpen: (id: string) => void }) {
  const rows = [0, 1, 2].map((r) => games.filter((_, i) => i % 3 === r))
  return (
    <div className="marquee -mx-4 space-y-2 overflow-hidden py-1 sm:-mx-6" aria-label="All games">
      {rows.map((row, r) => (
        <div key={r} className="marquee-row flex w-max gap-2" style={{ animationDuration: `${row.length * 4.2}s`, animationDirection: r % 2 ? 'reverse' : 'normal' }}>
          {[...row, ...row].map((g, i) => {
            const [a, b, c] = g.meta.swatch
            const ink = dark(a) ? '#ffffff' : '#1c1917'
            return (
              <a
                key={`${g.id}-${i}`}
                {...open(g.id, onOpen)}
                tabIndex={i < row.length ? 0 : -1}
                aria-hidden={i >= row.length}
                className="flex h-20 w-32 shrink-0 flex-col justify-end rounded-xl border border-line p-3 transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-soft"
                style={{ background: `linear-gradient(180deg, ${b ?? a} 0, ${b ?? a} 10px, ${c ?? b ?? a} 10px, ${c ?? b ?? a} 18px, ${a} 18px)`, color: ink }}
              >
                <span className="font-display text-ui font-bold leading-[1.15]">{g.meta.title.replace(/: .*/, '')}</span>
              </a>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function GameCard({ g, onOpen }: { g: GameDef; onOpen: (id: string) => void }) {
  return (
    <a {...open(g.id, onOpen)} className={cx(surface, 'block p-4 transition duration-150 ease-out hover:border-ink hover:shadow-soft')}>
      <div className="flex gap-1">
        {g.meta.swatch.map((c, i) => (
          <span key={i} className="h-3 w-3 rounded-full border border-line" style={{ background: c }} />
        ))}
      </div>
      <div className="mt-3 font-display text-body font-bold text-ink">{g.meta.title}</div>
      <div className="text-meta text-stone-500">
        {playersLabel(g.meta.players)} · {g.meta.playTime}
      </div>
    </a>
  )
}

/** The bar across the top of every page outside the step view. */
export function TopBar({ onHome, onDaily, onAdd }: { onHome: () => void; onDaily: () => void; onAdd: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <a href="/" onClick={(e) => (e.preventDefault(), onHome())} className="flex items-center gap-2 transition duration-150 ease-out active:scale-[0.98]">
            <Logo size={24} />
            <span className="font-display text-title font-bold text-ink">howty</span>
          </a>
          <nav className="flex items-center">
            <Button kind="quiet" size="sm" onClick={onDaily}>
              Daily
            </Button>
            <Button kind="quiet" size="sm" onClick={onAdd}>
              Add a game
            </Button>
          </nav>
        </div>
        {SITE.repo && (
          <a href={SITE.repo} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-2 rounded-full border border-line bg-white px-3 text-ui font-semibold text-ink transition duration-150 ease-out hover:border-ink">
            <Icon name="star" /> Star
          </a>
        )}
      </div>
    </header>
  )
}

export function Home({
  games, note, demo, demoPlayers, demoSteps, table, onDemo, onOpen, onAdd, onDaily,
}: {
  games: GameDef[]; note: string
  /** the game on the live table, and the element the 3D canvas is mounted into */
  demo: GameDef; demoPlayers: number; demoSteps: number; table: (el: HTMLElement | null) => void
  onDemo: (id: string) => void; onOpen: (id: string) => void; onAdd: () => void; onDaily: () => void
}) {
  const [q, setQ] = useState('')
  const [list, setList] = useState('All')
  const [tab, setTab] = useState<Status | 'done'>('want')
  const me = useMe()
  const byId = useMemo(() => new Map(games.map((g) => [g.id, g])), [games])
  const term = q.trim().toLowerCase()
  const pass = LISTS.find((l) => l[0] === list)![2]
  const all = useMemo(
    () => games.filter((g) => pass(g) && g.meta.title.toLowerCase().includes(term)).sort((a, b) => a.meta.title.replace(/^The /, '').localeCompare(b.meta.title.replace(/^The /, ''))),
    [games, list, term], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const pickOf = (ids: string[]) => ids.map((id) => byId.get(id)).filter((g): g is GameDef => !!g)
  const featured = pickOf(FEATURED).slice(0, 8)
  const tries = pickOf([...new Set([...TRY, 'pandemic'])])
  const mine = games.filter((g) => g.custom)
  const onShelf = (g: GameDef) => (tab === 'done' ? !!me.done[g.id] : me.shelf[g.id] === tab)
  const streak = liveStreak(me)
  const played = me.daily?.day === today()
  const hasShelf = Object.keys(me.shelf).length + Object.keys(me.done).length > 0
  const grid = 'mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      {/* One focal point: the headline and the search box. Everything below is quieter. */}
      <h1 className="mt-12 max-w-[16ch] font-display text-hero font-bold text-ink sm:mt-16">Set up any board game, step by step.</h1>
      <p className="mt-4 max-w-[44ch] text-body text-stone-600">Pick the game on your table. Each setup step plays out in 3D, then you watch a real first turn.</p>
      {note && (
        <div className="mt-4 max-w-md">
          <Note>{note}</Note>
        </div>
      )}
      <label className="mt-8 flex h-14 max-w-md items-center gap-3 rounded-full border border-line bg-white pl-6 pr-2 shadow-soft transition duration-150 ease-out focus-within:border-ink">
        <Icon name="search" size={20} className="shrink-0 text-stone-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && all[0] && onOpen(all[0].id)}
          placeholder={`Search ${games.length} games`}
          aria-label="Search games"
          className="h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-stone-400"
        />
        <Button kind="primary" onClick={() => all[0] && onOpen(all[0].id)} aria-label="Open the first match" className="w-10 !px-0">
          <Icon name="arrow" size={20} />
        </Button>
      </label>
      {!term && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-ui text-stone-500">Try</span>
          {tries.slice(0, 5).map((g) => (
            <Chip key={g.id} onClick={() => onOpen(g.id)}>
              {g.meta.title}
            </Chip>
          ))}
        </div>
      )}

      {!term && (
        <>
          {/* The live table: a real setup you can turn around, with tabs to swap the game */}
          <section className={cx(surface, 'relative mt-12 h-[44dvh] max-h-[560px] min-h-[300px] overflow-hidden shadow-soft sm:h-[52dvh]')}>
            <div ref={table} className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6">
              <div>
                <div className="font-display text-title font-bold text-ink">{demo.meta.title}</div>
                <div className="text-ui text-stone-600">
                  Set up for {demoPlayers}, {demoSteps} steps
                </div>
              </div>
              <Button kind="primary" iconRight="arrow" onClick={() => onOpen(demo.id)} className="pointer-events-auto">
                Set this up
              </Button>
            </div>
          </section>
          <div className="mt-4 flex flex-wrap justify-center gap-1">
            {tries.map((g) => (
              <button key={g.id} onClick={() => onDemo(g.id)} aria-pressed={g.id === demo.id} className={cx('h-8 rounded-full px-3 text-ui font-medium transition duration-150 ease-out active:scale-[0.98]', g.id === demo.id ? 'border border-line bg-white text-ink shadow-soft' : 'text-stone-500 hover:text-ink')}>
                {g.meta.title}
              </button>
            ))}
          </div>

          <section className="mt-16">
            <H2 className="sm:text-page">How it works</H2>
            <ol className="mt-6 grid border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-line">
              {(
                [
                  [ArtFind, 'Find your game', 'Search by the name on the box. If we do not have it, paste its setup rules and Howty builds the table for you.'],
                  [ArtFollow, 'Follow each step', 'Pieces land on the table one step at a time. Drag to look from any side, and tap a piece to see what it is.'],
                  [ArtWatch, 'Watch a first turn', 'A short walkthrough plays an opening turn, so nobody has to read the rulebook aloud.'],
                ] as const
              ).map(([Art, t, d], i) => (
                <li key={t} className="flex items-start gap-4 border-b border-line py-6 sm:block sm:border-b-0 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                  <div className="font-display text-page font-bold text-ink">{i + 1}</div>
                  <Art className="order-last h-20 w-auto shrink-0 sm:mt-4 sm:h-28" />
                  <div className="min-w-0 flex-1">
                    <div className="text-body font-semibold text-ink sm:mt-4">{t}</div>
                    <p className="mt-1 max-w-[36ch] text-ui text-stone-600">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-16">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <H2 className="sm:text-page">Popular setups</H2>
              <a href="#all" className="text-ui font-medium text-stone-600 underline decoration-line underline-offset-4 transition hover:text-ink hover:decoration-ink">
                All {games.length} games
              </a>
            </div>
            <div className={grid}>
              {featured.map((g) => (
                <GameCard key={g.id} g={g} onOpen={onOpen} />
              ))}
            </div>
          </section>

          <div className="mt-16">
            <Marquee games={games} onOpen={onOpen} />
          </div>

          <button onClick={onDaily} className={cx(surface, 'mt-16 flex w-full items-center gap-4 p-4 text-left transition duration-150 ease-out hover:border-ink hover:shadow-soft active:scale-[0.99] sm:p-6')}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-title font-bold text-white">?</span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-body font-bold text-ink sm:text-title">{played ? (me.daily!.won ? 'You named today’s game' : 'See today’s answer') : 'Name the game from its setup'}</span>
              <span className="block text-ui text-stone-500">
                Daily table #{dayNumber()}: one table, one guess{streak > 0 && `, ${streak}-day streak`}
              </span>
            </span>
            <Icon name="arrow" size={20} className="shrink-0 text-stone-400" />
          </button>

          {hasShelf && (
            <section className="mt-16">
              <H2 className="sm:text-page">Your shelf</H2>
              <div className="mt-6 max-w-xl">
                <Stats
                  items={[
                    ['On your shelf', Object.keys(me.shelf).length],
                    ['Games set up', Object.keys(me.done).length],
                    ['Steps followed', me.steps],
                  ]}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {([...(Object.keys(STATUS) as Status[]), 'done'] as const).map((t) => (
                  <Chip key={t} on={tab === t} onClick={() => setTab(t)}>
                    {t === 'done' ? 'Set up' : STATUS[t]}
                    <span className="opacity-60">{t === 'done' ? Object.keys(me.done).length : Object.values(me.shelf).filter((s) => s === t).length}</span>
                  </Chip>
                ))}
              </div>
              <div className={grid}>
                {games.filter(onShelf).map((g) => (
                  <GameCard key={g.id} g={g} onOpen={onOpen} />
                ))}
              </div>
              {!games.some(onShelf) && <p className="text-ui text-stone-500">Nothing here yet. Open a game and tag it from its page.</p>}
            </section>
          )}

          {mine.length > 0 && (
            <section className="mt-16">
              <H2 className="sm:text-page">Games you added</H2>
              <div className={grid}>
                {mine.map((g) => (
                  <GameCard key={g.id} g={g} onOpen={onOpen} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section id="all" className="mt-16 scroll-mt-20">
        <H2 className="sm:text-page">{term ? `${all.length} match${all.length === 1 ? '' : 'es'}` : list === 'All' ? `All ${games.length} games` : `${LISTS.find((l) => l[0] === list)![1]}, ${all.length} games`}</H2>
        <div className="mt-6 flex flex-wrap gap-2">
          {LISTS.map(([key, label]) => (
            <Chip key={key} on={list === key} onClick={() => setList(key)}>
              {label}
            </Chip>
          ))}
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((g) => (
            <li key={g.id} className="border-b border-line">
              <a {...open(g.id, onOpen)} className="group flex items-baseline justify-between gap-3 py-3">
                <span className="truncate text-body font-medium text-ink decoration-line underline-offset-4 group-hover:underline">{g.meta.title}</span>
                <span className="shrink-0 text-meta text-stone-500">
                  {playersLabel(g.meta.players)} · {g.meta.difficulty}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {all.length === 0 && <p className="mt-4 text-ui text-stone-600">No game matches “{q}”. You can add it yourself below.</p>}
      </section>

      <button onClick={onAdd} className="mt-8 flex w-full items-center gap-4 rounded-2xl border border-dashed border-stone-400 p-4 text-left transition duration-150 ease-out hover:border-ink hover:bg-white active:scale-[0.99] sm:p-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-paper">
          <Icon name="plus" size={20} />
        </span>
        <span>
          <span className="block font-display text-body font-bold text-ink sm:text-title">Add a game we do not have</span>
          <span className="block text-ui text-stone-500">Paste its setup rules to get a 3D table and a link you can send to friends.</span>
        </span>
      </button>

      <footer className="mt-16 grid gap-8 border-t border-line pt-8 text-meta text-stone-500 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="font-display text-body font-bold text-ink">howty</span>
          </div>
          <p className="mt-3 max-w-[52ch] text-ui text-stone-600">Board-game setup you can turn around and follow with the box open. Free and open source, with no account and no tracking: your shelf and streak stay in this browser.</p>
          {SITE.repo && (
            <p className="mt-3 text-ui">
              <a href={SITE.repo} target="_blank" rel="noreferrer" className="text-stone-700 underline underline-offset-4 hover:text-ink">
                Source code
              </a>
              {' · '}
              <a href={`${SITE.repo}/issues/new/choose`} target="_blank" rel="noreferrer" className="text-stone-700 underline underline-offset-4 hover:text-ink">
                Report a rules error
              </a>
            </p>
          )}
        </div>
        <p className="max-w-[60ch]">{DISCLAIMER}</p>
      </footer>
    </div>
  )
}
