"use strict";
// ===== Saving during the day: after every finished task, so closing the tab doesn't lose the day =====
// daily spawns use a per-game seed, so on reload the same shells/herbs/stones are in the same places and we can restore which were taken
{
  const _setupDay = setupDay;
  setupDay = function () {
    if (!S.flags.seed) S.flags.seed = 1 + Math.floor(Math.random() * 1e6);
    const mr = Math.random; Math.random = rng(S.flags.seed * 13 + S.day * 977);
    try { _setupDay(); } finally { Math.random = mr; }
  };
}
function dailyStates() {
  const out = {}; for (const k in MAPS) out[k] = MAPS[k].objs.filter(o => o.daily).map(o => [o.gone ? 1 : 0, o.picked ? 1 : 0, o.flipped ? 1 : 0, o.found || 0]);
  return out;
}
function saveMid() {
  if (G.mode !== 'play' || G.ending) return;
  try {
    localStorage.setItem('lighthouse-save-v1', JSON.stringify({
      day: S.day, inv: S.inv, souv: S.souv, journal: S.journal, read: S.read, flags: S.flags, done: S.done, total: S.total, q: S.q, stats: S.stats, atlas: S.atlas,
      mid: { min: S.min, tasks: S.tasks, lampLit: S.lampLit, power: S.power, weather: S.weather, map: MAP.id, x: P.x, y: P.y, carry: P.carry || null, trig: G.trig, objs: dailyStates() },
    }));
  } catch (e) { }
}
{
  const _progress = progress;
  progress = function (id, n) { const t = task(id), was = t && t.done; _progress(id, n); if (t && t.done && !was) setTimeout(saveMid, 50); };
  const _startPlay = startPlay;
  startPlay = function (saved) {
    if (!saved || !saved.mid) return _startPlay(saved);
    const m = saved.mid;
    AU.init(); AU.setMode('morning'); $('#title').hidden = true; G.busy = 1; $('#fade').classList.add('on');
    setTimeout(() => {
      G.mode = 'play'; newGame(saved);
      Object.assign(S, { total: saved.total, min: m.min, tasks: m.tasks, lampLit: m.lampLit, power: m.power, weather: m.weather });
      G.trig = m.trig || {};
      for (const k in m.objs || {}) { const list = MAPS[k] ? MAPS[k].objs.filter(o => o.daily) : []; m.objs[k].forEach((st, i) => { const o = list[i]; if (!o) return; if (st[0]) o.gone = true; if (st[1]) o.picked = true; if (st[2]) o.flipped = true; if (st[3]) o.found = st[3]; }); }
      MAP = MAPS[m.map] || MAPS.island; P.x = m.x; P.y = m.y; P.dir = 0; P.carry = m.carry; P.fish = null; P.act = null; P.sit = null; snapCam();
      $('#hud').hidden = false; if (isTouch) { $('#touch').hidden = false; document.body.classList.add('touch'); }
      UI.hud(); UI.tasks(); G.busy = 0; $('#fade').classList.remove('on');
      toast(`День ${S.day}, ${String(Math.floor(S.min / 60)).padStart(2, '0')}:${String(Math.floor(S.min % 60)).padStart(2, '0')}. Продолжаем`);
    }, 500);
  };
}

// ===== Achievements live across playthroughs; before the second one, ask whether to keep them =====
{
  const _startEnding = startEnding;
  startEnding = function () { try { localStorage.setItem('lighthouse-finished-v1', '1'); } catch (e) { } return _startEnding(); };
  $('#bStart').onclick = () => {
    let finished = false; try { finished = localStorage.getItem('lighthouse-finished-v1') === '1'; } catch (e) { }
    if (!finished || !ACHV.length) return startPlay(null);
    MENU.show(`Новая смена. У вас уже есть достижения: ${ACHV.length} из ${ACH.length}. Оставить их?`, [
      { label: 'Оставить достижения', sub: 'новые будут добавляться к ним', run: () => startPlay(null) },
      { label: 'Начать с чистого листа', sub: 'все достижения сбросятся', run: () => { ACHV.length = 0; try { localStorage.removeItem('lighthouse-ach-v1'); } catch (e) { } startPlay(null); } },
    ], 'Назад');
  };
}
