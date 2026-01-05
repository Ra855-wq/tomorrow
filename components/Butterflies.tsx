
import React, { useEffect, useRef, useState } from 'react';
import { Particle, Theme } from '../types';

interface ButterfliesProps {
  theme: Theme;
}

interface EnhancedButterfly extends Particle {
  wingSpan: number;
  flapSpeed: number;
}

const Butterflies: React.FC<ButterfliesProps> = ({ theme }) => {
  const [particles, setParticles] = useState<EnhancedButterfly[]>([]);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const initialParticles: EnhancedButterfly[] = Array.from({ length: 20 }).map((_, i) => {
      const isLarge = Math.random() > 0.7;
      return {
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: isLarge ? Math.random() * 25 + 25 : Math.random() * 10 + 8,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        opacity: Math.random() * 0.4 + 0.4,
        hue: theme === Theme.LIFE ? Math.random() * 60 + 280 : Math.random() * 40 + 40,
        wingSpan: isLarge ? 1.5 : 1,
        flapSpeed: Math.random() * 0.2 + 0.1,
      };
    });
    setParticles(initialParticles);
  }, [theme]);

  const animate = () => {
    setParticles(prev => prev.map(p => {
      let newX = p.x + p.speedX;
      let newY = p.y + p.speedY;

      if (newX > window.innerWidth + 50) newX = -50;
      if (newX < -50) newX = window.innerWidth + 50;
      if (newY > window.innerHeight + 50) newY = -50;
      if (newY < -50) newY = window.innerHeight + 50;

      return { ...p, x: newX, y: newY };
    }));
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case Theme.ADSCENDO: return 'text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]';
      case Theme.LIFE: return 'text-pink-300 drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]';
      default: return 'text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute transition-colors duration-1000 ${getThemeColors()}`}
          style={{
            transform: `translate(${p.x}px, ${p.y}px) rotate(${Math.atan2(p.speedY, p.speedX) * (180/Math.PI) + 90}deg)`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
            <path d="M12 2C12 2 11 3 11 5C11 7 12 12 12 12C12 12 13 7 13 5C13 3 12 2 12 2ZM8 6C6 5 2 6 2 9C2 12 5 13 6 12C5 14 5 18 9 17C9 17 8 12 8 6ZM16 6C18 5 22 6 22 9C22 12 19 13 18 12C19 14 19 18 15 17C15 17 16 12 16 6Z" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default Butterflies;
