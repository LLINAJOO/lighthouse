"use strict";
// ===== People =====
// ---------- people ----------
const PCACHE = new Map(), PIDS = new WeakMap(); let PIDN = 0;
const PW = 24, PH = 30, PAX = 12, PAY = 27;
Object.assign(LOOKS.lida, { hdo: 'pony', tie: '#3c6db0' }); Object.assign(LOOKS.sonya, { hdo: 'braids', tie: '#c8303b' });
Object.assign(LOOKS.wife, { hdo: 'bun' }); Object.assign(LOOKS.kid, { hdo: 'pig', tie: '#e8688a', shoe: '#b8333a', tiny: true, long: false, coat: '#f2c23a', coat2: '#d49a22', hair: '#8a5432' }); // Varya: yellow raincoat, red boots, two pigtails
if (LOOKS.nyura) Object.assign(LOOKS.nyura, { hdo: 'braid', tie: '#c8443a' });
function paintPerson(g, L, dir, f, mv, sit, act, blink, breath) {
  const r = (x, y, w, h, col) => { if (col && w > 0 && h > 0) R(g, PAX + x, PAY + y, w, h, col); };
  const sm = !!L.small, fem = !!(L.fem || L.long || L.hdo), legH = L.tiny ? 2 : sm ? 1 : 2, tH = L.tiny ? 3 : sm ? 4 : 5;
  const shoe = L.shoe || '#2e2622', skinS = shade(L.skin, .86), pantsS = shade(L.pants, .8), coatS = L.coat2, shirt = L.shirt || '#f2ece0';
  const side = dir === 2, back = dir === 3, front = dir === 0;
  const step = mv ? [0, 1, 0, -1][f] : 0;
  let tt = -1 - legH - tH; if (sit) tt += 1;
  const ht = tt - 8 + breath, lt = -1 - legH;
  const hair = L.hair, hs = shade(hair, .8), hl = shade(hair, 1.15), tie = L.tie || shade(hair, .6);
  const hdo = L.hdo || (L.long ? 'long' : null);
  // hair that hangs behind the body
  if (back && hdo === 'long') r(-4, tt, 8, 2, hair);
  // ---- legs & shoes
  if (sit) {
    if (side) { r(-1, -3, 5, 2, L.pants); r(3, -1, 2, 1, shoe); }
    else { r(-3, -3, 6, 2, L.pants); r(-3, -1, 2, 1, shoe); r(1, -1, 2, 1, shoe); }
  } else if (!side) {
    const upL = step > 0 ? 1 : 0, upR = step < 0 ? 1 : 0;
    r(-3, lt, 2, legH, L.pants); r(1, lt, 2, legH, L.pants);
    r(-3, -1 - upL, 2, 1, shoe); r(1, -1 - upR, 2, 1, shoe);
    if (upL) r(-3, -1, 2, 1, null); if (upR) r(1, -1, 2, 1, null);
  } else if (step === 0) {
    r(-1, lt, 3, legH, L.pants); r(-1, -1, 4, 1, shoe);
  } else {
    r(-3, lt, 2, legH, pantsS); r(-4, -1, 3, 1, shade(shoe, .8));
    r(1, lt, 2, legH, L.pants); r(1, -1, 3, 1, shoe);
  }
  // ---- torso
  const tw = side ? 5 : 6, tx = side ? -2 : -3, th = tH + (L.long && !sit ? 1 : 0);
  r(tx, tt, tw, th, L.coat); r(tx, tt + th - 1, tw, 1, coatS);
  if (front) { r(-1, tt, 2, 1, shirt); if (!fem) r(0, tt + 2, 1, 1, coatS); if (L.tiny) { r(-1, tt, 2, 1, coatS); r(0, tt + 1, 1, 1, '#8a5a1a'); r(0, tt + 3, 1, 1, '#8a5a1a'); } }
  else if (side) r(2, tt, 1, 1, shirt);
  if (L.scarf) {
    if (front) { r(-3, tt, 6, 1, L.scarf); r(0, tt + 1, 2, 2, L.scarf); r(0, tt + 2, 2, 1, shade(L.scarf, .8)); }
    else if (back) r(-3, tt, 6, 1, L.scarf);
    else { r(-2, tt, 5, 1, L.scarf); r(-4, tt + 1, 2, 2, L.scarf); r(-4, tt + 2, 2, 1, shade(L.scarf, .8)); }
  }
  if (L.bag) {
    const bs = shade(L.bag, .75);
    if (front) { for (let i = 0; i < tH - 1; i++) r(-2 + i, tt + i, 1, 1, bs); r(1, tt + tH - 2, 3, 2, L.bag); }
    else if (back) { for (let i = 0; i < tH - 1; i++) r(1 - i, tt + i, 1, 1, bs); r(-4, tt + tH - 2, 3, 2, L.bag); }
    else { r(0, tt, 1, tH - 2, bs); r(-4, tt + 1, 2, 3, L.bag); }
  }
  // ---- arms
  if (!side) {
    if (act && !back) { r(-5, tt, 2, 2, coatS); r(3, tt, 2, 2, coatS); r(-4, tt + 2, 2, 1, coatS); r(2, tt + 2, 2, 1, coatS); r(-2, tt + 2, 2, 1, L.skin); r(0, tt + 2, 2, 1, L.skin); }
    else {
      const aL = step > 0 ? -1 : 0, aR = step < 0 ? -1 : 0;
      r(-5, tt + aL, 2, 3, coatS); r(-5, tt + 3 + aL, 2, 1, L.skin);
      r(3, tt + aR, 2, 3, coatS); r(3, tt + 3 + aR, 2, 1, L.skin);
    }
  } else {
    if (act) { r(0, tt + 1, 3, 2, coatS); r(3, tt + 1, 1, 2, L.skin); }
    else { const s = step; r(-1 + s, tt, 2, 3, coatS); r(-1 + s, tt + 3, 2, 1, L.skin); }
  }
  // ---- head (8 wide, 7 tall)
  r(-3, ht, 6, 1, L.skin); r(-4, ht + 1, 8, 5, L.skin); r(-3, ht + 6, 6, 1, fem ? L.skin : skinS); r(-3, ht + 6, 1, 1, OUTL); if (!(side && fem)) r(2, ht + 6, 1, 1, OUTL); // rounded chin: dark lower corners (girls in profile keep a soft chin)
  r(-2, tt - 1, 4, 1, OUTL);
  const eye = '#221c24', lip = fem ? '#d0605e' : '#9a4c46', blush = fem ? '#f08c8c' : '#e8a090';
  if (back) {
    r(-3, ht, 6, 1, hair); r(-4, ht + 1, 8, 5, hair); r(-3, ht + 1, 3, 1, hl);
    if (hdo === 'long') r(-4, ht + 6, 8, 2, hair);
    else if (hdo === 'braids') { r(-3, ht + 6, 1, 4, hair); r(2, ht + 6, 1, 4, hair); r(-3, ht + 10, 1, 1, tie); r(2, ht + 10, 1, 1, tie); }
    else if (hdo === 'braid') { r(-1, ht + 6, 2, 5, hair); r(-1, ht + 7, 2, 1, hs); r(-1, ht + 9, 2, 1, hs); r(-1, ht + 11, 2, 1, tie); }
    else if (hdo === 'pony') { r(-1, ht + 4, 2, 5, hair); r(-1, ht + 4, 2, 1, tie); }
    else if (hdo === 'bob') r(-4, ht + 6, 8, 1, hair);
    else if (hdo === 'pig') { for (const s of [-1, 1]) { const x = s < 0 ? -5 : 4; r(x, ht + 2, 1, 1, tie); r(s < 0 ? -7 : 5, ht + 2, 2, 2, hair); r(s < 0 ? -7 : 6, ht + 4, 1, 2, hs); } }
    if (hdo === 'bun') { r(-2, ht - 2, 4, 2, hair); r(-2, ht - 2, 2, 1, hl); }
  } else if (front) {
    r(-3, ht, 6, 1, hair); r(-4, ht + 1, 8, 1, hair); r(-3, ht + 1, 3, 1, hl);
    if (fem) {
      // softer face: side-swept fringe, hair framing the cheeks
      r(-4, ht + 2, 2, 1, hair); r(2, ht + 2, 2, 1, hair); r(-4, ht + 3, 1, 3, hair); r(3, ht + 3, 1, 3, hair);
      if (hdo === 'long') { r(-5, ht + 2, 1, 7, hair); r(4, ht + 2, 1, 7, hair); r(-4, ht + 6, 1, 2, hs); r(3, ht + 6, 1, 2, hs); }
      if (hdo === 'braids') { r(-5, ht + 3, 1, 6, hair); r(4, ht + 3, 1, 6, hair); r(-5, ht + 5, 1, 1, hs); r(4, ht + 5, 1, 1, hs); r(-5, ht + 9, 1, 1, tie); r(4, ht + 9, 1, 1, tie); }
      if (hdo === 'braid') { r(3, ht + 4, 2, 6, hair); r(3, ht + 6, 2, 1, hs); r(3, ht + 8, 2, 1, hs); r(3, ht + 10, 2, 1, tie); }
      if (hdo === 'bob') { r(-4, ht + 2, 8, 1, hair); r(-5, ht + 2, 1, 4, hair); r(4, ht + 2, 1, 4, hair); r(-4, ht + 6, 1, 1, hair); r(3, ht + 6, 1, 1, hair); }
      if (hdo === 'bun') { r(-2, ht - 2, 4, 2, hair); r(-2, ht - 2, 2, 1, hl); }
      if (hdo === 'pony') r(4, ht + 3, 1, 3, hair);
      if (hdo === 'pig') { r(-3, ht + 2, 6, 1, hair); r(-5, ht + 2, 1, 1, tie); r(4, ht + 2, 1, 1, tie); r(-7, ht + 2, 2, 2, hair); r(5, ht + 2, 2, 2, hair); r(-7, ht + 4, 1, 2, hs); r(6, ht + 4, 1, 2, hs); r(-7, ht + 2, 1, 1, hl); }
    } else { r(-4, ht + 2, 2, 1, hair); r(-1, ht + 2, 2, 1, hair); r(2, ht + 2, 2, 1, hair); r(-4, ht + 3, 1, 1, hair); r(3, ht + 3, 1, 1, hair); }
    if (blink) { r(-2, ht + 4, 1, 1, eye); r(1, ht + 4, 1, 1, eye); } else { r(-2, ht + 3, 1, 2, eye); r(1, ht + 3, 1, 2, eye); }
    if (fem && !blink) { r(-3, ht + 3, 1, 1, eye); r(2, ht + 3, 1, 1, eye); }
    r(-3, ht + 5, 1, 1, blush); r(2, ht + 5, 1, 1, blush);
    if (L.beard) { r(-3, ht + 5, 6, 2, L.beard); r(-2, ht + 7, 4, 1, L.beard); r(-4, ht + 3, 1, 3, L.beard); r(3, ht + 3, 1, 3, L.beard); }
    if (L.mustache) r(-2, ht + 5, 4, 1, L.mustache);
  } else {
    // profile, facing right
    r(-3, ht, 6, 1, hair); r(-4, ht + 1, 8, 1, hair); r(-3, ht + 1, 3, 1, hl);
    if (fem) {
      r(-4, ht + 2, 4, 3, hair); r(0, ht + 2, 3, 1, hair); r(-4, ht + 5, 2, 1, hair);
      if (hdo === 'long') { r(-5, ht + 2, 2, 8, hair); r(-3, ht + 5, 1, 4, hs); }
      if (hdo === 'braids' || hdo === 'braid') { r(-5, ht + 4, 2, 6, hair); r(-5, ht + 6, 2, 1, hs); r(-5, ht + 8, 2, 1, hs); r(-5, ht + 10, 2, 1, tie); }
      if (hdo === 'pony') { r(-5, ht + 2, 1, 1, tie); r(-6, ht + 2, 2, 2, hair); r(-6, ht + 4, 1, 3, hair); }
      if (hdo === 'bob') { r(-4, ht + 5, 3, 2, hair); r(1, ht + 2, 2, 1, hair); }
      if (hdo === 'bun') { r(-5, ht, 3, 3, hair); r(-5, ht, 2, 1, hl); }
      if (hdo === 'pig') { r(-5, ht + 2, 1, 1, tie); r(-7, ht + 2, 2, 2, hair); r(-7, ht + 4, 1, 2, hs); }
    } else { r(-4, ht + 2, 3, 3, hair); r(0, ht + 2, 2, 1, hair); }
    r(-1, ht + 3, 1, 2, skinS);
    if (blink) r(2, ht + 4, 1, 1, eye); else r(2, ht + 3, 1, 2, eye);
    r(1, ht + 5, 1, 1, blush);
    if (!fem) { r(4, ht + 3, 1, 2, L.skin); r(4, ht + 4, 1, 1, skinS); }
    if (L.beard) { r(-1, ht + 5, 6, 2, L.beard); r(0, ht + 7, 4, 1, L.beard); r(-1, ht + 3, 1, 2, L.beard); }
    if (L.mustache) r(2, ht + 5, 3, 1, L.mustache);
  }
  // ---- hats
  const hc = L.hatC, hcs = shade(hc || '#000000', .8), vis = col => { if (front) r(-4, ht + 1, 8, 1, col); else if (side) r(2, ht + 1, 3, 1, col); };
  switch (L.hat) {
    case 'beanie': r(-3, ht - 3, 6, 1, hc); r(-4, ht - 2, 8, 3, hc); r(-4, ht + 1, 8, 1, hcs); for (let i = -3; i < 4; i += 2) r(i, ht - 2, 1, 3, hcs); r(-1, ht - 4, 2, 1, '#f2e6cc'); break;
    case 'souwester': r(-3, ht - 3, 6, 3, hc); r(-3, ht - 1, 6, 1, hcs); if (side) { r(-6, ht, 10, 1, hc); r(-6, ht + 1, 4, 1, hcs); } else { r(-6, ht, 12, 1, hc); r(-6, ht + 1, 2, 1, hcs); r(4, ht + 1, 2, 1, hcs); } break;
    case 'cap': r(-3, ht - 3, 6, 1, hc); r(-4, ht - 2, 8, 3, hc); r(-4, ht, 8, 1, hcs); if (!back) r(-1, ht - 2, 2, 1, '#e8c55a'); vis('#1a3358'); break;
    case 'beret': r(-3, ht - 3, 6, 1, hc); r(-5, ht - 2, 9, 2, hc); r(-4, ht, 7, 1, hcs); r(0, ht - 4, 1, 1, hc); break;
    case 'peaked': r(-4, ht - 3, 8, 1, hc); r(-5, ht - 2, 10, 2, hc); r(-4, ht, 8, 1, '#1d1f24'); if (!back) r(-1, ht - 2, 2, 1, '#d4b14a'); vis('#111318'); break;
    case 'captain': r(-4, ht - 3, 8, 1, hc); r(-5, ht - 2, 10, 2, hc); r(-4, ht, 8, 1, '#1d1f24'); if (!back) r(-1, ht - 1, 2, 1, '#d4b14a'); vis('#111318'); break;
  }
}
function personSprite(L, dir, f, mv, sit, act, blink, breath) {
  if (!PIDS.has(L)) PIDS.set(L, ++PIDN);
  const key = PIDS.get(L) + '|' + dir + '|' + f + '|' + (mv ? 1 : 0) + (sit ? 1 : 0) + (act ? 1 : 0) + (blink ? 1 : 0) + breath;
  let cv = PCACHE.get(key); if (cv) return cv;
  const [a, g] = mk(PW, PH);
  paintPerson(g, L, dir === 1 ? 2 : dir, f, mv, sit, act, blink, breath);
  outlinePass(a, OUTL);
  if (dir === 1) { const [b, h] = mk(PW, PH); h.translate(PW, 0); h.scale(-1, 1); h.drawImage(a, 0, 0); cv = b; } else cv = a;
  PCACHE.set(key, cv); return cv;
}
function drawPerson(c, x, y, L, o = {}) {
  x = Math.round(x); y = Math.round(y);
  const dir = o.dir ?? 0, mv = !!o.moving, f = mv ? (o.frame ?? 0) % 4 : 0, sit = !!o.sit, act = !!o.act && !mv;
  const t = o.t || 0, blink = t % 4 > 3.85, breath = !mv && !sit && !act && (t % 3) > 1.6 ? 1 : 0;
  if (!o.noShadow) { c.fillStyle = 'rgba(20,28,40,.28)'; c.beginPath(); c.ellipse(x + (o.sdx || 0), y, 6, 2, 0, 0, 7); c.fill(); }
  const bob = mv && (f % 2) ? -1 : 0;
  c.drawImage(personSprite(L, dir, f, mv, sit, act, blink, breath), x - PAX - (dir === 1 ? 1 : 0), y - PAY - 1 + bob);
}
