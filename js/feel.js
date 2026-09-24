/* Design lock. Every tunable number for feel lives here and nowhere else. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.FBFeel = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CONFIG = {
    /* 60fps physics. A press SETS vy to FLAP_IMPULSE; it does not add. */
    GRAVITY: 1450,
    FLAP_IMPULSE: -440,
    MAX_FALL: 540,
    /* Axis-aligned box. The drawn blunt uses the L28×D14 proportion, scaled so this box sits inside it. */
    HITBOX_W: 34,
    HITBOX_H: 24,

    /* Art-lock proportions. Tip diameter is TIP_RATIO times the body diameter. */
    BODY_L: 28,
    BODY_D: 14,
    TIP_RATIO: 0.85,

    /* Juice. Positive degrees point the tip up. */
    FLAP_TIP_DEG: 12,
    FALL_TIP_DEG: -8,
    HIT_FLASH: 0.08,
    SPARK_MIN: 3,
    SPARK_MAX: 5,

    /* Score bands live in scrollSpeed / gapHeight / spacingFor. Scroll caps at 250. Gap floors at 128. */
    SCROLL_START: 165,
    SCROLL_CAP: 250,
    GAP_START: 155,
    GAP_FLOOR: 128,
    PIPE_SPACING: 220,
    FIRST_PIPE_DELAY: 1.4,

    /* Pattern packs after this score. Rise/fall step the gap center. Breath widens one gap. */
    PATTERN_SCORE: 16,
    PATTERN_STEP: 14,
    BREATH_EXTRA: 12,
    BOB_SCORE: 31,
    BOB_AMP: 8,
    BOB_HZ: 0.55,
    BOB_WARN: 0.3,
    NEAR_MISS: 6,
    NEAR_MISS_CAP: 5,

    /* Death: freeze the scroll, play the beat, then a tap restarts. No menu. */
    DEATH_FREEZE: 0.15,
    DEATH_BEAT: 0.4,

    /* One active pickup. A new one replaces the old. Timers snap back to base physics. */
    PU_NUG_BONUS: 2,
    PU_HAZE_TIME: 6,
    PU_HAZE_MULT: 2,
    PU_TRAIL_TIME: 8,
    PU_IFRAME: 0.4,
    /* First pickup is the gap after the third pipe. Later ones are 4, 5, or 6 pipes apart. */
    PU_FIRST_PIPE: 4,
    PU_GAP_MIN: 4,
    PU_GAP_MAX: 6,
    PU_RADIUS: 18,
  };

  const PALETTE = {
    NIGHT: "#2A1638",
    HAZE: "#4A2F5C",
    NEON: "#3DDB6A",
    NEON_LEAF: "#3DDB6A",
    CYAN: "#2EE6D6",
    NEON_CYAN: "#2EE6D6",
    WRAP: "#C4A574",
    KRAFT: "#C4A574",
    WRAP_SHADOW: "#8A6A42",
    KRAFT_SHADOW: "#8A6A42",
    KRAFT_HIGH: "#E2C99A",
    KRAFT_DEEP: "#5C4528",
    CREAM: "#F3E8D4",
    EMBER: "#E8A84A",
    HOT: "#FF6B2C",
    EMBER_HOT: "#FF6B2C",
    GOLD: "#F0C14B",
    GOLD_DEEP: "#B8893E",
    GOLD_SHADOW: "#7A5416",
    INK: "#1A1420",
    NIGHT_INK: "#1A1420",
    DEATH: "#C45C3A",
    DEATH_JUICE: "#C45C3A",
    ASH: "#6B6570",
    PANEL_TOP: "#5A3878",
    PANEL_BOT: "#1C1028",
  };

  const SKINS = [
    { id: "default", name: "Default", trail: "#4A2F5C" },
    { id: "gold_chain", name: "Gold Chain", trail: "#E8A84A" },
    { id: "neon_kush", name: "Neon Kush", trail: "#3DDB6A" },
    { id: "galaxy_roll", name: "Galaxy Roll", trail: "#B44CFF" },
    { id: "og_heist", name: "OG Heist", trail: "#FF6B2C" },
  ];

  const PICKUPS = [
    { id: "nug_24k", name: "24K Nug", blurb: "+2 next" },
    { id: "nug_haze", name: "Purple Haze", blurb: "×2 · 6s" },
    { id: "gold_chip", name: "Gold Chip", blurb: "1 hit" },
    { id: "trail_can", name: "Trail Can", blurb: "trail · 8s" },
  ];

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  /* Drawn size. Diameter is the 24px hitbox divided by 0.8, so the box is a 20% inset. Length keeps 28:14. */
  function bodyDraw() {
    const D = CONFIG.HITBOX_H / 0.8;
    const scale = D / CONFIG.BODY_D;
    return {
      L: CONFIG.BODY_L * scale,
      D: D,
      tipD: D * CONFIG.TIP_RATIO,
      scale: scale,
    };
  }

  /* Canvas y grows downward, so a tip-up angle is a negative rotation. */
  function tipRadians(deg) {
    return (-deg * Math.PI) / 180;
  }

  /* Knots are the value at that score. In-between scores ease from the previous knot. */
  const SCROLL_BANDS = [
    { at: 0, v: 165 },
    { at: 5, v: 165 },
    { at: 15, v: 195 },
    { at: 30, v: 225 },
    { at: 50, v: 245 },
    { at: 51, v: 250 },
  ];
  const GAP_BANDS = [
    { at: 0, v: 155 },
    { at: 5, v: 155 },
    { at: 15, v: 148 },
    { at: 30, v: 140 },
    { at: 50, v: 135 },
    { at: 51, v: 128 },
  ];
  const SPACE_BANDS = [
    { at: 0, v: 220 },
    { at: 15, v: 220 },
    { at: 30, v: 210 },
    { at: 50, v: 205 },
    { at: 51, v: 200 },
  ];
  const PATTERNS = ["straight", "rise", "fall", "breath"];

  function bandValue(score, bands) {
    const s = score > 0 ? score : 0;
    if (s <= bands[0].at) return bands[0].v;
    for (let i = 1; i < bands.length; i++) {
      const a = bands[i - 1];
      const b = bands[i];
      if (s <= b.at) {
        const t = (s - a.at) / (b.at - a.at);
        return a.v + (b.v - a.v) * t;
      }
    }
    return bands[bands.length - 1].v;
  }

  function scrollSpeed(score) {
    return Math.min(CONFIG.SCROLL_CAP, bandValue(score, SCROLL_BANDS));
  }

  function gapHeight(score) {
    return Math.max(CONFIG.GAP_FLOOR, bandValue(score, GAP_BANDS));
  }

  function spacingFor(score) {
    return bandValue(score, SPACE_BANDS);
  }

  function patternTurn(seed) {
    const n = (seed || 0) % 4;
    return n < 0 ? n + 4 : n;
  }

  function patternAt(pairIndex, seed) {
    const pack = (Math.floor(pairIndex / 4) + patternTurn(seed)) % 4;
    return PATTERNS[pack];
  }

  /* One pattern slot in four bobs. Same slot every run for a given seed. */
  function packBobs(score, pairIndex, seed) {
    if (score < CONFIG.BOB_SCORE) return false;
    const pack = (Math.floor(pairIndex / 4) + patternTurn(seed)) % 4;
    return pack === 1;
  }

  /* Draw-scale only. Squash peak is sx 0.88 / sy 1.12 for the whole 70–90ms window. */
  function flapDraw(age) {
    const ms = (age || 0) * 1000;
    if (ms < 40) return { sx: 1.02, sy: 0.98, wing: -0.55 };
    if (ms < 70) return { sx: 0.95, sy: 1.05, wing: -0.12 };
    if (ms < 90) return { sx: 0.88, sy: 1.12, wing: 0.55 };
    if (ms < 140) return { sx: 0.94, sy: 1.06, wing: 0.2 };
    if (ms < 200) return { sx: 0.98, sy: 1.02, wing: 0.06 };
    return { sx: 1, sy: 1, wing: 0 };
  }

  function heistRank(best) {
    if (best >= 50) return "Legend";
    if (best >= 25) return "Crew";
    if (best >= 10) return "Runner";
    return "";
  }

  return {
    CONFIG: CONFIG,
    PALETTE: PALETTE,
    SKINS: SKINS,
    PICKUPS: PICKUPS,
    clamp: clamp,
    scrollSpeed: scrollSpeed,
    gapHeight: gapHeight,
    spacingFor: spacingFor,
    patternAt: patternAt,
    packBobs: packBobs,
    flapDraw: flapDraw,
    heistRank: heistRank,
    bodyDraw: bodyDraw,
    tipRadians: tipRadians,
  };
});
