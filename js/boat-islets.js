"use strict";
// ===================== FEATURES 3: «Надежда», sailing, islets =====================

// ---------- new items, atlas entries, recipes ----------
Object.assign(ITEMS, {
  resin: { n: 'Живица', d: 'Липкая сосновая смола. Две порции сварить на печи — выйдет смола для лодки.' },
  tar: { n: 'Смола', d: 'Горячая, чёрная, пахнет лесом. Чтобы просмолить «Надежду».' },
  oars: { n: 'Вёсла', d: 'Два весла из плавника. Для «Надежды».' },
  nets: { n: 'Старые сети', d: 'Из сарая. Из них выйдет парус.' },
  sail: { n: 'Парус', d: 'Заплатанный, с флажком из пера. Поставить на «Надежду».' },
  rarefeather: { n: 'Перо моевки', d: 'Белое с чёрным кончиком. С Птичьего базара.' },
  vane: { n: 'Перьевой флюгер', d: 'Стоит на крыше дома и крутится по ветру.' },
});
ATLAS.birds.items.push(
  { id: 'kittiwake', n: 'Моевка', d: 'Нежная белая чайка с чёрными кончиками крыльев. Кричит своё имя: «киттивейк!»', hint: 'Птичий базар.' },
  { id: 'guillemot', n: 'Кайра', d: 'Стоит на уступе, как маленький пингвин. Яйца у неё в форме груши, чтобы не скатывались.', hint: 'Птичий базар.' },
  { id: 'fulmar', n: 'Глупыш', d: 'Совсем не глупый: часами парит над волнами, почти не взмахивая крыльями.', hint: 'Птичий базар.' },
);
RECIPES.push(
  { id: 'oars', n: 'Вёсла', who: 'для «Надежды»', need: { driftwood: 2, rope: 1 }, done: () => boatStage() >= 3 || has('oars'), say: 'Два весла из плавника, рукояти обмотаны верёвкой. Должны выдержать.' },
  { id: 'sail', n: 'Парус', who: 'для «Надежды»', need: { nets: 1, rope: 2, gullfeather: 1 }, done: () => boatStage() >= 5 || has('sail'), say: 'Парус из старых сетей, с флажком из пера чайки. Неказистый, но свой.' },
  { id: 'vane', n: 'Перьевой флюгер', who: 'на крышу дома', need: { rarefeather: 2, driftwood: 1, rope: 1 }, done: () => (S.stats.crafted || []).includes('vane'), say: 'Флюгер из плавника и перьев моевки. Поставлю на крышу дома.' },
);
Object.assign(WHERE, { resin: 'сосны в лесах, когда нужна смола', nets: 'сарай, на стене', rarefeather: 'Птичий базар' });

function iconMore3(id, p, c) {
  switch (id) {
    case 'resin': p(5, 4, 6, 9, '#c98a2a'); p(6, 3, 4, 2, '#e8b04a'); p(7, 5, 2, 3, '#ffe28a'); p(6, 13, 4, 1, '#8a5a1a'); return true;
    case 'tar': p(4, 6, 8, 8, '#3a3e48'); p(4, 6, 8, 2, '#2c2f38'); p(5, 5, 6, 2, '#1a1c22'); p(11, 4, 1, 4, '#8a5a32'); p(6, 9, 2, 1, '#5a5f68'); return true;
    case 'oars': for (let i = 0; i < 10; i++) { p(3 + i, 12 - i, 1, 1, '#c9a26e'); p(5 + i, 13 - i, 1, 1, '#c9a26e'); } p(10, 2, 4, 3, '#a5774a'); p(12, 3, 3, 3, '#a5774a'); p(3, 12, 2, 2, '#e8d8a8'); return true;
    case 'nets': for (let i = 0; i < 4; i++) { p(3, 3 + i * 3, 10, 1, '#c9b48a'); p(3 + i * 3, 3, 1, 10, '#c9b48a'); } p(10, 10, 3, 3, '#e8c55a'); return true;
    case 'sail': p(7, 1, 1, 14, '#6b4a2e'); for (let r = 0; r < 10; r++) p(8, 2 + r, Math.round(r * .6) + 1, 1, '#f2ebdc'); p(9, 6, 2, 1, '#c9b48a'); p(3, 13, 10, 2, '#7a4d2c'); return true;
    case 'rarefeather': for (let i = 0; i < 10; i++) { p(3 + i, 13 - i, 1, 1, '#6c757f'); p(4 + i, 11 - i, 2, 2, i > 7 ? '#1e2128' : '#ffffff'); } return true;
    case 'vane': p(7, 4, 1, 11, '#3a3e48'); p(3, 4, 10, 1, '#3a3e48'); p(10, 2, 4, 3, '#ffffff'); p(13, 2, 1, 3, '#1e2128'); p(2, 3, 2, 3, '#c9a26e'); return true;
    case 'cup_rose': p(3, 6, 9, 8, '#f2ece0'); p(3, 6, 9, 1, '#c9c2b0'); p(4, 7, 7, 2, '#c84a3a'); p(12, 8, 2, 4, '#f2ece0'); p(2, 14, 11, 1, '#c9c2b0'); return true;
    case 'sea_seal': drawSealGrid(c, 8, 15, SEAL_PUP, SEAL_PAL[0], false, 0, false); return true;
    case 'sea_starfish': p(7, 2, 2, 12, '#f07a2a'); p(2, 6, 12, 2, '#f07a2a'); p(4, 10, 2, 3, '#f07a2a'); p(10, 10, 2, 3, '#f07a2a'); p(7, 7, 2, 2, '#ffb36b'); return true;
    case 'sea_crab': p(4, 7, 8, 5, '#d9473a'); p(5, 6, 6, 1, '#f07a5a'); p(2, 4, 3, 3, '#d9473a'); p(11, 4, 3, 3, '#d9473a'); p(6, 5, 1, 1, '#1c2638'); p(9, 5, 1, 1, '#1c2638'); for (let i = 0; i < 3; i++) { p(3, 9 + i * 2, 2, 1, '#b8382e'); p(11, 9 + i * 2, 2, 1, '#b8382e'); } return true;
    case 'bird_kittiwake': p(4, 7, 8, 4, '#ffffff'); p(5, 7, 6, 2, '#b8c2cc'); p(3, 7, 2, 2, '#1e2128'); p(10, 4, 3, 3, '#ffffff'); p(13, 5, 2, 1, '#e8d84a'); p(11, 5, 1, 1, '#1c2638'); p(7, 11, 1, 3, '#2c2f38'); return true;
    case 'bird_guillemot': p(6, 4, 4, 11, '#3a2e28'); p(7, 7, 2, 8, '#f8fbff'); p(6, 2, 4, 3, '#3a2e28'); p(10, 3, 3, 1, '#1e2128'); p(8, 3, 1, 1, '#f8fbff'); p(6, 15, 4, 1, '#2c2f38'); return true;
    case 'bird_fulmar': p(4, 7, 8, 4, '#e8ecef'); p(4, 7, 8, 1, '#9aa6b0'); p(1, 6, 4, 2, '#9aa6b0'); p(11, 6, 4, 2, '#9aa6b0'); p(10, 5, 3, 3, '#f4f6f8'); p(13, 6, 2, 1, '#c9b48a'); p(11, 6, 1, 1, '#1c2638'); return true;
  }
  return false;
}

// ---------- the boat ----------
const boatStage = () => S.flags.boat | 0;
const ISLES = {
  seals: { n: 'Тюлений камень', mins: 30, far: false, dock: [15.6, 24.2, 3], boat: [18.4, 25.8] },
  cliffs: { n: 'Птичий базар', mins: 60, far: true, dock: [21.6, 36.8, 3], boat: [24.4, 38.6] },
  island: { n: 'Маяк', mins: 0, dock: [30.6, 41, 3], boat: [28.3, 40.9] },
};
function needResin() { return boatStage() === 1 && !has('tar') && (S.inv.resin | 0) < 2; }
function boatQuestLine() {
  if (!S.flags.boatSeen) return null;
  const s = boatStage(), dw = Math.min(3, S.inv.driftwood | 0);
  if (s === 0) return `«Надежда»: залатать дно (плавник ${dw}/3, гаечный ключ${has('wrench') ? ' есть' : ' — в сарае'})`;
  if (s === 1) return has('tar') ? '«Надежда»: просмолить корпус' : `«Надежда»: смола (живица ${Math.min(2, S.inv.resin | 0)}/2 с сосен, сварить на печи)`;
  if (s === 2) return has('oars') ? '«Надежда»: положить вёсла' : '«Надежда»: сделать вёсла на верстаке';
  if (s === 3) return '«Надежда»: спустить на воду';
  if (s === 4) return has('sail') ? '«Надежда»: поставить парус' : '«Надежда»: парус для Птичьего базара (верстак)';
  const v = (S.flags.visited || []).length; return v < 2 ? `Острова: побывали на ${v} из 2` : null;
}
function boatTalk() {
  const L = t => ['Матвей', t];
  if (boatStage() >= 4) return [L('Гляди-ка, «Надежда» на воде! Вот это дело. Савелий бы обрадовался.')];
  return [L('А «Надежду» видал? Лодка Савелия. Дно залатать, просмолить, вёсла сделать — и ещё походит. Острова вокруг красивые.')];
}
function drawNadezhda(c, x, y, s, afloat, t, sh) {
  x = Math.round(x); y = Math.round(y);
  if (afloat) { y += Math.round(Math.sin(t * 1.5) * 1); c.fillStyle = 'rgba(10,30,50,.3)'; c.beginPath(); c.ellipse(x, y + 1, 19, 4, 0, 0, 7); c.fill(); }
  else if (sh) shadowE(c, x, y, 18, 4, sh);
  const hull = s >= 2 ? '#4a3020' : '#7a4d2c', top = s >= 2 ? '#6b4a32' : '#a36c40', bot = s >= 2 ? '#2e1e14' : '#5d3a20';
  R(c, x - 18, y - 9, 36, 6, hull); R(c, x - 16, y - 3, 32, 3, bot); R(c, x - 20, y - 8, 2, 4, hull); R(c, x + 18, y - 8, 2, 4, hull);
  R(c, x - 15, y - 9, 30, 1, top); R(c, x - 10, y - 7, 1, 4, bot); R(c, x + 6, y - 7, 1, 4, bot);
  if (s >= 2) { R(c, x - 12, y - 6, 8, 1, 'rgba(255,255,255,.25)'); R(c, x + 2, y - 5, 5, 1, 'rgba(255,255,255,.18)'); }
  if (s === 0) { R(c, x + 2, y - 9, 5, 3, '#3a2a1a'); R(c, x - 22, y - 2, 4, 1, '#a36c40'); }
  if (s === 1) { R(c, x + 1, y - 9, 7, 3, '#c9a26e'); R(c, x + 1, y - 9, 7, 1, '#e2cfaa'); }
  if (s >= 3) { R(c, x - 14, y - 11, 22, 1, '#c9a26e'); R(c, x - 8, y - 12, 22, 1, '#b8915e'); R(c, x + 8, y - 13, 4, 2, '#a5774a'); R(c, x - 16, y - 12, 4, 2, '#a5774a'); }
  if (s >= 5) { R(c, x - 1, y - 34, 2, 26, '#5d3a20'); for (let r = 0; r < 18; r++) { const ww = Math.round(2 + r * .7); R(c, x + 1, y - 32 + r, ww, 1, r % 5 === 2 ? '#d9cdb4' : '#f2ebdc'); } R(c, x + 4, y - 26, 3, 3, '#c9b48a'); R(c, x - 1, y - 37, 5, 3, '#ffffff'); }
  if (afloat) { c.globalAlpha = .45; R(c, x - 22, y + 1, 6, 1, '#e3f4f3'); R(c, x + 17, y + 2, 5, 1, '#e3f4f3'); c.globalAlpha = 1; }
}
function boatBeachUse() {
  const s = boatStage(); S.flags.boatSeen = 1;
  const hint = (lines) => { say(lines.map(l => [HERO, l]), () => UI.tasks()); };
  if (s === 0) {
    if ((S.inv.driftwood | 0) >= 3 && has('wrench')) return startAct('fix', 2.2, () => { take('driftwood', 3); S.flags.boat = 1; toast('«Надежда»: дно залатано', 'driftwood'); hint(['Дыра заделана. Теперь корпус надо просмолить, иначе потечёт. Живицу можно собрать с сосен, а сварить — на печи.']); });
    return hint(['Старая лодка Савелия. Дно пробито, вёсла давно унесло. А на борту ещё читается: «Надежда».', 'Если залатать дно, просмолить и сделать вёсла — она ещё поплавает. Для заплаты нужно три плавника с пляжа и гаечный ключ из сарая.']);
  }
  if (s === 1) {
    if (has('tar')) return startAct('fix', 2, () => { take('tar'); S.flags.boat = 2; toast('«Надежда»: корпус просмолён', 'tar'); hint(['Корпус чёрный и блестит. Пахнет лесом. Осталось сделать вёсла — на верстаке в сарае.']); });
    return hint(['Корпус надо просмолить. Две порции живицы с сосен в лесу — и сварить смолу на печи.']);
  }
  if (s === 2) {
    if (has('oars')) return startAct('pick', .8, () => { take('oars'); S.flags.boat = 3; toast('«Надежда»: вёсла на месте', 'oars'); hint(['Вёсла лежат в лодке. Можно спускать на воду.']); });
    return hint(['Нужны вёсла. Сделаю на верстаке в сарае: два плавника и верёвка.']);
  }
  if (s === 3) return MENU.ask('Спустить «Надежду» на воду?', 'Спустить', 'Не сейчас', launchBoat);
}
function launchBoat() {
  P.dir = 2; startAct('fix', 2.6, () => {
    G.busy = 1; $('#fade').classList.add('on');
    setTimeout(() => {
      S.flags.boat = 4; P.x = 30.6 * T; P.y = 39.6 * T; P.dir = 1; snapCam(); G.busy = 0; $('#fade').classList.remove('on');
      unlock('boat'); AU.chime(); UI.tasks();
      say([[HERO, 'Упёрся плечом, лодка скрипнула, поехала по песку — и закачалась на воде.'], [HERO, '«Надежда» снова на плаву. Пришвартую её у пирса.'], ['Подсказка', 'Подойдите к лодке у пирса, чтобы плыть к островам. На вёслах доступны Тюлений камень и Остров часовни, а до Птичьего базара нужен парус.']]);
    }, 600);
  });
}
function boatDockUse() {
  if (boatStage() === 4 && has('sail') && MAP.id === 'island') return startAct('fix', 2, () => { take('sail'); S.flags.boat = 5; AU.chime(); toast('«Надежда»: парус поднят', 'sail'); UI.tasks(); });
  sailMenu();
}
function sailMenu() {
  if (['storm', 'fog'].includes(S.weather) && MAP.id === 'island') return say([[HERO, S.weather === 'fog' ? 'В такой туман в море не выходят. Даже Матвей сегодня сидит дома.' : 'В грозу в море? Нет уж. Не сегодня.']]);
  if (S.min >= 1200 && MAP.id === 'island') return say([[HERO, 'Темнеет. Ночью в море на вёслах — плохая идея. Завтра.']]);
  const here = MAP.id, opts = [];
  for (const id of ['seals', 'cliffs', 'island']) {
    if (id === here) continue; const I = ISLES[id];
    const noSail = I.far && boatStage() < 5;
    opts.push({ label: id === 'island' ? 'Домой, к маяку' : I.n, sub: id === 'island' ? 'обратно к пирсу' : noSail ? 'нужен парус' : (I.far ? 'под парусом' : 'на вёслах') + ` · около ${I.mins} мин` + (id === 'seals' ? (tideLow() ? ' · сейчас отлив' : ' · отлив 7–10 и 15–18') : '') + ((S.flags.visited || []).includes(id) ? '' : ' · ещё не были'), disabled: noSail, run: () => sailStart(id) });
  }
  MENU.show('«Надежда». Куда плывём?', opts, 'Остаться');
}

// ---------- sailing cut-scene ----------
function sailStart(dest) {
  const from = MAP.id, I = ISLES[dest === 'island' ? from : dest];
  G.sail = { t: 0, dur: 4.6, dest, from, mins: I.mins || 30, sail: boatStage() >= 5 && (ISLES[dest].far || ISLES[from].far) };
  G.mode = 'sail'; $('#prompt').hidden = true; $('#hud').hidden = true; P.sit = null;
  $('#sailCap').textContent = dest === 'island' ? '«Надежда» · домой, к маяку' : '«Надежда» · курс: ' + ISLES[dest].n;
  $('#sailCap').hidden = false;
}
function sailUpdate(dt) {
  const s = G.sail; if (!s) return; s.t += dt;
  if (s.t < s.dur) return;
  const D = ISLES[s.dest];
  MAP = MAPS[s.dest]; P.x = D.dock[0] * T; P.y = D.dock[1] * T; P.dir = D.dock[2];
  S.min += s.mins; G.mode = 'play'; G.sail = null; $('#sailCap').hidden = true; $('#hud').hidden = false; snapCam();
  if (catKept() && CAT.phase === 'follow') { CAT.map = MAP.id; CAT.x = P.x - 10; CAT.y = P.y + 6; }
  if (s.dest !== 'island') {
    const v = S.flags.visited || (S.flags.visited = []);
    const first = !v.includes(s.dest); if (first) { v.push(s.dest); if (v.length >= 2) unlock('captain'); }
    if (s.dest === 'seals') tideApply(true);
    UI.tasks();
    if (first) say({
      seals: [[HERO, 'Тюлений камень. Плоские скалы, приливные лужи — и тюлени. Лежат, как мешки с мукой, и смотрят с подозрением.'], [HERO, 'Если бежать, они попрыгают в воду. Лучше подходить тихо.'], ['Подсказка', 'В отлив, с 7 до 10 и с 15 до 18, со скал на юго-востоке к старой шхуне открывается песчаная коса.']],
      cliffs: [[HERO, 'Птичий базар. Гомон такой, что не слышно собственных мыслей.'], [HERO, 'На пляже палатка и костёр. Кто-то здесь живёт.']],
    }[s.dest]);
  }
}
function isleSil(c, kind, x, base, s, col) {
  c.fillStyle = col;
  if (kind === 'island') { c.beginPath(); c.moveTo(x - 60 * s, base); c.lineTo(x - 30 * s, base - 14 * s); c.lineTo(x + 20 * s, base - 16 * s); c.lineTo(x + 60 * s, base); c.fill(); R(c, x - 4 * s, base - 50 * s, 8 * s, 36 * s, col); R(c, x - 3 * s, base - 56 * s, 6 * s, 6 * s, '#ffd477'); return; }
  if (kind === 'seals') { c.beginPath(); c.moveTo(x - 40 * s, base); c.lineTo(x - 30 * s, base - 5 * s); c.lineTo(x + 25 * s, base - 6 * s); c.lineTo(x + 40 * s, base); c.fill(); return; }
  if (kind === 'cliffs') { c.beginPath(); c.moveTo(x - 30 * s, base); c.lineTo(x - 24 * s, base - 30 * s); c.lineTo(x - 10 * s, base - 46 * s); c.lineTo(x + 6 * s, base - 40 * s); c.lineTo(x + 22 * s, base - 28 * s); c.lineTo(x + 32 * s, base); c.fill(); for (let i = 0; i < 14; i++) { const a = G.time * .8 + i, bx = x + Math.cos(a) * 40 * s, by = base - 50 * s + Math.sin(a * 1.3) * 12 * s; R(c, bx - 1, by, 3, 1, col); } }
}
function drawSail() {
  const c = ctx, w = VW, h = VH, s = G.sail, k = clamp(s.t / s.dur, 0, 1), t = G.time;
  const hr = (S.min % 1440) / 60, night = hr < 5.5 || hr >= 20.5, dusk = !night && hr >= 17.5, grey = ['rain', 'storm', 'cloudy'].includes(S.weather);
  const hor = Math.round(h * .55);
  const g = c.createLinearGradient(0, 0, 0, hor);
  const sky = night ? ['#070d1f', '#1d2a55'] : grey ? ['#5a6470', '#9aa3ac'] : dusk ? ['#3a3f7a', '#ff9a5c'] : ['#5d9ccf', '#cfe8f4'];
  g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]); c.fillStyle = g; c.fillRect(0, 0, w, hor);
  if (night) for (let i = 0; i < 60; i++) R(c, hash(i, 1) * w, hash(i, 2) * hor * .9, 1, 1, '#fff6e0');
  const sea = c.createLinearGradient(0, hor, 0, h); sea.addColorStop(0, night ? '#14234a' : grey ? '#4f5964' : dusk ? '#a8566a' : '#3a7fa8'); sea.addColorStop(1, night ? '#081226' : grey ? '#38414b' : dusk ? '#2d2f5a' : '#1d5577'); c.fillStyle = sea; c.fillRect(0, hor, w, h - hor);
  for (let i = 0; i < 60; i++) { const yy = hor + 2 + Math.pow(hash(i, 5), 1.5) * (h - hor), xx = ((hash(i, 6) * w * 1.4 - t * (14 + (yy - hor) * .5)) % (w + 40) + w + 40) % (w + 40) - 20; if (Math.sin(t * 1.6 + i) > .2) R(c, xx, yy, 3 + (yy - hor) * .08, 1, night ? 'rgba(170,190,240,.35)' : 'rgba(225,240,255,.55)'); }
  const sil = night ? '#0a1120' : grey ? '#3a424c' : dusk ? '#3a2d4a' : '#4f6a86';
  isleSil(c, s.from === 'island' ? 'island' : s.from, lerp(w * .22, -w * .5, smooth(k)), hor + 1, 1.1, sil);
  isleSil(c, s.dest, lerp(w * 1.5, w * .8, smooth(k)), hor + 1, 1.1, sil);
  // the boat
  const bx = Math.round(w * .46), by = Math.round(hor + (h - hor) * .45 + Math.sin(t * 1.8) * 2), row = Math.sin(t * 4);
  for (let i = 0; i < 7; i++) { c.globalAlpha = .5 - i * .06; R(c, bx - 26 - i * 9, by + 2 + (i % 2), 6, 1, '#e3f4f3'); } c.globalAlpha = 1;
  c.fillStyle = '#4a3020'; c.beginPath(); c.moveTo(bx - 20, by - 6); c.lineTo(bx + 22, by - 6); c.lineTo(bx + 16, by + 2); c.lineTo(bx - 16, by + 2); c.fill(); R(c, bx - 18, by - 7, 38, 1, '#6b4a32');
  if (s.sail) { R(c, bx, by - 34, 2, 28, '#5d3a20'); c.fillStyle = '#f2ebdc'; c.beginPath(); c.moveTo(bx + 2, by - 32); c.quadraticCurveTo(bx + 18 + Math.sin(t * 2) * 2, by - 20, bx + 2, by - 8); c.fill(); R(c, bx + 1, by - 37, 5, 3, '#ffffff'); }
  // keeper rowing
  R(c, bx - 5, by - 14, 6, 8, '#2f5d8a'); R(c, bx - 5, by - 14, 6, 2, '#e8c55a'); R(c, bx - 4, by - 20, 5, 6, '#f0c8a0'); R(c, bx - 5, by - 22, 6, 3, '#c8553d');
  if (!s.sail) { c.strokeStyle = '#c9a26e'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx - 3, by - 10); c.lineTo(bx - 20 - row * 6, by + 3 + row * 2); c.stroke(); R(c, bx - 22 - row * 6, by + 2 + row * 2, 4, 2, '#a5774a'); }
  if (catKept() && CAT.phase === 'follow') drawCat(c, bx + 12, by - 6, 'sit', 2, t);
  if (S.weather === 'rain' || S.weather === 'storm') { c.fillStyle = 'rgba(200,215,240,.5)'; for (let i = 0; i < 80; i++) c.fillRect((hash(i, 3) * w + t * 20) % w, (hash(i, 9) * h + t * 160 * (1 + hash(i, 1))) % h, 1, 4); }
  if (night) { c.fillStyle = 'rgba(8,14,36,.35)'; c.fillRect(0, 0, w, h); }
  if (k < .12 || k > .88) { c.fillStyle = `rgba(5,8,15,${k < .12 ? 1 - k / .12 : (k - .88) / .12})`; c.fillRect(0, 0, w, h); }
}

// ---------- islet maps (v2) ----------
function lineDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, k = l ? clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1) : 0; return Math.hypot(px - ax - dx * k, py - ay - dy * k); }
function genSeals() {
  const w = 46, h = 32, m = newMap('seals', w, h, { edge: DEEP, outdoor: true, isle: true }); m.tide = [];
  const E = (x, y, cx, cy, rx, ry) => Math.hypot((x - cx) / rx, (y - cy) / ry);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = (hash(x + 300, y) - .5) * .1 + Math.sin(x * .5 + y * .3) * .03;
    const d1 = E(x, y, 16, 14, 12.5, 9), d2 = E(x, y, 31, 11, 7.5, 5.5), d3 = E(x, y, 38.5, 25, 3.6, 2.6);
    const d = Math.min(d1, d2, d3) + n;
    let t = d < .64 ? FLAT : d < .95 ? SAND : d < 1.12 ? SHALLOW : DEEP;
    if (d3 < 1 && t === FLAT) t = SAND;
    if (t === FLAT && d1 < .4 && hash(x + 11, y + 5) > .55) t = GRASS;
    m.t[y * w + x] = t;
  }
  [[10, 9, 1.9], [21.5, 7.5, 1.5], [33, 9.5, 1.7], [12.5, 19, 1.3], [25, 15, 1.1]].forEach(([cx, cy, r]) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (Math.hypot(x - cx, y - cy) < r && !isWater(tAt(m, x, y))) tSet(m, x, y, ROCK); });
  [[18.5, 12, 1.5], [28.5, 12.5, 1.3], [7.5, 14, 1.2]].forEach(([cx, cy, r]) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (Math.hypot(x - cx, y - cy) < r) tSet(m, x, y, SHALLOW); });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (lineDist(x, y, 25, 20.5, 31, 22.5) < 1.1 || lineDist(x, y, 31, 22.5, 36, 24.5) < 1.1) { if (isWater(tAt(m, x, y))) { tSet(m, x, y, SHALLOW); m.tide.push(y * w + x); } }
  for (let y = 0; y < h; y++) for (let x = 15; x <= 16; x++) { const tt = tAt(m, x, y); if (y > 18 && (isWater(tt) || y > 25)) tSet(m, x, y, PIER); }
  return m;
}
function genCliffs() {
  const w = 40, h = 42, m = newMap('cliffs', w, h, { edge: DEEP, outdoor: true, isle: true });
  const E = (x, y, cx, cy, rx, ry) => Math.hypot((x - cx) / rx, (y - cy) / ry);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = (hash(x + 700, y + 1) - .5) * .1 + Math.sin(x * .7) * .02;
    const d = E(x, y, 20, 18, 15.5, 16) + n, beach = E(x, y, 15, 31, 12, 5.5) + n;
    let t = d < .97 ? ROCK : d < 1.1 ? SHALLOW : DEEP;
    if (beach < 1) t = beach < .85 ? SAND : (isWater(t) ? SAND : t);
    else if (beach < 1.18 && isWater(t)) t = SHALLOW;
    if (E(x, y, 20, 8, 7.5, 3.6) < 1) t = GRASS;
    m.t[y * w + x] = t;
  }
  const P = [[20, 30], [20, 27], [10, 26], [10, 21.5], [29, 21.5], [29, 16.5], [13, 16.5], [13, 11.5], [18, 10]];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { for (let i = 0; i < P.length - 1; i++) if (lineDist(x, y, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1]) < .9 && tAt(m, x, y) === ROCK) { tSet(m, x, y, PATH); break; } }
  for (let y = 33; y < h; y++) for (let x = 21; x <= 22; x++) { const tt = tAt(m, x, y); if (isWater(tt) || y > 36) tSet(m, x, y, PIER); }
  return m;
}

// ---------- data for the two islets ----------
Object.assign(ITEMS, {
  knife: { n: 'Складной нож', d: 'Из сарая. Острый — сеть разрежет.' },
  bell: { n: 'Судовой колокол', d: 'Маленький латунный колокол со шхуны «Святая Ольга», 1932. Звенит чисто.', souv: true },
  binoculars: { n: 'Бинокль Нюры', d: 'Подарок орнитолога. Теперь птиц видно издалека — атлас заполняется быстрее.' },
});
ATLAS.sea = { title: 'Море', items: [
  { id: 'seal', n: 'Серый тюлень', d: 'Лежит на камнях, как мешок с мукой. Если бежать — плюхнется в воду.', hint: 'Тюлений камень. Подходите тихо.' },
  { id: 'starfish', n: 'Морская звезда', d: 'Пять лучей. Если потеряет один — отрастит новый.', hint: 'Под камнями у приливных луж.' },
  { id: 'crab', n: 'Краб', d: 'Ходит боком и грозит клешнёй всему миру.', hint: 'Под камнями у приливных луж.' },
  { id: 'hermit', n: 'Рак-отшельник', d: 'Живёт в чужой ракушке и переезжает, когда вырастает.', hint: 'Под камнями у приливных луж.' },
  { id: 'urchin', n: 'Морской ёж', d: 'Колючий шарик. Если наступить — запомнишь надолго.', hint: 'Под камнями у приливных луж.' },
] };
ACH.push(
  ['boat', 'Снова на плаву', 'Починить «Надежду» и спустить её на воду'],
  ['captain', 'Капитан «Надежды»', 'Побывать на обоих островах'],
  ['pup', 'Тюлений друг', 'Освободить тюленёнка из сети'],
  ['wreck', 'Сокровище отлива', 'Найти сундучок в старой шхуне'],
  ['nyura', 'Друг Нюры', 'Выполнить все просьбы Нюры'],
);
LOOKS.nyura = { skin: '#f1cba7', hair: '#d8a050', coat: '#5f7f4a', coat2: '#4c6a3a', pants: '#4a4a5a', hat: 'beanie', hatC: '#e8c55a', long: true, bag: '#8a5a32' };
NPCS.nyura = { name: 'Нюра', look: 'nyura' };
NAME_LOOK['Нюра'] = 'nyura';
function iconMore4(id, p, c) {
  switch (id) {
    case 'sea_hermit': for (let i = 0; i < 5; i++) p(7 - i, 4 + i, i * 2 + 2, 1, i % 2 ? '#e8b49a' : '#f3d2c0'); p(3, 9, 9, 3, '#d9a990'); p(11, 9, 3, 2, '#d9473a'); p(13, 8, 2, 1, '#d9473a'); p(12, 11, 3, 1, '#b8382e'); return true;
    case 'sea_urchin': disc(c, 8, 9, 4, '#5a2a5a'); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; p(Math.round(8 + Math.cos(a) * 6), Math.round(9 + Math.sin(a) * 6), 1, 1, '#7a3a7a'); } p(7, 7, 2, 1, '#9a5a9a'); return true;
    case 'knife': p(3, 9, 7, 3, '#8a5a32'); p(3, 9, 7, 1, '#a87444'); p(9, 6, 5, 3, '#c9ced6'); p(9, 6, 5, 1, '#eef2f6'); p(13, 7, 1, 1, '#c9ced6'); return true;
    case 'bell': p(7, 1, 2, 2, '#8a6a2a'); p(5, 3, 6, 2, '#d9b04a'); p(4, 5, 8, 6, '#d9b04a'); p(3, 11, 10, 2, '#c9a24a'); p(5, 5, 2, 5, '#f2d88a'); p(7, 13, 2, 2, '#6a5020'); return true;
    case 'binoculars': p(2, 5, 5, 8, '#2c2f38'); p(9, 5, 5, 8, '#2c2f38'); p(6, 7, 4, 3, '#3a3e48'); p(3, 11, 3, 2, '#7fb8d8'); p(10, 11, 3, 2, '#7fb8d8'); p(3, 4, 3, 1, '#5f7f4a'); p(10, 4, 3, 1, '#5f7f4a'); return true;
  }
  return false;
}

// ---------- tides ----------
function tideLow() { const h = (S.min % 1440) / 60; return (h >= 7 && h < 10) || (h >= 15 && h < 18); }
function tideApply(force) {
  const m = MAPS.seals, low = tideLow(); if (!m || (m.tideLow === low && !force)) return;
  const changed = m.tideLow !== undefined && m.tideLow !== low; m.tideLow = low;
  for (const i of m.tide) m.t[i] = low ? SAND : SHALLOW;
  buildGround(m);
  if (MAP && MAP.id === 'seals' && changed) {
    toast(low ? 'Отлив: открылась коса к старой шхуне' : 'Прилив: вода скрыла косу');
    if (!low && solidAt(m, P.x, P.y - 2)) { P.x = 24.5 * T; P.y = 20.3 * T; snapCam(); toast('Пришлось быстро вернуться на камни'); }
  }
}

// ---------- seals ----------
function pell(c, cx, cy, rx, ry, col) { for (let dy = -ry; dy <= ry; dy++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + .35)) ** 2))); R(c, cx - w, cy + dy, w * 2 + 1, 1, col); } }
const SEAL_ADULT = [
  '....oooo..............',
  '...ommmmo.............',
  '..ommmmmmo............',
  '..omemmemo............',
  '..ommnnmmo............',
  '..omwwwwmo............',
  '..ommwwmmoo...........',
  '..ommmmmmmmoo.........',
  '..omwmmmsmmmmoo.......',
  '..omwwmmmmmsmmmoo.....',
  '...owwwdmmmmmmmmmoo.oo',
  '...owwodmwwmmsmmmmmodo',
  '....owwoowwwwwwmmmmmmo',
  '.....oooooooooooooooo.',
];
const SEAL_PUP = [
  '...oooo.........',
  '..ommmmo........',
  '.omemmemo.......',
  '.ommnnmmo.......',
  '.omwwwwmoo......',
  '.ommmmmmmmoo....',
  '..owmmmmmmmmoo.o',
  '..owwodwwmmmmmdo',
  '...oowwwwwwmmmmo',
  '....oooooooooooo',
];
const SEAL_PAL = [
  { o: '#353b43', m: '#8a939c', w: '#cdd3d8', d: '#69727b', s: '#5f6871', e: '#15191e', n: '#2a2f36' },
  { o: '#3a332e', m: '#968a7e', w: '#d8cfc5', d: '#766b61', s: '#6a5f56', e: '#15191e', n: '#2a2f36' },
];
const PUP_PAL = { o: '#7f8790', m: '#f4f5f6', w: '#ffffff', d: '#d6dbe0', s: '#e3e6e9', e: '#15191e', n: '#5a5f66' };
function drawSealGrid(c, x, y, grid, pal, faceRight, bob, blink) {
  const h = grid.length, w = grid[0].length, x0 = Math.round(x - w / 2), y0 = Math.round(y - h);
  for (let r = 0; r < h; r++) { const row = grid[r], dy = r < 7 ? bob : 0; for (let i = 0; i < row.length; i++) { let ch = row[i]; if (ch === '.') continue; if (blink && ch === 'e') ch = 'm'; const col = pal[ch]; if (!col) continue; R(c, faceRight ? x0 + w - 1 - i : x0 + i, y0 + r + dy, 1, 1, col); } }
  return { x0, y0, w };
}
function drawSealBody(c, x, y, t, s, pup) {
  x = Math.round(x); y = Math.round(y);
  const right = s % 2 === 1, bob = Math.sin(t * .5 + s * 2.1) > .55 ? 1 : 0, blink = (t + s * 1.7) % 5 > 4.82;
  const grid = pup ? SEAL_PUP : SEAL_ADULT, pal = pup ? PUP_PAL : SEAL_PAL[s % 3 === 2 ? 1 : 0];
  c.fillStyle = 'rgba(20,28,40,.3)'; c.beginPath(); c.ellipse(x, y, grid[0].length / 2 + 1, 2.2, 0, 0, 7); c.fill();
  const g = drawSealGrid(c, x, y, grid, pal, right, bob, blink);
  // whiskers next to the nose
  const nr = pup ? 3 : 4, nx = right ? g.x0 + g.w - 1 - (pup ? 4 : 5) : g.x0 + (pup ? 4 : 5), ny = g.y0 + nr + bob;
  c.globalAlpha = .8; R(c, nx - 4, ny + 1, 2, 1, '#eef1f3'); R(c, nx + 3, ny + 1, 2, 1, '#eef1f3'); c.globalAlpha = 1;
}
function drawSealHead(c, x, y, t, s) {
  x = Math.round(x); y = Math.round(y + Math.sin(t * 2 + s) * 1); const dip = Math.sin(t * .7 + s * 3) > .8;
  if (dip) { c.globalAlpha = .6; R(c, x - 4, y, 8, 1, '#e3f4f3'); c.globalAlpha = 1; return; }
  const p = SEAL_PAL[s % 3 === 2 ? 1 : 0];
  R(c, x - 3, y - 6, 7, 6, p.o); R(c, x - 2, y - 7, 5, 1, p.o); R(c, x - 2, y - 5, 5, 5, p.m); R(c, x - 1, y - 6, 3, 1, p.m);
  R(c, x - 1, y - 4, 1, 1, p.e); R(c, x + 1, y - 4, 1, 1, p.e); R(c, x, y - 3, 1, 1, p.n); R(c, x - 1, y - 2, 3, 1, p.w);
  c.globalAlpha = .55; R(c, x - 6, y, 13, 1, '#e3f4f3'); c.globalAlpha = 1;
}
function nearestWater(m, x, y) { let best = null, bd = 1e9; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) { const tx = Math.floor(x / T) + dx, ty = Math.floor(y / T) + dy; if (isWater(tAt(m, tx, ty)) && !(m.tide || []).includes(ty * m.w + tx)) { const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [tx * T + 8, ty * T + 10]; } } } return best || [x, y + 40]; }
function drawNet(c, x, y, t) { const o = Math.sin(t * 6) > 0 ? 1 : 0, col = '#7a5a34'; for (let yy = -10; yy <= -1; yy++) for (let xx = -8; xx <= 8; xx++) if (((xx + 8 + o) % 4 === 0 && yy % 2 === 0) || ((yy + 10) % 3 === 0 && (xx + o) % 2 === 0)) R(c, x + xx, y + yy, 1, 1, col); R(c, x + 8, y - 5, 3, 3, '#e8c55a'); R(c, x + 8, y - 5, 3, 1, '#c9a24a'); }

// ---------- the counting game (kittiwakes on the north ledge) ----------
let COUNT_ON = false;
const COUNT = { birds: [], marked: new Set() };
function openCount() {
  const r = rng(S.day * 91 + 7); COUNT.birds = []; COUNT.marked = new Set();
  const rows = [38, 66, 94, 122];
  rows.forEach((ry, ri) => { let x = 14 + r() * 10; while (x < 226) { const kind = r() < .2 ? 'fulmar' : 'kitti'; COUNT.birds.push({ x, y: ry, kind, s: r() * 9 }); x += 22 + r() * 26; } });
  COUNT_ON = true; $('#count').hidden = false; countText();
}
function countText() { $('#countN').textContent = `Отмечено: ${COUNT.marked.size}`; }
function closeCount() { COUNT_ON = false; $('#count').hidden = true; }
$('#countX').onclick = closeCount;
$('#countReset').onclick = () => { COUNT.marked.clear(); countText(); };
$('#countDone').onclick = () => {
  const kitti = COUNT.birds.filter(b => b.kind === 'kitti'), ok = kitti.every(b => COUNT.marked.has(b)) && [...COUNT.marked].every(b => b.kind === 'kitti');
  S.flags.nyCountN = COUNT.marked.size; S.flags.nyCountOK = ok; S.flags.nyCountTrue = kitti.length; S.flags.nyCount = 'counted';
  closeCount(); toast(`Насчитали ${COUNT.marked.size}. Расскажите Нюре`); UI.tasks();
};
$('#countC').addEventListener('pointerdown', e => {
  const cv = $('#countC'), rc = cv.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width * cv.width, y = (e.clientY - rc.top) / rc.height * cv.height;
  let best = null, bd = 11; for (const b of COUNT.birds) { const d = Math.hypot(b.x - x, b.y - 4 - y); if (d < bd) { bd = d; best = b; } }
  if (best) { COUNT.marked.has(best) ? COUNT.marked.delete(best) : COUNT.marked.add(best); AU.blip(); countText(); }
});
function drawCount(c, w, h, t) {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9aa6b0'); g.addColorStop(1, '#6c757f'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) R(c, hash(i, 3) * w, hash(i, 7) * h, 2, 1, i % 2 ? '#7d868f' : '#b8c0c7');
  [38, 66, 94, 122].forEach(ry => { R(c, 0, ry, w, 3, '#4f5761'); R(c, 0, ry + 3, w, 2, '#3a4048'); for (let x = 0; x < w; x += 7) R(c, x, ry - 1, 4, 1, '#eef2f4'); });
  for (const b of COUNT.birds) {
    const x = Math.round(b.x), y = Math.round(b.y), bob = Math.sin(t * 2 + b.s) > .85 ? -1 : 0;
    drawBird(c, x, y + bob, b.kind === 'kitti' ? 'kittiwake' : 'fulmar', { t: 0, s: b.s, right: b.s > 4.5 });
    if (COUNT.marked.has(b)) { R(c, x - 2, y - 17, 5, 5, '#ffc95c'); R(c, x - 1, y - 16, 3, 3, '#2a1b08'); R(c, x, y - 15, 1, 1, '#ffc95c'); }
  }
}

// ---------- Nyura ----------
const nyuraHere = () => S.min >= 360 && S.min < 1320;
function nyuraLines() {
  const out = [];
  if (S.flags.pupSeen && !S.flags.pupFree) out.push(has('knife') ? 'Тюлений камень: разрезать сеть' : 'Тюлений камень: освободить тюленёнка (нож в сарае)');
  if (S.flags.ny === 1) {
    if (S.flags.nyCount !== 'done') out.push(S.flags.nyCount === 'counted' ? 'Нюра: рассказать, сколько моевок' : 'Нюра: пересчитать моевок (с плато)');
    if (S.flags.nyRing !== 'done') out.push(S.flags.nyRing === 'seen' ? 'Нюра: назвать номер кольца' : 'Нюра: найти кайру с кольцом (восточные уступы)');
    if (!S.flags.nyUha) out.push(has('uha') ? 'Нюра: отдать уху' : 'Нюра: привезти горячей ухи');
  }
  return out;
}
function nyuraTalk() {
  const L = t => ['Нюра', t], f = S.flags;
  if (!f.ny) { f.ny = 1; return say([L('Ой! Человек! Здравствуйте. Я Нюра, орнитолог. Третье лето считаю птиц на этом базаре.'), L('Вы смотритель? С маяка? Ваш огонь мне по ночам вместо ночника.'), L('Раз уж приплыли — поможете? Три дела, все несложные.'), L('Первое: пересчитайте моевок на северном уступе. С плато видно лучше всего. Только глупышей не считайте, они серые и с трубочкой на клюве.'), L('Второе: где-то на восточных уступах сидит кайра с кольцом на лапке. Прочитайте мне номер.'), L('И третье... привезите горячей ухи. Третью неделю на сухарях.')], () => UI.tasks()); }
  if (f.nyCount === 'counted') {
    if (f.nyCountOK) { f.nyCount = 'done'; return say([L(`${f.nyCountN}! Сходится с моими. Вот это глаз!`)], () => nyuraCheckDone()); }
    f.nyCount = undefined; return say([L(`${f.nyCountN}? Хм, у меня вышло иначе. Глупышей не посчитали случайно? Пересчитайте, пожалуйста.`)], () => UI.tasks());
  }
  if (f.nyRing === 'seen') { f.nyRing = 'done'; return say([L('N-1147?! Это же моя! Я окольцевала её птенцом три года назад. Вернулась домой, умница.')], () => nyuraCheckDone()); }
  if (f.ny === 1 && !f.nyUha && has('uha')) { take('uha'); f.nyUha = 1; return say([L('Уха! Горячая! Можно я вас обниму? Ладно, не буду, я пахну рыбой. Хотя вы тоже.'), L('Спасибо, смотритель.')], () => nyuraCheckDone()); }
  if (f.ny === 2) return say([L(['Бинокль не потеряйте! Он со мной десять лет по базарам.', 'Глупыши сегодня спорят с моевками. Как всегда.', 'Передайте Матвею, что я жду его с рыбой в пятницу.', 'Ночью приплывите посмотреть, как светится вода. Бывает тут такое.'][S.day % 4])]);
  return say([L(['Моевки на северном уступе, кайра с кольцом на востоке, уха... ну, вы помните.', 'Тропа наверх крутая, но хорошая. Я каждый день хожу.', 'Чай будете? Ой, кончился. Ладно.'][S.day % 3])]);
}
function nyuraCheckDone() {
  const f = S.flags; UI.tasks();
  if (f.nyCount === 'done' && f.nyRing === 'done' && f.nyUha && f.ny !== 2) {
    f.ny = 2; say([['Нюра', 'Всё! Вы мне за три дня помогли больше, чем вся моя кафедра за год.'], ['Нюра', 'Держите бинокль. У меня запасной. С ним птиц видно издалека, сами разберётесь.']], () => { give('binoculars'); unlock('nyura'); UI.tasks(); });
  }
}

// ---------- building both islets ----------
function buildIslets() {
  VOICES['Нюра'] = [349, 'triangle', .12];
  MAPS.seals = genSeals(); MAPS.cliffs = genCliffs();
  tideApply(true); buildGround(MAPS.cliffs);
  const sm = MAPS.seals, cm = MAPS.cliffs;
  for (const m of [sm, cm]) for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { const t = tAt(m, x, y), hh = hash(x + 41 + m.w, y + 13); if (t === GRASS) { if (hh > .4) m.decor.push({ x: x * T + 3 + (hash(x, y * 2) * 10 | 0), y: y * T + 6 + (hash(y, x * 2) * 9 | 0), k: 'tuft', s: (hh * 100) | 0, col: '#4f9145' }); if (hh > .9) m.decor.push({ x: x * T + 6, y: y * T + 10, k: 'flower', s: (hh * 40) | 0 }); } else if (t === FLAT && hh > .86) m.decor.push({ x: x * T + 5, y: y * T + 10, k: 'tuft', s: (hh * 100) | 0, col: '#6f8a52' }); }
  // boats at docks
  for (const id of ['seals', 'cliffs', 'island']) { const I = ISLES[id]; addObj(id, { x: I.boat[0] * T, y: I.boat[1] * T, kind: 'nadezhda', r: 30, iy: I.boat[1] * T - 6, on: () => boatStage() >= 4, draw(c, sx, sy) { drawNadezhda(c, sx, sy, boatStage(), true, G.time); }, use: { label: () => (boatStage() === 4 && has('sail') && id === 'island') ? 'Поставить парус на «Надежду»' : 'Сесть в «Надежду»', run: boatDockUse } }); }
  // --- seal rock ---
  [[14, 6.7, 0], [31, 6.6, 1], [37.2, 12.2, 2], [5.4, 12.2, 3], [21, 18.6, 4], [9.4, 20.6, 5]].forEach(([x, y, s]) => {
    const o = addObj('seals', { x: x * T, y: y * T, kind: 'seal', water: 0, draw(c, sx, sy) { if (o.water > 0) drawSealHead(c, o.wx - G.cam.x, o.wy - G.cam.y, G.time, s); else drawSealBody(c, sx, sy, G.time, s, false); } });
    Object.defineProperty(o, 'solid', { get() { return o.water > 0 ? null : [-11, -5, 22, 5]; } });
    [o.wx, o.wy] = nearestWater(sm, o.x, o.y);
  });
  const pup = addObj('seals', { x: 7.6 * T, y: 17.4 * T, kind: 'pup', r: 30, iy: 17.4 * T - 6, draw(c, sx, sy) {
    const wig = !S.flags.pupFree ? Math.round(Math.sin(G.time * 7) * 1) : 0;
    drawSealBody(c, sx + wig, sy, G.time, 0, true); if (!S.flags.pupFree) drawNet(c, sx, sy, G.time); else if (Math.hypot(P.x - pup.x, P.y - pup.y) < 50 && Math.sin(G.time * 2) > .6) { R(c, sx - 1, sy - 16, 2, 2, '#f07a7a'); R(c, sx + 1, sy - 16, 2, 2, '#f07a7a'); R(c, sx, sy - 14, 2, 1, '#f07a7a'); }
  }, use: { label: () => !S.flags.pupFree ? (has('knife') ? 'Разрезать сеть' : 'Тюленёнок запутался в сети') : (has('fish') && S.flags.pupDay !== S.day ? 'Угостить тюленёнка рыбой' : 'Погладить тюленёнка'), run: pupRun } });
  // shipwreck on the tidal islet
  addObj('seals', { x: 39 * T, y: 25.7 * T, kind: 'wreck', solid: [-26, -8, 52, 8], draw(c, sx, sy) { drawWreck(c, sx, sy); } });
  addObj('seals', { x: 39.6 * T, y: 26.6 * T, kind: 'chest', r: 18, on: () => !S.flags.wreckChest, draw(c, sx, sy) { R(c, sx - 6, sy - 8, 12, 8, '#6b4429'); R(c, sx - 6, sy - 8, 12, 2, '#8a5a32'); R(c, sx - 6, sy - 4, 12, 1, '#3a2a1a'); R(c, sx - 1, sy - 6, 2, 3, '#c9a24a'); R(c, sx - 7, sy - 1, 14, 1, 'rgba(60,110,90,.6)'); }, use: { label: () => 'Открыть сундучок', run: () => startAct('pick', 1.2, () => { S.flags.wreckChest = 1; unlock('wreck'); say([[HERO, 'Сундучок разбух от воды, но открылся. Внутри — водоросли, ракушки и маленький латунный колокол.'], [HERO, 'На колоколе гравировка: «Святая Ольга», 1932.']], () => give('bell')); }) } });
  addObj('seals', { x: 37.4 * T, y: 23.8 * T, kind: 'sign', draw(c, sx, sy) { R(c, sx, sy - 10, 2, 10, '#5d3a20'); R(c, sx - 4, sy - 12, 10, 3, '#8a6a48'); } });
  // driftwood logs and kelp
  [[12, 21.6], [26, 8.3], [31, 15.6]].forEach(([x, y], i) => addObj('seals', { x: x * T, y: y * T, kind: 'log', solid: [-12, -4, 24, 4], draw(c, sx, sy) { drawDriftLog(c, sx, sy, i + 3, G.sh); } }));
  for (let y = 0; y < sm.h; y++) for (let x = 0; x < sm.w; x++) if (tAt(sm, x, y) === SHALLOW && !sm.tide.includes(y * sm.w + x) && hash(x + 3, y + 99) > .9) addObj('seals', { x: x * T + 8, y: y * T + 12, kind: 'kelp', layer: -1, draw(c, sx, sy) { for (let i = 0; i < 3; i++) { const sw = Math.sin(G.time * 1.3 + i + sx * .1) * 2; R(c, sx - 3 + i * 3 + Math.round(sw), sy - 8 + i, 1, 6, i % 2 ? '#3f6a3a' : '#2f5a32'); } } });
  // --- bird cliffs ---
  addObj('cliffs', { x: 8.6 * T, y: 31.4 * T, kind: 'tent', solid: [-16, -14, 32, 13], r: 18, draw(c, sx, sy) { drawTent(c, sx, sy); }, use: { label: () => 'Палатка Нюры', run: () => say([[HERO, nyuraHere() ? 'Спальник, гора тетрадей, книга «Птицы Севера» в пятнах от чая.' : 'Из палатки доносится тихое сопение. Нюра спит.']]) } });
  addObj('cliffs', { x: 12.6 * T, y: 32.9 * T, kind: 'fire', solid: [-6, -4, 12, 4], draw(c, sx, sy) { drawCampfire(c, sx, sy); } });
  addObj('cliffs', { x: 17.2 * T, y: 30.4 * T, kind: 'tripod', solid: [-4, -3, 8, 3], r: 14, draw(c, sx, sy) { R(c, sx - 4, sy - 2, 1, 2, '#3a3e48'); R(c, sx + 3, sy - 2, 1, 2, '#3a3e48'); R(c, sx - 1, sy - 12, 2, 11, '#3a3e48'); R(c, sx - 5, sy - 15, 10, 4, '#5f7f4a'); R(c, sx + 4, sy - 14, 2, 2, '#9ec7da'); }, use: { label: () => 'Подзорная труба Нюры', run: () => say([[HERO, 'Труба смотрит на уступы. Видно каждую птицу: моевки ссорятся, кайры стоят навытяжку, а глупыши парят, не шевеля крыльями.']]) } });
  addObj('cliffs', { x: 7.2 * T, y: 29.2 * T, kind: 'line', draw(c, sx, sy) { R(c, sx - 24, sy - 22, 1, 22, '#5d3a20'); R(c, sx + 24, sy - 22, 1, 22, '#5d3a20'); c.strokeStyle = '#d8c7a4'; c.beginPath(); c.moveTo(sx - 23, sy - 21); c.quadraticCurveTo(sx, sy - 17, sx + 24, sy - 21); c.stroke(); [[-16, '#d9473a', 5], [-6, '#3b6aa0', 7], [6, '#e8c55a', 4], [14, '#f2ece0', 5]].forEach(([dx, col, hh], i) => { const sw = Math.round(Math.sin(G.time * 2 + i) * G.wind * .6); R(c, sx + dx + sw, sy - 19, 4, hh, col); }); } });
  addObj('cliffs', { x: 11.2 * T, y: 30.2 * T, kind: 'crates', solid: [-8, -6, 16, 6], draw(c, sx, sy) { drawCrate(c, sx - 4, sy, G.sh, false); R(c, sx + 2, sy - 6, 7, 6, '#7a4d2c'); R(c, sx + 3, sy - 8, 5, 2, '#e9dcbc'); } });
  addObj('cliffs', { x: 20.4 * T, y: 30.2 * T, kind: 'sign', solid: [-1, -2, 3, 2], draw(c, sx, sy) { R(c, sx, sy - 12, 2, 12, '#6b4a2e'); R(c, sx - 6, sy - 13, 14, 4, '#b68a58'); }, use: { label: () => 'Прочитать табличку', run: () => say([['Табличка', '«Тропа на плато. Птиц не тревожить. Перья брать можно». И ниже, другим почерком: «Нюра здесь, стучите в палатку».']]) } });
  // ledge birds
  const ledges = []; for (let y = 1; y < cm.h - 1; y++) for (let x = 1; x < cm.w - 1; x++) if (tAt(cm, x, y) === ROCK && [[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => [FLAT, GRASS, SAND, PATH].includes(tAt(cm, x + dx, y + dy)))) ledges.push([x, y]);
  ledges.forEach(([x, y], i) => { if (hash(x + 90, y + 4) > .58) return; const kind = y <= 5 ? 'kittiwake' : x >= 26 ? 'guillemot' : x <= 12 ? 'fulmar' : (hash(x, y) > .5 ? 'kittiwake' : 'fulmar'); addObj('cliffs', { x: x * T + 8, y: y * T + 9, kind: 'cbird', species: kind, draw(c, sx, sy) { drawCliffBird(c, sx - 3, sy, kind, G.time, i); drawCliffBird(c, sx + 4, sy + 3, kind, G.time, i + .5); } }); });
  addObj('cliffs', { x: 30.6 * T, y: 19.4 * T, kind: 'ringbird', r: 20, ix: 30.4 * T, iy: 19.2 * T, draw(c, sx, sy) { drawCliffBird(c, sx, sy, 'guillemot', G.time, 3); R(c, sx - 1, sy - 1, 2, 1, '#d9473a'); }, use: { label: () => S.flags.ny === 1 && !S.flags.nyRing ? 'Рассмотреть кольцо на лапке' : 'Кайра', run: () => { if (S.flags.ny === 1 && !S.flags.nyRing) { S.flags.nyRing = 'seen'; UI.tasks(); return say([[HERO, 'Кайра стоит на уступе, как маленький официант. На лапке — красное кольцо: «N-1147».']]); } say([[HERO, 'Кайра смотрит свысока. В прямом смысле.']]); } } });
  addObj('cliffs', { x: 20 * T, y: 5.6 * T, kind: 'view', r: 18, draw(c, sx, sy) { R(c, sx - 1, sy - 6, 2, 6, '#5d3a20'); R(c, sx - 5, sy - 9, 10, 4, '#8a6a48'); }, use: { label: () => S.flags.ny === 1 && S.flags.nyCount !== 'done' ? 'Считать моевок на уступе' : 'Смотреть на северный уступ', run: () => { if (S.flags.ny === 1 && S.flags.nyCount !== 'done') return openCount(); say([[HERO, 'Внизу северный уступ, весь белый от моевок. Кричат: «киттивейк! киттивейк!»']]); } } });
  addObj('cliffs', { x: 25.4 * T, y: 8.6 * T, kind: 'bench', bench: 'cliffs', solid: [-9, -4, 18, 4], draw: drawBench });
  { const b = cm.objs[cm.objs.length - 1]; b.use = { label: () => 'Посидеть на скамейке', run: () => sitDown(b) }; }
  BENCH_THOUGHTS.cliffs = ['Отсюда видно маяк — крошечный, как свечка. И вокруг только море.', 'Ветер тут такой, что шапку держишь рукой. Птицы кружат прямо над головой.'];
  addObj('cliffs', { x: 15.2 * T, y: 7.4 * T, kind: 'cairn', solid: [-5, -3, 10, 3], draw(c, sx, sy) { drawCairn(c, sx, sy, G.sh); } });
  [[17.6, 9.8, 0], [23.2, 6.6, 1], [21.4, 10.4, 2]].forEach(([x, y, s]) => addObj('cliffs', { x: x * T, y: y * T, kind: 'burrow', layer: -1, draw(c, sx, sy) { ell(c, sx, sy - 2, 4, 2, '#2a2e22'); if (Math.sin(G.time * .5 + s * 2) > -.3) drawPuffin(c, sx + 1, sy - 2, G.time, s); } }));
  addObj('cliffs', { get x() { return G.cam.x + VW / 2; }, get y() { return G.cam.y + VH + 60; }, kind: 'flyers', draw(c) { const cx = 20 * T - G.cam.x, cy = 14 * T - G.cam.y; for (let i = 0; i < 22; i++) { const a = G.time * (.35 + (i % 4) * .07) + i * 1.7, rr = 80 + (i % 5) * 34, bx = cx + Math.cos(a) * rr, by = cy + Math.sin(a * 1.2) * rr * .6 - 30, sp = BIRDS[i % 3 ? 'kittiwake' : 'fulmar']; drawGrid(c, bx, by + 4, sp.fly[Math.sin(G.time * 9 + i) > 0 ? 0 : 1], sp.pal, Math.sin(a) < 0); } } });
}
function drawWreck(c, x, y) {
  shadowE(c, x, y, 26, 4, G.sh);
  R(c, x - 26, y - 10, 52, 9, '#4a3a2c'); R(c, x - 26, y - 10, 52, 2, '#6b5640'); R(c, x - 30, y - 8, 4, 6, '#4a3a2c'); R(c, x + 26, y - 13, 6, 10, '#4a3a2c');
  for (let i = -20; i <= 18; i += 6) { R(c, x + i, y - 18, 2, 9, '#3a2c20'); R(c, x + i, y - 19, 3, 1, '#5a4836'); }
  R(c, x - 4, y - 30, 3, 21, '#3a2c20'); R(c, x - 5, y - 31, 9, 2, '#3a2c20');
  R(c, x - 22, y - 4, 10, 2, '#3d6b3a'); R(c, x + 8, y - 3, 12, 2, '#2f5a32');
  R(c, x - 12, y - 7, 6, 1, '#d9cdb4'); R(c, x - 11, y - 6, 4, 1, '#d9cdb4');
}
function drawTent(c, x, y) {
  shadowE(c, x, y, 16, 3, G.sh);
  for (let r = 0; r < 14; r++) { const w = Math.round(2 + r * 1.1); R(c, x - w, y - 14 + r, w * 2, 1, r % 4 === 0 ? '#c8682a' : '#e07a32'); }
  R(c, x - 3, y - 9, 6, 9, nyuraHere() ? '#3a2018' : '#ffd477'); R(c, x - 1, y - 16, 2, 3, '#5d3a20');
  R(c, x - 17, y - 1, 2, 2, '#5d3a20'); R(c, x + 15, y - 1, 2, 2, '#5d3a20');
}
function drawCampfire(c, x, y) {
  [[-5, -2], [-2, -1], [2, -1], [5, -2], [-3, 1], [3, 1]].forEach(([dx, dy]) => R(c, x + dx - 1, y + dy - 2, 3, 2, '#7d828c'));
  R(c, x - 4, y - 3, 8, 2, '#5d3a20'); const f = Math.sin(G.time * 11) * Math.sin(G.time * 4.7);
  R(c, x - 2, y - 7 - Math.round(f), 4, 5, '#f07a2a'); R(c, x - 1, y - 9 - Math.round(f), 2, 4, '#ffd23a'); R(c, x, y - 10 - Math.round(f), 1, 1, '#fff6c0');
  R(c, x - 7, y - 16, 1, 14, '#3a3e48'); R(c, x + 6, y - 16, 1, 14, '#3a3e48'); R(c, x - 7, y - 16, 14, 1, '#3a3e48'); R(c, x - 3, y - 14, 6, 5, '#3a3e48'); R(c, x - 2, y - 15, 4, 1, '#5a5f68');
  if (Math.random() < .08) G.parts.push({ x: x + G.cam.x, y: y - 14 + G.cam.y, vx: 3, vy: -10, life: 1.6, col: 'rgba(225,225,225,.35)', s: 2, smoke: 1 });
}
function pupRun() {
  const f = S.flags;
  if (!f.pupFree) {
    if (!has('knife')) return say([[HERO, 'Тюленёнок запутался в обрывке рыбацкой сети. Пищит и бьётся.'], [HERO, 'Руками не распутать. Нужен нож — кажется, в сарае на стене висел складной.']], () => UI.tasks());
    return startAct('fix', 2.2, () => { f.pupFree = 1; f.pupFriend = 1; unlock('pup'); hearts(7.6 * T, 17.4 * T); UI.tasks(); say([[HERO, 'Аккуратно, по одной ячейке... Всё. Свободен.'], [HERO, 'Тюленёнок перекатился, фыркнул и посмотрел на меня огромными чёрными глазами. Кажется, мы теперь друзья.']]); });
  }
  if (has('fish') && f.pupDay !== S.day) { take('fish'); f.pupDay = S.day; hearts(7.6 * T, 17.4 * T); return toast('Тюленёнок проглотил рыбу целиком и довольно фыркнул'); }
  hearts(7.6 * T, 17.4 * T); toast('Тюленёнок жмурится и подставляет нос');
}
function spawnIslets() {
  for (const id of ['seals', 'cliffs']) MAPS[id].objs = MAPS[id].objs.filter(o => !o.daily);
  const rnd = rng(S.day * 777 + 3), sm = MAPS.seals;
  const sand = []; for (let y = 0; y < sm.h; y++) for (let x = 0; x < sm.w; x++) if (tAt(sm, x, y) === SAND && !sm.tide.includes(y * sm.w + x) && [[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => isWater(tAt(sm, x + dx, y + dy)))) sand.push([x * T + 8, y * T + 9]);
  sand.sort(() => rnd() - .5).slice(0, 5).forEach(([x, y], i) => { const o = addObj('seals', { daily: 1, x, y, kind: 'shell', r: 12, gone: false, on: () => !o.gone, draw(c, sx, sy) { drawFind(c, 'shell', sx, sy, false); } }); o.use = { label: () => 'Поднять ракушку', run: () => startAct('pick', .4, () => { o.gone = true; give('shell'); }) }; });
  const spots = [[17.2, 12.6], [20.4, 11.6], [27.2, 13.6], [30.4, 12.4], [9.4, 14.2]].sort(() => rnd() - .5).slice(0, 4);
  spots.forEach(([x, y]) => {
    const o = addObj('seals', { daily: 1, x: x * T, y: y * T, kind: 'stone', r: 14, flipped: false, found: null, ft: 0, solid: null, draw(c, sx, sy) {
      if (!o.flipped) { drawBoulder(c, sx, sy, Math.round(o.x + o.y), 'flat', false, G.sh); return; }
      R(c, sx + 5, sy - 4, 9, 4, '#6c717a'); R(c, sx - 6, sy - 4, 12, 4, '#5a4a3a');
      if (o.found && G.time - o.ft < 6) { const t = G.time; if (o.found === 'crab') drawCrab(c, sx, sy - 1, t); else if (o.found === 'starfish') drawStarfish(c, sx, sy - 2, t); else if (o.found === 'hermit') { R(c, sx - 2 + Math.round(Math.sin(t) * 2), sy - 5, 5, 4, '#f3d2c0'); R(c, sx + 3 + Math.round(Math.sin(t) * 2), sy - 3, 2, 2, '#d9473a'); } else { disc(c, sx, sy - 3, 3, '#5a2a5a'); for (let i = 0; i < 8; i++) R(c, sx + Math.round(Math.cos(i) * 4), sy - 3 + Math.round(Math.sin(i) * 4), 1, 1, '#7a3a7a'); } }
    } });
    o.use = { label: () => o.flipped ? null : 'Перевернуть камень', run: () => startAct('pick', .7, () => { o.flipped = true; o.ft = G.time; const pool = ['crab', 'crab', 'starfish', 'hermit', 'hermit', 'urchin']; const missing = pool.filter(k => !atlasHas('sea', k)); const src = missing.length && rnd() < .7 ? missing : pool; o.found = src[Math.floor(rnd() * src.length)] || 'crab'; const it = ATLAS.sea.items.find(z => z.id === o.found); if (!atlasAdd('sea', o.found)) toast('Под камнем: ' + it.n.toLowerCase(), 'sea_' + o.found); }) };
  });
  const cm = MAPS.cliffs, gr = []; for (let y = 0; y < cm.h; y++) for (let x = 0; x < cm.w; x++) if (tAt(cm, x, y) === GRASS) gr.push([x * T + 8, y * T + 10]);
  gr.sort(() => rnd() - .5).slice(0, 3).forEach(([x, y]) => { const o = addObj('cliffs', { daily: 1, x, y, kind: 'feather', r: 12, gone: false, on: () => !o.gone, draw(c, sx, sy) { drawFeatherFind(c, 'rarefeather', sx, sy); } }); o.use = { label: () => 'Поднять перо моевки', run: () => startAct('pick', .4, () => { o.gone = true; give('rarefeather'); }) }; });
}
function buildBoatHooks() {
  for (const o of WORLD.trees) { if (!o.pine) continue; o.r = 16; o.use = { label: () => needResin() && o.resinDay !== S.day ? 'Собрать живицу' : null, run: () => startAct('pick', .9, () => { o.resinDay = S.day; give('resin'); }) }; }
  const nets = MAPS.shed.objs.find(o => o.kind === 'nets'); if (nets) { nets.r = 16; nets.iy = 3.4 * T; nets.use = { label: () => !S.flags.netsTaken && !has('sail') && boatStage() < 5 ? 'Снять старые сети' : null, run: () => startAct('pick', .7, () => { S.flags.netsTaken = 1; give('nets'); }) }; }
  const tools = MAPS.shed.objs.find(o => o.kind === 'tools'); if (tools) { const base = tools.use; tools.use = { label: () => !has('wrench') ? 'Взять гаечный ключ' : !has('knife') ? 'Взять складной нож' : base.label(), run: () => { if (!has('wrench')) return startAct('pick', .7, () => give('wrench')); if (!has('knife')) return startAct('pick', .6, () => give('knife')); base.run(); } }; }
  const beach = MAPS.island.objs.find(o => o.kind === 'boat');
  if (beach) { beach.on = () => boatStage() < 4; beach.draw = (c, sx, sy) => drawNadezhda(c, sx, sy, boatStage(), false, G.time, G.sh); beach.use = { label: () => ['Осмотреть «Надежду»', 'Просмолить «Надежду»', 'Положить вёсла в «Надежду»', 'Спустить «Надежду» на воду'][boatStage()] || null, run: boatBeachUse }; }
  addObj('island', { x: WORLD.lh.x - 20, y: WORLD.lh.y + 1, kind: 'vane', on: () => (S.stats.crafted || []).includes('vane'), draw(c, sx, sy) { const yy = sy - 46, a = Math.sin(G.time * .7) * G.wind; R(c, sx, yy, 1, 12, '#3a3e48'); const d = Math.cos(a) > 0 ? 1 : -1; R(c, sx - 5 * d, yy - 1, 11, 1, '#3a3e48'); R(c, sx + 4 * d - (d < 0 ? 3 : 0), yy - 3, 4, 3, '#ffffff'); R(c, sx + 7 * d, yy - 3, 1, 3, '#1e2128'); } });
  addObj('house', { x: 7.4 * T, y: 10.9 * T, kind: 'tides', r: 16, iy: 10.4 * T, layer: -1, draw(c, sx, sy) { }, use: { label: () => 'Таблица приливов у двери', run: () => say([['Таблица приливов', 'Тюлений камень. Отлив — с 7:00 до 10:00 и с 15:00 до 18:00. В отлив со скал к старой шхуне открывается песчаная коса.', 'letter']]) } });
}
function islandTick(dt) {
  if (G.mode !== 'play') return;
  const near = (x, y, r) => Math.hypot(P.x - x, P.y - y) < r, bin = has('binoculars') ? 1.8 : 1;
  if (MAP.id === 'seals') {
    tideApply(false);
    if (!S.flags.pupSeen && near(7.6 * T, 17.4 * T, 90)) { S.flags.pupSeen = 1; UI.tasks(); toast('Тюленёнок запутался в сети!'); }
    for (const o of MAP.objs) {
      if (o.kind !== 'seal') continue;
      if (o.water > 0) { o.water -= dt; continue; }
      const d = Math.hypot(P.x - o.x, P.y - o.y);
      if (P.run && P.moving && d < 80) { o.water = 7 + Math.random() * 5; for (let i = 0; i < 8; i++) G.parts.push({ x: o.wx + (Math.random() - .5) * 12, y: o.wy, vx: (Math.random() - .5) * 30, vy: -30 - Math.random() * 20, life: .5, col: '#e3f4f3', s: 1 }); if (!G.trig.sealRun) { G.trig.sealRun = 1; toast('Тюлени испугались и плюхнулись в воду. Тише!'); } }
      else if (d < 70) atlasAdd('sea', 'seal');
    }
  }
  if (MAP.id === 'cliffs') {
    for (const o of MAP.objs) if (o.kind === 'cbird' && near(o.x, o.y, 64 * bin)) atlasAdd('birds', o.species);
    for (const o of MAP.objs) if (o.kind === 'burrow' && near(o.x, o.y, 60 * bin)) atlasAdd('birds', 'puffin');
    if (AU.ac && Math.random() < dt * 1.2) AU.gull();
  }
}
function drawStarfish(c, x, y, t) { x = Math.round(x); y = Math.round(y); const r = Math.round(Math.sin(t * .5) * .5); R(c, x - 1, y - 4, 2, 8, '#f07a2a'); R(c, x - 4, y - 1 + r, 8, 2, '#f07a2a'); R(c, x - 3, y + 2, 2, 2, '#f07a2a'); R(c, x + 1, y + 2, 2, 2, '#f07a2a'); R(c, x - 1, y - 1, 2, 2, '#ffb36b'); }
function drawCrab(c, x, y, t) { x = Math.round(x + Math.sin(t * .7) * 3); y = Math.round(y); const cl = Math.sin(t * 6) > 0 ? -1 : 0; R(c, x - 3, y - 2, 6, 3, '#d9473a'); R(c, x - 5, y - 4 + cl, 2, 2, '#d9473a'); R(c, x + 3, y - 4 + cl, 2, 2, '#d9473a'); R(c, x - 2, y - 3, 1, 1, '#1c2638'); R(c, x + 1, y - 3, 1, 1, '#1c2638'); R(c, x - 4, y + 1, 1, 1, '#b8382e'); R(c, x + 3, y + 1, 1, 1, '#b8382e'); }
function drawCliffBird(c, x, y, kind, t, s) {
  x = Math.round(x); y = Math.round(y); const b = Math.sin(t * 3 + s * 7) > .9 ? -1 : 0;
  if (kind === 'guillemot') { R(c, x - 2, y - 8 + b, 4, 8, '#3a2e28'); R(c, x - 1, y - 6 + b, 2, 6, '#f8fbff'); R(c, x - 2, y - 10 + b, 4, 3, '#3a2e28'); R(c, x + 2, y - 9 + b, 2, 1, '#1e2128'); return; }
  if (kind === 'kittiwake') { R(c, x - 3, y - 5 + b, 6, 3, '#ffffff'); R(c, x - 3, y - 5 + b, 5, 1, '#b8c2cc'); R(c, x - 4, y - 4 + b, 1, 1, '#1e2128'); R(c, x + 2, y - 7 + b, 2, 2, '#ffffff'); R(c, x + 4, y - 6 + b, 1, 1, '#e8d84a'); return; }
  R(c, x - 3, y - 5 + b, 6, 3, '#e8ecef'); R(c, x - 3, y - 5 + b, 6, 1, '#9aa6b0'); R(c, x + 2, y - 7 + b, 3, 2, '#f4f6f8'); R(c, x + 5, y - 6 + b, 1, 1, '#c9b48a');
}
