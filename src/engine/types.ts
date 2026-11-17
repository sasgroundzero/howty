/**
 * The game schema. Everything here is plain JSON-serializable data: a game is
 * a list of steps plus a list of pieces, and each piece lists (per step) where
 * it rests and which props it has. The engine and the custom-rulebook generator
 * both speak only this format.
 */
export type V3 = [number, number, number]

export interface Info {
  title: string
  body: string
}

/** A canvas-drawn card/sheet face. No image assets anywhere. */
export interface Face {
  bg?: string
  panel?: string
  border?: string
  ink?: string
  title?: string
  sub?: string
  glyph?: string
  /** id of a registered drawing routine (see ART in pieces/common) */
  art?: string
  lines?: string[]
}

export type DieSides = 4 | 6 | 8 | 10 | 12 | 20 | 100
export type CatanResource = 'lumber' | 'brick' | 'wool' | 'grain' | 'ore'
export type CatanTerrain = 'forest' | 'hills' | 'pasture' | 'fields' | 'mountains' | 'desert'

/** Props for every reusable 3D primitive, keyed by piece kind. */
export interface KindProps {
  card: { w: number; d: number; face: Face; back?: Face; faceUp?: boolean }
  stack: { w: number; d: number; count: number; face: Face; per?: number }
  die: { sides: DieSides; value: number; color: string; ink: string; text?: string; size?: number }
  token: { r: number; h: number; color: string; label?: string; ink?: string; upright?: boolean }
  mini: { color: string; shape?: 'hero' | 'brute' | 'boss'; scale?: number }
  block: { w: number; h: number; d: number; color: string; round?: boolean; top?: Face }
  hex: { r: number; h?: number; color: string; label?: string }
  mat: {
    w: number
    d: number
    color: string
    border?: string
    label?: string
    labelAt?: 'center' | 'corner' | 'bottom'
    ink?: string
    /** grid cell size in world units */
    grid?: number
    /** below 1 turns the mat into a see-through zone marker */
    opacity?: number
    dashed?: boolean
  }
  screen: { w: number; h: number; color: string; label?: string }
  catanFrame: { k: number }
  catanWater: Record<string, never>
  catanTile: { terrain: CatanTerrain; seed: number }
  catanNumber: { n: number }
  catanHarbor: { type: CatanResource | null; planks: [number, number][] }
  catanPiece: { shape: 'settlement' | 'city' | 'road' | 'robber'; color: string }
  bgBoard: { open: number }
  /** a flat (or tilted) game board whose top is drawn by a registered ART routine */
  board: { w: number; d: number; art: string; h?: number; edge?: string; tilt?: number }
  chess: { type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'; color: string }
  /** a polyomino: cell [i, j] sits at x = i * size, z = -j * size */
  poly: { cells: [number, number][]; size: number; h: number; color: string }
  /** an upright grid of holes that discs drop into */
  c4frame: { cols: number; rows: number; cell: number; color: string }
}
export type Kind = keyof KindProps

/** "From this step onward, the piece rests here (with these prop overrides)." */
export interface Key<K extends Kind = Kind> {
  step: number
  pos: V3
  rotY?: number
  /** seconds to wait after the step starts, used to sequence pieces */
  delay?: number
  props?: Partial<KindProps[K]>
  /** the piece leaves the table from this step on */
  hide?: boolean
}

export interface PieceSpec<K extends Kind = Kind> {
  id: string
  kind: K
  props: KindProps[K]
  keys: Key<K>[]
  /** if set, the piece flies in from here instead of dropping from above */
  spawnFrom?: V3
  tumble?: boolean
  info?: Info
}
export type AnyPiece = { [K in Kind]: PieceSpec<K> }[Kind]

export interface Focus {
  pos: V3
  target: V3
}

export interface StepDef {
  title: string
  instruction: string
  detail?: string
  needs?: string[]
  focus: Focus
  /** seconds this step stays on screen during "Simulate First Turn" */
  duration?: number
}

export interface TableDef {
  w: number
  d: number
  tint?: string
}

export interface GameSetup {
  table: TableDef
  /** setup steps first, then the first-turn simulation steps */
  steps: StepDef[]
  /** how many of `steps` are setup; the rest are the simulation */
  setupCount: number
  pieces: AnyPiece[]
}

export interface GameMeta {
  title: string
  players: [number, number]
  defaultPlayers: number
  playTime: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  blurb: string
  swatch: string[]
}

export interface GameDef {
  id: string
  meta: GameMeta
  custom?: boolean
  build: (players: number) => GameSetup
}
