'use strict';
// NOCTARA, the night continent: after the sky of Azura and the dusk of Vespera, the night. Three bosses only, so the
// hardest of all: 15x HP (CONTINENTS in js/stages/levels.js), a guardian halfway through every stage
// (HAZARD_KINDS.midroom in js/gameplay/actors.js), and each stage's last stretch brings in the other two stages'
// mechanics too. Gravion bends gravity in his observatory, Polaris rules the magnets of the polar railway under the
// aurora, Astraea opens the gates between the stars of the sky temple.
// Weakness chain: Gravity Well beats Polaris, Polar Magnet beats Astraea, Astral Gate beats Gravion.
// The bosses are native characters: js/characters/noctara/gravion.js, polaris.js and astraea.js.

// ================= STAGE DATA =================
Object.assign(STAGES, {
  gravity: {
    name: 'GRAVION',
    place: 'OBSERVATORIUM',
    intro: 'MENEKUK RUANG DENGAN GRAVITASINYA',
    theme: 'gravity',
    music: 'gravity',
    ambient: 'starmotes',
    color: '#9878f8',
  },
  magnet: {
    name: 'POLARIS',
    place: 'REL AURORA',
    intro: 'MENGUASAI SEMUA MAGNET DI KUTUB',
    theme: 'magnet',
    music: 'magnet',
    ambient: 'aurorasnow',
    color: '#f86888',
  },
  astral: {
    name: 'ASTRAEA',
    place: 'GERBANG BINTANG',
    intro: 'MEMBUKA GERBANG DI ANTARA BINTANG',
    theme: 'astral',
    music: 'astral',
    ambient: 'starmotes',
    color: '#f8d878',
  },
});
Object.assign(ENEMY_COLORS, {
  gravity: {
    a: '#9878f8',
    c: '#5838b8',
    fly: '#38a8c8',
    fly2: '#a8f0fc',
    hop: '#4a3878',
    hop2: '#c8b8fc',
    tur: '#3a3458',
  },
  magnet: {
    a: '#e84858',
    c: '#982838',
    fly: '#3878d8',
    fly2: '#a8d0fc',
    hop: '#5a6878',
    hop2: '#c8d8e8',
    tur: '#485868',
  },
  astral: {
    a: '#f8c848',
    c: '#a87818',
    fly: '#5848c8',
    fly2: '#d8d0fc',
    hop: '#283868',
    hop2: '#f8e8a8',
    tur: '#3a3a5a',
  },
});
Object.assign(PLAT_COL, {
  gravity: '#9878f8',
  magnet: '#7898b8',
  astral: '#f8d878',
});

Object.assign(SONGS, {
  gravity: {
    step: 8,
    lead: [
      69, 0, 0, 72, 0, 76, 0, 0, 74, 0, 72, 0, 71, 0, 0, 0, 69, 0, 0, 72, 0, 77, 0, 0, 76, 0, 74, 0, 72, 0, 0, 0, 69, 0,
      0, 72, 0, 76, 0, 81, 0, 79, 0, 77, 0, 76, 0, 0, 74, 0, 72, 0, 71, 0, 68, 0, 69, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [...bar(45), ...bar(41), ...bar(43), ...bar(40)],
  },
  magnet: {
    step: 7,
    lead: [
      76, 0, 79, 0, 76, 0, 72, 0, 74, 0, 76, 0, 79, 0, 0, 0, 77, 0, 81, 0, 77, 0, 74, 0, 76, 0, 77, 0, 81, 0, 0, 0, 79,
      0, 83, 0, 84, 0, 83, 0, 81, 0, 79, 0, 77, 0, 76, 0, 74, 0, 76, 0, 77, 0, 79, 0, 76, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [...bar(48), ...bar(45), ...bar(41), ...bar(43)],
  },
  astral: {
    step: 8,
    lead: [
      79, 0, 0, 83, 0, 86, 0, 88, 0, 86, 0, 83, 0, 0, 79, 0, 81, 0, 0, 84, 0, 88, 0, 89, 0, 88, 0, 84, 0, 0, 81, 0, 83,
      0, 0, 86, 0, 91, 0, 90, 0, 88, 0, 86, 0, 83, 0, 0, 84, 0, 83, 0, 81, 0, 79, 0, 78, 0, 79, 0, 0, 0, 0, 0,
    ],
    bass: [...bar(43), ...bar(48), ...bar(50), ...bar(47)],
  },
});

// boss-room gimmicks (Gravion needs none: he flips the room's gravity himself)
Object.assign(BOSS_ROOMS, {
  // two magnet blocks in the walls that pull and push in turn
  magnet: (B, dc) => {
    B.add('magnet', dc + 1, 18, { dir: 1, range: 8, period: 300 });
    B.add('magnet', dc + 22, 18, { dir: -1, range: 8, period: 300, phase: 150 });
  },
  // a pair of star gates at the two walls
  astral: (B, dc) => B.add('portal', dc + 2, FLOOR - 1, { to: [dc + 21, FLOOR - 1], col: '#f8d878' }),
});

// ================= LOOKS =================
Object.assign(WEAPON_ICONS, {
  // a black hole in a violet ring
  gravity: () =>
    sprite(
      0,
      0,
      1,
      10,
      [
        [1, 3, 8, 4, '#9878f8'],
        [3, 1, 4, 8, '#9878f8'],
      ],
      [
        [3, 3, 4, 4, '#140a2a'],
        [4, 2, 2, 1, '#e8d8fc'],
      ],
    ),
  // a horseshoe magnet, red and blue
  magnet: () =>
    sprite(
      0,
      0,
      1,
      10,
      [
        [1, 0, 3, 7, '#e84858'],
        [6, 0, 3, 7, '#3878d8'],
        [1, 6, 8, 3, '#8890a0'],
      ],
      [
        [1, 0, 3, 2, '#d8dce8'],
        [6, 0, 3, 2, '#d8dce8'],
        [2, 2, 1, 3, '#f8a8b0'],
      ],
    ),
  // a gold star in a star gate
  astral: () =>
    sprite(
      0,
      0,
      1,
      10,
      [
        [4, 0, 2, 10, '#f8c848'],
        [0, 4, 10, 2, '#f8c848'],
        [2, 2, 6, 6, '#f8d878'],
      ],
      [
        [4, 4, 2, 2, '#fcfcfc'],
        [3, 3, 1, 1, '#fcf8d8'],
      ],
    ),
});
// the sealed walls the Noctara weapons break
Object.assign(SEAL_LOOKS, {
  // warped space: dark crystal shot through with violet cracks, crushed by Gravity Well
  gravity: {
    col: '#b898fc',
    cell(x, y, i, t) {
      const c = ((t >> 3) + i) & 1 ? '#b898fc' : '#7858d8';
      R(x, y, 16, 16, '#0e0a20');
      R(x + 1, y + 1, 14, 14, '#241a48');
      R(x + 3, y + 2, 1, 6, c);
      R(x + 3, y + 7, 5, 1, c);
      R(x + 8, y + 7, 1, 6, c);
      R(x + 11, y + 3, 2, 2, '#3a2c68');
      R(x + 2, y + 12, 3, 1, '#3a2c68');
    },
  },
  // iron plates stacked tight, pulled apart by Polar Magnet
  magnet: {
    col: '#e86878',
    cell(x, y, i) {
      R(x, y, 16, 16, '#1c2028');
      R(x + 1, y + 1, 14, 6, '#5a6878');
      R(x + 1, y + 9, 14, 6, '#4a5868');
      R(x + 1, y + 1, 14, 1, '#8898a8');
      R(x + 1, y + 9, 14, 1, '#788898');
      R(x + 3 + (i % 3) * 3, y + 3, 2, 2, '#e84858');
      R(x + 9 - (i % 2) * 4, y + 11, 2, 2, '#3878d8');
    },
  },
  // a door of the sky sealed by a constellation, opened by Astral Gate
  astral: {
    col: '#f8d878',
    cell(x, y, i, t) {
      R(x, y, 16, 16, '#0a1030');
      R(x + 1, y + 1, 14, 14, '#162048');
      const tw = ((t >> 4) + i) & 1;
      R(x + 4, y + 4, 1, 1, tw ? '#fcfcfc' : '#f8d878');
      R(x + 10, y + 6, 1, 1, '#f8d878');
      R(x + 7, y + 11, 1, 1, tw ? '#f8d878' : '#fcfcfc');
      R(x + 5, y + 5, 4, 1, 'rgba(248,216,120,0.5)');
      R(x + 8, y + 7, 1, 4, 'rgba(248,216,120,0.5)');
    },
  },
});

// ================= TILESETS =================
Object.assign(TILESETS, {
  // the observatory: slate stone engraved with star charts, indigo panels with a violet seam
  gravity: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#2a2640' : '#28243c');
      F(x, y, 16, 1, '#3a3458');
      F(x, y, 1, 16, '#363050');
      F(x + 15, y, 1, 16, '#16121e');
      F(x, y + 15, 16, 1, '#16121e');
      if (v % 5 === 0) {
        // a star chart: two stars and the line between them
        F(x + 3, y + 5, 1, 1, '#8878c8');
        F(x + 11, y + 10, 1, 1, '#8878c8');
        F(x + 4, y + 6, 7, 1, 'rgba(136,120,200,0.35)');
      }
      if (exp) {
        F(x, y, 16, 3, '#4a4078');
        F(x, y, 16, 1, '#b898fc');
        F(x, y + 3, 16, 1, '#1a1628');
        F(x + 6, y + 1, 4, 1, '#7a68c8');
      }
    },
    // a ceiling's underside: the same violet seam as the top (the floor in a flipped field)
    under(F, x, y) {
      F(x, y + 13, 16, 3, '#4a4078');
      F(x, y + 15, 16, 1, '#b898fc');
      F(x, y + 12, 16, 1, '#1a1628');
    },
    block(F, x, y, v) {
      F(x, y, 16, 16, '#0e0c18');
      F(x, y, 15, 15, '#3a3468');
      F(x + 1, y + 1, 13, 13, '#463e78');
      F(x + 1, y + 1, 13, 1, '#6a5ea8');
      F(x + 1, y + 7, 13, 1, '#9878f8');
      F(x + 2, y + 3, 1, 1, '#24204a');
      F(x + 12, y + 3, 1, 1, '#24204a');
      F(x + 2, y + 11, 1, 1, '#24204a');
      F(x + 12, y + 11, 1, 1, '#24204a');
      if (v & 4) F(x + 7, y + 7, 2, 1, '#e8d8fc');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#e8d8fc', '#8878c8', '#2a2440', '#ffffff'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#9878f8', '#c8b8fc', '#3a2c68'),
  },
  // the polar railway: riveted steel, a rail along the top, hazard bands on the magnet blocks
  magnet: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#343c48' : '#323a46');
      F(x, y, 16, 1, '#48525e');
      F(x, y, 1, 16, '#444e5a');
      F(x + 15, y, 1, 16, '#1a1e26');
      F(x, y + 15, 16, 1, '#1a1e26');
      F(x + 3, y + 8, 1, 1, '#5a6470');
      F(x + 12, y + 8, 1, 1, '#5a6470');
      if (exp) {
        // a rail on its sleepers, frost along its edge
        F(x, y, 16, 4, '#2a2e36');
        F(x, y, 16, 2, '#a8b4c4');
        F(x, y, 16, 1, '#e8f0f8');
        F(x + 2 + (v % 3), y + 2, 4, 2, '#5a4030');
        F(x + 10 - (v % 2), y + 2, 4, 2, '#5a4030');
      }
    },
    // a ceiling's underside: a rail hung under it
    under(F, x, y) {
      F(x, y + 12, 16, 4, '#2a2e36');
      F(x, y + 14, 16, 2, '#a8b4c4');
      F(x, y + 15, 16, 1, '#e8f0f8');
    },
    // frozen rails: steel under a glaze of ice
    ice(F, x, y, v) {
      F(x, y, 16, 16, '#4a6a88');
      F(x, y, 16, 15, '#9cc8e8');
      F(x + 1, y + 3, 14, 11, '#b8dcf4');
      F(x, y, 16, 3, '#eef8ff');
      F(x + 3 + (v % 5), y + 6, 4, 1, '#ffffff');
      F(x + 9 - (v % 3), y + 10, 3, 1, '#e0f2fc');
      F(x + 2 + (v % 4), y + 15, 2, 1, '#2a3a4e');
    },
    block(F, x, y, v) {
      F(x, y, 16, 16, '#14181e');
      F(x, y, 15, 15, '#5a6878');
      F(x + 1, y + 1, 13, 13, '#68788a');
      F(x + 1, y + 1, 13, 1, '#98a8b8');
      // a red and blue band: north and south
      F(x + 1, y + 6, 7, 3, '#c83848');
      F(x + 8, y + 6, 6, 3, '#2868c8');
      F(x + 1, y + 6, 13, 1, 'rgba(255,255,255,0.25)');
      if (v & 2) F(x + 3, y + 12, 2, 1, '#2a3038');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#d8e0ec', '#7888a0', '#2a3038', '#ffffff'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#98a8b8', '#c8d4e0', '#3a4450'),
  },
  // the sky temple: white marble edged with gold, night-blue tiles set with gold stars
  astral: {
    ground(F, x, y, v, exp) {
      F(x, y, 16, 16, v & 1 ? '#c8c4d8' : '#c4c0d4');
      F(x, y, 16, 1, '#e8e4f4');
      F(x, y, 1, 16, '#dcd8ec');
      F(x + 15, y, 1, 16, '#8884a0');
      F(x, y + 15, 16, 1, '#8884a0');
      // veins in the marble
      F(x + (v % 9) + 2, y + 4, 4, 1, '#a8a4c0');
      F(x + ((v >> 4) % 8) + 4, y + 10, 3, 1, '#b4b0cc');
      if (exp) {
        F(x, y, 16, 3, '#f8d878');
        F(x, y, 16, 1, '#fcf4c8');
        F(x, y + 3, 16, 1, '#a87818');
      }
    },
    // a ceiling's underside: a gold trim
    under(F, x, y) {
      F(x, y + 13, 16, 3, '#f8d878');
      F(x, y + 15, 16, 1, '#fcf4c8');
      F(x, y + 12, 16, 1, '#a87818');
    },
    block(F, x, y, v) {
      F(x, y, 16, 16, '#080c20');
      F(x, y, 15, 15, '#1c2858');
      F(x + 1, y + 1, 13, 13, '#243068');
      F(x + 1, y + 1, 13, 1, '#f8d878');
      F(x + 1, y + 13, 13, 1, '#a87818');
      F(x + 4 + (v % 5), y + 4 + ((v >> 3) % 5), 1, 1, '#f8e8a8');
      if (v & 8) F(x + 10, y + 9, 1, 1, '#fcfcfc');
    },
    spike: (F, x, y) => drawSpikes(F, x, y, '#fcf4c8', '#c89828', '#3a3020', '#ffffff'),
    ladder: (F, x, y) => drawLadder(F, x, y, '#f8d878', '#fcf0c0', '#8a6418'),
  },
});

// ================= BACKGROUNDS =================
// a sky full of stars (n of them), twinkling ones a little bigger
function nightStars(g, rnd, n, top = 0, bottom = BG_H) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * BG_W,
      y = top + rnd() * (bottom - top),
      b = rnd();
    g.fillStyle = b < 0.08 ? '#ffffff' : b < 0.4 ? 'rgba(232,224,255,0.8)' : 'rgba(200,190,240,0.45)';
    g.fillRect(x, y, b < 0.08 ? 2 : 1, b < 0.08 ? 2 : 1);
  }
}
Object.assign(BG_PAINTERS, {
  gravity: [
    {
      k: 0.08,
      ky: 0.4,
      paint(g, rnd) {
        // the night sky over the mountain, a great ringed planet rising
        skyGrad(g, [
          [0, '#06041a'],
          [0.55, '#1a1048'],
          [0.85, '#3a2470'],
          [1, '#4a3080'],
        ]);
        nightStars(g, rnd, 260);
        const px = BG_W * 0.68,
          py = BG_H * 0.36;
        g.fillStyle = 'rgba(152,120,248,0.12)';
        g.beginPath();
        g.arc(px, py, 70, 0, 7);
        g.fill();
        g.fillStyle = '#5a4aa8';
        g.beginPath();
        g.arc(px, py, 46, 0, 7);
        g.fill();
        g.fillStyle = '#7a68c8';
        g.beginPath();
        g.arc(px - 10, py - 12, 34, 0, 7);
        g.fill();
        g.fillStyle = 'rgba(40,24,90,0.55)';
        for (const [dy, h] of [
          [-14, 5],
          [2, 7],
          [18, 4],
        ])
          g.fillRect(px - 46, py + dy, 92, h);
        g.strokeStyle = '#c8b8fc';
        g.lineWidth = 3;
        g.beginPath();
        g.ellipse(px, py, 82, 14, -0.25, 0, 7);
        g.stroke();
        g.strokeStyle = 'rgba(200,184,252,0.45)';
        g.lineWidth = 6;
        g.beginPath();
        g.ellipse(px, py, 96, 18, -0.25, 0, 7);
        g.stroke();
        // the ridge the observatory stands on
        poly(
          g,
          [
            0,
            BG_H,
            0,
            BG_H - 60,
            120,
            BG_H - 90,
            260,
            BG_H - 70,
            420,
            BG_H - 100,
            600,
            BG_H - 66,
            BG_W,
            BG_H - 86,
            BG_W,
            BG_H,
          ],
          '#140e30',
        );
      },
    },
    {
      k: 0.3,
      ky: 1,
      paint(g, rnd) {
        // domes with their slits open, telescopes aimed at the sky, a radio dish
        for (let x = 30; x < BG_W; x += 140 + rnd() * 60) {
          const r = 26 + rnd() * 14,
            by = BG_H - 40;
          g.fillStyle = '#1c1640';
          g.fillRect(x - r, by, r * 2, 40);
          g.beginPath();
          g.arc(x, by, r, Math.PI, 0);
          g.fill();
          g.fillStyle = '#0a0820';
          g.fillRect(x - 3, by - r, 6, r);
          g.fillStyle = '#3a2c78';
          g.save();
          g.translate(x, by - r * 0.6);
          g.rotate(-0.7 + rnd() * 0.5);
          g.fillRect(-2, -r * 0.9, 5, r * 0.9);
          g.restore();
          g.fillStyle = 'rgba(232,216,252,0.7)';
          g.fillRect(x - r + 6, by + 12, 3, 3);
        }
        g.fillStyle = '#18123a';
        g.fillRect(0, BG_H - 12, BG_W, 12);
      },
    },
  ],
  magnet: [
    {
      k: 0.08,
      ky: 0.4,
      paint(g, rnd) {
        // the polar night: stars, and the aurora's curtains rippling across it
        skyGrad(g, [
          [0, '#020814'],
          [0.5, '#0a1a34'],
          [0.85, '#14304a'],
          [1, '#1c3c54'],
        ]);
        nightStars(g, rnd, 220);
        for (const [y0, col] of [
          [40, 'rgba(88,248,168,0.16)'],
          [62, 'rgba(120,200,252,0.13)'],
          [30, 'rgba(232,104,184,0.1)'],
        ])
          for (let x = 0; x < BG_W; x += 2) {
            const y = y0 + Math.sin(x * 0.012 + y0) * 18 + Math.sin(x * 0.031) * 6,
              h = 40 + Math.sin(x * 0.02 + y0 * 0.1) * 14;
            g.fillStyle = col;
            g.fillRect(x, y, 2, h);
          }
        // snowfields far away
        poly(
          g,
          [0, BG_H, 0, BG_H - 44, 160, BG_H - 58, 340, BG_H - 40, 520, BG_H - 62, BG_W, BG_H - 46, BG_W, BG_H],
          '#2a4058',
        );
        g.fillStyle = 'rgba(232,240,252,0.25)';
        g.fillRect(0, BG_H - 46, BG_W, 3);
      },
    },
    {
      k: 0.3,
      ky: 1,
      paint(g, rnd) {
        // rail pylons and magnet cranes against the snow, red and blue lamps
        for (let x = 10; x < BG_W; x += 110 + rnd() * 50) {
          const h = 80 + rnd() * 50;
          g.fillStyle = '#16202c';
          g.fillRect(x, BG_H - h, 8, h);
          g.fillRect(x - 20, BG_H - h, 70, 6);
          g.fillRect(x + 40, BG_H - h + 6, 3, 22);
          g.fillStyle = '#28323e';
          g.fillRect(x + 32, BG_H - h + 28, 20, 8);
          g.fillStyle = rnd() < 0.5 ? '#e84858' : '#3878d8';
          g.fillRect(x + 2, BG_H - h - 4, 4, 4);
        }
        g.fillStyle = '#0e1820';
        g.fillRect(0, BG_H - 16, BG_W, 16);
        g.fillStyle = '#5a6878';
        g.fillRect(0, BG_H - 18, BG_W, 2);
      },
    },
  ],
  astral: [
    {
      k: 0.08,
      ky: 0.4,
      paint(g, rnd) {
        // deep space: a nebula's violet and blue clouds, thick with stars
        skyGrad(g, [
          [0, '#04020e'],
          [0.5, '#0c0a2a'],
          [0.85, '#1a1448'],
          [1, '#241a58'],
        ]);
        blobs(g, rnd, 30, 20, BG_H - 60, 30, 70, 'rgba(120,80,220,0.08)');
        blobs(g, rnd, 20, 30, BG_H - 90, 20, 50, 'rgba(80,140,240,0.08)');
        nightStars(g, rnd, 340);
        for (let i = 0; i < 4; i++) {
          // bright stars with crosses of light
          const x = rnd() * BG_W,
            y = 20 + rnd() * (BG_H - 120);
          g.fillStyle = 'rgba(252,240,200,0.8)';
          g.fillRect(x - 6, y, 13, 1);
          g.fillRect(x, y - 6, 1, 13);
          g.fillStyle = '#ffffff';
          g.fillRect(x - 1, y - 1, 3, 3);
        }
      },
    },
    {
      k: 0.3,
      ky: 1,
      paint(g, rnd) {
        // the temple's broken colonnades and golden arches floating on islands of rock
        for (let x = 0; x < BG_W; x += 150 + rnd() * 60) {
          const w = 90 + rnd() * 40,
            y = BG_H - 50 - rnd() * 40;
          poly(g, [x, y, x + w, y, x + w - 14, y + 24, x + w / 2, y + 40, x + 16, y + 22], '#14123a');
          g.fillStyle = '#d8d4ec';
          for (let k = 0; k < 4; k++) {
            const cx = x + 12 + k * (w / 4),
              ch = 30 + ((k * 13 + x) % 26);
            g.fillRect(cx, y - ch, 7, ch);
          }
          g.fillStyle = '#f8d878';
          g.fillRect(x + 8, y - 60, w - 16, 4);
          g.fillStyle = 'rgba(248,216,120,0.25)';
          g.beginPath();
          g.arc(x + w / 2, y - 60, 22, Math.PI, 0);
          g.fill();
        }
      },
    },
  ],
});

// ================= BOSS ROOM ART =================
Object.assign(ROOM_ART, {
  gravity(g, x, y, w, h) {
    // the main dome: a star map on the wall, rings of a gravity engine
    g.fillStyle = 'rgba(152,120,248,0.08)';
    for (let r = 30; r < 120; r += 22) {
      g.beginPath();
      g.arc(x + w / 2, y + h * 0.45, r, 0, 7);
      g.lineWidth = 2;
      g.strokeStyle = 'rgba(152,120,248,0.18)';
      g.stroke();
    }
    for (let i = 0; i < 26; i++) {
      g.fillStyle = 'rgba(232,216,252,0.5)';
      g.fillRect(x + ((i * 97) % w), y + ((i * 53) % (h - 20)) + 6, 1, 1);
    }
  },
  magnet(g, x, y, w, h) {
    // the crane hall: a gantry with its magnet, red and blue warning bands
    g.fillStyle = '#1a222c';
    g.fillRect(x, y + 8, w, 10);
    g.fillStyle = '#3a4654';
    g.fillRect(x + w / 2 - 20, y + 18, 40, 16);
    for (let i = 0; i < w; i += 24) {
      g.fillStyle = (i / 24) & 1 ? 'rgba(200,56,72,0.35)' : 'rgba(40,104,200,0.35)';
      g.fillRect(x + i, y + h - 26, 12, 6);
    }
  },
  astral(g, x, y, w, h) {
    // the throne hall of the stars: golden arches, a great star gate on the back wall
    g.strokeStyle = 'rgba(248,216,120,0.4)';
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(x + w / 2, y + h * 0.45, 46, 56, 0, 0, 7);
    g.stroke();
    g.strokeStyle = 'rgba(120,96,232,0.35)';
    g.lineWidth = 8;
    g.beginPath();
    g.ellipse(x + w / 2, y + h * 0.45, 36, 46, 0, 0, 7);
    g.stroke();
    for (const ax of [x + 24, x + w - 48]) {
      g.fillStyle = 'rgba(216,212,236,0.12)';
      g.fillRect(ax, y + 20, 24, h - 40);
    }
  },
});

// ================= AMBIENT PARTICLES =================
Object.assign(AMBIENTS, {
  // motes of starlight drifting up
  starmotes: {
    n: 34,
    update: q => {
      q.y -= q.sp * 0.35;
      q.x += wave(q, 0.02) * 0.3;
    },
    draw: (q, x, y) => {
      R(x, y, 1, 1, q.s > 1 ? '#fcf4c8' : '#c8b8fc');
      if (q.s > 1) glow(x, y, 5, '#b898fc', 0.3);
    },
  },
  // fine snow blowing along under the aurora
  aurorasnow: {
    n: 46,
    update: q => {
      q.x -= 0.6 + q.sp;
      q.y += 0.3 + wave(q, 0.03) * 0.3;
    },
    draw: (q, x, y) => R(x, y, q.s > 1 ? 2 : 1, 1, q.s > 1 ? '#e8f4fc' : '#a8c4dc'),
  },
});

// ================= HAZARDS =================
// the astral phase: Astraea's star blocks are of two sets, and going through a star gate marked `phase` swaps which
// set stands (game.phase 1 or 2; set 1 stands again at every restart from a checkpoint, so a layout puts each
// checkpoint where set 1 carries the player on)
const phaseNow = () => game.phase || 1;
Object.assign(HAZARD_KINDS, {
  // a gravity field (its physics is gravAt / lowGravAt in actors.js): a violet tint with arrows drifting the way
  // gravity pulls (flip), or a pale blue one with slow motes (low)
  gzone: {
    make(d) {
      return {
        x: d.x * TILE,
        y: d.y * TILE,
        w: (d.x1 - d.x + 1) * TILE,
        h: (d.y1 - d.y + 1) * TILE,
        zk: d.kind,
      };
    },
    update() {},
    draw(h) {
      const x = h.x - camX,
        y = h.y - camY;
      if (x > VW || y > VH || x + h.w < 0 || y + h.h < 0) return;
      const flip = h.zk === 'flip';
      ctx.fillStyle = flip ? 'rgba(152,120,248,0.12)' : 'rgba(120,200,248,0.08)';
      ctx.fillRect(x, y, h.w, h.h);
      R(x, y, h.w, 1, flip ? 'rgba(200,184,252,0.5)' : 'rgba(168,224,252,0.35)');
      R(x, y + h.h - 1, h.w, 1, flip ? 'rgba(200,184,252,0.5)' : 'rgba(168,224,252,0.35)');
      // the arrows or motes, scrolling the way gravity pulls
      for (let ax = 8; ax < h.w; ax += 32)
        for (let ay = 8; ay < h.h; ay += 40) {
          const k = flip ? (ay - frameCount * 0.6) % h.h : (ay + frameCount * 0.15) % h.h,
            py = y + ((k + h.h) % h.h),
            px = x + ax + ((ay * 7) % 16);
          if (flip) {
            R(px - 2, py + 1, 5, 1, 'rgba(200,184,252,0.45)');
            R(px - 1, py, 3, 1, 'rgba(200,184,252,0.45)');
            R(px, py - 1, 1, 1, 'rgba(232,216,252,0.6)');
          } else R(px, py, 1, 1, 'rgba(200,236,252,0.6)');
        }
    },
  },
  // a black hole: pulls everyone near it in (never faster than a walk, so a player who keeps going always gets
  // away), and its core hurts
  bhole: {
    make(d) {
      return {
        cx: d.x * TILE + 8,
        cy: d.y * TILE + 8,
        R: (d.r || 5) * TILE,
        x: d.x * TILE,
        y: d.y * TILE,
        w: 16,
        h: 16,
      };
    },
    update(h, p) {
      if (!alive(p) || game.timeStop > 0) return;
      const dx = h.cx - pcx(),
        dy = h.cy - pcy(),
        d = Math.hypot(dx, dy) || 1;
      if (d < h.R) {
        const f = 0.25 + 0.6 * (1 - d / h.R);
        if (p.state !== 'climb') {
          moveX(p, (dx / d) * f);
          p.vy += (dy / d) * f * 0.12;
        }
        if (d < 9) damagePlayer(4);
      }
      if (frameCount % 3 === 0 && onScreen(h.cx, h.cy, 32)) {
        const a = Math.random() * Math.PI * 2,
          r = 20 + Math.random() * 30;
        part({
          kind: 'spark',
          x: h.cx + Math.cos(a) * r,
          y: h.cy + Math.sin(a) * r,
          vx: -Math.cos(a) * 1.2 + Math.sin(a) * 0.8,
          vy: -Math.sin(a) * 1.2 - Math.cos(a) * 0.8,
          life: 16,
        });
      }
    },
    draw(h) {
      const x = h.cx - camX,
        y = h.cy - camY;
      if (x < -60 || x > VW + 60 || y < -60 || y > VH + 60) return;
      glow(x, y, 34, '#7858d8', 0.35);
      for (let i = 0; i < 3; i++) {
        const a = frameCount * 0.06 + (i * Math.PI * 2) / 3;
        ctx.strokeStyle = i & 1 ? 'rgba(200,184,252,0.7)' : 'rgba(152,120,248,0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(x, y, 13, 5, a, 0, Math.PI * 1.4);
        ctx.stroke();
      }
      circle(x, y, 8, '#000000');
      circle(x, y, 9, 'rgba(20,10,40,0.6)');
      R(x - 2, y - 7, 4, 1, '#e8d8fc');
    },
  },
  // a magnet in a wall: its field reaches `range` tiles out (toward dir) about 2 rows each way of its own; it pulls
  // (red, north) and pushes (blue, south) in turn, flickering before it swaps
  magnet: {
    make(d) {
      return {
        x: d.x * TILE,
        y: d.y * TILE,
        w: 16,
        h: 16,
        dir: d.dir || 1,
        range: (d.range || 6) * TILE,
        period: d.period || 240,
        phase: d.phase || 0,
        pull: true,
        warn: false,
      };
    },
    update(h, p) {
      const t = (frameCount + h.phase) % h.period;
      h.pull = t < h.period / 2;
      h.warn = t % (h.period / 2) > h.period / 2 - 30;
      if (!alive(p) || game.timeStop > 0 || p.state === 'climb') return;
      const cy = h.y + 8,
        off = (pcx() - (h.x + 8)) * h.dir; // how far out in front of it
      if (off > 0 && off < h.range && Math.abs(pcy() - cy) < 34) {
        const f = 0.85 * (1 - off / h.range) + 0.25;
        moveX(p, (h.pull ? -h.dir : h.dir) * f);
      }
    },
    draw(h) {
      const x = h.x - camX,
        y = h.y - camY;
      if (x < -h.range - 20 || x > VW + h.range + 20 || y < -40 || y > VH + 40) return;
      const col = h.warn && frameCount & 4 ? '#fcfcfc' : h.pull ? '#e84858' : '#3878d8';
      // the field lines, flowing in (pull) or out (push)
      for (let k = 0; k < 4; k++) {
        const u = ((((frameCount * (h.pull ? -1 : 1)) / 40 + k / 4) % 1) + 1) % 1,
          lx = x + 8 + h.dir * (12 + u * (h.range - 12));
        ctx.globalAlpha = 0.5 * (1 - u);
        R(lx - 1, y - 8 + ((k * 7) % 24), 2, 6, col);
        ctx.globalAlpha = 1;
      }
      // the magnet's face: a horseshoe set in the wall
      R(x + 2, y + 2, 12, 12, '#1c2028');
      R(x + 3, y + 3, 4, 10, '#e84858');
      R(x + 9, y + 3, 4, 10, '#3878d8');
      R(x + 3, y + 3, 10, 2, '#c8d0dc');
      glow(x + 8, y + 8, 14, col, 0.45);
    },
  },
  // a star gate: walking into one end comes out of the other (both ways); a gate marked `phase` also swaps which
  // set of star blocks stands (HAZARD_KINDS.phase)
  portal: {
    make(d) {
      return {
        x: d.x * TILE,
        y: (d.y - 1) * TILE,
        w: 16,
        h: 32,
        x2: d.to[0] * TILE,
        y2: (d.to[1] - 1) * TILE,
        col: d.col || '#b898fc',
        flips: !!d.phase,
        cd: 0,
      };
    },
    update(h, p) {
      if (h.cd > 0) h.cd--;
      if (h.cd || !alive(p) || p.state === 'beam') return;
      const inA = overlap(p, h),
        inB = overlap(p, { x: h.x2, y: h.y2, w: h.w, h: h.h });
      if (!inA && !inB) return;
      const [tx, ty] = inA ? [h.x2, h.y2] : [h.x, h.y];
      boom(pcx(), pcy());
      p.x = tx + 8 - p.w / 2;
      p.y = ty + h.h - p.h;
      p.vy = 0;
      h.cd = 40;
      sfx.warp();
      part({ kind: 'warp', x: p.x + p.w / 2, y: p.y + p.h, life: 18 });
      if (h.flips) {
        game.phase = 3 - phaseNow();
        sfx.tick();
      }
      updateCamera(true);
      game.noLerp = true;
    },
    draw(h) {
      for (const [gx, gy] of [
        [h.x, h.y],
        [h.x2, h.y2],
      ]) {
        const x = gx - camX + 8,
          y = gy - camY + 16;
        if (x < -30 || x > VW + 30 || y < -40 || y > VH + 40) continue;
        glow(x, y, 22, h.col, 0.45);
        ctx.strokeStyle = h.col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 15, 0, 0, 7);
        ctx.stroke();
        ctx.fillStyle = 'rgba(12,8,40,0.7)';
        ctx.beginPath();
        ctx.ellipse(x, y, 5, 14, 0, 0, 7);
        ctx.fill();
        for (let k = 0; k < 3; k++) {
          const a = frameCount * 0.08 + k * 2.1;
          R(x + Math.cos(a) * 3.5 - 0.5, y + Math.sin(a) * 11 - 0.5, 1, 1, '#fcfcfc');
        }
        if (h.flips) R(x - 1, y - 19, 2, 2, (frameCount >> 3) & 1 ? '#f8d878' : '#b898fc');
      }
    },
  },
  // star blocks: a row of blocks x..x1 on row y that stands only while its set (1 gold, 2 violet) is the phase; the
  // other set shows as a faint outline
  phase: {
    make(d) {
      return {
        x: d.x * TILE,
        y: d.y * TILE,
        w: (d.x1 - d.x + 1) * TILE,
        h: 16,
        tx: d.x,
        ty: d.y,
        set: d.set || 1,
        on: null,
      };
    },
    update(h, p) {
      const want = phaseNow() === h.set;
      if (want !== h.on && !(want && alive(p) && overlap(h, p))) {
        // never appear inside the player
        h.on = want;
        for (let i = 0; i < h.w / TILE; i++) map[h.ty][h.tx + i] = h.on ? 'Y' : '.';
      }
    },
    draw(h) {
      const x = h.x - camX,
        y = h.y - camY;
      if (x > VW || x + h.w < 0 || y > VH || y < -16) return;
      const [a, b, c] = h.set === 1 ? ['#f8d878', '#c89828', '#fcf4c8'] : ['#b898fc', '#7858d8', '#ece0fc'];
      for (let i = 0; i < h.w; i += 16)
        if (h.on) {
          R(x + i, y, 16, 16, '#0a0a1e');
          R(x + i + 1, y + 1, 14, 14, b);
          R(x + i + 2, y + 2, 12, 12, a);
          R(x + i + 2, y + 2, 12, 1, c);
          R(x + i + 7, y + 6, 2, 4, c);
          R(x + i + 6, y + 7, 4, 2, c);
        } else {
          ctx.globalAlpha = 0.35;
          R(x + i + 1, y + 1, 14, 1, a);
          R(x + i + 1, y + 14, 14, 1, a);
          R(x + i + 1, y + 1, 1, 14, a);
          R(x + i + 14, y + 1, 1, 14, a);
          ctx.globalAlpha = 1;
        }
    },
  },
  // a falling star: a glint high up, then it streaks down at a slant through x..; `period` frames apart
  fallstar: {
    make(d) {
      return {
        sx: d.x * TILE,
        sy: d.y * TILE,
        x: d.x * TILE,
        y: d.y * TILE,
        w: 10,
        h: 10,
        dx: d.dx || -1.6,
        period: d.period || 160,
        phase: d.phase || 0,
        t: 0,
        on: false,
      };
    },
    update(h, p) {
      if (game.timeStop > 0) return;
      const t = (frameCount + h.phase) % h.period;
      h.warn = t < 40;
      if (t === 40) {
        h.on = true;
        h.x = h.sx;
        h.y = h.sy;
        if (onScreen(h.x, h.y + 60, 60)) sfx.whoosh();
      }
      if (!h.on) return;
      h.x += h.dx * 2.2;
      h.y += 4.2;
      if (frameCount % 2 === 0) part({ kind: 'spark', x: h.x + 5, y: h.y + 5, vx: 0, vy: -0.4, life: 12 });
      if (alive(p) && overlap(h, p)) damagePlayer(4);
      if (solidPx(h.x + 5, h.y + 9) || h.y > h.sy + 30 * TILE) {
        h.on = false;
        if (onScreen(h.x, h.y, 16)) debris(h.x + 5, h.y + 5, '#f8d878', 6, 2);
      }
    },
    draw(h) {
      if (h.warn) {
        const x = h.sx - camX + 5,
          y = h.sy - camY + 5;
        if ((frameCount >> 2) & 1) {
          R(x - 4, y, 9, 1, '#fcf4c8');
          R(x, y - 4, 1, 9, '#fcf4c8');
        }
        return;
      }
      if (!h.on) return;
      const x = h.x - camX,
        y = h.y - camY;
      for (let k = 1; k <= 4; k++) {
        ctx.globalAlpha = 0.5 - k * 0.1;
        R(x + 3 - h.dx * 2.2 * k, y + 3 - 4.2 * k, 4, 4, '#f8d878');
      }
      ctx.globalAlpha = 1;
      glow(x + 5, y + 5, 12, '#f8d878', 0.7);
      R(x + 2, y + 2, 6, 6, '#fcf4c8');
      R(x + 4, y, 2, 10, '#fcfcfc');
      R(x, y + 4, 10, 2, '#fcfcfc');
    },
  },
  // a magnet crane over the rails: its magnet lets go of a lump of scrap every `period` frames (it glows red first)
  scrap: {
    make(d) {
      return {
        x: d.x * TILE,
        y: d.y * TILE,
        w: 14,
        h: 14,
        top: d.y * TILE,
        period: d.period || 150,
        phase: d.phase || 0,
        on: false,
        vy: 0,
      };
    },
    update(h, p) {
      if (game.timeStop > 0) return;
      const t = (frameCount + h.phase) % h.period;
      h.warn = t < 36;
      if (t === 36) {
        h.on = true;
        h.y = h.top + 10;
        h.vy = 0;
      }
      if (!h.on) return;
      h.vy = Math.min(h.vy + 0.35, 8);
      h.y += h.vy;
      if (alive(p) && overlap(h, p)) damagePlayer(4);
      if (solidPx(h.x + 7, h.y + 14) || h.y > h.top + 30 * TILE) {
        h.on = false;
        if (onScreen(h.x, h.y, 16)) {
          debris(h.x + 7, h.y + 10, '#7888a0', 6, 2);
          sfx.crumble();
        }
      }
    },
    draw(h) {
      const x = h.x - camX,
        y = h.top - camY;
      if (x < -30 || x > VW + 30) return;
      // the crane's magnet, glowing as it lets go
      R(x - 2, y - 6, 18, 8, '#3a4654');
      R(x - 1, y + 1, 16, 4, h.warn && frameCount & 4 ? '#f86878' : '#c83848');
      if (h.warn) glow(x + 7, y + 4, 10, '#f86878', 0.5);
      const sy = h.on ? h.y - camY : y + 5;
      if (!h.on && !h.warn && (frameCount + h.phase) % h.period > 36) return;
      R(x, sy, 14, 14, '#2a3038');
      R(x + 1, sy + 1, 12, 12, '#6a7888');
      R(x + 3, sy + 3, 5, 3, '#98a8b8');
      R(x + 8, sy + 8, 3, 3, '#4a5868');
    },
  },
});
// a magnet stage's updraft pads are magnet plates that throw you up (south pole up)
PAD_DRAW.magnet = (sx, sy) => {
  R(sx, sy + 8, 16, 8, '#2a3038');
  R(sx + 1, sy + 9, 14, 3, '#3878d8');
  R(sx + 1, sy + 9, 14, 1, '#a8d0fc');
  const u = (frameCount % 30) / 30;
  ctx.globalAlpha = 0.5 * (1 - u);
  R(sx + 3, sy + 6 - u * 18, 10, 2, '#78b8fc');
  ctx.globalAlpha = 1;
};

// ================= ENEMIES =================
Object.assign(EN, {
  // gravity: a little moon circling where it was put, firing at a player who comes near
  orbiter: {
    w: 12,
    h: 12,
    hp: 3,
    dmg: 3,
    score: 300,
    init(e) {
      e.cx = e.x + 6;
      e.cy = e.spawn.ty * TILE + 8;
      e.a = Math.random() * 6;
    },
    update(e) {
      e.t++;
      e.a += 0.035;
      e.x = e.cx + Math.cos(e.a) * 22 - 6;
      e.y = e.cy + Math.sin(e.a) * 22 - 6;
      if (e.t % 110 === 60 && Math.hypot(pcx() - e.cx, pcy() - e.cy) < 170 && alive(player)) {
        const a = Math.atan2(pcy() - (e.y + 6), pcx() - (e.x + 6));
        enemyShot(e.x + 6, e.y + 6, Math.cos(a) * 1.8, Math.sin(a) * 1.8, 3);
        sfx.eshoot();
      }
    },
    draw(e, x, y) {
      glow(x + 6, y + 6, 10, '#9878f8', 0.3);
      sprite(
        x,
        y,
        1,
        12,
        [[1, 1, 10, 10, '#8878b8']],
        [
          [3, 3, 3, 3, '#c8b8fc'],
          [7, 6, 2, 2, '#4a3c78'],
          [4, 8, 2, 1, '#4a3c78'],
        ],
      );
    },
  },
  // gravity: walks the floor; when the player is above (and there is a ceiling to fall onto), it flips its own gravity
  // and falls up onto the ceiling, and drops back onto a player who passes under it
  gravbot: {
    w: 14,
    h: 14,
    hp: 4,
    dmg: 3,
    score: 300,
    init(e) {
      e.g = 1;
      e.flipCd = 0;
    },
    update(e) {
      e.t++;
      if (e.flipCd > 0) e.flipCd--;
      const dx = pcx() - (e.x + 7),
        above = pcy() < e.y - 8,
        below = pcy() > e.y + e.h + 8;
      const roof = () => {
        for (let y = e.y - 8; y > e.y - 12 * TILE; y -= 8) if (solidPx(e.x + 7, y)) return true;
        return false;
      };
      if (!e.flipCd && Math.abs(dx) < 36 && ((e.g > 0 && above && roof()) || (e.g < 0 && below)) && alive(player)) {
        e.g = -e.g;
        e.flipCd = 70;
        sfx.whoosh();
      }
      e.facing = dx < 0 ? -1 : 1;
      if (e.onGround && e.t % 2) moveX(e, e.facing * 0.7);
      e.vy = e.g > 0 ? Math.min(e.vy + 0.3, 6) : Math.max(e.vy - 0.3, -6);
      const r = moveY(e, e.vy, false);
      e.onGround = r === e.g;
      if (r) e.vy = 0;
      if (e.y > LH * TILE || e.y < -32) e.dead = true;
    },
    draw(e, x, y) {
      const up = e.g < 0,
        leg = (e.t >> 3) & 1;
      ctx.save();
      if (up) {
        ctx.translate(0, 2 * y + 14);
        ctx.scale(1, -1);
      }
      sprite(
        x,
        y,
        e.facing,
        14,
        [
          [2, 2, 10, 8, '#4a3878'],
          [1 + leg, 10, 4, 4, '#2a2048'],
          [9 - leg, 10, 4, 4, '#2a2048'],
        ],
        [
          [4, 4, 6, 3, '#c8b8fc'],
          [8, 5, 2, 1, '#fcfcfc'],
          [3, 8, 8, 1, '#9878f8'],
        ],
      );
      ctx.restore();
    },
  },
  // magnet: a floating mine; red, it creeps toward the player, blue, it backs off; it bursts on touch
  magmine: {
    w: 12,
    h: 12,
    hp: 2,
    dmg: 4,
    score: 250,
    init(e) {
      e.y = e.spawn.ty * TILE + 2;
      e.ph = Math.random() * 200;
    },
    update(e) {
      e.t++;
      const red = (e.t + e.ph) % 200 < 120,
        dx = pcx() - (e.x + 6),
        dy = pcy() - (e.y + 6),
        d = Math.hypot(dx, dy) || 1;
      e.red = red;
      if (d < 180) {
        const s = red ? 0.5 : -0.3;
        e.x += (dx / d) * s;
        e.y += (dy / d) * s;
      }
      e.y += Math.sin(e.t * 0.06) * 0.2;
    },
    draw(e, x, y) {
      const col = e.red ? '#e84858' : '#3878d8';
      glow(x + 6, y + 6, 11, col, 0.4);
      circle(x + 6, y + 6, 6, '#14181e');
      circle(x + 6, y + 6, 5, '#5a6878');
      for (const [sx, sy] of [
        [6, 0],
        [6, 12],
        [0, 6],
        [12, 6],
      ])
        R(x + sx - 1, y + sy - 1, 2, 2, '#98a8b8');
      circle(x + 6, y + 6, 2, (e.t >> 3) & 1 ? col : '#fcfcfc');
    },
  },
  // magnet: a squat robot with a magnet on its arm; it drags a player in front of it closer, then flings a bolt
  polebot: {
    w: 16,
    h: 16,
    hp: 5,
    dmg: 3,
    score: 300,
    grav: true,
    init(e) {
      e.mode = 'walk';
    },
    update(e) {
      e.t++;
      const dx = pcx() - (e.x + 8);
      if (e.mode === 'walk') {
        e.facing = dx < 0 ? -1 : 1;
        if (e.t % 3 === 0) moveX(e, e.facing * 0.5);
        if (Math.abs(dx) < 130 && Math.abs(pcy() - (e.y + 8)) < 40 && e.t > 60) {
          e.mode = 'pull';
          e.t = 0;
        }
      } else if (e.mode === 'pull') {
        if (alive(player) && player.state !== 'climb' && !hasPart('windproof')) moveX(player, -e.facing * 0.55);
        if (e.t > 60) {
          enemyShot(e.x + 8 + e.facing * 8, e.y + 7, e.facing * 3, -0.6, 3, { kind: 'bolt', w: 8, h: 6 });
          sfx.eshoot();
          e.mode = 'walk';
          e.t = 0;
        }
      }
      physics(e);
    },
    draw(e, x, y) {
      const pulling = e.mode === 'pull';
      sprite(
        x,
        y,
        e.facing,
        16,
        [
          [2, 4, 12, 9, '#5a6878'],
          [3, 13, 4, 3, '#2a3038'],
          [9, 13, 4, 3, '#2a3038'],
          [12, 5, 4, 6, pulling && (e.t >> 2) & 1 ? '#f86878' : '#e84858'],
        ],
        [
          [4, 6, 5, 2, '#c8d4e0'],
          [7, 7, 2, 1, '#fcfcfc'],
          [13, 5, 3, 2, '#c8d0dc'],
        ],
      );
      if (pulling) glow(x + (e.facing > 0 ? 15 : 1), y + 8, 14, '#e84858', 0.4);
    },
  },
  // astral: a living star that hovers, then dives at the player in a straight line and climbs back
  starling: {
    w: 12,
    h: 12,
    hp: 3,
    dmg: 3,
    score: 300,
    init(e) {
      e.y = e.spawn.ty * TILE + 2;
      e.hx = e.x;
      e.hy = e.y;
      e.mode = 'hover';
    },
    update(e) {
      e.t++;
      if (e.mode === 'hover') {
        e.x = e.hx + Math.sin(e.t * 0.04) * 10;
        e.y = e.hy + Math.cos(e.t * 0.06) * 4;
        if (e.t > 80 && Math.hypot(pcx() - e.x, pcy() - e.y) < 150 && alive(player)) {
          const a = Math.atan2(pcy() - (e.y + 6), pcx() - (e.x + 6));
          e.vx = Math.cos(a) * 3.4;
          e.vy = Math.sin(a) * 3.4;
          e.mode = 'dive';
          e.t = 0;
          sfx.whoosh();
        }
      } else if (e.mode === 'dive') {
        e.x += e.vx;
        e.y += e.vy;
        if (e.t > 40 || solidPx(e.x + 6, e.y + 6)) {
          e.mode = 'back';
          e.t = 0;
        }
      } else {
        const dx = e.hx - e.x,
          dy = e.hy - e.y,
          d = Math.hypot(dx, dy);
        if (d < 2) {
          e.mode = 'hover';
          e.t = 0;
        } else {
          e.x += (dx / d) * 1.4;
          e.y += (dy / d) * 1.4;
        }
      }
    },
    draw(e, x, y) {
      glow(x + 6, y + 6, 10, '#f8d878', 0.45);
      const s = e.mode === 'dive' ? 1 : (e.t >> 3) & 1;
      R(x + 5, y, 2, 12, '#f8c848');
      R(x, y + 5, 12, 2, '#f8c848');
      R(x + 2 + s, y + 2 + s, 8 - s * 2, 8 - s * 2, '#f8d878');
      R(x + 4, y + 4, 4, 4, '#fcf4c8');
      R(x + 4, y + 5, 1, 1, '#3a2c10');
      R(x + 7, y + 5, 1, 1, '#3a2c10');
    },
  },
  // astral: a little sentinel that steps through a portal of its own to the player's back, then shoots
  gateling: {
    w: 14,
    h: 16,
    hp: 4,
    dmg: 3,
    score: 300,
    grav: true,
    init(e) {
      e.cd = 90;
    },
    update(e) {
      e.t++;
      e.facing = pcx() < e.x + 7 ? -1 : 1;
      if (e.warp > 0) {
        if (--e.warp === 0) {
          // out of the portal behind the player, on the floor there
          const nx = player.x - player.facing * 34;
          if (!solidPx(nx + 7, player.y + 8) && groundBelow(nx + 7, player.y) < player.y + 60) {
            e.x = nx;
            e.y = groundBelow(nx + 7, player.y) - e.h;
          }
          part({ kind: 'warp', x: e.x + 7, y: e.y + e.h, life: 16 });
          e.cd = 70;
        }
        return;
      }
      if (--e.cd <= 0) {
        if (Math.abs(pcx() - (e.x + 7)) < 160 && alive(player) && e.t > 40) {
          e.warp = 24;
          sfx.warp();
        } else e.cd = 30;
      }
      if (e.cd === 40) {
        enemyShot(e.x + 7 + e.facing * 6, e.y + 6, e.facing * 2.6, 0, 3, { kind: 'starbit', w: 6, h: 6 });
        sfx.eshoot();
      }
      physics(e);
    },
    draw(e, x, y) {
      if (e.warp > 0) {
        // stepping into its portal
        const k = e.warp / 24;
        ctx.strokeStyle = '#f8d878';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x + 7, y + 8, 5, 9 * k + 2, 0, 0, 7);
        ctx.stroke();
        return;
      }
      sprite(
        x,
        y,
        e.facing,
        14,
        [
          [3, 1, 8, 9, '#283868'],
          [2, 9, 10, 5, '#1c2848'],
          [3, 14, 3, 2, '#c89828'],
          [8, 14, 3, 2, '#c89828'],
        ],
        [
          [5, 3, 5, 3, '#f8d878'],
          [8, 4, 1, 1, '#fcfcfc'],
          [4, 10, 6, 1, '#f8d878'],
        ],
      );
    },
  },
});
Object.assign(ESHOT_KINDS, {
  // a polebot's flung bolt
  bolt: {
    draw(s, x, y) {
      R(x, y + 1, 8, 4, '#7888a0');
      R(x + 1, y, 6, 1, '#c8d4e0');
      R(x + 2, y + 2, 2, 2, '#2a3038');
    },
  },
  // a gateling's spark of starlight
  starbit: {
    draw(s, x, y) {
      glow(x + 3, y + 3, 7, '#f8d878', 0.6);
      R(x + 2, y, 2, 6, '#fcf4c8');
      R(x, y + 2, 6, 2, '#fcf4c8');
    },
  },
});

// ================= PLAYER WEAPONS =================
// pull an enemy toward (x, y) by up to `max` px a frame, if it is within `r` (walls still stop it)
function pullToward(e, x, y, r, max) {
  const dx = x - (e.x + e.w / 2),
    dy = y - (e.y + e.h / 2),
    d = Math.hypot(dx, dy);
  if (d > r || d < 1) return false;
  const k = Math.min(max, d) / d;
  moveX(e, dx * k);
  moveY(e, dy * k, false);
  return true;
}
// small enemy bullets near (x, y) are swallowed
function swallowShots(x, y, r) {
  for (const s of eshots)
    if (!s.dead && !s.big && !s.harmless && !(s.delay > 0) && Math.hypot(s.x + s.w / 2 - x, s.y + s.h / 2 - y) < r) {
      s.dead = true;
      spark(s.x + s.w / 2, s.y + s.h / 2);
    }
}
// every enemy (and every boss) within r of (x, y) is hit by a burst
function burstAt(x, y, r, weapon, dmg, bossDmg, extra = {}) {
  for (const e of enemies)
    if (!e.dead && !e.hidden && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r)
      hitEnemy(Object.assign({ kind: 'blast', weapon, x: e.x, y: e.y, w: e.w, h: e.h, dmg }, extra), e);
  for (const b of [...bosses])
    if (bossOpen(b) && Math.hypot(bcx(b) - x, b.y + b.h / 2 - y) < r + 10)
      hitBoss(Object.assign({ kind: 'blast', weapon, x: b.x, y: b.y, w: b.w, h: b.h, bossDmg }, extra), b);
}
// the nearest enemy or boss to (x, y) within r, ahead of it when dir is given
function nearestFoe(x, y, r, dir = 0) {
  let best = null,
    bd = r;
  const consider = (cx, cy, o) => {
    const d = Math.hypot(cx - x, cy - y);
    if (d < bd && (!dir || (cx - x) * dir > 0)) {
      bd = d;
      best = { o, cx, cy };
    }
  };
  for (const e of enemies) if (!e.dead && !e.hidden) consider(e.x + e.w / 2, e.y + e.h / 2, e);
  for (const b of bosses) if (bossOpen(b) && b.y > 0) consider(bcx(b), b.y + b.h / 2, b);
  return best;
}

Object.assign(WEAPONS, {
  gravity: {
    name: 'GRAVITY WELL',
    short: 'G.WELL',
    pal: { B: '#4a38a8', b: '#c8b8fc', S: SKIN },
    glow: '#9878f8',
    lit: true,
    desc: 'LUBANG HITAM: SEDOT MUSUH DAN PELURU',
    charged: 'EVENT HORIZON',
    demo: { kind: 'gwell', w: 12, h: 12, vx: 0.8 },
    fire(p) {
      if (countShots('gwell') >= 2) return false;
      addShot({
        kind: 'gwell',
        weapon: 'gravity',
        x: muzzle(p, 12),
        y: p.y + 7,
        w: 12,
        h: 12,
        vx: p.facing * 2.6,
        life: 70,
        dmg: 2,
        bossDmg: 2,
        pierce: true,
      });
      tone(260, 90, 0.25, 'sine', 0.14);
    },
    charge(p) {
      if (countShots('ehorizon')) return false;
      addShot({
        kind: 'ehorizon',
        weapon: 'gravity',
        x: muzzle(p, 28),
        y: p.y - 6,
        w: 28,
        h: 28,
        vx: p.facing * 2.4,
        life: 130,
        dmg: 2,
        bossDmg: 3,
        pierce: true,
        charged: true,
      });
      tone(180, 50, 0.6, 'sawtooth', 0.12);
    },
    ultra(p) {
      // the screen bends toward one point ahead of the player: everything is drawn in, then it collapses
      breakSealsInView('gravity');
      addShot({
        kind: 'singularity',
        weapon: 'gravity',
        x: clamp(pcx() + p.facing * 110, camX + 40, camX + VW - 40),
        y: clamp(pcy() - 24, camY + 40, camY + VH - 60),
        w: 0,
        h: 0,
        life: 110,
        dmg: 0,
        pierce: true,
        charged: true,
        ultra: true,
        offscreen: true,
      });
      tone(220, 40, 1.6, 'sawtooth', 0.14);
    },
  },
  magnet: {
    name: 'POLAR MAGNET',
    short: 'P.MAGNET',
    pal: { B: '#c82848', b: '#78c8f8', S: SKIN },
    glow: '#f86888',
    lit: true,
    desc: 'MAGNET YANG MENGEJAR MUSUH',
    charged: 'POLE CRUSH',
    demo: { kind: 'pmag', w: 10, h: 8, vx: 1 },
    fire(p) {
      if (countShots('pmag') >= 3) return false;
      p.magRed = !p.magRed;
      addShot({
        kind: 'pmag',
        weapon: 'magnet',
        x: muzzle(p, 10),
        y: p.y + 9,
        w: 10,
        h: 8,
        vx: p.facing * 3.4,
        vy: 0,
        life: 110,
        dmg: 2,
        bossDmg: 2,
        red: p.magRed,
      });
      tone(700, 900, 0.08, 'square', 0.1);
    },
    charge(p) {
      if (countShots('polecrush')) return false;
      addShot({
        kind: 'polecrush',
        weapon: 'magnet',
        x: muzzle(p, 24),
        y: p.y + 1,
        w: 24,
        h: 20,
        vx: p.facing * 2.6,
        life: 100,
        dmg: 3,
        bossDmg: 4,
        pierce: true,
        charged: true,
      });
      tone(120, 240, 0.4, 'square', 0.12);
    },
    ultra() {
      // the aurora: its curtains fill the sky and its magnetic storm slams every enemy down, again and again
      breakSealsInView('magnet');
      addShot({
        kind: 'aurora',
        weapon: 'magnet',
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        life: 130,
        dmg: 0,
        pierce: true,
        charged: true,
        ultra: true,
        offscreen: true,
      });
      tone(400, 800, 1.2, 'triangle', 0.12);
    },
  },
  astral: {
    name: 'ASTRAL GATE',
    short: 'A.GATE',
    pal: { B: '#c89828', b: '#fcf0b8', S: SKIN },
    glow: '#f8e088',
    lit: true,
    desc: 'MASUK PORTAL, MUNCUL DI BELAKANG MUSUH',
    charged: 'RIFT SLASH',
    demo: { kind: 'agate', w: 10, h: 10, vx: 1 },
    fire(p) {
      if (countShots('agate') >= 2) return false;
      // into a gate at the muzzle, out of one on the far side of the nearest foe ahead, flying back through it
      const f = p.facing,
        t = nearestFoe(pcx(), pcy(), 230, f),
        x0 = muzzle(p, 10);
      let x = x0,
        y = p.y + 8,
        vx = f * 4.6;
      if (t) {
        x = t.cx + f * (t.o.w / 2 + 18) - 5;
        y = t.cy - 5;
        vx = -f * 4.6;
        if (solidPx(x + 5, y + 5)) {
          x = x0;
          y = p.y + 8;
          vx = f * 4.6;
        }
      }
      addShot({
        kind: 'agate',
        weapon: 'astral',
        x,
        y,
        w: 10,
        h: 10,
        vx,
        dmg: 2,
        bossDmg: 2,
        gx: x0 + 5,
        gy: p.y + 13,
        out: !!t,
      });
      sfx.warp();
    },
    charge(p) {
      if (countShots('rift')) return false;
      // two gates: at the muzzle and up to 11 tiles ahead (or at the first wall); a blade of starlight between them
      const f = p.facing,
        y = p.y + 5,
        x0 = pcx() + f * 12;
      let x1 = x0;
      for (let k = 0; k < 176; k += 4) {
        if (solidPx(x0 + f * k, y + 6)) break;
        x1 = x0 + f * k;
      }
      addShot({
        kind: 'rift',
        weapon: 'astral',
        x: Math.min(x0, x1),
        y,
        w: Math.max(16, Math.abs(x1 - x0)),
        h: 12,
        life: 30,
        dmg: 4,
        bossDmg: 4,
        pierce: true,
        charged: true,
        delay: 10,
        a: x0,
        b: x1,
      });
      sfx.warp();
    },
    ultra() {
      // gates open across the sky and starlight pours through them onto every foe
      breakSealsInView('astral');
      addShot({
        kind: 'starfall',
        weapon: 'astral',
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        life: 100,
        dmg: 0,
        pierce: true,
        charged: true,
        ultra: true,
        offscreen: true,
      });
      sfx.warp();
    },
  },
});

Object.assign(SHOT_KINDS, {
  // a little black hole drifting forward: it draws enemies and bullets in, and caves in at the end
  gwell: {
    update(s) {
      s.x += s.vx;
      s.vx *= 0.985;
      const cx = s.x + 6,
        cy = s.y + 6;
      for (const e of enemies) if (!e.dead && !e.hidden && !EN[e.type].fixed) pullToward(e, cx, cy, 44, 0.6);
      swallowShots(cx, cy, 16);
      if (s.t % 12 === 0) for (const e of [...s.hits]) if (!bosses.includes(e)) s.hits.delete(e);
      if (--s.life <= 0 || solidPx(cx, cy)) {
        s.dead = true;
        burstAt(cx, cy, 26, 'gravity', 2, 0);
        boom(cx, cy);
      }
    },
    draw(s, x, y) {
      glow(x + 6, y + 6, 14, '#9878f8', 0.6);
      ctx.strokeStyle = '#c8b8fc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x + 6, y + 6, 8, 3, s.t * 0.15, 0, 7);
      ctx.stroke();
      circle(x + 6, y + 6, 4.5, '#000000');
      R(x + 4, y + 2, 2, 1, '#e8d8fc');
    },
  },
  // Event Horizon: a big black hole that drifts to a stop, holds every enemy near it and crushes them, then collapses
  ehorizon: {
    update(s) {
      s.x += s.vx;
      s.vx *= 0.94;
      const cx = s.x + 14,
        cy = s.y + 14;
      for (const e of enemies) if (!e.dead && !e.hidden && !EN[e.type].fixed) pullToward(e, cx, cy, 72, 1.3);
      swallowShots(cx, cy, 42);
      if (s.t % 10 === 0) for (const e of [...s.hits]) if (!bosses.includes(e)) s.hits.delete(e);
      if (s.t % 4 === 0) {
        const a = Math.random() * 6.28;
        part({
          kind: 'spark',
          x: cx + Math.cos(a) * 40,
          y: cy + Math.sin(a) * 40,
          vx: -Math.cos(a) * 2,
          vy: -Math.sin(a) * 2,
          life: 18,
        });
      }
      if (--s.life <= 0) {
        s.dead = true;
        burstAt(cx, cy, 50, 'gravity', 4, 3, { charged: true });
        boom(cx, cy);
        game.shake = Math.max(game.shake, 6);
        sfx.bigBoom();
      }
    },
    draw(s, x, y) {
      const k = Math.min(1, s.t / 12);
      glow(x + 14, y + 14, 40 * k, '#7858d8', 0.55);
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = i & 1 ? 'rgba(232,216,252,0.8)' : 'rgba(152,120,248,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x + 14, y + 14, 18 * k, 6 * k, s.t * 0.12 + i * 2, 0, Math.PI * 1.5);
        ctx.stroke();
      }
      circle(x + 14, y + 14, 10 * k, '#000000');
    },
  },
  // Singularity: drawn toward one point for a while (bullets swallowed, foes hurt), then it collapses
  singularity: {
    offscreen: true,
    update(s) {
      const cx = s.x,
        cy = s.y;
      for (const e of enemies)
        if (!e.dead && !e.hidden && onScreen(e.x + e.w / 2, e.y + e.h / 2, 0) && !EN[e.type].fixed)
          pullToward(e, cx, cy, 400, 1.8);
      swallowShots(cx, cy, 400);
      if (s.t % 22 === 0) areaHit('gravity', 2, 2);
      if (--s.life <= 0) {
        s.dead = true;
        areaHit('gravity', 8, 6);
        game.flash = 8;
        game.shake = 14;
        sfx.bigBoom();
        for (let i = 0; i < 4; i++) boom(cx + (Math.random() - 0.5) * 40, cy + (Math.random() - 0.5) * 30);
      }
    },
    draw(s) {
      const x = s.x - camX,
        y = s.y - camY,
        k = Math.min(1, s.t / 20);
      // the light of the whole screen bending in: rays drawn toward the point
      ctx.strokeStyle = 'rgba(200,184,252,0.35)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + s.t * 0.02,
          r1 = 200 - ((s.t * 6 + i * 23) % 180);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
        ctx.lineTo(x + Math.cos(a) * (r1 + 16), y + Math.sin(a) * (r1 + 16));
        ctx.stroke();
      }
      glow(x, y, 60 * k, '#5838b8', 0.6);
      ctx.strokeStyle = '#e8d8fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, 26 * k, 8 * k, s.t * 0.08, 0, 7);
      ctx.stroke();
      circle(x, y, 14 * k, '#000000');
    },
  },
  // a homing magnet: it steers toward the nearest foe
  pmag: {
    update(s) {
      const t = nearestFoe(s.x + 5, s.y + 4, 170);
      let sp = Math.hypot(s.vx, s.vy) || 3.4,
        a = Math.atan2(s.vy, s.vx);
      if (t) {
        const want = Math.atan2(t.cy - (s.y + 4), t.cx - (s.x + 5));
        let d = want - a;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        a += clamp(d, -0.12, 0.12);
      }
      sp = 3.4;
      s.vx = Math.cos(a) * sp;
      s.vy = Math.sin(a) * sp;
      s.x += s.vx;
      s.y += s.vy;
      if (s.t % 3 === 0) part({ kind: 'spark', x: s.x + 5, y: s.y + 4, vx: 0, vy: 0, life: 8 });
      if (--s.life <= 0 || solidPx(s.x + 5, s.y + 4)) s.dead = true;
    },
    draw(s, x, y) {
      const col = s.red ? '#e84858' : '#3878d8';
      glow(x + 5, y + 4, 8, col, 0.5);
      R(x + 1, y + 1, 8, 6, col);
      R(x + 1, y + 1, 8, 2, '#d8dce8');
      R(x + 3, y + 3, 4, 4, '#14181e');
    },
  },
  // Pole Crush: a great magnet that flies on, stops, drags every enemy in and slams them together
  polecrush: {
    update(s) {
      const cx = s.x + 12,
        cy = s.y + 10;
      if (s.t < 30) {
        s.x += s.vx;
        if (solidPx(cx + Math.sign(s.vx) * 12, cy)) s.t = 30;
      } else {
        for (const e of enemies) if (!e.dead && !e.hidden && !EN[e.type].fixed) pullToward(e, cx, cy, 80, 1.8);
        swallowShots(cx, cy, 30);
        if (s.t % 6 === 0) spark(cx + (Math.random() - 0.5) * 30, cy + (Math.random() - 0.5) * 24);
      }
      if (s.t % 15 === 0) for (const e of [...s.hits]) if (!bosses.includes(e)) s.hits.delete(e);
      if (--s.life <= 0) {
        s.dead = true;
        burstAt(cx, cy, 34, 'magnet', 6, 4, { charged: true });
        game.shake = Math.max(game.shake, 6);
        sfx.bigBoom();
        debris(cx, cy, '#98a8b8', 10, 2.6);
      }
    },
    draw(s, x, y) {
      const on = s.t >= 30;
      if (on) glow(x + 12, y + 10, 30, (s.t >> 2) & 1 ? '#e84858' : '#3878d8', 0.45);
      R(x + 1, y, 8, 15, '#e84858');
      R(x + 15, y, 8, 15, '#3878d8');
      R(x + 1, y + 14, 22, 6, '#8890a0');
      R(x + 1, y, 8, 4, '#d8dce8');
      R(x + 15, y, 8, 4, '#d8dce8');
      R(x + 3, y + 5, 2, 7, '#f8a8b0');
      R(x + 17, y + 5, 2, 7, '#a8d0fc');
    },
  },
  // Aurora: ribbons of light across the sky; every 22 frames its storm slams every enemy (and boss) on screen
  aurora: {
    offscreen: true,
    update(s) {
      if (s.t % 22 === 11) {
        areaHit('magnet', 3, 3);
        swallowShots(camX + VW / 2, camY + VH / 2, 400);
        game.shake = Math.max(game.shake, 4);
        sfx.zap();
        s.slam = 8;
      }
      if (s.slam > 0) s.slam--;
      if (--s.life <= 0) s.dead = true;
    },
    draw(s) {
      const k = Math.min(1, s.t / 16, s.life / 16);
      for (const [y0, col] of [
        [24, 'rgba(88,248,168,'],
        [44, 'rgba(232,104,184,'],
        [34, 'rgba(120,200,252,'],
      ])
        for (let x = 0; x < VW; x += 3) {
          const y = y0 + Math.sin(x * 0.03 + s.t * 0.08 + y0) * 10;
          ctx.fillStyle = col + (0.35 * k).toFixed(2) + ')';
          ctx.fillRect(x, y, 3, 34 + Math.sin(x * 0.05 + s.t * 0.05) * 10);
        }
      if (s.slam > 0)
        for (const e of enemies) {
          if (e.dead || e.hidden || !onScreen(e.x + e.w / 2, e.y + e.h / 2, 0)) continue;
          const x = e.x + e.w / 2 - camX;
          ctx.globalAlpha = s.slam / 8;
          R(x - 2, 0, 4, e.y + e.h - camY, '#a8fcd8');
          ctx.globalAlpha = 1;
        }
    },
  },
  // a star out of a gate: from the far side of a foe, it flies back through it (shields face the other way)
  agate: {
    update(s) {
      s.x += s.vx;
      if (s.t % 2 === 0) part({ kind: 'spark', x: s.x + 5, y: s.y + 5, vx: -s.vx * 0.1, vy: 0, life: 10 });
      if (solidPx(s.x + 5, s.y + 5) && s.t > 2) s.dead = true;
    },
    draw(s, x, y) {
      if (s.t < 10) {
        // the gates: where it went in, and where it comes out
        const k = 1 - s.t / 10;
        ctx.strokeStyle = 'rgba(248,216,120,' + k.toFixed(2) + ')';
        ctx.lineWidth = 2;
        if (s.out) {
          ctx.beginPath();
          ctx.ellipse(s.gx - camX, s.gy - camY, 4, 9, 0, 0, 7);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.ellipse(x + 5, y + 5, 5, 11, 0, 0, 7);
        ctx.stroke();
      }
      glow(x + 5, y + 5, 10, '#f8e088', 0.6);
      R(x + 4, y, 2, 10, '#f8d878');
      R(x, y + 4, 10, 2, '#f8d878');
      R(x + 3, y + 3, 4, 4, '#fcf4c8');
    },
  },
  // Rift Slash: two gates, then a blade of starlight across everything between them
  rift: {
    update(s) {
      if (s.delay > 0) {
        s.delay--;
        return;
      }
      if (s.t % 2 === 0) spark(s.x + Math.random() * s.w, s.y + 6);
      if (--s.life <= 0) s.dead = true;
    },
    draw(s, x, y) {
      for (const gx of [s.a, s.b]) {
        ctx.strokeStyle = '#f8d878';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(gx - camX, y + 6, 5, 13, 0, 0, 7);
        ctx.stroke();
      }
      if (s.delay > 0) return;
      const k = Math.min(1, s.life / 10);
      glow(x + s.w / 2, y + 6, s.w * 0.4, '#f8e088', 0.5 * k);
      ctx.globalAlpha = k;
      R(x, y + 3, s.w, 6, '#f8d878');
      R(x, y + 5, s.w, 2, '#fcfcfc');
      ctx.globalAlpha = 1;
    },
  },
  // Starfall: gates across the top of the screen, beams of starlight falling from them onto every foe
  starfall: {
    offscreen: true,
    update(s) {
      if (s.t % 16 === 8 && s.life > 20) {
        const xs = [];
        for (const e of enemies)
          if (!e.dead && !e.hidden && onScreen(e.x + e.w / 2, e.y + e.h / 2, 0)) xs.push(e.x + e.w / 2);
        for (const b of bosses) if (bossOpen(b) && b.y > 0) xs.push(bcx(b));
        while (xs.length < 4) xs.push(camX + 24 + Math.random() * (VW - 48));
        for (const x of xs)
          addShot({
            kind: 'starbeam',
            weapon: 'astral',
            x: x - 6,
            y: camY,
            w: 12,
            h: VH,
            life: 14,
            dmg: 4,
            bossDmg: 4,
            pierce: true,
            charged: true,
            ultra: true,
          });
        sfx.zap();
      }
      if (--s.life <= 0) s.dead = true;
    },
    draw(s) {
      const k = Math.min(1, s.t / 12, s.life / 12);
      for (let i = 0; i < 8; i++) {
        const x = 24 + i * ((VW - 48) / 7),
          y = 12 + Math.sin(i * 1.7 + s.t * 0.05) * 3;
        ctx.strokeStyle = 'rgba(248,216,120,' + (0.8 * k).toFixed(2) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, 12 * k, 4 * k, 0, 0, 7);
        ctx.stroke();
      }
    },
  },
  starbeam: {
    offscreen: true,
    update(s) {
      s.y = camY;
      s.h = VH;
      if (--s.life <= 0) s.dead = true;
    },
    draw(s, x) {
      const k = s.life / 14;
      glow(x + 6, VH / 2, 24, '#f8e088', 0.3 * k);
      ctx.globalAlpha = k;
      R(x + 2, 0, 8, VH, '#f8d878');
      R(x + 5, 0, 2, VH, '#fcfcfc');
      ctx.globalAlpha = 1;
    },
  },
});

// ================= BOSSES =================
// A boss of Noctara is the hardest there is: 15x HP, short pauses, five or six attacks each, and at half HP (enraged)
// a second phase: faster, more of everything, and an attack kept for it. Each one's room is read with ROOM() (a
// boss room, or the Boss Arena); a guardian (mid-boss) reads its own from b.room.
// how high over the floor the Kranbot's rail runs: a shot fired at the top of a jump hits it, one from the floor not
const KRAN_Y = 70;
// the distance from (px, py) to the segment (x1, y1)-(x2, y2)
function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1,
    dy = y2 - y1,
    l = dx * dx + dy * dy || 1,
    t = clamp(((px - x1) * dx + (py - y1) * dy) / l, 0, 1);
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}
// an enemy shot aimed at the player from (x, y) at speed sp
function aimShot(kind, x, y, sp, dmg, extra = {}) {
  const a = Math.atan2(pcy() - y, pcx() - x);
  eshots.push(
    Object.assign(
      { kind, x: x - 5, y: y - 5, w: 10, h: 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg, t: 0, delay: 0 },
      extra,
    ),
  );
}
const pullPlayer = (dir, f) => {
  if (alive(player) && player.state !== 'climb') moveX(player, dir * f);
};

Object.assign(BOSSES, {
  gravity: {
    name: 'GRAVION',
    style: 'gravity',
    pal: { B: '#3a2c78', b: '#b898fc', S: SKIN },
    weapon: 'gravity',
    weak: 'astral',
    pose: (b, pose) =>
      b.state === 'stagger'
        ? 'hurt'
        : (b.state === 'pull' || b.state === 'hole' || b.state === 'sweep') && b.t < 40
          ? 'raise'
          : b.state === 'flip' && b.t < 50
            ? 'slam'
            : b.state === 'plunge' && b.mode === 'hover'
              ? 'hover'
              : b.vx && b.onGround && b.state === 'idle'
                ? 'run'
                : pose,
    // the floor and the room tremble before he turns its gravity over, and again before it turns back
    drawBehind(b) {
      if (b.state !== 'flip') return;
      const warn = b.t < 45 || (b.flipOn && b.t > b.flipEnd - 30);
      if (!warn || !((frameCount >> 2) & 1)) return;
      const Rm = ROOM();
      for (let x = Rm.l + 16; x < Rm.r; x += 40)
        for (const y of [Rm.ceil + 30, Rm.floor - 40]) {
          const sx = x - camX,
            sy = y - camY,
            up = !b.flipOn;
          R(sx - 3, sy + (up ? 2 : -2), 7, 1, '#c8b8fc');
          R(sx - 2, sy + (up ? 1 : -1), 5, 1, '#c8b8fc');
          R(sx, sy, 1, 1, '#ffffff');
        }
    },
    update(b, enr) {
      const Rm = ROOM(),
        dx = pcx() - bcx(b),
        far = Math.abs(dx);
      if (b.landT > 0) b.landT--;
      switch (b.state) {
        case 'idle':
          faceP(b);
          b.flipOn = false;
          b.mode = '';
          b.vx = far > 120 ? Math.sign(dx) * (enr ? 1.3 : 1) : 0;
          if (b.vx) {
            if (moveX(b, b.vx)) b.vx = 0;
            b.anim++;
          }
          physics(b);
          if (b.t > (enr ? 16 : 26)) {
            b.vx = 0;
            pickBy(
              b,
              enr
                ? { pull: 2, ring: 3, flip: 3, hole: 2, plunge: 2, sweep: 3 }
                : far < 80
                  ? { pull: 2, ring: 3, flip: 2, hole: 1, plunge: 2 }
                  : { pull: 3, ring: 2, flip: 2, hole: 3, plunge: 2 },
            );
          }
          break;
        case 'pull': {
          // a gauntlet raised: the player is drawn toward him while gravity orbs fly, then he charges
          physics(b);
          const len = enr ? 90 : 75;
          if (b.t < len) {
            faceP(b);
            pullPlayer(-Math.sign(dx), enr ? 0.95 : 0.75);
            if (b.t % (enr ? 18 : 25) === 10) {
              b.arm = 12;
              aimShot('gorb', bcx(b) + b.facing * 12, b.y + 10, 2.2, 3);
              tone(240, 120, 0.15, 'sine', 0.12);
            }
            if (b.t % 3 === 0) {
              const a = Math.random() * 6.28;
              part({
                kind: 'spark',
                x: bcx(b) + Math.cos(a) * 70,
                y: b.y + 12 + Math.sin(a) * 40,
                vx: -Math.cos(a) * 3,
                vy: -Math.sin(a) * 2,
                life: 20,
              });
            }
          } else if (b.t === len) {
            faceP(b);
            b.vx = b.facing * (enr ? 4.6 : 4);
            sfx.whoosh();
          } else if (moveX(b, b.vx) || b.t > len + 28) {
            b.vx = 0;
            game.shake = 6;
            bossToIdle(b);
          } else if (b.t % 3 === 0) dust(bcx(b), b.y + b.h, 1);
          break;
        }
        case 'ring': {
          // moons drawn up in a dome over the player, one end left open: they close in, then burst
          physics(b);
          if (b.t === 1) {
            faceP(b);
            b.arm = 24;
            const n = enr ? 9 : 7,
              open = Math.random() < 0.5 ? 0 : 1, // which end of the dome is open: the right or the left
              cx = pcx(),
              cy = Rm.floor - 6;
            for (let i = 0; i < n; i++) {
              const u = (i + (open ? 1 : 0)) / n, // the dome from the left (u 0) over to the right (u 1)
                a = Math.PI + u * Math.PI;
              eshots.push({
                kind: 'gmoon',
                cx,
                cy,
                a,
                r: 92,
                x: cx,
                y: cy,
                w: 12,
                h: 12,
                vx: 0,
                vy: 0,
                dmg: 4,
                t: 0,
                delay: 0,
                big: true,
                shrink: enr ? 0.75 : 0.6,
              });
            }
            tone(180, 360, 0.5, 'sine', 0.12);
          }
          if (b.t >= 160) bossToIdle(b);
          break;
        }
        case 'flip': {
          // a slam of both fists: the room's gravity turns over (the player falls onto the ceiling), he stays on the
          // floor firing up at them, then it turns back
          physics(b);
          const warn = 45,
            dur = enr ? 240 : 180;
          if (b.t === 1) {
            faceP(b);
            b.landT = 16;
            game.shake = 8;
            sfx.quake();
            game.roomFlip = b;
            b.flipEnd = warn + dur;
          }
          if (b.t === warn) {
            b.flipOn = true;
            tone(400, 120, 0.6, 'sawtooth', 0.12);
          }
          if (b.flipOn && b.t % (enr ? 32 : 44) === 0) {
            b.arm = 12;
            faceP(b);
            for (const da of enr ? [-0.35, 0, 0.35] : [-0.25, 0.25]) {
              const a = Math.atan2(pcy() - (b.y + 6), pcx() - bcx(b)) + da;
              eshots.push({
                kind: 'gorb',
                x: bcx(b) - 5,
                y: b.y + 1,
                w: 10,
                h: 10,
                vx: Math.cos(a) * 2.6,
                vy: Math.sin(a) * 2.6,
                dmg: 3,
                t: 0,
                delay: 0,
              });
            }
          }
          if (b.t === b.flipEnd - 30) tone(120, 400, 0.4, 'sawtooth', 0.1);
          if (b.t >= b.flipEnd) {
            b.flipOn = false;
            bossToIdle(b);
          }
          break;
        }
        case 'hole': {
          // a black hole thrown between him and the player (two when enraged), meteors lobbed while it pulls
          physics(b);
          if (b.t === 14) {
            b.arm = 18;
            const xs = enr ? [Rm.l + (Rm.r - Rm.l) * 0.33, Rm.l + (Rm.r - Rm.l) * 0.67] : [(bcx(b) + pcx()) / 2];
            for (const x of xs)
              eshots.push({
                kind: 'ghole',
                x: x - 8,
                y: Rm.floor - 56,
                w: 16,
                h: 16,
                vx: 0,
                vy: 0,
                life: 160,
                R: 120,
                dmg: 4,
                t: 0,
                delay: 0,
                harmless: true,
                big: true,
              });
            sfx.warp();
          }
          if ([50, 85, 120].includes(b.t) || (enr && b.t === 140)) {
            faceP(b);
            b.arm = 12;
            const x0 = bcx(b) + b.facing * 12;
            eshots.push({
              kind: 'gmeteor',
              x: x0 - 7,
              y: b.y,
              w: 14,
              h: 14,
              vx: clamp((leadX(20) - x0) / 38, -3.6, 3.6),
              vy: -4.6,
              grav: 0.25,
              dmg: 4,
              t: 0,
              delay: 0,
              big: true,
              solidDie: true,
            });
            sfx.rock();
          }
          if (b.t >= 175) bossToIdle(b);
          break;
        }
        case 'plunge': {
          // up to the ceiling, drifting over the player, and down on them: moonlets roll out both ways
          if (b.t === 1) {
            b.mode = 'up';
            b.vy = -7.5;
            b.onGround = false;
            sfx.whoosh();
          }
          if (b.mode === 'up') {
            b.y += b.vy;
            b.vy = Math.min(b.vy + 0.15, -1.5);
            if (b.y <= Rm.ceil + 2) {
              b.y = Rm.ceil + 2;
              b.mode = 'hover';
              b.t = 2;
            }
          } else if (b.mode === 'hover') {
            b.x = clamp(b.x + clamp(pcx() - bcx(b), -2.6, 2.6), Rm.l + 2, Rm.r - b.w - 2);
            if (b.t > (enr ? 22 : 32)) {
              b.mode = 'fall';
              b.vy = 2;
            }
          } else if (b.mode === 'fall') {
            b.vy = Math.min(b.vy + 0.6, 10);
            if (moveY(b, b.vy, false) === 1) {
              b.onGround = true;
              b.vy = 0;
              b.mode = 'land';
              b.landT = 14;
              b.t = 2; // (not 1: that starts the climb)
              game.shake = 14;
              sfx.quake();
              for (const v of enr ? [-2.8, -1.6, 1.6, 2.8] : [-2.2, 2.2])
                eshots.push({
                  kind: 'moonlet',
                  x: bcx(b) - 6,
                  y: Rm.floor - 12,
                  w: 12,
                  h: 12,
                  vx: v,
                  vy: -2,
                  dmg: 3,
                  t: 0,
                  delay: 0,
                  big: true,
                  life: 150,
                });
            }
          } else {
            physics(b);
            if (b.t > 22) {
              if (enr && !b.again) {
                // enraged: up again at once
                b.again = true;
                b.t = 0;
              } else {
                b.again = false;
                bossToIdle(b);
              }
            }
          }
          break;
        }
        case 'sweep': {
          // enraged: his three moons swell and swing round him at arm's length, a ring of rock sweeping the room
          physics(b);
          if (b.t === 1) {
            b.arm = 30;
            for (let i = 0; i < 3; i++)
              eshots.push({
                kind: 'gsweep',
                owner: b,
                a: (i * Math.PI * 2) / 3,
                r: 10,
                x: bcx(b),
                y: b.y,
                w: 16,
                h: 16,
                vx: 0,
                vy: 0,
                dmg: 4,
                t: 0,
                delay: 0,
                big: true,
              });
            tone(150, 300, 0.8, 'sawtooth', 0.1);
          }
          if (b.t >= 170) bossToIdle(b);
          break;
        }
      }
    },
  },
  magnet: {
    name: 'POLARIS',
    style: 'magnet',
    pal: { B: '#c82848', b: '#78c8f8', S: SKIN },
    weapon: 'magnet',
    weak: 'gravity',
    pose: (b, pose) =>
      b.state === 'stagger'
        ? 'hurt'
        : b.state === 'scrap' || b.state === 'aurora'
          ? b.t < 40
            ? 'raise'
            : pose
          : b.state === 'beam' || b.state === 'field' || b.state === 'grip'
            ? 'aim'
            : b.state === 'rail' && b.mode === 'glide'
              ? 'cling'
              : b.vx && b.onGround && b.state === 'idle'
                ? 'run'
                : pose,
    update(b, enr) {
      const Rm = ROOM(),
        dx = pcx() - bcx(b),
        far = Math.abs(dx);
      if (!b.pol) b.pol = 'red';
      switch (b.state) {
        case 'idle':
          faceP(b);
          b.mode = '';
          b.vx = far > 130 ? Math.sign(dx) * (enr ? 1.4 : 1.1) : 0;
          if (b.vx) {
            if (moveX(b, b.vx)) b.vx = 0;
            b.anim++;
          }
          physics(b);
          if (b.t > (enr ? 14 : 24)) {
            b.vx = 0;
            pickBy(
              b,
              far < 80
                ? { grip: 4, field: 2, beam: 2, scrap: 1, rail: 2, ...(enr ? { aurora: 2 } : {}) }
                : { field: 3, beam: 3, scrap: 3, rail: 2, ...(enr ? { aurora: 3 } : {}) },
            );
          }
          break;
        case 'field': {
          // her poles swap: red pulls the player in under magnet bolts, blue pushes them away under scrap
          physics(b);
          faceP(b);
          const len = enr ? 110 : 90;
          if (b.t === 1) {
            b.pol = b.pol === 'red' ? 'blue' : 'red';
            sfx.zap();
          }
          if (b.t < len) {
            pullPlayer((b.pol === 'red' ? -1 : 1) * Math.sign(dx), enr ? 0.9 : 0.72);
            if (b.t % (enr ? 18 : 24) === 12) {
              b.arm = 10;
              if (b.pol === 'red') aimShot('mbolt', bcx(b) + b.facing * 12, b.y + 10, 2.4, 3, { home: 0.04 });
              else aimShot('mshard', bcx(b) + b.facing * 12, b.y + 10, 4, 3, { big: true });
            }
          }
          if (b.t >= len + 10) bossToIdle(b);
          break;
        }
        case 'scrap': {
          // scrap torn out of both walls flies across the room: low lumps to jump, high ones to stay under
          physics(b);
          const waves = enr ? 6 : 4;
          if (b.t === 1) {
            b.arm = 30;
            sfx.quake();
          }
          const k = (b.t - 20) / 22;
          if (b.t >= 20 && k === Math.floor(k) && k < waves) {
            const high = k % 2 === 1;
            for (const side of [-1, 1])
              eshots.push({
                kind: 'scrapfly',
                x: side < 0 ? Rm.l + 2 : Rm.r - 18,
                y: high ? Rm.floor - 40 : Rm.floor - 13,
                w: 16,
                h: 12,
                vx: -side * (enr ? 3.4 : 2.8),
                vy: 0,
                dmg: 4,
                t: 0,
                delay: 18,
                big: true,
              });
          }
          if (b.t >= 20 + waves * 22 + 60) bossToIdle(b);
          break;
        }
        case 'rail': {
          // up onto the ceiling's rail, gliding after the player and dropping mines, then down
          if (b.t === 1) {
            b.mode = 'up';
            b.vy = -7;
            b.onGround = false;
            sfx.whoosh();
          }
          if (b.mode === 'up') {
            b.y += b.vy;
            b.vy = Math.min(b.vy + 0.2, -2);
            if (b.y <= Rm.ceil + 2) {
              b.y = Rm.ceil + 2;
              b.mode = 'glide';
              b.t = 2;
            }
          } else if (b.mode === 'glide') {
            b.x = clamp(b.x + clamp(pcx() - bcx(b), -(enr ? 2.6 : 2), enr ? 2.6 : 2), Rm.l + 2, Rm.r - b.w - 2);
            if (b.t % (enr ? 28 : 40) === 0)
              eshots.push({
                kind: 'pmine',
                x: bcx(b) - 6,
                y: b.y + 20,
                w: 12,
                h: 12,
                vx: 0,
                vy: 0.8,
                dmg: 4,
                t: 0,
                delay: 0,
                life: 240,
              });
            if (b.t > (enr ? 120 : 100)) b.mode = 'down';
          } else {
            physics(b);
            if (b.onGround) {
              game.shake = 6;
              sfx.land();
              bossToIdle(b);
            }
          }
          break;
        }
        case 'beam': {
          // both gauntlets aimed: a red beam along the floor (jump it), then a blue one at head height (stay down)
          physics(b);
          faceP(b);
          const shots = enr ? [1, 46, 82, 118] : [1, 54];
          const i = shots.indexOf(b.t);
          if (i >= 0) {
            b.arm = 20;
            const low = i % 2 === 0;
            eshots.push({
              kind: 'pbeam',
              x: Rm.l,
              y: low ? Rm.floor - 11 : Rm.floor - 32,
              w: Rm.r - Rm.l,
              h: 8,
              warn: enr ? 22 : 28,
              life: 18,
              low,
              dmg: 4,
              t: 0,
              delay: 0,
              harmless: true,
              big: true,
            });
          }
          if (b.t >= shots[shots.length - 1] + 60) bossToIdle(b);
          break;
        }
        case 'grip': {
          // a player close by is hauled in; caught, they are held, hurt and thrown back
          physics(b);
          faceP(b);
          if (b.t < 44) {
            if (far < 96) pullPlayer(-Math.sign(dx), enr ? 1.05 : 0.9);
            if (b.t % 4 === 0) spark(bcx(b) + b.facing * 14, b.y + 10);
            if (alive(player) && overlap(b, player) && !player.stun && player.inv === 0) {
              damagePlayer(4);
              player.stun = 26;
              b.t = 44;
            }
          } else if (b.t < 60) pullPlayer(Math.sign(dx), 2.2);
          if (b.t >= 70) bossToIdle(b);
          break;
        }
        case 'aurora': {
          // enraged: an aurora curtain sweeps the room; only the gap of light rippling up and down it is safe
          physics(b);
          if (b.t === 1) {
            b.arm = 40;
            const fromL = pcx() > (Rm.l + Rm.r) / 2;
            eshots.push({
              kind: 'aband',
              x: fromL ? Rm.l - 24 : Rm.r,
              y: Rm.ceil,
              w: 24,
              h: Rm.floor - Rm.ceil,
              vx: fromL ? 2.2 : -2.2,
              vy: 0,
              top: Rm.ceil,
              floor: Rm.floor,
              dmg: 4,
              t: 0,
              delay: 0,
              harmless: true,
              big: true,
            });
            tone(300, 600, 1, 'triangle', 0.1);
          }
          if (b.t >= 200) bossToIdle(b);
          break;
        }
      }
    },
  },
  astral: {
    name: 'ASTRAEA',
    style: 'astral',
    pal: { B: '#c89828', b: '#fcf0b8', S: SKIN },
    weapon: 'astral',
    weak: 'magnet',
    pose: (b, pose) =>
      b.state === 'stagger'
        ? 'hurt'
        : b.state === 'blink' && b.mode === 'kick'
          ? 'kick'
          : (b.state === 'shower' || b.state === 'const' || b.state === 'nova') && b.t < 50
            ? 'cast'
            : b.state === 'mirror'
              ? 'point'
              : b.vx && b.onGround && b.state === 'idle'
                ? 'run'
                : pose,
    update(b, enr) {
      const Rm = ROOM(),
        dx = pcx() - bcx(b),
        far = Math.abs(dx);
      switch (b.state) {
        case 'idle':
          faceP(b);
          b.mode = '';
          b.vx = far > 140 ? Math.sign(dx) * (enr ? 1.4 : 1.1) : 0;
          if (b.vx) {
            if (moveX(b, b.vx)) b.vx = 0;
            b.anim++;
          }
          physics(b);
          if (b.t > (enr ? 14 : 24)) {
            b.vx = 0;
            pickBy(
              b,
              enr
                ? { blink: 3, shower: 2, const: 3, mirror: 2, nova: 3 }
                : { blink: 3, shower: 3, const: 2, mirror: 3 },
            );
          }
          break;
        case 'blink': {
          // into a gate; a gate opens above the player (to one side); out of it she dives at them
          if (b.t === 1) {
            b.arm = 10;
            sfx.warp();
          }
          if (b.t === 12) {
            vanish(b);
            b.tx = clamp(pcx() + (Math.random() < 0.5 ? -1 : 1) * (50 + Math.random() * 30), Rm.l + 24, Rm.r - 24);
            b.ty = Rm.ceil + 6;
            eshots.push({
              kind: 'apgate',
              x: b.tx - 8,
              y: b.ty,
              w: 16,
              h: 32,
              life: enr ? 30 : 40,
              t: 0,
              delay: 0,
              harmless: true,
              big: true,
            });
          }
          if (b.t === (enr ? 40 : 50)) {
            b.x = b.tx - b.w / 2;
            b.y = b.ty;
            b.inv = 0;
            b.onGround = false;
            faceP(b);
            const a = Math.atan2(pcy() - (b.y + 12), pcx() - bcx(b));
            b.vx = Math.cos(a) * 5.2;
            b.vy = Math.max(1.5, Math.sin(a) * 5.2);
            b.mode = 'kick';
            sfx.whoosh();
          }
          if (b.mode === 'kick') {
            if (moveX(b, b.vx)) b.vx = 0;
            if (frameCount % 2 === 0) part({ kind: 'spark', x: bcx(b), y: b.y + 12, vx: 0, vy: 0, life: 12 });
            if (moveY(b, b.vy, false) === 1 || b.t > 110) {
              b.mode = '';
              b.onGround = true;
              b.vy = 0;
              game.shake = 6;
              sfx.land();
              debris(bcx(b), b.y + b.h, '#f8d878', 6, 2);
              if (enr && !b.again) {
                b.again = true;
                b.t = 0;
              } else {
                b.again = false;
                bossToIdle(b);
              }
            }
          } else if (b.t < 12) physics(b);
          break;
        }
        case 'shower': {
          // gates open in the ceiling, and each fires stars aimed at the player
          physics(b);
          if (b.t === 1) {
            b.arm = 40;
            const n = enr ? 5 : 4;
            for (let i = 0; i < n; i++) {
              const x = Rm.l + 30 + (i * (Rm.r - Rm.l - 60)) / (n - 1);
              eshots.push({
                kind: 'apgate',
                x: x - 8,
                y: Rm.ceil,
                w: 16,
                h: 32,
                life: 100,
                fire: enr ? [30, 46, 62, 78] : [34, 58, 82],
                off: i * 4,
                dmg: 3,
                t: 0,
                delay: 0,
                harmless: true,
                big: true,
              });
            }
            sfx.warp();
          }
          if (b.t >= 110) bossToIdle(b);
          break;
        }
        case 'const': {
          // a constellation: stars set about the room, linked in turn by faint lines that blaze up after a moment
          physics(b);
          if (b.t === 1) {
            b.arm = 50;
            const pts = [];
            for (let i = 0; i < (enr ? 6 : 5); i++)
              pts.push([
                Rm.l + 24 + Math.random() * (Rm.r - Rm.l - 48),
                Rm.ceil + 14 + Math.random() * (Rm.floor - Rm.ceil - 30),
              ]);
            eshots.push({
              kind: 'cline',
              pts,
              x: Rm.l,
              y: Rm.ceil,
              w: 0,
              h: 0,
              warn: enr ? 44 : 54,
              life: 24,
              dmg: 4,
              t: 0,
              delay: 0,
              harmless: true,
              big: true,
            });
            tone(880, 1320, 0.4, 'sine', 0.08);
          }
          if (b.t >= (enr ? 80 : 90)) bossToIdle(b);
          break;
        }
        case 'mirror': {
          // a beam into the gate before her comes out of a gate at the far wall, level with the player
          physics(b);
          faceP(b);
          const at = enr ? [10, 52] : [10];
          if (at.includes(b.t)) {
            b.arm = 20;
            const y = clamp(pcy() - 4, Rm.ceil + 8, Rm.floor - 12);
            eshots.push({
              kind: 'mbeam',
              x: Rm.l,
              y,
              w: Rm.r - Rm.l,
              h: 8,
              fromL: dx < 0,
              warn: 26,
              life: 18,
              dmg: 4,
              t: 0,
              delay: 0,
              harmless: true,
              big: true,
            });
            sfx.warp();
          }
          if (b.t >= at[at.length - 1] + 60) bossToIdle(b);
          break;
        }
        case 'nova': {
          // enraged: a star kindled in the middle of the room swells, then bursts into a ring of star bolts
          physics(b);
          if (b.t === 1) {
            b.arm = 60;
            eshots.push({
              kind: 'anova',
              x: (Rm.l + Rm.r) / 2 - 4,
              y: Rm.ceil + 48,
              w: 8,
              h: 8,
              life: 70,
              dmg: 4,
              t: 0,
              delay: 0,
              harmless: true,
              big: true,
            });
            tone(200, 900, 1.1, 'sine', 0.1);
          }
          if (b.t >= 120) bossToIdle(b);
          break;
        }
      }
    },
  },
  // ---- the guardians (mid-bosses: HAZARD_KINDS.midroom in actors.js), drawn by themselves ----
  // the observatory's: a ringed sphere that rolls along the floor, turns its own gravity over to roll along the
  // ceiling and drops onto the player, and fires moonlets in a cross
  planetoid: {
    name: 'PLANETOID',
    custom: true,
    steady: true,
    weak: 'elec',
    pal: { B: '#4a3c78', b: '#b898fc', S: SKIN },
    mid: { w: 28, h: 28, hp: 64, points: 5000 },
    spawn(b) {
      b.g = 1;
      b.vx = 0;
    },
    update(b, enr) {
      if (b.state !== 'idle') return;
      if (!b.vx) b.vx = (pcx() < bcx(b) ? -1 : 1) * (enr ? 2.3 : 1.7);
      b.anim += b.vx;
      if (moveX(b, b.vx)) {
        b.vx = -b.vx;
        game.shake = 3;
        sfx.land();
      }
      b.vy = b.g > 0 ? Math.min(b.vy + 0.3, 7) : Math.max(b.vy - 0.3, -7);
      const r = moveY(b, b.vy, false);
      if (r && !b.onGround) {
        game.shake = 5;
        sfx.land();
      }
      b.onGround = r === b.g || (r === 0 && b.onGround && b.vy === 0);
      if (r) b.vy = 0;
      // up onto the ceiling now and then, and down again soon (a player can only hit it on the floor)
      if (b.onGround && b.g > 0 && b.t % (enr ? 110 : 150) === 70) {
        b.g = -1;
        b.ceilT = 0;
        b.onGround = false;
        sfx.whoosh();
      } else if (b.onGround && b.g < 0 && ++b.ceilT > (enr ? 50 : 70)) {
        b.g = 1;
        b.onGround = false;
        sfx.whoosh();
      }
      if (b.g < 0 && b.onGround && Math.abs(pcx() - bcx(b)) < 12 && pcy() > b.y) {
        b.g = 1; // drops onto a player under it
        b.onGround = false;
      }
      if (b.t % (enr ? 70 : 100) === 30) {
        const dirs = [
          [2.4, 0],
          [-2.4, 0],
          [0, 2.4],
          [0, -2.4],
        ];
        if (enr) dirs.push([1.7, 1.7], [-1.7, 1.7], [1.7, -1.7], [-1.7, -1.7]);
        for (const [vx, vy] of dirs)
          eshots.push({
            kind: 'mlet',
            x: bcx(b) - 4,
            y: b.y + b.h / 2 - 4,
            w: 8,
            h: 8,
            vx,
            vy,
            dmg: 3,
            t: 0,
            delay: 0,
          });
        tone(300, 150, 0.2, 'square', 0.1);
      }
    },
    draw(b, sx, sy) {
      const cx = sx + 14,
        cy = sy + 14,
        spin = b.anim * 0.06;
      glow(cx, cy, 26, '#9878f8', 0.3);
      circle(cx, cy, 14, '#0a0818');
      circle(cx, cy, 13, '#4a3c78');
      // bands that turn as it rolls
      for (let k = -2; k <= 2; k++) {
        const y = cy + k * 5 + Math.sin(spin + k) * 1.5;
        ctx.fillStyle = k & 1 ? '#6a58a8' : '#3a2c68';
        ctx.fillRect(
          cx - Math.sqrt(Math.max(0, 169 - (y - cy) ** 2)),
          y - 1,
          2 * Math.sqrt(Math.max(0, 169 - (y - cy) ** 2)),
          2,
        );
      }
      circle(cx - 4, cy - 5, 4, 'rgba(232,216,252,0.35)');
      // its eye, on the player
      const a = Math.atan2(pcy() - (b.y + 14), pcx() - (b.x + 14));
      circle(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, 3.5, '#fcf4c8');
      circle(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, 1.5, '#e84858');
      ctx.strokeStyle = '#c8b8fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 22, 6, -0.3 * b.g, 0, 7);
      ctx.stroke();
    },
  },
  // the railway's: a crane running along a rail across the hall, just out of reach of a shot from the floor (hit it
  // from a jump); it drops scrap on the player, lifts them toward its magnet and slams its claw down to the floor
  kranbot: {
    name: 'KRANBOT',
    custom: true,
    steady: true,
    weak: 'hydro',
    pal: { B: '#5a6878', b: '#e84858', S: SKIN },
    mid: { w: 30, h: 22, hp: 64, points: 5000 },
    spawn(b) {
      b.state = 'idle';
      b.y = b.room.floor - KRAN_Y;
      b.x = (b.room.l + b.room.r) / 2 - b.w / 2;
    },
    update(b, enr) {
      const Rm = b.room;
      b.y = Rm.floor - KRAN_Y;
      const chase = s => (b.x = clamp(b.x + clamp(pcx() - bcx(b), -s, s), Rm.l + 2, Rm.r - b.w - 2));
      switch (b.state) {
        case 'idle':
          chase(enr ? 1.1 : 0.8); // slower than a run: room to get out from under it and shoot from a jump
          if (b.t > (enr ? 40 : 60)) pick(b, ['scrap', 'lift', 'claw']);
          break;
        case 'scrap':
          chase(0.7);
          if ([10, 28, 46, ...(enr ? [64] : [])].includes(b.t)) {
            eshots.push({
              kind: 'kscrap',
              x: bcx(b) - 8,
              y: b.y + 22,
              w: 16,
              h: 16,
              vx: 0,
              vy: 1,
              grav: 0.4,
              dmg: 4,
              t: 0,
              delay: 0,
              big: true,
              solidDie: true,
            });
            sfx.crumble();
          }
          if (b.t >= (enr ? 84 : 70)) bossToIdle(b);
          break;
        case 'lift':
          // its magnet pulls a player under it up toward the claw
          if (b.t < (enr ? 80 : 64) && alive(player) && Math.abs(pcx() - bcx(b)) < 64 && player.state !== 'climb') {
            player.vy = Math.max(player.vy - 0.42, -3);
            player.onGround = false;
            pullPlayer(Math.sign(bcx(b) - pcx()), 0.5);
          }
          if (b.t >= 90) bossToIdle(b);
          break;
        case 'claw':
          if (b.t < 30) chase(1.4);
          if (b.t === 30)
            eshots.push({
              kind: 'kclaw',
              x: bcx(b) - 8,
              y: b.y + 18,
              w: 16,
              h: 0,
              top: b.y + 18,
              floor: Rm.floor,
              life: 34,
              dmg: 5,
              t: 0,
              delay: 0,
              big: true,
            });
          if (b.t >= 70) bossToIdle(b);
          break;
      }
    },
    draw(b, sx, sy) {
      const lifting = b.state === 'lift';
      // the rail across the hall, the carriage on it, the magnet disc under it
      R(b.room.l - camX, sy - 6, b.room.r - b.room.l, 4, '#2a3038');
      R(b.room.l - camX, sy - 6, b.room.r - b.room.l, 1, '#6a7888');
      R(sx, sy - 2, b.w, 10, '#5a6878');
      R(sx + 2, sy, b.w - 4, 2, '#98a8b8');
      R(sx + 4, sy + 8, b.w - 8, 4, '#3a4654');
      R(sx + 6, sy + 12, b.w - 12, 8, lifting && frameCount & 4 ? '#f86878' : '#c83848');
      R(sx + 6, sy + 12, b.w - 12, 2, '#f8a8b0');
      if (lifting) glow(sx + b.w / 2, sy + 18, 28, '#e84858', 0.4);
      if (b.state === 'claw' && b.t < 30 && (frameCount >> 2) & 1) {
        // a warning line down to the floor
        ctx.globalAlpha = 0.4;
        R(sx + b.w / 2 - 1, sy + 20, 2, b.room.floor - b.y - 20, '#f86878');
        ctx.globalAlpha = 1;
      }
      R(sx + 10, sy + 2, 3, 3, '#f8d878');
      R(sx + b.w - 13, sy + 2, 3, 3, '#f8d878');
    },
  },
  // the sky temple's: a floating star gate with an eye in it; it jumps through itself from place to place,
  // bursting into star bolts where it comes out, rings them round itself and fires a beam along a warning line
  warden: {
    name: 'WARDEN',
    custom: true,
    steady: true,
    weak: 'light',
    pal: { B: '#c89828', b: '#f8d878', S: SKIN },
    mid: { w: 24, h: 24, hp: 64, points: 5000 },
    spawn(b) {
      b.state = 'idle';
      b.y = b.room.floor - 64;
      b.x = (b.room.l + b.room.r) / 2 + 40;
      b.baseY = b.y;
    },
    update(b, enr) {
      const Rm = b.room;
      b.y = b.baseY + Math.sin(b.t * 0.06) * 3;
      switch (b.state) {
        case 'idle':
          if (b.t > (enr ? 34 : 54)) pick(b, ['jump', 'ring', 'beam']);
          break;
        case 'jump':
          if (b.t === 1) {
            for (let i = 0; i < 8; i++) {
              b.gx = Rm.l + 20 + Math.random() * (Rm.r - Rm.l - 64);
              b.gy = Rm.floor - 30 - Math.random() * 44; // low enough to shoot from a jump, or the floor
              if (Math.abs(b.gx + 12 - pcx()) > 70) break;
            }
            eshots.push({
              kind: 'apgate',
              x: b.gx + 4,
              y: b.gy - 4,
              w: 16,
              h: 32,
              life: 26,
              t: 0,
              delay: 0,
              harmless: true,
              big: true,
            });
            sfx.warp();
          }
          if (b.t === 24) {
            b.x = b.gx;
            b.baseY = b.gy;
            b.y = b.gy;
            const n = enr ? 12 : 8;
            for (let i = 0; i < n; i++) {
              const a = (i / n) * Math.PI * 2;
              eshots.push({
                kind: 'sbolt',
                x: bcx(b) - 4,
                y: b.y + 8,
                w: 8,
                h: 8,
                vx: Math.cos(a) * 2.2,
                vy: Math.sin(a) * 2.2,
                dmg: 3,
                t: 0,
                delay: 0,
              });
            }
          }
          if (b.t >= 44) bossToIdle(b);
          break;
        case 'ring':
          if ([10, 34, 58].includes(b.t)) {
            const n = enr ? 10 : 7,
              off = b.t * 0.13;
            for (let i = 0; i < n; i++) {
              const a = off + (i / n) * Math.PI * 2;
              eshots.push({
                kind: 'sbolt',
                x: bcx(b) - 4,
                y: b.y + 8,
                w: 8,
                h: 8,
                vx: Math.cos(a) * 1.8,
                vy: Math.sin(a) * 1.8,
                dmg: 3,
                t: 0,
                delay: 0,
              });
            }
            sfx.eshoot();
          }
          if (b.t >= 80) bossToIdle(b);
          break;
        case 'beam':
          if (b.t === 1) {
            const a = Math.atan2(pcy() - (b.y + 12), pcx() - bcx(b));
            eshots.push({
              kind: 'cline',
              pts: [
                [bcx(b), b.y + 12],
                [bcx(b) + Math.cos(a) * 420, b.y + 12 + Math.sin(a) * 420],
              ],
              x: b.x,
              y: b.y,
              w: 0,
              h: 0,
              warn: enr ? 26 : 34,
              life: 18,
              dmg: 4,
              t: 0,
              delay: 0,
              harmless: true,
              big: true,
            });
          }
          if (b.t >= 70) bossToIdle(b);
          break;
      }
    },
    draw(b, sx, sy) {
      const cx = sx + 12,
        cy = sy + 12;
      glow(cx, cy, 24, '#f8d878', 0.35);
      ctx.strokeStyle = '#f8d878';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 11, 12, 0, 0, 7);
      ctx.stroke();
      ctx.fillStyle = 'rgba(12,8,40,0.85)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 9, 10, 0, 0, 7);
      ctx.fill();
      for (let k = 0; k < 4; k++) {
        const a = b.t * 0.05 + (k * Math.PI) / 2;
        R(cx + Math.cos(a) * 14 - 1, cy + Math.sin(a) * 15 - 1, 2, 2, '#fcf4c8');
      }
      const a = Math.atan2(pcy() - (b.y + 12), pcx() - (b.x + 12));
      circle(cx + Math.cos(a) * 3, cy + Math.sin(a) * 3, 4, '#fcf4c8');
      circle(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, 2, '#5848c8');
    },
  },
});

// ================= ENEMY / BOSS SHOTS =================
Object.assign(ESHOT_KINDS, {
  gorb: {
    draw(s, x, y) {
      glow(x + 5, y + 5, 10, '#9878f8', 0.6);
      circle(x + 5, y + 5, 4.5, '#140a2a');
      circle(x + 5, y + 5, 3, '#7858d8');
      R(x + 3, y + 2, 2, 1, '#e8d8fc');
    },
  },
  // a moon of Gravion's dome over the player: closing in on the dome's centre, then bursting outward
  gmoon: {
    pierce: true,
    update(s) {
      s.r -= s.shrink;
      s.a += 0.004;
      s.x = s.cx + Math.cos(s.a) * s.r - 6;
      s.y = s.cy + Math.sin(s.a) * s.r * 0.8 - 6;
      if (s.r < 14) {
        s.dead = true;
        const a = Math.atan2(s.y + 6 - s.cy, s.x + 6 - s.cx);
        eshots.push({
          kind: 'gorb',
          x: s.x + 1,
          y: s.y + 1,
          w: 10,
          h: 10,
          vx: Math.cos(a) * 2.6,
          vy: Math.sin(a) * 2.6,
          dmg: 3,
          t: 0,
          delay: 0,
        });
      }
    },
    draw(s, x, y) {
      glow(x + 6, y + 6, 10, '#c8b8fc', 0.35);
      circle(x + 6, y + 6, 6, '#3a3058');
      circle(x + 6, y + 6, 5, '#8878b8');
      circle(x + 4, y + 4, 2, '#c8b8fc');
      R(x + 7, y + 7, 2, 1, '#4a3c78');
    },
  },
  // Gravion's black hole: pulls the player in, its core hurts; gone after its life
  ghole: {
    pierce: true,
    update(s) {
      if (--s.life <= 0) s.dead = true;
      if (!alive(player) || game.timeStop > 0) return;
      const cx = s.x + 8,
        cy = s.y + 8,
        dx = cx - pcx(),
        dy = cy - pcy(),
        d = Math.hypot(dx, dy) || 1;
      if (d < s.R) {
        const f = 0.3 + 0.62 * (1 - d / s.R);
        pullPlayer(Math.sign(dx), Math.min(f, Math.abs(dx)));
        if (player.state !== 'climb') player.vy += (dy / d) * f * 0.1;
        if (d < 11) damagePlayer(s.dmg);
      }
    },
    draw(s, x, y) {
      const k = Math.min(1, s.t / 14, s.life / 14);
      glow(x + 8, y + 8, 40 * k, '#5838b8', 0.45);
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = i & 1 ? 'rgba(232,216,252,0.75)' : 'rgba(152,120,248,0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(x + 8, y + 8, 16 * k, 6 * k, frameCount * 0.07 + i * 2.1, 0, Math.PI * 1.4);
        ctx.stroke();
      }
      circle(x + 8, y + 8, 9 * k, '#000000');
    },
  },
  gmeteor: {
    draw(s, x, y) {
      glow(x + 7, y + 7, 12, '#9878f8', 0.4);
      circle(x + 7, y + 7, 7, '#1a1430');
      circle(x + 7, y + 7, 6, '#5a4a88');
      circle(x + 5, y + 5, 2.5, '#8878b8');
      R(x + 8, y + 9, 2, 2, '#2a2048');
    },
  },
  // a moonlet rolling along the floor away from where Gravion landed, bouncing
  moonlet: {
    pierce: true,
    update(s) {
      s.vy = Math.min(s.vy + 0.3, 6);
      s.x += s.vx;
      if (moveY(s, s.vy, false) === 1) s.vy = -2.4;
      if (solidPx(s.vx > 0 ? s.x + s.w : s.x, s.y + 6)) s.vx = -s.vx;
      if (--s.life <= 0) s.dead = true;
    },
    draw(s, x, y) {
      circle(x + 6, y + 6, 6, '#2a2048');
      circle(x + 6, y + 6, 5, '#8878b8');
      circle(x + 4, y + 4, 1.5, '#e8d8fc');
    },
  },
  // Gravion's three moons swung round him: out to arm's length, once round the room (riding along the floor where
  // the circle dips below it), then they fall away
  gsweep: {
    pierce: true,
    update(s) {
      const o = s.owner;
      if (!bosses.includes(o) || o.state !== 'sweep') {
        s.dead = true;
        debris(s.x + 8, s.y + 8, '#8878b8', 5, 2);
        return;
      }
      const Rm = ROOM();
      s.r = Math.min(88, s.r + 1.8);
      s.a += o.hp <= o.maxHp / 2 ? 0.045 : 0.035;
      s.x = bcx(o) + Math.cos(s.a) * s.r - 8;
      s.y = Math.min(o.y + 8 + Math.sin(s.a) * s.r * 0.8, Rm.floor - 8) - 8;
    },
    draw(s, x, y) {
      glow(x + 8, y + 8, 14, '#9878f8', 0.4);
      circle(x + 8, y + 8, 8, '#2a2048');
      circle(x + 8, y + 8, 7, '#6a5aa8');
      circle(x + 5, y + 5, 3, '#a898d8');
    },
  },
  // a red magnet bolt that drifts after the player a little
  mbolt: {
    update(s) {
      const a = Math.atan2(pcy() - (s.y + 5), pcx() - (s.x + 5)),
        cur = Math.atan2(s.vy, s.vx);
      let d = a - cur;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      const na = cur + clamp(d, -(s.home || 0.03), s.home || 0.03),
        sp = Math.hypot(s.vx, s.vy);
      s.vx = Math.cos(na) * sp;
      s.vy = Math.sin(na) * sp;
      s.x += s.vx;
      s.y += s.vy;
      if (s.t > 160) s.dead = true;
    },
    draw(s, x, y) {
      glow(x + 5, y + 5, 9, '#e84858', 0.6);
      R(x + 1, y + 2, 8, 6, '#e84858');
      R(x + 1, y + 2, 8, 2, '#f8c8d0');
    },
  },
  mshard: {
    draw(s, x, y) {
      R(x + 1, y + 2, 8, 6, '#3878d8');
      R(x + 2, y + 2, 6, 2, '#a8d0fc');
      R(x + 3, y + 5, 3, 2, '#1c2a48');
    },
  },
  // scrap torn from a wall, flying across the room (a glint on the wall first)
  scrapfly: {
    draw(s, x, y) {
      if (s.delay > 0) {
        if ((frameCount >> 2) & 1) glow(x + 8, y + 6, 12, '#f86878', 0.7);
        return;
      }
      R(x, y, 16, 12, '#2a3038');
      R(x + 1, y + 1, 14, 10, '#7888a0');
      R(x + 3, y + 2, 6, 3, '#a8b8c8');
      R(x + 10, y + 6, 3, 3, '#4a5868');
    },
  },
  // Polaris's mine: sinks from the rail, drifts after the player, and bursts on its own after a while
  pmine: {
    update(s) {
      const dx = pcx() - (s.x + 6),
        dy = pcy() - (s.y + 6),
        d = Math.hypot(dx, dy) || 1;
      s.x += (dx / d) * 0.55;
      s.y += (dy / d) * 0.55 + 0.2;
      if (solidPx(s.x + 6, s.y + 12)) s.y -= 0.75;
      if (--s.life <= 0) {
        s.dead = true;
        boom(s.x + 6, s.y + 6);
      }
    },
    draw(s, x, y) {
      glow(x + 6, y + 6, 11, '#e84858', 0.4);
      circle(x + 6, y + 6, 6, '#14181e');
      circle(x + 6, y + 6, 5, '#5a6878');
      circle(x + 6, y + 6, 2, (s.t >> 3) & 1 ? '#e84858' : '#fcfcfc');
    },
  },
  // a beam across the room: a thin warning line, then it fires
  pbeam: {
    pierce: true,
    update(s) {
      if (s.warn > 0) {
        if (--s.warn === 0) {
          s.harmless = false;
          sfx.zap();
        }
        return;
      }
      if (--s.life <= 0) s.dead = true;
    },
    draw(s, x, y) {
      const col = s.low ? '#e84858' : '#3878d8';
      if (s.warn > 0) {
        if ((frameCount >> 1) & 1) R(x, y + 3, s.w, 1, col);
        return;
      }
      glow(x + s.w / 2, y + 4, s.w * 0.3, col, 0.4);
      R(x, y, s.w, s.h, col);
      R(x, y + 3, s.w, 2, '#fcfcfc');
    },
  },
  // the aurora curtain sweeping the room: all of it hurts but the gap of light, which ripples up and down
  aband: {
    pierce: true,
    update(s) {
      s.x += s.vx;
      const gap = s.floor - 22 - (Math.sin(s.t * 0.05) * 0.5 + 0.5) * 80;
      s.gap = gap;
      if (alive(player) && pcx() > s.x && pcx() < s.x + s.w && (player.y < gap - 22 || player.y + player.h > gap + 26))
        damagePlayer(s.dmg);
      if (s.t > 300) s.dead = true;
    },
    draw(s, x) {
      const g = s.gap - camY,
        top = s.top - camY,
        fl = s.floor - camY;
      for (const [y0, y1] of [
        [top, g - 22],
        [g + 26, fl],
      ]) {
        ctx.fillStyle = 'rgba(88,248,168,0.45)';
        ctx.fillRect(x, y0, s.w, y1 - y0);
        ctx.fillStyle = 'rgba(232,104,184,0.35)';
        ctx.fillRect(x + 6, y0, 8, y1 - y0);
      }
      R(x, g - 22, s.w, 1, '#fcfcfc');
      R(x, g + 26, s.w, 1, '#fcfcfc');
    },
  },
  // a star gate in the air: Astraea comes out of it, or it fires stars aimed at the player
  apgate: {
    pierce: true,
    update(s) {
      if (s.fire && s.fire.includes(s.t - (s.off || 0))) {
        aimShot('sbolt', s.x + 8, s.y + 16, 3, s.dmg || 3, { w: 8, h: 8 });
        sfx.eshoot();
      }
      if (--s.life <= 0) s.dead = true;
    },
    draw(s, x, y) {
      const k = Math.min(1, s.t / 10, s.life / 8);
      glow(x + 8, y + 16, 18, '#f8d878', 0.4 * k);
      ctx.strokeStyle = '#f8d878';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x + 8, y + 16, 6 * k, 14 * k, 0, 0, 7);
      ctx.stroke();
      ctx.fillStyle = 'rgba(12,8,40,0.7)';
      ctx.beginPath();
      ctx.ellipse(x + 8, y + 16, 5 * k, 13 * k, 0, 0, 7);
      ctx.fill();
    },
  },
  sbolt: {
    draw(s, x, y) {
      glow(x + 4, y + 4, 8, '#f8d878', 0.6);
      R(x + 3, y, 2, 8, '#fcf4c8');
      R(x, y + 3, 8, 2, '#fcf4c8');
      R(x + 2, y + 2, 4, 4, '#f8d878');
    },
  },
  // a constellation: lines between its stars, faint while they warn, burning when they fire
  cline: {
    pierce: true,
    update(s) {
      if (s.warn > 0) {
        if (--s.warn === 0) sfx.zap();
        return;
      }
      if (alive(player))
        for (let i = 0; i < s.pts.length - 1; i++)
          if (segDist(pcx(), pcy(), ...s.pts[i], ...s.pts[i + 1]) < 9) {
            damagePlayer(s.dmg);
            break;
          }
      if (--s.life <= 0) s.dead = true;
    },
    draw(s) {
      const on = s.warn <= 0,
        P = s.pts.map(([x, y]) => [x - camX, y - camY]);
      ctx.strokeStyle = on ? '#fcf4c8' : (frameCount >> 2) & 1 ? 'rgba(248,216,120,0.5)' : 'rgba(248,216,120,0.25)';
      ctx.lineWidth = on ? 4 : 1;
      ctx.beginPath();
      P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      if (on) {
        ctx.strokeStyle = 'rgba(248,216,120,0.5)';
        ctx.lineWidth = 9;
        ctx.beginPath();
        P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
      for (const [x, y] of P) {
        glow(x, y, 8, '#f8d878', 0.6);
        R(x - 3, y, 7, 1, '#fcfcfc');
        R(x, y - 3, 1, 7, '#fcfcfc');
      }
    },
  },
  // a beam out of a gate at the far wall, level with where the player stood
  mbeam: {
    pierce: true,
    update(s) {
      if (s.warn > 0) {
        if (--s.warn === 0) {
          s.harmless = false;
          sfx.zap();
        }
        return;
      }
      if (--s.life <= 0) s.dead = true;
    },
    draw(s, x, y) {
      const gx = s.fromL ? x + 6 : x + s.w - 6;
      ctx.strokeStyle = '#f8d878';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(gx, y + 4, 5, 12, 0, 0, 7);
      ctx.stroke();
      if (s.warn > 0) {
        if ((frameCount >> 1) & 1) R(x, y + 3, s.w, 1, 'rgba(248,216,120,0.7)');
        return;
      }
      glow(x + s.w / 2, y + 4, s.w * 0.3, '#f8d878', 0.4);
      R(x, y, s.w, s.h, '#f8d878');
      R(x, y + 3, s.w, 2, '#fcfcfc');
    },
  },
  // a star swelling in the middle of the room, then bursting into a ring of star bolts
  anova: {
    pierce: true,
    update(s) {
      const r = 4 + (s.t / 70) * 18;
      if (alive(player) && Math.hypot(pcx() - (s.x + 4), pcy() - (s.y + 4)) < r + 6) damagePlayer(s.dmg);
      if (--s.life <= 0) {
        s.dead = true;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          eshots.push({
            kind: 'sbolt',
            x: s.x,
            y: s.y,
            w: 8,
            h: 8,
            vx: Math.cos(a) * 2.4,
            vy: Math.sin(a) * 2.4,
            dmg: 3,
            t: 0,
            delay: 0,
          });
        }
        boom(s.x + 4, s.y + 4);
        game.shake = 8;
        sfx.bigBoom();
      }
    },
    draw(s, x, y) {
      const r = 4 + (s.t / 70) * 18;
      glow(x + 4, y + 4, r * 2.4, '#f8d878', 0.6);
      circle(x + 4, y + 4, r, '#fcf4c8');
      circle(x + 4, y + 4, r * 0.6, '#ffffff');
    },
  },
  // the planetoid's moonlets
  mlet: {
    draw(s, x, y) {
      circle(x + 4, y + 4, 4, '#3a3058');
      circle(x + 4, y + 4, 3, '#a898d8');
    },
  },
  // the crane's scrap, falling onto the player
  kscrap: {
    draw(s, x, y) {
      R(x, y, 16, 16, '#2a3038');
      R(x + 1, y + 1, 14, 14, '#6a7888');
      R(x + 3, y + 3, 6, 3, '#98a8b8');
      R(x + 9, y + 9, 4, 4, '#4a5868');
    },
  },
  // the crane's claw slamming down to the floor
  kclaw: {
    pierce: true,
    update(s) {
      const k = Math.min(1, s.t / 5);
      s.h = (s.floor - s.top) * k;
      if (s.t === 5) {
        game.shake = 8;
        sfx.quake();
        dust(s.x + 8, s.floor, 4);
      }
      if (--s.life <= 0) s.dead = true;
    },
    draw(s, x, y) {
      R(x + 6, y, 4, s.h - 8, '#5a6878');
      R(x, y + s.h - 10, 16, 10, '#c83848');
      R(x, y + s.h - 10, 16, 2, '#f8a8b0');
    },
  },
});

// ================= LAYOUTS =================
// Each stage has a route of its own (see levels.js). Noctara's are the hardest: a guardian's room halfway through
// (HAZARD_KINDS.midroom), and in the last stretch the other two stages' mechanics as well. Gravity fields
// (B.add('gzone', x, y, { x1, y1, kind: 'flip' | 'low' })) reach up to the roof they hold the player against, so the
// player never hangs at a field's edge; no ladders, ledges or platforms inside a flipped field.
Object.assign(LAYOUTS, {
  // Gravion's observatory: the floating rocks where gravity is weak, the hall where it pulls up, the lift tower, the
  // moons circling the black holes, the planetoid's room, the singularity bridge; then the magnet rafters, the
  // star-gate vault, the orrery and the switchback hall to the dome
  gravity(B) {
    // --- the observatory gate
    B.ground(0, 22);
    B.add('start', 3);
    B.add('met', 12);
    B.add('gravbot', 19);
    // --- the floating rocks: gravity is weak over the chasm, so every jump floats far; rock to rock (one of them a
    // drifting slab) past the little moons, with a black hole dragging at you from below
    B.add('gzone', 23, 0, { x1: 64, y1: 31, kind: 'low' });
    for (const [x0, y] of [
      [29, 19],
      [37, 15],
      [51, 13],
      [58, 17],
    ])
      B.solid(x0, y, x0 + 1, y + 1);
    B.add('plat', 44, 17, { x1: 44, y1: 11, speed: 0.5 });
    B.add('bhole', 47, 21, { r: 6 });
    B.add('orbiter', 40, 10);
    B.add('orbiter', 55, 9);
    B.add('h', 51, 12);
    // --- the upside-down hall: the floor is a bed of spikes, but the field pulls up, so walk the ceiling; jump (down)
    // over the slits open to the sky and the spikes hanging from the roof, drop onto the pillar where the field breaks
    // and walk off it into the next field
    B.ground(65, 125);
    B.add('cp', 67);
    B.add('gravbot', 71);
    B.solid(73, 0, 121, 11);
    B.cave(73, 12, 121, 21);
    B.spikes(77, 117);
    B.add('gzone', 75, 0, { x1: 99, y1: 21, kind: 'flip' });
    B.add('gzone', 105, 0, { x1: 117, y1: 21, kind: 'flip' });
    B.rect(86, 0, 88, 11, '.'); // a slit in the dome: the sky
    B.spikes(93, 94, 11); // hanging from the roof
    B.solid(100, 18, 104, 22);
    B.rect(111, 0, 113, 11, '.');
    B.add('orbiter', 82, 16);
    B.add('gravbot', 102, 17);
    B.add('orbiter', 109, 17);
    // --- the lift tower: in each lift shaft a field pulls up; ride it to its roof and walk off onto the ledge beside
    // it, then over the spike pit at the top
    B.solid(122, 0, 170, 21);
    B.cave(123, 1, 169, 21);
    B.cave(122, 18, 122, 21); // the way in
    B.ground(122, 170);
    B.spikes(138, 168);
    B.add('gzone', 127, 11, { x1: 131, y1: 21, kind: 'flip' });
    B.solid(126, 9, 132, 10); // the first lift's roof
    B.pillar(132, 137, 13);
    B.add('gzone', 138, 3, { x1: 141, y1: 12, kind: 'flip' });
    B.solid(130, 1, 137, 8); // the rock round the secret room
    B.solid(137, 1, 142, 2); // the second lift's roof
    B.solid(142, 5, 147, 6);
    B.solid(150, 6, 152, 7);
    B.solid(155, 5, 169, 6);
    B.cave(170, 2, 170, 4); // out at the top
    B.add('orbiter', 146, 11);
    B.add('orbiter', 153, 2);
    B.add('gravbot', 161, 4);
    B.add('h', 166, 4);
    // --- the moons: two black holes over the chasm, each with two moons circling it; ride a moon round (the hole
    // drags you toward its core) and jump to the next
    B.pillar(171, 173, 5);
    B.add('cp', 172, 4);
    B.add('bhole', 180, 12);
    B.add('plat', 179.5, 12.25, { r: 4, speed: 0.02 });
    B.add('plat', 179.5, 12.25, { r: 4, speed: 0.02, phase: Math.PI });
    B.add('bhole', 192, 14);
    B.add('plat', 191.5, 14.25, { r: 4, speed: -0.022, phase: 0.8 });
    B.add('plat', 191.5, 14.25, { r: 4, speed: -0.022, phase: 0.8 + Math.PI });
    B.add('orbiter', 186, 6);
    // --- the planetoid's room (a guardian)
    B.ground(198, 279);
    B.solid(200, 0, 223, 12);
    B.cave(201, 13, 222, 21);
    B.solid(200, 13, 200, 18);
    B.solid(223, 13, 223, 18);
    B.cave(200, 19, 200, 21);
    B.cave(223, 19, 223, 21);
    B.add('midroom', 200, F, { boss: 'planetoid' });
    B.add('cp', 226);
    // --- the singularity bridge: a broken bridge under the lab's gantry, black holes hanging over the gaps; they
    // lift your jumps toward their cores
    B.rect(230, F, 268, LEVEL_H - 1, '.');
    for (const [x0, x1] of [
      [230, 235],
      [239, 243],
      [246, 250],
      [254, 258],
      [261, 265],
    ])
      B.ledge(x0, x1, 20);
    B.solid(229, 8, 269, 9); // the gantry
    B.roof(229, 269, 8);
    B.add('bhole', 237, 13);
    B.add('bhole', 252, 12);
    B.add('bhole', 267, 13);
    B.add('orbiter', 244, 11);
    B.add('gravbot', 248, 19);
    B.add('gravbot', 263, 19);
    B.add('orbiter', 259, 11);
    B.add('E', 272);
    B.add('met', 276);
    // --- the magnet rafters (the railway's magnets): weak gravity over the chasm again, but each rafter has a magnet
    // facing the way you come; jump while it pulls (red) and it draws you in, jump while it pushes (blue) and it
    // throws you back into the chasm
    B.add('gzone', 280, 0, { x1: 304, y1: 31, kind: 'low' });
    B.solid(284, 18, 285, 20);
    B.solid(291, 14, 292, 17);
    B.add('magnet', 291, 15, { dir: -1, range: 7, period: 240 });
    B.solid(298, 16, 299, 19);
    B.add('magnet', 298, 17, { dir: -1, range: 7, period: 240, phase: 120 });
    B.add('bhole', 288, 24);
    B.add('bhole', 302, 25);
    B.add('orbiter', 295, 8);
    // --- the star-gate vault (Astraea's gates): star blocks over the spikes; each gate swaps the gold blocks for the
    // violet ones (and back), so the way on stands only after you pass through
    B.ground(305, 354);
    B.add('cp', 307);
    B.solid(313, 0, 350, 9);
    B.cave(313, 10, 350, 21);
    B.spikes(316, 347);
    B.add('phase', 317, 20, { x1: 318, set: 1 });
    B.add('phase', 321, 18, { x1: 322, set: 1 });
    B.add('portal', 322, 17, { to: [327, 12], phase: true });
    B.add('phase', 326, 13, { x1: 328, set: 2 });
    B.add('phase', 331, 15, { x1: 332, set: 2 });
    B.add('phase', 335, 13, { x1: 336, set: 2 });
    B.add('portal', 336, 12, { to: [341, 17], phase: true });
    B.add('phase', 340, 18, { x1: 342, set: 1 });
    B.add('phase', 345, 20, { x1: 346, set: 1 });
    B.add('orbiter', 324, 14);
    B.add('orbiter', 339, 13);
    // --- the orrery: two black-hole suns with their planets circling them over the chasm; hop from orbit to orbit
    B.add('cp', 352);
    B.add('bhole', 362, 17, { r: 6 });
    B.add('plat', 361.5, 17.25, { r: 3, speed: 0.026 });
    B.add('plat', 361.5, 17.25, { r: 6, speed: -0.016, phase: 1.6 });
    B.add('bhole', 378, 15, { r: 6 });
    B.add('plat', 377.5, 15.25, { r: 3, speed: -0.03, phase: 2 });
    B.add('plat', 377.5, 15.25, { r: 6, speed: 0.018, phase: 4 });
    B.add('orbiter', 370, 8);
    B.add('orbiter', 384, 7);
    // --- the switchback hall to the dome: spikes on the floor and on the roof in turn, and a field over each stretch
    // of floor spikes; switch between floor and ceiling
    B.ground(386, 425);
    B.solid(390, 0, 425, 11);
    B.cave(390, 12, 425, 21);
    B.spikes(394, 398);
    B.spikes(407, 410);
    B.spikes(418, 421);
    B.spikes(402, 404, 11);
    B.spikes(414, 415, 11);
    B.add('gzone', 393, 0, { x1: 399, y1: 21, kind: 'flip' });
    B.add('gzone', 406, 0, { x1: 411, y1: 21, kind: 'flip' });
    B.add('gzone', 417, 0, { x1: 422, y1: 21, kind: 'flip' });
    B.add('gravbot', 401);
    B.add('gravbot', 413);
    B.add('E', 388);
    // --- the secret room: in the rock beside the second lift's roof, behind a magnetic lock (Polar Magnet)
    B.secret(132, 3, 136, 5, 137, 'magnet', 134);
    bossRoom(B, DOOR_COL, 'gravity');
  },

  // Polaris's polar railway: the frozen platform with its magnet posts, the scrap shed, the ice cave, the high rails,
  // the crane's hall, the sorting yard; then the upside-down cut, the star-gate depot, the field of magnet plates and
  // the last platform under the aurora
  magnet(B) {
    // --- the station
    B.ground(0, 20);
    B.add('start', 3);
    B.add('met', 12);
    B.add('polebot', 17);
    // --- the frozen platform: ice over the pits, and beyond each pit a magnet post that pulls (red) and pushes (blue)
    // in turn; jump while it pulls, or it throws you back into the pit
    B.ground(21, 62);
    B.ledge(21, 62, F, 'I');
    for (const [p0, post, ph] of [
      [27, 34, 0],
      [40, 47, 100],
      [53, 60, 0],
    ]) {
      B.pit(p0, p0 + 2);
      B.solid(post, 20, post + 1, 21);
      B.add('magnet', post, 21, { dir: -1, range: 7, period: 200, phase: ph });
    }
    B.add('magmine', 31, 16);
    B.add('polebot', 44);
    B.add('magmine', 51, 15);
    // --- the scrap shed: belts under the crane rail, its cranes letting go of scrap; a magnet plate throws you up to
    // the catwalk over the spike pit, where the end wall's magnet pulls and pushes you at the gaps
    B.ground(63, 165);
    B.add('cp', 65);
    B.solid(63, 0, 83, 12); // the roof, low over the belts and high over the catwalk
    B.solid(84, 0, 113, 8);
    B.cave(63, 13, 83, 21);
    B.cave(84, 9, 112, 21);
    B.belt(67, 74, F, 1);
    B.spikes(75, 76);
    B.belt(77, 83, F, -1);
    B.rect(84, F, 85, F, 'U'); // a magnet plate
    B.spikes(86, 109);
    for (const [x0, x1] of [
      [88, 93],
      [96, 101],
      [104, 112],
    ])
      B.ledge(x0, x1, 15);
    B.solid(113, 9, 113, 12); // the end wall, with a magnet in it; out under it
    B.add('magnet', 113, 12, { dir: -1, range: 11, period: 220 });
    [
      [70, 13],
      [80, 13],
      [90, 9],
      [98, 9],
      [107, 9],
    ].forEach(([x, y], i) => B.add('scrap', x, y, { period: 150, phase: i * 29 }));
    B.add('polebot', 71);
    B.add('magmine', 99, 11);
    B.add('h', 110, 14);
    // --- the ice cave under the ridge: down the hole onto the ice, under the hanging ice where magnets pull and push
    // you toward the spike pits, and up the magnet plate on the far step
    B.cave(115, 24, 158, 29);
    B.cave(116, 22, 122, 23); // the hole down
    B.roof(116, 158, 22, 1); // the ridge over the cave
    B.ledge(115, 158, 30, 'I');
    B.spikes(126, 127, 30);
    B.solid(131, 24, 132, 27);
    B.add('magnet', 131, 27, { dir: -1, range: 6, period: 180 });
    B.spikes(136, 137, 30);
    B.solid(141, 24, 142, 27);
    B.add('magnet', 142, 27, { dir: 1, range: 6, period: 180, phase: 90 });
    B.spikes(146, 147, 30);
    B.solid(152, 28, 158, 29); // the step
    B.rect(156, 28, 157, 28, 'U');
    B.cave(152, 22, 158, 23); // the shaft up
    B.add('polebot', 120, 29);
    B.add('magmine', 134, 26);
    B.add('magmine', 149, 25);
    // --- the high rails: rail cars climb over the chasm to a signal box and run down the far side; magnet mines drift
    // over the track
    B.add('cp', 161);
    B.add('plat', 167, 20, { x1: 174, y1: 13, speed: 0.7 });
    B.solid(177, 12, 180, 13); // the signal box
    B.add('polebot', 179, 11);
    B.add('plat', 183, 12, { x1: 191, y1: 18, speed: 0.8 });
    B.add('magmine', 172, 9);
    B.add('magmine', 188, 10);
    // --- the crane's hall (a guardian)
    B.ground(196, 279);
    B.solid(200, 0, 223, 12);
    B.cave(201, 13, 222, 21);
    B.solid(200, 13, 200, 18);
    B.solid(223, 13, 223, 18);
    B.cave(200, 19, 200, 21);
    B.cave(223, 19, 223, 21);
    B.add('midroom', 200, F, { boss: 'kranbot' });
    B.add('cp', 226);
    // --- the sorting yard: belts both ways over the gaps under the gantry, its cranes letting go of scrap, a magnet post
    // at the end
    B.solid(229, 12, 271, 13); // the gantry
    B.roof(229, 271, 12);
    B.belt(229, 236, F, -1);
    B.spikes(237, 238);
    B.belt(239, 246, F, 1);
    B.pit(247, 249);
    B.belt(250, 257, F, -1);
    B.spikes(258, 259);
    B.belt(260, 266, F, 1);
    B.solid(268, 20, 269, 21);
    B.add('magnet', 268, 21, { dir: -1, range: 8, period: 200 });
    [232, 242, 253, 263].forEach((x, i) => B.add('scrap', x, 14, { period: 130, phase: i * 31 }));
    B.add('magmine', 244, 14);
    B.add('polebot', 255);
    B.add('E', 273);
    B.add('met', 277);
    // --- the upside-down cut (Gravion's fields): the field over the cut pulls up, so walk its roof; beyond each slit to
    // the sky a magnet in the roof drags you in while it pulls (red), so cross while it pushes and jump as it turns
    B.ground(280, 354);
    B.solid(282, 0, 313, 11);
    B.cave(282, 12, 313, 21);
    B.spikes(285, 310);
    B.add('gzone', 284, 0, { x1: 310, y1: 21, kind: 'flip' });
    for (const [s0, ph] of [
      [289, 0],
      [297, 110],
      [305, 50],
    ]) {
      B.rect(s0, 0, s0 + 2, 11, '.');
      B.add('magnet', s0 + 3, 11, { dir: -1, range: 6, period: 220, phase: ph });
    }
    B.add('magmine', 294, 16);
    B.add('magmine', 302, 15);
    // --- the star-gate depot (Astraea's gates): star blocks over the spikes; each gate swaps the gold blocks for the
    // violet ones (and back)
    B.add('cp', 315);
    B.solid(318, 0, 350, 9);
    B.cave(318, 10, 350, 21);
    B.spikes(320, 347);
    B.add('phase', 321, 20, { x1: 322, set: 1 });
    B.add('phase', 325, 18, { x1: 326, set: 1 });
    B.add('phase', 329, 16, { x1: 330, set: 1 });
    B.add('portal', 330, 15, { to: [334, 19], phase: true });
    B.add('phase', 333, 20, { x1: 335, set: 2 });
    B.add('phase', 338, 18, { x1: 339, set: 2 });
    B.add('phase', 342, 16, { x1: 343, set: 2 });
    B.add('portal', 343, 15, { to: [346, 19], phase: true });
    B.add('phase', 345, 20, { x1: 347, set: 1 });
    B.add('magmine', 327, 12);
    B.add('magmine', 340, 12);
    // --- the field of magnet plates: from plate to plate over the spikes, and at the top of each throw a magnet hanging
    // from the gantry pulls and pushes you off your line
    B.add('cp', 352);
    B.ground(355, 389);
    B.spikes(355, 385);
    B.solid(354, 7, 388, 8); // the gantry
    B.roof(354, 388, 7);
    [357, 362, 367, 372, 377, 382].forEach((x, i) => {
      B.rect(x, 21, x + 1, 21, 'U');
      B.rect(x, F, x + 1, F, '#');
      if (i) {
        B.solid(x - 2, 9, x - 2, 11);
        B.add('magnet', x - 2, 11, { dir: i & 1 ? 1 : -1, range: 5, period: 210, phase: i * 70 });
      }
    });
    B.add('magmine', 370, 15);
    // --- the last platform under the aurora: ice, magnet posts, polebots and mines to the door
    B.ground(390, 425);
    B.solid(390, 0, 425, 11);
    B.cave(390, 12, 425, 21);
    B.ledge(392, 421, F, 'I');
    B.solid(398, 20, 399, 21);
    B.add('magnet', 399, 21, { dir: 1, range: 7, period: 200 });
    B.spikes(404, 405);
    B.solid(410, 20, 411, 21);
    B.add('magnet', 410, 21, { dir: -1, range: 7, period: 200, phase: 100 });
    B.spikes(415, 416);
    B.add('polebot', 402);
    B.add('magmine', 407, 15);
    B.add('polebot', 419);
    B.add('E', 394);
    // --- the secret room: off the ice cave, behind a starlit door (Astral Gate)
    B.secret(109, 27, 113, 29, 114, 'astral', 111);
    bossRoom(B, DOOR_COL, 'magnet');
  },

  // Astraea's sky temple: the starfall terrace, the gate pillars over the chasm, the bridge of star blocks, the
  // courtyard under the falling stars, the warden's room, the mirror gallery; then the weightless sanctum, the magnet
  // span, the long star bridge and the last colonnade
  astral(B) {
    // --- the temple steps
    B.ground(0, 20);
    B.add('start', 3);
    B.add('met', 12);
    B.add('gateling', 17);
    // --- the starfall terrace: stars fall from the sky at a slant (a glint high up warns of each) over a terrace
    // broken by pits
    B.ground(21, 60);
    B.pit(26, 28);
    B.pit(35, 37);
    B.pit(44, 45);
    B.pit(52, 54);
    B.solid(31, 20, 32, 21); // a broken column
    B.solid(48, 20, 49, 21);
    [
      [36, 50],
      [47, 0],
      [58, 100],
      [66, 25],
    ].forEach(([x, ph]) => B.add('fallstar', x, 1, { period: 150, phase: ph }));
    B.add('starling', 30, 14);
    B.add('gateling', 40);
    B.add('starling', 51, 13);
    // --- the gate pillars: a chasm too wide to jump; star gates join pillar tops too far apart (walk into a gate and
    // you come out of its twin)
    B.pillar(63, 65, 20);
    B.add('portal', 65, 19, { to: [77, 12] });
    B.pillar(76, 78, 13);
    B.pillar(82, 84, 15);
    B.add('portal', 84, 14, { to: [95, 8] });
    B.pillar(94, 96, 9);
    B.pillar(100, 102, 12);
    B.add('turret', 101, 11);
    [
      [80, 10],
      [92, 70],
      [104, 130],
    ].forEach(([x, ph]) => B.add('fallstar', x, 0, { period: 160, phase: ph }));
    B.add('starling', 72, 10);
    B.add('starling', 90, 5);
    // --- the bridge of star blocks: gold blocks and violet ones over the void; a gate marked with a star swaps which
    // stand, so cross on the gold, swap, on along the violet, and swap back
    B.ground(106, 110);
    B.add('cp', 108);
    B.add('phase', 113, 20, { x1: 114, set: 1 });
    B.add('phase', 118, 19, { x1: 119, set: 1 });
    B.add('phase', 123, 20, { x1: 125, set: 1 });
    B.add('portal', 125, 19, { to: [130, 17], phase: true });
    B.add('phase', 129, 18, { x1: 131, set: 2 });
    B.add('phase', 135, 19, { x1: 136, set: 2 });
    B.add('phase', 140, 18, { x1: 141, set: 2 });
    B.add('phase', 145, 18, { x1: 147, set: 2 });
    B.add('portal', 147, 17, { to: [152, 19], phase: true });
    B.add('phase', 151, 20, { x1: 153, set: 1 });
    B.add('phase', 157, 20, { x1: 158, set: 1 });
    [
      [125, 0],
      [138, 55],
      [151, 110],
      [164, 30],
    ].forEach(([x, ph]) => B.add('fallstar', x, 0, { period: 165, phase: ph }));
    B.add('starling', 121, 14);
    B.add('starling', 143, 12);
    // --- the courtyard: open to the sky and stars falling all the while; shelter under the arches, gatelings between
    B.ground(161, 225);
    B.add('cp', 163);
    for (const x0 of [168, 180, 192]) B.solid(x0, 15, x0 + 4, 16);
    B.roof(168, 196, 15, 1);
    B.spikes(175, 176);
    B.spikes(187, 188);
    [
      [184, 0],
      [191, 47],
      [198, 94],
    ].forEach(([x, ph]) => B.add('fallstar', x, 0, { period: 140, phase: ph }));
    B.add('gateling', 178);
    B.add('starling', 186, 10);
    B.add('gateling', 190);
    // --- the warden's room (a guardian)
    B.solid(200, 0, 223, 12);
    B.cave(201, 13, 222, 21);
    B.solid(200, 13, 200, 18);
    B.solid(223, 13, 223, 18);
    B.cave(200, 19, 200, 21);
    B.cave(223, 19, 223, 21);
    B.add('midroom', 200, F, { boss: 'warden' });
    B.add('cp', 226);
    // --- the mirror gallery: two corridors, one over the other, each walled off in turn; the gates before each wall
    // take you into the other corridor
    B.ground(226, 280);
    B.solid(224, 0, 229, 16);
    B.solid(230, 0, 275, 9);
    B.cave(230, 10, 275, 14);
    B.solid(230, 15, 275, 16);
    B.cave(226, 17, 263, 21);
    B.solid(264, 17, 275, 21);
    B.solid(238, 17, 238, 21);
    B.solid(252, 10, 252, 14);
    B.add('portal', 236, 21, { to: [240, 14] });
    B.add('portal', 250, 14, { to: [254, 21] });
    B.add('portal', 262, 21, { to: [266, 14] });
    B.spikes(232, 233);
    B.spikes(244, 245, 15);
    B.spikes(257, 258);
    B.spikes(270, 271, 15);
    B.add('gateling', 234);
    B.add('h', 232, 14);
    B.add('starling', 246, 12);
    B.add('gateling', 260);
    B.add('starling', 272, 12);
    // --- the weightless sanctum (Gravion's fields): gravity is weak inside, so float from block to block over the
    // spike floor while the black hole under them drags at you
    B.ground(276, 316);
    B.solid(276, 0, 312, 5);
    B.cave(277, 6, 311, 21);
    B.solid(276, 6, 276, 10);
    B.solid(276, 15, 276, 21);
    B.solid(312, 6, 312, 12);
    B.spikes(277, 307);
    B.solid(277, 15, 279, 16);
    B.add('gzone', 277, 6, { x1: 307, y1: 21, kind: 'low' });
    for (const [x0, y] of [
      [284, 12],
      [291, 16],
      [297, 11],
      [303, 14],
    ])
      B.solid(x0, y, x0 + 1, y + 1);
    B.add('bhole', 294, 19, { r: 6 });
    B.add('starling', 288, 9);
    B.add('starling', 301, 8);
    B.solid(308, 16, 316, 21); // the way out
    // --- the magnet span (Polaris's magnets): star blocks over the spikes between two magnets that pull and push in
    // turn; a gate swaps the gold blocks for the violet ones, and the last gate (the far ledge is too far to jump to)
    // swaps them back
    B.add('cp', 314, 15);
    B.solid(313, 0, 350, 9);
    B.ground(317, 354);
    B.spikes(317, 349);
    B.add('magnet', 316, 16, { dir: 1, range: 10, period: 240 });
    B.add('phase', 320, 17, { x1: 322, set: 1 });
    B.add('phase', 326, 17, { x1: 327, set: 1 });
    B.add('portal', 327, 16, { to: [333, 16], phase: true });
    B.add('phase', 332, 17, { x1: 334, set: 2 });
    B.add('phase', 338, 17, { x1: 339, set: 2 });
    B.add('phase', 343, 17, { x1: 344, set: 2 });
    B.add('portal', 344, 16, { to: [351, 16], phase: true });
    B.solid(350, 17, 354, 21);
    B.add('magnet', 350, 17, { dir: -1, range: 12, period: 240, phase: 120 });
    B.add('magmine', 330, 12);
    B.add('magmine', 341, 12);
    // --- the long star bridge: three gates, each swapping the blocks, over the void with a black hole under it and
    // the stars falling
    B.add('cp', 352, 16);
    B.rect(355, F, 389, LEVEL_H - 1, '.');
    B.add('phase', 358, 16, { x1: 359, set: 1 });
    B.add('portal', 359, 15, { to: [364, 13], phase: true });
    B.add('phase', 363, 14, { x1: 365, set: 2 });
    B.add('phase', 369, 15, { x1: 370, set: 2 });
    B.add('portal', 370, 14, { to: [375, 16], phase: true });
    B.add('phase', 374, 17, { x1: 376, set: 1 });
    B.add('phase', 380, 16, { x1: 381, set: 1 });
    B.add('portal', 381, 15, { to: [386, 13], phase: true });
    B.add('phase', 385, 14, { x1: 387, set: 2 });
    B.add('bhole', 372, 22, { r: 6 });
    [
      [370, 0],
      [382, 50],
      [389, 100],
    ].forEach(([x, ph]) => B.add('fallstar', x, 0, { period: 150, phase: ph }));
    B.add('starling', 367, 9);
    B.add('starling', 383, 8);
    // --- the last colonnade: a broken roof with the stars falling through it, gatelings and starlings to the door
    B.ground(390, 425);
    B.solid(390, 6, 425, 7);
    B.rect(399, 6, 401, 7, '.');
    B.rect(413, 6, 415, 7, '.');
    B.roof(390, 425, 6);
    B.spikes(397, 398);
    B.spikes(408, 409);
    B.spikes(418, 419);
    [
      [405, 0],
      [419, 70],
    ].forEach(([x, ph]) => B.add('fallstar', x, 0, { period: 140, phase: ph }));
    B.add('gateling', 403);
    B.add('starling', 411, 12);
    B.add('gateling', 416);
    B.add('E', 405);
    B.add('met', 422);
    // --- the secret room: in the wall of the mirror gallery, behind a door of bent space (Gravity Well)
    B.secret(226, 12, 228, 14, 229, 'gravity', 227);
    bossRoom(B, DOOR_COL, 'astral');
  },
});
