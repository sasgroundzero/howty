/** Small World: a crowded map, a column of race and power combos, and five coins each. */
import { C, On, P, R, S, T, at, board, by, deck, dice, discs, ft, hide, mv, pile, spawn, tabletop, tiles, zone } from '../compose'
import { cityUV } from '../layouts'

const COMBO = [0, 1, 2, 3, 4].map(() => ft('#e8d9b0', 'RACE', 'with a power', '⚑'))
const near = (i: number, du: number): [number, number] => [cityUV(i)[0] + du, cityUV(i)[1]]

export const smallWorld = tabletop('small-world', 'Small World', [2, 5], 4, '40–80 min', 'Medium', 'Conquer land, then send your race into decline.', ['#cfe0b0', '#7a4fa3', '#d9772b'], (n) => {
  const turns = n <= 3 ? 10 : n === 4 ? 9 : 8
  return {
    setup: [
      S('Pick the right map', `The box has a different map for each player count. Lay out the ${n}-player map and put the turn marker on the first space of its turn track.`, 'c', [
        C(board('map', 12, 8, 'g:map:0:#cfe0b0:#6f8f4a:Small World', 'Game board', `The ${n}-player map. A ${n}-player game lasts ${turns} turns (10 with two or three players, 9 with four, 8 with five). The circles here stand for regions; the real map is not shown.`)),
        On('map', 0.06, 0.05, discs('turn', 1, 0.2, '#f6f1e4', 'Turn marker', 'Moves one space along the turn track each time the first player starts a turn.', { label: '1', h: 0.12 })),
      ]),
      S('Mountains and Lost Tribes', 'Put a mountain token on every mountain region and a Lost Tribe token on every region that shows the Lost Tribe symbol.', 'map', [
        ...[1, 8, 13].map((c, i) => On('map', ...cityUV(c), tiles(`mtn${i}`, 1, 0.5, 0.5, ft('#9a9a9a', '', '', '▲'), 'Mountain', 'Marks a mountain region, which costs 1 extra token to conquer. Mountains stay on the map all game.', { h: 0.14 }))),
        ...[5, 7, 12].map((c, i) => On('map', ...cityUV(c), discs(`tribe${i}`, 1, 0.24, '#b08d57', 'Lost Tribe', 'The remains of an old civilization. It defends its region like any other token until someone conquers it.', { label: '●', h: 0.08 }))),
      ]),
      S('Lay out the race and power combos', 'Shuffle the race banners and the special power badges separately. Deal 5 banners in a column, put a badge to the left of each, and leave both stacks at the bottom as a sixth combo.', 'r', [
        R(tiles('combo', 5, 2.6, 0.9, COMBO, 'Race and power combo', 'A race banner joined to a random special power badge. The numbers on the two pieces add up to the tokens you get.', { cols: 1, h: 0.05 })),
        R(deck('stack', 9, ft('#e8d9b0', 'RACE', 'with a power', '⚑'), 'Banner and badge stacks', '14 race banners and 20 special power badges in the base game. The top of each stack is the sixth combo on offer.', { w: 2.6, d: 0.9, per: 0.05 })),
      ]),
      S('Coins and the die', 'Put the victory coins and the reinforcement die beside the board.', 'bank', [
        R(pile('bank', '#e0b12f', 'Victory coins', 'The bank. Coins are the score, and players keep theirs secret.', 'disc'), dice('rdie', 1, '#f6f1e4', 'Reinforcement die', 'May be rolled once for your last conquest of a turn if you are short of tokens. Three of its sides are blank.', { values: [1] })),
      ]),
      S('Take five coins', 'Each player takes 5 victory coins of value 1.', 'you', [
        P(zone('race', 5, 1.5, 'Your race', 'Your active race banner, its power badge and your race tokens in hand.')),
        P(discs('coins', 5, 0.22, '#e0b12f', 'Your coins', '5 coins of value 1 to start. They pay for skipping combos and count as points at the end.', { label: '1', h: 0.06 })),
      ]),
      S('Ready to play', 'Pick a first player (the rulebook has a playful way to choose), then play passes clockwise.', 'all', [], 'On your first turn you pick a race and power combo, conquer regions and score coins. On later turns you keep expanding or put your race into decline.'),
    ],
    turn: [
      T('Pick a combo', 'The top combo of the column is free. You want the second one, so you put 1 coin on the combo you skip and take yours. The combos below slide up and a new one is revealed.', 'r', [
        mv('coins.4', at('combo.0', 0.85, 0.5)),
        mv('combo.1', at('race', 0.3, 0.5), 1),
      ]),
      T('Take your race tokens', 'Add the number on the banner to the number on the badge and take that many race tokens. Say that makes 6.', 'race', [
        spawn(tiles('army', 6, 0.4, 0.4, '$', 'Your race tokens', 'You conquer regions by placing these. Each region you hold at the end of your turn earns a coin.', { cols: 3, gap: 0.1, h: 0.06 }), at('race', 0.8, 0.5)),
      ]),
      T('Conquer a region', 'Your first conquest must enter from the edge of the map. An empty region costs 2 tokens.', 'map', [
        mv('army.0', at('map', ...near(10, -0.02))),
        mv('army.1', at('map', ...near(10, 0.02))),
      ]),
      T('Conquer a neighbour', 'Each further conquest must touch a region you hold. Every token, mountain or other defence in it costs 1 more, so a Lost Tribe region costs 3. The tribe is removed.', 'map', [
        hide('tribe0'),
        ...[0, 1, 2].map((k) => mv(`army.${k + 2}`, at('map', ...near(5, (k - 1) * 0.04)), 0.8 + k * 0.2)),
      ]),
      T('Score your regions', 'When you can conquer no more, you may rearrange your tokens, leaving at least 1 in each region. Then you take 1 coin for each region you hold: 2 coins.', 'you', [
        spawn(discs('gain', 2, 0.22, '#e0b12f', 'Coins scored', '1 coin for each region you occupy, plus any bonus from your race or power.', { label: '1', h: 0.06 }), by('coins.3', 0.87, 0), 'bank'),
      ]),
      T('End of the game', `After the last turn on the track (turn ${turns} with ${n} players) everyone reveals their coins. The most coins wins.`, 'all'),
    ],
  }
})
