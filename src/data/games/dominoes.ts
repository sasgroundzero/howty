/** Dominoes (double-six draw game): 28 tiles, a hand each, and a boneyard. */
import type { PieceSpec, V3 } from '../../engine/types'
import { Kit, OVER, WIDE, game, info, look, seats } from './kit'

/** Deal order: the first three are scripted for the opening plays, the rest fill in. */
const SCRIPT: [number, number][] = [[6, 6], [6, 3], [2, 6]]
const ALL: [number, number][] = [...SCRIPT]
for (let a = 0; a <= 6; a++) for (let c = a; c <= 6; c++) if (!SCRIPT.some(([x, y]) => (x === a && y === c) || (x === c && y === a))) ALL.push([a, c])
const BONE = '#f6f1e4'

function build(n: number) {
  const b = new Kit()
  const hand = n === 2 ? 7 : 5
  const S = seats(n, 7.4, 6.6)
  const MID = look(0, 0, 8)
  const MINE = look(0, 6.6, 6)
  const MIX = b.s('Shuffle the tiles', 'Turn all 28 dominoes face down on the table and mix them around with your hands.', MID, 'A double-six set has one tile for every pair of numbers from blank (0) to 6.', ['28 dominoes'])
  const DRAW = b.s('Draw your hand', `Each player draws ${hand} tiles and stands them on edge facing themselves so nobody else can see the dots.`, MINE, 'Two players take 7 tiles each; three or four players take 5 each.', [`${hand} tiles each`])
  const YARD = b.s('Leave the boneyard', `Push the ${28 - hand * n} tiles that are left to the far edge of the play area, still face down. This is the boneyard.`, look(0, -2.6, 7), 'You draw from the boneyard whenever you cannot play.')
  b.s('Ready to play', 'You are set up: the player holding the highest double plays it to start the line.', OVER, 'Be the first to play all of your tiles.')

  const tiles: PieceSpec<'block'>[] = []
  ALL.forEach(([a, c], i) => {
    const seat = i < hand * n ? i % n : -1
    const j = Math.floor(i / n)
    const k = (i * 11) % 28
    const t = b.add({
      id: `dom-${i}`, kind: 'block',
      props: { w: 0.6, h: 0.14, d: 1.2, color: BONE },
      keys: [{ step: MIX, pos: [((k % 7) - 3) * 0.8, 0, (Math.floor(k / 7) - 1.5) * 1.4], rotY: ((k * 7) % 5) * 0.12 - 0.24, delay: k * 0.03 }],
      info: seat === 0 ? info(`Your ${a}-${c}`, 'One of the tiles in your hand. Play it when one of its ends matches an open end of the line.')
        : info(seat < 0 ? 'Boneyard tile' : 'Hidden tile', seat < 0 ? 'Face down in the boneyard, waiting to be drawn.' : 'In another player’s hand.'),
    })
    if (seat >= 0)
      t.keys.push({ step: DRAW, pos: S[seat].at((j - (hand - 1) / 2) * 0.72, 0, 0), rotY: S[seat].rot, delay: j * 0.12 + seat * 0.25, props: seat === 0 ? { top: { art: `dom:${a}-${c}` } } : undefined })
    else {
      const q = i - hand * n
      t.keys.push({ step: YARD, pos: [((q % 7) - 3) * 0.78, 0, -3.3 + Math.floor(q / 7) * 1.4] as V3, rotY: 0, delay: q * 0.05 })
    }
    tiles.push(t)
  })
  const lay = (i: number, step: number, x: number, rotY: number, art: string) =>
    tiles[i].keys.push({ step, pos: [x, 0, 0], rotY, delay: 0.6, props: { top: { art } } })
  lay(0, b.t('Highest double leads', 'You hold the double six, the highest tile, so you place it face up in the middle of the table.', MID), 0, 0, 'dom:6-6')
  lay(1, b.t('Match an open end', 'The player on your left adds the 6-3, with its 6 touching your double.', MID), 0.93, Math.PI / 2, 'dom:6-3')
  lay(2, b.t('Play on either end', `${n === 2 ? 'You play' : 'The next player plays'} the 6-2 against the other side of the double, so the open ends are now 2 and 3.`, MID, 7), -0.93, Math.PI / 2, 'dom:2-6')
  b.t('Doubles go crosswise', 'Doubles are laid across the line, while every other tile is laid end to end.', look(0, 0, 6))
  b.t('Cannot play? Draw', 'If none of your tiles match an open end, draw from the boneyard until you can play, or pass if it is empty.', look(0, -2.6, 7))
  b.t('Go out to win', 'The first player to play their last tile wins the round and scores the dots left in everyone else’s hands.', WIDE)
  return b.done({ w: 30, d: 20 })
}

export const dominoes = game('dominoes', 'Dominoes', [2, 4], 2, '15–30 min', 'Easy', 'Match ends and play out your hand.', ['#f6f1e4', '#2b241c', '#8a5a3c'], build)
