'use strict';
// Native characters: Nexo and every boss, drawn in code (after their character sheets where there are any: the sheets
// are only the reference, nothing is cut out of them). A character is a skeleton posed by joint angles and dressed
// with shapes: hair, helmets, armour plates, gauntlets, boots and weapons. Every frame is rasterised without
// anti-aliasing at the screen's own pixel density, k fine pixels per box unit (1 when SCALE is 2, 2 at 4, 3 at 6 and
// in the 3x views), so it is pixel art at every size: each part gets a one-pixel outline (a dark shade of the part
// inside the body, black round the silhouette) and is cel-shaded from the top left, and the eyes are pixel maps drawn
// by hand for each k. All frames share one body, so nothing jumps when they change, and running legs are placed by
// inverse kinematics on a foot path whose planted part moves back exactly as fast as the character runs, so a planted
// foot never slides.
//
// Units: the 24 x 24 logical box of drawRobot is 48 x 48 box units (a unit is one fine pixel at k = 1), facing right,
// feet on y = 48. Angles are degrees: 0 points down, positive swings forward (toward the facing side), 180 is up.
//
// NATIVE_CHARS[style] = {
//   body: measurements that differ from NC_BODY,
//   colors(pal): the colour of each letter (pal is the palette drawRobot gets: weapon colours, hit flash, grayscale),
//   flat, hair, skin: the letters that are not cel-shaded, shaded like hair, and shaded softly like skin,
//   frame(pose, fr, arm, big, opt): the pose to draw (an object from ncPose, with a unique id for the caches),
//   draw(G, J, P): dresses the posed skeleton J (see ncSolve) on the grid G (see ncGrid),
//   before(P, J, at, c), after(P, J, at, c): optional, drawn behind and over the frame with the canvas and with
//     drawNativeProp (flames, spinning blades, glows); at(x, y) gives the logical position of a box point, and
//     c = { flip, pal, big, opt, style } what the frame is drawn with.
// }
// opt is what drawRobot gets from its caller: for a boss its state, t, armT, landT, vy, mode, enr and blade.
const NATIVE_CHARS = {};

// ---------- rasterising ----------
// the drawing area in box units: the box starts at (NC_X, NC_Y), with room round it for hair, crests and weapons
const NC_W = 88,
  NC_H = 80,
  NC_X = 20,
  NC_Y = 26;
const ncLine = k => Math.max(1, Math.round(k * 0.67)); // outline width in fine pixels
const _ncScratch = {};
// a shape rasterised to a 0/1 mask of fine pixels (alpha of at least half, no anti-aliasing) with its bounding box;
// dy moves it down (a pose is moved so its feet stand on the floor)
function ncMask(draw, k, dy) {
  let s = _ncScratch[k];
  if (!s) {
    const c = document.createElement('canvas');
    c.width = NC_W * k;
    c.height = NC_H * k;
    s = _ncScratch[k] = { c, g: c.getContext('2d', { willReadFrequently: true }) };
  }
  const { c, g } = s,
    W = c.width,
    H = c.height;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H);
  g.save(); // shapes may clip or transform; nothing leaks into the next one
  g.translate(NC_X * k, (NC_Y + dy) * k);
  g.scale(k, k);
  g.fillStyle = g.strokeStyle = '#fff';
  g.lineCap = g.lineJoin = 'round';
  g.beginPath();
  draw(g);
  g.restore();
  const d = g.getImageData(0, 0, W, H).data,
    m = new Uint8Array(W * H);
  let x0 = W,
    y0 = H,
    x1 = -1,
    y1 = -1;
  for (let y = 0, i = 0; y < H; y++)
    for (let x = 0; x < W; x++, i++)
      if (d[i * 4 + 3] >= 128) {
        m[i] = 1;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
  m.box = [x0, y0, x1, y1];
  return m;
}
// shape helpers: each returns a draw function for ncMask (box coordinates)
const NC_SHAPES = {
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

  // a curved, tapering strand along a quadratic curve from (x0, y0) bending toward (cx, cy) to (x1, y1), w0 wide at
  // the start and w1 at the end (hair locks, fins, crests, horns)
  strand:
    (x0, y0, cx, cy, x1, y1, w0, w1 = 0) =>
    g => {
      const n = 14,
        a = [],
        b = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n,
          u = 1 - t,
          x = u * u * x0 + 2 * u * t * cx + t * t * x1,
          y = u * u * y0 + 2 * u * t * cy + t * t * y1,
          dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx),
          dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy),
          l = Math.hypot(dx, dy) || 1,
          w = (w0 + (w1 - w0) * t) / 2;
        a.push([x - (dy / l) * w, y + (dx / l) * w]);
        b.push([x + (dy / l) * w, y - (dx / l) * w]);
      }
      for (const [x, y] of a.concat(b.reverse())) g.lineTo(x, y);
      g.closePath();
      g.fill();
    },
  // a triangle on a base w wide centred on (x, y), pointing in direction a for len
  spike: (x, y, a, len, w) => g => {
    const [tx, ty] = along(x, y, a, len),
      px = (Math.cos(rad(a)) * w) / 2,
      py = (-Math.sin(rad(a)) * w) / 2;
    g.moveTo(x + px, y + py);
    g.lineTo(tx, ty);
    g.lineTo(x - px, y - py);
    g.closePath();
    g.fill();
  },
  // a shape moved to (x, y), turned rot degrees clockwise and scaled
  xf:
    (d, x, y, rot = 0, sx = 1, sy = 1) =>
    g => {
      g.translate(x, y);
      g.rotate(rad(rot));
      g.scale(sx, sy);
      d(g);
    },
  // several shapes as one part (one outline round all of them)
  all:
    (...ds) =>
    g => {
      for (const d of ds) {
        g.beginPath();
        d(g);
      }
    },
  // a straight band w wide from (x1, y1) to (x2, y2) with square ends (cuffs, rings, belts across a limb)
  bar: (x1, y1, x2, y2, w) => g => {
    g.lineCap = 'butt';
    g.lineWidth = w;
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
  },
  // a ring between radius r1 and r2
  annulus: (x, y, r1, r2) => g => {
    g.arc(x, y, r2, 0, Math.PI * 2);
    g.arc(x, y, r1, Math.PI * 2, 0, true);
    g.fill();
  },
};
// the grid a frame is built on: a letter per fine pixel, plus the part each outline pixel belongs to (inner outlines
// are drawn in a dark shade of that part, only the silhouette stays black)
const NC_K = 75; // 'K', the outline
function ncGrid(k, dy) {
  const W = NC_W * k,
    H = NC_H * k,
    line = ncLine(k),
    px = new Uint8Array(W * H),
    own = new Uint8Array(W * H);
  // a mask: its outline ring first (over whatever is under it), then its pixels
  const stamp = (c, m, ring) => {
    const [x0, y0, x1, y1] = m.box,
      code = c.charCodeAt(0);
    if (x1 < 0) return;
    if (ring)
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          const i = y * W + x;
          if (!m[i] || (m[i - 1] && m[i + 1] && m[i - W] && m[i + W])) continue; // only the edge has a ring
          for (let dy2 = -line; dy2 <= line; dy2++)
            for (let dx2 = -line; dx2 <= line; dx2++) {
              const xx = x + dx2,
                yy = y + dy2,
                j = yy * W + xx;
              if (xx < 0 || yy < 0 || xx >= W || yy >= H || m[j]) continue;
              px[j] = NC_K;
              own[j] = code;
            }
        }
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const i = y * W + x;
        if (m[i]) {
          px[i] = code;
          own[i] = 0;
        }
      }
  };
  return {
    k,
    W,
    H,
    px,
    own,
    dy,
    // a part: its outline, then its pixels
    shape: (c, draw, ring = true) => stamp(c, ncMask(draw, k, dy), ring),
    // detail painted onto parts already there (letters in onto): stripes, panels, cracks, shines
    paint: (c, draw, onto) => {
      const m = ncMask(draw, k, dy),
        [x0, y0, x1, y1] = m.box,
        code = c.charCodeAt(0),
        ok = new Set([...onto].map(ch => ch.charCodeAt(0)));
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          const i = y * W + x;
          if (m[i] && ok.has(px[i])) px[i] = code;
        }
    },
    // a pixel map of fine pixels ('.' is clear) with its top left at box point (bx, by)
    map: (rows, bx, by) => {
      const x0 = Math.round((NC_X + bx) * k),
        y0 = Math.round((NC_Y + by + dy) * k);
      rows.forEach((r, y) => {
        for (let x = 0; x < r.length; x++) {
          if (r[x] === '.') continue;
          const gx = x0 + x,
            gy = y0 + y;
          if (gx < 0 || gy < 0 || gx >= W || gy >= H) continue;
          px[gy * W + gx] = r.charCodeAt(x);
          own[gy * W + gx] = 0;
        }
      });
    },
  };
}
// paints a grid: each part lit from the top left of the screen (a light top edge, a softer left edge, a deeper shadow
// band at the bottom and a darker right edge), hair and skin more softly; flat letters keep their colour. flip
// mirrors the frame (the light stays on the top left). The bitmap is cropped to the drawn pixels: { c, x, y } with
// x, y the grid pixel of its top left (x counted in the mirrored grid when flipped)
function ncPaint(G, cols, kinds, flip) {
  const { W, H, px, own, k } = G,
    lt = ncLine(k),
    dk = lt * 2,
    L = flip ? 1 : -1; // a step toward the left of the screen, in grid columns
  let x0 = W,
    y0 = H,
    x1 = 0,
    y1 = 0;
  for (let y = 0, i = 0; y < H; y++)
    for (let x = 0; x < W; x++, i++)
      if (px[i]) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
  if (x1 < x0) return { c: makeCanvas(1, 1), x: 0, y: 0 };
  const cw = x1 - x0 + 1,
    chh = y1 - y0 + 1,
    ox = flip ? W - 1 - x1 : x0,
    c = makeCanvas(cw, chh),
    g = c.getContext('2d'),
    img = g.createImageData(cw, chh),
    d = img.data;
  const tone = {};
  for (const ch in cols) {
    const b = cols[ch];
    tone[ch.charCodeAt(0)] = [
      b,
      ...[0.42, 0.16, -0.3, -0.2, -0.62, 0.22, -0.28, 0.25, -0.12].map(a => shade(b, a)),
    ].map(hexToRgb);
  }
  const none = [hexToRgb('#ff00ff')],
    at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : px[y * W + x]),
    differs = (x, y, dx, dy, n, cc) => {
      for (let i = 1; i <= n; i++) if (at(x + dx * i, y + dy * i) !== cc) return true;
      return false;
    };
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const cc = px[y * W + x];
      if (!cc) continue;
      let rgb;
      if (cc === NC_K) {
        const o = own[y * W + x];
        let open = !o || !tone[o];
        for (let n = 1; n <= lt && !open; n++) open = !at(x - n, y) || !at(x + n, y) || !at(x, y - n) || !at(x, y + n);
        rgb = open ? (tone[NC_K] || none)[0] : tone[o][5];
      } else {
        const T = tone[cc] || none,
          kind = kinds[cc];
        if (T === none || kind === 'flat') rgb = T[0];
        else if (kind === 'hair')
          rgb = differs(x, y, 0, -1, lt, cc)
            ? T[6]
            : differs(x, y, 0, 1, dk, cc) || differs(x, y, -L, 0, lt, cc)
              ? T[7]
              : T[0];
        else if (kind === 'skin')
          rgb = differs(x, y, 0, -1, lt, cc)
            ? T[8]
            : differs(x, y, 0, 1, lt, cc) || differs(x, y, -L, 0, lt, cc)
              ? T[9]
              : T[0];
        else
          rgb = differs(x, y, 0, -1, lt, cc)
            ? T[1]
            : differs(x, y, L, 0, lt, cc)
              ? T[2]
              : differs(x, y, 0, 1, dk, cc)
                ? T[3]
                : differs(x, y, -L, 0, lt, cc)
                  ? T[4]
                  : T[0];
      }
      const o = ((y - y0) * cw + (flip ? W - 1 - x : x) - ox) * 4;
      d[o] = rgb[0];
      d[o + 1] = rgb[1];
      d[o + 2] = rgb[2];
      d[o + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  return { c, x: ox, y: y0 };
}
// a fixed set of colours for a palette: all white (the outline kept) for the hit flash, or in grayscale for a
// defeated boss; pal.shadow: a dark silhouette (the shadow clones), each colour turned to its brightness between pal.B
// and pal.b
function ncFixed(cols, pal) {
  if (pal !== PAL_WHITE && !pal.gray && !pal.shadow) return cols;
  const c = {};
  for (const k in cols)
    if (pal.shadow) {
      const [r, g, b] = hexRgb(cols[k]);
      c[k] = k === 'K' ? '#06040c' : mixHex(pal.B, pal.b, Math.min(1, (0.299 * r + 0.587 * g + 0.114 * b) / 200));
    } else c[k] = pal.gray ? grayHex(cols[k]) : k === 'K' ? cols.K : '#fcfcfc';
  return c;
}

// ---------- skeleton ----------
// body measurements (box units, facing right): the hip joints, leg bones and the foot under the ankle (ankleH down
// to the sole, toe and heel along it), the shoulders, arm bones, neck, chest and head centre
const NC_BODY = {
  hipX: 24,
  hipY: 31.4,
  hipW: 2.6,
  thigh: 7.4,
  shin: 5.2,
  ankleH: 4.8,
  toe: 8,
  heel: 4.4,
  shB: [18.6, 19.6],
  shF: [30, 20],
  upper: 3.6,
  fore: 4.6,
  neck: [24.8, 17.6],
  chest: [24.8, 22.2],
  head: [24.6, 10.4],
};
// a pose: { id, legs: { b, f }: [thigh, shin, foot tilt (positive lifts the toe)], arms: { b, f }: [upper, fore],
// lean: degrees the upper body leans forward, breath: units the chest and head sink, dx, dy: the whole body moved,
// head: [dx, dy] for the head alone, air: true to keep the hip where it is instead of standing the feet on the floor,
// plus anything a character's draw function reads (gun, face, back, ...) }
function ncPose(id, p) {
  return Object.assign({ id, legs: { b: [-20, -20, 0], f: [20, -5, 0] }, arms: { b: [-10, 40], f: [20, 60] } }, p);
}
// joint positions of a pose
function ncSolve(B, P) {
  const dx = P.dx || 0,
    dy = P.dy || 0,
    s = Math.tan(rad(P.lean || 0)),
    br = P.breath || 0,
    hipY = B.hipY + dy,
    // bend: the upper body turned forward about the middle of the hips (for low poses: dashing, crouching)
    bend = rad(P.bend || 0),
    cb = Math.cos(bend),
    sb = Math.sin(bend),
    hx0 = B.hipX + dx,
    turn = (x, y) => [hx0 + (x - hx0) * cb - (y - hipY) * sb, hipY + (x - hx0) * sb + (y - hipY) * cb],
    // a point of the chest and above (given upright): sheared forward by the lean about the hip line, sunk by the
    // breath, and turned by the bend; waist shapes are not sunk
    up = (x, y) => turn(x + dx + s * (B.hipY - y), y + dy + br),
    lean = sink => d => g => {
      g.translate(hx0, hipY);
      g.rotate(bend);
      g.translate(-hx0, -hipY);
      g.translate(dx, dy + sink);
      g.transform(1, 0, -s, 1, s * B.hipY, 0);
      d(g);
    },
    // J.upper(draw), J.waist(draw): a shape drawn upright, placed like the chest or like the waist
    J = { s, br, hipY, dx, up, upper: lean(br), waist: lean(0), legs: {}, arms: {} };
  for (const side of ['b', 'f']) {
    const [a1, a2, tilt = 0] = P.legs[side],
      hip = [B.hipX + dx + (side === 'b' ? -B.hipW : B.hipW), hipY],
      knee = along(hip[0], hip[1], a1, B.thigh),
      ankle = along(knee[0], knee[1], a2, B.shin),
      t = rad(tilt),
      ct = Math.cos(t),
      st = Math.sin(t),
      // a point of the foot (forward fx, down fy from the ankle), turned by the tilt
      foot = (fx, fy) => [ankle[0] + fx * ct + fy * st, ankle[1] - fx * st + fy * ct];
    J.legs[side] = { a1, a2, tilt, hip, knee, ankle, foot, toe: foot(B.toe, B.ankleH), heel: foot(-B.heel, B.ankleH) };
  }
  J.neck = up(...B.neck);
  J.chest = up(...B.chest);
  const hp = up(...B.head);
  J.head = [hp[0] + ((P.head && P.head[0]) || 0), hp[1] + ((P.head && P.head[1]) || 0)];
  for (const side of ['b', 'f']) {
    const sh = up(...(side === 'b' ? B.shB : B.shF)),
      [a1, a2] = P.arms[side],
      elbow = along(sh[0], sh[1], a1, B.upper),
      wrist = along(elbow[0], elbow[1], a2, B.fore),
      hand = along(elbow[0], elbow[1], a2, B.fore + 1.7);
    J.arms[side] = { a1, a2, sh, elbow, wrist, hand };
  }
  // stand on the floor: the lowest point of the soles goes to the bottom of the box
  J.lift = P.air
    ? 0
    : 48 - Math.max(J.legs.b.toe[1], J.legs.b.heel[1], J.legs.f.toe[1], J.legs.f.heel[1], ...(P.low || []));
  return J;
}
// a leg reaching from its hip joint to an ankle at (x, y), the knee bent forward: [thigh, shin] angles
function ncLegIK(B, hx, hy, x, y) {
  let ddx = x - hx,
    ddy = y - hy,
    d = Math.hypot(ddx, ddy);
  const max = B.thigh + B.shin - 0.01;
  if (d > max) {
    ddx *= max / d;
    ddy *= max / d;
    d = max;
  }
  const base = Math.atan2(ddx, ddy),
    bend = Math.acos(clamp((B.thigh * B.thigh + d * d - B.shin * B.shin) / (2 * B.thigh * d), -1, 1)),
    a1 = base + bend,
    kx = hx + Math.sin(a1) * B.thigh,
    ky = hy + Math.cos(a1) * B.thigh;
  return [(a1 * 180) / Math.PI, (Math.atan2(hx + ddx - kx, hy + ddy - ky) * 180) / Math.PI];
}
// a running (or walking) frame: phase 0..1 through a stride of two steps. Each foot is planted for a share of the
// stride (stance), sliding back under the body exactly as far as the body moves on, then swings forward through
// the air, heel kicked up behind and knee high in front. The hip rides lowest in the middle of each step and highest
// in the air. gait = { stride: box units a stride covers, stance: the share of it a foot is down, lift: how high a
// foot swings, kick: how much of that is the heel kick, hip: the hip height when a foot lands, sink, rise: how far
// the hip drops mid-step and rises in the air, lean, arm: how far the arms swing, elbow: their bend }
function ncGait(B, gait, phase) {
  const G = Object.assign(
      {
        stride: 56,
        stance: 0.27,
        lift: 8,
        kick: 0.6,
        reach: 4,
        hip: 30.6,
        sink: 0.7,
        rise: 1.6,
        lean: 9,
        arm: 48,
        elbow: 95,
      },
      gait,
    ),
    floor = 48 - B.ankleH,
    // seen from the side while running, the hips are closer together than in the stance, so both steps are alike
    hipW = G.hipW === undefined ? B.hipW : G.hipW,
    sweep = G.stride * G.stance,
    step = (phase * 2) % 1,
    down = step < G.stance * 2;
  const hipY = down
    ? G.hip + G.sink * Math.sin((Math.PI * step) / (G.stance * 2))
    : G.hip - G.rise * Math.sin((Math.PI * (step - G.stance * 2)) / (1 - G.stance * 2));
  const legs = {};
  for (const [side, off] of [
    ['f', 0],
    ['b', 0.5],
  ]) {
    const p = (phase + off) % 1,
      hx = B.hipX + (side === 'b' ? -hipW : hipW);
    let x, y, tilt;
    if (p < G.stance) {
      // planted: from sweep/2 ahead of the hip to sweep/2 behind it, toe pushing off at the end
      const u = p / G.stance;
      x = hx + sweep / 2 - sweep * u;
      y = floor;
      tilt = u > 0.7 ? -40 * (u - 0.7) : 0;
    } else {
      const u = (p - G.stance) / (1 - G.stance),
        e = u * u * (3 - 2 * u);
      // past the planted range at both ends: the leg kicks on back after the push-off and reaches forward before the
      // landing, so in the air the legs are split wide
      x = hx - sweep / 2 + sweep * e - G.reach * Math.sin(Math.PI * 2 * u);
      // lifted clear of the floor right away and kept up until the landing, so no frame shows it gliding just above
      y = floor - G.lift * Math.sqrt(Math.sin(Math.PI * u)) * (1 + G.kick * Math.cos(Math.PI * u));
      tilt = -25 * Math.sin(Math.PI * Math.min(1, u * 1.4)) + 12 * Math.max(0, u - 0.75) * 4;
    }
    const [a1, a2] = ncLegIK(B, hx, hipY, x, y);
    legs[side] = [a1, a2, tilt];
  }
  // the arms pump against the legs: swung forward, the forearm comes up in front; swung back, it points down
  const arm = sw => {
    const a = sw * G.arm;
    return [a + 6, a + 6 + G.elbow * (0.62 + 0.38 * sw)];
  };
  const swing = Math.cos(phase * Math.PI * 2);
  return {
    legs,
    body: { hipW },
    dy: hipY - B.hipY,
    air: true,
    lean: G.lean,
    arms: { f: arm(-swing), b: arm(swing) },
  };
}

// ---------- drawing ----------
const _ncGrids = new Map(),
  _ncBitmaps = new Map();
function ncKinds(ch) {
  const kinds = {};
  for (const [s, kind] of [
    [ch.flat || '', 'flat'],
    [ch.hair || '', 'hair'],
    [ch.skin || '', 'skin'],
  ])
    for (const c of s) kinds[c.charCodeAt(0)] = kind;
  return kinds;
}
function ncBuild(ch, P, k) {
  const B = Object.assign({}, NC_BODY, ch.body, P.body),
    J = ncSolve(B, P),
    G = ncGrid(k, Math.round(J.lift * k) / k);
  G.B = B;
  ch.draw(G, J, P);
  return G;
}
// the density a character is drawn at: 3 in the 3x views (title, intro and ending screens), otherwise the screen's own
const ncDensity = big => (big ? 3 : Math.min(3, Math.max(1, Math.round(SCALE / 2))));
// a prop (a weapon in hand, a charge, a flame): a small drawing made like a character, draw(G) centred on box point
// (24, 24), painted with the character's colours and placed with that point at logical (x, y); key names the
// drawing (with its animation step)
function drawNativeProp(style, ch, key, draw, x, y, pal, flip, big) {
  const k = ncDensity(big),
    gk = style + '|' + k + '|prop:' + key;
  let G = _ncGrids.get(gk);
  if (!G) {
    if (_ncGrids.size > 240) _ncGrids.clear();
    G = ncGrid(k, 0);
    draw(G);
    _ncGrids.set(gk, G);
  }
  const bk =
    gk +
    '|' +
    (flip ? 1 : 0) +
    '|' +
    pal.B +
    pal.b +
    pal.S +
    (pal === PAL_WHITE ? 'w' : pal.gray ? 'g' : pal.shadow ? 's' : '');
  let bm = _ncBitmaps.get(bk);
  if (!bm) {
    if (_ncBitmaps.size > 600) _ncBitmaps.clear();
    _ncBitmaps.set(bk, (bm = ncPaint(G, ch.colors(pal), ch.kinds || (ch.kinds = ncKinds(ch)), flip)));
  }
  const z = Math.abs(ctx.getTransform().a),
    u = HP / k,
    gx = x - (flip ? NC_W - NC_X - 24 : NC_X + 24) * HP + bm.x * u,
    gy = y - (NC_Y + 24) * HP + bm.y * u,
    sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bm.c, Math.round(gx * z) / z, Math.round(gy * z) / z, bm.c.width * u, bm.c.height * u);
  ctx.imageSmoothingEnabled = sm;
}
function drawNative(style, ch, ox, oy, f, pose, fr, arm, pal, big, opt) {
  const k = ncDensity(big),
    P = ch.frame(pose, fr || 0, arm, big, opt || {}),
    gk = style + '|' + k + '|' + P.id;
  let G = _ncGrids.get(gk);
  if (!G) {
    if (_ncGrids.size > 240) _ncGrids.clear();
    _ncGrids.set(gk, (G = ncBuild(ch, P, k)));
  }
  const flip = f < 0 && !P.back,
    bk =
      gk +
      '|' +
      (flip ? 1 : 0) +
      '|' +
      pal.B +
      pal.b +
      pal.S +
      (pal === PAL_WHITE ? 'w' : pal.gray ? 'g' : pal.shadow ? 's' : '');
  let bm = _ncBitmaps.get(bk);
  if (!bm) {
    if (_ncBitmaps.size > 600) _ncBitmaps.clear();
    _ncBitmaps.set(bk, (bm = ncPaint(G, ch.colors(pal), ch.kinds || (ch.kinds = ncKinds(ch)), flip)));
  }
  // before(): drawn behind the character (flames, wind)
  const at = (x, y) => [Math.round(ox) + (flip ? 48 - x : x) * HP, Math.round(oy) + (y + G.dy) * HP],
    dc = { flip, pal, big, opt: opt || {}, style };
  if (ch.before) ch.before(P, ncSolve(G.B, P), at, dc);
  // placed on whole device pixels, so every fine pixel keeps the same size; the grid is mirrored about the box
  const z = Math.abs(ctx.getTransform().a),
    u = HP / k, // logical size of a grid pixel
    gx = Math.round(ox) - (flip ? NC_W - 48 - NC_X : NC_X) * HP + bm.x * u,
    gy = Math.round(oy) - NC_Y * HP + bm.y * u,
    sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bm.c, Math.round(gx * z) / z, Math.round(gy * z) / z, bm.c.width * u, bm.c.height * u);
  ctx.imageSmoothingEnabled = sm;
  if (ch.after) ch.after(P, ncSolve(G.B, P), at, dc);
}

// ---------- shared parts ----------
// a pixel map drawn for k = 2 enlarged to density k (each of its pixels covers k / 2 fine pixels)
function ncScaleMap(rows, k) {
  const f = k / 2,
    span = i => [Math.floor(i * f), Math.floor((i + 1) * f)],
    H = Math.floor(rows.length * f),
    W = Math.floor(rows[0].length * f),
    out = Array.from({ length: H }, () => Array(W).fill('.'));
  rows.forEach((r, y) => {
    const [y0, y1] = span(y);
    for (let x = 0; x < r.length; x++) {
      if (r[x] === '.') continue;
      const [x0, x1] = span(x);
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) out[yy][xx] = r[x];
    }
  });
  return out.map(r => r.join(''));
}
// the eye maps of a face kind at the grid's density (a density without its own maps uses the k = 2 maps enlarged)
function ncFace(G, faces, hx, hy, kind) {
  if (!faces[G.k]) {
    faces[G.k] = {};
    for (const kd in faces[2])
      faces[G.k][kd] = faces[2][kd].map(p => Object.assign({}, p, { rows: ncScaleMap(p.rows, G.k) }));
  }
  const F = faces[G.k];
  for (const p of F[kind] || F.normal) G.map(p.rows, hx + p.x, hy + p.y);
}
// a leg: a thigh, a boot widening from under the knee to the ankle and a foot under it (a polygon of foot points
// [forward, down] from the ankle), a band round the boot, a sole and a knee cap. o = { thigh, thighW, boot, w0, w1,
// foot, band: [letter, from, to, width] (along the shin), sole, knee: [letter, radius, along], shine, extra(L, f) }
const NC_FOOT = (B, s = 1) => [
  [-4.6 * s, -1],
  [2.6 * s, -1.8],
  [6.4 * s, 0.4],
  [B.toe + 0.2, 2.8],
  [B.toe, B.ankleH],
  [-B.heel, B.ankleH],
  [-B.heel - 0.6, 1.6],
];
function ncLeg(G, L, B, o) {
  const { shape } = G,
    S = NC_SHAPES,
    [kx, ky] = L.knee,
    [ax, ay] = L.ankle,
    f = L.foot;
  if (o.thigh) shape(o.thigh, S.cap(...L.hip, kx, ky, o.thighW || 4.4));
  const foot = (o.foot || NC_FOOT(B)).flatMap(([x, y]) => f(x, y));
  shape(o.boot, S.all(S.taper(kx, ky, ax, ay, o.w0 || 7, o.w1 || 9.6), S.poly(foot)));
  if (o.band)
    shape(o.band[0], S.bar(...along(kx, ky, L.a2, o.band[1]), ...along(kx, ky, L.a2, o.band[2]), o.band[3]), false);
  if (o.sole)
    shape(
      o.sole,
      S.poly([
        ...f(-B.heel, B.ankleH - 1),
        ...f(B.toe - 0.2, B.ankleH - 1),
        ...f(B.toe, B.ankleH),
        ...f(-B.heel, B.ankleH),
      ]),
      false,
    );
  if (o.extra) o.extra(L, f);
  if (o.knee) {
    const [kc, kr = 2.6, at = 0.8] = o.knee,
      [px, py] = along(kx, ky, L.a2, at);
    shape(kc, S.disc(px, py, kr));
    if (o.shine) shape(o.shine, S.ell(px - kr * 0.32, py - kr * 0.35, kr * 0.35, kr * 0.24), false);
  }
}
// an arm: the upper arm, a gauntlet widening to the wrist, a cuff band and the fist. o = { upper, upperW, glove, w0, w1,
// cuff: [letter, from, to, width] (along the forearm), fist, fistR, extra(A) }
function ncArm(G, A, o) {
  const { shape } = G,
    S = NC_SHAPES,
    [ex, ey] = A.elbow;
  if (o.upper) shape(o.upper, S.cap(...A.sh, ex, ey, o.upperW || 3.2));
  shape(o.glove, S.taper(...along(ex, ey, A.a2, -0.6), ...A.wrist, o.w0 || 5.6, o.w1 || 7.4));
  if (o.cuff)
    shape(o.cuff[0], S.bar(...along(ex, ey, A.a2, o.cuff[1]), ...along(ex, ey, A.a2, o.cuff[2]), o.cuff[3]), false);
  if (o.extra) o.extra(A);
  shape(o.fist || o.glove, S.disc(...A.hand, o.fistR || 3));
}
// a point (x, y) from the head centre, turned with the head's tilt (degrees, positive nods forward)
const ncHead = (hx, hy, tilt = 0) => {
  const c = Math.cos(rad(tilt)),
    s = Math.sin(rad(tilt));
  return (x, y) => [hx + x * c - y * s, hy + x * s + y * c];
};
// the faces of the men (Nexo and the male bosses): big eyes under a thick upper lid, brows slanting down toward the
// nose, a nose shadow and a small mouth (E white, I iris, U pupil, W glint, K lids and brows, N nose, M mouth);
// normal: determined (Nexo), angry: a boss's scowl, hurt: eyes squeezed shut, mouth open. Maps of fine pixels per
// density k, each with its top left at (x, y) from the head centre
// prettier-ignore
const NC_MALE_FACES = {
  1: {
    normal: [{ x: 0, y: -3, rows: [
      '..........',
      '.KK.......',
      '..KKK..KK.',
      '.KKKKK.KKK',
      '.EIUUW.IUW',
      '.EIUUI.IUI',
      '..EIII..II',
      '...KK.....',
      '.........N',
      '..........',
      '......KK..',
    ] }],
    angry: [{ x: 0, y: -3, rows: [
      '..........',
      '.KK.......',
      '..KKK.KKK.',
      '.KKKKKKKKK',
      '.EIUUW.IUW',
      '.EIUUI.IUI',
      '..EIII..II',
      '...KK.....',
      '.........N',
      '..........',
      '.....KKK..',
    ] }],
    hurt: [{ x: 0, y: -3, rows: [
      '..........',
      '..........',
      '..........',
      '.KK....K..',
      '...KK...KK',
      '.KK....K..',
      '..........',
      '..........',
      '.........N',
      '......KK..',
      '......KK..',
    ] }],
  },
  2: {
    normal: [{ x: 0, y: -3, rows: [
      '....................',
      '.KKKK...............',
      '...KKKKK......KKK...',
      '.......KK....KK.....',
      '..KKKKKKKK...KKKK...',
      '.KKKKKKKKKK..KKKKK..',
      '.KEEIUUUUWK..EIUWK..',
      '..EEIUUUWWK..EIUWK..',
      '..EEIUUUUUK..EIUUK..',
      '..EEIIUUUIK..EIIUK..',
      '..EEIIIIIIK..EIII...',
      '...EIIIIII....III...',
      '....EIIII...........',
      '.....KKK............',
      '....................',
      '..................N.',
      '..................NN',
      '....................',
      '....................',
      '....................',
      '............KKK.....',
    ] }],
    angry: [{ x: 0, y: -3, rows: [
      '....................',
      '....................',
      '.KKK................',
      '..KKKKKK.....KKKK...',
      '.....KKKKK..KKKK....',
      '..KKKKKKKKK.KKKKK...',
      '.KKKKKKKKKK..KKKKK..',
      '.KEEIUUUWWK..EIUWK..',
      '..EEIUUUUUK..EIUUK..',
      '..EEIIUUUIK..EIIUK..',
      '..EEIIIIIIK..EIII...',
      '...EIIIIII....III...',
      '....KKKKK...........',
      '....................',
      '....................',
      '..................N.',
      '..................NN',
      '....................',
      '....................',
      '...........KKKK.....',
      '....................',
    ] }],
    hurt: [{ x: 0, y: -3, rows: [
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '.KKK.........KK.....',
      '....KKKK.......KK...',
      '........KK.......K..',
      '....KKKK.......KK...',
      '.KKK.........KK.....',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '..................N.',
      '..................NN',
      '...........KKKK.....',
      '..........KMMMMK....',
      '..........KMMMMK....',
      '...........KKKK.....',
    ] }],
  },
};
// the face of a man: skin from the forehead down to a pointed chin, the nose at the front edge (a three-quarter
// view), an ear, and the eye maps
function ncManFace(G, hx, hy, kind, skin = 'S') {
  const o = (x, y) => [hx + x, hy + y];
  G.shape(
    skin,
    NC_SHAPES.poly([
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
  G.shape(skin, NC_SHAPES.ell(...o(-2.2, 2.8), 1.8, 2.4));
  ncFace(G, NC_MALE_FACES, hx, hy, kind);
}
// the faces of the women bosses: big eyes with thick lashes, a small nose shadow and lips (E white, I iris, U pupil,
// W glint, K lashes, N nose, M lips); shout: the eyes open and the mouth wide open; hurt: eyes squeezed shut, mouth open
// prettier-ignore
const NC_FEMALE_FACES = {
  1: {
    normal: [{ x: 0, y: -3, rows: [
      '..........',
      '..........',
      '.KKKK..KKK',
      'KKKKKK.KKK',
      '.EIUUW.IUW',
      '.EIUUI.IUI',
      '..EIII..II',
      '..........',
      '.........N',
      '..........',
      '......MM..',
    ] }],
    shout: [{ x: 0, y: -3, rows: [
      '..........',
      '..........',
      '.KKKK..KKK',
      'KKKKKK.KKK',
      '.EIUUW.IUW',
      '.EIUUI.IUI',
      '..EIII..II',
      '..........',
      '.........N',
      '......KK..',
      '......KK..',
    ] }],
    hurt: [{ x: 0, y: -3, rows: [
      '..........',
      '..........',
      '..........',
      'KK.....K..',
      '..KKK...KK',
      'KK.....K..',
      '..........',
      '..........',
      '.........N',
      '......KK..',
      '......KK..',
    ] }],
  },
  2: {
    normal: [{ x: 0, y: -3, rows: [
      '....................',
      '....................',
      '..KKK.........KK....',
      '....KKKK.....KK.....',
      '....................',
      'KKKKKKKKKK...KKKKK..',
      '.KKKKKKKKKK..KKKKKK.',
      '..KEIUUUWWK..EIUWK..',
      '..EEIUUUWWK..EIUWK..',
      '..EEIUUUUUK..EIUUK..',
      '..EEIIUUUIK..EIIUK..',
      '..EEIIIIIIK..EIII...',
      '...EIIIIII....III...',
      '....KKKKK...........',
      '....................',
      '..................N.',
      '..................N.',
      '....................',
      '....................',
      '............MM......',
      '...........MMMM.....',
    ] }],
    shout: [{ x: 0, y: -3, rows: [
      '....................',
      '....................',
      '..KKK.........KK....',
      '....KKKK.....KK.....',
      '....................',
      'KKKKKKKKKK...KKKKK..',
      '.KKKKKKKKKK..KKKKKK.',
      '..KEIUUUWWK..EIUWK..',
      '..EEIUUUWWK..EIUWK..',
      '..EEIUUUUUK..EIUUK..',
      '..EEIIUUUIK..EIIUK..',
      '..EEIIIIIIK..EIII...',
      '...EIIIIII....III...',
      '....KKKKK...........',
      '....................',
      '..................N.',
      '..................N.',
      '...........KKK......',
      '..........KMMMK.....',
      '..........KMMMK.....',
      '...........KKK......',
    ] }],
    hurt: [{ x: 0, y: -3, rows: [
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '.KKKK........KK.....',
      '.....KKKK......KK...',
      '.........KK......K..',
      '.....KKKK......KK...',
      '.KKKK........KK.....',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '..................N.',
      '..................N.',
      '...........KKK......',
      '..........KMMMK.....',
      '..........KMMMK.....',
      '...........KKK......',
    ] }],
  },
};
// the face of a woman: skin from the forehead down to a small pointed chin, an ear, and the eye maps
function ncWomanFace(G, hx, hy, kind, skin = 'S') {
  const o = (x, y) => [hx + x, hy + y];
  G.shape(
    skin,
    NC_SHAPES.poly([
      ...o(-1, -3.6),
      ...o(8.6, -3.6),
      ...o(9.2, 2.2),
      ...o(9.9, 3.8),
      ...o(9.1, 4.4),
      ...o(8.8, 6),
      ...o(6.8, 8.2),
      ...o(4.2, 8.4),
      ...o(1.2, 6.8),
      ...o(-1, 4.8),
    ]),
  );
  G.shape(skin, NC_SHAPES.ell(...o(-2, 2.6), 1.6, 2.2));
  ncFace(G, NC_FEMALE_FACES, hx, hy, kind);
}
// long hair falling from the back of the head: locks from roots round the back of the skull to tips that hang down
// (flow 0) or stream out behind (flow 1); len is how far they reach; the tips curl a little, wave moves them
function ncLongHair(G, hx, hy, o) {
  const { flow = 0, len = 26, c = 'Z', shine = 'z', locks = 6, wave = 0, width = 6 } = o,
    S = NC_SHAPES,
    parts = [];
  for (let i = 0; i < locks; i++) {
    const t = i / (locks - 1),
      root = [hx - 2 - t * 5, hy - 6 + t * 10],
      l = len * (0.78 + 0.22 * Math.sin((i + 1) * 1.7)),
      // hanging: down the back, the lower locks further out; streaming: back and a little down
      hang = [root[0] - 4 - t * 4, root[1] + l * (1 - t * 0.25)],
      stream = [root[0] - l * (1 - t * 0.15), root[1] + 4 + t * 6],
      tip = [hang[0] + (stream[0] - hang[0]) * flow, hang[1] + (stream[1] - hang[1]) * flow],
      w = Math.sin(wave + i * 1.3) * 1.6,
      mid = [
        (root[0] + tip[0]) / 2 - 3 * (1 - flow) + w * flow,
        (root[1] + tip[1]) / 2 + 2 * flow - w * (1 - flow) * 0.4,
      ];
    parts.push(S.strand(...root, ...mid, tip[0] + w, tip[1], width, 0.6));
  }
  G.shape(c, S.all(S.ell(hx - 2.4, hy, 7.6, 7.8), ...parts));
  if (shine) {
    const root = [hx - 3.4, hy - 3],
      tip = [hx - 7 - flow * 10, hy + 10 - flow * 4];
    G.paint(shine, S.strand(...root, (root[0] + tip[0]) / 2 - 2, (root[1] + tip[1]) / 2, ...tip, 1, 0.4), c);
  }
}
