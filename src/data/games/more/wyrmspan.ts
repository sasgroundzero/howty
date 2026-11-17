/** Wyrmspan: a card display, the dragon guild and round tracker, and a three-cave mat per player. */
import { C, On, OnP, P, R, S, T, at, by, cards, deck, discs, f, ft, hide, mat, mv, pawns, pile, set, spawn, tabletop, tiles } from '../compose'

const DRAGON = ft('#f2e3dc', 'DRAGON', 'cost', '▲')
const CAVE = ft('#e2e0d6', 'CAVE', 'bonus', '◆')
const RES = ['#c0392b', '#e0b12f', '#7a4fa3', '#e9e4d8']

export const wyrmspan = tabletop('wyrmspan', 'Wyrmspan', [1, 5], 3, '90 min', 'Medium', 'Excavate caves and entice dragons to live there.', ['#7a4fa3', '#c0392b', '#e0b12f'], (n) => ({
  setup: [
    S('Card display', 'Place the card display board in the middle. Shuffle the dragon cards and the cave cards into two decks and turn 3 of each face up on the board.', 'c', [
      C(mat('display', 8.6, 1.9, '#d6cfc0', 'Card display', 'Card display board', 'Holds both decks and 3 face-up cards of each kind. Taken cards are replaced from the decks.')),
      On('display', 0.081, 0.5, deck('dragondeck', 60, f('#7a2a22', '▲'), 'Dragon deck', 'The deck of dragon cards.')),
      On('display', 0.326, 0.5, cards('dragons', 3, DRAGON, 'Face-up dragons', '3 dragon cards anyone may take when an effect lets them gain a dragon card.')),
      On('display', 0.57, 0.5, deck('cavedeck', 40, f('#4a4a4a', '◆'), 'Cave deck', 'The deck of cave cards.')),
      On('display', 0.814, 0.5, cards('caves', 3, CAVE, 'Face-up caves', '3 cave cards anyone may take when an effect lets them gain a cave card.')),
    ]),
    S('Dragon guild and round tracker', 'Set out the dragon guild board with a guild tile on it, and the round tracker with 4 objective tiles, one for each round.', 'guild', [
      C(mat('guild', 3, 2.2, '#cfc3dc', 'Dragon guild', 'Dragon guild', 'A circular track. Each step you take round it gives a reward, and the guild tile adds special spaces.'), mat('rounds', 4.4, 1.6, '#d9d2c0', 'Round tracker', 'Round tracker', 'Shows the 4 rounds and the end-of-round objective for each.')),
      On('rounds', 0.5, 0.55, tiles('objectives', 4, 0.7, 0.5, '#e0b12f', 'Objective tiles', '4 objectives, one scored at the end of each round by comparing the players.', { gap: 0.3, h: 0.04 })),
      OnP('guild', 0.5, 0.8, discs('gmark', 1, 0.12, '$', 'Guild marker', 'One per player. It moves round the dragon guild track.', { h: 0.1 }), [0.3, 0]),
    ]),
    S('Supplies', 'Put the four kinds of resources, the eggs and the coins where everyone can reach them.', 'r', [
      R(pile('respile', RES, 'Resources', 'Meat, gold, crystal and milk. Dragons cost resources to entice.', 'disc'), pile('eggs', '#b9d6c8', 'Eggs', 'Laid on dragons with nests. Eggs pay some costs and score points at the end.', 'disc'), pile('coinpile', '#c9a227', 'Coins', 'Every action costs at least 1 coin. You get a fresh supply each round.', 'disc')),
    ]),
    S('Player mats', `Each of the ${n} players takes a player mat and an adventurer of their color.`, 'you', [
      P(mat('pmat', 6.2, 3.6, '$', 'Player mat', 'Player mat', 'Three caves, each a row of spaces filled from left to right. The first space of each cave is already excavated.')),
      On('pmat', 0.05, 0.5, pawns('adv', 1, '$', 'Adventurer', 'One per player. The explore action walks it through one of your caves from left to right, collecting what each space gives.', { scale: 0.5 })),
    ]),
    S('Starting cards and resources', 'Each player draws dragon cards and cave cards and takes starting resources, then keeps only some of them. The rulebook gives the exact numbers to draw and keep.', 'hand', [
      P(cards('hand', 4, [DRAGON, DRAGON, CAVE, CAVE], 'Your hand', 'Dragon and cave cards you kept. Four cards are drawn here as an example.', { w: 0.8 }), discs('coins', 1, 0.25, '#c9a227', 'Your coins', 'You receive 6 coins at the start of the round.', { h: 0.12, label: '6', ink: '#2b241c' }), discs('res', 3, 0.15, RES, 'Your resources', 'Your starting resources. Three are drawn here as an example.', { h: 0.06, gap: 0.1 })),
    ], 'Coins you do not spend carry over to the next round.'),
    S('Ready to play', 'Choose a first player. Turns pass clockwise, one action at a time, until every player has passed.', 'all', [], n === 1 ? 'The solo game is played against an automated opponent with its own rules in the rulebook.' : 'On your turn you excavate, entice or explore. Each action costs a coin.'),
  ],
  turn: [
    T('Excavate', 'You pay 1 coin and play a cave card onto the leftmost empty space of one of your caves, then take the bonus printed on it.', 'you', [mv('hand.3', at('pmat', 0.36, 0.2)), set('coins', { label: '5' })]),
    T('Entice a dragon', 'You pay 1 coin and the dragon\'s resource cost, and place it on an excavated space that has no dragon yet.', 'you', [mv('hand.0', at('pmat', 0.2, 0.2)), hide('res.0'), set('coins', { label: '4' })]),
    T('The next player explores', 'The next player pays 1 coin to explore: their adventurer walks along one cave, gaining something at each space and from each dragon there with an explore ability.', 'pmat@1', [
      mv('adv@1', at('pmat@1', 0.2, 0.5)),
      set('coins@1', { label: '5' }),
      spawn(discs('found', 1, 0.15, '#e0b12f', 'Resource gained', 'Picked up while exploring.', { h: 0.06 }), by('res@1', 0.95, 0), 'respile'),
    ]),
    T('End of the round', 'When you cannot or will not act, you pass. Once everyone has passed, score the round\'s objective, then everyone takes coins for the next round.', 'rounds'),
    T('End of the game', 'After 4 rounds, add up dragons, eggs, guild rewards, objectives and everything stored on your cards. The most points wins.', 'all'),
  ],
}))
