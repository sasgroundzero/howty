/** Troyes: citizens in three buildings become dice, and dice are spent on activity cards and events. */
import { C, On, type Place, OnP, P, R, S, T, at, board, by, cards, deck, dice, discs, draw, f, ft, hide, pawns, pile, spawn, tabletop, zone } from '../compose'
import { slotUV } from '../layouts'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })

const [RED, WHITE, YELLOW] = ['#c0392b', '#e9e4d8', '#e0b12f']
const slot = slotUV(3, 4)
const ACT = [YELLOW, WHITE, RED]
const ROMAN = ['I', 'II', 'III']

export const troyes = tabletop('troyes', 'Troyes', [2, 4], 3, '90 min', 'Hard', 'Turn citizens into dice and build a city.', ['#d9c9a3', '#c0392b', '#e0b12f'], (n) => ({
  setup: [
    S('Lay out the city', 'Place the board in the middle of the table.', 'c', [
      C(board('city', 11, 9, 'g:slots:3x4:#d9c9a3:#8a5a3a:Troyes', 'City board', 'Shows three buildings (City Hall, Bishopric and Palace), spaces for nine activity cards, the cathedral site and the city square. This drawing is schematic: the top row stands for the three buildings.')),
    ]),
    S('Activity cards', 'Sort the activity cards by color and by the number on the back. Pick one card of each number in each color at random and lay the nine cards face down on their spaces. The three marked I are turned face up for the first round.', 'city', [
      ...[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => on('city', ...slot(3 + r * 3 + c), cards(`act${r * 3 + c}`, 1, ft('#fbf6ea', ROMAN[r], 'activity', '✦'), 'Activity card', 'Nine are used each game, three per color. Pay to put a tradesman on one, then spend dice of its color to use its effect.', { down: r > 0, back: f(ACT[c], ROMAN[r], '#2b241c') })))),
    ], 'The cards marked II and III are revealed at the start of the second and third rounds.'),
    S('Events and dice', `Make three event decks: red, white and yellow. The red deck sets the game length: put ${n === 4 ? 6 : n === 3 ? 5 : 4} red cards in it with ${n} players (6, 5 or 4 for 4, 3 or 2) and return the rest. Put the decks, all the dice, the gray neutral citizens, the deniers and the VP tokens beside the board.`, 'r', [
      R(deck('ev', 8, [f(RED, '⚔'), f(WHITE, '✦', '#2b241c'), f(YELLOW, '✦', '#2b241c')], 'Event decks', 'Red, white and yellow event cards. New events arrive every round and trouble the city until players fight them off with dice.', { n: 3 })),
      R(dice('pool', 4, [YELLOW, WHITE, RED, '#3a3a3a'], 'Dice supply', 'Yellow, white and red dice for the citizens in the three buildings, plus black dice that the events roll against the city.', { ink: '#8a8a8a' })),
    ]),
    S('Player pieces', `Each player takes a color: a district marker for the city square district nearest them, an influence marker on space 4 of the influence track, 20 cubes, 5 deniers and ${n === 4 ? 4 : n === 3 ? 5 : 6} citizens (4, 5 or 6 for 4, 3 or 2 players). Each is dealt ${n === 2 ? '2 character cards' : 'one character card'} to keep secret.`, 'you', [
      P(pile('folk', '$', 'Your citizens', `Your meeples: ${n === 4 ? 4 : n === 3 ? 5 : 6} to start with ${n} players, 12 at most. In a building they earn you dice; on activity cards they work as tradesmen.`, 'meeple'), discs('coins', 1, 0.3, '#d8b24a', 'Deniers', 'Money. Everyone starts with 5 deniers, kept in view.', { h: 0.2, label: '5' }), cards('char', 1, ft('#efe2bd', 'SECRET', 'character', '♛'), 'Character card', 'Kept hidden (2 each in a 2-player game). At the end every player scores for every character in play, so try to guess what the others hold.', { down: true }), zone('district', 3, 1.3, 'Your dice', 'On the real board your dice sit in your own district of the city square.')),
    ]),
    S('Place starting citizens', `Starting with the first player, players put their citizens one at a time on free spaces of the three buildings, going clockwise, then back counterclockwise, and so on. Gray neutral citizens fill any spaces left over${n === 2 ? '; with 2 players the neutral citizens go on their marked spaces before anyone places' : ''}.`, 'city', [
      ...[0, 1, 2].map((k) => OnP('city', ...slot(k), pawns(`cit${k}`, 1, '$', ['City Hall citizen', 'Bishopric citizen', 'Palace citizen'][k], `Each citizen here gives its owner one ${['yellow', 'white', 'red'][k]} die every round.`, { scale: 0.5 }), [0.5, 0])),
    ], 'Each player places all their starting citizens: 4, 5 or 6 each with 4, 3 or 2 players. The drawing shows one per building.'),
    S('Ready to play', `The player who most recently read a history book takes the start player card. With ${n} players the game lasts ${n === 4 ? 6 : n === 3 ? 5 : 4} rounds, one per red event card.`, 'all', [], 'Each round: reveal new activity cards (rounds 1 to 3), collect income and pay salaries, roll your dice, resolve events, then take turns spending groups of dice on actions. The start player card then passes left.'),
  ],
  turn: [
    T('Income and salaries', 'Everyone collects 10 deniers, then pays 1 denier for each of their citizens in the Bishopric and 2 for each in the Palace. City Hall citizens are free.', 'you', [
      spawn(discs('income', 1, 0.3, '#d8b24a', 'Income', '10 deniers collected by each player at the start of the round.', { h: 0.12 }), by('coins', 0, 0.75)),
    ]),
    T('Roll your workforce', 'Take one die of the matching color for each of your citizens in a building, roll them all and put them in your district.', 'you', [
      spawn(dice('mine', 3, [YELLOW, WHITE, RED], 'Your dice', 'This round’s workforce. Other players may buy these from you, and you may buy theirs.', { values: [5, 3, 4], ink: '#2e2622' }), at('district'), 'pool'),
    ]),
    T('Events strike', 'Reveal the top red event card and the white or yellow card it calls for. The start player rolls the black dice the events demand; starting with the highest, players take turns countering them with dice from their own district.', 'r', [
      draw('ev.0', by('ev.2', 1.2, 0), f(RED, '⚔')),
    ]),
    T('Spend dice on an action', 'On your turn use a group of 1 to 3 dice of one color. Here you pay to place a tradesman on a yellow activity card and spend your yellow die to use it.', 'city', [
      spawn(pawns('trade', 1, '$', 'Tradesman', 'A citizen on an activity card lets its owner use that card with dice of the right color.', { scale: 0.5 }), at('act0', 0.5, 0.5), 'folk'),
      hide('mine.0', 1.2),
    ]),
    T('Other actions and the finish', 'Dice can also fight events, build the cathedral, earn deniers from agriculture or place a citizen in a building; or you can pass. The game ends after the round in which the last red event appears. Add points for tradesmen, events and the cathedral, reveal the characters and score them for everyone; the most victory points wins.', 'all'),
  ],
}))
