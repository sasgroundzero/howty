/** The daily table: a finished setup with the name hidden. One guess, a streak, and a result to share. */
import { useState } from 'react'
import type { GameDef } from '../engine/types'
import { Icon } from './icons'
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
    <div className="mx-auto flex min-h-full max-w-2xl flex-col px-5 pb-6 pt-4 sm:px-8 sm:pt-6">
      <button onClick={onHome} className="flex items-center gap-1.5 self-start rounded-full px-2 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-900/5">
        <Icon name="back" size={16} /> All games
      </button>
      <div className="mt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-amber-700">Daily table #{puzzle.number}</div>
      <h1 className="mt-1 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">{result ? (result.won ? 'You named it.' : 'Not this time.') : 'Which game is this?'}</h1>
      <p className="mt-3 text-base text-stone-600 sm:text-lg">
        {result ? `Today’s table was ${puzzle.answer.meta.title}.` : 'This table is set up and ready to play. Drag it to look around, then pick the game. You get one guess, and there is a new table every day.'}
      </p>

      <div className="mt-6 grid gap-2.5">
        {puzzle.choices.map((g) => {
          const right = g.id === puzzle.answer.id
          const picked = result?.pick === g.id
          const tone = !result ? 'border-stone-300 bg-white hover:border-stone-900' : right ? 'border-green-700 bg-green-50' : picked ? 'border-red-700 bg-red-50' : 'border-stone-200 bg-white/60 text-stone-400'
          return (
            <button key={g.id} disabled={!!result} onClick={() => answerDaily(puzzle.day, g.id, right)} className={`flex h-14 items-center justify-between rounded-2xl border-2 px-5 text-left font-display text-lg font-bold transition ${tone}`}>
              {g.meta.title}
              {result && right && <span className="text-sm font-semibold text-green-800">Correct</span>}
              {result && picked && !right && <span className="text-sm font-semibold text-red-800">Your guess</span>}
            </button>
          )
        })}
      </div>

      <dl className="mt-6 grid grid-cols-4 gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-center">
        {[
          ['Streak', streak],
          ['Best', me.best],
          ['Played', me.played],
          ['Named', me.played ? `${Math.round((me.wins / me.played) * 100)}%` : '0%'],
        ].map(([k, v]) => (
          <div key={k}>
            <dd className="font-display text-2xl font-bold">{v}</dd>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">{k}</dt>
          </div>
        ))}
      </dl>

      {result && (
        <div className="mt-auto pt-8">
          <button onClick={() => void share()} className="flex h-14 w-full items-center justify-between rounded-full bg-stone-900 pl-7 pr-5 text-lg font-semibold text-white shadow-lg transition hover:bg-stone-700">
            {copied ? 'Copied to clipboard' : 'Share your result'} <Icon name="link" size={22} />
          </button>
          <button onClick={() => onOpen(puzzle.answer.id)} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-stone-900">
            Learn to set up {puzzle.answer.meta.title} <Icon name="arrow" size={15} />
          </button>
          <p className="mt-4 text-[12px] text-stone-500">A new table appears at midnight, your time. Streaks are kept in this browser only.</p>
        </div>
      )}
    </div>
  )
}
