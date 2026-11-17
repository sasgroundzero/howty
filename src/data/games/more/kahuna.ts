/** Kahuna: two players bridge twelve islands with cards and fight for the majority on each. */
import { C, P, R, S, T, at, board, by, cards, deck, discs, draw, ft, hide, mv, pile, spawn, tabletop, tiles } from '../compose'
import { cityUV } from '../layouts'

const ISLE = ft('#f3e7c5', 'ISLAND', 'card', '●')
const mid = (a: number, b: number): [number, number] => [(cityUV(a)[0] + cityUV(b)[0]) / 2, (cityUV(a)[1] + cityUV(b)[1]) / 2]
const bridge = (id: string, w: number, d: number) => tiles(id, 1, w, d, '$', 'Bridge', 'A bridge joins two islands and counts toward the majority on both.', { h: 0.1 })

export const kahuna = tabletop('kahuna', 'Kahuna', [2, 2], 2, '30 min', 'Easy', 'Two rivals bridge and claim a chain of islands.', ['#3f8fb0', '#e3d2a0', '#3a3a3a'], () => ({
  setup: [
    S('Place the board', 'Put the board between the two players.', 'c', [
      C(board('sea', 10, 7.5, 'g:map:0:#7fb7cf:#e3d2a0:Kahuna', 'Island board', '12 islands joined by dotted lines where bridges can be built. This drawing is schematic and shows a few more islands than the real board.')),
    ]),
    S('Bridges and Kahuna stones', 'Each player takes the 25 bridges and 10 Kahuna stones of one color, black or white.', 'you', [
      P(pile('bridges', '$', 'Your bridges', '25 bridges per player, black or white in the real game. Each is placed on a dotted line between two islands.'), discs('stones', 1, 0.24, '$', 'Your Kahuna stones', '10 stones per player. One goes on each island where you hold more than half of the bridge lines.', { h: 0.4 })),
    ]),
    S('Deal island cards', 'Shuffle the 24 island cards and deal 3 face down to each player.', 'you', [
      P(cards('hand', 3, ISLE, 'Island cards', 'Your hand, with a limit of 5. Each card names one island and lets you build a bridge from it to any neighbour.')),
    ]),
    S('Deck and face-up cards', 'Turn 3 cards face up beside the board and put the rest of the deck face down next to them.', 'r', [
      R(deck('isles', 15, ft('#3f8fb0', '', '', '●'), 'Island card deck', '24 island cards in total, two for each of the 12 islands.'), cards('open', 3, ISLE, 'Face-up cards', 'At the end of your turn you may take one of these or the top card of the deck.')),
    ]),
    S('Ready to play', 'Decide who starts; the players then alternate turns.', 'all', [], 'On your turn play as many cards as you like (or none) to build or remove bridges, then you may draw one card.'),
  ],
  turn: [
    T('Build a bridge', 'You play an island card and put one of your bridges on a free line running from that island.', 'sea', [
      hide('hand.0'),
      spawn(bridge('br1', 0.6, 0.22), at('sea', ...mid(10, 11)), 'bridges'),
    ]),
    T('Take control of an island', 'You play another card and build a second bridge. You now hold more than half of the lines on that island, so you place a Kahuna stone there. Any enemy bridges touching it would be removed.', 'sea', [
      hide('hand.1'),
      spawn(bridge('br2', 0.22, 0.6), at('sea', ...mid(5, 10)), 'bridges'),
      spawn(discs('stone1', 1, 0.2, '$', 'Kahuna stone', 'Marks an island you control. It is worth nothing itself, but controlled islands are counted in each scoring.'), at('sea', ...cityUV(10)), 'stones', undefined, 1.6),
    ]),
    T('Draw a card', 'To end your turn you may take one face-up card or the top card of the deck. A face-up card is replaced from the deck.', 'r', [
      mv('open.0', at('hand.2', 1.15, 0.5, 0.02)),
      draw('isles', by('open.1', -1.04, 0), ISLE),
    ]),
    T('Your opponent replies', 'The other player builds a bridge of their own. They could instead play two cards for the islands it joins to remove one of yours, which may cost you your majority and your stone.', 'sea', [
      hide('hand.0@1'),
      spawn(bridge('br3', 0.6, 0.22), at('sea', ...mid(8, 9)), 'bridges@1', '#2e6fb7'),
    ]),
    T('Scoring and the finish', 'A round ends when the deck and the face-up cards are used up. After round one the player with more Kahuna stones scores 1 point, after round two 2 points, and after round three the difference in stones. The higher total wins.', 'all'),
  ],
}))
