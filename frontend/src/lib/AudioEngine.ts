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

  // System Boot / Sign In: Low, sweeping sub-bass rise passing into a crystal shimmer
  playBoot() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      const now = ctx.currentTime;

      // 1. Sub-bass sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 1.5);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.7);

      // 2. Crystal shimmer
      const shimmerNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      shimmerNotes.forEach((freq, idx) => {
        const trigTime = now + 0.8 + (idx * 0.1);
        const sOsc = ctx.createOscillator();
        const sGain = ctx.createGain();
        sOsc.type = 'sine';
        sOsc.frequency.setValueAtTime(freq, trigTime);
        
        sGain.gain.setValueAtTime(0, trigTime);
        sGain.gain.linearRampToValueAtTime(0.08, trigTime + 0.05);
        sGain.gain.exponentialRampToValueAtTime(0.001, trigTime + 0.4);
        
        sOsc.connect(sGain);
        sGain.connect(ctx.destination);
        sOsc.start(trigTime);
        sOsc.stop(trigTime + 0.45);
      });
    } catch (e) {
      console.warn('AudioEngine failed to play boot sound:', e);
    }
  }

  // Menu Navigation / Tab Hover: Ultra-short synthetic tick (0.05s)
  playNavTick() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1600, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('AudioEngine failed to play nav tick:', e);
    }
  }

  // Quest Verification Init: Mechanical lock engagement click + low hum
  playVerifyInit() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      const now = ctx.currentTime;

      // 1. Mechanical click
      const oscClick = ctx.createOscillator();
      const gainClick = ctx.createGain();
      oscClick.type = 'triangle';
      oscClick.frequency.setValueAtTime(280, now);
      oscClick.frequency.exponentialRampToValueAtTime(40, now + 0.08);
      
      gainClick.gain.setValueAtTime(0.12, now);
      gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      oscClick.connect(gainClick);
      gainClick.connect(ctx.destination);
      oscClick.start(now);
      oscClick.stop(now + 0.09);

      // 2. Low ambient hum
      const oscHum = ctx.createOscillator();
      const gainHum = ctx.createGain();
      oscHum.type = 'sine';
      oscHum.frequency.setValueAtTime(90, now + 0.05);
      
      gainHum.gain.setValueAtTime(0, now + 0.05);
      gainHum.gain.linearRampToValueAtTime(0.05, now + 0.15);
      gainHum.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      
      oscHum.connect(gainHum);
      gainHum.connect(ctx.destination);
      oscHum.start(now + 0.05);
      oscHum.stop(now + 0.95);
    } catch (e) {
      console.warn('AudioEngine failed to play verify init:', e);
    }
  }

  playQuestClear() {
    this.playSuccess();
  }

  // Quest Completion Success: Bright, high-resonance golden chime melody + energetic upward sweep
  playSuccess() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      const now = ctx.currentTime;

      // 1. Upward sweep
      const oscSweep = ctx.createOscillator();
      const gainSweep = ctx.createGain();
      oscSweep.type = 'sine';
      oscSweep.frequency.setValueAtTime(300, now);
      oscSweep.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
      
      gainSweep.gain.setValueAtTime(0, now);
      gainSweep.gain.linearRampToValueAtTime(0.08, now + 0.05);
      gainSweep.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      oscSweep.connect(gainSweep);
      gainSweep.connect(ctx.destination);
      oscSweep.start(now);
      oscSweep.stop(now + 0.4);

      // 2. Golden chimes (Arpeggio)
      const chimes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      chimes.forEach((freq, idx) => {
        const trig = now + 0.15 + (idx * 0.07);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, trig);
        
        gain.gain.setValueAtTime(0, trig);
        gain.gain.linearRampToValueAtTime(0.1, trig + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, trig + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(trig);
        osc.stop(trig + 0.55);
      });
    } catch (e) {
      console.warn('AudioEngine failed to play success chime:', e);
    }
  }

  // Level up stinger
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

  // Focus Breach Warning: Dissonant, industrial low-frequency alarm pulse thuds
  playBreach() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      const now = ctx.currentTime;
      
      // Play 2 thuds
      [0, 0.22].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now + offset);
        osc.frequency.linearRampToValueAtTime(70, now + offset + 0.18);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now + offset);

        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });
    } catch (e) {
      console.warn('AudioEngine failed to play breach alarm:', e);
    }
  }

  // Focus Shield Faint: Glass shattering smash cascading into a white-noise drone
  playFaint() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      const now = ctx.currentTime;

      // 1. Dissonant smash frequencies
      const frequencies = [800, 1200, 2200, 3100, 4800];
      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });

      // 2. White-noise white noise exhale drone
      const bufferSize = ctx.sampleRate * 1.5; // 1.5s
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(600, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(50, now + 1.2);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 1.5);
    } catch (e) {
      console.warn('AudioEngine failed to play faint sound:', e);
    }
  }

  // Midnight Carry-Over: Heavy, metallic geometric downward drop sound
  playMidnightDrop() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.9);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(90, now + 0.9);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.95);
    } catch (e) {
      console.warn('AudioEngine failed to play carry-over drop:', e);
    }
  }

  // Calm Reset exhale: organic breathing exhale wind sound
  playExhale() {
    try {
      this.initCtx();
      const ctx = this.audioCtx!;
      const now = ctx.currentTime;

      // Ensure BGM is muted
      this.stopBattleMusic();

      // Synthesize deep slow wind breath (exhale)
      const bufferSize = ctx.sampleRate * 2.0; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.exponentialRampToValueAtTime(250, now + 1.8);
      filter.Q.setValueAtTime(2.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.95);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
      source.stop(now + 2.0);
    } catch (e) {
      console.warn('AudioEngine failed to play exhale breathing:', e);
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
