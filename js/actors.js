'use strict';
// World state, physics, player + weapons, enemies, hazards, platforms, bosses, pickups, particles.

let frameCount = 0;
let level = null,
  map = null,
  LW = 0,
  LH = 0,
  levelArt = null;
let camX = 0,
  camY = 0,
  camYf = 0;
const game = {
  state: 'title',
  t: 0,
  lives: 2,
  score: 0,
  time: 0,
  deadT: 0,
  stage: null,
  checkpoint: false,
  bossLocked: false,
  bossBar: 0,
  refill: 0,
  shake: 0,
  flash: 0,
  placed: [],
  menu: 0,
  sel: 0,
  popup: 0,
  tough: false,
};
const door = { open: 0, solid: true, phase: '' };
const player = { weapon: 'buster' };
let enemies = [],
  pshots = [],
  eshots = [],
  pickups = [],
  particles = [],
  hazards = [],
  plats = [],
  spawns = [];
let boss = null;
const crumbling = new Map();

const maxCamY = () => LH * TILE - VH;
// the boss room sits on the surface floor; its view shows the ceiling down to a few rows under the floor
const BOSS_CAM_Y = (FLOOR + 4) * TILE - VH;
const bossRoomX = () => level.doorCol * TILE;
const ROOM = () => ({
  l: (level.doorCol + 1) * TILE,
  r: (level.doorCol + 23) * TILE,
  floor: FLOOR * TILE,
  ceil: 13 * TILE,
});
const EC = () => ENEMY_COLORS[level.theme];

// ================= TILES & PHYSICS =================
const tileAt = (tx, ty) => (ty < 0 || ty >= LH ? '.' : tx < 0 || tx >= LW ? '#' : map[ty][tx]);
// < > conveyor belts, Y energy block (switched on and off by its hazard), Q quicksand (not solid: you sink into it),
// U updraft pad (landing on it launches you high into the air)
const isSolidTile = t => '#=^IC<>YU'.includes(t) || (t === 'D' && door.solid);
const solidPx = (x, y) => isSolidTile(tileAt(Math.floor(x / TILE), Math.floor(y / TILE)));
const isLadder = (tx, ty) => tileAt(tx, ty) === 'H';
const ladderTop = (tx, ty) => isLadder(tx, ty) && !isLadder(tx, ty - 1);

function samples(a, b) {
  const r = [];
  for (let v = a; v < b; v += 8) r.push(v);
  r.push(b);
  return r;
}
// leading edges are tested just inside the box (not a whole pixel in), so a sub-pixel step into a wall or
// the floor collides immediately instead of sinking for a few frames and then snapping back
const EDGE = 0.001;
function moveX(e, dx) {
  if (!dx) return false;
  e.x += dx;
  const ys = samples(e.y, e.y + e.h - 1);
  if (dx > 0) {
    const px = e.x + e.w - EDGE;
    if (ys.some(y => solidPx(px, y))) {
      e.x = Math.floor(px / TILE) * TILE - e.w;
      return true;
    }
  } else if (ys.some(y => solidPx(e.x, y))) {
    e.x = (Math.floor(e.x / TILE) + 1) * TILE;
    return true;
  }
  return false;
}
// returns 1 when landed, -1 when bumped head, 0 otherwise
function moveY(e, dy, oneWay) {
  e.y += dy;
  const xs = samples(e.x, e.x + e.w - 1);
  if (dy > 0) {
    const py = e.y + e.h - EDGE,
      ty = Math.floor(py / TILE);
    let land = xs.some(x => solidPx(x, py));
    if (!land && oneWay && e.y + e.h - dy <= ty * TILE) land = xs.some(x => ladderTop(Math.floor(x / TILE), ty));
    if (land) {
      e.y = ty * TILE - e.h;
      return 1;
    }
  } else if (dy < 0 && xs.some(x => solidPx(x, e.y))) {
    e.y = (Math.floor(e.y / TILE) + 1) * TILE;
    return -1;
  }
  return 0;
}
function groundBelow(px, py) {
  for (let ty = Math.max(0, Math.floor(py / TILE)); ty < LH; ty++)
    if (isSolidTile(tileAt(Math.floor(px / TILE), ty))) return ty * TILE;
  return LH * TILE + 64;
}
function standingOn(e, ch) {
  const ty = Math.floor((e.y + e.h) / TILE);
  return samples(e.x, e.x + e.w - 1).some(x => tileAt(Math.floor(x / TILE), ty) === ch);
}
function physics(e) {
  e.vy = Math.min(e.vy + 0.25, 7);
  const r = moveY(e, e.vy, false);
  if (r === 1) {
    e.vy = 0;
    e.onGround = true;
  } else {
    e.onGround = false;
    if (r === -1) e.vy = 0;
  }
}
const pcx = () => player.x + player.w / 2,
  pcy = () => player.y + player.h / 2;
const alive = p => p.state !== 'dead';
const onScreen = (x, y, m = 16) => x > camX - m && x < camX + VW + m && y > camY - m && y < camY + VH + m;

// ================= PARTICLES =================
function part(o) {
  particles.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 20, grav: 0 }, o));
}
function boom(x, y) {
  part({ kind: 'boom', x, y, life: 18 });
}
function spark(x, y) {
  part({ kind: 'spark', x, y, life: 8 });
}
function dust(x, y, n = 3) {
  for (let i = 0; i < n; i++)
    part({
      kind: 'dust',
      x: x + (Math.random() - 0.5) * 10,
      y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -Math.random() * 0.5,
      life: 18,
    });
}
function debris(x, y, col, n = 6, sp = 2) {
  for (let i = 0; i < n; i++)
    part({
      kind: 'debris',
      x,
      y,
      vx: (Math.random() - 0.5) * sp * 2,
      vy: -Math.random() * sp * 1.6 - 0.5,
      grav: 0.2,
      life: 40,
      col,
      size: 2 + ((Math.random() * 3) | 0),
    });
}
function orbs(x, y, col, mul = 1) {
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    for (const s of [1, 2.2])
      part({ kind: 'orb', x, y, vx: Math.cos(a) * s * mul, vy: Math.sin(a) * s * mul, life: 160, col });
  }
}
function updateParticles() {
  for (const q of particles) {
    q.vy += q.grav;
    q.x += q.vx;
    q.y += q.vy;
    q.t++;
  }
  particles = particles.filter(q => q.t < q.life);
}

// ================= WEAPONS =================
const WEAPONS = {
  buster: { name: 'NEO BUSTER', short: 'BUSTER', pal: PAL_HERO },
  cut: {
    name: 'ROLLING CUTTER',
    short: 'R.CUTTER',
    pal: { B: '#5a5a6a', b: '#e0e0ec', S: SKIN },
    glow: '#e0e0ec',
    desc: 'PISAU PUTAR BOOMERANG - TEMBUS MUSUH',
    charged: 'GIANT SHURIKEN',
    demo: { kind: 'cutter' },
  },
  fire: {
    name: 'FIRE STORM',
    short: 'F.STORM',
    pal: { B: '#d83000', b: '#f8b830', S: SKIN },
    glow: '#f86000',
    desc: 'BOLA API + PERISAI API',
    charged: 'FIRE WAVE',
    demo: { kind: 'fireball', vx: 1 },
  },
  wind: {
    name: 'GALE SHOT',
    short: 'G.SHOT',
    pal: { B: '#20a878', b: '#b8fce0', S: SKIN },
    glow: '#78f8c8',
    desc: '3 PUSARAN ANGIN MELAYANG KE ATAS',
    charged: 'CYCLONE',
    demo: { kind: 'whirl' },
  },
  elec: {
    name: 'THUNDER BEAM',
    short: 'T.BEAM',
    pal: { B: '#c88800', b: '#f8f080', S: SKIN },
    glow: '#f8f058',
    desc: 'SINAR PETIR - MENEMBUS MUSUH',
    charged: 'GIGA THUNDER',
    demo: { kind: 'tbeam', w: 24, h: 8, seed: 1 },
  },
  snow: {
    name: 'FROST SHARD',
    short: 'F.SHARD',
    pal: { B: '#1888d8', b: '#d0f4fc', S: SKIN },
    glow: '#58d8f8',
    desc: '3 KRISTAL ES - MEMBEKUKAN MUSUH',
    charged: 'FROST NOVA',
    demo: { kind: 'shard' },
  },
  earth: {
    name: 'ROCK BREAKER',
    short: 'R.BREAKER',
    pal: { B: '#7a4a20', b: '#e8b868', S: SKIN },
    glow: '#e8b868',
    desc: 'BATU PECAH JADI 4 SERPIHAN',
    charged: 'ROCK QUAKE',
    demo: { kind: 'rock' },
  },
};
// palette the player flashes to while a special weapon is fully charged
for (const k of STAGE_ORDER) if (WEAPONS[k]) WEAPONS[k].full = { B: WEAPONS[k].pal.b, b: '#fcfcfc', S: '#fcfcfc' };
const WEAPON_ORDER = ['buster', ...STAGE_ORDER]; // each boss drops the weapon with its stage key
// Content registries for continent files: SHOT_KINDS[kind] = { update(s), draw(s, x, y), offscreen } for player
// shots, ESHOT_KINDS[kind] = { update(s), draw(s, x, y), pierce } for enemy shots, HAZARD_KINDS[type] =
// { make(d), update(h, p), draw(h) } for hazards. A weapon can also bring its own fire(p) / charge(p) / ultra(p).
const SHOT_KINDS = {},
  ESHOT_KINDS = {},
  HAZARD_KINDS = {};
const ownedWeapons = () => WEAPON_ORDER.filter(w => w === 'buster' || save.cleared[w]);

function addShot(o) {
  const s = Object.assign({ vx: 0, vy: 0, t: 0, dead: false, pierce: false, level: 0, grav: 0, bossDmg: 1 }, o);
  if (s.pierce) s.hits = new Set();
  pshots.push(s);
  return s;
}
// ---- shop parts & points ----
// a bought part is 'on' or 'off' in save.parts; points are the score you earn, kept to spend in the shop
// Omega Booster overrides the Super and Ultra Boosters: while it is on they are disabled (their own on/off is kept)
const partDisabled = k => (k === 'super' || k === 'ultra') && !!save.parts && save.parts.omega === 'on';
const hasPart = k => !!(save.parts && save.parts[k] === 'on') && !partDisabled(k);
const SHIELD_DOWN = 600; // frames a shield orb stays gone after it blocks something (10 s)
function addScore(n) {
  game.score += n;
  save.points = (save.points || 0) + n;
  writeSave();
}
const ULTRA_CHARGE = 150; // frames of holding for the ultra attack (Ultra Booster)

const countShots = k => pshots.reduce((n, s) => n + (s.kind === k && !s.deflected ? 1 : 0), 0);

function fireBuster(p, lvl, storm = true) {
  if (lvl === 0 && countShots('buster') >= 3) return;
  const [w, h] = [
    [6, 4],
    [10, 10],
    [22, 14],
  ][lvl];
  const x = p.facing > 0 ? p.x + p.w + 4 : p.x - 4 - w;
  addShot({
    kind: 'buster',
    weapon: 'buster',
    x,
    y: p.y + 13 - h / 2,
    w,
    h,
    vx: p.facing * (lvl === 2 ? 5.5 : 5),
    level: lvl,
    dmg: lvl + 1,
  });
  p.shootT = 16;
  [sfx.shoot, sfx.shootMid, sfx.shootFull][lvl]();
  if (lvl === 2 && storm && !p.storm && !countShots('storm')) {
    p.storm = 40;
    game.flash = 4;
    sfx.storm();
  }
}
// buster storm (full charge): for 40 frames a swarm of small shots pours in from the screen edge behind the player
function updateStorm(p) {
  if (!p.storm) return;
  if (p.weapon !== 'buster' || !alive(p)) {
    p.storm = 0;
    return;
  }
  p.storm--;
  const f = p.facing;
  for (let i = 0; i < 10; i++) {
    addShot({
      kind: 'storm',
      weapon: 'buster',
      x: f > 0 ? camX - 18 + Math.random() * 10 : camX + VW + 8 - Math.random() * 10,
      y: camY + 2 + Math.random() * (VH - 8),
      w: 6,
      h: 4,
      vx: f * (7 + Math.random() * 3),
      dmg: 1,
      bossDmg: 1,
      hue: Math.random() < 0.5,
      lit: Math.random() < 0.12,
    });
  }
  if (p.storm % 6 === 0) sfx.shoot();
}

function fireSpecial(p) {
  const mx = p.facing > 0 ? p.x + p.w + 2 : p.x - 2,
    my = p.y + 13,
    W_ = WEAPONS[p.weapon];
  if (W_ && W_.fire) {
    if (W_.fire(p) !== false) p.shootT = 16;
    return;
  }
  switch (p.weapon) {
    case 'cut':
      if (countShots('cutter') >= 2) return;
      addShot({
        kind: 'cutter',
        weapon: 'cut',
        x: mx - 7,
        y: my - 7,
        w: 14,
        h: 14,
        vx: p.facing * 5.5,
        decel: 0.11,
        dir: p.facing,
        dmg: 2,
        pierce: true,
      });
      sfx.cutter();
      break;
    case 'fire':
      if (countShots('fireball') >= 2) return;
      addShot({ kind: 'fireball', weapon: 'fire', x: mx - 6, y: my - 5, w: 12, h: 10, vx: p.facing * 4.5, dmg: 2 });
      if (!pshots.some(s => s.kind === 'flame'))
        addShot({ kind: 'flame', weapon: 'fire', x: 0, y: 0, w: 10, h: 10, ang: 0, life: 100, dmg: 1, pierce: true });
      sfx.fire();
      break;
    case 'elec':
      if (countShots('tbeam') >= 2) return;
      addShot({
        kind: 'tbeam',
        weapon: 'elec',
        x: p.facing > 0 ? p.x + p.w : p.x - 24,
        y: my - 4,
        w: 24,
        h: 8,
        vx: p.facing * 6,
        dmg: 2,
        pierce: true,
        seed: (Math.random() * 1e4) | 0,
      });
      sfx.zap();
      break;
    case 'wind': // gale shot: three whirlwinds rising at different angles
      if (countShots('whirl') > 0) return;
      for (const vy of [-0.6, -1.5, -2.4])
        addShot({ kind: 'whirl', weapon: 'wind', x: mx - 6, y: my - 8, w: 12, h: 14, vx: p.facing * 3.2, vy, dmg: 1 });
      sfx.gale();
      break;
    case 'snow':
      if (countShots('shard') > 0) return;
      for (const a of [-0.22, 0, 0.22])
        addShot({
          kind: 'shard',
          weapon: 'snow',
          x: mx - 4,
          y: my - 3,
          w: 8,
          h: 6,
          vx: Math.cos(a) * 4.5 * p.facing,
          vy: Math.sin(a) * 4.5,
          dmg: 1,
        });
      sfx.ice();
      break;
    case 'earth':
      if (countShots('rock') > 0) return;
      addShot({
        kind: 'rock',
        weapon: 'earth',
        x: mx - 7,
        y: my - 12,
        w: 14,
        h: 14,
        vx: p.facing * 2.8,
        vy: -4.2,
        grav: 0.25,
        dmg: 3,
        bossDmg: 2,
      });
      sfx.rock();
      break;
  }
  p.shootT = 16;
}

// charged special weapons: hold shoot until fully charged, then release
function fireCharged(p) {
  const f = p.facing,
    my = p.y + 13,
    W_ = WEAPONS[p.weapon];
  if (W_ && W_.charge) {
    if (W_.charge(p) === false) return false;
    p.shootT = 16;
    return true;
  }
  switch (p.weapon) {
    case 'cut': // giant shuriken: a big four-bladed steel star that spins far forward and comes back
      if (countShots('shuriken')) return false;
      addShot({
        kind: 'shuriken',
        weapon: 'cut',
        x: f > 0 ? p.x + p.w : p.x - 26,
        y: p.y - 5,
        w: 26,
        h: 26,
        vx: f * 6,
        decel: 0.09,
        dir: f,
        dmg: 4,
        bossDmg: 3,
        pierce: true,
        charged: true,
      });
      sfx.cutter();
      sfx.shootFull();
      break;
    case 'fire': // fire wave: a flame pillar that rolls along the ground and burns enemy bullets
      if (countShots('pwave')) return false;
      addShot({
        kind: 'pwave',
        weapon: 'fire',
        x: f > 0 ? p.x + p.w : p.x - 16,
        y: p.y + p.h - 36,
        w: 16,
        h: 36,
        vx: f * 3.4,
        dmg: 4,
        bossDmg: 3,
        pierce: true,
        charged: true,
      });
      sfx.flame();
      sfx.fire();
      break;
    case 'elec': {
      // giga thunder: lightning strikes every enemy on screen and the boss
      if (countShots('pbolt')) return false;
      const targets = enemies
        .filter(e => !e.dead && !e.hidden && onScreen(e.x + e.w / 2, e.y + e.h / 2, 0))
        .map(e => [e.x + e.w / 2, e.y + e.h]);
      if (boss && boss.state !== 'drop' && boss.state !== 'pose') targets.push([bcx(boss), boss.y + boss.h]);
      if (!targets.length)
        for (const d of [48, 104, 160]) {
          const tx = pcx() + f * d;
          targets.push([tx, groundBelow(tx, p.y)]);
        }
      for (const [tx, ty] of targets) {
        const bottom = Math.min(ty, camY + VH);
        addShot({
          kind: 'pbolt',
          weapon: 'elec',
          x: tx - 8,
          y: camY - 8,
          w: 16,
          h: bottom - camY + 8,
          life: 22,
          dmg: 4,
          bossDmg: 3,
          pierce: true,
          charged: true,
          seed: (Math.random() * 1e4) | 0,
        });
      }
      game.flash = 6;
      game.shake = 8;
      sfx.thunder();
      break;
    }
    case 'wind': // cyclone: a big tornado that rolls along the ground, grinding everything it passes over
      if (countShots('pcyclone')) return false;
      addShot({
        kind: 'pcyclone',
        weapon: 'wind',
        x: f > 0 ? p.x + p.w : p.x - 24,
        y: p.y + p.h - 40,
        w: 24,
        h: 40,
        vx: f * 1.8,
        life: 150,
        dmg: 2,
        bossDmg: 3,
        pierce: true,
        charged: true,
      });
      sfx.whoosh();
      break;
    case 'snow': {
      // frost nova: a dense ring of 24 big piercing ice crystals (one points straight ahead)
      if (countShots('bigshard')) return false;
      const n = 24;
      for (let i = 0; i < n; i++) {
        const a = (i * Math.PI * 2) / n;
        addShot({
          kind: 'bigshard',
          weapon: 'snow',
          x: p.x + p.w / 2 - 5,
          y: p.y + p.h / 2 - 5,
          w: 10,
          h: 10,
          vx: Math.cos(a) * 4 * f,
          vy: Math.sin(a) * 4,
          dmg: 2,
          bossDmg: 3,
          pierce: true,
          charged: true,
        });
      }
      sfx.ice();
      sfx.shatter();
      break;
    }
    case 'earth': // rock quake: a boulder that shatters into 8 fragments and shakes every grounded enemy
      if (countShots('bigrock')) return false;
      addShot({
        kind: 'bigrock',
        weapon: 'earth',
        x: f > 0 ? p.x + p.w - 4 : p.x - 18,
        y: my - 20,
        w: 22,
        h: 22,
        vx: f * 2.6,
        vy: -4.6,
        grav: 0.25,
        dmg: 5,
        bossDmg: 3,
        charged: true,
      });
      sfx.rock();
      sfx.shootFull();
      break;
  }
  p.shootT = 16;
  return true;
}

// ================= ULTRA ATTACKS (Ultra Booster: hold for ULTRA_CHARGE frames) =================
function fireUltra(p) {
  if (pshots.some(s => s.ultra)) return false; // one at a time
  const f = p.facing,
    W_ = WEAPONS[p.weapon];
  if (W_ && W_.ultra) W_.ultra(p);
  else
    switch (p.weapon) {
      case 'buster': // hyper beam: a screen-long laser from the buster
        addShot({
          kind: 'hbeam',
          weapon: 'buster',
          x: p.x,
          y: p.y,
          w: 1,
          h: 36,
          dir: f,
          life: 60,
          dmg: 6,
          bossDmg: 7,
          pierce: true,
          charged: true,
          ultra: true,
        });
        break;
      case 'cut': // cutter tempest: 8 big R. Cutters spiralling out around the player
        for (let i = 0; i < 8; i++)
          addShot({
            kind: 'tcutter',
            weapon: 'cut',
            x: pcx() - 10,
            y: pcy() - 10,
            w: 20,
            h: 20,
            ang: (i * Math.PI) / 4,
            r: 12,
            life: 130,
            dmg: 4,
            bossDmg: 2,
            pierce: true,
            charged: true,
            ultra: true,
          });
        break;
      case 'fire': // inferno: fire pillars erupt along the floor, outward in both directions
        for (let k = 1; k <= 7; k++)
          for (const d of [-1, 1]) {
            const x = pcx() + d * k * 36,
              gy = groundBelow(x, p.y);
            if (gy > camY + VH + 32) continue;
            addShot({
              kind: 'ppillar',
              weapon: 'fire',
              x: x - 10,
              y: gy - 88,
              w: 20,
              h: 88,
              delay: k * 5,
              life: 34,
              dmg: 4,
              bossDmg: 3,
              pierce: true,
              charged: true,
              ultra: true,
            });
          }
        break;
      case 'elec': // thunder god: lightning keeps striking enemies (and the boss) for almost two seconds
        addShot({ kind: 'tgod', weapon: 'elec', x: pcx(), y: pcy(), w: 0, h: 0, life: 110, n: 0, ultra: true });
        break;
      case 'snow':
        absoluteZero(p);
        break;
      case 'wind': // hurricane: three screen-high tornadoes sweep the screen from behind the player
        for (let i = 0; i < 3; i++)
          addShot({
            kind: 'hurricane',
            weapon: 'wind',
            x: f > 0 ? camX - 56 : camX + VW,
            y: camY,
            w: 56,
            h: VH,
            vx: f * 3.2,
            delay: i * 22,
            life: 170,
            dmg: 3,
            bossDmg: 3,
            pierce: true,
            charged: true,
            ultra: true,
          });
        break;
      case 'earth': // meteor: falls ahead of the player and explodes into shockwaves and rocks
        addShot({
          kind: 'meteor',
          weapon: 'earth',
          x: pcx() + f * 96 - 20,
          y: camY - 48,
          w: 40,
          h: 40,
          vy: 4,
          dmg: 8,
          bossDmg: 6,
          pierce: true,
          charged: true,
          ultra: true,
        });
        break;
    }
  game.flash = 8;
  game.shake = 10;
  sfx.ultra();
  p.shootT = 20;
  return true;
}
// absolute zero: every enemy on screen takes damage and freezes solid, bullets shatter, ice spikes erupt
function absoluteZero(p) {
  for (const e of enemies) {
    if (e.dead || e.hidden || !onScreen(e.x + e.w / 2, e.y + e.h / 2, 0)) continue;
    hitEnemy({ kind: 'zero', weapon: 'snow', x: e.x, y: e.y, w: e.w, h: e.h, dmg: 3 }, e);
    if (!e.dead) e.frozen = 300;
  }
  for (const s of eshots)
    if (!s.harmless && onScreen(s.x + s.w / 2, s.y + s.h / 2, 16)) {
      s.dead = true;
      debris(s.x + s.w / 2, s.y + s.h / 2, '#c8f0fc', 3, 1);
    }
  if (boss && boss.hp > 0 && boss.state !== 'drop' && boss.state !== 'pose' && BOSSES[boss.type].weapon !== 'snow') {
    hitBoss({ kind: 'zero', weapon: 'snow', x: boss.x, y: boss.y, w: boss.w, h: boss.h, bossDmg: 5, ultra: true });
    if (boss) boss.frozenT = 150;
  }
  for (let k = -7; k <= 7; k++) {
    const x = pcx() + k * 26;
    if (x < camX || x > camX + VW) continue;
    const gy = groundBelow(x, p.y - 8);
    if (gy > camY + VH + 16) continue;
    addShot({
      kind: 'icespike',
      weapon: 'snow',
      x: x - 6,
      y: gy - 30,
      w: 12,
      h: 30,
      delay: Math.abs(k) * 3,
      life: 40,
      dmg: 3,
      bossDmg: 2,
      pierce: true,
      charged: true,
      ultra: true,
    });
  }
  sfx.freeze();
  sfx.shatter();
}
function meteorImpact(s) {
  s.dead = true;
  const cx = s.x + s.w / 2,
    gy = s.y + s.h;
  game.shake = 22;
  game.flash = 6;
  sfx.bigBoom();
  sfx.quake();
  for (let i = 0; i < 5; i++) boom(cx + (Math.random() - 0.5) * 40, gy - 10 - Math.random() * 20);
  debris(cx, gy - 8, '#9a7a5a', 16, 3.5);
  for (const d of [-1, 1])
    addShot({
      kind: 'pquake',
      weapon: 'earth',
      x: cx - 8 + d * 20,
      y: gy - 20,
      w: 16,
      h: 20,
      vx: d * 4,
      life: 70,
      dmg: 4,
      bossDmg: 3,
      pierce: true,
      charged: true,
      ultra: true,
    });
  for (let i = 0; i < 10; i++) {
    const v = (i - 4.5) * 0.8;
    addShot({
      kind: 'frag',
      weapon: 'earth',
      x: cx - 3,
      y: gy - 16,
      w: 6,
      h: 6,
      vx: v,
      vy: -4 - Math.random() * 2,
      grav: 0.22,
      dmg: 2,
    });
  }
  for (const e of enemies)
    if (!e.dead && !e.hidden && Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - gy) < 80)
      hitEnemy({ kind: 'blast', weapon: 'earth', x: e.x, y: e.y, w: e.w, h: e.h, dmg: 6 }, e);
  if (boss && Math.hypot(bcx(boss) - cx, boss.y + boss.h / 2 - gy) < 90)
    hitBoss({ kind: 'blast', weapon: 'earth', x: boss.x, y: boss.y, w: boss.w, h: boss.h, bossDmg: 6, ultra: true });
}

function chargeTick(p) {
  p.charge++;
  if (p.charge === 30) sfx.charge();
  if (p.charge >= 75 && p.charge % 16 === 0) sfx.chargeFull();
  if (p.charge === ULTRA_CHARGE && hasPart('ultra')) sfx.ultraReady();
}
// the charge survives getting hit and sliding: a release that happens then fires as soon as the player can shoot again
function handleShoot(p, canFire) {
  const special = p.weapon !== 'buster';
  if (hit.shoot && canFire) {
    // Omega Booster: every tap is an ultra attack (a charged shot while the previous ultra is still going)
    if (hasPart('omega')) {
      if (!fireUltra(p)) {
        if (!special) fireBuster(p, 2, false);
        else if (!fireCharged(p)) fireSpecial(p);
      }
    } else if (hasPart('super')) {
      if (!special) fireBuster(p, 2, false);
      else if (!fireCharged(p)) fireSpecial(p);
    } // Super Booster: every tap is a charged shot
    else if (special) fireSpecial(p);
    else fireBuster(p, 0);
  }
  if (inp.shoot) chargeTick(p);
  else if (p.charge > 0 && canFire) {
    if (p.charge >= ULTRA_CHARGE && hasPart('ultra') && fireUltra(p)) {
      /* ultra attack */
    } else if (special) {
      if (p.charge >= 75) fireCharged(p);
    } else if (p.charge >= 75) fireBuster(p, 2);
    else if (p.charge >= 30) fireBuster(p, 1);
    p.charge = 0;
  }
}

const isRock = s => s.kind === 'rock' || s.kind === 'bigrock';
function shatterRock(s) {
  if (s.dead) return;
  s.dead = true;
  const cx = s.x + s.w / 2,
    cy = s.y + s.h / 2,
    big = s.kind === 'bigrock';
  const vs = big ? [-3.2, -2.4, -1.6, -0.8, 0.8, 1.6, 2.4, 3.2] : [-2.4, -1.1, 1.1, 2.4];
  for (const v of vs)
    addShot({
      kind: 'frag',
      weapon: 'earth',
      x: cx - 3,
      y: cy - 3,
      w: 6,
      h: 6,
      vx: v,
      vy: -3 - Math.abs(v) * 0.4,
      grav: 0.22,
      dmg: big ? 2 : 1,
    });
  debris(cx, cy, '#9a7a5a', big ? 12 : 5, big ? 3 : 2);
  sfx.shatter();
  if (big) {
    game.shake = 12;
    sfx.quake();
    for (const e of enemies) {
      if (e.dead || e.hidden || !e.onGround || !onScreen(e.x + e.w / 2, e.y + e.h / 2, 0)) continue;
      hitEnemy({ kind: 'quake', weapon: 'earth', x: e.x, y: e.y, w: e.w, h: e.h, dmg: 2 }, e);
    }
  }
}
// fire shield and fire wave destroy small enemy bullets they touch
function burnShots(s) {
  for (const e of eshots)
    if (!e.dead && !e.big && !e.harmless && overlap(s, e)) {
      e.dead = true;
      spark(e.x + e.w / 2, e.y + e.h / 2);
    }
}

function updateShot(s) {
  s.t++;
  const K = SHOT_KINDS[s.kind];
  if (K && K.update) {
    K.update(s);
    if (!K.offscreen && !onScreen(s.x + s.w / 2, s.y + s.h / 2, 24)) s.dead = true;
    return;
  }
  switch (s.kind) {
    case 'cutter':
    case 'shuriken':
      if (!s.back) {
        s.vx -= s.dir * s.decel;
        s.x += s.vx;
        if (s.kind === 'cutter') s.y += Math.sin(s.t * 0.15) * 0.6;
        if (Math.sign(s.vx) !== s.dir) s.back = true;
      } else {
        // the shuriken homes on the player's feet line so it never sinks into the floor on the way back
        const ty = s.kind === 'shuriken' ? player.y + player.h - 1 - s.h / 2 : pcy();
        const dx = pcx() - (s.x + s.w / 2),
          dy = ty - (s.y + s.h / 2),
          d = Math.hypot(dx, dy) || 1,
          sp = Math.min(5.5, 2 + s.t * 0.03);
        s.x += (dx / d) * sp;
        s.y += (dy / d) * sp;
        if (d < 10 || !alive(player)) s.dead = true;
      }
      if (s.t > 300) s.dead = true;
      return;
    case 'flame':
      s.ang += 0.22;
      s.x = pcx() + Math.cos(s.ang) * 22 - 5;
      s.y = pcy() + Math.sin(s.ang) * 22 - 5;
      if (--s.life <= 0 || !alive(player)) s.dead = true;
      burnShots(s);
      return;
    case 'pbolt':
      if (--s.life <= 0) s.dead = true;
      return;
    // ---- ultra attacks ----
    case 'hbeam': {
      // follows the buster; re-hits enemies every 10 frames
      const p = player;
      if (s.dir > 0) {
        s.x = p.x + p.w + 2;
        s.w = Math.max(1, camX + VW - s.x);
      } else {
        s.x = camX;
        s.w = Math.max(1, p.x - 2 - camX);
      }
      s.y = p.y + 11 - s.h / 2;
      if (s.t % 10 === 0) for (const e of [...s.hits]) if (e !== boss) s.hits.delete(e);
      burnShots(s);
      if (--s.life <= 0 || !alive(p)) s.dead = true;
      return;
    }
    case 'tcutter':
      s.ang += 0.13;
      s.r = Math.min(150, s.r + 1.6);
      s.x = pcx() + Math.cos(s.ang) * s.r - s.w / 2;
      s.y = pcy() + Math.sin(s.ang) * s.r - s.h / 2;
      if (s.t % 30 === 0) s.hits.clear();
      if (--s.life <= 0 || !alive(player)) s.dead = true;
      return;
    case 'ppillar':
    case 'icespike':
      if (s.delay > 0) {
        s.delay--;
        if (!s.delay) s.kind === 'ppillar' ? sfx.flame() : sfx.ice();
        return;
      }
      if (s.kind === 'ppillar') burnShots(s);
      if (--s.life <= 0) s.dead = true;
      return;
    case 'tgod': {
      s.x = pcx();
      s.y = pcy();
      if (s.t % 7 === 1) {
        const ts = enemies
          .filter(e => !e.dead && !e.hidden && onScreen(e.x + e.w / 2, e.y + e.h / 2, 0))
          .map(e => [e.x + e.w / 2, e.y + e.h]);
        if (boss && boss.state !== 'drop' && boss.state !== 'pose') ts.push([bcx(boss), boss.y + boss.h]);
        let tx, ty;
        if (ts.length) [tx, ty] = ts[s.n++ % ts.length];
        else {
          tx = camX + 16 + Math.random() * (VW - 32);
          ty = Math.min(groundBelow(tx, player.y), camY + VH);
        }
        addShot({
          kind: 'pbolt',
          weapon: 'elec',
          x: tx - 8,
          y: camY - 8,
          w: 16,
          h: Math.min(ty, camY + VH) - camY + 8,
          life: 14,
          dmg: 4,
          bossDmg: 3,
          pierce: true,
          charged: true,
          ultra: true,
          seed: (Math.random() * 1e4) | 0,
        });
        if (s.t % 14 === 1) {
          sfx.thunder();
          game.flash = 2;
        }
      }
      if (--s.life <= 0) s.dead = true;
      return;
    }
    case 'meteor':
      s.vy = Math.min(s.vy + 0.15, 9);
      s.y += s.vy;
      if (s.t % 2 === 0)
        part({ kind: 'ember', x: s.x + 8 + Math.random() * 24, y: s.y + 4, vx: 0, vy: -1.2, life: 16 });
      if (s.y > camY && solidPx(s.x + s.w / 2, s.y + s.h)) meteorImpact(s);
      if (s.y > camY + VH + 64) s.dead = true;
      return;
    case 'whirl':
      s.x += s.vx;
      s.y += s.vy;
      s.vy *= 0.985;
      break;
    case 'pcyclone':
      s.vy = Math.min((s.vy || 0) + 0.4, 7);
      s.y += s.vy;
      if (solidPx(s.x + s.w / 2, s.y + s.h)) {
        s.y = Math.floor((s.y + s.h) / TILE) * TILE - s.h;
        s.vy = 0;
      }
      s.x += s.vx;
      if (s.t % 15 === 0) for (const e of [...s.hits]) if (e !== boss) s.hits.delete(e);
      burnShots(s);
      if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + s.h - 8) || --s.life <= 0) {
        s.dead = true;
        debris(s.x + 12, s.y + 20, '#d8f8ec', 6);
        return;
      }
      if (s.t % 4 === 0)
        part({ kind: 'dust', x: s.x + 12, y: s.y + s.h, vx: (Math.random() - 0.5) * 2, vy: -0.6, life: 14 });
      break;
    case 'hurricane':
      if (s.delay > 0) {
        s.delay--;
        if (!s.delay) sfx.whoosh();
        return;
      }
      s.x += s.vx;
      s.y = camY;
      if (s.t % 12 === 0) s.hits.clear();
      burnShots(s);
      if (--s.life <= 0 || s.x > camX + VW + 64 || s.x + s.w < camX - 64) s.dead = true;
      return;
    case 'pquake':
      s.x += s.vx;
      if (frameCount % 3 === 0) dust(s.x + 8, s.y + s.h, 1);
      if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + s.h / 2) || --s.life <= 0) {
        s.dead = true;
        debris(s.x + 8, s.y + 10, '#9a7a5a', 4);
      }
      return;
    case 'pwave':
      s.vy = Math.min(s.vy + 0.4, 7);
      s.y += s.vy;
      if (solidPx(s.x + s.w / 2, s.y + s.h)) {
        s.y = Math.floor((s.y + s.h) / TILE) * TILE - s.h;
        s.vy = 0;
      }
      s.x += s.vx;
      if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + s.h - 8)) {
        s.dead = true;
        debris(s.x + s.w / 2, s.y + s.h - 8, '#f8a800', 6);
        return;
      }
      if (s.t % 3 === 0)
        part({ kind: 'ember', x: s.x + Math.random() * s.w, y: s.y + Math.random() * s.h, vx: 0, vy: -0.8, life: 14 });
      burnShots(s);
      break;
    case 'rock':
    case 'bigrock':
    case 'frag':
      s.vy = Math.min(s.vy + s.grav, 7);
      s.x += s.vx;
      s.y += s.vy;
      if (solidPx(s.x + s.w / 2, s.y + s.h / 2) || solidPx(s.x + s.w / 2, s.y + s.h)) {
        if (isRock(s)) shatterRock(s);
        else {
          s.dead = true;
          debris(s.x + 3, s.y + 3, '#9a7a5a', 2, 1);
        }
      }
      break;
    default:
      s.x += s.vx;
      s.y += s.vy;
      if (s.kind === 'fireball' && s.t % 2 === 0)
        part({ kind: 'ember', x: s.x + 6, y: s.y + 5, vx: -s.vx * 0.1, vy: -0.4, life: 12 });
  }
  if (!onScreen(s.x + s.w / 2, s.y + s.h / 2, 24)) s.dead = true;
}

function hitEnemy(s, e) {
  if (s.hits) s.hits.add(e);
  const def = EN[e.type];
  if (def.hurt && s.kind !== 'storm' && def.hurt(e, s) === 'deflect') {
    // the buster storm gets through shields
    if (s.kind === 'buster') {
      s.deflected = true;
      s.vx = -s.vx * 0.8;
      s.vy = -3.5;
    } else if (isRock(s)) shatterRock(s);
    else if (!s.pierce) s.dead = true;
    spark(s.x + s.w / 2, s.y + s.h / 2);
    sfx.deflect();
    return;
  }
  e.hp -= s.dmg;
  e.flash = 8;
  if (e.hp <= 0) {
    killEnemy(e);
    if (s.kind === 'buster' && s.level === 2) return;
  } else {
    sfx.enemyHit();
    if (s.weapon === 'snow') {
      e.frozen = 150;
      sfx.freeze();
    }
  }
  if (isRock(s)) shatterRock(s);
  else if (!s.pierce) s.dead = true;
}

function hitBoss(s) {
  const b = boss,
    def = BOSSES[b.type];
  if (b.inv > 0 || b.state === 'drop' || b.state === 'pose') return;
  if (s.hits && s.kind !== 'flame') {
    if (s.hits.has(b)) return;
    s.hits.add(b);
  }
  const bx = s.x + s.w / 2,
    by = s.y + s.h / 2;
  if (s.weapon === def.weapon) {
    // immune to its own weapon
    spark(bx, by);
    sfx.deflect();
    if (s.kind === 'buster') {
      s.deflected = true;
      s.vx = -s.vx * 0.8;
      s.vy = -3.5;
    } else if (isRock(s)) shatterRock(s);
    else if (!s.pierce) s.dead = true;
    return;
  }
  const weak = s.weapon === def.weak;
  b.hp -= weak ? (s.ultra ? 8 : s.charged ? 6 : 4) : s.kind === 'buster' ? s.dmg : s.bossDmg;
  b.inv = weak ? 40 : s.kind === 'storm' ? 8 : 24;
  if (weak) {
    sfx.weakHit();
    game.flash = 4;
    b.weakAt = game.time;
    if (b.state !== 'slide' || b.h === 24) {
      b.state = 'stagger';
      b.t = 0;
      b.vx = 0;
    }
    debris(bx, by, '#fcfcfc', 6, 2);
  } else sfx.bossHit();
  if (isRock(s)) shatterRock(s);
  else if (!s.pierce) s.dead = true;
  if (b.hp <= 0) defeatBoss();
}

function updatePlayerShots() {
  for (const s of pshots) {
    if (s.dead) continue;
    updateShot(s);
    if (s.dead || s.deflected || s.delay > 0) continue;
    for (const e of enemies) {
      if (e.dead || e.hidden || !overlap(s, e) || (s.hits && s.hits.has(e))) continue;
      hitEnemy(s, e);
      if (s.dead || s.deflected) break;
    }
    if (s.dead || s.deflected) continue;
    for (const h of hazards) {
      if (h.kind !== 'icicle' || h.state === 'gone' || !overlap(s, h) || (s.hits && s.hits.has(h))) continue;
      if (s.hits) s.hits.add(h);
      breakIcicle(h);
      addScore(50);
      if (isRock(s)) shatterRock(s);
      else if (!s.pierce) s.dead = true;
      break;
    }
    if (!s.dead && !s.deflected && boss && overlap(s, boss)) hitBoss(s);
  }
  pshots = pshots.filter(s => !s.dead);
}

// ================= PLAYER =================
function ladderOverlap(p) {
  const tx = Math.floor((p.x + p.w / 2) / TILE);
  for (let ty = Math.floor((p.y + 4) / TILE); ty <= Math.floor((p.y + p.h - 1) / TILE); ty++)
    if (isLadder(tx, ty)) return tx;
  return -1;
}
function startClimb(p, tx) {
  p.state = 'climb';
  p.x = tx * TILE + 8 - p.w / 2;
  p.vx = 0;
  p.vy = 0;
  p.onGround = false;
  p.plat = null;
  p.coyote = 0;
}
function headroom(p) {
  if (p.h === 22) return true;
  return !samples(p.x, p.x + p.w - 1).some(x => solidPx(x, p.y - 10) || solidPx(x, p.y - 1));
}
function standUp(p) {
  if (p.h === 22) return true;
  if (!headroom(p)) return false;
  p.y -= 10;
  p.h = 22;
  return true;
}
function startSlide(p) {
  p.state = 'slide';
  p.slideT = 26;
  if (p.h === 22) {
    p.y += 10;
    p.h = 12;
  }
  dust(p.x + p.w / 2 - p.facing * 6, p.y + p.h, 3);
}
// standing on an updraft pad
function padUnder(e) {
  const ty = Math.floor((e.y + e.h) / TILE);
  return samples(e.x, e.x + e.w - 1).some(x => tileAt(Math.floor(x / TILE), ty) === 'U');
}
// feet inside quicksand
const inSand = e => tileAt(Math.floor((e.x + e.w / 2) / TILE), Math.floor((e.y + e.h - 1) / TILE)) === 'Q';
// conveyor direction under the feet (-1, 0, 1)
function beltUnder(e) {
  const ty = Math.floor((e.y + e.h) / TILE);
  for (const x of samples(e.x, e.x + e.w - 1)) {
    const t = tileAt(Math.floor(x / TILE), ty);
    if (t === '<') return -1;
    if (t === '>') return 1;
  }
  return 0;
}
// body centre inside water ('W' tiles): lighter gravity and slow sinking
const inWater = e => tileAt(Math.floor((e.x + e.w / 2) / TILE), Math.floor((e.y + e.h / 2) / TILE)) === 'W';
function applyGravity(p) {
  const water = inWater(p);
  p.vy = Math.min(p.vy + (water ? 0.15 : 0.25), water ? 2.6 : 7);
  if (water && frameCount % 24 === 0) part({ kind: 'bubble', x: p.x + p.w / 2, y: p.y + 4, vx: 0, vy: -0.5, life: 50 });
  const sand = inSand(p);
  if (sand && p.vy > 0.3) p.vy = 0.3; // sinking slowly; checkHazards kills once the head goes under
  const wasGround = p.onGround;
  const r = moveY(p, p.vy, true);
  let landed = r === 1;
  p.plat = null;
  if (!landed && p.vy >= 0) {
    for (const pl of plats) {
      if (p.x + p.w > pl.x && p.x < pl.x + pl.w && p.y + p.h - p.vy <= pl.y + 1 && p.y + p.h >= pl.y) {
        p.y = pl.y - p.h;
        landed = true;
        p.plat = pl;
        break;
      }
    }
  }
  if (landed && padUnder(p)) {
    // updraft pad: launched high, the jump button does not cut this one short
    p.vy = -8;
    p.onGround = false;
    p.launched = true;
    sfx.whoosh();
    dust(p.x + p.w / 2, p.y + p.h, 4);
  } else if (landed) {
    if (!wasGround && p.vy > 2) {
      sfx.land();
      dust(p.x + p.w / 2, p.y + p.h, 2);
    }
    p.vy = 0;
    p.onGround = true;
    p.launched = false;
  } else if (sand && p.vy >= 0)
    p.onGround = true; // can still jump (weaker) out of the sand
  else {
    p.onGround = false;
    if (r === -1) p.vy = 0;
  }
}

// Shield (shop part): two orbs circle the player; an orb that touches an enemy or an enemy shot blocks it and is
// gone for SHIELD_DOWN frames
const shieldOrb = (p, i) => {
  const a = p.shieldAng + i * Math.PI;
  return { x: pcx() + Math.cos(a) * 24 - 5, y: pcy() + Math.sin(a) * 24 - 5, w: 10, h: 10 };
};
function updateShield(p) {
  if (!hasPart('shield') || !alive(p)) return;
  p.shieldAng = (p.shieldAng || 0) + 0.12;
  p.shieldCd = p.shieldCd || [0, 0];
  for (let i = 0; i < 2; i++) {
    if (p.shieldCd[i] > 0) {
      if (--p.shieldCd[i] === 0) {
        sfx.tick();
        const o = shieldOrb(p, i);
        spark(o.x + 5, o.y + 5);
      }
      continue;
    }
    const o = shieldOrb(p, i);
    let blocked = false;
    for (const s of eshots) {
      if (s.dead || s.harmless || s.delay > 0 || !overlap(o, s)) continue;
      if (!s.big) s.dead = true; // big boss attacks still go through, but the orb is spent
      blocked = true;
      break;
    }
    if (!blocked)
      for (const e of enemies) {
        if (e.dead || e.hidden || !overlap(o, e)) continue;
        hitEnemy({ kind: 'orb', weapon: 'shield', x: o.x, y: o.y, w: 10, h: 10, dmg: 2 }, e);
        blocked = true;
        break;
      }
    if (!blocked && boss && boss.inv === 0 && overlap(o, boss)) {
      hitBoss({ kind: 'orb', weapon: 'shield', x: o.x, y: o.y, w: 10, h: 10, bossDmg: 1 });
      blocked = true;
    }
    if (blocked) {
      p.shieldCd[i] = SHIELD_DOWN;
      spark(o.x + 5, o.y + 5);
      debris(o.x + 5, o.y + 5, '#78e8f8', 4, 1.5);
      sfx.deflect();
    }
  }
}

function updatePlayer() {
  const p = player;
  if (p.inv > 0) p.inv--;
  if (p.shootT > 0) p.shootT--;
  updateStorm(p);
  updateShield(p);
  if (p.stun > 0 && alive(p)) {
    // frozen in time by a boss: no control for a moment
    p.stun--;
    p.vx = 0;
    if (p.state !== 'climb') applyGravity(p);
    return;
  }
  const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  const onIce = p.onGround && standingOn(p, 'I');
  // jump buffer: a press shortly before landing still counts (as long as the key is held)
  if (hit.jump) p.jumpBuf = 8;
  else if (!inp.jump) p.jumpBuf = 0;
  else if (p.jumpBuf > 0) p.jumpBuf--;
  // coyote time: a few frames of grace after walking off a ledge
  if (p.onGround) p.coyote = 6;
  else if (p.coyote > 0) p.coyote--;
  p.jumpT++;
  const sand = inSand(p);
  const jet = hasPart('jet'); // Jetpack: higher jumps
  const doJump = () => {
    p.vy = (sand ? -4.3 : -4.9) * (jet ? 1.27 : 1);
    p.onGround = false;
    if (jet) sfx.jet();
    p.plat = null;
    p.jumpBuf = 0;
    p.coyote = 0;
    p.jumpT = 0;
  };
  const runTo = (target, accel) => {
    p.vx = onIce ? p.vx + clamp(target - p.vx, -accel, accel) : target;
  };

  if (p.onGround && (p.state === 'normal' || p.state === 'slide' || p.state === 'hurt')) {
    const b = beltUnder(p);
    if (b) moveX(p, b * 0.8);
  }
  switch (p.state) {
    case 'beam':
      p.y += 8;
      if (p.y >= p.targetY) {
        p.y = p.targetY;
        p.state = 'land';
        p.anim = 0;
        p.onGround = true;
        sfx.land();
      }
      return;
    case 'land':
      if (++p.anim > 10) {
        p.state = 'normal';
        p.anim = 0;
      }
      return;
    case 'dead':
      return;
    case 'hurt':
      p.hurtT--;
      moveX(p, -p.facing * 0.6);
      applyGravity(p);
      if (inp.shoot) chargeTick(p); // getting hit no longer cancels the charge
      if (p.hurtT <= 0) p.state = p.h < 22 ? 'slide' : 'normal';
      return;
    case 'slide': {
      if (dir) p.facing = dir;
      p.slideT--;
      runTo(p.facing * 2.6, 0.08);
      const wall = moveX(p, p.vx);
      applyGravity(p);
      handleShoot(p, false);
      if (frameCount % 6 === 0) dust(p.x + p.w / 2 - p.facing * 6, p.y + p.h, 1);
      if (p.jumpBuf > 0 && !inp.down && headroom(p) && p.onGround) {
        standUp(p);
        p.state = 'normal';
        doJump();
      } else if (p.slideT <= 0 || wall || !p.onGround) {
        if (standUp(p)) p.state = 'normal';
        else if (p.onGround)
          p.slideT = 1; // keep sliding under a low ceiling
        else p.state = 'normal';
      }
      return;
    }
    case 'climb': {
      if (dir) p.facing = dir;
      handleShoot(p, true);
      if (hit.jump) {
        p.state = 'normal';
        p.vy = 0;
        p.jumpBuf = 0;
        return;
      }
      let vdir = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);
      if (p.shootT > 0) vdir = 0;
      if (vdir) p.anim++;
      const r = moveY(p, vdir * 1.3, false);
      if (r === 1) {
        p.state = 'normal';
        p.onGround = true;
        p.vy = 0;
        return;
      }
      const tx = Math.floor((p.x + p.w / 2) / TILE),
        feetRow = Math.floor((p.y + p.h - 1) / TILE);
      if (vdir < 0 && !isLadder(tx, feetRow) && isLadder(tx, feetRow + 1)) {
        p.y = (feetRow + 1) * TILE - p.h;
        p.state = 'normal';
        p.onGround = true;
        p.vy = 0;
        return;
      }
      if (ladderOverlap(p) < 0 && !isLadder(tx, feetRow)) {
        p.state = 'normal';
        p.vy = 0;
      }
      return;
    }
  }

  // ---- normal ----
  if (p.h < 22 && !standUp(p)) {
    p.state = 'slide';
    p.slideT = 1;
    return;
  }
  const lt = ladderOverlap(p);
  if (inp.up && lt >= 0 && !(p.onGround && !isLadder(lt, Math.floor((p.y + p.h - 1) / TILE)))) {
    startClimb(p, lt);
    return;
  }
  if (inp.down && p.onGround) {
    const tx = Math.floor((p.x + p.w / 2) / TILE),
      ty = Math.floor((p.y + p.h) / TILE);
    if (ladderTop(tx, ty)) {
      startClimb(p, tx);
      p.y += 6;
      return;
    }
  }
  if (dir) p.facing = dir;
  runTo(dir * (sand ? 0.6 : 1.4), 0.05);
  if (p.onGround && !sand && (hit.slide || (p.jumpBuf > 0 && inp.down))) {
    p.jumpBuf = 0;
    startSlide(p);
    return;
  }
  if (p.jumpBuf > 0 && (p.onGround || p.coyote > 0) && p.vy >= 0) doJump();
  // releasing jump cuts the jump short, but only after a minimum hop so quick taps still jump
  if (p.vy >= 0) p.launched = false;
  if (!inp.jump && p.vy < 0 && p.jumpT > 6 && !p.launched) p.vy = 0;
  if (moveX(p, p.vx) && onIce) p.vx = 0;
  applyGravity(p);
  // the running cycle advances with the distance run (in 1.4 px steps, the running speed it was timed for), so the
  // planted foot stays put at any speed: quicksand, speeding up on ice
  if (p.onGround && Math.abs(p.vx) > 0.1) p.anim += Math.abs(p.vx) / 1.4;
  else if (!dir) p.anim = 0;
  handleShoot(p, true);
}

function damagePlayer(dmg) {
  const p = player;
  if (!dmg || p.inv > 0 || !['normal', 'climb', 'slide'].includes(p.state)) return;
  p.hp -= game.tough ? dmg / 10 : dmg; // cheat ILMUKEBAL: 10x thicker HP
  sfx.hurt();
  if (p.hp <= 1e-6) {
    p.hp = 0;
    killPlayer(true);
    return;
  }
  p.state = 'hurt';
  p.hurtT = 18;
  p.inv = hasPart('core') ? 450 : 90;
  p.vx = 0;
  p.plat = null; // Core: 5x longer
  if (p.vy < 0) p.vy = 0;
}
function killPlayer(withOrbs) {
  const p = player;
  if (!alive(p)) return;
  p.state = 'dead';
  p.hp = 0;
  p.charge = 0;
  game.deadT = 0;
  stopMusic();
  sfx.death();
  if (withOrbs) orbs(p.x + p.w / 2, p.y + p.h / 2, WEAPONS[p.weapon].pal.b);
}

function checkHazards() {
  const p = player;
  if (!alive(p) || p.state === 'beam' || p.state === 'land') return;
  if (p.y > LH * TILE + 16) {
    killPlayer(false);
    return;
  }
  const x0 = Math.floor(p.x / TILE),
    x1 = Math.floor((p.x + p.w - 1) / TILE);
  const y0 = Math.floor(p.y / TILE),
    y1 = Math.floor((p.y + p.h) / TILE);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++) {
      const t = tileAt(tx, ty);
      if (t === '~' && !hasPart('armor') && ty < Math.floor((p.y + p.h - 1) / TILE) + 1 && p.y + p.h > ty * TILE + 4) {
        killPlayer(true);
        return;
      }
      if (t === '^' && p.inv === 0 && !hasPart('boots')) {
        killPlayer(true);
        return;
      }
      if (t === 'X') {
        killPlayer(false);
        return;
      }
      if (t === 'Q' && ty === Math.floor((p.y + 3) / TILE)) {
        killPlayer(false);
        return;
      } // sank under the sand
    }
}

// ================= ENEMIES =================
function enemyShot(x, y, vx, vy, dmg = 2, extra = {}) {
  return eshots.push(
    Object.assign({ kind: 'pellet', x: x - 3, y: y - 3, w: 6, h: 6, vx, vy, dmg, t: 0, grav: 0, delay: 0 }, extra),
  );
}

const EN = {
  met: {
    w: 16,
    h: 14,
    hp: 1,
    dmg: 2,
    score: 200,
    grav: true,
    init(e) {
      e.hide = true;
      e.t = 40;
    },
    update(e) {
      physics(e);
      const dx = pcx() - (e.x + 8);
      e.facing = dx < 0 ? -1 : 1;
      e.t++;
      if (e.hide) {
        if (e.t > 70 && Math.abs(dx) < 130) {
          e.hide = false;
          e.t = 0;
        }
      } else {
        if (e.t === 14) {
          for (const a of [-0.4, 0, 0.4])
            enemyShot(e.x + 8 + e.facing * 6, e.y + 8, Math.cos(a) * 2 * e.facing, Math.sin(a) * 2);
          sfx.eshoot();
        }
        if (e.t >= 60) {
          e.hide = true;
          e.t = 0;
        }
      }
    },
    hurt(e) {
      return e.hide ? 'deflect' : 'hit';
    },
    draw(e, x, y) {
      const c = EC(),
        Y = c.a,
        Y2 = c.c;
      if (e.hide)
        sprite(
          x,
          y,
          e.facing,
          16,
          [
            [3, 6, 10, 2, Y],
            [1, 8, 14, 4, Y],
            [0, 11, 16, 3, Y2],
          ],
          [
            [4, 8, 3, 2, shade(Y, 0.5)],
            [7, 9, 2, 2, '#fcfcfc'],
          ],
        );
      else
        sprite(
          x,
          y,
          e.facing,
          16,
          [
            [3, 8, 10, 4, '#404048'],
            [2, 12, 5, 2, '#f87800'],
            [9, 12, 5, 2, '#f87800'],
            [3, 0, 10, 2, Y],
            [1, 2, 14, 4, Y],
            [0, 5, 16, 3, Y2],
          ],
          [
            [4, 2, 3, 2, shade(Y, 0.5)],
            [9, 9, 3, 2, '#fcfcfc'],
            [11, 9, 1, 2, '#000000'],
          ],
        );
    },
  },
  flyer: {
    w: 14,
    h: 12,
    hp: 1,
    dmg: 2,
    score: 150,
    init(e) {
      e.baseY = e.y;
      e.vx = pcx() < e.x ? -0.9 : 0.9;
      e.facing = Math.sign(e.vx);
    },
    update(e) {
      e.t++;
      e.baseY += Math.sign(pcy() - 6 - e.baseY) * 0.35;
      e.y = e.baseY + Math.sin(e.t * 0.07) * 18;
      e.x += e.vx;
    },
    draw(e, x, y) {
      const c = EC(),
        up = (e.t >> 2) & 1,
        L = c.fly2;
      sprite(
        x,
        y,
        e.facing,
        14,
        [[3, 2, 8, 8, c.fly], up ? [0, 0, 4, 4, L] : [0, 6, 4, 3, L], up ? [10, 0, 4, 4, L] : [10, 6, 4, 3, L]],
        [
          [4, 3, 3, 2, shade(c.fly, 0.4)],
          [8, 4, 3, 3, '#fcfcfc'],
          [9, 5, 2, 2, '#f80000'],
        ],
      );
    },
  },
  hopper: {
    w: 16,
    h: 15,
    hp: 3,
    dmg: 3,
    score: 300,
    grav: true,
    init(e) {
      e.t = 20;
    },
    update(e) {
      if (e.onGround) {
        e.vx = 0;
        e.t++;
        e.facing = pcx() < e.x + 8 ? -1 : 1;
        if (e.t > 45) {
          e.t = 0;
          e.vy = -4.6;
          e.vx = e.facing * 1.3;
          e.onGround = false;
        }
      }
      if (moveX(e, e.vx)) e.vx = 0;
      physics(e);
    },
    draw(e, x, y) {
      const c = EC(),
        G = c.hop,
        G2 = c.hop2,
        Dk = shade(c.hop, -0.45);
      const legs = e.onGround
        ? [
            [0, 12, 5, 3, Dk],
            [11, 12, 5, 3, Dk],
          ]
        : [
            [1, 11, 3, 4, Dk],
            [12, 11, 3, 4, Dk],
          ];
      sprite(
        x,
        y,
        e.facing,
        16,
        [...legs, [2, 4, 12, 8, G], [5, 0, 9, 5, G2]],
        [
          [3, 5, 4, 2, G2],
          [9, 1, 3, 3, '#fcfcfc'],
          [11, 2, 1, 2, '#000000'],
          [10, 8, 4, 1, Dk],
        ],
      );
    },
  },
  turret: {
    w: 16,
    h: 16,
    hp: 4,
    dmg: 3,
    score: 300,
    init(e) {
      e.ang = Math.PI;
    },
    update(e) {
      e.t++;
      const cx = e.x + 8,
        cy = e.y + 6,
        dx = pcx() - cx,
        dy = pcy() - cy;
      e.ang = Math.atan2(dy, dx);
      if (e.t % 90 === 60 && Math.hypot(dx, dy) < 220 && alive(player)) {
        enemyShot(
          cx + Math.cos(e.ang) * 11,
          cy + Math.sin(e.ang) * 11,
          Math.cos(e.ang) * 1.8,
          Math.sin(e.ang) * 1.8,
          3,
        );
        sfx.eshoot();
      }
    },
    draw(e, x, y) {
      const c = EC(),
        warn = e.t % 90 > 40 && e.t % 90 < 60 && e.t & 2;
      sprite(
        x,
        y,
        1,
        16,
        [
          [1, 8, 14, 8, c.tur],
          [3, 3, 10, 6, shade(c.tur, 0.3)],
        ],
        [
          [2, 9, 12, 1, shade(c.tur, 0.4)],
          [7, 11, 2, 2, warn ? '#f83800' : '#700000'],
        ],
      );
      const cx = x + 8,
        cy = y + 6;
      for (let i = 3; i < 11; i++) R(cx + Math.cos(e.ang) * i - 1, cy + Math.sin(e.ang) * i - 1, 3, 3, '#202028');
      if (warn) glow(x + 8, y + 12, 8, '#f83800', 0.6);
    },
  },

  // ---- stage-specific enemies ----
  blader: {
    // cut: flying scissor head that hovers, then dives at the player
    w: 14,
    h: 12,
    hp: 1,
    dmg: 3,
    score: 250,
    init(e) {
      e.baseY = e.y;
      e.mode = 'hover';
      e.cd = 40;
    },
    update(e) {
      e.t++;
      const dx = pcx() - (e.x + 7),
        dy = pcy() - (e.y + 6);
      if (e.mode === 'hover') {
        e.facing = dx < 0 ? -1 : 1;
        e.x += clamp(dx, -0.6, 0.6);
        e.y = e.baseY + Math.sin(e.t * 0.08) * 4;
        if (--e.cd <= 0 && Math.abs(dx) < 90 && dy > 0) {
          const d = Math.hypot(dx, dy) || 1;
          e.vx = (dx / d) * 3.2;
          e.vy = (dy / d) * 3.2;
          e.mode = 'dive';
          e.t = 0;
          sfx.cutter();
        }
      } else if (e.mode === 'dive') {
        e.x += e.vx;
        e.y += e.vy;
        if (e.t > 40 || solidPx(e.x + 7, e.y + 12)) e.mode = 'back';
      } else {
        e.y -= 1.6;
        e.x += e.vx * 0.2;
        if (e.y <= e.baseY) {
          e.y = e.baseY;
          e.mode = 'hover';
          e.cd = 70;
        }
      }
    },
    draw(e, x, y) {
      const open = e.mode === 'dive' || (e.t >> 3) & 1,
        B = '#e8e8f0';
      const blades = open
        ? [
            [0, -4, 3, 7, B],
            [11, -4, 3, 7, B],
          ]
        : [
            [3, -5, 3, 7, B],
            [8, -5, 3, 7, B],
          ];
      sprite(
        x,
        y,
        e.facing,
        14,
        [...blades, [2, 2, 10, 9, '#a8a8b8'], [4, 10, 6, 2, '#c83010']],
        [
          [5, 4, 4, 4, '#fcfcfc'],
          [7, 5, 2, 2, '#f80000'],
          [3, 3, 2, 1, '#d0d0dc'],
        ],
      );
    },
  },
  totem: {
    // fire: stone idol that lobs two arcing fireballs
    w: 16,
    h: 24,
    hp: 4,
    dmg: 3,
    score: 300,
    grav: true,
    init(e) {
      e.t = 40;
    },
    update(e) {
      physics(e);
      e.t++;
      const dx = pcx() - (e.x + 8);
      e.facing = dx < 0 ? -1 : 1;
      if (e.t % 110 === 0 && Math.abs(dx) < 220 && alive(player)) {
        for (const v of [1.2, 2.2])
          enemyShot(e.x + 8, e.y + 8, e.facing * v, -4, 3, {
            kind: 'fireball',
            w: 12,
            h: 10,
            x: e.x + 2,
            y: e.y + 3,
            grav: 0.18,
            solidDie: true,
          });
        sfx.fire();
      }
    },
    draw(e, x, y) {
      const hot = e.t % 110 > 85,
        M = hot && frameCount & 2 ? '#f8d800' : hot ? '#f86000' : '#2a1010';
      sprite(
        x,
        y,
        e.facing,
        16,
        [
          [1, 0, 14, 8, '#7a6060'],
          [2, 8, 12, 8, '#6a5050'],
          [1, 16, 14, 8, '#7a6060'],
        ],
        [
          [3, 2, 3, 3, M],
          [10, 2, 3, 3, M],
          [4, 11, 8, 3, M],
          [2, 17, 12, 1, '#5a4040'],
          [2, 20, 12, 1, '#5a4040'],
          [0, 7, 16, 1, '#a88888'],
        ],
      );
      if (hot) glow(x + 8, y + 12, 12, '#f86000', 0.6);
    },
  },
  watcher: {
    // elec: eye pod that drifts to the player's height and fires bolts both ways when level with them
    w: 14,
    h: 14,
    hp: 2,
    dmg: 3,
    score: 250,
    init(e) {
      e.baseY = e.y;
      e.cd = 40;
    },
    update(e) {
      e.t++;
      const ty = clamp(pcy() - 7, e.baseY - 96, e.baseY + 96);
      e.y += clamp(ty - e.y, -0.9, 0.9);
      if (e.cd > 0) e.cd--;
      else if (Math.abs(pcy() - (e.y + 7)) < 8 && Math.abs(pcx() - (e.x + 7)) < 200 && alive(player)) {
        e.cd = 80;
        sfx.zap();
        for (const d of [-1, 1])
          enemyShot(e.x + 7, e.y + 7, d * 3, 0, 3, { kind: 'ebolt', w: 14, h: 8, x: e.x + d * 10, y: e.y + 3 });
      }
    },
    draw(e, x, y) {
      const charged = e.cd < 15;
      sprite(
        x,
        y,
        1,
        14,
        [
          [1, 1, 12, 12, '#384060'],
          [5, -2, 4, 3, '#f8d800'],
          [5, 13, 4, 3, '#f8d800'],
        ],
        [
          [3, 4, 8, 6, '#fcfcfc'],
          [6, 5, 3, 4, charged ? '#f83800' : '#2838a8'],
          [3, 3, 3, 1, '#6878a0'],
        ],
      );
      if (charged) glow(x + 7, y + 7, 12, '#f8e030', 0.6);
    },
  },
  snowman: {
    // snow: throws snowballs in an arc at the player
    w: 16,
    h: 24,
    hp: 4,
    dmg: 3,
    score: 300,
    grav: true,
    init(e) {
      e.t = 30;
      e.arm = 0;
    },
    update(e) {
      physics(e);
      e.t++;
      if (e.arm > 0) e.arm--;
      const dx = pcx() - (e.x + 8);
      e.facing = dx < 0 ? -1 : 1;
      if (e.t % 90 === 0 && Math.abs(dx) < 220 && alive(player)) {
        enemyShot(e.x + 8, e.y + 6, clamp(dx / 50, -3, 3), -4.2, 3, {
          kind: 'snowball',
          w: 10,
          h: 10,
          x: e.x + 3,
          y: e.y + 1,
          grav: 0.17,
          solidDie: true,
        });
        e.arm = 12;
      }
    },
    draw(e, x, y) {
      const S = '#f0f8ff',
        st = '#6a4a2a';
      sprite(
        x,
        y,
        e.facing,
        16,
        [
          [1, 12, 14, 12, S],
          [3, 3, 10, 10, S],
          [4, -1, 8, 4, '#202028'],
          [2, 2, 12, 1, '#202028'],
          e.arm ? [13, 6, 4, 2, st] : [13, 11, 4, 2, st],
          [-1, 12, 3, 2, st],
        ],
        [
          [7, 6, 1, 2, '#000000'],
          [10, 6, 1, 2, '#000000'],
          [11, 8, 4, 1, '#f87800'],
          [7, 15, 2, 2, '#384868'],
          [7, 19, 2, 2, '#384868'],
          [4, 1, 8, 1, '#c83010'],
        ],
      );
    },
  },
  fanbot: {
    // wind: hovering fan that blows the player away when they are in front of it
    w: 16,
    h: 16,
    hp: 3,
    dmg: 3,
    score: 250,
    init(e) {
      e.baseY = e.y;
    },
    update(e) {
      e.t++;
      e.y = e.baseY + Math.sin(e.t * 0.05) * 3;
      const dx = pcx() - (e.x + 8);
      e.facing = dx < 0 ? -1 : 1;
      e.blowing = Math.abs(dx) < 130 && Math.abs(pcy() - (e.y + 8)) < 56 && alive(player) && player.state !== 'climb';
      if (e.blowing && !hasPart('windproof')) moveX(player, e.facing * 0.75);
    },
    draw(e, x, y) {
      const spin = (e.t >> 1) & 1;
      sprite(
        x,
        y,
        e.facing,
        16,
        [
          [1, 2, 10, 12, '#5a6a8a'],
          [10, 0, 4, 16, '#8898b8'],
        ],
        [
          [3, 4, 6, 4, '#a8b8d8'],
          [4, 9, 2, 2, '#f83800'],
          spin ? [14, 2, 2, 5, '#e8f0f8'] : [14, 9, 2, 5, '#e8f0f8'],
          spin ? [14, 9, 2, 5, '#a8b8d8'] : [14, 2, 2, 5, '#a8b8d8'],
        ],
      );
      if (e.blowing)
        for (let i = 0; i < 4; i++) {
          const k = (frameCount * 4 + i * 23) % 70;
          R(e.facing > 0 ? x + 18 + k : x - 18 - k - 8, y + 2 + i * 4, 8, 1, 'rgba(232,248,255,0.8)');
        }
    },
  },
  mole: {
    // earth: digs under the ground toward the player, then bursts out right under them
    w: 16,
    h: 14,
    hp: 2,
    dmg: 3,
    score: 300,
    init(e) {
      e.floorY = e.y + e.h;
      e.mode = 'under';
      e.hidden = true;
    },
    update(e) {
      e.t++;
      const dx = pcx() - (e.x + 8);
      if (e.mode === 'under') {
        e.hidden = true;
        const nx = e.x + Math.sign(dx) * 1.1;
        if (Math.abs(dx) > 1 && isSolidTile(tileAt(Math.floor((nx + 8) / TILE), Math.floor(e.floorY / TILE)))) e.x = nx;
        if (e.t % 6 === 0) dust(e.x + 8, e.floorY, 1);
        if (Math.abs(dx) < 10 && e.t > 50 && Math.abs(pcy() - e.floorY) < 64) {
          e.mode = 'warn';
          e.t = 0;
        }
      } else if (e.mode === 'warn') {
        if (e.t % 3 === 0) debris(e.x + 8, e.floorY - 2, '#8a6a4a', 1, 1);
        if (e.t > 22) {
          e.mode = 'up';
          e.hidden = false;
          e.vy = -5.2;
          e.t = 0;
          sfx.crumble();
        }
      } else if (e.mode === 'up') {
        e.vy = Math.min(e.vy + 0.25, 7);
        e.y += e.vy;
        if (e.vy > 0 && e.y + e.h >= e.floorY) {
          e.y = e.floorY - e.h;
          e.mode = 'out';
          e.t = 0;
        }
      } else {
        e.facing = dx < 0 ? -1 : 1;
        if (e.t > 50) {
          e.mode = 'under';
          e.hidden = true;
          e.t = 0;
          dust(e.x + 8, e.floorY, 3);
        }
      }
    },
    draw(e, x, y) {
      if (e.hidden) {
        const sh = e.mode === 'warn' && frameCount & 2 ? 1 : 0;
        R(x + 2 + sh, y + e.h - 3, 12, 3, '#6a4a2a');
        R(x + 4 + sh, y + e.h - 5, 8, 2, '#8a6a4a');
        return;
      }
      sprite(
        x,
        y,
        e.facing,
        16,
        [
          [1, 3, 12, 11, '#5a4a5a'],
          [12, 5, 4, 4, '#c8c8d0'],
          [0, 10, 4, 4, '#e8a0a0'],
        ],
        [
          [8, 5, 2, 2, '#000000'],
          [14, 6, 2, 2, '#fcfcfc'],
          [3, 4, 4, 1, '#7a6a7a'],
          [10, 11, 3, 2, '#e8a0a0'],
        ],
      );
    },
  },
};

function createEnemy(s) {
  const def = EN[s.type];
  const e = {
    type: s.type,
    w: def.w,
    h: def.h,
    hp: def.hp,
    vx: 0,
    vy: 0,
    t: 0,
    facing: -1,
    flash: 0,
    frozen: 0,
    dead: false,
    onGround: false,
    spawn: s,
  };
  e.x = s.tx * TILE + 8 - def.w / 2;
  e.y = s.type === 'flyer' ? s.ty * TILE : (s.ty + 1) * TILE - def.h;
  if (def.init) def.init(e);
  return e;
}
// enemies spawn when their spot scrolls into view (horizontally and vertically: caves sit under the surface)
function updateSpawns() {
  for (const s of spawns) {
    const sx = s.tx * TILE + 8,
      sy = s.ty * TILE + 8;
    const on = sx > camX - 8 && sx < camX + VW + 8 && sy > camY - 24 && sy < camY + VH + 24;
    if (on) {
      if (s.armed && !s.ent) {
        s.ent = createEnemy(s);
        enemies.push(s.ent);
        s.armed = false;
      }
    } else if (!s.ent) s.armed = true;
  }
}
function killEnemy(e) {
  e.dead = true;
  e.spawn.ent = null;
  boom(e.x + e.w / 2, e.y + e.h / 2);
  sfx.explode();
  addScore(EN[e.type].score);
  const r = Math.random();
  if (r < 0.02) pickups.push(makePickup('L', e.x + e.w / 2, e.y));
  else if (r < 0.08) pickups.push(makePickup('E', e.x + e.w / 2, e.y));
  else if (r < 0.25) pickups.push(makePickup('h', e.x + e.w / 2, e.y));
}
function updateEnemies() {
  for (const e of enemies) {
    if (e.flash > 0) e.flash--;
    if (game.timeStop > 0) e.frozen = Math.max(e.frozen, 2); // Time Stopper
    if (e.frozen > 0) {
      e.frozen--;
      if (EN[e.type].grav) physics(e);
    } else {
      EN[e.type].update(e);
      if (alive(player) && !e.hidden && overlap(e, player)) damagePlayer(EN[e.type].dmg);
    }
    const inAbyss = tileAt(Math.floor((e.x + e.w / 2) / TILE), Math.floor((e.y + e.h / 2) / TILE)) === 'X';
    if (inAbyss || e.x + e.w < camX - 40 || e.x > camX + VW + 40 || e.y > camY + VH + 96 || e.y + e.h < camY - 96) {
      e.dead = true;
      e.spawn.ent = null;
    }
  }
  enemies = enemies.filter(e => !e.dead);
}

// ================= HAZARDS & PLATFORMS =================
// hazards shared by several stages (a continent's own are in its file)
const CRUSHER_COLS = {
  time: ['#b0743c', '#f0c040', '#4a2c18'],
  toxic: ['#6e7a52', '#b4ee46', '#2e3420'],
  shadow: ['#5a4e78', '#c878ff', '#1e1830'],
};
Object.assign(HAZARD_KINDS, {
  // a press: a heavy head on a piston that slams down from the ceiling (its top at row y) until it rests on row y1,
  // w tiles wide; up for 60 frames, shaking for 24, a fast slam, down for 30, then a slow climb back. Being under it
  // when it comes down hurts badly
  crusher: {
    make: d => {
      const top = d.y * TILE,
        low = d.y1 * TILE - 26,
        slam = Math.max(4, Math.round(Math.sqrt((low - top) / 4.5))),
        rise = Math.ceil((low - top) / 1.4);
      return {
        x: d.x * TILE,
        y: top,
        w: (d.w || 2) * TILE,
        h: 26,
        top,
        low,
        slam,
        rise,
        period: Math.max(d.period || 0, 84 + slam + 30 + rise + 20),
        phase: d.phase || 0,
        state: 'up',
      };
    },
    update(h, p) {
      const t = (frameCount + h.phase) % h.period,
        s1 = 84 + h.slam,
        s2 = s1 + 30,
        was = h.state;
      if (t < 60) {
        h.state = 'up';
        h.y = h.top;
      } else if (t < 84) {
        h.state = 'warn';
        h.y = h.top + ((t >> 1) & 1);
      } else if (t < s1) {
        h.state = 'slam';
        h.y = h.top + (h.low - h.top) * ((t - 84) / h.slam) ** 2;
      } else if (t < s2) {
        h.state = 'down';
        h.y = h.low;
      } else {
        h.state = 'rise';
        h.y = Math.max(h.top, h.low - (t - s2) * 1.4);
      }
      if (h.state === 'down' && was === 'slam' && onScreen(h.x + h.w / 2, h.low, 0)) {
        game.shake = Math.max(game.shake, 4);
        sfx.land();
        dust(h.x + h.w / 2, h.low + h.h, 4);
      }
      if (alive(p) && overlap(h, p)) damagePlayer(h.state === 'slam' || h.state === 'down' ? 8 : 3);
    },
    draw(h) {
      const [c, stripe, dark] = CRUSHER_COLS[level.theme] || ['#8a92a8', '#f8c838', '#2a2c36'],
        x = h.x - camX,
        y = Math.round(h.y) - camY,
        top = h.top - camY,
        mid = x + h.w / 2;
      // the piston rod down from the ceiling
      R(mid - 3, top, 6, y - top + 1, dark);
      R(mid - 2, top, 2, y - top, shade(c, 0.3));
      // the head: steel with hazard stripes and teeth along its foot
      R(x - 1, y - 1, h.w + 2, h.h + 2, '#0a0a12');
      R(x, y, h.w, h.h, c);
      R(x, y, h.w, 2, shade(c, 0.4));
      R(x, y + h.h - 7, h.w, 3, stripe);
      for (let i = 0; i < h.w; i += 6) R(x + i, y + h.h - 7, 3, 3, dark);
      for (let i = 1; i < h.w - 2; i += 4) R(x + i, y + h.h - 4, 2, 4, shade(c, -0.35));
      if (h.state === 'warn' && frameCount & 4) R(x, y + h.h, h.w, 1, 'rgba(255,255,255,0.5)');
    },
  },
  // a liquid (lava, or acid in Toxaris's stage) that rises up a shaft once the player has climbed out of its pool:
  // columns x..x1, from its pool at row y up to row y1 at `speed` pixels a frame, starting `delay` frames after the
  // player leaves the pool (it rumbles meanwhile); touching it is death
  rising: {
    make: d => ({
      x0: d.x * TILE,
      x1: (d.x1 + 1) * TILE,
      start: (d.y + 1) * TILE,
      surface: (d.y + 1) * TILE,
      top: d.y1 * TILE,
      speed: d.speed || 0.4,
      wait: d.delay || 0,
      on: false,
    }),
    update(h, p) {
      const inside = alive(p) && pcx() > h.x0 && pcx() < h.x1;
      if (!h.on && inside && p.y + p.h < h.start - TILE) {
        h.on = true;
        sfx.rumble();
        game.shake = Math.max(game.shake, 6);
      }
      if (h.on && h.wait > 0) h.wait--;
      else if (h.on && h.surface > h.top) {
        h.surface = Math.max(h.top, h.surface - h.speed);
        if (frameCount % 50 === 0 && inside) sfx.rumble();
      }
      if (inside && p.y + p.h > h.surface + 5 && !hasPart('armor')) killPlayer(true);
    },
    draw(h) {
      const [base, crest, foam] = LIQUID[level.theme] || ['#c83000', '#f8a800', '#f86018'],
        x = h.x0 - camX,
        w = h.x1 - h.x0,
        y = Math.round(h.surface) - camY,
        bot = h.start + TILE - camY;
      if (y > VH || bot < 0) return;
      R(x, y, w, bot - y, base);
      for (let i = 0; i < w; i += 4) R(x + i, y + Math.round(Math.sin((frameCount + i * 3) * 0.12)), 4, 2, crest);
      for (let i = 2; i < w; i += 9) R(x + i, y + 4 + (((frameCount >> 3) + i) % 6), 2, 2, foam);
      glow(x + w / 2, y, w * 0.6, crest, 0.35);
    },
  },
});
function makeHazard(d) {
  if (HAZARD_KINDS[d.type]) return Object.assign({ kind: d.type }, HAZARD_KINDS[d.type].make(d));
  switch (d.type) {
    case 'saw': {
      const ax = d.x * TILE + 8,
        ay = d.y * TILE + 8,
        bx = d.x1 * TILE + 8,
        by = d.y1 * TILE + 8;
      return {
        kind: 'saw',
        ax,
        ay,
        bx,
        by,
        u: 0,
        du: d.speed / (Math.hypot(bx - ax, by - ay) || 1),
        x: ax - 9,
        y: ay - 9,
        w: 18,
        h: 18,
        rot: 0,
      };
    }
    case 'jet':
      return {
        kind: 'jet',
        cx: d.x * TILE + 8,
        base: d.y * TILE,
        phase: d.phase || 0,
        period: 150,
        x: d.x * TILE + 1,
        y: d.y * TILE - 48,
        w: 14,
        h: 48,
        on: false,
        warn: false,
      };
    case 'icicle':
      return {
        kind: 'icicle',
        hx: d.x * TILE + 4,
        hy: d.y * TILE,
        x: d.x * TILE + 4,
        y: d.y * TILE,
        w: 8,
        h: 14,
        state: 'hang',
        t: 0,
        vy: 0,
      };
    case 'rockfall':
      return {
        kind: 'rockfall',
        cx: d.x * TILE + 8,
        gy: (d.y > 0 ? d.y : FLOOR) * TILE,
        period: d.period || 110,
        phase: d.phase || 0,
      };
    // fire: a magma bubble that leaps out of the lava surface at row y
    case 'bubble':
      return {
        kind: 'bubble',
        x: d.x * TILE + 2,
        y: d.y * TILE + 2,
        baseY: d.y * TILE + 2,
        w: 12,
        h: 12,
        vy: 0,
        on: false,
        period: d.period || 140,
        phase: d.phase || 0,
      };
    // elec: energy block `idx` of a sequence of `n`; each one is solid for 3 steps, one step after the previous
    case 'eblock':
      return {
        kind: 'eblock',
        tx: d.x,
        ty: d.y,
        x: d.x * TILE,
        y: d.y * TILE,
        w: (d.w || 2) * TILE,
        h: TILE,
        idx: d.idx,
        n: d.n,
        step: d.step || 45,
        on: false,
        t: 0,
      };
    // snow: blizzard over columns x..x1 that pushes toward `dir` (calm 120 frames, 40 warning, 100 gust)
    case 'wind':
      return {
        kind: 'wind',
        x0: d.x * TILE,
        x1: (d.x1 + 1) * TILE,
        dir: d.dir || -1,
        phase: d.phase || 0,
        period: 260,
        state: 'calm',
      };
    case 'zap': {
      const top = d.y * TILE,
        bot = (d.y1 + 1) * TILE;
      return {
        kind: 'zap',
        cx: d.x * TILE + 8,
        top,
        bot,
        phase: d.phase || 0,
        period: 150,
        x: d.x * TILE + 3,
        y: top + 4,
        w: 10,
        h: bot - top - 8,
        on: false,
        warn: false,
      };
    }
  }
}
function breakIcicle(h) {
  h.state = 'gone';
  debris(h.x + 4, h.y + 8, '#c8f0fc', 6, 1.5);
  sfx.shatter();
}
function updateHazards() {
  const p = player;
  if (game.timeStop > 0) return; // Time Stopper: everything holds still
  for (const h of hazards) {
    if (HAZARD_KINDS[h.kind]) {
      HAZARD_KINDS[h.kind].update(h, p);
      continue;
    }
    switch (h.kind) {
      case 'saw': {
        h.u += h.du;
        if (h.u > 1 || h.u < 0) {
          h.du = -h.du;
          h.u = clamp(h.u, 0, 1);
        }
        const cx = h.ax + (h.bx - h.ax) * h.u,
          cy = h.ay + (h.by - h.ay) * h.u;
        h.x = cx - 9;
        h.y = cy - 9;
        h.rot += 0.3;
        if (alive(p) && overlap(h, p)) damagePlayer(4);
        break;
      }
      case 'jet': {
        const t = (frameCount + h.phase) % h.period;
        const was = h.on;
        h.warn = t < 36;
        h.on = t >= 36 && t < 96;
        if (h.on && !was && onScreen(h.cx, h.base, 0)) sfx.flame();
        if (h.warn && frameCount % 5 === 0 && onScreen(h.cx, h.base))
          part({
            kind: 'ember',
            x: h.cx + (Math.random() - 0.5) * 10,
            y: h.base - 2,
            vy: -0.6 - Math.random(),
            life: 22,
          });
        if (h.on && alive(p) && overlap(h, p)) damagePlayer(4);
        break;
      }
      case 'bubble': {
        const t = (frameCount + h.phase) % h.period;
        if (t === 0) {
          h.on = true;
          h.vy = -6.4;
          h.y = h.baseY;
        }
        if (h.on) {
          h.vy += 0.2;
          h.y += h.vy;
          if (h.vy > 0 && h.y > h.baseY) h.on = false;
          if (frameCount % 3 === 0) part({ kind: 'ember', x: h.x + 6, y: h.y + 10, vy: 0.3, life: 12 });
          if (alive(p) && overlap(h, p)) damagePlayer(3);
        }
        break;
      }
      case 'eblock': {
        const per = (h.n + 2) * h.step;
        h.t = (((frameCount - h.idx * h.step) % per) + per) % per;
        const want = h.t < h.step * 3;
        if (want !== h.on && !(want && alive(p) && overlap(h, p))) {
          // never appear inside the player
          h.on = want;
          for (let i = 0; i < h.w / TILE; i++) map[h.ty][h.tx + i] = h.on ? 'Y' : '.';
          if (h.on && onScreen(h.x + h.w / 2, h.y)) sfx.tick();
        }
        break;
      }
      case 'wind': {
        const t = (frameCount + h.phase) % h.period;
        h.state = t < 120 ? 'calm' : t < 160 ? 'warn' : 'gust';
        const inside = pcx() > h.x0 && pcx() < h.x1;
        if (t === 160 && inside) noise(1.6, 0.12, 0, 900);
        if (h.state === 'gust' && inside && alive(p) && p.state !== 'climb' && !hasPart('windproof'))
          moveX(p, h.dir * 0.7);
        break;
      }
      case 'zap': {
        // 30 frames of warning sparks, 50 frames live, 70 frames off
        const t = (frameCount + h.phase) % h.period,
          was = h.on;
        h.warn = t < 30;
        h.on = t >= 30 && t < 80;
        if (h.on && !was && onScreen(h.cx, (h.top + h.bot) / 2, 0)) sfx.zap();
        if (h.on && alive(p) && overlap(h, p)) damagePlayer(4);
        break;
      }
      case 'icicle':
        if (h.state === 'hang') {
          if (alive(p) && Math.abs(pcx() - (h.x + 4)) < 30 && p.y > h.y && onScreen(h.x, h.y)) {
            h.state = 'shake';
            h.t = 0;
          }
        } else if (h.state === 'shake') {
          h.x = h.hx + (h.t & 2 ? 1 : -1);
          if (++h.t > 18) {
            h.state = 'fall';
            h.x = h.hx;
          }
        } else if (h.state === 'fall') {
          h.vy = Math.min(h.vy + 0.3, 7);
          h.y += h.vy;
          if (solidPx(h.x + 4, h.y + h.h)) breakIcicle(h);
        }
        if (h.state !== 'gone' && alive(p) && overlap(h, p)) damagePlayer(4);
        break;
      case 'rockfall': {
        const t = (frameCount + h.phase) % h.period;
        // only while the floor the rocks land on is in view (not when the player is in a cave underneath)
        if (h.cx > camX - 16 && h.cx < camX + VW + 16 && h.gy > camY && h.gy < camY + VH + 32) {
          if (t === h.period - 30)
            for (let i = 0; i < 3; i++)
              part({
                kind: 'debris',
                x: h.cx + (Math.random() - 0.5) * 12,
                y: camY,
                vx: 0,
                vy: 1 + Math.random(),
                grav: 0.15,
                life: 40,
                col: '#8a6a4a',
                size: 2,
              });
          if (t === 0)
            enemyShot(h.cx, camY - 8, 0, 0, 3, {
              kind: 'rock',
              x: h.cx - 7,
              y: camY - 22,
              w: 14,
              h: 14,
              grav: 0.3,
              solidDie: true,
              big: true,
            });
        }
        break;
      }
    }
  }
}

function makePlat(d) {
  // a platform on a circle (gear platforms): centre at tile x,y, radius r tiles, speed in radians per frame
  if (d.r)
    return {
      circle: true,
      cx: d.x * TILE + 16,
      cy: d.y * TILE + 4,
      r: d.r * TILE,
      a: d.phase || 0,
      spd: d.speed || 0.02,
      x: 0,
      y: 0,
      w: 32,
      h: 8,
      dx: 0,
      dy: 0,
    };
  const ax = d.x * TILE,
    ay = d.y * TILE,
    bx = d.x1 * TILE,
    by = d.y1 * TILE;
  return {
    ax,
    ay,
    bx,
    by,
    u: 0,
    du: d.speed / (Math.hypot(bx - ax, by - ay) || 1),
    hold: 0,
    x: ax,
    y: ay,
    w: 32,
    h: 8,
    dx: 0,
    dy: 0,
  };
}
function updatePlats() {
  for (const pl of plats) {
    const ox = pl.x,
      oy = pl.y;
    if (pl.circle) {
      pl.a += pl.spd;
      pl.x = pl.cx + Math.cos(pl.a) * pl.r - 16;
      pl.y = pl.cy + Math.sin(pl.a) * pl.r - 4;
    } else if (pl.hold > 0) pl.hold--;
    else {
      pl.u += pl.du;
      if (pl.u > 1 || pl.u < 0) {
        pl.du = -pl.du;
        pl.u = clamp(pl.u, 0, 1);
        pl.hold = 30;
      }
    }
    if (!pl.circle) {
      pl.x = pl.ax + (pl.bx - pl.ax) * pl.u;
      pl.y = pl.ay + (pl.by - pl.ay) * pl.u;
    }
    pl.dx = pl.x - ox;
    pl.dy = pl.y - oy;
    if (player.plat === pl && alive(player) && player.state !== 'climb') {
      moveX(player, pl.dx);
      player.y = pl.y - player.h;
    }
  }
}

function updateCrumbles() {
  const p = player;
  if (p.onGround && alive(p)) {
    const ty = Math.floor((p.y + p.h) / TILE);
    for (const x of samples(p.x, p.x + p.w - 1)) {
      const tx = Math.floor(x / TILE),
        k = tx + ',' + ty;
      if (tileAt(tx, ty) === 'C' && !crumbling.has(k)) crumbling.set(k, { tx, ty, t: 0 });
    }
  }
  for (const c of crumbling.values()) {
    if (++c.t === 26) {
      map[c.ty][c.tx] = '.';
      debris(c.tx * TILE + 8, c.ty * TILE + 8, '#a8784a', 6, 1.2);
      if (onScreen(c.tx * TILE, c.ty * TILE)) sfx.crumble();
    }
  }
}

// ================= ENEMY / BOSS PROJECTILES =================
const PIERCING = new Set(['bcutter', 'wave', 'pillar', 'quake', 'lbolt', 'gspark', 'ecyclone']);
function updateEnemyShots() {
  const R_ = ROOM();
  if (game.timeStop > 0) return; // Time Stopper: shots hang in the air
  for (const s of eshots) {
    s.t++;
    if (s.delay > 0) {
      s.delay--;
      if (s.kind === 'fallrock' && s.t % 8 === 0)
        part({ kind: 'debris', x: s.x + s.w / 2, y: s.y, vy: 1, grav: 0.15, life: 30, col: '#8a6a4a', size: 2 });
      continue;
    }
    const EK = ESHOT_KINDS[s.kind];
    if (EK && EK.update) EK.update(s);
    else
      switch (s.kind) {
        case 'bcutter': {
          const o = s.owner;
          if (!boss || boss !== o) {
            s.dead = true;
            break;
          }
          // it flies back to his throwing hand
          const tx = s.back ? o.x + o.w / 2 + o.facing * 12 : s.tx,
            ty = s.back ? o.y + 10 : s.ty;
          const dx = tx - (s.x + 7),
            dy = ty - (s.y + 7),
            d = Math.hypot(dx, dy) || 1,
            sp = s.back ? 4.6 : 4.2;
          s.x += (dx / d) * Math.min(sp, d);
          s.y += (dy / d) * Math.min(sp, d);
          if (!s.back && (d < 6 || s.t > 55)) s.back = true;
          else if (s.back && d < 10) {
            s.dead = true;
            o.hasCutter = true;
          }
          break;
        }
        case 'pillar':
        case 'pwarn':
        case 'lbolt':
        case 'bwarn':
          if (--s.life <= 0) s.dead = true;
          break;
        case 'wave':
        case 'quake':
        case 'gspark':
        case 'ecyclone':
          s.x += s.vx;
          if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + s.h / 2)) {
            s.dead = true;
            debris(
              s.x + s.w / 2,
              s.y + s.h / 2,
              { wave: '#f8a800', quake: '#8a6a4a', gspark: '#f8f058', ecyclone: '#d8f8ec' }[s.kind],
              4,
            );
          }
          if (s.kind === 'quake' && frameCount % 4 === 0) dust(s.x + s.w / 2, s.y + s.h, 1);
          break;
        case 'boulder':
          s.vy = Math.min(s.vy + s.grav, 7);
          s.x += s.vx;
          s.y += s.vy;
          if (solidPx(s.x + s.w / 2, s.y + s.h) || solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + s.h / 2)) {
            s.dead = true;
            sfx.shatter();
            const cx = s.x + s.w / 2,
              cy = Math.min(s.y + s.h / 2, R_.floor - 8);
            for (const v of [-2.6, -1.2, 1.2, 2.6])
              enemyShot(cx, cy, v, -3 - Math.abs(v) * 0.3, 3, { kind: 'frag', grav: 0.2, solidDie: true });
            debris(cx, cy, '#8a6a4a', 8);
          }
          break;
        default:
          if (s.grav) s.vy = Math.min(s.vy + s.grav, 8);
          s.x += s.vx;
          s.y += s.vy;
          if (s.solidDie && s.vy > 0 && s.y > camY && solidPx(s.x + s.w / 2, s.y + s.h)) {
            s.dead = true;
            const ice = s.kind === 'fallice' || s.kind === 'snowball';
            debris(
              s.x + s.w / 2,
              s.y + s.h - 2,
              s.kind === 'snowball' ? '#f0f8ff' : ice ? '#c8f0fc' : s.kind === 'fireball' ? '#f8a800' : '#8a6a4a',
              6,
              1.5,
            );
            if (ice) sfx.shatter();
            else if (s.kind !== 'frag') sfx.crumble();
          }
      }
    if (s.dead) continue;
    if (!s.harmless && alive(player) && overlap(s, player)) {
      damagePlayer(s.dmg);
      if (!PIERCING.has(s.kind) && !(ESHOT_KINDS[s.kind] && ESHOT_KINDS[s.kind].pierce)) s.dead = true;
    }
    if (
      s.kind !== 'bcutter' &&
      (s.x + s.w < camX - 32 || s.x > camX + VW + 32 || s.y > camY + VH + 32 || s.y < camY - 96)
    )
      s.dead = true;
  }
  eshots = eshots.filter(s => !s.dead);
}

// ================= BOSSES =================
const bcx = b => b.x + b.w / 2;
function faceP(b) {
  b.facing = pcx() < bcx(b) ? -1 : 1;
}
function bossToIdle(b) {
  b.state = 'idle';
  b.t = 0;
  b.vx = 0;
  b.fired = false;
}
function pick(b, opts) {
  const o = opts.filter(a => a !== b.last);
  b.state = b.last = o[Math.floor(Math.random() * o.length)];
  b.t = 0;
  b.fired = false;
}
function jumpAt(b, vy, frames, maxV) {
  b.vy = vy;
  b.vx = clamp((pcx() - bcx(b)) / frames, -maxV, maxV);
  b.onGround = false;
}
function airborne(b) {
  if (moveX(b, b.vx)) b.vx = 0;
  physics(b);
}

// Voltrax's Volt Rush leaves an electric trail on the floor where he has dashed past (live only when he is enraged)
Object.assign(ESHOT_KINDS, {
  vtrail: {
    pierce: true,
    update(s) {
      if (--s.life <= 0) s.dead = true;
    },
    draw(s, x, y) {
      if (s.life < 8 && frameCount & 1) return; // flickering out
      for (let i = 0; i < 2; i++)
        drawBolt(
          x + 1 + i * 5,
          y + s.h,
          x + 6 + i * 5,
          y + 1 + ((frameCount + i) % 3),
          frameCount + s.x + i * 5,
          '#78d8fc',
          1,
          4,
        );
      glow(x + s.w / 2, y + s.h, 8, '#58b8f8', 0.35);
    },
  },
});

const BOSSES = {
  cut: {
    name: 'SNIPTOR',
    style: 'cut',
    pal: { B: '#a8183c', b: '#f8c858', S: SKIN },
    weapon: 'cut',
    weak: 'snow',
    pose: (b, pose) => (b.state === 'stagger' ? 'hurt' : pose),
    update(b, enr) {
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 16 : 30)) {
            const r = Math.random();
            if (b.hasCutter && r < 0.45) {
              b.state = 'throw';
              b.t = 0;
            } else pick(b, ['jump', 'run']);
          }
          break;
        case 'throw':
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t === 10) {
            b.hasCutter = false;
            b.arm = 14;
            eshots.push({
              kind: 'bcutter',
              x: bcx(b) + b.facing * 12 - 7,
              y: b.y + 3,
              w: 14,
              h: 14,
              tx: pcx(),
              ty: pcy(),
              owner: b,
              dmg: 4,
              t: 0,
              delay: 0,
              big: true,
            });
            sfx.cutter();
          }
          if (b.t >= 22) bossToIdle(b);
          break;
        case 'run':
          b.anim++;
          b.vx = b.facing * (enr ? 2.2 : 1.7);
          if (moveX(b, b.vx) || b.t > 45) {
            bossToIdle(b);
            break;
          }
          if (b.onGround && b.t % 20 === 10 && Math.random() < 0.4) b.vy = -4.5;
          physics(b);
          break;
        case 'jump':
          if (b.t === 1) jumpAt(b, -5.2, 42, 2.2);
          airborne(b);
          if (enr && b.hasCutter && !b.fired && b.vy >= 0) {
            b.fired = true;
            b.hasCutter = false;
            b.arm = 14;
            eshots.push({
              kind: 'bcutter',
              x: bcx(b) + b.facing * 12 - 7,
              y: b.y + 3,
              w: 14,
              h: 14,
              tx: pcx(),
              ty: pcy(),
              owner: b,
              dmg: 4,
              t: 0,
              delay: 0,
              big: true,
            });
            sfx.cutter();
          }
          if (b.onGround && b.t > 3) bossToIdle(b);
          break;
      }
    },
  },
  fire: {
    name: 'MAGMARON',
    style: 'fire',
    pal: { B: '#8c2c24', b: '#f8b040', S: SKIN },
    weapon: 'fire',
    weak: 'wind',
    pose: (b, pose) => (b.state === 'stagger' ? 'hurt' : pose),
    update(b, enr) {
      const F = ROOM().floor;
      physics(b);
      switch (b.state) {
        case 'idle':
          faceP(b);
          if (b.t > (enr ? 18 : 34)) pick(b, ['wave', 'pillar', 'walk']);
          break;
        case 'wave':
          if (b.t === 1) faceP(b);
          if (b.t === 12 || (enr && b.t === 32)) {
            b.arm = 14;
            sfx.flame();
            eshots.push({
              kind: 'wave',
              x: b.facing > 0 ? b.x + b.w : b.x - 14,
              y: F - 30,
              w: 14,
              h: 30,
              vx: b.facing * 2.8,
              vy: 0,
              dmg: 4,
              t: 0,
              delay: 0,
              big: true,
            });
          }
          if (b.t >= (enr ? 50 : 32)) bossToIdle(b);
          break;
        case 'pillar':
          if (b.t === 1) {
            b.targets = enr ? [pcx(), pcx() - 64, pcx() + 64] : [pcx()];
            for (const x of b.targets)
              eshots.push({
                kind: 'pwarn',
                x: x - 10,
                y: F - 6,
                w: 20,
                h: 6,
                life: 40,
                harmless: true,
                t: 0,
                delay: 0,
              });
          }
          if (b.t === 40) {
            sfx.flame();
            game.shake = 6;
            for (const x of b.targets)
              eshots.push({
                kind: 'pillar',
                x: x - 10,
                y: F - 80,
                w: 20,
                h: 80,
                life: 40,
                dmg: 4,
                t: 0,
                delay: 0,
                big: true,
              });
          }
          if (b.t >= 70) bossToIdle(b);
          break;
        case 'walk':
          if (b.t < 30) {
            b.anim++;
            b.vx = b.facing * 1.2;
            moveX(b, b.vx);
          } else b.vx = 0;
          if (b.t === 30 || b.t === 42 || (enr && b.t === 54)) {
            faceP(b);
            b.arm = 12;
            sfx.fire();
            enemyShot(bcx(b) + b.facing * 12, b.y + 13, b.facing * 3.2, 0, 3, {
              kind: 'fireball',
              w: 12,
              h: 10,
              x: bcx(b) + b.facing * 12 - 6,
              y: b.y + 8,
            });
          }
          if (b.t >= (enr ? 66 : 56)) bossToIdle(b);
          break;
      }
    },
  },
  elec: {
    name: 'VOLTRAX',
    style: 'elec',
    pal: { B: '#e89800', b: '#f8e070', S: SKIN },
    weapon: 'elec',
    weak: 'cut',
    pose: (b, pose) => (b.state === 'stagger' ? 'hurt' : pose),
    update(b, enr) {
      const Rm = ROOM();
      if (b.landT > 0) b.landT--; // the landing crouch after a leap
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 16 : 30)) pick(b, ['beam', 'strike', 'leap', 'slide']);
          break;
        case 'slide': // volt rush: crouches charging, then dashes low along the floor, leaving a live electric trail
          if (b.t === 1) {
            faceP(b);
            sfx.rumble();
          }
          if (b.t < 22) {
            if (b.t % 3 === 0) spark(bcx(b) + (Math.random() - 0.5) * 24, b.y + 8 + Math.random() * 14);
            physics(b);
            break;
          }
          if (b.t === 22) {
            b.y += 10;
            b.h = 14;
            sfx.zap();
          }
          b.vx = b.facing * (enr ? 5 : 4.2);
          if (b.t % 5 === 0)
            eshots.push({
              kind: 'vtrail',
              x: bcx(b) - 6,
              y: Rm.floor - 6,
              w: 12,
              h: 6,
              // only live when he is enraged, and briefly: jumping over the dash must still be a safe dodge
              harmless: !enr,
              life: enr ? 26 : 18,
              dmg: 2,
              t: 0,
              delay: 0,
              big: true,
            });
          if (moveX(b, b.vx) || b.t > 130) {
            b.y -= 10;
            b.h = 24;
            game.shake = 6;
            sfx.land();
            // enraged, the crash against the wall sends a ground spark back along the floor
            if (enr)
              eshots.push({
                kind: 'gspark',
                x: bcx(b) - 6 - b.facing * 12,
                y: Rm.floor - 16,
                w: 12,
                h: 16,
                vx: -b.facing * 3.2,
                vy: 0,
                dmg: 3,
                t: 0,
                delay: 0,
                big: true,
              });
            bossToIdle(b);
            break;
          }
          physics(b);
          break;
        case 'beam': // thunder beam: three bolts fanning upward so jumping over them is not a free escape
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t === 14 || (enr && b.t === 34)) {
            b.arm = 14;
            sfx.zap();
            for (const [ux, uy] of [
              [1, 0],
              [0.92, -0.38],
              [0.7, -0.7],
            ]) {
              const x = bcx(b) + b.facing * 12;
              eshots.push({
                kind: 'ebolt',
                x: x - 7,
                y: b.y + 8,
                w: 14,
                h: 8,
                vx: ux * b.facing * 3.6,
                vy: uy * 3.6,
                dmg: 4,
                t: 0,
                delay: 0,
                big: true,
              });
            }
          }
          if (b.t >= (enr ? 54 : 34)) bossToIdle(b);
          break;
        case 'strike': // arms up, warning marks on the floor, then lightning from the ceiling
          physics(b);
          if (b.t === 1) {
            const s = Math.random() < 0.5 ? -1 : 1;
            b.targets = enr ? [pcx(), pcx() - 56, pcx() + 56] : [pcx(), pcx() + s * 72];
            for (const x of b.targets)
              eshots.push({
                kind: 'bwarn',
                x: x - 10,
                y: Rm.floor - 6,
                w: 20,
                h: 6,
                life: 36,
                harmless: true,
                t: 0,
                delay: 0,
              });
            sfx.rumble();
          }
          if (b.t === 36) {
            sfx.thunder();
            game.shake = 6;
            game.flash = 3;
            for (const x of b.targets)
              eshots.push({
                kind: 'lbolt',
                x: x - 8,
                y: Rm.ceil,
                w: 16,
                h: Rm.floor - Rm.ceil,
                life: 24,
                dmg: 4,
                t: 0,
                delay: 0,
                big: true,
              });
          }
          if (b.t >= 66) bossToIdle(b);
          break;
        case 'leap': // high jump, electric balls at the top, ground sparks on landing when enraged
          if (b.t === 1) jumpAt(b, -6.2, 50, 2.6);
          airborne(b);
          if (!b.fired && b.vy >= 0) {
            b.fired = true;
            b.arm = 14;
            sfx.zap();
            const a = Math.atan2(pcy() - (b.y + 12), pcx() - bcx(b));
            for (const da of [-0.3, 0, 0.3])
              enemyShot(bcx(b), b.y + 12, Math.cos(a + da) * 2.8, Math.sin(a + da) * 2.8, 3, {
                kind: 'eball',
                w: 10,
                h: 10,
                x: bcx(b) - 5,
                y: b.y + 7,
              });
          }
          if (b.onGround && b.t > 3) {
            if (enr) {
              game.shake = 8;
              sfx.zap();
              for (const d of [-1, 1])
                eshots.push({
                  kind: 'gspark',
                  x: bcx(b) - 6 + d * 12,
                  y: Rm.floor - 16,
                  w: 12,
                  h: 16,
                  vx: d * 3.2,
                  vy: 0,
                  dmg: 3,
                  t: 0,
                  delay: 0,
                  big: true,
                });
            }
            b.landT = 12;
            bossToIdle(b);
          }
          break;
      }
    },
  },
  snow: {
    name: 'GLACIELLE',
    style: 'snow',
    pal: { B: '#2868d8', b: '#c8ecfc', S: SKIN },
    weapon: 'snow',
    weak: 'fire',
    pose: (b, pose) => (b.state === 'stagger' ? 'hurt' : pose),
    update(b, enr) {
      const Rm = ROOM();
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 18 : 32)) pick(b, ['shards', 'slide', 'blizzard']);
          break;
        case 'shards':
          physics(b);
          if (b.t === 12 || (enr && b.t === 30)) {
            faceP(b);
            b.arm = 14;
            sfx.ice();
            const a = Math.atan2(pcy() - (b.y + 12), pcx() - bcx(b)),
              n = enr ? 5 : 3;
            for (let i = 0; i < n; i++) {
              const da = (i - (n - 1) / 2) * 0.22;
              enemyShot(bcx(b), b.y + 12, Math.cos(a + da) * 3, Math.sin(a + da) * 3, 3, {
                kind: 'ishard',
                w: 8,
                h: 8,
                x: bcx(b) - 4,
                y: b.y + 8,
              });
            }
          }
          if (b.t >= (enr ? 44 : 30)) bossToIdle(b);
          break;
        case 'slide':
          if (b.t === 1) faceP(b);
          if (b.t === 14) {
            b.y += 10;
            b.h = 14;
          }
          if (b.t > 14) {
            b.vx = b.facing * (enr ? 4.4 : 3.6);
            if (frameCount % 3 === 0)
              part({
                kind: 'debris',
                x: bcx(b) - b.facing * 8,
                y: b.y + b.h - 2,
                vx: -b.facing * 0.5,
                vy: -0.8,
                grav: 0.1,
                life: 24,
                col: '#e0f8fc',
                size: 2,
              });
            if (moveX(b, b.vx) || b.t > 120) {
              b.y -= 10;
              b.h = 24;
              game.shake = 6;
              sfx.land();
              bossToIdle(b);
              break;
            }
          }
          physics(b);
          break;
        case 'blizzard':
          if (b.t === 1) {
            b.vy = -5.2;
            b.vx = 0;
            b.onGround = false;
          }
          physics(b);
          if (!b.fired && b.vy >= 0) {
            b.fired = true;
            b.arm = 20;
            sfx.ice();
            const xs = [pcx()],
              n = enr ? 5 : 3;
            for (let i = 0; i < n; i++) xs.push(Rm.l + 16 + Math.random() * (Rm.r - Rm.l - 32));
            xs.forEach((x, i) =>
              enemyShot(x, Rm.ceil, 0, 0, 3, {
                kind: 'fallice',
                x: x - 4,
                y: Rm.ceil,
                w: 8,
                h: 16,
                grav: 0.35,
                delay: 30 + i * 6,
                solidDie: true,
              }),
            );
          }
          if (b.onGround && b.t > 3) bossToIdle(b);
          break;
      }
    },
  },
  wind: {
    name: 'WINDERWOMEN',
    style: 'wind',
    pal: { B: '#20a878', b: '#e8fcf4', S: SKIN },
    weapon: 'wind',
    weak: 'earth',
    pose: (b, pose) => (b.state === 'stagger' ? 'hurt' : pose),
    update(b, enr) {
      const Rm = ROOM();
      if (b.landT > 0) b.landT--; // the gust bursting out round her where she landed
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 16 : 30)) pick(b, ['gust', 'cyclone', 'dive']);
          break;
        case 'gust': {
          // spins up a gale that shoves the player toward the far wall, with small whirlwinds riding it
          physics(b);
          if (b.t === 1) {
            faceP(b);
            sfx.whoosh();
          }
          b.arm = 4;
          const push = b.facing;
          if (alive(player) && player.state !== 'climb' && !hasPart('windproof'))
            moveX(player, push * (enr ? 1.05 : 0.8));
          if (b.t % 26 === 13)
            eshots.push({
              kind: 'etornado',
              x: bcx(b) + push * 10 - 6,
              y: Rm.floor - 16 - (b.t % 3) * 22,
              w: 12,
              h: 14,
              vx: push * 2.4,
              vy: 0,
              dmg: 3,
              t: 0,
              delay: 0,
            });
          if (b.t >= (enr ? 120 : 96)) bossToIdle(b);
          break;
        }
        case 'cyclone': // a big tornado that rolls across the floor
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t === 14 || (enr && b.t === 44)) {
            b.arm = 14;
            sfx.whoosh();
            eshots.push({
              kind: 'ecyclone',
              x: b.facing > 0 ? b.x + b.w : b.x - 24,
              y: Rm.floor - 40,
              w: 24,
              h: 40,
              vx: b.facing * 1.9,
              vy: 0,
              dmg: 4,
              t: 0,
              delay: 0,
              big: true,
            });
          }
          if (b.t >= (enr ? 70 : 42)) bossToIdle(b);
          break;
        case 'dive': // rises on the wind, hangs for a moment, then swoops at the player
          if (b.t === 1) {
            b.vy = -7;
            b.vx = 0;
            b.onGround = false;
            b.mode = 'up';
          }
          if (b.mode === 'up') {
            physics(b);
            if (b.vy >= 0) {
              b.mode = 'hang';
              b.hang = enr ? 14 : 22;
            }
          } else if (b.mode === 'hang') {
            faceP(b);
            if (--b.hang <= 0) {
              const dx = pcx() - bcx(b),
                dy = pcy() - (b.y + 12),
                d = Math.hypot(dx, dy) || 1;
              b.vx = (dx / d) * 4.4;
              b.vy = Math.max(1.5, (dy / d) * 4.4);
              b.mode = 'swoop';
              sfx.gale();
            }
          } else {
            if (moveX(b, b.vx)) b.vx = 0;
            const r = moveY(b, b.vy, false);
            if (frameCount % 3 === 0) part({ kind: 'dust', x: bcx(b), y: b.y + 12, vx: -b.vx * 0.2, vy: 0, life: 12 });
            if (r === 1) {
              b.onGround = true;
              game.shake = 6;
              sfx.land();
              dust(bcx(b), b.y + b.h, 4);
              b.landT = 12;
              bossToIdle(b);
            }
          }
          break;
      }
    },
  },
  earth: {
    name: 'TERRALYN',
    style: 'earth',
    pal: { B: '#7a4a20', b: '#d8b070', S: SKIN },
    weapon: 'earth',
    weak: 'elec',
    pose: (b, pose) => (b.state === 'stagger' ? 'hurt' : pose),
    update(b, enr) {
      const Rm = ROOM();
      if (b.landT > 0) b.landT--; // the rock spikes bursting up where she landed
      switch (b.state) {
        case 'idle':
          faceP(b);
          physics(b);
          if (b.t > (enr ? 18 : 32)) pick(b, ['quake', 'boulder', 'rockrain']);
          break;
        case 'quake':
          if (b.t === 1) jumpAt(b, -6.8, 56, 2);
          airborne(b);
          if (b.onGround && b.t > 3) {
            game.shake = 18;
            sfx.quake();
            dust(bcx(b), b.y + b.h, 6);
            const sp = enr ? 3.6 : 3;
            for (const d of [-1, 1])
              eshots.push({
                kind: 'quake',
                x: bcx(b) - 7 + d * 12,
                y: Rm.floor - 14,
                w: 14,
                h: 14,
                vx: d * sp,
                vy: 0,
                dmg: 3,
                t: 0,
                delay: 0,
                big: true,
              });
            b.landT = 14;
            bossToIdle(b);
          }
          break;
        case 'boulder':
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t === 14) {
            b.arm = 14;
            sfx.rock();
            // hurled from her rock fist
            eshots.push({
              kind: 'boulder',
              x: bcx(b) + b.facing * 14 - 8,
              y: b.y + 2,
              w: 16,
              h: 16,
              vx: clamp((pcx() - bcx(b)) / 45, -3, 3),
              vy: -4.5,
              grav: 0.25,
              dmg: 4,
              t: 0,
              delay: 0,
              big: true,
            });
          }
          if (b.t >= 36) bossToIdle(b);
          break;
        case 'rockrain':
          physics(b);
          if (b.t === 10) {
            b.arm = 24;
            sfx.quake();
            game.shake = 10;
            const xs = [pcx()],
              n = enr ? 5 : 4;
            for (let i = 0; i < n; i++) xs.push(Rm.l + 16 + Math.random() * (Rm.r - Rm.l - 32));
            xs.forEach((x, i) =>
              enemyShot(x, Rm.ceil, 0, 0, 3, {
                kind: 'fallrock',
                x: x - 7,
                y: Rm.ceil,
                w: 14,
                h: 14,
                grav: 0.3,
                delay: 35 + i * 5,
                solidDie: true,
                big: true,
              }),
            );
          }
          if (b.t >= 60) bossToIdle(b);
          break;
      }
    },
  },
};

function spawnBoss() {
  const type = game.stage;
  boss = {
    type,
    x: (level.doorCol + 17) * TILE,
    y: 13 * TILE,
    w: 18,
    h: 24,
    vx: 0,
    vy: 0,
    hp: 28,
    state: 'drop',
    t: 0,
    facing: -1,
    inv: 0,
    onGround: false,
    last: '',
    arm: 0,
    anim: 0,
    hasCutter: true,
    fired: false,
  };
  game.bossBar = 0;
}
function updateBoss() {
  const b = boss;
  if (!b) return;
  b.t++;
  if (b.inv > 0) b.inv--;
  if (b.arm > 0) b.arm--;
  if (b.state === 'drop') {
    physics(b);
    if (b.onGround) {
      b.state = 'pose';
      b.t = 0;
      sfx.land();
      dust(bcx(b), b.y + b.h, 4);
    }
    return;
  }
  if (b.state === 'pose') return;
  if (game.timeStop > 0 && !b.frozenT) b.frozenT = game.timeStop;
  if (b.frozenT > 0) {
    b.frozenT--;
    if (b.y > 0) physics(b); // a boss hidden mid-warp stays hidden
    return;
  } // frozen solid by Absolute Zero: no attacks, no contact damage
  if (b.state === 'stagger') {
    if (b.h !== 24) {
      b.y -= 10;
      b.h = 24;
    }
    moveX(b, -b.facing * 0.8);
    physics(b);
    if (b.t > 18) bossToIdle(b);
  } else BOSSES[b.type].update(b, b.hp <= 14);
  if (BOSSES[b.type].tick) BOSSES[b.type].tick(b);
  if (b.type === 'elec' && frameCount % 9 === 0) spark(bcx(b) + (Math.random() - 0.5) * 22, b.y + Math.random() * b.h);
  if (b.type === 'fire' && frameCount % 4 === 0)
    part({ kind: 'ember', x: bcx(b) + (Math.random() - 0.5) * 6, y: b.y - 4, vy: -0.8, life: 18 });
  if (alive(player) && overlap(b, player)) damagePlayer(4);
}
function defeatBoss() {
  const b = boss;
  b.hp = 0;
  orbs(bcx(b), b.y + b.h / 2, BOSSES[b.type].pal.b);
  orbs(bcx(b), b.y + b.h / 2, '#f8d800', 0.6);
  sfx.bigBoom();
  game.flash = 10;
  boss = null;
  eshots = [];
  addScore(10000);
  game.state = 'clear';
  game.t = 0;
  stopMusic();
}

// ================= PICKUPS =================
function makePickup(kind, cx, y, placed = null) {
  const [w, h] = { h: [8, 8], E: [14, 12], L: [14, 14] }[kind];
  return { kind, x: cx - w / 2, y, w, h, vy: 0, onGround: false, life: placed ? Infinity : 420, placed };
}
function updatePickups() {
  for (const k of pickups) {
    physics(k);
    if (tileAt(Math.floor((k.x + k.w / 2) / TILE), Math.floor((k.y + k.h / 2) / TILE)) === 'X') {
      k.dead = true;
      continue;
    }
    k.life--;
    if (k.life <= 0 || k.y > LH * TILE) {
      k.dead = true;
      continue;
    }
    if (alive(player) && overlap(k, player)) {
      k.dead = true;
      if (k.placed) k.placed.taken = true;
      if (k.kind === 'L') {
        game.lives = Math.min(9, game.lives + 1);
        sfx.oneup();
      } else {
        game.refill += k.kind === 'h' ? 2 : 10;
        if (player.hp >= 28) {
          game.refill = 0;
          sfx.tick();
        }
      }
      addScore(100);
    }
  }
  pickups = pickups.filter(k => !k.dead);
}
