/** Gift Trap: a grid of gift cards, give and get tokens, and two scoring tracks. */
import { C, OnP, P, R, S, T, at, board, deck, discs, draw, f, ft, mv, tabletop } from '../compose'
import { gridUV } from '../layouts'

const GIFT = [ft('#f6e3ea', 'Gift', 'photo', '♛'), ft('#e3eef6', 'Gift', 'photo', '★'), ft('#e8f3df', 'Gift', 'photo', '◆'), ft('#f6efd6', 'Gift', 'photo', '⌂')]
const g = gridUV(3, 3)
const cellAt = (i: number, du = 0): [number, number] => [g(i % 3, 2 - Math.floor(i / 3))[0] + du, g(i % 3, 2 - Math.floor(i / 3))[1]]
const SIDE = 0.112

export const giftTrap = tabletop('gift-trap', 'Gift Trap', [3, 8], 4, '45–60 min', 'Easy', 'Give gifts your friends will actually want.', ['#c0392b', '#3d8b4a', '#e0b12f'], (n) => ({
  setup: [
    S('Lay out the board', 'Put the gift grid and the scoring tracks in the middle of the table.', 'c', [
      C(board('grid', 6, 6, 'g:grid:3x3:#f4ead8:#c0392b:Gift grid', 'Gift grid', 'Spaces where each round’s gift cards are laid out, one more gift than there are players. In the real game the grid and the tracks are parts of one board; this drawing is schematic.')),
      C(board('tracks', 9, 2.2, 'g:plain:0:#e6efe2:#3d8b4a:Give track and Get track', 'Scoring tracks', 'Two separate tracks. One measures how well you give, the other how much you like what you get. You must finish both to win.')),
    ]),
    S('Sort the gift cards', 'Shuffle the gift cards and stack them face down beside the board. If your edition sorts them into price levels, keep one stack per level.', 'r', [
      R(deck('gifts', 40, f('#c0392b', '✦'), 'Gift cards', 'Each card pictures one gift, from cheap to outrageous. A fresh set is dealt every round. Check your rulebook for how the price levels are used.')),
    ]),
    S('Choose a color and place two markers', 'Each player takes the pieces of one color and puts one scoring marker at the start of the Give track and one at the start of the Get track.', 'tracks', [
      OnP('tracks', 0.2, 0.3, discs('givem', 1, 0.13, '$', 'Give marker', 'Moves along the Give track when other players like the gifts you chose for them.', { h: 0.2 }), [0.3, 0]),
      OnP('tracks', 0.2, 0.74, discs('getm', 1, 0.13, '$', 'Get marker', 'Moves along the Get track according to how you rated the gifts you were given.', { h: 0.2 }), [0.3, 0]),
    ]),
    S('Take your give tokens', `Each player takes ${n - 1} give tokens: one for every other player at the table.`, 'you', [
      P(discs('give', n - 1, 0.2, '$', 'Give tokens', `${n - 1} tokens, one marked for each other player. Each round you place every one of them face down on the gift you choose for that person.`, { h: 0.06, label: '→', ink: '#ffffff' })),
    ]),
    S('Take your get tokens', 'Each player also takes 4 get tokens for rating the gifts on offer, from the one you would love most down to the one you would hate.', 'you', [
      P(discs('get', 4, 0.2, ['#3d8b4a', '#8fbf6a', '#e0b12f', '#3a3a3a'], 'Get tokens', '4 tokens: three positive ratings of different strength and one "no way". The exact points for each are printed on the tokens and in the rulebook.', { h: 0.06, label: ['★', '●', '○', '✕'], ink: '#ffffff' })),
    ]),
    S('Ready to play', 'Everyone plays at the same time. Each round has three parts: deal gifts, give and get in secret, then reveal and score.', 'all', [], 'The game suits groups who know each other a little: you are guessing what each friend would like.'),
  ],
  turn: [
    T('Deal the gifts', `Deal gift cards face up onto the grid: one more than the number of players, so ${n + 1} this round.`, 'grid',
      Array.from({ length: n + 1 }, (_, i) => draw('gifts', at('grid', ...cellAt(i)), GIFT[i % 4], `gift${i}`, 0.3 + i * 0.25))),
    T('Give', 'In secret, everyone chooses one gift for each other player and puts the matching give token face down beside it. You pick the first gift for the player on your left, and they pick the third for you.', 'grid', [
      mv('give.0', at('grid', ...cellAt(0, -SIDE))),
      mv('give.0@1', at('grid', ...cellAt(2, -SIDE))),
    ]),
    T('Get', 'Also in secret, everyone rates the gifts for themselves by placing their get tokens. You put your best rating on the third gift and your "no way" on the second.', 'grid', [
      mv('get.0', at('grid', ...cellAt(2, SIDE))),
      mv('get.3', at('grid', ...cellAt(1, SIDE))),
      mv('get.1@1', at('grid', ...cellAt(0, SIDE))),
    ]),
    T('Reveal and score', 'Turn the tokens over. For each gift you were given, your own rating of it moves your Get marker and moves the giver’s Give marker by the same amount. A gift you marked "no way" moves both of you backwards.', 'tracks', [
      mv('getm', at('tracks', 0.56, 0.74)),
      mv('givem@1', at('tracks', 0.56, 0.3)),
      mv('givem', at('tracks', 0.5, 0.3)),
      mv('getm@1', at('tracks', 0.5, 0.74)),
    ]),
    T('New round, and winning', 'Clear the grid, take your tokens back and deal new gifts. The first player to reach the end of both the Give track and the Get track wins.', 'all'),
  ],
}))
