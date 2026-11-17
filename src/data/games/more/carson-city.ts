/** Carson City: pick a character, send cowboys to actions and parcels, and settle clashes with duels. */
import { C, L, On, type Place, OnP, P, R, S, T, at, board, by, dice, discs, hide, mat, mv, pawns, pile, roll, spawn, tabletop, tiles, zone, ft } from '../compose'
import { gridUV } from '../layouts'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const g = gridUV(8, 8)

export const carsonCity = tabletop('carson-city', 'Carson City', [2, 5], 4, '90 min', 'Hard', 'Claim land and out-gun rivals in the Wild West.', ['#c9a36b', '#7a4a2a', '#c0392b'], () => ({
  setup: [
    S('Place the board', 'Put the board in the middle of the table.', 'c', [
      C(board('land', 9.5, 9, 'g:grid:8x8:#d9b98a:#a8743f:Carson City', 'Town map', 'A grid of parcels that players buy and build on. On the real board the action track runs alongside the map; here it is drawn as a separate strip on the left.')),
      L(mat('track', 2.4, 8, '#e6d3ad', 'Action track', 'Action track', 'A row of action spaces resolved in order from first to last: income, parcels, buildings, roads, points and more.')),
    ]),
    S('Mountains and the town centre', 'Roll the dice to place the mountain tiles and the centre of Carson City on the map, then add the first houses and roads around the centre.', 'land', [
      on('land', ...g(4, 4), tiles('centre', 1, 0.8, 0.8, ft('#efe2bd', '', '', '⌂'), 'Town centre', 'The heart of Carson City. Its square and the starting roads are placed here.')),
      ...[[1, 6], [6, 6], [2, 1], [7, 2]].map(([c, r], k) => on('land', ...g(c, r), tiles(`mount${k}`, 1, 0.8, 0.8, ft('#b9a58a', '', '', '▲'), 'Mountain', 'Mountains are good for mines and cannot hold most other buildings.'))),
      R(dice('die', 2, '#e9e4d8', 'Dice', 'Used to place the mountains and town centre during setup, and to settle duels in the dice version of the game.')),
    ], 'The exact number of mountains and where the houses and roads go are in the rulebook; this drawing shows only a few.'),
    S('Buildings and characters', 'Put the building tiles, houses, roads and money beside the board, and set the character tiles out in a row.', 'r', [
      R(tiles('chars', 7, 0.95, 1.3, ft('#efe2bd', '', 'role', '★'), 'Character tiles', '7 characters such as the Sheriff and the Banker. Each round every player picks one for its special power; it also sets turn order.', { cols: 4 })),
      R(tiles('builds', 3, 0.9, 0.9, [ft('#cfe0c0', '', '', '⌂'), ft('#e3c9a0', '', '', '⌂'), ft('#c9d3e6', '', '', '⌂')], 'Building tiles', 'Ranches, mines, saloons, banks and more. Some are on offer each round at rising prices; built on your parcels they earn income.', { h: 0.25 }), pile('houses', '#8a5a3a', 'Houses and roads', 'Houses go beside many buildings as the town grows; roads link parcels to the centre.')),
    ]),
    S('Player pieces', 'Each player takes the cowboys and parcel markers of one color and some starting money.', 'you', [
      P(pile('boys', '$', 'Your cowboys', 'Cowboys are your workers. You begin with a few and can gain more. The starting number is in the rulebook.', 'meeple'), discs('cash', 1, 0.3, '#d8b24a', 'Money', 'Dollars pay for parcels and buildings and can be turned into points. The starting amount is in the rulebook.', { h: 0.2, label: '$' }), zone('role', 1.2, 1.5, 'Character', 'The character you chose this round sits here.')),
      OnP('track', 0.5, 0.94, discs('order', 1, 0.14, '$', 'Turn order marker', 'Shows the order of play, which follows the characters chosen.'), [0.34, 0]),
    ]),
    S('Starting parcels', 'In turn order players mark their first parcels on the map with their parcel markers.', 'land', [
      OnP('land', ...g(3, 3), tiles('lot', 1, 0.5, 0.5, '$', 'Parcel marker', 'Shows that you own this parcel. Only its owner may build there.', { h: 0.06 }), [1.02, 0]),
    ], 'How many free parcels each player starts with is in the rulebook.'),
    S('Ready to play', 'The game lasts 4 rounds. Choose a starting player for the first round.', 'all', [], 'Each round: choose characters, take turns placing cowboys on action spaces or parcels, then resolve the action track in order.'),
  ],
  turn: [
    T('Choose a character', 'In turn order each player takes one character tile. You pick one and put it in front of you.', 'r', [mv('chars.2', at('role', 0.5, 0.5))]),
    T('Place a cowboy on an action', 'Players take turns placing one cowboy at a time. You put one on an action space of the track.', 'track', [
      spawn(pawns('cb1', 1, '$', 'Cowboy', 'Placed on an action space, he will carry out that action when the track is resolved.', { scale: 0.5 }), at('track', 0.35, 0.3), 'boys'),
    ]),
    T('Place a cowboy on a parcel', 'A cowboy placed directly on a free parcel of the map buys it for you when parcels are resolved.', 'land', [
      spawn(pawns('cb2', 1, '$', 'Cowboy', 'On a parcel he stakes a claim to buy it.', { scale: 0.5 }), at('land', ...g(5, 5)), 'boys'),
    ]),
    T('A duel', 'The next player puts a cowboy on the same action space. When that space is resolved you fight a duel: add your firepower and a die roll, and the loser’s cowboy goes home.', 'track', [
      spawn(pawns('cb3', 1, '$', 'Rival cowboy', 'Contests your action, so a duel decides who gets it.', { scale: 0.5 }), at('track', 0.65, 0.3), 'boys@1', '#2e6fb7'),
      roll('die.0', 5), roll('die.1', 2),
      hide('cb3', 2.4),
    ]),
    T('Resolve and score', 'Go down the track: winners take their actions, buy parcels and put up buildings, then collect income. After 4 rounds, the player with the most victory points wins.', 'all', [
      spawn(tiles('ranch', 1, 0.8, 0.8, ft('#cfe0c0', '', '', '⌂'), 'Your building', 'A building on your parcel earns money or points depending on what surrounds it.', { h: 0.25 }), at('land', ...g(5, 5), 0), 'builds.0'),
      hide('cb2', 0.2),
    ]),
  ],
}))
