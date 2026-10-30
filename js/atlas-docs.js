"use strict";
// ===================== FEATURES 2: atlas, fishing spots, birds, documents, living cat, inspector =====================

// ---------- atlas data ----------
const ATLAS = {
  fish: { title: 'Рыбы', items: [
    { id: 'cod', n: 'Треска', d: 'Главная рыба северных морей. Из неё выходит лучшая уха.', hint: 'Ловится почти везде в море.' },
    { id: 'flounder', n: 'Камбала', d: 'Плоская, оба глаза на одной стороне. Лежит на песчаном дне.', hint: 'С пирса, днём.' },
    { id: 'herring', n: 'Сельдь', d: 'Серебристая, ходит большими косяками.', hint: 'С пирса или с камней, утром.' },
    { id: 'perch', n: 'Морской окунь', d: 'Ярко-красный и колючий. Любит скалы.', hint: 'Камни на западе или скалы Дальнего леса.' },
    { id: 'wolffish', n: 'Зубатка', d: 'Зубастая и страшноватая на вид, но очень вкусная.', hint: 'Скалы Дальнего леса, вечером и ночью.' },
    { id: 'monk', n: 'Морской чёрт', d: 'Огромная пасть и свой «фонарик» на голове. Настоящая редкость!', hint: 'У скал в дождь, грозу или туман.' },
    { id: 'trout', n: 'Форель', d: 'Пятнистая и быстрая, любит холодную чистую воду.', hint: 'Лесное озеро, утром или вечером.' },
    { id: 'crucian', n: 'Карась', d: 'Круглый и неприхотливый. Живёт в любом пруду.', hint: 'Лесное озеро, в любое время.' },
    { id: 'eel', n: 'Угорь', d: 'Длинный, как змея. Выходит кормиться в темноте.', hint: 'Лесное озеро, ночью.' },
  ] },
  birds: { title: 'Птицы', items: [
    { id: 'gull', n: 'Серебристая чайка', d: 'Шумная хозяйка острова. Спорит со всеми и всегда побеждает.', hint: 'Скалы на востоке острова.' },
    { id: 'tern', n: 'Полярная крачка', d: 'Каждый год летает с одного полюса на другой.', hint: 'Западный пляж, только во 2-й день.' },
    { id: 'puffin', n: 'Тупик', d: 'Птица-клоун с полосатым клювом. Ныряет за рыбой глубже, чем кажется.', hint: 'Скалы на краю Дальнего леса, днём, с 4-го дня.' },
    { id: 'cormorant', n: 'Баклан', d: 'Сушит крылья, раскинув их на ветру, как бельё.', hint: 'Камни у западного места для рыбалки, днём.' },
    { id: 'eider', n: 'Гага', d: 'Морская утка. Её пух — самый тёплый на свете.', hint: 'Вода у пирса, рано утром.' },
    { id: 'sandpiper', n: 'Кулик', d: 'Бегает по кромке прибоя мелкими быстрыми шажками.', hint: 'Пляж к востоку от пирса, днём.' },
    { id: 'owl', n: 'Ушастая сова', d: 'Тихая ночная охотница Дальнего леса.', hint: 'Старый дуб в Дальнем лесу, глубокой ночью.' },
  ] },
  herbs: { title: 'Травы и ягоды', items: [
    { id: 'melissa', n: 'Мелисса', d: 'Лимонный запах. Для чая и для саше.', hint: 'Леса острова.' },
    { id: 'chamomile', n: 'Ромашка', d: 'Солнечные цветы лесных полян. Из двух выйдет ромашковый чай.', hint: 'Лесные поляны.' },
    { id: 'mint', n: 'Мята', d: 'Холодит даже на ощупь.', hint: 'Леса острова.' },
    { id: 'thyme', n: 'Чабрец', d: 'Низкий лиловый кустик. Пахнет горами и дымом.', hint: 'Леса острова.' },
    { id: 'fireweed', n: 'Иван-чай', d: 'Высокие розовые свечки. Основа лесного сбора.', hint: 'Леса, чаще в Дальнем.' },
    { id: 'berries', n: 'Брусника', d: 'Кислая, холодная, растёт на кустах в лесу.', hint: 'Кусты в западном лесу.' },
  ] },
  stars: { title: 'Созвездия', items: [
    { id: 'd1', n: 'Большая Медведица', d: 'Ковш из семи звёзд. Через крайние звёзды ковша можно найти Полярную.', hint: 'Подзорная труба, ясной ночью 1-го дня.' },
    { id: 'd2', n: 'Кассиопея', d: 'Звёздная буква «W». Никогда не заходит за горизонт.', hint: 'Подзорная труба, ночью 2-го дня.' },
    { id: 'd4', n: 'Лира', d: 'Маленький параллелограмм и яркая Вега.', hint: 'Подзорная труба, ночью 4-го дня.' },
    { id: 'd6', n: 'Северная Корона', d: 'Полукруг звёзд, будто кто-то обронил над морем диадему.', hint: 'Подзорная труба, ночью 6-го дня.' },
    { id: 'd7', n: 'Малая Медведица', d: 'На кончике её ручки — Полярная звезда, она всегда показывает дорогу домой.', hint: 'Подзорная труба, ночью 7-го дня.' },
  ] },
};
const atlasTotal = () => Object.values(ATLAS).reduce((s, c) => s + c.items.length, 0);
function atlasHas(cat, id) { return !!(S.atlas && S.atlas[cat] && S.atlas[cat].includes(id)); }
function atlasAdd(cat, id) {
  if (!S.atlas) S.atlas = {}; if (!S.atlas[cat]) S.atlas[cat] = [];
  if (S.atlas[cat].includes(id)) return false;
  S.atlas[cat].push(id);
  const it = ATLAS[cat].items.find(x => x.id === id); if (!it) return false;
  const el = document.createElement('div'); el.className = 'toast pix atl';
  const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.getContext('2d').drawImage(atlasIcon(cat, id), 0, 0); el.appendChild(c);
  const s = document.createElement('span'); s.innerHTML = '<small>Новое в атласе</small>'; s.appendChild(document.createTextNode(it.n)); el.appendChild(s);
  $('#toasts').appendChild(el); setTimeout(() => el.remove(), 3600);
  if (AU.ac) { const t = AU.ac.currentTime; [79, 84].forEach((n, i) => AU.piano(n, t + i * .1, .09, 1.2)); }
  const n = S.atlas[cat].length;
  if (cat === 'fish' && n >= ATLAS.fish.items.length) unlock('angler');
  if (cat === 'birds' && n >= ATLAS.birds.items.length) unlock('birder');
  if (Object.keys(ATLAS).reduce((s, k) => s + ((S.atlas[k] || []).length), 0) >= atlasTotal()) unlock('atlas');
  return true;
}
function atlasOnGive(id) { if (ATLAS.herbs.items.some(x => x.id === id)) atlasAdd('herbs', id); }
function atlasCount() { return Object.keys(ATLAS).reduce((s, k) => s + ((S.atlas && S.atlas[k]) || []).length, 0); }

// ---------- icons for fish, birds, stars, cups ----------
function iconMore(id, p, c) {
  if (typeof iconBird === 'function' && iconBird(id, p, c)) return;
  if (typeof iconMore4 === 'function' && iconMore4(id, p, c)) return;
  if (typeof iconMore3 === 'function' && iconMore3(id, p, c)) return;
  const fish = (body, back, belly, fin, extra) => { p(3, 6, 9, 5, body); p(3, 6, 9, 1, back); p(4, 10, 7, 1, belly); p(12, 5, 2, 7, fin); p(14, 4, 1, 9, fin); p(7, 5, 3, 1, fin); p(5, 7, 1, 1, '#1c2638'); if (extra) extra(); };
  switch (id) {
    case 'fish_cod': fish('#a8a26a', '#7f7a4a', '#e8e2c4', '#8c8657', () => { p(7, 8, 1, 1, '#6f6a42'); p(9, 7, 1, 1, '#6f6a42'); p(4, 10, 1, 2, '#7f7a4a'); }); break;
    case 'fish_flounder': ell(c, 8, 8, 6, 4, '#a68a62'); [[5, 7], [8, 6], [10, 9], [7, 10]].forEach(([x, y]) => p(x, y, 1, 1, '#d9784a')); p(12, 6, 3, 5, '#8a6f4a'); p(5, 6, 1, 1, '#1c2638'); p(6, 5, 1, 1, '#1c2638'); break;
    case 'fish_herring': fish('#b8c8d8', '#5f7a98', '#eef4f8', '#8fa6bc'); break;
    case 'fish_perch': fish('#d0473a', '#a8332a', '#f0a080', '#b83a30', () => { for (let i = 0; i < 4; i++) p(6 + i, 4, 1, 2, '#b83a30'); }); break;
    case 'fish_wolffish': fish('#6a7680', '#4a545e', '#a8b2ba', '#59636c', () => { p(3, 9, 2, 1, '#f2f2f2'); p(4, 8, 1, 1, '#f2f2f2'); for (let i = 0; i < 3; i++) p(6 + i * 2, 7, 1, 3, '#4a545e'); }); break;
    case 'fish_monk': ell(c, 7, 9, 5, 4, '#7a5a3a'); p(10, 8, 4, 3, '#6a4a2e'); p(14, 7, 1, 5, '#6a4a2e'); p(3, 10, 6, 1, '#f2e6cc'); p(5, 3, 1, 4, '#c9b48a'); p(4, 2, 3, 2, '#ffe28a'); p(6, 7, 1, 1, '#1c2638'); break;
    case 'fish_trout': fish('#9fb87a', '#6f8a5a', '#f0d0b8', '#7f9a62', () => { p(4, 9, 8, 1, '#e88a8a'); [[6, 7], [9, 6], [10, 8]].forEach(([x, y]) => p(x, y, 1, 1, '#3a4a2a')); }); break;
    case 'fish_crucian': ell(c, 8, 8, 5, 4, '#c9a24a'); p(8, 4, 3, 1, '#a8822e'); p(12, 6, 3, 5, '#a8822e'); p(5, 7, 1, 1, '#1c2638'); p(6, 10, 4, 1, '#e8c87a'); break;
    case 'fish_eel': for (let i = 0; i < 12; i++) p(2 + i, 8 + Math.round(Math.sin(i * .8) * 2), 2, 2, i < 2 ? '#3a4a3a' : '#4f5f45'); p(2, 8, 1, 1, '#e8e2c4'); break;
    case 'bird_gull': p(4, 7, 8, 4, '#f4f4f4'); p(6, 7, 6, 2, '#9aa3ad'); p(10, 4, 3, 3, '#fafafa'); p(13, 5, 2, 1, '#f0b23a'); p(11, 5, 1, 1, '#1c2638'); p(6, 11, 1, 3, '#f0b23a'); p(9, 11, 1, 3, '#f0b23a'); p(3, 8, 2, 2, '#2c2f38'); break;
    case 'bird_tern': p(4, 7, 8, 3, '#f8fbff'); p(9, 4, 4, 3, '#1e2128'); p(13, 5, 2, 1, '#d9372f'); p(2, 7, 3, 1, '#cfd8e0'); p(1, 8, 2, 1, '#cfd8e0'); p(7, 10, 1, 3, '#d9372f'); break;
    case 'bird_puffin': p(5, 5, 6, 9, '#1e2128'); p(6, 8, 4, 6, '#f8fbff'); p(6, 4, 5, 4, '#f8fbff'); p(11, 5, 3, 3, '#f07a2a'); p(11, 6, 3, 1, '#e8c55a'); p(8, 5, 1, 1, '#1c2638'); p(6, 14, 2, 1, '#f07a2a'); p(9, 14, 2, 1, '#f07a2a'); break;
    case 'bird_cormorant': p(7, 6, 3, 8, '#1e2128'); p(2, 6, 5, 3, '#2a2e36'); p(10, 6, 5, 3, '#2a2e36'); p(8, 2, 2, 4, '#1e2128'); p(10, 3, 2, 1, '#e8c55a'); p(7, 14, 1, 1, '#2c2f38'); p(9, 14, 1, 1, '#2c2f38'); break;
    case 'bird_eider': p(3, 8, 10, 4, '#f4f0e6'); p(3, 11, 10, 2, '#1e2128'); p(10, 5, 4, 4, '#f4f0e6'); p(10, 5, 4, 1, '#1e2128'); p(12, 8, 2, 1, '#b8d88a'); p(14, 7, 1, 1, '#c9b48a'); p(2, 13, 12, 1, '#3b98b0'); break;
    case 'bird_sandpiper': p(5, 6, 7, 4, '#9a7a56'); p(6, 9, 5, 1, '#f2e6cc'); p(10, 4, 3, 3, '#9a7a56'); p(13, 5, 2, 1, '#2c2f38'); p(11, 5, 1, 1, '#1c2638'); p(7, 10, 1, 4, '#2c2f38'); p(9, 10, 1, 4, '#2c2f38'); break;
    case 'bird_owl': ell(c, 8, 9, 5, 6, '#8a6a46'); p(4, 3, 2, 3, '#6a4a2e'); p(10, 3, 2, 3, '#6a4a2e'); ell(c, 6, 7, 2, 2, '#f2e6cc'); ell(c, 10, 7, 2, 2, '#f2e6cc'); p(6, 7, 1, 1, '#e8a81a'); p(10, 7, 1, 1, '#e8a81a'); p(8, 9, 1, 2, '#3a2a1a'); p(6, 12, 4, 1, '#6a4a2e'); break;
    case 'cup_matvey': case 'cup_cham': case 'cup_mint': case 'cup_forest': {
      const col = { cup_matvey: '#8a4a2a', cup_cham: '#e8b84a', cup_mint: '#7fbf6a', cup_forest: '#c9605a' }[id];
      p(3, 6, 9, 8, '#f2ece0'); p(3, 6, 9, 1, '#c9c2b0'); p(4, 7, 7, 2, col); p(12, 8, 2, 4, '#f2ece0'); p(13, 9, 1, 2, '#1c2638'); p(2, 14, 11, 1, '#c9c2b0');
      for (let i = 0; i < 3; i++) p(5 + i * 2, 1 + (i % 2), 1, 4, 'rgba(255,255,255,.6)'); break;
    }
    case 'act': p(3, 1, 10, 14, '#f2ece0'); for (let i = 0; i < 5; i++) p(5, 4 + i * 2, 6, 1, '#9a917e'); p(8, 11, 4, 3, 'rgba(200,48,59,.85)'); break;
  }
  if (id.startsWith('star_')) {
    const k = id.slice(5), cst = CONST[k]; p(0, 0, 16, 16, '#101a36');
    if (cst) { c.strokeStyle = 'rgba(170,195,255,.6)'; c.lineWidth = .6; c.beginPath(); cst.e.forEach(([a, b]) => { c.moveTo(1 + cst.s[a][0] * 14, 1 + cst.s[a][1] * 14); c.lineTo(1 + cst.s[b][0] * 14, 1 + cst.s[b][1] * 14); }); c.stroke(); cst.s.forEach(([x, y]) => p(Math.round(1 + x * 14), Math.round(1 + y * 14), 1, 1, '#fff6e0')); }
  }
}
function atlasIcon(cat, id) { return icon(cat === 'sea' ? 'sea_' + id : cat === 'fish' ? 'fish_' + id : cat === 'birds' ? 'bird_' + id : cat === 'stars' ? 'star_' + id.slice(1) : id); }
function silhouette(src) { const [c, x] = mk(16, 16); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#0a1120'; x.fillRect(0, 0, 16, 16); return c; }

// ---------- fishing ----------
const FISH_RULES = {
  cod: { spots: ['pier', 'rocks', 'crags'], w: 5, ok: () => true },
  flounder: { spots: ['pier'], w: 3, ok: h => h >= 8 && h < 18 },
  herring: { spots: ['pier', 'rocks'], w: 4, ok: h => h < 11 },
  perch: { spots: ['rocks', 'crags'], w: 3, ok: () => true },
  wolffish: { spots: ['crags'], w: 2.5, ok: h => h >= 18 || h < 6 },
  monk: { spots: ['crags', 'rocks'], w: 1.6, ok: (h, wx) => ['rain', 'storm', 'fog'].includes(wx) },
  trout: { spots: ['pond'], w: 3, ok: h => h < 10 || h >= 17 },
  crucian: { spots: ['pond'], w: 4, ok: () => true },
  eel: { spots: ['pond'], w: 2.5, ok: h => h >= 20 || h < 5 },
};
const SPOT_NAME = { pier: 'пирс', rocks: 'камни на западе', crags: 'скалы Дальнего леса', pond: 'лесное озеро' };
function catchFish(spot) {
  const h = (S.min % 1440) / 60;
  let pool = Object.entries(FISH_RULES).filter(([, r]) => r.spots.includes(spot || 'pier') && r.ok(h, S.weather));
  if (!pool.length) pool = [['cod', FISH_RULES.cod]];
  // undiscovered species bite a little more often, so the atlas fills up
  const wt = ([id, r]) => r.w * (atlasHas('fish', id) ? 1 : 1.6);
  let roll = Math.random() * pool.reduce((s, x) => s + wt(x), 0), pick = pool[0][0];
  for (const x of pool) { roll -= wt(x); if (roll <= 0) { pick = x[0]; break; } }
  give('fish', 1, true); G.caught = { id: 'fish_' + pick, t: G.time };
  const it = ATLAS.fish.items.find(x => x.id === pick);
  const fresh = atlasAdd('fish', pick);
  if (!fresh) toast('Поймана: ' + it.n.toLowerCase(), 'fish_' + pick);
  stat('species', pick);
}

// ---------- birds in the world ----------
const BIRD_SPOTS = [
  { id: 'gull', on: () => true, at: () => WORLD.colony, r: 96 },
  { id: 'tern', on: () => S.day === 2, at: () => [20 * T, 35.3 * T], r: 84 },
  { id: 'puffin', on: () => S.day >= 4 && S.min >= 360 && S.min < 1200, at: () => [97.8 * T, 27.4 * T], r: 110 },
  { id: 'cormorant', on: () => S.day >= 2 && S.min >= 360 && S.min < 1200, at: () => [11.4 * T, 34.6 * T], r: 84 },
  { id: 'eider', on: () => S.min >= 360 && S.min < 660, at: () => [26.4 * T, 41.2 * T], r: 96 },
  { id: 'sandpiper', on: () => S.min >= 420 && S.min < 1140 && !['rain', 'storm'].includes(S.weather), at: () => [sandX(), 39.35 * T], r: 72 },
  { id: 'owl', on: () => S.min >= 1260 || S.min < 300, at: () => [89 * T + 7, 37.6 * T - 34], r: 90 },
];
function sandX() { return (40 + Math.sin(G.time * .35) * 3) * T; }
function atlasTick() {
  if (MAP.id !== 'island' || G.mode !== 'play') return;
  for (const b of BIRD_SPOTS) { if (atlasHas('birds', b.id) || !b.on()) continue; const [x, y] = b.at(); if (Math.hypot(P.x - x, P.y - y) < b.r * (has('binoculars') ? 1.8 : 1)) atlasAdd('birds', b.id); }
}
function drawPuffin(c, x, y, t, s) {
  x = Math.round(x); y = Math.round(y); const hop = Math.sin(t * 2.3 + s * 5) > .95 ? -1 : 0, f = Math.sin(t * .5 + s) > 0 ? 1 : -1;
  R(c, x - 2, y - 7 + hop, 5, 7, '#1e2128'); R(c, x - 1, y - 5 + hop, 3, 5, '#f8fbff'); R(c, x - 2, y - 9 + hop, 5, 3, '#f8fbff'); R(c, x - 2, y - 10 + hop, 5, 1, '#1e2128');
  R(c, f > 0 ? x + 3 : x - 4, y - 9 + hop, 2, 2, '#f07a2a'); R(c, x - 1, y, 1, 1, '#f07a2a'); R(c, x + 1, y, 1, 1, '#f07a2a');
}
function drawCormorant(c, x, y, t, s) {
  x = Math.round(x); y = Math.round(y); const w = Math.round(Math.sin(t * .8 + s) * 1.5);
  R(c, x - 1, y - 9, 3, 9, '#1e2128'); R(c, x - 6, y - 8 + w, 5, 2, '#2a2e36'); R(c, x + 2, y - 8 + w, 5, 2, '#2a2e36'); R(c, x - 7, y - 7 + w, 2, 2, '#2a2e36'); R(c, x + 6, y - 7 + w, 2, 2, '#2a2e36');
  R(c, x, y - 13, 2, 4, '#1e2128'); R(c, x + 2, y - 12, 2, 1, '#e8c55a');
}
function drawEider(c, x, y, t, s) {
  x = Math.round(x + Math.sin(t * .4 + s) * 6); y = Math.round(y + Math.sin(t * 1.5 + s) * .8);
  R(c, x - 4, y - 3, 8, 3, '#f4f0e6'); R(c, x - 4, y - 1, 8, 1, '#1e2128'); R(c, x + 2, y - 6, 3, 3, '#f4f0e6'); R(c, x + 2, y - 6, 3, 1, '#1e2128'); R(c, x + 5, y - 5, 1, 1, '#c9b48a');
  c.globalAlpha = .5; R(c, x - 7, y + 1, 4, 1, '#e3f4f3'); c.globalAlpha = 1;
}
function drawSandpiper(c, x, y, t) {
  x = Math.round(x); y = Math.round(y); const dir = Math.cos(G.time * .35) > 0 ? 1 : -1, f = Math.floor(t * 14) % 2;
  R(c, x - 2, y - 5, 5, 3, '#9a7a56'); R(c, x - 1, y - 3, 3, 1, '#f2e6cc'); R(c, dir > 0 ? x + 2 : x - 3, y - 7, 2, 2, '#9a7a56'); R(c, dir > 0 ? x + 4 : x - 5, y - 6, 2, 1, '#2c2f38');
  R(c, x - 1 + f, y - 2, 1, 2, '#2c2f38'); R(c, x + 1 - f, y - 2, 1, 2, '#2c2f38');
}
function drawOwl(c, x, y, t) {
  x = Math.round(x); y = Math.round(y); const blink = Math.sin(t * .9) > .96;
  R(c, x - 4, y - 9, 8, 9, '#7a5a3a'); R(c, x - 3, y - 4, 6, 4, '#a5845a'); R(c, x - 4, y - 11, 2, 2, '#5a3e24'); R(c, x + 2, y - 11, 2, 2, '#5a3e24');
  R(c, x - 3, y - 8, 2, 2, blink ? '#5a3e24' : '#ffd23a'); R(c, x + 1, y - 8, 2, 2, blink ? '#5a3e24' : '#ffd23a'); R(c, x, y - 6, 1, 1, '#2c2f38');
  R(c, x - 6, y, 13, 2, '#5a3e24');
}
function buildExtras2() {
  addObj('island', { x: 97.8 * T, y: 28.6 * T, kind: 'birds', on: () => BIRD_SPOTS[2].on(), draw(c, sx, sy) { [[-6, -18, 0], [9, -2, 1], [-1, 6, 2], [16, -12, 3]].forEach(([dx, dy, i]) => drawPuffin(c, sx + dx, sy + dy, G.time, i)); } });
  addObj('island', { x: 11.4 * T, y: 34.6 * T, kind: 'birds', on: () => BIRD_SPOTS[3].on(), draw(c, sx, sy) { drawCormorant(c, sx, sy, G.time, 0); drawCormorant(c, sx - 34, sy - 50, G.time, 2); } });
  addObj('island', { x: 26.4 * T, y: 41.2 * T, kind: 'birds', on: () => BIRD_SPOTS[4].on(), draw(c, sx, sy) { drawEider(c, sx, sy, G.time, 0); drawEider(c, sx - 14, sy + 7, G.time, 1.7); drawEider(c, sx + 10, sy + 12, G.time, 3.1); } });
  addObj('island', { get x() { return sandX(); }, y: 39.35 * T, kind: 'birds', on: () => BIRD_SPOTS[5].on(), draw(c, sx, sy) { drawSandpiper(c, sx, sy, G.time); drawSandpiper(c, sx + 9, sy + 2, G.time + .3); } });
  addObj('island', { x: 89 * T + 7, y: 37.6 * T + 2, kind: 'birds', on: () => BIRD_SPOTS[6].on(), draw(c, sx, sy) { drawOwl(c, sx, sy - 36, G.time); } });
  // new fishing spots
  addObj('island', { x: 84.5 * T, y: 25.4 * T, kind: 'fishspot', r: 18, draw(c, sx, sy) { R(c, sx - 5, sy - 2, 10, 2, '#8a6a42'); R(c, sx - 5, sy, 1, 2, '#5d3e24'); R(c, sx + 4, sy, 1, 2, '#5d3e24'); }, use: { label: () => 'Рыбачить на озере', run: () => startFishing('pond') } });
  addObj('island', { x: 98.4 * T, y: 32.5 * T, kind: 'fishspot', r: 18, draw(c, sx, sy) { drawRock(c, sx - 8, sy + 2, G.sh, true, 5); }, use: { label: () => 'Рыбачить со скал', run: () => startFishing('crags') } });
}

// ---------- documents you can open ----------
let DOC_ON = false;
const DOC = { id: null, after: null, flipped: false };
const DOC_NAMES = { letter: 'Письмо из дома', bottle: 'Записка из бутылки', photo: 'Старая фотография', act: 'Акт проверки' };
TEXTS.act = ['Акт проверки', 'Оценка инспектора Громова. Нажмите, чтобы открыть.'];
function openDoc(id, after) {
  DOC_ON = true; DOC.id = id; DOC.after = after || null; DOC.flipped = false; DOC.page = 0;
  if (!S.read.includes(id)) S.read.push(id);
  renderDoc(); $('#doc').hidden = false; P.reading = 1.5;
}
function closeDoc() { $('#doc').hidden = true; DOC_ON = false; const f = DOC.after; DOC.after = null; if (f) f(); }
function flipDoc() { if (DOC.id !== 'photo') return; DOC.flipped = !DOC.flipped; renderDoc(); }
$('#docX').onclick = closeDoc; $('#docFlip').onclick = flipDoc;
$('#doc').addEventListener('pointerdown', e => { if (e.target.id === 'doc') closeDoc(); });
function hand(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function renderDoc() {
  const body = $('#docBody'); body.innerHTML = ''; $('#docFlip').hidden = DOC.id !== 'photo';
  $('#docFlip').textContent = DOC.flipped ? 'Перевернуть обратно' : 'Перевернуть';
  if (DOC.id === 'letter') {
    const p = hand('div', 'paper lined');
    p.append(hand('p', 'hw', 'Папа, привет!'), hand('p', 'hw', 'Я научилась свистеть, мама говорит — громче чайки. Мы считаем дни, осталось совсем чуть-чуть. Привези ракушку!'), hand('p', 'hw sig', 'Варя'), hand('p', 'hw ps', 'P.S. И маму поцелуй, она скучает больше всех, только не признаётся.'));
    const [c, x] = mk(150, 96); c.className = 'kid'; drawKidPicture(x, 150, 96); p.appendChild(c);
    body.appendChild(p);
  } else if (DOC.id === 'bottle') {
    const p = hand('div', 'paper aged');
    p.append(hand('p', 'hw', 'Тому, кто найдёт.'), hand('p', 'hw', 'Я зажигал этот огонь сорок лет. Если ты смотритель — знай: тебя видят. Каждую ночь кто-то в море смотрит на твой свет и становится спокойнее.'), hand('p', 'hw sig', '— С.'), hand('p', 'hw ps', 'Остров, осень 1999'));
    body.appendChild(p);
  } else if (DOC.id === 'photo') {
    if (!DOC.flipped) {
      const f = hand('div', 'photo'); const [c, x] = mk(132, 92); drawOldPhoto(x, 132, 92); f.appendChild(c); body.appendChild(f);
      body.appendChild(hand('p', 'doccap', 'Молодой смотритель с женой и дочкой у этого самого маяка. Все щурятся от солнца.'));
    } else {
      const f = hand('div', 'photo back'); f.append(hand('p', 'pencil', 'Савелий, Аня и Машенька.'), hand('p', 'pencil', 'Лето 1979.'), hand('p', 'pencil', 'Домой — в субботу.')); body.appendChild(f);
    }
  } else if (DOC.id === 'act') {
    const a = S.flags.act; if (!a) return;
    const p = hand('div', 'paper form');
    p.append(hand('div', 'fhead', 'УПРАВЛЕНИЕ МАЯКОВ · СЕВЕРНЫЙ РАЙОН'), hand('div', 'ftitle', 'Акт плановой проверки № 17'), hand('div', 'fmeta', `Маяк острова · действующий смотритель · день 5-й смены`));
    const tb = document.createElement('table'); const hr = document.createElement('tr'); ['Что проверено', 'Результат', 'Оценка'].forEach(h => hr.appendChild(hand('th', null, h))); tb.appendChild(hr);
    a.rows.forEach(([n, r, s]) => { const tr = document.createElement('tr'); tr.append(hand('td', null, n), hand('td', null, r), hand('td', 'mk m' + s, ['—', '★', '★★'][s])); tb.appendChild(tr); });
    const wrap = hand('div', 'tblwrap'); wrap.appendChild(tb); p.appendChild(wrap);
    if (a.notes.length) { const n = hand('div', 'fnotes'); n.appendChild(hand('b', null, 'Особые отметки: ')); n.appendChild(document.createTextNode(a.notes.join(' '))); p.appendChild(n); }
    const foot = hand('div', 'ffoot'); foot.append(hand('span', 'ftotal', `Итого: ${a.score} из ${a.max}`), hand('span', 'stamp', a.grade.toUpperCase()), hand('span', 'hw sign', 'Громов'));
    p.appendChild(foot); body.appendChild(p);
  }
}
function crayon(x, pts, col, w, seed) { const r = rng(seed); x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; for (let k = 0; k < 2; k++) { x.beginPath(); pts.forEach(([px, py], i) => { const jx = px + (r() - .5) * 1.6, jy = py + (r() - .5) * 1.6; i ? x.lineTo(jx, jy) : x.moveTo(jx, jy); }); x.stroke(); } }
function drawKidPicture(x, w, h) {
  x.imageSmoothingEnabled = true;
  for (let i = 0; i < 6; i++) crayon(x, Array.from({ length: 16 }, (_, k) => [k * 10, h - 18 + i * 3 + Math.sin(k * 1.3 + i) * 2]), '#3b7ea0', 1.6, 10 + i);
  crayon(x, [[30, h - 18], [34, 22], [46, 22], [50, h - 18], [30, h - 18]], '#c8443a', 2, 3);
  for (let i = 0; i < 4; i++) crayon(x, [[33 + i * .5, 32 + i * 12], [47 - i * .5, 32 + i * 12]], '#c8443a', 3, 20 + i);
  crayon(x, [[33, 22], [40, 12], [47, 22]], '#c8443a', 2, 5); x.fillStyle = '#f2c83a'; x.fillRect(36, 15, 8, 6);
  crayon(x, [[46, 17], [96, 6]], '#f2c83a', 2, 6); crayon(x, [[46, 19], [96, 26]], '#f2c83a', 2, 7);
  x.strokeStyle = '#f2a03a'; x.lineWidth = 2; x.beginPath(); x.arc(w - 18, 16, 9, 0, 7); x.stroke(); for (let i = 0; i < 8; i++) crayon(x, [[w - 18 + Math.cos(i) * 12, 16 + Math.sin(i) * 12], [w - 18 + Math.cos(i) * 16, 16 + Math.sin(i) * 16]], '#f2a03a', 1.5, 40 + i);
  const px = 78; x.strokeStyle = '#2c2f38'; x.lineWidth = 1.6; x.beginPath(); x.arc(px, 44, 5, 0, 7); x.stroke();
  crayon(x, [[px, 49], [px, 64]], '#2c2f38', 1.6, 50); crayon(x, [[px - 8, 54], [px + 8, 54]], '#2c2f38', 1.6, 51); crayon(x, [[px, 64], [px - 5, 74]], '#2c2f38', 1.6, 52); crayon(x, [[px, 64], [px + 5, 74]], '#2c2f38', 1.6, 53);
  crayon(x, [[px - 6, 40], [px + 6, 40], [px + 4, 36], [px - 4, 36], [px - 6, 40]], '#c8553d', 2, 54);
  x.fillStyle = '#9b4d6a'; x.font = '9px Monocraft, monospace'; x.fillText('ПАПА', px + 10, 52);
  x.fillStyle = '#c8303b'; x.fillText('♥', px + 18, 66);
}
function drawOldPhoto(x, w, h) {
  const g = x.createLinearGradient(0, 0, 0, h * .55); g.addColorStop(0, '#9ec7e8'); g.addColorStop(1, '#e8f0f4'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  R(x, 0, h * .5, w, h * .14, '#3a7fa8'); R(x, 0, h * .64, w, h * .36, '#7a9a5a');
  for (let i = 0; i < 40; i++) R(x, hash(i, 2) * w, h * .64 + hash(i, 3) * h * .36, 2, 1, '#5f7f45');
  const lx = 24, base = Math.round(h * .66);
  for (let yy = 8; yy < base; yy++) { const k = (yy - 8) / (base - 8), hw = Math.round(5 + k * 4), band = Math.floor((yy - 8) / 9) % 2; R(x, lx - hw, yy, hw * 2, 1, band ? '#c8443a' : '#f1ece2'); }
  R(x, lx - 6, 3, 12, 6, '#ffe8a0'); R(x, lx - 7, 2, 14, 1, '#2c2f38'); R(x, lx - 4, 0, 8, 2, '#c8443a');
  R(x, lx + 10, base - 16, 26, 16, '#d6cdbb'); R(x, lx + 8, base - 19, 30, 3, '#6c584a'); R(x, lx + 20, base - 10, 5, 10, '#6b4429');
  const sav = { skin: '#e8b98f', hair: '#3a2a1a', coat: '#1f2d4d', coat2: '#17223b', pants: '#2d3442', hat: 'peaked', hatC: '#2f3238', beard: '#4a3426' };
  const anna = { skin: '#f1cba7', hair: '#c9a24a', coat: '#d9c8e8', coat2: '#b9a8c8', pants: '#5a4a6a', long: true };
  const masha = { skin: '#f6d2b5', hair: '#8a5a32', coat: '#f2e6cc', coat2: '#d9c8a8', pants: '#c8443a', small: true, long: true };
  drawPerson(x, 76, base + 18, sav, { dir: 0, t: 1 }); drawPerson(x, 92, base + 18, anna, { dir: 0, t: 1 }); drawPerson(x, 106, base + 19, masha, { dir: 0, t: 1 });
  disc(x, 104, 16, 6, '#fff6c0');
  const im = x.getImageData(0, 0, w, h), d = im.data;
  for (let i = 0; i < d.length; i += 4) {
    const px = (i / 4) % w, py = Math.floor(i / 4 / w), gr = clamp((d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11 - 128) * 1.35 + 112, 0, 255);
    const v = 1 - Math.pow(Math.hypot(px / w - .5, py / h - .5) * 1.2, 2) * .55, n = (hash(px, py) - .5) * 22;
    d[i] = clamp((gr * 1.02 + 34) * v + n, 0, 255); d[i + 1] = clamp((gr * .9 + 18) * v + n, 0, 255); d[i + 2] = clamp((gr * .66 + 4) * v + n, 0, 255);
  }
  x.putImageData(im, 0, 0);
  x.fillStyle = 'rgba(255,250,235,.35)'; x.fillRect(w - 18, 0, 2, h); x.fillRect(0, h * .3, w, 1);
}

// ---------- the living cat ----------
const CATW = 34; // walking speed, px per second
const HOUSE_DOOR = () => ({ m: 'house', x: 9 * T, y: 10.9 * T });
const BED_FRONT = () => ({ m: 'house', x: 15.4 * T, y: 5.35 * T });
const ISLE_DOOR = () => ({ m: 'island', x: WORLD.lh.x, y: WORLD.lh.y + 6 });
function catNewDay() {
  CAT.path = []; CAT.jump = null; CAT.z = 0;
  if (catKept()) { CAT.phase = 'bed'; CAT.map = 'house'; CAT.x = 15.4 * T; CAT.y = 4.75 * T; CAT.z = 15; CAT.st = 'sleep'; CAT.dir = 2; }
  else { CAT.phase = 'door'; CAT.map = 'island'; }
}
function catGo(points, after) { CAT.phase = 'path'; CAT.path = points.slice(); CAT.after = after || null; CAT.st = 'walk'; }
function catJump(to, z1, after) { CAT.phase = 'jump'; CAT.jump = { fx: CAT.x, fy: CAT.y, fz: CAT.z, tx: to.x, ty: to.y, tz: z1, t: 0, after }; CAT.st = 'walk'; }
function catGoHome() {
  const pts = [];
  if (CAT.map === 'island') pts.push({ m: 'island', x: WORLD.lh.x + (CAT.x < WORLD.lh.x ? -6 : 6), y: WORLD.lh.y + 24 }, ISLE_DOOR());
  pts.push(HOUSE_DOOR(), { m: 'house', x: 12 * T, y: 9.4 * T }, BED_FRONT());
  catGo(pts, () => catJump({ x: 15.4 * T, y: 4.75 * T }, 15, () => {
    CAT.phase = 'circle'; CAT.t = 1.4;
    if (!G.trig.catBed) { G.trig.catBed = 1; if (MAP.id === 'house') toast(catName() + ' запрыгнул на кровать и свернулся клубком'); else toast(catName() + ' ушёл спать на вашу кровать'); }
  }));
}
function catWake() {
  CAT.phase = 'wake'; CAT.st = 'lick'; CAT.t = 1.6;
}
function catLeaveHouse() {
  catJump(BED_FRONT(), 0, () => catGo([{ m: 'house', x: 12 * T, y: 9.4 * T }, HOUSE_DOOR(), ISLE_DOOR(), { m: 'island', x: WORLD.lh.x + 10, y: WORLD.lh.y + 28 }], () => { CAT.phase = 'wander'; CAT.st = 'sit'; CAT.t = 1.5; }));
}
function catStep(tx, ty, sp, dt) {
  const dx = tx - CAT.x, dy = ty - CAT.y, d = Math.hypot(dx, dy);
  if (d < 1.5) { CAT.x = tx; CAT.y = ty; return true; }
  const s = Math.min(d, sp * dt); CAT.x += dx / d * s; CAT.y += dy / d * s;
  CAT.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
  return false;
}
function updateCat(dt) {
  if (S.day < 3 || S.flags.cat === 'gone') return;
  if (!catKept()) { CAT.map = 'island'; CAT.x = 34.8 * T; CAT.y = 14.8 * T; CAT.z = 0; CAT.dir = 0; CAT.t -= dt; if (CAT.t < 0) { CAT.st = CAT.st === 'sit' ? 'lick' : 'sit'; CAT.t = 2 + Math.random() * 3; } return; }
  if (!CAT.phase || CAT.phase === 'door') CAT.phase = 'wander';
  const m = S.min;
  // schedule
  if (S.day === 7 && m >= 990 && CAT.phase !== 'follow') { CAT.phase = 'follow'; CAT.z = 0; CAT.path = []; if (!G.trig.catFollow) { G.trig.catFollow = 1; toast(catName() + ' понял, что вы уезжаете, и не отходит ни на шаг'); } }
  if (S.day !== 7 && m >= 990 && CAT.phase === 'wander') catGoHome();
  if (CAT.phase === 'bed' && m >= 480 && m < 990) catWake();
  CAT.t -= dt;
  switch (CAT.phase) {
    case 'bed': CAT.map = 'house'; CAT.x = 15.4 * T; CAT.y = 4.75 * T; CAT.z = 15; CAT.st = 'sleep'; break;
    case 'circle': CAT.st = 'walk'; CAT.dir = Math.floor(CAT.t * 5) % 2 ? 1 : 2; if (CAT.t < 0) CAT.phase = 'bed'; break;
    case 'wake': CAT.st = 'lick'; if (CAT.t < 0) catLeaveHouse(); break;
    case 'jump': {
      const j = CAT.jump; j.t += dt / .45; const k = Math.min(1, j.t);
      CAT.x = lerp(j.fx, j.tx, k); CAT.y = lerp(j.fy, j.ty, k); CAT.z = lerp(j.fz, j.tz, k) + Math.sin(Math.PI * k) * 9;
      CAT.dir = j.tx > j.fx + 1 ? 2 : j.tx < j.fx - 1 ? 1 : (j.tz > j.fz ? 3 : 0);
      if (k >= 1) { CAT.z = j.tz; CAT.jump = null; j.after && j.after(); }
      break;
    }
    case 'path': {
      const p = CAT.path[0]; if (!p) { const f = CAT.after; CAT.after = null; CAT.phase = 'wander'; f && f(); break; }
      if (p.m !== CAT.map) { CAT.map = p.m; CAT.x = p.x; CAT.y = p.y; CAT.path.shift(); break; }
      CAT.st = 'walk'; if (catStep(p.x, p.y, CATW, dt)) CAT.path.shift();
      break;
    }
    case 'follow': {
      if (CAT.map !== MAP.id) { CAT.map = MAP.id; const [dx, dy] = DIRV[P.dir]; CAT.x = P.x - dx * 16; CAT.y = P.y - dy * 16 + 2; }
      const [dx, dy] = DIRV[P.dir], tx = P.x - dx * 16 - dy * 6, ty = P.y - dy * 12 + 3, d = Math.hypot(tx - CAT.x, ty - CAT.y);
      if (d > 4) { CAT.st = 'walk'; catStep(tx, ty, Math.min(120, 30 + d * 1.6), dt); } else if (CAT.st === 'walk') { CAT.st = 'sit'; CAT.dir = P.dir; }
      break;
    }
    case 'wander':
    default: {
      CAT.map = 'island'; CAT.z = 0;
      if (CAT.st === 'walk') {
        const dx = CAT.tx - CAT.x, dy = CAT.ty - CAT.y, d = Math.hypot(dx, dy);
        if (d < 2 || CAT.t < 0) { CAT.st = ['sit', 'sit', 'lick', 'sleep'][Math.random() * 4 | 0]; CAT.t = CAT.st === 'sleep' ? 7 + Math.random() * 6 : 2.5 + Math.random() * 4; break; }
        const sp = 22 * dt, nx = CAT.x + dx / d * sp, ny = CAT.y + dy / d * sp;
        if (!solidAt(MAPS.island, nx, ny)) { CAT.x = nx; CAT.y = ny; } else CAT.t = -1;
        CAT.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
      } else if (CAT.t < 0) {
        let tx = CAT.x, ty = CAT.y;
        for (let k = 0; k < 12; k++) {
          if (MAP.id === 'island' && Math.hypot(P.x - CAT.x, P.y - CAT.y) < 170 && Math.random() < .45) { tx = P.x + (Math.random() - .5) * 40; ty = P.y + 8 + Math.random() * 14; }
          else { tx = (25 + Math.random() * 18) * T; ty = (14 + Math.random() * 16) * T; }
          if (!solidAt(MAPS.island, tx, ty)) break;
        }
        CAT.tx = tx; CAT.ty = ty; CAT.st = 'walk'; CAT.t = 10;
      }
    }
  }
}
function drawCatSilhouette(c, x, y, col, t) { R(c, x - 2, y - 4, 5, 4, col); R(c, x - 2, y - 7, 4, 3, col); R(c, x - 2, y - 8, 1, 1, col); R(c, x + 1, y - 8, 1, 1, col); R(c, x + 3, y - 2 + Math.round(Math.sin(t * 2)), 1, 3, col); }

// ---------- inspector ----------
const QUIZ = [
  ['Во сколько зажигают огонь в ясную погоду?', ['В пять вечера', 'В восемь вечера', 'На закате, как придётся'], 0],
  ['Что нужно механизму вращения, чтобы он не скрипел?', ['Новые шестерни каждую неделю', 'Свежее масло', 'Ничего, он вечный'], 1],
  ['В шторм пропало электричество. Что делает смотритель?', ['Ждёт утра, ночью всё равно никто не плавает', 'Запускает генератор в сарае и снова зажигает огонь', 'Ставит свечи в окна'], 1],
];
function inspectorVisit() {
  S.flags.metGromov = 1; S.q.chick = 1;
  const L = t => ['Громов', t];
  say([L('Инспектор Громов, управление маяков. Плановая проверка.'), L('Журнал, механизм, линза, порядок — всё посмотрю. А для начала пара вопросов. Смотритель должен знать свой маяк.')], () => quizStep(0, 0));
}
function quizStep(i, right) {
  if (i >= QUIZ.length) return finishInspection(right);
  const [q, opts, ok] = QUIZ[i];
  MENU.locked = true;
  MENU.show(`Вопрос ${i + 1} из ${QUIZ.length}. ${q}`, opts.map((o, k) => ({ label: o, run: () => { MENU.locked = false; const good = k === ok; say([['Громов', good ? ['Верно.', 'Правильно.', 'Так и есть.'][i] : 'Нет. ' + ['В пять вечера, смотритель. По инструкции.', 'Свежее масло, смотритель. Старое чернеет, и механизм начинает скрипеть.', 'Генератор, смотритель. Маяк не ждёт утра: в шторм свет нужнее всего.'][i]]], () => quizStep(i + 1, right + (good ? 1 : 0))); } })));
}
function buildAct(quiz) {
  const D = k => (S.stats.done || []).includes(k), cnt = ks => ks.filter(D).length;
  const rows = [];
  const lamps = cnt(['1:lamp', '2:lamp', '3:lamp', '4:lamp']);
  rows.push(['Огонь маяка', `горел ${lamps} ноч${lamps === 1 ? 'ь' : lamps >= 2 && lamps <= 4 ? 'и' : 'ей'} из 4`, lamps === 4 ? 2 : lamps >= 2 ? 1 : 0]);
  const lens = cnt(['1:lens', '5:lens']);
  rows.push(['Оптика', lens === 2 ? 'линза чистая, без разводов' : lens === 1 ? 'на линзе разводы' : 'линза мутная', lens]);
  const mech = cnt(['2:oil', '3:mech']);
  rows.push(['Механизм вращения', mech === 2 ? 'масло свежее, ход ровный' : mech === 1 ? 'проверен не полностью' : 'масло старое, скрипит', mech]);
  const jr = S.journal.filter(j => j.d <= 4).length;
  rows.push(['Журнал смотрителя', `записей: ${jr} из 4`, jr === 4 ? 2 : jr >= 2 ? 1 : 0]);
  const home = cnt(['1:clean', '1:wood', '2:dinner', '3:wood']);
  rows.push(['Порядок и хозяйство', `выполнено ${home} из 4 поручений`, home === 4 ? 2 : home >= 2 ? 1 : 0]);
  const storm = D('3:gen') ? 2 : D('3:lamp') ? 1 : 0;
  rows.push(['Действия в шторм', storm === 2 ? 'свет восстановлен, огонь зажжён снова' : storm === 1 ? 'огонь горел до аварии' : 'огонь в шторм не горел', storm]);
  const pier = cnt(['4:pier', '4:ladder']);
  rows.push(['Пирс и причал', pier === 2 ? 'чисто, лестница исправна' : pier === 1 ? 'частично приведён в порядок' : 'мусор после шторма', pier]);
  rows.push(['Знание маяка', `ответов: ${quiz} из 3`, quiz === 3 ? 2 : quiz === 2 ? 1 : 0]);
  const score = rows.reduce((s, r) => s + r[2], 0), max = rows.length * 2;
  const grade = score >= max - 2 ? 'Отлично' : score >= max * .62 ? 'Хорошо' : score >= max * .37 ? 'Удовлетворительно' : 'Есть замечания';
  const notes = [];
  if (catKept()) notes.push(`На маяке проживает кот по кличке ${catName()}. Грызунов не обнаружено.`);
  const ac = atlasCount(); if (ac >= 5) notes.push(`Смотритель ведёт наблюдения за природой острова (${ac} записей).`);
  if ((S.stats.crafted || []).length) notes.push('Мастерская в сарае в рабочем состоянии.');
  return { rows, score, max, grade, notes };
}
function finishInspection(quiz) {
  const act = buildAct(quiz); S.flags.act = act; give('act', 1, true);
  if (act.grade === 'Отлично') unlock('inspector');
  const L = t => ['Громов', t];
  openDoc('act', () => say([
    L({ 'Отлично': 'Образцовый маяк. Так и запишу: образцовый. Савелий бы одобрил.', 'Хорошо': 'Хороший маяк. Мелочи есть, но огонь горит, а это главное.', 'Удовлетворительно': 'Удовлетворительно. Работы хватает, но смена-то последняя. Главное — чтобы огонь горел.', 'Есть замечания': 'Замечаний много, смотритель. Но я понимаю: последняя неделя. Огонь хотя бы не забывайте.' }[act.grade]),
    L('Акт оставлю вам. На память.'),
    L('И вот ещё что, не по службе. В тумане чайка птенца потеряла, пищит где-то в лесу на западе. Не моё дело, конечно, но...'),
  ], () => UI.tasks()));
}

// ---------- readable recipe book & atlas tab ----------
const WHERE = { shell: 'пляж, у самой воды', seaglass: 'пляжи', driftwood: 'пляжи', gullfeather: 'скалы с чайками на востоке', rope: 'моток в сарае, раз в день', melissa: 'леса', chamomile: 'лесные поляны', mint: 'леса', thyme: 'леса', fireweed: 'леса, чаще Дальний', tea: 'подарок Матвея', fish: 'рыбалка' };
const TEA_ICON = { t_matvey: 'cup_matvey', t_cham: 'cup_cham', t_mint: 'cup_mint', t_forest: 'cup_forest' };
function cv16(id, size, sil) { const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.style.width = c.style.height = size + 'px'; const src = typeof id === 'string' ? icon(id) : id; c.getContext('2d').drawImage(sil ? silhouette(src) : src, 0, 0); return c; }
function recipeCard(r, resIcon, place) {
  const ok = canMake(r.need), card = hand('div', 'rcard' + (ok ? ' ok' : ''));
  const res = hand('div', 'rres'); res.appendChild(cv16(resIcon, 44)); card.appendChild(res);
  const info = hand('div', 'rinfo'); info.append(hand('b', null, r.n), hand('span', 'rfor', r.who || place));
  const ings = hand('div', 'ings');
  Object.entries(r.need).forEach(([k, n]) => { const have = Math.min(S.inv[k] || 0, n); const chip = hand('span', 'ing' + (have >= n ? ' have' : '')); chip.title = ITEMS[k].n + ' — ' + (WHERE[k] || ''); chip.append(cv16(k, 22), hand('em', null, ITEMS[k].n), hand('i', null, `${have}/${n}`)); ings.appendChild(chip); });
  info.appendChild(ings); card.appendChild(info);
  card.appendChild(hand('span', 'rstate', r.done && r.done() ? 'уже сделано' : ok ? 'можно сделать' : 'не хватает'));
  return card;
}
function recipesTab(body) {
  const sect = (t, sub) => { body.appendChild(hand('div', 'sect', t)); if (sub) body.appendChild(hand('div', 'rsub', sub)); };
  sect('Верстак · в сарае на востоке', 'Подойдите к верстаку и выберите вещь. Подарок вручается сам, когда заговорите с человеком.');
  const g1 = hand('div', 'rgrid'); RECIPES.forEach(r => g1.appendChild(recipeCard(r, r.id))); body.appendChild(g1);
  sect('Чай · на печи в маяке', 'Подойдите к печи на кухне и выберите чай.');
  const g2 = hand('div', 'rgrid'); TEAS.forEach(r => g2.appendChild(recipeCard(r, TEA_ICON[r.id], 'чай для себя'))); body.appendChild(g2);
  sect('Где искать материалы');
  const wg = hand('div', 'wgrid');
  ['driftwood', 'seaglass', 'shell', 'gullfeather', 'rope', 'melissa', 'chamomile', 'mint', 'thyme', 'fireweed', 'resin', 'nets', 'rarefeather'].forEach(k => { const w = hand('div', 'wcell'); w.append(cv16(k, 26)); const t = hand('div'); t.append(hand('b', null, ITEMS[k].n), hand('span', null, WHERE[k])); w.appendChild(t); wg.appendChild(w); });
  body.appendChild(wg);
}
function atlasTab(body) {
  body.appendChild(hand('div', 'sect', `Атлас острова · найдено ${atlasCount()} из ${atlasTotal()}`));
  body.appendChild(hand('div', 'rsub', 'Атлас заполняется сам: ловите рыбу в разных местах, подходите ближе к птицам, собирайте травы, смотрите ночью в подзорную трубу.'));
  for (const [cat, c] of Object.entries(ATLAS)) {
    const have = (S.atlas && S.atlas[cat]) || [];
    body.appendChild(hand('div', 'asect', `${c.title} · ${have.length} из ${c.items.length}`));
    const g = hand('div', 'agrid');
    c.items.forEach(it => { const got = have.includes(it.id), card = hand('div', 'acard' + (got ? ' got' : '')); card.appendChild(cv16(atlasIcon(cat, it.id), 40, !got)); const t = hand('div'); t.append(hand('b', null, got ? it.n : '???'), hand('span', null, got ? it.d : 'Где искать: ' + it.hint)); card.appendChild(t); g.appendChild(card); });
    body.appendChild(g);
  }
}
