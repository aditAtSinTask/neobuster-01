'use strict';
// NEOBUSTER — core: canvas, helpers, input, audio, music, pixel font, sprite + glow primitives.

// bump on every change (and add a line to the changelog in readme.md)
const VERSION = '0.7.0';
document.title = 'Neobuster v' + VERSION;

const TILE = 16, VW = 384, VH = 224;
const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d');
cvs.width = VW; cvs.height = VH;
ctx.imageSmoothingEnabled = false;

function fit() {
  let s = Math.min(innerWidth / VW, innerHeight / VH);
  s = s >= 1 ? Math.floor(s) : s;
  cvs.style.width = VW * s + 'px';
  cvs.style.height = VH * s + 'px';
}
addEventListener('resize', fit);
fit();

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function R(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y), Math.max(0.5, r), 0, 7); ctx.fill(); }
function mulberry(seed) {
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function makeCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  if (draw) draw(g);
  return c;
}

// ---------- colour helpers ----------
function hexToRgb(h) {
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  const n = parseInt(h.slice(1, 7), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
const _shade = new Map();
function shade(hex, amt) {
  const k = hex + amt;
  let v = _shade.get(k);
  if (v) return v;
  const f = c => Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt));
  v = '#' + hexToRgb(hex).map(c => f(c).toString(16).padStart(2, '0')).join('');
  _shade.set(k, v);
  return v;
}
const rgba = (hex, a) => { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };

// ---------- sprites ----------
// parts: [x,y,w,h,color] get a dark outline (all outlines first, then fills) plus a top highlight and
// bottom shadow row; dets are flat details drawn on top. f<0 mirrors the sprite inside a box of width W.
function sprite(ox, oy, f, W, parts, dets) {
  ox = Math.round(ox); oy = Math.round(oy);
  const mx = (x, w) => (f > 0 ? ox + x : ox + W - x - w);
  ctx.fillStyle = '#0a0a16';
  for (const p of parts) ctx.fillRect(mx(p[0] - 1, p[2] + 2), oy + p[1] - 1, p[2] + 2, p[3] + 2);
  for (const p of parts) {
    const X = mx(p[0], p[2]), Y = oy + p[1];
    ctx.fillStyle = p[4]; ctx.fillRect(X, Y, p[2], p[3]);
    if (p[3] >= 3 && p[2] >= 2) {
      ctx.fillStyle = shade(p[4], 0.35); ctx.fillRect(X, Y, p[2], 1);
      ctx.fillStyle = shade(p[4], -0.3); ctx.fillRect(X, Y + p[3] - 1, p[2], 1);
    }
  }
  if (dets) for (const p of dets) { ctx.fillStyle = p[4]; ctx.fillRect(mx(p[0], p[2]), oy + p[1], p[2], p[3]); }
}

// ---------- additive glow (cached radial gradients) ----------
const _glow = new Map();
function glowSprite(color, r) {
  const k = color + r;
  let c = _glow.get(k);
  if (c) return c;
  c = makeCanvas(r * 2, r * 2, g => {
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, rgba(color, 0.85));
    gr.addColorStop(0.35, rgba(color, 0.35));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, r * 2, r * 2);
  });
  _glow.set(k, c);
  return c;
}
// jagged lightning from (x0,y0) to (x1,y1): a coloured core with a white centre, re-rolled whenever seed changes
function drawBolt(x0, y0, x1, y1, seed, col = '#f8f058', thick = 2, amp = 12) {
  const rnd = mulberry(seed | 0), len = Math.hypot(x1 - x0, y1 - y0) || 1, n = Math.max(2, Math.round(len / 10));
  const nx = -(y1 - y0) / len, ny = (x1 - x0) / len, pts = [[x0, y0]];
  for (let i = 1; i < n; i++) { const t = i / n, o = (rnd() - 0.5) * amp; pts.push([x0 + (x1 - x0) * t + nx * o, y0 + (y1 - y0) * t + ny * o]); }
  pts.push([x1, y1]);
  for (const [w, c] of [[thick + 2, col], [Math.max(1, thick - 1), '#fcfcfc']]) {
    ctx.fillStyle = c;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], st = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))));
      for (let k = 0; k <= st; k++) ctx.fillRect(Math.round(ax + (bx - ax) * k / st - w / 2), Math.round(ay + (by - ay) * k / st - w / 2), w, w);
    }
  }
}
function glow(x, y, r, color, a = 1) {
  r = Math.max(2, Math.round(r / 2) * 2);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(a, 0, 1);
  ctx.drawImage(glowSprite(color, r), Math.round(x - r), Math.round(y - r));
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------- input ----------
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  KeyZ: 'jump', KeyJ: 'jump', Space: 'jump',
  KeyX: 'shoot', KeyK: 'shoot', KeyC: 'slide', KeyL: 'slide',
  KeyQ: 'prev', KeyE: 'next', Enter: 'start', Escape: 'start', KeyR: 'reset', // P + O opens the cheat box (cheats.js)
};
const ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'shoot', 'slide', 'prev', 'next', 'start', 'reset'];
const GP_BTN = { jump: [0], shoot: [2, 1], slide: [7, 3], prev: [4], next: [5], start: [9], up: [12], down: [13], left: [14], right: [15] };
const kHeld = {}, kLatch = {};
const inp = {}, hit = {}, rel = {}, prevInp = {};

addEventListener('keydown', e => {
  ensureAudio();
  if (e.code === 'KeyM' && !e.repeat) toggleMute();
  const a = KEYMAP[e.code];
  if (!a) return;
  e.preventDefault();
  if (!e.repeat) kLatch[a] = true;
  kHeld[a] = true;
});
addEventListener('keyup', e => {
  const a = KEYMAP[e.code];
  if (a) { kHeld[a] = false; e.preventDefault(); }
});
addEventListener('blur', () => { for (const k in kHeld) kHeld[k] = false; });
addEventListener('pointerdown', ensureAudio);

function pollInput() {
  let gp = null;
  if (navigator.getGamepads) for (const g of navigator.getGamepads()) if (g) { gp = g; break; }
  for (const a of ACTIONS) {
    let v = !!(kHeld[a] || kLatch[a]);
    if (gp) {
      for (const i of GP_BTN[a] || []) if (gp.buttons[i] && gp.buttons[i].pressed) v = true;
      const ax = gp.axes;
      if (a === 'left' && ax[0] < -0.5) v = true;
      if (a === 'right' && ax[0] > 0.5) v = true;
      if (a === 'up' && ax[1] < -0.5) v = true;
      if (a === 'down' && ax[1] > 0.5) v = true;
    }
    hit[a] = v && !prevInp[a];
    rel[a] = !v && !!prevInp[a];
    inp[a] = v;
    prevInp[a] = v;
    kLatch[a] = false;
  }
}

// ---------- audio ----------
let actx = null, master = null, muted = false;
function ensureAudio() {
  if (!actx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    actx = new AC();
    master = actx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(actx.destination);
  }
  if (actx.state === 'suspended') actx.resume();
}
function toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.5; }

function tone(f0, f1, dur, type = 'square', vol = 0.2, delay = 0) {
  if (!actx || muted) return;
  const t = actx.currentTime + delay;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}
let noiseBuf = null;
function noise(dur, vol = 0.2, delay = 0, freq = 1800) {
  if (!actx || muted) return;
  if (!noiseBuf) {
    noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = actx.currentTime + delay;
  const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
  s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t); s.stop(t + dur + 0.02);
}
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
const notes = (seq, type = 'square', vol = 0.12, len = 0.12) =>
  seq.forEach(([n, d]) => tone(mtof(n), mtof(n), len, type, vol, d));

const sfx = {
  shoot: () => tone(1400, 500, 0.07, 'square', 0.12),
  shootMid: () => tone(300, 900, 0.15, 'sawtooth', 0.15),
  shootFull: () => { tone(200, 1400, 0.25, 'sawtooth', 0.18); noise(0.15, 0.12); },
  charge: () => tone(300, 1600, 0.45, 'triangle', 0.12),
  chargeFull: () => tone(1700, 1900, 0.04, 'triangle', 0.05),
  cutter: () => { tone(1800, 900, 0.08, 'square', 0.1); tone(900, 1800, 0.08, 'square', 0.08, 0.06); },
  fire: () => { noise(0.2, 0.18, 0, 3000); tone(200, 500, 0.15, 'sawtooth', 0.1); },
  ice: () => { tone(2400, 1600, 0.1, 'triangle', 0.12); tone(3000, 2000, 0.1, 'triangle', 0.08, 0.04); },
  rock: () => { noise(0.12, 0.2, 0, 700); tone(180, 90, 0.1, 'square', 0.12); },
  shatter: () => { noise(0.18, 0.18, 0, 2500); tone(2000, 3000, 0.06, 'triangle', 0.06); },
  freeze: () => tone(3000, 1500, 0.15, 'triangle', 0.1),
  land: () => tone(160, 60, 0.06, 'square', 0.1),
  hurt: () => { tone(700, 150, 0.2, 'square', 0.18); noise(0.1, 0.1); },
  enemyHit: () => tone(500, 250, 0.05, 'square', 0.12),
  explode: () => noise(0.3, 0.3, 0, 1200),
  deflect: () => tone(1900, 1900, 0.05, 'triangle', 0.18),
  eshoot: () => tone(700, 350, 0.08, 'square', 0.08),
  flame: () => noise(0.35, 0.2, 0, 2200),
  quake: () => { noise(0.5, 0.35, 0, 300); tone(90, 40, 0.5, 'sawtooth', 0.2); },
  crumble: () => noise(0.15, 0.12, 0, 500),
  tick: () => tone(1100, 1100, 0.03, 'square', 0.08),
  select: () => tone(1200, 1200, 0.04, 'square', 0.1),
  confirm: () => notes([[72, 0], [79, 0.06], [84, 0.12]], 'square', 0.1, 0.1),
  oneup: () => notes([[72, 0], [76, 0.07], [79, 0.14], [84, 0.21]]),
  death: () => { for (let i = 0; i < 8; i++) tone(mtof(84 - i * 3), mtof(80 - i * 3), 0.12, 'square', 0.12, i * 0.09); },
  door: () => noise(0.5, 0.18, 0, 400),
  bossHit: () => { tone(400, 100, 0.12, 'square', 0.18); noise(0.08, 0.12); },
  weakHit: () => { tone(900, 100, 0.2, 'sawtooth', 0.2); noise(0.15, 0.2); },
  zap: () => { noise(0.12, 0.14, 0, 5000); tone(1400, 300, 0.1, 'sawtooth', 0.1); },
  thunder: () => { noise(0.7, 0.35, 0, 1600); tone(90, 35, 0.6, 'sawtooth', 0.16); },
  rumble: () => noise(0.9, 0.12, 0, 400),
  storm: () => { tone(220, 1800, 0.35, 'sawtooth', 0.14); noise(0.5, 0.18, 0, 3500); },
  bigBoom: () => { noise(0.8, 0.35, 0, 900); tone(120, 40, 0.8, 'sawtooth', 0.2); },
  pause: () => tone(880, 880, 0.06, 'square', 0.1),
  victory: () => [[72, 0], [76, 0.12], [79, 0.24], [84, 0.36], [79, 0.6], [84, 0.72]]
    .forEach(([n, d]) => { tone(mtof(n), mtof(n), 0.22, 'square', 0.12, d); tone(mtof(n - 24), mtof(n - 24), 0.22, 'triangle', 0.2, d); }),
  weaponGet: () => notes([[67, 0], [71, 0.1], [74, 0.2], [79, 0.3], [74, 0.45], [79, 0.55], [83, 0.65], [86, 0.8]], 'square', 0.1, 0.16),
  gameover: () => notes([[67, 0], [63, 0.25], [60, 0.5], [55, 0.75]], 'square', 0.12, 0.3),
};

// ---------- step-sequenced music ----------
const bar = (r, n = 8) => Array.from({ length: n * 2 }, (_, i) => (i % 2 ? r + 12 : r));
const SONGS = {
  title: {
    step: 9,
    lead: [72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 77, 0, 81, 0, 77, 0, 72, 0, 76, 0, 79, 0, 84, 0, 83, 0, 79, 0, 74, 0, 71, 0],
    bass: [...bar(48, 4), ...bar(50, 4), ...bar(48, 4), ...bar(43, 4)],
  },
  cut: {
    step: 8,
    lead: [76, 0, 79, 0, 83, 0, 81, 79, 81, 0, 79, 0, 76, 0, 0, 0, 72, 0, 76, 0, 79, 0, 77, 76, 74, 0, 72, 0, 71, 0, 0, 0,
      74, 0, 78, 0, 81, 0, 79, 78, 79, 0, 81, 0, 83, 0, 0, 0, 83, 0, 81, 0, 79, 0, 78, 0, 75, 0, 78, 0, 83, 0, 0, 0],
    bass: [...bar(40), ...bar(36), ...bar(38), ...bar(35)],
  },
  fire: {
    step: 7,
    lead: [64, 0, 64, 67, 0, 64, 69, 0, 67, 0, 64, 0, 62, 0, 64, 0, 64, 0, 64, 67, 0, 64, 71, 0, 69, 0, 67, 0, 69, 0, 71, 0,
      72, 0, 71, 0, 69, 0, 67, 0, 69, 0, 67, 0, 64, 0, 62, 0, 64, 0, 0, 67, 0, 0, 69, 0, 71, 0, 72, 0, 74, 0, 76, 0],
    bass: [...bar(40), ...bar(40), ...bar(36), ...bar(38)],
  },
  snow: {
    step: 8,
    lead: [79, 0, 0, 76, 0, 0, 72, 0, 74, 0, 76, 0, 79, 0, 0, 0, 81, 0, 0, 79, 0, 0, 76, 0, 74, 0, 72, 0, 74, 0, 0, 0,
      79, 0, 0, 84, 0, 0, 83, 0, 81, 0, 79, 0, 76, 0, 0, 0, 77, 0, 76, 0, 74, 0, 72, 0, 71, 0, 72, 0, 74, 0, 0, 0],
    bass: [...bar(48), ...bar(45), ...bar(41), ...bar(43)],
  },
  earth: {
    step: 8,
    lead: [62, 0, 65, 0, 67, 0, 65, 62, 0, 0, 60, 0, 62, 0, 0, 0, 62, 0, 65, 0, 67, 0, 69, 70, 69, 0, 67, 0, 65, 0, 0, 0,
      70, 0, 69, 0, 67, 0, 65, 0, 67, 0, 0, 65, 0, 0, 62, 0, 60, 0, 62, 0, 65, 0, 67, 0, 69, 0, 0, 0, 0, 0, 0, 0],
    bass: [...bar(38), ...bar(38), ...bar(34), ...bar(36)],
  },
  elec: {
    step: 7,
    lead: [69, 0, 72, 76, 0, 72, 69, 0, 71, 0, 74, 77, 0, 74, 71, 0, 72, 0, 76, 79, 0, 76, 72, 0, 76, 0, 74, 0, 72, 0, 71, 0,
      69, 0, 72, 76, 0, 72, 69, 0, 71, 0, 74, 77, 0, 74, 71, 0, 79, 0, 77, 0, 76, 0, 74, 0, 76, 0, 0, 0, 81, 0, 0, 0],
    bass: [...bar(45), ...bar(43), ...bar(41), ...bar(40)],
  },
  boss: {
    step: 7,
    lead: [69, 0, 72, 0, 76, 75, 76, 0, 69, 0, 72, 0, 77, 76, 77, 0, 69, 0, 72, 0, 79, 77, 76, 74, 72, 0, 71, 0, 68, 0, 71, 0],
    bass: [...bar(45, 4), ...bar(41, 4), ...bar(43, 4), ...bar(40, 4)],
  },
};
let music = null, musicName = '', musicStep = 0, musicTick = 0;
function playMusic(name) {
  if (musicName === name && music) return;
  music = SONGS[name] || null; musicName = name; musicStep = 0; musicTick = 0;
}
function stopMusic() { music = null; musicName = ''; }
function updateMusic() {
  if (!music || !actx || muted) return;
  if (musicTick-- > 0) return;
  musicTick = music.step;
  const l = music.lead[musicStep % music.lead.length], b = music.bass[musicStep % music.bass.length];
  const d = music.step / 60;
  if (l) tone(mtof(l), mtof(l), d * 1.6, 'square', 0.045);
  if (b) tone(mtof(b), mtof(b), d * 0.9, 'triangle', 0.14);
  musicStep++;
}

// ---------- 5x7 pixel font ----------
const FONT_SRC = {
  A: '0E 11 11 1F 11 11 11', B: '1E 11 11 1E 11 11 1E', C: '0E 11 10 10 10 11 0E', D: '1E 11 11 11 11 11 1E',
  E: '1F 10 10 1E 10 10 1F', F: '1F 10 10 1E 10 10 10', G: '0E 11 10 17 11 11 0F', H: '11 11 11 1F 11 11 11',
  I: '0E 04 04 04 04 04 0E', J: '07 02 02 02 02 12 0C', K: '11 12 14 18 14 12 11', L: '10 10 10 10 10 10 1F',
  M: '11 1B 15 15 11 11 11', N: '11 11 19 15 13 11 11', O: '0E 11 11 11 11 11 0E', P: '1E 11 11 1E 10 10 10',
  Q: '0E 11 11 11 15 12 0D', R: '1E 11 11 1E 14 12 11', S: '0F 10 10 0E 01 01 1E', T: '1F 04 04 04 04 04 04',
  U: '11 11 11 11 11 11 0E', V: '11 11 11 11 11 0A 04', W: '11 11 11 15 15 15 0A', X: '11 11 0A 04 0A 11 11',
  Y: '11 11 0A 04 04 04 04', Z: '1F 01 02 04 08 10 1F',
  0: '0E 11 13 15 19 11 0E', 1: '04 0C 04 04 04 04 0E', 2: '0E 11 01 02 04 08 1F', 3: '1F 02 04 02 01 11 0E',
  4: '02 06 0A 12 1F 02 02', 5: '1F 10 1E 01 01 11 0E', 6: '06 08 10 1E 11 11 0E', 7: '1F 01 02 04 08 08 08',
  8: '0E 11 11 0E 11 11 0E', 9: '0E 11 11 0F 01 02 0C',
  '!': '04 04 04 04 04 00 04', '.': '00 00 00 00 00 0C 0C', ':': '00 0C 0C 00 0C 0C 00', '-': '00 00 00 1F 00 00 00',
  '?': '0E 11 01 02 04 00 04', '/': '01 01 02 04 08 10 10', "'": '04 04 08 00 00 00 00', ',': '00 00 00 00 0C 04 08',
  '(': '02 04 08 08 08 04 02', ')': '08 04 02 02 02 04 08', '+': '00 04 04 1F 04 04 00', '>': '08 04 02 01 02 04 08',
  '<': '02 04 08 10 08 04 02', '=': '00 00 1F 00 1F 00 00', '&': '0C 12 14 08 15 12 0D',
};
const FONT = {};
for (const k in FONT_SRC) FONT[k] = FONT_SRC[k].split(' ').map(h => parseInt(h, 16));

function drawStr(str, x, y, col, s) {
  ctx.fillStyle = col;
  for (let i = 0; i < str.length; i++) {
    const g = FONT[str[i]];
    if (!g) continue;
    for (let r = 0; r < 7; r++) {
      const row = g[r];
      if (!row) continue;
      for (let c = 0; c < 5; c++) if (row & (16 >> c)) ctx.fillRect(x + i * 6 * s + c * s, y + r * s, s, s);
    }
  }
}
function textWidth(str, s = 1) { return String(str).length * 6 * s - s; }
function text(str, x, y, col = '#fcfcfc', s = 1, align = 'left') {
  str = String(str).toUpperCase();
  const w = textWidth(str, s);
  if (align === 'center') x = Math.round(x - w / 2);
  else if (align === 'right') x -= w;
  drawStr(str, x + s, y + s, '#000000', s);
  drawStr(str, x, y, col, s);
}
