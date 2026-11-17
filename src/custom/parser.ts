/**
 * Rulebook-to-3D generator. 100% client-side: a handful of regular expressions
 * pull player counts, board shape, decks, dice and tokens out of pasted setup
 * text, and `generate` lays those components out as a normal GameSetup.
 */
import { Builder } from '../engine/builder'
import type { Face, Focus, GameDef, GameSetup, PieceSpec, V3 } from '../engine/types'
import { seatAt } from '../engine/util'

export interface ParsedRules {
  title: string
  players: [number, number]
  board: { shape: 'hex' | 'grid' | 'round' | 'rect' | 'none'; cols: number; rows: number }
  /** `guess` means the rules never said how many cards there are */
  decks: { name: string; count: number; guess?: boolean }[]
  /** which deck the starting hand comes from (index into decks) */
  dealFrom: number
  dice: { sides: 4 | 6 | 8 | 10 | 12 | 20; count: number }[]
  tokens: { name: string; count: number; perPlayer: boolean }[]
  deal: number
  sentences: string[]
}

const WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
}
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
/** Words that come before "card" without naming a kind of card. */
const NOT_A_DECK = /^(the|and|one|two|any|all|each|more|extra|their|your|these|those|that|which|many|some|random|top|first|last|next|new|same|other|another|single|face|draw|draws|drew|play|plays|played|playing|deal|deals|dealt|shuffle|pick|picks|take|takes|keep|discard|discards|starting|remaining|number|with|from|for|has|have|most|few|several|\d+)$/
const TOKEN_WORDS = 'tokens?|meeples?|pawns?|coins?|cubes?|markers?|chips?|counters?|pieces|tiles|gems?|workers?|discs?|stones?|checkers|houses?|figures?|miniatures?'

export function parseRules(raw: string, titleHint = ''): ParsedRules {
  const lines = raw.split(/\r?\n/).map((l) => l.replace(/^[#>*\-\s\d.)]+/, '').trim()).filter(Boolean)
  const first = raw.split(/\r?\n/).find((l) => l.trim())?.replace(/^[#\s]+/, '').trim() ?? ''
  const title = titleHint.trim() || (first && first.length <= 48 && !/[.:]$/.test(first) ? first : 'Custom Game')
  const text = lines.join(' ').toLowerCase().replace(/\b[a-z]+\b/g, (w) => (w in WORDS ? String(WORDS[w]) : w))
  const sentences = lines
    .join(' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12 && s.length < 220)

  /* Players */
  let players: [number, number] = [2, 4]
  const range = text.match(/(\d+)\s*(?:-|–|to|or)\s*(\d+)\s*players?/)
  const single = text.match(/(\d+)[\s-]*players?\b/)
  if (range) players = [+range[1], +range[2]]
  else if (single) players = [+single[1], +single[1]]
  players = [clamp(players[0], 1, 6), clamp(Math.max(players[0], players[1]), 1, 6)]

  /* Board */
  const dims = text.match(/(\d+)\s*(?:x|×|by)\s*(\d+)/)
  let shape: ParsedRules['board']['shape'] = 'none'
  if (/hex/.test(text)) shape = 'hex'
  else if (/grid|squares|checkerboard|chessboard/.test(text) || (dims && /board|mat|map/.test(text))) shape = 'grid'
  else if (/circular|round board|wheel|circle/.test(text)) shape = 'round'
  else if (/\b(game ?board|board|map|playmat)\b/.test(text)) shape = 'rect'
  const board = { shape, cols: clamp(dims ? +dims[1] : 8, 2, 20), rows: clamp(dims ? +dims[2] : 8, 2, 20) }

  /* Hand size (found first so those cards are not mistaken for a deck) */
  const dealM =
    text.match(/deal(?:s|t)?\s+(?:out\s+)?(?:each player\s+)?(\d+)\s+([a-z]+\s)?cards?/) ??
    text.match(/(?:each player|everyone|players?)\s+(?:draws?|takes?|receives?|gets?|is dealt)\s+(\d+)\s+([a-z]+\s)?cards?/) ??
    text.match(/(?:draws?|hand of)\s+(\d+)\s+([a-z]+\s)?cards?/)
  const deal = dealM ? clamp(+dealM[1], 1, 10) : 0

  /* Decks */
  const decks: ParsedRules['decks'] = []
  const addDeck = (name: string, count: number, guess = false) => {
    const n = cap(name.trim() || 'main')
    if (!/^(each|the|a|of|out|all|these|those|your|their|\d+)$/i.test(n) && !decks.some((d) => d.name === n) && decks.length < 4)
      decks.push({ name: n, count: clamp(count, 1, 200), guess })
  }
  for (const m of text.matchAll(/(?:deck|pile|stack) of (\d+)\s*([a-z]+)? ?cards/g)) addDeck(m[2] ?? 'main', +m[1])
  for (const m of text.matchAll(/(\d+)\s+([a-z]+)\s+cards/g)) if (+m[1] > 10) addDeck(m[2], +m[1])
  for (const m of text.matchAll(/shuffle (?:the |all |all the )?([a-z]+) (?:cards|deck)/g)) addDeck(m[1], 40)
  for (const m of text.matchAll(/(\d+)[\s-]cards? deck/g)) addDeck('main', +m[1])
  // A kind of card that is named again and again ("white cards", "black cards") is a deck even without a count.
  const kinds = new Map<string, number>()
  for (const m of text.matchAll(/\b([a-z]{3,}) cards?\b/g)) if (!NOT_A_DECK.test(m[1])) kinds.set(m[1], (kinds.get(m[1]) ?? 0) + 1)
  for (const [name, seen] of kinds) if (seen >= 2) addDeck(name, 60, true)
  if (!decks.length && /\b(deck|cards)\b/.test(text)) addDeck('main', +(text.match(/(\d+) cards/)?.[1] ?? 52) > 10 ? +(text.match(/(\d+) cards/)?.[1] ?? 52) : 52)

  /* Dice */
  const dice: ParsedRules['dice'] = []
  const addDie = (sides: number, count: number) => {
    if ([4, 6, 8, 10, 12, 20].includes(sides) && !dice.some((d) => d.sides === sides))
      dice.push({ sides: sides as 6, count: clamp(count || 1, 1, 6) })
  }
  for (const m of text.matchAll(/(\d+)?\s*d(4|6|8|10|12|20)\b/g)) addDie(+m[2], +(m[1] ?? 1))
  for (const m of text.matchAll(/(\d+)[\s-]sided di(?:e|ce)/g)) addDie(+m[1], 1)
  const nd = text.match(/(\d+)\s+(?:[a-z-]+\s)?dice/)
  if (nd) addDie(6, +nd[1])
  else if (/\bdice\b/.test(text)) addDie(6, 2)
  else if (/\bdie\b/.test(text)) addDie(6, 1)

  /* Tokens */
  const tokens: ParsedRules['tokens'] = []
  // "house rules" and "piece of" are not components
  const NOT_TOKEN = '(?!\\s+(?:rules?|of)\\b)'
  const tokenRe = new RegExp(`(\\d+)\\s+(?:[a-z]+\\s)?(${TOKEN_WORDS})\\b${NOT_TOKEN}`, 'g')
  for (const s of text.split(/(?<=[.!?;])\s+/))
    for (const m of s.matchAll(tokenRe)) {
      const name = cap(m[2].replace(/s$/, '') + 's')
      if (!tokens.some((t) => t.name === name) && tokens.length < 4)
        tokens.push({ name, count: clamp(+m[1], 1, 60), perPlayer: /each|per player|every player|their|your/.test(s) })
    }
  if (!tokens.length) {
    // With no count given, only trust a token word in a sentence that hands something out.
    const m = text
      .split(/(?<=[.!?;])\s+/)
      .filter((s) => /\b(takes?|gets?|receives?|gives?|place|places|put|puts|hand out|chooses?)\b/.test(s))
      .join(' ')
      .match(new RegExp(`\\b(${TOKEN_WORDS})\\b${NOT_TOKEN}`))
    if (m) tokens.push({ name: cap(m[1].replace(/s$/, '') + 's'), count: 1, perPlayer: true })
  }

  const dealFrom = Math.max(0, decks.findIndex((d) => d.name.toLowerCase() === dealM?.[2]?.trim()))
  return { title, players, board, decks, dealFrom, dice, tokens, deal, sentences }
}

export function describe(p: ParsedRules): string[] {
  const out = [p.players[0] === p.players[1] ? `${p.players[0]} players` : `${p.players[0]}–${p.players[1]} players`]
  if (p.board.shape !== 'none') out.push(p.board.shape === 'grid' ? `${p.board.cols}×${p.board.rows} grid board` : `${p.board.shape === 'rect' ? 'rectangular' : p.board.shape} board`)
  p.decks.forEach((d) => out.push(d.guess ? `${d.name} deck` : `${d.name} deck (${d.count})`))
  p.dice.forEach((d) => out.push(`${d.count}× d${d.sides}`))
  p.tokens.forEach((t) => out.push(`${t.count} ${t.name.toLowerCase()}${t.perPlayer ? ' each' : ''}`))
  if (p.deal) out.push(`hand of ${p.deal}`)
  return out
}

/* ---- Layout generator ------------------------------------------------------ */

const COLORS = ['#d64545', '#3b6fd6', '#3f9a55', '#f08a24', '#8a5ab0', '#2f8a8a']
const TINTS = ['#f3d2cf', '#cfdcf5', '#d3ecd6', '#f8dfc3', '#e3d5f0', '#cfeaea']
const DECK_COLORS = ['#4b3b6b', '#2f6a5a', '#8a3a2a', '#2f5f9a']
/** Decks named after a color are drawn in it: [card, ink]. */
const CARD_COLORS: Record<string, [string, string]> = {
  white: ['#f4f1e8', '#1c1c1c'], black: ['#1c1c1c', '#f4f1e8'], red: ['#b23a30', '#ffffff'], blue: ['#2e6fb7', '#ffffff'],
  green: ['#3d8b4a', '#ffffff'], yellow: ['#e0b12f', '#1c1c1c'], purple: ['#7a4fa3', '#ffffff'], orange: ['#d9772b', '#1c1c1c'],
}
const S: [V3, number] = [[0, 0, 8.7], 0]
const N: [V3, number] = [[0, 0, -8.7], Math.PI]
const W: [V3, number] = [[-12.6, 0, 0], -Math.PI / 2]
const E: [V3, number] = [[12.6, 0, 0], Math.PI / 2]
const wide = (x: number, z: number, r: number): [V3, number] => [[x, 0, z], r]
const SEATS: Record<number, [V3, number][]> = {
  1: [S], 2: [S, N], 3: [S, W, N], 4: [S, W, N, E],
  5: [wide(-3.6, 8.7, 0), W, wide(-3.6, -8.7, Math.PI), wide(3.6, -8.7, Math.PI), wide(3.6, 8.7, 0)],
  6: [wide(-3.6, 8.7, 0), W, wide(-3.6, -8.7, Math.PI), wide(3.6, -8.7, Math.PI), E, wide(3.6, 8.7, 0)],
}
const FOCUS: Record<string, Focus> = {
  overview: { pos: [0, 27, 21], target: [0, 0, 0.6] },
  board: { pos: [0, 15, 11], target: [0, 0, 0.2] },
  decks: { pos: [8.2, 9, 8], target: [8.2, 0, -0.5] },
  supply: { pos: [-8.2, 9, 8], target: [-8.2, 0, -0.5] },
  seat: { pos: [0, 9, 16], target: [0, 0, 8] },
}

export function generate(p: ParsedRules, n: number): GameSetup {
  const b = new Builder()
  const seats = SEATS[clamp(n, 1, 6)].map(([pos, rot]) => ({ at: seatAt(pos, rot), rot }))
  const quote = (re: RegExp, fallback: string) => p.sentences.find((s) => re.test(s.toLowerCase())) ?? fallback
  const firstSeat = seats.length > 4 ? { pos: [-3.6, 9, 16] as V3, target: [-3.6, 0, 8] as V3 } : FOCUS.seat

  const SEAT = b.step({
    title: 'Take your seats',
    instruction: quote(/\b(sit|sits|seat|seats|seated)\b/, `Seat the ${n} player${n > 1 ? 's' : ''} around the table, each with their own play area.`),
    needs: [`${n} player${n > 1 ? 's' : ''}`],
    focus: FOCUS.overview,
  })
  seats.forEach((s, i) =>
    b.add({
      id: `mat-${i}`,
      kind: 'mat',
      props: { w: 6.3, d: 2.9, color: TINTS[i], border: COLORS[i], label: `PLAYER ${i + 1}`, labelAt: 'corner' },
      keys: [{ step: SEAT, pos: s.at(0, 0, 0), rotY: s.rot, delay: i * 0.18 }],
      info: { title: `Player ${i + 1}'s area`, body: 'This player keeps their own cards and pieces here.' },
    }),
  )

  if (p.board.shape !== 'none') {
    const BOARD = b.step({
      title: 'Place the board',
      instruction: quote(/board|map|grid|hex/, 'Put the board in the middle of the table where everyone can reach it.'),
      needs: ['1 board'],
      focus: FOCUS.board,
    })
    const info = { title: `${p.title} board`, body: `Detected from your rules as a ${p.board.shape === 'rect' ? 'rectangular' : p.board.shape} board. It sits in the center of the table.` }
    if (p.board.shape === 'hex') {
      const cells: [number, number][] = []
      for (let q = -2; q <= 2; q++) for (let r = Math.max(-2, -q - 2); r <= Math.min(2, -q + 2); r++) cells.push([q, r])
      const pal = ['#2f7a3b', '#c8643b', '#9ccb5a', '#e8c547', '#8a9099']
      cells.forEach(([q, r], i) =>
        b.add({
          id: `hex-${i}`,
          kind: 'hex',
          props: { r: 0.97, color: pal[(i * 7) % pal.length] },
          keys: [{ step: BOARD, pos: [Math.sqrt(3) * (q + r / 2), 0, 1.5 * r], delay: i * 0.06 }],
          info: { title: 'Hex tile', body: 'One space of the hex board detected in your rules.' },
        }),
      )
    } else if (p.board.shape === 'round')
      b.add({ id: 'board', kind: 'block', props: { w: 8.5, h: 0.12, d: 8.5, color: '#d9c7a0', round: true }, keys: [{ step: BOARD, pos: [0, 0, 0] }], info })
    else {
      const cellSize = p.board.shape === 'grid' ? Math.min(9 / p.board.cols, 8 / p.board.rows) : 0
      b.add({
        id: 'board',
        kind: 'mat',
        props:
          p.board.shape === 'grid'
            ? { w: p.board.cols * cellSize, d: p.board.rows * cellSize, color: '#e6dcc4', border: '#6b5a44', grid: cellSize }
            : { w: 9.5, d: 7, color: '#d9c7a0', border: '#6b5a44', label: p.title.toUpperCase(), ink: 'rgba(90,67,28,0.5)' },
        keys: [{ step: BOARD, pos: [0, 0, 0] }],
        info,
      })
    }
  }

  const deckPos = (i: number): V3 => [8.2, 0, -2.6 + i * 1.75]
  const decks: PieceSpec<'stack'>[] = []
  p.decks.forEach((d, i) => {
    const step = b.step({
      title: `Shuffle the ${d.name.toLowerCase()} deck`,
      instruction: quote(new RegExp(`shuffle.*${d.name.toLowerCase()}|${d.name.toLowerCase()} (cards|deck)|shuffle`), `Shuffle the ${d.guess ? '' : `${d.count} `}${d.name.toLowerCase()} cards and place them face down where everyone can reach them.`),
      needs: [d.guess ? `${d.name} cards` : `${d.count} cards`],
      focus: FOCUS.decks,
    })
    const named = CARD_COLORS[d.name.toLowerCase()]
    const face: Face = named ? { panel: named[0], border: named[1], ink: named[1], glyph: '✦', sub: d.name } : { panel: DECK_COLORS[i % 4], border: '#d9c88f', ink: '#f1e4bd', glyph: '✦', sub: d.name }
    decks.push(
      b.add({
        id: `deck-${i}`,
        kind: 'stack',
        props: { w: 0.9, d: 1.26, count: d.count, face, per: d.count > 70 ? 0.007 : 0.012 },
        keys: [{ step, pos: deckPos(i) }],
        info: { title: `${d.name} deck`, body: d.guess ? `A face-down pile of ${d.name.toLowerCase()} cards. Your rules do not say how many there are.` : `A face-down pile of ${d.count} cards, detected from your rules.` },
      }),
    )
  })

  const tokenPieces: PieceSpec<'token'>[] = []
  p.tokens.forEach((t, ti) => {
    const step = b.step({
      title: t.perPlayer ? `Hand out the ${t.name.toLowerCase()}` : `Set out the ${t.name.toLowerCase()}`,
      instruction: quote(new RegExp(t.name.toLowerCase().replace(/s$/, '')), t.perPlayer ? `Give each player ${t.count} ${t.name.toLowerCase()} in their color.` : `Place the ${t.count} ${t.name.toLowerCase()} in a shared supply beside the board.`),
      needs: [`${t.count} ${t.name.toLowerCase()}${t.perPlayer ? ' each' : ''}`],
      focus: t.perPlayer ? FOCUS.overview : FOCUS.supply,
    })
    const shown = Math.min(t.count, t.perPlayer ? 10 : 20)
    const body = `${t.count} ${t.name.toLowerCase()}${t.perPlayer ? ' per player' : ' in the shared supply'}${shown < t.count ? ` (${shown} shown)` : ''}.`
    if (t.perPlayer)
      seats.forEach((s, pi) => {
        for (let k = 0; k < shown; k++)
          tokenPieces.push(
            b.add({
              id: `tok-${ti}-${pi}-${k}`,
              kind: 'token',
              props: { r: 0.2, h: 0.12, color: COLORS[pi] },
              keys: [{ step, pos: s.at(-2.6 + (k % 5) * 0.5, 0.02, -0.9 + ti * 0.55 + Math.floor(k / 5) * 0.5), delay: pi * 0.2 + k * 0.04 }],
              info: { title: t.name, body },
            }),
          )
      })
    else
      for (let k = 0; k < shown; k++)
        b.add({
          id: `tok-${ti}-${k}`,
          kind: 'token',
          props: { r: 0.22, h: 0.1, color: ['#e2b93b', '#8a9099', '#c8643b', '#3f9a55'][ti % 4] },
          keys: [{ step, pos: [-9 + (k % 5) * 0.55, 0, -3 + ti * 2.6 + Math.floor(k / 5) * 0.55], delay: k * 0.04 }],
          info: { title: t.name, body },
        })
  })

  const dice: PieceSpec<'die'>[] = []
  if (p.dice.length) {
    const step = b.step({
      title: 'Set out the dice',
      instruction: quote(/\bdic?e\b/, `Put the dice (${p.dice.map((d) => `${d.count} d${d.sides}`).join(', ')}) where everyone can reach them.`),
      needs: p.dice.map((d) => `${d.count} d${d.sides}`),
      focus: FOCUS.supply,
    })
    let k = 0
    p.dice.forEach((d) => {
      for (let i = 0; i < d.count; i++, k++)
        dice.push(
          b.add({
            id: `die-${k}`,
            kind: 'die',
            props: { sides: d.sides, value: d.sides === 6 ? 3 + (k % 3) : d.sides, color: ['#f7f1e3', '#c8483f', '#3b6fd6', '#3f9a55'][k % 4], ink: k % 4 ? '#ffffff' : '#2e2622' },
            keys: [{ step, pos: [-6.4 + (k % 3) * 0.8, 0, 4.4 + Math.floor(k / 3) * 0.8], rotY: k * 0.6, delay: k * 0.12 }],
            spawnFrom: [-7, 1.8, 8],
            tumble: true,
            info: { title: `d${d.sides}`, body: `Your rules call for ${d.count} of these.` },
          }),
        )
    })
  }

  if (p.deal && decks.length) {
    const step = b.step({
      title: `Deal ${p.deal} cards each`,
      instruction: quote(/deal|draws?|hand/, `Deal ${p.deal} cards from the ${p.decks[p.dealFrom].name.toLowerCase()} deck to each player.`),
      needs: [`${p.deal} cards each`],
      focus: FOCUS.overview,
    })
    const from = deckPos(p.dealFrom)
    decks[p.dealFrom].keys.push({ step, pos: from, props: { count: Math.max(1, p.decks[p.dealFrom].count - p.deal * n) } })
    seats.forEach((s, pi) => {
      for (let j = 0; j < p.deal; j++)
        b.add({
          id: `hand-${pi}-${j}`,
          kind: 'card',
          props: { w: 0.5, d: 0.7, face: decks[p.dealFrom].props.face, back: decks[p.dealFrom].props.face, faceUp: false },
          keys: [{ step, pos: s.at(-0.3 + j * 0.56 - (p.deal - 1) * 0.28 - 0.6, 0.03, 0.75), rotY: s.rot, delay: pi * 0.3 + j * 0.1 }],
          spawnFrom: [from[0], 0.8, from[2]],
          info: { title: 'Starting card', body: `Each player starts with ${p.deal} cards, kept hidden from the others.` },
        })
    })
  }

  b.step({
    title: 'Ready to play',
    instruction: quote(/first player|goes first|starting player|youngest|begin/, 'Everything is set up: choose a starting player and begin.'),
    focus: FOCUS.overview,
  })

  /* ---- Simulate First Turn (generic template) ----------------------------- */
  b.turn({ title: 'Player 1 starts', instruction: 'The starting player takes the first turn while everyone else watches.', focus: firstSeat, duration: 5 })
  if (dice.length) {
    const T = b.turn({ title: 'Roll the dice', instruction: 'Player 1 picks up the dice and rolls them onto the table.', focus: FOCUS.board, duration: 7 })
    dice.forEach((d, i) => d.keys.push({ step: T, pos: [-1 + i * 0.9, p.board.shape === 'none' ? 0 : 0.15, 4.6 + (i % 2) * 0.5], rotY: i, delay: i * 0.1, props: { value: 1 + ((i * 3 + 3) % Math.min(d.props.sides, 6)) } }))
  }
  if (decks.length) {
    const T = b.turn({ title: 'Draw a card', instruction: `Player 1 draws the top card of the ${p.decks[p.dealFrom].name.toLowerCase()} deck into their hand.`, focus: FOCUS.decks, duration: 7 })
    const from = deckPos(p.dealFrom)
    b.add({
      id: 'sim-draw',
      kind: 'card',
      props: { w: 0.5, d: 0.7, face: decks[p.dealFrom].props.face, faceUp: true },
      keys: [{ step: T, pos: seats[0].at(-1.4, 0.03, 0.75), rotY: seats[0].rot, delay: 0.5 }],
      spawnFrom: [from[0], 0.8, from[2]],
      info: { title: 'Drawn card', body: 'The card drawn on the first turn.' },
    })
  }
  if (tokenPieces.length) {
    const T = b.turn({ title: 'Make a move', instruction: `Player 1 places one of their ${p.tokens.find((t) => t.perPlayer)!.name.toLowerCase()} onto the playing area.`, focus: FOCUS.board, duration: 7 })
    tokenPieces[0].keys.push({ step: T, pos: [0.6, p.board.shape === 'none' ? 0 : 0.15, 1.2], delay: 0.6 })
  }
  b.turn({ title: 'Pass the turn', instruction: n > 1 ? 'Player 1 ends their turn and play passes clockwise to Player 2.' : 'That ends the turn, and you start the next one.', focus: FOCUS.overview, duration: 5 })
  return b.done()
}

/* ---- Saved custom games (localStorage only; nothing leaves the browser) ------ */

export interface CustomEntry {
  id: string
  title: string
  text: string
}
const STORE = 'tabletop.customGames'
export function loadCustoms(): CustomEntry[] {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) ?? '[]')
    return Array.isArray(v) ? v.filter((e) => e && typeof e.id === 'string' && typeof e.text === 'string') : []
  } catch {
    return []
  }
}
export function saveCustoms(list: CustomEntry[]) {
  try {
    localStorage.setItem(STORE, JSON.stringify(list))
  } catch {
    /* storage is optional */
  }
}

/* ---- Share links: the rules travel inside the link's #fragment, which browsers never send to a server ---- */

const MAX_SHARED = 60000
const toB64 = (bytes: Uint8Array) => {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const fromB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
const through = async (bytes: Uint8Array, t: { readable: ReadableStream; writable: WritableStream }) =>
  new Uint8Array(await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(t as never)).arrayBuffer())

/** Packs a custom game into a string for the link: "z." + compressed, or "u." + plain where compression is unavailable. */
export async function encodeShare(e: CustomEntry): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify([e.title, e.text]))
  try {
    return `z.${toB64(await through(raw, new CompressionStream('deflate-raw')))}`
  } catch {
    return `u.${toB64(raw)}`
  }
}
/** Reads a custom game back out of a link. Returns null for anything malformed or oversized. */
export async function decodeShare(packed: string, id: string): Promise<CustomEntry | null> {
  try {
    const bytes = fromB64(packed.slice(2))
    const raw = packed.startsWith('z.') ? await through(bytes, new DecompressionStream('deflate-raw')) : packed.startsWith('u.') ? bytes : null
    if (!raw || raw.length > MAX_SHARED) return null
    const v: unknown = JSON.parse(new TextDecoder().decode(raw))
    if (!Array.isArray(v) || typeof v[0] !== 'string' || typeof v[1] !== 'string' || !v[1].trim()) return null
    return { id: /^custom-[a-z0-9]{1,16}$/.test(id) ? id : `custom-${Date.now().toString(36)}`, title: v[0].slice(0, 80), text: v[1] }
  } catch {
    return null
  }
}

export function toGameDef(e: CustomEntry): GameDef {
  const p = parseRules(e.text, e.title)
  return {
    id: e.id,
    custom: true,
    meta: {
      title: p.title,
      players: p.players,
      defaultPlayers: clamp(4, p.players[0], p.players[1]),
      playTime: 'Custom',
      difficulty: 'Medium',
      blurb: describe(p).slice(1, 4).join(' · ') || 'Generated from your rules.',
      swatch: ['#6b5a44', '#d9c7a0', '#f59e0b'],
    },
    build: (n) => generate(p, n),
  }
}

export const EXAMPLE = `Harbor Heist

A game for 2 to 4 players.

Setup
1. Place the 6 x 6 grid board in the middle of the table.
2. Shuffle the 48 treasure cards and place the deck face down next to the board.
3. Each player takes 5 pawns in their color.
4. Put the 20 coins in a shared supply.
5. Deal 3 cards to each player.
6. Set the 2 dice beside the board. The youngest player goes first.`
