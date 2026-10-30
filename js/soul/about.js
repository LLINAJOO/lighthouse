"use strict";
// ===== "Об игре" and feedback, opened from the title screen (and from the help tab) =====
const FEEDBACK_URL = 'https://github.com/LLINAJOO/lighthouse.github.io/issues/new';
function openInfo(kind) { DOC_ON = true; DOC.id = kind; DOC.after = null; DOC.flipped = false; DOC.page = 0; renderDoc(); $('#doc').hidden = false; }
{
  const _rdInfo = renderDoc;
  renderDoc = function () {
    if (DOC.id !== 'about' && DOC.id !== 'feedback') return _rdInfo();
    const body = $('#docBody'); body.innerHTML = ''; $('#docFlip').hidden = true;
    const p = hand('div', 'paper info');
    if (DOC.id === 'about') {
      p.append(hand('h2', 'info-t', 'Light House'), hand('p', 'info-sub', 'Семь дней на маяке'));
      [
        'Последняя смена смотрителя маяка. Через неделю за ним придёт катер, а пока на острове есть дела: почистить линзу, смазать механизм, наколоть дров, зажечь огонь в пять вечера и записать прожитый день в журнал.',
        'Это тихая игра про заботу: о маяке, о людях, которые приплывают на остров, о птицах и тюленях, о рыжем коте и о семье, которая ждёт на берегу. Здесь нельзя проиграть и некуда спешить.',
        'Полная неделя занимает примерно два часа. Игра сама сохраняется после каждого сделанного дела, так что её можно закрыть и вернуться.',
      ].forEach(t => p.appendChild(hand('p', '', t)));
      p.appendChild(hand('div', 'info-h', 'Управление'));
      p.appendChild(hand('p', '', 'На компьютере: WASD или стрелки — идти, Shift — бегом, E или пробел — действие. I — сумка, J — дневник, M — карта, K — атлас. На телефоне: джойстик слева и кнопка A справа.'));
      p.appendChild(hand('div', 'info-h', 'Благодарности'));
      [
        'Шрифт Monocraft — автор IdreesInc, свободная лицензия SIL Open Font License 1.1.',
        'Музыка и звуки синтезируются прямо в браузере, в игре нет записанных файлов.',
        'Игра сделана вместе с Claude (Anthropic): код, пиксельные рисунки и тексты.',
      ].forEach(t => p.appendChild(hand('p', 'info-small', t)));
      const fb = hand('button', 'btn', 'Написать отзыв'); fb.type = 'button'; fb.onclick = () => openInfo('feedback');
      p.appendChild(fb);
    } else {
      p.append(hand('h2', 'info-t', 'Отзыв'), hand('p', '', 'Нашли ошибку, где-то застряли или просто хотите сказать пару слов? Напишите — это очень поможет сделать игру лучше.'));
      const ta = hand('textarea', 'info-ta'); ta.rows = 6; ta.placeholder = 'Что понравилось, что было непонятно, где что-то сломалось…'; ta.maxLength = 3000;
      const where = G.mode === 'play' ? `День ${S.day}, ${String(Math.floor(S.min / 60)).padStart(2, '0')}:${String(Math.floor(S.min % 60)).padStart(2, '0')}, ${MAP ? MAP.id : ''}` : 'с главного экрана';
      const note = hand('p', 'info-small', `К отзыву добавится, где вы сейчас в игре (${where}) и какое у вас устройство. Отправка откроет страницу GitHub — там нужен аккаунт.`);
      const row = hand('div', 'row'); const send = hand('button', 'btn primary', 'Отправить'), copy = hand('button', 'btn', 'Скопировать текст'); send.type = copy.type = 'button';
      const text = () => `${ta.value.trim()}\n\n---\nГде: ${where}\nУстройство: ${navigator.userAgent}`;
      send.onclick = () => { if (!ta.value.trim()) { ta.focus(); return; } window.open(FEEDBACK_URL + '?title=' + encodeURIComponent('Отзыв: ' + ta.value.trim().slice(0, 50)) + '&body=' + encodeURIComponent(text()), '_blank', 'noopener'); };
      copy.onclick = () => { try { navigator.clipboard.writeText(text()); copy.textContent = 'Скопировано'; } catch (e) { ta.select(); } };
      row.append(send, copy); p.append(ta, note, row);
      setTimeout(() => ta.focus(), 50);
    }
    body.appendChild(p);
  };
}
// buttons on the title screen
{
  const row = document.querySelector('#title .row');
  const ab = hand('button', 'btn', 'Об игре'); ab.type = 'button'; ab.id = 'bAbout'; ab.onclick = () => openInfo('about');
  const fb = hand('button', 'btn', 'Отзыв'); fb.type = 'button'; fb.id = 'bFeedback'; fb.onclick = () => openInfo('feedback');
  const r2 = hand('div', 'row small'); r2.append(ab, fb); row.after(r2);
}
