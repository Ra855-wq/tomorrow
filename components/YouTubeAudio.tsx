import React from 'react';

interface YouTubeAudioProps {
  isPlaying: boolean;
}

const YouTubeAudio: React.FC<YouTubeAudioProps> = ({ isPlaying }) => {
  if (!isPlaying) return null;

  return (
    <div className="absolute top-0 left-0 w-1 h-1 opacity-0 overflow-hidden pointer-events-none -z-50">
      <iframe 
        width="100%" 
        height="100%" 
        // 2012 Official Aftermovie ID, Autoplay enabled, Start at 0s
        src={`https://www.youtube.com/embed/UWb5Qc-fBvk?autoplay=1&controls=0&start=0&loop=1&playlist=UWb5Qc-fBvk&playsinline=1`} 
        title="Tomorrowland Audio" 
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen
      />
    </div>
  );
};

export default YouTubeAudio;