/* Nugs, jobs, and the skin shop. No physics. Missions never mention power-ups. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.FBMeta = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const KEY = "flappyblunt.meta";
  const DAY = 24 * 60 * 60 * 1000;
  const WEEK = 7 * DAY;

  const PRICES = {
    default: 0,
    gold_chain: 200,
    neon_kush: 350,
    galaxy_roll: 500,
    og_heist: 750,
  };

  const MISSIONS = [
    { id: "pipes", name: "Clear 5 pipes", goal: 5, reward: 25, period: "day", stat: "pipes" },
    { id: "run15", name: "Score 15 in one run", goal: 15, reward: 50, period: "day", stat: "bestRun" },
    { id: "deaths", name: "Die 3 times", goal: 3, reward: 15, period: "day", stat: "deaths" },
    { id: "week30", name: "Best score 30", goal: 30, reward: 150, period: "week", stat: "weekBest" },
  ];

  function blank(now) {
    return {
      nugs: 0,
      owned: ["default"],
      dailyAt: now,
      weekAt: now,
      pipes: 0,
      bestRun: 0,
      deaths: 0,
      weekBest: 0,
      lifetimePipes: 0,
      pipe5: false,
      heist15: false,
      fullCrew: false,
      lastPlay: "",
      streak: 0,
      streakToast: false,
      claimed: {},
    };
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
        if (parsed && typeof parsed === "object") {
          if (Number.isFinite(parsed.nugs) && parsed.nugs > 0) state.nugs = Math.floor(parsed.nugs);
          if (Array.isArray(parsed.owned)) {
            state.owned = ["default"];
            for (let i = 0; i < parsed.owned.length; i++) {
              if (PRICES[parsed.owned[i]] != null && state.owned.indexOf(parsed.owned[i]) < 0) {
                state.owned.push(parsed.owned[i]);
              }
            }
          }
          ["dailyAt", "weekAt", "pipes", "bestRun", "deaths", "weekBest", "lifetimePipes"].forEach(function (k) {
            if (Number.isFinite(parsed[k]) && parsed[k] >= 0) state[k] = parsed[k];
          });
          if (parsed.pipe5) state.pipe5 = true;
          if (parsed.heist15) state.heist15 = true;
          if (parsed.fullCrew) state.fullCrew = true;
          if (typeof parsed.lastPlay === "string") state.lastPlay = parsed.lastPlay;
          if (Number.isFinite(parsed.streak) && parsed.streak > 0) state.streak = Math.min(7, Math.floor(parsed.streak));
          if (parsed.streakToast) state.streakToast = true;
          if (parsed.claimed && typeof parsed.claimed === "object") state.claimed = parsed.claimed;
        }
      } catch (e) {
        state = blank(now());
      }
      refresh();
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

    function owns(id) {
      return state.owned.indexOf(id) >= 0;
    }

    function ownsAll() {
      const ids = [];
      for (const id in PRICES) ids.push(id);
      if (ids.length < 5) return false;
      for (let i = 0; i < ids.length; i++) if (!owns(ids[i])) return false;
      return true;
    }

    function pad2(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function dayKey(t) {
      const d = new Date(t);
      return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
    }

    function prevDayKey(key) {
      const parts = key.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      d.setDate(d.getDate() - 1);
      return dayKey(d.getTime());
    }

    function notePlay() {
      refresh();
      const today = dayKey(now());
      if (state.lastPlay === today) return 0;
      if (state.lastPlay && prevDayKey(today) === state.lastPlay) {
        state.streak = Math.min(7, (state.streak || 0) + 1);
      } else {
        state.streak = 1;
      }
      state.lastPlay = today;
      state.nugs += 10;
      state.streakToast = true;
      save();
      return state.streak;
    }

    function takeStreakToast() {
      refresh();
      if (!state.streakToast) return null;
      const info = { streak: state.streak, nugs: 10 };
      state.streakToast = false;
      save();
      return info;
    }

    function grantFullCrew() {
      if (state.fullCrew || !ownsAll()) return 0;
      state.fullCrew = true;
      state.nugs += 100;
      return 100;
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
      PRICES: PRICES,
      MISSIONS: MISSIONS,
      DAY: DAY,
      WEEK: WEEK,
      nugs: function () { refresh(); return state.nugs; },
      owns: function (id) { refresh(); return owns(id); },
      ownedCount: function () { refresh(); return state.owned.length; },
      armHeist: function () {
        refresh();
        if (state.heist15) return false;
        state.heist15 = true;
        save();
        return true;
      },
      addNugs: function (n) {
        refresh();
        const add = Math.max(0, Math.floor(n || 0));
        state.nugs += add;
        save();
        return state.nugs;
      },
      notePipe: function () {
        refresh();
        state.pipes += 1;
        state.lifetimePipes += 1;
        let grant = 0;
        if (!state.pipe5 && state.lifetimePipes === 5) {
          state.pipe5 = true;
          state.nugs += 25;
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
      missions: missions,
      claim: function (id) {
        const list = missions();
        let found = null;
        for (let i = 0; i < list.length; i++) if (list[i].id === id) found = list[i];
        if (!found || !found.ready) return 0;
        state.claimed[id] = true;
        state.nugs += found.reward;
        save();
        return found.reward;
      },
      buy: function (id) {
        refresh();
        if (PRICES[id] == null) return "missing";
        if (owns(id)) return "owned";
        if (state.nugs < PRICES[id]) return "broke";
        state.nugs -= PRICES[id];
        state.owned.push(id);
        const crew = grantFullCrew();
        save();
        return crew ? "crew" : "bought";
      },
      takeFullCrew: function () {
        refresh();
        const n = grantFullCrew();
        if (n) save();
        return n;
      },
      notePlay: notePlay,
      takeStreakToast: takeStreakToast,
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
