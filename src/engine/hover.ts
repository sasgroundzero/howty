import { useSyncExternalStore } from 'react'
import type { Info, V3 } from './types'

/** Tiny external store so hovering a piece never re-renders the whole scene. */
export interface HoverHit {
  id: string
  info: Info
  point: V3
}
export const hoverStore = {
  hover: null as HoverHit | null,
  pinned: null as HoverHit | null,
  listeners: new Set<() => void>(),
  snapshot: { hover: null as HoverHit | null, pinned: null as HoverHit | null },
  emit() {
    this.snapshot = { hover: this.hover, pinned: this.pinned }
    this.listeners.forEach((l) => l())
  },
  setHover(h: HoverHit | null) {
    if (this.hover?.id === h?.id) return
    this.hover = h
    this.emit()
  },
  setPinned(h: HoverHit | null) {
    this.pinned = h
    this.emit()
  },
  clear() {
    if (!this.hover && !this.pinned) return
    this.hover = null
    this.pinned = null
    this.emit()
  },
}
const subscribe = (l: () => void) => {
  hoverStore.listeners.add(l)
  return () => {
    hoverStore.listeners.delete(l)
  }
}
export const useHover = () => useSyncExternalStore(subscribe, () => hoverStore.snapshot)
