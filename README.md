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

Only the gold **PLAY** rectangle starts a run, along with Space or Arrow Up. A tap on the Wanted slab, the blunt, the best-score chip, or the night behind the plate stays on the menu.

In the air, the same press flaps. A held key does nothing extra.

After a crash the grove freezes, then the death card comes up:

- **HOME** (top-left ghost chip) returns to the menu and does not restart.
- **JOBS** and **SHOP** (top-right ghost chips) open those panels and do not start a run.
- **RESTART** is the gold button. A tap on the card away from those chips starts the next run.

**JOBS** and **SHOP** are equal ghost chips under **PLAY** on the home menu. They do not start a run.

- **M** mutes the beeps. The ghost speaker chip at the top-left of the home menu does too. There is no settings wall.
- **K** on the home menu toggles clean mode. `?clean=1` forces it on. `?clean=0` forces it off. A clean run shows a **CLEAN** chip in the air and spawns no pickups.
- **1–5** equip a skin you already own. **Q** / **[** and **E** / **]** / **C** cycle owned skins.
- **H** draws the hitbox.
- **Escape**, Space, or Arrow Up closes the shop or jobs panel.

## Local-only history

Best score, nugs, jobs, claimed rewards, mute, clean mode, and the equipped skin stay in this browser (`localStorage`). Nothing is uploaded. Clearing site data resets them. A new device starts at zero.

The public repo is [github.com/TosZK-Hub/flappy-blunt](https://github.com/TosZK-Hub/flappy-blunt). The same files are the GitHub Pages site.

## Monetize off

No in-app purchases, no ads, no analytics vendor. Nugs are a local cosmetic balance. Score banks 1:1 into nugs when you crash. The leaf counter sits top-right.

Jobs refresh every 24 hours on this device: clear 5 pipes (25), score 15 in one run (50), die 3 times (15), and a weekly best of 30 (150). Claim them on the gold button. Jobs never ask for a power-up.

The shop sells cosmetics only. Default is free. Gold Chain is 200, Neon Kush 350, Galaxy Roll 500, OG Heist 750. Owned skins show a green check. The equipped skin has a gold ring.

## Clean mode and pickups

Between the gates, one pickup can be live at a time. A new one replaces the old. The first appears after the third pipe, then every 4–6 pipes.

- **24K Nug** — the next pipe exit pays +2, once.
- **Purple Haze** — score ×2 for 6 seconds.
- **Dab Rocket** — scroll ×1.25 for 4 seconds.
- **Gummies** — gravity ×0.7 for 5 seconds.
- **Gold Chip** — one hit. The gold hex pops off, then 0.4s of i-frames.
- **Trail Can** — rainbow trail for 8 seconds. No gameplay change.

When a timer ends, gravity, flap, and scroll snap back in the same step. **CLEAN** spawns nothing.

## Feel lock

All of the tuned numbers live in `js/feel.js` as `CONFIG`. Physics and the death beat read that object. Do not copy them elsewhere, and do not retune them for launch.

A puff **sets** upward speed (`FLAP_IMPULSE` −440) and a held key does nothing. Gravity is 1450. The fall cap is 540. The hitbox is a 34×24 box, inset in the drawn blunt. Scroll starts at 165 px/s and reaches 245 by 20 puffs. Gate gaps start at 155 px, ease toward 135 by 25, and never go under 125. Pairs sit 220 px apart. The first gate can touch you 1.4 s after the run starts.

On a crash the grove freezes for 0.15 s, a death-juice flash lasts 0.08 s, the card waits 0.4 s, then one tap starts the next run. You score +1 when you cross a gate's center line. A flap tips the blunt up 12° and throws 3–5 sparks. Falling settles the tip to −8°, then the wrap goes ash. Flaps and scores do not shake the camera. On a crash the world settles at most 4 px for 120 ms, then holds still.

## Layout

- `index.html` — page shell, splash, manifest
- `manifest.webmanifest` — Add to Home Screen
- `sw.js` — shell cache
- `css/style.css` — full-window canvas, splash, Anton and Lilita One
- `js/feel.js` — `CONFIG`, palette, skins, pickup timings
- `js/physics.js` — simulation, reads `CONFIG`
- `js/meta.js` — nugs, 24h jobs, skin shop
- `js/render.js` — winged blunt, grinders, Wanted slab, Night Heist panels
- `js/audio.js` — synthesized puff / chime / thud
- `js/game.js` — home menu, play, game over
- `assets/` — fonts, splash, and app icons (180, 192, 512, 1024)
- `store/` — lead crops: home, mid-gap, shop, death (portrait `store-0N-*.png` and landscape `landscape-0N-*.png`)

## Font

[Anton](https://fonts.google.com/specimen/Anton) by Vernon Adams and [Lilita One](https://fonts.google.com/specimen/Lilita+One) by Juan Montoreano are included under the SIL Open Font License. See `assets/OFL-Anton.txt` and `assets/OFL-LilitaOne.txt`.

## Not this

This is an original game. It is not Flappy Bird, and it does not use that game's bird, pipes, or art. No store-submit automation ships with this repo.
