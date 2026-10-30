"use strict";
// ===================== WORLD: state, tasks, objects, NPCs, dialogue content =====================
const HERO = 'Смотритель';
const S = { day: 1, min: 360, inv: {}, souv: [], journal: [], read: [], flags: {}, done: 0, total: 0, tasks: [], q: {}, lampLit: false, power: true, weather: 'sunny', placed: {}, stats: {}, atlas: {} };
const MAPS = {};
let MAP = null;
const P = { x: 0, y: 0, dir: 0, frame: 0, animT: 0, moving: false, run: false, act: null, fish: null, carry: null };

const TASK = {
  lens: { t: 'Почистить линзу в фонарной' },
  clean: { t: 'Подмести в доме', n: 3 },
  wood: { t: 'Принести дрова из леса к печи', n: 3 },
  lamp: { t: 'Зажечь маяк (с 17:00)' },
  journal: { t: 'Запись в дневнике (вечером)' },
  oil: { t: 'Заменить масло в механизме' },
  fish: { t: 'Поймать рыбу' },
  dinner: { t: 'Приготовить ужин на печи' },
  mech: { t: 'Проверить механизм вращения' },
  gen: { t: 'Запустить генератор в сарае' },
  pier: { t: 'Очистить пирс после шторма', n: 4 },
  ladder: { t: 'Починить лестницу у пирса' },
  ship: { t: 'Встретить корабль у пирса' },
  unload: { t: 'Перенести припасы в кладовую', n: 3 },
  bye: { t: 'Попрощаться с жителями', n: 3 },
  pierEnd: { t: 'Спуститься к катеру на пирс' },
};
const DAYS = [null,
  { w: 'sunny', sub: 'Последняя неделя на маяке', tasks: ['lens', 'clean', 'wood', 'lamp', 'journal'] },
  { w: 'windy', sub: 'Северный ветер', tasks: ['oil', 'fish', 'dinner', 'lamp', 'journal'] },
  { w: 'rain', sub: 'Барометр падает', tasks: ['mech', 'wood', 'lamp', 'journal'] },
  { w: 'clear', sub: 'После шторма', tasks: ['pier', 'ladder', 'lamp', 'journal'] },
  { w: 'fog', sub: 'Туман', tasks: ['lens', 'fish', 'lamp', 'journal'] },
  { w: 'cloudy', sub: 'Корабль с материка', tasks: ['ship', 'unload', 'wood', 'lamp', 'journal'] },
  { w: 'sunset', sub: 'Последний день', tasks: ['lens', 'bye', 'lamp', 'journal', 'pierEnd'] },
];
const WX_NAME = { sunny: 'ясно', windy: 'ветрено', rain: 'дождь', storm: 'гроза', clear: 'свежо', fog: 'туман', cloudy: 'пасмурно', sunset: 'ясно' };
const ITEMS = {
  rod: { n: 'Удочка', d: 'Старая бамбуковая удочка. Рыбачить — на краю пирса или с камня на западе.' },
  rag: { n: 'Тряпка для линзы', d: 'Мягкая замша. Только для линзы, и никак иначе.' },
  lantern: { n: 'Фонарь', d: 'Ночью светит сам. Смотрителю без фонаря нельзя.' },
  keys: { n: 'Ключи от маяка', d: 'Тяжёлая связка. Один ключ непонятно от чего — так было и у прежнего смотрителя.' },
  oilcan: { n: 'Маслёнка', d: 'Полная. Для механизма вращения в фонарной.' },
  wrench: { n: 'Гаечный ключ', d: 'Нашёлся в сарае. Ржавый, но крепкий.' },
  wood: { n: 'Дрова', d: 'Сухие ветки из леса. Сложить у печи на кухне.' },
  fish: { n: 'Рыба', d: 'Свежий улов. Из рыбы выйдет хорошая уха, а кот будет счастлив. Какие виды уже пойманы — в атласе.' },
  berries: { n: 'Брусника', d: 'Кислая, холодная, с лесных кустов.', use: 'Съесть' },
  tea: { n: 'Чай Матвея', d: 'Заваривается на печи вечером.' },
  shell: { n: 'Ракушка', d: 'Обычная ракушка с пляжа. Соне такие пригодятся.' },
  uha: { n: 'Уха', d: 'Горячий котелок. Для Матвея.' },
  map: { n: 'Старая карта', d: 'Карта острова. Крестик стоит на северо-западном утёсе.', use: 'Посмотреть' },
  feather: { n: 'Перо крачки', d: 'Белое, лёгкое. Полярные крачки летят с одного края света на другой.', souv: true },
  letter: { n: 'Письмо из дома', d: 'От Вари и Наташи. Перечитывал уже трижды.', souv: true, use: 'Прочитать' },
  bottle: { n: 'Бутылка с посланием', d: 'Выброшена штормом. Внутри — записка прежнего смотрителя.', souv: true, use: 'Прочитать' },
  photo: { n: 'Старая фотография', d: 'Савелий с семьёй у маяка. 1979 год.', souv: true, use: 'Рассмотреть' },
  pearl: { n: 'Перламутровая ракушка', d: 'Подарок чаек за спасённого птенца. Переливается, как бензин в луже, только красиво.', souv: true },
  painting: { n: 'Картина Сони', d: 'Маяк ночью, с огнём. Краска ещё пахнет.', souv: true },
  compass: { n: 'Компас капитана', d: 'Латунный, тяжёлый. Капитан Белов сказал: пусть указывает домой.', souv: true },
  figurine: { n: 'Маяк из плавника', d: 'Матвей вырезал ножом. Маленький, кривоватый, лучший.', souv: true },
};
Object.assign(ITEMS, {
  melissa: { n: 'Мелисса', d: 'Лимонный запах. Для чая и для саше.' },
  chamomile: { n: 'Ромашка', d: 'Растёт на полянах. Из двух соцветий выйдет ромашковый чай.' },
  mint: { n: 'Мята', d: 'Холодит даже на ощупь. С мелиссой — отличный чай.' },
  thyme: { n: 'Чабрец', d: 'Низкий лиловый кустик. Пахнет горами и дымом.' },
  fireweed: { n: 'Иван-чай', d: 'Высокий, с розовыми свечками. Главное в лесном сборе.' },
  driftwood: { n: 'Плавник', d: 'Гладкая, выбеленная морем деревяшка. Для поделок на верстаке.' },
  seaglass: { n: 'Морское стекло', d: 'Осколок бутылки, обкатанный волнами до матового блеска.' },
  gullfeather: { n: 'Перо чайки', d: 'Серо-белое перо со скал на востоке.' },
  rope: { n: 'Верёвка', d: 'Отрезана от мотка в сарае.' },
  gift_matvey: { n: 'Поплавок-талисман', d: 'Подарок для Матвея. Отдайте при встрече.' },
  gift_sonya: { n: 'Ожерелье из ракушек', d: 'Подарок для Сони. Отдайте при встрече.' },
  gift_lida: { n: 'Травяное саше', d: 'Подарок для Лиды. Отдайте при встрече: она бывает на острове в 4-й и 7-й дни.' },
  act: { n: 'Акт проверки', d: 'Документ инспектора Громова с оценкой работы маяка.', use: 'Прочитать' },
  chime: { n: 'Ловец ветра', d: 'Висит у окна в доме и тихо звенит.' },
});
const SOUV_TOTAL = 9;
const NAME_LOOK = { 'Смотритель': 'hero', 'Матвей': 'matvey', 'Лида': 'lida', 'Соня': 'sonya', 'Громов': 'gromov', 'Капитан Белов': 'belov' };

const TEXTS = {
  letter: ['Письмо', '«Папа, привет! Я научилась свистеть, мама говорит — громче чайки. Мы считаем дни, осталось совсем чуть-чуть. Привези ракушку! Варя. P.S. И маму поцелуй, она скучает больше всех, только не признаётся.»'],
  bottle: ['Записка в бутылке', '«Тому, кто найдёт. Я зажигал этот огонь сорок лет. Если ты смотритель — знай: тебя видят. Каждую ночь кто-то в море смотрит на твой свет и становится спокойнее. — С.»'],
  photo: ['Фотография', 'Молодой смотритель с женой и дочкой у этого самого маяка. Все щурятся от солнца. На обороте карандашом: «Савелий, 1979. Домой — в субботу».'],
  map: ['Карта', 'Пожелтевшая карта острова. Маяк, пирс, лес. На северо-западном утёсе, у одинокой сосны, кто-то нарисовал крестик.'],
};
const MORNING = [null,
  [[HERO, 'Последняя неделя. Семь дней — и катер увезёт меня домой.'], [HERO, 'Дела записаны на листке. Сначала линза наверху, в фонарной: в маяк и по винтовой лестнице.']],
  [[HERO, 'Ветрено. Пора сменить масло в механизме — маслёнка в сундуке в кладовой.'], [HERO, 'И неплохо бы поймать рыбы к ужину. С края пирса клюёт лучше всего.']],
  [[HERO, 'Дождь стучит по стеклу. Барометр падает — к вечеру будет шторм.'], [HERO, 'Проверю механизм вращения и запасусь дровами, пока не полило всерьёз.']],
  [[HERO, 'Шторм ушёл. На пирсе, наверное, полно мусора, и лестница опять расшаталась.'], [HERO, 'Гаечный ключ должен быть в сарае на востоке.']],
  [[HERO, 'Туман такой, что не видно собственной руки. Сегодня зажгу огонь пораньше — с полудня.'], [HERO, 'Говорили, приедет инспектор. Хорошо бы линза блестела.']],
  [[HERO, 'Сегодня придёт «Северянка» с припасами. Надо будет перетаскать ящики в кладовую.']],
  [['Письмо', '«Смотритель, катер выходит за вами сегодня и будет у острова к закату. Спасибо за службу. — Управление маяков»', 'letter'], [HERO, 'Последний день. Надо со всеми попрощаться.']],
];
const JOURNAL = [null,
  () => 'Линза чистая, дрова сложены. Остров тихий, только чайки спорят на скалах. Странно думать, что это последняя неделя.',
  () => S.q.uha === 2 ? 'Приплывал Матвей, старый рыбак. Рассказал про Савелия, который зажигал этот огонь сорок лет подряд. Уху хвалил. Подарил чай.' : 'Приплывал Матвей, старый рыбак. Рассказал про Савелия, который зажигал этот огонь сорок лет подряд. Ухи я ему так и не сварил. Надо будет исправиться.',
  () => 'Шторм. Свет гас, но генератор не подвёл, и огонь снова горит. Где-то там корабли видят его. Пожалуй, это лучшее в этой работе.',
  () => 'Почтальонка Лида привезла письмо из дома. Варя научилась свистеть. На смотровой теперь рисует Соня, внучка Матвея.' + (S.inv.map ? ' На берег выбросило ящик, а в нём — бутылка с запиской Савелия.' : ''),
  () => 'Туман весь день. Приезжал инспектор Громов. ' + (S.q.chick === 2 ? 'Нашёл в лесу птенца чайки и отнёс к своим. Чайки, кажется, это запомнили.' : 'Где-то в лесу пищал птенец.'),
  () => 'Капитан Белов сказал, что огонь острова видно за двадцать миль. ' + (S.flags.whalesSeen ? 'Ночью видел китов у смотровой. Матвей был прав.' : 'Ночью с моря доносилось странное пение.'),
  () => 'Огонь зажжён в последний раз — моими руками. Я думал, что считаю дни до отъезда. А оказалось — собирал их.',
];

// ---------- helpers ----------
function task(id) { return S.tasks.find(t => t.id === id); }
function open(id) { const t = task(id); return t && !t.done; }
function progress(id, n = 1) {
  const t = task(id); if (!t || t.done) return;
  t.c += n;
  if (!t.n || t.c >= t.n) { t.done = true; S.done++; stat('done', S.day + ':' + t.id); toast('Готово: ' + t.text.replace(/ \(.*\)/, ''), null, true); AU.chime(); if (S.tasks.every(x => x.done) && !S.flags['perfect' + S.day]) { S.flags['perfect' + S.day] = 1; S.stats.perfectDays = (S.stats.perfectDays || 0) + 1; unlock('firstday'); } }
  UI.tasks();
}
function give(id, n = 1, quiet) {
  S.inv[id] = (S.inv[id] || 0) + n; if (typeof atlasOnGive === 'function') atlasOnGive(id);
  if (ITEMS[id] && ITEMS[id].souv && !S.souv.includes(id)) { S.souv.push(id); AU.chime(); toast('Сувенир: ' + ITEMS[id].n, id); if (S.souv.length >= SOUV_TOTAL) unlock('collector'); }
  else if (!quiet) toast('+' + n + ' ' + (ITEMS[id] ? ITEMS[id].n : id), id);
  UI.hud(); UI.tasks(); // counters in the task list (e.g. «плавник 2/3») follow the bag
}
function take(id, n = 1) { S.inv[id] = Math.max(0, (S.inv[id] || 0) - n); UI.hud(); UI.tasks(); }
const has = (id, n = 1) => (S.inv[id] || 0) >= n;
const hh = m => m / 60;
const lampAvail = () => S.day === 5 ? S.min >= 720 : S.min >= 1020;

// ---------- object factory ----------
function addObj(mapId, o) { o.map = mapId; MAPS[mapId].objs.push(o); return o; }
const WORLD = { trees: [], branchSpots: [], shellSpots: [], gulls: [], colony: null, smoke: [], birds: [] };

function buildWorld() {
  MAPS.island = genIsland(); MAPS.house = genHouse(); MAPS.lamp = genLamp(); MAPS.shed = genShed();
  for (const k in MAPS) buildGround(MAPS[k]);
  const m = MAPS.island, rnd = rng(7);
  const busy = new Set(); const key = (x, y) => x + ',' + y;
  const avoid = (x, y) => (x >= 27 && x <= 40 && y >= 7 && y <= 16) || (x >= 43 && x <= 51 && y >= 9 && y <= 16) || (x >= 42 && x <= 52 && y >= 22 && y <= 29) || (x >= 26 && x <= 35 && y >= 30) || (x >= 17 && x <= 24 && y >= 10 && y <= 15) || Math.hypot(x - 76, y - 30) < 5.5 || Math.hypot(x - 84, y - 22) < 4.6 || Math.hypot(x - 89, y - 37.5) < 3 || Math.hypot(x - 11.5, y - 21.4) < 1.6 || (x >= 53 && x <= 64 && y >= 29 && y <= 37);
  const nearPath = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (tAt(m, x + dx, y + dy) === PATH) return true; return false; };
  // trees
  for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
    const t = tAt(m, x, y); if ((t !== FOREST && t !== GRASS) || avoid(x, y) || nearPath(x, y)) continue;
    const h = hash(x * 3 + 1, y * 5 + 2), forest = t === FOREST;
    if (h < (forest ? .56 : .035)) {
      let ok = !busy.has(key(x - 1, y)) && (forest || (!busy.has(key(x, y - 1)) && !busy.has(key(x - 1, y - 1))));
      if (!ok) continue; busy.add(key(x, y));
      const pine = forest ? h < .27 : h < .012, s = .85 + hash(y, x) * .35, seed = h * 10;
      const ox = (hash(x, y + 9) - .5) * 6;
      const o = addObj('island', { x: x * T + 8 + ox, y: y * T + 12, kind: 'tree', pine, solid: [-3, -3, 6, 3], draw(c, sx, sy) { (pine ? drawPine : drawRoundTree)(c, sx, sy, s, G.time, G.wind, G.sh, seed); } });
      WORLD.trees.push(o);
    } else if (forest && h > .9 && h <= .955 && !busy.has(key(x, y))) {
      busy.add(key(x, y)); const bh = hash(x + 5, y + 9) > .8; addObj('island', { x: x * T + 8, y: y * T + 12, kind: 'bush', solid: [-5, -3, 10, 3], draw(c, sx, sy) { drawBush(c, sx, sy, G.sh, false); if (bh) { R(c, sx - 3, sy - 9, 2, 2, '#f2f2f2'); R(c, sx + 2, sy - 7, 2, 2, '#f2e36b'); } } });
    } else if (forest && h > .965 && !busy.has(key(x, y))) {
      busy.add(key(x, y)); WORLD.branchSpots.push([x * T + 8, y * T + 10]);
    } else if (!forest && h > .985) {
      busy.add(key(x, y)); addObj('island', { x: x * T + 8, y: y * T + 12, kind: 'rock', solid: [-5, -3, 10, 3], draw(c, sx, sy) { drawRock(c, sx, sy, G.sh, hash(x, y + 3) > .6, x * 31 + y * 7, true); } });
    }
  }
  // extra branch spots on forest edges if few
  for (let y = 16; y < 33 && WORLD.branchSpots.length < 10; y++) for (let x = 7; x < 20; x++) if (tAt(m, x, y) === FOREST && !busy.has(key(x, y)) && hash(x + 50, y) > .92 && !nearPath(x, y)) { busy.add(key(x, y)); WORLD.branchSpots.push([x * T + 8, y * T + 10]); }
  WORLD.busy = busy;
  WORLD.branchSpots.sort((a, b) => Math.hypot(a[0] - 24 * T, a[1] - 24 * T) - Math.hypot(b[0] - 24 * T, b[1] - 24 * T));
  WORLD.herbSpots = [];
  for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) { const t = tAt(m, x, y); const glade = Math.hypot(x - 76, y - 29) < 5 || Math.hypot(x - 84, y - 22) < 4.5; if ((t === FOREST || (t === GRASS && glade)) && !busy.has(key(x, y)) && !nearPath(x, y) && hash(x + 21, y + 77) > (glade ? .55 : .86)) WORLD.herbSpots.push([x * T + 8, y * T + 11]); }
  // decor
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const t = tAt(m, x, y); if (t !== GRASS && t !== FOREST) continue;
    const h = hash(x + 11, y + 23);
    if (h > .5) m.decor.push({ x: x * T + 3 + (hash(x, y * 2) * 10 | 0), y: y * T + 6 + (hash(y, x * 2) * 9 | 0), k: 'tuft', s: (h * 100) | 0, col: t === FOREST ? '#3b7340' : '#4f9145' });
    if (h > .8) m.decor.push({ x: x * T + 9, y: y * T + 13, k: 'tuft', s: (h * 37) | 0, col: t === FOREST ? '#3b7340' : '#4f9145' });
    if (t === GRASS && hash(x + 77, y + 3) > .9) m.decor.push({ x: x * T + 4 + (hash(x * 9, y) * 8 | 0), y: y * T + 10, k: 'flower', s: (hash(x, y) * 40) | 0 });
  }
  // shell spots: sand near shallow water
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (tAt(m, x, y) === SAND && [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => tAt(m, x + dx, y + dy) === SHALLOW) && !(x >= 29 && x <= 32)) WORLD.shellSpots.push([x * T + 8, y * T + 9]);
  // gull colony on east rocks
  const gr = []; for (let y = 19; y < 31; y++) for (let x = 49; x < 63; x++) if (tAt(m, x, y) === ROCK && tAt(m, x, y - 1) === ROCK) gr.push([x, y]);
  gr.sort((a, b) => hash(a[0], a[1]) - hash(b[0], b[1]));
  gr.slice(0, 7).forEach(([x, y], i) => { const g = { hx: x * T + 8, hy: y * T + 6, x: x * T + 8, y: y * T + 6, fly: false, t: 0, seed: i * 1.7 }; WORLD.gulls.push(g); });
  // colony interaction point: walkable tile left of westernmost rock in band
  let best = null; for (let y = 22; y < 29; y++) for (let x = 45; x < 60; x++) if (tAt(m, x, y) === ROCK && !SOLID.has(tAt(m, x - 1, y))) { if (!best || x < best[0]) best = [x, y]; }
  WORLD.colony = best ? [best[0] * T - 6, best[1] * T + 10] : [52 * T, 25 * T];

  // ---------- fixed island objects ----------
  const LX = 33 * T + 8, LY = 13 * T;
  WORLD.lh = { x: LX, y: LY, topY: LY - 118 - 11 };
  addObj('island', { x: LX, y: LY, kind: 'lighthouse', solid: [-30, -26, 60, 24], ix: LX, iy: LY + 2, r: 16, draw(c, sx, sy) { drawLighthouse(c, sx, sy, G.time, G.dark, S.lampLit, G.sh); }, use: { label: () => 'Войти в маяк', run: () => goTo('house', 9 * T, 10 * T + 4, 3) } });
  addObj('island', { x: 47.5 * T, y: 26 * T + 4, kind: 'shed', solid: [-22, -24, 44, 22], ix: 47.5 * T, iy: 26 * T + 8, r: 16, draw(c, sx, sy) { drawShed(c, sx, sy, G.sh, !S.power || (S.day >= 3 && !has('wrench'))); }, use: { label: () => 'Войти в сарай', run: () => goTo('shed', 6 * T, 8.4 * T, 3) } });
  addObj('island', { x: 40 * T, y: 37 * T, kind: 'boat', solid: [-18, -8, 36, 7], r: 22, iy: 37 * T - 2, draw(c, sx, sy) { drawBoat(c, sx, sy, G.sh, true); }, use: { label: () => 'Осмотреть старую лодку', run: () => say([[HERO, S.day < 4 ? 'Старая лодка Савелия. Дно пробито, вёсла давно унесло. А название ещё читается: «Надежда».' : 'Старая «Надежда». После шторма к ней прибило всякий хлам.']]) } });
  addObj('island', { x: 37.5 * T, y: 38.6 * T, kind: 'drift', on: () => S.day >= 4 && !S.flags.crateOpened, draw(c, sx, sy) { drawCrate(c, sx, sy, G.sh, true); }, use: { label: () => 'Открыть ящик', run: () => startAct('pick', .9, () => { S.flags.crateOpened = 1; say([[HERO, 'Ящик выбросило штормом. Внутри — солома, старая карта и бутылка, запечатанная воском.']], () => { give('bottle'); give('map'); UI.tasks(); openDoc('bottle'); }); }) } });
  addObj('island', { x: 48.4 * T, y: 11.8 * T, kind: 'telescope', solid: [-3, -3, 6, 3], draw(c, sx, sy) { drawTelescope(c, sx, sy); }, use: { label: () => 'Смотреть в подзорную трубу', run: telescope } });
  addObj('island', { x: 45.2 * T, y: 13.4 * T, kind: 'easel', on: () => S.day >= 4, draw(c, sx, sy) { drawEasel(c, sx, sy); } });
  // utes (NW cliff)
  addObj('island', { x: 19.6 * T, y: 12.2 * T, kind: 'tree', solid: [-3, -3, 6, 3], draw(c, sx, sy) { drawPine(c, sx, sy, 1.25, G.time, G.wind * 1.3, G.sh, 3); } });
  addObj('island', { x: 21.5 * T, y: 13.4 * T, kind: 'dig', on: () => has('map') && !S.flags.dug, r: 16, draw(c, sx, sy) { R(c, sx - 3, sy - 3, 1, 1, '#6b4a2e'); R(c, sx - 2, sy - 2, 1, 1, '#6b4a2e'); R(c, sx, sy, 1, 1, '#6b4a2e'); R(c, sx + 1, sy + 1, 1, 1, '#6b4a2e'); R(c, sx + 1, sy - 3, 1, 1, '#6b4a2e'); R(c, sx - 3, sy + 1, 1, 1, '#6b4a2e'); R(c, sx - 1, sy - 1, 2, 2, '#6b4a2e'); }, use: { label: () => 'Копать у крестика', run: () => startAct('pick', 1.6, () => { S.flags.dug = 1; say([[HERO, 'Под камнем — жестяная коробка из-под леденцов. Внутри сухо. И старая фотография.']], () => { give('photo'); UI.tasks(); openDoc('photo'); }); }) } });
  // signpost
  addObj('island', { x: 33.2 * T, y: 22.6 * T, kind: 'sign', solid: [-1, -2, 3, 2], draw(c, sx, sy) { R(c, sx, sy - 14, 2, 14, '#6b4a2e'); R(c, sx - 8, sy - 14, 12, 4, '#b68a58'); R(c, sx - 2, sy - 9, 12, 4, '#a87d4e'); R(c, sx - 7, sy - 13, 1, 2, '#3a2a1a'); R(c, sx + 8, sy - 8, 1, 2, '#3a2a1a'); }, use: { label: () => 'Прочитать указатель', run: () => say([['Указатель', '↑ Маяк · ← Лес и утёс · → Сарай, скалы с чайками и Дальний лес · ↓ Пирс']]) } });
  // pier lamp post
  addObj('island', { x: 29.4 * T, y: 36.3 * T, kind: 'post', solid: [-1, -2, 3, 2], draw(c, sx, sy) { R(c, sx, sy - 22, 2, 22, '#2c2f38'); R(c, sx - 2, sy - 26, 6, 5, G.dark > .3 ? '#ffd477' : '#3d4250'); R(c, sx - 3, sy - 27, 8, 1, '#2c2f38'); } });
  // fishing spots
  addObj('island', { x: 30.9 * T, y: 46 * T + 4, kind: 'fishspot', r: 20, draw(c, sx, sy) { R(c, sx - 4, sy - 2, 1, 4, '#5d3e24'); R(c, sx + 6, sy - 2, 1, 4, '#5d3e24'); }, use: { label: () => 'Рыбачить', run: () => startFishing('pier') } });
  addObj('island', { x: 9.5 * T, y: 33.3 * T, kind: 'fishspot', r: 18, draw() { }, use: { label: () => 'Рыбачить с камня', run: () => startFishing('rocks') } });
  // pier ladder
  addObj('island', { x: 31 * T + 14, y: 42 * T + 10, kind: 'ladder', r: 16, draw(c, sx, sy) { const broken = S.day >= 4 && !S.flags.ladderFixed; R(c, sx + 2, sy - 8, 1, 14, '#6b4a2e'); R(c, sx + 7, sy - 8, 1, 14, '#6b4a2e'); for (let i = 0; i < 4; i++) { if (broken && i === 1) { R(c, sx + 3, sy - 6 + i * 4, 2, 1, '#8a5a32'); continue; } R(c, sx + 2, sy - 6 + i * 4, 6, 1, '#8a5a32'); } }, use: { label: () => open('ladder') ? (has('wrench') ? 'Починить лестницу' : 'Лестница шатается') : null, run: () => { if (!has('wrench')) { say([[HERO, 'Перекладина болтается. Без гаечного ключа не обойтись — он в сарае.']]); return; } startAct('fix', 2, () => { S.flags.ladderFixed = 1; progress('ladder'); }); } } });
  // visiting boats
  // terns (day 2)
  addObj('island', { x: 20 * T, y: 35.3 * T, kind: 'terns', on: () => S.day === 2 || (S.day === 3 && !S.souv.includes('feather')), draw(c, sx, sy) { if (S.day !== 2) return; [[-12, -2], [-4, 1], [5, -3], [13, 0], [2, 4]].forEach(([dx, dy], i) => drawTern(c, sx + dx, sy + dy, G.time, i)); } });
  addObj('island', { x: 22.4 * T, y: 35.6 * T, kind: 'feather', on: () => (S.day === 2 || S.day === 3) && !S.souv.includes('feather'), r: 12, draw(c, sx, sy) { drawFeatherFind(c, 'feather', sx, sy); }, use: { label: () => 'Поднять перо', run: () => startAct('pick', .6, () => { give('feather'); say([[HERO, 'Перо полярной крачки. Они летят с одного края света на другой — и всё равно находят дорогу.']]); }) } });
  // chick (day 5+)
  addObj('island', { x: 11.5 * T, y: 21.4 * T, kind: 'chick', on: () => S.q.chick === 1 && P.carry !== 'chick', r: 14, draw(c, sx, sy) { const b = Math.sin(G.time * 6) > .7 ? -1 : 0; R(c, sx - 3, sy - 5 + b, 6, 4, '#d8d8d0'); R(c, sx + 1, sy - 7 + b, 3, 3, '#e8e8e0'); R(c, sx + 4, sy - 6 + b, 1, 1, '#f0b23a'); R(c, sx + 2, sy - 6 + b, 1, 1, '#2c2f38'); }, use: { label: () => 'Взять птенца', run: () => { P.carry = 'chick'; say([[HERO, 'Вот ты где. Тише, тише. Отнесу тебя к своим — на скалы на востоке.']]); UI.tasks(); } } });
  addObj('island', { x: WORLD.colony[0], y: WORLD.colony[1], kind: 'colony', r: 26, draw() { }, use: { label: () => P.carry === 'chick' ? 'Вернуть птенца чайкам' : (S.day >= 1 ? 'Скалы с чайками' : null), run: colonyRun } });
  // dynamic per-day objects live in S.placed and are spawned in spawnDaily()

  // ---------- house ----------
  addObj('house', { x: 2.6 * T, y: 3.1 * T, kind: 'stove', solid: [-12, -16, 24, 15], r: 16, iy: 3.4 * T, draw: drawStove, use: { label: stoveLabel, run: stoveRun } });
  addObj('house', { x: 1.2 * T + 4, y: 5 * T, kind: 'woodbox', solid: [-6, -8, 12, 8], r: 14, draw(c, sx, sy) { R(c, sx - 7, sy - 9, 14, 9, '#6b4a2e'); R(c, sx - 7, sy - 9, 14, 1, '#8a5a32'); const n = Math.min(4, (S.flags.woodIn || 0) + 1); for (let i = 0; i < n; i++) R(c, sx - 6 + i * 3, sy - 11, 3, 3, i % 2 ? '#a87444' : '#8a5a32'); }, use: { label: () => open('wood') ? (has('wood') ? 'Сложить дрова (' + S.inv.wood + ')' : 'Ящик для дров пуст') : 'Ящик для дров', run: () => { if (open('wood') && has('wood')) { const t = task('wood'), n = Math.min(S.inv.wood, t.n - t.c); take('wood', n); S.flags.woodIn = (S.flags.woodIn || 0) + n; startAct('pick', .6, () => progress('wood', n)); } else if (open('wood')) say([[HERO, 'Нужны дрова. В лесу на западе полно сухих веток.']]); else say([[HERO, 'Дров хватит до утра.']]); } } });
  addObj('house', { x: 4.5 * T, y: 7 * T, kind: 'table', solid: [-14, -10, 28, 9], draw(c, sx, sy) { shadowE(c, sx, sy, 14, 3, { a: .7, dx: 0, dy: 0 }); R(c, sx - 14, sy - 14, 28, 10, '#8a5a32'); R(c, sx - 14, sy - 14, 28, 2, '#a87444'); R(c, sx - 12, sy - 4, 2, 4, '#5d3a20'); R(c, sx + 10, sy - 4, 2, 4, '#5d3a20'); R(c, sx - 4, sy - 13, 6, 4, '#f2ece0'); R(c, sx - 3, sy - 13, 4, 1, '#c9a24a'); R(c, sx + 6, sy - 12, 3, 3, '#3b7ea0'); } });
  addObj('house', { x: 7.6 * T, y: 2.3 * T, kind: 'shelf', solid: [-12, -6, 24, 5], draw(c, sx, sy) { drawShelfStore(c, sx, sy); } });
  addObj('house', { x: 10.5 * T, y: 3.3 * T, kind: 'chest', solid: [-8, -9, 16, 9], r: 15, draw(c, sx, sy) { R(c, sx - 8, sy - 10, 16, 10, '#7a4d2c'); R(c, sx - 8, sy - 10, 16, 3, '#9a6a42'); R(c, sx - 8, sy - 7, 16, 1, '#3a2a1a'); R(c, sx - 1, sy - 8, 2, 3, '#d9b04a'); }, use: { label: () => open('oil') && !has('oilcan') ? 'Взять маслёнку' : 'Открыть сундук', run: () => { if (open('oil') && !has('oilcan')) startAct('pick', .6, () => give('oilcan')); else say([[HERO, 'Свечи, верёвка, запасные стёкла, пачка старых газет 1983 года. Савелий ничего не выбрасывал.']]); } } });
  addObj('house', { x: 8.4 * T, y: 4.4 * T, kind: 'store', r: 18, draw(c, sx, sy) { const n = S.flags.unloaded || 0; for (let i = 0; i < n; i++) drawCrate(c, sx - 8 + i * 9, sy, { a: .6, dx: 0, dy: 0 }, false); }, use: { label: () => P.carry === 'crate' ? 'Поставить ящик в кладовую' : null, run: () => { P.carry = null; S.flags.unloaded = (S.flags.unloaded || 0) + 1; progress('unload'); } } });
  addObj('house', { x: 9 * T, y: 7 * T, kind: 'stairs', solid: [-11, -13, 22, 12], r: 16, iy: 7 * T + 2, draw: drawStairs, use: { label: () => 'Подняться в фонарную', run: () => goTo('lamp', 7.5 * T, 9.1 * T, 3) } });
  addObj('house', { x: 15.4 * T, y: 4.6 * T, kind: 'bed', solid: [-10, -27, 20, 26], r: 18, iy: 5 * T, draw: drawBed, use: { label: bedLabel, run: bedRun } });
  addObj('house', { x: 12.6 * T, y: 3.2 * T, kind: 'desk', solid: [-11, -12, 22, 11], r: 15, iy: 3.6 * T, draw(c, sx, sy) { R(c, sx - 11, sy - 14, 22, 10, '#8a5a32'); R(c, sx - 11, sy - 14, 22, 2, '#a87444'); R(c, sx - 10, sy - 4, 2, 4, '#5d3a20'); R(c, sx + 8, sy - 4, 2, 4, '#5d3a20'); R(c, sx - 6, sy - 13, 8, 5, '#3a4e7a'); R(c, sx - 5, sy - 12, 6, 3, '#f2e6cc'); R(c, sx + 5, sy - 17, 3, 5, '#e9dcbc'); R(c, sx + 6, sy - 19, 1, 2, G.dark > .3 ? '#ffd477' : '#e9dcbc'); }, use: { label: () => open('journal') && journalAvail() ? 'Сделать запись в дневнике' : 'Дневник смотрителя', run: () => { if (open('journal') && journalAvail()) writeJournal(); else if (open('journal')) say([[HERO, 'Запись делают вечером, когда огонь уже горит.']]); else UI.panel('jr'); } } });
  addObj('house', { x: 14.6 * T, y: 2.25 * T, kind: 'souvshelf', r: 16, iy: 2.9 * T, solid: [-12, -5, 24, 4], draw: drawSouvShelf, use: { label: () => 'Полка сувениров (' + S.souv.length + '/' + SOUV_TOTAL + ')', run: () => { UI.panel('inv'); } } });
  addObj('house', { x: 9 * T, y: 11 * T + 6, kind: 'door', r: 14, iy: 10.6 * T, draw() { }, use: { label: () => 'Выйти наружу', run: exitHouse } });
  addObj('house', { x: 5 * T, y: 1.6 * T, kind: 'window', draw: drawWindow });
  addObj('house', { x: 13.2 * T, y: 1.6 * T, kind: 'window', draw: drawWindow });
  addObj('house', { x: 9 * T, y: 11 * T, kind: 'mat', draw(c, sx, sy) { R(c, sx - 10, sy - 14, 20, 8, '#8a6a3c'); R(c, sx - 9, sy - 13, 18, 6, '#a5844e'); } , layer: -1 });
  addObj('house', { x: 9 * T, y: 10.4 * T, kind: 'morningletter', on: () => S.day === 7 && !S.flags.letter7, draw(c, sx, sy) { R(c, sx - 4, sy - 4, 9, 6, '#f2e6cc'); R(c, sx, sy - 2, 2, 2, '#c8303b'); } });

  // ---------- lamp room ----------
  addObj('lamp', { x: 7.5 * T, y: 7.2 * T, kind: 'lens', solid: [-13, -14, 26, 13], r: 20, iy: 7.4 * T, draw: drawLens, use: { label: lensLabel, run: lensRun } });
  addObj('lamp', { x: 5.2 * T, y: 8.6 * T, kind: 'mech', solid: [-8, -8, 16, 7], r: 15, draw: drawMech, use: { label: () => open('oil') ? (has('oilcan') ? 'Заменить масло' : 'Масло старое, нужна маслёнка') : open('mech') ? 'Проверить механизм вращения' : 'Механизм вращения', run: mechRun } });
  addObj('lamp', { x: 10.1 * T, y: 5 * T, kind: 'radio', solid: [-6, -6, 12, 5], r: 15, draw(c, sx, sy) { R(c, sx - 7, sy - 10, 14, 10, '#3d4250'); R(c, sx - 6, sy - 9, 6, 6, '#22262f'); for (let i = 0; i < 3; i++) R(c, sx - 5, sy - 8 + i * 2, 4, 1, '#555b6a'); R(c, sx + 2, sy - 8, 3, 3, S.day === 7 && S.min >= 1020 && !S.flags.radio ? (Math.sin(G.time * 8) > 0 ? '#ff6a4a' : '#5a2a22') : '#4a8a5a'); R(c, sx + 4, sy - 16, 1, 6, '#2c2f38'); }, use: { label: () => 'Включить рацию', run: radioRun } });
  buildExtras();
  addObj('lamp', { x: 7.5 * T, y: 9.6 * T, kind: 'hatch', r: 14, iy: 9.4 * T, draw(c, sx, sy) { R(c, sx - 8, sy - 7, 16, 9, '#22262f'); for (let i = 0; i < 3; i++) R(c, sx - 6 + i * 4, sy - 5 + i * 2, 5, 2, '#555b6a'); }, use: { label: () => 'Спуститься вниз', run: () => goTo('house', 9 * T, 8.2 * T, 0) } , layer: -1 });
}

// ---------- per-day spawns ----------
function spawnDaily() {
  const isl = MAPS.island, house = MAPS.house;
  isl.objs = isl.objs.filter(o => !o.daily); house.objs = house.objs.filter(o => !o.daily);
  const rnd = rng(S.day * 101);
  // shells (keep total around 7 on the beach)
  const spots = WORLD.shellSpots.slice().sort(() => rnd() - .5).slice(0, 7);
  spots.forEach(([x, y], i) => addObj('island', { daily: 1, x, y, kind: 'shell', r: 12, gone: false, on() { return !this.gone; }, draw(c, sx, sy) { drawFind(c, 'shell', sx, sy, Math.sin(G.time * 2 + i) > .85); }, use: { label: () => 'Поднять ракушку', run() { const o = this; startAct('pick', .4, () => { o.gone = true; give('shell'); UI.tasks(); }); } } }));
  // fix "this" binding for shell use
  isl.objs.filter(o => o.kind === 'shell').forEach(o => { const run = o.use.run; o.use = { label: o.use.label, run: () => run.call(o) }; });
  // berry bushes
  WORLD.branchSpots.slice(6, 10).forEach(([x, y]) => { const o = addObj('island', { daily: 1, x: x + 2, y: y + 2, kind: 'berry', solid: [-5, -3, 10, 3], picked: false, draw(c, sx, sy) { drawBush(c, sx, sy, G.sh, !o.picked); } }); o.use = { label: () => o.picked ? null : 'Собрать бруснику', run: () => startAct('pick', .6, () => { o.picked = true; give('berries', 2); }) }; });
  // branches for wood
  if (task('wood')) WORLD.branchSpots.slice(0, 6).forEach(([x, y], i) => { const o = addObj('island', { daily: 1, x, y, kind: 'branch', r: 13, gone: false, on: () => !o.gone, draw(c, sx, sy) { R(c, sx - 6, sy - 2, 12, 2, '#7a4d2c'); R(c, sx - 2, sy - 4, 1, 2, '#7a4d2c'); R(c, sx + 2, sy - 3, 4, 1, '#8a5a32'); R(c, sx - 6, sy - 2, 12, 1, '#9a6a42'); } }); o.use = { label: () => 'Подобрать хворост', run: () => startAct('pick', .5, () => { o.gone = true; give('wood'); }) }; });
  // dust
  if (task('clean')) [[3.5, 9.3], [7, 8.6], [13.8, 9.6]].forEach(([x, y], i) => { const o = addObj('house', { daily: 1, x: x * T, y: y * T, kind: 'dust', r: 14, gone: false, on: () => !o.gone, layer: -1, draw(c, sx, sy) { c.fillStyle = 'rgba(120,100,80,.55)'; c.beginPath(); c.ellipse(sx, sy - 2, 7, 3, 0, 0, 7); c.fill(); R(c, sx - 3, sy - 3, 1, 1, '#d9cfbd'); R(c, sx + 2, sy - 2, 1, 1, '#d9cfbd'); } }); o.use = { label: () => 'Подмести', run: () => startAct('sweep', 1.2, () => { o.gone = true; progress('clean'); }) }; });
  // pier debris (day 4)
  if (task('pier')) [[30.5, 38.5, 'w'], [31.4, 40.6, 'p'], [30.6, 42.8, 'w'], [31.3, 45, 'p']].forEach(([x, y, k]) => { const o = addObj('island', { daily: 1, x: x * T, y: y * T, kind: 'debris', r: 13, gone: false, on: () => !o.gone, draw(c, sx, sy) { if (k === 'w') { R(c, sx - 6, sy - 3, 12, 3, '#3d6b3a'); R(c, sx - 4, sy - 4, 3, 1, '#4f8a43'); R(c, sx + 2, sy - 2, 4, 1, '#2f5a2c'); } else { R(c, sx - 7, sy - 3, 14, 3, '#b08a5a'); R(c, sx - 7, sy - 3, 14, 1, '#c9a26e'); R(c, sx + 3, sy - 2, 1, 1, '#555'); } } }); o.use = { label: () => k === 'w' ? 'Убрать водоросли' : 'Убрать обломок доски', run: () => startAct('pick', .7, () => { o.gone = true; progress('pier'); }) }; });
  // supply crates (day 6) appear after meeting the ship
  spawnExtras();
  if (task('unload')) [[30.4, 38.2], [31.5, 38.6], [30.6, 39.6]].forEach(([x, y]) => { const o = addObj('island', { daily: 1, x: x * T, y: y * T, kind: 'supply', r: 13, gone: false, on: () => !o.gone && task('ship').done, draw(c, sx, sy) { drawCrate(c, sx, sy, G.sh, false); } }); o.use = { label: () => P.carry ? null : 'Взять ящик', run: () => { o.gone = true; P.carry = 'crate'; toast('Ящик в руках. Отнесите в кладовую маяка'); } }; });
}

// ---------- NPCs ----------
const NPCS = {
  matvey: { name: 'Матвей', look: 'matvey' }, lida: { name: 'Лида', look: 'lida' }, sonya: { name: 'Соня', look: 'sonya' },
  gromov: { name: 'Громов', look: 'gromov' }, belov: { name: 'Капитан Белов', look: 'belov' },
};

function talk(id) {
  const n = NPCS[id], d = S.day, f = S.flags; const L = (t) => [n.name, t];
  if (preTalk(id)) return;
  if (id === 'nyura') return nyuraTalk();
  if (id === 'matvey') {
    if (d === 2) {
      if (!f.metMatvey) { f.metMatvey = 1; S.q.uha = 1; return say([L('Здорово, смотритель! Я Матвей. Рыбачу у вашего острова, почитай, полвека.'), L('Прежний смотритель, Савелий, сорок лет этот огонь зажигал. Говорил: маяк — он не только для кораблей. Он чтоб люди знали, что их кто-то ждёт.'), L('Слушай, а не сваришь ли старику ухи? Сам-то я в лодке один хлеб жую. Рыбу на пирсе лови, печь у тебя на кухне.')], () => { UI.tasks(); deliverLetter(1, 'Матвей', 'Да, чуть не забыл! На почте тебе письмо лежало, Лида просила захватить. Держи. А ответ напишешь — я отвезу.'); }); }
      if (S.q.uha === 1 && has('uha')) { take('uha'); S.q.uha = 2; return say([L('Ох, уважил! Наваристая, с дымком.'), L('Держи-ка чаю с материка. Заваривай вечером на печи — спится лучше.')], () => { give('tea', 3); UI.tasks(); }); }
      if (S.q.uha === 1) return say([L('Уха, смотритель, уха! С края пирса клюёт — только не зевай, когда поплавок дёрнется.')]);
      return say([L('Ветер к вечеру уляжется. Огонь-то зажжёшь — мне домой по нему идти.')]);
    }
    if (d === 4) return say([L('После шторма всегда что-нибудь на берег выносит. Глянь у старой лодки, вон там.'), L('Внучка моя, Соня, со мной приплыла. Рисует на смотровой площадке. Ты загляни к ней.')].concat(boatTalk()));
    if (d === 6) { f.legend = 1; return say([L('Сядь, послушай. Старики говорят: когда смотритель уходит с острова, киты приплывают с ним попрощаться.'), L('Поют ночью у скал под смотровой. Кто услышит — тому дорога домой будет лёгкой.'), L('Сказки, конечно. А ты всё-таки сходи ночью на смотровую, а?')], () => UI.tasks()); }
    if (d === 7) {
      if (!f.byeMatvey) { f.byeMatvey = 1; return say([L('Уезжаешь, значит. Ну что ж. Остров тебя запомнит, он памятливый.'), L('Вот, вырезал из плавника. Маяк. Чтоб дома было на что смотреть, когда заскучаешь.'), L('Огонь теперь моя забота, пока нового смотрителя не пришлют. Пригляжу.')].concat((S.flags.boat | 0) >= 4 ? [L('И за «Надеждой» пригляжу. Савелий бы обрадовался, что она снова на воде.')] : []), () => { give('figurine'); progress('bye'); }); }
      return say([L(S.min >= 1080 ? 'Иди, иди. Катер ждать не будет. А огонь твой я отсюда вижу — хорошо горит.' : 'Вечером провожу тебя. Все придём, не сомневайся.')]);
    }
  }
  if (id === 'lida') {
    if (d === 4) {
      if (!f.metLida) { f.metLida = 1; return say([L('Почта! Ой, вы смотритель? Последняя неделя, говорят? Тогда тем более держите: письмо из дома.')], () => { give('letter'); openDoc('letter', () => say([L('Новости? На материке ярмарка, на соседнем острове коза съела рыбацкую сеть. Всё как обычно.'), L('Я ещё загляну до вашего отъезда. Без почты тут грустно.')])); }); }
      return say([L('Письма — это ведь как маяк, только бумажный. Чтоб знали: о тебе помнят.')]);
    }
    if (d === 7) {
      if (!f.byeLida) { f.byeLida = 1; return say([L('Последний день! Я всё-таки успела.'), L('Без вас тут будет непривычно. Но маяк же никуда не денется. Значит, и вы вернётесь — хоть в гости.'), L('Передавайте Варе привет. Пусть свистит громче чаек!')], () => progress('bye')); }
      return say([L('Я подожду до катера. Хочу посмотреть, как вы уплываете, — это красиво.')]);
    }
  }
  if (id === 'sonya') {
    if (!f.metSonya) { f.metSonya = 1; S.q.shells = 1; return say([L('Привет! Я Соня. Рисую море. Оно каждый час другое, представляешь?'), L('Мне нужны ракушки — прижимать бумагу, а то ветер всё уносит. Найдёшь пять штук? Они на пляже, блестят.')], () => UI.tasks()); }
    if (S.q.shells === 1 && has('shell', 5)) { take('shell', 5); S.q.shells = 2; if (d >= 6) return say([L('Ура, ракушки! Теперь не улетит.'), L('А картина как раз высохла. Держи — это твой маяк. Ночью, с огнём.')], () => { S.q.shells = 3; give('painting'); UI.tasks(); }); return say([L('Ура! Теперь ничего не улетит.'), L('Я нарисую тебе картину. Только краска сохнет долго — приходи через пару дней.')], () => UI.tasks()); }
    if (S.q.shells === 2 && d >= 6) { S.q.shells = 3; return say([L('Готово! Это твой маяк. Ночью, с огнём. Повесь дома.')], () => { give('painting'); UI.tasks(); }); }
    if (d === 7 && !f.byeSonya) { f.byeSonya = 1; return say([L('Ты правда уезжаешь?'), L('Тогда я нарисую, как маяк светит без тебя. Но всё равно светит. Это будет грустная картина, но красивая.')], () => progress('bye')); }
    const lines = { 4: 'После шторма море зелёное, как бутылочное стекло. Я сто лет искала такой цвет.', 5: 'Сегодня туман. Я рисую то, чего не видно. Это сложнее всего.', 6: 'Дедушка говорит, ночью тут поют киты. Я бы нарисовала, но мне спать велят.', 7: 'Вечером приду на пирс. Не уезжай, не попрощавшись!' };
    if (S.q.shells === 1) return say([L('Ракушек пока ' + (S.inv.shell || 0) + ' из пяти. Они на пляже, поблёскивают у самой воды.')]);
    return say([L(lines[d] || 'Привет!')]);
  }
  if (id === 'gromov') {
    if (!f.metGromov) return inspectorVisit();
    return say([L('Туман к ночи не рассеется. Зажигайте огонь пораньше, смотритель.')]);
  }
  if (id === 'belov') {
    if (!f.metBelov) { f.metBelov = 1; return say([L('Капитан Белов, «Северянка». Привёз вам припасы.'), L((S.stats.done || []).includes('3:gen') ? 'В шторм третьего дня мы шли мимо. Огонь ваш мигнул и погас, а потом снова загорелся. По нему и вышли из-за мели. Спасибо, смотритель.' : 'В шторм третьего дня мы шли мимо, в темноте. Огня не было, шли по приборам. Страшновато было, но обошлось.'), L('Держите, старый компас. Пусть указывает домой. А ящики сгрузим на пирс.')], () => { give('compass'); progress('ship'); deliverLetter(3, 'Капитан Белов', 'И вот ещё: почта с материка. Сказали, лично в руки.'); }); }
    return say([L('Ящики на пирсе — в кладовую их, будьте добры. Мы отходим к четырём.')]);
  }
}

// ---------- interactions ----------
function shedLabel() { if (!S.power) return 'Запустить генератор'; if (S.day >= 3 && !has('wrench')) return 'Взять гаечный ключ'; return 'Осмотреть сарай'; }
function shedRun() {
  if (!S.power) return startAct('fix', 2.2, () => { S.power = true; progress('gen'); say([[HERO, 'Генератор чихнул, закашлял — и загудел. Свет вернулся. Теперь наверх, зажигать огонь.']]); });
  if (S.day >= 3 && !has('wrench')) return startAct('pick', .7, () => give('wrench'));
  say([[HERO, S.day < 3 ? 'В сарае генератор, бочки с топливом, сети и старый велосипед без колёс.' : 'Генератор урчит. Всё в порядке.']]);
}
function stoveLabel() { return 'Печь: готовить и заваривать'; }
function stoveRun() { stoveMenu(); }
function bedLabel() { if (S.day === 7) return 'Кровать'; return (S.min >= 1200 || (task('journal') && task('journal').done)) ? 'Лечь спать' : 'Кровать'; }
function bedRun() {
  if (S.day === 7) return say([[HERO, 'Сегодня не до сна. Катер придёт вечером.']]);
  if (S.min >= 1200 || task('journal').done) {
    const left = S.tasks.filter(t => !t.done).length;
    const n = S.tasks.filter(t => !t.done).length;
    return MENU.ask(n ? `Лечь спать? Не сделано дел: ${n}. Новый день начнётся утром.` : 'Лечь спать? День закончится, утром начнётся новый.', 'Лечь спать', 'Ещё не сейчас', () => left ? say([[HERO, 'Не всё сделано, но глаза слипаются. Ладно, завтра будет новый день.']], sleep) : sleep());
  }
  say([[HERO, 'Ещё рано. Спать ложатся после записи в дневнике.']]);
}
function journalAvail() { return S.lampLit || S.min >= 1140; }
function writeJournal() {
  startAct('write', 1.6, () => { const text = JOURNAL[S.day](); S.journal.push({ d: S.day, t: text }); progress('journal'); say([['Журнал, день ' + S.day, text, 'letter'], [HERO, S.day === 7 ? 'Вот и всё. Теперь — на пирс.' : 'Можно и спать.']]); });
}
function lensLabel() {
  if (open('lens')) return 'Почистить линзу';
  if (open('lamp')) { if (S.day === 7 && !S.flags.radio) return 'Зажечь маяк (сначала рация)'; if (!lampAvail()) return 'Зажечь маяк (рано)'; if (!S.power) return 'Нет света'; return 'Зажечь маяк'; }
  return S.lampLit ? 'Смотреть на огонь' : 'Линза маяка';
}
function lensRun() {
  if (open('lens')) return startAct('rag', 1.6, () => progress('lens'));
  if (open('lamp')) {
    if (S.day === 7 && !S.flags.radio) return say([[HERO, 'Рация мигает. Сначала послушаю, что передают.']]);
    if (!lampAvail()) return say([[HERO, S.day === 5 ? 'Рано. В туман огонь зажигают с полудня.' : 'Рано. Огонь зажигают с пяти вечера.']]);
    if (!S.power) return say([[HERO, 'Электричества нет. Сначала генератор в сарае.']]);
    return startAct('light', 1.4, () => { S.lampLit = true; progress('lamp'); AU.chime(); if (S.day === 7) { S.flags.finalLight = 1; say([[HERO, 'Огонь. В последний раз — моими руками.'], [HERO, 'Солнце садится в море. Отсюда виден весь остров: пирс, лес, утёс, крошечные крыши сарая. И катер на горизонте.'], ['Подсказка', 'Осталось сделать запись в дневнике и спуститься на пирс.']]); } else say([[HERO, 'Свет пошёл. Луч лёг на воду и побежал по кругу.']]); });
  }
  if (S.lampLit) say([[HERO, 'Луч медленно обходит горизонт. Где-то там его видят.']]);
  else say([[HERO, 'Линза Френеля — сотни стеклянных колец. Савелий называл её «стрекозиный глаз».']]);
}
function mechRun() {
  if (open('oil')) { if (!has('oilcan')) return say([[HERO, 'Масло почернело. Маслёнка — в сундуке в кладовой, внизу.']]); return startAct('fix', 1.8, () => { take('oilcan'); progress('oil'); }); }
  if (open('mech')) return startAct('fix', 2, () => { progress('mech'); say([[HERO, 'Шестерни крутятся ровно, ничего не скрипит. Савелий хорошо его собрал.']]); });
  say([[HERO, 'Механизм вращения. Тихо тикает, как огромные часы.']]);
}
function radioRun() {
  if (S.day === 7 && S.min >= 1020 && !S.flags.radio) { S.flags.radio = 1; UI.tasks(); return say([['Рация', '«Маяк, маяк, приём. Катер вышел, будем у пирса через час. Готовьтесь, смотритель. Приём.»', 'letter'], [HERO, 'Принято. Огонь будет гореть.']]); }
  const fc = { 1: 'тихо, ветер слабый', 2: 'северный ветер, волна до метра', 3: 'к вечеру шторм, всем судам укрыться', 4: 'ясно, после шторма свежо', 5: 'густой туман, видимость сто метров', 6: 'облачно, ночь ясная', 7: 'ясно, красивый закат' };
  say([['Рация', '«...прогноз по району: ' + (fc[S.day] || '') + '... конец связи...»', 'letter']]);
}
function colonyRun() {
  if (P.carry === 'chick') { P.carry = null; S.q.chick = 2; return startAct('pick', .6, () => say([[HERO, 'Птенец пискнул и заковылял к своим. Чайки подняли такой гвалт, будто встречали героя.'], [HERO, 'Одна из чаек подошла и положила у ног ракушку. Перламутровую.']], () => { give('pearl'); UI.tasks(); })); }
  say([[HERO, 'Чаечья колония. Шумно, пахнет рыбой, и все спорят.']]);
}
function telescope() { openScope(); }
function sitBench() { say([[HERO, ['Отсюда видно всё море. Ветер пахнет солью и травой.', 'Посидел. Помолчал. Чайки кружат над утёсом.', 'Если долго смотреть на горизонт, начинает казаться, что видно дом.'][S.day % 3]]]); }

// ---------- furniture drawing ----------
function drawStove(c, sx, sy) {
  R(c, sx - 12, sy - 16, 24, 16, '#2c2f38'); R(c, sx - 12, sy - 16, 24, 2, '#454a56'); R(c, sx - 3, sy - 34, 6, 18, '#3a3e48');
  const f = .6 + .4 * Math.sin(G.time * 12) * Math.sin(G.time * 5.3);
  R(c, sx - 7, sy - 10, 14, 7, '#1a1c22'); R(c, sx - 6, sy - 8, 12, 5, `rgba(255,${120 + 60 * f | 0},40,${.7 + .3 * f})`); R(c, sx - 3, sy - 7, 5, 3, '#ffe08a');
  R(c, sx - 10, sy - 19, 8, 3, '#7a7f8a'); R(c, sx + 3, sy - 19, 7, 3, '#5a5f68');
}
function drawShelfStore(c, sx, sy) { R(c, sx - 12, sy - 18, 24, 18, '#7a4d2c'); [-14, -8].forEach(o => R(c, sx - 12, sy + o, 24, 1, '#5d3a20')); R(c, sx - 10, sy - 17, 4, 3, '#c8443a'); R(c, sx - 5, sy - 17, 3, 3, '#3b7ea0'); R(c, sx + 2, sy - 13, 6, 5, '#a5774a'); R(c, sx - 9, sy - 7, 7, 6, '#9b958b'); R(c, sx + 4, sy - 6, 5, 5, '#d9b04a'); }
function drawStairs(c, sx, sy) {
  c.fillStyle = 'rgba(18,26,40,.35)'; c.beginPath(); c.ellipse(sx, sy - 4, 13, 6, 0, 0, 7); c.fill();
  disc(c, sx, sy - 7, 10, '#3d342d');
  for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * .8, x = sx + Math.cos(a) * 6, y = sy - 6 - i * 3.2 + Math.sin(a) * 3; c.fillStyle = i % 2 ? '#8a5a32' : '#a87444'; c.beginPath(); c.moveTo(sx, y); c.lineTo(x + Math.cos(a + .5) * 5, y + Math.sin(a + .5) * 3); c.lineTo(x + Math.cos(a - .4) * 6, y + Math.sin(a - .4) * 3 + 2); c.fill(); }
  R(c, sx - 1, sy - 34, 3, 30, '#2c2f38'); R(c, sx, sy - 34, 1, 30, '#555b6a');
  c.strokeStyle = '#2c2f38'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i <= 20; i++) { const a = -Math.PI / 2 + i * .32, x = sx + Math.cos(a) * 11, y = sy - 9 - i * 1.3 + Math.sin(a) * 4; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
}
function drawBed(c, sx, sy) { R(c, sx - 10, sy - 28, 20, 28, '#5d3a20'); R(c, sx - 9, sy - 26, 18, 25, '#e9dcbc'); R(c, sx - 8, sy - 25, 16, 6, '#f8f2e4'); R(c, sx - 9, sy - 17, 18, 16, '#3b6aa0'); for (let i = 0; i < 3; i++) R(c, sx - 9, sy - 15 + i * 5, 18, 1, '#2f5890'); R(c, sx - 10, sy - 30, 20, 3, '#7a4d2c'); }
function drawWindow(c, sx, sy) {
  const sky = G.dark > .5 ? '#1b2a4a' : G.sunset > .3 ? '#f2a46a' : G.fog ? '#c9d2d8' : '#8fc6e3';
  R(c, sx - 9, sy - 9, 18, 13, '#4a3b30'); R(c, sx - 8, sy - 8, 16, 11, sky); R(c, sx - 1, sy - 8, 2, 11, '#4a3b30'); R(c, sx - 8, sy - 3, 16, 1, '#4a3b30');
  if (G.dark > .5) R(c, sx + 4, sy - 6, 1, 1, '#fff6d8');
  if (G.rain) for (let i = 0; i < 4; i++) R(c, sx - 7 + ((i * 5 + G.time * 20) % 14), sy - 8 + ((G.time * 30 + i * 7) % 10), 1, 2, 'rgba(220,235,255,.7)');
}
function drawSouvShelf(c, sx, sy) {
  R(c, sx - 13, sy - 4, 26, 3, '#7a4d2c'); R(c, sx - 13, sy - 1, 26, 1, '#5d3a20');
  S.souv.slice(0, 8).forEach((id, i) => { const ic = icon(id); c.drawImage(ic, sx - 13 + (i % 4) * 6.5, sy - 12 - (i >= 4 ? 7 : 0), 8, 8); });
  if (S.souv.length >= 4) R(c, sx - 13, sy - 11, 26, 1, '#7a4d2c');
}
function drawLens(c, sx, sy) {
  c.fillStyle = 'rgba(18,26,40,.35)'; c.beginPath(); c.ellipse(sx, sy - 2, 14, 4, 0, 0, 7); c.fill();
  R(c, sx - 10, sy - 8, 20, 8, '#3d4250'); R(c, sx - 10, sy - 8, 20, 1, '#555b6a');
  const lit = S.lampLit, g = lit ? .75 + .25 * Math.sin(G.time * 9) : 0;
  const rot = G.time * (lit ? 1.4 : 0);
  disc(c, sx, sy - 22, 12, '#c9a24a');
  disc(c, sx, sy - 22, 10, lit ? `rgb(255,${210 + 40 * g | 0},120)` : '#9ec7da');
  for (let r = 8; r > 1; r -= 3) { c.strokeStyle = lit ? 'rgba(255,255,230,.6)' : 'rgba(255,255,255,.45)'; c.lineWidth = 1; c.beginPath(); c.arc(sx, sy - 22, r, rot + r, rot + r + 2.4); c.stroke(); }
  if (lit) disc(c, sx, sy - 22, 3, '#fffbe8');
  if (open('lens')) { c.fillStyle = 'rgba(90,80,60,.35)'; c.beginPath(); c.arc(sx - 3, sy - 24, 5, 0, 7); c.fill(); }
  R(c, sx - 1, sy - 36, 2, 4, '#2c2f38');
}
function drawMech(c, sx, sy) {
  // cast-iron housing with two brass gears that turn while the light is on
  const rot = S.lampLit ? G.time * 2 : 0;
  R(c, sx - 10, sy - 13, 20, 13, '#1d1a24'); R(c, sx - 9, sy - 12, 18, 11, '#3d4250'); R(c, sx - 9, sy - 12, 18, 1, '#555b6a'); R(c, sx - 9, sy - 2, 18, 1, '#2c2f38');
  const gear = (gx, gy, r, a, n) => { for (let i = 0; i < n; i++) { const t = a + i * Math.PI * 2 / n; R(c, Math.round(gx + Math.cos(t) * (r + 1) - .5), Math.round(gy + Math.sin(t) * (r + 1) - .5), 1, 1, '#a8822e'); } disc(c, gx, gy, r, '#c9a24a'); disc(c, gx, gy, r - 1.5, '#a8822e'); R(c, gx - .5, gy - .5, 1, 1, '#2c2f38'); R(c, Math.round(gx + Math.cos(a) * (r - 1) - .5), Math.round(gy + Math.sin(a) * (r - 1) - .5), 1, 1, '#f2d27a'); };
  gear(sx - 3, sy - 7, 3.5, rot, 8); gear(sx + 4, sy - 6, 2.5, -rot * 1.4 + .3, 6);
  R(c, sx + 5, sy - 16, 3, 3, '#1d1a24'); R(c, sx + 6, sy - 15, 1, 2, open('oil') ? '#3a2a1a' : '#c9a24a');
}
