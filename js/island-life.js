"use strict";
// ===================== FEATURES: visits, cat, herbs, crafting, scope, benches, achievements =====================

// ---------- generic menu (also used as yes/no) ----------
const MENU = {
  open: false, sel: 0, opts: [],
  show(text, opts, cancelLabel) {
    this.opts = opts.concat(cancelLabel ? [{ label: cancelLabel, cancel: true }] : []);
    $('#askT').textContent = text; const box = $('#askBtns'); box.innerHTML = '';
    box.classList.toggle('col', this.opts.length > 2);
    this.opts.forEach((o, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.disabled = !!o.disabled;
      const l = document.createElement('span'); l.textContent = o.label; b.appendChild(l);
      if (o.sub) { const s = document.createElement('small'); s.textContent = o.sub; b.appendChild(s); }
      b.onclick = () => this.pick(i); box.appendChild(b);
    });
    this.sel = Math.max(0, this.opts.findIndex(o => !o.disabled)); this.open = true; $('#ask').hidden = false; this.mark();
  },
  ask(text, yes, no, onYes) { this.show(text, [{ label: yes, run: onYes }], no); },
  mark() { [...$('#askBtns').children].forEach((b, i) => b.classList.toggle('primary', i === this.sel)); },
  move(d) { const n = this.opts.length; for (let k = 1; k <= n; k++) { const i = (this.sel + d * k + n * 2) % n; if (!this.opts[i].disabled) { this.sel = i; break; } } this.mark(); },
  pick(i) { const o = this.opts[i]; if (!o || o.disabled) return; this.hide(); if (!o.cancel && o.run) o.run(); },
  hide() { $('#ask').hidden = true; this.open = false; },
  close(ok) { if (ok) this.pick(this.sel); else this.hide(); },
  key(k) {
    if (['arrowup', 'arrowleft', 'w', 'a', 'ц', 'ф'].includes(k)) { this.move(-1); return true; }
    if (['arrowdown', 'arrowright', 's', 'd', 'tab', 'ы', 'в'].includes(k)) { this.move(1); return true; }
    if (['e', ' ', 'enter', 'у'].includes(k)) { this.pick(this.sel); return true; }
    if (k === 'escape') { if (!this.locked) this.hide(); return true; }
    return false;
  },
};
const ASK = MENU;

// ---------- name input ----------
const NAMEBOX = {
  open: false, cb: null,
  show(def, cb) { this.cb = cb; this.open = true; $('#nameBox').hidden = false; const i = $('#catName'); i.value = def; setTimeout(() => { i.focus(); i.select(); }, 50); },
  ok() { const v = $('#catName').value.trim().slice(0, 14) || 'Рыжик'; $('#nameBox').hidden = true; this.open = false; const f = this.cb; this.cb = null; f && f(v); },
};
$('#nameOk').onclick = () => NAMEBOX.ok();
$('#catName').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); NAMEBOX.ok(); } });

// ---------- achievements ----------
const ACH = [
  ['firstday', 'Первая смена', 'Выполнить все дела за один день'],
  ['perfect', 'Образцовый смотритель', 'Выполнить все дела во все семь дней'],
  ['catfriend', 'Хвостатый друг', 'Оставить рыжего кота у себя'],
  ['catfeed', 'Кормилец', 'Кормить кота рыбой каждый день до конца смены'],
  ['gifts', 'Щедрая душа', 'Подарить подарки Матвею, Соне и Лиде'],
  ['crafter', 'Мастер на все руки', 'Смастерить на верстаке все вещи'],
  ['herbalist', 'Травник', 'Собрать все пять видов трав'],
  ['tea', 'Чайный мастер', 'Заварить три разных чая'],
  ['stars', 'Звездочёт', 'Найти в подзорную трубу пять созвездий'],
  ['whales', 'Песня китов', 'Увидеть китов у смотровой площадки'],
  ['fisher', 'Рыбак', 'Поймать десять рыб'],
  ['bench', 'Созерцатель', 'Посидеть на всех трёх скамейках острова'],
  ['explorer', 'Исследователь', 'Дойти до лесного озера в Дальнем лесу'],
  ['collector', 'Коллекционер', 'Собрать все сувениры'],
  ['angler', 'Знаток рыб', 'Поймать все девять видов рыб'],
  ['birder', 'Орнитолог', 'Увидеть всех птиц острова'],
  ['atlas', 'Натуралист', 'Заполнить атлас острова целиком'],
  ['inspector', 'Образцовый маяк', 'Получить «отлично» у инспектора'],
];
let ACHV = []; try { ACHV = JSON.parse(localStorage.getItem('lighthouse-ach-v1') || '[]'); } catch (e) { ACHV = []; }
function unlock(id) {
  if (ACHV.includes(id)) return; ACHV.push(id); try { localStorage.setItem('lighthouse-ach-v1', JSON.stringify(ACHV)); } catch (e) { }
  const a = ACH.find(x => x[0] === id); if (!a) return;
  const el = document.createElement('div'); el.className = 'toast pix ach'; el.innerHTML = '<i>★</i>'; const s = document.createElement('span'); s.innerHTML = '<small>Достижение</small>'; s.appendChild(document.createTextNode(a[1])); el.appendChild(s);
  $('#toasts').appendChild(el); setTimeout(() => el.remove(), 4200);
  if (AU.ac) { const t = AU.ac.currentTime; [72, 76, 79, 84].forEach((n, i) => AU.piano(n, t + i * .08, .12, 1.6)); }
}
function stat(key, val) { const s = S.stats; if (!s[key]) s[key] = []; if (!s[key].includes(val)) s[key].push(val); return s[key].length; }

// ---------- NPC visits by boat ----------
const SAIL = 14; // game minutes for a boat to come in or go out
const SONYA_PATH = [[30.6, 36.6], [31, 31], [31, 24], [33, 18.6], [40, 16.4], [44.6, 14.9]];
const SONYA_BACK = [[44.6, 14.9], [40, 16.4], [33, 18.6], [31, 24], [31, 31], [32.2, 33.6]];
const VISITS = [
  { npc: 'matvey', day: 2, arrive: 540, leave: 1050, boat: 'small', bpos: [27.9, 43.2], dock: [30.3, 43], legs: [{ to: [30.3, 41.2], dir: 1 }] },
  { npc: 'matvey', day: 4, arrive: 600, leave: 1000, boat: 'small', bpos: [27.9, 43.2], dock: [30.3, 43], legs: [{ via: [[30.5, 36.6], [36, 35.6]], to: [41.3, 35.4], dir: 0 }] },
  { npc: 'sonya', day: 4, arrive: 570, leave: 1170, boat: 'row', bpos: [33.4, 45.4], dock: [31.5, 45.2], legs: [{ via: SONYA_PATH, to: [46.4, 13.8], dir: 3 }] },
  { npc: 'lida', day: 4, arrive: 600, leave: 900, boat: 'post', bpos: [33.9, 42.2], dock: [31.5, 42], legs: [{ to: [31.5, 39.3], dir: 0 }] },
  { npc: 'gromov', day: 5, arrive: 600, leave: 960, boat: 'post', bpos: [33.9, 42.2], dock: [31.5, 42], legs: [{ via: [[31, 36.6], [31, 30], [31, 24], [33, 18.6]], to: [35.8, 14.6], dir: 1 }] },
  { npc: 'sonya', day: 5, arrive: 570, leave: 1170, boat: 'row', bpos: [33.4, 45.4], dock: [31.5, 45.2], legs: [{ via: SONYA_PATH, to: [46.4, 13.8], dir: 3 }] },
  { npc: 'sonya', day: 6, arrive: 570, leave: 1170, boat: 'row', bpos: [33.4, 45.4], dock: [31.5, 45.2], legs: [{ via: SONYA_PATH, to: [46.4, 13.8], dir: 3 }] },
  { npc: 'belov', day: 6, arrive: 586, leave: 986, boat: 'ship', bpos: [34.6, 44], dock: [31.5, 44], legs: [{ to: [31.4, 43.2], dir: 3 }] },
  { npc: 'matvey', day: 6, arrive: 1066, leave: 1350, boat: 'small', bpos: [27.9, 43.2], dock: [30.3, 43], legs: [{ to: [30.3, 40.2], dir: 0 }] },
  { npc: 'matvey', day: 7, arrive: 466, leave: null, boat: 'small', bpos: [27.9, 43.2], dock: [30.3, 43], legs: [{ to: [30.3, 41.2], dir: 1, until: 1080 }, { via: [[30.5, 37]], to: [28.6, 35.2], dir: 2 }] },
  { npc: 'lida', day: 7, arrive: 526, leave: null, boat: 'post', bpos: [33.9, 42.2], dock: [31.5, 42], legs: [{ via: [[31.4, 36.8], [33, 35]], to: [36, 33.8], dir: 0, until: 1080 }, { to: [33.3, 35.3], dir: 1 }] },
  { npc: 'sonya', day: 7, arrive: 526, leave: null, boat: 'row', bpos: [33.4, 45.4], dock: [31.5, 45.2], legs: [{ via: SONYA_PATH, to: [46.4, 13.8], dir: 3, until: 1080 }, { via: SONYA_BACK, to: [32.6, 34.2], dir: 1 }] },
];
const polyLen = p => { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; };
function along(p, dist) {
  for (let i = 1; i < p.length; i++) {
    const dx = p[i][0] - p[i - 1][0], dy = p[i][1] - p[i - 1][1], l = Math.hypot(dx, dy);
    if (dist <= l || i === p.length - 1) { const k = l ? clamp(dist / l, 0, 1) : 1; return { x: p[i - 1][0] + dx * k, y: p[i - 1][1] + dy * k, dx, dy }; }
    dist -= l;
  }
  return { x: p[0][0], y: p[0][1], dx: 0, dy: 1 };
}
function timeline(v) {
  if (v.tl) return v.tl;
  const seg = []; let t = v.arrive; seg.push({ k: 'in', t0: t, t1: t + SAIL }); t += SAIL; let pos = v.dock;
  v.legs.forEach((L, i) => {
    const pts = [pos, ...(L.via || []), L.to], len = polyLen(pts); // walk speed: one tile per game minute
    seg.push({ k: 'walk', t0: t, t1: t + len, pts, len }); t += len;
    const last = i === v.legs.length - 1, until = last ? (v.leave ?? 1e9) : Math.max(t, L.until);
    seg.push({ k: 'stand', t0: t, t1: until, at: L.to, dir: L.dir }); t = until; pos = L.to;
  });
  if (v.leave != null) { const L = v.legs[v.legs.length - 1]; const pts = [pos, ...(L.via || []).slice().reverse(), v.dock], len = polyLen(pts); seg.push({ k: 'walk', t0: t, t1: t + len, pts, len }); t += len; seg.push({ k: 'out', t0: t, t1: t + SAIL }); }
  return (v.tl = seg);
}
// when a visitor reaches a stage of their visit: 'walk' (stepped on the pier) or 'stand' (arrived where they wait)
function visitAt(npc, day, kind, n = 0) { const v = VISITS.find(v => v.npc === npc && v.day === day); if (!v) return 1e9; const segs = timeline(v).filter(s => s.k === kind); return segs[n] ? Math.ceil(segs[n].t0) : 1e9; }
function visitsNow() {
  const npcs = [], boats = [], m = S.min;
  for (const v of VISITS) {
    if (v.day !== S.day) continue; const tl = timeline(v);
    const seg = tl.find(s => m >= s.t0 && m < s.t1); if (!seg) continue;
    const from = [v.bpos[0] + (v.bpos[0] < 31 ? -12 : 12), 58];
    let bx = v.bpos[0], by = v.bpos[1], mv = 0;
    if (seg.k === 'in') { const k = smooth((m - seg.t0) / SAIL); bx = lerp(from[0], bx, k); by = lerp(from[1], by, k); mv = 1; }
    if (seg.k === 'out') { const k = smooth((m - seg.t0) / SAIL); bx = lerp(bx, from[0], k); by = lerp(by, from[1], k); mv = 1; }
    boats.push({ x: bx * T, y: by * T, kind: v.boat, moving: mv });
    if (seg.k === 'walk') { const a = along(seg.pts, (m - seg.t0) / Math.max(.001, seg.t1 - seg.t0) * seg.len); npcs.push({ id: v.npc, x: a.x * T, y: a.y * T, dir: Math.abs(a.dx) > Math.abs(a.dy) ? (a.dx < 0 ? 1 : 2) : (a.dy < 0 ? 3 : 0), moving: true }); }
    if (seg.k === 'stand') npcs.push({ id: v.npc, x: seg.at[0] * T, y: seg.at[1] * T, dir: seg.dir, moving: false });
  }
  return { npcs, boats };
}
function npcPresent(id) { return visitsNow().npcs.some(n => n.id === id); }
function drawBoatKind(c, x, y, k, time, mv, seed) {
  x = Math.round(x); y = Math.round(y);
  if (mv) for (let i = 0; i < 6; i++) { c.globalAlpha = .55 - i * .08; R(c, x - 7 + Math.sin(time * 3 + i) * 2 - i, y + 5 + i * 4, 14 + i * 2, 1, '#e3f4f3'); } c.globalAlpha = 1;
  const b = Math.round(Math.sin(time * 1.6 + (seed || 0)) * 1);
  if (k === 'row') { y += b; c.fillStyle = 'rgba(10,30,50,.3)'; c.beginPath(); c.ellipse(x, y + 3, 11, 3, 0, 0, 7); c.fill(); R(c, x - 9, y - 5, 18, 6, '#8a5a32'); R(c, x - 9, y - 5, 18, 1, '#b07a48'); R(c, x - 7, y - 3, 14, 2, '#5d3a20'); R(c, x - 1, y - 4, 2, 3, '#a87444'); R(c, x - 13, y - 2, 5, 1, '#c9a26e'); R(c, x + 8, y - 2, 5, 1, '#c9a26e'); return; }
  if (k === 'post') { y += b; c.fillStyle = 'rgba(10,30,50,.3)'; c.beginPath(); c.ellipse(x, y + 4, 18, 4, 0, 0, 7); c.fill(); R(c, x - 16, y - 7, 32, 8, '#2f5d8a'); R(c, x - 16, y - 1, 32, 2, '#1f3f60'); R(c, x - 6, y - 15, 12, 8, '#e9e4d8'); R(c, x - 4, y - 13, 8, 3, '#2e3a4c'); R(c, x + 2, y - 23, 1, 8, '#5d3a20'); R(c, x + 3, y - 23, 6, 4, '#e8c55a'); R(c, x + 4, y - 22, 4, 2, '#c8443a'); return; }
  drawVisitBoat(c, x, y, k === 'ship', time);
}

// ---------- the red cat (movement lives in features2.js) ----------
const CAT = { map: 'island', x: 34.8 * T, y: 14.8 * T, dir: 0, st: 'sit', t: 2, tx: 0, ty: 0, z: 0, phase: 'door', path: [], jump: null, after: null };
const catName = () => S.flags.catName || 'Рыжик';
const catKept = () => S.flags.cat === 'kept';
function catShown(mapId) {
  if (S.day < 3 || S.flags.cat === 'gone') return false;
  if (!catKept()) return mapId === 'island' && (S.day > 3 || S.min >= 420);
  return CAT.map === mapId;
}
function drawCat(c, x, y, st, dir, t) {
  x = Math.round(x); y = Math.round(y);
  const O = '#e58a3a', D = '#b9622a', L = '#f6c890', E = '#2a2022';
  c.fillStyle = 'rgba(20,28,40,.25)'; c.beginPath(); c.ellipse(x, y, 5, 1.6, 0, 0, 7); c.fill();
  if (st === 'sleep') {
    const br = Math.sin(t * 2) > 0 ? 1 : 0;
    R(c, x - 5, y - 4 - br, 10, 4 + br, O); R(c, x - 4, y - 5 - br, 7, 1, O); R(c, x - 3, y - 3, 2, 1, D); R(c, x, y - 4, 2, 1, D);
    R(c, x + 3, y - 5, 4, 3, O); R(c, x + 3, y - 6, 1, 1, O); R(c, x + 6, y - 6, 1, 1, O); R(c, x + 4, y - 4, 2, 1, D);
    R(c, x - 5, y - 1, 9, 1, D); R(c, x + 4, y - 1, 2, 1, O);
    const zt = (t * .8) % 3; if (zt < 2) { c.globalAlpha = 1 - zt / 2; R(c, x + 6 + zt * 3, y - 10 - zt * 4, 3, 1, '#e9f0ff'); R(c, x + 7 + zt * 3, y - 9 - zt * 4, 1, 1, '#e9f0ff'); R(c, x + 6 + zt * 3, y - 8 - zt * 4, 3, 1, '#e9f0ff'); c.globalAlpha = 1; }
    return;
  }
  if (st === 'walk') {
    const f = Math.floor(t * 9) % 4, lift = [0, 1, 0, 1][f];
    if (dir === 1 || dir === 2) {
      const s = dir === 1 ? -1 : 1, hx = s > 0 ? x + 3 : x - 6, tx = s > 0 ? x - 5 : x + 4;
      R(c, x - 4, y - 7, 9, 4, O); R(c, x - 2, y - 7, 1, 3, D); R(c, x + 1, y - 7, 1, 3, D); R(c, x - 3, y - 4, 7, 1, L);
      R(c, x - 3, y - 3 - lift, 1, 3, O); R(c, x - 1, y - 3 - (1 - lift), 1, 3, O); R(c, x + 1, y - 3 - lift, 1, 3, O); R(c, x + 3, y - 3 - (1 - lift), 1, 3, O);
      R(c, hx, y - 10, 4, 4, O); R(c, hx, y - 11, 1, 1, O); R(c, hx + 3, y - 11, 1, 1, O); R(c, s > 0 ? hx + 2 : hx + 1, y - 9, 1, 1, E); R(c, s > 0 ? hx + 3 : hx, y - 8, 1, 1, L);
      const sw = Math.round(Math.sin(t * 5));
      R(c, tx, y - 9 + sw, 1, 3, O); R(c, tx - s, y - 10 + sw, 1, 2, D);
    } else {
      R(c, x - 3, y - 7, 6, 5, O); R(c, x - 3, y - 2 - lift, 2, 2, O); R(c, x + 1, y - 2 - (1 - lift), 2, 2, O);
      if (dir === 0) { R(c, x - 3, y - 11, 6, 5, O); R(c, x - 3, y - 12, 1, 1, O); R(c, x + 2, y - 12, 1, 1, O); R(c, x - 2, y - 9, 1, 1, E); R(c, x + 1, y - 9, 1, 1, E); R(c, x - 1, y - 7, 2, 1, L); R(c, x - 1, y - 11, 2, 1, D); }
      else { R(c, x - 3, y - 11, 6, 4, O); R(c, x - 3, y - 12, 1, 1, O); R(c, x + 2, y - 12, 1, 1, O); R(c, x - 1, y - 10, 2, 1, D); R(c, x, y - 13 + Math.round(Math.sin(t * 5)), 1, 5, O); }
    }
    return;
  }
  // sitting poses (sit, lick, eat, pet)
  const side = dir === 1 ? -1 : 1;
  R(c, x - 3, y - 6, 6, 6, O); R(c, x - 1, y - 5, 2, 4, L); R(c, x - 3, y - 4, 1, 2, D); R(c, x + 2, y - 4, 1, 2, D);
  const hy = st === 'eat' ? y - 8 : st === 'lick' && Math.sin(t * 6) > 0 ? y - 10 : y - 11;
  R(c, x - 3, hy, 6, 5, O); R(c, x - 3, hy - 1, 1, 1, O); R(c, x + 2, hy - 1, 1, 1, O); R(c, x - 1, hy, 2, 1, D);
  if (st === 'pet' || (st === 'sit' && Math.sin(t * .7) > .9)) { R(c, x - 2, hy + 2, 1, 1, E); R(c, x + 1, hy + 2, 1, 1, E); }
  else if (dir !== 3) { R(c, x - 2, hy + 2, 1, 2, E); R(c, x + 1, hy + 2, 1, 2, E); }
  if (dir !== 3) R(c, x - 1, hy + 4, 2, 1, L);
  if (st === 'lick') R(c, x - 2, y - 7 + (Math.sin(t * 6) > 0 ? -1 : 0), 1, 2, L);
  if (st === 'eat') { R(c, x - 4, y - 1, 8, 2, '#9b958b'); R(c, x - 2, y - 2, 4, 1, '#8fb3c8'); }
  const sw = Math.sin(t * 2.5);
  R(c, x + 3 * side, y - 1, 2 * side, 1, O); R(c, x + 5 * side, y - 2 + Math.round(sw), 1, 2, O); R(c, x + 6 * side, y - 3 + Math.round(sw * 1.5), 1, 1, D);
}
function catObj(mapId) {
  return {
    kind: 'cat', map: mapId, r: 14,
    get x() { return CAT.x; }, get y() { return CAT.y; }, get iy() { return CAT.y - 6 - CAT.z; },
    on: () => catShown(mapId),
    draw(c, sx, sy) { drawCat(c, sx, sy - Math.round(CAT.z), CAT.st, CAT.dir, G.time); },
    use: {
      label: () => {
        if (!catKept()) return 'Рыжий кот';
        const nm = catName(); if (CAT.phase === 'bed') return nm + ': погладить спящего';
        return S.flags.catFed !== S.day && has('fish') ? nm + ': покормить рыбой' : nm + ': погладить';
      },
      run: catRun,
    },
  };
}
function meow(hi) { if (!AU.ac) return; const t = AU.ac.currentTime, o = AU.ac.createOscillator(), g = AU.ac.createGain(); o.type = 'triangle'; const f = hi ? 900 : 700; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 1.35, t + .12); o.frequency.linearRampToValueAtTime(f * .8, t + .4); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.08, t + .05); g.gain.linearRampToValueAtTime(0, t + .42); o.connect(g); g.connect(AU.amb); o.start(t); o.stop(t + .45); }
function hearts(x, y) { for (let i = 0; i < 4; i++) G.parts.push({ x: x + (Math.random() - .5) * 10, y: y - 10, vx: (Math.random() - .5) * 8, vy: -14 - Math.random() * 8, life: 1, col: '#f07a7a', s: 2 }); }
function catRun() {
  if (!catKept()) {
    meow();
    return say([[HERO, S.day === 3 ? 'Рыжий кот. Мокрый, тощий, а смотрит так, будто это его маяк, а я тут в гостях.' : 'Рыжий кот всё сидит у дверей. Ждёт, что я решу.']], () => MENU.show('Что делать с котом?', [
      { label: 'Оставить кота', run: () => NAMEBOX.show('Рыжик', nm => { S.flags.cat = 'kept'; S.flags.catName = nm; S.flags.catDay = S.day; CAT.phase = 'wander'; CAT.map = 'island'; CAT.st = 'pet'; CAT.t = 2; unlock('catfriend'); meow(true); hearts(CAT.x, CAT.y); say([[HERO, `Ну заходи, ${nm}. Только чур, рыба пополам.`], ['Подсказка', 'Кота нужно кормить рыбой раз в день. Днём он гуляет у маяка, а к пяти вечера сам идёт домой спать на вашу кровать.']], () => UI.tasks()); }) },
      { label: 'Прогнать', run: () => { S.flags.cat = 'gone'; say([[HERO, 'Кыш! Нечем мне тебя кормить.'], [HERO, 'Кот посмотрел с укором, медленно, с достоинством, и ушёл к пирсу. Больше его не видно.']], () => UI.tasks()); } },
    ], 'Подумаю ещё'));
  }
  const nm = catName();
  if (CAT.phase === 'bed') { hearts(CAT.x, CAT.y - 14); return toast(nm + ' мурлычет во сне и дёргает ухом'); }
  if (S.flags.catFed !== S.day && has('fish')) {
    take('fish'); S.flags.catFed = S.day; stat('fed', S.day); CAT.st = 'eat'; CAT.t = 3; meow(true);
    setTimeout(() => hearts(CAT.x, CAT.y), 1200);
    const since = S.flags.catDay || 3; let all = S.day === 7; for (let d = since; d <= 7 && all; d++) if (!S.stats.fed.includes(d)) all = false;
    if (all) unlock('catfeed');
    UI.tasks(); return toast(nm + ' уплетает рыбу и громко урчит');
  }
  CAT.st = 'pet'; CAT.t = 2.5; CAT.dir = 0; hearts(CAT.x, CAT.y); meow(true);
  toast(S.flags.catFed === S.day ? nm + ' мурлычет и трётся о ноги' : nm + ' мурлычет, но явно намекает на рыбу');
}

// ---------- herbs ----------
const HERBS = { melissa: 'Мелисса', chamomile: 'Ромашка', mint: 'Мята', thyme: 'Чабрец', fireweed: 'Иван-чай' };
const HERB_IDS = Object.keys(HERBS);
function drawHerb(c, x, y, k, t, wind, seed) {
  x = Math.round(x); y = Math.round(y); const ln = Math.round(Math.sin(t * 2 + seed) * wind * .6);
  if (k === 'melissa') { R(c, x - 4, y - 3, 3, 2, '#8cc45a'); R(c, x + 1, y - 4, 3, 2, '#9fd36a'); R(c, x - 2 + ln, y - 6, 3, 2, '#9fd36a'); R(c, x + ln, y - 8, 2, 2, '#b4e07e'); R(c, x + ln, y - 9, 1, 1, '#fff'); R(c, x - 3, y - 1, 6, 1, '#6f9f48'); }
  if (k === 'chamomile') { [[-3, 5], [1, 7], [3, 4]].forEach(([dx, h], i) => { const l = Math.round(ln * (i + 1) / 2); R(c, x + dx, y - h, 1, h, '#5f9a4c'); R(c, x + dx - 1 + l, y - h - 1, 3, 3, '#ffffff'); R(c, x + dx + l, y - h, 1, 1, '#f2c83a'); }); }
  if (k === 'mint') { for (let i = 0; i < 3; i++) { R(c, x - 3 + i * 3 + (i === 1 ? ln : 0), y - 3 - i * 2 + (i === 1 ? -1 : 0), 2, 3, i % 2 ? '#5fd07a' : '#4fbf6a'); } R(c, x - 1, y - 1, 3, 1, '#3c9a52'); R(c, x + ln, y - 8, 1, 2, '#4fbf6a'); }
  if (k === 'thyme') { R(c, x - 4, y - 3, 8, 3, '#6a8a4a'); R(c, x - 3, y - 4, 6, 1, '#7a9a5a'); [[-3, -4], [0, -5], [2, -4], [-1, -3], [3, -3]].forEach(([dx, dy]) => R(c, x + dx + ln, y + dy, 1, 1, '#b67ad0')); }
  if (k === 'fireweed') { R(c, x, y - 10, 1, 10, '#5a8a48'); R(c, x - 2, y - 4, 2, 1, '#5a8a48'); R(c, x + 1, y - 6, 2, 1, '#5a8a48'); for (let i = 0; i < 4; i++) R(c, x - 1 + ln, y - 12 + i * 2, 3, 1, i % 2 ? '#e06aa8' : '#f08cc0'); R(c, x + ln, y - 13, 1, 1, '#f08cc0'); }
  if (Math.sin(t * 2.2 + seed * 3) > .93) R(c, x + 3, y - 10, 1, 1, '#fff7d0');
}

// ---------- recipes ----------
const TEAS = [
  { id: 't_matvey', n: 'Чай Матвея', need: { tea: 1 }, text: 'Чай Матвея пахнет чабрецом и дымом. За окном шумит море, в печи потрескивает. Хорошо.' },
  { id: 't_cham', n: 'Ромашковый чай', need: { chamomile: 2 }, text: 'Ромашковый чай: мягкий, золотистый. Пахнет летом и бабушкиным домом.' },
  { id: 't_mint', n: 'Мята с мелиссой', need: { mint: 1, melissa: 1 }, text: 'Мята холодит, мелисса успокаивает. Лучший чай после длинного дня.' },
  { id: 't_forest', n: 'Лесной сбор', need: { fireweed: 1, thyme: 1, chamomile: 1 }, text: 'Иван-чай, чабрец и ромашка. Вкус всего острова в одной кружке.' },
];
const RECIPES = [
  { id: 'gift_matvey', n: 'Поплавок-талисман', who: 'подарок Матвею', need: { driftwood: 1, gullfeather: 1, rope: 1 } },
  { id: 'gift_sonya', n: 'Ожерелье из ракушек', who: 'подарок Соне', need: { shell: 3, seaglass: 1, rope: 1 } },
  { id: 'gift_lida', n: 'Травяное саше', who: 'подарок Лиде', need: { melissa: 1, chamomile: 1, thyme: 1, rope: 1 } },
  { id: 'chime', n: 'Ловец ветра', who: 'украшение для дома', need: { seaglass: 2, driftwood: 1, rope: 1 } },
];
const canMake = need => Object.entries(need).every(([k, n]) => (S.inv[k] || 0) >= n);
const needText = need => Object.entries(need).map(([k, n]) => `${ITEMS[k].n.toLowerCase()} ${Math.min(S.inv[k] || 0, n)}/${n}`).join(' · ');
function spend(need) { for (const [k, n] of Object.entries(need)) take(k, n); }
function cookFish() {
  startAct('cook', 1.8, () => {
    take('fish'); const extra = (S.q.uha === 1 || (S.flags.ny === 1 && !S.flags.nyUha)) && !has('uha');
    if (open('dinner')) progress('dinner');
    if (extra) { give('uha'); say([[HERO, 'Сварил большой котелок. Половину — себе на ужин, половину — ' + (S.q.uha === 1 ? 'Матвею.' : 'Нюре на Птичий базар.')]]); }
    else say([[HERO, 'Уха с дымком. Ничего вкуснее на острове нет.']]);
  });
}
function brew(tea) { startAct('cook', 1.3, () => { spend(tea.need); if (stat('teas', tea.id) >= 3) unlock('tea'); say([[HERO, tea.text]]); }); }
function stoveMenu() {
  const opts = [];
  if (has('fish')) opts.push({ label: 'Сварить уху', sub: 'рыба ' + Math.min(1, S.inv.fish) + '/1', run: cookFish });
  TEAS.forEach(tea => opts.push({ label: 'Заварить: ' + tea.n, sub: needText(tea.need), disabled: !canMake(tea.need), run: () => brew(tea) }));
  if (has('resin') || boatStage() === 1) opts.push({ label: 'Сварить смолу для лодки', sub: needText({ resin: 2 }), disabled: !canMake({ resin: 2 }), run: () => startAct('cook', 1.6, () => { spend({ resin: 2 }); give('tar'); say([[HERO, 'Живица побулькала и стала густой чёрной смолой. Пахнет лесом.']]); }) });
  opts.push({ label: 'Погреть руки', run: () => say([[HERO, S.min >= 1020 ? 'Печь гудит, по стенам бегают отсветы. Самое уютное место на острове.' : 'Печь ещё тёплая со вчерашнего вечера.']]) });
  MENU.show('Печь', opts, 'Отойти');
}
function craftMenu() {
  MENU.show('Верстак. Что смастерить?', RECIPES.map(r => ({ label: r.n + ' · ' + r.who, sub: r.done && r.done() ? 'уже сделано' : needText(r.need), disabled: (r.done && r.done()) || !canMake(r.need), run: () => startAct('fix', 1.8, () => {
    spend(r.need); give(r.id); if (stat('crafted', r.id) >= RECIPES.length) unlock('crafter');
    say([[HERO, { gift_matvey: 'Поплавок из плавника, с пером чайки на верёвочке. Матвею понравится.', gift_sonya: 'Ожерелье: ракушки и кусочек морского стекла. Соня будет рада.', gift_lida: 'Мешочек с мелиссой, ромашкой и чабрецом. Пусть письма Лиды пахнут летом.', chime: 'Ловец ветра из стекла и плавника. Повешу у окна в доме.' }[r.id] || r.say]]);
  }) })), 'Отойти');
}
const GIFTS = { matvey: 'gift_matvey', sonya: 'gift_sonya', lida: 'gift_lida' };
const GIFT_LINES = {
  matvey: [['Матвей', 'Это мне? Поплавок... с пером чайки... Ох, смотритель.'], ['Матвей', 'Повешу в лодке, на удачу. Полвека рыбачу — а такого мне никто не дарил.']],
  sonya: [['Соня', 'Ожерелье! Из ракушек и морского стекла!'], ['Соня', 'Я его никогда-никогда не сниму. Ну, только когда купаться.']],
  lida: [['Лида', 'Саше с травами? Мне?'], ['Лида', 'Положу в сумку с письмами. Пусть все письма острова пахнут мелиссой. Спасибо!']],
};
function preTalk(id) {
  const g = GIFTS[id];
  if (g && has(g) && !S.flags['gave_' + id]) {
    say(GIFT_LINES[id], () => { take(g); S.flags['gave_' + id] = 1; if (['matvey', 'sonya', 'lida'].every(k => S.flags['gave_' + k])) unlock('gifts'); UI.tasks(); });
    return true;
  }
  if (id === 'matvey' && S.flags.cat === 'gone' && !S.flags.catTold) {
    S.flags.catTold = 1;
    say([['Матвей', 'Слушай, смотритель. Подобрал на днях у пирса рыжего котёнка. Тощий, мокрый, а наглый — страсть!'], ['Матвей', 'Живёт теперь у меня в лодке, рыбу ворует. Рыжиком назвал.'], [HERO, 'Рыжий, говоришь... Хорошо, что он у тебя.']]);
    return true;
  }
  return false;
}

// ---------- benches ----------
const BENCH_THOUGHTS = {
  view: ['Отсюда видно всё море. Ветер пахнет солью и травой.', 'Если долго смотреть на горизонт, начинает казаться, что видно дом.'],
  cliff: ['Утёс. Одинокая сосна скрипит над головой. Где-то внизу бьётся море.', 'Савелий, наверное, тоже сидел здесь. Сорок лет — это много вечеров.'],
  glade: ['Лесная поляна. Тихо, только пчёлы гудят над ромашками.', 'В Дальнем лесу даже море звучит иначе — как далёкое дыхание.'],
};
function drawBench(c, sx, sy) { R(c, sx - 10, sy - 8, 20, 3, '#8a5a32'); R(c, sx - 10, sy - 6, 20, 1, '#6f4a2d'); R(c, sx - 9, sy - 5, 2, 5, '#5d3a20'); R(c, sx + 7, sy - 5, 2, 5, '#5d3a20'); R(c, sx - 10, sy - 13, 20, 2, '#8a5a32'); R(c, sx - 9, sy - 11, 1, 3, '#5d3a20'); R(c, sx + 8, sy - 11, 1, 3, '#5d3a20'); }
function makeBench(x, y, id) {
  const o = addObj('island', { x: x * T, y: y * T, kind: 'bench', bench: id, solid: [-9, -4, 18, 4], draw: drawBench, use: { label: () => 'Посидеть на скамейке', run: () => sitDown(o) } });
  return o;
}
function sitDown(o) {
  P.sit = { o, t: 0 }; P.x = o.x; P.y = o.y + 1; P.dir = 0; P.moving = false;
  if (stat('benches', o.bench) >= 3) unlock('bench');
  const th = BENCH_THOUGHTS[o.bench] || BENCH_THOUGHTS.view; toast(th[S.day % th.length]);
}
function standUp() { if (!P.sit) return; const o = P.sit.o; P.sit = null; P.y = o.y + 10; if (blocked(P.x, P.y)) P.y = o.y + 14; }

// ---------- telescope view ----------
const CONST = {
  1: { n: 'Большая Медведица', d: 'Ковш из семи звёзд. Если провести линию через две крайние звезды ковша, упрёшься в Полярную.', s: [[.18, .3], [.3, .33], [.41, .4], [.52, .47], [.56, .66], [.75, .68], [.78, .49]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
  2: { n: 'Кассиопея', d: 'Звёздная буква «W». В северных широтах она никогда не заходит за горизонт.', s: [[.24, .44], [.37, .62], [.5, .47], [.63, .64], [.76, .41]], e: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  4: { n: 'Лира', d: 'Маленький параллелограмм и яркая Вега — одна из самых ярких звёзд северного неба.', s: [[.42, .22], [.47, .42], [.6, .45], [.57, .68], [.43, .65]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]] },
  6: { n: 'Северная Корона', d: 'Полукруг из звёзд, будто кто-то обронил над морем диадему.', s: [[.24, .56], [.32, .41], [.44, .33], [.57, .33], [.69, .4], [.76, .54]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  7: { n: 'Малая Медведица', d: 'На кончике её ручки — Полярная звезда. Она всегда на севере и всегда показывает дорогу домой.', s: [[.3, .2], [.4, .31], [.47, .43], [.55, .53], [.68, .5], [.7, .67], [.57, .69]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
};
const SCOPE_DAY = {
  1: 'На горизонте тонкая полоска материка. Там дом. Ближе идёт под парусом яхта, вокруг кружат чайки.',
  2: 'Ветер гонит барашки. Далеко на севере ползёт сухогруз с разноцветными контейнерами.',
  3: 'Дождь стирает горизонт. Море и небо одного серого цвета.',
  4: 'После шторма видно далеко: соседний остров, крыши рыбацкой деревни, даже маленький маяк на мысу.',
  5: 'Туман. Белое молоко. На миг проступает силуэт судна — и снова исчезает.',
  6: '«Северянка» идёт вдоль горизонта, за ней тянется дымок. Над мачтами кружат чайки.',
  7: 'На горизонте ясно виден материк. Сегодня вечером — туда.',
};
function scopePhase() { const h = (S.min % 1440) / 60; return h < 5.5 || h >= 20.5 ? 'night' : h < 7.5 ? 'dawn' : h < 17.5 ? 'day' : 'dusk'; }
const clearSky = () => !['rain', 'storm', 'fog'].includes(S.weather);
function scopeInfo() {
  const d = S.day, ph = scopePhase();
  if (ph === 'night') {
    if (d === 6 && S.min >= 1230) { S.flags.whalesSeen = 1; unlock('whales'); atlasAdd('stars', 'd6'); UI.tasks(); return ['Киты', 'Из воды поднимаются тёмные спины: одна, вторая, третья. Киты поют низко и протяжно, так что дрожат перила. А над ними горит Северная Корона. Матвей говорил правду. Ну, почти.']; }
    const cst = CONST[d];
    if (cst && clearSky()) { if (stat('stars', cst.n) >= 5) unlock('stars'); atlasAdd('stars', 'd' + d); return [cst.n, cst.d]; }
    return ['Ночное море', clearSky() ? 'Ночью видно только огни далёких судов и россыпь звёзд.' : 'Звёзд не видно: всё затянуто. Только огни далёких судов дрожат в темноте.'];
  }
  let txt = SCOPE_DAY[d];
  if (d === 3 && S.weather === 'storm') txt = 'Над морем вспыхивают молнии. Волны бьют в скалы так, что брызги долетают до трубы.';
  if (d === 7 && S.min >= 900) txt = 'Вдали показался катер. Он идёт сюда, за мной.';
  if (ph === 'dawn') txt += ' Утро только начинается, море ещё сонное.';
  if (ph === 'dusk' && clearSky()) txt += ' Солнце садится, вода горит золотом.';
  return ['В подзорную трубу', txt];
}
let SCOPE_ON = false;
function openScope() { SCOPE_ON = true; const [t, d] = scopeInfo(); $('#scopeT').textContent = t; $('#scopeD').textContent = d; $('#scope').hidden = false; }
function closeScope() { SCOPE_ON = false; $('#scope').hidden = true; }
$('#scopeX').onclick = closeScope;
function drawScope(c, w, h, t) {
  const d = S.day, ph = scopePhase(), wx = S.weather, hor = Math.round(h * .6);
  const grey = wx === 'rain' || wx === 'storm', fog = wx === 'fog';
  const skyC = ph === 'night' ? ['#050a1a', '#18264d'] : fog ? ['#cdd5da', '#e7ebed'] : grey ? ['#56606c', '#8a939c'] : ph === 'dawn' ? ['#3d4f8a', '#f2b48a'] : ph === 'dusk' ? ['#33366e', '#ff9a5c'] : ['#5d9ccf', '#c3e4f3'];
  const g = c.createLinearGradient(0, 0, 0, hor); g.addColorStop(0, skyC[0]); g.addColorStop(1, skyC[1]); c.fillStyle = g; c.fillRect(0, 0, w, hor);
  const night = ph === 'night', starsOn = night && (clearSky() || d === 6);
  if (starsOn) {
    for (let i = 0; i < 90; i++) { c.globalAlpha = .35 + .65 * Math.abs(Math.sin(t * (1 + hash(i, 4) * 2) + i)); R(c, hash(i, 1) * w, hash(i, 2) * hor * .95, 1, 1, '#fff6e0'); }
    c.globalAlpha = 1;
    const cst = CONST[d];
    if (cst) {
      const ox = w * .12, oy = 0, sw = w * .76, sh = hor * .9;
      c.strokeStyle = 'rgba(170,195,255,.45)'; c.lineWidth = 1; c.beginPath(); cst.e.forEach(([a, b]) => { c.moveTo(ox + cst.s[a][0] * sw, oy + cst.s[a][1] * sh); c.lineTo(ox + cst.s[b][0] * sw, oy + cst.s[b][1] * sh); }); c.stroke();
      cst.s.forEach(([sx, sy], i) => { const tw = .7 + .3 * Math.sin(t * 3 + i); c.globalAlpha = tw; R(c, ox + sx * sw - 1, oy + sy * sh - 1, 3, 3, (d === 7 && i === 0) || (d === 4 && i === 0) ? '#fffbe6' : '#e9f0ff'); R(c, ox + sx * sw - 2, oy + sy * sh, 5, 1, 'rgba(255,255,255,.4)'); c.globalAlpha = 1; });
    }
  }
  if (night) { disc(c, w * .86, h * .14, 5, '#f4ecd0'); }
  if (ph === 'dusk' && !grey && !fog) disc(c, w * .7, hor - 4, 9, '#ffe39a');
  if (ph === 'dawn' && !grey && !fog) disc(c, w * .2, hor - 6, 8, '#ffd8a0');
  // horizon features
  const land = night ? '#0d1428' : ph === 'dusk' ? '#4a3a62' : grey ? '#5f6872' : '#6f86a6';
  if (d === 1 || d === 7) { c.fillStyle = land; c.beginPath(); c.moveTo(w * .35, hor); for (let x = w * .35; x <= w; x += 4) c.lineTo(x, hor - 2 - Math.sin(x * .07) * 1.5 - (d === 7 ? 3 : 0)); c.lineTo(w, hor); c.fill(); if (night || ph === 'dusk') for (let i = 0; i < 14; i++) R(c, w * .4 + hash(i, 7) * w * .58, hor - 3 - hash(i, 8) * 3, 1, 1, '#ffd477'); }
  if (d === 4) { c.fillStyle = land; c.beginPath(); c.moveTo(w * .05, hor); c.lineTo(w * .12, hor - 9); c.lineTo(w * .3, hor - 11); c.lineTo(w * .42, hor); c.fill(); for (let i = 0; i < 6; i++) { R(c, w * .14 + i * 8, hor - 13, 5, 4, i % 2 ? '#c96a4b' : '#d9cfbd'); R(c, w * .14 + i * 8, hor - 14, 5, 1, '#7a3a2a'); } R(c, w * .36, hor - 22, 3, 12, '#f1ece2'); R(c, w * .36, hor - 24, 3, 2, night ? (Math.sin(t * 3) > 0 ? '#ffd477' : '#3a3a3a') : '#c8443a'); }
  // sea
  const sg = c.createLinearGradient(0, hor, 0, h); sg.addColorStop(0, night ? '#14234a' : fog ? '#bcc6cc' : grey ? '#4f5964' : ph === 'dusk' ? '#a8566a' : '#3a7fa8'); sg.addColorStop(1, night ? '#081226' : fog ? '#a9b3b9' : grey ? '#38414b' : ph === 'dusk' ? '#2d2f5a' : '#1d5577'); c.fillStyle = sg; c.fillRect(0, hor, w, h - hor);
  for (let i = 0; i < 70; i++) { const yy = hor + 2 + Math.pow(hash(i, 5), 1.5) * (h - hor), xx = ((hash(i, 6) * w * 1.3 + t * (5 + (yy - hor) * .1)) % (w + 30)) - 15; if (Math.sin(t * 1.6 + i) > (d === 2 ? -.2 : .3)) R(c, xx, yy, 2 + (yy - hor) * .06, 1, d === 2 ? 'rgba(240,250,255,.8)' : night ? 'rgba(170,190,240,.35)' : ph === 'dusk' ? 'rgba(255,190,140,.6)' : 'rgba(220,240,255,.5)'); }
  // vessels
  if (d === 1 && !night) { const bx = (t * 5) % (w + 40) - 20; R(c, bx - 6, hor + 6, 12, 3, '#f2ebdc'); R(c, bx, hor - 6, 1, 12, '#5d3a20'); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(bx + 1, hor - 6); c.lineTo(bx + 8, hor + 4); c.lineTo(bx + 1, hor + 4); c.fill(); }
  if (d === 2) { const bx = w - ((t * 3) % (w + 80)) + 20; R(c, bx - 26, hor - 3, 52, 5, night ? '#1a1f2a' : '#2c2f38'); const cc = ['#c8443a', '#3b7ea0', '#e8c55a', '#5fae8f']; for (let i = 0; i < 8; i++) R(c, bx - 22 + i * 5, hor - 7, 4, 4, night ? '#22283a' : cc[i % 4]); R(c, bx + 16, hor - 11, 6, 8, '#e9e4d8'); if (night) R(c, bx + 18, hor - 9, 1, 1, '#ffd477'); }
  if (d === 5) { c.globalAlpha = .25 + .2 * Math.sin(t * .6); R(c, w * .45, hor - 6, 34, 6, '#6c7680'); R(c, w * .5, hor - 12, 10, 6, '#6c7680'); c.globalAlpha = 1; }
  if (d === 6 && !night) { const bx = (t * 4) % (w + 70) - 35; R(c, bx - 22, hor - 4, 44, 6, '#e9e4d8'); R(c, bx - 22, hor + 1, 44, 2, '#2d4f7a'); R(c, bx - 6, hor - 12, 14, 8, '#f4f0e6'); R(c, bx + 2, hor - 18, 3, 6, '#c8443a'); for (let i = 0; i < 5; i++) { c.globalAlpha = .5 - i * .08; R(c, bx + 3 - i * 4, hor - 22 - i * 2, 3, 2, '#cfd6db'); } c.globalAlpha = 1; }
  if (d === 6 && night && S.min >= 1230) for (let k = 0; k < 3; k++) { const wx2 = w * (.25 + k * .22), wy = hor + 14 + k * 5, r = Math.max(0, Math.sin(t * .6 + k * 2)); if (r > .05) { c.globalAlpha = r; ell(c, wx2, wy, 14, 3, '#22344a'); R(c, wx2 - 8, wy - 3, 12, 1, '#6f8fb3'); if (Math.sin(t * 1.4 + k) > .5) for (let i = 0; i < 6; i++) R(c, wx2 - 4 + Math.sin(i) * 2, wy - 6 - i * 3, 2, 2, 'rgba(220,235,255,.8)'); c.globalAlpha = 1; } }
  if (d === 7 && S.min >= 900) { const k = clamp((S.min - 900) / 300, 0, 1), bx = w * .62, sz = 4 + k * 8; R(c, bx - sz, hor + 2 - sz * .3, sz * 2, sz * .5 + 1, '#1a1f2a'); R(c, bx - sz * .4, hor - sz * .4, sz * .7, sz * .4, '#e9e4d8'); for (let i = 0; i < 4; i++) R(c, bx - sz - i * 5, hor + 3 + i, 4, 1, 'rgba(255,255,255,.6)'); }
  if (night) for (let i = 0; i < 3; i++) R(c, w * (.2 + i * .27) + Math.sin(t * .2 + i) * 6, hor - 1, 1, 1, i === 1 ? '#ff6a4a' : '#ffd477');
  if (!night && !grey && !fog) for (let i = 0; i < 3; i++) { const gx = (w * .3 + i * 22 + t * 6 * (1 + i * .2)) % w, gy = hor * .35 + Math.sin(t * 2 + i) * 6 + i * 6, fl = Math.sin(t * 9 + i) > 0 ? -1 : 1; R(c, gx - 3, gy + fl, 3, 1, '#2c2f38'); R(c, gx + 1, gy + fl, 3, 1, '#2c2f38'); R(c, gx, gy, 1, 1, '#2c2f38'); }
  if (grey) { c.fillStyle = 'rgba(200,215,235,.5)'; for (let i = 0; i < 60; i++) { const rx = (hash(i, 3) * w + t * 30) % w, ry = (hash(i, 9) * h + t * 140 * (1 + hash(i, 1))) % h; c.fillRect(rx, ry, 1, 4); } if (S.weather === 'storm' && Math.sin(t * 1.7) > .97) { c.fillStyle = 'rgba(240,245,255,.6)'; c.fillRect(0, 0, w, h); } }
  if (fog) { c.fillStyle = 'rgba(225,230,233,.55)'; c.fillRect(0, 0, w, h); }
  // eyepiece vignette
  c.fillStyle = '#000'; c.beginPath(); c.rect(0, 0, w, h); c.ellipse(w / 2, h / 2, w * .47, h * .47, 0, 0, Math.PI * 2); c.fill('evenodd');
  c.strokeStyle = '#6b5530'; c.lineWidth = 2; c.beginPath(); c.ellipse(w / 2, h / 2, w * .47, h * .47, 0, 0, Math.PI * 2); c.stroke();
  R(c, w / 2, h * .12, 1, 4, 'rgba(255,255,255,.18)'); R(c, w / 2, h * .84, 1, 4, 'rgba(255,255,255,.18)');
}

// ---------- shed contents & extra island objects ----------
function drawGenerator(c, sx, sy) {
  const on = S.power, shake = on ? Math.round(Math.sin(G.time * 40) * .6) : 0;
  R(c, sx - 14 + shake, sy - 16, 28, 16, '#5a6170'); R(c, sx - 14 + shake, sy - 16, 28, 2, '#7b8392'); R(c, sx - 10, sy - 12, 8, 6, '#2c2f38'); disc(c, sx - 6, sy - 9, 2, '#c9a24a');
  R(c, sx + 2, sy - 12, 8, 3, '#2c2f38'); R(c, sx + 3, sy - 11, 2, 1, on ? '#6fe08a' : '#3a3a3a'); R(c, sx + 7, sy - 11, 2, 1, on ? '#3a3a3a' : (Math.sin(G.time * 6) > 0 ? '#ff6a4a' : '#5a2a22'));
  R(c, sx + 8, sy - 24, 3, 8, '#3a3e48'); if (on && Math.random() < .2) G.parts.push({ x: CAMP(sx) + 9, y: CAMPY(sy) - 25, vx: 2, vy: -8, life: 1.2, col: 'rgba(160,160,160,.4)', s: 2, smoke: 1 });
}
const CAMP = sx => sx + G.cam.x, CAMPY = sy => sy + G.cam.y;
function buildExtras() {
  const m = MAPS.island;
  // benches
  buildExtras2();
  makeBench(46.5, 12.3, 'view'); makeBench(22.6, 11.8, 'cliff'); makeBench(76, 31.8, 'glade');
  // the old oak and far forest sign
  addObj('island', { x: 89 * T, y: 37.6 * T, kind: 'tree', solid: [-5, -4, 10, 4], r: 22, iy: 37.3 * T, draw(c, sx, sy) { drawRoundTree(c, sx, sy, 1.9, G.time, G.wind * .6, G.sh, 7); }, use: { label: () => 'Старый дуб', run: () => say([[HERO, 'Огромный дуб. На коре вырезано: «С. + А. 1961». Савелий и... Анна? На фотографии у него жена. Значит, они приходили сюда.']]) } });
  addObj('island', { x: 57.6 * T, y: 32.4 * T, kind: 'sign', solid: [-1, -2, 3, 2], draw(c, sx, sy) { R(c, sx, sy - 14, 2, 14, '#6b4a2e'); R(c, sx - 2, sy - 14, 13, 4, '#b68a58'); R(c, sx + 9, sy - 13, 2, 2, '#3a2a1a'); }, use: { label: () => 'Прочитать указатель', run: () => say([['Указатель', '→ Дальний лес · лесное озеро · старый дуб · ← Маяк']]) } });
  // cat
  MAPS.island.objs.push(catObj('island')); MAPS.house.objs.push(catObj('house'));
  // wind chime in the house (after crafting)
  addObj('house', { x: 5 * T + 10, y: 2.3 * T, kind: 'chime', on: () => (S.stats.crafted || []).includes('chime'), draw(c, sx, sy) { R(c, sx - 5, sy - 22, 10, 2, '#8a5a32'); for (let i = 0; i < 4; i++) { const sw = Math.round(Math.sin(G.time * 2 + i) * 1.5); R(c, sx - 4 + i * 3, sy - 20, 1, 4 + i % 2 * 2, '#c9c2b0'); R(c, sx - 5 + i * 3 + sw, sy - 16 + i % 2 * 2, 3, 3, ['#8fd0b9', '#9ec7da', '#c9e8d0', '#7fb8c8'][i]); } } });
  // shed interior
  const sh = 'shed';
  addObj(sh, { x: 3 * T, y: 3.3 * T, kind: 'gen', solid: [-14, -16, 28, 15], r: 18, iy: 3.6 * T, draw: drawGenerator, use: { label: () => S.power ? 'Генератор' : 'Запустить генератор', run: shedRun } });
  addObj(sh, { x: 6.2 * T, y: 2.2 * T, kind: 'tools', r: 16, iy: 2.9 * T, solid: [-12, -5, 24, 4], draw(c, sx, sy) { R(c, sx - 13, sy - 20, 26, 16, '#6f4a2d'); for (let i = 0; i < 6; i++) R(c, sx - 11 + i * 4, sy - 19, 1, 1, '#2c2f38'); R(c, sx - 10, sy - 17, 2, 10, '#9ca1aa'); R(c, sx - 11, sy - 18, 4, 3, '#9ca1aa'); R(c, sx - 4, sy - 17, 7, 3, '#b8bcc4'); R(c, sx - 4, sy - 14, 1, 6, '#8a5a32'); if (!has('wrench') && S.day >= 3) { R(c, sx + 5, sy - 17, 2, 9, '#9ca1aa'); R(c, sx + 4, sy - 18, 4, 3, '#9ca1aa'); } R(c, sx + 9, sy - 16, 2, 8, '#c8443a'); }, use: { label: () => !has('wrench') ? 'Взять гаечный ключ' : 'Стена с инструментами', run: () => { if (!has('wrench')) startAct('pick', .7, () => give('wrench')); else say([[HERO, S.day < 3 ? 'Пилы, рубанки, старый гаечный ключ. Пусть висят, пока не понадобятся.' : 'Пилы, рубанки, стамески. Всё на своих местах.']]); } } });
  addObj(sh, { x: 9.2 * T, y: 3.4 * T, kind: 'bench_w', solid: [-15, -12, 30, 11], r: 18, iy: 3.8 * T, draw(c, sx, sy) { R(c, sx - 15, sy - 14, 30, 7, '#a5774a'); R(c, sx - 15, sy - 14, 30, 2, '#c99a66'); R(c, sx - 13, sy - 7, 2, 7, '#6f4a2d'); R(c, sx + 11, sy - 7, 2, 7, '#6f4a2d'); R(c, sx - 10, sy - 16, 6, 2, '#9ca1aa'); R(c, sx + 2, sy - 16, 3, 2, '#e8d8a8'); R(c, sx + 7, sy - 17, 4, 3, '#8a5a32'); }, use: { label: () => 'Верстак: мастерить', run: craftMenu } });
  addObj(sh, { x: 10.5 * T, y: 5.6 * T, kind: 'rope', r: 15, solid: [-6, -4, 12, 4], draw(c, sx, sy) { ell(c, sx, sy - 4, 7, 4, '#c9a26e'); ell(c, sx, sy - 4, 4, 2, '#a5844e'); R(c, sx + 5, sy - 3, 4, 1, '#c9a26e'); }, use: { label: () => S.flags.ropeDay === S.day ? 'Моток верёвки' : 'Отрезать верёвки', run: () => { if (S.flags.ropeDay === S.day) return say([[HERO, 'На сегодня хватит. Верёвку надо беречь, завтра отрежу ещё.']]); startAct('pick', .8, () => { S.flags.ropeDay = S.day; give('rope', 2); }); } } });
  addObj(sh, { x: 1.9 * T, y: 6.6 * T, kind: 'bike', solid: [-8, -4, 16, 4], draw(c, sx, sy) { c.strokeStyle = '#3a3e48'; c.lineWidth = 1; c.beginPath(); c.arc(sx - 6, sy - 5, 5, 0, 7); c.stroke(); R(c, sx - 6, sy - 9, 12, 1, '#c8443a'); R(c, sx + 4, sy - 12, 1, 7, '#c8443a'); R(c, sx + 3, sy - 13, 4, 1, '#2c2f38'); R(c, sx - 3, sy - 11, 4, 2, '#2c2f38'); }, use: { label: () => 'Старый велосипед', run: () => say([[HERO, 'Велосипед без колеса. Интересно, где на острове на нём кататься? Разве что по пирсу туда и обратно.']]) }, r: 14 });
  addObj(sh, { x: 10.4 * T, y: 7.8 * T, kind: 'barrel', solid: [-12, -6, 24, 6], draw(c, sx, sy) { for (let i = 0; i < 2; i++) { const bx = sx - 6 + i * 12; R(c, bx - 5, sy - 13, 10, 13, '#7a4d2c'); R(c, bx - 5, sy - 11, 10, 1, '#3a3e48'); R(c, bx - 5, sy - 4, 10, 1, '#3a3e48'); ell(c, bx, sy - 13, 5, 2, '#8a5a32'); } } });
  addObj(sh, { x: 1.4 * T, y: 3.4 * T, kind: 'nets', draw(c, sx, sy) { c.strokeStyle = 'rgba(200,190,160,.7)'; c.beginPath(); for (let i = 0; i < 5; i++) { c.moveTo(sx - 6 + i * 3, sy - 26); c.lineTo(sx - 4 + i * 3, sy - 10); } for (let j = 0; j < 4; j++) { c.moveTo(sx - 7, sy - 24 + j * 4); c.lineTo(sx + 8, sy - 23 + j * 4); } c.stroke(); R(c, sx - 3, sy - 14, 3, 3, '#e8c55a'); } });
  addObj(sh, { x: 8.5 * T, y: 1.6 * T, kind: 'window', draw: drawWindow });
  addObj(sh, { x: 6 * T, y: 9 * T + 6, kind: 'door', r: 14, iy: 8.6 * T, draw() { }, use: { label: () => 'Выйти наружу', run: exitShed } });
  addObj(sh, { x: 6 * T, y: 9 * T, kind: 'mat', layer: -1, draw(c, sx, sy) { R(c, sx - 10, sy - 14, 20, 8, '#5d4a35'); } });
  buildIslets(); buildBoatHooks();
}
function exitShed() { if (G.busy) return; goTo('island', 47.5 * T, 26 * T + 18, 0); }
function spawnExtras() {
  const rnd = rng(S.day * 313 + 5), shuf = a => a.slice().sort(() => rnd() - .5);
  // herbs in forests
  shuf(WORLD.herbSpots).slice(0, 26).forEach(([x, y], i) => {
    const k = HERB_IDS[(i + S.day) % HERB_IDS.length], seed = i * 1.3;
    const o = addObj('island', { daily: 1, x, y, kind: 'herb', r: 12, gone: false, on: () => !o.gone, draw(c, sx, sy) { drawHerb(c, sx, sy, k, G.time, G.wind, seed); } });
    o.use = { label: () => 'Сорвать: ' + HERBS[k], run: () => startAct('pick', .5, () => { o.gone = true; give(k); if (stat('herbs', k) >= 5) unlock('herbalist'); }) };
  });
  const beach = shuf(WORLD.shellSpots);
  const pick = (spot, id, label, draw) => { const [x, y] = spot; const o = addObj('island', { daily: 1, x: x + 3, y: y + 2, kind: 'mat', r: 12, gone: false, on: () => !o.gone, draw }); o.use = { label: () => label, run: () => startAct('pick', .45, () => { o.gone = true; give(id); }) }; };
  beach.slice(0, 3).forEach(s => pick(s, 'driftwood', 'Подобрать плавник', (c, sx, sy) => { R(c, sx - 7, sy - 3, 14, 3, '#cbb48e'); R(c, sx - 7, sy - 3, 14, 1, '#e2cfaa'); R(c, sx + 3, sy - 5, 2, 2, '#cbb48e'); R(c, sx - 5, sy - 2, 3, 1, '#a8916c'); }));
  beach.slice(3, 5).forEach(s => pick(s, 'seaglass', 'Поднять морское стекло', (c, sx, sy) => { R(c, sx - 2, sy - 3, 4, 3, '#7fd0b0'); R(c, sx - 1, sy - 3, 1, 1, '#e8fff6'); if (Math.sin(G.time * 3 + sx) > .8) R(c, sx + 2, sy - 5, 1, 1, '#fff'); }));
  const east = WORLD.shellSpots.filter(([x, y]) => x > 46 * T && x < 60 * T && y > 17 * T && y < 34 * T);
  spawnIslets();
  shuf(east.length >= 2 ? east : beach.slice(5, 9)).slice(0, 2).forEach(s => pick(s, 'gullfeather', 'Поднять перо чайки', (c, sx, sy) => { for (let i = 0; i < 5; i++) R(c, sx - 3 + i, sy - 1 - i * .6, 2, 1, i > 2 ? '#9aa3ad' : '#f4f4f4'); }));
}

function iconExtra(id, p, c) {
  switch (id) {
    case 'melissa': p(4, 9, 4, 3, '#8cc45a'); p(8, 6, 4, 3, '#9fd36a'); p(6, 3, 4, 3, '#b4e07e'); p(7, 11, 1, 4, '#5f9a4c'); p(8, 2, 1, 1, '#fff'); break;
    case 'chamomile': [[4, 5], [10, 4], [7, 8]].forEach(([x, y]) => { p(x - 1, y - 1, 3, 3, '#fff'); p(x, y, 1, 1, '#f2c83a'); p(x, y + 2, 1, 14 - y - 2, '#5f9a4c'); }); break;
    case 'mint': p(5, 3, 3, 4, '#5fd07a'); p(9, 5, 3, 4, '#4fbf6a'); p(4, 8, 3, 4, '#4fbf6a'); p(8, 10, 3, 3, '#5fd07a'); p(7, 4, 1, 11, '#3c9a52'); break;
    case 'thyme': p(3, 8, 10, 5, '#6a8a4a'); [[4, 6], [7, 5], [10, 6], [5, 8], [9, 8], [12, 8]].forEach(([x, y]) => p(x, y, 2, 2, '#b67ad0')); break;
    case 'fireweed': p(7, 3, 1, 12, '#5a8a48'); for (let i = 0; i < 5; i++) p(6, 2 + i * 2, 3, 1, i % 2 ? '#e06aa8' : '#f08cc0'); p(5, 11, 2, 1, '#5a8a48'); p(8, 9, 2, 1, '#5a8a48'); break;
    case 'driftwood': p(2, 7, 12, 3, '#cbb48e'); p(2, 7, 12, 1, '#e2cfaa'); p(10, 4, 2, 3, '#cbb48e'); p(4, 10, 4, 1, '#a8916c'); break;
    case 'seaglass': p(4, 5, 5, 4, '#7fd0b0'); p(9, 8, 4, 4, '#9ec7da'); p(5, 6, 1, 1, '#e8fff6'); p(10, 9, 1, 1, '#ffffff'); break;
    case 'gullfeather': for (let i = 0; i < 10; i++) { p(3 + i, 13 - i, 1, 1, '#6c757f'); p(4 + i, 11 - i, 2, 2, i > 6 ? '#9aa3ad' : '#f4f4f4'); } break;
    case 'rope': disc(c, 8, 8, 6, '#c9a26e'); disc(c, 8, 8, 3, '#a5844e'); disc(c, 8, 8, 1, '#c9a26e'); p(12, 11, 3, 1, '#c9a26e'); break;
    case 'gift_matvey': p(7, 1, 1, 6, '#c9a26e'); p(5, 6, 6, 3, '#c8443a'); p(5, 9, 6, 3, '#f2ece0'); p(7, 12, 2, 3, '#cbb48e'); p(10, 3, 3, 1, '#f4f4f4'); p(11, 2, 3, 1, '#9aa3ad'); break;
    case 'gift_sonya': c.strokeStyle = '#c9a26e'; c.beginPath(); c.arc(8, 6, 5, .2, Math.PI - .2); c.stroke(); [[3, 8], [6, 10], [10, 10], [13, 8]].forEach(([x, y]) => p(x - 1, y, 3, 2, '#f3d2c0')); p(7, 11, 3, 3, '#7fd0b0'); break;
    case 'gift_lida': p(4, 5, 8, 9, '#e9dcbc'); p(4, 5, 8, 1, '#c9b48a'); p(5, 3, 6, 2, '#c9a26e'); p(6, 8, 2, 2, '#b67ad0'); p(9, 9, 1, 1, '#fff'); p(8, 11, 2, 1, '#9fd36a'); break;
    default: if (typeof iconMore === 'function') iconMore(id, p, c);
    case 'chime': if (id !== 'chime') break; p(3, 2, 10, 2, '#8a5a32'); for (let i = 0; i < 4; i++) { p(4 + i * 2, 4, 1, 4 + (i % 2) * 2, '#c9c2b0'); p(3 + i * 2, 8 + (i % 2) * 2, 3, 3, ['#8fd0b9', '#9ec7da', '#c9e8d0', '#7fb8c8'][i]); } break;
  }
}

// ---------- panel tabs: recipes and achievements ----------
function achTab(body) {
  const h = document.createElement('div'); h.className = 'sect'; h.textContent = `Достижения · ${ACHV.length} из ${ACH.length}`; body.appendChild(h);
  const g = document.createElement('div'); g.id = 'achGrid';
  ACH.forEach(([id, n, d]) => { const e = document.createElement('div'); e.className = 'achc' + (ACHV.includes(id) ? ' on' : ''); const i = document.createElement('i'); i.textContent = ACHV.includes(id) ? '★' : '☆'; const t = document.createElement('div'); const b = document.createElement('b'); b.textContent = n; const s = document.createElement('span'); s.textContent = d; t.append(b, s); e.append(i, t); g.appendChild(e); });
  body.appendChild(g);
}
