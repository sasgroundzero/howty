/** Speed: two players race, with no turns, to play out all their cards one rank up or down. */
import { C, P, S, T, at, draw, flip, mv, set, tabletop } from '../compose'
import { hand, hidden, pc, slot, stock } from '../playing'

const show = (id: string, s: string) => set(id, { face: pc(s), faceUp: true })

export const speed = tabletop('speed', 'Speed', [2, 2], 2, '5–10 min', 'Easy', 'A frantic two-player race with no turns.', ['#c0392b', '#27457a', '#ffffff'], () => ({
  setup: [
    S('Sort out the deck', 'Speed uses one standard 52-card deck with no jokers. The two players sit facing each other.', 'c', [], 'In some places this game is called Spit, although Spit more often means a related game with a row of piles in front of each player.'),
    S('Deal hands and draw piles', 'Shuffle and deal 5 cards to each player as a starting hand, then 15 more each, face down, as a personal draw pile. Do not look at the draw pile.', 'you', [
      P(hand('hand', '5♠ 7♥ 9♦ Q♣ 2♠', 'Your hand', 'You hold up to 5 cards at a time and play from these onto the centre piles.'), stock('pile', 15, 'Your draw pile', 'Your own 15 face-down cards. Whenever you hold fewer than 5 cards you top your hand up from here.')),
    ]),
    S('Lay out the middle', 'From the 12 cards left, put a face-down pile of 5 at each end of a row between you, and one face-down card in each of the two spaces in the middle.', 'c', [
      C(
        stock('sideL', 5, 'Side pile', 'One of two face-down piles of 5 cards. They are only used when both players are stuck.'),
        hidden('mid', '6♣ J♦', 'Centre cards', 'The two cards in the middle start the two play piles. Both players play onto either pile.'),
        stock('sideR', 5, 'Side pile', 'One of two face-down piles of 5 cards. They are only used when both players are stuck.'),
      ),
    ], 'Layouts vary. Another common version gives each player 10 cards in the draw pile and puts 10 in each side pile.'),
    S('Know what you can play', 'A card may go on a centre pile if it is exactly one rank above or below the card showing there. A 7 goes on a 6 or an 8, whatever the suits.', 'hand'),
    S('Ready to play', 'Pick up your hand. When both players are ready, each flips one of the centre cards at the same moment and the race begins. There are no turns.', 'all', [], 'Both players play as fast as they like, using one hand and placing one card at a time.'),
  ],
  turn: [
    T('Flip the centre cards', 'Together, turn the two centre cards face up. They show a 6 and a jack.', 'c', [
      flip('mid.0'), flip('mid.1'),
    ]),
    T('Play one rank up or down', 'A card can go on either centre pile if it is one rank higher or one rank lower than the top card. Suits and colours do not matter. You slap your 5 onto the 6.', 'c', [
      mv('hand.0', at('mid.0', 0.5, 0.5, 0.02)),
    ]),
    T('Top up your hand', 'As soon as you have fewer than 5 cards, draw from your own pile to get back to 5. You draw a 4, which can go straight onto your 5.', 'you', [
      draw('pile', at('hand', ...slot(0, 5)), pc('4♦'), 'new'),
    ]),
    T('Your opponent plays too', 'Your opponent is not waiting for you. They drop a queen onto the jack at the same time, so the card you were aiming for may be covered before you get there.', 'c', [
      show('hand.1@1', 'Q♥'), mv('hand.1@1', at('mid.1', 0.5, 0.5, 0.02)),
    ]),
    T('When you are both stuck', 'If neither player can play, each flips the top card of a side pile onto the centre pile next to it, and play carries on. If the side piles run out, shuffle the centre piles, apart from their top cards, to make new ones.', 'c', [
      draw('sideL', at('mid.0', 0.5, 0.5, 0.04), pc('9♣')), draw('sideR', at('mid.1', 0.5, 0.5, 0.04), pc('3♥')),
    ]),
    T('How it ends', 'The first player to get rid of every card in their hand and draw pile wins. To keep score, the winner scores a point for each card the other player has left, and the first to an agreed total such as 25 wins. Agree beforehand whether an ace connects to both the king and the 2, and whether a card of the same rank may be played: groups differ on both.', 'all'),
  ],
}))
