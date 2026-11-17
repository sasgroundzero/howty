/** Fan Tan (Sevens): build each suit outwards from its seven and be first to run out of cards. */
import { C, P, S, T, at, mv, set, tabletop, zone } from '../compose'
import { hand, pc, slot } from '../playing'

const show = (id: string, card: string) => set(id, { faceUp: true, face: pc(card) })
const FULL = '6♦ J♦ 7♠ 10♠ 2♥ 9♥ 5♣ K♣ 3♦ 4♠ Q♥ 9♣ A♦ Q♠ 5♥ 2♣ 10♦'

export const fanTan = tabletop('fan-tan', 'Fan Tan', [3, 8], 4, '15–30 min', 'Easy', 'Build out from the sevens and empty your hand.', ['#14532d', '#c0392b', '#ffffff'], (n) => {
  const q = Math.floor(52 / n)
  const extra = 52 % n
  return {
    setup: [
      S('Take one pack', 'Fan Tan uses one standard 52-card deck with no jokers. Keep the middle of the table clear for the layout.', 'c', [
        C(zone('layout', 2.98, 5.46, 'Layout', 'Four rows, one per suit. Each row starts with its seven in the middle, with lower cards built on one side and higher cards on the other.')),
      ], 'The game is also called Sevens, Domino or Parliament.'),
      S('Deal out every card', `Shuffle and deal the whole pack one card at a time, face down, starting on the dealer's left. Everyone gets ${q} cards${extra ? `, plus one more for the first ${extra === 1 ? 'player' : `${extra} players`} in the deal` : ''}.`, 'you', [
        P(hand('hand', FULL.split(' ').slice(0, q).join(' '), 'Your hand', `Your ${q} cards. You win by being the first to play all of them to the layout.`, { cols: 7 })),
      ], extra ? 'You dealt this hand, so you are one of the players with the smaller number. Holding an extra card is not much of a handicap.' : 'You dealt this hand.'),
      S('Sort your hand', 'Pick up your cards and sort them by suit, in order. Your sevens, and the cards closest to seven, are the ones you will be able to play first.', 'hand'),
      S('Learn what can be played', 'A seven can always be played: it starts the row for its suit. Any other card can be played only next to the card of the same suit that is one step closer to seven.', 'layout', [],
        'So the 6 and 8 need the 7, the 5 needs the 6, the 9 needs the 8, and so on out to the ends. Agree first whether the ace sits beyond the king or below the 2: both are played.'),
      S('Ready to play', 'The player on the dealer\'s left goes first and play runs clockwise. On your turn you play exactly one card to the layout if you can.', 'all', [], 'Some groups instead have whoever holds the 7♦ start by playing it.'),
    ],
    turn: [
      T('A seven opens a suit', 'The player on your left starts. They hold a seven, so they can play: the 7♦ goes in the middle of the layout and opens the diamond row.', 'layout', [
        show('hand.0@1', '7♦'), mv('hand.0@1', at('layout', ...slot(1, 3, 4))),
      ]),
      T('Build next to it', 'The next player adds the 8♦ beside the seven. Higher diamonds will follow on this side and lower ones on the other. To save space you can stack them: 9 on the 8, then 10 and so on.', 'layout', [
        show('hand.1@2', '8♦'), mv('hand.1@2', at('layout', ...slot(2, 3, 4))),
      ]),
      T('Your turn', 'When play reaches you, you could open spades with your 7♠ or add the 6♦ to the diamond row. You play the 6♦ and keep the seven back to hold up the spades.', 'layout', [
        mv('hand.0', at('layout', ...slot(0, 3, 4))),
      ]),
      T('Pass only if you are stuck', 'If none of your cards fits, say "pass" or knock on the table and the turn moves on. You may not pass when you have a card that can be played.', 'you', []),
      T('How it ends', 'The first player to play their last card wins. Some groups play for chips: everyone pays one into a pool before the deal and one more each time they pass, and the winner takes the pool.', 'all'),
    ],
  }
})
