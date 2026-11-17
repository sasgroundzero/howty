/** Battlestar Galactica: resource dials, ships around Galactica, hidden loyalties and skill cards. */
import { C, On, OnP, P, R, S, T, at, board, box, cards, cubes, deck, discs, draw, f, flip, ft, mat, mv, pawns, tabletop, tiles, zone } from '../compose'

const SKILL = ['#e0b12f', '#3d8b4a', '#7a4fa3', '#c0392b', '#2e6fb7']
const SK = SKILL.map((c) => f(c, '≡'))
const CRISIS = ft('#f1d9d4', 'Crisis', 'skill check', '⚑')

export const battlestarGalactica = tabletop('battlestar-galactica', 'Battlestar Galactica: The Board Game', [3, 6], 5, '2–3 hours', 'Hard', 'Guide the fleet home with Cylons among you.', ['#101827', '#8d99a6', '#c0392b'], (n) => {
  const cylons = n >= 5 ? 2 : 1
  const humans = [5, 6, 8, 9][n - 3]
  return {
    setup: [
      S('Board and resources', 'Lay out the board and set the four resource dials: Fuel 8, Food 8, Morale 10 and Population 12.', 'c', [
        C(board('board', 12, 8, 'g:space:0:#101827:#3b4a6b:Space around Galactica', 'Game board', 'Shows Galactica and Colonial One with their locations, the space areas around them, the resource dials and the jump preparation track. This drawing is schematic.')),
        On('board', 0.06, 0.5, discs('dial', 4, 0.4, ['#d9772b', '#3d8b4a', '#2e6fb7', '#e9e4d8'], 'Resource dials', 'Fuel 8, Food 8, Morale 10 and Population 12 at the start. If any of them reaches 0 the humans lose.', { label: ['8', '8', '10', '12'], cols: 1, gap: 0.5, h: 0.06, ink: '#101827' })),
        On('board', 0.5, 0.5, box('galactica', 4.6, 0.08, 2, '#8d99a6', 'Galactica', 'The battlestar. Its locations, such as Command and the Hangar Deck, are where characters stand to use actions.', { top: ft('#aab4be', 'GALACTICA', 'locations', '▲') })),
        On('board', 0.35, 0.93, discs('fleet', 1, 0.2, '#e9e4d8', 'Fleet marker', 'Starts at the beginning of the jump preparation track. When it reaches the end the fleet jumps.', { h: 0.1 })),
      ]),
      S('Place the ships', 'Put 1 basestar and 3 raiders in front of Galactica, 2 vipers below it, and 2 civilian ships behind it. All other ships go in their reserves.', 'board', [
        On('board', 0.42, 0.12, box('basestar', 1, 0.3, 1, '#6b3b3b', 'Cylon basestar', 'Launches raiders and fires on Galactica when Cylon ships activate.', { round: true })),
        On('board', 0.6, 0.12, cubes('raider', 3, '#b03030', 'Cylon raider', '3 raiders start beside the basestar. They attack vipers, then civilian ships, then Galactica.', { s: 0.28, gap: 0.16 })),
        On('board', 0.2, 0.82, cubes('viper', 2, '#d8d8d8', 'Viper', '2 vipers start in space. Pilots can fly them; the others wait in the reserve.', { s: 0.28, gap: 0.2 })),
        On('board', 0.88, 0.5, tiles('civ', 2, 0.6, 0.45, '#c9b98a', 'Civilian ship', '2 start behind Galactica, face down. Each one destroyed costs resources, usually population.', { h: 0.06, cols: 1, gap: 0.3 })),
      ]),
      S('Choose characters', 'Starting with the first player, everyone picks a character, takes its sheet, and stands its piece on the location named on the sheet. You must pick from the type that has the most characters left, apart from support characters.', 'galactica', [
        P(mat('sheet', 3.4, 2, '$', 'Character', 'Character sheet', 'Lists your skill set (the cards you draw each turn), your abilities and your weakness, and where you start.')),
        OnP('galactica', 0.5, 0.72, pawns('crew', 1, '$', 'Character piece', 'Shows where your character is. Each starts on the location named on their sheet; they are grouped on Galactica here.', { scale: 0.6 }), [0.6, 0]),
      ]),
      S('President and Admiral', 'Give the President title to the first character in the presidential line of succession and the Admiral title to the first in the military one. The President draws 1 Quorum card.', 'r', [
        R(deck('skill', 21, SK, 'Skill decks', 'Five decks: Politics, Leadership, Tactics, Piloting and Engineering. Cards are used for their action or added to skill checks.', { n: 5 })),
        R(
          deck('quorum', 17, f('#b9892f', '♛'), 'Quorum deck', 'Cards only the President may draw and play.'),
          deck('crisis', 60, f('#7a2f2f', '⚑'), 'Crisis deck', 'One is drawn at the end of every turn: usually a skill check or a Cylon attack.'),
          deck('destiny', 10, f('#4a4a5a', '?'), 'Destiny deck', '2 cards from each of the five skill decks, shuffled. Two are added blind to every skill check.'),
          deck('dest', 20, f('#2e4f7a', '✦'), 'Destination deck', 'The Admiral draws from it at each jump to choose where the fleet goes and how far it travels.'),
        ),
      ], 'The Admiral also holds the nuke tokens. The Kobol objective card and the Super Crisis deck are set beside the board.'),
      S('Build the Loyalty deck', `With ${n} players shuffle ${cylons} "You are a Cylon" card${cylons > 1 ? 's' : ''} with ${humans} "You are not a Cylon" cards and deal 1 face down to each player. Keep the rest for the sleeper agent phase.`, 'you', [
        P(cards('loyal', 1, ft('#efe6d2', 'Loyalty', 'secret', '?'), 'Loyalty card', 'Tells you in secret whether you are human or Cylon. A second card is dealt to everyone halfway through the game.', { down: true, back: f('#3a3a4a', '?') })),
      ], `Add 1 more "not a Cylon" card for each of Baltar and Boomer if they are in play${n === 4 || n === 6 ? `, and with ${n} players the Sympathizer card joins the deck at the sleeper phase` : ''}. Check these counts against the rulebook table.`),
      S('Starting skill cards', 'Every player except the first draws 3 skill cards, chosen from the types in their skill set.', 'you', [
        P(cards('hand', 3, [SK[1], SK[2], SK[0]], 'Skill cards', 'Your hand. Each card has a color, a strength from 1 to 5 and an ability. The hand limit is 10 at the end of a turn.')),
      ], 'The first player skips this because they draw at the start of their turn. The scene shows 3 cards for everyone.'),
      S('Leave room for skill checks', 'Keep a space beside the board for crisis cards and the cards played into skill checks.', 'check', [
        C(zone('check', 6.6, 1.6, 'Crisis and skill check', 'The current crisis card and the face-down skill cards played towards it.')),
      ]),
      S('Ready to play', 'The first player begins and play passes clockwise.', 'all', [], 'A turn is: receive skill cards, move, take one action, draw a crisis, then activate Cylon ships and advance jump preparation if the crisis card says so.'),
    ],
    turn: [
      T('Receive skills', 'On your turn you first draw the skill cards listed in your skill set, usually 5 cards in total. Two of them are shown here.', 'you', [
        draw('skill.1', at('hand.2', 1.15, 0.5, 0.02)),
        draw('skill.2', at('hand.2', 1.8, 0.5, 0.04)),
      ]),
      T('Move', 'You may move to another location on your ship for free. Moving to a different ship costs you a skill card.', 'galactica', [mv('crew', at('galactica', 0.5, 0.2))]),
      T('Take one action', 'You take a single action: the one printed on your location, on a skill card, on your character sheet, or on a title card you hold.', 'galactica'),
      T('Crisis and skill check', 'You draw a crisis card. For a skill check, 2 Destiny cards go in first, then each player in turn adds any number of cards face down. Matching colors count for the humans, other colors count against.', 'check', [
        draw('crisis', at('check', 0.1, 0.5), CRISIS),
        draw('destiny', at('check', 0.3, 0.5)),
        draw('destiny', at('check', 0.46, 0.5)),
        flip('hand.1', false), mv('hand.1', at('check', 0.62, 0.5)),
        flip('hand.0@1', false), mv('hand.0@1', at('check', 0.78, 0.5)),
      ], 9),
      T('Cylon ships and jump preparation', 'The icons at the bottom of the crisis card may activate Cylon ships and may advance the fleet marker one step towards the next jump.', 'board', [
        mv('raider.0', at('board', 0.45, 0.3)),
        mv('fleet', at('board', 0.43, 0.93)),
      ]),
      T('How it ends', 'The humans win if the fleet travels at least 8 distance and then makes one more jump. The Cylons win if any resource dial reaches 0, Galactica is destroyed, or Centurions overrun the ship.', 'all'),
    ],
  }
})
