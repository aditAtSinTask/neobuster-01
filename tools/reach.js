'use strict';
// Reachability test for the stages (see "Aturan wajib" in docs/MENAMBAH-KONTEN.md).
//
// How to use: open the game (index.html) in the browser, open the browser console, paste this whole file, then run
//   reachAll()          every stage of every continent, as a table
//   reachCheck('cut')   one stage (add true as a second argument to test with its sealed wall broken)
// Reload the page afterwards: the test starts stages to walk them. Your save (cleared bosses, armors) is kept.
//
// It finds every standing position the player can reach from the start with the game's own movement (walking, jumps of
// every height, falls, slides, ladders, updraft pads, moving platforms) and reports for each stage:
//   goal         the boss door can be reached
//   checkpoints  every checkpoint can be reached
//   armor        the secret room's armor: out of reach while its sealed wall stands, in reach once the wall is broken
// Timing is not modelled (energy blocks count as solid; presses, lasers and rising liquid are ignored), so play those
// parts to check them.

window.reachCheck = function (key, openSeals = false) {
  const keepArmors = save.armors;
  save.armors = {}; // every sealed wall standing, as on a first visit
  startStage(key);
  if (openSeals) for (const h of hazards) if (h.kind === 'seal') for (const [tx, ty] of h.cells) map[ty][tx] = h.under;
  // energy blocks are solid in turn (timing is not modelled); quicksand holds you long enough to jump out
  for (const e of level.ents) if (e.type === 'eblock') for (let i = 0; i < (e.w || 2); i++) map[e.y][e.x + i] = 'Y';
  for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) if (map[y][x] === 'Q') map[y][x] = '#';
  const W = 14,
    H = 22,
    LWpx = LW * TILE;
  // moving platforms, sampled along their path (circular ones at 16 points round the circle)
  const plats = level.ents
    .filter(e => e.type === 'plat')
    .map((d, id) => {
      const rs = [];
      if (d.r) {
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2;
          rs.push({ id, x: d.x * TILE + Math.cos(a) * d.r * TILE, y: d.y * TILE + Math.sin(a) * d.r * TILE, w: 32 });
        }
        return rs;
      }
      for (let k = 0; k <= 8; k++) {
        const u = k / 8;
        rs.push({ id, x: (d.x + (d.x1 - d.x) * u) * TILE, y: (d.y + (d.y1 - d.y) * u) * TILE, w: 32 });
      }
      return rs;
    });
  const platRects = plats.flat();
  const deadly = e => {
    if (e.y > LH * TILE) return true;
    const x0 = Math.floor(e.x / TILE),
      x1 = Math.floor((e.x + W - 1) / TILE),
      y0 = Math.floor(e.y / TILE),
      y1 = Math.floor((e.y + H) / TILE);
    for (let ty = y0; ty <= y1; ty++)
      for (let tx = x0; tx <= x1; tx++) {
        const t = tileAt(tx, ty);
        if (t === '^' || t === 'X') return true;
        if (t === '~' && e.y + H > ty * TILE + 4) return true;
      }
    return false;
  };
  // a jump or fall from (x, y): where it lands {x, y, plat}, an updraft launch {x, y, pad}, or null (death)
  function fly(x, y, vx, vy0, hold) {
    const e = { x, y, w: W, h: H };
    let vy = vy0;
    for (let t = 1; t < 600; t++) {
      if (vy0 < 0 && t > hold && vy < 0 && t > 6) vy = 0; // letting go of jump
      moveX(e, vx);
      const wet = inWater(e);
      vy = Math.min(vy + (wet ? 0.15 : 0.25), wet ? 2.6 : 7);
      const r = moveY(e, vy, true);
      let landed = r === 1,
        plat = -1;
      if (r === -1) vy = 0;
      if (!landed && vy >= 0)
        for (const pl of platRects)
          if (e.x + W > pl.x && e.x < pl.x + pl.w && e.y + H - vy <= pl.y + 1 && e.y + H >= pl.y) {
            e.y = pl.y - H;
            landed = true;
            plat = pl.id;
            break;
          }
      if (deadly(e)) return null;
      if (landed && plat < 0 && padUnder(e)) return { x: e.x, y: e.y, pad: true };
      if (landed) return { x: e.x, y: e.y, plat };
    }
    return null;
  }
  const seen = new Set(),
    queue = [],
    launches = new Set(),
    keyOf = (x, y) => Math.round(x / 2) * 2 + ',' + Math.round(y);
  const push = (x, y, plat = -1, pad = false) => {
    if (x < 0 || x > LWpx - W) return;
    if (pad) {
      // an updraft launch: the player can steer either way (or not at all) while rising
      const k = Math.round(x / 2) + ',' + Math.round(y);
      if (launches.has(k)) return;
      launches.add(k);
      for (const vx of [-1.4, 0, 1.4]) {
        const l = fly(x, y, vx, -8, 999);
        if (l) push(l.x, l.y, l.plat, l.pad);
      }
      return;
    }
    const k = keyOf(x, y);
    if (seen.has(k)) return;
    seen.add(k);
    queue.push({ x: Math.round(x / 2) * 2, y: Math.round(y) });
    // riding a platform: every point of its path
    if (plat >= 0)
      for (const pl of plats[plat]) {
        const k2 = keyOf(pl.x + 9, pl.y - H);
        if (!seen.has(k2)) {
          seen.add(k2);
          queue.push({ x: pl.x + 9, y: pl.y - H });
        }
      }
  };
  const st = level.start;
  push(st.x * TILE + 1, groundBelow(st.x * TILE + 8, st.y * TILE) - H);
  let goal = false;
  const cps = level.cps.map(() => false);
  while (queue.length) {
    const s = queue.pop();
    if (s.x + W >= level.doorCol * TILE - 1 && Math.abs(s.y + H - FLOOR * TILE) < 1) goal = true;
    level.cps.forEach((c, i) => {
      if (s.x > c.x * TILE && Math.abs(s.y + H - (c.y + 1) * TILE) < 48) cps[i] = true;
    });
    // walk a few pixels: stay on the ground, or walk off an edge and fall
    for (const vx of [-1.4, 1.4]) {
      const e = { x: s.x, y: s.y, w: W, h: H };
      let fell = false;
      for (let t = 0; t < 6; t++) {
        moveX(e, vx);
        const probe = { x: e.x, y: e.y, w: W, h: H },
          r = moveY(probe, 1, true);
        if (r === 1 && padUnder(probe)) {
          fell = 'pad';
          break;
        }
        const onPlat = platRects.some(pl => e.x + W > pl.x && e.x < pl.x + pl.w && Math.abs(e.y + H - pl.y) < 1);
        if (r !== 1 && !onPlat) {
          fell = true;
          break;
        }
      }
      if (deadly(e)) continue;
      if (fell === 'pad') push(e.x, e.y, -1, true);
      else if (!fell) push(e.x, e.y);
      else
        for (const v2 of [vx, 0]) {
          const l = fly(e.x, e.y, v2, 0, 0);
          if (l) push(l.x, l.y, l.plat, l.pad);
        }
    }
    // jumps of every height, straight up or either way
    for (const vx of [-1.4, 0, 1.4])
      for (const hold of [7, 11, 16, 99]) {
        const l = fly(s.x, s.y, vx, -4.9, hold);
        if (l) push(l.x, l.y, l.plat, l.pad);
      }
    // slides: low (12 px) at 2.6 px a frame for 26 frames, longer under a low ceiling; stand up where there is room
    for (const vx of [-2.6, 2.6]) {
      const e = { x: s.x, y: s.y + 10, w: W, h: 12 };
      let ok = true;
      for (let t = 0; t < 200; t++) {
        const wall = moveX(e, vx);
        if (moveY(e, 1, true) !== 1 || deadly(Object.assign({}, e, { y: e.y - 10, h: 22 }))) {
          ok = false; // slid off an edge (the walk covers falling) or into something deadly
          break;
        }
        const room = ![e.x, e.x + W - 1].some(x => solidPx(x, e.y - 10) || solidPx(x, e.y - 1));
        if ((t >= 26 || wall) && room) break;
        if (wall && !room) {
          ok = false;
          break;
        }
      }
      if (ok) push(e.x, e.y - 10);
    }
    // ladders: up and down the ladder the player stands at, and letting go or jumping off it on the way
    const tx = Math.floor((s.x + W / 2) / TILE),
      rows = [];
    for (let ty = Math.floor((s.y + 4) / TILE); ty <= Math.floor((s.y + H) / TILE); ty++)
      if (isLadder(tx, ty)) rows.push(ty);
    if (rows.length) {
      let top = Math.min(...rows),
        bot = Math.max(...rows);
      while (isLadder(tx, top - 1)) top--;
      while (isLadder(tx, bot + 1)) bot++;
      const lx = tx * TILE + 8 - W / 2;
      push(lx, top * TILE - H);
      const l = fly(lx, (bot + 1) * TILE - H - 1, 0, 0, 0);
      if (l) push(l.x, l.y, l.plat, l.pad);
      for (let ty = top; ty <= bot; ty += 2)
        for (const vx of [-1.4, 1.4]) {
          const l2 = fly(lx, ty * TILE, vx, 0, 0);
          if (l2) push(l2.x, l2.y, l2.plat, l2.pad);
        }
    }
  }
  // the armor (it floats a little above the floor of its room)
  const ar = level.ents.find(e => e.type === 'armor');
  let armor = null;
  if (ar) {
    const ax = ar.x * TILE,
      ay = ar.y * TILE - 2;
    armor = [...seen].some(k => {
      const [x, y] = k.split(',').map(Number);
      return x + W > ax && x < ax + 16 && y + H > ay && y < ay + 16;
    });
  }
  save.armors = keepArmors;
  return { key, goal, cps, armor };
};

window.reachAll = function () {
  const rows = STAGE_ORDER.map(key => {
    const closed = reachCheck(key),
      open = reachCheck(key, true);
    return {
      stage: key,
      goal: closed.goal ? 'OK' : 'TIDAK TERJANGKAU',
      checkpoints: closed.cps.every(Boolean) ? 'OK' : closed.cps.map(Boolean).join(','),
      'armor (segel utuh)': closed.armor === null ? 'TIDAK ADA' : closed.armor ? 'BOCOR' : 'OK',
      'armor (segel hancur)': open.armor === null ? 'TIDAK ADA' : open.armor ? 'OK' : 'TIDAK TERJANGKAU',
    };
  });
  console.table(rows);
  const bad = rows.filter(r => Object.values(r).some(v => v !== 'OK' && v !== r.stage));
  console.log(bad.length ? 'ADA MASALAH: ' + bad.map(r => r.stage).join(', ') : 'SEMUA STAGE OK');
  return rows;
};
