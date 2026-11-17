/** Project L: two rows of puzzles, a reserve of pieces, and a player mat that holds up to four puzzles. */
import { C, P, R, S, T, at, by, cards, deck, draw, f, ft, mat, mv, spawn, tabletop, tiles, zone } from '../compose'

const SHAPE = ['#e0b12f', '#3d8b4a', '#d9772b', '#2e6fb7', '#7a4fa3', '#c0392b', '#4fb7b0', '#c96bb0', '#8a8f96']
const WHITE = ft('#fbf6ea', 'PUZZLE', 'points and reward', '▦')
const BLACK = ft('#cfc8bd', 'PUZZLE', 'more points', '▦')
const unit = (id: string) => tiles(id, 1, 0.35, 0.35, SHAPE[0], 'Level 1 piece', 'The smallest piece, a single square. Taking one from the reserve is an upgrade action.', { h: 0.1 })

export const projectL = tabletop('project-l', 'Project L', [2, 4], 3, '20–40 min', 'Easy', 'Fill puzzles with pieces to win bigger pieces.', ['#2b2b2b', '#e0b12f', '#2e6fb7'], (n) => {
  const black = n === 2 ? 12 : n === 3 ? 14 : 16
  return {
    setup: [
      S('White puzzles', 'Shuffle the white puzzles into a face-down deck and turn 4 of them face up in a row.', 'white', [
        C(deck('wdeck', 28, f('#f3ecdc', 'L', '#2b241c'), 'White puzzle deck', 'The easier puzzles. Most are worth few or no points but reward you with a new piece.', { w: 1.5, d: 1.5 }), cards('white', 4, WHITE, 'White puzzles', 'Each puzzle shows the points it scores and the piece you earn for finishing it.', { w: 1.5, d: 1.5 })),
      ]),
      S('Black puzzles', `Take ${black} black puzzles at random for a ${n}-player game, shuffle them into a deck, and turn 4 face up in a second row. Return the others to the box.`, 'black', [
        C(deck('bdeck', black - 4, f('#2b2b2b', 'L'), 'Black puzzle deck', `The harder, higher-scoring puzzles. Use 12 with 2 players, 14 with 3 and 16 with 4, so ${black} here. When this deck runs out the game is nearly over.`, { w: 1.5, d: 1.5 }), cards('black', 4, BLACK, 'Black puzzles', 'Bigger puzzles that are worth more points and give better pieces.', { w: 1.5, d: 1.5 })),
      ], 'These deck sizes come from the standard rules. If your edition differs, follow the table in its rulebook.'),
      S('Piece reserve', 'Sort all the pieces by shape into a reserve that everyone can reach.', 'r', [
        R(tiles('supply', 9, 0.6, 0.6, SHAPE, 'Piece reserve', 'Nine shapes in four levels, from a single square up to pieces of four squares. The number of each depends on your edition.', { cols: 3, h: 0.3, gap: 0.2 })),
      ]),
      S('Player mats and starting pieces', 'Deal each player a mat. Everyone takes one level 1 piece (a single square) and one level 2 piece (two squares) from the reserve.', 'you', [
        P(mat('pm', 6.4, 1.9, '$', 'Player mat', 'Player mat', 'Holds the puzzles you are working on, at most 4 at a time, and lists the actions.')),
        P(unit('p1'), tiles('p2', 1, 0.7, 0.35, SHAPE[1], 'Level 2 piece', 'A piece of two squares. Each player starts with one.', { h: 0.1 }), zone('done', 1.5, 1.5, 'Finished puzzles', 'Completed puzzles are kept here face down and scored at the end.')),
      ], 'There is also a solo variant with its own rules, which this walkthrough does not cover.'),
      S('Ready to play', 'The player whose mat carries the first player mark starts, then play passes clockwise.', 'all', [], 'On your turn you take 3 actions, in any mix: take a puzzle, upgrade a piece, place a piece, or (once per turn) a master action.'),
    ],
    turn: [
      T('Action 1: take a puzzle', 'You take a white puzzle from the row onto your mat, and the gap is refilled from the deck.', 'white', [
        mv('white.1', at('pm', 0.15, 0.5)), draw('wdeck', by('white.0', 1.64, 0), WHITE),
      ]),
      T('Action 2: place a piece', 'You put your single square into the puzzle. Pieces must lie flat inside the outline without overlapping and stay there until the puzzle is finished.', 'you', [mv('p1', at('white.1', 0.35, 0.4))]),
      T('Action 3: upgrade', 'An upgrade either takes a new level 1 piece from the reserve, or swaps one of your pieces for one up to a level higher. You take a new square.', 'you', [spawn(unit('p3'), by('p2', -1.025, 0), 'supply.0')]),
      T('Next player', 'The next player spends an action taking a black puzzle. Their once-per-turn master action can later place one piece into every puzzle on their mat at the same time.', 'black', [
        mv('black.2', at('pm@1', 0.15, 0.5)), draw('bdeck', by('black.1', 1.64, 0), BLACK),
      ]),
      T('Complete a puzzle', 'When a puzzle is full you take all its pieces back, gain the reward piece it shows, and keep the puzzle for its points.', 'you', [
        mv('p1', by('p2', -1.6, 0)), mv('white.1', at('done', 0.5, 0.5)),
        spawn(tiles('reward', 1, 0.7, 0.35, SHAPE[1], 'Reward piece', 'The piece printed on a finished puzzle, taken from the reserve.', { h: 0.1 }), by('p2', -2.4, 0), 'supply.1'),
      ]),
      T('End of the game', 'When the black deck runs out, finish the round and play one more. You may then finish puzzles at a cost of 1 point per piece placed. Unfinished puzzles lose you their points; the highest total wins.', 'all'),
    ],
  }
})
