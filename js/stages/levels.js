'use strict';
// Stage layouts. Each stage is 300x44 tiles and has a route of its own (towers, caves, shafts, sky routes); the
// surface floor top is row 22, where the stage starts and the boss room (the last 24 columns) stands.
// Tiles: # ground, = block, I ice (slippery), C crumbling block, ^ spikes, ~ lava, H ladder, D boss door,
//        b cave/backdrop wall (not solid, drawn dark), X abyss (falling into it is death),
//        < > conveyor belt, Q quicksand (you sink; jump out before your head goes under),
//        U updraft pad (launches you about 8 tiles up), W water, Z sealed wall (see B.seal).
// Every stage hides a secret room behind a sealed wall that only one special weapon (never the stage's own) breaks,
// with an armor inside (B.secret); each armor found makes the HP 1x thicker.
// Hazards: saw, jet (fire), icicle, rockfall, zap (electric beam from a ceiling emitter down to row y1),
//          bubble (magma leaping out of lava at row y), eblock (energy block idx of n, solid in turn),
//          wind (blizzard gusts over columns x..x1 pushing toward dir), crusher (a press slamming from row y down to
//          the floor at row y1, w tiles wide), rising (lava or acid rising up a shaft from row y to row y1 once the
//          player starts to climb; see actors.js).
// Each stage has its own enemy on top of the common ones: blader (cut), totem (fire), watcher (elec),
// snowman (snow), mole (earth), fanbot (wind).
// Rules of thumb for layouts: a jump clears 3 empty tiles (but only 2 tiles of spikes, which kill on any touch)
// and rises at most 2 tiles (5 under water); an updraft pad rises about 8 tiles and carries you about 5 across; a
// slide passes under a gap 1 tile high; ladders are 1 tile wide. Check every stage with the reachability test
// (every checkpoint and the boss door reachable from the start).

const LEVEL_H = 44,
  FLOOR = 22,
  LEVEL_W = 300,
  DOOR_COL = 276;

// STAGES[key]: name (the boss), place (where the stage is: shown in the stage select), intro (a line introducing the
// boss: shown on the intro screen and when the boss appears), theme, music, ambient, color
const STAGES = {
  cut: {
    name: 'SNIPTOR',
    place: 'PABRIK GERGAJI',
    intro: 'PISAU PUTARNYA MEMOTONG APA SAJA',
    theme: 'cut',
    music: 'cut',
    ambient: 'dust',
    color: '#f87858',
  },
  fire: {
    name: 'MAGMARON',
    place: 'GUNUNG BERAPI',
    intro: 'PENJAGA KAWAH YANG MEMBARA',
    theme: 'fire',
    music: 'fire',
    ambient: 'embers',
    color: '#f8a800',
  },
  elec: {
    name: 'VOLTRAX',
    place: 'PEMBANGKIT LISTRIK',
    intro: 'MEMANGGIL PETIR DARI BADAI',
    theme: 'elec',
    music: 'elec',
    ambient: 'rain',
    color: '#f8e030',
  },
  snow: {
    name: 'GLACIELLE',
    place: 'GUNUNG ES',
    intro: 'MEMBEKUKAN SEGALA YANG MENDEKAT',
    theme: 'snow',
    music: 'snow',
    ambient: 'snow',
    color: '#a8e8fc',
  },
  earth: {
    name: 'TERRALYN',
    place: 'TAMBANG BATU',
    intro: 'MENGGUNCANG BUMI DENGAN TINJUNYA',
    theme: 'earth',
    music: 'earth',
    ambient: 'dust',
    color: '#c8a060',
  },
  wind: {
    name: 'WINDERWOMEN',
    place: 'BENTENG LANGIT',
    intro: 'MENUNGGANGI ANGIN DI ATAS AWAN',
    theme: 'wind',
    music: 'wind',
    ambient: 'breeze',
    color: '#78f8c8',
  },
};
// Continents group the stages: each holds six bosses and appears as a landmass on the world map. A continent
// opens once every boss of the one before it is beaten. bossHp: how many times the 28 HP the boss bar shows its
// bosses have (each segment of the bar is that many HP). Stages, bosses and weapons all share one key (a boss's
// weapon is weapons[stage key]), so a new continent only needs its six stages registered in every table; see
// docs/MENAMBAH-KONTEN.md. validateContent() in main.js warns in the console about anything missing.
const CONTINENTS = [
  {
    key: 'azura',
    name: 'AZURA',
    color: '#58c878',
    bossHp: 3,
    stages: ['cut', 'fire', 'elec', 'snow', 'earth', 'wind'],
  },
  {
    key: 'vespera',
    name: 'VESPERA',
    color: '#a878d8',
    bossHp: 5,
    stages: ['hydro', 'toxic', 'shadow', 'sonic', 'light', 'time'],
  },
];
const STAGE_ORDER = CONTINENTS.flatMap(c => c.stages);
const continentOf = key =>
  Math.max(
    0,
    CONTINENTS.findIndex(c => c.stages.includes(key)),
  );

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
    // a solid block, and a hollow (the backdrop wall of a room or a tunnel) carved out of one
    solid(x0, y0, x1, y1) {
      B.rect(x0, y0, x1, y1, '#');
    },
    // a one-tile ledge of blocks (or of another tile: ice, crumbling, a belt)
    ledge(x0, x1, y, c = '=') {
      B.rect(x0, y, x1, y, c);
    },
    // a conveyor belt pushing toward dir (-1 left, 1 right)
    belt(x0, x1, y, dir) {
      B.rect(x0, y, x1, y, dir < 0 ? '<' : '>');
    },
    // a sealed wall h tiles high standing on row y (its bottom tile), that only `weapon` breaks
    seal(x, y, weapon, h = 3, w = 1, room = null) {
      B.rect(x, y - h + 1, x + w - 1, y, 'Z');
      B.add('seal', x, y, { weapon, h, w, room });
    },
    // a secret room (x0..x1, y0..y1, its floor the row under y1) behind a sealed wall in column sx that only `weapon`
    // breaks, with an armor in column ax; the room looks like solid rock until the wall breaks
    secret(x0, y0, x1, y1, sx, weapon, ax) {
      B.cave(x0, y0, x1, y1);
      B.seal(sx, y1, weapon, 3, 1, [x0, y0, x1, y1]);
      B.add('armor', ax, y1);
    },
    // fill the open cells of a rectangle with water (W); ladders and walls stay
    flood(x0, y0, x1, y1) {
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) if (map[y][x] === 'b' || map[y][x] === '.') map[y][x] = 'W';
    },
  };
  return B;
}

// the boss room, with a themed back wall (painted by ROOM_ART) and a gimmick of its own
// boss-room gimmicks registered by continent files: BOSS_ROOMS[theme](B, dc)
const BOSS_ROOMS = {};
function bossRoom(B, dc, theme) {
  B.ground(dc, dc + 23);
  B.rect(dc, 0, dc, 18, '=');
  B.rect(dc, 19, dc, 21, 'D');
  B.rect(dc + 23, 0, dc + 23, 21, '=');
  B.rect(dc + 1, 0, dc + 22, 12, '=');
  B.cave(dc + 1, 13, dc + 22, 21);
  if (BOSS_ROOMS[theme]) BOSS_ROOMS[theme](B, dc);
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
  // Sniptor's sawmill: presses over a belt, a tower of saws, catwalks over a spike floor, a shaft of sweeping saws
  // down into the belt tunnels, and a saw gauntlet back on the surface
  cut(B) {
    // --- the yard
    B.ground(0, 23);
    B.add('start', 3);
    B.add('met', 14);
    B.add('blader', 20, 15);
    // --- the press hall: the belt carries you under four presses slamming one after another
    B.ground(24, 61);
    B.solid(24, 8, 61, 12);
    B.cave(25, 13, 60, 21);
    B.solid(24, 13, 24, 17);
    B.solid(61, 13, 61, 17);
    B.belt(26, 59, F, 1);
    [31, 38, 45, 52].forEach((x, i) => B.add('crusher', x, 13, { y1: F, phase: i * 46 }));
    B.add('blader', 42, 16);
    B.add('h', 58);
    // --- the saw tower: up four floors by the ladders at alternate ends, a saw sweeping every floor
    B.ground(62, 99);
    B.solid(64, 5, 99, 21);
    B.cave(65, 6, 98, 21);
    B.cave(64, 18, 64, 21); // the way in
    for (const [y, lx] of [
      [18, 97],
      [14, 67],
      [10, 97],
    ]) {
      B.ledge(65, 98, y, '#');
      B.ladder(lx, y, y + 3);
    }
    B.ladder(97, 18, 21);
    B.ladder(67, 5, 9); // up through the roof
    B.add('saw', 70, 17, { x1: 94, y1: 17, speed: 1.3 });
    B.add('saw', 94, 13, { x1: 70, y1: 13, speed: 1.5 });
    B.add('met', 82, 13);
    B.add('saw', 70, 9, { x1: 94, y1: 9, speed: 1.7 });
    B.add('turret', 84, 4);
    B.add('cp', 93, 4);
    // --- catwalks over the spike floor, saws rising and falling in the gaps
    B.ground(100, 120);
    B.spikes(100, 120);
    B.ledge(102, 105, 5);
    B.ledge(109, 112, 5);
    B.ledge(116, 119, 5);
    B.add('saw', 107, 1, { x1: 107, y1: 9, speed: 1.2 });
    B.add('saw', 114, 9, { x1: 114, y1: 1, speed: 1.4 });
    B.add('flyer', 111, 0);
    // --- the sawmill shaft: drop from ledge to ledge while the saws sweep across
    B.solid(121, 6, 139, 43);
    B.cave(123, 6, 137, 37);
    for (const [y, x0, x1] of [
      [12, 123, 129],
      [18, 131, 137],
      [24, 123, 129],
      [30, 131, 137],
    ])
      B.ledge(x0, x1, y, '#');
    B.add('saw', 124, 11, { x1: 136, y1: 11, speed: 1.3 });
    B.add('saw', 136, 17, { x1: 124, y1: 17, speed: 1.5 });
    B.add('saw', 124, 23, { x1: 136, y1: 23, speed: 1.7 });
    B.add('saw', 136, 29, { x1: 124, y1: 29, speed: 1.9 });
    B.add('h', 125, 37);
    // --- the belt tunnels: belts against you and with you, spike pits, a press, a crawlway (the ground over them is a
    // spike field)
    B.solid(138, 22, 210, 43);
    B.spikes(140, 201);
    B.cave(138, 32, 140, 37);
    B.cave(141, 30, 205, 37);
    B.belt(141, 150, 38, -1);
    B.spikes(151, 152, 38);
    B.belt(153, 165, 38, 1);
    B.add('crusher', 159, 30, { y1: 38, phase: 30 });
    B.spikes(166, 167, 38);
    B.belt(168, 182, 38, -1);
    B.solid(171, 30, 178, 36); // the crawlway: slide under it
    B.add('blader', 160, 32);
    B.add('met', 186, 37);
    B.spikes(189, 190, 38);
    B.ledge(194, 196, 36);
    B.add('blader', 197, 31);
    B.add('L', 199, 37);
    B.shaft(203, F, 37);
    // --- the saw gauntlet: saws running along the floor, a crawlway, then the last press
    B.ground(206, 275);
    B.add('cp', 208);
    B.add('saw', 214, 21, { x1: 224, y1: 21, speed: 1.2 });
    B.add('saw', 238, 21, { x1: 228, y1: 21, speed: 1.6 });
    B.add('met', 233);
    B.rect(242, 9, 251, 20, '=');
    B.add('turret', 255, F - 1);
    B.solid(258, 10, 270, 12);
    B.cave(258, 13, 270, 21);
    B.belt(259, 269, F, -1);
    B.add('crusher', 263, 13, { y1: F, phase: 20 });
    B.add('E', 260);
    B.add('blader', 272, 15);
    // --- the secret room: behind a gate of gears at the end of the belt tunnels (Time Stopper)
    B.secret(207, 34, 212, 37, 206, 'time', 210);
    bossRoom(B, DOOR_COL, 'cut');
  },

  // Magmaron's volcano: basalt columns up out of a lava field to the crater, down the crater into the magma
  // chamber, up the vent with the lava rising behind you, and down the outer slopes to a lava river
  fire(B) {
    // --- the black-sand beach
    B.ground(0, 25);
    B.add('start', 3);
    B.add('met', 12);
    B.lava(16, 17);
    B.add('bubble', 16, F + 1, { phase: 0 });
    B.add('totem', 22);
    // --- basalt columns rising out of the lava field, each two higher than the last
    B.lava(26, 55);
    [28, 32, 36, 40, 44, 48, 52].forEach((x, i) => B.pillar(x, x + 1, 20 - i * 2));
    B.add('jet', 36, 16, { phase: 0 });
    B.add('jet', 44, 12, { phase: 60 });
    [30, 34, 38, 42, 46, 50].forEach((x, i) => B.add('bubble', x, F + 1, { phase: i * 23 }));
    B.add('flyer', 42, 5);
    // --- the crater rim (an energy tank on the far side), then down the crater
    B.solid(56, 8, 63, 43);
    B.solid(73, 8, 80, 43);
    B.solid(81, 2, 120, 43); // the summit: a wall of rock
    B.add('jet', 59, 8, { phase: 30 });
    B.add('jet', 77, 8, { phase: 100 });
    B.add('E', 79, 7);
    B.cave(64, 8, 72, 29); // the crater
    B.ledge(64, 66, 14, '#');
    B.add('jet', 65, 14, { phase: 0 });
    B.ledge(70, 72, 20, '#');
    B.ledge(64, 66, 26, '#');
    // --- the magma chamber: islands and rafts over a lava floor
    B.cave(64, 24, 137, 37);
    B.rect(64, 38, 137, 38, '~');
    B.solid(64, 39, 137, 43);
    B.solid(64, 34, 72, 38); // where you land
    B.add('cp', 68, 33);
    B.add('plat', 74, 33, { x1: 84, y1: 33, speed: 1 });
    B.add('bubble', 79, 38, { period: 120 });
    B.solid(87, 32, 90, 38);
    B.add('totem', 89, 31);
    B.pillar(94, 95, 33);
    B.pillar(99, 100, 31);
    B.pillar(104, 105, 33);
    B.add('bubble', 97, 38, { period: 110, phase: 30 });
    B.add('bubble', 102, 38, { period: 110, phase: 80 });
    B.add('plat', 109, 36, { x1: 109, y1: 30, speed: 0.7 });
    B.solid(113, 31, 120, 38);
    B.add('jet', 116, 31, { phase: 50 });
    B.add('flyer', 118, 26);
    B.add('hopper', 119, 30);
    B.solid(124, 34, 129, 38);
    B.add('cp', 126, 33);
    B.add('plat', 131, 34, { x1: 136, y1: 34, speed: 1.1 });
    // --- the vent: climb it fast, the lava rises behind you
    B.solid(138, 4, 151, 43);
    B.cave(138, 30, 139, 36);
    B.cave(140, 6, 147, 36);
    B.ledge(140, 147, 37, '#');
    for (const [y, lx] of [
      [33, 146],
      [29, 141],
      [25, 146],
      [21, 141],
      [17, 146],
      [13, 141],
      [9, 146],
    ]) {
      B.ledge(140, 147, y, '#');
      B.ladder(lx, y, y + 3);
    }
    B.ladder(146, 6, 8);
    B.cave(148, 5, 151, 8); // out to the slopes
    B.add('rising', 140, 37, { x1: 147, y1: 5, speed: 0.5, delay: 40 });
    B.add('flyer', 143, 15);
    // --- the outer slopes: basalt steps down over the lava streams, a crumbling ledge between some
    B.lava(152, 214);
    B.add('cp', 150, 8);
    for (const [x, y] of [
      [152, 9],
      [159, 11],
      [166, 13],
      [173, 15],
      [180, 17],
      [187, 19],
      [194, 20],
    ])
      B.pillar(x, x + 3, y);
    B.ledge(156, 158, 10, 'C');
    B.ledge(170, 172, 14, 'C');
    B.ledge(184, 186, 18, 'C');
    [157, 164, 171, 178, 185, 192].forEach((x, i) => B.add('bubble', x, F + 1, { phase: i * 31 }));
    B.add('flyer', 175, 8);
    B.add('totem', 196, 19);
    B.pillar(199, 200, 20);
    B.pillar(204, 205, 20);
    B.pillar(209, 210, 20);
    B.add('bubble', 202, F + 1, { phase: 10 });
    B.add('bubble', 207, F + 1, { phase: 70 });
    // --- the lava river: two rafts across, magma leaping under them
    B.ground(215, 220);
    B.add('h', 217);
    B.lava(221, 245);
    B.add('plat', 222, 20, { x1: 232, y1: 20, speed: 1 });
    B.add('plat', 234, 19, { x1: 243, y1: 19, speed: 1.2 });
    B.add('bubble', 226, F + 1, { phase: 0 });
    B.add('bubble', 238, F + 1, { phase: 60 });
    B.add('flyer', 233, 13);
    // --- the last stretch: three jets in a row and a totem
    B.ground(246, 275);
    [252, 258, 264].forEach((x, i) => B.add('jet', x, F, { phase: i * 40 }));
    B.add('hopper', 255);
    B.add('totem', 269);
    // --- the secret room: in the crater wall where you land in the magma chamber, behind magma rock (Frost Shard)
    B.secret(58, 30, 62, 33, 63, 'snow', 60);
    bossRoom(B, DOOR_COL, 'fire');
  },

  // Voltrax's power plant in the storm: a hall of beams firing in a wave, energy blocks over the abyss, the
  // transformer tower, cable cars across the chasm, and the substation's energy blocks over a live floor
  elec(B) {
    // --- the gate
    B.ground(0, 18);
    B.add('start', 3);
    B.add('met', 12);
    // --- the beam hall: five beams firing one after another down the hall
    B.ground(19, 50);
    B.solid(19, 10, 50, 13);
    B.cave(20, 14, 50, 21);
    B.solid(19, 14, 19, 17);
    [24, 29, 34, 39, 44].forEach((x, i) => B.add('zap', x, 14, { y1: 21, phase: i * 30 }));
    B.add('watcher', 47, 16);
    B.add('h', 49);
    // --- energy blocks over the abyss: two runs of five, a pillar between
    [
      [53, 20],
      [57, 19],
      [61, 18],
      [65, 19],
      [69, 20],
    ].forEach(([x, y], i) => B.add('eblock', x, y, { idx: i, n: 5 }));
    B.pillar(72, 74, 20);
    B.add('flyer', 73, 12);
    [
      [77, 19],
      [81, 17],
      [85, 16],
      [89, 18],
      [93, 20],
    ].forEach(([x, y], i) => B.add('eblock', x, y, { idx: i, n: 5 }));
    B.add('watcher', 86, 10);
    // --- the transformer tower: three floors, a beam across each, ladders at alternate ends
    B.ground(96, 125);
    B.solid(98, 4, 123, 21);
    B.cave(99, 5, 122, 21);
    B.cave(98, 18, 98, 21);
    for (const [y, lx] of [
      [18, 121],
      [14, 100],
      [10, 121],
    ]) {
      B.ledge(99, 122, y, '#');
      B.ladder(lx, y, y + 3);
    }
    B.ladder(121, 18, 21);
    B.ladder(100, 4, 9);
    B.add('zap', 110, 19, { y1: 21, phase: 0 });
    B.add('zap', 106, 15, { y1: 17, phase: 50 });
    B.add('zap', 114, 15, { y1: 17, phase: 100 });
    B.add('met', 110, 13);
    B.add('zap', 110, 11, { y1: 13, phase: 75 });
    B.add('turret', 116, 9);
    B.add('cp', 104, 3);
    B.add('watcher', 114, 1);
    // --- cable cars across the chasm, flyers and watchers swooping at you
    B.add('plat', 125, 6, { x1: 143, y1: 6, speed: 1.1 });
    B.add('plat', 147, 8, { x1: 164, y1: 8, speed: 1.3 });
    B.add('plat', 168, 6, { x1: 182, y1: 6, speed: 1.2 });
    B.add('flyer', 140, 1);
    B.add('watcher', 158, 2);
    B.add('flyer', 172, 1);
    B.pillar(186, 189, 8);
    B.pillar(190, 191, 12);
    B.pillar(192, 193, 16);
    B.pillar(194, 195, 20);
    B.add('L', 187, 7);
    // --- the substation: energy blocks over a live floor, beams in between
    B.ground(196, 275);
    B.add('cp', 197);
    B.solid(200, 10, 234, 13);
    B.cave(201, 14, 233, 21);
    B.solid(200, 14, 200, 17);
    B.solid(234, 14, 234, 17);
    B.spikes(203, 231);
    [
      [203, 20],
      [207, 19],
      [211, 20],
    ].forEach(([x, y], i) => B.add('eblock', x, y, { idx: i, n: 3, step: 40 }));
    B.pillar(215, 216, 19);
    B.add('zap', 218, 14, { y1: 21, phase: 0 });
    [
      [220, 19],
      [224, 18],
      [228, 19],
    ].forEach(([x, y], i) => B.add('eblock', x, y, { idx: i, n: 3, step: 40 }));
    B.add('watcher', 222, 15);
    // --- the last yard: a belt between two beams, a turret
    B.belt(242, 254, F, -1);
    B.solid(240, 9, 256, 11);
    B.add('zap', 244, 12, { y1: 21, phase: 0 });
    B.add('zap', 252, 12, { y1: 21, phase: 75 });
    B.add('E', 258);
    B.solid(262, 20, 262, 21);
    B.add('turret', 262, 19);
    B.add('watcher', 268, 15);
    // --- the secret room: inside the pillar where the cable cars end, behind cracked stone (Rock Breaker)
    B.pillar(185, 185, 8);
    B.secret(186, 9, 188, 11, 189, 'earth', 187);
    bossRoom(B, DOOR_COL, 'elec');
  },

  // Glacielle's ice mountain: ice floes over a frozen chasm, the cliff in the blizzard, the summit ridge under
  // hanging icicles, the long ice slide down, and the ice cave under the glacier
  snow(B) {
    // --- the snowfield, icicles under the overhang
    B.ground(0, 24);
    B.add('start', 3);
    B.add('met', 11);
    B.ledge(7, 13, F, 'I');
    B.solid(16, 12, 24, 15);
    [17, 20, 23].forEach(x => B.add('icicle', x, 16));
    B.add('snowman', 22);
    // --- ice floes over the frozen chasm: they are slippery, so land with care
    for (const [x0, x1, y] of [
      [27, 29, 21],
      [33, 34, 20],
      [38, 40, 21],
      [44, 45, 19],
      [49, 51, 21],
      [55, 56, 20],
    ])
      B.ledge(x0, x1, y, 'I');
    B.add('flyer', 42, 12);
    B.add('flyer', 53, 13);
    // --- the cliff: up the steps in the blizzard (it blows you back toward the drop), the ladder to the summit
    B.ground(60, 66);
    B.pillar(67, 69, 20);
    B.pillar(70, 72, 18);
    B.pillar(73, 76, 16);
    B.ledge(73, 76, 16, 'I');
    B.pillar(77, 80, 14);
    B.add('snowman', 79, 13);
    B.ladder(81, 8, 13);
    B.pillar(82, 104, 8);
    B.pillar(81, 81, 14);
    B.add('wind', 60, F, { x1: 92, dir: -1, phase: 0 });
    B.add('cp', 86, 7);
    B.add('h', 90, 7);
    B.add('snowman', 100, 7);
    // --- the summit ridge: crumbling ice bridges, icicles under the rock arch
    B.ledge(105, 108, 8, 'C');
    B.pillar(109, 112, 8);
    B.ledge(113, 116, 8, 'C');
    B.pillar(117, 120, 8);
    B.solid(115, 2, 130, 3);
    [117, 120, 123, 126, 129].forEach(x => B.add('icicle', x, 4));
    B.pillar(124, 127, 7);
    B.ledge(128, 131, 7, 'C');
    B.pillar(132, 134, 8);
    B.add('flyer', 122, 0);
    // --- the ice slide: steps of ice all the way down, spikes on two of them, the wind at your back
    for (const [x0, y] of [
      [135, 9],
      [141, 11],
      [147, 13],
      [153, 15],
      [159, 17],
      [165, 19],
      [171, 21],
    ]) {
      B.pillar(x0, x0 + 5, y);
      B.ledge(x0, x0 + 5, y, 'I');
    }
    B.spikes(150, 151, 13);
    B.spikes(162, 163, 17);
    B.add('wind', 135, F, { x1: 180, dir: 1, phase: 60 });
    B.add('flyer', 158, 8);
    // --- under the glacier: down the shaft into the ice cave, over its crumbling floor, up the frozen waterfall
    B.ground(177, 275);
    B.add('snowman', 180);
    B.add('cp', 184);
    B.solid(192, 6, 234, 25);
    B.shaft(189, F, 36);
    B.cave(188, 26, 238, 36);
    [198, 202, 206, 214, 222].forEach(x => B.add('icicle', x, 26));
    B.ledge(196, 207, 37, 'C');
    B.rect(196, 38, 207, LEVEL_H - 1, '.');
    B.ledge(208, 214, 37, 'I');
    B.add('hopper', 212, 36);
    B.rect(215, 37, 221, LEVEL_H - 1, '.');
    B.ledge(217, 218, 35, 'I');
    B.ledge(222, 233, 37, 'I');
    B.add('snowman', 226, 36);
    B.add('L', 230, 36);
    B.shaft(236, F, 36);
    // --- the last stretch: ice underfoot, a turret on a block
    B.ledge(242, 252, F, 'I');
    B.add('snowman', 248);
    B.add('E', 256);
    B.solid(262, 20, 263, 21);
    B.add('turret', 262, 19);
    B.add('flyer', 268, 14);
    // --- the secret room: inside the glacier by the shaft down to the ice cave, behind a wall of ice (Fire Storm)
    B.secret(193, 18, 198, 21, 192, 'fire', 196);
    bossRoom(B, DOOR_COL, 'snow');
  },

  // Winderwomen's sky castle: updrafts up from the clouds, cloud platforms against the gusts, down through the
  // castle's three halls, the storm bridges and the last updraft hops (falling into the clouds is the end)
  wind(B) {
    const isle = (x0, x1, top = F, th = 3) => B.rect(x0, top, x1, top + th, '#');
    isle(0, 18);
    B.add('start', 3);
    B.add('met', 12);
    // --- up on the updrafts
    isle(22, 26, 21, 1);
    B.rect(24, 21, 25, 21, 'U');
    isle(28, 33, 14, 1);
    B.add('fanbot', 30, 12);
    B.rect(32, 14, 33, 14, 'U');
    isle(36, 44, 7, 1);
    B.add('flyer', 40, 1);
    // --- cloud platforms over the void, the wind blowing against you
    B.add('wind', 45, 12, { x1: 108, dir: -1, phase: 0 });
    B.add('plat', 46, 7, { x1: 54, y1: 7, speed: 0.9 });
    B.add('plat', 57, 9, { x1: 65, y1: 9, speed: 1.1 });
    B.add('plat', 68, 7, { x1: 75, y1: 7, speed: 1 });
    isle(78, 82, 8, 1);
    B.add('fanbot', 80, 6);
    B.add('plat', 85, 6, { x1: 95, y1: 6, speed: 1.2 });
    B.add('flyer', 90, 1);
    isle(98, 109, 7, 1);
    B.add('cp', 100, 6);
    B.add('h', 106, 6);
    // --- the sky castle: in at the top, down through its three halls
    B.solid(110, 0, 165, 24);
    B.cave(110, 5, 110, 6);
    B.cave(111, 2, 164, 6);
    B.spikes(118, 119, 7);
    B.spikes(126, 127, 7);
    B.add('met', 123, 6);
    B.spikes(134, 135, 7);
    B.rect(140, 4, 152, 5, '=');
    B.add('fanbot', 156, 5);
    B.ladder(162, 7, 13);
    B.cave(111, 9, 164, 14);
    B.spikes(150, 151, 15);
    B.spikes(140, 141, 15);
    B.add('fanbot', 135, 12); // it blows you back toward the spikes
    B.spikes(128, 129, 15);
    B.add('met', 120, 14);
    B.ladder(113, 15, 21);
    B.cave(111, 17, 164, 21);
    B.spikes(119, 128, 22);
    B.add('plat', 119, 20, { x1: 127, y1: 20, speed: 0.8 });
    B.add('fanbot', 140, 19);
    B.add('L', 150, 21);
    B.add('met', 158, 21);
    B.cave(165, 19, 165, 21);
    // --- the storm bridges: crumbling cloudstone, gusts from either side
    isle(166, 172);
    B.add('cp', 168);
    B.ledge(173, 182, F, 'C');
    isle(183, 186);
    B.add('wind', 166, F, { x1: 214, dir: 1, phase: 40 });
    B.ledge(187, 196, F, 'C');
    isle(197, 200, 20, 1);
    B.add('fanbot', 199, 18);
    B.ledge(201, 210, 20, 'C');
    isle(211, 216);
    B.add('flyer', 192, 12);
    // --- the last hops: updrafts over spike gaps, fanbots on guard
    isle(217, 222);
    B.rect(221, F, 222, F, 'U');
    isle(227, 231, 18, 1);
    B.add('fanbot', 229, 16);
    isle(236, 244);
    B.rect(243, F, 244, F, 'U');
    isle(249, 253, 17, 1);
    isle(258, 275);
    B.add('E', 262);
    B.add('fanbot', 268, 18);
    B.add('flyer', 271, 13);
    // --- the secret room: a balcony room off the castle's bottom hall, behind a glass window (Sonic Boom)
    B.solid(104, 16, 109, 23);
    B.secret(105, 18, 109, 21, 110, 'sonic', 107);
    bossRoom(B, DOOR_COL, 'wind');
  },

  earth(B) {
    // --- the canyon floor under falling rocks
    B.ground(0, 25);
    B.add('start', 3);
    B.add('met', 11);
    B.add('rockfall', 15, F, { period: 110, phase: 0 });
    B.rect(18, F, 20, F + 1, 'Q');
    B.add('rockfall', 23, F, { period: 110, phase: 55 });
    B.add('mole', 22);
    // --- the cavern: down ledge by ledge, two of them crumbling; the bottom is a bottomless drop
    B.ground(26, 140);
    B.cave(28, 20, 56, LEVEL_H - 1);
    for (const [x0, x1, y, c] of [
      [29, 34, 24, '#'],
      [38, 43, 27, 'C'],
      [47, 52, 30, '#'],
      [39, 44, 33, 'C'],
      [48, 56, 36, '#'],
    ])
      B.ledge(x0, x1, y, c);
    B.add('flyer', 45, 22);
    B.add('flyer', 36, 31);
    // --- the deep tunnels: a crumbling bridge, quicksand, then a low stretch with spikes in the roof
    B.cave(57, 30, 125, 35);
    B.add('cp', 54, 35);
    B.ledge(66, 73, 36, 'C');
    B.rect(66, 37, 73, LEVEL_H - 1, '.');
    B.cave(57, 36, 65, 36);
    B.cave(74, 36, 125, 36);
    B.ledge(57, 65, 37, '#');
    B.ledge(74, 125, 37, '#');
    B.add('mole', 78, 36);
    B.rect(82, 36, 85, 37, 'Q');
    B.add('hopper', 90, 36);
    B.rect(94, 31, 104, 32, '#');
    B.ledge(94, 104, 33, '^');
    B.add('met', 99, 36);
    B.rect(108, 36, 110, 37, 'Q');
    B.add('mole', 114, 36);
    B.add('h', 119, 36);
    B.ledge(121, 125, 37, '#');
    // --- the mine cart: ride it over the abyss, jump the rocks on the rails, keep low under the spikes
    B.solid(126, 22, 186, 29);
    B.cave(126, 30, 186, LEVEL_H - 1);
    B.add('plat', 127, 36, { x1: 183, y1: 36, speed: 1.6 });
    for (const x of [140, 157, 171]) B.solid(x, 34, x, 35);
    B.ledge(146, 152, 31, '^');
    B.ledge(162, 166, 31, '^');
    B.ledge(176, 180, 31, '^');
    B.add('flyer', 150, 34);
    // --- up through the quicksand: three tiers and two ladders; hop across the deep sand before it swallows you
    B.solid(186, 36, 206, LEVEL_H - 1);
    B.add('cp', 187, 35);
    B.cave(186, 22, 206, 35);
    B.rect(193, 36, 196, 37, 'Q');
    B.add('mole', 200, 35);
    B.solid(187, 30, 205, 31);
    B.ladder(204, 30, 35);
    B.rect(191, 30, 193, 30, 'Q');
    B.rect(196, 30, 198, 31, 'Q');
    B.add('hopper', 201, 29);
    B.solid(189, 24, 206, 25);
    B.ladder(188, 24, 29);
    B.rect(195, 24, 198, 25, 'Q');
    B.add('mole', 202, 23);
    B.add('flyer', 204, 18);
    // --- the canyon bridge: it crumbles under you between the stone piers, rocks falling on it
    B.ground(207, 212);
    B.ledge(213, 244, F, 'C');
    B.pillar(221, 222, F);
    B.pillar(233, 234, F);
    [217, 228, 240].forEach((x, i) => B.add('rockfall', x, F, { period: 100, phase: i * 33 }));
    B.add('flyer', 230, 14);
    // --- the last stretch
    B.ground(245, 275);
    B.add('mole', 252);
    B.rect(256, F, 259, F + 1, 'Q');
    B.add('E', 262);
    B.solid(266, 20, 267, 21);
    B.add('turret', 266, 19);
    B.add('flyer', 271, 14);
    // --- the secret room: at the foot of the quicksand tiers, behind the planks of an old mine gallery (Rolling Cutter)
    B.secret(208, 32, 211, 35, 207, 'cut', 210);
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
    doorCol: B.doorCol || DOOR_COL,
    start: start ? spot(start) : { x: 3, y: FLOOR - 1 },
    cps: B.ents
      .filter(e => e.type === 'cp')
      .map(spot)
      .sort((a, b) => a.x - b.x),
  };
}
