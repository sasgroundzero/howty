/** Five-Card Draw: five cards each, one chance to swap some, and a betting round either side. */
import { C, On, P, S, T, at, discs, draw, flip, hide, mv, set, spawn, tabletop, zone, type Act, type Item } from '../compose'
import { hand, pc, slot, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const HAND = 'Five private cards. Only you may look at them. You may swap some of them once, and the best five-card poker hand at the showdown wins.'
const chip = (id: string, title: string, body: string, h = 0.08) => discs(id, 1, 0.25, '#e9e4d8', title, body, { h })

export const fiveCardDraw = tabletop('five-card-draw', 'Five-Card Draw', [2, 6], 5, '1–2 hr', 'Easy', 'Five cards, one draw, best hand wins.', ['#1f6b43', '#27457a', '#e9e4d8'], (n) => {
  const dealer = n - 1
  const folds: Act[] = Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 2).flatMap((s) => [0, 1, 2, 3, 4].map((k) => hide(`hand.${k}@${s}`, 0.9)))
  return {
    setup: [
      S('Cards and chips', 'Five-Card Draw uses one standard 52-card deck with no jokers. Give every player the same starting stack of chips.', 'you', [
        P(zone('bet', 2.6, 1, 'Bets', 'Chips you bet in the current round sit here in front of you. When the round is over they join the pot.')),
        P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. How many chips everyone starts with, and what they are worth, is up to the group.', { h: 0.4 })),
      ], 'Also called draw poker or California draw. It is best for up to 6 players: with 7 or 8 the deck can run out during the draw, so this guide stops at 6. Agree the ante, the bet sizes and any limit on raises before you start.'),
      S('Lay out the table', 'Leave room in the middle for the pot and for a pile of discards.', 'c', [
        C(zone('muck', 1.6, 1.5, 'Discards', 'Cards thrown away in the draw, and the hands of players who fold, go here face down.'), zone('pot', 2, 1.5, 'Pot', 'The antes and all the chips bet in the hand. The winner of the hand takes it.')),
      ]),
      S('Choose a dealer', `Pick a first dealer, for example by dealing cards round until someone gets a jack. ${n === 2 ? 'Here your opponent deals.' : 'Here the player on your right deals.'}`, 'button', [
        On(`bet@${dealer}`, 0.9, 0.5, discs('button', 1, 0.28, '#f5f1e6', 'Dealer button', 'Marks who is dealing this hand. The deal passes one seat clockwise after every hand.', { label: 'D', h: 0.08, ink: '#1c1917' })),
      ], 'How the first dealer is picked varies.'),
      S('Everyone antes', `Before the deal each of the ${n} players puts the same small stake, the ante, into the pot.`, 'pot', [
        On('pot', 0.5, 0.5, discs('antes', 1, 0.25, '#e9e4d8', 'Antes', `One ante from each of the ${n} players. It gives everyone something to play for from the start.`, { h: 0.06 * n })),
      ], 'The size of the ante is whatever your group agrees. Some groups play with a small and a big blind, as in Hold\'em, instead of antes.'),
      S('Deal five cards each', 'Starting on the dealer\'s left, deal one card at a time clockwise, face down, until everyone has 5 cards.', 'hand', [
        P(seated(hand('hand', 'K♠ K♦ 9♣ 5♥ 2♦', 'Your hand', HAND), hand('hand', 'Q♥ Q♣ 8♦ 8♠ 3♣', 'Your hand', HAND))),
        C(stock('deck', 52 - 5 * n, 'Deck', `The ${52 - 5 * n} cards left after the deal. Replacement cards in the draw come from the top.`)),
      ]),
      S('Ready to play', 'The player on the dealer\'s left acts first. You may check or bet; once someone has bet, each player in turn folds, calls or raises.', 'all', [], 'If everyone checks, the hand is thrown in, the deal passes on and everyone antes again into the same pot. In the "jacks or better" version you need at least a pair of jacks to make the first bet.'),
    ],
    turn: [
      T('First betting round', n === 2
        ? 'You are on the dealer\'s left, so you act first. You hold a pair of kings and bet. Your opponent calls by putting in the same amount.'
        : 'You are on the dealer\'s left, so you act first. You hold a pair of kings and bet. The player on your left calls by putting in the same amount, and the others fold.', 'bet', [
        spawn(chip('open', 'Your bet', 'The opening bet of the first round.'), at('bet', 0.15, 0.5), 'chips.0'),
        spawn(chip('see', 'Call', 'A call matches the bet that has been made.'), at('bet@1', 0.15, 0.5), 'chips.0@1', undefined, 0.8), ...folds,
      ], 8),
      T('The draw', 'Starting on the dealer\'s left, each player still in discards the cards they do not want face down and is dealt the same number of new ones. You keep the kings and swap three; your opponent swaps one.', 'you', [
        ...[2, 3, 4].flatMap((k, i) => [flip(`hand.${k}`, false), mv(`hand.${k}`, at('muck', 0.5, 0.5, i * 0.02), 0.3 + i * 0.2)]),
        draw('deck', at('hand', ...slot(2, 5)), pc('K♣'), 'new0', 1.4), draw('deck', at('hand', ...slot(3, 5)), pc('7♦'), 'new1', 1.7), draw('deck', at('hand', ...slot(4, 5)), pc('4♠'), 'new2', 2),
        mv('hand.4@1', at('muck', 0.5, 0.5, 0.06), 2.8), draw('deck', at('hand@1', ...slot(4, 5)), undefined, 'theirs', 3.3),
      ], 10),
      T('How many may you swap?', 'Traditionally you may swap up to three cards, or keep all five, which is called standing pat. Many groups allow four if you show that the card you keep is an ace, and some allow any number. Agree this before you play.', 'muck', [], 9),
      T('Second betting round', 'The player who opened the first round acts first again. You now have three kings and bet; your opponent calls.', 'bet', [
        spawn(chip('bet2', 'Your second bet', 'In limit games the bets after the draw are usually twice the size of those before it.', 0.16), at('bet', 0.4, 0.5), 'chips.0'),
        spawn(chip('see2', 'Call', 'A call matches the bet that has been made.', 0.16), at('bet@1', 0.4, 0.5), 'chips.0@1', undefined, 0.9),
      ], 8),
      T('Showdown', 'If two or more players are still in, they show their hands, the last player to bet or raise going first. Your three kings beat two pair, queens and eights, so you take the pot.', 'all', [
        ...[0, 1, 2, 3].map((k) => flip(`hand.${k}@1`)), set('theirs', { face: pc('6♥'), faceUp: true }),
        mv('antes', at('bet', 0.65, 0.5), 1.5),
      ], 9),
      T('How it ends', 'If everyone else folds, the last player in wins the pot without showing. The deal then passes to the left. Play for as long as you agreed, or until one player holds all the chips.', 'all'),
    ],
  }
})
