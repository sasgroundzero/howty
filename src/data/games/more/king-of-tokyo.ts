/** King of Tokyo: a small Tokyo board, six dice, power cards and a monster board each. */
import { C, On, P, R, S, T, at, board, cards, cubes, deck, discs, f, ft, mat, mv, pawns, pile, set, spawn, tabletop, tiles, zone } from '../compose'

const face = (g: string) => f('#1c1c1c', g, '#9be15d')
const [HEART, ENERGY, CLAW] = ['♥', '✦', '⚔']
const rollTo = (faces: string[]) => faces.map((g, k) => set(`die.${k}`, { top: face(g) }))

export const kingOfTokyo = tabletop('king-of-tokyo', 'King of Tokyo', [2, 6], 4, '30 min', 'Easy', 'Roll dice, smash monsters, hold Tokyo.', ['#3b5a7a', '#9be15d', '#c0392b'], (n) => ({
  setup: [
    S('Place the Tokyo board', 'Put the Tokyo board in the middle of the table. It starts empty.', 'c', [
      C(board('tokyo', 5, 5, 'g:plain:0:#3b5a7a:#e0b12f:Tokyo', 'Tokyo board', `Has two spaces, Tokyo City and Tokyo Bay. The Bay is used only with 5 or 6 players, so in this ${n}-player game ${n >= 5 ? 'both are in use' : 'only Tokyo City is used'}.`)),
    ]),
    S('Choose a monster', 'Each player picks a monster and takes its figure and its monster board.', 'you', [
      P(mat('mboard', 3, 2.2, '$', 'Monster', 'Monster board', 'Has two dials: one for your health and one for your victory points.'), pawns('monster', 1, '$', 'Your monster', 'Your figure. It stands in front of you while you are outside Tokyo and on the board while you are in it.', { scale: 0.9, shape: 'boss' }), zone('kept', 1.6, 1.4, 'Your cards', 'Power cards you have bought and keep stay face up here.')),
    ]),
    S('Set your dials', 'Set your health to 10 and your victory points to 0.', 'mboard', [
      On('mboard', 0.3, 0.55, discs('hp', 1, 0.34, '#c0392b', 'Health dial', 'Starts at 10, which is also the most you can normally have. At 0 your monster is out of the game.', { label: '10', h: 0.1, ink: '#ffffff' })),
      On('mboard', 0.7, 0.55, discs('vp', 1, 0.34, '#e0b12f', 'Victory point dial', 'Starts at 0. The first monster to reach 20 wins.', { label: '0', h: 0.1 })),
    ]),
    S('Dice and energy', 'Put the 6 black dice and the energy cubes within reach. Set the 2 green dice aside until a card calls for them.', 'r', [
      R(tiles('die', 6, 0.7, 0.7, [face('1'), face('2'), face('3'), face(HEART), face(ENERGY), face(CLAW)], 'Black dice', '6 dice. Each has the faces 1, 2, 3, heart (heal), energy and claw (attack).', { h: 0.7 }), tiles('green', 2, 0.7, 0.7, f('#9be15d', '1', '#1c1c1c'), 'Green dice', '2 extra dice with the same faces, added only when a power card says so.', { h: 0.7 })),
      R(pile('energy', '#6fdc8c', 'Energy cubes', 'Each energy face you roll gives you 1 cube. Spend cubes to buy power cards.')),
    ]),
    S('Deal three power cards', 'Shuffle the power cards and turn 3 face up beside the deck.', 'shop', [
      R(deck('pdeck', 63, f('#4a2e5a', '✦'), 'Power card deck', '66 power cards in the base game. Some are kept for a lasting effect and some are discarded as soon as they are used.'), cards('shop', 3, ft('#f3e7c5', 'POWER', 'cost', '✦'), 'Power cards for sale', '3 face-up cards. Buy one by paying its cost in energy cubes; it is replaced from the deck at once.')),
    ]),
    S('Ready to play', 'Everyone rolls the 6 black dice. Whoever rolls the most claws goes first, and play passes clockwise.', 'all', [], 'On your turn you roll the dice up to three times, resolve them, enter Tokyo if it is empty, and may then buy power cards.'),
  ],
  turn: [
    T('Roll the dice', 'You roll all 6 black dice.', 'die', rollTo(['3', '1', '3', ENERGY, HEART, CLAW])),
    T('Reroll twice', 'You may reroll any of the dice, and then do so once more. You keep the 3s, the energy and the claw, and after your rerolls you have three 3s, two energy and a claw.', 'die', rollTo(['3', '3', '3', ENERGY, ENERGY, CLAW])),
    T('Resolve the dice', 'Three of a kind scores that number, so three 3s are 3 victory points. Two energy faces give you 2 energy cubes.', 'you', [
      set('vp', { label: '3' }),
      spawn(cubes('myenergy', 2, '#6fdc8c', 'Your energy', 'Energy cubes you have collected. Spend them on power cards.', { s: 0.22 }), at('mboard', 0.5, 0.14), 'energy', undefined, 1),
    ]),
    T('Enter Tokyo', 'Your claw hits no one, because nobody is in Tokyo yet. Tokyo is empty, so you must move in, and entering scores 1 victory point.', 'tokyo', [
      mv('monster', at('tokyo', 0.5, 0.5)),
      set('vp', { label: '4' }),
    ]),
    T('Next player attacks', 'The player on your left ends with 2 claws. Monsters outside Tokyo hit the one inside, so you lose 2 health. You may give up Tokyo to the attacker or stay, and staying until your next turn scores 2 points.', 'you', [
      ...rollTo(['2', CLAW, '1', CLAW, HEART, '2']),
      set('hp', { label: '8' }),
    ], 9),
    T('How the game ends', 'The first monster to reach 20 victory points wins at once. A monster also wins if it is the only one left standing.', 'all'),
  ],
}))
