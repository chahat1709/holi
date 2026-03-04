import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Download, PartyPopper, Sparkles, Volume2, VolumeX, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ParticleBackground from './components/ParticleBackground';
import BalloonSplash from './components/BalloonSplash';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Mixing vibrant colors...");
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      const messages = [
        "Mixing vibrant colors...",
        "Adding water...",
        "Rendering 8K masterpiece...",
        "Applying cinematic lighting...",
        "Almost ready..."
      ];
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMessage(messages[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const prompt = `A cinematic, hyper-realistic 3D render of a slow-motion Holi powder explosion. Vibrant neon gulal powder in vivid magenta, cyan, sunshine yellow, and glowing purple colliding in mid-air. The background is a sleek, pitch-black void (#0A0A0A) for maximum contrast. Floating in the center is a subtle, frosted glassmorphism UI card with the words "HAPPY HOLI FROM CHAHAT JAIN" in a bold, modern, glowing sans-serif font. High-fidelity particle simulation, volumetric bloom lighting, ray-traced HDRI reflections, cinematic glow, 8k resolution, rendered in Unreal Engine 5 and Octane Render, ultra-detailed.`;

  const generateImage = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setImageUrl(`data:image/png;base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        setError('Oops! The colors didn\'t mix right this time.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Something went wrong while throwing the colors.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
      setIsPlayingMusic(!isPlayingMusic);
    }
  };

  const handleThrowColors = () => {
    setShowSplash(true);
    // Wait for the 3D balloon to fly up (800ms) before starting the generation loader
    setTimeout(() => {
      generateImage();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500/30 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Balloon Splash Animation Overlay */}
      <AnimatePresence>
        {showSplash && <BalloonSplash onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* Background Music Player */}
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
        loop 
      />
      
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleMusic}
          className={`backdrop-blur-md border shadow-lg px-4 py-3 rounded-full font-medium flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ${
            isPlayingMusic 
              ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]' 
              : 'bg-black/50 border-white/10 text-white/70'
          }`}
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span className="text-sm tracking-wide">Rang Barse Playing</span>
            </>
          ) : (
            <>
              <VolumeX className="w-5 h-5" />
              <span className="text-sm tracking-wide">Play Music</span>
            </>
          )}
          <Music className={`w-4 h-4 ml-1 ${isPlayingMusic ? 'animate-bounce' : 'opacity-50'}`} />
        </button>
      </div>

      {/* 3D WebGL Particle Background */}
      <ParticleBackground />

      {/* Festive colorful powder clouds in the background - OLED optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-20 -right-32 w-[700px] h-[700px] bg-yellow-500/20 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute -bottom-40 left-1/4 w-[800px] h-[800px] bg-cyan-600/20 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-10"
      >
        <div className="text-center space-y-6 backdrop-blur-md bg-black/40 p-8 rounded-3xl border border-white/10 shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 shadow-sm border border-white/10 text-sm font-medium text-pink-400 uppercase tracking-wide mb-2"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Festival of Colors</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 pb-2 drop-shadow-sm">
            Happy Holi
          </h1>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 italic mb-4"
          >
            from Chahat Jain
          </motion.div>
          
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Wishing you a Holi filled with sweet moments, colorful memories, and endless joy. May the vibrant hues of this festival paint your life with love and happiness!
          </p>
        </div>

        {/* Image Canvas */}
        <div className="w-full aspect-video relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-black/60 backdrop-blur-xl shadow-[0_0_80px_-15px_rgba(236,72,153,0.2)] border border-white/10 flex items-center justify-center group">
          <AnimatePresence mode="wait">
            {imageUrl ? (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                className="w-full h-full relative rounded-2xl md:rounded-[2.5rem] overflow-hidden"
              >
                <img 
                  src={imageUrl} 
                  alt="Generated Holi Render" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                  <a 
                    href={imageUrl} 
                    download="happy-holi.png"
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105 px-6 py-3 rounded-full font-bold shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Download className="w-5 h-5" />
                    Save Memory
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 text-white/40 p-8 text-center"
              >
                {isGenerating ? (
                  <>
                    <div className="relative">
                      <Loader2 className="w-16 h-16 animate-spin text-pink-500" />
                      <div className="absolute inset-0 bg-pink-500 blur-xl opacity-40 rounded-full animate-pulse" />
                    </div>
                    <span className="font-medium text-lg text-white/70 animate-pulse transition-all duration-500">
                      {loadingMessage}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 shadow-inner flex items-center justify-center mb-2">
                      <Sparkles className="w-10 h-10 text-pink-400" />
                    </div>
                    <span className="font-medium text-lg text-white/50">
                      Tap below to throw colors
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleThrowColors}
            disabled={isGenerating || showSplash}
            className="relative overflow-hidden group bg-gradient-to-r from-pink-500 to-orange-400 text-white px-10 py-5 rounded-full font-bold text-xl shadow-[0_10px_40px_-10px_rgba(236,72,153,0.8)] transition-all hover:shadow-[0_20px_50px_-10px_rgba(236,72,153,1)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-3">
              {isGenerating ? 'Creating Magic...' : 'Throw Colors!'}
            </span>
          </button>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-pink-400 font-medium bg-pink-500/10 px-6 py-3 rounded-full border border-pink-500/20 shadow-sm max-w-2xl text-center backdrop-blur-md"
            >
              {error}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
