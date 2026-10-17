'use strict';
// Winderwomen, boss of the wind stage, drawn natively after her character sheet (see js/characters/chars.js): white armour over a
// navy bodysuit, blue and green gems, a helmet with white wings at its sides, and long mint-green hair that streams on
// the wind; whirlwinds spin on her palm.
// Letters: K outline, V white armour, n navy bodysuit, B blue gem, G green gem, C wind cyan, c its white, Z hair,
// z hair shine, S skin, eyes E I U W, N nose, M lips, w gloss.
const WINDER_TONES = {
  K: '#060c16',
  V: '#eef4f6',
  n: '#1c3452',
  B: '#2a66d0',
  G: '#36c48a',
  C: '#4ec8e4',
  c: '#dcfaff',
  Z: '#6ad2a0',
  z: '#c4f6dc',
  S: '#f6d6c0',
  E: '#ffffff',
  I: '#2aa880',
  U: '#0c4034',
  W: '#ffffff',
  N: '#dca088',
  M: '#e07888',
  w: '#ffffff',
};
const WIND_BODY = { hipW: 2.4, shB: [19.2, 19.8], shF: [30, 20.2], upper: 3.6, fore: 4.6 };
const WIND_POSES = {
  stand: { legs: { b: [-24, -16, 0], f: [28, -4, 0] }, arms: { b: [-16, 18], f: [12, 46] }, lean: 2, flow: 0.25 },
  // the gale: her palm thrust out, a whirlwind spinning on it, her hair blown back
  gust: { legs: { b: [-40, -30, 0], f: [46, -8, 0] }, arms: { b: [-20, 30], f: [86, 80] }, lean: 6, flow: 1, swirl: 1 },
  // the cyclone: a whirlwind growing on her palm, then released
  wind: {
    legs: { b: [-32, -22, 0], f: [38, -6, 0] },
    arms: { b: [-10, 50], f: [80, 76] },
    lean: 4,
    flow: 0.7,
    swirl: 2,
  },
  fire: {
    legs: { b: [-40, -30, 0], f: [48, -8, 0] },
    arms: { b: [-24, 16], f: [92, 92] },
    lean: 9,
    flow: 1,
    burst: true,
  },
  shoot: { legs: { b: [-36, -26, 0], f: [42, -6, 0] }, arms: { b: [-20, 22], f: [88, 90] }, lean: 6, flow: 0.8 },
  // the dive: rising on the wind, hanging in the air, then swooping fist first
  rise: { legs: { b: [-10, -30, -20], f: [40, 0, -10] }, arms: { b: [-150, -170], f: [150, 170] }, air: true, flow: 0 },
  hover: {
    legs: { b: [-20, -50, -20], f: [50, -20, -10] },
    arms: { b: [-60, -20], f: [70, 30] },
    air: true,
    flow: 0.5,
    swirl: 3,
  },
  swoop: {
    legs: { b: [-60, -80, -20], f: [-30, -60, -10] },
    arms: { b: [-110, -90], f: [110, 100] },
    air: true,
    bend: 40,
    flow: 1,
  },
  // landing from the dive in a burst of wind
  land: {
    legs: { b: [-62, 22, 0], f: [70, -20, 0] },
    arms: { b: [-50, -20], f: [50, 20] },
    bend: 20,
    lean: 4,
    flow: 0.6,
    gale: true,
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
  // the 3x view and the portraits: reaching out, the wind streaming round her
  action: {
    legs: { b: [-40, -32, 0], f: [48, -8, 0] },
    arms: { b: [-10, 100], f: [84, 80] },
    lean: 6,
    flow: 1,
    swirl: 1,
  },
};
const _windPoses = {};
function windPose(id, wave = 0) {
  const key = id + (wave ? '|' + wave : '');
  return _windPoses[key] || (_windPoses[key] = ncPose(key, Object.assign({ wave: wave * 1.6 }, WIND_POSES[id])));
}
// the gale swirls on her palm while it blows; a whirlwind grows on it before each cyclone (released at tick 14, and
// again at 44 when she is enraged; see BOSSES.wind); the dive rises on the wind, hangs, swoops and lands in a burst
function windFrame(pose, fr, arm, big, opt) {
  // her hair ripples in the wind (four steps)
  const wave = big ? 0 : (frameCount >> 3) & 3;
  if (big || pose === 'action') return windPose('action');
  if (pose === 'hurt') return windPose('hurt');
  if (opt.state === 'gust') return windPose('gust', wave);
  if (pose === 'jump') {
    if (opt.state === 'dive')
      return windPose(opt.mode === 'swoop' ? 'swoop' : opt.mode === 'hang' ? 'hover' : 'rise', wave);
    return windPose(fr ? 'jumpF' : 'jumpR');
  }
  if (opt.landT > 0) return windPose('land');
  if (arm) return windPose(opt.armT > 9 ? 'fire' : 'shoot', wave);
  if (opt.state === 'cyclone') {
    const c = opt.t < 14 ? opt.t : opt.enr && opt.t >= 30 && opt.t < 44 ? opt.t - 30 : -1;
    if (c >= 0) return windPose('wind', wave);
  }
  return windPose('stand', wave);
}

const WS = NC_SHAPES;
const WIND_LEG = {
  thigh: 'n',
  thighW: 3.6,
  boot: 'V',
  w0: 6,
  w1: 8.6,
  band: ['B', 2.2, 3.4, 7.6],
  sole: 'n',
  knee: ['G', 2, 0.6],
};
const WIND_ARM = {
  upper: 'n',
  upperW: 2.8,
  glove: 'V',
  w0: 4.8,
  w1: 6.6,
  cuff: ['B', 3.4, 4.4, 6.8],
  fist: 'V',
  fistR: 2.6,
};
function windPad(G, sx, sy, far) {
  // a white pad swept back like a wing, with a blue gem
  G.shape(
    'V',
    WS.all(
      WS.ell(sx + (far ? -0.6 : 0.4), sy - 0.8, far ? 3.8 : 4.4, far ? 3.4 : 3.8),
      WS.strand(sx - 1, sy - 2.4, sx - 4.4, sy - 4.4, sx - 8.4, sy - 4, 3.2, 0),
    ),
  );
  if (!far) G.shape('B', WS.disc(sx + 0.6, sy - 0.8, 1.3), false);
}
function windTorso(G, J) {
  const { shape } = G,
    U = J.upper,
    Wa = J.waist;
  shape('n', Wa(WS.poly([21.2, 24, 28, 24, 27.6, 29.4, 21.6, 29.4])));
  shape('V', Wa(WS.poly([20.6, 28.4, 28.6, 28.4, 28.2, 30.8, 25.6, 32.4, 23.2, 32.4, 21, 30.8])));
  shape('G', Wa(WS.disc(24.6, 29.8, 0.9)), false);
  shape('n', U(WS.poly([17.4, 17.4, 31.6, 17.4, 31.2, 22.6, 27.8, 25.6, 21.6, 25.6, 17.8, 22.6])));
  shape('V', U(WS.all(WS.ell(21.8, 20, 3.2, 2.6), WS.ell(27.6, 20, 3.2, 2.6))));
  shape('V', U(WS.poly([21.4, 22.6, 23.4, 22.6, 24.7, 25.2, 26, 22.6, 28, 22.6, 24.7, 27.6])));
  shape('B', U(WS.disc(24.7, 20.8, 1.4)));
  shape('w', U(WS.ell(20.8, 19.2, 1.3, 0.7)), false);
}
function windHead(G, J, P) {
  const { shape } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  shape('Z', WS.ell(hx - 1.4, hy - 1, 7.6, 7.4));
  ncWomanFace(G, hx, hy, P.face);
  shape(
    'Z',
    WS.all(
      WS.ell(...o(2.6, -4.6), 6.6, 2.4),
      WS.strand(...o(1.4, -5.6), ...o(2.4, -2.4), ...o(2.8, 0.8), 3.2, 0),
      WS.strand(...o(4.8, -5.4), ...o(5.8, -2.6), ...o(6.4, -0.2), 3, 0),
      WS.strand(...o(-0.8, -3), ...o(-2.4, 2.4), ...o(-3, 8.4), 3, 0.6),
    ),
  );
  // the winged helmet: a white band round her brow, a blue gem, and a white wing swept back from the side
  shape(
    'V',
    WS.poly([
      ...o(-5, -3.6),
      ...o(-0.6, -8),
      ...o(5, -8),
      ...o(9.6, -4.4),
      ...o(8.8, -3),
      ...o(4.6, -5.4),
      ...o(-0.4, -5.4),
      ...o(-4, -1.6),
    ]),
  );
  shape(
    'V',
    WS.all(
      WS.strand(...o(-3.6, -3), ...o(-8.6, -8.6), ...o(-14, -9.4), 4.6, 0),
      WS.strand(...o(-3.6, -1.6), ...o(-9, -4.6), ...o(-13.4, -4), 3.4, 0),
      WS.strand(...o(-3.6, 0), ...o(-8, -0.8), ...o(-11.4, 1), 2.6, 0),
    ),
  );
  shape('B', WS.disc(...o(-3.4, -1.6), 1.6));
  shape('G', WS.poly([...o(4.8, -9.6), ...o(6.4, -7), ...o(4.8, -5), ...o(3.2, -7)]));
  shape('z', WS.strand(...o(-4.6, -2.6), ...o(-6, 2), ...o(-5.4, 6.4), 1, 0.4), false);
}
function windDraw(G, J, P) {
  const B = G.B,
    [hx, hy] = J.head;
  ncLongHair(G, hx, hy, { flow: P.flow || 0, len: 28, locks: 7, wave: P.wave || 0, width: 6.6 });
  windPad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, WIND_ARM);
  ncLeg(G, J.legs.b, B, WIND_LEG);
  ncLeg(G, J.legs.f, B, WIND_LEG);
  windTorso(G, J);
  ncArm(G, J.arms.f, WIND_ARM);
  windPad(G, ...J.arms.f.sh, false);
  windHead(G, J, P);
}
// a whirlwind: rings of wind spun into a funnel, turned by step
function windSwirl(step, s) {
  return G => {
    for (let i = 0; i < 3; i++) {
      const r = (2 + i * 1.6) * s,
        a = step * 40 + i * 70;
      G.shape(
        i === 2 ? 'c' : 'C',
        WS.strand(
          ...along(24, 24, a, r),
          ...along(24, 24, a + 90, r * 1.2),
          ...along(24, 24, a + 200, r),
          1.6 * s,
          0.4,
        ),
        false,
      );
    }
    G.shape('c', WS.disc(24, 24, 1.2 * s), false);
  };
}
function windAfter(P, J, at, c) {
  if (c.pal.gray) return;
  const A = J.arms.f,
    o = c.opt;
  if (P.swirl) {
    const grow = P.swirl === 2 ? clamp((o.t < 14 ? o.t / 14 : (o.t - 30) / 14) || 0, 0, 1) : 1,
      s = P.swirl === 3 ? 0.8 : 0.7 + grow * 0.6,
      [x, y] = P.swirl === 3 ? at(24, 48) : at(...along(...A.elbow, A.a2, 9.4)),
      step = (frameCount >> 1) % 9;
    glow(x, y, 8 * s + 4, '#78e8f8', 0.4);
    drawNativeProp(
      c.style,
      NATIVE_CHARS.wind,
      'swirl' + s.toFixed(1) + '|' + step,
      windSwirl(step, s),
      x,
      y,
      c.pal,
      c.flip,
      c.big,
    );
  }
  if (P.burst) {
    const [x, y] = at(...along(...A.elbow, A.a2, 9));
    glow(x, y, 12, '#78e8f8', 0.8);
    circle(x, y, 3, '#effcff');
  }
  if (P.gale) {
    // the wind bursting out to both sides where she landed
    const t = clamp((o.landT || 0) / 12, 0, 1);
    for (const d of [-1, 1]) {
      const [x, y] = at(24 + d * (10 + (1 - t) * 10), 44);
      glow(x, y, 10, '#a8f0f8', 0.5 * t);
      R(x - 6, y, 12, 1, 'rgba(232,252,250,' + (0.8 * t).toFixed(2) + ')');
      R(x - 4, y - 3, 8, 1, 'rgba(232,252,250,' + (0.6 * t).toFixed(2) + ')');
    }
  }
}
NATIVE_CHARS.wind = {
  body: WIND_BODY,
  colors: pal => ncFixed(WINDER_TONES, pal),
  flat: 'KcCEIUWNMwz',
  hair: 'Z',
  skin: 'S',
  frame: windFrame,
  draw: windDraw,
  after: windAfter,
};
