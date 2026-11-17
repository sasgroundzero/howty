/** Piece registry: maps every schema `kind` to the component that draws it. */
import type { FC } from 'react'
import type { Kind, KindProps } from '../../engine/types'
import { Block, Card, Die, Hex, Mat, Mini, Screen, Stack, Token } from './basic'
import { CatanHarbor, CatanNumber, CatanPiece, CatanTile, CatanWater, FramePieceK } from './catan'
import { BackgammonBoard } from './backgammon'
import { Board, C4Frame, ChessPiece, Poly } from './extra'

export const PIECES: { [K in Kind]: FC<KindProps[K]> } = {
  card: Card,
  stack: Stack,
  die: Die,
  token: Token,
  mini: Mini,
  block: Block,
  hex: Hex,
  mat: Mat,
  screen: Screen,
  catanFrame: FramePieceK,
  catanWater: CatanWater,
  catanTile: CatanTile,
  catanNumber: CatanNumber,
  catanHarbor: CatanHarbor,
  catanPiece: CatanPiece,
  bgBoard: BackgammonBoard,
  board: Board,
  chess: ChessPiece,
  poly: Poly,
  c4frame: C4Frame,
}

export function PieceView({ kind, props }: { kind: Kind; props: object }) {
  const C = PIECES[kind] as FC<object>
  return <C {...props} />
}
