/**
 * The share panel for a game: a QR code so everyone at the table can follow on their own phone,
 * the phone's share sheet, and a plain copy-link.
 */
import qrcode from 'qrcode-generator'
import { useMemo, useState } from 'react'
import { Icon } from './icons'
import { Button } from './kit'
import { canRecord } from './Recorder'
import { canShareNatively, copyText, shareLink } from './share'

function QR({ text }: { text: string }) {
  const cells = useMemo(() => {
    const q = qrcode(0, 'M')
    q.addData(text)
    q.make()
    const n = q.getModuleCount()
    const d: string[] = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d.push(`M${c} ${r}h1v1h-1z`)
    return { n, d: d.join('') }
  }, [text])
  return (
    <svg viewBox={`-2 -2 ${cells.n + 4} ${cells.n + 4}`} className="h-auto w-full" role="img" aria-label="QR code for this link" shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={cells.n + 4} height={cells.n + 4} fill="#fff" />
      <path d={cells.d} fill="#1c1917" />
    </svg>
  )
}

/** HTML that shows a game's guide inside another page. */
export const embedCode = (id: string, title: string, players?: number) =>
  `<iframe src="${window.location.origin}/embed/${id}${players ? `?players=${players}` : ''}" title="How to set up ${title.replace(/"/g, '&quot;')}" width="100%" height="480" style="border:0;border-radius:16px;max-width:720px" loading="lazy"></iframe>`

export function ShareSheet({ url, title, embed, onVideo, onClose }: { url: string; title: string; /** HTML for showing this guide on another site */ embed?: string; /** records the setup as a vertical video */ onVideo?: () => void; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [embedded, setEmbedded] = useState(false)
  const done = (r: string) => {
    if (r !== 'copied') return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  // a QR code for a very long link (a custom game carries its rules) gets too dense to scan
  const scannable = url.length < 900
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-label="Share" className="animate-grow w-full max-w-sm origin-bottom rounded-t-2xl border border-line bg-paper p-6 shadow-lift sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-title font-bold text-ink">Share {title}</h2>
          <Button kind="quiet" size="sm" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 w-8 !px-0">
            <Icon name="x" />
          </Button>
        </div>
        {scannable && (
          <>
            <div className="mx-auto mt-6 w-48 rounded-xl border border-line p-2">
              <QR text={url} />
            </div>
            <p className="mt-3 text-center text-ui text-stone-600">Everyone at the table can scan this to follow along on their own phone.</p>
          </>
        )}
        <div className="mt-6 grid gap-2">
          {canShareNatively() && (
            <Button kind="primary" icon="share" onClick={() => void shareLink({ url, title: `How to set up ${title}` }).then(done)}>
              Share
            </Button>
          )}
          <Button kind={canShareNatively() ? 'secondary' : 'primary'} icon={copied ? 'check' : 'link'} onClick={() => void copyText(url).then(done)}>
            {copied ? 'Link copied' : 'Copy link'}
          </Button>
          {onVideo && canRecord() && (
            <>
              <Button icon="play" onClick={onVideo}>
                Save as video
              </Button>
              <p className="text-center text-meta text-stone-500">A short vertical clip of the setup, made on this device. Good for a group chat, TikTok or Reels.</p>
            </>
          )}
          {embed && (
            <>
              <Button
                icon={embedded ? 'check' : 'link'}
                onClick={() =>
                  void copyText(embed).then((r) => {
                    if (r !== 'copied') return
                    setEmbedded(true)
                    window.setTimeout(() => setEmbedded(false), 1600)
                  })
                }
              >
                {embedded ? 'Embed code copied' : 'Copy embed code'}
              </Button>
              <p className="text-center text-meta text-stone-500">Paste it into a blog, forum post or campaign page to show this guide there.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
