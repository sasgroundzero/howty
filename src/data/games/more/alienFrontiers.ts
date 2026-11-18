/** Alien Frontiers: dice are ships that dock at orbital facilities to gather resources and land colonies. */
import { C, L, On as On0, OnP, P, R, S, T, at, board, cards, cubes, deck, dice, discs, f, ft, mv, pile, roll, spawn, tabletop, zone } from '../compose'
import type { Item, Place } from '../compose'

/** On() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })

const DOCK: [string, string, string][] = [
  ['solar', 'Solar Converter', 'Any ship gains fuel here: the higher the die, the more fuel.'],
  ['lunar', 'Lunar Mine', 'Gain 1 ore per ship. Each ship must be at least as high as the highest one already docked.'],
  ['shipyard', 'Shipyard', 'Dock a pair of matching dice and pay fuel and ore to build another ship.'],
  ['market', 'Orbital Market', 'Dock a pair to trade fuel for ore.'],
  ['artifact', 'Alien Artifact', 'Dock ships to take an alien tech card or to replace the cards on offer.'],
  ['hub', 'Colonist Hub', 'Each ship advances one of your colonies along a track. At the end, pay to launch it.'],
  ['constructor', 'Colony Constructor', 'Dock three of a kind and pay ore to place a colony straight away.'],
  ['terraform', 'Terraforming Station', 'Dock a 6 and pay fuel and ore to place a colony. The ship is given up.'],
  ['raiders', 'Raiders\' Outpost', 'Dock three dice in sequence to steal resources or an alien tech card.'],
  ['bay', 'Maintenance Bay', 'Any ship can always dock here. It does nothing.'],
]

export const alienFrontiers = tabletop('alien-frontiers', 'Alien Frontiers', [2, 4], 3, '90 min', 'Medium', 'Roll your fleet and colonise a planet.', ['#1b2238', '#c96b3a', '#e0b12f'], (n) => {
  const colonies = 10 - n
  return {
    setup: [
      S('Place the board', 'Put the board in the middle of the table. The planet with its territories is in the centre and the orbital facilities surround it.', 'c', [
        C(board('planet', 12, 8.5, 'g:space:0:#1b2238:#c96b3a:Alien Frontiers', 'Game board', 'A planet divided into territories, ringed by orbital facilities where ships dock. This drawing is schematic.')),
        ...DOCK.map(([id, name, what], i) => On('planet', 0.1 + (i % 5) * 0.2, i < 5 ? 0.1 : 0.9, zone(id, 2.1, 0.9, name, what))),
      ]),
      S('Resources and field generators', 'Put the fuel and ore tokens beside the board, and the three field generator tokens next to it.', 'l', [
        L(pile('fuel', '#d9772b', 'Fuel', 'Orange fuel tokens. Fuel pays for most alien tech powers and for building.', 'disc'), pile('ore', '#8a8f98', 'Ore', 'Grey ore tokens. Ore pays for ships and colonies.')),
        L(discs('fields', 3, 0.28, ['#5fa8d3', '#c0392b', '#7a4fa3'], 'Field generators', 'The isolation, positron and repulsor fields. Alien tech cards move them between territories.', { h: 0.1, gap: 0.3 })),
      ]),
      S('Alien tech cards', 'Shuffle the alien tech cards, turn 3 face up by the Alien Artifact, and deal 1 face up to each player.', 'r', [
        R(deck('techdeck', 19, f('#3d2b5a', '✦'), 'Alien tech deck', 'Cards with a reusable power and a one-off discard power.'), cards('tech', 3, ft('#e3d9f0', 'TECH', 'alien', '✦'), 'Alien tech on offer', 'Dock ships totalling 8 or more at the Alien Artifact to claim one of these.')),
      ]),
      S('Ships and colonies', `Each player takes 3 ships (dice) of one color and ${colonies} colonies. Your other ships wait by the board until you build them.${n < 4 ? ' Set the dice of the unused colors to 1 on the docking ports marked with dots: they block those ports all game.' : ''}`, 'you', [
        P(
          dice('ships', 3, '$', 'Your ships', 'You start with 3 ships and can build up to 6. Roll them all at the start of your turn.', { values: [1, 1, 1] }),
          pile('colonies', '$', 'Your colonies', `${colonies} colonies each with ${n} players.`, 'disc'),
          zone('hold', 1.6, 1, 'Your stock', 'Your fuel, ore and alien tech cards.'),
        ),
      ]),
      S('Score markers and head starts', 'Put each player\'s score marker on 0. Roll for high to pick player one; players later in turn order get a small head start of resources.', 'planet', [
        OnP('planet', 0.5, 0.975, cubes('score', 1, '$', 'Score marker', 'You score 1 point per colony on the planet, plus bonuses for controlling territories and for some cards.', { s: 0.2 }), [0.3, 0]),
      ], n === 4 ? 'Player two takes 1 fuel, player three 1 ore, and player four 1 fuel and 1 ore.' : n === 3 ? 'Player two takes 1 fuel and player three 1 ore.' : 'Player two takes 1 fuel.'),
      S('Ready to play', 'Player one starts; play passes clockwise.', 'all', [], 'On your turn: roll all your ships, dock them at facilities, and take what those facilities give.'),
    ],
    turn: [
      T('Roll your ships', 'You roll all three dice. The numbers decide where each ship is allowed to dock.', 'you', [roll('ships.0', 5), roll('ships.1', 5), roll('ships.2', 2)]),
      T('Dock at the facilities', 'You send both 5s to the Solar Converter for 3 fuel each and the 2 to the Lunar Mine for 1 ore.', 'planet', [
        mv('ships.0', at('solar', 0.25, 0.5)),
        mv('ships.1', at('solar', 0.7, 0.5)),
        mv('ships.2', at('lunar', 0.25, 0.5)),
        spawn(discs('myfuel', 6, 0.14, '#d9772b', 'Fuel', 'Fuel gained at the Solar Converter.', { h: 0.08, gap: 0.06 }), at('hold', 0.38, 0.3), 'fuel'),
        spawn(cubes('myore', 1, '#8a8f98', 'Ore', 'Ore gained at the Lunar Mine.', { s: 0.22 }), at('hold', 0.5, 0.75), 'ore'),
      ]),
      T('Next player', 'Docked ships stay put and may block others. The next player rolls and sends a ship to the Colonist Hub to start moving a colony.', 'planet', [
        roll('ships.0@1', 4),
        mv('ships.0@1', at('hub', 0.25, 0.5)),
      ]),
      T('Land a colony', 'Later, when a colony launches, you place it on any territory and score a point. Having the most colonies in a territory gives you its bonus.', 'planet', [
        spawn(discs('dome', 1, 0.2, '$', 'Colony', 'A colony on the planet is worth 1 point.', { h: 0.16 }), at('planet', 0.4, 0.34), 'colonies'),
        mv('score', at('planet', 0.64, 0.975)),
      ]),
      T('The last colony', 'You take your ships back at the start of your next turn. The game ends the moment someone places their last colony: the highest score wins.', 'all'),
    ],
  }
})
