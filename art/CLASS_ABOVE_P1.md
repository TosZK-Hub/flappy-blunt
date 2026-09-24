# Class Above P1 — Code drop-in (kraft + grinder specular)

**Owner:** Art · **Consumer:** Code · **From:** [`VISUAL_CLASS.md`](./VISUAL_CLASS.md) §2.1 + §3  
**Status:** P1 unlocked (soft→ship) · cosmetics only  

## Hard locks

Hitbox `34×24` inset · no physics / gap / scroll edits · IA positions locked · monetize off · Night Heist hexes · horizontal winged kraft blunt tip→right (L≈68, mouth r≈16, tip r≈11) · grinders = metal discs **not** pipes · **not** a bird.

## Sheets

- `art/p1-kraft-cylinder.png` — OLD 3-stop toy vs NEW 5-stop cylinder  
- `art/p1-grinder-specular.png` — dual specular + gap hairline bloom ≤0.10  
- Also: `art/visual-class-character.png`, `art/v2-character-sheet.png`, `art/v2-grinder-sheet.png`

## Kraft cylinder (§2.1) — clip to `bluntPath`, y = −r0 → +r0

```
0.00  KRAFT_HIGH   #E2C99A
0.18  #D4B888      (optional mid-high)
0.45  KRAFT        #C4A574
0.72  KRAFT_SHADOW #8A6A42
1.00  KRAFT_DEEP   #5C4528
```

Layers: (1) highlight ellipse `rgba(243,232,212,0.32)` · (2) undershine `rgba(26,20,32,0.18)` near bottom · (3) grain multiply α **0.03–0.05** body-only · (4) ink 2px `NIGHT_INK` (`neon_kush` 2.4px neon). **No stacked rects for wrap.**

## Grinder dual specular + gap (§3)

Keep `discH≈16` `pitch≈22` bulge 7/3 `capH≈9`.

**Metal stops:** `#8B6A9C` → `#7A5A8C` → `HAZE #4A2F5C` → `#2A1838` → `#1A0E24`

**Two speculars per disc:**

1. Top strip — cream `rgba(243,232,212,0.22)` · y≈discTop+2.8 · rx≈w*0.34 · ry≈1.4  
2. Mid hairline — cream `rgba(243,232,212,0.10)` · y≈discMid−1 · rx≈w*0.28 · ry≈0.7  

Side neon dots α **0.14**. Gap: cap fill slightly lighter · ink 2px · neon hairline **2.5–3px** `NEON_LEAF` on gap face only · bloom radial **α≤0.10** radius ≤capW*0.42 (must not wash gap). Playfield bloom ≤15% total.

## Out of scope

No physics / hitbox / IA / monetize · no P2 squash/embers/ash/home-float unless trivial · no palette restart · no mascot swap · Canva mood only.

## Art QA (Pages)

- [ ] Kraft reads 4–5 stops + highlight + undershine; grain ≤0.05  
- [ ] Silhouette still horizontal winged blunt tip→right  
- [ ] Both specular strips visible on discs  
- [ ] Gap neon 2.5–3px; bloom α≤0.10 does not wash opening  
- [ ] Metal discs not green pipes · Night Heist hexes intact  
- [ ] Hitbox debug 34×24 · physics unchanged  

**Art does not edit playable JS. Do not push GitHub from Art.**
