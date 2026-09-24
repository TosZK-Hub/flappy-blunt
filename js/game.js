/* Flappy Blunt — title, flight, and a one-tap restart. */
(function () {
  "use strict";

  const P = window.FBPhysics;
  const C = window.FBFeel.CONFIG;
  const Draw = window.FBDraw;
  const Sfx = window.FBAudio;
  const Meta = window.FBMeta;

  const BEST_KEY = "flappyblunt.best";
  const MUTE_KEY = "flappyblunt.mute";
  const SKIN_KEY = "flappyblunt.skin";
  const CLEAN_KEY = "flappyblunt.clean";
  const PLAYED_KEY = "flappyblunt.played";
  const STEP = 1 / 60;

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  const TITLE = "title";
  const PLAYING = "playing";
  const OVER = "over";

  let state = TITLE;
  let run = null;
  let best = loadNum(BEST_KEY);
  let bestAtRunStart = best;
  let newBest = false;
  let muted = loadMute();
  let flapQueued = false;
  let lock = 0;
  let deathFreeze = 0;
  let shake = 0;
  let settle = 0;
  let settleLife = 0;
  let flash = 0;
  let time = 0;
  let scroll = 0;
  let worldSpeed = 34;
  let scorePop = 1;
  let scoreFlip = 0;
  let skin = loadSkin();
  let cleanRun = loadClean();
  let playedOnce = loadPlayed();
  let overlay = null;
  let banked = 0;
  let shopHover = null;
  let shopFocus = skin;
  let shopWhisper = 0;
  let nugPop = 0;
  let jobsAtRun = null;
  const toasts = [];
  let showHitboxes = /(?:\?|&)hitbox=1(?:&|$)/.test(window.location.search);
  let reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    reduceMotion = false;
  }

  const particles = [];
  const rings = [];
  const floaters = [];
  let trailAcc = 0;
  let whiteFlash = 0;
  let pointer = null;
  let last = 0;
  let acc = 0;

  let layout = { vw: 1, vh: 1, dpr: 1, scale: 1, ox: 0, oy: 0, framed: false };

  Sfx.setMuted(muted);
  if (!Meta.owns(skin)) setSkin("default");

  function loadNum(key) {
    try {
      const n = parseInt(localStorage.getItem(key), 10);
      return Number.isFinite(n) && n > 0 ? n : 0;
    } catch (e) {
      return 0;
    }
  }

  function loadMute() {
    try {
      return localStorage.getItem(MUTE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function loadPlayed() {
    try {
      return localStorage.getItem(PLAYED_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function markPlayed() {
    if (playedOnce) return;
    playedOnce = true;
    try {
      localStorage.setItem(PLAYED_KEY, "1");
    } catch (e) {
      /* ignore */
    }
  }

  function loadClean() {
    const q = window.location.search;
    if (/(?:\?|&)clean=1(?:&|$)/.test(q)) return true;
    if (/(?:\?|&)clean=0(?:&|$)/.test(q)) return false;
    try {
      return localStorage.getItem(CLEAN_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setClean(on) {
    cleanRun = !!on;
    try {
      localStorage.setItem(CLEAN_KEY, cleanRun ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
  }

  function loadSkin() {
    try {
      const id = localStorage.getItem(SKIN_KEY);
      const skins = window.FBFeel.SKINS;
      for (let i = 0; i < skins.length; i++) if (skins[i].id === id) return id;
    } catch (e) {
      /* ignore */
    }
    return "default";
  }

  function setSkin(id) {
    if (!Meta.owns(id)) return;
    skin = id;
    try {
      localStorage.setItem(SKIN_KEY, id);
    } catch (e) {
      /* ignore */
    }
  }

  function cycleSkin(dir) {
    const skins = window.FBFeel.SKINS.filter(function (s) { return Meta.owns(s.id); });
    if (!skins.length) return;
    let i = 0;
    for (let k = 0; k < skins.length; k++) if (skins[k].id === skin) i = k;
    setSkin(skins[(i + dir + skins.length) % skins.length].id);
  }

  function claimReady() {
    const list = Meta.missions();
    for (let i = 0; i < list.length; i++) if (list[i].ready) return true;
    return false;
  }

  function jobSnap() {
    const list = Meta.missions();
    const snap = {};
    for (let i = 0; i < list.length; i++) snap[list[i].id] = list[i].progress;
    return snap;
  }

  function jobsProgressed() {
    if (!jobsAtRun) return false;
    const list = Meta.missions();
    for (let i = 0; i < list.length; i++) {
      if (list[i].progress > (jobsAtRun[list[i].id] || 0)) return true;
    }
    return false;
  }

  function showToast(text, seconds, front) {
    const life = seconds > 0 ? Math.min(seconds, 1.5) : 1.4;
    const item = { text: text, life: life, max: life, y: 148 };
    if (front) toasts.unshift(item);
    else toasts.push(item);
    if (toasts.length > 3) {
      if (front) toasts.pop();
      else toasts.shift();
    }
  }

  function popNugs() {
    nugPop = 1;
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI * 0.5 + (i - 2.5) * 0.42;
      spawn({
        kind: "leaf",
        x: 310,
        y: 36,
        vx: Math.cos(a) * (36 + Math.random() * 28),
        vy: -70 - Math.random() * 50,
        life: 0.55,
        max: 0.55,
        size: 0.72,
        rot: Math.random() * 6,
        spin: (Math.random() - 0.5) * 7,
        front: true,
        scroll: false,
        hud: true,
        grav: 220,
      });
    }
  }

  function onShopCard(id) {
    if (!id) return;
    shopFocus = id;
    if (Meta.owns(id)) {
      setSkin(id);
      return;
    }
    const result = Meta.buy(id);
    if (result === "bought") {
      setSkin(id);
      Sfx.score();
      return;
    }
    if (result === "broke") shopWhisper = 2.2;
  }

  function saveBest(n) {
    try {
      localStorage.setItem(BEST_KEY, String(n));
    } catch (e) {
      /* private mode */
    }
  }

  function titlePose(t) {
    const phase = t * 2.15;
    const bob = Math.sin(phase);
    const rising = Math.cos(phase) < 0;
    return {
      y: P.START_Y + bob * 10,
      rot: window.FBFeel.tipRadians(rising ? C.FLAP_TIP_DEG : C.FALL_TIP_DEG),
      sx: 1,
      sy: 1,
      dead: false,
      spin: 0,
      skin: skin,
    };
  }

  function rankFor(score) {
    if (score >= 25) return "haze legend";
    if (score >= 15) return "cloud chaser";
    if (score >= 8) return "nicely cruising";
    if (score >= 3) return "finding the rhythm";
    if (score >= 1) return "first puff";
    return "snuffed out";
  }

  function layoutNow() {
    const vv = window.visualViewport;
    const vw = vv ? vv.width : window.innerWidth;
    const vh = vv ? vv.height : window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pad = Math.min(vw, vh) > 780 ? 32 : 0;
    const scale = Math.min((vw - pad * 2) / P.W, (vh - pad * 2) / P.H);
    layout = {
      vw: vw,
      vh: vh,
      dpr: dpr,
      scale: scale,
      ox: (vw - P.W * scale) / 2,
      oy: (vh - P.H * scale) / 2,
      framed: pad > 0,
    };
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";
  }

  function toGame(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - layout.ox) / layout.scale,
      y: (e.clientY - rect.top - layout.oy) / layout.scale,
    };
  }

  function hitMute(pt) {
    const m = Draw.mutePos();
    const dx = pt.x - m.x;
    const dy = pt.y - m.y;
    return dx * dx + dy * dy <= (m.r + 8) * (m.r + 8);
  }

  function toggleMute() {
    muted = !muted;
    Sfx.setMuted(muted);
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
  }

  function goHome() {
    state = TITLE;
    overlay = null;
    run = null;
    lock = 0;
    deathFreeze = 0;
    flapQueued = false;
    flash = 0;
    whiteFlash = 0;
    shake = 0;
    settle = 0;
    settleLife = 0;
    particles.length = 0;
    rings.length = 0;
    floaters.length = 0;
    scorePop = 1;
    scoreFlip = 0;
  }

  function startPlaying() {
    markPlayed();
    jobsAtRun = jobSnap();
    bestAtRunStart = best;
    newBest = false;
    run = P.createRun(undefined, { pickups: !cleanRun });
    state = PLAYING;
    lock = 0;
    deathFreeze = 0;
    flapQueued = true;
    shake = 0;
    settle = 0;
    settleLife = 0;
    whiteFlash = 0;
    rings.length = 0;
    floaters.length = 0;
  }

  function press() {
    Sfx.unlock();
    if (state === TITLE) startPlaying();
    else if (state === PLAYING) flapQueued = true;
    else if (lock <= 0) startPlaying();
    else flapQueued = true;
  }

  function spawn(opts) {
    particles.push(opts);
    if (particles.length > 180) particles.splice(0, particles.length - 180);
  }

  function onFlap(player) {
    player.emberKick = time;
    Sfx.flap();
    const Pal = window.FBFeel.PALETTE;
    const body = window.FBFeel.bodyDraw();
    const ang = player.rot || 0;
    const tipX = P.PLAYER_X + Math.cos(ang) * (body.L * 0.46);
    const tipY = player.y + Math.sin(ang) * (body.L * 0.46);
    const span = C.SPARK_MAX - C.SPARK_MIN + 1;
    const n = C.SPARK_MIN + Math.floor(Math.random() * span);
    for (let i = 0; i < n; i++) {
      const a = ang + (Math.random() - 0.5) * 1.1;
      const sp = 50 + Math.random() * 80;
      spawn({
        kind: "ember",
        x: tipX,
        y: tipY,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 16,
        life: 0.14 + Math.random() * 0.06,
        max: 0.2,
        size: 1.5 + Math.random() * 0.8,
        front: true,
        scroll: true,
        color: i % 2 ? Pal.HOT : Pal.EMBER,
      });
    }
  }

  function burstAt(x, y, kind, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 30 + Math.random() * 90;
      spawn({
        kind: kind,
        x: x,
        y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.4 + Math.random() * 0.3,
        max: 0.7,
        size: 3 + Math.random() * 3,
        rot: Math.random() * 6,
        spin: (Math.random() - 0.5) * 8,
        front: true,
        scroll: true,
        color: window.FBFeel.PALETTE.EMBER,
      });
    }
  }

  function onScore(ev) {
    scorePop = 1.15;
    scoreFlip = 0.12;
    const Pal = window.FBFeel.PALETTE;
    const nSpark = reduceMotion ? 3 : 6;
    for (let i = 0; i < nSpark; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      spawn({
        kind: "ember",
        x: P.W / 2 + (Math.random() - 0.5) * 108,
        y: 104 + (Math.random() - 0.5) * 18,
        vx: Math.cos(a) * (20 + Math.random() * 30),
        vy: -24 - Math.random() * 40,
        life: 0.12,
        max: 0.12,
        size: 1.8,
        front: true,
        scroll: false,
        hud: true,
        grav: -20,
        color: Pal.GOLD,
      });
    }
    const grant = Meta.notePipe();
    Meta.noteScore(run.score);
    if (grant > 0) {
      showToast("Five clear. +25 nugs", 1.5);
      popNugs();
    }
    Sfx.score();
    rings.push({ x: ev.gapX, y: ev.gapY, radius: 14, life: 0.5, max: 0.5 });
    floaters.push({ text: "+" + (ev.gain || 1), x: ev.gapX + 24, y: ev.gapY, life: 0.7, max: 0.7, vy: -42 });
    const half = (ev.gapH || C.GAP_START) / 2;
    const n = reduceMotion ? 2 : 3;
    burstAt(ev.gapX, ev.gapY - half, "spark", n);
    burstAt(ev.gapX, ev.gapY + half, "spark", n);
    if (run.score > best) {
      best = run.score;
      newBest = true;
      saveBest(best);
    }
    if (run.score >= 15 && Meta.armHeist()) showToast("Heist warming up", 1.5);
  }

  function onPickup(id) {
    Sfx.score();
    const list = window.FBFeel.PICKUPS;
    let blurb = id;
    for (let i = 0; i < list.length; i++) if (list[i].id === id) blurb = list[i].blurb;
    floaters.push({
      text: blurb,
      x: P.PLAYER_X + 36,
      y: run.player.y - 28,
      life: 0.8,
      max: 0.8,
      vy: -36,
    });
  }

  function emitTrail(player, dt) {
    const skins = window.FBFeel.SKINS;
    const Pal = window.FBFeel.PALETTE;
    let color = "#C084FC";
    for (let i = 0; i < skins.length; i++) if (skins[i].id === skin) color = skins[i].trail;
    const active = run && run.active;
    const id = active && !active.popping ? active.id : "";
    let mode = "skin";
    if (id === "dab_rocket") mode = "jet";
    else if (id === "magic_gummies") mode = "haze";
    else if (id === "trail_can") mode = "can";
    const rate = mode === "jet" ? 46 : mode === "haze" ? 20 : mode === "can" ? 34 : 14;
    trailAcc += dt * (reduceMotion ? rate * 0.35 : rate);
    const ang = player.rot || 0;
    const backX = P.PLAYER_X - Math.cos(ang) * 34;
    const backY = player.y - Math.sin(ang) * 34;
    while (trailAcc >= 1) {
      trailAcc -= 1;
      if (mode === "jet") {
        spawn({
          kind: "ember",
          x: backX + (Math.random() - 0.5) * 4,
          y: backY + (Math.random() - 0.5) * 6,
          vx: -170 - Math.random() * 90,
          vy: (Math.random() - 0.5) * 20,
          life: 0.2,
          max: 0.2,
          size: 3.2,
          front: false,
          scroll: true,
          color: Math.random() < 0.55 ? Pal.CYAN : Pal.HOT,
        });
      } else if (mode === "haze") {
        const hue = (time * 120) % 360;
        spawn({
          kind: "smoke",
          x: backX,
          y: backY,
          vx: -14,
          vy: -4,
          life: 0.25,
          max: 0.25,
          size: 6,
          front: false,
          scroll: true,
          color: "hsl(" + hue.toFixed(0) + ", 52%, 74%)",
        });
      } else if (mode === "can") {
        const hue = (time * 260) % 360;
        spawn({
          kind: "smoke",
          x: backX,
          y: backY,
          vx: -28,
          vy: -10,
          life: 0.25,
          max: 0.25,
          size: 5,
          front: false,
          scroll: true,
          color: "hsl(" + hue.toFixed(0) + ", 92%, 58%)",
        });
      } else {
        spawn({
          kind: "smoke",
          x: backX,
          y: backY,
          vx: -20,
          vy: -8,
          life: 0.25,
          max: 0.25,
          size: 4,
          front: false,
          scroll: true,
          color: color,
        });
      }
    }
  }

  function shatterHex(y) {
    const n = reduceMotion ? 4 : 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.2;
      spawn({
        kind: "hex",
        x: P.PLAYER_X + Math.cos(a) * 16,
        y: y + Math.sin(a) * 10,
        vx: Math.cos(a) * (60 + Math.random() * 50),
        vy: Math.sin(a) * (50 + Math.random() * 40) - 16,
        life: 0.4,
        max: 0.4,
        size: 6 + Math.random() * 4,
        rot: a,
        spin: (Math.random() - 0.5) * 8,
        front: true,
        scroll: false,
        grav: 40,
        color: window.FBFeel.PALETTE.GOLD,
      });
    }
  }

  function onDie(kind) {
    state = OVER;
    deathFreeze = C.DEATH_FREEZE;
    lock = C.DEATH_FREEZE + C.DEATH_BEAT;
    shake = 0;
    settle = 3.5;
    settleLife = 0.12;
    rings.push({ x: P.PLAYER_X, y: run.player.y, radius: 6, life: 0.4, max: 0.4 });
    flash = 1;
    run.player.dead = true;
    run.player.spin = 0;
    run.player.sx = 1.06;
    run.player.sy = 0.94;
    if (kind === "ground") run.player.vy = -260;
    else run.player.vy = Math.max(80, run.player.vy * 0.2);
    const scored = run.score || 0;
    Meta.noteDeath(scored);
    Meta.addNugs(scored);
    banked = scored;
    if (jobsProgressed()) showToast("Job +1", 1.4, true);
    Sfx.crash();
    if (newBest) Sfx.fanfare();
    const Pal = window.FBFeel.PALETTE;
    const held = run.active && run.active.id === "gold_chip" && (run.active.held || run.active.popping);
    if (held) shatterHex(run.player.y);
    const n = reduceMotion ? 6 : 14;
    for (let i = 0; i < n; i++) {
      spawn({
        kind: "dust",
        x: P.PLAYER_X + (Math.random() - 0.5) * 22,
        y: run.player.y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 36,
        vy: -16 - Math.random() * 70,
        life: 0.26 + Math.random() * 0.14,
        max: 0.4,
        size: 2.2 + Math.random() * 2.8,
        front: true,
        scroll: false,
        grav: -36,
        color: i % 6 === 0 ? Pal.EMBER : Pal.ASH,
      });
    }
  }

  function updateFx(dt) {
    if (shopWhisper > 0) shopWhisper = Math.max(0, shopWhisper - dt);
    if (nugPop > 0) nugPop = Math.max(0, nugPop - dt / 0.4);
    if (toasts.length) {
      toasts[0].life -= dt;
      if (toasts[0].life <= 0) toasts.shift();
    }
    const shift = worldSpeed * dt;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      if (p.scroll) p.x -= shift;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const grav = p.grav != null ? p.grav : p.kind === "smoke" ? -10 : 30;
      p.vy += grav * dt;
      if (p.rot != null) p.rot += (p.spin || 0) * dt;
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.life -= dt;
      r.radius += 90 * dt;
      r.x -= shift;
      if (r.life <= 0) rings.splice(i, 1);
    }
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      f.life -= dt;
      f.y += f.vy * dt;
      f.x -= shift;
      if (f.life <= 0) floaters.splice(i, 1);
    }
    if (shake > 0) shake = 0;
    if (settleLife > 0) {
      settleLife = Math.max(0, settleLife - dt);
      if (settleLife === 0) settle = 0;
    }
    if (flash > 0) flash = Math.max(0, flash - dt / C.HIT_FLASH);
    if (whiteFlash > 0) whiteFlash = Math.max(0, whiteFlash - dt / 0.08);
    scorePop += (1 - scorePop) * (1 - Math.exp(-16 * dt));
    if (scoreFlip > 0) scoreFlip = Math.max(0, scoreFlip - dt);
  }

  function update(dt) {
    time += dt;

    if (state === TITLE) {
      worldSpeed = 34;
      scroll += worldSpeed * dt;
      updateFx(dt);
      return;
    }

    if (state === OVER) {
      worldSpeed = 0;
      if (deathFreeze > 0) deathFreeze -= dt;
      else if (run) P.stepPlayer(run.player, dt, false, true);
      lock -= dt;
      if (lock <= 0 && flapQueued) startPlaying();
    }

    if (state === PLAYING && run) {
      const flap = flapQueued;
      flapQueued = false;
      const before = run.player;
      const ev = P.stepRun(run, dt, flap);
      worldSpeed = P.scrollSpeed(run.score);
      if (run.active && run.active.id === "dab_rocket" && !run.active.popping) {
        worldSpeed *= C.PU_ROCKET_MULT;
      }
      scroll += worldSpeed * dt;
      if (flap) onFlap(before);
      if (ev.scored) onScore(ev);
      if (ev.pickups) {
        for (let i = 0; i < ev.pickups.length; i++) onPickup(ev.pickups[i]);
      }
      if (ev.blocked) {
        whiteFlash = 1;
        shatterHex(run.player.y);
      }
      if (ev.died) onDie(ev.died);
      if (state === PLAYING) emitTrail(run.player, dt);
    }

    updateFx(dt);
  }

  function render() {
    layoutNow();
    const dpr = layout.dpr;
    const bw = Math.max(1, Math.round(layout.vw * dpr));
    const bh = Math.max(1, Math.round(layout.vh * dpr));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#100812";
    ctx.fillRect(0, 0, layout.vw, layout.vh);

    if (layout.framed) {
      const g = ctx.createRadialGradient(
        layout.vw / 2,
        layout.vh / 2,
        20,
        layout.vw / 2,
        layout.vh / 2,
        Math.max(layout.vw, layout.vh) * 0.55
      );
      g.addColorStop(0, "rgba(92, 42, 120, 0.35)");
      g.addColorStop(1, "rgba(16, 8, 18, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, layout.vw, layout.vh);
    }

    ctx.save();
    ctx.translate(layout.ox, layout.oy);
    ctx.scale(layout.scale, layout.scale);

    Draw.setChrome(time, pointer);
    const radius = layout.framed ? 28 : 0;
    ctx.save();
    Draw.clipRound(ctx, 0, 0, P.W, P.H, radius);
    ctx.clip();

    ctx.save();
    if (settleLife > 0) ctx.translate(0, settle * (settleLife / 0.12));

    const player = state === TITLE || !run ? titlePose(time) : run.player;
    player.skin = skin;
    player.ash = state === OVER && flash <= 0;
    const heldChip = run && run.active && run.active.id === "gold_chip" && run.active.held && !run.active.popping;
    player.shield = state === PLAYING && !!heldChip;
    Draw.drawBackground(ctx, scroll, time);
    Draw.drawParticles(ctx, particles, false);
    if (state === TITLE) Draw.drawHomeWorld(ctx, scroll, time);
    if (run && state !== TITLE) {
      Draw.drawTowers(ctx, run.towers, time);
      if (run.pickups) {
        for (let i = 0; i < run.pickups.length; i++) Draw.drawPickup(ctx, run.pickups[i], time);
      }
    }
    Draw.drawGround(ctx, scroll);
    if (state !== TITLE) Draw.drawShadow(ctx, player);
    Draw.drawRings(ctx, rings);
    if (state !== TITLE) Draw.drawPlayer(ctx, player, time);
    Draw.drawParticles(ctx, particles, true);
    Draw.drawFloaters(ctx, floaters);
    ctx.restore();

    if (state === TITLE) {
      Draw.drawTitle(ctx, {
        time: time,
        best: best,
        skin: skin,
        rot: player.rot,
        whisper: !playedOnce,
        equippedRing: Meta.ownedCount() >= 2,
      });
      if (!overlay) Draw.drawMenu(ctx, "title", claimReady());
    } else if (state === PLAYING && run) {
      Draw.drawHUD(ctx, { score: run.score, pop: scorePop, flip: scoreFlip });
      Draw.drawBuffs(ctx, run.active, cleanRun);
    } else if (state === OVER && run && deathFreeze <= 0) {
      const ready = lock <= 0;
      const hintAlpha = ready ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(time * 4)) : 0.35;
      Draw.drawGameOver(ctx, {
        score: run.score,
        best: best,
        newBest: newBest,
        rank: rankFor(run.score),
        hintAlpha: hintAlpha,
        ready: ready,
        banked: banked,
      });
      if (!overlay) Draw.drawMenu(ctx, "over", claimReady());
    }

    Draw.drawFlash(ctx, flash, P.PLAYER_X, player.y);
    Draw.drawWhite(ctx, whiteFlash);
    Draw.drawVignette(ctx);
    if (overlay === "shop") {
      Draw.drawShop(ctx, {
        nugs: Meta.nugs(),
        skin: skin,
        time: time,
        hover: shopHover,
        focus: shopFocus,
        whisper: shopWhisper > 0,
        reduceMotion: reduceMotion,
        owns: function (id) { return Meta.owns(id); },
      });
    } else if (overlay === "jobs") {
      Draw.drawJobs(ctx);
    }
    Draw.drawNugs(ctx, Meta.nugs(), nugPop);
    Draw.drawParticles(ctx, particles, true, true);
    if (!overlay && toasts.length) {
      const item = toasts[0];
      item.y = state === OVER ? 132 : state === TITLE ? 248 : 168;
      Draw.drawToast(ctx, item);
    }
    Draw.drawMute(ctx, muted);
    if (showHitboxes && run && state !== TITLE) Draw.drawDebug(ctx, run);

    ctx.restore();

    if (layout.framed) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(244, 232, 193, 0.28)";
      Draw.pathRound(ctx, 0, 0, P.W, P.H, radius);
      ctx.stroke();
    }
    ctx.restore();
  }

  function frame(now) {
    if (!last) last = now;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.1) dt = 0.1;
    if (dt < 0) dt = 0;
    acc += dt;
    let steps = 0;
    while (acc >= STEP && steps < 4) {
      update(STEP);
      acc -= STEP;
      steps += 1;
    }
    if (steps === 4) acc = 0;
    render();
    requestAnimationFrame(frame);
  }

  window.addEventListener("pointerdown", function (e) {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    const pt = toGame(e);
    pointer = pt;
    if (overlay === "shop") {
      const hit = Draw.shopHit(pt);
      if (hit && hit.action === "close") overlay = null;
      else if (hit && hit.action === "card") onShopCard(hit.id);
      return;
    }
    if (overlay === "jobs") {
      const hit = Draw.jobsHit(pt);
      if (hit && hit.action === "close") overlay = null;
      else if (hit && hit.action === "claim") {
        if (Meta.claim(hit.id)) {
          Sfx.score();
          popNugs();
        }
      }
      return;
    }
    if (hitMute(pt)) {
      toggleMute();
      return;
    }
    if (state === TITLE || (state === OVER && deathFreeze <= 0)) {
      const menu = Draw.menuHit(pt, state === OVER ? "over" : "title");
      if (menu === "home") {
        goHome();
        return;
      }
      if (menu) {
        overlay = menu;
        if (menu === "shop") {
          shopFocus = skin;
          shopHover = null;
          shopWhisper = 0;
        }
        return;
      }
    }
    if (state === TITLE) {
      if (Draw.playHit(pt)) press();
      return;
    }
    press();
  }, { passive: false });

  window.addEventListener("pointermove", function (e) {
    if (overlay !== "shop") {
      shopHover = null;
      return;
    }
    const pt = toGame(e);
    const hit = Draw.shopHit(pt);
    if (hit && hit.action === "card") {
      shopHover = hit.id;
      shopFocus = hit.id;
    } else {
      shopHover = null;
    }
  });

  window.addEventListener("pointerup", function () {
    pointer = null;
  });
  window.addEventListener("pointercancel", function () {
    pointer = null;
  });

  const held = Object.create(null);

  window.addEventListener("keydown", function (e) {
    if (e.repeat || held[e.code]) return;
    held[e.code] = true;
    if (overlay) {
      if (overlay === "shop" && (e.code === "ArrowLeft" || e.code === "ArrowRight")) {
        e.preventDefault();
        const skins = window.FBFeel.SKINS;
        let i = 0;
        for (let k = 0; k < skins.length; k++) if (skins[k].id === shopFocus) i = k;
        const dir = e.code === "ArrowRight" ? 1 : -1;
        shopFocus = skins[(i + dir + skins.length) % skins.length].id;
        shopHover = null;
        return;
      }
      if (overlay === "shop" && e.code === "Enter") {
        e.preventDefault();
        onShopCard(shopFocus);
        return;
      }
      if (e.code === "Escape" || e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        overlay = null;
      }
      return;
    }
    if (e.code === "KeyM") {
      toggleMute();
      return;
    }
    if (e.code === "KeyH") {
      showHitboxes = !showHitboxes;
      return;
    }
    if (e.code === "KeyK") {
      if (state === TITLE) setClean(!cleanRun);
      return;
    }
    if (e.code === "KeyQ" || e.code === "BracketLeft") {
      cycleSkin(-1);
      return;
    }
    if (e.code === "KeyE" || e.code === "BracketRight" || e.code === "KeyC") {
      cycleSkin(1);
      return;
    }
    if (e.code.indexOf("Digit") === 0) {
      const n = parseInt(e.code.slice(5), 10);
      const skins = window.FBFeel.SKINS;
      if (n >= 1 && n <= skins.length && Meta.owns(skins[n - 1].id)) {
        setSkin(skins[n - 1].id);
        return;
      }
    }
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      press();
    }
  });

  window.addEventListener("keyup", function (e) {
    held[e.code] = false;
  });

  window.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  function releaseKeys() {
    for (const k in held) held[k] = false;
  }

  document.addEventListener("visibilitychange", function () {
    last = 0;
    acc = 0;
    if (document.hidden) releaseKeys();
  });
  window.addEventListener("blur", releaseKeys);

  window.addEventListener("resize", layoutNow);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", layoutNow);

  function boot() {
    layoutNow();
    render();
    const start = function () {
      const splash = document.getElementById("splash");
      if (splash) {
        splash.classList.add("is-gone");
        setTimeout(function () {
          if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 260);
      }
      requestAnimationFrame(frame);
    };
    if (document.fonts && document.fonts.load) {
      Promise.race([
        document.fonts.load('64px "Lilita One"'),
        document.fonts.load('32px Anton'),
        new Promise(function (resolve) {
          setTimeout(resolve, 1200);
        }),
      ]).then(start, start);
    } else {
      start();
    }
  }

  boot();
})();
