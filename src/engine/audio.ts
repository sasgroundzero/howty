/** Synthesized sound effects (Web Audio only, no sound files). */
export type Sfx = 'wood' | 'card' | 'dice'

export const audio = { ctx: null as AudioContext | null, muted: false, last: {} as Record<string, number> }

/** Every sound goes through one master node, so a recording can listen in as well as the speakers. */
let master: GainNode | null = null
const out = (ctx: AudioContext) => {
  if (!master || master.context !== ctx) {
    master = ctx.createGain()
    master.connect(ctx.destination)
  }
  return master
}

/** A live copy of the table's sounds, for a video recording. Call the returned stop() when done. */
export function recordAudio(): { track: MediaStreamTrack; stop: () => void } | null {
  const ctx = audio.ctx
  if (!ctx || typeof ctx.createMediaStreamDestination !== 'function') return null
  const tap = ctx.createMediaStreamDestination()
  out(ctx).connect(tap)
  const muted = audio.muted
  audio.muted = false
  return {
    track: tap.stream.getAudioTracks()[0],
    stop: () => {
      audio.muted = muted
      try {
        out(ctx).disconnect(tap)
      } catch {
        /* already gone */
      }
    },
  }
}

export function unlockAudio() {
  try {
    if (!audio.ctx) audio.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    void audio.ctx.resume()
  } catch {
    /* audio is optional */
  }
}

/** One filtered noise burst, optionally with a short pitched body. */
function burst(ctx: AudioContext, at: number, freq: number, q: number, gain: number, dur: number, body = 0) {
  const len = Math.floor(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const noise = ctx.createBufferSource()
  noise.buffer = buf
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = freq
  band.Q.value = q
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, at)
  g.gain.exponentialRampToValueAtTime(0.001, at + dur)
  noise.connect(band).connect(g).connect(out(ctx))
  noise.start(at)
  if (body) {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(body, at)
    osc.frequency.exponentialRampToValueAtTime(body * 0.55, at + dur * 1.5)
    const og = ctx.createGain()
    og.gain.setValueAtTime(gain * 0.55, at)
    og.gain.exponentialRampToValueAtTime(0.001, at + dur * 1.6)
    osc.connect(og).connect(out(ctx))
    osc.start(at)
    osc.stop(at + dur * 1.7)
  }
}

export function play(kind: Sfx) {
  const ctx = audio.ctx
  if (!ctx || audio.muted || ctx.state !== 'running') return
  const now = ctx.currentTime
  if (now - (audio.last[kind] ?? 0) < 0.045) return
  audio.last[kind] = now
  if (kind === 'wood') burst(ctx, now, 1400 + Math.random() * 900, 1.6, 0.2, 0.05, 260 + Math.random() * 120)
  else if (kind === 'card') {
    burst(ctx, now, 4200 + Math.random() * 1200, 0.9, 0.11, 0.028)
    burst(ctx, now + 0.012, 900, 1.2, 0.05, 0.03)
  } else
    for (const t of [0, 0.07, 0.15, 0.26])
      burst(ctx, now + t + Math.random() * 0.02, 2300 + Math.random() * 1500, 2.4, 0.16 - t * 0.35, 0.035, 520 + Math.random() * 260)
}
