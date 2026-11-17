/** The Lord of the Rings: The Card Game: a co-operative quest against an encounter deck. */
import { C, P, R, S, T, at, cards, deck, discs, draw, f, ft, hide, mv, pile, spawn, tabletop, zone } from '../compose'

const HERO = [ft('#f3e7c5', 'HERO', 'leadership', '♛'), ft('#f3e7c5', 'HERO', 'tactics', '⚔'), ft('#f3e7c5', 'HERO', 'spirit', '✦')]
const PCARD = [ft('#eef1e6', 'ALLY', 'cost', '●'), ft('#eef1e6', 'EVENT', 'cost', '★'), ft('#eef1e6', 'ALLY', 'cost', '▲'), ft('#eef1e6', 'ITEM', 'cost', '◆')]
const ENEMY = ft('#e6d6d0', 'ENEMY', 'threat', '⚔')
const res = (id: string) => discs(id, 1, 0.15, '#e9e4d8', 'Resource token', 'Spent from a hero\'s pool to pay for cards of that hero\'s sphere.', { h: 0.06 })

export const lotrLcg = tabletop('lotr-lcg', 'The Lord of the Rings: The Card Game', [1, 4], 2, '60 min', 'Hard', 'Co-op quests with heroes against the deck.', ['#3b4a2f', '#e0b12f', '#7a2f2f'], (n) => ({
  setup: [
    S('Choose heroes and set your threat', 'Each player puts 1 to 3 heroes in front of them and sets their threat tracker to the total threat cost of those heroes.', 'you', [
      P(zone('play', 5, 1.4, 'Allies and engaged enemies', 'Allies and attachments you play go here. Enemies that engage you also sit in front of you.')),
      P(
        cards('heroes', 3, HERO, 'Heroes', 'Up to 3 heroes each. They collect resources, quest, attack and defend. If all your heroes are lost you are out.'),
        discs('threat', 1, 0.4, '#7a2f2f', 'Threat tracker', 'One dial per player. It starts at the sum of your heroes\' threat costs and you are eliminated at 50.', { label: 'T', h: 0.1 }),
        deck('pdeck', 24, f('#3b4a2f', '≡'), 'Player deck', 'Your shuffled deck of allies, attachments and events. A tournament deck has at least 50 cards; the starter decks are smaller.'),
        zone('pdiscard', 1.0, 1.36, 'Discard', 'Your discard pile.'),
      ),
    ], 'One core set supports 1 or 2 players; 3 or 4 players need a second core set or more cards.'),
    S('Draw six cards', 'Each player shuffles their deck and draws 6 cards. You may take one mulligan: shuffle the hand back and draw 6 new cards.', 'you', [
      P(cards('hand', 6, PCARD, 'Starting hand', '6 cards each. You pay for them with resources from heroes of the matching sphere.', { gap: 0.1 })),
    ]),
    S('Set out the tokens', 'Put the resource, damage and progress tokens where everyone can reach them. Give the first player token to one player.', 'r', [
      R(pile('res', '#e9e4d8', 'Resource tokens', 'The shared supply. Each hero gains one every round.', 'disc'), pile('dmg', '#c0392b', 'Damage tokens', 'Placed on characters and enemies that are hurt.', 'disc'), pile('prog', '#3d8b4a', 'Progress tokens', 'Placed on locations and the quest as you succeed at questing.', 'disc')),
    ]),
    S('Build the quest and encounter decks', 'Stack the scenario\'s quest cards in order with stage 1 on top. Shuffle the encounter sets the scenario lists into one encounter deck.', 'c', [
      C(
        deck('quest', 3, ft('#f3e7c5', 'QUEST', 'stage 1', '⚑'), 'Quest deck', 'A few quest cards per scenario, worked through in order. Place the needed progress to move to the next stage.'),
        zone('active', 1.0, 1.36, 'Active location', 'The one location the group has travelled to. Progress goes here before it reaches the quest.'),
        deck('encdeck', 30, f('#7a2f2f', '?'), 'Encounter deck', 'Enemies, locations and treacheries for this scenario. The size depends on the scenario.'),
        zone('encdiscard', 1.0, 1.36, 'Encounter discard', 'Resolved treacheries and defeated enemies go here.'),
      ),
      C(zone('staging', 5.4, 1.5, 'Staging area', 'Revealed enemies and locations wait here. Their threat counts against you during the quest phase.')),
    ]),
    S('Follow the quest card setup', 'Read the setup instructions on the first quest card and carry them out, then flip it to its stage side.', 'quest', [], 'Setup text often tells you to put specific encounter cards into the staging area.'),
    S('Ready to play', 'The player with the first player token acts first in each phase, and the token passes clockwise at the end of every round.', 'all', [], 'A round has seven phases: resource, planning, quest, travel, encounter, combat and refresh.'),
  ],
  turn: [
    T('Resource phase', 'Every hero gains 1 resource token and every player draws 1 card.', 'you', [
      spawn(res('r0'), at('heroes.0', 0.5, 0.8), 'res'), spawn(res('r1'), at('heroes.1', 0.5, 0.8), 'res'), spawn(res('r2'), at('heroes.2', 0.5, 0.8), 'res'),
      draw('pdeck', at('hand.5', 1.12, 0.5, 0.02)),
    ]),
    T('Planning phase', 'You pay 1 resource from a hero of the matching sphere and play a 1-cost ally from your hand.', 'you', [hide('r0'), mv('hand.2', at('play', 0.2, 0.5))]),
    T('Quest phase', 'Players commit characters to the quest, then reveal one encounter card per player into the staging area. If your total willpower beats the staging threat, place the difference as progress.', 'c', [
      ...Array.from({ length: n }, (_, k) => draw('encdeck', at('staging', 0.14 + k * 0.24, 0.5), ENEMY, `enc${k}`)),
      spawn(discs('p0', 1, 0.15, '#3d8b4a', 'Progress token', 'Progress made on the current quest stage.', { h: 0.06 }), at('quest', 0.5, 0.5), 'prog', undefined, 1.6),
    ], 9),
    T('Encounter and combat', 'Enemies whose engagement cost is at or below your threat come down to engage you. Each engaged enemy attacks, then your ready characters may strike back.', 'you', [mv('enc0', at('play', 0.8, 0.5))]),
    T('Refresh, and how it ends', 'Ready all cards, raise every player\'s threat by 1 and pass the first player token. The group wins together by completing the last quest stage; a player is out at 50 threat or with no heroes left.', 'all'),
  ],
}))
