/** Terraforming Mars: the Mars map with its global parameters, a project deck and a board per player. */
import { C, On, OnMe, OnP, P, R, S, T, at, board, cards, cubes, deck, discs, f, ft, hexes, hide, mat, mv, pile, set, spawn, tabletop, zone } from '../compose'
import { hexUV } from '../layouts'

const H = hexUV(9, 7)
const PROJECT = [ft('#e6f0dc', 'PROJECT', 'green', '▲'), ft('#dce8f2', 'PROJECT', 'blue', '◆'), ft('#f2dcd6', 'EVENT', 'red', '★')]

export const terraformingMars = tabletop('terraforming-mars', 'Terraforming Mars', [1, 5], 3, '120 min', 'Hard', 'Corporations compete to make Mars habitable.', ['#b5532f', '#2e6fb7', '#3d8b4a'], (n) => ({
  setup: [
    S('The board and global parameters', 'Place the board in the middle. Stack the 9 ocean tiles on their space, put the temperature marker at -30 degrees, the oxygen marker at 0% and the generation marker at 1.', 'c', [
      C(board('mars', 11, 8, 'g:hex:9x7:#b5532f:#e8a26b:Mars', 'Game board', 'A hex map of Mars surrounded by the terraform rating track, with scales for temperature and oxygen. This drawing is schematic.')),
      On('mars', 0.07, 0.08, discs('oceans', 1, 0.3, '#2e6fb7', 'Ocean tiles', '9 ocean tiles. Placing all of them is one of the three goals that end the game.', { h: 0.4, label: '9' })),
      On('mars', 0.97, 0.85, cubes('temp', 1, '#e9e4d8', 'Temperature marker', 'Starts at -30 degrees and must reach +8, rising 2 degrees per step.', { s: 0.22 })),
      On('mars', 0.4, 0.025, cubes('oxygen', 1, '#e9e4d8', 'Oxygen marker', 'Starts at 0% and must reach 14%.', { s: 0.22 })),
      On('mars', 0.03, 0.6, cubes('gen', 1, '#e9e4d8', 'Generation marker', 'Counts the rounds, called generations. It starts at 1.', { s: 0.22 })),
    ]),
    S('Supplies and project deck', 'Shuffle the project cards into a deck beside the board, and put the resource cubes and the greenery and city tiles within reach.', 'r', [
      R(deck('projects', 60, f('#3a2c20', '●'), 'Project deck', 'A big deck of project cards. Which cards are included depends on whether you add the Corporate Era cards.'), zone('discard', 1.1, 1.4, 'Discard', 'Project cards that are not bought, and played events, end up here face down.')),
      R(pile('resources', ['#b87333', '#c0c0c0', '#e0b12f'], 'Resource cubes', 'Bronze cubes count as 1, silver as 5 and gold as 10. They mark every kind of resource on your player board.'), hexes('tiles', 2, 0.45, ['#3d8b4a', '#8d8d8d'], 'Greenery and city tiles', 'Double-sided tiles, greenery on one side and city on the other. They are marked with the owner\'s cube when placed.', { label: ['G', 'C'] })),
    ]),
    S('Player boards', `Each of the ${n} players takes a player board and the markers of one color. In the standard game everyone starts with 1 production of each of the six resources.`, 'you', [
      P(mat('pboard', 4.4, 2.4, '$', 'Player board', 'Player board', 'Tracks your stock and your production of megacredits, steel, titanium, plants, energy and heat.'), zone('played', 1.5, 2.2, 'Played cards', 'Project cards you have played stay in front of you.')),
      On('pboard', 0.5, 0.35, cubes('prod', 6, '$', 'Production markers', 'One marker on each of the six production tracks. They start at 1 in the standard game.', { s: 0.2, gap: 0.45 })),
    ], 'If you play with the Corporate Era cards, production starts at 0 instead.'),
    S('Terraform rating', n === 1 ? 'Put your marker on the terraform rating track. The solo game starts at 14 rather than 20 and has other special rules.' : 'Each player puts a marker on 20 on the terraform rating track round the edge of the board.', 'mars', [
      OnP('mars', 0.3, 0.975, discs('tr', 1, 0.12, '$', 'Terraform rating marker', 'Your terraform rating is both your basic income and your basic score. It rises each time you raise a global parameter.', { h: 0.1 }), [0.3, 0]),
      OnMe('pboard', 0.92, 0.85, discs('first', 1, 0.15, '#e9e4d8', 'First player marker', 'Passes clockwise at the start of each new generation.', { h: 0.06, label: '1', ink: '#2b241c' })),
    ]),
    S('Corporations and starting cards', 'Deal each player 2 corporation cards and 10 project cards. A new player can instead take a beginner corporation, which starts with 42 megacredits and keeps all 10 cards for free.', 'hand', [
      P(cards('corp', 2, ft('#f3ecdc', 'CORP', 'choose 1', '♛'), 'Corporation cards', 'You are dealt 2 and keep 1. It sets your starting money and gives you a special ability.'), cards('hand', 10, PROJECT, 'Project cards', 'Your 10 starting cards. You may keep any of them, at 3 megacredits each.', { w: 0.7, d: 0.98, cols: 5 })),
    ]),
    S('Ready to play', 'Give the first player marker to a random player. In the first generation you skip straight to the action phase.', 'all', [], 'On your turn take 1 or 2 actions, or pass. The generation ends when everyone has passed.'),
  ],
  turn: [
    T('Choose a corporation and buy cards', 'Everyone picks 1 of their 2 corporations, takes its starting money, and pays 3 megacredits for each project card they keep. The rest are discarded.', 'you', [hide('corp.1'), hide('hand.7'), hide('hand.8'), hide('hand.9')]),
    T('Play a project card', 'On your turn you pay a card\'s cost and play it. This one raises one of your productions by a step.', 'you', [mv('hand.0', at('played', 0.5, 0.5)), mv('prod.1', at('pboard', 0.278, 0.18))]),
    T('A standard project', 'The next player uses a standard project instead: for 18 megacredits they place an ocean tile, which raises their terraform rating by 1.', 'mars', [
      spawn(hexes('oc', 1, 0.45, '#2e6fb7', 'Ocean tile', 'An ocean on the map. Tiles placed next to it later earn a small bonus.'), at('mars', ...H(4, 3)), 'oceans'),
      set('oceans', { label: '8' }),
      mv('tr@1', at('mars', 0.55, 0.975)),
    ]),
    T('Production', 'When everyone has passed, all energy turns into heat and each player collects megacredits equal to their terraform rating plus their production, and the other resources they produce. Then the next generation begins.', 'mars', [mv('gen', at('mars', 0.03, 0.52)), mv('first', at('pboard@1', 0.92, 0.85))]),
    T('End of the game', 'The game ends after the generation in which oxygen reaches 14%, temperature reaches +8 and all 9 oceans are placed. Add terraform rating, milestones, awards, tiles on the map and card points: the highest total wins.', 'all'),
  ],
}))
