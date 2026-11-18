/** President: a climbing game where you shed your hand by beating the last play. */
import { C, P, S, T, at, hide, mv, set, tabletop, zone } from '../compose'
import { hand, pc } from '../playing'

/** Low to high: threes are the weakest cards and twos the strongest. */
const ORDER = '3 4 5 6 7 8 9 10 J Q K A 2'.split(' ')
const FULL = '4♦ 4♠ 7♣ 9♥ J♣ K♠ 2♣ 3♣ 6♥ 8♦ 10♥ Q♦ A♥'.split(' ')
const rank = (c: string) => ORDER.indexOf(c.slice(0, -1))
const show = (id: string, s: string) => set(id, { face: pc(s), faceUp: true })

export const president = tabletop('president', 'President', [4, 7], 4, '20–40 min', 'Easy', 'Shed your cards first to rule the table.', ['#27457a', '#c0392b', '#e0b12f'], (n) => {
  const lo = Math.floor(52 / n)
  const extra = 52 % n
  const mine = FULL.slice(0, lo).sort((a, b) => rank(a) - rank(b))
  const [a, b] = [mine.indexOf('4♦'), mine.indexOf('4♠')]
  return {
    setup: [
      S('Sort out the deck', 'President uses one standard 52-card deck with no jokers. Leave space in the middle of the table for the cards that are played.', 'c', [
        C(zone('pile', 4.2, 3, 'Played cards', 'Each play goes here on top of the one it beats. When everyone passes, the pile is turned face down and cleared away.')),
      ], 'The same game is also known as Scum, Rich Man Poor Man, Capitalism and by several ruder names. It suits about 4 to 7 players.'),
      S('Deal out every card', `Shuffle and deal all the cards one at a time, face down. ${extra ? `They do not divide evenly: ${extra} ${extra === 1 ? 'player gets' : 'players get'} ${lo + 1} cards and the rest get ${lo}.` : `Everyone has ${lo}.`}`, 'you', [
        P(hand('hand', mine.join(' '), 'Your hand', `Your ${lo} cards, sorted from weakest to strongest. Keep them hidden from the other players.`, { cols: 7 })),
      ], extra ? 'Uneven hands are normal in this game. Every hand is drawn the same size here to keep the table tidy.' : undefined),
      S('Learn the ranking', 'Twos are the highest cards, then aces, kings, queens and so on down to threes, which are the lowest. Suits do not matter at all.', 'hand'),
      S('Titles and the card swap', 'Finishing order gives each player a title for the next hand: first out is the President and last is the Scum. From the second hand on, the Scum hands their best card to the President, who gives back any card they do not want. The runner-up and the second-to-last player swap one card the same way.', 'all', [], 'Nobody has a title in the first hand, so skip the swap. Groups vary a lot here: many have the President and Scum swap two cards instead of one.'),
      S('Ready to play', 'The player to the left of the dealer leads the first hand. In this example that is you. On your turn you either beat the last play or pass.', 'all', [], 'To beat a play you must put down the same number of cards, all of one rank, and that rank must be higher. In later hands the President leads. Some groups instead start with whoever holds the 3 of clubs.'),
    ],
    turn: [
      T('You lead a pair', 'The leader may play one card or a set of cards of the same rank. You open with your two fours.', 'pile', [
        mv(`hand.${a}`, at('pile', 0.38, 0.75)), mv(`hand.${b}`, at('pile', 0.62, 0.75)),
      ]),
      T('The next player beats it', 'Going clockwise, the next player must play a higher pair or pass. They put down a pair of nines.', 'pile', [
        show('hand.0@1', '9♣'), mv('hand.0@1', at('pile', 0.38, 0.6, 0.02)), show('hand.1@1', '9♦'), mv('hand.1@1', at('pile', 0.62, 0.6, 0.02)),
      ]),
      T('Higher still', 'The player after that tops the nines with a pair of kings. You could beat it only with a pair of aces or twos, so you pass. Passing is always allowed, even when you could play.', 'pile', [
        show('hand.0@2', 'K♥'), mv('hand.0@2', at('pile', 0.38, 0.45, 0.04)), show('hand.1@2', 'K♦'), mv('hand.1@2', at('pile', 0.62, 0.45, 0.04)),
      ]),
      T('Everyone passes', 'When a play goes all the way round with nobody beating it, the pile is cleared away face down. Whoever played last leads anything they like.', 'pile', [
        hide(`hand.${a}`), hide(`hand.${b}`), hide('hand.0@1'), hide('hand.1@1'), hide('hand.0@2'), hide('hand.1@2'),
      ]),
      T('Going out', 'The first player to run out of cards becomes the President. The others play on for the remaining places, and the last player left holding cards is the Scum.', 'all'),
      T('How it ends', 'The Scum shuffles and deals the next hand. Play as many hands as you like: many groups give 2 points to the President and 1 to the runner-up each hand, and the first to an agreed total such as 11 wins.', 'all'),
    ],
  }
})
