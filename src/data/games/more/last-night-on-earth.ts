/** Last Night on Earth: a modular town, four heroes, a zombie horde and a sun track counting down. */
import { C, L, On, OnMe, P, type Place, R, S, T, at, board, cards, deck, dice, discs, draw, f, ft, mat, mv, pawns, pile, roll, spawn, tabletop, zone } from '../compose'
import { gridUV } from '../layouts'

/** On() and OnMe() leave `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const onMe = (...a: Parameters<typeof OnMe>): Place => ({ ...OnMe(...a), spread: [0, 0] })
const g = gridUV(6, 6)
const HERO_COL = ['#2e6fb7', '#e0b12f', '#c96bb0', '#e9e4d8']
const HERO_AT: [number, number][] = [[1, 1], [4, 1], [1, 4], [4, 4]]
const ZOMBIE = '#5d7a3a'
const zombie = (id: string) => pawns(id, 1, ZOMBIE, 'Zombie', 'One of the 14 zombies. A zombie normally shambles just one space per turn and fights any hero in its space.', { scale: 0.5, shape: 'brute' })

const teams = (n: number) =>
  n === 2 ? 'With 2 players, one plays all the zombies and the other controls all four heroes.'
  : n === 3 ? 'With 3 players, one plays the zombies and the other two control two heroes each.'
  : n === 4 ? 'With 4 players, two share the zombies and the other two control two heroes each.'
  : n === 5 ? 'With 5 players, one plays the zombies and the other four control one hero each.'
  : 'With 6 players, two share the zombies and the other four control one hero each.'

export const lastNightOnEarth = tabletop('last-night-on-earth', 'Last Night on Earth', [2, 6], 4, '60–90 min', 'Medium', 'Small-town heroes hold out against zombies.', ['#2b3a2a', '#5d7a3a', '#c0392b'], (n) => {
  const zPlayers = n === 4 || n === 6 ? 2 : 1
  return {
    setup: [
      S('Pick a scenario and build the town', 'Choose a scenario card (Die Zombies, Die! is the usual first game). Put the square town centre in the middle and fit four randomly chosen L-shaped boards around it.', 'c', [
        C(board('town', 9, 9, 'g:grid:6x6:#4f5d43:#c9b98a:Town', 'Town board', 'The town centre plus four L-shaped outer boards with buildings and zombie spawning pits. This drawing is schematic, not the real map.')),
        R(cards('scenario', 1, ft('#f3e7c5', 'SCENARIO', 'goal and rules', '⚑'), 'Scenario card', 'Sets the goal for each side, how many turns the game lasts and any special rules.', { w: 1.5, d: 2.1 }),
          mat('track', 3.6, 1.2, '#e8d9a8', 'Sun track', 'Sun track', 'Counts the turns left until the scenario ends. The marker moves at the start of every zombie turn.')),
      ]),
      S('Split into two teams', teams(n), 'all', [
        P(zone('area', 5, 1.6, 'Your cards', 'Keep your hand of hero or zombie cards and anything you have in play here.')),
      ], 'There are always four heroes in the game, however many people play.'),
      S('Choose the heroes', 'The hero players take four hero character sheets at random and put each hero figure in its starting place.', 'town', [
        L(cards('sheets', 4, ft('#efe2bd', 'HERO', 'health and ability', '●'), 'Hero character sheets', '4 of the 8 heroes are used. A sheet shows the hero\'s health boxes, special ability and starting location.', { w: 1.5, d: 2.1, cols: 2 })),
        ...HERO_AT.map(([c, r], i) => on('town', ...g(c, r), pawns(`hero${i}`, 1, HERO_COL[i], 'Hero', 'One of the four heroes in play. Heroes move, search buildings for cards and fight zombies.', { scale: 0.55, shape: 'hero' }))),
      ], 'A hero normally starts in the building named on its sheet. If that building is not on the table, the rulebook says where the hero starts instead.'),
      S('Shuffle the two decks', 'Shuffle the hero deck and the zombie deck separately and put each within reach of its team, leaving room for a discard pile.', 'r', [
        R(deck('herodeck', 40, f('#2e6fb7', '✦'), 'Hero deck', 'Items, weapons and events for the heroes. A hero draws one by searching inside a building.'), zone('herodisc', 0.9, 1.26, 'Discard', 'Used hero cards go here.'),
          deck('zdeck', 40, f('#5d7a3a', '✗'), 'Zombie deck', 'Nasty surprises for the zombie players to spring on the heroes.'), zone('zdisc', 0.9, 1.26, 'Discard', 'Used zombie cards go here.')),
      ]),
      S('Zombie hand and zombie pool', `The zombie side draws a starting hand of 4 zombie cards${zPlayers === 2 ? ', split as 2 cards for each of the two zombie players' : ''}. Put the zombie figures and the dice beside the board.`, 'you', [
        onMe('area', 0.5, 0.5, cards('zhand', zPlayers === 2 ? 2 : 4, f('#5d7a3a', '✗'), 'Zombie cards', 'Your hand as a zombie player. You refill it at the start of each zombie turn.', { gap: 0.2 })),
        R(pile('zpool', ZOMBIE, 'Zombie pool', '14 zombie figures in two colors, 7 of each, so two zombie players can take a color each.', 'meeple'),
          dice('die', 2, '#e9e4d8', 'Dice', 'Ordinary six-sided dice used for movement, fights and spawning. The game comes with several.', { values: [3, 5], size: 0.5 })),
        on('town', ...g(2, 5), zombie('z0')),
        on('town', ...g(5, 2), zombie('z1')),
      ], 'In this walkthrough you play the zombies. Whether zombies start on the board, and how many, depends on the scenario: check the scenario card and rulebook. Two are shown on spawning pits as an example.'),
      S('Set the sun track', 'Put the sun track marker on the starting space named by the scenario.', 'track', [
        on('track', 0.1, 0.5, discs('sun', 1, 0.2, '#e0b12f', 'Sun track marker', 'Shows how many turns remain. When it runs out the scenario says who wins.', { label: '☼' })),
      ]),
      S('Ready to play', 'Every round the zombies take their whole turn first, then the heroes take theirs.', 'all', [], 'A zombie turn moves the sun marker, refills the zombie hand, moves and fights with zombies and may spawn more. On the hero turn each hero moves or searches, then shoots or fights.'),
    ],
    turn: [
      T('Zombie turn: the sun moves', 'You start the zombie turn by moving the sun track marker one space along. Then you would draw back up to your hand size, but your hand is already full.', 'track', [mv('sun', at('track', 0.24, 0.5))]),
      T('Roll to see if more zombies come', 'Roll two dice. If the total is higher than the number of zombies on the board, new zombies will arrive at the end of this turn.', 'r', [roll('die.0', 5), roll('die.1', 4)]),
      T('Zombies shamble and fight', 'Each zombie may move one space towards the heroes. A zombie that shares a space with a hero must fight instead.', 'town', [mv('z0', at('town', ...g(2, 4))), mv('z1', at('town', ...g(4, 2)))]),
      T('Spawn new zombies', 'Because the spawn roll succeeded, roll one die and place that many zombies from the pool on spawning pits. Here two arrive.', 'town', [
        roll('die.0', 2),
        spawn(zombie('z2'), at('town', ...g(0, 3)), 'zpool'),
        spawn(zombie('z3'), at('town', ...g(3, 0)), 'zpool'),
      ]),
      T('Hero turn: move or search', 'Each hero rolls a die and moves up to that many spaces. A hero who starts inside a building may search instead, drawing a hero card rather than moving.', 'town', [
        roll('die.1', 3),
        mv('hero0', at('town', ...g(2, 2))),
        draw('herodeck', at('area@1', 0.5, 0.5)),
      ]),
      T('Fights and the finish', 'A hero in a space with a zombie fights it with dice: the zombie wins ties, and the hero usually needs a winning roll with doubles to kill it. The game ends when a side meets the scenario goal or the sun track runs out.', 'all', [], 8),
    ],
  }
})
