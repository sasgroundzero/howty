/** A game's cover page. Its one job is the "Start setup" button. */
import type { GameDef, GameSetup } from '../engine/types'
import { SITE } from '../site'
import { playersLabel } from './Home'
import { Button, Chip, Eyebrow, H2, Note, cx } from './kit'
import { STATUS, update, useMe, type Status } from './me'

/** A segmented control: the buttons inside use the next radius down from their container. */
export function PlayerPicker({ range, value, onChange }: { range: [number, number]; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex rounded-xl border border-line bg-white p-1">
      {Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i).map((n) => (
        <button key={n} onClick={() => onChange(n)} aria-pressed={value === n} aria-label={`${n} players`} className={cx('h-8 w-8 rounded-lg text-ui font-semibold transition duration-150 ease-out', value === n ? 'bg-ink text-paper' : 'text-stone-600 hover:bg-ink/5')}>
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
  const needs = [...new Set(setup.flatMap((s) => s.needs ?? []))].slice(0, 12)
  const range = def.meta.players
  const me = useMe()
  const status = me.shelf[def.id]
  const times = me.done[def.id] ?? 0
  const setStatus = (s: Status) =>
    update((m) => {
      const shelf = { ...m.shelf }
      if (shelf[def.id] === s) delete shelf[def.id]
      else shelf[def.id] = s
      return { ...m, shelf }
    })
  return (
    <div className="flex min-h-full flex-col">
      <Button kind="quiet" size="sm" icon="back" onClick={onHome} className="-ml-3 self-start">
        All games
      </Button>
      {note && (
        <div className="mt-4">
          <Note>{note}</Note>
        </div>
      )}
      <div className="mt-6">
        <Eyebrow>{def.custom ? 'Your game' : 'Setup guide'}</Eyebrow>
        <h1 className="mt-1 font-display text-page font-bold text-ink sm:text-[40px] sm:leading-[1.05]">{def.meta.title}</h1>
        <p className="mt-3 text-body text-stone-600">{def.meta.blurb}</p>
        <p className="mt-2 text-ui text-stone-500">
          {playersLabel(range)} · {def.meta.playTime} · {def.meta.difficulty} · {setup.length} setup steps
          {times > 0 && ` · you have set it up ${times === 1 ? 'once' : `${times} times`}`}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {range[0] !== range[1] && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-ui font-medium text-ink">Players</span>
            <PlayerPicker range={range} value={players} onChange={onPlayers} />
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="shrink-0 text-ui font-medium text-ink">Your shelf</span>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {(Object.keys(STATUS) as Status[]).map((s) => (
              <Chip key={s} on={status === s} onClick={() => setStatus(s)}>
                {STATUS[s]}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {needs.length > 0 && (
        <div className="mt-8">
          <H2>On the table</H2>
          <p className="mt-2 max-w-[60ch] text-ui text-stone-600">{needs.join(' · ')}</p>
        </div>
      )}

      <div className="mt-auto pt-12">
        <Button kind="primary" size="lg" iconRight="arrow" onClick={onStart} className="w-full justify-between shadow-soft">
          Start setup
        </Button>
        <div className="-mx-3 mt-2 flex flex-wrap items-center">
          <Button kind="quiet" size="sm" icon="play" onClick={onWatch}>
            Skip to the first turn
          </Button>
          <Button kind="quiet" size="sm" icon={copied ? 'check' : 'link'} onClick={onShare}>
            {copied ? 'Link copied' : 'Copy link'}
          </Button>
          {def.custom && (
            <Button kind="quiet" size="sm" icon="x" onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
        <p className="mt-4 text-meta text-stone-500">
          Unofficial fan-made guide, not affiliated with the publisher. Editions differ, so keep your rulebook handy.
          {SITE.repo && !def.custom && (
            <>
              {' '}
              <a href={`${SITE.repo}/issues/new/choose`} target="_blank" rel="noreferrer" className="text-stone-700 underline underline-offset-4 hover:text-ink">
                Report a rules error
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
