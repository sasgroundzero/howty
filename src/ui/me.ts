/**
 * Everything Howty remembers about you: your shelf, what you have set up, and your daily-table streak.
 * It lives in this browser's localStorage and is never sent anywhere.
 */
import { useSyncExternalStore } from 'react'
import type { GameDef } from '../engine/types'

export type Status = 'own' | 'want' | 'taught'
export const STATUS: Record<Status, string> = { own: 'Own it', want: 'Want to learn', taught: 'Taught it' }
export interface Me {
  shelf: Record<string, Status>
  /** how many times each game's setup was followed to the last step */
  done: Record<string, number>
  steps: number
  daily: { day: string; pick: string; won: boolean } | null
  streak: number
  best: number
  played: number
  wins: number
}
const KEY = 'howty.me'
const EMPTY: Me = { shelf: {}, done: {}, steps: 0, daily: null, streak: 0, best: 0, played: 0, wins: 0 }
const read = (): Me => {
  try {
    return { ...EMPTY, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Me>) }
  } catch {
    return EMPTY
  }
}
let me = read()
const subs = new Set<() => void>()
export function update(fn: (m: Me) => Me) {
  me = fn(me)
  try {
    localStorage.setItem(KEY, JSON.stringify(me))
  } catch {
    /* storage is optional */
  }
  subs.forEach((f) => f())
}
export const useMe = () =>
  useSyncExternalStore(
    (f) => {
      subs.add(f)
      return () => subs.delete(f)
    },
    () => me,
  )

/* ---- The daily table ------------------------------------------------------------- */
const LAUNCH = Date.UTC(2026, 10, 16)
const dayOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const today = () => dayOf(new Date())
const yesterday = () => dayOf(new Date(Date.now() - 864e5))
export const dayNumber = (day = today()) => Math.round((Date.parse(`${day}T00:00:00Z`) - LAUNCH) / 864e5) + 1
/** A streak only counts if you played today or yesterday. */
export const liveStreak = (m: Me) => (m.daily && (m.daily.day === today() || m.daily.day === yesterday()) ? m.streak : 0)

function rng(seed: string) {
  let a = 2166136261
  for (const ch of seed) a = Math.imul(a ^ ch.charCodeAt(0), 16777619)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
/** Games whose table does not spell out their own name (on a board label, a mat or a card). */
function fairPool(games: GameDef[]) {
  return games.filter((g) => {
    if (g.custom) return false
    const drawn = JSON.stringify(g.build(g.meta.defaultPlayers).pieces.map((p) => p.props)).toLowerCase()
    return !g.meta.title.toLowerCase().split(/[^a-z0-9]+/).some((w) => w.length > 3 && !['game', 'card', 'board', 'the'].includes(w) && [w, w.replace(/ies$/, 'y'), w.replace(/s$/, '')].some((v) => v.length > 3 && drawn.includes(v)))
  })
}
let pool: GameDef[] | null = null
/** Today's mystery game and four shuffled choices; the same for everyone on the same date. */
export function dailyPuzzle(games: GameDef[], day = today()) {
  pool ??= fairPool(games).sort((a, b) => a.id.localeCompare(b.id))
  const r = rng(`howty-${day}`)
  for (let i = 0; i < 8; i++) r()
  // shuffle the whole pool for the day: the first game is the answer, the next three the decoys
  const deck = [...pool]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  const choices = deck.slice(0, 4)
  const answer = choices[0]
  const at = Math.floor(r() * 4)
  ;[choices[0], choices[at]] = [choices[at], choices[0]]
  return { answer, choices, day, number: dayNumber(day), pool: pool.length }
}
export function answerDaily(day: string, pick: string, won: boolean) {
  update((m) => {
    if (m.daily?.day === day) return m
    const streak = won ? (m.daily?.day === yesterday() ? m.streak : 0) + 1 : 0
    return { ...m, daily: { day, pick, won }, streak, best: Math.max(m.best, streak), played: m.played + 1, wins: m.wins + (won ? 1 : 0) }
  })
}
