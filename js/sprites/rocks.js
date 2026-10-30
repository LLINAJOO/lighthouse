"use strict";
// ===== Rocks: irregular outlined boulders instead of plain circles =====
const ROCK_C = new Map();
const ROCK_PAL = { hi: '#e2e4e8', top: '#b9bdc4', topE: '#9a9fa7', side: '#7d828b', dark: '#4f545d', deep: '#3e4249', crack: '#3a3d44', g1: '#3f7a32', g2: '#2f6126', g3: '#5c9a45' };
// faceted boulder: a flat lit top, a mid-tone left face and a dark right face split by a ridge;
// size: 's' small, 'm' boulder, 'flat' a low flat stone; grass: a few tufts growing round the foot
function rockSprite(seed, size = 'm', grass = false) {
  const key = seed + '|' + size + '|' + (grass ? 1 : 0); let cv = ROCK_C.get(key); if (cv) return cv;
  const r = rng(seed * 97 + 13);
  const [w, h] = size === 's' ? [11 + (r() * 3 | 0), 9 + (r() * 2 | 0)] : size === 'flat' ? [15 + (r() * 3 | 0), 7 + (r() * 2 | 0)] : [16 + (r() * 4 | 0), 14 + (r() * 3 | 0)];
  const PAD = 4, W = w + PAD * 2, H = h + 3, [a, g] = mk(W, H), x0 = PAD, y0 = 1;
  // silhouette: an uneven polygon, flatter on top and at the foot
  const pts = [], n = 9, ccx = x0 + w / 2, ccy = y0 + h * .55;
  for (let i = 0; i < n; i++) { const t = -Math.PI / 2 + i * Math.PI * 2 / n + (r() - .5) * .35, k = .86 + r() * .16; let px = ccx + Math.cos(t) * (w / 2) * k, py = ccy + Math.sin(t) * (h * .58) * k; py = Math.max(y0, Math.min(y0 + h - .5, py)); pts.push([px, py]); }
  { const [tg, tc] = mk(W, H); tc.fillStyle = '#fff'; tc.beginPath(); pts.forEach(([px, py], i) => i ? tc.lineTo(px, py) : tc.moveTo(px, py)); tc.closePath(); tc.fill(); var td = tc.getImageData(0, 0, W, H).data; }
  const mask = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) mask.push(td[(y * W + x) * 4 + 3] > 110);
  const M = (x, y) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x];
  const cx = x0 + w * (.46 + (r() - .5) * .1), topH = h * (size === 'flat' ? .44 : .38);
  const topLine = x => y0 + topH + (1 - Math.min(1, Math.abs(x + .5 - cx) / (w / 2))) * h * .1; // V-shaped lower edge of the top face
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!M(x, y)) continue;
    let col;
    const tl = topLine(x);
    if (y < tl) {
      col = ROCK_PAL.top;
      if (!M(x - 1, y) || !M(x, y - 1) || (!M(x - 2, y) && y < tl - 1)) col = ROCK_PAL.hi; // lit rim on the top-left
      if (y >= tl - 1 && x > cx) col = ROCK_PAL.topE;
    } else {
      const ridge = cx + (y - tl) * .18;
      col = x < ridge ? ROCK_PAL.side : ROCK_PAL.dark;
      if (x < ridge && !M(x - 1, y) && y < tl + 3) col = ROCK_PAL.hi;
      if (!M(x, y + 1)) col = ROCK_PAL.deep;
    }
    R(g, x, y, 1, 1, col);
  }
  // a small crack on the dark face
  if (size !== 's') { let x = Math.round(cx + w * .2), y = Math.round(topLine(cx) + 2); for (let i = 0; i < 3 && M(x, y); i++, y++) { R(g, x, y, 1, 1, ROCK_PAL.crack); if (r() < .5) x++; } }
  const [b, bg] = mk(W + 2, H + 2); bg.drawImage(a, 1, 1); outlinePass(b, '#22252b');
  // grass tufts round the foot, in front of the stone (no outline, like real grass)
  if (grass) {
    const tuft = (tx, ty, n) => { for (let i = 0; i < n; i++) { const hh = 3 + (r() * 4 | 0), lean = (i - (n - 1) / 2) * .5; for (let k = 0; k < hh; k++) R(bg, tx + i + Math.round(lean * k / hh), ty - k, 1, 1, k === hh - 1 ? ROCK_PAL.g3 : i % 2 ? ROCK_PAL.g2 : ROCK_PAL.g1); } };
    const by = H;
    tuft(1, by - 1, 5); tuft(W - 5, by - 1, 5); tuft(Math.round(x0 + w * .25), by + 1, 4); if (size !== 's') tuft(Math.round(x0 + w * .68), by + 1, 4);
  }
  ROCK_C.set(key, b); return b;
}
function drawBoulder(c, x, y, seed, size, grass, sh) {
  const s = rockSprite(seed, size, grass);
  if (sh) shadowE(c, x, y, s.width / 2 - 4, 2.2, sh);
  c.drawImage(s, Math.round(x - s.width / 2), Math.round(y - s.height + 3));
}
// replaces the old round rock; the seed keeps each rock's shape stable as the camera moves
function drawRock(c, x, y, sh, big, seed = 1, grass = false) { drawBoulder(c, x, y, seed, big ? 'm' : 's', grass, sh); }
function drawCairn(c, x, y, sh) {
  shadowE(c, x, y, 6, 2, sh);
  const parts = [[0, 0, 'flat', 11], [0, -5, 's', 12], [1, -10, 's', 17]];
  parts.forEach(([dx, dy, sz, sd]) => { const s = rockSprite(sd, sz); const k = sz === 's' && dy < -6 ? .7 : 1; c.drawImage(s, Math.round(x + dx - s.width * k / 2), Math.round(y + dy - s.height * k + 3), s.width * k | 0, s.height * k | 0); });
}
// ===== Driftwood: a bleached log lying on the sand, cut end with rings, broken end, a branch stub =====
const LOG_C = new Map();
function driftLogSprite(seed = 1) {
  let cv = LOG_C.get(seed); if (cv) return cv;
  const r = rng(seed * 31 + 7), W = 28, H = 11, [a, g] = mk(W, H);
  const hi = '#e6dccb', li = '#cfc3ab', mid = '#b3a588', dk = '#8f8066', deep = '#6e624e', grain = '#9e8f72';
  // body: a cylinder lying on its side (rows shaded top -> bottom)
  const rows = [hi, li, li, mid, mid, dk, deep];
  for (let x = 4; x < W - 3; x++) {
    const sag = x >= W - 4 ? 1 : 0; // the broken end is a little thinner
    for (let i = sag; i < rows.length - sag; i++) R(g, x, 2 + i, 1, 1, rows[i]);
  }
  // wood grain: long thin lines along the log
  for (let k = 0; k < 4; k++) { let x = 6 + (r() * 6 | 0); const y = 3 + (r() * 4 | 0), l = 5 + (r() * 8 | 0); for (let i = 0; i < l && x < W - 6; i++, x++) if (r() > .15) R(g, x, y, 1, 1, grain); }
  // a knot
  { const kx = 10 + (r() * 8 | 0); R(g, kx, 5, 2, 1, deep); R(g, kx, 4, 1, 1, dk); }
  // cut end on the left: an oval with growth rings
  const cx = 4, cy = 5;
  for (let y = 1; y < 10; y++) for (let x = 0; x < 8; x++) { const dx = (x + .5 - cx) / 3.2, dy = (y + .5 - cy - .5) / 4.2, d = dx * dx + dy * dy; if (d <= 1 && x <= cx + 1) R(g, x, y, 1, 1, d > .62 ? '#a8996f' : d > .3 ? '#d9c8a0' : d > .1 ? '#c7b48a' : '#b29c70'); }
  R(g, cx - 1, 5, 1, 1, '#8a7652');
  // broken end on the right: jagged splinters
  // broken end: uneven splinters of different lengths
  [[W - 3, 3, li], [W - 2, 3, li], [W - 3, 5, mid], [W - 3, 7, dk], [W - 2, 7, dk], [W - 1, 7, dk]].forEach(([x, y, col]) => R(g, x, y, 1, 1, col)); R(g, W - 4, 5, 1, 1, deep);
  // branch stub on top
  const bx = 14 + (r() * 5 | 0); R(g, bx, 0, 2, 2, mid); R(g, bx, 0, 1, 1, li);
  const [b, bg] = mk(W + 2, H + 2); bg.drawImage(a, 1, 1); outlinePass(b, '#3a3328');
  LOG_C.set(seed, b); return b;
}
function drawDriftLog(c, x, y, seed, sh) {
  const s = driftLogSprite(seed); if (sh) shadowE(c, x, y, 13, 2.5, sh);
  c.drawImage(s, Math.round(x - s.width / 2), Math.round(y - s.height + 2));
}
