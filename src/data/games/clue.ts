/** Clue / Cluedo: six suspects, six weapons, nine rooms and a secret envelope. */
import { BH, Kit, OVER, WIDE, game, info, look, onBoard, seats } from './kit'
import { MANSION_STARTS, ROOMS, roomCenter } from './layouts'

const SUSPECT = ['#c0392b', '#e0b12f', '#f3f1ea', '#3d8b4a', '#2e6fb7', '#7a4fa3']
const SUSPECT_NAME = ['Red', 'Yellow', 'White', 'Green', 'Blue', 'Purple']
const WEAPONS = ['Candlestick', 'Dagger', 'Lead pipe', 'Revolver', 'Rope', 'Wrench']
const BACK = { panel: '#3a2c20', border: '#d9c88f', ink: '#d9c88f', glyph: '?' }

function build(n: number) {
  const b = new Kit()
  const P = onBoard(11, 11)
  const S = seats(n, 8.8, 8.2)
  const each = Math.floor(18 / n)
  const extra = 18 % n
  const CARDS = look(8.6, -1, 7)
  const BOARD = b.s('Place the board', 'Lay the mansion board in the middle of the table: nine rooms surround the corridors.', OVER, undefined, ['1 board'])
  const PAWNS = b.s('Place all six suspects', 'Put all 6 suspect pawns on their matching colored start spaces, even if fewer than six people are playing.', OVER, 'Each player then picks one of the pawns to be their character.', ['6 suspect pawns'])
  const ARMS = b.s('Scatter the weapons', 'Place each of the 6 weapons in a different room.', OVER, 'It does not matter which room each weapon starts in.', ['6 weapons'])
  const SORT = b.s('Sort the cards', 'Sort the cards into three face-down piles: suspects, weapons and rooms, and shuffle each pile.', CARDS, undefined, ['6 suspect cards', '6 weapon cards', '9 room cards'])
  const ENV = b.s('Fill the secret envelope', 'Without looking, take the top card from each pile and slip all three into the envelope in the middle of the board.', look(0, 0, 8), 'These three cards are the answer: who did it, with what, and where.', ['1 envelope'])
  const DEAL = b.s('Deal the rest', `Shuffle the remaining 18 cards together and deal them all out face down: ${each} each${extra ? `, with ${extra} left over that some players get as an extra card` : ''}.`, WIDE, 'Look at your own cards in secret. None of them can be in the envelope.')
  const NOTES = b.s('Notes and dice', 'Give every player a detective notes sheet and a pencil, tick off the cards you hold, and put the dice by the board.', WIDE, undefined, [`${n} note sheets`, 'Dice'])
  b.s('Ready to play', 'You are set up: in the classic rules the player with the red pawn goes first, and play passes to the left.', OVER, 'Work out the three cards in the envelope before anyone else does.')

  b.board('board', BOARD, 11, 11, 'b:mansion', info('Mansion board', 'Nine rooms joined by corridors, with the solution envelope in the center. There is 1.'), { edge: '#5a4326' })
  const pawns = SUSPECT.map((color, i) => b.pawn(`suspect-${i}`, PAWNS, P(MANSION_STARTS[i]), color, info(`${SUSPECT_NAME[i]} suspect`, 'One of the six suspects. All six are always on the board, because any of them can be named in a suggestion.'), { delay: i * 0.15, scale: 0.6 }))
  const arms = WEAPONS.map((name, i) => b.box(`weapon-${i}`, ARMS, P(roomCenter(i), BH, 0.5, 0.3), 0.5, 0.18, 0.28, '#9aa3ab', info(name, 'One of the six possible murder weapons. It moves into a room whenever it is named in a suggestion.'), { delay: i * 0.15, rotY: i }))
  const piles = [['Suspects', 6, '#c0392b'], ['Weapons', 6, '#6b7680'], ['Rooms', 9, '#3d8b4a']] as const
  piles.forEach(([name, count, color], i) => {
    const p = b.deck(`pile-${i}`, SORT, [8.6, 0, -3 + i * 1.8], count, { panel: color, ink: '#ffffff', sub: name.toUpperCase(), glyph: '?' }, info(`${name} pile`, `${count} cards. One is secretly removed for the envelope, and the rest are dealt out.`), { delay: i * 0.2 })
    p.keys.push({ step: ENV, pos: [8.6, 0, -3 + i * 1.8], props: { count: count - 1 } })
    p.keys.push({ step: DEAL, pos: [8.6, 0, -3 + i * 1.8], hide: true })
    b.add({ id: `secret-${i}`, kind: 'card', spawnFrom: [8.6, 0.3, -3 + i * 1.8], props: { w: 0.8, d: 1.1, face: BACK, back: BACK, faceUp: false }, keys: [{ step: ENV, pos: [-0.35 + i * 0.35, BH + 0.02 + i * 0.016, 0], rotY: 0.2 - i * 0.2, delay: i * 0.4 }], info: info('Secret card', 'One suspect, one weapon and one room are hidden here. Nobody may look until they make an accusation.') })
  })
  const hands = S.map((s) => b.deck(`hand-${s.i}`, DEAL, s.at(-0.8, 0, 0), each + (s.i < extra ? 1 : 0), BACK, info(`${s.whose} cards`, `${each + (s.i < extra ? 1 : 0)} cards, kept secret. Each one is something that is definitely not in the envelope.`), { rotY: s.rot, delay: s.i * 0.15 }))
  S.forEach((s) => b.sheet(`notes-${s.i}`, NOTES, s.at(0.9, 0, 0), 1.1, 1.6, { bg: '#fbf6ea', border: '#5a4326', title: 'NOTES', lines: ['☐ suspects', '☐ weapons', '☐ rooms'] }, info(`${s.whose} detective notes`, 'A private checklist of all 21 cards. Tick off everything you see so you can narrow down the answer.'), { rotY: s.rot, delay: s.i * 0.12 }))
  const die = b.die('die', NOTES, [-1.2, BH, -1.9], 4, info('Die', 'Roll to move your pawn along the corridor squares. You may not move diagonally.'))
  void hands

  const T1 = b.t('Roll and move', 'You roll and move your red pawn along the corridor and through the door into the Hall.', look(0.8, 3.6, 7), 7)
  die.keys.push({ step: T1, pos: [3.2, BH, 2], rotY: 1, props: { value: 5 } })
  pawns[0].keys.push({ step: T1, pos: P(roomCenter(7), BH, -0.4, 0.2), delay: 1.4 })
  const T2 = b.t('Make a suggestion', 'In a room you may suggest a suspect and a weapon: "Green, with the rope, in the Hall". Both are brought into your room.', look(0.5, 3.6, 7), 8)
  pawns[3].keys.push({ step: T2, pos: P(roomCenter(7), BH, 0.4, 0.2), delay: 0.8 })
  arms[4].keys.push({ step: T2, pos: P(roomCenter(7), BH, 0, 0.75), rotY: 0.3, delay: 1.3 })
  const T3 = b.t('Someone proves you wrong', 'The player on your left must secretly show you one card that matches your suggestion, if they hold any. If not, the next player to the left tries, and so on.', WIDE, 7)
  b.add({ id: 'shown', kind: 'card', spawnFrom: S[1].at(-0.8, 0.3, 0), props: { w: 0.9, d: 1.26, face: { panel: '#6b7680', ink: '#ffffff', title: 'WEAPON', glyph: '➰', sub: 'ROPE' }, back: BACK, faceUp: true }, keys: [{ step: T3, pos: S[0].at(-2.2, 0, 0), delay: 0.6 }], info: info('Card shown to you', 'Only you see it. The rope cannot be the murder weapon, so cross it off your notes.') })
  b.t('Cross it off', 'You tick the rope on your notes sheet: every card you are shown is one more thing that is not in the envelope.', look(0, 8, 6))
  b.t('Accuse to win', 'When you are sure, name all three out loud and check the envelope in secret: right and you win, wrong and you are out, but you still show cards to disprove others’ suggestions. You get only one accusation.', look(0, 0, 8))
  void ROOMS
  return b.done({ w: 34, d: 23 })
}

export const clue = game('clue', 'Clue', [3, 6], 4, '45–60 min', 'Medium', 'Deduce who, with what, and where.', ['#e2c98f', '#7a2f2a', '#3d8b4a'], build)
