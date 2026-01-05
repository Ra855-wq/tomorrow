
import { Theme } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  
  private currentAmbienceGain: GainNode | null = null;
  private ambienceNodes: AudioNode[] = [];
  private chimeTimer: number | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private isPlaying: boolean = false;
  private isSimulating: boolean = false;
  private simulationFrame: number = 0;

  constructor() {}

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
      const bufferSize = this.ctx.sampleRate * 4;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return this.noiseBuffer;
  }

  public async playAmbience(theme: Theme) {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Smoothly fade out previous nodes if they exist
    const oldNodes = [...this.ambienceNodes];
    const oldGain = this.currentAmbienceGain;
    const fadeOutTime = 2.0;
    const now = this.ctx.currentTime;

    if (oldGain) {
      oldGain.gain.linearRampToValueAtTime(0, now + fadeOutTime);
      setTimeout(() => {
        oldNodes.forEach(n => {
          try { if (n instanceof AudioScheduledSourceNode) n.stop(); n.disconnect(); } catch (e) {}
        });
        oldGain.disconnect();
      }, fadeOutTime * 1000);
    }

    if (this.chimeTimer) {
      clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }

    this.ambienceNodes = [];
    this.isPlaying = true;

    // Create new gain for the new theme
    this.currentAmbienceGain = this.ctx.createGain();
    this.currentAmbienceGain.gain.setValueAtTime(0, now);
    this.currentAmbienceGain.gain.linearRampToValueAtTime(0.15, now + fadeOutTime);
    this.currentAmbienceGain.connect(this.ctx.destination);

    switch (theme) {
      case Theme.ADSCENDO:
        this.playWind();
        break;
      case Theme.LIFE:
        this.playNature();
        break;
      default:
        this.playChimes();
        break;
    }
  }

  private playWind() {
    if (!this.ctx || !this.currentAmbienceGain) return;
    const buffer = this.getNoiseBuffer();
    if (!buffer) return;

    for (let i = 0; i < 2; i++) {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1;
      filter.frequency.value = 200 + Math.random() * 200;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.05 + Math.random() * 0.05;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 200;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const gain = this.ctx.createGain();
      gain.gain.value = 0.8;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.currentAmbienceGain);
      
      source.start();
      lfo.start();
      this.ambienceNodes.push(source, lfo, lfoGain, filter, gain);
    }
  }

  private playNature() {
    if (!this.ctx || !this.currentAmbienceGain) return;
    const buffer = this.getNoiseBuffer();
    if (!buffer) return;

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
    gain.connect(this.currentAmbienceGain);
    source.start();
    this.ambienceNodes.push(source, filter, gain);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.2;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfo.start();
    this.ambienceNodes.push(lfo, lfoGain);
  }

  private playChimes() {
    if (!this.ctx || !this.currentAmbienceGain) return;
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

    const triggerChime = () => {
        if (!this.ctx || !this.currentAmbienceGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const pan = this.ctx.createStereoPanner();
        osc.type = 'sine';
        osc.frequency.value = scale[Math.floor(Math.random() * scale.length)];
        pan.pan.value = Math.random() * 2 - 1;
        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3);
        osc.connect(pan);
        pan.connect(gain);
        gain.connect(this.currentAmbienceGain);
        osc.start();
        osc.stop(now + 4);
    };

    triggerChime();
    this.chimeTimer = window.setInterval(() => {
        if (Math.random() > 0.3) triggerChime();
    }, 2000);
  }

  public stop() {
    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.currentAmbienceGain) {
        this.currentAmbienceGain.gain.linearRampToValueAtTime(0, now + 0.5);
      }
    }
    setTimeout(() => {
      if (this.chimeTimer) clearInterval(this.chimeTimer);
      this.ambienceNodes.forEach(n => {
        try { if (n instanceof AudioScheduledSourceNode) n.stop(); n.disconnect(); } catch (e) {}
      });
      this.currentAmbienceGain?.disconnect();
      this.isSimulating = false;
      this.isPlaying = false;
    }, 500);
  }

  public startSimulation() {
    this.isSimulating = true;
    this.isPlaying = true;
  }

  public getAnalyserData(dataArray: Uint8Array) {
    if (this.isSimulating) {
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
}

export const audioEngine = new AudioEngine();
