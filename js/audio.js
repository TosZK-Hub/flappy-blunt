/* Small Web Audio bleeps — puff, chime, thud. No sample assets. */
(function (root) {
  "use strict";

  let ctx = null;
  let master = null;
  let noiseBuffer = null;
  let muted = false;

  function ac() {
    if (ctx) return ctx;
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.2;
    master.connect(ctx.destination);
    return ctx;
  }

  function noise() {
    const context = ac();
    if (!context) return null;
    if (noiseBuffer) return noiseBuffer;
    const len = Math.floor(context.sampleRate * 0.45);
    const buf = context.createBuffer(1, len, context.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
    return buf;
  }

  function unlock() {
    const context = ac();
    if (context && context.state === "suspended") context.resume();
  }

  function setMuted(value) {
    muted = !!value;
    if (master) master.gain.value = muted ? 0 : 0.2;
  }

  function tone(type, f0, f1, dur, peak, delay) {
    const context = ac();
    if (!context || muted) return;
    const t = context.currentTime + (delay || 0);
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(40, f0), t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.02, dur * 0.4));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function burst(freq, q, dur, peak, delay) {
    const context = ac();
    const buf = noise();
    if (!context || !buf || muted) return;
    const t = context.currentTime + (delay || 0);
    const src = context.createBufferSource();
    src.buffer = buf;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = q;
    const gain = context.createGain();
    gain.gain.setValueAtTime(peak, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t);
    src.stop(t + dur);
  }

  function flap() {
    const wobble = 0.92 + Math.random() * 0.16;
    burst(520 * wobble, 0.7, 0.09, 0.22, 0);
    tone("sine", 210 * wobble, 120, 0.1, 0.06, 0);
  }

  function score() {
    tone("sine", 620, 640, 0.08, 0.07, 0);
    tone("triangle", 930, 980, 0.14, 0.05, 0.07);
  }

  function crash() {
    const context = ac();
    if (!context || muted) return;
    const t = context.currentTime;
    const src = context.createBufferSource();
    src.buffer = noise();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(420, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.32);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t);
    src.stop(t + 0.36);
    tone("triangle", 180, 48, 0.38, 0.1, 0);
  }

  function fanfare() {
    tone("sine", 523, 540, 0.12, 0.06, 0.18);
    tone("sine", 659, 680, 0.14, 0.05, 0.28);
    tone("triangle", 784, 820, 0.22, 0.05, 0.38);
  }

  root.FBAudio = { unlock, setMuted, flap, score, crash, fanfare };
})(typeof globalThis !== "undefined" ? globalThis : window);
