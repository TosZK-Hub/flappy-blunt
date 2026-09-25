/* Locks for the SA cartoon upgrade. Run with: node tests/sa-upgrade.test.js */
const assert = require("assert");
const Feel = require("../js/feel.js");
const P = require("../js/physics.js");
const Meta = require("../js/meta.js");

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function gapX(a, b) {
  if (a.x + a.w <= b.x) return b.x - (a.x + a.w);
  if (b.x + b.w <= a.x) return a.x - (b.x + b.w);
  return 0;
}

function memory() {
  const data = Object.create(null);
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem: function (k, v) { data[k] = String(v); },
    raw: data,
  };
}

const C = Feel.CONFIG;
assert.strictEqual(C.GRAVITY, 1450);
assert.strictEqual(C.FLAP_IMPULSE, -440);
assert.strictEqual(C.MAX_FALL, 540);
assert.strictEqual(C.HITBOX_W, 34);
assert.strictEqual(C.HITBOX_H, 24);
assert.ok(P.runwaySeconds() >= 1.4);
assert.strictEqual(P.playerBox(100).w, 34);
assert.strictEqual(P.playerBox(100).h, 24);
assert.deepStrictEqual(Feel.PICKUPS, []);

const teach = Feel.feelAt(0);
assert.strictEqual(teach.name, "Teach");
assert.strictEqual(teach.scroll, 165);
assert.strictEqual(teach.gap, 155);
assert.strictEqual(teach.spacing, 220);
assert.deepStrictEqual(Feel.feelAt(5), teach);
const warm = Feel.feelAt(15);
assert.strictEqual(warm.name, "Warm");
assert.strictEqual(warm.scroll, 195);
assert.strictEqual(warm.gap, 148);
assert.strictEqual(warm.spacing, 220);
const rise = Feel.feelAt(30);
assert.strictEqual(rise.name, "Rise");
assert.strictEqual(rise.scroll, 225);
assert.strictEqual(rise.gap, 140);
assert.strictEqual(rise.spacing, 210);
const heat = Feel.feelAt(50);
assert.strictEqual(heat.name, "Heat");
assert.strictEqual(heat.scroll, 245);
assert.strictEqual(heat.gap, 135);
assert.strictEqual(heat.spacing, 205);
const legend = Feel.feelAt(51);
assert.strictEqual(legend.name, "Legend");
assert.strictEqual(legend.scroll, 250);
assert.strictEqual(legend.gap, 128);
assert.strictEqual(legend.spacing, 200);
for (let s = 0; s <= 80; s++) {
  const band = Feel.feelAt(s);
  assert.ok(band.gap >= 128, "gap " + s);
  assert.ok(band.scroll <= 250, "scroll " + s);
}

const peak = Feel.flapDraw(80);
assert.strictEqual(peak.frame, "F4");
assert.strictEqual(peak.sx, 0.88);
assert.strictEqual(peak.sy, 1.12);
assert.strictEqual(Feel.flapDraw(40).frame, "F3");
assert.strictEqual(Feel.flapDraw(90).frame, "F5");
assert.strictEqual(Feel.flapDraw(200).sx, 1);
assert.strictEqual(Feel.flapDraw(-1).frame, "F0");

assert.strictEqual(Feel.COSTUMES.length, 12);
const counts = { C: 0, R: 0, E: 0, L: 0 };
Feel.COSTUMES.forEach(function (c) { counts[c.rarity] += 1; });
assert.deepStrictEqual(counts, { C: 5, R: 4, E: 2, L: 1 });
assert.strictEqual(Feel.COSTUMES[0].id, "starter_tee");
assert.strictEqual(Feel.rankTitle(9), "");
assert.strictEqual(Feel.rankTitle(10), "Rookie");
assert.strictEqual(Feel.rankTitle(25), "Squad");
assert.strictEqual(Feel.rankTitle(50), "Legend");
assert.strictEqual(Feel.motifFor(0, 1), "braai_drum");
assert.strictEqual(Feel.motifFor(80, 1), "protea_column");

const run = P.createRun(7);
run.spawned = true;
run.gapY = 300;
run.packPairs = 4;
const riseStep = P.patternStep(run, 16);
assert.strictEqual(riseStep.pack, 1);
assert.strictEqual(riseStep.gapY, 314);
run.packPairs = 8;
run.gapY = 320;
const fall = P.patternStep(run, 16);
assert.strictEqual(fall.pack, 2);
assert.strictEqual(fall.gapY, 306);
run.packPairs = 12;
const breath = P.patternStep(run, 16);
assert.strictEqual(breath.pack, 3);
assert.strictEqual(breath.slot, 0);
assert.ok(Math.abs(breath.gapH - (Feel.gapHeight(16) + 12)) < 0.001);
assert.strictEqual(breath.bob, false);
const resume = P.patternStep(run, 16);
assert.strictEqual(resume.slot, 1);
assert.strictEqual(resume.gapH, Feel.gapHeight(16));

const bobRun = P.createRun(3);
bobRun.spawned = true;
bobRun.gapY = 300;
let bobbed = null;
for (let i = 0; i < 16; i++) {
  const shaped = P.patternStep(bobRun, 31);
  if (shaped.pack === 3) bobbed = shaped;
}
assert.ok(bobbed && bobbed.bob);

const flapped = P.createPlayer();
P.stepPlayer(flapped, 1 / 60, true, false);
assert.ok(Math.abs(flapped.vy - (C.FLAP_IMPULSE + C.GRAVITY / 60)) < 0.001);
assert.strictEqual(flapped.sx, 1);
assert.strictEqual(flapped.sy, 1);

const early = P.createRun(1);
const first = P.patternStep(early, 0);
assert.strictEqual(first.pack, -1);
assert.strictEqual(first.gapH, 155);

const box = P.playerBox(200);
const tower = { x: 0, gapY: 200, gapH: 155 };
const clearance = P.skimClearance(200, tower);
assert.ok(clearance > 6);
const lip = 200 - 155 / 2;
const skimY = lip + 12 + 4;
assert.ok(P.skimClearance(skimY, tower) <= 6);
assert.ok(P.skimClearance(skimY, tower) >= 0);

const store = memory();
store.setItem("flappyblunt.meta", JSON.stringify({
  nugs: 40,
  owned: ["default", "gold_chain", "og_heist"],
  pipes: 2,
}));
let clock = Date.UTC(2026, 8, 1, 12);
const meta = Meta.create(store, function () { return clock; });
assert.strictEqual(meta.coins(), 40);
assert.strictEqual(meta.owns("starter_tee"), true);
assert.strictEqual(meta.owns("gold_chain"), false);
assert.strictEqual(meta.owns("default"), false);
const again = Meta.create(store, function () { return clock; });
assert.strictEqual(again.coins(), 40);

clock = Date.UTC(2026, 8, 2, 9);
assert.strictEqual(meta.noteRun(), 10);
assert.strictEqual(meta.streak(), 1);
assert.strictEqual(meta.coins(), 50);
assert.strictEqual(meta.takeStreakToast(), "Streak 1 · +10 coins");
assert.strictEqual(meta.noteRun(), 0);
clock = Date.UTC(2026, 8, 3, 9);
assert.strictEqual(meta.noteRun(), 10);
assert.strictEqual(meta.streak(), 2);
clock = Date.UTC(2026, 8, 5, 9);
assert.strictEqual(meta.noteRun(), 10);
assert.strictEqual(meta.streak(), 1);

const rich = memory();
const shop = Meta.create(rich, function () { return clock; });
assert.strictEqual(typeof shop.buy, "undefined");
shop.addCoins(100);
const dupe = shop.open("street", function () { return 0; });
assert.strictEqual(dupe.dupe, true);
assert.strictEqual(dupe.id, "starter_tee");
assert.strictEqual(dupe.refund, 40);
assert.strictEqual(shop.coins(), 40);

const pityStore = memory();
const pity = Meta.create(pityStore, function () { return clock; });
pity.addCoins(2000);
for (let i = 0; i < 10; i++) {
  const roll = pity.open("street", function () { return 0; });
  assert.strictEqual(roll.rarity, "C");
}
assert.strictEqual(pity.pity("street"), 10);
const forced = pity.open("street", function () { return 0; });
assert.ok(Feel.RARITY_RANK[forced.rarity] >= Feel.RARITY_RANK.R);
assert.strictEqual(pity.pity("street"), 0);

const town = Meta.create(memory(), function () { return clock; });
town.addCoins(300 * 6);
for (let i = 0; i < 5; i++) {
  const roll = town.open("township", function () { return 0; });
  assert.strictEqual(roll.rarity, "C");
}
const epic = town.open("township", function () { return 0; });
assert.ok(Feel.RARITY_RANK[epic.rarity] >= Feel.RARITY_RANK.E);

const kitStore = memory();
kitStore.setItem("flappyblunt.meta", JSON.stringify({
  coinsMigrated: true,
  coins: 750,
  owned: Feel.COSTUMES.map(function (c) { return c.id; }).filter(function (id) { return id !== "bok_legend"; }),
  fullKit: false,
  pity: { street: 0, township: 0, bok: 0 },
}));
const kit = Meta.create(kitStore, function () { return clock; });
const last = kit.open("bok", function () { return 0.95; });
assert.strictEqual(last.id, "bok_legend");
assert.strictEqual(last.dupe, false);
assert.strictEqual(last.full, 150);
assert.strictEqual(kit.coins(), 150);
assert.strictEqual(kit.takeFullKit(), 0);

assert.strictEqual(Feel.CHESTS[0].cost, 100);
assert.strictEqual(Feel.CHESTS[1].cost, 300);
assert.strictEqual(Feel.CHESTS[2].cost, 750);

global.FBFeel = Feel;
global.FBPhysics = P;
require("../js/render.js");
const home = global.FBDraw.homeLayout();
const death = global.FBDraw.deathLayout();
const stash = global.FBDraw.stashLayout(true);
assert.ok(home.play.h >= 56);
assert.ok(!overlaps(home.play, home.challenges));
assert.ok(!overlaps(home.play, home.chests));
assert.ok(!overlaps(home.play, home.collection));
assert.ok(gapX(home.challenges, home.chests) >= 16);
assert.ok(gapX(death.home, death.challenges) >= 16);
assert.ok(gapX(death.challenges, death.chests) >= 16);
assert.ok(death.restart.y - (stash.job.y + stash.job.h) >= 16);
assert.ok(!overlaps(death.restart, death.home));
assert.ok(!overlaps(death.restart, stash.coins));
assert.ok(!overlaps(death.restart, stash.job));

console.log("sa-upgrade tests passed");
