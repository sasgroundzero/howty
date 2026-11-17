import { useMemo, useState } from 'react'
import { Icon } from '../ui/icons'
import { Button } from '../ui/kit'
import { EXAMPLE, describe, parseRules, type CustomEntry } from './parser'

/** "+ Add Custom Game": paste setup rules or load a .txt/.md file, preview what was detected, build it. */
export function CustomGameModal({ onClose, onCreate }: { onClose: () => void; onCreate: (e: CustomEntry) => void }) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const parsed = useMemo(() => (text.trim().length > 20 ? parseRules(text, title) : null), [text, title])

  const loadFile = async (file: File | undefined) => {
    if (!file) return
    if (!/\.(txt|md|markdown)$/i.test(file.name) || file.size > 2_000_000) {
      setError('Please choose a .txt or .md file under 2 MB.')
      return
    }
    setError('')
    setText(await file.text())
    if (!title) setTitle('')
  }

  const field = 'w-full select-text rounded-xl border border-line bg-white px-4 py-3 text-body text-ink outline-none transition duration-150 ease-out placeholder:text-stone-400 focus:border-ink'
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4" onClick={onClose}>
      <div className="animate-grow max-h-[92dvh] w-full max-w-xl origin-bottom overflow-auto rounded-t-2xl border border-line bg-paper p-6 shadow-lift sm:rounded-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-page font-bold text-ink">Add a game</h2>
          <Button kind="quiet" size="sm" onClick={onClose} aria-label="Close" className="-mr-2 w-8 !px-0">
            <Icon name="x" />
          </Button>
        </div>
        <p className="mt-2 max-w-[52ch] text-ui text-stone-600">Paste the setup section of the rulebook. It is read in your browser and never uploaded.</p>

        <div className="mt-6 space-y-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Game name (optional)" aria-label="Game name" className={field} />
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="For 2 to 4 players. Shuffle the 52 cards and deal 5 to each player…" aria-label="Setup rules" rows={8} className={field} />
        </div>
        <div className="-mx-3 mt-2 flex flex-wrap items-center">
          <label className="inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-ui font-semibold text-stone-600 transition duration-150 ease-out hover:bg-ink/5 hover:text-ink">
            Upload a .txt or .md file
            <input type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" className="hidden" onChange={(e) => void loadFile(e.target.files?.[0])} />
          </label>
          <Button kind="quiet" size="sm" onClick={() => { setText(EXAMPLE); setTitle('') }}>
            Try an example
          </Button>
        </div>
        {error && <p className="mt-2 text-ui text-red-700">{error}</p>}

        <p className="mt-6 min-h-10 text-ui text-stone-600">
          {parsed ? (
            <>
              <span className="font-semibold text-ink">{parsed.title}</span>: {describe(parsed).join(' · ')}
            </>
          ) : (
            <span className="text-stone-400">What Howty finds in your rules will show here.</span>
          )}
        </p>

        <Button kind="primary" size="lg" iconRight="arrow" disabled={!parsed} onClick={() => parsed && onCreate({ id: `custom-${Date.now().toString(36)}`, title: parsed.title, text })} className="mt-4 w-full justify-between">
          Build the 3D table
        </Button>
      </div>
    </div>
  )
}
