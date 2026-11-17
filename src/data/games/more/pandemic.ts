/** Pandemic: a co-operative race to cure four diseases while cubes spread across a world map. */
import { C, L, On as On0, OnP, P, R, S, T, at, board, cards, cubes, deck, discs, draw, f, ft, hide, mv, pawns, pile, set, spawn, tabletop, tiles } from '../compose'
import type { Item, Place } from '../compose'
import { cityUV } from '../layouts'

/** On() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })

const DIS = ['#2e6fb7', '#2e6fb7', '#e0b12f', '#3a3a3a', '#c0392b']
const hue = (city: number) => DIS[city % 5]
const near = (city: number, dv: number): [number, number] => [cityUV(city)[0], cityUV(city)[1] + dv]
const ATLANTA = 5
const INFECTED: [number, number][] = [[1, 3], [8, 3], [13, 3], [3, 2], [6, 2], [10, 2], [0, 1], [9, 1], [14, 1]]
const CITY = ft('#f3f0e6', 'CITY', 'card', '●')
const cube = (id: string, city: number, k = 1) => cubes(id, k, hue(city), 'Disease cubes', '24 cubes in each of four colors. A fourth cube of one color in a city causes an outbreak instead.', { s: 0.2, gap: 0.05 })

export const pandemic = tabletop('pandemic', 'Pandemic', [2, 4], 4, '45 min', 'Medium', 'Work together to cure four diseases.', ['#2a4a66', '#c0392b', '#e0b12f'], (n) => {
  const hand = n === 2 ? 4 : n === 3 ? 3 : 2
  return {
    setup: [
      S('Board, cubes and research stations', 'Place the board, sort the disease cubes by color and put one research station in Atlanta.', 'c', [
        C(board('world', 13, 8.6, 'g:map:0:#2a4a66:#6fa8c9:World', 'World map', '48 cities in four colored regions, joined by travel routes. This drawing is schematic and shows only a few cities.')),
        On('world', ...near(ATLANTA, -0.055), tiles('station', 1, 0.4, 0.4, '#f3f0e6', 'Research station', 'One starts in Atlanta. Stations let you discover cures and shuttle between them.', { h: 0.25 })),
        L(pile('blue', DIS[0], 'Blue cubes', '24 blue disease cubes.'), pile('yellow', DIS[2], 'Yellow cubes', '24 yellow disease cubes.')),
        L(pile('black', DIS[3], 'Black cubes', '24 black disease cubes.'), pile('red', DIS[4], 'Red cubes', '24 red disease cubes.')),
        L(tiles('stations', 5, 0.4, 0.4, '#f3f0e6', 'Spare research stations', '6 stations in all: 5 wait here.', { h: 0.25 })),
      ]),
      S('Markers', 'Put the outbreaks marker on 0, the infection rate marker on the first space of its track (rate 2), and the four cure markers near the cure indicators.', 'world', [
        On('world', 0.3, 0.04, discs('outbreak', 1, 0.16, '#3d8b4a', 'Outbreaks marker', 'Moves up one each time an outbreak happens. At 8 outbreaks everyone loses.', { label: '0' })),
        On('world', 0.7, 0.04, discs('rate', 1, 0.16, '#3d8b4a', 'Infection rate marker', 'Shows how many infection cards are drawn each turn. It starts at 2 and rises with epidemics.', { label: '2' })),
        On('world', 0.5, 0.96, discs('cures', 4, 0.16, [DIS[0], DIS[2], DIS[3], DIS[4]], 'Cure markers', 'Placed on the board when a disease is cured. Cure all four to win.', { h: 0.08, gap: 0.2 })),
      ]),
      S('Infect nine cities', 'Shuffle the infection cards. Draw 3 and put 3 cubes on each of those cities, draw 3 more for 2 cubes each, and 3 more for 1 cube each. Put the 9 cards on the infection discard pile.', 'world', [
        ...INFECTED.map(([city, k], i) => On('world', ...near(city, -0.055), cube(`inf${i}`, city, k))),
        R(deck('ideck', 39, f('#3d6b4a', '▲'), 'Infection deck', '48 cards, one per city. The top cards show where the diseases spread next.'), deck('idisc', 9, ft('#dfe8d8', 'CITY', 'infected', '●'), 'Infection discard pile', 'The 9 cities infected during setup. Epidemics shuffle this pile back on top of the deck.')),
      ]),
      S('Roles and pawns', 'Deal each player one role card and its matching pawn. All pawns start in Atlanta.', 'world', [
        P(cards('role', 1, ft('#f3e7c5', 'ROLE', 'special ability', '★'), 'Role card', 'Each role bends the rules in its own way. The current edition has 7 roles; the first edition had 5.')),
        OnP('world', ...near(ATLANTA, 0.055), pawns('pawn', 1, '$', 'Pawn', 'Your pawn. Everyone starts in Atlanta.', { scale: 0.45 }), [0.34, 0]),
      ]),
      S('Deal player cards', `Take the epidemic cards out of the player deck, shuffle the rest and deal ${hand} cards to each player.`, 'you', [
        P(cards('hand', hand, CITY, 'Your hand', `${hand} cards each with ${n} players. City cards are used to travel, build stations and discover cures. Hands are played face up.`)),
      ], 'Four cards each with two players, three with three, two with four.'),
      S('Add the epidemics', 'Split the remaining player cards into as many equal piles as the epidemics you are using: 4 for an introductory game, 5 for standard, 6 for heroic. Shuffle one epidemic into each pile and stack them.', 'pdeck', [
        R(deck('pdeck', 53 - n * hand + 4, f('#2e4a7a', '✚'), 'Player deck', 'City cards, event cards and epidemics. If it runs out when someone must draw, everyone loses.'), deck('pdisc', 1, ft('#f3f0e6', 'USED', 'discard'), 'Player discard pile', 'Played and discarded player cards go here.')),
      ]),
      S('Ready to play', 'In the current edition the player holding the city card with the highest population goes first; older rules pick differently.', 'all', [], 'On your turn: take 4 actions, draw 2 player cards, then infect cities.'),
    ],
    turn: [
      T('Drive to a neighbouring city', 'You spend your first action moving your pawn along a route to the next city.', 'world', [mv('pawn', at('world', ...near(6, 0.055)))]),
      T('Treat disease', 'With another action you remove one cube from the city you are in. Other actions include building a station, sharing a card and discovering a cure with 5 cards of one color.', 'world', [hide('inf4.0')]),
      T('Draw two player cards', 'After your 4 actions, draw 2 cards from the player deck. The hand limit is 7. An epidemic card raises the infection rate and badly infects a new city.', 'you', [
        draw('pdeck', at(`hand.${hand - 1}`, 1.15, 0.5, 0.02), CITY),
        draw('pdeck', at(`hand.${hand - 1}`, 1.8, 0.5, 0.04), CITY),
      ]),
      T('Infect cities', 'Turn over as many infection cards as the infection rate, 2 for now, and add one cube to each city shown.', 'world', [
        draw('ideck', at('idisc', 0.5, 0.5, 0.02), ft('#dfe8d8', 'CITY', 'infected', '●')),
        draw('ideck', at('idisc', 0.5, 0.5, 0.04), ft('#dfe8d8', 'CITY', 'infected', '●')),
        spawn(cube('new1', 11), at('world', ...near(11, -0.055)), 'black'),
        spawn(cube('new2', 2), at('world', ...near(2, -0.055)), 'yellow'),
      ]),
      T('Outbreaks', 'A city that should get a fourth cube of a color has an outbreak instead: every neighbouring city gets a cube and the outbreaks marker moves up.', 'world', [mv('outbreak', at('world', 0.34, 0.04)), set('outbreak', { label: '1' })]),
      T('Win or lose together', 'You all win as soon as all four cures are discovered. You all lose after 8 outbreaks, if a cube color runs out when needed, or if the player deck runs out.', 'all'),
    ],
  }
})
