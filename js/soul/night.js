"use strict";
// ===== Night events: morse, aurora, plankton; overlay =====
// ---------- night events ----------
const MORSE = { 'С': '...', 'В': '.--', 'Е': '.', 'Т': '-', 'И': '..', 'Ж': '...-', 'У': '..-', 'Д': '-..', 'О': '---', 'Б': '-...', 'Р': '.-.', 'М': '--', 'Н': '-.', 'А': '.-' };
function morseTimeline(text, u) {
  const ev = []; let t = 0;
  for (const w of text.split(' ')) { for (const ch of w) { for (const s of MORSE[ch]) { const d = s === '.' ? u : u * 3; ev.push([t, t + d, ch]); t += d + u; } t += u * 2; } t += u * 4; }
  return { ev, len: t };
}
const SHIP_MSG = 'СВЕТ ВИЖУ';
const SHIP_TL = morseTimeline(SHIP_MSG, .2);
function shipLightOn(t) { const lt = t % (SHIP_TL.len + 2.5); return SHIP_TL.ev.some(([a, b]) => lt >= a && lt < b); }
let MORSE_ON = false;
const MS = { phase: 'listen', t: 0, word: null, pos: 0, sent: '', down: 0, flash: 0, err: 0, lit: false };
function openMorse() {
  MORSE_ON = true; Object.assign(MS, { phase: 'listen', t: 0, word: null, pos: 0, sent: '', down: 0, flash: 0, err: 0, lit: false });
  $('#morse').hidden = false; morseUI();
}
function closeMorse() { MORSE_ON = false; $('#morse').hidden = true; MS.down = 0; }
const REPLIES = [['ВИЖУ', 'вижу вас'], ['ДОБРО', 'всё в порядке'], ['МИР', 'мира вам']];
function morseCode(w) { return w.split('').map(ch => MORSE[ch]).join(' '); }
function morseUI() {
  const msg = $('#mMsg'), code = $('#mCode'), row = $('#mRow'); row.innerHTML = '';
  if (MS.phase === 'listen') { msg.textContent = 'Корабль мигает огнём. Смотрите и читайте: точка — короткая вспышка, тире — длинная.'; const b = hand('button', 'btn', 'Дослушать'); b.type = 'button'; b.onclick = () => { MS.phase = 'choose'; morseUI(); }; row.appendChild(b); }
  if (MS.phase === 'choose') { msg.textContent = '«СВЕТ ВИЖУ». Корабль видит ваш маяк. Что ответить?'; code.textContent = '... .-- . -   .-- .. ...- ..-'; REPLIES.forEach(([w, m]) => { const b = hand('button', 'btn', w + ' · ' + m); b.type = 'button'; b.onclick = () => { MS.word = w; MS.phase = 'send'; MS.pos = 0; morseUI(); }; row.appendChild(b); }); }
  if (MS.phase === 'send') {
    msg.textContent = isTouch ? 'Держите кнопку: коротко — точка, долго — тире.' : 'Держите пробел или кнопку: коротко — точка, долго — тире.';
    const k = hand('button', 'btn key', 'Мигнуть фонарём'); k.type = 'button'; k.id = 'mKey';
    k.addEventListener('pointerdown', e => { e.preventDefault(); morsePress(true); }); k.addEventListener('pointerup', () => morsePress(false)); k.addEventListener('pointerleave', () => { if (MS.down) morsePress(false); });
    row.appendChild(k); morseCodeView();
  }
  if (MS.phase === 'done') { msg.textContent = 'Корабль мигнул два раза длинно и дал гудок: «Понял. Спасибо, маяк». Где-то там люди теперь знают, что маяк не спит.'; code.textContent = ''; const b = hand('button', 'btn primary', 'Закрыть'); b.type = 'button'; b.onclick = closeMorse; row.appendChild(b); }
  const x = hand('button', 'btn', 'Отойти'); x.type = 'button'; x.onclick = closeMorse; if (MS.phase !== 'done') row.appendChild(x);
}
function morseCodeView() {
  const code = $('#mCode'), full = morseCode(MS.word).replace(/ /g, '');
  code.innerHTML = ''; let k = 0;
  for (const ch of MS.word) { const span = hand('span', '', ''); for (const s of MORSE[ch]) { const e = hand('span', k < MS.pos ? 'ok' : '', s === '.' ? '•' : '—'); span.appendChild(e); k++; } code.appendChild(span); code.appendChild(document.createTextNode('   ')); }
  void full;
}
function morsePress(down) {
  if (MS.phase !== 'send') return;
  if (down) { if (!MS.down) { MS.down = performance.now(); MS.lit = true; const k = $('#mKey'); if (k) k.classList.add('on'); } return; }
  if (!MS.down) return; const dur = (performance.now() - MS.down) / 1000; MS.down = 0; MS.lit = false; const k = $('#mKey'); if (k) k.classList.remove('on');
  const seq = morseCode(MS.word).replace(/ /g, ''), want = seq[MS.pos], got = dur < .28 ? '.' : '-';
  if (got === want) { MS.pos++; AU.blip(); if (MS.pos >= seq.length) { MS.phase = 'done'; MS.t = 0; S.flags.morse = MS.word; unlock('morse'); memo('morse', 'Ночью ответил кораблю сигнальным фонарём: «' + MS.word + '». Он дал гудок.'); setTimeout(shipHorn, 900); morseUI(); return; } }
  else { MS.err = 1; let start = 0, acc = 0; for (const ch of MS.word) { if (acc + MORSE[ch].length > MS.pos) { start = acc; break; } acc += MORSE[ch].length; } MS.pos = start; }
  morseCodeView();
}
function morseKey(k, down, e) {
  if (k === 'escape' && down) return closeMorse();
  if ([' ', 'e', 'enter', 'у'].includes(k)) { if (e) e.preventDefault(); if (down && e && e.repeat) return; if (MS.phase === 'send') morsePress(down); else if (down && MS.phase === 'done') closeMorse(); }
}
function shipHorn() { if (!AU.ac) return; const t = AU.ac.currentTime; [0, 1.4].forEach(d => { AU.tone(98, t + d, 1.1, 'sawtooth', .05, AU.amb, .08); AU.tone(147, t + d, 1.1, 'sawtooth', .03, AU.amb, .08); }); }
function drawMorse(c, w, h, t) {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#060c1e'); g.addColorStop(.6, '#101c3a'); g.addColorStop(1, '#0a1328'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { c.globalAlpha = .3 + .5 * Math.abs(Math.sin(t + i)); R(c, hash(i, 2) * w, hash(i, 5) * h * .5, 1, 1, '#fff6e0'); } c.globalAlpha = 1;
  const hor = Math.round(h * .58); R(c, 0, hor, w, h - hor, '#0c1630'); for (let i = 0; i < 40; i++) { const y = hor + 2 + hash(i, 3) * (h - hor), x = (hash(i, 4) * w + t * 6) % w; R(c, x, y, 3, 1, 'rgba(150,170,220,.3)'); }
  const sx = Math.round(w * .66), sy = hor - 2; c.fillStyle = '#1d2238'; c.beginPath(); c.moveTo(sx - 26, sy - 4); c.lineTo(sx + 26, sy - 4); c.lineTo(sx + 20, sy + 3); c.lineTo(sx - 20, sy + 3); c.fill(); R(c, sx - 8, sy - 12, 18, 8, '#1d2238'); R(c, sx + 2, sy - 22, 2, 10, '#1d2238');
  let on = false; if (MS.phase === 'listen' || MS.phase === 'choose') on = shipLightOn(MS.t); else if (MS.phase === 'done') on = MS.t > .8 && ((MS.t - .8) % 3 < 1 || (MS.t - .8) % 3 > 1.5 && (MS.t - .8) % 3 < 2.5) && MS.t < 7;
  if (on) { const gg = c.createRadialGradient(sx + 3, sy - 23, 0, sx + 3, sy - 23, 22); gg.addColorStop(0, 'rgba(255,230,160,.9)'); gg.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = gg; c.fillRect(sx - 20, sy - 46, 46, 46); R(c, sx + 1, sy - 25, 4, 3, '#fff6d0'); }
  // our signal lamp, bottom left
  R(c, 14, h - 30, 18, 14, '#3a3e48'); R(c, 18, h - 16, 10, 16, '#2c2f38'); R(c, 32, h - 26, 4, 6, '#c9a24a');
  if (MS.lit) { const gg = c.createRadialGradient(38, h - 23, 0, 38, h - 23, 60); gg.addColorStop(0, 'rgba(255,230,160,.8)'); gg.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = gg; c.fillRect(0, h - 90, 110, 90); }
  if (MS.err > 0) { c.fillStyle = `rgba(200,60,50,${MS.err * .3})`; c.fillRect(0, 0, w, h); }
  // decoded text while listening
  if (MS.phase === 'listen') { const lt = MS.t % (SHIP_TL.len + 2.5); const shown = SHIP_TL.ev.filter(e => e[0] <= lt); let txt = ''; let lastCh = null, n = 0; for (const e of SHIP_TL.ev) { if (e[0] > lt) break; } const letters = []; SHIP_TL.ev.forEach(e => { if (e[0] <= lt && e[2] !== letters[letters.length - 1]) letters.push(e[2]); }); txt = letters.join(''); void shown; void lastCh; void n; c.fillStyle = '#ffc95c'; c.font = '10px Monocraft, monospace'; c.textAlign = 'center'; c.fillText(txt.length > 4 ? txt.slice(0, 4) + ' ' + txt.slice(4) : txt, w / 2, 16); }
}
function morseFrame(dt) {
  if (!MORSE_ON) return; MS.t += dt; MS.err = Math.max(0, MS.err - dt * 2);
  const cv = $('#morseC'), c = cv.getContext('2d'); c.imageSmoothingEnabled = false; drawMorse(c, cv.width, cv.height, G.time);
}

// ---------- overlay drawing (after the world and its lighting) ----------
function drawAurora(a) {
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const base = 10 + i * 16;
    for (let x = 0; x < VW; x += 2) {
      const y = base + Math.sin(x * .018 + G.time * .25 + i * 2) * 14 + Math.sin(x * .05 - G.time * .4 + i) * 5;
      const hgt = 44 + Math.sin(x * .03 + G.time * .7 + i) * 16, al = a * (.16 + .1 * Math.sin(x * .02 + G.time * .9 + i * 3));
      const g = ctx.createLinearGradient(0, y, 0, y + hgt); g.addColorStop(0, `rgba(160,90,220,${al * .6})`); g.addColorStop(.35, `rgba(80,255,170,${al})`); g.addColorStop(1, 'rgba(80,255,170,0)');
      ctx.fillStyle = g; ctx.fillRect(x, y, 2, hgt);
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}
function drawPlankton(cam) {
  const m = MAP; ctx.globalCompositeOperation = 'lighter';
  const x0 = Math.floor(cam.x / T) - 1, y0 = Math.floor(cam.y / T) - 1, x1 = x0 + Math.ceil(VW / T) + 2, y1 = y0 + Math.ceil(VH / T) + 2;
  let near = false;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (tAt(m, x, y) !== SHALLOW) continue;
    if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !isWater(tAt(m, x + dx, y + dy)))) continue;
    for (let k = 0; k < 3; k++) { const h = hash(x * 7 + k, y * 3 + k), s = Math.sin(G.time * (1.2 + h) + h * 30); if (s < .55) continue; const px = x * T + (hash(x + k, y) * 14 | 0) - cam.x, py = y * T + (hash(y + k, x) * 14 | 0) - cam.y; ctx.fillStyle = `rgba(110,230,255,${(s - .55) * 1.6})`; ctx.fillRect(px, py, 1, 1); if (s > .9) { ctx.fillStyle = 'rgba(110,230,255,.25)'; ctx.fillRect(px - 1, py, 3, 1); ctx.fillRect(px, py - 1, 1, 3); } }
    if (Math.hypot(x * T + 8 - P.x, y * T + 8 - P.y) < 40) near = true;
  }
  if (near && P.moving) for (let k = 0; k < 2; k++) G.parts.push({ x: P.x + (Math.random() - .5) * 30, y: P.y + (Math.random() - .5) * 20, vx: 0, vy: -2, life: .8, col: '#7fe8ff', s: 1 });
  ctx.globalCompositeOperation = 'source-over';
  if (near) { if (!S.flags.m_plankton) { toast('Вода у берега светится голубым!'); memo('plankton', 'Ночью вода у берега светилась голубыми искрами. Будто звёзды упали в море.'); } }
}
function soulOverlay() {
  if (G.mode !== 'play' || !MAP) return;
  const cam = { x: Math.round(G.cam.x), y: Math.round(G.cam.y) }, h = (S.min % 1440) / 60;
  // night sea glow
  if ((S.day === 1 || S.day === 2) && G.dark > .55 && (MAP.id === 'island' || MAP.id === 'seals' || MAP.id === 'cliffs')) drawPlankton(cam);
  // aurora
  if (S.day === 4 && S.min >= 1290 && (MAP.outdoor || MAP.high)) { const a = clamp((S.min - 1290) / 60, 0, 1); drawAurora(a); if (!S.flags.m_aurora && a > .3) { toast('Над морем разгорается северное сияние'); memo('aurora', 'Северное сияние! Зелёные ленты над морем, полнеба.'); unlock('aurora'); } }
  // a ship asking for the lighthouse
  if (S.day === 2 && S.min >= 1260 && !S.flags.morse && MAP.id === 'island') { const sx = 44 * T - cam.x, sy = -1 * T - cam.y; if (shipLightOn(G.time)) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 16); g.addColorStop(0, 'rgba(255,230,160,.9)'); g.addColorStop(1, 'rgba(255,230,160,0)'); ctx.fillStyle = g; ctx.fillRect(sx - 16, sy - 16, 32, 32); ctx.globalCompositeOperation = 'source-over'; } R(ctx, sx - 6, sy + 2, 12, 2, '#0d1424'); }
  if (S.day === 2 && S.min >= 1260 && !S.flags.morse && MAP.id === 'lamp' && shipLightOn(G.time)) { const sx = VW * .78, sy = 18; ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12); g.addColorStop(0, 'rgba(255,230,160,.9)'); g.addColorStop(1, 'rgba(255,230,160,0)'); ctx.fillStyle = g; ctx.fillRect(sx - 12, sy - 12, 24, 24); ctx.globalCompositeOperation = 'source-over'; }
  // Lida's boat light coming into the bay
  if (G.lidaLight && MAP.id === 'island') { const k = (G.time - G.lidaLight) / 22; if (k < 1) { const x = lerp(39 * T, 33.6 * T, smooth(k)) - cam.x, y = lerp(52 * T, 44.5 * T, smooth(k)) - cam.y; ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, 14); g.addColorStop(0, 'rgba(255,220,140,.95)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(x - 14, y - 14, 28, 28); ctx.globalCompositeOperation = 'source-over'; } }
  drawGuide(cam);
  // letterbox for quiet moments
  const k = qk(); if (k > 0) { const b = Math.round(VH * .1 * k); R(ctx, 0, 0, VW, b, '#000'); R(ctx, 0, VH - b, VW, b, '#000'); }
  void h;
}
