/** Seven-Card Stud Hi-Lo (eight or better): the best high hand and the best qualifying low hand split the pot. */
import { C, On, P, S, T, at, by, discs, draw, flip, hide, mv, set, spawn, tabletop, zone, type Act, type Item } from '../compose'
import { hand, pc, shown, slot, stock } from '../playing'

/** One item per seat: the first is yours, the last is repeated for any seats beyond the list. */
const bySeat = (items: Item[]): Item => ({ ...items[0], make: (c, k, seat) => items[Math.min(Number((seat || '@0').slice(1)), items.length - 1)].make(c, k, seat) })
const DOWN = 'Two cards dealt face down at the start. Only their owner may look at them; they stay hidden until the showdown.'
const DOOR = 'The first face-up card, often called the door card. The lowest one on the table has to make the first forced bet.'
const DOORS = ['4♥', '2♣', '10♦', 'J♠', '6♥', '10♣', '8♠', '8♦']
const chip = (id: string, title: string, body: string, h = 0.08) => discs(id, 1, 0.25, '#e9e4d8', title, body, { h })
/** Deal street cards to you and to the player on your left: k is the slot in the face-up row. */
const street = (k: number, mine: string, theirs: string, t = 0.3): Act[] => [
  draw('deck', at('ups@1', ...slot(k, 4)), pc(theirs), `their${k}`, t), draw('deck', at('ups', ...slot(k, 4)), pc(mine), `my${k}`, t + 0.6),
]

export const studHiLo = tabletop('stud-hi-lo', 'Seven-Card Stud Hi-Lo', [2, 8], 6, '1–3 hr', 'Hard', 'Stud where high and low split the pot.', ['#1f6b43', '#b7791f', '#9b2c2c'], (n) => {
  const folds: Act[] = Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 2).flatMap((s) => [hide(`down.0@${s}`, 0.9), hide(`down.1@${s}`, 0.9), hide(`door@${s}`, 0.9)])
  return {
    setup: [
      S('Cards and chips', 'This is Seven-Card Stud in which the pot is shared between the highest hand and the lowest. It uses one standard 52-card deck with no jokers, and there are no shared cards. Give every player the same starting stack of chips.', 'you', [
        P(zone('bet', 2.6, 1, 'Bets', 'Chips you bet in the current round sit here in front of you. When the round is over they join the pot.')),
        P(discs('chips', 3, 0.28, ['#e9e4d8', '#c0392b', '#2e6fb7'], 'Your chips', 'Your stack. How many chips everyone starts with, and what they are worth, is up to the group.', { h: 0.4 })),
      ], `Also called Stud Eight or Better, Stud/8 or seven-card stud high-low split. Up to 8 can play.${n === 8 ? ' With 8 players there are not quite enough cards if nobody folds: in that rare case the last card is a single face-up card in the middle that everyone shares.' : ''} Stud is usually played fixed-limit with a small bet and a big bet of twice the size. Agree those, the ante and the bring-in before you start.`),
      S('Everyone antes', `Before the deal each of the ${n} players puts the same small stake, the ante, into the pot in the middle.`, 'pot', [
        C(zone('pot', 2, 1.5, 'Pot', 'The antes and all the chips bet in the hand. At the showdown it is divided between the best high hand and the best low hand.')),
        On('pot', 0.5, 0.5, discs('antes', 1, 0.25, '#e9e4d8', 'Antes', `One ante from each of the ${n} players. The ante is much smaller than a bet.`, { h: 0.05 * n })),
      ], 'There are no blinds and no dealer button is needed for the betting; the deal simply passes to the left after each hand.'),
      S('Deal two down and one up', 'Starting on the dealer\'s left, deal each player two cards face down and then one card face up. Look at your own face-down cards and keep them hidden.', 'you', [
        P(bySeat([hand('down', 'A♠ 2♠', 'Your hole cards', DOWN), hand('down', '9♦ 9♠', 'Hole cards', DOWN)]), zone('ups', 4.02, 1.26, 'Face-up cards', 'Your face-up cards line up here for everyone to see: one now, and one more on each of the next three rounds.')),
        On('ups', slot(0, 4)[0], 0.5, bySeat(DOORS.map((c) => shown('door', c, 'Upcard', DOOR)))),
        C(stock('deck', 52 - 3 * n, 'Deck', `The ${52 - 3 * n} cards left after the first deal. Every later card comes from the top.`)),
      ], 'This first round is called third street, because everyone has three cards.'),
      S('Find the bring-in', 'The player showing the lowest face-up card must start the betting with a small forced bet called the bring-in. Here the player on your left shows the 2 of clubs.', 'door@1', [], 'For this purpose aces are high. If two players show the same low rank, suits decide: clubs are lowest, then diamonds, hearts and spades. Some home games skip the bring-in and let the highest card bet first.'),
      S('Ready to play', 'After the bring-in, play goes clockwise. Each player folds, calls the bring-in, or completes it to a full small bet; once it is completed, players may raise in the usual way.', 'all', [], 'A low hand is five cards of different ranks, none higher than 8. For low, aces count low and straights and flushes are ignored, so 5-4-3-2-A is the best. Some groups play high-low with no qualifier, or with players declaring which half they are going for; this guide uses the usual eight-or-better rule, where the cards speak for themselves.'),
    ],
    turn: [
      T('Third street', n === 2
        ? 'Your opponent posts the bring-in. You hold an ace and a 2 hidden with a 4 showing, a good start towards a low hand, so you complete to a full small bet, and your opponent calls.'
        : 'The player on your left posts the bring-in. The others fold in turn. You hold an ace and a 2 hidden with a 4 showing, a good start towards a low hand, so you complete to a full small bet, and the bring-in player calls.', 'bet', [
        spawn(chip('bring', 'Bring-in', 'The forced opening bet, posted by the player with the lowest face-up card.'), at('bet@1', 0.2, 0.5), 'chips.0@1'), ...folds,
        spawn(chip('full', 'Your bet', 'A full small bet, completing the bring-in.', 0.16), at('bet', 0.2, 0.5), 'chips.0', undefined, 1.6),
        spawn(chip('see', 'Call', 'The extra chips that match the completed bet.'), at('bet@1', 0.45, 0.5), 'chips.0@1', undefined, 2.2),
      ], 9),
      T('Fourth street', 'Each player still in is dealt another card face up. From now on the player whose face-up cards show the best poker hand acts first, and may check or bet. Here that is the jack on your left.', 'you', street(1, '5♦', 'J♥'), 9),
      T('Fifth and sixth street', 'Two more rounds follow in the same way: one more face-up card each, then betting. From fifth street every bet is the big bet. Your king is now the highest card showing, so you act first.', 'you', [
        ...street(2, 'K♣', '9♥'), ...street(3, '7♠', '6♦', 2.2),
      ], 10),
      T('Seventh street', 'The last card is dealt face down to each player, and the final betting round is opened by the same player as on sixth street.', 'you', [
        draw('deck', by('down.0@1', -1.04, 0), undefined, 'their7'), draw('deck', by('down.0', -1.04, 0), pc('K♥'), 'my7', 0.9),
      ], 8),
      T('Showdown', 'Players still in turn over their face-down cards. Each may pick one set of five cards for high and a different five for low. Three nines win the high half; your 7-5-4-2-A is the only qualifying low, so you win the low half.', 'all', [
        flip('down.0@1'), flip('down.1@1'), set('their7', { face: pc('Q♠'), faceUp: true }), mv('antes', at('bet', 0.7, 0.5), 1.5),
      ], 9),
      T('How it ends', 'If nobody has a qualifying low, the best high hand takes the whole pot. One player can win both halves, and an odd chip goes to the high hand. If everyone else folds, the last player in wins it all. The deal then passes to the left; play for as long as you agreed.', 'all'),
    ],
  }
})
