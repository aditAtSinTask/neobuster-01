'use strict';
// Art: robot sprites (hero + bosses on a shared rig), themed parallax backgrounds and tilesets, weapon icons.

const SKIN = '#fcd8a8';
const PAL_HERO = { B: '#303e74', b: '#5e78aa', S: SKIN }; // Nexo's blue armour
const PAL_MID = { B: '#00a800', b: '#b8f818', S: SKIN };
const PAL_FULL = { B: '#3cbcfc', b: '#fcfcfc', S: '#fcfcfc' };
const PAL_WHITE = { B: '#fcfcfc', b: '#fcfcfc', S: '#fcfcfc' };

// ---------- content registries (filled by the base game and by continent files such as js/vespera.js) ----------
// ROBOT_STYLES[style]: the look of a boss on the robot rig (see below); WEAPON_ICONS[key]() draws a 10x10 weapon
// icon at the origin; AMBIENTS[type] = { n, update(q), draw(q, x, y) }; ROOM_FX[theme](rx, ry) animates a boss
// room; POST_FX[theme]() draws over the world (e.g. darkness); PAD_DRAW[theme](sx, sy) skins updraft pads;
// LIQUID[theme] = [base, crest, foam] recolours '~' tiles; PLAT_COL[theme] is the moving-platform colour.
const ROBOT_STYLES = {},
  WEAPON_ICONS = {},
  AMBIENTS = {},
  ROOM_FX = {},
  POST_FX = {},
  PAD_DRAW = {},
  LIQUID = {};
const PLAT_COL = {
  cut: '#d8a020',
  fire: '#7a7a88',
  elec: '#5868a0',
  snow: '#a8e0f8',
  earth: '#9a7a50',
  wind: '#e8f0f8',
};

// ---------- robot rig ----------
// drawRobot(ox, oy, facing, pose, frame, shooting, pal, style, opt) draws a robot in a 24 x 24 box (feet at
// oy + 24). The box is a 48 x 48 grid of fine pixels. A character is a skeleton of parts drawn with simple shapes
// (circles, ellipses, capsules, polygons) rasterised without anti-aliasing. Each part gets a 1-pixel black outline
// as it is stamped, so every limb and piece of armour is separated by a dark line like classic 8-bit robot
// sprites; each region is then lit from the top left. Arms and legs bend at shoulders, elbows, hips and knees, so
// a pose is just angles. The face is a pixel map stamped on top.
// Letters: H armour (pal.B), h inner suit (pal.b), L white plates, A gold trim, O core, D grey metal, G ear disc and
// muzzle, w shine, S skin, E eye white, I iris, W glint,
// n nose, P blush, U pupil, K black (inner outlines take a dark shade of the part they outline),
// M mouth, k muzzle, G forehead gem, Z hair, Q skirt, X/Y/V extra colours of a style.
//
// ROBOT_STYLES[style] = { female, angry, hair, skirt, colors: { X, Y, V, E, U, I, G, L, A }, crest, anim(): frame for animated
//   looks, back(R), chest(R), head(R), front(R) }: hooks that add shapes behind the body, on the chest, on the
//   head and in front of everything. R = { shape(letter, draw, ring), disc, ell, cap, poly, rect, taper, hx, hy, hr (head
//   centre and radius), chest ([x, y] of the chest plate), kind (face: hero, angry, female, hurt or back), by (body bob), pose, t (anim frame), opt }. Female styles get hair, lashes, lips and a skirt.
const RIG_W = 50,
  RIG_H = 64,
  RIG_X = 1,
  RIG_Y = 15; // the 48 x 48 box starts here in the grid (room above for crests)
// face maps from two rows above the head centre, starting at its x
// prettier-ignore
const RIG_FACES = {
  // anime eyes in a three-quarter view: the near eye wider than the far one, each with a thick upper lid, a
  // coloured iris (I) with a white glint (W) and a lower lid; brows above; a nose shadow; a tiny mouth near the front
  hero:   ['..........', '..........', '.KKKK.KKK.', '.EEIW.EIW.', '.EEII.EII.', '..EII..II.', '...KK...Kn', '..........', '.......MM.'],
  angry:  ['.KK....KK.', '...KK.K...', '.KKKK.KKK.', '.EEIW.EIW.', '.EEII.EII.', '..EII..II.', '...KK...Kn', '..........', '......KMM.'],
  female: ['..........', '..........', 'KKKKK.KKKK', '.EEIW.EIW.', '.EEII.EII.', '..EII..II.', '...KK...Kn', '.PP.......', '.......MM.'],
  hurt:   ['..........', '..........', '.K....K...', '..KK...KK.', '.K....K...', '..........', '.........n', '......KK..', '......KK..'],
};
// the detailed face for the big hero (fine pixels at k = 3): eyes with brows, the nose shadow and the mouth
// prettier-ignore
const RIG_BIG_FACES = {
  face: {
    near: ['...KKKK........', '....KKKKKK.....', '...............', 'KKKK...........', '.KKKKKKKK......', '..KKKKKKKKKKK..', '..EKUUUUUUUKKK.', '.EEUUWWUUUUUUK.', '.EEUUWWUUUUUUK.', '.EEIUUUUUUUUIK.', '..EIIIIIIIIIIK.', '..EEIIIIIIIIK..', '...KKIIIIIKK...', '.....KKKKK.....'],
    far:  ['..KKK....', '...KKKKK.', '.........', 'KK.......', '.KKKKK...', '..KKKKKK.', '..EUUUUK.', '.EUWWUUUK', '.EUWWUUUK', '.EUUUUUIK', '.EIIIIIIK', '..EIIIIK.', '...KIIK..', '....KK...'],
    nose: ['..N', '..N', '.NN'],
    mouth: ['.....N', 'NNNNN.'],
  },
  female: {
    near: ['.....KKKKK.....', '........KKK....', 'K..............', 'KK.............', '.KKKKKKKK......', '..KKKKKKKKKKK..', '..EKUUUUUUUKKK.', '.EEUUWWUUUUUUK.', '.EEUUWWUUUUUUK.', '.EEIUUUUUUUUIK.', '..EIIIIIIIIIIK.', '..EEIIIIIIIIK..', '...KKIIIIIKK...', '....KKKKKKK....'],
    far:  ['...KKKK..', '.....KKK.', '.........', 'K........', '.KKKKK...', '..KKKKKK.', '..EUUUUK.', '.EUWWUUUK', '.EUWWUUUK', '.EUUUUUIK', '.EIIIIIIK', '..EIIIIK.', '...KIIK..', '....KK...'],
    nose: ['..N', '..N', '.NN'],
    mouth: ['..MM..', '.M..M.'],
  },
  hurt: {
    near: ['...KKKK........', '....KKKKKK.....', '...............', '...............', '...............', '...............', '..KK...........', '...KKKK........', '......KKKKK....', '..........KKK..', '......KKKKK....', '...KKKK........', '..KK...........', '...............'],
    far:  ['..KKK....', '...KKKKK.', '.........', '.........', '.........', '.........', '.KK......', '..KKK....', '....KKKK.', '..KKK....', '.KK......', '.........', '.........', '.........'],
    nose: ['..N', '..N', '.NN'],
    mouth: ['..KKK.', '.KKKKK', '..KKK.'],
  },
};
// joint angles in degrees, all absolute: 0 points down, positive swings forward (toward the facing side), 180 is
// straight up. arms: [upper arm, forearm] for the back and front arm; legs: [thigh, shin, foot tilt].
// Every pose is moved so the lowest foot stands on the bottom of the box.
// prettier-ignore
const RIG_POSES = {
  // the idle stance of the X games: back leg straight out behind, front knee bent forward, buster fist up in front
  // of the chest, the other fist at the waist, leaning a little forward
  stand: [{ arms: [[-10, 60], [30, 120]], legs: [[-40, -35, 0], [48, -5, 0]], lean: 1, gunBack: [-20, 115] }],
  run: [
    { arms: [[-50, -15], [40, 100]], legs: [[-50, -40, -25], [50, 10, 5]], lean: 1 },
    { arms: [[-10, 30], [15, 95]], legs: [[-5, -20, -10], [40, -30, -15]], lean: 1 },
    { arms: [[-30, 10], [30, 105]], legs: [[-35, -28, -12], [35, 5, 0]], lean: 1 },
  ],
  jump: [{ arms: [[-140, -115], [125, 150]], legs: [[-12, 8, 0], [75, 10, 5]] }],
  hurt: [{ arms: [[-120, -150], [120, 150]], legs: [[-40, -25, -10], [40, 25, 10]], noGun: true }],
  climb: [
    { arms: [[-20, -5], [160, 175]], legs: [[-5, 0, 0], [80, 10, 0]] },
    { arms: [[-160, -175], [20, 5]], legs: [[-80, -10, 0], [5, 0, 0]] },
  ],
  raise: [{ arms: [[-135, -170], [135, 170]], legs: [[-40, -35, 0], [48, -5, 0]], noGun: true }],
};
const _rigScratch = {};
// rasterises one shape (drawn in box coordinates) into a 0/1 mask, at k fine pixels per box unit
function rigMask(draw, k = 1) {
  const W = RIG_W * k,
    H = RIG_H * k,
    cv = _rigScratch[k] || (_rigScratch[k] = makeCanvas(W, H));
  const g = cv.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H);
  g.save(); // shapes may clip or transform; nothing leaks into the next one
  g.translate(RIG_X * k, RIG_Y * k);
  g.scale(k, k);
  g.fillStyle = g.strokeStyle = '#fff';
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  draw(g);
  g.restore();
  const d = g.getImageData(0, 0, W, H).data,
    m = new Uint8Array(W * H);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] >= 128 ? 1 : 0;
  return m;
}
// outline thickness and shading depth in fine pixels at resolution k
const rigLine = k => Math.max(1, Math.round(k * 0.67));
const rad = a => (a * Math.PI) / 180;
const along = (x, y, a, len) => [x + Math.sin(rad(a)) * len, y + Math.cos(rad(a)) * len];
// shape helpers: each returns a draw function for rigMask
const RIG_SHAPES = {
  disc: (x, y, r) => g => {
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  },
  ell:
    (x, y, rx, ry, rot = 0) =>
    g => {
      g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
      g.fill();
    },
  cap: (x1, y1, x2, y2, w) => g => {
    g.lineWidth = w;
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
  },
  poly: pts => g => {
    for (let i = 0; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
    g.closePath();
    g.fill();
  },
  rect:
    (x, y, w, h, r = 0) =>
    g => {
      g.roundRect(x, y, w, h, r);
      g.fill();
    },
  // a tapered segment from (x1, y1) to (x2, y2), w1 wide at the start and w2 at the end
  taper: (x1, y1, x2, y2, w1, w2) => g => {
    const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2,
      c = Math.cos(a) / 2,
      s = Math.sin(a) / 2;
    g.moveTo(x1 + c * w1, y1 + s * w1);
    g.lineTo(x2 + c * w2, y2 + s * w2);
    g.lineTo(x2 - c * w2, y2 - s * w2);
    g.lineTo(x1 - c * w1, y1 - s * w1);
    g.closePath();
    g.fill();
  },
};
// body measurements (box coordinates, facing right)
const RIG_BODY = { hip: 30, thigh: 7.5, shin: 8.5, foot: 6 };
// the lowest point of a leg (bottom of the foot) for a hip at y
const legBottom = (y, [a1, a2]) =>
  y + Math.cos(rad(a1)) * RIG_BODY.thigh + Math.cos(rad(a2)) * RIG_BODY.shin + RIG_BODY.foot;
// builds the part grid of a pose at k fine pixels per box unit (k = 1 in game; 3 for the big hero on the title
// screen, where the face is drawn in detail)
function rigGrid(pose, fr, arm, face, style, t, opt, k = 1) {
  const ext = ROBOT_STYLES[style] || {},
    female = !!ext.female,
    W = RIG_W * k,
    H = RIG_H * k,
    line = rigLine(k);
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  g.k = k;
  // which part each outline pixel belongs to: inner outlines are drawn in a dark shade of that part (selective
  // outline), only the silhouette stays black
  g.ring = Array.from({ length: H }, () => Array(W).fill(''));
  // stamp a mask: its outline ring first (over whatever is under it), then its pixels
  const stamp = (c, m, ring = true) => {
    if (ring)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          if (!m[y * W + x]) continue;
          for (let dy = -line; dy <= line; dy++)
            for (let dx = -line; dx <= line; dx++) {
              const yy = y + dy,
                xx = x + dx;
              if (yy < 0 || yy >= H || xx < 0 || xx >= W || m[yy * W + xx]) continue;
              g[yy][xx] = 'K';
              g.ring[yy][xx] = c;
            }
        }
    for (let i = 0; i < m.length; i++)
      if (m[i]) {
        g[(i / W) | 0][i % W] = c;
        g.ring[(i / W) | 0][i % W] = '';
      }
  };
  const shape = (c, draw, ring = true) => stamp(c, rigMask(draw, k), ring);
  // stamps a pixel map (letters, '.' = transparent) with its top left at box coordinates bx, by; each map pixel
  // covers sc x sc fine pixels
  const stampMap = (map, bx, by, sc = 1) => {
    const x0 = Math.round((RIG_X + bx) * k),
      y0 = Math.round((RIG_Y + by) * k);
    map.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) {
        if (r[x] === '.') continue;
        for (let yy = 0; yy < sc; yy++)
          for (let xx = 0; xx < sc; xx++) {
            const gy = y0 + y * sc + yy,
              gx = x0 + x * sc + xx;
            if (gy >= 0 && gy < H && gx >= 0 && gx < W) {
              g[gy][gx] = r[x];
              g.ring[gy][gx] = '';
            }
          }
      }
    });
  };
  const { disc, ell, cap, poly, taper } = RIG_SHAPES;
  // an arm: inner-suit upper arm, a big armoured gauntlet with a gold cuff, a white fist and a white shoulder pad
  const limbArm = (sx, sy, [a1, a2], pad) => {
    const [ex, ey] = along(sx, sy, a1, 4.5),
      [wx, wy] = along(ex, ey, a2, 5.5),
      [hx, hy] = along(ex, ey, a2, 8.3);
    shape('h', cap(sx, sy, ex, ey, 3.6));
    shape('H', taper(ex, ey, wx, wy, 7, 9.5));
    shape('A', cap(...along(ex, ey, a2, 5), ...along(ex, ey, a2, 6.2), 9.5)); // gold cuff
    shape('L', disc(hx, hy, 3.8)); // white fist
    if (pad) shape('L', ell(sx - 0.5, sy - 1.5, 4, 3.5)); // white shoulder pad
  };
  // a leg: inner-suit thigh, a blue knee cap, a big boot widening to the ankle with a white side disc and a gold
  // ankle ring, and a long foot with a white toe
  const limbLeg = (hx, hy, [a1, a2, tilt]) => {
    const { thigh, shin } = RIG_BODY,
      [kx, ky] = along(hx, hy, a1, thigh),
      [ax, ay] = along(kx, ky, a2, shin),
      [dx, dy] = along(kx, ky, a2, shin * 0.45);
    shape('h', cap(hx, hy, kx, ky, 4.8));
    shape('H', taper(kx, ky, ax, ay, 7, 12.5));
    shape('L', disc(dx + 1.2, dy, 2.1));
    shape('A', cap(...along(kx, ky, a2, shin - 1.2), ...along(kx, ky, a2, shin - 0.6), 10)); // gold ankle ring
    shape('H', disc(kx, ky, 3.2)); // knee cap
    shape('H', g2 => {
      g2.translate(ax, ay);
      g2.rotate(-rad(tilt));
      poly([-6.5, -1, 5, -1, 10, 1.5, 12, 6, -7, 6, -7.5, 1.5])(g2);
    });
    shape('L', g2 => {
      g2.translate(ax, ay);
      g2.rotate(-rad(tilt));
      poly([6.5, 1.2, 10, 1.8, 11.4, 5, 6.5, 5])(g2);
    }); // white toe
  };
  const R = { shape, ...RIG_SHAPES, pose, t, opt, by: 0, hx: 25, hy: 9, hr: 9, chest: [24, 21], kind: face };
  const head = (cx, cy, kind) => {
    Object.assign(R, { hx: cx, hy: cy, kind });
    const clipHead = g2 => {
      g2.arc(cx, cy, 9, 0, Math.PI * 2);
      g2.clip();
      g2.beginPath();
    };
    shape('H', disc(cx, cy, 9)); // helmet
    if (ext.crest !== false)
      // the crest: a narrow white stripe from the forehead up over the middle of the helmet to the back
      shape(
        'L',
        g2 => {
          clipHead(g2);
          g2.lineWidth = 1.8;
          g2.moveTo(cx + 3, cy - 2.5);
          g2.quadraticCurveTo(cx - 1.5, cy - 7.5, cx - 6.5, cy - 3);
          g2.stroke();
        },
        false,
      );
    shape('w', ell(cx - 4.5, cy - 2.5, 1.4, 0.9), false); // shine
    if (kind === 'back') {
      shape('L', disc(cx - 1, cy + 1.5, 3.3));
      shape('G', disc(cx - 1, cy + 1.5, 1.7), false);
    } else {
      // the face: a wide forehead, the cheek running down to a pointed chin, and the nose sticking out at the front
      // edge (a three-quarter anime face)
      shape(
        'S',
        poly([
          cx - 0.3,
          cy - 2.6,
          cx + 8.4,
          cy - 2.6,
          cx + 8.8,
          cy + 2.5,
          cx + 10.6,
          cy + 4.6,
          cx + 9,
          cy + 5.4,
          cx + 9,
          cy + 7,
          cx + 7,
          cy + 9.6,
          cx + 3,
          cy + 8.6,
          cx - 0.3,
          cy + 5,
        ]),
      );
      shape('L', disc(cx - 4.5, cy + 1.5, 2.8)); // ear disc
      shape('G', disc(cx - 4.5, cy + 1.5, 1.4), false);
      stampMap(RIG_FACES[kind], cx, cy - 2, k);
    }
    if (ext.head) ext.head(R);
  };
  // the helmeted head in detail (k >= 3): a smooth helmet with the crest and ear disc, and a three-quarter anime
  // face with the big eye maps (angry brows for the men, lashes and blush for the women)
  const headBig = (cx, cy, kind) => {
    Object.assign(R, { hx: cx, hy: cy, kind });
    const o = (x, y) => [cx + x, cy + y];
    const clipHead = g2 => {
      g2.arc(cx, cy, 9, 0, Math.PI * 2);
      g2.clip();
      g2.beginPath();
    };
    shape('H', disc(cx, cy, 9)); // helmet
    if (ext.crest !== false)
      shape(
        'L',
        g2 => {
          clipHead(g2);
          g2.lineWidth = 1.8;
          g2.moveTo(cx + 3, cy - 2.5);
          g2.quadraticCurveTo(cx - 1.5, cy - 7.5, cx - 6.5, cy - 3);
          g2.stroke();
        },
        false,
      );
    shape('w', ell(cx - 4.5, cy - 2.5, 1.4, 0.9), false); // shine
    if (kind === 'back') {
      shape('L', disc(cx - 1, cy + 1.5, 3.3));
      shape('G', disc(cx - 1, cy + 1.5, 1.7), false);
    } else {
      // the face opening: a wide forehead under the helmet rim, the nose at the front edge, a short pointed chin
      // prettier-ignore
      shape('S', g2 => { clipHead(g2); poly([...o(-0.5, -3.6), ...o(9.4, -3.6), ...o(9.9, 1), ...o(10.7, 3.2), ...o(9.8, 3.9), ...o(9.6, 5.2), ...o(8.2, 7.2), ...o(6.2, 8.4), ...o(3.5, 7.6), ...o(0.6, 5.2), ...o(-0.4, 2)])(g2); });
      shape('s', poly([...o(-0.5, -3.6), ...o(9.4, -3.6), ...o(9.5, -2.6), ...o(-0.4, -2.4)]), false); // shadow under the rim
      shape('L', disc(cx - 4.5, cy + 1.5, 2.8)); // ear disc
      shape('G', disc(cx - 4.5, cy + 1.5, 1.4), false);
      const F = RIG_BIG_FACES[kind === 'hurt' ? 'hurt' : female ? 'female' : 'face'];
      stampMap(F.near, cx + 0.6, cy - 1.2);
      stampMap(F.far, cx + 6.9, cy - 1);
      stampMap(F.nose, cx + 9.4, cy + 3);
      stampMap(F.mouth, cx + 6.2, cy + 5.6);
      if (female && kind !== 'hurt') stampMap(['PP', 'PP'], cx + 1.4, cy + 4.2); // blush
    }
    if (ext.head) ext.head(R);
  };
  // hair hangs behind everything, so it goes first
  const hair = () => {
    if (!female || ext.hair === false) return;
    const { hx, hy } = R,
      o = (x, y) => [hx + x, hy + y];
    shape('Z', ell(hx - 4, hy + 4, 6.5, 9));
    if (k < 3) return;
    // prettier-ignore
    for (const [ax, ay, bx, by, tx, ty] of [[-9.5, 4, -6.5, 8, -9.5, 15], [-6.5, 7, -3, 9, -5, 16], [-3, 8.5, 0.5, 9, -1, 14.5], [-10, -2, -8, 2, -13, 2], [-9, 7, -8, 10, -12.5, 10]])
      shape('Z', poly([...o(ax, ay), ...o(tx, ty), ...o(bx, by)]));
    // prettier-ignore
    for (const [x1, y1, x2, y2] of [[-7.5, 3, -8.3, 12], [-4.5, 5, -4.8, 13], [-1.5, 6, -1.8, 12]])
      shape('z', cap(...o(x1, y1), ...o(x2, y2), 0.9), false);
  };
  const faceKind = face === 'hurt' || face === 'back' ? face : female ? 'female' : ext.angry ? 'angry' : 'hero';

  if (pose === 'slide') {
    // low and long: kneeling on the back leg, the front leg stretched out along the floor
    Object.assign(R, { by: 10, chest: [18, 28], hx: 13, hy: 22 });
    hair();
    if (ext.back) ext.back(R);
    limbLeg(14, 34, [0, -90, 0]);
    shape('L', poly([13, 31, 23, 31, 24, 35, 14, 35]));
    shape('H', poly([9, 24, 23, 23, 24, 29, 20, 32, 13, 32, 9, 28]));
    limbLeg(20, 35, [75, 85, 0]);
    limbArm(20, 25, [60, 100], true);
    (k >= 3 ? headBig : head)(13, 22, faceKind);
    return g;
  }
  const fs = RIG_POSES[pose] || RIG_POSES.stand,
    F = fs[Math.min(fr || 0, fs.length - 1)];
  // stand the lowest foot on the bottom of the box
  const [L0, L1] = F.legs,
    by = Math.round(47.5 - Math.max(legBottom(RIG_BODY.hip, L0), legBottom(RIG_BODY.hip, L1))),
    y = v => v + by,
    gun = arm && !F.noGun;
  const lean = F.lean || 0; // the head sits a little forward when leaning into the stance
  Object.assign(R, { by, chest: [24, y(21)], hx: 25 + lean, hy: y(8) });
  hair();
  if (ext.back) ext.back(R);
  // shooting from the stance, the back fist comes up in front of the chest
  const backFront = gun && F.gunBack;
  if (!backFront) limbArm(17, y(18), F.arms[0], true);
  limbLeg(21, y(RIG_BODY.hip), L0);
  limbLeg(27, y(RIG_BODY.hip), L1);
  shape('h', poly([21.5, y(24), 26.5, y(24), 26, y(28.5), 22, y(28.5)])); // slim waist (inner suit)
  shape('L', poly([19, y(27.5), 29, y(27.5), 28.5, y(30.5), 25.5, y(32.5), 22.5, y(32.5), 19.5, y(30.5)])); // pelvis
  shape('A', cap(19.6, y(28), 28.4, y(28), 1.6)); // gold belt
  shape('H', poly([15, y(15.5), 33, y(15.5), 32, y(21), 27, y(25), 21, y(25), 16, y(21)])); // chest armour
  const hex = [];
  for (let i = 0; i < 6; i++)
    hex.push(25.5 + Math.cos((i * Math.PI) / 3) * 2.8, y(21) + Math.sin((i * Math.PI) / 3) * 2.6);
  shape('A', poly(hex)); // the gold core
  shape('O', disc(25.5, y(21), 1.1), false);
  shape('w', poly([18, y(19.5), 21.5, y(19.5), 19.5, y(21.5)]), false);
  if (female) shape('Q', poly([19, y(27.5), 29, y(27.5), 33, y(34), 15, y(34)])); // skirt
  if (ext.chest) ext.chest(R);
  if (backFront) limbArm(18, y(18), F.gunBack, true);
  if (gun) {
    // the arm cannon: a grey breech, a blue barrel with gold vents, a red muzzle ring
    shape('h', cap(31, y(19), 34, y(20), 3.6));
    shape('D', RIG_SHAPES.rect(32.5, y(15.5), 5, 9, 2));
    shape('H', RIG_SHAPES.rect(35.5, y(14.5), 12, 11, 4));
    shape('A', RIG_SHAPES.rect(38.5, y(15.6), 1.6, 2.6, 0.4));
    shape('A', RIG_SHAPES.rect(41.3, y(15.6), 1.6, 2.6, 0.4));
    shape('G', ell(46, y(20), 1.6, 3.4));
    shape('k', ell(46.4, y(20), 0.8, 2), false);
    shape('L', ell(30, y(16.5), 4, 3.5)); // shoulder pad
  } else limbArm(31, y(19), F.arms[1], true);
  // the head goes on top so the face is never hidden behind the front arm
  (k >= 3 ? headBig : head)(25 + lean, y(8), faceKind);
  if (ext.front) ext.front(R);
  return g;
}
// colours for the letters
function robotColors(pal, style) {
  const { B, b, S } = pal,
    white = pal === PAL_WHITE,
    ext = ROBOT_STYLES[style] || {},
    x = ext.colors || {};
  const c = {
    H: B,
    h: b,
    w: shade(b, 0.7),
    S,
    E: x.E || '#fcfcfc',
    U: x.U || '#0a0a16',
    I: x.I || '#2a6ee0',
    W: '#fcfcfc',
    n: shade(S, -0.22),
    N: shade(S, -0.55),
    s: shade(S, -0.15),
    P: '#f8a0a8',
    K: '#0a0a16',
    M: ext.female ? '#e05878' : '#a83828',
    k: shade(B, -0.6),
    Z: ext.hair || '#6a3818',
    z: ext.hairShine || shade(ext.hair || '#6a3818', 0.32),
    Q: ext.skirt || b,
    X: x.X || '#d8d8e0',
    Y: x.Y || '#f83800',
    V: x.V || '#202028',
    G: x.G || '#e83838',
    L: x.L || '#eef4fc',
    A: x.A || '#f8b830',
    O: '#e86818',
    D: '#8890a8',
  };
  if (white) for (const k in c) if (!'KUI'.includes(k)) c[k] = '#fcfcfc';
  return c;
}
const RIG_FLAT = 'KEUMkwIWnPOzNs';
// paints a grid into a bitmap: each region lit from the top left (light top and left edges, a darker bottom edge
// two pixels deep) so every part reads as a rounded piece of armour
function rigBitmap(grid, cols) {
  const H = grid.length,
    W = grid[0].length,
    k = grid.k || 1,
    lt = rigLine(k), // highlight band
    dk = lt * 2; // shadow band
  const at = (x, y) => (y < 0 || y >= H || x < 0 || x >= W ? '.' : grid[y][x]);
  // true when a different letter lies within n pixels in direction dx, dy
  const diff = (x, y, dx, dy, n, c) => {
    for (let i = 1; i <= n; i++) if (at(x + dx * i, y + dy * i) !== c) return true;
    return false;
  };
  return makeCanvas(W * HP * SCALE, H * HP * SCALE, g => {
    g.scale(SCALE * HP, SCALE * HP);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const c = grid[y][x];
        if (c === '.') continue;
        let col = cols[c] || '#ff00ff';
        const own = grid.ring && grid.ring[y][x];
        if (c === 'K' && own && cols[own]) {
          // an inner outline: a dark shade of its part; the silhouette (next to empty space) stays black
          let open = false;
          for (let n = 1; n <= lt && !open; n++)
            open = at(x - n, y) === '.' || at(x + n, y) === '.' || at(x, y - n) === '.' || at(x, y + n) === '.';
          if (!open) col = shade(cols[own], -0.62);
        } else if (c === 'Z') {
          if (diff(x, y, 0, 1, lt, c) || diff(x, y, 1, 0, lt, c)) col = shade(col, -0.28);
        } else if (c === 'S') {
          // skin is shaded softly: a light top edge and a thin shadow along the bottom and right
          if (diff(x, y, 0, -1, lt, c)) col = shade(col, 0.25);
          else if (diff(x, y, 0, 1, lt, c) || diff(x, y, 1, 0, lt, c)) col = shade(col, -0.12);
        } else if (!RIG_FLAT.includes(c)) {
          // cel shading: a light top edge, a softer left edge, a deeper shadow band at the bottom and right
          if (diff(x, y, 0, -1, lt, c)) col = shade(col, 0.42);
          else if (diff(x, y, -1, 0, lt, c)) col = shade(col, 0.16);
          else if (diff(x, y, 0, 1, dk, c)) col = shade(col, -0.3);
          else if (diff(x, y, 1, 0, lt, c)) col = shade(col, -0.2);
        }
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
  });
}
const _rigCache = new Map();
// ---------- hero sprites (Nexo, converted from his character sheet, see js/hero-sprites.js) ----------
const _heroCache = new Map();
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a, b, t) =>
  '#' +
  hexRgb(a)
    .map((v, i) =>
      Math.round(v + (hexRgb(b)[i] - v) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
// colours for the sprite letters: the armour (1, 2, 3, c) is always Nexo's blue; only the hair (h, H, L), the gloves
// and boots (5-8) and the bare hands (9, 0) take the weapon's palette. With the buster the hair stays brown and the
// hands bare, so the gloves and boots match the armour.
function heroColors(pal) {
  const A = PAL_HERO.B,
    a = PAL_HERO.b,
    W = pal.B,
    w = pal.b,
    c = { o: '#0a0a16', 1: shade(A, -0.4), 2: A, 3: mixHex(A, a, 0.45), c: a };
  Object.assign(c, { 5: shade(W, -0.4), 6: W, 7: mixHex(W, w, 0.45), 8: w });
  Object.assign(c, { y: '#ce9c4a', Y: '#8c6034', s: '#f2caaa', S: '#be8c76', b: '#345abe', w: '#e8ecf6' });
  Object.assign(c, { r: '#ec6e28', C: '#82d2f4', q: '#34201c', Q: '#603e2c', l: '#966646' });
  if (W === A && w === a) Object.assign(c, { h: '#34201c', H: '#603e2c', L: '#966646', 9: '#f2caaa', 0: '#be8c76' });
  else Object.assign(c, { h: shade(W, -0.45), H: W, L: mixHex(W, w, 0.6), 9: w, 0: mixHex(W, w, 0.45) });
  if (pal === PAL_WHITE) for (const k in c) if (k !== 'o') c[k] = '#fcfcfc';
  return c;
}
// The running cycle, chosen so the planted foot stays put on the ground while the hero moves at its running speed
// (1.4 px a tick): the order, each frame's ticks and a small fixed shift per frame (sprite pixels) were searched so
// a planted foot moves back exactly as far as the body moves forward (it slides 0.3 px on average). Two steps:
// landing, mid stance and push-off for each foot. Running frames are anchored on the torso.
const HERO_RUN = {
  frames: ['run4', 'run2', 'run5', 'run6', 'run3', 'run1'],
  ticks: [5, 2, 3, 4, 3, 3],
  shift: [0, 0, 2, 0, 0, -2],
};
HERO_RUN.length = HERO_RUN.ticks.reduce((a, b) => a + b, 0);
// the running frame at tick t of the cycle
function heroRunFrame(t) {
  t %= HERO_RUN.length;
  for (let i = 0; i < HERO_RUN.ticks.length; i++) {
    if (t < HERO_RUN.ticks[i]) return HERO_RUN.frames[i];
    t -= HERO_RUN.ticks[i];
  }
  return HERO_RUN.frames[0];
}
// the frame a pose uses: fr is the running tick count, the climbing frame (0-3), or 0 rising / 1 falling in a jump
function heroFrame(pose, fr, arm, big) {
  fr = fr || 0;
  if (big) return arm ? 'action' : 'stand';
  if (pose === 'slide') return 'slide';
  if (pose === 'hurt') return 'hurt';
  if (pose === 'climb') return arm ? 'shoot' : 'climb' + ((fr % 4) + 1);
  if (pose === 'jump') return fr ? 'jumpFall' : 'jumpRise';
  if (pose === 'run') return arm ? (Math.floor(fr / 8) % 2 ? 'shootRun2' : 'shootRun1') : heroRunFrame(fr);
  return arm ? 'shoot' : 'idle';
}
function drawHeroSprite(ox, oy, f, pose, fr, arm, pal, big) {
  // the HD set (3 sprite pixels per logical pixel) needs whole device pixels, so it is used when SCALE is 6
  const hd = !big && SCALE % 3 === 0 && typeof HERO_SPRITES_HD !== 'undefined',
    k = hd ? 1.5 : 1, // HD pixels per pixel of the normal set
    name = heroFrame(pose, fr, arm, big),
    map = (big ? HERO_SPRITES_BIG : hd ? HERO_SPRITES_HD : HERO_SPRITES)[name],
    back = pose === 'climb' && !arm, // climbing is seen from behind, whichever way the hero faces
    flip = !back && f < 0,
    key = [SCALE, big ? 1 : hd ? 2 : 0, name, flip ? 1 : 0, pal.B, pal.b, pal === PAL_WHITE ? 1 : 0].join('|');
  let e = _heroCache.get(key);
  if (!e) {
    const h = map.length,
      w = map[0].length,
      cols = heroColors(pal),
      px = SCALE / (2 * k); // one sprite pixel is one fine pixel on screen (two thirds of one in HD)
    const cv = makeCanvas(w * px, h * px, g => {
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const ch = map[y][flip ? w - 1 - x : x];
          if (ch === '.') continue;
          g.fillStyle = cols[ch] || '#ff00ff';
          g.fillRect(x * px, y * px, px, px);
        }
    });
    // the head's centre column anchors the frame, so the body stays put when the frames change; running frames are
    // anchored on the torso instead, with the cycle's shift (2.8 = how far the head sits ahead of the torso)
    const mean = (y0, y1) => {
      let sx = 0,
        n = 0;
      for (let y = y0; y < y1; y++)
        for (let x = 0; x < w; x++)
          if (map[y][x] !== '.') {
            sx += x;
            n++;
          }
      return n ? sx / n + 0.5 : w / 2;
    };
    const wi = HERO_RUN.frames.indexOf(name);
    let ax =
      wi >= 0
        ? mean(Math.floor(h * 0.35), Math.floor(h * 0.55)) + (2.8 - HERO_RUN.shift[wi]) * k
        : mean(0, Math.ceil(h * 0.22));
    if (flip) ax = w - ax;
    e = { cv, w, h, ax };
    if (_heroCache.size > 400) _heroCache.clear();
    _heroCache.set(key, e);
  }
  const u = big ? 24 / 144 : HP / k, // logical size of one sprite pixel
    target = back ? 12 : 12 + 0.75 * f;
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(e.cv, Math.round(ox) + target - e.ax * u, Math.round(oy) + 24 - e.h * u, e.w * u, e.h * u);
  ctx.imageSmoothingEnabled = smooth;
}

function drawRobot(ox, oy, f, pose, fr, arm, pal, style = 'hero', opt = {}) {
  if (style === 'hero' && typeof HERO_SPRITES !== 'undefined') {
    drawHeroSprite(ox, oy, f, pose, fr, arm, pal, Math.abs(ctx.getTransform().a) / SCALE >= 3);
    return;
  }
  const ext = ROBOT_STYLES[style] || {},
    face = pose === 'hurt' ? 'hurt' : pose === 'climb' && !arm ? 'back' : 'face',
    t = ext.anim ? ext.anim(opt) : 0,
    // when the canvas is zoomed 3x or more (the title screen and the ending), the robot is built in detail
    k = Math.abs(ctx.getTransform().a) / SCALE >= 3 ? 3 : 1,
    key = [
      SCALE,
      k,
      style,
      pose,
      fr,
      arm ? 1 : 0,
      face,
      f < 0 ? 1 : 0,
      pal.B,
      pal.b,
      pal.S,
      t,
      opt.blade === false ? 0 : 1,
    ].join('|');
  let bm = _rigCache.get(key);
  if (!bm) {
    const grid = rigGrid(pose, fr, arm, face, style, t, opt, k);
    if (f < 0) {
      grid.forEach(r => r.reverse());
      grid.ring.forEach(r => r.reverse());
    }
    bm = rigBitmap(grid, robotColors(pal, style));
    if (_rigCache.size > 800) _rigCache.clear();
    _rigCache.set(key, bm);
  }
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  // the grid is mirrored as a whole, so its left margin moves to the right when facing left
  const gx = Math.round(ox) - (f < 0 ? RIG_W - 48 - RIG_X : RIG_X) * HP;
  ctx.drawImage(bm, gx, Math.round(oy) - RIG_Y * HP, RIG_W * HP, RIG_H * HP);
  ctx.imageSmoothingEnabled = smooth;
}

// Azura bosses on the rig (positions relative to the head centre hx, hy and the chest plate)
Object.assign(ROBOT_STYLES, {
  cut: {
    // a big pair of scissors on the head that opens and closes
    angry: true,
    colors: { X: '#e0e0ea', Y: '#f83800' },
    anim: opt => (opt.blade === false ? 0 : (frameCount >> 3) & 1),
    head(R) {
      if (R.opt.blade === false) return;
      const { hx, hy, t } = R,
        o = t ? 2 : 0;
      R.shape('X', R.poly([hx - 1, hy - 7, hx - 7 - o, hy - 18, hx - 4 - o, hy - 19, hx + 2, hy - 8]));
      R.shape('X', R.poly([hx + 1, hy - 7, hx + 7 + o, hy - 18, hx + 4 + o, hy - 19, hx - 2, hy - 8]));
      R.shape('Y', R.disc(hx, hy - 7.5, 2.4));
    },
  },
  fire: {
    // a flame burning on top of the head
    angry: true,
    colors: { X: '#f87800', Y: '#f8d800' },
    anim: () => (frameCount >> 2) % 3,
    head(R) {
      const { hx, hy, t } = R;
      R.shape(
        'X',
        R.poly([
          hx - 6,
          hy - 5,
          hx - 5,
          hy - 12,
          hx - 2,
          hy - 9,
          hx,
          hy - 17 - t,
          hx + 2,
          hy - 10,
          hx + 5,
          hy - 14 + t,
          hx + 6,
          hy - 5,
        ]),
      );
      R.shape(
        'Y',
        R.poly([hx - 3, hy - 6, hx - 1, hy - 10, hx + 1, hy - 13 - t, hx + 2, hy - 9, hx + 4, hy - 6]),
        false,
      );
    },
  },
  elec: {
    // a lightning-bolt fin and a bolt on the chest
    angry: true,
    colors: { X: '#f8d800', Y: '#fcf8a0' },
    head(R) {
      const { hx, hy } = R;
      R.shape(
        'X',
        R.poly([
          hx - 3,
          hy - 6,
          hx - 1,
          hy - 14,
          hx + 1,
          hy - 11,
          hx + 3,
          hy - 20,
          hx + 5,
          hy - 10,
          hx + 3,
          hy - 12,
          hx + 2,
          hy - 6,
        ]),
      );
    },
    chest(R) {
      const [x, y] = R.chest;
      R.shape(
        'V',
        R.poly([x + 1, y - 4, x - 2, y, x + 1, y, x - 1, y + 4, x + 4, y - 1, x + 1, y - 1, x + 3, y - 4]),
        false,
      );
    },
  },
  snow: {
    // long pale hair, an ice-crystal tiara
    female: true,
    hair: '#d8f0fc',
    skirt: '#e8f8fc',
    colors: { X: '#58e8f8', G: '#58e8f8' },
    head(R) {
      const { hx, hy } = R;
      R.shape('X', R.poly([hx + 1, hy - 16, hx + 4, hy - 10, hx + 1, hy - 6, hx - 2, hy - 10]));
    },
  },
  earth: {
    // brown hair with a green headband and stone shoulder pads
    female: true,
    hair: '#6a3818',
    skirt: '#4a8a30',
    colors: { X: '#8a8070', Y: '#4a8a30', G: '#4a8a30', L: '#d8c8a8' },
    head(R) {
      const { hx, hy } = R;
      R.shape('Y', R.cap(hx - 7, hy - 4.5, hx + 7, hy - 5.5, 2.2));
    },
    front(R) {
      const y = R.chest[1] - 8;
      R.shape('X', R.rect(11, y, 10, 5, 2));
      R.shape('X', R.rect(26, y, 10, 5, 2));
    },
  },
  wind: {
    // teal hair streaming back and a swirl crest
    female: true,
    hair: '#58c8a8',
    skirt: '#e8fcf4',
    colors: { X: '#e8fcf4', Y: '#78e8c8', G: '#78e8c8' },
    back(R) {
      const { hy } = R;
      R.shape('Z', R.poly([22, hy - 5, 5, hy - 1, 9, hy + 3, 2, hy + 9, 11, hy + 10, 7, hy + 15, 20, hy + 11]));
    },
    head(R) {
      const { hx, hy } = R;
      R.shape('Y', R.ell(hx + 1, hy - 8, 4.5, 2.2));
      R.shape('X', R.disc(hx + 5, hy - 11.5, 2));
      R.shape('X', R.disc(hx - 3, hy - 11, 1.6));
    },
  },
});

function drawWeaponIcon(kind, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  switch (kind) {
    case 'buster':
      sprite(0, 0, 1, 10, [[1, 2, 8, 6, '#3cbcfc']], [[3, 3, 4, 3, '#fcfcfc']]);
      break;
    case 'cut':
      sprite(0, 0, 1, 10, [
        [0, 0, 3, 3, '#d8d8e0'],
        [7, 0, 3, 3, '#d8d8e0'],
        [2, 2, 6, 3, '#a8a8b8'],
        [1, 5, 3, 5, '#f83800'],
        [6, 5, 3, 5, '#f83800'],
      ]);
      break;
    case 'fire':
      sprite(
        0,
        0,
        1,
        10,
        [
          [2, 3, 6, 7, '#f87800'],
          [3, 0, 3, 5, '#f8d800'],
        ],
        [[4, 6, 2, 3, '#fcfcfc']],
      );
      break;
    case 'snow':
      sprite(
        0,
        0,
        1,
        10,
        [
          [4, 0, 2, 10, '#a8e8fc'],
          [0, 4, 10, 2, '#a8e8fc'],
        ],
        [
          [4, 4, 2, 2, '#fcfcfc'],
          [1, 1, 2, 2, '#d8f8fc'],
          [7, 7, 2, 2, '#d8f8fc'],
        ],
      );
      break;
    case 'earth':
      sprite(
        0,
        0,
        1,
        10,
        [
          [1, 2, 8, 7, '#9a7a5a'],
          [3, 0, 4, 4, '#b89878'],
        ],
        [
          [3, 4, 2, 2, '#6a4a2a'],
          [6, 6, 2, 1, '#6a4a2a'],
        ],
      );
      break;
    case 'wind':
      sprite(
        0,
        0,
        1,
        10,
        [
          [0, 0, 10, 2, '#78f8c8'],
          [1, 3, 8, 2, '#78f8c8'],
          [3, 6, 5, 2, '#78f8c8'],
          [4, 8, 3, 2, '#78f8c8'],
        ],
        [
          [1, 0, 6, 1, '#e8fcf4'],
          [3, 3, 4, 1, '#e8fcf4'],
          [4, 6, 2, 1, '#e8fcf4'],
        ],
      );
      break; // tornado
    case 'elec':
      sprite(
        0,
        0,
        1,
        10,
        [
          [5, 0, 4, 3, '#f8d800'],
          [3, 2, 4, 3, '#f8d800'],
          [1, 4, 8, 2, '#f8d800'],
          [4, 6, 3, 2, '#f8d800'],
          [2, 7, 3, 3, '#f8d800'],
        ],
        [
          [6, 1, 2, 1, '#fcfcfc'],
          [2, 5, 5, 1, '#fcf8a0'],
        ],
      );
      break;
    default:
      if (WEAPON_ICONS[kind]) WEAPON_ICONS[kind]();
  }
  ctx.restore();
}

// ================= BACKGROUNDS =================
const BG_W = 768,
  BG_H = VH + 60;
function poly(g, pts, col) {
  g.fillStyle = col;
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath();
  g.fill();
}
function skyGrad(g, stops) {
  const gr = g.createLinearGradient(0, 0, 0, BG_H);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  g.fillStyle = gr;
  g.fillRect(0, 0, BG_W, BG_H);
}
function gear(g, cx, cy, r, col, teeth) {
  g.fillStyle = col;
  g.beginPath();
  g.arc(cx, cy, r, 0, 7);
  g.fill();
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    g.save();
    g.translate(cx, cy);
    g.rotate(a);
    g.fillRect(-r * 0.12, -r - 7, r * 0.24, 9);
    g.restore();
  }
  g.globalCompositeOperation = 'destination-out';
  g.beginPath();
  g.arc(cx, cy, r * 0.35, 0, 7);
  g.fill();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.6;
    g.beginPath();
    g.arc(cx + Math.cos(a) * r * 0.65, cy + Math.sin(a) * r * 0.65, r * 0.16, 0, 7);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';
}

const BG_PAINTERS = {
  cut: [
    {
      k: 0.12,
      ky: 0.4,
      paint(g, rnd) {
        skyGrad(g, [
          [0, '#141a30'],
          [0.5, '#3c3458'],
          [0.8, '#a0584a'],
          [1, '#e08a50'],
        ]);
        g.fillStyle = 'rgba(248,192,112,0.18)';
        g.beginPath();
        g.arc(560, 170, 46, 0, 7);
        g.fill();
        g.fillStyle = '#f8c070';
        g.beginPath();
        g.arc(560, 170, 26, 0, 7);
        g.fill();
        for (let i = 0; i < 60; i++) {
          g.fillStyle = rnd() < 0.3 ? '#fcfcfc' : '#7a78a8';
          g.fillRect((rnd() * BG_W) | 0, (rnd() * 110) | 0, 1, 1);
        }
        let x = 0;
        while (x < BG_W) {
          const w = (30 + rnd() * 50) | 0,
            h = (50 + rnd() * 80) | 0;
          g.fillStyle = '#262238';
          g.fillRect(x, BG_H - h, w, h);
          if (rnd() < 0.6) {
            const cw = (6 + rnd() * 6) | 0,
              ch = (30 + rnd() * 50) | 0,
              cx = (x + rnd() * (w - cw)) | 0;
            g.fillRect(cx, BG_H - h - ch, cw, ch);
            g.fillStyle = '#c84030';
            g.fillRect(cx, BG_H - h - ch + 4, cw, 2);
          }
          g.fillStyle = '#5a4a6a';
          for (let wy = BG_H - h + 8; wy < BG_H - 6; wy += 10)
            for (let wx = x + 4; wx < x + w - 4; wx += 7) if (rnd() < 0.3) g.fillRect(wx, wy, 3, 4);
          x += w + ((rnd() * 8) | 0);
        }
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        for (let i = 0; i < 6; i++)
          gear(g, 60 + i * 130 + rnd() * 40, BG_H - 20 - rnd() * 60, 26 + rnd() * 26, '#2e2a44', 12);
        g.fillStyle = '#34304c';
        g.fillRect(0, BG_H - 120, BG_W, 6);
        for (let x = 0; x < BG_W; x += 32) {
          g.fillRect(x, BG_H - 120, 3, 120);
          g.save();
          g.translate(x, BG_H - 114);
          g.rotate(Math.atan2(40, 32));
          g.fillRect(0, 0, 51, 2);
          g.restore();
        }
      },
    },
  ],
  fire: [
    {
      k: 0.12,
      ky: 0.4,
      paint(g, rnd) {
        skyGrad(g, [
          [0, '#0e0204'],
          [0.45, '#3a0a08'],
          [0.8, '#8a2410'],
          [1, '#d8501a'],
        ]);
        for (let i = 0; i < 3; i++) {
          const cx = 120 + i * 260 + rnd() * 60,
            top = 90 + rnd() * 40,
            wb = 160 + rnd() * 60;
          g.fillStyle = 'rgba(60,20,16,0.6)';
          for (let s = 0; s < 6; s++) {
            g.beginPath();
            g.arc(cx + (rnd() - 0.5) * 30, top - 20 - s * 18, 14 + s * 4, 0, 7);
            g.fill();
          }
          poly(g, [cx - wb, BG_H, cx - 18, top, cx + 18, top, cx + wb, BG_H], '#220806');
          g.strokeStyle = 'rgba(248,96,24,0.8)';
          g.lineWidth = 2;
          for (let s = 0; s < 3; s++) {
            g.beginPath();
            g.moveTo(cx - 8 + s * 8, top);
            g.lineTo(cx - 30 + s * 30 + (rnd() - 0.5) * 30, BG_H);
            g.stroke();
          }
          g.fillStyle = '#f86018';
          g.fillRect(cx - 18, top - 2, 36, 3);
        }
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        let x = 0;
        while (x < BG_W) {
          const w = 30 + rnd() * 40,
            h = 60 + rnd() * 100;
          poly(g, [x, BG_H, x + w * 0.4, BG_H - h, x + w * 0.55, BG_H - h + 10, x + w, BG_H], '#2c0c08');
          g.strokeStyle = '#a03010';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(x + w * 0.4, BG_H - h);
          g.lineTo(x + w * 0.2, BG_H);
          g.stroke();
          x += w * 0.7;
        }
      },
    },
  ],
  elec: [
    {
      k: 0.1,
      ky: 0.4,
      paint(g, rnd) {
        skyGrad(g, [
          [0, '#06060f'],
          [0.5, '#141430'],
          [0.85, '#2a2450'],
          [1, '#3a3060'],
        ]);
        for (let i = 0; i < 16; i++) {
          const cx = rnd() * BG_W,
            cy = 8 + rnd() * 80;
          g.fillStyle = 'rgba(46,46,90,0.55)';
          for (let k = 0; k < 5; k++) {
            g.beginPath();
            g.arc(cx + k * 14 - 28, cy + (k % 2) * 5, 12 + rnd() * 9, 0, 7);
            g.fill();
          }
        }
        let x = 0;
        while (x < BG_W) {
          const w = (18 + rnd() * 36) | 0,
            h = (30 + rnd() * 70) | 0;
          g.fillStyle = '#14142a';
          g.fillRect(x, BG_H - h, w, h);
          g.fillStyle = '#f8e070';
          for (let wy = BG_H - h + 5; wy < BG_H - 4; wy += 7)
            for (let wx = x + 3; wx < x + w - 3; wx += 5) if (rnd() < 0.12) g.fillRect(wx, wy, 2, 2);
          x += w + ((rnd() * 6) | 0);
        }
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g) {
        // transmission towers with sagging cables (spacing divides BG_W so the layer tiles seamlessly)
        const xs = [],
          top = BG_H - 150;
        for (let x = 48 - 192; x < BG_W + 192; x += 192) xs.push(x);
        g.strokeStyle = '#34346a';
        g.lineWidth = 1;
        for (let i = 0; i < xs.length - 1; i++)
          for (const [o, y] of [
            [-24, top + 10],
            [24, top + 10],
            [-18, top + 40],
            [18, top + 40],
          ]) {
            g.beginPath();
            g.moveTo(xs[i] + o, y);
            g.quadraticCurveTo((xs[i] + xs[i + 1]) / 2 + o, y + 34, xs[i + 1] + o, y);
            g.stroke();
          }
        for (const x of xs) {
          poly(g, [x - 20, BG_H, x - 4, top, x + 4, top, x + 20, BG_H], '#22223e');
          g.fillStyle = '#22223e';
          g.fillRect(x - 26, top + 8, 52, 4);
          g.fillRect(x - 20, top + 38, 40, 4);
          g.strokeStyle = '#16162a';
          for (let y = top + 16; y < BG_H - 8; y += 22) {
            const w = 4 + (y - top) * 0.1;
            g.beginPath();
            g.moveTo(x - w, y);
            g.lineTo(x + w, y + 22);
            g.moveTo(x + w, y);
            g.lineTo(x - w, y + 22);
            g.stroke();
          }
          g.fillStyle = '#f83800';
          g.fillRect(x - 1, top - 4, 2, 4);
        }
      },
    },
  ],
  wind: [
    {
      k: 0.1,
      ky: 0.4,
      paint(g, rnd) {
        skyGrad(g, [
          [0, '#3a8ad8'],
          [0.55, '#8ac8f0'],
          [0.85, '#d8f0fc'],
          [1, '#f4fcff'],
        ]);
        g.fillStyle = 'rgba(255,255,220,0.45)';
        g.beginPath();
        g.arc(610, 52, 34, 0, 7);
        g.fill();
        g.fillStyle = '#fffbe0';
        g.beginPath();
        g.arc(610, 52, 18, 0, 7);
        g.fill();
        for (let i = 0; i < 5; i++) {
          // hazy floating islands far away
          const cx = 60 + i * 150 + rnd() * 50,
            cy = 70 + rnd() * 70,
            w = 50 + rnd() * 50;
          poly(
            g,
            [cx - w / 2, cy, cx + w / 2, cy, cx + w * 0.15, cy + w * 0.7, cx - w * 0.1, cy + w * 0.55],
            '#9ab4d4',
          );
          g.fillStyle = '#a8c8b0';
          g.fillRect(cx - w / 2, cy - 3, w, 4);
        }
        for (let i = 0; i < 26; i++) {
          g.fillStyle = 'rgba(255,255,255,0.85)';
          g.beginPath();
          g.arc(rnd() * BG_W, BG_H - 30 - rnd() * 40, 16 + rnd() * 20, 0, 7);
          g.fill();
        }
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        for (let i = 0; i < 3; i++) {
          // nearer floating rocks
          const cx = 120 + i * 250 + rnd() * 60,
            cy = 110 + rnd() * 40,
            w = 40 + rnd() * 30;
          poly(g, [cx - w / 2, cy, cx + w / 2, cy, cx + w * 0.1, cy + w * 0.9], '#7a84a4');
          g.fillStyle = '#6ab050';
          g.fillRect(cx - w / 2, cy - 4, w, 5);
        }
        for (let i = 0; i < 40; i++) {
          g.fillStyle = i & 1 ? '#ffffff' : '#e8f4fc';
          g.beginPath();
          g.arc(rnd() * BG_W, BG_H - 6 - rnd() * 26, 14 + rnd() * 16, 0, 7);
          g.fill();
        }
      },
    },
  ],
  snow: [
    {
      k: 0.1,
      ky: 0.4,
      paint(g, rnd) {
        skyGrad(g, [
          [0, '#030616'],
          [0.45, '#0a1a40'],
          [0.8, '#142a58'],
          [1, '#1c3060'],
        ]);
        for (let i = 0; i < 140; i++) {
          g.fillStyle = rnd() < 0.25 ? '#fcfcfc' : '#7088c0';
          g.fillRect((rnd() * BG_W) | 0, (rnd() * 180) | 0, 1, 1);
        }
        const bands = [
          ['#58f8a8', 40, 0],
          ['#a878f8', 70, 2],
          ['#58e8f8', 55, 4],
        ];
        for (const [c, base, ph] of bands)
          for (let x = 0; x < BG_W; x += 2) {
            const y = base + Math.sin(x * 0.012 + ph) * 22 + Math.sin(x * 0.031 + ph) * 8;
            for (let k = 0; k < 5; k++) {
              g.fillStyle = rgba(c, 0.07 - k * 0.012);
              g.fillRect(x, y + k * 8, 2, 8);
            }
          }
        let x = -40;
        while (x < BG_W) {
          const w = 150 + rnd() * 90,
            h = 140 + rnd() * 60,
            px = x + w / 2,
            top = BG_H - h;
          poly(g, [x, BG_H, px, top, x + w, BG_H], '#3e5e8c');
          poly(g, [px, top, x + w, BG_H, px + w * 0.1, BG_H], '#2e4a74');
          const cw = w * 0.15,
            ch = h * 0.3;
          poly(
            g,
            [
              px,
              top,
              px + cw,
              top + ch,
              px + cw * 0.4,
              top + ch * 0.8,
              px,
              top + ch,
              px - cw * 0.5,
              top + ch * 0.75,
              px - cw,
              top + ch,
            ],
            '#d8e8f8',
          );
          x += w * 0.6;
        }
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        g.fillStyle = '#0e2440';
        g.fillRect(0, BG_H - 26, BG_W, 26);
        for (let x = 0; x < BG_W; x += 18 + rnd() * 30) {
          const h = 50 + rnd() * 60,
            base = BG_H - 20;
          g.fillStyle = '#0a1a30';
          g.fillRect(x - 2, base - 10, 4, 14);
          for (let t = 0; t < 4; t++) {
            const ty = base - 10 - (t * h) / 5,
              tw = (4 - t) * 7 + 6;
            poly(g, [x - tw, ty, x, ty - h / 3, x + tw, ty], '#0e2440');
            g.fillStyle = '#c8d8ec';
            g.fillRect(x - tw + 2, ty - 2, tw * 0.6, 2);
          }
        }
      },
    },
  ],
  earth: [
    {
      k: 0.12,
      ky: 0.4,
      paint(g, rnd) {
        skyGrad(g, [
          [0, '#2a68b8'],
          [0.45, '#6aa8d8'],
          [0.85, '#d8c8a0'],
          [1, '#e8b880'],
        ]);
        for (let i = 0; i < 7; i++) {
          const cx = rnd() * BG_W,
            cy = 20 + rnd() * 80;
          g.fillStyle = 'rgba(255,255,255,0.75)';
          for (let k = 0; k < 5; k++) {
            g.beginPath();
            g.arc(cx + k * 12 - 24, cy + (k % 2) * 4, 10 + rnd() * 6, 0, 7);
            g.fill();
          }
        }
        let x = -20;
        while (x < BG_W) {
          const w = 70 + rnd() * 90,
            h = 60 + rnd() * 70,
            top = BG_H - h;
          poly(g, [x, BG_H, x + 14, top, x + w - 14, top, x + w, BG_H], '#b8684a');
          for (let s = top + 8; s < BG_H; s += 9) {
            g.fillStyle = ((s / 9) | 0) % 2 ? '#a05838' : '#c87858';
            g.fillRect(x + 14 - (s - top) * 0.15, s, w - 28 + (s - top) * 0.3, 2);
          }
          g.fillStyle = '#d88868';
          g.fillRect(x + 14, top, w - 28, 2);
          x += w + rnd() * 40;
        }
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        let x = 0;
        while (x < BG_W) {
          const r = 30 + rnd() * 40;
          g.fillStyle = '#7a4628';
          g.beginPath();
          g.arc(x, BG_H - 10, r, 0, 7);
          g.fill();
          g.fillStyle = '#8e5634';
          g.beginPath();
          g.arc(x - r * 0.3, BG_H - 10 - r * 0.5, r * 0.4, 0, 7);
          g.fill();
          if (rnd() < 0.5) {
            const cx = x + r * 0.6,
              ch = 22 + rnd() * 16;
            g.fillStyle = '#3a6a3a';
            g.fillRect(cx, BG_H - 30 - ch, 6, ch + 20);
            g.fillRect(cx - 7, BG_H - 30 - ch * 0.6, 4, ch * 0.4);
            g.fillRect(cx - 7, BG_H - 30 - ch * 0.3, 8, 3);
            g.fillRect(cx + 9, BG_H - 30 - ch * 0.8, 4, ch * 0.4);
            g.fillRect(cx + 5, BG_H - 30 - ch * 0.45, 8, 3);
          }
          x += r * 1.3;
        }
      },
    },
  ],
};

const _bgCache = {};
// Backgrounds are painted at fine-pixel density (2x) and drawn without smoothing, so they stay as crisp as the rest
// of the pixel art at any screen scale. The nearer layers (silhouettes) also get their edges hardened: their
// anti-aliased alpha is thresholded, so they read as clean pixel shapes against the sky.
function getBackground(theme) {
  if (!_bgCache[theme]) {
    const rnd = mulberry(theme.length * 977 + 13);
    _bgCache[theme] = BG_PAINTERS[theme].map((L, idx) => ({
      k: L.k,
      ky: L.ky,
      c: makeCanvas(BG_W * 2, BG_H * 2, g => {
        g.scale(2, 2);
        L.paint(g, rnd);
        if (idx > 0) {
          const img = g.getImageData(0, 0, BG_W * 2, BG_H * 2),
            d = img.data;
          for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 128 ? 255 : 0;
          g.putImageData(img, 0, 0);
        }
      }),
    }));
  }
  return _bgCache[theme];
}
function drawBackground(theme, cx, cy, maxCy) {
  const frac = maxCy > 0 ? Math.min(1, cy / maxCy) : 1,
    smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  for (const L of getBackground(theme)) {
    const x = Math.round((-(cx * L.k) % BG_W) * 2) / 2; // scroll in whole fine pixels
    const y = -Math.round(frac * 60 * L.ky);
    ctx.drawImage(L.c, x, y, BG_W, BG_H);
    ctx.drawImage(L.c, x + BG_W, y, BG_W, BG_H);
  }
  ctx.imageSmoothingEnabled = smooth;
}

// ================= TILESETS =================
// static tiles are painted once into the level canvas; lava, crumble blocks and the boss door are drawn per frame.
const tileHash = (tx, ty) => {
  let h = tx * 374761393 + ty * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return (h ^ (h >>> 16)) >>> 0;
};

function drawSpikes(F, x, y, light, dark, base, tip) {
  F(x, y + 13, 16, 3, base);
  for (let i = 0; i < 2; i++)
    for (let r = 0; r < 6; r++) {
      F(x + i * 8 + 3 - r, y + 1 + r * 2, 1 + r, 2, light);
      F(x + i * 8 + 4, y + 1 + r * 2, 1 + r, 2, dark);
    }
  if (tip) {
    F(x + 3, y + 1, 2, 1, tip);
    F(x + 11, y + 1, 2, 1, tip);
  }
}
function drawLadder(F, x, y, rail, rung, dark) {
  F(x + 2, y, 2, 16, rail);
  F(x + 12, y, 2, 16, rail);
  F(x + 3, y, 1, 16, dark);
  F(x + 13, y, 1, 16, dark);
  F(x + 4, y + 3, 8, 2, rung);
  F(x + 4, y + 11, 8, 2, rung);
  F(x + 4, y + 5, 8, 1, dark);
  F(x + 4, y + 13, 8, 1, dark);
}

const TILESETS = {
  cut: {
    ground(F, x, y, v, exp, tx) {
      F(x, y, 16, 16, v & 1 ? '#4a5468' : '#46505f');
      F(x, y, 16, 1, '#5e6a80');
      F(x, y, 1, 16, '#5a6478');
      F(x + 15, y, 1, 16, '#262c38');
      F(x, y + 15, 16, 1, '#262c38');
      for (const [rx, ry] of [
        [2, 2],
        [12, 2],
        [2, 12],
        [12, 12],
      ]) {
        F(x + rx, y + ry, 2, 2, '#7884a0');
        F(x + rx + 1, y + ry + 2, 2, 1, '#2a3040');
      }
      if (exp) {
        for (let i = 0; i < 4; i++) F(x + i * 4, y, 4, 4, (tx * 4 + i) & 1 ? '#f8c000' : '#26262e');
        F(x, y, 16, 1, '#fce070');
        F(x, y + 4, 16, 1, '#1a1e28');
      }
    },
    block(F, x, y) {
      F(x, y, 16, 16, '#3a3e4a');
      F(x, y, 15, 15, '#7a8090');
      F(x + 1, y + 1, 13, 13, '#8c92a2');
      F(x + 1, y + 1, 13, 1, '#b0b6c4');
      for (let k = 0; k < 12; k++) F(x + 1 + k, y + 1 + k, 2, 1, '#5a6070');
      F(x + 2, y + 12, 2, 2, '#b0b6c4');
      F(x + 11, y + 2, 2, 2, '#b0b6c4');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#d8dce8', '#8890a0', '#4a4e5a'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#c8c8d0', '#9898a8', '#5a5a68'),
  },
  fire: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#3a1812' : '#341510');
      F(x + (v % 13), y + ((v >> 4) % 13), 2, 2, '#4a2018');
      F(x + ((v >> 6) % 13), y + ((v >> 9) % 13), 2, 1, '#4a2018');
      if (v % 3 === 0) {
        F(x + 3, y + 8, 5, 1, '#c83c10');
        F(x + 7, y + 9, 5, 1, '#c83c10');
        F(x + 4, y + 8, 2, 1, '#f88830');
      }
      F(x + 15, y, 1, 16, '#200a08');
      F(x, y + 15, 16, 1, '#200a08');
      if (exp) {
        F(x, y, 16, 4, '#5a2618');
        F(x, y, 16, 1, '#f89038');
        F(x, y + 1, 16, 1, '#c8501c');
        F(x + (v % 10), y + 4, 5, 1, '#5a2618');
      }
    },
    block(F, x, y, v) {
      F(x, y, 16, 16, '#1e0806');
      F(x, y, 7, 7, '#6a2216');
      F(x + 8, y, 8, 7, '#6a2216');
      F(x, y + 8, 3, 7, '#6a2216');
      F(x + 4, y + 8, 8, 7, '#6a2216');
      F(x + 13, y + 8, 3, 7, '#6a2216');
      F(x, y, 7, 1, '#a83a22');
      F(x + 8, y, 8, 1, '#a83a22');
      F(x + 4, y + 8, 8, 1, '#a83a22');
      if (v % 4 === 0) F(x + 6, y + 3, 3, 1, '#e8601c');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#6a5a6a', '#2a2230', '#1a1018', '#f86018'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#a87050', '#8a5838', '#4a2a18'),
  },
  snow: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#4a6a98' : '#46648f');
      F(x + (v % 11), y + ((v >> 3) % 7) + 6, 3, 1, '#6a8ab8');
      F(x + ((v >> 5) % 12), y + ((v >> 8) % 6) + 9, 2, 1, '#6a8ab8');
      F(x + 15, y, 1, 16, '#2a3e60');
      F(x, y + 15, 16, 1, '#2a3e60');
      if (exp) {
        F(x, y, 16, 5, '#f0f8ff');
        F(x, y, 16, 1, '#ffffff');
        F(x + (v % 4), y + 5, 5, 1, '#f0f8ff');
        F(x + 8 + (v % 3), y + 5, 4, 1, '#f0f8ff');
        F(x, y + 4, 16, 1, '#c8dcf0');
      }
    },
    block(F, x, y) {
      F(x, y, 16, 16, '#4a90c0');
      F(x + 1, y + 1, 14, 14, '#8ccff0');
      F(x + 2, y + 2, 12, 12, '#a8e0f8');
      for (let k = 0; k < 6; k++) {
        F(x + 3 + k, y + 9 - k, 1, 1, '#fcfcfc');
        F(x + 6 + k, y + 12 - k, 1, 1, '#e0f8fc');
      }
      F(x + 1, y + 1, 14, 1, '#e0f8fc');
    },
    ice(F, x, y) {
      F(x, y, 16, 16, '#68b0d8');
      F(x, y, 16, 15, '#a8e4fc');
      F(x, y, 16, 2, '#f0fcff');
      for (let k = 0; k < 5; k++) {
        F(x + 4 + k, y + 10 - k, 1, 1, '#e0f8fc');
        F(x + 10 + k, y + 13 - k, 1, 1, '#d0f4fc');
      }
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#d0f4fc', '#78b8e0', '#4a7aa8'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#d0d8e8', '#a8b8d0', '#6a7a98'),
  },
  elec: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#262a3a' : '#232736');
      const ty = y + 6 + (v % 5),
        tx = x + 3 + ((v >> 3) % 8);
      F(x + 2, ty, 12, 1, '#363e58');
      F(tx, ty, 1, 16 - (ty - y) - 2, '#363e58');
      F(tx - 1, y + 13, 3, 2, '#4a5474');
      F(x + 15, y, 1, 16, '#16192a');
      F(x, y + 15, 16, 1, '#16192a');
      if (exp) {
        F(x, y, 16, 5, '#4a5068');
        F(x, y, 16, 1, '#8a96b8');
        F(x, y + 5, 16, 1, '#12141f');
        F(x, y + 2, 16, 1, '#a88800');
        if (v & 2) F(x + 4 + (v % 6), y + 2, 4, 1, '#f8e030');
      }
    },
    block(F, x, y) {
      F(x, y, 16, 16, '#1a1c28');
      F(x + 1, y + 1, 14, 14, '#4a5578');
      F(x + 1, y + 1, 14, 1, '#7a88b0');
      F(x + 1, y + 14, 14, 1, '#323a54');
      F(x + 8, y + 3, 3, 3, '#f8d800');
      F(x + 6, y + 6, 4, 2, '#f8d800');
      F(x + 6, y + 8, 2, 2, '#f8d800');
      F(x + 5, y + 10, 2, 3, '#f8d800');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#c8d0e0', '#6a7490', '#2a3044', '#f8d800'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#8a96b8', '#c8a800', '#3a4258'),
  },
  wind: {
    ground(F, x, y, v, exp) {
      // floating cloudstone with grass on top
      F(x, y, 16, 16, v & 1 ? '#8a8aa8' : '#8686a2');
      F(x + (v % 12) + 1, y + ((v >> 4) % 10) + 4, 3, 2, '#9c9cba');
      F(x + ((v >> 7) % 12), y + ((v >> 11) % 10) + 3, 2, 2, '#6e6e8c');
      F(x + 15, y, 1, 16, '#5a5a78');
      F(x, y + 15, 16, 1, '#5a5a78');
      if (exp) {
        F(x, y, 16, 4, '#78c858');
        F(x, y, 16, 1, '#a8e878');
        F(x, y + 4, 16, 1, '#4a8a3a');
        F(x + (v % 10) + 2, y + 4, 3, 2, '#78c858');
      }
    },
    block(F, x, y) {
      // sky-castle marble with gold trim
      F(x, y, 16, 16, '#9898b0');
      F(x + 1, y + 1, 14, 14, '#e8e8f4');
      F(x + 1, y + 1, 14, 2, '#d8b858');
      F(x + 1, y + 13, 14, 1, '#c8c8dc');
      F(x + 4, y + 5, 1, 6, '#c8c8dc');
      F(x + 11, y + 5, 1, 6, '#c8c8dc');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#e8f0f8', '#8898b8', '#5a6a8a', '#78f8c8'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#d8b858', '#f0d878', '#8a7030'),
  },
  earth: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#7a4c2a' : '#744828');
      F(x + (v % 12) + 1, y + ((v >> 4) % 9) + 5, 3, 2, '#946036');
      F(x + ((v >> 7) % 12), y + ((v >> 11) % 10) + 4, 2, 2, '#5a3418');
      F(x + 15, y, 1, 16, '#4a2c16');
      F(x, y + 15, 16, 1, '#4a2c16');
      if (exp) {
        F(x, y, 16, 4, '#4a9a30');
        F(x, y, 16, 1, '#8ad058');
        F(x, y + 4, 16, 1, '#2a5a1a');
        F(x + (v % 10) + 2, y + 4, 3, 2, '#4a9a30');
        F(x + (v % 12) + 1, y - 2, 1, 2, '#6ab840');
        F(x + ((v >> 3) % 12) + 2, y - 1, 1, 1, '#6ab840');
      }
    },
    block(F, x, y) {
      F(x, y, 16, 16, '#5e5648');
      F(x, y, 7, 7, '#9a9282');
      F(x + 8, y, 8, 7, '#9a9282');
      F(x, y + 8, 3, 7, '#9a9282');
      F(x + 4, y + 8, 8, 7, '#9a9282');
      F(x + 13, y + 8, 3, 7, '#9a9282');
      F(x, y, 7, 1, '#bab2a2');
      F(x + 8, y, 8, 1, '#bab2a2');
      F(x + 4, y + 8, 8, 1, '#bab2a2');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#c8c0b0', '#7a7262', '#4a4236'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#a87038', '#c89058', '#5a3818'),
  },
};
const SOLIDISH = '#=I^CDX<>QYU'; // tiles that hide the exposed top (grass, snow, rails) of the ground under them

// cells drawn over a dark cave wall: every 'b', plus ladders, spikes and crumbling blocks touching one (so a
// ladder down a shaft or spikes on a cave floor do not show the sky behind them)
function backdropCells(lv) {
  const m = lv.map,
    back = new Set(),
    q = [];
  for (let y = 0; y < lv.LH; y++)
    for (let x = 0; x < lv.LW; x++)
      if (m[y][x] === 'b') {
        back.add(y * lv.LW + x);
        q.push([x, y]);
      }
  while (q.length) {
    const [x, y] = q.pop();
    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= lv.LW || ny >= lv.LH || back.has(ny * lv.LW + nx) || !'H^CW'.includes(m[ny][nx]))
        continue;
      back.add(ny * lv.LW + nx);
      q.push([nx, ny]);
    }
  }
  return back;
}

// The tile map is painted at fine-pixel density (2x) in vertical chunks of LEVEL_CHUNK columns, rendered when they
// scroll into view and dropped when far away, so the whole 300x44 map never sits in memory at 2x.
const LEVEL_CHUNK = 32;
function makeLevelArt(lv) {
  return { lv, back: backdropCells(lv), chunks: new Map() };
}
function levelChunk(art, i) {
  let c = art.chunks.get(i);
  if (c) return c;
  if (art.chunks.size >= 4) art.chunks.delete(art.chunks.keys().next().value); // oldest first
  const lv = art.lv,
    x0 = i * LEVEL_CHUNK,
    x1 = Math.min(lv.LW, x0 + LEVEL_CHUNK);
  c = makeCanvas((x1 - x0) * TILE * 2, lv.LH * TILE * 2, g => {
    g.scale(2, 2);
    g.translate(-x0 * TILE, 0);
    paintTiles(g, art, x0, x1);
  });
  art.chunks.set(i, c);
  return c;
}
function drawLevel(art, cx, cy) {
  const w = LEVEL_CHUNK * TILE,
    smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  for (let i = Math.floor(cx / w); i <= Math.floor((cx + VW - 1) / w); i++) {
    const c = levelChunk(art, i);
    ctx.drawImage(c, i * w - cx, -cy, c.width / 2, c.height / 2);
  }
  ctx.imageSmoothingEnabled = smooth;
}
// fine-pixel finish on a solid tile: a few light and dark specks for texture and a one-fine-pixel bevel
function finishTile(F, x, y, v) {
  F(x + (v % 15) + 0.5, y + ((v >> 4) % 14) + 1, 0.5, 0.5, 'rgba(255,255,255,0.22)');
  F(x + ((v >> 8) % 15) + 0.5, y + ((v >> 12) % 14) + 1, 0.5, 0.5, 'rgba(0,0,0,0.25)');
  F(x + ((v >> 16) % 14) + 1, y + ((v >> 20) % 13) + 2, 1, 0.5, 'rgba(0,0,0,0.18)');
  F(x, y, 16, 0.5, 'rgba(255,255,255,0.12)');
  F(x, y + 15.5, 16, 0.5, 'rgba(0,0,0,0.2)');
}
function paintTiles(g, art, x0, x1) {
  const lv = art.lv,
    ts = TILESETS[lv.theme],
    back = art.back;
  {
    const F = (x, y, w, h, c) => {
      g.fillStyle = c;
      g.fillRect(x, y, w, h);
    };
    for (let ty = 0; ty < lv.LH; ty++)
      for (let tx = x0; tx < x1; tx++) {
        const t = lv.map[ty][tx],
          x = tx * TILE,
          y = ty * TILE,
          v = tileHash(tx, ty);
        const above = ty > 0 ? lv.map[ty - 1][tx] : '.';
        const exp = !SOLIDISH.includes(above);
        if (back.has(ty * lv.LW + tx)) {
          ts.ground(F, x, y, v, false, tx);
          F(x, y, 16, 16, 'rgba(4,4,14,0.62)');
        }
        if (t === 'X' && lv.theme === 'wind') {
          // sky stage: the abyss is a sea of clouds far below
          if (above !== 'X') {
            F(x, y + 6, 16, 10, 'rgba(244,248,255,0.85)');
            g.fillStyle = 'rgba(255,255,255,0.9)';
            g.beginPath();
            g.arc(x + (v % 8) + 4, y + 8, 7, 0, 7);
            g.fill();
          } else F(x, y, 16, 16, 'rgba(226,238,252,0.55)');
          continue;
        }
        if (t === 'X') {
          // abyss: fades to black from its top row
          if (above === 'X') F(x, y, 16, 16, '#000000');
          else for (let r = 0; r < 16; r += 2) F(x, y + r, 16, 2, `rgba(0,0,0,${(0.15 + r / 18).toFixed(2)})`);
          continue;
        }
        if (t === '#') {
          ts.ground(F, x, y, v, exp, tx);
          finishTile(F, x, y, v);
        } else if (t === '=') {
          ts.block(F, x, y, v);
          finishTile(F, x, y, v);
        } else if (t === 'I') {
          (ts.ice || ts.block)(F, x, y, v);
          finishTile(F, x, y, v);
        } else if (t === '^') ts.spike(F, x, y);
        else if (t === 'H') ts.ladder(F, x, y);
        else if (t === 'Q') {
          // quicksand
          F(x, y, 16, 16, '#c8a060');
          F(x + (v % 13), y + 2 + ((v >> 4) % 12), 2, 1, '#a88040');
          F(x + ((v >> 7) % 14), y + 3 + ((v >> 10) % 11), 1, 1, '#e8c890');
          F(x + ((v >> 3) % 12), y + 6 + ((v >> 12) % 8), 3, 1, '#b89050');
          if (above !== 'Q') {
            F(x, y, 16, 2, '#e8d0a0');
            F(x + 2 + (v % 4), y + 4, 5, 1, '#b89050');
            F(x + 9 - (v % 3), y + 7, 5, 1, '#b89050');
          }
        }
      }
    const paint = ROOM_ART[lv.theme],
      rx = lv.doorCol + 1;
    if (paint && rx < x1 && rx + 22 > x0) paint(g, rx * TILE, 13 * TILE, 22 * TILE, 9 * TILE);
  }
}

// ================= BOSS ROOM WALL ART =================
// static, dimmed decorations painted over the boss room's back wall (x, y, w, h = the room interior)
const ROOM_ART = {
  cut(g, x, y, w, h) {
    // hazard stripes, rivet panels and a huge industrial saw blade
    for (let i = 0; i < w; i += 8) {
      g.fillStyle = (i / 8) & 1 ? '#5a4a18' : '#1a1a20';
      g.beginPath();
      g.moveTo(x + i, y + 4);
      g.lineTo(x + i + 8, y + 4);
      g.lineTo(x + i + 4, y + 10);
      g.lineTo(x + i - 4, y + 10);
      g.fill();
    }
    g.fillStyle = '#2a2e3a';
    for (let i = 24; i < w; i += 48) g.fillRect(x + i, y + 18, 2, h - 26);
    const cx = x + w / 2,
      cy = y + h / 2 + 4,
      rb = 48;
    const blade = (r, tooth, col) => {
      g.fillStyle = col;
      g.beginPath();
      for (let k = 0; k < 48; k++) {
        const a = (k * Math.PI) / 24,
          rr = k % 2 ? r : r - tooth;
        g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      g.closePath();
      g.fill();
    };
    blade(rb + 1.5, 7, '#1a1c24');
    blade(rb, 7, '#3e4452');
    g.fillStyle = '#4a5262';
    g.beginPath();
    g.arc(cx, cy, rb - 11, 0, 7);
    g.fill();
    g.strokeStyle = '#3a404e';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(cx, cy, rb - 20, 0, 7);
    g.stroke();
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      g.fillStyle = '#2a2e3a';
      g.beginPath();
      g.arc(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26, 4, 0, 7);
      g.fill();
    }
    g.fillStyle = '#2a2e3a';
    g.beginPath();
    g.arc(cx, cy, 13, 0, 7);
    g.fill();
    g.fillStyle = '#6a7282';
    g.beginPath();
    g.arc(cx, cy, 8, 0, 7);
    g.fill();
    g.fillStyle = '#1a1c24';
    g.beginPath();
    g.arc(cx, cy, 3, 0, 7);
    g.fill();
  },
  fire(g, x, y, w, h) {
    // glowing magma cracks and two lava-fall channels (the flow itself is animated)
    const rnd = mulberry(77);
    g.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      let px = x + 60 + rnd() * (w - 120),
        py = y + 10 + rnd() * (h - 30);
      g.strokeStyle = i & 1 ? '#7a1808' : '#a82c10';
      g.beginPath();
      g.moveTo(px, py);
      for (let k = 0; k < 4; k++) {
        px += (rnd() - 0.5) * 30;
        py += 8 + rnd() * 12;
        g.lineTo(px, py);
      }
      g.stroke();
    }
    g.fillStyle = '#1a0604';
    g.fillRect(x + 30, y, 20, h);
    g.fillRect(x + w - 50, y, 20, h);
    g.fillStyle = 'rgba(248,96,24,0.25)';
    g.fillRect(x, y + h - 10, w, 10);
  },
  elec(g, x, y, w, h) {
    // tesla coils in the corners, cables, warning signs
    for (const cx of [x + 28, x + w - 28]) {
      g.fillStyle = '#2a2e44';
      g.fillRect(cx - 12, y + h - 30, 24, 30);
      g.fillStyle = '#4a5070';
      for (let k = 0; k < 6; k++) g.fillRect(cx - 9 + (k & 1), y + 38 + k * 12, 18 - (k & 1) * 2, 6);
      g.fillStyle = '#6a7090';
      g.beginPath();
      g.arc(cx, y + 30, 9, 0, 7);
      g.fill();
      g.fillStyle = '#9aa0c0';
      g.beginPath();
      g.arc(cx - 2, y + 28, 3, 0, 7);
      g.fill();
    }
    g.strokeStyle = '#1a1c2a';
    g.lineWidth = 3;
    for (const o of [0, 10]) {
      g.beginPath();
      g.moveTo(x + 40, y + 8 + o);
      g.quadraticCurveTo(x + w / 2, y + 40 + o, x + w - 40, y + 8 + o);
      g.stroke();
    }
    for (const sx of [x + w / 2 - 70, x + w / 2 + 70]) {
      g.fillStyle = '#6a5800';
      g.beginPath();
      g.moveTo(sx, y + 70);
      g.lineTo(sx + 14, y + 94);
      g.lineTo(sx - 14, y + 94);
      g.fill();
      g.fillStyle = '#1a1a20';
      g.fillRect(sx - 1, y + 77, 3, 6);
      g.fillRect(sx - 3, y + 82, 5, 2);
      g.fillRect(sx - 2, y + 84, 3, 6);
    }
  },
  snow(g, x, y, w, h) {
    // frost along the top, ice crystals in the corners and a big snowflake
    g.fillStyle = 'rgba(200,232,252,0.35)';
    for (let i = 0; i < w; i += 10) {
      g.beginPath();
      g.moveTo(x + i, y);
      g.lineTo(x + i + 10, y);
      g.lineTo(x + i + 5, y + 6 + ((i * 7) % 9));
      g.fill();
    }
    for (const [cx, sgn] of [
      [x + 6, 1],
      [x + w - 6, -1],
    ])
      for (let k = 0; k < 5; k++) {
        const bx = cx + sgn * k * 12,
          hh = 30 + ((k * 13) % 4) * 12;
        g.fillStyle = k & 1 ? '#5a88b8' : '#78a8d0';
        g.beginPath();
        g.moveTo(bx - 6, y + h);
        g.lineTo(bx, y + h - hh);
        g.lineTo(bx + 6, y + h);
        g.fill();
        g.fillStyle = '#a8d0f0';
        g.fillRect(bx - 1, y + h - hh + 6, 1, hh - 10);
      }
    g.strokeStyle = 'rgba(168,208,240,0.45)';
    g.lineWidth = 3;
    const cx = x + w / 2,
      cy = y + h / 2;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3,
        ex = Math.cos(a) * 44,
        ey = Math.sin(a) * 44;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + ex, cy + ey);
      g.stroke();
      for (const t of [0.5, 0.75])
        for (const s of [-1, 1]) {
          const bx = cx + ex * t,
            by = cy + ey * t,
            b = a + s * 0.8;
          g.beginPath();
          g.moveTo(bx, by);
          g.lineTo(bx + Math.cos(b) * 10, by + Math.sin(b) * 10);
          g.stroke();
        }
    }
  },
  wind(g, x, y, w, h) {
    // arched windows onto the sky, marble pillars and a swirl emblem
    for (const wx of [x + 44, x + w - 104]) {
      g.fillStyle = '#8ac8f0';
      g.fillRect(wx, y + 34, 60, 70);
      g.beginPath();
      g.arc(wx + 30, y + 34, 30, Math.PI, 0);
      g.fill();
      g.fillStyle = '#ffffff';
      for (const [cx, cy, r] of [
        [14, 80, 10],
        [26, 84, 12],
        [42, 82, 9],
        [50, 60, 6],
      ]) {
        g.beginPath();
        g.arc(wx + cx, y + cy, r, 0, 7);
        g.fill();
      }
      g.fillStyle = '#d8b858';
      g.fillRect(wx - 3, y + 102, 66, 4);
    }
    for (const px of [x + 14, x + w - 26]) {
      g.fillStyle = '#b8b8cc';
      g.fillRect(px, y + 8, 12, h - 8);
      g.fillStyle = '#d8b858';
      g.fillRect(px - 2, y + 6, 16, 4);
      g.fillRect(px - 2, y + h - 4, 16, 4);
    }
    g.strokeStyle = 'rgba(120,232,200,0.55)';
    g.lineWidth = 3;
    const cx = x + w / 2,
      cy = y + 64;
    g.beginPath();
    for (let a = 0; a < 12; a += 0.2) {
      const r = 3 + a * 2.4;
      g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8);
    }
    g.stroke();
  },
  earth(g, x, y, w, h) {
    // rock strata, timber mine supports and embedded gems
    for (let k = 0; k < 5; k++) {
      g.fillStyle = k & 1 ? 'rgba(90,52,24,0.55)' : 'rgba(140,90,50,0.35)';
      g.fillRect(x, y + 14 + k * 26 + (k % 2) * 4, w, 8);
    }
    for (const px of [x + 50, x + w - 60]) {
      g.fillStyle = '#4a2e14';
      g.fillRect(px, y + 10, 10, h - 10);
      g.fillStyle = '#5e3c1c';
      g.fillRect(px + 2, y + 10, 3, h - 10);
    }
    g.fillStyle = '#4a2e14';
    g.fillRect(x + 44, y + 8, w - 98, 10);
    g.fillStyle = '#5e3c1c';
    g.fillRect(x + 44, y + 9, w - 98, 3);
    const rnd = mulberry(31),
      gems = ['#58d8f8', '#f878b8', '#78f878', '#f8d858'];
    for (let i = 0; i < 9; i++) {
      const gx = x + 80 + rnd() * (w - 160),
        gy = y + 30 + rnd() * (h - 50),
        c = gems[i % 4],
        s = 4 + (i % 3) * 2;
      g.fillStyle = shade(c, -0.45);
      g.beginPath();
      g.moveTo(gx, gy - s);
      g.lineTo(gx + s, gy);
      g.lineTo(gx, gy + s);
      g.lineTo(gx - s, gy);
      g.fill();
      g.fillStyle = shade(c, -0.15);
      g.fillRect(gx - 1, gy - s + 2, 2, 2);
    }
  },
};
