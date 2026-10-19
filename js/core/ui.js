'use strict';
// Menu widgets shared by every screen, so the menus look and read alike: key caps and the bar of key hints at the foot
// of a screen, the buttons of a menu, and panels. Keys are named as on a keyboard (ENTER, ESC, X, ...); the touch
// buttons show the same names under their own (START / ENTER, SHOOT / X, ...).

// a box with its corners clipped by a pixel (a rounded look that stays pixel art): the fill (it may be see-through),
// then a 1 px border round it
function box(x, y, w, h, fill, border) {
  x = Math.round(x);
  y = Math.round(y);
  R(x + 1, y + 1, w - 2, h - 2, fill);
  if (!border) return;
  R(x + 1, y, w - 2, 1, border);
  R(x + 1, y + h - 1, w - 2, 1, border);
  R(x, y + 1, 1, h - 2, border);
  R(x + w - 1, y + 1, 1, h - 2, border);
}
// a dark see-through panel behind a block of a menu
function panel(x, y, w, h) {
  box(x, y, w, h, 'rgba(6,10,28,0.78)', '#2a3a6a');
}

// a key cap with the key's name on it, its text's top at y; returns its width
function keyCap(key, x, y) {
  const w = textWidth(key) + 6;
  box(x, y - 2, w, 11, '#262a44', '#0a0a16');
  R(x + 1, y - 1, w - 2, HP, '#4c5480'); // the lit top edge of the cap
  text(key, x + 3, y, '#e8ecfc');
  return w;
}
// a bar of key hints, [[key, what it does], ...], centred on the screen with its text at y. On a phone held sideways
// the touch buttons cover the sides of the screen: a bar too wide for the clear middle takes two rows (the first one
// row higher), unless split is false
function drawHints(list, y, col = '#a8a8b8', split = true) {
  const gap = 10,
    room = Math.min(VW, touchClearWidth()) - 8,
    one = ([k, l]) => textWidth(k) + 9 + textWidth(l),
    width = row => row.reduce((a, h) => a + one(h), 0) + gap * (row.length - 1),
    half = Math.ceil(list.length / 2),
    rows = !split || width(list) <= room || list.length < 2 ? [list] : [list.slice(0, half), list.slice(half)];
  rows.forEach((row, r) => {
    let x = Math.round(VW / 2 - width(row) / 2);
    const yy = y - (rows.length - 1 - r) * 13;
    for (const [k, l] of row) {
      x += keyCap(k, x, yy) + 3;
      text(l, x, yy, col);
      x += textWidth(l) + gap;
    }
  });
}

// a menu button: the label in a box, centred on cx with its text at y; the selected one lit (gold, or `col`)
function menuButton(label, cx, y, w, sel, col = '#f8d800') {
  const x = Math.round(cx - w / 2);
  if (sel) glow(cx, y + 3, Math.max(14, w * 0.45), col, 0.18);
  box(x, y - 3, w, 13, sel ? 'rgba(40,36,8,0.9)' : 'rgba(10,14,34,0.85)', sel ? col : '#3a4470');
  if (sel) R(x + 2, y - 2, w - 4, HP, shade(col, 0.3));
  text(label, cx, y, sel ? col : '#b8bcd0', 1, 'center');
}
// a row (or two) of menu buttons centred at y, all one width; picked: the selected index. The buttons keep to the
// clear middle of a phone held sideways, in two rows when they do not fit one
function drawButtonRow(labels, y, picked, colOf = () => '#f8d800') {
  const room = Math.min(VW, touchClearWidth()) - 12,
    w = Math.max(...labels.map(l => textWidth(l) + 14)),
    gap = 6,
    fits = n => n * w + (n - 1) * gap <= room,
    rows = fits(labels.length) ? [labels.length] : [Math.ceil(labels.length / 2), Math.floor(labels.length / 2)];
  let i = 0;
  rows.forEach((n, r) => {
    const x0 = VW / 2 - (n * w + (n - 1) * gap) / 2 + w / 2;
    for (let k = 0; k < n; k++, i++) menuButton(labels[i], x0 + k * (w + gap), y + r * 16, w, i === picked, colOf(i));
  });
  return rows.length;
}
