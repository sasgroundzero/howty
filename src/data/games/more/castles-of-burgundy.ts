/** The Castles of Burgundy (base game): six numbered depots, dice, and a duchy board per player. */
import { C, On, OnP, P, R, S, T, at, board, dice, discs, ft, hexes, mat, mv, pile, roll, spawn, tabletop, tiles } from '../compose'
import { slotUV } from '../layouts'

const D = slotUV(3, 2)
const HEX = ['#3d6fb7', '#8fb04a', '#c9a227', '#1f5e3a', '#8d8d8d', '#d9c36a']
const GOOD = ft('#e9dfc8', '', '', '◆')

export const castlesOfBurgundy = tabletop('castles-of-burgundy', 'The Castles of Burgundy', [2, 4], 2, '70–120 min', 'Medium', 'Roll dice, take tiles and build your estate.', ['#8fb04a', '#c9a227', '#3d6fb7'], (n) => ({
  setup: [
    S('Game board and supplies', 'Place the game board in the middle. Sort the hex tiles by the color of their backs and keep each kind in its own face-down supply.', 'c', [
      C(board('main', 10.4, 7.6, 'g:slots:3x2:#d9c9a0:#7a8f5a:Game board', 'Game board', 'Six numbered depots (1 to 6) around a central black depot, with phase and round spaces and the scoring track. The layout here is schematic.')),
      R(pile('supply', HEX, 'Hex tile supplies', 'Buildings, ships, animals, castles, mines and knowledge tiles, kept face down by back color. The black-backed tiles are kept apart for the central depot.'), dice('white', 1, '#f3ecdc', 'White die', 'One white die. The start player rolls it each round to decide which depot receives that round\'s goods tile.', { size: 0.5 })),
      R(pile('silver', '#c0c0c0', 'Silverlings', 'The coins of the game. Two silverlings buy one tile from the central black depot, once per turn.', 'disc'), pile('workerpool', '#e9e4d8', 'Worker tiles', 'Each worker you spend changes one die result by 1 up or down.', 'disc')),
    ], 'This teaches the base game for 2 to 4 players. The Special Edition box also holds expansions and a solo mode with their own rules.'),
    S('Goods tiles', 'Shuffle the goods tiles and make 5 face-down stacks of 5 on the phase spaces, one stack for each phase A to E.', 'goods', [
      On('main', 0.27, 0.5, tiles('goods', 5, 0.4, 0.4, '#b98a5e', 'Goods stacks', '25 goods tiles in 5 stacks of 5. One tile enters a depot every round, so each stack lasts exactly one phase.', { h: 0.25, gap: 0.1 })),
    ]),
    S('Duchy boards', `Each of the ${n} players takes a duchy board and puts a castle tile on a starting castle space. Everyone uses the same board number in a first game.`, 'you', [
      P(mat('duchy', 4.6, 3.6, '$', 'Duchy', 'Duchy board', 'Your estate: 37 hex spaces in colored regions, each with a die number. It also has storage for 3 hex tiles, goods and your dice.')),
      On('duchy', 0.5, 0.45, hexes('castle', 1, 0.26, '#1f5e3a', 'Starting castle', 'One dark green castle tile each. Every tile you add later must touch a tile already on your estate.')),
      On('duchy', 0.2, 0.12, tiles('mygoods', 3, 0.36, 0.36, GOOD, 'Starting goods', 'Each player draws 3 random goods tiles and sorts them by color on their goods storage.', { h: 0.04, gap: 0.08 })),
    ]),
    S('Dice, coins and workers', 'Each player takes the 2 dice of their color and 1 silverling. The start player takes 1 worker, the next player 2, the next 3 and so on.', 'you', [
      P(dice('dice', 2, '$', 'Your dice', 'Two dice in your color. Each die gives you one action per round.', { size: 0.5, ink: '#ffffff' }), discs('coin', 1, 0.2, '#c0c0c0', 'Silverling', 'You start with 1 silverling.', { h: 0.05 }), discs('workers', 1, 0.2, '#e9e4d8', 'Workers', 'Your starting workers: 1 for the start player and 1 more for each seat after that.', { h: 0.08, label: 'W' })),
      OnP('main', 0.5, 0.965, discs('vp', 1, 0.13, '$', 'Scoring marker', 'One of your two playing pieces starts at 0 on the scoring track. The other goes on the turn order track.', { h: 0.1 }), [0.32, 0]),
    ], 'These starting amounts are from the standard rules. Check the rulebook of your edition if anything looks different.'),
    S('Fill the depots', `At the start of each phase, fill the six numbered depots with face-up hex tiles on the spaces marked for ${n} players, and fill the black depot the same way.`, 'main', [
      ...[0, 1, 2, 3, 4, 5].map((i) => On('main', D(i)[0], D(i)[1], hexes(`dep${i + 1}`, n, 0.26, HEX.map((_, k) => HEX[(k + i) % 6]), `Depot ${i + 1}`, `Tiles here can be taken with a die showing ${i + 1}. In a ${n}-player game each numbered depot holds ${n} tiles.`, { gap: 0.08 }))),
      On('main', 0.66, 0.5, hexes('black', 2 * n, 0.26, '#3a3a3a', 'Black depot', 'Tiles here are bought with 2 silverlings instead of a die. Fill the black spaces marked for your player count; the board shows how many.', { gap: 0.06 })),
    ], 'The spaces on the board are marked with player counts, so follow those markings rather than counting.'),
    S('Ready to play', 'The game lasts 5 phases of 5 rounds. Each round everyone rolls their dice at once, then players take turns in turn order.', 'all', [], 'On your turn you use each of your two dice for one action: take a tile, place a tile, sell goods or take workers.'),
  ],
  turn: [
    T('Roll the dice', 'All players roll their two dice. The start player also rolls the white die and moves the top goods tile of the current phase into the depot with that number.', 'main', [
      roll('dice.0', 3), roll('dice.1', 5), roll('white', 2),
      spawn(tiles('newgood', 1, 0.4, 0.4, GOOD, 'Goods tile', 'This round\'s goods tile. It can be taken along with a ship tile later.', { h: 0.04 }), at('main', D(1)[0], D(1)[1] + 0.085), 'goods'),
    ]),
    T('Take a tile', 'You use your 3 to take a hex tile from depot 3 and put it on one of the three storage spaces at the bottom left of your duchy board.', 'main', [mv('dep3.0', at('duchy', 0.12, 0.86))]),
    T('Place a tile', 'You use your 5 to move that tile from storage onto your estate. The space must match the tile\'s color, show a 5, and touch a tile you already placed.', 'duchy', [mv('dep3.0', at('duchy', 0.61, 0.45))], 9),
    T('The next player', 'The next player in turn order uses their own two dice in the same way, for example taking a tile from depot 6.', 'main', [roll('dice.0@1', 6), roll('dice.1@1', 2), mv('dep6.1', at('duchy@1', 0.12, 0.86))]),
    T('Other things a die can do', 'A die can also sell all your goods of the matching number for silverlings and points, or be swapped for 2 workers whatever it shows. Once per turn you may also buy a black depot tile for 2 silverlings.', 'you'),
    T('End of the game', 'Finishing a colored region scores points at once, and more in earlier phases. After the fifth round of phase E, add points for leftover silverlings, workers, goods and knowledge tiles. The most points wins.', 'all'),
  ],
}))
