'use strict';
// Sonique, boss of the sound stage, drawn natively (see js/chars.js): a pop-idol robot in magenta and pink armour with
// black accents and a short armoured skirt. Signature: big headphones with glowing speaker cones and a headset
// microphone, long magenta twin-tails, speaker-cone shoulder pads and speakers on her boots; the speakers pulse to a
// beat and musical notes float up round her. Every sonic boom bursts in a ring from her palm, sound waves ripple out of
// her mouth while she screams, and speed lines streak behind her dash. The face is the shared women's face
// (ncWomanFace).
// Letters: K outline, A magenta armour, P pink, B black accents, V silver, L speaker glow, l its white centre, Z hair,
// z hair shine, w gloss; S skin, eyes E I U W, N nose, M lips.
const SONIQUE_TONES = {
  K: '#14060e',
  A: '#a82a86',
  P: '#f6b2dc',
  B: '#221624',
  V: '#c8c2d8',
  L: '#ff62c6',
  l: '#ffe2f6',
  Z: '#ff62c0',
  z: '#ffc2e6',
  w: '#ffffff',
  S: '#f8dcc8',
  E: '#ffffff',
  I: '#7a3ad8',
  U: '#200a4a',
  W: '#ffffff',
  N: '#e0a898',
  M: '#e05a78',
};
const SONIQUE_BODY = { hipW: 2.4, shB: [19.2, 19.8], shF: [30, 20.2], upper: 3.6, fore: 4.6 };
const SONIQUE_GAIT = {
  stride: 58,
  stance: 0.26,
  hipW: 1,
  lift: 7,
  kick: 0.8,
  reach: 4.4,
  hip: 32.6,
  rise: 1.4,
  lean: 16,
  arm: 46,
  elbow: 84,
};
const SONIQUE_POSES = {
  stand: { legs: { b: [-24, -16, 0], f: [28, -4, 0] }, arms: { b: [-16, 18], f: [12, 46] }, lean: 2, flow: 0.15 },
  // the sonic boom: her palm thrust out as the ring leaves it
  boom: {
    legs: { b: [-38, -28, 0], f: [44, -8, 0] },
    arms: { b: [-24, 20], f: [90, 86] },
    lean: 6,
    flow: 0.5,
    ring: true,
  },
  aim: { legs: { b: [-34, -24, 0], f: [40, -6, 0] }, arms: { b: [-20, 26], f: [84, 80] }, lean: 4, flow: 0.4 },
  // the scream: arms flung back, leaning into the shout, her hair blown back by her own voice
  scream: {
    legs: { b: [-40, -30, 0], f: [44, -8, 0] },
    arms: { b: [-120, -100], f: [-100, -80] },
    lean: 8,
    flow: 1,
    face: 'shout',
    waves: true,
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
  // the 3x view and the portraits: a stage pose, one hand on the mic, the other thrown out
  action: { legs: { b: [-40, -32, 0], f: [48, -8, 0] }, arms: { b: [-10, 110], f: [100, 80] }, lean: 6, flow: 0.6 },
};
const _soniquePoses = {};
function soniquePose(id, wave = 0) {
  const key = id + '|' + wave;
  return (
    _soniquePoses[key] || (_soniquePoses[key] = ncPose(key, Object.assign({ wave: wave * 1.6 }, SONIQUE_POSES[id])))
  );
}
// the rings leave her palm every 14 ticks (b.arm 10 each; see BOSSES.sonic); the scream is the 'raise' pose (the pose
// hook), and the dash after tick 12 is the 'run' pose
function soniqueFrame(pose, fr, arm, big, opt) {
  // her twin-tails swing (four steps)
  const wave = big ? 0 : (frameCount >> 3) & 3;
  if (big || pose === 'action') return soniquePose('action');
  if (pose === 'hurt') return soniquePose('hurt');
  if (pose === 'raise') return soniquePose('scream', wave);
  if (pose === 'jump') return soniquePose(fr ? 'jumpF' : 'jumpR', wave);
  if (pose === 'run') {
    const n = 10,
      i = Math.floor(((fr * 1.4 * 2) / SONIQUE_GAIT.stride) * n) % n,
      key = 'run' + i;
    return (
      _soniquePoses[key] ||
      (_soniquePoses[key] = ncPose(
        key,
        Object.assign(ncGait(NC_BODY, SONIQUE_GAIT, i / n), { flow: 1, wave: (i & 3) * 1.6 }),
      ))
    );
  }
  if (opt.state === 'boom') return soniquePose(arm ? 'boom' : 'aim', wave);
  return soniquePose('stand', wave);
}

const SQ = NC_SHAPES;
const SONIQUE_LEG = {
  thigh: 'B',
  thighW: 3.6,
  boot: 'A',
  w0: 6,
  w1: 8.6,
  band: ['P', 2.2, 3.4, 7.6],
  sole: 'B',
  knee: ['P', 2.2, 0.6],
};
const SONIQUE_ARM = {
  upper: 'B',
  upperW: 2.8,
  glove: 'A',
  w0: 4.8,
  w1: 6.6,
  cuff: ['P', 3.4, 4.4, 6.8],
  fist: 'P',
  fistR: 2.6,
};
// a speaker: a black ring round a glowing cone with a white centre
function soniqueSpeaker(G, x, y, r) {
  G.shape('B', SQ.disc(x, y, r));
  G.shape('L', SQ.disc(x, y, r * 0.62), false);
  G.shape('l', SQ.disc(x, y, Math.max(0.5, r * 0.24)), false);
}
function soniqueLeg(G, L, B) {
  ncLeg(G, L, B, SONIQUE_LEG);
  soniqueSpeaker(G, ...along(...L.knee, L.a2, 4.2), 1.8); // the speaker on the boot
}
function soniquePad(G, sx, sy, far) {
  G.shape('A', SQ.ell(sx + (far ? -0.6 : 0.4), sy - 0.8, far ? 4 : 4.6, far ? 3.4 : 3.8));
  if (!far) soniqueSpeaker(G, sx + 0.6, sy - 0.8, 2.6);
}
// the twin-tails: two long locks from ties high on the back of her head, swinging (wave) and blown back (flow)
function soniqueTails(G, hx, hy, P) {
  const f = P.flow || 0,
    w = P.wave || 0;
  for (const [rx, ry, len] of [
    [-5.4, -5, 24],
    [-2, -7, 22],
  ]) {
    const x0 = hx + rx,
      y0 = hy + ry,
      sw = Math.sin(w + rx) * 1.6,
      tip = [x0 - 4 - f * (len * 0.9) + sw * f, y0 + len * (1 - f * 0.7) + sw * (1 - f) * 0.4],
      mid = [(x0 + tip[0]) / 2 - 4 * (1 - f) + sw, (y0 + tip[1]) / 2 + 2 * f];
    G.shape('Z', SQ.strand(x0, y0, ...mid, ...tip, 6, 1));
    G.paint('z', SQ.strand(x0 - 0.6, y0 + 1, mid[0] - 0.8, mid[1], ...tip, 1, 0.3), 'Z');
    G.shape('P', SQ.disc(x0, y0, 1.6)); // the hair tie
  }
}
function soniqueTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('B', Wa(SQ.poly([21.2, 24, 28, 24, 27.6, 29.4, 21.6, 29.4])));
  // a short armoured skirt flaring from the hips, pink with a magenta hem
  shape('P', Wa(SQ.poly([20.4, 28, 28.8, 28, 31.2, 33.4, 18, 33.4])));
  paint('A', Wa(SQ.poly([17.6, 32, 31.6, 32, 31.4, 33.4, 18, 33.4])), 'P');
  shape('B', Wa(SQ.bar(20.6, 28.6, 28.6, 28.6, 1)), false);
  shape('A', U(SQ.poly([17.4, 17.4, 31.6, 17.4, 31.2, 22.6, 27.8, 25.6, 21.6, 25.6, 17.8, 22.6])));
  shape('P', U(SQ.all(SQ.ell(21.8, 20.2, 3, 2.4), SQ.ell(27.6, 20.2, 3, 2.4))));
  shape('B', U(SQ.poly([20.4, 16.8, 29.8, 16.8, 28.4, 18.6, 25, 19.8, 21.8, 18.6])));
  soniqueSpeaker(G, ...J.up(24.7, 23.2), 1.5); // a small speaker in the middle of the chest
  shape('w', U(SQ.ell(20.8, 19.4, 1.3, 0.7)), false);
}
// the crown of her hair, the face, the fringe, and the headphones with the mic
function soniqueHead(G, J, P) {
  const { shape } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  shape('Z', SQ.ell(hx - 1.4, hy - 1, 7.6, 7.4));
  ncWomanFace(G, hx, hy, P.face);
  shape(
    'Z',
    SQ.all(
      SQ.ell(...o(2.6, -4.6), 6.6, 2.4),
      SQ.strand(...o(1.4, -5.6), ...o(2.4, -2.4), ...o(2.6, 0.6), 3.2, 0),
      SQ.strand(...o(4.8, -5.4), ...o(5.8, -2.6), ...o(6.4, -0.2), 3, 0),
      SQ.strand(...o(7.6, -4.6), ...o(8.8, -3), ...o(9.8, -1.4), 2.4, 0),
    ),
  );
  // the headband over the top of her head and the big cup over her ear
  shape('B', SQ.strand(...o(-2.4, 0), ...o(-1.6, -9.6), ...o(4.6, -8.2), 2, 1.6));
  shape('B', SQ.all(SQ.disc(...o(-3, 2.4), 3.4), SQ.rect(...o(-5, -1), 4, 2, 0.6)));
  shape('A', SQ.disc(...o(-3.2, 2.4), 2.2), false);
  shape('L', SQ.disc(...o(-3.2, 2.4), 1), false);
  // the headset microphone: a thin arm from the cup to her mouth
  shape('B', SQ.strand(...o(-0.4, 4.4), ...o(3, 8.2), ...o(7.4, 7.2), 0.9, 0.9));
  shape('L', SQ.disc(...o(7.8, 7), 0.9));
  shape('z', SQ.strand(...o(-4.6, -2.6), ...o(-6, 2), ...o(-5.4, 6.4), 1, 0.4), false);
}
function soniqueDraw(G, J, P) {
  const B = G.B,
    [hx, hy] = J.head;
  soniqueTails(G, hx, hy, P);
  soniquePad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, SONIQUE_ARM);
  soniqueLeg(G, J.legs.b, B);
  soniqueLeg(G, J.legs.f, B);
  soniqueTorso(G, J);
  ncArm(G, J.arms.f, SONIQUE_ARM);
  soniquePad(G, ...J.arms.f.sh, false);
  soniqueHead(G, J, P);
}
// a ring of sound: dots round a circle (pixel art, no anti-aliasing)
function soniqueRing(x, y, r, col, n = 12) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    circle(x + Math.cos(a) * r, y + Math.sin(a) * r, 0.5, col);
  }
}
// the beat in her speakers, the notes floating up, the ring bursting from her palm, the waves of her scream and the
// speed lines of her dash
function soniqueAfter(P, J, at, c) {
  if (c.pal.gray || c.opt.ghost) return; // no effects on a defeated Sonique or on the afterimages of her dash
  const A = J.arms.f,
    o = c.opt,
    [hx, hy] = J.head,
    beat = 1 - (frameCount % 16) / 16;
  for (const p of [at(hx - 3.2, hy + 2.4), at(...J.arms.f.sh)])
    glow(p[0], p[1] - 0.4, 4 + beat * 4, '#ff62c6', 0.2 + beat * 0.3);
  for (let i = 0; i < 2; i++) {
    const t = ((frameCount + i * 45) % 90) / 90,
      [nx, ny] = at(hx - 8 + i * 22, hy - 2);
    ctx.globalAlpha = 1 - t;
    const x = nx + Math.sin(t * 7 + i) * 1.5,
      y = ny - t * 14;
    circle(x, y, 0.9, i ? '#ff9ed8' : '#ffe2f6');
    R(x + 0.5, y - 3, 0.5, 3, i ? '#ff9ed8' : '#ffe2f6');
    R(x + 0.5, y - 3, 1.5, 0.5, i ? '#ff9ed8' : '#ffe2f6');
    ctx.globalAlpha = 1;
  }
  if (P.ring) {
    const [x, y] = at(...along(...A.elbow, A.a2, 9.6)),
      g = 1 - clamp((o.armT || 0) / 10, 0, 1);
    glow(x, y, 10, '#ff62c6', 0.6 * (1 - g));
    soniqueRing(x, y, 2 + g * 5, '#ffe2f6');
    soniqueRing(x, y, 1 + g * 3, '#ff62c6', 8);
  }
  if (P.waves) {
    const [mx, my] = at(hx + 10, hy + 6);
    for (let i = 0; i < 3; i++) {
      const r = 3 + ((frameCount * 0.5 + i * 4) % 12),
        n = 7;
      for (let j = 0; j < n; j++) {
        const a = ((j / (n - 1) - 0.5) * Math.PI) / 1.6,
          dir = c.flip ? -1 : 1;
        circle(mx + Math.cos(a) * r * dir, my + Math.sin(a) * r, 0.5, i & 1 ? '#ff9ed8' : '#ffe2f6');
      }
    }
  }
  if (o.state === 'dash' && o.t > 12)
    for (let i = 0; i < 4; i++) {
      const [x0, y] = at(14, 18 + i * 7),
        [x1] = at(14 - 8 - ((i * 5 + frameCount * 3) % 10), 0);
      ctx.globalAlpha = 0.6;
      R(Math.min(x0, x1), y, Math.abs(x1 - x0), 0.5, '#ffe2f6');
      ctx.globalAlpha = 1;
    }
}
NATIVE_CHARS.sonic = {
  body: SONIQUE_BODY,
  colors: pal => ncFixed(SONIQUE_TONES, pal),
  flat: 'KBLlwEIUWNMz',
  hair: 'Z',
  skin: 'S',
  frame: soniqueFrame,
  draw: soniqueDraw,
  after: soniqueAfter,
};
