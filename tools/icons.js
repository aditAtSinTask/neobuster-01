'use strict';
// The app icons for the PWA (manifest.webmanifest, index.html), drawn by the game itself: Nexo aiming the Neo Buster
// in front of the title screen's night sky and energy ring.
//
// How to use: open the game (index.html) in the browser, open the browser console, paste this whole file, then run
//   makeIcons()
// The browser downloads icon-512.png, icon-192.png, icon-maskable-512.png and apple-touch-icon.png: put them in the
// icons/ folder. Reload the page afterwards (the drawing borrows the game's canvas).

// draws the icon on the game's canvas at n x n pixels; pad: the share of the size kept clear round the art (maskable
// icons are cut to a circle or a squircle by the phone, so their art stays inside the middle 80%)
function drawAppIcon(n, pad = 0) {
  cvs.width = cvs.height = n;
  const u = n / 128, // the design is 128 x 128 units
    g = ctx.createLinearGradient(0, 0, 0, n);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  g.addColorStop(0, '#05061a');
  g.addColorStop(0.6, '#1c1650');
  g.addColorStop(1, '#4a2460');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, n, n);
  const inner = 1 - pad * 2;
  ctx.setTransform(u * inner, 0, 0, u * inner, n * pad, n * pad);
  // stars, the energy ring and its glow
  const rnd = mulberry(7);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = rnd() < 0.3 ? '#a8c8f8' : '#fcfcfc';
    ctx.fillRect(Math.floor(rnd() * 128), Math.floor(rnd() * 128), 1, 1);
  }
  const cx = 64,
    cy = 60;
  const glowG = ctx.createRadialGradient(cx, cy, 8, cx, cy, 58);
  glowG.addColorStop(0, 'rgba(60,188,252,0.45)');
  glowG.addColorStop(1, 'rgba(60,188,252,0)');
  ctx.fillStyle = glowG;
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    if (i % 7 === 0) continue;
    ctx.fillStyle = i % 3 ? '#3cbcfc' : '#a8f0fc';
    ctx.fillRect(Math.round(cx + Math.cos(a) * 50) - 1.5, Math.round(cy + Math.sin(a) * 50) - 1.5, 3, 3);
  }
  // Nexo, big: his box is 24 logical pixels; 5 units each puts his head and buster in the middle of the icon
  const k = 5,
    m = ctx.getTransform();
  ctx.setTransform(m.a * k, 0, 0, m.d * k, m.e + (cx - 12 * k - 10) * m.a, m.f + (cy - 10 * k) * m.d);
  const keep = SCALE;
  SCALE = Math.max(2, Math.floor((m.a * k) / 3)); // draw him as the 3x views do: the densest detail, the action pose
  drawRobot(0, 0, 1, 'stand', 0, true, PAL_HERO);
  SCALE = keep;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return cvs.toDataURL('image/png');
}
// the icon at n pixels, drawn at 512 and scaled down smoothly
function appIconAt(n, pad) {
  const big = new Image();
  big.src = drawAppIcon(512, pad);
  return big.decode().then(() => {
    const c = document.createElement('canvas');
    c.width = c.height = n;
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(big, 0, 0, n, n);
    return c.toDataURL('image/png');
  });
}
window.makeIcons = async function (download = true) {
  const icons = {
    'icon-512.png': drawAppIcon(512),
    'icon-192.png': await appIconAt(192),
    'icon-maskable-512.png': drawAppIcon(512, 0.1),
    'apple-touch-icon.png': await appIconAt(180),
  };
  if (download)
    for (const [name, url] of Object.entries(icons)) {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
    }
  fit();
  return icons;
};
