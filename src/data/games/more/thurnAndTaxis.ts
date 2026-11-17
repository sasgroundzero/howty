/** Thurn and Taxis: draw a city card, extend your route, and close it to place post offices. */
import { C, P, R, S, T, at, board, by, cards, cubes, deck, draw, f, ft, mv, pile, spawn, tabletop, tiles, zone } from '../compose'
import { cityUV } from '../layouts'

const CITY = ['#c0392b', '#2e6fb7', '#3d8b4a', '#e0b12f', '#7a4fa3', '#d9772b'].map((c) => ({ ...ft('#f3e7c5', 'CITY', '', '⌂'), border: c }))
const SEAT0 = '#c0392b'

export const thurnAndTaxis = tabletop('thurn-and-taxis', 'Thurn and Taxis', [2, 4], 3, '60 min', 'Easy', 'Chain cities into postal routes in Bavaria.', ['#d8cfae', '#e0b12f', '#2e6fb7'], (n) => ({
  setup: [
    S('Lay out the board', 'Place the board in the middle of the table. It shows the cities of Bavaria and its neighbours, joined by roads and grouped into colored provinces.', 'c', [
      C(board('map', 13, 8.6, 'g:map:0:#d8cfae:#8fae6a:Postal map', 'Postal map', '22 cities joined by roads. The four officials you can call on for help are also printed on the board. This drawing is schematic, not the real map.')),
    ]),
    S('City cards', 'Shuffle the city cards, put the deck beside the board and turn 6 cards face up as the display.', 'r', [
      R(deck('citydeck', 60, f('#5a4634', '⌂'), 'City card deck', '66 city cards: 3 for each of the 22 cities.'), cards('open', 6, CITY, 'City card display', '6 face-up cards. On your turn you take one of these or the top card of the deck.', { cols: 3 })),
    ]),
    S('Carriage cards', 'Sort the carriage cards by number into five stacks, from 3 up to 7.', 'r', [
      R(deck('carriage', 4, [3, 4, 5, 6, 7].map((v) => ft('#e6d9b8', `${v}`, 'carriage', '●')), 'Carriage cards', 'Five stacks, numbered 3 to 7. You collect them in order by closing routes that are long enough. Each is worth points.', { n: 5, gap: 0.2 })),
    ]),
    S('Bonus tiles', 'Stack the bonus tiles by type on their spaces, each stack with the highest value on top.', 'r', [
      R(tiles('bonus', 4, 0.7, 0.7, [ft('#f3e7c5', '', '', '★'), ft('#f3e7c5', '', '', '◆'), ft('#f3e7c5', '', '', '▲'), ft('#f3e7c5', '', '', '✦')], 'Bonus tiles', 'Rewards for long routes, for covering whole provinces, for reaching every province and for ending the game. The first player to earn each kind gets the most points.', { h: 0.2 })),
    ]),
    S('Houses and player areas', 'Each player takes the 20 houses of one color. Everyone starts with no cards.', 'you', [
      P(zone('route', 5.2, 1.5, 'Your route', 'Cards you play are laid in a row here. Neighbouring cards must be cities joined by a road, and you may only add to either end.')),
      P(pile('houses', '$', 'Post office houses', '20 per player. Placed on cities when you close a route. Any left at the end cost you a point each.'), zone('hand', 3.6, 1.5, 'Your hand', 'City cards you have drawn but not yet played. The hand limit after closing a route is 3.')),
    ]),
    S('Ready to play', 'Choose a starting player; play runs clockwise.', 'all', [], `With ${n} players the rules are the same. On your turn you must take a card and must play a card, and you may then close your route.`),
  ],
  turn: [
    T('Take a city card', 'You must add one card to your hand: one from the display, which is refilled at once, or the top card of the deck.', 'r', [
      mv('open.1', at('hand', 0.2, 0.5)),
      draw('citydeck', by('open.0', 1.04, 0), CITY[0]),
    ]),
    T('Play a card', 'You must then play one card to your route. On your first turn any city will do.', 'you', [mv('open.1', at('route', 0.12, 0.5))]),
    T('Use an official', 'Once per turn one official may help. The Postmaster lets you take a second card, the Administrator replaces the display, the Postal Carrier lets you play a second card, and the Cartwright upgrades a carriage sooner.', 'you', [draw('citydeck', at('hand', 0.2, 0.5))]),
    T('Later: close a route', 'A route of at least 3 cards can be closed. Place houses either in one city of each province on the route, or in every route city of a single province. Then take the next carriage card if the route is long enough.', 'map', [
      spawn(cubes('h0', 1, '$', 'Post office', 'One of your houses on a city of the closed route.', { s: 0.28 }), at('map', cityUV(6)[0], cityUV(6)[1]), 'houses', SEAT0),
      spawn(cubes('h1', 1, '$', 'Post office', 'One of your houses on a city of the closed route.', { s: 0.28 }), at('map', cityUV(7)[0], cityUV(7)[1]), 'houses', SEAT0),
      spawn(cubes('h2', 1, '$', 'Post office', 'One of your houses on a city of the closed route.', { s: 0.28 }), at('map', cityUV(12)[0], cityUV(12)[1]), 'houses', SEAT0),
      draw('carriage.0', at('hand', 0.8, 0.5), ft('#e6d9b8', '3', 'carriage', '●')),
    ], 9),
    T('How it ends', 'The end is triggered when a player takes the 7 carriage or places their last house. Finish the round, then add carriage and bonus points and subtract a point for each unplaced house. The highest total wins.', 'all'),
  ],
}))
