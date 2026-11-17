/** War of the Ring: Free Peoples on the left, Shadow on the right, the Fellowship creeping toward Mordor. */
import { C, L, On as OnBase, P, R, S, T, at, board, box, deck, dice, discs, draw, f, mv, pawns, roll, tabletop, zone } from '../compose'
import { cityUV } from '../layouts'

/** compose.On leaves `spread` unset, which the composer reads for every "on" placement, so set it here. */
const On = (...a: Parameters<typeof OnBase>) => ({ ...OnBase(...a), spread: [0, 0] as [number, number] })

const BLUE = '#2e6fb7'
const RED = '#c0392b'
const army = (id: string, city: number, color: string, side: string) =>
  On('map', cityUV(city)[0], cityUV(city)[1], pawns(id, 1, color, `${side} army`, `Stands in for the ${side} figures that start in this area. The real board prints exactly which units go in each region.`, { scale: 0.55 }))

export const warOfTheRing = tabletop('war-of-the-ring', 'War of the Ring', [2, 4], 2, '3–4 hours', 'Hard', 'Armies clash while the Ring heads for Doom.', ['#cdbf96', '#2e6fb7', '#c0392b'], (n) => ({
  setup: [
    S('Lay out the board and pick sides', 'Unfold the map of Middle-earth. One side plays the Free Peoples and the other plays the Shadow.', 'c', [
      C(board('map', 13, 9, 'g:map:0:#cdbf96:#7a8f5a:Middle-earth', 'Game board', 'A map of regions, with the Fellowship track along the top, the Hunt box and the political track. This drawing is schematic, not the real map.')),
      P(zone('hand', 3, 1.6, 'Event cards', 'Your hand of event cards. You start with none and draw at the start of every turn.')),
    ], n > 2 ? 'With 3 or 4 players you play in two teams and split the nations of each side between team mates: check the rulebook for the split.' : 'Here you play the Free Peoples and the player opposite plays the Shadow.'),
    S('Place the starting armies', 'Put every army figure, leader and Nazgul on the region shown for it in the setup diagram. Unused figures wait beside the board as reinforcements.', 'map', [
      army('fa1', 6, BLUE, 'Free Peoples'), army('fa2', 7, BLUE, 'Free Peoples'), army('fa3', 11, BLUE, 'Free Peoples'),
      army('sa1', 3, RED, 'Shadow'), army('sa2', 8, RED, 'Shadow'), army('sa3', 13, RED, 'Shadow'),
    ], 'The exact units per region are printed on the board and in the rulebook; only a few stand-in figures are shown here.'),
    S('The Fellowship sets out', 'Place the Fellowship figure in Rivendell. Put the progress counter, hidden side up, and the corruption counter on step 0 of the Fellowship track.', 'map', [
      On('map', cityUV(1)[0], cityUV(1)[1], pawns('fellowship', 1, '#e9e4d8', 'Fellowship of the Ring', 'One figure that marks where the Ring-bearers were last seen. The companions start together, guided by Gandalf the Grey.', { scale: 0.6, shape: 'hero' })),
      On('map', 0.05, 0.045, discs('corruption', 1, 0.2, '#3a3a3a', 'Corruption counter', 'Tracks the Ring-bearers\' corruption. If it reaches 12 the Shadow wins.', { label: 'C', h: 0.08 })),
      On('map', 0.1, 0.045, discs('progress', 1, 0.2, '#e0b12f', 'Fellowship progress counter', 'Counts the steps the Fellowship has moved since it was last revealed.', { label: 'F', h: 0.08, ink: '#2b241c' })),
    ]),
    S('Set the political track', 'Place each nation\'s political marker on its starting step of the political track.', 'map', [
      On('map', 0.96, 0.5, discs('politics', 8, 0.15, [BLUE, BLUE, BLUE, BLUE, BLUE, RED, RED, RED], 'Political markers', '8 markers, one per nation. A nation must reach the "At War" step before it can fight freely.', { cols: 1, gap: 0.1, h: 0.06 })),
    ], 'The Elves and the Shadow nations start active; most Free Peoples nations start passive. The starting steps are printed on the track.'),
    S('Free Peoples supplies', 'The Free Peoples take their 4 starting action dice, the three Elven Rings and their two event decks, shuffled separately.', 'l', [
      L(dice('fdice', 4, BLUE, 'Free Peoples action dice', 'The Free Peoples start with 4 action dice and can gain more as certain characters enter play.', { size: 0.5, ink: '#ffffff' })),
      L(
        deck('fpchar', 24, f(BLUE, '♛'), 'Free Peoples character deck', 'One of the two Free Peoples event decks. Character events mostly help the Fellowship and companions.'),
        deck('fpstrat', 24, f(BLUE, '⚔'), 'Free Peoples strategy deck', 'The other Free Peoples event deck. Strategy events mostly help armies and politics.'),
        discs('rings', 3, 0.22, '#e0b12f', 'Elven Rings', '3 counters. The Free Peoples can spend one to change the face of an action die.', { h: 0.06 }),
      ),
    ]),
    S('Shadow supplies', 'The Shadow takes its 7 starting action dice and its two shuffled event decks. Put the standard Hunt tiles in a cup or bag to form the Hunt pool.', 'r', [
      R(dice('sdice', 7, RED, 'Shadow action dice', 'The Shadow starts with 7 action dice and gains more when its minions enter play.', { size: 0.5, cols: 4, ink: '#ffffff' })),
      R(
        deck('schar', 24, f(RED, '♛'), 'Shadow character deck', 'One of the two Shadow event decks.'),
        deck('sstrat', 24, f(RED, '⚔'), 'Shadow strategy deck', 'The other Shadow event deck.'),
        box('huntpool', 1.1, 0.8, 1.1, '#3a3a3a', 'Hunt pool', 'The standard Hunt tiles, drawn blind when the Hunt for the Ring succeeds. Special tiles are added later by events.', { round: true }),
      ),
    ]),
    S('Ready to play', 'There is no fixed first player: each turn runs through six phases, and in the action phase the Free Peoples act first.', 'all', [], 'A turn is: recover dice and draw events, Fellowship phase, Hunt allocation, action roll, action resolution, victory check.'),
  ],
  turn: [
    T('Recover dice and draw events', 'Both sides take back their action dice and draw one card from each of their two event decks.', 'you', [
      draw('fpchar', at('hand', 0.3, 0.5)), draw('fpstrat', at('hand', 0.7, 0.5)),
      draw('schar', at('hand@1', 0.3, 0.5)), draw('sstrat', at('hand@1', 0.7, 0.5)),
    ]),
    T('Fellowship phase and Hunt allocation', 'The Free Peoples may declare the Fellowship\'s position. Then the Shadow may set action dice aside in the Hunt box instead of rolling them.', 'map', [mv('sdice.6', at('map', 0.85, 0.12))], 8),
    T('Action roll', 'Both sides roll their remaining action dice. Each face allows a kind of action: character, army, muster, event and so on.', 'all', [
      roll('fdice.0', 1), roll('fdice.1', 4), roll('fdice.2', 6), roll('fdice.3', 2),
      roll('sdice.0', 3), roll('sdice.1', 5), roll('sdice.2', 1), roll('sdice.3', 6),
    ]),
    T('Move the Fellowship', 'You spend a character die to advance the progress counter one step. The used die goes to the Hunt box, and the Shadow rolls its Hunt dice to try to find the Ring.', 'map', [mv('progress', at('map', 0.16, 0.045)), mv('fdice.0', at('map', 0.78, 0.12))], 8),
    T('The Shadow marches', 'Sides alternate actions, one die at a time. Here the Shadow spends an army die to move an army into a neighbouring region.', 'map', [mv('sa2', at('map', (cityUV(7)[0] + cityUV(8)[0]) / 2, (cityUV(7)[1] + cityUV(8)[1]) / 2))]),
    T('How it ends', 'The Free Peoples win if the Ring is destroyed at Mount Doom, or by holding Shadow strongholds worth 4 points. The Shadow wins if corruption reaches 12, or by capturing Free Peoples cities and strongholds worth 10 points.', 'all'),
  ],
}))
