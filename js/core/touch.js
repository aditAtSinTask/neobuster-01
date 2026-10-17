'use strict';
// Touch controls for phones and tablets. When the game is opened on a touch screen, semi-transparent buttons appear
// over and around it: a d-pad, JUMP, SHOOT and SLIDE, the weapon buttons, START and BACK, mute and full screen. They
// feed the same input as the keyboard (tHeld in engine.js), and each one also shows the key it stands for, so the hints
// on the game's screens still read right. Several fingers work at once, the d-pad has 8 directions, and a thumb can
// slide from one button to the next. On a phone held upright the game sits at the top and the buttons below it. A key
// on a real keyboard hides the buttons again; the next touch brings them back. The Cloud Save form types through the
// phone's own keyboard: tapping a field focuses a hidden text box.

const TOUCH_BUTTONS = [
  { a: 'jump', label: 'JUMP', key: 'Z', cls: 'big jump' },
  { a: 'shoot', label: 'SHOOT', key: 'X', cls: 'big shoot' },
  { a: 'slide', label: 'SLIDE', key: 'C', cls: 'mid slide' },
  { a: 'prev', label: '&#9664; W', key: 'Q', cls: 'small prev' },
  { a: 'next', label: 'W &#9654;', key: 'E', cls: 'small next' },
  { a: 'back', label: 'BACK', key: 'ESC', cls: 'small back' },
  { a: 'start', label: 'START', key: 'ENTER', cls: 'small start' },
];
const touchUI = {
  on: false,
  el: null,
  dpad: null,
  arrows: {},
  buttons: [],
  extras: [],
  touches: new Map(),
  text: null,
};

const TOUCH_CSS = `
body.touch { touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
  overscroll-behavior: none; }
@media (orientation: portrait) {
  body.touch { align-items: flex-start; background: linear-gradient(#0c1022, #161b33 60%, #10142a); }
  body.touch canvas { margin-top: max(env(safe-area-inset-top), 3vh); }
}
#touch { position: fixed; inset: 0; pointer-events: none; z-index: 10;
  font-family: Menlo, Monaco, Consolas, "DejaVu Sans Mono", monospace; font-weight: bold; }
#touch .b { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-sizing: border-box; border: 2px solid rgba(255,255,255,0.32); background: rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.78); border-radius: 50%; line-height: 1.1; }
#touch .b b { font-size: 3.1vmin; letter-spacing: 0.04em; }
#touch .b i { font-style: normal; font-size: 2.2vmin; opacity: 0.55; }
#touch .b.on { background: rgba(120,248,252,0.32); border-color: rgba(120,248,252,0.9); color: #fff;
  box-shadow: 0 0 2.5vmin rgba(60,188,252,0.6); }
#touch .small { width: 15vmin; height: 9vmin; border-radius: 2vmin; }
#touch .mid b { font-size: 2.7vmin; }
#touch .tiny { width: 11vmin; height: 7vmin; border-radius: 2vmin; }
#touch .tiny b { font-size: 2.4vmin; }
#touch .tiny.on { background: rgba(248,120,88,0.3); border-color: rgba(248,120,88,0.85); box-shadow: none; }
#touch .dpad { position: absolute; border-radius: 50%; box-sizing: border-box;
  border: 2px solid rgba(255,255,255,0.28); background: rgba(255,255,255,0.07); }
#touch .dpad::before, #touch .dpad::after { content: ''; position: absolute; background: rgba(255,255,255,0.08);
  border-radius: 1.5vmin; }
#touch .dpad::before { left: 34%; right: 34%; top: 8%; bottom: 8%; }
#touch .dpad::after { top: 34%; bottom: 34%; left: 8%; right: 8%; }
#touch .dpad span { position: absolute; z-index: 1; color: rgba(255,255,255,0.7); font-size: 5vmin; line-height: 1; }
#touch .dpad span.on { color: #78f8fc; text-shadow: 0 0 2vmin #3cbcfc; }
#touch .dpad .up { top: 9%; left: 50%; transform: translateX(-50%); }
#touch .dpad .down { bottom: 9%; left: 50%; transform: translateX(-50%); }
#touch .dpad .left { left: 9%; top: 50%; transform: translateY(-50%); }
#touch .dpad .right { right: 9%; top: 50%; transform: translateY(-50%); }
@media (orientation: landscape) {
  #touch .dpad { left: calc(3vmin + env(safe-area-inset-left)); bottom: calc(4vmin + env(safe-area-inset-bottom)); width: 38vmin; height: 38vmin; }
  #touch .jump { right: calc(3vmin + env(safe-area-inset-right)); bottom: calc(14vmin + env(safe-area-inset-bottom)); width: 19vmin; height: 19vmin; }
  #touch .shoot { right: calc(23vmin + env(safe-area-inset-right)); bottom: calc(3vmin + env(safe-area-inset-bottom)); width: 19vmin; height: 19vmin; }
  #touch .slide { right: calc(24vmin + env(safe-area-inset-right)); bottom: calc(26vmin + env(safe-area-inset-bottom)); width: 14vmin; height: 14vmin; }
  #touch .prev { left: calc(3vmin + env(safe-area-inset-left)); top: 4vmin; }
  #touch .back { left: calc(3vmin + env(safe-area-inset-left)); top: 16vmin; }
  #touch .next { right: calc(3vmin + env(safe-area-inset-right)); top: 4vmin; }
  #touch .start { right: calc(3vmin + env(safe-area-inset-right)); top: 16vmin; }
  #touch .mute { left: calc(3vmin + env(safe-area-inset-left)); top: 28vmin; }
  #touch .full { left: calc(3vmin + env(safe-area-inset-left)); top: 38vmin; }
}
@media (orientation: portrait) {
  #touch .dpad { left: 4vmin; bottom: calc(14vmin + env(safe-area-inset-bottom)); width: 44vmin; height: 44vmin; }
  #touch .jump { right: 4vmin; bottom: calc(30vmin + env(safe-area-inset-bottom)); width: 23vmin; height: 23vmin; }
  #touch .shoot { right: 27vmin; bottom: calc(14vmin + env(safe-area-inset-bottom)); width: 23vmin; height: 23vmin; }
  #touch .slide { right: 28vmin; bottom: calc(41vmin + env(safe-area-inset-bottom)); width: 17vmin; height: 17vmin; }
  #touch .b b { font-size: 3.6vmin; }
  #touch .tiny b { font-size: 2.8vmin; }
  #touch .prev, #touch .back, #touch .start, #touch .next {
    top: calc(max(env(safe-area-inset-top), 3vh) + ${(VH / VW) * 100}vw + 5vmin); }
  #touch .prev { left: 4vmin; }
  #touch .back { left: 23vmin; }
  #touch .start { right: 23vmin; }
  #touch .next { right: 4vmin; }
  #touch .mute { left: calc(50% - 12vmin); bottom: calc(3vmin + env(safe-area-inset-bottom)); }
  #touch .full { left: calc(50% + 1vmin); bottom: calc(3vmin + env(safe-area-inset-bottom)); }
}
#nb-text { position: fixed; left: 0; top: 0; width: 1px; height: 1px; opacity: 0; border: 0; padding: 0;
  font-size: 16px; }
`;

function touchBuild() {
  const style = document.createElement('style');
  style.textContent = TOUCH_CSS;
  document.head.appendChild(style);
  const el = document.createElement('div');
  el.id = 'touch';
  el.style.display = 'none';
  const d = document.createElement('div');
  d.className = 'dpad';
  for (const [dir, ch] of [
    ['up', '&#9650;'],
    ['down', '&#9660;'],
    ['left', '&#9664;'],
    ['right', '&#9654;'],
  ]) {
    const s = document.createElement('span');
    s.className = dir;
    s.innerHTML = ch;
    d.appendChild(s);
    touchUI.arrows[dir] = s;
  }
  el.appendChild(d);
  touchUI.dpad = d;
  const button = (cls, label, key) => {
    const b = document.createElement('div');
    b.className = 'b ' + cls;
    b.innerHTML = '<b>' + label + '</b>' + (key ? '<i>' + key + '</i>' : '');
    el.appendChild(b);
    return b;
  };
  for (const B of TOUCH_BUTTONS) touchUI.buttons.push({ a: B.a, el: button(B.cls, B.label, B.key) });
  // mute (the M key) and full screen (where the browser allows it, and not when it already runs as the app)
  const mute = button('tiny mute', 'MUTE', '');
  touchUI.extras.push({ el: mute, act: () => (toggleMute(), mute.classList.toggle('on', muted)) });
  const root = document.documentElement,
    fullscreen = root.requestFullscreen || root.webkitRequestFullscreen;
  if (fullscreen && !pwa.app) {
    const full = button('tiny full', 'FULL', '');
    touchUI.extras.push({
      el: full,
      act: () => {
        if (document.fullscreenElement || document.webkitFullscreenElement)
          (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        else {
          const p = fullscreen.call(root);
          // a phone turns to landscape in full screen where it can
          if (p && p.then)
            p.then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape')).catch(
              () => {},
            );
        }
      },
    });
  }
  document.body.appendChild(el);
  touchUI.el = el;
}

function touchShow(on) {
  if (on === touchUI.on) return;
  touchUI.on = on;
  touchUI.el.style.display = on ? '' : 'none';
  if (on && !document.body.classList.contains('touch')) {
    document.body.classList.add('touch');
    fit();
  }
  if (!on) {
    touchUI.touches.clear();
    touchUpdate();
  }
}

// what a finger at (x, y) is on: a button, an extra (mute, full screen), the d-pad (a little past its rim), or nothing
function touchZone(x, y) {
  const inside = el => {
    const q = el.getBoundingClientRect();
    return x >= q.left - 6 && x <= q.right + 6 && y >= q.top - 6 && y <= q.bottom + 6;
  };
  const b = touchUI.buttons.find(b => inside(b.el)) || touchUI.extras.find(b => inside(b.el));
  if (b) return b;
  const d = touchUI.dpad.getBoundingClientRect(),
    r = d.width / 2;
  return Math.hypot(x - (d.left + r), y - (d.top + r)) <= r * 1.12 ? 'dpad' : null;
}
// the d-pad's directions for a finger at (x, y): 8 sectors of 45 degrees round its centre, none in the middle
function touchDirs(x, y) {
  const d = touchUI.dpad.getBoundingClientRect(),
    r = d.width / 2,
    dx = x - (d.left + r),
    dy = y - (d.top + r);
  if (Math.hypot(dx, dy) < r * 0.18) return {};
  const m = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8; // 0 right, 2 down, 4 left, 6 up
  return { right: m === 7 || m <= 1, down: m >= 1 && m <= 3, left: m >= 3 && m <= 5, up: m >= 5 && m <= 7 };
}
// the actions every finger holds: into tHeld (a press shorter than a frame still counts, through kLatch)
function touchUpdate() {
  const now = {};
  for (const T of touchUI.touches.values()) {
    if (T.zone === 'dpad') for (const [k, v] of Object.entries(touchDirs(T.x, T.y))) v && (now[k] = true);
    else if (T.zone && T.zone.a) now[T.zone.a] = true;
  }
  for (const a of ACTIONS) {
    if (now[a] && !tHeld[a]) kLatch[a] = true;
    tHeld[a] = !!now[a];
  }
  for (const b of touchUI.buttons) b.el.classList.toggle('on', !!now[b.a]);
  for (const k in touchUI.arrows) touchUI.arrows[k].classList.toggle('on', !!now[k]);
}
document.addEventListener(
  'touchstart',
  e => {
    touchShow(true);
    let used = false;
    for (const t of e.changedTouches) {
      const zone = touchZone(t.clientX, t.clientY);
      if (!zone) continue;
      used = true;
      if (zone.act) zone.act();
      touchUI.touches.set(t.identifier, { zone: zone.act ? null : zone, x: t.clientX, y: t.clientY });
    }
    if (used) {
      e.preventDefault();
      touchUpdate();
    }
  },
  { passive: false },
);
document.addEventListener(
  'touchmove',
  e => {
    let used = false;
    for (const t of e.changedTouches) {
      const T = touchUI.touches.get(t.identifier);
      if (!T) continue;
      used = true;
      T.x = t.clientX;
      T.y = t.clientY;
      // a finger on the d-pad keeps steering it; one on a button can slide onto the next button
      if (T.zone !== 'dpad') {
        const z = touchZone(T.x, T.y);
        T.zone = z && z !== 'dpad' && z.a ? z : null;
      }
    }
    if (used) {
      e.preventDefault();
      touchUpdate();
    }
  },
  { passive: false },
);
const touchEnd = e => {
  let used = false;
  for (const t of e.changedTouches) if (touchUI.touches.delete(t.identifier)) used = true;
  if (used) {
    e.preventDefault();
    touchUpdate();
  }
};
document.addEventListener('touchend', touchEnd, { passive: false });
document.addEventListener('touchcancel', touchEnd, { passive: false });
// a key on a real keyboard: the buttons step aside (typing into the hidden text box does not count)
addEventListener('keydown', e => {
  if (e.target !== touchUI.text) touchShow(false);
});
addEventListener('contextmenu', e => {
  if (touchUI.on) e.preventDefault();
});

// ---------- typing on a touch screen: the Cloud Save form ----------
// the field the text box types into: [its value, set it, a password?]
function touchField() {
  const U = cloudUI;
  if (U.mode === 'new') return [U.pass2, v => (U.pass2 = v), true];
  if (U.field === 0) return [U.name, v => (U.name = v), false];
  return [U.pass, v => (U.pass = v), true];
}
const touchTyping = () => game.state === 'cloud' && (cloudUI.mode === 'form' || cloudUI.mode === 'new');
// focuses the hidden text box on the form's current field (a phone opens its keyboard only from a tap)
function touchType() {
  let t = touchUI.text;
  if (!t) {
    t = touchUI.text = document.createElement('input');
    t.id = 'nb-text';
    t.autocomplete = 'off';
    t.spellcheck = false;
    t.setAttribute('autocapitalize', 'off');
    t.setAttribute('autocorrect', 'off');
    t.addEventListener('input', () => {
      if (!touchTyping()) return;
      const [, set, pw] = touchField(),
        v = pw ? t.value.replace(/[^ -~]/g, '').slice(0, 32) : t.value.replace(/[^a-z0-9_.-]/gi, '').slice(0, 16);
      if (t.value !== v) t.value = v;
      set(v);
    });
    document.body.appendChild(t);
  }
  const [v, , pw] = touchField();
  t.type = pw ? 'password' : 'text';
  t.value = v;
  t.focus();
}
// a tap on the form picks the field under it (the username box is above y 91, the password box below) and types there
cvs.addEventListener('click', e => {
  if (!touchTyping()) return;
  const r = cvs.getBoundingClientRect();
  if (cloudUI.mode === 'form') cloudUI.field = ((e.clientY - r.top) * VH) / r.height < 91 ? 0 : 1;
  touchType();
});
// the keyboard goes away once the form does
setInterval(() => {
  if (touchUI.text && document.activeElement === touchUI.text && !touchTyping()) touchUI.text.blur();
}, 250);

touchBuild();
if (matchMedia('(pointer: coarse)').matches) touchShow(true);
