/** Agricola: action spaces that grow round by round, and a farmyard with a two-room wooden house for each player. */
import { C, L, On as On0, OnMe as OnMe0, P, R, S, T, at, board, cards, cubes, deck, discs, draw, f, ft, mat, mv, pile, spawn, tabletop, tiles, zone } from '../compose'
import type { Item, Place } from '../compose'
import { gridUV, slotUV } from '../layouts'

/** On() and OnMe() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })
const OnMe = (parent: string, u: number, v: number, item: Item): Place => ({ ...OnMe0(parent, u, v, item), spread: [0, 0] })

const SLOT = slotUV(6, 3)
const MAJ = gridUV(5, 2)
const ROUND = ft('#dfe8f0', 'ROUND', 'new action', '✦')
const GREEN = ft('#cfe3c0', 'ACTION', 'extra space', '≡')

export const agricola = tabletop('agricola', 'Agricola', [1, 5], 3, '30 min per player', 'Hard', 'Grow a farm and feed your family.', ['#3d8b4a', '#b98a5a', '#e0b12f'], (n) => {
  const extra = n < 3 ? 0 : n === 3 ? 4 : 6
  const other = n > 1 ? '@1' : ''
  return {
    setup: [
      S('Lay out the game boards', 'Put the game boards side by side in the middle of the table, and the major improvements board next to them.', 'c', [
        C(board('actions', 12, 7, 'g:slots:6x3:#d9c9a0:#7a8f5a:Action spaces', 'Game boards', 'Printed action spaces plus empty spaces for the 14 round cards. Each space can hold only one family member per round.')),
      ]),
      S('Major improvements', 'Lay the 10 major improvement cards face up on their board.', 'majors', [
        R(board('majors', 4.6, 3.2, 'g:grid:5x2:#e8d9b8:#b0563a:Major improvements', 'Major improvements board', 'Holds the 10 major improvements, such as fireplaces, ovens and the well. Anyone can buy them.')),
        ...Array.from({ length: 10 }, (_, i) => On('majors', ...MAJ(i % 5, Math.floor(i / 5)), cards(`maj${i}`, 1, ft('#f6d9c9', '', '', '⌂'), 'Major improvement', 'One of 10 shared improvements. Pay its cost with an improvement action to take it.', { w: 0.7, d: 1 }))),
      ]),
      S('Stack the round cards', 'Sort the 14 round cards by stage, shuffle each stage separately, and stack them face down with stage 1 on top.', 'rounds', [
        R(deck('rounds', 14, f('#3d6b8a', '✦'), 'Round card deck', '14 cards in 6 stages. One is turned over at the start of each round and adds a new action space.')),
        ...(extra ? Array.from({ length: extra }, (_, i) => On('actions', ...SLOT((i % 2) + Math.floor(i / 2) * 6), cards(`green${i}`, 1, GREEN, 'Action card', 'Extra action spaces used with 3 or more players. The set for 3 players is smaller than the sets for 4 and 5.'))) : []),
      ], n < 3 ? 'With 1 or 2 players no green action cards are added to the board.' : `Also place the green action cards marked for ${n} players on the spaces at the left of the board.`),
      S('Goods and animals', 'Sort the building resources, crops, food and animals into a general supply.', 'l', [
        L(pile('wood', '#8a5a34', 'Wood', 'Building resource for wooden rooms, fences and stables.'), pile('clay', '#b0563a', 'Clay', 'Building resource for clay rooms and ovens.'), pile('reed', '#e9e4d8', 'Reed', 'Needed for every room and renovation.')),
        L(pile('stone', '#3a3a3a', 'Stone', 'Building resource for stone houses and some improvements.'), pile('crops', ['#e0b12f', '#d9772b'], 'Grain and vegetables', 'Sow them in fields, harvest them, and turn them into food.', 'disc'), pile('animals', ['#e9e4d8', '#3a3a3a', '#8a5a34'], 'Sheep, wild boar and cattle', 'Animals need pastures or stables. They breed at each harvest.')),
        L(pile('foodbank', '#e0b12f', 'Food', 'Food markers. At each harvest every family member must be fed.', 'disc')),
      ]),
      S('Farmyards and families', 'Each player takes a farmyard, puts 2 wooden room tiles on the two house spaces at the left, and stands one family member in each room.', 'you', [
        P(mat('farm', 5, 3.2, '$', 'Farmyard', 'Farmyard', '15 spaces for rooms, fields, pastures and stables. Unused spaces cost you a point each at the end.')),
        On('farm', 0.1, 0.42, tiles('room1', 1, 0.8, 0.8, '#b98a5a', 'Wooden room', 'Your house starts with 2 wooden rooms. Each room holds one family member.')),
        On('farm', 0.1, 0.74, tiles('room2', 1, 0.8, 0.8, '#b98a5a', 'Wooden room', 'Your house starts with 2 wooden rooms. Each room holds one family member.')),
        On('room1', 0.5, 0.5, discs('fam1', 1, 0.2, '$', 'Family member', 'You start with 2 of your 5 family members. Each one takes one action per round.')),
        On('room2', 0.5, 0.5, discs('fam2', 1, 0.2, '$', 'Family member', 'You start with 2 of your 5 family members. Each one takes one action per round.')),
        P(
          pile('fences', '$', 'Fences', '15 fences per player, for enclosing pastures.'),
          cubes('stables', 4, '$', 'Stables', '4 stables per player.', { cols: 2, s: 0.28 }),
          discs('kids', 3, 0.17, '$', 'Future family members', 'The other 3 of your 5 family members wait here until your family grows.'),
          ...(n > 1 ? [discs('food', 1, 0.22, '#e0b12f', 'Your food', 'The starting player gets 2 food and every other player 3.', { label: 'F', h: 0.16, ink: '#2b241c' })] : []),
        ),
      ], n === 1 ? 'In the solo game you start with no food: check the rulebook for the other solo changes.' : 'The starting player takes 2 food and everyone else 3.'),
      S('Deal the hands', 'Deal each player 7 occupation cards and 7 minor improvement cards.', 'you', [
        P(
          deck('occ', 7, ft('#f3e7c5', 'OCC', 'occupation', '♛'), 'Occupations', 'Your 7 occupation cards, kept hidden. Playing one needs an occupation action.'),
          deck('minor', 7, ft('#f6d9c9', 'MINOR', 'improvement', '⌂'), 'Minor improvements', 'Your 7 minor improvement cards, kept hidden.'),
          zone('store', 2.6, 1.26, 'Your supply', 'Goods you have taken wait here until you use them.'),
        ),
      ], 'The family game, recommended for a first play, leaves these cards out altogether.'),
      S('Ready to play', 'Choose a starting player and give them the starting player marker. The game lasts 14 rounds.', 'all', [
        OnMe('farm', 0.92, 0.1, discs('first', 1, 0.2, '#e9e4d8', 'Starting player marker', 'Whoever holds this places the first family member each round. An action space lets you take it.', { label: '1', ink: '#2b241c' })),
      ], 'Each round: turn over a round card, restock the board, place family members one at a time, then bring them home.'),
    ],
    turn: [
      T('Reveal a round card', 'Turn the top round card face up onto the space for round 1. It is a new action that anyone can use from now on.', 'actions', [draw('rounds', at('actions', ...SLOT(3)), ROUND, 'r1')]),
      T('Restock', 'Every space with an arrow gets new goods. Goods nobody took last round stay and pile up.', 'actions', [
        spawn(cubes('w3', 3, '#8a5a34', 'Wood on a space', 'Wood that builds up here until someone takes all of it.', { s: 0.24, gap: 0.08 }), at('actions', ...SLOT(8)), 'wood'),
        spawn(cubes('c1', 1, '#b0563a', 'Clay on a space', 'Clay that builds up here until someone takes all of it.', { s: 0.24 }), at('actions', ...SLOT(9)), 'clay'),
      ]),
      T('Place a family member', 'You put one family member on the wood space and take everything on it into your supply.', 'actions', [
        ...[0, 1, 2].map((k) => mv(`w3.${k}`, at('store', 0.2 + k * 0.15, 0.5))),
        mv('fam1', at('actions', ...SLOT(8))),
      ]),
      T(n > 1 ? 'Next player' : 'Your second action', `${n > 1 ? 'The player on your left places one of theirs on a different space and takes the clay' : 'Then you place your other family member on a different space and take the clay'}. Carry on one at a time until everyone is placed.`, 'actions', [
        mv('c1', at(`store${other}`, 0.8, 0.5)),
        mv(n > 1 ? 'fam1@1' : 'fam2', at('actions', ...SLOT(9))),
      ]),
      T('Home again', 'Everyone takes their family members back to their rooms and the next round begins.', 'you', [
        mv('fam1', at('room1', 0.5, 0.5)),
        mv(n > 1 ? 'fam1@1' : 'fam2', n > 1 ? at('room1@1', 0.5, 0.5) : at('room2', 0.5, 0.5)),
      ]),
      T('Harvests and the end', 'After rounds 4, 7, 9, 11, 13 and 14 there is a harvest: reap your fields, feed your family, then animals breed. After round 14 score your farm: most points wins.', 'all'),
    ],
  }
})
