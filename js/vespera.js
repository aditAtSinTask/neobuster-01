'use strict';
// Benua VESPERA (v1.0.0): Hydros, Toxaris, Umbrion, Sonique, Lumina, Chronia.
// Everything for this continent lives here and is registered into the shared tables (STAGES, LAYOUTS, BOSSES,
// WEAPONS, TILESETS, ...). The continent itself is listed in CONTINENTS in levels.js. See docs/MENAMBAH-KONTEN.md.

// ================= STAGE DATA =================
Object.assign(STAGES, {
  hydro: {
    name: 'HYDROS',
    title: 'MANUSIA AIR',
    theme: 'hydro',
    music: 'hydro',
    ambient: 'droplets',
    color: '#58b8f8',
  },
  toxic: {
    name: 'TOXARIS',
    title: 'MANUSIA RACUN',
    theme: 'toxic',
    music: 'toxic',
    ambient: 'spores',
    color: '#98e838',
  },
  shadow: {
    name: 'UMBRION',
    title: 'MANUSIA BAYANGAN',
    theme: 'shadow',
    music: 'shadow',
    ambient: 'motes',
    color: '#a878e8',
  },
  sonic: { name: 'SONIQUE', title: 'WANITA SUARA', theme: 'sonic', music: 'sonic', ambient: 'notes', color: '#f878c8' },
  light: {
    name: 'LUMINA',
    title: 'WANITA CAHAYA',
    theme: 'light',
    music: 'light',
    ambient: 'sparkle',
    color: '#fcf0a8',
  },
  time: { name: 'CHRONIA', title: 'WANITA WAKTU', theme: 'time', music: 'time', ambient: 'dust', color: '#e8b868' },
});
Object.assign(ENEMY_COLORS, {
  hydro: {
    a: '#58b8f8',
    c: '#2878b8',
    fly: '#3898c8',
    fly2: '#a8e8fc',
    hop: '#2a6a8a',
    hop2: '#78d8f8',
    tur: '#4a6a80',
  },
  toxic: {
    a: '#98e838',
    c: '#5a9a18',
    fly: '#7a5a28',
    fly2: '#c8f878',
    hop: '#4a6a28',
    hop2: '#a8e858',
    tur: '#5a5a40',
  },
  shadow: {
    a: '#8a68c8',
    c: '#4a3878',
    fly: '#3a2858',
    fly2: '#c8a8f8',
    hop: '#2a2040',
    hop2: '#8a78b8',
    tur: '#3a3448',
  },
  sonic: {
    a: '#f878c8',
    c: '#a83888',
    fly: '#5838c8',
    fly2: '#f8a8e8',
    hop: '#38285a',
    hop2: '#c878f8',
    tur: '#4a3858',
  },
  light: {
    a: '#fcf0a8',
    c: '#c8a848',
    fly: '#78c8e8',
    fly2: '#fcfcfc',
    hop: '#a8a8c8',
    hop2: '#e8f8fc',
    tur: '#8a8aa8',
  },
  time: {
    a: '#e8b868',
    c: '#a87838',
    fly: '#8a5a38',
    fly2: '#f8e0a8',
    hop: '#6a4a30',
    hop2: '#d8a868',
    tur: '#7a6048',
  },
});
Object.assign(PLAT_COL, {
  hydro: '#8ab8d8',
  toxic: '#8a8a58',
  shadow: '#5a4a78',
  sonic: '#c858a8',
  light: '#c8e8f8',
  time: '#c89848',
});
LIQUID.toxic = ['#2a7a18', '#b8f838', '#78d828']; // '~' is bubbling acid in Toxaris's stage

Object.assign(SONGS, {
  hydro: {
    step: 8,
    lead: [
      72, 0, 76, 0, 79, 0, 81, 79, 76, 0, 74, 0, 72, 0, 0, 0, 71, 0, 74, 0, 79, 0, 77, 76, 74, 0, 72, 0, 71, 0, 0, 0,
      72, 0, 76, 0, 79, 0, 84, 0, 83, 0, 81, 0, 79, 0, 0, 0, 77, 0, 76, 0, 74, 0, 76, 0, 72, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [...bar(48), ...bar(45), ...bar(41), ...bar(43)],
  },
  toxic: {
    step: 7,
    lead: [
      62, 0, 63, 0, 62, 0, 58, 0, 62, 0, 65, 0, 63, 62, 60, 0, 62, 0, 63, 0, 62, 0, 67, 0, 65, 0, 63, 0, 62, 0, 0, 0,
      70, 0, 69, 0, 67, 0, 65, 0, 67, 0, 63, 0, 62, 0, 60, 0, 58, 0, 60, 0, 62, 0, 63, 0, 62, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [...bar(38), ...bar(38), ...bar(34), ...bar(36)],
  },
  shadow: {
    step: 9,
    lead: [
      69, 0, 0, 72, 0, 0, 71, 0, 69, 0, 68, 0, 69, 0, 0, 0, 64, 0, 0, 65, 0, 0, 68, 0, 71, 0, 69, 0, 68, 0, 0, 0, 69, 0,
      0, 72, 0, 0, 76, 0, 75, 0, 72, 0, 71, 0, 0, 0, 72, 0, 71, 0, 69, 0, 68, 0, 64, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [...bar(45), ...bar(41), ...bar(40), ...bar(45)],
  },
  sonic: {
    step: 6,
    lead: [
      76, 76, 0, 79, 0, 76, 0, 74, 76, 0, 79, 0, 81, 0, 79, 0, 76, 76, 0, 79, 0, 76, 0, 74, 72, 0, 74, 0, 76, 0, 0, 0,
      81, 81, 0, 84, 0, 81, 0, 79, 81, 0, 84, 0, 86, 0, 84, 0, 83, 0, 81, 0, 79, 0, 76, 0, 79, 0, 81, 0, 84, 0, 0, 0,
    ],
    bass: [...bar(40), ...bar(43), ...bar(45), ...bar(38)],
  },
  light: {
    step: 8,
    lead: [
      79, 0, 83, 0, 86, 0, 83, 0, 84, 0, 88, 0, 91, 0, 0, 0, 81, 0, 84, 0, 88, 0, 84, 0, 86, 0, 83, 0, 79, 0, 0, 0, 79,
      0, 83, 0, 86, 0, 91, 0, 90, 0, 88, 0, 86, 0, 0, 0, 84, 0, 83, 0, 81, 0, 79, 0, 78, 0, 79, 0, 0, 0, 0, 0,
    ],
    bass: [...bar(43), ...bar(48), ...bar(45), ...bar(50)],
  },
  time: {
    step: 8,
    lead: [
      74, 0, 72, 0, 74, 0, 79, 0, 78, 0, 74, 0, 71, 0, 0, 0, 72, 0, 71, 0, 72, 0, 76, 0, 74, 0, 72, 0, 71, 0, 0, 0, 74,
      0, 76, 0, 78, 0, 79, 0, 81, 0, 79, 0, 78, 0, 76, 0, 74, 0, 71, 0, 72, 0, 74, 0, 79, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [...bar(43), ...bar(47), ...bar(48), ...bar(50)],
  },
});

// boss-room gimmicks
Object.assign(BOSS_ROOMS, {
  hydro: (B, dc) => B.rect(dc + 1, 20, dc + 22, 21, 'W'), // a flooded floor: jumps go higher, falls are slow
  toxic: (B, dc) => {
    B.add('vent', dc + 4, FLOOR, { phase: 0 });
    B.add('vent', dc + 19, FLOOR, { phase: 85 });
  },
  shadow: (B, dc) => {
    B.add('torch', dc + 3, 15);
    B.add('torch', dc + 20, 15);
    B.add('torch', dc + 11, 13);
  },
  sonic: (B, dc) => {
    B.add('speaker', dc + 1, 21, { dir: 1, period: 200 });
    B.add('speaker', dc + 22, 21, { dir: -1, period: 200, phase: 100 });
  },
  light: (B, dc) => B.add('hlaser', dc + 1, 16, { x1: dc + 22, period: 220 }),
  time: (B, dc) => {
    B.add('plat', dc + 6, 16, { r: 2.5, speed: 0.02 });
    B.add('plat', dc + 16, 16, { r: 2.5, speed: -0.02, phase: Math.PI });
  },
});

// ================= LOOKS =================
const VW_W = '#fcfcfc';
Object.assign(ROBOT_STYLES, {
  hydro: {
    // fin crest and gills
    back: (p, dy, w) => {
      p(9, -3 + dy, 5, 5, w ? VW_W : '#a8e8fc');
      p(12, -6 + dy, 3, 4, w ? VW_W : '#e0f8fc');
    },
    front: (d, dy, w) => {
      if (!w) {
        d(8, 12 + dy, 2, 1, '#1868b8');
        d(8, 14 + dy, 2, 1, '#1868b8');
      }
    },
  },
  toxic: {
    // tank on the back and a gas mask
    back: (p, dy, w) => {
      p(2, 9 + dy, 5, 8, w ? VW_W : '#5a7a28');
      p(3, 7 + dy, 3, 2, w ? VW_W : '#98e838');
    },
    front: (d, dy, w) => {
      if (!w) {
        d(12, 7 + dy, 5, 3, '#2a3a18');
        d(16, 8 + dy, 2, 2, '#98e838');
      }
    },
  },
  shadow: {
    // horns, a cape and violet eyes
    back: (p, dy, w) => {
      p(2, 9 + dy, 5, 13, w ? VW_W : '#22183a');
      p(7, -3 + dy, 2, 5, w ? VW_W : '#3a2858');
      p(15, -3 + dy, 2, 5, w ? VW_W : '#3a2858');
    },
    front: (d, dy, w) => {
      if (!w) {
        d(13, 5 + dy, 2, 3, '#e8a8fc');
        d(14, 6 + dy, 1, 2, '#8a28d8');
      }
    },
  },
  sonic: {
    // long magenta hair and headphones
    female: true,
    hair: '#e858b8',
    skirt: '#f8a8d8',
    back: (p, dy, w) => {
      p(3, 3 + dy, 5, 14, w ? VW_W : '#e858b8');
      p(0, 7 + dy, 4, 9, w ? VW_W : '#c84898');
    },
    front: (d, dy, w) => {
      if (!w) {
        d(8, 0 + dy, 8, 1, '#202028');
        d(6, 4 + dy, 3, 4, '#202028');
        d(6, 5 + dy, 2, 2, '#f878c8');
      }
    },
  },
  light: {
    // golden hair and a crystal tiara
    female: true,
    hair: '#f8d878',
    skirt: '#fcfcf0',
    back: (p, dy, w) => {
      p(3, 3 + dy, 5, 15, w ? VW_W : '#f8d878');
      p(1, 9 + dy, 4, 10, w ? VW_W : '#fcf0a8');
      p(10, -3 + dy, 4, 4, w ? VW_W : '#a8f0fc');
      p(11, -6 + dy, 2, 3, w ? VW_W : '#e8fcfc');
    },
  },
  time: {
    // hair bun, clock-hand crest and a clock on the chest
    female: true,
    hair: '#8a5a38',
    skirt: '#c89858',
    back: (p, dy, w) => {
      p(4, 0 + dy, 5, 5, w ? VW_W : '#8a5a38');
      p(2, 4 + dy, 5, 10, w ? VW_W : '#8a5a38');
      p(12, -6 + dy, 2, 6, w ? VW_W : '#c8a048');
      p(13, -3 + dy, 4, 2, w ? VW_W : '#c8a048');
    },
    front: (d, dy, w) => {
      if (!w) {
        d(10, 12 + dy, 4, 4, '#fcf0d0');
        d(12, 12 + dy, 1, 2, '#202028');
        d(12, 13 + dy, 2, 1, '#202028');
      }
    },
  },
});
Object.assign(WEAPON_ICONS, {
  hydro: () =>
    sprite(
      0,
      0,
      1,
      10,
      [
        [3, 0, 4, 3, '#58b8f8'],
        [2, 3, 6, 5, '#58b8f8'],
        [3, 8, 4, 2, '#3898d8'],
      ],
      [[3, 3, 2, 2, '#e0f8fc']],
    ),
  toxic: () =>
    sprite(
      0,
      0,
      1,
      10,
      [
        [4, 0, 2, 3, '#98e838'],
        [2, 3, 6, 6, '#78c828'],
      ],
      [
        [3, 4, 2, 2, '#e8fcb8'],
        [5, 6, 2, 2, '#3a6a18'],
      ],
    ),
  shadow: () =>
    sprite(
      0,
      0,
      1,
      10,
      [
        [3, 0, 4, 4, '#4a3870'],
        [2, 4, 6, 6, '#4a3870'],
      ],
      [
        [4, 1, 1, 1, '#e8a8fc'],
        [6, 1, 1, 1, '#e8a8fc'],
      ],
    ),
  sonic: () =>
    sprite(
      0,
      0,
      1,
      10,
      [
        [0, 3, 2, 4, '#f878c8'],
        [3, 2, 2, 6, '#f878c8'],
        [6, 1, 2, 8, '#f8a8e0'],
      ],
      [[9, 3, 1, 4, '#f8a8e0']],
    ),
  light: () =>
    sprite(
      0,
      0,
      1,
      10,
      [
        [4, 0, 2, 10, '#fcf0a8'],
        [2, 2, 6, 6, '#fcf0a8'],
        [0, 4, 10, 2, '#fcf0a8'],
      ],
      [[4, 4, 2, 2, '#fcfcfc']],
    ),
  time: () =>
    sprite(
      0,
      0,
      1,
      10,
      [[1, 1, 8, 8, '#e8b868']],
      [
        [2, 2, 6, 6, '#fcf0d0'],
        [4.5, 3, 1, 3, '#202028'],
        [5, 5, 2, 1, '#202028'],
      ],
    ),
});

// ================= TILESETS =================
Object.assign(TILESETS, {
  hydro: {
    ground(F, x, y, v, exp) {
      // wet stone with moss
      F(x, y, 16, 16, v & 1 ? '#3a5a78' : '#365470');
      F(x + (v % 12) + 1, y + ((v >> 4) % 9) + 5, 3, 2, '#4a6a88');
      F(x + ((v >> 7) % 12), y + ((v >> 11) % 10) + 4, 2, 2, '#2a4058');
      F(x + 15, y, 1, 16, '#22384e');
      F(x, y + 15, 16, 1, '#22384e');
      if (exp) {
        F(x, y, 16, 4, '#3a9a78');
        F(x, y, 16, 1, '#78d8a8');
        F(x, y + 4, 16, 1, '#1a5a48');
        F(x + (v % 10) + 2, y + 4, 3, 2, '#3a9a78');
      }
    },
    block(F, x, y, v) {
      // dam concrete with water stains
      F(x, y, 16, 16, '#5a6a78');
      F(x + 1, y + 1, 14, 14, '#8a9aa8');
      F(x + 1, y + 1, 14, 1, '#b8c8d0');
      F(x + 3 + (v % 6), y + 2, 1, 12, '#6a7a88');
      F(x + 9, y + 9, 4, 1, '#6a7a88');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#c8d8e8', '#6a7a90', '#3a4a60', '#58b8f8'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#8a9aa8', '#b8c8d0', '#4a5a68'),
  },
  toxic: {
    ground(F, x, y, v, exp) {
      // grimy plant floor with toxic sludge on top
      F(x, y, 16, 16, v & 1 ? '#4a4a38' : '#444434');
      F(x + (v % 12), y + ((v >> 4) % 10) + 4, 3, 1, '#5a5a44');
      F(x + ((v >> 8) % 13), y + ((v >> 12) % 10) + 5, 2, 2, '#38382a');
      F(x + 15, y, 1, 16, '#2a2a20');
      F(x, y + 15, 16, 1, '#2a2a20');
      if (exp) {
        F(x, y, 16, 3, '#5a9a18');
        F(x, y, 16, 1, '#b8f838');
        F(x + (v % 9) + 2, y + 3, 4, 2, '#5a9a18');
      }
    },
    block(F, x, y) {
      // hazard crate
      F(x, y, 16, 16, '#2a2a20');
      F(x + 1, y + 1, 14, 14, '#c8a818');
      for (let k = 0; k < 14; k += 4) F(x + 1 + k, y + 6, 2, 4, '#2a2a20');
      F(x + 1, y + 1, 14, 1, '#f8d848');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#a8b888', '#5a6a48', '#3a3a28', '#b8f838'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#7a7a60', '#a8a880', '#3a3a28'),
  },
  shadow: {
    ground(F, x, y, v, exp) {
      // dark castle stone
      F(x, y, 16, 16, v & 1 ? '#2a2438' : '#262034');
      F(x, y + 7, 16, 1, '#1a1428');
      F(x + (v & 1 ? 4 : 10), y, 1, 7, '#1a1428');
      F(x + (v & 1 ? 10 : 4), y + 8, 1, 8, '#1a1428');
      F(x + 15, y, 1, 16, '#14101e');
      F(x, y + 15, 16, 1, '#14101e');
      if (exp) {
        F(x, y, 16, 2, '#4a3a68');
        F(x, y, 16, 1, '#7a68a8');
      }
    },
    block(F, x, y) {
      F(x, y, 16, 16, '#1a1428');
      F(x + 1, y + 1, 14, 14, '#3a3050');
      F(x + 1, y + 1, 14, 1, '#5a4878');
      F(x + 6, y + 5, 4, 6, '#2a2040');
      F(x + 7, y + 6, 2, 2, '#8a58c8');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#6a5a88', '#2a2040', '#1a1428', '#c878f8'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#5a4030', '#7a5a40', '#2a1e14'),
  },
  sonic: {
    ground(F, x, y, v, exp) {
      // neon city pavement
      F(x, y, 16, 16, v & 1 ? '#2a2440' : '#26203a');
      F(x + 1, y + 7, 14, 1, '#3a3458');
      F(x + 7, y + 1, 1, 14, '#3a3458');
      F(x + 15, y, 1, 16, '#18142a');
      F(x, y + 15, 16, 1, '#18142a');
      if (exp) {
        F(x, y, 16, 3, '#38284a');
        F(x, y, 16, 1, '#f878c8');
        if (v & 2) F(x + (v % 8) + 2, y + 1, 5, 1, '#78f8f8');
      }
    },
    block(F, x, y) {
      // speaker cabinet
      F(x, y, 16, 16, '#101018');
      F(x + 1, y + 1, 14, 14, '#2a2a38');
      F(x + 4, y + 4, 8, 8, '#18181f');
      F(x + 6, y + 6, 4, 4, '#3a3a4a');
      F(x + 7, y + 7, 2, 2, '#f878c8');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#c8a8e8', '#6a4a8a', '#2a2040', '#f878c8'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#6a6a88', '#f878c8', '#2a2a40'),
  },
  light: {
    ground(F, x, y, v, exp) {
      // cave rock studded with crystals
      F(x, y, 16, 16, v & 1 ? '#4a4868' : '#464462');
      if (v % 3 === 0) {
        F(x + (v % 10) + 2, y + 6, 2, 4, '#a8e8fc');
        F(x + (v % 10) + 2, y + 6, 1, 2, '#fcfcfc');
      }
      F(x + ((v >> 7) % 12), y + ((v >> 11) % 10) + 4, 3, 2, '#3a3854');
      F(x + 15, y, 1, 16, '#2a2840');
      F(x, y + 15, 16, 1, '#2a2840');
      if (exp) {
        F(x, y, 16, 2, '#6a68a0');
        F(x + (v % 12) + 1, y - 3, 2, 3, v & 1 ? '#f8a8e8' : '#a8e8fc');
        F(x + (v % 12) + 1, y - 3, 1, 1, '#fcfcfc');
      }
    },
    block(F, x, y) {
      // crystal block
      F(x, y, 16, 16, '#5888b8');
      F(x + 1, y + 1, 14, 14, '#a8d8f8');
      F(x + 2, y + 2, 12, 12, '#c8e8fc');
      for (let k = 0; k < 6; k++) F(x + 3 + k, y + 10 - k, 1, 1, '#fcfcfc');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#e8f8fc', '#88b8e0', '#4a6a90', '#f8a8e8'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#a8c8e8', '#e8f8fc', '#5a6a88'),
  },
  time: {
    ground(F, x, y, v, exp) {
      // clock-tower planks over brass beams
      F(x, y, 16, 16, v & 1 ? '#6a4a30' : '#64462e');
      F(x, y + 5, 16, 1, '#4a3220');
      F(x, y + 11, 16, 1, '#4a3220');
      F(x + (v % 14) + 1, y + 2, 1, 1, '#2a1e14');
      F(x + 15, y, 1, 16, '#3a2818');
      F(x, y + 15, 16, 1, '#3a2818');
      if (exp) {
        F(x, y, 16, 3, '#a87838');
        F(x, y, 16, 1, '#e8b868');
      }
    },
    block(F, x, y) {
      // brass block with a gear
      F(x, y, 16, 16, '#5a4020');
      F(x + 1, y + 1, 14, 14, '#b88838');
      F(x + 1, y + 1, 14, 1, '#e8c070');
      F(x + 5, y + 4, 6, 8, '#8a6428');
      F(x + 4, y + 5, 8, 6, '#8a6428');
      F(x + 7, y + 7, 2, 2, '#5a4020');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#e8d0a0', '#8a6a38', '#4a3220', '#f8e0a8'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#b88838', '#e8c070', '#5a4020'),
  },
});

// ================= BACKGROUNDS =================
const blobs = (g, rnd, n, y0, y1, r0, r1, col) => {
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    g.beginPath();
    g.arc(rnd() * BG_W, y0 + rnd() * (y1 - y0), r0 + rnd() * (r1 - r0), 0, 7);
    g.fill();
  }
};
Object.assign(BG_PAINTERS, {
  hydro: [
    {
      k: 0.12,
      ky: 0.4,
      paint(g, rnd) {
        // dusk over a mountain reservoir, a dam with waterfalls
        skyGrad(g, [
          [0, '#14304a'],
          [0.5, '#2a6a88'],
          [0.85, '#78b8c8'],
          [1, '#a8d8d8'],
        ]);
        let x = -30;
        while (x < BG_W) {
          const w = 120 + rnd() * 80,
            h = 90 + rnd() * 60;
          poly(g, [x, BG_H, x + w / 2, BG_H - h, x + w, BG_H], '#2a4a68');
          x += w * 0.65;
        }
        g.fillStyle = '#4a5a6a';
        g.fillRect(0, BG_H - 70, BG_W, 70);
        for (let i = 0; i < 6; i++) {
          const wx = 40 + i * 128;
          g.fillStyle = '#a8e0f0';
          g.fillRect(wx, BG_H - 70, 10, 70);
          g.fillStyle = '#e0f8fc';
          g.fillRect(wx + 3, BG_H - 70, 3, 70);
        }
        g.fillStyle = '#5a6a7a';
        g.fillRect(0, BG_H - 74, BG_W, 6);
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        // pipes and pumping towers
        for (let x = 20; x < BG_W; x += 90 + rnd() * 50) {
          const h = 60 + rnd() * 70;
          g.fillStyle = '#1e3448';
          g.fillRect(x, BG_H - h, 22, h);
          g.fillRect(x - 4, BG_H - h, 30, 6);
          g.fillRect(x + 22, BG_H - 40 - rnd() * 30, 60, 8);
        }
      },
    },
  ],
  toxic: [
    {
      k: 0.12,
      ky: 0.4,
      paint(g, rnd) {
        // a sick yellow-green haze over chimneys
        skyGrad(g, [
          [0, '#1a2410'],
          [0.5, '#4a5a20'],
          [0.85, '#8a9a38'],
          [1, '#b8c058'],
        ]);
        blobs(g, rnd, 26, 20, 120, 14, 30, 'rgba(150,200,60,0.18)');
        for (let x = 0; x < BG_W; x += 40 + rnd() * 40) {
          const h = 60 + rnd() * 90,
            w = 10 + rnd() * 10;
          g.fillStyle = '#2a3018';
          g.fillRect(x, BG_H - h, w, h);
          g.fillStyle = '#b84818';
          g.fillRect(x, BG_H - h + 6, w, 3);
          blobs(g, rnd, 4, BG_H - h - 40, BG_H - h - 10, 6, 12, 'rgba(160,220,60,0.35)');
        }
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        // storage tanks and pipes
        for (let x = 0; x < BG_W; x += 70 + rnd() * 50) {
          const r = 22 + rnd() * 18;
          g.fillStyle = '#20240f';
          g.fillRect(x, BG_H - r * 2, r * 2, r * 2);
          g.beginPath();
          g.arc(x + r, BG_H - r * 2, r, Math.PI, 0);
          g.fill();
          g.fillRect(x + r * 2, BG_H - r - 6, 30, 5);
        }
      },
    },
  ],
  shadow: [
    {
      k: 0.1,
      ky: 0.4,
      paint(g, rnd) {
        // violet night, a red moon and castle spires
        skyGrad(g, [
          [0, '#08040f'],
          [0.6, '#1e1238'],
          [1, '#3a1e50'],
        ]);
        for (let i = 0; i < 90; i++) {
          g.fillStyle = rnd() < 0.3 ? '#e8d8fc' : '#6a58a0';
          g.fillRect((rnd() * BG_W) | 0, (rnd() * 150) | 0, 1, 1);
        }
        g.fillStyle = 'rgba(200,40,60,0.25)';
        g.beginPath();
        g.arc(560, 70, 40, 0, 7);
        g.fill();
        g.fillStyle = '#c83048';
        g.beginPath();
        g.arc(560, 70, 22, 0, 7);
        g.fill();
        let x = 0;
        while (x < BG_W) {
          const w = 30 + rnd() * 50,
            h = 60 + rnd() * 100;
          g.fillStyle = '#140c22';
          g.fillRect(x, BG_H - h, w, h);
          poly(g, [x - 4, BG_H - h, x + w / 2, BG_H - h - 30 - rnd() * 20, x + w + 4, BG_H - h], '#140c22');
          if (rnd() < 0.5) {
            g.fillStyle = '#f8c858';
            g.fillRect(x + w / 2 - 1, BG_H - h + 14, 3, 5);
          }
          x += w + rnd() * 30;
        }
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        // dead trees and gravestones
        for (let x = 10; x < BG_W; x += 40 + rnd() * 60) {
          if (rnd() < 0.5) {
            g.fillStyle = '#0c0816';
            g.fillRect(x, BG_H - 90, 6, 90);
            for (let b = 0; b < 4; b++) {
              g.save();
              g.translate(x + 3, BG_H - 90 + b * 16);
              g.rotate((rnd() - 0.5) * 2);
              g.fillRect(0, 0, 30, 3);
              g.restore();
            }
          } else {
            g.fillStyle = '#100a1c';
            g.fillRect(x, BG_H - 22, 14, 22);
            g.beginPath();
            g.arc(x + 7, BG_H - 22, 7, Math.PI, 0);
            g.fill();
          }
        }
      },
    },
  ],
  sonic: [
    {
      k: 0.1,
      ky: 0.4,
      paint(g, rnd) {
        // neon city at night
        skyGrad(g, [
          [0, '#0a0620'],
          [0.6, '#2a1048'],
          [1, '#5a1858'],
        ]);
        let x = 0;
        while (x < BG_W) {
          const w = 20 + rnd() * 40,
            h = 50 + rnd() * 110;
          g.fillStyle = '#160e2c';
          g.fillRect(x, BG_H - h, w, h);
          const neon = ['#f878c8', '#78f8f8', '#f8e078'][(rnd() * 3) | 0];
          if (rnd() < 0.6) {
            g.fillStyle = neon;
            g.fillRect(x + 3, BG_H - h + 8, w - 6, 3);
          }
          g.fillStyle = 'rgba(248,200,248,0.5)';
          for (let wy = BG_H - h + 16; wy < BG_H - 6; wy += 8)
            for (let wx = x + 3; wx < x + w - 3; wx += 5) if (rnd() < 0.2) g.fillRect(wx, wy, 2, 3);
          x += w + rnd() * 6;
        }
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        // stage scaffolding with speaker stacks
        for (let x = 30; x < BG_W; x += 150) {
          g.fillStyle = '#0e0a1c';
          g.fillRect(x, BG_H - 120, 6, 120);
          g.fillRect(x + 60, BG_H - 120, 6, 120);
          g.fillRect(x, BG_H - 120, 66, 6);
          for (let s = 0; s < 3; s++) {
            g.fillRect(x + 12, BG_H - 30 - s * 30, 42, 28);
            g.fillStyle = '#2a1a3a';
            g.beginPath();
            g.arc(x + 33, BG_H - 16 - s * 30, 10, 0, 7);
            g.fill();
            g.fillStyle = '#0e0a1c';
          }
        }
      },
    },
  ],
  light: [
    {
      k: 0.1,
      ky: 0.4,
      paint(g, rnd) {
        // a deep crystal cavern
        skyGrad(g, [
          [0, '#0a0818'],
          [0.6, '#1a1838'],
          [1, '#2a2858'],
        ]);
        for (let i = 0; i < 40; i++) {
          const x = rnd() * BG_W,
            y = 20 + rnd() * 200,
            h = 10 + rnd() * 30,
            c = ['#5878c8', '#a868c8', '#58a8c8'][i % 3];
          poly(g, [x - 5, y + h, x, y, x + 5, y + h], c);
          g.fillStyle = 'rgba(255,255,255,0.4)';
          g.fillRect(x, y + 4, 1, h - 6);
        }
        for (let x = 0; x < BG_W; x += 24) poly(g, [x, 0, x + 12, 30 + rnd() * 40, x + 24, 0], '#141230');
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        // big crystal clusters
        for (let x = 20; x < BG_W; x += 80 + rnd() * 60) {
          for (let c = 0; c < 4; c++) {
            const cx = x + c * 10,
              h = 40 + rnd() * 70;
            poly(g, [cx - 8, BG_H, cx, BG_H - h, cx + 8, BG_H], c & 1 ? '#3a4a88' : '#4a3a78');
          }
        }
      },
    },
  ],
  time: [
    {
      k: 0.12,
      ky: 0.4,
      paint(g, rnd) {
        // sunset over clock towers
        skyGrad(g, [
          [0, '#3a1e3a'],
          [0.5, '#a85848'],
          [0.85, '#f0a058'],
          [1, '#f8d088'],
        ]);
        let x = 0;
        while (x < BG_W) {
          const w = 40 + rnd() * 40,
            h = 90 + rnd() * 80;
          g.fillStyle = '#4a2a30';
          g.fillRect(x, BG_H - h, w, h);
          poly(g, [x - 4, BG_H - h, x + w / 2, BG_H - h - 30, x + w + 4, BG_H - h], '#4a2a30');
          g.fillStyle = '#f8e0b0';
          g.beginPath();
          g.arc(x + w / 2, BG_H - h + 22, Math.min(14, w / 3), 0, 7);
          g.fill();
          g.strokeStyle = '#4a2a30';
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(x + w / 2, BG_H - h + 22);
          g.lineTo(x + w / 2, BG_H - h + 13);
          g.moveTo(x + w / 2, BG_H - h + 22);
          g.lineTo(x + w / 2 + 7, BG_H - h + 22);
          g.stroke();
          x += w + rnd() * 60;
        }
      },
    },
    {
      k: 0.35,
      ky: 1,
      paint(g, rnd) {
        // giant gears
        for (let x = 40; x < BG_W; x += 130 + rnd() * 60)
          gear(g, x, BG_H - 30 - rnd() * 40, 30 + rnd() * 26, '#3a2228', 12);
      },
    },
  ],
});

// ================= BOSS ROOM ART =================
Object.assign(ROOM_ART, {
  hydro(g, x, y, w, h) {
    // a dam sluice: tiled wall, two outflow pipes, a water gauge
    g.fillStyle = 'rgba(120,180,220,0.18)';
    for (let i = 0; i < w; i += 32) g.fillRect(x + i, y, 1, h);
    for (const px of [x + 30, x + w - 70]) {
      g.fillStyle = '#2a4058';
      g.fillRect(px, y + 20, 40, 24);
      g.fillStyle = '#1a2a3a';
      g.beginPath();
      g.arc(px + 20, y + 32, 9, 0, 7);
      g.fill();
    }
    g.fillStyle = '#1a2a3a';
    g.fillRect(x + w / 2 - 6, y + 10, 12, 90);
    for (let k = 0; k < 9; k++) {
      g.fillStyle = k < 4 ? '#58b8f8' : '#2a4058';
      g.fillRect(x + w / 2 - 4, y + 92 - k * 9, 8, 6);
    }
  },
  toxic(g, x, y, w, h) {
    // tanks of glowing sludge and warning signs
    for (const tx of [x + 20, x + w - 70]) {
      g.fillStyle = '#20240f';
      g.fillRect(tx, y + 20, 50, 100);
      g.fillStyle = '#2a4a10';
      g.fillRect(tx + 6, y + 40, 38, 74);
      g.fillStyle = 'rgba(184,248,56,0.6)';
      g.fillRect(tx + 6, y + 70, 38, 44);
    }
    for (const sx of [x + w / 2 - 50, x + w / 2 + 50]) {
      g.fillStyle = '#7a6a10';
      g.beginPath();
      g.moveTo(sx, y + 40);
      g.lineTo(sx + 16, y + 68);
      g.lineTo(sx - 16, y + 68);
      g.fill();
      g.fillStyle = '#1a1a10';
      g.beginPath();
      g.arc(sx, y + 58, 4, 0, 7);
      g.fill();
    }
  },
  shadow(g, x, y, w, h) {
    // a throne hall: arches, banners and a violet sigil
    for (let i = 0; i < 4; i++) {
      const ax = x + 30 + i * 90;
      g.fillStyle = '#140c22';
      g.fillRect(ax, y + 30, 50, 114);
      g.beginPath();
      g.arc(ax + 25, y + 30, 25, Math.PI, 0);
      g.fill();
    }
    for (const bx of [x + 80, x + w - 100]) {
      g.fillStyle = '#4a1a38';
      g.fillRect(bx, y + 4, 20, 50);
      poly(g, [bx, y + 54, bx + 10, y + 64, bx + 20, y + 54], '#4a1a38');
    }
    g.strokeStyle = 'rgba(168,120,232,0.5)';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x + w / 2, y + 60, 22, 0, 7);
    g.stroke();
    poly(
      g,
      [x + w / 2, y + 38, x + w / 2 + 6, y + 60, x + w / 2, y + 82, x + w / 2 - 6, y + 60],
      'rgba(168,120,232,0.5)',
    );
  },
  sonic(g, x, y, w, h) {
    // a concert stage: speaker walls and an equalizer
    for (const sx of [x + 6, x + w - 46])
      for (let k = 0; k < 3; k++) {
        g.fillStyle = '#0c0a14';
        g.fillRect(sx, y + 20 + k * 40, 40, 38);
        g.fillStyle = '#2a2238';
        g.beginPath();
        g.arc(sx + 20, y + 39 + k * 40, 14, 0, 7);
        g.fill();
        g.fillStyle = '#0c0a14';
        g.beginPath();
        g.arc(sx + 20, y + 39 + k * 40, 6, 0, 7);
        g.fill();
      }
    for (let i = 0; i < 16; i++) {
      const bh = 10 + ((i * 37) % 50);
      g.fillStyle = i % 2 ? '#f878c8' : '#78f8f8';
      g.fillRect(x + 80 + i * 12, y + 110 - bh, 8, bh);
    }
  },
  light(g, x, y, w, h) {
    // a hall of mirrors and crystals
    for (let i = 0; i < 5; i++) {
      const mx = x + 20 + i * 70;
      g.fillStyle = '#2a3a68';
      g.fillRect(mx, y + 18, 34, 86);
      g.fillStyle = 'rgba(200,232,252,0.35)';
      g.fillRect(mx + 3, y + 21, 28, 80);
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.fillRect(mx + 6, y + 24, 3, 40);
    }
    for (let i = 0; i < 9; i++) {
      const cx = x + 20 + i * 40,
        ch = 14 + (i % 3) * 8;
      poly(g, [cx - 6, y + h, cx, y + h - ch, cx + 6, y + h], i & 1 ? '#a8e8fc' : '#f8a8e8');
    }
  },
  time(g, x, y, w, h) {
    // the face of the great clock
    const cx = x + w / 2,
      cy = y + 64;
    g.fillStyle = '#3a2418';
    g.beginPath();
    g.arc(cx, cy, 58, 0, 7);
    g.fill();
    g.fillStyle = '#e8d8b0';
    g.beginPath();
    g.arc(cx, cy, 52, 0, 7);
    g.fill();
    g.fillStyle = '#3a2418';
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      g.fillRect(cx + Math.cos(a) * 44 - 2, cy + Math.sin(a) * 44 - 2, 4, 4);
    }
    for (const px of [x + 30, x + w - 40]) {
      g.fillStyle = '#4a3020';
      g.fillRect(px, y, 10, h);
    }
  },
});
Object.assign(ROOM_FX, {
  time(rx, ry) {
    // the hands of the great clock turn
    const cx = rx + 176,
      cy = ry + 64,
      t = frameCount * 0.01;
    for (const [len, a, wdt] of [
      [40, t * 12, 1.5],
      [28, t, 2.5],
    ])
      for (let r = 0; r < len; r += 1.5)
        R(cx + Math.cos(a) * r - wdt / 2, cy + Math.sin(a) * r - wdt / 2, wdt, wdt, '#3a2418');
    circle(cx, cy, 3, '#c8a048');
  },
  sonic(rx, ry) {
    // the equalizer bounces to the music
    for (let i = 0; i < 16; i++) {
      const bh = 8 + Math.abs(Math.sin(frameCount * 0.12 + i * 0.7)) * 40;
      R(rx + 80 + i * 12, ry + 110 - bh, 8, bh, i % 2 ? '#f878c8' : '#78f8f8');
    }
  },
});
PAD_DRAW.sonic = (sx, sy) => {
  // drum pads instead of updraft vents
  R(sx, sy, 16, 16, '#3a2a48');
  R(sx, sy, 16, 4, '#f8e8f8');
  R(sx, sy + 3, 16, 1, '#c8a8d8');
  R(sx + 2, sy + 6, 12, 8, '#c84898');
  R(sx + 2, sy + 6, 12, 1, '#f878c8');
  const pulse = (frameCount >> 3) & 1;
  if (pulse) for (let k = 0; k < 3; k++) R(sx + 3 + k * 5, sy - 3 - k, 1, 2, '#f8a8e8');
};

// ================= AMBIENT PARTICLES =================
const wave = (q, a) => Math.sin(frameCount * a + q.ph);
Object.assign(AMBIENTS, {
  droplets: {
    n: 50,
    update: q => {
      q.y += 2 + q.sp * 2;
      q.x += 0.2;
    },
    draw: (q, x, y) => R(x, y, HP, q.s > 1 ? 3 : 2, q.s > 1 ? '#a8e8fc' : '#58a8d8'),
  },
  spores: {
    n: 40,
    update: q => {
      q.y -= q.sp * 0.6;
      q.x += wave(q, 0.03) * 0.4;
    },
    draw: (q, x, y) => {
      R(x, y, 1, 1, q.s > 1 ? '#c8f878' : '#78b838');
      if (q.s > 1) glow(x, y, 5, '#98e838', 0.3);
    },
  },
  motes: {
    n: 36,
    update: q => {
      q.x += wave(q, 0.015) * 0.3;
      q.y += Math.cos(frameCount * 0.012 + q.ph) * 0.3 - 0.1;
    },
    draw: (q, x, y) => {
      R(x, y, 1, 1, '#c8a8f8');
      if (q.s > 1) glow(x, y, 6, '#a878e8', 0.35);
    },
  },
  notes: {
    n: 22,
    update: q => {
      q.y -= q.sp * 0.5;
      q.x += wave(q, 0.04) * 0.5;
    },
    draw: (q, x, y) => {
      R(x, y, 1.5, 1.5, '#f878c8');
      R(x + 1, y - 4, HP, 4, '#f878c8');
      if (q.s > 1) R(x + 1, y - 4, 2, HP, '#f878c8');
    },
  },
  sparkle: {
    n: 40,
    update: q => {
      q.y += Math.sin(frameCount * 0.02 + q.ph) * 0.15;
    },
    draw: (q, x, y) => {
      const tw = wave(q, 0.08);
      if (tw > 0.3) {
        R(x - 1, y, 3, HP, '#fcfcfc');
        R(x, y - 1, HP, 3, '#fcfcfc');
      } else R(x, y, HP, HP, '#a8e8fc');
    },
  },
});

// ================= DARKNESS (Umbrion's castle) =================
// Everything is dark except a pool of light around the player, burning torches and the player's own shots.
let _dark = null;
POST_FX.shadow = () => {
  if (!_dark) _dark = makeCanvas(VW * 2, VH * 2);
  const g = _dark.getContext('2d');
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, VW, VH);
  g.fillStyle = 'rgba(4,2,12,0.9)';
  g.fillRect(0, 0, VW, VH);
  g.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r) => {
    const gr = g.createRadialGradient(x, y, r * 0.35, x, y, r);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r, 0, 7);
    g.fill();
  };
  if (alive(player)) hole(pcx() - camX, pcy() - camY, 70 + Math.sin(frameCount * 0.1) * 3);
  for (const h of hazards)
    if (h.kind === 'torch') hole(h.x - camX, h.y - camY, 64 + Math.sin(frameCount * 0.2 + h.x) * 4);
  for (const s of pshots) hole(s.x + s.w / 2 - camX, s.y + s.h / 2 - camY, 26);
  if (boss && boss.hp > 0) hole(bcx(boss) - camX, boss.y + 12 - camY, 34); // the boss's violet eyes give it away
  ctx.drawImage(_dark, 0, 0, VW, VH);
};

// ================= HAZARDS =================
Object.assign(HAZARD_KINDS, {
  // toxic: a floor vent that puffs a poison cloud (30 frames warning, 70 live, 70 off)
  vent: {
    make: d => ({
      cx: d.x * TILE + 8,
      base: d.y * TILE,
      x: d.x * TILE - 8,
      y: d.y * TILE - 44,
      w: 32,
      h: 44,
      phase: d.phase || 0,
      period: 170,
      on: false,
      warn: false,
    }),
    update(h, p) {
      const t = (frameCount + h.phase) % h.period,
        was = h.on;
      h.warn = t < 30;
      h.on = t >= 30 && t < 100;
      if (h.on && !was && onScreen(h.cx, h.base, 0)) noise(0.5, 0.12, 0, 1200);
      if (h.on && alive(p) && overlap(h, p)) damagePlayer(3);
    },
    draw(h) {
      const x = h.cx - camX,
        base = h.base - camY;
      R(x - 9, base - 3, 18, 3, '#0a0a16');
      R(x - 8, base - 3, 16, 2, '#5a5a44');
      for (let k = -6; k < 8; k += 4) R(x + k, base - 3, 2, 2, '#20200f');
      if (h.on)
        for (let i = 0; i < 7; i++) {
          const r = 6 + ((i * 13 + frameCount) % 8),
            cy = base - 6 - i * 6 - ((frameCount >> 1) % 6);
          ctx.globalAlpha = 0.55;
          circle(x + Math.sin(frameCount * 0.1 + i) * 6, cy, r, i & 1 ? '#78c828' : '#a8e858');
          ctx.globalAlpha = 1;
        }
      else if (h.warn && frameCount & 4) circle(x, base - 5, 3, '#a8e858');
    },
  },
  // sonic: a speaker that sends a sound ring rolling along the floor every period frames
  speaker: {
    make: d => ({
      x: d.x * TILE,
      y: (d.y + 1) * TILE - 16,
      w: 16,
      h: 16,
      dir: d.dir || -1,
      phase: d.phase || 0,
      period: d.period || 130,
    }),
    update(h) {
      const t = (frameCount + h.phase) % h.period;
      if (t === 0 && onScreen(h.x + 8, h.y + 8, 32)) {
        eshots.push({
          kind: 'sring',
          x: h.x + 8 + h.dir * 10 - 6,
          y: h.y,
          w: 12,
          h: 16,
          vx: h.dir * 2.4,
          vy: 0,
          dmg: 3,
          t: 0,
          delay: 0,
          life: 140,
        });
        tone(140, 70, 0.15, 'square', 0.08);
      }
    },
    draw(h) {
      const x = h.x - camX,
        y = h.y - camY,
        t = (frameCount + h.phase) % h.period,
        kick = t < 8 ? 1 : 0;
      sprite(
        x,
        y,
        1,
        16,
        [[0, 0, 16, 16, '#2a2a38']],
        [
          [3 - kick, 3 - kick, 10 + kick * 2, 10 + kick * 2, '#18181f'],
          [6, 6, 4, 4, '#f878c8'],
        ],
      );
    },
  },
  // light: a horizontal laser between two emitters, from column x to x1 at row y (30 warning, 60 live)
  hlaser: {
    make: d => ({
      x0: d.x * TILE,
      x1: (d.x1 + 1) * TILE,
      row: d.y * TILE + 8,
      x: d.x * TILE,
      y: d.y * TILE + 6,
      w: (d.x1 + 1 - d.x) * TILE,
      h: 4,
      phase: d.phase || 0,
      period: d.period || 150,
      on: false,
      warn: false,
    }),
    update(h, p) {
      const t = (frameCount + h.phase) % h.period,
        was = h.on;
      h.warn = t < 30;
      h.on = t >= 30 && t < 90;
      if (h.on && !was && onScreen((h.x0 + h.x1) / 2, h.row, 64)) tone(1800, 1200, 0.2, 'sawtooth', 0.06);
      if (h.on && alive(p) && overlap(h, p)) damagePlayer(4);
    },
    draw(h) {
      const a = h.x0 - camX,
        b = h.x1 - camX,
        y = h.row - camY;
      for (const ex of [a, b - 6]) {
        R(ex, y - 5, 6, 10, '#0a0a16');
        R(ex + 1, y - 4, 4, 8, '#a8c8e8');
        R(ex + 2, y - 1, 2, 2, h.on || h.warn ? '#f8a8e8' : '#5a6a88');
      }
      if (h.on) {
        R(a + 6, y - 2, b - a - 12, 4, '#f878c8');
        R(a + 6, y - 1, b - a - 12, 2, '#fcfcfc');
        glow((a + b) / 2, y, 20, '#f878c8', 0.4);
      } else if (h.warn && frameCount & 4) R(a + 6, y, b - a - 12, HP, 'rgba(248,168,232,0.6)');
    },
  },
  // time: a pendulum blade hanging from row y, len tiles long, swinging amp radians
  pendulum: {
    make: d => ({
      px: d.x * TILE + 8,
      py: d.y * TILE,
      len: (d.len || 5) * TILE,
      amp: d.amp || 1,
      spd: d.speed || 0.035,
      phase: d.phase || 0,
      x: 0,
      y: 0,
      w: 18,
      h: 18,
    }),
    update(h, p) {
      const a = Math.sin(frameCount * h.spd + h.phase) * h.amp;
      h.x = h.px + Math.sin(a) * h.len - 9;
      h.y = h.py + Math.cos(a) * h.len - 9;
      h.a = a;
      if (alive(p) && overlap(h, p)) damagePlayer(4);
    },
    draw(h) {
      const px = h.px - camX,
        py = h.py - camY,
        bx = h.x + 9 - camX,
        by = h.y + 9 - camY;
      R(px - 3, py - 2, 6, 4, '#3a2418');
      for (let r = 0; r < h.len - 6; r += 1.5)
        R(px + Math.sin(h.a) * r - 0.75, py + Math.cos(h.a) * r - 0.75, 1.5, 1.5, '#8a6a48');
      circle(bx, by, 9.5, '#0a0a16');
      circle(bx, by, 8.5, '#c8c8d8');
      circle(bx, by + 2, 6, '#e8e8f0');
      circle(bx, by - 2, 3, '#8a6a48');
    },
  },
  // shadow: a wall torch, a source of light in the dark castle
  torch: {
    make: d => ({ x: d.x * TILE + 8, y: d.y * TILE + 8 }),
    update() {},
    draw(h) {
      const x = h.x - camX,
        y = h.y - camY,
        fl = (frameCount >> 2) % 3;
      R(x - 1, y, 2, 7, '#5a4030');
      R(x - 3, y, 6, 2, '#5a4030');
      circle(x, y - 3 - fl * 0.5, 3, '#f87800');
      circle(x, y - 3, 1.5, '#fcf8c0');
      glow(x, y - 3, 18, '#f8a840', 0.7);
    },
  },
  // hydro: water dripping from a pipe in the ceiling at row y
  drip: {
    make: d => ({
      cx: d.x * TILE + 8,
      top: d.y * TILE,
      x: 0,
      y: 0,
      w: 6,
      h: 8,
      period: d.period || 90,
      phase: d.phase || 0,
      fall: false,
      vy: 0,
    }),
    update(h, p) {
      const t = (frameCount + h.phase) % h.period;
      if (t === 0) {
        h.fall = true;
        h.vy = 0;
        h.x = h.cx - 3;
        h.y = h.top + 6;
      }
      if (h.fall) {
        h.vy = Math.min(h.vy + 0.25, 6);
        h.y += h.vy;
        if (solidPx(h.cx, h.y + h.h) || h.y > camY + VH + 32) {
          h.fall = false;
          if (onScreen(h.cx, h.y)) debris(h.cx, h.y + 6, '#a8e8fc', 3, 1);
        }
        if (alive(p) && overlap(h, p)) {
          damagePlayer(2);
          h.fall = false;
        }
      }
    },
    draw(h) {
      const x = h.cx - camX,
        top = h.top - camY;
      R(x - 4, top, 8, 6, '#0a0a16');
      R(x - 3, top, 6, 5, '#6a7a88');
      if (h.fall) {
        R(h.x - camX + 1, h.y - camY, 4, 6, '#58b8f8');
        R(h.x - camX + 2, h.y - camY + 1, 1, 2, '#e0f8fc');
      }
    },
  },
});

// ================= ENEMIES =================
Object.assign(EN, {
  jelly: {
    // hydro: a jellyfish bobbing in the water
    w: 14,
    h: 14,
    hp: 2,
    dmg: 3,
    score: 250,
    init(e) {
      e.baseY = e.y;
    },
    update(e) {
      e.t++;
      e.y = e.baseY + Math.sin(e.t * 0.05) * 18;
      e.x += clamp(pcx() - (e.x + 7), -0.3, 0.3);
    },
    draw(e, x, y) {
      const sw = (e.t >> 3) & 1;
      sprite(
        x,
        y,
        1,
        14,
        [[1, 0, 12, 7, '#a878d8']],
        [
          [3, 2, 3, 2, '#e8c8fc'],
          [8, 2, 2, 2, '#fcfcfc'],
        ],
      );
      for (let k = 0; k < 4; k++) R(x + 2 + k * 3 + (sw && k & 1 ? 1 : 0), y + 7, 1, 6 - (k & 1), '#c8a8f8');
    },
  },
  slime: {
    // toxic: clings to the ceiling, drops when the player passes, then crawls after them
    w: 14,
    h: 10,
    hp: 2,
    dmg: 3,
    score: 250,
    init(e) {
      const tx = Math.floor((e.x + 7) / TILE);
      let ty = Math.floor(e.y / TILE);
      while (ty > 0 && !isSolidTile(tileAt(tx, ty - 1)) && e.y - ty * TILE < 6 * TILE) ty--;
      if (isSolidTile(tileAt(tx, ty - 1))) {
        e.mode = 'ceil';
        e.y = ty * TILE;
      } else e.mode = 'crawl';
    },
    update(e) {
      e.t++;
      if (e.mode === 'ceil') {
        if (Math.abs(pcx() - (e.x + 7)) < 22 && pcy() > e.y) {
          e.mode = 'fall';
          e.vy = 0;
        }
        return;
      }
      if (e.mode === 'fall') {
        physics(e);
        if (e.onGround) {
          e.mode = 'crawl';
          sfx.crumble();
        }
        return;
      }
      e.facing = pcx() < e.x + 7 ? -1 : 1;
      if (e.t % 2) moveX(e, e.facing * 0.6);
      physics(e);
    },
    draw(e, x, y) {
      const sq = (e.t >> 3) & 1;
      if (e.mode === 'ceil') {
        sprite(
          x,
          y,
          1,
          14,
          [[1, 0, 12, 6, '#78c828']],
          [
            [3, 4, 2, 1, '#2a3a18'],
            [9, 4, 2, 1, '#2a3a18'],
          ],
        );
        R(x + 6, y + 6, 2, 2 + ((e.t >> 4) % 3), '#98e838');
        return;
      }
      sprite(
        x,
        y,
        e.facing,
        14,
        [[sq, 2 + sq, 14 - sq * 2, 8 - sq, '#78c828']],
        [
          [3, 4, 2, 2, '#fcfcfc'],
          [9, 4, 2, 2, '#fcfcfc'],
          [4, 5, 1, 1, '#000000'],
          [10, 5, 1, 1, '#000000'],
        ],
      );
    },
  },
  speakerbot: {
    // sonic: a walking speaker that sends sound rings both ways
    w: 16,
    h: 18,
    hp: 4,
    dmg: 3,
    score: 300,
    grav: true,
    init(e) {
      e.t = 30;
    },
    update(e) {
      physics(e);
      e.t++;
      if (e.t % 110 === 0 && onScreen(e.x + 8, e.y + 8, 0) && alive(player)) {
        for (const d of [-1, 1])
          eshots.push({
            kind: 'sring',
            x: e.x + 8 + d * 10 - 6,
            y: e.y + 2,
            w: 12,
            h: 16,
            vx: d * 2.4,
            vy: 0,
            dmg: 3,
            t: 0,
            delay: 0,
            life: 100,
          });
        tone(160, 80, 0.12, 'square', 0.07);
      }
    },
    draw(e, x, y) {
      const kick = e.t % 110 > 100 ? 1 : 0;
      sprite(
        x,
        y,
        1,
        16,
        [
          [1, 0, 14, 14, '#2a2a38'],
          [3, 14, 3, 4, '#5a5a6a'],
          [10, 14, 3, 4, '#5a5a6a'],
        ],
        [
          [4 - kick, 3 - kick, 8 + kick * 2, 8 + kick * 2, '#18181f'],
          [6, 5, 4, 4, '#f878c8'],
        ],
      );
    },
  },
  shade: {
    // shadow: a ghost that drifts through walls toward the player and is hard to see
    w: 14,
    h: 16,
    hp: 2,
    dmg: 3,
    score: 300,
    init(e) {
      e.baseY = e.y;
    },
    update(e) {
      e.t++;
      const dx = pcx() - (e.x + 7),
        dy = pcy() - (e.y + 8),
        d = Math.hypot(dx, dy) || 1;
      e.facing = dx < 0 ? -1 : 1;
      e.x += (dx / d) * 0.55;
      e.y += (dy / d) * 0.45 + Math.sin(e.t * 0.08) * 0.3;
    },
    draw(e, x, y) {
      ctx.globalAlpha = 0.45 + Math.abs(Math.sin(e.t * 0.05)) * 0.4;
      sprite(
        x,
        y,
        e.facing,
        14,
        [
          [1, 0, 12, 12, '#3a2858'],
          [1, 11, 3, 5, '#3a2858'],
          [6, 11, 3, 4, '#3a2858'],
          [10, 11, 3, 5, '#3a2858'],
        ],
        [
          [4, 4, 2, 2, '#e8a8fc'],
          [9, 4, 2, 2, '#e8a8fc'],
        ],
      );
      ctx.globalAlpha = 1;
      glow(x + 7, y + 6, 8, '#a878e8', 0.3);
    },
  },
  prismo: {
    // light: a crystal that charges up and fires four diagonal laser bolts
    w: 14,
    h: 16,
    hp: 3,
    dmg: 3,
    score: 300,
    grav: true,
    init(e) {
      e.t = 40;
    },
    update(e) {
      physics(e);
      e.t++;
      if (e.t % 120 === 0 && onScreen(e.x + 7, e.y + 8, 0) && alive(player)) {
        for (const [vx, vy] of [
          [1, -1],
          [-1, -1],
          [1, -0.35],
          [-1, -0.35],
        ])
          enemyShot(e.x + 7, e.y + 4, vx * 3.2, vy * 3.2, 3, { kind: 'plaser', w: 6, h: 6 });
        tone(2400, 1600, 0.1, 'triangle', 0.08);
      }
    },
    draw(e, x, y) {
      const hot = e.t % 120 > 90;
      sprite(
        x,
        y,
        1,
        14,
        [
          [4, 0, 6, 16, hot ? '#f8a8e8' : '#a8d8f8'],
          [0, 6, 14, 6, hot ? '#f8a8e8' : '#a8d8f8'],
        ],
        [[5, 2, 2, 8, '#fcfcfc']],
      );
      if (hot) glow(x + 7, y + 8, 12, '#f878c8', 0.6);
    },
  },
  gearbot: {
    // time: a rolling gear that turns around at walls and ledges
    w: 16,
    h: 16,
    hp: 3,
    dmg: 3,
    score: 250,
    grav: true,
    init(e) {
      e.facing = pcx() < e.x ? -1 : 1;
    },
    update(e) {
      e.t++;
      const ahead = e.x + 8 + e.facing * 10;
      if (moveX(e, e.facing * 1.2) || (e.onGround && !solidPx(ahead, e.y + e.h + 4))) e.facing = -e.facing;
      physics(e);
    },
    draw(e, x, y) {
      const cx = x + 8,
        cy = y + 8,
        a0 = e.t * 0.15 * e.facing;
      for (let i = 0; i < 8; i++) {
        const a = a0 + (i * Math.PI) / 4;
        R(cx + Math.cos(a) * 7 - 1.5, cy + Math.sin(a) * 7 - 1.5, 3, 3, '#8a6428');
      }
      circle(cx, cy, 6.5, '#0a0a16');
      circle(cx, cy, 6, '#b88838');
      circle(cx, cy, 2.5, '#5a4020');
      R(cx + Math.cos(a0) * 3.5 - 0.5, cy + Math.sin(a0) * 3.5 - 0.5, 1, 1, '#f8e0a8');
    },
  },
});

// ================= PLAYER WEAPONS =================
const muzzle = (p, w) => (p.facing > 0 ? p.x + p.w : p.x - w);
// hit every enemy on screen (and optionally the boss) with an invisible area shot
function areaHit(weapon, dmg, bossDmg) {
  for (const e of enemies) {
    if (e.dead || e.hidden || !onScreen(e.x + e.w / 2, e.y + e.h / 2, 0)) continue;
    hitEnemy({ kind: 'area', weapon, x: e.x, y: e.y, w: e.w, h: e.h, dmg }, e);
  }
  if (bossDmg && boss && boss.hp > 0 && boss.state !== 'drop' && boss.state !== 'pose')
    hitBoss({ kind: 'area', weapon, x: boss.x, y: boss.y, w: boss.w, h: boss.h, bossDmg, ultra: true });
}
// a shot that rolls along the floor (tidal wave, shadow clones, bass waves): falls onto the ground, dies at walls
function rollAlong(s) {
  s.vy = Math.min((s.vy || 0) + 0.4, 7);
  s.y += s.vy;
  if (solidPx(s.x + s.w / 2, s.y + s.h)) {
    s.y = Math.floor((s.y + s.h) / TILE) * TILE - s.h;
    s.vy = 0;
  }
  s.x += s.vx;
  if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + s.h - 8) || --s.life <= 0) s.dead = true;
}
const reHit = (s, every) => {
  if (s.t % every === 0 && s.hits) for (const e of [...s.hits]) if (e !== boss) s.hits.delete(e);
};
const RAINBOW = ['#f85858', '#f8a838', '#f8e858', '#78e858', '#58c8f8', '#7878f8', '#c878f8'];

Object.assign(WEAPONS, {
  hydro: {
    name: 'HYDRO BLAST',
    short: 'H.BLAST',
    pal: { B: '#1878d8', b: '#a8e0f8', S: SKIN },
    glow: '#58b8f8',
    desc: 'SEMBURAN AIR CEPAT',
    charged: 'TIDAL WAVE',
    demo: { kind: 'hdrop', w: 10, h: 6, vx: 1 },
    fire(p) {
      if (countShots('hdrop') >= 4) return false;
      for (const dy of [-2, 3])
        addShot({
          kind: 'hdrop',
          weapon: 'hydro',
          x: muzzle(p, 10),
          y: p.y + 9 + dy,
          w: 10,
          h: 6,
          vx: p.facing * (6 + (dy > 0 ? 0.6 : 0)),
          dmg: 1,
        });
      noise(0.1, 0.1, 0, 3000);
    },
    charge(p) {
      if (countShots('tide')) return false;
      addShot({
        kind: 'tide',
        weapon: 'hydro',
        x: muzzle(p, 24),
        y: p.y + p.h - 30,
        w: 24,
        h: 30,
        vx: p.facing * 2.8,
        life: 150,
        dmg: 3,
        bossDmg: 3,
        pierce: true,
        charged: true,
      });
      noise(0.5, 0.18, 0, 1500);
    },
    ultra(p) {
      addShot({
        kind: 'tsunami',
        weapon: 'hydro',
        x: p.facing > 0 ? camX - 64 : camX + VW,
        y: camY,
        w: 64,
        h: VH,
        vx: p.facing * 3.2,
        life: 170,
        dmg: 3,
        bossDmg: 3,
        pierce: true,
        charged: true,
        ultra: true,
      });
    },
  },
  toxic: {
    name: 'VENOM DRIP',
    short: 'V.DRIP',
    pal: { B: '#3a8a28', b: '#c8f878', S: SKIN },
    glow: '#98e838',
    desc: 'BOLA RACUN JADI GENANGAN',
    charged: 'ACID RAIN',
    demo: { kind: 'vblob', w: 10, h: 10 },
    fire(p) {
      if (countShots('vblob') + countShots('vpuddle') >= 3) return false;
      addShot({
        kind: 'vblob',
        weapon: 'toxic',
        x: muzzle(p, 10),
        y: p.y + 6,
        w: 10,
        h: 10,
        vx: p.facing * 2.6,
        vy: -3.6,
        dmg: 2,
      });
      tone(500, 200, 0.12, 'square', 0.08);
    },
    charge(p) {
      if (countShots('adrop')) return false;
      for (let i = 0; i < 10; i++)
        addShot({
          kind: 'adrop',
          weapon: 'toxic',
          x: pcx() + p.facing * (24 + i * 20) - 3,
          y: camY - 12,
          w: 6,
          h: 10,
          vy: 5,
          delay: i * 4,
          dmg: 2,
          bossDmg: 2,
          charged: true,
        });
      noise(0.6, 0.14, 0, 4000);
    },
    ultra() {
      addShot({ kind: 'plague', weapon: 'toxic', x: pcx(), y: pcy(), w: 0, h: 0, life: 180, ultra: true });
    },
  },
  shadow: {
    name: 'SHADOW CLONE',
    short: 'S.CLONE',
    pal: { B: '#3a2a58', b: '#8a78c8', S: SKIN },
    glow: '#a878e8',
    desc: 'BAYANGANMU MENERJANG MUSUH',
    charged: 'SHADOW ARMY',
    demo: { kind: 'sclone', w: 14, h: 22, vx: 1 },
    fire(p) {
      if (countShots('sclone')) return false;
      addShot({
        kind: 'sclone',
        weapon: 'shadow',
        x: p.x,
        y: p.y,
        w: 14,
        h: 22,
        vx: p.facing * 4.2,
        life: 50,
        dmg: 2,
        pierce: true,
      });
      tone(300, 120, 0.15, 'sawtooth', 0.08);
    },
    charge(p) {
      if (countShots('sclone') > 1) return false;
      for (const [vx, vy] of [
        [4.2, 0],
        [-4.2, 0],
        [3.2, -5.2],
      ])
        addShot({
          kind: 'sclone',
          weapon: 'shadow',
          x: p.x,
          y: p.y,
          w: 14,
          h: 22,
          vx: vx * p.facing,
          vy,
          jump: vy < 0,
          life: 60,
          dmg: 3,
          bossDmg: 3,
          pierce: true,
          charged: true,
        });
      tone(200, 80, 0.3, 'sawtooth', 0.1);
    },
    ultra() {
      addShot({ kind: 'eclipse', weapon: 'shadow', x: pcx(), y: pcy(), w: 0, h: 0, life: 100, n: 0, ultra: true });
    },
  },
  sonic: {
    name: 'SONIC BOOM',
    short: 'S.BOOM',
    pal: { B: '#c83898', b: '#f8c8e8', S: SKIN },
    glow: '#f878c8',
    desc: 'CINCIN SUARA MENEMBUS MUSUH',
    charged: 'BASS DROP',
    demo: { kind: 'pring', w: 14, h: 14, vx: 1 },
    fire(p) {
      if (countShots('pring') >= 2) return false;
      addShot({
        kind: 'pring',
        weapon: 'sonic',
        x: muzzle(p, 8),
        y: p.y + 8,
        w: 8,
        h: 8,
        vx: p.facing * 4,
        dmg: 1,
        pierce: true,
      });
      tone(900, 1400, 0.08, 'square', 0.07);
    },
    charge(p) {
      if (countShots('bwave')) return false;
      for (const d of [-1, 1])
        addShot({
          kind: 'bwave',
          weapon: 'sonic',
          x: pcx() - 8 + d * 12,
          y: p.y + p.h - 24,
          w: 16,
          h: 24,
          vx: d * 4,
          life: 80,
          dmg: 3,
          bossDmg: 3,
          pierce: true,
          charged: true,
        });
      for (const e of enemies)
        if (!e.dead && !e.hidden && e.onGround && onScreen(e.x, e.y, 0))
          hitEnemy({ kind: 'area', weapon: 'sonic', x: e.x, y: e.y, w: e.w, h: e.h, dmg: 2 }, e);
      game.shake = 10;
      tone(80, 40, 0.5, 'sawtooth', 0.2);
    },
    ultra() {
      addShot({ kind: 'supersonic', weapon: 'sonic', x: pcx(), y: pcy(), w: 0, h: 0, life: 100, ultra: true });
    },
  },
  light: {
    name: 'PRISM LASER',
    short: 'P.LASER',
    pal: { B: '#e8c848', b: '#fcf8e0', S: SKIN },
    glow: '#fcf0a8',
    desc: 'LASER YANG MEMANTUL DI DINDING',
    charged: 'SPECTRUM',
    demo: { kind: 'prism', w: 12, h: 4, vx: 1 },
    fire(p) {
      if (countShots('prism') >= 2) return false;
      addShot({
        kind: 'prism',
        weapon: 'light',
        x: muzzle(p, 12),
        y: p.y + 11,
        w: 12,
        h: 4,
        vx: p.facing * 7,
        vy: 0,
        bounces: 3,
        dmg: 2,
      });
      tone(2000, 2600, 0.06, 'triangle', 0.08);
    },
    charge(p) {
      if (countShots('prism') > 2) return false;
      for (let i = 0; i < 7; i++) {
        const a = -0.5 + i / 6;
        addShot({
          kind: 'prism',
          weapon: 'light',
          x: pcx() - 4,
          y: pcy() - 4,
          w: 8,
          h: 8,
          vx: Math.cos(a) * 6 * p.facing,
          vy: Math.sin(a) * 6,
          bounces: 2,
          col: RAINBOW[i],
          dmg: 2,
          bossDmg: 3,
          pierce: true,
          charged: true,
        });
      }
      tone(1600, 3000, 0.25, 'triangle', 0.1);
    },
    ultra() {
      addShot({
        kind: 'supernova',
        weapon: 'light',
        x: pcx(),
        y: pcy(),
        w: 0,
        h: 0,
        r: 0,
        life: 50,
        hit: new Set(),
        ultra: true,
      });
    },
  },
  time: {
    name: 'TIME STOPPER',
    short: 'T.STOP',
    pal: { B: '#a86838', b: '#f0d8a8', S: SKIN },
    glow: '#f8e0a8',
    desc: 'JARUM JAM; CHARGE MENGHENTIKAN WAKTU',
    charged: 'TIME STOP',
    demo: { kind: 'needle', w: 12, h: 4, vx: 1 },
    fire(p) {
      if (countShots('needle') >= 3) return false;
      addShot({ kind: 'needle', weapon: 'time', x: muzzle(p, 12), y: p.y + 11, w: 12, h: 4, vx: p.facing * 6, dmg: 2 });
      tone(1200, 1200, 0.03, 'square', 0.08);
    },
    charge() {
      if (game.timeStop > 0) return false;
      game.timeStop = 180;
      game.flash = 4;
      notes(
        [
          [84, 0],
          [79, 0.08],
          [76, 0.16],
        ],
        'triangle',
        0.1,
        0.1,
      );
    },
    ultra() {
      game.timeStop = 240;
      addShot({ kind: 'chrono', weapon: 'time', x: pcx(), y: pcy(), w: 0, h: 0, life: 200, ultra: true });
    },
  },
});

Object.assign(SHOT_KINDS, {
  hdrop: {
    update(s) {
      s.x += s.vx;
    },
    draw(s, x, y) {
      R(x + 2, y + 1, 7, 4, '#58b8f8');
      R(x, y + 2, 10, 2, '#58b8f8');
      R(x + 5, y + 2, 3, 1, '#e0f8fc');
    },
  },
  tide: {
    update(s) {
      rollAlong(s);
      reHit(s, 15);
      burnShots(s);
      if (s.t % 3 === 0) part({ kind: 'bubble', x: s.x + Math.random() * s.w, y: s.y + 6, vx: 0, vy: -0.6, life: 20 });
    },
    draw(s, x, y) {
      drawWave(x, y, s.w, s.h, s.vx > 0 ? 1 : -1);
    },
  },
  tsunami: {
    offscreen: true,
    update(s) {
      s.x += s.vx;
      s.y = camY;
      reHit(s, 12);
      burnShots(s);
      if (--s.life <= 0 || s.x > camX + VW + 80 || s.x + s.w < camX - 80) s.dead = true;
    },
    draw(s, x, y) {
      drawWave(x, y, s.w, s.h, s.vx > 0 ? 1 : -1);
    },
  },
  vblob: {
    update(s) {
      s.vy = Math.min(s.vy + 0.22, 7);
      s.x += s.vx;
      s.y += s.vy;
      if (solidPx(s.x + 5, s.y + 10)) {
        // splash into a puddle on the floor
        s.dead = true;
        addShot({
          kind: 'vpuddle',
          weapon: 'toxic',
          x: s.x - 7,
          y: Math.floor((s.y + 10) / TILE) * TILE - 5,
          w: 24,
          h: 5,
          life: 120,
          dmg: 1,
          pierce: true,
        });
        debris(s.x + 5, s.y + 8, '#98e838', 4, 1);
      }
    },
    draw(s, x, y) {
      circle(x + 5, y + 5, 5, '#0a0a16');
      circle(x + 5, y + 5, 4, '#78c828');
      circle(x + 4, y + 4, 1.5, '#e8fcb8');
    },
  },
  vpuddle: {
    offscreen: true,
    update(s) {
      reHit(s, 20);
      if (--s.life <= 0) s.dead = true;
      if (s.t % 10 === 0) part({ kind: 'bubble', x: s.x + 4 + Math.random() * 16, y: s.y, vx: 0, vy: -0.3, life: 16 });
    },
    draw(s, x, y) {
      ctx.globalAlpha = Math.min(1, s.life / 30);
      R(x + 2, y + 1, 20, 4, '#5a9a18');
      R(x, y + 2, 24, 3, '#78c828');
      R(x + 4, y + 2, 6, 1, '#b8f838');
      ctx.globalAlpha = 1;
    },
  },
  adrop: {
    offscreen: true,
    update(s) {
      if (s.delay > 0) {
        s.delay--;
        return;
      }
      s.y += s.vy;
      // the rain seeps through ceilings: it only splashes on a solid tile after falling through open air
      if (!s.free && s.y > camY && !solidPx(s.x + 3, s.y + s.h)) s.free = true;
      if ((s.free && solidPx(s.x + 3, s.y + s.h)) || s.y > camY + VH + 20) {
        s.dead = true;
        debris(s.x + 3, s.y + 8, '#98e838', 3, 1);
      }
    },
    draw(s, x, y) {
      if (s.delay > 0) return;
      R(x + 1, y, 4, 8, '#98e838');
      R(x + 2, y + 1, 1, 3, '#e8fcb8');
    },
  },
  plague: {
    offscreen: true,
    update(s) {
      if (s.t % 20 === 1) areaHit('toxic', 2, 0);
      if (s.t % 40 === 1) areaHit('toxic', 0, 2);
      if (--s.life <= 0) s.dead = true;
    },
    draw(s) {
      ctx.globalAlpha = 0.22 * Math.min(1, s.life / 30);
      R(0, 0, VW, VH, '#78c828');
      ctx.globalAlpha = 1;
      for (let i = 0; i < 14; i++) {
        ctx.globalAlpha = 0.25;
        circle(((i * 61 + s.t * (1 + (i % 3))) % (VW + 40)) - 20, 30 + ((i * 47) % 170), 12 + (i % 4) * 4, '#a8e858');
        ctx.globalAlpha = 1;
      }
    },
  },
  sclone: {
    update(s) {
      if (s.jump) {
        s.vy += 0.25;
        s.x += s.vx;
        s.y += s.vy;
        if (solidPx(s.x + 7, s.y + s.h) && s.vy > 0) {
          s.jump = false;
          s.y = Math.floor((s.y + s.h) / TILE) * TILE - s.h;
        }
        if (--s.life <= 0) s.dead = true;
      } else rollAlong(s);
      if (s.t % 4 === 0) part({ kind: 'dust', x: s.x + 7, y: s.y + s.h, vx: 0, vy: -0.3, life: 10 });
    },
    draw(s, x, y) {
      ctx.globalAlpha = 0.75;
      drawRobot(x + 7 - 12, y + s.h - 24, s.vx > 0 ? 1 : -1, 'run', (s.t >> 2) % 3, false, {
        B: '#1a1028',
        b: '#3a2a58',
        S: '#3a2a58',
      });
      ctx.globalAlpha = 1;
      glow(x + 7, y + 11, 12, '#a878e8', 0.4);
    },
  },
  eclipse: {
    offscreen: true,
    update(s) {
      if (s.t % 8 === 1) {
        const ts = enemies.filter(e => !e.dead && !e.hidden && onScreen(e.x + e.w / 2, e.y + e.h / 2, 0));
        if (boss && boss.hp > 0 && boss.state !== 'drop' && boss.state !== 'pose') ts.push(boss);
        const t = ts.length
          ? ts[s.n++ % ts.length]
          : { x: camX + 40 + Math.random() * (VW - 80), y: camY + 60 + Math.random() * 100, w: 0, h: 0 };
        addShot({
          kind: 'slash',
          weapon: 'shadow',
          x: t.x + t.w / 2 - 14,
          y: t.y + t.h / 2 - 14,
          w: 28,
          h: 28,
          life: 10,
          dmg: 4,
          bossDmg: 3,
          pierce: true,
          charged: true,
          ultra: true,
          d: Math.random() < 0.5 ? 1 : -1,
        });
        tone(600, 150, 0.08, 'sawtooth', 0.08);
      }
      if (--s.life <= 0) s.dead = true;
    },
    draw(s) {
      ctx.globalAlpha = 0.35 * Math.min(1, s.life / 20);
      R(0, 0, VW, VH, '#10061e');
      ctx.globalAlpha = 1;
    },
  },
  slash: {
    offscreen: true,
    update(s) {
      if (--s.life <= 0) s.dead = true;
    },
    draw(s, x, y) {
      const k = 1 - s.life / 10;
      for (let i = 0; i < 28 * Math.min(1, k * 2); i += 1.5)
        R(x + (s.d > 0 ? i : 27 - i), y + i, 2, 2, i & 2 ? '#e8a8fc' : '#fcfcfc');
      glow(x + 14, y + 14, 16, '#a878e8', 0.5);
    },
  },
  pring: {
    update(s) {
      s.x += s.vx;
      if (s.w < 26) {
        s.x -= 0.4;
        s.y -= 0.4;
        s.w += 0.8;
        s.h += 0.8;
      }
    },
    draw(s, x, y) {
      drawRing(x + s.w / 2, y + s.h / 2, s.w / 2, '#f878c8');
    },
  },
  bwave: {
    update(s) {
      rollAlong(s);
      reHit(s, 15);
      if (s.t % 3 === 0) dust(s.x + 8, s.y + s.h, 1);
    },
    draw(s, x, y) {
      for (let i = 0; i < 3; i++)
        drawRing(x + 8, y + s.h, 6 + i * 6 + ((s.t * 2) % 6), i ? '#f8a8e8' : '#fcfcfc', true);
    },
  },
  supersonic: {
    offscreen: true,
    update(s) {
      if (s.t % 20 === 1) {
        areaHit('sonic', 2, 2);
        for (const e of eshots) if (!e.big && !e.harmless && onScreen(e.x, e.y, 8)) e.dead = true;
        game.shake = 6;
        tone(120, 60, 0.3, 'sawtooth', 0.15);
      }
      if (--s.life <= 0) s.dead = true;
    },
    draw(s) {
      const k = (s.t % 20) / 20;
      drawRing(pcx() - camX, pcy() - camY, 10 + k * 230, k < 0.5 ? '#fcfcfc' : '#f878c8');
    },
  },
  prism: {
    update(s) {
      // bounce off walls (and floors / ceilings for diagonal bolts) a few times
      const nx = s.x + s.vx,
        ny = s.y + s.vy;
      if (solidPx(s.vx > 0 ? nx + s.w : nx, s.y + s.h / 2)) {
        s.vx = -s.vx;
        s.bounces--;
      }
      if (s.vy && solidPx(s.x + s.w / 2, s.vy > 0 ? ny + s.h : ny)) {
        s.vy = -s.vy;
        s.bounces--;
      }
      if (s.bounces < 0) s.dead = true;
      s.x += s.vx;
      s.y += s.vy;
      if (s.hits && s.t % 12 === 0) s.hits.clear();
    },
    draw(s, x, y) {
      const c = s.col || '#fcf0a8';
      R(x - s.vx * 1.5 + 1, y + s.h / 2 - 1, s.w, 2, 'rgba(255,255,255,0.35)');
      R(x, y + s.h / 2 - 1.5, s.w, 3, c);
      R(x + 2, y + s.h / 2 - 0.5, s.w - 4, 1, '#fcfcfc');
      glow(x + s.w / 2, y + s.h / 2, 8, c, 0.6);
    },
  },
  supernova: {
    offscreen: true,
    update(s) {
      s.r += 6;
      const cx = s.x,
        cy = s.y;
      for (const e of enemies) {
        if (e.dead || e.hidden || s.hit.has(e)) continue;
        if (Math.abs(Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) - s.r) < 14) {
          s.hit.add(e);
          hitEnemy({ kind: 'area', weapon: 'light', x: e.x, y: e.y, w: e.w, h: e.h, dmg: 6 }, e);
        }
      }
      if (boss && !s.hit.has(boss) && Math.abs(Math.hypot(bcx(boss) - cx, boss.y + 12 - cy) - s.r) < 16) {
        s.hit.add(boss);
        hitBoss({ kind: 'area', weapon: 'light', x: boss.x, y: boss.y, w: boss.w, h: boss.h, bossDmg: 4, ultra: true });
      }
      for (const e of eshots) if (!e.big && Math.hypot(e.x - cx, e.y - cy) < s.r) e.dead = true;
      if (--s.life <= 0) s.dead = true;
    },
    draw(s) {
      const x = s.x - camX,
        y = s.y - camY;
      drawRing(x, y, s.r, '#fcf0a8');
      drawRing(x, y, Math.max(1, s.r - 5), '#fcfcfc');
      glow(x, y, 40, '#fcf0a8', 0.5 * Math.min(1, s.life / 20));
    },
  },
  needle: {
    update(s) {
      s.x += s.vx;
    },
    draw(s, x, y) {
      R(x, y + 1, 12, 2, '#3a2418');
      R(s.vx > 0 ? x + 9 : x, y, 3, 4, '#c8a048');
      R(x + 2, y + 1.5, 6, HP, '#e8c070');
    },
  },
  chrono: {
    offscreen: true,
    update(s) {
      if (s.t % 40 === 1) areaHit('time', 3, 3);
      if (--s.life <= 0) s.dead = true;
    },
    draw(s) {
      const cx = VW / 2,
        cy = VH / 2,
        t = -s.t * 0.15;
      ctx.globalAlpha = 0.18;
      circle(cx, cy, 70, '#f8e0a8');
      ctx.globalAlpha = 1;
      drawRing(cx, cy, 70, '#c8a048');
      for (const [len, a] of [
        [60, t * 6],
        [42, t],
      ])
        for (let r = 0; r < len; r += 2) R(cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, 2, 2, '#c8a048');
    },
  },
});

// a pixel ring (or the upper half of one, for waves rolling on the floor)
function drawRing(cx, cy, r, col, half = false) {
  const n = Math.max(12, Math.round(r * 1.6));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    if (half && Math.sin(a) > 0) continue;
    R(Math.round((cx + Math.cos(a) * r) * 2) / 2 - 0.5, Math.round((cy + Math.sin(a) * r) * 2) / 2 - 0.5, 1, 1, col);
  }
}
// a breaking water wave w x h, facing dir
function drawWave(x, y, w, h, dir) {
  for (let i = 0; i < h; i += 3) {
    const k = i / h,
      ww = w * (0.45 + 0.55 * k),
      off = dir > 0 ? w - ww : 0;
    R(x + off, y + i, ww, 3, i < 4 ? '#e0f8fc' : k < 0.5 ? '#58b8f8' : '#2878d8');
  }
  R(x + (dir > 0 ? w - 8 : 0), y, 8, 3, '#fcfcfc');
  glow(x + w / 2, y + h / 2, w * 0.6, '#58b8f8', 0.25);
}

// ================= BOSSES =================
// hide a boss while it warps (out of the room, invulnerable); show() puts it back on the floor at x
const vanish = b => {
  b.warpY = b.y;
  b.y = -400;
  b.inv = 999;
  b.vx = b.vy = 0;
};
const show = (b, x) => {
  const Rm = ROOM();
  b.x = clamp(x, Rm.l + 4, Rm.r - b.w - 4);
  b.y = Rm.floor - b.h;
  b.inv = 0;
  b.onGround = true;
  faceP(b);
  dust(bcx(b), b.y + b.h, 5);
};

Object.assign(BOSSES, {
  hydro: {
    name: 'HYDROS',
    style: 'hydro',
    pal: { B: '#1878d8', b: '#a8e0f8', S: SKIN },
    weapon: 'hydro',
    weak: 'toxic',
    update(b, enr) {
      const Rm = ROOM();
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 16 : 30)) pick(b, ['blast', 'bubbles', 'tide']);
          break;
        case 'blast': // water cannon: heavy jets that shove the player back
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t % 12 === 6 && b.t < (enr ? 50 : 38)) {
            b.arm = 10;
            noise(0.12, 0.12, 0, 2500);
            eshots.push({
              kind: 'wjet',
              x: bcx(b) + b.facing * 12 - 8,
              y: b.y + 9,
              w: 16,
              h: 8,
              vx: b.facing * 4.2,
              vy: 0,
              dmg: 3,
              t: 0,
              delay: 0,
              push: b.facing,
            });
          }
          if (b.t >= (enr ? 60 : 46)) bossToIdle(b);
          break;
        case 'bubbles': // bubbles that drift up and toward the player
          physics(b);
          if (b.t === 10) {
            b.arm = 14;
            tone(400, 900, 0.2, 'triangle', 0.08);
            for (let i = 0; i < (enr ? 5 : 4); i++)
              eshots.push({
                kind: 'ebub',
                x: bcx(b) - 6,
                y: b.y - 4,
                w: 12,
                h: 12,
                vx: b.facing * (0.6 + i * 0.35),
                vy: -0.3 - i * 0.12,
                dmg: 3,
                t: 0,
                delay: 0,
                life: 220,
              });
          }
          if (b.t >= 40) bossToIdle(b);
          break;
        case 'tide': // leaps; a wave rolls out both ways where it lands
          if (b.t === 1) jumpAt(b, -6, 50, 2);
          airborne(b);
          if (b.onGround && b.t > 3) {
            game.shake = 10;
            noise(0.5, 0.2, 0, 1200);
            for (const d of [-1, 1])
              eshots.push({
                kind: 'etide',
                x: bcx(b) - 12 + d * 14,
                y: Rm.floor - 26,
                w: 24,
                h: 26,
                vx: d * (enr ? 3 : 2.5),
                vy: 0,
                dmg: 4,
                t: 0,
                delay: 0,
                big: true,
              });
            bossToIdle(b);
          }
          break;
      }
    },
    tick: b => {
      if (frameCount % 14 === 0) part({ kind: 'bubble', x: bcx(b), y: b.y, vx: 0, vy: -0.5, life: 30 });
    },
  },
  toxic: {
    name: 'TOXARIS',
    style: 'toxic',
    pal: { B: '#3a8a28', b: '#c8f878', S: SKIN },
    weapon: 'toxic',
    weak: 'shadow',
    update(b, enr) {
      const Rm = ROOM();
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 16 : 30)) pick(b, ['spit', 'gas', 'leap']);
          break;
        case 'spit': // three poison blobs that leave burning puddles
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t === 12 || (enr && b.t === 32)) {
            b.arm = 12;
            tone(500, 200, 0.15, 'square', 0.08);
            const dx = pcx() - bcx(b);
            for (const k of [0.65, 1, 1.35])
              eshots.push({
                kind: 'eblob',
                x: bcx(b) - 5,
                y: b.y + 2,
                w: 10,
                h: 10,
                vx: clamp((dx / 45) * k, -3.4, 3.4),
                vy: -4.5,
                grav: 0.22,
                dmg: 3,
                t: 0,
                delay: 0,
              });
          }
          if (b.t >= (enr ? 52 : 36)) bossToIdle(b);
          break;
        case 'gas': // a poison cloud around itself: keep away
          physics(b);
          if (b.t === 8) {
            b.arm = 30;
            noise(0.8, 0.14, 0, 900);
            eshots.push({
              kind: 'egas',
              x: bcx(b) - 44,
              y: b.y - 24,
              w: 88,
              h: 52,
              vx: 0,
              vy: 0,
              dmg: 3,
              t: 0,
              delay: 0,
              life: enr ? 130 : 110,
              big: true,
            });
          }
          if (b.t >= (enr ? 120 : 100)) bossToIdle(b);
          break;
        case 'leap':
          if (b.t === 1) jumpAt(b, -6.5, 48, 2.4);
          airborne(b);
          if (b.onGround && b.t > 3) {
            game.shake = 6;
            sfx.land();
            for (const d of [-1, 1])
              eshots.push({
                kind: 'epuddle',
                x: bcx(b) - 14 + d * 22,
                y: Rm.floor - 5,
                w: 28,
                h: 5,
                vx: 0,
                vy: 0,
                dmg: 3,
                t: 0,
                delay: 0,
                life: 150,
              });
            bossToIdle(b);
          }
          break;
      }
    },
    tick: b => {
      if (frameCount % 9 === 0) part({ kind: 'bubble', x: b.x + 2, y: b.y + 10, vx: -0.2, vy: -0.6, life: 24 });
    },
  },
  shadow: {
    name: 'UMBRION',
    style: 'shadow',
    pal: { B: '#3a2a58', b: '#6a58a0', S: SKIN },
    weapon: 'shadow',
    weak: 'light',
    update(b, enr) {
      const Rm = ROOM();
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 16 : 30)) pick(b, ['clones', 'warp', 'orbs']);
          break;
        case 'clones': // two shadow clones dash along the floor
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t === 14) {
            b.arm = 14;
            tone(260, 90, 0.3, 'sawtooth', 0.1);
            for (const v of enr ? [3.8, 2.6, 1.6] : [3.6, 2.2])
              eshots.push({
                kind: 'eclone',
                x: b.x,
                y: Rm.floor - 24,
                w: 16,
                h: 24,
                vx: b.facing * v,
                vy: 0,
                dmg: 4,
                t: 0,
                delay: 0,
                big: true,
              });
          }
          if (b.t >= 50) bossToIdle(b);
          break;
        case 'warp': // melts into the dark and strikes from behind the player
          if (b.t === 1) {
            vanish(b);
            tone(400, 80, 0.4, 'sawtooth', 0.1);
          }
          if (b.t === (enr ? 30 : 42)) {
            show(b, player.x - player.facing * 34);
            b.dash = 22;
            tone(150, 600, 0.15, 'sawtooth', 0.1);
          }
          if (b.t > (enr ? 30 : 42)) {
            if (b.dash > 0) {
              b.dash--;
              moveX(b, b.facing * 4);
            }
            physics(b);
            if (!b.dash) bossToIdle(b);
          }
          break;
        case 'orbs': // slow orbs that home in on the player
          physics(b);
          if (b.t === 10) {
            b.arm = 20;
            for (let i = 0; i < (enr ? 4 : 3); i++)
              eshots.push({
                kind: 'eorb',
                x: bcx(b) - 5,
                y: b.y - 6 - i * 8,
                w: 10,
                h: 10,
                vx: (i - 1) * 1.2,
                vy: -1.5,
                dmg: 3,
                t: 0,
                delay: i * 10,
                life: 200,
              });
          }
          if (b.t >= 50) bossToIdle(b);
          break;
      }
    },
  },
  sonic: {
    name: 'SONIQUE',
    style: 'sonic',
    pal: { B: '#c83898', b: '#f8c8e8', S: SKIN },
    weapon: 'sonic',
    weak: 'time',
    update(b, enr) {
      const Rm = ROOM();
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 16 : 30)) pick(b, ['boom', 'scream', 'dash']);
          break;
        case 'boom': // sound rings at two heights
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t % 14 === 8 && b.t < (enr ? 50 : 36)) {
            b.arm = 10;
            tone(700, 1100, 0.1, 'square', 0.08);
            const high = (b.t / 14) & 1;
            eshots.push({
              kind: 'ering',
              x: bcx(b) + b.facing * 10 - 6,
              y: Rm.floor - (high ? 48 : 20),
              w: 12,
              h: 12,
              vx: b.facing * 3,
              vy: 0,
              dmg: 3,
              t: 0,
              delay: 0,
            });
          }
          if (b.t >= (enr ? 60 : 46)) bossToIdle(b);
          break;
        case 'scream': // a wall of sound that shoves the player away, with rings rolling along the floor
          physics(b);
          if (b.t === 1) {
            faceP(b);
            noise(1.2, 0.18, 0, 3000);
          }
          if (alive(player) && player.state !== 'climb') moveX(player, b.facing * (enr ? 1 : 0.8));
          if (b.t % 6 === 0) game.shake = 2;
          if (b.t === 20 || b.t === 50)
            eshots.push({
              kind: 'sring',
              x: bcx(b) + b.facing * 12 - 6,
              y: Rm.floor - 16,
              w: 12,
              h: 16,
              vx: b.facing * 2.6,
              vy: 0,
              dmg: 3,
              t: 0,
              delay: 0,
              life: 140,
            });
          if (b.t >= 80) bossToIdle(b);
          break;
        case 'dash': // a fast dash across the room
          if (b.t === 1) faceP(b);
          if (b.t > 12) {
            b.anim++;
            if (moveX(b, b.facing * (enr ? 5 : 4.2)) || b.t > 70) {
              game.shake = 6;
              sfx.land();
              bossToIdle(b);
              break;
            }
          }
          physics(b);
          break;
      }
    },
    pose: (b, pose) => (b.state === 'scream' ? 'raise' : b.state === 'dash' && b.t > 12 ? 'run' : pose),
    drawBehind(b, sx, sy) {
      // afterimages while dashing
      if (b.state !== 'dash' || b.t < 12) return;
      ctx.globalAlpha = 0.3;
      for (let i = 1; i <= 2; i++)
        drawRobot(
          sx + b.w / 2 - 12 - b.facing * i * 10,
          sy + b.h - 24,
          b.facing,
          'run',
          1,
          false,
          BOSSES.sonic.pal,
          'sonic',
        );
      ctx.globalAlpha = 1;
    },
  },
  light: {
    name: 'LUMINA',
    style: 'light',
    pal: { B: '#e8c848', b: '#fcf8e0', S: SKIN },
    weapon: 'light',
    weak: 'sonic',
    update(b, enr) {
      const Rm = ROOM();
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 16 : 30)) pick(b, ['laser', 'pillars', 'flash']);
          break;
        case 'laser': // lasers that bounce off the walls
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t === 14) {
            b.arm = 14;
            tone(2600, 1800, 0.15, 'sawtooth', 0.08);
            const a = Math.atan2(pcy() - (b.y + 12), pcx() - bcx(b));
            for (const da of enr ? [-0.25, 0, 0.25] : [0])
              eshots.push({
                kind: 'elaser',
                x: bcx(b) - 4,
                y: b.y + 8,
                w: 8,
                h: 8,
                vx: Math.cos(a + da) * 4.4,
                vy: Math.sin(a + da) * 4.4,
                dmg: 3,
                t: 0,
                delay: 0,
                bounces: 3,
              });
          }
          if (b.t >= 40) bossToIdle(b);
          break;
        case 'pillars': // spotlights mark the floor, then pillars of light come down
          physics(b);
          if (b.t === 1) {
            b.xs = enr ? [pcx(), pcx() - 70, pcx() + 70] : [pcx(), pcx() + (Math.random() < 0.5 ? -80 : 80)];
            for (const x of b.xs)
              eshots.push({
                kind: 'lwarn',
                x: x - 10,
                y: Rm.floor - 6,
                w: 20,
                h: 6,
                life: 36,
                harmless: true,
                t: 0,
                delay: 0,
              });
          }
          if (b.t === 36) {
            game.flash = 3;
            tone(3000, 2000, 0.3, 'triangle', 0.1);
            for (const x of b.xs)
              eshots.push({
                kind: 'lpillar',
                x: x - 9,
                y: Rm.ceil,
                w: 18,
                h: Rm.floor - Rm.ceil,
                life: 24,
                dmg: 4,
                t: 0,
                delay: 0,
                big: true,
              });
          }
          if (b.t >= 64) bossToIdle(b);
          break;
        case 'flash': // a blinding flash and a light wave along the floor
          physics(b);
          if (b.t === 24) {
            game.flash = 8;
            tone(3200, 800, 0.4, 'triangle', 0.12);
            for (const d of [-1, 1])
              eshots.push({
                kind: 'lwave',
                x: bcx(b) - 7 + d * 12,
                y: Rm.floor - 14,
                w: 14,
                h: 14,
                vx: d * (enr ? 3.8 : 3.2),
                vy: 0,
                dmg: 4,
                t: 0,
                delay: 0,
                big: true,
              });
          }
          if (b.t >= 46) bossToIdle(b);
          break;
      }
    },
    pose: (b, pose) => (b.state === 'pillars' && b.t < 40 ? 'raise' : b.state === 'flash' && b.t < 26 ? 'raise' : pose),
    draw: (b, sx, sy) => glow(sx + b.w / 2, sy + 8, 16, '#fcf0a8', 0.5),
  },
  time: {
    name: 'CHRONIA',
    style: 'time',
    pal: { B: '#a86838', b: '#f0d8a8', S: SKIN },
    weapon: 'time',
    weak: 'hydro',
    update(b, enr) {
      const Rm = ROOM();
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 16 : 30)) pick(b, ['hands', 'stop', 'warp']);
          break;
        case 'hands': // clock hands thrown like boomerangs
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t === 12) {
            b.arm = 14;
            tone(900, 600, 0.12, 'square', 0.08);
            for (const dy of enr ? [-20, 0, 20] : [-12, 12])
              eshots.push({
                kind: 'ehand',
                x: bcx(b) - 8,
                y: b.y + 8,
                w: 16,
                h: 16,
                tx: pcx(),
                ty: pcy() + dy,
                owner: b,
                dmg: 3,
                t: 0,
                delay: 0,
                big: true,
              });
          }
          if (b.t >= 70) bossToIdle(b);
          break;
        case 'stop': // a chime, then time stops for the player while she throws a hand
          physics(b);
          if (b.t === 1)
            notes(
              [
                [84, 0],
                [88, 0.2],
                [91, 0.4],
              ],
              'triangle',
              0.12,
              0.18,
            );
          if (b.t === 40 && alive(player)) {
            player.stun = enr ? 70 : 55;
            game.flash = 4;
          }
          if (b.t === 50)
            eshots.push({
              kind: 'ehand',
              x: bcx(b) - 8,
              y: b.y + 8,
              w: 16,
              h: 16,
              tx: pcx(),
              ty: pcy(),
              owner: b,
              dmg: 3,
              t: 0,
              delay: 0,
              big: true,
            });
          if (b.t >= 110) bossToIdle(b);
          break;
        case 'warp': // fades out and reappears across the room with a fan of needles
          if (b.t === 1) {
            vanish(b);
            notes(
              [
                [79, 0],
                [74, 0.1],
              ],
              'triangle',
              0.1,
              0.1,
            );
          }
          if (b.t === 30) {
            show(b, pcx() < (Rm.l + Rm.r) / 2 ? Rm.r - 40 : Rm.l + 20);
            const a = Math.atan2(pcy() - (b.y + 12), pcx() - bcx(b));
            for (const da of [-0.3, 0, 0.3])
              eshots.push({
                kind: 'eneedle',
                x: bcx(b) - 6,
                y: b.y + 10,
                w: 12,
                h: 4,
                vx: Math.cos(a + da) * 3.6,
                vy: Math.sin(a + da) * 3.6,
                dmg: 3,
                t: 0,
                delay: 0,
              });
          }
          if (b.t > 30) {
            physics(b);
            if (b.t >= 50) bossToIdle(b);
          }
          break;
      }
    },
    pose: (b, pose) => (b.state === 'stop' && b.t < 44 ? 'raise' : pose),
  },
});

// ================= ENEMY / BOSS SHOTS =================
const life = s => {
  if (--s.life <= 0) s.dead = true;
};
Object.assign(ESHOT_KINDS, {
  sring: {
    // a sound ring rolling along the floor (jump over it)
    pierce: true,
    update(s) {
      s.x += s.vx;
      life(s);
      if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + s.h / 2)) s.dead = true;
    },
    draw(s, x, y) {
      for (let i = 0; i < 3; i++)
        drawRing(x + 6, y + s.h, 4 + i * 4 + ((s.t >> 1) % 4), i ? '#f8a8e8' : '#fcfcfc', true);
    },
  },
  plaser: {
    draw: (s, x, y) => {
      R(x, y, 6, 6, '#f878c8');
      R(x + 2, y + 2, 2, 2, '#fcfcfc');
      glow(x + 3, y + 3, 6, '#f878c8', 0.5);
    },
  },
  wjet: {
    update(s) {
      s.x += s.vx;
      if (alive(player) && overlap(s, player) && player.inv === 0) moveX(player, s.push * 10); // the jet shoves the player back
    },
    draw: (s, x, y) => {
      R(x, y + 2, 16, 4, '#58b8f8');
      R(x + 2, y, 12, 8, '#58b8f8');
      R(x + 4, y + 2, 8, 2, '#e0f8fc');
    },
  },
  ebub: {
    update(s) {
      s.x += s.vx + Math.sin(s.t * 0.1) * 0.4;
      s.y += s.vy;
      life(s);
      if (s.dead) debris(s.x + 6, s.y + 6, '#a8e8fc', 3, 1);
    },
    draw: (s, x, y) => {
      drawRing(x + 6, y + 6, 6, '#a8e8fc');
      R(x + 3, y + 3, 2, 2, '#fcfcfc');
    },
  },
  etide: {
    pierce: true,
    update(s) {
      s.x += s.vx;
      if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + s.h / 2)) s.dead = true;
    },
    draw: (s, x, y) => drawWave(x, y, s.w, s.h, s.vx > 0 ? 1 : -1),
  },
  eblob: {
    update(s) {
      s.vy = Math.min(s.vy + s.grav, 7);
      s.x += s.vx;
      s.y += s.vy;
      if (s.vy > 0 && solidPx(s.x + 5, s.y + 10)) {
        s.dead = true;
        eshots.push({
          kind: 'epuddle',
          x: s.x - 9,
          y: Math.floor((s.y + 10) / TILE) * TILE - 5,
          w: 28,
          h: 5,
          vx: 0,
          vy: 0,
          dmg: 3,
          t: 0,
          delay: 0,
          life: 130,
        });
      }
    },
    draw: (s, x, y) => {
      circle(x + 5, y + 5, 5, '#0a0a16');
      circle(x + 5, y + 5, 4, '#5a9a18');
      circle(x + 4, y + 4, 1.5, '#c8f878');
    },
  },
  epuddle: {
    pierce: true,
    update: life,
    draw: (s, x, y) => {
      ctx.globalAlpha = Math.min(1, s.life / 30);
      R(x, y + 1, 28, 4, '#5a9a18');
      R(x + 3, y, 22, 2, '#98e838');
      if (frameCount & 8) R(x + 8, y - 2, 2, 2, '#c8f878');
      ctx.globalAlpha = 1;
    },
  },
  egas: {
    pierce: true,
    update(s) {
      s.harmless = s.t < 24;
      life(s);
    }, // a moment to step away while it spreads
    draw(s, x, y) {
      const k = Math.min(1, s.t / 24);
      for (let i = 0; i < 9; i++) {
        ctx.globalAlpha = (s.harmless ? 0.25 : 0.45) * Math.min(1, s.life / 30);
        circle(
          x + 44 + Math.cos(i * 0.7 + s.t * 0.04) * 32 * k,
          y + 26 + Math.sin(i * 1.3) * 16 * k,
          10 + (i % 3) * 4,
          i & 1 ? '#78c828' : '#a8e858',
        );
      }
      ctx.globalAlpha = 1;
    },
  },
  eclone: {
    pierce: true,
    update(s) {
      s.x += s.vx;
      if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + 12)) s.dead = true;
    },
    draw(s, x, y) {
      ctx.globalAlpha = 0.7;
      drawRobot(
        x + 8 - 12,
        y,
        s.vx > 0 ? 1 : -1,
        'run',
        (s.t >> 2) % 3,
        false,
        { B: '#140c22', b: '#2a1e40', S: '#2a1e40' },
        'shadow',
      );
      ctx.globalAlpha = 1;
      glow(x + 8, y + 12, 12, '#a878e8', 0.4);
    },
  },
  eorb: {
    update(s) {
      // slowly turns toward the player
      const dx = pcx() - (s.x + 5),
        dy = pcy() - (s.y + 5),
        d = Math.hypot(dx, dy) || 1;
      s.vx += (dx / d) * 0.08;
      s.vy += (dy / d) * 0.08;
      const sp = Math.hypot(s.vx, s.vy);
      if (sp > 1.6) {
        s.vx *= 1.6 / sp;
        s.vy *= 1.6 / sp;
      }
      s.x += s.vx;
      s.y += s.vy;
      life(s);
    },
    draw: (s, x, y) => {
      glow(x + 5, y + 5, 10, '#a878e8', 0.6);
      circle(x + 5, y + 5, 5, '#2a1e40');
      circle(x + 5, y + 5, 3, '#a878e8');
    },
  },
  ering: {
    draw: (s, x, y) => {
      drawRing(x + 6, y + 6, 6 + ((s.t >> 2) % 3), '#f878c8');
      drawRing(x + 6, y + 6, 3, '#fcfcfc');
    },
  },
  elaser: {
    update(s) {
      const nx = s.x + s.vx,
        ny = s.y + s.vy;
      if (solidPx(s.vx > 0 ? nx + s.w : nx, s.y + 4)) {
        s.vx = -s.vx;
        s.bounces--;
      }
      if (solidPx(s.x + 4, s.vy > 0 ? ny + s.h : ny)) {
        s.vy = -s.vy;
        s.bounces--;
      }
      if (s.bounces < 0) s.dead = true;
      s.x += s.vx;
      s.y += s.vy;
    },
    draw: (s, x, y) => {
      R(x - s.vx, y + 3 - s.vy, 8, 2, 'rgba(248,168,232,0.5)');
      R(x, y + 2, 8, 4, '#f878c8');
      R(x + 2, y + 3, 4, 2, '#fcfcfc');
      glow(x + 4, y + 4, 8, '#f878c8', 0.6);
    },
  },
  lwarn: {
    update: life,
    draw: (s, x, y) => {
      if (frameCount & 4) {
        R(x, y + 4, s.w, 2, '#fcf0a8');
        glow(x + s.w / 2, y + 4, 12, '#fcf0a8', 0.6);
      }
    },
  },
  lpillar: {
    pierce: true,
    update: life,
    draw(s, x, y) {
      const k = Math.min(1, (24 - s.life + 2) / 4);
      R(x + 9 - 9 * k, y, 18 * k, s.h, 'rgba(252,240,168,0.7)');
      R(x + 9 - 4 * k, y, 8 * k, s.h, '#fcfcfc');
      glow(x + 9, y + s.h - 8, 24, '#fcf0a8', 0.8);
    },
  },
  lwave: {
    pierce: true,
    update(s) {
      s.x += s.vx;
      if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + 7)) s.dead = true;
    },
    draw: (s, x, y) => {
      for (let i = 0; i < 3; i++) drawRing(x + 7, y + 14, 4 + i * 4, i ? '#fcf0a8' : '#fcfcfc', true);
      glow(x + 7, y + 8, 10, '#fcf0a8', 0.6);
    },
  },
  ehand: {
    pierce: true,
    update(s) {
      // flies to where the player was, then back to Chronia
      const o = s.owner;
      if (!boss || boss !== o) {
        s.dead = true;
        return;
      }
      const tx = s.back ? bcx(o) : s.tx,
        ty = s.back ? o.y + 10 : s.ty;
      const dx = tx - (s.x + 8),
        dy = ty - (s.y + 8),
        d = Math.hypot(dx, dy) || 1,
        sp = s.back ? 4.4 : 4;
      s.x += (dx / d) * Math.min(sp, d);
      s.y += (dy / d) * Math.min(sp, d);
      if (!s.back && (d < 6 || s.t > 60)) s.back = true;
      else if (s.back && d < 10) s.dead = true;
    },
    draw(s, x, y) {
      const a = s.t * 0.4;
      for (let r = -7; r < 8; r += 1.5)
        R(x + 8 + Math.cos(a) * r - 1, y + 8 + Math.sin(a) * r - 1, 2, 2, r > 3 ? '#c8a048' : '#3a2418');
    },
  },
  eneedle: {
    draw: (s, x, y) => {
      R(x, y + 1, 12, 2, '#3a2418');
      R(x + (s.vx > 0 ? 9 : 0), y, 3, 4, '#c8a048');
    },
  },
});

// ================= LAYOUTS =================
// Each layout keeps the validated geometry of an Azura stage (jumps, ladders, pits) and swaps in its own
// hazards, enemies and tiles: hydro ~ cut, toxic ~ fire, shadow ~ earth, sonic ~ wind, light ~ elec, time ~ snow.
// fill the open cells of a rectangle with water (W); ladders and walls stay
const flood = (B, x0, y0, x1, y1) => {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) if (B.map[y][x] === 'b' || B.map[y][x] === '.') B.map[y][x] = 'W';
};
Object.assign(LAYOUTS, {
  hydro(B) {
    // --- harbour
    B.ground(0, 24);
    B.add('start', 3);
    B.add('met', 12);
    B.add('jelly', 20, 17);
    // pit 25-27
    B.ground(28, 46);
    flood(B, 31, F, 43, F); // a shallow channel with jellyfish
    B.add('jelly', 35, 19);
    B.add('jelly', 41, 19);
    B.add('met', 45);
    B.add('h', 37);
    // urchin pit crossed on a moving platform
    B.ground(47, 56);
    B.spikes(48, 55);
    B.add('plat', 48, 20, { x1: 53, y1: 20, speed: 0.8 });
    // --- water tower: ladders up the side, the current on the roof, stepping blocks down the far side
    B.ground(57, 170);
    B.add('hopper', 60);
    B.rect(64, 15, 69, 21, '#');
    B.ladder(63, 15, 21);
    B.add('met', 66, 14);
    B.ladder(69, 8, 14);
    B.rect(70, 8, 86, 21, '#');
    B.rect(72, 8, 84, 8, '<'); // the current on the roof pushes back toward the ladder
    B.add('turret', 76, 7);
    B.add('jelly', 81, 4);
    B.add('flyer', 82, 3);
    B.rect(89, 11, 90, 11, '=');
    B.rect(93, 14, 94, 14, '=');
    B.rect(97, 17, 98, 17, '=');
    B.add('jelly', 95, 9);
    B.add('cp', 103);
    // --- flooded sewer: the surface is an urchin field, so swim under it
    B.spikes(112, 145);
    B.cave(104, 28, 151, 35);
    B.shaft(108, F, 35);
    B.shaft(150, F, 35);
    B.rect(140, 28, 146, 32, '#'); // low tunnel
    flood(B, 104, 30, 151, 35);
    B.add('L', 105, 35);
    B.add('met', 116, 35);
    B.rect(112, 36, 117, 36, '>');
    B.add('drip', 119, 28, { period: 80 });
    B.add('drip', 123, 28, { period: 80, phase: 40 });
    B.add('jelly', 121, 31);
    B.spikes(129, 134, 36);
    B.add('plat', 129, 34, { x1: 133, y1: 34, speed: 0.8 });
    B.add('hopper', 138, 35);
    B.add('met', 144, 35);
    B.rect(156, 20, 156, 21, '=');
    B.add('turret', 156, 19);
    B.add('met', 162);
    B.add('h', 166);
    // pit 171-173
    // --- lift up the dam wall, jellyfish over the top
    B.ground(174, 240);
    B.add('plat', 180, 20, { x1: 180, y1: 7, speed: 0.7 });
    B.add('flyer', 177, 12);
    B.rect(184, 6, 200, 21, '#');
    B.add('jelly', 188, 1);
    B.add('met', 196, 5);
    B.add('jelly', 192, 1);
    B.add('cp', 205);
    // --- pipe corridor dripping from the ceiling
    B.add('hopper', 210);
    B.add('hopper', 215);
    B.rect(220, 0, 233, 17, '=');
    B.add('drip', 222, 18, { period: 70 });
    B.add('drip', 226, 18, { period: 70, phase: 23 });
    B.add('drip', 230, 18, { period: 70, phase: 46 });
    B.add('met', 236);
    // pit 241-243
    B.ground(244, 275);
    B.add('flyer', 242, 16);
    B.rect(247, F, 259, F, '<');
    B.add('jelly', 253, 17);
    B.add('E', 262);
    B.add('met', 266);
    B.add('jelly', 270, 16);
    bossRoom(B, DOOR_COL, 'hydro');
  },

  toxic(B) {
    B.ground(0, 20);
    B.add('start', 3);
    B.add('met', 12);
    B.lava(21, 23); // '~' is poison sludge here
    B.ground(24, 44);
    B.add('vent', 29, F, { phase: 0 });
    B.add('vent', 35, F, { phase: 85 });
    B.add('flyer', 40, 15);
    B.add('slime', 42);
    B.add('h', 32);
    // sludge lake with stepping blocks
    B.lava(45, 58);
    B.rect(47, 20, 48, 20, '=');
    B.rect(51, 19, 52, 19, '=');
    B.rect(55, 20, 56, 20, '=');
    B.add('flyer', 53, 13);
    // --- waste heap: climb it, drop through the chute into the processing tunnel (the far side is a sludge lake)
    B.ground(59, 90);
    B.add('hopper', 61);
    B.rect(66, 18, 90, 21, '#');
    B.ladder(65, 18, 21);
    B.add('vent', 67, 18, { phase: 20 });
    B.rect(70, 14, 86, 17, '#');
    B.ladder(69, 14, 17);
    B.add('met', 72, 13);
    B.rect(74, 10, 82, 13, '#');
    B.ladder(73, 10, 13);
    B.add('flyer', 80, 5);
    B.lava(91, 118);
    B.ground(119, 167);
    B.cave(70, 28, 121, 36);
    B.cave(77, 10, 79, 27); // chute
    B.pool(84, 88, 37);
    B.rect(86, 35, 86, 35, '=');
    B.add('vent', 92, 37, { phase: 0 });
    B.add('met', 95, 36);
    B.add('vent', 98, 37, { phase: 85 });
    B.add('slime', 101, 30);
    B.add('hopper', 103, 36);
    B.pool(106, 111, 37);
    B.add('plat', 106, 35, { x1: 110, y1: 35, speed: 0.9 });
    B.add('flyer', 112, 31);
    B.add('h', 116, 36);
    B.shaft(120, F, 36);
    B.add('cp', 124);
    // gas tunnel with slimes on the ceiling
    B.rect(130, 0, 140, 18, '=');
    B.add('slime', 132, 20);
    B.add('vent', 135, F, { phase: 0 });
    B.add('slime', 138, 20);
    B.add('met', 145);
    B.add('slime', 150);
    B.add('flyer', 158, 14);
    // --- rusted pillars rising out of a sludge field up to a plateau
    B.lava(168, 191);
    B.pillar(168, 169, 20);
    B.pillar(172, 173, 18);
    B.pillar(176, 177, 16);
    B.pillar(180, 181, 14);
    B.pillar(184, 185, 12);
    B.pillar(188, 189, 10);
    B.add('vent', 176, 16, { phase: 0 });
    B.add('vent', 184, 12, { phase: 85 });
    B.add('flyer', 182, 6);
    B.pillar(192, 210, 8);
    B.add('met', 196, 7);
    B.add('slime', 202, 7);
    B.add('hopper', 207, 7);
    B.ground(211, 235);
    B.add('cp', 214);
    B.add('vent', 220, F, { phase: 0 });
    B.add('vent', 224, F, { phase: 57 });
    B.add('vent', 228, F, { phase: 114 });
    B.add('hopper', 233);
    B.lava(236, 238);
    B.ground(239, 241);
    // sludge lake crossed on a moving platform
    B.lava(242, 254);
    B.add('plat', 242, 20, { x1: 252, y1: 20, speed: 1 });
    B.add('flyer', 248, 14);
    B.ground(255, 275);
    B.add('E', 260);
    B.add('slime', 264);
    B.add('flyer', 268, 15);
    B.add('vent', 271, F, { phase: 30 });
    bossRoom(B, DOOR_COL, 'toxic');
  },

  shadow(B) {
    // a dark castle: only torches, your shots and yourself give light
    B.ground(0, 18);
    B.add('start', 3);
    B.add('torch', 8, 19);
    B.add('met', 12);
    B.add('torch', 17, 19);
    // crumbling bridge over a bottomless pit
    B.rect(19, F, 30, F, 'C');
    B.ground(31, 54);
    B.add('torch', 34, 19);
    B.add('shade', 40, 16);
    B.add('torch', 44, 19);
    B.add('met', 48);
    B.add('h', 52);
    // --- rampart: steps up past the torches, drop down the well
    B.ground(55, 71);
    B.rect(56, 20, 57, 20, '=');
    B.rect(59, 18, 60, 18, '=');
    B.rect(62, 16, 63, 16, '=');
    B.rect(65, 14, 66, 14, '=');
    B.rect(68, 12, 69, 12, '=');
    B.add('torch', 58, 15);
    B.add('torch', 64, 11);
    B.add('shade', 66, 8);
    B.pillar(71, 92, 10);
    B.add('met', 76, 9);
    B.add('torch', 79, 7);
    B.add('hopper', 82, 9);
    B.add('flyer', 86, 4);
    B.cave(87, 10, 89, 27); // well
    B.ground(93, 147);
    B.pit(93, 118);
    // --- dungeon: crumbling floors over the abyss
    B.cave(80, 28, 125, 35);
    B.add('torch', 84, 31);
    B.add('met', 95, 35);
    B.rect(98, 36, 105, 36, 'C');
    B.rect(98, 37, 105, 37, 'b');
    B.rect(98, 38, 105, 39, 'X');
    B.add('torch', 101, 31);
    B.add('shade', 109, 32);
    B.add('flyer', 113, 31);
    B.add('torch', 116, 31);
    B.add('h', 118, 35);
    B.shaft(122, F, 35);
    B.add('cp', 128);
    B.rect(130, F, 135, F, 'C');
    B.rect(130, F + 1, 135, LEVEL_H - 1, '.');
    B.add('torch', 137, 19);
    B.add('flyer', 138, 15);
    B.add('met', 142);
    // --- two lifts up to the tower top, ghosts on the battlements
    B.ground(148, 200);
    B.add('plat', 150, 20, { x1: 150, y1: 12, speed: 0.7 });
    B.pillar(153, 155, 12);
    B.add('torch', 154, 9);
    B.add('plat', 158, 12, { x1: 158, y1: 6, speed: 0.7 });
    B.pillar(161, 181, 5);
    B.add('torch', 164, 2);
    B.add('hopper', 170, 4);
    B.add('shade', 173, 0);
    B.add('torch', 176, 2);
    B.add('met', 178, 4);
    B.add('cp', 184);
    B.add('torch', 188, 19);
    B.add('shade', 192, 16);
    B.add('hopper', 196);
    // crumbling bridge over a pit
    B.rect(201, F, 210, F, 'C');
    B.ground(211, 230);
    B.add('torch', 214, 19);
    B.rect(218, 20, 218, 21, '=');
    B.add('turret', 218, 19);
    B.add('flyer', 225, 15);
    B.add('torch', 228, 19);
    // crumbling stepping stones
    B.rect(233, 20, 234, 20, 'C');
    B.rect(237, 18, 238, 18, 'C');
    B.rect(241, 19, 242, 19, '=');
    B.ground(245, 275);
    B.add('torch', 248, 19);
    B.add('shade', 254, 16);
    B.add('torch', 258, 19);
    B.add('E', 265);
    B.add('shade', 268, 14);
    B.add('torch', 272, 19);
    bossRoom(B, DOOR_COL, 'shadow');
  },

  sonic(B) {
    // floating stages over a sea of clouds (falling into the clouds is death); drums (U) bounce you up
    const isle = (x0, x1, top = F, th = 3) => B.rect(x0, top, x1, top + th, '#');
    isle(0, 18);
    B.add('start', 3);
    B.add('met', 12);
    // gap 19-21
    isle(22, 40);
    B.add('speakerbot', 33);
    B.add('h', 27);
    B.add('flyer', 38, 14);
    // gap 41-43
    // --- drums up to the concert hall
    isle(44, 52);
    B.rect(50, F, 51, F, 'U');
    isle(53, 59, 16, 1);
    B.add('met', 55, 15);
    B.rect(58, 16, 59, 16, 'U');
    isle(62, 67, 10, 1);
    B.add('flyer', 66, 5);
    // concert hall: the tower blocks the roof, so go down the ladder and through the hall
    B.rect(69, 8, 95, F + 3, '=');
    B.rect(86, 0, 95, 7, '=');
    B.add('speakerbot', 76, 7);
    B.add('met', 79, 7);
    B.ladder(82, 8, 21);
    B.cave(71, 12, 93, 21);
    B.add('L', 72, 21);
    B.add('speaker', 77, 21, { dir: 1, period: 150 });
    B.rect(84, F, 85, F, 'U');
    B.spikes(86, 88);
    B.add('flyer', 91, 17); // bounce off the drum over the spikes
    B.cave(94, 18, 95, 21); // stage door
    isle(96, 112);
    B.add('cp', 100);
    B.add('flyer', 108, 14);
    B.add('speaker', 111, F - 1, { dir: -1 });
    // gap 113-115
    // --- echo well: drop into the floating rock (a spire blocks its top), bounce back out on the drums
    isle(116, 153, F, 16);
    B.rect(124, 0, 128, F - 1, '=');
    B.cave(119, F, 121, 29);
    B.cave(117, 30, 139, 36);
    B.add('met', 123, 36);
    B.spikes(128, 129, 37);
    B.add('speakerbot', 134, 36);
    B.cave(140, F, 148, 36);
    B.rect(146, 37, 147, 37, 'U');
    B.rect(141, 31, 143, 31, '#');
    B.rect(141, 31, 141, 31, 'U');
    B.rect(144, 26, 147, 26, '#');
    B.rect(147, 26, 147, 26, 'U');
    isle(154, 170);
    B.add('cp', 158);
    B.add('speakerbot', 166);
    // --- floating stage, a drum and a sky bridge
    B.add('plat', 172, 20, { x1: 180, y1: 20, speed: 0.9 });
    B.add('flyer', 176, 13);
    isle(184, 190, 20, 1);
    B.rect(189, 20, 190, 20, 'U');
    isle(193, 222, 13, 1);
    B.add('speakerbot', 200, 12);
    B.add('met', 206, 12);
    B.add('flyer', 212, 7);
    B.add('h', 216, 12);
    B.add('speaker', 221, 12, { dir: -1 });
    isle(226, 240);
    B.add('met', 232);
    B.add('speakerbot', 238);
    // gap 241-243
    isle(244, 275);
    B.add('speaker', 252, F - 1, { dir: -1, phase: 40 });
    B.add('speakerbot', 258);
    B.add('E', 264);
    B.add('flyer', 268, 14);
    bossRoom(B, DOOR_COL, 'sonic');
  },

  light(B) {
    // a crystal palace: laser gates (hlaser, short ones you jump over) and crystals that shoot back
    B.ground(0, 18);
    B.add('start', 3);
    B.add('met', 12);
    // two laser gates under a ceiling
    B.ground(19, 44);
    B.rect(22, 12, 34, 13, '=');
    B.add('hlaser', 24, 21, { x1: 26, phase: 0 });
    B.add('hlaser', 30, 21, { x1: 32, phase: 75 });
    B.add('h', 28);
    B.add('prismo', 39);
    // pit 45-47
    // --- crystal tower: ladders up, laser gates on the roof
    B.ground(48, 138);
    B.add('hopper', 52);
    B.rect(60, 16, 64, 21, '#');
    B.ladder(59, 16, 21);
    B.add('met', 62, 15);
    B.ladder(64, 10, 15);
    B.rect(65, 10, 84, 21, '#');
    B.add('hlaser', 69, 9, { x1: 71, phase: 0 });
    B.add('hlaser', 77, 9, { x1: 79, phase: 75 });
    B.add('turret', 74, 9);
    B.add('prismo', 82, 9);
    B.add('cp', 90);
    // --- mirror tunnel: the surface is a spike field, go under it past three pulsing gates
    B.spikes(96, 128);
    B.cave(90, 28, 134, 35);
    B.shaft(93, F, 35);
    B.add('hlaser', 99, 35, { x1: 101, phase: 0 });
    B.add('hlaser', 105, 35, { x1: 107, phase: 50 });
    B.add('hlaser', 111, 35, { x1: 113, phase: 100 });
    B.add('met', 117, 35);
    B.spikes(120, 124, 36);
    B.add('plat', 120, 34, { x1: 123, y1: 34, speed: 0.8 });
    B.add('hopper', 128, 35);
    B.shaft(132, F, 35);
    B.rect(136, 20, 136, 21, '=');
    B.add('turret', 136, 19);
    // --- crystal stepping stones over a pit
    B.rect(140, 20, 141, 20, '=');
    B.rect(144, 19, 145, 19, '=');
    B.rect(148, 18, 149, 18, '=');
    B.rect(152, 19, 153, 19, '=');
    B.add('flyer', 146, 13);
    // --- prism pit: drop in, dodge the gates, ride the lift back up
    B.ground(154, 245);
    B.cave(157, F, 185, 36);
    B.rect(164, 25, 166, 25, '=');
    B.rect(172, 25, 174, 25, '=');
    B.add('hlaser', 163, 36, { x1: 165, phase: 0 });
    B.add('hlaser', 172, 36, { x1: 174, phase: 70 });
    B.add('prismo', 169, 36);
    B.add('hopper', 177, 36);
    B.add('h', 160, 36);
    B.add('plat', 182, 35, { x1: 182, y1: 20, speed: 0.7 });
    B.add('cp', 190);
    // low hall with three gates pulsing in sequence
    B.rect(200, 0, 216, 17, '=');
    B.add('hlaser', 203, 21, { x1: 205, phase: 0 });
    B.add('hlaser', 208, 21, { x1: 210, phase: 50 });
    B.add('hlaser', 213, 21, { x1: 215, phase: 100 });
    B.add('E', 222);
    B.add('hopper', 226);
    B.rect(232, 20, 232, 21, '=');
    B.add('turret', 232, 19);
    B.add('met', 238);
    B.add('prismo', 242);
    // pit 246-248
    // spike pit crossed on a platform under a laser: don't jump
    B.ground(249, 275);
    B.spikes(250, 256);
    B.add('plat', 250, 20, { x1: 255, y1: 20, speed: 0.9 });
    B.add('hlaser', 250, 17, { x1: 256, phase: 30 });
    B.add('flyer', 262, 14);
    B.add('prismo', 266);
    B.add('met', 270);
    bossRoom(B, DOOR_COL, 'light');
  },

  time(B) {
    // a clockwork tower: gears turn the floors (conveyors), pendulums swing from the ceilings
    B.ground(0, 18);
    B.add('start', 3);
    B.add('met', 12);
    B.ground(19, 35);
    B.rect(19, F, 35, F, '<');
    B.rect(24, 13, 33, 15, '=');
    B.add('pendulum', 26, 16, { len: 4.5, amp: 0.8, phase: 0 });
    B.add('pendulum', 31, 16, { len: 4.5, amp: 0.8, phase: Math.PI });
    B.ground(36, 40);
    // pit 41-43
    B.ground(44, 62);
    B.add('hopper', 50);
    B.add('flyer', 57, 15);
    B.add('gearbot', 60);
    B.add('h', 54);
    // blocks over a bottomless pit
    B.rect(65, 20, 66, 20, '=');
    B.rect(69, 18, 70, 18, '=');
    B.rect(73, 20, 74, 20, '=');
    B.add('flyer', 70, 12);
    // --- clock tower: steps up to the top, then drop down the shaft into the gear room
    B.ground(76, 175);
    B.rect(80, 20, 82, 20, '=');
    B.rect(84, 18, 86, 18, '=');
    B.rect(88, 16, 90, 16, '=');
    B.rect(92, 14, 94, 14, '=');
    B.rect(96, 12, 98, 12, '=');
    B.add('flyer', 90, 9);
    B.pillar(100, 118, 10);
    B.add('gearbot', 104, 9);
    B.add('flyer', 108, 4);
    B.add('hopper', 115, 9);
    B.cave(109, 10, 111, 27); // shaft
    B.pit(119, 145); // the far side of the tower is a chasm
    B.cave(100, 28, 150, 35);
    B.add('L', 101, 35);
    B.rect(114, 36, 128, 36, '>');
    B.add('pendulum', 118, 28, { len: 6.5, amp: 0.7, phase: 0 });
    B.add('pendulum', 125, 28, { len: 6.5, amp: 0.7, phase: 1.6 });
    B.spikes(132, 136, 36);
    B.add('plat', 132, 34, { x1: 135, y1: 34, speed: 0.8 });
    B.add('hopper', 140, 35);
    B.add('h', 144, 35);
    B.shaft(148, F, 35);
    B.add('cp', 152);
    // long gear belt under the pendulums
    B.rect(156, F, 172, F, '>');
    B.rect(160, 12, 170, 14, '=');
    B.add('pendulum', 163, 15, { len: 4.5, amp: 0.8, phase: 0 });
    B.add('pendulum', 168, 15, { len: 4.5, amp: 0.8, phase: Math.PI });
    B.add('gearbot', 158);
    // --- chasm: a platform, a turning wheel and blocks
    B.pit(176, 200);
    B.add('plat', 177, 20, { x1: 182, y1: 20, speed: 0.8 });
    B.add('plat', 185, 17, { r: 3, speed: 0.02 }); // ride it to the top, jump to the blocks
    B.rect(190, 15, 191, 15, '=');
    B.rect(194, 17, 195, 17, '=');
    B.rect(198, 19, 199, 19, '=');
    B.add('flyer', 192, 10);
    B.ground(201, 275);
    B.add('cp', 205);
    B.add('gearbot', 210);
    B.rect(214, F, 230, F, '>');
    B.rect(216, 13, 228, 15, '=');
    B.add('pendulum', 219, 16, { len: 4.5, amp: 0.8, phase: 0 });
    B.add('pendulum', 225, 16, { len: 4.5, amp: 0.8, phase: 2 });
    B.add('gearbot', 236);
    B.rect(240, 20, 242, 21, '=');
    B.add('turret', 241, 19);
    B.add('flyer', 246, 15);
    B.pit(250, 252);
    B.add('E', 260);
    B.add('met', 266);
    B.add('h', 270);
    bossRoom(B, DOOR_COL, 'time');
  },
});
