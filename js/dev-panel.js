"use strict";
// ===================== DEV: hidden test panel =====================
// Open with #test at the end of the address, or type «test» / «тест» during the game.
const DEV = {
  on: false, min: false,
  enable(v) { this.on = v; try { v ? localStorage.setItem('lighthouse-dev', '1') : localStorage.removeItem('lighthouse-dev'); } catch (e) { } $('#dev').hidden = !v; if (v) this.render(); },
  seq: '',
  render() {
    const box = $('#devBody'); box.innerHTML = ''; $('#dev').classList.toggle('min', this.min);
    if (this.min) return;
    const row = (title, items) => { const r = document.createElement('div'); r.className = 'drow'; const t = document.createElement('span'); t.textContent = title; r.appendChild(t); const g = document.createElement('div'); items.forEach(([l, f, on]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = l; if (on) b.className = 'on'; b.onclick = () => { if (G.mode === 'title' && title === 'День') { startPlay(null); setTimeout(() => devDay(d0(l)), 3300); return; } if (G.mode !== 'play') return toast('Сначала начните смену или выберите день'); f(); this.render(); }; g.appendChild(b); }); r.appendChild(g); box.appendChild(r); };
    row('День', [1, 2, 3, 4, 5, 6, 7].map(d => [String(d), () => devDay(d), S.day === d]));
    row('Время', [['06:00', 360], ['08:00', 480], ['10:00', 600], ['12:00', 720], ['16:30', 990], ['17:00', 1020], ['19:00', 1140], ['21:00', 1260], ['23:30', 1410]].map(([l, m]) => [l, () => { S.min = m; G.trig = G.trig || {}; }]));
    row('Погода', [['ясно', 'sunny'], ['ветер', 'windy'], ['дождь', 'rain'], ['гроза', 'storm'], ['туман', 'fog'], ['облака', 'cloudy']].map(([l, w]) => [l, () => { S.weather = w; UI.hud(); }, S.weather === w]));
    row('Куда', [['маяк', () => goTo('island', WORLD.lh.x, WORLD.lh.y + 14, 0)], ['дом', () => goTo('house', 9 * T, 9 * T, 3)], ['фонарная', () => goTo('lamp', 7.5 * T, 9.1 * T, 3)], ['пирс', () => goTo('island', 31 * T, 40 * T, 0)], ['сарай', () => goTo('shed', 6 * T, 7 * T, 3)], ['смотровая', () => goTo('island', 46.5 * T, 14 * T, 3)], ['утёс', () => goTo('island', 21.5 * T, 13 * T, 0)], ['Дальний лес', () => goTo('island', 76 * T, 30.5 * T, 0)], ['озеро', () => goTo('island', 84.5 * T, 25.6 * T, 3)], ['скалы', () => goTo('island', 97.5 * T, 32 * T, 3)]].map(([l, f]) => [l, f]));
    row('Дать', [['рыба ×3', () => give('fish', 3)], ['материалы', () => { ['driftwood', 'seaglass', 'gullfeather', 'rope'].forEach(k => give(k, 3, true)); give('shell', 5, true); toast('Материалы в сумке'); }], ['травы', () => { HERB_IDS.forEach(k => give(k, 3, true)); toast('Травы в сумке'); }], ['чай Матвея', () => give('tea', 3)], ['дрова ×3', () => give('wood', 3)]]);
    row('Надежда', [['починить', () => { S.flags.boat = 4; UI.tasks(); }], ['с парусом', () => { S.flags.boat = 5; UI.tasks(); }], ['Тюлений', () => goTo('seals', ISLES.seals.dock[0] * T, ISLES.seals.dock[1] * T, 3)], ['Птичий базар', () => goTo('cliffs', ISLES.cliffs.dock[0] * T, ISLES.cliffs.dock[1] * T, 3)], ['шхуна (отлив)', () => { S.min = 8 * 60; goTo('seals', 34 * T, 23.6 * T, 2); }], ['Нюра: всё', () => { Object.assign(S.flags, { ny: 1, nyCount: 'done', nyRing: 'done', nyUha: 1 }); nyuraCheckDone(); }]]);
    row('Дела', [['выполнить все', () => { S.tasks.forEach(t => { if (!t.done) { t.c = t.n || 0; progress(t.id, t.n || 1); } }); UI.tasks(); }], ['зажечь маяк', () => { S.lampLit = true; S.power = true; }], ['кот: оставить', () => { S.flags.cat = 'kept'; S.flags.catName = S.flags.catName || 'Рыжик'; S.flags.catDay = S.flags.catDay || S.day; catNewDay(); if (S.min >= 480 && S.min < 990) { CAT.phase = 'wander'; CAT.map = 'island'; CAT.x = WORLD.lh.x + 10; CAT.y = WORLD.lh.y + 28; CAT.z = 0; } UI.tasks(); }], ['кот: сброс', () => { delete S.flags.cat; catNewDay(); UI.tasks(); }]]);
  },
};
const d0 = l => +l;
function devDay(d) {
  closeScope(); if (DOC_ON) closeDoc(); MENU.hide(); UI.close(); P.sit = null; P.fish = null; P.act = null; P.carry = null;
  $('#dialog').hidden = true; DLG.q = []; DLG.cur = null; DLG.done = null;
  G.busy = 1; $('#fade').classList.add('on');
  setTimeout(() => { S.day = d; setupDay(); G.busy = 0; beginDay(false); DEV.render(); }, 450);
}
$('#devMin').onclick = () => { DEV.min = !DEV.min; DEV.render(); };
$('#devOff').onclick = () => { DEV.enable(false); toast('Тестовый режим выключен'); };
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  DEV.seq = (DEV.seq + e.key.toLowerCase()).slice(-4);
  if (['test', 'тест', 'еуые', 'ntcn'].includes(DEV.seq)) { DEV.seq = ''; DEV.enable(!DEV.on); toast(DEV.on ? 'Тестовый режим включён' : 'Тестовый режим выключен'); }
});
(function () {
  let on = location.hash.replace('#', '').toLowerCase() === 'test';
  try { if (localStorage.getItem('lighthouse-dev') === '1') on = true; } catch (e) { }
  if (on) DEV.enable(true);
})();
setInterval(() => { if (DEV.on && !DEV.min && G.mode === 'play') { const b = [...document.querySelectorAll('#devBody .drow:first-child button')]; b.forEach((x, i) => x.classList.toggle('on', S.day === i + 1)); } }, 1000);
addEventListener('hashchange', () => { if (location.hash.replace('#', '').toLowerCase() === 'test' && !DEV.on) DEV.enable(true); });
