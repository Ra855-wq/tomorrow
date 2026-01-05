import React, { useState } from 'react';
import { Theme } from '../types';
import { Loader2, Sparkles } from 'lucide-react';

interface PortalProps {
  theme: Theme;
  onEnter: () => void;
  isLoading: boolean;
}

const Portal: React.FC<PortalProps> = ({ theme, onEnter, isLoading }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPortalColors = () => {
    switch (theme) {
      case Theme.ADSCENDO:
        return {
          ring: 'border-amber-400',
          glow: 'shadow-[0_0_80px_rgba(251,191,36,0.6)]',
          glowRgb: 'rgba(251,191,36,0.8)',
          inner: 'bg-gradient-to-br from-amber-900 via-amber-700 to-black',
          text: 'text-amber-100',
          accent: 'bg-amber-400'
        };
      case Theme.LIFE:
        return {
          ring: 'border-emerald-400',
          glow: 'shadow-[0_0_80px_rgba(16,185,129,0.6)]',
          glowRgb: 'rgba(16,185,129,0.8)',
          inner: 'bg-gradient-to-br from-emerald-900 via-emerald-700 to-black',
          text: 'text-emerald-100',
          accent: 'bg-emerald-400'
        };
      default:
        return {
          ring: 'border-indigo-400',
          glow: 'shadow-[0_0_80px_rgba(129,140,248,0.6)]',
          glowRgb: 'rgba(129,140,248,0.8)',
          inner: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black',
          text: 'text-indigo-100',
          accent: 'bg-indigo-400'
        };
    }
  };

  const colors = getPortalColors();

  return (
    <div className="relative flex items-center justify-center h-screen w-full perspective-1000">
      
      {/* Decorative Rotating Rings */}
      <div className={`absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border-2 border-dashed opacity-20 animate-[spin_30s_linear_infinite] ${colors.ring}`} />
      <div className={`absolute w-[450px] h-[450px] md:w-[650px] md:h-[650px] rounded-full border border-opacity-30 animate-[spin_20s_linear_infinite_reverse] ${colors.ring}`} />
      
      {/* Magic Runes / Particles around portal */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] animate-pulse">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${colors.accent} blur-[2px]`} />
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${colors.accent} blur-[2px]`} />
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${colors.accent} blur-[2px]`} />
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${colors.accent} blur-[2px]`} />
        </div>
      </div>

      {/* The Core Portal */}
      <button
        onClick={onEnter}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ '--glow-color': colors.glowRgb } as React.CSSProperties}
        className={`
          relative z-10 w-72 h-72 md:w-96 md:h-96 rounded-full 
          border-[6px] ${colors.ring} ${colors.glow} ${colors.inner}
          flex items-center justify-center transition-all duration-700 ease-in-out
          cursor-pointer group overflow-hidden
          ${isHovered ? 'scale-110 animate-portal-glow' : 'scale-100'}
        `}
      >
        {/* Swirling Background inside with Enhanced Zoom */}
        <div className={`
          absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] 
          animate-[spin_60s_linear_infinite] transition-transform duration-1000 ease-out
          ${isHovered ? 'scale-150' : 'scale-100'}
        `} />
        
        {/* Glowing aura */}
        <div className={`absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />

        {/* Text / Content */}
        <div className={`relative z-20 flex flex-col items-center text-center p-8 transition-transform duration-500 ${isHovered ? 'scale-110 translate-z-10' : 'scale-100'}`}>
          {isLoading ? (
             <div className="flex flex-col items-center">
                <Loader2 className={`w-16 h-16 animate-spin ${colors.text} mb-4`} />
                <span className={`font-cinzel tracking-[0.3em] ${colors.text} animate-pulse`}>Opening Reality...</span>
             </div>
          ) : (
            <>
              <Sparkles className={`w-8 h-8 mb-4 ${colors.text} opacity-50 group-hover:opacity-100 group-hover:scale-125 transition-all`} />
              <h1 className={`font-cinzel text-4xl md:text-5xl font-bold tracking-[0.2em] ${colors.text} drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mb-4 transition-all ${isHovered ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]' : ''}`}>
                REVEAL
              </h1>
              <div className={`h-[1px] w-24 ${colors.accent} opacity-50 mb-4 transition-all duration-700 group-hover:w-48 group-hover:opacity-100 group-hover:shadow-[0_0_10px_currentColor]`} />
              <p className={`font-serif text-sm md:text-base tracking-[0.4em] opacity-80 uppercase ${colors.text} group-hover:opacity-100 transition-opacity`}>
                Live Today, Love Tomorrow
              </p>
            </>
          )}
        </div>
      </button>

      {/* Magical Floor Reflection */}
      <div className={`absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent z-0 pointer-events-none opacity-60`} />
    </div>
  );
};

export default Portal;