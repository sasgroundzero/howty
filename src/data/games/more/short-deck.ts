/** Short Deck Hold'em (Six Plus): Hold'em with the 2s to 5s removed and a flush ranked above a full house. */
import { C, On, P, S, T, at, discs, draw, flip, hide, mv, spawn, tabletop, zone, type Act, type Item } from '../compose'
import { hand, pc, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const HOLE = 'Two private cards. At the showdown you combine them with the five shared cards to make your best five-card hand.'
const chip = (id: string, label: string, title: string, body: string, h = 0.08) => discs(id, 1, 0.25, label === '2' ? '#2e6fb7' : '#e9e4d8', title, body, { label, h })
/** Where the k-th community card lands on the board zone. */
const spot = (k: number) => at('board', 0.5 + ((k - 2) * 1.04) / 5.4, 0.5)

export const shortDeck = tabletop('short-deck', 'Short Deck Hold\'em', [2, 8], 6, '1–3 hr', 'Medium', '36-card Hold\'em where a flush beats a full house.', ['#7a1f2b', '#d9a514', '#e9e4d8'], (n) => {
  const button = n - 1
  const folds: Act[] = Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 2).flatMap((s) => [hide(`hole.0@${s}`, 0.3), hide(`hole.1@${s}`, 0.3)])
  const seats = Array.from({ length: n }, (_, i) => i)
  return {
    setup: [
      S('Strip the deck', 'Take a standard 52-card deck and remove every 2, 3, 4 and 5 (no jokers). The 36 cards left run from 6 up to ace. Give every player a stack of chips.', 'you', [
        P(zone('bet', 2.6, 1, 'Bets', 'Chips you put in during the current round sit here in front of you. When the round is over they are swept into the pot.')),
        P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. How many chips everyone starts with, and what they are worth, is whatever the group agrees.', { h: 0.4 })),
      ], 'Also called Six Plus Hold\'em, 6+ or Short Deck Poker. It is usually played six-handed; this guide shows up to 8 players.'),
      S('Lay out the table', 'Leave room in the middle for the five shared cards, the pot and a pile of burned cards.', 'c', [
        C(zone('burn', 1.1, 1.5, 'Burn', 'Before each set of shared cards is dealt, the top card of the deck is discarded here face down.'), zone('board', 5.4, 1.5, 'Community cards', 'Five cards are dealt here face up over the course of the hand: three on the flop, one on the turn and one on the river. Everyone shares them.'), zone('pot', 2, 1.5, 'Pot', 'All the chips bet in the hand. The winner of the hand takes it.')),
      ]),
      S('Learn the changed rankings', 'With fewer cards a flush is harder to make than a full house, so a flush beats a full house. The ace still plays high or low, and because the 5 is gone the lowest straight is A-6-7-8-9.', 'c', [], 'Card rooms differ on one more point. Most keep a straight above three of a kind, as in ordinary poker, but some rank three of a kind above a straight. A few rooms keep the ordinary rankings altogether. Agree this before you deal.'),
      S('Place the dealer button', `The button marks the dealer for this hand and moves one seat clockwise after every hand. Here ${n === 2 ? 'your opponent has' : 'the player on your right has'} the button.`, 'button', [
        On(`bet@${button}`, 0.85, 0.5, discs('button', 1, 0.28, '#f5f1e6', 'Dealer button', 'Marks the dealer for this hand. In the ante format the player on the button also posts the only blind.', { label: 'D', h: 0.08, ink: '#1c1917' })),
      ], 'How the first dealer is picked is up to the group; drawing for high card is common.'),
      S('Post the antes and the button blind', 'In the usual short-deck format every player puts in an ante, and the player on the button also posts a larger blind. Here the ante is 1 chip and the button blind is 2.', 'bet', [
        On('bet', 0.2, 0.5, chip('ante', '1', 'Ante', 'A small forced bet that every player puts in before the cards are dealt.')),
        On(`bet@${button}`, 0.5, 0.5, chip('blind', '2', 'Button blind', 'A forced bet posted by the player on the button. It is the amount the others must match to stay in before the flop.', 0.16)),
      ], 'This is one common structure and the sizes are whatever your group agrees. Many games instead use a small blind and a big blind exactly as in Texas Hold\'em.'),
      S('Deal two hole cards each', 'Starting with the player to the left of the button, deal one card at a time clockwise until everyone has 2 cards face down.', 'hole', [
        P(seated(hand('hole', 'A♠ K♠', 'Your hole cards', HOLE), hand('hole', 'Q♥ Q♣', 'Your hole cards', HOLE))),
        C(stock('deck', 36 - 2 * n, 'Deck', `The ${36 - 2 * n} cards left after the deal. The burn cards and the five community cards come from the top.`)),
      ]),
      S('Ready to play', 'With antes and a button blind, the player to the left of the button acts first on every betting round, so the button acts last. On your turn you fold, call the current bet, or raise.', 'all', [], 'Apart from the deck, the forced bets and the hand rankings, everything works as in No-Limit Texas Hold\'em. If you use ordinary blinds instead, the order of betting is the same as in Hold\'em.'),
    ],
    turn: [
      T('Betting before the flop', n === 2
        ? 'You are to the left of the button, so you act first. The button blind counts as a bet of 2, so you put in 2 chips to call. Your opponent could raise but checks.'
        : 'You are to the left of the button, so you act first. The button blind counts as a bet of 2, so you put in 2 chips to call. The player on your left calls too, and the others fold, including the button.', 'bet', [
        spawn(chip('call', '2', 'Your call', 'Chips that match the button blind so that you can stay in the hand.', 0.16), at('bet', 0.5, 0.5), 'chips.0', undefined, 0.4),
        ...(n > 2 ? [spawn(chip('call1', '2', 'A call', 'Chips that match the button blind.', 0.16), at('bet@1', 0.5, 0.5), 'chips.0@1', undefined, 1)] : []), ...folds,
      ], 8),
      T('The flop', 'Sweep the antes and bets into the pot. The dealer burns one card face down, then deals three cards face up. A new betting round follows, in which you may check if nobody has bet.', 'board', [
        ...seats.map((i) => mv(`ante@${i}`, at('pot', 0.2, 0.5, i * 0.08), 0.1 + i * 0.05)), mv('blind', at('pot', 0.5, 0.5), 0.5), mv('call', at('pot', 0.8, 0.28), 0.6), ...(n > 2 ? [mv('call1', at('pot', 0.8, 0.72), 0.7)] : []),
        draw('deck', at('burn'), undefined, undefined, 1.2), draw('deck', spot(0), pc('K♦'), 'f0', 1.7), draw('deck', spot(1), pc('7♣'), 'f1', 2.1), draw('deck', spot(2), pc('6♠'), 'f2', 2.5),
      ], 9),
      T('The turn', 'Burn another card and deal a fourth community card face up. There is another round of betting.', 'board', [
        draw('deck', at('burn', 0.5, 0.5, 0.02)), draw('deck', spot(3), pc('9♥'), 't', 0.9),
      ]),
      T('The river', 'Burn once more and deal the fifth and last community card. The final betting round follows.', 'board', [
        draw('deck', at('burn', 0.5, 0.5, 0.04)), draw('deck', spot(4), pc('J♦'), 'r', 0.9),
      ]),
      T('Showdown', 'If two or more players are still in, they show their cards. Each makes the best five-card hand from their two cards and the five on the table, using the short-deck rankings. Your pair of kings beats a pair of queens, so you take the pot.', 'all', [
        flip('hole.0@1'), flip('hole.1@1'),
      ], 9),
      T('How it ends', 'If everyone else folds, the last player in wins the pot without showing. The button then moves one seat to the left for the next hand. Play for as long as you agreed, or until one player holds all the chips.', 'all'),
    ],
  }
})
