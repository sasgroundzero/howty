/** Earth: a fauna board, a big deck of earth cards, and an island, climate and tableau per player. */
import { C, On, P, R, S, T, at, by, cards, cubes, deck, discs, draw, f, ft, mat, mv, pile, spawn, tabletop, zone } from '../compose'

const EARTH = [ft('#eaf2df', 'FLORA', 'plant', '✦'), ft('#e4eef2', 'TERRAIN', 'land', '▲'), ft('#f2ecdf', 'EVENT', 'one use', '★'), ft('#eaf2df', 'FLORA', 'plant', '✦')]
const BACK = f('#3d6b4a', '●')

export const earth = tabletop('earth', 'Earth', [1, 5], 3, '45–90 min', 'Medium', 'Grow a 4 by 4 tableau of plants and terrain.', ['#3d8b4a', '#8a5a2b', '#2e6fb7'], (n) => ({
  setup: [
    S('Fauna board', 'Place the fauna board in the middle and deal 4 fauna cards face up onto it. Deal 2 ecosystem cards face up beside it as shared goals.', 'c', [
      C(mat('fauna', 5.2, 1.9, '#cfe0c0', 'Fauna', 'Fauna board', 'Holds 4 fauna cards. Each is a goal everyone races for: the sooner you complete it, the more points your leaf token earns.'), cards('ecoshared', 2, ft('#e9e0f2', 'ECOSYSTEM', 'shared goal', '◆'), 'Shared ecosystem cards', '2 ecosystem cards that every player can score at the end of the game.')),
      On('fauna', 0.5, 0.5, cards('faunacards', 4, ft('#f2e6d0', 'FAUNA', 'goal', '★'), 'Fauna cards', '4 fauna cards are in play each game. Players mark the ones they complete with their leaf tokens.', { gap: 0.3 })),
    ]),
    S('Earth deck and supplies', 'Shuffle the earth cards into a draw deck with room for a discard pile. Put the soil, sprouts, trunks and canopies within reach.', 'earth', [
      C(deck('earth', 60, BACK, 'Earth deck', 'A very large deck of flora, terrain and event cards. Everyone draws from it.'), zone('discard', 1.1, 1.4, 'Discard', 'Discarded earth cards go here face up.')),
      R(pile('soilpile', '#8a5a2b', 'Soil tokens', 'Soil is the currency you pay to plant cards.', 'disc'), pile('sprouts', '#3d8b4a', 'Sprouts', 'Small cubes placed on flora cards. Each sprout is worth 1 point at the end.')),
      R(pile('trunks', '#6b4a2b', 'Trunks', 'Growth pieces stacked on flora cards. Each is worth 1 point at the end.'), pile('canopies', '#5fa85a', 'Canopies', 'A canopy caps a fully grown plant and scores the bonus printed on that card.', 'disc')),
    ]),
    S('Player boards', `Each of the ${n} players takes a player board and the leaf tokens of one color, and keeps a space beside the board for compost.`, 'you', [
      P(mat('pboard', 4.4, 1.5, '$', 'Actions', 'Player board', 'Lists the four actions (planting, composting, watering and growing) and what the active player and everyone else gets from each.'), zone('compost', 1.1, 1.4, 'Compost', 'Composted cards go here face down. Each is worth 1 point at the end.')),
    ]),
    S('Island, climate and ecosystem', 'Deal each player 1 island card, 1 climate card and 1 ecosystem card, and let each player choose which side of each to use.', 'you', [
      P(cards('island', 1, ft('#dfeef2', 'ISLAND', 'start', '▲'), 'Island card', 'One per player. It tells you how many earth cards to draw at the start, how many of them to compost and how much soil you begin with.'), cards('climate', 1, ft('#f2eadf', 'CLIMATE', 'ability', '★'), 'Climate card', 'One per player. It gives you an ability for the whole game.'), cards('ecosystem', 1, ft('#e9e0f2', 'ECOSYSTEM', 'your goal', '◆'), 'Ecosystem card', 'One per player. A goal that only you score at the end.'), zone('tableau', 2.2, 1.4, 'Tableau', 'You plant earth cards here, building toward a grid of 4 by 4 cards.')),
    ], 'The rulebook suggests particular sides for a first game.'),
    S('Starting hand and soil', 'Follow your island card: draw the number of earth cards it shows, compost as many of them as it says, and take the starting soil it lists.', 'hand', [
      P(cards('hand', 4, EARTH, 'Your hand', 'Earth cards you may plant later. The number you start with depends on your island card; four are drawn here as an example.'), discs('soil', 1, 0.25, '#8a5a2b', 'Your soil', 'Your starting soil. The amount is set by your island card.', { h: 0.2 })),
    ]),
    S('Ready to play', 'Pick a first player at random and give them the first player token. Turns pass clockwise.', 'all', [], n === 1 ? 'The solo game is played against an automated opponent with its own rules in the rulebook.' : 'On your turn you choose one of four actions. You get its stronger version and everyone else gets a weaker version at the same time.'),
  ],
  turn: [
    T('Choose planting', 'You are the active player and choose planting. You may plant up to 2 cards from your hand into your tableau, paying their soil cost.', 'you', [mv('hand.0', at('tableau', 0.25, 0.5)), mv('hand.1', at('tableau', 0.75, 0.5))]),
    T('Draw four, keep one', 'Planting also lets the active player draw 4 earth cards, keep 1 and discard the rest.', 'earth', [draw('earth', at('hand.3', 1.15, 0.5, 0.02))]),
    T('Everyone else follows', 'Each other player takes the lesser version at the same time: plant 1 card and draw 1 card.', 'tableau@1', [mv('hand.2@1', at('tableau@1', 0.5, 0.5, 0.04)), draw('earth', at('hand.3@1', 1.8, 0.5, 0.04))]),
    T('Activate matching abilities', 'Then every player activates all the green abilities in their own tableau, in order. Here one of your cards gives you a sprout.', 'tableau', [spawn(cubes('sprout', 1, '#3d8b4a', 'Sprout', 'A sprout on a flora card. Worth 1 point at the end.', { s: 0.2 }), at('hand.0', 0.5, 0.5), 'sprouts')]),
    T('The next turn', 'The next player chooses an action, say composting. As a non-active player you take its lesser reward, for example 2 soil.', 'you', [spawn(discs('moresoil', 2, 0.17, '#8a5a2b', 'Soil gained', 'Soil taken as the lesser reward of the composting action.', { h: 0.06 }), by('soil', 0, 0.7), 'soilpile')]),
    T('End of the game', 'When a player completes a 4 by 4 tableau they earn a bonus, and the round is finished so that everyone has had the same number of turns. Add up cards, sprouts, growth, compost, fauna and ecosystems: the most points wins.', 'all'),
  ],
}))
