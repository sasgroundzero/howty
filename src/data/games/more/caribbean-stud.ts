/** Caribbean Stud Poker: five cards against the dealer, who shows one card and needs ace-king to qualify. */
import { C, On, P, S, T, at, discs, flip, hide, spawn, tabletop, zone, type Item } from '../compose'
import { hand, hidden, shown, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const CARDS = 'Five cards dealt face down. Only you may look at them, and you may not show them to or discuss them with other players.'
const chip = (id: string, label: string, title: string, body: string, color = '#c0392b') => discs(id, 1, 0.25, color, title, body, { label, h: label === '2' ? 0.16 : 0.08 })

export const caribbeanStud = tabletop('caribbean-stud', 'Caribbean Stud Poker', [1, 6], 3, '15–30 min', 'Easy', 'Five-card stud against the dealer.', ['#0f6b6b', '#c0392b', '#d9a514'], (n) => ({
  setup: [
    S('The table', 'Caribbean Stud Poker is a casino game: every player plays their own five-card hand against the dealer, never against each other. It uses one standard 52-card deck with no jokers. Each player has an Ante spot and a Raise spot.', 'you', [
      P(zone('ante', 1.3, 1, 'Ante', 'The bet you make before the deal.'), zone('raise', 1.3, 1, 'Raise', 'If you like your cards you put a bet of exactly twice your Ante here. Some layouts label this spot Bet.'), discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. What the chips are worth, and the betting limits, are whatever the group agrees.', { h: 0.4 })),
    ], 'Also called Caribbean Stud or Casino Stud Poker. The dealer is not one of the players shown: the dealer\'s cards go in the middle. A casino table has room for several players; this guide shows up to 6.'),
    S('Place your ante', 'Before any cards are dealt, each player puts a bet on the Ante spot. Here everyone antes 1 chip.', 'ante', [
      On('ante', 0.3, 0.5, chip('stake', '1', 'Ante bet', 'Your opening bet. You lose it if you fold.')),
    ], 'Casinos usually also offer an optional progressive jackpot side bet, which pays for very strong hands whatever the dealer holds. Its payouts vary from place to place.'),
    S('Deal five cards each', 'The dealer gives each player 5 cards face down and deals 5 to the dealer\'s own hand: four face down and one face up.', 'c', [
      P(seated(hand('hand', '10♠ 10♥ Q♦ 7♣ 4♠', 'Your cards', CARDS), hand('hand', 'J♦ 9♥ 6♠ 5♦ 2♣', 'Your cards', CARDS))),
      C(hidden('dealer', 'A♦ 9♠ 6♥ 3♣', 'Dealer\'s hidden cards', 'Four of the dealer\'s five cards. They stay face down until every player has folded or raised.'), shown('up', 'K♣', 'Dealer\'s up card', 'The one dealer card everybody can see before deciding.'), stock('deck', 52 - 5 * (n + 1), 'Deck', 'The rest of the deck. It is not used again this round.')),
    ]),
    S('Ready to play', 'Look at your own five cards and at the dealer\'s up card. Each player then chooses: fold and lose the Ante, or raise by betting exactly twice the Ante. Nobody draws any more cards.', 'all', [], 'Hands use the ordinary five-card poker rankings.'),
  ],
  turn: [
    T('Fold or raise', `You hold a pair of tens, so you raise: put 2 chips, double your Ante, on the Raise spot.${n > 1 ? ' The player on your left has nothing and folds, giving up their cards and their Ante.' : ''}`, 'you', [
      spawn(chip('bet', '2', 'Raise bet', 'A bet of exactly twice your Ante, made after you have seen your cards.'), at('raise', 0.3, 0.5), 'chips.0', undefined, 0.4),
      ...(n > 1 ? [...[0, 1, 2, 3, 4].map((k) => hide(`hand.${k}@1`, 1.2)), hide('stake@1', 1.4)] : []),
    ], 8),
    T('The dealer shows', 'When everyone has decided, the dealer turns over the four hidden cards. The dealer needs at least an ace and a king, or any pair or better, to "qualify". Here the dealer has ace-king high, which just qualifies.', 'dealer', [
      flip('dealer.0'), flip('dealer.1'), flip('dealer.2'), flip('dealer.3'),
    ], 9),
    T('Settle the bets', 'The dealer qualifies, so your hand is compared with the dealer\'s. Your pair of tens beats ace-king high: the Ante is paid at even money and the Raise is paid according to the paytable, which for a pair is even money. Had the dealer\'s hand been better you would lose both bets, and a tie returns both.', 'you', [
      spawn(chip('win1', '1', 'Winnings', 'Even money paid on your Ante.', '#e9e4d8'), at('ante', 0.7, 0.5), 'dealer.1', undefined, 0.4),
      spawn(chip('win2', '2', 'Winnings', 'The payout on your Raise. For a pair it equals the bet.', '#e9e4d8'), at('raise', 0.7, 0.5), 'dealer.1', undefined, 0.9),
    ], 10),
    T('If the dealer does not qualify', 'When the dealer has less than ace-king, every player who raised is paid even money on the Ante and simply gets the Raise back, however good their hand is.', 'dealer', [], 7),
    T('How it ends', 'Hands better than a pair pay more on the Raise. A common paytable gives 2 to 1 for two pair, 3 to 1 for three of a kind, 4 to 1 for a straight, 5 to 1 for a flush, 7 to 1 for a full house, 20 to 1 for four of a kind, 50 to 1 for a straight flush and 100 to 1 for a royal flush, but it varies from casino to casino, so read the one at the table. The cards are then collected and shuffled for a new round. There is no overall winner: you play as many rounds as you like.', 'all'),
  ],
}))
