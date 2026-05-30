import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Waves, 
  Sparkles, 
  RotateCcw, 
  Smile, 
  Activity, 
  BookOpen, 
  HelpCircle,
  TrendingUp,
  Volume2,
  VolumeX,
  Compass,
  Sparkle,
  Droplet,
  Shuffle,
  Info
} from 'lucide-react';

interface ArchimedesSimulationProps {
  onBack: () => void;
}

// Particle type for splashes and bubbles
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  color: string;
  opacity: number;
}

export default function ArchimedesSimulation({ onBack }: ArchimedesSimulationProps) {
  // 1. Interactive Control States
  const [liquidType, setLiquidType] = useState<number>(2); // 1 = Minyak (Light), 2 = Air (Medium), 3 = Air Garam (Heavy)
  const [materialType, setMaterialType] = useState<number>(1); // 1 = Kayu (Light), 2 = Karet (Medium), 3 = Besi (Heavy)
  const [isDropTriggered, setIsDropTriggered] = useState<boolean>(true); // initially dropped
  const [dropCounter, setDropCounter] = useState<number>(1); // incremental key to trigger restart of framer animations
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  
  // Particles for splash ripples & bubbles
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef<number>(0);

  // Audio synthesizer references for Archimedes water-bloop sounds
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Web Audio API
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    } catch (e) {
      console.warn("Audio init failed: ", e);
    }
  };

  const playSynthesizerSound = (type: 'splash' | 'bloop' | 'tick' | 'wood' | 'metal') => {
    if (!isAudioEnabled) return;
    if (!audioCtxRef.current) initAudio();
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const now = audioCtxRef.current.currentTime;
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      if (type === 'splash') {
        // High frequency soft splash sweep downwards
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.35);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      } else if (type === 'bloop') {
        // Short liquid bubble sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      } else if (type === 'wood') {
        // Hollow triangle sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else if (type === 'metal') {
        // High metallic bell-like sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      } else {
        // standard tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      }

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(now + 0.4);
    }
  };

  // Sound response when selecting sliders
  const handleControlChange = (type: 'liquid' | 'material', value: number) => {
    if (type === 'liquid') {
      setLiquidType(value);
      playSynthesizerSound('tick');
    } else {
      setMaterialType(value);
      if (value === 1) playSynthesizerSound('wood');
      else if (value === 2) playSynthesizerSound('bloop');
      else playSynthesizerSound('metal');
    }
    // Automatically re-trigger a freshwater splash drop animation on state change!
    triggerDropAction();
  };

  // Re-trigger drop animation splash!
  const triggerDropAction = () => {
    setIsDropTriggered(false);
    setParticles([]);
    setTimeout(() => {
      setIsDropTriggered(true);
      setDropCounter(prev => prev + 1);
      // Play a high splash sound
      playSynthesizerSound('splash');
      
      // Spawn splash particles after a short time (representing transit drop duration)
      setTimeout(() => {
        spawnSplashParticles();
        playSynthesizerSound('bloop');
      }, 350);
    }, 40);
  };

  const handleAudioToggle = () => {
    if (!isAudioEnabled) {
      setIsAudioEnabled(true);
      if (!audioCtxRef.current) initAudio();
      setTimeout(() => playSynthesizerSound('bloop'), 50);
    } else {
      setIsAudioEnabled(false);
    }
  };

  // Physics mapping values
  const getMaterialLabel = () => {
    if (materialType === 1) return 'Kayu (Wood)';
    if (materialType === 2) return 'Karet (Rubber)';
    return 'Besi (Iron)';
  };

  const getLiquidLabel = () => {
    if (liquidType === 1) return 'Minyak (Oil)';
    if (liquidType === 2) return 'Air Tawar (Water)';
    return 'Air Garam (Saltwater)';
  };

  // Density logic value definitions
  // 1: Minyak (0.8), 2: Air (1.0), 3: Air Garam (1.2)
  // 1: Kayu (0.5), 2: Karet (1.0), 3: Besi (7.8)
  const getLiquidDensity = () => {
    if (liquidType === 1) return 0.8;
    if (liquidType === 2) return 1.0;
    return 1.2;
  };

  const getMaterialDensity = () => {
    if (materialType === 1) return 0.5;
    if (materialType === 2) return 1.0;
    return 7.8;
  };

  // Determine physical state result: Float vs Suspend vs Sink
  const getPhysicalState = () => {
    const matD = getMaterialDensity();
    const liqD = getLiquidDensity();

    if (matD < liqD) {
      return 'float'; // Mengapung
    } else if (matD === liqD) {
      return 'suspend'; // Melayang
    } else {
      return 'sink'; // Tenggelam
    }
  };

  // State speech bubbles based on requested logic
  const getSpeechBubbleText = () => {
    if (!isDropTriggered) {
      return "Ayo pilih cairan dan materialku, lalu cemplungkan! 💦";
    }

    const state = getPhysicalState();
    if (state === 'float') {
      return "Asyik, aku mengapung di atas! Materialku lebih ringan dari airnya! 🛶🌟";
    }
    if (state === 'suspend') {
      return "Wah, aku melayang di tengah-tengah! Massa jenis kita seimbang! 🧘‍♂️🌊";
    }
    return "Bloop bloop... Aku terlalu berat, langsung meluncur ke dasar! ⚓️🫧";
  };

  // Splash particle generator logic
  const spawnSplashParticles = () => {
    const liquidColor = liquidType === 1 ? '#FCD34D' : liquidType === 2 ? '#22D3EE' : '#2563EB';
    const newParticles: Particle[] = [];

    // Splash water droplets jumping upwards
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 0.1) + (Math.random() * Math.PI * 0.8); // angles upward (18deg to 162deg)
      const speed = 3 + Math.random() * 6;
      particleIdRef.current++;
      newParticles.push({
        id: particleIdRef.current,
        x: 185 + (Math.random() * 30 - 15), // center of splash (near drop axis)
        y: 114, // liquid top surface level inside tank
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        scale: 0.6 + Math.random() * 0.9,
        color: liquidColor,
        opacity: 0.9
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  // Continuous micro particle loops for air bubbles when suspended or sinking
  useEffect(() => {
    if (!isDropTriggered) return;
    const interval = setInterval(() => {
      const state = getPhysicalState();
      // Only release small bubbles if submerged (Suspend or Sunk bottom)
      if (state !== 'float') {
        const liquidColor = liquidType === 1 ? '#FBBF24' : liquidType === 2 ? '#67E8F9' : '#3B82F6';
        const startY = state === 'suspend' ? 215 + 20 : 310 + 20;
        
        particleIdRef.current++;
        const p: Particle = {
          id: particleIdRef.current,
          x: 185 + (Math.random() * 26 - 13),
          y: startY,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -1.2 - Math.random() * 1.5, // floats straight up
          scale: 0.4 + Math.random() * 0.5,
          color: liquidColor,
          opacity: 0.8
        };
        setParticles(prev => [...prev.slice(-30), p]); // keep array tiny
      }
    }, 450);

    return () => clearInterval(interval);
  }, [liquidType, materialType, isDropTriggered]);

  // Handle particle update animation loop using requestAnimationFrame standard
  useEffect(() => {
    let animFrame: number;
    const updatePhysics = () => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // gravity pulls splash down, but wait, bubbles float UP
            // If dry, let's customize bubble acceleration:
            ...(p.vy < 0 && p.vx <= 1 ? { vy: p.vy } : {}), // simple
            opacity: p.opacity - 0.02
          }))
          .filter(p => p.opacity > 0 && p.y < 420)
      );
      animFrame = requestAnimationFrame(updatePhysics);
    };
    animFrame = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Compute actual mascot coordinates:
  // Tank container width is 380px, height is 380px.
  // Horizontal center for mascot is 190.
  // Liquid top line starts at 114px from top (filling bottom 70% of 380px tank).
  // Y coordinate levels:
  // - Float: sits half submerged at top of liquid surface: roughly y = 114 - 28 = 86px.
  // - Suspend: sits exactly in middle of liquid: roughly y = 114 + 133 - 32 = 215px.
  // - Sink: rests on the floor bottom: Y = 380 - 64 = 316px.
  const getSubmergedY = () => {
    const s = getPhysicalState();
    if (s === 'float') return 86;
    if (s === 'suspend') return 215;
    return 312; // sink
  };

  // Determine animations values for Framer Motion transit
  const getFramerAnimateY = () => {
    if (!isDropTriggered) return -40; // holding wait high
    return getSubmergedY();
  };

  // Bobbing movement animation depending on float status
  const getBobbingYTransition = () => {
    const state = getPhysicalState();
    if (state === 'float') {
      return {
        y: {
          duration: 1.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      };
    } else if (state === 'suspend') {
      return {
        y: {
          duration: 3.2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      };
    }
    // Sinking has zero bobbing when touching floor
    return undefined;
  };

  const getBobbingOffset = () => {
    const state = getPhysicalState();
    if (state === 'float') return [0, 4];
    if (state === 'suspend') return [0, 2];
    return [0, 0];
  };

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Top Header Navigation Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#7C3AED] font-extrabold text-sm bg-white hover:bg-[#7C3AED]/5 border-2 border-[#7C3AED]/10 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3 animate-none"
            id="btn-archimedes-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Fluida: Mengapung & Tenggelam 🌊
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Materi: Gaya Ke Atas (Gaya Apung), Hukum Archimedes, & Massa Jenis Zat
          </p>
        </div>

        {/* Informative info badges tag status */}
        <div className="flex gap-2">
          <span className="bg-blue-50 text-blue-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-blue-200">
            <Waves className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            HUKUM ARCHIMEDES
          </span>
          <span className="bg-amber-100 text-amber-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            LAB FLUIDA INTERAKTIF
          </span>
        </div>
      </div>

      {/* Main Split Column Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Interactive panel controls: 30% width */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">🐳</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Konsol Archimedes
              </h2>
            </div>

            {/* Playful Sound synthesizer option */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-blue-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 tracking-wider uppercase">
                  🔊 Efek Nada Air (Audio)
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${isAudioEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                Ubah cairan dan material bola untuk mendengarkan frekuensi gelombang air Archimedes!
              </p>
              <button
                onClick={handleAudioToggle}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2 ${
                  isAudioEnabled 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-white hover:bg-slate-100 text-blue-600 border border-blue-200'
                }`}
                id="btn-archimedes-speakers-active"
              >
                {isAudioEnabled ? '🔈 AUDIO FLUIDA: AKTIF' : '🔈 AKTIFKAN AUDIO FLUIDA'}
              </button>
            </div>

            {/* Slider 1: Jenis Cairan */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-yellow-500/10 p-3.5 rounded-2xl border border-yellow-500/20">
                <span className="text-xs font-black text-slate-700 tracking-wider uppercase">
                  🧪 Jenis Cairan (ρ)
                </span>
                <span className="text-xs font-black text-white bg-amber-500 px-3 py-1 rounded-full uppercase">
                  {liquidType === 1 ? 'Minyak' : liquidType === 2 ? 'Air' : 'Air Garam'}
                </span>
              </div>
              
              <input 
                type="range"
                min="1"
                max="3"
                step="1"
                value={liquidType}
                onChange={(e) => handleControlChange('liquid', Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-[#F97316] outline-none"
                id="slider-liquid-type"
              />

              {/* Graphical quick selector boxes underneath */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => handleControlChange('liquid', 1)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase text-center border transition-all ${
                    liquidType === 1 
                      ? 'bg-[#EAB308] text-white border-[#CA8A04]' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Minyak (0.8)
                </button>
                <button
                  onClick={() => handleControlChange('liquid', 2)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase text-center border transition-all ${
                    liquidType === 2 
                      ? 'bg-cyan-500 text-white border-cyan-600' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Air (1.0)
                </button>
                <button
                  onClick={() => handleControlChange('liquid', 3)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase text-center border transition-all ${
                    liquidType === 3 
                      ? 'bg-blue-600 text-white border-blue-700' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Air Asin (1.2)
                </button>
              </div>
            </div>

            {/* Slider 2: Material Bola */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-purple-50 p-3.5 rounded-2xl border border-purple-100">
                <span className="text-xs font-black text-purple-700 tracking-wider uppercase">
                  ⚽ Material Bola (ρ)
                </span>
                <span className="text-xs font-black text-purple-600 bg-purple-100 px-3 py-1 rounded-full uppercase">
                  {getMaterialLabel()}
                </span>
              </div>

              <input 
                type="range"
                min="1"
                max="3"
                step="1"
                value={materialType}
                onChange={(e) => handleControlChange('material', Number(e.target.value))}
                className="w-full h-3 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600 outline-none"
                id="slider-material-type"
              />

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => handleControlChange('material', 1)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase text-center border transition-all ${
                    materialType === 1 
                      ? 'bg-amber-700 text-white border-amber-800' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Kayu (0.5)
                </button>
                <button
                  onClick={() => handleControlChange('material', 2)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase text-center border transition-all ${
                    materialType === 2 
                      ? 'bg-orange-500 text-white border-orange-600' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Karet (1.0)
                </button>
                <button
                  onClick={() => handleControlChange('material', 3)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase text-center border transition-all ${
                    materialType === 3 
                      ? 'bg-slate-600 text-white border-slate-700' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Besi (7.8)
                </button>
              </div>
            </div>

            {/* Chemistry & Fluid Dynamics Indicator Specifications */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full inline-block">
                METRIK MASSA JENIS (DENSITY)
              </span>
              <div className="space-y-1 text-slate-600 font-bold">
                <div className="flex justify-between">
                  <span>Massa Jenis Benda:</span>
                  <span className="text-purple-700 font-extrabold">{getMaterialDensity().toFixed(1)} g/cm³</span>
                </div>
                <div className="flex justify-between">
                  <span>Massa Jenis Cairan:</span>
                  <span className="text-sky-700 font-extrabold">{getLiquidDensity().toFixed(1)} g/cm³</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1">
                  <span>Kondisi Benda:</span>
                  <span className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                    getPhysicalState() === 'float' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : getPhysicalState() === 'suspend' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {getPhysicalState() === 'float' ? 'Mengapung' : getPhysicalState() === 'suspend' ? 'Melayang' : 'Tenggelam'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Squeeze / Re-drop Action button */}
          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={triggerDropAction}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs uppercase py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
              id="btn-archimedes-drop-action"
            >
              <Droplet className="w-4 h-4 text-white animate-bounce" />
              Cemplungkan! 💦
            </button>
          </div>

        </div>

        {/* Right Side Simulator Space Canvas Column: 70% width */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            className="w-full h-[450px] md:h-[480px] bg-white rounded-[32px] border-[3px] border-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.06)] relative overflow-hidden select-none"
            id="fluid-canvas"
          >
            {/* Grid background for technical blueprint feeling */}
            <div 
              className="absolute inset-0 opacity-[0.04] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#000000 1.5px, transparent 1.5px)', 
                backgroundSize: '24px 24px' 
              }} 
            />

            {/* Room environment visual details (shelves, science indicators) */}
            <div className="absolute top-4 left-6 pointer-events-none">
              <span className="text-[10px] text-slate-400 font-extrabold tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                🏫 LAB FISIKA FLUIDA TEKANAN
              </span>
            </div>

            {/* THE LARGE TRANSPARENT GLASS TANK */}
            {/* Sits at bottom half of canvas */}
            <div 
              className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 mt-12 md:mt-16 w-[380px] h-[380px] rounded-b-[32px] rounded-t-none border-l-[6px] border-r-[6px] border-b-[6px] border-slate-700 bg-white/40 backdrop-blur-xs shadow-[inset_0_12px_24px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.04)] relative overflow-visible flex flex-col justify-end"
              id="fluid-tank"
            >
              {/* Inside Grid for water depth levels */}
              <div className="absolute inset-0 opacity-[0.1] border-b border-dashed border-slate-500 pointer-events-none" style={{ backgroundSize: '100% 40px', backgroundImage: 'linear-gradient(to bottom, #64748b 1px, transparent 1px)' }} />

              {/* Water displacement volume height scale notches */}
              <div className="absolute right-4 top-10 bottom-6 w-5 flex flex-col justify-between text-[9px] text-slate-500 font-mono font-black border-l border-slate-300 pl-1 pointer-events-none z-30">
                <span>400ml</span>
                <span>300ml --</span>
                <span>200ml --</span>
                <span>100ml --</span>
                <span>0ml</span>
              </div>

              {/* Splash particle overlays */}
              {particles.map(p => (
                <div
                  key={p.id}
                  className="absolute rounded-full pointer-events-none z-[31]"
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                    width: `${p.scale * 6}px`,
                    height: `${p.scale * 6}px`,
                    backgroundColor: p.color,
                    opacity: p.opacity,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}

              {/* THE LIQUID LEVEL inside the tank */}
              {/* Fills the bottom 70% of the tank. Height is 70% = 266px out of 380px. */}
              {/* Liquid Y starts at 114px from top. */}
              <motion.div
                animate={{
                  height: '70%',
                }}
                className={`w-full relative origin-bottom transition-all duration-500 z-10 overflow-hidden rounded-b-[26px]`}
                style={{
                  backgroundColor: 
                    liquidType === 1 
                      ? 'rgba(252, 211, 77, 0.6)' // Minyak (gold/yellow)
                      : liquidType === 2 
                      ? 'rgba(34, 211, 238, 0.6)' // Air (cyan)
                      : 'rgba(37, 99, 235, 0.65)', // Air Asin (deeper blue)
                }}
              >
                {/* Wave effect overlay on the top surface of liquid */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-4 -mt-2 bg-gradient-to-t from-transparent via-white/50 to-transparent opacity-80 z-20 flex items-center justify-around overflow-hidden pointer-events-none`}
                >
                  <svg className="w-full h-4 fill-current text-white/40 absolute" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,10 C30,20 70,0 100,10 L100,20 L0,20 Z" />
                  </svg>
                  <motion.div 
                    animate={{ x: [0, 100] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="w-[200%] h-4 bg-repeat-x opacity-40"
                    style={{
                      backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
                      backgroundSize: '20px 20px'
                    }}
                  />
                </div>

                {/* Submerged bubbles indicators rising */}
                <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden">
                  <div className="absolute bottom-4 left-1/4 w-1.5 h-1.5 bg-white/35 rounded-full animate-bounce" style={{ animationDuration: '2.5s' }} />
                  <div className="absolute bottom-10 left-1/2 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDuration: '3.1s' }} />
                  <div className="absolute bottom-16 right-1/4 w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDuration: '1.9s' }} />
                </div>
              </motion.div>


              {/* THE ACTIVE MASCOT (Dropped inside) */}
              {/* CRITICAL GEOMETRY LOCK: MUST remain perfect circle: w-16 h-16 (64px) shrink-0 aspect-square rounded-full */}
              <AnimatePresence mode="popLayout">
                {isDropTriggered && (
                  <motion.div
                    key={`${dropCounter}-${materialType}-${liquidType}`}
                    initial={{ 
                      y: -120, // starts high above tank
                      x: 185 - 32 // centered in the 380px wide tank (190 center, offset by half width of ball, 32)
                    }}
                    animate={{ 
                      y: getFramerAnimateY(),
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      y: {
                        type: 'spring',
                        stiffness: 85,
                        damping: 15,
                        mass: materialType === 3 ? 1.4 : materialType === 1 ? 0.6 : 0.9 // heavier metals drop harder!
                      }
                    }}
                    className="absolute top-0 left-0 z-40 shrink-0"
                    style={{
                      width: '64px',
                      height: '64px'
                    }}
                  >
                    {/* Floating Speech Bubble directly above Mascot's head */}
                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-50 w-max pointer-events-none select-none">
                      <div className="bg-slate-900/95 border-2 border-orange-400 text-orange-200 text-[10px] md:text-xs font-black px-4 py-2.5 rounded-2xl shadow-2xl w-[220px] text-center backdrop-blur-sm leading-tight relative">
                        {getSpeechBubbleText()}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-r-2 border-b-2 border-orange-400 rotate-45 -mt-1.2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Secondary gentle bobbing loop once settled! */}
                    <motion.div
                      animate={getBobbingYTransition() ? { y: getBobbingOffset() } : {}}
                      transition={getBobbingYTransition()}
                      className="w-16 h-16 shrink-0 aspect-square rounded-full relative"
                    >
                      {/* CRITICAL GEOMETRY LOCK - ASPECT SQUARE */}
                      <div 
                        className={`w-16 h-16 shrink-0 aspect-square rounded-full flex flex-col items-center justify-center relative select-none border-2 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] ${
                          materialType === 1 
                            ? 'bg-gradient-to-br from-[#D97706] via-amber-600 to-amber-800 border-yellow-800 text-yellow-100' // Wood style
                            : materialType === 2
                            ? 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 border-white text-white' // Rubber/orange standard
                            : 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700 border-slate-300 text-slate-100' // Metallic iron gray
                        }`}
                        style={{ width: '64px', height: '64px' }}
                      >
                        {/* Highlights & Texture Overlays */}
                        {materialType === 1 && (
                          // Wood grain lines
                          <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none flex flex-col justify-around overflow-hidden py-1">
                            <div className="h-[2px] bg-amber-950 w-full" />
                            <div className="h-[2px] bg-amber-950 w-full" />
                            <div className="h-[1.5px] bg-amber-950 w-full" />
                          </div>
                        )}
                        {materialType === 3 && (
                          // Heavy industrial cross specular sheen
                          <div className="absolute top-[8%] left-[8%] right-[8%] bottom-[8%] rounded-full border border-slate-200/20 pointer-events-none opacity-40 rotate-[45deg]" />
                        )}

                        <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg] pointer-events-none" />
                        <div className="absolute top-[18%] left-[8%] w-[10%] h-[10%] bg-white rounded-full opacity-50 pointer-events-none" />

                        {/* Facial expression inside custom circular mascot */}
                        {getPhysicalState() === 'sink' ? (
                          // Dizzy/drowning look for heavy iron sinking
                          <div className="flex flex-col items-center justify-center mt-1">
                            <div className="flex justify-between gap-3 text-[10px] font-black leading-none z-10 text-slate-900 select-none">
                              <span>X</span>
                              <span>X</span>
                            </div>
                            <div className="w-3.5 h-1 bg-slate-950 rounded-full mt-2" />
                          </div>
                        ) : getPhysicalState() === 'suspend' ? (
                          // Calm Zen master meditating face
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex justify-between gap-3.5 z-10 text-slate-950 mt-1">
                              <span className="text-xs font-black select-none leading-none">◡</span>
                              <span className="text-xs font-black select-none leading-none">◡</span>
                            </div>
                            <div className="w-4 h-1.5 bg-slate-950 rounded-full mt-1.5" />
                          </div>
                        ) : (
                          // Super happy smile for floating/wood
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex justify-between gap-3 z-10 text-slate-950 mt-1">
                              <svg width="10" height="6" viewBox="0 0 10 8" className="w-3 h-2">
                                <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                              </svg>
                              <svg width="10" height="6" viewBox="0 0 10 8" className="w-3 h-2">
                                <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                              </svg>
                            </div>
                            <div className="w-4 h-2 bg-slate-950 rounded-b-full mt-1" />
                          </div>
                        )}

                        {/* Cheek blushing dots */}
                        <div className="absolute bottom-[20%] left-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-70" />
                        <div className="absolute bottom-[20%] right-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-70" />

                        {/* Hanging anchor rope visualization if sinking */}
                        {getPhysicalState() === 'sink' && (
                          <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 w-[2px] h-[30px] bg-slate-400 opacity-60 pointer-events-none" />
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Speech bubble is now dynamically rendered inside the Mascot motion.div to float directly above it */}


            {/* Bottom Horizon status ribbon */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-blue-500 flex items-center justify-center opacity-95 z-[35]">
              <span className="text-cyan-300 text-[10px] font-black tracking-widest uppercase">
                ATOR DENSITAS PENELITI CILIK PROF. JUMP 🌊
              </span>
            </div>

          </div>

          {/* Pedagogy Lab Instruction Card */}
          <div className="bg-blue-50 bg-amber-50 rounded-3xl p-5 border-2 border-blue-200/40 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-blue-800">Petunjuk Lab Praktikum Archimedes</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Benda bisa melayang atau mengapung karena mendapatkan **Gaya Apung Ke Atas** yang besarnya sama dengan berat air yang dipindahkan! Semakin besar massa jenis cairan (seperti Air Garam), semakin besar pula tenaga dorong air ke atas!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
