/** Ticket to Ride: trains, a hand of train cards, five face-up cards and destination tickets. */
import { C, OnP, P, R, S, T, at, board, by, cards, cubes, deck, discs, draw, f, ft, hide, mv, pile, spawn, tabletop } from '../compose'
import { cityUV } from '../layouts'

const CAR = ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a', '#d9772b', '#3a3a3a', '#e9e4d8', '#c96bb0'].map((c) => f(c, '▬', '#2b241c'))
const TICKET = ft('#f3e7c5', 'TICKET', 'city to city', '⇄')
const mid = (a: number, b: number): [number, number] => [(cityUV(a)[0] + cityUV(b)[0]) / 2, (cityUV(a)[1] + cityUV(b)[1]) / 2]

export const ticketToRide = tabletop('ticket-to-ride', 'Ticket to Ride', [2, 5], 4, '45–75 min', 'Easy', 'Collect train cards and claim railway routes.', ['#d8cfae', '#c0392b', '#2e6fb7'], (n) => ({
  setup: [
    S('Unfold the map', 'Place the board in the middle of the table where everyone can reach it.', 'c', [
      C(board('map', 13, 8.6, 'g:map:0:#d8cfae:#7a8f5a:Route map', 'Route map', 'Cities joined by colored routes of 1 to 6 spaces. The scoring track runs round the edge. This drawing is schematic, not the real map.')),
    ]),
    S('Trains and scoring markers', 'Each player takes the 45 train cars of one color and puts the matching scoring marker on the start of the scoring track.', 'all', [
      P(pile('trains', '$', 'Train cars', '45 plastic train cars per player. You place them on routes you claim; the game ends soon after someone is down to 2 or fewer.')),
      OnP('map', 0.5, 0.97, discs('score', 1, 0.15, '$', 'Scoring marker', 'Moves along the scoring track each time you claim a route.'), [0.36, 0]),
    ]),
    S('Deal four train cards each', 'Shuffle the train car cards and deal 4 to each player. Put the rest beside the board as the draw deck.', 'you', [
      R(deck('traindeck', 110 - 4 * n - 5, f('#5a4634', '≡'), 'Train card deck', '110 train car cards in total: 12 of each of 8 colors plus 14 wild locomotives.')),
      P(cards('hand', 4, CAR, 'Train car cards', 'Your hand. Spend sets of one color to claim a route of that color and length. Keep them hidden from the other players.')),
    ]),
    S('Turn five cards face up', 'Turn the top 5 cards of the deck face up in a row beside it.', 'r', [
      R(cards('open', 5, [CAR[1], CAR[4], CAR[0], CAR[3], CAR[6]], 'Face-up train cards', 'Anyone may take these on their turn. If 3 of the 5 are ever locomotives, discard all 5 and deal a new row.')),
    ]),
    S('Deal destination tickets', 'Shuffle the destination tickets and deal 3 to each player. Each player keeps at least 2 and returns any other to the bottom of the deck.', 'you', [
      R(deck('tickets', 30 - 3 * n, TICKET, 'Destination ticket deck', '30 tickets in the base game. Each names two cities and a point value.')),
      P(cards('tix', 3, TICKET, 'Destination tickets', 'Connect the two cities with your own routes to score the points at the end. A ticket you fail to complete loses you its points.')),
    ]),
    S('Ready to play', 'The rules suggest the most experienced traveller goes first, then play passes clockwise.', 'all', [], 'On each turn you do exactly one thing: draw train cards, claim a route, or draw destination tickets.'),
  ],
  turn: [
    T('Draw train cards', 'You take one face-up card, which is replaced from the deck straight away, and then the top card of the deck.', 'r', [
      mv('open.1', at('hand.3', 1.15, 0.5, 0.02)),
      draw('traindeck', by('open.0', 1.04, 0), CAR[2]),
      draw('traindeck', at('hand.3', 1.8, 0.5, 0.04)),
    ]),
    T('Next player claims a route', 'The player on your left discards two matching cards and places two of their trains on a 2-space route between neighbouring cities.', 'map', [
      hide('hand.0@1'), hide('hand.1@1'),
      spawn(cubes('route', 2, '$', 'Claimed route', 'Trains on a route mean it belongs to that player for the rest of the game.', { gap: 0.12 }), at('map', mid(6, 7)[0], mid(6, 7)[1]), 'trains@1', '#2e6fb7'),
    ]),
    T('Score the route', 'They score it immediately: a 2-space route is worth 2 points, so their marker moves 2 spaces along the track.', 'map', [mv('score@1', at('map', 0.62, 0.97))]),
    T('Or draw tickets', 'The third option is to draw 3 destination tickets and keep at least 1 of them.', 'tickets', [draw('tickets', at('tix.2@1', 1.15, 0.5, 0.02))]),
    T('Longest path and final scoring', 'When someone has 2 or fewer trains left, everyone gets one last turn. Add completed tickets, subtract failed ones, and give 10 points for the longest continuous path.', 'all'),
  ],
}))
