/** Briscola: three cards in hand, a turned-up trump, and 120 card points to fight over. */
import { C, P, R, S, T, at, draw, flip, mv, tabletop, zone, type Act, type Item } from '../compose'
import { hand, pc, shown, slot, stock } from '../playing'

/** A hand whose face-down copies at other seats get their own faces: seen['0@1'] is card 0 of seat 1. */
const dealt = (id: string, mine: string, seen: Record<string, string>, title: string, body: string, o: { cols?: number } = {}): Item => {
  const it = hand(id, mine, title, body, o)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); const s = seen[`${k}${seat ?? ''}`]; return s ? { ...m, props: { ...m.props, face: pc(s) } } : m } }
}
const SPOTS: Record<number, [number, number][]> = {
  2: [[0.5, 0.75], [0.5, 0.25]],
  3: [[0.7, 0.75], [0.3, 0.75], [0.5, 0.25]],
  4: [[0.7, 0.75], [0.3, 0.75], [0.3, 0.25], [0.7, 0.25]],
}

export const briscola = tabletop('briscola', 'Briscola', [2, 4], 2, '15–30 min', 'Easy', 'Italian trick game where aces and threes rule.', ['#c9a227', '#9b2c2c', '#1f6f4a'], (n) => {
  const spot = SPOTS[n]
  const left = (n === 3 ? 39 : 40) - 3 * n - 1
  /** Play runs anticlockwise, so after you comes the player on your right: the highest seat number. */
  const others = Array.from({ length: n - 1 }, (_, k) => n - 1 - k)
  const seen: Record<string, string> = { '0@1': '5♦', '0@2': n === 3 ? 'Q♠' : '7♥', '0@3': 'Q♠' }
  /** After a trick the winner (seat 1 here) draws first, then the rest in anticlockwise order. */
  const drawOrder = [1, 0, ...others.filter((s) => s !== 1)]
  return {
    setup: [
      S('Make a 40-card pack', `Briscola is played with a 40-card Italian pack. With a standard 52-card deck, take out the 8s, 9s, 10s and jokers.${n === 3 ? ' With three players also remove one of the 2s, leaving 39 cards, so the deal comes out even.' : ''}`, 'c', [
        C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The highest trump wins, or the highest card of the suit led if no trump was played.')),
      ], 'Known as Briškula on the eastern Adriatic coast. It is for two, three, four or six players; six remove all the 2s, and five play a different game called Briscola Chiamata.'),
      S('Learn the card order and values', 'In each suit the cards rank A (high), 3, K, Q, J, 7, 6, 5, 4, 2. An ace is worth 11 points, a three 10, a king 4, a queen 3 and a jack 2.', 'c', [], 'The other cards are worth nothing, so the pack holds 120 points. Some players, mostly in southern Italy, rank the jack above the queen.'),
      S('Deal three cards each', `Deal 3 cards face down to each player.${n === 4 ? ' The four of you play as two teams, with partners sitting opposite each other.' : ''}`, 'you', [
        P(dealt('hand', '3♣ J♠ 6♦', seen, 'Hand', 'Each player holds 3 cards and draws a new one after every trick.')),
        P(zone('won', 2, 1.4, 'Cards won', 'Tricks you have taken, kept face down. Their points are counted at the end.')),
      ]),
      S('Turn up the trump', `Turn the next card face up: its suit is the briscola, the trump suit. Put the remaining ${left} cards face down beside it as the stock.`, 'r', [
        R(stock('stock', left, 'Stock pile', `The ${left} undealt cards. Everyone draws one after each trick.`), shown('trump', '4♦', 'Briscola card', 'This card shows the trump suit. It usually lies half under the stock and is the last card to be drawn.')),
      ]),
      S('Ready to play', 'The player on the dealer\'s right leads to the first trick and play goes anticlockwise. You may play any card you like: there is no need to follow suit or to trump.', 'all', [], n === 2 ? 'With two players the non-dealer leads.' : 'After each trick the winner draws a card first, then the others in turn, and the winner leads again.'),
    ],
    turn: [
      T('You lead a card', 'The dealer is on your left, so you lead. You play the J♠, which is worth 2 points.', 'trick', [mv('hand.1', at('trick', ...spot[0]))]),
      T(n === 2 ? 'Your opponent answers' : 'The others play in turn', n === 2 ? 'Your opponent may play any card and chooses a small diamond. Diamonds are trumps, so it beats your jack.' : 'Going anticlockwise, each player adds any card. The last one plays a small diamond, and because diamonds are trumps it beats everything else.', 'trick',
        others.flatMap((s): Act[] => [flip(`hand.0@${s}`), mv(`hand.0@${s}`, at('trick', ...spot[s]))]), 9),
      T('The trump takes the trick', 'The highest trump wins. If no trump is played, the highest card of the suit that was led wins, and cards of other suits cannot win.', 'won@1', [
        flip('hand.1', false), mv('hand.1', at('won@1', 0.5, 0.5)),
        ...others.flatMap((s, i): Act[] => [flip(`hand.0@${s}`, false), mv(`hand.0@${s}`, at('won@1', 0.5, 0.5, 0.02 * (i + 1)))]),
      ]),
      T('Everyone draws', 'The winner of the trick takes the top card of the stock, then each other player draws one in turn. Everyone is back to 3 cards and the winner leads next.', 'r',
        drawOrder.map((s) => (s === 0 ? draw('stock', at('hand', ...slot(1, 3)), pc('K♥'), 'new') : draw('stock', at(`hand@${s}`, ...slot(0, 3))))), 9),
      T('How it ends', `The last player to draw takes the face-up trump card, and the final three tricks are played without drawing. Then count the points in the cards you won: ${n === 3 ? 'the player with the most of the 120 points wins.' : '61 or more wins, and 60 each is a draw.'}`, 'all'),
    ],
  }
})
