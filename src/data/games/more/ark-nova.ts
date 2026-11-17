/** Ark Nova: a shared board with a card display, and a zoo map with five action cards per player. */
import { C, On, OnP, P, R, S, T, at, board, by, cards, deck, discs, draw, f, ft, mat, mv, pile, set, spawn, tabletop, tiles } from '../compose'

const ZOO = [ft('#eef2df', 'ANIMAL', 'zoo card', '●'), ft('#dfeaf2', 'SPONSOR', 'zoo card', '★'), ft('#eef2df', 'ANIMAL', 'zoo card', '●'), ft('#f2e6df', 'PROJECT', 'zoo card', '◆')]
const ACTION = ['ANIMALS', 'CARDS', 'BUILD', 'ASSOCIATION', 'SPONSORS'].map((t) => ft('#f6efd8', t, 'action', '▲'))

export const arkNova = tabletop('ark-nova', 'Ark Nova', [1, 4], 2, '90–150 min', 'Hard', 'Build a modern zoo and back conservation.', ['#5b8a4a', '#e0b12f', '#2e6fb7'], (n) => ({
  setup: [
    S('Game board and zoo cards', 'Place the game board in the middle. Shuffle the zoo cards, put the deck on the board and deal 6 cards face up into the display.', 'main', [
      C(board('main', 12, 7.6, 'g:plain:0:#cfe3c4:#5b8a4a:Game board', 'Game board', 'Holds the card display, the appeal, conservation and reputation tracks, the break track and the conservation projects. This drawing is schematic.')),
      On('main', 0.12, 0.75, deck('zoodeck', 60, f('#3d6b4a', '●'), 'Zoo card deck', 'One large deck of animals, sponsors and conservation projects.')),
      On('main', 0.56, 0.75, cards('display', 6, ZOO, 'Display', '6 face-up zoo cards. How far along the display you may reach depends on your reputation.')),
    ]),
    S('Conservation projects and break token', 'Lay out the base conservation project cards along the top of the board and put the break token on the starting space of the break track for your player count.', 'main', [
      On('main', 0.5, 0.2, cards('projects', n + 2, ft('#f2e6df', 'PROJECT', 'base', '◆'), 'Base conservation projects', 'Shared goals that players support to gain conservation points. The number laid out depends on the player count, so follow the rulebook; the number drawn here is only an example.')),
      On('main', 0.7, 0.47, discs('break', 1, 0.16, '#e9e4d8', 'Break token', 'Advances as players take certain actions. When it reaches the end, everyone has a break: income is paid and the display is refreshed.', { h: 0.1 })),
      R(mat('assoc', 3.2, 2.2, '#e3d9bd', 'Association', 'Association board', 'Holds the partner zoos and universities that the association action lets you claim.')),
      R(deck('final', 11, f('#7a4fa3', '★'), 'Final scoring cards', 'Each player gets 2 of these at the start and scores only 1 of them at the end.'), pile('bank', '#e0b12f', 'Money', 'The bank. Money pays for enclosures, animals and more.', 'disc'), pile('xtokens', '#3a3a3a', 'X-tokens', 'Spend one to raise the strength of an action by 1.', 'disc')),
    ]),
    S('Zoo maps and money', `Each of the ${n} players takes a zoo map and 25 money. In a first game everyone uses the beginner map.`, 'you', [
      P(mat('zoo', 5, 3.2, '$', 'Zoo map', 'Zoo map', 'Your zoo: a hex grid where you build enclosures, kiosks and pavilions. Your spare association workers and player tokens wait on it.'), discs('money', 1, 0.25, '#e0b12f', 'Your money', 'You start with 25 money.', { h: 0.12, label: '25', ink: '#2b241c' })),
    ]),
    S('Action cards', 'Put your 5 action cards under your zoo map. The Animals card goes in slot 1, and the other four are shuffled and placed in slots 2 to 5.', 'act', [
      P(cards('act', 5, ACTION, 'Action cards', 'Your 5 actions. A card\'s slot, counted 1 to 5 from the left, is the strength of that action when you use it.')),
    ]),
    S('Counters', 'Each player puts a counter at the start of the appeal track and one at the start of the conservation track. In turn order, each player after the first starts 1 appeal higher than the player before.', 'main', [
      OnP('main', 0.2, 0.96, discs('appeal', 1, 0.13, '$', 'Appeal counter', 'Shows how attractive your zoo is. Appeal is points and also drives your income.', { h: 0.1 }), [0.3, 0]),
      OnP('main', 0.8, 0.96, discs('cons', 1, 0.13, '$', 'Conservation counter', 'Runs the opposite way to appeal. The game ends when one player\'s two counters meet.', { h: 0.1 }), [0.3, 0]),
    ], 'Each player also marks their reputation on its track; the rulebook shows the starting space.'),
    S('Starting cards', 'Deal each player 8 zoo cards, of which they keep 4, and 2 final scoring cards.', 'hand', [
      P(cards('hand', 4, ZOO, 'Your hand', 'The 4 zoo cards you kept out of 8.'), cards('goals', 2, f('#7a4fa3', '★'), 'Your final scoring cards', 'You hold 2 for now and will have to discard 1 of them later in the game.')),
    ]),
    S('Ready to play', 'Choose a start player. Turns pass clockwise, and each turn is a single action.', 'all', [], n === 1 ? 'The solo game has its own rules and a fixed number of turns; see the rulebook.' : 'On your turn use one action card at the strength of its slot, then move that card to slot 1.'),
  ],
  turn: [
    T('Use an action card', 'Your Build card happens to sit in slot 3, so you build with strength 3: an enclosure of up to 3 spaces, at 2 money per space.', 'you', [
      spawn(tiles('encl', 1, 0.9, 0.7, '#b9a27a', 'Enclosure', 'A standard enclosure. It must be big enough for the animal you want to house in it.'), at('zoo', 0.4, 0.5), 'main'),
      set('money', { label: '19' }),
    ]),
    T('Move the card to slot 1', 'The card you used moves to slot 1, and the cards that were to its left each slide one slot to the right. Unused actions grow stronger over time.', 'act', [
      mv('act.2', by('act.3', -3.12, 0)), mv('act.0', by('act.3', -2.08, 0)), mv('act.1', by('act.3', -1.04, 0)),
    ]),
    T('The next player draws', 'The next player uses the Cards action to draw from the deck. The Cards action also moves the break token along its track.', 'main', [mv('break', at('main', 0.76, 0.47)), draw('zoodeck', at('hand.3@1', 1.15, 0.5, 0.06))]),
    T('Later: play an animal', 'With the Animals action you pay for an animal card, put it into a big enough enclosure and move your appeal counter up.', 'you', [mv('hand.0', at('zoo', 0.8, 0.5)), mv('appeal', at('main', 0.36, 0.96))]),
    T('Breaks and the end', 'After each break, play goes on. When one player\'s appeal and conservation counters meet, the round is finished so that every other player gets one more turn. Then add final scoring cards: the best score wins.', 'all'),
  ],
}))
