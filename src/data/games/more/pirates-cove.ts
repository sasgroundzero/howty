/** Pirate's Cove: secretly pick an island each month, fight whoever else turns up, and plunder for fame. */
import { C, On, OnP, P, type Place, R, S, T, at, board, cards, cubes, deck, dice, discs, draw, f, ft, hide, mat, mv, pawns, pile, roll, set, spawn, tabletop, zone } from '../compose'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const OUTER: [string, number, number][] = [['Tavern', 0.18, 0.3], ['Sail', 0.5, 0.17], ['Hull', 0.82, 0.3], ['Crew', 0.72, 0.78], ['Cannon', 0.3, 0.78]]
const TREASURE = ft('#f3e7c5', 'LOOT', 'fame and gold', '◆')
const SMALL = { w: 0.6, d: 0.84 }

export const piratesCove = tabletop('pirates-cove', 'Pirate\'s Cove', [3, 5], 4, '60–90 min', 'Medium', 'Outguess rival pirates and plunder for fame.', ['#2f6f8f', '#e0b12f', '#3a3a3a'], () => ({
  setup: [
    S('Unfold the board', 'Place the board in the middle of the table. It shows five outer islands around Treasure Island, with Pirate\'s Cove off to one side.', 'c', [
      C(board('sea', 11, 8.2, 'g:plain:0:#2f6f8f:#e9e4d8: ', 'Game board', 'The sea chart, with a fame track round its edge. This drawing is schematic and the island numbers on it are only illustrative: use the ones printed on the real board.')),
      ...OUTER.map(([name, u, v], i) => on('sea', u, v, discs(`isl${i}`, 1, 0.95, '#d9c9a0', `${name} Island`, name === 'Tavern' ? 'One of the 5 outer islands. Here you can buy Tavern cards after plundering.' : `One of the 5 outer islands. After plundering here you can pay to upgrade your ship's ${name.toLowerCase()}.`, { label: `${i + 1}`, h: 0.04 }))),
      on('sea', 0.5, 0.48, discs('isl5', 1, 0.8, '#c9b98a', 'Treasure Island', 'The sixth destination. Bury treasure chests here to turn them into fame.', { label: '6', h: 0.04 })),
      on('sea', 0.93, 0.9, discs('cove', 1, 0.6, '#8a7a5a', 'Pirate\'s Cove', 'Where ships start, and where a ship that loses or flees a battle goes to lick its wounds.', { label: '⌂', h: 0.04 })),
    ]),
    S('Take a ship mat', 'Each player takes a ship mat and sets its four markers (sail, hull, crew and cannon) to the starting levels shown in the rulebook.', 'you', [
      P(mat('shipmat', 3.6, 2, '$', 'Ship mat', 'Ship mat', 'Tracks your ship\'s four parts. Sail decides who fires first, cannon how many dice you roll, crew how many cannons you can man and hull how much loot you can carry.')),
      on('shipmat', 0.5, 0.65, cubes('lvl', 4, '$', 'Ship markers', '4 markers, one each for sail, hull, crew and cannon. Battle damage pushes them down and upgrades push them up.', { s: 0.22, gap: 0.6 })),
    ]),
    S('Ships and fame markers', 'Everyone puts their ship in Pirate\'s Cove and their fame marker at the start of the fame track.', 'sea', [
      OnP('cove', 0.5, 0.5, pawns('ship', 1, '$', 'Pirate ship', 'Your ship. Each month it sails to the island you secretly chose.', { scale: 0.32 }), [0.26, 0]),
      OnP('sea', 0.5, 0.975, discs('fame', 1, 0.11, '$', 'Fame marker', 'Moves along the fame track. The most famous pirate at the end wins.', { h: 0.08 }), [0.3, 0]),
    ]),
    S('Wheel, gold and a Tavern card', 'Each player takes a navigation wheel, plus the starting doubloons and Tavern card the rulebook gives every captain.', 'you', [
      P(discs('wheel', 1, 0.5, '#8a5a2b', 'Navigation wheel', 'Turn it in secret to the number of the island you will sail to (1 to 6), then everyone reveals together.', { label: '?', ink: '#ffffff', h: 0.08 }),
        zone('loot', 3.4, 1.4, 'Gold, treasure and Tavern cards', 'Your doubloons, treasure chests and Tavern cards. Starting amounts are in the rulebook.')),
    ]),
    S('Decks, dice and loot', 'Shuffle the treasure cards and the Tavern cards. Deal one treasure card face up to each of the five outer islands. Put the gold, treasure chests and dice within reach.', 'sea', [
      R(deck('tdeck', 40, f('#8a5a2b', '◆'), 'Treasure deck', 'Each month a new treasure card on every outer island shows the fame, gold, chests and Tavern cards on offer there.'),
        deck('tavern', 30, f('#3d6b3a', '◆'), 'Tavern deck', 'Parrots, tricks and battle surprises. Keep yours secret until you play them.')),
      R(pile('goldpile', '#e0b12f', 'Doubloons', 'The supply of gold. Spend gold to upgrade your ship and buy Tavern cards.', 'disc'),
        pile('chests', '#8a5a2b', 'Treasure chests', 'Carried in your hull until you bury them at Treasure Island for fame.'),
        dice('die', 3, '#e9e4d8', 'Battle dice', 'Rolled in battles, one per cannon you can fire. The game comes with several.', { size: 0.5 })),
      ...OUTER.map((_, i) => on(`isl${i}`, 0.5, 0.3, cards(`tc${i}`, 1, TREASURE, 'Treasure card', 'What you plunder at this island this month.', SMALL))),
    ]),
    S('The Legendary Pirate', 'Reveal a Legendary Pirate and place the black ship on an outer island as the rulebook directs. It sails on to the next island every month and attacks anyone it meets.', 'sea', [
      on('isl2', 0.75, 0.75, pawns('legend', 1, '#2b241c', 'Legendary Pirate', 'A fearsome ship run by the game. Meeting it means a hard fight, but beating it is worth a lot of fame.', { scale: 0.42, shape: 'boss' })),
    ]),
    S('Ready to play', 'The game lasts 12 rounds, one for each month of the year. Everyone plays each round at the same time.', 'all', [], 'Each month: choose an island in secret, reveal and sail, fight any battles, then plunder and upgrade.'),
  ],
  turn: [
    T('Choose an island in secret', 'Everyone sets their wheel behind their hand, then all reveal together. You and the player on your left both picked island 2. A third player picked island 4.', 'you', [set('wheel', { label: '2' }), set('wheel@1', { label: '2' }), set('wheel@2', { label: '4' })]),
    T('Set sail', 'Each ship moves to the island its captain chose.', 'sea', [
      mv('ship', at('isl1', 0.3, 0.75)),
      mv('ship@1', at('isl1', 0.52, 0.75)),
      mv('ship@2', at('isl3', 0.4, 0.75)),
    ]),
    T('Battle', 'Two ships at one island must fight. The faster ship fires first, rolling one die per cannon it can man, and hits damage a part of the enemy ship. Your rival takes too much damage and flees to Pirate\'s Cove.', 'sea', [
      roll('die.0', 5), roll('die.1', 6), roll('die.2', 2),
      mv('ship@1', at('cove', 0.5, 0.2), 1.6),
    ], 8),
    T('Plunder and upgrade', 'Alone at the island, you take what its treasure card shows: fame on the track and gold for your hold. You may then pay to upgrade the ship part this island improves.', 'you', [
      mv('fame', at('sea', 0.3, 0.975)),
      spawn(discs('plunder', 3, 0.17, '#e0b12f', 'Doubloons', 'Gold you plundered this month.', { h: 0.08 }), at('loot', 0.25, 0.5), 'goldpile'),
      mv('lvl.0', at('shipmat', 0.158, 0.3), 1.6),
    ], 8),
    T('A new month', 'The used treasure cards are replaced with new ones and the Legendary Pirate sails on to the next island.', 'sea', [
      hide('tc1'),
      draw('tdeck', at('isl1', 0.5, 0.3), TREASURE),
      mv('legend', at('isl3', 0.75, 0.75)),
    ]),
    T('How it ends', 'After the twelfth month, add any end-of-game fame bonuses described in the rulebook. The pirate with the most fame wins.', 'all'),
  ],
}))
