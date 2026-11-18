/** Arkham Horror (2nd edition): investigators roam Arkham closing gates before the Ancient One wakes. */
import { C, L, On, OnP, P, type Place, R, S, T, at, board, box, cards, cubes, deck, discs, draw, f, ft, mat, mv, pawns, spawn, tabletop, tiles, zone } from '../compose'
import { cityUV } from '../layouts'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const city = (i: number, du = 0, dv = 0): [number, number] => [cityUV(i)[0] + du, cityUV(i)[1] + dv]
const CLUE_AT = [1, 3, 7, 8, 11, 13]
const gate = (id: string) => discs(id, 1, 0.3, '#3b2a5a', 'Gate marker', 'An open gate to another world. Investigators who enter it are drawn through and must explore before they can try to close it.', { label: '◎', ink: '#ffffff', h: 0.06 })
const monster = (id: string) => tiles(id, 1, 0.5, 0.5, f('#7a2f2f', '✗'), 'Monster marker', 'Drawn at random from the monster cup. Monsters block movement and must be fought or evaded.', { h: 0.06 })
const doom = (id: string) => discs(id, 1, 0.2, '#2b241c', 'Doom token', 'One goes on the Ancient One\'s doom track each time a gate opens. When the track is full the Ancient One awakens.', { label: '✦', ink: '#ffffff', h: 0.06 })

export const arkhamHorror = tabletop('arkham-horror', 'Arkham Horror', [1, 8], 4, '2–4 hours', 'Hard', 'Close the gates before the Ancient One wakes.', ['#2f3d36', '#3b2a5a', '#8a7a4a'], (n) => ({
  setup: [
    S('Unfold the board', 'Put the board in the middle of the table and place the terror track marker on the first space of the terror track.', 'c', [
      C(board('map', 13, 8.6, 'g:map:0:#3b4a3f:#8a7a4a:Arkham', 'Arkham board', 'Streets and locations of Arkham along one side and the Other Worlds along the other. This drawing is schematic, not the real map.')),
      on('map', 0.03, 0.95, discs('terror', 1, 0.16, '#c0392b', 'Terror track marker', 'Starts at 0. As the terror level rises, allies leave town and shops close.', { h: 0.08 })),
    ]),
    S('Reveal the Ancient One', 'Pick an Ancient One sheet at random and place it beside the board. Its doom track starts empty.', 'ancient', [
      L(mat('ancient', 3.4, 2.2, '#2b2233', 'Ancient One', 'Ancient One sheet', 'One of 8 Ancient Ones. The sheet shows its doom track, the powers it has while it sleeps and how it fights if it wakes.')),
    ]),
    S('Take an investigator', 'Each player takes a random investigator sheet and that investigator\'s marker. Put sanity and stamina tokens on the sheet up to the printed maximums and set the three skill sliders.', 'you', [
      P(mat('sheet', 3.4, 2.2, '$', 'Investigator', 'Investigator sheet', 'Shows your maximum sanity and stamina, your home location, your starting possessions and three pairs of skills set with sliders.')),
      on('sheet', 0.16, 0.3, discs('sanity', 1, 0.2, '#2e6fb7', 'Sanity tokens', 'A stack equal to your maximum sanity. Lose them all and you are driven insane.', { h: 0.2 })),
      on('sheet', 0.16, 0.72, discs('stamina', 1, 0.2, '#c0392b', 'Stamina tokens', 'A stack equal to your maximum stamina. Lose them all and you are knocked unconscious.', { h: 0.2 })),
      on('sheet', 0.7, 0.5, cubes('slide', 3, '#e9e4d8', 'Skill sliders', '3 sliders, one per pair of skills. Moving a slider raises one skill of the pair and lowers the other.', { s: 0.2, cols: 1 })),
      OnP('map', 0.5, 0.36, pawns('inv', 1, '$', 'Investigator marker', 'Your investigator. It starts on the home location named on your sheet.', { scale: 0.55, shape: 'hero' }), [0.5, 0]),
    ], 'There are 16 investigators in the box. Each marker really starts at its own home location: they are shown side by side here.'),
    S('Decks and starting possessions', 'Shuffle the investigator decks. Each player takes the fixed possessions listed on their sheet, then draws the random ones it lists, plus the money and clue tokens shown.', 'you', [
      R(deck('idecks', 20, [f('#8a6a44', '◆'), f('#3d8b4a', '✦'), f('#7a4fa3', '✦'), f('#e0b12f', '★'), f('#2e6fb7', '●')], 'Investigator decks', '5 small decks: Common Items, Unique Items, Spells, Skills and Allies. Investigators gain cards from them during the game.', { n: 5, w: 0.65, d: 1 })),
      P(cards('items', 3, [f('#8a6a44', '◆'), f('#3d8b4a', '✦'), f('#e0b12f', '★')], 'Starting possessions', 'Your investigator\'s items, spells and skills. The exact cards depend on the investigator, so three are shown as an example.', { w: 0.65, d: 1 }),
        zone('play', 2.2, 1.4, 'Encounters', 'Cards you draw during your turn are read here, then discarded or kept.')),
    ]),
    S('Monsters, gates and the other decks', 'Put the monster markers in an opaque cup, leaving out the five Mask monsters unless Nyarlathotep is the Ancient One. Shuffle the gate markers into a face-down stack. Shuffle the nine location decks, the Mythos deck and the Gate deck.', 'r', [
      R(box('cup', 1.1, 0.9, 1.1, '#3a3a3a', 'Monster cup', 'Holds the monster markers so they can be drawn at random. Use any opaque container.', { round: true }),
        discs('gates', 1, 0.3, '#3b2a5a', 'Gate markers', 'A face-down stack of gate markers. One is placed whenever a gate opens.', { h: 0.4 }),
        deck('mythos', 60, f('#2b2233', '☾'), 'Mythos deck', 'One Mythos card is drawn at the end of every round. It opens a gate, moves monsters and adds a headline, environment or rumor.'),
        zone('mdisc', 0.9, 1.26, 'Mythos', 'The Mythos card just drawn is read here.'),
        deck('gatedeck', 45, f('#3b2a5a', '◎'), 'Gate deck', 'Encounter cards for investigators exploring the Other Worlds.')),
      L(deck('locs', 7, f('#8a7a4a', '⌂'), 'Location decks', '9 small decks, one per neighborhood. You draw from the matching deck when you have an encounter at a location.', { n: 9, cols: 3, w: 0.65, d: 1 })),
    ], `The monster limit is the number of players plus 3, so ${n + 3} in this game. Past that, new monsters go to the Outskirts.${n >= 5 ? " With 5 or more investigators, two monsters come out of each new gate." : ""}`),
    S('Seed the clue tokens', 'Place one clue token on every location marked as unstable (a red diamond on the board).', 'map',
      CLUE_AT.map((c, i) => on('map', ...city(c), discs(`clue${i}`, 1, 0.15, '#4f9a5a', 'Clue token', 'Pick clues up by ending your move on them. Spend them for extra dice on skill checks or to seal a gate.', { h: 0.05 }))),
      'Only some unstable locations are shown here.'),
    S('Draw the first Mythos card', 'The first player draws a Mythos card and resolves it: a gate opens and a monster appears at the location shown, and a doom token goes on the Ancient One.', 'map', [
      on('map', ...city(12), gate('gate0')),
      on('map', ...city(12, 0.045, 0), monster('mon0')),
      on('ancient', 0.14, 0.75, doom('doom0')),
    ], 'If the first card drawn is a Rumor, discard it and draw again until you get one that is not.'),
    S('Ready to play', 'The first player, picked at random at the start of setup, holds the first player marker. Each round has five phases, and everyone acts in each phase in turn order.', 'all', [], 'The phases are Upkeep, Movement, Arkham Encounters, Other World Encounters and Mythos. The first player marker passes to the left every round.'),
  ],
  turn: [
    T('Upkeep', 'Refresh any used cards, then adjust your skill sliders. You may move them a total number of stops equal to your Focus.', 'sheet', [mv('slide.0', at('sheet', 0.8, 0.345))]),
    T('Movement', 'You get movement points equal to your Speed. You walk to a location with a clue token and pick the clue up.', 'map', [
      mv('inv', at('map', ...city(7, 0, 0.07))),
      mv('clue2', at('sheet', 0.45, 0.3), 1.2),
    ]),
    T('Arkham encounter', 'You are at a location with no gate, so you draw the top card of that neighborhood\'s location deck, read the entry for your location and do what it says.', 'you', [
      draw('locs', at('play', 0.5, 0.5), ft('#f3e7c5', 'ENCOUNTER', 'skill check', '?')),
    ]),
    T('Mythos phase', 'After everyone has acted, the first player draws a Mythos card. A new gate opens with a monster, and another doom token goes on the Ancient One.', 'map', [
      draw('mythos', at('mdisc', 0.5, 0.5), ft('#d9d2e6', 'MYTHOS', 'gate and clue', '☾')),
      spawn(gate('gate1'), at('map', ...city(4)), 'gates'),
      spawn(monster('mon1'), at('map', ...city(4, 0.045, 0)), 'cup'),
      spawn(doom('doom1'), at('ancient', 0.26, 0.75)),
    ], 8),
    T('How it ends', 'The investigators win together by closing every gate while holding enough gate trophies, by sealing enough gates, or by beating the Ancient One in a final battle if it wakes. If it wakes and defeats them, everyone loses.', 'all', [], 8),
  ],
}))
