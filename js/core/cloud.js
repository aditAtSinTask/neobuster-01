'use strict';
// Cloud save: progress kept on the Skuling save-json API, so it follows the player to any device. There is no sign-up:
// a username and a password are hashed together into the save's id, so the same pair always opens the same save. The
// password is never stored or sent, only the hash. Once logged in, every change to the save is uploaded a few seconds
// later; on login and when the game starts, the cloud copy and this device's copy are compared, and when both have
// changed the player picks which one to keep.
//
// API: POST /external/save-json/{id} creates the record (409 when it exists), PATCH updates it (404 when it does not,
// and it replaces the whole object), GET /external/save-json/{id}/progress reads it (404 when there is none); the
// record id is always "progress". Every request is signed with a time-based code instead of sending the token itself:
// x-external-uid (the token owner) and x-external-totp, the first 32 hex digits of HMAC-SHA512(token, the 30-second
// time step). The server accepts the current and the previous step, so the device clock must be right to within about
// 30 seconds; otherwise it answers 499 E_EXTTOTP_2, and the request is tried once more with the time taken from the
// server's Date header (exposed to the browser by Access-Control-Expose-Headers: Date), which later requests keep.

const CLOUD_API = 'https://openapi.skuling.id/external/save-json/',
  CLOUD_UID = 'f31288f4-b8c5-4085-9150-e530a491a4c5-1695143890623',
  CLOUD_TOKEN = 'ddcef541-9d17-4694-955f-05cd3faa2a61-1772010386563', // only signs the TOTP: never sent
  CLOUD_KEY = 'neobuster-cloud-v1', // this device's login: { id, name, syncedAt }
  CLOUD_DELAY = 8000; // ms between a change and its upload (changes in between go up together)

// SHA-256 of a string (as UTF-8), as 64 hex digits
function sha256Hex(str) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
    0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
    0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ];
  const bytes = new TextEncoder().encode(str),
    n = ((bytes.length + 72) >> 6) << 6, // the message, a 1 bit, zeros, and its length in bits: whole 64-byte blocks
    m = new Uint8Array(n),
    bits = bytes.length * 8;
  m.set(bytes);
  m[bytes.length] = 0x80;
  for (let i = 0; i < 4; i++) m[n - 1 - i] = (bits >>> (i * 8)) & 255;
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19],
    W = new Uint32Array(64),
    rotr = (x, r) => (x >>> r) | (x << (32 - r));
  for (let o = 0; o < n; o += 64) {
    for (let i = 0; i < 16; i++)
      W[i] = (m[o + i * 4] << 24) | (m[o + i * 4 + 1] << 16) | (m[o + i * 4 + 2] << 8) | m[o + i * 4 + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3),
        s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0,
        t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    [a, b, c, d, e, f, g, h].forEach((v, i) => (H[i] = (H[i] + v) | 0));
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
// the save's id: the username (any case) and the password hashed together, with the game's name in front so the same
// pair used in another game on this API opens a different save
const cloudIdOf = (name, pass) => sha256Hex('neobuster|' + name.trim().toLowerCase() + '|' + pass);

// SHA-512 of a byte array, as 64 bytes (64-bit words as BigInt). Its constants are the first 64 bits of the fractional
// parts of the cube roots of the first 80 primes, and of the square roots of the first 8 (FIPS 180-4), found here
// with integer roots instead of being listed.
const SHA512_CONST = (() => {
  const primes = [];
  for (let n = 2; primes.length < 80; n++) if (primes.every(p => n % p)) primes.push(n);
  // the floor of the k-th root of a BigInt (Newton's method from above)
  const iroot = (v, k) => {
    const K = BigInt(k);
    let x = 1n << BigInt(Math.ceil(v.toString(2).length / k) + 1);
    for (;;) {
      const y = ((K - 1n) * x + v / x ** (K - 1n)) / K;
      if (y >= x) return x;
      x = y;
    }
  };
  const M = (1n << 64n) - 1n;
  return {
    K: primes.map(p => iroot(BigInt(p) << 192n, 3) & M),
    H: primes.slice(0, 8).map(p => iroot(BigInt(p) << 128n, 2) & M),
  };
})();
function sha512(bytes) {
  const M = (1n << 64n) - 1n,
    rotr = (x, r) => ((x >> r) | (x << (64n - r))) & M,
    n = ((bytes.length + 144) >> 7) << 7, // the message, a 1 bit, zeros, and a 128-bit length: whole 128-byte blocks
    m = new Uint8Array(n),
    bits = bytes.length * 8;
  m.set(bytes);
  m[bytes.length] = 0x80;
  for (let i = 0; i < 4; i++) m[n - 1 - i] = (bits >>> (i * 8)) & 255;
  const H = SHA512_CONST.H.slice(),
    W = [];
  for (let o = 0; o < n; o += 128) {
    for (let i = 0; i < 16; i++) {
      let w = 0n;
      for (let j = 0; j < 8; j++) w = (w << 8n) | BigInt(m[o + i * 8 + j]);
      W[i] = w;
    }
    for (let i = 16; i < 80; i++) {
      const s0 = rotr(W[i - 15], 1n) ^ rotr(W[i - 15], 8n) ^ (W[i - 15] >> 7n),
        s1 = rotr(W[i - 2], 19n) ^ rotr(W[i - 2], 61n) ^ (W[i - 2] >> 6n);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) & M;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 80; i++) {
      const t1 =
          (h + (rotr(e, 14n) ^ rotr(e, 18n) ^ rotr(e, 41n)) + ((e & f) ^ (~e & M & g)) + SHA512_CONST.K[i] + W[i]) & M,
        t2 = ((rotr(a, 28n) ^ rotr(a, 34n) ^ rotr(a, 39n)) + ((a & b) ^ (a & c) ^ (b & c))) & M;
      h = g;
      g = f;
      f = e;
      e = (d + t1) & M;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) & M;
    }
    [a, b, c, d, e, f, g, h].forEach((v, i) => (H[i] = (H[i] + v) & M));
  }
  const out = new Uint8Array(64);
  H.forEach((v, i) => {
    for (let j = 0; j < 8; j++) out[i * 8 + j] = Number((v >> BigInt(56 - j * 8)) & 255n);
  });
  return out;
}
// HMAC-SHA512 of a message (bytes) with a key (bytes)
function hmacSha512(key, msg) {
  if (key.length > 128) key = sha512(key);
  const pad = c => {
    const p = new Uint8Array(128);
    p.set(key);
    return p.map(b => b ^ c);
  };
  const inner = new Uint8Array(128 + msg.length);
  inner.set(pad(0x36));
  inner.set(msg, 128);
  const outer = new Uint8Array(128 + 64);
  outer.set(pad(0x5c));
  outer.set(sha512(inner), 128);
  return sha512(outer);
}
// the request's x-external-totp: the 30-second time step (8 bytes, big-endian) signed with the token
let cloudClockOffset = 0; // ms to add to this device's clock, once the server has told the right time
function cloudTotp(now = Date.now() + cloudClockOffset) {
  const step = Math.floor(now / 30000),
    msg = new Uint8Array(8),
    view = new DataView(msg.buffer);
  view.setUint32(0, Math.floor(step / 2 ** 32));
  view.setUint32(4, step >>> 0);
  const sig = hmacSha512(new TextEncoder().encode(CLOUD_TOKEN), msg);
  return Array.from(sig, b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

// ---------- the API ----------
async function cloudRequest(method, path, body, retried = false) {
  let res;
  try {
    const headers = { 'x-external-uid': CLOUD_UID, 'x-external-totp': cloudTotp() };
    if (body) headers['Content-Type'] = 'application/json';
    res = await fetch(CLOUD_API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch (e) {
    throw new Error('TIDAK ADA KONEKSI');
  }
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* no body */
  }
  // a TOTP refused because this device's clock is off: take the time from the server's Date header and try once more
  const date = Date.parse(res.headers.get('date') || '');
  if (res.status === 499 && data && data.code === 'E_EXTTOTP_2' && !retried && date) {
    cloudClockOffset = date - Date.now();
    return cloudRequest(method, path, body, true);
  }
  return { status: res.status, data };
}
const cloudError = r =>
  new Error(
    r.data && r.data.code === 'E_EXTTOTP_2'
      ? 'JAM PERANGKAT TIDAK TEPAT'
      : r.status === 499
        ? 'AUTENTIKASI API DITOLAK'
        : r.status === 400
          ? 'ID SAVE TIDAK VALID'
          : 'SERVER ERROR ' + r.status,
  );
// the cloud copy { v, version, savedAt, save }, or null when there is none yet
async function cloudFetch(id) {
  const r = await cloudRequest('GET', id + '/progress');
  if (r.status === 404) return null;
  if (r.status !== 200 || !r.data || !r.data.payload) throw cloudError(r);
  return r.data.payload.object || null;
}
// writes the cloud copy: PATCH, or POST when there is none yet (and PATCH after all if POST finds one)
async function cloudStore(id, object) {
  const body = { id: 'progress', object };
  let r = await cloudRequest('PATCH', id, body);
  if (r.status === 404) {
    r = await cloudRequest('POST', id, body);
    if (r.status === 409) r = await cloudRequest('PATCH', id, body);
  }
  if (r.status !== 200 && r.status !== 201) throw cloudError(r);
}

// ---------- the login on this device, and syncing ----------
// state: 'idle' (logged out), 'saved', 'saving', 'error'; syncedAt: the savedAt of the cloud copy this device's save
// last matched
const cloud = { id: null, name: '', syncedAt: 0, state: 'idle', error: '', timer: 0, busy: false, conflict: null };
(() => {
  try {
    const s = JSON.parse(localStorage.getItem(CLOUD_KEY));
    if (s && s.id) Object.assign(cloud, { id: s.id, name: s.name || '', syncedAt: s.syncedAt || 0, state: 'saved' });
  } catch (e) {
    /* storage unavailable */
  }
})();
function cloudRemember() {
  try {
    if (cloud.id)
      localStorage.setItem(CLOUD_KEY, JSON.stringify({ id: cloud.id, name: cloud.name, syncedAt: cloud.syncedAt }));
    else localStorage.removeItem(CLOUD_KEY);
  } catch (e) {
    /* storage unavailable */
  }
}
// a copy of the save without the time of its last change, to compare two saves
const cloudBody = s => JSON.stringify(Object.assign({}, s, { updatedAt: undefined }));
const cloudHasProgress = s =>
  !!(
    Object.keys(s.cleared || {}).length ||
    s.points ||
    Object.keys(s.parts || {}).length ||
    Object.keys(s.armors || {}).length ||
    s.snap ||
    (s.train && s.train.wave) ||
    (s.stats && (s.stats.atk > 1 || s.stats.def > 1))
  );

// called by writeSave(): upload the save a few seconds after it changes
function cloudSaveChanged() {
  if (!cloud.id || cloud.conflict || cloud.timer) return;
  cloud.timer = setTimeout(cloudUpload, CLOUD_DELAY);
}
// what goes up: the whole save, with the game version and the time it was saved
const cloudObject = () => ({ v: 1, version: VERSION, savedAt: Date.now(), save: JSON.parse(JSON.stringify(save)) });
async function cloudUpload() {
  clearTimeout(cloud.timer);
  cloud.timer = 0;
  if (!cloud.id || cloud.conflict) return;
  if (cloud.busy) return cloudSaveChanged(); // one request at a time: try again after this one
  const id = cloud.id,
    object = cloudObject();
  cloud.busy = true;
  cloud.state = 'saving';
  try {
    await cloudStore(id, object);
    if (cloud.id !== id) return; // logged out meanwhile
    cloud.syncedAt = object.savedAt;
    cloud.state = 'saved';
    cloudRemember();
    if ((save.updatedAt || 0) > object.save.updatedAt) cloudSaveChanged(); // changed again while uploading
  } catch (e) {
    cloud.state = 'error';
    cloud.error = e.message;
    if (cloud.id === id && !cloud.timer) cloud.timer = setTimeout(cloudUpload, 30000); // try again later
  } finally {
    cloud.busy = false;
  }
}
// replaces this device's save with the cloud copy
function cloudApply(remote) {
  const s = normalizeSave(JSON.parse(JSON.stringify(remote.save || {})));
  for (const k of Object.keys(save)) delete save[k];
  Object.assign(save, s, { updatedAt: remote.savedAt || 0 });
  writeSave(true);
  cloud.syncedAt = remote.savedAt || 0;
  cloud.state = 'saved';
  cloudRemember();
  if (!ownedWeapons().includes(player.weapon)) player.weapon = 'buster';
}
function cloudLogout() {
  clearTimeout(cloud.timer);
  Object.assign(cloud, { id: null, name: '', syncedAt: 0, state: 'idle', error: '', timer: 0, conflict: null });
  cloudRemember();
}
// when the game starts while logged in: bring this device up to date with the cloud, or upload what changed here;
// when both changed since they last matched, cloud.conflict holds the cloud copy until the player picks one
async function cloudBoot() {
  if (!cloud.id) return;
  const id = cloud.id;
  try {
    const remote = await cloudFetch(id);
    if (cloud.id !== id) return;
    const localChanged = (save.updatedAt || 0) > cloud.syncedAt;
    if (!remote) cloudUpload();
    else if (cloudBody(remote.save) === cloudBody(save)) {
      cloud.syncedAt = remote.savedAt;
      cloud.state = 'saved';
      cloudRemember();
    } else if ((remote.savedAt || 0) > cloud.syncedAt) {
      if (localChanged) cloud.conflict = remote;
      else {
        cloudApply(remote);
        cloudUI.note = { text: 'PROGRESS DIPERBARUI DARI CLOUD', until: performance.now() + 5000 };
      }
    } else if (localChanged) cloudUpload();
  } catch (e) {
    cloud.state = 'error';
    cloud.error = e.message;
  }
}
// logging in: the cloud copy is loaded, or the player picks when it differs from this device's progress; with no save
// for this name and password yet it is a new account or a typo, so the password is asked again before one is made
async function cloudLogin(name, pass) {
  const id = cloudIdOf(name, pass);
  cloudUI.mode = 'busy';
  try {
    const remote = await cloudFetch(id);
    if (!remote) {
      Object.assign(cloudUI, { mode: 'new', pending: { id, name: name.trim().toUpperCase() }, pass2: '', msg: null });
      return;
    }
    Object.assign(cloud, { id, name: name.trim().toUpperCase(), syncedAt: 0, state: 'saving', error: '' });
    if (!cloudHasProgress(save) || cloudBody(remote.save) === cloudBody(save)) {
      cloudApply(remote);
      cloudUI.msg = ['PROGRESS DIMUAT DARI CLOUD', true];
    } else {
      cloud.conflict = remote;
      cloudUI.mode = 'pick';
      cloudUI.sel = 0;
      return;
    }
    cloudRemember();
    cloudOpenAccount();
  } catch (e) {
    cloud.id = null;
    cloud.state = 'idle';
    cloudUI.mode = 'form';
    cloudUI.msg = ['GAGAL MASUK: ' + e.message, false];
  }
}
// a new account: the password typed again must match, then this device's progress becomes its first save
async function cloudCreate() {
  const p = cloudUI.pending;
  if (cloudIdOf(p.name, cloudUI.pass2) !== p.id) {
    cloudUI.msg = ['PASSWORD TIDAK SAMA - KETIK ULANG, ATAU ESC UNTUK MENGULANG', false];
    cloudUI.pass2 = '';
    return;
  }
  cloudUI.mode = 'busy';
  cloudUI.pass2 = '';
  try {
    Object.assign(cloud, { id: p.id, name: p.name, syncedAt: 0, state: 'saving', error: '' });
    const object = cloudObject();
    await cloudStore(p.id, object);
    Object.assign(cloud, { syncedAt: object.savedAt, state: 'saved' });
    cloudRemember();
    cloudUI.msg = ['SAVE BARU DIBUAT DI CLOUD', true];
    cloudOpenAccount();
  } catch (e) {
    Object.assign(cloud, { id: null, name: '', state: 'idle' });
    cloudUI.mode = 'form';
    cloudUI.msg = ['GAGAL MEMBUAT SAVE: ' + e.message, false];
  }
}
// the player picked which copy to keep
async function cloudResolve(useCloud) {
  const remote = cloud.conflict;
  cloud.conflict = null;
  if (useCloud) {
    cloudApply(remote);
    cloudUI.msg = ['PROGRESS DIMUAT DARI CLOUD', true];
  } else {
    cloudRemember();
    cloudUpload();
    cloudUI.msg = ['PROGRESS PERANGKAT INI DISIMPAN KE CLOUD', true];
  }
  cloudOpenAccount();
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && cloud.timer) cloudUpload(); // leaving the page: upload now
});

// ---------- the CLOUD SAVE screen ----------
// modes: form (username and password), busy, new (no save yet: the password again), pick (cloud or this device),
// account (logged in)
const cloudUI = { mode: 'form', field: 0, name: '', pass: '', pass2: '', pending: null, sel: 0, msg: null };
Object.assign(cloudUI, { note: null, loadArm: false });
function openCloud() {
  game.state = 'cloud';
  game.t = 0;
  cloudUI.msg = null;
  if (cloud.conflict) {
    cloudUI.mode = 'pick';
    cloudUI.sel = 0;
  } else if (cloud.id) cloudOpenAccount();
  else Object.assign(cloudUI, { mode: 'form', field: 0, pass: '' });
  for (const k in kHeld) kHeld[k] = false;
}
function cloudOpenAccount() {
  cloudUI.mode = 'account';
  cloudUI.sel = 0;
  cloudUI.loadArm = false;
}
function cloudSubmit() {
  const name = cloudUI.name.trim();
  if (name.length < 3) cloudUI.msg = ['USERNAME MINIMAL 3 HURUF', false];
  else if (cloudUI.pass.length < 4) cloudUI.msg = ['PASSWORD MINIMAL 4 KARAKTER', false];
  else {
    cloudUI.msg = null;
    cloudLogin(name, cloudUI.pass);
    cloudUI.pass = '';
  }
}
// typing in the form: captured before the game (and the cheat box) see the keys
addEventListener(
  'keydown',
  e => {
    if (game.state !== 'cloud' || (cloudUI.mode !== 'form' && cloudUI.mode !== 'new')) return;
    e.stopImmediatePropagation();
    // typing through a phone's keyboard (the hidden text box of js/core/touch.js): the box takes the characters itself
    const box = e.target && e.target.id === 'nb-text';
    if (box && e.key !== 'Enter' && e.key !== 'Escape' && e.key !== 'Tab') return;
    e.preventDefault();
    if (box) setTimeout(() => touchTyping() && touchType()); // the box follows the field after Enter or Tab
    const k = e.key,
      printable = k.length === 1 && !e.ctrlKey && !e.metaKey && k >= ' ' && k <= '~';
    if (cloudUI.mode === 'new') {
      if (k === 'Escape') Object.assign(cloudUI, { mode: 'form', field: 1, pass: '', pass2: '', msg: null });
      else if (k === 'Enter' && !e.repeat) cloudCreate();
      else if (k === 'Backspace') cloudUI.pass2 = cloudUI.pass2.slice(0, -1);
      else if (printable && cloudUI.pass2.length < 32) cloudUI.pass2 += k;
      return;
    }
    if (k === 'Escape') {
      game.state = 'title';
      sfx.pause();
    } else if (k === 'Enter') {
      if (e.repeat) return;
      if (cloudUI.field === 0) cloudUI.field = 1;
      else cloudSubmit();
    } else if (k === 'Tab' || k === 'ArrowDown' || k === 'ArrowUp') cloudUI.field ^= 1;
    else if (k === 'Backspace') {
      if (cloudUI.field === 0) cloudUI.name = cloudUI.name.slice(0, -1);
      else cloudUI.pass = cloudUI.pass.slice(0, -1);
    } else if (printable) {
      if (cloudUI.field === 0 && /^[a-z0-9_.-]$/i.test(k) && cloudUI.name.length < 16) cloudUI.name += k;
      else if (cloudUI.field === 1 && cloudUI.pass.length < 32) cloudUI.pass += k;
    }
  },
  true,
);
// one step of the screen (the form takes its keys above)
function updateCloudScreen(go) {
  game.t++;
  const U = cloudUI;
  if (U.mode === 'form' || U.mode === 'new') {
    // the touch buttons and a gamepad: START goes on, BACK goes back, up and down pick the field
    const before = U.field;
    if (hit.start) {
      if (U.mode === 'new') cloudCreate();
      else if (U.field === 0) U.field = 1;
      else cloudSubmit();
    } else if (hit.back) {
      if (U.mode === 'new') Object.assign(U, { mode: 'form', field: 1, pass: '', pass2: '', msg: null });
      else {
        game.state = 'title';
        sfx.pause();
      }
    } else if (U.mode === 'form' && (hit.up || hit.down)) U.field ^= 1;
    if (U.field !== before && touchUI.text && document.activeElement === touchUI.text) touchType();
  } else if (U.mode === 'pick') {
    if (hit.left || hit.right || hit.up || hit.down) {
      U.sel ^= 1;
      sfx.select();
    }
    if (go) {
      sfx.confirm();
      cloudResolve(U.sel === 0);
    } else if (hit.back) {
      // neither: stop syncing, this device keeps its own progress
      cloudLogout();
      Object.assign(U, { mode: 'form', field: 0, msg: ['KELUAR AKUN - PROGRESS PERANGKAT INI TETAP', true] });
      sfx.pause();
    }
  } else if (U.mode === 'account') {
    if (hit.up || hit.down) {
      U.sel = (U.sel + (hit.down ? 1 : 2)) % 3;
      U.loadArm = false;
      sfx.select();
    }
    if (hit.back) {
      game.state = 'title';
      sfx.pause();
    } else if (go) {
      sfx.confirm();
      if (U.sel === 0) {
        cloudUpload();
        U.msg = ['MENYIMPAN KE CLOUD...', true];
      } else if (U.sel === 1 && !U.loadArm)
        U.loadArm = true; // asks once more: it replaces this device's progress
      else if (U.sel === 1) cloudLoadNow();
      else {
        cloudLogout();
        Object.assign(U, {
          mode: 'form',
          field: 0,
          pass: '',
          msg: ['KELUAR AKUN - PROGRESS PERANGKAT INI TETAP', true],
        });
      }
    }
  }
}
async function cloudLoadNow() {
  cloudUI.mode = 'busy';
  cloudUI.loadArm = false;
  try {
    const remote = await cloudFetch(cloud.id);
    if (remote) {
      cloudApply(remote);
      cloudUI.msg = ['PROGRESS DIMUAT DARI CLOUD', true];
    } else cloudUI.msg = ['BELUM ADA SAVE DI CLOUD', false];
  } catch (e) {
    cloudUI.msg = ['GAGAL MEMUAT: ' + e.message, false];
  }
  cloudOpenAccount();
}

// one line about the cloud for the title screen and the map: [text, colour], or null when logged out
function cloudStatusLine() {
  if (!cloud.id) return null;
  if (cloud.conflict) return ['CLOUD: ' + cloud.name + ' - PILIH PROGRESS DI CLOUD SAVE', '#f8d800'];
  if (cloud.state === 'saving' || cloud.timer) return ['CLOUD: ' + cloud.name + ' - MENYIMPAN...', '#f8d800'];
  if (cloud.state === 'error') return ['CLOUD: ' + cloud.name + ' - GAGAL: ' + cloud.error, '#f87858'];
  return ['CLOUD: ' + cloud.name + ' - TERSIMPAN', '#b8f818'];
}
const cloudTime = t => {
  if (!t) return '-';
  const d = new Date(t),
    p = v => String(v).padStart(2, '0');
  return p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
};
// a few lines about a save, for picking between two
const cloudSummary = s => [
  ['BOSS', Object.keys(s.cleared || {}).filter(k => STAGE_ORDER.includes(k)).length + '/' + STAGE_ORDER.length],
  ['POIN', fmtNum(s.points || 0)],
  ['ARMOR', String(Object.keys(s.armors || {}).length)],
  ['PART', String(Object.keys(s.parts || {}).length)],
  ['TRAINING', 'WAVE ' + ((s.train && s.train.wave) || 0)],
  ['LEVEL', 'ATK ' + ((s.stats && s.stats.atk) || 1) + ' DEF ' + ((s.stats && s.stats.def) || 1)],
];
// ---------- the account badge ----------
// the colour of a player's avatar, picked from their name
const CLOUD_AVATAR = ['#3cbcfc', '#f87858', '#58c878', '#f8b800', '#c878f8', '#38b8a8', '#f878b8', '#7898f8'];
const cloudAvatarColor = name =>
  CLOUD_AVATAR[[...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % CLOUD_AVATAR.length];
// what the badge shows: a short label, its colour, and the sign on the cloud icon
function cloudBadge() {
  if (cloud.conflict) return { label: 'PILIH SAVE', color: '#f8d800', sign: '?' };
  if (cloud.state === 'saving' || cloud.timer) return { label: 'MENYIMPAN', color: '#f8d800', sign: 'up' };
  if (cloud.state === 'error')
    return {
      label: /KONEKSI/.test(cloud.error) ? 'OFFLINE' : /JAM/.test(cloud.error) ? 'JAM SALAH' : 'GAGAL',
      color: '#f87858',
      sign: '!',
    };
  return { label: 'TERSIMPAN', color: '#b8f818', sign: 'ok' };
}
// a pixel cloud 13 x 9 (times s) with a sign on it: ok (a tick), up (an arrow going up), ! or ?
function drawCloudIcon(x, y, sign, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const body = sign === '!' ? '#a8acbc' : '#e8f0fc';
  for (const [c, d] of [
    ['#0a0a16', 1],
    [body, 0],
  ]) {
    circle(3.5, 5.5, 2.5 + d, c);
    circle(6.5, 4, 3.5 + d, c);
    circle(10, 5.5, 2.5 + d, c);
    R(3.5 - d, 5.5, 7 + 2 * d, 3 + d, c);
  }
  circle(5.5, 3, 1.2, '#ffffff');
  R(3, 7.5, 7.5, 1, sign === '!' ? '#8a8e9e' : '#b8c8e0');
  const P = (px, py, c) => R(px, py, 1, 1, c);
  if (sign === 'ok')
    [
      [8, 3],
      [7, 4],
      [4, 5],
      [6, 5],
      [5, 6],
    ].forEach(([px, py]) => P(px, py, '#209820'));
  else if (sign === 'up') {
    const dy = (frameCount >> 3) & 1;
    R(6, 3 + dy, 1, 4, '#1860c8');
    R(5, 4 + dy, 3, 1, '#1860c8');
    P(6, 2 + dy, '#1860c8');
  } else if (sign === '!') {
    R(6, 2, 1, 4, '#d82020');
    P(6, 7, '#d82020');
  } else if (sign === '?')
    [
      [5, 2],
      [6, 2],
      [7, 2],
      [8, 3],
      [7, 4],
      [6, 5],
      [6, 7],
    ].forEach(([px, py]) => P(px, py, '#b88800'));
  ctx.restore();
}
// a round avatar with the name's first letter, centred at (cx, cy)
function drawCloudAvatar(cx, cy, r, size = 1) {
  circle(cx, cy, r + 1, '#0a0a16');
  circle(cx, cy, r, cloudAvatarColor(cloud.name));
  circle(cx - r * 0.3, cy - r * 0.35, r * 0.4, 'rgba(255,255,255,0.22)');
  text(cloud.name[0] || '?', cx + 0.5, cy - 3.5 * size, '#fcfcfc', size, 'center');
}
// the account badge on the title screen and the map: avatar, name, and the cloud's state (right: x is its right edge)
function drawCloudBadge(x, y, right = false) {
  if (!cloud.id) return;
  const b = cloudBadge(),
    name = cloud.name.length > 10 ? cloud.name.slice(0, 9) + '.' : cloud.name,
    w = Math.max(textWidth(name), textWidth(b.label) + 15) + 24,
    h = 21,
    x0 = right ? x - w : x;
  R(x0, y, w, h, 'rgba(4,8,22,0.86)');
  R(x0, y, w, 1, '#2a3a6a');
  R(x0, y + h - 1, w, 1, '#2a3a6a');
  R(x0 + w - 1, y, 1, h, '#2a3a6a');
  R(x0, y, 2, h, b.color);
  drawCloudAvatar(x0 + 10, y + 10.5, 6);
  text(name, x0 + 20, y + 3, '#fcfcfc');
  drawCloudIcon(x0 + 19, y + 10.5, b.sign);
  text(b.label, x0 + 34, y + 12, b.color);
}
function drawCloudScreen() {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#0a1430');
  g.addColorStop(1, '#10203a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);
  for (let x = -(frameCount % 16); x < VW; x += 16) R(x, 0, 1, VH, 'rgba(80,140,220,0.08)');
  text('CLOUD SAVE', VW / 2 + 12, 8, '#fcfcfc', 2, 'center');
  drawCloudIcon(VW / 2 - 84, 6, null, 2);
  const U = cloudUI,
    blink = (frameCount >> 4) & 1;
  if (U.mode === 'form') {
    text('MASUK TANPA DAFTAR: USERNAME DAN PASSWORD YANG SAMA', VW / 2, 34, '#a8c8f8', 1, 'center');
    text('SELALU MEMBUKA SAVE YANG SAMA, DI PERANGKAT MANA PUN.', VW / 2, 46, '#a8c8f8', 1, 'center');
    [
      ['USERNAME', U.name],
      ['PASSWORD', '*'.repeat(U.pass.length)],
    ].forEach(([label, val], i) => {
      const y = 70 + i * 26,
        on = U.field === i;
      text(label, 70, y + 4, on ? '#f8d800' : '#8888a0');
      R(150, y, 164, 16, on ? '#f8d800' : '#3a3a60');
      R(151, y + 1, 162, 14, '#05050f');
      text(val, 156, y + 4, '#fcfcfc');
      if (on && blink) R(156 + (val ? textWidth(val) + 2 : 0), y + 4, 5, 7, '#f8d800');
    });
    text('PASSWORD TIDAK DISIMPAN DAN TIDAK DIKIRIM, HANYA HASH-NYA.', VW / 2, 130, '#686878', 1, 'center');
    text(
      touchUI.on ? 'KETUK KOLOM  START MASUK  BACK KEMBALI' : 'TAB/ATAS/BAWAH PINDAH KOLOM  ENTER MASUK  ESC KEMBALI',
      VW / 2,
      206,
      '#8888a0',
      1,
      'center',
    );
  } else if (U.mode === 'new') {
    text('BELUM ADA SAVE UNTUK USERNAME DAN PASSWORD INI.', VW / 2, 40, '#f8d800', 1, 'center');
    text('KALAU INI AKUN BARU, KETIK ULANG PASSWORD UNTUK MEMBUATNYA', VW / 2, 58, '#a8c8f8', 1, 'center');
    text('(PROGRESS PERANGKAT INI MENJADI SAVE PERTAMANYA).', VW / 2, 70, '#a8c8f8', 1, 'center');
    text('KALAU SALAH KETIK, TEKAN ESC LALU ULANGI.', VW / 2, 82, '#a8c8f8', 1, 'center');
    text(U.pending.name, VW / 2, 102, '#fcfcfc', 1, 'center');
    const val = '*'.repeat(U.pass2.length);
    text('PASSWORD', 70, 124, '#f8d800');
    R(150, 120, 164, 16, '#f8d800');
    R(151, 121, 162, 14, '#05050f');
    text(val, 156, 124, '#fcfcfc');
    if (blink) R(156 + (val ? textWidth(val) + 2 : 0), 124, 5, 7, '#f8d800');
    text(
      touchUI.on ? 'START BUAT SAVE BARU  BACK ULANGI' : 'ENTER BUAT SAVE BARU  ESC ULANGI',
      VW / 2,
      206,
      '#8888a0',
      1,
      'center',
    );
  } else if (U.mode === 'busy') {
    text('MENGHUBUNGKAN' + '.'.repeat(1 + ((frameCount >> 4) % 3)), VW / 2, 96, '#f8d800', 1, 'center');
  } else if (U.mode === 'pick') {
    const remote = cloud.conflict;
    text('PROGRESS DI CLOUD BERBEDA DENGAN PERANGKAT INI.', VW / 2, 34, '#a8c8f8', 1, 'center');
    text('PILIH YANG DIPAKAI: YANG LAIN AKAN DITIMPA.', VW / 2, 46, '#a8c8f8', 1, 'center');
    [
      ['CLOUD', remote.save || {}, cloudTime(remote.savedAt)],
      ['PERANGKAT INI', save, cloudTime(save.updatedAt)],
    ].forEach(([title, s, when], i) => {
      const x = i ? 202 : 26,
        on = U.sel === i;
      R(x - 4, 60, 164, 112, on ? 'rgba(60,188,252,0.22)' : 'rgba(255,255,255,0.05)');
      if (on) R(x - 4, 60, 164, 1, '#f8d800');
      text(title, x + 78, 66, on ? '#f8d800' : '#fcfcfc', 1, 'center');
      cloudSummary(s).forEach(([k, v], j) => {
        text(k, x + 4, 82 + j * 11, '#8888a0');
        text(v, x + 152, 82 + j * 11, '#fcfcfc', 1, 'right');
      });
      text('DISIMPAN ' + when, x + 78, 156, '#686878', 1, 'center');
    });
    text('KIRI/KANAN PILIH  ENTER PAKAI  ESC KELUAR AKUN', VW / 2, 206, '#8888a0', 1, 'center');
  } else {
    // the account card: a big avatar, the name, the cloud's state and the last save
    const b = cloudBadge(),
      x0 = VW / 2 - 124;
    R(x0, 32, 248, 52, 'rgba(4,8,22,0.86)');
    R(x0, 32, 248, 1, '#2a3a6a');
    R(x0, 83, 248, 1, '#2a3a6a');
    R(x0 + 247, 32, 1, 52, '#2a3a6a');
    R(x0, 32, 3, 52, b.color);
    drawCloudAvatar(x0 + 28, 58, 16, 2);
    text(cloud.name, x0 + 54, 39, '#fcfcfc', 2);
    drawCloudIcon(x0 + 54, 59, b.sign);
    text(b.label, x0 + 71, 61, b.color);
    if (b.sign === 'ok') text(cloudTime(cloud.syncedAt), x0 + 77 + textWidth(b.label), 61, '#8888a0');
    // and a line about it: what went wrong, the last save, or that it syncs by itself
    const [detail, col] =
      b.sign === '!'
        ? [textWidth(cloud.error + ' - DICOBA LAGI') <= 188 ? cloud.error + ' - DICOBA LAGI' : cloud.error, '#c87868']
        : b.sign === '?'
          ? ['CLOUD DAN PERANGKAT INI BERBEDA', '#a8a888']
          : b.sign === 'up'
            ? ['TERAKHIR DISIMPAN ' + cloudTime(cloud.syncedAt), '#686878']
            : ['TERSINKRON OTOMATIS', '#686878'];
    text(detail, x0 + 54, 73, col);
    ['SIMPAN SEKARANG', U.loadArm ? 'MUAT DARI CLOUD? ENTER LAGI' : 'MUAT DARI CLOUD', 'KELUAR AKUN'].forEach(
      (o, i) => {
        const y = 98 + i * 20,
          on = U.sel === i;
        R(VW / 2 - 90, y - 4, 180, 16, on ? 'rgba(60,188,252,0.25)' : 'rgba(255,255,255,0.05)');
        if (on) R(VW / 2 - 90, y - 4, 2, 16, '#f8d800');
        text(o, VW / 2, y, on ? '#f8d800' : '#fcfcfc', 1, 'center');
      },
    );
    text('PROGRESS TERSIMPAN OTOMATIS KE CLOUD SETIAP ADA PERUBAHAN.', VW / 2, 164, '#686878', 1, 'center');
    text('ATAS/BAWAH PILIH  ENTER  ESC KEMBALI', VW / 2, 206, '#8888a0', 1, 'center');
  }
  if (U.msg) text(U.msg[0], VW / 2, 178, U.msg[1] ? '#b8f818' : '#f87858', 1, 'center');
  drawVersion();
}
