import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  Activity, 
  RotateCcw, 
  Sparkles, 
  Music, 
  HelpCircle,
  Megaphone,
  ChevronsRight
} from 'lucide-react';

interface SoundSimulationProps {
  onBack: () => void;
}

export default function SoundSimulation({ onBack }: SoundSimulationProps) {
  // 1. Controls Panel State
  const [frequency, setFrequency] = useState<number>(4); // Range 1 (Bass) to 10 (Treble)
  const [volume, setVolume] = useState<number>(5); // Range 1 (Quiet) to 10 (Loud)
  const [dopplerShift, setDopplerShift] = useState<number>(0); // Range -5 (Menjauh / Left) to 5 (Mendekat / Right)
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);

  // 2. Wave propagation offset state
  const [waveOffset, setWaveOffset] = useState<number>(0);

  // References
  const canvasRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sound synthesis lazy initializer
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sound mapping:
      // Base freq 120Hz + Frequency * 90Hz -> so 210Hz to 1020Hz
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120 + frequency * 90, ctx.currentTime);

      // Volume amplitude mapping:
      // Volume level * 0.04
      const targetGain = isAudioEnabled ? (volume / 10) * 0.15 : 0;
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscNodeRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn("AudioContext failed to initialize:", e);
    }
  };

  // Synchronize synthetic tone frequency and gain changes
  useEffect(() => {
    if (audioCtxRef.current && oscNodeRef.current && gainNodeRef.current) {
      // Dynamic pitch frequency is shifted by Doppler perspective!
      // If doppler is positive (Mendekat/approaching), the perceived pitch shifts HIGHER.
      // If doppler is negative (Menjauh/receding), the perceived pitch shifts LOWER.
      const dopplerMultiplier = 1 + (dopplerShift * 0.05);
      const targetFreq = (120 + frequency * 90) * dopplerMultiplier;
      
      oscNodeRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.1);

      // Sync master volume
      const targetGain = isAudioEnabled ? (volume / 10) * 0.15 : 0;
      gainNodeRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.1);
    }
  }, [frequency, volume, dopplerShift, isAudioEnabled]);

  // Clean up Web Audio node instances
  useEffect(() => {
    return () => {
      if (oscNodeRef.current) {
        try { oscNodeRef.current.stop(); } catch(e){}
        oscNodeRef.current.disconnect();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Wave propagation animator loop
  useEffect(() => {
    let animId: number;
    const updateWave = () => {
      // Propagation speed is directly influenced by frequency
      const speed = 0.8 + frequency * 0.35;
      setWaveOffset((prev) => (prev + speed) % 10000);
      animId = requestAnimationFrame(updateWave);
    };
    animId = requestAnimationFrame(updateWave);
    return () => cancelAnimationFrame(animId);
  }, [frequency]);

  // Reset/Mute trigger action
  const handleMuteReset = () => {
    setFrequency(4);
    setVolume(0); // This mutes to 0
    setDopplerShift(0);
    setIsAudioEnabled(false);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    }
  };

  // Enable Sound Action Toggle
  const toggleSoundPlay = () => {
    if (!isAudioEnabled) {
      setIsAudioEnabled(true);
      // Run initializer
      if (!audioCtxRef.current) {
        initAudio();
      } else {
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      }
    } else {
      setIsAudioEnabled(false);
    }
  };

  // Acoustic Coordinate calculations
  // Mascot Listener X & Y centers
  const listenerX = 460;
  const listenerY = 210;

  // Speaker sliding track calculations based on Doppler slider
  // Slider3 ranges from -5 (Left / Menjauh) to 5 (Right / Mendekat)
  // Base speaker horizontal x: 120
  const speakerX = 140 + dopplerShift * 16; 
  const speakerY = 210;

  // Dynamic Doppler spacing wavelength
  // At Slider 3 = 5 (Mendekat), waves compressed -> smaller wavelength
  // At Slider 3 = -5 (Menjauh), waves stretched -> larger wavelength
  const dopplerFactor = 1 - (dopplerShift * 0.08); // range (1.4 to 0.6)
  const baseWavelength = 180 - (frequency * 11); // base wave spacing: 170px to 70px
  const acousticWavelength = baseWavelength * dopplerFactor;

  // Generating a list of propagating wave radii
  const waveCount = 7;
  const waveListProps = [];

  for (let i = 0; i < waveCount; i++) {
    // Determine target radius
    let r = (waveOffset + i * acousticWavelength) % 420;
    
    // Wave start radius is from speaker cone (say 20px)
    if (r > 20) {
      // Fade out dynamically before colliding or leaving canvas limits (400px threshold)
      const fadeThreshold = 380;
      let opacity = 0;
      if (r <= fadeThreshold) {
        // Increases from 20 to 80, then plateaus, then decays after 280
        if (r < 80) {
          opacity = ((r - 20) / 60) * (volume / 10);
        } else {
          opacity = (1 - (r - 80) / (fadeThreshold - 80)) * (volume / 10);
        }
      }
      
      // Save wave parameters if within visual ranges
      waveListProps.push({
        radius: r,
        opacity: Math.max(0, Math.min(1, opacity))
      });
    }
  }

  // Cute Mascot Speech Bubble Logic
  const getSpeechBubbleMessage = () => {
    if (volume === 0) {
      return "Ssst! Nyalakan volumenya biar aku bisa mendengar suaramu! 🔊✨";
    }
    if (volume >= 8) {
      return "WAAAH BERISIK BANGET! Telingaku bisa budek! 🙉💥";
    }
    if (frequency <= 3) {
      return "Nadanya ngebass banget, getarannya kerasa sampai ke perut! 🎸🔊";
    }
    if (frequency >= 8) {
      return "Auuu! Nadanya tinggi banget, nyaring di telinga! 🐬⚡";
    }
    return "Merdu sekali! Gelombang udara ini membuatku suka menari! 🎵✨";
  };

  const currentSpeech = getSpeechBubbleMessage();

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Top Header Sections */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#7C3AED] font-extrabold text-sm bg-white hover:bg-[#7C3AED]/5 border-2 border-[#7C3AED]/10 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-sound-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Energi: Gelombang Suara 🎶
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Materi: Akustik Mekanik, Osilasi Udara, & Efek Doppler
          </p>
        </div>

        {/* Informative info label badges */}
        <div className="flex gap-2">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-emerald-200">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            DOOPLER REGISTER
          </span>
          <span className="bg-orange-100 text-orange-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-orange-200">
            <Activity className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
            AKUSTIK AKTIF
          </span>
        </div>
      </div>

      {/* Main Split Interface Area */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Side Column: 30% width controls panel (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">🎛️</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Konsol Akustik
              </h2>
            </div>

            {/* Enable real browser synthesis audio toggle */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 tracking-wider uppercase">
                  🔉 Efek Nada Nyata (Web Audio)
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${isAudioEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                Nyalakan untuk melodi aslinya! Ubah pitch dan geser sasis speaker untuk dengar perbedaan suara Doppler!
              </p>
              <button
                onClick={toggleSoundPlay}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2 ${
                  isAudioEnabled 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-white hover:bg-orange-50 text-orange-600 border border-orange-200'
                }`}
                id="btn-sound-speakers-active"
              >
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {isAudioEnabled ? 'NADA SUARA: AKTIF 🔊' : ' AKTIFKAN NADA SUARA 🔊'}
              </button>
            </div>

            {/* Slider 1: Nada / Frekuensi (Pitch) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-orange-50/70 p-3.5 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase flex items-center gap-1">
                  🎵 Nada : Frekuensi (Pitch)
                </span>
                <span className="text-xs font-black text-white bg-orange-500 px-3 py-1 rounded-full animate-pulse">
                  {frequency} Hz (Faktor)
                </span>
              </div>
              
              <input 
                type="range"
                min="1"
                max="10"
                step="1"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-[#F97316] outline-none"
                id="slider-sound-freq"
              />

              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>1 (Bass Rendah)</span>
                <span>Normal</span>
                <span>10 (Treble Tinggi)</span>
              </div>
            </div>

            {/* Slider 2: Volume (Amplitudo) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/40">
                <span className="text-xs font-extrabold text-purple-700 tracking-wider uppercase">
                  🔊 Kekuatan Volume (Amplitudo)
                </span>
                <span className="text-xs font-black text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  Lvl {volume} / 10
                </span>
              </div>

              <input 
                type="range"
                min="0"
                max="10"
                step="1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-3 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600 outline-none"
                id="slider-sound-volume"
              />

              <div className="flex justify-between text-[11px] font-bold text-purple-400">
                <span className="text-slate-400">0 (Senyap)</span>
                <span>Normal (5)</span>
                <span className="text-purple-600 font-extrabold">10 (Bising!)</span>
              </div>
            </div>

            {/* Slider 3: Speaker slider for Doppler effect */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center bg-teal-50/70 p-3.5 rounded-2xl border border-teal-100/40">
                <span className="text-xs font-extrabold text-teal-700 tracking-wider uppercase flex items-center gap-1">
                  🎛️ Gerakkan Speaker (Doppler)
                </span>
                <span className="text-xs font-black text-teal-600 bg-teal-100 px-2.5 py-1 rounded-full">
                  {dopplerShift === 0 ? 'TETAP' : dopplerShift > 0 ? `DEKAT (+${dopplerShift})` : `JAUH (${dopplerShift})`}
                </span>
              </div>

              <input 
                type="range"
                min="-5"
                max="5"
                step="1"
                value={dopplerShift}
                onChange={(e) => setDopplerShift(Number(e.target.value))}
                className="w-full h-3 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-600 outline-none"
                id="slider-sound-doppler"
              />

              <div className="flex justify-between text-[11px] font-bold text-teal-500">
                <span>◀️ Menjauh (Kiri)</span>
                <span className="text-slate-400">Pusat</span>
                <span>Mendekat (Kanan) ▶️</span>
              </div>
            </div>

            {/* Physical frequency details info panel */}
            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/40 space-y-2">
              <span className="text-[10px] font-black text-indigo-700 tracking-wider uppercase bg-indigo-100/70 py-1 px-2.5 rounded-full">
                🔍 DATA SPESIFIKASI GELOMBANG
              </span>
              <div className="space-y-1.5 pt-2 text-xs text-slate-500 font-bold leading-relaxed">
                <div className="flex justify-between">
                  <span>Panjang Gelombang (λ):</span>
                  <span className="font-extrabold text-indigo-900">
                    {Math.round(acousticWavelength)} Pixel
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Persepsi Pitch Frekuensi:</span>
                  <span className="font-extrabold text-indigo-900">
                    {Math.round((120 + frequency * 90) * (1 + dopplerShift * 0.05))} Hz
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amplitudo Simpangan:</span>
                  <span className="font-extrabold text-indigo-900">{volume * 10} Micron</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Mute button */}
          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={handleMuteReset}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-slate-200/50 shadow-sm"
              id="btn-sound-reset"
            >
              <RotateCcw className="w-4 h-4" /> Matikan Suara 🔇
            </button>
          </div>

        </div>

        {/* Right Side Column: 70% width Acoustic Space Simulator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            ref={canvasRef}
            className="w-full h-[450px] md:h-[480px] bg-slate-950 rounded-[32px] border-[3px] border-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.15)] relative overflow-hidden select-none"
            id="sound-canvas"
          >
            {/* Ambient molecular acoustic particle grid background */}
            <div 
              className="absolute inset-0 opacity-[0.04] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#a855f7 1px, transparent 1px)', 
                backgroundSize: '16px 16px' 
              }} 
            />

            {/* Dotted horizontal guide line tracks representing speaker movable slider limits */}
            <div className="absolute top-[210px] left-[40px] right-[40px] border-t-2 border-dashed border-slate-800/60 pointer-events-none" />

            {/* HUD diagnostics labels overlay */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-none z-30">
              <span className="text-[10px] text-teal-400 font-extrabold tracking-widest uppercase bg-indigo-950/60 px-3.5 py-2 rounded-full border border-teal-500/20 backdrop-blur-sm shadow-sm flex items-center gap-1">
                🔬 DOPPLER DISPERSION CHAMBER
              </span>
              <span className="text-[10px] text-amber-300 font-black tracking-widest uppercase bg-indigo-950/60 px-3 py-1.5 rounded-full border border-orange-500/20 backdrop-blur-sm shadow-sm">
                MEDIUM PERAMBATAN: UDARA 🌬️
              </span>
            </div>

            {/* RENDERING THE DETAILED PROPAGATING ACOUSTIC WAVEFRONT LIGHTS */}
            {/* Multiple nested high opacity vector signal arches centered offset at speakerX, speakerY */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <filter id="soundGlow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {waveListProps.map((wave, idx) => {
                // If weight density is requested we adjust thickness of waves based on Amplitude volume
                const strokeThickness = 1.5 + (volume * 0.7);
                const r = wave.radius;

                // Animate concentricWiFi-arches curving rightward from speakers point
                // M {X-Start} {Y-Start} A {RadiusX} {RadiusY} 0 0 1 {X-End} {Y-End}
                // Angles to draw WiFi wave arches: -70 degrees to +70 degrees
                // cos(-70 deg) ~ 0.342, sin(-70 deg) ~ -0.939
                // cos(70 deg) ~ 0.342, sin(70 deg) ~ 0.939
                const dx1 = r * 0.342;
                const dy1 = -r * 0.939;
                
                const sx = speakerX + dx1;
                const sy1 = speakerY + dy1;
                const sy2 = speakerY - dy1; // symmetric bottom coordinate

                // Map sound colors based on Pitch (lower is deep red/orange bass, higher is vibrant blue/purple treble)
                const waveColor = frequency >= 8 
                  ? '#38BDF8' // Treble light-cyan
                  : frequency <= 3 
                    ? '#F97316' // Bass warm orange
                    : '#A855F7'; // Normal purple

                return (
                  <path
                    key={idx}
                    d={`M ${sx} ${sy1} A ${r} ${r} 0 0 1 ${sx} ${sy2}`}
                    fill="none"
                    stroke={waveColor}
                    strokeWidth={strokeThickness}
                    strokeLinecap="round"
                    filter="url(#soundGlow)"
                    opacity={wave.opacity}
                  />
                );
              })}
            </svg>

            {/* Floating visual music particles indicators */}
            {volume > 0 && waveListProps.map((wave, i) => {
              if (i % 2 !== 0) return null;
              // Float upward elements coordinates
              const offsetNoteY = speakerY - 20 - (wave.radius * 0.3) % 120;
              const offsetNoteX = speakerX + wave.radius * 0.8;
              
              if (offsetNoteX > listenerX - 20) return null; // stop near ear

              return (
                <div
                  key={`note-${i}`}
                  className="absolute text-sm pointer-events-none z-10 transition-all duration-75 select-none"
                  style={{
                    left: `${offsetNoteX}px`,
                    top: `${offsetNoteY}px`,
                    opacity: wave.opacity * 0.7
                  }}
                >
                  {i % 4 === 0 ? '🎵' : '🎶'}
                </div>
              );
            })}


            {/* THE INTERACTIVE TACTILE SPEAKER (MOVABLE) */}
            {/* Horizontal state binding */}
            <motion.div
              animate={{
                x: speakerX - 50, // adjust centers offset
                y: speakerY - 60
              }}
              transition={{
                type: 'spring',
                stiffness: 80,
                damping: 12
              }}
              className="absolute w-[100px] h-[120px] z-20 flex flex-col items-center justify-center relative select-none cursor-pointer"
              id="speaker-housing"
            >
              {/* Pulsing visual animation based on volume amplitude and frequency rate */}
              <motion.div 
                animate={{
                  scale: volume > 0 ? [1, 1 + (volume * 0.015), 1] : 1,
                  rotate: volume > 0 ? [0, (volume * 0.3) - (volume * 0.15), 0] : 0
                }}
                transition={{
                  repeat: Infinity,
                  duration: Math.max(0.08, 0.75 - (frequency * 0.07)), // speeds up with high pitch pitch frequency rates
                  ease: "easeInOut"
                }}
                className="w-[84px] h-[94px] bg-slate-800 rounded-3xl border-2 border-slate-700 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-2 text-center"
              >
                {/* Premium speaker tweeter top */}
                <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-80" />
                </div>

                {/* Pulsing orange woofer base cone */}
                <div className="w-11 h-11 rounded-full bg-orange-600 border-2 border-orange-500/70 shadow-inner flex items-center justify-center relative overflow-hidden">
                  {/* Decorative sound mesh details */}
                  <div className="w-8 h-8 rounded-full bg-slate-950 border border-orange-400 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                </div>

                {/* Sliding indicator rail anchor lock handles */}
                <div className="w-full h-1 mt-1.5 bg-slate-900 rounded-full flex justify-between px-1">
                  <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                </div>
              </motion.div>

              {/* Doppler moving warning text prompt */}
              <div className="absolute top-[-22px] bg-teal-950 border border-teal-500/40 text-teal-300 text-[8px] font-black uppercase py-0.5 px-2 rounded px-2.5 shadow max-w-[120px] text-center whitespace-nowrap">
                Faktor Doppler: {dopplerMultiplierText(dopplerShift)}
              </div>
            </motion.div>


            {/* THE CUTE LISTENER MASCOT (RIGHT SIDE OF CANVAS) */}
            <div
              className="absolute z-20"
              style={{
                left: `${listenerX - 32}px`,
                top: `${listenerY - 32}px`
              }}
              id="mascot-sound-listener"
            >
              {/* THE CUTE ACTIVE SPEAKER SPHERICAL MASCOT */}
              {/* CRITICAL GEOMETRY LOCK: Aspect ratio and rounded-full circle */}
              <div 
                className="w-16 h-16 shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-white/50 flex flex-col items-center justify-center relative select-none"
                style={{ width: '64px', height: '64px' }}
              >
                {/* Visual ears/audio headphones decoration when there is noise */}
                {volume > 0 && (
                  <div className="absolute -inset-1.5 rounded-full border border-orange-400/30 animate-pulse pointer-events-none" />
                )}

                {/* Headphone arch overlay on top of mascot for kid friendliness */}
                <div className="absolute top-[-4px] left-[-4px] right-[-4px] h-[20px] border-t-4 border-slate-700 rounded-t-full pointer-events-none opacity-40 z-0" />

                {/* 3D clay specular finishes */}
                <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg] pointer-events-none" />
                <div className="absolute top-[18%] left-[8%] w-[10%] h-[10%] bg-white rounded-full opacity-50 pointer-events-none" />

                {/* Facial expressions mapping depending on loudness and frequencies */}
                {volume >= 8 ? (
                  // SHOCKED LOUD MASSIVE EXCITED EYES
                  <div className="flex justify-between gap-3.5 z-10 select-none animate-bounce">
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                      <div className="absolute top-0.5 right-0.5 w-[2px] h-[2px] bg-white rounded-full" />
                    </div>
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                      <div className="absolute top-0.5 right-0.5 w-[2px] h-[2px] bg-white rounded-full" />
                    </div>
                  </div>
                ) : frequency >= 8 ? (
                  // HIGH FREQUENCY TREBLE PIERCING TIGHTLY SHUT EYES > <
                  <div className="flex justify-between gap-2.5 z-10 select-none font-black text-slate-900 text-xs mt-0.5">
                    <span>＞</span>
                    <span>＜</span>
                  </div>
                ) : (
                  // HAPPY ENJOYING MUSIC BASS CARET EYES ^_^
                  <div className="flex justify-between gap-2.5 z-10 select-none">
                    <svg width="12" height="8" viewBox="0 0 10 8" className="w-3.5 h-2.5">
                      <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <svg width="12" height="8" viewBox="0 0 10 8" className="w-3.5 h-2.5">
                      <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* Mouth outlines */}
                <div className="z-10 mt-1">
                  {volume >= 8 ? (
                    /* Screaming open circles */
                    <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-900 shadow-inner" />
                  ) : frequency >= 8 ? (
                    /* Uneasy squiggly small mouth */
                    <svg width="10" height="4" viewBox="0 0 10 4" className="w-2.5 h-1">
                      <path d="M 1 2 Q 3 0, 5 2 T 9 2" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    /* Broad happy cute smile */
                    <div className="w-3 h-1 bg-slate-900 rounded-full" />
                  )}
                </div>

                {/* Rosy blush layout */}
                <div className="absolute bottom-[20%] left-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                <div className="absolute bottom-[20%] right-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75" />
              </div>
            </div>


            {/* DYNAMIC SPEECH BUBBLE STATIONED ABOVE MASCOT */}
            {/* Mounted at fixed coordinate offset near listenerX, listenerY */}
            <div 
              className="absolute pointer-events-none select-none z-30 transition-all duration-100"
              style={{
                left: `${listenerX - 96}px`, // beautiful centring
                top: `${listenerY - 110}px`
              }}
            >
              <div className="bg-slate-900/95 border-2 border-orange-400 text-orange-200 text-[10px] md:text-xs font-black px-4 py-2.5 rounded-2xl shadow-2xl w-48 text-center backdrop-blur-sm leading-tight relative">
                {currentSpeech}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-r-2 border-b-2 border-orange-400 rotate-45 -mt-1.2 pointer-events-none" />
              </div>
            </div>


            {/* Bottom Horizon line HUD branding matching Relativity */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-orange-500 flex items-center justify-center opacity-90 z-[40]">
              <span className="text-orange-300 text-[10px] font-black tracking-widest uppercase">
                ATOR DOPPLER PENELITI CILIK PROF. JUMP 🎶
              </span>
            </div>

          </div>

          {/* Pedagogy Lab Instruction Card */}
          <div className="bg-amber-100/60 rounded-3xl p-5 border-2 border-amber-200/50 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Efek Doppler Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Ubah 'Gerakkan Speaker' ke **Mendekat** dan lihat bagaimana lingkaran-lingkaran gelombang suara merayap menjepit rapat jadi **frekuensi tinggi**! Bila digeser ke **Menjauh**, gelombang merenggang panjang lambat. Inilah **Efek Doppler**!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Simple label helper for Doppler effect ratio multipliers
function dopplerMultiplierText(shift: number) {
  if (shift === 0) return "Normal (1.00x)";
  if (shift > 0) {
    const multi = 1 + (shift * 0.05);
    return `Rapat (+${Math.round(shift * 5)}% / ${multi.toFixed(2)}x)`;
  }
  const multi = 1 + (shift * 0.05);
  return `Renggang (${Math.round(shift * 5)}% / ${multi.toFixed(2)}x)`;
}
