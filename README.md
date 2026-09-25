# Flappy Blunt

A one-button township flyer. The pilot is a plump cartoon mascot, tip to the right. The gates are braai drums, minibus slices, pylon discs, and protea columns. One flap. Lekker energy.

Canvas volumetric cartoon. No WebGL. Night Heist stays parked.

## Play

[https://toszk-hub.github.io/flappy-blunt/](https://toszk-hub.github.io/flappy-blunt/)

GitHub Pages publishes `main` from the repository root. This branch is the SA cartoon upgrade.

```bash
git clone https://github.com/TosZK-Hub/flappy-blunt.git
cd flappy-blunt
npx serve
```

Open the URL `npx serve` prints. Serve the folder that contains `index.html`.

## Controls

**PLAY** is the gold button. Only that rectangle starts a run, along with Space or Arrow Up. The hero, the collection strip, and the sky do not.

In the air, the same press flaps. A held key does nothing extra.

After a crash:

- **HOME** returns to the menu and does not restart.
- **CHALLENGES** and **CHESTS** open those panels and do not start a run.
- **RESTART** is the only gold button. A tap away from it does not start the next run.

- **M** mutes the beeps. The speaker chip does too.
- **1–9** equip a costume you already own. **Q** / **[** and **E** / **]** / **C** cycle owned costumes.
- **H** draws the 34×24 hitbox.
- **Escape**, Space, or Arrow Up closes chests, collection, or challenges.

## Coins and chests

Coins are the only soft currency. They stay in this browser. An old nug balance migrates to coins once, one for one.

A run banks **+1 coin per stack cleared**, plus a near-miss skim of **+1** when the hitbox edge passes within 6px of a lip, capped at **+5** per run. The first run of a calendar day adds **+10** coins. The streak count caps at **7** and resets after a missed day.

| Chest | Cost | Pull |
|-------|------|------|
| Street | 100 | Common 70% · Rare 24% · Epic 5.5% · Legendary 0.5% |
| Township | 300 | Common 40% · Rare 40% · Epic 17% · Legendary 3% |
| Bok | 750 | Common 15% · Rare 40% · Epic 35% · Legendary 10% |

Costumes come from chests. Township Tee (`starter_tee`) is free. A duplicate refunds **40%** of that chest. After 10 Street opens with no Rare or better, the next Street pull is at least Rare. After 5 Township or Bok opens with no Epic or better, the next pull is at least Epic. Owning all 12 costumes grants **+150** coins once.

There is no skin shop, no IAP, no ads, and no mid-run pay power-up.

## Feel lock

Numbers live in `js/feel.js`. A flap **sets** upward speed to **−440**. Gravity is **1450**. Fall caps at **540**. The hitbox is **34×24** and does not change with costume or squash.

Scroll, gap, and spacing follow the score bands in `art/sa-cartoon/TOTAL_UPGRADE_MECHANICS.md`: Teach, Warm, Rise, Heat, Legend. Gap never goes under **128**. Scroll caps at **250**. The first gate can touch you **1.4s** after the run starts.

From score **16**, pairs cycle Straight, Rise, Fall, and Breath. From score **31**, one pack in four bobs **±8px** at **0.55 Hz**, with an amber lip mark before it enters. Flap squash is draw-only: **sx 0.88 / sy 1.12** for **70–90ms**.

Best score titles: **Rookie** at 10, **Squad** at 25, **Legend** at 50.

## Layout

- `index.html` — page shell
- `js/feel.js` — palette, costumes, bands, flap squash
- `js/physics.js` — simulation
- `js/meta.js` — coins, chests, challenges
- `js/render.js` — canvas hero, obstacles, UI
- `js/game.js` — home, flight, results
- `art/sa-cartoon/` — art lock sheets and the SA briefs
