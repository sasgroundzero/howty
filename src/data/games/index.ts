import type { GameDef } from '../../engine/types'
import { catan } from './catan'
import { backgammon } from './backgammon'
import { dnd } from './dnd'
import { pokemon } from './pokemon'
import { mtg } from './mtg'
import { chess } from './chess'
import { checkers } from './checkers'
import { monopoly } from './monopoly'
import { scrabble } from './scrabble'
import { clue } from './clue'
import { battleship } from './battleship'
import { trivia } from './trivia'
import { candyland } from './candyland'
import { rummikub } from './rummikub'
import { life } from './life'
import { othello } from './othello'
import { pictionary } from './pictionary'
import { risk } from './risk'
import { stratego } from './stratego'
import { mancala } from './mancala'
import { connect4 } from './connect4'
import { blokus } from './blokus'
import { cranium } from './cranium'
import { dominoes } from './dominoes'
import { MORE } from './more'

/** The built-in library. Custom games made from pasted rules are added at runtime. */
export const GAMES: GameDef[] = [
  catan, backgammon, dnd, pokemon, mtg,
  chess, checkers, monopoly, scrabble, clue, battleship, trivia, candyland, rummikub, life,
  othello, pictionary, risk, stratego, mancala, connect4, blokus, cranium, dominoes,
  ...MORE,
]
