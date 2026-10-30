"use strict";
// ===== Quiet moments and choices =====
// ---------- quiet moments ----------
function startQuiet(o) {
  if (G.quiet) return; G.quiet = Object.assign({ t: 0, dur: 22, lines: [], pan: [0, 0] }, o);
  document.body.classList.add('quiet'); $('#qcap').classList.add('off'); G.target = null;
  const h = $('#qhint'); if (h) { h.textContent = document.body.classList.contains('touch') ? 'Коснитесь экрана, чтобы встать' : 'Нажмите E, клавишу движения или кликните, чтобы встать'; h.classList.remove('off'); clearTimeout(h._t); h._t = setTimeout(() => h.classList.add('off'), 5000); }
}
function endQuiet() {
  const q = G.quiet; if (!q) return; G.quiet = null; document.body.classList.remove('quiet'); $('#qcap').classList.add('off'); $('#qcap').dataset.i = ''; const h = $('#qhint'); if (h) h.classList.add('off');
  if (q.onEnd) q.onEnd();
}
function quietTick(dt) {
  const q = G.quiet; if (!q) return; q.t += dt;
  const per = 4.8, i = Math.floor((q.t - 1.6) / per), local = (q.t - 1.6) - i * per, cap = $('#qcap');
  if (i >= 0 && i < q.lines.length) { if (cap.dataset.i !== String(i)) { cap.dataset.i = String(i); cap.textContent = q.lines[i]; } cap.classList.toggle('off', local > per - .9); }
  else cap.classList.add('off');
  const moved = K.w || K.a || K.s || K.d || K.arrowup || K.arrowdown || K.arrowleft || K.arrowright || (pad.on && Math.hypot(pad.x, pad.y) > .5);
  if ((q.t > 1.5 && moved) || q.t >= Math.max(q.dur, 1.6 + q.lines.length * per)) endQuiet();
}
const qk = () => G.quiet ? smooth(clamp(G.quiet.t / 4, 0, 1)) * (G.quiet.t > G.quiet.dur - 1 ? clamp(G.quiet.dur - G.quiet.t, 0, 1) : 1) : 0;
function quietCat(x, y) {
  const q = G.quiet; if (!q || !q.cat || !catKept()) return;
  const k = clamp((q.t - 2) / 3, 0, 1); if (q.t < 2) return;
  const cx = x + 13 + Math.round((1 - smooth(k)) * 50);
  G.qCatDraw = 1; drawCat(ctx, cx, y + 1, k < 1 ? 'walk' : (q.t % 9 > 7.5 ? 'lick' : 'sit'), k < 1 ? 1 : 1, G.time); G.qCatDraw = 0;
}
function sunsetLines() {
  const L = ['Солнце опускается прямо в море.'];
  if (S.flags.let1) L.push('Где-то там, за горизонтом, дом. Варя, наверное, зачеркнула ещё одну клеточку.'); else L.push('Где-то там, за горизонтом, дом.');
  if (catKept()) L.push(catName() + ' пришёл и сел рядом. Тёплый.');
  L.push(S.day === 7 ? 'Последний закат на этом острове.' : 'Чайки затихли. Слышно только море.');
  return L;
}
function lampLines() {
  const L = ['Луч уходит в темноту и возвращается. Уходит и возвращается.'];
  if (S.flags.crateOpened) L.push('«Тебя видят», — писал Савелий. Каждую ночь кто-то в море смотрит на этот свет.'); else L.push('Где-то там кто-то смотрит на этот свет и становится спокойнее.');
  const m = memosOf(S.day); if (m.length) L.push('Сегодня: ' + m[m.length - 1].charAt(0).toLowerCase() + m[m.length - 1].slice(1));
  if (catKept()) L.push(catName() + ' свернулся у тёплого стекла и мурчит.');
  L.push(S.day >= 7 ? 'Последняя ночь у этого огня.' : `Ещё ${7 - S.day} ${7 - S.day === 1 ? 'ночь' : 7 - S.day < 5 ? 'ночи' : 'ночей'} у этого огня.`);
  return L;
}
function sitHere(dir) { P.sit = { o: { x: P.x, y: P.y - 10 }, t: 0 }; P.dir = dir ?? P.dir; P.moving = false; }
function benchQuietCheck() {
  if (!P.sit || G.quiet || !P.sit.o.bench || P.sit.t < 2.5) return;
  if (S.min < 1050 || S.min > 1250 || !clearSky() || S.flags['qs' + S.day]) return;
  S.flags['qs' + S.day] = 1; unlock('sunset');
  const pan = { view: [0, -40], cliff: [-24, -30], glade: [0, -12] }[P.sit.o.bench] || [0, -20];
  memo('sunset' + S.day, 'Смотрел на закат со скамейки. ' + (catKept() ? catName() + ' сидел рядом.' : 'Просто сидел и молчал.'));
  startQuiet({ kind: 'sunset', dur: 24, lines: sunsetLines(), pan, cat: true, mode: 'evening' });
}

// ---------- day 3: storm choice ----------
function stormAsk() {
  const f = S.flags; f.storm = 'both';
  say([['Рация', '«...маяк, маяк, это Лида! Меня застало штормом у южной косы, берега не вижу! Посветите мне с пирса, когда сможете. Я покручусь тут, у косы, не пропаду.»', 'letter'],
    ['Рация', '«Смотритель, Матвей на связи! Сети мои на западных камнях сушатся. Заберёшь повыше, а? Не к спеху, они в камнях застряли крепко.»', 'letter'],
    [HERO, 'Успею и туда, и туда. Сначала на пирс к Лиде, потом за сетями.']], () => { G.guide = 'q:lida'; UI.tasks(); });
}
function lidaSignal() {
  startAct('light', 2.2, () => {
    S.flags.stormL = 1; G.lidaLight = G.time; G.guide = S.flags.stormN ? null : 'q:nets'; memo('stormlida', 'В шторм светил фонарём с пирса. Лида увидела берег и зашла в бухту.');
    say([[HERO, 'Машу фонарём: вправо-влево, вправо-влево. Ветер рвёт куртку.'], [HERO, 'Там! Ответный огонёк. Поворачивает к бухте. Видит берег!'], ['Рация', '«Вижу, вижу ваш свет! Захожу в бухту. Спасибо, смотритель!»', 'letter']], () => UI.tasks());
  });
}
function netsSave() {
  startAct('pick', 2.4, () => {
    S.flags.stormN = 1; G.guide = S.flags.stormL ? null : 'q:lida'; memo('stormnets', 'В шторм спас сети Матвея с западных камней. Волна лизнула пятки.');
    say([[HERO, 'Сгрёб сети в охапку, оттащил повыше, придавил камнями. Волна лизнула пятки, но успел.'], ['Рация', '«Целы? Ох, спасибо, смотритель! Должник я твой!»', 'letter']], () => UI.tasks());
  });
}
function drawNetsPile(c, sx, sy) {
  c.strokeStyle = 'rgba(120,96,60,.95)'; c.lineWidth = 1; c.beginPath();
  for (let i = 0; i < 6; i++) { c.moveTo(sx - 10 + i * 4, sy - 7); c.lineTo(sx - 8 + i * 3, sy); }
  for (let j = 0; j < 3; j++) { c.moveTo(sx - 11, sy - 6 + j * 2.5); c.lineTo(sx + 11, sy - 5 + j * 2.5); } c.stroke();
  [[-8, -7], [0, -8], [8, -6]].forEach(([dx, dy]) => { R(c, sx + dx - 1, sy + dy - 1, 3, 3, '#1d1a24'); R(c, sx + dx, sy + dy, 2, 2, '#f07a2a'); });
}

// ---------- day 6 evening: a portrait for Sonya or uha with Matvey ----------
function portraitScene() {
  const f = S.flags; f.eve6s = 1;
  say([['Соня', 'Пришёл! Садись на скамейку, смотри на море и не шевелись. Совсем-совсем.']], () => {
    const b = MAPS.island.objs.find(o => o.kind === 'bench' && o.bench === 'view'); if (b) sitDown(b);
    S.flags['qs6'] = 1;
    startQuiet({ kind: 'portrait', dur: 24, pan: [0, -30], cat: true, mode: 'evening', lines: ['Соня рисует, высунув кончик языка.', 'Солнце садится, тени становятся длинными.', 'Сидеть неподвижно трудно. Но приятно: кто-то смотрит на тебя и видит что-то хорошее.'],
      onEnd: () => { memo('eve6s', 'Позировал Соне на закате. Она нарисовала, как я смотрю на море.'); say([['Соня', 'Готово! Ну, почти. Дорисую дома.'], ['Соня', 'Ты тут смотришь на море. Как будто уже скучаешь.']], () => UI.tasks()); } });
  });
}
function bonfireScene(after) {
  const f = S.flags; f.eve6m = 1;
  say([['Матвей', 'Пришёл всё-таки! Садись к огню. Уха как раз поспела.']], () => {
    sitHere(1);
    startQuiet({ kind: 'fire', dur: 24, pan: [-6, -6], cat: true, mode: 'evening', lines: ['Уха пахнет дымом и лавровым листом.', 'Матвей рассказывает про шторм пятьдесят второго года. Половину, наверное, выдумал.', 'Огонь трещит. Над водой загораются первые звёзды.'],
      onEnd: () => { memo('eve6m', 'Ели с Матвеем уху у костра на пирсе. Он рассказывал про старые шторма.'); after && after(); } });
  });
}

// a tap or click anywhere ends a quiet moment (after the first second, so the tap that started it doesn't)
addEventListener('pointerdown', e => { if (G.quiet && G.quiet.t > 1 && !e.target.closest('#panel,#sndBox,#btns,#doc')) { e.preventDefault(); endQuiet(); } }, true);
