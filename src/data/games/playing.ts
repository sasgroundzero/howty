/**
 * Standard playing cards for the classic card games: faces, a card back, and the few
 * items every card table shares. Game files in `more/` import from here and from compose.
 */
import type { Face } from '../../engine/types'
import { cards, deck, f, type Item } from './compose'

const FRAME = { bg: '#ffffff', border: '#d6d3d1' }
/** One playing-card face from shorthand: 'A♠', '10♥', 'K♦', 'Q♣', or 'JK' for a joker. Hearts and diamonds are red. */
export const pc = (s: string): Face =>
  s === 'JK' ? { ...FRAME, ink: '#7a4fa3', glyph: '★', sub: 'Joker' } : { ...FRAME, ink: /[♥♦]/.test(s) ? '#c0392b' : '#1c1917', glyph: s }
/** Several faces from a space-separated string: pcs('A♠ K♠ 10♥'). */
export const pcs = (s: string): Face[] => s.trim().split(/\s+/).map(pc)
/** The back shared by every card in a deck. */
export const BACK = f('#27457a', '✦', '#dbe4f5')
/** A second back color, for games that use two decks or a spare pack. */
export const BACK2 = f('#9b2c2c', '✦', '#f5dede')

type Opt = { cols?: number; gap?: number; w?: number; d?: number; back?: Face }
/** A face-down pack: the stock, a kitty, a pile of undealt cards. Draw from it with `draw(id, to, pc('7♣'))`. */
export const stock = (id: string, count: number, title: string, body: string, o: Opt = {}): Item => deck(id, count, o.back ?? BACK, title, body, o)
/** Cards laid face up for everyone, from shorthand. Give `cols` to wrap a long row (7 is a good width). */
export const shown = (id: string, s: string, title: string, body: string, o: Opt = {}): Item => cards(id, pcs(s).length, pcs(s), title, body, o)
/**
 * A hand of cards, for a `P(...)` row: yours is face up so the reader can see it, everyone else's is face down.
 * When another player plays a card, turn it over as it moves: `flip('hand.1@1'), mv('hand.1@1', ...)`.
 */
export const hand = (id: string, s: string, title: string, body: string, o: Opt = {}): Item => {
  const it = shown(id, s, title, body, o)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); return seat && seat !== '@0' ? { ...m, props: { ...m.props, faceUp: false, back: o.back ?? BACK } } : m } }
}
/** The same cards dealt face down. Turn one over later with `flip('id.2')`. */
export const hidden = (id: string, s: string, title: string, body: string, o: Opt = {}): Item =>
  cards(id, pcs(s).length, pcs(s), title, body, { ...o, down: true, back: o.back ?? BACK })
/** UV of card k inside a `hand`/`hidden` block that is `cols` wide and `rows` deep (default card size and gap). */
export const slot = (k: number, cols: number, rows = 1): [number, number] => [
  (0.45 + (k % cols) * 1.04) / (cols * 1.04 - 0.14),
  (0.63 + Math.floor(k / cols) * 1.4) / (rows * 1.4 - 0.14),
]
