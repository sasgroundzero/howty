/** Scrabble: a 15x15 board, a bag of 100 letter tiles and a rack of 7 each. */
import type { PieceSpec } from '../../engine/types'
import { BH, Kit, OVER, TOP, WIDE, cells, game, info, look, seats } from './kit'
import { SQ15, sqSize } from './layouts'

const VALUE: Record<string, number> = { H: 4, O: 1, U: 1, S: 1, E: 1, T: 1, A: 1 }
const WOOD = '#ecd9a8'
function build(n: number) {
  const b = new Kit()
  const g = cells(15, 15, SQ15.cell)
  const size = sqSize(SQ15.n, SQ15.cell, SQ15.margin)
  const S = seats(n, 8.4, 8.2)
  const MINE = look(0, 7.6, 6)
  const BAGF = look(8.4, -4.6, 6)
  const BOARD = b.s('Place the board', 'Put the board in the middle of the table so everyone can read it.', OVER, 'The colored squares multiply the score of a letter or a whole word placed on them.', ['1 board'])
  const BAG = b.s('Fill the tile bag', 'Put all 100 letter tiles into the bag and give it a good shake.', BAGF, 'There are 98 letters, each with a point value, plus 2 blank tiles that can stand for any letter.', ['100 tiles', '1 bag'])
  const RACKS = b.s('Give everyone a rack', 'Each player takes a tile rack and sets it up facing themselves.', WIDE, undefined, [`${n} racks`])
  const FIRST = b.s('Draw to see who starts', 'Each player draws one tile: the letter closest to A goes first. Put those tiles back and shake the bag again.', BAGF, 'A blank beats every letter.')
  const DRAW = b.s('Draw seven tiles', 'Starting with the first player, everyone draws 7 tiles and stands them on their rack, hidden from the others.', MINE, undefined, ['7 tiles each'])
  const PAD = b.s('Pick a scorekeeper', 'One player takes the score pad and a pencil and writes everyone’s name across the top.', WIDE, undefined, ['Score pad', 'Pencil'])
  b.s('Ready to play', 'You are set up: the first word must cross the star in the center of the board.', WIDE, `The bag now holds ${100 - 7 * n} tiles. Highest score when the tiles run out wins.`)

  b.board('board', BOARD, size, size, 'b:words', info('Board', '225 squares. Premium squares double or triple a letter (DL, TL) or a whole word (DW, TW). The center star is a double-word square. There is 1.'), { edge: '#2f5d50' })
  const bag = b.box('bag', BAG, [8.4, 0, -4.6], 1.9, 1.1, 1.9, '#5b3f77', info('Tile bag', 'Holds all 100 tiles so that nobody can see what they draw. After each turn you refill your rack to 7 from here.'), { round: true })
  void bag
  S.forEach((s) => b.box(`rack-${s.i}`, RACKS, s.at(0, 0, 0.7), 5, 0.3, 0.45, '#8a5a3c', info(`${s.whose} rack`, 'Holds up to 7 tiles facing their owner. Nobody else may see them.'), { rotY: s.rot, delay: s.i * 0.12 }))
  const mine: PieceSpec<'block'>[] = []
  S.forEach((s) =>
    'HOUSETA'.split('').forEach((ch, j) => {
      const you = s.i === 0
      const t = b.add({
        id: `tile-${s.i}-${j}`, kind: 'block', spawnFrom: [8.4, 1.2, -4.6],
        props: { w: 0.6, h: 0.12, d: 0.6, color: WOOD, top: you ? { bg: WOOD, glyph: ch, sub: String(VALUE[ch]) } : undefined },
        keys: [{ step: DRAW, pos: s.at((j - 3) * 0.66, 0, 0), rotY: s.rot, delay: s.i * 0.3 + j * 0.1 }],
        info: you ? info(`Letter ${ch}`, `Worth ${VALUE[ch]} point${VALUE[ch] > 1 ? 's' : ''}. Only you can see your tiles.`) : info('Hidden tile', 'Another player’s tile. You only see it when it is played on the board.'),
      })
      if (you) mine.push(t)
    }),
  )
  b.sheet('pad', PAD, S[0].at(4.3, 0, 0.2), 1.3, 1.8, { bg: '#fbf6ea', border: '#2f5d50', title: 'SCORES', lines: Array.from({ length: n }, (_, i) => `P${i + 1}  ____`) }, info('Score pad', 'Add up each turn’s score and keep a running total for every player.'))
  void FIRST

  const T1 = b.t('Spell the first word', 'You play H-O-U-S-E across the middle row so that one of the letters covers the center star.', look(0, 0, 7), 8)
  mine.slice(0, 5).forEach((t, j) => t.keys.push({ step: T1, pos: g(5 + j, 7, BH), rotY: 0, delay: 0.5 + j * 0.35 }))
  b.t('Add up the score', 'Add the letter values (4 + 1 + 1 + 1 + 1 = 8), then double it because the star is a double-word square: 16 points.', TOP, 8)
  const T3 = b.t('Refill your rack', 'You draw 5 new tiles from the bag to bring your rack back up to 7, and your turn is over.', MINE, 7)
  'RINGL'.split('').forEach((ch, j) =>
    b.add({ id: `new-${j}`, kind: 'block', spawnFrom: [8.4, 1.2, -4.6], props: { w: 0.6, h: 0.12, d: 0.6, color: WOOD, top: { bg: WOOD, glyph: ch, sub: ch === 'G' ? '2' : '1' } }, keys: [{ step: T3, pos: S[0].at((j - 3) * 0.66, 0, 0), delay: 0.4 + j * 0.15 }], info: info(`Letter ${ch}`, 'A freshly drawn tile.') }),
  )
  b.t('Build on what is there', 'The next player must add tiles that connect to a word already on the board, and every new row of letters must spell a real word.', look(0, 0, 8), 7)
  b.t('Use every tile', 'Play continues until the bag is empty and someone uses their last tile. Highest total score wins.', OVER)
  return b.done({ w: 34, d: 23 })
}

export const scrabble = game('scrabble', 'Scrabble', [2, 4], 2, '60–90 min', 'Medium', 'Spell crossing words for the highest score.', ['#2f5d50', '#d9584a', '#ecd9a8'], build)
