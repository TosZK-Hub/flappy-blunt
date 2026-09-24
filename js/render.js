/* Procedural art for Flappy Blunt. Grinder towers and a tapered blunt — no bird, no pipes. */
(function (root) {
  "use strict";

  const P = root.FBPhysics;
  const Feel = root.FBFeel;
  const Pal = Feel.PALETTE;
  const FONT = '"Lilita One", sans-serif';

  function pathRound(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function text(ctx, str, x, y, size, fill, stroke) {
    ctx.font = size + "px " + FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    if (stroke) {
      ctx.lineWidth = Math.max(3, size * 0.14);
      ctx.strokeStyle = stroke;
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = fill;
    ctx.fillText(str, x, y);
  }

  function drawBackground(ctx, scroll, time) {
    const sky = ctx.createLinearGradient(0, 0, 0, P.GROUND_Y);
    sky.addColorStop(0, "#1A0E24");
    sky.addColorStop(0.55, Pal.NIGHT);
    sky.addColorStop(1, Pal.HAZE);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, P.W, P.H);

    for (let i = 0; i < 28; i++) {
      const x = ((i * 149 - scroll * 0.1) % (P.W + 30) + (P.W + 30)) % (P.W + 30) - 10;
      const y = (i * 47) % 240 + 8;
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.8 + i));
      const s = i % 5 === 0 ? 1.7 : 1.05;
      const star = ctx.createRadialGradient(x, y, 0, x, y, s * 2.4);
      star.addColorStop(0, "rgba(243, 232, 212, " + (0.35 * tw).toFixed(3) + ")");
      star.addColorStop(1, "rgba(243, 232, 212, 0)");
      ctx.fillStyle = star;
      ctx.beginPath();
      ctx.arc(x, y, s * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const glowX = 300 - ((scroll * 0.02) % 40);
    const glowY = P.GROUND_Y - 150;
    const glow = ctx.createRadialGradient(glowX, glowY, 8, glowX, glowY, 130);
    glow.addColorStop(0, "rgba(232, 168, 74, 0.15)");
    glow.addColorStop(0.4, "rgba(255, 107, 44, 0.08)");
    glow.addColorStop(1, "rgba(255, 107, 44, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(glowX, glowY, 130, 0, Math.PI * 2);
    ctx.fill();

    drawCity(ctx, scroll);
    const veil = ctx.createLinearGradient(0, P.GROUND_Y - 200, 0, P.GROUND_Y);
    veil.addColorStop(0, "rgba(42, 22, 56, 0)");
    veil.addColorStop(1, "rgba(74, 47, 92, 0.35)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, P.GROUND_Y - 200, P.W, 200);

    drawHill(ctx, scroll, 0.18, P.GROUND_Y - 8, Pal.NIGHT, 1.05, 0.4);
    drawHill(ctx, scroll, 0.36, P.GROUND_Y + 16, "#1e3f34", 0.9, 1.3);
  }

  function drawCity(ctx, scroll) {
    const base = P.GROUND_Y - 18;
    for (let i = 0; i < 14; i++) {
      const w = 26 + (i % 4) * 14;
      const h = 42 + (i % 5) * 26;
      const span = P.W + 140;
      const x = ((i * 64 - scroll * 0.32) % span + span) % span - 60;
      const crown = base - h;
      ctx.fillStyle = i % 2 ? "#120c18" : "#1a1024";
      ctx.beginPath();
      ctx.moveTo(x, base + 12);
      ctx.lineTo(x, crown + w * 0.42);
      ctx.quadraticCurveTo(x, crown, x + w * 0.5, crown);
      ctx.quadraticCurveTo(x + w, crown, x + w, crown + w * 0.42);
      ctx.lineTo(x + w, base + 12);
      ctx.closePath();
      ctx.fill();
      const haze = ctx.createLinearGradient(x, crown, x, base);
      haze.addColorStop(0, "rgba(74, 47, 92, 0)");
      haze.addColorStop(1, "rgba(74, 47, 92, 0.28)");
      ctx.fillStyle = haze;
      ctx.fill();
      for (let wy = crown + 16; wy < base - 10; wy += 14) {
        const warm = (i + wy) % 5 === 0;
        ctx.fillStyle = warm ? "rgba(232, 168, 74, 0.28)" : "rgba(46, 230, 214, 0.18)";
        ctx.beginPath();
        ctx.arc(x + w * 0.32, wy, 1.2, 0, Math.PI * 2);
        if (w > 36) ctx.arc(x + w * 0.68, wy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawHill(ctx, scroll, factor, base, color, scale, seed) {
    ctx.beginPath();
    ctx.moveTo(0, P.H);
    const step = 36 * scale;
    ctx.lineTo(0, base);
    for (let x = 0; x <= P.W + step; x += step) {
      const wx = (x + scroll * factor) * 0.02 + seed;
      const bob = Math.sin(wx) * 16 * scale + Math.sin(wx * 2.1 + 1) * 6 * scale;
      const y = base + bob;
      ctx.quadraticCurveTo(x + step * 0.35, y - 28 * scale, x + step * 0.62, y + 4 * scale);
    }
    ctx.lineTo(P.W, P.H);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  /* Metal grinder discs. The neon hairline sits only on the gap face. */
  function drawGrinder(ctx, tower, faceY, farY) {
    const bodyW = P.COL_W;
    const left = tower.x + (P.VIS_W - bodyW) / 2;
    const lipIsBottom = faceY >= farY;
    const top = Math.min(faceY, farY);
    const bot = Math.max(faceY, farY);
    const capH = 9;
    const pitch = 22;
    const discH = 16;
    const bodyTop = lipIsBottom ? top : top + capH;
    const bodyBot = lipIsBottom ? bot - capH : bot;
    let i = 0;
    for (let y = bodyTop; y < bodyBot - 4; y += pitch) {
      const bulge = i % 2 === 0 ? 7 : 3;
      const dh = Math.min(discH, bodyBot - y);
      const x = left - bulge;
      const w = bodyW + bulge * 2;
      const g = ctx.createLinearGradient(0, y, 0, y + dh);
      g.addColorStop(0, "#7A5A8C");
      g.addColorStop(0.48, Pal.HAZE);
      g.addColorStop(1, "#2A1838");
      ctx.fillStyle = g;
      pathRound(ctx, x, y, w, dh, Math.min(8, dh / 2));
      ctx.fill();
      ctx.fillStyle = "rgba(243, 232, 212, 0.18)";
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + 3.4, w * 0.34, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(61, 219, 106, 0.22)";
      ctx.beginPath();
      ctx.ellipse(x + 3, y + dh * 0.55, 1.5, 2.1, 0, 0, Math.PI * 2);
      ctx.ellipse(x + w - 3, y + dh * 0.55, 1.5, 2.1, 0, 0, Math.PI * 2);
      ctx.fill();
      i += 1;
    }

    const capY = lipIsBottom ? faceY - capH : faceY;
    const capX = left - 5;
    const capW = bodyW + 10;
    const cap = ctx.createLinearGradient(0, capY, 0, capY + capH);
    cap.addColorStop(0, "#8A6AAA");
    cap.addColorStop(1, "#4A3068");
    ctx.fillStyle = cap;
    pathRound(ctx, capX, capY, capW, capH, 4);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = Pal.INK;
    ctx.stroke();

    const hy = lipIsBottom ? faceY - 1.6 : faceY + 1.6;
    const bloom = ctx.createRadialGradient(capX + capW / 2, hy, 1, capX + capW / 2, hy, capW * 0.45);
    bloom.addColorStop(0, "rgba(61, 219, 106, 0.15)");
    bloom.addColorStop(1, "rgba(61, 219, 106, 0)");
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.ellipse(capX + capW / 2, hy, capW * 0.48, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = Pal.NEON_LEAF || Pal.NEON;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(capX + 5, hy);
    ctx.lineTo(capX + capW - 5, hy);
    ctx.stroke();
  }

  function drawTowers(ctx, towers) {
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      const gapTop = t.gapY - t.gapH / 2;
      const gapBot = t.gapY + t.gapH / 2;
      drawGrinder(ctx, t, gapTop, -40);
      drawGrinder(ctx, t, gapBot, P.GROUND_Y + 8);
    }
  }

  function drawGround(ctx, scroll) {
    const y = P.GROUND_Y;
    const soil = ctx.createLinearGradient(0, y, 0, P.H);
    soil.addColorStop(0, "#10281c");
    soil.addColorStop(0.2, "#0c1c16");
    soil.addColorStop(1, Pal.INK);
    ctx.fillStyle = soil;
    ctx.fillRect(0, y, P.W, P.GROUND_H);

    ctx.beginPath();
    ctx.moveTo(0, y + 22);
    for (let x = 0; x <= P.W; x += 16) {
      const yy = y + Math.sin((x + scroll) * 0.05) * 3.2;
      ctx.quadraticCurveTo(x + 8, yy - 8, x + 16, yy + 1);
    }
    ctx.lineTo(P.W, y + 28);
    ctx.lineTo(0, y + 28);
    ctx.closePath();
    const grass = ctx.createLinearGradient(0, y - 6, 0, y + 26);
    grass.addColorStop(0, "#1B4332");
    grass.addColorStop(1, "#143224");
    ctx.fillStyle = grass;
    ctx.fill();
    ctx.strokeStyle = "rgba(243, 232, 212, 0.35)";
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    const shift = -((scroll % 32) + 32) % 32;
    for (let x = shift; x < P.W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 7);
      ctx.lineTo(x + 14, y + 7);
      ctx.stroke();
    }
  }

  function bluntPath(ctx, L, r0, r1) {
    const x0 = -L / 2 + r0;
    const x1 = L / 2 - r1;
    ctx.beginPath();
    ctx.moveTo(x0, -r0);
    ctx.lineTo(x1, -r1);
    ctx.arc(x1, 0, r1, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x0, r0);
    ctx.arc(x0, 0, r0, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
  }

  function drawSmile(ctx, ink) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.quadraticCurveTo(0, 7, 8, 2.4);
    ctx.stroke();
  }

  /* Soft arcade feathers: cream core, 10% halo, vein only on the inner three. */
  function featherWing(ctx, fill, tip) {
    ctx.save();
    ctx.translate(-8, -6);
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate(-1.05 + i * 0.34);
      const rx = 15 - i * 1.1;
      const ry = 4.2;
      ctx.fillStyle = "rgba(244, 240, 230, 0.22)";
      ctx.beginPath();
      ctx.ellipse(16, 0, rx * 1.1, ry * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      const feather = ctx.createLinearGradient(0, -5, 22, 5);
      feather.addColorStop(0, fill);
      feather.addColorStop(1, i >= 3 && tip ? tip : "rgba(243, 232, 212, 0.85)");
      ctx.fillStyle = feather;
      ctx.beginPath();
      ctx.ellipse(16, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      if (i < 3) {
        ctx.strokeStyle = "rgba(26, 20, 32, 0.28)";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(16 - rx * 0.42, 0);
        ctx.lineTo(16 + rx * 0.55, 0);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function drawBlunt(ctx, skin, opts) {
    const o = opts || {};
    const ash = !!o.ash;
    const id = ash ? "default" : skin || "default";
    const L = 68;
    const r0 = 16;
    const r1 = 11;
    let wrap = Pal.WRAP;
    let shadow = Pal.WRAP_SHADOW;
    let wing = "#F4F0E6";
    let wingTip = "#F4F0E6";
    if (ash) {
      wrap = Pal.ASH;
      shadow = "#4A4550";
      wing = "#8A8490";
      wingTip = "#8A8490";
    } else if (id === "neon_kush") {
      wingTip = Pal.CYAN;
    } else if (id === "galaxy_roll") {
      wrap = "#24143F";
      shadow = "#12081F";
      wing = "#6C4BD6";
      wingTip = "#E56BFF";
    } else if (id === "og_heist") {
      wing = "#E7E2D6";
    }

    ctx.save();
    if (!ash && id === "neon_kush") {
      ctx.shadowColor = "rgba(46, 230, 214, 0.15)";
      ctx.shadowBlur = 8;
    } else if (!ash && id === "galaxy_roll") {
      ctx.shadowColor = "rgba(180, 76, 255, 0.15)";
      ctx.shadowBlur = 8;
    }

    ctx.save();
    ctx.scale(1, -1);
    featherWing(ctx, wing, wingTip);
    ctx.restore();
    ctx.shadowBlur = 0;

    bluntPath(ctx, L, r0, r1);
    const fill = ctx.createLinearGradient(0, -r0, 0, r0);
    const high = ash ? "#9A949C" : id === "galaxy_roll" ? "#6C4BD6" : Pal.KRAFT_HIGH;
    fill.addColorStop(0, high);
    fill.addColorStop(0.46, wrap);
    fill.addColorStop(1, shadow);
    ctx.fillStyle = fill;
    ctx.fill();

    if (!ash && id === "galaxy_roll") {
      ctx.save();
      bluntPath(ctx, L, r0, r1);
      ctx.clip();
      const stars = ["#F3E8D4", "#E56BFF", "#7EB6FF", "#F0C14B"];
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = stars[i % stars.length];
        ctx.beginPath();
        ctx.arc(-20 + (i * 17) % 46, -8 + (i % 5) * 3.2, i % 3 === 0 ? 1.15 : 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (!ash) {
      ctx.save();
      bluntPath(ctx, L, r0, r1);
      ctx.clip();
      ctx.fillStyle = "rgba(243, 232, 212, 0.28)";
      ctx.beginPath();
      ctx.ellipse(-6, -7, 16, 4, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    bluntPath(ctx, L, r0, r1);
    ctx.lineWidth = id === "neon_kush" && !ash ? 2.4 : 2;
    ctx.strokeStyle = !ash && id === "neon_kush" ? Pal.NEON : Pal.INK;
    ctx.stroke();

    if (!ash && id === "default") {
      ctx.fillStyle = "#6D3FA8";
      ctx.beginPath();
      ctx.ellipse(-10, -15, 13, 7, -0.15, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#4E2C86";
      pathRound(ctx, -24, -16, 22, 5, 2.5);
      ctx.fill();
      ctx.fillStyle = Pal.NEON;
      ctx.beginPath();
      ctx.ellipse(-8, -18, 3.2, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!ash && id === "gold_chain") {
      ctx.strokeStyle = Pal.GOLD;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(-2, 10, 5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6, 11, 4, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "#1A1420";
      ctx.strokeStyle = Pal.GOLD;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(-8.6, -2, 5.5, 4.6, -0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(2.8, -2, 5.5, 4.6, 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-3.2, -2);
      ctx.lineTo(-0.4, -2);
      ctx.stroke();
      ctx.fillStyle = "rgba(201, 210, 220, 0.5)";
      ctx.beginPath();
      ctx.ellipse(-10, -3.3, 2.1, 0.95, -0.25, 0, Math.PI * 2);
      ctx.ellipse(1.5, -3.3, 2.1, 0.95, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!ash && id === "og_heist") {
      ctx.fillStyle = "#5B2D8A";
      ctx.beginPath();
      ctx.moveTo(-22, -8);
      ctx.lineTo(-4, -16);
      ctx.lineTo(2, -6);
      ctx.lineTo(-16, -4);
      ctx.fill();
      ctx.fillStyle = "#2A241C";
      pathRound(ctx, -8, -2, 16, 12, 3);
      ctx.fill();
      ctx.strokeStyle = Pal.INK;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (!ash && id !== "gold_chain") {
      ctx.fillStyle = Pal.INK;
      ctx.beginPath();
      ctx.ellipse(-8, -2, 2.1, id === "og_heist" ? 1.5 : 2.4, 0, 0, Math.PI * 2);
      ctx.ellipse(2, -2, 2.1, id === "og_heist" ? 1.5 : 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSmile(ctx, ash ? Pal.INK : Pal.CREAM);
    if (!ash && id === "og_heist") {
      ctx.fillStyle = Pal.GOLD;
      pathRound(ctx, 2, 3.2, 2.4, 2.6, 1);
      ctx.fill();
    }
    featherWing(ctx, wing, wingTip);
    if (!ash) {
      const tipX = L / 2 - 4;
      const t = o.time != null ? o.time : chromeTime;
      const wave = Math.sin(t * 6.5);
      let pulse = 0.92 + 0.08 * wave;
      const glowA = 0.12 + 0.03 * wave;
      if (o.emberKick != null && t - o.emberKick >= 0 && t - o.emberKick <= 0.08) pulse *= 1.12;
      ctx.save();
      ctx.shadowColor = "rgba(232, 168, 74, " + glowA.toFixed(3) + ")";
      ctx.shadowBlur = 8;
      const ember = ctx.createRadialGradient(tipX, -0.6, 0.6, tipX, 0, 7.2 * pulse);
      ember.addColorStop(0, "#FFE7C2");
      ember.addColorStop(0.42, id === "neon_kush" ? Pal.NEON : id === "galaxy_roll" ? "#FF6AD5" : Pal.EMBER_HOT);
      ember.addColorStop(1, id === "neon_kush" ? Pal.NEON_CYAN : Pal.EMBER);
      ctx.fillStyle = ember;
      ctx.beginPath();
      ctx.arc(tipX, 0, 5.4 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (id === "og_heist") {
        ctx.strokeStyle = "#D5D8DE";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(L / 2 - 9, 0, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function strokeHex(ctx, rx, ry) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 3;
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  /* Solid gold hex. No glow — the ring is the chip, and it pops off on absorb. */
  function drawShieldRing(ctx) {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = Pal.GOLD;
    ctx.fillStyle = Pal.GOLD;
    ctx.lineWidth = 6;
    ctx.lineJoin = "miter";
    strokeHex(ctx, 42, 30);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(ctx, p) {
    ctx.save();
    ctx.translate(P.PLAYER_X, p.y);
    ctx.rotate(p.rot || 0);
    if (p.shield) drawShieldRing(ctx);
    ctx.save();
    ctx.scale(p.sx || 1, p.sy || 1);
    drawBlunt(ctx, p.skin || "default", { ash: p.ash, emberKick: p.emberKick });
    ctx.restore();
    ctx.restore();
  }

  function drawPickup(ctx, pk, time) {
    const bob = Math.sin((time || 0) * 4 + pk.x * 0.02) * 3;
    ctx.save();
    ctx.translate(pk.x, pk.y + bob);
    if (pk.id === "nug_24k" || pk.id === "nug_haze") {
      const leaf = pk.id === "nug_24k" ? Pal.NEON : "#A06AD8";
      ctx.fillStyle = leaf;
      ctx.beginPath();
      ctx.ellipse(0, 4, 12, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(-7, -1, 7, 6, -0.4, 0, Math.PI * 2);
      ctx.ellipse(7, -1, 7, 6, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = Pal.INK;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = Pal.GOLD;
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(-3, -12);
      ctx.lineTo(0, -7);
      ctx.lineTo(3, -13);
      ctx.lineTo(6, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (pk.id === "dab_rocket") {
      ctx.fillStyle = "#C5CDD6";
      ctx.fillRect(-12, -5, 22, 10);
      ctx.fillStyle = "#8E99A6";
      ctx.beginPath();
      ctx.moveTo(10, -5);
      ctx.lineTo(18, 0);
      ctx.lineTo(10, 5);
      ctx.fill();
      ctx.fillStyle = Pal.HOT;
      ctx.beginPath();
      ctx.moveTo(-12, -4);
      ctx.lineTo(-22, 0);
      ctx.lineTo(-12, 4);
      ctx.fill();
      ctx.strokeStyle = Pal.INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(-12, -5, 22, 10);
    } else if (pk.id === "magic_gummies") {
      ctx.fillStyle = "#FF5A6A";
      pathRound(ctx, -14, -8, 12, 16, 5);
      ctx.fill();
      ctx.fillStyle = "#C47A3A";
      pathRound(ctx, 2, -8, 12, 16, 5);
      ctx.fill();
      ctx.strokeStyle = Pal.CYAN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (pk.id === "gold_chip") {
      ctx.fillStyle = "#D7DEE8";
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        const x = Math.cos(a) * 13;
        const y = Math.sin(a) * 13;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = Pal.GOLD;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = Pal.NEON;
      ctx.beginPath();
      ctx.ellipse(0, 2, 4, 6, 0, 0, Math.PI * 2);
      ctx.moveTo(0, -6);
      ctx.lineTo(-5, 1);
      ctx.lineTo(0, -1);
      ctx.lineTo(5, 1);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = "#3A3F46";
      pathRound(ctx, -6, -12, 12, 20, 3);
      ctx.fill();
      ctx.fillStyle = Pal.CYAN;
      ctx.fillRect(-6, -14, 12, 4);
      ctx.strokeStyle = Pal.HOT;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(8, -4, 6, -0.8, 0.8);
      ctx.stroke();
      ctx.strokeStyle = Pal.NEON;
      ctx.beginPath();
      ctx.arc(12, 2, 5, -0.6, 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  const SLAB = '"Anton", "Lilita One", sans-serif';
  let grainPat = null;
  let blotchPat = null;
  let chromeTime = 0;
  let pressedPt = null;

  function setChrome(t, pt) {
    chromeTime = t || 0;
    pressedPt = pt || null;
  }

  function hitRect(pt, r) {
    return !!r && pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h;
  }

  function noiseCanvas(size, cell, lo, hi) {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d");
    const img = g.createImageData(size, size);
    const cells = size / cell;
    const field = new Uint8Array(cells * cells);
    for (let i = 0; i < field.length; i++) field[i] = lo + ((Math.random() * (hi - lo)) | 0);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = field[((y / cell) | 0) * cells + ((x / cell) | 0)];
        const i = (y * size + x) * 4;
        img.data[i] = n;
        img.data[i + 1] = n;
        img.data[i + 2] = n;
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function grainPattern(ctx) {
    if (grainPat) return grainPat;
    grainPat = ctx.createPattern(noiseCanvas(96, 1, 214, 255), "repeat");
    return grainPat;
  }

  function blotchPattern(ctx) {
    if (blotchPat) return blotchPat;
    blotchPat = ctx.createPattern(noiseCanvas(96, 6, 70, 190), "repeat");
    return blotchPat;
  }

  function screw(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = "#1a120c";
    ctx.beginPath();
    ctx.arc(x, y + 0.6, 3.4, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(x - 1, y - 1, 0.2, x, y, 3);
    g.addColorStop(0, "#f3e2b0");
    g.addColorStop(1, "#8a6230");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2a1c10";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 1.7, y);
    ctx.lineTo(x + 1.7, y);
    ctx.stroke();
    ctx.restore();
  }

  function fillMaterial(ctx, x, y, w, h) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, "#4e3470");
    g.addColorStop(0.38, "#2A1638");
    g.addColorStop(1, "#140c1c");
    ctx.fillStyle = g;
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    const sheen = ctx.createLinearGradient(x, y, x + w * 0.2, y + h * 0.55);
    sheen.addColorStop(0, "rgba(243, 232, 212, 0.16)");
    sheen.addColorStop(0.45, "rgba(243, 232, 212, 0.03)");
    sheen.addColorStop(1, "rgba(0, 0, 0, 0.28)");
    ctx.fillStyle = sheen;
    ctx.fillRect(x, y, w, h);
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  /* Soft night pill. Cream at the top-left, shadow at the bottom-right. No screws. */
  function paintPlate(ctx, x, y, w, h, rad) {
    let r = rad == null ? 24 : rad;
    if (w > 180 && h > 100) r = Math.max(20, Math.min(28, r));
    r = Math.max(8, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    pathRound(ctx, x, y, w, h, r);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, Pal.PANEL_TOP);
    g.addColorStop(0.42, Pal.NIGHT);
    g.addColorStop(1, Pal.PANEL_BOT);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    ctx.save();
    pathRound(ctx, x, y, w, h, r);
    ctx.clip();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    const tl = ctx.createLinearGradient(x, y, x + w * 0.7, y + h * 0.55);
    tl.addColorStop(0, "rgba(243, 232, 212, 0.22)");
    tl.addColorStop(0.42, "rgba(243, 232, 212, 0)");
    ctx.fillStyle = tl;
    ctx.fillRect(x, y, w, h);
    const br = ctx.createLinearGradient(x + w * 0.35, y + h * 0.4, x + w, y + h);
    br.addColorStop(0, "rgba(0,0,0,0)");
    br.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = br;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  function stamp(ctx, str, x, y, size, fill) {
    ctx.save();
    ctx.font = size + "px " + SLAB;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(2, size * 0.12);
    ctx.strokeStyle = Pal.INK;
    ctx.strokeText(str, x, y);
    ctx.fillStyle = fill;
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  function drawCoin(ctx, x, y, r, label) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.arc(1, 2.5, r, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 1, 0, 0, r);
    g.addColorStop(0, "#fff6d2");
    g.addColorStop(0.4, "#e7c15a");
    g.addColorStop(1, "#7a5416");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = Pal.INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(90, 50, 10, 0.65)";
    ctx.stroke();
    text(ctx, label, 0, 1, Math.min(13, r * 0.7), Pal.INK, null);
    ctx.restore();
  }

  function paintTag(ctx, x, y, w, h) {
    const r = Math.min(20, Math.min(w, h) / 2);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    pathRound(ctx, x, y, w, h, r);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, Pal.PANEL_TOP);
    g.addColorStop(0.5, Pal.NIGHT);
    g.addColorStop(1, Pal.PANEL_BOT);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    ctx.save();
    pathRound(ctx, x, y, w, h, r);
    ctx.clip();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(x, y, w, h);
    const tl = ctx.createLinearGradient(x, y, x + w, y + h * 0.4);
    tl.addColorStop(0, "rgba(243, 232, 212, 0.22)");
    tl.addColorStop(1, "rgba(243, 232, 212, 0)");
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = tl;
    ctx.fillRect(x, y, w, h * 0.45);
    ctx.restore();
  }

  function drawInset(ctx, x, y, w, h) {
    ctx.save();
    pathRound(ctx, x, y, w, h, 18);
    ctx.clip();
    ctx.fillStyle = "rgba(26, 20, 32, 0.55)";
    ctx.fillRect(x, y, w, h);
    const tl = ctx.createLinearGradient(x, y, x + w * 0.4, y + h);
    tl.addColorStop(0, "rgba(243, 232, 212, 0.12)");
    tl.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = tl;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    pathRound(ctx, x, y, w, h, 18);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(243, 232, 212, 0.22)";
    ctx.stroke();
  }

  function drawResin(ctx, x, y, w, h, t) {
    const amt = Math.max(0, Math.min(1, t || 0));
    ctx.save();
    pathRound(ctx, x, y, w, h, h / 2);
    ctx.clip();
    ctx.fillStyle = "#0c0810";
    ctx.fillRect(x, y, w, h);
    const fill = Math.max(0, amt * (w - 4));
    if (fill > 3) {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#b8ffd4");
      g.addColorStop(0.45, Pal.NEON);
      g.addColorStop(1, "#147a42");
      ctx.fillStyle = g;
      ctx.fillRect(x + 2, y + 2, fill, h - 4);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(x + 4, y + 3, Math.max(0, fill - 6), 2);
    }
    ctx.restore();
    pathRound(ctx, x, y, w, h, h / 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = Pal.INK;
    ctx.stroke();
  }

  function drawSlab(ctx, str, x, y, size, fill) {
    ctx.save();
    ctx.font = size + "px " + SLAB;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    if (size >= 32) {
      for (let i = 5; i >= 1; i--) {
        ctx.fillStyle = i > 2 ? "rgba(8, 4, 8, 0.72)" : "#7a5a22";
        ctx.fillText(str, x + i * 0.3, y + i * 1.05);
      }
    } else {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillText(str, x, y + 4);
    }
    ctx.lineWidth = Math.max(3, size * 0.045);
    ctx.strokeStyle = Pal.INK;
    ctx.strokeText(str, x, y);
    ctx.fillStyle = fill;
    ctx.fillText(str, x, y);
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillText(str, x, y);
    ctx.restore();
    if (size < 32) {
      ctx.strokeStyle = "rgba(240, 193, 75, 0.85)";
      ctx.lineWidth = Math.max(1, size * 0.08);
      ctx.beginPath();
      const half = ctx.measureText(str).width / 2;
      ctx.moveTo(x - half, y - size * 0.46);
      ctx.lineTo(x + half * 0.35, y - size * 0.46);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGoldButton(ctx, r, label) {
    const hot = pressedPt && hitRect(pressedPt, r);
    const dy = hot ? 2 : 0;
    const rad = Math.min(28, Math.max(22, r.h / 2));
    const y = r.y + dy;
    ctx.save();
    if (!hot) {
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
    }
    pathRound(ctx, r.x, y, r.w, r.h, rad);
    const g = ctx.createLinearGradient(r.x, y, r.x, y + r.h);
    g.addColorStop(0, "#FFF6D2");
    g.addColorStop(0.32, Pal.GOLD);
    g.addColorStop(0.68, Pal.GOLD_DEEP);
    g.addColorStop(1, Pal.GOLD_SHADOW);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    ctx.save();
    pathRound(ctx, r.x, y, r.w, r.h, rad);
    ctx.clip();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#FFF6D2";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const yy = y + 8 + i * ((r.h - 14) / 4);
      ctx.beginPath();
      ctx.moveTo(r.x + 16, yy);
      ctx.lineTo(r.x + r.w - 16, yy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const hi = ctx.createLinearGradient(r.x, y, r.x, y + r.h * 0.45);
    hi.addColorStop(0, "rgba(255, 246, 210, 0.55)");
    hi.addColorStop(1, "rgba(255, 246, 210, 0)");
    ctx.fillStyle = hi;
    ctx.fillRect(r.x, y, r.w, r.h * 0.45);
    if (hot) {
      ctx.fillStyle = "rgba(26, 20, 32, 0.18)";
      ctx.fillRect(r.x, y, r.w, r.h);
    }
    ctx.restore();
    if (r.w > 200) {
      ctx.fillStyle = Pal.INK;
      diamond(ctx, r.x + 28, y + r.h / 2, 4);
      diamond(ctx, r.x + r.w - 28, y + r.h / 2, 4);
    }
    text(ctx, label, r.x + r.w / 2, y + r.h / 2 + 1, r.h > 52 ? 22 : r.h > 36 ? 16 : 12, Pal.INK, null);
  }

  function diamond(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s, y);
    ctx.lineTo(x, y + s);
    ctx.lineTo(x - s, y);
    ctx.closePath();
    ctx.fill();
  }

  function drawGhostButton(ctx, r, label) {
    const hot = pressedPt && hitRect(pressedPt, r);
    const dy = hot ? 1 : 0;
    const rad = Math.min(22, Math.max(18, r.h / 2));
    const y = r.y + dy;
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    pathRound(ctx, r.x, y, r.w, r.h, rad);
    ctx.fillStyle = hot ? "rgba(26, 20, 32, 0.66)" : "rgba(26, 20, 32, 0.58)";
    ctx.fill();
    ctx.restore();
    pathRound(ctx, r.x, y, r.w, r.h, rad);
    ctx.lineWidth = 2.25;
    ctx.strokeStyle = Pal.CREAM;
    ctx.stroke();
    ctx.save();
    pathRound(ctx, r.x, y, r.w, r.h, rad);
    ctx.clip();
    const sheen = ctx.createLinearGradient(r.x, y, r.x, y + r.h * 0.4);
    sheen.addColorStop(0, "rgba(243, 232, 212, 0.14)");
    sheen.addColorStop(1, "rgba(243, 232, 212, 0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(r.x, y, r.w, r.h * 0.4);
    ctx.strokeStyle = "rgba(243, 232, 212, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r.x + Math.min(rad, 14), y + 2.5);
    ctx.lineTo(r.x + r.w - Math.min(rad, 14), y + 2.5);
    ctx.stroke();
    ctx.restore();
    text(ctx, label, r.x + r.w / 2, y + r.h / 2 + 1, 14, Pal.CREAM, null);
  }

  function drawCheck(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.arc(1, 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#102418";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = Pal.NEON;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-5, 1);
    ctx.lineTo(-1, 5);
    ctx.lineTo(6, -5);
    ctx.stroke();
    ctx.restore();
  }

  function homeLayout() {
    const plate = { x: 18, y: 76, w: 384, h: 536 };
    const play = { x: 48, y: 416, w: 324, h: 64 };
    const jobs = { x: 40, y: 544, w: 162, h: 48 };
    const shop = { x: 218, y: 544, w: 162, h: 48 };
    const best = { x: 120, y: 218, w: 180, h: 32 };
    return { plate: plate, play: play, jobs: jobs, shop: shop, best: best, home: null };
  }

  function menuLayout(mode) {
    if (mode === "over") {
      const d = deathLayout();
      return { jobs: d.jobs, shop: d.shop, home: d.home };
    }
    const h = homeLayout();
    return { jobs: h.jobs, shop: h.shop, home: null };
  }

  function drawMenu(ctx, mode, claimable) {
    const m = menuLayout(mode);
    if (m.home) drawGhostButton(ctx, m.home, "HOME");
    drawGhostButton(ctx, m.jobs, "JOBS");
    drawGhostButton(ctx, m.shop, "SHOP");
    if (claimable) {
      ctx.fillStyle = Pal.GOLD;
      ctx.beginPath();
      ctx.arc(m.jobs.x + m.jobs.w - 10, m.jobs.y + 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function menuHit(pt, mode) {
    const m = menuLayout(mode);
    if (m.home && hitRect(pt, m.home)) return "home";
    if (hitRect(pt, m.jobs)) return "jobs";
    if (hitRect(pt, m.shop)) return "shop";
    return null;
  }

  function playHit(pt) {
    return hitRect(pt, homeLayout().play);
  }

  function deathLayout() {
    const panel = { x: 22, y: 156, w: 376, h: 448 };
    const restart = {
      x: panel.x + 18,
      y: panel.y + panel.h - 18 - 64,
      w: panel.w - 36,
      h: 64,
    };
    const shop = { x: panel.x + panel.w - 14 - 86, y: panel.y + 14, w: 86, h: 44 };
    const jobs = { x: shop.x - 8 - 86, y: shop.y, w: 86, h: 44 };
    const home = { x: panel.x + 14, y: panel.y + 14, w: 78, h: 44 };
    return { panel: panel, restart: restart, jobs: jobs, shop: shop, home: home };
  }

  function panelFrame() {
    return {
      panel: { x: 16, y: 72, w: 388, h: 600 },
      close: { x: 346, y: 84, w: 48, h: 48 },
    };
  }

  function shopCards() {
    const frame = panelFrame();
    const skins = Feel.SKINS;
    const prices = root.FBMeta.PRICES;
    const cardW = 70;
    const gap = 6;
    const row = skins.length * cardW + (skins.length - 1) * gap;
    const x0 = frame.panel.x + (frame.panel.w - row) / 2;
    const y = frame.panel.y + 128;
    const cards = skins.map(function (s, i) {
      return {
        id: s.id,
        name: s.name,
        price: prices[s.id],
        x: x0 + i * (cardW + gap),
        y: y,
        w: cardW,
        h: 188,
      };
    });
    return { panel: frame.panel, close: frame.close, cards: cards };
  }

  function drawShop(ctx, ui) {
    const view = shopCards();
    ctx.fillStyle = "rgba(8, 4, 12, 0.72)";
    ctx.fillRect(0, 0, P.W, P.H);
    paintPlate(ctx, view.panel.x, view.panel.y, view.panel.w, view.panel.h, 24);
    drawSlab(ctx, "NIGHT HEIST", view.panel.x + 130, view.panel.y + 36, 22, Pal.CREAM);
    text(ctx, "SKINS", view.panel.x + 130, view.panel.y + 68, 16, Pal.GOLD, null);
    drawLeaf(ctx, view.panel.x + 48, view.panel.y + 100, 1);
    text(ctx, String(ui.nugs), view.panel.x + 92, view.panel.y + 100, 18, Pal.CREAM, Pal.INK);
    drawGhostButton(ctx, view.close, "X");
    for (let i = 0; i < view.cards.length; i++) {
      const card = view.cards[i];
      const owned = ui.owns(card.id);
      const equipped = ui.skin === card.id;
      const hot = card.id === ui.hover || card.id === ui.focus;
      const phase = Math.sin((ui.time || 0) * 4.2);
      const bob = hot ? phase * (ui.reduceMotion ? 2 : 9) : 0;
      const tilt = hot && !ui.reduceMotion ? phase * 0.1 : 0;
      paintTag(ctx, card.x, card.y, card.w, card.h);
      ctx.save();
      pathRound(ctx, card.x + 6, card.y + 8, card.w - 12, 78, 6);
      ctx.clip();
      ctx.fillStyle = "#0c0610";
      ctx.fillRect(card.x + 6, card.y + 8, card.w - 12, 78);
      if (!owned) ctx.globalAlpha = 0.4;
      ctx.save();
      ctx.translate(card.x + card.w / 2, card.y + 50 + bob);
      ctx.rotate(tilt);
      ctx.scale(0.36, 0.36);
      drawBlunt(ctx, card.id, {});
      ctx.restore();
      const shade = ctx.createLinearGradient(0, card.y + 8, 0, card.y + 86);
      shade.addColorStop(0, "rgba(0,0,0,0.5)");
      shade.addColorStop(0.35, "rgba(0,0,0,0)");
      shade.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = shade;
      ctx.fillRect(card.x + 6, card.y + 8, card.w - 12, 78);
      ctx.restore();
      const bits = card.name.split(" ");
      stamp(ctx, bits[0].toUpperCase(), card.x + card.w / 2, card.y + 102, 11, Pal.CREAM);
      if (bits.length > 1) stamp(ctx, bits.slice(1).join(" ").toUpperCase(), card.x + card.w / 2, card.y + 116, 11, Pal.CREAM);
      if (equipped) {
        pathRound(ctx, card.x + 1.5, card.y + 1.5, card.w - 3, card.h - 3, 10);
        ctx.lineWidth = 3;
        ctx.strokeStyle = Pal.GOLD;
        ctx.stroke();
      } else if (card.id === ui.focus) {
        pathRound(ctx, card.x + 2, card.y + 2, card.w - 4, card.h - 4, 10);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(243, 232, 212, 0.7)";
        ctx.stroke();
      }
      const status = equipped ? "EQUIPPED" : owned ? "OWNED" : "LOCKED";
      const statusColor = equipped ? Pal.GOLD : Pal.CREAM;
      ctx.save();
      if (!owned) ctx.globalAlpha = 0.72;
      stamp(ctx, status, card.x + card.w / 2, card.y + 136, 8, statusColor);
      ctx.restore();
      if (owned) drawCheck(ctx, card.x + card.w / 2, card.y + 156);
      else drawCoin(ctx, card.x + card.w / 2, card.y + 158, 16, card.price === 0 ? "0" : String(card.price));
    }
    if (ui.whisper) stamp(ctx, "Earn nugs on runs", P.W / 2, view.panel.y + view.panel.h - 48, 12, Pal.CREAM);
    text(ctx, "COSMETICS ONLY", P.W / 2, view.panel.y + view.panel.h - 28, 12, Pal.CREAM, null);
  }

  function shopHit(pt) {
    const view = shopCards();
    if (hitRect(pt, view.close)) return { action: "close" };
    for (let i = 0; i < view.cards.length; i++) {
      if (hitRect(pt, view.cards[i])) return { action: "card", id: view.cards[i].id };
    }
    if (!hitRect(pt, view.panel)) return { action: "close" };
    return null;
  }

  function jobRows() {
    const frame = panelFrame();
    const list = root.FBMeta.missions();
    const rows = list.map(function (m, i) {
      const y = frame.panel.y + 112 + i * 112;
      return {
        id: m.id,
        name: m.name,
        goal: m.goal,
        reward: m.reward,
        progress: m.progress,
        claimed: m.claimed,
        ready: m.ready,
        period: m.period,
        x: frame.panel.x + 16,
        y: y,
        w: frame.panel.w - 32,
        h: 100,
        claim: { x: frame.panel.x + frame.panel.w - 16 - 100, y: y + 48, w: 100, h: 44 },
        pay: { x: frame.panel.x + frame.panel.w - 16 - 100 - 8 - 72, y: y + 48, w: 72, h: 44 },
      };
    });
    return { panel: frame.panel, close: frame.close, rows: rows };
  }

  function drawJobs(ctx) {
    const view = jobRows();
    ctx.fillStyle = "rgba(8, 4, 12, 0.72)";
    ctx.fillRect(0, 0, P.W, P.H);
    paintPlate(ctx, view.panel.x, view.panel.y, view.panel.w, view.panel.h, 24);
    drawSlab(ctx, "NIGHT HEIST", view.panel.x + 130, view.panel.y + 36, 22, Pal.CREAM);
    text(ctx, "JOBS", view.panel.x + 70, view.panel.y + 72, 16, Pal.GOLD, null);
    text(ctx, "24H", view.panel.x + 140, view.panel.y + 72, 13, Pal.CREAM, null);
    drawGhostButton(ctx, view.close, "X");
    for (let i = 0; i < view.rows.length; i++) {
      const row = view.rows[i];
      drawInset(ctx, row.x, row.y, row.w, row.h);
      stamp(ctx, (row.period === "week" ? "WEEK" : "DAY") + "  " + row.name.toUpperCase(), row.x + 150, row.y + 20, 12, Pal.CREAM);
      const trackW = row.pay.x - row.x - 16;
      drawResin(ctx, row.x + 12, row.y + 36, trackW, 12, row.progress / row.goal);
      stamp(ctx, row.progress + "/" + row.goal, row.x + 36, row.claim.y + row.claim.h / 2, 16, Pal.CREAM);
      drawCoin(ctx, row.pay.x + row.pay.w / 2, row.pay.y + row.pay.h / 2, 18, String(row.reward));
      if (row.ready) drawGoldButton(ctx, row.claim, "CLAIM");
      else drawGhostButton(ctx, row.claim, row.claimed ? "GOT" : "CLAIM");
    }
  }

  function jobsHit(pt) {
    const view = jobRows();
    if (hitRect(pt, view.close)) return { action: "close" };
    for (let i = 0; i < view.rows.length; i++) {
      if (view.rows[i].ready && hitRect(pt, view.rows[i].claim)) return { action: "claim", id: view.rows[i].id };
    }
    if (!hitRect(pt, view.panel)) return { action: "close" };
    return null;
  }

  function drawLeaf(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s || 1, s || 1);
    ctx.lineJoin = "round";
    ctx.lineWidth = 1;
    ctx.strokeStyle = Pal.INK;
    const fans = [-1.05, -0.55, 0, 0.55, 1.05];
    for (let i = 0; i < fans.length; i++) {
      ctx.save();
      ctx.rotate(fans[i]);
      ctx.fillStyle = i === 2 ? Pal.NEON_LEAF : "#1F8A3E";
      ctx.beginPath();
      ctx.ellipse(0, -6.5, i === 2 ? 3.1 : 2.5, i === 2 ? 8.2 : 6.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = "#d8c4ff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(0, -2);
    ctx.stroke();
    ctx.restore();
  }

  function nugBox() {
    return { x: 286, y: 14, w: 120, h: 44 };
  }

  function drawNugs(ctx, n, pop) {
    const b = nugBox();
    const lift = pop > 0 ? pop : 0;
    ctx.save();
    pathRound(ctx, b.x, b.y, b.w, b.h, 22);
    const pill = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
    pill.addColorStop(0, "rgba(90, 56, 120, 0.55)");
    pill.addColorStop(1, "rgba(26, 20, 32, 0.72)");
    ctx.fillStyle = pill;
    ctx.fill();
    ctx.lineWidth = 2.25;
    ctx.strokeStyle = Pal.GOLD;
    ctx.stroke();
    ctx.save();
    ctx.translate(b.x + 24, b.y + b.h / 2);
    ctx.scale(1 + lift * 0.45, 1 + lift * 0.45);
    drawLeaf(ctx, 0, 0, 1.05);
    ctx.restore();
    text(ctx, String(n), b.x + 76, b.y + b.h / 2 + 1, 18, Pal.CREAM, Pal.INK);
    ctx.restore();
  }

  function drawToast(ctx, toast) {
    if (!toast || toast.life <= 0 || !toast.text) return;
    const fade = toast.life < 0.28 ? Math.max(0, toast.life / 0.28) : 1;
    ctx.save();
    ctx.globalAlpha = fade;
    stamp(ctx, toast.text, P.W / 2, toast.y || 148, 15, Pal.CREAM);
    ctx.restore();
  }

  function drawBuffs(ctx, active, clean) {
    const chip = { x: 16, y: 118, w: 108, h: 36 };
    if (clean && (!active || !active.id)) {
      drawGhostButton(ctx, chip, "CLEAN");
      return;
    }
    if (!active || active.popping || !active.id) return;
    const labels = {
      nug_24k: "+2 NEXT",
      nug_haze: "×2",
      dab_rocket: "BOOST",
      magic_gummies: "FLOAT",
      gold_chip: "SHIELD",
      trail_can: "TRAIL",
    };
    const label = labels[active.id];
    if (!label) return;
    drawGhostButton(ctx, chip, label);
  }

  function cleanBox() {
    return { x: 12, y: 14, w: 132, h: 44 };
  }

  function drawClean(ctx, on) {
    const b = cleanBox();
    drawGhostButton(ctx, b, on ? "CLEAN" : "CLEAN");
    if (on) {
      ctx.fillStyle = Pal.NEON;
      ctx.beginPath();
      ctx.arc(b.x + b.w - 12, b.y + 12, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function cleanHit(pt) {
    const b = cleanBox();
    return pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h;
  }

  function drawShadow(ctx, p) {
    const body = Feel.bodyDraw();
    const depth = Math.max(0, Math.min(1, (P.GROUND_Y - p.y) / 420));
    ctx.save();
    ctx.translate(P.PLAYER_X, P.GROUND_Y - 1);
    ctx.scale(1.05 - depth * 0.3, 0.28);
    ctx.fillStyle = "rgba(26, 20, 32, " + (0.32 - depth * 0.16).toFixed(3) + ")";
    ctx.beginPath();
    ctx.ellipse(0, 0, body.L * 0.42, body.D * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawParticles(ctx, list, front, hud) {
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (!!p.hud !== !!hud) continue;
      if (!!p.front !== front) continue;
      const a = Math.max(0, p.life / p.max);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = a;
      if (p.kind === "hex") {
        ctx.rotate(p.rot || 0);
        ctx.strokeStyle = Pal.GOLD;
        ctx.fillStyle = "rgba(240, 193, 75, 0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const ang = (k / 6) * Math.PI * 2;
          const px = Math.cos(ang) * p.size;
          const py = Math.sin(ang) * p.size;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        continue;
      }
      if (p.kind === "leaf") {
        ctx.rotate(p.rot || 0);
        ctx.scale(p.size || 0.7, p.size || 0.7);
        drawLeaf(ctx, 0, 0, 1);
        ctx.restore();
        continue;
      }
      if (p.kind === "ember") {
        ctx.globalAlpha = a * 0.15;
        ctx.fillStyle = p.color || Pal.HOT;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a;
      }
      if (p.kind === "smoke") ctx.globalAlpha = a * 0.35;
      ctx.fillStyle = p.color || (p.kind === "dust" ? Pal.ASH : Pal.HOT);
      const radius = p.kind === "smoke" ? Math.min(p.size, 8) : p.size;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawRings(ctx, rings) {
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i];
      const a = Math.max(0, r.life / r.max);
      ctx.strokeStyle = "rgba(243, 232, 212, " + (a * 0.75).toFixed(3) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawFloaters(ctx, list) {
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, f.life / f.max);
      text(ctx, f.text, f.x, f.y, 22, Pal.CREAM, Pal.INK);
      ctx.restore();
    }
  }

  function slabSize(ctx, str, size, maxW) {
    ctx.font = size + "px " + SLAB;
    while (size > 26 && ctx.measureText(str).width > maxW) {
      size -= 2;
      ctx.font = size + "px " + SLAB;
    }
    return size;
  }

  /* Soft grinder parallax behind the home plate. Not part of the run. */
  function drawHomeWorld(ctx, scroll) {
    const span = 640;
    const drift = ((scroll * 0.42) % span + span) % span;
    ctx.save();
    ctx.globalAlpha = 0.82;
    drawTowers(ctx, [
      { x: -200 - drift, gapY: 340, gapH: 260 },
      { x: 80 - drift, gapY: 400, gapH: 240 },
      { x: 400 - drift, gapY: 360, gapH: 250 },
    ]);
    ctx.restore();
  }

  function wordHairline(ctx, str, x, y, size) {
    ctx.save();
    ctx.font = size + "px " + SLAB;
    const half = ctx.measureText(str).width / 2;
    ctx.strokeStyle = Pal.GOLD;
    ctx.lineWidth = Math.max(2, size * 0.04);
    ctx.beginPath();
    ctx.moveTo(x - half, y - size * 0.52);
    ctx.lineTo(x + half, y - size * 0.52);
    ctx.stroke();
    ctx.restore();
  }

  /* Sheet wordmark: cream or gold face, ink stroke, 4px shadow. No extra badge. */
  function drawWantedLine(ctx, str, x, y, size, face) {
    ctx.save();
    ctx.font = size + "px " + SLAB;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 0;
    ctx.lineWidth = size * 0.12;
    ctx.strokeStyle = "#1A1420";
    ctx.strokeText(str, x, y);
    ctx.fillStyle = face || Pal.CREAM;
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  /* Chrome sheet: cream WANTED, one gold FLAPPY BLUNT line, small best under it. */
  function drawWantedMark(ctx, best) {
    const cx = P.W / 2;
    let titleSize = 32;
    ctx.save();
    ctx.font = titleSize + "px " + SLAB;
    while (titleSize > 24 && ctx.measureText("FLAPPY BLUNT").width > 336) {
      titleSize -= 1;
      ctx.font = titleSize + "px " + SLAB;
    }
    const wantedSize = Math.round(titleSize * 1.2);
    ctx.restore();
    const yW = 114;
    const yT = Math.round(yW + wantedSize * 0.58 + titleSize * 0.46);
    const yB = Math.round(yT + titleSize * 0.52 + 14);
    drawWantedLine(ctx, "WANTED", cx, yW, wantedSize, Pal.CREAM);
    drawWantedLine(ctx, "FLAPPY BLUNT", cx, yT, titleSize, Pal.GOLD);
    ctx.save();
    ctx.font = "16px " + FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = Pal.CREAM;
    ctx.globalAlpha = 0.92;
    ctx.fillText("best  " + (best || 0), cx, yB);
    ctx.restore();
  }

  function drawTitle(ctx, ui) {
    const home = homeLayout();
    ctx.fillStyle = "rgba(42, 22, 56, 0.30)";
    ctx.fillRect(0, 0, P.W, P.H);
    paintPlate(ctx, home.plate.x, home.plate.y, home.plate.w, home.plate.h, 22);

    drawWantedMark(ctx, ui.best);
    stamp(ctx, "One flap. Chill heist energy.", P.W / 2, 214, 13, Pal.CREAM);

    const bob = Math.sin((ui.time || 0) * 2.15) * 7;
    if (ui.equippedRing) {
      ctx.save();
      ctx.translate(P.W / 2, 336 + bob);
      ctx.strokeStyle = Pal.GOLD;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.ellipse(0, 0, 66, 34, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(P.W / 2, 336 + bob);
    ctx.rotate(ui.rot || 0);
    ctx.scale(1.22, 1.22);
    drawBlunt(ctx, ui.skin || "default", {});
    ctx.restore();

    const play = home.play;
    const pulse = 1 + Math.sin((ui.time || 0) * 3.2) * 0.015;
    ctx.save();
    ctx.translate(play.x + play.w / 2, play.y + play.h / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-(play.x + play.w / 2), -(play.y + play.h / 2));
    drawGoldButton(ctx, play, "PLAY");
    ctx.restore();
    stamp(ctx, "Tap / Space to flap.", P.W / 2, 502, 13, Pal.CREAM);
    if (ui.whisper) stamp(ctx, "Clear the grinders.", P.W / 2, 520, 11, Pal.CREAM);
  }

  function drawHUD(ctx, ui) {
    const w = 132;
    const h = 58;
    const x = (P.W - w) / 2;
    const y = 76;
    const flip = ui.flip > 0 ? Math.cos((ui.flip / 0.12) * Math.PI * 0.5) : 1;
    const pop = ui.pop || 1;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(pop, pop * (Math.abs(flip) < 0.08 ? 0.08 : flip));
    pathRound(ctx, -w / 2, -h / 2, w, h, 12);
    ctx.fillStyle = Pal.INK;
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = Pal.GOLD;
    ctx.stroke();
    text(ctx, String(ui.score), 0, 2, 36, Pal.CREAM, null);
    ctx.restore();
  }

  function drawHint() {}

  function drawGameOver(ctx, ui) {
    const scrim = ctx.createRadialGradient(P.W / 2, 420, 40, P.W / 2, 460, 520);
    scrim.addColorStop(0, "rgba(8, 4, 12, 0.2)");
    scrim.addColorStop(1, "rgba(8, 4, 12, 0.78)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, P.W, P.H);
    const d = deathLayout();
    const panel = d.panel;
    paintPlate(ctx, panel.x, panel.y, panel.w, panel.h, 24);
    drawSlab(ctx, "NIGHT HEIST", P.W / 2, panel.y + 78, 16, Pal.CREAM);
    drawSlab(ctx, "GAME OVER", P.W / 2, panel.y + 124, 36, Pal.CREAM);
    stamp(ctx, ui.rank.toUpperCase(), P.W / 2, panel.y + 156, 13, Pal.EMBER);
    stamp(ctx, "SCORE", P.W / 2, panel.y + 188, 14, Pal.CREAM);
    drawSlab(ctx, String(ui.score), P.W / 2, panel.y + 242, 68, Pal.CREAM);
    stamp(ctx, "BEST", P.W / 2, panel.y + 292, 13, Pal.GOLD);
    stamp(ctx, String(ui.best || 0), P.W / 2, panel.y + 324, 28, Pal.GOLD);
    stamp(ctx, "+" + (ui.banked || 0) + " NUGS", P.W / 2, panel.y + 358, 14, Pal.NEON);
    if (ui.ready) drawGoldButton(ctx, d.restart, "RESTART");
    else stamp(ctx, "…", P.W / 2, d.restart.y + d.restart.h / 2, 18, Pal.CREAM);
  }

  /* Local ash burst. A full-screen wash would smear the gap. */
  function drawFlash(ctx, amount, x, y) {
    if (amount <= 0) return;
    const cx = x == null ? P.PLAYER_X : x;
    const cy = y == null ? P.H * 0.45 : y;
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 72);
    g.addColorStop(0, "rgba(196, 92, 58, " + (amount * 0.42).toFixed(3) + ")");
    g.addColorStop(1, "rgba(196, 92, 58, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, 72, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawWhite(ctx, amount) {
    if (amount <= 0) return;
    ctx.fillStyle = "rgba(255, 255, 255, " + (amount * 0.82).toFixed(3) + ")";
    ctx.fillRect(0, 0, P.W, P.H);
  }

  function drawVignette(ctx) {
    const g = ctx.createRadialGradient(P.W / 2, P.H / 2, P.H * 0.32, P.W / 2, P.H * 0.55, P.H * 0.72);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(26, 20, 32, 0.42)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, P.W, P.H);
  }

  function mutePos() {
    return { x: 40, y: 36, r: 18 };
  }

  function drawMute(ctx, muted) {
    const m = mutePos();
    ctx.save();
    ctx.fillStyle = "rgba(26, 20, 32, 0.5)";
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = Pal.CREAM;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(m.x - 7, m.y - 3);
    ctx.lineTo(m.x - 2, m.y - 3);
    ctx.lineTo(m.x + 4, m.y - 8);
    ctx.lineTo(m.x + 4, m.y + 8);
    ctx.lineTo(m.x - 2, m.y + 3);
    ctx.lineTo(m.x - 7, m.y + 3);
    ctx.closePath();
    ctx.stroke();
    if (muted) {
      ctx.strokeStyle = Pal.DEATH;
      ctx.beginPath();
      ctx.moveTo(m.x - 8, m.y - 8);
      ctx.lineTo(m.x + 8, m.y + 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDebug(ctx, run) {
    const p = run.player;
    const box = P.playerBox(p.y);
    ctx.save();
    ctx.strokeStyle = "rgba(196, 92, 58, 0.95)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = "rgba(232, 168, 74, 0.9)";
    for (let i = 0; i < run.towers.length; i++) {
      const cols = P.towerColliders(run.towers[i]);
      for (let k = 0; k < cols.length; k++) {
        const col = cols[k];
        ctx.strokeRect(col.x, col.y, col.w, col.h);
      }
    }
    ctx.restore();
  }

  function clipRound(ctx, x, y, w, h, r) {
    if (r <= 0) {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      return;
    }
    pathRound(ctx, x, y, w, h, r);
  }

  root.FBDraw = {
    setChrome,
    pathRound,
    clipRound,
    text,
    drawBackground,
    drawTowers,
    drawGround,
    drawPlayer,
    drawBlunt,
    drawPickup,
    drawShop,
    shopHit,
    drawJobs,
    jobsHit,
    drawMenu,
    menuHit,
    playHit,
    drawNugs,
    drawToast,
    drawClean,
    cleanHit,
    drawBuffs,
    drawShieldRing,
    drawShadow,
    drawParticles,
    drawRings,
    drawFloaters,
    drawHomeWorld,
    drawTitle,
    drawHUD,
    drawHint,
    drawGameOver,
    drawFlash,
    drawWhite,
    drawVignette,
    drawMute,
    drawDebug,
    mutePos,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
