import React, { useEffect, useRef } from 'react';
import { Theme } from '../types';

interface WisdomParticlesProps {
  theme: Theme;
  trigger: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'leaf' | 'dust';
  rotation: number;
  rotationSpeed: number;
  wobble: number; // For leaves
}

const WisdomParticles: React.FC<WisdomParticlesProps> = ({ theme, trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (trigger === 0) return;
    spawnParticles();
  }, [trigger]);

  const spawnParticles = () => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;
    
    // Determine spawn origin (Center of screen generally looks best)
    const originX = width / 2;
    const originY = height / 2;

    const newParticles: Particle[] = [];
    const count = theme === Theme.LIFE ? 30 : 60; // Fewer leaves, more sparks/dust

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 2;
      
      let p: Particle = {
        x: originX,
        y: originY,
        vx: 0,
        vy: 0,
        life: 1,
        maxLife: 1,
        size: 0,
        color: '',
        type: 'spark',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: 0,
        wobble: Math.random() * Math.PI * 2,
      };

      if (theme === Theme.ADSCENDO) {
        // Golden Sparks (Upward momentum)
        p.type = 'spark';
        p.vx = Math.cos(angle) * speed * 2;
        p.vy = Math.sin(angle) * speed * 2 - 2; // Initial upward bias
        p.size = Math.random() * 3 + 1;
        p.maxLife = Math.random() * 60 + 40;
        p.life = p.maxLife;
        p.color = `rgba(251, 191, 36, ${Math.random() * 0.5 + 0.5})`; // Amber
      } else if (theme === Theme.LIFE) {
        // Swirling Leaves
        p.type = 'leaf';
        // Spread out initially
        p.x = originX + (Math.random() - 0.5) * 100;
        p.y = originY + (Math.random() - 0.5) * 100;
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = (Math.random() - 0.5) * 2;
        p.size = Math.random() * 8 + 4;
        p.maxLife = Math.random() * 100 + 80;
        p.life = p.maxLife;
        p.color = Math.random() > 0.5 ? '#4ADE80' : '#F472B6'; // Green or Pink
        p.rotationSpeed = (Math.random() - 0.5) * 0.1;
      } else {
        // Classic Magic Dust
        p.type = 'dust';
        p.vx = Math.cos(angle) * speed * 1.5;
        p.vy = Math.sin(angle) * speed * 1.5;
        p.size = Math.random() * 4 + 1;
        p.maxLife = Math.random() * 80 + 50;
        p.life = p.maxLife;
        const colors = ['#A855F7', '#60A5FA', '#22D3EE']; // Purple, Blue, Cyan
        p.color = colors[Math.floor(Math.random() * colors.length)];
      }

      newParticles.push(p);
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    if (!animationRef.current) {
      animate();
    }
  };

  const animate = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    
    // Update and Draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life--;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Physics
      const lifeRatio = p.life / p.maxLife;
      const alpha = lifeRatio; // Fade out

      if (p.type === 'spark') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gravity/Drag
        p.vx *= 0.95;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
      } 
      else if (p.type === 'leaf') {
        p.x += p.vx + Math.sin(p.wobble) * 0.5;
        p.y += p.vy;
        p.wobble += 0.05;
        p.rotation += p.rotationSpeed;
        
        ctx.globalAlpha = alpha;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        // Draw leaf shape (ellipse with points)
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
      } 
      else { // Dust
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96; // High friction
        p.vy *= 0.96;
        
        // Twinkle effect
        const twinkle = Math.random() * 0.5 + 0.5;
        
        ctx.globalAlpha = alpha * twinkle;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2); // Shrink
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
      }
    }

    ctx.shadowBlur = 0; // Reset
    ctx.globalAlpha = 1;

    if (particles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      animationRef.current = null;
    }
  };

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

export default WisdomParticles;
