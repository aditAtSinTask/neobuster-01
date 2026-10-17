'use strict';
// Lumina, boss of the light stage, drawn natively (see js/chars.js): a radiant light priestess in white and gold
// armour with a long ivory skirt. Signature: a prism-crystal tiara with cyan and rainbow facets, a halo of light behind
// her head, crystal prisms on her shoulders, and long golden hair; motes of light twinkle round her and rainbow glints
// flash on the prisms. A prism charges in her hand and splits the light into a rainbow at each laser, her raised hands
// blaze while she calls down the pillars and the flash, and a starburst marks the release. The face is the shared
// women's face (ncWomanFace).
// Letters: K outline, A gold armour, V ivory armour, C crystal, c its bright facet, p/y/g rainbow facets (pink, yellow,
// green), H halo, Z hair, z hair shine, w gloss; S skin, eyes E I U W, N nose, M lips.
const LUMINA_TONES = {
  K: '#141008',
  A: '#eec03a',
  V: '#fff8ea',
  C: '#5ad8f2',
  c: '#eafcff',
  p: '#ff8acc',
  y: '#fff272',
  g: '#86f0a4',
  H: '#ffe68a',
  Z: '#f6d062',
  z: '#fff6c8',
  w: '#ffffff',
  S: '#fde4d0',
  E: '#ffffff',
  I: '#e0a018',
  U: '#5a3200',
  W: '#ffffff',
  N: '#e8b4a2',
  M: '#e07484',
};
const LUMINA_BODY = { hipW: 2.4, shB: [19.2, 19.8], shF: [30, 20.2], upper: 3.6, fore: 4.6 };
const LUMINA_POSES = {
  // a calm stance, the hands folded in front
  stand: { legs: { b: [-20, -14, 0], f: [24, -4, 0] }, arms: { b: [-8, 40], f: [10, 60] }, lean: 1, flow: 0.1 },
  // the laser: a prism held out toward the player, charging, then flashing as the beam leaves it
  aim: {
    legs: { b: [-32, -22, 0], f: [38, -6, 0] },
    arms: { b: [-16, 30], f: [84, 82] },
    lean: 4,
    flow: 0.3,
    prism: true,
  },
  fire: {
    legs: { b: [-38, -28, 0], f: [44, -8, 0] },
    arms: { b: [-24, 18], f: [90, 90] },
    lean: 7,
    flow: 0.6,
    prism: true,
    burst: true,
  },
  // the pillars and the flash: both arms raised, light gathering in her hands
  raise: {
    legs: { b: [-28, -20, 0], f: [32, -6, 0] },
    arms: { b: [-150, -170], f: [150, 170] },
    lean: -2,
    flow: 0.4,
    blaze: true,
  },
  jumpR: {
    legs: { b: [-14, -44, -25], f: [70, -6, -10] },
    arms: { b: [-44, -4], f: [130, 160] },
    air: true,
    flow: 0.6,
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
  // the 3x view and the portraits: reaching out with the prism, the halo behind her
  action: {
    legs: { b: [-40, -32, 0], f: [48, -8, 0] },
    arms: { b: [-12, 100], f: [80, 76] },
    lean: 6,
    flow: 0.5,
    prism: true,
  },
};
const _luminaPoses = {};
function luminaPose(id) {
  return _luminaPoses[id] || (_luminaPoses[id] = ncPose(id, LUMINA_POSES[id]));
}
// the laser leaves the prism at tick 14 (b.arm 14; see BOSSES.light); the pillars and the flash are the 'raise' pose
// (the pose hook), the flash bursting at tick 24
function luminaFrame(pose, fr, arm, big, opt) {
  if (big || pose === 'action') return luminaPose('action');
  if (pose === 'hurt') return luminaPose('hurt');
  if (pose === 'raise') return luminaPose('raise');
  if (pose === 'jump') return luminaPose(fr ? 'jumpF' : 'jumpR');
  if (opt.state === 'laser') return luminaPose(arm && opt.armT > 8 ? 'fire' : 'aim');
  return luminaPose('stand');
}

const LU = NC_SHAPES;
const LUMINA_LEG = {
  thigh: 'V',
  thighW: 3.6,
  boot: 'V',
  w0: 6,
  w1: 8.6,
  band: ['A', 2.2, 3.4, 7.6],
  sole: 'A',
  knee: ['A', 2.2, 0.6],
};
const LUMINA_ARM = {
  upper: 'V',
  upperW: 2.8,
  glove: 'V',
  w0: 4.8,
  w1: 6.6,
  cuff: ['A', 3.4, 4.4, 6.8],
  fist: 'V',
  fistR: 2.6,
};
// a prism crystal at (x, y) pointing toward a: cyan with a bright facet and a rainbow edge
function luminaPrism(G, x, y, a, len, w) {
  G.shape('C', LU.spike(x, y, a, len, w));
  G.paint('c', LU.spike(...along(x, y, a, len * 0.1), a, len * 0.5, w * 0.36), 'C');
  G.paint(
    'p',
    LU.cap(...along(x, y, a + 90, w * 0.3), ...along(...along(x, y, a + 90, w * 0.12), a, len * 0.6), 0.6),
    'C',
  );
}
function luminaPad(G, sx, sy, far) {
  luminaPrism(G, sx - 0.6, sy - 2, 205, far ? 7 : 8.4, 3.6);
  G.shape('V', LU.ell(sx + (far ? -0.6 : 0.4), sy - 0.8, far ? 3.8 : 4.4, far ? 3.4 : 3.8));
  if (!far) G.shape('A', LU.strand(sx - 4, sy + 0.6, sx + 0.4, sy + 3.4, sx + 4.8, sy + 0.4, 1, 1), false);
}
function luminaTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('V', Wa(LU.poly([21.2, 24, 28, 24, 27.6, 29.4, 21.6, 29.4])));
  // the long skirt: ivory, flaring to just above the boots, with a gold hem and a gold panel down the front
  shape('V', Wa(LU.poly([20.6, 28, 28.6, 28, 32.6, 40, 16.4, 40])));
  paint(
    'A',
    Wa(
      LU.all(
        LU.poly([16.2, 38.6, 32.8, 38.6, 32.6, 40, 16.4, 40]),
        LU.poly([23.6, 28.4, 25.6, 28.4, 26.6, 40, 22.6, 40]),
      ),
    ),
    'V',
  );
  shape('A', Wa(LU.bar(20.6, 28.6, 28.6, 28.6, 1.2)), false);
  shape('V', U(LU.poly([17.4, 17.4, 31.6, 17.4, 31.2, 22.6, 27.8, 25.6, 21.6, 25.6, 17.8, 22.6])));
  paint(
    'A',
    U(LU.all(LU.strand(18.6, 18.6, 21.6, 22, 24.7, 24.6, 1, 1), LU.strand(30.6, 18.6, 27.6, 22, 24.7, 24.6, 1, 1))),
    'V',
  );
  shape('A', U(LU.poly([20.4, 16.8, 29.8, 16.8, 28.4, 18.6, 25, 19.8, 21.8, 18.6])));
  shape('C', U(LU.poly([24.7, 19.8, 26.2, 21.6, 24.7, 23.6, 23.2, 21.6]))); // the chest crystal
  shape('c', U(LU.disc(24.4, 21.2, 0.5)), false);
}
// the crown of her hair, the face, the fringe, and the prism tiara over her brow
function luminaHead(G, J, P) {
  const { shape } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  shape('Z', LU.ell(hx - 1.4, hy - 1, 7.6, 7.4));
  ncWomanFace(G, hx, hy, P.face);
  shape(
    'Z',
    LU.all(
      LU.ell(...o(2.6, -4.6), 6.6, 2.4),
      LU.strand(...o(1.4, -5.6), ...o(2.4, -2.4), ...o(2.6, 0.6), 3.2, 0),
      LU.strand(...o(4.8, -5.4), ...o(5.8, -2.6), ...o(6.4, -0.2), 3, 0),
      LU.strand(...o(7.6, -4.6), ...o(8.8, -3), ...o(9.8, -1.4), 2.4, 0),
      LU.strand(...o(-0.8, -3), ...o(-1.2, 3), ...o(0.6, 10), 3, 0.6),
    ),
  );
  // the tiara: a gold band with a tall prism in the middle and smaller ones at the sides
  shape(
    'A',
    LU.poly([
      ...o(-4.6, -4.6),
      ...o(0.4, -7.4),
      ...o(5.4, -7),
      ...o(9.6, -4.4),
      ...o(8.8, -3.2),
      ...o(4.6, -5),
      ...o(0.4, -5.2),
      ...o(-3.4, -3),
    ]),
  );
  luminaPrism(G, ...o(4.8, -6.4), 180, 7, 3.4);
  luminaPrism(G, ...o(0.6, -6.4), 196, 4.6, 2.6);
  luminaPrism(G, ...o(-3, -4.6), 214, 4, 2.4);
  shape('z', LU.strand(...o(-4.6, -2.6), ...o(-6, 2), ...o(-5.4, 6.4), 1, 0.4), false);
}
function luminaDraw(G, J, P) {
  const B = G.B,
    [hx, hy] = J.head;
  ncLongHair(G, hx, hy, { flow: P.flow || 0, len: 28, locks: 7, wave: 0, width: 6.6 });
  luminaPad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, LUMINA_ARM);
  ncLeg(G, J.legs.b, B, LUMINA_LEG);
  ncLeg(G, J.legs.f, B, LUMINA_LEG);
  luminaTorso(G, J);
  ncArm(G, J.arms.f, LUMINA_ARM);
  if (P.prism) luminaPrism(G, ...J.arms.f.hand, J.arms.f.a2, 6, 3.6); // the prism held in her hand
  luminaPad(G, ...J.arms.f.sh, false);
  luminaHead(G, J, P);
}
// the halo behind her head: a ring of light (base on box point 24, 24)
function luminaHalo(G) {
  G.shape('H', LU.annulus(24, 24, 9.2, 11.2), false);
  G.shape('w', LU.annulus(24, 24, 9.8, 10.6), false);
}
function luminaBefore(P, J, at, c) {
  const [hx, hy] = J.head,
    [x, y] = at(hx - 1.6, hy - 2.6);
  if (!c.pal.gray) glow(x, y, 12, '#fff0a0', 0.45);
  drawNativeProp(c.style, NATIVE_CHARS.light, 'halo', luminaHalo, x, y, c.pal, c.flip, c.big);
}
// a four-pointed twinkle
function luminaStar(x, y, r, col) {
  R(x - r, y - 0.25, r * 2, 0.5, col);
  R(x - 0.25, y - r, 0.5, r * 2, col);
}
const LUMINA_RAINBOW = ['#ff8acc', '#fff272', '#86f0a4', '#5ad8f2', '#b48cff'];
// motes of light orbiting her, rainbow glints on the prisms, the charge in the prism, the rainbow at the laser, her
// blazing hands and the starburst of the flash
function luminaAfter(P, J, at, c) {
  if (c.pal.gray) return;
  const A = J.arms.f,
    o = c.opt,
    [hx, hy] = J.head;
  for (let i = 0; i < 3; i++) {
    const a = frameCount * 0.04 + (i * Math.PI * 2) / 3,
      [x, y] = at(24 + Math.cos(a) * 17, 22 + Math.sin(a) * 9),
      tw = (frameCount + i * 9) % 24 < 8;
    luminaStar(x, y, tw ? 1.5 : 0.75, tw ? '#ffffff' : '#fff0a0');
  }
  const glint = (frameCount >> 3) % 5 | 0,
    [gx, gy] = at(hx + 4.8, hy - 10);
  luminaStar(gx, gy, 1, LUMINA_RAINBOW[glint]);
  if (P.prism && o.state === 'laser' && !P.burst) {
    const g = clamp((o.t || 0) / 14, 0, 1),
      [x, y] = at(...along(...A.elbow, A.a2, 9));
    glow(x, y, 6 + g * 8, '#fff0a0', 0.6);
    luminaStar(x, y, 1 + g * 2, '#ffffff');
  }
  if (P.burst) {
    // the light split into a fan of rainbow rays from the tip of the prism
    const [x, y] = at(...along(...A.elbow, A.a2, 10)),
      dir = c.flip ? -1 : 1;
    glow(x, y, 14, '#fff6c8', 0.8);
    LUMINA_RAINBOW.forEach((col, i) => {
      const a = ((i - 2) * Math.PI) / 18;
      for (let j = 2; j < 11; j++) circle(x + Math.cos(a) * j * dir, y + Math.sin(a) * j, 0.5, col);
    });
    luminaStar(x, y, 3, '#ffffff');
  }
  if (P.blaze)
    for (const side of ['b', 'f']) {
      const [x, y] = at(...J.arms[side].hand),
        t = o.state === 'flash' ? clamp((o.t || 0) / 24, 0, 1) : 0.6;
      glow(x, y, 5 + t * 5, '#fff0a0', 0.4);
      luminaStar(x, y, 1.5 + t * 2, '#ffffff');
    }
}
NATIVE_CHARS.light = {
  body: LUMINA_BODY,
  colors: pal => ncFixed(LUMINA_TONES, pal),
  flat: 'KcpygHwEIUWNMz',
  hair: 'Z',
  skin: 'S',
  frame: luminaFrame,
  draw: luminaDraw,
  before: luminaBefore,
  after: luminaAfter,
};
