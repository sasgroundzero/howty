/** Galaxy Trucker: grab tiles to build a ship against the clock, then fly it through trouble. */
import { C, On as OnBase, P, R, S, T, at, board, box, deck, dice, draw, f, ft, mat, mv, pawns, pile, set, spawn, tabletop, tiles } from '../compose'
import { loopUV } from '../layouts'

/** compose.On leaves `spread` unset, which the composer reads for every "on" placement, so set it here. */
const On = (...a: Parameters<typeof OnBase>) => ({ ...OnBase(...a), spread: [0, 0] as [number, number] })

const LOOP = loopUV(10)
const PART = [ft('#dfe5ec', '', '', '▲'), ft('#dfe5ec', '', '', '●'), ft('#dfe5ec', '', '', '≡'), ft('#dfe5ec', '', '', '◆')]

export const galaxyTrucker = tabletop('galaxy-trucker', 'Galaxy Trucker', [2, 4], 4, '60 min', 'Medium', 'Build a ship from scrap, then survive space.', ['#1f2a44', '#e0b12f', '#6b7a8c'], (n) => ({
  setup: [
    S('Flight board and component heap', 'Put the flight board in the middle and spread all the component tiles face down in one big heap that everyone can reach.', 'c', [
      C(board('flight', 8, 3.6, 'g:ring:10:#1f2a44:#e0b12f:Flight board', 'Flight board', 'A loop of spaces showing who is ahead during the flight. The real board is an oval and marks the starting spaces for each round.')),
      C(tiles('heap', 14, 0.8, 0.8, '#6b7a8c', 'Component tiles', 'Well over a hundred ship parts in the real heap: cabins, engines, cannons, cargo holds, batteries, shields and pipes. Only a few are shown.', { cols: 7 })),
    ]),
    S('Ship boards and starting cabins', 'Each player takes the class I ship board and places the starting cabin of their color on the square marked I. Keep your two rocket markers nearby.', 'you', [
      P(
        mat('ship', 4.2, 3.6, '$', 'Ship I', 'Ship board', 'One per player per round. You build your ship on its grid; each round uses a bigger ship class.'),
        pawns('rocket', 2, '$', 'Rocket markers', '2 per player. One marks your position on the flight board; the other marks the planet you land on when a Planets card comes up.', { scale: 0.6 }),
      ),
      On('ship', 0.5, 0.5, tiles('cabin', 1, 0.8, 0.8, f('$', '⌂'), 'Starting cabin', 'The tile every ship grows from. Each new tile must connect to a tile already on your ship.')),
    ]),
    S('Prepare the adventure cards', 'For the first round, deal 2 random level I adventure cards face down into each of four piles. Three piles go on the flight board; the fourth stays aside, unseen.', 'r', [
      R(deck('adv', 2, f('#3b2f55', 'I'), 'Adventure card piles', '8 cards in round 1. Once you have placed a tile you may peek at the three piles on the board; the fourth stays secret. In later rounds each pile gets 2 cards of that round\'s level plus 1 from each lower deck.', { n: 4, gap: 0.2 })),
    ]),
    S('Timer, order tiles and dice', 'Place the sand timer, the numbered order tiles and the two dice within reach.', 'r', [
      R(
        box('timer', 0.5, 0.9, 0.5, '#e0b12f', 'Sand timer', 'Flipped during building to put pressure on the slower builders.', { round: true }),
        tiles('order', n, 0.7, 0.7, Array.from({ length: n }, (_, k) => ft('#f3e7c5', `${k + 1}`)), 'Order tiles', `Numbered tiles, ${n} used with ${n} players. Grab the lowest one left when you finish building to claim your starting position.`),
        dice('d6', 2, '#e9e4d8', 'Dice', '2 dice, used for meteors and cannon fire to see which row or column is hit.', { size: 0.5 }),
      ),
    ]),
    S('Bank and supplies', 'Sort the cosmic credits, goods cubes, batteries and crew figures into a supply.', 'r', [
      R(
        pile('credits', '#e0b12f', 'Cosmic credits', 'The money of the game and its victory points.', 'disc'),
        pile('goods', ['#c0392b', '#e0b12f', '#3d8b4a', '#2e6fb7'], 'Goods cubes', 'Cargo in four colors of different value. Red goods are dangerous and need special holds.'),
        pile('crew', ['#e9e4d8', '#e9e4d8', '#7a4fa3', '#e9e4d8', '#8a5a2b'], 'Crew and aliens', 'Human astronauts plus a few aliens. They fill your cabins once building is done.', 'meeple'),
        pile('cells', '#3d8b4a', 'Battery tokens', 'Loaded onto battery tiles. They power shields, double cannons and double engines.', 'disc'),
      ),
    ]),
    S('Ready to play', 'Nobody takes turns while building. The boldest player says "Go!" and starts the timer, and everyone builds at the same time, using one hand.', 'all', [], 'The base game is played over three rounds, each with a larger ship and tougher adventure cards.'),
  ],
  turn: [
    T('Grab a tile', 'You take one face-down tile from the heap, bring it to your board and only then look at it. If it fits, you join it to your ship.', 'you', [mv('heap.3', at('ship', 0.7, 0.5)), set('heap.3', { top: PART[0] })]),
    T('Keep building', 'A tile you do not want goes back to the heap face up, where anyone may take it. Connectors must match wherever tiles touch.', 'you', [
      mv('heap.9', at('ship', 0.5, 0.25)), set('heap.9', { top: PART[1] }),
      mv('heap.5', at('ship@1', 0.3, 0.5)), set('heap.5', { top: PART[2] }),
    ]),
    T('Finish and take a number', 'When you are happy with your ship, take the lowest order tile left. After the ships are checked, tile 1 puts its rocket on the starting space and each next tile goes two spaces behind.', 'flight', [
      mv('order.0', at('ship', 0.12, 0.88)),
      mv('rocket.0', at('flight', LOOP(6)[0], LOOP(6)[1])),
      mv('rocket.0@1', at('flight', LOOP(4)[0], LOOP(4)[1])),
    ]),
    T('Crew up and fly', 'Fill your cabins with crew and your battery tiles with batteries. Then the leader turns over adventure cards one at a time: planets, meteors, pirates, open space and more.', 'r', [
      spawn(pawns('astro', 2, '#e9e4d8', 'Astronauts', 'A starting cabin holds 2 human crew.', { scale: 0.3, gap: 0.08 }), at('cabin', 0.5, 0.5), 'crew'),
      draw('adv.0', at('flight', 0.5, 0.5), ft('#e6e0f0', 'METEORS', '', '●')),
    ], 8),
    T('Payday and the finish', 'At the end of each flight you get credits for your finishing place, for goods delivered and for the best-looking ship, and you pay 1 credit per lost part, up to the cap printed on your ship board. After the third round, everyone with at least 1 credit has won, and the richest trucker wins a little more.', 'all'),
  ],
}))
