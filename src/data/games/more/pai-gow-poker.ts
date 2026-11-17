/** Pai Gow Poker: seven cards set into a five-card and a two-card hand, both played against the banker. */
import { C, On, P, S, T, at, discs, flip, mv, spawn, tabletop, zone, type Act, type Item } from '../compose'
import { hand, hidden, slot, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const LOW = 'Your two-card hand, placed in front, nearer the dealer. It can only be a pair or two single cards, and it must rank below your five-card hand.'
const HIGH = 'Your five-card hand, placed behind the two-card hand. It uses the ordinary poker rankings and must rank above your two-card hand.'
const chip = (id: string, title: string, body: string, color = '#c0392b') => discs(id, 1, 0.25, color, title, body, { label: '1', h: 0.08 })
const turn = (id: string, len: number, up: boolean, seat = ''): Act[] => Array.from({ length: len }, (_, k) => flip(`${id}.${k}${seat}`, up))

export const paiGowPoker = tabletop('pai-gow-poker', 'Pai Gow Poker', [1, 6], 3, '20–40 min', 'Medium', 'Split seven cards into two winning hands.', ['#7a1f2b', '#d9a514', '#f5f1e6'], (n) => ({
  setup: [
    S('The table', 'Pai Gow Poker is a casino game for up to 6 players, each playing against the banker, who is normally the dealer. It uses a 53-card deck: the standard 52 cards plus one joker.', 'you', [
      P(zone('bet', 1.3, 1, 'Bet', 'Your single bet on this hand goes here before the cards are dealt.'), discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. What the chips are worth, and the betting limits, are whatever the group agrees.', { h: 0.4 })),
    ], 'Also called double-hand poker. The dealer is not one of the players shown: the dealer\'s cards go in the middle. Many casinos let players take turns to be the banker; ask how your table does it.'),
    S('Place your bet', 'Before the deal each player puts one bet on their betting spot. Here everyone bets 1 chip.', 'bet', [
      On('bet', 0.3, 0.5, chip('stake', 'Your bet', 'One bet covers both of your hands. You win it, lose it or get it back depending on how the two hands do.')),
    ]),
    S('Deal seven cards each', 'The dealer deals 7 cards face down to each player and 7 to the dealer. Pick yours up and look at them.', 'you', [
      P(seated(hand('low', 'K♦ 4♣', 'Two-card hand', LOW), hand('low', '10♦ 8♠', 'Two-card hand', LOW))),
      P(seated(hand('high', 'K♠ 7♥ 7♣ A♦ 10♠', 'Five-card hand', HIGH), hand('high', '9♠ 9♥ A♣ 6♥ 3♦', 'Five-card hand', HIGH))),
      C(hidden('dlow', 'Q♠ J♥', 'Dealer\'s two-card hand', 'The two-card hand of the dealer, who is the banker here. Each player\'s two-card hand is compared with it.'), hidden('dhigh', 'JK 9♦ 8♣ 5♠ 2♥', 'Dealer\'s five-card hand', 'The five-card hand of the dealer, who is the banker here. Each player\'s five-card hand is compared with it.'), stock('rest', 53 - 7 * (n + 1), 'Unused cards', 'Casinos always deal seven hands of seven, which leaves four cards over. Those four and any hands dealt to empty seats are set aside unseen.')),
    ], 'Your seven cards are shown already laid out in two rows of 2 and 5 so that you can see them; you will rearrange them in a moment. Casinos use dice or a random number to decide which seat receives the first hand.'),
    S('Know the joker', 'The joker is not fully wild. It can complete a straight, a flush or a straight flush; otherwise it counts as an ace.', 'c', [], 'In most casinos A-2-3-4-5 is the second-highest straight, just below A-K-Q-J-10, but some treat it as the lowest. Check the house rules.'),
    S('Ready to play', 'There are no turns among the players. Everyone sets their seven cards into two hands at the same time, then the dealer does the same.', 'all'),
  ],
  turn: [
    T('Set your two hands', 'Split your seven cards into a five-card hand and a two-card hand. The five-card hand must be the stronger of the two. You have two pairs, so you keep the kings in the five-card hand and put the pair of sevens in front as your two-card hand.', 'you', [
      mv('low.0', at('high', ...slot(1, 5)), 0.3), mv('low.1', at('high', ...slot(2, 5)), 0.7), mv('high.1', at('low', ...slot(0, 2)), 1.1), mv('high.2', at('low', ...slot(1, 2)), 1.5),
    ], 10),
    T('Lay them face down', 'Place both hands face down, the two-card hand in front and the five-card hand behind it. Once your cards are down you may not touch them again.', 'you', [...turn('low', 2, false), ...turn('high', 5, false)], 7),
    T('The dealer sets a hand', 'The dealer turns over the dealer\'s seven cards and sets them by fixed rules called the "house way". Here the joker counts as an ace, giving ace high in the five-card hand and Q-J in the two-card hand.', 'c', [...turn('dlow', 2, true), ...turn('dhigh', 5, true)], 9),
    T('Compare both hands', `Each player's hands are turned up and compared with the dealer's: five cards against five, two against two. Your kings beat ace high and your sevens beat Q-J, so you win.${n > 1 ? ' The player on your left wins with a pair of nines behind but loses in front with 10-8: one win and one loss is a push, and the bet is returned.' : ''}`, 'all', [
      ...turn('low', 2, true), ...turn('high', 5, true), ...(n > 1 ? [...turn('low', 2, true, '@1'), ...turn('high', 5, true, '@1')] : []),
    ], 11),
    T('Collect your winnings', 'Win both hands and you are paid even money. Lose both and you lose your bet. If one of your hands exactly matches the banker\'s, called a copy, the banker wins that hand.', 'you', [
      spawn(chip('win', 'Winnings', 'Even money paid on your bet. Casinos normally keep a commission out of it.', '#e9e4d8'), at('bet', 0.7, 0.5), 'dhigh.2', undefined, 0.4),
    ], 9),
    T('How it ends', 'Casinos usually take a commission of 5% of each winning bet, though some charge in other ways. A hand set wrongly, with the two-card hand the stronger, is fouled: depending on the house it is reset the house way or loses. The cards are then shuffled for a new round, and you play as many rounds as you like.', 'all', [], 9),
  ],
}))
