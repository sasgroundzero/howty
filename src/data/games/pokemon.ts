/** Pokémon Trading Card Game: two-player playmat zones, opening hand, Active/Bench and Prize cards. */
import { Builder } from '../../engine/builder'
import type { Face, GameDef, GameSetup, PieceSpec } from '../../engine/types'
import { CD, CW, SEAT, TCG_FOCUS as FOCUS, card, handPos, inZone, zone } from './shared'

const BACK: Face = { panel: '#27408b', border: '#f2c94c', ink: '#f2c94c', glyph: '★' }
const basic = (type: string, color: string, hp: number): Face => ({ panel: color, title: 'Basic Pokémon', glyph: '◆', sub: `${type} · HP ${hp}` })
const ENERGY: Face = { panel: '#d9534a', title: 'Energy', glyph: '✹', sub: 'Basic Energy' }
const TRAINER: Face = { panel: '#7d8590', title: 'Trainer', glyph: '✚', sub: 'Item' }
const STAGE1: Face = { panel: '#5a4a8a', title: 'Stage 1', glyph: '▲', sub: 'Evolves from Basic' }
const HAND: Face[] = [basic('Grass', '#4a9a55', 70), basic('Fire', '#d0782f', 60), basic('Water', '#3f7fc0', 60), ENERGY, ENERGY, TRAINER, STAGE1]

const ACTIVE = [0, -2.15] as const
const BENCH = (i: number) => [-2.4 + i * 1.2, -0.35] as const
const DECK = [6.3, -2.15] as const
const DISCARD = [6.3, -0.35] as const
const PRIZE = (i: number) => [-6.55 + (i % 2) * 1.1, -2.2 + Math.floor(i / 2) * 1.4] as const

function build(): GameSetup {
  const b = new Builder()
  const MATS = b.step({
    title: 'Sit across from each other',
    instruction: 'Both players lay out a playmat on their side of the table and shake hands.',
    detail: 'Pokémon TCG is a two-player game. Each player brings their own 60-card deck.',
    needs: ['2 playmats', '2 decks of 60 cards'],
    focus: FOCUS.overview,
  })
  const ZONES = b.step({
    title: 'Learn the zones',
    instruction: 'Each mat has an Active Spot in front, 5 Bench spots behind it, Prize cards on the left, and the deck and discard pile on the right.',
    detail: 'A Stadium card, when one is played, sits between the two players and affects both.',
    focus: FOCUS.mine,
  })
  const COIN = b.step({
    title: 'Flip a coin',
    instruction: 'Flip a coin: the winner decides who goes first. Keep damage counters nearby.',
    detail: 'The player who goes first cannot attack or play a Supporter card on their first turn.',
    needs: ['1 coin', 'Damage counters'],
    focus: FOCUS.center,
  })
  const DECKS = b.step({
    title: 'Shuffle and place your deck',
    instruction: 'Shuffle your 60-card deck well and put it face down on the Deck zone.',
    needs: ['60 cards each'],
    focus: FOCUS.right,
  })
  const DRAW = b.step({
    title: 'Draw 7 cards',
    instruction: 'Each player draws the top 7 cards of their deck as their opening hand.',
    detail: 'Keep your hand hidden from your opponent. Yours is face up here so you can see it.',
    needs: ['7 cards each'],
    focus: FOCUS.hand,
  })
  const ACT = b.step({
    title: 'Choose your Active Pokémon',
    instruction: 'Pick a Basic Pokémon from your hand and put it face down in your Active Spot.',
    detail: 'No Basic in your hand? Show it to your opponent, shuffle it back, and draw 7 again. Each time you do this, your opponent may draw 1 extra card.',
    needs: ['1 Basic Pokémon each'],
    focus: FOCUS.center,
  })
  const BENCHSTEP = b.step({
    title: 'Fill your Bench',
    instruction: 'Put any other Basic Pokémon you want face down on your Bench, up to 5.',
    needs: ['Up to 5 Basic Pokémon each'],
    focus: FOCUS.mine,
  })
  const PRIZES = b.step({
    title: 'Set aside 6 Prize cards',
    instruction: 'Take the top 6 cards of your deck and lay them face down on the left as your Prize cards, without looking.',
    detail: 'You take one Prize card each time you Knock Out an opponent’s Pokémon. Take all 6 and you win.',
    needs: ['6 Prize cards each'],
    focus: FOCUS.left,
  })
  const FLIP = b.step({
    title: 'Reveal your Pokémon',
    instruction: 'Both players flip their Active and Benched Pokémon face up, and the game begins.',
    focus: FOCUS.overview,
  })

  const hands: PieceSpec<'card'>[][] = [[], []]
  const decks: PieceSpec<'stack'>[] = []

  for (const P of [0, 1]) {
    const s = SEAT[P]
    const zc = P ? '#3b5a8a' : '#3d7a5c'
    b.add({
      id: `mat-${P}`,
      kind: 'mat',
      props: { w: 15, d: 6.4, color: P ? '#27364f' : '#243f33', border: P ? '#6f8fc4' : '#77b08e', label: P ? 'OPPONENT' : 'YOU', labelAt: 'corner', ink: 'rgba(255,255,255,0.55)' },
      keys: [{ step: MATS, pos: s.at(0, 0, 0), rotY: s.rot, delay: P * 0.3 }],
      info: { title: `${s.whose} playmat`, body: 'Marks where each kind of card goes. Each player has their own side.' },
    })
    zone(b, 'active', ZONES, P, ACTIVE[0], ACTIVE[1], 1.15, 'ACTIVE', { title: 'Active Spot', body: 'Your 1 fighting Pokémon. Only the Active Pokémon can attack or be attacked. You must always have exactly 1.' }, zc, 0)
    for (let i = 0; i < 5; i++)
      zone(b, `bench${i}`, ZONES, P, BENCH(i)[0], BENCH(i)[1], 1.1, 'BENCH', { title: `Bench spot ${i + 1}`, body: '5 Bench spots: Pokémon waiting here can swap in when the Active Pokémon retreats or is Knocked Out. Start with 0 to 5 Basics.' }, zc, 0.2 + i * 0.08)
    zone(b, 'deckzone', ZONES, P, DECK[0], DECK[1], 1.15, 'DECK', { title: 'Deck zone', body: 'Exactly 60 cards, face down. Draw 1 card at the start of each of your turns. If you cannot draw, you lose.' }, zc, 0.7)
    zone(b, 'discard', ZONES, P, DISCARD[0], DISCARD[1], 1.15, 'DISCARD', { title: 'Discard pile', body: 'Used Trainer cards, Knocked Out Pokémon and their attached cards go here, face up. Starts empty.' }, zc, 0.8)
    b.add({
      id: `prizezone-${P}`,
      kind: 'mat',
      props: { w: 2.4, d: 4.5, color: zc, opacity: 0.3, border: '#ffffff', dashed: true, label: 'PRIZES', labelAt: 'bottom', ink: '#ffffff' },
      keys: [{ step: ZONES, pos: s.at(-6.0, 0.022, -0.75), rotY: s.rot, delay: 0.9 }],
      info: { title: `${s.whose} Prize cards`, body: '6 Prize Cards: take 1 each time you Knock Out an opponent’s Pokémon. Take your last one and you win.' },
    })

    const deckAt = inZone(P, DECK[0], DECK[1])
    decks[P] = b.add({
      id: `deck-${P}`,
      kind: 'stack',
      props: { w: CW, d: CD, count: 60, face: BACK },
      keys: [
        { step: DECKS, pos: deckAt, rotY: s.rot, delay: P * 0.3 },
        { step: DRAW, pos: deckAt, rotY: s.rot, props: { count: 53 } },
        { step: PRIZES, pos: deckAt, rotY: s.rot, props: { count: 47 } },
      ],
      info: { title: `${s.whose} deck`, body: 'Exactly 60 cards. After the opening hand (7) and Prize cards (6), 47 remain.' },
    })
    const from: [number, number, number] = [deckAt[0], 0.9, deckAt[2]]

    HAND.forEach((face, j) => {
      const c = b.add({
        id: `hand-${P}-${j}`,
        kind: 'card',
        props: card(face, BACK, P === 0),
        keys: [{ step: DRAW, pos: handPos(P, j), rotY: s.rot, delay: P * 0.4 + j * 0.13 }],
        spawnFrom: from,
        info: { title: P ? 'Opponent’s card' : `${face.title} card`, body: P ? 'Part of the opponent’s opening hand of 7. You cannot see it.' : 'Part of your opening hand of 7 cards.' },
      })
      hands[P].push(c)
      const benchCount = P ? 1 : 2
      if (j === 0) c.keys.push({ step: ACT, pos: inZone(P, ACTIVE[0], ACTIVE[1]), rotY: s.rot, delay: P * 0.5, props: { faceUp: false } })
      else if (j <= benchCount) c.keys.push({ step: BENCHSTEP, pos: inZone(P, BENCH(j - 1)[0], BENCH(j - 1)[1]), rotY: s.rot, delay: P * 0.5 + j * 0.25, props: { faceUp: false } })
      if (j <= benchCount) c.keys.push({ step: FLIP, pos: c.keys[c.keys.length - 1].pos, rotY: s.rot, delay: 0, props: { faceUp: true } })
    })

    for (let i = 0; i < 6; i++)
      b.add({
        id: `prize-${P}-${i}`,
        kind: 'card',
        props: card(BACK, BACK, false),
        keys: [{ step: PRIZES, pos: s.at(PRIZE(i)[0], 0.03, PRIZE(i)[1]), rotY: s.rot, delay: P * 0.5 + i * 0.16 }],
        spawnFrom: from,
        info: { title: 'Prize card', body: '6 Prize Cards: take 1 each time you Knock Out an opponent’s Pokémon. They stay face down until taken.' },
      })
  }

  b.add({
    id: 'stadium',
    kind: 'mat',
    props: { w: 1.15, d: 1.6, color: '#8a6a34', opacity: 0.3, border: '#ffffff', dashed: true, label: 'STADIUM', labelAt: 'bottom', ink: '#ffffff' },
    keys: [{ step: ZONES, pos: [-3.4, 0.004, 0], rotY: Math.PI / 2, delay: 1.1 }],
    info: { title: 'Stadium zone', body: 'Shared by both players. Only 1 Stadium card can be in play at a time, and it starts empty.' },
  })
  b.add({
    id: 'coin',
    kind: 'token',
    props: { r: 0.42, h: 0.06, color: '#e2b93b', label: 'H', ink: '#6b4e0a' },
    keys: [{ step: COIN, pos: [3.2, 0, 0] }],
    spawnFrom: [3.2, 2.6, 2],
    tumble: true,
    info: { title: 'Coin', body: 'Flipped to decide who chooses the first player, and for attacks that say "flip a coin". There is 1.' },
  })
  for (let i = 0; i < 4; i++)
    b.add({
      id: `counter-${i}`,
      kind: 'token',
      props: { r: 0.22, h: 0.05, color: i === 3 ? '#d9534a' : '#f08a24', label: i === 3 ? '50' : '10', ink: '#ffffff' },
      keys: [{ step: COIN, pos: [8.6 + (i % 2) * 0.55, 0, -0.3 + Math.floor(i / 2) * 0.55], delay: 0.4 + i * 0.1 }],
      info: { title: 'Damage counters', body: 'Placed on a Pokémon when it takes damage, 10 per counter. When damage reaches its HP, it is Knocked Out.' },
    })

  /* ---- Simulate First Turn ------------------------------------------------ */
  const me = SEAT[0]
  const deck0 = inZone(0, DECK[0], DECK[1])
  const T1 = b.turn({
    title: 'Draw a card',
    instruction: 'You won the flip and go first: start your turn by drawing the top card of your deck.',
    focus: FOCUS.right,
  })
  decks[0].keys.push({ step: T1, pos: deck0, props: { count: 46 } })
  const drawn = b.add({
    id: 'drawn-0',
    kind: 'card',
    props: card(basic('Lightning', '#d9b62f', 60), BACK, true),
    keys: [{ step: T1, pos: handPos(0, 0), delay: 0.5 }],
    spawnFrom: [deck0[0], 0.9, deck0[2]],
    info: { title: 'Basic Pokémon card', body: 'The card you drew for the turn. Basic Pokémon can be played straight onto your Bench.' },
  })

  const T2 = b.turn({
    title: 'Bench a Basic Pokémon',
    instruction: 'Play the Basic Pokémon you just drew onto an empty Bench spot. You can do this as often as you like.',
    focus: FOCUS.mine,
  })
  drawn.keys.push({ step: T2, pos: inZone(0, BENCH(2)[0], BENCH(2)[1]), delay: 0.5 })

  const T3 = b.turn({
    title: 'Attach an Energy',
    instruction: 'Attach 1 Energy card from your hand to your Active Pokémon. You may only do this once per turn.',
    focus: FOCUS.center,
    duration: 7,
  })
  hands[0][3].keys.push({ step: T3, pos: me.at(ACTIVE[0] + 0.3, 0.05, ACTIVE[1] + 0.35), rotY: 0, delay: 0.6 })

  const T4 = b.turn({
    title: 'Play a Trainer card',
    instruction: 'Play an Item card from your hand, do what it says, then put it in your discard pile.',
    focus: FOCUS.right,
  })
  hands[0][5].keys.push({ step: T4, pos: inZone(0, DISCARD[0], DISCARD[1]), delay: 0.6 })

  b.turn({
    title: 'End your turn',
    instruction: 'Attacking normally ends your turn, but the player who goes first cannot attack on turn one, so you simply pass.',
    focus: FOCUS.center,
    duration: 7,
  })

  const deck1 = inZone(1, DECK[0], DECK[1])
  const T6 = b.turn({
    title: 'Opponent’s turn',
    instruction: 'Your opponent draws a card and takes the same steps, and they are allowed to attack.',
    focus: FOCUS.theirs,
  })
  decks[1].keys.push({ step: T6, pos: deck1, rotY: Math.PI, props: { count: 46 } })
  b.add({
    id: 'drawn-1',
    kind: 'card',
    props: card(BACK, BACK, false),
    keys: [{ step: T6, pos: handPos(1, 0), rotY: Math.PI, delay: 0.5 }],
    spawnFrom: [deck1[0], 0.9, deck1[2]],
    info: { title: 'Opponent’s card', body: 'The card your opponent drew for their turn.' },
  })

  b.turn({
    title: 'Knock Outs win Prizes',
    instruction: 'Whenever you Knock Out an opposing Pokémon, take 1 of your Prize cards into your hand: take all 6 to win.',
    focus: FOCUS.left,
  })
  return b.done({ w: 34, d: 21, tint: '#e9dcc8' })
}

export const pokemon: GameDef = {
  id: 'pokemon',
  meta: {
    title: 'Pokémon TCG',
    players: [2, 2],
    defaultPlayers: 2,
    playTime: '20–30 min',
    difficulty: 'Easy',
    blurb: 'Deck, Prizes, Active and Bench.',
    swatch: ['#27408b', '#f2c94c', '#d9534a'],
  },
  build,
}
