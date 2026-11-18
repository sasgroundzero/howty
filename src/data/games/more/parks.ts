/** Parks (first edition): a trail of site tiles, two hikers each, and park cards to visit at the trail end. */
import { C, L, On, OnMe, OnP, P, R, S, T, at, board, by, cards, deck, discs, draw, f, ft, mv, pawns, pile, set, spawn, tabletop, tiles, zone } from '../compose'

const TOK = { forest: '#3d8b4a', mountain: '#8a8f96', sun: '#e0b12f', water: '#4f8fb7' }
const PARK = ft('#e9dfc8', 'PARK', 'cost and points', '▲')
const GEAR = ft('#f3ecdc', 'GEAR', 'cost in sun', '✦')
const token = (id: string, c: string, name: string) => discs(id, 1, 0.14, c, `${name} token`, 'A resource token. Spend the tokens a park asks for to visit it. You may hold at most 12 at the end of your turn.', { h: 0.08 })

export const parks = tabletop('parks', 'Parks', [1, 5], 3, '40–70 min', 'Easy', 'Hike the trail and visit national parks.', ['#3d6b4a', '#e0b12f', '#4f8fb7'], (n) => {
  const sites = n >= 4 ? 7 : 6
  const solo = n === 1
  const RANGER = '#7d8a4a'
  const SITE = ['▲', '♣', '●', '≈', '◆', '✦', '★'].map((g, i) => f(['#8a8f96', '#3d8b4a', '#e0b12f', '#4f8fb7', '#b7a07a', '#7a9a8a', '#5a7fa3'][i], g))
  return {
    setup: [
      S('Board and parks', 'Unfold the board. Shuffle the park cards, put the deck on the board and deal 3 parks face up beside it.', 'board', [
        C(board('board', 11, 3.4, 'g:plain:0:#e9dfc8:#3d6b4a:Parks', 'Board', 'Holds the park deck and three face-up parks. On the real board the gear, canteens and season card have marked spaces too.')),
        On('board', 0.1, 0.5, deck('parkdeck', 48, f('#3d6b4a', '▲'), 'Park deck', 'The park cards. Each park costs a set of tokens to visit and is worth points at the end.', { w: 1.5, d: 1.05 })),
        On('board', 0.44, 0.5, cards('parks', 3, PARK, 'Face-up parks', 'Three parks are always on offer. Reserve or visit one when a hiker reaches the trail end.', { w: 1.5, d: 1.05, gap: 0.2 })),
      ]),
      S('Gear, canteens and tokens', `${solo ? 'Shuffle the gear deck and put it on the board without turning any gear up: the Rangers will reveal it.' : 'Shuffle the gear deck and deal 3 gear cards face up.'} Shuffle the canteens and deal 1 face up to each player. Sort the tokens into the supply.`, 'all', [
        L(deck('gear', 36, f('#7a5a3a', '✦'), 'Gear deck', 'Gear cards cost sun tokens and give you a lasting advantage.'), ...(solo ? [] : [cards('gearrow', 3, GEAR, 'Face-up gear', 'Three gear cards are on offer. Buy one when a hiker reaches the trail end.')])),
        R(pile('sunpile', TOK.sun, 'Sun tokens', 'Sunshine tokens, mostly from the valley site and from weather.', 'disc'), pile('waterpile', TOK.water, 'Water tokens', 'Water tokens, mostly from the ocean site and from weather. Water can also fill a canteen.', 'disc')),
        R(pile('forestpile', TOK.forest, 'Forest tokens', 'Forest tokens, mostly from the forest site.', 'disc'), pile('mountainpile', TOK.mountain, 'Mountain tokens', 'Mountain tokens, mostly from the mountain site.', 'disc')),
        P(zone('area', 4.5, 1.5, 'Your tokens and parks', 'Keep your tokens, photos and parks here. You may hold at most 12 tokens at the end of your turn.')),
        P(cards('canteen', 1, ft('#cfe3ea', 'CANTEEN', 'fill with water', '●'), 'Canteen', 'Each player starts with 1. Put a water token on it when you gain the water, to use its effect once this season.'), cards('year', 1, ft('#f3e7c5', 'YEAR', 'bonus', '★'), 'Year card', 'Your secret personal bonus, scored at the end. Deal 2 to each player, who keeps 1. In a first game the rules suggest dealing just 1.', { down: true }), discs('fire', 1, 0.25, '#d9772b', 'Campfire', 'One per player, lit side up. Put it out to visit a site another hiker is on. It relights when one of your hikers reaches the trail end.', { h: 0.06 })),
      ], 'There are also wildlife tokens, which stand in for any token when visiting parks or taking photos, and photos worth 1 point each.'),
      S('Season card', 'Shuffle the season cards, place them on the board and turn the top one face up as the first season.', 'season', [
        On('board', 0.88, 0.5, deck('season', 10, ft('#f3ecdc', 'SEASON', 'weather', '☼'), 'Season deck', 'The top card is the current season. It gives a small rule for the season and shows the weather pattern. The game lasts 4 seasons.')),
      ]),
      S('Lay the trail', `Put the trailhead on the left. Shuffle the basic site tiles with 1 random advanced site and lay them in a row, ${sites} sites in a ${n}-player game, ending with the trail end${solo ? ', turned to its SOLO side' : ''}.`, 'c', [
        C(tiles('head', 1, 2.4, 1.5, ft('#d8cfae', 'TRAILHEAD', 'start'), 'Trailhead', 'All hikers start each season here.'), tiles('site', sites, 1, 1.5, SITE.slice(0, sites), 'Trail sites', 'Each site gives tokens or an action to a hiker who lands on it. The order changes every season.', { gap: 0.1 }), tiles('end', 1, 2.4, 1.5, ft('#d8cfae', 'TRAIL END', 'parks and gear'), 'Trail end', 'A hiker who arrives here reserves a park, buys gear or visits a park.')),
        L(tiles('adv', 1, 1, 1.5, f('#5a4634', '?'), 'Other advanced sites', 'The 3 unused advanced sites wait face down. One more joins the trail each season, so the trail grows.', { h: 0.24 })),
      ], solo ? 'Solo, the Waterfall tile stays in the box. The trail end’s solo side has three dark green slots for the Rangers.' : n >= 4 ? 'With 4 or 5 players the Waterfall tile is added to the five basic sites.' : 'With fewer than 4 players the Waterfall tile stays in the box.'),
      S('Weather', 'Following the pattern on the season card, put one sun or water token on each site, starting from the second site and repeating the pattern to the end.', 'site',
        Array.from({ length: sites - 1 }, (_, k) => On(`site.${k + 1}`, 0.5, 0.18, discs(`wx${k + 1}`, 1, 0.14, k % 2 ? TOK.water : TOK.sun, 'Weather token', 'The first hiker to land on this site this season takes the weather token as a bonus.', { h: 0.08 }))),
      ),
      S('Hikers and markers', solo ? 'Put your 2 hikers and 2 Rangers of another color on the trailhead. Rangers need no campfire. Set the Ranger Tracker beside you, shuffle the 9 event cards and turn the top one up. You start with the camera and the first hiker marker.' : 'Each player puts their 2 hikers on the trailhead. Give the first hiker marker to whoever went hiking most recently, and the camera to the player on their right.', 'head', [
        OnP('head', 0.5, 0.5, pawns('hiker', 2, '$', 'Hikers', 'Two per player. Each turn you move one of them forward along the trail.', { scale: 0.4, cols: 1, gap: 0.06 }), [0.42, 0]),
        OnMe('area', 0.94, 0.25, discs('first', 1, 0.2, '#b7a07a', 'First hiker marker', 'Its holder starts the season. It is worth 1 point at the end of the game.', { h: 0.06 })),
        ...(solo ? [
          On('head', 0.5, 0.15, pawns('ranger', 2, RANGER, 'Rangers', 'The solo game’s two Rangers. On their turn the gear deck says how far one moves.', { scale: 0.4, gap: 0.3 })),
          L(tiles('tracker', 1, 1.6, 0.9, ft('#efe6cf', 'RANGER TRACKER', '3 sun · 3 water'), 'Ranger Tracker', 'Weather the Rangers collect goes here, sun on the top row and water on the bottom. Three of a kind triggers the active event.'), deck('events', 9, ft('#d9cdb0', 'EVENT', 'solo'), 'Event deck', 'The 9 solo event cards. The top one is the active event; after it triggers it goes to the bottom.', { w: 0.9, d: 1.3 })),
        ] : []),
        On(`area@${n - 1}`, 0.06, solo ? 0.8 : 0.25, tiles('camera', 1, 0.4, 0.4, f('#3a3a3a', '◉'), 'Camera', 'Whoever holds the camera takes photos for 1 token instead of 2.')),
      ]),
      solo
        ? S('Ready to play', 'You go first, then you and the Rangers take turns. On your turn move one of your hikers to any site further along the trail and do what that site says.', 'all', [], 'Rangers move the front Ranger if a hiker is ahead of both, otherwise the back one. A Ranger that would land on a hiker skips to the next site.')
        : S('Ready to play', 'The player with the first hiker marker goes first, then play passes clockwise.', 'all', [], 'On your turn move one of your hikers to any site further along the trail and do what that site says.'),
    ],
    turn: [
      T('Move a hiker', 'You move one hiker to the second site. You are first there this season, so you take its weather token, and then the site gives you a forest token.', 'c', [
        mv('hiker.0', at('site.1', 0.5, 0.62)), mv('wx1', at('area', 0.1, 0.3)),
        spawn(token('tk1', TOK.forest, 'Forest'), at('area', 0.2, 0.3), 'forestpile'),
      ]),
      ...(solo ? [
        T('The Rangers’ turn', 'Turn up the top gear card and put it in the gear slot for its cost. It costs 2, so the front Ranger moves 2 sites; your hiker is there, so it skips on to the third site and puts that weather token on the Ranger Tracker.', 'c', [
          draw('gear', by('gear', 1.6, 0), GEAR), mv('ranger.0', at('site.2', 0.5, 0.62)), mv('wx2', at('tracker', 0.3, 0.5)),
        ]),
        T('Use your campfire', 'A site with a hiker or Ranger on it is closed to you unless you put out your campfire. You do that to join the Ranger on the third site with your other hiker. Three matching tokens on the tracker would trigger the event card.', 'c', [
          mv('hiker.1', at('site.2', 0.5, 0.3)), set('fire', { color: '#5a5a5a' }),
          spawn(token('tk3', TOK.water, 'Water'), at('area', 0.3, 0.3), 'waterpile'),
        ]),
      ] : [
        T('Next player jumps ahead', 'Hikers may skip any number of sites but never move backwards. The next player goes to the fourth site and collects its weather token and its reward.', 'c', [
          mv('hiker.0@1', at('site.3', 0.5, 0.62)), mv('wx3', at('area@1', 0.3, 0.3)),
          spawn(token('tk2', TOK.water, 'Water'), at('area@1', 0.4, 0.3), 'waterpile'),
        ]),
        T('Use your campfire', 'A site with a hiker on it is closed to you unless you put out your campfire. You do that to join the fourth site with your other hiker.', 'c', [
          mv('hiker.1', at('site.3', 0.5, 0.3)), set('fire', { color: '#5a5a5a' }),
          spawn(token('tk3', TOK.water, 'Water'), at('area', 0.3, 0.3), 'waterpile'),
        ]),
      ]),
      T('Reach the trail end', `At the trail end your campfire relights and you choose one: reserve a park, buy gear, or visit a park by paying its tokens. You reserve a park, and a new one is dealt. ${solo ? 'Rangers that reach the trail end discard a park instead, by the slot their gear cost names.' : 'The first hiker to reserve a park each season also takes the first hiker marker.'}`, 'board', [
        mv('hiker.0', at('end', 0.3, 0.5)), set('fire', { color: '#d9772b' }),
        mv('parks.1', at('area', 0.7, 0.5)), draw('parkdeck', by('parks.0', 1.7, 0), PARK),
      ]),
      T('Seasons and final scoring', `A season ends when all hikers are at the trail end; the trail is then rebuilt one site longer. After 4 seasons add up your parks, 1 point per photo, your year card bonus and 1 point for the first hiker marker. ${solo ? 'Solo, 25 is a seasoned hiker and 30 or more is an unforgettable trip.' : 'Most points wins.'}`, 'all'),
    ],
  }
})
