/** Jaipur: two traders take goods from a five-card market and sell sets for shrinking token values. */
import { C, P, R, S, T, at, by, cards, deck, discs, draw, f, ft, hide, mv, spawn, tabletop, zone } from '../compose'

const GOOD = ['#c0392b', '#e0b12f', '#9aa3ad', '#7a4fa3', '#3d8b4a', '#8a5a3a']
const NAME = ['Diamonds', 'Gold', 'Silver', 'Cloth', 'Spice', 'Leather']
const good = (i: number) => f(GOOD[i], '◆')
const CAMEL = ft('#f0dfb8', 'CAMEL', '', '▲')

export const jaipur = tabletop('jaipur', 'Jaipur', [2, 2], 2, '30 min', 'Easy', 'A quick trading duel for two merchants.', ['#d9772b', '#7a4fa3', '#e0b12f'], () => ({
  setup: [
    S('Start the market with camels', 'Take 3 camel cards out of the deck and lay them face up between the players.', 'c', [
      C(cards('market', 5, [CAMEL, CAMEL, CAMEL, good(5), good(3)], 'Market', 'Always 5 cards. It starts with 3 camels plus 2 cards from the deck.'), zone('discard', 1.1, 1.4, 'Discard', 'Sold goods are discarded here.')),
    ], 'The last two market cards are added after the hands are dealt.'),
    S('Deal five cards each', 'Shuffle the rest of the cards and deal 5 to each player. Put the deck beside the market, then turn its top 2 cards face up to complete the market.', 'all', [
      R(deck('pack', 40, f('#b5541f', '◆'), 'Deck', '55 cards in total: 6 diamonds, 6 gold, 6 silver, 8 cloth, 8 spice, 10 leather and 11 camels.')),
      P(cards('hand', 4, [good(5), good(5), good(5), good(4)], 'Your hand', 'Goods cards, hidden from your opponent. You may never end a turn with more than 7.'), cards('herd', 1, CAMEL, 'Your herd', 'Any camels you are dealt come out of your hand and lie face up in front of you. In this example one of your 5 cards was a camel.')),
    ]),
    S('Sort the goods tokens', 'Sort the goods tokens by type and stack each type with the most valuable token on top.', 'tok', [
      C(discs('tok', 6, 0.3, GOOD, 'Goods tokens', 'One stack each for diamonds, gold, silver, cloth, spice and leather. Each card sold takes the top token, so selling early pays best.', { h: 0.3, gap: 0.3 })),
    ]),
    S('Bonus tokens, camel token and seals', 'Shuffle the three kinds of bonus token into separate piles. Put the camel token and the 3 Seals of Excellence nearby.', 'r', [
      R(discs('bonus', 3, 0.3, '#e9e4d8', 'Bonus tokens', 'Three piles, for sales of 3, 4, and 5 or more cards. Bigger sales earn bigger hidden bonuses.', { h: 0.25, label: ['3', '4', '5'], ink: '#2b241c', gap: 0.3 })),
      R(discs('camel', 1, 0.3, '#f0dfb8', 'Camel token', 'Worth 5 rupees to whoever has the bigger herd at the end of the round.', { label: '▲', ink: '#2b241c' }), discs('seals', 3, 0.26, '#d8b24a', 'Seals of Excellence', 'The richer trader wins a seal each round. Two seals win the game.', { label: '★', ink: '#2b241c' })),
    ]),
    S('Room for your earnings', 'Leave space in front of you for the tokens you earn; you may keep them face down.', 'you', [
      P(zone('earned', 3.4, 1, 'Your tokens', 'Tokens earned from sales. Their rupee values are added up at the end of the round.')),
    ]),
    S('Ready to play', 'Decide who goes first; the players alternate. On your turn you either take cards or sell cards, never both.', 'all', [], 'Taking means one good, or swapping several cards, or all the camels. Selling means discarding any number of one type of good.'),
  ],
  turn: [
    T('Take one good', 'You take a single goods card from the market into your hand. The gap is refilled from the deck.', 'c', [
      mv('market.3', at('hand.3', 1.15, 0.5, 0.02)),
      draw('pack', by('market.2', 1.04, 0), good(1)),
    ]),
    T('Opponent takes the camels', 'Your opponent takes every camel in the market into their herd, and the market is refilled from the deck. Camels do not count toward the hand limit.', 'c', [
      ...[0, 1, 2].map((k) => mv(`market.${k}`, by('herd@1', 1.04 * (k + 1), 0), 0.2 + k * 0.2)),
      ...[0, 1, 2].map((k) => draw('pack', by('market.4', -1.04 * (4 - k), 0), good([2, 4, 0][k]), undefined, 1.2 + k * 0.3)),
    ], 8),
    T('Sell goods', `You sell 3 ${NAME[5].toLowerCase()}: discard the cards, take the top 3 leather tokens, and add a bonus token from the pile for sales of 3.`, 'tok', [
      ...[0, 1, 2].map((k) => mv(`hand.${k}`, at('discard', 0.5, 0.5, 0.01 + k * 0.016), 0.2 + k * 0.15)),
      spawn(discs('got', 3, 0.3, GOOD[5], 'Leather tokens', 'Tokens earned by selling leather.', { h: 0.08 }), at('earned', 0.35, 0.5), 'tok.5', undefined, 1.2),
      spawn(discs('extra', 1, 0.3, '#e9e4d8', 'Bonus token', 'A bonus for selling 3 cards at once.', { h: 0.08, label: '3', ink: '#2b241c' }), at('earned', 0.85, 0.5), 'bonus.0', undefined, 1.8),
    ]),
    T('Round end and the finish', 'A round ends when 3 stacks of goods tokens are empty or the deck runs out. The bigger herd takes the camel token, and the richer trader takes a Seal of Excellence. The first to win 2 seals wins the game.', 'all', [
      mv('seals.0', by('herd', 1.1, 0)),
    ]),
  ],
}))
