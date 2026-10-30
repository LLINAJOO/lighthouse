"use strict";
// ===================== MAIN: loop, input, drawing, UI, flow =====================
const cv = $('#game'), ctx = cv.getContext('2d');
const [lcv, lctx] = mk(10, 10);
let VW = 320, VH = 180, SCALE = 3;
const G = { mode: 'title', time: 0, dark: 0, sunset: 0, wind: .5, sh: { a: 1, dx: 0, dy: 0 }, fog: false, rain: false, storm: false, flash: 0, cam: { x: 0, y: 0 }, busy: 0, endT: 0, rainP: [], parts: [], clouds: [], leaves: [], flies: [] };
const MIN_RATE = 2.5; // game minutes per real second

function resize() {
  const w = innerWidth, h = innerHeight;
  SCALE = Math.max(2, Math.floor(Math.min(w / 300, h / 200)));
  if (w < 560) SCALE = Math.max(2, Math.floor(Math.min(w / 190, h / 300)));
  VW = Math.ceil(w / SCALE); VH = Math.ceil(h / SCALE);
  cv.width = VW; cv.height = VH; cv.style.width = VW * SCALE + 'px'; cv.style.height = VH * SCALE + 'px';
  lcv.width = VW; lcv.height = VH; ctx.imageSmoothingEnabled = false;
}
addEventListener('resize', resize);

// ---------- input ----------
const K = {}; const pad = { x: 0, y: 0, on: false };
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Escape' && e.target.closest('#sndBox')) { $('#sndBox').hidden = true; $('#bSnd').focus(); } return; }
  const k = e.key.toLowerCase(); K[k] = true;
  if (G.mode === 'sail') { if (G.sail && ['e', ' ', 'enter', 'у'].includes(k)) { e.preventDefault(); G.sail.t = Math.max(G.sail.t, G.sail.dur - .5); } return; }
  if (G.mode !== 'play') return;
  if (NAMEBOX.open) return;
  if (MORSE_ON) { morseKey(k, true, e); return; }
  if (COUNT_ON) { if (k === 'escape') closeCount(); return; }
  if (DOC_ON) { if (!e.repeat && ['e', ' ', 'enter', 'escape', 'у'].includes(k)) { e.preventDefault(); closeDoc(); } else if (!e.repeat && (k === 'f' || k === 'а')) flipDoc(); return; }
  if (SCOPE_ON) { if (!e.repeat && ['e', ' ', 'enter', 'escape', 'у'].includes(k)) { e.preventDefault(); closeScope(); } return; }
  if (MENU.open) { if (!e.repeat && MENU.key(k)) e.preventDefault(); return; }
  if (['e', ' ', 'enter', 'у'].includes(k)) { e.preventDefault(); if (!e.repeat) action(); }
  if ((k === 'i' || k === 'ш') && !e.repeat) togglePanel('inv');
  if ((k === 'j' || k === 'о') && !e.repeat) togglePanel('jr');
  if ((k === 'k' || k === 'л') && !e.repeat) togglePanel('atlas');
  if ((k === 'm' || k === 'ь') && !e.repeat) togglePanel('chart');
  if (k === 'escape') { if (!$('#panel').hidden) UI.close(); else if (P.fish) stopFishing(); }
  if (k.startsWith('arrow')) e.preventDefault();
});
addEventListener('keyup', e => { const k = e.key.toLowerCase(); K[k] = false; if (typeof MORSE_ON !== 'undefined' && MORSE_ON) morseKey(k, false, e); });
addEventListener('blur', () => { for (const k in K) K[k] = false; });
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
(function touchSetup() {
  const padEl = $('#pad'), knob = $('#knob'); let id = null;
  const mv = (t) => { const r = padEl.getBoundingClientRect(); let x = t.clientX - r.left - r.width / 2, y = t.clientY - r.top - r.height / 2; const d = Math.hypot(x, y), m = r.width * .38; if (d > m) { x *= m / d; y *= m / d; } knob.style.transform = `translate(${x}px,${y}px)`; pad.x = x / m; pad.y = y / m; if (Math.hypot(pad.x, pad.y) < .25) pad.x = pad.y = 0; };
  padEl.addEventListener('pointerdown', e => { id = e.pointerId; padEl.setPointerCapture(id); pad.on = true; mv(e); });
  padEl.addEventListener('pointermove', e => { if (e.pointerId === id) mv(e); });
  const up = e => { if (e.pointerId !== id) return; id = null; pad.on = false; pad.x = pad.y = 0; knob.style.transform = ''; };
  padEl.addEventListener('pointerup', up); padEl.addEventListener('pointercancel', up);
  $('#ta').addEventListener('pointerdown', e => { e.preventDefault(); action(); });
  $('#tb').addEventListener('click', () => { P.runToggle = !P.runToggle; $('#tb').classList.toggle('on', P.runToggle); });
})();
addEventListener('pointerdown', e => { if (G.mode === 'play' && !$('#dialog').hidden && !MENU.open && !e.target.closest('button,#panel,#dialog,#sndBox')) DLG.next(); });
$('#dialog').addEventListener('pointerdown', e => { e.stopPropagation(); DLG.next(); });

function action() {
  if (G.mode !== 'play') return;
  if (NAMEBOX.open) return;
  if (COUNT_ON) return;
  if (DOC_ON) return closeDoc();
  if (SCOPE_ON) return closeScope();
  if (MENU.open) return MENU.pick(MENU.sel);
  if (!$('#dialog').hidden) return DLG.next();
  if (!$('#panel').hidden || G.busy) return;
  if (P.fish) return fishAction();
  if (P.act) return;
  const t = G.target; if (t) { AU.blip(); if (t.npc) talk(t.npc); else t.use.run(); }
}

// ---------- dialogue ----------
const DLG = {
  q: [], cur: null, shown: 0, done: null,
  say(lines, done) { this.q = lines.slice(); this.done = done || null; this.cur = null; this.next(true); },
  next(first) {
    if (!first && this.cur && this.shown < this.cur.text.length) { this.shown = this.cur.text.length; $('#dTxt').textContent = this.cur.text; return; }
    const l = this.q.shift();
    if (!l) { $('#dialog').hidden = true; this.cur = null; const f = this.done; this.done = null; if (f) f(); return; }
    this.cur = { who: l[0], text: l[1], letter: l[2] }; this.shown = 0; this.vt = 0; $('#dTxt').textContent = '';
    $('#dialog').hidden = false; $('#dialog').classList.toggle('letter', !!l[2]); $('#dWho').textContent = l[0];
    const pc = $('#portrait').getContext('2d'); pc.imageSmoothingEnabled = false; pc.clearRect(0, 0, 48, 48);
    const look = this.look = NAME_LOOK[l[0]] || null;
    this.emo = typeof emoOf === 'function' ? emoOf(l[0], l[1]) : 'neutral';
    if (look && PORTRAIT[look]) drawPortrait(pc, look, true, G.time, this.emo);
    else if (look) drawPerson(pc, 24, 40, LOOKS[look], { dir: 0, noShadow: true });
    else { const ic = icon(l[0] === 'Рация' ? 'compass' : l[0] === 'Подсказка' ? 'lantern' : l[0].startsWith('Журнал') ? 'map' : l[0] === 'Указатель' ? 'map' : 'letter'); pc.drawImage(ic, 8, 8, 32, 32); }
  },
  update(dt) {
    if (this.cur && this.look && PORTRAIT[this.look]) drawPortrait($('#portrait').getContext('2d'), this.look, this.shown < this.cur.text.length, G.time, this.emo);
    if (!this.cur || this.shown >= this.cur.text.length) return;
    const before = Math.floor(this.shown); this.shown = Math.min(this.cur.text.length, this.shown + dt * 45); const now = Math.floor(this.shown);
    $('#dTxt').textContent = this.cur.text.slice(0, now);
    this.vt -= dt;
    if (now > before && this.vt <= 0) { const ch = this.cur.text[now - 1]; if (/[A-Za-zА-Яа-яЁё0-9]/.test(ch)) { const v = VOICES[this.cur.who] || (this.cur.letter ? VOICES._paper : VOICES._sign); if (v) AU.voice(v[0], v[1], v[2]); this.vt = .05; } }
  },
};
const say = (l, d) => DLG.say(l, d);
// voice: [base Hz, wave, volume] — low for old men, high for Соня
const VOICES = { 'Смотритель': [196, 'square', .1], 'Матвей': [123, 'square', .115], 'Лида': [330, 'square', .085], 'Соня': [466, 'triangle', .2], 'Громов': [147, 'sawtooth', .075], 'Капитан Белов': [110, 'sawtooth', .09], 'Рация': [600, 'sawtooth', .045], _paper: [880, 'triangle', .06], _sign: [520, 'triangle', .085] };

// ---------- toasts ----------
function toast(text, iconId, good) {
  const el = document.createElement('div'); el.className = 'toast pix';
  if (iconId) { const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.getContext('2d').drawImage(icon(iconId), 0, 0); el.appendChild(c); }
  const s = document.createElement('span'); s.textContent = text; if (good) s.style.color = 'var(--lamp)'; el.appendChild(s);
  $('#toasts').appendChild(el); setTimeout(() => el.remove(), 3200);
  while ($('#toasts').children.length > 4) $('#toasts').firstChild.remove();
}

// ---------- UI ----------
const pad2 = n => String(n).padStart(2, '0');
const UI = {
  hud() {
    $('#dayN').textContent = 'День ' + S.day; $('#wx').textContent = WX_NAME[S.weather] || '';
    $('#souv').textContent = '✦ ' + S.souv.length + '/' + SOUV_TOTAL;
  },
  clock() {
    const m = Math.floor(S.min) % 1440; $('#time').textContent = pad2(Math.floor(m / 60)) + ':' + pad2(Math.floor(m / 10) * 10 % 60);
    const h = m / 60; $('#tod').textContent = h < 10 ? 'утро' : h < 17 ? 'день' : h < 20.5 ? 'вечер' : 'ночь';
  },
  tasks() {
    const ul = $('#taskList'); ul.innerHTML = '';
    const add = (txt, done, q) => { const li = document.createElement('li'); if (done) li.className = 'done'; if (q) li.className = 'q'; li.innerHTML = '<span class="b"></span>'; const s = document.createElement('span'); s.textContent = txt; li.appendChild(s); ul.appendChild(li); };
    S.tasks.forEach(t => add(t.text + (t.n && !t.done ? ` ${t.c}/${t.n}` : ''), t.done));
    if (S.day === 3 && !S.power && !task('gen')) { }
    if (S.q.uha === 1) add(has('uha') ? 'Отнести уху Матвею' : 'Сварить уху для Матвея', false, 1);
    if (S.q.shells === 1) add(`Ракушки для Сони ${Math.min(5, S.inv.shell || 0)}/5`, false, 1);
    if (S.q.shells === 2 && S.day >= 6) add('Забрать картину у Сони', false, 1);
    if (S.flags.cat === 'kept' && S.flags.catFed !== S.day) add(catName() + ' ждёт рыбу на ужин', false, 1);
    if (S.flags.cat !== 'kept' && S.flags.cat !== 'gone' && (S.day > 3 || (S.day === 3 && S.min >= 420))) add('У дверей маяка сидит рыжий кот', false, 1);
    if (S.q.chick === 1) add(P.carry === 'chick' ? 'Отнести птенца к скалам с чайками' : 'Найти птенца в лесу', false, 1);
    if (has('map') && !S.flags.dug) add('Крестик на карте: утёс на северо-западе', false, 1);
    if (S.day === 6 && S.flags.legend && S.min >= 1230 && !S.flags.whalesSeen) add('Ночью — на смотровую площадку', false, 1);
    if (S.day === 7 && S.min >= 1020 && !S.flags.radio) add('Рация в фонарной мигает', false, 1);
    { const bl = boatQuestLine(); if (bl) add(bl, false, 1); nyuraLines().forEach(l => add(l, false, 1)); }
    const d = S.tasks.filter(t => t.done).length; $('#tasksT').textContent = d + '/' + S.tasks.length;
  },
  panel(tab) {
    $('#panel').hidden = false; document.querySelectorAll('#panel .tabs [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    const body = $('#pBody'); body.innerHTML = '';
    if (tab === 'inv') {
      const grid = document.createElement('div'); grid.id = 'grid';
      const ids = Object.keys(S.inv).filter(k => S.inv[k] > 0 && !ITEMS[k].souv).concat(S.souv);
      const desc = document.createElement('div'); desc.id = 'desc'; desc.innerHTML = '<span class="empty">Выберите предмет.</span>';
      ids.forEach(id => {
        const cell = document.createElement('button'); cell.type = 'button'; cell.className = 'cell' + (ITEMS[id].souv ? ' souv' : ''); cell.setAttribute('aria-label', ITEMS[id].n);
        const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.getContext('2d').drawImage(icon(id), 0, 0); cell.appendChild(c);
        if (!ITEMS[id].souv && S.inv[id] > 1) { const s = document.createElement('span'); s.textContent = S.inv[id]; cell.appendChild(s); }
        cell.onclick = () => { grid.querySelectorAll('.cell').forEach(x => x.classList.remove('sel')); cell.classList.add('sel'); UI.desc(desc, id); };
        grid.appendChild(cell);
      });
      const h1 = document.createElement('div'); h1.className = 'sect'; h1.textContent = `Вещи · сувениры ${S.souv.length} из ${SOUV_TOTAL} (сувениры с зелёной рамкой хранятся на полке в спальне)`;
      body.append(h1, grid, desc);
    } else if (tab === 'jr') {
      const h = document.createElement('div'); h.className = 'sect'; h.textContent = 'Журнал смотрителя'; body.appendChild(h);
      if (!S.journal.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Пока пусто. Записи делают вечером за столом в спальне.'; body.appendChild(e); }
      S.journal.forEach(j => { const e = document.createElement('div'); e.className = 'entry'; const b = document.createElement('b'); b.textContent = 'День ' + j.d; e.append(b, document.createTextNode(j.t)); body.appendChild(e); });
      const rd = ['letter', 'bottle', 'photo', 'act'].filter(k => has(k));
      if (rd.length) { const h2 = document.createElement('div'); h2.className = 'sect'; h2.textContent = 'Письма и находки'; body.appendChild(h2); rd.forEach(k => { const e = document.createElement('div'); e.className = 'entry'; const b = document.createElement('b'); b.textContent = TEXTS[k][0]; e.append(b, document.createTextNode(TEXTS[k][1])); e.classList.add('open'); e.tabIndex = 0; e.onclick = () => { UI.close(); openDoc(k); }; body.appendChild(e); }); }
    } else if (tab === 'atlas') { atlasTab(body);
    } else if (tab === 'rec') { recipesTab(body);
    } else if (tab === 'ach') { achTab(body);
    } else {
      body.innerHTML = '<div id="help"><div class="sect">Управление</div><kbd>WASD</kbd> или стрелки — идти · <kbd>Shift</kbd> — бег<br><kbd>E</kbd>, <kbd>Пробел</kbd> или <kbd>Enter</kbd> — действие, разговор, далее<br><kbd>I</kbd> — сумка · <kbd>J</kbd> — дневник · <kbd>M</kbd> — карта · <kbd>K</kbd> — атлас · <kbd>Esc</kbd> — закрыть<br>На телефоне: джойстик слева, кнопка A — действие.<div class="sect">Как играть</div>Каждое утро — новый список дел слева вверху. Огонь зажигают в фонарной наверху маяка с 17:00. Вечером — запись в дневнике за столом в спальне, потом сон. В дневник сами попадают события дня. Если не знаете, куда идти, откройте карту (M) и нажмите «Показать дорогу». Между делами можно гулять, собирать ракушки и ягоды и разговаривать с гостями острова. Игра сохраняется в начале каждого дня.<div class="sect">Ремесло и чай</div>Плавник и морское стекло лежат на пляжах, перья — у скал с чайками на востоке, верёвка — моток в сарае. Травы растут в лесах, больше всего — в Дальнем лесу за перешейком на востоке. Подарки мастерят на верстаке в сарае, чай заваривают на печи. Все рецепты — во вкладке «Рецепты». Подарок отдаётся сам, если заговорить с человеком, когда он лежит в сумке.<div class="sect">Атлас и рыбалка</div>Атлас (клавиша <kbd>K</kbd>) заполняется сам. Рыбачить можно с пирса, с камня на западе, на лесном озере и со скал на краю Дальнего леса: в каждом месте своя рыба, а ещё она зависит от времени и погоды. Птицы показываются в своих местах и в своё время. Письма, фотографию и акт проверки можно открыть из сумки или журнала.<div class="sect">«Надежда» и острова</div>Старую лодку Савелия на пляже у пирса можно починить: залатать дно (3 плавника и гаечный ключ), просмолить (живица с сосен, сваренная на печи), сделать вёсла на верстаке и спустить на воду. На вёслах можно доплыть до Тюленьего камня, с парусом — до Птичьего базара, где живёт орнитолог Нюра. На Тюленьем камне подходите к тюленям тихо, не бегом. В отлив (с 7 до 10 и с 15 до 18) открывается коса к старой шхуне. В грозу, туман и после 20:00 в море не выходят.<div class="sect">Отдых</div>На скамейках можно посидеть: время течёт быстрее. В подзорную трубу на смотровой площадке каждый день видно что-то новое, а ночью — созвездия.</div>';
    }
  },
  desc(el, id) {
    const it = ITEMS[id]; el.innerHTML = ''; const b = document.createElement('b'); b.textContent = it.n; el.append(b, document.createElement('br'), document.createTextNode(it.d));
    if (it.use) { const btn = document.createElement('button'); btn.className = 'btn'; btn.type = 'button'; btn.textContent = it.use; btn.onclick = () => useItem(id); el.append(document.createElement('br'), btn); }
  },
  close() { $('#panel').hidden = true; },
};
function togglePanel(tab) { if ($('#panel').hidden) UI.panel(tab); else UI.close(); }
document.querySelectorAll('#panel .tabs [data-tab]').forEach(b => b.onclick = () => UI.panel(b.dataset.tab));
$('#pClose').onclick = () => UI.close();
$('#panel').addEventListener('pointerdown', e => { if (e.target.id === 'panel') UI.close(); });
$('#bInv').onclick = () => togglePanel('inv'); $('#bJr').onclick = () => togglePanel('jr');
// sound settings: a little panel under the button — volume and the rain noise
const sndLabel = () => { $('#bSnd').textContent = !AU.on || AU.vol === 0 ? 'Тихо' : 'Звук'; };
$('#bSnd').onclick = e => { e.stopPropagation(); const box = $('#sndBox'); box.hidden = !box.hidden; if (!box.hidden) { $('#sndVol').value = AU.on ? Math.round(AU.vol * 100) : 0; $('#sndVolN').textContent = $('#sndVol').value + '%'; $('#sndRain').checked = AU.rainOn; $('#sndVol').focus(); } };
$('#sndVol').oninput = () => { const v = +$('#sndVol').value; $('#sndVolN').textContent = v + '%'; AU.setVol(v / 100); sndLabel(); };
$('#sndRain').onchange = () => AU.setRain($('#sndRain').checked);
$('#sndX').onclick = () => { $('#sndBox').hidden = true; };
addEventListener('pointerdown', e => { if (!$('#sndBox').hidden && !e.target.closest('#sndBox,#bSnd')) $('#sndBox').hidden = true; });
sndLabel();
$('#tasksH').onclick = () => $('#tasks').classList.toggle('min');
function useItem(id) {
  UI.close();
  if (id === 'berries') { take('berries'); return say([[HERO, 'Брусника кислая и холодная. Как в детстве у бабушки.']]); }
  if (DOC_NAMES[id]) return openDoc(id);
  if (TEXTS[id]) { P.reading = 2; return say([TEXTS[id].concat(['letter'])]); }
}

// ---------- movement & collision ----------
function solidAt(m, x, y) { return SOLID.has(tAt(m, Math.floor(x / T), Math.floor(y / T))); }
function blocked(x, y) {
  const m = MAP, x0 = x - 5, x1 = x + 5, y0 = y - 4, y1 = y;
  if (solidAt(m, x0, y0) || solidAt(m, x1, y0) || solidAt(m, x0, y1) || solidAt(m, x1, y1) || solidAt(m, x, y0)) return true;
  for (const o of m.objs) { if (!o.solid || (o.on && !o.on())) continue; const [ox, oy, w, h] = o.solid; const ax = o.x + ox, ay = o.y + oy; if (x1 > ax && x0 < ax + w && y1 > ay && y0 < ay + h) return true; }
  for (const n of G.npcs) { if (n.moving) continue; if (x1 > n.x - 5 && x0 < n.x + 5 && y1 > n.y - 4 && y0 < n.y) return true; }
  return false;
}
const DIRV = [[0, 1], [-1, 0], [1, 0], [0, -1]];
function updatePlayer(dt) {
  let ix = 0, iy = 0;
  const free = $('#dialog').hidden && $('#panel').hidden && !MENU.open && !NAMEBOX.open && !SCOPE_ON && !DOC_ON && !COUNT_ON && !MORSE_ON && !G.busy && !P.act && !P.fish && G.mode === 'play';
  if (free) {
    if (K.a || K.arrowleft || K['ф']) ix -= 1; if (K.d || K.arrowright || K['в']) ix += 1; if (K.w || K.arrowup || K['ц']) iy -= 1; if (K.s || K.arrowdown || K['ы']) iy += 1;
    if (pad.on) { ix = pad.x; iy = pad.y; }
  }
  if (P.sit) { if (Math.hypot(ix, iy) > .3) standUp(); else { ix = iy = 0; P.sit.t += dt; } }
  const len = Math.hypot(ix, iy); P.moving = len > .1;
  P.run = (K.shift || P.runToggle) && !P.carry;
  if (P.moving) {
    ix /= Math.max(1, len); iy /= Math.max(1, len);
    const sp = (P.carry ? 46 : P.run ? 100 : 60) * dt;
    // facing: keep the current side until the other axis clearly wins, so a diagonal doesn't flicker between sprites
    const ax = Math.abs(ix), ay = Math.abs(iy), side = P.dir === 1 || P.dir === 2;
    if (side ? ay > ax * 1.3 : ax > ay * 1.3) P.dir = ax > ay ? (ix < 0 ? 1 : 2) : (iy < 0 ? 3 : 0);
    else if (side && ix) P.dir = ix < 0 ? 1 : 2; else if (!side && iy) P.dir = iy < 0 ? 3 : 0; else P.dir = ax > ay ? (ix < 0 ? 1 : 2) : (iy < 0 ? 3 : 0);
    // on a clean diagonal both axes step on the same frame (no staircase wobble)
    const diag = ax > .2 && ay > .2 && Math.abs(ax - ay) < .12;
    if (diag) { const m = (ax + ay) / 2; ix = Math.sign(ix) * m; iy = Math.sign(iy) * m; const fx = P.x - Math.floor(P.x); P.y = Math.floor(P.y) + (Math.sign(ix) === Math.sign(iy) ? fx : (1 - fx) % 1); }
    const nx = P.x + ix * sp; if (!blocked(nx, P.y)) P.x = nx;
    const ny = P.y + iy * sp; if (!blocked(P.x, ny)) P.y = ny;
    P.animT += dt * (P.run ? 13 : 8); P.frame = Math.floor(P.animT) % 4;
    if (P.run && Math.random() < dt * 14 && MAP.outdoor) G.parts.push({ x: P.x + (Math.random() - .5) * 6, y: P.y, vx: 0, vy: -6, life: .4, col: 'rgba(200,180,140,.7)', s: 1 });
  } else { P.frame = 0; }
  // act
  if (P.act) { P.act.t += dt; if (Math.random() < dt * 10) actParticles(); if (P.act.t >= P.act.dur) { const f = P.act.fn; P.act = null; f && f(); } }
  if (P.reading > 0) P.reading -= dt;
  // exits
  if (MAP.id === 'house' && P.y > 11 * T + 3 && Math.abs(P.x - 9 * T) < 16) exitHouse(); // only through the door gap
  if (MAP.id === 'shed' && P.y > 9 * T + 3 && Math.abs(P.x - 6 * T) < 16) exitShed();
  if (MAP.id === 'island' && Math.hypot(P.x - 84 * T, P.y - 22 * T) < 5 * T) unlock('explorer');
  // target
  G.target = null;
  if ((free || (!$('#dialog').hidden)) && !P.sit) {
    const [dx, dy] = DIRV[P.dir], fx = P.x + dx * 9, fy = P.y - 4 + dy * 9; let best = null, bd = 1e9;
    for (const o of MAP.objs) {
      if (!o.use || (o.on && !o.on())) continue; const lab = o.use.label(); if (!lab) continue;
      const tx = o.ix ?? o.x, ty = o.iy ?? (o.y - 4), d = Math.hypot(fx - tx, fy - ty); const r = o.r || 14;
      if (d < r + 4 && d < bd) { bd = d; best = { o, use: o.use, label: lab, x: tx, y: ty - 18 }; }
    }
    for (const n of G.npcs) { const d = Math.hypot(fx - n.x, fy - (n.y - 4)); if (d < 18 && d < bd) { bd = d; best = { npc: n.id, label: 'Поговорить: ' + NPCS[n.id].name, x: n.x, y: n.y - 28 }; } }
    G.target = free ? best : null;
  }
  const pr = $('#prompt');
  if (G.target) { pr.hidden = false; const k = isTouch ? 'A' : 'E'; if (pr.dataset.l !== G.target.label) { pr.dataset.l = G.target.label; pr.innerHTML = ''; const b = document.createElement('b'); b.textContent = k; pr.append(b, document.createTextNode(G.target.label)); } }
  else if (P.sit && free) { const l = 'Отдыхаете. Время идёт быстрее. Шаг в сторону — встать'; if (pr.dataset.l !== l) { pr.dataset.l = l; pr.textContent = l; } pr.hidden = false; }
  else if (P.fish) { pr.hidden = false; const l = P.fish.state === 'bite' ? 'Тяни!' : 'Ждём поклёвку… (движение — смотать)'; if (pr.dataset.l !== l) { pr.dataset.l = l; pr.innerHTML = ''; const b = document.createElement('b'); b.textContent = isTouch ? 'A' : 'E'; pr.append(b, document.createTextNode(l)); } }
  else pr.hidden = true;
}
function startAct(kind, dur, fn) { P.act = { kind, t: 0, dur, fn }; }
function actParticles() {
  const k = P.act.kind, [dx, dy] = DIRV[P.dir], x = P.x + dx * 10, y = P.y - 6 + dy * 8;
  if (k === 'sweep') G.parts.push({ x: x + (Math.random() - .5) * 8, y: y + 4, vx: (Math.random() - .5) * 20, vy: -10, life: .5, col: 'rgba(170,150,120,.8)', s: 1 });
  if (k === 'fix' || k === 'light') G.parts.push({ x: x + (Math.random() - .5) * 6, y: y - 6, vx: (Math.random() - .5) * 40, vy: -30 - Math.random() * 20, life: .35, col: k === 'light' ? '#fff3b0' : '#ffd477', s: 1 });
  if (k === 'cook') G.parts.push({ x: x + (Math.random() - .5) * 8, y: y - 10, vx: 0, vy: -14, life: 1, col: 'rgba(240,240,240,.5)', s: 2 });
  if (k === 'rag') G.parts.push({ x: x + (Math.random() - .5) * 10, y: y - 14, vx: 0, vy: -8, life: .5, col: '#ffffff', s: 1 });
}

// ---------- fishing ----------
function startFishing(spot) {
  let dir = -1; for (const d of [P.dir, 0, 1, 2, 3]) { const [dx, dy] = DIRV[d]; if (isWater(tAt(MAP, Math.floor((P.x + dx * 28) / T), Math.floor((P.y - 2 + dy * 28) / T)))) { dir = d; break; } }
  if (dir < 0) return say([[HERO, 'Отсюда до воды не достать.']]);
  P.dir = dir; const [dx, dy] = DIRV[dir];
  P.fish = { state: 'wait', t: 0, bite: 1.6 + Math.random() * 3.4, spot: spot || 'pier', bx: P.x + dx * 28, by: P.y - 2 + dy * 28 + (dy === 0 ? 4 : 0) };
}
function fishAction() {
  const f = P.fish;
  if (f.state === 'bite') { stopFishing(); catchFish(f.spot); if (open('fish')) progress('fish'); S.stats.fish = (S.stats.fish || 0) + 1; if (S.stats.fish >= 10) unlock('fisher'); return; }
  stopFishing(); toast('Смотал удочку');
}
function stopFishing() { P.fish = null; }
function updateFishing(dt) {
  const f = P.fish; if (!f) return; f.t += dt;
  if ((K.w || K.a || K.s || K.d || K.arrowup || K.arrowdown || K.arrowleft || K.arrowright || pad.on && Math.hypot(pad.x, pad.y) > .5)) { stopFishing(); return; }
  if (f.state === 'wait' && f.t > f.bite) { f.state = 'bite'; f.bt = 0; AU.blip(); }
  if (f.state === 'bite') { f.bt += dt; if (f.bt > 1.1) { f.state = 'wait'; f.t = 0; f.bite = 1.5 + Math.random() * 3; toast('Сорвалась! Ещё разок'); } }
}

// ---------- map transitions ----------
function goTo(id, x, y, dir) {
  G.busy = 1; $('#fade').classList.add('on');
  setTimeout(() => { MAP = MAPS[id]; P.x = x; P.y = y; P.dir = dir; snapCam(); G.busy = 0; $('#fade').classList.remove('on'); if (id === 'lamp' && S.day === 7 && S.min >= 1020 && !S.flags.radio) toast('Рация мигает'); }, 420);
}
function exitHouse() { if (G.busy) return; goTo('island', WORLD.lh.x, WORLD.lh.y + 12, 0); }
function snapCam() { const t = camTarget(); G.cam.x = t.x; G.cam.y = t.y; }
function camTarget() {
  const mw = MAP.w * T, mh = MAP.h * T; let x = Math.round(P.x) - (VW >> 1), y = Math.round(P.y) - 14 - (VH >> 1); // whole pixels, so the keeper never wobbles on screen
  if (MAP.outdoor) { x = clamp(x, -T * 2, mw - VW + T * 2); y = clamp(y, -T * 8, mh - VH + T * 2); }
  else { x = mw < VW ? (mw - VW) / 2 : clamp(x, 0, mw - VW); y = mh < VH ? (mh - VH) / 2 - 6 : clamp(y, -20, mh - VH); }
  return { x, y };
}

// ---------- day flow ----------
function setupDay() {
  const D = DAYS[S.day];
  S.weather = D.w; S.lampLit = false; S.power = true; S.min = 360;
  S.tasks = D.tasks.map(id => ({ id, text: TASK[id].t, n: TASK[id].n, c: 0, done: false }));
  if (S.day === 5) task('lamp').text = 'Зажечь маяк (в туман — с 12:00)';
  S.total += S.tasks.length; S.flags.woodIn = 0; S.flags.unloaded = 0; G.trig = {};
  if (S.day === 7) S.flags.letter7 = 0;
  spawnDaily(); catNewDay(); UI.hud(); UI.tasks(); save();
  G.clouds = Array.from({ length: 6 }, (_, i) => ({ x: Math.random() * 1100, y: Math.random() * 800, r: 60 + Math.random() * 80 }));
}
function beginDay(first) {
  MAP = MAPS.house;
  if (first) { MAP = MAPS.island; P.x = WORLD.lh.x; P.y = WORLD.lh.y + 14; P.dir = 0; }
  else { P.x = 13.4 * T; P.y = 5.2 * T; P.dir = 0; }
  P.carry = null; P.fish = null; P.act = null; P.sit = null;
  snapCam();
  const dc = $('#daycard'); $('#dcN').textContent = 'День ' + S.day; $('#dcS').textContent = DAYS[S.day].sub; $('#dcW').textContent = 'Погода: ' + WX_NAME[S.weather];
  G.busy = 1; dc.classList.add('on'); $('#fade').classList.add('on');
  setTimeout(() => { dc.classList.remove('on'); $('#fade').classList.remove('on'); }, 2200);
  setTimeout(() => { G.busy = 0; say(MORNING[S.day], () => { if (S.day === 7) { S.flags.letter7 = 1; } soulMorning(); }); }, 2800);
}
function sleep() {
  G.busy = 1; $('#fade').classList.add('on');
  setTimeout(() => { S.day++; setupDay(); G.busy = 0; beginDay(false); }, 900);
}
function checkEvents() {
  const tr = (k, cond, fn) => { if (!G.trig[k] && cond) { G.trig[k] = 1; fn(); } };
  tr('noon', S.min >= 720 && S.day === 5, () => toast('Полдень. В туман огонь можно зажечь уже сейчас'));
  tr('evening', S.min >= 1020 && S.day !== 5, () => toast('17:00 — пора зажигать маяк'));
  if (S.day === 2) tr('terns', S.min >= 420, () => toast('На западный пляж прилетели полярные крачки'));
  if (S.day === 2) tr('mat', S.min >= visitAt('matvey', 2, 'walk'), () => toast('К пирсу причалила лодка рыбака'));
  if (S.day === 3) {
    tr('storm', S.min >= 1080, () => { S.weather = 'storm'; UI.hud(); toast('Начинается шторм'); });
    tr('outage', S.min >= 1140, () => { S.power = false; const was = S.lampLit; S.lampLit = false; const l = task('lamp'); if (l.done) { l.done = false; S.done--; } S.tasks.splice(S.tasks.indexOf(l), 0, { id: 'gen', text: TASK.gen.t, c: 0, done: false }); S.total++; UI.tasks(); say([[HERO, was ? 'Свет погас! Огонь маяка потух — в такую-то ночь.' : 'Свет погас во всём доме.'], [HERO, 'Генератор в сарае на востоке. Скорее туда, а потом — наверх, снова зажигать огонь.']]); });
  }
  if (S.day === 3) tr('cat', S.min >= 420 && !S.flags.cat, () => { toast('У дверей маяка мяукает рыжий кот'); UI.tasks(); });
  if (S.flags.cat === 'kept' && S.day >= 3) tr('catfood', S.min >= 720 && S.flags.catFed !== S.day, () => toast(catName() + ' ходит за вами и выразительно смотрит. Похоже, ждёт рыбу'));
  if (S.day === 4) tr('post', S.min >= visitAt('lida', 4, 'walk'), () => toast('Приплыла почтовая лодка'));
  if (S.day === 5) tr('insp', S.min >= visitAt('gromov', 5, 'stand'), () => toast('Инспектор ждёт у дверей маяка'));
  if (S.day === 6) { tr('ship', S.min >= visitAt('belov', 6, 'walk'), () => toast('«Северянка» у пирса')); tr('whale', S.min >= 1230, () => { toast('С моря доносится странное пение…'); UI.tasks(); }); tr('matEve', S.min >= visitAt('matvey', 6, 'stand'), () => toast('Матвей ждёт у пирса. Хочет что-то рассказать')); }
  if (S.day === 7) { tr('radio', S.min >= 1020, () => { toast('Рация в фонарной мигает'); UI.tasks(); }); tr('farewell', S.min >= Math.max(visitAt('matvey', 7, 'stand', 1), visitAt('lida', 7, 'stand', 1), visitAt('sonya', 7, 'stand', 1)), () => toast('Все собрались у пирса')); }
  if (S.min >= 1440) {
    if (S.day === 7) { tr('late', true, () => startEnding()); }
    else tr('faint', true, () => say([[HERO, 'Глаза слипаются... Пора спать, где бы я ни был.']], sleep));
  }
  // ending trigger
  if (S.day === 7 && S.lampLit && MAP.id === 'island' && P.y > 41 * T && P.x > 29.5 * T && P.x < 32.5 * T && !G.ending) { G.ending = 1; progress('pierEnd'); setTimeout(() => farewell(startEnding), 600); }
}

// ---------- environment ----------
const DARK_K = [[0, .84], [5, .84], [6, .5], [7, .12], [8, 0], [17, 0], [18.3, .1], [19.3, .42], [20.3, .7], [21.3, .82], [24, .84]];
const TINT_K = [[0, [70, 90, 160, .35]], [5.5, [70, 90, 160, .35]], [6.5, [255, 190, 160, .3]], [8.5, [255, 230, 200, .05]], [16, [255, 240, 220, 0]], [17.3, [255, 200, 140, .3]], [18.6, [255, 130, 70, .55]], [19.6, [190, 110, 150, .45]], [20.6, [90, 100, 170, .38]], [21.5, [70, 90, 160, .35]], [24, [70, 90, 160, .35]]];
function kf(K, h) { for (let i = 0; i < K.length - 1; i++) if (h >= K[i][0] && h <= K[i + 1][0]) { const t = (h - K[i][0]) / (K[i + 1][0] - K[i][0]); const a = K[i][1], b = K[i + 1][1]; return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], t)) : lerp(a, b, t); } return K[K.length - 1][1]; }
function env() {
  const h = (S.min % 1440) / 60, w = S.weather;
  let dark = kf(DARK_K, h);
  const wAdd = { rain: .14, storm: .26, fog: .08, cloudy: .06, windy: .03 }[w] || 0;
  dark = clamp(dark + wAdd * (1 - dark * .5), 0, .9);
  G.dark = dark; G.tint = kf(TINT_K, h);
  G.sunset = (w === 'rain' || w === 'storm' || w === 'fog') ? 0 : clamp(1 - Math.abs(h - 18.6) / 1.4, 0, 1);
  G.rain = w === 'rain' || w === 'storm'; G.storm = w === 'storm'; G.fog = w === 'fog';
  G.wind = { windy: 2.2, storm: 3, rain: 1.4, cloudy: 1, fog: .3 }[w] ?? .6;
  const sunA = clamp(1 - dark * 1.6, 0, 1) * (G.rain || G.fog ? .25 : w === 'cloudy' ? .55 : 1);
  const ang = (h - 12) / 6; G.sh = { a: Math.max(sunA, dark > .6 ? .25 : 0), dx: clamp(ang, -1.3, 1.3), dy: .5 };
  G.weather = w;
}

// ---------- update ----------
function update(dt) {
  G.time += dt; if (G.mode === 'sail') sailUpdate(dt);
  if (G.mode === 'play') {
    const paused = !$('#dialog').hidden || !$('#panel').hidden || G.busy || MENU.open || NAMEBOX.open || SCOPE_ON || DOC_ON || COUNT_ON || MORSE_ON;
    if (!paused) { S.min += dt * MIN_RATE * (P.sit && !G.quiet ? 4 : 1); checkEvents(); }
    env(); UI.clock();
    G.npcs = []; G.boats = [];
    if (MAP.id === 'island') { const v = visitsNow(); G.npcs = v.npcs; G.boats = v.boats; }
    if (MAP.id === 'cliffs' && nyuraHere()) G.npcs = [{ id: 'nyura', x: 14.6 * T, y: 31.7 * T, dir: 1, moving: false }];
    // NPCs face player when near
    for (const n of G.npcs) { const dx = P.x - n.x, dy = P.y - n.y; if (!n.moving && Math.hypot(dx, dy) < 40) n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); }
    soulTick(dt); updatePlayer(dt); updateFishing(dt); updateCat(dt); atlasTick(); islandTick(dt); DLG.update(dt);
    const c = camTarget(); // follow the keeper exactly while walking (pixel-locked, no diagonal shimmer); glide only on big jumps
    if (Math.hypot(c.x - G.cam.x, c.y - G.cam.y) < 24) { G.cam.x = c.x; G.cam.y = c.y; } else { G.cam.x = lerp(G.cam.x, c.x, Math.min(1, dt * 8)); G.cam.y = lerp(G.cam.y, c.y, Math.min(1, dt * 8)); }
    updateFx(dt);
    AU.update(dt, { outdoor: MAP.outdoor, high: MAP.high, indoor: MAP.indoor && !MAP.high, rain: G.rain, storm: G.storm, wind: G.wind > 1.2, daylight: G.dark < .3, evening: S.min >= 1020, house: MAP.id === 'house', lamp: MAP.id === 'lamp', shed: MAP.id === 'shed', night: G.dark > .6, fog: G.fog, whales: S.day === 6 && S.min >= 1230 && MAP.outdoor, whaleNear: P.x > 40 * T && P.y < 18 * T });
    AU.setMode(soulMusicMode());
  } else {
    AU.update(dt, { outdoor: true, daylight: false, rain: false, wind: false });
  }
}
function updateFx(dt) {
  // particles
  for (const p of G.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  G.parts = G.parts.filter(p => p.life > 0);
  // rain
  const want = G.rain && !MAP.indoor || (G.rain && MAP.high) ? Math.floor(VW * VH / (G.storm ? 260 : 420)) : 0;
  while (G.rainP.length < want) G.rainP.push({ x: Math.random() * VW, y: Math.random() * VH, s: .7 + Math.random() * .6 });
  if (G.rainP.length > want) G.rainP.length = want;
  for (const r of G.rainP) { r.y += 230 * r.s * dt; r.x += G.wind * 18 * dt; if (r.y > VH) { if (Math.random() < .4) G.parts.push({ x: r.x + G.cam.x, y: r.y - Math.random() * VH * .5 + G.cam.y, vx: 0, vy: 0, life: .15, col: 'rgba(200,220,255,.6)', s: 2, splash: 1 }); r.y = -5; r.x = Math.random() * VW; } if (r.x > VW) r.x -= VW; }
  // lightning
  if (G.storm && MAP.id !== 'house' && Math.random() < dt * .12) { G.flash = 1; AU.thunder(); }
  if (G.storm && MAP.indoor && !MAP.high && Math.random() < dt * .08) { G.flash = .4; AU.thunder(); }
  G.flash = Math.max(0, G.flash - dt * 2.2);
  // clouds
  for (const c of G.clouds) { c.x += (8 + G.wind * 6) * dt; if (c.x > MAPS.island.w * T + 200) c.x = -200; }
  // smoke from chimney
  if (MAP.id === 'island' && Math.random() < dt * 3) G.parts.push({ x: WORLD.lh.x + 20 + Math.random() * 2, y: WORLD.lh.y - 32, vx: 4 + G.wind * 5, vy: -9, life: 3, col: 'rgba(225,225,225,.35)', s: 3, smoke: 1 });
  // leaves on windy days
  if (MAP.outdoor && G.wind > 1.2 && Math.random() < dt * 4) G.leaves.push({ x: G.cam.x - 10, y: G.cam.y + Math.random() * VH, vy: (Math.random() - .5) * 10, t: Math.random() * 6, life: 8 });
  for (const l of G.leaves) { l.x += (40 + G.wind * 20) * dt; l.y += (l.vy + Math.sin(G.time * 3 + l.t) * 12) * dt; l.life -= dt; }
  G.leaves = G.leaves.filter(l => l.life > 0 && l.x < G.cam.x + VW + 20);
  // fireflies in forest at night
  if (MAP.id === 'island' && G.dark > .5 && !G.rain && G.flies.length < 18) G.flies.push(Math.random() < .5 ? { x: (7 + Math.random() * 13) * T, y: (16 + Math.random() * 17) * T, t: Math.random() * 10 } : { x: (66 + Math.random() * 26) * T, y: (16 + Math.random() * 24) * T, t: Math.random() * 10 });
  if (G.dark < .4) G.flies.length = 0;
  for (const f of G.flies) { f.t += dt; f.x += Math.sin(f.t * .7) * 6 * dt; f.y += Math.cos(f.t * .9) * 5 * dt; }
  // gulls
  for (const g of WORLD.gulls) {
    const d = Math.hypot(P.x - g.hx, P.y - g.hy);
    if (!g.fly && MAP.id === 'island' && d < 34) { g.fly = true; g.t = 0; g.vx = (g.hx - P.x) / d * 40; g.vy = -30; }
    if (g.fly) { g.t += dt; if (g.t < 6) { g.x += g.vx * dt; g.y += g.vy * dt; g.vy *= .99; } else { g.x = lerp(g.x, g.hx, dt * 1.5); g.y = lerp(g.y, g.hy, dt * 1.5); if (g.t > 10 && d > 50 && Math.hypot(g.x - g.hx, g.y - g.hy) < 2) { g.fly = false; g.x = g.hx; g.y = g.hy; } } }
  }
}

// ---------- draw world ----------
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (G.mode === 'title') return drawSide(ctx, VW, VH, G.time, { night: true, islandX: VW * .38, s: 1, title: 1 });
  if (G.mode === 'ending') return drawEnding();
  if (G.mode === 'sail') return drawSail();
  const cam = { x: Math.round(G.cam.x), y: Math.round(G.cam.y) };
  ctx.fillStyle = MAP.indoor && !MAP.high ? '#120d0b' : '#163f5c'; ctx.fillRect(0, 0, VW, VH);
  if (MAP.outdoor) drawWater(ctx, MAP, cam, VW, VH, G.time, G.dark, G.sunset);
  if (MAP.high) drawFarSea(cam);
  ctx.drawImage(MAP.ground, -cam.x, -cam.y);
  // decor
  const inView = (x, y, m = 40) => x > cam.x - m && x < cam.x + VW + m && y > cam.y - m && y < cam.y + VH + m * 2;
  if (MAP.decor) for (const d of MAP.decor) { if (!inView(d.x, d.y, 10)) continue; if (d.k === 'tuft') drawTuft(ctx, d.x - cam.x, d.y - cam.y, G.time, G.wind, d.s, d.col); else drawFlower(ctx, d.x - cam.x, d.y - cam.y, G.time, G.wind, d.s); }
  // light patches from windows indoors
  if (MAP.id === 'house' && G.dark < .5) { ctx.fillStyle = `rgba(255,240,200,${.12 * (1 - G.dark * 2)})`; [[5, 2], [13.2, 2]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x * T - 8 - cam.x, y * T - cam.y); ctx.lineTo(x * T + 8 - cam.x, y * T - cam.y); ctx.lineTo(x * T + 16 - cam.x, y * T + 40 - cam.y); ctx.lineTo(x * T - 10 - cam.x, y * T + 40 - cam.y); ctx.fill(); }); }
  // sorted drawables
  const list = [];
  for (const o of MAP.objs) { if (o.on && !o.on()) continue; if (!inView(o.x, o.y, 140)) continue; list.push({ y: o.layer ? -1e6 + o.y : o.y, f: () => o.draw(ctx, Math.round(o.x - cam.x), Math.round(o.y - cam.y)) }); }
  for (const n of G.npcs) list.push({ y: n.y, f: () => { const cr = n.id === 'sonya' && n.moving; if (cr) drawSonyaCarry(ctx, n.x - cam.x, n.y - cam.y, n.dir, 'back'); drawPerson(ctx, n.x - cam.x, n.y - cam.y, LOOKS[NPCS[n.id].look], { dir: n.dir, moving: n.moving, frame: Math.floor(G.time * 8) % 4, t: G.time + n.x, sdx: G.sh.dx * 2 }); if (cr) drawSonyaCarry(ctx, n.x - cam.x, n.y - cam.y, n.dir, 'front'); } });
  for (const b of G.boats || []) list.push({ y: b.y, f: () => drawBoatKind(ctx, b.x - cam.x, b.y - cam.y, b.kind, G.time, b.moving, b.x / T) });
  list.push({ y: P.y, f: drawHero });
  list.sort((a, b) => a.y - b.y); list.forEach(d => d.f());
  // whales
  if (MAP.id === 'island' && S.day === 6 && S.min >= 1230) for (let k = 0; k < 3; k++) drawWhale(ctx, 49 * T + k * 34 - cam.x, 7.6 * T + k * 9 - cam.y, G.time, k);
  // gulls
  if (MAP.id === 'island') for (const g of WORLD.gulls) if (inView(g.x, g.y)) drawGull(ctx, g.x - cam.x, g.y - cam.y, G.time, g.seed, g.fly);
  if (MAP.id === 'island' && S.day === 2 && G.dark < .5) for (let k = 0; k < 4; k++) { const a = G.time * .3 + k * 1.6; drawGull(ctx, 20 * T + Math.cos(a) * 60 - cam.x, 33 * T + Math.sin(a) * 25 - cam.y, G.time, k, true); }
  // particles
  for (const p of G.parts) { ctx.globalAlpha = clamp(p.life * (p.smoke ? .5 : 2), 0, 1); if (p.splash) { R(ctx, p.x - cam.x - 1, p.y - cam.y, 1, 1, p.col); R(ctx, p.x - cam.x + 1, p.y - cam.y, 1, 1, p.col); } else R(ctx, p.x - cam.x, p.y - cam.y, p.s + (p.smoke ? (3 - p.life) * 1.5 : 0), p.s + (p.smoke ? (3 - p.life) * 1.5 : 0), p.col); }
  ctx.globalAlpha = 1;
  for (const l of G.leaves) R(ctx, l.x - cam.x, l.y - cam.y, 2, 1, Math.sin(l.t + G.time * 6) > 0 ? '#c9a24a' : '#7aa04a');
  // fishing line
  if (P.fish) drawFishing(cam);
  // cloud shadows
  if (MAP.outdoor && !G.fog && G.dark < .6) for (const c of G.clouds) { const g = ctx.createRadialGradient(c.x - cam.x, c.y - cam.y, 0, c.x - cam.x, c.y - cam.y, c.r); const a = G.weather === 'cloudy' || G.rain ? .16 : .09; g.addColorStop(0, `rgba(20,30,60,${a})`); g.addColorStop(1, 'rgba(20,30,60,0)'); ctx.fillStyle = g; ctx.fillRect(c.x - c.r - cam.x, c.y - c.r - cam.y, c.r * 2, c.r * 2); }
  // fog
  if (G.fog && (MAP.outdoor || MAP.high)) { ctx.fillStyle = 'rgba(214,222,228,.32)'; ctx.fillRect(0, 0, VW, VH); for (let k = 0; k < 7; k++) { const fx = ((G.time * (6 + k) + k * 230) % (VW + 300)) - 150, fy = (k * 97 + Math.sin(G.time * .2 + k) * 30) % VH; const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 120); g.addColorStop(0, 'rgba(230,236,240,.45)'); g.addColorStop(1, 'rgba(230,236,240,0)'); ctx.fillStyle = g; ctx.fillRect(fx - 120, fy - 120, 240, 240); } }
  // tint + darkness + lights
  drawLighting(cam);
  // rain
  if (G.rainP.length) { ctx.fillStyle = 'rgba(200,215,240,.55)'; for (const r of G.rainP) { ctx.fillRect(r.x | 0, r.y | 0, 1, 4 * r.s); } }
  if (G.flash > 0) { ctx.fillStyle = `rgba(230,240,255,${G.flash * .55})`; ctx.fillRect(0, 0, VW, VH); }
  // target marker
  if (G.target && $('#dialog').hidden) { const bx = Math.round(G.target.x - cam.x), by = Math.round(G.target.y - cam.y + Math.sin(G.time * 5) * 1.5); R(ctx, bx - 2, by, 5, 1, '#ffc95c'); R(ctx, bx - 1, by + 1, 3, 1, '#ffc95c'); R(ctx, bx, by + 2, 1, 1, '#ffc95c'); }
}
function drawHero() {
  const cam = { x: Math.round(G.cam.x), y: Math.round(G.cam.y) }, x = Math.round(P.x) - cam.x, y = Math.round(P.y) - cam.y;
  const acting = !!P.act || P.reading > 0;
  drawPerson(ctx, x, y, LOOKS.hero, { dir: P.dir, frame: P.frame, moving: P.moving, act: acting, t: G.time, sdx: G.sh.dx * 2, sit: !!P.sit, noShadow: !!P.sit });
  if (G.caught && G.time - G.caught.t < 1.8) { const k = G.time - G.caught.t, hop = Math.round(Math.min(1, k * 4) * 8 + Math.sin(k * 9) * (k < .8 ? 1 : 0)); ctx.drawImage(icon(G.caught.id), x - 8, y - 38 - hop); }
  const [dx, dy] = DIRV[P.dir];
  if (P.act) {
    const k = P.act.kind, t = P.act.t, hx = x + dx * 6, hy = y - 8 + dy * 3;
    if (k === 'sweep') { const s = Math.sin(t * 14) * 4; R(ctx, hx + s, hy - 4, 1, 10, '#8a5a32'); R(ctx, hx + s - 2, hy + 5, 5, 2, '#d9b88a'); }
    if (k === 'fix') { const s = Math.sin(t * 16) > 0 ? 1 : -1; R(ctx, hx + s, hy - 2, 5, 2, '#9ca1aa'); }
    if (k === 'rag') { R(ctx, hx + Math.sin(t * 12) * 3, hy - 10, 4, 3, '#e8d8a8'); }
    if (k === 'write') { R(ctx, hx, hy - 6, 1, 4, '#2c2f38'); }
    if (k === 'pick') { }
  }
  if (P.reading > 0) { R(ctx, x - 4, y - 12, 8, 6, '#f2e6cc'); R(ctx, x - 3, y - 10, 6, 1, '#c9b48a'); }
  if (P.fish) { R(ctx, x + dx * 4, y - 10, 1, 1, '#8a5a32'); }
  if (P.carry === 'crate') drawCrate(ctx, x, y - 22, { a: 0, dx: 0, dy: 0 }, false);
  if (P.carry === 'chick') drawChick(ctx, x, y - 19, 0);
}
function drawFishing(cam) {
  const f = P.fish, [dx, dy] = DIRV[P.dir];
  const tipX = P.x + dx * 14 - cam.x, tipY = P.y - 22 + dy * 6 - cam.y;
  const bob = f.state === 'bite' ? Math.sin(G.time * 30) * 1.5 + 2 : Math.sin(G.time * 3) * 1;
  const bx = f.bx - cam.x, by = f.by - cam.y + bob;
  ctx.strokeStyle = '#8a5a32'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.x - cam.x + dx * 3, P.y - 10 - cam.y); ctx.lineTo(tipX, tipY); ctx.stroke();
  ctx.strokeStyle = 'rgba(230,240,250,.7)'; ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.quadraticCurveTo((tipX + bx) / 2, Math.max(tipY, by) + 6, bx, by); ctx.stroke();
  R(ctx, bx - 1, by - 2, 3, 2, '#e8e8e0'); R(ctx, bx - 1, by, 3, 1, '#c8303b');
  const rr = (G.time * 10 % 6); ctx.strokeStyle = 'rgba(220,240,250,.5)'; ctx.beginPath(); ctx.ellipse(bx, by + 1, 3 + rr, 1 + rr / 3, 0, 0, 7); ctx.stroke();
  if (f.state === 'bite') { const ex = Math.round(bx), ey = Math.round(by - 14); R(ctx, ex - 4, ey - 6, 9, 11, '#fff6d8'); R(ctx, ex, ey - 4, 1, 5, '#c8303b'); R(ctx, ex, ey + 2, 1, 1, '#c8303b'); }
}
function drawFarSea(cam) {
  const t = G.time; ctx.fillStyle = G.dark > .5 ? '#0d2236' : G.sunset > .3 ? '#2b4a6a' : '#1d4f6f'; ctx.fillRect(0, 0, VW, VH);
  for (let i = 0; i < 160; i++) { const x = ((hash(i, 1) * 900 + t * (4 + hash(i, 2) * 6)) % 900) - cam.x * .3 - 100, y = (hash(i, 3) * 700) - cam.y * .3 - 100; const s = Math.sin(t * 1.5 + i); if (s > .3) R(ctx, ((x % (VW + 40)) + VW + 40) % (VW + 40) - 20, ((y % (VH + 40)) + VH + 40) % (VH + 40) - 20, 3, 1, G.dark > .5 ? 'rgba(200,220,255,.35)' : G.sunset > .3 ? 'rgba(255,190,130,.6)' : 'rgba(180,225,240,.5)'); }
}
function drawLighting(cam) {
  const [r, g, b, a] = G.tint;
  if (a > .01) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${a * (MAP.indoor && !MAP.high ? .5 : 1)})`; ctx.fillRect(0, 0, VW, VH); ctx.globalCompositeOperation = 'source-over'; }
  if (G.sunset > .05 && !MAP.indoor) { ctx.globalCompositeOperation = 'lighter'; const sg = ctx.createLinearGradient(VW, 0, 0, VH); sg.addColorStop(0, `rgba(255,120,40,${.16 * G.sunset})`); sg.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, VW, VH); ctx.globalCompositeOperation = 'source-over'; }
  let dark = G.dark; if (MAP.indoor && !MAP.high) dark = Math.max(MAP.id === 'shed' ? .28 : .1, dark * .82);
  if (dark < .02) return;
  const L = []; const fl = 1 + Math.sin(G.time * 11) * .04 + Math.sin(G.time * 7.3) * .03;
  if (dark > .25 && MAP.id !== 'shed') L.push([P.x, P.y - 10, 58 * fl, .95]);
  if (MAP.id === 'island') {
    const lh = WORLD.lh; L.push([lh.x - 17, lh.y - 12, 26, .8], [lh.x + 17, lh.y - 12, 26, .8], [29.4 * T + 1, 36.3 * T - 24, 38 * fl, .9]);
    if (S.lampLit) L.push([lh.x, lh.topY, 34 * fl, 1]);
    for (const f of G.flies) L.push([f.x, f.y, 6, .6 + .4 * Math.sin(f.t * 4)]);
    if (S.day === 6 && S.min >= 1230) for (let k = 0; k < 3; k++) L.push([49 * T + k * 34, 7.6 * T + k * 9, 34, .55]);
    if (S.day === 6 && S.min >= 1066 && S.min < 1350) L.push([29.1 * T, 39.4 * T - 4, 46 * fl, .95]); // Matvey's bonfire
  }
  if (MAP.id === 'cliffs') L.push([12.6 * T, 32.4 * T, 64 * fl, 1], [8.6 * T, 30.6 * T, 30 * fl, nyuraHere() ? .3 : .9]);
  if (MAP.id === 'shed') { L.push([6 * T, 3 * T, (S.power ? 70 : 24) * fl, S.power ? 1 : .5], [8.5 * T, 2.2 * T, 34, .6]); }
  if (MAP.id === 'house') { L.push([2.6 * T, 2.6 * T, 56 * fl, 1], [12.6 * T + 7, 2.2 * T, 26 * fl, .8]); }
  if (MAP.id === 'lamp' && S.lampLit) L.push([7.5 * T, 5.8 * T, 80 * fl, 1]);
  const lc = lctx; lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, VW, VH);
  lc.fillStyle = `rgba(8,14,36,${dark})`; lc.fillRect(0, 0, VW, VH);
  lc.globalCompositeOperation = 'destination-out';
  for (const [x, y, rad, al] of L) { const sx = x - cam.x, sy = y - cam.y; if (sx < -rad || sy < -rad || sx > VW + rad || sy > VH + rad) continue; const gr = lc.createRadialGradient(sx, sy, 0, sx, sy, rad); gr.addColorStop(0, `rgba(0,0,0,${al})`); gr.addColorStop(.55, `rgba(0,0,0,${al * .55})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); lc.fillStyle = gr; lc.fillRect(sx - rad, sy - rad, rad * 2, rad * 2); }
  // beams
  const beams = [];
  if (S.lampLit && MAP.id === 'island') beams.push([WORLD.lh.x - cam.x, WORLD.lh.topY - cam.y, 520, .11]);
  if (S.lampLit && MAP.id === 'lamp') beams.push([7.5 * T - cam.x, 5.8 * T - cam.y, 340, .16]);
  for (const [ox, oy, Lb, sp] of beams) for (const k of [0, Math.PI]) {
    lc.save(); lc.translate(ox, oy); lc.rotate(G.time * .7 + k); const gr = lc.createLinearGradient(0, 0, Lb, 0); gr.addColorStop(0, 'rgba(0,0,0,.7)'); gr.addColorStop(.6, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); lc.fillStyle = gr; lc.beginPath(); lc.moveTo(0, 0); lc.lineTo(Lb, -Lb * sp); lc.lineTo(Lb, Lb * sp); lc.fill(); lc.restore();
  }
  ctx.drawImage(lcv, 0, 0);
  // warm additive glows
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y, rad, al] of L) { const sx = x - cam.x, sy = y - cam.y; if (sx < -rad || sy < -rad || sx > VW + rad || sy > VH + rad) continue; const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad * .7); gr.addColorStop(0, `rgba(255,190,90,${.22 * al * dark})`); gr.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = gr; ctx.fillRect(sx - rad, sy - rad, rad * 2, rad * 2); }
  for (const [ox, oy, Lb, sp] of beams) for (const k of [0, Math.PI]) { ctx.save(); ctx.translate(ox, oy); ctx.rotate(G.time * .7 + k); const gr = ctx.createLinearGradient(0, 0, Lb, 0); gr.addColorStop(0, `rgba(255,230,160,${.35 * dark})`); gr.addColorStop(1, 'rgba(255,230,160,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Lb, -Lb * sp); ctx.lineTo(Lb, Lb * sp); ctx.fill(); ctx.restore(); }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------- side-view scenes (title, ending, credits) ----------
const STARS = Array.from({ length: 140 }, (_, i) => [hash(i, 9), hash(i, 19) * .62, hash(i, 29)]);
function drawSide(c, w, h, t, o) {
  const hor = Math.round(h * .66);
  // sky
  const sky = c.createLinearGradient(0, 0, 0, hor);
  if (o.night) { sky.addColorStop(0, '#070d1f'); sky.addColorStop(.7, '#16234a'); sky.addColorStop(1, '#2a3566'); }
  else { const k = o.dusk || 0; sky.addColorStop(0, k > .5 ? '#1c2150' : '#3a4f8f'); sky.addColorStop(.55, k > .5 ? '#6b3f73' : '#c86f74'); sky.addColorStop(.85, '#f29a5c'); sky.addColorStop(1, '#ffcf7a'); }
  c.fillStyle = sky; c.fillRect(0, 0, w, hor);
  const starA = o.night ? 1 : clamp((o.dusk || 0) * 1.4 - .4, 0, 1);
  if (starA > 0) for (const [sx, sy, sp] of STARS) { c.globalAlpha = starA * (.4 + .6 * Math.abs(Math.sin(t * (1 + sp * 2) + sp * 40))); R(c, sx * w, sy * h, sp > .85 ? 2 : 1, sp > .85 ? 2 : 1, '#fff6e0'); }
  c.globalAlpha = 1;
  if (o.night) { disc(c, w * .8, h * .18, Math.max(6, h * .035), '#f4ecd0'); disc(c, w * .8 + 3, h * .18 - 2, Math.max(5, h * .03), '#e2d9b8'); }
  else { const sunY = hor - (1 - (o.dusk || 0)) * h * .12 + 4; disc(c, w * .72, sunY, Math.max(10, h * .06), '#ffe39a'); }
  // sea
  const sea = c.createLinearGradient(0, hor, 0, h); sea.addColorStop(0, o.night ? '#1c2b55' : '#a8566a'); sea.addColorStop(.3, o.night ? '#12203f' : '#4a3f6e'); sea.addColorStop(1, o.night ? '#0a1328' : '#1d2a52'); c.fillStyle = sea; c.fillRect(0, hor, w, h - hor);
  for (let i = 0; i < 90; i++) { const yy = hor + 2 + Math.pow(hash(i, 5), 1.6) * (h - hor); const xx = ((hash(i, 6) * w * 1.3 + t * (6 + (yy - hor) * .08)) % (w + 40)) - 20; const s = Math.sin(t * 1.4 + i); if (s > .2) R(c, xx, yy, 2 + (yy - hor) * .04, 1, o.night ? 'rgba(170,190,240,.35)' : 'rgba(255,190,140,.55)'); }
  // reflection column
  const rx = o.night ? w * .8 : w * .72; for (let yy = hor + 2; yy < h; yy += 3) { if (Math.sin(t * 3 + yy) > -.2) { const ww = 3 + Math.sin(yy * .7 + t * 2) * 3 + (yy - hor) * .05; c.globalAlpha = .55; R(c, rx - ww, yy, ww * 2, 1, o.night ? '#e9e1c4' : '#ffd38a'); } } c.globalAlpha = 1;
  // mainland
  if (o.mainland) { c.globalAlpha = o.mainland; c.fillStyle = '#2a2240'; c.beginPath(); c.moveTo(w * .62, hor + 1); for (let x = w * .62; x <= w; x += 6) c.lineTo(x, hor - 3 - Math.sin(x * .05) * 2 - (x - w * .62) * .03); c.lineTo(w, hor + 1); c.fill(); for (let i = 0; i < 12; i++) R(c, w * .66 + hash(i, 8) * w * .32, hor - 2 - hash(i, 4) * 6, 1, 1, '#ffd477'); c.globalAlpha = 1; }
  // island + lighthouse
  const s = o.s ?? 1, ix = o.islandX, base = hor + 2;
  c.fillStyle = '#121a2c';
  c.beginPath(); c.moveTo(ix - 110 * s, base); c.lineTo(ix - 80 * s, base - 14 * s); c.lineTo(ix - 40 * s, base - 22 * s); c.lineTo(ix - 18 * s, base - 30 * s); c.lineTo(ix + 22 * s, base - 30 * s); c.lineTo(ix + 50 * s, base - 18 * s); c.lineTo(ix + 95 * s, base - 8 * s); c.lineTo(ix + 120 * s, base); c.fill();
  for (let k = 0; k < 5; k++) { const tx = ix - 70 * s + k * 9 * s, ty = base - 16 * s - (k % 2) * 3 * s; c.beginPath(); c.moveTo(tx, ty - 14 * s); c.lineTo(tx - 5 * s, ty); c.lineTo(tx + 5 * s, ty); c.fill(); }
  const lx = ix, lb = base - 30 * s, lt = lb - 58 * s;
  c.beginPath(); c.moveTo(lx - 8 * s, lb); c.lineTo(lx - 5 * s, lt); c.lineTo(lx + 5 * s, lt); c.lineTo(lx + 8 * s, lb); c.fill();
  R(c, lx - 8 * s, lt - 2 * s, 16 * s, 2 * s, '#121a2c'); R(c, lx - 4 * s, lt - 9 * s, 8 * s, 7 * s, '#ffd477'); c.fillStyle = '#121a2c'; c.beginPath(); c.moveTo(lx - 5 * s, lt - 9 * s); c.lineTo(lx, lt - 14 * s); c.lineTo(lx + 5 * s, lt - 9 * s); c.fill();
  if (o.nadezhda) { const nx = ix + 52 * s, ny = base + 4 + Math.sin(t * 1.4); c.fillStyle = '#121a2c'; c.beginPath(); c.moveTo(nx - 9 * s, ny - 3 * s); c.lineTo(nx + 9 * s, ny - 3 * s); c.lineTo(nx + 6 * s, ny); c.lineTo(nx - 6 * s, ny); c.fill(); if ((S.flags.boat | 0) >= 5) { R(c, nx, ny - 16 * s, 1, 13 * s, '#121a2c'); c.beginPath(); c.moveTo(nx + 1, ny - 15 * s); c.lineTo(nx + 8 * s, ny - 4 * s); c.lineTo(nx + 1, ny - 4 * s); c.fill(); } }
  if (o.waving) { for (let k = 0; k < (o.waving > 1 ? o.waving : 3); k++) { const px = ix + 56 * s + k * 5 * s, py = base - 15 * s; R(c, px, py - 5 * s, 2 * s, 5 * s, '#121a2c'); R(c, px, py - 7 * s, 2 * s, 2 * s, '#121a2c'); if (Math.sin(t * 6 + k) > 0) R(c, px + 2 * s, py - 8 * s, 1 * s, 3 * s, '#121a2c'); } }
  // beam
  c.globalCompositeOperation = 'lighter';
  const a = t * .9, dirx = Math.cos(a), len = w * (.5 + .5 * Math.abs(dirx)), bw = 6 + 30 * (1 - Math.abs(Math.sin(a)));
  const gr = c.createLinearGradient(lx, 0, lx + Math.sign(dirx || 1) * len, 0); gr.addColorStop(0, `rgba(255,225,150,${.55 * (o.beamA ?? 1)})`); gr.addColorStop(1, 'rgba(255,225,150,0)');
  c.fillStyle = gr; c.beginPath(); c.moveTo(lx, lt - 5 * s); c.lineTo(lx + Math.sign(dirx || 1) * len, lt - 5 * s - bw); c.lineTo(lx + Math.sign(dirx || 1) * len, lt - 5 * s + bw * .6); c.fill();
  const hg = c.createRadialGradient(lx, lt - 5 * s, 0, lx, lt - 5 * s, 22 * s + 10); hg.addColorStop(0, 'rgba(255,220,140,.6)'); hg.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = hg; c.fillRect(lx - 40 * s - 10, lt - 45 * s - 10, 80 * s + 20, 80 * s + 20);
  c.globalCompositeOperation = 'source-over';
  // fog over island
  if (o.fog) { const fg = c.createLinearGradient(0, 0, w * .8, 0); fg.addColorStop(0, 'rgba(214,186,206,1)'); fg.addColorStop(.6, 'rgba(214,186,206,.7)'); fg.addColorStop(1, 'rgba(214,186,206,0)'); c.fillStyle = fg; const top = hor - 100, H = 116; for (let yy = 0; yy < H; yy += 2) { c.globalAlpha = o.fog * Math.pow(Math.sin(Math.PI * yy / H), 1.5) * (.85 + .15 * Math.sin(t * .8 + yy * .2)); c.fillRect(0, top + yy, w, 2); } c.globalAlpha = 1; }
  // boat
  if (o.boatX != null) { const bx = o.boatX, by = hor + 14 + Math.sin(t * 1.6) * 1.5; c.fillStyle = '#0f1424'; c.beginPath(); c.moveTo(bx - 22, by - 6); c.lineTo(bx + 24, by - 6); c.lineTo(bx + 18, by + 2); c.lineTo(bx - 18, by + 2); c.fill(); R(c, bx - 8, by - 14, 14, 8, '#0f1424'); R(c, bx - 6, by - 12, 4, 3, '#ffd477'); R(c, bx + 1, by - 12, 4, 3, '#ffd477'); R(c, bx - 14, by - 10, 2, 4, '#0f1424'); R(c, bx - 14, by - 13, 2, 2, '#0f1424'); if (o.cat) drawCatSilhouette(c, bx + 13, by - 6, '#5a2c16', t); if (o.pup) { const px = bx - 46 + Math.sin(t * .8) * 4, py = by + 4 + Math.round(Math.sin(t * 2) * 1); R(c, px - 3, py - 4, 6, 5, '#2a3040'); R(c, px + 1, py - 3, 1, 1, '#c9d2e0'); c.globalAlpha = .4; R(c, px - 7, py + 1, 14, 1, '#e3f4f3'); c.globalAlpha = 1; } for (let i = 0; i < 6; i++) R(c, bx - 26 - i * 7, by + 1 + (i % 2), 5, 1, 'rgba(255,220,180,.35)'); }
}

// ---------- ending ----------
function startEnding() {
  if ((S.stats.perfectDays || 0) >= 7) unlock('perfect');
  if (G.mode === 'ending') return; G.mode = 'ending'; G.endT = 0; AU.setMode('ending'); AU.chordIdx = 0;
  $('#hud').hidden = true; $('#prompt').hidden = true; $('#dialog').hidden = true; $('#touch').hidden = true; $('#panel').hidden = true;
  $('#fade').classList.add('on'); setTimeout(() => $('#fade').classList.remove('on'), 700);
  try { localStorage.removeItem('lighthouse-save-v1'); } catch (e) { }
}
function drawEnding() {
  const t = G.endT, w = VW, h = VH;
  if (t < 34) {
    const k = clamp(t / 30, 0, 1);
    drawSide(ctx, w, h, G.time, { dusk: clamp(k * 1.3, 0, 1), islandX: lerp(w * .36, -w * .02, smooth(k)), s: lerp(1.05, .5, smooth(k)), boatX: lerp(w * .5, w * .62, smooth(k)), cat: S.flags.cat === 'kept', pup: !!S.flags.pupFriend, nadezhda: (S.flags.boat | 0) >= 4, fog: clamp((k - .35) * .9, 0, .45), mainland: clamp((k - .55) * 2.5, 0, 1), waving: k < .5 ? presentAtFarewell().length : 0, beamA: 1 });
    const bar = Math.round(h * .11 * clamp(t / 2, 0, 1)); R(ctx, 0, 0, w, bar, '#000'); R(ctx, 0, h - bar, w, bar, '#000');
    if (t > 31) { ctx.fillStyle = `rgba(5,8,15,${clamp((t - 31) / 3, 0, 1)})`; ctx.fillRect(0, 0, w, h); }
    return;
  }
  // credits with vignettes
  ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, w, h);
  const vt = t - 34, idx = Math.min(3, Math.floor(vt / 9)), local = vt - idx * 9;
  const vw = Math.min(w - 20, 220), vh = Math.round(vw * .55), vx = Math.round((w - vw) / 2), vy = Math.round(h * .12);
  const [vc, vctx] = G.vig || (G.vig = mk(220, 121)); if (vc.width !== vw) { vc.width = vw; vc.height = vh; }
  drawVignette(vctx, vw, vh, idx, G.time, local);
  ctx.globalAlpha = clamp(Math.min(local, 9 - local + (idx === 3 ? 99 : 0)) / 1.2, 0, 1);
  ctx.drawImage(vc, vx, vy); R(ctx, vx - 2, vy - 2, vw + 4, 2, '#e9dcbc'); R(ctx, vx - 2, vy + vh, vw + 4, 2, '#e9dcbc'); R(ctx, vx - 2, vy, 2, vh, '#e9dcbc'); R(ctx, vx + vw, vy, 2, vh, '#e9dcbc');
  ctx.globalAlpha = 1;
}
function drawVignette(c, w, h, idx, t, local = 0) {
  c.imageSmoothingEnabled = false;
  if (idx === 3) { drawSide(c, w, h, t, { night: true, islandX: w * .45, s: .7 }); return; }
  if (idx === 0) { // fisherman on shore
    drawSide(c, w, h, t, { dusk: .3, islandX: -200, s: .5 });
    R(c, 0, h * .7, w * .45, h * .3, '#3a4a3a'); R(c, 0, h * .7, w * .45, 2, '#5a7a4a');
    drawPerson(c, w * .3, h * .72, LOOKS.matvey, { dir: 2, act: true, t });
    c.strokeStyle = '#2a1a10'; c.beginPath(); c.moveTo(w * .32, h * .62); c.lineTo(w * .55, h * .42); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(w * .55, h * .42); c.lineTo(w * .62, h * .74 + Math.sin(t * 3)); c.stroke(); R(c, w * .62 - 1, h * .74 + Math.sin(t * 3) - 1, 3, 2, '#c8303b');
    if ((S.flags.boat | 0) >= 4) drawNadezhda(c, w * .78, h * .9, S.flags.boat | 0, true, t);
  }
  if (idx === 1) { // Sonya painting the lighthouse
    drawSide(c, w, h, t, { night: true, islandX: w * .66, s: .55 });
    R(c, 0, h * .78, w, h * .22, '#1a2236'); drawPerson(c, w * .2, h * .86, LOOKS.sonya, { dir: 2, act: true, t });
    c.drawImage(easelSprite(7, false), Math.round(w * .3) - 13, Math.round(h * .86) - 28);
  }
  if (idx === 2) { // home: door, family hug
    const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#2a3a6a'); sky.addColorStop(1, '#f29a5c'); c.fillStyle = sky; c.fillRect(0, 0, w, h);
    R(c, 0, h * .8, w, h * .2, '#4a5a3a'); R(c, w * .45, h * .25, w * .45, h * .55, '#c9a98a'); for (let i = 0; i < 8; i++) R(c, w * .43 + i * w * .06, h * .22 - i * 0, w * .07, 4, '#7a3a2a'); R(c, w * .4, h * .2, w * .55, 6, '#7a3a2a');
    R(c, w * .55, h * .45, w * .1, h * .35, '#ffd477'); R(c, w * .74, h * .4, w * .1, h * .14, '#ffd477'); R(c, w * .79, h * .4, 1, h * .14, '#5a3a2a');
    const k = clamp((local - .6) / 3.4, 0, 1);
    drawPerson(c, lerp(w * .15, w * .48, smooth(k)), h * .86, LOOKS.hero, { dir: 2, moving: k < 1, frame: Math.floor(t * 8) % 4, t });
    drawPerson(c, w * .6, h * .86, LOOKS.wife, { dir: 1, act: k >= 1, t });
    drawPerson(c, lerp(w * .66, w * .53, smooth(clamp(k * 1.2 - .1, 0, 1))), h * .87, LOOKS.kid, { dir: 1, moving: k < 1, frame: Math.floor(t * 10) % 4, act: k >= 1, t });
    if (S.flags.cat === 'kept') { const kc = clamp(k * 1.15 - .15, 0, 1); drawCat(c, lerp(w * .04, w * .4, smooth(kc)), h * .87, kc < 1 ? 'walk' : 'sit', 2, t); }
    if (k >= 1) for (let i = 0; i < 3; i++) { const yy = h * .55 - ((t * 10 + i * 8) % 20); R(c, w * .52 + i * 6, yy, 2, 2, '#f07a7a'); R(c, w * .52 + i * 6 + 2, yy, 2, 2, '#f07a7a'); R(c, w * .52 + i * 6 + 1, yy + 2, 2, 1, '#f07a7a'); }
  }
}
function startCredits() {
  const roll = $('#roll'); roll.innerHTML = '';
  const add = (tag, txt, cls) => { const e = document.createElement(tag); e.textContent = txt; if (cls) e.className = cls; roll.appendChild(e); };
  add('h2', 'Light House');
  add('div', 'Смотритель маяка', 'h'); add('div', 'это были вы');
  add('div', 'Жители и гости острова', 'h'); add('div', 'Матвей, старый рыбак'); add('div', 'Лида, почтальон'); add('div', 'Соня, художница'); add('div', 'Инспектор Громов'); add('div', 'Капитан Белов, «Северянка»'); if (S.flags.ny) add('div', 'Нюра, орнитолог');
  add('div', 'Привезено домой', 'h'); add('div', S.souv.length ? S.souv.map(id => ITEMS[id].n).join(' · ') : 'только воспоминания, и этого достаточно');
  add('div', 'Сделано дел', 'h'); add('div', S.done + ' из ' + S.total);
  add('div', 'Достижения', 'h'); add('div', ACHV.length + ' из ' + ACH.length);
  if (S.flags.cat === 'kept') { add('div', 'Едет домой', 'h'); add('div', 'кот ' + catName() + ' — всю дорогу на палубе, а теперь и дома'); }
  add('div', 'Как сложилась жизнь на острове', 'h'); lifeLines().forEach(t => add('div', t));
  add('div', 'Дома', 'h'); homeLines().forEach(t => add('div', t));
  add('div', ' ', 'h'); add('div', 'Спасибо, что были смотрителем.');
  const vw = Math.min(VW - 20, 220), vh = Math.round(vw * .55), topPx = (Math.round(VH * .12) + vh) * SCALE + 18;
  $('#credits').style.top = topPx + 'px'; $('#credits').hidden = false; roll.style.top = '100%';
  const st = performance.now(), H = roll.offsetHeight + (innerHeight - topPx);
  (function step(now) { const k = (now - st) / 1000 / 40; roll.style.top = ((innerHeight - topPx) - k * H) + 'px'; if (k < 1 && G.mode === 'ending') requestAnimationFrame(step); else { $('#endbtn').hidden = false; $('#diarybtn').hidden = !S.journal.length; } })(st);
}

// ---------- save ----------
function save() { try { localStorage.setItem('lighthouse-save-v1', JSON.stringify({ day: S.day, inv: S.inv, souv: S.souv, journal: S.journal, read: S.read, flags: S.flags, done: S.done, total: S.total - S.tasks.length, q: S.q, stats: S.stats, atlas: S.atlas })); } catch (e) { } }
function loadSave() { try { const s = JSON.parse(localStorage.getItem('lighthouse-save-v1') || 'null'); return s && s.day >= 1 && s.day <= 7 ? s : null; } catch (e) { return null; } }

// ---------- boot ----------
function newGame(saved) {
  Object.assign(S, { day: 1, min: 360, inv: { rod: 1, rag: 1, lantern: 1, keys: 1 }, souv: [], journal: [], read: [], flags: {}, done: 0, total: 0, tasks: [], q: {}, lampLit: false, power: true, stats: {}, atlas: {} });
  if (saved) Object.assign(S, { day: saved.day, inv: saved.inv, souv: saved.souv, journal: saved.journal, read: saved.read || [], flags: saved.flags || {}, done: saved.done, total: saved.total, q: saved.q || {}, stats: saved.stats || {}, atlas: saved.atlas || {} });
  G.ending = 0; G.npcs = []; G.boats = []; P.sit = null; CAT.map = 'island'; setupDay();
}
function startPlay(saved) {
  AU.init(); AU.setMode('morning');
  $('#title').hidden = true; G.busy = 1; $('#fade').classList.add('on');
  setTimeout(() => { G.mode = 'play'; newGame(saved); $('#hud').hidden = false; if (isTouch) { $('#touch').hidden = false; document.body.classList.add('touch'); } beginDay(!saved || saved.day === 1); }, 500);
}
$('#bStart').onclick = () => startPlay(null);
$('#bCont').onclick = () => startPlay(loadSave());
$('#endbtn').onclick = () => { G.creditsOn = 0; $('#endbtn').hidden = true; $('#diarybtn').hidden = true; if (DOC_ON) closeDoc(); $('#credits').hidden = true; G.mode = 'title'; $('#title').hidden = false; $('#bCont').hidden = !loadSave(); AU.setMode('title'); };
$('#title').addEventListener('pointerdown', () => AU.init(), { once: true });

let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (G.mode === 'ending') { G.endT += dt; if (G.endT >= 34 && !G.creditsOn) { G.creditsOn = 1; startCredits(); } }
  update(dt); draw();
  if (COUNT_ON) { const cc = $('#countC'), cx = cc.getContext('2d'); cx.imageSmoothingEnabled = false; drawCount(cx, cc.width, cc.height, G.time); }
  if (SCOPE_ON) { const sc = $('#scopeC'), sctx = sc.getContext('2d'); sctx.imageSmoothingEnabled = false; drawScope(sctx, sc.width, sc.height, G.time); }
  requestAnimationFrame(frame);
}
function boot() {
  resize(); buildWorld(); soulInit(); MAP = MAPS.island; G.npcs = [];
  if (loadSave()) { $('#bCont').hidden = false; const s = loadSave(); $('#bCont').textContent = 'Продолжить · день ' + s.day; }
  requestAnimationFrame(frame);
}
window.__lh = { S, G, P, MAPS, setMin: m => S.min = m, tp: (id, x, y) => { MAP = MAPS[id]; P.x = x * T; P.y = y * T; snapCam(); }, startEnding, sleep, give };
