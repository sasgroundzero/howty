/** Wingspan: a bird tray, the birdfeeder dice, a goal board and a three-habitat mat per player. */
import { C, On, P, R, S, T, at, box, by, cards, cubes, deck, dice, discs, f, ft, hide, mat, mv, pile, spawn, tabletop, tiles } from '../compose'

const BIRD = [ft('#e6f0dc', 'BIRD', 'forest', '▲'), ft('#f2ecd6', 'BIRD', 'grassland', '●'), ft('#dce8f2', 'BIRD', 'wetland', '◆'), ft('#e6f0dc', 'BIRD', 'forest', '▲'), ft('#f2ecd6', 'BIRD', 'grassland', '●')]
const FOOD = ['#c0392b', '#e0b12f', '#3d8b4a', '#2e6fb7', '#8d8d8d']

export const wingspan = tabletop('wingspan', 'Wingspan', [1, 5], 3, '40–70 min', 'Medium', 'Attract birds to your wildlife preserve.', ['#6fb0c9', '#e0b12f', '#3d8b4a'], (n) => ({
  setup: [
    S('Bird cards', 'Shuffle the bird cards into a deck and turn 3 face up on the bird tray.', 'c', [
      C(deck('birds', 60, f('#6fb0c9', '●'), 'Bird deck', '170 bird cards in the base game.'), cards('tray', 3, BIRD, 'Bird tray', '3 face-up birds. When you draw cards you may take from here or from the top of the deck.'), mat('goal', 3.6, 2.4, '#cfe3c4', 'Goals', 'Goal board', 'Shows one goal for each of the 4 rounds. Use the green side for a gentler first game.')),
    ]),
    S('Goal board and bonus cards', 'Shuffle the goal tiles and place 4 at random on the goal board, one for each round. Shuffle the bonus cards into a deck.', 'goal', [
      On('goal', 0.5, 0.5, tiles('goals', 4, 0.6, 0.4, '#e0b12f', 'Goal tiles', '4 goal tiles, one scored at the end of each round.', { gap: 0.2, h: 0.04 })),
      R(box('feeder', 1.6, 1.8, 1.6, '#b98a5e', 'Birdfeeder', 'A dice tower. The dice in its tray show which food is available.'), dice('fdice', 5, '#e9dfc8', 'Food dice', '5 wooden dice. Roll them through the birdfeeder; a taken die stays out until the feeder is refilled.', { size: 0.45 })),
      R(pile('foodpile', FOOD, 'Food tokens', 'Five kinds: invertebrate, seed, fish, fruit and rodent. Food pays for birds.', 'disc'), pile('eggs', ['#b9d6c8', '#f2d6dc', '#e9e4d8'], 'Eggs', 'Egg miniatures. Eggs help pay for later birds and are worth 1 point each at the end.', 'disc'), deck('bonusdeck', 26, f('#7a4fa3', '★'), 'Bonus card deck', '26 bonus cards. Each rewards a certain kind of bird in your preserve.')),
    ]),
    S('Player mats and action cubes', `Each of the ${n} players takes a player mat.`, 'you', [
      P(mat('pmat', 6.2, 4, '$', 'Player mat', 'Player mat', 'Three habitat rows (forest, grassland and wetland) of 5 spaces each, with the play-a-bird action along the top.')),
    ]),
    S('Deal bird cards', 'Deal each player 5 bird cards.', 'hand', [
      P(cards('hand', 5, BIRD, 'Bird cards', 'Your 5 starting birds. For each one you keep, you must give up one of your starting food tokens.')),
    ]),
    S('Food, bonus cards and cubes', 'Give each player 5 food tokens, one of each kind, the 8 action cubes of their color, and 2 bonus cards of which they keep 1.', 'you', [
      P(discs('food', 5, 0.17, FOOD, 'Starting food', 'One of each of the 5 food types.', { h: 0.06 }), cards('bonus', 2, f('#7a4fa3', '★'), 'Bonus cards', 'You are dealt 2 and keep 1. It scores at the end of the game.'), cubes('cubes', 8, '$', 'Action cubes', '8 per player. You place one each turn, so round 1 has 8 turns each. One cube is left on the goal board after every round.', { s: 0.22, cols: 4, gap: 0.1 })),
    ]),
    S('Ready to play', 'Give the first player token to a random player. Play goes clockwise for 4 rounds.', 'all', [], n === 1 ? 'The solo game is played against the Automa, an automated opponent with its own cards and rules.' : 'On your turn do one of four things: play a bird, gain food, lay eggs or draw bird cards.'),
  ],
  turn: [
    T('Choose what to keep', 'Before the first turn, decide how many birds to keep and discard one food token for each. Here you keep 3 birds and 2 food, and one of your bonus cards.', 'you', [hide('hand.3'), hide('hand.4'), hide('food.2'), hide('food.3'), hide('food.4'), hide('bonus.1')]),
    T('Play a bird', 'You put an action cube on the play-a-bird spot, pay the bird\'s food cost and place it in the leftmost space of one of its habitats.', 'you', [mv('hand.0', at('pmat', 0.25, 0.2)), hide('food.0', 0.8), mv('cubes.0', at('pmat', 0.07, 0.05))]),
    T('The next player gains food', 'The next player places a cube in their forest row and takes a die from the birdfeeder, collecting the food it shows.', 'r', [
      mv('fdice.0', by('feeder', 0, -1.3)),
      mv('cubes.0@1', at('pmat@1', 0.07, 0.2)),
      spawn(discs('got', 1, 0.17, '#c0392b', 'Food gained', 'The food token matching the die that was taken.', { h: 0.06 }), by('food.1@1', 0, 0.5), 'foodpile'),
    ]),
    T('End of the round', 'After everyone has used all their cubes, score the round\'s goal and leave one cube on the goal board. So you have 8 turns in round 1, then 7, 6 and 5. Discard the birds in the tray and deal 3 new ones.', 'goal', [mv('cubes.7', at('goal', 0.15, 0.88))]),
    T('End of the game', 'After round 4, add up the points on your birds, your bonus card, the round goals, and 1 point for each egg, cached food token and tucked card. The most points wins.', 'all'),
  ],
}))
