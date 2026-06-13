// Web Audio API Synth Engine for EvolveAura V2.0
// Fully client-side, zero external assets, procedurally generated audio.

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private battleMusicGain: GainNode | null = null;
  private battleMusicInterval: any = null;
  private isMusicPlaying = false;

  private initCtx() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Quick retro click for typewriters
  playTypewriter() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('AudioEngine failed to play typewriter:', e);
    }
  }

  // Level up chime
  playLevelUp() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      const now = ctx.currentTime;
      
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const timeOffset = idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + timeOffset);
        
        gain.gain.setValueAtTime(0, now + timeOffset);
        gain.gain.linearRampToValueAtTime(0.12, now + timeOffset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.4);
      });
    } catch (e) {
      console.warn('AudioEngine failed to play level up:', e);
    }
  }

  // Flashing focus breach alarm
  playBreach() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.3);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(now + 0.32);
    } catch (e) {
      console.warn('AudioEngine failed to play breach alarm:', e);
    }
  }

  // Start aggressive, cinematic battle music loop
  startBattleMusic() {
    if (this.isMusicPlaying) return;
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      this.isMusicPlaying = true;
      
      this.battleMusicGain = ctx.createGain();
      this.battleMusicGain.gain.setValueAtTime(0.05, ctx.currentTime);
      this.battleMusicGain.connect(ctx.destination);

      let step = 0;
      const tempo = 145; // BPM
      const stepDuration = 60 / tempo / 2; // Eighth notes
      
      const baseNotes = [110.00, 130.81, 146.83, 164.81, 196.00]; // A2, C3, D3, E3, G3
      const patterns = [
        [0, 2, 4, 3, 2, 0, 1, 3], // Riff 1
        [0, 0, 2, 2, 3, 3, 4, 4]  // Riff 2
      ];

      this.battleMusicInterval = setInterval(() => {
        try {
          const now = ctx.currentTime;
          const riff = Math.floor(step / 16) % 2;
          const noteIdx = patterns[riff][step % 8];
          const freq = baseNotes[noteIdx];
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, now);
          
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration - 0.01);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.battleMusicGain!);
          
          osc.start(now);
          osc.stop(now + stepDuration);

          if (step % 2 === 0) {
            const noise = ctx.createOscillator();
            const noiseGain = ctx.createGain();
            noise.type = 'triangle';
            noise.frequency.setValueAtTime(10000, now);
            noiseGain.gain.setValueAtTime(0.02, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            noise.connect(noiseGain);
            noiseGain.connect(this.battleMusicGain!);
            noise.start(now);
            noise.stop(now + 0.04);
          }

          step++;
        } catch (err) {
          console.warn('Synth loop step failed:', err);
        }
      }, stepDuration * 1000);

    } catch (e) {
      console.warn('AudioEngine failed to start battle music:', e);
    }
  }

  stopBattleMusic() {
    this.isMusicPlaying = false;
    if (this.battleMusicInterval) {
      clearInterval(this.battleMusicInterval);
      this.battleMusicInterval = null;
    }
    if (this.battleMusicGain) {
      try {
        this.battleMusicGain.gain.setValueAtTime(this.battleMusicGain.gain.value, this.audioCtx!.currentTime);
        this.battleMusicGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx!.currentTime + 0.3);
      } catch (e) {}
      this.battleMusicGain = null;
    }
  }
}

export const audioEngine = new AudioEngine();
