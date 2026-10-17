'use strict';
// Umbrion, boss of the shadow stage, drawn natively (see js/chars.js): a dark ninja knight in violet-black armour with
// violet trim and claw gauntlets. Signature: two long horns sweeping back from his hood, a ninja mask over his mouth and
// nose below glowing violet eyes, a tattered cape that streams behind him when he moves, and a dark aura with wisps of
// shadow curling up off him. A burst of shadow leaves his hand when he sends out his clones, a dark orb swells over his
// raised hand before the orbs rise, and a smear of shadow trails his dash out of the warp. His clones are drawn with his
// own frames in a dark silhouette palette (see SHADOW_PAL and UMBRION_CLONE_PAL in js/vespera.js). The face is the
// shared men's face (ncManFace), scowling.
// Letters: K outline, A dark violet armour, B black armour, V violet trim, G violet gems, n black cloth (mask, suit),
// C cape, Q its lining, Z the horns, w gloss; S skin, eyes E I U W, N nose, M mouth.
const UMBRION_TONES = {
  K: '#08040e',
  A: '#3e2c66',
  B: '#221834',
  V: '#8c6cd0',
  G: '#c878ff',
  n: '#16101e',
  C: '#2a1c42',
  Q: '#6c2c80',
  Z: '#4c3a78',
  w: '#e8dcff',
  S: '#ecd4c8',
  E: '#f6eaff',
  I: '#b04cf2',
  U: '#2a0a52',
  W: '#ffffff',
  N: '#caa294',
  M: '#6a2a3a',
};
const UMBRION_GAIT = {
  stride: 58,
  stance: 0.26,
  hipW: 1,
  lift: 7,
  kick: 0.8,
  reach: 4.6,
  hip: 32.6,
  rise: 1.2,
  lean: 22,
  arm: 0,
};
const UMBRION_POSES = {
  stand: { legs: { b: [-32, -22, 0], f: [36, -6, 0] }, arms: { b: [-14, 30], f: [16, 64] }, lean: 3, flow: 0.15 },
  // the clones: the hand drawn back as the shadow gathers in it, then thrust out as they burst away
  summon: {
    legs: { b: [-34, -24, 0], f: [38, -6, 0] },
    arms: { b: [10, 96], f: [-50, 30] },
    lean: -2,
    flow: 0.2,
    gather: true,
  },
  thrust: {
    legs: { b: [-42, -32, 0], f: [50, -8, 0] },
    arms: { b: [-30, 10], f: [92, 92] },
    lean: 10,
    flow: 0.7,
    burst: true,
  },
  // the orbs: a hand raised high while the dark orb swells over it
  orbs: {
    legs: { b: [-30, -22, 0], f: [36, -6, 0] },
    arms: { b: [-20, 20], f: [160, 172] },
    lean: -3,
    flow: 0.25,
    orb: true,
  },
  jumpR: {
    legs: { b: [-14, -44, -25], f: [76, -2, -10] },
    arms: { b: [-44, -4], f: [120, 150] },
    air: true,
    flow: 0.6,
  },
  jumpF: { legs: { b: [-8, -24, -15], f: [34, 4, -5] }, arms: { b: [-72, -42], f: [96, 120] }, air: true, flow: 0.4 },
  hurt: {
    legs: { b: [-44, -6, 10], f: [40, 46, 10] },
    arms: { b: [-130, -160], f: [120, 150] },
    lean: -16,
    dy: 2,
    face: 'hurt',
    flow: 0.6,
  },
  // the 3x view and the portraits: a wide stance, claws out, the cape spread behind him
  action: { legs: { b: [-42, -34, 0], f: [50, -8, 0] }, arms: { b: [-16, 70], f: [70, 60] }, lean: 6, flow: 0.55 },
};
const _umbrionPoses = {};
function umbrionPose(id, wave = 0) {
  const key = id + '|' + wave;
  return (
    _umbrionPoses[key] || (_umbrionPoses[key] = ncPose(key, Object.assign({ face: 'angry', wave }, UMBRION_POSES[id])))
  );
}
// the clones dash out at tick 14 (b.arm 14) and the orbs rise at tick 10 (b.arm 20; see BOSSES.shadow); out of the warp
// he dashes at the player (the pose hook gives 'run' while b.dash > 0), and his clones run with the same frames
function umbrionFrame(pose, fr, arm, big, opt) {
  // the cape ripples (four steps)
  const wave = big ? 0 : (frameCount >> 3) & 3;
  if (big || pose === 'action') return umbrionPose('action');
  if (pose === 'hurt') return umbrionPose('hurt');
  if (pose === 'jump') return umbrionPose(fr ? 'jumpF' : 'jumpR', wave);
  if (pose === 'run') {
    // the ninja run: leaning far forward, both arms swept back, the cape streaming behind; ten frames a stride
    const n = 10,
      i = Math.floor(((fr * 1.4 * 2) / UMBRION_GAIT.stride) * n) % n,
      key = 'run' + i;
    return (
      _umbrionPoses[key] ||
      (_umbrionPoses[key] = ncPose(
        key,
        Object.assign(ncGait(NC_BODY, UMBRION_GAIT, i / n), {
          arms: { b: [-80, -46], f: [-64, -30] },
          face: 'angry',
          flow: 1,
          wave: i & 3,
        }),
      ))
    );
  }
  if (opt.state === 'clones') return umbrionPose(arm ? 'thrust' : opt.t < 14 ? 'summon' : 'stand', wave);
  if (opt.state === 'orbs' && (opt.t < 10 || arm)) return umbrionPose('orbs', wave);
  return umbrionPose('stand', wave);
}

const UM = NC_SHAPES;
const UMBRION_LEG = {
  thigh: 'n',
  thighW: 4,
  boot: 'A',
  w0: 6.8,
  w1: 9.4,
  band: ['V', 2.2, 3.2, 8],
  sole: 'B',
  knee: ['B', 2.6, 0.6],
  shine: 'w',
};
const UMBRION_ARM = { upper: 'n', glove: 'A', w0: 5.2, w1: 7, cuff: ['V', 3.6, 4.6, 7.4], fist: 'B', fistR: 2.8 };
// the cape (behind everything): from the shoulders down past the knees, its hem torn into points; flow sweeps it back
// (0 hanging, 1 streaming out behind), wave ripples the hem
function umbrionCape(G, J, P) {
  const f = P.flow || 0,
    w = P.wave || 0,
    [l0, t0] = J.up(17.6, 18.4),
    [r0, s0] = J.up(25, 18),
    hem = [];
  for (let i = 0; i <= 6; i++) {
    const u = i / 6,
      ripple = Math.sin(w * 1.6 + u * 5) * 1.2,
      // hanging: the hem below the knees; streaming: out behind the back at shoulder height
      x = 12 + u * 14 - f * (16 + u * 6),
      y = 44 - f * (18 - u * 8) + ripple,
      tip = i % 2 ? 3.4 : 0;
    hem.push([x - f * tip, y + tip * (1 - f)]);
  }
  G.shape('C', UM.poly([l0, t0, r0, s0, 27, 30 - f * 6, ...hem.reverse().flat()]));
  G.paint(
    'Q',
    UM.poly([
      l0 + 1.6,
      t0 + 1.6,
      r0 - 1,
      s0 + 1.6,
      25.4,
      28 - f * 6,
      ...hem.map(([x, y], i) => [x + (i > 3 ? 1 : 0.4), y - 1.6]).flat(),
    ]),
    'C',
  );
}
// a claw: three short blades from the fist, pointing along the forearm
function umbrionClaws(G, A) {
  const parts = [-24, 0, 24].map(d => UM.spike(...A.hand, A.a2 + d, 4.6, 1.4));
  G.shape('V', UM.all(...parts));
}
function umbrionPad(G, sx, sy, far) {
  // an angular pad with a spike
  G.shape(
    'A',
    UM.all(
      UM.ell(sx + (far ? -0.6 : 0.4), sy - 1, far ? 4.6 : 5, far ? 3.8 : 4.2),
      UM.spike(sx - 1, sy - 3.2, 220, 5, 3),
    ),
  );
  if (far) return;
  G.shape('V', UM.strand(sx - 4.4, sy + 0.8, sx + 0.4, sy + 3.8, sx + 5.2, sy + 0.6, 1, 1), false);
  G.shape('G', UM.disc(sx + 0.8, sy - 0.8, 1.1), false);
}
function umbrionTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('n', Wa(UM.poly([20.8, 24.8, 28.2, 24.8, 27.8, 29.4, 21.2, 29.4])));
  shape('A', Wa(UM.poly([19.4, 29, 29.4, 29, 29, 31.4, 26.4, 33.4, 22.4, 33.4, 19.8, 31.4])));
  shape('V', Wa(UM.bar(19.6, 29.4, 29.2, 29.4, 1.1)), false);
  shape('B', U(UM.poly([15.8, 17.4, 32.8, 17.4, 32.4, 22.6, 28.4, 26, 21.2, 26, 16.2, 22.6]))); // chest
  // violet trim in a V down the chest, and a gem at its point
  paint(
    'V',
    U(UM.all(UM.strand(18, 18.4, 21.4, 22, 24.6, 24.8, 1, 1), UM.strand(31, 18.4, 28, 22, 24.6, 24.8, 1, 1))),
    'B',
  );
  shape('A', U(UM.poly([20.4, 16.8, 29.8, 16.8, 28.4, 18.6, 25, 20, 21.8, 18.6])));
  shape('G', U(UM.poly([24.6, 20.8, 26, 22.4, 24.6, 24, 23.2, 22.4])));
  shape('w', U(UM.ell(19.2, 19, 1.6, 0.7)), false);
}
// the hood framing his face, the mask over his mouth and nose, and the horns sweeping back
function umbrionHead(G, J, P) {
  const { shape, paint } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  shape(
    'Z',
    UM.all(
      UM.strand(...o(-2.6, -5.6), ...o(-7.4, -12), ...o(-14.4, -14), 3.8, 0),
      UM.strand(...o(2.4, -6.4), ...o(0, -13.4), ...o(-6, -17.6), 3.6, 0),
    ),
  );
  paint('V', UM.strand(...o(2, -7.4), ...o(-0.2, -13), ...o(-5.4, -16.6), 0.9, 0), 'Z');
  shape('A', UM.disc(hx - 0.6, hy - 0.8, 8.2)); // hood
  ncManFace(G, hx, hy, P.face);
  // the hood's brow, pointed over the forehead, with a gem
  shape('A', UM.poly([...o(-0.8, -6), ...o(9.4, -5.8), ...o(9.8, -3.6), ...o(5, -2.4), ...o(-0.6, -3.4)]));
  shape('G', UM.disc(...o(5, -4.4), 1.1), false);
  // the mask: black cloth from below the eyes to the chin, its tails fluttering behind the head
  shape(
    'n',
    UM.poly([
      ...o(0.6, 3.6),
      ...o(9.4, 3),
      ...o(10.6, 4.6),
      ...o(9.4, 6.4),
      ...o(7.4, 9),
      ...o(3.4, 9.2),
      ...o(0.6, 6.8),
    ]),
  );
  shape(
    'n',
    UM.strand(...o(-3.6, 3.8), ...o(-8, 4.6 + (P.wave || 0) * 0.6), ...o(-11.4, 3 + (P.flow || 0) * 2), 2.2, 0.6),
  );
  shape('w', UM.ell(...o(-4.2, -4.6), 1.6, 0.9), false);
}
function umbrionDraw(G, J, P) {
  const B = G.B;
  umbrionCape(G, J, P);
  umbrionPad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, UMBRION_ARM);
  umbrionClaws(G, J.arms.b);
  ncLeg(G, J.legs.b, B, UMBRION_LEG);
  ncLeg(G, J.legs.f, B, UMBRION_LEG);
  umbrionTorso(G, J);
  ncArm(G, J.arms.f, UMBRION_ARM);
  umbrionClaws(G, J.arms.f);
  umbrionPad(G, ...J.arms.f.sh, false);
  umbrionHead(G, J, P);
}
// the aura: a dark violet glow and wisps of shadow curling up off his shoulders (not on his clones, nor when defeated);
// the smear of shadow behind his dash
function umbrionBefore(P, J, at, c) {
  if (c.pal.gray || c.pal.shadow) return;
  const [cx, cy] = at(...J.up(24.6, 22));
  glow(cx, cy, 20, '#7a38c8', 0.3);
  for (let i = 0; i < 4; i++) {
    const t = ((frameCount + i * 17) % 60) / 60,
      [sx, sy] = at(...J.up(i & 1 ? 30 : 18, 17));
    ctx.globalAlpha = 0.6 * (1 - t);
    circle(sx + Math.sin(t * 6 + i) * 1.6, sy - t * 9, 1.2 + t * 1.4, i & 1 ? '#4a2c78' : '#2c1a48');
    ctx.globalAlpha = 1;
  }
  if (c.opt.state === 'warp' && c.opt.dash > 0)
    // streaks of shadow behind the dash
    for (let i = 0; i < 5; i++) {
      const [x0, y] = at(16, 16 + i * 6),
        [x1] = at(16 - 10 - ((i * 7 + frameCount * 3) % 12), 0);
      ctx.globalAlpha = 0.5;
      R(Math.min(x0, x1), y, Math.abs(x1 - x0), 1, i & 1 ? '#4a2c78' : '#2c1a48');
      ctx.globalAlpha = 1;
    }
}
// the shadow gathering in his hand and bursting out with the clones, and the dark orb swelling over his raised hand
function umbrionAfter(P, J, at, c) {
  if (c.pal.gray || c.pal.shadow) return;
  const A = J.arms.f,
    o = c.opt,
    [hx, hy] = at(...A.hand);
  if (P.gather) {
    const g = clamp((o.t || 0) / 14, 0, 1);
    glow(hx, hy, 6 + g * 8, '#9848e8', 0.5);
    circle(hx, hy, 1 + g * 2, '#2c1a48');
    circle(hx, hy, 0.5 + g, '#c878ff');
  }
  if (P.burst) {
    glow(hx, hy, 14, '#9848e8', 0.7);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + frameCount * 0.2;
      circle(hx + Math.cos(a) * 4, hy + Math.sin(a) * 4, 1, '#c878ff');
    }
  }
  if (P.orb) {
    const g = clamp((o.t || 0) / 10, 0, 1),
      [ox, oy] = at(...along(...A.hand, 180, 4 + g * 2)),
      r = 1.4 + g * 2.6;
    glow(ox, oy, 8 + r * 3, '#9848e8', 0.5);
    circle(ox, oy, r, '#1a0e2c');
    circle(ox, oy, r * 0.6, '#6a2ca8');
    circle(ox - r * 0.3, oy - r * 0.3, Math.max(0.5, r * 0.22), '#e8c8ff');
  }
}
NATIVE_CHARS.shadow = {
  colors: pal => ncFixed(UMBRION_TONES, pal),
  flat: 'KnGwEIUWNM',
  skin: 'S',
  frame: umbrionFrame,
  draw: umbrionDraw,
  before: umbrionBefore,
  after: umbrionAfter,
};
