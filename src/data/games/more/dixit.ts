/** Dixit: a hand of picture cards, numbered voting tokens and rabbits on a score track. */
import { C, OnP, P, R, S, T, at, board, cards, deck, discs, draw, f, flip, mv, pawns, tabletop, zone } from '../compose'
import { loopUV } from '../layouts'

const BACK = f('#7a4fa3', '✦')
const ART = [f('#e7b7c8', '☾', '#2b241c'), f('#b7d3e7', '♛', '#2b241c'), f('#c8e7b7', '⚑', '#2b241c'), f('#f3dfa0', '★', '#2b241c'), f('#d7c3ee', '⌂', '#2b241c'), f('#f1c9a8', '▲', '#2b241c'), f('#bfe3dc', '◆', '#2b241c')]
const space = loopUV(8)

export const dixit = tabletop('dixit', 'Dixit', [3, 6], 4, '30 min', 'Easy', 'Give clues that are neither obvious nor obscure.', ['#7a4fa3', '#e7b7c8', '#f3dfa0'], (n) => {
  const h = n === 3 ? 7 : 6
  const u = (i: number) => (i + 0.5) / n
  return {
    setup: [
      S('Set out the score track', 'Put the score track in the middle of the table. In the original edition it is built into the box.', 'c', [
        C(board('track', 7, 5, 'g:ring:8:#d9ecd6:#7a4fa3:Score track', 'Score track', 'A numbered track for the rabbits. This drawing is schematic, not the real track.')),
      ]),
      S('Choose a rabbit', 'Each player takes a rabbit and stands it at the start of the track.', 'track', [
        OnP('track', 0.22, 0.944, pawns('rabbit', 1, '$', 'Rabbit', 'Your scoring marker. One per player.', { scale: 0.5 }), [0.42, 0]),
      ]),
      S('Take voting tokens', `Each player takes voting tokens in their color numbered 1 to ${n === 3 ? '5 (with 3 players five cards are shown each round)' : `${n}, one for each player in the game`}.`, 'you', [
        P(discs('vote', n === 3 ? 5 : n, 0.22, '$', 'Voting tokens', `Numbered 1 to ${n === 3 ? 5 : n}. You vote in secret by playing the token whose number matches the card you think is the storyteller’s.`, { label: Array.from({ length: n === 3 ? 5 : n }, (_, k) => `${k + 1}`), h: 0.06, ink: '#ffffff' })),
      ]),
      S(`Deal ${h} cards each`, `Shuffle the 84 picture cards and deal ${h} face down to each player. The rest form the draw pile.`, 'you', [
        R(deck('deck', 84 - h * n, BACK, 'Draw pile', '84 large picture cards in the base game. Everyone draws back up after each round.', { w: 0.9, d: 1.26 })),
        P(cards('hand', h, ART, 'Your hand', `${h} picture cards that only you may look at.`, { cols: n === 3 ? 4 : 6 })),
      ], n === 3 ? 'With 3 players everyone holds 7 cards instead of 6.' : undefined),
      S('Leave room for the played cards', 'Keep a clear strip beside the track where this round’s cards will be laid out in a row.', 'row', [
        C(zone('row', 6.6, 2.3, 'Played cards', 'Each round one card per player is shuffled and revealed here, numbered from left to right.')),
      ]),
      S('Ready to play', 'Pick a first storyteller. The storyteller role passes clockwise each round.', 'all', [], 'Each round the storyteller gives a clue for one of their cards, everyone else adds a card that fits, and then all but the storyteller vote.'),
    ],
    turn: [
      T('You tell a story', 'As storyteller you pick a card from your hand, say a word, phrase or sound that it suggests, and lay it face down.', 'row', [flip('hand.0', false), mv('hand.0', at('row', u(0), 0.36))]),
      T('The others add a card', `Every other player chooses the card in their hand that best fits your clue and hands it to you face down.${n === 3 ? ' With 3 players each of them adds 2 cards; one each is shown here.' : ''}`, 'row',
        Array.from({ length: n - 1 }, (_, k) => [flip(`hand.1@${k + 1}`, false), mv(`hand.1@${k + 1}`, at('row', u(k + 1), 0.36))]).flat()),
      T('Shuffle and reveal', 'You shuffle the cards and lay them face up in a row. The first card is number 1, the next number 2, and so on.', 'row',
        Array.from({ length: n }, (_, k) => flip(k ? `hand.1@${k}` : 'hand.0'))),
      T('Vote in secret', 'Everyone except you plays a voting token face down for the card they believe is yours. Nobody may vote for their own card. Then all votes are revealed.', 'row', [
        mv('vote.0@1', at('row', u(0), 0.86)),
        ...Array.from({ length: n - 2 }, (_, k) => mv(`vote.${k + 1}@${k + 2}`, at('row', u(k + 1), 0.86))),
      ]),
      T('Score and draw', 'Some but not all found your card, so you and each correct guesser score 3. Each vote on another player’s card gives its owner 1. Then everyone draws back up to a full hand.', 'track', [
        mv('rabbit', at('track', ...space(3))),
        mv('rabbit@1', at('track', ...space(4))),
        draw('deck', at(`hand.${h - 1}`, 1.15, 0.5, 0.02)),
      ]),
      T('All or nobody, and the finish', 'If everyone or no one finds the storyteller’s card, the storyteller scores 0 and the others score 2 each, plus 1 for each vote on their own card. The game ends when someone reaches 30 points (the voting-token rulebook also ends it when the last card is drawn). The highest score wins.', 'all'),
    ],
  }
})
