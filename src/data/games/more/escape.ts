/** Escape: The Curse of the Temple: ten minutes of frantic real-time dice rolling. */
import { C, OnP, P, R, S, T, at, dice, ft, mv, pawns, pile, roll, spawn, tabletop, tiles, zone } from '../compose'

const ROOM = ft('#cdb98a', '', '', '▲')

export const escape = tabletop('escape', 'Escape: The Curse of the Temple', [1, 5], 4, '10 min', 'Easy', 'Roll dice in real time to flee the temple.', ['#cdb98a', '#3d8b4a', '#8a5a2b'], (n) => ({
  setup: [
    S('Lay the starting chambers', 'Put the start chamber in the middle of the table and attach one basic chamber to two of its doors.', 'c', [
      C(tiles('rooms', 3, 1.9, 1.9, [ROOM, ft('#cdb98a', 'START', '', '⌂'), ROOM], 'Starting chambers', 'The start tile with two chambers attached. Everyone begins in the start chamber and returns to it when the gong sounds.', { gap: 0.04 }), zone('next', 1.9, 1.9, 'Next chamber', 'New chambers are attached to an open door of the temple as they are discovered.')),
    ]),
    S('Build the chamber stack', 'Shuffle the remaining chamber tiles face down. The exit tile is mixed in among the last few tiles at the bottom of the stack.', 'r', [
      R(tiles('stack', 1, 1.9, 1.9, '#8a5a2b', 'Chamber stack', 'The rest of the temple, drawn one tile at a time as you discover new rooms. The exit lies near the bottom: check the rulebook for exactly how many tiles it is shuffled with.', { h: 0.7 })),
    ]),
    S('Fill the gem depot', 'Place the gem depot beside the stack and put magic gems on it.', 'r', [
      R(
        tiles('depot', 1, 1.6, 1.6, ft('#e9e4d8', 'DEPOT', '', '◆'), 'Gem depot', 'Holds the gems you still have to activate. The fewer left here, the easier the exit is to open.'),
        pile('gems', '#3d8b4a', 'Magic gems', `The number placed on the depot depends on the player count (${n} here): check the table in the rulebook. The game has 25 gems in all.`),
      ),
    ]),
    S('Adventurers and dice', 'Each player takes 5 dice and the adventurer figure of one color, and stands the figure in the start chamber.', 'you', [
      P(dice('dice', 5, '#e9e4d8', 'Your dice', '5 dice per player. The faces are two running adventurers, a key, a torch, a black mask that locks the die, and a golden mask that unlocks up to two locked dice.', { size: 0.5 })),
      OnP('rooms.1', 0.5, 0.78, pawns('hero', 1, '$', 'Adventurer', 'One figure per player, showing which chamber you are in.', { scale: 0.45 }), [0.36, 0]),
    ]),
    S('Ready to play', 'Start the soundtrack or a 10-minute timer. There are no turns: everyone rolls at the same time, as fast as they like.', 'all', [], 'You may reroll any dice that are not locked by a black mask, as often as you want.'),
  ],
  turn: [
    T('Everybody rolls', 'You roll all 5 dice and set aside the symbols you want to keep. The numbers here stand in for the symbols.', 'you', [roll('dice.0', 1), roll('dice.1', 1), roll('dice.2', 4), roll('dice.3', 6), roll('dice.4', 3)]),
    T('Discover a new chamber', 'Spend two adventurer symbols to draw the top tile of the stack and attach it to an open door of your chamber.', 'c', [
      spawn(tiles('found', 1, 1.9, 1.9, ft('#cdb98a', '', '', '◆'), 'New chamber', 'A freshly discovered chamber. Its entry symbols show what you must roll to step into it.'), at('next', 0.5, 0.5), 'stack'),
    ]),
    T('Enter it', 'Roll the two symbols shown on the chamber\'s entrance and move your adventurer in.', 'c', [roll('dice.0', 2), roll('dice.1', 5), mv('hero', at('found', 0.5, 0.75))]),
    T('Activate gems', 'In a gem chamber, roll the required number of torches or keys to move gems from the depot onto the tile. Players in the same chamber can add their dice together.', 'c', [
      spawn(pawns('gem', 1, '#3d8b4a', 'Activated gem', 'A gem moved from the depot onto a chamber. It no longer counts against you at the exit.', { scale: 0.3 }), at('found', 0.5, 0.3), 'gems'),
    ]),
    T('Gongs and the escape', 'Twice during the game a gong calls everyone back to the start chamber; anyone who is late loses a die. To leave through the exit you need keys for the gems still on the depot. Everybody wins if all adventurers are out before time runs out, otherwise everybody loses.', 'all'),
  ],
}))
