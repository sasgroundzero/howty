/** Sanctuary: a display of six zoo tiles, five conservation objectives, and a zoo map with four action cards. */
import { C, On, P, R, S, T, at, board, box, by, cards, discs, f, ft, hexes, mat, mv, pile, spawn, tabletop, tiles, zone } from '../compose'

const TILE = ['#c9a66b', '#7a9a6a', '#8fb7c9', '#d9c2a8', '#a3b86a', '#b7a3c9']
const TILE_BODY = 'A zoo tile: an animal, a building or a project. Each has conditions for where it may go and a way of scoring.'
const ACT = [ft('#f3e7c5', 'PROJECTS', 'side I', '≡'), ft('#e3ecd6', 'ACTION', 'side I', '●'), ft('#dfe8ee', 'ACTION', 'side I', '▲'), ft('#efe0d6', 'ACTION', 'side I', '◆')]

export const sanctuary = tabletop('sanctuary', 'Sanctuary', [2, 5], 3, '60–90 min', 'Medium', 'Build a zoo from tiles, Ark Nova style.', ['#7a9a6a', '#c9a66b', '#8fb7c9'], (n) => ({
  setup: [
    S('Tile display', 'Shuffle the zoo tiles into a face-down pile. Put the display board in the middle and place 6 random tiles face up, one beside each of its numbers.', 'c', [
      C(board('display', 9, 1.9, 'g:plain:0:#e9dfc8:#7a9a6a:Display', 'Display board', 'Holds the 6 tiles on offer, numbered from the left. How far along it you may reach depends on your Projects card.')),
      On('display', 0.5, 0.5, hexes('offer', 6, 0.6, TILE, 'Tiles on offer', TILE_BODY, { gap: 0.3 })),
      R(box('stack', 1.4, 1, 1.4, '#5a6b4a', 'Face-down tile pile', 'The rest of the zoo tiles. If this pile ever runs out, the game ends.'), zone('discard', 1.4, 1.4, 'Discards', 'Tiles discarded from hands go here.')),
    ]),
    S('Conservation board', 'Shuffle the 10 conservation objectives, reveal 5 on the conservation board and return the other 5 to the box.', 'cons', [
      C(board('cons', 9, 2.6, 'g:plain:0:#dfe8dc:#3d6b4a:Conservation', 'Conservation board', 'Shows the 5 objectives for this game. Players mark the ones they have supported underneath.')),
      On('cons', 0.5, 0.35, cards('goals', 5, ft('#f3ecdc', 'GOAL', 'icons', '★'), 'Conservation objectives', '5 of the 10 are used each game. Each rewards a kind of icon in your zoo.', { gap: 0.4 })),
    ]),
    S('Markers', 'Put the conservation markers, pouch markers and end-of-game markers in a supply.', 'r', [
      R(pile('markers', ['#3d8b4a', '#b8733a'], 'Conservation and pouch markers', 'Gained from tiles and effects during the game. The ones you still hold at the end are worth 2 points each.', 'disc'), tiles('endmark', 1, 0.8, 0.8, f('#e0b12f', '⚑', '#2b241c'), 'End-of-game markers', 'Taken by a player who triggers the end of the game, and worth points.', { h: 0.12 })),
    ]),
    S('Zoo maps', 'Everyone takes a zoo map, all using the same side (side 1 for a first game), and a tile holder. Nobody starts with any tiles.', 'you', [
      P(mat('zoo', 5.4, 4, '$', 'Zoo map', 'Zoo map', 'Your zoo. Tiles are built outward from the entrance and must connect to it or to tiles already placed.')),
      P(cards('act', 4, ACT, 'Action cards', 'A set of 4, all on side I. The slot a card sits in sets its strength: further right is stronger. A used card moves to the leftmost slot.'), box('holder', 1.6, 0.3, 0.5, '#8a6a4a', 'Tile holder', 'Stands your hand of tiles up so only you can see them. At the end of your turn you may keep at most 6.')),
    ], 'A solo mode exists too; check the rulebook for its changes.'),
    S('Action cards and player markers', 'The starting player puts their Projects card in slot 1, the next player in slot 2, and so on up to slot 4. Each player shuffles their other three action cards into the remaining slots.', 'you', [
      P(discs('upg', 4, 0.16, '$', 'Upgrade markers', '4 per player. Each lets you flip an action card to its stronger side II once you meet its condition.', { h: 0.08 }), discs('ach', 4, 0.2, '$', 'Achievement markers', '4 per player, marked 2×, 3×, 4× and 5×. You place one each time you support a conservation objective.', { label: ['2×', '3×', '4×', '5×'], h: 0.08 })),
    ], n === 5 ? 'With 5 players the fourth and fifth players both put Projects in slot 4. The scene shows the starting player’s order for everyone.' : 'The scene shows the starting player’s order for everyone.'),
    S('Ready to play', 'Play passes clockwise from the starting player.', 'all', [], 'A turn is: take 1 tile from the display, perform 1 action with an action card, then optionally build, support an objective and upgrade.'),
  ],
  turn: [
    T('Take a tile', 'You take one tile from the part of the display your Projects card can reach, and add it to your holder.', 'display', [mv('offer.0', at('holder', 0.5, 0.5))]),
    T('Perform an action', 'You choose one action card and use it at the strength of its slot, either to gain tiles or to play tiles, here to add the tile to your zoo next to the entrance. The used card then moves to the leftmost slot and the cards that were left of it slide right.', 'you', [
      mv('offer.0', at('zoo', 0.5, 0.85)),
      mv('act.3', by('act.3', -3.12, 0)), mv('act.0', by('act.0', 1.04, 0)), mv('act.1', by('act.1', 1.04, 0)), mv('act.2', by('act.2', 1.04, 0)),
    ], 9),
    T('Tidy the display', 'At the end of your turn discard down to 6 tiles, slide the display tiles left to close the gap and refill it to 6 from the pile.', 'display', [
      ...[1, 2, 3, 4, 5].map((k) => mv(`offer.${k}`, by(`offer.${k}`, -1.35, 0), 0.2 + k * 0.15)),
      spawn(hexes('newtile', 1, 0.6, TILE[2], 'Tile on offer', TILE_BODY), by('offer.5', 1.35, 0), 'stack', undefined, 1.4),
    ]),
    T('Next player', 'The next player takes a tile within their own reach and performs an action in the same way.', 'display', [mv('offer.1', at('holder@1', 0.5, 0.5))]),
    T('Buildings, objectives and upgrades', 'After your action you may also play one building, support one objective by placing an achievement marker under it, and flip action cards whose upgrade conditions you now meet.', 'cons', [mv('ach.0', at('cons', 0.211, 0.82))]),
    T('End of the game', 'The end is triggered when a player places all 4 achievement markers or covers their whole zoo map, after which everyone else gets one more turn. If the tile pile runs out first, the game ends right after that turn. Most points wins; a tie goes to more animals in the zoo.', 'all'),
  ],
}))
