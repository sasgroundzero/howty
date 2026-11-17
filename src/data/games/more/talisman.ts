/** Talisman (Revised 4th Edition): roll and move round three regions, growing strong enough to reach the Crown of Command. */
import { C, L, On, P, type Place, R, S, T, at, board, cards, deck, dice, discs, draw, f, ft, mv, pawns, pile, roll, tabletop, zone } from '../compose'
import { loopUV } from '../layouts'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const loop = loopUV(6)
const SEAT = ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a', '#7a4fa3', '#d9772b']
const ENEMY = ft('#f3e7c5', 'ENEMY', 'Strength 2', '⚔')

export const talisman = tabletop('talisman', 'Talisman', [2, 6], 4, '90 min or more', 'Easy', 'Roll, move and quest for the Crown of Command.', ['#3d6b3a', '#e0b12f', '#7a4fa3'], (n) => ({
  setup: [
    S('Unfold the board', 'Place the board in the middle of the table. It has three regions: Outer, Middle and Inner, with the Crown of Command at the very centre.', 'c', [
      C(board('map', 11, 8.2, 'g:ring:6:#4f7a45:#e0b12f:Talisman', 'Game board', 'Three rings of spaces. Only the Outer Region is drawn here, as a loop of 24 spaces. The Middle and Inner Regions lie inside it.')),
      on('map', 0.5, 0.36, discs('crown', 1, 0.4, '#e0b12f', 'Crown of Command', 'The space at the centre of the board. Reaching it lets you cast the Command Spell on everyone else.', { label: '♛', h: 0.04 })),
    ]),
    S('Shuffle the decks', 'Shuffle the Adventure cards and the Spell cards and place them face down beside the board. Lay the Purchase cards and Talisman cards face up.', 'r', [
      R(deck('adv', 100, f('#3d6b3a', '?'), 'Adventure deck', '104 cards: enemies, strangers, objects, followers, places and events met on the board.'),
        zone('advdisc', 0.9, 1.26, 'Discard', 'Used Adventure cards go here.'),
        deck('spells', 24, f('#7a4fa3', '✦'), 'Spell deck', 'Spells for characters with enough Craft to hold them.')),
      R(deck('purchase', 20, ft('#efe2bd', 'BUY', 'gear', '◆'), 'Purchase cards', 'Weapons, armour and other gear bought for gold at certain spaces.'),
        deck('talismans', 4, ft('#efe2bd', 'TALISMAN', '', '✦'), 'Talisman cards', 'You need a Talisman to pass through the Valley of Fire to the Crown of Command.')),
    ]),
    S('Deal a character to each player', 'Shuffle the character cards and deal one to each player. Put each character\'s figure on the starting space named on its card.', 'map', [
      P(cards('char', 1, ft('#efe2bd', 'CHARACTER', 'Strength, Craft', '♙'), 'Character card', 'One of 14 characters. It shows your starting Strength, Craft, Fate and Life, your special abilities and where you start.', { w: 1.5, d: 2.1 })),
      ...Array.from({ length: n }, (_, i) => on('map', ...loop(i * 4), pawns(`fig${i}`, 1, SEAT[i], i === 0 ? 'Your character' : `Player ${i + 1}'s character`, 'A character figure. It moves round the board by die roll and meets whatever is on the space where it lands.', { scale: 0.55, shape: 'hero' }))),
    ], 'The figures are spread round the Outer Region here. Your real starting space depends on your character.'),
    S('Take lives, fate and gold', 'Each player takes 4 life counters, fate tokens equal to the Fate value on their character card, and 1 gold coin. A character who starts with spells draws them now.', 'you', [
      P(discs('life', 4, 0.15, '#3d8b4a', 'Life counters', 'You start with 4 lives. Lose your last one and your character is dead.', { cols: 2, h: 0.14 }),
        discs('fate', 1, 0.18, '#e9e4d8', 'Fate tokens', 'A stack equal to your Fate value. Spend one to reroll a die you have just rolled.', { h: 0.12 }),
        discs('gold', 1, 0.18, '#e0b12f', 'Gold coin', 'Everyone starts with 1 gold. Spend gold at shops and with certain strangers.', { h: 0.06 })),
      P(zone('kept', 4.4, 1.5, 'Your cards and trophies', 'Objects, followers and spells you carry, plus enemies you have defeated, are kept here.')),
    ]),
    S('Set out the supplies', 'Put the Strength and Craft counters, the spare lives, fate and gold, the toad cards and the dice beside the board.', 'l', [
      L(pile('strength', '#c0392b', 'Strength counters', 'Red counters. Take one each time your Strength goes up.', 'disc'),
        pile('craft', '#2e6fb7', 'Craft counters', 'Blue counters. Take one each time your Craft goes up.', 'disc')),
      L(dice('die', 1, '#e9e4d8', 'Die', 'Rolled for movement and added to Strength or Craft in fights. The game comes with several.', { values: [1] }),
        discs('bank', 1, 0.22, '#e0b12f', 'Gold supply', 'The stock of gold coins.', { h: 0.3 })),
    ]),
    S('Ready to play', 'Everyone rolls a die and the highest roller takes the first turn. Play then passes clockwise.', 'all', [], 'On your turn you roll a die, move that many spaces in either direction, then follow the instructions on the space or meet a character there.'),
  ],
  turn: [
    T('Roll for movement', 'You roll one die and get a 3.', 'l', [roll('die', 3)]),
    T('Move exactly that far', 'You move your figure 3 spaces round the Outer Region. You choose the direction but must use the whole roll.', 'map', [mv('fig0', at('map', ...loop(3)))]),
    T('Draw an Adventure card', 'The space tells you to draw a card. It is an enemy with Strength 2, placed face up on the space.', 'map', [draw('adv', at('map', loop(3)[0], loop(3)[1] - 0.17), ENEMY, 'enemy')]),
    T('Fight it', 'You roll a die and add your Strength while another player rolls for the enemy. Your total is higher, so you keep the enemy as a trophy. Lose and you would give up a life.', 'you', [roll('die', 5), mv('enemy', at('kept', 0.2, 0.5), 1)]),
    T('Next player', 'The player on your left rolls and moves their own figure. Trophies can later be traded in to raise Strength or Craft.', 'map', [roll('die', 2), mv('fig1', at('map', ...loop(6)))]),
    T('How it ends', 'Grow strong, find a Talisman and cross the Inner Region to the Crown of Command. From there you cast the Command Spell each turn to strip lives from the others. The last character alive wins.', 'all', [], 8),
  ],
}))
