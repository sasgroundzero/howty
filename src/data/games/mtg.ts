/** Magic: The Gathering (Commander on a two-player table, with Standard differences called out). */
import { Builder } from '../../engine/builder'
import type { Face, GameDef, GameSetup, PieceSpec } from '../../engine/types'
import { CD, CW, SEAT, TCG_FOCUS as FOCUS, ZONE_D, card, handPos, inZone, zone } from './shared'

const BACK: Face = { panel: '#5a3a22', border: '#c9a35a', ink: '#e7c988', glyph: '✦' }
const LAND: Face = { panel: '#3f8a4f', title: 'Forest', glyph: '♣', sub: 'Basic Land' }
const ELF: Face = { panel: '#5a9a48', title: 'Elf Scout', glyph: '1/1', sub: 'Creature · costs 1' }
const BEAST: Face = { panel: '#5a9a48', title: 'Forest Beast', glyph: '4/4', sub: 'Creature · costs 4' }
const SORCERY: Face = { panel: '#4a7a3f', title: 'Sorcery', glyph: '❋', sub: 'Spell · costs 2' }
const ARTIFACT: Face = { panel: '#8a8f98', title: 'Artifact', glyph: '⚙', sub: 'Permanent · costs 2' }
const COMMANDER: Face = { panel: '#b9892c', border: '#fff3c4', title: 'Commander', glyph: '♛', sub: 'Legendary Creature' }
const HAND: Face[] = [LAND, LAND, LAND, ELF, BEAST, SORCERY, ARTIFACT]

const CMD = [-6.3, -2.15] as const
const LIFE = [-6.3, -0.35] as const
const LIB = [6.3, -2.15] as const
const GRAVE = [6.3, -0.35] as const
const EXILE = [6.3, 1.45] as const
const CREATURES = [0, -2.15] as const
const LANDS = [0, -0.35] as const

function build(): GameSetup {
  const b = new Builder()
  const MATS = b.step({
    title: 'Sit across from each other',
    instruction: 'Each player lays out a playmat and brings their own deck: 100 cards for Commander.',
    detail: 'Playing Standard instead? Use a deck of at least 60 cards, 20 life, and skip the Command Zone.',
    needs: ['2 playmats', '2 decks'],
    focus: FOCUS.overview,
  })
  const ZONES = b.step({
    title: 'Learn the zones',
    instruction: 'Your battlefield has a front row for creatures and a back row for lands, with the library, graveyard and exile stacked on the right.',
    detail: 'The Command Zone and your life counter sit on the left.',
    focus: FOCUS.mine,
  })
  const FIRST = b.step({
    title: 'Roll to go first',
    instruction: 'Settle who goes first before shuffling: each player rolls a die and the higher roll chooses who takes the first turn. Here you roll 5 against 2.',
    detail: 'Any method both players agree on works, such as a coin flip.',
    needs: ['1 die each'],
    focus: FOCUS.center,
  })
  const CMDSTEP = b.step({
    title: 'Reveal your commander',
    instruction: 'Put your commander face up in the Command Zone, where you can cast it from later.',
    detail: 'Standard has no commander, so this zone stays empty.',
    needs: ['1 commander each'],
    focus: FOCUS.left,
  })
  const LIBSTEP = b.step({
    title: 'Shuffle your library',
    instruction: 'Shuffle the other 99 cards and place them face down as your library, then let your opponent cut it.',
    needs: ['99 cards each'],
    focus: FOCUS.right,
  })
  const LIFESTEP = b.step({
    title: 'Set your life total',
    instruction: 'Set your life to 40 using two spindown d20s that each show 20.',
    detail: 'In Standard you start at 20 life, so one d20 is enough.',
    needs: ['2 spindown d20s each'],
    focus: FOCUS.left,
  })
  const DRAW = b.step({
    title: 'Draw 7 cards',
    instruction: 'Each player draws 7 cards from the top of their library as their opening hand.',
    detail: 'Not happy? Take a mulligan: shuffle your hand back, draw 7 again, then put 1 card on the bottom for each mulligan taken. In multiplayer Commander the first mulligan is free.',
    needs: ['7 cards each'],
    focus: FOCUS.hand,
  })
  b.step({
    title: 'Ready to play',
    instruction: 'Both battlefields start empty: lands you play will line up untapped in the back row, ready to tap for mana.',
    detail: 'Reduce your opponent from their starting life to 0 to win.',
    focus: FOCUS.overview,
  })

  const hands: PieceSpec<'card'>[][] = [[], []]
  const libs: PieceSpec<'stack'>[] = []

  for (const P of [0, 1]) {
    const s = SEAT[P]
    const zc = P ? '#7a4a3a' : '#4a6a8a'
    b.add({
      id: `mat-${P}`,
      kind: 'mat',
      props: { w: 15, d: 6.4, color: P ? '#3a2622' : '#22303f', border: P ? '#b98a6a' : '#7fa3c9', label: P ? 'OPPONENT' : 'YOU', labelAt: 'corner', ink: 'rgba(255,255,255,0.55)' },
      keys: [{ step: MATS, pos: s.at(0, 0, 0), rotY: s.rot, delay: P * 0.3 }],
      info: { title: `${s.whose} playmat`, body: 'Each player’s own side of the table. Everything you control stays on your mat.' },
    })
    zone(b, 'creatures', ZONES, P, CREATURES[0], CREATURES[1], 10, 'CREATURES & OTHER PERMANENTS', { title: 'battlefield: front row', body: 'Creatures, artifacts and enchantments go here once cast. It starts empty.' }, zc, 0)
    zone(b, 'lands', ZONES, P, LANDS[0], LANDS[1], 10, 'LANDS', { title: 'battlefield: land row', body: 'Lands line up here untapped. You may play 1 land per turn, and turn each sideways (tap it) for 1 mana. It starts empty.' }, zc, 0.15)
    zone(b, 'command', ZONES, P, CMD[0], CMD[1], 1.15, 'COMMAND', { title: 'Command Zone', body: 'Holds your 1 commander, face up. You can cast it from here; each recast costs 2 more. Not used in Standard.' }, '#b9892c', 0.3)
    zone(b, 'life', ZONES, P, LIFE[0], LIFE[1], 1.5, 'LIFE', { title: 'life total', body: 'Commander starts at 40 life, Standard at 20. Track it with spindown d20s.' }, zc, 0.4)
    zone(b, 'library', ZONES, P, LIB[0], LIB[1], 1.15, 'LIBRARY', { title: 'library', body: 'Your face-down deck: 99 cards plus the commander, or at least 60 in Standard. Draw 1 each turn.' }, zc, 0.5)
    zone(b, 'graveyard', ZONES, P, GRAVE[0], GRAVE[1], 1.15, 'GRAVEYARD', { title: 'graveyard', body: 'Your face-up discard pile: used spells and destroyed permanents go here. Starts empty.' }, zc, 0.6)
    zone(b, 'exile', ZONES, P, EXILE[0], EXILE[1], 1.15, 'EXILE', { title: 'exile zone', body: 'Cards removed from the game, face up. Much harder to get back than the graveyard. Starts empty.' }, zc, 0.7)

    b.add({
      id: `commander-${P}`,
      kind: 'card',
      props: card(COMMANDER, BACK, true),
      keys: [{ step: CMDSTEP, pos: inZone(P, CMD[0], CMD[1]), rotY: s.rot, delay: P * 0.4 }],
      info: { title: `${s.whose} commander`, body: 'A legendary creature that leads the deck. It starts face up in the Command Zone. Each player has exactly 1.' },
    })

    const libAt = inZone(P, LIB[0], LIB[1])
    libs[P] = b.add({
      id: `lib-${P}`,
      kind: 'stack',
      props: { w: CW, d: CD, count: 99, face: BACK, per: 0.008 },
      keys: [
        { step: LIBSTEP, pos: libAt, rotY: s.rot, delay: P * 0.3 },
        { step: DRAW, pos: libAt, rotY: s.rot, props: { count: 92 } },
      ],
      info: { title: `${s.whose} library`, body: '99 cards, shuffled and face down. After the opening hand of 7, 92 remain.' },
    })

    for (let i = 0; i < 2; i++)
      b.add({
        id: `life-${P}-${i}`,
        kind: 'die',
        props: { sides: 20, value: 20, color: P ? '#8a3a2a' : '#2f5f9a', ink: '#ffffff' },
        keys: [{ step: LIFESTEP, pos: s.at(LIFE[0] - 0.36 + i * 0.72, 0.03, LIFE[1] - 0.15), rotY: s.rot + i, delay: P * 0.4 + i * 0.15 }],
        info: { title: 'Spindown d20 life counter', body: 'Two dice showing 20 each make the 40 starting life for Commander. Turn them down as you take damage.' },
      })

    b.add({
      id: `first-${P}`,
      kind: 'die',
      props: { sides: 6, value: P ? 2 : 5, color: '#f7f1e3', ink: '#2e2622', size: 0.85 },
      keys: [{ step: FIRST, pos: [P ? -1.2 : 1.2, 0, P ? -0.3 : 0.3], rotY: P ? -0.4 : 0.5, delay: P * 0.3 }],
      spawnFrom: [P ? -1.2 : 1.2, 1.4, P ? -3 : 3],
      tumble: true,
      info: { title: 'First-player die', body: 'Roll to decide who goes first. In a two-player game, whoever goes first skips their first draw.' },
    })

    HAND.forEach((face, j) =>
      hands[P].push(
        b.add({
          id: `hand-${P}-${j}`,
          kind: 'card',
          props: card(face, BACK, P === 0),
          keys: [{ step: DRAW, pos: handPos(P, j), rotY: s.rot, delay: P * 0.4 + j * 0.13 }],
          spawnFrom: [libAt[0], 0.9, libAt[2]],
          info: { title: P ? 'Opponent’s card' : `${face.title} card`, body: P ? 'Part of the opponent’s opening hand of 7. You cannot see it.' : `${face.sub}. Part of your opening hand of 7.` },
        }),
      ),
    )
  }
  void ZONE_D

  /* ---- Simulate First Turn ------------------------------------------------ */
  const me = SEAT[0]
  b.turn({
    title: 'Untap and upkeep',
    instruction: 'Every turn starts by untapping all your cards, then the upkeep step, though on turn one there is nothing to untap yet.',
    focus: FOCUS.mine,
    duration: 5,
  })
  b.turn({
    title: 'Draw step',
    instruction: 'Normally you now draw a card, but in a two-player game whoever goes first skips this very first draw.',
    focus: FOCUS.right,
    duration: 5,
  })
  const landAt = me.at(-4.2, 0.03, LANDS[1] - 0.15)
  const T3 = b.turn({
    title: 'Play a land',
    instruction: 'In your main phase, put one land from your hand onto the back row, untapped. You may play only one land per turn.',
    focus: FOCUS.mine,
  })
  hands[0][0].keys.push({ step: T3, pos: landAt, delay: 0.6 })

  const T4 = b.turn({
    title: 'Tap for mana',
    instruction: 'Turn the Forest sideways to tap it, which gives you 1 green mana to spend right now.',
    focus: FOCUS.mine,
  })
  hands[0][0].keys.push({ step: T4, pos: landAt, rotY: -Math.PI / 2, delay: 0.5 })

  const T5 = b.turn({
    title: 'Cast a creature',
    instruction: 'Spend that 1 mana to cast the Elf Scout onto the front row. It cannot attack until your next turn.',
    focus: FOCUS.mine,
    duration: 7,
  })
  hands[0][3].keys.push({ step: T5, pos: me.at(-4.2, 0.03, CREATURES[1] - 0.15), delay: 0.6 })

  const lib1 = inZone(1, LIB[0], LIB[1])
  const T6 = b.turn({
    title: 'Pass the turn',
    instruction: 'With nothing to attack with, you end your turn, and your opponent untaps and draws a card.',
    focus: FOCUS.theirs,
    duration: 7,
  })
  libs[1].keys.push({ step: T6, pos: lib1, rotY: Math.PI, props: { count: 91 } })
  b.add({
    id: 'drawn-1',
    kind: 'card',
    props: card(BACK, BACK, false),
    keys: [{ step: T6, pos: handPos(1, 7), rotY: Math.PI, delay: 0.8 }],
    spawnFrom: [lib1[0], 0.9, lib1[2]],
    info: { title: 'Opponent’s card', body: 'The card your opponent drew for their turn.' },
  })

  const T7 = b.turn({
    title: 'Opponent plays a land',
    instruction: 'Your opponent plays their own land, and turns keep alternating: untap, draw, play a land, cast spells, attack.',
    focus: FOCUS.overview,
    duration: 7,
  })
  hands[1][0].keys.push({ step: T7, pos: SEAT[1].at(-4.2, 0.03, LANDS[1] - 0.15), rotY: Math.PI, delay: 0.6, props: { faceUp: true } })

  return b.done({ w: 34, d: 21, tint: '#e9dcc8' })
}

export const mtg: GameDef = {
  id: 'mtg',
  meta: {
    title: 'Magic: The Gathering',
    players: [2, 2],
    defaultPlayers: 2,
    playTime: '20–60 min',
    difficulty: 'Hard',
    blurb: 'Library, lands, creatures and a 7-card hand.',
    swatch: ['#5a3a22', '#3f8a4f', '#b9892c'],
  },
  build,
}
