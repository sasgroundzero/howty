/** Daybreak: a shared climate board, a world power board per player, and stacks of local projects. */
import { C, On, P, R, S, T, at, board, cards, cubes, deck, dice, draw, f, ft, hide, mat, mv, pile, roll, set, spawn, tabletop } from '../compose'
import { slotUV } from '../layouts'

const SL = slotUV(4, 2)
const LOCAL = [ft('#e3f1ee', 'LOCAL', 'project', '✦'), ft('#eef1e3', 'LOCAL', 'project', '▲'), ft('#e3ebf1', 'LOCAL', 'project', '◆'), ft('#f1ece3', 'LOCAL', 'project', '★'), ft('#e3f1ee', 'LOCAL', 'project', '●')]

export const daybreak = tabletop('daybreak', 'Daybreak', [1, 4], 3, '60–90 min', 'Medium', 'Work together to stop climate change.', ['#2f8f83', '#e0b12f', '#c0392b'], (n) => ({
  setup: [
    S('Game board', `Place the game board in the middle of the table. Put the round token on space 1, the six planetary effects tokens on their start spaces, and the temperature bands and both dice by the thermometer. Add ${n === 4 ? '24 tree and 16 ocean' : n === 3 ? '16 tree and 12 ocean' : n === 2 ? '11 tree and 7 ocean' : '6 tree and 4 ocean'} tokens anywhere on the map.`, 'c', [
      C(board('main', 11, 7.4, 'g:slots:4x2:#dfe9e4:#2f8f83:Game board', 'Game board', 'Shared by everyone. It holds the thermometer, the planetary effects, spaces for crisis cards and global projects, and the round tracker. This drawing is schematic.')),
      On('main', 0.5, 0.5, dice('pdie', 1, '#e9e4d8', 'Planetary effects die', 'Rolled in the crisis stage to see which planetary effect gets worse. The hotter the planet, the more often it is rolled.', { size: 0.5 })),
    ]),
    S('Shared decks and tokens', 'Shuffle the crisis cards, the global project cards and the local project cards into three separate decks. Leave the challenge cards out for a first game. Put the carbon cubes and other tokens within reach.', 'r', [
      R(deck('crisis', 48, f('#c0392b', '!'), 'Crisis deck', 'Bad news. Crisis cards are drawn each round and resolved in the crisis stage.'), deck('global', 24, f('#2f8f83', '★'), 'Global project deck', 'Projects that help every player. Each round the group draws 2 and may start one of them.'), deck('local', 60, f('#e0b12f', '✦'), 'Local project deck', 'The main deck. Each player draws a fresh hand from it every round.')),
      R(pile('carbonpile', '#3a3a3a', 'Carbon cubes', 'Stand for emissions. Carbon that the trees and oceans cannot absorb goes onto the thermometer.'), pile('tokens', ['#3a3a3a', '#3d8b4a', '#e9e4d8'], 'Energy and other tokens', 'Dirty and clean energy, resilience, and communities in crisis are all tracked with tokens on the player boards.', 'disc')),
    ]),
    S('World powers', `Each of the ${n} players takes one world power board and its reference card, and sets the energy demand, dirty and clean energy, emissions, resilience and communities in crisis shown on the reference card.`, 'you', [
      P(mat('power', 4.6, 2.6, '$', 'World power', 'World power board', 'One per player. It tracks your energy demand, dirty and clean energy, emissions, resilience and communities in crisis.')),
    ], n === 3 ? 'With 3 players use the Majority World, Europe and the United States.' : n === 2 ? 'With 2 players use China and the United States.' : n === 1 ? 'Solo, play any one power and leave out every card marked as not for solo play.' : 'The four powers are the United States, China, Europe and the Majority World.'),
    S('Starting projects', 'Lay out your world power\'s 5 starting local project cards face up in a row above your board. This is your play area, and each card starts a stack you can build on.', 'start', [
      P(cards('start', 5, LOCAL, 'Starting local projects', 'Each world power has its own starting projects, laid out as separate stacks. A stack\'s top card is the action you can use.')),
    ]),
    S('Draw a hand', 'Hands are drawn in each local stage: everyone draws 5 local project cards and keeps them face up, since hands are public.', 'hand', [
      P(cards('hand', 5, LOCAL, 'Your hand', 'Local project cards drawn for this round. You can start a new project with a card, tuck it behind a stack for its tags, or discard it to pay for a project.')),
    ]),
    S('Ready to play', 'There is no first player. Everyone plays through each round together, stage by stage: global, local, emissions, crisis and growth.', 'all', [], 'Players plan and act at the same time in the local stage, and may talk freely.'),
  ],
  turn: [
    T('Global stage', 'Draw this round\'s crisis cards: the first goes face up as the forecast, the rest face down. Then draw 2 global projects and together keep one or neither. The temperature sets how many crisis cards you draw, 3 at the start.', 'main', [
      draw('crisis', at('main', ...SL(0)), undefined, 'cr1'),
      draw('global', at('main', ...SL(4)), ft('#e3f1ee', 'GLOBAL', 'project', '★')),
    ]),
    T('Local stage', 'Everyone draws 5 cards and plays at once. You put one card on the front of a stack as a new project, tuck another behind a stack to add its tags, and discard a third to pay for an action.', 'you', [
      mv('hand.0', at('start.1', 0.5, 0.5, 0.02)), mv('hand.1', at('start.3', 0.5, 0.3, 0.02)), hide('hand.2'),
    ]),
    T('Emissions stage', 'Anyone short of their energy demand gains communities in crisis. Each player then produces 1 carbon per dirty energy and emissions token. Trees and oceans absorb some; the rest goes onto the thermometer, and a full row becomes a temperature band.', 'main', [
      spawn(cubes('carbon', 3, '#3a3a3a', 'Carbon on the thermometer', 'Emissions that nothing absorbed this round.', { s: 0.22 }), at('main', 0.25, 0.5), 'carbonpile'),
    ]),
    T('Crisis stage', 'Roll the planetary effects die once per temperature band, then reveal and resolve the crisis cards, starting with the forecast. Resilience on your board softens the damage.', 'main', [roll('pdie', 4), set('cr1', { faceUp: true, face: ft('#f6dcd6', 'CRISIS', 'resolve', '!') })]),
    T('Growth, and how it ends', 'In the growth stage, check for a win, then energy demand rises and a new round begins. You all win by reaching drawdown, sequestering all of a round\'s new carbon with trees and oceans to spare, and then surviving that round\'s crisis stage. You all lose at 8 temperature bands, if any player has 12 communities in crisis, or if you have not won by the end of round 6.', 'all', [], 10),
  ],
}))
