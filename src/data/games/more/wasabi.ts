/** Wasabi!: ingredient tiles on a shared grid, secret recipes, action cards and wasabi cubes. */
import { C, L, P, R, S, T, at, board, box, deck, draw, f, ft, mv, pile, spawn, tabletop, tiles, zone } from '../compose'
import { gridUV } from '../layouts'

const ING = ['#f2a48f', '#f6f1e6', '#7fb069', '#f3c14b', '#d9534f', '#3f5d4a']
const ingFace = (k: number) => f(ING[k], ['◆', '●', '▲', '★', '✦', '≡'][k], '#2b241c')
const RECIPE = ft('#fbf6ea', 'Recipe', 'ingredients', '≡')
const cell = gridUV(7, 7)
const INGBODY = 'A square tile showing one sushi ingredient. You place one on the board each turn to build your recipes.'

export const wasabi = tabletop('wasabi', 'Wasabi!', [2, 4], 3, '45 min', 'Easy', 'Line up ingredients to complete sushi recipes.', ['#7fb069', '#f2a48f', '#2b241c'], (n) => ({
  setup: [
    S('Lay out the board', `Put the board in the middle of the table. It is a grid of squares that slowly fills with ingredient tiles. With ${n} players you use ${n === 2 ? 'only the 5 lightest columns' : n === 3 ? 'the 6 lightest columns' : 'all 7 columns'}.`, 'c', [
      C(board('grid', 7, 7, 'g:grid:7x7:#e9dfc8:#7fb069:Sushi board', 'Board', 'A square grid shared by all players. Green dots on the real board show how many columns to use: 5 with 2 players, 6 with 3 and all 7 with 4.')),
    ]),
    S('Stock the pantry', 'Sort the 72 ingredient tiles by type into face-up stacks beside the board. This is the pantry that everyone draws from.', 'r', [
      R(tiles('pantry', 6, 0.8, 0.8, [0, 1, 2, 3, 4, 5].map(ingFace), 'Pantry', 'Face-up stacks of ingredient tiles, sorted into six categories marked by background colour. You choose which ingredient to take.', { h: 0.4, cols: 3 })),
    ]),
    S('Action cards and wasabi cubes', `Lay the action cards face up beside the board (${n === 2 ? 'one of each of the 5 types' : n === 3 ? '7 cards: 2 Wasabi!, 2 Spicy! and one each of Chop!, Switch! and Stack!' : 'all 10 cards'} with ${n} players) and put the green wasabi cubes in a supply.`, 'l', [
      L(deck('actions', n === 2 ? 5 : n === 3 ? 7 : 10, f('#d9534f', '✦'), 'Action cards', 'Special one-use moves such as swapping, chopping or stacking tiles. You earn one for each recipe you complete and may hold at most 2.')),
      L(pile('cubes', '#7fb069', 'Wasabi cubes', 'Bonus points. You earn them for completing a recipe of 3 or more ingredients "with style", meaning they lie in exactly the order shown on the recipe, and for playing a Wasabi! card.')),
    ]),
    S('Screens and recipes', 'Sort the recipe strips by length into face-down stacks. Each player takes a screen, a bowl and 10 challenge tokens of one colour, then draws 3 recipes of any lengths and slots them into the screen.', 'you', [
      P(
        deck('menu', 3, RECIPE, 'Your recipes', 'Your 3 secret recipe strips. Each lists 2 to 5 ingredients that must lie next to each other in one straight line, in any order. Your challenge tokens limit how many recipes of each length you can complete, and longer ones are worth more.'),
        zone('done', 2.4, 1.4, 'Completed recipes', 'Recipes you finish are shown to everyone and kept here for scoring.'),
      ),
      P(box('screen', 3.4, 0.5, 0.2, '$', 'Screen', 'Hides your ingredient tiles and recipes from the other players.')),
    ]),
    S('Starting ingredients', 'The starting player picks 3 ingredient tiles from the pantry for the player on their left, and so on round the table. Hide them behind your screen.', 'you', [
      P(tiles('ing', 3, 0.8, 0.8, [ingFace(0), ingFace(2), ingFace(1)], 'Ingredient tile', INGBODY)),
    ], 'A starting hand must be 3 different categories, with no rice, maki or one-of-a-kind ingredients.'),
    S('Ready to play', 'Choose a starting player; play passes clockwise.', 'all', [], 'On your turn you must place one ingredient tile on the board and may also play one action card. Claim any recipe you completed, then refill to 3 tiles and 3 recipes. You may instead pass to swap out recipes.'),
  ],
  turn: [
    T('Place an ingredient', 'You put one of your tiles on any empty square of the board.', 'grid', [mv('ing.0', at('grid', ...cell(3, 3)))]),
    T('Restock', 'You take any one ingredient from the pantry so you have 3 tiles again.', 'you', [
      spawn(tiles('ing9', 1, 0.8, 0.8, ingFace(3), 'Ingredient tile', INGBODY), at('ing', 0.153, 0.5, -0.08), 'pantry.3'),
    ]),
    T('The next player completes a recipe', 'The player on your left adds a tile next to yours. Those two ingredients in a line are exactly what one of their short recipes asks for, so they reveal it.', 'grid', [
      mv('ing.1@1', at('grid', ...cell(4, 3))),
      draw('menu@1', at('done@1', 0.3, 0.5), RECIPE),
    ]),
    T('Rewards', 'They lay the recipe face up with a matching challenge token on it and take an action card to use on a later turn. Completing a recipe of 3 or more ingredients in the printed order also earns wasabi cubes.', 'done@1', [
      draw('actions', at('done@1', 0.75, 0.5)),
    ]),
    T('How it ends', 'A player who uses all 10 challenge tokens wins at once. Otherwise the game ends when the board is full at the end of a turn: add your challenge token points to your wasabi cubes, and the highest total wins.', 'all'),
  ],
}))
