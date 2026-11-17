/** Helpers shared by the two-player card-game layouts (Pokémon TCG and Magic). */
import type { Builder } from '../../engine/builder'
import type { Face, Focus, Info, V3 } from '../../engine/types'
import { seatAt } from '../../engine/util'

export const CW = 0.9
export const CD = 1.26
export const ZONE_D = 1.6
/** Cards sit slightly above a zone's center so the zone label stays readable. */
export const CARD_DZ = -0.15

export const TCG_FOCUS: Record<string, Focus> = {
  overview: { pos: [0, 21, 15], target: [0, 0, 0.6] },
  mine: { pos: [0, 12.5, 12.5], target: [0, 0, 3.4] },
  theirs: { pos: [0, 13, 5.5], target: [0, 0, -3.6] },
  left: { pos: [-5.5, 8, 10], target: [-5.5, 0, 3.4] },
  right: { pos: [5.5, 8, 10], target: [5.5, 0, 3.2] },
  center: { pos: [0, 8.5, 8.5], target: [0, 0, 1.6] },
  hand: { pos: [0, 7.5, 11.5], target: [0, 0, 5.4] },
}

/** Two seats facing each other: 0 is you (near side), 1 is the opponent. */
export const SEAT = [
  { at: seatAt([0, 0, 4.0], 0), rot: 0, who: 'You', whose: 'Your' },
  { at: seatAt([0, 0, -4.0], Math.PI), rot: Math.PI, who: 'Opponent', whose: "Opponent's" },
]

/** Adds a labeled, translucent zone marker to a player's mat. */
export function zone(
  b: Builder, id: string, step: number, seat: number, lx: number, lz: number, w: number, label: string, info: Info, color: string, delay = 0,
) {
  const s = SEAT[seat]
  b.add({
    id: `${id}-${seat}`,
    kind: 'mat',
    props: { w, d: ZONE_D, color, opacity: 0.3, border: '#ffffff', dashed: true, label, labelAt: 'bottom', ink: '#ffffff' },
    keys: [{ step, pos: s.at(lx, 0.022, lz), rotY: s.rot, delay: delay + seat * 0.15 }],
    info: { title: `${s.whose} ${info.title}`, body: info.body },
  })
}

/** Where a card rests inside the zone centered at (lx, lz). */
export const inZone = (seat: number, lx: number, lz: number, y = 0.03): V3 => SEAT[seat].at(lx, y, lz + CARD_DZ)
export const handPos = (seat: number, j: number): V3 => SEAT[seat].at(-2.85 + j * 0.95, 0.03, 2.3)
export const card = (face: Face, back: Face, faceUp: boolean) => ({ w: CW, d: CD, face, back, faceUp })
