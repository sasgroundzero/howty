/** Contract bridge: thirteen cards each, an auction, and one hand laid face up as the dummy. */
import { C, P, S, T, at, by, discs, flip, mv, spawn, tabletop, zone, type Item } from '../compose'
import { hand, pc } from '../playing'

/** A hand whose face-down copies at other seats get their own faces: seen['0@1'] is card 0 of seat 1. */
const dealt = (id: string, mine: string, seen: Record<string, string>, title: string, body: string, o: { cols?: number } = {}): Item => {
  const it = hand(id, mine, title, body, o)
  return { ...it, make: (c, k, seat) => { const m = it.make(c, k, seat); const s = seen[`${k}${seat ?? ''}`]; return s ? { ...m, props: { ...m.props, face: pc(s) } } : m } }
}
const SPOT: [number, number][] = [[0.7, 0.75], [0.3, 0.75], [0.3, 0.25], [0.7, 0.25]]
const MINE = 'A♠ K♠ J♠ 9♠ 5♠ K♥ 4♥ A♦ Q♦ 6♦ 10♣ 7♣ 3♣'
const DUMMY = 'Q♠ 10♠ 8♠ 3♠ A♥ 7♥ 2♥ K♦ 5♦ 8♣ 6♣ 4♣ 2♣'.split(' ')
const SEEN: Record<string, string> = { '0@1': 'K♣', '0@3': '9♣', ...Object.fromEntries(DUMMY.map((s, k) => [`${k}@2`, s])) }

export const bridge = tabletop('bridge', 'Bridge', [4, 4], 4, '60–120 min', 'Hard', 'Bid a contract, then make it with dummy.', ['#1f6f4a', '#1c1917', '#c0392b'], () => ({
  setup: [
    S('Take a 52-card deck', 'Bridge uses one standard 52-card deck with no jokers. In every suit the cards rank from ace (high) down to 2.', 'c', [
      C(zone('trick', 3.4, 3, 'Trick', 'Each of the four hands plays one card here in turn. The highest trump, or the highest card of the suit led, wins the trick.')),
    ], 'The full name is contract bridge. Rubber bridge is the home game; clubs and tournaments play duplicate bridge, which uses the same deal, auction and play but scores each deal on its own.'),
    S('Sit opposite your partner', 'The four players form two partnerships, and partners sit across the table from each other. The sides are usually called North-South and East-West.', 'all'),
    S('Deal thirteen cards each', 'The dealer deals all the cards one at a time, face down and clockwise, starting on the left. Everyone has 13.', 'you', [
      P(dealt('hand', MINE, SEEN, 'Hand', 'Each player holds 13 cards. Sort yours by suit and keep them hidden.', { cols: 7 })),
      P(zone('won', 2, 1.4, 'Tricks won', 'Tricks a side has taken are kept here face down so they can be counted.')),
    ]),
    S('Understand a bid', 'A bid is a number from 1 to 7 and a trump suit or "no trumps". It promises that your side will win six tricks plus that number, so "four spades" means ten tricks with spades as trumps.', 'hand', [], 'A bid must be higher than the last: a bigger number, or the same number in a higher denomination. From low to high these are clubs, diamonds, hearts, spades, no trumps.'),
    S('Hold the auction', 'The dealer speaks first and the turn passes clockwise. On each turn you pass or bid, and you may also double an opposing bid. The auction ends when three players in a row pass.', 'all', [], 'A doubled bid can be redoubled by the side that made it. If all four players pass at the start, the cards are thrown in and the next dealer deals.'),
    S('Keep score on a pad', 'You need a bridge score pad or plain paper. Only tricks beyond the first six count toward a contract.', 'c', [], 'In rubber bridge a side wins a game by scoring 100 points for contracts it bid and made. The full table of trick values, bonuses and penalties is in any bridge rulebook.'),
    S('Ready to play', 'The last bid is the contract. On the side that made it, the first player to have named that suit is the declarer, and the player on the declarer\'s left leads to the first trick.', 'all', [], 'Declarer\'s partner is the dummy, whose cards go face up on the table after the opening lead.'),
  ],
  turn: [
    T('The auction', 'You dealt and open "one spade". Your partner raises to "three spades" and you bid "four spades". The opponents pass throughout, so you are the declarer and must win ten tricks.', 'all', [
      spawn(discs('contract', 1, 0.5, '#1c1917', 'Contract', 'A reminder of the final bid: four spades, played by you.', { label: '4♠', ink: '#ffffff' }), by('trick', 2.6, 0)),
    ], 9),
    T('The opening lead', 'The player on your left chooses any card and leads it face up. Here it is the K♣.', 'trick', [flip('hand.0@1'), mv('hand.0@1', at('trick', ...SPOT[1]))]),
    T('Dummy goes down', 'Now your partner lays all 13 cards face up, sorted by suit. From here on you choose the cards played from dummy as well as from your own hand, and your partner takes no part.', 'hand@2', DUMMY.map((_, k) => flip(`hand.${k}@2`)), 9),
    T('Finish the trick', 'Play goes clockwise and each hand must follow suit if it can. You call for the 2♣ from dummy, the next defender plays the 9♣, and you play the 3♣.', 'trick', [
      mv('hand.12@2', at('trick', ...SPOT[2])), flip('hand.0@3'), mv('hand.0@3', at('trick', ...SPOT[3])), mv('hand.12', at('trick', ...SPOT[0])),
    ], 9),
    T('The king wins', 'No trump was played, so the highest club takes the trick. One defender keeps all the tricks for that side, and the winner leads to the next trick.', 'won@1', [
      flip('hand.0@1', false), mv('hand.0@1', at('won@1', 0.5, 0.5)), flip('hand.12@2', false), mv('hand.12@2', at('won@1', 0.5, 0.5, 0.02)), flip('hand.0@3', false), mv('hand.0@3', at('won@1', 0.5, 0.5, 0.04)), flip('hand.12', false), mv('hand.12', at('won@1', 0.5, 0.5, 0.06)),
    ]),
    T('How it ends', 'After 13 tricks, your side scores if you took at least the ten you bid; otherwise the defenders score a penalty. In rubber bridge the first side to win two games takes the rubber, and the higher total score wins.', 'all'),
  ],
}))
