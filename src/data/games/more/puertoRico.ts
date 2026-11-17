/** Puerto Rico: role cards chosen in turn, plantations and buildings on each player's island board. */
import { C, L, On as On0, P, R, S, T, at, board, by, cards, deck, discs, f, ft, mat, mv, pile, spawn, tabletop, tiles } from '../compose'
import type { Item, Place } from '../compose'

/** On() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })

const ROLES = ['Settler', 'Mayor', 'Builder', 'Craftsman', 'Trader', 'Captain', 'Prospector', 'Prospector']
const INDIGO = ft('#b9c6ea', '', '', '◆')
const CORN = ft('#f1dc8a', '', '', '●')
const CROPS = [ft('#f1dc8a', '', '', '●'), ft('#b9c6ea', '', '', '◆'), ft('#f3f0e6', '', '', '✦'), ft('#d9c0a0', '', '', '▲'), ft('#8a6a4a', '', '', '★')]
const TILE = { w: 0.7, d: 0.7 }
const colonist = (id: string) => discs(id, 1, 0.14, '#6b4a34', 'Colonist', 'A colonist works the plantation or building it stands on. Empty tiles produce nothing.', { h: 0.1 })

export const puertoRico = tabletop('puerto-rico', 'Puerto Rico', [3, 5], 4, '90–150 min', 'Medium', 'Choose roles, grow crops, ship goods.', ['#3d8b4a', '#b9c6ea', '#e0b12f'], (n) => {
  const indigo = n === 5 ? 3 : 2
  const vp = n === 3 ? 75 : n === 4 ? 100 : 122
  const col = n === 3 ? 55 : n === 4 ? 75 : 95
  return {
    setup: [
      S('Game board and buildings', 'Place the game board in the middle and sort all the building tiles onto their spaces on it.', 'c', [
        C(board('bank', 10, 4.6, 'g:grid:6x4:#d9c9a0:#7a4fa3:Buildings', 'Game board', 'Holds the buildings for sale, sorted by cost: production buildings, small violet buildings and five large ones.')),
      ], 'This guide follows the classic game for 3 to 5 players. Later editions add a two-player variant.'),
      S('Player boards and doubloons', `Each player takes a player board and ${n - 1} doubloons.`, 'you', [
        P(
          mat('pb', 5, 3.2, '$', 'Island and city', 'Player board', '12 island spaces for plantations and quarries and 12 city spaces for buildings.'),
          discs('coins', 1, 0.25, '#e0b12f', 'Your doubloons', `Each player starts with ${n - 1} doubloons in a ${n}-player game (one fewer than the number of players).`, { label: `${n - 1}`, h: 0.12, ink: '#2b241c' }),
        ),
        L(pile('doubloons', '#e0b12f', 'Doubloons', 'The bank of coins.', 'disc'), pile('vp', '#c96b3a', 'Victory point chips', `${vp} points of chips are used with ${n} players. Running out is one way the game ends.`, 'disc')),
      ]),
      S('Governor and first plantations', `Pick a governor. The governor${indigo === 3 ? ' and the next two players' : ' and the next player'} clockwise start with an indigo plantation; the other players start with corn.`, 'you', [
        ...Array.from({ length: n }, (_, i) => On(`pb@${i}`, 0.12, 0.3, tiles(`start${i}`, 1, 0.7, 0.7, i < indigo ? INDIGO : CORN, i < indigo ? 'Indigo plantation' : 'Corn plantation', 'Your starting plantation, placed on any island space. It needs a colonist before it produces.'))),
        On('pb@0', 0.9, 0.12, tiles('governor', 1, 0.6, 0.4, ft('#e9d9a0', '', '', '♛'), 'Governor card', 'The governor chooses the first role of the round. The card passes to the left at the end of each round.')),
      ]),
      S('Role cards', `Lay out the ${n + 3} role cards for ${n} players${n === 3 ? ', leaving out both prospectors' : n === 4 ? ', including one prospector' : ', including both prospectors'}.`, 'roles', [
        C(cards('roles', n + 3, ROLES.slice(0, n + 3).map((r) => ft('#f3e7c5', r.slice(0, 4).toUpperCase(), 'role', '♛')), 'Role cards', 'Settler, Mayor, Builder, Craftsman, Trader and Captain, plus prospectors with 4 or 5 players. Choosing a role lets everyone act, with a bonus for you.')),
      ]),
      S('Plantations and quarries', `Shuffle the plantation tiles into face-down stacks and turn ${n + 1} face up, one more than the number of players. Stack the 8 quarries beside them.`, 'plant', [
        C(
          deck('pstack', 30, f('#3d6b4a', '?'), 'Plantation stacks', 'Corn, indigo, sugar, tobacco and coffee plantations, face down. The face-up row is refilled from here after each settler phase.', { ...TILE, per: 0.02 }),
          cards('plant', n + 1, CROPS, 'Face-up plantations', 'The settler phase lets each player take one of these.', TILE),
          tiles('quarry', 1, 0.7, 0.7, ft('#b9b9b9', '', '', '⌂'), 'Quarries', '8 quarry tiles. A manned quarry makes buildings cheaper.', { h: 0.3 }),
        ),
      ]),
      S('Ships, colonists and goods', `Set out the three cargo ships for ${n} players, the trading house and the colonist ship with ${n} colonists on it. Put the remaining colonists and the goods beside them.`, 'r', [
        R(
          tiles('ship', 3, 0.9, 2.2, [n + 1, n + 2, n + 3].map((k) => ft('#c9b48a', `${k}`, 'cargo')), 'Cargo ships', `With ${n} players use the ships holding ${n + 1}, ${n + 2} and ${n + 3} goods. Each ship carries one kind of good.`, { h: 0.06, gap: 0.3 }),
          tiles('cship', 1, 0.9, 2.2, ft('#e9d9a0', `${n}`, 'colonists'), 'Colonist ship', `Starts with ${n} colonists, one per player. It is refilled after each mayor phase.`, { h: 0.06 }),
        ),
        R(
          tiles('trade', 1, 1.5, 1.5, ft('#e8d9b8', 'TRADE', '4 spaces'), 'Trading house', 'Holds up to 4 goods of different kinds sold in the trader phase.', { h: 0.06 }),
          pile('colonists', '#6b4a34', 'Colonist supply', `${col} colonists are used with ${n} players. Running out is one way the game ends.`, 'disc'),
          pile('goods', ['#e0b12f', '#3b5aa8', '#e9e4d8', '#b98a5a', '#3a3a3a'], 'Goods', 'Barrels of corn, indigo, sugar, tobacco and coffee.'),
        ),
      ]),
      S('Ready to play', 'The governor chooses the first role. Then each player in clockwise order chooses one of the roles that are left.', 'all', [], 'When a role is chosen, every player carries out its action in turn, starting with the player who chose it, who also gets its privilege.'),
    ],
    turn: [
      T('You choose the Settler', 'As governor you take the Settler card. Everyone takes a face-up plantation in turn, and your privilege lets you take a quarry instead.', 'c', [
        mv('roles.0', by('coins', 1, 0)),
        spawn(tiles('myquarry', 1, 0.7, 0.7, ft('#b9b9b9', '', '', '⌂'), 'Quarry', 'A manned quarry takes 1 doubloon off the cost of a building.'), at('pb', 0.28, 0.3), 'quarry'),
        mv('plant.0', at('pb@1', 0.28, 0.3)),
      ]),
      T('Next player chooses the Mayor', 'Each player takes a colonist from the ship in turn until it is empty, and the mayor takes one extra from the supply. Colonists go onto plantations or buildings.', 'you', [
        mv('roles.1', by('coins@1', 1, 0)),
        spawn(colonist('col0'), at('start0', 0.5, 0.5), 'cship'),
        spawn(colonist('col1'), at('start1', 0.5, 0.5), 'cship'),
        spawn(colonist('col2'), at('plant.0', 0.5, 0.5), 'colonists'),
      ]),
      T('Third player chooses the Builder', `Each player in turn may buy one building, and the builder pays 1 doubloon less. The building goes onto a city space.${n > 3 ? ' The remaining players then choose roles of their own.' : ''}`, 'pb@2', [
        ...Array.from({ length: n - 2 }, (_, k) => mv(`roles.${k + 2}`, by(`coins@${k + 2}`, 1, 0))),
        spawn(tiles('bought', 1, 0.9, 0.6, ft('#d9c6ea', '', '', '⌂'), 'Small building', 'A violet building gives its owner a special ability once a colonist works in it.'), at('pb@2', 0.3, 0.75), 'bank'),
      ]),
      T('End of the round', 'When everyone has chosen a role, put 1 doubloon on each role nobody took, return the used roles, and pass the governor card to the left.', 'roles', [
        ...[n, n + 1, n + 2].map((k) => spawn(discs(`bonus${k}`, 1, 0.2, '#e0b12f', 'Bonus doubloon', 'Whoever next takes this role also takes the doubloons on it.', { h: 0.08 }), at(`roles.${k}`, 0.5, 0.5), 'doubloons')),
        ...Array.from({ length: n }, (_, k) => mv(`roles.${k}`, by(`roles.${n}`, (k - n) * 1.04, 0))),
        mv('governor', at('pb@1', 0.9, 0.12)),
      ]),
      T('How it ends', 'The game ends after the round in which the colonists or the victory point chips run out, or someone fills all 12 city spaces. Add chips and building points: most wins.', 'all'),
    ],
  }
})
