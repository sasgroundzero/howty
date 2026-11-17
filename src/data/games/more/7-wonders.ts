/** 7 Wonders: a wonder board and three coins each, and a hand of seven cards that is passed round. */
import { C, On, P, S, T, at, cards, deck, discs, f, ft, mat, mv, pile, set, spawn, tabletop, tiles, zone } from '../compose'

const KIND: [string, string, string][] = [['#a9744a', 'Raw', '▲'], ['#9aa3ab', 'Goods', '◆'], ['#3f78c2', 'Civic', '★'], ['#e0b12f', 'Trade', '●'], ['#c0392b', 'Military', '⚔'], ['#3d8b4a', 'Science', '✦'], ['#a9744a', 'Raw', '▲']]
const HAND = KIND.map(([c, t, g]) => ft(c, t, 'Age I', g))

export const sevenWonders = tabletop('7-wonders', '7 Wonders', [3, 7], 4, '30 min', 'Medium', 'Draft cards to build a city and a wonder.', ['#a9744a', '#3f78c2', '#e0b12f'], (n) => ({
  setup: [
    S('Deal the wonder boards', 'Give each player one wonder board at random. Each player picks a side; the Day side (side A in the first edition) is simpler for a first game.', 'you', [
      P(zone('city', 6.4, 1.5, 'Your city', 'Cards you build are placed here face up, grouped by color so your neighbours can see them.')),
      P(mat('wonder', 4.6, 1.6, '$', 'Wonder', 'Wonder board', 'Shows the resource your city produces from the start and the stages of your wonder, which you build one at a time from left to right.')),
    ]),
    S('Take three coins', 'Each player takes 3 coins of value 1 and puts them on their board. The other coins form the bank.', 'you', [
      On('wonder', 0.9, 0.35, discs('coin', 1, 0.26, '#e0b12f', 'Your coins', 'You start with 3 coins. Coins pay for some cards and for resources bought from your two neighbours.', { label: '3', h: 0.12 })),
      C(pile('bank', ['#e0b12f', '#c9c9c9'], 'Bank', 'Coins of value 1 and 3.', 'disc'), tiles('conflict', 3, 0.7, 0.7, [ft('#c0392b', '', '', '1'), ft('#c0392b', '', '', '3'), ft('#c0392b', '', '', '5')], 'Conflict tokens', 'Victory tokens worth 1, 3 and 5 points for Ages I, II and III. Defeat tokens are worth minus 1.', { h: 0.2 })),
    ]),
    S('Sort the three Age decks', `For each Age, keep only the cards marked for ${n} or fewer players. That leaves exactly 7 cards per player in Ages I and II.`, 'age2', [
      C(deck('age2', 7 * n, f('#3f78c2', 'II'), 'Age II deck', `${7 * n} cards in a ${n}-player game: 7 per player. Set aside until Age I is over.`), deck('age3', 7 * n, f('#7a4fa3', 'III'), 'Age III deck', `${7 * n} cards in a ${n}-player game, including the guilds.`), zone('discard', 1.1, 1.4, 'Discard', 'Cards discarded for coins and the last card of each hand go here face down.')),
    ]),
    S('Add guilds to Age III', `Shuffle the purple guild cards and add ${n + 2} of them, unseen, to the Age III deck. That is the number of players plus 2. Then shuffle that deck.`, 'age3', [], 'The other guilds go back in the box without being looked at.'),
    S('Deal Age I', 'Shuffle the Age I deck and deal all of it out: 7 cards to each player.', 'you', [
      P(cards('hand', 7, HAND, 'Your hand', '7 cards. You keep one each turn and pass the rest on, so look at what your neighbours need too.', { gap: 0.02 })),
    ]),
    S('Ready to play', 'There is no first player: everyone plays at the same time.', 'all', [], 'Each turn everyone picks one card in secret, all reveal and play them together, and then every hand is passed to the next player.'),
  ],
  turn: [
    T('Choose and build a card', 'Everyone picks 1 card from their hand and puts it face down. All are revealed together. You build yours by paying its cost, and it joins your city.', 'you', [
      mv('hand.2', at('city', 0.1, 0.5)),
    ]),
    T('Or build a wonder stage', 'Your left neighbour instead tucks their card face down under their wonder board to build its first stage, paying the cost printed on the board.', 'wonder@1', [
      mv('hand.0@1', at('wonder@1', 0.2, 0.85)),
    ]),
    T('Or discard for coins', 'The third choice is to discard the chosen card face down and take 3 coins from the bank. Another player does that here.', 'discard', [
      mv('hand.1@2', at('discard', 0.5, 0.5)),
      set('coin@2', { label: '6' }),
    ]),
    T('Pass your hand', 'Everyone passes the rest of their hand to the player on their left in Age I. Hands go to the right in Age II and to the left again in Age III. Repeat until 6 cards have been played; the 7th is discarded.', 'all'),
    T('Settle conflicts', 'At the end of each Age compare your military shields with each neighbour. The stronger side takes a victory token (1, 3 or 5 points by Age) and the weaker takes a minus 1 token; on a tie, neither takes one. Here you beat one neighbour.', 'you', [
      spawn(tiles('won', 1, 0.5, 0.5, ft('#c0392b', '', '', '1'), 'Victory token', 'Worth 1 point, won at the end of Age I.', { h: 0.08 }), at('wonder', 0.1, 0.35), 'conflict.0'),
    ]),
    T('End of the game', 'After the conflicts of Age III everyone adds up points from military, coins, wonder stages, and their civic, trade, science and guild cards. The highest total wins.', 'all'),
  ],
}))
