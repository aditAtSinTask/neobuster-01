'use strict';
// Sniptor, boss of the cut stage, drawn natively after his character sheet (see js/characters/chars.js): a crimson and silver
// robot ninja with a crest swept back like a blade, silver fins at the sides of the helmet, a gold visor, a silver face
// plate, gold trim, and the R. Cutter (a spinning eight-bladed cutter) on a launcher over his forearm.
// Letters: K outline, R crimson armour, V silver, Y gold, D dark metal, E the visor's glow, w gloss.
const SNIPTOR_TONES = {
  K: '#120810',
  R: '#c4243e',
  V: '#c6cad6',
  Y: '#f0b43c',
  D: '#2c2434',
  E: '#ffe27a',
  w: '#ffffff',
};
const SNIP_GAIT = {
  stride: 54,
  stance: 0.28,
  hipW: 1,
  lift: 7,
  kick: 0.7,
  reach: 4.4,
  hip: 33,
  rise: 1.2,
  lean: 16,
  arm: 40,
  elbow: 90,
};
const SNIP_POSES = {
  stand: { legs: { b: [-32, -22, 0], f: [36, -6, 0] }, arms: { b: [-12, 34], f: [14, 70] }, lean: 3 },
  // the cutter held ready on the launcher, the other fist up
  ready: {
    legs: { b: [-34, -24, 0], f: [40, -8, 0] },
    arms: { b: [8, 100], f: [76, 82] },
    lean: 5,
    launcher: true,
    cutter: true,
  },
  // the throw: the launcher thrust forward, flashing as the cutter leaves it; then the arm stays out for a moment
  fire: {
    legs: { b: [-40, -30, 0], f: [48, -8, 0] },
    arms: { b: [-22, 18], f: [94, 92] },
    lean: 10,
    launcher: true,
    flash: true,
  },
  thrown: { legs: { b: [-36, -26, 0], f: [44, -8, 0] }, arms: { b: [-18, 26], f: [90, 90] }, lean: 7, launcher: true },
  jumpR: { legs: { b: [-14, -44, -25], f: [76, -2, -10] }, arms: { b: [-44, -4], f: [142, 172] }, air: true },
  jumpF: { legs: { b: [-8, -24, -15], f: [34, 4, -5] }, arms: { b: [-72, -42], f: [96, 120] }, air: true },
  // knocked back: skidding low, an arm thrown up
  hurt: { legs: { b: [-46, -6, 10], f: [40, 50, 10] }, arms: { b: [-130, -160], f: [120, 150] }, lean: -16, dy: 2 },
  // the 3x view and the portraits: a wide stance, the cutter spinning on the launcher
  action: {
    legs: { b: [-42, -34, 0], f: [50, -8, 0] },
    arms: { b: [-10, 108], f: [82, 86] },
    lean: 6,
    launcher: true,
    cutter: true,
  },
};
const _snipPoses = {};
function snipPose(id, make) {
  return _snipPoses[id] || (_snipPoses[id] = ncPose(id, make()));
}
// with the cutter in hand he holds it ready; as he throws it the launcher flashes, then his arm stays out for a moment
// and he stands empty-handed until it flies back to him
function snipFrame(pose, fr, arm, big, opt) {
  const P = SNIP_POSES,
    blade = opt.blade !== false,
    hold = p => Object.assign({}, p, { arms: { b: p.arms.b, f: [76, 82] }, launcher: true, cutter: true });
  if (big || pose === 'action') return snipPose('action', () => P.action);
  if (pose === 'hurt') return snipPose('hurt', () => P.hurt);
  if (pose === 'jump') {
    const id = fr ? 'jumpF' : 'jumpR';
    return blade ? snipPose(id + 'C', () => hold(P[id])) : snipPose(id, () => P[id]);
  }
  if (pose === 'run') {
    const n = 10,
      i = Math.floor(((fr * 1.4 * 2) / SNIP_GAIT.stride) * n) % n,
      run = () => ncGait(NC_BODY, SNIP_GAIT, i / n);
    return blade ? snipPose('runC' + i, () => hold(run())) : snipPose('run' + i, run);
  }
  if (arm && !blade) return opt.armT > 9 ? snipPose('fire', () => P.fire) : snipPose('thrown', () => P.thrown);
  return blade ? snipPose('ready', () => P.ready) : snipPose('stand', () => P.stand);
}

const SN = NC_SHAPES;
const SNIP_LEG = {
  thigh: 'V',
  thighW: 4.2,
  boot: 'R',
  w0: 7,
  w1: 9.8,
  band: ['Y', 2.2, 3.2, 8.2],
  sole: 'D',
  knee: ['V', 2.6, 0.6],
  shine: 'w',
};
const SNIP_ARM = { upper: 'V', glove: 'R', w0: 5.4, w1: 7.2, cuff: ['Y', 3.6, 4.6, 7.6], fist: 'V', fistR: 2.9 };
function snipPad(G, sx, sy, far) {
  const { shape } = G;
  // a big rounded crimson pad with a silver rim and a gold stud
  shape('R', SN.ell(sx + (far ? -0.6 : 0.6), sy - 1.4, far ? 4.8 : 5.4, far ? 4.2 : 4.6));
  if (far) return;
  shape('V', SN.strand(sx - 4.8, sy + 0.6, sx + 0.6, sy + 4.4, sx + 6, sy + 0.4, 1.4, 1.4), false);
  shape('Y', SN.disc(sx + 1.4, sy - 2.4, 1.1), false);
  shape('w', SN.ell(sx - 1.6, sy - 3.4, 1.6, 0.9), false);
}
// the launcher over the forearm: a silver barrel with a gold tip
function snipLauncher(G, A) {
  const { shape } = G,
    [ex, ey] = A.elbow,
    p = d => along(ex, ey, A.a2, d);
  shape('V', SN.cap(...A.sh, ex, ey, 3.2));
  shape('V', SN.cap(...p(0.6), ...p(8.8), 7.4));
  shape('D', SN.bar(...p(2.6), ...p(3.4), 7.4), false);
  shape('Y', SN.bar(...p(6.8), ...p(8), 7.4), false);
  shape('D', SN.disc(...p(9.4), 2.6));
  shape('w', SN.cap(...along(...p(1.4), A.a2 + 90, 2.2), ...along(...p(6.6), A.a2 + 90, 2.2), 0.9), false);
}
function snipTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('V', Wa(SN.poly([20.8, 24.8, 28.2, 24.8, 27.8, 29.4, 21.2, 29.4]))); // silver waist
  shape('R', Wa(SN.poly([19.4, 29, 29.4, 29, 29, 31.4, 26.4, 33, 22.4, 33, 19.8, 31.4]))); // hip armour
  shape('Y', Wa(SN.bar(19.6, 29.4, 29.2, 29.4, 1.1)), false); // gold belt
  shape('Y', Wa(SN.poly([22.8, 29, 26.8, 29, 24.8, 31.2]))); // buckle
  shape('R', U(SN.poly([15.4, 17.2, 33.2, 17.2, 32.8, 22.4, 28.6, 26.2, 21, 26.2, 15.8, 22.4]))); // chest
  // gold trim running down to a point at the middle of the chest
  paint(
    'Y',
    U(
      SN.all(
        SN.strand(18.4, 18.6, 21.4, 22.6, 24.8, 24.6, 1.2, 1.2),
        SN.strand(31.4, 18.6, 28.4, 22.6, 24.8, 24.6, 1.2, 1.2),
      ),
    ),
    'R',
  );
  shape('V', U(SN.poly([20.4, 16.4, 29.8, 16.4, 28.4, 18.6, 25, 19.8, 21.8, 18.6]))); // silver collar
  shape('Y', U(SN.disc(25.1, 21.6, 1.4))); // a gold stud on the chest
  shape('w', U(SN.ell(19.4, 19, 1.8, 0.8)), false);
}
function snipHead(G, J) {
  const { shape, paint } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  // the crest swept back like a blade, behind the helmet
  shape('R', SN.strand(...o(2, -6.4), ...o(-3, -14.6), ...o(-12.4, -15.6), 6.6, 0));
  shape('R', SN.disc(hx - 0.4, hy - 0.6, 8.2)); // helmet
  paint('Y', SN.strand(...o(1.4, -7.6), ...o(-3.4, -13.2), ...o(-10.6, -14.6), 1.1, 0), 'R'); // gold edge of the crest
  // the silver fin at the side of the helmet, with a gold ring at its root
  shape('V', SN.all(SN.spike(...o(-3.2, 0.8), 212, 9.4, 5), SN.disc(...o(-3, 1.2), 2.6)));
  shape('Y', SN.disc(...o(-2.8, 1.4), 1.4), false);
  // the face: a silver plate at the front of the helmet, the helmet brow over it, and the gold visor between
  shape(
    'V',
    SN.poly([
      ...o(1.4, -1.2),
      ...o(9.6, -1.4),
      ...o(10, 1.8),
      ...o(8.6, 5.8),
      ...o(6.2, 7.8),
      ...o(3.4, 7.4),
      ...o(1.2, 4.4),
    ]),
  );
  shape('R', SN.poly([...o(0.2, -3.6), ...o(10, -3.8), ...o(10.6, -1), ...o(7, 0.6), ...o(0.4, -0.2)]));
  shape('E', SN.poly([...o(3.2, 0.8), ...o(7, 1.6), ...o(10.4, -0.4), ...o(10, 2.2), ...o(7.2, 3.2), ...o(3.8, 2.6)]));
  paint('D', SN.all(SN.cap(...o(5.4, 5.2), ...o(8.4, 4.8), 0.6), SN.cap(...o(6.6, 6.6), ...o(8.2, 6.2), 0.6)), 'V'); // mouth vents
  shape('Y', SN.disc(...o(5.4, -4.8), 1.8)); // forehead gem
  shape('w', SN.disc(...o(4.9, -5.3), 0.6), false);
  shape('w', SN.ell(...o(-4.6, -4.8), 1.8, 1), false); // helmet shine
}
function snipDraw(G, J, P) {
  const B = G.B;
  snipPad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, SNIP_ARM);
  ncLeg(G, J.legs.b, B, SNIP_LEG);
  ncLeg(G, J.legs.f, B, SNIP_LEG);
  snipTorso(G, J);
  if (P.launcher) snipLauncher(G, J.arms.f);
  else ncArm(G, J.arms.f, SNIP_ARM);
  snipPad(G, ...J.arms.f.sh, false);
  snipHead(G, J);
}
// the R. Cutter: eight crimson blades with gold edges round a silver hub, turned by step (eighths of 45 degrees)
function snipCutter(step) {
  return G => {
    const { shape, paint } = G,
      c = 24;
    for (let i = 0; i < 8; i++) {
      const a = i * 45 + step * 5.625,
        p = (r, d) => along(c, c, a + d, r);
      shape('R', SN.strand(...p(1.6, 0), ...p(6, 22), ...p(8.6, 56), 3.8, 0));
      paint('Y', SN.strand(...p(3, 8), ...p(6.4, 26), ...p(8.4, 54), 1, 0), 'R');
    }
    shape('V', SN.disc(c, c, 2.8));
    shape('Y', SN.disc(c, c, 1.5), false);
    shape('D', SN.disc(c, c, 0.6), false);
  };
}
function snipAfter(P, J, at, c) {
  const A = J.arms.f;
  if (P.cutter) {
    const [x, y] = at(...along(...A.elbow, A.a2, 12.6)),
      step = (frameCount >> 1) & 7;
    drawNativeProp(c.style, NATIVE_CHARS.cut, 'cutter' + step, snipCutter(step), x, y, c.pal, c.flip, c.big);
  }
  if (P.flash && !c.pal.gray) {
    const [x, y] = at(...along(...A.elbow, A.a2, 10.6));
    glow(x, y, 10, '#f8a040', 0.7);
    circle(x, y, 2, '#fff4c0');
  }
}
NATIVE_CHARS.cut = {
  colors: pal => ncFixed(SNIPTOR_TONES, pal),
  flat: 'KDEw',
  frame: snipFrame,
  draw: snipDraw,
  after: snipAfter,
};
