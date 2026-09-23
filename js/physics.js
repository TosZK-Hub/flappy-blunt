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

  function spacingFor() {
    return C.PIPE_SPACING;
  }

  function gateInset() {
    return (VIS_W - COL_W) / 2;
  }

  function initialTowerX() {
    return PLAYER_X + HITBOX_W / 2 + C.SCROLL_START * C.FIRST_PIPE_DELAY - gateInset();
  }

  /* Seconds until the first gate's collider can touch the blunt, at start speed. */
  function runwaySeconds() {
    const lead = initialTowerX() + gateInset();
    return (lead - (PLAYER_X + HITBOX_W / 2)) / C.SCROLL_START;
  }

  /* Vertical wander stays inside what the locked spacing and scroll can climb. */
  function maxGapStep(score) {
    const harsh = score < 1 ? 0.28 : score < 3 ? 0.55 : score < 8 ? 0.8 : 1;
    return 40 + 70 * harsh;
  }

  function nextGapY(prev, gapH, rng, score) {
    const min = 102 + gapH / 2;
    const max = GROUND_Y - 92 - gapH / 2;
    const mid = (min + max) / 2;
    const harsh = score < 1 ? 0.28 : score < 3 ? 0.55 : score < 8 ? 0.8 : 1;
    const pull = 0.2;
    let g = prev * (1 - pull) + mid * pull + (rng() * 2 - 1) * 124 * harsh;
    const maxStep = maxGapStep(score);
    g = clamp(g, prev - maxStep, prev + maxStep);
    g = clamp(g, min, max);
    return g;
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

  function stepPlayer(p, dt, flap, dead, gravityScale) {
    if (flap && !dead) {
      p.vy = FLAP_IMPULSE;
      p.sx = 1.08;
      p.sy = 0.92;
    }
    const g = GRAVITY * (gravityScale || 1);
    p.vy = Math.min(MAX_FALL, p.vy + g * dt);
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

    const sk = 1 - Math.exp(-14 * dt);
    p.sx += (1 - (p.sx || 1)) * sk;
    p.sy += (1 - (p.sy || 1)) * sk;
    p.wing = (p.wing || 0) * Math.exp(-8 * dt);
    return p;
  }

  const PICKUP_IDS = ["nug_24k", "nug_haze", "dab_rocket", "magic_gummies", "gold_chip", "trail_can"];

  function createRun(seed, opts) {
    const rng = mulberry32(seed == null ? (Math.random() * 0xffffffff) >>> 0 : seed >>> 0);
    const gapH = gapHeight(0);
    return {
      score: 0,
      towers: [],
      pickups: [],
      pickupsEnabled: !!(opts && opts.pickups),
      active: null,
      nextPickupPipe: C.PU_FIRST_PIPE,
      nextX: initialTowerX(),
      alive: true,
      spawned: false,
      player: createPlayer(),
      rng,
      gapY: START_Y - 18,
      gapH,
      time: 0,
    };
  }

  function grantPickup(run, id) {
    const t = run.time;
    const active = { id: id, until: 0, armed: false, popping: false };
    if (id === "nug_24k") active.armed = true;
    else if (id === "nug_haze") active.until = t + C.PU_HAZE_TIME;
    else if (id === "dab_rocket") active.until = t + C.PU_ROCKET_TIME;
    else if (id === "magic_gummies") active.until = t + C.PU_FLOAT_TIME;
    else if (id === "gold_chip") active.held = true;
    else if (id === "trail_can") active.until = t + C.PU_TRAIL_TIME;
    run.active = active;
  }

  function effectLive(run, id) {
    const a = run.active;
    return !!(a && a.id === id && !a.popping);
  }

  function playerHitsPickup(y, pk) {
    const box = playerBox(y);
    const nx = clamp(pk.x, box.x, box.x + box.w);
    const ny = clamp(pk.y, box.y, box.y + box.h);
    const dx = pk.x - nx;
    const dy = pk.y - ny;
    const r = C.PU_RADIUS;
    return dx * dx + dy * dy <= r * r;
  }

  function stepRun(run, dt, flap) {
    const ev = { died: null, scored: false, gain: 0, gapX: 0, gapY: 0, flapped: false, pickups: [], blocked: null };
    if (!run.alive) return ev;

    if (run.player.invuln > 0) run.player.invuln -= dt;
    if (run.active && run.active.until && run.time >= run.active.until) run.active = null;
    const floating = effectLive(run, "magic_gummies");
    if (flap) ev.flapped = true;
    stepPlayer(run.player, dt, flap, false, floating ? C.PU_FLOAT_GRAVITY : 1);

    let speed = scrollSpeed(run.score);
    if (effectLive(run, "dab_rocket")) speed *= C.PU_ROCKET_MULT;
    run.nextX -= speed * dt;
    for (let i = 0; i < run.towers.length; i++) run.towers[i].x -= speed * dt;
    if (run.pickups) {
      for (let i = run.pickups.length - 1; i >= 0; i--) {
        run.pickups[i].x -= speed * dt;
        if (run.pickups[i].x < -40) run.pickups.splice(i, 1);
      }
    }

    let guard = 0;
    while (run.nextX < SPAWN_AT && guard++ < 6) {
      const gapH = gapHeight(run.score);
      if (run.spawned) run.gapY = nextGapY(run.gapY, gapH, run.rng, run.score);
      run.spawned = true;
      const seed = (run.rng() * 0x7fffffff) | 0;
      const variant = (run.rng() * 3) | 0;
      const tower = {
        x: run.nextX,
        gapY: run.gapY,
        gapH,
        scored: false,
        seed,
        variant,
      };
      if (run.pickupsEnabled && run.towers.length >= 1 && run.towers.length + 1 === run.nextPickupPipe) {
        const prev = run.towers[run.towers.length - 1];
        const id = PICKUP_IDS[(run.rng() * PICKUP_IDS.length) | 0];
        run.pickups.push({
          id: id,
          pipe: run.nextPickupPipe,
          x: (prev.x + tower.x) / 2 + VIS_W / 2,
          y: (prev.gapY + tower.gapY) / 2,
        });
        const span = C.PU_GAP_MAX - C.PU_GAP_MIN + 1;
        run.nextPickupPipe += C.PU_GAP_MIN + ((run.rng() * span) | 0);
      }
      run.towers.push(tower);
      run.nextX += spacingFor();
    }

    const p = run.player;
    for (let i = 0; i < run.towers.length; i++) {
      const t = run.towers[i];
      const cx = t.x + VIS_W / 2;
      if (!t.scored && cx < PLAYER_X) {
        t.scored = true;
        let gain = 1;
        if (effectLive(run, "nug_haze")) gain *= C.PU_HAZE_MULT;
        if (effectLive(run, "nug_24k") && run.active.armed) {
          gain = C.PU_NUG_BONUS;
          run.active = null;
        }
        run.score += gain;
        ev.scored = true;
        ev.gain = gain;
        ev.gapX = cx;
        ev.gapY = t.gapY;
        ev.gapH = t.gapH;
      }
    }

    if (run.pickups) {
      for (let i = run.pickups.length - 1; i >= 0; i--) {
        if (!playerHitsPickup(p.y, run.pickups[i])) continue;
        const id = run.pickups[i].id;
        grantPickup(run, id);
        ev.pickups.push(id);
        run.pickups.splice(i, 1);
      }
    }

    function shieldHit(kind) {
      if (effectLive(run, "gold_chip") && run.active.held && p.invuln <= 0) {
        run.active = { id: "gold_chip", popping: true, until: run.time + C.PU_IFRAME };
        p.invuln = C.PU_IFRAME;
        p.vy = FLAP_IMPULSE;
        if (kind === "ground") p.y = GROUND_Y - HITBOX_H / 2 - 6;
        ev.blocked = kind;
        return true;
      }
      return false;
    }

    if (p.invuln <= 0 && playerHitsGround(p.y)) {
      if (!shieldHit("ground")) {
        run.alive = false;
        ev.died = "ground";
      }
    } else if (p.invuln <= 0) {
      for (let i = 0; i < run.towers.length; i++) {
        const t = run.towers[i];
        if (t.x > PLAYER_X + 90 || t.x + VIS_W < PLAYER_X - 90) continue;
        if (playerHitsTower(p.y, t)) {
          if (!shieldHit("tower")) {
            run.alive = false;
            ev.died = "tower";
          }
          break;
        }
      }
    }

    if (run.towers.length > 8) {
      run.towers = run.towers.filter((t) => t.x + VIS_W > -60);
    }

    run.time += dt;
    return ev;
  }

  return {
    W,
    H,
    GROUND_H,
    GROUND_Y,
    PLAYER_X,
    START_Y,
    CEILING,
    CONFIG: C,
    GRAVITY,
    FLAP_IMPULSE,
    MAX_FALL,
    HITBOX_W,
    HITBOX_H,
    SPAWN_AT,
    VIS_W,
    COL_W,
    tipRadians,
    clamp,
    mulberry32,
    scrollSpeed,
    gapHeight,
    spacingFor,
    initialTowerX,
    runwaySeconds,
    maxGapStep,
    nextGapY,
    towerColliders,
    playerBox,
    playerHitsGround,
    playerHitsTower,
    createPlayer,
    stepPlayer,
    createRun,
    stepRun,
    grantPickup,
    PICKUP_IDS,
  };
});
