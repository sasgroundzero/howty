/** Cities: a four-row main board to draft from, and a 3 by 3 city of tiles for each player. */
import { C, On, P, R, S, T, at, board, cards, cubes, ft, mat, mv, pawns, pile, tabletop, tiles, zone } from '../compose'

const U = (j: number) => 0.14 + 0.144 * (j + 0.5)
const V = [0.245, 0.415, 0.585, 0.755]
const BLD = ['#c0392b', '#e0b12f', '#2e6fb7', '#3d8b4a']
const CITY = [ft('#e6dccb', '', '', '⌂'), ft('#dbe6cb', '', '', '⌂'), ft('#cbdfe6', '', '', '⌂'), ft('#e6d3cb', '', '', '⌂'), ft('#e6dccb', '', '', '⌂')]

export const cities = tabletop('cities', 'Cities', [2, 4], 3, '30–45 min', 'Easy', 'Draft tiles and buildings for a 3 by 3 city.', ['#c96b4a', '#2e6fb7', '#3d8b4a'], (n) => {
  const k = 4
  const mid = 0.14 + 0.072 * k
  const HEDGE = 'Each row offers 4 choices every round, whatever the player count.'
  return {
    setup: [
      S('Main board', 'Place the main board in the middle of the table. It has four rows, one for each kind of thing you collect. Pick one city achievement board and put it above the main board.', 'c', [
        C(board('main', 10, 7, 'g:slots:5x4:#e6dccb:#c96b4a:Main board', 'Main board', 'Four rows: city tiles, scoring cards, feature tiles and building pieces. Each round you take one thing from each row. The order of the rows here is schematic.')),
        R(mat('cityboard', 3.2, 2.2, '#dfd3bd', 'City board', 'City achievement board', `A shared board of achievements that players race to claim; earlier claims score more. New York City or Rio de Janeiro suit a first game.${n === 2 ? ' With two players, cover the middle space of each achievement with a ring of an unused color.' : ''}`)),
      ]),
      S('Fill the four rows', 'Shuffle the scoring cards and city tiles into face-down piles and the feature tiles into face-down stacks, and put the building pieces in the bag. Each round, lay out 4 scoring cards, 4 city tiles and 6 feature tiles (the last of each face down), then draw building pieces from the bag onto the last row.', 'main', [
        On('main', mid, V[0], tiles('ctiles', k, 1, 1, CITY, 'City tiles', `Square tiles showing streets, building sites, parks and water. ${HEDGE}`, { gap: 0.44 })),
        On('main', mid, V[1], cards('score', k, ft('#f3ecdc', 'SCORE', 'goal', '★'), 'Scoring cards', `Each one is a personal way to score your finished city. ${HEDGE}`, { w: 0.7, d: 0.98, gap: 0.74 })),
        On('main', mid, V[2], tiles('feat', k, 0.7, 0.7, ['#3d8b4a', '#2e6fb7'], 'Feature tiles', `Park and water features that you add to matching spaces of your city tiles. ${HEDGE}`, { gap: 0.74, h: 0.05 })),
        On('main', mid, V[3], cubes('bld', k, BLD, 'Building pieces', `Wooden building pieces in red, yellow, blue and green. You stack them up to 4 high on building spaces of the same color. ${HEDGE}`, { s: 0.32, gap: 1.12 })),
        R(pile('bldsupply', BLD, 'Building supply', 'The rest of the wooden building pieces, kept in the cloth bag and drawn at random.'), pile('tilesupply', ['#e6dccb', '#3d8b4a', '#2e6fb7'], 'Tile and card supplies', 'The remaining city tiles, feature tiles and scoring cards, used to refill the board each round.')),
      ]),
      S('Starting tile', `Choose a start player at random and give them the star token. Then, starting with the player on their right and going counter-clockwise, each of the ${n} players picks a starting city tile and places it in front of them. Your city will grow around it into a square of 3 by 3 tiles.`, 'you', [
        P(zone('city', 3.5, 3.5, 'Your city', 'Room for a 3 by 3 grid of city tiles: your starting tile plus 8 more, one for each worker you place on the city tile row.'), zone('kept', 1.4, 1.6, 'Scoring cards', 'Keep the scoring cards you collect here.')),
        On('city', 0.5, 0.5, tiles('home', 1, 1, 1, ft('#efe6d2', '', 'start', '⌂'), 'Starting tile', 'One per player. New tiles must go next to tiles you already have, and the whole city must fit in a 3 by 3 square.')),
      ]),
      S('Workers', n === 2 ? 'Each player takes the 8 workers of their color, plus the 3 achievement rings and scoring token.' : 'Each player takes the 4 workers of their color, plus the 3 achievement rings and scoring token.', 'workers', [
        P(pawns('workers', n === 2 ? 8 : 4, '$', 'Workers', n === 2 ? '8 per player in a two-player game. Each round you place all eight, two on each row of the main board.' : '4 per player. Each round you place all four, one on each row of the main board, to claim one thing from that row.', { scale: 0.5 })),
      ]),
      S('Ready to play', 'The start player goes first. Going clockwise, players place one worker at a time until all workers are placed.', 'all', [], n === 2 ? 'The two-player game lasts 4 rounds, and each player places two workers on every row each round.' : 'The game lasts 8 rounds, and the first player can change each round.'),
    ],
    turn: [
      T('Claim a city tile', 'You put a worker on the city tile row, take one of the tiles and add it to your city next to your starting tile.', 'main', [mv('ctiles.1', at('city', 0.83, 0.5)), mv('workers.0', at('main', U(1), V[0]))]),
      T('The next player claims a card', n === 2 ? 'The other player places a worker on a different row and takes a scoring card. Over the round each of you places two workers on every row.' : 'The next player places a worker on a different row and takes a scoring card. You may only have one worker in each row per round.', 'main', [mv('score.0', at('kept@1', 0.5, 0.5)), mv('workers.0@1', at('main', U(0), V[1]))]),
      T('Claim building pieces', 'On your next placement you take a set of building pieces and put each on a building space of its own color in your city.', 'you', [mv('bld.2', at('ctiles.1', 0.3, 0.3)), mv('workers.1', at('main', U(2), V[3]))]),
      T('Claim a feature', 'A worker on the feature row takes park or water tiles to lay on matching spaces in your city.', 'main', [mv('feat.1', at('home@1', 0.5, 0.5)), mv('workers.1@1', at('main', U(1), V[2]))]),
      T('End of the round', 'When every worker is placed the round ends. The player whose worker is nearest the star space takes the star and goes first next round. Take your workers back and lay out the rows again.', 'main'),
      T('End of the game', n === 2 ? 'After 4 rounds every city is a full 3 by 3 square. Score your scoring cards, city board achievements, water and park areas and monuments: the most points wins.' : 'After 8 rounds every city is a full 3 by 3 square. Score your scoring cards, city board achievements, water and park areas and monuments: the most points wins.', 'all'),
    ],
  }
})
