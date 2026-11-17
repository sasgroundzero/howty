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
    S('Events and dice', 'Shuffle each event deck and put the decks and all the dice beside the board.', 'r', [
      R(deck('ev', 8, [f(RED, '⚔'), f(WHITE, '✦', '#2b241c'), f(YELLOW, '✦', '#2b241c')], 'Event decks', 'Red, white and yellow event cards. New events arrive every round and trouble the city until players fight them off with dice.', { n: 3 })),
      R(dice('pool', 4, [YELLOW, WHITE, RED, '#3a3a3a'], 'Dice supply', 'Yellow, white and red dice for the citizens in the three buildings, plus black dice that the events roll against the city.', { ink: '#8a8a8a' })),
    ]),
    S('Player pieces', 'Each player takes the citizens and markers of one color and 5 deniers, and is dealt one character card to keep secret.', 'you', [
      P(pile('folk', '$', 'Your citizens', 'Your meeples. In a building they earn you dice; on activity cards they work as tradesmen. The exact number per player is in the rulebook.', 'meeple'), discs('coins', 1, 0.3, '#d8b24a', 'Deniers', 'Money. I believe everyone starts with 5 deniers and also 4 influence on the influence track: check the rulebook.', { h: 0.2, label: '5' }), cards('char', 1, ft('#efe2bd', 'SECRET', 'character', '♛'), 'Character card', 'Kept hidden. At the end every player scores for every character in play, so try to guess what the others hold.', { down: true }), zone('district', 3, 1.3, 'Your dice', 'On the real board your dice sit in your own district of the city square.')),
    ]),
    S('Place starting citizens', 'Taking turns, players put their starting citizens one at a time on free spaces of the three buildings. Gray neutral citizens fill any spaces left over.', 'city', [
      ...[0, 1, 2].map((k) => OnP('city', ...slot(k), pawns(`cit${k}`, 1, '$', ['City Hall citizen', 'Bishopric citizen', 'Palace citizen'][k], `Each citizen here gives its owner one ${['yellow', 'white', 'red'][k]} die every round.`, { scale: 0.5 }), [0.5, 0])),
    ], 'How many citizens each player places depends on the player count (more each with fewer players): check the rulebook. The drawing shows one per building.'),
    S('Ready to play', `Give the first player marker to a starting player. With ${n} players the game lasts a fixed number of rounds, fewer with fewer players: check the rulebook for the exact count.`, 'all', [], 'Each round: collect income and pay salaries, roll your dice, resolve events, then take turns spending groups of dice on actions.'),
  ],
  turn: [
    T('Income and salaries', 'Everyone collects income from the bank, then pays a salary for each of their citizens in the Bishopric and the Palace.', 'you', [
      spawn(discs('income', 1, 0.3, '#d8b24a', 'Income', 'Deniers collected at the start of the round. I believe it is 10 per player.', { h: 0.12 }), by('coins', 0, 0.75)),
    ]),
    T('Roll your workforce', 'Take one die of the matching color for each of your citizens in a building, roll them all and put them in your district.', 'you', [
      spawn(dice('mine', 3, [YELLOW, WHITE, RED], 'Your dice', 'This round’s workforce. Other players may buy these from you, and you may buy theirs.', { values: [5, 3, 4], ink: '#2e2622' }), at('district'), 'pool'),
    ]),
    T('Events strike', 'New event cards are revealed and the black dice are rolled against the city. Players must counter black dice with their own before the action phase.', 'r', [
      draw('ev.0', by('ev.2', 1.2, 0), f(RED, '⚔')),
    ]),
    T('Spend dice on an action', 'On your turn use a group of 1 to 3 dice of one color. Here you pay to place a tradesman on a yellow activity card and spend your yellow die to use it.', 'city', [
      spawn(pawns('trade', 1, '$', 'Tradesman', 'A citizen on an activity card lets its owner use that card with dice of the right color.', { scale: 0.5 }), at('act0', 0.5, 0.5), 'folk'),
      hide('mine.0', 1.2),
    ]),
    T('Other actions and the finish', 'Dice can also fight events, build the cathedral, earn deniers or push a citizen into a building. After the last round reveal the characters, score them for everyone, and the most victory points wins.', 'all'),
  ],
}))
