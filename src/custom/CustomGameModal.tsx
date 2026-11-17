import { useMemo, useState } from 'react'
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

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-stone-900/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92dvh] w-full max-w-xl overflow-auto rounded-t-3xl bg-[#fbf7ef] p-5 shadow-2xl sm:rounded-3xl sm:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Rulebook to 3D</div>
            <h2 className="font-display text-2xl font-bold text-stone-900">Add a custom game</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="h-9 w-9 rounded-full border border-stone-300 bg-white text-lg leading-none hover:bg-stone-50">×</button>
        </div>
        <p className="mt-1 text-sm text-stone-600">Paste the setup section of any rulebook. Everything is read in your browser: nothing is uploaded.</p>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Game name (optional)"
          className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste setup rules here, e.g. “For 2 to 4 players. Shuffle the 52 cards and deal 5 to each player…”"
          rows={8}
          className="mt-2 w-full select-text rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm leading-snug focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <label className="cursor-pointer rounded-full border border-stone-300 bg-white px-3 py-1.5 font-semibold hover:bg-stone-50">
            Upload .txt / .md
            <input type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" className="hidden" onChange={(e) => void loadFile(e.target.files?.[0])} />
          </label>
          <button onClick={() => { setText(EXAMPLE); setTitle('') }} className="rounded-full px-3 py-1.5 font-semibold text-amber-700 hover:bg-amber-50">
            Try an example
          </button>
          {error && <span className="text-red-700">{error}</span>}
        </div>

        <div className="mt-4 min-h-[3.5rem] rounded-xl border border-dashed border-stone-300 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Detected</div>
          {parsed ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[11px] font-semibold text-white">{parsed.title}</span>
              {describe(parsed).map((d) => (
                <span key={d} className="rounded-full border border-stone-300 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-700">{d}</span>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-sm text-stone-400">Paste a few sentences to see what the parser finds.</div>
          )}
        </div>

        <button
          disabled={!parsed}
          onClick={() => parsed && onCreate({ id: `custom-${Date.now().toString(36)}`, title: parsed.title, text })}
          className="mt-4 h-12 w-full rounded-full bg-stone-900 text-sm font-semibold text-white shadow-md transition hover:bg-stone-700 disabled:opacity-35"
        >
          Build 3D setup →
        </button>
      </div>
    </div>
  )
}
