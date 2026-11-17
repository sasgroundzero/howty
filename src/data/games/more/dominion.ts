/** Dominion: treasure, victory and curse piles, ten kingdom piles, and a ten-card starting deck each. */
import { C, P, S, T, at, cards, deck, draw, f, ft, hide, mv, tabletop, zone } from '../compose'

const COPPER = ft('#e2b98a', 'Copper', '1 coin', '●')
const SILVER = ft('#d9dde2', 'Silver', '2 coins', '●')
const GOLD = ft('#f0d778', 'Gold', '3 coins', '●')
const ESTATE = ft('#bfe0b0', 'Estate', '1 point', '⌂')
const KING = ft('#f6f1e4', 'Action', 'kingdom', '✦')
const BACK = f('#2f4a6b', '≡')

export const dominion = tabletop('dominion', 'Dominion', [2, 4], 3, '30 min', 'Medium', 'Build a deck of treasure, actions and estates.', ['#2f4a6b', '#f0d778', '#bfe0b0'], (n) => {
  const vp = n === 2 ? 8 : 12
  const hx = (k: number) => (0.45 + k * 1.04) / 5.06
  return {
    setup: [
      S('Set out the treasure cards', 'Put the Copper, Silver and Gold cards in three face-up piles in the middle of the table.', 'copper', [
        C(
          deck('copper', 60 - 7 * n, COPPER, 'Copper pile', `Copper costs 0 and is worth 1 coin. 60 in the box, less the 7 that each of the ${n} players takes for a starting deck.`),
          deck('silver', 40, SILVER, 'Silver pile', '40 Silver cards. Silver costs 3 and is worth 2 coins.'),
          deck('gold', 30, GOLD, 'Gold pile', '30 Gold cards. Gold costs 6 and is worth 3 coins.'),
        ),
      ]),
      S('Set out the victory cards', `With ${n} players use ${vp} each of Estate, Duchy and Province (8 with two players, 12 with three or four).`, 'duchy', [
        C(
          deck('estate', vp, ESTATE, 'Estate pile', `${vp} Estates in a ${n}-player game, not counting the 3 in each starting deck. Each costs 2 and is worth 1 point at the end.`),
          deck('duchy', vp, ft('#bfe0b0', 'Duchy', '3 points', '⌂'), 'Duchy pile', `${vp} Duchies in a ${n}-player game. Each costs 5 and is worth 3 points.`),
          deck('province', vp, ft('#bfe0b0', 'Province', '6 points', '⌂'), 'Province pile', `${vp} Provinces in a ${n}-player game. Each costs 8 and is worth 6 points. When this pile runs out the game ends.`),
        ),
      ]),
      S('Curses and trash', `Use ${10 * (n - 1)} Curse cards, and leave a space for the trash.`, 'curse', [
        C(
          deck('curse', 10 * (n - 1), ft('#cdb7e0', 'Curse', 'minus 1', '✖'), 'Curse pile', `${10 * (n - 1)} Curses in a ${n}-player game (10 for each player beyond the first). Each is worth minus 1 point.`),
          zone('trash', 1.1, 1.4, 'Trash', 'Cards that are trashed leave the game and go here, face up.'),
        ),
      ]),
      S('Choose ten kingdom cards', 'Pick 10 different kingdom cards, by choice or at random, and put out the pile for each one.', 'kingdom', [
        C(deck('kingdom', 10, KING, 'Kingdom pile', 'Each kingdom pile has 10 copies of one card. Kingdom cards that are victory cards use the same count as the other victory piles.', { n: 10, cols: 5 })),
      ], 'The rulebook suggests a set of ten for a first game.'),
      S('Build your starting deck', 'Each player takes 7 Coppers and 3 Estates, shuffles them and puts them face down as a deck. Leave room for a play area and a discard pile.', 'you', [
        P(zone('play', 4.2, 1.4, 'Play area', 'Cards you play this turn sit here until the Clean-up phase.'), zone('discard', 1.1, 1.4, 'Discard', 'Your own discard pile, face up. Cards you buy go here first, not into your hand.')),
        P(deck('drawpile', 5, BACK, 'Your deck', 'Your starting deck is 10 cards: 7 Coppers and 3 Estates. When it runs out, shuffle your discard pile to make a new deck.')),
      ]),
      S('Draw five cards', 'Everyone draws the top 5 cards of their own deck as a starting hand.', 'you', [
        P(cards('hand', 5, [COPPER, COPPER, COPPER, COPPER, ESTATE], 'Your hand', '5 cards. Your first hand is some mix of Coppers and Estates; this one has 4 Coppers and 1 Estate.')),
      ]),
      S('Ready to play', 'Pick a starting player at random, then play passes clockwise.', 'all', [], 'Every turn has three phases in order: Action (play one Action card), Buy (buy one card), Clean-up (discard everything and draw 5).'),
    ],
    turn: [
      T('Action phase', 'You may play one Action card from your hand. Your first hand has none, so you go straight on to the Buy phase.', 'hand'),
      T('Buy phase: play treasure', 'You lay your 4 Coppers in your play area. Together they give you 4 coins to spend.', 'play', [0, 1, 2, 3].map((k) => mv(`hand.${k}`, at('play', 0.14 + k * 0.24, 0.5)))),
      T('Buy one card', 'You may buy one card costing up to 4. You choose a kingdom card, and it goes to your discard pile.', 'kingdom', [
        draw('kingdom.1', at('discard', 0.5, 0.5), KING, 'bought'),
      ]),
      T('Clean-up', 'You put everything you played and the rest of your hand on your discard pile, then draw 5 new cards. Your deck is now empty, so next time you will shuffle your discards.', 'you', [
        ...[0, 1, 2, 3, 4].map((k) => mv(`hand.${k}`, at('discard', 0.5, 0.5, 0.02 * (k + 1)), 0.2 + k * 0.15)),
        ...[0, 1, 2, 3, 4].map((k) => draw('drawpile', at('hand', hx(k), 0.5), k < 2 ? ESTATE : COPPER, undefined, 1.4 + k * 0.2)),
        hide('drawpile', 2.4),
      ], 9),
      T('Next player', 'The player on your left plays 3 Coppers and buys a Silver, which goes to their discard pile.', 'play@1', [
        ...[0, 1, 2].map((k) => mv(`hand.${k}@1`, at('play@1', 0.14 + k * 0.24, 0.5))),
        draw('silver', at('discard@1', 0.5, 0.5), SILVER, undefined, 2),
      ]),
      T('End of the game', 'The game ends at the end of a turn in which the Province pile is emptied or any three supply piles are empty. Everyone counts the victory points in their whole deck, and the most points wins.', 'all'),
    ],
  }
})
