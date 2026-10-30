"use strict";
// ===== Props with a dark outline: trees, bushes, benches, the telescope (cached sprites) =====
const PROP_C = new Map();
function outlinedSprite(key, w, h, paint, after) {
  let cv = PROP_C.get(key); if (cv) return cv;
  const [a, g] = mk(w, h); paint(g);
  const [b, bg] = mk(w + 2, h + 2); bg.drawImage(a, 1, 1); outlinePass(b, OUTL);
  if (after) after(bg); // drawn on top of the outline (grass needs none)
  PROP_C.set(key, b); return b;
}
// grass tufts round a trunk foot, so the outline doesn't end in a hard line on the ground
const TUFT_G = ['#3f7a32', '#2f6126', '#5c9a45'];
function grassFoot(g, cx, by, spread, seed) {
  const r = rng(seed);
  const tuft = (tx, n) => { for (let i = 0; i < n; i++) { const hh = 3 + (r() * 4 | 0), lean = (i - (n - 1) / 2) * .5; for (let k = 0; k < hh; k++) R(g, tx + i + Math.round(lean * k / hh), by - k, 1, 1, k === hh - 1 ? TUFT_G[2] : TUFT_G[i % 2]); } };
  tuft(cx - spread - 4, 5); tuft(cx + spread - 1, 5); tuft(cx - 2, 5); // the middle clump hides the trunk's bottom edge
  if (r() < .6) tuft(cx - spread - 6, 2); if (r() < .6) tuft(cx + spread + 4, 2);
}
const q2 = v => Math.round(v * 2) / 2;
function drawPine(c, x, y, s, time, wind, sh, seed) {
  s = Math.round(s * 20) / 20; const sway = q2(Math.sin(time * 1.2 + seed * 6) * wind);
  shadowE(c, x, y, 9 * s, 3.5 * s, sh);
  const w = Math.ceil(26 * s + 8), h = Math.ceil(32 * s + 6), ax = Math.floor(w / 2), ay = h - 1;
  const spr = outlinedSprite('pine' + s + '|' + sway, w, h, g => {
    R(g, ax - 2, ay - 7 * s, 4, 7 * s, '#6b4a2e'); R(g, ax - 2, ay - 7 * s, 1, 7 * s, '#7d5838');
    const layers = [[11, 9, 0, '#2c6346'], [9, 8, 7, '#357253'], [7, 7, 13, '#40835e'], [4, 6, 18, '#4b9468']];
    layers.forEach(([lw, hh, off, col], i) => {
      const sx = sway * (i + 1) * .35, by = ay - 6 * s - off * s;
      for (let r = 0; r < hh * s; r++) { const ww = Math.round(lw * s * (r / (hh * s))); R(g, ax - ww + sx, by - hh * s + r, ww * 2, 1, col); }
      R(g, ax - Math.round(lw * s * .6) + sx, by - 2, Math.round(lw * s * .6), 1, '#5aab78');
      R(g, ax + sx + 1, by - 2, Math.round(lw * s * .5), 1, shade(col, .82)); // shaded right side of each tier
    });
  }, g => grassFoot(g, ax + 1, ay + 2, 3, 11));
  c.drawImage(spr, Math.round(x - ax - 1), Math.round(y - ay - 1));
}
function drawRoundTree(c, x, y, s, time, wind, sh, seed) {
  s = Math.round(s * 20) / 20; const sway = q2(Math.sin(time * 1.1 + seed * 5) * wind);
  shadowE(c, x, y, 10 * s, 4 * s, sh);
  const w = Math.ceil(26 * s + 10), h = Math.ceil(33 * s + 6), ax = Math.floor(w / 2), ay = h - 1;
  const spr = outlinedSprite('round' + s + '|' + sway, w, h, g => {
    R(g, ax - 2, ay - 9 * s, 4, 9 * s, '#6e4c30'); R(g, ax - 2, ay - 9 * s, 1, 9 * s, '#86603e');
    disc(g, ax + sway * .6, ay - 16 * s, 9 * s, '#3f7d48');
    disc(g, ax + 4 * s + sway * .8, ay - 14 * s, 5 * s, '#356b3d');
    disc(g, ax - 3 * s + sway, ay - 19 * s, 6 * s, '#4f9556');
    disc(g, ax + 4 * s + sway, ay - 18 * s, 5 * s, '#4a8d52');
    disc(g, ax - 1 * s + sway, ay - 22 * s, 3 * s, '#66ad66');
  }, g => grassFoot(g, ax + 1, ay + 2, 3, 17));
  c.drawImage(spr, Math.round(x - ax - 1), Math.round(y - ay - 1));
}
function drawBush(c, x, y, sh, berries) {
  shadowE(c, x, y, 7, 2.5, sh);
  const spr = outlinedSprite('bush' + (berries ? 1 : 0), 18, 15, g => {
    disc(g, 9, 9, 6, '#3f7d48'); disc(g, 7, 7, 4, '#4f9556'); disc(g, 12, 8, 3, '#5aa060'); R(g, 11, 12, 4, 1, '#356b3d');
    if (berries) [[-3, -6], [2, -8], [4, -4], [-1, -3], [0, -9]].forEach(([dx, dy]) => { R(g, 9 + dx, 14 + dy, 2, 2, '#c8303b'); R(g, 9 + dx, 14 + dy, 1, 1, '#f07a7a'); });
  });
  c.drawImage(spr, Math.round(x - 10), Math.round(y - 15));
}
function drawBench(c, sx, sy) {
  const spr = outlinedSprite('bench', 22, 15, g => {
    // backrest, seat, legs
    R(g, 1, 0, 20, 2, '#9a6a3c'); R(g, 1, 0, 20, 1, '#b07e4c'); R(g, 1, 3, 20, 2, '#8a5a32'); R(g, 1, 3, 20, 1, '#a06c3e');
    R(g, 2, 2, 1, 6, '#5d3a20'); R(g, 19, 2, 1, 6, '#5d3a20');
    R(g, 0, 7, 22, 3, '#9a6a3c'); R(g, 0, 7, 22, 1, '#b88a56'); R(g, 0, 9, 22, 1, '#6f4a2d');
    R(g, 2, 10, 2, 5, '#5d3a20'); R(g, 18, 10, 2, 5, '#5d3a20'); R(g, 3, 10, 1, 5, '#4a2e18'); R(g, 19, 10, 1, 5, '#4a2e18');
  });
  c.drawImage(spr, Math.round(sx - 12), Math.round(sy - 15));
}
function drawTelescope(c, sx, sy) {
  shadowE(c, sx, sy, 6, 2, G.sh);
  const spr = outlinedSprite('telescope', 20, 20, g => {
    // tripod
    for (let i = 0; i < 8; i++) { R(g, 9 - Math.round(i * .6), 11 + i, 1, 1, '#3a3e48'); R(g, 10 + Math.round(i * .6), 11 + i, 1, 1, '#2c2f38'); }
    R(g, 9, 11, 2, 9, '#3a3e48'); R(g, 8, 9, 4, 2, '#555b6a');
    // brass tube, tilted up to the sea, with a lens and an eyepiece
    for (let i = 0; i < 14; i++) { const x = 3 + i, y = 9 - Math.round(i * .45); R(g, x, y - 2, 1, 3, i < 4 ? '#a8822e' : '#c9a24a'); R(g, x, y - 2, 1, 1, '#ecd38a'); R(g, x, y, 1, 1, '#8a6a22'); }
    R(g, 16, 1, 2, 4, '#7a5a1a'); R(g, 17, 2, 1, 2, '#9ec7da'); R(g, 1, 8, 2, 2, '#2c2f38');
    R(g, 7, 6, 1, 3, '#8a6a22'); R(g, 12, 4, 1, 3, '#8a6a22'); // brass rings
  });
  c.drawImage(spr, Math.round(sx - 11), Math.round(sy - 20));
}

// ===== Outline for hand-drawn objects (furniture, boats, ladders, signs, herbs...) =====
// The object is drawn into a scratch canvas, then every see-through pixel touching a solid one gets the outline colour.
// Soft things (shadows, glows, wakes) are not solid, so they don't get outlined.
const OL = { a: null, b: null };
// results are kept for a few frames per object, so the per-pixel pass runs ~10 times a second, not every frame
const OL_CACHE = new Map();
function outlineDraw(c, sx, sy, W, H, ax, ay, paint, key) {
  if (key !== undefined) {
    const e = OL_CACHE.get(key), now = G.time;
    if (e && e.W === W && e.H === H && now - e.t < .1 && now >= e.t) { c.drawImage(e.cv, sx - ax, sy - ay); return; }
    const [cv, cg] = e && e.W === W && e.H === H ? [e.cv, e.cv.getContext('2d')] : mk(W, H);
    cg.clearRect(0, 0, W, H); outlineDraw(cg, ax, ay, W, H, ax, ay, paint);
    OL_CACHE.set(key, { cv, W, H, t: now - Math.random() * .03 }); c.drawImage(cv, sx - ax, sy - ay); return;
  }
  if (!OL.a || OL.a.width < W || OL.a.height < H) { OL.a = document.createElement('canvas'); OL.a.width = Math.max(W, 160); OL.a.height = Math.max(H, 140); OL.ag = OL.a.getContext('2d', { willReadFrequently: true }); }
  const g = OL.ag; g.clearRect(0, 0, W, H); g.save(); paint(g, ax, ay); g.restore();
  const im = g.getImageData(0, 0, W, H), d = im.data, solid = i => d[i + 3] >= 200;
  const on = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4; if (solid(i)) continue;
    if ((x > 0 && solid(i - 4)) || (x < W - 1 && solid(i + 4)) || (y > 0 && solid(i - W * 4)) || (y < H - 1 && solid(i + W * 4))) on.push(i);
  }
  if (!on.length) { c.drawImage(OL.a, 0, 0, W, H, sx - ax, sy - ay, W, H); return; }
  const n = parseInt(OUTL.slice(1), 16); for (const i of on) { d[i] = n >> 16 & 255; d[i + 1] = n >> 8 & 255; d[i + 2] = n & 255; d[i + 3] = 255; }
  g.putImageData(im, 0, 0); c.drawImage(OL.a, 0, 0, W, H, sx - ax, sy - ay, W, H);
}
const OUTLINE_KINDS = {
  // furniture and things indoors
  stove: 1, woodbox: 1, table: 1, shelf: 1, chest: 1, store: 1, stairs: 2, bed: 2, desk: 1, souvshelf: 1, chime: 1,
  gen: 1, tools: 1, bench_w: 2, rope: 1, bike: 1, barrel: 1, nets: 1, mech: 1, radio: 1,
  // outdoors
  boat: 2, nadezhda: 2, drift: 1, ladder: 1, sign: 1, post: 1, easel: 1, wreck: 2, tent: 2, tripod: 1, crates: 1, vane: 1,
};
let OLID = 0; const _addObjPlain = addObj;
addObj = function (map, o) {
  const big = OUTLINE_KINDS[o.kind];
  if (big && typeof o.draw === 'function') {
    const d = o.draw, W = big === 2 ? 150 : 84, H = big === 2 ? 120 : 84, ax = W >> 1, ay = big === 2 ? 90 : 64;
    const id = 'o' + (++OLID); o.draw = function (c, sx, sy) { outlineDraw(c, Math.round(sx), Math.round(sy), W, H, ax, ay, (g, x, y) => d.call(this, g, x, y), id); };
  }
  return _addObjPlain(map, o);
};
// tea herbs and the boats that come and go
const _drawHerbPlain = drawHerb;
drawHerb = function (c, x, y, k, t, wind, seed) { outlineDraw(c, Math.round(x), Math.round(y), 24, 20, 12, 17, (g, ox, oy) => _drawHerbPlain(g, ox, oy, k, t, wind, seed), 'h' + k + seed); };
const _drawBoatPlain = drawBoatKind;
drawBoatKind = function (c, x, y, k, time, mv, seed) { outlineDraw(c, Math.round(x), Math.round(y), 150, 110, 75, 70, (g, ox, oy) => _drawBoatPlain(g, ox, oy, k, time, mv, seed), 'b' + k); };
// meadow flowers: a few cached outlined sprites (colour x lean)
function drawFlower(c, x, y, time, wind, seed) {
  const lean = Math.max(-2, Math.min(2, Math.round(Math.sin(time * 2 + seed * 9) * wind * .6))), col = seed % 4;
  const spr = outlinedSprite('flower' + col + '|' + lean, 9, 9, g => {
    const cols = ['#f2e36b', '#f2f2f2', '#e88ab0', '#9bb8f0'], X = 4, Y = 8;
    R(g, X, Y - 3, 1, 3, '#4f8a43'); R(g, X + 1, Y - 2, 1, 1, '#5f9a4c');
    R(g, X - 1 + lean, Y - 5, 3, 1, cols[col]); R(g, X + lean, Y - 6, 1, 3, cols[col]); R(g, X + lean, Y - 5, 1, 1, '#d98a2b');
  });
  c.drawImage(spr, Math.round(x - 5), Math.round(y - 9));
}
