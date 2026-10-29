"use strict";
// ===== Letters from home =====
// ---------- letters from home that answer what you write ----------
const TOPICS = {
  matvey: { l: 'Про рыбака Матвея', ok: () => S.flags.metMatvey, w: 3 },
  cat: { l: () => 'Про кота ' + catName(), ok: () => catKept(), w: 5 },
  fish: { l: 'Про рыбалку', ok: () => (S.stats.fish | 0) > 0, w: 2 },
  storm: { l: 'Про шторм', ok: () => S.day >= 4, w: 4 },
  sonya: { l: 'Про Соню-художницу', ok: () => S.flags.metSonya, w: 3 },
  bottle: { l: 'Про записку в бутылке', ok: () => S.flags.crateOpened, w: 4 },
  boat: { l: 'Про старую лодку «Надежду»', ok: () => (S.flags.boat | 0) >= 1, w: 3 },
  seals: { l: 'Про тюленей', ok: () => S.flags.m_seals, w: 5 },
  birds: { l: 'Про чаек и крачек', ok: () => true, w: 1 },
  light: { l: 'Про маяк и огонь', ok: () => true, w: 1 },
};
const topicLabel = k => typeof TOPICS[k].l === 'function' ? TOPICS[k].l() : TOPICS[k].l;
const REACT = {
  matvey: 'Мама сказала, что рыбак Матвей похож на дедушку Колю. Передай ему от нас привет и пирожок. Пирожок не дойдёт, поэтому просто привет.',
  cat: () => catName() + '! Самое лучшее имя. Мама сначала сказала «ещё чего не хватало», а потом спросила, любит ли он молоко. Это значит «да»!',
  fish: 'Рыбалка! Я тоже хочу. Научишь меня? Только червяков насаживать будешь ты.',
  storm: 'Мама прочитала про шторм и перечитала два раза. Потом сказала, что ты молодец, и ушла на кухню. Я видела, она немножко плакала, но по-хорошему.',
  sonya: 'Передай Соне, что я тоже рисую. Может, мы будем друг другу писать? У меня есть марки с жирафом.',
  bottle: 'Записка в бутылке — как в книжке про пиратов! Её надо хранить всю жизнь. Я бы спала с ней под подушкой.',
  boat: 'Лодка «Надежда» — красивое имя. Жалко, что её нельзя привезти домой. Можно я буду её так называть, когда буду про неё думать?',
  seals: 'ТЮЛЕНИ!!! Ты видел живых тюленей! Я всем в классе рассказала, мне никто не поверил, и я обиделась.',
  birds: 'Про чаек я рассказала на уроке. Учительница сказала, что крачки летают через весь мир. Через ВЕСЬ!',
  light: 'Я нарисовала, как луч бежит по воде. Получилась жёлтая дорожка. По ней можно дойти до тебя.',
};
const reactText = k => typeof REACT[k] === 'function' ? REACT[k]() : REACT[k];
function letterBody(n) {
  const f = S.flags;
  if (n === 1) return { lines: ['Папа, привет!', 'У нас всё хорошо. Я зачёркиваю дни на календаре красным, осталось шесть клеточек.', 'Мама говорит, что на острове ты совсем один. Тебе не скучно? Кто с тобой разговаривает, чайки?', 'Напиши, что у тебя там интересного. Только честно и подробно!'], sig: 'Варя', ps: 'Ешь горячее и не сиди до утра у своего огня. Целую. Н.', pic: 'light' };
  if (n === 2) {
    const r = f.reply1 || ['light'];
    const lines = ['Папа, привет! Твоё письмо пришло!'].concat(r.map(reactText), ['А я научилась свистеть. Мама говорит, громче чайки. Привези мне ракушку!']);
    const ps = catKept() && !r.includes('cat') ? 'P.S. Варя спрашивает: а звери у тебя там есть? Хоть один? Н.' : 'P.S. И маму поцелуй, она скучает больше всех, только не признаётся. В.';
    return { lines, sig: 'Варя', ps, pic: r[0] };
  }
  const r = f.reply2 || f.reply1 || ['light'];
  const lines = ['Папа!'].concat(r.map(reactText));
  if (catKept() && !r.includes('cat')) lines.push('Мама уже купила миску для ' + catName() + '. Синюю. Он ведь приедет с тобой?');
  lines.push('Мы с мамой придём встречать тебя на пристань. Я буду в жёлтой куртке, чтобы ты сразу меня увидел.');
  return { lines, sig: 'Варя', ps: 'Возвращайся. Мы тебя очень ждём. Наташа.', pic: 'pier' };
}
function drawKidDoodle(x, w, h, kind) {
  x.imageSmoothingEnabled = true; x.clearRect(0, 0, w, h);
  const sea = () => { for (let i = 0; i < 4; i++) crayon(x, Array.from({ length: 16 }, (_, k) => [k * 10, h - 14 + i * 3 + Math.sin(k * 1.3 + i) * 2]), '#3b7ea0', 1.6, 70 + i); };
  const sun = () => { x.strokeStyle = '#f2a03a'; x.lineWidth = 2; x.beginPath(); x.arc(w - 18, 16, 8, 0, 7); x.stroke(); for (let i = 0; i < 8; i++) crayon(x, [[w - 18 + Math.cos(i) * 11, 16 + Math.sin(i) * 11], [w - 18 + Math.cos(i) * 15, 16 + Math.sin(i) * 15]], '#f2a03a', 1.4, 80 + i); };
  const label = (t, px, py, col) => { x.fillStyle = col || '#9b4d6a'; x.font = 'bold 13px Caveat, "Comic Sans MS", cursive'; x.fillText(t, px, py); };
  if (kind === 'cat') {
    sun(); crayon(x, [[40, h - 16], [40, 40], [70, 40], [70, h - 16]], '#e58a3a', 3, 1); crayon(x, [[42, 40], [45, 30], [50, 40]], '#e58a3a', 3, 2); crayon(x, [[60, 40], [65, 30], [68, 40]], '#e58a3a', 3, 3);
    x.fillStyle = '#2c2f38'; x.fillRect(48, 48, 3, 3); x.fillRect(60, 48, 3, 3); crayon(x, [[70, h - 20], [86, h - 34], [84, h - 48]], '#e58a3a', 3, 4); crayon(x, [[30, 54], [46, 56]], '#2c2f38', 1, 5); crayon(x, [[64, 56], [80, 54]], '#2c2f38', 1, 6);
    label(catName().toUpperCase(), 92, 40, '#c8553d'); x.fillStyle = '#c8303b'; x.fillText('♥', 100, 58);
  } else if (kind === 'seals') {
    sea(); for (let k = 0; k < 2; k++) { const bx = 34 + k * 46; crayon(x, [[bx, h - 18], [bx + 4, h - 34], [bx + 14, h - 40], [bx + 26, h - 30], [bx + 34, h - 18]], '#6b7480', 3, 10 + k); x.fillStyle = '#2c2f38'; x.fillRect(bx + 10, h - 36, 3, 3); }
    label('ТЮЛЕНИ!!!', 30, 22);
  } else if (kind === 'matvey') {
    sea(); sun(); crayon(x, [[30, h - 22], [80, h - 22], [72, h - 12], [38, h - 12], [30, h - 22]], '#8a5a32', 2.5, 20); crayon(x, [[55, h - 22], [55, h - 40]], '#2c2f38', 1.6, 21); x.strokeStyle = '#2c2f38'; x.beginPath(); x.arc(55, h - 44, 4, 0, 7); x.stroke(); crayon(x, [[50, h - 47], [60, h - 47], [55, h - 52], [50, h - 47]], '#e7b521', 2, 22); crayon(x, [[52, h - 40], [58, h - 40], [55, h - 34]], '#f2f2f2', 2, 23);
    label('МАТВЕЙ', 84, 30);
  } else if (kind === 'fish' || kind === 'birds') {
    sea(); sun();
    if (kind === 'fish') { crayon(x, [[40, 40], [60, 32], [80, 40], [60, 48], [40, 40]], '#d0473a', 2.5, 30); crayon(x, [[80, 40], [92, 32], [92, 48], [80, 40]], '#d0473a', 2.5, 31); x.fillStyle = '#2c2f38'; x.fillRect(50, 38, 3, 3); label('РЫБА', 96, 30); }
    else { for (let k = 0; k < 4; k++) { const bx = 26 + k * 24, by = 22 + (k % 2) * 10; crayon(x, [[bx, by], [bx + 6, by - 5], [bx + 10, by], [bx + 14, by - 5], [bx + 20, by]], '#2c2f38', 1.8, 40 + k); } label('ЧАЙКИ', 40, 58); }
  } else if (kind === 'pier') {
    sea(); crayon(x, [[10, h - 24], [70, h - 24]], '#8a5a32', 3, 50); for (let i = 0; i < 4; i++) crayon(x, [[16 + i * 16, h - 24], [16 + i * 16, h - 10]], '#8a5a32', 2, 51 + i);
    const fig = (px, col, big) => { x.strokeStyle = '#2c2f38'; x.lineWidth = 1.6; x.beginPath(); x.arc(px, h - 46 - (big ? 6 : 0), 4, 0, 7); x.stroke(); crayon(x, [[px - 5, h - 40 - (big ? 6 : 0)], [px + 5, h - 40 - (big ? 6 : 0)], [px + 6, h - 28], [px - 6, h - 28], [px - 5, h - 40 - (big ? 6 : 0)]], col, 2.4, px); crayon(x, [[px - 2, h - 28], [px - 3, h - 24]], '#2c2f38', 1.4, px + 1); crayon(x, [[px + 2, h - 28], [px + 3, h - 24]], '#2c2f38', 1.4, px + 2); };
    fig(28, '#9b4d6a', true); fig(44, '#f2c83a', false); crayon(x, [[46, h - 40], [56, h - 50]], '#2c2f38', 1.4, 60);
    crayon(x, [[110, h - 22], [140, h - 22], [134, h - 14], [114, h - 14], [110, h - 22]], '#2c2f38', 2, 61); label('МЫ ЖДЁМ!', 70, 24, '#c8303b');
  } else drawKidPicture(x, w, h);
}
function deliverLetter(n, who, intro, after) {
  const go = () => { if (!S.souv.includes('letter')) give('letter'); S.flags['let' + n] = 1; memo('let' + n, n === 1 ? 'Пришло первое письмо из дома. Варя спрашивает, не скучно ли мне.' : n === 2 ? 'Второе письмо от Вари. Она ответила на всё, что я написал!' : 'Последнее письмо: Варя будет встречать меня в жёлтой куртке.'); openDoc('let' + n, () => { if (n < 3) replyMenu(n, after); else if (after) after(); }); };
  if (who) say([[who, intro]], go); else go();
}
function replyMenu(n, after) {
  const avail = Object.keys(TOPICS).filter(k => TOPICS[k].ok()).sort((a, b) => TOPICS[b].w - TOPICS[a].w).slice(0, 4);
  const done = picks => { S.flags['reply' + n] = picks; memo('reply' + n, 'Написал домой ' + picks.map(k => topicLabel(k).replace('Про ', 'про ')).join(' и ') + '.'); say([[HERO, 'Запечатал конверт. ' + (n === 1 ? 'Матвей обещал завезти на почту.' : 'Лида заберёт его на материк.')]], after); };
  MENU.show('Что написать домой? Выберите первое.', avail.map(k => ({ label: topicLabel(k), run: () => {
    const rest = avail.filter(x => x !== k);
    setTimeout(() => MENU.show('А ещё?', rest.map(r => ({ label: topicLabel(r), run: () => done([k, r]) })).concat([{ label: 'Хватит, этого достаточно', run: () => done([k]) }])), 30);
  } })));
  MENU.locked = false;
}
function renderLetter(body, n) {
  const L = letterBody(n), p = hand('div', 'paper lined');
  L.lines.forEach((t, i) => p.appendChild(hand('p', 'hw', t)));
  p.append(hand('p', 'hw sig', L.sig), hand('p', 'hw ps', L.ps));
  const [c, x] = mk(150, 96); c.className = 'kid'; drawKidDoodle(x, 150, 96, L.pic); p.appendChild(c);
  body.appendChild(p);
}
const latestLetter = () => S.flags.let3 ? 'let3' : S.flags.let2 ? 'let2' : S.flags.let1 ? 'let1' : null;
