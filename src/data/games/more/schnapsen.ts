/** Schnapsen: a fast Austrian duel with 20 cards, played to 66 card points. */
import { C, P, R, S, T, at, draw, mv, set, tabletop, zone, type Act } from '../compose'
import { BACK, hand, pc, shown, slot, stock } from '../playing'

const spot = (i: number, n: number): [number, number] => {
  const near = Math.ceil(n / 2)
  return i < near ? [1 - (i + 0.5) / near, 0.76] : [(i - near + 0.5) / (n - near), 0.24]
}
/** Another player turns a card from their hand face up and plays it to the trick. */
const play = (seat: number, k: number, card: string, n: number, delay?: number): Act[] => [
  set(`hand.${k}@${seat}`, { faceUp: true, face: pc(card) }), mv(`hand.${k}@${seat}`, at('trick', ...spot(seat, n)), delay),
]
/** The winner gathers the trick face down onto their pile of won tricks. */
const take = (ids: string[], winner: number): Act[] => ids.flatMap((id, j) => [set(id, { faceUp: false, back: BACK }), mv(id, at(`won@${winner}`, 0.5, 0.5, j * 0.02))])

const MINE = 'A♠ 10♠ K♥ Q♥ J♣'

export const schnapsen = tabletop('schnapsen', 'Schnapsen', [2, 2], 2, '20–30 min', 'Medium', 'Race to 66 points with just twenty cards.', ['#c0392b', '#1f6f4a', '#ffffff'], () => {
  const n = 2
  return {
    setup: [
      S('Strip the deck to 20 cards', 'Schnapsen is for two players and uses 20 cards: the ace, ten, king, queen and jack of each suit. Take everything else out.', 'r', [
        C(zone('trick', 3.4, 3, 'Trick', 'The leader plays a card here and the other player answers. The winner keeps both cards.')),
        R(stock('out', 32, 'Cards taken out', 'The 32 cards from 2 to 9. They are not used.')),
      ], 'Also called Schnapser. It is the Austrian relative of the German game Sixty-Six, which is played the same way with 24 cards. In Austria it is usually played with German-suited cards.'),
      S('Learn the card values', 'From high to low the cards rank ace, ten, king, queen, jack. In tricks an ace is worth 11 points, a ten 10, a king 4, a queen 3 and a jack 2.', 'c', [], 'The ten beats the king. There are 120 card points in the deck, and you are trying to be first to 66.'),
      S('Deal five cards each', 'The dealer gives each player three cards, turns the next card face up, then gives each player two more.', 'you', [
        P(hand('hand', MINE, 'Hand', 'A hand of 5 cards. While the stock lasts you refill to five after every trick.')),
      ]),
      S('Set out the stock and trump', 'The turned-up card shows the trump suit. Put the 9 remaining cards face down as the stock, traditionally lying across half of the trump card so it can still be seen.', 'stock', [
        C(
          stock('stock', 9, 'Stock', 'The 9 undealt cards, called the talon. After each trick both players draw one.'),
          shown('trump', 'Q♦', 'Trump card', 'The card turned up during the deal. Its suit, here diamonds, is trump, and it is the last card drawn from the stock.'),
        ),
      ]),
      S('Leave room for tricks', 'Each player keeps the tricks they win face down in front of them, and keeps a count of their card points in their head.', 'won', [
        P(zone('won', 2.2, 1.5, 'Tricks won', 'Cards this player has captured. Their point values count toward 66.')),
      ]),
      S('Ready to play', 'The player who did not deal leads any card to the first trick. Here that is you.', 'all', [], 'While there are cards in the stock you do not have to follow suit: you may play any card you like.'),
    ],
    turn: [
      T('You lead', 'You lead the A♠.', 'trick', [mv('hand.0', at('trick', ...spot(0, n)))]),
      T('Your opponent answers', 'The other player may play any card. A higher card of the suit led or any trump would win; they give up the J♠.', 'trick', play(1, 0, 'J♠', n)),
      T('Take the trick', 'Your ace wins. You keep both cards: 11 for the ace and 2 for the jack, so you have 13 points.', 'won', take(['hand.0', 'hand.0@1'], 0)),
      T('Both draw a card', 'The winner of the trick draws the top card of the stock, then the loser draws. The winner leads next.', 'stock', [
        draw('stock', at('hand', ...slot(0, 5)), pc('10♦'), 'drew'), draw('stock', at('hand@1', ...slot(0, 5)), undefined, undefined, 1.2),
      ]),
      T('Declare a marriage', 'When it is your lead and you hold the king and queen of one suit, show both and lead one of them: 20 points, or 40 in trumps. You lead the Q♥ and show the K♥. The points only count once you have won a trick.', 'trick', [mv('hand.3', at('trick', ...spot(0, n)))], 9),
      T('Later rules and winning', 'Once the stock is gone, or a player on lead closes it by turning the trump card face down, you must follow suit and win the trick if you can. Claim the deal the moment you have 66: it earns 1 to 3 game points depending on how few points your opponent has. The first to 7 game points wins.', 'all', [], 10),
    ],
  }
})
