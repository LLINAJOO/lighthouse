"use strict";
// ===== Props with a dark outline: trees, bushes, benches, the telescope (cached sprites) =====
const PROP_C = new Map();
function outlinedSprite(key, w, h, paint) {
  let cv = PROP_C.get(key); if (cv) return cv;
  const [a, g] = mk(w, h); paint(g);
  const [b, bg] = mk(w + 2, h + 2); bg.drawImage(a, 1, 1); outlinePass(b, OUTL);
  PROP_C.set(key, b); return b;
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
  });
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
  });
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
