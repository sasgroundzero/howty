/**
 * Saves a game's setup as a vertical video, entirely in the browser. The 3D canvas is moved into a hidden
 * portrait box, copied frame by frame onto a 720 x 1280 canvas with the step text drawn over it, and
 * MediaRecorder turns that canvas into a file. Nothing is uploaded.
 */
import { useEffect, useRef, useState } from 'react'
import { recordAudio } from '../engine/audio'
import { count } from './count'
import { Button } from './kit'

const W = 720
const H = 1280
/** The 3D picture is taller than the video, so the table can sit above the caption card. */
const SRC_H = 1480
/** How far the table is raised in the video, in video pixels, counting the lift the step view already applies. */
const LIFT = 140
/** With sound first; MP4 where the browser can make one, since every phone and app plays it. */
const MIMES = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,opus', 'video/webm;codecs=vp9,opus', 'video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm']
const INK = '#1c1917'
const ACCENT = '#d97706'
const SANS = '"DM Sans", system-ui, sans-serif'
const SERIF = 'Fraunces, Georgia, serif'

const mime = (sound = false) =>
  typeof MediaRecorder === 'undefined' ? undefined : MIMES.filter((m) => sound || !/mp4a|opus/.test(m)).find((m) => MediaRecorder.isTypeSupported(m))
export const canRecord = () => typeof HTMLCanvasElement !== 'undefined' && 'captureStream' in HTMLCanvasElement.prototype && !!mime()

type Caption = { key: string; label: string; title: string; text: string; step: number; total: number; game: string; link: string }

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number, max: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > width) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  if (lines.length <= max) return lines
  let last = lines[max - 1]
  while (last && ctx.measureText(`${last}…`).width > width) last = last.slice(0, -1)
  return [...lines.slice(0, max - 1), `${last.trimEnd()}…`]
}

/** Draws one frame: the table, the game's name and progress at the top, the step card below. */
function paint(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, c: Caption, age: number, shift: number) {
  ctx.fillStyle = '#e7e5e4'
  ctx.fillRect(0, 0, W, H)
  const h = (src.height / src.width) * W
  ctx.drawImage(src, 0, (H - h) / 2 - shift, W, h)

  const fade = ctx.createLinearGradient(0, 0, 0, 330)
  fade.addColorStop(0, 'rgba(255,255,255,0.96)')
  fade.addColorStop(0.7, 'rgba(255,255,255,0.8)')
  fade.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, W, 330)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#57534e'
  ctx.font = `600 28px ${SANS}`
  ctx.fillText('How to set up', 40, 130)
  ctx.fillStyle = INK
  let size = 68
  do ctx.font = `700 ${size}px ${SERIF}`
  while (ctx.measureText(c.game).width > W - 80 && (size -= 2) > 34)
  ctx.fillText(c.game, 40, 200)

  const gap = 6
  const seg = (W - 80 - gap * (c.total - 1)) / c.total
  for (let i = 0; i < c.total; i++) {
    ctx.fillStyle = i <= c.step ? ACCENT : 'rgba(28,25,23,0.16)'
    ctx.beginPath()
    ctx.roundRect(40 + i * (seg + gap), 228, seg, 6, 3)
    ctx.fill()
  }

  // the step card eases in each time the step changes
  const a = Math.min(1, age / 260)
  const ease = 1 - (1 - a) ** 3
  ctx.font = `700 40px ${SERIF}`
  const title = wrap(ctx, c.title, W - 140, 2)
  ctx.font = `400 28px ${SANS}`
  const body = wrap(ctx, c.text, W - 140, 6)
  const height = 30 + 26 + 22 + title.length * 46 + 6 + body.length * 38 + 26
  const top = 1056 - height + (1 - ease) * 16
  ctx.save()
  ctx.globalAlpha = ease
  ctx.shadowColor = 'rgba(28,25,23,0.2)'
  ctx.shadowBlur = 36
  ctx.shadowOffsetY = 10
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(40, top, W - 80, height, 28)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.font = `700 22px ${SANS}`
  ctx.fillStyle = ACCENT
  ctx.fillText(c.label.toUpperCase(), 70, top + 56)
  ctx.textAlign = 'right'
  ctx.font = `600 22px ${SANS}`
  ctx.fillStyle = '#57534e'
  ctx.fillText(c.link, W - 70, top + 56)
  ctx.textAlign = 'left'
  ctx.fillStyle = INK
  ctx.font = `700 40px ${SERIF}`
  title.forEach((l, i) => ctx.fillText(l, 70, top + 112 + i * 46))
  ctx.fillStyle = '#44403c'
  ctx.font = `400 28px ${SANS}`
  body.forEach((l, i) => ctx.fillText(l, 70, top + 112 + title.length * 46 + i * 38))
  ctx.restore()
}

export function Recorder({ host, slot, title, game, link, steps, step, onStep, onClose }: {
  /** the element holding the app's one 3D canvas */
  host: HTMLElement
  /** where that element should be mounted while recording */
  slot: (el: HTMLElement | null) => void
  title: string
  /** which guide, for the anonymous counts */
  game: string
  /** the address printed on the video */
  link: string
  steps: { title: string; instruction: string }[]
  step: number
  onStep: (i: number) => void
  onClose: () => void
}) {
  const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
  const [phase, setPhase] = useState<'prep' | 'run' | 'end' | 'done' | 'failed'>('prep')
  const [file, setFile] = useState<{ file: File; url: string } | null>(null)
  const view = useRef<HTMLCanvasElement>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const sound = useRef<ReturnType<typeof recordAudio>>(null)
  const at = Math.min(step, steps.length - 1)
  const closing = phase === 'end' || phase === 'done'
  const caption: Caption = closing
    ? { key: 'end', label: 'Ready to play', title: 'Now watch the first turn', text: `Every step and a first turn, free at ${link}`, step: steps.length, total: steps.length, game: title, link }
    : { key: String(at), label: `Step ${at + 1} of ${steps.length}`, title: steps[at].title, text: steps[at].instruction, step: at, total: steps.length, game: title, link }
  const cap = useRef({ c: caption, since: 0 })
  if (cap.current.c.key !== caption.key) cap.current = { c: caption, since: performance.now() }

  /* Draw every frame, and start recording once the table has settled into its portrait box */
  useEffect(() => {
    let live = true
    let raf = 0
    const canvas = view.current!
    const ctx = canvas.getContext('2d')!
    // the step view already lifts the picture (ViewOffset in the engine): by 3% of a narrow canvas, up to 120px of a wide one
    const css = { w: W / dpr, h: SRC_H / dpr }
    const shift = LIFT - (css.w < 640 ? css.h * 0.03 : Math.min(120, css.h * 0.13)) * dpr
    const loop = () => {
      const src = host.querySelector('canvas')
      if (src?.width) paint(ctx, src, cap.current.c, performance.now() - cap.current.since, shift)
      raf = requestAnimationFrame(loop)
    }
    loop()
    onStep(0)
    const chunks: Blob[] = []
    const fonts = Promise.all([document.fonts.load(`700 40px ${SERIF}`), document.fonts.load(`400 28px ${SANS}`), document.fonts.load(`700 22px ${SANS}`)]).catch(() => undefined)
    const t = window.setTimeout(async () => {
      await fonts
      if (!live) return
      try {
        const video = canvas.captureStream(30)
        sound.current = recordAudio()
        const type = mime(!!sound.current)!
        const stream = new MediaStream([...video.getVideoTracks(), ...(sound.current && /mp4a|opus/.test(type) ? [sound.current.track] : [])])
        const r = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 6_000_000 })
        r.ondataavailable = (e) => e.data.size && chunks.push(e.data)
        r.onerror = () => live && setPhase('failed')
        r.onstop = () => {
          r.stream.getTracks().forEach((k) => k.stop())
          video.getTracks().forEach((k) => k.stop())
          sound.current?.stop()
          sound.current = null
          if (!live) return
          const kind = type.split(';')[0]
          const f = new File(chunks, `how-to-set-up-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.${kind.endsWith('mp4') ? 'mp4' : 'webm'}`, { type: kind })
          setFile({ file: f, url: URL.createObjectURL(f) })
          setPhase('done')
          count('video-made', game)
        }
        r.start()
        recorder.current = r
        cap.current.since = performance.now()
        setPhase('run')
      } catch {
        setPhase('failed')
      }
    }, 1100)
    return () => {
      live = false
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop()
      sound.current?.stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => void (file && URL.revokeObjectURL(file.url)), [file])

  /* Each step stays up for about as long as it takes to read, then the closing card holds for a moment */
  useEffect(() => {
    if (phase !== 'run' || step >= steps.length) return
    const words = `${steps[at].title} ${steps[at].instruction}`.split(/\s+/).length
    const t = window.setTimeout(() => (at < steps.length - 1 ? onStep(at + 1) : setPhase('end')), Math.min(5200, Math.max(2600, words * 150 + 1300)))
    return () => window.clearTimeout(t)
  }, [phase, step]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== 'end') return
    const t = window.setTimeout(() => recorder.current?.stop(), 3000)
    return () => window.clearTimeout(t)
  }, [phase])

  const canShareFile = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file.file] })
  const download = () => {
    if (!file) return
    count('video-shared', game)
    const a = Object.assign(document.createElement('a'), { href: file.url, download: file.file.name })
    a.click()
  }
  return (
    <div role="dialog" aria-label="Save as video" data-recording className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-hidden bg-ink p-4 text-paper">
      {/* the real 3D canvas renders here, unseen, at exactly the size the video needs */}
      <div ref={slot} className="pointer-events-none absolute left-0 top-0 opacity-0" style={{ width: W / dpr, height: SRC_H / dpr }} />
      <div className="relative min-h-0 flex-1" style={{ aspectRatio: '9 / 16' }}>
        <canvas ref={view} width={W} height={H} className={phase === 'done' ? 'hidden' : 'h-full w-full rounded-2xl'} />
        {file && <video src={file.url} controls autoPlay muted loop playsInline className="h-full w-full rounded-2xl bg-black" />}
      </div>
      {phase === 'done' && file ? (
        <div className="grid w-full max-w-sm gap-2 text-center">
          <p className="text-ui text-stone-300">
            Your video is ready ({(file.file.size / 1e6).toFixed(1)} MB{file.file.type.endsWith('webm') ? ', WebM. For an MP4, record in Chrome or Safari' : ''}).
          </p>
          <div className="flex gap-2">
            {canShareFile && (
              <Button kind="accent" icon="share" className="flex-1" onClick={() => void navigator.share({ files: [file.file], title: `How to set up ${title}` }).then(() => count('video-shared', game), () => undefined)}>
                Share
              </Button>
            )}
            <Button kind={canShareFile ? 'secondary' : 'accent'} className="flex-1" onClick={download}>
              Download
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex w-full max-w-sm items-center justify-between gap-4">
          <p className="text-ui text-stone-300" aria-live="polite">
            {phase === 'failed' ? 'This browser could not record the video.' : phase === 'prep' ? 'Getting the table ready…' : phase === 'end' ? 'Finishing the video…' : `Recording step ${at + 1} of ${steps.length}. Keep this tab open.`}
          </p>
          <Button size="sm" onClick={onClose}>
            {phase === 'failed' ? 'Close' : 'Cancel'}
          </Button>
        </div>
      )}
    </div>
  )
}
