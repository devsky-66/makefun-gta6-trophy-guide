# GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/devsky-66/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/devsky-66/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)


[![make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Checklist** of all 55 trophies with their official name, description and grade, plus a guide in my own words for each one.
- **Progress saved in the browser** (localStorage) — tick trophies off as you earn them; export progress to a `.json` file and import it back.
- **Filters** by kind (story, missable, collectibles, activities, online, platinum) and by grade, plus text search.
- **Spoiler protection** — hides the names and descriptions of story trophies you have not earned yet.
- **Platinum roadmap** in six stages, built from the official trophy descriptions, in the order to earn them.
- **Missable flags** — every trophy the official descriptions mark as missable is flagged (see the honesty note below).
- **Cited sources** — every guide names its source beside it.

## How to run it

No build step, no dependencies, no network needed. Serve the `app/` folder with any static server and open it:

```sh
cd app
python3 -m http.server 8000
# open http://localhost:8000
```

Or open `app/index.html` directly in a browser (the trophy list loads from `app/data/trophies.json`, so a local server is the reliable route).

## Honesty note

GTA 6 released **2026-11-19** — the day this guide was written. Nothing here has been verified in-game yet. Every guide is my own reading of the official trophy description, and where a step or location is not confirmed, the guide says so plainly ("not yet verified in-game") instead of inventing one. Specific places and steps always cite their source; nothing is copied from other guide sites.

Sources: the official trophy list via [Exophase](https://www.exophase.com/game/grand-theft-auto-vi/trophies/) and the [PSNProfiles trophy list](https://psnprofiles.com/trophies/grand-theft-auto-vi).

## Missable trophies

From the official descriptions, only one trophy is plausibly missable: **Actions Speak Louder** — a story choice ("Choices made (for better or worse)"). Keep a save before major story decisions. No other trophy is confirmed missable from the official descriptions; this will be updated once the game is verified in play.

## Files

- `app/index.html` — the page
- `app/app.js` — checklist, filters, spoiler mode, roadmap, export/import
- `app/style.css` — the look (own design, system fonts only)
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, kind, missable flag, roadmap stage, guide and sources
- `main.ts` — hand-in program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json` (Node 22+, standard library only)
- `screenshots/` — real renders of the running app

## License

MIT. Unofficial fan guide — not affiliated with Rockstar Games or PlayStation. Trophy names and descriptions are PlayStation's official list; the guides are original writing. No Rockstar logo or official artwork is used.
