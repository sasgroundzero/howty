/** The home page. Its one job is to get you to your game, so the search box is the loudest thing on it. */
import { useMemo, useState } from 'react'
import type { GameDef } from '../engine/types'
import { DISCLAIMER, FEATURED, SITE, TRY } from '../site'
import { Icon, Logo } from './icons'
import { Button, Chip, H2, Note, Stats, cx, surface } from './kit'
import { STATUS, dayNumber, liveStreak, today, useMe, type Status } from './me'

export const playersLabel = ([a, b]: [number, number]) => (a === b ? `${a} player${a > 1 ? 's' : ''}` : `${a}–${b} players`)
const mins = (g: GameDef) => Math.max(...(g.meta.playTime.match(/\d+/g) ?? ['999']).map(Number))
/** Lists are plain filters over each game's own facts, so they never go stale. */
const LISTS: [string, string, (g: GameDef) => boolean][] = [
  ['All', 'Everything', () => true],
  ['Easy', 'Easy to learn', (g) => g.meta.difficulty === 'Easy'],
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
    <div className="marquee -mx-6 space-y-2 overflow-hidden py-1 sm:-mx-8" aria-label="All games">
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
                style={{ background: `linear-gradient(35deg, ${a} 0%, ${a} 66%, ${b ?? a} 66%, ${b ?? a} 83%, ${c ?? b ?? a} 83%)`, color: ink }}
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

export function Home({ games, note, onOpen, onAdd, onDaily }: { games: GameDef[]; note: string; onOpen: (id: string) => void; onAdd: () => void; onDaily: () => void }) {
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
  const featured = FEATURED.slice(0, 6).map((id) => byId.get(id)).filter((g): g is GameDef => !!g)
  const mine = games.filter((g) => g.custom)
  const onShelf = (g: GameDef) => (tab === 'done' ? !!me.done[g.id] : me.shelf[g.id] === tab)
  const streak = liveStreak(me)
  const played = me.daily?.day === today()
  const hasShelf = Object.keys(me.shelf).length + Object.keys(me.done).length > 0

  return (
    <div className="mx-auto max-w-2xl px-6 pb-12 pt-6 sm:px-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-display text-title font-bold">howty</span>
        </div>
        <nav className="flex items-center">
          <Button kind="quiet" size="sm" onClick={onDaily}>
            Daily
          </Button>
          <Button kind="quiet" size="sm" onClick={onAdd}>
            Add your own
          </Button>
          {SITE.repo && (
            <a href={SITE.repo} target="_blank" rel="noreferrer" className="ml-2 inline-flex h-8 items-center gap-2 rounded-full border border-line bg-white px-3 text-ui font-semibold text-ink transition duration-150 ease-out hover:border-ink">
              <Icon name="star" /> Star
            </a>
          )}
        </nav>
      </header>

      {/* One focal point: the headline and the search box. Everything below is quieter. */}
      <h1 className="mt-12 max-w-[14ch] font-display text-hero font-bold text-ink sm:mt-16">Set up any board game, step by step.</h1>
      <p className="mt-4 max-w-[46ch] text-body text-stone-600">Pick the game on your table. Each setup step plays out in 3D, then you watch a real first turn.</p>
      {note && (
        <div className="mt-4">
          <Note>{note}</Note>
        </div>
      )}
      <label className="mt-8 flex h-14 items-center gap-3 rounded-full border border-line bg-white pl-6 pr-2 shadow-soft transition duration-150 ease-out focus-within:border-ink">
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
        <p className="mt-3 text-ui text-stone-500">
          Try{' '}
          {TRY.map((id) => byId.get(id)).map(
            (g, i) =>
              g && (
                <span key={g.id}>
                  {i > 0 && ', '}
                  <a {...open(g.id, onOpen)} className="font-medium text-stone-700 underline decoration-line underline-offset-4 transition hover:text-ink hover:decoration-ink">
                    {g.meta.title}
                  </a>
                </span>
              ),
          )}
        </p>
      )}

      {!term && (
        <>
          <div className="mt-12">
            <Marquee games={games} onOpen={onOpen} />
          </div>

          <button onClick={onDaily} className={cx(surface, 'mt-12 flex w-full items-center gap-4 p-4 text-left transition duration-150 ease-out hover:border-ink hover:shadow-soft active:scale-[0.99]')}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-title font-bold text-white">?</span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-body font-bold text-ink">{played ? (me.daily!.won ? 'You named today’s game' : 'See today’s answer') : 'Name the game from its setup'}</span>
              <span className="block text-ui text-stone-500">
                Daily table #{dayNumber()}
                {streak > 0 && ` · ${streak}-day streak`}
              </span>
            </span>
            <Icon name="arrow" size={20} className="shrink-0 text-stone-400" />
          </button>

          {hasShelf && (
            <section className="mt-12">
              <H2>Your shelf</H2>
              <div className="mt-4">
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
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {games.filter(onShelf).map((g) => (
                  <GameCard key={g.id} g={g} onOpen={onOpen} />
                ))}
              </div>
              {!games.some(onShelf) && <p className="text-ui text-stone-500">Nothing here yet. Open a game and tag it from its page.</p>}
            </section>
          )}

          {mine.length > 0 && (
            <section className="mt-12">
              <H2>Games you added</H2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {mine.map((g) => (
                  <GameCard key={g.id} g={g} onOpen={onOpen} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-12">
            <H2>Popular setups</H2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {featured.map((g) => (
                <GameCard key={g.id} g={g} onOpen={onOpen} />
              ))}
            </div>
          </section>
        </>
      )}

      <section id="all" className="mt-12">
        <H2>{term ? `${all.length} match${all.length === 1 ? '' : 'es'}` : list === 'All' ? `All ${games.length} games` : `${LISTS.find((l) => l[0] === list)![1]}, ${all.length} games`}</H2>
        <div className="mt-4 flex flex-wrap gap-2">
          {LISTS.map(([key, label]) => (
            <Chip key={key} on={list === key} onClick={() => setList(key)}>
              {label}
            </Chip>
          ))}
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
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

      <button onClick={onAdd} className="mt-8 flex w-full items-center gap-4 rounded-2xl border border-dashed border-stone-400 p-4 text-left transition duration-150 ease-out hover:border-ink hover:bg-white active:scale-[0.99]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-paper">
          <Icon name="plus" size={20} />
        </span>
        <span>
          <span className="block font-display text-body font-bold text-ink">Add a game we do not have</span>
          <span className="block text-ui text-stone-500">Paste its setup rules to get a 3D table and a link you can send to friends.</span>
        </span>
      </button>

      <footer className="mt-16 border-t border-line pt-6 text-meta text-stone-500">
        <p className="max-w-[70ch]">{DISCLAIMER}</p>
        <p className="mt-3">
          Free and open source. No account and no tracking: your shelf and streak stay in this browser.
          {SITE.repo && (
            <>
              {' '}
              <a href={SITE.repo} target="_blank" rel="noreferrer" className="text-stone-700 underline underline-offset-4 hover:text-ink">
                Source code
              </a>
              {' · '}
              <a href={`${SITE.repo}/issues/new/choose`} target="_blank" rel="noreferrer" className="text-stone-700 underline underline-offset-4 hover:text-ink">
                Report a rules error
              </a>
            </>
          )}
        </p>
      </footer>
    </div>
  )
}
