/** The daily table: a finished setup with the name hidden. One guess, a streak, and a result to share. */
import { useState } from 'react'
import type { GameInfo } from '../engine/types'
import { Icon } from './icons'
import { Button, Eyebrow, Stats, cx } from './kit'
import { answerDaily, liveStreak, useMe } from './me'
import { shareLink } from './share'

export function Daily({ puzzle, onOpen, onHome }: { puzzle: { answer: GameInfo; choices: GameInfo[]; day: string; number: number }; onOpen: (id: string) => void; onHome: () => void }) {
  const me = useMe()
  const [copied, setCopied] = useState(false)
  const result = me.daily?.day === puzzle.day ? me.daily : null
  const streak = liveStreak(me)
  const share = async () => {
    const text = `Howty daily table #${puzzle.number} ${result?.won ? '🟩 named it' : '🟥 missed it'}${streak > 1 ? ` · streak ${streak}` : ''}\nCan you name the game from its setup?`
    const url = `${window.location.origin}/daily`
    const image = await resultImage(puzzle.number, !!result?.won, streak).catch(() => null)
    const r = await shareLink({ url, title: `Howty daily table #${puzzle.number}`, text, files: image ? [image] : undefined })
    if (r !== 'copied') return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="flex min-h-full flex-col">
      <Button kind="quiet" size="sm" icon="back" onClick={onHome} className="-ml-3 self-start">
        All games
      </Button>
      <div className="mt-6">
        <Eyebrow>Daily table #{puzzle.number}</Eyebrow>
        <h1 className="mt-1 font-display text-page font-bold text-ink sm:text-[40px] sm:leading-[1.05]">{result ? (result.won ? 'You named it.' : 'Not this time.') : 'Which game is this?'}</h1>
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

/**
 * A picture of today's table with your result, for the phone's share sheet. It shows the table but not
 * the answer, so it doubles as an invitation to play.
 */
async function resultImage(number: number, won: boolean, streak: number): Promise<File> {
  const gl = document.querySelector('canvas')
  if (!gl) throw new Error('no table on screen')
  const c = Object.assign(document.createElement('canvas'), { width: 1200, height: 630 })
  const x = c.getContext('2d')!
  x.fillStyle = '#ffffff'
  x.fillRect(0, 0, 1200, 630)
  // the table, cropped to fill a rounded panel on the right
  const [pw, ph] = [620, 502]
  const s = Math.max(pw / gl.width, ph / gl.height)
  x.save()
  x.beginPath()
  x.roundRect(540, 64, pw, ph, 28)
  x.clip()
  x.fillStyle = '#f5f5f4'
  x.fillRect(540, 64, pw, ph)
  x.drawImage(gl, 540 + (pw - gl.width * s) / 2, 64 + (ph - gl.height * s) / 2, gl.width * s, gl.height * s)
  x.restore()
  x.fillStyle = '#78716c'
  x.font = '500 26px "DM Sans", sans-serif'
  x.fillText(`Howty daily table #${number}`, 64, 120)
  x.fillStyle = '#1c1917'
  x.font = '700 64px Fraunces, Georgia, serif'
  x.fillText(won ? 'I named it.' : 'It beat me.', 64, 210)
  x.font = '400 28px "DM Sans", sans-serif'
  x.fillStyle = '#57534e'
  ;['Can you name the game', 'from its setup?'].forEach((l, i) => x.fillText(l, 64, 290 + i * 40))
  if (streak > 1) {
    x.fillStyle = '#d97706'
    x.font = '600 28px "DM Sans", sans-serif'
    x.fillText(`${streak}-day streak`, 64, 400)
  }
  x.fillStyle = '#1c1917'
  x.font = '700 32px Fraunces, Georgia, serif'
  x.fillText('howty', 64, 560)
  const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/png'))
  if (!blob) throw new Error('could not draw')
  return new File([blob], `howty-daily-${number}.png`, { type: 'image/png' })
}
