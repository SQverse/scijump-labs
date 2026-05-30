import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  Sparkles, 
  RotateCcw, 
  Tv, 
  Smile, 
  Activity, 
  BookOpen, 
  HelpCircle,
  TrendingUp,
  Volume2,
  VolumeX,
  Compass,
  Sparkle
} from 'lucide-react';

interface MirrorSimulationProps {
  onBack: () => void;
}

export default function MirrorSimulation({ onBack }: MirrorSimulationProps) {
  // 1. Controls Panel State
  const [mirrorType, setMirrorType] = useState<number>(1); // 1 = Datar (Flat), 2 = Cembung (Convex), 3 = Cekung (Concave)
  const [distance, setDistance] = useState<number>(4); // Range 1 (Near) to 10 (Far)
  const [isPlayingSqueak, setIsPlayingSqueak] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);

  // Audio synthesizer references for cute optical sound fx
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initializing Web Audio for a cute kid-approved squeak/laser sound
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    } catch (e) {
      console.warn("Speech audio fails to play due to restrictions: ", e);
    }
  };

  const playOpticsTick = (freq: number, duration: number = 0.1, type: 'sine' | 'triangle' = 'sine') => {
    if (!isAudioEnabled) return;
    if (!audioCtxRef.current) initAudio();
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      
      // Sweep sound upwards or downwards for extra gameplay factor
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtxRef.current.currentTime + duration);
      
      gain.gain.setValueAtTime(0.06, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);
    }
  };

  // Play a sound when slider elements are dragged
  const handleSliderChange = (type: 'mirror' | 'distance', val: number) => {
    if (type === 'mirror') {
      setMirrorType(val);
      playOpticsTick(300 + val * 100, 0.15, 'triangle');
    } else {
      setDistance(val);
      playOpticsTick(200 + val * 40, 0.08, 'sine');
    }
  };

  const handleAudioToggle = () => {
    if (!isAudioEnabled) {
      setIsAudioEnabled(true);
      if (!audioCtxRef.current) initAudio();
      // play immediate nice sound
      setTimeout(() => playOpticsTick(440, 0.25, 'sine'), 50);
    } else {
      setIsAudioEnabled(false);
    }
  };

  // Reset: Bersihkan Cermin action
  const handleReset = () => {
    setMirrorType(1);
    setDistance(4);
    setIsPlayingSqueak(true);
    playOpticsTick(600, 0.3, 'sine');
    setTimeout(() => {
      setIsPlayingSqueak(false);
    }, 1200);
  };

  // --- GEOMETRIC COORDINATES CALCULATION ---
  const canvasWidth = 600;
  const canvasHeight = 360;
  
  // Mirror plane resides at center-x = 300
  const mirrorX = 300;
  const centerY = 180;

  // Source Mascot coordinate x calculation: sit strictly on the left half of the mirror
  // If distance is level 1, it's very close (say, X = 250)
  // If distance is level 10, it's far away (say, X = 70)
  const actualX = mirrorX - (30 + distance * 21);

  // Reflection Mascot scale and rotate logic depending on custom optic formulas
  let reflectionX = mirrorX + (30 + distance * 21);
  let reflectionScale = 1.0;
  let reflectionRotate = 0;
  let labelVirtualType = "Maya & Tegak (Normal)";

  if (mirrorType === 1) {
    // FLAT: Identical size and symmetrical coordinate tracking
    reflectionScale = 1.0;
    reflectionRotate = 0;
    reflectionX = mirrorX + (30 + distance * 21);
    labelVirtualType = "Maya, Tegak, & Sama Besar";
  } else if (mirrorType === 2) {
    // CONVEX: Constantly shrunk, virtual image situated closer to mirror backing
    reflectionScale = 0.6;
    reflectionRotate = 0;
    // Compresses reflecting perspective depth
    reflectionX = mirrorX + (30 + distance * 10);
    labelVirtualType = "Maya, Tegak, & Diperkecil";
  } else {
    // CONCAVE: Real or virtual depending on focus focal lengths (focus is around level 4)
    if (distance <= 4) {
      // Near = Virtual, upright, highly magnified
      reflectionScale = 1.6 + (4 - distance) * 0.15;
      reflectionRotate = 0;
      reflectionX = mirrorX + (30 + distance * 28);
      labelVirtualType = "Maya, Tegak, & Diperbesar";
    } else {
      // Far = Real, inverted (rotate 180) and slightly shrunk
      reflectionScale = 0.8;
      reflectionRotate = 180;
      // Appears in front in physics but rendered behind as a projection for kids clarity
      reflectionX = mirrorX + (30 + distance * 15);
      labelVirtualType = "Nyata, Terbalik, & Diperkecil";
    }
  }

  // Actual Mascot expressions matching user requests
  // Flat (1): "Wah, ini sih aku yang biasa! Bulat sempurna dan tampan~ 😎"
  // Convex (2): "Loh kok pantulanku jadi kecil imut begini? Kayak ngaca di spion! 🔍"
  // Concave (3) & Distance <= 4: "WAAAA KEPALAKU JADI RAKSASA! Pori-poriku kelihatan semua! 😱"
  // Concave (3) & Distance > 4: "Tolong! Bayanganku jungkir balik! Dunia terbalik! 🙃"
  const getSpeechBubble = () => {
    if (mirrorType === 1) {
      return "Wah, ini sih aku yang biasa! Bulat sempurna dan tampan~ 😎✨";
    }
    if (mirrorType === 2) {
      return "Loh kok pantulanku jadi kecil imut begini? Kayak ngaca di spion! 🔍🚲";
    }
    // Concave (3)
    if (distance <= 4) {
      return "WAAAA KEPALAKU JADI RAKSASA! Pori-poriku kelihatan semua! 😱🌟";
    }
    return "Tolong! Bayanganku jungkir balik! Dunia terbalik! 🙃🌀";
  };

  // Define actual face expressions: 
  // O_O eyes for shock if concave mirror is active
  const isShockedFace = (mirrorType === 3);

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Top Header Navigation Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#7C3AED] font-extrabold text-sm bg-white hover:bg-[#7C3AED]/5 border-2 border-[#7C3AED]/10 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-mirror-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Cahaya: Cermin Ajaib 🪞
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Materi: Pemantulan Cahaya (Refleksi), Sifat Bayangan, & Optika Geometri
          </p>
        </div>

        {/* Informative info badges tag status */}
        <div className="flex gap-2">
          <span className="bg-sky-50 text-sky-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-sky-200">
            <Compass className="w-3.5 h-3.5 text-sky-500 animate-spin" />
            OPTIK PANTUL
          </span>
          <span className="bg-pink-100 text-pink-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-pink-200">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
            REFLEKSI INTERAKTIF
          </span>
        </div>
      </div>

      {/* Main Split Column Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Interactive panel controls: 30% width */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">🎛️</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Konsol Pemantulan
              </h2>
            </div>

            {/* Playful Sound synthesizer option */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 tracking-wider uppercase">
                  🔊 Efek Nada Cermin (Audio)
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${isAudioEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                Ubah jarak dan tipe cermin untuk memainkan dengungan efek gelombang audio geometri cermin!
              </p>
              <button
                onClick={handleAudioToggle}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2 ${
                  isAudioEnabled 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-white hover:bg-orange-50 text-orange-600 border border-orange-200'
                }`}
                id="btn-mirror-speakers-active"
              >
                {isAudioEnabled ? '🔈 AUDIO OPTIK: AKTIF' : '🔈 AKTIFKAN AUDIO OPTIK'}
              </button>
            </div>

            {/* Slider 1: Jenis Cermin */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-orange-50/70 p-3.5 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  🪞 Jenis Cermin
                </span>
                <span className="text-xs font-black text-white bg-orange-500 px-3 py-1 rounded-full uppercase">
                  {mirrorType === 1 ? 'Datar (Flat)' : mirrorType === 2 ? 'Cembung (Convex)' : 'Cekung (Concave)'}
                </span>
              </div>
              
              <input 
                type="range"
                min="1"
                max="3"
                step="1"
                value={mirrorType}
                onChange={(e) => handleSliderChange('mirror', Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-[#F97316] outline-none"
                id="slider-mirror-type"
              />

              {/* Graphical quick selector boxes underneath */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => handleSliderChange('mirror', 1)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase text-center border transition-all ${
                    mirrorType === 1 
                      ? 'bg-orange-500 text-white border-orange-600' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Datar
                </button>
                <button
                  onClick={() => handleSliderChange('mirror', 2)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase text-center border transition-all ${
                    mirrorType === 2 
                      ? 'bg-orange-500 text-white border-orange-600' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Cembung
                </button>
                <button
                  onClick={() => handleSliderChange('mirror', 3)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase text-center border transition-all ${
                    mirrorType === 3 
                      ? 'bg-orange-500 text-white border-orange-600' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Cekung
                </button>
              </div>
            </div>

            {/* Slider 2: Jarak Objek */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/40">
                <span className="text-xs font-extrabold text-purple-700 tracking-wider uppercase">
                  🚶 Jarak Objek (Mascot)
                </span>
                <span className="text-xs font-black text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  Level {distance} / 10
                </span>
              </div>

              <input 
                type="range"
                min="1"
                max="10"
                step="1"
                value={distance}
                onChange={(e) => handleSliderChange('distance', Number(e.target.value))}
                className="w-full h-3 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600 outline-none"
                id="slider-mirror-distance"
              />

              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span className="text-purple-600">Dekat (1)</span>
                <span>Normal (5)</span>
                <span>Sangat Jauh (10)</span>
              </div>
            </div>

            {/* Spec properties details card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <span className="text-[9px] font-black text-[#7C3AED] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full inline-block">
                METRIK SIFAT BAYANGAN PANTUL
              </span>
              <div className="space-y-1 text-slate-600 font-bold">
                <div className="flex justify-between">
                  <span>Sifat Bayangan:</span>
                  <span className="text-violet-700 font-extrabold">{labelVirtualType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ukuran Skala:</span>
                  <span className="text-slate-800">{(reflectionScale * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Orientasi:</span>
                  <span className="text-slate-800">{reflectionRotate === 180 ? 'Terbalik (Upside Down)' : 'Tegak (Upright)'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sifat Fisik:</span>
                  <span className="text-slate-800">{mirrorType === 3 && distance > 4 ? 'Nyata (Tangible)' : 'Maya (Virtual)'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Clean Glass Mirror Trigger (Reset) */}
          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={handleReset}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-slate-200/50 shadow-sm relative overflow-hidden"
              id="btn-mirror-reset"
            >
              {isPlayingSqueak && (
                <div className="absolute inset-0 bg-[#FFF9C4]/40 animate-pulse" />
              )}
              <span className="animate-spin text-sm">🧽</span> Bersihkan Cermin 🧽
            </button>
          </div>

        </div>

        {/* Right Side Simulator Space Canvas Column: 70% width */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            className="w-full h-[450px] md:h-[480px] bg-slate-150 rounded-[32px] border-[3px] border-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.15)] relative overflow-hidden select-none"
            id="mirror-canvas"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)'
            }}
          >
            {/* Ambient molecular particle dots background */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }} 
            />

            {/* Cozy wooden base standing floor at bottom */}
            <div className="absolute bottom-[20px] left-0 right-0 h-[40px] bg-amber-950/70 opacity-30 border-t border-amber-800" />

            {/* HUD diagnostics label indicators */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-none z-30">
              <span className="text-[10px] text-orange-400 font-extrabold tracking-widest uppercase bg-indigo-950/60 px-3.5 py-2 rounded-full border border-orange-500/20 backdrop-blur-sm shadow-sm flex items-center gap-1">
                🔬 OPTIC SPECTROSCOPY STAND
              </span>
              <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase bg-indigo-950/60 px-3 py-1.5 rounded-full border border-purple-500/20 backdrop-blur-sm shadow-sm">
                MEDIUM REFLEKSI: KACA PERAK 🪞
              </span>
            </div>

            {/* SPECTRAL OPTICS LIGHT TRAVEL LINES (RAY CASTING OVERLAYS) */}
            {/* Draws colorful incident light rays starting from the source mascot towards the mirror surface and then reflect */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <filter id="rayGlow">
                  <feGaussianBlur stdDeviation="3" result="glow"/>
                  <feMerge>
                    <feMergeNode in="glow"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Ray paths representing rays coming from the Source Orange Face eye level towards the glass mirror */}
              {/* If Flat mirror */}
              {mirrorType === 1 && (
                <>
                  {/* Incident path */}
                  <line 
                    x1={actualX + 32} y1={centerY} 
                    x2={mirrorX} y2={centerY} 
                    stroke="#FFBF00" strokeWidth="3.5" strokeDasharray="6 3"
                    filter="url(#rayGlow)"
                    className="opacity-80"
                  />
                  {/* Top slanted ray path */}
                  <line 
                    x1={actualX + 32} y1={centerY - 15} 
                    x2={mirrorX} y2={centerY - 40} 
                    stroke="#F59E0B" strokeWidth="2"
                    filter="url(#rayGlow)"
                    className="opacity-60"
                  />
                  {/* Top reflection path back towards same side */}
                  <line 
                    x1={mirrorX} y1={centerY - 40} 
                    x2={actualX + 32} y2={centerY - 65} 
                    stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3"
                    filter="url(#rayGlow)"
                    className="opacity-50"
                  />
                  {/* Ray behind the mirror to the virtual image focal center */}
                  <line 
                    x1={mirrorX} y1={centerY - 40} 
                    x2={reflectionX - 32} y2={centerY - 40} 
                    stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4"
                    className="opacity-40"
                  />
                </>
              )}

              {/* If Convex mirror */}
              {mirrorType === 2 && (
                <>
                  {/* Straight incident Ray */}
                  <line 
                    x1={actualX + 32} y1={centerY} 
                    x2={mirrorX - 12} y2={centerY} 
                    stroke="#FFBF00" strokeWidth="3.5"
                    filter="url(#rayGlow)"
                    className="opacity-80"
                  />
                  {/* Angle incident Ray */}
                  <line 
                    x1={actualX + 32} y1={centerY - 15} 
                    x2={mirrorX - 10} y2={centerY - 45} 
                    stroke="#F59E0B" strokeWidth="2"
                    className="opacity-75"
                  />
                  {/* Reflected diverging ray going away upward */}
                  <line 
                    x1={mirrorX - 10} y1={centerY - 45} 
                    x2={actualX + 10} y2={centerY - 100} 
                    stroke="#EF4444" strokeWidth="2.5"
                    filter="url(#rayGlow)"
                    className="opacity-85"
                  />
                  {/* Symmetrical trace inside the virtual space representing the smaller size scale */}
                  <line 
                    x1={mirrorX - 10} y1={centerY - 45} 
                    x2={reflectionX - 18} y2={centerY - 15} 
                    stroke="#A855F7" strokeWidth="1.5" strokeDasharray="4 4"
                    className="opacity-50"
                  />
                </>
              )}

              {/* If Concave mirror */}
              {mirrorType === 3 && (
                <>
                  {/* Straight incident Ray */}
                  <line 
                    x1={actualX + 32} y1={centerY} 
                    x2={mirrorX + 12} y2={centerY} 
                    stroke="#FFBF00" strokeWidth="3.5"
                    filter="url(#rayGlow)"
                    className="opacity-80"
                  />
                  {/* Angle incident Ray */}
                  <line 
                    x1={actualX + 32} y1={centerY - 20} 
                    x2={mirrorX + 8} y2={centerY - 50} 
                    stroke="#F59E0B" strokeWidth="2"
                    className="opacity-75"
                  />
                  {/* If Near (distance <= 4): virtual focus ray traces behind */}
                  {distance <= 4 ? (
                    <>
                      <line 
                        x1={mirrorX + 8} y1={centerY - 50} 
                        x2={actualX - 30} y2={centerY - 95} 
                        stroke="#EF4444" strokeWidth="2.5"
                        filter="url(#rayGlow)"
                        className="opacity-85"
                      />
                      <line 
                        x1={mirrorX + 8} y1={centerY - 50} 
                        x2={reflectionX - 48} y2={centerY - 80} 
                        stroke="#A855F7" strokeWidth="1.5" strokeDasharray="4 4"
                        className="opacity-60"
                      />
                    </>
                  ) : (
                    // Far (distance > 4): Inverted real ray intersection
                    <>
                      {/* Bypasses focal point, crosses below center axis to invert representation */}
                      <line 
                        x1={mirrorX + 8} y1={centerY - 50} 
                        // Crosses center axis to the real image location on the opposite quadrant
                        x2={reflectionX - 24} y2={centerY + 15} 
                        stroke="#EF4444" strokeWidth="2.5"
                        filter="url(#rayGlow)"
                        className="opacity-90"
                      />
                    </>
                  )}
                </>
              )}

              {/* Draw reflecting vertex dot anchor */}
              <circle cx={mirrorX} cy={centerY} r="5.5" fill="#EF4444" opacity="0.9" />
            </svg>

            {/* Sparkles sweeping effect for cleaning action */}
            <AnimatePresence>
              {isPlayingSqueak && (
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 700, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.0, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent flex items-center justify-center pointer-events-none z-[45]"
                >
                  <div className="flex items-center gap-3 bg-indigo-950/90 border-2 border-amber-400 py-3 px-6 rounded-3xl text-sm font-black text-amber-300 shadow-2xl">
                    <Sparkle className="w-5 h-5 text-amber-400 animate-spin" />
                    SPLASH! CERMIN KEMBALI KINCLONG! ✨
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* THE GLASS MIRROR COMPONENT STANDING IN THE MIDDLE */}
            {/* Frame height is 220px, standing centered. */}
            <div 
              className="absolute z-[18]"
              style={{
                left: `${mirrorX - 18}px`,
                top: `${centerY - 120}px`
              }}
              id="mirror-element"
            >
              <svg width="36" height="240" className="overflow-visible">
                {/* Convex curves to left; Concave curves away to right; Flat is linear. */}
                {/* Let's draw the physical mirror profile representing its curvature */}
                <defs>
                  <linearGradient id="glassShiny" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
                    <stop offset="30%" stopColor="#38BDF8" stopOpacity="0.5" />
                    <stop offset="70%" stopColor="#0284C7" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Curved visual representation path */}
                {mirrorType === 1 ? (
                  // PERFECT FLAT: Straight straight border rectangles
                  <g>
                    <rect x="13" y="10" width="10" height="220" rx="3" fill="url(#glassShiny)" stroke="#64748B" strokeWidth="2.5" />
                    <rect x="7" y="10" width="6" height="220" rx="1.5" fill="#EF4444" opacity="0.7" /> {/* backing reflective sheet */}
                  </g>
                ) : mirrorType === 2 ? (
                  // CONVEX Bulges to left towards object
                  <g>
                    {/* Reflective curve surface */}
                    <path 
                      d="M 24,10 Q 4,120 24,230"
                      fill="none"
                      stroke="url(#glassShiny)"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    {/* Wood Backing protective shell */}
                    <path 
                      d="M 28,10 Q 8,120 28,230"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path 
                      d="M 20,10 Q 0,120 20,230"
                      fill="none"
                      stroke="#FF4D4D"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </g>
                ) : (
                  // CONCAVE Curves away to right
                  <g>
                    {/* Reflective curve surface */}
                    <path 
                      d="M 4,10 Q 24,120 4,230"
                      fill="none"
                      stroke="url(#glassShiny)"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    {/* Wood Backing protective shell */}
                    <path 
                      d="M 0,10 Q 20,120 0,230"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path 
                      d="M 8,10 Q 28,120 8,230"
                      fill="none"
                      stroke="#FF4D4D"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </g>
                )}

                {/* Highly premium solid wood base support stand block at bottom */}
                <rect x="1" y="222" width="34" height="15" rx="4" fill="#78350F" stroke="#451A03" strokeWidth="2" />
                <rect x="10" y="222" width="16" height="8" rx="2" fill="#B45309" />
              </svg>

              {/* Physical curvature degree text label */}
              <div className="absolute top-[242px] left-[-30px] whitespace-nowrap bg-slate-900 px-3 py-1 text-[8px] font-black text-amber-300 border border-slate-700/60 rounded">
                {mirrorType === 1 ? 'DATAR' : mirrorType === 2 ? 'KEMBUNG' : 'CEKUNG'}
              </div>
            </div>


            {/* THE ACTUAL HIGH FIDELITY MASCOT (OBJECT ON LEFT SIDE) */}
            <motion.div
              animate={{
                left: actualX,
                y: centerY - 32 // centering aligned with mirror support axis
              }}
              transition={{
                type: 'spring',
                stiffness: 85,
                damping: 14
              }}
              className="absolute z-25 flex"
              id="actual-mascot-element"
            >
              {/* THE CUTE ORANGE SPHERICAL MASCOT */}
              {/* CRITICAL GEOMETRY LOCK: Aspect ratio and rounded-full circle */}
              <div 
                className="w-16 h-16 shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-white flex flex-col items-center justify-center relative select-none"
                style={{ width: '64px', height: '64px' }}
              >
                {/* Headphone arc overlay on top of mascot for kid friendliness */}
                <div className="absolute top-[-4px] left-[-4px] right-[-4px] h-[20px] border-t-4 border-slate-700 rounded-t-full pointer-events-none opacity-40 z-0" />

                {/* 3D clay specular finishes */}
                <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg] pointer-events-none" />
                <div className="absolute top-[18%] left-[8%] w-[10%] h-[10%] bg-white rounded-full opacity-50 pointer-events-none" />

                {/* Facial expressions based on target configurations */}
                {isShockedFace ? (
                  // SHOCKED wide O_O eyes for Concave mirror physics
                  <div className="flex flex-col items-center justify-center mt-1">
                    <div className="flex justify-between gap-3.5 z-10 select-none animate-pulse">
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                        <div className="absolute top-0.5 right-0.5 w-[2px] h-[2px] bg-white rounded-full" />
                      </div>
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                        <div className="absolute top-0.5 right-0.5 w-[2px] h-[2px] bg-white rounded-full" />
                      </div>
                    </div>
                    {/* Shocked open mouth screaming */}
                    <div className="w-3 h-3 bg-slate-950 rounded-full mt-1.5 border border-slate-900 shadow-inner" />
                  </div>
                ) : (
                  // COOL / SMILEY standard happy caret eyes
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex justify-between gap-2.5 z-10 select-none mt-1">
                      <svg width="12" height="8" viewBox="0 0 10 8" className="w-3.5 h-2.5">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <svg width="12" height="8" viewBox="0 0 10 8" className="w-3.5 h-2.5">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="w-3.5 h-1.5 bg-slate-950 rounded-b-full mt-1.5" />
                  </div>
                )}

                {/* Cheek blush layout */}
                <div className="absolute bottom-[20%] left-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                <div className="absolute bottom-[20%] right-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75" />
              </div>
            </motion.div>


            {/* THE REFLECTION MASCOT (OBJECT INSIDE/BEHIND MIRROR ON RIGHT SIDE) */}
            {/* Mirror image replicates position reflectionX dynamically, adding visual scale and rotation modifiers */}
            <motion.div
              animate={{
                left: reflectionX,
                y: centerY - 32, // centering line aligned
                scale: reflectionScale,
                rotate: reflectionRotate
              }}
              transition={{
                type: 'spring',
                stiffness: 85,
                damping: 14
              }}
              className="absolute z-20"
              style={{
                opacity: 0.72,
                filter: 'blur(0.5px)'
              }}
              id="reflection-mascot-element"
            >
              {/* THE CUTE ORANGE SPHERICAL REFLECTION MASCOT */}
              {/* CRITICAL GEOMETRY LOCK: Replicated perfectly, same dimensional constraints */}
              <div 
                className="w-16 h-16 shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-sky-300 flex flex-col items-center justify-center relative select-none"
                style={{ width: '64px', height: '64px' }}
              >
                {/* Headphone arch overlay */}
                <div className="absolute top-[-4px] left-[-4px] right-[-4px] h-[20px] border-t-4 border-slate-700 rounded-t-full pointer-events-none opacity-40 z-0" />

                {/* Specific reflection specular highlights matching geometry */}
                <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg] pointer-events-none" />

                {/* Replicated facial expressions */}
                {isShockedFace ? (
                  <div className="flex flex-col items-center justify-center mt-1">
                    <div className="flex justify-between gap-3.5 z-10 select-none">
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                    </div>
                    <div className="w-3 h-3 bg-slate-950 rounded-full mt-1.5" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex justify-between gap-2.5 z-10 select-none mt-1">
                      <svg width="12" height="8" viewBox="0 0 10 8" className="w-3.5 h-2.5">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <svg width="12" height="8" viewBox="0 0 10 8" className="w-3.5 h-2.5">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="w-3.5 h-1.5 bg-slate-950 rounded-b-full mt-1.5" />
                  </div>
                )}

                {/* Cheek blush */}
                <div className="absolute bottom-[20%] left-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-60" />
                <div className="absolute bottom-[20%] right-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-60" />
              </div>

              {/* Dynamic tag overlay for kids identification */}
              <div className="absolute bottom-[-22px] left-[50%] -translate-x-1/2 bg-indigo-950 text-indigo-300 text-[7px] font-black tracking-wider uppercase py-0.5 px-2 rounded opacity-90 border border-slate-700 pointer-events-none">
                BAYANGAN 🌫️
              </div>
            </motion.div>


            {/* THE SPEECH BUBBLE STATIONED COHESIVELY ABOVE THE ACTUAL MASCOT */}
            {/* Tracks x coordinates: actualX perfectly */}
            <motion.div 
              animate={{
                left: actualX - 60, // beautiful alignment overlap
                y: centerY - 120
              }}
              transition={{
                type: 'spring',
                stiffness: 85,
                damping: 14
              }}
              className="absolute pointer-events-none select-none z-30"
            >
              <div className="bg-slate-900/95 border-2 border-orange-400 text-orange-200 text-[10px] md:text-xs font-black px-4 py-2.5 rounded-2xl shadow-2xl w-[190px] text-center backdrop-blur-sm leading-tight relative">
                {getSpeechBubble()}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-r-2 border-b-2 border-orange-400 rotate-45 -mt-1.2 pointer-events-none" />
              </div>
            </motion.div>


            {/* Bottom Horizon status line matching template */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-orange-500 flex items-center justify-center opacity-90 z-[40]">
              <span className="text-orange-300 text-[10px] font-black tracking-widest uppercase">
                ATOR REFLEKSI PENELITI CILIK PROF. JUMP 🪞
              </span>
            </div>

          </div>

          {/* Pedagogy Lab Instruction Card */}
          <div className="bg-amber-150/40 bg-amber-50 rounded-3xl p-5 border-2 border-amber-200/40 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Hukum Pemantulan Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Coba pilih **Cermin Cembung**! Bayanganmu akan menciut imut karena berkas cahaya dipantulkan menyebar keluar. Bila pilih **Cermin Cekung** dan berjalan mendekat, bayanganmu membesar jadi raksasa karena cahayanya mengumpul memfokuskan bayangan virtual tegak!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
