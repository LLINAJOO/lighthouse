"use strict";
// ===================== AUDIO: ambience + generative music =====================
const AU = {
  ac: null, on: true, master: null, music: null, amb: null, noise: null, nodes: {}, next: 0, beat: 0, mode: 'title', chordIdx: 0, lastMel: 72, whaleT: 0, gullT: 4, fireT: 0,
  init() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ac = this.ac = new AC();
    this.master = ac.createGain(); this.master.gain.value = this.on ? .8 : 0; this.master.connect(ac.destination);
    const comp = ac.createDynamicsCompressor(); comp.connect(this.master);
    this.music = ac.createGain(); this.music.gain.value = .42; this.music.connect(comp);
    // simple reverb
    const rev = ac.createConvolver(); const len = ac.sampleRate * 2.6, ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    rev.buffer = ir; const rg = ac.createGain(); rg.gain.value = .35; this.music.connect(rev); rev.connect(rg); rg.connect(comp); this.rev = rev;
    this.amb = ac.createGain(); this.amb.gain.value = .55; this.amb.connect(comp);
    const nb = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate), nd = nb.getChannelData(0);
    let b = 0; for (let i = 0; i < nd.length; i++) { const w = Math.random() * 2 - 1; b = (b + .02 * w) / 1.02; nd[i] = w * .5 + b * 3; }
    this.noise = nb;
    const loop = (type, freq, q, gain) => { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; s.playbackRate.value = .7 + Math.random() * .6; const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = ac.createGain(); g.gain.value = gain; s.connect(f); f.connect(g); g.connect(this.amb); s.start(); return { g, f }; };
    this.nodes.waves = loop('lowpass', 420, .3, .0);
    this.nodes.rain = loop('highpass', 1400, .4, 0);
    this.nodes.wind = loop('bandpass', 380, .8, 0);
    this.next = ac.currentTime + .2;
  },
  toggle() { this.on = !this.on; if (this.master) this.master.gain.setTargetAtTime(this.on ? .8 : 0, this.ac.currentTime, .1); return this.on; },
  tone(freq, t, dur, type, vol, dest, attack = .005) {
    const ac = this.ac, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g); g.connect(dest || this.music); o.start(t); o.stop(t + dur + .05); return o;
  },
  piano(n, t, v = .18, dur = 2.6) { const f = 440 * Math.pow(2, (n - 69) / 12); this.tone(f, t, dur, 'sine', v); this.tone(f * 2, t, dur * .6, 'triangle', v * .18); this.tone(f * 3, t, dur * .25, 'sine', v * .05); },
  guitar(n, t, v = .14) { const f = 440 * Math.pow(2, (n - 69) / 12); this.tone(f, t, 1.4, 'triangle', v, null, .003); this.tone(f * 1.003, t, 1.0, 'sawtooth', v * .05, null, .003); },
  pad(notes, t, dur, v = .035) {
    const ac = this.ac, f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; const g = ac.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dur * .4); g.gain.linearRampToValueAtTime(0, t + dur); f.connect(g); g.connect(this.music);
    notes.forEach(n => { [-.08, .08].forEach(dt => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 440 * Math.pow(2, (n - 69) / 12); o.detune.value = dt * 100; o.connect(f); o.start(t); o.stop(t + dur + .1); }); });
  },
  MODES: {
    title: { bpm: 54, prog: [[57, 64, 69, 72], [53, 60, 65, 69], [48, 55, 64, 67], [55, 62, 67, 71]], scale: [69, 71, 72, 74, 76, 79, 81], inst: 'piano', dens: .35, pad: true },
    morning: { bpm: 78, prog: [[48, 55, 64, 67], [55, 62, 67, 71], [57, 64, 69, 72], [53, 60, 65, 69]], scale: [72, 74, 76, 79, 81, 84], inst: 'guitar', dens: .5 },
    day: { bpm: 82, prog: [[53, 60, 65, 69], [48, 55, 64, 67], [50, 57, 62, 65], [55, 62, 67, 71]], scale: [72, 74, 76, 77, 79, 81, 84], inst: 'piano', dens: .45 },
    evening: { bpm: 66, prog: [[57, 64, 69, 72], [53, 60, 65, 69], [55, 62, 67, 71], [52, 59, 64, 67]], scale: [69, 71, 72, 74, 76, 79], inst: 'piano', dens: .4, pad: true },
    night: { bpm: 54, prog: [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 60]], scale: [62, 64, 65, 67, 69, 72, 74], inst: 'piano', dens: .25, pad: true },
    storm: { bpm: 60, prog: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]], scale: [57, 59, 60, 62, 64, 67], inst: 'piano', dens: .2, pad: true },
    ending: { bpm: 60, prog: [[48, 55, 64, 67], [55, 62, 67, 71], [57, 64, 69, 72], [53, 60, 65, 69]], scale: [72, 74, 76, 79, 81, 84, 86], inst: 'piano', dens: .55, pad: true },
  },
  setMode(m) { this.mode = m; },
  schedule() {
    const ac = this.ac; if (!ac) return;
    const M = this.MODES[this.mode] || this.MODES.day; const spb = 60 / M.bpm / 2; // eighth notes
    while (this.next < ac.currentTime + .25) {
      const t = this.next, step = this.beat % 16;
      const ch = M.prog[this.chordIdx % M.prog.length];
      if (step === 0) {
        (M.inst === 'guitar' ? this.guitar.bind(this) : this.piano.bind(this))(ch[0] - 12 + 12, t, .16, 3.4);
        if (M.pad) this.pad(ch.slice(1), t, spb * 16, .03);
      }
      if (M.inst === 'guitar' && step % 2 === 0) this.guitar(ch[(step / 2) % 4] + 12 * (step % 8 === 4 ? 0 : 0), t, step % 4 === 0 ? .1 : .07);
      if (M.inst === 'piano' && (step === 4 || step === 8 || step === 12) && Math.random() < .6) this.piano(ch[1 + (step / 4 | 0) % 3], t, .07, 2.2);
      if (step % 2 === 0 && Math.random() < M.dens) {
        const sc = M.scale; let i = sc.indexOf(this.lastMel); if (i < 0) i = 2; i = clamp(i + Math.round((Math.random() - .5) * 3), 0, sc.length - 1); this.lastMel = sc[i];
        this.piano(sc[i], t + (Math.random() < .2 ? spb * .5 : 0), .11, 2.6);
      }
      this.next += spb; this.beat++; if (this.beat % 16 === 0) this.chordIdx++;
    }
  },
  update(dt, env) {
    const ac = this.ac; if (!ac) return; this.schedule();
    const now = ac.currentTime, st = (n, v) => n.g.gain.setTargetAtTime(v, now, .8);
    const out = env.outdoor ? 1 : env.high ? .7 : .25;
    st(this.nodes.waves, (.18 + .12 * Math.sin(now * .45) + .06 * Math.sin(now * 1.3)) * out * (env.storm ? 1.6 : 1));
    st(this.nodes.rain, env.rain ? (env.outdoor || env.high ? .28 : .1) * (env.storm ? 1.5 : 1) : 0);
    st(this.nodes.wind, (env.wind ? .22 : .03) * (env.outdoor || env.high ? 1 : .3) * (env.storm ? 1.8 : 1));
    this.nodes.wind.f.frequency.setTargetAtTime(300 + 200 * Math.sin(now * .3), now, .5);
    // gulls
    this.gullT -= dt;
    if (this.gullT < 0) { this.gullT = 6 + Math.random() * 12; if (env.outdoor && env.daylight && !env.rain) this.gull(); }
    // fire crackle indoors
    if (env.indoor && env.evening) { this.fireT -= dt; if (this.fireT < 0) { this.fireT = .05 + Math.random() * .4; this.crackle(); } }
    // whales
    if (env.whales) { this.whaleT -= dt; if (this.whaleT < 0) { this.whaleT = 4 + Math.random() * 5; this.whale(env.whaleNear ? .12 : .04); } }
  },
  gull() {
    const ac = this.ac, t = ac.currentTime; for (let k = 0; k < 2 + (Math.random() * 3 | 0); k++) {
      const o = ac.createOscillator(), g = ac.createGain(), tt = t + k * .22; o.type = 'triangle';
      o.frequency.setValueAtTime(1700, tt); o.frequency.exponentialRampToValueAtTime(950, tt + .18);
      g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(.025, tt + .02); g.gain.exponentialRampToValueAtTime(.0005, tt + .2); o.connect(g); g.connect(this.amb); o.start(tt); o.stop(tt + .25);
    }
  },
  crackle() { const ac = this.ac, s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter(); s.buffer = this.noise; f.type = 'highpass'; f.frequency.value = 2500; g.gain.setValueAtTime(.08 * Math.random(), ac.currentTime); g.gain.exponentialRampToValueAtTime(.0005, ac.currentTime + .04); s.connect(f); f.connect(g); g.connect(this.amb); s.start(ac.currentTime, Math.random() * 2, .06); },
  thunder() { if (!this.ac) return; const ac = this.ac, s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter(), t = ac.currentTime + .6 + Math.random(); s.buffer = this.noise; f.type = 'lowpass'; f.frequency.value = 180; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.9, t + .1); g.gain.exponentialRampToValueAtTime(.001, t + 2.8); s.connect(f); f.connect(g); g.connect(this.amb); s.start(t, 0, 3); },
  whale(v) { const ac = this.ac, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; const f0 = 180 + Math.random() * 120; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * 1.6, t + 1.4); o.frequency.linearRampToValueAtTime(f0 * .8, t + 3); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .8); g.gain.linearRampToValueAtTime(0, t + 3.2); o.connect(g); g.connect(this.music); g.connect(this.rev); o.start(t); o.stop(t + 3.3); },
  chime() { if (!this.ac) return; const t = this.ac.currentTime; [76, 81, 88].forEach((n, i) => this.piano(n, t + i * .09, .09, 1.4)); },
  voice(freq, type, vol) { if (!this.ac) return; const t = this.ac.currentTime, f = freq * (1 + (Math.random() - .5) * .08); const o = this.ac.createOscillator(), g = this.ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + .035); g.gain.linearRampToValueAtTime(0, t + .055); o.connect(g); g.connect(this.amb); o.start(t); o.stop(t + .07); },
  blip() { if (!this.ac) return; this.tone(880, this.ac.currentTime, .08, 'square', .02, this.amb); },
};
