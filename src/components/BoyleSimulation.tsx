import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
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
  Gauge,
  Maximize2,
  Zap,
  ArrowDown
} from 'lucide-react';

interface BoyleSimulationProps {
  onBack: () => void;
}

// Particle interface for gas molecules bouncing inside the cylinder
interface GasParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function BoyleSimulation({ onBack }: BoyleSimulationProps) {
  // 1. Slider & Interaction States
  // volume value goes from 1 (Piston di bawah/Sempit) to 10 (Piston di atas/Luas), Default 5 (Normal)
  const [volume, setVolume] = useState<number>(5);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [gasParticles, setGasParticles] = useState<GasParticle[]>([]);
  const [pumpSparks, setPumpSparks] = useState<boolean>(false);

  // Audio Context for Boyle's law squeeze/vacuum sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Web Audio
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    } catch (e) {
      console.warn("Audio error: ", e);
    }
  };

  const playSynthNote = (freq: number, duration: number = 0.1, type: 'sine' | 'triangle' | 'sawtooth' = 'sine') => {
    if (!isAudioEnabled) return;
    if (!audioCtxRef.current) initAudio();
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const now = audioCtxRef.current.currentTime;
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      
      // Pitch sweeps up or down to match compression/decompression sensation
      if (type === 'sawtooth') {
        // compression squeal
        osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + duration);
        gain.gain.setValueAtTime(0.04, now);
      } else {
        // expanding vacuum hum
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + duration);
        gain.gain.setValueAtTime(0.08, now);
      }
      
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(now + duration);
    }
  };

  // Slider change handler with specialized audio responses
  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    // Sound frequency reflects the pressure state (Higher pressure/smaller volume = higher pitched frequency)
    const frequency = 250 + (11 - newVal) * 60;
    if (newVal < volume) {
      // Compressing
      playSynthNote(frequency, 0.12, 'sawtooth');
    } else {
      // Expanding
      playSynthNote(frequency, 0.14, 'sine');
    }
  };

  // Reset Button: "Lepas Katup Udara 💨" resets piston back to nominal volume = 5
  const handleResetKatup = () => {
    setVolume(5);
    setPumpSparks(true);
    playSynthNote(180, 0.4, 'triangle');
    setTimeout(() => {
      setPumpSparks(false);
    }, 1000);
  };

  const handleAudioToggle = () => {
    if (!isAudioEnabled) {
      setIsAudioEnabled(true);
      if (!audioCtxRef.current) initAudio();
      setTimeout(() => playSynthNote(440, 0.25, 'sine'), 50);
    } else {
      setIsAudioEnabled(false);
    }
  };

  // --- BOYLE'S LAW PHYSICS MATHEMATICS ---
  // PV = k (Pressure * Volume = Constant)
  // Let constant k = 100
  // P = k / V
  // If Volume = 1, Pressure is 100 (Maximum)
  // If Volume = 5, Pressure is 20 (Normal)
  // If Volume = 10, Pressure is 10 (Minimum / Vacuum)
  const calculatedPressure = (100 / volume).toFixed(1);
  const pressurePercent = volume === 1 ? 100 : Math.round((100 / volume) * 5); // display helpful gauge level

  // Cylinder properties mapping:
  // Height is 384px (representing h-96).
  // The piston moves vertically. Space beneath piston is gas container!
  // Let's calculate Piston Y (from top of Cylinder 0px to base 384px)
  // At volume = 1: Piston reaches bottom lock -> Y = 280px (leaving 104px space for gas)
  // At volume = 10: Piston rises to top lock -> Y = 40px (leaving 344px space for gas)
  const pistonY = 280 - (volume - 1) * 26.6; 
  const gasChamberHeight = 384 - pistonY; // space beneath the piston

  // Mascot dynamic scale based on volume size:
  // Volume down (5 -> 1): scale from 1.0 down to 0.6
  // Volume up (5 -> 10): scale from 1.0 up to 1.6
  const getMascotScale = () => {
    if (volume === 5) return 1.0;
    if (volume < 5) {
      // 1 to 5 mapping -> 0.6 to 1.0
      return 0.6 + (volume - 1) * 0.1;
    }
    // 5 to 10 mapping -> 1.0 to 1.6
    return 1.0 + (volume - 5) * 0.12;
  };

  // Mascot Speech bubble logic based on volume limits
  const getSpeechBubble = () => {
    if (volume === 5) {
      return "Tekanan udara di sini normal, rasanya pas dan nyaman! 💨☺️";
    }
    if (volume < 4) {
      return "Aduh aduh! Pistonnya ditekan, udaranya makin padat jepit aku! Kesempitaaan! 😫💥";
    }
    if (volume > 7) {
      return "Waaaa! Udaranya hampa, badanku malah mengembang gede banget kayak balon! Mau meletus! 🎈😱";
    }
    return "Massa gas konstan, tapi ruangannya menyusut membuat tumbukanku berlebih! ⚙️";
  };

  // Facial state of Mascot depending on pressures
  // - Level 5: Nominal Smile
  // - Level < 4: Shocked squat squeeze O_O
  // - Level > 7: Puff puffed up eyes blank blank
  const getFaceState = () => {
    if (volume === 5) return 'normal';
    if (volume < 4) return 'compressed';
    if (volume > 7) return 'vacuum';
    return 'normal';
  };

  // Seeding the bouncy air gas particles inside the bounding chamber of gas!
  // Particles bounce faster/hyper-energetic if volume is small (high pressure = high thermal activity/tumbukan)
  // Particles float slow and widely if volume is high (hampa / low pressure)
  useEffect(() => {
    // We seed 16 gaseous air molecules
    const initialParticles: GasParticle[] = [];
    const colors = ['#38BDF8', '#7DD3FC', '#F472B6', '#FBBF24', '#34D399'];
    for (let i = 0; i < 15; i++) {
      initialParticles.push({
        id: i,
        // distributed within the 256px wide cylinder
        x: 35 + Math.random() * 186,
        // placed safely within worst compression height (bottom 80px)
        y: 290 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 3 + Math.random() * 4,
        color: colors[i % colors.length]
      });
    }
    setGasParticles(initialParticles);
  }, []);

  // Frame simulation loop to update gas particle physics bounds reflecting the live Piston position!
  useEffect(() => {
    let frameId: number;

    const animateGas = () => {
      // Speed multiplier scales with live pressure (volume = 1 feels hyper-frenzy, volume = 10 looks slow-motion)
      // Volume = 1 -> speed mult = 2.4x
      // Volume = 10 -> speed mult = 0.5x
      const speedMultiplier = 2.4 - (volume - 1) * 0.19;

      setGasParticles(prev => 
        prev.map(p => {
          // calculate updated speed based on pressure
          let nx = p.x + p.vx * speedMultiplier;
          let ny = p.y + p.vy * speedMultiplier;

          let nvx = p.vx;
          let nvy = p.vy;

          // Boundary checks
          // Bouncy wall left/right inside the 256px cylinder container
          // Container starts at left X = 0, right X = 256. Buffer horizontal walls:
          const leftWall = 8;
          const rightWall = 248;
          if (nx - p.radius < leftWall) {
            nx = leftWall + p.radius;
            nvx = -Math.abs(p.vx);
          } else if (nx + p.radius > rightWall) {
            nx = rightWall - p.radius;
            nvx = Math.abs(p.vx);
          }

          // Vertical walls: bottom wall of cylinder is Y = 384. 
          // Top wall is the LIVE Piston edge: Y = pistonY
          const bottomFloor = 376;
          const ceiling = pistonY + 12; // piston offset thickness bar

          if (ny + p.radius > bottomFloor) {
            ny = bottomFloor - p.radius;
            nvy = -Math.abs(p.vy);
          } else if (ny - p.radius < ceiling) {
            ny = ceiling + p.radius;
            nvy = Math.abs(p.vy);
          }

          return {
            ...p,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy
          };
        })
      );

      frameId = requestAnimationFrame(animateGas);
    };

    frameId = requestAnimationFrame(animateGas);
    return () => cancelAnimationFrame(frameId);
  }, [pistonY, volume]);

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Top Header Navigation panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#7C3AED] font-extrabold text-sm bg-white hover:bg-[#7C3AED]/5 border-2 border-[#7C3AED]/10 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-boyle-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Fluida: Tekanan Udara 💨
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Materi: Tekanan Gas Ruang Tertutup, Teori Boyle (P × V = C), & Kerapatan Molekul
          </p>
        </div>

        {/* Informative scientific status labels */}
        <div className="flex gap-2">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-emerald-200">
            <Wind className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            HUKUM BOYLE
          </span>
          <span className="bg-purple-100 text-purple-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-purple-200 animate-none">
            <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin" />
            PARTIKEL TERKOMPRES
          </span>
        </div>
      </div>

      {/* Main Split Column Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Control Panel Column: 30% width */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">⚡</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Konsol Piston Boyle
              </h2>
            </div>

            {/* Playful Sound synthesizer option */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-emerald-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 tracking-wider uppercase">
                  🔊 Suara Aliran Gas (Audio)
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${isAudioEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                Ubah volume piston untuk memicu bunyi decit kompresi bernada tinggi atau dengungan frekuensi rongsok hampa!
              </p>
              <button
                onClick={handleAudioToggle}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2 ${
                  isAudioEnabled 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-white hover:bg-slate-100 text-emerald-600 border border-emerald-200'
                }`}
                id="btn-boyle-audio-active"
              >
                {isAudioEnabled ? '🔈 NADA TEKANAN: AKTIF' : '🔈 AKTIFKAN NADA TEKANAN'}
              </button>
            </div>

            {/* Config Control 1: Posisi Piston */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-orange-500/10 p-3.5 rounded-2xl border border-orange-100">
                <span className="text-xs font-black text-slate-700 tracking-wider uppercase">
                  ⚙️ Posisi Piston (Volume V)
                </span>
                <span className="text-xs font-black text-white bg-[#F97316] px-3 py-1 rounded-full uppercase">
                  Level {volume} / 10
                </span>
              </div>
              
              <input 
                type="range"
                min="1"
                max="10"
                step="1"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-3.5 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-[#F97316] outline-none"
                id="slider-boyle-volume"
              />

              <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1">
                <span className="text-[#F97316]">Kompresi Sempit (1)</span>
                <span>Normal (5)</span>
                <span>Hampa Luas (10)</span>
              </div>
            </div>

            {/* Boyle Interactive Live Metrics Gauge bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <span className="text-[9px] font-black text-[#F97316] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full inline-block">
                METRIK TEKANAN & RAPATAN GAS
              </span>
              
              {/* Dynamic Progress indicator representation */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600 font-extrabold">
                  <span>Tekanan Udara (P):</span>
                  {volume < 4 ? (
                    <span className="text-red-500 font-black animate-pulse flex items-center gap-1">
                      ⚠️ TINGGI ({calculatedPressure} atm)
                    </span>
                  ) : volume > 7 ? (
                    <span className="text-blue-500 font-black">
                      HAMPA ({calculatedPressure} atm)
                    </span>
                  ) : (
                    <span className="text-slate-800 font-black">
                      NORMAL ({calculatedPressure} atm)
                    </span>
                  )}
                </div>

                {/* Progress bar container */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${pressurePercent}%` }}
                    className={`h-full rounded-full ${
                      volume < 4 ? 'bg-gradient-to-r from-orange-400 to-red-500' : volume > 7 ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-[#F97316]'
                    }`}
                  />
                </div>
              </div>

              {/* Molecule collision visual counter representation */}
              <div className="text-[11px] text-slate-500 font-semibold leading-relaxed border-t border-slate-200/60 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Kecepatan Bouncing:</span>
                  <span className="text-indigo-600 font-bold">
                    {volume === 1 ? 'Sangat Cepat ⚡' : volume > 7 ? 'Sangat Lambat ❄️' : 'Sedang/Normal 🌀'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kerapatan Gas (Density):</span>
                  <span className="text-indigo-600 font-bold">
                    {volume < 4 ? 'Rapat/Padat' : volume > 7 ? 'Sangat Renggang' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Reset piston air release trigger */}
          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={handleResetKatup}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-slate-200/50 shadow-sm relative overflow-hidden"
              id="btn-boyle-valve-reset"
            >
              {pumpSparks && (
                <div className="absolute inset-0 bg-[#FFF9C4]/40 animate-pulse" />
              )}
              <span className="text-sm">💨</span> Lepas Katup Udara 💨
            </button>
          </div>

        </div>

        {/* Right Side Simulator Space Canvas Column: 70% width */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            className="w-full h-[450px] md:h-[480px] bg-slate-900 rounded-[32px] border-[3px] border-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.18)] relative overflow-hidden select-none flex items-center justify-center"
            id="boyle-canvas"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #030712 100%)'
            }}
          >
            {/* Playful background glowing atmosphere particles */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }} 
            />

            {/* Custom high-tactile pressure gauge dial illustration at top-right */}
            <div className="absolute top-5 right-5 bg-slate-950/85 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-1 w-24 text-center shadow-lg pointer-events-none z-30">
              <span className="text-[7px] text-slate-400 font-extrabold tracking-widest leading-none">PRESSURE DIAL</span>
              <div className="relative w-12 h-12 flex items-center justify-center mt-1">
                <Gauge className="w-12 h-12 text-slate-700" />
                {/* Dial indicator arrow rotation based on inverse volume */}
                <motion.div
                  animate={{ rotate: -90 + (pistonY === 280 ? -30 : (10 - volume) * 22) }}
                  className="absolute w-1.5 h-6 origin-bottom text-red-500 rounded-sm mb-6 flex justify-center"
                >
                  <ArrowDown className="w-1.5 h-6 font-black scale-x-50" />
                </motion.div>
                <div className="absolute w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-950" />
              </div>
              <span className={`text-[10px] font-black ${volume < 4 ? 'text-red-400' : 'text-emerald-400'}`}>
                {calculatedPressure} atm
              </span>
            </div>

            {/* Squeezing cloud flow indicator behind */}
            <AnimatePresence>
              {pumpSparks && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-cyan-400 pointer-events-none z-[4]"
                />
              )}
            </AnimatePresence>

            {/* THE SPEECH BUBBLE STATIONED ABOVE THE GLASS CYLINDER */}
            <div className="absolute top-4 left-6 pointer-events-none z-35">
              <div className="bg-slate-950/90 border-2 border-orange-400 text-orange-200 text-[10px] md:text-xs font-black px-4 py-2.5 rounded-2xl shadow-2xl w-[220px] backdrop-blur-sm leading-tight text-left">
                {getSpeechBubble()}
              </div>
            </div>

            {/* THE BOYLE AIR CHAMBER TRANSPARENT CYLINDER TANK CONTAINER */}
            {/* Dimensions: w-64 h-96, centered perfectly on screen. */}
            <div 
              className="w-64 h-96 border-4 border-slate-500 rounded-b-3xl rounded-t-lg bg-teal-900/10 backdrop-blur-[1px] relative flex flex-col justify-end overflow-hidden shadow-[inset_0_12px_24px_rgba(0,0,0,0.5),0_8px_24px_rgba(0,0,0,0.6)] z-10"
              id="boyle-cylinder-tank"
            >
              
              {/* Density background glow (Hot dense orange if compressed, cool thin blue if vacuum expanded) */}
              <motion.div 
                animate={{
                  opacity: volume < 4 ? 0.35 : volume > 7 ? 0.04 : 0.12,
                  backgroundColor: volume < 4 ? '#EF4444' : volume > 7 ? '#0284C7' : '#F59E0B'
                }}
                className="absolute inset-0 pointer-events-none transition-all duration-300 z-0"
              />

              {/* Chamber grid depth markers */}
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none border-b border-white border-dashed" style={{ backgroundSize: '100% 28px', backgroundImage: 'linear-gradient(to bottom, #FFF 1px, transparent 1px)' }} />

              {/* LIVE BOUNCING GAS PARTICLES */}
              {/* Rendered below the Piston, bounce inside limits perfectly */}
              {gasParticles.map(p => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full z-15 pointer-events-none"
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                    width: `${p.radius * 2}px`,
                    height: `${p.radius * 2}px`,
                    backgroundColor: p.color,
                    boxShadow: '0 0 6px rgba(255,255,255,0.4)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}


              {/* THE PISTON COMPONENT: SOLID HORIZONTAL METALLIC BAR SLIDING VERTICALLY */}
              {/* Width spans edge to edge. Moves dynamically depending on live slider position pistonY */}
              <motion.div
                animate={{
                  y: pistonY
                }}
                transition={{
                  type: 'spring',
                  stiffness: 90,
                  damping: 15
                }}
                className="absolute left-0 right-0 h-10 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 border-y-4 border-slate-750 flex flex-col items-center justify-center z-20 shadow-[0_6px_10px_rgba(0,0,0,0.4)]"
                style={{
                  top: 0 // starting relative reference coordinate
                }}
                id="piston-slider-bar"
              >
                {/* Thick vertical support handle bar rod expanding upwards out from cylinder frame */}
                <div className="absolute bottom-10 w-6 h-[400px] bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 border-x-2 border-slate-600 pointer-events-none flex flex-col justify-start">
                  <div className="w-full h-8 bg-indigo-950 border-b border-indigo-900 shadow-md flex items-center justify-center">
                    <span className="text-[5px] text-white font-black uppercase">BOYLE</span>
                  </div>
                </div>

                {/* Highly refined visual rubber sealing rims at both ends */}
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-slate-900 border-r border-slate-700" />
                <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-slate-900 border-l border-slate-700" />

                {/* Central handle core rivet icon */}
                <div className="w-8 h-2 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-inner animate-pulse" />
                </div>
              </motion.div>


              {/* THE HIGH-FIDELITY ACTIVE MASCOT (THE ATOM AT THE BOTTOM) */}
              {/* CRITICAL GEOMETRY LOCK: MUST remain perfect circle: w-16 h-16 (64px) shrink-0 aspect-square rounded-full */}
              <motion.div
                animate={{
                  scale: getMascotScale()
                }}
                transition={{
                  type: 'spring',
                  stiffness: 80,
                  damping: 14
                }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-25 shrink-0"
                style={{
                  width: '64px',
                  height: '64px'
                }}
                id="boyle-mascot-element"
              >
                {/* THE CUTE ORANGE SPHERICAL MASCOT */}
                {/* CRITICAL GEOMETRY LOCK - ASPECT SQUARE */}
                <div 
                  className="w-16 h-16 shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-white flex flex-col items-center justify-center relative select-none"
                  style={{ width: '64px', height: '64px' }}
                >
                  {/* Puffy specular glare rings */}
                  <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-65 rotate-[-15deg] pointer-events-none" />
                  <div className="absolute top-[18%] left-[8%] w-[10%] h-[10%] bg-white rounded-full opacity-50 pointer-events-none" />

                  {/* Playful ear protectors/headset for kids science theme */}
                  <div className="absolute top-[-3px] left-[-3px] right-[-3px] h-[18px] border-t-4 border-slate-800 rounded-t-full opacity-35" />

                  {/* Complex emotional expressions */}
                  {getFaceState() === 'compressed' ? (
                    // Squished suffering but cute face
                    <div className="flex flex-col items-center justify-center mt-1 animate-pulse">
                      <div className="flex justify-between gap-3 z-10 text-slate-950">
                        {/* Shaking dazed eyes */}
                        <span className="text-xs font-black select-none font-sans leading-none">O</span>
                        <span className="text-xs font-black select-none font-sans leading-none">O</span>
                      </div>
                      <div className="w-3.5 h-1 bg-slate-950 mt-1.5 rounded-full" />
                    </div>
                  ) : getFaceState() === 'vacuum' ? (
                    // Intoxicated expanding ballon puffy eyes
                    <div className="flex flex-col items-center justify-center mt-0.5">
                      <div className="flex justify-between gap-2.5 z-10 text-slate-950">
                        {/* Blinking eyes > < to show stretch struggle */}
                        <span className="text-[10px] font-black select-none font-mono tracking-tighter leading-none">{`>`}</span>
                        <span className="text-[10px] font-black select-none font-mono tracking-tighter leading-none">{`<`}</span>
                      </div>
                      <div className="w-3 h-3 bg-slate-950 rounded-full mt-1.5 border border-slate-900 shadow-inner flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    // Default happy smile with simple eyes
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex justify-between gap-3.5 z-10 text-slate-950 mt-1">
                        <svg width="10" height="6" viewBox="0 0 10 8" className="w-3 h-2">
                          <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        <svg width="10" height="6" viewBox="0 0 10 8" className="w-3 h-2">
                          <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="w-3 h-1 bg-slate-950 rounded-full mt-2" />
                    </div>
                  )}

                  {/* Cheerful pink blush circles */}
                  <div className="absolute bottom-[22%] left-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-70" />
                  <div className="absolute bottom-[22%] right-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-70" />
                </div>
              </motion.div>

            </div>


            {/* Cylinder Stand wooden base pedestal */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-[#F97316] flex items-center justify-center opacity-95 z-[35]">
              <span className="text-orange-300 text-[10px] font-black tracking-widest uppercase">
                STASIUN BOYLE PENELITI CILIK PROF. JUMP 💨
              </span>
            </div>

          </div>

          {/* Pedagogy Lab Instruction Card */}
          <div className="bg-orange-50 rounded-3xl p-5 border-2 border-orange-200/40 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-orange-850">Petunjuk Hukum Boyle Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Hukum Boyle menyatakan bahwa jika suhu gas dijaga tetap, **Tekanan (P) berbanding terbalik dengan Volume (V)**! Bila volume dipersempit, partikel gas berjejal kencang meningkatkan frekuensi tumbukan. Sebaliknya, bila volume meluas, ruangan menjadi hampa hantaman partikel mengurang!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
