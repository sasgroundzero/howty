/** Mage Knight Board Game: a map revealed tile by tile, card offers, a mana source and a deed deck for each hero. */
import { C, L, On as On0, OnP, P, R, S, T, at, board, by, cards, deck, dice, discs, draw, f, ft, hexes, mat, mv, pawns, pile, spawn, tabletop, tiles, zone } from '../compose'
import type { Item, Place } from '../compose'

/** On() with an explicit zero spread: the composer reads `spread` for every on-board placement. */
const On = (parent: string, u: number, v: number, item: Item): Place => ({ ...On0(parent, u, v, item), spread: [0, 0] })

const MANA = ['#c0392b', '#2e6fb7', '#3d8b4a', '#e9e4d8', '#e0b12f', '#3a3a3a']
const ACTION = [f('#3d8b4a', '▲'), f('#2e6fb7', '◆'), f('#c0392b', '⚔'), f('#e9e4d8', '★', '#2b241c'), f('#3d8b4a', '▲')]
const ENEMY = ['#3d8b4a', '#8a8f98', '#7a4fa3', '#8a5a34', '#c0392b', '#e9e4d8']

export const mageKnight = tabletop('mage-knight', 'Mage Knight Board Game', [1, 4], 2, '2–4 hours', 'Hard', 'Explore, fight and grow your hero\'s deck.', ['#3d6b4a', '#7a4fa3', '#e0b12f'], (n) => ({
  setup: [
    S('Pick a scenario and build the map', 'Choose a scenario: First Reconnaissance is the one meant for learning. Place the starting tile with its A side up and two countryside tiles face up against it.', 'c', [
      C(
        zone('frontier', 2.7, 3, 'Unexplored', 'New map tiles are added here as heroes explore outward.'),
        hexes('map', 2, 1.5, ['#9bbf7a', '#b9c98a'], 'Countryside tile', 'Each tile is a flower of seven hex spaces showing terrain and sites. Two countryside tiles start face up.', { gap: 0.06 }),
      ),
      C(hexes('portal', 1, 1.5, '#6fa8c9', 'Starting tile', 'The starting tile, A side up, with the magic portal where every hero begins.', { label: 'A' })),
    ], 'The scenario book sets the map shape, the number of rounds and how many tiles go in the stack for your player count.'),
    S('Tile stack and enemy tokens', 'Build the map tile stack as the scenario says, with countryside tiles on top of core tiles. Sort the enemy and ruin tokens face down into piles by their backs, then put 2 orc tokens face up on the two marked spaces of the starting map.', 'l', [
      L(
        hexes('tiledeck', 1, 0.8, '#7a8f5a', 'Map tile stack', 'Countryside tiles on top, core and city tiles underneath. How many of each depends on the scenario and player count.', { label: '?' }),
        tiles('daynight', 1, 2.4, 1.6, ft('#f3e2a0', 'DAY', 'round 1'), 'Day and night board', 'Starts on the day side. It also holds the mana dice of the source.', { h: 0.05 }),
      ),
      L(discs('enemies', 6, 0.28, ENEMY, 'Enemy token piles', 'Sorted by back into face-down piles: marauding orcs, keep garrisons, mage tower guardians, dungeon monsters, draconum, city defenders and ruin tokens.', { h: 0.3 })),
      On('map.0', 0.3, 0.35, discs('orc', 1, 0.25, '#3d8b4a', 'Enemy token', 'When a tile is revealed, enemy tokens go on the sites that call for them. Rampaging enemies are placed face up.', { label: '⚔', h: 0.08 })),
    ]),
    S('Fame and reputation', 'Each player puts one shield token on 0 of the fame track and one on the middle space of the reputation track.', 'fame', [
      L(board('fame', 5.5, 2.6, 'g:lanes:10:#e8dcc0:#7a4fa3:Fame and reputation', 'Fame and reputation board', 'Fame is experience and your score: crossing the end of a row levels you up. Reputation changes how locals react to you.')),
      OnP('fame', 0.15, 0.3, discs('famesh', 1, 0.12, '$', 'Fame shield', 'Starts at 0 fame.'), [0.3, 0]),
      OnP('fame', 0.5, 0.72, discs('repsh', 1, 0.12, '$', 'Reputation shield', 'Starts on the neutral middle space.'), [0.3, 0]),
    ]),
    S('Unit, action and spell offers', `Deal ${n + 2} regular units face up (the number of players plus 2), then 3 advanced actions and 3 spells.`, 'r', [
      R(deck('unitdeck', 16, f('#b0b0b0', '⚑', '#2b241c'), 'Regular unit deck', 'Units you can recruit at villages, keeps and other sites. Elite units join the offer later.'), cards('units', n + 2, ft('#e8e8e8', 'UNIT', 'recruit', '⚑'), 'Unit offer', `${n + 2} units with ${n} ${n === 1 ? 'player' : 'players'}. The offer is refreshed every round.`)),
      R(
        deck('advdeck', 20, f('#c9a23a', '▲', '#2b241c'), 'Advanced action deck', 'Stronger action cards gained when you level up.'),
        cards('adv', 3, ft('#f3e2a0', 'ADV', 'action', '▲'), 'Advanced action offer', '3 cards to choose from when a level gives you an advanced action.'),
        deck('spelldeck', 16, f('#7a4fa3', '✦'), 'Spell deck', 'Spells are learned at mage towers and after conquering certain sites.'),
        cards('spells', 3, ft('#e3d9f0', 'SPELL', 'day or night', '✦'), 'Spell offer', '3 spells on offer.'),
      ),
    ], 'In First Reconnaissance the advanced action and spell offers start empty: deal them when someone first levels up or reveals a mage tower.'),
    S('Source, artifacts, wounds and tactics', `Roll ${n + 2} mana dice for the source (players plus 2), rerolling as the rules require if too many show gold or black. Set out the artifact deck, the wound pile and the day tactic cards.`, 'r', [
      R(
        dice('source', n + 2, MANA, 'Mana source', `${n + 2} dice. On your turn you may use one die from the source to power a card, then reroll it.`, { values: [1, 2, 3, 4, 5, 6], size: 0.5, ink: '#8a8f98' }),
        deck('artifacts', 12, f('#d9772b', '★'), 'Artifact deck', 'Rewards for clearing dungeons, tombs and other dangerous sites.'),
        deck('wounds', 20, f('#8a2b2b', '●'), 'Wound pile', 'Wound cards go into your hand when you take damage and clog it until healed.'),
      ),
      R(cards('tactics', 6, ft('#f3e2a0', 'TACTIC', 'day', '★'), 'Day tactic cards', '6 day tactics. Each player picks one every round: its number sets turn order and it gives a small benefit.', { w: 0.75, d: 1.05 })),
    ]),
    S('Choose heroes', 'Each player takes a hero: the figure, hero card, 16-card deed deck, skill, level and shield tokens. Shuffle your deed deck and draw 5 cards. Figures wait in front of you and enter the map on the portal on your first turn.', 'you', [
      P(zone('play', 6, 1.3, 'Play area', 'Cards you play this turn are laid here, then discarded at the end of the turn.')),
      P(deck('deed', 11, f('#5a4634', '⚔'), 'Deed deck', 'Your 16 basic action cards, less the 5 in your hand. When it runs out you may announce the end of the round.'), cards('hand', 5, ACTION, 'Your hand', 'You start with 5 cards. Cards give movement, influence, attack or block, and can be played sideways for 1 of anything.')),
      P(
        mat('herocard', 2, 1.5, '$', 'Hero', 'Hero card', 'Shows your armor, hand limit and how many units you can command. Level tokens stack on it.'),
        discs('levels', 1, 0.28, '$', 'Level and skill tokens', 'Level tokens are flipped as you level up; skill tokens are drawn to give you new abilities.', { h: 0.3 }),
        pile('shields', '$', 'Shield tokens', 'Mark the keeps, mage towers and other sites you conquer.', 'disc'),
        zone('discard', 0.9, 1.26, 'Discard', 'Your discard pile.'),
      ),
      OnP('portal', 0.5, 0.5, pawns('hero', 1, '$', 'Hero figure', 'Your Mage Knight. It is placed on the portal space of the starting tile on your first turn.', { scale: 0.6, shape: 'hero' }), [0.55, 0]),
    ], n === 1 ? 'Solo play also uses a dummy player to pace the rounds: see the scenario rules.' : undefined),
    S('Ready to play', 'Each round begins with everyone choosing a tactic card. Turns then go in the order of the tactic numbers, lowest first.', 'all', [], 'On your turn you move and then take one action, such as fighting or talking to locals, playing cards from your hand to pay for it all.'),
  ],
  turn: [
    T('Choose a tactic', 'You take a day tactic card. Its number decides when you act this round.', 'tactics', [mv('tactics.2', at('play', 0.93, 0.5))]),
    T('Play cards to move', 'You play two cards for movement points and walk onto the next tile. Each terrain has its own movement cost.', 'c', [
      mv('hand.0', at('play', 0.1, 0.5)),
      mv('hand.1', at('play', 0.27, 0.5)),
      mv('hero', at('map.0', 0.55, 0.72)),
    ]),
    T('Explore', 'Standing at the edge of the map, you spend 2 more movement points to reveal the top tile of the stack and add it to the map.', 'c', [
      spawn(hexes('newtile', 1, 1.5, '#a9c48a', 'New map tile', 'A freshly revealed tile. Place enemy tokens on its sites straight away.'), at('frontier', 0.5, 0.5), 'tiledeck'),
      spawn(discs('foe', 1, 0.25, '#8a8f98', 'Enemy token', 'A face-down garrison waiting on a fortified site.', { label: '?', h: 0.08 }), at('frontier', 0.5, 0.35, 0.14), 'enemies'),
    ]),
    T('End your turn', 'Discard the cards you played and draw back up to your hand limit of 5. Rerolled mana dice go back to the source.', 'you', [
      mv('hand.0', at('discard', 0.5, 0.5)),
      mv('hand.1', at('discard', 0.5, 0.5, 0.02)),
      draw('deed', by('hand.2', -2.08, 0), ACTION[2]),
      draw('deed', by('hand.2', -1.04, 0), ACTION[1]),
    ]),
    T('Rounds and the finish', 'A round ends after a player whose deed deck is empty announces it: everyone else gets one more turn, then day turns to night. First Reconnaissance gives 1 fame per tile revealed and ends once the city tile is revealed and everyone has had one more turn, or after 3 rounds. The highest fame wins.', 'all'),
  ],
}))
