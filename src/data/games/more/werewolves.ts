/** The Werewolves of Miller's Hollow: one secret character card each and a moderator who runs night and day. */
import { C, L, P, S, T, at, cards, deck, f, flip, ft, mv, set, tabletop, zone } from '../compose'

const BACK = f('#2b2f4a', '☾')
const VILLAGER = ft('#efe6d2', 'Villager', 'ordinary townsfolk', '⌂')
const WOLF = ft('#d9c2c2', 'Werewolf', 'hunts at night', '▲')
const SEER = ft('#d8d2ee', 'Fortune Teller', 'sees one card a night', '✦')

export const werewolves = tabletop('werewolves', "The Werewolves of Miller's Hollow", [8, 8], 8, '30 min', 'Easy', 'Villagers hunt the werewolves hidden among them.', ['#2b2f4a', '#c0392b', '#e9e4d8'], () => ({
  setup: [
    S('Choose a moderator', 'One extra person runs the game. The moderator gets no card, does not play, and talks the village through each night and day.', 'all', [], 'The real game seats 8 to 18 players plus the moderator. This tutorial shows the smallest game: 8 players.'),
    S('Pick the characters', 'For a first game with 8 players take 2 Werewolves, the Fortune Teller and 5 ordinary Villagers. Put every other card back in the box.', 'l', [
      L(deck('spare', 16, BACK, 'Unused character cards', 'The rest of the character cards, about two dozen in all. They include extra Werewolves and Villagers and special characters such as the Witch, Hunter, Cupid, Thief and Little Girl, which you can add once you know the game.')),
    ], 'The rules suggest 2 Werewolves for smaller villages and more for big ones: check the rulebook for your group size.'),
    S('Deal one card each', 'Shuffle the 8 chosen cards and deal one face down to each player.', 'all', [
      P(cards('role', 1, VILLAGER, 'Character card', 'Your secret identity: a Werewolf, the Fortune Teller or an ordinary Villager. It stays face down in front of you until you are eliminated.', { down: true, back: BACK })),
    ]),
    S('Look at your card in secret', 'Everyone peeks at their own card and puts it back face down. Nobody may show their card to anyone else.', 'you', [], 'In this walkthrough you are the Fortune Teller.'),
    S('Leave space in the middle', 'Keep the middle of the table clear. When a player is eliminated their card is turned face up there and they stop talking.', 'c', [
      C(zone('gone', 4.6, 1.8, 'Eliminated players', 'Cards of players who were eaten in the night or voted out by day, face up for all to see.')),
    ]),
    S('Ready to play', 'The moderator announces that night is falling and every player closes their eyes.', 'all', [], 'Each round is a night, when the moderator wakes the special characters in turn, followed by a day of debate and a vote.'),
  ],
  turn: [
    T('Night: the Fortune Teller wakes', 'The moderator calls the Fortune Teller. You open your eyes and point at one player, and the moderator silently shows you that player’s card.', 'all', [
      set('role', { faceUp: true, face: SEER }),
      set('role@2', { faceUp: true, face: VILLAGER }),
    ]),
    T('Night: the Werewolves wake', 'You close your eyes again. The moderator calls the Werewolves, who open their eyes, recognise each other and silently agree on one victim.', 'all', [flip('role', false), flip('role@2', false)]),
    T('Morning: a victim is found', 'Everyone wakes up. The moderator names the player who was eaten; that player turns their card face up and is out of the game.', 'c', [
      mv('role@5', at('gone', 0.28, 0.5)),
      set('role@5', { faceUp: true, face: VILLAGER }),
    ]),
    T('Day: debate and vote', 'The survivors argue about who looks guilty, then all point at a suspect at the same moment. The player with the most votes is eliminated and reveals their card. On a tie nobody is eliminated.', 'c', [
      mv('role@3', at('gone', 0.72, 0.5)),
      set('role@3', { faceUp: true, face: WOLF }),
    ]),
    T('Night falls again', 'Nights and days alternate. The Villagers win as soon as every Werewolf is eliminated. The Werewolves win when no Villagers are left.', 'all'),
  ],
}))
