"use strict";
// ===== The ride home: the keeper on the stern of the cutter, the island and its light falling behind at sunset =====
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const hexRGB = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixHex = (a, b, k) => { const A = hexRGB(a), B = hexRGB(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
// a band of colours between two palettes, drawn row by row with ordered dithering between neighbouring bands
function ditherBands(c, x0, y0, w, h, pal0, flip) {
  const pal = []; pal0.forEach((col, i) => { pal.push(col); if (i < pal0.length - 1) pal.push(mixHex(col, pal0[i + 1], .5)); }); // finer bands
  const n = pal.length - 1;
  for (let y = 0; y < h; y++) {
    const f = (flip ? 1 - y / h : y / h) * n, i = Math.min(n - 1, Math.floor(f)), frac = f - i;
    // solid bands with a narrow dithered seam between them (cleaner than dithering everything)
    const z = clamp((frac - .62) / .38, 0, 1);
    if (z <= 0) { c.fillStyle = pal[i]; c.fillRect(x0, y0 + y, w, 1); continue; }
    for (let x = 0; x < w; x += 1) { const th = (BAYER[(y & 3) * 4 + (x & 3)] + .5) / 16; c.fillStyle = z > th ? pal[i + 1] : pal[i]; c.fillRect(x0 + x, y0 + y, 1, 1); }
  }
}
const SKY_A = ['#2d2c60', '#5a3c7a', '#9c4f7c', '#d86a6c', '#f39a5f', '#ffd17c'], SKY_B = ['#0a0f27', '#17194a', '#33285f', '#5e356a', '#9f4d68', '#d9805a'];
const SEA_A = ['#f6b56e', '#c86a6a', '#7a4a7a', '#3f3a6c', '#262b55'], SEA_B = ['#a85a5c', '#5a3a66', '#2e2c58', '#1b2148', '#10163a'];
const RH = { sky: null, skyK: -1, sea: null, seaK: -1 };
function rideSky(w, hor, k) {
  const q = Math.round(k * 24) / 24; if (RH.sky && RH.skyK === q && RH.sky.width === w) return RH.sky;
  const [cv, g] = RH.sky && RH.sky.width === w ? [RH.sky, RH.sky.getContext('2d')] : mk(w, hor);
  ditherBands(g, 0, 0, w, hor, SKY_A.map((a, i) => mixHex(a, SKY_B[i], q)));
  RH.sky = cv; RH.skyK = q; return cv;
}
function rideSea(w, hh, k) {
  const q = Math.round(k * 24) / 24; if (RH.sea && RH.seaK === q && RH.sea.width === w) return RH.sea;
  const [cv, g] = RH.sea && RH.sea.width === w ? [RH.sea, RH.sea.getContext('2d')] : mk(w, hh);
  ditherBands(g, 0, 0, w, hh, SEA_A.map((a, i) => mixHex(a, SEA_B[i], q)));
  RH.sea = cv; RH.seaK = q; return cv;
}
// the cutter that takes the keeper home, side view facing right
function cutterSprite() {
  return outlinedSprite('cutter', 78, 30, g => {
    // hull: white topsides, a red stripe, a dark bottom; the deck sweeps up gently to the bow on the right
    for (let x = 0; x < 78; x++) {
      const top = 18 - Math.round(Math.max(0, x - 62) ** 2 / 90), bot = 28 - Math.round(((x - 34) / 44) ** 2 * 6) - (x > 72 ? (x - 72) * 2 : 0);
      for (let y = top; y <= bot; y++) { const r = y - top; R(g, x, y, 1, 1, r < 3 ? (x > 60 ? '#f4efe6' : '#ece6da') : r < 5 ? '#b23e3a' : r < 6 ? '#8c2e2c' : y > bot - 1 ? '#1a2440' : '#24304e'); }
      R(g, x, top, 1, 1, '#ffffff');
    }
    for (let x = 6; x < 60; x += 5) R(g, x, 23, 2, 1, '#f2eee6'); // portholes in the stripe
    // rail along the deck
    for (let x = 2; x < 66; x++) R(g, x, 15, 1, 1, '#c9c2b4'); for (let x = 2; x < 66; x += 6) R(g, x, 15, 1, 3, '#c9c2b4');
    // wheelhouse and cabin
    R(g, 30, 6, 26, 12, '#e6e0d2'); R(g, 30, 6, 26, 1, '#ffffff'); R(g, 28, 4, 30, 2, '#5a6478'); R(g, 54, 6, 2, 12, '#cfc8b8');
    // mast and a small flag
    R(g, 44, 0, 1, 5, '#3a3e48'); R(g, 45, 0, 4, 2, '#3d6db0');
    // a lifebuoy on the cabin wall
    R(g, 32, 11, 3, 3, '#e86a3a'); R(g, 33, 12, 1, 1, '#e6e0d2');
  });
}
function drawRideHome(c, w, h, t, k, o = {}) {
  const hor = Math.round(h * .58), ks = smooth(k);
  c.drawImage(rideSky(w, hor, ks), 0, 0);
  // stars come out as the sun goes down
  const starA = clamp((ks - .35) * 1.8, 0, 1);
  if (starA > 0) for (const [sx, sy, sp] of STARS) { if (sy * h > hor - 10) continue; c.globalAlpha = starA * (.35 + .65 * Math.abs(Math.sin(t * (1 + sp * 2) + sp * 40))); R(c, sx * w, sy * h * .9, sp > .9 ? 2 : 1, 1, '#fff6e0'); }
  c.globalAlpha = 1;
  // the sun: sinking into the sea, with soft bands cut through its lower half
  const sunX = Math.round(w * .7), sunY = Math.round(lerp(hor - 30, hor + 14, ks)), sr = 15;
  if (sunY - sr < hor) {
    c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(sunX, sunY, 4, sunX, sunY, 70); gl.addColorStop(0, `rgba(255,200,120,${.45 * (1 - ks)})`); gl.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = gl; c.fillRect(sunX - 70, sunY - 70, 140, 140); c.globalCompositeOperation = 'source-over';
    for (let dy = -sr; dy <= sr; dy++) { const y = sunY + dy; if (y >= hor) break; const ww = Math.round(Math.sqrt(sr * sr - dy * dy)); if (dy > 2 && (dy % 4 === 0 || (dy > 8 && dy % 4 === 3))) continue; R(c, sunX - ww, y, ww * 2 + 1, 1, mixHex('#fff3b8', '#ff8a5a', (dy + sr) / (2 * sr))); }
  }
  // long soft clouds, lit from below by the low sun
  [[.12, 28, 74, 0], [.5, 42, 100, 1], [.86, 22, 62, 2], [.3, 62, 56, 3]].forEach(([fx, cy, cw, i]) => {
    const cx = Math.round(((fx * w + t * (1.2 + i * .3)) % (w + cw)) - cw / 2), lit = mixHex('#ffc39a', '#8a4f7a', ks), body = mixHex('#c27a92', '#3e2d5e', ks), top = mixHex('#a86a8c', '#33285a', ks);
    const rows = [[.28, .42, top], [.12, .78, body], [0, 1, body], [.06, .9, lit]];
    rows.forEach(([a, b2, col], r) => R(c, cx + Math.round(cw * a), cy - 3 + r, Math.round(cw * (b2 - a)), 1, col));
    R(c, cx + Math.round(cw * .55), cy - 4, Math.round(cw * .22), 1, top); R(c, cx + Math.round(cw * .2), cy + 1, Math.round(cw * .5), 1, lit);
  });
  // the mainland ahead, with lights coming on
  const ml = clamp((k - .4) * 2.2, 0, 1);
  if (ml > 0) { c.globalAlpha = ml; c.fillStyle = mixHex('#5a3f6a', '#1f1c3e', ks); c.beginPath(); c.moveTo(w * .55, hor + 1); for (let x = w * .55; x <= w + 4; x += 4) c.lineTo(x, hor - 2 - Math.sin(x * .06) * 1.5 - (x - w * .55) * .045); c.lineTo(w, hor + 1); c.fill();
    for (let i = 0; i < 16; i++) { if (hash(i, 31) > ml * 1.2) continue; R(c, w * .6 + hash(i, 8) * w * .4, hor - 2 - hash(i, 4) * (hash(i, 8) * 7), 1, 1, Math.sin(t * 2 + i) > -.6 ? '#ffd477' : '#c49a52'); } c.globalAlpha = 1; }
  // sea
  c.drawImage(rideSea(w, h - hor, ks), 0, hor);
  R(c, 0, hor, w, 1, mixHex('#ffd9a0', '#7a5a8a', ks));
  // sun path on the water: broken strokes that widen toward us
  const pathA = clamp(1 - (ks - .45) * 2.2, 0, 1);
  if (pathA > 0) for (let y = hor + 2; y < h; y += 2) { const d = y - hor, ww = 2 + d * .32 + Math.sin(y * .9 + t * 2.3) * (1 + d * .05); if (Math.sin(t * 3.1 + y * 1.7) < -.35) continue; c.globalAlpha = pathA * (.9 - d / (h - hor) * .5); R(c, sunX - ww + Math.sin(y + t) * 2, y, ww * 2, 1, y < hor + 20 ? '#ffe2a0' : '#ffb27a'); }
  c.globalAlpha = 1;
  // ripples drifting past (the boat is moving right)
  for (let i = 0; i < 70; i++) { const y = hor + 3 + Math.pow(hash(i, 5), 1.5) * (h - hor - 3), d = (y - hor) / (h - hor), x = ((hash(i, 6) * (w + 60) - t * (8 + d * 40)) % (w + 60) + w + 60) % (w + 60) - 30; if (Math.sin(t * 1.3 + i) < 0) continue; R(c, x, y, 2 + d * 8, 1, mixHex('#ffcfa0', '#8a8ac0', ks) + (d > .5 ? '' : '')); }
  // the island falling behind
  const s = lerp(1, .42, ks), ix = lerp(w * .24, -w * .04, ks), base = hor + 1, land = mixHex('#3a2c52', '#121630', ks), land2 = mixHex('#4a3560', '#191d3a', ks);
  c.fillStyle = land; c.beginPath(); c.moveTo(ix - 92 * s, base); c.lineTo(ix - 66 * s, base - 10 * s); c.lineTo(ix - 34 * s, base - 17 * s); c.lineTo(ix - 14 * s, base - 24 * s); c.lineTo(ix + 20 * s, base - 24 * s); c.lineTo(ix + 44 * s, base - 14 * s); c.lineTo(ix + 82 * s, base - 6 * s); c.lineTo(ix + 104 * s, base); c.fill();
  const ridge = [[-92, 0], [-66, 10], [-34, 17], [-14, 24], [20, 24], [44, 14], [82, 6], [104, 0]];
  const landTop = dx => { for (let j = 1; j < ridge.length; j++) if (dx <= ridge[j][0]) { const [x0, h0] = ridge[j - 1], [x1, h1] = ridge[j]; return lerp(h0, h1, (dx - x0) / (x1 - x0)); } return 0; };
  for (let i = 0; i < 6; i++) { const dx = -62 + i * 8, tx = ix + dx * s, ty = base - (landTop(dx) - 1.5) * s,  th = (12 + (i % 3) * 3) * s; c.fillStyle = i % 2 ? land2 : land; c.beginPath(); c.moveTo(tx, ty - th); c.lineTo(tx - 5 * s, ty); c.lineTo(tx + 5 * s, ty); c.fill(); }
  // the lighthouse: stripes while there's light, a silhouette with a burning lamp later
  const lx = Math.round(ix), lb = base - 24 * s, lt = lb - 52 * s, stripeA = clamp(1 - ks * 1.6, 0, 1);
  for (let y = Math.floor(lt); y < lb; y++) { const f = (y - lt) / (lb - lt), hw = (4 + f * 3) * s, band = Math.floor(f * 5) % 2; R(c, lx - hw, y, hw * 2, 1, mixHex(band ? '#b8524e' : '#e6d8c8', land, 1 - stripeA * .85)); R(c, lx + hw * .3, y, hw * .7, 1, mixHex(band ? '#8a3a3a' : '#b8a8a0', land, 1 - stripeA * .85)); }
  R(c, lx - 6 * s, lt - 2 * s, 12 * s, 2 * s, land); R(c, lx - 4 * s, lt - 8 * s, 8 * s, 6 * s, '#ffd477'); R(c, lx - 5 * s, lt - 10 * s, 10 * s, 2 * s, land); R(c, lx - 1, lt - 13 * s, 2, 3 * s, land);
  R(c, lx + 9 * s, lb - 7 * s, 16 * s, 7 * s, mixHex('#d6cdbb', land, 1 - stripeA * .8)); R(c, lx + 8 * s, lb - 9 * s, 18 * s, 2 * s, mixHex('#6c584a', land, .6)); R(c, lx + 13 * s, lb - 5 * s, 3 * s, 2 * s, '#ffd477');
  // friends on the pier, waving, while they can still be seen
  const who = presentAtFarewell(), cols = { matvey: '#e7b521', lida: '#3c6db0', sonya: '#e9d9b8', nyura: '#6a8a4a' };
  if (ks < .55 && !o.noBoat) { c.globalAlpha = clamp((.55 - ks) * 4, 0, 1); who.forEach((id, i) => { const px = Math.round(ix + 48 * s + i * 5 * s), py = Math.round(base - 8 * s); R(c, px, py - 4, 2, 4, cols[id] || '#ccc'); R(c, px, py - 6, 2, 2, '#e8c4a0'); if (Math.sin(t * 6 + i * 1.3) > 0) R(c, px + 2, py - 7, 1, 3, '#e8c4a0'); }); c.globalAlpha = 1; }
  if ((S.flags.boat | 0) >= 4) { const nx = Math.round(ix + 70 * s), ny = base + 2; R(c, nx - 6 * s, ny - 2, 12 * s, 2, land2); if ((S.flags.boat | 0) >= 5) { R(c, nx, ny - 12 * s, 1, 10 * s, land); c.fillStyle = mixHex('#efe6d6', land, .5); c.beginPath(); c.moveTo(nx + 1, ny - 11 * s); c.lineTo(nx + 7 * s, ny - 3); c.lineTo(nx + 1, ny - 3); c.fill(); } }
  // the beam sweeps round; it gets stronger as it gets dark
  const beamA = clamp(.25 + ks * .9, 0, 1), a = t * .8, dx = Math.cos(a), len = w * (.35 + .65 * Math.abs(dx)), bw = 3 + 18 * (1 - Math.abs(Math.sin(a))), ly = lt - 5 * s;
  c.globalCompositeOperation = 'lighter';
  const gr = c.createLinearGradient(lx, 0, lx + Math.sign(dx || 1) * len, 0); gr.addColorStop(0, `rgba(255,225,150,${.5 * beamA})`); gr.addColorStop(1, 'rgba(255,225,150,0)');
  c.fillStyle = gr; c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + Math.sign(dx || 1) * len, ly - bw); c.lineTo(lx + Math.sign(dx || 1) * len, ly + bw * .5); c.fill();
  const hg = c.createRadialGradient(lx, ly, 0, lx, ly, 16 + 14 * ks); hg.addColorStop(0, `rgba(255,220,140,${.4 + .4 * ks})`); hg.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = hg; c.fillRect(lx - 40, ly - 40, 80, 80);
  // its glitter on the water at dusk
  if (ks > .3) for (let y = hor + 3; y < hor + 26; y += 2) { if (Math.sin(t * 4 + y * 2.1) < .1) continue; c.globalAlpha = (ks - .3) * (1 - (y - hor) / 30); R(c, lx - 2 + Math.sin(y + t * 2) * 2, y, 3 + (y - hor) * .15, 1, '#ffd890'); }
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  if (o.noBoat) return; // the title screen: just the island, the sea and the sunset
  // gulls following the boat for a while
  const bx = Math.round(w * .56), by = Math.round(hor + 30 + Math.sin(t * 1.5) * 1.2);
  if (ks < .7) { c.globalAlpha = clamp((.7 - ks) * 3, 0, 1); for (let i = 0; i < 3; i++) { const gx = Math.round(bx - 40 + i * 22 + Math.sin(t * .7 + i * 2) * 8), gy = Math.round(hor - 24 - i * 9 + Math.sin(t * 1.1 + i) * 4), up = Math.sin(t * 6 + i * 2) > 0; c.fillStyle = mixHex('#fff4e6', '#c9c0d8', ks); R(c, gx, gy, 1, 1, c.fillStyle); R(c, gx - 1, gy - (up ? 1 : 0), 1, 1, c.fillStyle); R(c, gx - 2, gy - (up ? 2 : -1), 1, 1, c.fillStyle); R(c, gx + 1, gy - (up ? 1 : 0), 1, 1, c.fillStyle); R(c, gx + 2, gy - (up ? 2 : -1), 1, 1, c.fillStyle); } c.globalAlpha = 1; }
  // the seal pup sees us off for a bit
  if (S.flags.pupFriend && ks < .4) { const sx = Math.round(bx - 58 + t * 1.5), sy = hor + 42 + Math.round(Math.sin(t * 2) * 1); c.globalAlpha = clamp((.4 - ks) * 5, 0, 1); R(c, sx - 3, sy - 4, 6, 4, '#5a6270'); R(c, sx - 2, sy - 5, 4, 1, '#6c7584'); R(c, sx + 1, sy - 3, 1, 1, '#11141a'); R(c, sx - 6, sy, 12, 1, '#c9d4e6'); c.globalAlpha = 1; }
  // wake: foam spreading behind the stern
  const sternX = bx - 39, wl = by + 1;
  for (let i = 0; i < 60; i++) { const d = i * 2.2, spread = d * .18, x = sternX - d; if (x < -4) break; const fl = Math.sin(t * 5 + i * 1.7); if (fl < -.2) continue; c.globalAlpha = clamp(1 - d / 140, 0, 1) * .9; R(c, x, wl + spread + (fl > .6 ? 1 : 0), 2, 1, '#f4f0ea'); R(c, x + 1, wl - spread * .4, 1, 1, '#e8e4f0'); }
  c.globalAlpha = 1;
  // the cutter, rocking gently
  const cs = cutterSprite(); c.drawImage(cs, bx - 40, by - 30);
  // bow spray and a dark waterline
  if (Math.sin(t * 4) > -.3) { R(c, bx + 36, by - 4, 2, 1, '#ffffff'); R(c, bx + 38, by - 6, 1, 1, '#ffffff'); }
  R(c, bx - 36, by, 70, 1, mixHex('#3a3060', '#0c1230', ks));
  // warm windows once it's getting dark
  const winA = clamp((ks - .25) * 2, 0, 1); if (winA > 0) { c.globalAlpha = winA; [[-7, -21], [-1, -21], [5, -21], [11, -21]].forEach(([dx, dy]) => R(c, bx + dx, by + dy, 4, 3, '#ffd477')); c.globalAlpha = 1; } else [[-7, -21], [-1, -21], [5, -21], [11, -21]].forEach(([dx, dy]) => R(c, bx + dx, by + dy, 4, 3, '#7aa0c8'));
  // the keeper at the stern, looking back at the light; the cat beside him
  drawPerson(c, bx - 28, by - 11, LOOKS.hero, { dir: 1, act: ks < .45 && Math.sin(t * 1.6) > .4, t, noShadow: true });
  if (catKept()) drawCat(c, bx - 19, by - 11, 'sit', 1, t);
}
