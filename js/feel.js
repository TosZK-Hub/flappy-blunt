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

    /* Scroll ramps from the start speed to SCROLL_END across the first SCROLL_SCORE puffs. */
    SCROLL_START: 165,
    SCROLL_END: 245,
    SCROLL_SCORE: 20,

    /* Opening starts wide, reaches GAP_AT_SCORE at GAP_SCORE, and never goes under GAP_FLOOR. */
    GAP_START: 155,
    GAP_AT_SCORE: 135,
    GAP_SCORE: 25,
    GAP_FLOOR: 125,

    /* Fixed distance between gate pairs. First gate can touch the blunt after this delay. */
    PIPE_SPACING: 220,
    FIRST_PIPE_DELAY: 1.4,

    /* Death: freeze the scroll, play the beat, then a tap restarts. No menu. */
    DEATH_FREEZE: 0.15,
    DEATH_BEAT: 0.4,

    /* One active pickup. A new one replaces the old. Timers snap back to base physics. */
    PU_NUG_BONUS: 2,
    PU_HAZE_TIME: 6,
    PU_HAZE_MULT: 2,
    PU_ROCKET_TIME: 4,
    PU_ROCKET_MULT: 1.25,
    PU_FLOAT_TIME: 5,
    PU_FLOAT_GRAVITY: 0.7,
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
    { id: "dab_rocket", name: "Dab Rocket", blurb: "scroll · 4s" },
    { id: "magic_gummies", name: "Gummies", blurb: "float · 5s" },
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

  function scrollSpeed(score) {
    const t = clamp(score, 0, CONFIG.SCROLL_SCORE) / CONFIG.SCROLL_SCORE;
    return CONFIG.SCROLL_START + (CONFIG.SCROLL_END - CONFIG.SCROLL_START) * t;
  }

  function gapHeight(score) {
    const span = CONFIG.GAP_SCORE;
    const t = clamp(score, 0, span) / span;
    let gap = CONFIG.GAP_START + (CONFIG.GAP_AT_SCORE - CONFIG.GAP_START) * t;
    if (score > span) {
      const slope = (CONFIG.GAP_START - CONFIG.GAP_AT_SCORE) / span;
      gap = CONFIG.GAP_AT_SCORE - (score - span) * slope;
    }
    return Math.max(CONFIG.GAP_FLOOR, gap);
  }

  return {
    CONFIG: CONFIG,
    PALETTE: PALETTE,
    SKINS: SKINS,
    PICKUPS: PICKUPS,
    clamp: clamp,
    scrollSpeed: scrollSpeed,
    gapHeight: gapHeight,
    bodyDraw: bodyDraw,
    tipRadians: tipRadians,
  };
});
