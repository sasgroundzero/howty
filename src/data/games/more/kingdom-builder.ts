/** Kingdom Builder: a hex map of four sections, three scoring cards, a terrain deck and 40 settlements each. */
import { C, On, P, R, S, T, at, board, by, cards, cubes, deck, discs, draw, f, flip, ft, mv, pile, spawn, tabletop, zone } from '../compose'
import { hexUV } from '../layouts'

const hx = hexUV(20, 20)
const TERRAIN = ft('#bfe0b0', 'Grass', 'terrain', '▲')
const LOCS: [number, number][] = [[4, 5], [14, 4], [5, 15], [15, 14]]
const house = (id: string) => cubes(id, 1, '$', 'Settlement', 'A settlement stays where it is built. What it touches is what scores at the end.', { s: 0.22 })

export const kingdomBuilder = tabletop('kingdom-builder', 'Kingdom Builder', [2, 4], 3, '45 min', 'Easy', 'Build settlements where your card allows.', ['#cfd8a0', '#3d8b4a', '#e0b12f'], (n) => ({
  setup: [
    S('Build the map', 'Choose any 4 of the 8 board sections and join them into one large rectangle.', 'c', [
      C(board('map', 12, 9, 'g:hex:20x20:#cfd8a0:#6f8f4a:Kingdom', 'Game board', 'Four of the 8 sections, joined two by two. Each section is 10 by 10 hexes of grass, forest, desert, flower field, canyon, water and mountain. The shading here is schematic.')),
    ]),
    S('Place the location tiles', 'Each section has location hexes of one kind. Put 2 matching location tiles on every location hex.', 'map', LOCS.map(([c, r], i) => On('map', ...hx(c, r), discs(`loc${i}`, 1, 0.2, '#e9dfc8', 'Location tiles', 'Build next to a location hex to take one of its tiles. A tile gives you an extra action on every later turn. Only one location hex per section is drawn here.', { label: '⌂', h: 0.16 }))), 'Put the summary card for each of the four kinds of location beside the board.'),
    S('Reveal three Kingdom Builder cards', 'Shuffle the 10 Kingdom Builder cards and turn 3 face up. Only these three ways of earning gold count in this game.', 'goals', [
      R(cards('goals', 3, ft('#f3e7c5', 'GOAL', 'gold', '★'), 'Kingdom Builder cards', '3 of the 10 cards. Each sets a rule for earning gold at the end, such as building beside water or in long lines.')),
    ]),
    S('Shuffle the terrain cards', 'Shuffle the terrain cards into a face-down deck and leave room for a discard pile.', 'tdeck', [
      R(deck('tdeck', 25 - n, f('#6b7f52', '▲'), 'Terrain deck', '25 terrain cards: 5 each of grass, forest, desert, flower field and canyon. When it runs out, shuffle the discards.'), zone('tdiscard', 1.1, 1.4, 'Discard', 'Used terrain cards go here face up.')),
    ]),
    S('Settlements and a terrain card', 'Each player takes the 40 settlements and the gold marker of one color and draws 1 terrain card, keeping it secret. Turn an unused board section over beside the map: its back is the gold track.', 'you', [
      P(pile('houses', '$', 'Settlements', '40 settlements per player. The game ends in the round in which someone builds their last one.'), cards('terrain', 1, TERRAIN, 'Your terrain card', 'You only ever hold 1. It names the terrain you must build on this turn.', { down: true, back: f('#6b7f52', '▲') })),
    ]),
    S('Ready to play', 'The oldest player takes the start player tile and goes first. Play passes clockwise.', 'all', [], 'On your turn you show your terrain card, build 3 settlements on that terrain, use any location tiles you hold, then discard the card and draw a new one.'),
  ],
  turn: [
    T('Show your terrain card', 'You turn your card face up. It shows grass, so your 3 settlements this turn must go on grass hexes.', 'terrain', [flip('terrain')]),
    T('Build three settlements', 'You build 3 settlements, each on an empty hex of that terrain. Whenever you can build next to one of your own settlements, you must.', 'map', [
      spawn(house('h0'), at('map', ...hx(5, 5)), 'houses', '#c0392b'),
      spawn(house('h1'), at('map', ...hx(6, 5)), 'houses', '#c0392b'),
      spawn(house('h2'), at('map', ...hx(6, 6)), 'houses', '#c0392b'),
    ]),
    T('Take a location tile', 'One of your settlements is next to a location hex, so you take one of its tiles. From your next turn it gives you an extra action.', 'you', [
      spawn(discs('mytile', 1, 0.2, '#e9dfc8', 'Your location tile', 'Use it once on each of your turns, before or after your 3 builds.', { label: '⌂', h: 0.08 }), by('houses', -1.3, 0), 'loc0'),
    ]),
    T('Discard and draw', 'You discard your terrain card and draw a new one for your next turn.', 'you', [
      mv('terrain', at('tdiscard', 0.5, 0.5)),
      draw('tdeck', by('houses', 1.575, 0), undefined, undefined, 1.2),
    ]),
    T('Next player', 'The player on your left shows their card and builds 3 settlements on its terrain in the same way.', 'map', [
      flip('terrain@1'),
      ...[[13, 12], [14, 12], [14, 13]].map(([c, r], k) => spawn(house(`b${k}`), at('map', ...hx(c, r)), 'houses@1', '#2e6fb7')),
    ]),
    T('End of the game', 'When a player builds their last settlement, the round is played to its end so everyone has had the same number of turns. Then score the three Kingdom Builder cards, plus 3 gold for each castle hex you built beside. The most gold wins.', 'all'),
  ],
}))
