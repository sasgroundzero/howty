/** Gloomhaven: Jaws of the Lion: a scenario book as the map, heroes, monsters and modifier decks. */
import { C, On, OnP, P, R, S, T, at, board, by, cards, deck, discs, draw, f, ft, mat, mv, pawns, pile, spawn, tabletop, tiles, zone } from '../compose'
import { hexUV } from '../layouts'

const H = hexUV(8, 6)
const SPOTS: [number, number][] = [[2, 4], [5, 4], [3, 5], [6, 5], [1, 5]]
const ABILITY = [ft('#fbf6ea', '12', 'top / bottom', '⚔'), ft('#fbf6ea', '45', 'top / bottom', '▲'), ft('#fbf6ea', '67', 'top / bottom', '✦'), ft('#fbf6ea', '28', 'top / bottom', '◆')]

export const jawsOfTheLion = tabletop('jaws-of-the-lion', 'Gloomhaven: Jaws of the Lion', [1, 4], 2, '30–120 min', 'Hard', 'Cooperative card-driven dungeon scenarios.', ['#7a2a22', '#3a3a3a', '#e0b12f'], (n) => ({
  setup: [
    S('Open the scenario book', 'Open the scenario book to the scenario you are playing and lay it flat in the middle of the table. The page itself is the map.', 'c', [
      C(board('book', 9, 6.6, 'g:hex:8x6:#cdbf9f:#6b5a45:Scenario book', 'Scenario book', 'The spiral-bound book is the board. Each scenario page shows the hex map, where monsters start, the goal and any special rules. This drawing is schematic.')),
    ], 'Start with scenario 1. The first five scenarios teach the rules a little at a time, so follow the book where it differs from this overview.'),
    S('Choose characters', `Each player picks one of the four characters, takes its mat, health and experience dials, and stands its miniature on a starting hex. That is ${n} here.`, 'you', [
      P(mat('cmat', 3.4, 2.2, '$', 'Character', 'Character mat', 'Shows your hand size, your health at each level and reminders. One per character.'), deck('mod', 20, f('#5a4634', '±'), 'Your attack modifier deck', 'A 20-card deck for your character. You flip one card every time you attack; it adjusts the damage or misses.')),
      On('cmat', 0.8, 0.35, discs('dials', 2, 0.25, ['#c0392b', '#2e6fb7'], 'Health and experience dials', 'Two dials per character. Set health to the starting value on your mat and experience to 0.', { h: 0.06, label: ['HP', 'XP'] })),
      OnP('book', 0.5, H(0, 0)[1], pawns('hero', 1, '$', 'Character miniature', 'One per character. It starts on one of the starting hexes marked on the map.', { shape: 'hero' }), [0.953, 0]),
    ], n === 1 ? 'Playing solo, you control two characters yourself. Only one is drawn here.' : 'The four characters are the Demolitionist, Hatchet, Red Guard and Voidwarden.'),
    S('Ability cards', 'Take your character\'s ability cards into your hand. The mat shows your hand size; the first tutorial scenarios use a smaller starter set, as the book explains.', 'hand', [
      P(cards('hand', 4, ABILITY, 'Ability cards', 'Your hand, shown here as four cards. Each card has an initiative number, a top action and a bottom action. Your hand is also your stamina: run out and you are exhausted.'), zone('played', 2, 1.4, 'Cards in play', 'The two cards you chose for this round go here.')),
    ]),
    S('Monsters', 'Place the monster standees on the hexes the map marks for your number of characters, and put their stat card nearby.', 'book', [
      ...SPOTS.slice(0, n + 1).map(([c, r], i) => On('book', H(c, r)[0], H(c, r)[1], pawns(`m${i}`, 1, '#4a4a4a', 'Monster standee', 'The map marks which monsters appear for 2, 3 or 4 characters, and whether each is normal or elite. The number drawn here is only an example.', { scale: 0.6, shape: 'brute' }))),
      R(tiles('mstat', 1, 1.4, 1.4, ft('#e9dfc8', 'MONSTER', 'stats', '⚔'), 'Monster stat card', 'One per monster type in the scenario. It shows health, movement and attack for normal and elite monsters.', { h: 0.03 }), deck('mmod', 20, f('#3a3a3a', '±'), 'Monster attack modifier deck', 'A 20-card deck shared by all monsters. One card is flipped for each monster attack.'), zone('mdisc', 1.1, 1.4, 'Flipped', 'Monster modifier cards that have been flipped this round.')),
    ], 'Later scenarios also give each monster type a small deck of ability cards. The book tells you when to add them.'),
    S('Tokens and elements', 'Put the damage and condition tokens within reach. Set out the element board once the book introduces elements.', 'r', [
      R(mat('elements', 2.4, 1.2, '#d9d2c0', 'Elements', 'Element board', 'Tracks six elements as inert, waning or strong. It is not used in the very first scenarios.'), pile('tokens', ['#c0392b', '#e0b12f', '#7a4fa3'], 'Damage and condition tokens', 'Damage tokens mark wounds on monsters. Condition tokens mark effects such as poison or stun.', 'disc')),
    ]),
    S('Ready to play', 'Read the scenario goal aloud. The game runs in rounds: everyone secretly picks two cards, then characters and monsters act in initiative order.', 'all', [], 'There is no first player. The initiative numbers on the cards decide the order each round, lowest first.'),
  ],
  turn: [
    T('Choose two cards', 'You pick two ability cards from your hand and place them face down. One of them is your leading card: its number is your initiative this round.', 'you', [mv('hand.0', at('played', 0.27, 0.5)), mv('hand.1', at('played', 0.73, 0.5))]),
    T('Act in initiative order', 'Everyone reveals. On your turn you use the top action of one card and the bottom action of the other. Here you move next to a monster.', 'book', [mv('hero', at('book', ...H(2, 3)))]),
    T('Attack', 'You attack the adjacent monster. Flip the top card of your attack modifier deck, apply it to the attack value, and put that much damage on the monster.', 'book', [
      draw('mod', at('cmat', 0.3, 0.55), ft('#fbf6ea', '+1', 'modifier', '±')),
      spawn(discs('dmg', 1, 0.12, '#c0392b', 'Damage token', 'Marks damage on a monster. When damage equals its health, remove the monster.', { h: 0.05, label: '3' }), by('m0', 0.4, 0), 'tokens'),
    ]),
    T('Monsters act', 'On their initiative the monsters move toward the nearest character and attack if they can, flipping a card from the monster modifier deck.', 'book', [mv('m1', at('book', ...H(4, 2))), draw('mmod', at('mdisc'), ft('#e9e4d8', '-1', 'modifier', '±'))]),
    T('Winning and losing', 'At the end of the round your played cards go to your discard pile, or are lost if the action says so. You win together by meeting the scenario goal, and lose if every character becomes exhausted.', 'all'),
  ],
}))
