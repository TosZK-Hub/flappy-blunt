# Total Upgrade — 3D-feel Blunt (Art → Code drop-in)

**Owner:** Art · **Consumer:** Code · **Status:** draft until Feel CLEAR  
**Sheets:** `art/total-upgrade/3d-blunt-turnaround.png` · `3d-blunt-flap-sheet.png` · `3d-blunt-in-scene.png`  
**Sync:** [`TOTAL_UPGRADE_MECHANICS.md`](./TOTAL_UPGRADE_MECHANICS.md) §4 juice · builds on [`CLASS_ABOVE_P1.md`](../CLASS_ABOVE_P1.md)

## Recommendation — **canvas volumetric (NO WebGL)**

Ship **Canvas 2D pseudo-3D**: multi-stop kraft cylinder + soft AO ellipse + rim light + specular streak + **front/back wing layers** (2.5D parallax). Sprite-sheet or procedural draw both fine. **WebGL not required** — canvas hits the Night Heist premium read at 60fps portrait. Flag WebGL only if Feel proves canvas can’t hold silhouette at scale (default: no).

## Hard locks

| Lock | Value |
|------|--------|
| Player | Winged **HORIZONTAL kraft blunt** tip→right — **NOT** a bird / Flappy Bird |
| Hitbox | **34×24** inset (visual may read larger) |
| Proportions | L≈**68** · mouth r≈**16** · tip r≈**11** (visual cylinder may read ~72 w/ AO+rim; collider unchanged) |
| Physics | Design-owned GRAVITY **1450** / FLAP **−440** — Art syncs juice only |
| Monetize | Off · cosmetics only |
| Palette | Night Heist hexes (night `#2A1638` haze `#4A2F5C` neon `#3DDB6A` cyan `#2EE6D6` kraft `#C4A574`/`#E2C99A`/`#8A6A42`/`#5C4528` ember `#FF6B2C`/`#E8A84A` gold `#F0C14B` cream `#F3E8D4` ink `#1A1420`) |

## Material recipe (clip to `bluntPath`, y = −r0 → +r0)

```
0.00  KRAFT_HIGH   #E2C99A
0.18  #D4B888
0.45  KRAFT        #C4A574
0.72  KRAFT_SHADOW #8A6A42
1.00  KRAFT_DEEP   #5C4528
```

Layers (order): (1) soft AO under body `rgba(26,20,32,0.28)` · (2) 5-stop fill · (3) rim light top `rgba(243,232,212,0.45→0)` · (4) highlight ellipse a**0.32** · (5) undershine a**0.18** · (6) grain multiply **0.03–0.05** · (7) specular streak a**0.28** · (8) ink 2px · (9) tip ember pulse. **No stacked rects for wrap.**

**Ember:** `pulse = 0.92 + 0.08*sin(t*6.5)` · flap kick ×**1.12** ≤**80ms** · glow a≤0.15 · playfield bloom ≤15%.

## Wing layers (2.5D)

Draw **back** wings first (α≈0.72, offset −2..−3px), body, then **front** wings. 5 feathers/side, soft-edge ellipse a0.22, vein a≤0.28 inner 3 only. Flap angle drives both layers (±0.55 rad from rest).

## Idle + flap cycle (8 frames — match Design juice)

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

Trail mid α ≤**35%**. **No flap camera shake.** Squash is draw-scale only around player origin.

## Skin material swaps (silhouette locked)

`default` · `gold_chain` · `neon_kush` (2.4px neon edge) · `galaxy_roll` · `og_heist` — same body/wing recipe; swap wrap fills, tip tint, accessories (rounded paths only — no `fillRect` on character).

## Coherence (hero first — don’t redesign world)

- **Grinders:** keep Class Above metal discs + dual specular + gap neon 2.5–3px bloom α≤0.10  
- **UI:** Wanted / gold PLAY / ghost chips unchanged IA  
- Scale ref: `3d-blunt-in-scene.png`

## Art QA (Pages)

- [ ] Reads 3D-feel kraft (5-stop + rim + AO + specular); not flat toy  
- [ ] Silhouette = horizontal winged blunt tip→right (not bird)  
- [ ] Idle bob + flap F0–F7 timings; squash 70–90ms sx0.88/sy1.12  
- [ ] Front/back wing parallax visible on flap  
- [ ] Hitbox debug 34×24 · physics unchanged · trails ≤35% · bloom ≤15%  
- [ ] Skins still swap · grinders still metal discs · no IAP chrome  

**Art does not edit playable JS. Do not push GitHub from Art.**
