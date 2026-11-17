/** Splendor: three rows of development cards, nobles, and gem tokens scaled to the player count. */
import { C, P, S, T, at, by, cards, deck, discs, draw, f, ft, mv, set, spawn, tabletop, tiles, zone } from '../compose'

const GEM = ['#e9e4d8', '#2e6fb7', '#3d8b4a', '#c0392b', '#3a3a3a']
const NAME = ['Diamond', 'Sapphire', 'Emerald', 'Ruby', 'Onyx']
const dev = (lvl: number) => [0, 1, 2, 3].map((k) => ft('#fbf6ea', `${'I'.repeat(lvl)}`, 'cost', '◆'))
const gem = (i: number, n = 1) => discs(`take${i}`, n, 0.28, GEM[i], `${NAME[i]} token`, 'A gem you spend to buy development cards. Spent gems go back to the supply.', { h: 0.08 })

export const splendor = tabletop('splendor', 'Splendor', [2, 4], 3, '30 min', 'Easy', 'Collect gems, buy cards, attract nobles.', ['#1f3b57', '#e0b12f', '#c0392b'], (n) => {
  const count = n === 2 ? 4 : n === 3 ? 5 : 7
  return {
    setup: [
      S('Reveal the nobles', `Shuffle the noble tiles and reveal ${n + 1} of them (one more than the number of players). Return the rest to the box.`, 'nobles', [
        C(tiles('nobles', n + 1, 1.1, 1.1, ft('#efe2bd', '3', 'prestige', '♛'), 'Noble tiles', 'Each noble is worth 3 prestige points and visits the first player whose cards show the bonuses printed on it.')),
      ]),
      ...[3, 2, 1].map((lvl) =>
        S(`Level ${lvl} development cards`, `Shuffle the level ${lvl} deck, place it on the left, and turn 4 cards face up beside it.`, `row${lvl}`, [
          C(deck(`deck${lvl}`, [0, 36, 26, 16][lvl], f(['', '#3d8b4a', '#e0b12f', '#2e6fb7'][lvl], '•'.repeat(lvl)), `Level ${lvl} deck`, `${[0, 40, 30, 20][lvl]} cards. Higher levels cost more and are worth more prestige.`), cards(`row${lvl}`, 4, dev(lvl), `Level ${lvl} cards`, 'A development card shows its cost in gems, the permanent gem bonus it gives, and sometimes prestige points.')),
        ]),
      ),
      S('Set out the gem tokens', `With ${n} players use ${count} tokens of each of the five gem colors, plus all 5 gold jokers.`, 'gems', [
        C(discs('gems', 5, 0.34, GEM, 'Gem tokens', `Five colors, ${count} of each in a ${n}-player game (7 with four players, 5 with three, 4 with two).`, { h: 0.07 * count, gap: 0.3 }), discs('gold', 1, 0.34, '#e0b12f', 'Gold joker tokens', '5 gold tokens. You only get one by reserving a card, and it counts as any color.', { h: 0.35 })),
      ]),
      S('Leave room in front of you', 'Players start with nothing: no cards and no tokens. Keep a clear space in front of you for what you collect.', 'you', [P(zone('area', 4.6, 2.4, 'Your gems and cards', 'Keep your tokens and bought cards here in plain view. You may never hold more than 10 tokens at the end of your turn.'))]),
      S('Ready to play', 'The youngest player goes first, then play passes clockwise.', 'all', [], 'On your turn do one thing: take 3 different gems, take 2 of the same color, reserve a card, or buy a card.'),
    ],
    turn: [
      T('Take three different gems', 'You take one sapphire, one emerald and one ruby from the supply.', 'gems', [1, 2, 3].map((i, k) => spawn(gem(i), at('area', 0.15 + k * 0.16, 0.3), `gems.${i}`))),
      T('Next player takes two of a kind', 'The player on your left takes 2 onyx tokens instead. This is only allowed while at least 4 of that color are in the supply.', 'area@1', [spawn({ ...gem(4, 2), id: 'pair' }, at('area@1', 0.25, 0.3), 'gems.4')]),
      T('A player reserves a card', 'Or they could reserve: take a face-up level 2 card into their hand (3 at most) and gain a gold joker. The empty space is refilled from the deck.', 'row2', [
        mv('row2.1', at('area@1', 0.8, 0.5)),
        spawn({ ...gem(0), id: 'joker' }, at('area@1', 0.55, 0.3), 'gold'),
        draw('deck2', by('row2.0', 1.04, 0), dev(2)[0]),
      ]),
      T('Later: buy a card', 'Once you can afford it, pay a card’s gem cost to the supply and place it in front of you. Its bonus makes every later purchase cheaper.', 'row1', [mv('row1.2', at('area', 0.75, 0.5)), draw('deck1', by('row1.1', 1.04, 0), dev(1)[0], undefined, 1.2)]),
      T('Nobles and the finish', 'When your card bonuses match a noble, it comes to you for 3 points. Once someone reaches 15 prestige, finish the round; the highest total wins.', 'all'),
    ],
  }
})
