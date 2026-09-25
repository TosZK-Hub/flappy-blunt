/* Flappy Blunt — one flap, township sunset, chest costumes. */
(function () {
  "use strict";

  const P = window.FBPhysics;
  const C = window.FBFeel.CONFIG;
  const Feel = window.FBFeel;
  const Draw = window.FBDraw;
  const Sfx = window.FBAudio;
  const Meta = window.FBMeta;

  const BEST_KEY = "flappyblunt.best";
  const MUTE_KEY = "flappyblunt.mute";
  const SKIN_KEY = "flappyblunt.skin";
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
  let newBest = false;
  let muted = loadMute();
  let flapQueued = false;
  let lock = 0;
  let deathFreeze = 0;
  let settle = 0;
  let settleLife = 0;
  let flash = 0;
  let time = 0;
  let scroll = 0;
  let worldSpeed = 34;
  let scorePop = 1;
  let scoreFlip = 0;
  let skin = loadSkin();
  let playedOnce = loadPlayed();
  let overlay = null;
  let reveal = null;
  let banked = 0;
  let jobClaim = false;
  let coinPopDur = 0.4;
  let coinPop = 0;
  let chestWhisper = 0;
  let jobsAtRun = null;
  let skimFlash = null;
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
  if (!Meta.owns(skin)) setSkin("starter_tee");

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

  function loadSkin() {
    try {
      const id = localStorage.getItem(SKIN_KEY);
      if (id === "default") return "starter_tee";
      const list = Feel.COSTUMES;
      for (let i = 0; i < list.length; i++) if (list[i].id === id) return id;
    } catch (e) {
      /* ignore */
    }
    return "starter_tee";
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
    const list = Feel.COSTUMES.filter(function (s) { return Meta.owns(s.id); });
    if (!list.length) return;
    let i = 0;
    for (let k = 0; k < list.length; k++) if (list[k].id === skin) i = k;
    setSkin(list[(i + dir + list.length) % list.length].id);
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

  function jobCompletedThisRun() {
    if (!jobsAtRun) return false;
    const list = Meta.missions();
    for (let i = 0; i < list.length; i++) {
      const before = jobsAtRun[list[i].id] || 0;
      if (list[i].ready && before < list[i].goal) return true;
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

  function popCoins(seconds) {
    const dur = seconds > 0 ? seconds : 0.4;
    coinPop = 1;
    coinPopDur = dur;
    const life = seconds > 0 ? dur : 0.55;
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI * 0.5 + (i - 2.5) * 0.42;
      spawn({
        kind: "coin",
        x: 330,
        y: 36,
        vx: Math.cos(a) * (30 + Math.random() * 24),
        vy: -64 - Math.random() * 40,
        life: life,
        max: life,
        size: 0.7,
        rot: Math.random() * 6,
        spin: (Math.random() - 0.5) * 6,
        front: true,
        scroll: false,
        hud: true,
        grav: 180,
      });
    }
  }

  function showStreak() {
    const msg = Meta.takeStreakToast();
    if (msg) showToast(msg, 1.5);
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
    const rising = Math.cos(phase) < 0;
    return {
      y: P.START_Y + Math.sin(phase) * 6.5,
      rot: Feel.tipRadians(rising ? C.FLAP_TIP_DEG : C.FALL_TIP_DEG),
      sx: 1,
      sy: 1,
      dead: false,
      skin: skin,
    };
  }

  function rankFor(score) {
    if (score >= 50) return "Legend";
    if (score >= 25) return "Squad";
    if (score >= 10) return "Rookie";
    return "Lekker try";
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

  function openChests() {
    overlay = "chests";
    chestWhisper = 0;
    reveal = null;
  }

  function openCollection() {
    overlay = "collection";
    reveal = null;
  }

  function goHome() {
    state = TITLE;
    overlay = null;
    reveal = null;
    jobClaim = false;
    run = null;
    lock = 0;
    deathFreeze = 0;
    flapQueued = false;
    flash = 0;
    whiteFlash = 0;
    settle = 0;
    settleLife = 0;
    skimFlash = null;
    particles.length = 0;
    rings.length = 0;
    floaters.length = 0;
    scorePop = 1;
    scoreFlip = 0;
    showStreak();
  }

  function startPlaying() {
    markPlayed();
    jobClaim = false;
    jobsAtRun = jobSnap();
    newBest = false;
    const streakGrant = Meta.noteRun();
    run = P.createRun();
    state = PLAYING;
    overlay = null;
    reveal = null;
    lock = 0;
    deathFreeze = 0;
    flapQueued = true;
    settle = 0;
    settleLife = 0;
    whiteFlash = 0;
    skimFlash = null;
    rings.length = 0;
    floaters.length = 0;
    if (streakGrant) popCoins(0.35);
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
    player.flapAt = time;
    Sfx.flap();
    const body = Feel.bodyDraw();
    const ang = player.rot || 0;
    const tipX = P.PLAYER_X + Math.cos(ang) * (body.L * 0.42);
    const tipY = player.y + Math.sin(ang) * (body.L * 0.42);
    const span = C.SPARK_MAX - C.SPARK_MIN + 1;
    const n = C.SPARK_MIN + Math.floor(Math.random() * span);
    for (let i = 0; i < n; i++) {
      const a = ang + (Math.random() - 0.5) * 1.1;
      const sp = 40 + Math.random() * 70;
      spawn({
        kind: "ember",
        x: tipX,
        y: tipY,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 12,
        life: 0.14 + Math.random() * 0.06,
        max: 0.2,
        size: 1.6 + Math.random() * 0.8,
        front: true,
        scroll: true,
        color: i % 2 ? Feel.PALETTE.HOT : Feel.PALETTE.EMBER,
      });
    }
  }

  function onScore(ev) {
    scorePop = 1.15;
    scoreFlip = 0.12;
    const nSpark = reduceMotion ? 3 : 6;
    for (let i = 0; i < nSpark; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      spawn({
        kind: "ember",
        x: P.W / 2 + (Math.random() - 0.5) * 90,
        y: 100,
        vx: Math.cos(a) * (18 + Math.random() * 24),
        vy: -20 - Math.random() * 30,
        life: 0.16,
        max: 0.16,
        size: 1.6,
        front: true,
        scroll: false,
        hud: true,
        grav: -10,
        color: Feel.PALETTE.GOLD,
      });
    }
    const grant = Meta.notePipe();
    Meta.noteScore(run.score);
    if (grant > 0) {
      showToast("Five clear. +25 coins", 1.5);
      popCoins();
    }
    Sfx.score();
    rings.push({ x: ev.gapX, y: ev.gapY, radius: 14, life: 0.45, max: 0.45 });
    floaters.push({ text: "+1", x: ev.gapX + 20, y: ev.gapY, life: 0.55, max: 0.55, vy: -36 });
    if (ev.near && (run.skim || 0) < C.SKIM_CAP) {
      run.skim = (run.skim || 0) + 1;
      skimFlash = { a: 1, x: ev.gapX, y: ev.gapY, h: ev.gapH };
      floaters.push({
        text: "+1",
        x: ev.gapX + 28,
        y: ev.gapY - 22,
        life: 0.5,
        max: 0.5,
        vy: -28,
        color: Feel.PALETTE.GOLD,
      });
    }
    if (run.score > best) {
      best = run.score;
      newBest = true;
      saveBest(best);
    }
    if (run.score === 10) showToast("Rookie", 1.2);
    else if (run.score === 15 || run.score === 30) showToast("Heat up", 0.4);
    else if (run.score === 25) showToast("Squad", 1.2);
    else if (run.score === 50) showToast("Legend", 1.2);
  }

  function emitTrail(player, dt) {
    const costume = Feel.costumeById(skin);
    const color = costume.trail || Feel.PALETTE.CREAM;
    trailAcc += dt * (reduceMotion ? 5 : 14);
    const ang = player.rot || 0;
    const backX = P.PLAYER_X - Math.cos(ang) * 36;
    const backY = player.y - Math.sin(ang) * 36;
    while (trailAcc >= 1) {
      trailAcc -= 1;
      spawn({
        kind: "smoke",
        x: backX,
        y: backY,
        vx: -18,
        vy: -6,
        life: 0.25,
        max: 0.25,
        size: 4.5,
        front: false,
        scroll: true,
        color: color,
      });
    }
  }

  function onDie(kind) {
    state = OVER;
    deathFreeze = C.DEATH_FREEZE;
    lock = C.DEATH_FREEZE + C.DEATH_BEAT;
    settle = 3.5;
    settleLife = 0.12;
    whiteFlash = 1;
    rings.push({ x: P.PLAYER_X, y: run.player.y, radius: 6, life: 0.4, max: 0.4 });
    flash = 1;
    run.player.dead = true;
    run.player.spin = 0;
    if (kind === "ground") run.player.vy = -260;
    else run.player.vy = Math.max(80, run.player.vy * 0.2);
    const scored = run.score || 0;
    const skim = run.skim || 0;
    Meta.noteDeath(scored);
    banked = scored + skim;
    Meta.addCoins(banked);
    jobClaim = jobCompletedThisRun();
    if (jobsProgressed() && !jobClaim) showToast("Challenge +1", 1.4, true);
    popCoins(0.3);
    Sfx.crash();
    if (newBest) Sfx.fanfare();
    const n = reduceMotion ? 6 : 12;
    for (let i = 0; i < n; i++) {
      spawn({
        kind: "dust",
        x: P.PLAYER_X + (Math.random() - 0.5) * 24,
        y: run.player.y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 36,
        vy: -16 - Math.random() * 60,
        life: 0.26 + Math.random() * 0.12,
        max: 0.4,
        size: 2.2 + Math.random() * 2.4,
        front: true,
        scroll: false,
        grav: -30,
        color: i % 5 === 0 ? Feel.PALETTE.EMBER : Feel.PALETTE.ASH,
      });
    }
  }

  function finishReveal(equip) {
    if (!reveal || !reveal.result) {
      reveal = null;
      return;
    }
    const result = reveal.result;
    if (equip && result.id) setSkin(result.id);
    if (result.dupe) showToast("Duplicate · +" + result.refund + " coins", 1.5);
    if (result.full) {
      showToast("Full kit", 1.5);
      popCoins();
    } else if (result.dupe) popCoins(0.35);
    reveal = null;
  }

  function onOpenChest(id) {
    if (reveal) return;
    const result = Meta.open(id);
    if (result.error === "broke") {
      chestWhisper = 2.2;
      return;
    }
    if (!result.ok) return;
    Sfx.score();
    reveal = { life: 0.6, result: result };
  }

  function onCollectionCard(id) {
    if (Meta.owns(id)) {
      setSkin(id);
      return;
    }
    openChests();
  }

  function updateFx(dt) {
    if (chestWhisper > 0) chestWhisper = Math.max(0, chestWhisper - dt);
    if (coinPop > 0) coinPop = Math.max(0, coinPop - dt / (coinPopDur || 0.4));
    if (reveal && reveal.life > 0) reveal.life = Math.max(0, reveal.life - dt);
    if (skimFlash && skimFlash.a > 0) skimFlash.a = Math.max(0, skimFlash.a - dt / 0.1);
    if (toasts.length && !overlay) {
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
      scroll += worldSpeed * dt;
      if (flap) onFlap(before);
      if (ev.scored) onScore(ev);
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
    ctx.fillStyle = "#063024";
    ctx.fillRect(0, 0, layout.vw, layout.vh);

    if (layout.framed) {
      const g = ctx.createRadialGradient(
        layout.vw / 2, layout.vh / 2, 20,
        layout.vw / 2, layout.vh / 2, Math.max(layout.vw, layout.vh) * 0.55
      );
      g.addColorStop(0, "rgba(255, 179, 106, 0.16)");
      g.addColorStop(1, "rgba(6, 48, 36, 0)");
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
    Draw.drawBackground(ctx, scroll, time);
    Draw.drawParticles(ctx, particles, false);
    if (state === TITLE) Draw.drawHomeWorld(ctx, scroll, time);
    if (run && state !== TITLE) Draw.drawTowers(ctx, run.towers, time);
    Draw.drawGround(ctx, scroll, time);
    if (state !== TITLE) Draw.drawShadow(ctx, player);
    Draw.drawRings(ctx, rings);
    if (state !== TITLE) Draw.drawPlayer(ctx, player, time);
    Draw.drawParticles(ctx, particles, true);
    Draw.drawFloaters(ctx, floaters);
    if (skimFlash) Draw.drawSkim(ctx, skimFlash);
    ctx.restore();

    if (state === TITLE) {
      Draw.drawTitle(ctx, {
        time: time,
        best: best,
        skin: skin,
        rot: player.rot,
        whisper: !playedOnce,
        equippedRing: Meta.ownedCount() >= 2,
        owns: function (id) { return Meta.owns(id); },
      });
      if (!overlay) Draw.drawMenu(ctx, "title", claimReady());
    } else if (state === PLAYING && run) {
      Draw.drawHUD(ctx, { score: run.score, pop: scorePop, flip: scoreFlip });
    } else if (state === OVER && run && deathFreeze <= 0) {
      const ready = lock <= 0;
      Draw.drawGameOver(ctx, {
        score: run.score,
        best: best,
        newBest: newBest,
        rank: rankFor(run.score),
        ready: ready,
        banked: banked,
        jobClaim: jobClaim,
      });
      if (!overlay) Draw.drawMenu(ctx, "over", claimReady());
    }

    Draw.drawFlash(ctx, flash, P.PLAYER_X, player.y);
    Draw.drawWhite(ctx, whiteFlash);
    Draw.drawVignette(ctx);
    if (overlay === "chests") {
      Draw.drawChests(ctx, { coins: Meta.coins(), time: time, whisper: chestWhisper > 0 });
      if (reveal) Draw.drawReveal(ctx, { result: reveal.result, life: reveal.life, time: time });
    } else if (overlay === "collection") {
      Draw.drawCollectionPanel(ctx, {
        skin: skin,
        time: time,
        owned: Meta.ownedCount(),
        owns: function (id) { return Meta.owns(id); },
      });
    } else if (overlay === "challenges") {
      Draw.drawChallenges(ctx);
    }
    Draw.drawCoins(ctx, Meta.coins(), coinPop);
    Draw.drawParticles(ctx, particles, true, true);
    if (!overlay && toasts.length) {
      const item = toasts[0];
      item.y = state === OVER ? 132 : state === TITLE ? 250 : 156;
      Draw.drawToast(ctx, item);
    }
    Draw.drawMute(ctx, muted);
    if (showHitboxes && run && state !== TITLE) Draw.drawDebug(ctx, run);
    ctx.restore();

    if (layout.framed) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255, 248, 236, 0.28)";
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
    if (overlay === "chests" && reveal) {
      const hit = Draw.revealHit(pt, reveal.life);
      if (hit.action === "skip") reveal.life = 0;
      else if (hit.action === "equip") finishReveal(true);
      else finishReveal(false);
      return;
    }
    if (overlay === "chests") {
      const hit = Draw.chestHit(pt);
      if (hit && hit.action === "open") onOpenChest(hit.id);
      else if (hit && hit.action === "close") overlay = null;
      return;
    }
    if (overlay === "collection") {
      const hit = Draw.collectionPanelHit(pt);
      if (!hit || hit.action === "close") overlay = null;
      else if (hit.action === "chests") openChests();
      else if (hit.action === "card") onCollectionCard(hit.id);
      return;
    }
    if (overlay === "challenges") {
      const hit = Draw.challengeHit(pt);
      if (hit && hit.action === "close") overlay = null;
      else if (hit && hit.action === "claim") {
        if (Meta.claim(hit.id)) {
          Sfx.score();
          popCoins();
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
      if (menu === "chests") {
        openChests();
        return;
      }
      if (menu === "challenges") {
        overlay = "challenges";
        return;
      }
    }
    if (state === OVER && deathFreeze <= 0) {
      if (Draw.stashHit(pt, jobClaim) === "challenges") {
        overlay = "challenges";
        return;
      }
      if (Draw.restartHit(pt)) {
        if (lock <= 0) press();
        else flapQueued = true;
      }
      return;
    }
    if (state === TITLE) {
      if (Draw.collectionHit(pt)) {
        openCollection();
        return;
      }
      if (Draw.playHit(pt)) press();
      return;
    }
    press();
  }, { passive: false });

  window.addEventListener("pointerup", function () { pointer = null; });
  window.addEventListener("pointercancel", function () { pointer = null; });

  const held = Object.create(null);

  window.addEventListener("keydown", function (e) {
    if (e.repeat || held[e.code]) return;
    held[e.code] = true;
    if (overlay) {
      if (e.code === "Escape" || e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (overlay === "chests" && reveal) finishReveal(false);
        else overlay = null;
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
      const list = Feel.COSTUMES;
      if (n >= 1 && n <= list.length && Meta.owns(list[n - 1].id)) setSkin(list[n - 1].id);
      return;
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
    const kit = Meta.takeFullKit();
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
      if (kit) {
        showToast("Full kit", 1.5);
        popCoins();
      }
      showStreak();
      requestAnimationFrame(frame);
    };
    if (document.fonts && document.fonts.load) {
      Promise.race([
        document.fonts.load('64px "Lilita One"'),
        document.fonts.load('32px Anton'),
        new Promise(function (resolve) { setTimeout(resolve, 1200); }),
      ]).then(start, start);
    } else {
      start();
    }
  }

  boot();
})();
