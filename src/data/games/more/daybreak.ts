/** Daybreak: a shared climate board, a world power board per player, and stacks of local projects. */
import { C, On, P, R, S, T, at, board, cards, cubes, deck, dice, draw, f, ft, hide, mat, mv, pile, roll, set, spawn, tabletop } from '../compose'
import { slotUV } from '../layouts'

const SL = slotUV(4, 2)
const LOCAL = [ft('#e3f1ee', 'LOCAL', 'project', '✦'), ft('#eef1e3', 'LOCAL', 'project', '▲'), ft('#e3ebf1', 'LOCAL', 'project', '◆'), ft('#f1ece3', 'LOCAL', 'project', '★'), ft('#e3f1ee', 'LOCAL', 'project', '●')]

export const daybreak = tabletop('daybreak', 'Daybreak', [1, 4], 3, '60–90 min', 'Medium', 'Work together to stop climate change.', ['#2f8f83', '#e0b12f', '#c0392b'], (n) => ({
  setup: [
    S('Game board', 'Place the game board in the middle of the table and set its markers to their starting positions.', 'c', [
      C(board('main', 11, 7.4, 'g:slots:4x2:#dfe9e4:#2f8f83:Game board', 'Game board', 'Shared by everyone. It holds the thermometer, the planetary effects, spaces for crisis cards and global projects, and the round tracker. This drawing is schematic.')),
      On('main', 0.5, 0.5, dice('pdie', 1, '#e9e4d8', 'Planetary effects die', 'Rolled in the crisis stage to see which planetary effect gets worse. The hotter the planet, the more often it is rolled.', { size: 0.5 })),
    ]),
    S('Shared decks and tokens', 'Shuffle the crisis cards, the global project cards and the local project cards into three separate decks. Put the carbon cubes and other tokens within reach.', 'r', [
      R(deck('crisis', 30, f('#c0392b', '!'), 'Crisis deck', 'Bad news. Crisis cards are drawn each round and resolved in the crisis stage.'), deck('global', 20, f('#2f8f83', '★'), 'Global project deck', 'Projects that help every player. The group chooses one each round.'), deck('local', 60, f('#e0b12f', '✦'), 'Local project deck', 'The main deck. Each player draws a fresh hand from it every round.')),
      R(pile('carbonpile', '#3a3a3a', 'Carbon cubes', 'Stand for emissions. Carbon that the trees and oceans cannot absorb goes onto the thermometer.'), pile('tokens', ['#3a3a3a', '#3d8b4a', '#e9e4d8'], 'Energy and other tokens', 'Dirty and clean energy, resilience, and communities in crisis are all tracked with tokens on the player boards.', 'disc')),
    ]),
    S('World powers', `Each of the ${n} players takes one world power board and sets it up with the starting energy, emissions and resilience printed on it.`, 'you', [
      P(mat('power', 4.6, 2.6, '$', 'World power', 'World power board', 'One per player. It tracks your energy demand, dirty and clean energy, emissions, resilience and communities in crisis.')),
    ], n < 4 ? 'There are four world powers in the box. Check the rulebook for how to set up with fewer than four players.' : 'The four powers are the United States, China, Europe and the Majority World.'),
    S('Starting projects', 'Lay out your world power\'s starting local project cards face up in a row below your board. Each one is the top of a stack you can build on.', 'start', [
      P(cards('start', 5, LOCAL, 'Starting local projects', 'Each world power has its own starting projects, laid out as separate stacks. A stack\'s top card is the action you can use.')),
    ]),
    S('Draw a hand', 'Each player draws a hand of local project cards. The standard hand is 5 cards, but confirm the number in the rulebook.', 'hand', [
      P(cards('hand', 5, LOCAL, 'Your hand', 'Local project cards drawn for this round. You can start a new project with a card, tuck it behind a stack for its tags, or discard it to pay for a project.')),
    ]),
    S('Ready to play', 'There is no first player. Everyone plays through each round together, stage by stage: global, local, emissions, crisis and growth.', 'all', [], 'Players plan and act at the same time in the local stage, and may talk freely.'),
  ],
  turn: [
    T('Global stage', 'Draw this round\'s crisis cards and put them face down on the board. Then reveal global projects and choose one together. How many crisis cards you draw depends on the temperature.', 'main', [
      draw('crisis', at('main', ...SL(0)), undefined, 'cr1'),
      draw('global', at('main', ...SL(4)), ft('#e3f1ee', 'GLOBAL', 'project', '★')),
    ]),
    T('Local stage', 'Everyone plays cards at once. You put one card on top of a stack as a new project, tuck another behind a stack to add its tags, and discard a third to pay for a project.', 'you', [
      mv('hand.0', at('start.1', 0.5, 0.5, 0.02)), mv('hand.1', at('start.3', 0.5, 0.3, 0.02)), hide('hand.2'),
    ]),
    T('Emissions stage', 'Each player produces carbon for their dirty energy and other emissions. Trees and oceans absorb some; the rest goes onto the thermometer, and a full row raises the temperature.', 'main', [
      spawn(cubes('carbon', 3, '#3a3a3a', 'Carbon on the thermometer', 'Emissions that nothing absorbed this round.', { s: 0.22 }), at('main', 0.25, 0.5), 'carbonpile'),
    ]),
    T('Crisis stage', 'Roll the planetary effects die as often as the temperature demands, then reveal and resolve the crisis cards. Resilience on your board softens the damage.', 'main', [roll('pdie', 4), set('cr1', { faceUp: true, face: ft('#f6dcd6', 'CRISIS', 'resolve', '!') })]),
    T('Growth, and how it ends', 'In the growth stage energy demand rises and a new round begins. You all win by reaching drawdown, a round in which you remove at least as much carbon as you emit, and then surviving its crisis stage. You all lose if the temperature climbs too high, if any player has too many communities in crisis, or if you run out of rounds.', 'all', [], 10),
  ],
}))
