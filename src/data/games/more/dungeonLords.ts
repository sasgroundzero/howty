/** Dungeon Lords: send minions on secret orders, grow a dungeon, then face the adventurers. */
import { C, L, On as OnBase, OnP, P, R, S, T, at, board, cards, deck, discs, f, flip, ft, mat, mv, pawns, pile, set, spawn, tabletop, tiles, zone } from '../compose'
import { slotUV } from '../layouts'

/** compose.On leaves `spread` unset, which the composer reads for every "on" placement, so set it here. */
const On = (...a: Parameters<typeof OnBase>) => ({ ...OnBase(...a), spread: [0, 0] as [number, number] })

const SLOT = slotUV(4, 2)
const ORDER = ['Food', 'Fame', 'Dig', 'Gold', 'Imps', 'Traps', 'Monster', 'Room'].map((t) => ft('#eee3c8', '', t, '◆'))

export const dungeonLords = tabletop('dungeon-lords', 'Dungeon Lords', [2, 4], 4, '90–120 min', 'Hard', 'Dig a dungeon and fend off do-gooders.', ['#4a3b5c', '#8a5a2b', '#c0392b'], (n) => ({
  setup: [
    S('Central board', 'Place the central board in the middle. It shows the eight places where minions carry out orders, and the Evilometer.', 'c', [
      C(board('central', 10, 7, 'g:slots:4x2:#cbb890:#4a3b5c:Central board', 'Central board', 'Eight action areas: get food, improve reputation, dig tunnels, mine gold, recruit imps, buy traps, hire a monster and build a room. Each takes up to three minions.')),
    ]),
    S('Progress and Distant Lands boards', 'Set the progress board beside it with the marker on the first season, and the Distant Lands board for cards and pieces that are out of play.', 'l', [
      L(board('progress', 4, 2.6, 'g:plain:0:#d8cfae:#4a3b5c:Progress board', 'Progress board', 'Tracks the four seasons of each of the two years, and holds the event and combat cards.')),
      L(board('lands', 4, 2.6, 'g:plain:0:#b9c4a0:#4a3b5c:Distant Lands', 'Distant Lands board', 'Holds discarded and removed pieces, and has the scoring reminders.')),
    ]),
    S('Shuffle the decks and tiles', 'Shuffle the monsters, rooms, traps and adventurers. Each has separate first-year and second-year sets, apart from the traps.', 'r', [
      R(
        deck('monsters', 12, f('#4a3b5c', '♛'), 'Monster tiles', 'Monsters and ghosts you can hire to fight adventurers. They must be paid again on pay day.'),
        deck('rooms', 8, f('#8a5a2b', '⌂'), 'Room tiles', 'Rooms replace a tunnel in your dungeon and produce things or score points.'),
        deck('traps', 20, f('#3a3a3a', '✦'), 'Trap cards', 'Single-use traps played in combat.'),
        deck('heroes', 16, f('#2e6fb7', '⚔'), 'Adventurer tiles', 'Warriors, thieves, priests and wizards who raid dungeons at the end of each year, plus the paladins.'),
      ),
      R(
        pile('foodsup', '#3d8b4a', 'Food supply', 'Food tokens. Monsters and imps need feeding.', 'disc'),
        pile('goldsup', '#e0b12f', 'Gold supply', 'Gold tokens. Used for taxes, traps and hiring.', 'disc'),
        pile('impsup', '#8a5a2b', 'Imp supply', 'Extra imps you can recruit.', 'meeple'),
        tiles('tunnelsup', 1, 0.6, 0.6, '#6b5a48', 'Tunnel tiles', 'A stack of tunnel tiles for digging.', { h: 0.4 }),
      ),
    ]),
    S('Dungeon boards and minions', 'Each player takes a dungeon board, 3 minions and the 8 order cards of their color.', 'you', [
      P(mat('dungeon', 4.4, 3.2, '$', 'Dungeon', 'Dungeon board', 'One per player. A grid for tunnels and rooms, with storage for your food, gold, imps, monsters and prisoners.')),
      P(zone('plan', 3, 1.1, 'Chosen orders', 'Your three orders for the round, placed face down and revealed one at a time.')),
      P(cards('orders', 8, ORDER, 'Order cards', '8 per player, one for each action on the central board. You pick 3 in secret every round.', { w: 0.62, d: 0.9, gap: 0.08 })),
      On('dungeon', 0.82, 0.3, pawns('minions', 3, '$', 'Minions', '3 per player. Each one carries out one of your chosen orders on the central board.', { scale: 0.55, gap: 0.1 })),
    ], n < 4 ? 'The game is designed for 4. With fewer, dummy players block some action spaces each round: follow the rulebook for the details.' : undefined),
    S('Starting dungeon and resources', 'Place 3 tunnel tiles at your dungeon entrance and take 3 imps, 3 food and 3 gold.', 'you', [
      On('dungeon', 0.3, 0.28, tiles('tunnels', 3, 0.6, 0.6, '#6b5a48', 'Starting tunnels', '3 tunnel tiles leading in from the entrance. Adventurers walk along them, conquering one tile at a time.', { gap: 0.08, h: 0.05 })),
      On('dungeon', 0.2, 0.75, pawns('imps', 3, '#8a5a2b', 'Imps', 'You start with 3. Imps dig tunnels, mine gold and work in rooms.', { scale: 0.4, gap: 0.1 })),
      On('dungeon', 0.5, 0.75, discs('food', 1, 0.22, '#3d8b4a', 'Your food', 'You start with 3 food. The label shows how many you have.', { label: '3', h: 0.15 })),
      On('dungeon', 0.65, 0.75, discs('gold', 1, 0.22, '#e0b12f', 'Your gold', 'You start with 3 gold. The label shows how many you have.', { label: '3', h: 0.15, ink: '#2b241c' })),
    ]),
    S('Evilometer', 'Put each player\'s evil counter on the marked starting space of the Evilometer.', 'central', [
      OnP('central', 0.06, 0.5, discs('evil', 1, 0.14, '$', 'Evil counter', 'Shows your reputation. Nastier lords attract tougher adventurers and, at the top, the paladin.', { h: 0.08 }), [0, 0.36]),
    ]),
    S('Ready to play', 'Give the starting player token to one player. Each round, reveal the new monsters, rooms and adventurers on offer, then everyone picks orders at the same time.', 'all', [], 'Two of your orders are out of reach each round. In the very first round of a year these are set aside at random: see the rulebook.'),
  ],
  turn: [
    T('Choose three orders', 'Everyone secretly picks 3 of their available order cards and lays them face down in the order they will be carried out.', 'you', [
      mv('orders.0', at('plan', 0.2, 0.5)), flip('orders.0', false),
      mv('orders.2', at('plan', 0.5, 0.5)), flip('orders.2', false),
      mv('orders.3', at('plan', 0.8, 0.5)), flip('orders.3', false),
    ]),
    T('Reveal and send minions', 'Orders are revealed one at a time. Starting with the first player, each player moves a minion to the matching area, taking the first free space there.', 'central', [
      flip('orders.0'), mv('minions.0', at('central', SLOT(0)[0] - 0.04, SLOT(0)[1])),
      mv('minions.0@1', at('central', SLOT(0)[0] + 0.04, SLOT(0)[1])),
    ]),
    T('Get food', 'Areas are resolved in order. The first minion at "get food" pays 1 gold and brings home 2 food; later spaces have different deals.', 'you', [set('gold', { label: '2' }), set('food', { label: '5' })]),
    T('Dig tunnels', 'Your second order sends a minion to dig. You put imps to work and add a new tunnel tile next to your existing ones.', 'you', [
      flip('orders.2'), mv('minions.1', at('central', SLOT(2)[0], SLOT(2)[1])),
      spawn(tiles('newtunnel', 1, 0.6, 0.6, '#6b5a48', 'New tunnel', 'A freshly dug tunnel. Tunnels may not form a 2 by 2 block.', { h: 0.05 }), at('dungeon', 0.3, 0.5), 'tunnelsup', undefined, 1.4),
    ], 8),
    T('Combat and final scoring', 'At the end of each year the adventurers assigned to you march in, and you fight them with traps and monsters. After the second year, score rooms, monsters, prisoners, unconquered tiles and titles: the most points wins.', 'all'),
  ],
}))
