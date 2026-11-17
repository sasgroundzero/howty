# Deploy to Vercel

1. **Push the project to GitHub.** `node_modules` and `dist` stay out of the repo (see `.gitignore`).
2. **Import it in Vercel.** At vercel.com choose *Add New → Project* and pick the repository.
   Vercel detects Vite: build command `npm run build`, output directory `dist`. No environment
   variables are required.
3. **Click Deploy.**

Prefer the command line? Run `npx vercel`, accept the defaults, then `npx vercel --prod`.

## What the build produces

`npm run build` writes a normal multi-file static site into `dist/`: the app, plus
`dist/g/<game>/index.html` for each built-in game (the same app with that game's own title,
description and link-preview tags), `sitemap.xml` and `robots.txt`.

- `vercel.json` sends any other `/g/...` address (a shared custom game, say) to the app.
- Link previews and the sitemap need the site's full address. On Vercel the production domain is
  picked up automatically; elsewhere, or for a custom domain, set `SITE_URL`:

      SITE_URL=https://howty.example npm run build

- Any static host works (Netlify, Cloudflare Pages, GitHub Pages) as long as unknown `/g/...`
  paths fall back to `/index.html`. The site must be served from the domain root.
- It can no longer be opened straight from disk; use `npm run preview` to try a build locally.
