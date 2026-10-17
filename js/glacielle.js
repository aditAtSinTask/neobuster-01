'use strict';
// Glacielle, boss of the snow stage, drawn natively after her character sheet (see js/chars.js): white and silver
// armour over a black bodysuit, blue ice crystals on her shoulders, arms and boots, a crystal tiara with a big crystal
// on her brow, and long pale blue-white hair down to her knees.
// Letters: K outline, V white armour, n black bodysuit, C ice crystal, c its bright facets, B deep blue, Z hair,
// z hair shine, S skin, eyes E I U W, N nose, M lips, w gloss.
const GLACIELLE_TONES = {
  K: '#080c1a',
  V: '#e6ecf6',
  n: '#1e2232',
  C: '#46aef2',
  c: '#bcecff',
  B: '#1c64c8',
  Z: '#c6d2f0',
  z: '#ffffff',
  S: '#f8e2d0',
  E: '#ffffff',
  I: '#36b2f2',
  U: '#0e3a86',
  W: '#ffffff',
  N: '#e0aa98',
  M: '#e07c88',
  w: '#ffffff',
};
const GLAC_BODY = { hipW: 2.4, shB: [19.2, 19.8], shF: [30, 20.2], upper: 3.6, fore: 4.6 };
const GLAC_POSES = {
  stand: { legs: { b: [-24, -16, 0], f: [28, -4, 0] }, arms: { b: [-16, 18], f: [12, 46] }, lean: 2 },
  // an ice orb gathering in her outstretched hand, then the arm still out after the shards fly
  charge: { legs: { b: [-30, -22, 0], f: [36, -6, 0] }, arms: { b: [-12, 40], f: [80, 84] }, lean: 4, orb: true },
  shoot: { legs: { b: [-34, -24, 0], f: [40, -6, 0] }, arms: { b: [-20, 20], f: [90, 92] }, lean: 6 },
  // the crouch before the slide, and the slide: low, gliding over the ice, her hair streaming behind
  crouch: { legs: { b: [-66, 24, 0], f: [72, -18, 0] }, arms: { b: [-40, 0], f: [50, 70] }, bend: 18, lean: 4 },
  slide: {
    legs: { b: [-98, -86, -20], f: [64, -24, 0] },
    arms: { b: [-90, -60], f: [60, 90] },
    bend: 54,
    dy: 7,
    flow: 1,
  },
  jumpR: {
    legs: { b: [-14, -44, -25], f: [70, -6, -10] },
    arms: { b: [-44, -4], f: [130, 160] },
    air: true,
    flow: 0.6,
  },
  jumpF: { legs: { b: [-8, -24, -15], f: [30, 4, -5] }, arms: { b: [-70, -40], f: [96, 120] }, air: true, flow: 0.3 },
  // reaching up at the top of the leap to call the ice down from the ceiling
  cast: {
    legs: { b: [-12, -40, -20], f: [56, -2, -8] },
    arms: { b: [-60, -30], f: [150, 160] },
    air: true,
    flow: 0.4,
    orb: true,
  },
  hurt: {
    legs: { b: [-44, -6, 10], f: [40, 46, 10] },
    arms: { b: [-130, -160], f: [120, 150] },
    lean: -16,
    dy: 2,
    face: 'hurt',
    flow: 0.5,
  },
  // the 3x view and the portraits: a wide stance, reaching out with her crystal claw
  action: { legs: { b: [-40, -32, 0], f: [48, -8, 0] }, arms: { b: [-10, 100], f: [80, 84] }, lean: 6, claw: true },
};
const _glacPoses = {};
function glacPose(id) {
  return _glacPoses[id] || (_glacPoses[id] = ncPose(id, GLAC_POSES[id]));
}
// an ice orb gathers in her hand before each volley of shards (fired at tick 12, and again at 30 when she is enraged;
// see BOSSES.snow); she crouches before her slide; in the air she reaches up to call down the ice
function glacFrame(pose, fr, arm, big, opt) {
  if (big || pose === 'action') return glacPose('action');
  if (pose === 'hurt') return glacPose('hurt');
  if (opt.state === 'slide') return glacPose(pose === 'slide' ? 'slide' : 'crouch');
  if (pose === 'jump') return glacPose(arm ? 'cast' : fr ? 'jumpF' : 'jumpR');
  if (arm) return glacPose('shoot');
  if (opt.state === 'shards' && (opt.t < 12 || (opt.enr && opt.t >= 26 && opt.t < 30))) return glacPose('charge');
  return glacPose('stand');
}

const GS = NC_SHAPES;
// a cluster of ice crystals at (x, y) pointing toward angle a, spread over a fan
function glacCrystals(G, x, y, a, n, len, spread, w = 2.6) {
  const parts = [];
  for (let i = 0; i < n; i++) {
    const d = n > 1 ? (i / (n - 1) - 0.5) * spread : 0,
      l = len * (0.7 + 0.3 * Math.cos((i / Math.max(1, n - 1) - 0.5) * 3));
    parts.push(GS.spike(x, y, a + d, l, w));
  }
  G.shape('C', GS.all(...parts));
  for (let i = 0; i < n; i++) {
    const d = n > 1 ? (i / (n - 1) - 0.5) * spread : 0;
    G.paint('c', GS.spike(...along(x, y, a + d, len * 0.15), a + d, len * 0.42, w * 0.32), 'C');
  }
}
const GLAC_LEG = {
  thigh: 'n',
  thighW: 3.6,
  boot: 'V',
  w0: 6,
  w1: 8.6,
  band: ['C', 2.2, 3.4, 7.6],
  sole: 'B',
  knee: ['C', 2.2, 0.6],
};
const GLAC_ARM = {
  upper: 'n',
  upperW: 2.8,
  glove: 'V',
  w0: 4.8,
  w1: 6.6,
  cuff: ['C', 3.4, 4.4, 6.8],
  fist: 'V',
  fistR: 2.6,
};
function glacLeg(G, L, B) {
  ncLeg(G, L, B, Object.assign({ foot: NC_FOOT(B, 1.05) }, GLAC_LEG));
  // crystals jutting from the side of the boot
  glacCrystals(G, ...along(...L.knee, L.a2, 2.6), L.a2 + 150, 3, 6.4, 54, 2.6);
}
function glacArm(G, A) {
  ncArm(G, A, GLAC_ARM);
  glacCrystals(G, ...along(...A.elbow, A.a2, 1.2), A.a2 + 140, 3, 5.2, 44, 2.2);
}
function glacPad(G, sx, sy, far) {
  // the shoulder: a white pad crowned with a fan of crystals
  glacCrystals(G, sx - 1, sy - 1.8, far ? 214 : 206, far ? 4 : 5, far ? 9.4 : 11, 100, 3.4);
  G.shape('V', GS.ell(sx + (far ? -0.6 : 0.4), sy - 0.8, far ? 3.8 : 4.2, far ? 3.4 : 3.6));
  if (!far) G.shape('C', GS.disc(sx + 0.6, sy - 0.8, 1.3), false);
}
function glacTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('n', Wa(GS.poly([21.2, 24, 28, 24, 27.6, 29.4, 21.6, 29.4]))); // black waist
  shape('V', Wa(GS.poly([20.6, 28.4, 28.6, 28.4, 28.2, 30.8, 25.6, 32.4, 23.2, 32.4, 21, 30.8]))); // hips
  paint('n', Wa(GS.poly([23.4, 28.4, 25.8, 28.4, 24.6, 31.6])), 'V');
  shape('n', U(GS.poly([17.4, 17.4, 31.6, 17.4, 31.2, 22.6, 27.8, 25.6, 21.6, 25.6, 17.8, 22.6]))); // bodysuit
  // white plates over the chest, and the white V down the front
  shape('V', U(GS.all(GS.ell(21.8, 20, 3.2, 2.6), GS.ell(27.6, 20, 3.2, 2.6))));
  shape('V', U(GS.poly([21.4, 22.6, 23.4, 22.6, 24.7, 25.4, 26, 22.6, 28, 22.6, 24.7, 27.8])));
  shape('C', U(GS.poly([24.7, 18.8, 25.9, 20.6, 24.7, 22.4, 23.5, 20.6]))); // chest crystal
  shape('w', U(GS.ell(20.8, 19.2, 1.3, 0.7)), false);
}
// the head over the body: the crown of her hair, the face, the fringe and the locks in front of the ear, and the
// tiara (white plates sweeping up into a V over her brow, a big crystal in the middle, crystals at the sides)
function glacHead(G, J, P) {
  const { shape, paint } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  shape('Z', GS.ell(hx - 1.4, hy - 1, 7.6, 7.4));
  ncWomanFace(G, hx, hy, P.face);
  shape(
    'Z',
    GS.all(
      GS.ell(...o(2.6, -4.6), 6.6, 2.4),
      GS.strand(...o(1.4, -5.6), ...o(2.4, -2.4), ...o(2.6, 0.6), 3.2, 0),
      GS.strand(...o(4.8, -5.4), ...o(5.8, -2.6), ...o(6.4, -0.2), 3, 0),
      GS.strand(...o(7.6, -4.6), ...o(8.8, -3), ...o(9.8, -1.4), 2.4, 0),
      GS.strand(...o(-0.8, -3), ...o(-1.2, 3), ...o(0.6, 10), 3, 0.6),
    ),
  );
  glacCrystals(G, ...o(-3, -5), 205, 3, 7, 50, 2.6);
  shape(
    'V',
    GS.all(
      GS.poly([
        ...o(-4.6, -5.6),
        ...o(0.4, -8.4),
        ...o(5.4, -7.6),
        ...o(9.4, -4.6),
        ...o(8.4, -3.4),
        ...o(4.6, -5.4),
        ...o(0.4, -5.6),
        ...o(-3.4, -3.4),
      ]),
      GS.spike(...o(-2.6, -6), 200, 5.4, 3.4),
    ),
  );
  shape('C', GS.poly([...o(4.6, -11.2), ...o(6.6, -7.4), ...o(4.8, -4.2), ...o(2.8, -7.4)]));
  paint('c', GS.poly([...o(4.6, -10.4), ...o(5.4, -7.4), ...o(4.7, -5.4), ...o(4, -7.4)]), 'C');
  shape('z', GS.strand(...o(-4.6, -2.6), ...o(-6, 2), ...o(-5.4, 6.4), 1, 0.4), false);
}
function glacDraw(G, J, P) {
  const B = G.B,
    [hx, hy] = J.head;
  // her long hair, behind everything
  ncLongHair(G, hx, hy, { flow: P.flow || 0, len: 27, locks: 6, wave: P.wave || 0, width: 6.4 });
  glacPad(G, ...J.arms.b.sh, true);
  glacArm(G, J.arms.b);
  glacLeg(G, J.legs.b, B);
  glacLeg(G, J.legs.f, B);
  glacTorso(G, J);
  glacArm(G, J.arms.f);
  if (P.claw) glacCrystals(G, ...J.arms.f.hand, J.arms.f.a2, 4, 5, 70, 2);
  glacPad(G, ...J.arms.f.sh, false);
  glacHead(G, J, P);
}
// the ice orb gathering in her hand
function glacAfter(P, J, at, c) {
  if (!P.orb || c.pal.gray) return;
  const [x, y] = at(...along(...J.arms.f.elbow, J.arms.f.a2, P.id === 'cast' ? 9.4 : 8.8)),
    o = c.opt,
    t = o.state === 'shards' ? (o.t < 12 ? o.t / 12 : (o.t - 26) / 4) : 1,
    r = 1.2 + clamp(t, 0, 1) * 2.2;
  glow(x, y, 6 + r * 3, '#78d8fc', 0.55);
  circle(x, y, r, '#8ee4fc');
  circle(x - r * 0.25, y - r * 0.25, r * 0.5, '#f0fcff');
}
NATIVE_CHARS.snow = {
  body: GLAC_BODY,
  colors: pal => ncFixed(GLACIELLE_TONES, pal),
  flat: 'KcEIUWNMwz',
  hair: 'Z',
  skin: 'S',
  frame: glacFrame,
  draw: glacDraw,
  after: glacAfter,
};
