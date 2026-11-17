/**
 * Guides a person has checked step by step against a printed rulebook, by game id.
 * Add an entry only from a closed "Verify" issue on GitHub; the guide's page then says so.
 */
export interface Check {
  /** GitHub name of the person who checked it, or '' if they asked not to be named */
  by: string
  /** the rulebook edition or printing they checked against */
  edition: string
  /** YYYY-MM-DD */
  date: string
}
export const VERIFIED: Record<string, Check> = {}
