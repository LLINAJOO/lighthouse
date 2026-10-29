"use strict";
// ===================== BIRDS: outlined pixel sprites for every species =====================
// Grids face left (beak on the left). '.' is empty, 'o' is the outline, other letters come from each palette.
const BIRDS = {
  gull: {
    pal: { o: '#2b3036', w: '#f6f6f2', s: '#d9dbd6', g: '#9aa4ae', G: '#7b858f', k: '#22262b', y: '#f2c23a', r: '#d9473a', e: '#14181d', p: '#e8a0a0' },
    stand: [
      '...ooo.....',
      '..owwwo....',
      '..oewwso...',
      'oyywwwso...',
      '.ooowwwsoo.',
      '...owwwggGo',
      '...owwggGko',
      '....owsggko',
      '.....ooooo.',
      '......p.p..',
    ],
    fly: [
      ['k.......k', 'go.....og', '.gowwwog.', '..owewo..', '...oyo...'],
      ['.........', '..owwwo..', 'kggwewggk', 'o.ooyoo.o', '.........'],
    ],
  },
  kittiwake: {
    pal: { o: '#2b3036', w: '#ffffff', s: '#e3e6e8', g: '#b4bec8', k: '#1c1f24', y: '#f0d84a', e: '#14181d', p: '#2b2b2b' },
    stand: [
      '..ooo....',
      '.owwwo...',
      '.oewso...',
      'oyywwsoo.',
      '.oowwwggo',
      '..owwggko',
      '...owsgko',
      '....oooo.',
      '....p.p..',
    ],
  },
  tern: {
    pal: { o: '#22262b', k: '#16191d', w: '#ffffff', s: '#e1e6ea', g: '#c4ccd4', r: '#e0402e' },
    stand: [
      '..oooo......',
      '.okkkko.....',
      'orrkkkso....',
      '.oowwwwsoo..',
      '...owwwgggoo',
      '....owsggo.o',
      '.....oooo.ok',
      '......r.....',
    ],
  },
  puffin: {
    pal: { o: '#16191d', k: '#22252a', K: '#33373e', w: '#ffffff', s: '#dde2e6', r: '#e24a2a', y: '#f2b23a', e: '#000000', f: '#f07a2a' },
    stand: [
      '...oooo..',
      '..okkkko.',
      '.owewwko.',
      'oyrrwwko.',
      '.ooowwkKo',
      '...owwkKo',
      '...owskko',
      '....oooo.',
      '....f.f..',
    ],
  },
  guillemot: {
    pal: { o: '#16191d', k: '#3a2c26', K: '#4f3d33', w: '#ffffff', e: '#000000', b: '#1c1f24' },
    stand: [
      '..oooo.',
      '.okkkko',
      'obbekko',
      '.ookkko',
      '..owkKo',
      '..owwKo',
      '..owwko',
      '...ooo.',
      '...b.b.',
    ],
  },
  fulmar: {
    pal: { o: '#2b3036', w: '#d4d9de', s: '#b4bcc4', g: '#808b96', G: '#636e79', y: '#c9b48a', Y: '#a08c62', e: '#14181d', p: '#c9a890' },
    stand: [
      '...ooo....',
      '..owwwo...',
      '..oewwso..',
      'oyYwwwso..',
      '.ooowwgGoo',
      '...owwggGo',
      '....owsgGo',
      '.....oooo.',
      '.....p.p..',
    ],
  },
  cormorant: {
    pal: { o: '#101215', k: '#22262b', K: '#3a3f2e', B: '#4a4a30', y: '#e8c03a', g: '#8a9098', e: '#4ad08a' },
    stand: [
      '.ooo....',
      'ogkeo...',
      '.oyko...',
      '..okko..',
      '..okKko.',
      '..okKKko',
      '...okKko',
      '...okkko',
      '....k.k.',
    ],
    wings: [
      '.....ooo.....',
      '....ogkeo....',
      '.....oyko....',
      'oo....okko.oo',
      'oKKo.okKkooKo',
      '.oKBKkKKkKBKo',
      '..ooKkkkKKoo.',
      '....okkkko...',
      '.....k..k....',
    ],
  },
  eider: {
    pal: { o: '#16191d', w: '#ffffff', s: '#e6e2d8', k: '#1c1f24', c: '#9ad08a', g: '#c9c2b0', y: '#c9b48a', e: '#000000', q: '#3b98b0', Q: '#e3f4f3' },
    stand: [
      '..oooo.....',
      '.okkkko....',
      'oykewco....',
      'oyywwco....',
      '.oowwwwooo.',
      '..okwwwwwgo',
      '..okkkkkkko',
      'QQqqqqqqqqQ',
    ],
  },
  sandpiper: {
    pal: { o: '#2a241e', b: '#9a7a56', B: '#7a5c3c', d: '#5a4430', w: '#f6f0e4', e: '#000000', k: '#2a2a2a' },
    stand: [
      '...ooo...',
      '..obbbo..',
      '.oebbbo..',
      'kkobbbboo',
      '..owwbBBo',
      '...owdBBo',
      '....oooo.',
      '....k.k..',
    ],
    run: [
      '...ooo...',
      '..obbbo..',
      '.oebbbo..',
      'kkobbbboo',
      '..owwbBBo',
      '...owdBBo',
      '....oooo.',
      '...k...k.',
    ],
  },
  owl: {
    pal: { o: '#1c140e', b: '#8a6440', B: '#6a4a2c', l: '#c9a478', L: '#e0c49a', y: '#f2a02a', e: '#14100c', k: '#3a2a1a', f: '#5a3e24' },
    stand: [
      '.o.....o.',
      'oBo...oBo',
      'obbooobbo',
      'olllllllo',
      'olyelyelo',
      'obllkllbo',
      'oBbLlLbBo',
      '.oBLlLBo.',
      '..oBBBo..',
      'fffk.kfff',
    ],
    blink: [
      '.o.....o.',
      'oBo...oBo',
      'obbooobbo',
      'olllllllo',
      'olkklkklo',
      'obllkllbo',
      'oBbLlLbBo',
      '.oBLlLBo.',
      '..oBBBo..',
      'fffk.kfff',
    ],
  },
};
function drawGrid(c, x, y, grid, pal, right) {
  const h = grid.length, w = Math.max(...grid.map(r => r.length)), x0 = Math.round(x - w / 2), y0 = Math.round(y - h);
  for (let r = 0; r < h; r++) { const row = grid[r]; for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === '.') continue; const col = pal[ch]; if (col) R(c, right ? x0 + w - 1 - i : x0 + i, y0 + r, 1, 1, col); } }
}
function birdShadow(c, x, y, w) { c.fillStyle = 'rgba(20,28,40,.28)'; c.beginPath(); c.ellipse(x, y, w, 1.8, 0, 0, 7); c.fill(); }
function drawBird(c, x, y, id, o = {}) {
  const B = BIRDS[id], t = o.t || 0, s = o.s || 0; let grid = B.stand;
  if (o.frame === 'fly' && B.fly) grid = B.fly[Math.sin(t * 9 + s) > 0 ? 0 : 1];
  else if (o.frame === 'run' && B.run) grid = Math.floor(t * 12 + s) % 2 ? B.run : B.stand;
  else if (o.frame === 'wings' && B.wings) grid = B.wings;
  else if (o.frame === 'blink' && B.blink) grid = B.blink;
  if (o.shadow !== false && o.frame !== 'fly') birdShadow(c, x, y, Math.max(...grid.map(r => r.length)) / 2 - 1);
  const hop = o.frame === 'fly' ? 0 : (Math.sin(t * 2.3 + s * 7) > .95 ? -1 : 0);
  drawGrid(c, Math.round(x), Math.round(y) + hop, grid, B.pal, !!o.right);
}

// ---------- redefinitions of the old per-species drawing helpers ----------
function drawGull(c, x, y, time, seed, fly) { drawBird(c, x, y + (fly ? 4 : 0), 'gull', { t: time, s: seed, frame: fly ? 'fly' : null, right: fly ? false : Math.sin(time * .4 + seed * 3) > 0 }); }
function drawTern(c, x, y, time, seed) { drawBird(c, x, y, 'tern', { t: time, s: seed, right: seed % 2 === 1 }); }
function drawPuffin(c, x, y, t, s) { drawBird(c, x, y, 'puffin', { t, s, right: Math.sin(t * .5 + s) > 0 }); }
function drawCormorant(c, x, y, t, s) { drawBird(c, x, y, 'cormorant', { t, s, frame: Math.sin(t * .35 + s) > -.2 ? 'wings' : null, right: s % 2 === 1 }); }
function drawEider(c, x, y, t, s) { const dx = Math.round(Math.sin(t * .4 + s) * 6), dy = Math.round(Math.sin(t * 1.5 + s) * .8); drawBird(c, x + dx, y + dy + 2, 'eider', { t, s, shadow: false, right: Math.cos(t * .4 + s) > 0 }); }
function drawSandpiper(c, x, y, t) { const right = Math.cos(G.time * .35) > 0; drawBird(c, x, y, 'sandpiper', { t, s: x, frame: 'run', right }); }
function drawOwl(c, x, y, t) { drawBird(c, x, y + 2, 'owl', { t, s: 0, frame: Math.sin(t * .9) > .95 ? 'blink' : null, shadow: false }); }
function drawCliffBird(c, x, y, kind, t, s) { drawBird(c, x, y, kind, { t, s, right: Math.floor(s * 3) % 2 === 1 }); }
function iconBird(id, p, c) {
  if (!id.startsWith('bird_')) return false; const k = id.slice(5); if (!BIRDS[k]) return false;
  const g = BIRDS[k].stand, h = g.length; drawGrid(c, 8, Math.min(16, 8 + Math.ceil(h / 2) + 1), g, BIRDS[k].pal, false); return true;
}
BIRDS.kittiwake.fly = BIRDS.gull.fly; BIRDS.fulmar.fly = BIRDS.gull.fly; BIRDS.tern.fly = BIRDS.gull.fly;
