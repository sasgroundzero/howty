/**
 * Runs after `vite build`. Writes dist/g/<id>/index.html for every built-in game (same app, but with that
 * game's own title, description and link-preview tags), plus sitemap.xml and robots.txt.
 * Set SITE_URL (e.g. https://howty.app) for absolute links; on Vercel the production domain is used automatically.
 */
import { build } from 'esbuild'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gameImage } from './og.mjs'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const site = (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')).replace(/\/$/, '')
const out = resolve(root, 'node_modules/.cache/prerender.mjs')
await build({ entryPoints: [resolve(root, 'src/data/games/index.ts')], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'warning' })
const { GAMES } = await import(pathToFileURL(out).href)
rmSync(out)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const players = ([a, b]) => (a === b ? `${a} player${a > 1 ? 's' : ''}` : `${a}–${b} players`)
/**
 * The guide as plain HTML inside #root, so search engines and slow connections get the steps before the
 * 3D app loads (React replaces it on start). Styled inline to match the site, with no extra requests.
 */
function guideHtml(g, setup) {
  const steps = setup.steps.slice(0, setup.setupCount)
  const turn = setup.steps.slice(setup.setupCount)
  const li = (s) => `<li style="margin:0 0 16px"><strong style="color:#1c1917">${esc(s.title)}.</strong> ${esc(s.instruction)}${s.detail ? ` <span style="color:#78716c">${esc(s.detail)}</span>` : ''}</li>`
  return `<main style="max-width:720px;margin:0 auto;padding:48px 16px;font:16px/1.6 'DM Sans',system-ui,sans-serif;color:#44403c;background:#fff">
<p style="margin:0 0 8px"><a href="/" style="color:#78716c">Howty</a></p>
<h1 style="font:700 40px/1.1 Fraunces,Georgia,serif;color:#1c1917;margin:0 0 12px">How to set up ${esc(g.meta.title)}</h1>
<p style="margin:0 0 8px">${esc(g.meta.blurb)}</p>
<p style="margin:0 0 32px;color:#78716c">${players(g.meta.players)} · ${esc(g.meta.playTime)} · ${g.meta.difficulty} · ${setup.setupCount} setup steps</p>
<h2 style="font:700 20px Fraunces,Georgia,serif;color:#1c1917">Setup, step by step</h2>
<ol style="padding-left:24px">${steps.map(li).join('')}</ol>
${turn.length ? `<h2 style="font:700 20px Fraunces,Georgia,serif;color:#1c1917">Your first turn</h2><ol style="padding-left:24px">${turn.map(li).join('')}</ol>` : ''}
<p style="color:#78716c;font-size:14px">Shown for ${g.meta.defaultPlayers} players. Unofficial fan-made guide; check your rulebook.</p>
</main>`
}
/** schema.org HowTo data for the setup steps. */
const howTo = (g, setup, url) =>
  JSON.stringify({
    '@context': 'https://schema.org', '@type': 'HowTo', name: `How to set up ${g.meta.title}`, description: g.meta.blurb, url,
    step: setup.steps.slice(0, setup.setupCount).map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: [s.instruction, s.detail].filter(Boolean).join(' ') })),
  }).replace(/</g, '\\u003c')
const shell = readFileSync(resolve(dist, 'index.html'), 'utf8').replace('content="/og.png"', `content="${site}/og.png"`)
writeFileSync(resolve(dist, 'index.html'), shell.replace('</head>', `    <link rel="canonical" href="${site}/" />\n  </head>`))
for (const g of GAMES) {
  const [a, b] = g.meta.players
  const setup = g.build(g.meta.defaultPlayers)
  const title = `How to set up ${g.meta.title} | Howty`
  const desc = `Step-by-step 3D setup guide for ${g.meta.title} (${a === b ? a : `${a}–${b}`} players, ${g.meta.playTime}): every piece placed on a 3D table, then a first-turn walkthrough. Free, unofficial.`
  const html = shell
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(`content="${site}/og.png"`, `content="${site}/og/${g.id}.png"`)
    .replace('</head>', `    <link rel="canonical" href="${site}/g/${g.id}" />\n    <meta property="og:url" content="${site}/g/${g.id}" />\n    <script type="application/ld+json">${howTo(g, setup, `${site}/g/${g.id}`)}</script>\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${guideHtml(g, setup)}</div>`)
  mkdirSync(resolve(dist, 'og'), { recursive: true })
  writeFileSync(resolve(dist, 'og', `${g.id}.png`), gameImage(g, setup))
  mkdirSync(resolve(dist, 'g', g.id), { recursive: true })
  writeFileSync(resolve(dist, 'g', g.id, 'index.html'), html)
}
const dailyTitle = 'Daily table: name the game from its setup | Howty'
const dailyDesc = 'A finished board-game setup with the name hidden. One guess, a new table every day, and a streak to keep.'
mkdirSync(resolve(dist, 'daily'), { recursive: true })
writeFileSync(
  resolve(dist, 'daily', 'index.html'),
  shell
    .replace(/<title>.*?<\/title>/, `<title>${dailyTitle}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${dailyDesc}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${dailyTitle}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${dailyDesc}`)
    .replace('</head>', `    <link rel="canonical" href="${site}/daily" />\n  </head>`),
)
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', 'daily', ...GAMES.map((g) => `g/${g.id}`)].map((p) => `  <url><loc>${site}/${p}</loc></url>`).join('\n')}\n</urlset>\n`)
writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n${site ? `Sitemap: ${site}/sitemap.xml\n` : ''}`)
console.log(`prerendered ${GAMES.length} game pages${site ? ` for ${site}` : ' (no SITE_URL set: links are relative)'}`)
