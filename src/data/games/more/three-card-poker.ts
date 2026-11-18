/** Three Card Poker: a casino game of three cards each against the dealer, with Ante, Play and Pair Plus bets. */
import { C, On, OnMe, P, S, T, at, discs, flip, hide, spawn, tabletop, zone, type Item } from '../compose'
import { hand, hidden, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const CARDS = 'Three cards dealt face down. Only you may look at them before you decide whether to fold or play.'
const chip = (id: string, title: string, body: string, color = '#c0392b') => discs(id, 1, 0.25, color, title, body, { label: '1', h: 0.08 })

export const threeCardPoker = tabletop('three-card-poker', 'Three Card Poker', [1, 6], 3, '15–30 min', 'Easy', 'Three cards each: beat the dealer.', ['#1f6b43', '#c0392b', '#d9a514'], (n) => ({
  setup: [
    S('The table', 'Three Card Poker is a casino game: every player plays their own hand against the dealer, never against each other. It uses one standard 52-card deck with no jokers. Each player has three betting spots.', 'you', [
      P(zone('pp', 1.3, 1, 'Pair Plus', 'An optional side bet that your own three cards will be a pair or better. The dealer\'s hand does not affect it.'), zone('ante', 1.3, 1, 'Ante', 'The bet you make before the deal to play against the dealer.'), zone('play', 1.3, 1, 'Play', 'After seeing your cards, you put a bet equal to your Ante here to stay in.')),
    ], 'Sometimes listed as Tri Card Poker. The dealer is not one of the players shown: the dealer\'s cards go in the middle. A casino table has room for several players; this guide shows up to 6.'),
    S('Take your chips', 'Each player needs chips to bet with. In a home game one person acts as dealer and banker.', 'chips', [
      P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. What the chips are worth, and the smallest and largest bets allowed, are whatever the group agrees.', { h: 0.4 })),
    ]),
    S('Place your bets', 'Before any cards are dealt, put a bet on the Ante spot. You may also bet on Pair Plus. Here everyone antes 1 chip and you add 1 chip on Pair Plus.', 'ante', [
      On('ante', 0.3, 0.5, chip('stake', 'Ante bet', 'Your bet against the dealer. You lose it if you fold.')),
      OnMe('pp', 0.3, 0.5, chip('side', 'Pair Plus bet', 'An optional bet that wins if your three cards make a pair or better, whatever the dealer holds.', '#2e6fb7')),
    ], 'Most tables require the Ante if you want to play your hand against the dealer; some also let you bet on Pair Plus alone.'),
    S('Deal three cards each', 'The dealer gives each player 3 cards face down and deals 3 cards face down to the dealer\'s own hand.', 'c', [
      P(seated(hand('hand', '8♠ 8♦ K♣', 'Your cards', CARDS), hand('hand', 'J♥ 7♠ 3♦', 'Your cards', CARDS))),
      C(hidden('dealer', 'Q♦ 9♣ 4♠', 'Dealer\'s hand', 'The dealer\'s three cards. They stay face down until every player has decided to fold or play.'), stock('deck', 52 - 3 * (n + 1), 'Deck', 'The rest of the deck. It is not used again this round.')),
    ]),
    S('Learn the hand ranking', 'With only three cards the order changes. From best to worst: straight flush, three of a kind, straight, flush, pair, high card. Note that a straight beats a flush.', 'you', [], 'An ace can be high or low in a straight.'),
    S('Ready to play', 'Look at your own three cards. Each player then chooses: fold and lose the Ante, or stay in by placing a Play bet equal to the Ante.', 'all'),
  ],
  turn: [
    T('Fold or play', `You hold a pair of eights, so you stay in: put 1 chip, the same as your Ante, on the Play spot.${n > 1 ? ' The player on your left folds, giving up their cards and their Ante.' : ''}`, 'you', [
      spawn(chip('raise', 'Play bet', 'A bet equal to your Ante, made after you have seen your cards.'), at('play', 0.3, 0.5), 'chips.0', undefined, 0.4),
      ...(n > 1 ? [hide('hand.0@1', 1.2), hide('hand.1@1', 1.2), hide('hand.2@1', 1.2), hide('stake@1', 1.4)] : []),
    ], 8),
    T('The dealer shows', 'When everyone has decided, the dealer turns over the dealer\'s three cards. The dealer needs queen high or better to "qualify". Here the dealer has queen high, which just qualifies.', 'dealer', [
      flip('dealer.0'), flip('dealer.1'), flip('dealer.2'),
    ], 8),
    T('Settle Ante and Play', 'The dealer qualifies, so your hand is compared with the dealer\'s. Your pair of eights beats queen high: your Ante and your Play bet are each paid at even money. Had the dealer\'s hand been better you would lose both, and an exact tie returns both.', 'you', [
      spawn(chip('win1', 'Winnings', 'Even money paid on your Ante.', '#e9e4d8'), at('ante', 0.7, 0.5), 'dealer.1', undefined, 0.4),
      spawn(chip('win2', 'Winnings', 'Even money paid on your Play bet.', '#e9e4d8'), at('play', 0.7, 0.5), 'dealer.1', undefined, 0.9),
    ], 9),
    T('If the dealer does not qualify', 'When the dealer has less than queen high, every player who stayed in is paid even money on the Ante and simply gets the Play bet back.', 'dealer', [], 7),
    T('Pair Plus and bonuses', 'Pair Plus is settled on your cards alone. It wins with a pair or better and loses otherwise, so here your pair of eights wins; most tables settle it even if you fold. If you stayed in, a straight or better also earns an Ante bonus, whatever the dealer holds.', 'you', [
      spawn(chip('win3', 'Winnings', 'The payout on your Pair Plus bet.', '#e9e4d8'), at('pp', 0.7, 0.5), 'dealer.1', undefined, 0.4),
    ], 8),
    T('How it ends', 'A common Pair Plus table pays 1 to 1 for a pair, 4 (or 3) to 1 for a flush, 6 to 1 for a straight, 30 to 1 for three of a kind and 40 to 1 for a straight flush; the Ante bonus usually pays 1, 4 and 5 to 1 for a straight, three of a kind and straight flush. Paytables vary, so read the one printed on the table. The cards are then collected and shuffled for a new round. There is no overall winner: you play as many rounds as you like.', 'all'),
  ],
}))
