/** The Resistance: hidden spies try to sabotage three of five missions while everyone argues about who to trust. */
import { C, On, OnMe, P, type Place, R, S, T, at, cards, deck, discs, f, flip, ft, hide, mat, mv, spawn, tabletop, zone } from '../compose'

/** On() and OnMe() leave `spread` unset, which compose() reads for every 'on' placement; give it a zero spread. */
const on = (...a: Parameters<typeof On>): Place => ({ ...On(...a), spread: [0, 0] })
const onMe = (...a: Parameters<typeof OnMe>): Place => ({ ...OnMe(...a), spread: [0, 0] })
const TEAMS: Record<number, number[]> = { 5: [2, 3, 2, 3, 3], 6: [2, 3, 4, 3, 4], 7: [2, 3, 3, 4, 4], 8: [3, 4, 4, 5, 5] }
const SUCCESS = ft('#dbe8f5', 'SUCCESS', '', '✓')
const MBACK = f('#27323d', '?')
const VOTE = [ft('#f4f0e6', 'APPROVE', '', '✓'), ft('#3a3a3a', 'REJECT', '', '✗')]
/** Position of team token k inside its row of five, for sending it back. */
const teamU = (k: number) => (k * 0.74 + 0.3) / 3.56

export const resistance = tabletop('resistance', 'The Resistance', [5, 8], 6, '30 min', 'Easy', 'Find the spies before they sink three missions.', ['#27323d', '#2e6fb7', '#c0392b'], (n) => {
  const sizes = TEAMS[n]
  const spies = n < 7 ? 2 : 3
  const team = sizes[0]
  const seats = Array.from({ length: team }, (_, k) => k)
  return {
    setup: [
      S('Lay out the mission board', `Take the score tableau for ${n} players. It shows how many people go on each of the five missions: ${sizes.join(', ')}.`, 'c', [
        C(mat('tab', 6.6, 2.6, '#2f3d4a', 'Missions', 'Score tableau', 'Five mission spaces showing the team size for each, with the vote track underneath.')),
        ...sizes.map((s, k) => on('tab', 0.14 + k * 0.18, 0.4, discs(`m${k}`, 1, 0.45, '#cfd8dc', `Mission ${k + 1}`, `Mission ${k + 1} needs a team of ${s}.${k === 3 && n >= 7 ? ' With 7 or more players this mission only fails if at least two Fail cards are played.' : ''}`, { label: `${s}`, h: 0.03 }))),
        C(zone('msn', 3.6, 1.5, 'Mission cards played', 'Team members play one mission card each here, face down.')),
      ], 'The real game plays up to 10. This version stops at 8.'),
      S('Round and vote markers', 'Put the round marker on the first mission. If your tableau has a vote track, put a marker on its first space to count rejected teams.', 'tab', [
        on('m0', 0.5, 0.5, discs('round', 1, 0.2, '#e0b12f', 'Round marker', 'Shows which mission is being attempted.', { h: 0.08 })),
        on('tab', 0.14, 0.86, discs('votemk', 1, 0.14, '#e9e4d8', 'Vote track marker', 'Counts rejected teams in a row. If five teams in a row are voted down, the spies win.', { h: 0.08 })),
      ]),
      S('Tokens and mission cards', 'Put the team tokens, the score markers and the Success and Fail mission cards beside the tableau.', 'r', [
        R(discs('team', 5, 0.3, '#6b7a8a', 'Team tokens', '5 tokens. The leader hands them to the players proposed for the mission.', { label: '⚑', ink: '#ffffff' })),
        R(deck('mcards', 10, MBACK, 'Mission cards', 'Success and Fail cards. Every team member is handed one of each and secretly plays one. Only a spy may play Fail: Resistance members must always play Success.'),
          discs('blue', 1, 0.3, '#2e6fb7', 'Resistance score markers', 'Placed on a mission the team completed.', { h: 0.2 }),
          discs('red', 1, 0.3, '#c0392b', 'Spy score markers', 'Placed on a mission that was sabotaged.', { h: 0.2 })),
      ]),
      S('Deal secret roles', `Take ${n - spies} Resistance and ${spies} Spy character cards, shuffle them and deal one face down to each player. Look at your own card in secret.`, 'you', [
        P(cards('char', 1, f('#2e6fb7', '✦'), 'Character card', 'Says whether you are loyal Resistance or a Spy. Never show it to anyone.', { down: true, back: f('#27323d', '?') }),
          cards('vote', 2, VOTE, 'Vote tokens', 'One Approve and one Reject. Everyone votes on each proposed team at the same time.', { w: 0.6, d: 0.84 }),
          zone('spot', 2.6, 1.3, 'In front of you', 'The leader token, a team token and your revealed vote sit here.')),
      ], `With ${n} players there are ${spies} spies. Five or six players have 2 spies and seven or eight have 3.`),
      S('The spies find each other', 'Everyone closes their eyes. The spies alone open theirs, look round to see who their partners are, then close them again. Then everyone opens their eyes.', 'all'),
      S('Ready to play', 'Pick a leader at random and give them the leader token. Here it is you.', 'you', [
        onMe('spot', 0.14, 0.5, discs('leader', 1, 0.28, '#e0b12f', 'Leader token', 'The leader proposes the mission team. The token passes to the left after every vote.', { label: '★', h: 0.08 })),
      ], 'Each round the leader proposes a team, everyone votes on it, and an approved team then carries out the mission.'),
    ],
    turn: [
      T('Propose a team', `After some discussion you hand out ${team} team tokens: one to yourself and ${team === 2 ? 'one to the player on your left' : 'one to each of the next two players'}.`, 'all', seats.map((k) => mv(`team.${k}`, at(`spot@${k}`, 0.45, 0.5)))),
      T('Everyone votes', 'All players choose Approve or Reject in secret and reveal together. More Approve than Reject and the team goes. Otherwise the leader token passes on and the vote track advances.', 'all', [0, 1, 2].map((k) => mv(`vote.0@${k}`, at(`spot@${k}`, 0.8, 0.5)))),
      T('Go on the mission', 'The team is approved. Each member takes a Success and a Fail card and plays one of them face down.', 'msn', seats.map((k) => spawn(cards(`play${k}`, 1, SUCCESS, 'Mission card', 'A mission card played face down by a team member.', { down: true, back: MBACK }), at('msn', 0.25 + k * 0.25, 0.5), 'mcards'))),
      T('Reveal the result', 'The leader shuffles the played cards and turns them over. All are Success, so the Resistance scores this mission. A single Fail would have handed it to the spies.', 'c', [
        ...seats.map((k) => flip(`play${k}`)),
        mv('round', at('m1', 0.5, 0.5)),
        spawn(discs('won0', 1, 0.3, '#2e6fb7', 'Resistance score marker', 'Marks a mission the Resistance completed.', { h: 0.08 }), at('m0', 0.5, 0.5), 'blue', undefined, 1.4),
      ], 8),
      T('Pass the leader token', 'The team tokens come back and the leader token moves one seat to the left for the next mission.', 'all', [
        ...seats.map((k) => mv(`team.${k}`, at('team', teamU(k), 0.5, -0.12))),
        ...seats.map((k) => hide(`play${k}`)),
        mv('leader', at('spot@1', 0.14, 0.5)),
      ]),
      T('How it ends', 'The Resistance wins as soon as three missions succeed. The spies win as soon as three missions fail, or if five proposed teams in a row are rejected.', 'all'),
    ],
  }
})
