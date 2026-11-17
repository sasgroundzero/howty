/** Quarriors!: cards with dice on them in the middle (the Wilds), and a dice bag for each player. */
import { C, On, OnP, P, R, S, T, at, board, box, cards, dice, discs, ft, mv, spawn, tabletop, zone } from '../compose'

const CRE = ['#c0392b', '#2e6fb7', '#3d8b4a', '#7a4fa3', '#d9772b', '#3a3a3a', '#e0b12f']
const QUID = '#e8dcc0'

export const quarriors = tabletop('quarriors', 'Quarriors!', [2, 4], 3, '30 min', 'Easy', 'Draw dice from your bag and summon creatures.', ['#2e6fb7', '#e0b12f', '#7a4fa3'], (n) => {
  const goal = n === 2 ? 20 : n === 3 ? 15 : 12
  return {
    setup: [
      S('Lay out the basic cards', 'Put the three basic cards in the middle: Basic Quiddity, Assistant and Portal. Put their dice on them.', 'basic', [
        C(cards('basic', 3, [ft('#f3e7c5', 'Quiddity', 'basic', '◆'), ft('#f3e7c5', 'Assistant', 'basic', '●'), ft('#f3e7c5', 'Portal', 'basic', '✦')], 'Basic cards', 'These three cards are used in every game. The cards and dice in the middle of the table are called the Wilds.')),
        On('basic.2', 0.5, 0.72, dice('bdie', 1, '#5b6f8a', 'Portal dice', 'One die stands in for the stack here. Portal dice sit on the Portal card until captured.', { size: 0.4, values: [3] })),
      ]),
      S('Deal three spells', 'Shuffle the spell cards and deal 3 face up, each of a different spell. Put the matching dice on each.', 'spell', [
        C(cards('spell', 3, ft('#dfeaf5', 'SPELL', 'cost', '✦'), 'Spell cards', '3 different spells. If you deal a second card for a spell already out, replace it.')),
        ...[0, 1, 2].map((k) => On(`spell.${k}`, 0.5, 0.72, dice(`sdie${k}`, 1, '#8fb7d9', 'Spell dice', 'One die stands in for the 5 dice that go on each spell card.', { size: 0.4, values: [2] }))),
      ]),
      S('Deal seven creatures', 'Shuffle the creature cards and deal 7 face up, each of a different creature. Put the 5 matching dice on each.', 'creature', [
        C(cards('creature', 7, ft('#f6f1e4', 'CREATURE', 'cost', '⚔'), 'Creature cards', '7 different creatures. A card explains what its dice do and what they cost to capture.')),
        ...CRE.map((c, k) => On(`creature.${k}`, 0.5, 0.72, dice(`cdie${k}`, 1, c, 'Creature dice', 'One die stands in for the 5 dice on each creature card. Captured dice go to your used pile and later into your bag.', { size: 0.4, values: [(k % 6) + 1], ink: '#ffffff' }))),
      ]),
      S('Fill your dice bag', 'Each player takes a bag and puts 8 Basic Quiddity dice and 4 Assistant dice in it.', 'you', [
        P(zone('ready', 2.6, 1.4, 'Ready area', 'Creatures you have summoned and spells you have readied wait here.'), zone('active', 2.6, 1.4, 'Active pool', 'The dice you drew and rolled this turn.')),
        P(box('bag', 1.1, 0.8, 1.1, '$', 'Dice bag', 'Starts with 12 dice: 8 Basic Quiddity and 4 Assistants. You draw 6 at random each turn.', { round: true }), zone('used', 3.6, 1.4, 'Used pile', 'Dice you have finished with. When your bag is empty they all go back into it.')),
      ]),
      S('Set up the score track', 'Put the glory track to one side and place every player’s marker at 0.', 'glory', [
        R(board('glory', 4.6, 2.2, 'g:plain:0:#2f3f5a:#e0b12f:Glory', 'Glory track', `Counts glory points. With ${n} players the first to ${goal} glory wins (20 with two players, 15 with three, 12 with four).`)),
        OnP('glory', 0.5, 0.75, discs('gm', 1, 0.16, '$', 'Glory marker', 'Moves up the track when your creatures score.', { h: 0.14 }), [0.45, 0]),
      ]),
      S('Ready to play', 'Choose a starting player, then play passes clockwise.', 'all', [], 'On your turn: score any creatures that survived since your last turn, draw and roll 6 dice, summon creatures and ready spells, attack, then capture one die from the Wilds.'),
    ],
    turn: [
      T('Draw and roll six dice', 'You draw 6 dice from your bag without looking and roll them into your active pool. Most of your starting dice give Quiddity, the money of the game.', 'active', [
        spawn(dice('pool', 6, QUID, 'Your rolled dice', 'Quiddity faces are spent to summon creatures and to capture new dice.', { size: 0.4, cols: 3, values: [1, 2, 1, 1, 1, 2] }), at('active', 0.5, 0.5), 'bag'),
      ]),
      T('Capture a die', 'You spend Quiddity to capture one die from the Wilds, paying the cost on its card. The new die and all the dice you used go to your used pile.', 'you', [
        mv('cdie2', at('used', 0.86, 0.5)),
        ...[0, 1, 2, 3, 4, 5].map((k) => mv(`pool.${k}`, at('used', 0.08 + k * 0.125, 0.5), 1 + k * 0.15)),
      ], 8),
      T('Next player summons', 'The player on your left rolls a creature face and pays Quiddity equal to its level to summon it into their ready area. A summoned creature attacks every other player’s creatures.', 'ready@1', [
        spawn(dice('summon', 1, '#3d8b4a', 'Summoned creature', 'A creature in a ready area. It defends against attacks until its owner’s next turn.', { size: 0.4, values: [4], ink: '#ffffff' }), at('ready@1', 0.5, 0.5), 'bag@1'),
      ]),
      T('Score surviving creatures', 'If that creature is still there when their next turn begins, it scores the glory shown on its card and then goes to their used pile.', 'glory', [
        mv('gm@1', at('glory', 0.8, 0.3)),
        mv('summon', at('used@1', 0.5, 0.5), 1),
      ]),
      T('End of the game', `The game ends as soon as a player reaches ${goal} glory, and that player wins. It also ends when four creature cards have run out of dice, and then the most glory wins.`, 'all'),
    ],
  }
})
