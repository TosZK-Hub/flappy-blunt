/* Coins, challenges, and chest rolls. Costumes are not sold directly. */
(function (root, factory) {
  const Feel = typeof module !== "undefined" && module.exports ? require("./feel.js") : root.FBFeel;
  const api = factory(Feel);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.FBMeta = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Feel) {
  "use strict";
  const KEY = "flappyblunt.meta";
  const DAY = 24 * 60 * 60 * 1000;
  const WEEK = 7 * DAY;
  const FULL_KIT = 150;
  const STREAK_BONUS = 10;
  const DUPE_RATE = 0.4;

  const ROSTER = Feel.COSTUMES;
  const CHESTS = Feel.CHESTS;
  const RANK = Feel.RARITY_RANK;

  const MISSIONS = [
    { id: "pipes", name: "Clear 5 stacks", goal: 5, reward: 25, period: "day", stat: "pipes" },
    { id: "run15", name: "Score 15 in one run", goal: 15, reward: 50, period: "day", stat: "bestRun" },
    { id: "deaths", name: "Crash 3 times", goal: 3, reward: 15, period: "day", stat: "deaths" },
    { id: "week30", name: "Best score 30", goal: 30, reward: 150, period: "week", stat: "weekBest" },
  ];

  function chestById(id) {
    for (let i = 0; i < CHESTS.length; i++) if (CHESTS[i].id === id) return CHESTS[i];
    return null;
  }

  function known(id) {
    for (let i = 0; i < ROSTER.length; i++) if (ROSTER[i].id === id) return ROSTER[i];
    return null;
  }

  function localDay(t) {
    const d = new Date(t);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function blank(now) {
    return {
      coins: 0,
      coinsMigrated: true,
      owned: ["starter_tee"],
      pity: { street: 0, township: 0, bok: 0 },
      dailyAt: now,
      weekAt: now,
      pipes: 0,
      bestRun: 0,
      deaths: 0,
      weekBest: 0,
      lifetimePipes: 0,
      pipe5: false,
      fullKit: false,
      claimed: {},
      lastRunDay: 0,
      streak: 0,
      pendingStreak: 0,
    };
  }

  function pickRarity(weights, rng) {
    const order = ["C", "R", "E", "L"];
    let t = rng();
    let acc = 0;
    for (let i = 0; i < order.length; i++) {
      acc += weights[order[i]] || 0;
      if (t < acc) return order[i];
    }
    return "L";
  }

  function poolFor(rarity) {
    const pool = [];
    for (let i = 0; i < ROSTER.length; i++) if (ROSTER[i].rarity === rarity) pool.push(ROSTER[i]);
    return pool;
  }

  function create(storage, nowFn) {
    const now = nowFn || function () { return Date.now(); };
    let state = blank(now());

    function save() {
      try {
        storage.setItem(KEY, JSON.stringify(state));
      } catch (e) {
        /* private mode */
      }
    }

    function owns(id) {
      return state.owned.indexOf(id) >= 0;
    }

    function ownsAll() {
      if (ROSTER.length < 12) return false;
      for (let i = 0; i < ROSTER.length; i++) if (!owns(ROSTER[i].id)) return false;
      return true;
    }

    function grantFullKit() {
      if (state.fullKit || !ownsAll()) return 0;
      state.fullKit = true;
      state.coins += FULL_KIT;
      return FULL_KIT;
    }

    function refresh() {
      const t = now();
      let changed = false;
      if (!state.dailyAt || t - state.dailyAt >= DAY) {
        state.pipes = 0;
        state.bestRun = 0;
        state.deaths = 0;
        state.claimed.pipes = false;
        state.claimed.run15 = false;
        state.claimed.deaths = false;
        state.dailyAt = t;
        changed = true;
      }
      if (!state.weekAt || t - state.weekAt >= WEEK) {
        state.weekBest = 0;
        state.claimed.week30 = false;
        state.weekAt = t;
        changed = true;
      }
      if (changed) save();
    }

    function bumpScore(score) {
      const n = score > 0 ? score : 0;
      if (n > state.bestRun) state.bestRun = n;
      if (n > state.weekBest) state.weekBest = n;
    }

    function applyOwned(list) {
      state.owned = ["starter_tee"];
      if (!Array.isArray(list)) return;
      for (let i = 0; i < list.length; i++) {
        const id = list[i];
        if (id !== "starter_tee" && known(id) && state.owned.indexOf(id) < 0) state.owned.push(id);
      }
    }

    function load() {
      try {
        const raw = storage.getItem(KEY);
        if (!raw) {
          state = blank(now());
          save();
          return;
        }
        const parsed = JSON.parse(raw);
        state = blank(now());
        if (!parsed || typeof parsed !== "object") {
          save();
          return;
        }
        if (parsed.coinsMigrated) {
          if (Number.isFinite(parsed.coins) && parsed.coins > 0) state.coins = Math.floor(parsed.coins);
          state.coinsMigrated = true;
        } else {
          const nugs = Number.isFinite(parsed.nugs) && parsed.nugs > 0 ? Math.floor(parsed.nugs) : 0;
          state.coins = nugs;
          state.coinsMigrated = true;
        }
        applyOwned(parsed.owned);
        ["dailyAt", "weekAt", "pipes", "bestRun", "deaths", "weekBest", "lifetimePipes", "lastRunDay", "streak"].forEach(function (k) {
          if (Number.isFinite(parsed[k]) && parsed[k] >= 0) state[k] = parsed[k];
        });
        if (parsed.pipe5) state.pipe5 = true;
        if (parsed.fullKit) state.fullKit = true;
        if (parsed.claimed && typeof parsed.claimed === "object") state.claimed = parsed.claimed;
        if (parsed.pity && typeof parsed.pity === "object") {
          ["street", "township", "bok"].forEach(function (id) {
            if (Number.isFinite(parsed.pity[id]) && parsed.pity[id] > 0) state.pity[id] = Math.floor(parsed.pity[id]);
          });
        }
        if (Number.isFinite(parsed.pendingStreak) && parsed.pendingStreak > 0) {
          state.pendingStreak = Math.floor(parsed.pendingStreak);
        }
      } catch (e) {
        state = blank(now());
      }
      refresh();
      save();
    }

    function missions() {
      refresh();
      return MISSIONS.map(function (m) {
        const progress = Math.min(m.goal, state[m.stat] || 0);
        const claimed = !!state.claimed[m.id];
        return {
          id: m.id,
          name: m.name,
          goal: m.goal,
          reward: m.reward,
          period: m.period,
          progress: progress,
          claimed: claimed,
          ready: progress >= m.goal && !claimed,
        };
      });
    }

    load();

    return {
      CHESTS: CHESTS,
      ROSTER: ROSTER,
      MISSIONS: MISSIONS,
      DAY: DAY,
      WEEK: WEEK,
      FULL_KIT: FULL_KIT,
      coins: function () { refresh(); return state.coins; },
      streak: function () { return state.streak || 0; },
      pity: function (id) { return state.pity[id] || 0; },
      owns: function (id) { refresh(); return owns(id); },
      ownedCount: function () { refresh(); return state.owned.length; },
      addCoins: function (n) {
        refresh();
        const add = Math.max(0, Math.floor(n || 0));
        state.coins += add;
        save();
        return state.coins;
      },
      notePipe: function () {
        refresh();
        state.pipes += 1;
        state.lifetimePipes += 1;
        let grant = 0;
        if (!state.pipe5 && state.lifetimePipes === 5) {
          state.pipe5 = true;
          state.coins += 25;
          grant = 25;
        }
        save();
        return grant;
      },
      noteScore: function (score) {
        refresh();
        bumpScore(score);
        save();
      },
      noteDeath: function (score) {
        refresh();
        state.deaths += 1;
        bumpScore(score);
        save();
      },
      noteRun: function () {
        refresh();
        const today = localDay(now());
        if (state.lastRunDay === today) return 0;
        const prev = state.lastRunDay || 0;
        state.lastRunDay = today;
        if (prev && today - prev === DAY) state.streak = Math.min(7, (state.streak || 0) + 1);
        else state.streak = 1;
        state.coins += STREAK_BONUS;
        state.pendingStreak = state.streak;
        save();
        return STREAK_BONUS;
      },
      takeStreakToast: function () {
        const n = state.pendingStreak || 0;
        if (!n) return "";
        state.pendingStreak = 0;
        save();
        return "Streak " + n + " · +10 coins";
      },
      missions: missions,
      claim: function (id) {
        const list = missions();
        let found = null;
        for (let i = 0; i < list.length; i++) if (list[i].id === id) found = list[i];
        if (!found || !found.ready) return 0;
        state.claimed[id] = true;
        state.coins += found.reward;
        save();
        return found.reward;
      },
      open: function (id, rng) {
        refresh();
        const chest = chestById(id);
        if (!chest) return { error: "missing" };
        if (state.coins < chest.cost) return { error: "broke" };
        const random = rng || Math.random;
        const misses = state.pity[chest.id] || 0;
        let rarity = pickRarity(chest.weights, random);
        if (misses >= chest.pityAfter && (RANK[rarity] || 0) < (RANK[chest.pityRarity] || 0)) {
          rarity = chest.pityRarity;
        }
        const pool = poolFor(rarity);
        const costume = pool[Math.floor(random() * pool.length) % pool.length];
        const dupe = owns(costume.id);
        state.coins -= chest.cost;
        let refund = 0;
        if (dupe) {
          refund = Math.round(chest.cost * DUPE_RATE);
          state.coins += refund;
        } else {
          state.owned.push(costume.id);
        }
        const hit = (RANK[rarity] || 0) >= (RANK[chest.pityRarity] || 0);
        state.pity[chest.id] = hit ? 0 : misses + 1;
        const full = grantFullKit();
        save();
        return {
          ok: true,
          id: costume.id,
          name: costume.name,
          rarity: costume.rarity,
          dupe: dupe,
          refund: refund,
          full: full,
          coins: state.coins,
          chest: chest.id,
        };
      },
      takeFullKit: function () {
        refresh();
        const n = grantFullKit();
        if (n) save();
        return n;
      },
    };
  }

  const browserStore = {
    getItem: function (k) {
      try { return localStorage.getItem(k); } catch (e) { return null; }
    },
    setItem: function (k, v) {
      try { localStorage.setItem(k, v); } catch (e) { /* ignore */ }
    },
  };

  const live = create(browserStore, function () { return Date.now(); });
  live.create = create;
  return live;
});
