import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Theme } from '../types';

interface CosmicBackgroundProps {
  theme: Theme;
}

interface CursorParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ theme }) => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [pixelMouse, setPixelMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<CursorParticle[]>([]);
  const requestRef = useRef<number | null>(null);

  const stars = useMemo(() => {
    return Array.from({ length: 450 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() < 0.8 ? Math.random() * 1 + 0.5 : Math.random() * 2 + 1,
      duration: Math.random() * 5 + 3,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.6 + 0.2,
      parallaxFactor: Math.random() * 20 + 5,
    }));
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case Theme.ADSCENDO:
        return {
          primary: 'rgba(251, 191, 36, 0.2)',
          secondary: 'rgba(180, 83, 9, 0.15)',
          accent: 'rgba(253, 230, 138, 0.1)',
          interactive: 'rgba(251, 191, 36, 0.25)',
          particle: '#fbbf24' // Amber-400
        };
      case Theme.LIFE:
        return {
          primary: 'rgba(16, 185, 129, 0.2)',
          secondary: 'rgba(6, 95, 70, 0.15)',
          accent: 'rgba(236, 72, 153, 0.1)',
          interactive: 'rgba(52, 211, 153, 0.25)',
          particle: '#10b981' // Emerald-500
        };
      default:
        return {
          primary: 'rgba(79, 70, 229, 0.2)',
          secondary: 'rgba(49, 46, 129, 0.15)',
          accent: 'rgba(168, 85, 247, 0.1)',
          interactive: 'rgba(129, 140, 248, 0.25)',
          particle: '#818cf8' // Indigo-400
        };
    }
  };

  const colors = getThemeColors();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
      setPixelMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation logic for interactive particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Spawn particles near mouse
      if (Math.random() > 0.3) {
        particlesRef.current.push({
          x: pixelMouse.x + (Math.random() - 0.5) * 40,
          y: pixelMouse.y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 1, // Slight upward drift
          life: 1.0,
          maxLife: 0.01 + Math.random() * 0.02,
          size: Math.random() * 3 + 1,
          color: colors.particle
        });
      }

      // Update and Draw
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.maxLife;

        if (p.life > 0) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Glow effect for larger particles
          if (p.size > 2) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
          } else {
            ctx.shadowBlur = 0;
          }
          return true;
        }
        return false;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [pixelMouse, colors.particle]);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[#020206]">
      {/* Base Nebula Layers with Slow Swirling & Drifting */}
      <div 
        className="absolute inset-0 transition-all duration-[4000ms] ease-in-out mix-blend-screen animate-nebula-swirl"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${colors.primary} 0%, transparent 65%)`,
          transform: `translate(${(mousePos.x - 0.5) * -30}px, ${(mousePos.y - 0.5) * -30}px)`
        }}
      />
      <div 
        className="absolute inset-0 transition-all duration-[4000ms] ease-in-out mix-blend-screen animate-nebula-drift"
        style={{
          background: `radial-gradient(circle at 80% 70%, ${colors.secondary} 0%, transparent 75%)`,
          transform: `translate(${(mousePos.x - 0.5) * 40}px, ${(mousePos.y - 0.5) * 40}px)`
        }}
      />
      <div 
        className="absolute inset-0 transition-all duration-[4000ms] ease-in-out mix-blend-screen animate-pulse-slow"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.accent} 0%, transparent 85%)`,
          animationDuration: '15s',
          transform: `translate(${(mousePos.x - 0.5) * -15}px, ${(mousePos.y - 0.5) * -15}px)`
        }}
      />

      {/* Interactive Cursor Nebula Glow */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 mix-blend-screen opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${colors.interactive} 0%, transparent 30%)`,
        }}
      />

      {/* Interactive Particles Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-10 opacity-60 mix-blend-screen"
      />

      {/* Deep Space Nebula Detail */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-color-dodge"
        style={{
          background: `linear-gradient(${theme === Theme.LIFE ? '135deg' : '45deg'}, transparent, ${colors.primary}, transparent)`,
        }}
      />

      {/* Stardust texture */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      {/* Stars with Parallax and Pulse */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full transition-opacity duration-[2000ms]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow: star.size > 1.2 ? `0 0 ${star.size * 4}px rgba(255,255,255,0.7)` : 'none',
            transform: `translate(${(mousePos.x - 0.5) * star.parallaxFactor}px, ${(mousePos.y - 0.5) * star.parallaxFactor}px)`,
            animation: `pulse ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      
      {/* Modern Mainstage Screen Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04))] bg-[length:100%_3px,4px_100%]" />
    </div>
  );
};

export default CosmicBackground;