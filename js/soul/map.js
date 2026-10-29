"use strict";
// ===== Island map and guidance =====
// ---------- the island map (hand-drawn, reveals itself as you walk) ----------
const MCH = 4, CPX = 3; // chunk size in tiles, map pixels per tile
const PLACES = [
  ['Маяк', 33, 12.2], ['Пирс', 31, 44], ['Сарай', 47.5, 25.2], ['Смотровая', 46.6, 11], ['Утёс', 20.5, 11], ['Лес', 13, 24], ['Западный пляж', 15.5, 36.4],
  ['Камень', 9.5, 32.2], ['Чайки', 55, 21.5], ['«Надежда»', 42, 39.6], ['Дальний лес', 76, 28.5], ['Озеро', 84.5, 23.4], ['Дуб', 89, 36.3], ['Скалы', 97.5, 30.6],
];
function seenArr() { const n = Math.ceil(104 / MCH) * Math.ceil(52 / MCH); let s = S.flags.seen; if (!s || s.length !== n) s = '0'.repeat(n); return s.split(''); }
function revealAt(tx, ty, r) {
  const W = Math.ceil(104 / MCH), a = seenArr(); let ch = false;
  for (let cy = Math.floor((ty - r) / MCH); cy <= Math.floor((ty + r) / MCH); cy++) for (let cx = Math.floor((tx - r) / MCH); cx <= Math.floor((tx + r) / MCH); cx++) {
    if (cx < 0 || cy < 0 || cx >= W || cy >= Math.ceil(52 / MCH)) continue; const i = cy * W + cx; if (a[i] !== '1') { a[i] = '1'; ch = true; }
  }
  if (ch) S.flags.seen = a.join('');
}
let lastRev = '';
function mapTick() {
  if (!MAP) return;
  if (!S.flags.seen) { revealAt(33, 14, 9); revealAt(31, 40, 6); }
  if (MAP.id === 'island') { const k = Math.floor(P.x / T) + ',' + Math.floor(P.y / T); if (k !== lastRev) { lastRev = k; revealAt(P.x / T, P.y / T, 7); } }
  if (MAP.id === 'house' || MAP.id === 'lamp') revealAt(33, 13, 6);
}
const NPC_COL = { matvey: '#e7b521', sonya: '#c8303b', lida: '#3c6db0', gromov: '#8a8f98', belov: '#1f2d4d', nyura: '#5f7f4a' };
function drawChart(cv) {
  const m = MAPS.island, W = m.w, H = m.h, c = cv.getContext('2d'); cv.width = W * CPX; cv.height = H * CPX;
  const seen = seenArr(), CW = Math.ceil(W / MCH), isSeen = (x, y) => seen[Math.floor(y / MCH) * CW + Math.floor(x / MCH)] === '1';
  const paper = '#ecdfbd';
  c.fillStyle = paper; c.fillRect(0, 0, cv.width, cv.height);
  // sea: hand-drawn wave marks
  for (let y = 2; y < H; y += 3) for (let x = (y % 2) * 2; x < W; x += 5) if (isWater(tAt(m, x, y)) && hash(x, y) > .55) { R(c, x * CPX, y * CPX + 1, 3, 1, '#b8a67c'); R(c, x * CPX + 3, y * CPX, 2, 1, '#b8a67c'); }
  const LAND = { [SAND]: '#e3cd96', [GRASS]: '#cbbb84', [FOREST]: '#b4a56c', [PATH]: '#d9c18c', [ROCK]: '#b9ab8a', [PIER]: '#a8885a', [FLAT]: '#c7b88e' };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = tAt(m, x, y); if (isWater(t)) continue;
    if (!isSeen(x, y)) { R(c, x * CPX, y * CPX, CPX, CPX, '#e2d4ac'); if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => isWater(tAt(m, x + dx, y + dy)))) R(c, x * CPX, y * CPX, CPX, CPX, '#bfae86'); continue; }
    R(c, x * CPX, y * CPX, CPX, CPX, LAND[t] || '#cbbb84');
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = tAt(m, x, y); if (isWater(t) || !isSeen(x, y)) continue;
    // coastline in ink
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => isWater(tAt(m, x + dx, y + dy)))) R(c, x * CPX, y * CPX, CPX, CPX, t === PIER ? '#7a5a32' : '#8a6a42');
    if (t === FOREST && (x + y * 3) % 5 === 0 && hash(x, y + 3) > .35) { R(c, x * CPX + 1, y * CPX - 1, 1, 1, '#5d6a3a'); R(c, x * CPX, y * CPX, 3, 1, '#5d6a3a'); R(c, x * CPX + 1, y * CPX + 1, 1, 1, '#6b4a2e'); }
    if (t === PATH && (x + y) % 2 === 0) R(c, x * CPX + 1, y * CPX + 1, 1, 1, '#8a6a42');
    if (t === ROCK && hash(x + 5, y) > .7) R(c, x * CPX + 1, y * CPX + 1, 1, 1, '#7a6a52');
  }
  // lighthouse symbol
  if (isSeen(33, 13)) { const lx = 33 * CPX + 1, ly = 13 * CPX; R(c, lx - 2, ly - 9, 5, 9, '#f6efe0'); R(c, lx - 2, ly - 7, 5, 2, '#c8443a'); R(c, lx - 2, ly - 3, 5, 2, '#c8443a'); R(c, lx - 1, ly - 11, 3, 2, '#e8b23a'); c.strokeStyle = '#5a4630'; c.lineWidth = 1; c.strokeRect(lx - 2.5, ly - 9.5, 6, 10); }
  // islets you have sailed to
  c.font = '8px Monocraft, monospace'; c.textBaseline = 'middle';
  const islet = (x, y, name) => { R(c, x - 6, y - 3, 12, 6, '#cbbb84'); R(c, x - 4, y - 4, 8, 1, '#8a6a42'); R(c, x - 6, y + 3, 12, 1, '#8a6a42'); c.fillStyle = '#5a4630'; c.textAlign = 'left'; c.fillText(name, x + 9, y); };
  if (S.flags.m_seals) islet(14, 140, 'Тюлений камень');
  if (S.flags.m_cliffs) islet(14, 14, 'Птичий базар');
  // place names
  c.textAlign = 'center';
  for (const [n, x, y] of PLACES) { if (!isSeen(x, y)) continue; const px = x * CPX, py = y * CPX, w = c.measureText(n).width; c.fillStyle = 'rgba(236,223,189,.85)'; c.fillRect(px - w / 2 - 2, py - 5, w + 4, 9); c.fillStyle = '#4a3a26'; c.fillText(n, px, py); }
  // compass rose
  const rx = cv.width - 16, ry = cv.height - 18; c.strokeStyle = '#8a6a42'; c.beginPath(); c.arc(rx, ry, 9, 0, 7); c.stroke(); R(c, rx, ry - 12, 1, 24, '#8a6a42'); R(c, rx - 12, ry, 24, 1, '#8a6a42'); c.fillStyle = '#c8443a'; c.fillText('С', rx, ry - 15);
  // task markers
  for (const g of guideList()) { const tg = g.where(); if (!tg) continue; const pos = tg.isl; if (!pos) continue; const px = pos[0] / T * CPX, py = pos[1] / T * CPX; disc(c, px, py, 4, '#c8443a'); R(c, px - .5, py - 2.5, 1, 3, '#fff6e0'); R(c, px - .5, py + 1.5, 1, 1, '#fff6e0'); }
  // people
  const vn = visitsNow();
  for (const n of vn.npcs) { const px = n.x / T * CPX, py = n.y / T * CPX; disc(c, px, py, 3, '#1d1a24'); disc(c, px, py, 2, NPC_COL[n.id] || '#888'); c.fillStyle = '#1d1a24'; c.textAlign = 'left'; c.fillText(NPCS[n.id].name, px + 5, py); }
  if (catKept() && CAT.map === 'island') { const px = CAT.x / T * CPX, py = CAT.y / T * CPX; disc(c, px, py, 2.5, '#1d1a24'); disc(c, px, py, 1.6, '#e58a3a'); }
  // you are here
  let hx = P.x, hy = P.y; if (MAP.id !== 'island') { if (MAP.id === 'shed') { hx = 47.5 * T; hy = 26 * T; } else if (MAP.id === 'seals' || MAP.id === 'cliffs') { hx = null; } else { hx = WORLD.lh.x; hy = WORLD.lh.y; } }
  if (hx != null) { const px = hx / T * CPX, py = hy / T * CPX, pulse = 5 + Math.sin(G.time * 4) * 1.5; c.strokeStyle = '#c8303b'; c.lineWidth = 1.2; c.beginPath(); c.arc(px, py, pulse, 0, 7); c.stroke(); disc(c, px, py, 2.4, '#c8303b'); c.fillStyle = '#c8303b'; c.textAlign = 'left'; c.fillText('вы здесь', px + 7, py + 7); }
}
function chartTab(body) {
  const wrap = document.createElement('div'); wrap.className = 'chartwrap';
  const h = document.createElement('div'); h.className = 'sect'; h.textContent = 'Карта острова · рисуется сама, пока вы гуляете';
  const cv = document.createElement('canvas'); drawChart(cv);
  const lg = document.createElement('div'); lg.className = 'legend';
  lg.innerHTML = '<span><i style="background:#c8303b;border-radius:50%"></i>вы</span><span><i style="background:#c8443a;border-radius:50%"></i>дело на сегодня</span><span><i style="background:#e7b521;border-radius:50%"></i>гости острова</span><span><i style="background:#e2d4ac"></i>бледное — там вы ещё не были</span>';
  const gs = document.createElement('div'); gs.className = 'guides';
  const list = guideList().filter(g => g.where());
  if (list.length) {
    const t = document.createElement('div'); t.className = 'sect'; t.textContent = 'Показать дорогу'; wrap.append(h, cv, lg, t, gs);
    list.forEach(g => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (G.guide === g.id ? ' primary' : ''); b.textContent = g.label; b.onclick = () => { G.guide = g.id; UI.close(); toast('Дорога отмечена пунктиром'); }; gs.appendChild(b); });
    if (G.guide) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = 'Убрать пунктир'; b.onclick = () => { G.guide = null; G.guideOff = S.day; UI.panel('chart'); }; gs.appendChild(b); }
  } else wrap.append(h, cv, lg);
  body.appendChild(wrap);
  const tick = () => { if ($('#panel').hidden || !document.body.contains(cv)) return; drawChart(cv); setTimeout(tick, 250); }; setTimeout(tick, 250);
}

// ---------- guidance: where is the thing I need? ----------
const objOf = (map, kind, pred) => MAPS[map] && MAPS[map].objs.find(o => o.kind === kind && (!o.on || o.on()) && (!pred || pred(o)));
const at = (map, x, y) => ({ map, x, y, isl: map === 'island' ? [x, y] : map === 'shed' ? [47.5 * T, 26 * T] : (map === 'house' || map === 'lamp') ? [WORLD.lh.x, WORLD.lh.y] : null });
const atObj = (map, o) => o ? at(map, o.ix ?? o.x, o.iy ?? o.y) : null;
function taskWhere(id) {
  switch (id) {
    case 'lens': case 'lamp': return at('lamp', 7.5 * T, 7.9 * T);
    case 'oil': return has('oilcan') ? at('lamp', 5.2 * T, 9.2 * T) : at('house', 10.5 * T, 3.9 * T);
    case 'mech': return at('lamp', 5.2 * T, 9.2 * T);
    case 'clean': return atObj('house', objOf('house', 'dust', o => !o.gone));
    case 'wood': return has('wood') ? at('house', 1.2 * T + 4, 5.6 * T) : atObj('island', objOf('island', 'branch', o => !o.gone));
    case 'journal': return at('house', 12.6 * T, 4.2 * T);
    case 'fish': return at('island', 30.9 * T, 45.4 * T);
    case 'dinner': return has('fish') ? at('house', 2.6 * T, 4 * T) : at('island', 30.9 * T, 45.4 * T);
    case 'gen': return at('shed', 3 * T, 4.2 * T);
    case 'pier': return atObj('island', objOf('island', 'debris', o => !o.gone));
    case 'ladder': return has('wrench') ? at('island', 31 * T + 10, 42 * T + 6) : at('shed', 6.2 * T, 3.5 * T);
    case 'ship': return at('island', 31.4 * T, 42.4 * T);
    case 'unload': return P.carry === 'crate' ? at('house', 8.4 * T, 4.6 * T) : atObj('island', objOf('island', 'supply', o => !o.gone));
    case 'bye': { const n = visitsNow().npcs.find(n => !S.flags['bye' + n.id[0].toUpperCase() + n.id.slice(1)]); return n ? at('island', n.x, n.y) : null; }
    case 'pierEnd': return at('island', 31 * T, 42 * T);
  }
  return null;
}
function guideList() {
  const out = S.tasks.filter(t => !t.done).map(t => ({ id: 't:' + t.id, label: t.text.replace(/ \(.*\)/, ''), where: () => taskWhere(t.id) }));
  if (S.q.uha === 1 && has('uha')) out.push({ id: 'q:uha', label: 'Уха для Матвея', where: () => { const n = visitsNow().npcs.find(n => n.id === 'matvey'); return n ? at('island', n.x, n.y) : null; } });
  if (S.q.chick === 1) out.push({ id: 'q:chick', label: P.carry === 'chick' ? 'Птенца — к чайкам' : 'Птенец в лесу', where: () => P.carry === 'chick' ? at('island', WORLD.colony[0], WORLD.colony[1]) : at('island', 11.5 * T, 21.4 * T) });
  if (has('map') && !S.flags.dug) out.push({ id: 'q:dig', label: 'Крестик на карте', where: () => at('island', 21.5 * T, 13.4 * T) });
  if (S.day === 6 && S.flags.legend && S.min >= 1230 && !S.flags.whalesSeen) out.push({ id: 'q:whale', label: 'Смотровая ночью', where: () => at('island', 46.5 * T, 13.2 * T) });
  if (S.day === 3 && S.flags.storm && !S.flags.stormL) out.push({ id: 'q:lida', label: 'Светить Лиде с пирса', where: () => at('island', 31 * T, 45.6 * T) });
  if (S.day === 3 && S.flags.storm && !S.flags.stormN) out.push({ id: 'q:nets', label: 'Сети Матвея', where: () => at('island', 9.6 * T, 33.6 * T) });
  if (S.day === 2 && S.min >= 1260 && !S.flags.morse) out.push({ id: 'q:morse', label: 'Ответить кораблю', where: () => at('lamp', 10.2 * T, 9 * T) });
  return out;
}
// the next door to go through when the goal is on another map
function waypoint(tg) {
  if (!tg) return null; if (tg.map === MAP.id) return tg;
  const inLH = m => m === 'house' || m === 'lamp';
  if (MAP.id === 'island') { if (inLH(tg.map)) return { x: WORLD.lh.x, y: WORLD.lh.y + 4, door: 1 }; if (tg.map === 'shed') return { x: 47.5 * T, y: 26 * T + 10, door: 1 }; }
  if (MAP.id === 'house') { if (tg.map === 'lamp') return { x: 9 * T, y: 7 * T + 4, door: 1 }; return { x: 9 * T, y: 11 * T, door: 1 }; }
  if (MAP.id === 'lamp') return { x: 7.5 * T, y: 9.6 * T, door: 1 };
  if (MAP.id === 'shed') return { x: 6 * T, y: 9 * T, door: 1 };
  return null;
}
function guideActive() {
  if (G.mode !== 'play' || G.quiet) return null;
  let id = G.guide;
  if (!id && S.day === 1 && G.guideOff !== 1) { const t = S.tasks.find(t => !t.done && taskWhere(t.id)); if (t) id = 't:' + t.id; }
  if (!id) return null;
  const g = guideList().find(g => g.id === id); if (!g) { if (G.guide === id) G.guide = null; return null; }
  return waypoint(g.where());
}
function drawGuide(cam) {
  const wp = guideActive(); if (!wp) return;
  const hx = P.x - cam.x, hy = P.y - 8 - cam.y, tx = wp.x - cam.x, ty = wp.y - 6 - cam.y;
  const dx = tx - hx, dy = ty - hy, d = Math.hypot(dx, dy); if (d < 18) return;
  const ux = dx / d, uy = dy / d, len = Math.min(d - 10, 150), ph = (G.time * 14) % 8;
  for (let s = 12 + ph; s < len; s += 8) { const a = s > len - 30 ? (len - s) / 30 : 1; ctx.globalAlpha = .9 * a; const x = Math.round(hx + ux * s), y = Math.round(hy + uy * s); R(ctx, x - 1, y - 1, 3, 3, '#1d1a24'); R(ctx, x, y, 1, 1, '#ffc95c'); }
  ctx.globalAlpha = 1;
  const on = tx > 6 && ty > 6 && tx < VW - 6 && ty < VH - 6;
  if (on) { const b = Math.round(Math.sin(G.time * 5) * 2), x = Math.round(tx), y = Math.round(ty - 14 + b); R(ctx, x - 3, y - 1, 7, 3, '#1d1a24'); R(ctx, x - 2, y + 2, 5, 2, '#1d1a24'); R(ctx, x - 1, y + 4, 3, 2, '#1d1a24'); R(ctx, x - 2, y, 5, 1, '#ffc95c'); R(ctx, x - 1, y + 1, 3, 2, '#ffc95c'); R(ctx, x, y + 3, 1, 2, '#ffc95c'); }
  else {
    // arrow at the screen edge
    const m = 14, ex = clamp(hx + ux * 999, m, VW - m), ey = clamp(hy + uy * 999, m + 10, VH - m);
    const k = Math.min((ux ? ((ux > 0 ? VW - m : m) - hx) / ux : 1e9), (uy ? ((uy > 0 ? VH - m : m + 10) - hy) / uy : 1e9));
    const ax = Math.round(hx + ux * k), ay = Math.round(hy + uy * k), ang = Math.atan2(uy, ux);
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang); ctx.fillStyle = '#1d1a24'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, -7); ctx.lineTo(-3, 0); ctx.lineTo(-6, 7); ctx.fill(); ctx.fillStyle = '#ffc95c'; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -5); ctx.lineTo(-2, 0); ctx.lineTo(-4, 5); ctx.fill(); ctx.restore();
    void ex; void ey;
  }
}
