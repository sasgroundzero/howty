/** Big Two: a climbing game where twos are high and poker hands can be played as five-card combinations. */
import { C, P, S, T, at, hide, mv, set, tabletop, zone } from '../compose'
import { hand, pc, shown } from '../playing'

const BASE = '3♦ 4♣ 5♠ 6♥ 6♦ 8♣ 9♠ 10♥ J♦ Q♣ K♠ A♥ 2♦'
const MORE = ' 4♥ 7♦ 9♣ J♠'
const show = (id: string, s: string) => set(id, { face: pc(s), faceUp: true })

export const bigTwo = tabletop('big-two', 'Big Two', [3, 4], 4, '20–40 min', 'Medium', 'Climb past the table with twos on top.', ['#c0392b', '#1c1917', '#e0b12f'], (n) => {
  const size = n === 4 ? 13 : 17
  return {
    setup: [
      S('Sort out the deck', 'Big Two uses one standard 52-card deck with no jokers. Leave space in the middle of the table for the cards that are played.', 'c', [
        C(zone('pile', 4.2, 3, 'Played cards', 'Each play goes here on top of the one it beats. When everyone else passes, the pile is cleared away.')),
      ], 'Also known as Deuces, Big Deuce, Choh Dai Di and Pusoy Dos. It is best for four players. Two can play as well, but the two-player deal varies from group to group.'),
      S(`Deal ${size} cards each`, n === 4 ? 'Shuffle and deal out the whole pack one card at a time, face down. Everyone has 13.' : 'Shuffle and deal 17 cards each, face down. Turn the one card left over face up in the middle.', 'you', [
        P(hand('hand', BASE + (n === 4 ? '' : MORE), 'Your hand', `Your ${size} cards. Sort them so you can spot pairs, triples and five-card hands.`, { cols: 7 })),
        ...(n === 4 ? [] : [C(shown('spare', '8♣', 'Spare card', 'The one card left after dealing 17 each. Whoever holds the 3 of diamonds adds it to their hand.'))]),
      ], n === 4 ? undefined : 'If the spare card is itself the 3 of diamonds, the holder of the 3 of clubs takes it instead.'),
      S('Learn the ranking', 'Twos are the highest cards, then aces, kings and so on down to threes, the lowest. Suits also rank: spades are highest, then hearts, then clubs, with diamonds lowest.', 'hand', [], 'So the 3 of diamonds is the lowest card in the pack and the 2 of spades is the highest. Some regional versions order the suits differently.'),
      S('Learn the combinations', 'You may play a single card, a pair, three of a kind, or a five-card poker hand. From weakest to strongest the five-card hands are: straight, flush, full house, four of a kind with any fifth card, and straight flush.', 'hand', [], 'A play can only be beaten by a better play with the same number of cards.'),
      S('Ready to play', 'Whoever holds the 3 of diamonds leads first and must include it in their opening play. In this example that is you. On your turn you either beat the last play or pass.', 'all', [], 'Play traditionally passes to the right, but many groups go clockwise, as this example does. Agree which before you start.'),
    ],
    turn: [
      T('Lead the 3 of diamonds', `${n === 4 ? '' : 'You hold the 3♦, so you pick up the spare card first. '}You open with the 3♦ on its own. You could also have led it as part of a pair or a five-card hand.`, 'pile', [
        ...(n === 4 ? [] : [mv('spare', at('hand.16', 1.15, 0.5, 0.02))]),
        mv('hand.0', at('pile', 0.5, 0.75)),
      ]),
      T('Beaten by suit', 'The next player must play a higher single card or pass. They play the 3♠, which beats your 3♦ because spades outrank diamonds.', 'pile', [
        show('hand.0@1', '3♠'), mv('hand.0@1', at('pile', 0.5, 0.6, 0.02)),
      ]),
      T('Beaten by rank', 'The player after that plays the K♥. Rank is compared first, and suit only matters between cards of the same rank.', 'pile', [
        show('hand.1@2', 'K♥'), mv('hand.1@2', at('pile', 0.5, 0.45, 0.04)),
      ]),
      T('Everyone passes', 'Passing does not shut you out: you may play again if the turn comes back to you. When everyone else passes in a row, the pile is cleared and the player who played last leads any combination they like.', 'pile', [
        hide('hand.0'), hide('hand.0@1'), hide('hand.1@2'),
      ]),
      T('Going out', 'The hand ends as soon as one player has played their last card. Everyone else takes 1 penalty point for each card they still hold.', 'all'),
      T('How it ends', 'Many groups double the penalty for 10 or more cards left and triple it for a player who never played a card, but scoring varies widely. Play an agreed number of hands: the lowest total wins.', 'all'),
    ],
  }
})
