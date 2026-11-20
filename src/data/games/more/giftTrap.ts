/** Gift Trap: a grid of gift cards, give and get tokens, and two scoring tracks. */
import { C, OnP, P, R, S, T, at, board, by, deck, discs, draw, f, ft, mv, tabletop } from '../compose'
import { gridUV } from '../layouts'

const GIFT = [ft('#f6e3ea', 'Gift', 'photo', '♛'), ft('#e3eef6', 'Gift', 'photo', '★'), ft('#e8f3df', 'Gift', 'photo', '◆'), ft('#f6efd6', 'Gift', 'photo', '⌂')]
const g = gridUV(3, 3)
const cellAt = (i: number, du = 0): [number, number] => [g(i % 3, 2 - Math.floor(i / 3))[0] + du, g(i % 3, 2 - Math.floor(i / 3))[1]]
const SIDE = 0.112

export const giftTrap = tabletop('gift-trap', 'Gift Trap', [4, 8], 4, '45–60 min', 'Easy', 'Give gifts your friends will actually want.', ['#c0392b', '#3d8b4a', '#e0b12f'], (n) => ({
  setup: [
    S('Lay out the board', 'Put the gift grid and the scoring tracks in the middle of the table.', 'c', [
      C(board('grid', 6, 6, 'g:grid:3x3:#f4ead8:#c0392b:Gift grid', 'Gift grid', 'Spaces where each round’s gift cards are laid out, one more gift than there are players. In the real game the grid and the tracks are parts of one board; this drawing is schematic.')),
      C(board('tracks', 9, 2.2, 'g:plain:0:#e6efe2:#3d8b4a:Give track and Get track', 'Scoring tracks', 'Two separate tracks. One measures how well you give, the other how much you like what you get. You must finish both to win.')),
    ]),
    S('Sort the gift cards', 'Put the four packs of gift cards beside the board. Each color is a price level, from yellow (cheapest) through red and blue to black.', 'r', [
      R(deck('gifts', 40, f('#c0392b', '✦'), 'Gift cards', 'Each card is double-sided, with a different gift on each side. Each round the dealer picks which pack to deal from.')),
    ]),
    S('Choose a color and place two markers', 'Each player takes the pieces of one color and puts one scoring marker at the start of the Give track and one at the start of the Get track.', 'tracks', [
      OnP('tracks', 0.2, 0.3, discs('givem', 1, 0.13, '$', 'Give marker', 'Moves along the Give track when other players like the gifts you chose for them.', { h: 0.2 }), [0.3, 0]),
      OnP('tracks', 0.2, 0.74, discs('getm', 1, 0.13, '$', 'Get marker', 'Moves along the Get track according to how you rated the gifts you were given.', { h: 0.2 }), [0.3, 0]),
    ]),
    S('Take your give tokens', `Each player takes their color\'s numbered give tokens. Each round you hand out ${n - 1} of them, one to every other player.`, 'you', [
      P(discs('give', n - 1, 0.2, '$', 'Give tokens', `The numbers match the spaces on the gift grid, so a token names the gift you are giving. The game gives you 9; the ${n - 1} you use each round are shown.`, { h: 0.06, label: '→', ink: '#ffffff' })),
    ]),
    S('Take your get tokens', 'Each player also takes 4 get tokens for rating the gifts on offer, from the one you would love most down to the one you would hate.', 'you', [
      P(discs('get', 4, 0.2, ['#3d8b4a', '#8fbf6a', '#e0b12f', '#3a3a3a'], 'Get tokens', '4 tokens: Great, Good and OK for the gifts you want, and No Way for the one you want least.', { h: 0.06, label: ['★', '●', '○', '✕'], ink: '#ffffff' })),
    ]),
    S('Ready to play', 'Choose a dealer; the role passes on each round. Everyone gives and rates gifts at the same time: deal gifts, give and get in secret, then reveal and score.', 'all', [], 'The game suits groups who know each other a little: you are guessing what each friend would like.'),
  ],
  turn: [
    T('Deal the gifts', `The dealer picks a pack and deals gift cards onto the grid, starting at space 1: one more than the number of players, so ${n + 1} this round.`, 'grid',
      Array.from({ length: n + 1 }, (_, i) => draw('gifts', at('grid', ...cellAt(i)), GIFT[i % 4], `gift${i}`, 0.3 + i * 0.25))),
    T('Give', 'In secret, everyone picks one gift for each other player and places the give token with that gift\'s number face down in front of that player. You give gift 1 to the player on your left, and they give you gift 3.', 'all', [
      mv('give.0', by('get@1', 1.25, 0)),
      mv('give.0@1', by('get', 1.25, 0), 0.6),
    ]),
    T('Get', 'Once the giving is done, everyone rates the gifts for themselves by placing their get tokens face down on the grid. You put Great on the third gift and No Way on the second.', 'grid', [
      mv('get.0', at('grid', ...cellAt(2, SIDE))),
      mv('get.3', at('grid', ...cellAt(1, SIDE))),
      mv('get.1@1', at('grid', ...cellAt(0, SIDE))),
    ]),
    T('Reveal and score', 'Starting with the dealer, each player turns over their get tokens, then the gifts they received one by one. Each gift moves the receiver\'s Get marker and the giver\'s Give marker: Great 3, Good 2, OK 1 forward, No Way 4 back, and any other gift 1 back.', 'tracks', [
      mv('getm', at('tracks', 0.56, 0.74)),
      mv('givem@1', at('tracks', 0.56, 0.3)),
      mv('givem', at('tracks', 0.5, 0.3)),
      mv('getm@1', at('tracks', 0.5, 0.74)),
    ]),
    T('New round, and winning', 'Return the tokens and gift cards and the next player deals. You win if both your markers are in the Gifted zone at the end of a round; markers can slip back out of it.', 'all'),
  ],
}))
