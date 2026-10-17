'use strict';
// Nexo, the hero, drawn natively after his character sheet (see js/characters/chars.js): spiky brown hair, an anime face with
// big blue eyes, royal blue armour with gold trim, a gold wing emblem on the chest, round shoulder pads with a blue fin,
// a steel blue inner suit, big gauntlets and boots, and the Neo Buster on his arm.
// Letters: K outline, A armour, J inner suit, Y gold, D dark metal, R the buster's red light, w gloss, S skin, Z hair,
// z hair shine; the eyes E white, I iris, U pupil, W glint, N nose shadow, M mouth; G gloves and buster, F boots.
// A special weapon recolours only his hair, gloves, buster and boots.

const NEXO_TONES = {
  K: '#06081a',
  A: '#2457d0',
  J: '#6684bc',
  Y: '#f2c23c',
  D: '#1c2236',
  R: '#f8283c',
  w: '#d6e6ff',
  S: '#f9d6a6',
  Z: '#7c3a26',
  z: '#c47446',
  E: '#f6f9ff',
  I: '#3a7ae6',
  U: '#0c1850',
  W: '#ffffff',
  N: '#d8946c',
  M: '#a83c34',
};
function nexoColors(pal) {
  const c = Object.assign({}, NEXO_TONES);
  if (pal.B === PAL_HERO.B && pal.b === PAL_HERO.b) c.G = c.F = c.A;
  else {
    c.G = c.F = c.Z = pal.B;
    c.z = mixHex(pal.B, pal.b, 0.6);
  }
  return ncFixed(c, pal);
}

const NEXO_GAIT = {
  stride: 54,
  stance: 0.28,
  hipW: 1,
  lift: 7,
  kick: 0.7,
  reach: 4.4,
  hip: 33,
  sink: 0.6,
  rise: 1.2,
  lean: 15,
  arm: 40,
  elbow: 90,
};
// the frames
const NEXO_POSES = {
  // the stance of the X games: back leg out behind, front knee bent forward, fists ready
  stand: { legs: { b: [-32, -22, 0], f: [36, -6, 0] }, arms: { b: [-12, 34], f: [14, 70] }, lean: 3 },
  shoot: { legs: { b: [-32, -24, 0], f: [40, -8, 0] }, arms: { b: [10, 104], f: [86, 88] }, lean: 4, gun: true },
  // rising: front knee up, the other leg trailing, a fist thrown up; falling: legs reaching for the floor
  jumpR: { legs: { b: [-14, -44, -25], f: [76, -2, -10] }, arms: { b: [-44, -4], f: [142, 172] }, air: true },
  jumpF: { legs: { b: [-8, -24, -15], f: [34, 4, -5] }, arms: { b: [-72, -42], f: [96, 120] }, air: true },
  // the dash: low and leaning far forward, the back leg stretched out behind
  slide: { legs: { b: [-74, -96, -20], f: [78, 6, 0] }, arms: { b: [-60, -20], f: [40, 90] }, lean: 30, dx: 1 },
  // the air dash (shop part): flying level and leaning far forward, the back leg stretched out behind, the front knee
  // tucked up, the arms swept back
  dash: { legs: { b: [-66, -92, -24], f: [84, 20, 6] }, arms: { b: [-90, -70], f: [-60, -30] }, lean: 36, air: true },
  // knocked back: arched, arms flung out
  hurt: {
    legs: { b: [-30, -8, 10], f: [26, 36, 10] },
    arms: { b: [-130, -160], f: [120, 150] },
    lean: -14,
    face: 'hurt',
  },
  // the 3x view and the portraits: a wide stance aiming the buster
  action: { legs: { b: [-42, -34, 0], f: [50, -8, 0] }, arms: { b: [-14, 92], f: [86, 88] }, lean: 6, gun: true },
};
// climbing, seen from behind: reaching up with one hand, the other knee raised (the back view has the body centred,
// the limbs to each side: negative angles swing to the left)
const NEXO_BACK = { shB: [17.2, 21.6], shF: [30.8, 21.6], hipW: 3.2, head: [24, 12.4] };
const NEXO_CLIMB = [
  { arms: { b: [-168, -178], f: [30, 12] }, legs: { b: [-4, 0, 0], f: [58, -12, 0] } },
  { arms: { b: [-120, -150], f: [80, 130] }, legs: { b: [-16, -6, 0], f: [30, -4, 0] } },
  { arms: { b: [-30, -12], f: [168, 178] }, legs: { b: [-58, 12, 0], f: [4, 0, 0] } },
  { arms: { b: [-80, -130], f: [120, 150] }, legs: { b: [-30, 4, 0], f: [16, 6, 0] } },
];
const _nexoPoses = {};
// a cached pose: make() builds it the first time its id is asked for
function nexoPose(id, make) {
  return _nexoPoses[id] || (_nexoPoses[id] = ncPose(id, make()));
}
const withGun = p => Object.assign({}, p, { arms: { b: p.arms.b, f: [86, 88] }, gun: true });
function nexoFrame(pose, fr, arm, big) {
  const P = NEXO_POSES;
  if (pose === 'action' || (big && arm)) return nexoPose('action', () => P.action);
  if (pose === 'hurt') return nexoPose('hurt', () => P.hurt);
  if (pose === 'slide') return arm ? nexoPose('slideG', () => withGun(P.slide)) : nexoPose('slide', () => P.slide);
  if (pose === 'dash') return arm ? nexoPose('dashG', () => withGun(P.dash)) : nexoPose('dash', () => P.dash);
  if (pose === 'climb') {
    if (arm) return nexoPose('climbG', () => Object.assign({}, P.shoot, { legs: { b: [-6, -2, 0], f: [56, -10, 0] } }));
    const i = fr % 4;
    return nexoPose('climb' + i, () => Object.assign({ back: true, body: NEXO_BACK }, NEXO_CLIMB[i]));
  }
  if (pose === 'jump') {
    const id = fr ? 'jumpF' : 'jumpR';
    return arm ? nexoPose(id + 'G', () => withGun(P[id])) : nexoPose(id, () => P[id]);
  }
  if (pose === 'run') {
    // the cycle advances with the distance run (fr counts 1.4 px steps); ten frames a stride
    const n = 10,
      i = Math.floor(((fr * 1.4 * 2) / NEXO_GAIT.stride) * n) % n,
      run = () => ncGait(NC_BODY, NEXO_GAIT, i / n);
    return arm ? nexoPose('runG' + i, () => withGun(run())) : nexoPose('run' + i, run);
  }
  if (arm) return nexoPose('shoot', () => P.shoot);
  // breathing: the chest and head sink a fine pixel and come back up
  const i = big ? 0 : (frameCount >> 4) & 3;
  return nexoPose('stand' + i, () => Object.assign({ breath: [0, 0.5, 1, 0.5][i] }, P.stand));
}

// ---------- parts ----------
const NS = NC_SHAPES;
function nexoLeg(G, L, B) {
  const { shape } = G,
    [hx, hy] = L.hip,
    [kx, ky] = L.knee,
    [ax, ay] = L.ankle,
    f = L.foot;
  shape('J', NS.cap(hx, hy, kx, ky, 4.4)); // thigh
  // the boot: widening from under the knee to the ankle, then a long rounded foot
  shape(
    'F',
    NS.all(
      NS.taper(kx, ky, ax, ay, 7, 9.6),
      NS.poly([
        ...f(-5, -1),
        ...f(2.6, -1.8),
        ...f(6.4, 0.4),
        ...f(B.toe + 0.2, 2.8),
        ...f(B.toe, B.ankleH),
        ...f(-B.heel, B.ankleH),
        ...f(-B.heel - 0.6, 1.6),
      ]),
    ),
  );
  shape('Y', NS.bar(...along(kx, ky, L.a2, 2.2), ...along(kx, ky, L.a2, 3.2), 8.2), false); // gold ring round the boot top
  shape(
    'D',
    NS.poly([
      ...f(-B.heel, B.ankleH - 1),
      ...f(B.toe - 0.2, B.ankleH - 1),
      ...f(B.toe, B.ankleH),
      ...f(-B.heel, B.ankleH),
    ]),
    false,
  ); // sole
  shape('Y', NS.poly([...f(4, 0), ...f(6.4, 0.8), ...f(5, 2.4)]), false); // gold toe trim
  const [px, py] = along(kx, ky, L.a2, 0.8);
  shape('F', NS.disc(px, py, 2.6)); // knee
  shape('w', NS.ell(px - 0.8, py - 0.9, 0.9, 0.6), false);
}
function nexoPad(G, sx, sy, far) {
  const { shape } = G;
  // a round pad with a blue fin standing up behind it, and a gold rim
  if (far) return shape('A', NS.all(NS.ell(sx - 0.6, sy - 1.2, 5, 4.4), NS.spike(sx - 2.2, sy - 4, 208, 6.4, 4.4)));
  shape('A', NS.all(NS.ell(sx + 0.6, sy - 1.6, 5.4, 4.6), NS.spike(sx - 1.6, sy - 4.4, 198, 6.4, 4.6)));
  shape('Y', NS.strand(sx - 4.8, sy + 0.6, sx + 0.6, sy + 4.2, sx + 5.8, sy + 0.2, 1, 1), false);
  shape('w', NS.ell(sx - 1.2, sy - 3.6, 1.8, 1), false);
}
function nexoArm(G, A, front) {
  const { shape } = G,
    [sx, sy] = A.sh,
    [ex, ey] = A.elbow,
    [wx, wy] = A.wrist,
    [hx, hy] = A.hand;
  if (!front) nexoPad(G, sx, sy, true); // the far pad, half behind the chest
  shape('J', NS.cap(sx, sy, ex, ey, 3.2)); // upper arm
  shape('G', NS.taper(...along(ex, ey, A.a2, -0.6), wx, wy, 5.6, 7.4)); // gauntlet
  shape('Y', NS.bar(...along(ex, ey, A.a2, 3.6), ...along(ex, ey, A.a2, 4.6), 7.8), false); // gold cuff
  shape('G', NS.disc(hx, hy, 3)); // fist
  if (front) nexoPad(G, sx, sy);
}
function nexoBuster(G, A) {
  const { shape } = G,
    [sx, sy] = A.sh,
    [ex, ey] = A.elbow,
    p = d => along(ex, ey, A.a2, d);
  shape('J', NS.cap(sx, sy, ex, ey, 3.2));
  shape('G', NS.all(NS.cap(...p(0.6), ...p(8), 8.6), NS.cap(...p(7), ...p(11.6), 9.8))); // the cannon over the forearm
  shape('Y', NS.bar(...p(4), ...p(5.8), 8.6), false); // gold band
  shape('Y', NS.bar(...along(...p(7.6), A.a2 + 90, 2.6), ...along(...p(10.2), A.a2 + 90, 2.6), 1.8), false); // gold vent
  shape('D', NS.disc(...p(12.4), 3.6)); // muzzle
  shape('R', NS.disc(...p(12.9), 1.8), false);
  shape('w', NS.cap(...along(...p(1.6), A.a2 + 90, 2.6), ...along(...p(6.6), A.a2 + 90, 2.6), 1), false);
  nexoPad(G, sx, sy);
}
function nexoTorso(G, J) {
  const { shape } = G,
    U = J.upper,
    Wa = J.waist;
  shape('J', Wa(NS.poly([20.8, 24.8, 28.2, 24.8, 27.8, 29.4, 21.2, 29.4]))); // inner suit at the waist
  shape('A', Wa(NS.poly([19.6, 29, 29.2, 29, 28.8, 31, 26.2, 32.4, 22.6, 32.4, 20, 31]))); // hip armour
  shape('Y', Wa(NS.bar(19.6, 29.4, 29.2, 29.4, 1.1)), false); // gold belt
  shape('Y', Wa(NS.poly([22.6, 29, 27, 29, 24.8, 31.4]))); // gold buckle
  shape('A', Wa(NS.poly([22.8, 25.6, 26.6, 25.6, 26.2, 28, 23.2, 28]))); // abdomen plate
  shape('A', U(NS.poly([15.6, 17.4, 33, 17.4, 32.6, 22.6, 28.6, 26, 21, 26, 16, 22.6]))); // chest
  shape('Y', U(NS.poly([20.4, 16.8, 29.8, 16.8, 28.4, 18.6, 25, 20, 21.8, 18.6]))); // gold collar
  // the gold wing emblem: a diamond with a wing to each side
  shape(
    'Y',
    U(
      NS.all(
        NS.poly([25.4, 20.6, 27, 22.2, 25.4, 23.8, 23.8, 22.2]),
        NS.poly([24.2, 21.8, 19.2, 20, 20, 22.2, 24, 23]),
        NS.poly([26.6, 21.8, 31.4, 20, 30.8, 22.2, 26.8, 23]),
      ),
    ),
  );
  shape('w', U(NS.ell(19.6, 19.2, 1.8, 0.8)), false);
}
function nexoHead(G, J, P) {
  const { shape } = G,
    [hx, hy] = J.head,
    o = (x, y) => [hx + x, hy + y],
    lock = (x0, y0, cx, cy, x1, y1, w) => NS.strand(...o(x0, y0), ...o(cx, cy), ...o(x1, y1), w, 0);
  // the hair behind the face: the crown, and spikes sweeping up and back
  shape(
    'Z',
    NS.all(
      NS.ell(hx - 0.8, hy - 1.2, 8.6, 8),
      lock(4.6, -6.2, 7, -8.6, 10.6, -9, 4.6),
      lock(1, -7.4, 2, -10.2, 4.6, -11.4, 5.6),
      lock(-3, -6.8, -4.2, -9.8, -4, -12, 5.6),
      lock(-6.2, -4, -8.6, -6.4, -11, -7.2, 5.2),
      lock(-7.6, 0, -10, 0, -11.8, 1.6, 4.6),
      lock(-6.4, 4, -8.4, 5.8, -9, 8.4, 4),
    ),
  );
  // the face: a wide forehead, the cheek down to a pointed chin and the nose at the front edge (three-quarter view)
  shape(
    'S',
    NS.poly([
      ...o(-1, -3.6),
      ...o(8.6, -3.6),
      ...o(9.2, 2.2),
      ...o(10.2, 3.8),
      ...o(9.3, 4.5),
      ...o(9.1, 6),
      ...o(7.2, 8.4),
      ...o(4.4, 8.6),
      ...o(1.2, 7),
      ...o(-1, 5),
    ]),
  );
  shape('S', NS.ell(...o(-2.2, 2.8), 1.8, 2.4)); // ear
  // the fringe: sharp locks falling over the forehead, and one in front of the ear
  shape(
    'Z',
    NS.all(
      lock(0.4, -6.4, 1.6, -3, 1.8, 0.6, 3.4),
      lock(2.8, -6.6, 4, -3.4, 4.4, -0.4, 3.2),
      lock(5.2, -6.2, 6.6, -3.2, 7, 0.4, 3),
      lock(7.4, -5.4, 8.8, -3.8, 10, -1.8, 2.6),
      lock(-0.8, -3.4, -0.8, 1.4, 0, 5, 2.8),
    ),
  );
  shape('z', lock(-5, -5.4, -1.8, -9, 3, -8.6, 1.4), false); // shine
  shape('z', lock(-8, -1.4, -7.4, -4.6, -4.4, -6.4, 1.2), false);
  ncFace(G, NC_MALE_FACES, hx, hy, P.face);
}
// climbing: seen from behind
function nexoBack(G, J) {
  const { shape } = G,
    [hx, hy] = J.head;
  for (const s of ['b', 'f']) {
    const L = J.legs[s];
    shape('J', NS.cap(...L.hip, ...L.knee, 4.4));
    shape('F', NS.all(NS.taper(...L.knee, ...L.ankle, 7, 9), NS.ell(L.ankle[0], L.ankle[1] + 2.4, 4.6, 2.8)));
    shape('Y', NS.bar(...along(...L.knee, L.a2, 2.2), ...along(...L.knee, L.a2, 3.2), 7.6), false);
  }
  shape('A', NS.poly([19.4, 26.4, 28.6, 26.4, 28.2, 30.4, 19.8, 30.4])); // hips
  shape('J', NS.rect(21.6, 22.6, 4.8, 4.4, 1)); // waist
  shape('A', NS.poly([17, 16.4, 31, 16.4, 30.4, 21.4, 27.2, 24, 20.8, 24, 17.6, 21.4])); // back plate
  shape('D', NS.rect(21.6, 17.8, 4.8, 4, 1.2)); // the back of the armour: a dark vent
  for (const s of ['b', 'f']) shape('A', NS.ell(J.arms[s].sh[0], J.arms[s].sh[1] - 0.6, 3.8, 3.4)); // pads
  // the back of the head: all hair
  shape(
    'Z',
    NS.all(
      NS.ell(hx, hy - 0.4, 7, 7),
      NS.strand(hx - 4, hy - 4, hx - 6, hy - 8, hx - 6.6, hy - 10.6, 4.6, 0),
      NS.strand(hx, hy - 6, hx + 0.4, hy - 9.4, hx + 1.2, hy - 11.4, 4.6, 0),
      NS.strand(hx + 4, hy - 4, hx + 6, hy - 8, hx + 6.6, hy - 10.6, 4.6, 0),
      NS.strand(hx - 6, hy + 1, hx - 9, hy + 1, hx - 10.6, hy + 3, 4, 0),
      NS.strand(hx + 6, hy + 1, hx + 9, hy + 1, hx + 10.6, hy + 3, 4, 0),
      NS.strand(hx - 2.6, hy + 5.4, hx - 3.6, hy + 8, hx - 3.2, hy + 10, 3.4, 0),
      NS.strand(hx + 2.6, hy + 5.4, hx + 3.6, hy + 8, hx + 3.2, hy + 10, 3.4, 0),
    ),
  );
  shape('z', NS.strand(hx - 4, hy - 2.4, hx - 2, hy - 6, hx + 2.6, hy - 5.4, 1.2, 0), false);
  for (const s of ['b', 'f']) {
    const A = J.arms[s];
    shape('J', NS.cap(...A.sh, ...A.elbow, 3.2));
    shape('G', NS.taper(...A.elbow, ...A.wrist, 5.6, 7.2));
    shape('Y', NS.bar(...along(...A.elbow, A.a2, 3.6), ...along(...A.elbow, A.a2, 4.6), 7.6), false);
    shape('G', NS.disc(...A.hand, 3));
  }
}
function nexoDraw(G, J, P) {
  if (P.back) return nexoBack(G, J);
  nexoArm(G, J.arms.b, false);
  nexoLeg(G, J.legs.b, G.B);
  nexoLeg(G, J.legs.f, G.B);
  nexoTorso(G, J);
  if (P.gun) nexoBuster(G, J.arms.f);
  else nexoArm(G, J.arms.f, true);
  nexoHead(G, J, P);
}
NATIVE_CHARS.hero = {
  colors: nexoColors,
  flat: 'KEIUWNMRwDz',
  hair: 'Z',
  skin: 'S',
  frame: nexoFrame,
  draw: nexoDraw,
};
