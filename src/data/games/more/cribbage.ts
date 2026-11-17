/** Cribbage (two-player, six-card): play to 31, show your hand, peg round the board to 121. */
import { C, On, P, S, T, at, board, discs, draw, flip, mv, tabletop, zone, type Item } from '../compose'
import { gridUV } from '../layouts'
import { hand, pc, stock } from '../playing'

const hole = gridUV(30, 4)
/** Your cards are the first string; every other seat gets the second, face down. */
const seated = (mine: Item, theirs: Item): Item => ({ ...mine, make: (c, k, seat) => (seat && seat !== '@0' ? theirs : mine).make(c, k, seat) })
const pegs = (id: string, color: string, whose: string) =>
  discs(id, 2, 0.08, color, `${whose} pegs`, 'Two pegs each. The front peg shows your score and the back peg shows what it was before, so you leapfrog the back one forward every time you score.', { h: 0.3, cols: 1, gap: 0.245 })

export const cribbage = tabletop('cribbage', 'Cribbage', [2, 2], 2, '30 min', 'Medium', 'Peg fifteens, pairs and runs to 121.', ['#c89b5a', '#c0392b', '#2e6fb7'], () => ({
  setup: [
    S('Set out the board and pegs', 'Cribbage uses one standard 52-card deck with no jokers, and a cribbage board for keeping score. Each player takes two pegs of one color and starts them off the track.', 'board', [
      C(board('board', 9, 1.8, 'g:grid:30x4:#c89b5a:#5b3a1e:Cribbage', 'Cribbage board', 'A scoring track of holes. Each player travels along their own rows: twice round 60 holes and into the game hole makes 121.')),
      On('board', 0.025, 0.725, pegs('myPegs', '#c0392b', 'Your')),
      On('board', 0.025, 0.275, pegs('oppPegs', '#2e6fb7', 'Opponent\'s')),
    ], 'Often just called Crib. This is the usual six-card game for two; there are also five-card, three-player and four-player forms. Kings are high and aces low, and an ace counts 1.'),
    S('Cut for the first deal', 'Each player cuts the deck. Whoever shows the lower card deals first, and the deal then alternates from hand to hand.', 'stock', [
      C(zone('crib', 2.3, 1.5, 'Crib', 'Four cards, two thrown in by each player. They stay face down until the end of the hand, when they score as an extra hand for the dealer.'), stock('stock', 40, 'Deck', 'The 40 cards left after the deal. One of them is cut and turned up as the starter.')),
    ], 'In this walkthrough your opponent is the dealer.'),
    S('Deal six cards each', 'The dealer shuffles and deals 6 cards to each player, one at a time and face down.', 'you', [
      P(zone('played', 4.4, 1.5, 'Cards played', 'During the play you lay your cards face up here, in front of you, so each player can pick their own hand back up for the show.')),
      P(seated(
        hand('hand', '5♣ 6♦ 7♦ 8♠ J♥ K♣', 'Your hand', 'Your 6 cards. You will keep four of them and throw two into the crib.'),
        hand('hand', '3♦ 7♠ 8♥ 9♣ 2♥ Q♠', 'Your hand', 'Your 6 cards. You will keep four of them and throw two into the crib.'),
      )),
    ]),
    S('Know what scores', 'You score for cards adding to fifteen (2 points), pairs (2) and runs of three or more (1 per card). These score both during the play and when hands are shown. Flushes, and 1 for holding the jack of the starter\'s suit, score only in the show.', 'board', [], 'Number cards count their face value, aces count 1, and jacks, queens and kings count 10.'),
    S('Ready to play', 'Each hand has three parts: throw two cards to the crib, play the cards out one at a time, then show and count the hands. The non-dealer plays the first card.', 'all', [], 'The first player to peg 121 wins, even in the middle of a hand.'),
  ],
  turn: [
    T('Throw two cards to the crib', 'Each player picks two cards and lays them face down in the crib, which belongs to the dealer. You keep the 5, 6, 7 and 8.', 'crib', [
      flip('hand.4', false), mv('hand.4', at('crib', 0.2, 0.5)), flip('hand.5', false), mv('hand.5', at('crib', 0.4, 0.5, 0.02)),
      mv('hand.4@1', at('crib', 0.6, 0.5, 0.04)), mv('hand.5@1', at('crib', 0.8, 0.5, 0.06)),
    ]),
    T('Cut for the starter', 'The non-dealer cuts the deck and the dealer turns up the top card of the lower part. This starter counts as part of every hand at the show. If it is a jack, the dealer pegs 2 at once.', 'stock', [
      draw('stock', at('stock'), pc('4♥'), 'starter'),
    ]),
    T('Play to fifteen', 'You lead the 8 and say "eight". Your opponent plays a 7 and says "fifteen for two", then moves a peg two holes.', 'played', [
      mv('hand.3', at('played', 0.15, 0.5)), flip('hand.1@1'), mv('hand.1@1', at('played@1', 0.15, 0.5)), mv('oppPegs.0', at('board', ...hole(1, 3)), 2.2),
    ], 9),
    T('Keep the count going', 'You add the 6 for 21. With the 7 and 8 just played it makes a run of three, so you peg 3. Play goes on until nobody can play without passing 31: whoever played last then pegs 1 for the go, or 2 for hitting 31 exactly, and the count restarts at zero.', 'board', [
      mv('hand.1', at('played', 0.4, 0.5)), mv('myPegs.1', at('board', ...hole(2, 0)), 1.6),
    ], 9),
    T('Show the hands', 'The non-dealer counts first, then the dealer counts their hand and then the crib, each using the starter as a fifth card. Your 5, 6, 7 and 8 with the 4 score 9: two fifteens and a run of five.', 'you', [], 9),
    T('How it ends', 'The deal passes to the other player and you play hand after hand. The first to peg 121 wins the game at once.', 'board'),
  ],
}))
