/** Bohnanza: a hand you may never reorder, two bean fields each and a shared draw pile. */
import { C, P, S, T, at, cards, deck, draw, f, ft, mv, tabletop, zone } from '../compose'

const bean = (bg: string, name: string) => ft(bg, name, 'bean', '●')
const [RED, BLUE, GREEN, CHILI, SOY] = [bean('#f1c9c0', 'Red'), bean('#c9dcf1', 'Blue'), bean('#cfe6c8', 'Green'), bean('#f3d6a8', 'Chili'), bean('#efe7b8', 'Soy')]

export const bohnanza = tabletop('bohnanza', 'Bohnanza', [3, 5], 4, '45 min', 'Easy', 'Plant, trade and harvest beans for gold.', ['#3d8b4a', '#e0b12f', '#c0392b'], (n) => ({
  setup: [
    S('Check which beans are in play', 'Some editions remove one or two bean varieties depending on the number of players. Check the rulebook table for your edition, then shuffle the cards you are using.', 'c', [
      C(
        deck('deck', 70 - 5 * n, f('#b9892f', '◎', '#2b241c'), 'Draw pile', 'All the bean cards in play, face down. The back of every card shows a gold coin. How many cards there are depends on the edition and the player count.'),
        zone('discard', 1.1, 1.5, 'Discard pile', 'Harvested beans that were not kept as coins go here face up. It is reshuffled to make a new draw pile.'),
        zone('offer', 2.6, 1.5, 'Turned-up cards', 'The two cards the active player turns up each turn. They can be traded or given away before they must be planted.'),
      ),
    ], 'This tutorial covers 3 to 5 players. Some editions add special rules for 2, 6 and 7.'),
    S('Two bean fields each', 'Every player has room in front of them for 2 bean fields. Each field can hold only one variety of bean at a time.', 'you', [
      P(
        zone('f1', 1.1, 1.6, 'Bean field', 'Your first field. Plant beans of one variety here in an overlapping column.'),
        zone('f2', 1.1, 1.6, 'Bean field', 'Your second field. A third field can be bought later for 3 gold coins.'),
        zone('gold', 1.1, 1.6, 'Gold coins', 'Harvested cards you keep are flipped to their coin side and stacked here. Each is worth 1 gold.'),
      ),
    ], n === 3 ? 'Some editions start a 3-player game with a third field already open: check your rulebook.' : undefined),
    S('Deal five cards each', 'Deal 5 cards face down to each player. Pick them up one at a time and keep them in exactly the order you received them.', 'you', [
      P(cards('hand', 5, [RED, BLUE, BLUE, GREEN, CHILI], 'Your hand', 'You may never rearrange your hand. The first card dealt is at the front (left here) and new cards always go to the back.')),
    ]),
    S('Learn the bean values', 'Each card shows how many of that bean there are in the deck and how many you must harvest together to earn 1, 2, 3 or 4 gold.', 'hand', [], 'Rare beans pay out with fewer cards.'),
    S('Ready to play', 'The player to the left of the dealer goes first, then play passes clockwise.', 'all', [], 'A turn has four parts: plant from your hand, turn up 2 cards and trade, plant what you ended up with, then draw new cards.'),
  ],
  turn: [
    T('Plant from the front of your hand', 'You must plant the first card in your hand in one of your fields. You may then plant the next card too, and you do.', 'you', [mv('hand.0', at('f1')), mv('hand.1', at('f2'))]),
    T('Turn up two cards', 'You turn the top 2 cards of the draw pile face up. Now you may trade them, and cards from your hand, with the other players. Only you may take part in each trade.', 'c', [
      draw('deck', at('offer', 0.27, 0.5), SOY, 'up1'),
      draw('deck', at('offer', 0.73, 0.5), RED, 'up2'),
    ]),
    T('Trade, then plant', 'You swap the Soy bean for a Blue bean from the hand of the player on your left. Everything traded or turned up must be planted at once: your Red and Blue beans join the matching fields.', 'you', [
      mv('up1', at('f1@1')),
      mv('hand.2@1', at('f2', 0.5, 0.68, 0.02)),
      mv('up2', at('f1', 0.5, 0.68, 0.02)),
    ]),
    T('Draw three cards', 'You end your turn by drawing 3 cards one at a time and adding them to the back of your hand.', 'you', [
      draw('deck', at('hand.4', 1.15, 0.5, 0.02)),
      draw('deck', at('hand.4', 1.8, 0.5, 0.04)),
      draw('deck', at('hand.4', 2.45, 0.5, 0.06)),
    ]),
    T('Harvesting and the finish', 'When you need a field for a new variety you harvest one: keep some cards as coins and discard the rest. In the standard game play ends when the draw pile runs out for the third time; then everyone harvests and the most gold wins.', 'all'),
  ],
}))
