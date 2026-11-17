/** 7 Wonders Duel: a small board, eight wonders and a pyramid of Age I cards for two players. */
import { C, On, P, R, S, T, at, board, by, cards, deck, discs, f, flip, ft, mv, pawns, pile, spawn, tabletop, zone } from '../compose'

const BACK = f('#8a5a2b', 'I')
const KIND = [f('#7a4a2a', '▲'), f('#8d8d8d', '◆'), f('#2e6fb7', '★'), f('#3d8b4a', '✦'), f('#e0b12f', '●'), f('#c0392b', '⚔')]
const row = (k: number, count: number, down: boolean) =>
  cards(`r${k}`, count, KIND.map((_, i) => KIND[(i + k) % 6]), down ? 'Face-down Age I card' : 'Face-up Age I card', down ? 'Part of the Age I structure. It is turned face up as soon as no card covers it.' : 'Part of the Age I structure. You may only take a card that no other card covers. In the real game the rows overlap; they are spread out here.', { w: 0.72, d: 1.0, down, back: BACK })

export const sevenWondersDuel = tabletop('7-wonders-duel', '7 Wonders Duel', [2, 2], 2, '30 min', 'Medium', 'Draft cards and wonders in a two-player duel.', ['#8a5a2b', '#c0392b', '#e0b12f'], () => ({
  setup: [
    S('Place the board', 'Put the small board between the two players. Stand the conflict pawn on the middle space and put the 4 military tokens face up on their spaces.', 'board', [
      C(board('board', 6.4, 1.8, 'g:plain:0:#d9c9a0:#c0392b:Military track', 'Game board', 'Holds the military track, the military tokens and the progress tokens. Each end of the track is one player\'s capital.')),
      On('board', 0.5, 0.72, pawns('pawn', 1, '#c0392b', 'Conflict pawn', 'One pawn. It starts in the middle and moves toward a player\'s capital each time the other player gains a shield.', { scale: 0.5 })),
      On('board', 0.26, 0.72, discs('milA', 2, 0.17, '#7a2a22', 'Military tokens', '4 tokens in all, two on each side. When the pawn enters a token\'s zone, the player on that side loses the coins shown.', { h: 0.05 })),
      On('board', 0.74, 0.72, discs('milB', 2, 0.17, '#7a2a22', 'Military tokens', '4 tokens in all, two on each side. When the pawn enters a token\'s zone, the player on that side loses the coins shown.', { h: 0.05 })),
    ]),
    S('Progress tokens', 'Shuffle the 10 progress tokens and place 5 of them face up on the board. Return the other 5 to the box.', 'board', [
      On('board', 0.5, 0.26, discs('progress', 5, 0.2, '#3d8b4a', 'Progress tokens', '5 of the 10 green tokens are in play. You claim one when you collect a pair of matching science symbols.', { h: 0.05, gap: 0.2, label: '✦' })),
    ]),
    S('Seven coins each', 'Each player takes 7 coins from the bank.', 'you', [
      R(pile('bank', ['#e0b12f', '#c0c0c0', '#b87333'], 'Bank', 'Coins worth 1, 3 and 6. Coins pay for cards and for resources you do not produce yourself.', 'disc')),
      P(cards('wonders', 4, ft('#efe2bd', 'WONDER', 'cost', '▲'), 'Your wonders', 'You end up with 4 wonder cards, chosen in the next step. Across both players only 7 of the 8 wonders can ever be built.', { w: 1.3, d: 0.9 })),
      P(discs('coins', 2, 0.24, ['#e0b12f', '#c0c0c0'], 'Your coins', 'You start with 7 coins, shown here as a 6 and a 1.', { h: 0.06, label: ['6', '1'], ink: '#2b241c' }), zone('city', 4.6, 1.2, 'Your city', 'Cards you build are laid here, grouped by color.')),
    ]),
    S('Choose wonders', 'Choose a first player. Shuffle the 12 wonders and reveal 4. The first player takes 1, the other player takes 2, and the first player takes the last. Reveal 4 more and repeat with the roles swapped.', 'wonders', [], 'Each player now has 4 wonders face up. The remaining 4 wonders go back in the box.'),
    S('Prepare the age decks', 'Remove 3 cards unseen from each of the three age decks. Then shuffle 3 random guild cards into the Age III deck.', 'r', [
      R(deck('age2', 20, f('#2e6fb7', 'II'), 'Age II deck', '20 cards after 3 are removed. Set it aside until Age I is over.'), deck('age3', 20, f('#7a4fa3', 'III'), 'Age III deck', '17 Age III cards plus 3 of the 7 guild cards, 20 in all. Set it aside until Age II is over.'), zone('discard', 1.1, 1.4, 'Discard', 'Cards discarded for coins go here face down. Either player may look through them at any time.')),
    ]),
    S('Lay out Age I', 'Shuffle the 20 Age I cards and lay them out in the pattern shown in the rulebook: rows of 2, 3, 4, 5 and 6 cards, alternating face-up and face-down rows.', 'c', [
      C(row(1, 2, false)), C(row(2, 3, true)), C(row(3, 4, false)), C(row(4, 5, true)), C(row(5, 6, false)),
    ], 'Each row half covers the row before it. Only the uncovered cards in the last row can be taken at first.'),
    S('Ready to play', 'The first player from the wonder selection begins Age I. Players then alternate turns until the structure is empty. Then lay out the next age; the player whose side the pawn is on chooses who begins it.', 'all', [], 'On your turn take one uncovered card and either build it, discard it for coins, or use it to build one of your wonders.'),
  ],
  turn: [
    T('Take a card and build it', 'You take an uncovered card from the open row, pay its cost if it has one, and place it in your city.', 'c', [mv('r5.0', at('city', 0.1, 0.5))]),
    T('Or discard it for coins', 'Your opponent takes a card and discards it instead: that pays 2 coins plus 1 for each yellow card in their city. A card that is no longer covered is turned face up.', 'c', [
      mv('r5.1', at('discard')),
      spawn(discs('gain', 1, 0.24, '#b87333', 'Coins gained', 'Two coins for discarding a card.', { h: 0.06, label: '2' }), by('coins@1', -0.9, 0), 'bank'),
      flip('r4.0'),
    ]),
    T('Shields move the pawn', 'You build a red military card. For each shield on it the conflict pawn moves one space toward your opponent\'s capital.', 'board', [mv('r5.2', at('city', 0.3, 0.5)), mv('pawn', at('board', 0.56, 0.72)), flip('r4.1')]),
    T('Build a wonder', 'Your opponent takes a card, pays the cost of one of their wonders, and tucks the card face down under it to show that it is built.', 'wonders@1', [mv('r5.3', at('wonders.1@1', 0.5, 0.5, 0.02)), flip('r5.3', false), flip('r4.2')]),
    T('Three ways to win', 'You win at once if the pawn reaches your opponent\'s capital, or if you collect 6 different science symbols. Otherwise play all three ages and the player with more victory points wins.', 'all'),
  ],
}))
