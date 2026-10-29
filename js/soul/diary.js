"use strict";
// ===== Evening diary =====
// ---------- the evening diary ----------
const WX_DOODLE = { sunny: 'sun', windy: 'wind', rain: 'rain', storm: 'storm', clear: 'sun', fog: 'fog', cloudy: 'cloud', sunset: 'sunset' };
function drawDiaryDoodle(x, w, h, d) {
  const wx = WX_DOODLE[(DAYS[d] || {}).w] || 'sun', ink = '#3b4a6b';
  x.imageSmoothingEnabled = true; x.clearRect(0, 0, w, h);
  const line = (pts, col, wd, s) => crayon(x, pts, col || ink, wd || 1.4, s || 1);
  for (let i = 0; i < 3; i++) line(Array.from({ length: 14 }, (_, k) => [k * 9, h - 10 + i * 3 + Math.sin(k + i) * 1.5]), ink, 1.1, 5 + i);
  line([[30, h - 10], [33, 18], [41, 18], [44, h - 10]], ink, 1.6, 9); line([[33, 18], [37, 11], [41, 18]], ink, 1.6, 10); line([[34, 30], [40, 30]], '#c8443a', 2, 11); line([[34, 42], [41, 42]], '#c8443a', 2, 12);
  if (wx === 'sun' || wx === 'sunset') { const sy = wx === 'sunset' ? h - 16 : 16, col = wx === 'sunset' ? '#e07a3a' : '#e8b23a'; x.strokeStyle = col; x.lineWidth = 1.5; x.beginPath(); x.arc(w - 22, sy, 6, 0, 7); x.stroke(); for (let i = 0; i < 8; i++) line([[w - 22 + Math.cos(i * .8) * 9, sy + Math.sin(i * .8) * 9], [w - 22 + Math.cos(i * .8) * 12, sy + Math.sin(i * .8) * 12]], col, 1.1, 90 + i); }
  if (wx === 'wind') for (let i = 0; i < 3; i++) line([[60, 14 + i * 7], [80, 12 + i * 7], [92, 16 + i * 7]], ink, 1.2, 20 + i);
  if (wx === 'rain' || wx === 'storm') { line([[60, 16], [70, 8], [86, 10], [96, 16], [60, 16]], ink, 1.3, 30); for (let i = 0; i < 6; i++) line([[62 + i * 6, 20], [60 + i * 6, 28]], ink, 1, 31 + i); if (wx === 'storm') line([[84, 18], [80, 26], [86, 26], [80, 36]], '#e8b23a', 1.8, 40); }
  if (wx === 'fog') for (let i = 0; i < 4; i++) line([[8, 14 + i * 6], [w - 8, 14 + i * 6]], 'rgba(59,74,107,.4)', 2, 50 + i);
  if (wx === 'cloud') line([[60, 18], [66, 10], [78, 10], [84, 6], [96, 12], [100, 18], [60, 18]], ink, 1.3, 60);
  if (d === 6) line([[70, h - 16], [110, h - 16], [104, h - 10], [76, h - 10], [70, h - 16]], ink, 1.4, 70);
  if (catKept() && (S.flags.catDay || 9) <= d) { line([[96, h - 12], [96, h - 20], [104, h - 20], [104, h - 12]], '#e58a3a', 1.8, 80); line([[96, h - 20], [97, h - 24], [99, h - 20]], '#e58a3a', 1.6, 81); line([[101, h - 20], [103, h - 24], [104, h - 20]], '#e58a3a', 1.6, 82); line([[104, h - 14], [110, h - 22]], '#e58a3a', 1.6, 83); }
}
function diaryEntry(d) { return S.journal.find(j => j.d === d); }
function renderDiary(body) {
  const pages = S.journal.map(j => j.d); if (!pages.length) { body.appendChild(hand('p', 'doccap', 'Дневник пока пуст.')); return; }
  if (DOC.page == null || !pages.includes(DOC.page)) DOC.page = pages[pages.length - 1];
  const j = diaryEntry(DOC.page), p = hand('div', 'paper diary');
  const head = hand('div', 'dh'); head.append(hand('span', '', 'День ' + j.d), hand('span', '', (WX_NAME[(DAYS[j.d] || {}).w] || '')));
  p.appendChild(head);
  const main = hand('p', 'hw', DOC.writing ? '' : j.t); p.appendChild(main);
  const ul = document.createElement('ul'); (j.m || []).slice(0, 5).forEach(t => { const li = hand('li', '', t); if (DOC.writing) li.style.opacity = 0; ul.appendChild(li); }); if ((j.m || []).length) p.appendChild(ul);
  const [c, x] = mk(120, 60); c.className = 'doodle'; drawDiaryDoodle(x, 120, 60, j.d); p.appendChild(c);
  body.appendChild(p);
  if (DOC.writing) {
    const full = j.t; let i = 0; const lis = [...ul.children]; c.style.opacity = 0;
    const step = () => { if (DOC.id !== 'diary' || !DOC.writing) return; i += 2; main.textContent = full.slice(0, i); if (i < full.length) return setTimeout(step, 28); let k = 0; const show = () => { if (k < lis.length) { lis[k++].style.transition = 'opacity .6s'; lis[k - 1].style.opacity = 1; setTimeout(show, 450); } else { c.style.transition = 'opacity .8s'; c.style.opacity = 1; DOC.writing = false; } }; show(); };
    setTimeout(step, 350);
  } else if (pages.length > 1) {
    const pg = hand('div', 'pager'), i = pages.indexOf(DOC.page);
    const prev = hand('button', 'btn', '← раньше'), next = hand('button', 'btn', 'дальше →'); prev.type = next.type = 'button';
    prev.disabled = i <= 0; next.disabled = i >= pages.length - 1;
    prev.onclick = () => { DOC.page = pages[i - 1]; renderDoc(); }; next.onclick = () => { DOC.page = pages[i + 1]; renderDoc(); };
    pg.append(prev, hand('span', '', (i + 1) + ' / ' + pages.length), next); body.appendChild(pg);
  }
}
function openDiary(page, writing) {
  const after = DOC.afterDiary || null; DOC.afterDiary = null;
  openDoc('diary', after); DOC.page = page; DOC.writing = !!writing; renderDoc();
}
ACH.push(['morse', 'На связи', 'Ответить кораблю сигнальным фонарём'], ['aurora', 'Северное сияние', 'Увидеть сияние над морем'], ['sunset', 'Закатный час', 'Встретить закат на скамейке'], ['letters', 'Письма домой', 'Ответить на два письма из дома']);
