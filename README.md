# Flappy Blunt

A one-button dusk flyer. The pilot is a winged blunt. The gates are grinder towers. One flap. Chill heist energy.

This is the Feel-CLEAR web playable: Visual System V2, Wanted-slab home, nugs / jobs / cosmetics shop, PLAY-rect-only start, and the death-card hierarchy. It is launch-ready as a static site. It is not an App Store or Google Play submission.

## Play

[https://toszk-hub.github.io/flappy-blunt/](https://toszk-hub.github.io/flappy-blunt/)

GitHub Pages publishes the default branch `main` from the repository root (`/`). `index.html` is already there, with `.nojekyll` so the canvas game is served as static files.

To play on your machine:

```bash
git clone https://github.com/TosZK-Hub/flappy-blunt.git
cd flappy-blunt
npx serve
```

Open the URL `npx serve` prints. The default is `http://localhost:3000`. A short Night Heist splash clears into the home menu.

Serve the folder that contains `index.html`. Do not serve a parent folder or a subdirectory. GitHub Pages serves that same root at the live URL above.

Add to Home Screen uses `manifest.webmanifest`, `sw.js`, and the icons in `assets/`. After one online visit, the shell can open from that icon without a fresh download.

## Controls

**PLAY** is the gold button. Under it, cream type says “Tap / Space to flap.” The first cold open also whispers “Clear the grinders.” That line leaves after the first **PLAY** and does not come back.

Only the gold **PLAY** rectangle starts a run, along with Space or Arrow Up. A tap on the Wanted slab, the blunt, the best-score line, the heist rank, the collection strip, or the night behind the plate stays on the menu. The collection strip opens the shop.

In the air, the same press flaps. A held key does nothing extra.

After a crash the grove freezes, then the death card comes up:

- **HOME** (top-left ghost chip) returns to the menu and does not restart.
- **JOBS** and **SHOP** (top-right ghost chips) open those panels and do not start a run.
- **RESTART** is the only gold control. A tap elsewhere on the card does not start the next run. Space or Arrow Up still does.

**JOBS** and **SHOP** are equal ghost chips under **PLAY** on the home menu. They do not start a run.

- **M** mutes the beeps. The ghost speaker chip at the top-left of the home menu does too. There is no settings wall.
- **K** on the home menu toggles clean mode. `?clean=1` forces it on. `?clean=0` forces it off. A clean run shows a **CLEAN** chip in the air and spawns no pickups.
- **1–5** equip a skin you already own. **Q** / **[** and **E** / **]** / **C** cycle owned skins.
- **H** draws the hitbox.
- **Escape**, Space, or Arrow Up closes the shop or jobs panel.

## Local-only history

Best score, nugs, the daily streak, jobs, claimed rewards, mute, clean mode, and the equipped skin stay in this browser (`localStorage`). Nothing is uploaded. Clearing site data resets them. A new device starts at zero.

The public repo is [github.com/TosZK-Hub/flappy-blunt](https://github.com/TosZK-Hub/flappy-blunt). The same files are the GitHub Pages site.

## Monetize off

No in-app purchases, no ads, no analytics vendor. Nugs are a local cosmetic balance. Score banks 1:1 into nugs when you crash. The leaf counter sits top-right.

Jobs refresh every 24 hours on this device: clear 5 pipes (25), score 15 in one run (50), die 3 times (15), and a weekly best of 30 (150). Each row shows the goal, progress as X/Y, the payout, and **CLAIM**. **CLAIM** is gold only when the job is ready. Claiming banks nugs and pops the leaf on the counter. Jobs never ask for a power-up.

On a crash, if any job moved forward, one cream toast says “Job +1” for under 1.5 seconds. It does not cover **RESTART**.

The shop sells cosmetics only. Default is free. Gold Chain is 200, Neon Kush 350, Galaxy Roll 500, OG Heist 750. Cards read **OWNED**, **EQUIPPED**, or **LOCKED**. Owned skins show a green check. The equipped skin has a gold ring. Hover or focus a card and that blunt bobs in place — a look, not a trial run. Tap an owned card to equip it immediately. Close the shop and the home hero wears it. A locked skin you cannot afford whispers “Earn nugs on runs”. The shop never says “Buy now”.

## Progression

Three free beats, once each, on this device. No XP bar, no battle pass, no ad gate.

- The first time you clear 5 pipes, a cream whisper lands with 25 nugs.
- When your best reaches 15, a toast says “Heist warming up”.
- Own two or more skins and the home blunt wears a gold ring. It marks the equipped skin. It is not a paywall.
- The first run on a new calendar day banks +10 nugs. Consecutive days raise a streak that caps at 7 and resets if a day is missed. One toast on the home menu says so.
- Best score wears a cosmetic title under the best line: 10 Runner, 25 Crew, 50 Legend. No paywall.
- A near-miss (the 34×24 box clears a lip by 6px or less) sparks +1 nug, up to 5 a run. It does not change the score or the flap.

## Clean mode and pickups

Between the gates, one pickup can be live at a time. A new one replaces the old. The first appears after the third pipe, then every 4–6 pipes.

- **24K Nug** — the next pipe exit pays +2, once.
- **Purple Haze** — score ×2 for 6 seconds.
- **Gold Chip** — one hit. The gold hex pops off, then 0.4s of i-frames.
- **Trail Can** — rainbow trail for 8 seconds. No gameplay change.

There is no Dab Rocket, no Magic Gummies, no revive, and no gravity change mid-run. When a timer ends, flap and scroll snap back in the same step. **CLEAN** spawns nothing.

## Feel lock

All of the tuned numbers live in `js/feel.js` as `CONFIG`. Physics and the death beat read that object. Do not copy them elsewhere, and do not retune them for launch.

A puff **sets** upward speed (`FLAP_IMPULSE` −440) and a held key does nothing. Gravity is 1450. The fall cap is 540. The hitbox is a 34×24 box, inset in the drawn blunt. Do not retune those three physics numbers without a Feel note.

Scroll and gaps follow score bands. Teach (0–5) holds 165 px/s, a 155 px gap, and 220 px spacing. Warm eases toward 195 / 148 by score 15. Heist eases toward 225 / 140 and 210 px spacing by 30. Heat eases toward 245 / 135 and 205 px by 50. Legend (51+) is 250 px/s, a 128 px gap floor, and 200 px spacing. Scroll never exceeds 250. The gap never goes under 128, and a pair does not shrink after it spawns. The first gate can touch you 1.4 s after the run starts.

From score 16, pairs cycle in packs of four: straight, rise (+14 px), fall (−14 px), breath (one gap +12 px tall, then the band gap again). From score 31, one pack in four bobs ±8 px at 0.55 Hz, both lips together, with an amber lip pulse for 0.3 s before that pair enters. Scores 15, 30, and 50 flash “Heat up” for 0.4 s.

On a crash the grove freezes for 0.15 s, a white flash lasts at most 0.08 s, the card waits 0.4 s, then the gold **RESTART** button starts the next run. You score +1 when you cross a gate's center line. A flap squashes the draw to 0.88× / 1.12y for the 70–90 ms window, then settles by 200 ms. That scale does not move the hitbox. The tip goes up 12° and throws 3–5 sparks. Falling settles the tip to −8°, then the wrap goes ash. Flaps and scores do not shake the camera. On a crash the world settles at most 4 px for 120 ms, then holds still. Trail puffs stay at or under 35% opacity.

## Layout

- `index.html` — page shell, splash, manifest
- `manifest.webmanifest` — Add to Home Screen
- `sw.js` — shell cache
- `css/style.css` — full-window canvas, splash, Anton and Lilita One
- `js/feel.js` — `CONFIG`, palette, skins, pickup timings
- `js/physics.js` — simulation, reads `CONFIG`
- `js/meta.js` — nugs, 24h jobs, skin shop
- `js/render.js` — volumetric winged blunt, grinders, Wanted slab, Night Heist panels
- `art/total-upgrade/` — 3D-feel turnaround, flap sheet, and in-scene scale ref (canvas, no WebGL)
- `js/audio.js` — synthesized puff / chime / thud
- `js/game.js` — home menu, play, game over
- `assets/` — fonts, splash, and app icons (180, 192, 512, 1024)
- `store/` — lead crops: home, mid-gap, shop, death (portrait `store-0N-*.png` and landscape `landscape-0N-*.png`)

## Font

[Anton](https://fonts.google.com/specimen/Anton) by Vernon Adams and [Lilita One](https://fonts.google.com/specimen/Lilita+One) by Juan Montoreano are included under the SIL Open Font License. See `assets/OFL-Anton.txt` and `assets/OFL-LilitaOne.txt`.

## Not this

This is an original game. It is not Flappy Bird, and it does not use that game's bird, pipes, or art. No store-submit automation ships with this repo.
