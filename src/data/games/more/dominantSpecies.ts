/** Dominant Species: terrain hexes round a tundra centre, an action display, and species cubes for each animal. */
import { C, L, On as On0, OnP, P, R, S, T, at, board, box, by, cards, cubes, deck, discs, draw, f, ft, hexes, hide, mat, mv, pawns, pile, spawn, tabletop } from '../compose'
import type { Item, Place } from '../compose'
import { hexUV, slotUV } from '../layouts'

/** On() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })

const H = hexUV(5, 5)
const SLOT = slotUV(3, 6)
const PC = ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a', '#7a4fa3', '#d9772b']
const RING: [number, number][] = [[1, 1], [2, 1], [3, 2], [2, 3], [1, 3], [1, 2]]
const LAND = ['#e3c98a', '#3d8b4a', '#2f6b3a', '#8a8f98', '#c9b45a', '#6fa8a0']
const LNAME = ['Desert', 'Forest', 'Jungle', 'Mountain', 'Savannah', 'Wetland']
const ELEMENT = ['#3d8b4a', '#e0b12f', '#5fa8d3', '#c0392b', '#e9e4d8', '#8a5a34']
const DOM = ft('#f3e7c5', 'DOM', 'event', '✦')

export const dominantSpecies = tabletop('dominant-species', 'Dominant Species', [2, 6], 4, '2–4 hours', 'Hard', 'Adapt your animals before the ice age.', ['#6fa8a0', '#e9e4d8', '#3d8b4a'], (n) => {
  const ap = 9 - n
  const cubesEach = 65 - 5 * n
  return {
    setup: [
      S('Board and starting terrain', 'Place the board. Build the starting Earth from 7 tiles: a sea tile in the middle with a tundra tile on top, ringed by one each of desert, forest, jungle, mountain, savannah and wetland as the board shows.', 'earth', [
        C(
          board('earth', 8, 8, 'g:hex:5x5:#cfd8c0:#6b8f7a:Earth', 'Earth', 'The hex map where terrain tiles are placed. On the real board this and the action display are one board.'),
          board('acts', 5, 8, 'g:slots:3x6:#e8dcc0:#7a6a4a:Action display', 'Action display', 'Rows of action spaces, carried out from top to bottom and left to right. The initiative track and score track are here too.'),
        ),
        On('earth', ...H(2, 2), hexes('sea', 1, 0.62, '#5fa8d3', 'Sea tile', 'The centre of the starting Earth. It begins under a tundra tile.')),
        On('sea', 0.5, 0.5, hexes('tundra', 1, 0.36, '#f3f0e6', 'Tundra tile', 'Glaciation spreads tundra over other terrain, removing most of the species there.')),
        ...RING.map(([c, r], k) => On('earth', ...H(c, r), hexes(`terr${k}`, 1, 0.62, LAND[k], `${LNAME[k]} tile`, 'A terrain tile. Species score for the tiles they live on, and more valuable terrain scores more.'))),
      ]),
      S('Starting elements', 'Put element discs on the starting corners marked on the board, and the rest in the bag.', 'earth', [
        ...RING.map((_, k) => On(`terr${k}`, 0.5, 0.18, discs(`el${k}`, 1, 0.13, ELEMENT[k], 'Element disc', 'Six kinds: grass, grub, meat, seed, sun and water. Elements sit on tile corners and feed the animals matched to them.'))),
        R(box('bag', 0.9, 0.5, 0.9, '#6b4a34', 'Element bag', 'The remaining element discs are drawn from this bag.', { round: true })),
      ], 'The discs are drawn on the tiles here: on the real board they sit on the corners where tiles meet.'),
      S('Choose your animals', `Each player takes one animal display and its matching pieces. With ${n} players each player uses ${ap} action pawns and ${cubesEach} species cubes.`, 'you', [
        P(
          mat('animal', 4, 2.2, '$', 'Animal', 'Animal display', 'Mammals, reptiles, birds, amphibians, arachnids or insects. It shows the elements your animal needs and your special ability.'),
          pile('species', '$', 'Species cubes', `Your gene pool: ${cubesEach} cubes each with ${n} players. Cubes on the Earth are your living species.`),
        ),
        P(pawns('ap', ap, '$', 'Action pawns', `${ap} each with ${n} players. Each one claims one action space per round.`, { scale: 0.45 })),
      ], 'Check the rulebook table if your edition lists different numbers for your player count.'),
      S('Starting species', 'Each player places starting species cubes on the tiles the board marks for their animal.', 'earth',
        Array.from({ length: n }, (_, i) => [
          On(`terr${i % 6}`, 0.3, 0.48, cubes(`spA${i}`, 1, PC[i], 'Species cube', 'One species of that player\'s animal living on this tile.', { s: 0.2 })),
          On(`terr${(i + 1) % 6}`, 0.7, 0.66, cubes(`spB${i}`, 1, PC[i], 'Species cube', 'One species of that player\'s animal living on this tile.', { s: 0.2 })),
        ]).flat(),
        'The exact tiles and numbers are printed on the board for each animal.',
      ),
      S('Initiative and score', 'Line up the initiative markers in reverse food-chain order, so the animal lowest on the food chain acts first. Everyone starts with no points.', 'acts', [
        OnP('acts', 0.5, 0.08, discs('init', 1, 0.12, '$', 'Initiative marker', 'Sets the order in which players place action pawns. The Initiative action moves you up.'), [0.34, 0]),
        OnP('acts', 0.5, 0.92, cubes('vp', 1, '$', 'Score marker', 'Victory points, mostly earned when tiles are scored.', { s: 0.18 }), [0.3, 0]),
      ]),
      S('Dominance cards and spare tiles', 'Set the Ice Age card aside, shuffle the other dominance cards and put Ice Age at the bottom. Deal 5 cards face up. Stack the remaining terrain and tundra tiles nearby.', 'r', [
        R(cards('dom', 5, DOM, 'Dominance cards', '5 face-up cards. The player who dominates a scored tile chooses one and carries out its event.')),
        R(deck('domdeck', 21, f('#3d6b8a', '✦'), 'Dominance deck', '26 cards in all, with the Ice Age card at the bottom.')),
        L(hexes('spare', 3, 0.5, [LAND[1], LAND[3], '#f3f0e6'], 'Spare tiles', 'Terrain tiles for the Wanderlust action and tundra tiles for Glaciation.', { gap: 0.3 })),
      ]),
      S('Ready to play', 'Each round has three phases: planning, where players place action pawns one at a time in initiative order; execution; and reset.', 'all'),
    ],
    turn: [
      T('Planning', 'In initiative order, each player puts one action pawn on an empty space of the action display, round and round until all pawns are placed.', 'acts', [
        mv('ap.0', at('acts', ...SLOT(1))),
        mv('ap.0@1', at('acts', ...SLOT(7))),
        mv('ap.1', at('acts', ...SLOT(16))),
      ]),
      T('Execution: Adaptation', 'Pawns are resolved from the top down. Your Adaptation pawn lets you take an element from the display and add it to your animal.', 'you', [
        spawn(discs('gain', 1, 0.16, ELEMENT[2], 'Adapted element', 'A new element on your animal: you now thrive on tiles that supply it.'), at('animal', 0.7, 0.5), 'acts'),
        mv('ap.0', by('ap.2', -1, 0)),
      ]),
      T('Speciation', 'A Speciation pawn adds new species from that player\'s gene pool to the tiles around one element.', 'earth', [
        spawn(cubes('born', 2, '$', 'New species', 'Species added by Speciation.', { s: 0.2 }), at('terr2', 0.5, 0.88), 'species@1', PC[1]),
        mv('ap.0@1', by('ap.2@1', -1, 0)),
      ]),
      T('Domination', 'Your Domination pawn scores one tile: players with the most species there gain points. The animal that dominates the tile then picks a dominance card and carries it out.', 'acts', [
        mv('vp', at('acts', 0.88, 0.92)),
        hide('dom.0'),
        mv('ap.1', by('ap.2', -0.5, 0)),
      ]),
      T('Reset', 'Species with no matching element on their tile die out, the leader on tundra scores a bonus, and the display is restocked with new elements and dominance cards.', 'r', [draw('domdeck', by('dom.1', -1.04, 0), DOM)]),
      T('The Ice Age', 'Once the Ice Age card has been chosen, the game ends after that round. Every tile is scored one last time and the highest score wins.', 'all'),
    ],
  }
})
