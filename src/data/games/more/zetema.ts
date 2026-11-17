/** Zetema: a Victorian game played with 65 cards, scored for melds, marriages and fifth cards. */
import { C, P, R, S, T, at, draw, flip, mv, tabletop, zone, type Item } from '../compose'
import { hand, pc, slot, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const RANK = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const pileOf = (i: number) => zone(`r${i}`, 1.05, 2, RANK[i], `The discard pile for this rank. Cards are overlapped so all can be seen. There are five of every rank in the pack, and the fifth one to land here scores a zetema.`)

export const zetema = tabletop('zetema', 'Zetema', [2, 6], 3, '45 min', 'Medium', 'Victorian melds and marriages, 65 cards.', ['#5b3a7a', '#c0392b', '#f1e9d2'], (n) => {
  const size = n === 6 ? 5 : 6
  const left = 65 - size * n
  const target = n <= 3 ? 300 : 200
  const BODY = `Your ${size} cards. You top your hand back up to ${size} from the stock at the start of each turn.`
  return {
    setup: [
      S('Make the 65-card pack', 'Take a standard 52-card deck with no jokers and add all 13 cards of one suit from a second deck. Spades are the usual choice, so there are two of every spade. The doubled suit is called the imperial suit.', 'c', [
        C(...[0, 1, 2, 3, 4, 5, 6].map(pileOf)),
      ], 'Zetema dates from about 1870 and has no other common name. The rules here follow the modern reconstruction by Sid Sackson and David Parlett, which differs a little from the Victorian original.'),
      S('Leave room for thirteen piles', 'Discards are sorted on the table by rank, one pile for each rank from ace to king. Leave space for all thirteen.', 'c', [
        C(...[7, 8, 9, 10, 11, 12].map(pileOf)),
      ]),
      S(`Deal ${size} cards each`, `Shuffle and deal ${size} cards to each player, one at a time and face down.`, 'you', [
        P(seated(
          hand('hand', '4♥ 5♠ 9♣ J♠ K♦ 2♣'.split(' ').slice(0, size).join(' '), 'Your hand', BODY),
          hand('hand', 'Q♥ 9♥ 7♦ 3♠ A♣ 10♣'.split(' ').slice(0, size).join(' '), 'Your hand', BODY),
        )),
      ], n === 6 ? 'Hands are 5 cards only when six play. With fewer players everyone gets 6.' : 'Hands are 6 cards for two to five players. With six players everyone gets 5.'),
      S('Place the stock', `Put the remaining ${left} cards face down as the stock. Set aside two more spaces: one for marriages and one for finished piles.`, 'r', [
        R(stock('stock', left, 'Stock', `The ${left} cards left after the deal. You draw from it to refill your hand.`)),
        R(zone('wed', 2, 1.5, 'Marriages', 'Kings and queens that have been scored as marriages are set aside here, not on the rank piles.'), zone('done', 1.1, 1.5, 'Zetemas', 'When a rank pile gets its fifth card, the five cards are turned face down here and are out of play.')),
      ]),
      S('Keep score on paper', `You need pencil and paper. With ${n} players the game is played to ${target} points.`, 'c', [], `The target is 300 for two or three players and 200 for four or more. Four or six can play as partners who share a score.`),
      S('Ready to play', 'Play goes clockwise. On your turn you draw until you have a full hand, may declare one scoring combination, and then discard one card face up onto the pile for its rank.', 'all', [], 'The sources do not say who starts. The usual custom is the player to the left of the dealer; in this walkthrough it is you.'),
    ],
    turn: [
      T('Discard to a rank pile', 'Your hand is already full on the first turn, so you do not draw. You have nothing to declare, so you simply discard your 9 onto the nines pile. The player on your left then does the same and also lets go of a 9, overlapping yours.', 'r8', [
        mv('hand.2', at('r8', 0.5, 0.35)), flip('hand.1@1'), mv('hand.1@1', at('r8', 0.5, 0.6, 0.02), 1.6),
      ], 9),
      T('Draw, then discard', `When your turn comes round again you first draw from the stock to get back to ${size} cards. Then you discard again, this time a 4.`, 'you', [
        draw('stock', at('hand', ...slot(2, size)), pc('5♥'), 'd0'), mv('hand.0', at('r3', 0.5, 0.35), 1.3),
      ], 8),
      T('Declare a combination', `Before discarding you may show and score one combination: a sequence of ${size} cards (10 points), a flush of ${size} cards in one suit (30), both at once (50), or an assembly of all five cards of a rank (100 or more). Your discard must then come from the cards you showed.`, 'you', [], 10),
      T('Marriages', 'A king and queen of the same suit make a marriage. One of the pair may be picked up from the rank piles as long as the other comes from your hand. One marriage scores 10, and declaring several at once scores far more. Married cards are set aside in their own pile.', 'wed', [], 10),
      T('Score a zetema', 'Whoever discards the fifth card of a rank scores a zetema: 50 points for kings or queens, 20 for jacks, 15 for aces or fives and 5 for any other rank. Those five cards are turned face down and removed.', 'done', [], 9),
      T('How it ends', `When the stock is gone, players keep discarding without drawing until the cards run out. The game stops the moment someone reaches ${target} points, and that player wins. If nobody has, deal again.`, 'all', [], 9),
    ],
  }
})
