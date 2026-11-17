/** Unfair: a shared board with four decks and a market of park cards, and a main gate for each player. */
import { C, On, P, R, S, T, at, board, by, cards, deck, discs, draw, f, ft, mv, pile, spawn, tabletop, zone } from '../compose'

const PARK = ft('#f6dcd6', 'PARK', 'price and stars', '★')
const coin = (id: string) => discs(id, 1, 0.22, '#e0b12f', 'Coins', 'Money earned from guests. Coins buy park cards, and every 2 coins are worth 1 point at the end.', { h: 0.1 })

export const unfair = tabletop('unfair', 'Unfair', [2, 5], 3, '25 min per player', 'Medium', 'Build a theme park and sabotage the others.', ['#2f3e5a', '#c0392b', '#e0b12f'], (n) => ({
  setup: [
    S('Choose theme packs', `Pick one theme pack per player, so ${n} packs. Sort their cards by type and shuffle each type together, however many packs you use.`, 'c', [
      C(board('city', 11, 4.4, 'g:plain:0:#2f3e5a:#e0b12f:Unfair', 'Game board', 'Has spaces for the four decks, their discard piles and the market of park cards.')),
    ], 'The base game comes with six themes. The rulebook suggests which to use for a first game and recommends a shorter variant for new players.'),
    S('Park, event and blueprint decks', 'Shuffle the park cards, the event cards and the blueprint cards into three face-down decks on the board.', 'city', [
      On('city', 0.86, 0.2, deck('parkdeck', 60, f('#c0392b', '★'), 'Park deck', 'Attractions, upgrades, staff and resources that you build into your park.')),
      On('city', 0.68, 0.2, deck('events', 40, f('#3d8b4a', '⚑'), 'Event deck', 'Event cards help your park or hurt someone else’s. Everyone draws one at the start of each round.')),
      On('city', 0.5, 0.2, deck('blue', 20, f('#2e6fb7', '▦'), 'Blueprint deck', 'Secret goals for your park. A finished blueprint scores points; an unfinished one loses 10. They can only be drawn in the first half of the game.')),
    ]),
    S('City deck', 'Build the city deck: 4 Unfair city cards on the bottom, the Blueprint Closure reminder card on those, and 4 Funfair city cards on top. Do not mix the two halves.', 'citydeck', [
      On('city', 0.14, 0.2, deck('citydeck', 9, f('#e9e4d8', '⌂', '#2b241c'), 'City deck', 'One city card is revealed each round for 8 rounds. The first four are kind to everyone; the last four are not.')),
    ]),
    S('Market and bank', 'Deal 6 park cards face up into the market spaces and split the coins into a bank at each end of the board.', 'city', [
      On('city', 0.5, 0.75, cards('market', 6, PARK, 'Market', 'Six face-up park cards that anyone can build or take on their turn.')),
      R(pile('bank', '#e0b12f', 'Bank', 'The coin supply.', 'disc')),
    ]),
    S('Gates, coins and showcases', 'Each player takes a main gate card, a loan card, 20 coins and 2 showcase cards dealt face down.', 'you', [
      P(cards('gate', 1, ft('#f3e7c5', 'MAIN GATE', '1 star', '⌂'), 'Main gate', 'The entrance to your park. It gives 1 star and sets your limits: 15 guests and at most 5 attractions.'), zone('park', 4.6, 1.5, 'Your park', 'Attractions go in a row beside your gate, with their upgrades tucked under them. You may have at most 5 attractions.')),
      P(cards('show', 2, ft('#efe0f3', 'SHOWCASE', 'super attraction', '♛'), 'Showcase cards', 'Two powerful attractions dealt to you at the start. They are kept apart from your hand; the rulebook explains when you may build one or trade it in.', { down: true }), cards('loan', 1, ft('#e3e3e3', 'LOAN', 'costs points', '?'), 'Loan card', 'Lets you borrow coins from the bank in exchange for points at the end of the game.', { down: true }), discs('coins', 1, 0.25, '#e0b12f', 'Your coins', 'Each player starts with 20 coins.', { h: 0.3, label: '20', ink: '#2b241c' })),
    ]),
    S('Deal park cards', 'Deal 5 park cards to each player. A player with no attraction in their hand may shuffle it back and draw a new one.', 'you', [
      P(cards('hand', 5, PARK, 'Your hand', 'Park and event cards. The hand limit of 5 is checked at the end of each round.')),
    ]),
    S('Ready to play', 'The starting player is whoever most recently rode a roller coaster. The game lasts 8 rounds.', 'all', [], 'Each round has four steps: Events, Park, Guests and Cleanup.'),
  ],
  turn: [
    T('Events step', 'Everyone draws an event card, then the top city card is revealed and takes effect. After that players take turns playing event cards or passing.', 'city', [
      draw('events', at('hand.4', 1.15, 0.5, 0.02)), draw('citydeck', at('city', 0.28, 0.2), ft('#f3ecdc', 'CITY', 'this round', '⌂')),
    ]),
    T('Park step: build', 'In the park step each player takes 3 actions, one at a time around the table. For your first you pay the price of an attraction in your hand and build it beside your gate.', 'you', [mv('hand.1', at('park', 0.15, 0.5))]),
    T('Park step: take a card', 'Instead of building, an action can take a card: a park card from the market or deck, an event, or a blueprint. The next player takes one from the market.', 'city', [mv('market.2', at('hand.4@1', 1.15, 0.5, 0.02))]),
    T('Guests step', 'Count the stars in your park, up to your guest capacity, and take 1 coin from the bank for each, plus any ticket income on your cards.', 'you', [spawn(coin('income'), by('coins', 0.75, 0), 'bank')]),
    T('Cleanup and final scoring', 'Refresh the market, discard down to 5 cards and pass the starting player marker. After round 8, score each attraction by its number of icons, then blueprints, staff and coins, minus loans. Most points wins.', 'all'),
  ],
}))
