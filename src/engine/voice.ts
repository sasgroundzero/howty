/** Web Speech API wrappers: narration (speech synthesis) and voice commands (recognition). */
export const voice = { on: false }

export function speak(text: string) {
  if (!voice.on || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1.02
  window.speechSynthesis.speak(u)
}
export const hush = () => 'speechSynthesis' in window && window.speechSynthesis.cancel()

export type VoiceCommand = 'next' | 'back' | 'repeat'
interface Recognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
  start: () => void
  stop: () => void
}

export const canListen = () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

/** Starts listening for "next", "back" and "repeat". Returns a stop function, or null if unsupported. */
export function listen(onCommand: (c: VoiceCommand) => void, onStop: () => void): (() => void) | null {
  const w = window as unknown as Record<string, new () => Recognition>
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  if (!Ctor) return null
  const rec = new Ctor()
  let alive = true
  rec.continuous = true
  rec.interimResults = false
  rec.lang = 'en-US'
  rec.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const said = e.results[i][0].transcript.toLowerCase()
      if (/\b(next|forward|continue)\b/.test(said)) onCommand('next')
      else if (/\b(back|previous)\b/.test(said)) onCommand('back')
      else if (/\b(repeat|again)\b/.test(said)) onCommand('repeat')
    }
  }
  rec.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      alive = false
      onStop()
    }
  }
  // Browsers end recognition after a pause; keep it running until switched off
  rec.onend = () => {
    if (!alive) return
    try {
      rec.start()
    } catch {
      alive = false
      onStop()
    }
  }
  try {
    rec.start()
  } catch {
    return null
  }
  return () => {
    alive = false
    rec.stop()
  }
}
