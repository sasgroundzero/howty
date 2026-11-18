/** Carson City: pick a character, send cowboys to actions and parcels, and settle clashes with duels. */
import { C, L, On, type Place, OnP, P, R, S, T, at, board, by, dice, discs, hide, mat, mv, pawns, pile, roll, spawn, tabletop, tiles, zone, ft } from '../compose'
import { gridUV } from '../layouts'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const g = gridUV(8, 8)

export const carsonCity = tabletop('carson-city', 'Carson City', [2, 5], 4, '90 min', 'Hard', 'Claim land and out-gun rivals in the Wild West.', ['#c9a36b', '#7a4a2a', '#c0392b'], () => ({
  setup: [
    S('Place the board', 'Put the board in the middle of the table.', 'c', [
      C(board('land', 9.5, 9, 'g:grid:8x8:#d9b98a:#a8743f:Carson City', 'Town map', 'A grid of parcels that players buy and build on. On the real board the action track runs above the map; here it is drawn as a separate strip on the left.')),
      L(mat('track', 2.4, 8, '#e6d3ad', 'Action track', 'Action track', 'A row of action spaces resolved in order from first to last: wages, ammunition, roads, parcels, buildings, income and points.')),
    ]),
    S('Mountains and the town centre', 'Roll the two dice to find the centre of Carson City: put a house there with a road on each of its 4 sides. Then roll to place 9 mountain tiles, rerolling if a parcel is taken.', 'land', [
      on('land', ...g(4, 4), tiles('centre', 1, 0.8, 0.8, ft('#efe2bd', '', '', '⌂'), 'Town centre', 'The heart of Carson City. Its square and the starting roads are placed here.')),
      ...[[1, 6], [6, 6], [2, 1], [7, 2]].map(([c, r], k) => on('land', ...g(c, r), tiles(`mount${k}`, 1, 0.8, 0.8, ft('#b9a58a', '', '', '▲'), 'Mountain', 'Mountains are good for mines and cannot hold most other buildings.'))),
      R(dice('die', 2, '#e9e4d8', 'Dice', 'Used to place the mountains and town centre during setup, and to settle duels in the dice version of the game.')),
    ], 'This drawing shows only a few of the 9 mountains.'),
    S('Buildings and characters', 'Put a ranch on the $3 and $10 building spaces and a mine on the $4 and $12 spaces, then draw 3 random buildings from the bag for the $5, $6 and $8 spaces. Put the houses, roads and money beside the board, and set out the character tiles and the 3-guns chip.', 'r', [
      R(tiles('chars', 7, 0.95, 1.3, ft('#efe2bd', '', 'role', '★'), 'Character tiles', '7 characters such as the Sheriff and the Banker. Each round every player picks one for its special power; it also sets turn order.', { cols: 4 })),
      R(tiles('builds', 3, 0.9, 0.9, [ft('#cfe0c0', '', '', '⌂'), ft('#e3c9a0', '', '', '⌂'), ft('#c9d3e6', '', '', '⌂')], 'Building tiles', 'Ranches, mines, saloons, banks and more. Some are on offer each round at rising prices; built on your parcels they earn income.', { h: 0.25 }), pile('houses', '#8a5a3a', 'Houses and roads', 'Houses go beside many buildings as the town grows; roads link parcels to the centre.')),
    ]),
    S('Player pieces', 'Each player takes $15, 1 road, and 3 cowboys and 12 parcel markers of one color. The rest of the cowboys go in the general supply.', 'you', [
      P(pile('boys', '$', 'Your cowboys', 'Cowboys are your workers. You begin with 3 and get more at the end of each round, up to 10.', 'meeple'), discs('cash', 1, 0.3, '#d8b24a', 'Money', 'Dollars pay for parcels and buildings and can be turned into points. You start with $15.', { h: 0.2, label: '$' }), zone('role', 1.2, 1.5, 'Character', 'The character you chose this round sits here.')),
      OnP('track', 0.5, 0.94, discs('order', 1, 0.14, '$', 'Turn order marker', 'Shows the order of play, which follows the characters chosen.'), [0.34, 0]),
    ]),
    S('Starting parcels', 'Draw a random turn order. In turn order each player marks a parcel with a parcel marker, then in reverse order each marks a second one.', 'land', [
      OnP('land', ...g(3, 3), tiles('lot', 1, 0.5, 0.5, '$', 'Parcel marker', 'Shows that you own this parcel. Only its owner may build there.', { h: 0.06 }), [1.02, 0]),
    ], 'Any parcel may be chosen, even one with a mountain or the town centre.'),
    S('Ready to play', 'The game lasts 4 rounds. The random turn order holds until characters are chosen.', 'all', [], 'Each round: choose characters, take turns placing cowboys on action spaces, parcels or buildings until everyone passes, then resolve the action track in order.'),
  ],
  turn: [
    T('Choose a character', 'In turn order each player takes one character tile. You pick one and put it in front of you.', 'r', [mv('chars.2', at('role', 0.5, 0.5))]),
    T('Place a cowboy on an action', 'Players take turns placing one cowboy at a time, or passing. You put one on an action space of the track.', 'track', [
      spawn(pawns('cb1', 1, '$', 'Cowboy', 'Placed on an action space, he will carry out that action when the track is resolved.', { scale: 0.5 }), at('track', 0.35, 0.3), 'boys'),
    ]),
    T('Place a cowboy on a parcel', 'A cowboy placed directly on a free parcel of the map buys it for you when parcels are resolved.', 'land', [
      spawn(pawns('cb2', 1, '$', 'Cowboy', 'On a parcel he stakes a claim to buy it.', { scale: 0.5 }), at('land', ...g(5, 5)), 'boys'),
    ]),
    T('A duel', 'The next player puts a cowboy on the same action space. When that space is resolved you fight a duel: each adds a die roll to their revolvers and the cowboys left in their supply, and the loser’s cowboy goes home.', 'track', [
      spawn(pawns('cb3', 1, '$', 'Rival cowboy', 'Contests your action, so a duel decides who gets it.', { scale: 0.5 }), at('track', 0.65, 0.3), 'boys@1', '#2e6fb7'),
      roll('die.0', 5), roll('die.1', 2),
      hide('cb3', 2.4),
    ]),
    T('Resolve and score', 'Go down the track: winners take their actions, buy parcels and put up buildings, then collect income. After 4 rounds, each building, house and mountain you own scores 2 points and leftover money buys points at $6 each: the most victory points wins.', 'all', [
      spawn(tiles('ranch', 1, 0.8, 0.8, ft('#cfe0c0', '', '', '⌂'), 'Your building', 'A building on your parcel earns money or points depending on what surrounds it.', { h: 0.25 }), at('land', ...g(5, 5), 0), 'builds.0'),
      hide('cb2', 0.2),
    ]),
  ],
}))
