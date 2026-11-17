/** Through the Ages: a 13-card row, six starting technologies each, and banks of yellow and blue tokens. */
import { C, On, OnP, P, R, S, T, at, board, by, cards, deck, discs, draw, f, ft, hide, mat, mv, spawn, tabletop } from '../compose'

const [W, D, G] = [0.8, 1.12, 0.1]
const CIV = [ft('#f3e7c5', 'Leader', 'Age A', '♛'), ft('#e6dcf0', 'Wonder', 'Age A', '▲'), ft('#f6efb8', 'Action', 'Age A', '✦')]
const TECH = [ft('#f1d9c0', 'Despotism', 'government', '♛'), ft('#d6e3f3', 'Philosophy', 'lab', '✦'), ft('#d6e3f3', 'Religion', 'temple', '⌂'), ft('#f3ecc0', 'Agriculture', 'farm', '●'), ft('#e0d0bd', 'Bronze', 'mine', '◆'), ft('#f1cfc9', 'Warriors', 'military', '⚔')]
const YEL = '#e0b12f'
const BLU = '#2e6fb7'
/** u of slot k in a row of `m` small cards. */
const u = (k: number, m: number) => (k * (W + G) + W / 2) / (m * W + (m - 1) * G)
const worker = (id: string, k: number, count: number, what: string) =>
  On('tech', u(k, 6), 0.42, discs(id, count, 0.14, YEL, 'Worker', `${count} yellow token${count > 1 ? 's' : ''} on ${what}. A token on a card is a building or unit of that kind.`, { h: 0.08, gap: 0.05 }))

export const throughTheAges = tabletop('through-the-ages', 'Through the Ages: A Story of Civilization', [2, 4], 3, '2–4 hours', 'Hard', 'Build a civilization from antiquity onward.', ['#b9892f', '#2e6fb7', '#e9e4d8'], (n) => {
  const cut = n === 2 ? 3 : n === 3 ? 2 : 1
  const left = [...(n === 2 ? [] : [2]), 4, 5, 6, 7, 8, 9, 10, 11, 12]
  return {
    setup: [
      S('Deal the card row', 'Shuffle the Age A civil cards and deal 13 face up in a row. The remaining Age A cards form the civil deck.', 'row', [
        C(cards('row', 13, CIV, 'Card row', '13 civil cards anyone can take. The first 5 cost 1 civil action each, the next 4 cost 2, and the last 4 cost 3.', { w: W, d: D, gap: G })),
        R(
          deck('civil', 12, f('#b9892f', 'A'), 'Civil deck', 'Refills the card row. When Age A runs out, the Age I deck takes over, then II and III. Check the rulebook for cards removed with fewer players.', { w: W, d: D }),
          deck('mil', 10, f('#7a2f2f', 'A'), 'Military deck', 'Events, aggressions and bonus cards. Age A military cards are used to seed the first events.', { w: W, d: D }),
        ),
      ]),
      S('Score board', 'Lay out the scoring tracks and put each player’s culture and science markers at 0.', 'score', [
        C(board('score', 11.6, 2.4, 'g:plain:0:#e6dcc0:#b9892f:Culture and science tracks', 'Scoring tracks', 'Tracks for culture points and science points, and for how much of each a civilization makes per turn. This drawing is schematic.')),
        OnP('score', 0.1, 0.3, discs('cul', 1, 0.15, '$', 'Culture marker', 'Your culture points. The most culture at the end wins.', { h: 0.14 }), [0.34, 0]),
        OnP('score', 0.1, 0.72, discs('sci', 1, 0.15, '$', 'Science marker', 'Your science points, spent to play technology cards.', { h: 0.14 }), [0.34, 0]),
      ]),
      S('Starting technologies', 'Each player lays out the six starting cards of their color: Despotism, Philosophy, Religion, Agriculture, Bronze and Warriors.', 'you', [
        P(cards('tech', 6, TECH, 'Starting technologies', 'Six cards every civilization begins with: a government, a lab, a temple, a farm, a mine and a military unit.', { w: W, d: D, gap: G })),
      ]),
      S('Fill your banks', 'Take the yellow and blue tokens of your civilization and put them in their two banks. Most of the yellow tokens stay in the yellow bank.', 'bank', [
        P(
          mat('bank', 2.2, 1.3, '$', 'Banks', 'Yellow and blue banks', 'The yellow bank holds population you have not yet grown. The blue bank holds the tokens that become food and resources.'),
          discs('civil4', 4, 0.18, '#f1ece0', 'Civil actions', 'Despotism gives 4 civil actions a turn. Spend them to take cards, grow population, build and play technologies.', { h: 0.08 }),
          discs('mil2', 2, 0.18, '#c0392b', 'Military actions', 'Despotism gives 2 military actions a turn, for units, tactics and political moves.', { h: 0.08 }),
        ),
        On('bank', 0.2, 0.55, discs('ybank', 1, 0.2, YEL, 'Yellow bank', 'Your spare population tokens. The exact number depends on the edition: follow the spaces printed on your card or board.', { h: 0.5 })),
        On('bank', 0.52, 0.55, discs('bbank', 1, 0.2, BLU, 'Blue bank', 'Blue tokens. When moved onto a farm or mine card they count as food or resources. The number depends on the edition.', { h: 0.45 })),
      ]),
      S('Place your starting workers', 'Put 1 yellow token on Warriors, 2 on Agriculture, 2 on Bronze and 1 on Philosophy. One more yellow token waits as an unused worker.', 'you', [
        worker('wPhi', 1, 1, 'Philosophy'), worker('wAgr', 3, 2, 'Agriculture'), worker('wBro', 4, 2, 'Bronze'), worker('wWar', 5, 1, 'Warriors'),
        On('bank', 0.85, 0.55, discs('idle', 1, 0.14, YEL, 'Unused worker', 'A worker with no job yet. Spend a civil action and resources to turn it into a building or unit.', { h: 0.08 })),
      ], 'Religion and Despotism start with no tokens on them.'),
      S('Ready to play', `Choose a starting player. In the first round players may only take cards from the row: the first player has 1 civil action, the second 2${n > 2 ? ', the third 3' : ''}${n > 3 ? ', the fourth 4' : ''}.`, 'all', [], 'From the second round on, a full turn is: refresh the card row, an optional political action, spend your civil and military actions, then production.'),
    ],
    turn: [
      T('Round 1: take a card', 'You are first, so you have a single civil action. You spend it on one of the five cheapest cards in the row and take it into your hand.', 'row', [
        mv('row.1', at('tech', 1.12, 0.5)),
        mv('civil4.0', by('civil4.0', 0, -0.9)),
      ]),
      T('The second player takes two', 'The player on your left has 2 civil actions this round and takes two cards that cost 1 each.', 'row', [
        mv('row.0', at('tech@1', 1.12, 0.5)),
        mv('row.3', at('tech@1', 1.27, 0.5, 0.02)),
      ]),
      T('Production', 'Each turn ends with production. Every worker on a farm or mine brings 1 blue token from your blue bank onto that card, and your science and culture markers advance by what your buildings make.', 'you', [
        spawn(discs('food', 2, 0.12, BLU, 'Food', 'Blue tokens on a farm card are food, used to grow your population.', { h: 0.08, gap: 0.05 }), at('tech', u(3, 6), 0.85), 'bbank'),
        spawn(discs('ore', 2, 0.12, BLU, 'Resources', 'Blue tokens on a mine card are resources, used to build.', { h: 0.08, gap: 0.05 }), at('tech', u(4, 6), 0.85), 'bbank'),
        mv('sci', at('score', 0.2, 0.72)),
      ]),
      T('Round 2: refresh the card row', `At the start of each later turn, discard whatever is left in the first ${cut} position${cut > 1 ? 's' : ''} of the row (with ${n} players), slide the other cards along and deal new ones into the gaps at the end.`, 'row', [
        ...(n === 2 ? [hide('row.2', 0.2)] : []),
        ...left.map((k, j) => mv(`row.${k}`, at('row', u(j, 13), 0.5, -0.015), 0.5 + j * 0.08)),
        ...Array.from({ length: 13 - left.length }, (_, j) => draw('civil', at('row', u(left.length + j, 13), 0.5, -0.015), CIV[j % 3], undefined, 1.6 + j * 0.3)),
      ], 9),
      T('A full turn', 'Now you have all 4 civil actions. For example, pay food to move a yellow token from your yellow bank to your unused workers, then pay resources to put a worker onto a farm, mine or other building.', 'you', [
        spawn(discs('grown', 1, 0.14, YEL, 'New worker', 'Population you have just grown. It is unused until you build with it.', { h: 0.08 }), at('bank', 0.85, 0.18), 'ybank'),
        mv('civil4.1', by('civil4.1', 0, -0.9)),
      ]),
      T('How it ends', 'New ages bring stronger cards and make old ones obsolete. In the full game the end is triggered when the Age III civil deck runs out; the round is completed so that everyone has had the same number of turns, final scoring events are counted, and the most culture wins.', 'all'),
    ],
  }
})
