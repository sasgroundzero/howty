/** Pirate's Cove: secretly pick an island each month, fight whoever else turns up, and plunder for fame. */
import { C, On, OnP, P, type Place, R, S, T, at, board, cards, cubes, deck, dice, discs, draw, f, ft, hide, mat, mv, pawns, pile, roll, set, spawn, tabletop, zone } from '../compose'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const OUTER: [string, number, number][] = [['Tavern', 0.18, 0.3], ['Hull', 0.5, 0.17], ['Sail', 0.82, 0.3], ['Cannon', 0.72, 0.78], ['Crew', 0.3, 0.78]]
const TREASURE = ft('#f3e7c5', 'LOOT', 'fame and gold', '◆')
const SMALL = { w: 0.6, d: 0.84 }

export const piratesCove = tabletop('pirates-cove', 'Pirate\'s Cove', [3, 5], 4, '60–90 min', 'Medium', 'Outguess rival pirates and plunder for fame.', ['#2f6f8f', '#e0b12f', '#3a3a3a'], () => ({
  setup: [
    S('Unfold the board', 'Place the board in the middle of the table. It shows five outer islands around Treasure Island, with Pirate\'s Cove off to one side.', 'c', [
      C(board('sea', 11, 8.2, 'g:plain:0:#2f6f8f:#e9e4d8: ', 'Game board', 'The sea chart, with a fame track round its edge. The outer islands are numbered Tavern 1, Hull 2, Sail 3, Cannon 4 and Crew 5. This drawing is schematic.')),
      ...OUTER.map(([name, u, v], i) => on('sea', u, v, discs(`isl${i}`, 1, 0.95, '#d9c9a0', `${name} Island`, name === 'Tavern' ? 'One of the 5 outer islands. Here you can buy Tavern cards after plundering.' : `One of the 5 outer islands. After plundering here you can pay to upgrade your ship's ${name.toLowerCase()}.`, { label: `${i + 1}`, h: 0.04 }))),
      on('sea', 0.5, 0.48, discs('isl5', 1, 0.8, '#c9b98a', 'Treasure Island', 'The sixth destination. Bury treasure chests here to turn them into fame.', { label: '6', h: 0.04 })),
      on('sea', 0.93, 0.9, discs('cove', 1, 0.6, '#8a7a5a', 'Pirate\'s Cove', 'A safe haven with no battles. A ship that is crippled or flees goes here to repair, and any ship can sail here for Tavern cards or gold.', { label: '⌂', h: 0.04 })),
    ]),
    S('Take a ship mat', 'Each player takes a ship mat and puts its four strength markers (sail, hull, crew and cannon) on the second space from the left, marked with a skull.', 'you', [
      P(mat('shipmat', 3.6, 2, '$', 'Ship mat', 'Ship mat', 'Tracks your ship\'s four parts. Sail decides who fires first, cannon how many dice you roll, crew how many cannons you can man and hull how much loot you can carry.')),
      on('shipmat', 0.5, 0.65, cubes('lvl', 4, '$', 'Ship markers', '4 markers, one each for sail, hull, crew and cannon. Battle damage pushes them down and upgrades push them up.', { s: 0.22, gap: 0.6 })),
    ]),
    S('Ships and fame markers', 'Everyone puts their fame marker on the Jolly Roger start space of the fame track and keeps their ship ready. Ships first sail in month one; the scene parks them at Pirate\'s Cove.', 'sea', [
      OnP('cove', 0.5, 0.5, pawns('ship', 1, '$', 'Pirate ship', 'Your ship. Each month it sails to the island you secretly chose.', { scale: 0.32 }), [0.26, 0]),
      OnP('sea', 0.5, 0.975, discs('fame', 1, 0.11, '$', 'Fame marker', 'Moves along the fame track. The most famous pirate at the end wins.', { h: 0.08 }), [0.3, 0]),
    ]),
    S('Wheel, gold and a Tavern card', 'Each player takes a captain\'s wheel, 9 gold in doubloons (one 5 and four 1s) and the top Tavern card.', 'you', [
      P(discs('wheel', 1, 0.5, '#8a5a2b', 'Navigation wheel', 'Turn it in secret to the number of the island you will sail to (1 to 6), then everyone reveals together.', { label: '?', ink: '#ffffff', h: 0.08 }),
        zone('loot', 3.4, 1.4, 'Gold, treasure and Tavern cards', 'Your doubloons, treasure chests and Tavern cards. You start with 9 gold and 1 Tavern card.')),
    ]),
    S('Decks, dice and loot', 'Shuffle the treasure cards into five face-down stacks of 12, one on each outer island, and put the shuffled Tavern deck on Tavern Island. The remaining gold and all the treasure chests go on Treasure Island.', 'sea', [
      R(deck('tdeck', 60, f('#8a5a2b', '◆'), 'Treasure deck', '60 cards, split into a stack of 12 on each outer island. Each month the top card of every stack is turned up to show the fame, gold, chests and Tavern cards on offer there.'),
        deck('tavern', 30, f('#3d6b3a', '◆'), 'Tavern deck', 'Parrots, tricks and battle surprises. Keep yours secret until you play them.')),
      R(pile('goldpile', '#e0b12f', 'Doubloons', 'The supply of gold. Spend gold to upgrade your ship and buy Tavern cards.', 'disc'),
        pile('chests', '#8a5a2b', 'Treasure chests', 'Carried in your hull until you bury them at Treasure Island for fame.'),
        dice('die', 3, '#e9e4d8', 'Battle dice', 'Rolled in battles, one per cannon you can man; each 5 or 6 is a hit. The game has 6.', { size: 0.5 })),
      ...OUTER.map((_, i) => on(`isl${i}`, 0.5, 0.3, cards(`tc${i}`, 1, TREASURE, 'Treasure card', 'What you plunder at this island this month.', SMALL))),
    ]),
    S('The Legendary Pirate', 'Set the Royal Navy card aside, shuffle the Legendary Pirate cards, and reveal one beside a black ship moored at Tavern Island. With 3 players a second black ship with its own card starts at Cannon Island. Each month they sail on one island and attack anyone they meet.', 'sea', [
      on('isl0', 0.75, 0.75, pawns('legend', 1, '#2b241c', 'Legendary Pirate', 'A fearsome ship run by the game. Meeting it means a hard fight, but beating it is worth a lot of fame.', { scale: 0.42, shape: 'boss' })),
    ]),
    S('Ready to play', 'The game lasts 12 rounds, one for each month of the year. Before the first month everyone may secretly spend gold to upgrade their ship.', 'all', [], 'Each month: turn up new treasure cards, choose an island in secret, reveal and sail, fight battles, plunder, upgrade, then move the black ships.'),
  ],
  turn: [
    T('Choose an island in secret', 'Everyone sets their wheel behind their hand, then all reveal together. You and the player on your left both picked island 2. A third player picked island 4.', 'you', [set('wheel', { label: '2' }), set('wheel@1', { label: '2' }), set('wheel@2', { label: '4' })]),
    T('Set sail', 'Each ship moves to the island its captain chose.', 'sea', [
      mv('ship', at('isl1', 0.3, 0.75)),
      mv('ship@1', at('isl1', 0.52, 0.75)),
      mv('ship@2', at('isl3', 0.4, 0.75)),
    ]),
    T('Battle', 'Two ships at one outer island must fight. The faster ship fires first, rolling one die per cannon it can man, and each 5 or 6 knocks a chosen part of the enemy ship down a level. Your rival is crippled and limps to Pirate\'s Cove, and you gain 1 fame.', 'sea', [
      roll('die.0', 5), roll('die.1', 6), roll('die.2', 2),
      mv('ship@1', at('cove', 0.5, 0.2), 1.6),
    ], 8),
    T('Plunder and upgrade', 'Alone at the island, you take what its treasure card shows: fame on the track and gold for your hold. You may then pay to upgrade the ship part this island improves.', 'you', [
      mv('fame', at('sea', 0.3, 0.975)),
      spawn(discs('plunder', 3, 0.17, '#e0b12f', 'Doubloons', 'Gold you plundered this month.', { h: 0.08 }), at('loot', 0.25, 0.5), 'goldpile'),
      mv('lvl.0', at('shipmat', 0.158, 0.3), 1.6),
    ], 8),
    T('A new month', 'The Legendary Pirate sails on one island, any treasure over your hull\'s capacity is lost and leftover treasure cards are discarded. Next month a new treasure card is turned up on each outer island.', 'sea', [
      hide('tc1'),
      draw('tdeck', at('isl1', 0.5, 0.3), TREASURE),
      mv('legend', at('isl1', 0.75, 0.75)),
    ]),
    T('How it ends', 'After the twelfth month, everyone reveals their Fame cards and scores them. Gold and treasure not buried on Treasure Island is worth nothing. The pirate with the most fame wins.', 'all'),
  ],
}))
