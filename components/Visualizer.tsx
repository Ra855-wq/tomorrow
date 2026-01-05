import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioService';
import { Theme } from '../types';

interface VisualizerProps {
  theme: Theme;
  active: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ theme, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const getColor = () => {
    switch (theme) {
      case Theme.ADSCENDO: return '251, 191, 36'; // Amber
      case Theme.LIFE: return '244, 114, 182'; // Pink
      default: return '34, 211, 238'; // Cyan
    }
  };

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize
    canvas.width = window.innerWidth;
    canvas.height = 300;

    const bufferLength = 256;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      audioEngine.getAnalyserData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const colorBase = getColor();

      // Draw symmetrical waves
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5; // Scale down
        
        // Dynamic opacity based on bar height
        const alpha = barHeight / 255;
        
        ctx.fillStyle = `rgba(${colorBase}, ${alpha})`;
        
        // Mirror effect (Top and Bottom)
        const centerY = canvas.height / 2;
        
        // Rounded bars
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 5);
        ctx.fill();

        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [active, theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute bottom-0 left-0 w-full h-[300px] z-0 pointer-events-none opacity-50"
    />
  );
};

export default Visualizer;