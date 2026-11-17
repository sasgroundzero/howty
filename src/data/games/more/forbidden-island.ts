/** Forbidden Island: a co-operative race to grab four treasures from a sinking island of 24 tiles. */
import { C, L, On, type Place, P, R, S, T, at, cards, deck, discs, draw, f, ft, hide, mat, mv, pawns, spawn, tabletop, tiles } from '../compose'
import { COLORS } from '../kit'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const LAND = ft('#d9c79a', '', '', '▲')
const TRE = ['#c0392b', '#2e6fb7', '#e0b12f', '#8a8f98']
const TCARD = TRE.map((c) => f(c, '◆'))
const FLOODCARD = f('#5d8fb0', '≈')
const flooded = (id: string) => tiles(id, 1, 1.2, 1.2, f('#5d8fb0', '≈'), 'Flooded tile', 'A flooded tile is flipped to its blue side. It can be shored up, but if it floods again it sinks and is removed for good.', { h: 0.02 })
const ROWS = [2, 4, 6, 6, 4, 2]
const HOME = ['r2.1', 'r2.4', 'r3.2', 'r1.2']
const WET = ['r0.0', 'r1.0', 'r2.5', 'r3.0', 'r4.1', 'r5.1']

export const forbiddenIsland = tabletop('forbidden-island', 'Forbidden Island', [2, 4], 4, '30 min', 'Easy', 'Rescue four treasures before the island sinks.', ['#5d8fb0', '#d9c79a', '#c0392b'], (n) => ({
  setup: [
    S('Build the island', 'Shuffle the 24 island tiles and lay them face up in a cross: rows of 2, 4, 6, 6, 4 and 2 tiles, with a small gap between them.', 'c', ROWS.map((k, r) =>
      C(tiles(`r${r}`, k, 1.2, 1.2, r === 3 ? [LAND, LAND, LAND, ft('#e9dfc8', '', '', '✦'), LAND, LAND] : LAND, 'Island tiles', '24 tiles. Eight show a treasure symbol, six are starting gates for the pawns, and one is Fools’ Landing, the helicopter pad you must all escape from.')),
    ), 'Where each named tile lands is random, so every game has a different island.'),
    S('Treasures and decks', 'Stand the 4 treasure figures beside the island. Shuffle the flood deck and the treasure deck separately and put them on opposite sides.', 'all', [
      L(pawns('loot', 4, TRE, 'Treasures', 'The four treasures to collect. Hand in 4 matching treasure cards on one of that treasure’s two tiles to take it.', { scale: 0.6, shape: 'boss', cols: 2 })),
      R(deck('tdeck', 28 - 2 * n, f('#a8452f', '◆'), 'Treasure deck', '28 cards: 5 for each of the 4 treasures, 3 Helicopter Lift, 2 Sandbags and 3 Waters Rise!'), deck('flood', 18, f('#2f5f86', '≈'), 'Flood deck', '24 cards, one for each island tile. Drawing a card floods that tile, or sinks it if it is already flooded.'), deck('wet', 6, FLOODCARD, 'Flood discard pile', 'Flood cards already drawn. When Waters Rise! appears these are shuffled and put back on top of the flood deck.')),
    ]),
    S('The island starts to sink', 'Draw the top 6 flood cards one at a time and flip each matching island tile to its flooded blue side. Put the cards on the flood discard pile.', 'c', WET.map((t, k) => on(t, 0.5, 0.5, flooded(`fl${k}`)))),
    S('Adventurers', 'Shuffle the 6 adventurer cards and deal one to each player. Take the pawn of that color and stand it on the island tile that shows the matching pawn.', 'c', [
      P(cards('role', 1, ft('#efe2bd', 'ROLE', 'special power', '★'), 'Adventurer card', 'One of 6 roles, such as Pilot or Engineer, each with its own special ability.')),
      ...Array.from({ length: n }, (_, i) => on(HOME[i], 0.5, 0.5, pawns(`pawn${i}`, 1, COLORS[i], 'Adventurer pawn', 'Starts on the gate tile of its own color.', { scale: 0.55 }))),
    ]),
    S('Deal treasure cards', 'Deal 2 treasure cards face up to each player. If anyone gets a Waters Rise! card, give them a replacement and shuffle it back into the deck.', 'you', [
      P(cards('hand', 2, [TCARD[0], TCARD[2]], 'Treasure cards', 'Your hand, kept face up so the team can plan. The limit is 5 cards.')),
    ]),
    S('Set the water level', 'Put the marker on the water meter at the difficulty you want. Novice is the lowest starting level.', 'r', [
      R(mat('meter', 1.3, 3, '#cfe0ea', 'Water level', 'Water meter', 'Shows how many flood cards are drawn at the end of each turn. It climbs every time a Waters Rise! card is drawn.')),
      on('meter', 0.5, 0.85, discs('level', 1, 0.2, '#c0392b', 'Water level marker', 'At the Novice start you draw 2 flood cards per turn. If it reaches the top, everyone loses.')),
    ]),
    S('Ready to play', 'The rules have the player who most recently visited an island go first, then play passes to the left.', 'all', [], 'On your turn: take up to 3 actions (move, shore up, give a card, capture a treasure), draw 2 treasure cards, then draw flood cards equal to the water level.'),
  ],
  turn: [
    T('Shore up a tile', 'You spend an action to shore up the flooded tile next to your pawn, flipping it back to its dry side.', 'c', [hide('fl1')]),
    T('Move', 'You spend another action to move one tile up, down, left or right. Diagonal moves are not allowed for most roles.', 'c', [mv('pawn0', at('r1.0', 0.5, 0.5))]),
    T('Draw two treasure cards', 'After your actions, draw 2 cards from the treasure deck. If you hold more than 5, discard down to 5.', 'you', [
      draw('tdeck', at('hand.1', 1.15, 0.5, 0.02), TCARD[0]),
      draw('tdeck', at('hand.1', 1.8, 0.5, 0.04), TCARD[1]),
    ]),
    T('Draw flood cards', 'Finally draw flood cards equal to the water level, here 2, and flood the tiles they name.', 'c', [
      draw('flood', at('wet', 0.5, 0.5, 0.02), FLOODCARD),
      draw('flood', at('wet', 0.5, 0.5, 0.04), FLOODCARD),
      spawn(flooded('new1'), at('r4.2', 0.5, 0.5)),
      spawn(flooded('new2'), at('r2.3', 0.5, 0.5)),
    ]),
    T('Winning and losing', 'Collect all 4 treasures, gather every pawn on Fools’ Landing and play a Helicopter Lift card to win together. You all lose if Fools’ Landing sinks, both tiles of an uncollected treasure sink, a pawn drowns, or the water meter reaches the top.', 'all'),
  ],
}))
