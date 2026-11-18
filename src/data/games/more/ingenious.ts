/** Ingenious: a hex board, racks of six double-hex tiles and a six-color score board each. */
import { C, On, P, R, S, T, at, board, box, cubes, discs, f, mat, mv, spawn, tabletop, tiles } from '../compose'
import { hexUV } from '../layouts'

const SIX = ['#c0392b', '#3d8b4a', '#2e6fb7', '#d9772b', '#e0b12f', '#7a4fa3']
const NAMES = ['red', 'green', 'blue', 'orange', 'yellow', 'purple']
const face = (glyph: string, ink: string) => ({ bg: '#f4eedd', border: '#2b241c', ink, title: '', sub: '', glyph })
const RACK = [face('● ▲', SIX[0]), face('★ ★', SIX[4]), face('◆ ●', SIX[2]), face('▲ ◆', SIX[1]), face('✦ ★', SIX[5]), face('● ✦', SIX[3])]
const cell = hexUV(11, 9)
const pair = (c: number, r: number): [number, number] => [(cell(c, r)[0] + cell(c + 1, r)[0]) / 2, cell(c, r)[1]]
const STARTS: [number, number][] = [[2, 0], [7, 0], [0, 4], [10, 4], [2, 8], [7, 8]]
const TILE = 'A domino of two hexagons, each showing one of the six colored symbols. 120 tiles in the game.'

export const ingenious = tabletop('ingenious', 'Ingenious', [2, 4], 2, '45 min', 'Easy', 'Line up colors; your weakest color is your score.', ['#f4eedd', '#c0392b', '#2e6fb7'], (n) => ({
  setup: [
    S('Lay out the board', `Put the board in the middle. With ${n} players you use ${n === 2 ? 'only the inner area' : n === 3 ? 'the inner area plus the first outer ring' : 'the whole board'}.`, 'c', [
      C(board('grid', 10, 8, 'g:hex:11x9:#f4eedd:#b9b09a:Hex board', 'Board', 'A large hexagon of hex spaces. The playing area grows with the number of players: inner area for 2, one extra ring for 3, everything for 4. This drawing is schematic.')),
    ]),
    S('Find the six start symbols', 'Six spaces near the corners are printed with one symbol each. Your first tile must go next to one of them that no tile touches yet.', 'grid',
      STARTS.map(([c, r], k) => On('grid', ...cell(c, r), discs(`sym${k}`, 1, 0.26, SIX[k], `Printed ${NAMES[k]} symbol`, 'One of six symbols printed on the board, one per color. They count for scoring just like symbols on tiles.', { h: 0.03 })))),
    S('Fill the bag', 'Put all 120 tiles in the bag and shake it.', 'r', [
      R(box('bag', 1.6, 0.9, 1.6, '#4a5a6a', 'Tile bag', 'Holds the 120 double-hex tiles. You draw from it without looking.', { round: true })),
    ]),
    S('Take a rack and six tiles', 'Each player takes a rack, draws 6 tiles from the bag and stands them on the rack so that only they can see them.', 'you', [
      P(mat('rack', 4.9, 1.7, '$', 'Rack', 'Tile rack', 'Holds your 6 tiles out of sight of the other players.')),
      On('rack', 0.5, 0.5, tiles('tile', 6, 1.4, 0.6, RACK, 'Tile', TILE, { cols: 3 })),
    ]),
    S('Set up your score board', 'Each player takes a score board and puts one peg of each of the six colors on 0.', 'score', [
      P(mat('score', 4.9, 2, '$', 'Score 0 to 18', 'Score board', 'Six tracks, one per color, running from 0 to 18.')),
      On('score', 0.5, 0.85, cubes('peg', 6, SIX, 'Score peg', 'One peg per color. It moves up its track whenever you score that color.', { s: 0.22, gap: 0.5 })),
    ]),
    S('Ready to play', 'The youngest player starts; play passes clockwise.', 'all', [], 'On your turn place one tile on two free spaces, score both halves, then draw back up to 6 tiles.'),
  ],
  turn: [
    T('Place your first tile', 'On your first turn your tile must touch a printed start symbol that has no tile next to it yet. You put a red and blue tile beside the red symbol.', 'grid', [mv('tile.0', at('grid', ...pair(3, 0)))]),
    T('Score each half', 'For each half of your tile, count the matching symbols in straight lines leading away from it, not counting the tile itself. Your red half touches the red symbol, so red moves up 1.', 'score', [mv('peg.0', at('score', 0.5 - (2.5 * 0.72) / 4.9, 0.72))]),
    T('Refill your rack', 'You draw 1 tile from the bag so that you have 6 again.', 'rack', [
      spawn(tiles('fresh', 1, 1.4, 0.6, face('▲ ●', SIX[1]), 'Tile', TILE), at('tile', 0.156, 0.224, -0.08), 'bag'),
    ], 6),
    T('The next player', 'The player on your left places beside a different start symbol and scores in the same way.', 'grid', [
      mv('tile.1@1', at('grid', ...pair(8, 4))),
      mv('peg.4@1', at('score@1', 0.5 + (1.5 * 0.72) / 4.9, 0.72)),
    ]),
    T('Ingenious!', 'When one of your colors reaches 18 you call "Ingenious!" and at once place and score another tile before refilling. If, before refilling, your rack has no tile in your lowest color, you may show it and swap all your tiles.', 'score'),
    T('How it ends', 'The game ends when no more tiles fit on the board, or at once if a player reaches 18 in all six colors and wins. Compare each player’s lowest color: the highest of those wins, with the next lowest breaking ties.', 'all'),
  ],
}))
