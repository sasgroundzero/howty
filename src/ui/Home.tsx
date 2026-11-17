/** The landing page: one-line pitch, search, a featured handful, then the whole library. */
import { useMemo, useState } from 'react'
import type { GameDef } from '../engine/types'
import { DISCLAIMER, FEATURED, SITE, TRY } from '../site'
import { Icon, Logo } from './icons'

export const playersLabel = ([a, b]: [number, number]) => (a === b ? `${a} player${a > 1 ? 's' : ''}` : `${a}–${b} players`)
const LEVELS = ['All', 'Easy', 'Medium', 'Hard'] as const

function GameCard({ g, onOpen }: { g: GameDef; onOpen: (id: string) => void }) {
  return (
    <a
      href={`/g/${g.id}`}
      onClick={(e) => {
        e.preventDefault()
        onOpen(g.id)
      }}
      className="group rounded-2xl border border-stone-200 bg-white p-3.5 transition hover:border-stone-900 hover:shadow-md"
    >
      <div className="flex gap-1.5">
        {g.meta.swatch.map((c, i) => (
          <span key={i} className="h-3.5 w-3.5 rounded-[5px] border border-stone-900/15" style={{ background: c }} />
        ))}
      </div>
      <div className="mt-2 font-display text-[17px] font-bold leading-tight text-stone-900">{g.meta.title}</div>
      <div className="mt-0.5 text-[12px] font-medium text-stone-500">
        {playersLabel(g.meta.players)} · {g.meta.playTime}
      </div>
      <div className="mt-1.5 text-[13px] leading-snug text-stone-600">{g.meta.blurb}</div>
    </a>
  )
}

export function Home({ games, note, onOpen, onAdd }: { games: GameDef[]; note: string; onOpen: (id: string) => void; onAdd: () => void }) {
  const [q, setQ] = useState('')
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('All')
  const byId = useMemo(() => new Map(games.map((g) => [g.id, g])), [games])
  const term = q.trim().toLowerCase()
  const all = useMemo(
    () => games.filter((g) => (level === 'All' || g.meta.difficulty === level) && g.meta.title.toLowerCase().includes(term)).sort((a, b) => a.meta.title.replace(/^The /, '').localeCompare(b.meta.title.replace(/^The /, ''))),
    [games, level, term],
  )
  const featured = FEATURED.map((id) => byId.get(id)).filter((g): g is GameDef => !!g)
  const mine = games.filter((g) => g.custom)
  const chip = 'rounded-full border px-3 py-1 text-[13px] font-semibold transition'

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-4 sm:px-8 sm:pt-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-2xl font-bold tracking-tight">howty</span>
        </div>
        <nav className="flex items-center gap-1 text-sm font-semibold text-stone-600">
          <a href="#all" className="rounded-full px-3 py-1.5 hover:bg-stone-900/5">
            Browse
          </a>
          <button onClick={onAdd} className="rounded-full px-3 py-1.5 hover:bg-stone-900/5">
            Add your own
          </button>
          {SITE.repo && (
            <a href={SITE.repo} target="_blank" rel="noreferrer" className="ml-1 flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-stone-900 hover:border-stone-900">
              <Icon name="star" size={15} /> Star
            </a>
          )}
        </nav>
      </header>

      <h1 className="mt-8 font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-stone-900 sm:mt-12 sm:text-6xl">
        Set up any board game, <span className="text-amber-600">step by step.</span>
      </h1>
      <p className="mt-4 max-w-lg text-base leading-relaxed text-stone-600 sm:text-lg">
        Pick the game on your table. Every setup step plays in 3D, then you watch a real first turn. Free, no account, {games.length} games.
      </p>
      {note && (
        <p role="status" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-stone-800">
          {note}
        </p>
      )}

      <label className="mt-6 flex h-14 items-center gap-3 rounded-full border border-stone-300 bg-white pl-5 pr-2 shadow-sm focus-within:border-stone-900">
        <Icon name="search" className="shrink-0 text-stone-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && all[0] && onOpen(all[0].id)}
          placeholder="Try Catan, Wingspan, Chess…"
          aria-label="Search games"
          className="h-full min-w-0 flex-1 bg-transparent text-lg text-stone-900 outline-none placeholder:text-stone-400"
        />
        <button onClick={() => all[0] && onOpen(all[0].id)} aria-label="Open the first match" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition hover:bg-stone-700">
          <Icon name="arrow" />
        </button>
      </label>
      {!term && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-stone-500">Try</span>
          {TRY.map((id) => byId.get(id)).map(
            (g) =>
              g && (
                <button key={g.id} onClick={() => onOpen(g.id)} className={`${chip} border-stone-300 bg-white text-stone-800 hover:border-stone-900`}>
                  {g.meta.title}
                </button>
              ),
          )}
        </div>
      )}

      {!term && (
        <>
          <h2 className="mt-12 font-display text-2xl font-bold">How it works</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ['Pick your game', 'Search by name, or paste the setup rules of a game we do not have yet.'],
              ['Follow each step', 'Pieces land on a 3D table one step at a time. Drag to look around, tap any piece to see what it is.'],
              ['Watch a first turn', 'A short walkthrough shows what a real opening turn looks like, so nobody has to read aloud.'],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">{i + 1}</div>
                <div className="mt-3 font-display text-lg font-bold leading-tight">{t}</div>
                <p className="mt-1 text-[13px] leading-snug text-stone-600">{d}</p>
              </li>
            ))}
          </ol>

          {mine.length > 0 && (
            <>
              <h2 className="mt-12 font-display text-2xl font-bold">Your games</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {mine.map((g) => (
                  <GameCard key={g.id} g={g} onOpen={onOpen} />
                ))}
              </div>
            </>
          )}

          <h2 className="mt-12 font-display text-2xl font-bold">Popular setups</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {featured.map((g) => (
              <GameCard key={g.id} g={g} onOpen={onOpen} />
            ))}
          </div>
        </>
      )}

      <div id="all" className="mt-12 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">{term ? `${all.length} match${all.length === 1 ? '' : 'es'}` : `All ${games.length} games`}</h2>
        <div className="flex gap-1.5">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)} aria-pressed={level === l} className={`${chip} ${level === l ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-900'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        {all.map((g) => (
          <li key={g.id} className="border-b border-stone-200">
            <a
              href={`/g/${g.id}`}
              onClick={(e) => {
                e.preventDefault()
                onOpen(g.id)
              }}
              className="flex items-baseline justify-between gap-3 py-2.5 hover:text-amber-700"
            >
              <span className="truncate font-semibold">{g.meta.title}</span>
              <span className="shrink-0 text-[12px] text-stone-500">
                {playersLabel(g.meta.players)} · {g.meta.difficulty}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {all.length === 0 && <p className="mt-3 text-sm text-stone-600">No game matches “{q}”. You can add it yourself below.</p>}

      <button onClick={onAdd} className="mt-8 flex w-full items-center gap-4 rounded-2xl border border-dashed border-stone-400 p-4 text-left transition hover:border-stone-900 hover:bg-white">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white">
          <Icon name="plus" />
        </span>
        <span>
          <span className="block font-display text-lg font-bold">Add your own game</span>
          <span className="block text-[13px] text-stone-600">Paste the setup rules and get a 3D table you can share with a link. It stays in your browser.</span>
        </span>
      </button>

      <footer className="mt-12 border-t border-stone-300 pt-6 text-[12px] leading-relaxed text-stone-500">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] font-semibold text-stone-700">
          <span>Free and open source</span>
          <span>No account, no tracking</span>
          {SITE.repo && (
            <a href={SITE.repo} target="_blank" rel="noreferrer" className="underline hover:text-amber-700">
              Source code
            </a>
          )}
          {SITE.repo && (
            <a href={`${SITE.repo}/issues/new/choose`} target="_blank" rel="noreferrer" className="underline hover:text-amber-700">
              Report a rules error
            </a>
          )}
        </div>
        <p className="mt-3">{DISCLAIMER}</p>
      </footer>
    </div>
  )
}
