"use strict";
// ===== Fish icons =====
// ---------- fish ----------
// Diagonal fish: head top-left, tail bottom-right, back on the upper-right side, like a sticker.
const FISH_SPR = {
  fish:     { len: 11.5, hw: u => 2.6 * Math.sin(Math.PI * Math.min(1, (u + .8) / 12.5)), back: '#5f7a98', mid: '#a9c0d4', belly: '#e8f0f6', fin: '#7f98b2', line: '#d8e6f0' },
  herring:  { len: 11.5, hw: u => 2.4 * Math.sin(Math.PI * Math.min(1, (u + .8) / 12.5)), back: '#3e6488', mid: '#9fb8cc', belly: '#eef4f8', fin: '#6f8ca8', line: '#ffffff' },
  cod:      { len: 11, hw: u => 3 * Math.sin(Math.PI * Math.min(1, (u + 1) / 12.5)), back: '#7d7446', mid: '#a8a06a', belly: '#ece4c4', fin: '#8c8657', line: '#efe9cf', spots: '#5f5a34', barbel: true },
  perch:    { len: 10.5, hw: u => 3.3 * Math.sin(Math.PI * Math.min(1, (u + 1) / 12)), back: '#a8332a', mid: '#d84a36', belly: '#f2a27e', fin: '#e06a3a', bars: '#8a2a22', spiny: true },
  wolffish: { len: 11, hw: u => 3 * Math.sin(Math.PI * Math.min(1, (u + 1.4) / 13)), back: '#4a5866', mid: '#6f7e8c', belly: '#b4bec6', fin: '#59636c', bars: '#3a4652', teeth: true, longFin: true },
  trout:    { len: 11, hw: u => 2.8 * Math.sin(Math.PI * Math.min(1, (u + 1) / 12.5)), back: '#56703e', mid: '#9fb87a', belly: '#f2dcc4', fin: '#7f9a62', line: '#e8807a', spots: '#33402a' },
  crucian:  { len: 9.5, hw: u => 4.1 * Math.sin(Math.PI * Math.min(1, (u + .8) / 10.6)), back: '#8a6a22', mid: '#d0a64a', belly: '#f2dc8a', fin: '#b8862e', line: '#f6e2a0' },
  flounder: { len: 9.5, hw: u => 4.8 * Math.sin(Math.PI * Math.min(1, (u + 1) / 10.8)), back: '#8a6f4a', mid: '#a68a62', belly: '#c4a87e', fin: '#7a6040', spots: '#e07a40', twoEyes: true, fringe: true },
  monk:     { len: 10, hw: u => u < 5 ? 4.4 : 4.4 - (u - 5) * .6, back: '#5c4128', mid: '#7a5a3a', belly: '#b89a72', fin: '#6a4a2e', spots: '#4a3220', lure: true, teeth: true, bigMouth: true },
  eel:      { len: 15, hw: u => u < 1 ? 1.2 : 1.4, back: '#334030', mid: '#4f5f45', belly: '#a8a878', fin: '#3e4c38', wave: 1.3, noTail: true },
};
function paintFish(c, sp) {
  const ox = 1.3, oy = 1.3, k = Math.SQRT1_2, SU = 1.0, SV = 1.04, [cv0, g] = [null, c];
  const px = (x, y, col) => R(g, x, y, 1, 1, col);
  const uv = (x, y) => { const dx = x + .5 - ox, dy = y + .5 - oy; return [(dx + dy) * k / SU, (dx - dy) * k / SV]; };
  const wave = u => sp.wave ? Math.sin(u * .75) * sp.wave : 0;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    let [u, v] = uv(x, y); v -= wave(u);
    if (u < -.4) continue;
    const L = sp.len;
    if (u <= L) {
      const hw = sp.hw(Math.max(0, u)) + (u < .6 ? -.6 + u : 0);
      if (Math.abs(v) <= hw) {
        const t = v / Math.max(.1, hw);
        let col = t > .38 ? sp.back : t > -.3 ? sp.mid : sp.belly;
        if (sp.line && Math.abs(t - .05) < .2 && u > 3 && u < L - 1) col = sp.line;
        if (sp.bars && u > 3.5 && u < L - .5 && Math.floor(u / 1.6) % 2 === 0 && t > -.25) col = sp.bars;
        if (sp.spots && t > -.2 && u > 3 && hash(x * 3, y * 7) > .7) col = sp.spots;
        if (sp.twoEyes && t > -.2 && u > 4 && hash(x * 5, y * 3) > .8) col = sp.spots;
        if (u > 2.8 && u < 3.6 && t < .6 && !sp.noTail) col = shade(col, .82); // gill line
        px(x, y, col); continue;
      }
      // dorsal fin along the back
      const fa = sp.longFin ? 3 : 4.5, fb = sp.longFin ? L - .5 : L - 3;
      if (!sp.noTail && v > 0 && u > fa && u < fb && v <= sp.hw(u) + (sp.spiny ? 1.6 : 1.1) * Math.sin(Math.PI * (u - fa) / (fb - fa)) + .2) { px(x, y, sp.spiny && (x + y) % 2 ? shade(sp.fin, .8) : sp.fin); continue; }
      // little belly fin
      if (!sp.noTail && !sp.fringe && v < 0 && u > L - 4 && u < L - 1.5 && -v <= sp.hw(u) + 1) { px(x, y, sp.fin); continue; }
      if (sp.fringe && Math.abs(v) <= sp.hw(u) + .9 && u > 1.5 && u < L - .5) { px(x, y, sp.fin); continue; }
      if (sp.noTail && u > L - 3 && Math.abs(v) <= 2.2 && Math.abs(v) > sp.hw(u)) { px(x, y, sp.fin); continue; }
    } else if (!sp.noTail) {
      const d = u - L;
      if (d < 3.4 && Math.abs(v) <= .7 + d * 1.05 && !(d > 2.4 && Math.abs(v) < .9)) px(x, y, d > 1.6 ? shade(sp.fin, .85) : sp.fin);
    }
  }
}
function fishEye(c, sp) {
  // eye: one white pixel with a dark pupil, set near the head
  const ex = 4, ey = 3 + (sp.wave ? 0 : 0);
  if (sp.wave) { R(c, 3, 4, 1, 1, '#f6f2e6'); R(c, 4, 4, 1, 1, OUTL); return; }
  R(c, ex - 1, ey, 2, 2, '#ffffff'); R(c, ex, ey + 1, 1, 1, OUTL);
  if (sp.twoEyes) { R(c, ex + 2, ey + 2, 2, 2, '#ffffff'); R(c, ex + 3, ey + 3, 1, 1, OUTL); }
}
function iconFish(id, c) {
  const k = id === 'fish' ? 'fish' : id.startsWith('fish_') ? id.slice(5) : null; if (!k || !FISH_SPR[k]) return false;
  const sp = FISH_SPR[k];
  const [a, g] = mk(16, 16); paintFish(g, sp);
  if (sp.lure) { R(g, 5, 0, 1, 2, '#c9b48a'); R(g, 6, 0, 1, 1, '#c9b48a'); R(g, 7, 0, 2, 1, '#ffe28a'); }
  outlinePass(a, OUTL);
  fishEye(g, sp);
  if (sp.teeth) { R(g, 2, 5, 1, 1, '#f6f2e6'); R(g, 3, 6, 1, 1, '#f6f2e6'); }
  if (sp.barbel) { R(g, 3, 6, 1, 1, sp.fin); }
  if (sp.lure) R(g, 7, 0, 2, 1, '#ffe28a');
  c.drawImage(a, 0, 0); return true;
}
