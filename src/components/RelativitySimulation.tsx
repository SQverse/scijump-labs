import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Play, Pause, Sparkles, Compass, Gauge, Clock, Orbit } from 'lucide-react';

interface RelativitySimulationProps {
  onBack: () => void;
}

export default function RelativitySimulation({ onBack }: RelativitySimulationProps) {
  // 1. Controls Panel State
  const [speed, setSpeed] = useState<number>(0); // 0 to 99 % of Light Speed
  const [isTraveling, setIsTraveling] = useState<boolean>(false);

  // Clock elapsed values (representing minutes/seconds in the simulation)
  const [earthTime, setEarthTime] = useState<number>(0);
  const [rocketTime, setRocketTime] = useState<number>(0);

  // For visual consistency, track the container size
  const arenaRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(600);

  useEffect(() => {
    if (arenaRef.current) {
      setCanvasWidth(arenaRef.current.clientWidth);
      const handleResize = () => {
        if (arenaRef.current) {
          setCanvasWidth(arenaRef.current.clientWidth);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Calculate Lorentz factor and relative time progression coefficient
  const beta = speed / 100;
  const lorentzFactor = speed === 0 ? 1 : 1 / Math.sqrt(1 - beta * beta);
  const timeDilationCoeff = speed === 0 ? 1 : Math.sqrt(1 - beta * beta);

  // Time-dilation clock mechanics loop
  useEffect(() => {
    let intervalId: any;
    if (isTraveling) {
      // Run interval highly optimized for smooth clock hand progression
      const tickRateMs = 50; 
      const dtCount = 0.2; // Speed up the clocks so kids can see differences quickly!

      intervalId = setInterval(() => {
        setEarthTime((prev) => prev + dtCount);
        setRocketTime((prev) => prev + dtCount * timeDilationCoeff);
      }, tickRateMs);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTraveling, timeDilationCoeff]);

  // Handle Reset Clocks Trigger
  const handleResetWaktu = () => {
    setEarthTime(0);
    setRocketTime(0);
  };

  // Convert raw decimal seconds to beautiful digital format MM:SS:CC (Centiseconds)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const centis = Math.floor((totalSeconds * 100) % 100);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}:${pad(centis)}`;
  };

  // Dynamic animation duration for the rocket horizontally zooming (exponentially faster as speed increases)
  // 0% = hover gently, >0% starts zooming back and forth!
  const getFlightDuration = () => {
    if (speed === 0) return 10; // Geytley floating
    // Exponentially decreasing from 8s to 0.3s
    return Math.max(0.3, 8 * Math.pow(0.04, speed / 100));
  };

  const flightDuration = getFlightDuration();

  // Wide shocked O_O face when speed > 90%
  const isSpecialFace = speed > 90;

  // Speech bubble text based on current speed
  const getSpeechText = () => {
    if (speed === 0) {
      return "Mesin mati. Waktu berjalan sama dengan di Bumi. 🌍";
    }
    if (speed <= 50) {
      return "Kecepatan standar! Jam kita masih hampir sama. ✈️";
    }
    if (speed <= 90) {
      return "Ngebut! Eh, kok jam tanganku kerasa lebih lambat ya? 🤔";
    }
    return "SUPER CEPAT! Waktu hampir berhentiiii! 😱⏳";
  };

  const speechText = getSpeechText();

  // Visual layout helpers
  const spaceStars = [
    { left: '10%', top: '15%', size: 2.5, delay: '0.1s' },
    { left: '28%', top: '35%', size: 3.5, delay: '1.2s' },
    { left: '45%', top: '12%', size: 2, delay: '0.5s' },
    { left: '65%', top: '40%', size: 3, delay: '2.3s' },
    { left: '88%', top: '18%', size: 3.5, delay: '1.7s' },
    { left: '15%', top: '45%', size: 2, delay: '2.9s' },
    { left: '78%', top: '14%', size: 3, delay: '0.8s' },
    { left: '92%', top: '32%', size: 2, delay: '1.5s' },
    { left: '52%', top: '28%', size: 4, delay: '3.1s' }
  ];

  // Analog Hands Angles
  const earthSecAngle = (earthTime * 6) % 360;
  const earthMinAngle = (earthTime * 0.1) % 360;

  const rocketSecAngle = (rocketTime * 6) % 360;
  const rocketMinAngle = (rocketTime * 0.1) % 360;

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Header sections consistent with kids educational templates */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#7C3AED] font-extrabold text-sm bg-white hover:bg-[#7C3AED]/5 border-2 border-[#7C3AED]/10 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-relativity-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Antariksa: Relativitas Waktu ⏳
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Teori: Relativitas Khusus & Aliran Ruang-Waktu Albert Einstein
          </p>
        </div>

        {/* Space badges */}
        <div className="flex gap-2">
          <span className="bg-purple-50 text-purple-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
            TIME DILATION
          </span>
          <span className="bg-orange-100 text-orange-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin-slow" />
            LORENTZ COEFF: {timeDilationCoeff.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Control Panel column: 30% width (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">⚡</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Navigator Kecepatan
              </h2>
            </div>

            {/* Slider 1: Kecepatan Roket (% Cahaya) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-orange-50/70 p-3.5 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  🚀 Kecepatan Roket
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full animate-pulse">
                  {speed}% Cahaya (c)
                </span>
              </div>
              
              <input 
                type="range"
                min="0"
                max="99"
                step="1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-[#F97316] outline-none"
                id="slider-rocket-speed"
              />

              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>0% (Berhenti)</span>
                <span>50% (Sedang)</span>
                <span>99% (Cepat Mulia!)</span>
              </div>
            </div>

            {/* Lorentz stats card display */}
            <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/40 space-y-2">
              <span className="text-[10px] font-black text-purple-700 tracking-wider uppercase bg-purple-100/70 py-1 px-2.5 rounded-full">
                🔍 FAKTA LORENTZ
              </span>
              
              <div className="grid grid-cols-2 gap-2 pt-2 text-center">
                <div className="bg-white rounded-xl p-2 shadow-sm border border-purple-50">
                  <p className="text-[10px] text-slate-400 font-bold">Faktor Lorentz (γ)</p>
                  <p className="text-sm font-black text-purple-800 mt-0.5">{lorentzFactor.toFixed(3)}x</p>
                </div>
                <div className="bg-white rounded-xl p-2 shadow-sm border border-purple-50">
                  <p className="text-[10px] text-slate-400 font-bold">Waktu Roket vs Bumi</p>
                  <p className="text-sm font-black text-purple-800 mt-0.5">{ (timeDilationCoeff * 100).toFixed(1) }%</p>
                </div>
              </div>
            </div>

            {/* Pedagogy context box */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-orange-100/60 text-slate-600">
              <h4 className="text-xs font-extrabold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                <span>💡</span> BAGAIMANA INI BEKERJA?
              </h4>
              <p className="text-[11px] font-semibold leading-relaxed text-slate-500 mt-1.5 font-sans">
                Menurut Einstein, semakin cepat kamu melesat menembus ruang, semakin lambat kamu menjelajahi waktu! Bagi si Oranye di roket, waktu berjalan normal, namun bagi kita di Bumi, waktu si Oranye tampak melambat drastis!
              </p>
            </div>
          </div>

          {/* Action trigger buttons */}
          <div className="mt-8 pt-4 border-t-2 border-orange-50 space-y-3">
            <button 
              onClick={() => setIsTraveling(!isTraveling)}
              className={`w-full font-black text-sm uppercase py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isTraveling
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/10 active:scale-95'
              }`}
              id="btn-relativity-travel"
            >
              {isTraveling ? (
                <>
                  <Pause className="w-4 h-4 fill-current" /> Jeda Perjalanan! 🌍
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Mulai Perjalanan! 🚀
                </>
              )}
            </button>

            <button 
              onClick={handleResetWaktu}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-slate-200/50"
              id="btn-relativity-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Waktu 🔄
            </button>
          </div>

        </div>

        {/* Right Simulation Canvas column: 70% width (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            ref={arenaRef}
            className="w-full h-[450px] md:h-[480px] bg-[#08091a] rounded-[32px] border-[3px] border-[#16172f] shadow-[0_16px_40px_rgba(0,0,0,0.15)] relative overflow-hidden select-none"
            id="relativity-canvas"
          >
            {/* Soft grid particles mapping space-time fabric curvature */}
            <div 
              className="absolute inset-0 opacity-[0.07] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#818cf8 1.5px, transparent 1.5px)', 
                backgroundSize: '24px 24px' 
              }} 
            />

            {/* Glowing stars in cosmic dome */}
            {spaceStars.map((star, idx) => (
              <div
                key={idx}
                className="absolute bg-white rounded-full opacity-35 animate-pulse pointer-events-none"
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  animationDelay: star.delay
                }}
              />
            ))}

            {/* Space Nebula colors */}
            <div className="absolute top-[10%] right-[20%] w-[160px] h-[160px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute top-[40%] left-[10%] w-[150px] h-[150px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* HUD Status tags overlay */}
            <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none z-[45]">
              <span className="text-[10px] text-orange-400 font-extrabold tracking-widest uppercase bg-indigo-950/60 px-3.5 py-2 rounded-full border border-orange-500/30 backdrop-blur-sm shadow-sm">
                ALAT UKUR RUANG-WAKTU 🔬
              </span>
              <div className="text-right flex flex-col items-end gap-1.5">
                <span className="text-[10px] text-purple-200 font-black tracking-wider uppercase bg-indigo-950/60 px-3.5 py-1.5 rounded-full border border-purple-800/40 backdrop-blur-sm shadow-sm flex items-center gap-1">
                  Status Roket: {speed === 0 ? 'BERHENTI' : (speed > 90 ? 'REDIASI EKSTREM (99% c)' : 'BERLAYAR')}
                </span>
                <span className="text-[10px] text-yellow-300 font-black tracking-wider uppercase bg-indigo-950/60 px-3 py-1.5 rounded-full border border-yellow-500/30 backdrop-blur-sm shadow-sm">
                  Kelajuan Kosmik: {speed === 0 ? '0 km/s' : (299792 * (speed / 100)).toFixed(0) + ' km/s'}
                </span>
              </div>
            </div>

            {/* Bottom half: Curved Planet Earth surface with cute layout design */}
            <div className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-gradient-to-b from-[#1E3A8A] via-[#0D9488] to-[#111827] border-t-8 border-cyan-400/50 shadow-[0_-20px_60px_rgba(34,211,238,0.15)] z-10 overflow-hidden">
              {/* Earth clouds decorative shapes */}
              <div className="absolute top-10 left-[20%] w-24 h-6 bg-white/10 rounded-full blur-md" />
              <div className="absolute top-16 right-[30%] w-32 h-8 bg-white/15 rounded-full blur-lg" />
              <div className="absolute top-4 left-[45%] w-16 h-4 bg-teal-300/20 rounded-full blur-sm" />
            </div>

            {/* CORE VISUAL: 1. "Jam di Bumi" (Steady bottom area clock) */}
            <div className="absolute bottom-8 left-8 z-30 flex flex-col items-center gap-1.5">
              <span className="bg-indigo-950/95 text-cyan-300 text-[10px] font-black px-3 py-1 rounded-full border border-cyan-500/30 shadow flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                JAM DI BUMI (Diam)
              </span>
              
              {/* Analog clock of Earth */}
              <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center justify-center relative bg-gradient-to-br from-slate-900 to-slate-950">
                {/* Clock ticks ticks */}
                <div className="absolute top-1 w-1 h-1 bg-cyan-400 rounded-full" />
                <div className="absolute bottom-1 w-1 h-1 bg-cyan-400 rounded-full" />
                <div className="absolute left-1 w-1 h-1 bg-cyan-400 rounded-full" />
                <div className="absolute right-1 w-1 h-1 bg-cyan-400 rounded-full" />
                
                {/* Hour / Minute visual hand */}
                <div 
                  className="absolute w-1 h-6 bg-slate-300 rounded-full origin-bottom bottom-10 left-[48%] transform" 
                  style={{ transform: `rotate(${earthMinAngle}deg)` }}
                />
                {/* Speedy second hand */}
                <div 
                  className="absolute w-0.5 h-8 bg-[#EF4444] rounded-full origin-bottom bottom-10 left-[49.5%] transform transition-transform duration-100 ease-linear"
                  style={{ transform: `rotate(${earthSecAngle}deg)` }}
                />
                
                {/* Center cap anchor */}
                <circle className="w-2 h-2 rounded-full bg-white z-10" />
              </div>

              {/* Digital time readout */}
              <div className="bg-slate-900/90 border-2 border-slate-800 text-[#22D3EE] font-mono text-xs font-black px-3.5 py-1.5 rounded-xl shadow shadow-cyan-950">
                {formatTime(earthTime)}
              </div>
            </div>


            {/* CORE VISUAL: 2. Rocket with Mascot (Planet Oranye) and RELATIVISTIC attached "Jam di Roket" */}
            {/* The horizontal flight looping animation wrapper */}
            <motion.div
              style={{
                position: 'absolute',
                top: '25%',
                left: '0px',
                zIndex: 25,
              }}
              animate={speed === 0 ? {
                x: [100, 100],
                y: [0, -6, 0] // Gentle bobbing float of inactive engine
              } : {
                // Loop fly horizontally left-to-right (back and forth)
                x: [-150, canvasWidth + 50],
                y: [0, 0]
              }}
              transition={speed === 0 ? {
                y: {
                  repeat: Infinity,
                  duration: 2.5,
                  ease: 'easeInOut'
                }
              } : {
                x: {
                  repeat: Infinity,
                  duration: flightDuration,
                  ease: 'linear'
                }
              }}
              className="relative w-[190px] h-[170px] flex flex-col items-center justify-between pointer-events-none"
              id="flying-rocket-container"
            >
              
              {/* Dynamic Speech bubble attached upright immediately above rocket */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={speechText}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="absolute top-[-54px] bg-slate-900/95 border-2 border-orange-400 text-orange-200 text-[10px] md:text-xs font-black px-4 py-2 rounded-2xl shadow-2xl w-44 md:w-48 text-center pointer-events-none select-none z-[60] backdrop-blur-sm leading-tight flex-shrink-0"
                >
                  <span className="inline-block">
                    {speechText}
                  </span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-r-2 border-b-2 border-orange-400 rotate-45 -mt-1.5 pointer-events-none" />
                </motion.div>
              </AnimatePresence>

              {/* ROCKET BODY with embedded Planet Oranye */}
              <div className="w-[120px] h-[90px] relative flex items-center justify-center">

                {/* Engine fire propulsion particles (scaled bigger depending on speed) */}
                {speed > 0 && (
                  <motion.div 
                    animate={{ scaleX: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 0.15 }}
                    className="absolute left-[-42px] top-[28px] origin-right h-[24px] bg-gradient-to-l from-orange-500 via-amber-400 to-transparent blur-[1px]' z-0 rounded-l-full"
                    style={{ 
                      width: `${25 + (speed / 99) * 45}px`,
                      filter: `hue-rotate(${speed > 90 ? '140deg' : '0deg'})` // Neon fuchsia flame when warping speed of light
                    }}
                  />
                )}

                {/* THE ROCKET SHELL SVG */}
                <svg viewBox="0 0 120 90" className="w-full h-full drop-shadow-lg z-10 relative">
                  {/* Left & Right Red fin boosters */}
                  <path d="M15 35 Q5 25 2 40 L5 60 Q18 55 20 45 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2" />
                  <path d="M15 50 Q5 60 2 45 L5 30 Q18 35 20 40 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2" />

                  {/* Sleek metallic white body cone */}
                  <path d="M20 22 C45 22 80 28 108 45 C80 62 45 68 20 68 Z" fill="#F8FAFC" stroke="#334155" strokeWidth="2.5" />
                  {/* Glass dome window center capsule covering the mascot inside */}
                  <path d="M52 26 C68 26 80 32 88 45 C80 58 68 64 52 64 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" opacity="0.45" />

                  {/* Rear exhaust jet engine nozzle */}
                  <rect x="8" y="36" width="12" height="18" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="2" />
                  <line x1="8" y1="41" x2="20" y2="41" stroke="#334155" />
                  <line x1="8" y1="45" x2="20" y2="45" stroke="#334155" />
                  <line x1="8" y1="49" x2="20" y2="49" stroke="#334155" />
                </svg>

                {/* EMBEDDED CUTE ORANGE CHARACTER MASCOT */}
                {/* STRICTLY GEOMETRY-LOCKED PERFECT CIRCLE FOR FACE */}
                <div 
                  className="absolute left-[46px] top-[26px] z-20 w-10 h-10 shrink-0 flex-shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.7)] border-2 border-white/50 flex flex-col items-center justify-center relative select-none"
                  style={{ width: '40px', height: '40px' }}
                >
                  {/* Specular premium highlights */}
                  <div className="absolute top-1 left-1.5 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg] pointer-events-none" />
                  <div className="absolute top-[18%] left-[8%] w-[10%] h-[10%] bg-white rounded-full opacity-50 pointer-events-none" />

                  {/* Eyes layout conditions */}
                  {isSpecialFace ? (
                    /* SHOCKED WIDE O_O EYES */
                    <div className="flex justify-between gap-2.5 z-10 select-none animate-bounce">
                      <div className="w-2 h-2 bg-slate-900 rounded-full flex items-center justify-center relative">
                        <div className="absolute top-0.5 right-0.5 w-[2px] h-[2px] bg-white rounded-full" />
                      </div>
                      <div className="w-2 h-2 bg-slate-900 rounded-full flex items-center justify-center relative">
                        <div className="absolute top-0.5 right-0.5 w-[2px] h-[2px] bg-white rounded-full" />
                      </div>
                    </div>
                  ) : (
                    /* IDLE HAPPY caret ^_^ small eyes */
                    <div className="flex justify-between gap-1.5 z-10 select-none">
                      <svg width="8" height="6" viewBox="0 0 10 8" className="w-2 h-1.5">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <svg width="8" height="6" viewBox="0 0 10 8" className="w-2 h-1.5">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* Cute mouth layout matching */}
                  <div className="z-10 mt-0.5">
                    {isSpecialFace ? (
                      /* Surprised open O mouth */
                      <div className="w-2 h-2 bg-slate-900 rounded-full border border-slate-950 shadow-inner" />
                    ) : (
                      /* Idle flat straight happy line */
                      <div className="w-2 h-[1.8px] bg-slate-900 rounded-full" />
                    )}
                  </div>

                  {/* Blushing checks */}
                  <div className="absolute bottom-[20%] left-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                  <div className="absolute bottom-[20%] right-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                </div>
              </div>

              {/* ATTACHED "JAM DI ROKET" (RELATIVISTIC CLOCK) */}
              <div className="flex flex-col items-center gap-1 z-30">
                <span className="bg-indigo-950 text-orange-300 text-[8px] font-black px-2 py-0.5 rounded-full border border-orange-500/30 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-orange-400 animate-ping" />
                  JAM ROKET (Bergerak)
                </span>

                {/* Relativistic Analog Clock of Rocket */}
                <div className="w-14 h-14 rounded-full bg-slate-900 border-3 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)] flex items-center justify-center relative bg-gradient-to-br from-slate-900 to-slate-950">
                  {/* Clock ticks ticks */}
                  <div className="absolute top-0.5 w-[3px] h-[3px] bg-orange-400 rounded-full" />
                  <div className="absolute bottom-0.5 w-[3px] h-[3px] bg-orange-400 rounded-full" />
                  <div className="absolute left-0.5 w-[3px] h-[3px] bg-orange-400 rounded-full" />
                  <div className="absolute right-0.5 w-[3px] h-[3px] bg-orange-400 rounded-full" />
                  
                  {/* Hour/Minute visual hand */}
                  <div 
                    className="absolute w-0.5 h-4 bg-slate-300 rounded-full origin-bottom bottom-7 left-[48%] transform" 
                    style={{ transform: `rotate(${rocketMinAngle}deg)` }}
                  />
                  {/* Relativitstically ticking second hand (will tick slow!) */}
                  <div 
                    className="absolute w-0.5 h-5 bg-[#EF4444] rounded-full origin-bottom bottom-7 left-[48.5%] transform transition-transform duration-100 ease-linear"
                    style={{ transform: `rotate(${rocketSecAngle}deg)` }}
                  />
                  
                  <circle className="w-1.5 h-1.5 rounded-full bg-white z-10" />
                </div>

                {/* Relativistic digital clock readout */}
                <div className="bg-slate-900/95 text-orange-400 font-mono text-[10px] font-black px-2.5 py-1 rounded-lg border border-slate-800 shadow shadow-orange-950">
                  {formatTime(rocketTime)}
                </div>
              </div>

            </motion.div>

            {/* Bottom Horizon line HUD branding */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-orange-500 flex items-center justify-center opacity-90 z-[40]">
              <span className="text-orange-300 text-[10px] font-black tracking-widest uppercase">
                ATOR RUANG-WAKTU PENELITI CILIK PROF. JUMP ⏱️
              </span>
            </div>

          </div>

          {/* Pedagogy lab instructions */}
          <div className="bg-amber-100/60 rounded-3xl p-5 border-2 border-amber-200/50 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Relativitas Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Coba geser Kecepatan Roket ke 99% dan klik 'Mulai Perjalanan! 🚀'. Lihat! Jam di roket si Oranye berdetak jauh lebih lambat dari jam kita di Bumi! Keren sekali kan teori Relativitas Einstein?"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
