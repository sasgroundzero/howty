/** Blackjack (Twenty-One), played at home: one person is the dealer and bank, everyone else bets against them. */
import { C, On, P, R, S, T, at, discs, draw, flip, spawn, tabletop, zone, type Item } from '../compose'
import { hidden, pc, shown, stock } from '../playing'

const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const CARDS = 'The two cards a player starts with, dealt face up. Number cards count their face value, picture cards count 10, and an ace counts 11 or 1, whichever suits the hand better.'
const chip = (id: string, title: string, body: string) => discs(id, 1, 0.25, '#c0392b', title, body, { h: 0.1 })

export const blackjack = tabletop('blackjack', 'Blackjack', [1, 7], 3, '15–60 min', 'Easy', 'Beat the dealer to 21 without going over.', ['#1f6b43', '#1c1917', '#c0392b'], (n) => {
  const others = n > 1
  return {
    setup: [
      S('Cards, chips and a dealer', `Blackjack uses a standard 52-card deck with no jokers. One person is the dealer and holds the bank; the other ${n === 1 ? 'player bets' : `${n} players bet`} against the dealer, never against each other.`, 'c', [
        C(stock('deck', 52, 'Deck', 'The shuffled 52-card deck the dealer deals from. With a single deck it is usual to reshuffle after every round.'), zone('dealer', 4.2, 1.5, 'Dealer\'s hand', 'The dealer\'s cards go here: one face up, one face down, and then any cards the dealer has to draw.')),
        R(discs('bank', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Bank', 'The dealer\'s chips. Winning bets are paid out of the bank and losing bets go into it.', { h: 0.5 })),
      ], 'Also called Twenty-One, Vingt-et-Un or, in a British variant with its own rules, Pontoon. The player count here is the number of people betting, so add one for the dealer; this guide shows up to 7. Casinos shuffle several decks together, but one deck is enough at home. Agree whether one person deals all evening or the deal passes round.'),
      S('Share out chips', 'Give every player a stack of chips. What the chips are worth, and the smallest and largest bet allowed, are whatever the group agrees.', 'you', [
        P(zone('bet', 1.7, 1, 'Bet', 'Your stake for this round sits here. It stays put until the dealer settles with you.')),
        P(zone('seat', 3, 1.5, 'Your cards', 'Your cards are dealt here face up.')),
        P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your own stack. You bet from it and your winnings are added to it.', { h: 0.4 })),
      ]),
      S('Place your bets', 'Before any cards are dealt, every player puts a bet in front of them. The dealer does not bet.', 'bet', [
        On('bet', 0.3, 0.5, chip('wager', 'Bet', 'One player\'s stake for this round. It must be placed before the deal and cannot be taken back.')),
      ]),
      S('Deal two cards each', `The dealer gives one card to ${others ? 'each player in turn clockwise' : 'the player'}, then one to themselves, and then does the same again. Players' cards are face up.`, 'you', [
        On('seat', 0.33, 0.5, seated(shown('cards', '7♣ 5♦', 'Starting cards', CARDS), shown('cards', '10♠ 8♦', 'Starting cards', CARDS))),
      ], 'Some groups deal the players\' cards face down instead. It makes no difference to the play, because the dealer has no choices to make.'),
      S('The dealer\'s two cards', 'One of the dealer\'s cards is face up for everyone to see. The other, the hole card, stays face down until all the players have finished.', 'dealer', [
        On('dealer', 0.14, 0.5, shown('up', '10♥', 'Dealer\'s upcard', 'The dealer\'s face-up card. Players decide how to play their own hands by looking at it.')),
        On('dealer', 0.39, 0.5, hidden('holeD', '6♣', 'Hole card', 'The dealer\'s face-down card. It is turned over once every player has finished.')),
      ], 'In the American style, a dealer showing an ace or a ten-point card peeks at the hole card straight away and, with a two-card 21, turns it over and ends the round. In the European style the dealer takes the second card only after the players have acted. Agree which you use.'),
      S('Ready to play', `An ace with a ten-point card in your first two cards is a blackjack, the best hand. Otherwise ${others ? 'each player in turn, starting on the dealer\'s left, plays' : 'you play'} a hand to the finish: hit to take another card, or stand to stop.`, 'all', [], 'You are trying to finish closer to 21 than the dealer. Go over 21 and you are bust: you lose your bet at once, whatever the dealer does later. Table rules vary, so settle them first: whether the dealer draws on a soft 17 (an ace counted as 11 with a 6), which hands may be doubled, whether split hands may be split again, and whether the insurance side bet against a dealer\'s ace is offered.'),
    ],
    turn: [
      T('Hit or stand', 'You have 12 and the dealer shows a ten, so you hit. The dealer gives you a 7 face up for a total of 19, and you stand.', 'you', [
        draw('deck', at('cards.1', 1.15, 0.5, 0.02), pc('7♠'), 'hit'),
      ], 8),
      T('Double down and split', 'On your first two cards you may instead double down: add a second bet equal to the first, take exactly one more card, and stop. If your two cards are a pair you may split them into two hands, putting a matching bet on the second. Split aces usually get just one card each, and a 21 made on a split hand counts as 21, not blackjack.', 'you', [], 9),
      T('The dealer plays', `${others ? 'The other players stand on 18. ' : ''}Now the dealer turns the hole card over: 16. The dealer has no choice and must draw on 16 or less and stand on 17 or more. A 2 makes 18, so the dealer stops.`, 'dealer', [
        flip('holeD'), draw('deck', at('dealer', 0.64, 0.5), pc('2♣'), 'dealerHit', 1.2),
      ], 9),
      T('Settle the bets', `Your 19 beats the dealer's 18, so the bank pays you the same amount as your bet. ${others ? 'The players with 18 tie with the dealer: a tie is a push, and they simply keep their bets. ' : ''}A lower total than the dealer's loses the bet to the bank.`, 'bet', [
        spawn(chip('win', 'Winnings', 'A winning bet is paid at even money: one chip from the bank for each chip you bet.'), at('bet', 0.7, 0.5), 'bank.1'),
      ], 9),
      T('Blackjack pays 3 to 2', 'A blackjack beats any other 21 and is paid at 3 to 2: three chips for every two you bet. If the dealer also has blackjack it is a push. Some casinos pay only 6 to 5, which is worse for the player. If the dealer goes bust, every player who has not gone bust wins.', 'all', [], 9),
      T('How it ends', 'Gather the cards, place new bets and deal again. There is no fixed end: play for as long as you agreed, and whoever has gained the most chips has done best.', 'all'),
    ],
  }
})
