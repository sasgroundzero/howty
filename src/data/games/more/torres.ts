/** Torres: knights climb castles built from stacking tower blocks, using 5 action points a turn. */
import { C, On, type Place, OnP, P, R, S, T, at, board, by, deck, discs, draw, ft, hide, mv, pawns, pile, spawn, tabletop, tiles, zone } from '../compose'
import { gridUV } from '../layouts'
import { COLORS } from '../kit'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })

const g = gridUV(8, 8)
const START: [number, number][] = [[1, 1], [5, 0], [3, 2], [6, 3], [1, 4], [4, 5], [7, 6], [2, 7]]
const STONE = '#d8d2c4'
const block = (id: string) => tiles(id, 1, 0.8, 0.8, STONE, 'Tower block', 'Blocks build castles. A castle may never be taller than the number of spaces its base covers.', { h: 0.3 })

export const torres = tabletop('torres', 'Torres', [2, 4], 3, '60 min', 'Medium', 'Build castles and climb them with knights.', ['#7fa36b', '#d8d2c4', '#c0392b'], (n) => ({
  setup: [
    S('Place the board', 'Put the board in the middle of the table.', 'c', [
      C(board('land', 9, 9, 'g:grid:8x8:#8fb27a:#4f7a45:Torres', 'Game board', 'An 8 by 8 grid where the castles grow, with a scoring track round the edge.')),
    ]),
    S('Starting towers', 'Put one tower block on each of the 8 marked starting spaces. These are the beginnings of the 8 castles.', 'land', [
      ...START.map(([c, r], k) => on('land', ...g(c, r), { ...block(`tower${k}`), title: 'Starting tower' })),
      R(pile('blocks', STONE, 'Tower block supply', '92 tower blocks in the box. Players take their share for each year from here.')),
    ], 'The squares in this drawing are schematic: use the spaces marked on the real board.'),
    S('Knights and markers', 'Each player takes the 6 knights, the scoring marker and the 10 action cards of one color, shuffles the action cards into a face-down deck, and puts the marker at the start of the scoring track. Put out the phases card for your player count.', 'all', [
      P(pile('knights', '$', 'Your knights', '6 knights per player. One starts on the board; the rest wait here until you spend action points to place them.', 'meeple'), deck('acts', 10, ft('#efe2bd', 'ACTION', 'card', '✦'), 'Your action cards', 'Each player has their own set of 10 action cards that bend the rules for one turn.'), zone('held', 1.2, 1.5, 'Hand', 'Action cards you have bought wait here until you play them.'), tiles('mine', 3, 0.6, 0.6, STONE, 'Your blocks', 'Before each year you take blocks in small stacks as the phases card shows (with 4 players, four stacks of 2 in year one, then three stacks of 2). Each turn you build from one stack.', { h: 0.3 })),
      OnP('land', 0.5, 0.978, discs('score', 1, 0.13, '$', 'Scoring marker', 'Moves along the scoring track at the end of each year.'), [0.34, 0]),
    ]),
    S('First knights and the king', 'Starting with the youngest player and going clockwise, each player puts one knight on a different empty starting tower. The last player then puts the king on any empty tower.', 'land', [
      ...Array.from({ length: n }, (_, i) => on(`tower${i}`, 0.5, 0.5, pawns(`knight${i}`, 1, COLORS[i], 'Knight', 'Scores the size of the castle it stands on multiplied by the level it stands at.', { scale: 0.5 }))),
      on('tower7', 0.5, 0.5, pawns('king', 1, '#e0b12f', 'King', 'Knights in the king’s castle at the right level earn a bonus at each scoring.', { scale: 0.6, shape: 'boss' })),
    ], 'The tower holding the king is the king\'s castle for the first year.'),
    S('Ready to play', 'The youngest player starts; play passes clockwise. The game lasts three years: 4 rounds in the first, then 3 in each of the others (4 in every year with 2 players).', 'all', [], 'On your turn you have 5 action points: place a knight (2), move a knight (1), build a block (1), buy an action card (1), or score a point (1). Playing an action card is free.'),
  ],
  turn: [
    T('Place a knight', 'For 2 action points you put a new knight on a space next to one of your knights, at the same level or lower.', 'land', [
      spawn(pawns('k2', 1, '$', 'Knight', 'A newly placed knight.', { scale: 0.5 }), at('land', ...g(2, 1)), 'knights'),
    ]),
    T('Build a block', 'For 1 action point you add one of your blocks to a castle, here widening the base of yours.', 'land', [
      hide('mine.0'),
      spawn({ ...block('added'), title: 'New block' }, at('land', ...g(1, 2)), 'mine.0'),
    ]),
    T('Move a knight', 'For 1 action point a knight moves to a neighbouring space. It may climb one level up or drop any number of levels.', 'land', [
      mv('k2', at('added', 0.5, 0.5)),
    ]),
    T('Buy an action card', 'With your last action point you look at the top 3 cards of your action deck and keep one to play on a later turn.', 'you', [
      draw('acts', at('held', 0.5, 0.5)),
    ]),
    T('Scoring and the finish', 'At the end of each year you score each castle you have a knight in: its base area times the level of your highest knight there. A knight on the right level of the king’s castle adds the king’s bonus. After the third year the highest score wins.', 'land', [
      mv('score', at('land', 0.7, 0.978)),
    ]),
  ],
}))
