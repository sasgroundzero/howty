/** Casino: a fishing game. Capture table cards by pairing or adding, and set up builds to take later. */
import { C, P, S, T, at, mv, set, tabletop, zone } from '../compose'
import { BACK, hand, pc, shown, slot, stock } from '../playing'

const show = (id: string, s: string) => set(id, { face: pc(s), faceUp: true })
const down = (id: string) => set(id, { faceUp: false, back: BACK })

export const casino = tabletop('casino', 'Casino', [2, 4], 2, '20–40 min', 'Medium', 'Fish cards off the table by adding up.', ['#3d8b4a', '#1c1917', '#c0392b'], (n) => {
  const left = 52 - 4 * n - 4
  const who = n === 2 ? 'Your opponent' : 'The next player'
  return {
    setup: [
      S('Sort out the deck', 'Casino uses one standard 52-card deck with no jokers.', 'c', [], `The name is often spelled Cassino. ${n === 4 ? 'Four can play as two partnerships, with partners sitting opposite each other.' : 'It is at its best with two players.'}`),
      S('Deal four cards each', 'The dealer shuffles and deals 4 cards face down to each player. Keep a space beside you for the cards you capture.', 'you', [
        P(hand('hand', '8♠ 9♣ 4♣ J♦', 'Your hand', 'Your 4 cards. You play one each turn, and get 4 more when everyone has run out.'), zone('won', 1.1, 1.4, 'Captured', 'Cards you capture are kept here face down until the scoring.')),
      ], 'Traditionally the cards are dealt two at a time, but dealing singly is just as common.'),
      S('Deal four to the table', 'Deal 4 cards face up in the middle and put the rest of the pack face down beside them.', 'table', [
        C(shown('table', '6♣ 2♥ J♠ K♦', 'Table cards', 'Four cards are dealt face up to start. You capture from here, and cards that capture nothing are left here.'), stock('stock', left, 'Stock', `The ${left} cards left after the first deal. Hands are refilled from here, four cards at a time.`)),
      ]),
      S('Learn the card values', 'An ace counts 1 and cards 2 to 10 count their number. Jacks, queens and kings have no number: a picture card can only capture one card of its own rank.', 'hand'),
      S('Know what scores', 'There are 11 points in each deal: 3 for taking the most cards, 1 for the most spades, 2 for the 10♦, 1 for the 2♠ and 1 for each ace. You need a pencil and paper.', 'c', [], 'A tie for most cards or most spades scores nothing. Many groups add a point for each sweep, which is clearing every card off the table.'),
      S('Ready to play', 'The player to the left of the dealer goes first and play runs clockwise. In this example that is you. On your turn you play one card from your hand to capture, to build, or simply to leave on the table.', 'all'),
    ],
    turn: [
      T('Capture by adding up', 'A number card takes any table cards of the same number, and any groups that add up to it. Your 8 captures the 6 and the 2 together. Captured cards go face down in your pile.', 'c', [
        mv('hand.0', at('won', 0.5, 0.5, 0.04)), mv('table.0', at('won', 0.5, 0.5)), mv('table.1', at('won', 0.5, 0.5, 0.02)), down('hand.0'),
      ], 8),
      T('Trail a card', `${who} cannot or does not want to capture, so they trail: they lay a 5 face up on the table and their turn ends.`, 'c', [
        show('hand.0@1', '5♥'), mv('hand.0@1', at('table', ...slot(0, 4))),
      ]),
      T('Make a build', 'You place your 4 on the 5 and announce "building nine". A build can only be captured as a whole by a 9, and you must hold a 9 in your hand to make it.', 'c', [
        mv('hand.2', at('hand.0@1', 0.5, 0.75, 0.02)),
      ]),
      T('Pair a picture card', `${who} plays a king and captures the king on the table. They could have taken your build instead if they held a 9.`, 'c', [
        show('hand.1@1', 'K♣'), mv('hand.1@1', at('won@1', 0.5, 0.5, 0.02)), mv('table.3', at('won@1', 0.5, 0.5)), down('hand.1@1'),
      ], 8),
      T('Take your build', 'You play your 9 and capture the build. While your build is on the table you may not trail: you must capture, build or add to a build.', 'c', [
        mv('hand.1', at('won', 0.5, 0.5, 0.1)), mv('hand.0@1', at('won', 0.5, 0.5, 0.06)), mv('hand.2', at('won', 0.5, 0.5, 0.08)), down('hand.1'),
      ], 8),
      T('How it ends', 'When all hands are empty, the dealer gives everyone 4 more cards, but none to the table. After the last cards are played, whoever captured last takes what is left on the table and the deal is scored. Deal again until someone reaches 21 points and wins.', 'all', [], 8),
    ],
  }
})
