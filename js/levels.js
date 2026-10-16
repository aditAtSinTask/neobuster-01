'use strict';
// Stage layouts. Each stage is 300x44 tiles: the main path runs on the surface (floor top = row 22), with towers
// above it and caves below it; the boss room is the last 24 columns.
// Tiles: # ground, = block, I ice (slippery), C crumbling block, ^ spikes, ~ lava, H ladder, D boss door,
//        b cave/backdrop wall (not solid, drawn dark), X abyss (falling into it is death),
//        < > conveyor belt, Q quicksand (you sink; jump out before your head goes under),
//        U updraft pad (launches you about 8 tiles up).
// Hazards: saw, jet (fire), icicle, rockfall, zap (electric beam from a ceiling emitter down to row y1),
//          bubble (magma leaping out of lava at row y), eblock (energy block idx of n, solid in turn),
//          wind (blizzard gusts over columns x..x1 pushing toward dir).
// Each stage has its own enemy on top of the common ones: blader (cut), totem (fire), watcher (elec),
// snowman (snow), mole (earth), fanbot (wind).
// Rules of thumb for layouts: a jump clears 3 empty tiles (but only 2 tiles of spikes, which kill on any touch)
// and rises at most 2 tiles; an updraft pad rises about 8; ladders are 1 tile wide.

const LEVEL_H = 44,
  FLOOR = 22,
  LEVEL_W = 300,
  DOOR_COL = 276;

const STAGES = {
  cut: { name: 'SNIPTOR', title: 'MANUSIA GUNTING', theme: 'cut', music: 'cut', ambient: 'dust', color: '#f87858' },
  fire: { name: 'MAGMARON', title: 'MANUSIA API', theme: 'fire', music: 'fire', ambient: 'embers', color: '#f8a800' },
  elec: { name: 'VOLTRAX', title: 'MANUSIA LISTRIK', theme: 'elec', music: 'elec', ambient: 'rain', color: '#f8e030' },
  snow: { name: 'GLACIELLE', title: 'WANITA ES', theme: 'snow', music: 'snow', ambient: 'snow', color: '#a8e8fc' },
  earth: {
    name: 'TERRALYN',
    title: 'WANITA TANAH & BATU',
    theme: 'earth',
    music: 'earth',
    ambient: 'dust',
    color: '#c8a060',
  },
  wind: {
    name: 'WINDERWOMEN',
    title: 'WANITA ANGIN',
    theme: 'wind',
    music: 'wind',
    ambient: 'breeze',
    color: '#78f8c8',
  },
};
const STAGE_ORDER = ['cut', 'fire', 'elec', 'snow', 'earth', 'wind'];

const ENEMY_COLORS = {
  cut: { a: '#f8b800', c: '#c87800', fly: '#9020c8', fly2: '#e070f8', hop: '#00a800', hop2: '#58d854', tur: '#686878' },
  fire: {
    a: '#f85818',
    c: '#a82808',
    fly: '#e88800',
    fly2: '#f8e050',
    hop: '#a83818',
    hop2: '#f87858',
    tur: '#5a3a3a',
  },
  snow: {
    a: '#e8f4fc',
    c: '#88b0d8',
    fly: '#3878d8',
    fly2: '#a8d8fc',
    hop: '#384868',
    hop2: '#d8e8fc',
    tur: '#58789a',
  },
  earth: {
    a: '#8ab838',
    c: '#4a7a20',
    fly: '#a8682a',
    fly2: '#e8b868',
    hop: '#7a5a3a',
    hop2: '#b89870',
    tur: '#6a6458',
  },
  elec: {
    a: '#f8d800',
    c: '#a88800',
    fly: '#2838a8',
    fly2: '#f8f058',
    hop: '#303848',
    hop2: '#f8d800',
    tur: '#4a4a58',
  },
  wind: {
    a: '#78e8c8',
    c: '#3a9a7a',
    fly: '#e87898',
    fly2: '#fcd8e8',
    hop: '#5a7aa8',
    hop2: '#c8e0f8',
    tur: '#8888a8',
  },
};

function makeBuilder() {
  const map = Array.from({ length: LEVEL_H }, () => Array(LEVEL_W).fill('.'));
  const ents = [];
  const B = {
    map,
    ents,
    rect(x0, y0, x1, y1, c) {
      for (let y = Math.max(0, y0); y <= Math.min(LEVEL_H - 1, y1); y++)
        for (let x = Math.max(0, x0); x <= Math.min(LEVEL_W - 1, x1); x++) map[y][x] = c;
    },
    ground(x0, x1, top = FLOOR) {
      B.rect(x0, top, x1, LEVEL_H - 1, '#');
    },
    // a solid column from `top` down to the bottom of the level (pillars, cliffs, towers)
    pillar(x0, x1, top) {
      B.rect(x0, top, x1, LEVEL_H - 1, '#');
    },
    ladder(x, y0, y1) {
      B.rect(x, y0, x, y1, 'H');
    },
    spikes(x0, x1, y = FLOOR) {
      B.rect(x0, y, x1, y, '^');
    },
    lava(x0, x1) {
      B.rect(x0, FLOOR, x1, FLOOR, '.');
      B.rect(x0, FLOOR + 1, x1, FLOOR + 1, '~');
      B.rect(x0, FLOOR + 2, x1, LEVEL_H - 1, '#');
    },
    // lava pool sunk one tile into a cave floor whose top is row `floor`
    pool(x0, x1, floor) {
      B.rect(x0, floor, x1, floor, 'b');
      B.rect(x0, floor + 1, x1, floor + 1, '~');
    },
    cave(x0, y0, x1, y1) {
      B.rect(x0, y0, x1, y1, 'b');
    },
    // ladder going down through the ground: 1 tile wide at the mouth, 3 wide below it
    shaft(x, y0, y1) {
      B.cave(x - 1, y0 + 2, x + 1, y1);
      B.ladder(x, y0, y1);
    },
    // surface pit with an abyss under it, deep enough to fill the bottom of the screen; row FLOOR + 5 stays solid
    // so a cave can run underneath (caves start at row FLOOR + 6 or lower)
    pit(x0, x1) {
      B.rect(x0, FLOOR, x1, FLOOR + 1, '.');
      B.rect(x0, FLOOR + 2, x1, FLOOR + 4, 'X');
    },
    add(type, x, y = FLOOR - 1, o = {}) {
      ents.push(Object.assign({ type, x, y }, o));
    },
  };
  return B;
}

// the boss room, with a themed back wall (painted by ROOM_ART) and a gimmick of its own
function bossRoom(B, dc, theme) {
  B.ground(dc, dc + 23);
  B.rect(dc, 0, dc, 18, '=');
  B.rect(dc, 19, dc, 21, 'D');
  B.rect(dc + 23, 0, dc + 23, 21, '=');
  B.rect(dc + 1, 0, dc + 22, 12, '=');
  B.cave(dc + 1, 13, dc + 22, 21);
  switch (theme) {
    case 'cut':
      B.rect(dc + 8, FLOOR, dc + 15, FLOOR, '<');
      break; // conveyor floor
    case 'fire':
      B.add('jet', dc + 5, FLOOR, { phase: 0 });
      B.add('jet', dc + 19, FLOOR, { phase: 75 });
      break; // fire jets
    case 'elec':
      B.add('zap', dc + 7, 13, { y1: 21, phase: 0 });
      B.add('zap', dc + 16, 13, { y1: 21, phase: 75 });
      break; // beams
    case 'snow':
      B.rect(dc + 1, FLOOR, dc + 22, FLOOR, 'I');
      break; // ice floor
    case 'wind':
      B.add('plat', dc + 4, 18, { x1: dc + 8, y1: 18, speed: 0.6 });
      B.add('plat', dc + 14, 17, { x1: dc + 18, y1: 17, speed: 0.6 });
      break; // drifting clouds
  }
}

const F = FLOOR;
const LAYOUTS = {
  cut(B) {
    // --- yard
    B.ground(0, 24);
    B.add('start', 3);
    B.add('met', 12);
    B.add('blader', 20, 15);
    // pit 25-27
    B.ground(28, 46);
    B.add('saw', 31, 21, { x1: 43, y1: 21, speed: 1.3 });
    B.add('met', 45);
    B.add('h', 37);
    // spike pit crossed on a moving platform
    B.ground(47, 56);
    B.spikes(48, 55);
    B.add('plat', 48, 20, { x1: 53, y1: 20, speed: 0.8 });
    // --- factory tower: ladders up the side, saw on the roof, stepping blocks down the far side
    B.ground(57, 170);
    B.add('hopper', 60);
    B.rect(64, 15, 69, 21, '#');
    B.ladder(63, 15, 21);
    B.add('met', 66, 14);
    B.ladder(69, 8, 14);
    B.rect(70, 8, 86, 21, '#');
    B.rect(72, 8, 84, 8, '<'); // roof conveyor pushes back toward the ladder
    B.add('turret', 76, 7);
    B.add('saw', 79, 7, { x1: 85, y1: 7, speed: 1.1 });
    B.add('flyer', 82, 3);
    B.rect(89, 11, 90, 11, '=');
    B.rect(93, 14, 94, 14, '=');
    B.rect(97, 17, 98, 17, '=');
    B.add('blader', 95, 10);
    B.add('cp', 103);
    // --- sewer: the surface is a spike field, so go under it
    B.spikes(112, 145);
    B.cave(104, 28, 151, 35);
    B.shaft(108, F, 35);
    B.add('L', 105, 35);
    B.add('met', 116, 35);
    B.rect(112, 36, 117, 36, '>');
    B.add('saw', 118, 35, { x1: 126, y1: 35, speed: 1.2 }); // belt feeds the saw
    B.spikes(129, 134, 36);
    B.add('plat', 129, 34, { x1: 133, y1: 34, speed: 0.8 });
    B.add('hopper', 138, 35);
    B.rect(140, 28, 146, 32, '#');
    B.add('met', 144, 35); // low tunnel
    B.shaft(150, F, 35);
    B.rect(156, 20, 156, 21, '=');
    B.add('turret', 156, 19);
    B.add('met', 162);
    B.add('h', 166);
    // pit 171-173
    // --- lift up the warehouse wall, catwalk on top
    B.ground(174, 240);
    B.add('plat', 180, 20, { x1: 180, y1: 7, speed: 0.7 });
    B.add('flyer', 177, 12);
    B.rect(184, 6, 200, 21, '#');
    B.add('saw', 186, 5, { x1: 198, y1: 5, speed: 1.2 });
    B.add('met', 196, 5);
    B.add('blader', 192, 2);
    B.add('cp', 205);
    // --- slide under the saw in the low corridor
    B.add('hopper', 210);
    B.add('hopper', 215);
    B.rect(220, 0, 233, 17, '=');
    B.add('saw', 221, 20, { x1: 232, y1: 20, speed: 0.9 });
    B.add('met', 236);
    // pit 241-243
    B.ground(244, 275);
    B.add('flyer', 242, 16);
    B.rect(247, F, 259, F, '<');
    B.add('saw', 248, 21, { x1: 258, y1: 21, speed: 1.6 });
    B.add('E', 262);
    B.add('met', 266);
    B.add('blader', 270, 15);
    bossRoom(B, DOOR_COL, 'cut');
  },

  fire(B) {
    B.ground(0, 20);
    B.add('start', 3);
    B.add('met', 12);
    B.lava(21, 23);
    B.ground(24, 44);
    B.add('jet', 29, F, { phase: 0 });
    B.add('jet', 35, F, { phase: 75 });
    B.add('flyer', 40, 15);
    B.add('totem', 42);
    B.add('h', 32);
    // lava lake with stepping blocks
    B.lava(45, 58);
    B.rect(47, 20, 48, 20, '=');
    B.rect(51, 19, 52, 19, '=');
    B.rect(55, 20, 56, 20, '=');
    B.add('flyer', 53, 13);
    B.add('bubble', 49, F + 1, { phase: 0 });
    B.add('bubble', 53, F + 1, { phase: 70 });
    // --- volcano: climb the cone, drop through the crater into the magma chamber (the far side is a lava lake)
    B.ground(59, 90);
    B.add('hopper', 61);
    B.rect(66, 18, 90, 21, '#');
    B.ladder(65, 18, 21);
    B.add('jet', 67, 18, { phase: 20 });
    B.rect(70, 14, 86, 17, '#');
    B.ladder(69, 14, 17);
    B.add('met', 72, 13);
    B.rect(74, 10, 82, 13, '#');
    B.ladder(73, 10, 13);
    B.add('flyer', 80, 5);
    B.lava(91, 118);
    B.ground(119, 167);
    B.cave(70, 28, 121, 36);
    B.cave(77, 10, 79, 27); // crater shaft
    B.pool(84, 88, 37);
    B.rect(86, 35, 86, 35, '=');
    B.add('bubble', 85, 38, { period: 120 });
    B.add('jet', 92, 37, { phase: 0 });
    B.add('met', 95, 36);
    B.add('jet', 98, 37, { phase: 50 });
    B.add('hopper', 103, 36);
    B.pool(106, 111, 37);
    B.add('plat', 106, 35, { x1: 110, y1: 35, speed: 0.9 });
    B.add('flyer', 112, 31);
    B.add('bubble', 108, 38, { period: 120, phase: 60 });
    B.add('h', 116, 36);
    B.shaft(120, F, 36);
    B.add('cp', 124);
    // fire tunnel
    B.rect(130, 0, 140, 18, '=');
    B.add('jet', 135, F, { phase: 0 });
    B.add('met', 145);
    B.add('totem', 150);
    B.add('flyer', 158, 14);
    // --- basalt pillars rising out of a lava field up to a plateau
    B.lava(168, 191);
    B.pillar(168, 169, 20);
    B.pillar(172, 173, 18);
    B.pillar(176, 177, 16);
    B.pillar(180, 181, 14);
    B.pillar(184, 185, 12);
    B.pillar(188, 189, 10);
    B.add('jet', 176, 16, { phase: 0 });
    B.add('jet', 184, 12, { phase: 60 });
    B.add('flyer', 182, 6);
    B.add('bubble', 170, F + 1, { phase: 0 });
    B.add('bubble', 178, F + 1, { phase: 45 });
    B.add('bubble', 186, F + 1, { phase: 90 });
    B.pillar(192, 210, 8);
    B.add('met', 196, 7);
    B.add('totem', 202, 7);
    B.add('hopper', 207, 7);
    B.ground(211, 235);
    B.add('cp', 214);
    B.add('jet', 220, F, { phase: 0 });
    B.add('jet', 224, F, { phase: 50 });
    B.add('jet', 228, F, { phase: 100 });
    B.add('hopper', 233);
    B.lava(236, 238);
    B.ground(239, 241);
    // lava lake crossed on a moving platform
    B.lava(242, 254);
    B.add('plat', 242, 20, { x1: 252, y1: 20, speed: 1 });
    B.add('flyer', 248, 14);
    B.add('bubble', 246, F + 1, { phase: 0 });
    B.add('bubble', 250, F + 1, { phase: 70 });
    B.ground(255, 275);
    B.add('E', 260);
    B.add('totem', 264);
    B.add('flyer', 268, 15);
    B.add('jet', 271, F, { phase: 30 });
    bossRoom(B, DOOR_COL, 'fire');
  },

  elec(B) {
    B.ground(0, 18);
    B.add('start', 3);
    B.add('met', 12);
    // two electric gates under a ceiling
    B.ground(19, 44);
    B.rect(22, 12, 34, 13, '=');
    B.add('zap', 25, 14, { y1: 21, phase: 0 });
    B.add('zap', 31, 14, { y1: 21, phase: 70 });
    B.add('h', 28);
    B.add('watcher', 38, 15);
    // pit 45-47
    // --- transformer tower: ladders up, beams on the roof
    B.ground(48, 138);
    B.add('hopper', 52);
    B.rect(60, 16, 64, 21, '#');
    B.ladder(59, 16, 21);
    B.add('met', 62, 15);
    B.ladder(64, 10, 15);
    B.rect(65, 10, 84, 21, '#');
    B.rect(69, 4, 71, 4, '=');
    B.add('zap', 70, 5, { y1: 9, phase: 0 });
    B.rect(77, 4, 79, 4, '=');
    B.add('zap', 78, 5, { y1: 9, phase: 75 });
    B.add('turret', 74, 9);
    B.add('watcher', 81, 6);
    B.add('cp', 90);
    // --- cable tunnel: the surface is live wire, go under it past three pulsing beams
    B.spikes(96, 128);
    B.cave(90, 28, 134, 35);
    B.shaft(93, F, 35);
    B.add('zap', 100, 28, { y1: 35, phase: 0 });
    B.add('zap', 106, 28, { y1: 35, phase: 50 });
    B.add('zap', 112, 28, { y1: 35, phase: 100 });
    B.add('met', 117, 35);
    B.spikes(120, 124, 36);
    B.add('plat', 120, 34, { x1: 123, y1: 34, speed: 0.8 });
    B.add('hopper', 128, 35);
    B.shaft(132, F, 35);
    B.rect(136, 20, 136, 21, '=');
    B.add('turret', 136, 19);
    // --- energy blocks over a pit: they light up one after another
    for (const [i, x, y] of [
      [0, 140, 20],
      [1, 144, 19],
      [2, 148, 18],
      [3, 152, 19],
    ])
      B.add('eblock', x, y, { idx: i, n: 4 });
    B.add('watcher', 146, 13);
    // --- generator pit: drop in, dodge the beams, ride the lift back up
    B.ground(154, 245);
    B.cave(157, F, 185, 36);
    B.rect(164, 25, 166, 25, '=');
    B.add('zap', 165, 26, { y1: 36, phase: 0 });
    B.rect(172, 25, 174, 25, '=');
    B.add('zap', 173, 26, { y1: 36, phase: 70 });
    B.add('met', 169, 36);
    B.add('hopper', 177, 36);
    B.add('h', 160, 36);
    B.add('plat', 182, 35, { x1: 182, y1: 20, speed: 0.7 });
    B.add('cp', 190);
    // low tunnel with three beams pulsing in sequence
    B.rect(200, 0, 216, 17, '=');
    B.add('zap', 204, 18, { y1: 21, phase: 0 });
    B.add('zap', 209, 18, { y1: 21, phase: 50 });
    B.add('zap', 214, 18, { y1: 21, phase: 100 });
    B.add('E', 222);
    B.add('hopper', 226);
    B.rect(232, 20, 232, 21, '=');
    B.add('turret', 232, 19);
    B.add('met', 238);
    B.add('watcher', 242, 15);
    // pit 246-248
    // spike pit crossed on a platform that rides through a beam
    B.ground(249, 275);
    B.spikes(250, 256);
    B.add('plat', 250, 20, { x1: 255, y1: 20, speed: 0.9 });
    B.rect(252, 9, 254, 10, '=');
    B.add('zap', 253, 11, { y1: 21, phase: 30 });
    B.add('flyer', 262, 14);
    B.add('met', 268);
    bossRoom(B, DOOR_COL, 'elec');
  },

  snow(B) {
    B.ground(0, 18);
    B.add('start', 3);
    B.add('met', 12);
    B.rect(19, F, 35, LEVEL_H - 1, 'I');
    B.rect(24, 13, 33, 15, '=');
    B.add('icicle', 25, 16);
    B.add('icicle', 28, 16);
    B.add('icicle', 31, 16);
    B.ground(36, 40);
    // pit 41-43
    B.ground(44, 62);
    B.add('hopper', 50);
    B.add('flyer', 57, 15);
    B.add('snowman', 60);
    B.add('h', 54);
    // ice blocks over a bottomless pit
    B.rect(65, 20, 66, 20, '=');
    B.rect(69, 18, 70, 18, '=');
    B.rect(73, 20, 74, 20, '=');
    B.add('flyer', 70, 12);
    // --- mountain: ice steps up to the summit, then drop through a crevasse into the ice cave
    B.ground(76, 175);
    B.rect(80, 20, 82, 20, 'I');
    B.rect(84, 18, 86, 18, 'I');
    B.rect(88, 16, 90, 16, 'I');
    B.rect(92, 14, 94, 14, 'I');
    B.rect(96, 12, 98, 12, 'I');
    B.add('flyer', 90, 9);
    B.add('wind', 78, F, { x1: 118, dir: -1, phase: 0 }); // blizzard on the way up
    B.pillar(100, 118, 10);
    B.rect(100, 10, 118, 10, 'I');
    B.add('snowman', 104, 9);
    B.add('flyer', 108, 4);
    B.add('hopper', 115, 9);
    B.cave(109, 10, 111, 27); // crevasse
    B.pit(119, 145); // the far side of the mountain is a chasm
    B.cave(100, 28, 150, 35);
    B.add('L', 101, 35);
    B.rect(114, 36, 128, 36, 'I');
    B.add('icicle', 117, 28);
    B.add('icicle', 121, 28);
    B.add('icicle', 125, 28);
    B.spikes(132, 136, 36);
    B.add('plat', 132, 34, { x1: 135, y1: 34, speed: 0.8 });
    B.add('hopper', 140, 35);
    B.add('h', 144, 35);
    B.shaft(148, F, 35);
    B.add('cp', 152);
    // long icy slide under icicles
    B.rect(156, F, 172, LEVEL_H - 1, 'I');
    B.rect(160, 12, 170, 14, '=');
    B.add('icicle', 162, 15);
    B.add('icicle', 165, 15);
    B.add('icicle', 168, 15);
    B.add('hopper', 167);
    // --- frozen chasm: platform, lift and ice blocks
    B.pit(176, 200);
    B.add('wind', 176, F, { x1: 200, dir: -1, phase: 80 });
    B.add('plat', 177, 20, { x1: 182, y1: 20, speed: 0.8 });
    B.add('plat', 186, 20, { x1: 186, y1: 14, speed: 0.7 });
    B.rect(190, 15, 191, 15, '=');
    B.rect(194, 17, 195, 17, '=');
    B.rect(198, 19, 199, 19, '=');
    B.add('flyer', 192, 10);
    B.ground(201, 275);
    B.add('cp', 205);
    B.add('snowman', 210);
    B.add('wind', 212, F, { x1: 232, dir: 1, phase: 0 }); // tailwind over the ice
    B.rect(214, F, 230, LEVEL_H - 1, 'I');
    B.rect(216, 13, 228, 15, '=');
    B.add('icicle', 218, 16);
    B.add('icicle', 221, 16);
    B.add('icicle', 224, 16);
    B.add('icicle', 227, 16);
    B.add('snowman', 236);
    B.rect(240, 20, 242, 21, '=');
    B.add('turret', 241, 19);
    B.add('flyer', 246, 15);
    B.pit(250, 252);
    B.add('E', 260);
    B.add('met', 266);
    B.add('h', 270);
    bossRoom(B, DOOR_COL, 'snow');
  },

  wind(B) {
    // floating islands over a sea of clouds (falling into the clouds is death)
    const isle = (x0, x1, top = F, th = 3) => B.rect(x0, top, x1, top + th, '#');
    isle(0, 18);
    B.add('start', 3);
    B.add('met', 12);
    // gap 19-21
    isle(22, 40);
    B.add('fanbot', 33, 18);
    B.add('h', 27);
    B.add('flyer', 38, 14);
    // gap 41-43
    // --- updraft pads up to the sky castle
    isle(44, 52);
    B.rect(50, F, 51, F, 'U');
    isle(53, 59, 16, 1);
    B.add('met', 55, 15);
    B.rect(58, 16, 59, 16, 'U');
    isle(62, 67, 10, 1);
    B.add('flyer', 66, 5);
    // sky castle: the tower blocks the roof, so go down the ladder and through the hall
    B.rect(69, 8, 95, F + 3, '=');
    B.rect(86, 0, 95, 7, '=');
    B.add('fanbot', 76, 5);
    B.add('met', 79, 7);
    B.ladder(82, 8, 21);
    B.cave(71, 12, 93, 21);
    B.add('L', 72, 21);
    B.rect(84, F, 85, F, 'U');
    B.spikes(86, 88);
    B.add('fanbot', 91, 17); // ride the updraft over the spikes
    B.cave(94, 18, 95, 21); // castle gate
    isle(96, 112);
    B.add('cp', 100);
    B.add('flyer', 108, 14);
    // gap 113-115
    // --- wind well: drop into the floating rock (a spire blocks its top), ride the updrafts back out
    isle(116, 153, F, 16);
    B.rect(124, 0, 128, F - 1, '=');
    B.cave(119, F, 121, 29);
    B.cave(117, 30, 139, 36);
    B.add('met', 123, 36);
    B.spikes(128, 129, 37);
    B.add('fanbot', 134, 33);
    B.cave(140, F, 148, 36);
    B.rect(146, 37, 147, 37, 'U');
    B.rect(141, 31, 143, 31, '#');
    B.rect(141, 31, 141, 31, 'U');
    B.rect(144, 26, 147, 26, '#');
    B.rect(147, 26, 147, 26, 'U');
    isle(154, 170);
    B.add('cp', 158);
    B.add('fanbot', 166, 18);
    // --- cloud platform, updraft and a sky bridge
    B.add('plat', 172, 20, { x1: 180, y1: 20, speed: 0.9 });
    B.add('flyer', 176, 13);
    isle(184, 190, 20, 1);
    B.rect(189, 20, 190, 20, 'U');
    isle(193, 222, 13, 1);
    B.add('fanbot', 200, 9);
    B.add('met', 206, 12);
    B.add('flyer', 212, 7);
    B.add('h', 216, 12);
    isle(226, 240);
    B.add('met', 232);
    B.add('fanbot', 238, 18);
    // gap 241-243
    isle(244, 275);
    B.add('fanbot', 254, 18);
    B.add('E', 262);
    B.add('flyer', 268, 14);
    bossRoom(B, DOOR_COL, 'wind');
  },

  earth(B) {
    B.ground(0, 18);
    B.add('start', 3);
    B.add('met', 12);
    // crumbling bridge over a bottomless pit
    B.rect(19, F, 30, F, 'C');
    B.ground(31, 54);
    B.add('rockfall', 36, F, { period: 110, phase: 0 });
    B.add('rockfall', 44, F, { period: 110, phase: 55 });
    B.add('mole', 40);
    B.add('h', 52);
    B.rect(46, F, 49, F + 1, 'Q'); // quicksand
    // --- canyon wall: stone steps up under falling rocks, drop down the mine shaft
    B.ground(55, 71);
    B.rect(56, 20, 57, 20, '=');
    B.rect(59, 18, 60, 18, '=');
    B.rect(62, 16, 63, 16, '=');
    B.rect(65, 14, 66, 14, '=');
    B.rect(68, 12, 69, 12, '=');
    B.add('rockfall', 59, 18, { period: 120, phase: 0 });
    B.add('rockfall', 65, 14, { period: 120, phase: 60 });
    B.pillar(71, 92, 10);
    B.add('met', 76, 9);
    B.add('hopper', 82, 9);
    B.add('flyer', 86, 4);
    B.cave(87, 10, 89, 27); // mine shaft
    B.ground(93, 147);
    B.pit(93, 118);
    // --- mine: crumbling floors over the abyss
    B.cave(80, 28, 125, 35);
    B.add('met', 95, 35);
    B.rect(98, 36, 105, 36, 'C');
    B.rect(98, 37, 105, 37, 'b');
    B.rect(98, 38, 105, 39, 'X');
    B.add('mole', 109, 35);
    B.add('flyer', 113, 31);
    B.add('h', 118, 35);
    B.rect(112, 36, 115, 37, 'Q');
    B.shaft(122, F, 35);
    B.add('cp', 128);
    B.rect(130, F, 135, F, 'C');
    B.rect(130, F + 1, 135, LEVEL_H - 1, '.');
    B.add('flyer', 138, 15);
    B.add('met', 142);
    // --- two lifts up to the mesa, falling rocks on top
    B.ground(148, 200);
    B.add('plat', 150, 20, { x1: 150, y1: 12, speed: 0.7 });
    B.pillar(153, 155, 12);
    B.add('plat', 158, 12, { x1: 158, y1: 6, speed: 0.7 });
    B.pillar(161, 181, 5);
    B.add('rockfall', 166, 5, { period: 100, phase: 0 });
    B.add('hopper', 170, 4);
    B.add('rockfall', 174, 5, { period: 100, phase: 50 });
    B.add('met', 178, 4);
    B.add('cp', 184);
    B.add('rockfall', 188, F, { period: 90, phase: 0 });
    B.add('mole', 192);
    B.add('hopper', 196);
    // crumbling bridge over a pit
    B.rect(201, F, 210, F, 'C');
    B.ground(211, 230);
    B.rect(218, 20, 218, 21, '=');
    B.add('turret', 218, 19);
    B.add('flyer', 225, 15);
    // crumbling stepping stones
    B.rect(233, 20, 234, 20, 'C');
    B.rect(237, 18, 238, 18, 'C');
    B.rect(241, 19, 242, 19, '=');
    B.ground(245, 275);
    B.add('rockfall', 250, F, { period: 90, phase: 0 });
    B.add('mole', 254);
    B.add('rockfall', 258, F, { period: 90, phase: 45 });
    B.rect(260, F, 263, F + 1, 'Q');
    B.add('E', 265);
    B.add('flyer', 270, 15);
    bossRoom(B, DOOR_COL, 'earth');
  },
};

function buildStage(key) {
  const B = makeBuilder();
  LAYOUTS[key](B);
  const map = B.map;
  // any column that is open at the bottom of the level is a bottomless pit: put an abyss under it
  for (let x = 0; x < LEVEL_W; x++) {
    if (map[LEVEL_H - 1][x] !== '.') continue;
    let top = LEVEL_H - 1;
    while (top > 0 && map[top - 1][x] === '.') top--;
    for (let y = Math.max(top + 2, FLOOR + 2); y < LEVEL_H; y++) map[y][x] = 'X';
  }
  const st = STAGES[key];
  const spot = e => ({ x: e.x, y: e.y });
  const start = B.ents.find(e => e.type === 'start');
  return {
    key,
    theme: st.theme,
    LW: LEVEL_W,
    LH: LEVEL_H,
    map,
    orig: map.map(r => r.slice()),
    ents: B.ents,
    doorCol: DOOR_COL,
    start: start ? spot(start) : { x: 3, y: FLOOR - 1 },
    cps: B.ents
      .filter(e => e.type === 'cp')
      .map(spot)
      .sort((a, b) => a.x - b.x),
  };
}
