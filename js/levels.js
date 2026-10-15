'use strict';
// Stage layouts. Each stage is 200x26 tiles; floor top is row 22, the boss room is the last 24 columns.
// Tiles: # ground, = block, I ice (slippery), C crumbling block, ^ spikes, ~ lava, H ladder, D boss door.
// Hazards: saw, jet (fire), icicle, rockfall, zap (electric beam from a ceiling emitter down to row y1).

const LEVEL_H = 26, FLOOR = 22, LEVEL_W = 200, DOOR_COL = 176;

const STAGES = {
  cut: { name: 'CUTMAN', title: 'MANUSIA GUNTING', theme: 'cut', music: 'cut', ambient: 'dust', color: '#f87858' },
  fire: { name: 'FIREMAN', title: 'MANUSIA API', theme: 'fire', music: 'fire', ambient: 'embers', color: '#f8a800' },
  elec: { name: 'ELECMAN', title: 'MANUSIA LISTRIK', theme: 'elec', music: 'elec', ambient: 'rain', color: '#f8e030' },
  snow: { name: 'SNOWWOMAN', title: 'WANITA ES', theme: 'snow', music: 'snow', ambient: 'snow', color: '#a8e8fc' },
  earth: { name: 'EARTHWOMAN', title: 'WANITA TANAH & BATU', theme: 'earth', music: 'earth', ambient: 'dust', color: '#c8a060' },
};
const STAGE_ORDER = ['cut', 'fire', 'elec', 'snow', 'earth'];

const ENEMY_COLORS = {
  cut: { a: '#f8b800', c: '#c87800', fly: '#9020c8', fly2: '#e070f8', hop: '#00a800', hop2: '#58d854', tur: '#686878' },
  fire: { a: '#f85818', c: '#a82808', fly: '#e88800', fly2: '#f8e050', hop: '#a83818', hop2: '#f87858', tur: '#5a3a3a' },
  snow: { a: '#e8f4fc', c: '#88b0d8', fly: '#3878d8', fly2: '#a8d8fc', hop: '#384868', hop2: '#d8e8fc', tur: '#58789a' },
  earth: { a: '#8ab838', c: '#4a7a20', fly: '#a8682a', fly2: '#e8b868', hop: '#7a5a3a', hop2: '#b89870', tur: '#6a6458' },
  elec: { a: '#f8d800', c: '#a88800', fly: '#2838a8', fly2: '#f8f058', hop: '#303848', hop2: '#f8d800', tur: '#4a4a58' },
};

function makeBuilder() {
  const map = Array.from({ length: LEVEL_H }, () => Array(LEVEL_W).fill('.'));
  const ents = [];
  const B = {
    map, ents,
    rect(x0, y0, x1, y1, c) {
      for (let y = Math.max(0, y0); y <= Math.min(LEVEL_H - 1, y1); y++)
        for (let x = Math.max(0, x0); x <= Math.min(LEVEL_W - 1, x1); x++) map[y][x] = c;
    },
    ground(x0, x1, top = FLOOR) { B.rect(x0, top, x1, LEVEL_H - 1, '#'); },
    ladder(x, y0, y1) { B.rect(x, y0, x, y1, 'H'); },
    spikes(x0, x1, y = FLOOR) { B.rect(x0, y, x1, y, '^'); },
    lava(x0, x1) { B.rect(x0, FLOOR + 1, x1, FLOOR + 1, '~'); B.rect(x0, FLOOR + 2, x1, LEVEL_H - 1, '#'); },
    add(type, x, y = FLOOR - 1, o = {}) { ents.push(Object.assign({ type, x, y }, o)); },
  };
  return B;
}

function bossRoom(B, dc) {
  B.ground(dc, dc + 23);
  B.rect(dc, 0, dc, 18, '=');
  B.rect(dc, 19, dc, 21, 'D');
  B.rect(dc + 23, 0, dc + 23, 21, '=');
  B.rect(dc + 1, 0, dc + 22, 12, '=');
}

const LAYOUTS = {
  cut(B) {
    B.ground(0, 20); B.add('start', 3); B.add('met', 12); B.add('flyer', 19, 16);
    // pit 21-23
    B.ground(24, 40); B.add('saw', 28, 21, { x1: 37, y1: 21, speed: 1.2 }); B.add('met', 39); B.add('h', 33);
    // spike pit crossed on a moving platform
    B.ground(41, 48); B.spikes(42, 47); B.add('plat', 42, 20, { x1: 46, y1: 20, speed: 0.8 });
    B.ground(49, 64); B.add('hopper', 52);
    B.rect(56, 14, 64, 25, '#'); B.ladder(55, 14, 21); B.add('met', 60, 13); B.add('turret', 63, 13);
    // floating blocks over a bottomless pit, with a vertical saw
    B.rect(67, 15, 68, 15, '='); B.rect(71, 16, 72, 16, '='); B.rect(75, 15, 76, 15, '=');
    B.add('saw', 73.5, 12, { x1: 73.5, y1: 19, speed: 1.0 }); B.add('flyer', 72, 10);
    B.ground(79, 100); B.add('cp', 82);
    B.add('met', 86); B.add('saw', 90, 21, { x1: 97, y1: 21, speed: 1.5 }); B.add('flyer', 96, 15);
    // pit 101-103, stairs, spike floor with platform
    B.ground(104, 107); B.rect(108, 20, 110, 25, '#'); B.rect(111, 18, 113, 25, '#'); B.add('L', 112, 17);
    B.ground(114, 119); B.spikes(114, 119); B.add('plat', 114, 18, { x1: 118, y1: 18, speed: 0.9 });
    B.rect(120, 18, 122, 25, '#');
    B.ground(123, 175); B.add('hopper', 128); B.add('hopper', 134); B.add('h', 131);
    B.rect(140, 20, 140, 21, '='); B.add('turret', 140, 19);
    // low corridor: slide under the saw
    B.rect(146, 0, 158, 17, '='); B.add('saw', 147, 20, { x1: 157, y1: 20, speed: 0.9 }); B.add('met', 160);
    B.add('E', 165); B.add('met', 168); B.add('flyer', 172, 15);
    bossRoom(B, DOOR_COL);
  },

  fire(B) {
    B.ground(0, 18); B.add('start', 3); B.add('met', 12);
    B.lava(19, 21);
    B.ground(22, 40); B.add('jet', 28, FLOOR, { phase: 0 }); B.add('jet', 33, FLOOR, { phase: 75 }); B.add('flyer', 38, 15);
    // lava lake with stepping blocks
    B.lava(41, 52); B.rect(43, 20, 44, 20, '='); B.rect(47, 19, 48, 19, '='); B.rect(51, 20, 51, 20, '='); B.add('flyer', 50, 13);
    B.ground(53, 59); B.rect(60, 17, 70, 25, '#'); B.ladder(59, 17, 21);
    B.add('jet', 64, 17, { phase: 40 }); B.add('met', 68, 16); B.add('L', 66, 16);
    B.ground(71, 91); B.add('hopper', 76); B.add('jet', 80, FLOOR, { phase: 0 }); B.add('jet', 84, FLOOR, { phase: 50 }); B.add('cp', 88); B.add('h', 82);
    // lava lake crossed on a moving platform
    B.lava(92, 104); B.add('plat', 92, 20, { x1: 102, y1: 20, speed: 1 }); B.add('flyer', 99, 14);
    B.ground(105, 135); B.rect(112, 20, 112, 21, '='); B.add('turret', 112, 19); B.add('met', 118); B.add('jet', 121, FLOOR, { phase: 30 });
    // tunnel with a fire jet that fills it
    B.rect(124, 0, 132, 18, '='); B.add('jet', 128, FLOOR, { phase: 0 });
    B.lava(136, 138);
    B.ground(139, 175); B.add('E', 145); B.add('met', 150); B.add('flyer', 156, 15); B.add('jet', 162, FLOOR, { phase: 60 }); B.add('hopper', 168);
    bossRoom(B, DOOR_COL);
  },

  elec(B) {
    B.ground(0, 18); B.add('start', 3); B.add('met', 12);
    // two electric gates under a ceiling: run through between pulses
    B.ground(19, 40); B.rect(22, 12, 34, 13, '=');
    B.add('zap', 25, 14, { y1: 21, phase: 0 }); B.add('zap', 31, 14, { y1: 21, phase: 70 }); B.add('h', 28); B.add('flyer', 38, 15);
    // pit 41-43
    B.ground(44, 56); B.add('hopper', 49); B.rect(54, 20, 56, 25, '#');
    // spike pit crossed on a moving platform that rides through an electric beam
    B.ground(57, 68); B.spikes(57, 68); B.add('plat', 57, 19, { x1: 66, y1: 19, speed: 0.9 });
    B.rect(61, 9, 63, 10, '='); B.add('zap', 62, 11, { y1: 21, phase: 30 });
    B.ground(69, 92); B.add('cp', 72); B.add('met', 78); B.rect(82, 20, 82, 21, '='); B.add('turret', 82, 19); B.add('flyer', 88, 14);
    // floating blocks over a bottomless pit
    B.rect(95, 20, 96, 20, '='); B.rect(99, 18, 100, 18, '='); B.rect(103, 20, 104, 20, '='); B.add('flyer', 100, 11);
    B.ground(107, 175); B.add('hopper', 112);
    B.rect(116, 18, 126, 25, '#'); B.ladder(115, 18, 21); B.add('met', 120, 17); B.add('L', 124, 17);
    // low tunnel with three beams pulsing in sequence
    B.rect(132, 0, 148, 17, '=');
    B.add('zap', 136, 18, { y1: 21, phase: 0 }); B.add('zap', 141, 18, { y1: 21, phase: 50 }); B.add('zap', 146, 18, { y1: 21, phase: 100 });
    B.add('E', 152); B.add('hopper', 156); B.rect(162, 20, 162, 21, '='); B.add('turret', 162, 19); B.add('met', 168); B.add('flyer', 172, 15);
    bossRoom(B, DOOR_COL);
  },

  snow(B) {
    B.ground(0, 18); B.add('start', 3); B.add('met', 12);
    B.rect(19, FLOOR, 33, LEVEL_H - 1, 'I'); B.ground(34, 35);
    B.rect(24, 13, 32, 15, '='); B.add('icicle', 25, 16); B.add('icicle', 28, 16); B.add('icicle', 31, 16);
    // pit 36-38
    B.ground(39, 55); B.add('hopper', 45); B.add('flyer', 52, 15); B.add('h', 49);
    B.rect(56, 20, 58, 25, '#'); B.rect(59, 18, 61, 25, '#');
    // ice blocks over a bottomless pit
    B.rect(64, 18, 65, 18, '='); B.rect(68, 17, 69, 17, '='); B.rect(72, 18, 73, 18, '='); B.add('flyer', 70, 12);
    B.ground(76, 85); B.add('cp', 80);
    B.rect(86, 15, 95, 25, '#'); B.ladder(85, 15, 21); B.add('met', 92, 14); B.add('L', 89, 14);
    // long icy slide under icicles
    B.rect(96, FLOOR, 112, LEVEL_H - 1, 'I'); B.rect(100, 12, 110, 14, '=');
    B.add('icicle', 102, 15); B.add('icicle', 105, 15); B.add('icicle', 108, 15); B.add('hopper', 107);
    B.ground(113, 115); B.rect(114, 20, 114, 21, '='); B.add('turret', 114, 19);
    // pit 116-118
    B.ground(119, 175); B.add('flyer', 125, 15); B.add('met', 130); B.add('flyer', 133, 15);
    B.rect(138, 20, 140, 21, '='); B.add('met', 140, 19);
    B.rect(150, FLOOR, 165, LEVEL_H - 1, 'I'); B.rect(153, 13, 162, 15, '='); B.add('icicle', 155, 16); B.add('icicle', 159, 16);
    B.add('E', 160); B.add('met', 168); B.add('h', 171);
    bossRoom(B, DOOR_COL);
  },

  earth(B) {
    B.ground(0, 18); B.add('start', 3); B.add('met', 12);
    // crumbling bridge over a bottomless pit
    B.rect(19, FLOOR, 30, FLOOR, 'C');
    B.ground(31, 51); B.add('rockfall', 36, 0, { period: 110, phase: 0 }); B.add('rockfall', 44, 0, { period: 110, phase: 55 }); B.add('hopper', 40);
    B.rect(52, 15, 60, 25, '#'); B.ladder(51, 15, 21); B.add('met', 56, 14); B.add('rockfall', 58, 0, { period: 130, phase: 20 });
    // moving platform across a pit
    B.add('plat', 62, 16, { x1: 70, y1: 16, speed: 0.9 }); B.add('flyer', 68, 10);
    B.rect(74, 18, 90, 25, '#'); B.add('cp', 78); B.add('h', 84); B.add('met', 87, 17); B.add('L', 89, 17);
    B.ground(91, 110); B.add('rockfall', 96, 0, { period: 100, phase: 0 }); B.add('rockfall', 103, 0, { period: 100, phase: 50 }); B.add('flyer', 100, 15);
    B.rect(108, 20, 108, 21, '='); B.add('turret', 108, 19);
    B.rect(111, FLOOR, 118, FLOOR, 'C'); B.add('flyer', 115, 15);
    B.ground(119, 126);
    // crumbling stepping stones
    B.rect(128, 20, 129, 20, 'C'); B.rect(132, 18, 133, 18, 'C'); B.rect(136, 19, 137, 19, '=');
    B.ground(140, 175); B.add('rockfall', 146, 0, { period: 90, phase: 0 }); B.add('met', 150); B.add('hopper', 155);
    B.add('rockfall', 158, 0, { period: 90, phase: 45 }); B.add('met', 162); B.add('E', 166); B.add('flyer', 170, 15);
    bossRoom(B, DOOR_COL);
  },
};

function buildStage(key) {
  const B = makeBuilder();
  LAYOUTS[key](B);
  const st = STAGES[key];
  const start = B.ents.find(e => e.type === 'start');
  const cp = B.ents.find(e => e.type === 'cp');
  return {
    key, theme: st.theme, LW: LEVEL_W, LH: LEVEL_H, map: B.map, orig: B.map.map(r => r.slice()),
    ents: B.ents, doorCol: DOOR_COL, startCol: start ? start.x : 3, cpCol: cp ? cp.x : 0,
  };
}
