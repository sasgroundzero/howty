import type { AnyPiece, GameSetup, Kind, PieceSpec, StepDef, TableDef } from './types'

/** Small helper for authoring a GameSetup: steps return their index, pieces are type-checked per kind. */
export class Builder {
  steps: StepDef[] = []
  pieces: AnyPiece[] = []
  setupCount = 0

  /** Adds a setup step and returns its index. */
  step(s: StepDef): number {
    this.steps.push(s)
    this.setupCount = this.steps.length
    return this.steps.length - 1
  }

  /** Adds a "Simulate First Turn" step (call only after every setup step). */
  turn(s: StepDef): number {
    this.steps.push({ duration: 6, ...s })
    return this.steps.length - 1
  }

  add<K extends Kind>(p: PieceSpec<K>): PieceSpec<K> {
    this.pieces.push(p as unknown as AnyPiece)
    return p
  }

  done(table: TableDef = { w: 38, d: 23 }): GameSetup {
    return { table, steps: this.steps, setupCount: this.setupCount, pieces: this.pieces }
  }
}
