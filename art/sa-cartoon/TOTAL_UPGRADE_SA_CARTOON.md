# Total Upgrade — SA Cartoon 3D (Art → Code drop-in)

**Owner:** Art (Blunt Art) · **Consumer:** Code · **Status:** Art LOCK — DRAFT→LOCK sheets for this ship  
**Director lock (Jesse):** Full cartoon 3D animation graphics · **South African theme** · Night Heist / 420 blunt brand **RETIRED for this ship** · PR #5 Night Heist **parked**  
**Sheets:** `art/sa-cartoon/sa-hero-turnaround.png` · `sa-hero-flap-sheet.png` · `sa-world-obstacles.png` · `sa-costume-roster.png` · `sa-coin-icon.png`  
**Economy:** [`TOTAL_UPGRADE_SA_CHESTS.md`](./TOTAL_UPGRADE_SA_CHESTS.md) · **Mechanics curve:** [`TOTAL_UPGRADE_MECHANICS.md`](./TOTAL_UPGRADE_MECHANICS.md) (rename Heist copy → Teach/Warm/Rise/Heat/Legend)

---

## Recommendation — **canvas volumetric (NO WebGL default)**

Ship **Canvas 2D pseudo-3D cartoon**: multi-stop body fills + soft AO ellipse + rim light + soft subsurface + specular streak + **front/back wing layers** (2.5D). Sprite-sheet OR procedural draw both fine.

| Flag | Value |
|------|--------|
| **WebGL** | **NO** (default) |
| When WebGL? | Only if Feel proves canvas cannot hold silhouette / 60fps at portrait mobile scale |
| Feel Class Above squash | Keep Design squash **sx 0.88 / sy 1.12 @ 70–90ms** (compatible with `TOTAL_UPGRADE_3D_BLUNT`) |

---

## Hard locks

| Lock | Value |
|------|--------|
| Player | Premium cartoon 3D mascot nicknamed **“Blunt”** — plump **horizontal** cartoon body, big friendly face, small feathered cartoon wings, **lit tip OR cheeky glow nose** — tip→right · **NOT a bird · NOT Flappy Bird** |
| Hitbox | **34×24** inset (Feel) — visual silhouette length ~**68–80** OK |
| Proportions | Body L≈**72–76** · face disc r≈**18–20** · tip/nose r≈**10–12** · wing span each side ≈**22–26** |
| Physics | Design GRAVITY **1450** / FLAP **−440** — Art syncs juice only |
| Monetize | **Off** · costumes **only from soft-currency chests** · **no IAP / ads / pay-to-flap** |
| Brand | SA cartoon · Night Heist kraft / leaf-nug / grinders-as-420 **killed for this ship** |

---

## Palette (SA Cartoon lock)

| Token | Hex | Use |
|-------|-----|-----|
| `BOK_GREEN` | `#007A4D` | Springbok primary, jersey, world accents |
| `BOK_GOLD` | `#FFB81C` | Emblems, PLAY CTA, coin rim, rare+ sparkle |
| `SKY_SA` | `#4EB8E8` | Sky / taxi stripe / UI ghost cool |
| `SUNSET_ORANGE` | `#F26A3D` | Veld sunset, Cape spice, vuvuzela |
| `PROTEA_PINK` | `#E85A8C` | Protea crown Epic |
| `EARTH_WARM` | `#C4783A` | Braai / township warm mid |
| `EARTH_DEEP` | `#6B3A1F` | Ground / shadow earth |
| `BODY_CREAM` | `#FFE8C8` | Hero body base (warm cartoon) |
| `BODY_MID` | `#F0C898` | Body mid tone |
| `BODY_SHADOW` | `#C48A58` | Body AO / underside |
| `FACE_WARM` | `#FFF1DC` | Face plate highlight |
| `WING_SOFT` | `#FFF6E8` | Feather fill |
| `WING_EDGE` | `#E8C9A0` | Feather rim |
| `GLOW_NOSE` | `#FF8A3D` | Cheeky glow nose / lit tip |
| `GLOW_HOT` | `#FF5A1F` | Tip hot core |
| `INK` | `#1A2A22` | Line / outline (green-ink, not Night Heist purple) |
| `CREAM_UI` | `#FFF8EC` | UI text / captions |
| `PANEL_TOP` | `#0E5C3A` | Sheet banners |
| `PANEL_BOT` | `#063024` | Sheet banners |
| `TOWNSHIP_SKY_A` | `#FFB36A` | Parallax sunset top |
| `TOWNSHIP_SKY_B` | `#6B3FA0` | Parallax dusk mid (soft) |
| `TOWNSHIP_SKY_C` | `#1E3A5F` | Parallax far cool |
| `SHWESHWE_BLUE` | `#1E4D8C` | Shweshwe-inspired geometric (pattern materials — **not** a brand logo) |
| `RHINO_GREY` | `#9AA3A8` | Rhino Guard soft plates |
| `RHINO_DEEP` | `#5C656A` | Rhino plate shadow |
| `COIN_FACE` | `#FFD24A` | Soft-currency coin face |
| `COIN_RIM` | `#C88912` | Coin rim |
| `COIN_HI` | `#FFE9A0` | Coin specular |

**Kill from first paint:** Night Heist `#2A1638` kraft canvas as hero wrap, neon leaf `#3DDB6A` as brand mark, leaf/nug coin glyph.

---

## Hero identity (Art lock)

- **Form:** Plump horizontal capsule / rounded cylinder — friendly, readable at portrait mobile. Big circular face on left-of-center of body (eyes toward flight direction = tip→right). Small cartoon feathered wings mid-body (top + bottom or upper pair readable).
- **Face:** Oversized friendly eyes, soft brows, small smile — arcade-PG, lekker. Optional tiny blush.
- **Tip / nose:** Either (A) warm lit tip on right end with soft ember pulse, **or** (B) cheeky glow nose on face — pick one per costume; default starter uses **glow nose + soft tip ember**.
- **Materials:** Soft subsurface (warm cream), 5-stop body gradient, rim light top `rgba(255,248,236,0.5→0)`, AO under `rgba(26,42,34,0.28)`, specular streak α≈0.28, ink outline **2px** `#1A2A22`. **Rounded paths only** — no stacked `fillRect` for body.
- **Wings:** Front/back layers (back α≈0.72, offset −2..−3px). 4–5 soft feathers/side. Flap ±0.55 rad from rest.

### Material recipe (clip to body path, y = −r0 → +r0)

```
0.00  BODY_HI     #FFF1DC
0.18  #FFE0B8
0.45  BODY_CREAM  #FFE8C8
0.72  BODY_MID    #F0C898
1.00  BODY_SHADOW #C48A58
```

**Glow nose / tip pulse:** `pulse = 0.92 + 0.08*sin(t*6.5)` · flap kick ×**1.12** ≤**80ms** · glow α≤0.15 · playfield bloom ≤15%.

---

## Idle + flap cycle (F0–F7 — keep Design squash)

| Frame | Pose | Timing | Draw squash |
|-------|------|--------|-------------|
| F0 | Idle mid | loop | 1 / 1 |
| F1 | Idle up | bob `sin(t*2.15)*6–7` | 1 / 1 |
| F2 | Anticipation wings up | 0–40ms | 1.02 / 0.98 |
| F3 | Downstroke start | 40–70ms | 0.95 / 1.05 |
| F4 | **Squash peak** | **70–90ms** | **sx 0.88 / sy 1.12** |
| F5 | Release | 90–140ms | 0.94 / 1.06 |
| F6 | Settle | 140–200ms → 1,1 | 0.98 / 1.02 |
| F7 | Idle down | bob | 1 / 1 |

Trail mid α ≤**35%**. **No flap camera shake.** Squash is draw-scale only around player origin. Hitbox stays **34×24** inset regardless of costume visual.

---

## World (coherent pick — **Township Sunset Lekker**)

**Stick to one world:** warm **township sunset** with soft **Table Mountain** far silhouette + jacaranda accents — not Night Heist purple alley, not green Flappy pipes.

### Parallax layers

| Layer | Motif | Scroll | Notes |
|-------|-------|--------|-------|
| Far | Soft Table Mountain + dusk sky (orange→violet→navy) | ~0.15× | Soft silhouette α≤0.55; no hard noir |
| Mid | Township skyline (zinc roofs, spaza signs, water towers) + jacaranda bloom blobs | ~0.35× | Warm earth roofs `#C4783A` / `#8A4A28` |
| Near | Braai smoke wisps / dusty ground band / soft veld grass | ~0.65× | Ground `#6B3A1F` → `#3A2214` |

### Obstacle motif stacks (NOT grinders, NOT green pipes)

Stack **disc / drum / column** modules with clear gap lips (2.5–3px cream/gold hairline bloom α≤0.10). Families rotate by difficulty band:

| Motif id | Look | Band hint |
|----------|------|-----------|
| `braai_drum` | Charcoal braai drum towers (metal cylinder + rust rim + warm ember glow under) | Teach / Warm |
| `taxi_stack` | Minibus-taxi body slices (yellow `#FFB81C` + green stripe `#007A4D`) stacked | Warm / Rise |
| `pylon_disc` | Load-shedding pylon disc stacks (grey lattice, soft yellow “power” tip lights) | Rise / Heat |
| `protea_column` | Cape flora / protea column (pink `#E85A8C` bloom heads + green stem discs) | Heat / Legend |

Gap clarity > decoration. Same collision AABB family as prior grinders — Art swaps paint only.

---

## UI chrome (Art designs · IA from Design)

| Element | Spec |
|---------|------|
| **PLAY** | Brushed / soft gold `#FFB81C` → `#C88912` · cream text · ≥56px · only hot CTA |
| **CHESTS / CHALLENGES** | Ghost chips — warm glass, cream outline α0.35, **not** Night Heist purple glass |
| **Coin HUD** | Soft-currency **coin** (see recipe) — top-right count · **NOT** leaf/nug |
| Tagline | Arcade-PG: **“One flap. Lekker energy.”** (Art may override SA line; no crude) |
| Death | Gold **RESTART** only; ghost HOME; ghost CHESTS/CHALLENGES; ≥16px gaps |

---

## Soft-currency coin icon recipe

- Disc face `#FFD24A` · rim `#C88912` · inner ring `#FFE9A0` α0.55
- Center mark: stylized **“R”** micro-badge **or** simple sunburst/star (SA-warm) — **NOT** cannabis leaf, **NOT** nug
- Specular arc top-left α0.45 · soft AO under α0.25
- HUD size ~28–32px; chest reveal can scale 2×

---

## Costume roster (ids + rarity LOCKED for Code)

**12 costumes = 5 Common / 4 Rare / 2 Epic / 1 Legendary** · free starter · chests only ([`TOTAL_UPGRADE_SA_CHESTS.md`](./TOTAL_UPGRADE_SA_CHESTS.md))

| # | id | name | rarity | look | trail |
|---|----|------|--------|------|-------|
| 1 | `starter_tee` | Township Tee | **Common** · **FREE starter** | Bright tee wrap (sky `#4EB8E8` + cream) + takkie-vibe wing tips · default glow nose | Soft cream dust |
| 2 | `spaza_cap` | Spaza Cap | Common | Cap accessory on crown · shop-stripe wrap (green/gold) | Warm dust |
| 3 | `yellow_taxi` | Minibus Yellow | Common | Yellow body `#FFB81C` + green `#007A4D` racing stripes | Taxi streak yellow |
| 4 | `braai_apron` | Braai Apron | Common | Apron bib + tongs pin · charcoal/cream wrap · tip ember hotter | Smoke wisps grey |
| 5 | `takkie_run` | Takkie Runner | Common | Sneaker-glow wing tips (cyan-white pulses) · sporty stripe wrap | Speed dust white |
| 6 | `bok_jersey` | Springbok Green Jersey | **Rare** | Jersey wrap `#007A4D` / gold `#FFB81C` trim · soft bok chevron (generic, not official logo rip) | Green spark |
| 7 | `vuvuzela` | Vuvuzela Fan | Rare | Orange horn accents `#F26A3D` · fan scarf wrap | Orange horn spark |
| 8 | `shweshwe` | Shweshwe Shirt | Rare | Geometric blue print materials `#1E4D8C` on cream — **pattern-inspired, not a brand logo** | Blue geometric glitter |
| 9 | `cape_spice` | Cape Spice | Rare | Warm Malay-spice oranges/reds `#F26A3D`/`#C4783A` · spice-dust speckles | Spice ember |
| 10 | `protea_royal` | Protea Royal | **Epic** | Pink protea crown accents `#E85A8C` · petal wing tips | Pink petal trail |
| 11 | `rhino_guard` | Rhino Guard | Epic | Soft grey armor plates `#9AA3A8` — **cute not violent** · tiny horn nub | Stone dust |
| 12 | `bok_legend` | Bok Legend | **Legendary** | Gold springbok-emblem armor `#FFB81C` + green underglow · premium rim | Gold bok trail |

**Cosmetics only** — never change gravity, gap, or hitbox unfairly. Equip instant from collection.

---

## Art QA checklist (Pages / Feel re-gate)

- [ ] Reads **premium cartoon 3D** (multi-stop + rim + AO + subsurface) — **not** flat kraft Night Heist, **not** silhouette-only
- [ ] Hero = plump horizontal mascot tip→right — **not a bird / not Flappy Bird**
- [ ] SA palette live (bok green / gold / sky / warm earth) — Night Heist purple kraft **absent** on first paint
- [ ] Idle bob + flap F0–F7; squash **70–90ms sx0.88/sy1.12**
- [ ] Front/back wing parallax visible on flap
- [ ] Hitbox debug **34×24** · physics **1450/−440** unchanged · trails ≤35% · bloom ≤15%
- [ ] Obstacles = braai / taxi / pylon / protea stacks — **not** grinders-as-420, **not** green pipes
- [ ] Parallax = Township Sunset Lekker coherent world
- [ ] Coin icon = soft-currency disc — **not** leaf/nug
- [ ] All **12** costume ids present; starter `starter_tee` free; rarities C5/R4/E2/L1
- [ ] UI: gold PLAY · ghost CHESTS/CHALLENGES · tagline arcade-PG
- [ ] **Zero** IAP / ads / pay-to-flap / Gummies / Dab Rocket chrome

---

## Kills (hard fail this ship)

| Kill | Why |
|------|-----|
| Night Heist kraft canvas as hero wrap | Brand retired for this ship |
| Grinder towers as 420 / metal weed grinders | SA motif stacks replace |
| Leaf / nug soft-currency glyph | Coins = SA cartoon coin |
| Flat silhouette / paper cutout hero | Must read cartoon 3D volumetric |
| Green Flappy Bird pipes | Banned obstacle family |
| IAP / ads / real-money chests / pay-to-flap | Design lock |
| Magic Gummies / Dab Rocket mid-run pay PUs | Design lock |
| Official Springbok / brand logos as assets | Use generic chevron / pattern-inspired materials only |
| Sacred / religious symbol ripoffs in shweshwe materials | Geometric print inspiration only |

---

## Sheet index

| File | Contents |
|------|----------|
| `art/sa-cartoon/sa-hero-turnaround.png` | Cartoon 3D hero turnaround (front / ¾ / side / tip) + proportion callouts |
| `art/sa-cartoon/sa-hero-flap-sheet.png` | Idle + flap F0–F7 labeled + squash note |
| `art/sa-cartoon/sa-world-obstacles.png` | Obstacle motifs + Township Sunset parallax mood |
| `art/sa-cartoon/sa-costume-roster.png` | All 12 costumes labeled id + rarity C/R/E/L |
| `art/sa-cartoon/sa-coin-icon.png` | Soft-currency coin (optional small) |

Night Heist sheets under `art/` + `art/total-upgrade/` remain **archived reference** for this ship — do not ship as first paint.

**Art does not edit playable JS. Do not push GitHub from Art.**
