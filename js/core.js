"use strict";
// ===================== CORE: utils, tiles, maps =====================
const T = 16;
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
function hash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
function ell(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
function disc(c, cx, cy, r, col) { c.fillStyle = col; for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy + r * .8)); c.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1); } }

// tile ids
const DEEP = 0, SHALLOW = 1, SAND = 2, GRASS = 3, FOREST = 4, PATH = 5, ROCK = 6, WOOD = 7, WALL = 8, STONE = 9, RUG = 10, VOID = 11, RAIL = 12, GLASS = 13, GRATE = 14, PIER = 15, FLAT = 16;
const SOLID = new Set([DEEP, SHALLOW, ROCK, WALL, VOID, RAIL, GLASS]);
const isWater = t => t === DEEP || t === SHALLOW;

function newMap(id, w, h, opt = {}) {
  return Object.assign({ id, w, h, t: new Uint8Array(w * h), objs: [], decor: [], ground: null }, opt);
}
const tAt = (m, x, y) => (x < 0 || y < 0 || x >= m.w || y >= m.h) ? (m.edge ?? DEEP) : m.t[y * m.w + x];
const tSet = (m, x, y, v) => { if (x >= 0 && y >= 0 && x < m.w && y < m.h) m.t[y * m.w + x] = v; };

// ---------- island ----------
function genIsland() {
  const w = 104, h = 52, m = newMap('island', w, h, { edge: DEEP, outdoor: true });
  const cx = 32, cy = 24;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = (x - cx) / 25.5, ny = (y - cy) / (y > cy ? 17 : 18);
    const n = Math.sin(x * .33 + 1.3) * .045 + Math.cos(y * .41 + x * .12) * .05 + (hash(x >> 2, y >> 2) - .5) * .07;
    const d1 = Math.sqrt(nx * nx + ny * ny) + n;
    // the far forest: a second, wooded half of the island to the east
    const ex = (x - 80) / 21, ey = (y - 28) / (y > 28 ? 16 : 17);
    const n2 = Math.sin(x * .29 + 2) * .05 + Math.cos(y * .37 + x * .08) * .05 + (hash((x >> 2) + 30, (y >> 2) + 40) - .5) * .08;
    const d2 = Math.sqrt(ex * ex + ey * ey) + n2;
    const br = x >= 46 && x <= 66 && y >= 29 && y <= 37 ? .5 + Math.abs(y - 33) * .12 : 9; // isthmus
    const d = Math.min(d1, d2, br), main = d === d1;
    let t = d < (y > 31 && main ? .66 : .78) ? GRASS : d < .94 ? SAND : d < 1.07 ? SHALLOW : DEEP;
    if (main && y < 17 && d1 > .72 && d1 < .97) t = ROCK;
    if (main && x > 50 && y > 20 && y < 30 && d1 > .8 && d1 < .96) t = ROCK; // gull rocks east
    if (main && x < 13 && y > 30 && y < 37 && d1 > .82 && d1 < .97) t = ROCK; // west fishing rocks
    if (t === GRASS && main && x > 4 && x < 21 && y > 14 && y < 34) t = FOREST;
    if (t === GRASS && d === d2 && d2 < .8) t = FOREST;
    if (d2 > .74 && d2 < .95 && d === d2 && x > 92 && y < 30) t = ROCK; // eastern crags
    const gl = Math.hypot(x - 76, y - 29), pd = Math.hypot(x - 84, y - 22);
    if (gl < 4.3 && t === FOREST) t = GRASS; // glade
    if (pd < 3.8 && (t === FOREST || t === GRASS)) t = pd < 2.6 ? SHALLOW : GRASS; // forest pond
    m.t[y * w + x] = t;
  }
  const stamp = (x0, y0, x1, y1, v, only) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!only || only.includes(tAt(m, x, y))) tSet(m, x, y, v); } };
  // lighthouse yard and cliffs clearing
  stamp(28, 9, 39, 15, GRASS);
  stamp(29, 8, 38, 8, ROCK);
  // viewpoint (смотровая) NE
  stamp(44, 11, 49, 14, GRASS, [ROCK, SAND, SHALLOW, DEEP, GRASS]);
  stamp(45, 11, 48, 13, STONE);
  stamp(44, 10, 49, 10, ROCK);
  // cliff NW (утёс)
  stamp(18, 11, 23, 14, GRASS, [ROCK, SAND, GRASS, SHALLOW]);
  stamp(17, 10, 24, 10, ROCK);
  // west fishing stone
  stamp(9, 32, 10, 33, STONE);
  stamp(10, 29, 13, 33, SAND, [ROCK, SHALLOW, DEEP]); stamp(9, 32, 10, 33, STONE);
  // paths
  const path = (pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 3;
      for (let k = 0; k <= n; k++) {
        const x = Math.round(lerp(ax, bx, k / n)), y = Math.round(lerp(ay, by, k / n));
        for (const [dx, dy] of [[0, 0], [1, 0]]) { const tt = tAt(m, x + dx, y + dy); if (tt === GRASS || tt === FOREST) tSet(m, x + dx, y + dy, PATH); }
      }
    }
  };
  path([[33, 13], [33, 18], [31, 24], [31, 31], [30, 36]]);
  path([[31, 22], [38, 23], [45, 27]]);
  path([[33, 17], [40, 16], [45, 14]]);
  path([[31, 27], [24, 27], [16, 25]]);
  path([[24, 27], [21, 20], [20, 15]]);
  path([[45, 27], [50, 31], [56, 33], [63, 33], [69, 31], [76, 29]]);
  path([[76, 29], [79, 26], [81.5, 24.6]]);
  path([[76, 29], [80, 33], [86, 36], [88, 37]]);
  path([[69, 31], [67, 25], [70, 19]]);
  path([[16, 25], [12, 31], [10, 32]]);
  // pier x 30..31 from first non-land to y=46
  for (let y = 30; y <= 46; y++) for (let x = 30; x <= 31; x++) { if (isWater(tAt(m, x, y)) || (y > 37)) tSet(m, x, y, PIER); }
  // make sure path connects to pier
  for (let y = 30; y <= 46; y++) { if (tAt(m, 30, y) === SAND || tAt(m, 30, y) === GRASS) { tSet(m, 30, y, PATH); tSet(m, 31, y, PATH); } }
  return m;
}

// ---------- shed interior ----------
function genShed() {
  const w = 12, h = 10, m = newMap('shed', w, h, { edge: WALL, indoor: true });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) m.t[y * w + x] = (y <= 1 || x === 0 || x === w - 1 || y === h - 1) ? WALL : WOOD;
  tSet(m, 6, h - 1, WOOD); tSet(m, 5, h - 1, WOOD);
  return m;
}

// ---------- house (ground floor) ----------
function genHouse() {
  const w = 18, h = 12, m = newMap('house', w, h, { edge: WALL, indoor: true });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let t = WOOD;
    if (y <= 1 || x === 0 || x === w - 1 || y === h - 1) t = WALL;
    if (x >= 12 && x <= 15 && y >= 5 && y <= 8) t = RUG;
    if (x >= 7 && x <= 10 && y >= 2 && y <= 4) t = STONE;
    m.t[y * w + x] = t;
  }
  tSet(m, 9, h - 1, WOOD); tSet(m, 8, h - 1, WOOD); // door gap
  m.door = { x: 9 * T, y: (h - 1) * T };
  return m;
}

// ---------- lantern room ----------
function genLamp() {
  const w = 15, h = 14, m = newMap('lamp', w, h, { edge: VOID, indoor: true, high: true });
  const cx = 7.5, cy = 6.5;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x + .5 - cx, dy = y + .5 - cy, r = Math.sqrt(dx * dx + dy * dy);
    const a = Math.atan2(dy, dx);
    const gap = Math.abs(Math.sin(a * 2)) < .32;
    let t = VOID;
    if (r < 3.7) t = STONE;
    else if (r < 4.6) t = gap && Math.abs(Math.cos(a)) > .5 ? STONE : GLASS;
    else if (r < 5.9) t = GRATE;
    else if (r < 6.6) t = RAIL;
    m.t[y * w + x] = t;
  }
  return m;
}
