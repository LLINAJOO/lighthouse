"use strict";
// ===== Weather music and small sounds =====
// ---------- sound: weather themes and small house sounds ----------
Object.assign(AU.MODES, {
  rain: { bpm: 58, prog: [[45, 52, 57, 60], [53, 60, 65, 69], [48, 55, 60, 64], [52, 59, 64, 67]], scale: [64, 67, 69, 71, 72, 76], inst: 'piano', dens: .3, pad: true },
  fog: { bpm: 46, prog: [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 60]], scale: [62, 65, 67, 69, 72], inst: 'piano', dens: .14, pad: true },
  breeze: { bpm: 88, prog: [[50, 57, 62, 66], [55, 62, 67, 71], [52, 59, 64, 67], [57, 64, 69, 73]], scale: [74, 76, 78, 79, 81, 83, 86], inst: 'guitar', dens: .55 },
});
function soulMusicMode() {
  const h = (S.min % 1440) / 60, w = S.weather;
  if (G.quiet) return G.quiet.mode || 'evening';
  if (G.storm) return 'storm';
  if (h >= 20.5 || h < 5) return 'night';
  if (w === 'fog') return 'fog';
  if (w === 'rain') return 'rain';
  if (h >= 17) return 'evening';
  if (w === 'windy') return 'breeze';
  return h < 10 ? 'morning' : 'day';
}
const SND = { tick: 0, tock: 0, mech: 0, owl: 18, horn: 12, bell: 20, hum: null };
function soulAudio(dt, env) {
  const ac = AU.ac; if (!ac) return; const now = ac.currentTime;
  if (env.house) { SND.tick -= dt; if (SND.tick < 0) { SND.tick = 1; SND.tock = !SND.tock; AU.tone(SND.tock ? 1900 : 1500, now, .03, 'square', .006, AU.amb, .001); }
    if (!env.evening) { AU.fireT -= dt * .35; if (AU.fireT < 0) { AU.fireT = .2 + Math.random() * .9; AU.crackle(); } } }
  if (env.lamp && S.lampLit) { SND.mech -= dt; if (SND.mech < 0) { SND.mech = .5; AU.tone(820, now, .05, 'triangle', .012, AU.amb, .002); } }
  if (!SND.hum) { const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 50; o2.type = 'sine'; o2.frequency.value = 100; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220; g.gain.value = 0; o.connect(f); o2.connect(f); f.connect(g); g.connect(AU.amb); o.start(); o2.start(); SND.hum = g; }
  SND.hum.gain.setTargetAtTime(env.shed && S.power ? .03 : 0, now, .4);
  if (env.outdoor && env.night && !env.rain) { SND.owl -= dt; if (SND.owl < 0) { SND.owl = 24 + Math.random() * 30; [0, .45, 1.05].forEach((d, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(i === 2 ? 330 : 370, now + d); o.frequency.linearRampToValueAtTime(i === 2 ? 300 : 345, now + d + .35); g.gain.setValueAtTime(0, now + d); g.gain.linearRampToValueAtTime(.03, now + d + .06); g.gain.linearRampToValueAtTime(0, now + d + .38); o.connect(g); g.connect(AU.amb); o.start(now + d); o.stop(now + d + .4); }); } }
  if ((env.outdoor || env.high) && env.fog) { SND.horn -= dt; if (SND.horn < 0) { SND.horn = 30 + Math.random() * 12; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; const g = ac.createGain(); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(.08, now + .5); g.gain.linearRampToValueAtTime(.06, now + 2); g.gain.linearRampToValueAtTime(0, now + 2.8); f.connect(g); g.connect(AU.amb); g.connect(AU.rev); [82, 123].forEach(fr => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(now); o.stop(now + 3); }); } }
  if (env.outdoor && env.night) { SND.bell -= dt; if (SND.bell < 0) { SND.bell = 26 + Math.random() * 20; AU.piano(88, now, .03, 3); AU.piano(93, now + .02, .015, 2.4); } }
}
{ const _au = AU.update; AU.update = function (dt, env) { _au.call(this, dt, env); try { soulAudio(dt, env); } catch (e) { } }; }
