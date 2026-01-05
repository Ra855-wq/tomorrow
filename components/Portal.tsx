import React, { useState } from 'react';
import { Theme } from '../types';
import { Loader2 } from 'lucide-react';

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
          glow: 'shadow-[0_0_50px_rgba(251,191,36,0.6)]',
          inner: 'bg-gradient-to-br from-amber-900 to-black',
          text: 'text-amber-100'
        };
      case Theme.LIFE:
        return {
          ring: 'border-pink-400',
          glow: 'shadow-[0_0_50px_rgba(244,114,182,0.6)]',
          inner: 'bg-gradient-to-br from-emerald-900 to-black',
          text: 'text-pink-100'
        };
      default:
        return {
          ring: 'border-cyan-400',
          glow: 'shadow-[0_0_50px_rgba(34,211,238,0.6)]',
          inner: 'bg-gradient-to-br from-slate-900 to-black',
          text: 'text-cyan-100'
        };
    }
  };

  const colors = getPortalColors();

  return (
    <div className="relative flex items-center justify-center h-screen w-full perspective-1000 overflow-hidden">
      
      {/* Outer Rotating Rings */}
      <div className={`absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full border border-opacity-30 animate-[spin_10s_linear_infinite] ${colors.ring}`} />
      <div className={`absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-dashed border-opacity-40 animate-[spin_15s_linear_infinite_reverse] ${colors.ring}`} />
      
      {/* The Core Portal */}
      <button
        onClick={onEnter}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative z-10 w-64 h-64 md:w-80 md:h-80 rounded-full 
          border-4 ${colors.ring} ${colors.glow} ${colors.inner}
          flex items-center justify-center transition-all duration-700 ease-in-out
          cursor-pointer group
          ${isHovered ? 'scale-110 shadow-[0_0_100px_rgba(255,255,255,0.4)]' : 'scale-100'}
        `}
      >
        <div className="absolute inset-0 rounded-full bg-black opacity-40 group-hover:opacity-0 transition-opacity duration-500" />
        
        {/* Magical Texture inside Portal */}
        <div className="absolute inset-2 rounded-full overflow-hidden">
           <div className={`w-full h-full opacity-60 bg-[url('https://picsum.photos/400/400?blur=5')] bg-cover animate-pulse-slow`} />
           <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>

        {/* Text / Content */}
        <div className="relative z-20 flex flex-col items-center text-center p-4">
          {isLoading ? (
             <Loader2 className={`w-12 h-12 animate-spin ${colors.text}`} />
          ) : (
            <>
              <h1 className={`font-cinzel text-3xl md:text-4xl font-bold tracking-widest ${colors.text} drop-shadow-lg mb-2`}>
                ENTER
              </h1>
              <p className={`font-serif text-xs md:text-sm tracking-widest opacity-80 uppercase ${colors.text}`}>
                The Portal Opens
              </p>
            </>
          )}
        </div>
      </button>

      {/* Floor reflection simulation */}
      <div className={`absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black via-black to-transparent z-0 pointer-events-none`} />
    </div>
  );
};

export default Portal;
