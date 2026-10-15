'use strict';
// Art: robot sprites (hero + 5 bosses), themed parallax backgrounds and tilesets, weapon icons.

const SKIN = '#fcd8a8';
const PAL_HERO = { B: '#0058f8', b: '#3cbcfc', S: SKIN };
const PAL_MID = { B: '#00a800', b: '#b8f818', S: SKIN };
const PAL_FULL = { B: '#3cbcfc', b: '#fcfcfc', S: '#fcfcfc' };
const PAL_WHITE = { B: '#fcfcfc', b: '#fcfcfc', S: '#fcfcfc' };

// 24x24 robot. ox,oy = top-left of the box (feet at oy+24). style: hero | cut | fire | elec | snow | earth
function drawRobot(ox, oy, f, pose, fr, arm, pal, style = 'hero', opt = {}) {
  const { B, b, S } = pal, W = '#fcfcfc', K = '#000000';
  const P = [], D = [];
  const p = (x, y, w, h, c) => P.push([x, y, w, h, c]);
  const d = (x, y, w, h, c) => D.push([x, y, w, h, c]);
  const female = style === 'snow' || style === 'earth';
  const white = pal === PAL_WHITE;
  const hair = white ? W : style === 'snow' ? '#d8f0fc' : '#6a3818';

  if (pose === 'slide') {
    if (female) p(0, 9, 5, 9, hair);
    p(3, 8, 10, 9, B); p(9, 15, 7, 5, b); p(5, 17, 3, 4, b);
    p(9, 20, 5, 3, b); p(4, 21, 6, 3, B); p(15, 19, 5, 3, b); p(19, 17, 5, 7, B);
    d(5, 9, 3, 2, b); d(8, 10, 5, 6, S); d(9, 11, 2, 3, W); d(10, 12, 1, 2, K);
    sprite(ox, oy, f, 24, P, D);
    return;
  }

  let face = true;
  const dy = pose === 'run' && fr === 1 ? -1 : 0;
  // things behind / on top of the head go first so the head fill covers the overlap
  if (style === 'snow') { p(3, 3 + dy, 5, 15, hair); p(1, 9 + dy, 4, 10, white ? W : '#b8e0f8'); }
  if (style === 'earth') { p(3, 2 + dy, 5, 5, hair); p(1, 5 + dy, 4, 11, hair); }
  if (style === 'cut' && opt.blade !== false) {
    const o = (frameCount >> 3) & 1;
    p(8 - o, -6 + dy, 3, 8, white ? W : '#d8d8e0'); p(13 + o, -6 + dy, 3, 8, white ? W : '#d8d8e0');
  }
  if (style === 'fire') {
    const fl = (frameCount >> 2) % 3;
    p(9, -3 + dy, 7, 5, white ? W : '#f87800'); p(10 + (fl === 1 ? 1 : 0), -6 - fl + dy, 4, 5, white ? W : '#f8d800');
  }
  if (style === 'snow') { p(10, -2 + dy, 5, 3, white ? W : '#58e8f8'); p(11, -4 + dy, 3, 2, white ? W : '#c8fcfc'); }
  if (style === 'elec') { // tall lightning-fin helmet
    p(9, -3 + dy, 6, 5, white ? W : '#f8d800'); p(10, -7 + dy, 3, 5, white ? W : '#fcf8a0'); p(12, -9 + dy, 2, 3, white ? W : '#fcfcfc');
  }

  p(7, 1 + dy, 10, 10, B); // head
  p(8, 11 + dy, 8, 6, b);  // torso
  switch (pose) {
    case 'stand':
      p(8, 17, 3, 3, b); p(13, 17, 3, 3, b); p(7, 20, 4, 4, B); p(13, 20, 5, 4, B);
      p(4, 12, 3, 5, b); if (!arm) p(17, 12, 3, 5, b);
      break;
    case 'run':
      if (fr === 0) { p(6, 17, 4, 3, b); p(13, 17, 4, 3, b); p(2, 20, 6, 4, B); p(16, 20, 6, 4, B); p(3, 11, 3, 5, b); if (!arm) p(17, 13, 3, 4, b); }
      else if (fr === 1) { p(10, 16, 4, 4, b); p(9, 20, 6, 4, B); p(5, 12, 3, 5, b); if (!arm) p(16, 12, 3, 5, b); }
      else { p(7, 17, 4, 3, b); p(12, 17, 4, 3, b); p(4, 20, 6, 4, B); p(14, 20, 6, 4, B); p(4, 13, 3, 4, b); if (!arm) p(17, 11, 3, 5, b); }
      break;
    case 'jump':
      p(7, 17, 4, 4, b); p(5, 21, 5, 3, B); p(13, 15, 4, 3, b); p(15, 16, 5, 4, B);
      p(3, 7, 3, 6, b); if (!arm) p(18, 7, 3, 6, b);
      break;
    case 'hurt':
      p(6, 17, 4, 3, b); p(14, 17, 4, 3, b); p(4, 20, 5, 4, B); p(15, 20, 5, 4, B);
      p(3, 5, 3, 7, b); p(18, 5, 3, 7, b);
      break;
    case 'climb':
      face = arm;
      if (fr) { p(8, 17, 3, 4, b); p(7, 21, 4, 3, B); p(13, 15, 3, 3, b); p(13, 18, 4, 3, B); p(4, 4, 3, 8, b); if (!arm) p(17, 12, 3, 5, b); }
      else { p(13, 17, 3, 4, b); p(13, 21, 4, 3, B); p(8, 15, 3, 3, b); p(7, 18, 4, 3, B); if (!arm) { p(17, 4, 3, 8, b); p(4, 12, 3, 5, b); } else p(4, 4, 3, 8, b); }
      break;
    case 'raise': // arms up, used by bosses when summoning
      p(8, 17, 3, 3, b); p(13, 17, 3, 3, b); p(7, 20, 4, 4, B); p(13, 20, 5, 4, B);
      p(4, 3, 3, 8, b); p(17, 3, 3, 8, b);
      break;
  }
  if (female) p(6, 15 + dy, 12, 3, white ? W : style === 'snow' ? '#e8f8fc' : '#4a8a30');
  if (style === 'earth') { const pad = white ? W : '#8a8070'; p(3, 10 + dy, 5, 4, pad); p(16, 10 + dy, 5, 4, pad); }
  if (arm) { p(17, 12, 7, 4, b); d(21, 12, 3, 4, B); d(23, 13, 1, 2, K); }

  const hy = 1 + dy;
  d(9, hy + 1, 4, 2, b);
  if (face) {
    d(7, hy + 4, 3, 3, b);
    d(12, hy + 3, 5, 7, S);
    if (pose === 'hurt') d(13, hy + 5, 3, 1, K);
    else {
      d(13, hy + 4, 2, 3, W); d(14, hy + 5, 1, 2, K);
      if (female) d(12, hy + 3, 4, 1, K);
    }
    d(14, hy + 8, 2, 1, female ? '#e05878' : '#c87858');
  } else {
    d(9, hy + 4, 6, 4, b);
  }
  if (style === 'cut' && opt.blade !== false) d(11, -1 + dy, 2, 2, '#f83800');
  if (style === 'earth') d(7, hy + 2, 10, 1, '#4a8a30');
  if (style === 'elec' && !white) { // lightning bolt on the chest
    const k = '#202028';
    d(12, 11 + dy, 2, 1, k); d(11, 12 + dy, 2, 1, k); d(10, 13 + dy, 4, 1, k); d(12, 14 + dy, 1, 1, k);
  }
  d(8, 15 + dy, 8, 2, B);
  sprite(ox, oy, f, 24, P, D);
}

function drawWeaponIcon(kind, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  switch (kind) {
    case 'buster': sprite(0, 0, 1, 10, [[1, 2, 8, 6, '#3cbcfc']], [[3, 3, 4, 3, '#fcfcfc']]); break;
    case 'cut': sprite(0, 0, 1, 10, [[0, 0, 3, 3, '#d8d8e0'], [7, 0, 3, 3, '#d8d8e0'], [2, 2, 6, 3, '#a8a8b8'], [1, 5, 3, 5, '#f83800'], [6, 5, 3, 5, '#f83800']]); break;
    case 'fire': sprite(0, 0, 1, 10, [[2, 3, 6, 7, '#f87800'], [3, 0, 3, 5, '#f8d800']], [[4, 6, 2, 3, '#fcfcfc']]); break;
    case 'snow': sprite(0, 0, 1, 10, [[4, 0, 2, 10, '#a8e8fc'], [0, 4, 10, 2, '#a8e8fc']], [[4, 4, 2, 2, '#fcfcfc'], [1, 1, 2, 2, '#d8f8fc'], [7, 7, 2, 2, '#d8f8fc']]); break;
    case 'earth': sprite(0, 0, 1, 10, [[1, 2, 8, 7, '#9a7a5a'], [3, 0, 4, 4, '#b89878']], [[3, 4, 2, 2, '#6a4a2a'], [6, 6, 2, 1, '#6a4a2a']]); break;
    case 'elec': sprite(0, 0, 1, 10, [[5, 0, 4, 3, '#f8d800'], [3, 2, 4, 3, '#f8d800'], [1, 4, 8, 2, '#f8d800'], [4, 6, 3, 2, '#f8d800'], [2, 7, 3, 3, '#f8d800']], [[6, 1, 2, 1, '#fcfcfc'], [2, 5, 5, 1, '#fcf8a0']]); break;
  }
  ctx.restore();
}

// ================= BACKGROUNDS =================
const BG_W = 768, BG_H = VH + 60;
function poly(g, pts, col) { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); }
function skyGrad(g, stops) {
  const gr = g.createLinearGradient(0, 0, 0, BG_H);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  g.fillStyle = gr; g.fillRect(0, 0, BG_W, BG_H);
}
function gear(g, cx, cy, r, col, teeth) {
  g.fillStyle = col;
  g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  for (let i = 0; i < teeth; i++) {
    const a = i / teeth * Math.PI * 2;
    g.save(); g.translate(cx, cy); g.rotate(a); g.fillRect(-r * 0.12, -r - 7, r * 0.24, 9); g.restore();
  }
  g.globalCompositeOperation = 'destination-out';
  g.beginPath(); g.arc(cx, cy, r * 0.35, 0, 7); g.fill();
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.6; g.beginPath(); g.arc(cx + Math.cos(a) * r * 0.65, cy + Math.sin(a) * r * 0.65, r * 0.16, 0, 7); g.fill(); }
  g.globalCompositeOperation = 'source-over';
}

const BG_PAINTERS = {
  cut: [
    { k: 0.12, ky: 0.4, paint(g, rnd) {
      skyGrad(g, [[0, '#141a30'], [0.5, '#3c3458'], [0.8, '#a0584a'], [1, '#e08a50']]);
      g.fillStyle = 'rgba(248,192,112,0.18)'; g.beginPath(); g.arc(560, 170, 46, 0, 7); g.fill();
      g.fillStyle = '#f8c070'; g.beginPath(); g.arc(560, 170, 26, 0, 7); g.fill();
      for (let i = 0; i < 60; i++) { g.fillStyle = rnd() < 0.3 ? '#fcfcfc' : '#7a78a8'; g.fillRect(rnd() * BG_W | 0, rnd() * 110 | 0, 1, 1); }
      let x = 0;
      while (x < BG_W) {
        const w = 30 + rnd() * 50 | 0, h = 50 + rnd() * 80 | 0;
        g.fillStyle = '#262238'; g.fillRect(x, BG_H - h, w, h);
        if (rnd() < 0.6) { const cw = 6 + rnd() * 6 | 0, ch = 30 + rnd() * 50 | 0, cx = x + rnd() * (w - cw) | 0; g.fillRect(cx, BG_H - h - ch, cw, ch); g.fillStyle = '#c84030'; g.fillRect(cx, BG_H - h - ch + 4, cw, 2); }
        g.fillStyle = '#5a4a6a';
        for (let wy = BG_H - h + 8; wy < BG_H - 6; wy += 10) for (let wx = x + 4; wx < x + w - 4; wx += 7) if (rnd() < 0.3) g.fillRect(wx, wy, 3, 4);
        x += w + (rnd() * 8 | 0);
      }
    } },
    { k: 0.35, ky: 1, paint(g, rnd) {
      for (let i = 0; i < 6; i++) gear(g, 60 + i * 130 + rnd() * 40, BG_H - 20 - rnd() * 60, 26 + rnd() * 26, '#2e2a44', 12);
      g.fillStyle = '#34304c';
      g.fillRect(0, BG_H - 120, BG_W, 6);
      for (let x = 0; x < BG_W; x += 32) {
        g.fillRect(x, BG_H - 120, 3, 120);
        g.save(); g.translate(x, BG_H - 114); g.rotate(Math.atan2(40, 32)); g.fillRect(0, 0, 51, 2); g.restore();
      }
    } },
  ],
  fire: [
    { k: 0.12, ky: 0.4, paint(g, rnd) {
      skyGrad(g, [[0, '#0e0204'], [0.45, '#3a0a08'], [0.8, '#8a2410'], [1, '#d8501a']]);
      for (let i = 0; i < 3; i++) {
        const cx = 120 + i * 260 + rnd() * 60, top = 90 + rnd() * 40, wb = 160 + rnd() * 60;
        g.fillStyle = 'rgba(60,20,16,0.6)';
        for (let s = 0; s < 6; s++) { g.beginPath(); g.arc(cx + (rnd() - 0.5) * 30, top - 20 - s * 18, 14 + s * 4, 0, 7); g.fill(); }
        poly(g, [cx - wb, BG_H, cx - 18, top, cx + 18, top, cx + wb, BG_H], '#220806');
        g.strokeStyle = 'rgba(248,96,24,0.8)'; g.lineWidth = 2;
        for (let s = 0; s < 3; s++) { g.beginPath(); g.moveTo(cx - 8 + s * 8, top); g.lineTo(cx - 30 + s * 30 + (rnd() - 0.5) * 30, BG_H); g.stroke(); }
        g.fillStyle = '#f86018'; g.fillRect(cx - 18, top - 2, 36, 3);
      }
    } },
    { k: 0.35, ky: 1, paint(g, rnd) {
      let x = 0;
      while (x < BG_W) {
        const w = 30 + rnd() * 40, h = 60 + rnd() * 100;
        poly(g, [x, BG_H, x + w * 0.4, BG_H - h, x + w * 0.55, BG_H - h + 10, x + w, BG_H], '#2c0c08');
        g.strokeStyle = '#a03010'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(x + w * 0.4, BG_H - h); g.lineTo(x + w * 0.2, BG_H); g.stroke();
        x += w * 0.7;
      }
    } },
  ],
  elec: [
    { k: 0.1, ky: 0.4, paint(g, rnd) {
      skyGrad(g, [[0, '#06060f'], [0.5, '#141430'], [0.85, '#2a2450'], [1, '#3a3060']]);
      for (let i = 0; i < 16; i++) {
        const cx = rnd() * BG_W, cy = 8 + rnd() * 80;
        g.fillStyle = 'rgba(46,46,90,0.55)';
        for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(cx + k * 14 - 28, cy + (k % 2) * 5, 12 + rnd() * 9, 0, 7); g.fill(); }
      }
      let x = 0;
      while (x < BG_W) {
        const w = 18 + rnd() * 36 | 0, h = 30 + rnd() * 70 | 0;
        g.fillStyle = '#14142a'; g.fillRect(x, BG_H - h, w, h);
        g.fillStyle = '#f8e070';
        for (let wy = BG_H - h + 5; wy < BG_H - 4; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 5) if (rnd() < 0.12) g.fillRect(wx, wy, 2, 2);
        x += w + (rnd() * 6 | 0);
      }
    } },
    { k: 0.35, ky: 1, paint(g) {
      // transmission towers with sagging cables (spacing divides BG_W so the layer tiles seamlessly)
      const xs = [], top = BG_H - 150;
      for (let x = 48 - 192; x < BG_W + 192; x += 192) xs.push(x);
      g.strokeStyle = '#34346a'; g.lineWidth = 1;
      for (let i = 0; i < xs.length - 1; i++) for (const [o, y] of [[-24, top + 10], [24, top + 10], [-18, top + 40], [18, top + 40]]) {
        g.beginPath(); g.moveTo(xs[i] + o, y); g.quadraticCurveTo((xs[i] + xs[i + 1]) / 2 + o, y + 34, xs[i + 1] + o, y); g.stroke();
      }
      for (const x of xs) {
        poly(g, [x - 20, BG_H, x - 4, top, x + 4, top, x + 20, BG_H], '#22223e');
        g.fillStyle = '#22223e'; g.fillRect(x - 26, top + 8, 52, 4); g.fillRect(x - 20, top + 38, 40, 4);
        g.strokeStyle = '#16162a';
        for (let y = top + 16; y < BG_H - 8; y += 22) { const w = 4 + (y - top) * 0.1; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + w, y + 22); g.moveTo(x + w, y); g.lineTo(x - w, y + 22); g.stroke(); }
        g.fillStyle = '#f83800'; g.fillRect(x - 1, top - 4, 2, 4);
      }
    } },
  ],
  snow: [
    { k: 0.1, ky: 0.4, paint(g, rnd) {
      skyGrad(g, [[0, '#030616'], [0.45, '#0a1a40'], [0.8, '#142a58'], [1, '#1c3060']]);
      for (let i = 0; i < 140; i++) { g.fillStyle = rnd() < 0.25 ? '#fcfcfc' : '#7088c0'; g.fillRect(rnd() * BG_W | 0, rnd() * 180 | 0, 1, 1); }
      const bands = [['#58f8a8', 40, 0], ['#a878f8', 70, 2], ['#58e8f8', 55, 4]];
      for (const [c, base, ph] of bands) for (let x = 0; x < BG_W; x += 2) {
        const y = base + Math.sin(x * 0.012 + ph) * 22 + Math.sin(x * 0.031 + ph) * 8;
        for (let k = 0; k < 5; k++) { g.fillStyle = rgba(c, 0.07 - k * 0.012); g.fillRect(x, y + k * 8, 2, 8); }
      }
      let x = -40;
      while (x < BG_W) {
        const w = 150 + rnd() * 90, h = 140 + rnd() * 60, px = x + w / 2, top = BG_H - h;
        poly(g, [x, BG_H, px, top, x + w, BG_H], '#3e5e8c');
        poly(g, [px, top, x + w, BG_H, px + w * 0.1, BG_H], '#2e4a74');
        const cw = w * 0.15, ch = h * 0.3;
        poly(g, [px, top, px + cw, top + ch, px + cw * 0.4, top + ch * 0.8, px, top + ch, px - cw * 0.5, top + ch * 0.75, px - cw, top + ch], '#d8e8f8');
        x += w * 0.6;
      }
    } },
    { k: 0.35, ky: 1, paint(g, rnd) {
      g.fillStyle = '#0e2440'; g.fillRect(0, BG_H - 26, BG_W, 26);
      for (let x = 0; x < BG_W; x += 18 + rnd() * 30) {
        const h = 50 + rnd() * 60, base = BG_H - 20;
        g.fillStyle = '#0a1a30'; g.fillRect(x - 2, base - 10, 4, 14);
        for (let t = 0; t < 4; t++) {
          const ty = base - 10 - t * h / 5, tw = (4 - t) * 7 + 6;
          poly(g, [x - tw, ty, x, ty - h / 3, x + tw, ty], '#0e2440');
          g.fillStyle = '#c8d8ec'; g.fillRect(x - tw + 2, ty - 2, tw * 0.6, 2);
        }
      }
    } },
  ],
  earth: [
    { k: 0.12, ky: 0.4, paint(g, rnd) {
      skyGrad(g, [[0, '#2a68b8'], [0.45, '#6aa8d8'], [0.85, '#d8c8a0'], [1, '#e8b880']]);
      for (let i = 0; i < 7; i++) {
        const cx = rnd() * BG_W, cy = 20 + rnd() * 80;
        g.fillStyle = 'rgba(255,255,255,0.75)';
        for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(cx + k * 12 - 24, cy + (k % 2) * 4, 10 + rnd() * 6, 0, 7); g.fill(); }
      }
      let x = -20;
      while (x < BG_W) {
        const w = 70 + rnd() * 90, h = 60 + rnd() * 70, top = BG_H - h;
        poly(g, [x, BG_H, x + 14, top, x + w - 14, top, x + w, BG_H], '#b8684a');
        for (let s = top + 8; s < BG_H; s += 9) { g.fillStyle = (s / 9 | 0) % 2 ? '#a05838' : '#c87858'; g.fillRect(x + 14 - (s - top) * 0.15, s, w - 28 + (s - top) * 0.3, 2); }
        g.fillStyle = '#d88868'; g.fillRect(x + 14, top, w - 28, 2);
        x += w + rnd() * 40;
      }
    } },
    { k: 0.35, ky: 1, paint(g, rnd) {
      let x = 0;
      while (x < BG_W) {
        const r = 30 + rnd() * 40;
        g.fillStyle = '#7a4628'; g.beginPath(); g.arc(x, BG_H - 10, r, 0, 7); g.fill();
        g.fillStyle = '#8e5634'; g.beginPath(); g.arc(x - r * 0.3, BG_H - 10 - r * 0.5, r * 0.4, 0, 7); g.fill();
        if (rnd() < 0.5) {
          const cx = x + r * 0.6, ch = 22 + rnd() * 16;
          g.fillStyle = '#3a6a3a'; g.fillRect(cx, BG_H - 30 - ch, 6, ch + 20);
          g.fillRect(cx - 7, BG_H - 30 - ch * 0.6, 4, ch * 0.4); g.fillRect(cx - 7, BG_H - 30 - ch * 0.3, 8, 3);
          g.fillRect(cx + 9, BG_H - 30 - ch * 0.8, 4, ch * 0.4); g.fillRect(cx + 5, BG_H - 30 - ch * 0.45, 8, 3);
        }
        x += r * 1.3;
      }
    } },
  ],
};

const _bgCache = {};
function getBackground(theme) {
  if (!_bgCache[theme]) {
    const rnd = mulberry(theme.length * 977 + 13);
    _bgCache[theme] = BG_PAINTERS[theme].map(L => ({ k: L.k, ky: L.ky, c: makeCanvas(BG_W, BG_H, g => L.paint(g, rnd)) }));
  }
  return _bgCache[theme];
}
function drawBackground(theme, cx, cy, maxCy) {
  const frac = maxCy > 0 ? Math.min(1, cy / maxCy) : 1;
  for (const L of getBackground(theme)) {
    const x = -Math.floor(cx * L.k) % BG_W;
    const y = -Math.round(frac * 60 * L.ky);
    ctx.drawImage(L.c, x, y);
    ctx.drawImage(L.c, x + BG_W, y);
  }
}

// ================= TILESETS =================
// static tiles are painted once into the level canvas; lava, crumble blocks and the boss door are drawn per frame.
const tileHash = (tx, ty) => { let h = tx * 374761393 + ty * 668265263; h = (h ^ (h >>> 13)) * 1274126177; return (h ^ (h >>> 16)) >>> 0; };

function drawSpikes(F, x, y, light, dark, base, tip) {
  F(x, y + 13, 16, 3, base);
  for (let i = 0; i < 2; i++) for (let r = 0; r < 6; r++) {
    F(x + i * 8 + 3 - r, y + 1 + r * 2, 1 + r, 2, light);
    F(x + i * 8 + 4, y + 1 + r * 2, 1 + r, 2, dark);
  }
  if (tip) { F(x + 3, y + 1, 2, 1, tip); F(x + 11, y + 1, 2, 1, tip); }
}
function drawLadder(F, x, y, rail, rung, dark) {
  F(x + 2, y, 2, 16, rail); F(x + 12, y, 2, 16, rail);
  F(x + 3, y, 1, 16, dark); F(x + 13, y, 1, 16, dark);
  F(x + 4, y + 3, 8, 2, rung); F(x + 4, y + 11, 8, 2, rung);
  F(x + 4, y + 5, 8, 1, dark); F(x + 4, y + 13, 8, 1, dark);
}

const TILESETS = {
  cut: {
    ground(F, x, y, v, exp, tx) {
      F(x, y, 16, 16, v & 1 ? '#4a5468' : '#46505f');
      F(x, y, 16, 1, '#5e6a80'); F(x, y, 1, 16, '#5a6478'); F(x + 15, y, 1, 16, '#262c38'); F(x, y + 15, 16, 1, '#262c38');
      for (const [rx, ry] of [[2, 2], [12, 2], [2, 12], [12, 12]]) { F(x + rx, y + ry, 2, 2, '#7884a0'); F(x + rx + 1, y + ry + 2, 2, 1, '#2a3040'); }
      if (exp) {
        for (let i = 0; i < 4; i++) F(x + i * 4, y, 4, 4, (tx * 4 + i) & 1 ? '#f8c000' : '#26262e');
        F(x, y, 16, 1, '#fce070'); F(x, y + 4, 16, 1, '#1a1e28');
      }
    },
    block(F, x, y) {
      F(x, y, 16, 16, '#3a3e4a'); F(x, y, 15, 15, '#7a8090'); F(x + 1, y + 1, 13, 13, '#8c92a2'); F(x + 1, y + 1, 13, 1, '#b0b6c4');
      for (let k = 0; k < 12; k++) F(x + 1 + k, y + 1 + k, 2, 1, '#5a6070');
      F(x + 2, y + 12, 2, 2, '#b0b6c4'); F(x + 11, y + 2, 2, 2, '#b0b6c4');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#d8dce8', '#8890a0', '#4a4e5a'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#c8c8d0', '#9898a8', '#5a5a68'),
  },
  fire: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#3a1812' : '#341510');
      F(x + (v % 13), y + (v >> 4) % 13, 2, 2, '#4a2018'); F(x + (v >> 6) % 13, y + (v >> 9) % 13, 2, 1, '#4a2018');
      if (v % 3 === 0) { F(x + 3, y + 8, 5, 1, '#c83c10'); F(x + 7, y + 9, 5, 1, '#c83c10'); F(x + 4, y + 8, 2, 1, '#f88830'); }
      F(x + 15, y, 1, 16, '#200a08'); F(x, y + 15, 16, 1, '#200a08');
      if (exp) { F(x, y, 16, 4, '#5a2618'); F(x, y, 16, 1, '#f89038'); F(x, y + 1, 16, 1, '#c8501c'); F(x + (v % 10), y + 4, 5, 1, '#5a2618'); }
    },
    block(F, x, y, v) {
      F(x, y, 16, 16, '#1e0806');
      F(x, y, 7, 7, '#6a2216'); F(x + 8, y, 8, 7, '#6a2216'); F(x, y + 8, 3, 7, '#6a2216'); F(x + 4, y + 8, 8, 7, '#6a2216'); F(x + 13, y + 8, 3, 7, '#6a2216');
      F(x, y, 7, 1, '#a83a22'); F(x + 8, y, 8, 1, '#a83a22'); F(x + 4, y + 8, 8, 1, '#a83a22');
      if (v % 4 === 0) F(x + 6, y + 3, 3, 1, '#e8601c');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#6a5a6a', '#2a2230', '#1a1018', '#f86018'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#a87050', '#8a5838', '#4a2a18'),
  },
  snow: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#4a6a98' : '#46648f');
      F(x + (v % 11), y + (v >> 3) % 7 + 6, 3, 1, '#6a8ab8'); F(x + (v >> 5) % 12, y + (v >> 8) % 6 + 9, 2, 1, '#6a8ab8');
      F(x + 15, y, 1, 16, '#2a3e60'); F(x, y + 15, 16, 1, '#2a3e60');
      if (exp) {
        F(x, y, 16, 5, '#f0f8ff'); F(x, y, 16, 1, '#ffffff');
        F(x + (v % 4), y + 5, 5, 1, '#f0f8ff'); F(x + 8 + (v % 3), y + 5, 4, 1, '#f0f8ff');
        F(x, y + 4, 16, 1, '#c8dcf0');
      }
    },
    block(F, x, y) {
      F(x, y, 16, 16, '#4a90c0'); F(x + 1, y + 1, 14, 14, '#8ccff0'); F(x + 2, y + 2, 12, 12, '#a8e0f8');
      for (let k = 0; k < 6; k++) { F(x + 3 + k, y + 9 - k, 1, 1, '#fcfcfc'); F(x + 6 + k, y + 12 - k, 1, 1, '#e0f8fc'); }
      F(x + 1, y + 1, 14, 1, '#e0f8fc');
    },
    ice(F, x, y) {
      F(x, y, 16, 16, '#68b0d8'); F(x, y, 16, 15, '#a8e4fc'); F(x, y, 16, 2, '#f0fcff');
      for (let k = 0; k < 5; k++) { F(x + 4 + k, y + 10 - k, 1, 1, '#e0f8fc'); F(x + 10 + k, y + 13 - k, 1, 1, '#d0f4fc'); }
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#d0f4fc', '#78b8e0', '#4a7aa8'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#d0d8e8', '#a8b8d0', '#6a7a98'),
  },
  elec: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#262a3a' : '#232736');
      const ty = y + 6 + (v % 5), tx = x + 3 + (v >> 3) % 8;
      F(x + 2, ty, 12, 1, '#363e58'); F(tx, ty, 1, 16 - (ty - y) - 2, '#363e58'); F(tx - 1, y + 13, 3, 2, '#4a5474');
      F(x + 15, y, 1, 16, '#16192a'); F(x, y + 15, 16, 1, '#16192a');
      if (exp) {
        F(x, y, 16, 5, '#4a5068'); F(x, y, 16, 1, '#8a96b8'); F(x, y + 5, 16, 1, '#12141f');
        F(x, y + 2, 16, 1, '#a88800'); if (v & 2) F(x + 4 + (v % 6), y + 2, 4, 1, '#f8e030');
      }
    },
    block(F, x, y) {
      F(x, y, 16, 16, '#1a1c28'); F(x + 1, y + 1, 14, 14, '#4a5578'); F(x + 1, y + 1, 14, 1, '#7a88b0'); F(x + 1, y + 14, 14, 1, '#323a54');
      F(x + 8, y + 3, 3, 3, '#f8d800'); F(x + 6, y + 6, 4, 2, '#f8d800'); F(x + 6, y + 8, 2, 2, '#f8d800'); F(x + 5, y + 10, 2, 3, '#f8d800');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#c8d0e0', '#6a7490', '#2a3044', '#f8d800'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#8a96b8', '#c8a800', '#3a4258'),
  },
  earth: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#7a4c2a' : '#744828');
      F(x + (v % 12) + 1, y + (v >> 4) % 9 + 5, 3, 2, '#946036'); F(x + (v >> 7) % 12, y + (v >> 11) % 10 + 4, 2, 2, '#5a3418');
      F(x + 15, y, 1, 16, '#4a2c16'); F(x, y + 15, 16, 1, '#4a2c16');
      if (exp) {
        F(x, y, 16, 4, '#4a9a30'); F(x, y, 16, 1, '#8ad058'); F(x, y + 4, 16, 1, '#2a5a1a');
        F(x + (v % 10) + 2, y + 4, 3, 2, '#4a9a30');
        F(x + (v % 12) + 1, y - 2, 1, 2, '#6ab840'); F(x + (v >> 3) % 12 + 2, y - 1, 1, 1, '#6ab840');
      }
    },
    block(F, x, y) {
      F(x, y, 16, 16, '#5e5648');
      F(x, y, 7, 7, '#9a9282'); F(x + 8, y, 8, 7, '#9a9282'); F(x, y + 8, 3, 7, '#9a9282'); F(x + 4, y + 8, 8, 7, '#9a9282'); F(x + 13, y + 8, 3, 7, '#9a9282');
      F(x, y, 7, 1, '#bab2a2'); F(x + 8, y, 8, 1, '#bab2a2'); F(x + 4, y + 8, 8, 1, '#bab2a2');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#c8c0b0', '#7a7262', '#4a4236'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#a87038', '#c89058', '#5a3818'),
  },
};
const SOLIDISH = '#=I^CDX'; // tiles that hide the exposed top (grass, snow, rails) of the ground under them

// cells drawn over a dark cave wall: every 'b', plus ladders, spikes and crumbling blocks touching one (so a
// ladder down a shaft or spikes on a cave floor do not show the sky behind them)
function backdropCells(lv) {
  const m = lv.map, back = new Set(), q = [];
  for (let y = 0; y < lv.LH; y++) for (let x = 0; x < lv.LW; x++) if (m[y][x] === 'b') { back.add(y * lv.LW + x); q.push([x, y]); }
  while (q.length) {
    const [x, y] = q.pop();
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || ny < 0 || nx >= lv.LW || ny >= lv.LH || back.has(ny * lv.LW + nx) || !'H^C'.includes(m[ny][nx])) continue;
      back.add(ny * lv.LW + nx); q.push([nx, ny]);
    }
  }
  return back;
}

function renderLevelCanvas(lv) {
  const ts = TILESETS[lv.theme], back = backdropCells(lv);
  return makeCanvas(lv.LW * TILE, lv.LH * TILE, g => {
    const F = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    for (let ty = 0; ty < lv.LH; ty++) for (let tx = 0; tx < lv.LW; tx++) {
      const t = lv.map[ty][tx], x = tx * TILE, y = ty * TILE, v = tileHash(tx, ty);
      const above = ty > 0 ? lv.map[ty - 1][tx] : '.';
      const exp = !SOLIDISH.includes(above);
      if (back.has(ty * lv.LW + tx)) { ts.ground(F, x, y, v, false, tx); F(x, y, 16, 16, 'rgba(4,4,14,0.62)'); }
      if (t === 'X') { // abyss: fades to black from its top row
        if (above === 'X') F(x, y, 16, 16, '#000000');
        else for (let r = 0; r < 16; r += 2) F(x, y + r, 16, 2, `rgba(0,0,0,${(0.15 + r / 18).toFixed(2)})`);
        continue;
      }
      if (t === '#') ts.ground(F, x, y, v, exp, tx);
      else if (t === '=') ts.block(F, x, y, v);
      else if (t === 'I') (ts.ice || ts.block)(F, x, y, v);
      else if (t === '^') ts.spike(F, x, y);
      else if (t === 'H') ts.ladder(F, x, y);
    }
  });
}
