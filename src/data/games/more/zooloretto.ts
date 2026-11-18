/** Zooloretto: delivery trucks fill with animal tiles, and each player fits them into a small zoo. */
import { C, L, On as On0, P, R, S, T, at, by, deck, discs, draw, f, ft, mat, mv, pile, tabletop, tiles } from '../compose'
import type { Item, Place } from '../compose'

/** On() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })

const BACK = f('#3d6b4a', '?')
const ANIMAL = (c: string, g: string) => ft(c, '', '', g)
const TILE = { w: 0.7, d: 0.7 }

export const zooloretto = tabletop('zooloretto', 'Zooloretto', [2, 5], 4, '45 min', 'Easy', 'Fill trucks with animals for your zoo.', ['#3d8b4a', '#e0b12f', '#c96b3a'], (n) => {
  const trucks = n === 2 ? 3 : n
  const types = n + 3
  return {
    setup: [
      S('Zoo boards', 'Each player takes a zoo board and an expansion board. Keep the expansion board to one side until you pay to add it.', 'you', [
        P(mat('zoo', 4.8, 3.4, '$', 'Zoo', 'Zoo board', 'Three enclosures of different sizes, spaces for vending stalls and a barn. An enclosure holds only one type of animal; anything you cannot place goes in the barn.')),
      ]),
      S('Two coins each', 'Give each player 2 coins and put the rest in the bank.', 'you', [
        P(discs('coins', 2, 0.22, '#e0b12f', 'Your coins', 'Each player starts with 2 coins. Money actions cost 1, 2 or 3 coins.', { h: 0.08 })),
        L(pile('bank', '#e0b12f', 'Bank', 'The remaining coins. Filling the last space of an enclosure pays the coin bonus shown on it from here.', 'disc')),
      ]),
      S('Delivery trucks', `Place ${trucks} delivery trucks in the middle of the table${n === 2 ? '. With two players, put 1 hay bale in one truck and 2 in another to block those spaces for the whole game, and give each player a second expansion board' : ', one per player'}.`, 'truck', [
        C(tiles('truck', trucks, 0.9, 2.5, '#b98a5a', 'Delivery truck', 'Each truck has 3 spaces for tiles. On your turn you may take one truck with everything on it.', { h: 0.05, gap: 0.5 })),
      ]),
      S('Sort out the tiles', `Use ${types} of the 8 animal types with ${n} players and return the others, with their offspring, to the box. Return all tiles of one vending stall type too, so four types are used. Put the round offspring tiles to one side.`, 'r', [
        R(discs('babies', 1, 0.33, '#f1c9a0', 'Offspring tiles', 'Round baby animal tiles. A fertile male and female of one type in the same enclosure produce one.', { label: '●', h: 0.2, ink: '#2b241c' })),
      ], 'Fewer players means fewer animal types: all 8 with five players, one fewer for each player below that. Any balloon stall, tray or hay bales are not used in the basic game.'),
      S('Set aside the last 15 tiles', 'Mix the square tiles face down. Count off 15 into a separate stack and put the red disc on top of it. The rest form the draw stacks.', 'draw', [
        C(
          deck('draw', 18, BACK, 'Draw stacks', 'Animals, vending stalls and coin tiles, all face down. Split them into as many stacks as you like.', { ...TILE, per: 0.03, n: 3, gap: 0.3 }),
          deck('last', 15, BACK, 'Final stack', '15 tiles kept apart. Drawing the first tile from this stack means the current round is the last.', { ...TILE, per: 0.03 }),
        ),
        On('last', 0.5, 0.5, discs('red', 1, 0.2, '#c0392b', 'Red disc', 'Marks the final stack of 15 tiles.', { h: 0.1 })),
      ]),
      S('Ready to play', 'Choose a start player; play passes clockwise.', 'all', [], 'On your turn do one thing: draw a tile and put it on a truck, take a truck and sit out the rest of the round, or carry out one money action.'),
    ],
    turn: [
      T('Draw a tile onto a truck', 'You draw a tile, show it, and place it on a free space of any truck.', 'c', [draw('draw.0', at('truck.0', 0.5, 0.2), ANIMAL('#f3e2b0', '▲'), 'tA')]),
      T('The trucks fill up', 'The next players do the same. Each truck is slowly loaded with a mix of tiles you may or may not want.', 'c', [
        draw('draw.1', at('truck.0', 0.5, 0.5), ANIMAL('#cfe3c0', '●'), 'tB'),
        draw('draw.2', at('truck.1', 0.5, 0.2), ANIMAL('#f3e2b0', '▲'), 'tC'),
      ]),
      T('Take a truck', 'Back on your turn you take a truck instead (it must hold at least one tile). Its tiles go straight into your zoo, and you are out until the round ends.', 'you', [
        mv('tA', at('zoo', 0.15, 0.3)),
        mv('tB', at('zoo', 0.6, 0.3)),
        mv('truck.0', by('zoo', 3.1, 0)),
      ]),
      T('Money actions', 'Instead you could spend coins: 1 to move or swap animals, 2 to buy an animal from another barn or discard one of yours, 3 to add your expansion board.', 'you', [mv('coins.0', at('bank', 0.5, 0.5))]),
      T('Last round and scoring', 'When everyone has a truck, return the trucks and start a new round with whoever took the last truck. The round in which the final stack is first used is the last. Score full and nearly full enclosures and stall types, lose points for the barn: most points wins.', 'all'),
    ],
  }
})
