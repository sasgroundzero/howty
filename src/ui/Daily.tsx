/** The daily table: a finished setup with the name hidden. One guess, a streak, and a result to share. */
import { useState } from 'react'
import type { GameDef } from '../engine/types'
import { Icon } from './icons'
import { Button, Eyebrow, Stats, cx } from './kit'
import { answerDaily, liveStreak, useMe } from './me'

export function Daily({ puzzle, onOpen, onHome }: { puzzle: { answer: GameDef; choices: GameDef[]; day: string; number: number }; onOpen: (id: string) => void; onHome: () => void }) {
  const me = useMe()
  const [copied, setCopied] = useState(false)
  const result = me.daily?.day === puzzle.day ? me.daily : null
  const streak = liveStreak(me)
  const share = async () => {
    const text = `Howty daily table #${puzzle.number} ${result?.won ? '🟩 named it' : '🟥 missed it'}${streak > 1 ? ` · streak ${streak}` : ''}\nCan you name the game from its setup? ${window.location.origin}/daily`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.prompt('Copy your result', text)
    }
  }
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col px-6 pb-8 pt-6 sm:px-8">
      <Button kind="quiet" size="sm" icon="back" onClick={onHome} className="-ml-3 self-start">
        All games
      </Button>
      <div className="mt-8">
        <Eyebrow>Daily table #{puzzle.number}</Eyebrow>
        <h1 className="mt-1 font-display text-hero font-bold text-ink">{result ? (result.won ? 'You named it.' : 'Not this time.') : 'Which game is this?'}</h1>
        <p className="mt-3 max-w-[46ch] text-body text-stone-600">
          {result ? `Today’s table was ${puzzle.answer.meta.title}. A new one appears at midnight.` : 'This table is set up and ready to play. Drag it to look around, then pick the game. You get one guess.'}
        </p>
      </div>

      <div className="mt-8 grid gap-2">
        {puzzle.choices.map((g) => {
          const right = g.id === puzzle.answer.id
          const picked = result?.pick === g.id
          return (
            <button
              key={g.id}
              disabled={!!result}
              onClick={() => answerDaily(puzzle.day, g.id, right)}
              className={cx(
                'flex h-14 items-center justify-between rounded-xl border px-4 text-left text-body font-semibold transition duration-150 ease-out',
                !result && 'border-line bg-white text-ink hover:border-ink active:scale-[0.99]',
                result && right && 'border-ink bg-white text-ink',
                result && picked && !right && 'border-line bg-white text-stone-500 line-through',
                result && !right && !picked && 'border-transparent text-stone-400',
              )}
            >
              {g.meta.title}
              {result && right && <Icon name="check" size={20} className="text-accent" />}
            </button>
          )
        })}
      </div>

      {me.played > 0 && (
        <div className="mt-8">
          <Stats
            items={[
              ['Streak', streak],
              ['Best', me.best],
              ['Played', me.played],
              ['Named', `${Math.round((me.wins / me.played) * 100)}%`],
            ]}
          />
        </div>
      )}

      {result && (
        <div className="mt-auto pt-12">
          <Button kind="primary" size="lg" iconRight={copied ? 'check' : 'link'} onClick={() => void share()} className="w-full justify-between shadow-soft">
            {copied ? 'Copied' : 'Share your result'}
          </Button>
          <div className="-mx-3 mt-2">
            <Button kind="quiet" size="sm" iconRight="arrow" onClick={() => onOpen(puzzle.answer.id)}>
              Learn to set up {puzzle.answer.meta.title}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
