/** Saboteur: dwarves dig a tunnel of path cards towards hidden gold while secret saboteurs try to block it. */
import { C, On, P, type Place, R, S, T, at, by, cards, deck, draw, f, flip, ft, mv, tabletop, zone } from '../compose'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const ROLES: Record<number, [number, number]> = { 3: [1, 3], 4: [1, 4], 5: [2, 4], 6: [2, 5], 7: [3, 5], 8: [3, 6] }
const [MW, MD, STEP] = [9.4, 6.8, 0.95]
const col = (k: number) => 0.5 + ((k - 4) * STEP) / MW
const PATH = f('#8a6a44', '┼', '#f3e7c5')
const BACK = f('#5a4634', '◆')
const HAND = [PATH, ft('#f1e2c0', 'BREAK', 'a tool', '✕'), f('#8a6a44', '┬', '#f3e7c5'), ft('#f1e2c0', 'MAP', 'peek at a goal', '?'), f('#8a6a44', '│', '#f3e7c5'), ft('#f1e2c0', 'FIX', 'a tool', '✓')]
const GOAL_BACK = f('#3a3a3a', '?')

export const saboteur = tabletop('saboteur', 'Saboteur', [3, 8], 5, '30 min', 'Easy', 'Dig for gold with traitors in your midst.', ['#5a4634', '#e0b12f', '#3a3a3a'], (n) => {
  const [sab, miners] = ROLES[n]
  const hand = n <= 5 ? 6 : n <= 7 ? 5 : 4
  return {
    setup: [
      S('Start card and goal cards', 'Put the start card face up. Shuffle the 3 goal cards and lay them face down in a column, leaving room for exactly 7 cards between the start card and the goals and one card\'s gap between each goal.', 'c', [
        C(zone('mine', MW, MD, 'The mine', 'Path cards are laid here to build a tunnel from the start card towards the goal cards.')),
        on('mine', col(0), 0.5, cards('start', 1, ft('#d9c7a0', 'START', '', '┼'), 'Start card', 'The mine entrance, with tunnels leading out in all four directions.')),
        ...[0, 1, 2].map((k) => on('mine', col(8), 0.5 + ((k - 1) * 2 * 1.3) / MD, cards(`goal${k}`, 1, k === 1 ? ft('#f3e7c5', 'GOLD', '', '★') : ft('#cfc7b8', 'STONE', '', '●'), 'Goal card', 'One of 3 goal cards. One hides the gold and the other two are just stone. It is flipped when a tunnel reaches it.', { down: true, back: GOAL_BACK }))),
      ]),
      S('Deal secret roles', `With ${n} players, shuffle ${sab} saboteur${sab > 1 ? 's' : ''} and ${miners} gold-diggers and deal one card face down to each player. The one card left over stays hidden until the round ends.`, 'you', [
        P(cards('role', 1, ft('#efe2bd', 'DWARF', 'secret role', '◆'), 'Dwarf card', 'Your secret role this round: a gold-digger trying to reach the gold or a saboteur trying to stop the others.', { down: true, back: f('#7a4fa3', '?') }),
          zone('tools', 3, 1.4, 'Cards played on you', 'Broken tool cards played against you stay here until someone repairs them. While any are here you cannot lay path cards.')),
        R(cards('spare', 1, f('#7a4fa3', '?'), 'Leftover dwarf card', 'One more role card is used than there are players, so nobody can be sure how many saboteurs are in the round.', { down: true, back: f('#7a4fa3', '?') })),
      ], 'The real game plays up to 10. This version stops at 8.'),
      S('Deal the hands', `Shuffle the path cards and action cards together and deal ${hand} to each player. The rest form the draw deck.`, 'you', [
        P(cards('hand', hand, HAND, 'Your hand', 'Path cards extend the tunnel. Action cards break or repair tools, cause rockfalls or let you peek at a goal card.')),
        R(deck('deck', 67 - n * hand, BACK, 'Draw deck', 'What is left of the 40 path cards and 27 action cards after the deal.'),
          zone('disc', 0.9, 1.26, 'Discard', 'Cards used up or thrown away go here face down.')),
      ], 'Hands are 6 cards with 3 to 5 players, 5 cards with 6 or 7 players, and 4 cards with 8 or more.'),
      S('Gold nugget cards', 'Shuffle the gold nugget cards and put them face down beside the draw deck.', 'r', [
        R(deck('nuggets', 28, f('#e0b12f', '◆', '#2b241c'), 'Gold nugget cards', '28 cards worth 1, 2 or 3 nuggets. They are shared out to the winning side at the end of each round.')),
      ]),
      S('Ready to play', 'The youngest player goes first, then play passes clockwise.', 'all', [], 'On your turn you must play one card: add a path card to the mine, play an action card, or pass by discarding a card face down. Then you draw a card.'),
    ],
    turn: [
      T('Lay a path card', 'You add a path card next to the start card. Every tunnel on it must line up with the cards it touches, and it must connect back to the start. Then you draw a card.', 'mine', [
        mv('hand.0', at('mine', col(1), 0.5)),
        draw('deck', by('hand.1', -1.04, 0), HAND[2], undefined, 1.4),
      ]),
      T('Break a tool', 'The player on your left plays a broken tool card in front of you. Until it is repaired you cannot lay path cards. Is that the move of a saboteur, or of a gold-digger who suspects you?', 'you', [
        mv('hand.1@1', at('tools', 0.25, 0.5)),
        draw('deck', by('hand.0@1', 1.04, 0), undefined, undefined, 1.4),
      ]),
      T('Pass by discarding', 'The next player has nothing useful, so they pass by discarding one card face down and drawing a new one.', 'r', [
        flip('hand.2@2', false),
        mv('hand.2@2', at('disc', 0.5, 0.5), 0.8),
        draw('deck', by('hand.1@2', 1.04, 0), undefined, undefined, 1.6),
      ]),
      T('Reaching a goal', 'Later, when a tunnel connects to a goal card, that card is turned over. If it is stone the digging continues towards the others.', 'mine', [flip('goal0')]),
      T('How it ends', 'If the gold is reached, the gold-diggers share out nugget cards, with the finder choosing first. If the deck and hands run out first, the saboteurs take nuggets instead. After 3 rounds, the player with the most nuggets wins.', 'all', [], 8),
    ],
  }
})
