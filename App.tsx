import React, { useState, useEffect, useRef } from 'react';
import Portal from './components/Portal';
import Butterflies from './components/Butterflies';
import Visualizer from './components/Visualizer';
import YouTubeAudio from './components/YouTubeAudio';
import WisdomParticles from './components/WisdomParticles';
import { Theme, ChatMessage } from './types';
import { audioEngine } from './services/audioService';
import { generateWisdom } from './services/geminiService';
import { Sparkles, Music, BookOpen, Volume2, VolumeX, Send, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.CLASSIC);
  const [hasEntered, setHasEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Oracle State
  const [oracleOpen, setOracleOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Visual Effect Triggers
  const [wisdomTrigger, setWisdomTrigger] = useState(0);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleEnter = async () => {
    setIsLoading(true);
    
    // Resume audio context first (user gesture)
    audioEngine.init();

    // Start Audio Simulation for Visualizer (syncs with YouTube visually)
    audioEngine.startSimulation();
    
    // Start Ambient Soundscape
    audioEngine.playAmbience(theme);
    
    // Short artificial delay for the "Portal Opening" animation
    setTimeout(() => {
      setHasEntered(true);
      setIsLoading(false);
    }, 2000); 
  };

  const toggleMute = () => {
    // Note: We can't programmatically mute the YouTube iframe easily without the API, 
    // but in this concept, 'Mute' toggles the experience state.
    // Here we will stop/start the ambience and visualizer simulation.
    if (isMuted) {
       // Unmute
       audioEngine.startSimulation();
       audioEngine.playAmbience(theme);
       setIsMuted(false);
    } else {
       // Mute
       audioEngine.stop();
       setIsMuted(true);
    }
  };

  const switchTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (!isMuted && hasEntered) {
      audioEngine.playAmbience(newTheme);
    }
  };

  const handleOracleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: prompt };
    setConversation(prev => [...prev, userMsg]);
    setPrompt('');
    setIsGenerating(true);

    const wisdom = await generateWisdom(userMsg.text, theme);
    
    setConversation(prev => [...prev, { role: 'model', text: wisdom }]);
    setIsGenerating(false);
    
    // Trigger the magical particle effect
    setWisdomTrigger(Date.now());
  };

  // Background Gradient Logic
  const getBackground = () => {
    switch(theme) {
      case Theme.ADSCENDO: return 'bg-gradient-to-b from-[#1a1200] via-[#2e1d05] to-black';
      case Theme.LIFE: return 'bg-gradient-to-b from-[#0f1f14] via-[#1a2e22] to-black';
      default: return 'bg-gradient-to-b from-[#0d0b1f] via-[#16123a] to-black';
    }
  };

  return (
    <div className={`relative min-h-screen w-full transition-colors duration-1000 ${getBackground()} text-white overflow-hidden`}>
      
      {/* Background Audio Source */}
      {/* We mount it on enter to ensure autoplay works via user interaction */}
      {hasEntered && !isMuted && <YouTubeAudio isPlaying={true} />}

      {/* Dynamic Background Elements */}
      <Butterflies theme={theme} />
      <WisdomParticles theme={theme} trigger={wisdomTrigger} />
      
      {/* Audio Visualizer (Bottom) */}
      <Visualizer theme={theme} active={!isMuted && hasEntered} />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col h-screen">
        
        {/* Header (Only visible after entry) */}
        {hasEntered && (
          <header className="absolute top-0 w-full p-6 flex justify-between items-center z-50 animate-fade-in">
            <div className="flex gap-4">
              <button 
                onClick={() => switchTheme(Theme.ADSCENDO)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border border-opacity-30 backdrop-blur-md transition-all ${theme === Theme.ADSCENDO ? 'bg-amber-900/50 border-amber-500 text-amber-200' : 'bg-black/30 border-white/20 hover:bg-white/10'}`}
              >
                <Sparkles size={16} /> <span className="hidden md:inline font-cinzel">Adscendo</span>
              </button>
              <button 
                onClick={() => switchTheme(Theme.LIFE)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border border-opacity-30 backdrop-blur-md transition-all ${theme === Theme.LIFE ? 'bg-emerald-900/50 border-emerald-500 text-emerald-200' : 'bg-black/30 border-white/20 hover:bg-white/10'}`}
              >
                <Music size={16} /> <span className="hidden md:inline font-cinzel">Life</span>
              </button>
            </div>

            <div className="flex gap-4">
              <button onClick={toggleMute} className="p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/20 hover:bg-white/10 transition-all">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button 
                onClick={() => setOracleOpen(!oracleOpen)}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all"
              >
                <BookOpen size={18} /> <span className="font-cinzel font-bold">Oracle</span>
              </button>
            </div>
          </header>
        )}

        {/* Center Stage */}
        <main className="flex-grow flex items-center justify-center">
          {!hasEntered ? (
            <Portal theme={theme} onEnter={handleEnter} isLoading={isLoading} />
          ) : (
             <div className="text-center animate-pulse-slow px-4">
                <h1 className="text-4xl md:text-8xl font-cinzel font-bold tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  {theme === Theme.ADSCENDO ? 'ADSCENDO' : theme === Theme.LIFE ? 'LIFE' : 'TOMORROWLAND'}
                </h1>
                <p className="mt-6 text-lg md:text-2xl font-light tracking-[0.3em] text-white/80 uppercase">
                  {theme === Theme.ADSCENDO ? 'Witness the Rise' : theme === Theme.LIFE ? 'Nature Reclaims' : 'Yesterday is History, Today is a Gift'}
                </p>
                <p className="mt-2 text-xs md:text-sm tracking-widest text-white/50">
                   Tomorrow is a Mystery
                </p>
             </div>
          )}
        </main>
      </div>

      {/* Oracle / Book of Wisdom Modal/Overlay */}
      {hasEntered && oracleOpen && (
        <div className="absolute right-0 top-20 md:top-24 bottom-24 w-full md:w-[400px] z-40 p-4 transition-transform duration-500 ease-out translate-x-0">
          <div className="w-full h-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Oracle Header */}
            <div className="p-4 border-b border-white/10 bg-black/40">
              <h2 className="text-xl font-cinzel text-center text-purple-200">The Book of Wisdom</h2>
              <p className="text-xs text-center text-purple-200/50 uppercase tracking-widest">Ask and receive guidance</p>
            </div>

            {/* Chat Area */}
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
              {conversation.length === 0 && (
                <div className="text-center text-white/30 italic mt-10">
                  "I have seen the past and the future... what do you wish to know?"
                </div>
              )}
              {conversation.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600/50 text-white rounded-br-none' 
                    : 'bg-purple-900/40 text-purple-100 border border-purple-500/20 rounded-bl-none font-serif italic'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isGenerating && (
                 <div className="flex justify-start">
                   <div className="bg-purple-900/40 p-3 rounded-lg rounded-bl-none">
                     <Loader2 className="animate-spin w-4 h-4 text-purple-300" />
                   </div>
                 </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleOracleSubmit} className="p-4 bg-black/40 border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask the Oracle..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-purple-500/50 text-sm transition-colors"
                />
                <button 
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;