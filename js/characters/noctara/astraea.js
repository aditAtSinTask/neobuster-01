'use strict';
// Astraea, boss of the astral stage, drawn natively (see js/characters/chars.js): the keeper of the star gates, in a
// white robe edged with gold under a night-blue cape scattered with stars. Signature: a halo of light with four little
// star gates set round it, long silver hair, a gold tiara with a star, and a scepter tipped with a star; stars
// twinkle round her. She raises the scepter to open the gates in the ceiling and set out her constellations, points it
// to fire through her gates, and dives out of a gate kicking. The face is the shared women's face (ncWomanFace).
// Letters: K outline, C cape, c its light, Y gold, y gold light, R robe, r its shade, P gate violet, Z hair,
// z hair shine, w gloss; S skin, eyes E I U W, N nose, M lips.
const ASTRAEA_TONES = {
  K: '#0a0a1c',
  C: '#1c2458',
  c: '#34428c',
  Y: '#f0c040',
  y: '#fcf4c8',
  R: '#eeeaf8',
  r: '#b8b0d8',
  P: '#8868e8',
  Z: '#dcd4f6',
  z: '#ffffff',
  w: '#ffffff',
  S: '#f8e0d0',
  E: '#ffffff',
  I: '#c89828',
  U: '#3a2408',
  W: '#ffffff',
  N: '#e0b0a0',
  M: '#d07888',
};
const AST_BODY = { hipW: 2.2, shB: [19.2, 19.8], shF: [30, 20.2], upper: 3.6, fore: 4.6 };
const AST_GAIT = {
  stride: 46,
  stance: 0.3,
  hipW: 1.2,
  lift: 5,
  kick: 0.5,
  reach: 3.2,
  hip: 33,
  sink: 0.5,
  rise: 0.9,
  lean: 8,
  arm: 24,
  elbow: 60,
};
const AST_POSES = {
  // the scepter held upright at her side
  stand: { legs: { b: [-18, -12, 0], f: [22, -4, 0] }, arms: { b: [-10, 34], f: [20, 40] }, lean: 1, flow: 0.2 },
  // the scepter raised: gates open, a constellation is set out, a star is kindled
  cast: {
    legs: { b: [-26, -18, 0], f: [30, -6, 0] },
    arms: { b: [-60, -26], f: [150, 168] },
    lean: -3,
    flow: 0.5,
    glow: true,
  },
  // the scepter pointed: a beam into a gate
  point: {
    legs: { b: [-32, -22, 0], f: [38, -6, 0] },
    arms: { b: [-30, 10], f: [86, 88] },
    lean: 5,
    flow: 0.5,
    glow: true,
    wand: 'arm',
  },
  // out of a gate, diving at the player foot first
  kick: {
    legs: { b: [-40, -64, -10], f: [64, 30, 0] },
    arms: { b: [-120, -100], f: [-60, -30] },
    lean: 18,
    air: true,
    flow: 1,
    trail: true,
  },
  jumpR: {
    legs: { b: [-14, -44, -25], f: [70, -6, -10] },
    arms: { b: [-44, -4], f: [130, 160] },
    air: true,
    flow: 0.7,
  },
  jumpF: { legs: { b: [-8, -24, -15], f: [30, 4, -5] }, arms: { b: [-70, -40], f: [96, 120] }, air: true, flow: 0.3 },
  hurt: {
    legs: { b: [-44, -6, 10], f: [40, 46, 10] },
    arms: { b: [-130, -160], f: [120, 150] },
    lean: -16,
    dy: 2,
    face: 'hurt',
    flow: 0.5,
  },
  // the 3x view and the portraits: the scepter thrust forward, the cape flowing
  action: {
    legs: { b: [-38, -30, 0], f: [46, -8, 0] },
    arms: { b: [-40, -10], f: [84, 86] },
    lean: 5,
    flow: 0.6,
    glow: true,
    wand: 'arm',
  },
};
const _astPoses = {};
function astPose(id) {
  return _astPoses[id] || (_astPoses[id] = ncPose(id, AST_POSES[id]));
}
function astFrame(pose, fr, arm, big, opt) {
  if (big || pose === 'action') return astPose('action');
  if (pose === 'hurt' || pose === 'cast' || pose === 'point' || pose === 'kick') return astPose(pose);
  if (pose === 'jump') return astPose(fr ? 'jumpF' : 'jumpR');
  if (pose === 'run') {
    const n = 10,
      i = Math.floor(((fr * 1.4 * 2) / AST_GAIT.stride) * n) % n;
    return (
      _astPoses['run' + i] ||
      (_astPoses['run' + i] = ncPose(
        'run' + i,
        Object.assign(ncGait(Object.assign({}, NC_BODY, AST_BODY), AST_GAIT, i / n), { flow: 0.8 }),
      ))
    );
  }
  if (arm) return astPose('point');
  return astPose('stand');
}

const AS = NC_SHAPES;
const AST_LEG = {
  thigh: 'R',
  thighW: 3.4,
  boot: 'R',
  w0: 5.8,
  w1: 8.2,
  band: ['Y', 2, 3.2, 7.6],
  sole: 'Y',
  knee: ['Y', 2, 0.6],
};
const AST_ARM = {
  upper: 'R',
  upperW: 2.6,
  glove: 'R',
  w0: 4.6,
  w1: 6.2,
  cuff: ['Y', 3.4, 4.2, 6.6],
  fist: 'R',
  fistR: 2.4,
};
// the night-blue cape from her shoulders, sweeping back as she moves, a few stars in it
function astCape(G, J, P) {
  const f = P.flow || 0,
    [nx, ny] = J.neck,
    [sx, sy] = J.arms.b.sh;
  G.shape('C', AS.poly([nx + 2, ny, sx - 1, sy, sx - 5 - f * 10, 44 - f * 6, nx - 2 - f * 6, 46 - f * 3, nx + 3, 42]));
  G.paint('c', AS.strand(sx - 1, sy + 1, sx - 4 - f * 4, 32, sx - 4 - f * 9, 42 - f * 6, 1.2, 0.8), 'C');
  for (const [dx, dy] of [
    [-3, 8],
    [-6, 15],
    [-2, 19],
    [-8, 22],
  ])
    G.shape('y', AS.disc(sx + dx - f * dy * 0.3, sy + dy - f * dy * 0.12, 0.6), false);
}
function astTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('R', Wa(AS.poly([21.2, 24, 28, 24, 27.6, 29.4, 21.6, 29.4])));
  // the robe's long skirt, gold at the hem and down the front
  shape('R', Wa(AS.poly([20.6, 28, 28.6, 28, 31.6, 40, 17.4, 40])));
  paint('r', Wa(AS.poly([17.6, 37, 31.4, 37, 31.6, 40, 17.4, 40])), 'R');
  paint(
    'Y',
    Wa(AS.all(AS.poly([17.4, 39, 31.6, 39, 31.6, 40, 17.4, 40]), AS.poly([24, 28.4, 25.4, 28.4, 26, 40, 23.4, 40]))),
    'R',
  );
  shape('Y', Wa(AS.bar(20.6, 28.6, 28.6, 28.6, 1.2)), false);
  shape('R', U(AS.poly([17.4, 17.4, 31.6, 17.4, 31.2, 22.6, 27.8, 25.6, 21.6, 25.6, 17.8, 22.6])));
  paint(
    'Y',
    U(AS.all(AS.strand(18.6, 18.4, 21.6, 22, 24.7, 24.6, 1, 1), AS.strand(30.6, 18.4, 27.6, 22, 24.7, 24.6, 1, 1))),
    'R',
  );
  shape('Y', U(AS.poly([20.4, 16.8, 29.8, 16.8, 28.4, 18.6, 25, 19.8, 21.8, 18.6])));
  shape('P', U(AS.ell(24.7, 21.6, 1.2, 1.8))); // a little gate set at her breast
}
// the scepter: upright at her side (or along the arm when pointed), a star at its tip
function astScepter(G, A, P) {
  const [hx, hy] = A.hand,
    a = P.wand === 'arm' ? A.a2 : 180,
    base = along(hx, hy, a, -5),
    tip = along(hx, hy, a, 11);
  G.shape('Y', AS.cap(...base, ...tip, 1.4));
  G.shape(
    'Y',
    AS.all(
      AS.spike(...tip, a, 4.4, 3),
      AS.spike(...tip, a + 90, 2.6, 2.4),
      AS.spike(...tip, a - 90, 2.6, 2.4),
      AS.spike(...tip, a + 180, 2.2, 2.2),
    ),
  );
  G.shape('y', AS.disc(...tip, 1), false);
}
// the crown of her hair, the face, the fringe, the gold tiara with its star
function astHead(G, J, P) {
  const { shape } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  shape('Z', AS.ell(hx - 1.4, hy - 1, 7.6, 7.4));
  ncWomanFace(G, hx, hy, P.face);
  shape(
    'Z',
    AS.all(
      AS.ell(...o(2.6, -4.6), 6.6, 2.4),
      AS.strand(...o(1.4, -5.6), ...o(2.4, -2.4), ...o(2.6, 0.6), 3.2, 0),
      AS.strand(...o(4.8, -5.4), ...o(5.8, -2.6), ...o(6.4, -0.2), 3, 0),
      AS.strand(...o(-0.8, -3), ...o(-1.2, 3), ...o(0.6, 10), 3, 0.6),
    ),
  );
  shape(
    'Y',
    AS.all(
      AS.poly([
        ...o(-4.6, -4.6),
        ...o(0.4, -7),
        ...o(5.4, -6.8),
        ...o(9.6, -4.4),
        ...o(8.8, -3.2),
        ...o(4.6, -5),
        ...o(0.4, -5.2),
        ...o(-3.4, -3),
      ]),
      AS.spike(...o(4.4, -6.6), 180, 4.4, 2.8),
    ),
  );
  shape('y', AS.disc(...o(4.4, -7.8), 0.7), false);
  shape('z', AS.strand(...o(-4.6, -2.6), ...o(-6, 2), ...o(-5.4, 6.4), 1, 0.4), false);
}
function astDraw(G, J, P) {
  const B = G.B,
    [hx, hy] = J.head;
  astCape(G, J, P);
  ncLongHair(G, hx, hy, { flow: P.flow || 0, len: 28, locks: 7, wave: 0, width: 6.4 });
  ncArm(G, J.arms.b, AST_ARM);
  ncLeg(G, J.legs.b, B, AST_LEG);
  ncLeg(G, J.legs.f, B, AST_LEG);
  astTorso(G, J);
  ncArm(G, J.arms.f, AST_ARM);
  astScepter(G, J.arms.f, P);
  astHead(G, J, P);
}
// the halo behind her head, four little gates set round it (base on box point 24, 24)
function astHalo(G) {
  G.shape('Y', AS.annulus(24, 24, 9.4, 10.8), false);
  // the gates at its sides and top (the one at the bottom is behind her head)
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    G.shape('P', AS.ell(24 + Math.cos(a) * 10.1, 24 + Math.sin(a) * 10.1, 1.1, 1.7));
  }
}
function astBefore(P, J, at, c) {
  const [hx, hy] = J.head,
    [x, y] = at(hx - 1.6, hy - 2.4);
  if (!c.pal.gray) glow(x, y, 12, '#f8e088', 0.4);
  drawNativeProp(c.style, NATIVE_CHARS.astral, 'halo', astHalo, x, y, c.pal, c.flip, c.big);
}
// a twinkle
function astStar(x, y, r, col) {
  R(x - r, y - 0.25, r * 2, 0.5, col);
  R(x - 0.25, y - r, 0.5, r * 2, col);
}
// stars twinkling round her, the scepter's star alight, a streak of starlight behind the dive
function astAfter(P, J, at, c) {
  if (c.pal.gray) return;
  for (let i = 0; i < 3; i++) {
    const a = frameCount * 0.035 + (i * Math.PI * 2) / 3,
      [x, y] = at(24 + Math.cos(a) * 18, 24 + Math.sin(a) * 12),
      tw = (frameCount + i * 11) % 30 < 9;
    astStar(x, y, tw ? 1.5 : 0.75, tw ? '#ffffff' : '#f8e088');
  }
  if (P.glow) {
    const A = J.arms.f,
      a = P.wand === 'arm' ? A.a2 : 180,
      [x, y] = at(...along(...A.hand, a, 11));
    glow(x, y, 10, '#f8e088', 0.6);
    astStar(x, y, 2.4, '#ffffff');
  }
  if (P.trail) {
    const [x, y] = at(24, 30),
      d = c.flip ? 1 : -1;
    for (let k = 1; k <= 4; k++) {
      ctx.globalAlpha = 0.4 - k * 0.08;
      R(x + d * k * 4 - 2, y - k * 3, 4, 2, '#f8d878');
    }
    ctx.globalAlpha = 1;
  }
}
NATIVE_CHARS.astral = {
  body: AST_BODY,
  colors: pal => ncFixed(ASTRAEA_TONES, pal),
  flat: 'KyPwEIUWNMz',
  hair: 'Z',
  skin: 'S',
  frame: astFrame,
  draw: astDraw,
  before: astBefore,
  after: astAfter,
};
