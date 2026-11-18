/** Elder Sign: roll dice to complete museum adventures and collect elder signs before doom fills up. */
import { C, On, OnP, P, type Place, R, S, T, at, box, by, cards, deck, dice, discs, draw, f, ft, mat, mv, pile, roll, set, spawn, tabletop, zone } from '../compose'

/** On() leaves `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const ADV = ft('#e7dcc0', 'ADVENTURE', 'tasks and reward', '⚑')
const BIG = { w: 1.5, d: 2.1 }

export const elderSign = tabletop('elder-sign', 'Elder Sign', [1, 8], 4, '60–90 min', 'Medium', 'Dice adventures in a haunted museum.', ['#27323d', '#3d8b4a', '#e0b12f'], (n) => ({
  setup: [
    S('Ancient One and clock', 'Choose an Ancient One at random and put its card where everyone can see its doom track. Set the clock to midnight.', 'c', [
      C(mat('ancient', 2.8, 2, '#2b2233', 'Ancient One', 'Ancient One card', 'Shows the doom track, how many elder signs are needed to seal it away and what happens if it wakes.'),
        discs('clock', 1, 0.8, '#efe6d2', 'Clock', 'Advances 3 hours at the end of every turn. Each time it strikes midnight a Mythos card is drawn.', { label: 'XII', h: 0.05 }),
        mat('entrance', 2.8, 2, '#d9c9a0', 'Entrance', 'Museum entrance', 'The reference sheet where investigators start. Instead of adventuring you can stay here to heal, buy things or search the lost and found.')),
    ]),
    S('Deal six adventures', 'Shuffle the Adventure cards and deal 6 face up in two rows of three. Shuffle the Other World cards and set them aside as their own deck.', 'adv', [
      C(deck('advdeck', 40, f('#5a4634', '⚑'), 'Adventure deck', 'Refills the display each time an adventure is completed.', BIG),
        cards('adv', 6, ADV, 'Adventure cards', 'Each shows rows of dice symbols called tasks, the reward for completing all of them and the penalty for failing.', { ...BIG, cols: 3 }),
        deck('oworld', 8, f('#3b2a5a', '◎'), 'Other World deck', 'Harder adventures that only come into play when a gate opens.', BIG)),
    ]),
    S('Choose investigators', 'Each player takes an investigator card, sanity and stamina tokens equal to the values printed on it, and the starting items and clue tokens it lists.', 'you', [
      P(cards('inv', 1, ft('#efe2bd', 'INVESTIGATOR', 'ability', '♙'), 'Investigator card', 'One of 16 investigators. It shows your maximum sanity and stamina, a special ability and your starting items.', { w: 1.3, d: 1.8 }),
        discs('sanity', 1, 0.22, '#2e6fb7', 'Sanity tokens', 'A stack equal to your maximum sanity. If it runs out your investigator is devoured.', { h: 0.25 }),
        discs('stamina', 1, 0.22, '#c0392b', 'Stamina tokens', 'A stack equal to your maximum stamina. If it runs out your investigator is devoured.', { h: 0.25 }),
        cards('items', 2, [f('#8a6a44', '◆'), f('#7a4fa3', '✦')], 'Starting items', 'Common items, unique items, spells or allies listed on your investigator card. The number varies: two are shown as an example.')),
      P(zone('trophy', 3.6, 2.3, 'Trophies', 'Completed adventure cards and defeated monsters are kept here and can be spent at the entrance.')),
    ]),
    S('Markers on the entrance', 'Every player puts their investigator marker on the entrance sheet.', 'entrance', [
      OnP('entrance', 0.5, 0.62, discs('marker', 1, 0.13, '$', 'Investigator marker', 'Shows which adventure you are attempting, or that you are resting at the entrance.', { h: 0.1 }), [0.3, 0]),
    ]),
    S('Decks, tokens and dice', 'Shuffle the Common Item, Unique Item, Spell and Ally decks and the Mythos deck. Put the monster markers in a cup (the Mask monsters only if Nyarlathotep is the Ancient One) and the other tokens and the dice within reach.', 'r', [
      R(deck('idecks', 12, [f('#8a6a44', '◆'), f('#3d8b4a', '✦'), f('#7a4fa3', '✦'), f('#2e6fb7', '●')], 'Item decks', '4 small decks: Common Items, Unique Items, Spells and Allies. Rewards let you draw from them.', { n: 4, w: 0.65, d: 1 }),
        deck('mythos', 30, f('#2b2233', '☾'), 'Mythos deck', 'One card is drawn each time the clock strikes midnight. It has an immediate effect and a lingering one.'),
        zone('mdisc', 0.9, 1.26, 'Mythos', 'The current Mythos card sits here until the next midnight.')),
      R(dice('green', 6, '#3d8b4a', 'Green dice', '6 green dice rolled for every adventure. Their faces show investigation, lore, peril and terror symbols.', { size: 0.5, ink: '#ffffff' }),
        dice('yellow', 1, '#e0b12f', 'Yellow die', 'A better bonus die, added by certain items.', { size: 0.5 }),
        dice('red', 1, '#c0392b', 'Red die', 'The best bonus die, with a wild face, added by certain items.', { size: 0.5, ink: '#ffffff' })),
      R(zone('roll', 4.2, 1.4, 'Dice rolled', 'Roll your dice here. Dice you assign to a task move onto the adventure card.')),
      R(box('cup', 1, 0.8, 1, '#3a3a3a', 'Monster cup', 'Monster markers are drawn at random from here and add extra tasks to adventures.', { round: true }),
        pile('clues', '#4f9a5a', 'Clue tokens', 'Spend a clue to reroll dice during an adventure.', 'disc'),
        discs('signs', 1, 0.25, '#e9e4d8', 'Elder sign tokens', 'Collect enough of these as a team to seal away the Ancient One and win.', { label: '✦', h: 0.3 }),
        discs('doom', 1, 0.25, '#2b241c', 'Doom tokens', 'Placed on the Ancient One\'s doom track. When it is full the Ancient One awakens.', { label: '✗', ink: '#ffffff', h: 0.3 })),
    ]),
    S('Resolve one Mythos card', 'Choose a first player. Before the first turn they draw the top Mythos card and carry out its effects.', 'mythos', [
      on('mdisc', 0.5, 0.5, cards('myth0', 1, ft('#d9d2e6', 'MYTHOS', 'effect', '☾'), 'Mythos card', 'The top part happens at once. The bottom part lasts until the next Mythos card replaces it.')),
    ]),
    S('Ready to play', 'Play goes clockwise from the first player. On your turn you move, resolve where you are, then advance the clock 3 hours.', 'all', [], n === 1 ? 'Playing solo you may control one investigator or several.' : 'Everyone wins or loses together.'),
  ],
  turn: [
    T('Move to an adventure', 'You move your marker from the entrance onto the adventure you want to attempt.', 'adv', [mv('marker', at('adv.1', 0.5, 0.86))]),
    T('Roll the green dice', 'You roll all six green dice and look for the symbols one of the card\'s tasks asks for.', 'roll', [0, 1, 2, 3, 4, 5].flatMap((k) => [mv(`green.${k}`, at('roll', 0.1 + k * 0.16, 0.5), 0.2 + k * 0.1), roll(`green.${k}`, [3, 1, 5, 2, 6, 4][k])])),
    T('Complete a task', 'Two of your dice match a task, so you place them on it. Then you reroll the remaining dice to try for the next task. If a roll completes nothing, you must set one die aside before rolling again.', 'adv', [
      mv('green.0', at('adv.1', 0.3, 0.3)),
      mv('green.1', at('adv.1', 0.7, 0.3)),
      roll('green.2', 2), roll('green.3', 6),
    ]),
    T('Claim the reward', 'With every task filled you take the adventure card as a trophy and gain its reward, here an elder sign. A new adventure replaces it and your marker goes back to the entrance.', 'adv', [
      mv('green.0', at('roll', 0.1, 0.5), 0.2),
      mv('green.1', at('roll', 0.26, 0.5), 0.2),
      mv('marker', at('entrance', 0.5, 0.25), 0.3),
      mv('adv.1', at('trophy', 0.3, 0.5), 0.8),
      draw('advdeck', by('adv.0', 1.64, 0), ADV, undefined, 1.4),
      spawn(discs('won', 1, 0.25, '#e9e4d8', 'Elder sign token', 'An elder sign won as a reward. The team needs the number shown on the Ancient One.', { label: '✦', h: 0.08 }), at('trophy', 0.75, 0.5), 'signs', undefined, 1.6),
    ], 9),
    T('Advance the clock', 'Your turn ends by moving the clock forward 3 hours. When it reaches midnight again, a new Mythos card is drawn.', 'clock', [set('clock', { label: 'III' })]),
    T('How it ends', 'The investigators win as soon as they hold as many elder signs as the Ancient One requires. If its doom track fills first it awakens, and they must beat it in a final battle or lose.', 'all', [], 8),
  ],
}))
