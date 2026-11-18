/** BANG!: a hidden role, a character, bullets for life points and a hand of cards for each player. */
import { C, P, S, T, at, by, cards, deck, discs, draw, f, ft, mv, set, tabletop, zone } from '../compose'

const BACK = f('#7a4a2a', '✦')
const ROLE_BACK = f('#3a2c20', '?')
const SHERIFF = ft('#f3e2a8', 'SHERIFF', 'role', '★')
const HAND = [ft('#f6ecd2', 'BANG!', 'shoot', '✦'), ft('#f6ecd2', 'Missed!', 'dodge', '○'), ft('#f6ecd2', 'Beer', 'heal', '●'), ft('#dbe6f2', 'Gear', 'stays in play', '▲')]

export const bang = tabletop('bang', 'BANG!', [4, 7], 5, '20–40 min', 'Easy', 'Sheriff, outlaws and a renegade shoot it out.', ['#7a4a2a', '#e0b12f', '#c0392b'], (n) => {
  const outlaws = n >= 6 ? 3 : 2
  const deputies = n === 4 ? 0 : n === 7 ? 2 : 1
  const mix = `1 Sheriff, 1 Renegade, ${outlaws} Outlaws${deputies ? ` and ${deputies} ${deputies > 1 ? 'Deputies' : 'Deputy'}` : ''}`
  return {
    setup: [
      S('Deal the roles', `With ${n} players use ${mix}. Shuffle those role cards and deal one face down to each player. Look at yours in secret.`, 'you', [
        P(cards('role', 1, ft('#efe6d2', 'ROLE', 'secret', '?'), 'Role card', `Your secret team. A ${n}-player game uses ${mix}. Only the Sheriff is ever shown before a player is eliminated.`, { down: true, back: ROLE_BACK })),
      ]),
      S('Characters and bullets', 'Shuffle the character cards and deal one face up to each player. Take as many bullets (life points) as your character shows.', 'you', [
        P(
          cards('char', 1, ft('#e8d9b5', 'Character', 'special ability', '♞'), 'Character card', 'One per player, face up. It gives you a special ability and shows your starting bullets, which is 3 or 4 in the base game.'),
          discs('life', 1, 0.3, '#b9892f', 'Bullets (life points)', 'Shows how many life points you have left. Depending on the edition you track them with bullet tokens on a player board or by sliding your character over a spare card.', { label: '4', h: 0.1 }),
        ),
      ], 'This scene shows 4 bullets for everyone. Use the number on your own character.'),
      S('The Sheriff steps forward', 'The Sheriff turns their role card face up and plays with one extra bullet. Everyone else keeps their role hidden.', 'all', [], 'In this walkthrough the player on your left turns out to be the Sheriff.'),
      S('Deal the starting hands', 'Shuffle the playing cards and deal each player as many cards as they have bullets. Put the rest in the middle as the draw pile, with room for a discard pile.', 'c', [
        C(deck('deck', 80 - 4 * n, BACK, 'Draw pile', '80 playing cards in the base game: BANG! and Missed! cards, Beer, weapons and other gear. Reshuffle the discards when it runs out.'), zone('discard', 1.1, 1.5, 'Discard pile', 'Played and discarded cards go here face up.')),
        P(cards('hand', 4, HAND, 'Your hand', 'You start with as many cards as you have bullets. At the end of your turn you may hold no more cards than your current life points.')),
      ], 'The Sheriff has one more bullet, so one more card, than this scene shows.'),
      S('Ready to play', 'The Sheriff takes the first turn, then play passes clockwise.', 'all', [], 'A turn is: draw 2 cards, play as many cards as you like (but only one BANG!), then discard down to your life points.'),
    ],
    turn: [
      T('The Sheriff draws two cards', 'The Sheriff, on your left, shows their star and starts their turn by drawing the top 2 cards of the draw pile.', 'hand@1', [
        set('role@1', { faceUp: true, face: SHERIFF }),
        set('life@1', { label: '5' }),
        draw('deck', at('hand.3@1', 1.15, 0.5, 0.02)),
        draw('deck', at('hand.3@1', 1.8, 0.5, 0.04)),
      ]),
      T('They play a BANG! at you', 'A BANG! can only hit a player within range. Without a better weapon that is distance 1: the players sitting next to you.', 'c', [mv('hand.0@1', at('discard'))]),
      T('You answer with a Missed!', 'You discard a Missed! card to dodge the shot. If you could not, you would lose one bullet.', 'c', [mv('hand.1', at('discard', 0.5, 0.5, 0.02))]),
      T('They put gear into play', 'Blue-bordered cards such as weapons stay face up in front of the player who played them and keep working until removed.', 'hand@1', [mv('hand.3@1', by('life@1', 1.1, 0))]),
      T('End of turn and winning', 'The Sheriff discards down to their life points and the turn passes left. Outlaws win if the Sheriff dies; the Sheriff and Deputies win when every Outlaw and the Renegade are dead; the Renegade wins only as the last one standing.', 'all'),
    ],
  }
})
