"use strict";
// ===== Sonya's paintings: a big pixel picture you can look at and zoom into =====
// kind: 4 green sea after the storm, 5 fog, 6 sunset, 7 night with the light (also the gift)
function paintBig(c, W, H, o) {
  const k = o.kind, r = rng(o.seed || 7), hor = Math.round(H * .58);
  const SKY = { 4: ['#7fbfe0', '#a9d6ea', '#d6eef2'], 5: ['#b7c1c8', '#c9d2d8', '#dde3e6'], 6: ['#3a3f7a', '#c86f74', '#f6b26b'], 7: ['#0b1430', '#16234a', '#2a3566'] }[k];
  const SEA = { 4: ['#2f8a72', '#3f9a7a', '#5cb592'], 5: ['#8a98a2', '#9aa8b0', '#b0bcc2'], 6: ['#3a4f8a', '#5a5a8a', '#c87a6a'], 7: ['#0e1a3e', '#16224a', '#22305a'] }[k];
  // sky in dithered bands
  for (let y = 0; y < hor; y++) { const t = y / hor, i = t < .45 ? 0 : t < .8 ? 1 : 2; for (let x = 0; x < W; x++) { let col = SKY[i]; if (i < 2 && hash(x, y + k) < (t * 2.2 - i) * .5) col = SKY[i + 1]; R(c, x, y, 1, 1, col); } }
  if (k === 7) { for (let i = 0; i < 70; i++) { const x = r() * W | 0, y = r() * hor * .8 | 0; R(c, x, y, 1, 1, r() < .2 ? '#fff6d0' : '#c9d2f0'); if (r() < .12) { R(c, x - 1, y, 3, 1, '#9aa8d8'); R(c, x, y - 1, 1, 3, '#9aa8d8'); } } disc(c, W * .82, H * .16, 7, '#f4ecd0'); disc(c, W * .82 + 3, H * .16 - 2, 6, SKY[0]); }
  if (k === 6) { disc(c, W * .74, hor - 3, 10, '#ffe08a'); disc(c, W * .74, hor - 3, 7, '#fff2c0'); for (let i = 0; i < 6; i++) R(c, (r() * W) | 0, (hor * .3 + r() * hor * .4) | 0, 14 + (r() * 16 | 0), 2, i % 2 ? '#f09a7a' : '#e88a8a'); }
  if (k === 4) { disc(c, W * .8, H * .14, 7, '#fff2c0'); for (let i = 0; i < 4; i++) { const x = r() * W * .7 | 0, y = 8 + r() * 20 | 0; R(c, x, y, 18, 3, '#ffffff'); R(c, x + 3, y - 2, 10, 2, '#ffffff'); } }
  if (k === 5) for (let i = 0; i < 9; i++) R(c, (r() * W) | 0, (r() * H * .9) | 0, 30 + (r() * 30 | 0), 2, 'rgba(240,244,246,.7)');
  // sea with brush strokes
  for (let y = hor; y < H; y++) { const t = (y - hor) / (H - hor); R(c, 0, y, W, 1, t < .3 ? SEA[2] : t < .65 ? SEA[1] : SEA[0]); }
  for (let i = 0; i < 160; i++) { const y = hor + 1 + (r() * (H - hor - 1) | 0), x = r() * W | 0, l = 3 + (r() * 9 | 0); R(c, x, y, l, 1, r() < .5 ? shade(SEA[1], 1.18) : shade(SEA[1], .85)); }
  R(c, 0, hor, W, 1, shade(SEA[2], 1.15));
  // island, pines and the lighthouse
  const ix = Math.round(W * .34), base = hor + 2, land = k === 7 ? '#141c34' : k === 6 ? '#3a2e4a' : k === 5 ? '#7d8890' : '#4f7a46', land2 = shade(land, .8);
  c.fillStyle = land; c.beginPath(); c.moveTo(ix - 52, base); c.lineTo(ix - 34, base - 9); c.lineTo(ix - 14, base - 14); c.lineTo(ix + 18, base - 15); c.lineTo(ix + 40, base - 8); c.lineTo(ix + 60, base); c.fill();
  for (let i = 0; i < 6; i++) { const tx = ix - 40 + i * 6, ty = base - 9 - (i % 2) * 2; for (let j = 0; j < 9; j++) R(c, tx - Math.floor(j / 2), ty - 9 + j, Math.floor(j / 2) * 2 + 1, 1, land2); }
  const lx = ix + 6, lb = base - 14, lt = lb - 44, wall = k === 7 ? '#c9c2b0' : k === 5 ? '#d8dcde' : '#f4efe4', red = k === 7 ? '#8a2a2a' : k === 5 ? '#b07070' : '#c8443a';
  for (let y = lt; y < lb; y++) { const w = Math.round(4 + (y - lt) / (lb - lt) * 3); R(c, lx - w, y, w * 2, 1, (Math.floor((y - lt) / 7) % 2) ? red : wall); R(c, lx + w - 2, y, 2, 1, shade((Math.floor((y - lt) / 7) % 2) ? red : wall, .82)); }
  R(c, lx - 6, lt - 2, 12, 2, '#2c2f38'); R(c, lx - 4, lt - 8, 8, 6, k === 7 || k === 5 ? '#ffd477' : '#9ec7da'); R(c, lx - 5, lt - 10, 10, 2, '#2c2f38'); R(c, lx - 1, lt - 12, 2, 2, '#2c2f38');
  R(c, ix + 16, base - 19, 14, 6, wall); R(c, ix + 14, base - 21, 18, 2, '#7a3a2a'); R(c, ix + 20, base - 17, 3, 3, k === 7 ? '#ffd477' : '#3a4e7a');
  // the beam
  if (k === 7 || k === 5) {
    c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(lx, lt - 5, 0, lx, lt - 5, 28); gl.addColorStop(0, 'rgba(255,220,140,.75)'); gl.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = gl; c.fillRect(lx - 30, lt - 35, 60, 60);
    const gb = c.createLinearGradient(lx, 0, W, 0); gb.addColorStop(0, 'rgba(255,225,150,.55)'); gb.addColorStop(1, 'rgba(255,225,150,0)'); c.fillStyle = gb; c.beginPath(); c.moveTo(lx, lt - 6); c.lineTo(W, lt - 24); c.lineTo(W, lt + 10); c.fill();
    c.globalCompositeOperation = 'source-over';
    for (let y = hor + 2; y < H; y += 2) if (hash(y, 3) > .3) R(c, lx - 2 + Math.round(Math.sin(y) * 3), y, 3 + (hash(y, 5) * 4 | 0), 1, '#e8c87a');
  }
  if (k === 5) for (let y = 0; y < H; y += 3) { c.fillStyle = `rgba(226,232,236,${.18 + .1 * Math.sin(y * .3)})`; c.fillRect(0, y, W, 3); }
  // people Sonya put in
  if (o.me) { const px = ix + 38, py = base - 9; R(c, px - 1, py - 7, 3, 3, '#f0c8a0'); R(c, px - 1, py - 8, 3, 1, '#c8553d'); R(c, px - 2, py - 4, 5, 4, '#2f5d8a'); R(c, px - 1, py - 4, 3, 1, '#e8c55a'); R(c, px - 2, py, 2, 2, '#3b3a48'); R(c, px + 1, py, 2, 2, '#3b3a48'); }
  if (o.cat) { const cx = ix + 30, cy = base - 13; R(c, cx, cy - 3, 4, 3, '#e58a3a'); R(c, cx, cy - 4, 1, 1, '#e58a3a'); R(c, cx + 3, cy - 4, 1, 1, '#e58a3a'); R(c, cx + 4, cy - 2, 2, 1, '#e58a3a'); }
  // painterly texture and the signature
  for (let i = 0; i < 260; i++) { const x = r() * W | 0, y = r() * H | 0; const d = c.getImageData(x, y, 1, 1).data; R(c, x, y, 2, 1, `rgb(${Math.min(255, d[0] + 10)},${Math.min(255, d[1] + 10)},${Math.min(255, d[2] + 10)})`); }
  c.font = '9px Monocraft, monospace'; c.fillStyle = k === 7 || k === 6 ? '#f2e6cc' : '#3a2a1a'; c.textAlign = 'right'; c.fillText('Соня', W - 4, H - 4);
}
const PAINT = { z: 1 };
function paintingSpec(id) {
  if (id === 'painting') return { kind: 7, me: !!S.flags.eve6s, cat: catKept(), seed: 11, cap: 'Картина Сони. Маяк ночью, с огнём. Подарок.' };
  const d = Math.max(4, Math.min(7, S.day));
  return { kind: d, me: !!S.flags.eve6s && d >= 6, cat: catKept() && d >= 7, seed: d * 5, cap: { 4: 'Зелёное море после шторма. Краска ещё мокрая.', 5: 'Туман. Соня рисует то, чего не видно.', 6: 'Закат над островом.', 7: 'Маяк светит. Даже без тебя.' }[d] };
}
function renderPainting(body, id) {
  const sp = paintingSpec(id), [cv, x] = mk(192, 128); paintBig(x, 192, 128, sp);
  const frame = hand('div', 'pframe'), view = hand('div', 'pview'); view.appendChild(cv); frame.appendChild(view);
  const setZ = z => { PAINT.z = clamp(z, 1, 6); cv.style.width = (PAINT.z * 100) + '%'; zl.textContent = '×' + PAINT.z; };
  const ctr = hand('div', 'pzoom'), minus = hand('button', 'btn', '−'), plus = hand('button', 'btn', '+'), zl = hand('span', '', '×1');
  minus.type = plus.type = 'button'; minus.setAttribute('aria-label', 'Отдалить'); plus.setAttribute('aria-label', 'Приблизить');
  const zoomTo = nz => { const sl = view.scrollLeft, st = view.scrollTop, cw = view.clientWidth, ch = view.clientHeight, z0 = PAINT.z; setZ(nz); requestAnimationFrame(() => { view.scrollLeft = (sl + cw / 2) / z0 * PAINT.z - cw / 2; view.scrollTop = (st + ch / 2) / z0 * PAINT.z - ch / 2; }); };
  minus.onclick = () => zoomTo(PAINT.z - 1); plus.onclick = () => zoomTo(PAINT.z + 1);
  ctr.append(minus, zl, plus);
  view.addEventListener('wheel', e => { e.preventDefault(); zoomTo(PAINT.z + (e.deltaY < 0 ? 1 : -1)); }, { passive: false });
  let drag = null; view.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, view.scrollLeft, view.scrollTop]; view.setPointerCapture(e.pointerId); });
  view.addEventListener('pointermove', e => { if (!drag) return; view.scrollLeft = drag[2] - (e.clientX - drag[0]); view.scrollTop = drag[3] - (e.clientY - drag[1]); });
  view.addEventListener('pointerup', () => { drag = null; }); view.addEventListener('dblclick', () => zoomTo(PAINT.z >= 4 ? 1 : PAINT.z + 2));
  body.append(frame, ctr, hand('p', 'doccap', sp.cap + ' Колёсико или «+» — приблизить, перетащить — рассмотреть.'));
  setZ(1);
}
