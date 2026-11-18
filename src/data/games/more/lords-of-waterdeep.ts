/** Lords of Waterdeep: a city board of action spaces, quests, intrigue cards and a few agents each. */
import { C, L, On, OnMe, OnP, P, R, S, T, at, board, by, cards, cubes, deck, discs, draw, f, ft, hide, mat, mv, pawns, pile, spawn, tabletop, tiles } from '../compose'
import { slotUV } from '../layouts'

const slot = slotUV(5, 2)
const QUEST = ft('#f3e7c5', 'QUEST', 'reward', '⚑')
const GOLD = '#e0b12f'

export const lordsOfWaterdeep = tabletop('lords-of-waterdeep', 'Lords of Waterdeep', [2, 5], 4, '60–120 min', 'Medium', 'Send agents out, hire adventurers, finish quests.', ['#2f4a6b', '#d9772b', '#7a4fa3'], (n) => {
  const agents = n === 2 ? 4 : n === 3 ? 3 : 2
  return {
    setup: [
      S('Lay out the board', 'Put the board of Waterdeep in the middle of the table.', 'c', [
        C(board('city', 13, 8.5, 'g:slots:5x2:#d5c9a8:#2f4a6b:Waterdeep', 'Game board', 'Each box is a place an agent can be sent. In this schematic the far row gives fighters, clerics, rogues, wizards and gold; the near row is Castle Waterdeep, Builder’s Hall, Cliffwatch Inn, Waterdeep Harbor and the round track.')),
      ]),
      S('Adventurers and gold', 'Sort the adventurer cubes by color and put them and the gold beside the board.', 'l', [
        L(pile('fighters', '#d9772b', 'Fighters', 'Orange cubes. Adventurers are hired at buildings and spent to complete quests.'), pile('rogues', '#3a3a3a', 'Rogues', 'Black cubes.')),
        L(pile('clerics', '#e9e4d8', 'Clerics', 'White cubes.'), pile('wizards', '#7a4fa3', 'Wizards', 'Purple cubes.')),
        L(pile('goldpile', GOLD, 'Gold', 'Gold pays for buildings and some quests.', 'disc')),
      ]),
      S('Quests and intrigue cards', 'Shuffle the quest deck and turn 4 quests face up at Cliffwatch Inn. Shuffle the intrigue deck.', 'r', [
        R(deck('questdeck', 56 - 2 * n, f('#6b4a2e', '⚑'), 'Quest deck', '60 quest cards. Each lists the adventurers and gold it costs and the reward for completing it.'), cards('inn', 4, QUEST, 'Quests at Cliffwatch Inn', '4 face-up quests. An agent sent to the inn takes one, and it is replaced from the deck.')),
        R(deck('intdeck', 50 - 2 * n, f('#4a2e5a', '?'), 'Intrigue deck', '50 intrigue cards. They are played by sending an agent to Waterdeep Harbor.')),
      ], 'These decks have printed spaces on the real board; they are shown beside it here.'),
      S('Buildings and the round track', 'Shuffle the building tiles and turn 3 face up in Builder’s Hall. Put 3 victory point tokens on each of the 8 spaces of the round track.', 'r', [
        R(deck('bstack', 21, ft('#c9b68a', 'BUILD', 'cost', '⌂'), 'Building stack', '24 building tiles. A bought building becomes a new action space, and its owner earns a bonus whenever someone else uses it.', { w: 1.1, d: 1.1, per: 0.03 }), tiles('hall', 3, 1.1, 1.1, ft('#e9dfc8', 'BUILD', 'cost', '⌂'), 'Buildings for sale', '3 buildings on offer in Builder’s Hall.')),
        On('city', slot(9)[0], slot(9)[1] - 0.1, discs('vp', 1, 0.25, '#e9e4d8', 'Round track tokens', '3 victory point tokens on each of the 8 round spaces. At the start of a round its tokens are moved onto the buildings for sale.', { label: '3', h: 0.24 })),
      ]),
      S('Mats, agents and score markers', `Each player takes a player mat and all the agents of one color. With ${n} players you start with ${agents} agents each. One more agent goes on the round track and joins you at the start of round 5.`, 'you', [
        P(mat('tavern', 3.6, 2.2, '$', 'Tavern', 'Player mat', 'Your agent pool, the adventurers and gold you have gathered (your Tavern) and your completed quests.')),
        On('tavern', 0.35, 0.72, pawns('agent', agents, '$', 'Your agents', `${agents} agents each in a ${n}-player game (4 with two players, 3 with three, 2 with four or five).`, { scale: 0.5 })),
        OnP('city', slot(9)[0], slot(9)[1] + 0.12, pawns('extra', 1, '$', 'Extra agent', 'Waits on the round track and is added to your pool at the start of round 5.', { scale: 0.5 }), [0.42, 0]),
        OnP('city', 0.5, 0.981, discs('score', 1, 0.12, '$', 'Score marker', 'Starts on 0 and moves round the score track at the edge of the board.', { h: 0.2 }), [0.32, 0]),
      ]),
      S('Deal lords, quests and intrigue', 'Deal each player 1 Lord of Waterdeep card face down, 2 quests face up and 2 intrigue cards face down.', 'you', [
        P(cards('lord', 1, ft('#f3e7c5', 'LORD', 'secret'), 'Lord of Waterdeep', 'Your secret identity. It gives bonus points at the end, usually for certain types of completed quest.', { down: true, back: f('#2f4a6b', '♛') })),
        P(cards('quests', 2, QUEST, 'Your quests', '2 starting quests, kept face up. Completing quests is the main way to score.'), cards('intr', 2, ft('#eadcf0', 'INTRIGUE', ''), 'Your intrigue cards', '2 starting intrigue cards, kept hidden.', { down: true, back: f('#4a2e5a', '?') }), discs('gold', 1, 0.3, GOLD, 'Your gold', 'The first player starts with 4 gold, the player on their left with 5, the next with 6, and so on.', { label: '◆', h: 0.16 })),
      ]),
      S('Ready to play', 'The rules have the player who most recently visited another city go first; give them the first player marker. They take 4 gold, and each player after them takes 1 more than the one before.', 'all', [
        OnMe('tavern', 0.88, 0.25, discs('first', 1, 0.2, '#f6f1e4', 'First player marker', 'Its holder goes first each round. Castle Waterdeep lets another player take it.', { label: '1', h: 0.16 })),
      ], 'On your turn you assign one agent to an empty action space and take its effect, and then you may complete one quest. A round ends when all agents are placed; the game lasts 8 rounds.'),
    ],
    turn: [
      T('Assign an agent', 'You send an agent to the first space in the far row and take the 2 fighters it gives into your Tavern.', 'city', [
        mv('agent.0', at('city', slot(0)[0], slot(0)[1])),
        spawn(cubes('myf', 2, '#d9772b', 'Your fighters', 'Adventurers in your Tavern, ready to spend on a quest.', { s: 0.22 }), at('tavern', 0.3, 0.28), 'fighters', undefined, 1.2),
      ]),
      T('Next player', 'The player on your left sends an agent to the gold space and takes 4 gold. A space with an agent on it is closed to everyone else this round.', 'city', [
        mv('agent.0@1', at('city', slot(4)[0], slot(4)[1])),
        spawn(discs('g1', 1, 0.22, GOLD, 'Gold', 'Gold taken this turn.', { label: '4', h: 0.12 }), at('tavern@1', 0.5, 0.28), 'goldpile', undefined, 1.2),
      ]),
      T('Take a new quest', 'Your second agent goes to Cliffwatch Inn. You take one of the face-up quests, and the gap is filled from the deck. Each of the inn’s three spaces adds a bonus: 2 gold, an intrigue card, or first clearing away the 4 quests and dealing new ones.', 'r', [
        mv('agent.1', at('city', slot(7)[0], slot(7)[1])),
        mv('inn.1', at('quests.1', 0.5, -0.3, 0.02), 1),
        draw('questdeck', by('inn.0', 1.04, 0), QUEST, undefined, 1.8),
      ]),
      T('Complete a quest', 'After placing an agent you may complete one quest. Say one of yours needs exactly 2 fighters: return them to the supply, set the quest aside as completed and score its reward.', 'you', [
        hide('myf.0'), hide('myf.1'),
        mv('quests.0', at('tavern', 0.8, 0.7), 1),
        mv('score', at('city', 0.25, 0.981), 1.6),
      ]),
      T('End of the game', 'After the 8th round everyone reveals their lord and adds its bonus, plus 1 point for each adventurer and 1 point for every 2 gold left over. The highest score wins.', 'all'),
    ],
  }
})
