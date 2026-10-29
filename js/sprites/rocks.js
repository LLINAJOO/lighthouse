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
