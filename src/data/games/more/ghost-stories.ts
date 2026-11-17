/** Ghost Stories: Taoist monks defend a 3 by 3 village from ghosts that pile up on the boards around it. */
import { C, OnP, P, R, S, T, at, by, deck, dice, discs, draw, f, ft, hide, mat, mv, pawns, pile, roll, spawn, tabletop, tiles } from '../compose'

const GHOST = f('#c0392b', '▲')

export const ghostStories = tabletop('ghost-stories', 'Ghost Stories', [1, 4], 4, '60 min', 'Hard', 'Co-operative monks hold back a tide of ghosts.', ['#3b3350', '#c0392b', '#e0b12f'], (n) => ({
  setup: [
    S('Build the village', 'Shuffle the 9 village tiles and lay them in a 3 by 3 square in the middle of the table.', 'c', [
      C(tiles('village', 9, 1.6, 1.6, ft('#e3d6b5', '', 'villager', '⌂'), 'Village tiles', '9 tiles, each home to a villager who can help the monk standing there. A haunted tile is flipped over and its villager is lost.', { cols: 3, gap: 0.06 })),
    ]),
    S('Player boards', 'Place the 4 colored boards around the village, one along each side, and each player sits at one.', 'all', [
      P(mat('board', 4.2, 1.6, '$', 'Board', 'Player board', 'Has 3 spaces where ghosts of your color appear, facing the village, and shows your monk’s special power.')),
    ], n < 4 ? 'All 4 boards are used even with fewer players. The boards without a player are neutral and follow their own rules in the rulebook.' : 'Each board has two sides with different powers: pick one at random.'),
    S('Monks and Qi', 'Each player puts their Taoist figure on the central village tile and takes their Qi tokens, a Yin-Yang token and starting Tao tokens.', 'you', [
      OnP('village.4', 0.5, 0.5, pawns('monk', 1, '$', 'Taoist monk', 'Your figure. It moves one tile a turn and fights the ghosts next to its tile.', { scale: 0.45 }), [0.4, 0]),
      P(discs('qi', 1, 0.24, '#e9e4d8', 'Qi tokens', 'Your life points. The starting number depends on the difficulty level (4 at the gentler levels, I believe): check the rulebook.', { h: 0.3, label: 'Qi', ink: '#2b241c' }), discs('yin', 1, 0.24, '#3a3a3a', 'Yin-Yang token', 'Spend it once to use a villager without being on its tile, or to restore a haunted tile.', { label: '●', ink: '#e9e4d8' }), discs('tao', 1, 0.2, '$', 'Tao tokens', 'Tao tokens of a color count as extra dice results of that color in an exorcism. The rulebook says which ones you start with.')),
    ]),
    S('Ghost deck', 'Shuffle the ghost cards and build the deck with the Wu-Feng incarnation card buried near the bottom, as the rules for your difficulty level describe.', 'r', [
      R(deck('ghosts', 45, f('#3b3350', '▲'), 'Ghost deck', 'Ghosts in the four board colors plus black. With fewer than 4 players some cards are removed first: the rulebook gives the number.')),
    ], 'At higher difficulty levels more than one incarnation is added.'),
    S('Dice and tokens', 'Put the Tao dice, the curse die, the spare Tao tokens, the Buddha figures and the haunting figures within reach.', 'r', [
      R(dice('taodie', 3, '#e9e4d8', 'Tao dice', 'Rolled to exorcise ghosts. Each face shows a color; here ordinary pips stand in for them.', { values: [2, 4, 6] }), dice('curse', 1, '#3a3a3a', 'Curse die', 'Rolled when a ghost or an effect curses you. Most faces are bad news.', { ink: '#e9e4d8', values: [1] })),
      R(pile('taosup', ['#c0392b', '#2e6fb7', '#e0b12f', '#3d8b4a', '#3a3a3a'], 'Tao token supply', 'Spare Tao tokens in five colors, earned from villagers and from some defeated ghosts.', 'disc'), pawns('buddha', 2, '#d8b24a', 'Buddha figures', '2 Buddhas. Placed on an empty ghost space, a Buddha destroys the next ghost that arrives there.', { scale: 0.5, shape: 'brute' })),
    ]),
    S('Ready to play', 'Pick a starting player; turns go clockwise. Everyone wins or loses together.', 'all', [], 'Each turn has a Yin phase, where the ghosts act and a new one arrives, and a Yang phase, where your monk moves and then either asks a villager for help or attempts an exorcism.'),
  ],
  turn: [
    T('Yin: a ghost arrives', 'First the ghosts on your board act. Then you draw the top ghost card and put it on a free space of the board matching its color.', 'you', [
      draw('ghosts', at('board', 0.5, 0.5), GHOST, 'g1'),
    ]),
    T('Yang: move', 'Your monk may move one tile in any direction, including diagonally. You step to the tile facing the new ghost.', 'c', [mv('monk', at('village.7', 0.5, 0.5))]),
    T('Attempt an exorcism', 'Roll the 3 Tao dice. If you roll at least as many faces of the ghost’s color as its resistance, adding Tao tokens if needed, it is defeated and discarded.', 'r', [
      roll('taodie.0', 5), roll('taodie.1', 5), roll('taodie.2', 3),
      hide('g1', 2.2),
    ]),
    T('Or ask a villager for help', 'Instead of fighting you can use the villager on your tile. One of them hands out Tao tokens, for example.', 'you', [
      spawn(discs('gain', 1, 0.2, '#e0b12f', 'Tao token', 'A token gained from a villager.'), by('tao', 0.6, 0), 'taosup'),
    ]),
    T('Winning and losing', 'You win by defeating every incarnation of Wu-Feng. You lose if all the monks are dead, if too many village tiles are haunted (3 at the standard levels), or if the ghost deck runs out while an incarnation is still in play.', 'all'),
  ],
}))
