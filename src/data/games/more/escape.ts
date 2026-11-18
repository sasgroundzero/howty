/** Escape: The Curse of the Temple: ten minutes of frantic real-time dice rolling. */
import { C, OnP, P, R, S, T, at, dice, ft, mv, pawns, pile, roll, spawn, tabletop, tiles, zone } from '../compose'

const ROOM = ft('#cdb98a', '', '', '▲')

export const escape = tabletop('escape', 'Escape: The Curse of the Temple', [1, 5], 4, '10 min', 'Easy', 'Roll dice in real time to flee the temple.', ['#cdb98a', '#3d8b4a', '#8a5a2b'], (n) => ({
  setup: [
    S('Lay the starting chambers', 'Put the start chamber in the middle of the table and attach two tiles drawn at random from the shuffled chamber stack, stairways touching the start chamber.', 'c', [
      C(tiles('rooms', 3, 1.9, 1.9, [ROOM, ft('#cdb98a', 'START', '', '⌂'), ROOM], 'Starting chambers', 'The start tile with two chambers attached. Everyone begins in the start chamber and returns to it when the gong sounds.', { gap: 0.04 }), zone('next', 1.9, 1.9, 'Next chamber', 'New chambers are attached to an open door of the temple as they are discovered.')),
    ]),
    S('Build the chamber stack', n <= 2 ? 'Use the 6 main and 13 basic chambers. Set aside the start and exit, shuffle the rest face down into a stack, and with 1 or 2 players put the exit in the middle of the stack.' : 'Use the 6 main and 13 basic chambers. Set aside the start and exit and shuffle the rest face down into a stack. Shuffle the exit with the bottom 4 tiles and put those 5 back at the bottom.', 'r', [
      R(tiles('stack', 1, 1.9, 1.9, '#8a5a2b', 'Chamber stack', 'The rest of the temple, drawn one tile at a time as you discover new rooms. Chambers with a purple mask or treasure icon are only for the expansion modules.', { h: 0.7 })),
    ]),
    S('Fill the gem depot', `Place the gem depot beside the stack and put ${n <= 2 ? 7 : n === 3 ? 11 : n === 4 ? 14 : 16} magic gems on it, plus 2 more next to it.`, 'r', [
      R(
        tiles('depot', 1, 1.6, 1.6, ft('#e9e4d8', 'DEPOT', '', '◆'), 'Gem depot', 'Holds the gems you still have to activate. The fewer left here, the easier the exit is to open.'),
        pile('gems', '#3d8b4a', 'Magic gems', '7 gems for 1 or 2 players, 11 for 3, 14 for 4 and 16 for 5. The 2 beside the depot are for a turn of fate. The game has 25 gems in all.'),
      ),
    ]),
    S('Adventurers and dice', n === 1 ? 'Take 7 dice when playing alone, plus the adventurer figure and token of one color, and stand the figure in the start chamber.' : 'Each player takes 5 dice and the adventurer figure and token of one color, and stands the figure in the start chamber.', 'you', [
      P(dice('dice', n === 1 ? 7 : 5, '#e9e4d8', 'Your dice', `${n === 1 ? '7 dice when playing alone' : '5 dice per player'}. The faces are two running adventurers, a key, a torch, a black mask that locks the die, and a golden mask that unlocks up to two locked dice.`, { size: 0.5 })),
      OnP('rooms.1', 0.5, 0.78, pawns('hero', 1, '$', 'Adventurer', 'One figure per player, showing which chamber you are in.', { scale: 0.45 }), [0.36, 0]),
    ]),
    S('Ready to play', 'Start the soundtrack or a 10-minute timer. There are no turns: everyone rolls at the same time, as fast as they like.', 'all', [], 'You may reroll any dice that are not locked by a black mask, as often as you want.'),
  ],
  turn: [
    T('Everybody rolls', 'You roll all your dice and set aside the symbols you want to keep. The numbers here stand in for the symbols.', 'you', [roll('dice.0', 1), roll('dice.1', 1), roll('dice.2', 4), roll('dice.3', 6), roll('dice.4', 3)]),
    T('Discover a new chamber', 'Spend two adventurer symbols to draw the top tile of the stack and attach it to an open door of your chamber.', 'c', [
      spawn(tiles('found', 1, 1.9, 1.9, ft('#cdb98a', '', '', '◆'), 'New chamber', 'A freshly discovered chamber. Its entry symbols show what you must roll to step into it.'), at('next', 0.5, 0.5), 'stack'),
    ]),
    T('Enter it', 'Roll the symbols shown in the red frame inside the chamber and move your adventurer in.', 'c', [roll('dice.0', 2), roll('dice.1', 5), mv('hero', at('found', 0.5, 0.75))]),
    T('Activate gems', 'In a gem chamber, roll the required number of torches or keys to move gems from the depot onto the tile. Players in the same chamber can add their dice together.', 'c', [
      spawn(pawns('gem', 1, '#3d8b4a', 'Activated gem', 'A gem moved from the depot onto a chamber. It no longer counts against you at the exit.', { scale: 0.3 }), at('found', 0.5, 0.3), 'gems'),
    ]),
    T('Gongs and the escape', 'Twice during the game a gong calls everyone back to the start chamber; anyone not there when the door slams loses a die. To leave from the exit chamber you must roll, on your own, one key more than the gems left on the depot. Everybody wins if all adventurers are out before the third countdown ends, otherwise everybody loses.', 'all'),
  ],
}))
