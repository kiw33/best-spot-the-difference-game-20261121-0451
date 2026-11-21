// Little WebAudio synth: no audio files, everything is an oscillator blip
// so the game stays fully offline. Created lazily on the first user gesture
// (browsers block audio before interaction); every call is safe before that.

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = !!value;
}

export function isMuted() {
  return muted;
}

function audio() {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, startIn, dur, type, vol) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + startIn;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  click() {
    tone(660, 0, 0.05, 'triangle', 0.08);
  },
  found() {
    tone(523.25, 0, 0.12, 'sine', 0.16);
    tone(783.99, 0.09, 0.18, 'sine', 0.16);
  },
  wrong() {
    tone(160, 0, 0.16, 'sawtooth', 0.07);
    tone(110, 0.05, 0.2, 'sawtooth', 0.06);
  },
  hint() {
    tone(880, 0, 0.1, 'sine', 0.12);
    tone(1174.66, 0.08, 0.14, 'sine', 0.12);
  },
  levelClear() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.22, 'sine', 0.15));
  },
  win() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.13));
  },
  tick() {
    tone(440, 0, 0.05, 'square', 0.04);
  },
};
