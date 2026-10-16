'use strict';
// Cheat box: hold P and O together, type a code, Enter to apply (Esc cancels). The game is frozen while it is open.

const cheat = { open: false, buf: '', msg: '', ok: true, until: 0 };
const chord = { KeyP: false, KeyO: false };

// each cheat returns [ok, message]
const CHEATS = {
  MAUKUAT() {
    if (!IN_STAGE.includes(game.state) || !alive(player)) return [false, 'HANYA BISA DI DALAM STAGE'];
    player.hp = 28;
    game.refill = 0;
    sfx.oneup();
    return [true, 'HP PENUH!'];
  },
  AWETMUDA() {
    game.lives = Math.min(99, game.lives + 1);
    sfx.oneup();
    return [true, 'LIFE +1  (LIFE ' + game.lives + ')'];
  },
  ILMUKEBAL() {
    // lasts until game over or back to the title
    const was = game.tough;
    game.tough = true;
    if (IN_STAGE.includes(game.state) && alive(player)) {
      player.hp = 28;
      game.refill = 0;
    }
    sfx.oneup();
    return [true, was ? 'ILMU KEBAL SUDAH AKTIF - HP PENUH!' : 'ILMU KEBAL! HP X10 + HP PENUH'];
  },
  INGATANKUAT() {
    saveSnapshot();
    sfx.confirm();
    return [true, 'PROGRESS TERSIMPAN - PILIH CONTINUE DI TITLE'];
  },
};

function releaseGameKeys() {
  for (const k in kHeld) kHeld[k] = false;
}
function closeCheat() {
  cheat.open = false;
  releaseGameKeys();
}
function submitCheat() {
  const code = cheat.buf,
    fn = CHEATS[code];
  closeCheat();
  if (!code) return;
  const [ok, msg] = !fn ? [false, 'KODE SALAH'] : !IN_GAME.includes(game.state) ? [false, 'MULAI GAME DULU'] : fn();
  if (!ok) sfx.deflect();
  Object.assign(cheat, { ok, msg, until: performance.now() + 2500 });
}

// capture phase on window runs before the game's own key handler, so typing never reaches the game
addEventListener(
  'keydown',
  e => {
    if (e.code in chord) chord[e.code] = true;
    if (cheat.open) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.repeat) return;
      if (e.key === 'Enter') submitCheat();
      else if (e.key === 'Escape') closeCheat();
      else if (e.key === 'Backspace') cheat.buf = cheat.buf.slice(0, -1);
      else if (/^[a-z0-9]$/i.test(e.key) && cheat.buf.length < 16) cheat.buf += e.key.toUpperCase();
      return;
    }
    if (chord.KeyP && chord.KeyO) {
      e.preventDefault();
      e.stopImmediatePropagation();
      ensureAudio();
      cheat.open = true;
      cheat.buf = '';
      releaseGameKeys();
      sfx.pause();
    }
  },
  true,
);
addEventListener(
  'keyup',
  e => {
    if (e.code in chord) chord[e.code] = false;
  },
  true,
);
addEventListener('blur', () => {
  chord.KeyP = chord.KeyO = false;
});

function drawCheat() {
  if (cheat.open) {
    ctx.fillStyle = 'rgba(5,5,20,0.6)';
    ctx.fillRect(0, 0, VW, VH);
    const w = 200,
      h = 64,
      x = (VW - w) / 2,
      y = 72;
    R(x - 2, y - 2, w + 4, h + 4, '#0a0a16');
    R(x, y, w, h, '#1a1a3a');
    R(x, y, w, 1, '#3cbcfc');
    text('CHEAT CODE', VW / 2, y + 8, '#3cbcfc', 1, 'center');
    R(x + 16, y + 22, w - 32, 16, '#05050f');
    R(x + 16, y + 37, w - 32, 1, '#3a3a60');
    text(cheat.buf, x + 22, y + 27, '#fcfcfc');
    if ((performance.now() >> 9) & 1) R(x + 22 + (cheat.buf ? textWidth(cheat.buf) + 2 : 0), y + 27, 5, 7, '#f8d800');
    text('ENTER OK   ESC BATAL', VW / 2, y + 48, '#686878', 1, 'center');
    drawVersion();
  }
  if (cheat.msg && performance.now() < cheat.until) {
    const w = textWidth(cheat.msg);
    R(VW / 2 - w / 2 - 5, 34, w + 10, 15, 'rgba(5,5,20,0.8)');
    text(cheat.msg, VW / 2, 38, cheat.ok ? '#b8f818' : '#f87858', 1, 'center');
  }
}
