/** Finspan: an ocean mat with three dive sites, six divers each, and a hand of fish cards. */
import { C, On, P, R, S, T, at, board, by, cards, deck, discs, draw, f, flip, ft, mat, mv, pawns, pile, tabletop } from '../compose'

const STARTER = ft('#dfeef3', 'STARTER', 'fish', '◆')
const FISH = ft('#fbf6ea', 'FISH', 'zone and cost', '◆')

export const finspan = tabletop('finspan', 'Finspan', [2, 5], 3, '45–60 min', 'Medium', 'Fill your ocean with fish over four weeks.', ['#1f5a7a', '#4fb7b0', '#e0b12f'], (n) => ({
  setup: [
    S('Achievement board', 'Place the achievement board in the middle with the week tracker on week 1. Use side A if anyone is new to the game.', 'c', [
      C(board('ach', 6, 2.2, 'g:plain:0:#dfeef3:#1f5a7a:Achievements', 'Achievement board', 'Shows what scores at the end of each of the 4 weeks. Side A is fixed; side B uses randomly chosen week tiles.')),
      On('ach', 0.14, 0.3, discs('week', 1, 0.18, '#e0b12f', 'Week tracker', 'Marks which of the 4 weeks you are in.', { h: 0.08 })),
    ]),
    S('Fish deck and supply', 'Shuffle the main fish deck and place it face down. Put the egg, young and school tokens in a general supply.', 'r', [
      R(deck('fish', 125 - 3 * n, f('#1f5a7a', '◆'), 'Fish deck', '125 fish cards. There is no face-up display: cards are drawn from the top of the deck.'), pile('eggs', ['#f3ecdc', '#f3ecdc', '#e9b7a3'], 'Eggs and young', 'Eggs sit on your fish and can hatch into young. Each egg and each young is worth 1 point at the end.', 'disc'), pile('schools', '#4fb7b0', 'School tokens', 'Three young gathered in one place form a school, worth 6 points at the end.', 'disc')),
    ]),
    S('Ocean mats and divers', 'Each player takes an ocean mat and the 6 divers of one color.', 'you', [
      P(mat('ocean', 6.2, 4.2, '$', 'Ocean mat', 'Ocean mat', 'Three dive sites side by side, each running down through the sunlight, twilight and midnight zones. Fish go in the spaces of the zone they live in.')),
      P(pawns('diver', 6, '$', 'Divers', '6 per player. You use one each turn, so every week lasts 6 turns.', { scale: 0.45, gap: 0.1 })),
    ], 'A solo mode with its own rules is also in the box; this walkthrough covers 2 to 5 players.'),
    S('Starting eggs and young', 'Put 1 egg on each of the 2 starting egg spaces of your mat and 1 young on the starting young space.', 'you', [
      On('ocean', 0.4, 0.5, discs('egg', 2, 0.13, '#f3ecdc', 'Starting eggs', '2 eggs on the marked spaces of your mat. Their exact positions are printed on the real mat.', { cols: 1, gap: 0.7, h: 0.08 })),
      On('ocean', 0.7, 0.5, discs('young', 1, 0.13, '#e9b7a3', 'Starting young', '1 young on its marked space. Young can be moved between spaces and gathered into schools.', { h: 0.08 })),
    ]),
    S('Starting hand', 'Shuffle the starter fish and give 2 to each player, then deal everyone 3 cards from the main deck. Unused starter fish go back in the box.', 'you', [
      P(cards('hand', 5, [STARTER, STARTER, FISH, FISH, FISH], 'Fish cards in hand', 'You begin with 2 starter fish and 3 other fish. Hands are kept face up: they are open information.')),
    ]),
    S('Ready to play', 'Choose a first player at random and give them the first-player token. Play passes clockwise.', 'all', [], 'On your turn place one diver, either to play a fish from your hand or to dive down one of your three dive sites.'),
  ],
  turn: [
    T('Play a fish', 'You put a diver on the play-a-fish box at the top left of your mat, pay the cost printed on the fish (here by discarding another card to your own discard pile) and place it in a matching zone.', 'you', [
      mv('diver.0', at('ocean', 0.05, 0.06)),
      mv('hand.4', by('diver.5', 1.3, 0)), flip('hand.4', false),
      mv('hand.0', at('ocean', 0.25, 0.22)),
    ], 9),
    T('Next player', 'The next player does the same in their own ocean. Costs can also be paid with eggs or young, or by letting a bigger fish consume a smaller one.', 'ocean@1', [
      mv('diver.0@1', at('ocean@1', 0.05, 0.06)), mv('hand.1@1', at('ocean@1', 0.55, 0.22)),
    ]),
    T('Dive', 'Next turn you dive instead: a diver travels down one dive site, top to bottom, and you collect the bonuses of each zone where you have a fish and trigger those fish. Here that draws you a card.', 'you', [
      mv('diver.1', at('ocean', 0.25, 0.95)), draw('fish', at('hand.3', 1.15, 0.5, 0.02)),
    ]),
    T('End of the week', 'When everyone has used all 6 divers the week ends. Score that week’s achievement, take your divers back, pass the first-player token and move the week tracker on.', 'all', [
      mv('diver.0', by('diver.2', -0.92, 0)), mv('diver.1', by('diver.2', -0.46, 0)), mv('week', at('ach', 0.38, 0.3)),
    ]),
    T('End of the game', 'After week 4 add your achievement points to the points on your fish, 1 point per egg and per young, and 6 per school, plus anything else the rulebook lists. The highest total wins.', 'all'),
  ],
}))
