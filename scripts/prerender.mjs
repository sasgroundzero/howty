/**
 * Runs after `vite build`. Writes dist/g/<id>/index.html for every built-in game (same app, but with that
 * game's own title, description and link-preview tags), plus sitemap.xml and robots.txt.
 * Set SITE_URL (e.g. https://howty.app) for absolute links; on Vercel the production domain is used automatically.
 */
import { build } from 'esbuild'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const site = (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')).replace(/\/$/, '')
const out = resolve(root, 'node_modules/.cache/prerender.mjs')
await build({ entryPoints: [resolve(root, 'src/data/games/index.ts')], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'warning' })
const { GAMES } = await import(pathToFileURL(out).href)
rmSync(out)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const shell = readFileSync(resolve(dist, 'index.html'), 'utf8').replace('content="/og.png"', `content="${site}/og.png"`)
writeFileSync(resolve(dist, 'index.html'), shell.replace('</head>', `    <link rel="canonical" href="${site}/" />\n  </head>`))
for (const g of GAMES) {
  const [a, b] = g.meta.players
  const title = `How to set up ${g.meta.title} | Howty`
  const desc = `Step-by-step 3D setup guide for ${g.meta.title} (${a === b ? a : `${a}–${b}`} players, ${g.meta.playTime}): every piece placed on a 3D table, then a first-turn walkthrough. Free, unofficial.`
  const html = shell
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace('</head>', `    <link rel="canonical" href="${site}/g/${g.id}" />\n    <meta property="og:url" content="${site}/g/${g.id}" />\n  </head>`)
  mkdirSync(resolve(dist, 'g', g.id), { recursive: true })
  writeFileSync(resolve(dist, 'g', g.id, 'index.html'), html)
}
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...GAMES.map((g) => `g/${g.id}`)].map((p) => `  <url><loc>${site}/${p}</loc></url>`).join('\n')}\n</urlset>\n`)
writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n${site ? `Sitemap: ${site}/sitemap.xml\n` : ''}`)
console.log(`prerendered ${GAMES.length} game pages${site ? ` for ${site}` : ' (no SITE_URL set: links are relative)'}`)
