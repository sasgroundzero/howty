/** Catan (base game, 3 to 4 players): setup script and first-turn simulation. */
import type { AnyPiece, Face, Focus, GameDef, GameSetup, Key, StepDef, V3 } from '../../engine/types'
import {
  COAST, HARBOR_SLOTS, HARBOR_TYPES, PLAYERS, RES, RES_ORDER, SEATS, TERRAIN, TILES, TILE_TOP, FRAME_TOP, VERTS,
  bankPos, openingPlacements, pips, seatWorld, type Resource,
} from './catanBoard'

const resFace = (r: Resource): Face => ({ panel: RES[r].color, art: `catan:${r}`, sub: RES[r].label })
const DEV_BACK: Face = { panel: '#4b3b6b', border: '#d9c88f', ink: '#d9c88f', glyph: '?', sub: 'Development' }

const S = {
  SEATS: 0, FRAME: 1, TILES: 2, TOKENS: 3, HARBORS: 4, ROBBER: 5, BANK: 6,
  SUPPLY: 7, DICE: 8, ROUND1: 9, ROUND2: 10, RESOURCES: 11, READY: 12,
}
const FOCUS: Record<string, Focus> = {
  overview: { pos: [2, 28, 22], target: [2, 0, 0.6] },
  board: { pos: [0, 14.5, 11], target: [0, 0, 0.4] },
  close: { pos: [0, 11, 8], target: [0, 0, 0.2] },
  robber: { pos: [2.2, 5.2, 5.2], target: [0, 0.2, 0] },
  bank: { pos: [15.7, 11.5, 10], target: [15.7, 0, -0.4] },
  dice: { pos: [6, 6.5, 13], target: [5.8, 0, 6.3] },
}

function buildCatan(n: number): GameSetup {
  const players = PLAYERS.slice(0, n)
  const first = players[0].name
  const last = players[n - 1].name
  const placements = openingPlacements(n)

  const steps: StepDef[] = [
    {
      title: 'Pick colors and seats',
      instruction: `Each of the ${n} players picks a color and sits on one side of the table.`,
      detail: 'The colored mats show where each player keeps their pieces.',
      needs: [`${n} players`],
      focus: FOCUS.overview,
    },
    {
      title: 'Build the sea frame',
      instruction: 'Snap the 6 blue frame pieces together into one big hexagon in the middle of the table.',
      detail: 'The frame keeps the island from sliding apart while you play.',
      needs: ['6 frame pieces'],
      focus: FOCUS.board,
    },
    {
      title: 'Lay out the island',
      instruction: 'Fill the frame with the 19 land hexes, with the desert in the center.',
      detail: 'This is the starter layout. Once you know the game, shuffle the hexes for a new map every time.',
      needs: ['4 forest', '4 pasture', '4 fields', '3 hills', '3 mountains', '1 desert'],
      focus: FOCUS.board,
    },
    {
      title: 'Add the number tokens',
      instruction: 'Put one number token on every land hex except the desert, spiraling in from a corner.',
      detail: 'The red 6s and 8s get rolled most often, so they should never sit next to each other.',
      needs: ['18 number tokens'],
      focus: FOCUS.close,
    },
    {
      title: 'Find the harbors',
      instruction: 'Nine harbors sit around the coast. Build next to one to trade at a better rate.',
      detail: 'Four harbors trade any 3 matching cards for 1. Five trade 2 of one specific resource for 1.',
      needs: ['4 any-resource harbors', '5 special harbors'],
      focus: FOCUS.board,
    },
    {
      title: 'Place the robber',
      instruction: 'Stand the gray robber on the desert.',
      detail: 'Whatever hex he stands on produces nothing. He moves when someone rolls a 7.',
      needs: ['1 robber'],
      focus: FOCUS.robber,
    },
    {
      title: 'Set up the bank',
      instruction: 'Sort the resource cards into 5 face-up piles and shuffle the development cards into a face-down pile.',
      detail: 'Set the Longest Road and Largest Army bonus cards next to them.',
      needs: ['95 resource cards', '25 development cards', '2 bonus cards'],
      focus: FOCUS.bank,
    },
    {
      title: 'Hand out the pieces',
      instruction: 'Give each player the 5 settlements, 4 cities and 15 roads in their color, plus a building costs card.',
      detail: n === 3 ? 'The fourth color stays in the box.' : 'All four colors are in play.',
      needs: ['5 settlements each', '4 cities each', '15 roads each', '1 costs card each'],
      focus: FOCUS.overview,
    },
    {
      title: 'Roll for first player',
      instruction: `Everyone rolls both dice and the highest roll goes first. Here ${first} rolls an 11.`,
      detail: 'Turns then go clockwise around the table.',
      needs: ['2 dice'],
      focus: FOCUS.dice,
    },
    {
      title: 'Round 1: first settlement',
      instruction: `Starting with ${first} and going clockwise, each player places 1 settlement on a corner and 1 road touching it.`,
      detail: 'Settlements can never sit on neighboring corners. Leave at least one empty corner between them.',
      needs: ['1 settlement each', '1 road each'],
      focus: FOCUS.board,
    },
    {
      title: 'Round 2: reverse order',
      instruction: `Now go backwards, starting with ${last}: each player places a second settlement and road.`,
      detail: `Yes, ${last} places twice in a row. That makes up for picking last in round 1.`,
      needs: ['1 settlement each', '1 road each'],
      focus: FOCUS.board,
    },
    {
      title: 'Collect starting cards',
      instruction: 'Each player takes 1 resource card for every land hex touching their second settlement.',
      detail: 'Keep your cards hidden in your hand during a real game. They are face up here so you can see them.',
      needs: ['Up to 3 cards each'],
      focus: FOCUS.overview,
    },
    {
      title: 'Ready to play',
      instruction: `${first} starts by rolling the dice. Every settlement touching a hex with that number earns its resource.`,
      detail: 'Spend resources to build roads, settlements and cities. First to 10 points wins.',
      needs: [],
      focus: FOCUS.overview,
    },
  ]

  const pieces: AnyPiece[] = []

  /* Player mats */
  players.forEach((p, pi) =>
    pieces.push({
      id: `mat-${pi}`,
      keys: [{ step: S.SEATS, pos: seatWorld(pi, 0, 0, 0), rotY: SEATS[pi].rot, delay: pi * 0.18 }],
      info: { title: `${p.name}'s area`, body: `${p.name} sits here and keeps their unbuilt pieces and cards on this side.` },
      kind: 'mat', props: { w: 6.3, d: 2.95, color: p.tint, border: p.color === '#f4f1e8' ? '#b9b3a3' : p.color, label: `${p.name.toUpperCase()}  ·  PLAYER ${pi + 1}`, labelAt: 'corner' },
    }),
  )

  /* Sea frame + water */
  for (let k = 0; k < 6; k++)
    pieces.push({
      id: `frame-${k}`,
      keys: [{ step: S.FRAME, pos: [0, 0, 0], delay: k * 0.14 }],
      info: { title: 'Sea frame', body: 'Six pieces that lock together around the island. There are 6 in the box.' },
      kind: 'catanFrame', props: { k },
    })
  pieces.push({
    id: 'water',
    keys: [{ step: S.FRAME, pos: [0, 0, 0], delay: 0.9 }],
    kind: 'catanWater', props: {},
  })

  /* Land hexes */
  TILES.forEach((t, i) => {
    const T = TERRAIN[t.terrain]
    pieces.push({
      id: `tile-${i}`,
      keys: [{ step: S.TILES, pos: [t.cx, 0.04, t.cz], delay: i * 0.075 }],
      info: {
        title: `${T.label} hex`,
        body: T.res
          ? `Produces ${RES[T.res].label} for every settlement touching it. There are ${T.count} in the game.`
          : 'Produces nothing. The robber starts here. There is only 1.',
      },
      kind: 'catanTile', props: { terrain: t.terrain, seed: i },
    })
  })

  /* Number tokens */
  TILES.forEach((t, i) => {
    if (!t.token) return
    const ways = pips(t.token)
    pieces.push({
      id: `token-${i}`,
      keys: [{ step: S.TOKENS, pos: [t.cx, TILE_TOP, t.cz], rotY: Math.PI / 2, delay: i * 0.1 }],
      info: {
        title: `Number token ${t.token}`,
        body: `When the dice add up to ${t.token}, this hex pays out. The ${ways} ${ways === 1 ? 'dot means' : 'dots mean'} ${ways} in 36 rolls. There are 18 tokens, one per land hex.`,
      },
      kind: 'catanNumber', props: { n: t.token! },
    })
  })

  /* Harbors */
  HARBOR_SLOTS.forEach((slot, i) => {
    const e = COAST[slot]
    const type = HARBOR_TYPES[i]
    const px = e.mx + e.dx * 0.95
    const pz = e.mz + e.dz * 0.95
    pieces.push({
      id: `harbor-${i}`,
      keys: [{ step: S.HARBORS, pos: [px, FRAME_TOP, pz], delay: i * 0.12 }],
      info: type
        ? {
            title: `${RES[type].label} harbor (2:1)`,
            body: `Build on one of its two corners and you can swap 2 ${RES[type].label} for any 1 card. There are 5 of these, one per resource.`,
          }
        : {
            title: 'Any-resource harbor (3:1)',
            body: 'Build on one of its two corners and you can swap any 3 matching cards for 1 card you want. There are 4.',
          },
      kind: 'catanHarbor', props: { type, planks: [[e.ax - px, e.az - pz], [e.bx - px, e.bz - pz]] },
    })
  })

  /* Robber */
  pieces.push({
    id: 'robber',
    keys: [{ step: S.ROBBER, pos: [0, TILE_TOP, 0] }],
    info: { title: 'Robber', body: 'Blocks the hex he stands on so it produces nothing. Moves when a 7 is rolled. There is 1.' },
    kind: 'catanPiece', props: { shape: 'robber', color: '#4a4a52' },
  })

  /* Bank */
  const takenFromBank: Record<Resource, number> = { lumber: 0, brick: 0, wool: 0, grain: 0, ore: 0 }
  const hands: Resource[][] = players.map(() => [])
  placements
    .filter((p) => p.round === 2)
    .forEach((p) =>
      p.v.tiles.forEach((ti) => {
        const res = TERRAIN[TILES[ti].terrain].res
        if (res) {
          hands[p.player].push(res)
          takenFromBank[res]++
        }
      }),
    )

  pieces.push({
    id: 'bank-mat',
    keys: [{ step: S.BANK, pos: [15.75, 0, -0.6] }],
    info: { title: 'The bank', body: 'The shared supply of cards. Nobody owns it. Put it where everyone can reach.' },
    kind: 'mat', props: { w: 3.9, d: 8.6, color: '#3c5a4c', border: 'rgba(255,255,255,0.35)', ink: 'rgba(255,255,255,0.7)', label: 'BANK', labelAt: 'bottom' },
  })
  RES_ORDER.forEach((r, i) =>
    pieces.push({
      id: `bank-${r}`,
      keys: [
        { step: S.BANK, pos: bankPos(i), delay: 0.25 + i * 0.16 },
        { step: S.RESOURCES, pos: bankPos(i), props: { count: 19 - takenFromBank[r] } },
      ],
      info: {
        title: `${RES[r].label} cards`,
        body: `There are 19 ${RES[r].label} cards in the bank. Nobody starts with any until the second settlement is placed.`,
      },
      kind: 'stack', props: { w: 0.85, d: 1.2, count: 19, face: resFace(r), per: 0.014 },
    }),
  )
  pieces.push({
    id: 'bank-dev',
    keys: [{ step: S.BANK, pos: [16.6, 0.02, -3.3], delay: 1.1 }],
    info: { title: 'Development cards', body: 'A shuffled, face-down pile of 25. You can buy one on your turn for a surprise bonus. Nobody starts with any.' },
    kind: 'stack', props: { w: 0.85, d: 1.2, count: 25, face: DEV_BACK, per: 0.014 },
  })
  ;[
    { id: 'longest-road', label: 'Longest Road', z: -1.5, body: 'A bonus card worth 2 points. Goes to the first player with a road at least 5 pieces long. There is 1.' },
    { id: 'largest-army', label: 'Largest Army', z: 0.3, body: 'A bonus card worth 2 points. Goes to the first player to play 3 knight cards. There is 1.' },
  ].forEach((c, i) =>
    pieces.push({
      id: c.id,
      keys: [{ step: S.BANK, pos: [16.6, 0.02, c.z], delay: 1.3 + i * 0.16 }],
      info: { title: c.label, body: c.body },
      kind: 'card', props: { w: 1.0, d: 1.35, face: { bg: '#f4e8c8', border: '#8a6a34', ink: '#5a431c', title: c.label, glyph: '+2' } },
    }),
  )

  /* Player pieces: supply first, then two of each move onto the board */
  players.forEach((p, pi) => {
    const rot = SEATS[pi].rot
    const mine = placements.filter((pl) => pl.player === pi)
    const base = pi * 0.35

    for (let j = 0; j < 5; j++) {
      const keys: Key<'catanPiece'>[] = [{ step: S.SUPPLY, pos: seatWorld(pi, -2.55 + j * 0.42, 0.02, -0.8), rotY: rot, delay: base + j * 0.05 }]
      const pl = mine[j]
      if (pl) keys.push({ step: pl.round === 1 ? S.ROUND1 : S.ROUND2, pos: [pl.v.x, TILE_TOP, pl.v.z], rotY: 0, delay: pl.order * 1.15 })
      pieces.push({
        id: `settlement-${pi}-${j}`,
        keys,
        info: {
          title: `${p.name} settlement`,
          body: 'A small house worth 1 point. It collects 1 card from each hex it touches when that hex number is rolled. Each player gets 5 and starts with 2 on the board.',
        },
        kind: 'catanPiece', props: { shape: 'settlement', color: p.color },
      })
    }

    for (let j = 0; j < 4; j++)
      pieces.push({
        id: `city-${pi}-${j}`,
        keys: [{ step: S.SUPPLY, pos: seatWorld(pi, 0.05 + j * 0.52, 0.02, -0.8), rotY: rot, delay: base + 0.3 + j * 0.05 }],
        info: {
          title: `${p.name} city`,
          body: 'An upgrade that replaces a settlement. Worth 2 points and collects 2 cards instead of 1. Each player gets 4 and starts with none on the board.',
        },
        kind: 'catanPiece', props: { shape: 'city', color: p.color },
      })

    for (let j = 0; j < 15; j++) {
      const keys: Key<'catanPiece'>[] = [
        { step: S.SUPPLY, pos: seatWorld(pi, -2.3 + (j % 5) * 0.62, 0.02, -0.3 + Math.floor(j / 5) * 0.22), rotY: rot, delay: base + 0.5 + j * 0.03 },
      ]
      const pl = mine[j]
      if (pl)
        keys.push({
          step: pl.round === 1 ? S.ROUND1 : S.ROUND2,
          pos: [(pl.v.x + pl.w.x) / 2, TILE_TOP, (pl.v.z + pl.w.z) / 2],
          rotY: -Math.atan2(pl.w.z - pl.v.z, pl.w.x - pl.v.x),
          delay: pl.order * 1.15 + 0.5,
        })
      pieces.push({
        id: `road-${pi}-${j}`,
        keys,
        info: {
          title: `${p.name} road`,
          body: 'A stick that sits on the line between two hexes. Roads connect your settlements and let you reach new corners. Each player gets 15 and starts with 2 on the board.',
        },
        kind: 'catanPiece', props: { shape: 'road', color: p.color },
      })
    }

    pieces.push({
      id: `costs-${pi}`,
      keys: [{ step: S.SUPPLY, pos: seatWorld(pi, 2.45, 0.02, 0.25), rotY: rot, delay: base + 0.9 }],
      info: { title: 'Building costs card', body: 'A cheat sheet showing which cards you pay to build each thing. Each player gets 1.' },
      kind: 'card', props: { w: 0.85, d: 1.15, face: { art: 'catan:costs' } },
    })

    const turn = placements.find((pl) => pl.player === pi && pl.round === 2)!.order
    hands[pi].forEach((r, j) => {
      const from = bankPos(RES_ORDER.indexOf(r))
      pieces.push({
        id: `hand-${pi}-${j}`,
        keys: [{ step: S.RESOURCES, pos: seatWorld(pi, -2.0 + j * 0.5, 0.03, 0.9), rotY: rot, delay: turn * 0.7 + j * 0.22 }],
        spawnFrom: [from[0], 0.5, from[2]],
        info: {
          title: `${RES[r].label} card`,
          body: `Part of ${p.name}'s starting hand. You get 1 card for each land hex touching your second settlement, so up to 3.`,
        },
        kind: 'card', props: { w: 0.42, d: 0.6, face: resFace(r) },
      })
    })
  })

  /* Dice */
  ;[
    { id: 'die-a', pos: [5.45, 0, 6.5] as V3, rot: 0.3, top: 6, color: '#f2d15c', pip: '#3a2a12', delay: 0 },
    { id: 'die-b', pos: [6.25, 0, 6.15] as V3, rot: -0.5, top: 5, color: '#c8483f', pip: '#fff5e6', delay: 0.12 },
  ].forEach((d) =>
    pieces.push({
      id: d.id,
      keys: [{ step: S.DICE, pos: d.pos, rotY: d.rot, delay: d.delay }],
      spawnFrom: [1.5, 1.2, 9],
      tumble: true,
      info: { title: 'Dice', body: 'Roll both at the start of every turn and add them up. That number decides which hexes pay out. There are 2, shared by everyone.' },
      kind: 'die', props: { sides: 6, value: d.top, color: d.color, ink: d.pip },
    }),
  )

/* ---- Simulate First Turn ------------------------------------------------ */
  const setupCount = steps.length
  const turn = (s: StepDef) => steps.push({ duration: 6, ...s }) - 1
  const piece = (id: string) => pieces.find((q) => q.id === id) as unknown as { keys: Key[] }
  const mine0 = placements.filter((pl) => pl.player === 0)
  // Roll the best number next to one of the first player's settlements
  const rolled = mine0
    .flatMap((pl) => pl.v.tiles.map((ti) => TILES[ti].token ?? 0))
    .sort((a, b) => pips(b) - pips(a) || a - b)[0]
  const a = Math.min(6, rolled - 1)

  const T_ROLL = turn({
    title: `${first} rolls the dice`,
    instruction: `${first} rolls both dice and gets ${a} + ${rolled - a} = ${rolled}.`,
    focus: FOCUS.dice,
  })
  piece('die-a').keys.push({ step: T_ROLL, pos: [4.9, 0, 6.9], rotY: 0.9, props: { value: a } })
  piece('die-b').keys.push({ step: T_ROLL, pos: [6.6, 0, 6.6], rotY: -0.2, delay: 0.1, props: { value: rolled - a } })

  const T_PAY = turn({
    title: 'Hexes pay out',
    instruction: `Every settlement touching a hex numbered ${rolled} collects one card of that hex's resource from the bank.`,
    focus: FOCUS.overview,
    duration: 7,
  })
  const owned: { id: string; res: Resource }[][] = hands.map((h, pi) => h.map((res, j) => ({ id: `hand-${pi}-${j}`, res })))
  placements.forEach((pl) =>
    pl.v.tiles.forEach((ti) => {
      const res = TERRAIN[TILES[ti].terrain].res
      if (TILES[ti].token !== rolled || !res) return
      const from = bankPos(RES_ORDER.indexOf(res))
      const slot = owned[pl.player].length
      const id = `pay-${pl.player}-${slot}`
      owned[pl.player].push({ id, res })
      pieces.push({
        id,
        kind: 'card',
        props: { w: 0.42, d: 0.6, face: resFace(res) },
        keys: [{ step: T_PAY, pos: seatWorld(pl.player, -2.0 + slot * 0.5, 0.03, 0.9), rotY: SEATS[pl.player].rot, delay: 0.6 + pl.player * 0.5 }],
        spawnFrom: [from[0], 0.5, from[2]],
        info: { title: `${RES[res].label} card`, body: `Paid out by the bank because a ${rolled} was rolled next to this player's settlement.` },
      })
    }),
  )

  turn({
    title: 'Trade',
    instruction: `${first} may now swap cards with other players, or trade 4 matching cards to the bank for any 1.`,
    focus: FOCUS.bank,
    duration: 5,
  })

  const lumber = owned[0].find((c) => c.res === 'lumber')
  const brick = owned[0].find((c) => c.res === 'brick')
  const canBuild = !!lumber && !!brick
  const T_BUILD = turn({
    title: canBuild ? 'Build a road' : 'Nothing to build yet',
    instruction: canBuild
      ? `${first} pays 1 Lumber and 1 Brick to the bank and adds a road to the end of their network.`
      : `${first} cannot afford anything yet (a road costs 1 Lumber and 1 Brick), so they keep their cards.`,
    focus: FOCUS.close,
    duration: 7,
  })
  if (canBuild) {
    ;[lumber!, brick!].forEach((c, i) => {
      const to = bankPos(RES_ORDER.indexOf(c.res))
      piece(c.id).keys.push({ step: T_BUILD, pos: [to[0], 0.3, to[2]], delay: i * 0.3 })
    })
    const pl = mine0[1]
    const next = VERTS[pl.w.adj.find((id) => id !== pl.v.id)!]
    piece('road-0-2').keys.push({
      step: T_BUILD,
      pos: [(pl.w.x + next.x) / 2, TILE_TOP, (pl.w.z + next.z) / 2],
      rotY: -Math.atan2(next.z - pl.w.z, next.x - pl.w.x),
      delay: 1.2,
    })
  }

  turn({
    title: 'Watch out for 7',
    instruction: 'If a 7 is rolled, nobody collects. Anyone holding more than 7 cards discards half (rounded down), then the roller moves the robber to another hex and steals a card from a player there.',
    focus: FOCUS.robber,
  })

  const T_PASS = turn({
    title: 'Pass the dice',
    instruction: `${first} hands the dice clockwise to ${players[1].name}, and play continues until someone reaches 10 points.`,
    focus: FOCUS.overview,
  })
  piece('die-a').keys.push({ step: T_PASS, pos: seatWorld(1, 1.6, 0, -1.9), rotY: 0.4 })
  piece('die-b').keys.push({ step: T_PASS, pos: seatWorld(1, 2.3, 0, -1.9), rotY: -0.3, delay: 0.1 })
  return { table: { w: 38, d: 23 }, steps, setupCount, pieces }
}

export const catan: GameDef = {
  id: 'catan',
  meta: {
    title: 'Catan',
    players: [3, 4],
    defaultPlayers: 4,
    playTime: '60–90 min',
    difficulty: 'Medium',
    blurb: 'Trade, build and settle the island.',
    swatch: ['#c8643b', '#e8c547', '#2f7a3b'],
  },
  build: buildCatan,
}
