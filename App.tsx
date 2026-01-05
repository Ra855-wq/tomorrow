
import React, { useState, useEffect, useRef } from 'react';
import Portal from './components/Portal';
import Butterflies from './components/Butterflies';
import Visualizer from './components/Visualizer';
import YouTubeAudio from './components/YouTubeAudio';
import WisdomParticles from './components/WisdomParticles';
import CosmicBackground from './components/CosmicBackground';
import { Theme, ChatMessage } from './types';
import { audioEngine } from './services/audioService';
import { generateWisdom } from './services/geminiService';
import { Sparkles, Music, BookOpen, Volume2, VolumeX, Send, Loader2, X } from 'lucide-react';

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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleEnter = async () => {
    setIsLoading(true);
    audioEngine.init();
    audioEngine.startSimulation();
    audioEngine.playAmbience(theme);
    
    setTimeout(() => {
      setHasEntered(true);
      setIsLoading(false);
    }, 2500); 
  };

  const toggleMute = () => {
    if (isMuted) {
       audioEngine.startSimulation();
       audioEngine.playAmbience(theme);
       setIsMuted(false);
    } else {
       audioEngine.stop();
       setIsMuted(true);
    }
  };

  const switchTheme = (newTheme: Theme) => {
    if (newTheme === theme) return;
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
    setWisdomTrigger(Date.now());
  };

  return (
    <div className="relative min-h-screen w-full transition-all duration-2000 text-white overflow-hidden bg-black">
      
      {/* Background Magic */}
      <CosmicBackground theme={theme} />
      <Butterflies theme={theme} />
      {hasEntered && <WisdomParticles theme={theme} trigger={wisdomTrigger} />}

      {/* Background Audio Source */}
      {hasEntered && !isMuted && <YouTubeAudio isPlaying={true} />}

      {/* Audio Visualizer (Bottom) */}
      <Visualizer theme={theme} active={!isMuted && hasEntered} />

      {/* Main Content Area */}
      <div className="relative z-20 flex flex-col h-screen">
        
        {/* Header */}
        {hasEntered && (
          <header className="absolute top-0 w-full p-8 flex justify-between items-start z-50 animate-fade-in transition-all duration-1000">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 p-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <button 
                  onClick={() => switchTheme(Theme.ADSCENDO)}
                  className={`px-6 py-2 rounded-full font-cinzel text-xs tracking-widest transition-all duration-500 ${theme === Theme.ADSCENDO ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'hover:bg-white/5 text-white/60'}`}
                >
                  ADSCENDO
                </button>
                <button 
                  onClick={() => switchTheme(Theme.LIFE)}
                  className={`px-6 py-2 rounded-full font-cinzel text-xs tracking-widest transition-all duration-500 ${theme === Theme.LIFE ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'hover:bg-white/5 text-white/60'}`}
                >
                  LIFE
                </button>
                <button 
                  onClick={() => switchTheme(Theme.CLASSIC)}
                  className={`px-6 py-2 rounded-full font-cinzel text-xs tracking-widest transition-all duration-500 ${theme === Theme.CLASSIC ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(129,140,248,0.5)]' : 'hover:bg-white/5 text-white/60'}`}
                >
                  CLASSIC
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={toggleMute} className="p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-white/20 transition-all text-white/80 shadow-lg">
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <button 
                onClick={() => setOracleOpen(!oracleOpen)}
                className={`p-4 rounded-full bg-gradient-to-br from-purple-900/80 to-indigo-900/80 backdrop-blur-xl border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:scale-110 ${oracleOpen ? 'rotate-90' : ''}`}
              >
                <BookOpen size={24} />
              </button>
            </div>
          </header>
        )}

        {/* Center Stage */}
        <main className="flex-grow flex items-center justify-center">
          {!hasEntered ? (
            <Portal theme={theme} onEnter={handleEnter} isLoading={isLoading} />
          ) : (
             <div className="text-center animate-fade-in px-4 pointer-events-none select-none">
                <div className="relative inline-block">
                   <div className="absolute -inset-16 bg-white/5 blur-[100px] rounded-full" />
                   <h1 className="relative text-5xl md:text-9xl font-cinzel font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-600 drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-[2000ms]">
                    TOMORROWLAND
                  </h1>
                </div>
                <p className="mt-8 text-xl md:text-3xl font-light tracking-[0.4em] text-white/70 uppercase transition-all duration-[2000ms]">
                  Live Today, Love Tomorrow, Unite Forever
                </p>
                <div className="mt-12 flex justify-center gap-2 opacity-30">
                   <span className="w-1 h-1 bg-white rounded-full" />
                   <span className="w-12 h-[1px] bg-white self-center" />
                   <span className="w-1 h-1 bg-white rounded-full" />
                </div>
             </div>
          )}
        </main>
      </div>

      {/* Enhanced Oracle Drawer */}
      {hasEntered && (
        <div className={`fixed right-0 top-0 bottom-0 w-full md:w-[450px] z-[100] transition-all duration-700 ease-in-out transform ${oracleOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="h-full bg-black/85 backdrop-blur-3xl border-l border-white/10 flex flex-col shadow-[-30px_0_60px_rgba(0,0,0,0.8)]">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-cinzel text-purple-200 tracking-widest">The Oracle</h2>
                  <p className="text-[10px] text-purple-400/60 uppercase tracking-[0.3em] mt-1">Bearer of Tomorrow's Truth</p>
                </div>
                <button onClick={() => setOracleOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-8 space-y-6 scroll-smooth">
                {conversation.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                    <Sparkles size={40} className="text-purple-400 animate-pulse" />
                    <p className="font-serif italic text-lg text-purple-100">"Speak your heart, and the magic of Tomorrow shall answer."</p>
                  </div>
                )}
                {conversation.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                    <span className="text-[9px] uppercase tracking-widest mb-1 opacity-40 font-cinzel">
                      {msg.role === 'user' ? 'Seeker' : 'Oracle'}
                    </span>
                    <div className={`max-w-[90%] p-5 rounded-2xl shadow-xl transition-all ${
                      msg.role === 'user' 
                      ? 'bg-indigo-600/20 border border-indigo-400/20 text-white rounded-tr-none' 
                      : 'bg-purple-900/20 border border-purple-400/20 text-purple-100 rounded-tl-none font-serif italic text-lg leading-relaxed'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-center gap-3 text-purple-400 animate-pulse">
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span className="text-xs font-cinzel tracking-widest">Consulting the Stars...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleOracleSubmit} className="p-8 bg-black/40 border-t border-white/10">
                <div className="relative group">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Whisper your question..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-6 pr-16 focus:outline-none focus:border-purple-500/50 text-white transition-all group-hover:border-white/20"
                  />
                  <button 
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:grayscale transition-all shadow-lg"
                  >
                    <Send size={18} />
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
