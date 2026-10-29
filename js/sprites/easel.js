"use strict";
// ===== Sonya's easel =====
// ---------- Sonya's easel: a real A-frame, carried to the overlook and back every day ----------
const EASEL_C = new Map();
function sonyaPainting() { return (G.npcs || []).some(n => n.id === 'sonya' && !n.moving && Math.abs(n.x - 46.4 * T) < 6 && Math.abs(n.y - 13.8 * T) < 6); }
function paintCanvasPic(g, x, y, w, h, d, ex = {}) {
  // what is on the canvas changes with the days: green sea after the storm, fog, sunset, night with the light
  const sky = { 4: '#9fd0e0', 5: '#c9d2d8', 6: '#f2a46a', 7: '#1d2a50' }[d] || '#9fd0e0';
  const sea = { 4: '#3f9a7a', 5: '#9aa8b0', 6: '#4a6a9a', 7: '#16224a' }[d] || '#3b7ea0';
  R(g, x, y, w, h, sky); R(g, x, y + Math.round(h * .6), w, h - Math.round(h * .6), sea);
  if (d === 6) { R(g, x, y + 2, w, 1, '#f6c88a'); R(g, x + w - 4, y + 2, 2, 2, '#ffe08a'); }
  if (d === 5) { R(g, x + 1, y + 3, w - 2, 1, '#e3e8ea'); R(g, x + 2, y + 6, w - 4, 1, '#e3e8ea'); }
  if (d === 7) { R(g, x + 1, y + 1, 1, 1, '#ffffff'); R(g, x + w - 3, y + 2, 1, 1, '#ffffff'); }
  const lx = x + Math.round(w * .35);
  R(g, lx, y + 2, 2, h - 4, d === 7 ? '#c9c2b0' : '#f4efe4'); R(g, lx, y + 4, 2, 1, '#c8443a'); R(g, lx, y + 6, 2, 1, '#c8443a'); R(g, lx - 1, y + 1, 4, 1, '#3a3030');
  if (d === 7) { R(g, lx - 3, y + 2, 2, 1, '#ffd477'); R(g, lx + 3, y + 2, 3, 1, '#ffd477'); R(g, lx, y + 2, 2, 1, '#fff6d0'); }
  else if (d >= 6) R(g, lx, y + 2, 2, 1, '#ffd477');
  R(g, x, y + Math.round(h * .6), w, 1, shade(sea, 1.25));
  if (ex.me) { R(g, x + w - 3, y + h - 6, 1, 1, '#f0c8a0'); R(g, x + w - 3, y + h - 7, 1, 1, '#c8553d'); R(g, x + w - 4, y + h - 5, 3, 2, '#2f5d8a'); }
  if (ex.cat) { R(g, x + 1, y + h - 3, 2, 1, '#e58a3a'); R(g, x + 1, y + h - 4, 1, 1, '#e58a3a'); }
}
function easelSprite(d, shells, ex = {}) {
  const key = d + '|' + shells + '|' + (ex.me ? 1 : 0) + (ex.cat ? 1 : 0); let cv = EASEL_C.get(key); if (cv) return cv;
  const [a, g] = mk(26, 30), ax = 13, ay = 28, wood = '#9a6a3c', woodD = '#6f4a28', woodL = '#c08a52';
  const r = (x, y, w, h, col) => R(g, ax + x, ay + y, w, h, col);
  // back leg (behind, darker), then the two front legs splaying out
  for (let i = 0; i < 22; i++) r(1 + Math.floor(i / 7), -24 + i, 1, 1, woodD);
  for (let i = 0; i < 24; i++) { const k = i / 23; r(Math.round(-1 - k * 6), -24 + i, 1, 1, wood); r(Math.round(k * 6), -24 + i, 1, 1, wood); }
  r(-1, -25, 2, 2, woodL); // top joint
  // ledge with a little tray of paints
  r(-9, -9, 18, 2, woodL); r(-9, -8, 18, 1, woodD);
  // canvas on the ledge, clamp at the top
  r(-6, -22, 12, 13, '#f4efe4'); paintCanvasPic(g, ax - 5, ay - 21, 10, 11, d, ex);
  r(-1, -23, 2, 2, woodD);
  // paint pots on the ledge
  r(-9, -11, 2, 2, '#c8443a'); r(7, -11, 2, 2, '#3b7ea0'); r(7, -12, 2, 1, '#e8c55a');
  // brushes in a jar on the ground, rag
  r(8, -4, 3, 4, '#7fb0c0'); r(8, -7, 1, 3, '#8a5a32'); r(10, -8, 1, 4, '#8a5a32'); r(10, -9, 1, 1, '#c8443a'); r(8, -8, 1, 1, '#3b7ea0');
  r(-12, -2, 4, 2, '#e8d8a8'); r(-11, -2, 1, 1, '#c8443a'); r(-10, -1, 1, 1, '#3b7ea0');
  outlinePass(a, OUTL);
  // shells pinning the cloth so the wind doesn't take it
  if (shells) [[-9, -1, '#f2e6dc'], [5, -1, '#f6d8c8'], [-1, 0, '#efe3cf']].forEach(([x, y, col]) => { r(x, y, 2, 1, col); r(x, y - 1, 1, 1, shade(col, .85)); });
  EASEL_C.set(key, a); return a;
}
function drawEasel(c, sx, sy) {
  if (!sonyaPainting()) return;
  c.fillStyle = 'rgba(20,28,40,.25)'; c.beginPath(); c.ellipse(sx, sy, 8, 2.2, 0, 0, 7); c.fill();
  c.drawImage(easelSprite(Math.max(4, Math.min(7, S.day)), (S.q.shells | 0) >= 2, { me: S.flags.eve6s && S.day >= 6 && !(S.day === 6 && G.quiet), cat: catKept() && S.day >= 7 }), Math.round(sx) - 13, Math.round(sy) - 28);
}
// folded easel on her back and the wrapped canvas under her arm while she walks
function drawSonyaCarry(c, x, y, dir, layer) {
  x = Math.round(x); y = Math.round(y);
  const behind = dir === 0 || dir === 1 || dir === 2;
  if ((layer === 'back') === behind) {
    const ox = dir === 1 ? 3 : dir === 2 ? -4 : 0;
    R(c, x + ox - 2, y - 23, 4, 16, OUTL); R(c, x + ox - 1, y - 22, 2, 14, '#9a6a3c'); R(c, x + ox - 1, y - 22, 1, 14, '#c08a52'); R(c, x + ox - 2, y - 15, 4, 1, '#5a3a20');
  }
  if (layer === 'front' && dir !== 3) {
    const cx = dir === 1 ? x - 6 : dir === 2 ? x + 3 : x + 4;
    R(c, cx - 1, y - 11, 7, 7, OUTL); R(c, cx, y - 10, 5, 5, '#e8dcc0'); R(c, cx, y - 8, 5, 1, '#b8a888'); R(c, cx + 2, y - 10, 1, 5, '#b8a888');
  }
}
