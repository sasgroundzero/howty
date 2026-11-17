/** Fetches games' 3D setups on demand and keeps the ones already fetched. */
import type { GameDef } from '../../engine/types'
import { LOAD } from './catalog'

const cache = new Map<string, GameDef>()
const pending = new Map<string, Promise<GameDef>>()

/** A built-in game if it has been fetched already. */
export const loaded = (id: string) => cache.get(id)

export function loadGame(id: string): Promise<GameDef> {
  const have = cache.get(id)
  if (have) return Promise.resolve(have)
  const load = LOAD[id] ?? LOAD.catan
  const p = pending.get(id) ?? load().then((g) => (cache.set(id, g), g))
  pending.set(id, p)
  return p
}
