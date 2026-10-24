'use strict';
// Polaris, boss of the magnet stage, drawn natively (see js/characters/chars.js): the mistress of the polar railway in
// a long dark coat with a white fur collar. Signature: a horseshoe-magnet gauntlet on each hand, red (north) on the far
// hand and blue (south) on the near one, long white hair with the aurora's green in it, and a gold star (the north
// star) on her brow; sparks and field lines play between her gauntlets. She aims both gauntlets for her fields and
// beams, raises them to tear scrap from the walls, and hangs from the ceiling's rail by them. The face is the shared
// women's face (ncWomanFace).
// Letters: K outline, R red pole, r its light, B blue pole, b its light, T steel, t steel light, D coat, F fur,
// Y gold, Z hair, z hair shine, A aurora green, w gloss; S skin, eyes E I U W, N nose, M lips.
const POLARIS_TONES = {
  K: '#0e1018',
  R: '#c83848',
  r: '#f87888',
  B: '#2868c8',
  b: '#78b8f8',
  T: '#8898a8',
  t: '#d0dae6',
  D: '#202838',
  F: '#eef2fa',
  Y: '#f8d878',
  Z: '#e4ecf8',
  z: '#ffffff',
  A: '#58f8a8',
  w: '#ffffff',
  S: '#f8dcc8',
  E: '#ffffff',
  I: '#3878d8',
  U: '#0e1a38',
  W: '#ffffff',
  N: '#e0a898',
  M: '#d06070',
};
const POL_BODY = { hipW: 2.4, shB: [19, 19.8], shF: [30, 20.2], upper: 3.6, fore: 4.6 };
const POL_GAIT = {
  stride: 50,
  stance: 0.3,
  hipW: 1.4,
  lift: 6,
  kick: 0.6,
  reach: 3.8,
  hip: 33,
  sink: 0.6,
  rise: 1,
  lean: 10,
  arm: 34,
  elbow: 80,
};
const POL_POSES = {
  stand: { legs: { b: [-22, -16, 0], f: [26, -4, 0] }, arms: { b: [-12, 30], f: [12, 56] }, lean: 1, flow: 0.2 },
  // a bolt or a shard flung from the near gauntlet
  shoot: { legs: { b: [-30, -22, 0], f: [36, -6, 0] }, arms: { b: [-16, 26], f: [86, 88] }, lean: 5, flow: 0.4 },
  // the field, the beams, the grip: both gauntlets aimed, the poles alight
  aim: {
    legs: { b: [-36, -26, 0], f: [42, -8, 0] },
    arms: { b: [58, 84], f: [86, 88] },
    lean: 6,
    flow: 0.5,
    poles: true,
  },
  // tearing scrap from the walls, calling the aurora: both gauntlets raised
  raise: {
    legs: { b: [-28, -20, 0], f: [32, -6, 0] },
    arms: { b: [-148, -170], f: [148, 170] },
    lean: -2,
    flow: 0.6,
    poles: true,
  },
  // hanging from the ceiling's rail by both gauntlets
  cling: {
    legs: { b: [-10, -2, -12], f: [14, 8, -10] },
    arms: { b: [-168, -178], f: [170, 178] },
    air: true,
    flow: 0.5,
    poles: true,
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
  // the 3x view and the portraits: the near gauntlet aimed, the far one raised
  action: {
    legs: { b: [-40, -32, 0], f: [48, -8, 0] },
    arms: { b: [-130, -150], f: [84, 86] },
    lean: 5,
    flow: 0.6,
    poles: true,
  },
};
const _polPoses = {};
function polPose(id) {
  return _polPoses[id] || (_polPoses[id] = ncPose(id, POL_POSES[id]));
}
function polFrame(pose, fr, arm, big, opt) {
  if (big || pose === 'action') return polPose('action');
  if (pose === 'hurt' || pose === 'aim' || pose === 'raise' || pose === 'cling') return polPose(pose);
  if (pose === 'jump') return polPose(fr ? 'jumpF' : 'jumpR');
  if (pose === 'run') {
    const n = 10,
      i = Math.floor(((fr * 1.4 * 2) / POL_GAIT.stride) * n) % n;
    return (
      _polPoses['run' + i] ||
      (_polPoses['run' + i] = ncPose(
        'run' + i,
        Object.assign(ncGait(Object.assign({}, NC_BODY, POL_BODY), POL_GAIT, i / n), { flow: 0.8 }),
      ))
    );
  }
  if (arm) return polPose('shoot');
  return polPose('stand');
}

const PL = NC_SHAPES;
const POL_LEG = {
  thigh: 'D',
  thighW: 3.6,
  boot: 'T',
  w0: 6.2,
  w1: 8.8,
  band: ['F', 1.6, 3.2, 8.4],
  sole: 'D',
  knee: ['t', 2.2, 0.6],
};
const POL_ARM = { upper: 'D', upperW: 2.8, glove: 'T', w0: 5, w1: 6.8, fist: 'T', fistR: 2.6 };
// a horseshoe magnet over the hand: two prongs along the forearm, tipped with steel (col: the pole's colour)
function polMagnet(G, A, col, light) {
  const [hx, hy] = A.hand,
    side = d => along(hx, hy, A.a2 + 90, d),
    tip = (p, d) => along(...p, A.a2, d);
  const p1 = side(2),
    p2 = side(-2);
  G.shape(
    col,
    PL.all(
      PL.cap(...tip(p1, -2.6), ...tip(p1, 2.4), 2.4),
      PL.cap(...tip(p2, -2.6), ...tip(p2, 2.4), 2.4),
      PL.disc(...tip([hx, hy], -2.4), 2.6),
    ),
  );
  G.paint(light, PL.cap(...tip(p1, -2), ...tip(p1, 0.6), 0.8), col);
  G.shape('t', PL.all(PL.disc(...tip(p1, 2.6), 1.3), PL.disc(...tip(p2, 2.6), 1.3)));
}
function polTorso(G, J, P) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist,
    f = P.flow || 0;
  // the coat's long skirt, open at the front, red-lined behind and blue in front
  shape('D', Wa(PL.poly([20.4, 26.6, 29, 26.6, 31, 38, 26.6, 40, 22, 40 - f, 15.6 - f * 3, 39 - f * 2])));
  paint('R', Wa(PL.strand(20.4, 27.4, 17.6 - f * 2, 33, 15.8 - f * 3, 38.4 - f * 2, 1, 1)), 'D');
  paint('B', Wa(PL.strand(28.6, 27.4, 30, 33, 30.6, 38.4, 1, 1)), 'D');
  shape('T', Wa(PL.bar(20.4, 26.8, 29, 26.8, 1.2)), false);
  shape('D', U(PL.poly([17.2, 17.4, 31.8, 17.4, 31.4, 22.6, 28, 25.8, 21.6, 25.8, 17.6, 22.6])));
  paint('R', U(PL.poly([17.4, 18, 20.4, 18, 21.4, 25.4, 17.8, 22.2])), 'D');
  paint('B', U(PL.poly([29, 18, 31.6, 18, 31.2, 22.2, 28.2, 25.4])), 'D');
  // the fur collar round her neck and shoulders
  shape('F', U(PL.all(PL.ell(24.8, 17, 7, 2.6), PL.ell(19.6, 17.8, 3, 2.2), PL.ell(30, 17.8, 3, 2.2))));
  shape('Y', U(PL.poly([24.8, 19.6, 26, 21.2, 24.8, 22.8, 23.6, 21.2])));
}
// the crown of her hair, the face, the fringe, the north star on her brow
function polHead(G, J, P) {
  const { shape, paint } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  shape('Z', PL.ell(hx - 1.4, hy - 1, 7.6, 7.4));
  ncWomanFace(G, hx, hy, P.face);
  shape(
    'Z',
    PL.all(
      PL.ell(...o(2.4, -4.6), 6.6, 2.4),
      PL.strand(...o(1.2, -5.6), ...o(2.4, -2.4), ...o(2.4, 1), 3.2, 0),
      PL.strand(...o(4.6, -5.4), ...o(5.6, -2.6), ...o(6.2, -0.4), 3, 0),
      PL.strand(...o(-0.8, -3), ...o(-1.4, 3), ...o(0, 10), 3, 0.6),
    ),
  );
  paint('A', PL.strand(...o(-1.6, -5.6), ...o(-3.6, -2), ...o(-3.4, 3), 0.9, 0.3), 'Z'); // the aurora's green
  // the north star: gold, four-pointed, on a thin band
  shape(
    'Y',
    PL.all(
      PL.cap(...o(-4.2, -3.2), ...o(9.4, -4), 0.9),
      PL.spike(...o(5, -5.6), 180, 4.4, 2.6),
      PL.spike(...o(5, -5.6), 0, 2.4, 2.2),
      PL.spike(...o(5, -5.6), 90, 2.4, 2.2),
      PL.spike(...o(5, -5.6), 270, 2.4, 2.2),
    ),
  );
  shape('w', PL.disc(...o(5, -5.6), 0.6), false);
  shape('z', PL.strand(...o(-4.6, -2.6), ...o(-6, 2), ...o(-5.4, 6.4), 1, 0.4), false);
}
function polDraw(G, J, P) {
  const B = G.B,
    [hx, hy] = J.head;
  ncLongHair(G, hx, hy, { flow: P.flow || 0, len: 30, locks: 7, wave: 0, width: 6.8 });
  ncArm(G, J.arms.b, POL_ARM);
  polMagnet(G, J.arms.b, 'R', 'r');
  ncLeg(G, J.legs.b, B, POL_LEG);
  ncLeg(G, J.legs.f, B, POL_LEG);
  polTorso(G, J, P);
  ncArm(G, J.arms.f, POL_ARM);
  polMagnet(G, J.arms.f, 'B', 'b');
  polHead(G, J, P);
}
// sparks at the poles when they are alight, and field lines arcing between them
function polAfter(P, J, at, c) {
  if (c.pal.gray || !P.poles) return;
  const [rx, ry] = at(...J.arms.b.hand),
    [bx, by] = at(...J.arms.f.hand);
  glow(rx, ry, 9, '#f86878', 0.5);
  glow(bx, by, 9, '#78b8f8', 0.5);
  if ((frameCount >> 1) & 1) {
    ctx.strokeStyle = 'rgba(232,240,252,0.5)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo((rx + bx) / 2, Math.min(ry, by) - 6 - ((frameCount >> 2) & 3), bx, by);
    ctx.stroke();
  }
  R(rx - 0.5 + ((frameCount * 3) % 5) - 2, ry - 2, 1, 1, '#fcfcfc');
  R(bx - 0.5 + ((frameCount * 7) % 5) - 2, by + 1, 1, 1, '#fcfcfc');
}
NATIVE_CHARS.magnet = {
  body: POL_BODY,
  colors: pal => ncFixed(POLARIS_TONES, pal),
  flat: 'KrbtFYwEIUWNMzA',
  hair: 'Z',
  skin: 'S',
  frame: polFrame,
  draw: polDraw,
  after: polAfter,
};
