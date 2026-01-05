import { Theme } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  
  // Ambience State
  private ambienceGain: GainNode | null = null;
  private ambienceNodes: AudioNode[] = [];
  private chimeTimer: number | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // General State
  private isPlaying: boolean = false;
  private isSimulating: boolean = false;
  private simulationFrame: number = 0;

  constructor() {
    // Lazy initialization handled in start
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
    }
  }

  private getNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (!this.noiseBuffer) {
      const bufferSize = this.ctx.sampleRate * 4; // 4 seconds of noise
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return this.noiseBuffer;
  }

  public playAmbience(theme: Theme) {
    this.init();
    if (!this.ctx) return;
    
    // Resume context if suspended (browser policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stopAmbience();
    this.isPlaying = true;

    // Master Gain for Ambience
    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.value = 0.15; // Subtle background layer
    this.ambienceGain.connect(this.ctx.destination);
    
    // Optional: Connect to analyser only if NOT simulating, 
    // but since we usually simulate with YouTube, we might just skip connecting to analyser 
    // to avoid visualizer noise when music is quiet.

    switch (theme) {
      case Theme.ADSCENDO:
        this.playWind();
        break;
      case Theme.LIFE:
        this.playNature();
        break;
      default: // CLASSIC
        this.playChimes();
        break;
    }
  }

  private playWind() {
    if (!this.ctx || !this.ambienceGain) return;
    const buffer = this.getNoiseBuffer();
    if (!buffer) return;

    // Create 2 layers of wind
    for (let i = 0; i < 2; i++) {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1;
      filter.frequency.value = 200 + Math.random() * 200;

      // Modulate frequency to simulate gusts
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + Math.random() * 0.05; // Slow
      
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 200; // Modulation depth

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const gain = this.ctx.createGain();
      gain.gain.value = 0.8;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambienceGain);
      
      source.start();
      lfo.start();

      this.ambienceNodes.push(source, lfo, lfoGain, filter, gain);
    }
  }

  private playNature() {
    if (!this.ctx || !this.ambienceGain) return;
    const buffer = this.getNoiseBuffer();
    if (!buffer) return;

    // 1. Water/Stream (Lowpass Noise)
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = this.ctx.createGain();
    gain.gain.value = 1.2;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambienceGain);
    source.start();

    this.ambienceNodes.push(source, filter, gain);

    // 2. Subtle High Frequency "Leaves/Insects"
    const hSource = this.ctx.createBufferSource();
    hSource.buffer = buffer;
    hSource.loop = true;
    // Slow down playback for texture
    hSource.playbackRate.value = 0.8;

    const hFilter = this.ctx.createBiquadFilter();
    hFilter.type = 'highpass';
    hFilter.frequency.value = 3000;

    const hGain = this.ctx.createGain();
    hGain.gain.value = 0.05; // Very quiet

    // LFO for volume swell
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.2;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(hGain.gain);
    lfo.start();

    hSource.connect(hFilter);
    hFilter.connect(hGain);
    hGain.connect(this.ambienceGain);
    hSource.start();

    this.ambienceNodes.push(hSource, hFilter, hGain, lfo, lfoGain);
  }

  private playChimes() {
    if (!this.ctx || !this.ambienceGain) return;

    // Pentatonic scale frequencies (approx)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6

    const triggerChime = () => {
        if (!this.ctx || !this.ambienceGain) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const pan = this.ctx.createStereoPanner();

        osc.type = 'sine';
        const freq = scale[Math.floor(Math.random() * scale.length)];
        osc.frequency.value = freq;

        // Random pan
        pan.pan.value = Math.random() * 2 - 1;

        // Envelope
        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3); // Decay

        osc.connect(pan);
        pan.connect(gain);
        gain.connect(this.ambienceGain);

        osc.start();
        osc.stop(now + 4);

        // We don't track these individual short-lived nodes in ambienceNodes 
        // because they self-destruct, but we track the timer.
    };

    triggerChime(); // Play one immediately
    this.chimeTimer = window.setInterval(() => {
        if (Math.random() > 0.3) triggerChime();
    }, 2000); // Try every 2 seconds
  }

  public stopAmbience() {
    if (this.chimeTimer) {
        clearInterval(this.chimeTimer);
        this.chimeTimer = null;
    }
    this.ambienceNodes.forEach(node => {
        try { 
            // disconnect/stop logic depends on node type, simplified here
            if (node instanceof AudioScheduledSourceNode) node.stop();
            node.disconnect();
        } catch (e) {}
    });
    this.ambienceNodes = [];
    
    if (this.ambienceGain) {
        try {
            this.ambienceGain.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 0.5);
            setTimeout(() => {
                this.ambienceGain?.disconnect();
                this.ambienceGain = null;
            }, 500);
        } catch(e) {}
    }
  }

  public startSimulation() {
    this.isSimulating = true;
    this.isPlaying = true;
    // Note: Simulation does not stop ambience anymore. They layer.
  }

  public getAnalyserData(dataArray: Uint8Array) {
    if (this.isSimulating) {
      // Generate plausible visualizer data based on sine waves and noise
      this.simulationFrame += 0.05;
      for (let i = 0; i < dataArray.length; i++) {
        const v1 = Math.sin(i * 0.1 + this.simulationFrame) * 128 + 128;
        const v2 = Math.cos(i * 0.2 - this.simulationFrame * 1.5) * 64;
        const noise = Math.random() * 30;
        const beat = (Math.sin(this.simulationFrame * 2) > 0.8 && i < 20) ? 100 : 0;
        dataArray[i] = Math.min(255, Math.max(0, (v1 + v2 + noise + beat) * 0.8));
      }
    } else if (this.analyser) {
      this.analyser.getByteFrequencyData(dataArray);
    }
  }

  public stop() {
    this.stopAmbience();
    this.isSimulating = false;
    this.isPlaying = false;
  }
}

export const audioEngine = new AudioEngine();
