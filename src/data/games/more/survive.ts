/** Survive: Escape from Atlantis! Get your people off a sinking island past sharks, whales and sea serpents. */
import { C, On, P, type Place, R, S, T, at, board, dice, hexes, hide, mv, pawns, pile, roll, spawn, tabletop, tiles, zone } from '../compose'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const SEAT = ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a']
const [BW, BD] = [12, 8.6]
const [HR, HGAP, COLS] = [0.45, 0.17, 8]
/** Offset of island tile k from the middle of the board, matching the composer's staggered grid. */
const cell = (k: number): [number, number] => {
  const row = Math.floor(k / COLS)
  return [((k % COLS) - (COLS - 1) / 2 + (row % 2 ? 0.5 : 0)) * (HR * 1.75 + HGAP), (row - 2) * (HR * 2 * 0.75 + HGAP)]
}
const seaUV = (k: number): [number, number] => [0.5 + cell(k)[0] / BW, 0.5 + cell(k)[1] / BD]
/** Mountains in the middle, forest round them, beach on the outside. */
const order = Array.from({ length: 40 }, (_, k) => k).sort((a, b) => Math.hypot(cell(a)[0] - 0.23, cell(a)[1] * 1.6) - Math.hypot(cell(b)[0] - 0.23, cell(b)[1] * 1.6))
const TERRAIN = Array.from({ length: 40 }, (_, k) => (order.indexOf(k) < 8 ? '#8d8d8d' : order.indexOf(k) < 24 ? '#4f8a4a' : '#e3cf96'))
const BOAT_AT: [number, number][][] = [[[0.24, 0.2], [0.4, 0.8]], [[0.78, 0.2], [0.6, 0.8]], [[0.24, 0.8], [0.4, 0.2]], [[0.78, 0.8], [0.6, 0.2]]]
const SERPENT_AT: [number, number][] = [[0.06, 0.08], [0.94, 0.08], [0.06, 0.92], [0.94, 0.92], [0.5, 0.07]]

export const survive = tabletop('survive', 'Survive: Escape from Atlantis!', [2, 4], 4, '45–60 min', 'Easy', 'Flee a sinking island past hungry sea monsters.', ['#2f7fa8', '#e3cf96', '#4f8a4a'], (n) => ({
  setup: [
    S('Unfold the board', 'Place the sea board in the middle of the table. The four corners are the safe islands everyone is trying to reach.', 'c', [
      C(board('sea', BW, BD, 'g:plain:0:#2f7fa8:#e9e4d8: ', 'Sea board', 'A grid of hexagonal sea spaces with an outlined area in the middle for the island and a safe island in each corner. This drawing is schematic.')),
    ]),
    S('Build the island', 'Mix the 40 land tiles and place them at random, land side up, to fill the outlined area in the middle of the board.', 'isle', [
      on('sea', 0.5, 0.5, hexes('isle', 40, HR, TERRAIN, 'Land tiles', '40 tiles: 16 beach, 16 forest and 8 mountain. Each has a secret effect on its underside, revealed when the tile sinks.', { cols: COLS, gap: HGAP, stagger: true })),
    ], 'Here the terrain is sorted for clarity and the island is drawn as a plain block. On the real board the tiles are mixed and follow the printed outline.'),
    S('Sea serpents', 'Place the 5 sea serpents on the sea spaces marked for them.', 'sea', SERPENT_AT.map(([u, v], i) =>
      on('sea', u, v, pawns(`serp${i}`, 1, '#2f6b3a', 'Sea serpent', 'One of 5 serpents. A serpent destroys a boat and everyone in it, and eats swimmers too.', { scale: 0.6, shape: 'boss' }))),
      'On the real board one serpent starts on the sea space in the middle of the island. It is drawn at the far edge here.'),
    S('Place your people', `Each player takes the 10 people of one color. Starting with the first player, take turns placing one person on any empty land tile until all ${n * 10} are on the island.`, 'isle',
      Array.from({ length: n * 10 }, (_, q) => {
        const [i, j] = [q % n, Math.floor(q / n)]
        return on(`isle.${((j * 4 + i) * 7) % 40}`, 0.5, 0.5, pawns(`m${i}_${j}`, 1, SEAT[i], i === 0 ? 'Your person' : `Player ${i + 1}'s person`, 'Each person has a value from 1 to 6 hidden underneath. You may look at it before placing them but never again afterwards.', { scale: 0.4 }))
      }),
      'Only one person may start on each tile. Try to remember where your valuable people are.'),
    S('Launch the boats', 'Again in turn order, each player places 2 empty boats on sea spaces next to the island.', 'sea',
      Array.from({ length: n * 2 }, (_, q) => {
        const [i, b] = [q % n, Math.floor(q / n)]
        return on('sea', ...BOAT_AT[i][b], tiles(`boat${i}_${b}`, 1, 0.8, 0.42, '#8a5a2b', 'Boat', 'Carries up to 3 people. Whoever has the most people aboard controls where it goes.', { h: 0.1 }))
      })),
    S('Creatures and die', 'Put the sharks, the whales, the spare boats and the creature die beside the board.', 'r', [
      R(pile('sharks', '#5a6a78', 'Sharks', '6 sharks. They appear when certain tiles sink and eat any swimmers they reach.', 'meeple'),
        pile('whales', '#27323d', 'Whales', '5 whales. A whale smashes a boat and leaves the people aboard swimming.', 'meeple'),
        dice('cdie', 1, '#c0392b', 'Creature die', 'Shows a shark, a whale or a sea serpent. You move one creature of the type rolled at the end of your turn.', { ink: '#ffffff', values: [1] })),
      P(zone('kept', 3.6, 1.4, 'Tiles in hand', 'Some sunken tiles are kept secretly in your hand and played at the start of a later turn.')),
    ]),
    S('Ready to play', 'The first player starts and play passes to the left. A turn has four parts, always in the same order.', 'all', [], 'Play a tile from your hand if you wish, move your people and boats up to 3 spaces in total, sink one land tile, then roll the creature die.'),
  ],
  turn: [
    T('Move: three moves', 'You have no tiles to play yet, so you go straight to moving. One of your people steps into a boat (1 move), then the boat sails 2 spaces towards a safe island.', 'sea', [
      mv('m0_0', at('boat0_0', 0.5, 0.5)),
      mv('boat0_0', at('sea', 0.15, 0.13), 1.4),
      mv('m0_0', at('boat0_0', 0.5, 0.5), 1.4),
    ], 8),
    T('Sink a land tile', 'You remove one tile. Beach tiles must all go before any forest, and forest before any mountain. You secretly check its underside: this one shows a shark, which appears in the gap at once.', 'isle', [
      hide('isle.0'),
      spawn(pawns('shark0', 1, '#5a6a78', 'Shark', 'A shark eats every swimmer in a space it enters. People in boats are safe from it.', { scale: 0.45 }), at('sea', ...seaUV(0)), 'sharks', undefined, 1),
    ]),
    T('Roll the creature die', 'You roll the creature die. It shows a sea serpent, so you move any one serpent 1 space.', 'sea', [roll('cdie', 3), mv('serp0', at('sea', 0.06, 0.2), 1)]),
    T('Next player', 'The player on your left does the same: a person boards a boat, and then the tile they left sinks. Anyone standing on a sinking tile ends up swimming.', 'isle', [
      mv('m1_0', at('boat1_0', 0.5, 0.5)),
      hide('isle.7', 1.4),
    ]),
    T('How it ends', 'The game ends at once when the volcano is revealed under one of the mountain tiles. Everyone still on the island or in the water is lost. Turn over the people you landed on the safe islands: the highest total value wins.', 'all', [], 8),
  ],
}))
