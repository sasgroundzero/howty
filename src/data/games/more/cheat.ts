/** Cheat (I Doubt It): play cards face down, say what they are, and hope nobody checks. */
import { C, P, S, T, at, flip, mv, set, tabletop, zone } from '../compose'
import { hand, pc, slot } from '../playing'

const show = (id: string, card: string) => set(id, { faceUp: true, face: pc(card) })
const FULL = 'A♠ A♦ 3♣ 5♥ 8♠ J♦ 2♥ 6♣ 9♦ K♠ 4♦ 7♥ 10♣ Q♠ 3♥ 6♠ 9♣ K♦ 4♣ 7♠ J♥ 5♦ 8♥ Q♣ 10♠ 2♣'

export const cheat = tabletop('cheat', 'Cheat', [2, 8], 4, '15–30 min', 'Easy', 'Lie about your cards and do not get caught.', ['#7a1f1f', '#1c1917', '#ffffff'], (n) => {
  const q = Math.floor(52 / n)
  const extra = 52 % n
  const rows = Math.ceil(q / 7)
  return {
    setup: [
      S('Take one pack', 'Cheat uses one standard 52-card deck with no jokers. Leave space in the middle of the table for the pile.', 'c', [
        C(zone('pile', 3.4, 1.7, 'Pile', 'Everyone plays face down onto one pile here. A player who loses a challenge picks all of it up.')),
      ], 'The game is also known as I Doubt It, and in the USA usually by a ruder name. More than 8 can play, but this guide stops at 8.'),
      S('Deal out every card', `Shuffle and deal the whole pack one card at a time, face down. Everyone gets ${q} cards${extra ? `, plus one more for the first ${extra === 1 ? 'player' : `${extra} players`} in the deal` : ''}.`, 'you', [
        P(hand('hand', FULL.split(' ').slice(0, q).join(' '), 'Your hand', `Your ${q} cards. You win by being the first to get rid of all of them.`, { cols: 7 })),
      ], extra ? 'It does not matter that the hands are slightly uneven.' : undefined),
      S('Sort your hand', 'Pick up your cards, keep them hidden and sort them by rank so that you can see how many of each you hold.', 'hand'),
      S('Learn the calling order', 'The first player must call aces, the next player twos, then threes and so on up to kings. After kings the calls start again at aces.', 'c', [], 'This upward order is the most common rule. Some groups call downwards, or let you call one rank above or below the last call.'),
      S('Ready to play', 'Pick any player to start. On your turn you put one or more cards face down on the pile and say how many of the required rank they are, truthfully or not.', 'all', [], 'Here you go first, so your call must be aces. Some groups allow at most four cards in one play.'),
    ],
    turn: [
      T('Play face down and make your call', 'You must call aces. You hold two, so you lay both face down and say "two aces". This time it is true.', 'pile', [
        flip('hand.0', false), mv('hand.0', at('pile', 0.18, 0.5)), flip('hand.1', false), mv('hand.1', at('pile', 0.5, 0.5)),
      ]),
      T('The next player calls twos', 'The player on your left must call twos whether they hold any or not. They slide one card onto the pile face down and say "one two".', 'pile', [
        mv('hand.0@1', at('pile', 0.82, 0.5)),
      ]),
      T('Challenge a call', 'Anyone who does not believe a call can shout "Cheat!". You do, and the card just played is turned over. It is a 9, so the liar picks up the whole pile.', 'pile', [
        show('hand.0@1', '9♥'),
        mv('hand.0@1', at('hand@1', ...slot(0, 7, rows)), 2), mv('hand.0', at('hand@1', ...slot(1, 7, rows), 0.02), 2.3), mv('hand.1', at('hand@1', ...slot(2, 7, rows), 0.02), 2.6),
      ], 9),
      T('A wrong challenge costs you', 'If the cards turned over all match the call, the challenger picks up the pile instead. Either way, play carries on from the player to the left of the one who was challenged, with the next rank.', 'all'),
      T('How it ends', 'The first player to play their last card wins, but only if that final play survives a challenge. If it was a lie, they pick up the pile and the game goes on.', 'all'),
    ],
  }
})
