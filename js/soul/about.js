"use strict";
// ===== "Об игре" and feedback, opened from the title screen (and from the help tab) =====
const FEEDBACK_URL = 'https://t.me/llinajoo';
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
      const fb = hand('button', 'btn', 'Нашли ошибку? Сообщите!'); fb.type = 'button'; fb.onclick = () => openInfo('feedback');
      p.appendChild(fb);
    } else {
      p.append(hand('h2', 'info-t', 'Нашли ошибку?'), hand('p', '', 'Сообщите! Или просто напишите, как вам игра. Я читаю всё.'));
      const a = hand('a', 'btn primary info-link', 'Написать в Telegram: @llinajoo'); a.href = FEEDBACK_URL; a.target = '_blank'; a.rel = 'noopener';
      p.appendChild(a);
    }
    body.appendChild(p);
  };
}
// buttons on the title screen
{
  const row = document.querySelector('#title .row');
  const ab = hand('button', 'btn', 'Об игре'); ab.type = 'button'; ab.id = 'bAbout'; ab.onclick = () => openInfo('about');
  const fb = hand('button', 'btn', 'Нашли ошибку?'); fb.type = 'button'; fb.id = 'bFeedback'; fb.onclick = () => openInfo('feedback');
  const r2 = hand('div', 'row small'); r2.append(ab, fb); row.after(r2);
}
