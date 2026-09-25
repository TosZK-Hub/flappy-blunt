# Total Upgrade — SA chest economy (Design)

Director lock (Jesse via Code/CoS): **South African cartoon 3D** look (Art owns). Night Heist / 420 brand **retired for this ship**. Costumes **only from chests** bought with **soft currency**. **No** real-money IAP / ads / pay-to-flap / Gummies / Dab Rocket. PR #5 Night Heist stack stays parked.

One-button flap core + physics start **1450 / −440** hold (Feel). Difficulty curve + pattern packs from `TOTAL_UPGRADE_MECHANICS.md` still apply — **rename copy** off “Heist” (bands → Teach / Warm / Rise / Heat / Legend; ranks → Rookie / Squad / Legend). Obstacles = Art’s SA motif (not grinders-as-420).

---

## Soft currency: `coins`

| Rule | Spec |
|------|------|
| Display | **coins** (Art owns icon — SA cartoon, not leaf/nug) |
| Persist | localStorage |
| Earn in-run | **+1 coin per obstacle cleared** (1:1 score) banked on death |
| Near-miss skim | center ≤**6px** of lip → **+1 coin** spark; cap **+5**/run |
| Daily streak | ≥1 run/day consecutive → **+10 coins**/day; streak cap **7** |
| Death chip | cream `+N coins` (was Stash); ghost job chip if missions kept |
| HUD | top-right coin count |

**Kill:** direct nugs-for-skin shop prices, IAP, ads, real-money chests, pay-to-flap power-ups.

Migrate existing `nugs` balance → `coins` 1:1 once (one-time on load).

---

## Costumes: chests only

- **No** buy-skin-with-coins in shop. Shop / home CTA becomes **Chests** (and Equip from collection).
- Default starter costume free + equipped on first launch (Art names it).
- Collection strip on home: owned filled / locked dim; tap → collection (equip) or chests; **does not start a run**.
- Equip is instant; cosmetics only — never changes physics/hitbox size beyond Art’s per-skin inset note (Feel).

### Chest catalog (soft currency only)

| Chest | Cost | Contents | Notes |
|-------|------|----------|--------|
| **Street chest** | **100 coins** | 1 costume roll | Common-heavy |
| **Township chest** | **300 coins** | 1 costume roll | Better rare+ odds |
| **Bok chest** | **750 coins** | 1 costume roll | Best odds + pity credit |

- Buy → open immediately (or short 0.6s lid juice) → reveal card → Equip / OK.
- Dupes: if owned → **40% of that chest’s coin cost** refunded + toast “Duplicate · +coins”.
- **Pity:** after **10** Street opens with no Rare+, next Street guarantees Rare. Township/Bok: after **5** with no Epic+, guarantee Epic. Counter per chest type; resets on hit.

### Rarity weights (single pull)

**Street (100)**  
- Common **70%** · Rare **24%** · Epic **5.5%** · Legendary **0.5%**

**Township (300)**  
- Common **40%** · Rare **40%** · Epic **17%** · Legendary **3%**

**Bok (750)**  
- Common **15%** · Rare **40%** · Epic **35%** · Legendary **10%**

Art drops the costume roster (target **12** costumes: 5C / 4R / 2E / 1L including starter). Design locks these rates until Feel says open rates feel mean — then retune weights only, not prices, in one pass.

### Full set beat
- Own all costumes in roster → one-time toast “Full kit” + **150 coins** (replaces Full crew).

---

## Missions (optional keep, SA copy)

If Jobs stay this ship: same structure, coin payouts, never require chests/PUs.  
Daily ×3 + weekly best≥30. Claim gold only when ready. Death “Job +1” toast ≤1.5s never blocks RESTART.

Suggested rename: Jobs → **Challenges**; leave numbers as SYSTEMS_BRIEF unless Art/Code need SA strings only.

---

## IA locks (hold)

- Home: gold **PLAY** only hot (≥56px); ghost **CHESTS** / **CHALLENGES**; PLAY-rect-only.
- Death: gold **RESTART** only; ghost HOME; ghost CHESTS/CHALLENGES; ≥16px gaps.
- Tagline (temp until Art/Market): **“One flap. Lekker energy.”** — Art may override with SA line; keep arcade-PG, no crude.
- No interstitial before PLAY. No IAP chrome anywhere.

---

## Anti-patterns (hard fail)

- Real-money chest / battle pass / ad-for-chest / ad-for-revive  
- Magic Gummies / Dab Rocket / any mid-run pay power-up  
- Costume that alters gravity, gap, or hitbox unfairly  
- Night Heist / 420 leaf-nug branding on first paint for this ship  

---

## Ship for @Code / @Blunt Art

1. Art: `TOTAL_UPGRADE_SA_CARTOON.md` + sheets + costume roster IDs/rarities.  
2. Code: park #5; new branch — SA hero + this chest economy + mechanics curve/packs with SA copy.  
3. Sync playable + Pages.  
4. Feel re-gate: arc, 34×24-class inset on new silhouette, 60fps, chest UX, no IAP.

## Pass / fail (Design)

- [ ] Coins only from play/streak/dupes/full-kit — never real money  
- [ ] Costumes only via chests (+ free starter); equip from collection  
- [ ] Rarity table matches weights; pity fires  
- [ ] One-button + 1450/−440 unchanged without Feel evidence  
- [ ] Zero IAP/ads/pay-to-flap on first paint
