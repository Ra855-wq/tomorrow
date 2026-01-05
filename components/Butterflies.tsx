
import React, { useEffect, useRef, useState } from 'react';
import { Particle, Theme } from '../types';

interface FlyingCreature extends Particle {
  type: 'butterfly' | 'hummingbird' | 'moth';
  wingSpan: number;
  flapSpeed: number;
  flapState: number;
  angle: number;
  targetX: number;
  targetY: number;
  dartTimer: number;
}

interface ButterfliesProps {
  theme: Theme;
}

const Butterflies: React.FC<ButterfliesProps> = ({ theme }) => {
  const [creatures, setCreatures] = useState<FlyingCreature[]>([]);
  const requestRef = useRef<number | null>(null);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const initialCreatures: FlyingCreature[] = Array.from({ length: 25 }).map((_, i) => {
      // Distribution: 15 butterflies, 6 hummingbirds, 4 moths
      let type: 'butterfly' | 'hummingbird' | 'moth' = 'butterfly';
      if (i >= 15 && i < 21) type = 'hummingbird';
      else if (i >= 21) type = 'moth';

      const isLarge = Math.random() > 0.7;
      
      return {
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: type === 'moth' ? 45 : (type === 'hummingbird' ? 35 : (isLarge ? 30 : 15)),
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.4 + 0.5,
        hue: theme === Theme.LIFE ? Math.random() * 60 + 280 : Math.random() * 40 + 40,
        type,
        wingSpan: 1,
        flapSpeed: type === 'hummingbird' ? 0.8 : (type === 'moth' ? 0.15 : 0.25),
        flapState: Math.random() * Math.PI * 2,
        angle: 0,
        targetX: Math.random() * window.innerWidth,
        targetY: Math.random() * window.innerHeight,
        dartTimer: Math.random() * 100,
      };
    });
    setCreatures(initialCreatures);
  }, [theme]);

  const animate = () => {
    setCreatures(prev => prev.map(c => {
      let { x, y, speedX, speedY, targetX, targetY, dartTimer, flapState, type, angle } = c;

      // Behavior based on type
      if (type === 'hummingbird') {
        // Hummingbirds dart and hover
        dartTimer--;
        if (dartTimer <= 0) {
          targetX = Math.random() * window.innerWidth;
          targetY = Math.random() * window.innerHeight;
          dartTimer = 50 + Math.random() * 150;
        }
        speedX += (targetX - x) * 0.002;
        speedY += (targetY - y) * 0.002;
        speedX *= 0.96; // Fast but snappy
        speedY *= 0.96;
      } else if (type === 'moth') {
        // Moths are attracted to mouse (light)
        const dx = mousePos.current.x - x;
        const dy = mousePos.current.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 400) {
          speedX += (dx / dist) * 0.05;
          speedY += (dy / dist) * 0.05;
        }
        speedX *= 0.98;
        speedY *= 0.98;
      } else {
        // Butterflies flutter randomly
        speedX += (Math.random() - 0.5) * 0.2;
        speedY += (Math.random() - 0.5) * 0.2;
        speedX *= 0.99;
        speedY *= 0.99;
      }

      x += speedX;
      y += speedY;
      flapState += c.flapSpeed;
      angle = Math.atan2(speedY, speedX);

      // Wrap screen
      if (x > window.innerWidth + 100) x = -100;
      if (x < -100) x = window.innerWidth + 100;
      if (y > window.innerHeight + 100) y = -100;
      if (y < -100) y = window.innerHeight + 100;

      return { ...c, x, y, speedX, speedY, targetX, targetY, dartTimer, flapState, angle };
    }));
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const getCreatureColor = (type: string) => {
    if (type === 'hummingbird') return theme === Theme.LIFE ? 'text-emerald-400' : 'text-cyan-400';
    if (type === 'moth') return theme === Theme.ADSCENDO ? 'text-amber-200' : 'text-indigo-200';
    return theme === Theme.LIFE ? 'text-pink-400' : 'text-amber-400';
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {creatures.map(c => (
        <div
          key={c.id}
          className={`absolute transition-colors duration-1000 ${getCreatureColor(c.type)}`}
          style={{
            transform: `translate(${c.x}px, ${c.y}px) rotate(${c.angle * (180/Math.PI) + 90}deg)`,
            width: c.size,
            height: c.size,
            opacity: c.opacity,
          }}
        >
          {/* Hummingbird with Bell */}
          {c.type === 'hummingbird' && (
            <div className="relative w-full h-full">
              <svg viewBox="0 0 100 100" fill="currentColor" className="drop-shadow-[0_0_10px_currentColor]">
                {/* Body and wings */}
                <path d="M50,50 L70,30 Q80,20 60,10 L50,40 L40,10 Q20,20 30,30 Z" />
                {/* Beak */}
                <path d="M50,50 L50,80" stroke="currentColor" strokeWidth="2" />
                {/* Flapping Wings */}
                <g style={{ transform: `scaleX(${Math.sin(c.flapState)})`, transformOrigin: 'center' }}>
                  <path d="M50,45 L10,35 Q0,45 20,55 Z" opacity="0.6" />
                  <path d="M50,45 L90,35 Q100,45 80,55 Z" opacity="0.6" />
                </g>
              </svg>
              {/* The Bell (Sino) */}
              <div className="absolute top-[80%] left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDuration: '2s' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
            </div>
          )}

          {/* Perfect Moth (Mariposa) */}
          {c.type === 'moth' && (
            <div className="relative w-full h-full">
              <svg viewBox="0 0 100 100" fill="currentColor" className="drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {/* Elaborate Wings */}
                <g style={{ transform: `scaleX(${0.8 + Math.sin(c.flapState) * 0.2})`, transformOrigin: 'center' }}>
                  {/* Upper Wings */}
                  <path d="M50,50 C20,10 0,30 20,60 C30,75 50,60 50,50 Z" opacity="0.9" />
                  <path d="M50,50 C80,10 100,30 80,60 C70,75 50,60 50,50 Z" opacity="0.9" />
                  {/* Detailed Patterns */}
                  <circle cx="35" cy="40" r="5" fill="black" opacity="0.3" />
                  <circle cx="65" cy="40" r="5" fill="black" opacity="0.3" />
                  <path d="M30,55 L40,50" stroke="white" opacity="0.2" />
                  <path d="M70,55 L60,50" stroke="white" opacity="0.2" />
                </g>
                {/* Body */}
                <ellipse cx="50" cy="55" rx="5" ry="15" fill="currentColor" />
                {/* Antennae */}
                <path d="M48,42 Q40,30 35,35" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M52,42 Q60,30 65,35" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          )}

          {/* Classic Butterfly */}
          {c.type === 'butterfly' && (
            <svg viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-[0_0_8px_currentColor]" style={{ transform: `scaleX(${Math.sin(c.flapState)})`, transformOrigin: 'center' }}>
               <path d="M12 2C12 2 11 3 11 5C11 7 12 12 12 12C12 12 13 7 13 5C13 3 12 2 12 2ZM8 6C6 5 2 6 2 9C2 12 5 13 6 12C5 14 5 18 9 17C9 17 8 12 8 6ZM16 6C18 5 22 6 22 9C22 12 19 13 18 12C19 14 19 18 15 17C15 17 16 12 16 6Z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

export default Butterflies;
