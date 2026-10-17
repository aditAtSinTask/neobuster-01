'use strict';
// Voltrax, boss of the electric stage, drawn natively after his character sheet (see js/chars.js): a gold, silver and
// blue lightning robot with a crest of gold lightning spikes, a blue visor over an angry face, a glowing cyan energy
// core in his chest, spiked gold shoulder pads, big gold boots, and a cannon on his arm that fires the Thunder Beam.
// Letters: K outline, Y gold, V silver, B blue, C cyan energy, c its white-hot centre, D dark, S skin, N skin shadow,
// M mouth, w gloss.
const VOLTRAX_TONES = {
  K: '#0c0e1c',
  Y: '#f2b41c',
  V: '#c2c8d8',
  B: '#2a62d6',
  C: '#4cdcff',
  c: '#e2fcff',
  D: '#1a2034',
  S: '#f4cea6',
  N: '#c88c6c',
  M: '#7a2a2a',
  w: '#ffffff',
};
const VOLT_POSES = {
  stand: { legs: { b: [-32, -22, 0], f: [36, -6, 0] }, arms: { b: [-14, 30], f: [12, 64] }, lean: 3 },
  // the Thunder Beam: the cannon aimed while the energy gathers at its muzzle, a flash as the bolts leave it
  aim: { legs: { b: [-36, -26, 0], f: [42, -8, 0] }, arms: { b: [-6, 70], f: [88, 90] }, lean: 5, gun: true },
  fire: {
    legs: { b: [-40, -30, 0], f: [46, -8, 0] },
    arms: { b: [-14, 50], f: [90, 90] },
    lean: 8,
    gun: true,
    blast: true,
  },
  // calling down the lightning: both arms thrown up, an open hand crackling
  raise: { legs: { b: [-34, -24, 0], f: [38, -6, 0] }, arms: { b: [-150, -170], f: [148, 168] }, lean: -3 },
  jumpR: { legs: { b: [-14, -44, -25], f: [76, -2, -10] }, arms: { b: [-44, -4], f: [142, 172] }, air: true },
  jumpF: { legs: { b: [-8, -24, -15], f: [34, 4, -5] }, arms: { b: [-72, -42], f: [96, 120] }, air: true },
  // the electric balls at the top of the leap, fired from the cannon
  jumpS: { legs: { b: [-10, -40, -20], f: [60, 0, -8] }, arms: { b: [-60, -20], f: [100, 104] }, air: true, gun: true },
  // landing from the leap, and the crouch before the Volt Rush: knees bent, fists down, charged
  land: { legs: { b: [-60, 20, 0], f: [70, -20, 0] }, arms: { b: [-30, 10], f: [40, 30] }, bend: 14, lean: 4 },
  // the Volt Rush: low and hurtling forward shoulder first, the legs driving behind
  rush: {
    legs: { b: [-96, -84, -20], f: [62, -30, 0] },
    arms: { b: [-80, -40], f: [70, 100] },
    bend: 58,
    dy: 7,
    head: [-1, 1],
  },
  hurt: { legs: { b: [-44, -6, 10], f: [40, 46, 10] }, arms: { b: [-130, -160], f: [120, 150] }, lean: -16, dy: 2 },
  // the 3x view and the portraits: a wide stance, the cannon aimed
  action: { legs: { b: [-42, -34, 0], f: [50, -8, 0] }, arms: { b: [-12, 100], f: [86, 88] }, lean: 6, gun: true },
};
const _voltPoses = {};
function voltPose(id) {
  return _voltPoses[id] || (_voltPoses[id] = ncPose(id, VOLT_POSES[id]));
}
function voltFrame(pose, fr, arm, big, opt) {
  if (big || pose === 'action') return voltPose('action');
  if (pose === 'hurt') return voltPose('hurt');
  if (opt.state === 'slide') return voltPose(pose === 'slide' ? 'rush' : 'land');
  if (pose === 'raise') return voltPose('raise');
  if (pose === 'jump') return voltPose(arm ? 'jumpS' : fr ? 'jumpF' : 'jumpR');
  if (opt.landT > 0) return voltPose('land');
  if (arm) return voltPose(opt.armT > 9 ? 'fire' : 'aim');
  // the energy gathers at his cannon before each Thunder Beam (fired at tick 14, and again at 34 when he is enraged;
  // see BOSSES.elec)
  if (opt.state === 'beam' && (opt.t < 14 || (opt.enr && opt.t >= 28 && opt.t < 34))) return voltPose('aim');
  return voltPose('stand');
}

const VS = NC_SHAPES;
const VOLT_LEG = {
  thigh: 'V',
  thighW: 4.2,
  boot: 'Y',
  w0: 7,
  w1: 10,
  band: ['B', 2.2, 3.4, 8.6],
  sole: 'D',
  knee: ['B', 2.6, 0.6],
  shine: 'w',
};
const VOLT_ARM = { upper: 'V', glove: 'Y', w0: 5.6, w1: 7.6, cuff: ['B', 3.6, 4.6, 7.8], fist: 'V', fistR: 2.9 };
function voltBoot(G, L, B) {
  // a blue panel down the front of the boot and a pointed gold toe
  const f = L.foot;
  G.paint('B', VS.strand(...along(...L.knee, L.a2, 3.8), ...f(1.6, -0.6), ...f(4.4, 1.6), 1.6, 1), 'Y');
  G.shape('Y', VS.poly([...f(B.toe - 2.4, 1), ...f(B.toe + 2, 3.2), ...f(B.toe - 0.4, B.ankleH)]));
}
function voltPad(G, sx, sy, far) {
  const { shape } = G;
  // a gold pad flaring up into a lightning spike, with a blue panel
  shape(
    'Y',
    VS.all(
      VS.ell(sx + (far ? -0.6 : 0.4), sy - 1, far ? 4.6 : 5, far ? 4 : 4.4),
      VS.strand(sx - 2, sy - 2.6, sx - 3.4, sy - 7.4, sx - 7.6, sy - 9.6, 4, 0),
    ),
  );
  if (far) return;
  shape('B', VS.ell(sx + 0.8, sy - 0.4, 2.4, 1.8), false);
  shape('w', VS.ell(sx - 1.4, sy - 3.2, 1.6, 0.8), false);
}
function voltCannon(G, A) {
  const { shape } = G,
    [ex, ey] = A.elbow,
    p = d => along(ex, ey, A.a2, d);
  shape('V', VS.cap(...A.sh, ex, ey, 3.2));
  shape('Y', VS.all(VS.cap(...p(0.4), ...p(8.4), 8.2), VS.cap(...p(7.4), ...p(10.6), 9)));
  shape('B', VS.bar(...p(3), ...p(4.4), 8.2), false);
  shape('V', VS.bar(...p(6.4), ...p(7.2), 8.4), false);
  shape('D', VS.disc(...p(11.4), 3.2));
  shape('C', VS.disc(...p(11.8), 1.8), false);
  shape('c', VS.disc(...p(12), 0.8), false);
  shape('w', VS.cap(...along(...p(1), A.a2 + 90, 2.6), ...along(...p(7.6), A.a2 + 90, 2.8), 1), false);
}
function voltTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('V', Wa(VS.poly([20.8, 24.8, 28.2, 24.8, 27.8, 29.4, 21.2, 29.4]))); // silver waist
  shape('Y', Wa(VS.poly([19.4, 29, 29.4, 29, 29, 31.4, 26.4, 33, 22.4, 33, 19.8, 31.4]))); // hip armour
  shape('B', Wa(VS.poly([22.6, 29.4, 27, 29.4, 24.8, 32.2])));
  shape('Y', U(VS.poly([15.2, 17.2, 33.4, 17.2, 33, 22.6, 28.8, 26.4, 20.8, 26.4, 15.6, 22.6]))); // chest
  paint(
    'V',
    U(
      VS.all(
        VS.poly([15.2, 19.6, 18.6, 19.6, 20.2, 25.6, 16.2, 22.6]),
        VS.poly([30.6, 19.6, 33.4, 19.6, 32.8, 22.6, 29.2, 25.6]),
      ),
    ),
    'Y',
  );
  shape('B', U(VS.poly([20.2, 16.6, 29.6, 16.6, 28.2, 18.6, 24.9, 19.6, 21.6, 18.6]))); // blue collar
  // the energy core: a cyan orb in a blue ring
  shape('B', U(VS.disc(24.9, 21.8, 3)));
  shape('C', U(VS.disc(24.9, 21.8, 2)), false);
  shape('c', U(VS.disc(24.4, 21.3, 0.8)), false);
  shape('w', U(VS.ell(18.6, 18.8, 1.6, 0.7)), false);
}
function voltHead(G, J) {
  const { shape, paint } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y],
    bolt = (x0, y0, cx, cy, x1, y1, w) => VS.strand(...o(x0, y0), ...o(cx, cy), ...o(x1, y1), w, 0);
  // the crest: gold lightning spikes fanning up and back from the helmet
  shape(
    'Y',
    VS.all(
      bolt(1.4, -6.4, -0.6, -13, -4, -19, 6),
      bolt(-3, -5.4, -8, -11, -14, -14.6, 5.6),
      bolt(-6, -1.6, -11.4, -3.6, -17, -4, 4.8),
      bolt(4.4, -5.8, 7.4, -10, 7.4, -16, 4.4),
    ),
  );
  paint(
    'B',
    VS.all(bolt(0.4, -7.6, -1.4, -12.4, -3.4, -16.6, 1.4), bolt(-3.6, -6.8, -7.8, -10.4, -12, -13.4, 1.2)),
    'Y',
  );
  shape('Y', VS.disc(hx - 0.4, hy - 0.6, 8)); // helmet
  // the face: skin under a blue visor, an angry mouth
  shape(
    'S',
    VS.poly([
      ...o(1, -1.2),
      ...o(9, -1.4),
      ...o(9.6, 2.6),
      ...o(10.4, 4.2),
      ...o(9.2, 4.8),
      ...o(8.8, 6.4),
      ...o(6.8, 8.2),
      ...o(3.6, 8),
      ...o(1, 5),
    ]),
  );
  shape('Y', VS.poly([...o(0.2, -3.6), ...o(9.8, -3.8), ...o(10.4, -1.4), ...o(6.4, 0), ...o(0.4, -0.6)]));
  shape('B', VS.poly([...o(2.2, -0.6), ...o(10.6, -1.6), ...o(10.2, 2.6), ...o(6, 3.6), ...o(2.6, 2.6)]));
  paint('C', VS.all(VS.cap(...o(3.6, 0.6), ...o(6.4, 0.2), 0.7), VS.cap(...o(7.4, 1.6), ...o(9.4, 1), 0.7)), 'B'); // the eyes glowing through it
  paint('c', VS.cap(...o(4.4, -0.2), ...o(9.6, -1), 0.5), 'B');
  paint('M', VS.all(VS.cap(...o(5.2, 6.2), ...o(8, 5.4), 0.7)), 'S');
  paint('N', VS.cap(...o(9.4, 4.2), ...o(9.4, 5), 0.6), 'S');
  shape('B', VS.disc(...o(-3.4, 1.4), 2.4)); // ear disc
  shape('C', VS.disc(...o(-3.4, 1.4), 1.1), false);
  shape('w', VS.ell(...o(-4, -4.6), 1.8, 1), false);
}
function voltDraw(G, J, P) {
  const B = G.B;
  voltPad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, VOLT_ARM);
  for (const s of ['b', 'f']) {
    ncLeg(G, J.legs[s], B, VOLT_LEG);
    voltBoot(G, J.legs[s], B);
  }
  voltTorso(G, J);
  if (P.gun) voltCannon(G, J.arms.f);
  else ncArm(G, J.arms.f, VOLT_ARM);
  voltPad(G, ...J.arms.f.sh, false);
  voltHead(G, J);
}
// the charge gathering at the cannon, the flash of the beam, and sparks round an open hand calling down the lightning
function voltAfter(P, J, at, c) {
  if (c.pal.gray) return;
  const A = J.arms.f,
    o = c.opt;
  if (P.gun && !P.blast && o.state === 'beam') {
    const t = o.t < 14 ? o.t / 14 : (o.t - 28) / 6,
      [x, y] = at(...along(...A.elbow, A.a2, 13.4)),
      r = 1 + clamp(t, 0, 1) * 3;
    glow(x, y, 6 + r * 3, '#58d8ff', 0.6);
    circle(x, y, r, '#78e8ff');
    circle(x, y, r * 0.55, '#ecfcff');
  }
  if (P.blast) {
    const [x, y] = at(...along(...A.elbow, A.a2, 13));
    glow(x, y, 12, '#58d8ff', 0.8);
    circle(x, y, 3, '#ecfcff');
  }
  if (P.id === 'raise')
    for (const side of ['b', 'f']) {
      const [x, y] = at(...J.arms[side].hand);
      glow(x, y, 8, '#f8e858', 0.5);
      if ((frameCount >> 1) & 1) drawBolt(x, y, x + (side === 'b' ? -4 : 4), y - 7, frameCount, '#f8f058', 1, 4);
    }
}
NATIVE_CHARS.elec = {
  colors: pal => ncFixed(VOLTRAX_TONES, pal),
  flat: 'KDCcMNw',
  skin: 'S',
  frame: voltFrame,
  draw: voltDraw,
  after: voltAfter,
};
