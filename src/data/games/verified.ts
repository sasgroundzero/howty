/**
 * Guides checked step by step against the publisher's rules, by game id; the guide's page then says so.
 * Add an entry after checking every step against a rulebook, or from a closed "Verify" issue on GitHub.
 */
export interface Check {
  /** GitHub name of the person who checked it, or '' if they asked not to be named */
  by: string
  /** the rulebook edition or printing they checked against */
  edition: string
  /** YYYY-MM-DD */
  date: string
}
export const VERIFIED: Record<string, Check> = {
  catan: { by: '', edition: 'Catan 5th edition base game', date: '2026-11-17' },
  'ticket-to-ride': { by: '', edition: 'Ticket to Ride, Days of Wonder base game', date: '2026-11-17' },
  wingspan: { by: '', edition: 'Wingspan base game, Stonemaier', date: '2026-11-17' },
  azul: { by: '', edition: 'Azul, Plan B Games', date: '2026-11-17' },
  pandemic: { by: '', edition: 'Pandemic 2013 edition, Z-Man', date: '2026-11-17' },
}
