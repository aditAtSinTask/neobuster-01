'use strict';
// NEOBUSTER — core: canvas, helpers, input, audio, music, text, sprite + glow primitives.

// bump on every change (and add an entry to CHANGELOG.md)
const VERSION = '1.13.0';
document.title = 'Neobuster v' + VERSION;

const TILE = 16,
  VW = 384,
  VH = 224;
const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d');
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// The game is laid out in a 384x224 logical space but its pixel art is twice as dense: sprites, text, circles and
// lightning are drawn on a grid of half logical pixels ("fine pixels", HP), so one old pixel is now 2x2 crisp ones.
// The canvas is backed at SCALE device pixels per logical pixel; SCALE is kept even so every fine pixel lands on
// whole device pixels. render() applies SCALE every frame.
const HP = 0.5;
let SCALE = 2;
// On a computer the game is shown at a whole multiple of its size. With the touch buttons (js/core/touch.js), in full
// screen and as the installed app (js/core/pwa.js) it fills the screen instead, wide screens included; on a phone held
// upright it takes the top half, the buttons the rest.
function fit() {
  const touch = document.body.classList.contains('touch'),
    fill =
      touch ||
      !!document.fullscreenElement ||
      matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches,
    h = touch && innerHeight > innerWidth ? innerHeight * 0.5 : innerHeight;
  let s = Math.min(innerWidth / VW, h / VH);
  s = s >= 1 && !fill ? Math.floor(s) : s;
  cvs.style.width = VW * s + 'px';
  cvs.style.height = VH * s + 'px';
  SCALE = Math.min(6, Math.max(2, Math.round(s * (window.devicePixelRatio || 1))));
  if (SCALE % 2) SCALE++;
  cvs.width = VW * SCALE;
  cvs.height = VH * SCALE;
}
addEventListener('resize', fit);
document.addEventListener('fullscreenchange', fit);
fit();
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function R(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}
// a filled circle built from rows of fine pixels (stays pixel art, just denser)
function circle(x, y, r, c) {
  ctx.fillStyle = c;
  x = Math.round(x * 2) / 2;
  y = Math.round(y * 2) / 2;
  r = Math.max(HP, Math.round(r * 2) / 2);
  for (let dy = -r + HP / 2; dy < r; dy += HP) {
    const hw = Math.round(Math.sqrt(r * r - dy * dy) * 2) / 2;
    if (hw > 0) ctx.fillRect(x - hw, y + dy - HP / 2, hw * 2, HP);
  }
}
// a ring th thick with outer radius r, built from rows of fine pixels like circle()
function ring(x, y, r, th, c) {
  ctx.fillStyle = c;
  x = Math.round(x * 2) / 2;
  y = Math.round(y * 2) / 2;
  const ri = r - th;
  for (let dy = -r + HP / 2; dy < r; dy += HP) {
    const ho = Math.round(Math.sqrt(r * r - dy * dy) * 2) / 2,
      hi = Math.abs(dy) < ri ? Math.round(Math.sqrt(ri * ri - dy * dy) * 2) / 2 : 0;
    if (ho <= hi) continue;
    ctx.fillRect(x - ho, y + dy - HP / 2, ho - hi, HP);
    ctx.fillRect(x + hi, y + dy - HP / 2, ho - hi, HP);
  }
}
function mulberry(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  if (draw) draw(g);
  return c;
}

// ---------- colour helpers ----------
function hexToRgb(h) {
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  const n = parseInt(h.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const _shade = new Map();
function shade(hex, amt) {
  const k = hex + amt;
  let v = _shade.get(k);
  if (v) return v;
  const f = c => Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt));
  v =
    '#' +
    hexToRgb(hex)
      .map(c => f(c).toString(16).padStart(2, '0'))
      .join('');
  _shade.set(k, v);
  return v;
}
const rgba = (hex, a) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

// ---------- sprites ----------
// parts: [x,y,w,h,color] get a thin dark outline one fine pixel wide (all outlines first, then fills); each part
// has its corners clipped by a fine pixel and is shaded in fine pixels, lit from the top left: a bright top edge,
// a lighter left edge, darker right and bottom edges and a glint. dets are flat details drawn on top.
// f<0 mirrors the sprite inside a box of width W. Coordinates are logical pixels.
function sprite(ox, oy, f, W, parts, dets) {
  ox = Math.round(ox);
  oy = Math.round(oy);
  const mx = (x, w) => (f > 0 ? ox + x : ox + W - x - w);
  ctx.fillStyle = '#0a0a16';
  for (const p of parts) {
    const X = mx(p[0], p[2]),
      Y = oy + p[1];
    ctx.fillRect(X - HP, Y, p[2] + 1, p[3]);
    ctx.fillRect(X, Y - HP, p[2], p[3] + 1);
  }
  for (const p of parts) {
    const X = mx(p[0], p[2]),
      Y = oy + p[1],
      w = p[2],
      h = p[3],
      c = p[4];
    if (w < 2 || h < 2) {
      ctx.fillStyle = c;
      ctx.fillRect(X, Y, w, h);
      continue;
    }
    ctx.fillStyle = c;
    ctx.fillRect(X + HP, Y, w - 1, h);
    ctx.fillRect(X, Y + HP, w, h - 1);
    ctx.fillStyle = shade(c, 0.42);
    ctx.fillRect(X + HP, Y, w - 1, HP);
    ctx.fillStyle = shade(c, 0.16);
    ctx.fillRect(X, Y + HP, HP, h - 1);
    if (h >= 4) ctx.fillRect(X + HP, Y + HP, w - 1, HP);
    ctx.fillStyle = shade(c, -0.18);
    ctx.fillRect(X + w - HP, Y + HP, HP, h - 1);
    ctx.fillStyle = shade(c, -0.36);
    ctx.fillRect(X + HP, Y + h - HP, w - 1, HP);
    if (w >= 3 && h >= 3) {
      ctx.fillStyle = shade(c, 0.7);
      ctx.fillRect(X + 1, Y + HP, HP, HP);
    }
  }
  if (dets)
    for (const p of dets) {
      ctx.fillStyle = p[4];
      ctx.fillRect(mx(p[0], p[2]), oy + p[1], p[2], p[3]);
    }
}

// ---------- additive glow (cached radial gradients) ----------
const _glow = new Map();
function glowSprite(color, r) {
  const k = color + r;
  let c = _glow.get(k);
  if (c) return c;
  c = makeCanvas(r * 4, r * 4, g => {
    // drawn at 2x so it stays smooth when the screen scales it up
    g.scale(2, 2);
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
  const rnd = mulberry(seed | 0),
    len = Math.hypot(x1 - x0, y1 - y0) || 1,
    n = Math.max(2, Math.round(len / 10));
  const nx = -(y1 - y0) / len,
    ny = (x1 - x0) / len,
    pts = [[x0, y0]];
  for (let i = 1; i < n; i++) {
    const t = i / n,
      o = (rnd() - 0.5) * amp;
    pts.push([x0 + (x1 - x0) * t + nx * o, y0 + (y1 - y0) * t + ny * o]);
  }
  pts.push([x1, y1]);
  for (const [w, c] of [
    [thick + 1, col],
    [Math.max(HP, thick - 1), '#fcfcfc'],
  ]) {
    // squares of fine pixels along the path
    ctx.fillStyle = c;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1],
        [bx, by] = pts[i],
        st = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2));
      for (let k = 0; k <= st; k++)
        ctx.fillRect(
          Math.round((ax + ((bx - ax) * k) / st - w / 2) * 2) / 2,
          Math.round((ay + ((by - ay) * k) / st - w / 2) * 2) / 2,
          w,
          w,
        );
    }
  }
}
function glow(x, y, r, color, a = 1) {
  r = Math.max(2, Math.round(r / 2) * 2);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(a, 0, 1);
  ctx.drawImage(glowSprite(color, r), Math.round(x - r), Math.round(y - r), r * 2, r * 2);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------- input ----------
const KEYMAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  KeyZ: 'jump',
  KeyJ: 'jump',
  Space: 'jump',
  KeyX: 'shoot',
  KeyK: 'shoot',
  KeyC: 'slide',
  KeyL: 'slide',
  KeyQ: 'prev',
  KeyE: 'next',
  Enter: 'start',
  Escape: 'back', // leaves menus; also pauses in a stage
  Backspace: 'back',
  KeyR: 'reset', // P + O opens the cheat box (cheats.js)
};
const ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'shoot', 'slide', 'prev', 'next', 'start', 'back', 'reset'];
const GP_BTN = {
  jump: [0],
  shoot: [2, 1],
  slide: [7, 3],
  prev: [4],
  next: [5],
  start: [9],
  back: [8],
  up: [12],
  down: [13],
  left: [14],
  right: [15],
};
const kHeld = {},
  kLatch = {},
  tHeld = {}; // held on the touch buttons
const inp = {},
  hit = {},
  rel = {},
  prevInp = {};

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
  if (a) {
    kHeld[a] = false;
    e.preventDefault();
  }
});
addEventListener('blur', () => {
  for (const k in kHeld) kHeld[k] = false;
});
addEventListener('pointerdown', ensureAudio);

function pollInput() {
  let gp = null;
  if (navigator.getGamepads)
    for (const g of navigator.getGamepads())
      if (g) {
        gp = g;
        break;
      }
  for (const a of ACTIONS) {
    let v = !!(kHeld[a] || kLatch[a] || tHeld[a]);
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
let actx = null,
  master = null,
  muted = false;
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
function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
}

function tone(f0, f1, dur, type = 'square', vol = 0.2, delay = 0) {
  if (!actx || muted) return;
  const t = actx.currentTime + delay;
  const o = actx.createOscillator(),
    g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
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
  const s = actx.createBufferSource(),
    f = actx.createBiquadFilter(),
    g = actx.createGain();
  s.buffer = noiseBuf;
  f.type = 'lowpass';
  f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f);
  f.connect(g);
  g.connect(master);
  s.start(t);
  s.stop(t + dur + 0.02);
}
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
const notes = (seq, type = 'square', vol = 0.12, len = 0.12) =>
  seq.forEach(([n, d]) => tone(mtof(n), mtof(n), len, type, vol, d));

const sfx = {
  shoot: () => tone(1400, 500, 0.07, 'square', 0.12),
  shootMid: () => tone(300, 900, 0.15, 'sawtooth', 0.15),
  shootFull: () => {
    tone(200, 1400, 0.25, 'sawtooth', 0.18);
    noise(0.15, 0.12);
  },
  charge: () => tone(300, 1600, 0.45, 'triangle', 0.12),
  chargeFull: () => tone(1700, 1900, 0.04, 'triangle', 0.05),
  cutter: () => {
    tone(1800, 900, 0.08, 'square', 0.1);
    tone(900, 1800, 0.08, 'square', 0.08, 0.06);
  },
  fire: () => {
    noise(0.2, 0.18, 0, 3000);
    tone(200, 500, 0.15, 'sawtooth', 0.1);
  },
  ice: () => {
    tone(2400, 1600, 0.1, 'triangle', 0.12);
    tone(3000, 2000, 0.1, 'triangle', 0.08, 0.04);
  },
  rock: () => {
    noise(0.12, 0.2, 0, 700);
    tone(180, 90, 0.1, 'square', 0.12);
  },
  shatter: () => {
    noise(0.18, 0.18, 0, 2500);
    tone(2000, 3000, 0.06, 'triangle', 0.06);
  },
  freeze: () => tone(3000, 1500, 0.15, 'triangle', 0.1),
  land: () => tone(160, 60, 0.06, 'square', 0.1),
  hurt: () => {
    tone(700, 150, 0.2, 'square', 0.18);
    noise(0.1, 0.1);
  },
  enemyHit: () => tone(500, 250, 0.05, 'square', 0.12),
  explode: () => noise(0.3, 0.3, 0, 1200),
  deflect: () => tone(1900, 1900, 0.05, 'triangle', 0.18),
  eshoot: () => tone(700, 350, 0.08, 'square', 0.08),
  flame: () => noise(0.35, 0.2, 0, 2200),
  quake: () => {
    noise(0.5, 0.35, 0, 300);
    tone(90, 40, 0.5, 'sawtooth', 0.2);
  },
  crumble: () => noise(0.15, 0.12, 0, 500),
  tick: () => tone(1100, 1100, 0.03, 'square', 0.08),
  select: () => tone(1200, 1200, 0.04, 'square', 0.1),
  confirm: () =>
    notes(
      [
        [72, 0],
        [79, 0.06],
        [84, 0.12],
      ],
      'square',
      0.1,
      0.1,
    ),
  oneup: () =>
    notes([
      [72, 0],
      [76, 0.07],
      [79, 0.14],
      [84, 0.21],
    ]),
  death: () => {
    for (let i = 0; i < 8; i++) tone(mtof(84 - i * 3), mtof(80 - i * 3), 0.12, 'square', 0.12, i * 0.09);
  },
  door: () => noise(0.5, 0.18, 0, 400),
  bossHit: () => {
    tone(400, 100, 0.12, 'square', 0.18);
    noise(0.08, 0.12);
  },
  weakHit: () => {
    tone(900, 100, 0.2, 'sawtooth', 0.2);
    noise(0.15, 0.2);
  },
  zap: () => {
    noise(0.12, 0.14, 0, 5000);
    tone(1400, 300, 0.1, 'sawtooth', 0.1);
  },
  thunder: () => {
    noise(0.7, 0.35, 0, 1600);
    tone(90, 35, 0.6, 'sawtooth', 0.16);
  },
  rumble: () => noise(0.9, 0.12, 0, 400),
  ultra: () => {
    tone(120, 2400, 0.5, 'sawtooth', 0.18);
    tone(2400, 300, 0.6, 'square', 0.08, 0.1);
    noise(0.7, 0.25, 0, 2500);
  },
  ultraReady: () =>
    notes(
      [
        [84, 0],
        [88, 0.05],
        [91, 0.1],
        [96, 0.15],
      ],
      'triangle',
      0.1,
      0.08,
    ),
  jet: () => noise(0.18, 0.1, 0, 3500),
  warp: () => tone(300, 1300, 0.14, 'triangle', 0.06),
  step: () => {
    tone(520, 1040, 0.08, 'triangle', 0.1);
    tone(1040, 1560, 0.06, 'square', 0.04, 0.04);
  },
  dash: () => {
    noise(0.22, 0.12, 0, 2800);
    tone(420, 1200, 0.14, 'sawtooth', 0.06);
  },
  whoosh: () => {
    noise(0.35, 0.16, 0, 1800);
    tone(300, 900, 0.3, 'triangle', 0.06);
  },
  gale: () => {
    noise(0.12, 0.1, 0, 4000);
    tone(900, 1500, 0.08, 'triangle', 0.07);
  },
  buy: () =>
    notes(
      [
        [76, 0],
        [83, 0.08],
        [88, 0.16],
      ],
      'square',
      0.1,
      0.12,
    ),
  storm: () => {
    tone(220, 1800, 0.35, 'sawtooth', 0.14);
    noise(0.5, 0.18, 0, 3500);
  },
  bigBoom: () => {
    noise(0.8, 0.35, 0, 900);
    tone(120, 40, 0.8, 'sawtooth', 0.2);
  },
  pause: () => tone(880, 880, 0.06, 'square', 0.1),
  victory: () =>
    [
      [72, 0],
      [76, 0.12],
      [79, 0.24],
      [84, 0.36],
      [79, 0.6],
      [84, 0.72],
    ].forEach(([n, d]) => {
      tone(mtof(n), mtof(n), 0.22, 'square', 0.12, d);
      tone(mtof(n - 24), mtof(n - 24), 0.22, 'triangle', 0.2, d);
    }),
  weaponGet: () =>
    notes(
      [
        [67, 0],
        [71, 0.1],
        [74, 0.2],
        [79, 0.3],
        [74, 0.45],
        [79, 0.55],
        [83, 0.65],
        [86, 0.8],
      ],
      'square',
      0.1,
      0.16,
    ),
  gameover: () =>
    notes(
      [
        [67, 0],
        [63, 0.25],
        [60, 0.5],
        [55, 0.75],
      ],
      'square',
      0.12,
      0.3,
    ),
};

// ---------- step-sequenced music ----------
const bar = (r, n = 8) => Array.from({ length: n * 2 }, (_, i) => (i % 2 ? r + 12 : r));
const SONGS = {
  title: {
    step: 9,
    lead: [
      72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 77, 0, 81, 0, 77, 0, 72, 0, 76, 0, 79, 0, 84, 0, 83, 0, 79, 0, 74, 0, 71, 0,
    ],
    bass: [...bar(48, 4), ...bar(50, 4), ...bar(48, 4), ...bar(43, 4)],
  },
  cut: {
    step: 8,
    lead: [
      76, 0, 79, 0, 83, 0, 81, 79, 81, 0, 79, 0, 76, 0, 0, 0, 72, 0, 76, 0, 79, 0, 77, 76, 74, 0, 72, 0, 71, 0, 0, 0,
      74, 0, 78, 0, 81, 0, 79, 78, 79, 0, 81, 0, 83, 0, 0, 0, 83, 0, 81, 0, 79, 0, 78, 0, 75, 0, 78, 0, 83, 0, 0, 0,
    ],
    bass: [...bar(40), ...bar(36), ...bar(38), ...bar(35)],
  },
  fire: {
    step: 7,
    lead: [
      64, 0, 64, 67, 0, 64, 69, 0, 67, 0, 64, 0, 62, 0, 64, 0, 64, 0, 64, 67, 0, 64, 71, 0, 69, 0, 67, 0, 69, 0, 71, 0,
      72, 0, 71, 0, 69, 0, 67, 0, 69, 0, 67, 0, 64, 0, 62, 0, 64, 0, 0, 67, 0, 0, 69, 0, 71, 0, 72, 0, 74, 0, 76, 0,
    ],
    bass: [...bar(40), ...bar(40), ...bar(36), ...bar(38)],
  },
  snow: {
    step: 8,
    lead: [
      79, 0, 0, 76, 0, 0, 72, 0, 74, 0, 76, 0, 79, 0, 0, 0, 81, 0, 0, 79, 0, 0, 76, 0, 74, 0, 72, 0, 74, 0, 0, 0, 79, 0,
      0, 84, 0, 0, 83, 0, 81, 0, 79, 0, 76, 0, 0, 0, 77, 0, 76, 0, 74, 0, 72, 0, 71, 0, 72, 0, 74, 0, 0, 0,
    ],
    bass: [...bar(48), ...bar(45), ...bar(41), ...bar(43)],
  },
  earth: {
    step: 8,
    lead: [
      62, 0, 65, 0, 67, 0, 65, 62, 0, 0, 60, 0, 62, 0, 0, 0, 62, 0, 65, 0, 67, 0, 69, 70, 69, 0, 67, 0, 65, 0, 0, 0, 70,
      0, 69, 0, 67, 0, 65, 0, 67, 0, 0, 65, 0, 0, 62, 0, 60, 0, 62, 0, 65, 0, 67, 0, 69, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [...bar(38), ...bar(38), ...bar(34), ...bar(36)],
  },
  elec: {
    step: 7,
    lead: [
      69, 0, 72, 76, 0, 72, 69, 0, 71, 0, 74, 77, 0, 74, 71, 0, 72, 0, 76, 79, 0, 76, 72, 0, 76, 0, 74, 0, 72, 0, 71, 0,
      69, 0, 72, 76, 0, 72, 69, 0, 71, 0, 74, 77, 0, 74, 71, 0, 79, 0, 77, 0, 76, 0, 74, 0, 76, 0, 0, 0, 81, 0, 0, 0,
    ],
    bass: [...bar(45), ...bar(43), ...bar(41), ...bar(40)],
  },
  wind: {
    step: 7,
    lead: [
      74, 0, 78, 81, 0, 78, 83, 0, 81, 0, 78, 0, 76, 0, 78, 0, 74, 0, 78, 81, 0, 86, 85, 0, 83, 0, 81, 0, 78, 0, 0, 0,
      79, 0, 83, 86, 0, 83, 88, 0, 86, 0, 83, 0, 81, 0, 79, 0, 78, 0, 81, 0, 83, 0, 85, 0, 86, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [...bar(50), ...bar(47), ...bar(43), ...bar(45)],
  },
  boss: {
    step: 7,
    lead: [
      69, 0, 72, 0, 76, 75, 76, 0, 69, 0, 72, 0, 77, 76, 77, 0, 69, 0, 72, 0, 79, 77, 76, 74, 72, 0, 71, 0, 68, 0, 71,
      0,
    ],
    bass: [...bar(45, 4), ...bar(41, 4), ...bar(43, 4), ...bar(40, 4)],
  },
};
let music = null,
  musicName = '',
  musicStep = 0,
  musicTick = 0;
function playMusic(name) {
  if (musicName === name && music) return;
  music = SONGS[name] || null;
  musicName = name;
  musicStep = 0;
  musicTick = 0;
}
function stopMusic() {
  music = null;
  musicName = '';
}
function updateMusic() {
  if (!music || !actx || muted) return;
  if (musicTick-- > 0) return;
  musicTick = music.step;
  const l = music.lead[musicStep % music.lead.length],
    b = music.bass[musicStep % music.bass.length];
  const d = music.step / 60;
  if (l) tone(mtof(l), mtof(l), d * 1.6, 'square', 0.045);
  if (b) tone(mtof(b), mtof(b), d * 0.9, 'triangle', 0.14);
  musicStep++;
}

// ---------- text ----------
// Pixel text at double density: a bold monospace font is rasterised at fine-pixel size with its anti-aliasing
// thresholded away, so letters stay crisp pixel art. The advance is 6 logical px per character at size 1 (like the
// old 5x7 bitmap font), so layouts measured with textWidth hold. Bitmaps are cached per string and colour.
const FONT_FAMILY = 'Menlo, Monaco, Consolas, "DejaVu Sans Mono", "Courier New", monospace';
function textWidth(str, s = 1) {
  return String(str).length * 6 * s - s;
}
const _text = new Map(),
  _capTop = {};
// fine-pixel row where capital letters start for this size (fonts differ per system, so measure once)
function capTop(s) {
  if (_capTop[s] === undefined) {
    const h = 30 * s;
    makeCanvas(20 * s, h, g => {
      g.font = `bold ${20 * s}px ${FONT_FAMILY}`;
      g.textBaseline = 'top';
      g.fillStyle = '#fff';
      g.fillText('H', 0, 0);
      const d = g.getImageData(0, 0, 20 * s, h).data;
      let row = 0;
      while (row < h && ![...Array(20 * s).keys()].some(x => d[(row * 20 * s + x) * 4 + 3] > 110)) row++;
      _capTop[s] = row < h ? row : 3 * s;
    });
  }
  return _capTop[s];
}
function textBitmap(str, col, s) {
  const k = s + '|' + col + '|' + str;
  let c = _text.get(k);
  if (c) return c;
  if (_text.size > 800) _text.clear();
  const w = Math.ceil((textWidth(str, s) + 2 * s) * 2),
    h = Math.ceil(10 * s * 2);
  c = makeCanvas(w, h, g => {
    g.font = `bold ${20 * s}px ${FONT_FAMILY}`;
    g.textBaseline = 'top';
    g.fillStyle = col;
    g.fillText(str, 0, -capTop(s), w); // capitals start at the top row of the bitmap
    const img = g.getImageData(0, 0, w, h),
      d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 110 ? 255 : 0;
    g.putImageData(img, 0, 0);
  });
  _text.set(k, c);
  return c;
}
function text(str, x, y, col = '#fcfcfc', s = 1, align = 'left') {
  str = String(str).toUpperCase();
  const w = textWidth(str, s);
  if (align === 'center') x = Math.round(x - w / 2);
  else if (align === 'right') x -= w;
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  const sh = textBitmap(str, '#000000', s),
    fg = textBitmap(str, col, s);
  ctx.drawImage(sh, x + HP * s, y + HP * s, sh.width / 2, sh.height / 2);
  ctx.drawImage(fg, x, y, fg.width / 2, fg.height / 2);
  ctx.imageSmoothingEnabled = smooth;
}
