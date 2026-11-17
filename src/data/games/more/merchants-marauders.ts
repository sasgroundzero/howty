/** Merchants & Marauders: captains trade or raid their way round the Caribbean to 10 glory points. */
import { C, On, P, type Place, R, S, T, at, board, box, cards, deck, dice, discs, draw, f, ft, mat, mv, pawns, pile, roll, tabletop, zone } from '../compose'
import { cityUV } from '../layouts'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const city = (i: number, du = 0, dv = 0): [number, number] => [cityUV(i)[0] + du, cityUV(i)[1] + dv]
const SEAT = ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a']
const HOME = [10, 4, 0, 14]
const GOODS = ['#8a5a2b', '#e9e4d8', '#c0392b', '#3d8b4a', '#e0b12f']
const CARGO = GOODS.map((c) => f(c, '▣', '#2b241c'))

export const merchantsMarauders = tabletop('merchants-marauders', 'Merchants & Marauders', [2, 4], 3, '2–3 hours', 'Hard', 'Trade or plunder across the Caribbean.', ['#2f7f9a', '#d8cfae', '#8a5a2b'], (n) => ({
  setup: [
    S('Unfold the board', 'Place the board in the middle of the table. It shows the Caribbean divided into sea zones, most of them with a port.', 'c', [
      C(board('map', 13, 8.6, 'g:map:0:#3f8fa8:#d8cfae:Caribbean', 'Caribbean board', 'Sea zones and the ports of four nations: England, France, Spain and Holland. This drawing is schematic, not the real map.')),
    ]),
    S('Demand and ship modifications', 'Mix the demand tokens and place one face up at each port, then do the same with the ship modification tokens.', 'map', [
      ...Array.from({ length: 15 }, (_, i) => on('map', ...city(i, 0, -0.045), discs(`demand${i}`, 1, 0.16, GOODS[i % 5], 'Demand token', 'Shows which kind of goods this port pays extra for. It is replaced after someone sells that kind here.', { h: 0.05 }))),
      R(pile('mods', '#6b7a8a', 'Ship modifications', 'Upgrades such as extra cannon or cargo space. Each port offers one for sale.', 'disc')),
    ], 'The real board has 16 ports. Only the demand tokens are drawn on this schematic map.'),
    S('Shuffle the decks', 'Shuffle the Cargo, Event, Glory, Rumor and Mission decks separately and put them beside the board. The rulebook says which cards, if any, start on the board.', 'r', [
      R(deck('cargo', 50, f('#8a5a2b', '▣'), 'Cargo deck', 'Goods of several kinds. You draw a batch in port and buy what you want.'),
        zone('cargodisc', 0.9, 1.26, 'Discard', 'Sold and unbought cargo goes here.'),
        deck('events', 30, f('#2f5f7a', '☼'), 'Event deck', 'One is drawn at the start of every round. Events bring storms, wars and the navy and pirate ships.'),
        zone('evt', 0.9, 1.26, 'Event', 'The current event card.')),
      R(deck('glory', 40, f('#e0b12f', '★'), 'Glory deck', 'Secret cards that give you an edge. You earn one with each glory point.'),
        deck('rumors', 20, f('#7a4fa3', '?'), 'Rumor deck', 'Tales picked up in port. Follow one up to test it for a reward.'),
        deck('missions', 16, f('#3d6b3a', '⚑'), 'Mission deck', 'Jobs offered at particular ports that pay glory when completed.')),
    ]),
    S('Captains and player boards', 'Each player takes a player board and a captain card drawn at random.', 'you', [
      P(mat('pboard', 4.6, 2.6, '$', 'Player board', 'Player board', 'Holds your captain, your ship card, your cargo hold and the markers that track damage to your ship.')),
      on('pboard', 0.15, 0.5, cards('captain', 1, ft('#efe2bd', 'CAPTAIN', 'four skills', '♙'), 'Captain card', 'Shows your nation, home port, special ability and four skills: Seamanship, Scouting, Leadership and Influence.')),
      P(zone('hold', 4.6, 1.5, 'Cargo and Glory cards', 'Cargo you are carrying and the Glory cards in your hand.')),
    ]),
    S('Ship, gold and home port', 'Choose a small starting ship, either a Sloop or a Flute, and place it in your captain\'s home port. Take 10 gold and your treasure chest.', 'map', [
      ...Array.from({ length: n }, (_, i) => on('map', ...city(HOME[i], 0, 0.055), pawns(`ship${i}`, 1, SEAT[i], i === 0 ? 'Your ship' : `Player ${i + 1}'s ship`, 'A player ship. The Sloop is quick and nimble and the Flute carries more cargo.', { scale: 0.45 }))),
      on('pboard', 0.5, 0.3, discs('gold', 1, 0.22, '#e0b12f', 'Gold', 'You start with 10 gold. Gold you carry can be lost in battle.', { label: '10', h: 0.14 })),
      on('pboard', 0.85, 0.3, box('chest', 0.6, 0.4, 0.45, '$', 'Treasure chest', 'Gold stashed here at your home port is safe, hidden, and counts towards glory.')),
    ], 'The rulebook also says whether each captain starts with a Glory card.'),
    S('Dice and non-player ships', 'Put the dice, the gold supply and the navy and pirate ships beside the board. Those ships only sail in when event cards call for them.', 'r', [
      R(dice('die', 3, '#e9e4d8', 'Dice', 'Special dice with skull faces. You roll a number equal to a skill, and each skull is a success.', { size: 0.5 }),
        discs('bank', 1, 0.25, '#e0b12f', 'Gold supply', 'The bank of gold coins.', { h: 0.35 }),
        pawns('npc', 2, ['#3a3a3a', '#e9e4d8'], 'Non-player ships', 'Naval ships hunt captains with a bounty on their head and pirate ships prey on the rest. Event cards place and move them.', { scale: 0.45 })),
    ]),
    S('Ready to play', 'Choose a first player as the rulebook describes. Each round starts with an event card, then every player takes a turn of 3 actions.', 'all', [], 'An action is one of three things: Move one step, Scout for a ship in your sea zone, or do your business in Port.'),
  ],
  turn: [
    T('Draw the event', 'The round opens with the top Event card, which is read out and resolved.', 'evt', [draw('events', at('evt', 0.5, 0.5), ft('#d6e4ea', 'EVENT', 'storm', '☼'))]),
    T('Action 1: Port', 'You begin in your home port, so your first action is a Port action. You draw a batch of cargo cards and buy the ones you want. Here you keep three and pay the bank for them.', 'you', [
      draw('cargo', at('hold', 0.15, 0.5), CARGO[0], undefined, 0.3),
      draw('cargo', at('hold', 0.38, 0.5), CARGO[0], undefined, 0.6),
      draw('cargo', at('hold', 0.61, 0.5), CARGO[2], undefined, 0.9),
    ], 8),
    T('Actions 2 and 3: Move', 'One Move action takes you out of port into the sea zone. A second takes you into the next sea zone, towards a port that wants your goods.', 'map', [
      mv('ship0', at('map', ...city(10, 0.07, -0.1))),
      mv('ship0', at('map', ...city(11, -0.05, -0.1)), 1.6),
    ]),
    T('Next player scouts', 'The player on your left sails out and spends an action to Scout, rolling dice equal to their Scouting skill. A skull means they find the merchant ship they were looking for and may raid it.', 'map', [
      mv('ship1', at('map', ...city(4, -0.07, 0.1))),
      roll('die.0', 6), roll('die.1', 3),
    ]),
    T('How it ends', 'You earn glory points for feats such as selling three matching goods where they are in demand, winning battles, big plunders and completed missions and rumors. Stashed gold counts too. The first captain to reach 10 glory points wins.', 'all', [], 8),
  ],
}))
