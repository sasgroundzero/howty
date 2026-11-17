/** Le Truc: three cards, three tricks, and a stake you can raise by bluffing. */
import { C, P, S, T, at, flip, mv, tabletop, zone, type Item } from '../compose'
import { hand, pc } from '../playing'

/** A hand whose face-down copies at other seats get their own faces: seen['0@1'] is card 0 of seat 1. */
const dealt = (id: string, mine: string, seen: Record<string, string>, title: string, body: string, o: { cols?: number } = {}): Item => {
  const it = hand(id, mine, title, body, o)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); const s = seen[`${k}${seat ?? ''}`]; return s ? { ...m, props: { ...m.props, face: pc(s) } } : m } }
}

export const leTruc = tabletop('le-truc', 'Le Truc', [2, 2], 2, '15–20 min', 'Easy', 'Three cards each and a lot of bluffing.', ['#27457a', '#c9a227', '#9b2c2c'], () => ({
  setup: [
    S('Make the 32-card pack', 'From a standard deck take out the 2s, 3s, 4s, 5s and 6s. The 32 cards left run from 7 up to ace in each suit.', 'c', [
      C(zone('trick', 3, 3, 'Trick', 'The leader plays a card here and the other player answers with one. The higher card wins.')),
    ], 'Also called Truc. This is the old French game for two; Truc in Catalonia and Truco in South America are relatives played with Spanish cards.'),
    S('Learn the odd card order', 'The 7 is the highest card, then the 8, then A, K, Q, J, 10, and the 9 is lowest. Suits do not matter at all and there are no trumps.', 'c', [], 'A few local versions put the 8 above the 7.'),
    S('Deal three cards each', 'The dealer gives each player 3 cards, one at a time. The rest of the pack is put aside.', 'you', [
      P(dealt('hand', '7♦ K♠ 10♥', { '1@1': 'Q♣', '0@1': '9♦' }, 'Hand', 'Each player holds 3 cards. You can see only your own.')),
      P(zone('won', 2, 1.4, 'Tricks won', 'Tricks you have taken in this hand. Two of the three win it.')),
    ]),
    S('Offer a fresh deal', 'Before play the non-dealer may ask for new cards. If the dealer agrees, both hands are put aside and three new cards each are dealt. This can happen only once per hand.', 'hand'),
    S('Keep score', 'Use paper and pencil or a pile of counters. A hand is worth 1 point to its winner unless the stake is raised.', 'c', [], 'A game is 12 points, and most people play the best of three games.'),
    S('Ready to play', 'The non-dealer leads any card and the dealer answers with any card. The higher card wins the trick and its winner leads the next.', 'all', [], 'If both cards are the same rank the trick is spoiled: nobody wins it, and the same player leads again.'),
  ],
  turn: [
    T('You lead', 'You did not deal, so you lead. You keep your 7 back and play the K♠.', 'trick', [mv('hand.1', at('trick', 0.5, 0.75))]),
    T('Your opponent answers', 'Your opponent can play any card and puts down a queen. Suits are ignored, and a king beats a queen, so the first trick is yours.', 'trick', [flip('hand.1@1'), mv('hand.1@1', at('trick', 0.5, 0.25))]),
    T('Raise the stake', 'Take the trick. Before you lead again you ask "two more?", offering to raise the hand from 1 point to 2. Your opponent must accept or give up the hand at its old value, and here accepts.', 'you', [
      flip('hand.1', false), mv('hand.1', at('won', 0.4, 0.5)), flip('hand.1@1', false), mv('hand.1@1', at('won', 0.4, 0.5, 0.02)),
    ], 9),
    T('Win the second trick', 'You lead the 7♦, which nothing can beat. Your opponent plays a 9, so you have two tricks and win the hand for 2 points.', 'trick', [
      mv('hand.0', at('trick', 0.5, 0.75)), flip('hand.0@1'), mv('hand.0@1', at('trick', 0.5, 0.25)),
    ]),
    T('Raising again', 'Each further raise adds 2 points, so a hand goes 1, 2, 4, 6 and so on. On your turn you may also stake "my remainder", the whole game; if that is accepted, the winner of the hand wins the game.', 'all', [], 8),
    T('How it ends', 'If you each win one trick and one is spoiled, whoever won a trick first takes the hand. The deal alternates, and the first player to 12 points wins the game.', 'all'),
  ],
}))
