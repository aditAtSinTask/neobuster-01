'use strict';
// Terralyn, boss of the earth stage, drawn natively after her character sheet (see js/characters/chars.js): olive-brown rock
// armour in angular plates over a dark bodysuit, glowing green gems, a rocky crown with a gem on her brow, boulder
// shoulder pads, a huge rock fist, and a long chestnut ponytail; stones hover round her when she calls down the rocks.
// Letters: K outline, R rock, O moss, G green gem, g its glow, n dark bodysuit, Z hair, z hair shine, S skin, eyes
// E I U W, N nose, M lips, w gloss.
const TERRALYN_TONES = {
  K: '#100c0a',
  R: '#8e6c44',
  O: '#6c7a3a',
  G: '#76d652',
  g: '#e6ffcc',
  n: '#2e2a28',
  Z: '#7c4430',
  z: '#bc7448',
  S: '#f2c8a8',
  E: '#ffffff',
  I: '#3c9e4c',
  U: '#123a22',
  W: '#ffffff',
  N: '#d09a7c',
  M: '#c86868',
  w: '#f4e8d0',
};
const TERRA_BODY = { hipW: 2.5, shB: [18.8, 19.8], shF: [30.4, 20.2], upper: 3.6, fore: 4.8 };
const TERRA_POSES = {
  stand: { legs: { b: [-26, -18, 0], f: [30, -6, 0] }, arms: { b: [-18, 16], f: [14, 48] }, lean: 2 },
  // the boulder: the rock fist drawn back as green energy gathers in it, then thrust out in a burst
  charge: { legs: { b: [-36, -26, 0], f: [42, -8, 0] }, arms: { b: [10, 100], f: [-40, 40] }, lean: -2, energy: true },
  fire: { legs: { b: [-42, -32, 0], f: [50, -8, 0] }, arms: { b: [-30, 10], f: [92, 92] }, lean: 10, burst: true },
  shoot: { legs: { b: [-38, -28, 0], f: [46, -8, 0] }, arms: { b: [-24, 16], f: [88, 90] }, lean: 7 },
  // calling down the rocks: her arms raised, stones hovering round her
  raise: {
    legs: { b: [-34, -24, 0], f: [38, -6, 0] },
    arms: { b: [-150, -170], f: [140, 160] },
    lean: -3,
    stones: true,
  },
  jumpR: {
    legs: { b: [-14, -44, -25], f: [70, -6, -10] },
    arms: { b: [-44, -4], f: [130, 160] },
    air: true,
    flow: 0.6,
  },
  // punching down at the top of the quake leap, then falling legs first and landing in a burst of rock spikes
  jumpP: {
    legs: { b: [-20, -50, -20], f: [60, -10, -10] },
    arms: { b: [-60, -30], f: [60, 30] },
    air: true,
    flow: 0.4,
  },
  jumpF: { legs: { b: [-8, -24, -15], f: [30, 4, -5] }, arms: { b: [-70, -40], f: [96, 120] }, air: true, flow: 0.2 },
  land: {
    legs: { b: [-62, 22, 0], f: [70, -20, 0] },
    arms: { b: [-40, -10], f: [30, 10] },
    bend: 20,
    lean: 4,
    spikes: true,
  },
  hurt: {
    legs: { b: [-44, -6, 10], f: [40, 46, 10] },
    arms: { b: [-130, -160], f: [120, 150] },
    lean: -16,
    dy: 2,
    face: 'hurt',
    flow: 0.5,
  },
  // the 3x view and the portraits: her rock fist thrust out, stones hovering round her
  action: { legs: { b: [-40, -32, 0], f: [48, -8, 0] }, arms: { b: [-10, 100], f: [84, 86] }, lean: 6, stones: true },
};
const _terraPoses = {};
function terraPose(id) {
  return _terraPoses[id] || (_terraPoses[id] = ncPose(id, TERRA_POSES[id]));
}
// the energy gathers in her fist before the boulder (thrown at tick 14; see BOSSES.earth), bursts as it leaves, and her
// arm stays out for a moment; the quake leap rises, punches at the top, falls and lands in a burst of rock spikes
function terraFrame(pose, fr, arm, big, opt) {
  if (big || pose === 'action') return terraPose('action');
  if (pose === 'hurt') return terraPose('hurt');
  if (pose === 'raise') return terraPose('raise');
  if (pose === 'jump') {
    const vy = opt.vy || 0;
    return terraPose(vy < -2.5 ? 'jumpR' : vy < 2 ? 'jumpP' : 'jumpF');
  }
  if (opt.landT > 0) return terraPose('land');
  if (arm) return terraPose(opt.armT > 9 ? 'fire' : 'shoot');
  if (opt.state === 'boulder' && opt.t < 14) return terraPose('charge');
  return terraPose('stand');
}

const TS = NC_SHAPES;
// an angular rock plate: a polygon of points round (x, y) at radii rs, turned by a degrees
const rockPoly = (x, y, rs, a = 0) => TS.poly(rs.flatMap((r, i) => along(x, y, a + (i * 360) / rs.length, r)));
const TERRA_LEG = { thigh: 'n', thighW: 3.6, boot: 'R', w0: 6.6, w1: 9.4, band: ['O', 2.2, 3.4, 8], sole: 'n' };
const TERRA_ARM = {
  upper: 'n',
  upperW: 2.8,
  glove: 'R',
  w0: 5.2,
  w1: 7.2,
  cuff: ['O', 3.4, 4.4, 7.4],
  fist: 'R',
  fistR: 2.8,
};
function terraLeg(G, L, B) {
  ncLeg(G, L, B, Object.assign({ foot: NC_FOOT(B, 1.05) }, TERRA_LEG));
  // a rock knee plate with a green gem
  const [px, py] = along(...L.knee, L.a2, 0.6);
  G.shape('R', rockPoly(px, py, [3, 2.6, 3.2, 2.4, 2.8, 2.6], L.a2));
  G.shape('G', TS.disc(px + 0.4, py, 0.9), false);
}
function terraArm(G, A, big) {
  ncArm(G, A, TERRA_ARM);
  // the rock fist: a big angular stone round the hand
  G.shape('R', rockPoly(...A.hand, big ? [4.4, 3.6, 4.2, 3.4, 4, 3.6, 4.6] : [3.4, 2.8, 3.2, 2.8, 3], A.a2));
  if (big) G.paint('G', TS.cap(...along(...A.hand, A.a2 + 90, 1), ...along(...A.hand, A.a2 - 60, 1.6), 0.8), 'R');
}
function terraPad(G, sx, sy, far) {
  G.shape(
    'R',
    rockPoly(
      sx + (far ? -0.6 : 0.4),
      sy - 1.4,
      far ? [4.4, 3.8, 4.8, 3.6, 4.2, 4] : [5.2, 4.4, 5.4, 4.2, 5, 4.6, 4.8],
      15,
    ),
  );
  if (!far) {
    G.paint('O', TS.cap(sx - 3, sy - 3.4, sx + 1.6, sy - 4.6, 1.2), 'R');
    G.shape('G', TS.disc(sx + 1, sy - 1, 1.2), false);
  }
}
function terraTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('n', Wa(TS.poly([21.2, 24, 28, 24, 27.6, 29.4, 21.6, 29.4]))); // dark waist
  shape('R', Wa(TS.poly([20.4, 28.2, 28.8, 28.2, 28.4, 30.8, 25.8, 32.6, 23, 32.6, 20.8, 30.8]))); // rock belt
  shape('G', Wa(TS.disc(24.6, 29.8, 0.9)), false);
  shape('n', U(TS.poly([17.4, 17.4, 31.6, 17.4, 31.2, 22.6, 27.8, 25.6, 21.6, 25.6, 17.8, 22.6]))); // bodysuit
  // rock plates over the chest, a green gem between them
  shape(
    'R',
    U(TS.all(rockPoly(21.6, 20.2, [3.4, 2.8, 3, 2.6, 3.2]), rockPoly(27.6, 20.2, [3.2, 2.8, 3.4, 2.6, 3], 30))),
  );
  paint('O', U(TS.cap(19.6, 18.6, 22.6, 18, 1)), 'R');
  shape('G', U(TS.poly([24.6, 19.6, 25.8, 21.2, 24.6, 22.8, 23.4, 21.2])));
  shape('g', U(TS.disc(24.4, 20.8, 0.5)), false);
}
// the head over the body: the crown of her hair, the face, the fringe and side locks, and the rocky crown
function terraHead(G, J, P) {
  const { shape, paint } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  shape('Z', TS.ell(hx - 1.4, hy - 1, 7.6, 7.4));
  ncWomanFace(G, hx, hy, P.face);
  shape(
    'Z',
    TS.all(
      TS.ell(...o(2.6, -4.6), 6.6, 2.4),
      TS.strand(...o(1.4, -5.6), ...o(2.4, -2.4), ...o(2.8, 0.8), 3.2, 0),
      TS.strand(...o(4.8, -5.4), ...o(5.8, -2.6), ...o(6.4, -0.2), 3, 0),
      TS.strand(...o(-0.8, -3), ...o(-1.4, 2.4), ...o(0, 8.4), 3, 0.6),
    ),
  );
  // the crown: rock plates round her brow rising into points at the back, a green gem in front
  shape(
    'R',
    TS.all(
      TS.poly([
        ...o(-5.6, -3.4),
        ...o(-1, -8),
        ...o(5, -8),
        ...o(9.6, -4.4),
        ...o(8.8, -3),
        ...o(4.6, -5.6),
        ...o(-0.4, -5.6),
        ...o(-4.4, -2),
      ]),
      TS.spike(...o(-3.4, -6), 214, 6.4, 4),
      TS.spike(...o(0.6, -7.6), 192, 4.6, 3.6),
    ),
  );
  paint('O', TS.cap(...o(-2.4, -6.6), ...o(2.4, -7.6), 1), 'R');
  shape('G', TS.poly([...o(5, -9.4), ...o(6.6, -6.6), ...o(5, -4.4), ...o(3.4, -6.6)]));
  shape('g', TS.disc(...o(4.8, -7), 0.6), false);
  shape('z', TS.strand(...o(-4.6, -2.6), ...o(-6, 2), ...o(-5.4, 6.4), 1, 0.4), false);
}
function terraDraw(G, J, P) {
  const B = G.B,
    [hx, hy] = J.head;
  // the ponytail, behind everything: tied high at the back of her head
  ncLongHair(G, hx, hy - 2, { flow: P.flow === undefined ? 0.15 : P.flow, len: 24, locks: 5, wave: 0, width: 6.6 });
  terraPad(G, ...J.arms.b.sh, true);
  terraArm(G, J.arms.b, false);
  terraLeg(G, J.legs.b, B);
  terraLeg(G, J.legs.f, B);
  terraTorso(G, J);
  terraArm(G, J.arms.f, true);
  terraPad(G, ...J.arms.f.sh, false);
  terraHead(G, J, P);
}
// a hovering stone
function terraStone(i) {
  return G => {
    G.shape(
      'R',
      rockPoly(
        24,
        24,
        [
          [2.6, 2.2, 2.8, 2, 2.4],
          [3.4, 2.6, 3, 2.8, 3.2, 2.4],
          [2.2, 1.8, 2.4, 2],
        ][i % 3],
        i * 40,
      ),
    );
    G.paint('O', TS.cap(22.6, 23, 24.6, 22.4, 0.8), 'R');
  };
}
// a rock spike bursting out of the ground (base on box point 24, 24), with a green glow at its root
function terraSpike(h) {
  return G => {
    G.shape('R', TS.poly([24 - 2.4, 24, 24 - 0.6, 24 - h, 24 + 1.4, 24 - h * 0.6, 24 + 2.6, 24]));
    G.paint('G', TS.cap(23.4, 23.4, 24.2, 24 - h * 0.5, 0.8), 'R');
  };
}
const TERRA_STONES = [
  [-6, 4, 0],
  [36, -2, 1],
  [-2, 22, 2],
  [40, 18, 0],
];
function terraStones(P, at, c, front) {
  if (!P.stones) return;
  TERRA_STONES.forEach(([x, y, k], i) => {
    if ((i & 1) !== (front ? 1 : 0)) return;
    const [sx, sy] = at(x, y + Math.sin(frameCount * 0.08 + i * 1.7) * 1.6);
    drawNativeProp(c.style, NATIVE_CHARS.earth, 'stone' + k, terraStone(k), sx, sy, c.pal, c.flip, c.big);
  });
}
function terraBefore(P, J, at, c) {
  terraStones(P, at, c, false);
}
function terraAfter(P, J, at, c) {
  terraStones(P, at, c, true);
  if (c.pal.gray) return;
  const A = J.arms.f,
    o = c.opt;
  if (P.energy) {
    const [x, y] = at(...A.hand),
      r = 1 + clamp((o.t || 0) / 14, 0, 1) * 2.6;
    glow(x, y, 6 + r * 3, '#8ae858', 0.55);
    circle(x, y, r, '#a8f070');
    circle(x, y, r * 0.5, '#f0ffd8');
  }
  if (P.burst) {
    const [x, y] = at(...along(...A.elbow, A.a2, 9));
    glow(x, y, 12, '#8ae858', 0.8);
    circle(x, y, 3, '#f0ffd8');
  }
  if (P.spikes) {
    // rock spikes burst up round her feet, shrinking back as the landing passes
    const h = 4 + clamp((o.landT || 0) / 14, 0, 1) * 8;
    for (const [x, s] of [
      [6, 0.8],
      [14, 1],
      [36, 1],
      [44, 0.8],
    ]) {
      const [sx, sy] = at(x, 48);
      drawNativeProp(
        c.style,
        NATIVE_CHARS.earth,
        'spike' + Math.round(h * s),
        terraSpike(Math.round(h * s)),
        sx,
        sy,
        c.pal,
        c.flip,
        c.big,
      );
    }
    const [gx, gy] = at(24, 46);
    glow(gx, gy, 18, '#8ae858', 0.35);
  }
}
NATIVE_CHARS.earth = {
  body: TERRA_BODY,
  colors: pal => ncFixed(TERRALYN_TONES, pal),
  flat: 'KgEIUWNMwz',
  hair: 'Z',
  skin: 'S',
  frame: terraFrame,
  draw: terraDraw,
  before: terraBefore,
  after: terraAfter,
};
