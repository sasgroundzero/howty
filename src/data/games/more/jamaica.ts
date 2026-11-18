/** Jamaica: a pirate race round the island, driven by two dice and a hand of three action cards. */
import { C, On, OnP, P, type Place, R, S, T, at, board, by, cards, cubes, deck, dice, discs, draw, f, ft, hide, mat, mv, pawns, pile, roll, spawn, tabletop, zone } from '../compose'
import { loopUV } from '../layouts'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const loop = loopUV(7)
const LAIRS = [3, 6, 9, 12, 15, 18, 21, 24, 26]
const ACTION = [ft('#f3e7c5', 'ACTION', 'gold / forward', '◆'), ft('#f3e7c5', 'ACTION', 'food / back', '●'), ft('#f3e7c5', 'ACTION', 'forward / powder', '▲')]

export const jamaica = tabletop('jamaica', 'Jamaica', [2, 6], 4, '30–60 min', 'Easy', 'Race pirate ships round Jamaica for gold.', ['#2f8f9f', '#e0b12f', '#8a5a2b'], (n) => ({
  setup: [
    S('Unfold the board', 'Place the board in the middle of the table. The race track runs round the island, starting and finishing at Port Royal.', 'c', [
      C(board('map', 11, 8.2, 'g:ring:7:#2f8f9f:#e0b12f:Jamaica', 'Race board', 'A loop of sea spaces, ports and pirate lairs round Jamaica, with the navigation box in the middle. This drawing is schematic.')),
      on('map', 0.5, 0.66, zone('nav', 2.2, 1.1, 'Navigation box', 'The captain places the two action dice here: the left die powers the morning action, the right die the evening action.')),
    ]),
    S('Ships at Port Royal', `All ${n} ships start together on the Port Royal space.`, 'map', [
      OnP('map', ...loop(0), pawns('ship', 1, '$', 'Ship', 'Your ship. It races once round the island and back to Port Royal.', { scale: 0.3 }), [0.2, 0]),
    ], n === 2 ? 'With 2 players the black ship joins as the Ghost Ship. Give it a hold board with 5 doubloons in one hold and 3 in another, plus the Lady Beth treasure card (+2 in combat, and it can’t be stolen). After both players act, the captain moves it twice using the action dice: backward if it alone leads, forward if it alone is last, otherwise the captain picks. It never pays for spaces, and it can win.' : undefined),
    S('Treasures', 'Put one treasure token on each of the 9 pirate lair spaces. Shuffle the 12 treasure cards and stack 9 of them face down beside the board. The other 3 go back in the box unseen.', 'map', [
      ...LAIRS.map((s, i) => on('map', ...loop(s), discs(`lair${i}`, 1, 0.2, '#8a5a2b', 'Treasure token', 'Marks an unclaimed treasure. The first ship to stop here takes the token off and draws a treasure card.', { label: '✦', ink: '#ffffff', h: 0.06 }))),
      R(deck('treasure', 9, f('#8a5a2b', '✦'), 'Treasure cards', 'Some are worth points, some are cursed and lose points, and a few give a lasting power.')),
    ], 'Only 9 of the 12 treasure cards are used each game. Check the rulebook if your edition differs.'),
    S('Player boards and starting cargo', 'Each player takes the board showing their ship\'s five holds, and loads 3 doubloons into one hold and 3 food into another.', 'you', [
      P(mat('hold', 4.6, 1.5, '$', 'Holds', 'Ship\'s holds', 'Five holds. Each load you gain must go into an empty hold, so when all five are full you have to throw one out.')),
      on('hold', 0.1, 0.5, discs('gold', 3, 0.12, '#e0b12f', 'Doubloons', 'You start with 3. Gold pays port fees and scores points at the end.', { gap: 0.04, h: 0.06 })),
      on('hold', 0.3, 0.5, cubes('food', 3, '#e9e4d8', 'Food', 'You start with 3. Food pays for stopping on sea spaces.', { s: 0.2, gap: 0.06 })),
    ]),
    S('Action cards', 'Each player shuffles their own deck of 11 action cards and draws a hand of 3.', 'you', [
      P(deck('adeck', 8, f('#5a4634', '⌂'), 'Your action deck', 'The rest of your 11 action cards. You draw back up to 3 at the end of every round.'),
        cards('hand', 3, ACTION, 'Action cards', 'Each card has a morning action on the left and an evening action on the right: load something or move forward or backward.'),
        zone('played', 1.1, 1.46, 'Played', 'The card you choose each round goes here, face down until everyone has chosen.')),
    ]),
    S('Supplies and dice', 'Sort the doubloons, food and gunpowder tokens into a bank beside the board. The combat die sits on the fortress printed on the board, and the two action dice go to the captain.', 'r', [
      R(discs('bank', 1, 0.25, '#e0b12f', 'Doubloon bank', 'The supply of gold doubloons.', { h: 0.35 }),
        pile('foodbank', '#e9e4d8', 'Food supply', 'The supply of food tokens.'),
        pile('powder', '#3a3a3a', 'Gunpowder supply', 'Gunpowder tokens. Spend them to add to your combat die roll.')),
      R(dice('adie', 2, '#e9e4d8', 'Action dice', '2 dice rolled by the captain each round. They set how strong the morning and evening actions are.', { size: 0.5, values: [1, 1] }),
        dice('combat', 1, '#3a3a3a', 'Combat die', 'Rolled by both sides when two ships share a space. One face is a star that wins outright.', { size: 0.5, ink: '#ffffff', values: [2] }),
        discs('compass', 1, 0.3, '#c9b98a', 'Compass', 'Marks the captain, who rolls the dice and acts first. It passes to the left every round.', { label: '✧', h: 0.06 })),
    ]),
    S('Ready to play', 'Pick the first captain at random and give them the compass and the two action dice. In this walkthrough that is you.', 'all', [], 'Each round the captain rolls and places the dice, everyone secretly picks one card, then players take turns doing its morning and evening actions.'),
  ],
  turn: [
    T('The captain rolls', 'As captain you roll both action dice, a 4 and a 2, and decide which goes on the morning side and which on the evening side.', 'map', [
      roll('adie.0', 4), roll('adie.1', 2),
      mv('adie.0', at('nav', 0.3, 0.5), 1), mv('adie.1', at('nav', 0.7, 0.5), 1.3),
    ]),
    T('Everyone picks a card', 'Each player chooses one card from their hand and plays it face down. Cards are then revealed and resolved one player at a time, starting with the captain.', 'you', [
      mv('hand.0', at('played', 0.5, 0.5)),
      mv('hand.0@1', at('played@1', 0.5, 0.5)),
    ]),
    T('Morning: load gold', 'Your card\'s left symbol is gold and the morning die shows 4, so you load 4 doubloons into an empty hold.', 'hold', [
      spawn(discs('load', 1, 0.2, '#e0b12f', 'Doubloons', 'The 4 doubloons you just loaded, stored together in one hold.', { label: '4', h: 0.16 }), at('hold', 0.5, 0.5), 'bank'),
    ]),
    T('Evening: sail forward', 'The right symbol is a forward move and the evening die shows 2, so your ship sails 2 spaces. You stop on a sea space and pay the food it demands, here 2.', 'map', [
      mv('ship', at('map', ...loop(2))),
      hide('food.0', 1.4), hide('food.1', 1.6),
    ]),
    T('Draw back up', 'Once everyone has acted, each player draws back up to 3 cards and the compass passes to the left.', 'you', [
      draw('adeck', by('hand.1', -1.04, 0), ACTION[0]),
    ]),
    T('How it ends', 'The round in which a ship reaches Port Royal is the last. Each player scores the number on the space their ship reached, plus their doubloons and treasure cards, minus any cursed treasures. A ship still on the -5 space or behind it loses 5. The highest total wins.', 'all', [], 8),
  ],
}))
