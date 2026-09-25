# Total Upgrade — Mechanics brief (Design)

Director lock (Jesse via CoS): total mechanics + artwork upgrade; 3D-feel Blunt redesign (Art owns). One-button flap core holds. Cosmetics-only. **Kill** IAP / ads / pay-to-flap / Magic Gummies / Dab Rocket / revive-for-money. Monetize & store-submit OFF.

Live base after Class Above P1: Heist Stash · collection strip · Full crew · kraft/grinder — keep those. This brief is the next ship for @Code with Art’s 3D Blunt.

---

## Core (do not break)

| Lock | Value |
|------|--------|
| Input | One tap = set `vy` to flap impulse (not hold-to-thrust) |
| Physics start | GRAVITY **1450**, FLAP **−440**, max fall **540** (Feel CLEAR) |
| Player X | Fixed; world scrolls |
| First runway | **≥1.4s** before first grinder |
| Hitbox | Rematch to **new 3D silhouette**; slight inset vs art (Feel owns fairness). Do not enlarge collider past sprite |
| Death → restart | Gold **RESTART** only hot CTA; one tap |
| Target | 60fps; portrait primary |

Physics may reopen **only** with Design note + Feel evidence (e.g. 3D mass/readability kills the arc). Soft top-lip watch stays watch-only until then.

---

## 1. Difficulty curve (readable, not random)

Keep early teach; ramp by **score bands**, never per-frame RNG unfairness.

| Band | Score | Scroll px/s | Gap px | Spacing | Notes |
|------|-------|-------------|--------|---------|--------|
| Teach | 0–5 | 165 | 155 | 220 | Hold current feel |
| Warm | 6–15 | → 195 | → 148 | 220 | Gentle |
| Heist | 16–30 | → 225 | → 140 | → 210 | Mid variety unlocks |
| Heat | 31–50 | → 245 | → 135 | → 205 | Cap scroll **250** |
| Legend | 51+ | 250 | floor **128** | 200 | Gap never below 128 |

- Gap Y still random within fair band; **no** sudden gap shrink mid-pair.
- Optional late telegraph: at score **15 / 30 / 50**, one cream “Heat up” flash ≤0.4s (UI only).

---

## 2. Mid-run variety (one-button still wins)

Deterministic pattern packs by score (seed from run start + score index). Cycle every 4 pairs after score **16**:

1. **Straight** — current random gap Y  
2. **Rise** — each next gap center **+14px** (clamp playfield)  
3. **Fall** — each next **−14px**  
4. **Breath** — one wide gap (**+12px** height) then resume band gap  

From score **31**, 1-in-4 packs may use **slow bob** on the pair: vertical ±**8px** @ **0.55 Hz**, phase locked so both lips move together (fair). Telegraph: soft amber lip pulse 0.3s before that pair enters.

**Out:** moving gaps that squeeze; horizontal chasing obstacles; second input; power-ups that change gravity mid-run.

---

## 3. Scoring / meta depth (still soft `nugs` only)

**Run scoring**
- +1 per grinder cleared (unchanged).  
- **Near-miss skim**: center within **6px** of either lip on clear → +1 nug spark (visual only; does not change flap). Cap **+5** skim bonus per run.  
- No combo multiplier that spikes difficulty.

**Meta (free)**
- Keep Class Above: Stash chip, collection strip, Full crew +100.  
- **Daily streak**: play ≥1 run on consecutive calendar days → +**10 nugs**/day, streak cap **7** (reset on miss). Toast once on home.  
- **Heist ranks** (best-driven, cosmetic titles only — no paywall):  
  - best ≥10 → “Runner”  
  - ≥25 → “Crew”  
  - ≥50 → “Legend”  
  Show under best on home; Art supplies badge tint later.  
- Shop prices unchanged (default / 200 / 350 / 500 / 750). New 3D skins = Art drop + Design prices when sheets land.

**Anti-patterns**
- No XP bar, battle pass, ad gate, interstitial before PLAY.  
- No Magic Gummies / Dab Rocket / IAP revive on any paint.

---

## 4. Juice beats (sync with Art’s flap cycle)

| Beat | Spec | Cap |
|------|------|-----|
| Flap | Squash **0.88× / 1.12y** for **70–90ms**, then settle; trail opacity ≤**35%** | Match Art frame timing |
| Gap clear | Cream micro-spark + score pop ≤**1.15 / 180ms** | No screen shake |
| Near-miss | Amber edge flash ≤**100ms** | Never obscures gap |
| Death | Settle ≤**4px / 120ms**; white flash ≤**80ms**; Art 3D death pose | RESTART stays only gold hot |
| Milestone 10/25/50 | One toast per run, ≤**1.2s**, never blocks input | |
| Job / Stash chips | Ghost; never steal RESTART / PLAY | Hold Class Above IA |

Playfield bloom ≤**15%**. Gap neon bloom stays Art’s α≤0.10.

---

## 5. IA hold (through Total Upgrade)

- Home: gold **PLAY** only hot (≥56px); ghost SHOP/JOBS; PLAY-rect-only (+ Space/↑).  
- Collection strip / Wanted chrome / 3D hero taps do **not** start a run.  
- Death: gold RESTART; ghost HOME TL; ghost JOBS/SHOP TR; ≥16px gaps.  
- Tagline: “One flap. Chill heist energy.”

---

## Ship order for @Code

1. Feel re-gates Class Above P1 on Pages (no Design change).  
2. Art drops 3D Blunt sheet + idle/flap timing → wire sprite/canvas volumetric (flag WebGL only if Art says required).  
3. Implement this mechanics file in one PR with Art hero when ready (or mechanics-first if Art still baking — don’t block).  
4. Sync shared playable + Pages.  
5. Feel Total Upgrade re-gate: arc, hitbox inset, 60fps, juice caps, IA, no IAP.

## Pass / fail (Design)

- [ ] One-button only; arc learnable in ~5 deaths  
- [ ] Pattern packs readable; bob telegraphed; never unfair squeeze  
- [ ] Near-miss + streak + ranks work offline; cosmetics-only shop  
- [ ] Juice within caps; RESTART/PLAY focus unbroken  
- [ ] Zero IAP/ads/pay-to-flap/Gummies/Dab Rocket
