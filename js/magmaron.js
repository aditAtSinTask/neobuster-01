'use strict';
// Magmaron, boss of the fire stage, drawn natively after his character sheet (see js/chars.js): a hulking lava golem
// in red armour veined with glowing lava, dark metal joints, gold trim, a helmet with two bull horns and a gold brow
// over red eyes and a grey grill, huge round shoulder pads with exhausts that blaze with fire, and a big gold cannon
// on his arm.
// Letters: K outline, R red armour, M dark metal, Y gold, L lava glow, l bright lava, E red eyes and core, V grey grill,
// D dark, w gloss; the flames F orange, f yellow, W white-hot.
const MAGMA_TONES = {
  K: '#140806',
  R: '#c8322a',
  M: '#45404c',
  Y: '#f2b02c',
  L: '#ff8418',
  l: '#ffd848',
  E: '#ff3018',
  V: '#a8a6b2',
  D: '#201a22',
  w: '#ffe8d8',
  F: '#ff6a10',
  f: '#ffc22c',
  W: '#fff6c8',
};
// a big frame: wide shoulders and hips, thick limbs
const MAGMA_BODY = {
  hipW: 3.4,
  hipY: 31,
  thigh: 6.8,
  shin: 5.6,
  toe: 9,
  heel: 5.2,
  shB: [17.4, 20],
  shF: [31.6, 20.4],
  upper: 3.6,
  fore: 5,
  head: [24.8, 10.8],
};
const MAGMA_GAIT = {
  stride: 40,
  stance: 0.34,
  hipW: 1.6,
  lift: 4.4,
  kick: 0.4,
  reach: 2.4,
  hip: 32.4,
  sink: 0.8,
  rise: 0.6,
  lean: 6,
  arm: 22,
  elbow: 60,
};
const MAGMA_POSES = {
  // heavy and square: feet apart, fists hanging out from the body
  stand: { legs: { b: [-26, -18, 0], f: [30, -6, 0] }, arms: { b: [-22, 14], f: [18, 44] }, lean: 2 },
  // the cannon aimed (the fireballs): it blasts as each one leaves it
  shoot: { legs: { b: [-32, -22, 0], f: [38, -6, 0] }, arms: { b: [-8, 64], f: [88, 90] }, lean: 4, gun: true },
  fire: {
    legs: { b: [-34, -24, 0], f: [40, -6, 0] },
    arms: { b: [-14, 50], f: [90, 90] },
    lean: 7,
    gun: true,
    blast: true,
  },
  // calling up the fire pillars: both arms raised, the flames on his shoulders roaring
  raise: {
    legs: { b: [-30, -22, 0], f: [34, -6, 0] },
    arms: { b: [-150, -172], f: [150, 172] },
    lean: -2,
    gun: true,
    roar: true,
  },
  jumpR: {
    legs: { b: [-14, -40, -20], f: [66, -4, -10] },
    arms: { b: [-50, -20], f: [120, 150] },
    air: true,
    gun: true,
  },
  jumpF: { legs: { b: [-10, -22, -10], f: [32, 2, -5] }, arms: { b: [-70, -40], f: [100, 120] }, air: true, gun: true },
  hurt: {
    legs: { b: [-40, -10, 10], f: [36, 30, 10] },
    arms: { b: [-120, -150], f: [110, 140] },
    lean: -14,
    dy: 1,
    gun: true,
  },
  // the 3x view, the portraits and the flame wave: a wide stance, the cannon aimed, flames blazing
  action: {
    legs: { b: [-40, -32, 0], f: [48, -8, 0] },
    arms: { b: [-6, 96], f: [86, 88] },
    lean: 6,
    gun: true,
    roar: true,
  },
};
const _magmaPoses = {};
function magmaPose(id, make) {
  return _magmaPoses[id] || (_magmaPoses[id] = ncPose(id, make()));
}
function magmaFrame(pose, fr, arm, big, opt) {
  const P = MAGMA_POSES;
  if (big || pose === 'action') return magmaPose('action', () => P.action);
  if (pose === 'hurt') return magmaPose('hurt', () => P.hurt);
  if (pose === 'raise') return magmaPose('raise', () => P.raise);
  if (pose === 'jump') return magmaPose(fr ? 'jumpF' : 'jumpR', () => P[fr ? 'jumpF' : 'jumpR']);
  if (pose === 'run') {
    const n = 10,
      i = Math.floor(((fr * 1.4 * 2) / MAGMA_GAIT.stride) * n) % n;
    // walking, the cannon stays held out in front of him
    return magmaPose('walk' + i, () => {
      const g = ncGait(Object.assign({}, NC_BODY, MAGMA_BODY), MAGMA_GAIT, i / n);
      return Object.assign(g, { gun: true, arms: { b: g.arms.b, f: [64, 84] } });
    });
  }
  if (arm) {
    if (opt.state === 'wave') return magmaPose('action', () => P.action);
    return opt.armT > 8 ? magmaPose('fire', () => P.fire) : magmaPose('shoot', () => P.shoot);
  }
  return magmaPose('stand', () => P.stand);
}

const MS = NC_SHAPES;
const MAGMA_LEG = {
  thigh: 'M',
  thighW: 5.4,
  boot: 'R',
  w0: 8.6,
  w1: 11,
  band: ['Y', 1.8, 3, 9.6],
  sole: 'D',
  knee: ['R', 3.2, 0.4],
  shine: 'w',
};
const MAGMA_ARM = {
  upper: 'M',
  upperW: 4.4,
  glove: 'R',
  w0: 7,
  w1: 9,
  cuff: ['Y', 3.6, 4.8, 9.2],
  fist: 'M',
  fistR: 3.7,
};
function magmaFoot(G, L, B) {
  // lava veins down the boot and a gold toe
  const f = L.foot;
  G.paint('L', MS.strand(...along(...L.knee, L.a2, 3.6), ...along(...L.knee, L.a2, 5.4), ...f(3, 2.4), 1, 0.6), 'R');
  G.paint(
    'Y',
    MS.poly([...f(B.toe - 3, 1.2), ...f(B.toe + 0.2, 2.8), ...f(B.toe, B.ankleH - 1), ...f(B.toe - 3.6, B.ankleH - 1)]),
    'R',
  );
}
function magmaPad(G, sx, sy, far) {
  const { shape, paint } = G;
  // a huge round pad with a gold rim and a lava vein, and an exhaust pipe behind it
  shape('M', MS.rect(sx - 4.6, sy - 7.6, 3.6, 5.4, 1));
  shape('R', MS.ell(sx + (far ? -0.6 : 0.4), sy - 1.2, far ? 5.6 : 6.2, far ? 5 : 5.4));
  if (far) return;
  shape('Y', MS.strand(sx - 5.6, sy + 1, sx + 0.4, sy + 5.4, sx + 6.6, sy + 0.8, 1.4, 1.4), false);
  paint('L', MS.strand(sx - 2, sy - 4.4, sx + 1, sy - 1.6, sx + 3.4, sy - 3.6, 0.9, 0.5), 'R');
  shape('w', MS.ell(sx - 1.8, sy - 4, 2, 1), false);
}
function magmaCannon(G, A) {
  const { shape } = G,
    [ex, ey] = A.elbow,
    p = d => along(ex, ey, A.a2, d);
  shape('M', MS.cap(...A.sh, ex, ey, 4.4));
  // the gold cannon: a thick barrel widening to the muzzle, dark bands, a red-hot bore
  shape('Y', MS.all(MS.cap(...p(0), ...p(8), 9.2), MS.cap(...p(7.4), ...p(11.4), 10.8)));
  shape('M', MS.bar(...p(2.4), ...p(3.4), 9.2), false);
  shape('M', MS.bar(...p(6.2), ...p(7), 9.6), false);
  shape('D', MS.disc(...p(12.2), 3.8));
  shape('E', MS.disc(...p(12.6), 2.2), false);
  shape('l', MS.disc(...p(12.8), 1), false);
  shape('w', MS.cap(...along(...p(0.8), A.a2 + 90, 3), ...along(...p(9.6), A.a2 + 90, 3.4), 1.1), false);
}
function magmaTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('M', Wa(MS.poly([19.8, 24.4, 29.2, 24.4, 28.8, 29.4, 20.2, 29.4]))); // dark waist
  shape('R', Wa(MS.poly([18.4, 28.8, 30.4, 28.8, 30, 31.6, 27, 33.4, 21.8, 33.4, 18.8, 31.6]))); // hip armour
  shape('Y', Wa(MS.bar(18.6, 29.2, 30.2, 29.2, 1.2)), false);
  shape('E', Wa(MS.disc(24.4, 30.6, 1.2)));
  shape('R', U(MS.poly([13.8, 16.4, 34.4, 16.4, 33.8, 22.8, 29.4, 27, 19.6, 27, 14.4, 22.8]))); // chest
  // lava veins across the chest plates
  paint(
    'L',
    U(
      MS.all(
        MS.strand(16.4, 18.6, 19.6, 21.6, 18.4, 24.6, 0.9, 0.5),
        MS.strand(32, 18.6, 29.4, 21.4, 30.6, 24.4, 0.9, 0.5),
        MS.strand(21, 24.6, 24.4, 23.4, 27.8, 24.8, 0.8, 0.8),
      ),
    ),
    'R',
  );
  shape('Y', U(MS.poly([19.4, 15.8, 29.6, 15.8, 28, 18, 24.5, 19.4, 21, 18]))); // gold collar
  shape('Y', U(MS.disc(24.5, 21.4, 2.4))); // the core
  shape('E', U(MS.disc(24.5, 21.4, 1.4)), false);
  shape('l', U(MS.disc(24.1, 21, 0.6)), false);
  shape('w', U(MS.ell(17.8, 18.6, 2, 0.8)), false);
}
function magmaHead(G, J) {
  const { shape, paint } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  // two bull horns sweeping up from the sides of the helmet, with gold rings at their roots
  shape('R', MS.strand(...o(-4.6, -3.6), ...o(-11.6, -6), ...o(-10.4, -15.4), 4.8, 0));
  shape('R', MS.disc(hx - 0.2, hy - 0.4, 7.6)); // helmet
  shape('R', MS.strand(...o(4.2, -5.4), ...o(9.4, -8.6), ...o(7.6, -16.2), 4.4, 0));
  shape('Y', MS.disc(...o(-4.4, -3.8), 2.2));
  shape('Y', MS.disc(...o(4.2, -5.6), 2));
  // the face: a dark opening under a gold brow, slanted red eyes, the grey grill of the mouth
  shape('D', MS.poly([...o(1.2, -1.6), ...o(9, -1.8), ...o(9.2, 4.6), ...o(6.8, 7.4), ...o(2.8, 7), ...o(1, 3.8)]));
  shape('Y', MS.poly([...o(0.4, -3.8), ...o(9.6, -4), ...o(10, -1), ...o(5.6, 0.6), ...o(0.6, -0.8)]));
  shape(
    'E',
    MS.poly([...o(3.2, 0.8), ...o(5.6, 1.6), ...o(8.6, 0.2), ...o(8.4, 2), ...o(5.4, 3), ...o(3.4, 2.4)]),
    false,
  );
  shape('V', MS.poly([...o(3, 4), ...o(8.2, 3.6), ...o(7.6, 6.4), ...o(3.8, 6.6)]));
  paint('D', MS.all(MS.bar(...o(4.4, 3.8), ...o(4.4, 6.8), 0.6), MS.bar(...o(6.2, 3.6), ...o(6.2, 6.8), 0.6)), 'V');
  shape('E', MS.disc(...o(4.6, -5.4), 1.6)); // forehead gem
  shape('l', MS.disc(...o(4.2, -5.8), 0.6), false);
  paint('L', MS.strand(...o(-6, -1), ...o(-4, 2), ...o(-5.4, 5), 0.9, 0.5), 'R');
  shape('w', MS.ell(...o(-3.6, -4.4), 1.8, 1), false);
}
function magmaDraw(G, J, P) {
  const B = G.B;
  magmaPad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, MAGMA_ARM);
  for (const s of ['b', 'f']) {
    ncLeg(G, J.legs[s], B, Object.assign({ foot: NC_FOOT(B, 1.15) }, MAGMA_LEG));
    magmaFoot(G, J.legs[s], B);
  }
  magmaTorso(G, J);
  if (P.gun) magmaCannon(G, J.arms.f);
  else ncArm(G, J.arms.f, MAGMA_ARM);
  magmaPad(G, ...J.arms.f.sh, false);
  magmaHead(G, J);
}
// a flame (base on box point 24, 24, rising s x 12 units), one of three flickers
function magmaFlame(step, s) {
  return G => {
    const { shape } = G,
      j = [
        [0, 0, 0],
        [1.4, -1.2, 0.8],
        [-1, 1, -1.2],
      ][step],
      P = pts => MS.poly(pts.flatMap(([x, y]) => [24 + x * s, 24 + y * s]));
    shape(
      'F',
      P([
        [-4.4, 0],
        [-5, -4 + j[0]],
        [-3, -6.4],
        [-2.4, -4.6],
        [-0.6, -11.4 + j[1]],
        [1.6, -5.6],
        [3.4, -8.4 + j[2]],
        [4.6, -3.4],
        [3.6, 0],
      ]),
      false,
    );
    shape(
      'f',
      P([
        [-2.8, 0],
        [-3, -3],
        [-1.2, -4.4],
        [-0.2, -8 + j[1] * 0.6],
        [1.4, -3.6],
        [2.6, -4.8 + j[2] * 0.6],
        [2.6, 0],
      ]),
      false,
    );
    shape(
      'W',
      P([
        [-1.4, 0],
        [-1, -2.6],
        [0.4, -4.4],
        [1.4, -1.8],
        [1.2, 0],
      ]),
      false,
    );
  };
}
// the exhausts behind his shoulders burn all the time (behind him), roaring while he calls up the pillars or sends
// the wave; a defeated Magmaron does not burn
function magmaBefore(P, J, at, c) {
  if (c.pal.gray) return;
  const s = P.roar ? 1.3 : 0.75;
  for (const side of ['b', 'f']) {
    // the far exhaust behind his back, the near one beside his head
    const [sx, sy] = J.arms[side].sh,
      [x, y] = side === 'b' ? at(sx - 3.6, sy - 5.6) : at(sx + 3.4, sy - 4.6),
      step = ((frameCount >> 2) + (side === 'b' ? 1 : 0)) % 3;
    glow(x, y - 3 * s, 7 * s, '#ff7018', 0.35);
    drawNativeProp(
      c.style,
      NATIVE_CHARS.fire,
      'flame' + s + '|' + step,
      magmaFlame(step, s),
      x,
      y,
      c.pal,
      c.flip,
      c.big,
    );
  }
}
function magmaAfter(P, J, at, c) {
  if (P.blast && !c.pal.gray) {
    const A = J.arms.f,
      [x, y] = at(...along(...A.elbow, A.a2, 13.6));
    glow(x, y, 12, '#ff8020', 0.8);
    circle(x, y, 3, '#fff0b0');
  }
}
NATIVE_CHARS.fire = {
  body: MAGMA_BODY,
  colors: pal => ncFixed(MAGMA_TONES, pal),
  flat: 'KDEwLlFfW',
  frame: magmaFrame,
  draw: magmaDraw,
  before: magmaBefore,
  after: magmaAfter,
};
