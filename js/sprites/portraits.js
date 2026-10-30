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
function portraitSprite(look, talk, blink, emo = 'neutral') {
  const key = look + (talk ? 't' : '') + (blink ? 'b' : '') + emo; let cv = PCACHE2.get(key); if (cv) return cv;
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
  if (P.hair === 'braids') { for (const bx of [12, 32]) { for (let y = 26; y < 44; y += 3) { rect(bx, y + fy, 4, 2, hair); rect(bx + 1, y + 2 + fy, 2, 1, hS); } rect(bx, 44 + fy - 2, 4, 2, L.tie || '#c8303b'); } }
  if (P.hair === 'braid') { for (let y = 28; y < 46; y += 3) { rect(32, y, 4, 2, hair); rect(33, y + 2, 2, 1, hS); } rect(32, 45, 4, 2, L.tie || '#c8443a'); }
  // ---- head
  const hx = 24, hy = 22 + fy, rx = kid ? 10 : 10.5, ry = kid ? 12.5 : 12.5;
  oval(hx, hy, rx, ry, skin);
  if (!kid) { const jy = Math.floor(hy + ry - 2); for (let x = 15; x < 33; x++) { const dx = (x + .5 - hx) / rx, dy = (jy + .5 - hy) / ry; if ((x < 19 || x > 29) && dx * dx + dy * dy <= 1) px(x, jy, skS); } } // jaw shade, only inside the face
  // ears, mirrored
  rect(12, hy - 1, 2, 5, skin); px(12, hy, skS); rect(34, hy - 1, 2, 5, skin); px(35, hy, skS);
  // ---- eyes
  const ey = hy + (kid ? 1 : 0), eyeL = 16, eyeR = 28, DK = '#3a2a26';
  const happyEyes = emo === 'happy' || emo === 'laugh';
  const eye = (x) => {
    const lash = () => { if (fem) px(x + (x < 24 ? -1 : 4), ey, '#2a1e1a'); };
    if (blink && !happyEyes) { rect(x, ey + 1, 4, 1, DK); return; }
    if (happyEyes) { px(x, ey + 2, DK); rect(x + 1, ey + 1, 2, 1, DK); px(x + 3, ey + 2, DK); if (fem) px(x + (x < 24 ? -1 : 4), ey + 2, '#2a1e1a'); return; } // smiling ^ eyes
    if (emo === 'sad') { rect(x, ey + 1, 4, 2, '#ffffff'); rect(x + 1, ey + 1, 2, 2, DK); rect(x, ey, 4, 1, fem || kid ? '#2a1e1a' : skD); lash(); return; } // heavy lids
    if (emo === 'stern') { rect(x, ey + 1, 4, 2, '#ffffff'); rect(x + 1, ey + 1, 2, 2, DK); rect(x, ey, 4, 1, '#2a1e1a'); return; } // narrowed
    rect(x, ey, 4, 3, '#ffffff');
    if (emo === 'surprised') { px(x + 1, ey + 1, DK); px(x + 2, ey + 1, DK); rect(x, ey - 1, 4, 1, fem || kid ? '#2a1e1a' : skD); lash(); return; } // small pupils, wide eyes
    rect(x + 1, ey, 2, 3, DK); px(x + 1, ey, '#ffffff'); px(x + 2, ey + 2, '#5a4036');
    if (fem || kid) { rect(x, ey - 1, 4, 1, '#2a1e1a'); lash(); }
    else rect(x, ey - 1, 4, 1, skD);
  };
  eye(eyeL); eye(eyeR);
  // brows: the usual shape when calm, tilted lines for feelings (outer -> inner heights, mirrored)
  const bc = P.brows === 'bushy' ? '#f2f2f2' : shade(hair === '#e8e8e8' ? '#9a9a9a' : hair, .8), thick = P.brows === 'bushy' ? 2 : 1;
  const tilt = { sad: [-2, -3, -3, -4, -4], worried: [-3, -3, -4, -4, -5], stern: [-4, -4, -3, -3, -2], surprised: [-5, -6, -6, -6, -5], happy: [-4, -4, -4, -4, -4], laugh: [-4, -5, -5, -5, -4] }[emo];
  if (tilt) { for (let i = 0; i < 5; i++) { const yy = ey + tilt[i]; rect(15 + i, yy, 1, thick, bc); rect(32 - i, yy, 1, thick, bc); } if (P.brows === 'bushy') { rect(14, ey + tilt[0], 1, 2, bc); rect(33, ey + tilt[0], 1, 2, bc); } }
  else if (P.brows === 'stern') { rect(15, ey - 4, 5, 1, bc); px(19, ey - 3, bc); rect(28, ey - 4, 5, 1, bc); px(28, ey - 3, bc); }
  else if (P.brows === 'bushy') { rect(14, ey - 4, 6, 2, bc); rect(28, ey - 4, 6, 2, bc); }
  else if (fem || kid) { for (const bx of [15, 28]) { px(bx, ey - 3, bc); rect(bx + 1, ey - 4, 3, 1, bc); px(bx + 4, ey - 3, bc); } }
  else { rect(15, ey - 3, 5, 1, bc); rect(28, ey - 3, 5, 1, bc); }
  if (emo === 'worried' || emo === 'sad') { px(23, ey - 4, skS); px(24, ey - 4, skS); } // a little crease between the brows
  // nose
  if (fem || kid) { px(24, ey + 5, skS); px(23, ey + 5, skS); }
  else { rect(23, ey + 2, 2, 3, skin); rect(23, ey + 5, 2, 1, skD); px(22, ey + 5, skS); px(25, ey + 5, skS); }
  // cheeks, freckles (cheeks glow when happy)
  { const cl = kid ? 15 : 14, cc = happyEyes ? '#f08888' : fem || kid ? '#f0a0a0' : '#e8b0a0'; rect(cl, ey + 5, 3, 1, cc); rect(45 - cl, ey + 5, 3, 1, cc); if (happyEyes && (fem || kid)) { rect(cl, ey + 4, 3, 1, '#f6b4ac'); rect(45 - cl, ey + 4, 3, 1, '#f6b4ac'); } }
  if (P.freckles) [[15, ey + 4], [17, ey + 5], [32, ey + 4], [30, ey + 5], [16, ey + 6], [31, ey + 6]].forEach(([x, y]) => px(x, y, shade(skin, .78)));
  if (P.wrinkles) { px(14, ey + 1, skD); px(33, ey + 1, skD); if (P.wrinkles > 1) { rect(20, ey - 6, 8, 1, skS); rect(21, ey - 8, 6, 1, skS); } }
  if (P.stubble) for (let x = 17; x < 31; x++) for (let y = ey + 9; y < ey + 11; y++) if (hash(Math.min(x, 47 - x), y) > .7) px(x, y, shade(skin, .9));
  // mouth, symmetric around x=24; opens while talking
  const my = ey + 8, lipC = fem || kid ? '#c8605a' : '#9a4c46', IN = '#5a2a26', TG = '#c8605a';
  const mouth = (y) => {
    if (emo === 'laugh') { rect(21, y, 6, 2, IN); rect(22, y + 1, 4, 1, TG); rect(22, y - 1 + (talk ? 0 : 0), 4, 1, '#ffffff'); px(21, y - 1, IN); px(26, y - 1, IN); return; }
    if (emo === 'surprised') { rect(23, y, 2, talk ? 3 : 2, IN); px(22, y + 1, IN); px(25, y + 1, IN); return; }
    if (talk) { const w = emo === 'happy' ? 6 : 4, x0 = 24 - w / 2; rect(x0, y, w, 2, IN); rect(x0 + 1, y + 1, w - 2, 1, TG); if (emo === 'happy') { px(x0 - 1, y - 1, IN); px(x0 + w, y - 1, IN); } return; }
    if (emo === 'happy') { rect(22, y, 4, 1, lipC); px(21, y - 1, lipC); px(26, y - 1, lipC); return; }
    if (emo === 'sad') { rect(22, y, 4, 1, lipC); px(21, y + 1, lipC); px(26, y + 1, lipC); return; }
    if (emo === 'worried') { rect(23, y, 2, 1, lipC); px(22, y + 1, lipC); px(25, y + 1, lipC); return; }
    if (emo === 'stern') { rect(21, y, 6, 1, shade(lipC, .8)); return; }
    rect(22, y, 4, 1, lipC); if (fem) rect(23, y + 1, 2, 1, '#e08a84');
  };
  mouth(my);
  // beard and mustache (the mouth shows again on top of the beard)
  if (P.beard === 'big') { oval(24, my + 4, 11, 8, L.beard, (x, y) => y >= my - 1); oval(24, my + 4, 9, 6, '#ffffff', (x, y) => y >= my + 3 && x < 24); rect(20, my - 1, 8, 2, '#e8e8e8'); if (talk || emo !== 'neutral') mouth(my + 1); for (let i = 0; i < 5; i++) px(16 + i * 4, my + 8 + (i % 2), '#d8d8d8'); }
  if (P.beard === 'trim') { for (let y = my - 2; y < my + 6; y++) for (let x = 14; x < 35; x++) { const dx = (x + .5 - 24) / 10.5, dy = (y + .5 - (my - 2)) / 8; if (dx * dx + dy * dy <= 1 && y >= ey + 6) px(x, y, L.beard); } rect(21, my - 1, 6, 1, shade(L.beard, .8)); mouth(my); }
  if (P.mustache) { rect(20, my - 2, 8, 2, L.mustache); px(19, my - 1, L.mustache); px(28, my - 1, L.mustache); }
  // ---- hair on the head
  const top = hy - ry;
  switch (P.hair) {
    case 'short': oval(24, top + 5, 11.5, 6, hair, (x, y) => y < top + 8); for (let x = 14; x < 34; x += 3) { px(x, top + 7, hair); px(x + 1, top + 8, hair); } rect(13, top + 6, 2, 8, hair); rect(33, top + 6, 2, 8, hS); px(16, top + 3, hL); px(17, top + 3, hL); break;
    case 'oldwhite': rect(12, top + 7, 3, 10, hair); rect(33, top + 7, 3, 10, shade(hair, .85)); break;
    case 'greyshort': oval(24, top + 4, 11, 5, hair, (x, y) => y < top + 6); rect(13, top + 5, 2, 7, hair); rect(33, top + 5, 2, 7, hS); px(13, top + 8, '#d8d8d8'); break;
    case 'darkshort': oval(24, top + 4, 11, 5, hair, (x, y) => y < top + 6); rect(13, top + 5, 2, 8, hair); rect(33, top + 5, 2, 8, hS); break;
    case 'pony': oval(24, top + 5, 11.5, 6.5, hair, (x, y) => y < top + 8); for (let x = 14; x < 22; x++) px(x, top + 8 + Math.round((22 - x) / 3), hair); rect(13, top + 6, 2, 11, hair); rect(33, top + 6, 2, 11, hS); px(17, top + 3, hL); px(18, top + 3, hL); break;
    case 'braids': { oval(24, top + 6, 11.5, 7.5, hair, (x, y) => y < top + 8); for (let x = 14; x < 34; x++) { const d = Math.abs(x + .5 - 24), h = d < 2 ? 0 : Math.round(3 - d / 4); for (let y = top + 8; y < top + 8 + Math.max(0, h); y++) px(x, y, hair); } rect(13, top + 7, 2, 11, hair); rect(33, top + 7, 2, 11, hS); px(18, top + 3, hL); px(19, top + 3, hL); px(17, top + 4, hL); break; }
    case 'braid': oval(24, top + 5, 11.5, 6.5, hair, (x, y) => y < top + 8); for (let x = 26; x < 34; x++) px(x, top + 8 + Math.round((x - 26) / 3), hair); rect(13, top + 6, 2, 12, hair); rect(33, top + 6, 2, 12, hS); break;
  }
  // ---- hats
  const hc = L.hatC, hcS = hc ? shade(hc, .8) : null, hcL = hc ? shade(hc, 1.15) : null;
  switch (L.hat) {
    case 'beanie': oval(24, top + 5, 12.5, 8, hc, (x, y) => y < top + 7); rect(12, top + 5, 24, 4, hcS); for (let x = 13; x < 35; x += 2) rect(x, top + 5, 1, 4, shade(hc, .7)); for (let x = 15; x < 34; x += 3) px(x, top, hcL); oval(24, top - 4, 3, 2.5, '#f2e6cc'); px(23, top - 5, '#ffffff'); break;
    case 'souwester': oval(24, top + 3, 10, 7, hc, (x, y) => y < top + 7); rect(5, top + 6, 38, 3, hc); rect(5, top + 8, 38, 1, hcS); rect(3, top + 8, 4, 2, hc); rect(41, top + 8, 4, 2, hcS); rect(14, top + 3, 20, 1, hcL); break;
    case 'cap': oval(24, top + 3, 12, 6, hc, (x, y) => y < top + 6); rect(12, top + 4, 24, 3, hc); rect(12, top + 6, 24, 1, hcS); rect(13, top + 7, 20, 2, '#1a3358'); rect(14, top + 9, 16, 1, '#13284a'); rect(22, top, 4, 3, '#e8c55a'); rect(23, top + 1, 2, 1, '#c49412'); break;
    case 'beret': oval(24, top + 1, 13, 5.5, hc); oval(24, top + 3.5, 12, 2.5, hcS, (x, y) => y > top + 4); rect(23, top - 6, 2, 2, hc); px(16, top - 1, hcL); px(17, top - 2, hcL); px(18, top - 2, hcL); break;
    case 'peaked': rect(12, top - 1, 24, 6, hc); rect(10, top - 3, 28, 3, hc); rect(10, top - 3, 28, 1, hcL); rect(12, top + 5, 24, 2, '#1d1f24'); rect(13, top + 7, 22, 2, '#111318'); rect(15, top + 9, 18, 1, '#2c3036'); rect(22, top, 4, 3, '#d4b14a'); px(23, top + 1, '#a8822e'); break;
    case 'captain': rect(12, top - 1, 24, 6, hc); rect(10, top - 3, 28, 3, hc); rect(10, top - 3, 28, 1, '#ffffff'); rect(12, top + 5, 24, 2, '#1d1f24'); rect(13, top + 7, 22, 2, '#111318'); rect(15, top + 9, 18, 1, '#2c3036'); rect(21, top + 1, 6, 3, '#d4b14a'); px(23, top + 2, '#1d1f24'); px(24, top + 2, '#1d1f24'); for (let i = 0; i < 4; i++) px(14 + i * 6, top + 6, '#d4b14a'); break;
  }
  outlinePass(a, OUTL);
  PCACHE2.set(key, a); return a;
}
// draw the speaker; while the line is being typed the mouth moves, and everyone blinks now and then
function drawPortrait(c, look, talking, t, emo) {
  const blink = (t % 4.3) > 4.12, talk = talking && Math.floor(t * 9) % 2 === 1;
  c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  c.drawImage(portraitSprite(look, talk, blink, emo || 'neutral'), Math.round((c.canvas.width - 48) / 2), c.canvas.height - 48);
}
NAME_LOOK['Нюра'] = 'nyura';
// ===== which face fits the line =====
const EMOS = ['neutral', 'happy', 'laugh', 'sad', 'surprised', 'worried', 'stern'];
// hand-picked faces for the written lines (matched by how the line starts)
const EMO_LINES = [
  ['Дождь стучит', 'worried'], ['Туман такой', 'worried'], ['Говорили, приедет инспектор', 'worried'], ['Последний день', 'sad'], ['Под камнем', 'surprised'],
  ['Вот ты где', 'happy'], ['Генератор чихнул', 'happy'], ['Генератор в сарае', 'worried'], ['Электричества нет', 'worried'], ['Не всё сделано', 'sad'], ['Огонь. В последний раз', 'sad'],
  ['Солнце садится', 'happy'], ['Свет пошёл', 'happy'], ['Птенец пискнул', 'laugh'], ['Одна из чаек', 'surprised'], ['Кыш!', 'stern'], ['Кот посмотрел с укором', 'sad'],
  ['Уха с дымком', 'happy'], ['Брусника', 'happy'], ['Тюлений камень', 'laugh'], ['Тюленёнок запутался', 'worried'], ['Тюленёнок перекатился', 'happy'], ['У пирса вынырнула', 'happy'],
  ['Машу фонарём', 'worried'], ['Сгрёб сети', 'worried'], ['Огромный дуб', 'surprised'], ['Велосипед без колеса', 'laugh'], ['Кайра смотрит свысока', 'laugh'], ['На пляже палатка', 'surprised'],
  ['Птичий базар', 'laugh'], ['Ящик выбросило', 'surprised'], ['Шторм ушёл', 'neutral'], ['Там! Ответный', 'happy'], ['Рыжий, говоришь', 'happy'], ['Аккуратно, по одной', 'happy'],
  ['Темнеет. Ночью в море', 'stern'], ['Глаза слипаются', 'sad'],
  ['Повешу в лодке', 'happy'], ['Я его никогда-никогда', 'laugh'], ['Саше с травами', 'surprised'], ['Живёт теперь у меня', 'laugh'], ['Всё! Вы мне за три дня', 'happy'], ['Держите бинокль', 'happy'],
  ['Еле успела', 'laugh'], ['Пришёл! Садись', 'happy'], ['Готово!', 'happy'], ['Пришёл всё-таки', 'happy'], ['Слушай! Попозируешь', 'happy'], ['Рано пришёл', 'laugh'], ['А уху-то я так и не', 'sad'],
  ['Вот, держите. Марка', 'happy'], ['Новости?', 'laugh'], ['Ваше письмо я сама', 'happy'], ['Твой портрет', 'happy'], ['Дедушка сказал, ты слышал китов', 'surprised'], ['Вчерашнюю уху', 'happy'],
  ['И сети ты мои спас', 'happy'], ['Говорят, ты кораблю', 'surprised'], ['Знаете что? Первого', 'happy'], ['Будет у меня на базаре', 'laugh'], ['И сети мои спас, и Лиду', 'laugh'], ['Сети мои ты в шторм спас', 'happy'],
  ['Слыхал, ты Лиду', 'happy'], ['Сети мои шторм унёс', 'sad'], ['Это вы мне светили', 'happy'], ['Ох, ну и ночка', 'worried'], ['Ты тут смотришь на море', 'sad'], ['Я ещё загляну', 'sad'],
  ['Это мне? Поплавок', 'surprised'], ['Слушай, смотритель. Подобрал', 'happy'], ['Ожерелье!', 'happy'], ['Положу в сумку', 'happy'], ['Шестерни крутятся', 'happy'],
];
function emoOf(who, text) {
  const raw = text || '', t = raw.toLowerCase();
  for (const [p, e] of EMO_LINES) if (raw.startsWith(p)) return e;
  if (/(^|[^а-яё])(ха|хе|хи)(-?(ха|хе|хи))+|смеш|смеётся|смеюсь|хохоч/.test(t)) return 'laugh';
  if (/беда|боюсь|страшн|тревож|опасн|помоги|скорее|срочно|пропал|не успе|осторожн|не дай бог|тонет|ранен/.test(t)) return 'worried';
  if (/жаль|грустн|скуча|плак|одинок|прощай|умер|без вас|тоскл|печал|(^|[^а-яё])эх([^а-яё]|$)|увы|последний раз/.test(t)) return 'sad';
  if (/\?!|!\?|(^|[^а-яё])(ого|ух ты|ох|ах|неужели|вот это да|надо же|не может быть)([^а-яё]|$)/.test(t)) return 'surprised';
  if (/нарушен|обязан|по инструкции|инспекц|запрещ|недопустим|предупреждаю|протокол|неверно|замечание/.test(t)) return 'stern';
  if (/спасибо|(^|[^а-яё])рад[аы]?([^а-яё]|$)|здорово|отлично|чудесн|прекрасн|ура|красив|люблю|молодец|улыб|весело|получилось|поздрав|благодар|славн|верно|правильно|образцов/.test(t)) return 'happy';
  if (/!\s*$/.test(t) && who !== 'Громов' && who !== 'Смотритель') return 'happy';
  if (who === 'Громов') return 'stern'; // the inspector is all business unless pleased
  return 'neutral';
}
