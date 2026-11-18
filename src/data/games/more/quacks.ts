/** The Quacks of Quedlinburg: a pot and a bag of chips each, and a shared scoring track with ingredient books. */
import { C, L, On, OnP, P, R, S, T, at, board, box, by, deck, dice, discs, draw, f, ft, hide, mat, mv, pile, roll, spawn, tabletop, tiles } from '../compose'

const ING = ['#f3ecdc', '#d9772b', '#3d8b4a', '#c0392b', '#2e6fb7', '#e0b12f', '#7a4fa3', '#2b2b2b']
const INAME = ['White', 'Orange', 'Green', 'Red', 'Blue', 'Yellow', 'Purple', 'Black']
const chip = (id: string, c: number, v: string) => discs(id, 1, 0.2, ING[c], `${INAME[c]} ${v} chip`, 'An ingredient chip. Its number is how many spaces it sits ahead of the previous chip in your pot.', { h: 0.06, label: v, ink: c === 0 || c === 5 ? '#2b241c' : '#ffffff' })

export const quacks = tabletop('quacks', 'The Quacks of Quedlinburg', [2, 4], 4, '45 min', 'Easy', 'Push your luck brewing potions from a bag.', ['#d9772b', '#3d8b4a', '#7a4fa3'], (n) => ({
  setup: [
    S('Scoring track', 'Put the scoring track in the middle and stand the flame marker on the first space of its round track.', 'c', [
      C(board('track', 9, 6, 'g:ring:10:#e6d5a8:#8a5a2b:Scoring track', 'Scoring track', 'Victory points run round the edge. The round track in the middle counts the 9 rounds of the game. This drawing is schematic.')),
      On('track', 0.3, 0.32, discs('flame', 1, 0.2, '#e0b12f', 'Flame marker', 'Marks the current round. The game lasts 9 rounds.', { h: 0.3 })),
    ]),
    S('Ingredient books', 'Lay out the orange and black books, plus the green, blue and red books of one set (set 1 for a first game). Keep the yellow and purple books aside for now.', 'r', [
      R(tiles('books', 7, 1.3, 1.7, ING.slice(1).map((c, i) => ft('#f3ecdc', INAME[i + 1].toUpperCase(), 'book', '◆')), 'Ingredient books', 'Each book shows what that color of chip does and what it costs. Yellow joins from round 2 and purple from round 3. The black book has one side for 2 players and one for 3 or 4.', { cols: 4, h: 0.03 })),
    ], n === 2 ? 'With 2 players use the black book side marked for 2.' : 'With 3 or 4 players use the black book side marked for 3 and 4.'),
    S('Chips, cards and the die', 'Sort the ingredient chips by color and value. Shuffle the fortune teller cards into a face-down deck and set the bonus die and rubies nearby.', 'all', [
      L(discs('chips', 8, 0.3, ING, 'Ingredient chip supply', 'Chips of every color and value, bought at the end of each round and added to your bag.', { h: 0.4, cols: 4, gap: 0.3 })),
      R(pile('rubies', '#c0392b', 'Rubies', 'Earned from ruby spaces in your pot. Spend 2 to move your droplet forward or refill your flask.'), dice('bonus', 1, '#e9e4d8', 'Bonus die', 'One die. Each round it is rolled by whoever got furthest in their pot without exploding.', { size: 0.5 }), deck('fortune', 24, f('#5a3a6b', '✦'), 'Fortune teller deck', '24 cards. One is turned up at the start of each round and changes that round or gives everyone a bonus.')),
    ]),
    S('Pots and bags', 'Each player takes a pot, a bag, a flask and 1 ruby, puts their droplet on the 0 space in the middle of the pot, and keeps their rat stone beside it.', 'you', [
      P(mat('pot', 3.8, 3.8, '$', 'Pot', 'Your pot', 'A spiral track running out from the centre. The further your chips reach, the more coins and points the round is worth.'), box('bag', 1, 0.7, 1, '$', 'Your bag', 'Holds your ingredient chips. You draw from it blind, one chip at a time.', { round: true })),
      On('pot', 0.5, 0.5, discs('drop', 1, 0.17, '#5aa9d6', 'Droplet', 'Marks where your first chip starts counting from. It begins on 0 and can be pushed forward for 2 rubies.', { h: 0.08 })),
      P(tiles('flask', 1, 0.5, 0.8, ft('#cfe3d6', '', '', '▲'), 'Flask', 'While full, it lets you put the white chip you just drew back in the bag, as long as that chip did not make the pot explode.'), discs('ruby', 1, 0.16, '#c0392b', 'Ruby', 'Each player starts with 1 ruby.'), discs('rat', 1, 0.2, '#7a6a5a', 'Rat stone', 'From round 2, players behind the leader place it ahead of their droplet as a head start.', { h: 0.2 })),
      OnP('track', 0.5, 0.95, discs('score', 1, 0.14, '$', 'Scoring marker', 'Your victory points. It starts on 0.'), [0.34, 0]),
    ]),
    S('Starting ingredients', 'Each player puts the same 9 starting chips in their bag: four white 1s, two white 2s, one white 3, one orange 1 and one green 1.', 'you', [], 'White chips are cherry bombs. If the white chips in your pot ever total more than 7, the pot explodes.'),
    S('Ready to play', 'The last person to cook something is the start player and keeps the fortune teller deck. There are no separate turns: in each round everyone draws chips at the same time.', 'all', [], 'A round is: turn up a fortune teller card, fill your pots, then score, shop and spend rubies.'),
  ],
  turn: [
    T('Turn up a fortune teller card', 'Reveal the top card and read it out. It applies to everyone this round.', 'fortune', [draw('fortune', by('fortune', 1.3, 0), ft('#efe2f3', 'FORTUNE', 'this round', '✦'))]),
    T('Draw chips into your pot', 'Everyone draws one chip at a time and places it as many spaces past the last chip as its number. You draw a white 1, an orange 1 and a white 2.', 'you', [
      spawn(chip('c1', 0, '1'), at('pot', 0.62, 0.5), 'bag'), spawn(chip('c2', 1, '1'), at('pot', 0.7, 0.38), 'bag'), spawn(chip('c3', 0, '2'), at('pot', 0.64, 0.22), 'bag'),
      spawn(chip('d1', 2, '1'), at('pot@1', 0.62, 0.5), 'bag@1'), spawn(chip('d2', 0, '3'), at('pot@1', 0.72, 0.36), 'bag@1'),
    ], 9),
    T('Stop in time', 'Stop whenever you like. Your white chips total 3, well short of the limit of 7, so you stop safely. Whoever got furthest without exploding rolls the bonus die.', 'bonus', [roll('bonus', 4)]),
    T('Score and shop', 'The space after your last chip shows victory points and coins. Move your scoring marker, then spend the coins on one or two new chips of different colors, which go into your bag.', 'all', [
      mv('score', at('track', 0.64, 0.95)),
      spawn(chip('buy', 3, '1'), at('bag', 0.5, 0.5), 'chips.3'),
    ], 8),
    T('Reset for the next round', 'Everything in your pot goes back in your bag, the fortune teller deck passes clockwise to the next start player and the flame marker moves on. A player whose pot exploded must choose between the points and the shopping.', 'you', [
      hide('c1'), hide('c2'), hide('c3'), hide('buy'), mv('flame', at('track', 0.37, 0.32)),
    ]),
    T('End of the game', 'After round 9, leftover coins and rubies convert into a few extra points as the rulebook describes. The player with the most victory points wins.', 'all'),
  ],
}))
