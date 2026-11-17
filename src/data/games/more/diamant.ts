/** Diamant: turn over cave cards and decide, all at once, whether to go deeper or run for camp. */
import { C, P, R, S, T, at, box, cards, deck, discs, draw, f, flip, ft, hide, pile, spawn, tabletop, tiles, zone } from '../compose'

const gem = (id: string, label: string) => discs(id, 1, 0.2, '#c0392b', 'Rubies', 'Gems shared out from a treasure card. They are only safe once you carry them back to camp.', { label, h: 0.1 })

export const diamant = tabletop('diamant', 'Diamant', [3, 8], 5, '30 min', 'Easy', 'Push your luck in a cave full of gems.', ['#5a4634', '#c0392b', '#e0b12f'], (n) => {
  const share = Math.floor(11 / n)
  const left = 11 - share * n
  return {
    setup: [
      S('Lay out the five caves', 'Place the 5 cave tiles in a row. Each one is an expedition, and the game lasts five expeditions.', 'c', [
        C(tiles('caves', 5, 1.1, 1.1, [1, 2, 3, 4, 5].map((v) => ft('#b7a27a', `${v}`, '', '▲')), 'Cave tiles', '5 tiles, one per expedition. Flip or remove one at the end of each round to count them down.')),
      ]),
      S('Shuffle the expedition deck', 'Shuffle the treasure and hazard cards together into one deck. Keep the 5 relic cards in a separate pile.', 'r', [
        R(
          deck('exp', 30, f('#5a4634', '?'), 'Expedition deck', '15 treasure cards with different gem values and 15 hazard cards: 5 kinds of danger with 3 cards each.'),
          deck('relics', 5, f('#e0b12f', '★', '#2b241c'), 'Relic cards', '5 relics. One is shuffled into the deck at the start of each expedition. Their gem value is printed in the rulebook.'),
        ),
      ], 'Before each expedition, shuffle one relic into the deck.'),
      S('Set out the gems', 'Put the rubies and diamonds in a supply everyone can reach.', 'r', [
        R(pile('rubies', '#c0392b', 'Rubies', 'Worth 1 each.'), pile('diamonds', '#e9e4d8', 'Diamonds', 'Worth 5 rubies each. Used for making change.')),
      ]),
      S('Chests and decision cards', 'Each player takes a chest and the two decision cards of their explorer: one to continue and one to leave.', 'you', [
        P(
          box('chest', 0.9, 0.6, 0.7, '$', 'Chest', 'One per player. Gems inside are safe and stay hidden until the end of the game.'),
          cards('choice', 2, [ft('#eef1e6', 'GO ON', '', '▲'), ft('#eef1e6', 'LEAVE', '', '⌂')], 'Decision cards', 'Each round you secretly pick one: carry on into the cave or head back to camp.'),
          zone('loot', 1.6, 1.3, 'Gems in hand', 'Gems you have collected this expedition. They are lost if a second matching hazard appears while you are still inside.'),
        ),
      ], n === 8 ? 'This is the maximum of 8 explorers.' : undefined),
      S('Leave room for the path', 'Keep a clear line on the table: cards are turned over here one after another to form the path into the cave.', 'path', [
        C(zone('path', 7, 1.5, 'Cave path', 'Revealed expedition cards are laid here in a row during an expedition.')),
      ]),
      S('Ready to play', 'There is no turn order. Someone flips the top card of the deck and everybody reacts to it together.', 'all', [], 'After each card, all explorers still in the cave choose in secret to continue or to leave.'),
    ],
    turn: [
      T('Reveal a treasure', `The first card shows 11 gems. They are split evenly among the ${n} explorers in the cave: ${share} each, and the ${left} left over stay on the card.`, 'path', [
        draw('exp', at('path', 0.1, 0.5), ft('#f3e7c5', '11', 'rubies', '◆'), 'card0'),
        ...(share ? [0, 1, 2].map((s) => spawn(gem(`g${s}`, `${share}`), at(`loot@${s}`, 0.3, 0.5), 'rubies', undefined, 1 + s * 0.2)) : []),
        ...(left ? [spawn(gem('rest', `${left}`), at('path', 0.1, 0.5, 0.02), 'rubies', undefined, 1.8)] : []),
      ], 8),
      T('Stay or leave?', 'Everyone picks a decision card and reveals at the same time. You carry on; the player on your left decides to leave.', 'you', [flip('choice.1', false), flip('choice.0@1', false)]),
      T('Leaving explorers bank their gems', 'Whoever leaves shares the gems left on the path with the others leaving at the same time, then puts everything into their chest. A player who leaves alone also takes any relics on the path.', 'path', [
        ...(left ? [hide('rest')] : []),
        ...(share ? [hide('g1', 0.9)] : []),
      ]),
      T('A hazard appears', 'The next card is a hazard. The first of each kind is only a warning. If a second card of the same kind turns up, everyone still in the cave drops their unbanked gems and the expedition ends.', 'path', [draw('exp', at('path', 0.26, 0.5), ft('#e6d6d0', 'HAZARD', 'snakes', '⚔'))]),
      T('Five expeditions, then count', 'An expedition also ends when everyone has left. After the fifth one, open the chests: the player with the most gem value wins.', 'all'),
    ],
  }
})
