/**
 * Builds games at every player count and reports build errors and overlapping pieces.
 *   node scripts/check.mjs                       every game in the library
 *   node scripts/check.mjs src/data/games/more/azul.ts ...   just these files
 */
import { build } from 'esbuild'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
const files = process.argv.slice(2).map((f) => resolve(f))
const dir = resolve(root, 'node_modules/.cache/check')
mkdirSync(dir, { recursive: true })
const entry = resolve(dir, `entry-${process.pid}.ts`)
const out = resolve(dir, `out-${process.pid}.mjs`)
const q = (p) => JSON.stringify(p)
writeFileSync(
  entry,
  (files.length
    ? files.map((f, i) => `import * as m${i} from ${q(f)}`).join('\n') + `\nexport const GAMES = [${files.map((_, i) => `...Object.values(m${i})`).join(', ')}].filter((g: any) => g && g.build)`
    : `export { GAMES } from ${q(resolve(root, 'src/data/games/index.ts'))}`) + `\nexport { AUDIT } from ${q(resolve(root, 'src/data/games/compose.ts'))}\n`,
)
await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'warning' })
const { GAMES, AUDIT } = await import(pathToFileURL(out).href)
rmSync(entry)
rmSync(out)

let bad = 0
const ids = new Set()
for (const g of GAMES) {
  if (ids.has(g.id)) (bad++, console.log(`ERROR duplicate game id ${g.id}`))
  ids.add(g.id)
  for (let n = g.meta.players[0]; n <= g.meta.players[1]; n++) {
    try {
      const s = g.build(n)
      if (s.steps.length - s.setupCount < 1) throw new Error(`[${g.id}] no first-turn steps`)
    } catch (e) {
      bad++
      console.log(`ERROR ${g.id} n=${n}: ${e.message}`)
      break
    }
    const w = AUDIT[`${g.id}/${n}`] ?? []
    bad += w.length
    w.slice(0, 6).forEach((m) => console.log(`OVERLAP ${g.id} ${m}`))
    if (w.length > 6) console.log(`  ...and ${w.length - 6} more in ${g.id} n=${n}`)
  }
}
console.log(bad ? `${bad} problem(s)` : `OK: ${GAMES.length} game(s) clean at every player count`)
process.exit(bad ? 1 : 0)
