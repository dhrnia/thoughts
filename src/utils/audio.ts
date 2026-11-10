// Subtle Zen Web Audio Synthesizer for Quiet Mode and haptic audio
class ZenAudioManager {
  private ctx: AudioContext | null = null;
  private rainNode: AudioNode | null = null;
  private isRainPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft zen bowl chime for unlocking or quiet mode toggle
  playBell(freq = 432) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, this.ctx.currentTime + 2.5);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.5);
    } catch {
      // Audio might be blocked until user gesture, safe fallback
    }
  }

  // Soft tactile click for PIN keypad
  playClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // safe fallback
    }
  }

  // Gentle rain ambient generator
  toggleRain(enable: boolean) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (!enable) {
        if (this.rainNode) {
          try {
            (this.rainNode as AudioBufferSourceNode).stop();
          } catch {}
          this.rainNode.disconnect();
          this.rainNode = null;
        }
        this.isRainPlaying = false;
        return;
      }

      if (this.isRainPlaying) return;

      // Generate 2 seconds of pink/brown filtered noise looped
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 1.5; // Gain
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      // Filter for gentle rain frequency
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      this.rainNode = whiteNoise;
      this.isRainPlaying = true;
    } catch {
      // safe fallback
    }
  }
}

export const zenAudio = new ZenAudioManager();
