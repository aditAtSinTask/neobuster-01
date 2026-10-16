'use strict';
// Game flow (title, stage select, stages, boss, weapon get, ending), rendering and the main loop.

// ================= SAVE =================
const SAVE_KEY = 'neobuster-save-v1';
function loadSave() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { /* storage unavailable */ }
  if (!s || !s.cleared) s = { cleared: {} };
  s.points = s.points || 0; s.parts = s.parts || {}; // shop wallet and bought parts ('on' / 'off')
  return s;
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* storage unavailable */ } }
const save = loadSave();
const allCleared = () => STAGE_ORDER.every(k => save.cleared[k]);

// states where the player is inside a stage, and states where a run is in progress at all
const IN_STAGE = ['ready', 'play', 'pause', 'door', 'bossintro'];
const IN_GAME = ['select', 'intro', ...IN_STAGE, 'clear', 'weaponget'];

// save point (cheat INGATANKUAT): lives, score, weapon and, inside a stage, the stage + checkpoint
function saveSnapshot() {
  const inStage = IN_STAGE.includes(game.state);
  if (game.state === 'clear' || game.state === 'weaponget') save.cleared[game.stage] = true;
  save.snap = { lives: game.lives, score: game.score, weapon: player.weapon, stage: inStage ? game.stage : null, checkpoint: inStage ? game.checkpoint : 0 };
  writeSave();
}
function continueGame() {
  const s = save.snap;
  game.lives = s.lives; game.score = s.score;
  if (ownedWeapons().includes(s.weapon)) player.weapon = s.weapon;
  if (s.stage) startStage(s.stage, s.checkpoint);
  else goSelect();
}

// ================= STAGE FLOW =================
function startStage(key, checkpoint = false) {
  game.stage = key;
  level = buildStage(key);
  map = level.map; LW = level.LW; LH = level.LH;
  levelCanvas = renderLevelCanvas(level);
  game.checkpoint = +checkpoint || 0; game.time = 0; // number of checkpoints reached (old saves stored true/false)
  game.placed = level.ents.filter(e => ['h', 'E', 'L'].includes(e.type)).map(e => ({ kind: e.type, tx: e.x, ty: e.y, taken: false }));
  spawns = level.ents.filter(e => EN[e.type]).map(e => ({ type: e.type, tx: e.x, ty: e.y, armed: true, ent: null }));
  if (!ownedWeapons().includes(player.weapon)) player.weapon = 'buster';
  ambient = makeAmbient(STAGES[key].ambient);
  restartFromCheckpoint();
}

const HAZARD_TYPES = ['saw', 'jet', 'icicle', 'rockfall', 'zap', 'bubble', 'eblock', 'wind'];
function restartFromCheckpoint() {
  for (let y = 0; y < LH; y++) map[y] = level.orig[y].slice();
  crumbling.clear();
  enemies = []; pshots = []; eshots = []; particles = []; boss = null;
  hazards = level.ents.filter(e => HAZARD_TYPES.includes(e.type)).map(makeHazard);
  plats = level.ents.filter(e => e.type === 'plat').map(makePlat);
  pickups = game.placed.filter(p => !p.taken).map(p => makePickup(p.kind, p.tx * TILE + 8, p.ty * TILE + 4, p));
  for (const s of spawns) { s.armed = true; s.ent = null; }
  door.open = 0; door.solid = true; door.phase = '';
  Object.assign(game, { bossLocked: false, bossBar: 0, refill: 0, deadT: 0, shake: 0, flash: 0, popup: 0 });
  const spot = game.checkpoint ? level.cps[Math.min(game.checkpoint, level.cps.length) - 1] : level.start;
  const sx = spot.x * TILE + 1;
  Object.assign(player, {
    x: sx, w: 14, h: 22, vx: 0, vy: 0, facing: 1, onGround: false, state: 'beam', hp: 28, inv: 0,
    shootT: 0, charge: 0, storm: 0, shieldCd: [0, 0], shieldAng: 0, anim: 0, slideT: 0, hurtT: 0, plat: null, jumpBuf: 0, coyote: 0, jumpT: 99,
  });
  game.noLerp = true;
  player.targetY = groundBelow(sx + 7, spot.y * TILE) - player.h;
  player.y = player.targetY - VH;
  player.anchorY = player.targetY;
  updateCamera(true);
  game.state = 'ready'; game.t = 0;
  playMusic(STAGES[game.stage].music);
}

const followCamX = p => Math.round(clamp(p.x + p.w / 2 - VW / 2, 0, (level.doorCol + 1) * TILE - VW));

function updateCamera(snap) {
  if (game.bossLocked) { camX = bossRoomX(); camY = camYf = BOSS_CAM_Y; return; }
  const p = player;
  // vertical anchor ignores ordinary jumps so the camera does not bob
  if (p.state === 'beam') p.anchorY = p.targetY;
  else if (alive(p)) {
    if (p.onGround || p.state === 'climb' || p.y > p.anchorY) p.anchorY = p.y;
    else if (p.y < p.anchorY - 40) p.anchorY = p.y + 40;
  }
  camX = followCamX(p);
  const ty = clamp(p.anchorY + 11 - VH * 0.58, 0, maxCamY());
  if (alive(p)) camYf = snap ? ty : camYf + (ty - camYf) * 0.12;
  camY = Math.round(camYf);
}

function cycleWeapon(d) {
  const ow = ownedWeapons();
  if (ow.length < 2) return;
  const i = ow.indexOf(player.weapon);
  player.weapon = ow[(i + d + ow.length) % ow.length];
  pshots = []; player.charge = 0;
  game.popup = 80;
  sfx.select();
}

function updatePlay() {
  if (hit.start && alive(player)) {
    game.state = 'pause'; game.pcol = 0;
    game.sel = Math.max(0, ownedWeapons().indexOf(player.weapon));
    sfx.pause();
    return;
  }
  if (alive(player) && (hit.prev || hit.next)) cycleWeapon(hit.next ? 1 : -1);
  if (game.refill > 0) { // classic energy refill: world freezes while the bar fills
    if (frameCount % 3 === 0) { if (player.hp < 28) { player.hp = Math.min(28, player.hp + 1); game.refill--; sfx.tick(); } else game.refill = 0; }
    return;
  }
  game.time++;
  if (game.shake > 0) game.shake--;
  if (game.flash > 0) game.flash--;
  if (game.popup > 0) game.popup--;
  updatePlats();
  updatePlayer();
  updateCrumbles();
  updateCamera(false);
  if (!game.bossLocked) updateSpawns();
  updateEnemies();
  updateHazards();
  updateBoss();
  updatePlayerShots();
  updateEnemyShots();
  updatePickups();
  updateParticles();
  checkHazards();

  // a checkpoint counts once the player walks past it at its height (a cave checkpoint is not taken from the surface)
  level.cps.forEach((c, i) => {
    if (i >= game.checkpoint && player.x > c.x * TILE && Math.abs(player.y + player.h - (c.y + 1) * TILE) < 48) game.checkpoint = i + 1;
  });

  if (!alive(player)) {
    if (++game.deadT > 210) {
      game.lives--;
      if (game.lives < 0) { game.state = 'gameover'; game.t = 0; sfx.gameover(); }
      else restartFromCheckpoint();
    }
    return;
  }
  if (!game.bossLocked && game.state === 'play' && player.state === 'normal' && player.onGround && player.x + player.w >= level.doorCol * TILE - 1) {
    game.state = 'door'; door.phase = 'open';
    pshots = []; eshots = []; player.vx = 0; player.charge = 0; player.storm = 0;
    sfx.door();
  }
}

function updateDoor() {
  const p = player;
  updateParticles();
  if (door.phase === 'open') {
    door.open = Math.min(1, door.open + 1 / 20);
    if (door.open >= 1) { door.solid = false; door.phase = 'scroll'; enemies = []; }
  } else if (door.phase === 'scroll') {
    camX = Math.min(bossRoomX(), camX + 2);
    camYf += (BOSS_CAM_Y - camYf) * 0.15; camY = Math.round(camYf);
    const tx = level.doorCol * TILE + 26;
    p.facing = 1;
    if (p.x < tx) { p.x += 0.8; p.vx = 0.8; p.anim++; } else p.vx = 0;
    if (camX >= bossRoomX() && p.x >= tx) { door.phase = 'close'; p.vx = 0; sfx.door(); }
  } else if (door.phase === 'close') {
    door.open = Math.max(0, door.open - 1 / 20);
    if (door.open <= 0) {
      door.solid = true; game.bossLocked = true;
      updateCamera(true);
      spawnBoss();
      game.state = 'bossintro'; game.t = 0;
      playMusic('boss');
    }
  }
}

function updateBossIntro() {
  game.t++;
  applyGravity(player);
  updateBoss();
  updateParticles();
  if (boss.state === 'pose' && boss.t > 30 && frameCount % 3 === 0) {
    game.bossBar++;
    sfx.tick();
    if (game.bossBar >= 28) { bossToIdle(boss); game.state = 'play'; }
  }
}

// ================= SHOP =================
const SHOP = [
  { key: 'boots', name: 'BOOTS ANTI DURI', price: 8000, desc: 'JALAN DI ATAS DURI TANPA MATI' },
  { key: 'armor', name: 'ARMOR ANTI API', price: 8000, desc: 'MASUK DAN JALAN DI LAVA TANPA MATI' },
  { key: 'jet', name: 'JETPACK', price: 10000, desc: 'LOMPAT 1.6X LEBIH TINGGI' },
  { key: 'core', name: 'CORE', price: 6000, desc: 'KEBAL 5X LEBIH LAMA SETELAH KENA HIT' },
  { key: 'super', name: 'SUPER BOOSTER', price: 15000, desc: 'TEMBAKAN BIASA LANGSUNG JADI CHARGE SHOT' },
  { key: 'ultra', name: 'ULTRA BOOSTER', price: 25000, needs: 'super', desc: 'TAHAN TEMBAK 2.5 DETIK: ULTRA ATTACK' },
  { key: 'shield', name: 'SHIELD', price: 12000, desc: '2 PERISAI - YANG KENA HIT HILANG 10 DETIK' },
  { key: 'omega', name: 'OMEGA BOOSTER', price: 40000, needs: 'ultra', desc: 'ULTRA ATTACK TANPA DELAY, SUPER/ULTRA DISABLED' },
];
// a part's state for menus: undefined (not bought), 'on', 'off' or 'disabled' (overridden by Omega Booster)
const partState = k => (save.parts[k] && partDisabled(k) ? 'disabled' : save.parts[k]);
const STATE_TEXT = { on: 'ON', off: 'OFF', disabled: 'DISABLED' }, STATE_COL = { on: '#b8f818', off: '#888898', disabled: '#a87878' };
function shopMsg(text, ok) { game.shopMsg = text; game.shopOk = ok; game.shopMsgT = 120; }
// buy the part, or switch an owned part on/off
function shopAction(it) {
  const own = save.parts[it.key];
  if (own && partDisabled(it.key)) { shopMsg('DISABLED SELAMA OMEGA BOOSTER ON', false); sfx.deflect(); }
  else if (own) {
    save.parts[it.key] = own === 'on' ? 'off' : 'on'; writeSave(); sfx.select();
    shopMsg(it.name + (own === 'on' ? ' OFF' : ' ON'), own !== 'on');
  } else if (it.needs && !save.parts[it.needs]) { shopMsg('BELI ' + SHOP.find(s => s.key === it.needs).name + ' DULU', false); sfx.deflect(); }
  else if (save.points < it.price) { shopMsg('POIN TIDAK CUKUP', false); sfx.deflect(); }
  else { save.points -= it.price; save.parts[it.key] = 'on'; writeSave(); sfx.buy(); shopMsg('TERBELI! ' + it.name, true); }
}

function goSelect() {
  game.state = 'select'; game.t = 0;
  const i = STAGE_ORDER.findIndex(k => !save.cleared[k]);
  game.sel = i < 0 ? 0 : i;
  playMusic('title');
}

function step() {
  pollInput();
  frameCount++;
  updateMusic();
  updateAmbient();
  const go = hit.start || hit.jump;
  switch (game.state) {
    case 'title':
      game.t++;
      if (hit.reset && (Object.keys(save.cleared).length || save.snap || save.points || Object.keys(save.parts).length)) {
        save.cleared = {}; delete save.snap; save.points = 0; save.parts = {}; writeSave(); player.weapon = 'buster'; sfx.deflect();
      }
      if (save.snap && (hit.left || hit.right || hit.up || hit.down)) { game.menu ^= 1; sfx.select(); }
      if (go) {
        sfx.confirm(); game.tough = false;
        if (save.snap && game.menu === 0) continueGame();
        else { game.lives = 2; game.score = 0; goSelect(); }
      }
      break;
    case 'select': {
      game.t++;
      let s = game.sel;
      const [c, r] = SEL_POS[s], row = SEL_POS.map((q, i) => i).filter(i => SEL_POS[i][1] === r);
      if (hit.left || hit.right) s = row[(row.indexOf(s) + (hit.right ? 1 : row.length - 1)) % row.length];
      if (hit.up || hit.down) { // jump to the nearest panel in the other row
        const other = SEL_POS.map((q, i) => i).filter(i => SEL_POS[i][1] !== r);
        s = other.reduce((a, i) => (Math.abs(SEL_POS[i][0] - c) < Math.abs(SEL_POS[a][0] - c) ? i : a));
      }
      if (s !== game.sel) { game.sel = s; sfx.select(); }
      if (hit.shoot) { game.state = 'shop'; game.shopSel = 0; game.shopMsg = ''; sfx.pause(); break; }
      if (hit.slide) { game.state = 'weak'; sfx.pause(); break; }
      if (go) { sfx.confirm(); game.state = 'intro'; game.t = 0; game.introKey = STAGE_ORDER[game.sel]; stopMusic(); }
      break;
    }
    case 'intro':
      game.t++;
      if (game.t === 20) notes([[64, 0], [67, 0.12], [71, 0.24], [76, 0.36], [74, 0.6], [76, 0.72]], 'square', 0.1, 0.18);
      if (game.t > 190 || (game.t > 40 && go)) startStage(game.introKey);
      break;
    case 'ready':
      updateParticles();
      if (++game.t >= 100) game.state = 'play';
      break;
    case 'play':
      updatePlay();
      break;
    case 'shop': {
      game.t++;
      if (game.shopMsgT > 0) game.shopMsgT--;
      if (hit.up) { game.shopSel = (game.shopSel + SHOP.length - 1) % SHOP.length; sfx.select(); }
      if (hit.down) { game.shopSel = (game.shopSel + 1) % SHOP.length; sfx.select(); }
      if (hit.shoot) { game.state = 'select'; sfx.pause(); break; }
      if (go) shopAction(SHOP[game.shopSel]);
      break;
    }
    case 'weak':
      game.t++;
      if (hit.slide || hit.shoot || go) { game.state = 'select'; sfx.pause(); }
      break;
    case 'pause': { // left column: weapons + exit (pick = equip and resume); right column: owned tools (pick = on/off)
      const cols = pauseColumns();
      if ((hit.left || hit.right) && cols[1].length) { game.pcol ^= 1; game.sel = Math.min(game.sel, cols[game.pcol].length - 1); sfx.select(); }
      const items = cols[game.pcol];
      if (hit.up) { game.sel = (game.sel + items.length - 1) % items.length; sfx.select(); }
      if (hit.down) { game.sel = (game.sel + 1) % items.length; sfx.select(); }
      if (go || hit.shoot) {
        const it = items[game.sel];
        if (game.pcol === 1) { if (partDisabled(it)) sfx.deflect(); else { save.parts[it] = save.parts[it] === 'on' ? 'off' : 'on'; writeSave(); sfx.select(); } }
        else if (it === 'exit') { sfx.pause(); goSelect(); }
        else { if (it !== player.weapon) { player.weapon = it; pshots = []; player.charge = 0; } game.state = 'play'; sfx.pause(); }
      }
      break;
    }
    case 'door':
      updateDoor();
      break;
    case 'bossintro':
      updateBossIntro();
      break;
    case 'clear':
      game.t++;
      updateParticles();
      if (game.flash > 0) game.flash--;
      if (game.t === 120) sfx.victory();
      if (game.t > 300) {
        save.cleared[game.stage] = true; writeSave();
        player.weapon = game.stage;
        game.state = 'weaponget'; game.t = 0;
        sfx.weaponGet();
      }
      break;
    case 'weaponget':
      game.t++;
      if (game.t > 60 && go) { if (allCleared()) { game.state = 'ending'; game.t = 0; playMusic('title'); } else goSelect(); }
      break;
    case 'gameover':
      game.t++;
      if (game.t > 40 && go) { game.lives = 2; game.tough = false; goSelect(); }
      break;
    case 'ending':
      game.t++;
      if (game.t > 90 && go) { game.state = 'title'; game.t = 0; }
      break;
  }
}

// ================= AMBIENT PARTICLES (screen space) =================
let ambient = { type: '', ps: [] };
function makeAmbient(type) {
  const rnd = Math.random, ps = [];
  const n = type === 'snow' ? 70 : type === 'rain' ? 90 : type === 'breeze' ? 34 : type === 'embers' ? 40 : 30;
  for (let i = 0; i < n; i++) ps.push({ x: rnd() * VW, y: rnd() * VH, s: 1 + (rnd() * 2 | 0), ph: rnd() * 6.28, sp: 0.3 + rnd() * 0.6 });
  return { type, ps };
}
// elec stage: a lightning flash in the sky every STORM_T frames
const STORM_T = 260;
function updateAmbient() {
  if (!ambient.type || !['play', 'ready', 'door', 'bossintro', 'clear', 'pause'].includes(game.state)) return;
  if (ambient.type === 'rain' && game.state !== 'pause' && frameCount % STORM_T === 4) sfx.rumble();
  for (const q of ambient.ps) {
    if (ambient.type === 'snow') { q.y += q.sp; q.x += Math.sin(frameCount * 0.02 + q.ph) * 0.3; }
    else if (ambient.type === 'rain') { q.y += 5 + q.sp * 3; q.x -= 1.2; }
    else if (ambient.type === 'breeze') { q.x += 1.2 + q.sp * 1.5; q.y += Math.sin(frameCount * 0.05 + q.ph) * 0.6; }
    else if (ambient.type === 'embers') { q.y -= q.sp; q.x += Math.sin(frameCount * 0.03 + q.ph) * 0.4; }
    else { q.x += Math.sin(frameCount * 0.01 + q.ph) * 0.2 + 0.1; q.y += Math.cos(frameCount * 0.013 + q.ph) * 0.15; }
  }
}
function drawAmbient() {
  const wrap = (v, m) => ((v % m) + m) % m;
  for (const q of ambient.ps) {
    const x = wrap(q.x - camX * 0.6, VW), y = wrap(q.y - camY * 0.6, VH);
    if (ambient.type === 'snow') R(x, y, q.s, q.s, q.s > 1 ? '#fcfcfc' : '#c8d8f0');
    else if (ambient.type === 'rain') R(x, y, 1, 4 + q.s * 2, q.s > 1 ? '#a8b8e8' : '#6070a0');
    else if (ambient.type === 'breeze') { if (q.s > 1) { R(x, y, 3, 2, '#78c858'); R(x + 1, y - 1, 1, 1, '#a8e878'); } else R(x, y, 6, 1, 'rgba(255,255,255,0.7)'); }
    else if (ambient.type === 'embers') { R(x, y, q.s, q.s, q.s > 1 ? '#f8d800' : '#f87800'); if (q.s > 1) glow(x, y, 6, '#f86000', 0.5); }
    else R(x, y, 1, 1, game.stage === 'earth' ? '#f0d8b0' : '#b8a8a0');
  }
}

function drawStormSky() {
  const t = frameCount % STORM_T, cyc = Math.floor(frameCount / STORM_T);
  if (t >= 14 || (t >= 4 && t < 8)) return;
  const rnd = mulberry(cyc * 7919 + 1), x = 40 + rnd() * (VW - 80);
  ctx.globalAlpha = 0.16; R(0, 0, VW, VH, '#d8e0ff'); ctx.globalAlpha = 1;
  drawBolt(x, -8, x + (rnd() - 0.5) * 90, VH * 0.5, cyc, '#b8c4ff', 1, 22);
}

const VIGNETTE = makeCanvas(VW, VH, g => {
  const gr = g.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.65);
  gr.addColorStop(0, 'rgba(0,0,0,0)');
  gr.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
});

// ================= WORLD RENDER =================
function drawDynamicTiles() {
  const t0 = Math.floor(camX / TILE), r0 = Math.floor(camY / TILE);
  const lavaGlows = [];
  for (let ty = r0; ty <= r0 + 14; ty++) for (let tx = t0; tx <= t0 + 24; tx++) {
    const t = tileAt(tx, ty);
    if (t !== '~' && t !== 'C' && t !== 'D' && t !== '<' && t !== '>' && t !== 'U') continue;
    const sx = tx * TILE - camX, sy = ty * TILE - camY;
    if (t === '~') {
      R(sx, sy, 16, 16, '#c82800');
      for (let i = 0; i < 16; i += 2) {
        const h = 3 + Math.sin((tx * 16 + i) * 0.3 + frameCount * 0.08) * 2 | 0;
        R(sx + i, sy, 2, h, '#f8d800'); R(sx + i, sy + h, 2, 2, '#f87800');
      }
      if ((tx * 7 + (frameCount >> 4)) % 5 === 0) R(sx + 6, sy + 9, 3, 3, '#f8a800');
      if (tx % 2 === 0) lavaGlows.push([sx + 16, sy + 2]);
    } else if (t === 'U') { // updraft pad: a grille with air streaming up from it
      R(sx, sy, 16, 16, '#5a6a8a'); R(sx, sy, 16, 4, '#2a3248'); R(sx + 1, sy + 4, 14, 11, '#7a8aaa');
      for (let k = 2; k < 16; k += 4) R(sx + k, sy, 2, 4, '#78f8c8');
      for (let k = 0; k < 3; k++) { const h = (frameCount * 2 + k * 11 + tx * 7) % 34; R(sx + 3 + k * 5, sy - h - 4, 1, 4, 'rgba(184,252,224,0.8)'); }
      glow(sx + 8, sy - 2, 10, '#78f8c8', 0.35);
    } else if (t === '<' || t === '>') { // conveyor: the stripes on the belt run in its direction
      const dir = t === '>' ? 1 : -1, off = (((frameCount * 0.8 * dir) % 6) + 6) % 6;
      R(sx, sy, 16, 16, '#3a3a46'); R(sx, sy, 16, 5, '#202028'); R(sx, sy + 5, 16, 1, '#0a0a16');
      for (let k = -6; k < 16; k += 6) { const xx = sx + k + off; if (xx >= sx && xx <= sx + 14) R(xx, sy + 1, 2, 3, '#b8b8c8'); }
      circle(sx + 8, sy + 10, 4, '#686878'); circle(sx + 8, sy + 10, 1.5, '#202028');
      R(sx, sy + 15, 16, 1, '#202028');
    } else if (t === 'C') {
      const c = crumbling.get(tx + ',' + ty), dx = c && c.t > 0 ? ((c.t & 2) ? 1 : -1) : 0;
      R(sx + dx, sy, 16, 16, '#6a4a2a'); R(sx + dx, sy, 15, 15, '#a8784a'); R(sx + dx, sy, 15, 2, '#c8986a');
      R(sx + dx + 4, sy + 3, 1, 6, '#4a2c16'); R(sx + dx + 5, sy + 8, 4, 1, '#4a2c16'); R(sx + dx + 10, sy + 9, 1, 5, '#4a2c16');
      R(sx + dx + 11, sy + 4, 3, 1, '#4a2c16');
    } else {
      R(sx, sy, 16, 16, '#101018');
      const cover = clamp(48 * (1 - door.open) - (ty - 19) * 16, 0, 16);
      for (let k = 0; k < cover; k += 4) { R(sx + 1, sy + k, 14, Math.min(3, cover - k), '#c0c0c8'); if (k + 3 < cover) R(sx + 1, sy + k + 3, 14, 1, '#606068'); }
      R(sx, sy, 1, 16, '#404048'); R(sx + 15, sy, 1, 16, '#404048');
    }
  }
  for (const [x, y] of lavaGlows) glow(x, y, 22, '#f85000', 0.35);
}

// animated parts of the themed boss rooms (the static wall art is painted into the level canvas)
function drawRoomFx() {
  const rx = (level.doorCol + 1) * TILE - camX, ry = 13 * TILE - camY;
  if (rx > VW || rx + 352 < 0 || ry > VH || ry + 144 < 0) return;
  switch (level.theme) {
    case 'cut': // two big gears turning on the back wall
      for (const [gx, gy, r, d] of [[rx + 40, ry + 44, 26, 1], [rx + 312, ry + 44, 26, -1]]) {
        const a0 = frameCount * 0.02 * d;
        for (let i = 0; i < 10; i++) { const a = a0 + i * Math.PI / 5; R(gx + Math.cos(a) * r - 3, gy + Math.sin(a) * r - 3, 6, 6, '#3a4050'); }
        circle(gx, gy, r - 2, '#3a4050'); circle(gx, gy, r - 9, '#2a2e3a'); circle(gx, gy, 5, '#4a5060');
        R(gx + Math.cos(a0) * 12 - 2, gy + Math.sin(a0) * 12 - 2, 4, 4, '#4a5060');
      }
      break;
    case 'fire': // lava falls pouring down the back wall
      for (const fx of [rx + 34, rx + 306]) {
        R(fx, ry, 12, 144, '#a82000');
        for (let y = ((frameCount * 2) % 12) - 12; y < 144; y += 12) { R(fx + 2, ry + y, 3, 6, '#f8a800'); R(fx + 7, ry + y + 5, 3, 6, '#f87800'); }
        glow(fx + 6, ry + 140, 22, '#f85000', 0.6);
      }
      break;
    case 'elec': { // tesla coils with arcs jumping between them
      for (const cx of [rx + 28, rx + 324]) { glow(cx, ry + 30, 12, '#f8e030', 0.4 + ((frameCount >> 2) & 1) * 0.3); }
      const t = frameCount % 70;
      if (t < 8) { drawBolt(rx + 28, ry + 30, rx + 324, ry + 30, frameCount >> 1, '#b8c4ff', 1, 26); glow(rx + 176, ry + 30, 40, '#b8c4ff', 0.3); }
      break;
    }
  }
}

const PAL_GOLD = { B: '#f8b800', b: '#fcf0a0', S: '#fcfcfc' };
const PLAT_COL = { cut: '#d8a020', fire: '#7a7a88', elec: '#5868a0', snow: '#a8e0f8', earth: '#9a7a50', wind: '#e8f0f8' };
function drawPlatsAndHazards() {
  for (const pl of plats) {
    const x = Math.round(pl.x) - camX, y = Math.round(pl.y) - camY, c = PLAT_COL[level.theme];
    sprite(x, y, 1, 32, [[0, 0, 32, 8, c]], [[2, 3, 2, 2, shade(c, -0.5)], [28, 3, 2, 2, shade(c, -0.5)], [6, 2, 20, 1, shade(c, 0.5)]]);
    R(x + 10, y + 8, 12, 2, shade(c, -0.6));
    glow(x + 16, y + 12, 8, '#58d8f8', 0.5);
  }
  for (const h of hazards) {
    switch (h.kind) {
      case 'saw': {
        const ax = h.ax - camX, ay = h.ay - camY, bx = h.bx - camX, by = h.by - camY;
        if (ay === by) R(Math.min(ax, bx), ay - 1, Math.abs(bx - ax), 2, 'rgba(10,10,22,0.5)');
        else R(ax - 1, Math.min(ay, by), 2, Math.abs(by - ay), 'rgba(10,10,22,0.5)');
        const cx = h.x + 9 - camX, cy = h.y + 9 - camY;
        for (let i = 0; i < 8; i++) { const a = h.rot + i * Math.PI / 4; R(cx + Math.cos(a) * 9 - 2, cy + Math.sin(a) * 9 - 2, 4, 4, '#0a0a16'); R(cx + Math.cos(a) * 9 - 1, cy + Math.sin(a) * 9 - 1, 3, 3, '#e8e8f0'); }
        circle(cx, cy, 8, '#0a0a16'); circle(cx, cy, 7, '#a8a8b8'); circle(cx, cy, 5, '#d0d0dc');
        R(cx + Math.cos(h.rot) * 4 - 1, cy + Math.sin(h.rot) * 4 - 1, 2, 2, '#fcfcfc');
        circle(cx, cy, 2, '#505060');
        break;
      }
      case 'jet': {
        const x = h.cx - camX, base = h.base - camY;
        R(x - 7, base - 3, 14, 3, '#0a0a16'); R(x - 6, base - 3, 12, 2, '#686870'); R(x - 3, base - 3, 6, 1, '#202028');
        if (h.on) drawFlameColumn(x, base, 48, 7);
        else if (h.warn && (frameCount & 4)) { R(x - 2, base - 6, 4, 3, '#f8a800'); glow(x, base - 4, 10, '#f86000', 0.6); }
        break;
      }
      case 'icicle':
        if (h.state !== 'gone') drawIcicle(h.x - camX, h.y - camY);
        break;
      case 'bubble': {
        const x = h.x - camX, y = h.y - camY, t = (frameCount + h.phase) % h.period;
        if (h.on) {
          glow(x + 6, y + 6, 14, '#f86000', 0.9);
          circle(x + 6, y + 6, 6, '#c82800'); circle(x + 6, y + 5, 4, '#f87800'); circle(x + 6, y + 4, 2, '#fcf8c0');
        } else if (t > h.period - 30 && (frameCount & 4)) { circle(x + 6, h.baseY - camY + 2, 3, '#f8d800'); glow(x + 6, h.baseY - camY, 10, '#f86000', 0.6); }
        break;
      }
      case 'eblock': {
        const x = h.x - camX, y = h.y - camY, per = (h.n + 2) * h.step;
        if (h.on) {
          if (h.t > h.step * 3 - 24 && (frameCount & 2)) break; // about to vanish
          R(x, y, h.w, 16, '#0a0a16'); R(x + 1, y + 1, h.w - 2, 14, '#c8a800'); R(x + 2, y + 2, h.w - 4, 11, '#f8e030');
          for (let k = 4; k < h.w - 4; k += 8) { R(x + k, y + 4, 4, 2, '#fcfcfc'); R(x + k + 2, y + 6, 2, 4, '#fcf8a0'); }
          glow(x + h.w / 2, y + 8, 16, '#f8e030', 0.35);
        } else if (h.t > per - 24) { ctx.globalAlpha = 0.35; R(x + 1, y + 1, h.w - 2, 14, '#f8e030'); ctx.globalAlpha = 1; } // about to appear
        break;
      }
      case 'wind': {
        if (h.state === 'calm') break;
        const a = Math.max(h.x0 - camX, 0), b = Math.min(h.x1 - camX, VW), n = h.state === 'gust' ? 46 : 12;
        if (b <= a) break;
        for (let i = 0; i < n; i++) {
          const len = 6 + (i % 4) * 4, sp = h.state === 'gust' ? 7 : 3;
          const x = a + ((((i * 97 + frameCount * sp * h.dir) % (b - a)) + (b - a)) % (b - a)), y = (i * 53 + (frameCount >> 1) * (i % 3)) % VH;
          R(x, y, len, 1, i % 3 ? 'rgba(230,240,255,0.55)' : 'rgba(255,255,255,0.85)');
        }
        break;
      }
      case 'zap': {
        const x = h.cx - camX, top = h.top - camY, bot = h.bot - camY;
        for (const [y, ly] of [[top, top + 4], [bot - 5, bot - 6]]) { R(x - 6, y, 12, 5, '#0a0a16'); R(x - 5, y + (y === top ? 0 : 1), 10, 4, '#6a7490'); R(x - 2, ly, 4, 2, h.on || h.warn ? '#f8e030' : '#685800'); }
        if (h.on) { drawBolt(x, top + 6, x, bot - 6, (frameCount >> 1) + h.cx, '#f8f058', 2, 10); glow(x, (top + bot) / 2, 26, '#f8e030', 0.5); }
        else if (h.warn && (frameCount & 4)) { glow(x, top + 6, 8, '#f8e030', 0.8); glow(x, bot - 6, 8, '#f8e030', 0.8); R(x - 1, top + 6, 2, 3, '#fcfcfc'); R(x - 1, bot - 9, 2, 3, '#fcfcfc'); }
        break;
      }
    }
  }
}
function drawFlameColumn(cx, base, height, half) {
  for (let y = 0; y < height; y += 4) {
    const w = half + Math.sin((y + frameCount * 3) * 0.25) * 2;
    R(cx - w, base - y - 4, w * 2, 4, '#f83800');
    R(cx - w * 0.6, base - y - 4, w * 1.2, 4, '#f8a800');
    R(cx - w * 0.25, base - y - 4, w * 0.5, 4, '#fcf8c0');
  }
  for (let y = 8; y < height; y += 16) glow(cx, base - y, half * 3, '#f86000', 0.6);
}
function drawIcicle(x, y) {
  for (let r = 0; r < 14; r++) {
    const w = Math.max(1, 8 - (r >> 1));
    R(x + (8 - w) / 2, y + r, w, 1, '#a8e0f8');
    R(x + (8 - w) / 2, y + r, 1, 1, '#fcfcfc');
  }
}
function drawRock(x, y, s) {
  sprite(x, y, 1, s, [[1, 2, s - 2, s - 3, '#8a6a4a'], [3, 0, s - 6, 4, '#a88a6a']], [[s / 2 | 0, s / 2 | 0, 2, 2, '#5a3a2a'], [3, s - 5, 3, 1, '#5a3a2a']]);
}
function drawCutter(x, y, rot, handle) {
  ctx.save();
  ctx.translate(Math.round(x + 7), Math.round(y + 7));
  ctx.rotate(rot);
  for (const a of [0, Math.PI / 2]) {
    ctx.save(); ctx.rotate(a);
    ctx.fillStyle = '#0a0a16'; ctx.fillRect(-8, -2, 16, 4);
    ctx.fillStyle = '#e8e8f0'; ctx.fillRect(-7, -1, 9, 2);
    ctx.fillStyle = handle; ctx.fillRect(2, -1, 5, 2);
    ctx.restore();
  }
  ctx.fillStyle = '#505060'; ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

// upright scissors around a pivot at (cx, cy): blades point up, ring handles point down, `open` is the half-angle
function drawScissors(cx, cy, open) {
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  for (const pass of [0, 1]) for (const sg of [-1, 1]) {
    ctx.save(); ctx.rotate(sg * open);
    if (pass === 0) { ctx.fillStyle = '#0a0a16'; ctx.fillRect(-3, -24, 6, 26); ctx.fillRect(-5, 7, 10, 14); }
    else {
      ctx.fillStyle = '#e8e8f0'; ctx.fillRect(-2, -22, 4, 22); ctx.fillStyle = '#fcfcfc'; ctx.fillRect(sg > 0 ? -2 : 1, -22, 1, 22);
      ctx.fillStyle = '#8888a0'; ctx.fillRect(-1, -23, 2, 2);
      ctx.fillStyle = '#f83800'; ctx.fillRect(-1, 0, 2, 8); ctx.fillRect(-4, 8, 8, 12);
      ctx.fillStyle = '#0a0a16'; ctx.fillRect(-2, 11, 4, 6);
    }
    ctx.restore();
  }
  ctx.fillStyle = '#505060'; ctx.fillRect(-2, -2, 4, 4); ctx.fillStyle = '#d0d0dc'; ctx.fillRect(-1, -1, 1, 1);
  ctx.restore();
}

// a tornado: stacked swirling bands that widen toward the top, base at (cx, by)
function drawWhirl(cx, by, w, h, t, col = '#b8fce0') {
  const n = Math.max(3, h / 4 | 0);
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1), bw = Math.max(3, w * (0.3 + 0.7 * k)), off = Math.sin(t * 0.4 + i * 0.9) * w * 0.12;
    R(cx - bw / 2 + off, by - (i + 1) * (h / n), bw, Math.max(2, h / n - 1), i & 1 ? col : '#fcfcfc');
  }
}

function drawPlayerShot(s) {
  const x = Math.round(s.x) - camX, y = Math.round(s.y) - camY;
  switch (s.kind) {
    case 'buster':
      if (s.deflected) { R(x + 1, y, 4, 4, '#a8a8a8'); R(x, y + 1, 6, 2, '#a8a8a8'); return; }
      if (s.level === 0) { R(x + 1, y, 4, 4, '#f8e858'); R(x, y + 1, 6, 2, '#f8e858'); R(x + 2, y + 1, 2, 2, '#fcfcfc'); glow(x + 3, y + 2, 6, '#f8d800', 0.4); }
      else if (s.level === 1) {
        const c = frameCount & 2 ? '#f8b800' : '#fcfcfc';
        R(x + 2, y, 6, 10, c); R(x, y + 2, 10, 6, c); R(x + 3, y + 3, 4, 4, '#fcfcfc');
        glow(x + 5, y + 5, 12, '#f8b800', 0.7);
      } else {
        const c = ['#3cbcfc', '#00e8d8', '#fcfcfc'][(frameCount >> 1) % 3];
        const f = s.vx > 0 ? 1 : -1, hx = f > 0 ? x + 8 : x, tx = f > 0 ? x : x + 14;
        R(tx, y + 3, 8, 2, c); R(tx, y + 9, 8, 2, c); R(tx + (f > 0 ? 2 : 0), y + 6, 6, 2, c);
        R(hx + 2, y, 10, 14, c); R(hx, y + 2, 14, 10, c); R(hx + 3, y + 3, 8, 8, '#fcfcfc');
        glow(hx + 7, y + 7, 20, '#3cbcfc', 0.9);
      }
      return;
    case 'cutter': drawCutter(x, y, s.t * 0.5, '#f83800'); return;
    case 'gscissor':
      glow(x + 10, y + 22, 24, '#e0e0ec', 0.4);
      drawScissors(x + 10, y + 23, 0.1 + 0.32 * Math.abs(Math.sin(s.t * 0.22)));
      return;
    case 'tbeam':
      drawBolt(x, y + 4, x + s.w, y + 4, (s.t >> 1) + s.seed, '#f8f058', 2, 7);
      glow(x + s.w / 2, y + 4, 12, '#f8e030', 0.6);
      return;
    case 'pbolt':
      drawBolt(x + 8, y, x + 8, y + s.h, (frameCount >> 1) + s.seed, '#f8f058', 3, 16);
      glow(x + 8, y + s.h - 4, 22, '#f8e030', 0.9);
      if (s.life > 16) glow(x + 8, y + s.h / 2, 30, '#fcfcfc', 0.4);
      return;
    case 'storm': {
      const c = s.hue ? '#3cbcfc' : '#a8f0fc', f = s.vx > 0 ? 1 : -1;
      R(f > 0 ? x - 5 : x + 5, y + 1, 6, 2, 'rgba(60,188,252,0.45)');
      R(x + 1, y, 4, 4, c); R(x, y + 1, 6, 2, c); R(x + 2, y + 1, 2, 2, '#fcfcfc');
      if (s.lit) glow(x + 3, y + 2, 8, '#3cbcfc', 0.5);
      return;
    }
    case 'pwave':
      drawFlameColumn(x + 8, y + s.h, s.h, 8);
      glow(x + 8, y + s.h - 10, 24, '#f86000', 0.6);
      return;
    case 'bigshard':
      glow(x + 5, y + 5, 14, '#58d8f8', 0.7);
      R(x + 3, y - 1, 4, 12, '#0a0a16'); R(x - 1, y + 3, 12, 4, '#0a0a16');
      R(x + 4, y, 2, 10, '#a8e8fc'); R(x, y + 4, 10, 2, '#a8e8fc');
      R(x + 2, y + 2, 6, 6, '#a8e8fc'); R(x + 3, y + 3, 4, 4, '#d8f8fc'); R(x + 4, y + 4, 2, 2, '#fcfcfc');
      return;
    case 'hbeam': {
      const cy = y + s.h / 2, fl = (frameCount & 2) ? 2 : 0;
      ctx.globalAlpha = 0.5; R(x, cy - 18 + fl, s.w, 36 - fl * 2, '#3cbcfc'); ctx.globalAlpha = 1;
      R(x, cy - 12, s.w, 24, '#3cbcfc'); R(x, cy - 7, s.w, 14, '#a8f0fc'); R(x, cy - 3, s.w, 6, '#fcfcfc');
      for (let k = 0; k < 8; k++) R(x + ((k * 67 + frameCount * 11) % Math.max(1, s.w)), cy - 10 + (k * 7) % 20, 14, 1, '#fcfcfc');
      glow(s.dir > 0 ? x : x + s.w, cy, 30, '#3cbcfc', 0.9);
      return;
    }
    case 'tcutter':
      glow(x + 10, y + 10, 14, '#e0e0ec', 0.4);
      ctx.save(); ctx.translate(x + 10, y + 10); ctx.scale(1.4, 1.4); drawCutter(-7, -7, s.t * 0.6, '#f83800'); ctx.restore();
      return;
    case 'ppillar':
      if (s.delay > 0) { if (frameCount & 4) R(x, y + s.h - 3, s.w, 3, '#f8a800'); return; }
      drawFlameColumn(x + 10, y + s.h, s.h * Math.min(1, (36 - s.life) / 6), 10);
      return;
    case 'icespike': {
      if (s.delay > 0) return;
      const hh = Math.max(2, s.h * Math.min(1, (42 - s.life) / 5));
      for (let r = 0; r < hh; r += 2) { const w = Math.max(2, 12 * r / hh); R(x + 6 - w / 2, y + s.h - hh + r, w, 2, r < 4 ? '#fcfcfc' : '#a8e8fc'); }
      R(x + 5, y + s.h - hh + 4, 1, hh - 6, '#e0f8fc');
      glow(x + 6, y + s.h - hh / 2, 10, '#58d8f8', 0.5);
      return;
    }
    case 'tgod': return;
    case 'whirl': drawWhirl(x + 6, y + 14, 12, 14, s.t); return;
    case 'pcyclone': drawWhirl(x + 12, y + s.h, 24, s.h, s.t); glow(x + 12, y + s.h / 2, 20, '#78f8c8', 0.35); return;
    case 'hurricane':
      if (s.delay > 0) return;
      drawWhirl(x + 28, y + s.h, 56, s.h, s.t); ctx.globalAlpha = 0.18; R(x, y, s.w, s.h, '#e8fcf4'); ctx.globalAlpha = 1;
      return;
    case 'meteor':
      for (let k = 4; k >= 1; k--) circle(x + 20, y + 20 - k * 11, 14 - k * 2.5, k & 1 ? '#f8a800' : '#f83800');
      glow(x + 20, y + 20, 40, '#f86000', 0.8);
      circle(x + 20, y + 20, 20, '#0a0a16'); circle(x + 20, y + 20, 19, '#7a5a3a'); circle(x + 15, y + 15, 8, '#9a7a5a'); circle(x + 27, y + 26, 4, '#5a3a2a');
      return;
    case 'pquake': drawRock(x, y + 4, 16); return;
    case 'bigrock': drawRock(x, y, 22); glow(x + 11, y + 11, 18, '#e8b868', 0.3); return;
    case 'fireball':
      glow(x + 6, y + 5, 14, '#f86000', 0.9);
      circle(x + 6, y + 5, 5, '#f87800'); circle(x + 6 + Math.sign(s.vx), y + 5, 3, '#f8d800'); circle(x + 7, y + 5, 1.5, '#fcfcfc');
      return;
    case 'flame': {
      const fl = frameCount & 2 ? 1 : 0;
      glow(x + 5, y + 5, 12, '#f86000', 0.8);
      circle(x + 5, y + 5, 5, '#f83800'); circle(x + 5, y + 4 - fl, 3, '#f8a800'); circle(x + 5, y + 4, 1.5, '#fcf8c0');
      return;
    }
    case 'shard':
      glow(x + 4, y + 3, 8, '#58d8f8', 0.6);
      R(x + 2, y, 4, 6, '#a8e8fc'); R(x, y + 2, 8, 2, '#a8e8fc'); R(x + 3, y + 1, 2, 2, '#fcfcfc');
      return;
    case 'rock': drawRock(x, y, 14); return;
    case 'frag': drawRock(x, y, 6); return;
  }
}

function drawEnemyShot(s) {
  const x = Math.round(s.x) - camX, y = Math.round(s.y) - camY;
  switch (s.kind) {
    case 'bcutter': drawCutter(x, y, -s.t * 0.5, '#c83010'); return;
    case 'wave':
      drawFlameColumn(x + 7, y + s.h, s.h, 6);
      return;
    case 'pwarn':
      if (frameCount & 4) { R(x, y + 4, s.w, 2, '#f8a800'); glow(x + s.w / 2, y + 4, 12, '#f86000', 0.6); }
      return;
    case 'bwarn':
      if (frameCount & 4) { R(x, y + 4, s.w, 2, '#f8f058'); glow(x + s.w / 2, y + 4, 12, '#f8e030', 0.6); R(x + s.w / 2 - 1, ROOM().ceil - camY, 2, 4, '#fcfcfc'); }
      return;
    case 'lbolt':
      drawBolt(x + 8, y, x + 8, y + s.h, (frameCount >> 1) + s.x, '#f8f058', 3, 18);
      glow(x + 8, y + s.h - 6, 22, '#f8e030', 0.9); glow(x + 8, y + 10, 14, '#f8e030', 0.5);
      return;
    case 'ebolt': {
      const cx = x + 7, cy = y + 4;
      drawBolt(cx - s.vx * 3, cy - s.vy * 3, cx + s.vx * 2, cy + s.vy * 2, (s.t >> 1) + s.vy * 10, '#f8f058', 2, 7);
      glow(cx, cy, 12, '#f8e030', 0.6);
      return;
    }
    case 'etornado': drawWhirl(x + 6, y + 14, 12, 14, s.t, '#a8c8b8'); return;
    case 'ecyclone': drawWhirl(x + 12, y + s.h, 24, s.h, s.t, '#a8c8b8'); return;
    case 'snowball':
      circle(x + 5, y + 5, 5, '#0a0a16'); circle(x + 5, y + 5, 4, '#f0f8ff'); R(x + 3, y + 3, 2, 2, '#ffffff'); R(x + 6, y + 7, 2, 1, '#a8c0d8');
      return;
    case 'eball':
      glow(x + 5, y + 5, 12, '#f8e030', 0.8);
      circle(x + 5, y + 5, 5, '#c8a800'); circle(x + 5, y + 5, 3, '#f8f058'); circle(x + 5, y + 5, 1.5, '#fcfcfc');
      if (frameCount & 2) { R(x - 2, y + 4, 3, 1, '#fcfcfc'); R(x + 9, y + 6, 3, 1, '#fcfcfc'); }
      return;
    case 'gspark':
      for (let i = 0; i < 3; i++) drawBolt(x + 2 + i * 4, y + s.h, x + 2 + i * 4 + ((frameCount + i) % 3 - 1) * 2, y + 2 + i * 3, frameCount + i * 7, '#f8f058', 1, 6);
      glow(x + 6, y + s.h - 4, 14, '#f8e030', 0.7);
      return;
    case 'pillar':
      drawFlameColumn(x + 10, y + s.h, s.h * Math.min(1, (40 - s.life + 4) / 8), 9);
      return;
    case 'fireball':
      glow(x + 6, y + 5, 14, '#f86000', 0.9);
      circle(x + 6, y + 5, 5, '#f83800'); circle(x + 6, y + 5, 3, '#f8d800');
      return;
    case 'ishard':
      glow(x + 4, y + 4, 8, '#58d8f8', 0.6);
      R(x + 2, y, 4, 8, '#58c8f8'); R(x, y + 2, 8, 4, '#58c8f8'); R(x + 3, y + 3, 2, 2, '#fcfcfc');
      return;
    case 'fallice':
      if (s.delay > 0) { if (frameCount & 4) { R(x + 3, y, 2, 6, '#fcfcfc'); R(x + 1, y + 2, 6, 2, '#fcfcfc'); } return; }
      drawIcicle(x, y + 2);
      return;
    case 'fallrock': case 'rock': {
      if (s.delay > 0) {
        const fy = groundBelow(s.x + s.w / 2, s.y + s.h) - camY;
        if (frameCount & 2) R(x, fy - 2, s.w, 2, 'rgba(0,0,0,0.5)');
        return;
      }
      drawRock(x, y, s.w);
      return;
    }
    case 'quake': case 'boulder': case 'frag': drawRock(x, y, s.w); return;
    default:
      R(x + 1, y, 4, 6, '#fcfcfc'); R(x, y + 1, 6, 4, '#fcfcfc'); R(x + 2, y + 2, 2, 2, '#f87858');
      glow(x + 3, y + 3, 6, '#f87858', 0.4);
  }
}

function drawPickup(k) {
  if (k.life < 90 && (frameCount & 4)) return;
  const x = Math.round(k.x) - camX, y = Math.round(k.y) - camY;
  if (k.kind === 'h') {
    sprite(x, y, 1, 8, [[1, 1, 6, 6, frameCount & 8 ? '#f8d800' : '#fcfcfc']], [[2, 2, 4, 4, '#f87800'], [3, 3, 1, 1, '#fcfcfc']]);
    glow(x + 4, y + 4, 8, '#f8d800', 0.4);
  } else if (k.kind === 'E') {
    sprite(x, y, 1, 14, [[1, 1, 12, 10, '#fcfcfc']], [[1, 3, 12, 6, frameCount & 8 ? '#f8d800' : '#f87800'], [3, 4, 8, 4, '#fcfc9c']]);
    glow(x + 7, y + 6, 12, '#f8d800', 0.5);
  } else {
    const pal = WEAPONS[player.weapon].pal;
    sprite(x, y, 1, 14, [[2, 1, 10, 10, pal.B]], [[5, 4, 6, 7, SKIN], [7, 5, 2, 3, '#fcfcfc'], [8, 6, 1, 2, '#000000'], [3, 2, 4, 2, pal.b]]);
  }
}

function drawPlayer() {
  const p = player;
  if (!alive(p)) return;
  const sx = Math.round(p.x) - camX, sy = Math.round(p.y) - camY;
  const wp = WEAPONS[p.weapon].pal;
  if (p.state === 'beam') { R(sx + 4, sy - 8, 6, 30, wp.b); R(sx + 6, sy - 8, 2, 30, '#fcfcfc'); glow(sx + 7, sy + 8, 14, wp.b, 0.6); return; }
  if (p.state === 'land' && p.anim < 6) { R(sx + 1, sy + 12, 12, 10, wp.b); R(sx + 3, sy + 14, 8, 6, '#fcfcfc'); glow(sx + 7, sy + 16, 14, wp.b, 0.6); return; }
  if (p.inv > 0 && p.state !== 'hurt' && (frameCount & 3) < 2) return;

  let pose = 'stand', fr = 0;
  if (p.state === 'slide' || p.h < 22) pose = 'slide';
  else if (p.state === 'climb') { pose = 'climb'; fr = (p.anim >> 3) & 1; }
  else if (p.state === 'hurt') pose = 'hurt';
  else if (!p.onGround) pose = 'jump';
  else if (Math.abs(p.vx) > 0.1) { pose = 'run'; fr = [0, 1, 2, 1][(p.anim >> 3) & 3]; }

  // special weapons charge in their own colour; the buster keeps the classic green -> blue
  const w = WEAPONS[p.weapon], special = p.weapon !== 'buster';
  const ultra = hasPart('ultra') && p.charge >= ULTRA_CHARGE;
  let pal = wp;
  if (p.state === 'hurt' && frameCount & 2) pal = PAL_FULL;
  else if (ultra) pal = [PAL_FULL, special ? w.full : PAL_MID, PAL_GOLD][(frameCount >> 1) % 3];
  else if (p.charge >= 75) pal = (frameCount >> 2) & 1 ? (special ? w.full : PAL_FULL) : wp;
  else if (p.charge >= 30) pal = (frameCount >> 3) & 1 ? (special ? w.full : PAL_MID) : wp;

  if (hasPart('jet') && pose !== 'slide') { // jetpack on the back, flaming while rising
    const bx = p.facing > 0 ? sx - 3 : sx + 9;
    R(bx, sy + 7, 6, 10, '#0a0a16'); R(bx + 1, sy + 8, 4, 8, '#8a8a9a'); R(bx + 1, sy + 8, 1, 8, '#c8c8d8');
    if (!p.onGround && p.vy < 0) { R(bx + 1, sy + 17, 4, 3 + (frameCount & 2), '#f8a800'); R(bx + 2, sy + 17, 2, 2, '#fcf8c0'); glow(bx + 3, sy + 19, 8, '#f86000', 0.6); }
  }
  drawRobot(sx + p.w / 2 - 12, sy + p.h - 24, p.facing, pose, fr, p.shootT > 0 && pose !== 'slide' && pose !== 'hurt', pal);
  if (hasPart('shield') && p.shieldCd) for (let i = 0; i < 2; i++) {
    const a = (p.shieldAng || 0) + i * Math.PI, ox = sx + p.w / 2 + Math.cos(a) * 24, oy = sy + p.h / 2 + Math.sin(a) * 24;
    if (p.shieldCd[i] > 0) { if (p.shieldCd[i] < 90 && (frameCount & 4)) circle(ox, oy, 2, '#78e8f8'); continue; } // about to come back
    glow(ox, oy, 12, '#3cbcfc', 0.6); circle(ox, oy, 5, '#0a0a16'); circle(ox, oy, 4, '#3cbcfc'); circle(ox - 1, oy - 1, 2, '#fcfcfc');
  }
  if (ultra) {
    glow(sx + p.w / 2, sy + p.h / 2, 32, '#f8d800', 0.45 + ((frameCount >> 1) & 1) * 0.25);
    for (let i = 0; i < 4; i++) { const a = frameCount * 0.25 + i * Math.PI / 2; R(sx + p.w / 2 + Math.cos(a) * 16 - 1, sy + p.h / 2 + Math.sin(a) * 16 - 1, 3, 3, '#fcfcfc'); }
  } else if (p.charge >= 30) {
    const col = special ? w.glow : p.charge >= 75 ? '#3cbcfc' : '#b8f818';
    glow(sx + p.w / 2, sy + p.h / 2, p.charge >= 75 ? 22 : 14, col, 0.35 + ((frameCount >> 2) & 1) * 0.2);
  }
}

function drawBoss() {
  const b = boss;
  if (!b) return;
  const def = BOSSES[b.type];
  const sx = Math.round(b.x) - camX, sy = Math.round(b.y) - camY;
  if (b.inv > 0 && b.state !== 'stagger' && (frameCount & 2)) return;
  let pose = 'stand', fr = 0;
  if (b.state === 'slide' && b.h < 24) pose = 'slide';
  else if (!b.onGround) pose = 'jump';
  else if (b.state === 'run' || (b.state === 'walk' && b.t < 30)) { pose = 'run'; fr = [0, 1, 2, 1][(b.anim >> 3) & 3]; }
  else if ((b.state === 'pillar' && b.t < 45) || (b.state === 'strike' && b.t < 42) || b.state === 'gust' || (b.state === 'rockrain' && b.t > 6 && b.t < 30)) pose = 'raise';
  let pal = def.pal;
  if (b.state === 'stagger' && (frameCount & 2)) pal = PAL_WHITE;
  else if (b.state === 'slide' && b.t < 14 && (frameCount & 2)) pal = PAL_WHITE;
  drawRobot(sx + b.w / 2 - 12, sy + b.h - 24, b.facing, pose, fr, b.arm > 0 && pose !== 'raise', pal, def.style, { blade: b.hasCutter });
  if (b.frozenT > 0) { ctx.globalAlpha = 0.55; R(sx - 3, sy - 3, b.w + 6, b.h + 6, '#a8e8fc'); ctx.globalAlpha = 1; R(sx + 1, sy + 2, 5, 1, '#fcfcfc'); R(sx + 1, sy + 3, 1, 4, '#fcfcfc'); }
  if (b.type === 'fire') glow(sx + b.w / 2, sy - 2, 16, '#f86000', 0.7);
  if (b.type === 'snow') glow(sx + b.w / 2, sy - 2, 8, '#58e8f8', 0.5);
  if (b.type === 'wind' && b.state === 'gust') { // the gale she whips up, blowing across the room
    for (let i = 0; i < 26; i++) { const k = ((frameCount * 7 + i * 61) % (VW + 40)) - 20; R(b.facing > 0 ? k : VW - k, 30 + (i * 37) % 150, 10 + (i % 3) * 6, 1, 'rgba(232,252,244,0.75)'); }
  }
  if (b.type === 'elec') glow(sx + b.w / 2, sy - 6, 12, '#f8f058', 0.5 + ((frameCount >> 2) & 1) * 0.2);
  if (game.time - b.weakAt < 40) text('WEAK!', sx + b.w / 2, sy - 16 - ((game.time - b.weakAt) >> 2), '#f8d800', 1, 'center');
}

// boss weakness panel (bottom-left) for the whole boss fight; grey when that weapon is not owned yet
function drawWeakness() {
  const weak = BOSSES[boss.type].weak, w = WEAPONS[weak], owned = ownedWeapons().includes(weak);
  const label = 'LEMAH: ' + w.name + (owned ? '' : ' (BELUM ADA)');
  const y = VH - 22, using = player.weapon === weak;
  R(6, y - 3, textWidth(label) + 28, 17, 'rgba(5,5,20,0.75)');
  if (using) R(6, y - 3, textWidth(label) + 28, 1, w.pal.b);
  drawWeaponIcon(weak, 11, y);
  text(label, 26, y + 2, owned ? w.pal.b : '#888898');
}

function drawParticles() {
  for (const q of particles) {
    const x = q.x - camX, y = q.y - camY;
    switch (q.kind) {
      case 'boom': {
        const r = 3 + q.t * 0.6;
        glow(x, y, r * 2.5, '#f8a800', 1 - q.t / q.life);
        circle(x, y, r, q.t < 6 ? '#fcfcfc' : q.t < 12 ? '#f8b800' : '#f83800');
        if (q.t > 6) circle(x, y, r - 3, '#000000');
        break;
      }
      case 'spark': R(x - 4, y, 8, 1, '#fcfcfc'); R(x, y - 4, 1, 8, '#fcfcfc'); break;
      case 'orb': {
        const big = (q.t >> 2) & 1;
        glow(x, y, 14, q.col, 0.6);
        circle(x, y, big ? 6 : 4, q.col); circle(x, y, big ? 3 : 2, '#fcfcfc');
        break;
      }
      case 'dust':
        ctx.globalAlpha = 1 - q.t / q.life;
        circle(x, y, 2 + q.t * 0.15, '#d8d0c0');
        ctx.globalAlpha = 1;
        break;
      case 'debris': R(x, y, q.size, q.size, q.col); break;
      case 'ember':
        R(x, y, 2, 2, q.t < 8 ? '#f8d800' : '#f86000');
        glow(x + 1, y + 1, 6, '#f86000', 0.5 * (1 - q.t / q.life));
        break;
    }
  }
}

// HP can be fractional under ILMUKEBAL; a partly lost segment still shows as full.
// tough = gold frame with a shine travelling up the bar
function drawBar(x, y, val, col, tough = false) {
  R(x - 2, y - 2, 12, 60, '#0a0a16'); R(x - 1, y - 1, 10, 58, tough ? '#c89800' : '#3a3a50'); R(x, y, 8, 56, '#0a0a16');
  const shine = 27 - ((frameCount >> 1) % 40);
  for (let i = 0; i < 28; i++) {
    if (i >= val) continue;
    const yy = y + 56 - (i + 1) * 2, lit = tough && Math.abs(i - shine) < 2;
    R(x, yy, 8, 1, lit ? '#fcfcfc' : col); R(x + 2, yy, 4, 1, lit ? '#fcfcfc' : tough ? '#fcf0a0' : '#fcfcfc');
  }
}
function drawHUD() {
  if (game.tough) glow(16, 40, 30, '#f8b800', 0.3 + ((frameCount >> 3) & 1) * 0.15);
  drawBar(12, 12, player.hp, game.tough ? '#f8a800' : '#f8d878', game.tough);
  drawWeaponIcon(player.weapon, 11, 76);
  if (game.tough) { // ILMUKEBAL: X10 badge above the HP bar and the real HP (out of 280) below the weapon icon
    R(6, 0, 21, 10, '#c89800'); R(7, 1, 19, 8, '#0a0a16'); text('X10', 8, 2, '#f8d800');
    const hp = String(Math.ceil(player.hp * 10));
    R(8, 88, textWidth(hp) + 6, 11, 'rgba(5,5,20,0.75)'); text(hp, 11, 90, '#f8d800');
    R(8, 100, textWidth('/280') + 6, 11, 'rgba(5,5,20,0.75)'); text('/280', 11, 102, '#c89800');
  }
  if (game.bossLocked) drawBar(26, 12, boss ? (game.state === 'bossintro' ? game.bossBar : boss.hp) : 0, '#f87858');
  if (game.bossLocked && boss && boss.hp > 0) drawWeakness();
  text(String(game.score).padStart(7, '0'), VW - 8, 8, '#fcfcfc', 1, 'right');
  text('LIFE ' + Math.max(0, game.lives), VW - 8, 20, '#a8c8f8', 1, 'right');
  SHOP.filter(it => hasPart(it.key)).forEach((it, i) => drawPartIcon(it.key, VW - 22 - i * 16, 32));
  if (game.popup > 0) text(WEAPONS[player.weapon].name, VW / 2, 14, WEAPONS[player.weapon].pal.b, 1, 'center');
}

function renderWorld() {
  ctx.save();
  if (game.shake > 0) ctx.translate((game.shake & 1) ? 1 : -1, (game.shake & 2) ? 2 : -2);
  drawBackground(level.theme, camX, camY, BOSS_CAM_Y); // the backdrop sits as before at surface height and drops as the camera climbs
  if (level.theme === 'elec') drawStormSky();
  ctx.drawImage(levelCanvas, camX, camY, VW, VH, 0, 0, VW, VH);
  drawDynamicTiles();
  drawRoomFx();
  drawPlatsAndHazards();
  for (const k of pickups) drawPickup(k);
  for (const e of enemies) {
    if (e.flash > 0 && (frameCount & 1)) continue;
    const x = Math.round(e.x) - camX, y = Math.round(e.y) - camY;
    EN[e.type].draw(e, x, y);
    if (e.frozen > 0) {
      ctx.globalAlpha = 0.55; R(x - 1, y - 1, e.w + 2, e.h + 2, '#a8e8fc'); ctx.globalAlpha = 1;
      R(x + 2, y + 2, 3, 1, '#fcfcfc'); R(x + 2, y + 3, 1, 2, '#fcfcfc');
    }
  }
  drawBoss();
  if (game.state !== 'ready') drawPlayer();
  for (const s of pshots) drawPlayerShot(s);
  for (const s of eshots) drawEnemyShot(s);
  drawParticles();
  ctx.restore();
  drawAmbient();
  ctx.drawImage(VIGNETTE, 0, 0);
  if (game.flash > 0) { ctx.globalAlpha = game.flash / 12; R(0, 0, VW, VH, '#fcfcfc'); ctx.globalAlpha = 1; }
}

// ================= SCREENS =================
function drawLogo(y) {
  const x = Math.round(VW / 2 - textWidth('NEOBUSTER', 4) / 2);
  glow(VW / 2, y + 14, 90, '#3cbcfc', 0.25);
  text('NEO', x, y, '#3cbcfc', 4);
  text('BUSTER', x + textWidth('NEO', 4) + 4, y, '#fcfcfc', 4);
}
function drawTitle() {
  drawBackground('cut', frameCount * 0.6, 60, 60);
  ctx.fillStyle = 'rgba(5,5,20,0.45)'; ctx.fillRect(0, 0, VW, VH);
  drawLogo(30);
  ctx.save(); ctx.translate(VW / 2 - 36, 86); ctx.scale(3, 3);
  drawRobot(0, 0, 1, 'stand', 0, (frameCount >> 5) & 1, PAL_HERO);
  ctx.restore();
  glow(VW / 2, 120, 50, '#3cbcfc', 0.25);
  STAGE_ORDER.forEach((k, i) => {
    const def = BOSSES[k], left = i < 3, x = left ? 14 + i * 38 : VW - 50 - (5 - i) * 38;
    ctx.save(); ctx.translate(x, 116); ctx.scale(1.5, 1.5);
    drawRobot(0, 0, left ? 1 : -1, 'stand', 0, false, save.cleared[k] ? PAL_WHITE : def.pal, def.style);
    ctx.restore();
  });
  if (save.snap) {
    ['CONTINUE', 'NEW GAME'].forEach((o, i) => {
      const sel = game.menu === i;
      text((sel ? '>' : ' ') + o, VW / 2 + (i ? 50 : -50), 168, sel ? '#f8d800' : '#686878', 1, 'center');
    });
  } else if ((frameCount >> 4) & 1) text('PRESS ENTER', VW / 2, 168, '#f8d800', 1, 'center');
  text('ARROWS MOVE  Z JUMP  X SHOOT  C SLIDE', VW / 2, 186, '#a8a8b8', 1, 'center');
  text('HOLD X CHARGE  Q/E WEAPON  ENTER PAUSE  M MUTE', VW / 2, 198, '#a8a8b8', 1, 'center');
  if (Object.keys(save.cleared).length || save.snap) text('R: RESET PROGRESS', VW / 2, 212, '#686878', 1, 'center');
  drawVersion();
}
function drawVersion() { text('V' + VERSION, VW - 4, VH - 10, '#7a7a90', 1, 'right'); }

function drawPortrait(k, x, y, s, pal) {
  const def = BOSSES[k];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  drawRobot(0, 0, 1, 'stand', 0, false, pal || def.pal, def.style);
  ctx.restore();
}

// stage select grid: [column, row]; three panels per row
const SEL_POS = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]];
const PW = 116, PH = 70, SEL_X0 = (VW - (3 * PW + 16)) / 2;
function drawSelect() {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#0a0a2a'); g.addColorStop(1, '#1a1040');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  for (let x = -(frameCount % 16); x < VW; x += 16) R(x, 0, 1, VH, 'rgba(80,100,200,0.12)');
  for (let y = -(frameCount % 16); y < VH; y += 16) R(0, y, VW, 1, 'rgba(80,100,200,0.12)');
  text('STAGE SELECT', VW / 2, 10, '#fcfcfc', 2, 'center');
  text('POIN ' + save.points, VW - 10, 14, '#f8d800', 1, 'right');
  STAGE_ORDER.forEach((k, i) => {
    const px = SEL_X0 + SEL_POS[i][0] * (PW + 8), py = 32 + SEL_POS[i][1] * (PH + 8), st = STAGES[k], cleared = save.cleared[k];
    R(px - 2, py - 2, PW + 4, PH + 4, '#0a0a16');
    const pg = ctx.createLinearGradient(px, py, px + PW, py + PH);
    pg.addColorStop(0, shade(st.color, -0.55)); pg.addColorStop(1, shade(st.color, -0.85));
    ctx.fillStyle = pg; ctx.fillRect(px, py, PW, PH);
    R(px, py, PW, 1, shade(st.color, -0.2));
    drawPortrait(k, px + 4, py + 13, 1.5, cleared ? PAL_WHITE : null);
    text(st.name, px + 44, py + 16, cleared ? '#888898' : '#fcfcfc');
    drawWeaponIcon(k, px + 44, py + 30);
    text(WEAPONS[k].short, px + 58, py + 32, cleared ? '#686878' : '#a8a8b8');
    text(st.title, px + PW / 2, py + 56, cleared ? '#686878' : st.color, 1, 'center');
    if (cleared) text('CLEAR', px + PW - 4, py + 4, '#f8d800', 1, 'right');
    if (game.sel === i && (frameCount >> 3) & 1) {
      ctx.strokeStyle = '#f8d800'; ctx.lineWidth = 2; ctx.strokeRect(px - 1, py - 1, PW + 2, PH + 2);
    }
  });
  const ow = ownedWeapons();
  ow.forEach((w, i) => drawWeaponIcon(w, 14 + i * 14, 210));
  text('ENTER START  X SHOP  C KELEMAHAN', VW - 12, 211, '#a8a8b8', 1, 'right');
}

// 14x14 icons for the shop parts
function drawPartIcon(key, x, y) {
  switch (key) {
    case 'boots': sprite(x, y, 1, 14, [[3, 1, 5, 8, '#5a6a8a'], [3, 8, 10, 4, '#3a4a6a']], [[3, 12, 10, 1, '#c8c8d0'], [4, 2, 3, 1, '#8a9aba'], [5, 9, 7, 1, '#6a7a9a']]); break;
    case 'armor': sprite(x, y, 1, 14, [[1, 1, 12, 4, '#c83010'], [3, 4, 8, 9, '#c83010']], [[5, 5, 4, 5, '#f8a800'], [6, 6, 2, 3, '#fcf8c0'], [2, 2, 3, 1, '#f86040']]); break;
    case 'jet': sprite(x, y, 1, 14, [[2, 1, 4, 10, '#8a8a9a'], [8, 1, 4, 10, '#8a8a9a']], [[3, 11, 2, 3, '#f8a800'], [9, 11, 2, 3, '#f8a800'], [3, 2, 1, 6, '#c8c8d8'], [9, 2, 1, 6, '#c8c8d8']]); break;
    case 'core': sprite(x, y, 1, 14, [[4, 1, 6, 12, '#2878d8'], [1, 4, 12, 6, '#2878d8']], [[5, 5, 4, 4, '#a8f0fc'], [6, 6, 2, 2, '#fcfcfc']]); break;
    case 'super': sprite(x, y, 1, 14, [[0, 4, 9, 6, '#3cbcfc']], [[2, 5, 4, 3, '#fcfcfc'], [11, 1, 2, 7, '#f8d800'], [9, 3, 6, 2, '#f8d800']]); break;
    case 'shield': sprite(x, y, 1, 14, [[1, 5, 4, 4, '#3cbcfc'], [9, 5, 4, 4, '#3cbcfc']], [[2, 6, 2, 2, '#fcfcfc'], [10, 6, 2, 2, '#fcfcfc'], [5, 2, 4, 1, '#a8f0fc'], [5, 11, 4, 1, '#a8f0fc'], [6, 6, 2, 2, '#686878']]); break;
    case 'omega': sprite(x, y, 1, 14, [[2, 1, 10, 9, '#c83cf8'], [1, 9, 4, 4, '#c83cf8'], [9, 9, 4, 4, '#c83cf8']], [[4, 3, 6, 6, '#1a0a2a'], [5, 4, 4, 4, '#f8a8fc'], [6, 5, 2, 2, '#fcfcfc']]); break;
    case 'ultra': sprite(x, y, 1, 14, [[5, 0, 4, 14, '#f8b800'], [0, 5, 14, 4, '#f8b800'], [3, 3, 8, 8, '#f8d800']], [[5, 5, 4, 4, '#fcfcfc']]); break;
  }
}

// strategy screen: what each boss drops and what hurts it, plus the order that always uses a weakness
function weakChain() {
  const beats = {}; // weapon -> the boss it is the weakness of
  for (const k of STAGE_ORDER) beats[BOSSES[k].weak] = k;
  const order = [STAGE_ORDER[0]];
  while (order.length < STAGE_ORDER.length) { const next = beats[BOSSES[order[order.length - 1]].weapon]; if (!next || order.includes(next)) break; order.push(next); }
  return order;
}
function drawWeakChart() {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#2a0a1a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  text('KELEMAHAN BOSS', VW / 2, 6, '#fcfcfc', 2, 'center');
  text('BOSS', 40, 26, '#8888a0'); text('SENJATA DIDAPAT', 142, 26, '#8888a0'); text('LEMAH TERHADAP', 262, 26, '#8888a0');
  const owned = ownedWeapons();
  STAGE_ORDER.forEach((k, i) => {
    const def = BOSSES[k], y = 38 + i * 17, weak = WEAPONS[def.weak], have = owned.includes(def.weak);
    R(12, y - 3, VW - 24, 15, i & 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)');
    ctx.save(); ctx.translate(16, y - 3); ctx.scale(0.55, 0.55); drawRobot(0, 0, 1, 'stand', 0, false, save.cleared[k] ? PAL_WHITE : def.pal, def.style); ctx.restore();
    text(def.name, 40, y, save.cleared[k] ? '#888898' : def.pal.b);
    drawWeaponIcon(k, 142, y - 2); text(WEAPONS[k].short, 156, y, '#a8a8b8');
    drawWeaponIcon(def.weak, 262, y - 2); text(weak.short, 276, y, have ? weak.pal.b : '#686878');
    text(have ? 'ADA' : '-', VW - 18, y, have ? '#b8f818' : '#686878', 1, 'right');
  });
  // the weakness chain: beating each boss gives the weapon the next one is weak to
  const order = weakChain(), x0 = (VW - order.length * 52 + 20) / 2;
  text('URUTAN SARAN: SENJATA TIAP BOSS = KELEMAHAN BERIKUTNYA', VW / 2, 146, '#f8d800', 1, 'center');
  order.forEach((k, i) => {
    const x = x0 + i * 52;
    ctx.save(); ctx.translate(x, 158); drawRobot(0, 0, 1, 'stand', 0, false, save.cleared[k] ? PAL_WHITE : BOSSES[k].pal, BOSSES[k].style); ctx.restore();
    if (i < order.length - 1) { text('>', x + 32, 168, '#f8d800'); drawWeaponIcon(k, x + 30, 182); }
  });
  text('MULAI DARI BOSS MANA SAJA, LALU IKUTI PANAHNYA', VW / 2, 198, '#8888a0', 1, 'center');
  text('C / X / ENTER KEMBALI', VW / 2, 211, '#686878', 1, 'center');
}

function drawShop() {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#20103a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  for (let x = -(frameCount % 16); x < VW; x += 16) R(x, 0, 1, VH, 'rgba(80,100,200,0.1)');
  text('SHOP', VW / 2, 8, '#fcfcfc', 2, 'center');
  text('POIN ' + save.points, VW - 12, 12, '#f8d800', 1, 'right');
  SHOP.forEach((it, i) => {
    const y = 28 + i * 19, sel = game.shopSel === i, own = partState(it.key), locked = !own && it.needs && !save.parts[it.needs];
    R(12, y - 2, VW - 24, 18, sel ? 'rgba(60,188,252,0.22)' : 'rgba(255,255,255,0.04)');
    if (sel) R(12, y - 2, 2, 18, '#f8d800');
    drawPartIcon(it.key, 20, y);
    text(it.name, 42, y, locked ? '#686878' : sel ? '#f8d800' : '#fcfcfc');
    text(it.desc, 42, y + 9, locked ? '#4a4a58' : '#8888a0');
    const status = own ? STATE_TEXT[own] : locked ? 'TERKUNCI' : it.price + ' POIN';
    const col = own ? STATE_COL[own] : locked ? '#686878' : save.points >= it.price ? '#fcfcfc' : '#f87858';
    text(status, VW - 20, y, col, 1, 'right');
  });
  if (game.shopMsgT > 0) text(game.shopMsg, VW / 2, 186, game.shopOk ? '#b8f818' : '#f87858', 1, 'center');
  text('ATAS/BAWAH PILIH  ENTER BELI/ON-OFF  X KEMBALI', VW / 2, 200, '#8888a0', 1, 'center');
  drawVersion();
}

function drawIntro() {
  const k = game.introKey, st = STAGES[k], def = BOSSES[k], t = game.t;
  R(0, 0, VW, VH, '#05050f');
  const rnd = mulberry(5);
  for (let i = 0; i < 60; i++) {
    const y = rnd() * VH | 0, sp = 2 + rnd() * 6, x = VW - ((rnd() * VW + t * sp) % (VW + 40));
    R(x, y, 6 + sp * 2, 1, rnd() < 0.5 ? '#3a3a6a' : '#6a6aa0');
  }
  const bh = Math.min(96, t * 4);
  const g = ctx.createLinearGradient(0, VH / 2 - bh / 2, 0, VH / 2 + bh / 2);
  g.addColorStop(0, shade(st.color, -0.7)); g.addColorStop(0.5, shade(st.color, -0.35)); g.addColorStop(1, shade(st.color, -0.7));
  ctx.fillStyle = g; ctx.fillRect(0, VH / 2 - bh / 2, VW, bh);
  if (t > 16) {
    const bx = Math.min(56, -80 + (t - 16) * 6);
    glow(bx + 36, VH / 2, 50, st.color, 0.35);
    ctx.save(); ctx.translate(bx, VH / 2 - 40); ctx.scale(3, 3);
    drawRobot(0, 0, 1, t > 60 && t < 90 ? 'raise' : 'stand', 0, false, def.pal, def.style);
    ctx.restore();
  }
  if (t > 50) {
    const n = Math.min(def.name.length, (t - 50) >> 2);
    text(def.name.slice(0, n), 150, VH / 2 - 18, '#fcfcfc', 3);
    if (t > 50 + def.name.length * 4 + 10) text(st.title, 150, VH / 2 + 14, st.color, 1);
  }
}

function drawWeaponGet() {
  const t = game.t, w = WEAPONS[game.stage];
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#08103a'); g.addColorStop(1, '#203070');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  for (let x = -((t * 2) % 32); x < VW + VH; x += 32) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 16, 0); ctx.lineTo(x + 16 - VH, VH); ctx.lineTo(x - VH, VH); ctx.fill();
  }
  text('WEAPON GET!', VW / 2, 18, '#f8d800', 2, 'center');
  glow(70, 110, 50, w.pal.b, 0.35);
  ctx.save(); ctx.translate(34, 70); ctx.scale(3, 3);
  drawRobot(0, 0, 1, 'stand', 0, (t >> 4) % 3 === 0, w.pal);
  ctx.restore();
  // demo projectile
  const px = 110 + (t * 3) % 260, py = 110;
  const save_ = [camX, camY];
  camX = 0; camY = 0;
  const demo = { cut: { kind: 'cutter', t }, fire: { kind: 'fireball', vx: 1 }, elec: { kind: 'tbeam', w: 24, h: 8, seed: 1 }, wind: { kind: 'whirl' }, snow: { kind: 'shard' }, earth: { kind: 'rock' } }[game.stage];
  drawPlayerShot(Object.assign({ x: px, y: py - 6, w: 12, h: 10, t, level: 0 }, demo));
  [camX, camY] = save_;
  text('YOU GOT', 150, 64, '#a8c8f8', 1);
  text(w.name, 150, 78, '#fcfcfc', 2);
  text(w.desc, 150, 140, w.pal.b, 1);
  text('SENJATA UNLIMITED - TIDAK HABIS', 150, 154, '#a8a8b8', 1);
  text('Q / E UNTUK GANTI SENJATA', 150, 168, '#a8a8b8', 1);
  text('TAHAN X: ' + w.charged, 150, 182, w.pal.b, 1);
  if (t > 60 && (frameCount >> 4) & 1) text('PRESS ENTER', VW / 2, 202, '#f8d800', 1, 'center');
}

function drawEnding() {
  drawBackground('earth', frameCount * 0.4, 0, 60);
  ctx.fillStyle = 'rgba(5,5,20,0.5)'; ctx.fillRect(0, 0, VW, VH);
  text('CONGRATULATIONS!', VW / 2, 18, '#f8d800', 2, 'center');
  text('SEMUA BOSS TELAH DIKALAHKAN', VW / 2, 40, '#fcfcfc', 1, 'center');
  ctx.save(); ctx.translate(VW / 2 - 36, 64); ctx.scale(3, 3);
  drawRobot(0, 0, 1, (frameCount >> 5) & 1 ? 'jump' : 'stand', 0, false, PAL_HERO);
  ctx.restore();
  STAGE_ORDER.forEach((k, i) => {
    const x = i < 3 ? 6 + i * 48 : VW - 54 - (5 - i) * 48;
    drawPortrait(k, x, 90, 2, PAL_WHITE);
    drawWeaponIcon(k, x + 19, 146);
  });
  text('SCORE ' + String(game.score).padStart(7, '0'), VW / 2, 172, '#fcfcfc', 1, 'center');
  text('THANKS FOR PLAYING!', VW / 2, 188, '#a8c8f8', 1, 'center');
  if (game.t > 90 && (frameCount >> 4) & 1) text('PRESS ENTER', VW / 2, 206, '#f8d800', 1, 'center');
}

const pauseColumns = () => [[...ownedWeapons(), 'exit'], SHOP.map(it => it.key).filter(k => save.parts[k])];
function drawPause() {
  ctx.fillStyle = 'rgba(5,5,20,0.78)'; ctx.fillRect(0, 0, VW, VH);
  text('PAUSE', VW / 2, 10, '#fcfcfc', 2, 'center');
  const [weps, tools] = pauseColumns();
  text('SENJATA', 24, 36, '#a8c8f8'); text('TOOLS', 206, 36, '#a8c8f8');
  R(196, 34, 1, 150, 'rgba(168,200,248,0.25)');
  weps.forEach((it, i) => {
    const y = 50 + i * 17, sel = game.pcol === 0 && game.sel === i;
    if (sel) R(18, y - 4, 172, 15, 'rgba(60,188,252,0.25)');
    if (it === 'exit') text('EXIT STAGE', 42, y, sel ? '#f8d800' : '#a8a8b8');
    else { drawWeaponIcon(it, 24, y - 2); text(WEAPONS[it].name, 42, y, sel ? '#f8d800' : it === player.weapon ? '#fcfcfc' : '#a8a8b8'); }
  });
  if (!tools.length) { text('BELUM ADA', 206, 52, '#686878'); text('BELI DI SHOP', 206, 64, '#686878'); }
  tools.forEach((k, i) => {
    const y = 50 + i * 17, sel = game.pcol === 1 && game.sel === i, st = partState(k), on = st === 'on', it = SHOP.find(s => s.key === k);
    if (sel) R(200, y - 4, 172, 15, 'rgba(60,188,252,0.25)');
    drawPartIcon(k, 204, y - 4);
    text(it.name.replace(' ANTI ', ' '), 222, y, sel ? '#f8d800' : on ? '#fcfcfc' : '#686878');
    text(STATE_TEXT[st], 366, y, STATE_COL[st], 1, 'right');
  });
  text('LIFE ' + game.lives + '   POIN ' + save.points, VW / 2, 192, '#a8c8f8', 1, 'center');
  text('ARAH PILIH  ENTER PAKAI SENJATA / ON-OFF TOOLS', VW / 2, 206, '#686878', 1, 'center');
  drawVersion();
}

function render() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, VW, VH);
  switch (game.state) {
    case 'title': return drawTitle();
    case 'select': return drawSelect();
    case 'shop': return drawShop();
    case 'weak': return drawWeakChart();
    case 'intro': return drawIntro();
    case 'weaponget': return drawWeaponGet();
    case 'ending': return drawEnding();
    case 'gameover':
      text('GAME OVER', VW / 2, 84, '#f83800', 3, 'center');
      text('SCORE ' + String(game.score).padStart(7, '0'), VW / 2, 124, '#fcfcfc', 1, 'center');
      if ((frameCount >> 4) & 1) text('PRESS ENTER', VW / 2, 150, '#a8a8b8', 1, 'center');
      return;
  }
  renderWorld();
  if (game.state !== 'ready') drawHUD();
  if (game.state === 'ready' && (game.t >> 3) & 1) text('READY', VW / 2, 100, '#fcfcfc', 2, 'center');
  if (game.state === 'bossintro' && boss && boss.state === 'pose') {
    const def = BOSSES[boss.type];
    text(def.name, VW / 2, 60, def.pal.b, 2, 'center');
    text(STAGES[boss.type].title, VW / 2, 80, '#fcfcfc', 1, 'center');
  }
  if (game.state === 'pause') drawPause();
  if (game.state === 'clear' && game.t > 100) text('STAGE CLEAR!', VW / 2, 90, '#f8d800', 2, 'center');
}

// ================= LOOP =================
// Logic runs at a fixed 60 steps/s. Rendering interpolates positions between the last two steps so motion
// stays smooth on 120/144Hz screens, and frame times are smoothed so timer jitter doesn't cause double steps.
let last = performance.now(), acc = 0, prevCamX = 0, prevCamYf = 0;
const STEP_MS = 1000 / 60;
const REFRESH = [1000 / 60, 1000 / 120, 1000 / 144, 1000 / 90, 1000 / 75, 1000 / 30];
const deltas = [];

function interpTargets() {
  const list = [player, ...enemies, ...pshots, ...eshots, ...pickups, ...particles, ...plats, ...hazards];
  if (boss) list.push(boss);
  return list;
}
function snapshot() {
  for (const e of interpTargets()) { e._px = e.x; e._py = e.y; }
  prevCamX = camX; prevCamYf = camYf;
  game.noLerp = false;
}
function renderInterpolated(a) {
  const ents = level ? interpTargets() : [];
  const saved = ents.map(e => [e.x, e.y]);
  const cx = camX, cy = camY;
  if (a < 1) {
    for (const e of ents) {
      if (e._px === undefined) continue;
      e.x = e._px + (e.x - e._px) * a;
      e.y = e._py + (e.y - e._py) * a;
    }
    // while following, derive the camera from the interpolated player instead of interpolating it separately:
    // rounding the two independently made the player wobble 1px on 120/144Hz screens
    camX = game.state === 'play' && !game.bossLocked ? followCamX(player) : Math.round(prevCamX + (camX - prevCamX) * a);
    camY = Math.round(prevCamYf + (camYf - prevCamYf) * a);
  }
  render();
  ents.forEach((e, i) => { e.x = saved[i][0]; e.y = saved[i][1]; });
  camX = cx; camY = cy;
}

function loop(now) {
  let d = now - last;
  last = now;
  if (d > 250) d = STEP_MS; // tab was hidden
  const near = REFRESH.reduce((a, b) => (Math.abs(d - b) < Math.abs(d - a) ? b : a));
  if (Math.abs(d - near) < 0.3) d = near;
  deltas.push(d);
  if (deltas.length > 4) deltas.shift();
  acc += deltas.reduce((s, v) => s + v, 0) / deltas.length;
  let n = 0;
  if (cheat.open) acc = 0; // the world stays frozen while a cheat code is typed
  while (acc >= STEP_MS - 0.5 && n < 4) {
    if (level) snapshot();
    step();
    acc -= STEP_MS; n++;
  }
  if (n === 4) acc = 0;
  renderInterpolated(game.noLerp || cheat.open ? 1 : clamp(acc / STEP_MS, 0, 1));
  drawCheat();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
