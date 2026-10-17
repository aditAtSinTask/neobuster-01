'use strict';
// Toxaris, boss of the poison stage, drawn natively (see js/chars.js): a hazmat robot in dark green armour with hazard
// stripes, heavy rubber gloves and boots. Signature: a gas mask with a filter canister over his mouth and nose, two
// round goggles glowing lime pushed up on his helmet, a big chemical tank on his back with glowing lime liquid bubbling
// in its window, and a hose from the tank to the nozzle on his arm; lime fumes always puff from the mask and the tank's
// vent and slime drips from his fingers. The nozzle swells with a glowing blob before each spit, the tank vents a green
// burst for the gas cloud, and slime splats where he lands. The face is the shared men's face (ncManFace), scowling.
// Letters: K outline, A green armour, D dark rubber, H hose, V grey metal, Y hazard yellow, L lime glow, l its bright
// centre, w gloss; S skin, eyes E I U W, N nose, M mouth.
const TOXARIS_TONES = {
  K: '#0a1006',
  A: '#2f7224',
  D: '#1e2618',
  H: '#3c4232',
  V: '#9ca69a',
  Y: '#ecc62a',
  L: '#b4ee46',
  l: '#ecffb4',
  w: '#f0ffe0',
  S: '#f2cfa6',
  E: '#ffffff',
  I: '#54c628',
  U: '#164a0e',
  W: '#ffffff',
  N: '#d0946c',
  M: '#7a3030',
};
// a heavy frame: wide shoulders and thick limbs in the hazmat suit
const TOXARIS_BODY = { hipW: 3, shB: [17.8, 19.8], shF: [30.8, 20.2], upper: 3.6, fore: 4.8 };
const TOXARIS_POSES = {
  stand: { legs: { b: [-30, -20, 0], f: [34, -6, 0] }, arms: { b: [-18, 22], f: [20, 56] }, lean: 3, nozzle: true },
  // the spit: leaning back with the nozzle aimed up while the blob swells in it, then lobbing it
  windup: {
    legs: { b: [-26, -24, 0], f: [40, -10, 0] },
    arms: { b: [-30, 10], f: [130, 140] },
    lean: -8,
    nozzle: true,
    blob: true,
  },
  spit: { legs: { b: [-38, -28, 0], f: [44, -8, 0] }, arms: { b: [-24, 20], f: [120, 116] }, lean: 6, nozzle: true },
  // the gas: arms flung wide while the tank vents the cloud round him
  gas: {
    legs: { b: [-36, -26, 0], f: [40, -8, 0] },
    arms: { b: [-110, -130], f: [100, 120] },
    lean: -4,
    nozzle: true,
    vent: true,
  },
  jumpR: {
    legs: { b: [-14, -44, -25], f: [76, -2, -10] },
    arms: { b: [-44, -4], f: [120, 150] },
    air: true,
    nozzle: true,
  },
  jumpF: {
    legs: { b: [-8, -24, -15], f: [34, 4, -5] },
    arms: { b: [-72, -42], f: [96, 120] },
    air: true,
    nozzle: true,
  },
  land: {
    legs: { b: [-62, 22, 0], f: [70, -20, 0] },
    arms: { b: [-40, -10], f: [40, 20] },
    bend: 18,
    lean: 4,
    nozzle: true,
    splat: true,
  },
  hurt: {
    legs: { b: [-44, -6, 10], f: [40, 46, 10] },
    arms: { b: [-130, -160], f: [120, 150] },
    lean: -16,
    dy: 2,
    face: 'hurt',
    nozzle: true,
  },
  // the 3x view and the portraits: a wide stance, the nozzle aimed, the tank bubbling
  action: { legs: { b: [-42, -34, 0], f: [50, -8, 0] }, arms: { b: [-10, 100], f: [80, 82] }, lean: 6, nozzle: true },
};
const _toxarisPoses = {};
function toxarisPose(id, breath = 0) {
  const key = id + (breath ? '|' + breath : '');
  return (
    _toxarisPoses[key] ||
    (_toxarisPoses[key] = ncPose(key, Object.assign({ face: 'angry', breath }, TOXARIS_POSES[id])))
  );
}
// the blobs are lobbed at tick 12 (and again at 32 when he is enraged; b.arm 12, see BOSSES.toxic); the cloud is vented
// at tick 8 and he keeps his arms flung wide while it hangs round him (b.arm 30)
function toxarisFrame(pose, fr, arm, big, opt) {
  if (big || pose === 'action') return toxarisPose('action');
  if (pose === 'hurt') return toxarisPose('hurt');
  if (pose === 'jump') return toxarisPose(fr ? 'jumpF' : 'jumpR');
  if (opt.landT > 0) return toxarisPose('land');
  if (opt.state === 'gas' && opt.t >= 4) return toxarisPose('gas');
  if (opt.state === 'spit') {
    if (arm) return toxarisPose('spit');
    if (opt.t < 12 || (opt.enr && opt.t >= 24 && opt.t < 32)) return toxarisPose('windup');
  }
  return toxarisPose('stand', big ? 0 : [0, 0.5, 1, 0.5][(frameCount >> 4) & 3]);
}

const TX = NC_SHAPES;
const TOXARIS_LEG = {
  thigh: 'D',
  thighW: 5,
  boot: 'A',
  w0: 7.6,
  w1: 10.4,
  band: ['Y', 2, 3.2, 9],
  sole: 'D',
  knee: ['V', 2.8, 0.6],
  shine: 'w',
};
const TOXARIS_ARM = {
  upper: 'D',
  upperW: 3.8,
  glove: 'A',
  w0: 6,
  w1: 7.8,
  cuff: ['Y', 3.4, 4.6, 8],
  fist: 'D',
  fistR: 3.2,
};
// hazard stripes painted onto a part: dark bars slanting across a yellow band
function toxarisStripes(G, U, x0, y0, x1, y1, w, onto) {
  G.paint('Y', U(TX.bar(x0, y0, x1, y1, w)), onto);
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2.4));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.3) / n,
      x = x0 + (x1 - x0) * t,
      y = y0 + (y1 - y0) * t;
    G.paint('D', U(TX.cap(x - 0.6, y - w / 2, x + 0.6, y + w / 2, 0.8)), 'Y');
  }
}
function toxarisPad(G, sx, sy, far) {
  G.shape('A', TX.ell(sx + (far ? -0.6 : 0.6), sy - 1.2, far ? 5 : 5.6, far ? 4.4 : 4.8));
  if (far) return;
  toxarisStripes(G, d => d, sx - 4.6, sy + 1.6, sx + 5.4, sy + 1.4, 1.6, 'A');
  G.shape('w', TX.ell(sx - 1.4, sy - 3.4, 1.8, 0.9), false);
}
// the spray nozzle over the forearm, fed by the hose from the tank
function toxarisNozzle(G, A) {
  const { shape } = G,
    [ex, ey] = A.elbow,
    p = d => along(ex, ey, A.a2, d);
  shape('D', TX.cap(...A.sh, ex, ey, 3.8));
  shape('A', TX.taper(...p(-0.4), ...p(5.6), 6.4, 7.6));
  shape('V', TX.all(TX.cap(...p(4.6), ...p(9.4), 4.6), TX.disc(...p(10), 2.6)));
  shape('D', TX.disc(...p(10.4), 1.6), false);
  shape('L', TX.disc(...p(10.6), 1), false);
  shape('Y', TX.bar(...p(2.4), ...p(3.6), 7.4), false);
  shape('D', TX.disc(...along(...p(4), A.a2 - 90, 3.6), 2.6)); // the fist under the nozzle
}
function toxarisTorso(G, J) {
  const { shape } = G,
    U = J.upper,
    Wa = J.waist;
  shape('D', Wa(TX.poly([20.4, 24.6, 28.6, 24.6, 28.2, 29.4, 20.8, 29.4])));
  shape('A', Wa(TX.poly([19, 28.8, 29.8, 28.8, 29.4, 31.4, 26.6, 33.2, 22.2, 33.2, 19.4, 31.4])));
  toxarisStripes(G, Wa, 19.4, 29.6, 29.4, 29.6, 1.4, 'A');
  shape('A', U(TX.poly([14.8, 17.2, 33.8, 17.2, 33.4, 22.8, 29, 26.4, 20.4, 26.4, 15.2, 22.8]))); // chest
  toxarisStripes(G, U, 16.6, 24.6, 31.8, 21, 1.6, 'A');
  shape('V', U(TX.poly([20, 16.6, 30, 16.6, 28.6, 18.6, 25, 19.8, 21.4, 18.6]))); // collar ring
  // the biohazard badge: a lime disc with three dark marks
  shape('L', U(TX.disc(24.8, 21.2, 2)));
  shape('D', U(TX.all(TX.disc(24.8, 20, 0.6), TX.disc(23.8, 21.8, 0.6), TX.disc(25.8, 21.8, 0.6))), false);
  shape('w', U(TX.ell(18.6, 18.8, 1.8, 0.8)), false);
}
// the helmet over the face, the goggles pushed up on it, and the gas mask over his mouth and nose
function toxarisHead(G, J, P) {
  const { shape } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  shape('A', TX.disc(hx - 0.6, hy - 1, 8.2)); // helmet
  ncManFace(G, hx, hy, P.face);
  shape('A', TX.poly([...o(-0.8, -6), ...o(9.4, -5.8), ...o(9.6, -3.6), ...o(-0.6, -3.4)])); // the rim over the brow
  // the goggles: two round lenses glowing lime, pushed up on the helmet
  for (const [x, r] of [
    [2.2, 2.6],
    [7.4, 2.3],
  ]) {
    shape('D', TX.disc(...o(x, -6.6), r));
    shape('L', TX.disc(...o(x, -6.6), r - 1), false);
    shape('l', TX.disc(...o(x - 0.6, -7.2), 0.6), false);
  }
  shape('D', TX.bar(...o(-5.4, -5.2), ...o(0, -6.4), 1.4), false); // the goggle strap
  // the mask: rubber over the mouth and nose, below the eyes, with a filter canister at the front
  shape(
    'D',
    TX.poly([
      ...o(0.8, 3.8),
      ...o(9.2, 3.4),
      ...o(10.6, 5.2),
      ...o(9.4, 8.2),
      ...o(6.8, 9.4),
      ...o(3.2, 9),
      ...o(0.6, 6.8),
    ]),
  );
  shape('V', TX.all(TX.disc(...o(10.4, 6.6), 2.6), TX.rect(...o(9.4, 4.6), 2.6, 4, 0.8)));
  shape('D', TX.all(TX.bar(...o(9.6, 5.6), ...o(11.6, 5.6), 0.5), TX.bar(...o(9.6, 7.2), ...o(11.6, 7.2), 0.5)), false);
  shape('L', TX.disc(...o(11.2, 6.4), 0.8), false);
  shape('w', TX.ell(...o(-4.4, -4.6), 1.8, 1), false);
}
function toxarisDraw(G, J, P) {
  const B = G.B;
  toxarisPad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, TOXARIS_ARM);
  ncLeg(G, J.legs.b, B, TOXARIS_LEG);
  ncLeg(G, J.legs.f, B, TOXARIS_LEG);
  toxarisTorso(G, J);
  toxarisNozzle(G, J.arms.f);
  // the hose: from the tank over his shoulder down to the nozzle
  const A = J.arms.f;
  G.shape('H', TX.strand(...J.up(17, 17.6), ...J.up(24, 12.6), ...along(...A.elbow, A.a2, 2.4), 1.8, 1.8));
  toxarisPad(G, ...A.sh, false);
  toxarisHead(G, J, P);
}
// the chemical tank on his back (base on box point 24, 24): a metal drum with hazard bands and a window of lime liquid
// whose bubbles rise (step)
function toxarisTank(step) {
  return G => {
    G.shape('V', TX.rect(19.6, 15.6, 8.8, 15, 3.4));
    G.shape('Y', TX.bar(19.6, 18.2, 28.4, 18.2, 1.6), false);
    G.shape(
      'D',
      TX.all(TX.cap(20.6, 17.4, 21.4, 19, 0.7), TX.cap(23.4, 17.4, 24.2, 19, 0.7), TX.cap(26.2, 17.4, 27, 19, 0.7)),
      false,
    );
    G.shape('D', TX.rect(21.2, 20.4, 5.6, 8.4, 1.6), false);
    G.shape('L', TX.rect(21.8, 21.4, 4.4, 6.8, 1.2), false);
    G.shape('l', TX.all(TX.disc(23, 27 - step * 1.6, 0.7), TX.disc(25, 24.6 - step * 1.1, 0.5)), false);
    G.shape('D', TX.rect(22.4, 13.6, 3.2, 2.4, 0.6)); // the vent
  };
}
function toxarisBefore(P, J, at, c) {
  const step = (frameCount >> 3) & 3,
    [x, y] = at(...J.up(15.4, 22.6));
  drawNativeProp(c.style, NATIVE_CHARS.toxic, 'tank' + step, toxarisTank(step), x, y, c.pal, c.flip, c.big);
}
// a puff of fumes rising from (x, y): three lime blobs drifting up and fading as t goes from 0 to 1
function toxarisPuff(x, y, t, s = 1) {
  ctx.globalAlpha = 0.55 * (1 - t);
  circle(x + t * 2, y - t * 8 * s, (1 + t * 1.6) * s, '#b4ee46');
  circle(x - 1 + t, y - t * 5 * s, (0.7 + t) * s, '#d8f888');
  ctx.globalAlpha = 1;
}
// fumes from the mask and the tank's vent, slime dripping from his fingers, the blob swelling in the nozzle, the green
// burst when the tank vents the cloud, and the slime splat where he lands
function toxarisAfter(P, J, at, c) {
  if (c.pal.gray) return;
  const A = J.arms.f,
    o = c.opt,
    [hx, hy] = J.head,
    t = (frameCount % 48) / 48;
  toxarisPuff(...at(hx + 11.6, hy + 6), t, 0.8);
  toxarisPuff(...at(...J.up(15.2, 11.6)), (t + 0.5) % 1, P.vent ? 1.8 : 1);
  const [dx, dy] = at(...J.arms.b.hand),
    d = frameCount % 36;
  if (d < 20) circle(dx, dy + 1.5 + d * 0.3, 0.6, '#b4ee46');
  if (P.blob) {
    const g = clamp(((o.t || 0) % 20) / 12, 0, 1),
      [bx, by] = at(...along(...A.elbow, A.a2, 11 + g * 2));
    glow(bx, by, 6 + g * 6, '#a8f040', 0.5);
    circle(bx, by, 1 + g * 2.4, '#b4ee46');
    circle(bx - 0.6, by - 0.6, 0.4 + g * 0.6, '#ecffb4');
  }
  if (P.vent) {
    const [vx, vy] = at(...J.up(15.2, 11.6));
    glow(vx, vy, 16, '#98e838', 0.45);
  }
  if (P.splat) {
    const g = 1 - clamp((o.landT || 0) / 12, 0, 1);
    for (const d2 of [-1, 1])
      for (let i = 0; i < 3; i++) {
        const [x, y] = at(
          24 + d2 * (6 + i * 3 + g * 6),
          47 - (3 + i * 2) * Math.sin(Math.PI * Math.min(1, g * 1.3 + i * 0.12)),
        );
        circle(x, y, 0.9 - i * 0.15, i & 1 ? '#ecffb4' : '#b4ee46');
      }
  }
}
NATIVE_CHARS.toxic = {
  body: TOXARIS_BODY,
  colors: pal => ncFixed(TOXARIS_TONES, pal),
  flat: 'KDLlwEIUWNM',
  skin: 'S',
  frame: toxarisFrame,
  draw: toxarisDraw,
  before: toxarisBefore,
  after: toxarisAfter,
};
