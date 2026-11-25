# LMP prototype — Restrained redesign handoff

Source of truth for the design: Claude Design canvas "LMP Home — Three Directions"
https://claude.ai/artifact/LC3bCzjP4jhqtS4JjYfNFp (boards 40, 41, 42). The board files are in `boards/`.

Live prototype: https://lmp-prototype.vercel.app (passcode `empire2027`), Vercel project `lmp-prototype`
(team coolerheads-projects).

## 0. Read first: the live site is ahead of the repo

The current production deploy (`dpl_Dc436qvZqqQCjqxsQioxqwnTQWee`) was NOT built from the repo. It was uploaded
directly: a prebuilt bundle plus find/replace patches applied at build time (`prior-live-patches/build.js`).
Before redesigning, port these already-approved tweaks into source:

- `edits.json` — 15 Live Scoring edits ("Focus" layout): one solid win bar (green you / red them), a single
  toggleable strip "Matchup feed | NFL scores", chiclets removed, team art shown once.
- `edits2.json` — 6 Home edits: Home matchup tab uses the same solid win bar.
- `extra.js` — Game Day view button and NFL scoreboard tiles link to `/gameday?game=KEY&view=featured`.
- Also live (verify against the live site; may also be patch-only): compact icon rail as default with a Classic/Compact toggle in the Demo
  panel, slim scoreboard with my team's game first, slim Fanball Pro bar.

Each edit is `{f: <page>, find, replace, all}`. After porting, connect the Vercel project to this GitHub repo
so pushes deploy to the same domain (keep the passcode gate).

## 1. Foundations

**Type:** Saira Condensed 800 for display (scores, names, headings), Saira 400–700 for body.

**Tokens**

| token | dark | light |
|---|---|---|
| bg | #0E1015 | #F3F4F6 |
| card | #161A21 | #FFFFFF (with shadow 0 1px 2px rgba(16,24,40,.05), 0 6px 16px -8px rgba(16,24,40,.12)) |
| card2 | #1D212A | #EEF0F3 |
| line | #262B36 | #E3E6EB |
| text | #EEF1F6 | #12151B |
| muted | #8B93A5 | #5C6370 |
| up (good) | #3DD68C | #13834A |
| down (bad) | #F06A6A | #C8312F |
| accent | #5B82FF | #2F5BFF |
| amber | #FFB870 | #A35A06 |

Light mode = white cards on #F3F4F6 (no gray-on-gray). Light is the intended default theme (dark opt-in); confirm with CP.

**Position colors — do not change** (ours originally): QB #FF7A93, RB #3EE0B4, WR #62B0FF, TE #FFAE5C,
K #E8D867, DST #A3ADC2. Position color appears ONLY on the slot tag. No colored side bars on cards.
Headshot tile backdrop = neutral (or NFL team color), never position color.

**Slot tag:** 30px tall, 16px label, tinted fill of the position color. Flex tags (FLEX = RB/WR/TE, SFLX =
QB/RB/WR/TE) default style "letters" (each letter in its position color). Neutral tag fill dk #2B313D / lt #D5DAE2.

**Player cards (Live Scoring, Set Lineup, Available Players):** fantasy points are the focal point
(46px Saira Condensed 800), player name 20px, +/- margin 14px green/red. Win/loss corner glow: radial gradient
from the inner top corner, green if winning the slot, red if losing, half strength while live. Hot (flame) and
cold (snowflake) icons stay. Field strip for players on the field: ball icon, RZ tag, red-zone tint.

**Alert chips:** small tinted chiclets by type: Lineup = amber, Trade = blue (accent), Commissioner = violet
(dk text #C3A6FF on rgba(176,132,255,.15); lt #6B3FC4 on #F1EAFF). Use the same mapping everywhere
(notifications, bell, My Franchise "Needs you").

**Waiver claim groups:** numbered accent circle (20px) + "GROUP 1" label above "If I win, drop …".

## 2. App shell (board 42, `Shell.dc.html`)

- **Ticker (48px):** one-line pills `SYN 139.6 – 93.5 HRT · Q4`. Leader in text color, trailer muted.
  My game first, accent outline + dot. No shields, no italic, no second line.
- **Rail (76px):** Leagues (opens a league-list flyout; nothing else expands the rail), Game Plan, The Wire,
  Chat, then the league section (league badge, Lineup w/ amber count, Scores w/ live dot, Standings, Add),
  More at bottom. Demo toggle **easyButtons**: "Rail league section" (default) / "Top tabs only".
- **League bar (64px):** league badge + name + dropdown, tabs Home · My Franchise · Scores · Standings ·
  Players · Trades · Clubhouse with status hints (My Franchise "2", Scores live dot, Standings "1st",
  Players "$247"). Search, bell (only place with a count), avatar. Demo toggle **leagueBar**:
  League color (default) / Brand ink (#151B34) / Follow theme / White.
- **League color:** tint derived from the league art. At upload, extract a palette (e.g. node-vibrant/sharp),
  pick the most saturated non-near-black/white swatch, clamp lightness per theme, store as `league.accent`,
  commissioner can override. Empire League → #ECB958 (badge fallback #B8892F).
  Light: `linear-gradient(90deg,#F6E7C8,#FBF4E6 45%,#FFF 80%)` + 2px accent bottom rule.
  Dark: accent mixed 30%→10%→0 into the bar color.
- Page title matches tab ("Scores"). Game Day view is an outline button.

## 3. Pages

**Home:** league hero (art strip ~4:1, `background-size:cover; background-position:center 32%`, 330px tall)
with a status row over the bottom band: Week chip, record/place, live line, and state-aware buttons:
pre-lock "Set lineup · N yet to lock", in-game "Live scoring", Tue–Wed "Week N recap". Primary button uses the
league accent. Then "Your matchup" card.

**Live Scoring (boards 40/41):** header height 140px. Demo toggle **header**: Standard / Premium / Mixed.
- Standard: neutral card, custom badge (color + 2–4 chars, free for every team) + 3px top edge in badge color.
- Premium: team art per half; LEFT half uses the team's logo-left art, RIGHT half uses logo-right art
  (`background-size:auto 100%`, anchored to the outer edge, bg #060606). Name text hidden (art carries it);
  record small at inner top; score 64px at inner edge, vertically centered.
- Mixed (one premium, one standard): standard side becomes a dark plate (#111317) with enlarged badge (72px) on
  the outer edge, a badge-color radial glow from that edge, name + record, same score size/alignment.
- Toggle **sides** swaps which team is left; art choice follows the side.
- Win bar stays green/red. LIVE pill lives in the eyebrow, never over scores. Footer row under each half for
  status text.
- Premium does NOT decorate player cards.

**My Franchise:** franchise band (Standard: badge + top edge; Premium: wide wordmark art), KPI row, "Team badge"
editor (text ≤4 chars A–Z0–9&, 12 swatches), "Needs you" list with alert chips, compact waivers with group
circles, Fanball Pro line.

**All other pages:** apply shell + tokens + type + slot tags + chips. Give Set Lineup and Players
(available players) the same player-row treatment as Live Scoring.

## 4. Assets (`assets/`)

| file | use |
|---|---|
| syn-left.webp / syn-right.webp | Gridiron Syndicate art, logo left / logo right |
| hrt-left.webp / hrt-right.webp | Hurts Locker art, logo left / logo right |
| syn-wide.webp | Syndicate wide wordmark (My Franchise band) |
| empire-hero.webp | Empire League hero |

Board files reference these as `/_blob/<id>`: 8e8513da…=syn-left, 1ded12be…=syn-right, a8697593…=hrt-left,
6d2de6a0…=hrt-right, 1dc28e7e…=syn-wide, d94e1fab…=empire-hero. Headshots 7195bcb1…=Hurts, fb2ca679…=Bijan,
4a22590f…=Taylor, c1f91fb4…=Lamb are already in the prototype as webps.

## 5. Board file format (for reading them)

`.dc.html`: markup inside `<x-dc>`, styles in `<helmet>`, `{{holes}}` filled from `renderVals()` in the
`text/x-dc` script, `<sc-if value>` / `<sc-for list as>` for conditionals/loops, Tweaks declared in `data-props`.
Treat them as precise visual specs (exact CSS), not as code to drop in.

## 6. Demo panel toggles to add

theme (light default), easyButtons, leagueBar, live-scoring header (Standard/Premium/Mixed), sides,
badge (Default/Custom), standard accent (Badge only / Badge + top edge), nav (Compact/Classic, existing).
