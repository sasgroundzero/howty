/** Android: Netrunner: an asymmetric two-player card game. You sit as the Corp, the other seat is the Runner. */
import { C, P, R, S, T, at, cards, deck, discs, draw, f, flip, ft, mv, pile, set, tabletop, zone } from '../compose'

const CARD = [ft('#e8edf5', 'CARD', 'cost', '◆'), ft('#e8edf5', 'CARD', 'cost', '▲'), ft('#e8edf5', 'CARD', 'cost', '●'), ft('#e8edf5', 'CARD', 'cost', '✦'), ft('#e8edf5', 'CARD', 'cost', '★')]

export const netrunner = tabletop('netrunner', 'Android: Netrunner', [2, 2], 2, '45 min', 'Hard', 'Corp builds servers; a Runner breaks in.', ['#1f2a44', '#2e6fb7', '#c0392b'], () => ({
  setup: [
    S('Choose sides', 'One player is the Corporation and the other is the Runner. Each takes an identity card and a deck built for that side.', 'you', [
      P(
        cards('ident', 1, ft('#f3e7c5', 'ID', 'identity', '★'), 'Identity card', 'One per player. It names your faction, gives a special ability and sets your deck-building limits.'),
        deck('deck', 40, f('#1f2a44', '≡'), 'Your deck', 'The Corp calls it R&D and the Runner calls it the Stack. The minimum size is printed on your identity card.'),
        zone('trash', 1.0, 1.36, 'Discard', 'Your discard pile. The Corp calls it Archives and the Runner calls it the Heap.'),
      ),
    ], 'In this walkthrough you are the Corp and the player opposite is the Runner.'),
    S('Make the token bank', 'Put the credits and the other tokens in reach of both players.', 'r', [
      R(pile('bank', '#e0b12f', 'Credit bank', 'The shared supply of credits. Credits pay for installing and using cards.', 'disc'), pile('adv', '#e9e4d8', 'Other tokens', 'Advancement, tag, damage, bad publicity and virus tokens. They are used as cards call for them.', 'disc')),
    ]),
    S('Take five credits', 'Each player takes 5 credits from the bank.', 'you', [
      P(discs('credits', 1, 0.3, '#e0b12f', 'Your credits', 'Each player starts with 5 credits. The label shows how many you have.', { label: '5', h: 0.3, ink: '#2b241c' })),
    ]),
    S('Shuffle and draw five', 'Each player shuffles their deck and draws 5 cards. The Corp, then the Runner, may each take one mulligan by shuffling the hand back and drawing 5 new cards.', 'you', [
      P(cards('hand', 5, CARD, 'Starting hand', '5 cards each. The Corp hand is called HQ and the Runner hand is called the Grip. The usual hand limit is 5.')),
    ]),
    S('Leave room for servers and the rig', 'The Corp needs space in front of its deck for remote servers and ice. The Runner needs a row for programs, hardware and resources.', 'c', [
      C(zone('remote', 2.6, 3.2, 'Remote server', 'Corp cards are installed face down here, with ice placed in front to protect them.'), zone('rig', 4.2, 1.7, 'Runner rig', 'The Runner installs programs, hardware and resources here face up.')),
    ]),
    S('Ready to play', 'The Corp always takes the first turn. The Corp has 3 clicks per turn and the Runner has 4.', 'all', [], 'A click buys one basic action: draw a card, gain a credit, install a card, play an event or operation, and for the Runner, make a run.'),
  ],
  turn: [
    T('Corp: mandatory draw', 'You start every Corp turn by drawing one card. This draw does not cost a click.', 'you', [draw('deck', at('hand.4', 1.15, 0.5, 0.02))]),
    T('Click 1: install in a remote server', 'You install a card face down in a new remote server. The Runner cannot tell whether it is an agenda, an asset or a trap.', 'remote', [mv('hand.1', at('remote', 0.5, 0.75)), flip('hand.1', false)]),
    T('Click 2: protect it with ice', 'You install a piece of ice face down in front of that server. The first ice on a server is free to install; each further piece costs one more credit.', 'remote', [mv('hand.3', at('remote', 0.5, 0.25)), flip('hand.3', false)]),
    T('Click 3: take a credit', 'With your last click you take 1 credit from the bank. Then you would discard down to your hand limit if you were over it.', 'you', [set('credits', { label: '6' })]),
    T('Runner turn: four clicks', 'The Runner does not draw for free. In this example they gain a credit, pay 2 to install a program, and can then spend clicks on runs against your servers.', 'rig', [mv('hand.0@1', at('rig', 0.25, 0.5)), set('credits@1', { label: '4' })]),
    T('How it ends', 'The Corp wins by advancing and scoring 7 points of agendas; the Runner wins by stealing 7 points. The Runner also wins if the Corp must draw from an empty deck, and the Corp wins if the Runner takes more damage than they have cards in hand.', 'all'),
  ],
}))
