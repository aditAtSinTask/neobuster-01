'use strict';
// Chronia, boss of the time stage, drawn natively (see js/characters/chars.js): a clockwork lady in bronze and cream armour with
// gold gears and a long armoured skirt. Signature: a clock on her chest whose hands really turn (the long hand steps
// round once a minute, the short hand once an hour of its own), a clock-hand crest on her hair bun, gear shoulder pads
// with turning gears, a pendulum swinging at her waist, and a big clock hand she holds and throws. A great clock dial
// glows behind her while she stops time, and little gears burst out when she reappears from the warp. The face is the
// shared women's face (ncWomanFace).
// Letters: K outline, A bronze armour, V cream armour, Y gold, D dark bronze, C the clock face, Z hair, z hair shine,
// w gloss; S skin, eyes E I U W, N nose, M lips.
const CHRONIA_TONES = {
  K: '#120a06',
  A: '#b0683a',
  V: '#f2dcae',
  Y: '#f0c040',
  D: '#4a2c18',
  C: '#fff6e0',
  Z: '#6e3c24',
  z: '#ac6c44',
  w: '#fff8e8',
  S: '#f8dcc4',
  E: '#ffffff',
  I: '#3a8a8a',
  U: '#0e2e2e',
  W: '#ffffff',
  N: '#e0a890',
  M: '#d06a6a',
};
const CHRONIA_BODY = { hipW: 2.4, shB: [19.2, 19.8], shF: [30, 20.2], upper: 3.6, fore: 4.6 };
const CHRONIA_POSES = {
  // poised, the big clock hand held at her side like a sword
  stand: { legs: { b: [-20, -14, 0], f: [24, -4, 0] }, arms: { b: [-10, 30], f: [20, 40] }, lean: 1, hand: true },
  // the throw: the clock hand drawn back over her shoulder, then flung
  windup: { legs: { b: [-30, -22, 0], f: [38, -6, 0] }, arms: { b: [10, 70], f: [-150, -120] }, lean: -4, hand: true },
  throw: { legs: { b: [-40, -30, 0], f: [48, -8, 0] }, arms: { b: [-30, 10], f: [96, 100] }, lean: 9 },
  // stopping time: both arms raised as the great dial glows behind her
  raise: { legs: { b: [-28, -20, 0], f: [32, -6, 0] }, arms: { b: [-150, -170], f: [150, 170] }, lean: -2, dial: true },
  // back out of the warp: an arm thrust out, firing the needles
  needles: { legs: { b: [-40, -30, 0], f: [46, -8, 0] }, arms: { b: [-24, 20], f: [88, 88] }, lean: 7, gears: true },
  jumpR: {
    legs: { b: [-14, -44, -25], f: [70, -6, -10] },
    arms: { b: [-44, -4], f: [130, 160] },
    air: true,
    hand: true,
  },
  jumpF: { legs: { b: [-8, -24, -15], f: [30, 4, -5] }, arms: { b: [-70, -40], f: [96, 120] }, air: true, hand: true },
  hurt: {
    legs: { b: [-44, -6, 10], f: [40, 46, 10] },
    arms: { b: [-130, -160], f: [120, 150] },
    lean: -16,
    dy: 2,
    face: 'hurt',
  },
  // the 3x view and the portraits: a wide stance, pointing the clock hand
  action: { legs: { b: [-40, -32, 0], f: [48, -8, 0] }, arms: { b: [-12, 100], f: [80, 80] }, lean: 6, hand: true },
};
const _chroniaPoses = {};
function chroniaPose(id) {
  return _chroniaPoses[id] || (_chroniaPoses[id] = ncPose(id, CHRONIA_POSES[id]));
}
// the clock hands are thrown at tick 12 (b.arm 14) and fly back to her (see BOSSES.time); the time stop is the 'raise'
// pose (the pose hook) until tick 44, and she throws a hand at tick 50; out of the warp she reappears at tick 30
function chroniaFrame(pose, fr, arm, big, opt) {
  if (big || pose === 'action') return chroniaPose('action');
  if (pose === 'hurt') return chroniaPose('hurt');
  if (pose === 'raise') return chroniaPose('raise');
  if (pose === 'jump') return chroniaPose(fr ? 'jumpF' : 'jumpR');
  if (opt.state === 'hands') return chroniaPose(opt.t < 12 ? 'windup' : 'throw');
  if (opt.state === 'stop' && opt.t >= 44 && opt.t < 60) return chroniaPose(opt.t < 50 ? 'windup' : 'throw');
  if (opt.state === 'warp' && opt.t >= 30) return chroniaPose('needles');
  return chroniaPose('stand');
}

const CH = NC_SHAPES;
const CHRONIA_LEG = {
  thigh: 'D',
  thighW: 3.6,
  boot: 'A',
  w0: 6,
  w1: 8.6,
  band: ['Y', 2.2, 3.4, 7.6],
  sole: 'D',
  knee: ['Y', 2.2, 0.6],
};
const CHRONIA_ARM = {
  upper: 'D',
  upperW: 2.8,
  glove: 'V',
  w0: 4.8,
  w1: 6.6,
  cuff: ['Y', 3.4, 4.4, 6.8],
  fist: 'V',
  fistR: 2.6,
};
// a gear: a disc with square teeth and a hole, turned by rot degrees
const chroniaGear = (x, y, r, teeth, rot) =>
  CH.all(
    CH.disc(x, y, r),
    ...Array.from({ length: teeth }, (_, i) => CH.spike(x, y, rot + (i * 360) / teeth, r + 1.4, 1.8)),
  );
function chroniaPad(G, sx, sy, far) {
  G.shape('Y', chroniaGear(sx + (far ? -0.6 : 0.4), sy - 0.8, far ? 3.6 : 4, 8, 0));
  G.shape('A', CH.disc(sx + (far ? -0.6 : 0.4), sy - 0.8, far ? 2.4 : 2.8));
  if (!far) G.shape('D', CH.disc(sx + 0.4, sy - 0.8, 1), false);
}
// the big clock hand: a gold arrow with a ring at its hub, held along the forearm (or drawn as a prop when thrown)
function chroniaHand(G, x, y, a, len) {
  G.shape(
    'Y',
    CH.all(
      CH.taper(x, y, ...along(x, y, a, len * 0.78), 1.6, 1.2),
      CH.spike(...along(x, y, a, len * 0.7), a, len * 0.3, 3.6),
    ),
  );
  G.shape('Y', CH.annulus(x, y, 0.8, 1.9));
  G.shape('D', CH.disc(...along(x, y, a + 180, 1.6), 1), false);
}
function chroniaTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('D', Wa(CH.poly([21.2, 24, 28, 24, 27.6, 29.4, 21.6, 29.4])));
  // the long skirt: bronze panels flaring to the knees, a cream underskirt and a gold hem
  shape('V', Wa(CH.poly([20.4, 28, 28.8, 28, 33.6, 39, 15.4, 39])));
  shape(
    'A',
    Wa(CH.all(CH.poly([20.4, 28, 23.6, 28, 21.6, 39, 15.4, 39]), CH.poly([25.6, 28, 28.8, 28, 33.6, 39, 27.6, 39]))),
  );
  paint('Y', Wa(CH.poly([15.2, 37.8, 33.8, 37.8, 33.6, 39, 15.4, 39])), 'AV');
  shape('Y', Wa(CH.bar(20.6, 28.6, 28.6, 28.6, 1.2)), false);
  shape('A', U(CH.poly([17.4, 17.4, 31.6, 17.4, 31.2, 22.6, 27.8, 25.6, 21.6, 25.6, 17.8, 22.6])));
  shape('V', U(CH.poly([20.4, 16.8, 29.8, 16.8, 28.4, 18.6, 25, 19.8, 21.8, 18.6]))); // collar
  // the clock face on her chest, in a gold rim (its hands are drawn over the frame, see chroniaAfter)
  shape('Y', U(CH.disc(24.7, 21.8, 3.6)));
  shape('C', U(CH.disc(24.7, 21.8, 2.6)), false);
  paint(
    'D',
    U(CH.all(CH.disc(24.7, 19.6, 0.35), CH.disc(26.9, 21.8, 0.35), CH.disc(24.7, 24, 0.35), CH.disc(22.5, 21.8, 0.35))),
    'C',
  );
  shape('w', U(CH.ell(20.6, 19.4, 1.3, 0.7)), false);
}
// the crown of her hair, the bun with its clock-hand crest, the face, the fringe and the gold hairpiece
function chroniaHead(G, J, P) {
  const { shape } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  shape('Z', CH.all(CH.ell(hx - 1.4, hy - 1, 7.6, 7.4), CH.disc(...o(-5.6, -6.4), 4.4)));
  chroniaHand(G, ...o(-5.6, -7.4), 172, 10); // the crest: a clock hand standing up from the bun
  ncWomanFace(G, hx, hy, P.face);
  shape(
    'Z',
    CH.all(
      CH.ell(...o(2.6, -4.6), 6.6, 2.4),
      CH.strand(...o(1.4, -5.6), ...o(2.4, -2.4), ...o(2.6, 0.6), 3.2, 0),
      CH.strand(...o(4.8, -5.4), ...o(5.8, -2.6), ...o(6.4, -0.2), 3, 0),
      CH.strand(...o(-0.8, -3), ...o(-1.4, 2.6), ...o(-0.4, 7.6), 3, 0.6),
    ),
  );
  // a gold hairpiece: a small gear over her brow
  shape('Y', chroniaGear(...o(3.6, -6.4), 1.8, 6, 15));
  shape('C', CH.disc(...o(3.6, -6.4), 0.9), false);
  shape('z', CH.strand(...o(-4.6, -2.6), ...o(-6, 2), ...o(-5.4, 6.4), 1, 0.4), false);
}
function chroniaDraw(G, J, P) {
  const B = G.B;
  chroniaPad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, CHRONIA_ARM);
  ncLeg(G, J.legs.b, B, CHRONIA_LEG);
  ncLeg(G, J.legs.f, B, CHRONIA_LEG);
  chroniaTorso(G, J);
  ncArm(G, J.arms.f, CHRONIA_ARM);
  if (P.hand) chroniaHand(G, ...J.arms.f.hand, J.arms.f.a2, 13);
  chroniaPad(G, ...J.arms.f.sh, false);
  chroniaHead(G, J, P);
}
// a line of fine pixels from (x, y) in direction a (radians) for len logical pixels: the clock hands and the pendulum
function chroniaLine(x, y, a, len, col) {
  const u = HP / ncDensity(false);
  ctx.fillStyle = col;
  for (let d = 0; d <= len; d += u)
    ctx.fillRect(Math.round((x + Math.cos(a) * d) / u) * u, Math.round((y + Math.sin(a) * d) / u) * u, u, u);
}
// the great clock dial behind her while she stops time (base on box point 24, 24)
function chroniaDial(G) {
  G.shape('Y', CH.annulus(24, 24, 13, 14.6), false);
  for (let i = 0; i < 12; i++) G.shape('Y', CH.disc(...along(24, 24, i * 30, 11.6), i % 3 ? 0.6 : 1.1), false);
}
// a small gear turning (step) for the bursts
function chroniaSpinGear(step) {
  return G => {
    G.shape('Y', chroniaGear(24, 24, 1.8, 6, step * 15));
    G.shape('D', CH.disc(24, 24, 0.7), false);
  };
}
function chroniaBefore(P, J, at, c) {
  if (!P.dial || c.pal.gray) return;
  const [hx, hy] = J.head,
    [x, y] = at(hx - 1, hy + 4),
    o = c.opt;
  glow(x, y, 26, '#ffe08a', 0.35);
  ctx.globalAlpha = 0.75;
  drawNativeProp(c.style, NATIVE_CHARS.time, 'dial', chroniaDial, x, y, c.pal, c.flip, c.big);
  ctx.globalAlpha = 1;
  // its hands spinning fast as she gathers the power to stop time
  const t = (o.t || 0) * 0.3;
  chroniaLine(x, y, t - Math.PI / 2, 6, '#fff6c8');
  chroniaLine(x, y, t / 12 - Math.PI / 2, 4, '#fff6c8');
}
// the hands of the chest clock, the pendulum, the gears turning on her skirt, and the gears bursting out of the warp
function chroniaAfter(P, J, at, c) {
  const [cx, cy] = at(...J.up(24.7, 21.8)),
    minute = Math.floor(frameCount / 60) % 60,
    dir = c.flip ? -1 : 1,
    ang = f => (c.flip ? Math.PI - f : f),
    gold = c.pal.gray ? '#a8a8a8' : c.pal === PAL_WHITE ? '#fcfcfc' : '#f0c040';
  chroniaLine(cx, cy, ang((minute / 60) * Math.PI * 2 - Math.PI / 2), 1.1, '#2a1a10');
  chroniaLine(
    cx,
    cy,
    ang((Math.floor(frameCount / 3600) / 12) * Math.PI * 2 - Math.PI / 2 + minute / 120),
    0.7,
    '#2a1a10',
  );
  // the pendulum hanging from her belt
  const [px, py] = at(...J.up(24.6, 29.4)),
    sw = Math.sin(frameCount * 0.09) * 0.45;
  chroniaLine(px, py, Math.PI / 2 + sw * dir, 3.4, gold);
  circle(px + Math.cos(Math.PI / 2 + sw * dir) * 4, py + Math.sin(Math.PI / 2 + sw * dir) * 4, 1, gold);
  // two gears turning on the bronze panels of her skirt
  const step = (frameCount >> 2) % 6;
  for (const [x, y] of [
    [19.6, 34],
    [30, 35.4],
  ]) {
    const [gx, gy] = at(...J.up(x, y));
    drawNativeProp(c.style, NATIVE_CHARS.time, 'gear' + step, chroniaSpinGear(step), gx, gy, c.pal, c.flip, c.big);
  }
  if (P.gears && !c.pal.gray) {
    const t = clamp(((c.opt.t || 30) - 30) / 14, 0, 1);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4,
        [x, y] = at(24 + Math.cos(a) * (6 + t * 14), 24 + Math.sin(a) * (6 + t * 10));
      ctx.globalAlpha = 1 - t;
      drawNativeProp(
        c.style,
        NATIVE_CHARS.time,
        'gear' + ((step + i) % 6),
        chroniaSpinGear((step + i) % 6),
        x,
        y,
        c.pal,
        c.flip,
        c.big,
      );
      ctx.globalAlpha = 1;
    }
  }
}
NATIVE_CHARS.time = {
  body: CHRONIA_BODY,
  colors: pal => ncFixed(CHRONIA_TONES, pal),
  flat: 'KCwEIUWNMz',
  hair: 'Z',
  skin: 'S',
  frame: chroniaFrame,
  draw: chroniaDraw,
  before: chroniaBefore,
  after: chroniaAfter,
};
