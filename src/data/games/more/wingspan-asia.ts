/** Wingspan Asia, Duet mode: the shared Duet map with goal tiles, and a player mat covered in Duet tokens. */
import { C, L, On, OnMe, P, R, S, T, at, board, by, cards, cubes, deck, dice, discs, draw, f, ft, hide, mat, mv, pile, spawn, tabletop, tiles } from '../compose'
import { gridUV } from '../layouts'

const BIRD = ['#4f7f4a', '#c9b25a', '#4f8fb7'].map((c) => ft('#fbf6ea', 'BIRD', 'habitat and cost', '✦'))
const FOOD = ['#8a5a2b', '#c0392b', '#e0b12f', '#4f8fb7', '#7a6a5a']
const cell = gridUV(6, 6)

export const wingspanAsia = tabletop('wingspan-asia', 'Wingspan Asia', [2, 2], 2, '40–70 min', 'Medium', 'Two-player Duet mode on a shared map.', ['#6a8f5a', '#c9b25a', '#4f8fb7'], () => ({
  setup: [
    S('Duet map and goals', 'Place the Duet map between you. Shuffle the 6 Duet goal tiles, put 4 of them at random in the slots below the map, and return the other 2 to the box.', 'c', [
      C(board('map', 7, 6.4, 'g:grid:6x6:#e9e2c8:#6a8f5a:Duet map', 'Duet map', 'A shared map split into forest, grassland and wetland regions. Each space shows a symbol a bird must match. This drawing is schematic, not the real map.')),
      C(tiles('goals', 4, 1.3, 0.9, [1, 2, 3, 4].map((r) => ft('#f3e7c5', `ROUND ${r}`, 'goal', '★')), 'Duet goal tiles', 'One end-of-round goal for each of the 4 rounds. In Duet mode only the player who does better on a goal scores it.', { gap: 0.3 })),
    ], 'This teaches the 2-player Duet mode. The box also has a solo mode with its own rulebook.'),
    S('Birds and food', 'Shuffle the bird cards and turn 3 face up in the bird tray. Roll the 5 food dice into the birdfeeder. Shuffle the bonus cards and set out the food tokens and eggs.', 'all', [
      L(deck('birds', 70, f('#3d6b8a', '✦'), 'Bird deck', 'The bird cards. Each has a habitat, a food cost, a nest type, a wingspan and usually a power.'), cards('tray', 3, BIRD, 'Bird tray', 'Three face-up birds. When you draw cards you may take from here or from the top of the deck.')),
      R(dice('feeder', 5, '#d9c9a3', 'Birdfeeder dice', '5 food dice. When you gain food, you take a die out of the feeder and collect the matching token.', { size: 0.5, gap: 0.2 })),
      R(pile('foodpile', FOOD, 'Food tokens', 'Five kinds of food, spent to play birds.', 'disc'), pile('eggs', ['#e9e4d8', '#cfe3ea', '#f3d6c9'], 'Eggs', 'Laid on your birds. Later columns of your mat cost eggs to fill, and each egg is worth 1 point at the end.', 'disc'), deck('bonusdeck', 20, f('#7a5a3a', '★'), 'Bonus card deck', 'Bonus cards score at the end of the game for the kinds of birds you collected.')),
    ]),
    S('Player mats and Duet tokens', 'Each player takes a player mat, 8 action cubes and the 15 Duet tokens of one color, and covers each of the 15 bird spaces on their mat with a token.', 'you', [
      P(mat('pmat', 6, 3.6, '$', 'Player mat', 'Player mat', 'Three habitat rows of five bird spaces: forest (gain food), grassland (lay eggs) and wetland (draw cards). Playing a bird is the fourth action.')),
      On('pmat', 0.6, 0.5, discs('duet', 15, 0.16, '$', 'Duet tokens', '15 per player, one on each bird space. When you play a bird there, the token moves to the Duet map.', { cols: 5, gap: 0.58, h: 0.08 })),
    ]),
    S('Starting birds and food', 'Deal each player 5 bird cards and give them 1 of each of the 5 food types. Keep any 5 of those 10 things and discard the rest.', 'you', [
      P(cards('hand', 3, BIRD, 'Bird cards in hand', 'The birds you chose to keep. Here you kept 3 birds and 2 food; any split adding up to 5 is allowed.'), cards('bonus', 1, ft('#f3e7c5', 'BONUS', 'end of game', '★'), 'Bonus card', 'Deal 2 bonus cards to each player, who keeps 1.')),
      P(discs('food', 2, 0.18, [FOOD[0], FOOD[3]], 'Food tokens', 'The food you kept. You discard one food for every bird card you keep.', { h: 0.06 }), cubes('act', 8, '$', 'Action cubes', '8 per player. You use one per turn, and one stays on a goal tile at the end of each round, so the rounds last 8, 7, 6 and 5 turns.', { s: 0.22, cols: 4, gap: 0.08 })),
    ], 'The swift-start guides in the box can choose these for you in a first game.'),
    S('First player', 'Choose a first player at random and give them the first-player token.', 'you', [
      OnMe('pmat', 0.05, 0.93, discs('firstp', 1, 0.16, '#e9e4d8', 'First-player token', 'Marks who starts the round. In Duet mode it goes to whoever lost the round goal.', { h: 0.06 })),
    ]),
    S('Ready to play', 'The first player starts and you alternate turns.', 'all', [], 'On your turn place one action cube and do one of four things: play a bird, gain food, lay eggs or draw bird cards.'),
  ],
  turn: [
    T('Play a bird and claim a map space', 'You pay the bird’s food and put it on the first forest space. The Duet token from that space goes onto a free map space in the forest region whose symbol matches the bird.', 'all', [
      mv('act.0', at('pmat', 0.06, 0.05)), hide('food.0'),
      mv('hand.0', at('duet.0', 0.5, 0.5, -0.08)), mv('duet.0', at('map', ...cell(1, 4))),
    ], 9),
    T('Your opponent gains food', 'They put a cube on their forest row, take a die from the birdfeeder and collect that food. Dice stay out of the feeder until it is rerolled.', 'r', [
      mv('act.0@1', at('pmat@1', 0.06, 0.25)), hide('feeder.2'),
      spawn(discs('got', 1, 0.18, FOOD[2], 'Food token', 'Taken from the supply to match the die removed from the birdfeeder.', { h: 0.06 }), by('food.0@1', -0.5, 0), 'foodpile', '#2e6fb7'),
    ]),
    T('Draw bird cards', 'On a later turn you place a cube on your wetland row and draw a card, here from the tray. The tray is refilled at the end of your turn.', 'l', [
      mv('act.1', at('pmat', 0.06, 0.75)), mv('tray.1', at('hand.2', 1.15, 0.5, 0.02)),
      draw('birds', by('tray.0', 1.04, 0), BIRD[1]),
    ]),
    T('End of the round', 'When both of you have used your cubes, compare the round goal. Whoever has more places a cube above the tile and scores it; the other places a cube below it and scores nothing.', 'goals', [
      mv('act.7', at('goals.0', 0.5, 0.25)), mv('act.7@1', at('goals.0', 0.5, 0.75)),
    ]),
    T('End of the game', 'After 4 rounds add up birds, bonus cards, round goals, eggs, cached food and tucked cards, plus 1 point for each token in your largest connected group on the Duet map. The higher total wins.', 'map'),
  ],
}))
