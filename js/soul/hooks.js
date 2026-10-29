"use strict";
// ===== Hooks into the game, events, init =====
// ---------- small items ----------
Object.assign(ITEMS, {
  lure: { n: 'Блесна Матвея', d: 'Заветная, латунная. «На неё только хорошая рыба клюёт», — говорит Матвей.' },
  stamp: { n: 'Марка с маяком', d: 'Первая марка из альбома Лиды. На ней — этот самый маяк.' },
});
{
  const _ie = iconExtra;
  iconExtra = function (id, p, c) {
    if (id === 'lure') { for (let i = 0; i < 6; i++) p(5 + i, 4 + i, 2, 2, i % 2 ? '#d9b04a' : '#f2d27a'); p(10, 10, 2, 3, '#c8443a'); p(4, 2, 1, 3, '#9ca1aa'); p(11, 12, 3, 1, '#9ca1aa'); p(13, 11, 1, 1, '#9ca1aa'); return; }
    if (id === 'stamp') { p(2, 2, 12, 12, '#f2ece0'); for (let i = 0; i < 6; i++) { p(2 + i * 2, 1, 1, 1, '#f2ece0'); p(2 + i * 2, 14, 1, 1, '#f2ece0'); p(1, 2 + i * 2, 1, 1, '#f2ece0'); p(14, 2 + i * 2, 1, 1, '#f2ece0'); } p(4, 4, 8, 8, '#3b7ea0'); p(7, 5, 2, 6, '#f4efe4'); p(7, 7, 2, 1, '#c8443a'); p(7, 4, 2, 1, '#ffd477'); p(4, 10, 8, 2, '#2f5d8a'); return; }
    return _ie(id, p, c);
  };
}

// ---------- events across the week ----------
function soulEvents() {
  const f = S.flags, d = S.day, m = S.min, tr = (k, cond, fn) => { if (!G.trig[k] && cond) { G.trig[k] = 1; fn(); } };
  if (d === 3) {
    tr('stormAsk', m >= 1086 && !f.storm, stormAsk);
    tr('stormLate', m >= 1170 && (f.storm === 'lida' || f.storm === 'nets') && !f.stormRes, () => { f.stormRes = 'late'; G.guide = null; UI.tasks(); toast(f.storm === 'lida' ? 'Огонёк в море пропал. Лида ушла за косу пережидать' : 'Сети Матвея смыло волной'); });
  }
  if (d === 2) tr('ship', m >= 1260 && !f.morse, () => { toast('В море мигает огонёк: корабль что-то передаёт'); tip('morse', 'Корабль мигает азбукой Морзе. В фонарной есть сигнальный фонарь — можно ответить.'); UI.tasks(); });
  if (d === 4) tr('aur', m >= 1290, () => tip('aurora', 'Ночь ясная. Выйдите к морю и посмотрите на небо.'));
  if (d === 6) tr('inv6m', m >= 720, () => { f.inv6m = 1; say([['Рация', '«Смотритель, приём! Это Матвей. Вечером у пирса костёр разведу, уху прощальную сварю. Приходи к шести, а? Приём.»', 'letter']].concat(f.inv6s ? [[HERO, 'В шесть... Соня ведь тоже звала к шести. Придётся выбирать.']] : []), () => UI.tasks()); });
}
function soulTick(dt) {
  if (G.mode !== 'play') return;
  soulWatch(); mapTick(); tipTick(dt); quietTick(dt); benchQuietCheck(); morseFrame(dt);
}
function soulMorning() {
  TIPQ.length = 0; tipT = 0; $('#tipbox').classList.add('off');
  if (S.day === 1) {
    tip('move', isTouch ? 'Джойстик слева — ходить, кнопка A — действие. Список дел — слева вверху.' : 'WASD или стрелки — ходить, Shift — бегом, E или пробел — действие. Список дел — слева вверху.');
    tip('map', 'Пунктир ведёт к следующему делу. Карта острова — клавиша M или кнопка «Карта»: там тоже можно попросить показать дорогу.');
  }
  if (S.day === 2) tip('guide', 'Если не знаете, куда идти, откройте карту (M) и нажмите «Показать дорогу».');
}

// ---------- hooks into the rest of the game ----------
{
  const _wj = writeJournal;
  writeJournal = function () {
    startAct('write', 1.6, () => {
      const text = JOURNAL[S.day](), m = memosOf(S.day).slice();
      S.journal.push({ d: S.day, t: text, m }); progress('journal');
      DOC.afterDiary = () => say([[HERO, S.day === 7 ? 'Вот и всё. Теперь — на пирс.' : 'Можно и спать.']]);
      openDiary(S.day, true);
    });
    void _wj;
  };
  const _ll = lensLabel, _lr = lensRun;
  const lampQuiet = () => S.lampLit && !open('lens') && !open('lamp') && S.min >= 1170;
  lensLabel = function () { return lampQuiet() ? 'Посидеть у огня' : _ll(); };
  lensRun = function () {
    if (!lampQuiet()) return _lr();
    sitHere(3); memo('lamp' + S.day, 'Сидел у огня в фонарной. Луч ходил по кругу, а я считал обороты.');
    startQuiet({ kind: 'lamp', dur: 26, lines: lampLines(), pan: [0, -8], cat: true, mode: 'night' });
  };
  const _sf = startFishing; startFishing = function (spot) { _sf(spot); if (P.fish) tip('fish', 'Ждите, пока поплавок дёрнется и над ним появится «!». Тогда сразу жмите ' + (isTouch ? 'A' : 'E') + '.'); };
  const _give = give; give = function (id, n, quiet) { const had = S.souv.length; _give(id, n, quiet); if (S.souv.length > had) tip('souv', 'Сувениры — памятные вещи этой недели. Их девять, они встают на полку в спальне. Счётчик — под часами.'); };
  const _aa = atlasAdd; atlasAdd = function (cat, id) { const r = _aa(cat, id); if (r) tip('atlas', 'Новая запись в атласе! Атлас — клавиша K: рыбы, птицы, травы, звёзды и морские жители.'); return r; };
  const _cf = catchFish; catchFish = function (spot) { _cf(spot); const id = G.caught && G.caught.id.slice(5), it = ATLAS.fish.items.find(x => x.id === id); if (it) memo('fish_' + id, 'Поймал: ' + it.n.toLowerCase() + '.'); };
  const _ct = camTarget; camTarget = function () { const t = _ct(); const k = qk(); if (k && G.quiet.pan) { t.x += G.quiet.pan[0] * k; t.y += G.quiet.pan[1] * k; } return t; };
  const _dh = drawHero; drawHero = function () { _dh(); if (G.quiet && G.quiet.cat) quietCat(Math.round(P.x - G.cam.x), Math.round(P.y - G.cam.y)); };
  const _dc = drawCat; drawCat = function (c, x, y, st, dir, t) { if (G.quiet && G.quiet.cat && catKept() && !G.qCatDraw && c === ctx && G.mode === 'play') return; return _dc(c, x, y, st, dir, t); };
  const _ce = checkEvents; checkEvents = function () { _ce(); soulEvents(); };
  const _act = action; action = function () { if (G.quiet) { if (G.quiet.t > 1) endQuiet(); return; } if (MORSE_ON) return; return _act(); };
  const _draw = draw; draw = function () { _draw(); soulOverlay(); };
}
function soulInit() {
  // HUD: labelled souvenirs, a map button
  $('#souv').title = 'Сувениры: памятные вещи недели. Нажмите, чтобы посмотреть, что найдено и где искать остальное';
  $('#souv').onclick = () => UI.panel('inv');
  const bm = document.createElement('button'); bm.className = 'btn'; bm.id = 'bMap'; bm.type = 'button'; bm.innerHTML = 'Карта<kbd>M</kbd>'; bm.onclick = () => togglePanel('chart'); $('#btns').insertBefore(bm, $('#bSnd'));
  $('#tipbox').onclick = () => { tipT = 0; showTip(); };
  { const tc = $('#tipI').getContext('2d'); tc.drawImage(icon('lantern'), 0, 0); }
  // UI wrappers
  const _hud = UI.hud.bind(UI); UI.hud = function () { _hud(); $('#souv').textContent = 'Сувениры ' + S.souv.length + '/' + SOUV_TOTAL; };
  const _tasks = UI.tasks.bind(UI);
  UI.tasks = function () {
    _tasks(); const f = S.flags, ul = $('#taskList');
    const add = txt => { const li = document.createElement('li'); li.className = 'q'; li.innerHTML = '<span class="b"></span>'; const s = document.createElement('span'); s.textContent = txt; li.appendChild(s); ul.appendChild(li); };
    if (S.day === 3 && (f.storm === 'lida' || f.storm === 'nets') && !f.stormRes) add(f.storm === 'lida' ? 'Светить Лиде фонарём с конца пирса (до 19:30)' : 'Спасти сети Матвея на западных камнях (до 19:30)');
    if (S.day === 6 && (f.inv6s || f.inv6m) && !f.eve6 && S.min < 1170) add('В 18:00: портрет у Сони или уха у Матвея');
    if (S.day === 2 && S.min >= 1260 && !f.morse) add('Ответить кораблю из фонарной');
  };
  const _panel = UI.panel.bind(UI);
  UI.panel = function (tab) {
    if (tab === 'chart' || tab === 'jr') {
      $('#panel').hidden = false; document.querySelectorAll('#panel .tabs [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
      const body = $('#pBody'); body.innerHTML = '';
      if (tab === 'chart') return chartTab(body);
      return journalTab(body);
    }
    _panel(tab);
    if (tab === 'inv') { const body = $('#pBody'), tmp = document.createElement('div'); souvSection(tmp); body.prepend(...tmp.childNodes); }
  };
  // objects: storm spots, the signal lamp, the bonfire
  addObj('island', { x: 31 * T, y: 45.6 * T, kind: 'signal', r: 22, on: () => S.day === 3 && S.flags.storm === 'lida' && !S.flags.stormRes, draw() { }, use: { label: () => 'Светить фонарём в море', run: lidaSignal } });
  addObj('island', { x: 9.9 * T, y: 33 * T, kind: 'nets', r: 22, on: () => S.day === 3 && S.min < 1170 && S.flags.stormRes !== 'nets' && S.flags.stormRes !== 'late', draw: drawNetsPile, use: { label: () => S.flags.storm === 'nets' ? 'Спасти сети Матвея' : null, run: netsSave } });
  addObj('island', { x: 29.1 * T, y: 39.4 * T, kind: 'fire', on: () => S.day === 6 && S.min >= 1066 && S.min < 1350, draw(c, sx, sy) { drawCampfire(c, sx, sy); } });
  addObj('lamp', { x: 10.2 * T, y: 8.4 * T, kind: 'signal', solid: [-5, -4, 10, 4], r: 16, draw(c, sx, sy) { R(c, sx - 1, sy - 10, 2, 10, '#2c2f38'); R(c, sx - 5, sy - 16, 10, 7, '#3d4250'); R(c, sx - 5, sy - 16, 10, 1, '#555b6a'); R(c, sx + 5, sy - 15, 2, 5, MORSE_ON && MS.lit ? '#fff3b0' : '#c9a24a'); for (let i = 0; i < 3; i++) R(c, sx - 4, sy - 14 + i * 2, 8, 1, '#22262f'); R(c, sx - 4, sy, 8, 1, '#2c2f38'); },
    use: { label: () => S.day === 2 && S.min >= 1260 && !S.flags.morse ? 'Ответить кораблю фонарём' : 'Сигнальный фонарь', run: () => { if (S.day === 2 && S.min >= 1260 && !S.flags.morse) openMorse(); else say([[HERO, S.flags.morse ? 'Сигнальный фонарь. Корабль тогда ответил гудком.' : 'Сигнальный фонарь со шторками. Им говорят с кораблями азбукой Морзе.']]); } } });
  $('#diarybtn').onclick = () => { DOC.page = null; openDiary(S.journal.length ? S.journal[S.journal.length - 1].d : 1, false); };
  $('#morseX') && ($('#morseX').onclick = closeMorse);
  addEventListener('keyup', e => { if (MORSE_ON) morseKey(e.key.toLowerCase(), false, e); });
  // render diary / letters in the document viewer
  const _rd = renderDoc;
  renderDoc = function () {
    if (DOC.id === 'diary') { const body = $('#docBody'); body.innerHTML = ''; $('#docFlip').hidden = true; return renderDiary(body); }
    if (DOC.id === 'letter' && latestLetter()) DOC.id = latestLetter();
    if (/^let\d$/.test(DOC.id)) { const body = $('#docBody'); body.innerHTML = ''; $('#docFlip').hidden = true; return renderLetter(body, +DOC.id[3]); }
    return _rd();
  };
  DOC_NAMES.let1 = 'Письмо из дома'; DOC_NAMES.let2 = 'Письмо из дома'; DOC_NAMES.let3 = 'Письмо из дома';
}
function journalTab(body) {
  const h = document.createElement('div'); h.className = 'sect'; h.textContent = 'Дневник смотрителя'; body.appendChild(h);
  if (!S.journal.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Пока пусто. Записи делают вечером за столом в спальне, когда огонь уже горит. За день сюда сами попадают события: что поймали, кого встретили, что нашли.'; body.appendChild(e); }
  else { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = 'Перелистать дневник'; b.onclick = () => { UI.close(); openDiary(S.journal[0].d, false); }; body.appendChild(b); }
  S.journal.forEach(j => { const e = document.createElement('div'); e.className = 'entry'; const b = document.createElement('b'); b.textContent = 'День ' + j.d; e.append(b, document.createTextNode(j.t)); if ((j.m || []).length) { const ul = document.createElement('ul'); j.m.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); }); e.appendChild(ul); } body.appendChild(e); });
  const today = memosOf(S.day); if (today.length && !S.journal.some(j => j.d === S.day)) { const e = document.createElement('div'); e.className = 'entry'; const b = document.createElement('b'); b.textContent = 'Сегодня, черновик'; e.appendChild(b); const ul = document.createElement('ul'); today.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); }); e.appendChild(ul); body.appendChild(e); }
  const docs = [];
  [1, 2, 3].forEach(n => { if (S.flags['let' + n]) docs.push(['let' + n, 'Письмо из дома · ' + n, letterBody(n).lines.slice(1, 2).join(' ')]); });
  ['bottle', 'photo', 'act'].forEach(k => { if (has(k)) docs.push([k, TEXTS[k][0], TEXTS[k][1]]); });
  if (docs.length) { const h2 = document.createElement('div'); h2.className = 'sect'; h2.textContent = 'Письма и находки'; body.appendChild(h2); docs.forEach(([k, t, d]) => { const e = document.createElement('div'); e.className = 'entry open'; e.tabIndex = 0; const b = document.createElement('b'); b.textContent = t; e.append(b, document.createTextNode(d)); e.onclick = () => { UI.close(); openDoc(k); }; body.appendChild(e); }); }
}
