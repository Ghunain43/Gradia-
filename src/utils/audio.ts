// Web Audio API generator for ambient study sounds and gentle focus chimes
// Completely self-contained with no external audio file dependencies.

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbientMode: string = 'none';

  private initContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play gentle bell chime when a focus interval finishes
  public playChime() {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Harmonic chords: F5 (698Hz), A5 (880Hz), C6 (1046Hz)
      const freqs = [698.46, 880.0, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 2.0);
      });
    } catch (e) {
      console.warn('Audio chime playback error:', e);
    }
  }

  // Play gentle button click feedback
  public playClick() {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  // Play ambient generator (brown noise, rain, library hum)
  public setAmbient(mode: 'none' | 'brown' | 'rain' | 'library', volume: number = 0.5) {
    if (this.currentAmbientMode === mode && mode !== 'none') {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setValueAtTime(volume * 0.25, this.ctx.currentTime);
      }
      return;
    }

    this.stopAmbient();
    this.currentAmbientMode = mode;

    if (mode === 'none') return;

    try {
      const ctx = this.initContext();
      const sampleRate = ctx.sampleRate;
      const durationSeconds = 5;
      const buffer = ctx.createBuffer(2, sampleRate * durationSeconds, sampleRate);

      if (mode === 'brown') {
        // Brown noise: integrated white noise (deep calming rumble)
        for (let channel = 0; channel < 2; channel++) {
          const data = buffer.getChannelData(channel);
          let lastOut = 0.0;
          for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // gain compensation
          }
        }
      } else if (mode === 'rain') {
        // Rain: pink/brown noise with periodic raindrop crackles
        for (let channel = 0; channel < 2; channel++) {
          const data = buffer.getChannelData(channel);
          let b0 = 0, b1 = 0, b2 = 0;
          for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            let sample = (b0 + b1 + b2) * 0.2;
            // random droplet pop
            if (Math.random() < 0.001) {
              sample += (Math.random() - 0.5) * 0.8;
            }
            data[i] = sample;
          }
        }
      } else if (mode === 'library') {
        // Library: low pass soft air murmur with occasional distant gentle page rustle
        for (let channel = 0; channel < 2; channel++) {
          const data = buffer.getChannelData(channel);
          let last = 0;
          for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = last * 0.96 + white * 0.04;
            last = data[i];
            data[i] *= 2.8;
          }
        }
      }

      this.ambientSource = ctx.createBufferSource();
      this.ambientSource.buffer = buffer;
      this.ambientSource.loop = true;

      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);

      this.ambientSource.connect(this.ambientGain);
      this.ambientGain.connect(ctx.destination);
      this.ambientSource.start();
    } catch (e) {
      console.warn('Failed to start ambient audio:', e);
    }
  }

  public stopAmbient() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientSource = null;
    }
    this.currentAmbientMode = 'none';
  }
}

export const sound = new SoundManager();
