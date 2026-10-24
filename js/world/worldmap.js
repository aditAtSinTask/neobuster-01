'use strict';
// The world map's islands: each continent is a natural island grown from a height field (overlapping lobes for its
// shape, fractal noise for a ragged coastline with coves and points, ridged noise for mountain ranges), painted as
// pixel art at fine pixels: shallow water and surf round the coast, sand beaches, meadows, forests, rock and snowy
// peaks lit from the top left, rivers running down from the mountains, trees, grass and flowers, and a landmark for
// each boss's stage. The continent still to come is an island under clouds. Islands are drawn once and cached.

const MAP_W = 200,
  MAP_H = 120; // logical size of an island's picture (fine pixels: twice that)

// biomes: the colours of the land (bands of elevation [up to, light, base, dark]), water, beaches and trees
const MAP_BIOMES = {
  meadow: {
    shallow: ['#6ccaf0', '#3c9ede', '#2a78c4'],
    foam: '#eaf8fc',
    sand: ['#f8e6ac', '#e6ca8a', '#c8aa6a'],
    bands: [
      [0.16, '#94de60', '#76c84c', '#5cac40'],
      [0.36, '#68c04c', '#50a840', '#3c8c36'],
      [0.56, '#4c9c42', '#3c8438', '#2e6c30'],
      [0.74, '#b8a890', '#94826c', '#706050'],
      [0.88, '#a49684', '#827260', '#5e5246'],
      [9, '#ffffff', '#e6eef8', '#b8c8dc'],
    ],
    river: ['#4aa8e8', '#9adcf8'],
    trees: [
      ['#82d454', '#52ac3e', '#327c32'],
      ['#6cc04c', '#3e923a', '#286e2e'],
    ],
    conifer: ['#5aa84a', '#2e7a3c', '#1c5a30'],
    snowTree: ['#ffffff', '#d8e6f2', '#2e6a4a'],
    flowers: ['#f8e858', '#f87898', '#ffffff'],
    rock: ['#b4a48c', '#7e6e5c', '#ffffff', '#c8d8e8'],
    outline: '#16301c',
    trunk: '#6a4a2a',
  },
  // dusk-lit autumn woods and lavender fields
  twilight: {
    shallow: ['#7ac6e8', '#4a94d4', '#3470b8'],
    foam: '#f2f0fc',
    sand: ['#f4dccc', '#dec0ae', '#c0a090'],
    bands: [
      [0.16, '#a6d282', '#88ba6a', '#6c9e56'],
      [0.36, '#78b072', '#5e9862', '#4a7e52'],
      [0.56, '#58906a', '#467858', '#366048'],
      [0.74, '#ac9cbc', '#8a7aa2', '#68587e'],
      [0.88, '#9a8aae', '#786894', '#584a72'],
      [9, '#fff6fc', '#eee0f2', '#cab6da'],
    ],
    river: ['#5aa6e2', '#a6dcf8'],
    trees: [
      ['#fad060', '#e4a038', '#a8682a'],
      ['#f89a4c', '#dc6a30', '#9c4628'],
      ['#f8b050', '#e07c32', '#a8502a'],
      ['#ee6a54', '#c4423c', '#88302e'],
      ['#c890ec', '#9e66cc', '#6e3e9a'],
    ],
    treeWeights: [3, 3, 3, 2, 1],
    conifer: ['#4a8a7a', '#2e6858', '#1e4844'],
    rock: ['#b0a0c4', '#7c6c96', '#fff4fc', '#d8c8e8'],
    snowTree: ['#fff6fc', '#e0d0ec', '#3a5a5a'],
    flowers: ['#b88ae6', '#9468cc', '#f0d8ff'],
    lavender: true,
    outline: '#1e1a2c',
    trunk: '#5e3e2e',
  },
  // moonlit night: teal meadows under the moon, silver beaches, frosted peaks, dark firs and flowers like stars
  night: {
    shallow: ['#4a7ac8', '#30589c', '#22407a'],
    foam: '#dce6fc',
    sand: ['#d4d8ea', '#b4bad2', '#9298b4'],
    bands: [
      [0.16, '#5e8c7e', '#4c7a6c', '#3c6458'],
      [0.36, '#4c7c72', '#3e6a60', '#30564e'],
      [0.56, '#406c68', '#325a56', '#264846'],
      [0.74, '#8a8cac', '#6a6c8c', '#4e506c'],
      [0.88, '#7c7ea0', '#5e6082', '#444664'],
      [9, '#f4f8ff', '#d8e2f4', '#aebcd8'],
    ],
    river: ['#5a8ad8', '#a8c8f4'],
    trees: [
      ['#5a8c84', '#386a64', '#22484a'],
      ['#6a74a8', '#4a5488', '#2e3862'],
    ],
    treeWeights: [3, 1],
    conifer: ['#3e6a7a', '#24485a', '#163444'],
    snowTree: ['#f4f8ff', '#c8d6ec', '#24485a'],
    flowers: ['#f8e878', '#ffffff', '#c8b8fc'],
    rock: ['#8a8cac', '#5a5c7c', '#f4f8ff', '#c8d4ec'],
    outline: '#0c1020',
    trunk: '#2c2a3c',
  },
  // the continent still to come: dark slate under the clouds
  fog: {
    shallow: ['#3e4a6e', '#2e3a5c', '#22304e'],
    foam: '#7a86a8',
    sand: ['#6a6e88', '#585c76', '#484c64'],
    bands: [
      [0.36, '#5a5e7a', '#4c506a', '#3e425a'],
      [0.74, '#4e5270', '#40445e', '#34384e'],
      [9, '#5e6280', '#4e526c', '#40445a'],
    ],
    river: ['#3a4668', '#4e5a80'],
    trees: [['#4e5470', '#3c4260', '#2c3048']],
    conifer: ['#4a5070', '#383e5c', '#282c44'],
    snowTree: ['#5e6280', '#4e526c', '#2c3048'],
    flowers: [],
    rock: ['#5a5e7c', '#40445e', '#6a6e8c', '#50546e'],
    outline: '#181a28',
    trunk: '#2c2e40',
  },
};
// the land round some landmarks: [up to, light, base, dark] bands like a biome's, and what grows there
const MAP_REGIONS = {
  ash: { bands: [[9, '#7a6a66', '#5e5050', '#463c3e']], trees: false },
  snow: {
    bands: [
      [0.5, '#f6fafe', '#dce8f4', '#b4c6da'],
      [9, '#ffffff', '#e6eef8', '#b8c8dc'],
    ],
    snowTrees: true,
  },
  mesa: {
    bands: [
      [0.3, '#f0bc7a', '#dca062', '#b8804a'],
      [9, '#d89a5e', '#bc7c48', '#94603a'],
    ],
    trees: false,
    strata: true,
  },
  swamp: { bands: [[9, '#7e8a52', '#68743e', '#525c32']], trees: 0.3, pools: true },
  dark: { bands: [[9, '#4e4a68', '#3e3a56', '#2e2a44']], darkTrees: true },
  crystal: { bands: [[9, '#d4ecf4', '#b4d8e8', '#90b8d0']], trees: false, crystals: true },
  starlit: { bands: [[9, '#b4acdc', '#968cc4', '#7a70a8']], trees: false },
};

// The islands. lobes [x, y, rx, ry]: the ellipses (logical px) whose union is the island's rough shape; ranges
// [x, y, rx, ry, height]: mountain ranges; rivers: where they spring; landmarks per stage: { at: [x, y] (the foot of
// its picture), kind, icon: [x, y] (where the boss stands) }
const MAP_ISLANDS = {
  azura: {
    seed: 7,
    biome: 'meadow',
    lobes: [
      [96, 62, 66, 34],
      [56, 54, 36, 30],
      [140, 74, 34, 26],
      [112, 38, 34, 18],
      [168, 88, 16, 12],
    ],
    ranges: [[108, 44, 34, 16, 0.6]],
    // mountains drawn on the map [x, y (their foot), width, height (fine px), snowy]
    peaks: [
      [86, 42, 30, 22, 1],
      [118, 36, 26, 18, 1],
      [80, 50, 22, 14, 0],
    ],
    rivers: [
      [96, 50],
      [120, 46],
    ],
    landmarks: {
      cut: { at: [46, 72], kind: 'factory', icon: [60, 74] },
      fire: { at: [134, 54], kind: 'volcano', icon: [150, 58] },
      elec: { at: [68, 40], kind: 'tower', icon: [58, 44] },
      snow: { at: [104, 46], kind: 'snowpeak', icon: [104, 58] },
      earth: { at: [152, 84], kind: 'canyon', icon: [164, 92] },
      wind: { at: [38, 26], kind: 'skyisle', icon: [38, 20] },
    },
  },
  vespera: {
    seed: 23,
    biome: 'twilight',
    lobes: [
      [62, 56, 40, 34],
      [100, 40, 46, 22],
      [140, 58, 40, 32],
      [160, 86, 22, 16],
      [40, 86, 22, 14],
    ],
    // a deep bay between the two arms of the crescent
    bays: [[100, 88, 30, 24]],
    ranges: [[132, 44, 26, 14, 0.62]],
    peaks: [
      [124, 44, 34, 24, 1],
      [140, 50, 26, 18, 0],
      [116, 52, 22, 14, 0],
    ],
    rivers: [[128, 48]],
    landmarks: {
      hydro: { at: [62, 52], kind: 'watertower', icon: [76, 56] },
      toxic: { at: [40, 88], kind: 'toxic', icon: [52, 92] },
      shadow: { at: [150, 84], kind: 'darkcastle', icon: [164, 90] },
      sonic: { at: [100, 28], kind: 'stage', icon: [114, 32] },
      light: { at: [142, 40], kind: 'crystal', icon: [128, 46] },
      time: { at: [76, 30], kind: 'clocktower', icon: [64, 36] },
    },
  },
  // a crescent moon of an island round its bay
  noctara: {
    seed: 47,
    biome: 'night',
    lobes: [
      [56, 48, 40, 30],
      [102, 30, 44, 20],
      [146, 50, 38, 30],
      [152, 86, 22, 16],
    ],
    bays: [[98, 80, 40, 26]],
    ranges: [[96, 32, 30, 12, 0.6]],
    peaks: [
      [88, 32, 30, 20, 1],
      [110, 28, 26, 18, 1],
    ],
    rivers: [[100, 36]],
    landmarks: {
      gravity: { at: [52, 44], kind: 'observatory', icon: [68, 48] },
      magnet: { at: [146, 48], kind: 'aurorarail', icon: [130, 52] },
      astral: { at: [150, 88], kind: 'stargate', icon: [166, 92] },
    },
  },
};
// a continent without a map entry gets a generated island; the slot after the last continent is this one
const MAP_UNKNOWN = {
  seed: 41,
  biome: 'fog',
  lobes: [
    [100, 60, 60, 32],
    [64, 66, 30, 22],
    [140, 52, 30, 24],
  ],
  ranges: [[104, 52, 28, 14, 0.5]],
  peaks: [
    [100, 52, 34, 24, 0],
    [120, 46, 26, 18, 0],
  ],
  rivers: [],
  landmarks: {},
};

// ---------- noise ----------
function mapNoise(seed) {
  const rnd = mulberry(seed),
    T = new Float32Array(64 * 64);
  for (let i = 0; i < T.length; i++) T[i] = rnd();
  const sm = t => t * t * (3 - 2 * t),
    at = (x, y) => T[(y & 63) * 64 + (x & 63)],
    value = (x, y) => {
      const xi = Math.floor(x),
        yi = Math.floor(y),
        fx = sm(x - xi),
        fy = sm(y - yi),
        a = at(xi, yi),
        b = at(xi + 1, yi),
        c = at(xi, yi + 1),
        d = at(xi + 1, yi + 1);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };
  // fractal noise in 0..1
  return (x, y, oct = 4) => {
    let s = 0,
      amp = 0.5,
      f = 1,
      n = 0;
    for (let o = 0; o < oct; o++) {
      s += value(x * f + o * 17.3, y * f + o * 9.1) * amp;
      n += amp;
      amp *= 0.5;
      f *= 2;
    }
    return s / n;
  };
}
const MAP_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
// distance from every pixel to the nearest pixel where mask === target (chamfer distance, two passes)
function mapDistance(mask, W, H, target) {
  const D = new Float32Array(W * H);
  for (let i = 0; i < D.length; i++) D[i] = mask[i] === target ? 0 : 1e6;
  const relax = (i, j, w) => {
    if (D[j] + w < D[i]) D[i] = D[j] + w;
  };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (x > 0) relax(i, i - 1, 1);
      if (y > 0) {
        relax(i, i - W, 1);
        if (x > 0) relax(i, i - W - 1, 1.414);
        if (x < W - 1) relax(i, i - W + 1, 1.414);
      }
    }
  for (let y = H - 1; y >= 0; y--)
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      if (x < W - 1) relax(i, i + 1, 1);
      if (y < H - 1) {
        relax(i, i + W, 1);
        if (x < W - 1) relax(i, i + W + 1, 1.414);
        if (x > 0) relax(i, i + W - 1, 1.414);
      }
    }
  return D;
}
// connected regions of the pixels where mask === v (4-neighbour): the region id of each pixel and their sizes
function mapRegions(mask, W, H, v) {
  const id = new Int32Array(W * H).fill(-1),
    sizes = [],
    touchesEdge = [];
  for (let s = 0; s < W * H; s++) {
    if (mask[s] !== v || id[s] >= 0) continue;
    const r = sizes.length,
      st = [s];
    id[s] = r;
    let n = 0,
      edge = false;
    while (st.length) {
      const p = st.pop(),
        x = p % W,
        y = (p / W) | 0;
      n++;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) edge = true;
      for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1])
        if (q >= 0 && mask[q] === v && id[q] < 0) {
          id[q] = r;
          st.push(q);
        }
    }
    sizes.push(n);
    touchesEdge.push(edge);
  }
  return { id, sizes, touchesEdge };
}

// ---------- the terrain ----------
// the height field of an island at fine pixels: land, elevation, the distances to the coast, lakes and rivers, and the
// region (landmark ground) of every pixel
function mapTerrain(def) {
  const W = MAP_W * 2,
    H = MAP_H * 2,
    fbm = mapNoise(def.seed),
    ridge = mapNoise(def.seed + 101),
    land = new Uint8Array(W * H),
    el = new Float32Array(W * H),
    region = new Int8Array(W * H).fill(-1),
    marks = Object.entries(def.landmarks).map(([k, m]) => Object.assign({ stage: k }, m)),
    cone = (lx, ly, m, r) => {
      const d = Math.hypot(lx - m.at[0], (ly - m.at[1]) * 1.25) / r;
      return d < 1 ? (1 - d) ** 1.4 : 0;
    };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const lx = (x + 0.5) / 2,
        ly = (y + 0.5) / 2,
        i = y * W + x;
      let base = -1;
      for (const [cx, cy, rx, ry] of def.lobes) {
        const dx = (lx - cx) / rx,
          dy = (ly - cy) / ry;
        base = Math.max(base, 1 - dx * dx - dy * dy);
      }
      for (const [cx, cy, rx, ry] of def.bays || []) {
        const dx = (lx - cx) / rx,
          dy = (ly - cy) / ry;
        base = Math.min(base, dx * dx + dy * dy - 1);
      }
      let s = base + (fbm(lx / 18, ly / 18, 5) - 0.5) * 0.95;
      const m = Math.min(lx, MAP_W - lx, ly, MAP_H - ly);
      if (m < 10) s -= (10 - m) * 0.09;
      // the ground round the landmarks: the stage and the factory stand on flat land, the lake is dug out
      for (const mk of marks) {
        if (mk.kind === 'watertower') {
          const d = Math.hypot(lx - (mk.at[0] - 14), (ly - (mk.at[1] + 4)) * 1.5);
          if (d < 9 + (fbm(lx / 4, ly / 4, 2) - 0.5) * 4) s = Math.min(s, -0.05);
        }
        const d = Math.hypot(lx - mk.at[0], ly - mk.at[1]);
        if (d < 10 && s < 0.25) s = Math.max(s, 0.25 - d * 0.012);
      }
      land[i] = s > 0 ? 1 : 0;
      let e = Math.max(0, Math.min(1.1, s)) * 0.42;
      for (const [cx, cy, rx, ry, hgt] of def.ranges) {
        const dx = (lx - cx) / rx,
          dy = (ly - cy) / ry,
          v = 1 - dx * dx - dy * dy;
        if (v > 0) e += hgt * v ** 1.1 * (0.35 + 1.1 * (1 - Math.abs(2 * ridge(lx / 9, ly / 9, 3) - 1)) ** 2);
      }
      for (const mk of marks) {
        if (mk.kind === 'volcano') e += 0.9 * cone(lx, ly, mk, 22);
        if (mk.kind === 'snowpeak') e += 1 * cone(lx, ly, mk, 24);
        if (mk.kind === 'stage') e = Math.max(e, 0.62 * Math.min(1, cone(lx, ly, mk, 20) * 3));
        if (mk.kind === 'observatory') e = Math.max(e, 0.5 * Math.min(1, cone(lx, ly, mk, 18) * 2.4));
      }
      el[i] = e;
    }
  // the volcano's crater
  for (const mk of marks)
    if (mk.kind === 'volcano')
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const d = Math.hypot(x / 2 - mk.at[0], (y / 2 - mk.at[1]) * 1.6);
          if (d < 4) el[y * W + x] -= (4 - d) * 0.06;
        }
  // tiny islets and puddles go
  const islands = mapRegions(land, W, H, 1);
  for (let i = 0; i < W * H; i++) if (land[i] && islands.sizes[islands.id[i]] < 24) land[i] = 0;
  const waters = mapRegions(land, W, H, 0);
  for (let i = 0; i < W * H; i++) if (!land[i] && waters.sizes[waters.id[i]] < 10) land[i] = 1;
  const seaR = mapRegions(land, W, H, 0),
    lake = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) if (!land[i] && !seaR.touchesEdge[seaR.id[i]]) lake[i] = 1;
  const dWater = mapDistance(land, W, H, 1),
    dLand = mapDistance(land, W, H, 0);
  // the landmarks' ground (snow round the peak, ash round the volcano, ...), with a ragged edge
  const kindRegion = {
      volcano: 'ash',
      snowpeak: 'snow',
      canyon: 'mesa',
      toxic: 'swamp',
      darkcastle: 'dark',
      crystal: 'crystal',
      aurorarail: 'snow',
      stargate: 'starlit',
    },
    radius = { ash: 20, snow: 22, mesa: 22, swamp: 22, dark: 24, crystal: 14, starlit: 18 },
    regionNames = [];
  for (const mk of marks) {
    const name = kindRegion[mk.kind];
    if (!name) continue;
    const r = radius[name],
      ri = regionNames.push(name) - 1;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x,
          lx = x / 2,
          ly = y / 2,
          d = Math.hypot(lx - mk.at[0], (ly - mk.at[1]) * 1.15) / r + (fbm(lx / 5, ly / 5, 2) - 0.5) * 0.5;
        if (land[i] && d < 1) region[i] = ri;
      }
  }
  // rivers: from each spring downhill to the sea (or a lake), widening near the coast
  const river = new Uint8Array(W * H);
  for (const [sx, sy] of def.rivers) {
    let x = Math.round(sx * 2),
      y = Math.round(sy * 2);
    const seen = new Set();
    for (let n = 0; n < 900; n++) {
      const i = y * W + x;
      if (!land[i]) break;
      river[i] = 1;
      if (dLand[i] < 12) {
        if (x + 1 < W) river[i + 1] = 1;
        if (y + 1 < H) river[i + W] = 1;
      }
      seen.add(i);
      let best = -1,
        be = 1e9;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]) {
        const nx = x + dx,
          ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx;
        if (seen.has(j)) continue;
        // downhill, and toward the coast so a river never wanders in a hollow
        const v = el[j] + dLand[j] * 0.004 + fbm(nx / 3, ny / 3, 1) * 0.004;
        if (v < be) {
          be = v;
          best = j;
        }
      }
      if (best < 0) break;
      x = best % W;
      y = (best / W) | 0;
    }
  }
  return { W, H, land, el, lake, river, dWater, dLand, region, regionNames, marks, fbm };
}

// ---------- painting ----------
const mapRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
// a tree, a conifer and a snowy conifer as small pixel maps (L light, G base, D dark, K outline, T trunk)
// prettier-ignore
const MAP_TREES = {
  round: ['.KKK..', 'KLLGK.', 'KLGGK.', 'KGGDK.', '.KDKS.', '.STSS.'],
  big: ['..KKK...', '.KLLGK..', 'KLLGGGK.', 'KLGGGDK.', 'KGGGDDK.', '.KDDDKS.', '.SSTSSS.'],
  conifer: ['..K...', '.KLK..', '.KGK..', 'KLGDK.', 'KGGDKS', 'KKKKKS', '.STSS.'],
};
function mapTreeSprite(kind, cols, outline, trunk) {
  const rows = MAP_TREES[kind],
    c = { L: cols[0], G: cols[1], D: cols[2], K: outline, T: trunk, S: 'rgba(0,0,0,0.22)' };
  return makeCanvas(rows[0].length, rows.length, g => {
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++)
        if (r[x] !== '.') {
          g.fillStyle = c[r[x]];
          g.fillRect(x, y, 1, 1);
        }
    });
  });
}
// the picture of an island from its terrain; marks: false leaves out the landmarks (a locked island)
function mapIsland(def, T, marks = true) {
  const { W, H, land, el, lake, river, dWater, dLand, region, regionNames, fbm } = T,
    B = MAP_BIOMES[def.biome],
    rnd = mulberry(def.seed * 7 + 3),
    img = new ImageData(W, H),
    d = img.data,
    put = (i, hex) => {
      const [r, g, b] = mapRgb(hex);
      d[i * 4] = r;
      d[i * 4 + 1] = g;
      d[i * 4 + 2] = b;
      d[i * 4 + 3] = 255;
    },
    bandOf = (bands, e) => bands.find(b => e < b[0]) || bands[bands.length - 1];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x,
        bay = MAP_BAYER[(y & 3) * 4 + (x & 3)];
      if (!land[i]) {
        // shallow water fading into the deep sea (dithered), a shadow under the south coast
        const dw = dWater[i];
        if (y > 0 && land[i - W] && !lake[i]) put(i, B.shallow[2]);
        else if (dw <= 2.5) put(i, B.shallow[0]);
        else if (dw <= 6) put(i, B.shallow[1]);
        else if (dw <= 9 || (dw <= 13 && bay < (13 - dw) / 4)) put(i, B.shallow[2]);
        continue;
      }
      if (river[i]) {
        put(i, river[i - W] && river[i + W] && bay < 0.3 ? B.river[1] : B.river[0]);
        continue;
      }
      const e = el[i],
        // light from the top left: slopes rising toward the bottom right face it
        sl = (el[i + 1] || e) - (el[i - 1] || e) + ((el[i + W] || e) - (el[i - W] || e)),
        tone = sl > 0.012 ? 1 : sl < -0.012 ? 3 : 2,
        rg = region[i] >= 0 ? MAP_REGIONS[regionNames[region[i]]] : null;
      let band;
      if (dLand[i] <= 2.5 && e < 0.4 && !rg) band = [0, ...B.sand];
      else if (rg) {
        band = bandOf(rg.bands, e + (bay - 0.5) * 0.06);
        // the canyon's layered rock: stripes by height
        if (rg.strata && Math.floor(e * 26 + fbm(x / 30, y / 30) * 2) % 3 === 0) band = [0, band[2], band[3], band[3]];
      } else band = bandOf(B.bands, e + (bay - 0.5) * 0.06);
      put(i, band[tone]);
      // lavender fields and wild flowers on the low meadows
      if (!rg && e < 0.2 && dLand[i] > 4) {
        if (B.lavender && fbm(x / 12, y / 12, 3) > 0.6 && bay < 0.35) put(i, B.flowers[bay < 0.15 ? 0 : 1]);
        else if (B.flowers.length && rnd() < 0.004) put(i, B.flowers[Math.floor(rnd() * B.flowers.length)]);
      }
      // the swamp's toxic pools
      if (rg && rg.pools && fbm(x / 6, y / 6, 2) > 0.66) put(i, fbm(x / 6, y / 6, 2) > 0.7 ? '#b8f04a' : '#3e4a26');
    }
  const c = makeCanvas(W, H),
    g = c.getContext('2d');
  g.putImageData(img, 0, 0);
  // grass tufts
  for (let n = 0; n < 900; n++) {
    const x = Math.floor(rnd() * W),
      y = Math.floor(rnd() * H),
      i = y * W + x;
    if (!land[i] || river[i] || region[i] >= 0 || dLand[i] < 4 || el[i] > 0.5) continue;
    const b = bandOf(B.bands, el[i]);
    g.fillStyle = b[1];
    g.fillRect(x, y - 1, 1, 1);
    g.fillRect(x + 2, y - 1, 1, 1);
    g.fillStyle = b[3];
    g.fillRect(x + 1, y, 1, 1);
  }
  // trees: forests where the forest noise is high, a few lone trees on the meadows, conifers up the mountains and in
  // the snow, dark trees round the dark castle
  const forest = mapNoise(def.seed + 57),
    trees = [],
    near = (x, y, r) => T.marks.some(m => Math.hypot(x / 2 - m.at[0], y / 2 - m.at[1]) < r);
  for (let y = 4; y < H; y += 4)
    for (let x = 2; x < W - 2; x += 4) {
      const tx = x + Math.floor(rnd() * 3) - 1,
        ty = y + Math.floor(rnd() * 3) - 1,
        i = ty * W + tx;
      if (ty < 0 || ty >= H || !land[i] || river[i] || dLand[i] < 4.5 || near(tx, ty, 9)) continue;
      const rg = region[i] >= 0 ? MAP_REGIONS[regionNames[region[i]]] : null,
        e = el[i],
        f = forest(tx / 26, ty / 26, 3);
      if (rg && rg.trees === false) continue;
      if (e > 0.82 && !(rg && rg.snowTrees)) continue;
      // the woods grow in clumps: dense where the forest noise is high, a lone tree now and then elsewhere
      const dense = f > 0.56,
        chance = rg ? (rg.trees === undefined ? 0.4 : rg.trees * 0.8) : dense ? 0.85 : 0.012;
      if (rnd() > chance) continue;
      let sprite;
      if (rg && rg.snowTrees) sprite = 'snow';
      else if (rg && rg.darkTrees) sprite = 'dark';
      else if (e > 0.5) sprite = 'conifer';
      else {
        // a tree of the biome's kinds, by their weights
        const w = B.treeWeights || B.trees.map(() => 1);
        let r = rnd() * w.reduce((a, b) => a + b, 0),
          t = 0;
        while (r >= w[t]) r -= w[t++];
        sprite = 'round' + t + (rnd() < 0.35 ? 'b' : '');
      }
      trees.push([tx, ty, sprite]);
    }
  for (const [x, y, w, h, snow] of def.peaks || [])
    trees.push([x * 2, y * 2, 'peak|' + w + '|' + h + '|' + (snow ? 1 : 0)]);
  const sprites = {};
  const spriteOf = k => {
    if (k.startsWith('peak')) {
      const [, w, h, snow] = k.split('|').map(Number);
      return mapPeakBitmap(def.biome, w, h, snow).c;
    }
    if (!sprites[k]) {
      if (k === 'snow') sprites[k] = mapTreeSprite('conifer', B.snowTree, B.outline, B.trunk);
      else if (k === 'dark')
        sprites[k] = mapTreeSprite('conifer', ['#5a4a7a', '#3a2e5a', '#24183c'], '#0e0a18', '#2a2030');
      else if (k === 'conifer') sprites[k] = mapTreeSprite('conifer', B.conifer, B.outline, B.trunk);
      else sprites[k] = mapTreeSprite(k.endsWith('b') ? 'big' : 'round', B.trees[+k[5]], B.outline, B.trunk);
    }
    return sprites[k];
  };
  // the landmarks (drawn like the characters: outlined and lit, see js/characters/chars.js) go in the same order
  if (marks)
    for (const m of Object.values(def.landmarks))
      if (MAP_LANDMARKS[m.kind] && MAP_LANDMARKS[m.kind].draw) trees.push([m.at[0] * 2, m.at[1] * 2, 'mark|' + m.kind]);
  trees.sort((a, b) => a[1] - b[1]);
  for (const [x, y, k] of trees) {
    if (k.startsWith('mark')) mapStamp(g, k.slice(5), x, y);
    else if (k.startsWith('peak')) {
      const [, w, h, snow] = k.split('|').map(Number),
        bm = mapPeakBitmap(def.biome, w, h, snow);
      g.drawImage(bm.c, x + bm.x - NC_X - 24, y + bm.y - NC_Y - 40);
    } else {
      const s = spriteOf(k);
      g.drawImage(s, x - (s.width >> 1), y - s.height + 1);
    }
  }
  return c;
}
// a mountain: a lit face and a shaded one meeting at the ridge, a snow cap on the high ones (w x h fine px, foot at box
// point (24, 40))
function mapMountain(G, w, h, snow) {
  const x0 = 24 - w / 2,
    x1 = 24 + w / 2,
    top = 40 - h,
    sx = 24 + w * 0.04;
  G.shape(
    'R',
    MS2.poly([x0, 40, x0 + w * 0.2, 40 - h * 0.42, 24 - w * 0.08, top + h * 0.12, sx, top, 24 + w * 0.1, 40]),
  );
  G.shape(
    'r',
    MS2.poly([sx, top, 24 + w * 0.26, top + h * 0.34, x1 - w * 0.12, 40 - h * 0.3, x1, 40, 24 + w * 0.1, 40]),
  );
  if (snow) {
    const sh = h * 0.42;
    G.paint(
      'N',
      MS2.poly([
        sx,
        top,
        x0 + w * 0.26,
        top + sh,
        24 - w * 0.12,
        top + sh * 0.8,
        24 - w * 0.02,
        top + sh * 1.05,
        24 + w * 0.08,
        top + sh * 0.7,
      ]),
      'R',
    );
    G.paint(
      'n',
      MS2.poly([
        sx,
        top,
        24 + w * 0.08,
        top + sh * 0.7,
        24 + w * 0.18,
        top + sh * 0.95,
        24 + w * 0.3,
        top + sh * 0.7,
        x1 - w * 0.2,
        top + sh * 0.9,
        24 + w * 0.26,
        top + h * 0.34,
      ]),
      'r',
    );
  }
}
const _mapPeaks = new Map();
function mapPeakBitmap(biome, w, h, snow) {
  const k = biome + w + 'x' + h + snow;
  if (!_mapPeaks.has(k)) {
    const [R, r, N, n] = MAP_BIOMES[biome].rock,
      G = ncGrid(1, 0);
    mapMountain(G, w, h, snow);
    _mapPeaks.set(k, ncPaint(G, { K: MAP_BIOMES[biome].outline, R, r, N, n }, ncKinds({ flat: 'rNn' }), false));
  }
  return _mapPeaks.get(k);
}
// draws a landmark's picture with its foot at fine pixel (ax, ay) of an island's canvas
const _mapProps = new Map();
function mapLandmarkBitmap(kind, step = 0) {
  const k = kind + '|' + step;
  if (!_mapProps.has(k)) {
    const L = MAP_LANDMARKS[kind],
      G = ncGrid(1, 0);
    (step ? L.frames[step - 1] : L.draw)(G);
    _mapProps.set(k, ncPaint(G, L.colors, ncKinds({ flat: L.flat || '' }), false));
  }
  return _mapProps.get(k);
}
function mapStamp(g, kind, ax, ay, step = 0) {
  const bm = mapLandmarkBitmap(kind, step);
  g.drawImage(bm.c, ax + bm.x - NC_X - 24, ay + bm.y - NC_Y - 40);
}

// ---------- landmarks ----------
// each one drawn on a native grid (box units = fine pixels) with its foot at box point (24, 40)
const MS2 = NC_SHAPES;
const MAP_LANDMARKS = {
  // Sniptor's sawmill factory: a sawtooth roof, a chimney and a big saw blade
  factory: {
    colors: { K: '#141420', M: '#7a8ca8', A: '#b4c0d4', D: '#4a4e60', Y: '#f8d860', R: '#d02848', S: '#c8ccd8' },
    flat: 'KY',
    draw: G => {
      G.shape('D', MS2.rect(28.6, 23, 3.4, 10));
      G.shape('R', MS2.bar(28.6, 24, 32, 24, 1.4), false);
      G.shape('M', MS2.rect(15, 31, 20, 9));
      G.shape(
        'A',
        MS2.all(
          MS2.poly([15, 31, 15, 26.6, 21.6, 31]),
          MS2.poly([21.6, 31, 21.6, 26.6, 28.3, 31]),
          MS2.poly([28.3, 31, 28.3, 26.6, 35, 31]),
        ),
      );
      G.paint('Y', MS2.all(MS2.rect(17.4, 33.6, 2, 2), MS2.rect(21.4, 33.6, 2, 2), MS2.rect(29.4, 33.6, 2, 2)), 'M');
      G.paint('D', MS2.rect(24.6, 35, 3, 5), 'M');
      G.shape(
        'S',
        MS2.all(MS2.disc(13, 35, 3.6), ...[0, 45, 90, 135, 180, 225, 270, 315].map(a => MS2.spike(13, 35, a, 5, 1.6))),
      );
      G.shape('R', MS2.disc(13, 35, 1.4), false);
    },
    smoke: [30.3, 21],
  },
  // Magmaron's volcano: the crater full of lava at the top of its cone, lava running down
  volcano: {
    colors: {
      K: '#1a0e0c',
      R: '#7a6460',
      r: '#4e3e3c',
      N: '#7a6460',
      n: '#4e3e3c',
      D: '#2e2222',
      L: '#ff6418',
      l: '#ffd040',
    },
    flat: 'rLl',
    draw: G => {
      mapMountain(G, 56, 34, false);
      // the crater at the top, lava welling in it and running down the slopes
      G.shape('D', MS2.ell(24.6, 7.6, 7, 2.4));
      G.shape('L', MS2.ell(24.6, 7.6, 4.8, 1.4), false);
      G.shape('l', MS2.ell(23.6, 7.4, 2, 0.6), false);
      G.paint(
        'L',
        MS2.all(
          MS2.strand(21, 9, 17, 20, 12, 34, 1.6, 0.8),
          MS2.strand(28, 9, 31, 22, 36, 36, 1.6, 0.8),
          MS2.strand(24.6, 9.4, 25, 18, 23, 26, 1.2, 0.6),
        ),
        'Rr',
      );
      G.paint(
        'l',
        MS2.all(MS2.strand(21, 9, 18, 16, 15.4, 24, 0.6, 0.4), MS2.strand(28, 9, 30, 15, 32, 22, 0.6, 0.4)),
        'L',
      );
    },
    smoke: [24.6, 5],
  },
  // Voltrax's lightning tower: a steel lattice with a glowing orb, under its own storm cloud
  tower: {
    colors: { K: '#10121c', V: '#aab4c8', C: '#58d8ff', c: '#e8fcff', Y: '#f2b41c' },
    flat: 'Cc',
    draw: G => {
      G.shape('V', MS2.all(MS2.taper(19.6, 40, 23, 20, 2, 1.2), MS2.taper(28.4, 40, 25, 20, 2, 1.2)));
      G.shape(
        'V',
        MS2.all(MS2.bar(20.6, 35, 27.4, 35, 1), MS2.bar(21.6, 29, 26.4, 29, 1), MS2.bar(22.6, 24, 25.4, 24, 1)),
        false,
      );
      G.shape('Y', MS2.rect(22.4, 18.6, 3.2, 2.4, 0.6));
      G.shape('C', MS2.disc(24, 16.6, 2.4));
      G.shape('c', MS2.disc(23.4, 16, 0.8), false);
    },
    storm: [24, 10],
  },
  // Glacielle's ice palace on the snowy peak
  snowpeak: {
    colors: { K: '#0c1424', R: '#a8b8cc', r: '#74849c', N: '#ffffff', n: '#c8d8ea', C: '#8ad8f8', c: '#e8fcff' },
    flat: 'rNnc',
    draw: G => {
      mapMountain(G, 60, 42, true);
      // the ice palace on the summit
      G.shape(
        'C',
        MS2.all(MS2.spike(25, 4, 180, 9, 3.4), MS2.spike(21.8, 5, 186, 6, 2.6), MS2.spike(28.4, 5, 174, 6.4, 2.6)),
      );
      G.paint('c', MS2.all(MS2.spike(24.6, 3, 180, 6, 1), MS2.spike(28, 4, 174, 4, 0.8)), 'C');
    },
    sparkle: [24.6, -2],
  },
  // Terralyn's rock arch in the canyon, a green gem glowing in it
  canyon: {
    colors: { K: '#1a100a', R: '#c27c4a', G: '#78d852', g: '#e6ffcc' },
    flat: 'g',
    draw: G => {
      G.shape(
        'R',
        MS2.all(MS2.rect(16, 28, 4.6, 12, 1), MS2.rect(28, 30, 4.6, 10, 1), MS2.strand(17, 30, 24, 22, 31, 31, 4, 4)),
      );
      G.shape('G', MS2.poly([24, 28, 25.6, 30, 24, 32, 22.4, 30]));
      G.shape('g', MS2.disc(23.6, 29.6, 0.5), false);
    },
    sparkle: [24, 30],
  },
  // Winderwomen's sky castle on a floating rock (drawn bobbing above the land, see mapIslandFx)
  skyisle: {
    colors: { K: '#10141e', R: '#9a8a7a', G: '#7ad050', V: '#f2f6fa', Y: '#e8c050', W: '#ffffff' },
    flat: 'W',
    draw: null,
    frames: [
      G => {
        G.shape('R', MS2.poly([13, 34, 35, 34, 30, 40, 26, 46, 22, 44, 17, 39]));
        G.shape('G', MS2.rect(13, 32, 22, 3, 1.4));
        G.shape('V', MS2.all(MS2.rect(18, 24, 12, 8), MS2.rect(16, 20, 4, 12), MS2.rect(28, 20, 4, 12)));
        G.shape(
          'Y',
          MS2.all(
            MS2.poly([15.4, 20.4, 18, 15, 20.6, 20.4]),
            MS2.poly([27.4, 20.4, 30, 15, 32.6, 20.4]),
            MS2.poly([21, 24.4, 24, 19, 27, 24.4]),
          ),
        );
        G.paint('K', MS2.rect(23, 28, 2, 4), 'V');
        G.shape('W', MS2.all(MS2.disc(12, 36, 3), MS2.disc(36, 37, 3.4), MS2.disc(32, 39, 2.4)), false);
      },
    ],
  },
  // Hydros's water tower by the lake
  watertower: {
    colors: { K: '#0c1424', B: '#3a7ad8', A: '#74d4f2', D: '#4a4e60', w: '#e8f8ff' },
    flat: 'w',
    draw: G => {
      G.shape(
        'D',
        MS2.all(
          MS2.taper(19, 40, 20.6, 28, 1.4, 1.2),
          MS2.taper(29, 40, 27.4, 28, 1.4, 1.2),
          MS2.bar(19.6, 35, 28.4, 35, 0.9),
        ),
      );
      G.shape('B', MS2.rect(17.6, 20, 12.8, 9, 2.6));
      G.paint('A', MS2.bar(17.6, 22.4, 30.4, 22.4, 1.4), 'B');
      G.shape('A', MS2.poly([17, 20.4, 24, 15.4, 31, 20.4]));
      G.shape('w', MS2.ell(20.6, 24.4, 1, 1.8), false);
    },
  },
  // Toxaris's chemical plant in the swamp: a tank, a pipe, a smokestack venting green
  toxic: {
    colors: { K: '#0a1006', V: '#9ca69a', D: '#3c4232', Y: '#ecc62a', L: '#b4ee46' },
    flat: 'L',
    draw: G => {
      G.shape('D', MS2.rect(27.4, 22, 3.4, 18));
      G.shape('Y', MS2.bar(27.4, 25, 30.8, 25, 1.2), false);
      G.shape('V', MS2.rect(14, 30, 12, 10, 3));
      G.paint('Y', MS2.bar(14, 33, 26, 33, 1.4), 'V');
      G.shape('L', MS2.rect(17, 35, 6, 3, 1));
      G.shape('D', MS2.bar(24, 31, 28, 31, 1.4));
    },
    smoke: [29.1, 20],
    smokeCol: ['#b4ee46', '#d8f888'],
  },
  // Umbrion's dark fortress: black stone, spired towers, violet windows
  darkcastle: {
    colors: { K: '#08040e', A: '#4a3e6a', B: '#2a2040', G: '#c878ff' },
    flat: 'G',
    draw: G => {
      G.shape(
        'A',
        MS2.all(
          MS2.rect(15, 28, 18, 12),
          MS2.rect(13, 22, 5, 18),
          MS2.rect(30, 22, 5, 18),
          MS2.rect(21.4, 18, 5.2, 22),
        ),
      );
      G.shape(
        'B',
        MS2.all(MS2.spike(15.5, 22.4, 180, 6, 6), MS2.spike(32.5, 22.4, 180, 6, 6), MS2.spike(24, 18.4, 180, 8, 6.6)),
      );
      G.paint(
        'G',
        MS2.all(
          MS2.rect(14.6, 26, 1.6, 2.4),
          MS2.rect(31.6, 26, 1.6, 2.4),
          MS2.rect(23.2, 22, 1.6, 2.4),
          MS2.rect(19, 31, 1.6, 2.4),
          MS2.rect(27.4, 31, 1.6, 2.4),
        ),
        'A',
      );
      G.paint('B', MS2.rect(22.4, 34, 3.2, 6), 'A');
    },
    glow: [24, 30, '#a050e8'],
  },
  // Sonique's floating concert stage: a magenta arch over the stage, speakers at its sides
  stage: {
    colors: { K: '#14060e', B: '#221624', A: '#c8369a', P: '#f6b2dc', L: '#ff62c6' },
    flat: 'L',
    draw: G => {
      G.shape('B', MS2.rect(13, 35, 22, 5, 1));
      G.shape('A', MS2.strand(14, 35, 24, 18, 34, 35, 3, 3));
      G.shape('P', MS2.bar(13.4, 36, 34.6, 36, 1), false);
      for (const x of [11, 37]) {
        G.shape('B', MS2.rect(x - 2.4, 30, 4.8, 10, 1));
        G.shape('L', MS2.disc(x, 32.4, 1.4), false);
        G.shape('L', MS2.disc(x, 36.6, 1.4), false);
      }
    },
    beams: [24, 22],
  },
  // Lumina's crystal palace: prism spires on a gold base
  crystal: {
    colors: { K: '#141008', C: '#5ad8f2', c: '#eafcff', Y: '#eec03a', p: '#ff8acc' },
    flat: 'cp',
    draw: G => {
      G.shape(
        'C',
        MS2.all(
          MS2.spike(24, 37, 180, 18, 5),
          MS2.spike(18.6, 37, 188, 11, 4),
          MS2.spike(29.4, 37, 172, 12, 4),
          MS2.spike(14.4, 37.4, 194, 6, 3),
          MS2.spike(33.6, 37.4, 166, 7, 3),
        ),
      );
      G.paint(
        'c',
        MS2.all(MS2.spike(23.2, 35, 180, 13, 1.4), MS2.spike(18.2, 35, 188, 7, 1), MS2.spike(29, 35, 172, 8, 1)),
        'C',
      );
      G.paint('p', MS2.spike(25.2, 33, 180, 6, 0.8), 'C');
      G.shape('Y', MS2.rect(12.6, 36.6, 22.8, 3.4, 1));
    },
    sparkle: [24, 22],
  },
  // Chronia's clock tower
  clocktower: {
    colors: { K: '#120a06', A: '#b0683a', D: '#4a2c18', C: '#fff6e0', Y: '#f0c040' },
    flat: '',
    draw: G => {
      G.shape('A', MS2.rect(19.6, 18, 8.8, 22, 1));
      G.shape('D', MS2.spike(24, 18.4, 180, 9, 10.4));
      G.shape('Y', MS2.disc(24, 23.6, 3.6));
      G.shape('C', MS2.disc(24, 23.6, 2.6), false);
      G.paint('D', MS2.all(MS2.bar(24, 23.6, 24, 21.6, 0.6), MS2.bar(24, 23.6, 25.6, 23.6, 0.6)), 'C');
      G.paint('D', MS2.all(MS2.rect(22.6, 30, 2.8, 3.4, 1), MS2.rect(22.6, 35, 2.8, 5)), 'A');
      G.shape('Y', MS2.bar(19, 28, 29, 28, 1), false);
    },
    glow: [24, 23.6, '#ffe08a'],
  },
  // Gravion's observatory on its hill: a white dome with the slit open and the telescope out of it
  observatory: {
    colors: { K: '#0c0a18', W: '#d8dcec', D: '#a8acc8', T: '#5a5478', Y: '#f8d878', V: '#9878f8' },
    flat: 'YV',
    draw: G => {
      G.shape('D', MS2.ell(24, 28, 11.6, 11));
      G.paint('K', MS2.poly([21.8, 17.4, 26.2, 17.4, 25.6, 28, 22.4, 28]), 'D');
      G.shape('T', MS2.bar(24.4, 24, 33.4, 14.4, 2));
      G.shape('V', MS2.disc(33.6, 14.2, 1.2), false);
      G.shape('W', MS2.rect(12.4, 28, 23.2, 12, 0.8));
      G.paint(
        'Y',
        MS2.all(MS2.rect(15.4, 31, 2.4, 2.4), MS2.rect(30.2, 31, 2.4, 2.4), MS2.rect(22.6, 34, 2.8, 6)),
        'W',
      );
    },
    glow: [33.6, 14.2, '#9878f8'],
    sparkle: [36, 8],
  },
  // Polaris's aurora railway: a rail bridge on steel pylons, a horseshoe magnet over it, the aurora in the sky
  aurorarail: {
    colors: { K: '#0e1018', S: '#5a6878', M: '#98a8b8', R: '#c83848', B: '#2868c8', W: '#eef2fa' },
    flat: 'W',
    draw: G => {
      G.shape('S', MS2.all(MS2.rect(13, 27, 3, 13), MS2.rect(32, 27, 3, 13)));
      G.shape('M', MS2.rect(9, 25, 30, 2.6, 0.6));
      G.paint('S', MS2.all(MS2.rect(13.4, 32, 2.2, 1), MS2.rect(32.4, 32, 2.2, 1)), 'S');
      G.shape('R', MS2.strand(19.6, 24, 24, 15.6, 28.4, 24, 2.6, 2.6));
      G.paint('B', MS2.rect(24, 14, 6, 11), 'R');
      G.shape('W', MS2.all(MS2.rect(18.4, 23, 2.4, 1.6), MS2.rect(27.2, 23, 2.4, 1.6)), false);
    },
    aurora: [24, 6],
  },
  // Astraea's star gate: a gold ring on a marble dais, the starry night inside it
  stargate: {
    colors: { K: '#0a0c20', Y: '#f8d878', y: '#c89828', V: '#24204a', w: '#fcf4c8', M: '#e4e0f0' },
    flat: 'w',
    draw: G => {
      G.shape('M', MS2.all(MS2.rect(13, 36, 22, 4, 0.8), MS2.rect(16, 33.6, 16, 2.6, 0.6)));
      G.shape('Y', MS2.ell(24, 23.6, 8.4, 10.6));
      G.paint('V', MS2.ell(24, 23.6, 6, 8.2), 'Y');
      G.paint('y', MS2.strand(17, 28, 24, 33.6, 31, 28, 1, 1), 'Y');
      G.paint('w', MS2.all(MS2.disc(22, 20, 0.7), MS2.disc(26.4, 24.6, 0.6), MS2.disc(23, 27.6, 0.5)), 'V');
      G.shape('Y', MS2.all(MS2.spike(11.6, 36, 180, 7, 2), MS2.spike(36.4, 36, 180, 7, 2)));
    },
    glow: [24, 23.6, '#f8d878'],
    sparkle: [24, 22],
  },
};

// ---------- the islands on the map ----------
const _mapIslands = new Map(),
  _mapTerrains = new Map();
// the island of continent i (CONTINENTS.length: the one still to come; 'train': the Training Ground; 'arena': the Boss
// Arena) and its terrain
// (computed once)
function mapIslandOf(i) {
  if (i === 'train') return MAP_TRAINING; // the Training Ground (js/world/training.js)
  if (i === 'arena') return MAP_ARENA; // the Boss Arena (js/world/arena.js)
  const c = CONTINENTS[i];
  if (!c) return MAP_UNKNOWN;
  return (
    MAP_ISLANDS[c.key] || {
      seed: 60 + i * 13,
      biome: 'meadow',
      lobes: MAP_UNKNOWN.lobes,
      ranges: MAP_UNKNOWN.ranges,
      rivers: [],
      // the bosses stand round the island
      landmarks: Object.fromEntries(
        c.stages.map((k, j) => {
          const a = (j / c.stages.length) * Math.PI * 2 - Math.PI / 2,
            p = [100 + Math.cos(a) * 50, 62 + Math.sin(a) * 26];
          return [k, { at: p, kind: '', icon: p }];
        }),
      ),
    }
  );
}
function islandTerrain(i) {
  if (!_mapTerrains.has(i)) _mapTerrains.set(i, mapTerrain(mapIslandOf(i)));
  return _mapTerrains.get(i);
}
// the picture of continent i; locked: its silhouette under the clouds
function islandBitmap(i, locked) {
  const k = i + (locked ? 'L' : '');
  if (_mapIslands.has(k)) return _mapIslands.get(k);
  let out;
  if (!locked) out = mapIsland(mapIslandOf(i), islandTerrain(i));
  else {
    // the land as a dark slate silhouette (its shape, relief and woods still faintly visible)
    const src = mapIsland(mapIslandOf(i), islandTerrain(i), false);
    out = makeCanvas(src.width, src.height, g => {
      g.drawImage(src, 0, 0);
      const img = g.getImageData(0, 0, src.width, src.height),
        d = img.data;
      for (let n = 0; n < d.length; n += 4) {
        const l = (0.3 * d[n] + 0.59 * d[n + 1] + 0.11 * d[n + 2]) / 255;
        d[n] = 34 + l * 52;
        d[n + 1] = 38 + l * 52;
        d[n + 2] = 58 + l * 64;
      }
      g.putImageData(img, 0, 0);
    });
  }
  _mapIslands.set(k, out);
  return out;
}
// where the bosses of continent i stand (logical px from the island's top left)
function islandIconAt(i, k) {
  const m = mapIslandOf(i).landmarks[k];
  return m ? m.icon : [100, 60];
}
// the island's moving parts: surf along the coast, smoke, the storm, sparkles, the sky castle, the stage lights; and
// clouds over a locked or unknown island
const _mapFoam = new Map();
function islandFoam(i, phase) {
  const k = i + '|' + phase;
  if (!_mapFoam.has(k)) {
    const T = islandTerrain(i),
      B = MAP_BIOMES[mapIslandOf(i).biome];
    _mapFoam.set(
      k,
      makeCanvas(T.W, T.H, g => {
        g.fillStyle = B.foam;
        for (let y = 0; y < T.H; y++)
          for (let x = 0; x < T.W; x++) {
            const i2 = y * T.W + x,
              dw = T.dWater[i2];
            if (T.land[i2] || T.lake[i2]) continue;
            // a broken line of surf hugging the coast, and a second one further out
            if (
              (dw <= 1.5 && (x * 3 + y * 5 + phase * 2) % 7 < 5) ||
              (dw > 3.5 && dw <= 4.5 && (x + y * 2 + phase * 3) % 9 < 2)
            )
              g.fillRect(x, y, 1, 1);
          }
      }),
    );
  }
  return _mapFoam.get(k);
}
function drawIsland(i, x0, y0, open) {
  const def = mapIslandOf(i),
    sm = ctx.imageSmoothingEnabled,
    t = frameCount;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(islandBitmap(i, !open), x0, y0, MAP_W, MAP_H);
  ctx.drawImage(islandFoam(i, (t >> 5) & 1), x0, y0, MAP_W, MAP_H);
  ctx.imageSmoothingEnabled = sm;
  if (!open) {
    // drifting clouds over the unexplored land
    for (let n = 0; n < 7; n++) {
      const cx = x0 + ((n * 53 + t * 0.12 * (1 + (n % 3) * 0.3)) % (MAP_W + 40)) - 20,
        cy = y0 + 22 + ((n * 37) % 76);
      ctx.globalAlpha = 0.55;
      for (const [dx, dy, r] of [
        [0, 0, 9],
        [10, 2, 7],
        [-9, 3, 6],
        [4, -4, 6],
      ])
        circle(cx + dx, cy + dy, r, n & 1 ? '#c8cee0' : '#aab2c8');
      ctx.globalAlpha = 1;
    }
    return;
  }
  for (const m of Object.values(def.landmarks)) {
    const L = MAP_LANDMARKS[m.kind];
    if (!L) continue;
    const [ax, ay] = [x0 + m.at[0], y0 + m.at[1]],
      // box point (bx, by) of the landmark's grid in logical px
      at = (bx, by) => [ax + (bx - 24) * HP, ay + (by - 40) * HP];
    if (L.smoke) {
      const [sx, sy] = at(...L.smoke),
        col = L.smokeCol || ['#c8c8d0', '#e8e8f0'];
      for (let n = 0; n < 3; n++) {
        const p = ((t * 0.4 + n * 20) % 60) / 60;
        ctx.globalAlpha = 0.7 * (1 - p);
        circle(sx + Math.sin(p * 5 + n) * 1.5 + p * 4, sy - p * 12, 1 + p * 2.4, col[n & 1]);
        ctx.globalAlpha = 1;
      }
    }
    if (L.storm) {
      const [sx, sy] = at(...L.storm);
      ctx.globalAlpha = 0.85;
      for (const [dx, dy, r] of [
        [0, 0, 5],
        [6, 1, 4],
        [-6, 1, 4],
        [3, -3, 4],
      ])
        circle(sx + dx, sy + dy, r, '#4a4e68');
      ctx.globalAlpha = 1;
      if ((t >> 3) % 5 === 0) {
        drawBolt(sx - 1, sy + 3, sx + 1, sy + 13, t >> 3, '#f8f058', 1, 4);
        glow(sx, sy + 8, 10, '#f8f058', 0.5);
      }
    }
    if (L.sparkle) {
      const [sx, sy] = at(...L.sparkle),
        p = (t >> 3) % 6;
      if (p < 3) {
        const x = sx + [-3, 2, 0][p],
          y = sy + [2, -2, 5][p];
        R(x - 1.5, y - 0.25, 3, 0.5, '#ffffff');
        R(x - 0.25, y - 1.5, 0.5, 3, '#ffffff');
      }
    }
    if (L.glow) {
      const [gx, gy] = at(L.glow[0], L.glow[1]);
      glow(gx, gy, 7, L.glow[2], 0.3 + ((t >> 4) & 1) * 0.15);
    }
    if (L.aurora) {
      // the aurora: green and violet curtains rippling over the railway
      const [ox, oy] = at(...L.aurora);
      for (let k = 0; k < 2; k++) {
        ctx.globalAlpha = 0.3 - k * 0.1;
        for (let d = -9; d <= 9; d += 0.5)
          R(ox + d, oy + Math.sin(d * 0.5 + t * 0.04 + k * 2) * 1.6 + k * 2, 0.5, 4 - k, k ? '#c8a8fc' : '#58f8a8');
      }
      ctx.globalAlpha = 1;
    }
    if (L.beams) {
      // the stage lights sweeping the sky
      const [bx, by] = at(...L.beams);
      ctx.globalAlpha = 0.25;
      for (const a of [Math.sin(t * 0.03) * 0.5, -Math.sin(t * 0.03) * 0.5])
        for (let d = 0; d < 10; d += 0.5) R(bx + Math.sin(a) * d - 0.5, by - d, 1 + d * 0.1, 0.5, '#ff9ed8');
      ctx.globalAlpha = 1;
    }
    if (m.kind === 'skyisle') {
      // the floating castle bobs, its shadow on the land below
      const bob = Math.sin(t * 0.04) * 1.2;
      ctx.globalAlpha = 0.18;
      for (let dx = -5; dx <= 5; dx += 2.5) circle(ax + dx, ay + 20, 2.4, '#10141e');
      ctx.globalAlpha = 1;
      const bm = mapLandmarkBitmap('skyisle', 1);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        bm.c,
        ax + (bm.x - NC_X - 24) * HP,
        ay + bob + (bm.y - NC_Y - 40) * HP,
        bm.c.width * HP,
        bm.c.height * HP,
      );
      ctx.imageSmoothingEnabled = sm;
    }
  }
}
// the islands take a moment to grow, so they are drawn in the background soon after the game starts
setTimeout(function warmIslands(i = 0) {
  if (i > CONTINENTS.length) return;
  islandBitmap(i, i === CONTINENTS.length || !continentUnlocked(i));
  setTimeout(() => warmIslands(i + 1), 50);
}, 800);
