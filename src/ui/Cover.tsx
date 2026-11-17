/** A game's cover page. Its one job is the "Start setup" button. */
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { VERIFIED } from '../data/games/verified'
import type { GameDef, GameSetup } from '../engine/types'
import { SITE } from '../site'
import { playersLabel } from './Home'
import { Icon } from './icons'
import { Button, Chip, Eyebrow, H2, Note, cx } from './kit'
import { STATUS, update, useMe, type Status } from './me'

/** A segmented control: the buttons inside use the next radius down from their container. */
export function PlayerPicker({ range, value, onChange }: { range: [number, number]; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex rounded-xl border border-line bg-white p-1">
      {Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i).map((n) => (
        <button key={n} onClick={() => onChange(n)} aria-pressed={value === n} aria-label={`${n} ${n === 1 ? 'player' : 'players'}`} className={cx('h-8 w-8 rounded-lg text-ui font-semibold transition duration-150 ease-out', value === n ? 'bg-ink text-paper' : 'text-stone-600 hover:bg-ink/5')}>
          {n}
        </button>
      ))}
    </div>
  )
}

export function Cover({
  def, game, players, note, onPlayers, onStart, onTeach, onWatch, onHome, onShare, onRemove,
}: {
  def: GameDef; game: GameSetup; players: number; note: string
  onPlayers: (n: number) => void; onStart: () => void; onTeach: () => void; onWatch: () => void; onHome: () => void; onShare: () => void; onRemove: () => void
}) {
  const check = VERIFIED[def.id]
  // on a phone the start button sits below the fold; show a pinned copy until the real one scrolls into view
  const startRef = useRef<HTMLDivElement>(null)
  const [startHidden, setStartHidden] = useState(false)
  useEffect(() => {
    const el = startRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setStartHidden(!e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const issue = (template: string, title: string) => `${SITE.repo}/issues/new?template=${template}&title=${encodeURIComponent(title)}`
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

      <details className="group mt-8 border-t border-line pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-ui font-medium text-ink">
          Setup checklist, {setup.length} steps
          <span className="text-stone-500 transition group-open:rotate-90">
            <Icon name="arrow" />
          </span>
        </summary>
        <ol className="mt-4 space-y-3">
          {setup.map((st, i) => (
            <li key={i} className="flex gap-3 text-ui text-stone-600">
              <span className="w-4 shrink-0 text-right text-stone-400">{i + 1}</span>
              <span>
                <span className="font-medium text-ink">{st.title}.</span> {st.instruction}
              </span>
            </li>
          ))}
        </ol>
        <Button kind="quiet" size="sm" icon="print" onClick={() => window.print()} className="-ml-3 mt-2">
          Print checklist
        </Button>
      </details>
      {createPortal(<PrintSheet def={def} game={game} players={players} />, document.body)}

      <div className="mt-auto pt-12">
        <div ref={startRef}>
          <Button kind="primary" size="lg" iconRight="arrow" onClick={onStart} className="w-full justify-between shadow-soft">
            Start setup
          </Button>
        </div>
        {startHidden && createPortal(
          <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-white via-white/90 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 lg:hidden">
            <Button kind="primary" size="lg" iconRight="arrow" onClick={onStart} className="w-full justify-between shadow-soft">
              Start setup
            </Button>
          </div>,
          document.body,
        )}
        <div className="-mx-3 mt-2 flex flex-wrap items-center">
          <Button kind="quiet" size="sm" icon="teach" onClick={onTeach} title="Plays every step by itself and reads it aloud, then the first turn">
            Teach it hands-free
          </Button>
          <Button kind="quiet" size="sm" icon="play" onClick={onWatch}>
            First turn
          </Button>
          <Button kind="quiet" size="sm" icon="share" onClick={onShare}>
            Share
          </Button>
          {def.custom && (
            <Button kind="quiet" size="sm" icon="x" onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
        {!def.custom && (
          <p className="mt-4 flex items-start gap-2 text-meta text-stone-600">
            {check ? (
              <>
                <span className="mt-px text-accent">
                  <Icon name="check" />
                </span>
                <span>
                  Checked against the published rules ({check.edition}){check.by && ` by ${check.by}`}.
                </span>
              </>
            ) : (
              <span>
                Not yet checked against a printed rulebook.{' '}
                {SITE.repo && (
                  <a href={issue('verify.md', `[Verify] ${def.meta.title}`)} target="_blank" rel="noreferrer" className="text-stone-700 underline underline-offset-4 hover:text-ink">
                    Have the box? Help check it
                  </a>
                )}
              </span>
            )}
          </p>
        )}
        <p className="mt-2 text-meta text-stone-500">
          Unofficial fan-made guide, not affiliated with the publisher. Editions differ, so keep your rulebook handy.
          {SITE.repo && !def.custom && (
            <>
              {' '}
              <a href={issue('rules-error.md', `[Rules] ${def.meta.title}: `)} target="_blank" rel="noreferrer" className="text-stone-700 underline underline-offset-4 hover:text-ink">
                Report a rules error
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

/** A plain one-page checklist, only visible when printing (see the print rules in index.css). */
function PrintSheet({ def, game, players }: { def: GameDef; game: GameSetup; players: number }) {
  const setup = game.steps.slice(0, game.setupCount)
  const turn = game.steps.slice(game.setupCount)
  const row = (st: GameSetup['steps'][number], i: number) => (
    <li key={i}>
      <b>{st.title}.</b> {st.instruction} {st.detail && <i>{st.detail}</i>}
    </li>
  )
  return (
    <div className="print-sheet">
      <h1>{def.meta.title}: setup checklist</h1>
      <p>
        {players} {players === 1 ? 'player' : 'players'} · {def.meta.playTime} · from {window.location.host}/g/{def.id}
      </p>
      <ol>{setup.map(row)}</ol>
      {turn.length > 0 && (
        <>
          <h2>First turn</h2>
          <ol>{turn.map(row)}</ol>
        </>
      )}
      <p className="print-foot">Unofficial fan-made guide. Check your rulebook.</p>
    </div>
  )
}
