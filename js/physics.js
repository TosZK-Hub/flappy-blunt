/* World simulation. Feel numbers come from js/feel.js — do not restate them here. */
(function (root, factory) {
  const Feel = typeof module !== "undefined" && module.exports ? require("./feel.js") : root.FBFeel;
  const api = factory(Feel);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.FBPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Feel) {
  "use strict";

  const C = Feel.CONFIG;
  const GRAVITY = C.GRAVITY;
  const FLAP_IMPULSE = C.FLAP_IMPULSE;
  const MAX_FALL = C.MAX_FALL;
  const HITBOX_W = C.HITBOX_W;
  const HITBOX_H = C.HITBOX_H;

  const W = 420;
  const H = 750;
  const GROUND_H = 118;
  const GROUND_Y = H - GROUND_H;

  const PLAYER_X = 128;
  const START_Y = 318;
  const CEILING = 16;

  const SPAWN_AT = W + 28;
  const VIS_W = 108;
  const COL_W = 74;

  const tipRadians = Feel.tipRadians;
  const scrollSpeed = Feel.scrollSpeed;
  const gapHeight = Feel.gapHeight;

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function rng() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function spacingFor(score) {
    return Feel.pairSpacing(score || 0);
  }

  function gateInset() {
    return (VIS_W - COL_W) / 2;
  }

  function initialTowerX() {
    return PLAYER_X + HITBOX_W / 2 + C.SCROLL_START * C.FIRST_PIPE_DELAY - gateInset();
  }

  function runwaySeconds() {
    const lead = initialTowerX() + gateInset();
    return (lead - (PLAYER_X + HITBOX_W / 2)) / C.SCROLL_START;
  }

  function gapLimits(gapH) {
    return {
      min: 102 + gapH / 2,
      max: GROUND_Y - 92 - gapH / 2,
    };
  }

  function maxGapStep(score) {
    const harsh = score < 1 ? 0.28 : score < 3 ? 0.55 : score < 8 ? 0.8 : 1;
    return 40 + 70 * harsh;
  }

  function nextGapY(prev, gapH, rng, score) {
    const limits = gapLimits(gapH);
    const mid = (limits.min + limits.max) / 2;
    const harsh = score < 1 ? 0.28 : score < 3 ? 0.55 : score < 8 ? 0.8 : 1;
    const pull = 0.2;
    let g = prev * (1 - pull) + mid * pull + (rng() * 2 - 1) * 124 * harsh;
    const maxStep = maxGapStep(score);
    g = clamp(g, prev - maxStep, prev + maxStep);
    g = clamp(g, limits.min, limits.max);
    return g;
  }

  /* Straight / Rise / Fall / Breath, four pairs each, once score reaches 16. */
  function patternStep(run, score) {
    const baseH = gapHeight(score);
    if (!run.spawned) {
      run.spawned = true;
      return { gapY: run.gapY, gapH: baseH, bob: false, pack: -1, slot: -1 };
    }
    if (score < C.PATTERN_SCORE) {
      run.gapY = nextGapY(run.gapY, baseH, run.rng, score);
      return { gapY: run.gapY, gapH: baseH, bob: false, pack: -1, slot: -1 };
    }
    const pack = Math.floor(run.packPairs / 4) % 4;
    const slot = run.packPairs % 4;
    const limits = gapLimits(baseH);
    if (pack === 1) run.gapY = clamp(run.gapY + C.RISE_PX, limits.min, limits.max);
    else if (pack === 2) run.gapY = clamp(run.gapY - C.RISE_PX, limits.min, limits.max);
    else run.gapY = nextGapY(run.gapY, baseH, run.rng, score);
    let gapH = baseH;
    if (pack === 3 && slot === 0) {
      gapH = baseH + C.BREATH_PX;
      const wide = gapLimits(gapH);
      run.gapY = clamp(run.gapY, wide.min, wide.max);
    }
    const bob = score >= C.BOB_SCORE && pack === 3;
    run.packPairs += 1;
    return { gapY: run.gapY, gapH: gapH, bob: bob, pack: pack, slot: slot };
  }

  function towerColliders(tower) {
    const left = tower.x + (VIS_W - COL_W) / 2;
    const gapTop = tower.gapY - tower.gapH / 2;
    const gapBot = tower.gapY + tower.gapH / 2;
    return [
      { x: left, y: -240, w: COL_W, h: gapTop + 240 },
      { x: left, y: gapBot, w: COL_W, h: GROUND_Y - gapBot + 80 },
    ];
  }

  function playerBox(y) {
    return {
      x: PLAYER_X - HITBOX_W / 2,
      y: y - HITBOX_H / 2,
      w: HITBOX_W,
      h: HITBOX_H,
    };
  }

  function aabbOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function playerHitsGround(y) {
    return y + HITBOX_H / 2 >= GROUND_Y;
  }

  function playerHitsTower(y, tower) {
    const box = playerBox(y);
    const cols = towerColliders(tower);
    for (let i = 0; i < cols.length; i++) {
      if (aabbOverlap(box, cols[i])) return true;
    }
    return false;
  }

  /* Surviving skim: hitbox edge within 6px of a lip. A center-to-lip gap of 6px would already overlap the 24px box. */
  function skimClearance(y, tower) {
    const top = tower.gapY - tower.gapH / 2;
    const bot = tower.gapY + tower.gapH / 2;
    const edgeTop = (y - HITBOX_H / 2) - top;
    const edgeBot = bot - (y + HITBOX_H / 2);
    return Math.min(edgeTop, edgeBot);
  }

  function createPlayer() {
    return {
      y: START_Y,
      vy: 0,
      rot: 0,
      sx: 1,
      sy: 1,
      wing: 0,
      spin: 0,
      dead: false,
      invuln: 0,
    };
  }

  function stepPlayer(p, dt, flap, dead) {
    if (flap && !dead) p.vy = FLAP_IMPULSE;
    p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * dt);
    p.y += p.vy * dt;

    const pose = tipRadians(!dead && p.vy < 0 ? C.FLAP_TIP_DEG : C.FALL_TIP_DEG);
    if (flap && !dead) p.rot = pose;
    else p.rot += (pose - (p.rot || 0)) * (1 - Math.exp(-14 * dt));

    if (dead) {
      const pen = p.y + HITBOX_H / 2 - GROUND_Y;
      if (pen >= 0) {
        p.y -= pen;
        if (p.vy > 0) p.vy = -p.vy * 0.28;
        if (Math.abs(p.vy) < 50) p.vy = 0;
        p.spin = 0;
      }
    } else {
      const top = p.y - HITBOX_H / 2;
      if (top < CEILING) {
        p.y += CEILING - top;
        if (p.vy < 0) p.vy = 0;
      }
    }

    p.sx = 1;
    p.sy = 1;
    return p;
  }

  function createRun(seed) {
    const rng = mulberry32(seed == null ? (Math.random() * 0xffffffff) >>> 0 : seed >>> 0);
    const gapH = gapHeight(0);
    return {
      score: 0,
      towers: [],
      skim: 0,
      alive: true,
      spawned: false,
      packPairs: 0,
      player: createPlayer(),
      rng: rng,
      gapY: START_Y - 18,
      gapH: gapH,
      time: 0,
      nextX: initialTowerX(),
    };
  }

  function stepRun(run, dt, flap) {
    const ev = {
      died: null,
      scored: false,
      gain: 0,
      gapX: 0,
      gapY: 0,
      gapH: 0,
      flapped: false,
      near: false,
      pickups: [],
      blocked: null,
    };
    if (!run.alive) return ev;

    if (flap) ev.flapped = true;
    stepPlayer(run.player, dt, flap, false);

    const speed = scrollSpeed(run.score);
    run.nextX -= speed * dt;
    for (let i = 0; i < run.towers.length; i++) {
      const t = run.towers[i];
      t.x -= speed * dt;
      if (t.bob) {
        const limits = gapLimits(t.gapH);
        const phase = run.time * (Math.PI * 2 * C.BOB_HZ) + (t.bobPhase || 0);
        t.gapY = clamp(t.baseGapY + Math.sin(phase) * C.BOB_PX, limits.min, limits.max);
      }
      const dist = t.x - W;
      t.pulse = !!(t.bob && dist > 0 && dist <= speed * 0.3);
    }

    let guard = 0;
    while (run.nextX < SPAWN_AT && guard++ < 6) {
      const shaped = patternStep(run, run.score);
      const seed = (run.rng() * 0x7fffffff) | 0;
      const tower = {
        x: run.nextX,
        gapY: shaped.gapY,
        baseGapY: shaped.gapY,
        gapH: shaped.gapH,
        scored: false,
        seed: seed,
        motif: Feel.motifFor(run.score, seed),
        bob: shaped.bob,
        bobPhase: shaped.bob ? run.rng() * Math.PI * 2 : 0,
        pulse: false,
        pack: shaped.pack,
      };
      run.towers.push(tower);
      run.nextX += spacingFor(run.score);
    }

    const p = run.player;
    for (let i = 0; i < run.towers.length; i++) {
      const t = run.towers[i];
      const cx = t.x + VIS_W / 2;
      if (!t.scored && cx < PLAYER_X) {
        t.scored = true;
        run.score += 1;
        ev.scored = true;
        ev.gain = 1;
        ev.gapX = cx;
        ev.gapY = t.gapY;
        ev.gapH = t.gapH;
        const clearance = skimClearance(p.y, t);
        ev.near = clearance >= 0 && clearance <= C.SKIM_PX;
      }
    }

    if (playerHitsGround(p.y)) {
      run.alive = false;
      ev.died = "ground";
    } else {
      for (let i = 0; i < run.towers.length; i++) {
        const t = run.towers[i];
        if (t.x > PLAYER_X + 90 || t.x + VIS_W < PLAYER_X - 90) continue;
        if (playerHitsTower(p.y, t)) {
          run.alive = false;
          ev.died = "tower";
          break;
        }
      }
    }

    if (ev.died) ev.near = false;

    if (run.towers.length > 8) {
      run.towers = run.towers.filter(function (t) { return t.x + VIS_W > -60; });
    }

    run.time += dt;
    return ev;
  }

  return {
    W: W,
    H: H,
    GROUND_H: GROUND_H,
    GROUND_Y: GROUND_Y,
    PLAYER_X: PLAYER_X,
    START_Y: START_Y,
    CEILING: CEILING,
    CONFIG: C,
    GRAVITY: GRAVITY,
    FLAP_IMPULSE: FLAP_IMPULSE,
    MAX_FALL: MAX_FALL,
    HITBOX_W: HITBOX_W,
    HITBOX_H: HITBOX_H,
    SPAWN_AT: SPAWN_AT,
    VIS_W: VIS_W,
    COL_W: COL_W,
    tipRadians: tipRadians,
    clamp: clamp,
    mulberry32: mulberry32,
    scrollSpeed: scrollSpeed,
    gapHeight: gapHeight,
    spacingFor: spacingFor,
    initialTowerX: initialTowerX,
    runwaySeconds: runwaySeconds,
    maxGapStep: maxGapStep,
    nextGapY: nextGapY,
    patternStep: patternStep,
    gapLimits: gapLimits,
    skimClearance: skimClearance,
    towerColliders: towerColliders,
    playerBox: playerBox,
    playerHitsGround: playerHitsGround,
    playerHitsTower: playerHitsTower,
    createPlayer: createPlayer,
    stepPlayer: stepPlayer,
    createRun: createRun,
    stepRun: stepRun,
  };
});
