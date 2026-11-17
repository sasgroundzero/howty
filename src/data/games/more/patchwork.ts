/** Patchwork: a ring of patches round the time board, two quilt boards and a handful of buttons. */
import { C, On, OnP, P, R, S, T, at, board, by, cubes, discs, hide, mv, pawns, spawn, tabletop, tiles } from '../compose'
import { loopUV } from '../layouts'

const FABRIC = ['#c96b4a', '#6f95c9', '#e3c15a', '#7fb069', '#a779b8', '#d9824a', '#5f9ea0', '#c96bb0', '#8fb04a', '#b98a5e']
const BODY = 'One of the 33 patches. Each shows a cost in buttons, a cost in time and sometimes buttons that earn income. Real patches come in many shapes; they are drawn as squares here, and in rows rather than a ring.'
const patches = (id: string, count: number, cols: number, k: number) => tiles(id, count, 0.8, 0.8, FABRIC.map((_, i) => FABRIC[(i + k) % FABRIC.length]), 'Patches', BODY, { cols })
const L6 = loopUV(6)

export const patchwork = tabletop('patchwork', 'Patchwork', [2, 2], 2, '15–30 min', 'Easy', 'Buy patches with buttons and time to fill a quilt.', ['#6f95c9', '#e3c15a', '#c96b4a'], () => ({
  setup: [
    S('Quilt boards and buttons', 'Each player takes a quilt board, a time token and 5 buttons.', 'you', [
      P(tiles('quilt', 1, 3.8, 3.8, '#efe6d2', 'Quilt board', 'One per player: a 9 by 9 grid that you try to cover with patches. Every empty square costs you 2 points at the end.', { h: 0.02 })),
      P(discs('buttons', 5, 0.17, '#2e6fb7', 'Buttons', 'You start with 5. Buttons are both the money you pay for patches and your points at the end.', { h: 0.06 })),
    ]),
    S('Time board', 'Place the time board in the middle of the table and put both time tokens on its starting space.', 'time', [
      C(patches('patchB', 6, 3, 2), board('time', 4.2, 4.2, 'g:ring:6:#e8dcc0:#3d6f8f:Time board', 'Time board', 'A track that both time tokens travel along. The real track is a spiral with more spaces than this simple loop.'), patches('patchC', 6, 3, 5)),
      OnP('time', 0.9, 0.929, discs('tt', 1, 0.14, '$', 'Time token', 'One per player. It moves forward whenever you spend time, and the player whose token is further behind always takes the next turn.'), [0.3, 0]),
    ]),
    S('Special patches', 'Put the 5 small leather patches on the marked spaces of the time board.', 'time', [5, 9, 13, 17, 21].map((s, i) =>
      On('time', L6(s)[0], L6(s)[1], cubes(`sp${i}`, 1, '#8a5a2b', 'Special patch', 'One of 5 single-square patches. The first player to move past it takes it and places it on their quilt straight away.', { s: 0.28 })),
    )),
    S('Lay out the patches', 'Arrange all the regular patches in a ring around the time board, in any order.', 'c', [
      C(tiles('small', 1, 0.8, 0.8, '#7fb069', 'Smallest patch', 'The patch that covers only 2 squares. The neutral pawn starts just after it.'), pawns('pawn', 1, '#e9e4d8', 'Neutral pawn', 'Marks your place in the ring. You may only buy one of the three patches in front of it.', { scale: 0.6 }), patches('patchA', 10, 10, 0)),
      C(patches('patchD', 10, 10, 7)),
    ], 'Find the smallest patch, the one of size 1 by 2, and stand the neutral pawn between it and the next patch clockwise.'),
    S('Bonus tile', 'Leave the special 7 by 7 tile beside the board.', 'r', [
      R(tiles('bonus', 1, 1.4, 1.4, '#e0b12f', 'Special tile', 'Worth 7 points to the first player who completely fills a 7 by 7 square on their quilt board.'), discs('bank', 1, 0.3, '#2e6fb7', 'Button supply', 'The rest of the buttons, used as the bank.', { h: 0.4 })),
    ]),
    S('Ready to play', 'The player who last used a needle goes first. After that, the player whose time token is further behind always takes the next turn.', 'all', [], 'On your turn either buy and place one of the three patches in front of the pawn, or advance and collect buttons.'),
  ],
  turn: [
    T('Buy a patch', 'You choose one of the three patches clockwise of the pawn, move the pawn to its place, pay its button cost and fit it onto your quilt board. Say this one costs 2 buttons.', 'c', [
      mv('patchA.1', at('quilt', 0.3, 0.3)), mv('pawn', by('patchA.0', 0.94, 0)), hide('buttons.4'), hide('buttons.3'),
    ]),
    T('Pay the time', 'Then you move your time token forward by the time cost printed on the patch, here 2 spaces.', 'time', [mv('tt', at('time', 0.643, 0.929))]),
    T('Advance and take buttons', 'Your opponent is now behind, so they go. They pass: their token jumps to the space just in front of yours and they take 1 button for each space moved.', 'time', [
      mv('tt@1', at('time', 0.5, 0.929)),
      spawn(discs('gain', 3, 0.17, '#2e6fb7', 'Buttons gained', 'One button for each space moved when advancing.', { h: 0.06 }), by('buttons@1', 0, 0.6), 'bank'),
    ]),
    T('Income and leather patches', 'Whenever your token passes a button symbol on the track, you collect buttons equal to the buttons shown on your quilt. The first token to pass a leather patch claims it.', 'time'),
    T('End of the game', 'The game ends when both tokens reach the last space. Count your buttons, subtract 2 for each empty square on your quilt, and add 7 if you hold the special tile. The higher score wins.', 'all'),
  ],
}))
