/** Mao: a shedding game where the rules are a secret that new players have to work out. */
import { C, P, S, T, at, draw, mv, set, tabletop } from '../compose'
import { hand, pc, shown, stock } from '../playing'

const show = (id: string, card: string) => set(id, { faceUp: true, face: pc(card) })

export const mao = tabletop('mao', 'Mao', [3, 8], 5, '20–40 min', 'Medium', 'Nobody will tell you the rules. Work them out.', ['#7f1d1d', '#facc15', '#1c1917'], (n) => {
  const packs = Math.ceil(n / 3)
  const left = packs * 52 - 7 * n - 1
  return {
    setup: [
      S('Choose a dealer who knows the game', 'Mao needs at least one player who already knows the rules their group plays by. That player deals and runs the game.', 'all', [],
        'The game is also spelled Mau, and it grew out of the German game Mau-Mau. More than 8 can play, but this guide stops at 8. Every group has its own rules, so there is no official set.'),
      S('Shuffle the cards', `Use standard 52-card decks with no jokers. With ${n} players, shuffle ${packs === 1 ? 'one deck' : `${packs} decks together`}.`, 'c', [],
        'A common guide is about one deck for every two or three players. The exact number does not matter.'),
      S('Deal a hand to everyone', 'The dealer gives every player the same number of cards, face down. Seven each is used here.', 'you', [
        P(hand('hand', '6♥ J♥ 2♣ 9♣ K♦ 4♦ 10♠', 'Your hand', 'Your seven cards. You win a round by being the first to get rid of all of them.')),
      ], 'Some groups deal three, and in some the dealer simply decides. Many also forbid touching your cards until the dealer says the game has begun.'),
      S('Set out the stock and the first card', 'The rest of the cards go face down in the middle as the stock. The dealer turns the top one face up beside it to start the pile.', 'c', [
        C(stock('stock', left, 'Stock', `The ${left} cards left after the deal. You draw from here when you cannot play, and penalty cards come from here too.`), shown('top', '6♠', 'Pile', 'The face-up pile. Each card played must match the one on top.')),
      ]),
      S('Hear the one rule you are told', 'New players are told only this: you may not be told the rules. You may not ask about them or explain them to anyone else either.', 'all', [],
        'What everyone can see is that the game works like Crazy Eights: you get rid of cards by matching the top card of the pile.'),
      S('Ready to play', 'The player on the dealer\'s left goes first and play runs clockwise. On your turn you play one card that matches the top card in suit or in rank.', 'all', [], 'Here you are on the dealer\'s left, so you start.'),
    ],
    turn: [
      T('Match the top card', 'The top card is the 6♠, so you need a spade or a 6. You play the 6♥.', 'c', [
        mv('hand.0', at('top', 0.5, 0.5, 0.02)),
      ]),
      T('A penalty out of nowhere', 'The next player lays the Q♥, which looks fine. The dealer says what they did wrong, but not which rule it broke, and hands them a card from the stock as a penalty.', 'c', [
        show('hand.3@1', 'Q♥'), mv('hand.3@1', at('top', 0.5, 0.5, 0.04)), draw('stock', at('hand.6@1', 1.15, 0.5, 0.02), undefined, 'pen', 1.8),
      ], 9),
      T('Draw if you cannot play', 'If you have no card of the right suit or rank on a later turn, draw one card from the stock instead.', 'you', [
        draw('stock', at('hand.6', 1.15, 0.5, 0.02), pc('3♣'), 'd1'),
      ]),
      T('Work out the hidden rules', 'The dealer\'s group has extra rules: certain cards may do something special, or you may have to say or do something at the right moment. Break one and you get a penalty card, usually one per mistake. Watch what earns a penalty and what does not.', 'all', [], 9),
      T('How it ends', 'The first player to get rid of all their cards wins the round. In many groups the winner then adds one new secret rule of their own before the next round.', 'all'),
    ],
  }
})
