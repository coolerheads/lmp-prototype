# Fanball LMP prototype

Live: https://lmp-prototype.vercel.app (passcode gate). Vercel deploys every push to `main`.

**This repo is the source of truth.** Until Nov 2026 the live site was uploaded straight to Vercel from
Claude Design, so GitHub fell behind. This branch restores the exact live site (22 pages) as readable source.
Any change, from Claude Code or Claude Design, should land here as a commit, never as a direct Vercel upload.

## Layout

- `boards/<Page>.dc.html` - one file per page, in Claude Design's board format. Edit these.
- `boards/order.json` - page list; add new pages here.
- `site/` - runtime (`rt.js`), nav, styles, images, passcode page (`index.html`), app shell (`app.html`).
- `site/extra.js` - Game Day links from Live Scoring, appended to `rt.js` at build time.
- `vercel.json` - routes (`/home`, `/live`, `/commish`, ...) all serve `app.html`.

## Build

```bash
node build.js
```

Writes `out/`. No `npm install` needed.

## History

- `main` before this: the April 2026 Vite/React version (still in git history).
- `fanball` branch: the in-progress "Restrained" redesign of Home, Live Scoring and My Franchise.
