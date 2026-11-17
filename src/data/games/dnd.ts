/** Dungeons & Dragons 5e: a starter combat encounter on a 1-inch battle grid. */
import { Builder } from '../../engine/builder'
import type { DieSides, Face, Focus, GameDef, GameSetup, PieceSpec, V3 } from '../../engine/types'

const FOCUS: Record<string, Focus> = {
  overview: { pos: [0, 27, 22], target: [0, 0, 1.7] },
  mat: { pos: [0, 15, 11], target: [0, 0, -0.5] },
  screen: { pos: [0, 7, 4], target: [0, 1, -7.5] },
  sheets: { pos: [0, 8, 15.5], target: [0, 0, 7.6] },
  dice: { pos: [11, 6, 9.5], target: [11, 0, 4.4] },
  door: { pos: [-4, 8, 6.5], target: [-3.5, 0, -1] },
  fight: { pos: [1.5, 7.5, 6], target: [1.5, 0, -1.2] },
  roll: { pos: [1, 6, 11.5], target: [1, 0, 6] },
  tracker: { pos: [10.6, 6.5, 1.5], target: [10.6, 0, -3] },
  actions: { pos: [-10.8, 7, 5], target: [-10.8, 0, 0] },
}

const COLS = 14
const ROWS = 10
/** Center of a grid square (column 0 is the west edge, row 0 the far edge). */
const cell = (cx: number, cz: number, y = 0.02): V3 => [-COLS / 2 + cx + 0.5, y, -ROWS / 2 + cz + 0.5]

const HEROES = [
  { name: 'Fighter', color: '#c0483f', cell: [2, 3], init: 18, lines: ['AC 18   HP 12', 'Speed 30 ft', 'STR +3  DEX +1', 'Longsword +5 (1d8+3)', 'Second Wind (bonus)'] },
  { name: 'Wizard', color: '#3f6fc0', cell: [1, 4], init: 12, lines: ['AC 12   HP 8', 'Speed 30 ft', 'INT +3  DEX +2', 'Fire Bolt +5 (1d10)', 'Spell slots: 2'] },
  { name: 'Rogue', color: '#4a8a55', cell: [2, 4], init: 15, lines: ['AC 14   HP 9', 'Speed 30 ft', 'DEX +3  CHA +2', 'Shortsword +5 (1d6+3)', 'Sneak Attack 1d6'] },
  { name: 'Cleric', color: '#d0a030', cell: [1, 3], init: 9, lines: ['AC 18   HP 10', 'Speed 30 ft', 'WIS +3  STR +2', 'Mace +4 (1d6+2)', 'Healing Word (bonus)'] },
  { name: 'Ranger', color: '#8a5ab0', cell: [0, 4], init: 14, lines: ['AC 14   HP 11', 'Speed 30 ft', 'DEX +3  WIS +2', 'Longbow +5 (1d8+3)', 'Favored Enemy'] },
]
const DICE: { sides: DieSides; value: number; color: string; name: string; use: string }[] = [
  { sides: 4, value: 4, color: '#c0483f', name: 'd4', use: 'Small weapons like daggers, and some healing.' },
  { sides: 6, value: 6, color: '#d0782f', name: 'd6', use: 'Shortswords, Sneak Attack and Fireball damage.' },
  { sides: 8, value: 8, color: '#d0a030', name: 'd8', use: 'Longswords, longbows and many healing spells.' },
  { sides: 10, value: 10, color: '#4a8a55', name: 'd10', use: 'Heavy weapons and cantrips like Fire Bolt.' },
  { sides: 100, value: 70, color: '#2f8a8a', name: 'd% (percentile)', use: 'Shows tens (00 to 90). Roll it with the d10 to get 1 to 100.' },
  { sides: 12, value: 12, color: '#3f6fc0', name: 'd12', use: 'Greataxes and a barbarian’s hit points.' },
  { sides: 20, value: 20, color: '#8a5ab0', name: 'd20', use: 'The main die: every attack roll, ability check and saving throw.' },
]

function build(n: number): GameSetup {
  const heroes = HEROES.slice(0, n)
  const b = new Builder()
  const MAT = b.step({
    title: 'Roll out the battle mat',
    instruction: 'Lay the gridded battle mat in the middle of the table where everyone can reach it.',
    detail: 'Each 1-inch square stands for 5 feet. A character with a speed of 30 feet moves 6 squares.',
    needs: ['1 battle mat (1-inch grid)'],
    focus: FOCUS.mat,
  })
  const WALLS = b.step({
    title: 'Build the dungeon room',
    instruction: 'Stand the wall sections along the grid lines to form the room, leave a gap for the door, and add the two pillars.',
    detail: 'Walls block movement and line of sight. Pillars give cover.',
    needs: ['5 wall sections', '2 pillars'],
    focus: FOCUS.mat,
  })
  const SCREEN = b.step({
    title: 'Set up the DM screen',
    instruction: 'The Dungeon Master sits at the far side and stands the screen up to hide their notes and dice rolls.',
    needs: ['1 DM screen'],
    focus: FOCUS.screen,
  })
  const SHEETS = b.step({
    title: 'Hand out character sheets',
    instruction: `Each of the ${n} players takes their character sheet, and the turn reference card goes where all can see it.`,
    detail: 'The sheet lists your Armor Class (AC), hit points (HP), speed and attacks.',
    needs: [`${n} character sheets`, '1 reference card'],
    focus: FOCUS.sheets,
  })
  const DICESTEP = b.step({
    title: 'Set out the dice',
    instruction: 'Put a full set of 7 polyhedral dice within reach: d4, d6, d8, d10, d%, d12 and d20.',
    detail: 'The d20 decides whether things succeed. The other dice are mostly for damage.',
    needs: ['7 dice'],
    focus: FOCUS.dice,
  })
  const PARTY = b.step({
    title: 'Place the party',
    instruction: `The players put their ${n} miniatures in the corridor outside the door, one per square.`,
    needs: [`${n} hero miniatures`],
    focus: FOCUS.door,
  })
  const MONSTERS = b.step({
    title: 'Place the monsters',
    instruction: 'The DM puts 3 goblins and 1 ogre inside the room. The ogre is Large, so it fills a 2 by 2 block of squares.',
    needs: ['3 goblin minis', '1 ogre mini'],
    focus: FOCUS.fight,
  })
  const TRACKER = b.step({
    title: 'Get the initiative tracker ready',
    instruction: 'The DM sets out a blank initiative tracker to record the turn order once combat begins.',
    needs: ['1 initiative tracker'],
    focus: FOCUS.tracker,
  })
  b.step({
    title: 'Ready for combat',
    instruction: 'Everything is in place: when the DM says "roll initiative", combat starts.',
    detail: 'On your turn you can move up to your speed and take one action, in any order.',
    focus: FOCUS.overview,
  })

  b.add({
    id: 'mat',
    kind: 'mat',
    props: { w: COLS, d: ROWS, color: '#e6dcc4', border: '#6b5a44', grid: 1 },
    keys: [{ step: MAT, pos: [0, 0, 0] }],
    info: { title: 'Battle mat (movement grid)', body: 'A 1-inch grid. Each square is 5 feet, so a speed of 30 ft is 6 squares. Moving diagonally also costs 5 feet per square.' },
  })

  ;[
    { pos: [2, 0.02, -5], w: 10.3, d: 0.3 },
    { pos: [7, 0.02, -1.5], w: 0.3, d: 7.3 },
    { pos: [2, 0.02, 2], w: 10.3, d: 0.3 },
    { pos: [-3, 0.02, -3.5], w: 0.3, d: 3 },
    { pos: [-3, 0.02, 1], w: 0.3, d: 2 },
  ].forEach((w, i) =>
    b.add({
      id: `wall-${i}`,
      kind: 'block',
      props: { w: w.w, h: 0.9, d: w.d, color: '#8d8a84' },
      keys: [{ step: WALLS, pos: w.pos as V3, delay: i * 0.22 }],
      info: { title: 'Dungeon wall', body: 'Modular wall sections placed on the grid lines. They block movement and line of sight. This room uses 5, with a 2-square gap for the door.' },
    }),
  )
  ;[[8, 1], [8, 5]].forEach(([cx, cz], i) =>
    b.add({
      id: `pillar-${i}`,
      kind: 'block',
      props: { w: 0.8, h: 1.2, d: 0.8, color: '#a19d95', round: true },
      keys: [{ step: WALLS, pos: cell(cx, cz), delay: 1.2 + i * 0.2 }],
      info: { title: 'Stone pillar', body: 'Fills one square. Standing behind it gives half cover: +2 to AC. There are 2.' },
    }),
  )

  b.add({
    id: 'screen',
    kind: 'screen',
    props: { w: 7.5, h: 2.1, color: '#6b2d2a', label: 'DUNGEON MASTER' },
    keys: [{ step: SCREEN, pos: [0, 0, -7.6] }],
    info: { title: 'DM screen', body: 'Hides the Dungeon Master’s notes, monster stats and dice. The inside has quick-reference rules. There is 1.' },
  })

  heroes.forEach((h, i) => {
    const face: Face = { bg: '#fbf6ea', border: h.color, ink: '#2b241c', title: h.name, lines: h.lines }
    b.add({
      id: `sheet-${i}`,
      kind: 'card',
      props: { w: 1.9, d: 2.5, face },
      keys: [{ step: SHEETS, pos: [(i - (n - 1) / 2) * 3.3, 0, 8.3], delay: i * 0.18 }],
      info: { title: `${h.name}'s character sheet`, body: 'Everything about one hero: Armor Class (how hard they are to hit), hit points, speed, ability modifiers and attacks. Each player has 1.' },
    })
    b.add({
      id: `hero-${i}`,
      kind: 'mini',
      props: { color: h.color, shape: 'hero' },
      keys: [{ step: PARTY, pos: cell(h.cell[0], h.cell[1]), delay: i * 0.2 }],
      info: { title: `${h.name} miniature`, body: 'Shows where this hero stands. A Medium creature fills one 5-foot square. Each player has 1.' },
    })
  })

  b.add({
    id: 'actions',
    kind: 'card',
    props: {
      w: 2.6,
      d: 3.3,
      face: { bg: '#f1e4bd', border: '#6b2d2a', ink: '#3a2418', title: 'On your turn', lines: ['Move: up to your speed', '1 Action (attack, spell, dash…)', '1 Bonus action, if you have one', '1 free object interaction', 'Any time: 1 Reaction per round'] },
    },
    keys: [{ step: SHEETS, pos: [-10.8, 0, 0], delay: 0.9 }],
    info: { title: 'Action economy card', body: 'Each turn you get movement, 1 action and possibly 1 bonus action. You also get 1 reaction per round, usable on anyone’s turn.' },
  })

  const dice = DICE.map((d, i) =>
    b.add({
      id: `d${d.sides}`,
      kind: 'die',
      props: { sides: d.sides, value: d.value, color: d.color, ink: '#ffffff', size: 1.15 },
      keys: [{ step: DICESTEP, pos: [9.6 + (i % 4) * 1.0 + (i > 3 ? 0.5 : 0), 0, i > 3 ? 5.1 : 4.0], rotY: i * 0.5, delay: i * 0.14 }],
      spawnFrom: [11, 2.2, 8],
      tumble: true,
      info: { title: d.name, body: `${d.use} A standard set has 1 of each of the 7 dice.` },
    }),
  )
  const d20 = dice[6]
  const d8 = dice[2]

  const goblins = [[9, 3], [10, 5], [11, 1]].map(([cx, cz], i) =>
    b.add({
      id: `goblin-${i}`,
      kind: 'mini',
      props: { color: '#6f8f3a', shape: 'brute', scale: 0.9 },
      keys: [{ step: MONSTERS, pos: cell(cx, cz), delay: i * 0.2 }],
      info: { title: 'Goblin', body: 'A Small monster run by the DM: AC 15, 7 hit points. It fills one square. This encounter has 3.' },
    }),
  )
  b.add({
    id: 'ogre',
    kind: 'mini',
    props: { color: '#a8703a', shape: 'boss', scale: 1.9 },
    keys: [{ step: MONSTERS, pos: [5, 0.02, -2], delay: 0.8 }],
    info: { title: 'Ogre', body: 'A Large monster: AC 11, 59 hit points. Large creatures fill a 2 by 2 block of squares. This encounter has 1.' },
  })

  const order = [...heroes.map((h) => ({ name: h.name, init: h.init })), { name: 'Goblins', init: 13 }, { name: 'Ogre', init: 7 }].sort((x, y) => y.init - x.init)
  const trackerFace = (filled: boolean): Face => ({
    bg: '#fbf6ea',
    border: '#3a2418',
    title: 'Initiative',
    lines: order.map((o, i) => (filled ? `${i + 1}. ${o.name}  (${o.init})` : `${i + 1}. ________`)),
  })
  const tracker = b.add({
    id: 'tracker',
    kind: 'card',
    props: { w: 2.2, d: 3.4, face: trackerFace(false) },
    keys: [{ step: TRACKER, pos: [10.6, 0, -3.2] }],
    info: { title: 'Initiative tracker', body: 'Lists everyone in combat from highest initiative roll to lowest. Turns go down the list, then start again at the top.' },
  })

  /* ---- Simulate First Turn ------------------------------------------------ */
  const second = order[1].name
  const T1 = b.turn({
    title: 'Roll initiative',
    instruction: 'Everyone rolls a d20 and adds their Dexterity modifier: the Fighter rolls 17 + 1 = 18, the highest, so the Fighter goes first.',
    focus: FOCUS.roll,
    duration: 7,
  })
  d20.keys.push({ step: T1, pos: [1, 0, 6.2], rotY: 0.4, props: { value: 17 } })

  const T2 = b.turn({
    title: 'Record the order',
    instruction: `The DM writes every initiative total on the tracker from highest to lowest: Fighter first, then ${second}.`,
    focus: FOCUS.tracker,
    duration: 5,
  })
  tracker.keys.push({ step: T2, pos: [10.6, 0, -3.2], props: { face: trackerFace(true) } })

  const T3 = b.turn({
    title: 'Move',
    instruction: 'The Fighter has a speed of 30 feet, so they move 6 squares through the door and stop next to a goblin.',
    focus: FOCUS.fight,
    duration: 7,
  })
  for (let k = 0; k < 6; k++)
    b.add({
      id: `path-${k}`,
      kind: 'mat',
      props: { w: 0.92, d: 0.92, color: '#f59e0b', opacity: 0.55, label: `${(k + 1) * 5}`, ink: '#5a3200' },
      keys: [
        { step: T3, pos: cell(3 + k, 3, 0.022), delay: k * 0.18 },
        { step: T3 + 1, pos: cell(3 + k, 3, 0.022), hide: true },
      ],
      info: { title: `${(k + 1) * 5} feet`, body: 'Each square of movement costs 5 feet. You can split your movement before and after your action.' },
    })
  const fighter = b.pieces.find((p) => p.id === 'hero-0') as unknown as PieceSpec<'mini'>
  fighter.keys.push({ step: T3, pos: cell(8, 3), delay: 1.3 })

  const T4 = b.turn({
    title: 'Action: attack',
    instruction: 'The Fighter attacks with a longsword: a d20 roll of 15 plus 5 is 20, which beats the goblin’s Armor Class of 15, so it hits.',
    focus: FOCUS.roll,
    duration: 7,
  })
  d20.keys.push({ step: T4, pos: [0.2, 0, 6.6], rotY: -0.5, props: { value: 15 } })

  const T5 = b.turn({
    title: 'Roll damage',
    instruction: 'A longsword deals 1d8 + 3: the d8 shows 6, so 9 damage drops the 7-hit-point goblin and its mini leaves the mat.',
    focus: FOCUS.fight,
    duration: 7,
  })
  d8.keys.push({ step: T5, pos: [2.2, 0, 3.6], rotY: 0.3, props: { value: 6 } })
  goblins[0].keys.push({ step: T5, pos: [4.6, 0, -6.6], rotY: 0.5, delay: 1.6 })

  b.turn({
    title: 'Bonus action and reaction',
    instruction: 'If a feature gives you a bonus action you may use one too, and once per round you can react, for example with an opportunity attack.',
    focus: FOCUS.actions,
  })

  const T7 = b.turn({
    title: 'Next in initiative',
    instruction: `The Fighter’s turn ends and play moves down the tracker to ${second}; when the goblins’ turn comes, one of them rushes the Fighter.`,
    focus: FOCUS.fight,
  })
  goblins[1].keys.push({ step: T7, pos: cell(9, 4), delay: 1.2 })

  return b.done()
}

export const dnd: GameDef = {
  id: 'dnd',
  meta: {
    title: 'Dungeons & Dragons 5e',
    players: [3, 5],
    defaultPlayers: 4,
    playTime: '30–60 min encounter',
    difficulty: 'Hard',
    blurb: 'A starter combat encounter on the grid.',
    swatch: ['#6b2d2a', '#8d8a84', '#8a5ab0'],
  },
  build,
}
