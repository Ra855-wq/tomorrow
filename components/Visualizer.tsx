
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
      case Theme.LIFE: return '52, 211, 153'; // Emerald
      default: return '129, 140, 248'; // Indigo
    }
  };

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 200;
    };
    window.addEventListener('resize', resize);
    resize();

    const bufferLength = 128;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      audioEngine.getAnalyserData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const colorBase = getColor();

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const alpha = (dataArray[i] / 255) * 0.8;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, `rgba(${colorBase}, 0)`);
        gradient.addColorStop(0.5, `rgba(${colorBase}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${colorBase}, 0)`);

        ctx.fillStyle = gradient;
        
        // Draw centered bars for a more "energy wave" look
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [active, theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed bottom-0 left-0 w-full h-[200px] z-10 pointer-events-none mix-blend-screen opacity-60"
    />
  );
};

export default Visualizer;
