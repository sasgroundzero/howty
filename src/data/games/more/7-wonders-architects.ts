/** 7 Wonders: Architects. Take one card a turn from a neighbouring deck and build your wonder in five stages. */
import { C, On, type Place, P, S, T, at, deck, discs, draw, f, ft, hide, mat, pawns, set, spawn, tabletop, tiles, zone } from '../compose'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const WOOD = ft('#e6d3ad', 'Wood', 'resource', '▲')
const STONE = ft('#d8d8d8', 'Stone', 'resource', '◆')
const SHIELD = ft('#f2d6d0', 'Shield', 'military', '⚔')
const BACK = f('#6a5a8a', '✦')

export const sevenWondersArchitects = tabletop('7-wonders-architects', '7 Wonders: Architects', [2, 7], 4, '25 min', 'Easy', 'Draft one card a turn to raise your wonder.', ['#6a5a8a', '#e0b12f', '#c0392b'], (n) => {
  const fights = n <= 3 ? 3 : n <= 5 ? 4 : 6
  return {
    setup: [
      S('Take a wonder', 'Each player takes one wonder tray, at random or by choice, with its 5 wonder pieces and its own deck of cards.', 'you', [
        P(deck('mine', 25, WOOD, 'Your deck', 'Each wonder comes with its own deck. Shuffle it and place it face up on your left, between you and your left-hand neighbour.'), mat('wonder', 3.7, 1.5, '$', 'Wonder', 'Your wonder', 'Built in 5 stages from the bottom up. Each finished stage is worth points and some trigger a special effect.')),
      ]),
      S('Lay out the wonder pieces', 'Put your 5 wonder pieces in front of you with the under-construction side face up, arranged in the shape of the wonder.', 'you', [
        on('wonder', 0.5, 0.5, tiles('stage', 5, 0.6, 0.9, ft('#e9dfc8', '', '', '?'), 'Wonder stages', '5 pieces. Each shows how many resources it needs and whether they must be identical or all different. Flip a piece when you build it.', { gap: 0.1, h: 0.05 })),
      ]),
      S('Central deck', 'Shuffle the central deck, the cards with the plain back, and put it face down in the middle of the table.', 'c', [
        C(deck('central', 40, BACK, 'Central deck', 'A face-down deck anyone may draw from blind instead of taking a visible card from a neighbouring deck.'), discs('progress', 1, 0.34, '#3d8b4a', 'Progress token stack', 'Shuffled face down. A token is earned with science symbols and gives a lasting bonus.', { h: 0.3 }), discs('shown', 3, 0.34, '#7fbf7a', 'Face-up progress tokens', '3 progress tokens are always on show. When you earn one, take one of these or the top of the stack.', { label: '✦', ink: '#2b241c' })),
      ]),
      S('Conflict tokens', `Set out the conflict tokens with the peace side up: ${fights} of them with ${n} players, as far as I recall (3 with 2 or 3 players, 4 with 4 or 5, 6 with 6 or 7). Check the rulebook.`, 'c', [
        C(discs('conflict', fights, 0.3, '#e9e4d8', 'Conflict tokens', 'Shield cards showing horns flip these to the battle side. When all are flipped, every player battles both neighbours.', { label: '☼', ink: '#2b241c' }), discs('victory', 1, 0.3, '#c0392b', 'Military victory tokens', 'Each battle won against a neighbour earns one of these, worth 3 points.', { h: 0.3, label: '3' }), pawns('cat', 1, '#3a3a3a', 'Cat pawn', 'Taken with certain blue cards. Whoever holds the cat may peek at the top card of the central deck before choosing, and it is worth points at the end.', { scale: 0.5 })),
      ]),
      S('Leave room for your cards', 'Keep a space in front of your wonder for the cards you take. They stay face up, sorted by kind.', 'you', [
        P(zone('built', 5, 1.4, 'Your cards', 'Resources and gold wait here until spent on a stage. Science, shields and blue point cards stay until used or scored.')),
      ]),
      S('Ready to play', 'Choose a first player; turns go clockwise.', 'all', [], 'On your turn take exactly one card: the top of the deck on your left, the top of the deck on your right, or the top of the central deck. Then use it at once if you can.'),
    ],
    turn: [
      T('Take a card', 'You take the visible top card of the deck on your left, a wood, and put it face up in front of you.', 'you', [draw('mine', at('built', 0.12, 0.5), WOOD, 'c1')]),
      T('Next player draws blind', 'The player on your left takes the unknown top card of the central deck instead. It is a shield with a horn, so one conflict token flips to its battle side.', 'c', [
        draw('central', at('built@1', 0.12, 0.5), SHIELD),
        set('conflict.0', { color: '#c0392b', label: '⚔', ink: '#ffffff' }),
      ]),
      T('Build a wonder stage', 'On a later turn you take a stone. Suppose your first stage needs 2 different resources: you discard the wood and the stone and flip that piece to its built side.', 'you', [
        draw('mine', at('built', 0.32, 0.5), STONE, 'c2'),
        hide('c1', 1.4), hide('c2', 1.4),
        set('stage.0', { top: ft('#e0b12f', '', '', '★') }),
      ], 8),
      T('Battles and progress', 'When every conflict token shows battle, compare shields with each neighbour and take a victory token for each one you beat. Two matching science symbols, or three different ones, earn a progress token.', 'c', [
        spawn(discs('won', 1, 0.3, '#c0392b', 'Military victory token', 'Worth 3 points at the end.', { label: '3' }), at('built@1', 0.5, 0.5), 'victory', undefined, 0.6),
        set('conflict.0', { color: '#e9e4d8', label: '☼', ink: '#2b241c' }),
      ]),
      T('The finish', 'The game ends the moment one player completes all 5 stages of their wonder. Add up points from wonder stages, blue cards, military victories, progress tokens and the cat; the highest total wins.', 'all'),
    ],
  }
})
