/** Ascension: a deckbuilder with a shared six-card centre row, runes to buy and power to fight. */
import { C, P, R, S, T, at, by, cards, deck, discs, draw, f, ft, mv, pile, spawn, tabletop, zone } from '../compose'

const APP = ft('#e6ecf2', 'Apprentice', '1 rune', '▲')
const MIL = ft('#f2e3e0', 'Militia', '1 power', '⚔')
const MYSTIC = ft('#e6ecf2', 'Mystic', '2 runes', '▲')
const HERO = ft('#e3f0e0', 'Hero', 'cost', '★')
const MON = ft('#3a3a3a', 'Monster', 'power', '⚔')
const BACK = f('#2f3f5a', '✦')

export const ascension = tabletop('ascension', 'Ascension: Deckbuilding Game', [2, 4], 2, '30 min', 'Medium', 'Build a deck, buy heroes, slay monsters.', ['#2f3f5a', '#e0b12f', '#c0392b'], (n) => ({
  setup: [
    S('Starting decks', 'Each player takes a starting deck of 10 cards: 8 Apprentices and 2 Militia. Shuffle it, place it face down and draw 5 cards.', 'you', [
      P(deck('mine', 5, BACK, 'Your deck', 'Your personal deck. Starts with 8 Apprentices and 2 Militia; everything you acquire is shuffled in later.'), cards('hand', 5, [APP, APP, APP, MIL, MIL], 'Your hand', 'You draw 5 cards each turn. Apprentices give 1 rune each for buying; Militia give 1 power each for fighting.')),
    ]),
    S('Always-available cards', 'Put the stacks of Mystic and Heavy Infantry cards and the single Cultist card face up where everyone can reach them.', 'c', [
      C(deck('mystic', 14, MYSTIC, 'Mystic stack', 'Always available to acquire for runes. A Mystic is a better Apprentice.'), deck('heavy', 14, ft('#f2e3e0', 'Heavy Inf.', '2 power', '⚔'), 'Heavy Infantry stack', 'Always available to acquire for runes. Heavy Infantry is a better Militia.'), cards('cultist', 1, ft('#3a3a3a', 'Cultist', 'monster', '⚔'), 'Cultist', 'A monster that never leaves. Defeat it as often as you like for a little honor each time.'), zone('void', 1.1, 1.4, 'Void', 'Defeated monsters and banished cards go here, out of the game.')),
    ]),
    S('Centre deck and centre row', 'Shuffle all the remaining cards into the centre deck and deal 6 of them face up in a row.', 'c', [
      C(deck('centre', 40, BACK, 'Centre deck', 'The 100 heroes, constructs and monsters that feed the centre row.'), cards('row', 6, [HERO, MON, HERO, HERO, MON, HERO], 'Centre row', 'Always 6 cards. Acquire heroes and constructs with runes, defeat monsters with power. A card that leaves is replaced at once.')),
    ]),
    S('Honor pool', `Count out 30 honor per player into the pool: ${30 * n} honor for ${n} players.`, 'r', [
      R(pile('honor', ['#e9e4d8', '#c0392b'], 'Honor pool', `${30 * n} honor in this game, in small clear crystals worth 1 and large red ones worth 5. When the pool runs out the game is nearly over.`)),
    ]),
    S('Leave room to play', 'Leave space in front of you for the cards you play and for your discard pile.', 'you', [
      P(zone('play', 4.6, 1.4, 'Cards played', 'Cards you play this turn stay here until the turn ends. Constructs stay in play permanently.'), zone('discard', 1.2, 1.4, 'Discard', 'Played and newly acquired cards end up here. When your deck runs out, shuffle this pile to make a new one.')),
    ]),
    S('Ready to play', 'Choose a first player at random; play passes clockwise.', 'all', [], 'On your turn play any cards from your hand, spend runes to acquire cards and power to defeat monsters in any order, then discard everything and draw 5 new cards.'),
  ],
  turn: [
    T('Play your hand', 'You play all 5 cards: three Apprentices give 3 runes and two Militia give 2 power.', 'you', [0, 1, 2, 3, 4].map((k) => mv(`hand.${k}`, at('play', 0.12 + k * 0.19, 0.5), 0.2 + k * 0.2))),
    T('Acquire a card', 'You spend your 3 runes on a Mystic. Acquired cards go straight to your discard pile, not your hand.', 'c', [draw('mystic', at('discard', 0.5, 0.5), MYSTIC)]),
    T('Defeat a monster', 'You spend your 2 power to defeat the Cultist and take honor from the pool as your reward. Monsters in the centre row need more power but give more.', 'you', [
      spawn(discs('won', 1, 0.2, '#e9e4d8', 'Honor crystal', 'Honor is victory points. Keep what you earn in front of you.'), by('mine', -0.95, 0), 'honor'),
    ]),
    T('Clean up', 'Put all the cards you played into your discard pile and draw a fresh hand of 5 from your deck.', 'you', [
      ...[0, 1, 2, 3, 4].map((k) => mv(`hand.${k}`, at('discard', 0.5, 0.5, 0.03 + k * 0.016), 0.2 + k * 0.1)),
      ...[0, 1, 2, 3, 4].map((k) => draw('mine', at('hand', (0.45 + k * 1.04) / 5.06, 0.5, 0.02), [APP, APP, APP, APP, APP][k], undefined, 1.2 + k * 0.2)),
    ]),
    T('The finish', 'When the last honor leaves the pool, finish the round so everyone has had the same number of turns. Add your honor crystals to the honor printed on the cards in your deck; the highest total wins.', 'all'),
  ],
}))
