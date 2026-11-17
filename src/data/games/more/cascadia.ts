/** Cascadia: four habitat tile and wildlife token pairs on offer, and a starter tile for each player. */
import { C, L, P, R, S, T, at, box, by, cards, discs, ft, hexes, mv, pile, spawn, tabletop } from '../compose'

const HAB = ['#4f7f4a', '#8a8f96', '#c9b25a', '#4f8fb7', '#7a9a8a']
const ANIMAL = ['#6b4a2e', '#c9a66b', '#d9776b', '#4a7fa3', '#d9772b']
const NAME = ['Bear', 'Elk', 'Salmon', 'Hawk', 'Fox']
const TILE_BODY = 'A habitat tile shows one or two of the five habitats and the animals that may live on it.'
const TOKEN_BODY = '100 wildlife tokens, 20 for each of the five animals. A token may only go on a tile that shows that animal, one token per tile.'

export const cascadia = tabletop('cascadia', 'Cascadia', [2, 4], 3, '30–45 min', 'Easy', 'Draft habitats and wildlife in the Northwest.', ['#4f7f4a', '#4f8fb7', '#d9772b'], (n) => ({
  setup: [
    S('Wildlife scoring cards', 'Pick one scoring card at random for each of the five animals and lay them where everyone can see them.', 'l', [
      L(cards('goals', 5, NAME.map((a) => ft('#f3ecdc', a.toUpperCase(), 'scoring', '●')), 'Wildlife scoring cards', 'One card per animal (bear, elk, salmon, hawk, fox). Each says how that animal scores for the pattern it forms in your environment.')),
    ], 'For a first game the rulebook recommends the five A cards (marked A in the bottom right corner).'),
    S('Count out the habitat tiles', `Shuffle the habitat tiles face down and count out ${20 * n + 3} of them (20 per player plus 3). Return the rest to the box unseen.`, 'r', [
      R(box('stack', 1.3, 1.1, 1.5, '#5a6b4a', 'Habitat tile stacks', `${20 * n + 3} face-down habitat tiles for ${n} players, out of 85 in the box. When they run out the game ends.`)),
    ], 'There is also a solo mode with a few rules of its own, which this walkthrough does not cover.'),
    S('Starter tiles', 'Each player takes one starter habitat tile at random and places it face up in front of them.', 'you', [
      P(hexes('start', 3, 0.7, [HAB[0], HAB[3], HAB[2]], 'Starter habitat tile', 'One per player, made of three joined habitats. Your whole environment grows out from it. It is drawn here as a row of three; the real tile is a triangle.', { gap: 0.02 })),
    ]),
    S('Wildlife and nature tokens', 'Put all the wildlife tokens in the cloth bag and shake it. Set the nature tokens within reach.', 'r', [
      R(box('bag', 1.4, 1, 1.4, '#b7a98a', 'Wildlife token bag', TOKEN_BODY, { round: true }), pile('nature', '#8fb86a', 'Nature tokens', 'Pinecone tokens. Earn one by placing wildlife on a keystone tile. Spend one for a freer choice on your turn; unspent ones are worth 1 point each.', 'disc')),
    ]),
    S('Deal the display', 'Turn 4 habitat tiles face up in a row, then draw 4 wildlife tokens from the bag and pair one with each tile in order.', 'c', [
      C(hexes('offer', 4, 0.7, [HAB[1], HAB[0], HAB[3], HAB[2]], 'Habitat tiles on offer', TILE_BODY, { gap: 0.3 })),
      C(discs('wild', 4, 0.3, [ANIMAL[3], ANIMAL[0], ANIMAL[2], ANIMAL[1]], 'Wildlife tokens on offer', TOKEN_BODY, { gap: 0.925 })),
    ], 'If all 4 tokens show the same animal, set them aside and draw 4 new ones. If 3 match, the player about to take a turn may choose to replace those 3.'),
    S('Ready to play', 'Choose a starting player; play then passes clockwise.', 'all', [], 'On your turn take one tile and token pair, add the tile to your environment, and place the token on a tile if you can.'),
  ],
  turn: [
    T('Take a pair', 'You choose the second pair. The tile must touch at least one edge of your environment, and the bear token goes on one of your tiles that shows a bear.', 'you', [
      mv('offer.1', by('start.2', 1.245, 0)), mv('wild.1', at('start.0', 0.5, 0.5)),
    ]),
    T('Refill the display', 'Draw a new tile from the stacks and a new token from the bag to fill the gap, so the next player again has four pairs to choose from.', 'c', [
      spawn(hexes('newtile', 1, 0.7, HAB[4], 'Habitat tile', TILE_BODY), by('offer.0', 1.525, 0), 'stack'),
      spawn(discs('newwild', 1, 0.3, ANIMAL[4], 'Wildlife token', TOKEN_BODY), by('wild.0', 1.525, 0), 'bag'),
    ]),
    T('Next player', 'The next player takes the last pair and does the same. You are never forced to place a token: one you cannot or will not place goes back in the bag.', 'offer', [
      mv('offer.3', by('start.0@1', -1.245, 0)), mv('wild.3', at('start.1@1', 0.5, 0.5)),
    ]),
    T('Nature tokens', 'Placing wildlife on a keystone tile earns you a nature token. Spend it later to take any tile with any token, or to wipe and redraw tokens of your choice.', 'you', [
      spawn(discs('nat', 1, 0.2, '#8fb86a', 'Nature token', 'Earned from keystone tiles. Worth 1 point at the end if you still have it.'), by('start.0', -1.1, 0), 'nature'),
    ]),
    T('End of the game', 'The game ends when the display cannot be refilled with a tile, after 20 turns each. Score the five wildlife cards, your largest area of each habitat (with bonuses for the biggest) and leftover nature tokens; most points wins.', 'all'),
  ],
}))
