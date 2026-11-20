/**
 * Counts the moments that show Howty is working: a setup followed to the end, a first turn watched, a
 * guide shared. Vercel's custom events need a paid plan, so each one is sent as an anonymous page view of a
 * made-up path such as /did/setup-done/azul, which the free Web Analytics lists under Pages. No cookies
 * and nothing personal: the same anonymous count as any other page view. Built site only.
 */
import { pageview } from '@vercel/analytics'

export type Moment =
  | 'setup-done' // reached the last setup step of a guide
  | 'turn-done' // watched the first turn through to its end
  | 'share-opened' // opened the Share panel
  | 'link-shared' // sent the link through the phone's share sheet
  | 'link-copied'
  | 'video-made' // finished recording a video
  | 'video-shared' // shared or downloaded that video
  | 'embed-copied'

const sent = new Set<string>()

/** Counts a moment once per game per visit, so stepping back and forth doesn't inflate it. */
export function count(what: Moment, game?: string) {
  if (!import.meta.env.PROD) return
  const path = `/did/${what}${game ? `/${game}` : ''}`
  if (sent.has(path)) return
  sent.add(path)
  try {
    pageview({ route: `/did/${what}`, path })
  } catch {
    /* counting is optional */
  }
}
