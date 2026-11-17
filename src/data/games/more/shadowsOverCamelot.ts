/** Shadows over Camelot: the Round Table, quest boards, loyalty cards and white and black decks. */
import { C, L, On, OnP, P, R, S, T, at, board, cards, cubes, deck, dice, discs, draw, f, ft, mat, mv, pawns, pile, spawn, tabletop, tiles, zone } from '../compose'

const WHITE = f('#f1ece0', '✦', '#2b241c')
const BLACK = f('#2b2630', '☾')
const HAND = [ft('#fbf6ea', 'Merlin', 'special', '★'), ft('#fbf6ea', 'Grail', 'quest', '♛'), ft('#fbf6ea', 'Fight 3', 'combat', '⚔'), ft('#fbf6ea', 'Fight 1', 'combat', '⚔'), ft('#fbf6ea', 'Fight 4', 'combat', '⚔'), ft('#fbf6ea', 'Fight 2', 'combat', '⚔')]

export const shadowsOverCamelot = tabletop('shadows-over-camelot', 'Shadows over Camelot', [3, 7], 5, '60–90 min', 'Medium', 'Knights on quests, and perhaps one traitor.', ['#5a6b8a', '#e9e4d8', '#2b2630'], (n) => ({
  setup: [
    S('Lay out the boards', 'Put the main Camelot board in the middle and the three smaller quest boards around it: the Holy Grail, Excalibur, and Lancelot with the Dragon.', 'all', [
      C(board('camelot', 10, 7, 'g:plain:0:#cdbf9a:#5a6b8a:Camelot', 'Main board', 'Shows Camelot with the Round Table and the quests around it: the tournament against the Black Knight and the wars against the Saxons and the Picts. This drawing is schematic.')),
      L(board('grail', 3.6, 2.6, 'g:plain:0:#e6dcc0:#b9892f:Holy Grail', 'Holy Grail quest', 'A track that fills with Grail cards from one end and Despair cards from the other.')),
      L(board('excal', 3.6, 2.6, 'g:plain:0:#c9d9e6:#2e6fb7:Excalibur', 'Excalibur quest', 'The sword drifts towards or away from the shore as cards are discarded and black cards are drawn.')),
      R(board('lance', 3.6, 2.6, 'g:plain:0:#d9cfc9:#7a2f2f:Lancelot and the Dragon', 'Lancelot and Dragon quest', 'A double-sided board: first the duel for Lancelot’s Armor, later the Dragon.')),
      On('camelot', 0.5, 0.52, discs('rtable', 1, 2.1, '#8a6a45', 'Round Table', 'Swords won and lost on quests are laid here. Once there are 12 the game ends.', { h: 0.05 })),
    ]),
    S('Place the relics', 'Put Excalibur, the Holy Grail and Lancelot’s Armor on their quest boards. Keep the swords, siege engines, Saxons and Picts beside the board.', 'all', [
      On('excal', 0.5, 0.45, tiles('sword', 1, 0.3, 1.1, '#d8dde3', 'Excalibur', 'A relic. The knights win it by pulling the sword to their side of the quest.', { h: 0.06 })),
      On('grail', 0.5, 0.45, discs('cup', 1, 0.3, '#e0b12f', 'Holy Grail', 'A relic won by completing the Grail quest.', { h: 0.3 })),
      On('lance', 0.5, 0.45, tiles('armor', 1, 0.6, 0.7, '#9aa3ad', 'Lancelot’s Armor', 'A relic won by defeating Lancelot.', { h: 0.2 })),
      R(pile('siege', '#5a4634', 'Siege engines', '12 siege engines. If all 12 ever stand around Camelot, the knights lose.')),
    ]),
    S('Choose your knights', 'Each player takes a coat of arms, the matching knight and a die of that color. Stand the knight at the Round Table and set the die to 4: your starting life points.', 'you', [
      P(mat('arms', 3.2, 1.9, '$', 'Coat of arms', 'Coat of arms', 'Shows your knight’s special power and summarises the turn.')),
      On('arms', 0.78, 0.5, dice('life', 1, '$', 'Life die', 'Tracks your life points. You start with 4 and can never have more than 6. At 0 your knight dies.', { values: [4], size: 0.5, ink: '#ffffff' })),
      OnP('rtable', 0.5, 0.62, pawns('knight', 1, '$', 'Knight', 'Your figure. It moves between Camelot and the quests.', { scale: 0.6 }), [0.56, 0]),
    ]),
    S('Deal loyalty cards', 'Shuffle the 8 loyalty cards, 7 Loyal and 1 Traitor, and deal one face down to each player. Look at yours in secret and put the rest away unseen.', 'you', [
      P(cards('loyal', 1, ft('#efe6d2', 'Loyal', 'secret', '⚑'), 'Loyalty card', `One per player from a deck of 8, so with ${n} players there may be no traitor at all.`, { down: true, back: f('#5a6b8a', '?') })),
    ], n === 3 ? 'The rules suggest how to handle the traitor with only 3 knights: check the rulebook.' : undefined),
    S('Deal the white cards', 'Give each knight 1 Merlin card and 5 more white cards. Shuffle the rest of the white deck and the black deck and set them by the board.', 'you', [
      R(deck('white', 60, WHITE, 'White deck', 'Cards that help the knights: Fight cards numbered 1 to 5, Grail cards and special cards such as Merlin.'), deck('black', 60, BLACK, 'Black deck', 'Cards that advance the forces of evil on the quests, plus some nasty special cards.'), zone('bdisc', 1.1, 1.5, 'Black discards', 'Resolved black cards.')),
      P(cards('hand', 6, HAND, 'White cards', 'Your hand: 1 Merlin card and 5 others to start. You may talk about your cards in general terms but never show them or state exact values.')),
    ]),
    S('Ready to play', 'The rules start with the player who has King Arthur if he is in play; otherwise choose. Play passes clockwise.', 'all', [], 'Every turn has two parts: first the progression of evil, then one heroic action.'),
  ],
  turn: [
    T('Progression of evil', 'You must choose one: draw a black card, add a siege engine to Camelot, or lose 1 life point. You draw a black card. It is a Saxon, so a Saxon lands on the main board.', 'camelot', [
      draw('black', at('bdisc'), ft('#3a3440', 'Saxon', 'black card', '⚔')),
      spawn(pawns('saxon', 1, '#7a2f2f', 'Saxon', 'Invaders gather here. When the fourth arrives the Saxon war is fought with whoever is on that quest.', { scale: 0.5, shape: 'brute' }), at('camelot', 0.08, 0.3)),
    ]),
    T('Heroic action: move', 'Then you take one heroic action. You ride from the Round Table to the Holy Grail quest; moving is your whole action.', 'all', [mv('knight', at('grail', 0.5, 0.85))]),
    T('The next knight', 'The player on your left chooses to add a siege engine instead of drawing, then moves to the Excalibur quest.', 'all', [
      spawn(cubes('engine', 1, '#5a4634', 'Siege engine', 'Placed around Camelot. Knights at Camelot can fight them off with Fight cards.', { s: 0.34 }), at('camelot', 0.5, 0.08), 'siege'),
      mv('knight@1', at('excal', 0.5, 0.85)),
    ]),
    T('Work on a quest', 'On a later turn your heroic action is to play a Grail card onto the Grail quest. Other actions are playing a special white card, healing by discarding 3 identical cards, or accusing a traitor.', 'grail', [mv('hand.1', at('grail', 0.16, 0.45))]),
    T('Winning a quest', 'When a quest is won, white swords go to the Round Table and the knights there gain cards, life or a relic. A lost quest adds black swords and other penalties.', 'rtable', [
      spawn(tiles('wsword', 2, 0.22, 0.8, '#f1ece0', 'White sword', 'Laid on the Round Table for each quest victory. Black swords mark defeats.', { h: 0.05, gap: 0.2 }), at('rtable', 0.5, 0.2)),
    ]),
    T('How it ends', 'The loyal knights win if the Round Table holds 12 swords and more of them are white than black. They lose if 7 or more are black, if 12 siege engines surround Camelot, or if all loyal knights die. A traitor who is never unmasked turns 2 white swords black.', 'all'),
  ],
}))
