/** Knock Out Whist: a shrinking trick-taking game where a hand with no tricks knocks you out. */
import { C, P, R, S, T, at, flip, mv, set, tabletop, zone } from '../compose'
import { hand, pc, shown, stock } from '../playing'

const show = (id: string, card: string) => set(id, { faceUp: true, face: pc(card) })

export const knockOutWhist = tabletop('knock-out-whist', 'Knock Out Whist', [2, 7], 4, '20–30 min', 'Easy', 'Win a trick every hand or you are out.', ['#1e3a5f', '#c0392b', '#ffffff'], (n) => {
  const left = 52 - 7 * n - 1
  return {
    setup: [
      S('Take one pack', 'Knock Out Whist uses one standard 52-card deck with no jokers. In every suit the ace is the highest card and the 2 is the lowest.', 'c', [
        C(zone('trick', 3.4, 3, 'Trick', 'Each player plays one card here in turn. The best card takes all of them.')),
      ], 'The game is also called Knockout Whist or Trumps, and in North America sometimes Scrounge or Rat. Two to seven can play.'),
      S('Deal seven cards each', 'Shuffle and deal seven cards to each player, one at a time and face down.', 'you', [
        P(zone('tricks', 1.6, 1.5, 'Tricks won', 'Stack the tricks you win here, face down. You need at least one to stay in the game.')),
        P(hand('hand', 'K♣ 8♣ A♥ 9♥ 5♦ J♠ 3♠', 'Your hand', 'Your seven cards for the first hand. Each later hand is one card smaller.')),
      ]),
      S('Turn up a card for trumps', 'Turn the next card of the pack face up. Its suit is the trump suit for this first hand. The other undealt cards are not used.', 'r', [
        R(stock('stock', left, 'Undealt cards', `The ${left} ${left === 1 ? 'card' : 'cards'} left over. They stay face down and out of play for this hand.`), shown('trump', '6♥', 'Trump card', 'The card turned up after the deal. Its suit beats every other suit in this hand.')),
      ]),
      S('Learn how a trick works', 'One player leads any card and the others must play a card of the same suit if they have one. A player with none of that suit may play anything, including a trump.', 'trick', [], 'The highest trump wins the trick. If nobody played a trump, the highest card of the suit that was led wins.'),
      S('Ready to play', 'The player on the dealer\'s left leads to the first trick and play runs clockwise. Whoever wins a trick leads to the next one.', 'all', [], 'Here you are on the dealer\'s left, so you lead.'),
    ],
    turn: [
      T('Lead a card', 'You may lead any card you like. You start with the K♣.', 'trick', [mv('hand.0', at('trick', 0.5, 0.78))]),
      T('Everyone follows suit', 'Going clockwise, each player plays one card and must play a club if they have one. The player on your left plays the 4♣.', 'trick', [
        show('hand.1@1', '4♣'), mv('hand.1@1', at('trick', 0.2, 0.5)),
      ]),
      T('The best card takes the trick', 'Nobody beat your king and nobody trumped it, so you win. Gather the cards face down beside you, then lead to the next trick.', 'tricks', [
        flip('hand.0', false), mv('hand.0', at('tricks', 0.5, 0.5)), flip('hand.1@1', false), mv('hand.1@1', at('tricks', 0.5, 0.5, 0.02)),
      ]),
      T('No tricks and you are out', 'When all seven tricks have been played, anyone who took none is knocked out of the game. Many groups give the first player this happens to a "dog\'s life": a single card in the next hand as a last chance.', 'all', [], 6),
      T('Deal one card fewer', 'The deal passes to the left and the next hand has six cards each, then five, and so on down to one. From the second hand on, the player who won the most tricks last time looks at their cards and names the trump suit. Tied players cut the pack for it.', 'you', [], 9),
      T('How it ends', 'The game ends as soon as only one player is left, or with the single trick of the one-card hand. That player wins.', 'all', [], 6),
    ],
  }
})
