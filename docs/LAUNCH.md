# Launch drafts

Drafts for announcing Howty. Nothing here has been posted. Read each community's rules first: most
dislike self-promotion from new accounts, so post from an account that already takes part, answer every
comment, and space the posts out over a week or two rather than all on one day.

Before posting, check:

- [x] Works in iPhone Safari (checked in the iOS simulator: home, a game page, setup steps, Share with
      QR and the iOS share sheet, the daily table). Still worth one pass on a real phone, for touch feel
      and scanning the QR with a second phone
- [x] 174 of the 176 guides checked step by step against the publishers' published rules (or pagat.com
      for traditional card games) and marked on their pages (2026-11-18)
- [x] Vercel Web Analytics is recording page views
- [ ] Optional: a short custom domain (steps below)

## Show HN (news.ycombinator.com)

Best on a weekday morning, US Eastern time. The title has to be plain; the comment does the explaining.

**Title:** Show HN: Howty – 3D step-by-step setup guides for 176 board and card games

**First comment:**

> I kept losing the first 20 minutes of game night to the setup page of the rulebook, so I built Howty.
> Pick a game and every piece lands on a 3D table one step at a time, then it plays a short first turn.
> There's a hands-free mode that reads each step aloud, and a QR code so the whole table can follow on
> their phones.
>
> It's a static site: React, React Three Fiber and Tailwind, no backend, no account, no cookies. Each game
> is about 50 lines of data written against a small "table composer" that lays out zones, sizes the table
> and aims the camera, and a checker builds every game at every player count and fails on overlapping
> pieces. Every board and card is drawn in code; there are no image or model files. Pages are
> prerendered with the steps as plain text, and preview images are drawn from each game's layout at
> build time. It works offline after one visit.
>
> 174 of the 176 guides have been checked step by step against the published rules, and each page names
> the edition it was checked against. If you spot a mistake, every page has a one-tap "report a rules
> error" link.
>
> How it was built and checked, including where AI helped: https://github.com/sasgroundzero/howty/blob/main/docs/BUILDING.md
>
> Code (MIT): https://github.com/sasgroundzero/howty

## r/boardgames

Check the subreddit's self-promotion rules first; some weeks it only allows this in a weekly thread.

**Title:** I made a free site that shows board game setup step by step on a 3D table (176 games, no account)

**Body:**

> Setup is the part of game night nobody enjoys explaining, so I made Howty: pick the game, and each
> setup step plays out on a 3D table, then it walks through a first turn. There's a hands-free mode that
> reads the steps aloud, a QR code so everyone can follow on their own phone, a printable checklist, and
> it works offline.
>
> It's free and open source, with no ads and no account. There's also a daily puzzle where you guess the
> game from a finished setup.
>
> These are unofficial, fan-made guides and I'm sure some have mistakes. Every page has a link to report
> one, and if you have the box I'd love help checking the guides you know well. Which games should I
> add next?
>
> https://howty.vercel.app

## BoardGameGeek (General Gaming forum)

> **Free 3D setup walkthroughs for 176 games, looking for help checking them**
>
> I've built Howty, an open-source site that places each setup step on a 3D table and then plays a short
> first turn. It covers 113 board games and 63 traditional card games. The guides were written from
> public rules references, and 174 of the 176 have since been checked against the published rules; each
> page is marked with the edition it was checked against. If your copy differs, each page has a link to
> report it, which is where I'd value this community's help. https://howty.vercel.app
>
> Writing a review or a session report? Share, then Copy embed code puts the interactive guide right in
> your post.

## Short post (X, Bluesky, Threads)

> Spent 20 minutes reading the Catan setup page again? I made Howty: pick a game and every piece lands on
> a 3D table step by step, then it plays your first turn. 176 games, free, works offline, open source.
> howty.vercel.app

Attach `docs/demo.gif`, or a screen recording from a phone.

## Is it working? The numbers to watch

Vercel, then the project, then Analytics. Besides the real pages, the Pages list has made-up paths that
count what people did (once per guide per visit, anonymously):

| Path | Means |
| --- | --- |
| `/did/setup-done/<game>` | someone followed a setup to its last step |
| `/did/turn-done/<game>` | and watched the first turn to the end |
| `/did/share-opened`, `/did/link-shared`, `/did/link-copied` | opened Share, then sent or copied the link |
| `/did/video-made`, `/did/video-shared` | recorded a video, then shared or downloaded it |
| `/did/embed-copied` | copied the embed code |
| `/embed/<game>` | a guide viewed inside someone else's site |

**The one number:** finished setups per week (`/did/setup-done`). It shows the product doing its job.
**The growth number:** shares per finished setup (`link-shared` + `video-shared` divided by
`setup-done`). If it stays above about 1 in 10, each launch post keeps paying off after the spike.
Filter the Pages view to `/did/` to see these alone; the total page-view figure includes them, so use the
Visitors figure for audience size.

## Custom domain

Nothing in the app names the address, so a domain is a settings change, not a code change.

1. Buy the domain from any registrar (short options worth checking: howty.app, howty.games, gethowty.com).
2. In Vercel: Project, then Settings, then Domains, then Add, and enter the domain. Vercel shows the DNS
   records to add at the registrar. Make it the production domain.
3. Redeploy once. The build reads Vercel's production domain, so page links, `og:image` preview images and
   the canonical tags switch to the new domain by themselves. Setting `SITE_URL` is only needed when
   building somewhere other than Vercel.
4. In the Domains list, set howty.vercel.app to redirect (308) to the new domain, so old links keep working.
5. Replace howty.vercel.app in README.md and in the drafts above.
