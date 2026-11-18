/** Hey, That's My Fish! Penguins slide across a shrinking ice floe, collecting the tile they leave each move. */
import { C, On, P, type Place, S, T, at, hexes, mv, pawns, tabletop, zone } from '../compose'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const SEAT = ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a']
const [ZW, ZD, PX, PZ] = [8.2, 7.2, 0.96, 0.85]
/** 8 rows that alternate 7 and 8 tiles: 60 in all. */
const CELLS = Array.from({ length: 8 }, (_, r) => Array.from({ length: r % 2 ? 8 : 7 }, (_, c) => [r, c, r % 2 ? 8 : 7])).flat()
const uv = (k: number): [number, number] => [0.5 + ((CELLS[k][1] - (CELLS[k][2] - 1) / 2) * PX) / ZW, 0.5 + ((CELLS[k][0] - 3.5) * PZ) / ZD]
/** Tiles where penguins start (always 1-fish tiles); the first two are used in the walkthrough. */
const START = [16, 33, 5, 53, 26, 43, 10, 47, 21]
/** 30 one-fish, 20 two-fish and 10 three-fish tiles, mixed in a fixed pattern. */
const FISH = (() => {
  const rest = [...Array(21).fill(1), ...Array(20).fill(2), ...Array(10).fill(3)] as number[]
  const mixed = rest.map((v, i) => [v, (i * 37 + 11) % 51] as const).sort((a, b) => a[1] - b[1]).map((x) => x[0])
  let q = 0
  return CELLS.map((_, k) => (START.includes(k) ? 1 : mixed[q++]))
})()
const tile = (k: number) => hexes(`ice${k}`, 1, 0.45, '#dcecf3', `Ice tile: ${FISH[k]} fish`, 'One of 60 tiles: 30 show 1 fish, 20 show 2 and 10 show 3. When a penguin leaves a tile, its owner takes it.', { label: `${FISH[k]}` })

export const heyThatsMyFish = tabletop('hey-thats-my-fish', 'Hey, That\'s My Fish!', [2, 4], 4, '20 min', 'Easy', 'Penguins grab fish as the ice melts away.', ['#dcecf3', '#2e6fb7', '#3a3a3a'], (n) => {
  const each = n === 2 ? 4 : n === 3 ? 3 : 2
  return {
    setup: [
      S('Start the ice floe', 'Shuffle the 60 hexagonal ice tiles face down, then turn them face up and lay them out in rows that alternate between 7 and 8 tiles, starting with a row of 7.', 'c', [
        C(zone('floe', ZW, ZD, 'Ice floe', 'The 60 tiles fit together here in 8 rows.')),
        ...CELLS.map((c, k) => k).filter((k) => CELLS[k][0] < 4).map((k) => on('floe', ...uv(k), tile(k))),
      ], 'The tiles are drawn with gaps between them. On a real table they touch.'),
      S('Finish the ice floe', 'Keep going until all 8 rows are down and every tile is used.', 'c',
        CELLS.map((c, k) => k).filter((k) => CELLS[k][0] >= 4).map((k) => on('floe', ...uv(k), tile(k)))),
      S('Take your penguins', `Each player chooses a color. With ${n} players you each use ${each} penguins.`, 'you', [
        P(zone('catch', 4.2, 1.4, 'Your catch', 'Stack the tiles you collect here. Their fish are your score.')),
      ], 'Two players use 4 penguins each, three players use 3 each and four players use 2 each.'),
      S('Place the penguins', 'Starting with the youngest player and going clockwise, take turns placing one penguin on any empty tile that shows exactly 1 fish, until all are placed.', 'c',
        Array.from({ length: n * each }, (_, q) => {
          const [i, j] = [q % n, Math.floor(q / n)]
          return on(`ice${START[q]}`, 0.5, 0.5, pawns(`pen${i}_${j}`, 1, SEAT[i], i === 0 ? 'Your penguin' : `Player ${i + 1}'s penguin`, 'Slides in a straight line across the ice. A penguin that can no longer move is stuck where it is.', { scale: 0.45 }))
        })),
      S('Ready to play', 'The youngest player moves first, then play passes clockwise.', 'all', [], 'On your turn you move one of your penguins, then take the tile it started on.'),
    ],
    turn: [
      T('Slide a penguin', 'You move one penguin in a straight line in any of the six directions, as far as you like. It cannot change direction, jump a gap or pass another penguin.', 'c', [mv('pen0_0', at('ice19', 0.5, 0.5))]),
      T('Take the tile you left', 'You pick up the tile your penguin started on and keep it. It leaves a hole that no penguin can cross.', 'you', [mv('ice16', at('catch', 0.2, 0.5))]),
      T('Next player', 'The player on your left slides a penguin along a diagonal line and collects the tile it left.', 'c', [
        mv('pen1_0', at('ice49', 0.5, 0.5)),
        mv('ice33', at('catch@1', 0.2, 0.5), 1.5),
      ]),
      T('Stuck penguins', 'As holes spread, penguins get cut off. If none of your penguins can move you are out of the round, and you remove them and take the tiles they stand on.', 'c'),
      T('How it ends', 'The game ends when nobody can move. Count the fish on your tiles: the most fish wins, and a tie goes to whoever has more tiles.', 'all'),
    ],
  }
})
