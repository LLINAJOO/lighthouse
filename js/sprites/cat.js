"use strict";
// ===== The ginger cat =====
// ---------- cat: ginger, outlined, after the reference sticker ----------
const CATPAL = { O: '#e58a3a', D: '#b9622a', L: '#f6c890', E: '#2a1a14', n: '#e8857a', c: '#8a4a1a', g: '#9b958b', G: '#7d776e', b: '#8fb3c8' };
const CAT_OUT = '#4a2412', CAT_WH = '#7a4a2a';
const CATG = {
  walkA: ['.O....O....OO..', '.OOOOOO......D.', '.OEOOEO......O.', 'wOOnnOOODOODOO.', 'wLLLLOOODOODOO.', '..LLOOOOOOOOO..', '..O.O....O.O...', '..L.L....L.L...'],
  walkB: ['.O....O....OO..', '.OOOOOO......D.', '.OEOOEO......O.', 'wOOnnOOODOODOO.', 'wLLLLOOODOODOO.', '..LLOOOOOOOOO..', '...OO.....OO...', '...LL.....LL...'],
  headF: ['O....O', 'OOOOOO', 'OEOOEO', 'OOnnOO'],
  headB: ['O....O', 'OOOOOO', 'ODOODO', 'OOOOOO'],
  sitF: ['.LLLL.', 'OOLLOO', 'OOLLOO', 'LL..LL'],
  sitB: ['.OOOO.', 'OODDOO', 'OOOOOO', 'OOOOOO'],
  walkF: ['.LLLL.', '.OOOO.'], walkBk: ['.OOOO.', '.ODDO.'],
  sleep: ['.......O...O', '..OOOOOOOOOO', '.ODOODOOcOcO', 'OOOOOOOOOnOO', 'ODDDDDDOLLLO'],
  sleepUp: ['.......O...O', '...OOOOOOOOO', '..OOOOOOOOOO', '.ODOODOOcOcO', 'OOOOOOOOOnOO', 'ODDDDDDOLLLO'],
};
const CCACHE = new Map(), CW = 24, CH = 20, CAX = 12, CAY = 18;
function catSprite(key, paint) {
  let cv = CCACHE.get(key); if (cv) return cv;
  const [a, g] = mk(CW, CH), post = [];
  const put = (grid, ox, oy, sub = {}) => grid.forEach((row, r) => { for (let i = 0; i < row.length; i++) { let ch = row[i]; if (ch === '.') continue; if (sub[ch]) ch = sub[ch]; if (ch === 'w') { post.push([ox + i, oy + r]); continue; } R(g, ox + i, oy + r, 1, 1, CATPAL[ch]); } });
  const px = (x, y, ch) => R(g, x, y, 1, 1, CATPAL[ch]);
  paint(put, px);
  outlinePass(a, CAT_OUT);
  post.forEach(([x, y]) => { R(g, x, y, 1, 1, CAT_WH); R(g, x - 1, y, 1, 1, CAT_WH); });
  CCACHE.set(key, a); return a;
}
function flipCv(a) { const [b, h] = mk(a.width, a.height); h.translate(a.width, 0); h.scale(-1, 1); h.drawImage(a, 0, 0); return b; }
function drawCat(c, x, y, st, dir, t) {
  x = Math.round(x); y = Math.round(y);
  c.fillStyle = 'rgba(20,28,40,.25)'; c.beginPath(); c.ellipse(x, y, 6, 1.8, 0, 0, 7); c.fill();
  let key, paint, flip = false;
  if (st === 'sleep') {
    const br = Math.sin(t * 2) > 0 ? 1 : 0, gr = br ? CATG.sleepUp : CATG.sleep;
    key = 'sleep' + br; paint = put => put(gr, CAX - 6, CAY - gr.length);
    c.drawImage(catSprite(key, paint), x - CAX, y - CAY);
    const zt = (t * .8) % 3; if (zt < 2) { c.globalAlpha = 1 - zt / 2; R(c, x + 6 + zt * 3, y - 10 - zt * 4, 3, 1, '#e9f0ff'); R(c, x + 7 + zt * 3, y - 9 - zt * 4, 1, 1, '#e9f0ff'); R(c, x + 6 + zt * 3, y - 8 - zt * 4, 3, 1, '#e9f0ff'); c.globalAlpha = 1; }
    return;
  }
  if (st === 'walk') {
    const f = Math.floor(t * 9) % 4;
    if (dir === 1 || dir === 2) {
      const gr = f % 2 ? CATG.walkB : CATG.walkA, sw = Math.round(Math.sin(t * 5));
      key = 'ws' + (f % 2) + sw; flip = dir === 2;
      paint = (put, px) => { put(gr, CAX - 7, CAY - gr.length); if (sw > 0) px(CAX - 7 + 13, CAY - gr.length - 1, 'O'); if (sw < 0) px(CAX - 7 + 10, CAY - gr.length, 'O'); };
    } else {
      const lift = f % 2, bk = dir === 3;
      key = 'wf' + (bk ? 'b' : 'f') + lift + Math.round(Math.sin(t * 5));
      const sw = Math.round(Math.sin(t * 5));
      paint = (put, px) => {
        const oy = CAY - 8, ox = CAX - 3;
        if (bk) { [[3, -1], [3, -2], [3 + sw, -3], [3 + sw, -4]].forEach(([a, b]) => px(ox + a, oy + b, 'O')); px(ox + 3 + sw, oy - 5, 'D'); }
        put(bk ? CATG.headB : CATG.headF, ox, oy); put(bk ? CATG.walkBk : CATG.walkF, ox, oy + 4);
        px(ox + 1, oy + 6, 'O'); px(ox + 4, oy + 6, 'O'); px(ox + 1, oy + 7 - lift, 'L'); px(ox + 4, oy + 6 + lift, 'L');
      };
    }
    let cv = catSprite(key, paint); if (flip) { const k2 = key + 'F'; cv = CCACHE.get(k2) || (CCACHE.set(k2, flipCv(cv)), CCACHE.get(k2)); }
    c.drawImage(cv, x - CAX, y - CAY); return;
  }
  // sitting poses: sit, lick, eat, pet
  const bk = dir === 3, closed = st === 'pet' || (st === 'sit' && Math.sin(t * .7) > .9);
  const hdy = st === 'eat' ? 3 : st === 'lick' && Math.sin(t * 6) > 0 ? 1 : 0, paw = st === 'lick' && Math.sin(t * 6) > 0;
  const sw = Math.round(Math.sin(t * 2.5) * 1.2);
  key = 's' + st + (bk ? 'b' : 'f') + hdy + (closed ? 1 : 0) + (paw ? 1 : 0) + sw; flip = dir === 1;
  paint = (put, px) => {
    const ox = CAX - 3, oy = CAY - 8;
    // tail curling round to the side
    [[6, 7], [7, 7], [8, 6], [8 + (sw > 0 ? 1 : 0), 5], [8 + sw, 4]].forEach(([a, b], i) => px(ox + a, oy + b, i === 4 ? 'D' : 'O'));
    put(bk ? CATG.sitB : CATG.sitF, ox, oy + 4);
    put(bk ? CATG.headB : CATG.headF, ox, oy + hdy, closed ? { E: 'c' } : {});
    if (paw && !bk) { px(ox + 1, oy + 4, 'L'); px(ox + 1, oy + 3, 'L'); }
    if (st === 'eat') { for (let i = -1; i < 7; i++) px(ox + i, oy + 8, i < 0 || i > 5 ? 'G' : 'g'); for (let i = 0; i < 6; i++) px(ox + i, oy + 9, 'G'); px(ox + 1, oy + 7, 'b'); px(ox + 4, oy + 7, 'b'); }
  };
  let cv = catSprite(key, paint); if (flip) { const k2 = key + 'F'; cv = CCACHE.get(k2) || (CCACHE.set(k2, flipCv(cv)), CCACHE.get(k2)); }
  c.drawImage(cv, x - CAX, y - CAY);
}
