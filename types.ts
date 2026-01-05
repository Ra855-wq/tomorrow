export enum Theme {
  ADSCENDO = 'ADSCENDO', // Gold, Clouds, Birds, Air
  LIFE = 'LIFE',         // Green, Pink, Nature, Silvyra
  CLASSIC = 'CLASSIC'    // Purple, Blue, Magic, Book of Wisdom
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type VisualizerMode = 'WAVE' | 'BARS' | 'ORB';
