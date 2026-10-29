"use strict";
// ===== Dialogue portraits: detailed 48x48 busts, Stardew-style, outlined like the rest =====
const PORTRAIT = {
  hero: { hair: 'short', brows: 'soft', stubble: true, collar: 'scarf' },
  matvey: { hair: 'oldwhite', beard: 'big', brows: 'bushy', wrinkles: 2, collar: 'raincoat' },
  lida: { hair: 'pony', fem: true, freckles: true, collar: 'strap' },
  sonya: { hair: 'braids', fem: true, kid: true, collar: 'smock' },
  gromov: { hair: 'greyshort', brows: 'stern', mustache: true, wrinkles: 1, collar: 'uniform' },
  belov: { hair: 'darkshort', beard: 'trim', brows: 'soft', collar: 'captain' },
  nyura: { hair: 'braid', fem: true, freckles: true, collar: 'binoculars' },
};
const PCACHE2 = new Map();
function portraitSprite(look, talk, blink) {
  const key = look + (talk ? 't' : '') + (blink ? 'b' : ''); let cv = PCACHE2.get(key); if (cv) return cv;
  const L = LOOKS[look], P = PORTRAIT[look] || {}, [a, g] = mk(48, 48);
  const px = (x, y, col) => R(g, x, y, 1, 1, col), rect = (x, y, w, h, col) => R(g, x, y, w, h, col);
  const oval = (cx, cy, rx, ry, col, cut) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1 && (!cut || cut(x, y))) px(x, y, col); } };
  const skin = L.skin, skS = shade(skin, .86), skD = shade(skin, .74), hair = L.hair, hS = shade(hair, .78), hL = shade(hair, 1.18);
  const coat = L.coat, coatS = L.coat2, kid = !!P.kid, fem = !!P.fem;
  const fy = kid ? 2 : 0; // kids: head a little lower and rounder
  // ---- body and shoulders
  for (let y = 38; y < 48; y++) { const w = Math.min(22, 12 + (y - 38) * 2); rect(24 - w, y, w * 2, 1, coat); }
  for (let y = 40; y < 48; y++) rect(24 + Math.min(21, 10 + (y - 38) * 2) - 3, y, 3, 1, coatS);
  rect(20, 33 + fy, 8, 7, skS); rect(20, 33 + fy, 8, 1, skD); // neck
  // ---- clothes details
  switch (P.collar) {
    case 'scarf': rect(15, 37, 18, 4, L.scarf); rect(15, 40, 18, 1, shade(L.scarf, .8)); rect(26, 40, 5, 7, L.scarf); rect(26, 46, 5, 1, shade(L.scarf, .8)); for (let i = 0; i < 3; i++) px(17 + i * 5, 38, shade(L.scarf, 1.15)); break;
    case 'raincoat': rect(14, 36, 8, 5, shade(coat, 1.08)); rect(26, 36, 8, 5, shade(coat, 1.08)); rect(23, 40, 2, 8, coatS); [42, 45].forEach(y => rect(21, y, 2, 2, '#c49412')); break;
    case 'strap': rect(20, 38, 8, 3, '#f2ece0'); px(23, 40, '#c9c2b0'); px(24, 40, '#c9c2b0'); for (let i = 0; i < 9; i++) rect(14 + i * 2, 47 - i, 2, 1, L.bag); rect(32, 41, 2, 2, '#d9b04a'); break;
    case 'smock': rect(19, 38, 10, 2, '#ffffff'); [[14, 43, '#c8443a'], [30, 41, '#3b7ea0'], [33, 45, '#e8c55a'], [17, 46, '#3b7ea0'], [26, 44, '#c8443a']].forEach(([x, y, c]) => rect(x, y, 2, 1, c)); break;
    case 'uniform': rect(21, 38, 6, 10, '#e8e4dc'); rect(23, 39, 2, 9, '#2f3238'); rect(17, 38, 4, 6, coatS); rect(27, 38, 4, 6, coatS); [41, 45].forEach(y => { px(18, y, '#d4b14a'); px(29, y, '#d4b14a'); }); break;
    case 'captain': rect(21, 38, 6, 4, '#f2f2ec'); rect(23, 38, 2, 4, '#1d1f24'); [40, 43, 46].forEach(y => { px(18, y, '#d4b14a'); px(29, y, '#d4b14a'); }); rect(5, 41, 6, 1, '#d4b14a'); rect(37, 41, 6, 1, '#d4b14a'); break;
    case 'binoculars': for (let i = 0; i < 6; i++) { px(17 + i, 38 + i, '#3a2a1a'); px(30 - i, 38 + i, '#3a2a1a'); } rect(19, 43, 4, 4, '#2c2f38'); rect(25, 43, 4, 4, '#2c2f38'); px(20, 44, '#7fb0c0'); px(26, 44, '#7fb0c0'); rect(23, 44, 2, 2, '#2c2f38'); break;
  }
  // ---- hair behind the head (long styles)
  if (P.hair === 'pony') { oval(36, 20, 4, 6, hair); rect(35, 22, 4, 12, hair); rect(36, 30, 3, 4, hS); px(34, 17, L.tie || '#3c6db0'); px(35, 17, L.tie || '#3c6db0'); }
  if (P.hair === 'braids') { for (const bx of [12, 33]) { for (let y = 26; y < 44; y += 3) { rect(bx, y + fy, 4, 2, hair); rect(bx + 1, y + 2 + fy, 2, 1, hS); } rect(bx, 44 + fy - 2, 4, 2, L.tie || '#c8303b'); } }
  if (P.hair === 'braid') { for (let y = 28; y < 46; y += 3) { rect(32, y, 4, 2, hair); rect(33, y + 2, 2, 1, hS); } rect(32, 45, 4, 2, L.tie || '#c8443a'); }
  // ---- head
  const hx = 24, hy = 22 + fy, rx = kid ? 11 : 10.5, ry = kid ? 11 : 12.5;
  oval(hx, hy, rx, ry, skin);
  oval(hx + 4, hy + 1, rx - 3, ry - 2, skS, (x, y) => x > hx + 4); // shade on the right
  if (!kid) { for (let x = 15; x < 33; x++) if (x < 19 || x > 29) px(x, hy + ry - 2, skS); }
  // ears
  rect(12, hy - 1, 2, 5, skin); px(12, hy, skS); rect(35, hy - 1, 2, 5, skS); px(36, hy, skD);
  // ---- eyes
  const ey = hy + (kid ? 1 : 0), eyeL = 17, eyeR = 28;
  const eye = (x) => {
    if (blink) { rect(x, ey + 1, 4, 1, '#3a2a26'); return; }
    rect(x, ey, 4, 3, '#ffffff'); rect(x + 1, ey, 2, 3, '#3a2a26'); px(x + 1, ey, '#ffffff'); px(x + 2, ey + 2, '#5a4036');
    if (fem || kid) { rect(x, ey - 1, 4, 1, '#2a1e1a'); if (fem) px(x + (x < 24 ? -1 : 4), ey, '#2a1e1a'); }
    else rect(x, ey - 1, 4, 1, skD);
  };
  eye(eyeL); eye(eyeR);
  // brows
  const bc = P.brows === 'bushy' ? '#f2f2f2' : shade(hair === '#e8e8e8' ? '#9a9a9a' : hair, .8);
  if (P.brows === 'stern') { rect(16, ey - 4, 5, 1, bc); px(20, ey - 3, bc); rect(28, ey - 4, 5, 1, bc); px(27, ey - 3, bc); }
  else if (P.brows === 'bushy') { rect(15, ey - 4, 6, 2, bc); rect(27, ey - 4, 6, 2, bc); }
  else if (fem || kid) { for (const bx of [16, 28]) { px(bx, ey - 3, bc); rect(bx + 1, ey - 4, 3, 1, bc); px(bx + 4, ey - 3, bc); } }
  else { rect(16, ey - 3, 5, 1, bc); rect(28, ey - 3, 5, 1, bc); }
  // nose
  if (fem || kid) { px(24, ey + 5, skS); px(23, ey + 5, skS); }
  else { rect(24, ey + 2, 1, 4, skS); rect(23, ey + 5, 3, 1, skD); px(22, ey + 5, skS); }
  // cheeks, freckles
  rect(15, ey + 5, 3, 1, fem || kid ? '#f0a0a0' : '#e8b0a0'); rect(30, ey + 5, 3, 1, fem || kid ? '#e89090' : '#d8a090');
  if (P.freckles) [[16, ey + 4], [18, ey + 5], [30, ey + 4], [32, ey + 5], [17, ey + 6]].forEach(([x, y]) => px(x, y, shade(skin, .78)));
  if (P.wrinkles) { px(15, ey + 1, skD); px(33, ey + 1, skD); if (P.wrinkles > 1) { rect(20, ey - 6, 8, 1, skS); rect(21, ey - 8, 6, 1, skS); } }
  if (P.stubble) for (let x = 18; x < 31; x += 2) for (let y = ey + 9; y < ey + 11; y++) if (hash(x, y) > .7) px(x, y, shade(skin, .9));
  // mouth
  const my = ey + 8;
  if (talk) { rect(22, my, 5, 2, '#5a2a26'); rect(23, my + 1, 3, 1, '#c8605a'); }
  else { rect(22, my, 5, 1, fem || kid ? '#c8605a' : '#9a4c46'); if (fem) px(24, my + 1, '#e08a84'); }
  // beard and mustache
  if (P.beard === 'big') { oval(24, my + 4, 11, 8, L.beard, (x, y) => y >= my - 1); oval(24, my + 4, 9, 6, '#ffffff', (x, y) => y >= my + 3 && x < 24); rect(20, my - 1, 9, 2, '#e8e8e8'); if (talk) { rect(22, my + 1, 5, 2, '#5a2a26'); } for (let i = 0; i < 5; i++) px(16 + i * 4, my + 8 + (i % 2), '#d8d8d8'); }
  if (P.beard === 'trim') { for (let y = my - 2; y < my + 6; y++) for (let x = 14; x < 35; x++) { const dx = (x + .5 - 24) / 10.5, dy = (y + .5 - (my - 2)) / 8; if (dx * dx + dy * dy <= 1 && y >= ey + 6) px(x, y, L.beard); } rect(21, my - 1, 7, 1, shade(L.beard, .8)); if (talk) rect(22, my, 5, 2, '#5a2a26'); else rect(22, my, 5, 1, '#9a4c46'); }
  if (P.mustache) { rect(20, my - 2, 9, 2, L.mustache); px(19, my - 1, L.mustache); px(29, my - 1, L.mustache); }
  // ---- hair on the head
  const top = hy - ry;
  switch (P.hair) {
    case 'short': oval(24, top + 5, 11.5, 6, hair, (x, y) => y < top + 8); for (let x = 14; x < 34; x += 3) { px(x, top + 7, hair); px(x + 1, top + 8, hair); } rect(13, top + 6, 2, 8, hair); rect(34, top + 6, 2, 8, hS); px(16, top + 3, hL); px(17, top + 3, hL); break;
    case 'oldwhite': rect(12, top + 7, 3, 10, hair); rect(34, top + 7, 3, 10, shade(hair, .85)); break;
    case 'greyshort': oval(24, top + 4, 11, 5, hair, (x, y) => y < top + 6); rect(13, top + 5, 2, 7, hair); rect(34, top + 5, 2, 7, hS); px(13, top + 8, '#d8d8d8'); break;
    case 'darkshort': oval(24, top + 4, 11, 5, hair, (x, y) => y < top + 6); rect(13, top + 5, 2, 8, hair); rect(34, top + 5, 2, 8, hS); break;
    case 'pony': oval(24, top + 5, 11.5, 6.5, hair, (x, y) => y < top + 8); for (let x = 14; x < 22; x++) px(x, top + 8 + Math.round((22 - x) / 3), hair); rect(13, top + 6, 2, 11, hair); rect(34, top + 6, 2, 9, hS); px(17, top + 3, hL); px(18, top + 3, hL); break;
    case 'braids': oval(24, top + 6, 12, 7, hair, (x, y) => y < top + 9); for (let x = 13; x < 36; x += 2) px(x, top + 9, hair); rect(12, top + 6, 3, 12, hair); rect(33, top + 6, 3, 12, hS); px(18, top + 3, hL); break;
    case 'braid': oval(24, top + 5, 11.5, 6.5, hair, (x, y) => y < top + 8); for (let x = 26; x < 34; x++) px(x, top + 8 + Math.round((x - 26) / 3), hair); rect(13, top + 6, 2, 10, hair); rect(34, top + 6, 2, 12, hS); break;
  }
  // ---- hats
  const hc = L.hatC, hcS = hc ? shade(hc, .8) : null, hcL = hc ? shade(hc, 1.15) : null;
  switch (L.hat) {
    case 'beanie': oval(24, top + 5, 12.5, 8, hc, (x, y) => y < top + 7); rect(12, top + 5, 25, 4, hcS); for (let x = 13; x < 36; x += 2) rect(x, top + 5, 1, 4, shade(hc, .7)); for (let x = 15; x < 34; x += 3) px(x, top, hcL); oval(24, top - 4, 3, 2.5, '#f2e6cc'); px(23, top - 5, '#ffffff'); break;
    case 'souwester': oval(24, top + 3, 10, 7, hc, (x, y) => y < top + 7); rect(5, top + 6, 38, 3, hc); rect(5, top + 8, 38, 1, hcS); rect(3, top + 8, 4, 2, hc); rect(41, top + 8, 4, 2, hcS); rect(14, top + 3, 20, 1, hcL); break;
    case 'cap': oval(24, top + 3, 12, 6, hc, (x, y) => y < top + 6); rect(12, top + 4, 25, 3, hc); rect(12, top + 6, 25, 1, hcS); rect(13, top + 7, 20, 2, '#1a3358'); rect(14, top + 9, 16, 1, '#13284a'); rect(22, top, 4, 3, '#e8c55a'); px(23, top + 1, '#c49412'); break;
    case 'beret': oval(23, top + 2, 14, 5, hc); oval(23, top + 4, 13, 2.5, hcS, (x, y) => y > top + 4); rect(22, top - 4, 2, 2, hc); px(15, top, hcL); px(16, top, hcL); break;
    case 'peaked': rect(12, top - 1, 25, 6, hc); rect(10, top - 3, 29, 3, hc); rect(10, top - 3, 29, 1, hcL); rect(12, top + 5, 25, 2, '#1d1f24'); rect(13, top + 7, 22, 2, '#111318'); rect(15, top + 9, 18, 1, '#2c3036'); rect(22, top, 4, 3, '#d4b14a'); px(23, top + 1, '#a8822e'); break;
    case 'captain': rect(12, top - 1, 25, 6, hc); rect(10, top - 3, 29, 3, hc); rect(10, top - 3, 29, 1, '#ffffff'); rect(12, top + 5, 25, 2, '#1d1f24'); rect(13, top + 7, 22, 2, '#111318'); rect(15, top + 9, 18, 1, '#2c3036'); rect(21, top + 1, 6, 3, '#d4b14a'); px(23, top + 2, '#1d1f24'); px(24, top + 2, '#1d1f24'); for (let i = 0; i < 4; i++) px(14 + i * 6, top + 6, '#d4b14a'); break;
  }
  outlinePass(a, OUTL);
  PCACHE2.set(key, a); return a;
}
// draw the speaker; while the line is being typed the mouth moves, and everyone blinks now and then
function drawPortrait(c, look, talking, t) {
  const blink = (t % 4.3) > 4.12, talk = talking && Math.floor(t * 9) % 2 === 1;
  c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  c.drawImage(portraitSprite(look, talk, blink), Math.round((c.canvas.width - 48) / 2), c.canvas.height - 48);
}
NAME_LOOK['Нюра'] = 'nyura';
