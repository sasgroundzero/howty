/** Carcassonne: a start tile, face-down land tile stacks, a scoreboard and seven meeples each. */
import { C, L, On, OnP, P, R, S, T, at, board, by, deck, draw, f, ft, mv, pawns, tabletop, tiles, zone } from '../compose'

const BACK = f('#6b7f52', 'C', '#e9e4d8')
const land = (glyph: string, sub: string) => ft('#b9cf8a', '', sub, glyph)

export const carcassonne = tabletop('carcassonne', 'Carcassonne', [2, 5], 3, '35–45 min', 'Easy', 'Lay tiles and claim roads, cities and fields.', ['#b9cf8a', '#8a6a3a', '#2e6fb7'], () => ({
  setup: [
    S('Place the start tile', 'Find the start tile and put it face up in the middle of the table. The landscape grows outward from it.', 'start', [
      C(zone('field', 7.4, 4.4, 'Playing area', 'Leave plenty of room: the map spreads in every direction as tiles are added.')),
      On('field', 0.5, 0.5, tiles('start', 1, 1.2, 1.2, land('⌂', 'start'), 'Start tile', '1 start tile. It shows a piece of city, a road and fields, so almost any tile can join it. This drawing is schematic.')),
    ]),
    S('Shuffle the land tiles', 'Mix the remaining land tiles face down and make a few stacks that everyone can reach.', 'r', [
      R(deck('stack', 18, BACK, 'Land tile stack', 'The base game has 72 land tiles counting the start tile. Each shows pieces of roads, cities, monasteries and fields.', { w: 1.2, d: 1.2, per: 0.04, n: 4, cols: 2 })),
    ], 'Some editions add extra tiles such as a river. Leave those out for a standard first game.'),
    S('Set out the scoreboard', 'Put the scoreboard to one side of the table.', 'track', [
      L(board('track', 5, 3.4, 'g:ring:12:#d9c9a0:#8a6a3a:Scoreboard', 'Scoreboard', 'A track of 50 point spaces that runs round the board. Going past 50, lay your scoring meeple down and start a second lap.')),
    ]),
    S('Take your meeples', 'Each player takes the meeples of one color.', 'you', [
      P(pawns('meeple', 7, '$', 'Meeples', 'Your supply of 7 meeples. Place one on a tile you have just laid to claim a road, city, monastery or field.', { scale: 0.5 })),
    ], 'Each color has 8 ordinary meeples in all: 7 to play with and 1 for the scoreboard.'),
    S('Mark your score', 'Put your eighth meeple on the start space of the scoreboard.', 'track', [
      OnP('track', 0.5, 0.96, pawns('score', 1, '$', 'Scoring meeple', 'Shows your points. It moves whenever one of your features is scored.', { scale: 0.5 }), [0.45, 0]),
    ]),
    S('Ready to play', 'Choose a starting player (the rulebook suggests the youngest). Play then passes clockwise.', 'all', [], 'A turn is always the same: draw a tile, add it to the map, optionally place one meeple on it, then score anything that was completed.'),
  ],
  turn: [
    T('Draw and place a tile', 'You draw a tile and add it to the map so that every touching edge matches: road to road, city to city, field to field.', 'field', [
      draw('stack.0', by('start', 1.2, 0), land('═', 'road'), 'tile1'),
    ]),
    T('Place a meeple', 'You may put one meeple from your supply on the tile you just placed, but not on a road, city or field that already has a meeple. Here it stands on the road, which no one else has claimed.', 'tile1', [
      mv('meeple.6', at('tile1', 0.5, 0.55)),
    ]),
    T('Next player', 'The player on your left draws a tile, joins it to the other side of the start tile and places a meeple of their own on it.', 'field', [
      draw('stack.0', by('start', -1.2, 0), land('✚', 'crossing'), 'tile2'),
      mv('meeple.6@1', at('tile2', 0.5, 0.25)),
    ]),
    T('A road is completed', 'Later a tile closes the other end of your road. A finished road scores 1 point for each of its tiles, here 4, and your meeple comes home.', 'field', [
      draw('stack.1', by('start', 2.4, 0), land('⌂', 'village'), 'tile3'),
      mv('meeple.6', by('meeple.5', 0.54, 0), 1.4),
      mv('score', at('track', 0.04, 0.65), 1.8),
    ], 8),
    T('End of the game', 'The game ends when the last tile has been placed. Unfinished features and fields are then scored as the rulebook describes, and the player with the most points wins.', 'all'),
  ],
}))
