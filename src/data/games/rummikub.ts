/** Rummikub: 106 number tiles, 14 on each rack, and a pool to draw from. */
import type { PieceSpec, V3 } from '../../engine/types'
import { Kit, OVER, WIDE, game, info, look, seats } from './kit'

const INKS = ['#c0392b', '#2e6fb7', '#d98c1f', '#22201f']
const IVORY = '#f3ead2'
/** Your 14 tiles: [number, color index]. The first three are the opening meld. */
const MINE: [number, number][] = [[9, 0], [10, 0], [11, 0], [3, 1], [3, 3], [5, 2], [6, 2], [12, 1], [1, 3], [8, 1], [13, 2], [2, 0], [7, 3], [4, 1]]

function build(n: number) {
  const b = new Kit()
  const S = seats(n, 8, 7.4)
  const POOL = look(0, 0, 10)
  const RACK = look(0, 7.4, 6)
  const MIX = b.s('Mix the tiles', 'Turn all 106 tiles face down in the middle of the table and mix them up. This is the pool.', POOL, 'There are two sets of tiles numbered 1 to 13 in four colors, plus 2 jokers.', ['104 number tiles', '2 jokers'])
  const RACKS = b.s('Hand out the racks', 'Give every player a rack to hold their tiles.', WIDE, undefined, [`${n} racks`])
  const FIRST = b.s('Draw to see who starts', 'Each player draws one tile from the pool: the highest number goes first. Mix those tiles back in.', POOL)
  const DEAL = b.s('Draw 14 tiles', 'Each player takes 14 tiles from the pool and arranges them on their rack, hidden from the other players.', RACK, 'Sorting them into matching numbers and same-color runs makes it easier to spot plays.', ['14 tiles each'])
  b.s('Ready to play', `You are set up: ${106 - 14 * n} tiles stay face down in the pool, and play passes to the left.`, WIDE, 'Be the first to play every tile from your rack.')

  S.forEach((s) => b.box(`rack-${s.i}`, RACKS, s.at(0, 0, 1.2), 4.6, 0.5, 0.4, '#3a6ea5', info(`${s.whose} rack`, 'Holds your tiles facing you. Everyone starts with 14.'), { rotY: s.rot, delay: s.i * 0.12 }))
  const slot = (k: number): V3 => [((k % 14) - 6.5) * 0.52, 0, (Math.floor(k / 14) - 3.5) * 0.68]
  const mine: PieceSpec<'block'>[] = []
  for (let i = 0; i < 106; i++) {
    const seat = i < 14 * n ? i % n : -1
    const j = Math.floor(i / n)
    const you = seat === 0
    const t = b.add({
      id: `tile-${i}`, kind: 'block',
      props: { w: 0.44, h: 0.1, d: 0.6, color: IVORY },
      keys: [{ step: MIX, pos: slot((i * 37) % 106), delay: ((i * 37) % 106) * 0.006 }],
      info: you ? info(`${['Red', 'Blue', 'Orange', 'Black'][MINE[j][1]]} ${MINE[j][0]}`, 'One of your 14 tiles. It is worth its number in points.') : info(seat < 0 ? 'Pool tile' : 'Hidden tile', seat < 0 ? 'Face down in the pool. If you cannot or will not play on your turn, you draw one of these.' : 'On another player’s rack. You see it only when it is played.'),
    })
    if (seat >= 0)
      t.keys.push({
        step: DEAL, pos: S[seat].at(((j % 7) - 3) * 0.5, 0, j < 7 ? -0.3 : 0.4), rotY: S[seat].rot, delay: j * 0.07 + seat * 0.2,
        props: you ? { top: { bg: IVORY, ink: INKS[MINE[j][1]], glyph: String(MINE[j][0]) } } : undefined,
      })
    if (you) mine.push(t)
  }
  void FIRST

  const T1 = b.t('Find your first meld', 'Your first play must be worth at least 30 points using only tiles from your own rack.', RACK, 7)
  const T2 = b.t('Play a run', 'You lay down the red 9, 10 and 11: a run of three in one color, worth 9 + 10 + 11 = 30 points.', look(0, 2.6, 7), 8)
  mine.slice(0, 3).forEach((t, k) => t.keys.push({ step: T2, pos: [(k - 1) * 0.5, 0, 3.6], rotY: 0, delay: 0.5 + k * 0.3 }))
  const T3 = b.t('No play? Draw a tile', 'The next player cannot make 30 points yet, so they draw one tile from the pool and their turn ends.', WIDE, 7)
  const spare = b.pieces.find((p) => p.id === `tile-${14 * n}`) as PieceSpec<'block'>
  spare.keys.push({ step: T3, pos: S[1].at(2.2, 0, 0.05), rotY: S[1].rot, delay: 0.6 })
  b.t('Runs and groups', 'A run is three or more consecutive numbers in one color; a group is three or four of the same number in different colors. A 1 is always low: it cannot follow 13.', look(0, 2.6, 7), 7)
  b.t('Rearrange the table', 'On turns after your first meld, you may add to, split and rebuild any sets on the table, as long as every set is valid when you finish.', OVER, 7)
  b.t('Empty your rack', 'The first player to play their last tile calls "Rummikub!" and wins the game.', OVER)
  void T1
  return b.done({ w: 32, d: 22 })
}

export const rummikub = game('rummikub', 'Rummikub', [2, 4], 4, '45–60 min', 'Easy', 'Meld runs and groups to empty your rack.', ['#3a6ea5', '#f3ead2', '#c0392b'], build)
