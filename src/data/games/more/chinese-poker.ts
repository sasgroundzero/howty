/** Chinese Poker: thirteen cards each, set into a three-card front hand and two five-card hands. */
import { C, P, S, T, at, flip, mv, tabletop, type Act, type Item } from '../compose'
import { hand, slot, stock } from '../playing'

/** One block of cards per player, with different faces for each seat. Seat 0 is listed first. */
const dealt = (id: string, sets: string[], title: string, body: string): Item => {
  const its = sets.map((s) => hand(id, s, title, body))
  return { ...its[0], make: (c, k, seat) => its[Number((seat || '@0').slice(1)) % its.length].make(c, k, seat) }
}
const ROWS: [string, number][] = [['front', 3], ['middle', 5], ['back', 5]]

export const chinesePoker = tabletop('chinese-poker', 'Chinese Poker', [2, 4], 4, '20–40 min', 'Medium', 'Set 13 cards into three poker hands.', ['#9b2c2c', '#d9a514', '#f5f1e6'], (n) => {
  const all = (up: boolean, from: number): Act[] => Array.from({ length: n - from }, (_, i) => i + from).flatMap((s) => ROWS.flatMap(([id, len]) => Array.from({ length: len }, (_, k) => flip(`${id}.${k}@${s}`, up))))
  return {
    setup: [
      S('Cards and stakes', 'Chinese Poker is for 2 to 4 players, each playing for themselves, and is best with four. It uses one standard 52-card deck with no jokers. There is no betting during the hand: you settle up in units afterwards.', 'all', [], 'Also known as Pusoy, Russian Poker or Thirteen Card Poker, and in Cantonese as Sap Sam Cheung. Agree what one unit is worth, in chips or as points on paper, before you start.'),
      S('Deal thirteen cards each', `Shuffle and deal the cards one at a time, face down, until everyone has 13. ${n === 4 ? 'With four players that is the whole deck.' : `The other ${52 - 13 * n} cards are put aside unseen.`}`, 'you', [
        P(dealt('front', ['K♠ 9♦ 4♣', 'A♠ A♦ 6♦', 'J♦ 7♣ 4♦', '6♠ 4♠ 3♣'], 'Front hand', 'Three cards, placed nearest the middle of the table. It must be your weakest hand, and it can only be three of a kind, a pair or high cards.')),
        P(dealt('middle', ['A♥ J♥ 8♥ 6♥ K♦', '7♠ 7♦ 2♣ 2♦ Q♣', '8♠ 8♦ K♥ 5♦ 2♠', '10♥ 7♥ 5♥ 4♥ 2♥'], 'Middle hand', 'Five cards. It must be at least as good as your front hand and no better than your back hand.')),
        P(dealt('back', ['9♠ 9♥ 3♥ 5♣ 5♠', '10♠ J♠ Q♦ K♣ A♣', 'Q♠ Q♥ 3♠ 3♦ 10♦', 'J♣ 10♣ 9♣ 8♣ 6♣'], 'Back hand', 'Five cards, placed nearest to you. It must be your strongest hand.')),
        ...(n < 4 ? [C(stock('rest', 52 - 13 * n, 'Unused cards', `The ${52 - 13 * n} cards that were not dealt. They take no part in this hand.`))] : []),
      ], 'Your cards are shown here spread out in three rows so that you can see them; in a real game you hold them in your hand while you decide.'),
      S('Learn the three hands', 'You will split your 13 cards into a front hand of 3 cards, a middle hand of 5 and a back hand of 5. The back must be the strongest and the front the weakest.', 'you', [], 'The five-card hands use the ordinary poker rankings. In the three-card front hand straights and flushes do not count, so three of a kind is the best it can be.'),
      S('Agree the scoring', 'Decide now how many units a hand is worth and which bonuses you are using.', 'all', [], 'The basic rule is one unit for each hand won. Many groups add a bonus for winning all three hands against an opponent, extra payments (royalties) for very strong hands, and automatic wins for special 13-card holdings. These vary a great deal, so agree them first.'),
      S('Ready to play', 'There are no turns. Everyone picks up their cards and arranges them at the same time.', 'all'),
    ],
    turn: [
      T('Set your three hands', 'Arrange your cards. Here you move the 9♦ to the back to make a full house of nines and fives, the 3♥ to the middle to complete a heart flush, and the K♦ to the front for a pair of kings.', 'you', [
        mv('front.1', at('back', ...slot(2, 5)), 0.3), mv('back.2', at('middle', ...slot(4, 5)), 0.9), mv('middle.4', at('front', ...slot(1, 3)), 1.5),
      ], 9),
      T('Lay them face down', 'When you are happy, place the three hands face down in front of you, the front hand nearest the middle of the table and the back hand nearest to you. Wait until everyone has done the same.', 'you', all(false, 0).slice(0, 13), 7),
      T('Turn everything over', 'All players turn their three hands face up at the same time.', 'all', all(true, 0), 8),
      T('Compare hand against hand', `Compare with each opponent in turn: front against front, middle against middle, back against back. Against the player on your left your full house beats a straight and your flush beats two pair, but your kings lose to a pair of aces. You win two hands and lose one, so that player pays you one unit${n > 2 ? ', and you settle with each of the others in the same way' : ''}.`, 'all', [], 10),
      T('Fouled hands', 'If a player sets the hands in the wrong order, for example a middle hand that beats the back hand, the whole hand is fouled.', 'you', [], 7),
      T('How it ends', 'A fouled hand usually loses all three hands to every opponent, but agree the penalty before you start. Each deal is settled on its own: deal again and play as many hands as you like. Whoever is ahead in units when you stop has won.', 'all'),
    ],
  }
})
