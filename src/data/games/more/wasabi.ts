/** Wasabi!: ingredient tiles on a shared grid, secret recipes, action cards and wasabi cubes. */
import { C, L, P, R, S, T, at, board, box, cubes, deck, draw, f, ft, mv, pile, spawn, tabletop, tiles, zone } from '../compose'
import { gridUV } from '../layouts'

const ING = ['#f2a48f', '#f6f1e6', '#7fb069', '#f3c14b', '#d9534f', '#3f5d4a']
const ingFace = (k: number) => f(ING[k], ['◆', '●', '▲', '★', '✦', '≡'][k], '#2b241c')
const RECIPE = ft('#fbf6ea', 'Recipe', 'ingredients', '≡')
const cell = gridUV(7, 7)
const INGBODY = 'A square tile showing one sushi ingredient. You place one on the board each turn to build your recipes.'

export const wasabi = tabletop('wasabi', 'Wasabi!', [2, 4], 3, '45 min', 'Easy', 'Line up ingredients to complete sushi recipes.', ['#7fb069', '#f2a48f', '#2b241c'], () => ({
  setup: [
    S('Lay out the board', 'Put the board in the middle of the table. It is a grid of squares that slowly fills with ingredient tiles.', 'c', [
      C(board('grid', 7, 7, 'g:grid:7x7:#e9dfc8:#7fb069:Sushi board', 'Board', 'A square grid shared by all players. This drawing is schematic: the real grid may be a different size.')),
    ]),
    S('Stock the pantry', 'Sort the ingredient tiles by type into face-up stacks beside the board. This is the pantry that everyone draws from.', 'r', [
      R(tiles('pantry', 6, 0.8, 0.8, [0, 1, 2, 3, 4, 5].map(ingFace), 'Pantry', 'Face-up stacks of ingredient tiles, one stack per ingredient. The real game has more kinds than the six shown here. You choose which ingredient to take.', { h: 0.4, cols: 3 })),
    ]),
    S('Action cards and wasabi cubes', 'Set the special action cards out by type and put the green wasabi cubes in a supply.', 'l', [
      L(deck('actions', 12, f('#d9534f', '✦'), 'Action cards', 'Special one-use moves such as swapping or stacking tiles. You earn them by completing recipes. Keep each type in its own pile.')),
      L(pile('cubes', '#7fb069', 'Wasabi cubes', 'Bonus points. You earn them for completing a recipe "with style", meaning the ingredients lie in exactly the order shown on the recipe.')),
    ]),
    S('Screens and recipes', 'Each player takes a screen and chooses their set of secret recipe cards. Recipes come in several lengths; the rulebook says how many you take and how you may mix the lengths.', 'you', [
      P(
        deck('menu', 8, RECIPE, 'Your recipes', 'Your secret recipe cards. Each lists the ingredients that must lie next to each other in one straight line. Longer recipes are worth more.'),
        zone('done', 2.4, 1.4, 'Completed recipes', 'Recipes you finish are shown to everyone and kept here for scoring.'),
      ),
      P(box('screen', 3.4, 0.5, 0.2, '$', 'Screen', 'Hides your ingredient tiles and recipes from the other players.')),
    ]),
    S('Starting ingredients', 'Each player takes their starting ingredient tiles from the pantry and hides them behind their screen.', 'you', [
      P(tiles('ing', 3, 0.8, 0.8, [ingFace(0), ingFace(2), ingFace(1)], 'Ingredient tile', INGBODY)),
    ], 'A hand of 3 tiles is shown. Check your rulebook for the exact starting hand.'),
    S('Ready to play', 'Choose a starting player; play passes clockwise.', 'all', [], 'On your turn you place one ingredient tile on the board (or play an action card), claim a recipe if you completed one, then restock from the pantry.'),
  ],
  turn: [
    T('Place an ingredient', 'You put one of your tiles on any empty square of the board.', 'grid', [mv('ing.0', at('grid', ...cell(3, 3)))]),
    T('Restock', 'You take any one ingredient from the pantry so your hand is full again.', 'you', [
      spawn(tiles('ing9', 1, 0.8, 0.8, ingFace(3), 'Ingredient tile', INGBODY), at('ing', 0.153, 0.5, -0.08), 'pantry.3'),
    ]),
    T('The next player completes a recipe', 'The player on your left adds a tile next to yours. Those two ingredients in a line are exactly what one of their short recipes asks for, so they reveal it.', 'grid', [
      mv('ing.1@1', at('grid', ...cell(4, 3))),
      draw('menu@1', at('done@1', 0.3, 0.5), RECIPE),
    ]),
    T('Rewards', 'Completing a recipe earns a special action card to use on a later turn. Because the ingredients are also in the printed order, they complete it with style and take wasabi cubes as a bonus.', 'done@1', [
      draw('actions', at('done@1', 0.75, 0.5)),
      spawn(cubes('bonus', 2, '#7fb069', 'Wasabi cube', 'A bonus point for completing a recipe with style.', { s: 0.24 }), at('done@1', 0.3, 1.25), 'cubes'),
    ]),
    T('How it ends', 'The game ends when a player completes all of their recipes or the board is full. Add the points for your completed recipes to your wasabi cubes; the highest total wins.', 'all'),
  ],
}))
