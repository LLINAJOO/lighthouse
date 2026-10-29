"use strict";
// ===== Memories, tips and souvenir hints =====
// ---------- memories (they feed the evening diary, letters and the ending) ----------
function memo(key, text) {
  const f = S.flags; if (f['m_' + key]) return; f['m_' + key] = S.day;
  f.memo = f.memo || {}; (f.memo[S.day] = f.memo[S.day] || []).push(text);
}
const memosOf = d => ((S.flags.memo || {})[d] || []);
// everything remembered that day, including what happened after the entry was written (aurora, whales...)
const dayMemos = j => { const all = memosOf(j.d); return all.length >= (j.m || []).length ? all : (j.m || []); };
const WATCH = [
  ['cat', () => S.flags.cat === 'kept' && S.flags.catName, () => `Рыжий кот остался у меня. Назвал его ${catName()}.`],
  ['catgone', () => S.flags.cat === 'gone', () => 'Не оставил рыжего кота. Надеюсь, он нашёл себе дом.'],
  ['fed', () => catKept() && S.flags.catFed === S.day, () => `${catName()} съел рыбу и мурчал на всю кухню.`, true],
  ['uha', () => S.q.uha === 2, () => 'Сварил Матвею уху. Хвалил!'],
  ['sonya', () => S.flags.metSonya, () => 'Познакомился с Соней, внучкой Матвея. Она рисует море.'],
  ['shells', () => (S.q.shells | 0) >= 2, () => 'Отдал Соне пять ракушек — прижимать бумагу от ветра.'],
  ['painting', () => S.souv.includes('painting'), () => 'Соня подарила картину: мой маяк ночью, с огнём.'],
  ['chick', () => S.q.chick === 2, () => 'Отнёс птенца к чайкам. Они подарили перламутровую ракушку!'],
  ['bottle', () => S.flags.crateOpened, () => 'Шторм выбросил ящик, а в нём — записка Савелия в бутылке.'],
  ['photo', () => S.flags.dug, () => 'Откопал у сосны на утёсе коробку со старой фотографией.'],
  ['whales', () => S.flags.whalesSeen, () => 'Ночью у смотровой пели киты. Я слышал их сам.'],
  ['g_matvey', () => S.flags.gave_matvey, () => 'Подарил Матвею поплавок-талисман.'],
  ['g_sonya', () => S.flags.gave_sonya, () => 'Подарил Соне ожерелье из ракушек.'],
  ['g_lida', () => S.flags.gave_lida, () => 'Подарил Лиде травяное саше.'],
  ['boat4', () => (S.flags.boat | 0) >= 4, () => '«Надежда» снова на воде. Сам её спустил.'],
  ['boat5', () => (S.flags.boat | 0) >= 5, () => 'На «Надежде» теперь парус.'],
  ['seals', () => MAP && MAP.id === 'seals', () => 'Доплыл до Тюленьего камня. Тюлени смотрели на меня как на чудака.'],
  ['cliffs', () => MAP && MAP.id === 'cliffs', () => 'Побывал на Птичьем базаре. Там шумнее, чем на вокзале.'],
  ['nyura', () => S.flags.ny, () => 'Познакомился с Нюрой, орнитологом.'],
  ['nyura2', () => S.flags.ny === 2, () => 'Нюра подарила мне свой бинокль.'],
  ['pup', () => S.flags.pupFriend, () => 'Освободил тюленёнка из сети. Теперь он плавает за мной.'],
  ['act', () => S.flags.act, () => 'Инспектор Громов выставил оценку маяку: «' + (S.flags.act.grade || 'хорошо').toLowerCase() + '».'],
  ['tea', () => (S.stats.teas || []).length, () => 'Заварил чай на своих травах. Дом пахнет летом.'],
  ['craft', () => (S.stats.crafted || []).length, () => 'Смастерил кое-что на верстаке. Руки помнят.'],
  ['gen', () => (S.stats.done || []).includes('3:gen'), () => 'Шторм оборвал свет, но я запустил генератор, и огонь снова загорелся.'],
];
function soulWatch() {
  for (const [k, cond, txt, daily] of WATCH) { const key = daily ? k + S.day : k; if (!S.flags['m_' + key] && cond()) memo(key, txt()); }
  if (S.day === 3 && (S.stats.done || []).includes('3:gen') && !S.flags.genAt) S.flags.genAt = S.min;
}

// ---------- just-in-time tips ----------
const TIPQ = []; let tipT = 0;
function tip(id, text) {
  if (S.flags['tip_' + id]) return; S.flags['tip_' + id] = 1; TIPQ.push(text); if (!tipT) showTip();
}
function showTip() {
  const box = $('#tipbox'); const t = TIPQ.shift(); if (!t) { box.classList.add('off'); tipT = 0; return; }
  $('#tipT').textContent = t; box.classList.remove('off'); tipT = 9 + t.length / 30;
}
function tipTick(dt) {
  const modal = DOC_ON || MENU.open || !$('#dialog').hidden || !$('#panel').hidden || MORSE_ON || SCOPE_ON || COUNT_ON || !!G.quiet;
  $('#tipbox').style.visibility = modal ? 'hidden' : '';
  if (tipT > 0 && !modal) { tipT -= dt; if (tipT <= 0) { tipT = 0; showTip(); } }
  if (G.mode !== 'play') return;
  const tl = G.target && G.target.label || '';
  if (tl) tip('act', isTouch ? 'Жёлтая стрелка над предметом значит: с ним можно что-то сделать. Нажмите кнопку A.' : 'Жёлтая стрелка над предметом значит: с ним можно что-то сделать. Нажмите E или пробел.');
  if (tl.startsWith('Сорвать')) tip('herb', 'Травы нужны для чая. Заваривают на печи в доме, рецепты — в сумке, вкладка «Рецепты».');
  if (tl.startsWith('Посидеть')) tip('bench', 'На скамейке время идёт быстрее. А на закате с неё очень красиво.');
  if (tl.startsWith('Поговорить')) tip('talk', 'С гостями острова можно говорить каждый день: они рассказывают новое и иногда просят о помощи.');
  if (MAP && MAP.id === 'shed') tip('shed', 'Это верстак: из находок можно смастерить подарки. Что для чего нужно — в сумке, вкладка «Рецепты».');
  if (S.min >= 1020 && S.day <= 2) tip('evening', 'Вечер: зажгите огонь в фонарной, потом сделайте запись в дневнике за столом в спальне — и спать.');
}

// ---------- souvenirs: label, hints ----------
const SOUV_IDS = ['feather', 'letter', 'bottle', 'photo', 'pearl', 'painting', 'compass', 'figurine', 'bell'];
const SOUV_HINT = {
  feather: 'Крачки прилетают на западный пляж на 2-й день. Посмотрите под ногами.',
  letter: 'Приходит с почтой. Родные пишут!',
  bottle: 'После шторма море выносит на берег всякое. Загляните к старой лодке.',
  photo: 'Её найдёт тот, у кого есть старая карта с крестиком.',
  pearl: 'Чайки умеют благодарить. Особенно если кто-то помог их птенцу.',
  painting: 'Соне для работы нужны ракушки. Художники не забывают помощь.',
  compass: 'Капитан «Северянки» придёт на 6-й день.',
  figurine: 'Матвей мастерит что-то из плавника. К прощанию.',
  bell: 'На Тюленьем камне есть старая шхуна. До неё можно дойти в отлив.',
};
function souvSection(body) {
  const h = document.createElement('div'); h.className = 'sect'; h.textContent = `Сувениры · ${S.souv.length} из ${SOUV_TOTAL}`;
  const row = document.createElement('div'); row.className = 'souvrow';
  const hint = document.createElement('div'); hint.id = 'souvHint'; hint.textContent = 'Нажмите на ячейку, чтобы узнать, что это и где искать.';
  SOUV_IDS.forEach(id => {
    const b = document.createElement('button'); b.type = 'button'; const got = S.souv.includes(id);
    if (got) { b.className = 'got'; const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.getContext('2d').drawImage(icon(id), 0, 0); b.appendChild(c); b.setAttribute('aria-label', ITEMS[id].n); }
    else { b.textContent = '?'; b.setAttribute('aria-label', 'Не найден'); }
    b.onclick = () => { row.querySelectorAll('button').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); hint.textContent = got ? ITEMS[id].n + ' — ' + ITEMS[id].d : 'Ещё не найдено. ' + SOUV_HINT[id]; };
    row.appendChild(b);
  });
  body.append(h, row, hint);
}
