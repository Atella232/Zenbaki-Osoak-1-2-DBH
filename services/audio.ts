// Simple audio synthesizer using Web Audio API
// No external assets required

let audioCtx: AudioContext | null = null;
let isMuted = false;

const initAudio = () => {
  if (isMuted) return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
  if (isMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  
  gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
};

export const audioManager = {
  toggleMute: () => {
    isMuted = !isMuted;
    return isMuted;
  },
  isMuted: () => isMuted
};

export const playSound = {
  correct: () => {
    playTone(600, 'sine', 0.1, 0);
    playTone(800, 'sine', 0.2, 0.1);
  },
  wrong: () => {
    playTone(150, 'sawtooth', 0.3, 0);
  },
  click: () => {
    playTone(400, 'triangle', 0.05, 0, 0.05);
  },
  win: () => {
    playTone(400, 'sine', 0.1, 0);
    playTone(500, 'sine', 0.1, 0.1);
    playTone(600, 'sine', 0.1, 0.2);
    playTone(800, 'square', 0.4, 0.3);
  },
  levelUp: () => {
    playTone(400, 'sine', 0.1, 0);
    playTone(500, 'sine', 0.1, 0.1);
    playTone(600, 'sine', 0.1, 0.2);
    playTone(800, 'sine', 0.1, 0.3);
    playTone(1000, 'square', 0.4, 0.4);
  }
};