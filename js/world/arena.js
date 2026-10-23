'use strict';
// The Boss Arena: an island of its own on the world map (after the Training Ground) with a colosseum where every boss
// beaten so far comes back, several at once: wave 1 brings one boss, wave 2 two, and so on, up to ARENA_MAX_ALIVE on
// the field at a time (the rest of the wave joins as others fall). Each wave's bosses are tougher (more HP). The run
// goes on until you fall (no life is lost) or leave from the pause menu, and it pays 5x the Training Ground: each boss
// ARENA_BOSS_POINTS (a big Training Ground enemy's 1,000, times 5) and each cleared wave wave x ARENA_WAVE_BONUS (the
// Training Ground's wave x 500, times 5). The best wave is saved in save.arena. It runs on the Training Ground's
// machinery (js/world/training.js): game.train, with mode 'boss'.

const ARENA_MAX_ALIVE = 4; // bosses on the field at once
const ARENA_HP = 0.5; // a boss's HP at wave 1, of its stage HP (before rematches); +10% every wave after
const ARENA_BOSS_POINTS = 5000;
const ARENA_WAVE_BONUS = 2500;
const ARENA_DC = 2; // the room's left wall: the arena is a boss room, so ROOM() and the boss camera work as in a stage

Object.assign(STAGES, {
  arena: {
    name: 'BOSS ARENA',
    place: 'BOSS ARENA',
    intro: 'SEMUA BOSS KEMBALI',
    theme: 'arena',
    music: 'boss',
    ambient: 'embers',
    color: '#f8a838',
  },
});
ENEMY_COLORS.arena = ENEMY_COLORS.train;
PLAT_COL.arena = '#f8a838';

// ---------- the look: a colosseum at dusk, a sandstone floor lined with gold ----------
TILESETS.arena = {
  ground(F, x, y, v, exp) {
    F(x, y, 16, 16, v & 1 ? '#5a4232' : '#56402f');
    F(x, y, 16, 1, '#6e5440');
    F(x, y, 1, 16, '#6a503c');
    F(x + 15, y, 1, 16, '#3a2a20');
    F(x, y + 15, 16, 1, '#3a2a20');
    F(x + 5, y + 6, 3, 2, '#4a3628');
    if (exp) {
      F(x, y, 16, 4, '#c89a5a');
      F(x, y, 16, 1, '#f8d070');
      F(x, y + 3, 16, 1, '#7a5a3a');
      F(x + 3, y + 1, 2, 1, '#e8b868');
    }
  },
  block(F, x, y) {
    // the colosseum's sandstone blocks
    F(x, y, 16, 16, '#2a1c14');
    F(x, y, 15, 15, '#9a7650');
    F(x + 1, y + 1, 13, 13, '#a8845a');
    F(x + 1, y + 1, 13, 1, '#d8b47a');
    F(x + 1, y + 7, 13, 1, '#7a5a3c');
    F(x + 7, y + 1, 1, 6, '#7a5a3c');
    F(x + 4, y + 8, 1, 6, '#7a5a3c');
  },
  spike: (F, x, y) => drawSpikes(F, x, y, '#e8c890', '#a8845a', '#5a4232'),
  ladder: (F, x, y) => drawLadder(F, x, y, '#f8d070', '#c89a5a', '#5a4232'),
};
BG_PAINTERS.arena = [
  {
    k: 0.1,
    ky: 0.4,
    paint(g) {
      skyGrad(g, [
        [0, '#1c0e2a'],
        [0.5, '#5a1e3a'],
        [0.85, '#c8502a'],
        [1, '#f89848'],
      ]);
      // the setting sun, and the far rim of the colosseum against it
      g.fillStyle = 'rgba(255,200,120,0.55)';
      g.beginPath();
      g.arc(BG_W * 0.62, BG_H - 70, 34, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#2a1424';
      g.fillRect(0, BG_H - 64, BG_W, 64);
      for (let x = 0; x < BG_W; x += 20) {
        g.fillStyle = '#1c0e1a';
        g.fillRect(x + 6, BG_H - 58, 9, 14);
        g.fillRect(x + 6, BG_H - 36, 9, 16);
        g.beginPath();
        g.arc(x + 10.5, BG_H - 58, 4.5, Math.PI, 0);
        g.arc(x + 10.5, BG_H - 36, 4.5, Math.PI, 0);
        g.fill();
      }
    },
  },
  {
    k: 0.35,
    ky: 1,
    paint(g, rnd) {
      // the stands: tiers of seats packed with the crowd, banners and torches between them
      for (let t = 0; t < 4; t++) {
        const y = BG_H - 108 + t * 22;
        g.fillStyle = ['#3a2218', '#4a2c1e', '#5a3424', '#6a3e2a'][t];
        g.fillRect(0, y, BG_W, 22);
        for (let x = 2; x < BG_W; x += 5) {
          const r = rnd();
          g.fillStyle = r < 0.1 ? '#f8d070' : r < 0.5 ? '#2a1810' : '#4a2e20';
          g.fillRect(x, y + 5 + ((x * 7) % 3), 3, 4);
        }
      }
      for (let x = 30; x < BG_W; x += 120) {
        g.fillStyle = '#a82828';
        g.fillRect(x, BG_H - 130, 12, 30);
        g.fillStyle = '#f8d070';
        g.fillRect(x, BG_H - 130, 12, 2);
        g.fillRect(x + 5, BG_H - 120, 2, 10);
      }
      for (let x = 90; x < BG_W; x += 120) {
        g.fillStyle = 'rgba(255,170,60,0.22)';
        g.beginPath();
        g.arc(x, BG_H - 118, 14, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#2a1810';
        g.fillRect(x - 1, BG_H - 116, 2, 14);
        g.fillStyle = '#f8a838';
        g.fillRect(x - 2, BG_H - 121, 4, 5);
        g.fillStyle = '#fff0a0';
        g.fillRect(x - 1, BG_H - 120, 2, 3);
      }
      g.fillStyle = '#f8d070';
      g.fillRect(0, BG_H - 110, BG_W, 2);
    },
  },
];

// ---------- the arena: one boss room, walled all round ----------
LAYOUTS.arena = B => {
  const dc = ARENA_DC;
  B.doorCol = dc;
  bossRoom(B, dc, 'arena');
  B.rect(dc, 19, dc, 21, '='); // no door: a wall
  B.rect(dc + 1, 13, dc + 22, 21, '.'); // open to the stands behind
  B.solid(0, 0, dc - 1, LEVEL_H - 1);
  B.solid(dc + 24, 0, LEVEL_W - 1, LEVEL_H - 1);
  B.add('start', dc + 4);
};

// ---------- the waves ----------
// the bosses that can come: every one beaten so far
const arenaPool = () => STAGE_ORDER.filter(k => BOSSES[k] && save.cleared[k]);
const inArena = () => !!(game.train && game.train.mode === 'boss');
function startArena() {
  startStage('arena');
  game.bossLocked = true; // the boss camera, no enemies of the stage, no door
  updateCamera(true);
  game.train = {
    mode: 'boss',
    wave: 0,
    toSpawn: 0,
    spawnT: 0,
    rest: 120,
    kills: 0,
    t: 0,
    bag: [],
    points: save.points,
    best: save.arena.wave,
    banner: { text: 'BOSS ARENA', t: 100 },
  };
}
function arenaNextWave() {
  const T = game.train;
  T.wave++;
  T.toSpawn = T.wave;
  T.spawnT = 20;
  T.banner = { text: 'WAVE ' + T.wave, t: 90 };
  sfx.confirm();
}
// the next boss to come: each beaten boss once, in a random order, before any of them comes again
function arenaNextType() {
  const T = game.train;
  if (!T.bag.length) T.bag = arenaPool().sort(() => Math.random() - 0.5);
  return T.bag.pop();
}
const arenaHp = type =>
  Math.round(28 * (CONTINENTS[continentOf(type)].bossHp || 1) * ARENA_HP * (1 + (game.train.wave - 1) * 0.1));
// a boss drops in from the ceiling somewhere in the room, away from the player (and from the others where it can)
function spawnArenaBoss() {
  const Rm = ROOM(),
    type = arenaNextType();
  let x = Rm.l + 16;
  for (let i = 0; i < 16; i++) {
    x = Rm.l + 16 + Math.random() * (Rm.r - Rm.l - 50);
    if (Math.abs(x + 9 - pcx()) > 72 && bosses.every(o => Math.abs(bcx(o) - (x + 9)) > 30)) break;
  }
  const b = makeBoss(type, x, Rm.ceil + 4, arenaHp(type));
  b.facing = pcx() < x + 9 ? -1 : 1;
  bosses.push(b);
  part({ kind: 'warp', x: x + 9, y: Rm.ceil + 28, life: 18 });
  sfx.warp();
}
// one step of the run (from updateTraining)
function updateArena(T) {
  if (T.rest > 0) {
    if (--T.rest === 0) arenaNextWave();
    return;
  }
  if (T.toSpawn > 0 && bosses.length < ARENA_MAX_ALIVE && --T.spawnT <= 0) {
    spawnArenaBoss();
    T.toSpawn--;
    T.spawnT = 45;
  }
  if (T.toSpawn === 0 && !bosses.length) {
    // the wave is cleared: a bonus and a breather
    const bonus = T.wave * ARENA_WAVE_BONUS;
    addScore(bonus);
    if (T.wave > save.arena.wave) {
      save.arena.wave = T.wave;
      writeSave();
    }
    T.banner = { text: 'WAVE ' + T.wave + ' BERES!  BONUS ' + fmtNum(bonus), t: 120 };
    T.rest = 180;
    sfx.oneup();
  }
}
// a boss beaten in the arena (from defeatBoss): its points, and an energy capsule where it fell
function arenaBossDown(b) {
  game.train.kills++;
  addScore(ARENA_BOSS_POINTS);
  pickups.push(makePickup('E', bcx(b), Math.min(b.y + b.h, ROOM().floor) - 14));
}
// each boss's HP over its head (from drawBoss)
function drawArenaBossHp(b, sx, sy) {
  const w = 20,
    f = clamp(b.hp / b.maxHp, 0, 1),
    x = Math.round(sx + b.w / 2 - w / 2);
  R(x - 1, sy - 8, w + 2, 4, '#0a0a16');
  R(x, sy - 7, Math.max(1, Math.round(w * f)), 2, f > 0.5 ? '#f87858' : f > 0.25 ? '#f8b800' : '#f8f058');
}

// ---------- the island on the world map ----------
Object.assign(MAP_BIOMES, {
  // a volcanic isle at dusk: dark sand, scorched grass and rock, lava in its streams
  ember: {
    shallow: ['#5ab0c8', '#3a8aac', '#2a6a92'],
    foam: '#e8f0f0',
    sand: ['#7a6656', '#5e4e44', '#463a32'],
    bands: [
      [0.2, '#8e8e4e', '#72743c', '#5a5c30'],
      [0.45, '#7e6e4c', '#66583e', '#504432'],
      [0.7, '#6e5444', '#584436', '#42322a'],
      [9, '#5e4e48', '#4a3e3a', '#362c2a'],
    ],
    river: ['#ff6418', '#ffd040'],
    trees: [
      ['#6e8e3e', '#52722e', '#384e22'],
      ['#7e7e3e', '#5e5e2e', '#404022'],
    ],
    conifer: ['#52723e', '#3a562e', '#243a20'],
    snowTree: ['#ffffff', '#d8e6f2', '#2e6a4a'],
    flowers: ['#ff8030', '#ffd040', '#ff5030'],
    rock: ['#8e7e74', '#62564e', '#c8b8a8', '#a89888'],
    outline: '#1a100c',
    trunk: '#4a3020',
  },
});
Object.assign(MAP_LANDMARKS, {
  // the colosseum: a round sandstone wall with two rows of arches, red banners on its rim and the arena glowing inside
  colosseum: {
    colors: { K: '#160c08', S: '#d8b888', s: '#a88458', D: '#3a2418', A: '#e8a050', R: '#d83838' },
    flat: 'AR',
    draw: G => {
      for (const x of [12, 24, 36]) {
        G.shape('D', MS2.rect(x - 0.6, 12, 1.2, 10));
        G.shape('R', MS2.poly([x + 0.6, 12, x + 5.6, 13.8, x + 0.6, 15.6]));
      }
      G.shape('S', MS2.all(MS2.rect(8, 22, 32, 18, 2), MS2.ell(24, 22, 16, 5)));
      G.paint('s', MS2.ell(24, 21.6, 13.4, 3.8), 'S');
      G.paint('A', MS2.ell(24, 22.6, 10, 2.4), 'Ss');
      for (const y of [27, 33])
        G.paint('D', MS2.all(...[10.5, 15, 19.5, 24, 28.5, 33].map(x => MS2.rect(x, y, 2.8, 4.4, 1.3))), 'S');
    },
    glow: [24, 23, '#ff9030'],
  },
});
const MAP_ARENA = {
  seed: 137,
  biome: 'ember',
  lobes: [
    [100, 64, 54, 30],
    [142, 54, 26, 20],
    [62, 74, 24, 16],
  ],
  bays: [[66, 48, 14, 10]],
  ranges: [[136, 46, 18, 10, 0.5]],
  peaks: [[140, 46, 24, 16, 0]],
  rivers: [[138, 50]],
  landmarks: { arena: { at: [90, 74], kind: 'colosseum', icon: [90, 78] } },
};
setTimeout(() => islandBitmap('arena', false), 1600);
