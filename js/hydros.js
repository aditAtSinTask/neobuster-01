'use strict';
// Hydros, boss of the water stage, drawn natively (see js/chars.js): a sleek aquatic robot in blue armour with white
// plates and aqua fins. Signature: a tall shark fin on his helmet, fin-shaped ear guards, gill slits on his chest,
// fins on his forearms and calves, a glass water tank on his back with the water sloshing inside, and the Hydro Blast
// cannon over his forearm, always dripping; it bursts into spray with every jet, blows a big bubble before the bubbles
// and a crown of water splashes up where he lands. The face is the shared men's face (ncManFace), scowling.
// Letters: K outline, A blue armour, a aqua fins and trim, V white plates, J navy inner suit, D dark metal, G cyan gems,
// C water, c its highlight, w gloss; S skin, eyes E I U W, N nose, M mouth.
const HYDROS_TONES = {
  K: '#06101e',
  A: '#1c72d2',
  a: '#74d4f2',
  V: '#e8f4fa',
  J: '#1c3a62',
  D: '#14203a',
  G: '#54e6f8',
  C: '#3cc4f0',
  c: '#dcf8ff',
  w: '#ffffff',
  S: '#f6d2aa',
  E: '#ffffff',
  I: '#2a98e6',
  U: '#0a2a5c',
  W: '#ffffff',
  N: '#d6966e',
  M: '#8a3434',
};
const HYDROS_POSES = {
  // the cannon held low and forward, the other fist ready
  stand: { legs: { b: [-32, -22, 0], f: [36, -6, 0] }, arms: { b: [-12, 34], f: [24, 58] }, lean: 3 },
  // the water jets: the cannon aimed, rocking back as each jet leaves it
  aim: { legs: { b: [-36, -26, 0], f: [42, -8, 0] }, arms: { b: [-8, 70], f: [88, 90] }, lean: 5 },
  fire: {
    legs: { b: [-40, -30, 0], f: [46, -8, 0] },
    arms: { b: [-18, 40], f: [92, 92] },
    lean: -1,
    dx: -1,
    spray: true,
  },
  // the bubbles: the cannon raised, a big bubble swelling at its nozzle
  bubble: { legs: { b: [-30, -22, 0], f: [36, -6, 0] }, arms: { b: [-16, 30], f: [140, 150] }, lean: -2, bubble: true },
  jumpR: { legs: { b: [-14, -44, -25], f: [76, -2, -10] }, arms: { b: [-44, -4], f: [120, 150] }, air: true },
  jumpF: { legs: { b: [-8, -24, -15], f: [34, 4, -5] }, arms: { b: [-72, -42], f: [96, 120] }, air: true },
  // landing from the tide leap: a deep crouch in a crown of water
  land: {
    legs: { b: [-62, 22, 0], f: [70, -20, 0] },
    arms: { b: [-40, -10], f: [40, 20] },
    bend: 18,
    lean: 4,
    splash: true,
  },
  hurt: {
    legs: { b: [-44, -6, 10], f: [40, 46, 10] },
    arms: { b: [-130, -160], f: [120, 150] },
    lean: -16,
    dy: 2,
    face: 'hurt',
  },
  // the 3x view and the portraits: a wide stance, the cannon aimed
  action: { legs: { b: [-42, -34, 0], f: [50, -8, 0] }, arms: { b: [-12, 100], f: [86, 88] }, lean: 6 },
};
const _hydrosPoses = {};
function hydrosPose(id, breath = 0) {
  const key = id + (breath ? '|' + breath : '');
  return (
    _hydrosPoses[key] || (_hydrosPoses[key] = ncPose(key, Object.assign({ face: 'angry', breath }, HYDROS_POSES[id])))
  );
}
// the jets leave the cannon every 12 ticks (b.arm 10 each; see BOSSES.hydro): it rocks back for the first ticks of each
// and stays aimed between them; the bubble swells at the raised cannon until it is blown at tick 10
function hydrosFrame(pose, fr, arm, big, opt) {
  if (big || pose === 'action') return hydrosPose('action');
  if (pose === 'hurt') return hydrosPose('hurt');
  if (pose === 'jump') return hydrosPose(fr ? 'jumpF' : 'jumpR');
  if (opt.landT > 0) return hydrosPose('land');
  if (opt.state === 'blast') return hydrosPose(arm && opt.armT > 6 ? 'fire' : 'aim');
  if (opt.state === 'bubbles' && (opt.t < 10 || arm)) return hydrosPose('bubble');
  // breathing: the chest and head sink a fine pixel and come back up
  return hydrosPose('stand', big ? 0 : [0, 0.5, 1, 0.5][(frameCount >> 4) & 3]);
}

const HY = NC_SHAPES;
const HYDROS_LEG = {
  thigh: 'J',
  thighW: 4.2,
  boot: 'A',
  w0: 7,
  w1: 9.8,
  band: ['a', 2.2, 3.2, 8.2],
  sole: 'D',
  knee: ['V', 2.6, 0.6],
  shine: 'w',
};
const HYDROS_ARM = { upper: 'J', glove: 'A', w0: 5.4, w1: 7.2, cuff: ['a', 3.6, 4.6, 7.6], fist: 'V', fistR: 2.9 };
// a fin: a curved blade from a root on a limb, sweeping back
const hydrosFin = (x, y, a, len, w) =>
  HY.strand(x, y, ...along(x, y, a - 14, len * 0.6), ...along(x, y, a + 8, len), w, 0);
function hydrosLeg(G, L, B) {
  ncLeg(G, L, B, HYDROS_LEG);
  G.shape('a', hydrosFin(...along(...L.knee, L.a2, 2.2), L.a2 + 150, 6.4, 3.6)); // calf fin
}
function hydrosPad(G, sx, sy, far) {
  // a rounded pad with a fin standing up and back from it
  G.shape('a', hydrosFin(sx - 1, sy - 2.6, 205, far ? 6.6 : 7.6, 3.4));
  G.shape('A', HY.ell(sx + (far ? -0.6 : 0.4), sy - 1, far ? 4.4 : 4.8, far ? 3.8 : 4.2));
  if (far) return;
  G.shape('V', HY.strand(sx - 4.4, sy + 0.6, sx + 0.4, sy + 3.8, sx + 5.2, sy + 0.4, 1.2, 1.2), false);
  G.shape('w', HY.ell(sx - 1.2, sy - 3, 1.6, 0.8), false);
}
// the Hydro Blast: a blue cannon over the forearm with a white nozzle and a hose back to the tank
function hydrosCannon(G, A) {
  const { shape } = G,
    [ex, ey] = A.elbow,
    p = d => along(ex, ey, A.a2, d);
  shape('J', HY.cap(...A.sh, ex, ey, 3.2));
  shape('a', hydrosFin(...p(2), A.a2 + 160, 5.4, 3)); // the forearm fin, over the top of the cannon
  shape('A', HY.cap(...p(0.4), ...p(8.6), 8.4));
  shape('a', HY.bar(...p(3.2), ...p(4.4), 8.4), false);
  shape('V', HY.all(HY.cap(...p(8), ...p(10.4), 6.4), HY.disc(...p(11), 3.2)));
  shape('D', HY.disc(...p(11.4), 2), false);
  shape('C', HY.disc(...p(11.6), 1.2), false);
  shape('w', HY.cap(...along(...p(1.2), A.a2 + 90, 2.6), ...along(...p(7.2), A.a2 + 90, 2.6), 1), false);
}
function hydrosTorso(G, J) {
  const { shape, paint } = G,
    U = J.upper,
    Wa = J.waist;
  shape('J', Wa(HY.poly([20.8, 24.8, 28.2, 24.8, 27.8, 29.4, 21.2, 29.4]))); // inner suit at the waist
  shape('A', Wa(HY.poly([19.4, 29, 29.4, 29, 29, 31.4, 26.4, 33, 22.4, 33, 19.8, 31.4]))); // hip armour
  shape('V', Wa(HY.bar(19.6, 29.4, 29.2, 29.4, 1.1)), false);
  shape('G', Wa(HY.disc(24.4, 30.6, 1.1)), false);
  shape('A', U(HY.poly([15.6, 17.4, 33, 17.4, 32.6, 22.6, 28.6, 26, 21, 26, 16, 22.6]))); // chest
  // gill slits down the side of the chest
  paint(
    'D',
    U(
      HY.all(HY.cap(17.4, 19.4, 19.4, 21.2, 0.7), HY.cap(17.4, 21.2, 19.4, 23, 0.7), HY.cap(17.6, 23, 19.6, 24.6, 0.7)),
    ),
    'A',
  );
  shape('V', U(HY.poly([20.4, 16.8, 29.8, 16.8, 28.4, 18.6, 25, 20, 21.8, 18.6]))); // white collar
  shape('G', U(HY.poly([25.2, 20.6, 27, 22.4, 25.2, 24.6, 23.4, 22.4]))); // the cyan gem
  shape('w', U(HY.disc(24.8, 21.6, 0.5)), false);
}
function hydrosHead(G, J, P) {
  const { shape, paint } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y];
  // the dorsal fin: tall and swept back like a shark's, its leading edge white
  shape('a', HY.poly([...o(3.6, -6.6), ...o(0.6, -12.6), ...o(-4.8, -17.6), ...o(-4.4, -11.4), ...o(-7, -5.4)]));
  paint('V', HY.strand(...o(3, -7.4), ...o(0.4, -12.6), ...o(-4.2, -16.6), 1.2, 0.4), 'a');
  shape('A', HY.disc(hx - 0.6, hy - 0.8, 8)); // helmet
  ncManFace(G, hx, hy, P.face);
  // the helmet's rim over the brow, a gem in it, and the fin-shaped guard over the ear
  shape('A', HY.poly([...o(-0.8, -5.8), ...o(9.4, -5.6), ...o(9.8, -3.4), ...o(5, -2.8), ...o(-0.6, -3.2)]));
  shape('G', HY.disc(...o(5.4, -4.4), 1.2), false);
  shape('a', HY.all(HY.disc(...o(-2.6, 2), 2.8), hydrosFin(...o(-3.6, 1.4), 238, 6.6, 3.6)));
  shape('G', HY.disc(...o(-2.6, 2), 1.2), false);
  shape('w', HY.ell(...o(-4.4, -4.6), 1.8, 1), false);
}
function hydrosDraw(G, J, P) {
  const B = G.B;
  hydrosPad(G, ...J.arms.b.sh, true);
  ncArm(G, J.arms.b, HYDROS_ARM);
  hydrosLeg(G, J.legs.b, B);
  hydrosLeg(G, J.legs.f, B);
  hydrosTorso(G, J);
  hydrosCannon(G, J.arms.f);
  hydrosPad(G, ...J.arms.f.sh, false);
  hydrosHead(G, J, P);
}
// the water tank on his back (base on box point 24, 24): a dark frame round glass, the water level rocking (step)
function hydrosTank(step) {
  return G => {
    const lv = [0, 0.6, 1, 0.6][step];
    G.shape('D', HY.rect(20.6, 18, 6.8, 12, 2.2));
    G.shape('J', HY.rect(21.6, 19.2, 4.8, 9.6, 1.6), false);
    G.shape('C', HY.poly([21.6, 22.6 + lv, 26.4, 22.6 - lv, 26.4, 28.8, 21.6, 28.8]), false);
    G.shape(
      'c',
      HY.all(HY.cap(22.4, 22.6 + lv * 0.8, 25.6, 22.6 - lv * 0.8, 0.6), HY.disc(23.6, 26.6 - step * 0.8, 0.7)),
      false,
    );
    G.shape('a', HY.rect(22.4, 16.8, 3.2, 1.8, 0.6));
  };
}
function hydrosBefore(P, J, at, c) {
  const step = (frameCount >> 3) & 3,
    [x, y] = at(...J.up(16.6, 21.6));
  drawNativeProp(c.style, NATIVE_CHARS.hydro, 'tank' + step, hydrosTank(step), x, y, c.pal, c.flip, c.big);
}
// water drips from the nozzle, spray bursts with the jets, the bubble swells, a crown of water when he lands
function hydrosAfter(P, J, at, c) {
  if (c.pal.gray) return;
  const A = J.arms.f,
    o = c.opt,
    [nx, ny] = at(...along(...A.elbow, A.a2, 12));
  for (let i = 0; i < 2; i++) {
    const t = (frameCount + i * 23) % 40;
    if (t < 24) circle(nx + (i ? 0.5 : -0.5), ny + 1 + t * 0.32, 0.5, i ? '#8ee8fc' : '#dcf8ff');
  }
  if (P.spray) {
    glow(nx, ny, 10, '#58d0f8', 0.6);
    for (let i = -1; i <= 1; i++) {
      const [sx, sy] = at(...along(...A.elbow, A.a2 + i * 22, 15.4));
      R(Math.min(nx, sx), Math.min(ny, sy), Math.abs(sx - nx) + 1, 1, '#dcf8ff');
    }
    circle(nx, ny, 2.2, '#effcff');
  }
  if (P.bubble) {
    const g = clamp((o.t || 0) / 10, 0, 1),
      r = 1.4 + g * 3.2,
      [bx, by] = at(...along(...A.elbow, A.a2, 12 + r * 2));
    ctx.globalAlpha = 0.45;
    circle(bx, by, r, '#8ee4fc');
    ctx.globalAlpha = 1;
    circle(bx - r * 0.4, by - r * 0.4, Math.max(0.5, r * 0.22), '#ffffff');
  }
  if (P.splash) {
    // the crown: droplets flung out and up to both sides, falling back as the landing passes
    const t = 1 - clamp((o.landT || 0) / 12, 0, 1);
    for (const d of [-1, 1])
      for (let i = 0; i < 4; i++) {
        const [x, y] = at(
          24 + d * (6 + i * 3 + t * 8),
          47 - (5 + i * 2) * Math.sin(Math.PI * Math.min(1, t * 1.4 + i * 0.1)),
        );
        circle(x, y, 0.8 - i * 0.1, i & 1 ? '#8ee8fc' : '#dcf8ff');
      }
    const [gx, gy] = at(24, 47);
    glow(gx, gy, 14, '#58d0f8', 0.35 * (1 - t));
  }
}
NATIVE_CHARS.hydro = {
  colors: pal => ncFixed(HYDROS_TONES, pal),
  flat: 'KDcwEIUWNM',
  skin: 'S',
  frame: hydrosFrame,
  draw: hydrosDraw,
  before: hydrosBefore,
  after: hydrosAfter,
};
