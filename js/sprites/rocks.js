"use strict";
// ===== Rocks: irregular outlined boulders instead of plain circles =====
const ROCK_C = new Map();
const ROCK_PAL = { hi: '#cdd1d6', li: '#a7acb4', mid: '#878d96', dk: '#6a707a', deep: '#555b65', moss: '#6f9150', moss2: '#8bab5f', crack: '#4a4f58' };
// size: 's' small, 'm' boulder, 'flat' a low flat stone; moss: grass-side rocks get a little green on top
function rockSprite(seed, size = 'm', moss = false) {
  const key = seed + '|' + size + '|' + (moss ? 1 : 0); let cv = ROCK_C.get(key); if (cv) return cv;
  const r = rng(seed * 97 + 13);
  const [w, h] = size === 's' ? [12 + (r() * 3 | 0), 8 + (r() * 2 | 0)] : size === 'flat' ? [14 + (r() * 3 | 0), 6 + (r() * 2 | 0)] : [15 + (r() * 4 | 0), 10 + (r() * 3 | 0)];
  const W = w + 2, H = h + 2, [a, g] = mk(W, H);
  // an uneven polygon around an ellipse, flat at the bottom
  const cx = W / 2, cy = H - 1 - h * .5, n = 7 + (r() * 3 | 0), pts = [];
  for (let i = 0; i < n; i++) { const t = -Math.PI / 2 + i * Math.PI * 2 / n + (r() - .5) * .5, k = .74 + r() * .3; pts.push([cx + Math.cos(t) * (w / 2) * k, Math.min(H - 1, cy + Math.sin(t) * (h / 2) * k * (Math.sin(t) > 0 ? 1.2 : 1))]); }
  g.fillStyle = '#fff'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
  const im = g.getImageData(0, 0, W, H), d = im.data, inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 120;
  const mask = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) mask.push(inside(x, y));
  g.clearRect(0, 0, W, H);
  // light from the upper left: shade each pixel by its position inside the stone
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!mask[y * W + x]) continue;
    const v = (x - cx) / w * .7 + (y - cy) / h * 1.1 + (hash(x + seed, y) - .5) * .18;
    let col = v < -.42 ? ROCK_PAL.hi : v < -.1 ? ROCK_PAL.li : v < .25 ? ROCK_PAL.mid : v < .5 ? ROCK_PAL.dk : ROCK_PAL.deep;
    if (!mask[(y + 1) * W + x] || y === H - 1) col = ROCK_PAL.deep;
    R(g, x, y, 1, 1, col);
  }
  // a crack and a facet edge
  let x0 = Math.round(cx + (r() - .3) * w * .3), y0 = Math.round(cy - h * .2);
  for (let i = 0; i < 3 + (r() * 3 | 0); i++) { if (mask[y0 * W + x0]) R(g, x0, y0, 1, 1, ROCK_PAL.crack); x0 += r() < .5 ? 1 : 0; y0 += 1; }
  for (let x = 1; x < W - 1; x++) { const y = Math.round(cy - h * .05 + (x - cx) * .25); if (mask[y * W + x] && mask[(y - 1) * W + x] && r() < .7) R(g, x, y - 1, 1, 1, ROCK_PAL.li); }
  if (moss) for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) { if (!mask[y * W + x]) continue; if (y === 0 || !mask[(y - 1) * W + x]) { if (r() < .55) { R(g, x, y, 1, 1, r() < .5 ? ROCK_PAL.moss : ROCK_PAL.moss2); if (r() < .4 && mask[(y + 1) * W + x]) R(g, x, y + 1, 1, 1, ROCK_PAL.moss); } break; } }
  const [b, bg] = mk(W + 2, H + 2); bg.drawImage(a, 1, 1); outlinePass(b, '#2a2e36');
  ROCK_C.set(key, b); return b;
}
function drawBoulder(c, x, y, seed, size, moss, sh) {
  const s = rockSprite(seed, size, moss);
  if (sh) shadowE(c, x, y, s.width / 2 - 1, 2.2, sh);
  c.drawImage(s, Math.round(x - s.width / 2), Math.round(y - s.height + 2));
}
// replaces the old round rock; the seed keeps each rock's shape stable as the camera moves
function drawRock(c, x, y, sh, big, seed = 1) { drawBoulder(c, x, y, seed, big ? 'm' : 's', !big && seed % 3 === 0, sh); }
function drawCairn(c, x, y, sh) {
  shadowE(c, x, y, 6, 2, sh);
  const parts = [[0, 0, 'flat', 11], [0, -4, 's', 12], [1, -8, 's', 17]];
  parts.forEach(([dx, dy, sz, sd]) => { const s = rockSprite(sd, sz); c.drawImage(s, Math.round(x + dx - s.width / 2), Math.round(y + dy - s.height + 2), s.width * (sz === 's' && dy < -6 ? .7 : 1) | 0, s.height * (sz === 's' && dy < -6 ? .7 : 1) | 0); });
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
