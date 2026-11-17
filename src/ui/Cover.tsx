/** A game's cover page: what it is, what you need, and one button to start. */
import type { GameDef, GameSetup } from '../engine/types'
import { SITE } from '../site'
import { Icon } from './icons'
import { playersLabel } from './Home'
import { STATUS, update, useMe, type Status } from './me'

export function PlayerPicker({ range, value, onChange }: { range: [number, number]; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex rounded-lg border border-stone-300 bg-white p-0.5">
      {Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i).map((n) => (
        <button key={n} onClick={() => onChange(n)} aria-pressed={value === n} aria-label={`${n} players`} className={`h-7 w-8 rounded-md text-sm font-bold transition ${value === n ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
          {n}
        </button>
      ))}
    </div>
  )
}

export function Cover({
  def, game, players, note, copied, onPlayers, onStart, onWatch, onHome, onShare, onRemove,
}: {
  def: GameDef; game: GameSetup; players: number; note: string; copied: boolean
  onPlayers: (n: number) => void; onStart: () => void; onWatch: () => void; onHome: () => void; onShare: () => void; onRemove: () => void
}) {
  const setup = game.steps.slice(0, game.setupCount)
  const needs = [...new Set(setup.flatMap((s) => s.needs ?? []))].slice(0, 14)
  const range = def.meta.players
  const me = useMe()
  const status = me.shelf[def.id]
  const setStatus = (s: Status) =>
    update((m) => {
      const shelf = { ...m.shelf }
      if (shelf[def.id] === s) delete shelf[def.id]
      else shelf[def.id] = s
      return { ...m, shelf }
    })
  const fact = (k: string, v: string) => (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">{k}</dt>
      <dd className="font-display text-xl font-bold">{v}</dd>
    </div>
  )
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col px-5 pb-6 pt-4 sm:px-8 sm:pt-6">
      <button onClick={onHome} className="flex items-center gap-1.5 self-start rounded-full px-2 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-900/5">
        <Icon name="back" size={16} /> All games
      </button>
      {note && (
        <p role="status" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-stone-800">
          {note}
        </p>
      )}
      <div className="mt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-amber-700">{def.custom ? 'Your custom game' : 'Setup guide'}</div>
      <h1 className="mt-1 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">{def.meta.title}</h1>
      <p className="mt-3 text-base text-stone-600 sm:text-lg">{def.meta.blurb}</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl sm:grid-cols-4 border border-stone-200 bg-white p-4">
        {fact('Players', playersLabel(range).replace(' players', '').replace(' player', ''))}
        {fact('Time', def.meta.playTime.replace(' min', 'm'))}
        {fact('Level', def.meta.difficulty)}
        {fact('Steps', String(setup.length))}
      </dl>

      {range[0] !== range[1] && (
        <div className="mt-5 flex items-center gap-3">
          <span className="text-sm font-semibold text-stone-700">How many are playing?</span>
          <PlayerPicker range={range} value={players} onChange={onPlayers} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-stone-700">Your shelf</span>
        {(Object.keys(STATUS) as Status[]).map((s) => (
          <button key={s} onClick={() => setStatus(s)} aria-pressed={status === s} className={`rounded-full border px-3 py-1 text-[13px] font-semibold transition ${status === s ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-900'}`}>
            {status === s ? '✓ ' : ''}
            {STATUS[s]}
          </button>
        ))}
        {!!me.done[def.id] && <span className="text-[12px] font-medium text-green-800">Set up {me.done[def.id]} time{me.done[def.id] > 1 ? 's' : ''}</span>}
      </div>

      <h2 className="mt-7 font-display text-xl font-bold">Before you start</h2>
      <ul className="mt-2 space-y-1.5 text-[15px] text-stone-700">
        <li>Clear the table and open the box: {setup.length} setup steps, then a short first-turn walkthrough.</li>
        <li>Drag the table to look around, and tap any piece to see what it is.</li>
        <li>Keep your rulebook handy. This guide is unofficial and editions differ.</li>
      </ul>
      {needs.length > 0 && (
        <>
          <h2 className="mt-6 font-display text-xl font-bold">On the table</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {needs.map((n) => (
              <span key={n} className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-[12px] font-medium text-stone-700">
                {n}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="mt-auto pt-8">
        <button onClick={onStart} className="flex h-14 w-full items-center justify-between rounded-full bg-stone-900 pl-7 pr-5 text-lg font-semibold text-white shadow-lg transition hover:bg-stone-700">
          Start setup <Icon name="arrow" size={22} />
        </button>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-stone-600">
          <button onClick={onWatch} className="flex items-center gap-1.5 hover:text-stone-900">
            <Icon name="play" size={14} /> Skip to the first turn
          </button>
          <button onClick={onShare} className="flex items-center gap-1.5 hover:text-stone-900">
            <Icon name="link" size={15} /> {copied ? 'Link copied' : 'Copy link'}
          </button>
          {def.custom && (
            <button onClick={onRemove} className="text-red-700 hover:text-red-900">
              Remove game
            </button>
          )}
          {SITE.repo && !def.custom && (
            <a href={`${SITE.repo}/issues/new/choose`} target="_blank" rel="noreferrer" className="hover:text-stone-900">
              Report a rules error
            </a>
          )}
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-stone-500">Unofficial fan-made guide. Not affiliated with the game’s publisher. Check each step against the rulebook in your box.</p>
      </div>
    </div>
  )
}
