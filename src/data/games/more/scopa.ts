/** Scopa: an Italian fishing game. Capture table cards by matching or adding, and sweep the table when you can. */
import { C, P, S, T, at, mv, set, tabletop, zone } from '../compose'
import { BACK, hand, pc, shown, slot, stock } from '../playing'

const show = (id: string, s: string) => set(id, { face: pc(s), faceUp: true })
const down = (id: string) => set(id, { faceUp: false, back: BACK })

export const scopa = tabletop('scopa', 'Scopa', [2, 4], 2, '20–30 min', 'Easy', 'Sweep the table in this Italian classic.', ['#e0b12f', '#3d8b4a', '#c0392b'], (n) => {
  const opp = n - 1
  return {
    setup: [
      S('Make a 40-card pack', 'Scopa uses an Italian 40-card pack. With an ordinary 52-card deck, take out all the 8s, 9s and 10s and the jokers, leaving ace to 7 plus jack, queen and king in each suit.', 'c', [], `The name is Italian for "broom", after the sweep that clears the table. Italian suits are coins, cups, swords and clubs: with ordinary cards, diamonds stand in for coins. ${n === 4 ? 'Four play as two teams, with partners sitting opposite each other.' : n === 3 ? 'With three, everyone plays for themselves.' : 'It is best known as a game for two.'}`),
      S('Deal three cards each', 'The dealer shuffles and deals 3 cards face down to each player. Keep a space beside you for the cards you capture.', 'you', [
        P(hand('hand', '7♦ 4♣ K♠', 'Your hand', 'Your 3 cards. You play one each turn, and get 3 more when everyone has run out.'), zone('won', 1.1, 1.4, 'Captured', `Cards you capture are kept here face down until the scoring.${n === 4 ? ' Partners share one pile.' : ''}`)),
      ]),
      S('Deal four to the table', 'Deal 4 cards face up in the middle and put the rest of the pack face down beside them.', 'table', [
        C(shown('table', '3♥ 4♠ A♣ Q♦', 'Table cards', 'Four cards are dealt face up to start. You capture cards from here, and any card that captures nothing is left here.'), stock('stock', 40 - 3 * n - 4, 'Stock', `The ${40 - 3 * n - 4} cards left after the first deal. Hands are refilled from here, three cards at a time.`)),
      ], 'If three or four of the table cards are kings, gather everything in, shuffle and deal again.'),
      S('Learn the card values', 'For capturing, an ace counts 1 and cards 2 to 7 count their number. With an ordinary deck the jack counts 8, the queen 9 and the king 10.', 'hand'),
      S('Keep score on paper', 'You need a pencil and paper. Points are counted after the whole pack has been played through.', 'c'),
      S('Ready to play', `${n === 2 ? 'The player who did not deal goes first and the two of you alternate.' : 'The player to the right of the dealer goes first, and play runs counter-clockwise.'} In this example you go first. On your turn you play one card from your hand, capturing with it if you can.`, 'all'),
    ],
    turn: [
      T('Capture by adding up', 'Your 7 can take table cards that add up to 7, so it captures the 3 and the 4. Put all three cards face down in your pile.', 'c', [
        mv('hand.0', at('won', 0.5, 0.5, 0.04)), mv('table.0', at('won', 0.5, 0.5)), mv('table.1', at('won', 0.5, 0.5, 0.02)), down('hand.0'),
      ], 8),
      T('A sweep', `${n === 2 ? 'Your opponent' : 'The next player'} plays a king, worth 10. It takes the ace and the queen together (1 + 9) and clears the table. That is a scopa, worth a point, so the king is left face up in their pile as a reminder.`, 'c', [
        show(`hand.0@${opp}`, 'K♥'), mv(`hand.0@${opp}`, at(`won@${opp}`, 0.5, 0.5, 0.04)), mv('table.2', at(`won@${opp}`, 0.5, 0.5)), mv('table.3', at(`won@${opp}`, 0.5, 0.5, 0.02)),
      ], 8),
      T('Nothing to capture', 'With the table empty your card captures nothing, so it simply stays face up on the table. You must capture whenever your card can, and a single card of the same value must be taken in preference to a group.', 'c', [
        mv('hand.1', at('table', ...slot(1, 4))),
      ]),
      T('Deal again', 'When everyone has played all 3 cards, the dealer gives out 3 more each from the stock. No new cards go to the table. Carry on until the stock is gone and every card has been played.', 'stock'),
      T('Score the deal', 'Whoever made the last capture takes the cards left on the table. Then score 1 point each for: most cards, most diamonds (coins), the 7 of diamonds, the best "primiera", and every sweep. Taking the last cards with the very last play of the deal is not a sweep.', 'all'),
      T('How it ends', 'The primiera goes to the side with the best four cards, one from each suit, where sevens count most, then sixes, then aces. Deal again until a player or team reaches 11 points and wins.', 'all'),
    ],
  }
})
