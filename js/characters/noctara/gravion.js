'use strict';
// Gravion, boss of the gravity stage, drawn natively (see js/characters/chars.js): an astronomer knight in indigo armour
// under a long dark coat. Signature: a planet's ring floating behind his head, shoulder pads like ringed planets, a
// black hole set in his breastplate, violet light in his gauntlets, and three little moons always circling him. The
// raised gauntlet blazes while he pulls, his fists strike the floor when he turns the room's gravity over, and he
// spreads his arms floating at the top of his leap. The face is the shared men's face (ncManFace).
// Letters: K outline, A indigo armour, a its light, V violet glow, v its white heart, C coat, L silver, D dark, O moon,
// o moonlight, Z hair, z hair shine, w gloss; S skin, eyes E I U W, N nose, M mouth.
const GRAVION_TONES = {
  K: '#0c0a1a',
  A: '#3a2c78',
  a: '#6a58b8',
  V: '#b898fc',
  v: '#f0e8fc',
  C: '#1c1840',
  L: '#c8c4dc',
  D: '#120e26',
  O: '#8878b8',
  o: '#d8ccfc',
  Z: '#3c3458',
  z: '#8a80b0',
  w: '#ffffff',
  S: '#f0c8a8',
  E: '#ffffff',
  I: '#7a58d8',
  U: '#1a0e3a',
  W: '#ffffff',
  N: '#c89878',
  M: '#8a3a4a',
};
const GRAV_BODY = { hipW: 3, shB: [18, 19.8], shF: [31, 20], upper: 3.8, fore: 4.8 };
// walking in on the player: slow, heavy strides
const GRAV_GAIT = {
  stride: 44,
  stance: 0.34,
  hipW: 3,
  lift: 4.6,
  kick: 0.4,
  reach: 3,
  hip: 33,
  sink: 0.9,
  rise: 0.6,
  lean: 7,
  arm: 26,
  elbow: 60,
};
const GRAV_POSES = {
  stand: { legs: { b: [-28, -20, 0], f: [32, -6, 0] }, arms: { b: [-16, 30], f: [14, 56] }, lean: 2 },
  // a gravity orb leaving the gauntlet
  shoot: { legs: { b: [-34, -24, 0], f: [40, -8, 0] }, arms: { b: [-18, 24], f: [88, 90] }, lean: 6, glow: true },
  // the pull and the black hole: the gauntlet raised toward the player, blazing
  raise: { legs: { b: [-34, -26, 0], f: [42, -8, 0] }, arms: { b: [-24, 10], f: [124, 140] }, lean: -3, glow: true },
  // turning the room over: both fists struck down onto the floor
  slam: {
    legs: { b: [-62, 22, 0], f: [66, -18, 0] },
    arms: { b: [24, 8], f: [44, 18] },
    bend: 24,
    lean: 6,
    slam: true,
  },
  // at the top of the meteor drop: floating, arms spread, legs together
  hover: {
    legs: { b: [-6, -2, -10], f: [10, 6, -10] },
    arms: { b: [-104, -84], f: [104, 84] },
    air: true,
    flow: 0.8,
    glow: true,
  },
  jumpR: {
    legs: { b: [-14, -44, -25], f: [70, -6, -10] },
    arms: { b: [-44, -4], f: [130, 160] },
    air: true,
    flow: 0.7,
  },
  jumpF: { legs: { b: [-8, -24, -15], f: [30, 4, -5] }, arms: { b: [-70, -40], f: [96, 120] }, air: true, flow: 0.3 },
  land: { legs: { b: [-58, 20, 0], f: [64, -18, 0] }, arms: { b: [-30, 6], f: [36, 20] }, bend: 18, lean: 4 },
  hurt: {
    legs: { b: [-44, -6, 10], f: [40, 46, 10] },
    arms: { b: [-130, -160], f: [120, 150] },
    lean: -16,
    dy: 2,
    face: 'hurt',
    flow: 0.5,
  },
  // the 3x view and the portraits: the gauntlet thrust out, glowing
  action: {
    legs: { b: [-40, -32, 0], f: [48, -8, 0] },
    arms: { b: [-12, 96], f: [84, 86] },
    lean: 6,
    glow: true,
    flow: 0.4,
  },
};
const _gravPoses = {};
function gravPose(id) {
  return _gravPoses[id] || (_gravPoses[id] = ncPose(id, GRAV_POSES[id]));
}
function gravFrame(pose, fr, arm, big, opt) {
  if (big || pose === 'action') return gravPose('action');
  if (pose === 'hurt') return gravPose('hurt');
  if (pose === 'raise' || pose === 'slam' || pose === 'hover') return gravPose(pose);
  if (pose === 'jump') return gravPose(fr ? 'jumpF' : 'jumpR');
  if (pose === 'run') {
    const n = 10,
      i = Math.floor(((fr * 1.4 * 2) / GRAV_GAIT.stride) * n) % n;
    return (
      _gravPoses['run' + i] ||
      (_gravPoses['run' + i] = ncPose('run' + i, ncGait(Object.assign({}, NC_BODY, GRAV_BODY), GRAV_GAIT, i / n)))
    );
  }
  if (opt.landT > 0) return gravPose('land');
  if (arm) return gravPose('shoot');
  return gravPose('stand');
}

const GV = NC_SHAPES;
const GRAV_LEG = {
  thigh: 'D',
  thighW: 4.4,
  boot: 'A',
  w0: 7.2,
  w1: 10,
  band: ['L', 2.4, 3.4, 8.8],
  sole: 'D',
  knee: ['a', 2.6, 0.6],
  shine: 'w',
};
const GRAV_ARM = { upper: 'D', upperW: 3.4, glove: 'A', w0: 6, w1: 8, cuff: ['V', 3.6, 4.4, 8], fist: 'A', fistR: 3.2 };
// a shoulder pad like a ringed planet
function gravPad(G, sx, sy, far) {
  const r = far ? 4.2 : 5;
  G.shape('A', GV.disc(sx + (far ? -0.6 : 0.4), sy - 1, r));
  G.paint('a', GV.disc(sx - 1, sy - 2.6, r * 0.45), 'A');
  if (!far) G.shape('L', GV.xf(GV.annulus(0, 0, 5.4, 6.6), sx + 0.4, sy - 1, -18, 1, 0.34), false);
}
// the long coat behind him, its tails swinging back as he leaps
function gravCoat(G, J, P) {
  const Wa = J.waist,
    f = P.flow || 0;
  G.shape('C', Wa(GV.poly([18.6, 24.6, 26.4, 24.6, 26, 34 - f * 2, 22 - f * 6, 41 - f * 3, 13.6 - f * 7, 40 - f * 6])));
  G.paint('a', Wa(GV.strand(18, 26, 15.4 - f * 4, 33, 14.4 - f * 7, 39 - f * 6, 1, 0.8)), 'C');
}
function gravTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('D', Wa(GV.poly([21, 24, 28.2, 24, 27.8, 29.4, 21.4, 29.4])));
  shape('A', Wa(GV.poly([19.6, 28.4, 29.2, 28.4, 28.8, 31, 26.2, 32.6, 22.6, 32.6, 20, 31])));
  shape('L', Wa(GV.bar(19.6, 28.8, 29.2, 28.8, 1.2)), false);
  shape('A', U(GV.poly([15, 17, 33.6, 17, 33.2, 22.8, 29, 26.4, 20.6, 26.4, 15.4, 22.8])));
  paint('a', U(GV.poly([15.4, 17.4, 21, 17.4, 20, 21, 15.8, 21.6])), 'A');
  shape('L', U(GV.poly([20.4, 16.4, 29.8, 16.4, 28.4, 18.4, 25, 19.4, 21.8, 18.4]))); // the high collar
  // the black hole in his breastplate: a dark core in a violet ring
  shape('V', U(GV.disc(24.9, 22.2, 3.2)));
  shape('D', U(GV.disc(24.9, 22.2, 2.1)), false);
  shape('v', U(GV.disc(24.2, 21.4, 0.5)), false);
}
function gravHead(G, J, P) {
  const { shape, paint } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  // hair swept up and back, behind the face
  shape(
    'Z',
    GV.all(
      GV.ell(hx - 1.6, hy - 1.2, 7.8, 7.6),
      GV.strand(...o(0, -6), ...o(-5, -11), ...o(-11, -11.6), 5, 0),
      GV.strand(...o(-4, -4), ...o(-9, -6.4), ...o(-13.6, -5), 4.4, 0),
      GV.strand(...o(3, -6.6), ...o(0.4, -12.6), ...o(-3.6, -15.6), 4.6, 0),
    ),
  );
  paint('z', GV.strand(...o(-1.6, -7.6), ...o(-5.6, -10.6), ...o(-9.6, -11), 1, 0), 'Z');
  ncManFace(G, hx, hy, P.face || 'angry');
  // the fringe, and a silver circlet with a violet gem on his brow
  shape(
    'Z',
    GV.all(GV.strand(...o(2.4, -5.8), ...o(4.6, -3.6), ...o(5.4, -1.4), 3, 0), GV.ell(...o(1.6, -4.8), 5, 1.8)),
  );
  shape('L', GV.poly([...o(-4.4, -3.6), ...o(9.2, -4.4), ...o(9.6, -3), ...o(-4, -2.2)]));
  shape('V', GV.poly([...o(5.6, -5.6), ...o(7, -3.8), ...o(5.6, -2), ...o(4.2, -3.8)]));
  shape('v', GV.disc(...o(5.4, -4.2), 0.5), false);
}
function gravDraw(G, J, P) {
  const B = G.B;
  gravCoat(G, J, P);
  gravPad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, GRAV_ARM);
  ncLeg(G, J.legs.b, B, GRAV_LEG);
  ncLeg(G, J.legs.f, B, GRAV_LEG);
  gravTorso(G, J);
  ncArm(G, J.arms.f, GRAV_ARM);
  gravPad(G, ...J.arms.f.sh, false);
  gravHead(G, J, P);
}
// a little moon (k: which of three)
function gravMoon(k) {
  return G => {
    const r = [2.6, 2, 2.3][k];
    G.shape('O', GV.disc(24, 24, r));
    G.paint('o', GV.disc(23.2, 23.2, r * 0.5), 'O');
  };
}
// the planet's ring behind his head
function gravRing(G) {
  G.shape('V', GV.xf(GV.annulus(0, 0, 12.4, 14.4), 24, 24, -16, 1, 0.3), false);
  G.shape('v', GV.xf(GV.annulus(0, 0, 13.2, 13.7), 24, 24, -16, 1, 0.3), false);
}
const gravMoonAt = (i, t) => {
  const a = t * 0.045 + (i * Math.PI * 2) / 3;
  return [24 + Math.cos(a) * 19, 22 + Math.sin(a) * 6, Math.sin(a)];
};
function gravMoons(P, at, c, front) {
  for (let i = 0; i < 3; i++) {
    const [x, y, s] = gravMoonAt(i, frameCount);
    if (s > 0 !== front) continue;
    const [sx, sy] = at(x, y);
    drawNativeProp(c.style, NATIVE_CHARS.gravity, 'moon' + i, gravMoon(i), sx, sy, c.pal, c.flip, c.big);
  }
}
function gravBefore(P, J, at, c) {
  const [hx, hy] = J.head,
    [x, y] = at(hx - 2.4, hy - 1.4);
  if (!c.pal.gray) glow(x, y, 12, '#9878f8', 0.35);
  drawNativeProp(c.style, NATIVE_CHARS.gravity, 'ring', gravRing, x, y, c.pal, c.flip, c.big);
  gravMoons(P, at, c, false);
}
// the moons in front of him, light in the raised gauntlet, the floor buckling under the slam
function gravAfter(P, J, at, c) {
  gravMoons(P, at, c, true);
  if (c.pal.gray) return;
  if (P.glow) {
    const [x, y] = at(...J.arms.f.hand);
    glow(x, y, 10, '#9878f8', 0.6);
    circle(x, y, 1.6, '#f0e8fc');
  }
  if (P.slam) {
    const [x, y] = at(24, 47);
    glow(x, y, 20, '#9878f8', 0.45);
    for (const d of [-1, 1]) R(x + d * 8 - (d < 0 ? 6 : 0), y - 1, 6, 1, '#c8b8fc');
  }
}
NATIVE_CHARS.gravity = {
  body: GRAV_BODY,
  colors: pal => ncFixed(GRAVION_TONES, pal),
  flat: 'KvoDwEIUWNMz',
  hair: 'Z',
  skin: 'S',
  frame: gravFrame,
  draw: gravDraw,
  before: gravBefore,
  after: gravAfter,
};
