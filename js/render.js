"use strict";
// ===================== RENDER: ground, water, sprites =====================
const COL = {
  grass: '#69a65a', grass2: '#7dbb67', grass3: '#558f4b', forest: '#4b8a4c', forest2: '#3e7642', forest3: '#5a9a55',
  sand: '#e6cd93', sand2: '#d9bd80', sand3: '#f0dcaa', wet: '#c9ad73', path: '#c4a26c', path2: '#b08f5c', path3: '#d3b37d',
  rock: '#7d828c', rock2: '#686c76', rock3: '#9ca1aa', cliff: '#4f525c', wood: '#a0683e', wood2: '#8a5733', wood3: '#b77b4b',
  wall: '#d9cfbd', wall2: '#b8ad99', stone: '#9b958b', stone2: '#87817a', rug: '#a9483b', rug2: '#c96a4b',
  deep: '#1d5577', deep2: '#174a69', shal: '#2f86a0', shal2: '#3b98b0', foam: '#e3f4f3'
};

function speck(c, px, py, sx, sy, n, cols, sz = 1) {
  for (let i = 0; i < n; i++) {
    const a = hash(sx * 31 + i * 7, sy * 17 + i * 13), b = hash(sx * 11 + i * 5, sy * 29 + i * 3);
    R(c, px + Math.floor(a * (16 - sz)), py + Math.floor(b * (16 - sz)), sz, sz, cols[i % cols.length]);
  }
}

function buildGround(m) {
  const [cv, c] = mk(m.w * T, m.h * T);
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const t = tAt(m, x, y), px = x * T, py = y * T;
    switch (t) {
      case GRASS: R(c, px, py, T, T, COL.grass); speck(c, px, py, x, y, 7, [COL.grass2, COL.grass3, COL.grass2]); if (hash(x, y) > .7) { R(c, px + 4, py + 9, 3, 1, COL.grass3); R(c, px + 10, py + 3, 2, 1, COL.grass2); } break;
      case FOREST: R(c, px, py, T, T, COL.forest); speck(c, px, py, x, y, 9, [COL.forest2, COL.forest3, COL.forest2]); break;
      case SAND: R(c, px, py, T, T, COL.sand); speck(c, px, py, x, y, 6, [COL.sand2, COL.sand3]); break;
      case PATH: R(c, px, py, T, T, COL.path); speck(c, px, py, x, y, 7, [COL.path2, COL.path3], 1); if (hash(x + 3, y) > .75) R(c, px + 5, py + 6, 2, 2, COL.path2); break;
      case ROCK: {
        R(c, px, py, T, T, COL.rock); speck(c, px, py, x, y, 6, [COL.rock2, COL.rock3], 2);
        const below = tAt(m, x, y + 1);
        if (below !== ROCK) { R(c, px, py + 10, T, 6, COL.cliff); for (let i = 0; i < 4; i++) R(c, px + 2 + i * 4, py + 11 + (hash(x + i, y) * 3 | 0), 1, 4, '#3f424b'); R(c, px, py + 9, T, 1, COL.rock3); }
        break;
      }
      case PIER: case WOOD: {
        const base = t === PIER ? '#9a6a42' : COL.wood;
        R(c, px, py, T, T, base);
        for (let i = 0; i < 4; i++) { R(c, px, py + i * 4 + 3, T, 1, COL.wood2); if (hash(x * 3 + i, y) > .5) R(c, px + (hash(x, y + i) * 14 | 0), py + i * 4, 1, 3, COL.wood2); R(c, px + 1 + (hash(i, x + y) * 12 | 0), py + i * 4 + 1, 2, 1, COL.wood3); }
        if (t === PIER) { if (isWater(tAt(m, x - 1, y))) R(c, px, py, 1, T, '#5d3e24'); if (isWater(tAt(m, x + 1, y))) R(c, px + 15, py, 1, T, '#5d3e24'); }
        break;
      }
      case WALL: {
        R(c, px, py, T, T, '#3a2e2a');
        if ((m.id === 'house' || m.id === 'shed') && y <= 1) { R(c, px, py, T, T, y === 0 ? '#5b4a3f' : m.id === 'shed' ? '#8a6a48' : COL.wall); if (y === 1) { R(c, px, py + 13, T, 3, COL.wall2); for (let i = 0; i < 2; i++) R(c, px + i * 8, py + 4 + (x % 2) * 4, 1, 4, COL.wall2); } }
        else if (m.id === 'house' || m.id === 'shed') { R(c, px, py, T, T, '#4d3e34'); R(c, px + 2, py + 2, 12, 12, '#5b4a3f'); }
        break;
      }
      case STONE: R(c, px, py, T, T, COL.stone); R(c, px, py + 7, T, 1, COL.stone2); R(c, px + ((y % 2) ? 4 : 11), py, 1, 7, COL.stone2); R(c, px + ((y % 2) ? 11 : 4), py + 8, 1, 8, COL.stone2); speck(c, px, py, x, y, 3, ['#aaa49a']); break;
      case FLAT: { R(c, px, py, T, T, '#8a8f98'); speck(c, px, py, x, y, 7, ['#7d828c', '#9ca1aa', '#787d86'], 2); if (hash(x + 5, y + 2) > .6) R(c, px + (hash(x, y) * 10 | 0), py + (hash(y, x) * 10 | 0), 4, 1, '#6c717a'); if (hash(x * 7, y) > .8) R(c, px + 3, py + 4, 2, 2, '#6f9f5a'); break; }
      case RUG: R(c, px, py, T, T, COL.rug); R(c, px + 2, py + 2, 12, 12, COL.rug2); R(c, px + 4, py + 4, 8, 8, COL.rug); speck(c, px, py, x, y, 4, ['#e5c07b']); break;
      case GRATE: R(c, px, py, T, T, '#3d4250'); for (let i = 0; i < 16; i += 4) { R(c, px + i, py, 1, T, '#2b2f3a'); R(c, px, py + i, T, 1, '#2b2f3a'); } break;
      case RAIL: R(c, px, py, T, T, '#2a2e38'); R(c, px + 6, py + 6, 4, 4, '#555b6a'); break;
      case GLASS: R(c, px, py, T, T, 'rgba(160,210,230,.35)'); R(c, px, py, T, 2, '#4a3b30'); R(c, px + 7, py, 2, T, '#4a3b30'); R(c, px + 3, py + 4, 1, 6, 'rgba(255,255,255,.6)'); break;
    }
  }
  // soft edges: grass tongues over sand/path, wet sand along water
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const t = tAt(m, x, y), px = x * T, py = y * T;
    if (t === SAND || t === PATH) {
      const g = n => n === GRASS || n === FOREST;
      const col = n => n === FOREST ? COL.forest : COL.grass;
      const u = tAt(m, x, y - 1), d = tAt(m, x, y + 1), l = tAt(m, x - 1, y), r = tAt(m, x + 1, y);
      for (let i = 0; i < 16; i += 2) {
        if (g(u)) R(c, px + i, py, 2, 1 + (hash(x * 16 + i, y) * 4 | 0), col(u));
        if (g(d)) { const hh = 1 + (hash(x * 16 + i, y + 99) * 3 | 0); R(c, px + i, py + 16 - hh, 2, hh, col(d)); }
        if (g(l)) R(c, px, py + i, 1 + (hash(x, y * 16 + i) * 4 | 0), 2, col(l));
        if (g(r)) { const ww = 1 + (hash(x + 99, y * 16 + i) * 3 | 0); R(c, px + 16 - ww, py + i, ww, 2, col(r)); }
      }
      if (t === SAND) { if (isWater(d)) R(c, px, py + 13, T, 3, COL.wet); if (isWater(u)) R(c, px, py, T, 2, COL.wet); if (isWater(l)) R(c, px, py, 2, T, COL.wet); if (isWater(r)) R(c, px + 14, py, 2, T, COL.wet); }
    }
  }
  m.ground = cv;
  // water tile cache
  m.water = [];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const t = tAt(m, x, y); if (!isWater(t)) continue;
    const e = []; const land = n => !isWater(n) && n !== PIER;
    if (land(tAt(m, x, y - 1))) e.push(0); if (land(tAt(m, x, y + 1))) e.push(1); if (land(tAt(m, x - 1, y))) e.push(2); if (land(tAt(m, x + 1, y))) e.push(3);
    m.water[y * m.w + x] = e;
  }
}

// ---------- animated water (also used outside the map) ----------
function drawWater(c, m, cam, vw, vh, time, dark, sunset) {
  const x0 = Math.floor(cam.x / T) - 1, y0 = Math.floor(cam.y / T) - 1, x1 = x0 + Math.ceil(vw / T) + 2, y1 = y0 + Math.ceil(vh / T) + 2;
  const moonX = m.w * T * .62;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const inside = x >= 0 && y >= 0 && x < m.w && y < m.h;
    const t = inside ? m.t[y * m.w + x] : DEEP;
    if (!isWater(t) && t !== PIER) continue;
    const px = x * T - cam.x, py = y * T - cam.y, h = hash(x, y), h2 = hash(y + 7, x + 3);
    const sh = t === SHALLOW;
    R(c, px, py, T, T, sh ? COL.shal : COL.deep);
    if (!sh && h > .55) R(c, px + (h2 * 8 | 0), py + (h * 10 | 0), 6, 5, COL.deep2);
    const ph = time * 1.3 + h * 6.28;
    const s = Math.sin(ph);
    if (s > .45) { const o = Math.round(Math.sin(time * .9 + x) * 2); R(c, px + 3 + (h2 * 6 | 0) + o, py + 3 + (h * 9 | 0), 4 + (s > .8 ? 2 : 0), 1, sh ? '#6cc3d4' : '#4a8fb0'); }
    if (s < -.6 && h2 > .5) R(c, px + (h * 10 | 0), py + (h2 * 12 | 0), 3, 1, sh ? '#56b3c8' : '#2f6d92');
    if (sunset > 0 && !sh && Math.sin(time * 2 + h * 30) > .2) { c.globalAlpha = sunset * .6; R(c, px + (h * 12 | 0), py + (h2 * 14 | 0), 3, 1, '#ffb36b'); c.globalAlpha = 1; }
    if (dark > .35) {
      if (h > .9) { c.globalAlpha = dark * (.5 + .5 * Math.sin(time * 3 + h * 90)); R(c, px + (h2 * 14 | 0), py + (h * 14 | 0), 1, 1, '#fff6d8'); c.globalAlpha = 1; }
      if (Math.abs(x * T + 8 - moonX) < 44 && y * T > m.h * T * .55 && Math.sin(time * 2.2 + h * 40) > .3) { c.globalAlpha = dark * .8; R(c, px + (h * 10 | 0), py + (h2 * 13 | 0), 4 + (h2 * 4 | 0), 1, '#cfe1ff'); c.globalAlpha = 1; }
    }
    if (inside && m.water && sh) {
      const e = m.water[y * m.w + x] || [];
      if (e.length) {
        R(c, px, py, T, T, 'rgba(120,205,215,.25)');
        const o = Math.round((Math.sin(time * 1.6 + x * .7 + y * .5) + 1) * 1.6);
        c.globalAlpha = .55 + .35 * Math.sin(time * 1.6 + x * .7 + y * .5);
        for (const d of e) {
          for (let i = 0; i < 16; i += 3) {
            const j = (hash(x * 16 + i, y + d) * 2) | 0;
            if (d === 0) R(c, px + i, py + o + j, 2, 1, COL.foam);
            if (d === 1) R(c, px + i, py + 15 - o - j, 2, 1, COL.foam);
            if (d === 2) R(c, px + o + j, py + i, 1, 2, COL.foam);
            if (d === 3) R(c, px + 15 - o - j, py + i, 1, 2, COL.foam);
          }
        }
        c.globalAlpha = 1;
      }
    }
  }
}

// ---------- characters ----------
const LOOKS = {
  hero: { skin: '#f0c8a0', hair: '#5a3824', coat: '#2f5d8a', coat2: '#254a70', pants: '#3b3a48', hat: 'beanie', hatC: '#c8553d', scarf: '#e8c55a' },
  matvey: { skin: '#e8b98f', hair: '#e8e8e8', coat: '#e7b521', coat2: '#c49412', pants: '#45505c', hat: 'souwester', hatC: '#e7b521', beard: '#f2f2f2' },
  lida: { skin: '#f3cfae', hair: '#b4502e', coat: '#3c6db0', coat2: '#2f5890', pants: '#2d3442', hat: 'cap', hatC: '#24467a', bag: '#8a5a32', long: true },
  sonya: { skin: '#f6d2b5', hair: '#3a2418', coat: '#e9d9b8', coat2: '#d1c09e', pants: '#6c88b8', hat: 'beret', hatC: '#c8303b', small: true, long: true },
  gromov: { skin: '#e5bc96', hair: '#4a4a4a', coat: '#6a6f78', coat2: '#575c64', pants: '#33353b', hat: 'peaked', hatC: '#2f3238', mustache: '#3d3d3d' },
  belov: { skin: '#dcae86', hair: '#2a2a2a', coat: '#1f2d4d', coat2: '#17223b', pants: '#1f2533', hat: 'captain', hatC: '#f0f0ec', beard: '#3a3030' },
  wife: { skin: '#f1cba7', hair: '#6b3b25', coat: '#9b4d6a', coat2: '#823f58', pants: '#3a3448', long: true },
  kid: { skin: '#f6d2b5', hair: '#7a4a2a', coat: '#e2a33c', coat2: '#c88a2c', pants: '#4c6aa0', small: true, long: true },
};

function drawPerson(c, x, y, L, o = {}) {
  x = Math.round(x); y = Math.round(y);
  const dir = o.dir ?? 0, f = o.frame ?? 0, mv = !!o.moving, sm = L.small;
  const H = sm ? -3 : 0;
  if (!o.noShadow) { c.fillStyle = 'rgba(20,28,40,.28)'; c.beginPath(); c.ellipse(x + (o.sdx || 0), y, 6, 2.2, 0, 0, 7); c.fill(); }
  const step = mv ? [0, 1, 0, -1][f % 4] : 0;
  const bob = mv && (f % 2) ? -1 : 0;
  const yb = y + bob;
  // legs
  if (o.sit) {
    R(c, x - 3, yb - 5, 6, 2, L.pants); R(c, x - 3, yb - 3, 2, 3, L.pants); R(c, x + 1, yb - 3, 2, 3, L.pants);
    R(c, x - 3, y - 1, 2, 1, '#2a2420'); R(c, x + 1, y - 1, 2, 1, '#2a2420');
  } else if (dir === 0 || dir === 3) {
    R(c, x - 3, yb - 5 + (step > 0 ? -1 : 0), 2, 5 + (step > 0 ? 1 : 0) - (step > 0 ? 1 : 0), L.pants);
    R(c, x + 1, yb - 5 + (step < 0 ? -1 : 0), 2, 5, L.pants);
    R(c, x - 3, y - 1 + (step > 0 ? -1 : 0), 2, 1, '#2a2420'); R(c, x + 1, y - 1 + (step < 0 ? -1 : 0), 2, 1, '#2a2420');
  } else {
    const s = dir === 1 ? -1 : 1;
    R(c, x - 1 + step * s, yb - 5, 2, 5, L.pants); R(c, x - 1 - step * s, yb - 5, 2, 5, L.pants);
    R(c, x - 1 + step * s + (s > 0 ? 1 : -1), y - 1, 2, 1, '#2a2420');
  }
  // torso
  const ty = yb - 12 - H * 0;
  const tw = sm ? 8 : 8, th = sm ? 6 : 7;
  const tyy = yb - 5 - th + (o.sit ? 2 : 0);
  R(c, x - tw / 2, tyy, tw, th + (L.long ? 2 : 0), L.coat);
  R(c, x - tw / 2, tyy + th - 1 + (L.long ? 2 : 0), tw, 1, L.coat2);
  if (dir === 0) R(c, x - .5, tyy + 1, 1, th - 1, L.coat2);
  if (L.scarf) R(c, x - 4, tyy, 8, 2, L.scarf);
  if (L.bag && dir !== 3) R(c, dir === 1 ? x + 2 : x - 5, tyy + 3, 3, 4, L.bag);
  // arms
  const sw = mv ? step : 0;
  const act = o.act;
  if (dir === 0 || dir === 3) {
    R(c, x - tw / 2 - 1, tyy + 1 + (act ? -1 : sw), 1, 5, L.coat2); R(c, x + tw / 2, tyy + 1 + (act ? -1 : -sw), 1, 5, L.coat2);
    R(c, x - tw / 2 - 1, tyy + 6 + (act ? -1 : sw), 1, 1, L.skin); R(c, x + tw / 2, tyy + 6 + (act ? -1 : -sw), 1, 1, L.skin);
  } else {
    const s = dir === 1 ? -1 : 1;
    R(c, x - 1 + (act ? s * 3 : sw * s), tyy + 1 + (act ? 1 : 0), 2, 5, L.coat2);
    R(c, x - 1 + (act ? s * 4 : sw * s), tyy + 6 + (act ? 0 : 0), 2, 1, L.skin);
  }
  // head
  const hy = tyy - 7, hw = 8;
  R(c, x - hw / 2, hy, hw, 7, L.skin);
  // hair
  if (dir === 3) R(c, x - hw / 2, hy, hw, 6, L.hair);
  else if (dir === 0) { R(c, x - hw / 2, hy, hw, 2, L.hair); R(c, x - hw / 2, hy, 1, 4, L.hair); R(c, x + hw / 2 - 1, hy, 1, 4, L.hair); }
  else { const s = dir === 1 ? 1 : -1; R(c, x - hw / 2, hy, hw, 2, L.hair); R(c, s > 0 ? x + 1 : x - hw / 2, hy, 3, 5, L.hair); }
  if (L.long && dir === 3) R(c, x - hw / 2, hy + 3, hw, 5, L.hair);
  if (L.long && (dir === 1 || dir === 2)) { const back = dir === 1 ? x + 1 : x - hw / 2; R(c, back, hy + 2, 3, 7, L.hair); R(c, dir === 1 ? x + 3 : x - hw / 2, hy + 8, 1, 1, L.hair); }
  if (L.long && dir === 0) { R(c, x - hw / 2 - 1, hy + 2, 1, 6, L.hair); R(c, x + hw / 2, hy + 2, 1, 6, L.hair); }
  // face
  const blink = (o.t || 0) % 4 > 3.85;
  if (dir === 0) { if (!blink) { R(c, x - 2, hy + 3, 1, 2, '#2a2022'); R(c, x + 1, hy + 3, 1, 2, '#2a2022'); } else { R(c, x - 2, hy + 4, 1, 1, '#2a2022'); R(c, x + 1, hy + 4, 1, 1, '#2a2022'); } R(c, x - 3, hy + 5, 1, 1, 'rgba(230,120,110,.6)'); R(c, x + 2, hy + 5, 1, 1, 'rgba(230,120,110,.6)'); }
  else if (dir !== 3) { const ex = dir === 1 ? x - 3 : x + 2; if (!blink) R(c, ex, hy + 3, 1, 2, '#2a2022'); }
  if (L.beard && dir !== 3) { R(c, x - 3, hy + 5, 6, 3, L.beard); if (dir === 0) R(c, x - 2, hy + 8, 4, 1, L.beard); }
  if (L.mustache && dir === 0) R(c, x - 2, hy + 5, 4, 1, L.mustache);
  // hats
  switch (L.hat) {
    case 'beanie': R(c, x - 4, hy - 2, 8, 3, L.hatC); R(c, x - 4, hy, 8, 1, '#a8432f'); R(c, x - 1, hy - 3, 2, 1, '#f2e6cc'); break;
    case 'souwester': R(c, x - 5, hy - 1, 10, 2, L.hatC); R(c, x - 3, hy - 3, 6, 2, L.hatC); R(c, x - 5, hy + 1, 10, 1, '#c49412'); break;
    case 'cap': R(c, x - 4, hy - 2, 8, 3, L.hatC); if (dir === 0) R(c, x - 4, hy + 1, 8, 1, '#1a3358'); else if (dir !== 3) R(c, dir === 1 ? x - 6 : x + 2, hy, 4, 1, '#1a3358'); break;
    case 'beret': R(c, x - 5, hy - 2, 9, 3, L.hatC); R(c, x, hy - 3, 1, 1, L.hatC); break;
    case 'peaked': R(c, x - 4, hy - 2, 8, 3, L.hatC); R(c, x - 5, hy + 1, 10, 1, '#1d1f24'); R(c, x - 1, hy - 1, 2, 1, '#d4b14a'); break;
    case 'captain': R(c, x - 4, hy - 3, 8, 3, L.hatC); R(c, x - 4, hy, 8, 1, '#1d1f24'); R(c, x - 5, hy + 1, 10, 1, '#111'); R(c, x - 1, hy - 2, 2, 1, '#d4b14a'); break;
  }
}

// ---------- props ----------
function shadowE(c, x, y, rx, ry, sh) { c.fillStyle = `rgba(18,26,40,${.28 * sh.a})`; c.beginPath(); c.ellipse(x + sh.dx * rx * .6, y + sh.dy * 2, rx * (1 + Math.abs(sh.dx) * .5), ry, 0, 0, 7); c.fill(); }

function drawPine(c, x, y, s, time, wind, sh, seed) {
  const sway = Math.sin(time * 1.2 + seed * 6) * wind;
  shadowE(c, x, y, 9 * s, 3.5 * s, sh);
  R(c, x - 2, y - 7 * s, 4, 7 * s, '#6b4a2e'); R(c, x - 2, y - 7 * s, 1, 7 * s, '#7d5838');
  const layers = [[11, 9, 0, '#2c6346'], [9, 8, 7, '#357253'], [7, 7, 13, '#40835e'], [4, 6, 18, '#4b9468']];
  layers.forEach(([w, hh, off, col], i) => {
    const sx = sway * (i + 1) * .35;
    const by = y - 6 * s - off * s;
    for (let r = 0; r < hh * s; r++) { const ww = Math.round(w * s * (r / (hh * s))); R(c, x - ww + sx, by - hh * s + r, ww * 2, 1, col); }
    R(c, x - Math.round(w * s * .6) + sx, by - 2, Math.round(w * s * .6), 1, '#5aab78');
  });
}
function drawRoundTree(c, x, y, s, time, wind, sh, seed) {
  const sway = Math.sin(time * 1.1 + seed * 5) * wind;
  shadowE(c, x, y, 10 * s, 4 * s, sh);
  R(c, x - 2, y - 9 * s, 4, 9 * s, '#6e4c30');
  disc(c, x + sway * .6, y - 16 * s, 9 * s, '#3f7d48');
  disc(c, x - 3 * s + sway, y - 19 * s, 6 * s, '#4f9556');
  disc(c, x + 4 * s + sway, y - 18 * s, 5 * s, '#4a8d52');
  disc(c, x - 1 * s + sway, y - 22 * s, 3 * s, '#66ad66');
}
function drawBush(c, x, y, sh, berries) {
  shadowE(c, x, y, 7, 2.5, sh);
  disc(c, x, y - 5, 6, '#3f7d48'); disc(c, x - 2, y - 7, 4, '#4f9556'); disc(c, x + 3, y - 6, 3, '#5aa060');
  if (berries) { [[-3, -6], [2, -8], [4, -4], [-1, -3], [0, -9]].forEach(([dx, dy]) => { R(c, x + dx, y + dy, 2, 2, '#c8303b'); R(c, x + dx, y + dy, 1, 1, '#f07a7a'); }); }
}
function drawRock(c, x, y, sh, big) {
  const s = big ? 1.6 : 1; shadowE(c, x, y, 7 * s, 2.5 * s, sh);
  disc(c, x, y - 4 * s, 5 * s, '#7d828c'); disc(c, x - 1, y - 5 * s, 3 * s, '#9ca1aa'); R(c, x - 2, y - 7 * s, 2, 1, '#c3c7cd');
}
function drawTuft(c, x, y, time, wind, seed, col) {
  for (let i = 0; i < 3; i++) {
    const hgt = 3 + ((seed * 7 + i * 3) % 3);
    const lean = Math.sin(time * 2 + seed * 10 + i) * wind * .8 + (i - 1) * .6;
    for (let k = 0; k < hgt; k++) R(c, x + (i - 1) * 2 + Math.round(lean * k / hgt), y - k, 1, 1, k === hgt - 1 ? '#9bd27f' : col);
  }
}
function drawFlower(c, x, y, time, wind, seed) {
  const lean = Math.round(Math.sin(time * 2 + seed * 9) * wind * .6);
  R(c, x, y - 3, 1, 3, '#4f8a43');
  const cols = ['#f2e36b', '#f2f2f2', '#e88ab0', '#9bb8f0'];
  R(c, x - 1 + lean, y - 5, 3, 1, cols[seed % 4]); R(c, x + lean, y - 6, 1, 3, cols[seed % 4]); R(c, x + lean, y - 5, 1, 1, '#d98a2b');
}

function drawLighthouse(c, x, y, time, dark, lit, sh) {
  // tower shadow (dynamic)
  c.fillStyle = `rgba(18,26,40,${.22 * sh.a})`;
  c.beginPath(); c.moveTo(x - 12, y - 18); c.lineTo(x + 12, y - 18); c.lineTo(x + 8 + sh.dx * 70, y - 12 + sh.dy * 20); c.lineTo(x - 8 + sh.dx * 70, y - 12 + sh.dy * 20); c.fill();
  // tower
  const top = y - 118, base = y - 22;
  for (let yy = top; yy < base; yy++) {
    const k = (yy - top) / (base - top), half = Math.round(9 + k * 6);
    const band = Math.floor((yy - top) / 16) % 2;
    const colA = band ? '#c8443a' : '#f1ece2', colB = band ? '#9e3229' : '#cfc8bb';
    R(c, x - half, yy, half * 2, 1, colA); R(c, x + half - Math.round(half * .45), yy, Math.round(half * .45), 1, colB);
    R(c, x - half, yy, 1, 1, colB);
  }
  // tower windows
  [[top + 22], [top + 54]].forEach(([wy]) => { R(c, x - 2, wy, 4, 6, dark > .3 ? '#ffd477' : '#2e3a4c'); R(c, x - 2, wy, 4, 1, '#3a2e2a'); });
  // gallery + lantern room
  R(c, x - 14, top - 2, 28, 3, '#2c2f38'); R(c, x - 14, top - 5, 28, 1, '#2c2f38'); for (let i = -13; i <= 13; i += 3) R(c, x + i, top - 5, 1, 3, '#2c2f38');
  const glow = lit ? (.75 + .25 * Math.sin(time * 9) * Math.sin(time * 3.3)) : 0;
  R(c, x - 8, top - 17, 16, 12, lit ? `rgba(255,${200 + 40 * glow | 0},120,1)` : '#8fb6c8');
  R(c, x - 8, top - 17, 16, 1, '#2c2f38'); R(c, x - 3, top - 17, 1, 12, '#2c2f38'); R(c, x + 2, top - 17, 1, 12, '#2c2f38');
  if (lit) R(c, x - 2, top - 14, 4, 6, '#fff9e0');
  // dome
  for (let i = 0; i < 6; i++) R(c, x - 9 + i, top - 18 - i, 18 - i * 2, 1, i < 2 ? '#a5352d' : '#c8443a');
  R(c, x - 1, top - 26, 2, 3, '#2c2f38');
  // annex (keeper's house)
  const ay = y - 26;
  R(c, x - 30, ay + 6, 60, 20, '#d6cdbb'); for (let i = 0; i < 6; i++) R(c, x - 30, ay + 9 + i * 3, 60, 1, '#c4bba8');
  for (let i = 0; i < 8; i++) R(c, x - 33 + i, ay + 6 - i, 66 - i * 2, 1, i % 2 ? '#5b4a3f' : '#6c584a');
  R(c, x - 26, ay - 2, 52, 1, '#7a6455');
  // door
  R(c, x - 5, y - 13, 10, 13, '#6b4429'); R(c, x - 5, y - 13, 10, 1, '#4a2f1d'); R(c, x + 2, y - 7, 1, 1, '#e5c07b'); R(c, x - 7, y - 1, 14, 1, '#9b958b');
  // windows
  [[x - 22], [x + 12]].forEach(([wx]) => { R(c, wx, ay + 10, 10, 8, dark > .3 ? '#ffd477' : '#2e3a4c'); R(c, wx + 4, ay + 10, 1, 8, '#4a3b30'); R(c, wx, ay + 13, 10, 1, '#4a3b30'); R(c, wx - 1, ay + 18, 12, 1, '#a59c8c'); });
  // chimney with smoke
  R(c, x + 18, ay - 4, 5, 6, '#7a6455');
}
function drawShed(c, x, y, sh, open) {
  shadowE(c, x, y, 26, 5, sh);
  R(c, x - 22, y - 24, 44, 24, '#8a5e3b'); for (let i = 0; i < 44; i += 4) R(c, x - 22 + i, y - 24, 1, 24, '#6f4a2d');
  for (let i = 0; i < 7; i++) R(c, x - 25 + i, y - 25 - i, 50 - i * 2, 1, i % 2 ? '#5a5f68' : '#6b717a');
  R(c, x - 6, y - 16, 12, 16, open ? '#2a1d14' : '#6b4429'); R(c, x - 6, y - 16, 12, 1, '#4a2f1d');
  R(c, x - 18, y - 18, 7, 6, '#2e3a4c'); R(c, x - 18, y - 15, 7, 1, '#6f4a2d');
  R(c, x + 10, y - 10, 9, 10, '#7b8088'); R(c, x + 11, y - 9, 7, 4, '#5a5f68'); // generator box outside
}
function drawBoat(c, x, y, sh, broken) {
  shadowE(c, x, y, 18, 4, sh);
  R(c, x - 18, y - 9, 36, 6, '#7a4d2c'); R(c, x - 16, y - 3, 32, 3, '#5d3a20'); R(c, x - 20, y - 8, 2, 4, '#7a4d2c'); R(c, x + 18, y - 8, 2, 4, '#7a4d2c');
  R(c, x - 15, y - 9, 30, 1, '#a36c40'); R(c, x - 10, y - 7, 1, 4, '#5d3a20'); R(c, x + 6, y - 7, 1, 4, '#5d3a20');
  if (broken) { R(c, x + 2, y - 9, 5, 3, '#3a2a1a'); R(c, x - 22, y - 2, 4, 1, '#a36c40'); }
}
function drawVisitBoat(c, x, y, big, time) {
  const b = Math.round(Math.sin(time * 1.5) * 1);
  y += b;
  c.fillStyle = 'rgba(10,30,50,.3)'; c.beginPath(); c.ellipse(x, y + 4, big ? 30 : 16, 5, 0, 0, 7); c.fill();
  if (big) {
    R(c, x - 28, y - 10, 56, 12, '#e9e4d8'); R(c, x - 28, y - 2, 56, 4, '#2d4f7a'); R(c, x - 30, y - 10, 2, 8, '#e9e4d8');
    R(c, x - 10, y - 24, 22, 14, '#f4f0e6'); R(c, x - 8, y - 21, 18, 4, '#2e3a4c'); R(c, x + 2, y - 36, 3, 12, '#c8443a'); R(c, x - 6, y - 26, 26, 2, '#c8443a');
  } else {
    R(c, x - 14, y - 7, 28, 8, '#d8b24a'); R(c, x - 14, y - 1, 28, 2, '#a5852e'); R(c, x - 2, y - 22, 1, 16, '#5d3a20'); R(c, x - 1, y - 21, 9, 11, '#f2ebdc');
  }
}
function drawCrate(c, x, y, sh, wet) {
  shadowE(c, x, y, 7, 2.5, sh);
  R(c, x - 6, y - 11, 12, 11, wet ? '#7f5a38' : '#a5774a'); R(c, x - 6, y - 11, 12, 1, '#c99a66'); R(c, x - 6, y - 6, 12, 1, '#6f4a2d'); R(c, x - 6, y - 11, 1, 11, '#6f4a2d'); R(c, x + 5, y - 11, 1, 11, '#6f4a2d');
  if (wet) { R(c, x - 4, y - 3, 3, 1, '#4f8a43'); R(c, x + 2, y - 10, 2, 1, '#4f8a43'); }
}
function drawGull(c, x, y, time, seed, fly) {
  if (fly) {
    const w = Math.sin(time * 10 + seed) > 0 ? -2 : 1;
    R(c, x - 4, y + w, 3, 1, '#f2f2f2'); R(c, x + 2, y + w, 3, 1, '#f2f2f2'); R(c, x - 1, y, 3, 2, '#fafafa'); R(c, x - 5, y + w, 1, 1, '#555'); R(c, x + 5, y + w, 1, 1, '#555');
    return;
  }
  const hop = Math.sin(time * 2 + seed * 7) > .97 ? -1 : 0;
  const face = Math.sin(time * .4 + seed * 3) > 0 ? 1 : -1;
  R(c, x - 3, y - 4 + hop, 6, 3, '#f4f4f4'); R(c, x - 3 * face - (face > 0 ? 0 : 1), y - 4 + hop, 2, 2, '#9aa3ad');
  R(c, x + 2 * face - (face > 0 ? 0 : 1), y - 6 + hop, 2, 2, '#fafafa'); R(c, x + 3 * face + (face > 0 ? 1 : -2), y - 5 + hop, 1, 1, '#f0b23a');
  R(c, x - 1, y - 1 + hop, 1, 1, '#f0b23a'); R(c, x + 1, y - 1 + hop, 1, 1, '#f0b23a');
}
function drawTern(c, x, y, time, seed) {
  const hop = Math.sin(time * 3 + seed * 7) > .95 ? -1 : 0;
  R(c, x - 3, y - 4 + hop, 6, 3, '#f8fbff'); R(c, x + 1, y - 6 + hop, 3, 2, '#1e2128'); R(c, x + 4, y - 5 + hop, 2, 1, '#d9372f'); R(c, x - 5, y - 4 + hop, 2, 1, '#cfd8e0');
}
function drawWhale(c, x, y, time, k) {
  const rise = Math.max(0, Math.sin(time * .5 + k * 2.1));
  if (rise < .05) return;
  c.globalAlpha = rise;
  ell(c, x, y, 20, 6, '#22344a'); ell(c, x - 3, y - 2, 14, 3, '#3a5372'); R(c, x - 12, y - 5, 16, 1, '#6f8fb3');
  R(c, x + 12, y - 6, 4, 4, '#1d2a3a');
  if (Math.sin(time * 1.3 + k) > .6) { for (let i = 0; i < 8; i++) R(c, x - 6 + Math.sin(i) * 3, y - 10 - i * 2, 2, 2, 'rgba(220,235,255,.7)'); }
  c.globalAlpha = 1;
}

// ---------- item icons ----------
const ICON = {};
function icon(id) {
  if (ICON[id]) return ICON[id];
  const [cv, c] = mk(16, 16);
  const p = (x, y, w, h, col) => R(c, x, y, w, h, col);
  if (typeof iconFish === 'function' && iconFish(id, c)) { ICON[id] = cv; return cv; }
  switch (id) {
    case 'rod': for (let i = 0; i < 12; i++) p(2 + i, 13 - i, 1, 1, '#8a5a32'); p(13, 2, 1, 9, '#d8e4ee'); p(12, 11, 3, 2, '#c8303b'); p(3, 11, 3, 3, '#4a4a4a'); break;
    case 'rag': p(3, 4, 10, 9, '#e8d8a8'); p(3, 4, 10, 1, '#f6ecc8'); p(5, 7, 6, 1, '#cbb886'); p(5, 10, 6, 1, '#cbb886'); break;
    case 'lantern': p(6, 2, 4, 2, '#2c2f38'); p(4, 4, 8, 9, '#2c2f38'); p(5, 5, 6, 7, '#ffd477'); p(7, 6, 2, 4, '#fff6d0'); p(4, 13, 8, 1, '#2c2f38'); break;
    case 'keys': p(3, 3, 6, 6, '#d9b04a'); p(5, 5, 2, 2, '#1c2638'); p(8, 7, 6, 2, '#d9b04a'); p(11, 9, 2, 2, '#d9b04a'); p(7, 9, 2, 5, '#b8b8b8'); p(9, 12, 2, 1, '#b8b8b8'); break;
    case 'oilcan': p(4, 6, 8, 8, '#c8443a'); p(4, 6, 8, 1, '#e86a5a'); p(11, 4, 1, 3, '#2c2f38'); p(12, 2, 2, 2, '#2c2f38'); p(6, 3, 3, 3, '#2c2f38'); p(6, 9, 4, 2, '#f2e6cc'); break;
    case 'wrench': for (let i = 0; i < 9; i++) p(4 + i, 12 - i, 2, 2, '#9ca1aa'); p(10, 2, 4, 4, '#9ca1aa'); p(12, 3, 2, 2, '#1c2638'); p(2, 12, 3, 3, '#9ca1aa'); break;
    case 'wood': p(2, 9, 12, 4, '#8a5a32'); p(2, 9, 12, 1, '#a87444'); p(3, 5, 11, 4, '#7a4d2c'); p(13, 5, 2, 4, '#d9b88a'); p(14, 9, 1, 4, '#d9b88a'); break;
    case 'fish': p(3, 6, 9, 5, '#8fb3c8'); p(3, 6, 9, 2, '#a9cbe0'); p(12, 5, 2, 7, '#7aa0b8'); p(14, 4, 1, 9, '#7aa0b8'); p(5, 7, 1, 1, '#1c2638'); break;
    case 'berries': [[4, 6], [8, 5], [6, 9], [10, 9], [8, 12]].forEach(([x, y]) => { p(x, y, 3, 3, '#c8303b'); p(x, y, 1, 1, '#f07a7a'); }); p(7, 2, 1, 4, '#4f8a43'); p(8, 2, 3, 1, '#4f8a43'); break;
    case 'tea': p(4, 3, 8, 11, '#6a8f3e'); p(5, 4, 6, 9, '#89b155'); p(7, 3, 2, 11, '#4f6f2c'); break;
    case 'shell': for (let i = 0; i < 6; i++) p(8 - i, 4 + i, i * 2 + 1, 1, i % 2 ? '#f0c9b0' : '#f7dccb'); p(4, 10, 9, 3, '#e8b49a'); p(7, 13, 3, 1, '#e8b49a'); break;
    case 'uha': p(3, 7, 10, 6, '#f2ece0'); p(3, 7, 10, 2, '#e8b04a'); p(2, 6, 12, 1, '#c9c2b0'); p(5, 3, 1, 3, 'rgba(255,255,255,.6)'); p(9, 2, 1, 3, 'rgba(255,255,255,.6)'); break;
    case 'map': p(2, 3, 12, 10, '#e7d3a1'); p(2, 3, 12, 1, '#c9b07a'); p(4, 6, 5, 4, '#7fae6a'); p(10, 5, 1, 1, '#c8303b'); p(9, 4, 3, 3, 'transparent'); p(9, 5, 1, 1, '#c8303b'); p(11, 5, 1, 1, '#c8303b'); p(10, 4, 1, 1, '#c8303b'); p(10, 6, 1, 1, '#c8303b'); break;
    case 'feather': for (let i = 0; i < 10; i++) { p(4 + i, 13 - i, 1, 1, '#9aa3ad'); p(5 + i, 11 - i, 2, 2, '#f8fbff'); } break;
    case 'letter': p(2, 4, 12, 9, '#f2e6cc'); for (let i = 0; i < 6; i++) { p(2 + i, 4 + i * .8, 1, 1, '#c9b48a'); p(13 - i, 4 + i * .8, 1, 1, '#c9b48a'); } p(7, 8, 2, 2, '#c8303b'); break;
    case 'bottle': p(3, 7, 9, 5, '#5fae8f'); p(3, 7, 9, 1, '#8fd0b9'); p(12, 8, 2, 3, '#5fae8f'); p(14, 8, 1, 3, '#8a5a32'); p(5, 9, 5, 1, '#f2e6cc'); break;
    case 'photo': p(2, 3, 12, 10, '#f4efe4'); p(3, 4, 10, 7, '#8a7a66'); p(5, 6, 2, 4, '#4a3e32'); p(8, 7, 2, 3, '#4a3e32'); p(11, 3, 1, 1, '#2c2f38'); break;
    case 'pearl': for (let i = 0; i < 6; i++) p(8 - i, 4 + i, i * 2 + 1, 1, i % 2 ? '#d8d0f0' : '#f2eefc'); p(4, 10, 9, 3, '#c9bfe8'); p(7, 6, 2, 2, '#ffffff'); break;
    case 'painting': p(2, 2, 12, 12, '#8a5a32'); p(3, 3, 10, 10, '#1d3a5c'); p(3, 10, 10, 3, '#2f6d92'); p(7, 5, 2, 6, '#f1ece2'); p(7, 7, 2, 1, '#c8443a'); p(7, 4, 2, 1, '#ffd477'); p(9, 4, 4, 1, 'rgba(255,212,119,.7)'); break;
    case 'compass': disc(c, 8, 8, 6, '#d9b04a'); disc(c, 8, 8, 4, '#f2ece0'); p(8, 4, 1, 4, '#c8303b'); p(8, 8, 1, 4, '#2c2f38'); break;
    case 'figurine': p(7, 2, 2, 2, '#c8443a'); p(6, 4, 4, 2, '#ffd477'); p(6, 6, 4, 7, '#d8bf96'); p(5, 13, 6, 2, '#a58660'); p(6, 8, 4, 1, '#a58660'); p(6, 11, 4, 1, '#a58660'); break;
    case 'chick': p(4, 7, 8, 6, '#d8d8d0'); p(9, 5, 4, 4, '#e8e8e0'); p(13, 6, 2, 1, '#f0b23a'); p(11, 6, 1, 1, '#2c2f38'); p(4, 9, 3, 2, '#bcbcb4'); break;
    case 'crate': p(2, 3, 12, 11, '#a5774a'); p(2, 3, 12, 1, '#c99a66'); p(2, 8, 12, 1, '#6f4a2d'); break;
  }
  if (typeof iconExtra === 'function') iconExtra(id, p, c);
  ICON[id] = cv; return cv;
}
