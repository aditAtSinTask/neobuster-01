'use strict';
// The Training Ground: an island of its own on the world map (after the continents) with a wide arena where waves of
// enemies come forever. Each wave brings more enemies than the last and they are tougher (more HP); they drop health
// often. The run ends when you fall (no life is lost) or leave from the pause menu. The best wave is saved, and every
// point scored goes into the POIN wallet as usual, plus a bonus for each wave cleared. The Boss Arena
// (js/world/arena.js) runs on the same machinery, with game.train.mode 'boss'.

const TRAIN_W = 128; // the arena's width in tiles (five screens and a bit)

Object.assign(STAGES, {
  train: {
    name: 'TRAINING GROUND',
    place: 'TRAINING GROUND',
    intro: 'BERTAHAN SELAMA MUNGKIN',
    theme: 'train',
    music: 'train',
    ambient: 'sparkle',
    color: '#78f8fc',
  },
});
Object.assign(ENEMY_COLORS, {
  train: {
    a: '#3cbcfc',
    c: '#1a6aa8',
    fly: '#f87858',
    fly2: '#fcd0a8',
    hop: '#58c878',
    hop2: '#c8f8c8',
    tur: '#5a6a8a',
  },
});
PLAT_COL.train = '#3cbcfc';
Object.assign(SONGS, {
  train: {
    step: 7,
    lead: [
      76, 0, 76, 79, 0, 76, 81, 0, 79, 0, 76, 0, 74, 0, 72, 0, 74, 0, 74, 77, 0, 74, 79, 0, 77, 0, 74, 0, 72, 0, 71, 0,
      72, 0, 76, 0, 79, 0, 84, 0, 83, 0, 79, 0, 76, 0, 79, 0, 81, 0, 79, 0, 77, 0, 76, 0, 74, 0, 76, 0, 79, 0, 0, 0,
    ],
    bass: [...bar(45), ...bar(43), ...bar(41), ...bar(40)],
  },
});

// ---------- the look: a training dome, steel floor panels lined with light ----------
TILESETS.train = {
  ground(F, x, y, v, exp) {
    F(x, y, 16, 16, v & 1 ? '#1c2a44' : '#1a2840');
    F(x, y, 16, 1, '#2a3e60');
    F(x, y, 1, 16, '#283a5a');
    F(x + 15, y, 1, 16, '#0e1626');
    F(x, y + 15, 16, 1, '#0e1626');
    F(x + 7, y + 7, 2, 2, '#24385a');
    if (exp) {
      F(x, y, 16, 3, '#2c4a78');
      F(x, y, 16, 1, '#78f8fc');
      F(x + 2, y + 3, 12, 1, '#0e1626');
    }
  },
  block(F, x, y) {
    F(x, y, 16, 16, '#0e1626');
    F(x, y, 15, 15, '#3a5a8a');
    F(x + 1, y + 1, 13, 13, '#4a6a9a');
    F(x + 1, y + 1, 13, 1, '#78f8fc');
    F(x + 3, y + 5, 9, 1, '#2a4a7a');
    F(x + 3, y + 10, 9, 1, '#2a4a7a');
  },
  spike: (F, x, y) => drawSpikes(F, x, y, '#a8d8f8', '#5a7ab0', '#2a3a5a'),
  ladder: (F, x, y) => drawLadder(F, x, y, '#78f8fc', '#3cbcfc', '#1a4a7a'),
};
BG_PAINTERS.train = [
  {
    k: 0.1,
    ky: 0.4,
    paint(g) {
      skyGrad(g, [
        [0, '#06101e'],
        [0.55, '#0e2448'],
        [1, '#1a4a78'],
      ]);
      // the dome overhead: a honeycomb of light
      g.strokeStyle = 'rgba(120,248,252,0.14)';
      g.lineWidth = 1;
      for (let r = 0; r < 9; r++)
        for (let c = 0; c <= BG_W / 24; c++) {
          const cx = c * 24 + (r & 1) * 12,
            cy = r * 20 + 6;
          g.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = Math.PI / 6 + (k * Math.PI) / 3;
            g.lineTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12);
          }
          g.closePath();
          g.stroke();
        }
      // floodlights on their masts
      for (let x = 40; x < BG_W; x += 160) {
        g.fillStyle = 'rgba(200,240,255,0.07)';
        g.beginPath();
        g.moveTo(x - 6, 61);
        g.lineTo(x + 10, 61);
        g.lineTo(x + 70, BG_H);
        g.lineTo(x - 66, BG_H);
        g.fill();
        g.fillStyle = '#0a1426';
        g.fillRect(x, 60, 4, BG_H - 60);
        g.fillStyle = '#e8f8ff';
        g.fillRect(x - 6, 56, 16, 5);
      }
    },
  },
  {
    k: 0.35,
    ky: 1,
    paint(g, rnd) {
      // the stands: tiers of seats full of spectators, a few of them waving lights
      for (let t = 0; t < 4; t++) {
        const y = BG_H - 110 + t * 22;
        g.fillStyle = ['#0c1830', '#102040', '#14284c', '#183058'][t];
        g.fillRect(0, y, BG_W, 22);
        for (let x = 2; x < BG_W; x += 5) {
          const r = rnd();
          g.fillStyle = r < 0.12 ? '#78f8fc' : r < 0.55 ? '#22365a' : '#1a2c4c';
          g.fillRect(x, y + 5 + ((x * 7) % 3), 3, 4);
        }
      }
      g.fillStyle = '#78f8fc';
      g.fillRect(0, BG_H - 112, BG_W, 2);
    },
  },
];

// ---------- the arena ----------
// two halves alike, each climbed from its left: a step up to a low ledge, a ladder up to a middle ledge, a ladder on
// to a top ledge, then a second step and low ledge; in the middle a bridge that the updraft pads at its ends reach,
// over a pedestal for cover
LAYOUTS.train = B => {
  const W = TRAIN_W;
  B.doorCol = W - 1; // no boss door: the camera stops at the arena's far wall
  B.ground(0, W - 1);
  B.solid(0, 0, 1, F - 1);
  B.solid(W - 2, 0, LEVEL_W - 1, LEVEL_H - 1);
  B.add('start', 6);
  for (const o of [0, 64]) {
    B.rect(o + 12, F - 2, o + 14, F - 1, '#');
    B.ledge(o + 15, o + 24, F - 4);
    B.ladder(o + 24, F - 8, F - 5);
    B.ledge(o + 25, o + 31, F - 8);
    B.ladder(o + 31, F - 12, F - 9);
    B.ledge(o + 32, o + 38, F - 12);
    B.rect(o + 40, F - 2, o + 42, F - 1, '#');
    B.ledge(o + 43, o + 50, F - 4);
  }
  B.ledge(56, 71, F - 7);
  B.rect(62, F - 2, 65, F - 1, '#');
  B.rect(52, F, 53, F, 'U');
  B.rect(74, F, 75, F, 'U');
};

// ---------- the waves ----------
// the enemies that join from a given wave on; the ones in the air appear in the air
const TRAIN_POOL = [
  [1, ['met', 'flyer', 'hopper', 'gearbot']],
  [3, ['blader', 'watcher', 'totem', 'fanbot']],
  [5, ['snowman', 'speakerbot', 'prismo', 'shade', 'mole', 'turret']],
  [7, ['orbiter', 'gravbot', 'magmine', 'polebot', 'starling', 'gateling']],
];
const TRAIN_AIR = new Set(['flyer', 'blader', 'watcher', 'fanbot', 'shade', 'orbiter', 'magmine', 'starling']);

function startTraining() {
  startStage('train');
  // where enemies on foot can appear: on any floor or ledge with room above it
  const ground = [];
  for (let ty = 2; ty < F; ty++)
    for (let tx = 3; tx < TRAIN_W - 3; tx++) {
      const under = tileAt(tx, ty + 1);
      if (trainOpen(tx, ty) && trainOpen(tx, ty - 1) && isSolidTile(under) && under !== 'U') ground.push([tx, ty]);
    }
  game.train = {
    mode: 'train',
    wave: 0,
    toSpawn: 0,
    spawnT: 0,
    maxAlive: 0,
    hpMul: 1,
    rest: 120,
    kills: 0,
    t: 0,
    ground,
  };
  game.train.points = save.points;
  game.train.best = save.train.wave;
  game.train.banner = { text: 'TRAINING GROUND', t: 100 };
}
function nextWave() {
  const T = game.train;
  T.wave++;
  T.toSpawn = Math.min(4 + T.wave * 2, 30);
  T.maxAlive = Math.min(3 + Math.ceil(T.wave / 2), 10);
  T.hpMul = 1 + (T.wave - 1) * 0.5; // the enemies get tougher every wave
  T.spawnT = 30;
  T.banner = { text: 'WAVE ' + T.wave, t: 90 };
  sfx.confirm();
}
const trainOpen = (tx, ty) => tileAt(tx, ty) === '.';
// where an enemy of this type can appear now: in view, not too close to the player (enemies in the air appear in the
// top part of the view)
function trainSpots(type) {
  if (!TRAIN_AIR.has(type))
    return game.train.ground.filter(([tx, ty]) => {
      const x = tx * TILE + 8,
        y = ty * TILE + 8;
      return onScreen(x, y, -16) && Math.hypot(x - pcx(), y - pcy()) > 96;
    });
  const spots = [];
  for (let tx = Math.floor(camX / TILE) + 1; tx < Math.floor((camX + VW) / TILE) - 1; tx++)
    for (let ty = Math.floor(camY / TILE) + 1; ty < Math.floor((camY + VH * 0.4) / TILE); ty++)
      if (trainOpen(tx, ty - 1) && trainOpen(tx, ty) && trainOpen(tx, ty + 1) && Math.abs(tx * TILE + 8 - pcx()) > 64)
        spots.push([tx, ty]);
  return spots;
}
function spawnTrainee() {
  const T = game.train,
    pool = TRAIN_POOL.filter(([w]) => T.wave >= w).flatMap(([, ks]) => ks),
    type = pool[(Math.random() * pool.length) | 0],
    spots = trainSpots(type);
  if (!spots.length) return false;
  const [tx, ty] = spots[(Math.random() * spots.length) | 0],
    // an enemy that leaves the screen comes back later
    s = { type, tx, ty, armed: false, ent: null, lost: () => T.toSpawn++ },
    e = createEnemy(s);
  e.hp = Math.ceil(EN[type].hp * T.hpMul);
  s.ent = e;
  enemies.push(e);
  part({ kind: 'warp', x: e.x + e.w / 2, y: e.y + e.h, life: 18 });
  sfx.warp();
  return true;
}
// one step of the run (from updatePlay)
function updateTraining() {
  const T = game.train;
  T.t++;
  if (T.banner && --T.banner.t <= 0) T.banner = null;
  if (T.mode === 'boss') return updateArena(T);
  if (T.rest > 0) {
    if (--T.rest === 0) nextWave();
    return;
  }
  if (T.toSpawn > 0 && enemies.length < T.maxAlive && --T.spawnT <= 0) {
    if (spawnTrainee()) T.toSpawn--;
    T.spawnT = Math.max(18, 48 - T.wave * 2);
  }
  if (T.toSpawn === 0 && !enemies.length) {
    // the wave is cleared: a bonus and a breather
    addScore(T.wave * 500);
    if (T.wave > save.train.wave) {
      save.train.wave = T.wave;
      writeSave();
    }
    T.banner = { text: 'WAVE ' + T.wave + ' BERES!  BONUS ' + T.wave * 500, t: 120 };
    T.rest = 150;
    sfx.oneup();
  }
}
// the run is over (fallen, or left from the pause menu): the results
function endTraining() {
  const T = game.train,
    rec = T.mode === 'boss' ? save.arena : save.train;
  rec.wave = Math.max(rec.wave, T.wave);
  rec.kills = Math.max(rec.kills || 0, T.kills);
  writeSave();
  T.record = T.wave > T.best;
  game.state = 'trainover';
  game.t = 0;
  pshots = [];
  eshots = [];
  playMusic('title');
}
function leaveTraining() {
  const arena = inArena();
  game.train = null;
  bosses = [];
  goMap();
  game.mapSel = CONTINENTS.length + (arena ? 2 : 1);
  game.mapX = game.mapSel * MAP_SLOT;
  sfx.confirm();
}

// ---------- on screen ----------
function drawTrainingHUD() {
  const T = game.train;
  if (T.wave) {
    text('WAVE ' + T.wave, VW / 2, 6, '#78f8fc', 1, 'center');
    const left = T.rest > 0 ? 0 : T.toSpawn + (T.mode === 'boss' ? bosses.length : enemies.length);
    text((T.mode === 'boss' ? 'BOSS ' : 'MUSUH ') + left, VW / 2, 18, '#a8c8f8', 1, 'center');
  }
  if (T.banner) {
    const s = T.banner.text.length > 16 ? 1 : 2,
      w = textWidth(T.banner.text) * s;
    R(VW / 2 - w / 2 - 10, 78, w + 20, 14 * s + 8, 'rgba(5,10,30,0.75)');
    R(VW / 2 - w / 2 - 10, 78, w + 20, 1, '#78f8fc');
    text(T.banner.text, VW / 2, 82, '#78f8fc', s, 'center');
  }
}
function drawTrainOver() {
  const T = game.train,
    sec = Math.floor(T.t / 60),
    arena = T.mode === 'boss';
  ctx.fillStyle = 'rgba(4,8,24,0.82)';
  ctx.fillRect(0, 0, VW, VH);
  text(arena ? 'ARENA SELESAI' : 'LATIHAN SELESAI', VW / 2, 34, arena ? '#f8a838' : '#78f8fc', 2, 'center');
  const rows = [
    ['WAVE', String(T.wave)],
    [arena ? 'BOSS DIKALAHKAN' : 'MUSUH DIKALAHKAN', String(T.kills)],
    ['WAKTU', Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0')],
    ['POIN DIDAPAT', fmtNum(save.points - T.points)],
    ['REKOR WAVE', String((arena ? save.arena : save.train).wave)],
  ];
  rows.forEach(([k, v], i) => {
    text(k, 110, 76 + i * 16, '#a8c8f8');
    text(v, VW - 110, 76 + i * 16, '#fcfcfc', 1, 'right');
  });
  if (T.record && (frameCount >> 3) & 1) text('REKOR BARU!', VW / 2, 162, '#f8d800', 1, 'center');
  if (game.t > 40 && (frameCount >> 4) & 1) text('PRESS ENTER', VW / 2, 190, '#a8a8b8', 1, 'center');
}

// ---------- the island on the world map ----------
Object.assign(MAP_BIOMES, {
  // sunny and lush: white beaches, bright meadows and palms
  tropic: {
    shallow: ['#7ae6f4', '#44c2e6', '#2a96d0'],
    foam: '#f4fcfc',
    sand: ['#fcf0c4', '#f0dca0', '#d8c080'],
    bands: [
      [0.2, '#a4e868', '#86d24e', '#68b43e'],
      [0.45, '#78cc4c', '#5cb43e', '#469434'],
      [0.7, '#5aa848', '#46903c', '#367432'],
      [9, '#b8b090', '#968e70', '#746c54'],
    ],
    river: ['#4ab4ec', '#a0e4fc'],
    trees: [
      ['#8ce060', '#5cb840', '#368a32'],
      ['#a8e870', '#74c84a', '#4a9838'],
    ],
    conifer: ['#62b04a', '#3a8a3c', '#226430'],
    snowTree: ['#ffffff', '#d8e6f2', '#2e6a4a'],
    flowers: ['#f87898', '#f8e858', '#ffffff'],
    rock: ['#c8bca0', '#968a70', '#ffffff', '#d8e0e8'],
    outline: '#123018',
    trunk: '#7a5230',
  },
});
Object.assign(MAP_LANDMARKS, {
  // the training arena: a stadium with a green field, arches round its wall and a flag at each end
  arena: {
    colors: { K: '#0c1424', W: '#c8d4e8', w: '#f2f6fc', D: '#2a3a5a', G: '#5ac85a', R: '#e83858', B: '#3cbcfc' },
    flat: 'GRB',
    draw: G => {
      for (const x of [10, 38]) {
        G.shape('D', MS2.rect(x - 0.6, 19, 1.2, 12));
        G.shape(x < 24 ? 'R' : 'B', MS2.poly([x + 0.6, 19, x + 6, 20.8, x + 0.6, 22.6]));
      }
      G.shape('W', MS2.all(MS2.rect(9, 29, 30, 11, 2), MS2.ell(24, 29, 15, 4.4)));
      G.paint('w', MS2.ell(24, 28.4, 15, 3.4), 'W');
      G.paint('G', MS2.ell(24, 28.8, 11.4, 2.2), 'W');
      G.paint('D', MS2.all(...[12, 16.5, 21, 25.5, 30, 34.5].map(x => MS2.rect(x, 33.2, 2.4, 4.6, 1))), 'W');
    },
    glow: [24, 29, '#78f8fc'],
  },
});
const MAP_TRAINING = {
  seed: 91,
  biome: 'tropic',
  lobes: [
    [100, 62, 56, 30],
    [68, 70, 26, 20],
    [134, 54, 26, 22],
  ],
  bays: [[152, 86, 16, 12]],
  ranges: [[122, 44, 18, 10, 0.4]],
  peaks: [[128, 44, 22, 14, 0]],
  rivers: [],
  landmarks: { train: { at: [94, 70], kind: 'arena', icon: [94, 74] } },
};
setTimeout(() => islandBitmap('train', false), 1400);
