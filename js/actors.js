'use strict';
// World state, physics, player + weapons, enemies, hazards, platforms, bosses, pickups, particles.

let frameCount = 0;
let level = null, map = null, LW = 0, LH = 0, levelCanvas = null;
let camX = 0, camY = 0, camYf = 0;
const game = {
  state: 'title', t: 0, lives: 2, score: 0, time: 0, deadT: 0, stage: null, checkpoint: false,
  bossLocked: false, bossBar: 0, refill: 0, shake: 0, flash: 0, placed: [], menu: 0, sel: 0, popup: 0,
};
const door = { open: 0, solid: true, phase: '' };
const player = { weapon: 'buster' };
let enemies = [], pshots = [], eshots = [], pickups = [], particles = [], hazards = [], plats = [], spawns = [];
let boss = null;
const crumbling = new Map();

const maxCamY = () => LH * TILE - VH;
const bossRoomX = () => level.doorCol * TILE;
const ROOM = () => ({ l: (level.doorCol + 1) * TILE, r: (level.doorCol + 23) * TILE, floor: FLOOR * TILE, ceil: 13 * TILE });
const EC = () => ENEMY_COLORS[level.theme];

// ================= TILES & PHYSICS =================
const tileAt = (tx, ty) => (ty < 0 || ty >= LH ? '.' : tx < 0 || tx >= LW ? '#' : map[ty][tx]);
const isSolidTile = t => t === '#' || t === '=' || t === '^' || t === 'I' || t === 'C' || (t === 'D' && door.solid);
const solidPx = (x, y) => isSolidTile(tileAt(Math.floor(x / TILE), Math.floor(y / TILE)));
const isLadder = (tx, ty) => tileAt(tx, ty) === 'H';
const ladderTop = (tx, ty) => isLadder(tx, ty) && !isLadder(tx, ty - 1);

function samples(a, b) { const r = []; for (let v = a; v < b; v += 8) r.push(v); r.push(b); return r; }
function moveX(e, dx) {
  if (!dx) return false;
  e.x += dx;
  const ys = samples(e.y, e.y + e.h - 1);
  if (dx > 0) {
    const px = e.x + e.w - 1;
    if (ys.some(y => solidPx(px, y))) { e.x = Math.floor(px / TILE) * TILE - e.w; return true; }
  } else if (ys.some(y => solidPx(e.x, y))) { e.x = (Math.floor(e.x / TILE) + 1) * TILE; return true; }
  return false;
}
// returns 1 when landed, -1 when bumped head, 0 otherwise
function moveY(e, dy, oneWay) {
  e.y += dy;
  const xs = samples(e.x, e.x + e.w - 1);
  if (dy > 0) {
    const py = e.y + e.h - 1, ty = Math.floor(py / TILE);
    let land = xs.some(x => solidPx(x, py));
    if (!land && oneWay && e.y + e.h - dy <= ty * TILE) land = xs.some(x => ladderTop(Math.floor(x / TILE), ty));
    if (land) { e.y = ty * TILE - e.h; return 1; }
  } else if (dy < 0 && xs.some(x => solidPx(x, e.y))) { e.y = (Math.floor(e.y / TILE) + 1) * TILE; return -1; }
  return 0;
}
function groundBelow(px, py) {
  for (let ty = Math.max(0, Math.floor(py / TILE)); ty < LH; ty++) if (isSolidTile(tileAt(Math.floor(px / TILE), ty))) return ty * TILE;
  return LH * TILE + 64;
}
function standingOn(e, ch) {
  const ty = Math.floor((e.y + e.h) / TILE);
  return samples(e.x, e.x + e.w - 1).some(x => tileAt(Math.floor(x / TILE), ty) === ch);
}
function physics(e) {
  e.vy = Math.min(e.vy + 0.25, 7);
  const r = moveY(e, e.vy, false);
  if (r === 1) { e.vy = 0; e.onGround = true; } else { e.onGround = false; if (r === -1) e.vy = 0; }
}
const pcx = () => player.x + player.w / 2, pcy = () => player.y + player.h / 2;
const alive = p => p.state !== 'dead';
const onScreen = (x, y, m = 16) => x > camX - m && x < camX + VW + m && y > camY - m && y < camY + VH + m;

// ================= PARTICLES =================
function part(o) { particles.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 20, grav: 0 }, o)); }
function boom(x, y) { part({ kind: 'boom', x, y, life: 18 }); }
function spark(x, y) { part({ kind: 'spark', x, y, life: 8 }); }
function dust(x, y, n = 3) { for (let i = 0; i < n; i++) part({ kind: 'dust', x: x + (Math.random() - 0.5) * 10, y, vx: (Math.random() - 0.5) * 0.8, vy: -Math.random() * 0.5, life: 18 }); }
function debris(x, y, col, n = 6, sp = 2) {
  for (let i = 0; i < n; i++) part({ kind: 'debris', x, y, vx: (Math.random() - 0.5) * sp * 2, vy: -Math.random() * sp * 1.6 - 0.5, grav: 0.2, life: 40, col, size: 2 + (Math.random() * 3 | 0) });
}
function orbs(x, y, col, mul = 1) {
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    for (const s of [1, 2.2]) part({ kind: 'orb', x, y, vx: Math.cos(a) * s * mul, vy: Math.sin(a) * s * mul, life: 160, col });
  }
}
function updateParticles() {
  for (const q of particles) { q.vy += q.grav; q.x += q.vx; q.y += q.vy; q.t++; }
  particles = particles.filter(q => q.t < q.life);
}

// ================= WEAPONS =================
const WEAPONS = {
  buster: { name: 'NEO BUSTER', short: 'BUSTER', pal: PAL_HERO },
  cut: { name: 'ROLLING CUTTER', short: 'R.CUTTER', pal: { B: '#5a5a6a', b: '#e0e0ec', S: SKIN }, desc: 'BOOMERANG GUNTING - MENEMBUS MUSUH' },
  fire: { name: 'FIRE STORM', short: 'F.STORM', pal: { B: '#d83000', b: '#f8b830', S: SKIN }, desc: 'BOLA API + PERISAI API' },
  snow: { name: 'FROST SHARD', short: 'F.SHARD', pal: { B: '#1888d8', b: '#d0f4fc', S: SKIN }, desc: '3 KRISTAL ES - MEMBEKUKAN MUSUH' },
  earth: { name: 'ROCK BREAKER', short: 'R.BREAKER', pal: { B: '#7a4a20', b: '#e8b868', S: SKIN }, desc: 'BATU PECAH JADI 4 SERPIHAN' },
};
const WEAPON_ORDER = ['buster', 'cut', 'fire', 'snow', 'earth'];
const ownedWeapons = () => WEAPON_ORDER.filter(w => w === 'buster' || save.cleared[w]);

function addShot(o) {
  const s = Object.assign({ vx: 0, vy: 0, t: 0, dead: false, pierce: false, level: 0, grav: 0, bossDmg: 1 }, o);
  if (s.pierce) s.hits = new Set();
  pshots.push(s);
  return s;
}
const countShots = k => pshots.reduce((n, s) => n + (s.kind === k && !s.deflected ? 1 : 0), 0);

function fireBuster(p, lvl) {
  if (lvl === 0 && countShots('buster') >= 3) return;
  const [w, h] = [[6, 4], [10, 10], [22, 14]][lvl];
  const x = p.facing > 0 ? p.x + p.w + 4 : p.x - 4 - w;
  addShot({ kind: 'buster', weapon: 'buster', x, y: p.y + 13 - h / 2, w, h, vx: p.facing * (lvl === 2 ? 5.5 : 5), level: lvl, dmg: lvl + 1 });
  p.shootT = 16;
  [sfx.shoot, sfx.shootMid, sfx.shootFull][lvl]();
}

function fireSpecial(p) {
  const mx = p.facing > 0 ? p.x + p.w + 2 : p.x - 2, my = p.y + 13;
  switch (p.weapon) {
    case 'cut':
      if (countShots('cutter') >= 2) return;
      addShot({ kind: 'cutter', weapon: 'cut', x: mx - 7, y: my - 7, w: 14, h: 14, vx: p.facing * 5, dir: p.facing, dmg: 2, pierce: true });
      sfx.cutter();
      break;
    case 'fire':
      if (countShots('fireball') >= 2) return;
      addShot({ kind: 'fireball', weapon: 'fire', x: mx - 6, y: my - 5, w: 12, h: 10, vx: p.facing * 4.5, dmg: 2 });
      if (!pshots.some(s => s.kind === 'flame')) addShot({ kind: 'flame', weapon: 'fire', x: 0, y: 0, w: 10, h: 10, ang: 0, life: 100, dmg: 1, pierce: true });
      sfx.fire();
      break;
    case 'snow':
      if (countShots('shard') > 0) return;
      for (const a of [-0.22, 0, 0.22]) addShot({ kind: 'shard', weapon: 'snow', x: mx - 4, y: my - 3, w: 8, h: 6, vx: Math.cos(a) * 4.5 * p.facing, vy: Math.sin(a) * 4.5, dmg: 1 });
      sfx.ice();
      break;
    case 'earth':
      if (countShots('rock') > 0) return;
      addShot({ kind: 'rock', weapon: 'earth', x: mx - 7, y: my - 12, w: 14, h: 14, vx: p.facing * 2.8, vy: -4.2, grav: 0.25, dmg: 3, bossDmg: 2 });
      sfx.rock();
      break;
  }
  p.shootT = 16;
}

function handleShoot(p, canFire) {
  if (p.weapon !== 'buster') {
    p.charge = 0;
    if (hit.shoot && canFire) fireSpecial(p);
    return;
  }
  if (hit.shoot && canFire) fireBuster(p, 0);
  if (inp.shoot) {
    p.charge++;
    if (p.charge === 30) sfx.charge();
    if (p.charge >= 75 && p.charge % 16 === 0) sfx.chargeFull();
  } else if (rel.shoot) {
    if (canFire) {
      if (p.charge >= 75) fireBuster(p, 2);
      else if (p.charge >= 30) fireBuster(p, 1);
    }
    p.charge = 0;
  } else p.charge = 0;
}

function shatterRock(s) {
  if (s.dead) return;
  s.dead = true;
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
  for (const v of [-2.4, -1.1, 1.1, 2.4]) addShot({ kind: 'frag', weapon: 'earth', x: cx - 3, y: cy - 3, w: 6, h: 6, vx: v, vy: -3 - Math.abs(v) * 0.4, grav: 0.22, dmg: 1 });
  debris(cx, cy, '#9a7a5a', 5);
  sfx.shatter();
}

function updateShot(s) {
  s.t++;
  switch (s.kind) {
    case 'cutter':
      if (!s.back) {
        s.vx -= s.dir * 0.14;
        s.x += s.vx; s.y += Math.sin(s.t * 0.15) * 0.6;
        if (Math.sign(s.vx) !== s.dir) s.back = true;
      } else {
        const dx = pcx() - (s.x + 7), dy = pcy() - (s.y + 7), d = Math.hypot(dx, dy) || 1, sp = Math.min(5.5, 2 + s.t * 0.03);
        s.x += dx / d * sp; s.y += dy / d * sp;
        if (d < 10 || !alive(player)) s.dead = true;
      }
      if (s.t > 240) s.dead = true;
      return;
    case 'flame':
      s.ang += 0.22;
      s.x = pcx() + Math.cos(s.ang) * 22 - 5; s.y = pcy() + Math.sin(s.ang) * 22 - 5;
      if (--s.life <= 0 || !alive(player)) s.dead = true;
      for (const e of eshots) if (!e.dead && !e.big && !e.harmless && overlap(s, e)) { e.dead = true; spark(e.x + e.w / 2, e.y + e.h / 2); }
      return;
    case 'rock': case 'frag':
      s.vy = Math.min(s.vy + s.grav, 7);
      s.x += s.vx; s.y += s.vy;
      if (solidPx(s.x + s.w / 2, s.y + s.h / 2) || solidPx(s.x + s.w / 2, s.y + s.h)) {
        if (s.kind === 'rock') shatterRock(s); else { s.dead = true; debris(s.x + 3, s.y + 3, '#9a7a5a', 2, 1); }
      }
      break;
    default:
      s.x += s.vx; s.y += s.vy;
      if (s.kind === 'fireball' && s.t % 2 === 0) part({ kind: 'ember', x: s.x + 6, y: s.y + 5, vx: -s.vx * 0.1, vy: -0.4, life: 12 });
  }
  if (!onScreen(s.x + s.w / 2, s.y + s.h / 2, 24)) s.dead = true;
}

function hitEnemy(s, e) {
  if (s.hits) s.hits.add(e);
  const def = EN[e.type];
  if (def.hurt && def.hurt(e, s) === 'deflect') {
    if (s.kind === 'buster') { s.deflected = true; s.vx = -s.vx * 0.8; s.vy = -3.5; }
    else if (s.kind === 'rock') shatterRock(s);
    else if (!s.pierce) s.dead = true;
    spark(s.x + s.w / 2, s.y + s.h / 2); sfx.deflect();
    return;
  }
  e.hp -= s.dmg; e.flash = 8;
  if (e.hp <= 0) { killEnemy(e); if (s.kind === 'buster' && s.level === 2) return; }
  else {
    sfx.enemyHit();
    if (s.weapon === 'snow') { e.frozen = 150; sfx.freeze(); }
  }
  if (s.kind === 'rock') shatterRock(s); else if (!s.pierce) s.dead = true;
}

function hitBoss(s) {
  const b = boss, def = BOSSES[b.type];
  if (b.inv > 0 || b.state === 'drop' || b.state === 'pose') return;
  if (s.hits && s.kind !== 'flame') { if (s.hits.has(b)) return; s.hits.add(b); }
  const bx = s.x + s.w / 2, by = s.y + s.h / 2;
  if (s.weapon === def.weapon) { // immune to its own weapon
    spark(bx, by); sfx.deflect();
    if (s.kind === 'buster') { s.deflected = true; s.vx = -s.vx * 0.8; s.vy = -3.5; }
    else if (s.kind === 'rock') shatterRock(s);
    else if (!s.pierce) s.dead = true;
    return;
  }
  const weak = s.weapon === def.weak;
  b.hp -= weak ? 4 : s.kind === 'buster' ? s.dmg : s.bossDmg;
  b.inv = weak ? 40 : 24;
  if (weak) {
    sfx.weakHit(); game.flash = 4;
    if (b.state !== 'slide' || b.h === 24) { b.state = 'stagger'; b.t = 0; b.vx = 0; }
    debris(bx, by, '#fcfcfc', 6, 2);
  } else sfx.bossHit();
  if (s.kind === 'rock') shatterRock(s); else if (!s.pierce) s.dead = true;
  if (b.hp <= 0) defeatBoss();
}

function updatePlayerShots() {
  for (const s of pshots) {
    if (s.dead) continue;
    updateShot(s);
    if (s.dead || s.deflected) continue;
    for (const e of enemies) {
      if (e.dead || !overlap(s, e) || (s.hits && s.hits.has(e))) continue;
      hitEnemy(s, e);
      if (s.dead || s.deflected) break;
    }
    if (s.dead || s.deflected) continue;
    for (const h of hazards) {
      if (h.kind !== 'icicle' || h.state === 'gone' || !overlap(s, h) || (s.hits && s.hits.has(h))) continue;
      if (s.hits) s.hits.add(h);
      breakIcicle(h); game.score += 50;
      if (s.kind === 'rock') shatterRock(s); else if (!s.pierce) s.dead = true;
      break;
    }
    if (!s.dead && !s.deflected && boss && overlap(s, boss)) hitBoss(s);
  }
  pshots = pshots.filter(s => !s.dead);
}

// ================= PLAYER =================
function ladderOverlap(p) {
  const tx = Math.floor((p.x + p.w / 2) / TILE);
  for (let ty = Math.floor((p.y + 4) / TILE); ty <= Math.floor((p.y + p.h - 1) / TILE); ty++) if (isLadder(tx, ty)) return tx;
  return -1;
}
function startClimb(p, tx) { p.state = 'climb'; p.x = tx * TILE + 8 - p.w / 2; p.vx = 0; p.vy = 0; p.onGround = false; p.plat = null; p.coyote = 0; }
function headroom(p) {
  if (p.h === 22) return true;
  return !samples(p.x, p.x + p.w - 1).some(x => solidPx(x, p.y - 10) || solidPx(x, p.y - 1));
}
function standUp(p) { if (p.h === 22) return true; if (!headroom(p)) return false; p.y -= 10; p.h = 22; return true; }
function startSlide(p) {
  p.state = 'slide'; p.slideT = 26;
  if (p.h === 22) { p.y += 10; p.h = 12; }
  dust(p.x + p.w / 2 - p.facing * 6, p.y + p.h, 3);
}
function applyGravity(p) {
  p.vy = Math.min(p.vy + 0.25, 7);
  const wasGround = p.onGround;
  const r = moveY(p, p.vy, true);
  let landed = r === 1;
  p.plat = null;
  if (!landed && p.vy >= 0) {
    for (const pl of plats) {
      if (p.x + p.w > pl.x && p.x < pl.x + pl.w && p.y + p.h - p.vy <= pl.y + 1 && p.y + p.h >= pl.y) {
        p.y = pl.y - p.h; landed = true; p.plat = pl; break;
      }
    }
  }
  if (landed) {
    if (!wasGround && p.vy > 2) { sfx.land(); dust(p.x + p.w / 2, p.y + p.h, 2); }
    p.vy = 0; p.onGround = true;
  } else { p.onGround = false; if (r === -1) p.vy = 0; }
}

function updatePlayer() {
  const p = player;
  if (p.inv > 0) p.inv--;
  if (p.shootT > 0) p.shootT--;
  const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  const onIce = p.onGround && standingOn(p, 'I');
  // jump buffer: a press shortly before landing still counts (as long as the key is held)
  if (hit.jump) p.jumpBuf = 8; else if (!inp.jump) p.jumpBuf = 0; else if (p.jumpBuf > 0) p.jumpBuf--;
  // coyote time: a few frames of grace after walking off a ledge
  if (p.onGround) p.coyote = 6; else if (p.coyote > 0) p.coyote--;
  p.jumpT++;
  const doJump = () => { p.vy = -4.9; p.onGround = false; p.plat = null; p.jumpBuf = 0; p.coyote = 0; p.jumpT = 0; };
  const runTo = (target, accel) => { p.vx = onIce ? p.vx + clamp(target - p.vx, -accel, accel) : target; };

  switch (p.state) {
    case 'beam':
      p.y += 8;
      if (p.y >= p.targetY) { p.y = p.targetY; p.state = 'land'; p.anim = 0; p.onGround = true; sfx.land(); }
      return;
    case 'land':
      if (++p.anim > 10) { p.state = 'normal'; p.anim = 0; }
      return;
    case 'dead':
      return;
    case 'hurt':
      p.hurtT--;
      moveX(p, -p.facing * 0.6);
      applyGravity(p);
      p.charge = 0;
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
        standUp(p); p.state = 'normal'; doJump();
      } else if (p.slideT <= 0 || wall || !p.onGround) {
        if (standUp(p)) p.state = 'normal';
        else if (p.onGround) p.slideT = 1; // keep sliding under a low ceiling
        else p.state = 'normal';
      }
      return;
    }
    case 'climb': {
      if (dir) p.facing = dir;
      handleShoot(p, true);
      if (hit.jump) { p.state = 'normal'; p.vy = 0; p.jumpBuf = 0; return; }
      let vdir = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);
      if (p.shootT > 0) vdir = 0;
      if (vdir) p.anim++;
      const r = moveY(p, vdir * 1.3, false);
      if (r === 1) { p.state = 'normal'; p.onGround = true; p.vy = 0; return; }
      const tx = Math.floor((p.x + p.w / 2) / TILE), feetRow = Math.floor((p.y + p.h - 1) / TILE);
      if (vdir < 0 && !isLadder(tx, feetRow) && isLadder(tx, feetRow + 1)) {
        p.y = (feetRow + 1) * TILE - p.h; p.state = 'normal'; p.onGround = true; p.vy = 0;
        return;
      }
      if (ladderOverlap(p) < 0 && !isLadder(tx, feetRow)) { p.state = 'normal'; p.vy = 0; }
      return;
    }
  }

  // ---- normal ----
  if (p.h < 22 && !standUp(p)) { p.state = 'slide'; p.slideT = 1; return; }
  const lt = ladderOverlap(p);
  if (inp.up && lt >= 0 && !(p.onGround && !isLadder(lt, Math.floor((p.y + p.h - 1) / TILE)))) { startClimb(p, lt); return; }
  if (inp.down && p.onGround) {
    const tx = Math.floor((p.x + p.w / 2) / TILE), ty = Math.floor((p.y + p.h) / TILE);
    if (ladderTop(tx, ty)) { startClimb(p, tx); p.y += 6; return; }
  }
  if (dir) p.facing = dir;
  runTo(dir * 1.4, 0.05);
  if (p.onGround && (hit.slide || (p.jumpBuf > 0 && inp.down))) { p.jumpBuf = 0; startSlide(p); return; }
  if (p.jumpBuf > 0 && (p.onGround || p.coyote > 0) && p.vy >= 0) doJump();
  // releasing jump cuts the jump short, but only after a minimum hop so quick taps still jump
  if (!inp.jump && p.vy < 0 && p.jumpT > 6) p.vy = 0;
  if (moveX(p, p.vx) && onIce) p.vx = 0;
  applyGravity(p);
  if (p.onGround && Math.abs(p.vx) > 0.1) p.anim++; else if (!dir) p.anim = 0;
  handleShoot(p, true);
}

function damagePlayer(dmg) {
  const p = player;
  if (!dmg || p.inv > 0 || !['normal', 'climb', 'slide'].includes(p.state)) return;
  p.hp -= dmg;
  sfx.hurt();
  if (p.hp <= 0) { p.hp = 0; killPlayer(true); return; }
  p.state = 'hurt'; p.hurtT = 18; p.inv = 90; p.charge = 0; p.vx = 0; p.plat = null;
  if (p.vy < 0) p.vy = 0;
}
function killPlayer(withOrbs) {
  const p = player;
  if (!alive(p)) return;
  p.state = 'dead'; p.hp = 0; p.charge = 0;
  game.deadT = 0; stopMusic();
  sfx.death();
  if (withOrbs) orbs(p.x + p.w / 2, p.y + p.h / 2, WEAPONS[p.weapon].pal.b);
}

function checkHazards() {
  const p = player;
  if (!alive(p) || p.state === 'beam' || p.state === 'land') return;
  if (p.y > LH * TILE + 16) { killPlayer(false); return; }
  const x0 = Math.floor(p.x / TILE), x1 = Math.floor((p.x + p.w - 1) / TILE);
  const y0 = Math.floor(p.y / TILE), y1 = Math.floor((p.y + p.h) / TILE);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const t = tileAt(tx, ty);
    if (t === '~' && ty < Math.floor((p.y + p.h - 1) / TILE) + 1 && p.y + p.h > ty * TILE + 4) { killPlayer(true); return; }
    if (t === '^' && p.inv === 0) { killPlayer(true); return; }
  }
}

// ================= ENEMIES =================
function enemyShot(x, y, vx, vy, dmg = 2, extra = {}) {
  return eshots.push(Object.assign({ kind: 'pellet', x: x - 3, y: y - 3, w: 6, h: 6, vx, vy, dmg, t: 0, grav: 0, delay: 0 }, extra));
}

const EN = {
  met: {
    w: 16, h: 14, hp: 1, dmg: 2, score: 200, grav: true,
    init(e) { e.hide = true; e.t = 40; },
    update(e) {
      physics(e);
      const dx = pcx() - (e.x + 8);
      e.facing = dx < 0 ? -1 : 1;
      e.t++;
      if (e.hide) { if (e.t > 70 && Math.abs(dx) < 130) { e.hide = false; e.t = 0; } }
      else {
        if (e.t === 14) {
          for (const a of [-0.4, 0, 0.4]) enemyShot(e.x + 8 + e.facing * 6, e.y + 8, Math.cos(a) * 2 * e.facing, Math.sin(a) * 2);
          sfx.eshoot();
        }
        if (e.t >= 60) { e.hide = true; e.t = 0; }
      }
    },
    hurt(e) { return e.hide ? 'deflect' : 'hit'; },
    draw(e, x, y) {
      const c = EC(), Y = c.a, Y2 = c.c;
      if (e.hide) sprite(x, y, e.facing, 16, [[3, 6, 10, 2, Y], [1, 8, 14, 4, Y], [0, 11, 16, 3, Y2]], [[4, 8, 3, 2, shade(Y, 0.5)], [7, 9, 2, 2, '#fcfcfc']]);
      else sprite(x, y, e.facing, 16,
        [[3, 8, 10, 4, '#404048'], [2, 12, 5, 2, '#f87800'], [9, 12, 5, 2, '#f87800'], [3, 0, 10, 2, Y], [1, 2, 14, 4, Y], [0, 5, 16, 3, Y2]],
        [[4, 2, 3, 2, shade(Y, 0.5)], [9, 9, 3, 2, '#fcfcfc'], [11, 9, 1, 2, '#000000']]);
    },
  },
  flyer: {
    w: 14, h: 12, hp: 1, dmg: 2, score: 150,
    init(e) { e.baseY = e.y; e.vx = pcx() < e.x ? -0.9 : 0.9; e.facing = Math.sign(e.vx); },
    update(e) {
      e.t++;
      e.baseY += Math.sign(pcy() - 6 - e.baseY) * 0.35;
      e.y = e.baseY + Math.sin(e.t * 0.07) * 18;
      e.x += e.vx;
    },
    draw(e, x, y) {
      const c = EC(), up = (e.t >> 2) & 1, L = c.fly2;
      sprite(x, y, e.facing, 14, [[3, 2, 8, 8, c.fly], up ? [0, 0, 4, 4, L] : [0, 6, 4, 3, L], up ? [10, 0, 4, 4, L] : [10, 6, 4, 3, L]],
        [[4, 3, 3, 2, shade(c.fly, 0.4)], [8, 4, 3, 3, '#fcfcfc'], [9, 5, 2, 2, '#f80000']]);
    },
  },
  hopper: {
    w: 16, h: 15, hp: 3, dmg: 3, score: 300, grav: true,
    init(e) { e.t = 20; },
    update(e) {
      if (e.onGround) {
        e.vx = 0; e.t++;
        e.facing = pcx() < e.x + 8 ? -1 : 1;
        if (e.t > 45) { e.t = 0; e.vy = -4.6; e.vx = e.facing * 1.3; e.onGround = false; }
      }
      if (moveX(e, e.vx)) e.vx = 0;
      physics(e);
    },
    draw(e, x, y) {
      const c = EC(), G = c.hop, G2 = c.hop2, Dk = shade(c.hop, -0.45);
      const legs = e.onGround ? [[0, 12, 5, 3, Dk], [11, 12, 5, 3, Dk]] : [[1, 11, 3, 4, Dk], [12, 11, 3, 4, Dk]];
      sprite(x, y, e.facing, 16, [...legs, [2, 4, 12, 8, G], [5, 0, 9, 5, G2]],
        [[3, 5, 4, 2, G2], [9, 1, 3, 3, '#fcfcfc'], [11, 2, 1, 2, '#000000'], [10, 8, 4, 1, Dk]]);
    },
  },
  turret: {
    w: 16, h: 16, hp: 4, dmg: 3, score: 300,
    init(e) { e.ang = Math.PI; },
    update(e) {
      e.t++;
      const cx = e.x + 8, cy = e.y + 6, dx = pcx() - cx, dy = pcy() - cy;
      e.ang = Math.atan2(dy, dx);
      if (e.t % 90 === 60 && Math.hypot(dx, dy) < 220 && alive(player)) {
        enemyShot(cx + Math.cos(e.ang) * 11, cy + Math.sin(e.ang) * 11, Math.cos(e.ang) * 1.8, Math.sin(e.ang) * 1.8, 3);
        sfx.eshoot();
      }
    },
    draw(e, x, y) {
      const c = EC(), warn = e.t % 90 > 40 && e.t % 90 < 60 && (e.t & 2);
      sprite(x, y, 1, 16, [[1, 8, 14, 8, c.tur], [3, 3, 10, 6, shade(c.tur, 0.3)]],
        [[2, 9, 12, 1, shade(c.tur, 0.4)], [7, 11, 2, 2, warn ? '#f83800' : '#700000']]);
      const cx = x + 8, cy = y + 6;
      for (let i = 3; i < 11; i++) R(cx + Math.cos(e.ang) * i - 1, cy + Math.sin(e.ang) * i - 1, 3, 3, '#202028');
      if (warn) glow(x + 8, y + 12, 8, '#f83800', 0.6);
    },
  },
};

function createEnemy(s) {
  const def = EN[s.type];
  const e = { type: s.type, w: def.w, h: def.h, hp: def.hp, vx: 0, vy: 0, t: 0, facing: -1, flash: 0, frozen: 0, dead: false, onGround: false, spawn: s };
  e.x = s.tx * TILE + 8 - def.w / 2;
  e.y = s.type === 'flyer' ? s.ty * TILE : (s.ty + 1) * TILE - def.h;
  if (def.init) def.init(e);
  return e;
}
function updateSpawns() {
  for (const s of spawns) {
    const sx = s.tx * TILE + 8;
    const on = sx > camX - 8 && sx < camX + VW + 8;
    if (on) { if (s.armed && !s.ent) { s.ent = createEnemy(s); enemies.push(s.ent); s.armed = false; } }
    else if (!s.ent) s.armed = true;
  }
}
function killEnemy(e) {
  e.dead = true;
  e.spawn.ent = null;
  boom(e.x + e.w / 2, e.y + e.h / 2);
  sfx.explode();
  game.score += EN[e.type].score;
  const r = Math.random();
  if (r < 0.02) pickups.push(makePickup('L', e.x + e.w / 2, e.y));
  else if (r < 0.08) pickups.push(makePickup('E', e.x + e.w / 2, e.y));
  else if (r < 0.25) pickups.push(makePickup('h', e.x + e.w / 2, e.y));
}
function updateEnemies() {
  for (const e of enemies) {
    if (e.flash > 0) e.flash--;
    if (e.frozen > 0) { e.frozen--; if (EN[e.type].grav) physics(e); }
    else {
      EN[e.type].update(e);
      if (alive(player) && overlap(e, player)) damagePlayer(EN[e.type].dmg);
    }
    if (e.x + e.w < camX - 40 || e.x > camX + VW + 40 || e.y > LH * TILE + 32) { e.dead = true; e.spawn.ent = null; }
  }
  enemies = enemies.filter(e => !e.dead);
}

// ================= HAZARDS & PLATFORMS =================
function makeHazard(d) {
  switch (d.type) {
    case 'saw': {
      const ax = d.x * TILE + 8, ay = d.y * TILE + 8, bx = d.x1 * TILE + 8, by = d.y1 * TILE + 8;
      return { kind: 'saw', ax, ay, bx, by, u: 0, du: d.speed / (Math.hypot(bx - ax, by - ay) || 1), x: ax - 9, y: ay - 9, w: 18, h: 18, rot: 0 };
    }
    case 'jet': return { kind: 'jet', cx: d.x * TILE + 8, base: d.y * TILE, phase: d.phase || 0, period: 150, x: d.x * TILE + 1, y: d.y * TILE - 48, w: 14, h: 48, on: false, warn: false };
    case 'icicle': return { kind: 'icicle', hx: d.x * TILE + 4, hy: d.y * TILE, x: d.x * TILE + 4, y: d.y * TILE, w: 8, h: 14, state: 'hang', t: 0, vy: 0 };
    case 'rockfall': return { kind: 'rockfall', cx: d.x * TILE + 8, period: d.period || 110, phase: d.phase || 0 };
  }
}
function breakIcicle(h) {
  h.state = 'gone';
  debris(h.x + 4, h.y + 8, '#c8f0fc', 6, 1.5);
  sfx.shatter();
}
function updateHazards() {
  const p = player;
  for (const h of hazards) {
    switch (h.kind) {
      case 'saw': {
        h.u += h.du;
        if (h.u > 1 || h.u < 0) { h.du = -h.du; h.u = clamp(h.u, 0, 1); }
        const cx = h.ax + (h.bx - h.ax) * h.u, cy = h.ay + (h.by - h.ay) * h.u;
        h.x = cx - 9; h.y = cy - 9; h.rot += 0.3;
        if (alive(p) && overlap(h, p)) damagePlayer(4);
        break;
      }
      case 'jet': {
        const t = (frameCount + h.phase) % h.period;
        const was = h.on;
        h.warn = t < 36; h.on = t >= 36 && t < 96;
        if (h.on && !was && onScreen(h.cx, h.base, 0)) sfx.flame();
        if (h.warn && frameCount % 5 === 0 && onScreen(h.cx, h.base)) part({ kind: 'ember', x: h.cx + (Math.random() - 0.5) * 10, y: h.base - 2, vy: -0.6 - Math.random(), life: 22 });
        if (h.on && alive(p) && overlap(h, p)) damagePlayer(4);
        break;
      }
      case 'icicle':
        if (h.state === 'hang') {
          if (alive(p) && Math.abs(pcx() - (h.x + 4)) < 30 && p.y > h.y && onScreen(h.x, h.y)) { h.state = 'shake'; h.t = 0; }
        } else if (h.state === 'shake') {
          h.x = h.hx + ((h.t & 2) ? 1 : -1);
          if (++h.t > 18) { h.state = 'fall'; h.x = h.hx; }
        } else if (h.state === 'fall') {
          h.vy = Math.min(h.vy + 0.3, 7); h.y += h.vy;
          if (solidPx(h.x + 4, h.y + h.h)) breakIcicle(h);
        }
        if (h.state !== 'gone' && alive(p) && overlap(h, p)) damagePlayer(4);
        break;
      case 'rockfall': {
        const t = (frameCount + h.phase) % h.period;
        if (h.cx > camX - 16 && h.cx < camX + VW + 16) {
          if (t === h.period - 30) for (let i = 0; i < 3; i++) part({ kind: 'debris', x: h.cx + (Math.random() - 0.5) * 12, y: camY, vx: 0, vy: 1 + Math.random(), grav: 0.15, life: 40, col: '#8a6a4a', size: 2 });
          if (t === 0) enemyShot(h.cx, camY - 8, 0, 0, 3, { kind: 'rock', x: h.cx - 7, y: camY - 22, w: 14, h: 14, grav: 0.3, solidDie: true, big: true });
        }
        break;
      }
    }
  }
}

function makePlat(d) {
  const ax = d.x * TILE, ay = d.y * TILE, bx = d.x1 * TILE, by = d.y1 * TILE;
  return { ax, ay, bx, by, u: 0, du: d.speed / (Math.hypot(bx - ax, by - ay) || 1), hold: 0, x: ax, y: ay, w: 32, h: 8, dx: 0, dy: 0 };
}
function updatePlats() {
  for (const pl of plats) {
    const ox = pl.x, oy = pl.y;
    if (pl.hold > 0) pl.hold--;
    else {
      pl.u += pl.du;
      if (pl.u > 1 || pl.u < 0) { pl.du = -pl.du; pl.u = clamp(pl.u, 0, 1); pl.hold = 30; }
    }
    pl.x = pl.ax + (pl.bx - pl.ax) * pl.u; pl.y = pl.ay + (pl.by - pl.ay) * pl.u;
    pl.dx = pl.x - ox; pl.dy = pl.y - oy;
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
      const tx = Math.floor(x / TILE), k = tx + ',' + ty;
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
const PIERCING = new Set(['bcutter', 'wave', 'pillar', 'quake']);
function updateEnemyShots() {
  const R_ = ROOM();
  for (const s of eshots) {
    s.t++;
    if (s.delay > 0) {
      s.delay--;
      if (s.kind === 'fallrock' && s.t % 8 === 0) part({ kind: 'debris', x: s.x + s.w / 2, y: s.y, vy: 1, grav: 0.15, life: 30, col: '#8a6a4a', size: 2 });
      continue;
    }
    switch (s.kind) {
      case 'bcutter': {
        const o = s.owner;
        if (!boss || boss !== o) { s.dead = true; break; }
        const tx = s.back ? o.x + o.w / 2 : s.tx, ty = s.back ? o.y + 6 : s.ty;
        const dx = tx - (s.x + 7), dy = ty - (s.y + 7), d = Math.hypot(dx, dy) || 1, sp = s.back ? 4.6 : 4.2;
        s.x += dx / d * Math.min(sp, d); s.y += dy / d * Math.min(sp, d);
        if (!s.back && (d < 6 || s.t > 55)) s.back = true;
        else if (s.back && d < 10) { s.dead = true; o.hasCutter = true; }
        break;
      }
      case 'pillar': case 'pwarn':
        if (--s.life <= 0) s.dead = true;
        break;
      case 'wave': case 'quake':
        s.x += s.vx;
        if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + s.h / 2)) { s.dead = true; debris(s.x + s.w / 2, s.y + s.h / 2, s.kind === 'wave' ? '#f8a800' : '#8a6a4a', 4); }
        if (s.kind === 'quake' && frameCount % 4 === 0) dust(s.x + s.w / 2, s.y + s.h, 1);
        break;
      case 'boulder':
        s.vy = Math.min(s.vy + s.grav, 7);
        s.x += s.vx; s.y += s.vy;
        if (solidPx(s.x + s.w / 2, s.y + s.h) || solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + s.h / 2)) {
          s.dead = true; sfx.shatter();
          const cx = s.x + s.w / 2, cy = Math.min(s.y + s.h / 2, R_.floor - 8);
          for (const v of [-2.6, -1.2, 1.2, 2.6]) enemyShot(cx, cy, v, -3 - Math.abs(v) * 0.3, 3, { kind: 'frag', grav: 0.2, solidDie: true });
          debris(cx, cy, '#8a6a4a', 8);
        }
        break;
      default:
        if (s.grav) s.vy = Math.min(s.vy + s.grav, 8);
        s.x += s.vx; s.y += s.vy;
        if (s.solidDie && s.vy > 0 && s.y > camY && solidPx(s.x + s.w / 2, s.y + s.h)) {
          s.dead = true;
          const ice = s.kind === 'fallice';
          debris(s.x + s.w / 2, s.y + s.h - 2, ice ? '#c8f0fc' : '#8a6a4a', 6, 1.5);
          if (ice) sfx.shatter(); else if (s.kind !== 'frag') sfx.crumble();
        }
    }
    if (s.dead) continue;
    if (!s.harmless && alive(player) && overlap(s, player)) { damagePlayer(s.dmg); if (!PIERCING.has(s.kind)) s.dead = true; }
    if (s.kind !== 'bcutter' && (s.x + s.w < camX - 32 || s.x > camX + VW + 32 || s.y > camY + VH + 32 || s.y < camY - 96)) s.dead = true;
  }
  eshots = eshots.filter(s => !s.dead);
}

// ================= BOSSES =================
const bcx = b => b.x + b.w / 2;
function faceP(b) { b.facing = pcx() < bcx(b) ? -1 : 1; }
function bossToIdle(b) { b.state = 'idle'; b.t = 0; b.vx = 0; b.fired = false; }
function pick(b, opts) {
  const o = opts.filter(a => a !== b.last);
  b.state = b.last = o[Math.floor(Math.random() * o.length)];
  b.t = 0; b.fired = false;
}
function jumpAt(b, vy, frames, maxV) { b.vy = vy; b.vx = clamp((pcx() - bcx(b)) / frames, -maxV, maxV); b.onGround = false; }
function airborne(b) { if (moveX(b, b.vx)) b.vx = 0; physics(b); }

const BOSSES = {
  cut: {
    name: 'CUTMAN', style: 'cut', pal: { B: '#c83010', b: '#f8a878', S: SKIN }, weapon: 'cut', weak: 'earth',
    update(b, enr) {
      switch (b.state) {
        case 'idle':
          faceP(b); physics(b);
          if (b.t > (enr ? 16 : 30)) { const r = Math.random(); if (b.hasCutter && r < 0.45) { b.state = 'throw'; b.t = 0; } else pick(b, ['jump', 'run']); }
          break;
        case 'throw':
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t === 10) {
            b.hasCutter = false; b.arm = 14;
            eshots.push({ kind: 'bcutter', x: bcx(b) - 7, y: b.y - 6, w: 14, h: 14, tx: pcx(), ty: pcy(), owner: b, dmg: 4, t: 0, delay: 0, big: true });
            sfx.cutter();
          }
          if (b.t >= 22) bossToIdle(b);
          break;
        case 'run':
          b.anim++;
          b.vx = b.facing * (enr ? 2.2 : 1.7);
          if (moveX(b, b.vx) || b.t > 45) { bossToIdle(b); break; }
          if (b.onGround && b.t % 20 === 10 && Math.random() < 0.4) b.vy = -4.5;
          physics(b);
          break;
        case 'jump':
          if (b.t === 1) jumpAt(b, -5.2, 42, 2.2);
          airborne(b);
          if (enr && b.hasCutter && !b.fired && b.vy >= 0) {
            b.fired = true; b.hasCutter = false; b.arm = 14;
            eshots.push({ kind: 'bcutter', x: bcx(b) - 7, y: b.y - 6, w: 14, h: 14, tx: pcx(), ty: pcy(), owner: b, dmg: 4, t: 0, delay: 0, big: true });
            sfx.cutter();
          }
          if (b.onGround && b.t > 3) bossToIdle(b);
          break;
      }
    },
  },
  fire: {
    name: 'FIREMAN', style: 'fire', pal: { B: '#c82800', b: '#f8f0e0', S: SKIN }, weapon: 'fire', weak: 'snow',
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
            b.arm = 14; sfx.flame();
            eshots.push({ kind: 'wave', x: b.facing > 0 ? b.x + b.w : b.x - 14, y: F - 30, w: 14, h: 30, vx: b.facing * 2.8, vy: 0, dmg: 4, t: 0, delay: 0, big: true });
          }
          if (b.t >= (enr ? 50 : 32)) bossToIdle(b);
          break;
        case 'pillar':
          if (b.t === 1) {
            b.targets = enr ? [pcx(), pcx() - 64, pcx() + 64] : [pcx()];
            for (const x of b.targets) eshots.push({ kind: 'pwarn', x: x - 10, y: F - 6, w: 20, h: 6, life: 40, harmless: true, t: 0, delay: 0 });
          }
          if (b.t === 40) {
            sfx.flame(); game.shake = 6;
            for (const x of b.targets) eshots.push({ kind: 'pillar', x: x - 10, y: F - 80, w: 20, h: 80, life: 40, dmg: 4, t: 0, delay: 0, big: true });
          }
          if (b.t >= 70) bossToIdle(b);
          break;
        case 'walk':
          if (b.t < 30) { b.anim++; b.vx = b.facing * 1.2; moveX(b, b.vx); } else b.vx = 0;
          if (b.t === 30 || b.t === 42 || (enr && b.t === 54)) {
            faceP(b); b.arm = 12; sfx.fire();
            enemyShot(bcx(b) + b.facing * 12, b.y + 13, b.facing * 3.2, 0, 3, { kind: 'fireball', w: 12, h: 10, x: bcx(b) + b.facing * 12 - 6, y: b.y + 8 });
          }
          if (b.t >= (enr ? 66 : 56)) bossToIdle(b);
          break;
      }
    },
  },
  snow: {
    name: 'SNOWWOMAN', style: 'snow', pal: { B: '#2868d8', b: '#c8ecfc', S: SKIN }, weapon: 'snow', weak: 'fire',
    update(b, enr) {
      const Rm = ROOM();
      switch (b.state) {
        case 'idle':
          faceP(b); physics(b);
          if (b.t > (enr ? 18 : 32)) pick(b, ['shards', 'slide', 'blizzard']);
          break;
        case 'shards':
          physics(b);
          if (b.t === 12 || (enr && b.t === 30)) {
            faceP(b); b.arm = 14; sfx.ice();
            const a = Math.atan2(pcy() - (b.y + 12), pcx() - bcx(b)), n = enr ? 5 : 3;
            for (let i = 0; i < n; i++) {
              const da = (i - (n - 1) / 2) * 0.22;
              enemyShot(bcx(b), b.y + 12, Math.cos(a + da) * 3, Math.sin(a + da) * 3, 3, { kind: 'ishard', w: 8, h: 8, x: bcx(b) - 4, y: b.y + 8 });
            }
          }
          if (b.t >= (enr ? 44 : 30)) bossToIdle(b);
          break;
        case 'slide':
          if (b.t === 1) faceP(b);
          if (b.t === 14) { b.y += 10; b.h = 14; }
          if (b.t > 14) {
            b.vx = b.facing * (enr ? 4.4 : 3.6);
            if (frameCount % 3 === 0) part({ kind: 'debris', x: bcx(b) - b.facing * 8, y: b.y + b.h - 2, vx: -b.facing * 0.5, vy: -0.8, grav: 0.1, life: 24, col: '#e0f8fc', size: 2 });
            if (moveX(b, b.vx) || b.t > 120) { b.y -= 10; b.h = 24; game.shake = 6; sfx.land(); bossToIdle(b); break; }
          }
          physics(b);
          break;
        case 'blizzard':
          if (b.t === 1) { b.vy = -5.2; b.vx = 0; b.onGround = false; }
          physics(b);
          if (!b.fired && b.vy >= 0) {
            b.fired = true; b.arm = 20; sfx.ice();
            const xs = [pcx()], n = enr ? 5 : 3;
            for (let i = 0; i < n; i++) xs.push(Rm.l + 16 + Math.random() * (Rm.r - Rm.l - 32));
            xs.forEach((x, i) => enemyShot(x, Rm.ceil, 0, 0, 3, { kind: 'fallice', x: x - 4, y: Rm.ceil, w: 8, h: 16, grav: 0.35, delay: 30 + i * 6, solidDie: true }));
          }
          if (b.onGround && b.t > 3) bossToIdle(b);
          break;
      }
    },
  },
  earth: {
    name: 'EARTHWOMAN', style: 'earth', pal: { B: '#7a4a20', b: '#d8b070', S: SKIN }, weapon: 'earth', weak: 'cut',
    update(b, enr) {
      const Rm = ROOM();
      switch (b.state) {
        case 'idle':
          faceP(b); physics(b);
          if (b.t > (enr ? 18 : 32)) pick(b, ['quake', 'boulder', 'rockrain']);
          break;
        case 'quake':
          if (b.t === 1) jumpAt(b, -6.8, 56, 2);
          airborne(b);
          if (b.onGround && b.t > 3) {
            game.shake = 18; sfx.quake();
            dust(bcx(b), b.y + b.h, 6);
            const sp = enr ? 3.6 : 3;
            for (const d of [-1, 1]) eshots.push({ kind: 'quake', x: bcx(b) - 7 + d * 12, y: Rm.floor - 14, w: 14, h: 14, vx: d * sp, vy: 0, dmg: 3, t: 0, delay: 0, big: true });
            bossToIdle(b);
          }
          break;
        case 'boulder':
          physics(b);
          if (b.t === 1) faceP(b);
          if (b.t === 14) {
            b.arm = 14; sfx.rock();
            eshots.push({ kind: 'boulder', x: bcx(b) - 8, y: b.y - 10, w: 16, h: 16, vx: clamp((pcx() - bcx(b)) / 45, -3, 3), vy: -4.5, grav: 0.25, dmg: 4, t: 0, delay: 0, big: true });
          }
          if (b.t >= 36) bossToIdle(b);
          break;
        case 'rockrain':
          physics(b);
          if (b.t === 10) {
            b.arm = 24; sfx.quake(); game.shake = 10;
            const xs = [pcx()], n = enr ? 5 : 4;
            for (let i = 0; i < n; i++) xs.push(Rm.l + 16 + Math.random() * (Rm.r - Rm.l - 32));
            xs.forEach((x, i) => enemyShot(x, Rm.ceil, 0, 0, 3, { kind: 'fallrock', x: x - 7, y: Rm.ceil, w: 14, h: 14, grav: 0.3, delay: 35 + i * 5, solidDie: true, big: true }));
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
    type, x: (level.doorCol + 17) * TILE, y: 13 * TILE, w: 18, h: 24, vx: 0, vy: 0, hp: 28, state: 'drop', t: 0,
    facing: -1, inv: 0, onGround: false, last: '', arm: 0, anim: 0, hasCutter: true, fired: false,
  };
  game.bossBar = 0;
}
function updateBoss() {
  const b = boss;
  if (!b) return;
  b.t++;
  if (b.inv > 0) b.inv--;
  if (b.arm > 0) b.arm--;
  if (b.state === 'drop') { physics(b); if (b.onGround) { b.state = 'pose'; b.t = 0; sfx.land(); dust(bcx(b), b.y + b.h, 4); } return; }
  if (b.state === 'pose') return;
  if (b.state === 'stagger') {
    if (b.h !== 24) { b.y -= 10; b.h = 24; }
    moveX(b, -b.facing * 0.8); physics(b);
    if (b.t > 18) bossToIdle(b);
  } else BOSSES[b.type].update(b, b.hp <= 14);
  if (b.type === 'fire' && frameCount % 4 === 0) part({ kind: 'ember', x: bcx(b) + (Math.random() - 0.5) * 6, y: b.y - 4, vy: -0.8, life: 18 });
  if (alive(player) && overlap(b, player)) damagePlayer(4);
}
function defeatBoss() {
  const b = boss;
  b.hp = 0;
  orbs(bcx(b), b.y + b.h / 2, BOSSES[b.type].pal.b);
  orbs(bcx(b), b.y + b.h / 2, '#f8d800', 0.6);
  sfx.bigBoom();
  game.flash = 10;
  boss = null; eshots = [];
  game.score += 10000;
  game.state = 'clear'; game.t = 0;
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
    k.life--;
    if (k.life <= 0 || k.y > LH * TILE) { k.dead = true; continue; }
    if (alive(player) && overlap(k, player)) {
      k.dead = true;
      if (k.placed) k.placed.taken = true;
      if (k.kind === 'L') { game.lives = Math.min(9, game.lives + 1); sfx.oneup(); }
      else { game.refill += k.kind === 'h' ? 2 : 10; if (player.hp >= 28) { game.refill = 0; sfx.tick(); } }
      game.score += 100;
    }
  }
  pickups = pickups.filter(k => !k.dead);
}
