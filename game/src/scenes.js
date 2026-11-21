// The three scenes. Every scene is drawn twice — once for the left panel and
// once for the right — with `right` flipping exactly the differences listed
// in `differences`. All art is procedural canvas drawing: no image files, no
// borrowed art. Panels are 640x400; every difference carries the panel-space
// point the player has to click (x, y) and a generous hit radius r.
//
// A level is:
//   { id, name, subtitle, timeLimit, differences: [{id, x, y, r, label}] }
//   draw(ctx, right) — paints the whole panel.

import { mulberry32 } from './rng.js';

export const PANEL_W = 640;
export const PANEL_H = 400;

function sky(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
}

function cloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 8 * s, 14 * s, 0, Math.PI * 2);
  ctx.arc(x + 38 * s, y, 16 * s, 0, Math.PI * 2);
  ctx.arc(x + 18 * s, y + 6 * s, 16 * s, 0, Math.PI * 2);
  ctx.fill();
}

function stars(ctx, seed, count, top) {
  const rng = mulberry32(seed);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < count; i += 1) {
    const x = rng() * PANEL_W;
    const y = rng() * top;
    const r = 0.8 + rng() * 1.6;
    ctx.globalAlpha = 0.35 + rng() * 0.65;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 6 * s, x + 9 * s, y);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Level 1 — Mira's Rooftop Garden at dusk
// ---------------------------------------------------------------------------
function drawGarden(ctx, right) {
  sky(ctx, [[0, '#2b1e4f'], [0.45, '#7a3b6e'], [0.75, '#e07a4e'], [1, '#f7b267']]);

  // Sun (left) vs crescent moon (right).
  if (!right) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(95, 78, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,209,102,0.55)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(95 + Math.cos(a) * 38, 78 + Math.sin(a) * 38);
      ctx.lineTo(95 + Math.cos(a) * 48, 78 + Math.sin(a) * 48);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#f4f1de';
    ctx.beginPath();
    ctx.arc(95, 78, 28, 0, Math.PI * 2);
    ctx.fill();
    // Bite taken out of the moon, painted in the sky's own colour at that
    // height so the crescent reads as sky, not as a second object.
    ctx.fillStyle = '#4a2560';
    ctx.beginPath();
    ctx.arc(106, 70, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  cloud(ctx, 250, 55, 1, 'rgba(255,214,180,0.85)');
  if (!right) cloud(ctx, 420, 40, 0.9, 'rgba(255,214,180,0.85)');
  cloud(ctx, 540, 90, 0.7, 'rgba(255,190,160,0.7)');

  // Distant rooftops.
  ctx.fillStyle = '#3a2350';
  ctx.fillRect(0, 200, 130, 70);
  ctx.fillRect(150, 180, 170, 90);
  ctx.fillRect(340, 205, 130, 65);
  ctx.fillRect(490, 185, 150, 85);
  // One lit window — dark on the right.
  ctx.fillStyle = right ? '#241738' : '#ffd166';
  ctx.fillRect(520, 195, 18, 24);
  ctx.fillStyle = '#241738';
  ctx.fillRect(60, 215, 16, 20);
  ctx.fillRect(230, 195, 16, 20);

  // Rooftop floor and brick wall.
  ctx.fillStyle = '#8a5a44';
  ctx.fillRect(0, 270, PANEL_W, 130);
  ctx.fillStyle = '#6e4636';
  for (let y = 285; y < 400; y += 22) ctx.fillRect(0, y, PANEL_W, 3);
  ctx.fillStyle = '#a06a52';
  ctx.fillRect(0, 262, PANEL_W, 10);

  // String lights across the top.
  ctx.strokeStyle = '#3a2a22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(320, 58, 640, 12);
  ctx.stroke();
  for (let i = 0; i < 10; i += 1) {
    const x = 32 + i * 64;
    const t = x / 640;
    const y = 18 + (58 - 18) * 2 * t * (1 - t) * 2 + 12 * t * t;
    const lit = !(right && i === 6);
    ctx.fillStyle = lit ? '#ffe66d' : '#4a3a30';
    ctx.beginPath();
    ctx.arc(x, y + 8, 7, 0, Math.PI * 2);
    ctx.fill();
    if (lit) {
      ctx.fillStyle = 'rgba(255,230,109,0.25)';
      ctx.beginPath();
      ctx.arc(x, y + 8, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Butterfly — only on the left.
  if (!right) {
    ctx.fillStyle = '#7bdff2';
    ctx.beginPath();
    ctx.ellipse(342, 164, 9, 6, -0.5, 0, Math.PI * 2);
    ctx.ellipse(358, 164, 9, 6, 0.5, 0, Math.PI * 2);
    ctx.ellipse(344, 176, 7, 5, 0.5, 0, Math.PI * 2);
    ctx.ellipse(356, 176, 7, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(350, 162);
    ctx.lineTo(350, 180);
    ctx.stroke();
  }

  // Potted plants along the floor.
  const pots = [120, 200, 300];
  for (let i = 0; i < pots.length; i += 1) {
    const x = pots[i];
    ctx.fillStyle = '#c96f4a';
    ctx.beginPath();
    ctx.moveTo(x - 22, 348);
    ctx.lineTo(x + 22, 348);
    ctx.lineTo(x + 16, 388);
    ctx.lineTo(x - 16, 388);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3f7d44';
    ctx.beginPath();
    ctx.ellipse(x, 336, 20, 12, 0, Math.PI, 0);
    ctx.fill();
    // Middle pot's flower: red on the left, blue on the right.
    const petal = i === 1 ? (right ? '#4cc9f0' : '#ef476f') : '#ffd166';
    ctx.fillStyle = petal;
    for (let p = 0; p < 5; p += 1) {
      const a = (p / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 9, 318 + Math.sin(a) * 9, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.arc(x, 318, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // The cat on the wall, tail up on the left only.
  ctx.fillStyle = '#2f2a33';
  ctx.beginPath();
  ctx.ellipse(470, 305, 26, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(486, 282, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(478, 272);
  ctx.lineTo(482, 258);
  ctx.lineTo(488, 271);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(490, 271);
  ctx.lineTo(496, 258);
  ctx.lineTo(499, 272);
  ctx.closePath();
  ctx.fill();
  if (!right) {
    ctx.strokeStyle = '#2f2a33';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(448, 300);
    ctx.quadraticCurveTo(428, 292, 434, 268);
    ctx.stroke();
  }

  // Watering can by the wall.
  ctx.fillStyle = '#5e7d8a';
  ctx.fillRect(556, 344, 44, 26);
  ctx.fillRect(600, 350, 18, 6);
  ctx.beginPath();
  ctx.arc(556, 357, 12, Math.PI * 0.5, Math.PI * 1.5);
  ctx.strokeStyle = '#5e7d8a';
  ctx.lineWidth = 5;
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Level 2 — Sari's Night Market Stall
// ---------------------------------------------------------------------------
function drawMarket(ctx, right) {
  sky(ctx, [[0, '#0b1026'], [0.6, '#1b2a4a'], [1, '#2c4a6e']]);
  stars(ctx, 77, 60, 150);

  // Moon: full on the left, crescent on the right.
  ctx.fillStyle = '#f4f1de';
  ctx.beginPath();
  ctx.arc(560, 58, 26, 0, Math.PI * 2);
  ctx.fill();
  if (right) {
    ctx.fillStyle = '#1b2a4a';
    ctx.beginPath();
    ctx.arc(570, 50, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bunting flags.
  ctx.strokeStyle = '#0a0a14';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(320, 128, 640, 96);
  ctx.stroke();
  const flagColors = ['#ef476f', '#ffd166', '#06d6a0', '#4cc9f0', '#f78c6b'];
  for (let i = 0; i < 12; i += 1) {
    if (right && i === 4) continue; // one flag missing on the right
    const x = 24 + i * 52;
    ctx.fillStyle = flagColors[i % flagColors.length];
    ctx.beginPath();
    ctx.moveTo(x, 104);
    ctx.lineTo(x + 20, 104);
    ctx.lineTo(x + 10, 126);
    ctx.closePath();
    ctx.fill();
  }

  // Stall: striped awning, posts, counter.
  for (let i = 0; i < 10; i += 1) {
    // One awning stripe is blue on the right, red on the left.
    const stripe = i === 1 && right ? '#4cc9f0' : i % 2 === 0 ? '#ef476f' : '#fff3e0';
    ctx.fillStyle = stripe;
    ctx.fillRect(20 + i * 60, 140, 60, 46);
  }
  ctx.fillStyle = '#7a3b2e';
  ctx.fillRect(20, 186, 600, 10);
  ctx.fillRect(40, 196, 12, 150);
  ctx.fillRect(588, 196, 12, 150);
  ctx.fillStyle = '#a06a52';
  ctx.fillRect(30, 300, 580, 60);
  ctx.fillStyle = '#8a5a44';
  ctx.fillRect(30, 300, 580, 8);

  // Hanging lanterns under the awning.
  const lanterns = [150, 320, 490];
  for (let i = 0; i < lanterns.length; i += 1) {
    const x = lanterns[i];
    ctx.strokeStyle = '#3a2a22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 186);
    ctx.lineTo(x, 210);
    ctx.stroke();
    // Middle lantern: red on the left, green on the right.
    const color = i === 1 ? (right ? '#06d6a0' : '#ef476f') : '#ffd166';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, 232, 20, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x - 3, 210, 6, 44);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, 232, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Jars of sweets on the counter — the middle one is missing on the right.
  const jars = [180, 260, 340];
  for (let i = 0; i < jars.length; i += 1) {
    if (right && i === 1) continue;
    const x = jars[i];
    ctx.fillStyle = 'rgba(255,243,176,0.85)';
    ctx.fillRect(x - 18, 262, 36, 38);
    ctx.fillStyle = ['#ef476f', '#06d6a0', '#4cc9f0'][i];
    for (let r = 0; r < 6; r += 1) {
      ctx.beginPath();
      ctx.arc(x - 10 + (r % 3) * 10, 272 + Math.floor(r / 3) * 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#7a3b2e';
    ctx.fillRect(x - 20, 256, 40, 8);
  }

  // Sign board with a star — the star is missing on the right.
  ctx.fillStyle = '#2b1e4f';
  ctx.fillRect(420, 200, 120, 56);
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 3;
  ctx.strokeRect(420, 200, 120, 56);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SATE', 480, 230);
  if (!right) {
    ctx.beginPath();
    for (let p = 0; p < 5; p += 1) {
      const a = -Math.PI / 2 + (p / 5) * Math.PI * 2;
      const a2 = a + Math.PI / 5;
      ctx.lineTo(432 + Math.cos(a) * 8, 216 + Math.sin(a) * 8);
      ctx.lineTo(432 + Math.cos(a2) * 3.5, 216 + Math.sin(a2) * 3.5);
    }
    ctx.closePath();
    ctx.fill();
  }

  // The stall cat, asleep under the counter — gone on the right.
  if (!right) {
    ctx.fillStyle = '#e8b04b';
    ctx.beginPath();
    ctx.ellipse(520, 372, 26, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(542, 366, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(536, 358);
    ctx.lineTo(538, 348);
    ctx.lineTo(543, 357);
    ctx.closePath();
    ctx.fill();
  }

  // Cobblestones.
  ctx.fillStyle = '#233047';
  ctx.fillRect(0, 360, PANEL_W, 40);
  ctx.fillStyle = '#2e3d5a';
  for (let y = 368; y < 400; y += 14) {
    for (let x = (y % 28 === 0 ? 0 : 14); x < PANEL_W; x += 28) {
      ctx.beginPath();
      ctx.ellipse(x, y, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Level 3 — The Lighthouse Cove
// ---------------------------------------------------------------------------
function drawCove(ctx, right) {
  sky(ctx, [[0, '#8ecae6'], [0.55, '#bde0fe'], [1, '#caf0f8']]);
  cloud(ctx, 120, 55, 1, 'rgba(255,255,255,0.9)');
  if (!right) cloud(ctx, 480, 48, 0.85, 'rgba(255,255,255,0.9)');
  cloud(ctx, 300, 90, 0.6, 'rgba(255,255,255,0.75)');

  gull(ctx, 300, 80, 1, '#33415c');
  gull(ctx, 360, 58, 0.9, '#33415c');
  if (!right) gull(ctx, 450, 92, 1, '#33415c');

  // Sea.
  const sea = ctx.createLinearGradient(0, 220, 0, 400);
  sea.addColorStop(0, '#219ebc');
  sea.addColorStop(1, '#023e8a');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 220, PANEL_W, 180);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  for (const [wx, wy, wl] of [[60, 260, 70], [240, 300, 90], [420, 340, 80], [520, 270, 60]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 8, wx + wl, wy);
    ctx.stroke();
  }
  // One extra whitecap on the left.
  if (!right) {
    ctx.beginPath();
    ctx.moveTo(330, 305);
    ctx.quadraticCurveTo(350, 296, 372, 305);
    ctx.stroke();
  }

  // Rocky shore on the right.
  ctx.fillStyle = '#6c757d';
  ctx.beginPath();
  ctx.moveTo(470, 400);
  ctx.lineTo(500, 330);
  ctx.lineTo(560, 300);
  ctx.lineTo(620, 340);
  ctx.lineTo(640, 330);
  ctx.lineTo(640, 400);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#495057';
  ctx.beginPath();
  ctx.ellipse(560, 330, 30, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Starfish on the rock — only on the left.
  if (!right) {
    ctx.fillStyle = '#ff7b00';
    ctx.beginPath();
    for (let p = 0; p < 5; p += 1) {
      const a = -Math.PI / 2 + (p / 5) * Math.PI * 2;
      const a2 = a + Math.PI / 5;
      ctx.lineTo(200 + Math.cos(a) * 12, 352 + Math.sin(a) * 12);
      ctx.lineTo(200 + Math.cos(a2) * 5, 352 + Math.sin(a2) * 5);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Crab on the rocks — only on the left.
  if (!right) {
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.ellipse(520, 362, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const dx of [-12, -6, 6, 12]) {
      ctx.beginPath();
      ctx.moveTo(520 + dx, 368);
      ctx.lineTo(520 + dx * 1.4, 378);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(512, 352, 3, 0, Math.PI * 2);
    ctx.arc(528, 352, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lighthouse on the left headland.
  ctx.fillStyle = '#6c757d';
  ctx.beginPath();
  ctx.moveTo(60, 400);
  ctx.lineTo(80, 250);
  ctx.lineTo(180, 250);
  ctx.lineTo(200, 400);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.beginPath();
  ctx.moveTo(84, 250);
  ctx.lineTo(88, 180);
  ctx.lineTo(172, 180);
  ctx.lineTo(176, 250);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.moveTo(86, 222);
  ctx.lineTo(174, 222);
  ctx.lineTo(176, 250);
  ctx.lineTo(84, 250);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(90, 196);
  ctx.lineTo(170, 196);
  ctx.lineTo(172, 180);
  ctx.lineTo(88, 180);
  ctx.closePath();
  ctx.fill();
  // Lamp room.
  ctx.fillStyle = '#343a40';
  ctx.fillRect(104, 148, 52, 32);
  ctx.fillStyle = right ? '#495057' : '#ffd166';
  ctx.fillRect(112, 154, 36, 20);
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.moveTo(100, 148);
  ctx.lineTo(130, 128);
  ctx.lineTo(160, 148);
  ctx.closePath();
  ctx.fill();
  // Light beam — only when the lamp is lit (left).
  if (!right) {
    const beam = ctx.createLinearGradient(148, 164, 420, 120);
    beam.addColorStop(0, 'rgba(255,209,102,0.55)');
    beam.addColorStop(1, 'rgba(255,209,102,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(148, 156);
    ctx.lineTo(430, 96);
    ctx.lineTo(430, 200);
    ctx.lineTo(148, 172);
    ctx.closePath();
    ctx.fill();
  }

  // Little boat with a sail — white on the left, red on the right.
  ctx.fillStyle = '#7a3b2e';
  ctx.beginPath();
  ctx.moveTo(380, 262);
  ctx.lineTo(470, 262);
  ctx.lineTo(450, 282);
  ctx.lineTo(400, 282);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5c2e22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(425, 262);
  ctx.lineTo(425, 200);
  ctx.stroke();
  ctx.fillStyle = right ? '#e63946' : '#f8f9fa';
  ctx.beginPath();
  ctx.moveTo(425, 202);
  ctx.lineTo(425, 258);
  ctx.lineTo(465, 258);
  ctx.closePath();
  ctx.fill();
}

export const LEVELS = [
  {
    id: 'garden',
    name: "Mira's Rooftop Garden",
    subtitle: 'Dusk settles over the rooftop — find 7 differences.',
    timeLimit: 150,
    draw: drawGarden,
    differences: [
      { id: 'sun-moon', x: 95, y: 78, r: 36, label: 'Sun became a moon' },
      { id: 'cloud', x: 420, y: 40, r: 42, label: 'A cloud vanished' },
      { id: 'bulb', x: 384, y: 50, r: 16, label: 'A fairy light went out' },
      { id: 'window', x: 529, y: 207, r: 20, label: 'A window went dark' },
      { id: 'butterfly', x: 350, y: 170, r: 20, label: 'The butterfly flew off' },
      { id: 'tail', x: 440, y: 280, r: 24, label: "The cat's tail is gone" },
      { id: 'flower', x: 200, y: 318, r: 22, label: 'The flower changed colour' },
    ],
  },
  {
    id: 'market',
    name: "Sari's Night Market",
    subtitle: 'Lanterns, sweets and one sleepy cat — find 7 differences.',
    timeLimit: 150,
    draw: drawMarket,
    differences: [
      { id: 'moon', x: 560, y: 58, r: 30, label: 'The moon changed phase' },
      { id: 'flag', x: 232, y: 112, r: 18, label: 'A flag is missing' },
      { id: 'stripe', x: 110, y: 163, r: 20, label: 'An awning stripe changed colour' },
      { id: 'lantern', x: 320, y: 232, r: 28, label: 'A lantern changed colour' },
      { id: 'sign-star', x: 432, y: 216, r: 14, label: 'The star fell off the sign' },
      { id: 'jar', x: 260, y: 280, r: 24, label: 'A jar of sweets is gone' },
      { id: 'cat', x: 520, y: 370, r: 28, label: 'The stall cat wandered off' },
    ],
  },
  {
    id: 'cove',
    name: 'The Lighthouse Cove',
    subtitle: 'Waves, gulls and a sleepy lighthouse — find 7 differences.',
    timeLimit: 150,
    draw: drawCove,
    differences: [
      { id: 'cloud', x: 480, y: 48, r: 40, label: 'A cloud drifted away' },
      { id: 'gull', x: 450, y: 92, r: 16, label: 'A gull flew away' },
      { id: 'beam', x: 280, y: 150, r: 46, label: 'The lighthouse beam went dark' },
      { id: 'sail', x: 445, y: 230, r: 26, label: 'The sail changed colour' },
      { id: 'wave', x: 350, y: 300, r: 24, label: 'A whitecap vanished' },
      { id: 'starfish', x: 200, y: 352, r: 16, label: 'The starfish is gone' },
      { id: 'crab', x: 520, y: 362, r: 20, label: 'The crab scuttled off' },
    ],
  },
];
