/** El Grande: play a power card, pick an action card, and pour caballeros into the regions of Spain. */
import { C, L, On as OnBase, OnP, P, R, S, T, at, board, box, by, cubes, deck, discs, draw, f, ft, mv, pawns, pile, spawn, tabletop, zone } from '../compose'
import { gridUV } from '../layouts'

/** compose.On leaves `spread` unset, which the composer reads for every "on" placement, so set it here. */
const On = (...a: Parameters<typeof OnBase>) => ({ ...OnBase(...a), spread: [0, 0] as [number, number] })

const G = gridUV(3, 3)
const SEAT = ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a', '#7a4fa3']
const HOME: [number, number][] = [[0, 0], [2, 2], [2, 0], [0, 2], [1, 2]]

export const elGrande = tabletop('el-grande', 'El Grande', [2, 5], 4, '90–120 min', 'Medium', 'Move caballeros to rule the regions of Spain.', ['#d8c79a', '#c0392b', '#3a3a3a'], (n) => ({
  setup: [
    S('Board and Castillo', 'Lay out the map of Spain with its nine regions and stand the Castillo tower on its space.', 'c', [
      C(board('map', 11, 8, 'g:grid:3x3:#d8c79a:#a8713a:Spain', 'Map of Spain', 'Nine regions, each scoring points for the players with the most caballeros there. The scoring track runs round the edge. This grid is schematic.')),
      L(box('castillo', 1.2, 1.8, 1.2, '#8a6a4a', 'Castillo', 'A tower you can drop caballeros into. They stay hidden until a scoring round, then score and move out to a region you chose in secret.')),
    ]),
    S('Action card stacks', 'Sort the action cards by their backs into four stacks and shuffle each one. The single King\'s card forms a fifth stack.', 'r', [
      R(deck('act', 11, [1, 2, 3, 4].map((v) => f('#5a4634', `${v}`)).concat(f('#e0b12f', '♛', '#2b241c')), 'Action card stacks', 'Five stacks: four of 11 cards each and the lone King\'s card. Each card shows how many caballeros you may move onto the board and a special action.', { n: 5, gap: 0.2 })),
    ]),
    S('Pieces and power cards', 'Each player takes the Grande, the caballeros and the 13 power cards of one color, plus a secret region disc. Put 7 caballeros in your court, 1 on the start of the scoring track and 2 aside for your home region; the rest wait in the provinces.', 'you', [
      P(zone('court', 3.2, 1.1, 'Court', 'Caballeros in your court are ready to be placed on the board.'), zone('played', 1.1, 1.5, 'Power card', 'The power card you play this round goes here.')),
      P(
        pile('province', '$', 'Provinces', 'Your general supply. Caballeros must move from here to your court before they can reach the board.'),
        deck('power', 13, f('$', '⚑'), 'Power cards', '13 cards numbered 1 to 13. Each can be played once; high cards act first, low cards bring more caballeros to your court.'),
      ),
      On('court', 0.4, 0.5, cubes('cab', 7, '$', 'Caballeros in court', '7 of your caballeros start here.', { s: 0.22, gap: 0.1 })),
    ]),
    S('Home regions', 'Shuffle the region cards and turn the top one up for the King (next step). Each player then draws one of the rest and places their Grande and 2 caballeros in that region.', 'map', [
      R(deck('regions', 9, ft('#f3e7c5', 'REGION', '', '⌂'), 'Region cards', '9 cards, one per region. Used to assign home regions and the King\'s starting region.')),
      ...Array.from({ length: n }, (_, i) => [
        On('map', G(...HOME[i])[0] - 0.05, G(...HOME[i])[1], cubes(`grande${i}`, 1, SEAT[i], 'Grande', 'Your large cube. It marks your home region, which scores you a bonus if you lead there.', { s: 0.42 })),
        On('map', G(...HOME[i])[0] + 0.03, G(...HOME[i])[1], cubes(`start${i}`, 2, SEAT[i], 'Starting caballeros', '2 caballeros begin in your home region.', { s: 0.22, gap: 0.1 })),
      ]).flat(),
    ], 'The home regions shown are just an example draw.'),
    S('King and markers', 'Stand the King in the region turned up first. Put the round marker on round 1 and the two movable scoreboards beside the map.', 'map', [
      On('map', G(1, 1)[0], G(1, 1)[1], pawns('king', 1, '#3a3a3a', 'King', 'Nothing may be moved into or out of the King\'s region, and new caballeros may only enter regions next to it.', { scale: 0.8, shape: 'boss' })),
      OnP('map', 0.5, 0.975, discs('score', 1, 0.13, '$', 'Scoring marker', 'One of your caballeros, moved along the scoring track as you score.', { h: 0.08 }), [0.34, 0]),
    ]),
    S('Ready to play', 'The youngest player plays the first power card in round 1; after that, whoever acted last leads. The game lasts 9 rounds, with a scoring after rounds 3, 6 and 9.', 'all', [], n === 2 ? 'With 2 players only first place scores in each region (with 3, first and second): see the rulebook.' : 'Each round: reveal action cards, play power cards, then act in order from the highest power card down.'),
  ],
  turn: [
    T('Reveal the action cards', 'Turn the top card of each of the four stacks face up. The King\'s card is always available.', 'r', [0, 1, 2, 3].map((k) => draw(`act.${k}`, by(`act.${k}`, 0, -1.5), ft('#f3e7c5', `${k + 1}`, 'action', '⚔'), `shown${k}`))),
    T('Play power cards', 'Starting with the first player, everyone plays one power card face up. No two players may play the same number in a round.', 'you', [
      draw('power', at('played', 0.5, 0.5), ft('#f3e7c5', '9', 'power'), 'pc0'),
      draw('power@1', at('played@1', 0.5, 0.5), ft('#f3e7c5', '11', 'power'), 'pc1'),
    ]),
    T('Refill your court', 'When your turn comes, first move as many caballeros from the provinces to your court as your power card pictures. Here that is 2.', 'you', [
      spawn(cubes('fresh', 2, '$', 'New caballeros', 'Just arrived at court from the provinces.', { s: 0.22, gap: 0.1 }), at('court', 0.87, 0.5), 'province', SEAT[0]),
    ]),
    T('Take an action card and place', 'You choose one face-up action card. It lets you move up to the pictured number of caballeros from your court into regions next to the King, or into the Castillo, and use its special action before or after.', 'map', [
      mv('shown1', by('played', 1.3, 0)),
      mv('cab.0', at('map', G(1, 0)[0] - 0.03, G(1, 0)[1])),
      mv('cab.1', at('map', G(1, 0)[0] + 0.03, G(1, 0)[1])),
    ], 8),
    T('Scoring and the finish', 'After rounds 3, 6 and 9 everyone secretly picks a region for their Castillo caballeros, then the Castillo and all regions are scored for first, second and third place. The highest score after the ninth round wins.', 'all'),
  ],
}))
