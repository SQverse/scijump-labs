import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles, Compass, HelpCircle, Star, Gauge, Globe } from 'lucide-react';

interface KeplerSimulationProps {
  onBack: () => void;
}

export default function KeplerSimulation({ onBack }: KeplerSimulationProps) {
  // 1. Interactive Control States
  const [eccentricity, setEccentricity] = useState<number>(0.5); // Range 0 to 0.8 (step 0.1)
  const [speed, setSpeed] = useState<number>(3); // Range 1 to 5
  const [sunSize, setSunSize] = useState<number>(2); // Range 1 to 3 (scales the visual mass)

  // Kepler orbital position: standard parameter is eccentric anomaly angle E (0 to 2PI)
  const [eccentricAnomaly, setEccentricAnomaly] = useState<number>(0);

  // Layout boundaries
  const arenaRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(600);
  const [canvasHeight, setCanvasHeight] = useState<number>(450);

  useEffect(() => {
    if (arenaRef.current) {
      setCanvasWidth(arenaRef.current.clientWidth);
      setCanvasHeight(arenaRef.current.clientHeight);
      
      const handleResize = () => {
        if (arenaRef.current) {
          setCanvasWidth(arenaRef.current.clientWidth);
          setCanvasHeight(arenaRef.current.clientHeight);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Kepler's 2nd Law Physics Engine loop utilizing requestAnimationFrame
  useEffect(() => {
    let animId: number;
    
    const tick = () => {
      setEccentricAnomaly((prev) => {
        // Kepler angular increment delta E is proportional to 1 / (1 - e * cos(E))
        // Denominator decreases at perihelion (cos E ~ 1) hence speed shoots up!
        const cosE = Math.cos(prev);
        const baseSpeed = 0.007 * speed;
        const delta = baseSpeed / (1 - eccentricity * cosE);
        
        return (prev + delta) % (Math.PI * 2);
      });
      
      animId = requestAnimationFrame(tick);
    };
    
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [speed, eccentricity]);

  // Reset Orbit parameters to default setup
  const handleReset = () => {
    setEccentricity(0.5);
    setSpeed(3);
    setSunSize(2);
    setEccentricAnomaly(0);
  };

  // Dimensions & Scale Calculations
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Semi-major axis (a) dynamically chosen to fit inside container elegantly
  const a = Math.min(150, canvasWidth * 0.25 || 150);
  
  // Semi-minor axis (b) derived from Kepler identity: b = a * sqrt(1 - e^2)
  const b = a * Math.sqrt(1 - eccentricity * eccentricity);
  
  // Focus offset distance from center of ellipse: c = a * e
  const c = a * eccentricity;

  // Visual Ellipse center relative to origin
  // If the Sun sits exactly in the DEAD CENTER (centerX, centerY), we offset the orbit path center
  // by -c horizontally, making the Sun position equal to the orbit focal point!
  const ellipseCenterX = centerX - c;
  const ellipseCenterY = centerY;

  // Planet Position relative to origin (where focus Sun is at centerX, centerY)
  const cosE = Math.cos(eccentricAnomaly);
  const sinE = Math.sin(eccentricAnomaly);

  // Position on ellipse relative to ellipse center
  const pXOnEllipse = a * cosE;
  const pYOnEllipse = b * sinE;

  // Translate relative to the focus (where the sun sits)
  const planetX = pXOnEllipse - c;
  const planetY = pYOnEllipse;

  // Real scalar distance to sun core
  const currentDistanceRatio = 1 - eccentricity * cosE;

  // Determine active states for the facial visual expression
  // Planet moves at highest peak speeds when closest to sun (perihelion: cosE > 0.6)
  const isNearSun = cosE > 0.6;

  // Interactive Kepler telemetry metrics
  const displayDistanceMil = (150 * currentDistanceRatio).toFixed(0);
  const displayVelocityKms = (12 * speed * Math.sqrt(2 / currentDistanceRatio - 1)).toFixed(1);

  // Sun diameter scaling
  const getSunDiameter = () => {
    if (sunSize === 1) return 64;
    if (sunSize === 2) return 88;
    return 112;
  };
  const sunDiameter = getSunDiameter();

  // Bullet speech bubble text logic
  const getSpeechText = () => {
    if (cosE > 0.85) {
      return "Wuuusss! Dekat Matahari seru banget, cepet banget jalannya! ☄️";
    }
    if (cosE < -0.85) {
      return "Hoammm... di luar sini sepi dan lambat banget... 😴";
    }
    if (eccentricity >= 0.7) {
      return "Wah, orbitku lonjong banget kayak telur! 🥚";
    }
    return "Lihat aku menari mengelilingi Matahari! 🪐";
  };

  const speechText = getSpeechText();

  // Background Star coordinates once mapped
  const spaceStars = [
    { left: '8%', top: '15%', size: 3, delay: '0.4s' },
    { left: '22%', top: '82%', size: 2, delay: '1.2s' },
    { left: '45%', top: '18%', size: 4, delay: '0.8s' },
    { left: '78%', top: '22%', size: 3, delay: '2.4s' },
    { left: '88%', top: '75%', size: 2, delay: '1.6s' },
    { left: '15%', top: '48%', size: 2, delay: '3.1s' },
    { left: '92%', top: '40%', size: 4, delay: '0.2s' },
    { left: '55%', top: '88%', size: 3, delay: '1.9s' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Header section Consistent with kids app UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-extrabold text-sm bg-white hover:bg-orange-50/50 border-2 border-orange-100 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-kepler-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Antariksa: Hukum Kepler 🪐
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Teori: Hukum Gerak Planet
          </p>
        </div>

        {/* Physics badge overlay */}
        <div className="flex gap-2">
          <span className="bg-orange-100 text-orange-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            KECEPATAN VARIATIF
          </span>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-indigo-200">
            <Compass className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
            HUKUM SPEKTRAL I & II
          </span>
        </div>
      </div>

      {/* Main Split Screen Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Column Controls – 30% Width (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">🌍</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Parameter Orbit
              </h2>
            </div>

            {/* Range Slider 1: Kelonjongan Orbit (Eccentricity) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  🥚 Kelonjongan Orbit
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
                  e = {eccentricity.toFixed(1)}
                </span>
              </div>
              <input 
                type="range"
                min="0.0"
                max="0.8"
                step="0.1"
                value={eccentricity}
                onChange={(e) => setEccentricity(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-eccentricity"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Bulat (0.0)</span>
                <span>Oval Sedang</span>
                <span>Sangat Lonjong (0.8)</span>
              </div>
            </div>

            {/* Range Slider 2: Kecepatan Planet */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  🚀 Kecepatan Planet
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
                  Level {speed}
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="5"
                step="1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-orbit-speed"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Sangat Santai</span>
                <span>Normal</span>
                <span>Sangat Kilat</span>
              </div>
            </div>

            {/* Range Slider 3: Ukuran Matahari (Massa) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  ☀️ Ukuran Matahari (Massa)
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
                  Massa: {sunSize}☉
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="3"
                step="1"
                value={sunSize}
                onChange={(e) => setSunSize(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-sun-mass"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Kerdil Kuning</span>
                <span>Sedang</span>
                <span>Raksasa Jingga</span>
              </div>
            </div>

            {/* Kepler explanation layout info */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-orange-100/60 text-slate-600">
              <h4 className="text-xs font-extrabold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                <span>💡</span> HUKUM KEPLER II
              </h4>
              <p className="text-[11px] font-semibold leading-relaxed text-slate-500 mt-1.5 leading-relaxed">
                Planet tidak bergerak dalam kecepatan tetap! Di perihelion (titik terdekat), gravitasi matahari menarik planet sangat kuat sehingga kecepatannya melesat naik!
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-sm uppercase py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              id="btn-kepler-reset"
            >
              <RotateCcw className="w-4 h-4" /> Reset Orbit
            </button>
          </div>

        </div>

        {/* Right Column Orbit Simulation – 70% Width (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            ref={arenaRef}
            className="w-full h-[400px] md:h-[450px] bg-slate-900 rounded-[32px] border-2 border-indigo-950/40 shadow-[0_16_40px_rgba(0,0,0,0.1)] relative overflow-hidden select-none"
            id="kepler-canvas"
          >
            {/* Custom glowing space grid system */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#818CF8 1.5px, transparent 1.5px)', 
                backgroundSize: '28px 28px' 
              }} 
            />

            {/* Stardust particles scatterings */}
            {spaceStars.map((star, idx) => (
              <div
                key={idx}
                className="absolute bg-white rounded-full opacity-40 animate-pulse"
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  animationDelay: star.delay
                }}
              />
            ))}

            {/* Overlap ambient radial glows around space lab */}
            <div className="absolute top-[20%] left-[20%] w-[120px] h-[120px] bg-indigo-500/15 rounded-full blur-[80px]" />
            <div className="absolute bottom-[20%] right-[20%] w-[140px] h-[140px] bg-sky-500/10 rounded-full blur-[90px]" />

            {/* HUD Scientific Indicators Overlay in dark canvas */}
            <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none z-10">
              <span className="text-[10px] text-orange-400 font-extrabold tracking-widest uppercase bg-indigo-950/60 px-3.5 py-2 rounded-full border border-indigo-800/50 backdrop-blur-sm">
                LABORATORIUM ORBIT KEPLER 🛰️
              </span>
              <div className="text-right flex flex-col items-end gap-1 font-sans">
                <span className="text-[10px] text-indigo-200 font-black tracking-wider uppercase bg-indigo-950/60 px-3 py-1.5 rounded-full border border-indigo-800/40 backdrop-blur-sm shadow-sm flex items-center gap-1">
                  <Globe className="w-3 h-3 text-indigo-400" /> Jarak ke Bintang: {displayDistanceMil} Juta KM
                </span>
                <span className="text-[10px] text-emerald-300 font-black tracking-wider uppercase bg-indigo-950/60 px-3 py-1.5 rounded-full border border-indigo-800/40 backdrop-blur-sm shadow-sm flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-emerald-400" /> Kecepatan Planet: {displayVelocityKms} KM/S
                </span>
              </div>
            </div>

            {/* Dynamic Orbit SVG Track Background Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
              {/* Ellipse path drawn using coordinates centered around Focus (Sun position) */}
              <ellipse 
                cx={ellipseCenterX}
                cy={ellipseCenterY}
                rx={a}
                ry={b}
                fill="none"
                stroke="rgba(251, 146, 60, 0.45)"
                strokeWidth="3"
                strokeDasharray="8 6"
              />

              {/* Kepler sweep vector radii line connecting Sun center to Planet center */}
              <line 
                x1={centerX}
                y1={centerY}
                x2={centerX + planetX}
                y2={centerY + planetY}
                stroke="rgba(129, 140, 248, 0.55)"
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />

              {/* Shaded mini area segment visualizer representing equal times sector */}
              {isNearSun && (
                <path 
                  d={`M ${centerX} ${centerY} L ${centerX + planetX} ${centerY + planetY} A ${a} ${b} 0 0 1 ${centerX + planetX - 18} ${centerY + planetY - 14} Z`}
                  fill="rgba(249, 115, 22, 0.12)"
                  stroke="rgba(249, 115, 22, 0.15)"
                  strokeWidth="1"
                />
              )}
            </svg>

            {/* Center Star: Matahari (Sun) at focus (dead center of canvas) */}
            <motion.div
              style={{
                width: sunDiameter,
                height: sunDiameter,
                top: centerY - sunDiameter / 2,
                left: centerX - sunDiameter / 2,
              }}
              className="absolute rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-[0_0_50px_rgba(245,158,11,0.45),inset_-4px_-4px_10px_rgba(0,0,0,0.2),inset_4px_4px_10px_rgba(255,255,255,0.7)] border-[3px] border-amber-300/40 flex flex-col items-center justify-center z-20 select-none cursor-help"
            >
              {/* Solar corona pulsations */}
              <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-[-12px] rounded-full bg-orange-400/15 animate-pulse" />
              
              {/* Shiny clay gloss highlight overlays */}
              <div className="absolute top-[10%] left-[15%] w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg]" />
              
              {/* Sun's adorably warm face */}
              <div className="flex flex-col items-center justify-center gap-1 mt-1 z-10 scale-95 md:scale-100">
                {/* Sun Eyes: Two tiny cute happy arch eyes */}
                <div className="flex justify-between gap-4">
                  <svg width="10" height="6" viewBox="0 0 10 6" className="w-2.5 h-1.5 opacity-90">
                    <path d="M 1 5 A 4 4 0 0 1 9 5" fill="none" stroke="#2c1a04" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                  <svg width="10" height="6" viewBox="0 0 10 6" className="w-2.5 h-1.5 opacity-90">
                    <path d="M 1 5 A 4 4 0 0 1 9 5" fill="none" stroke="#2c1a04" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Sun Mouth: Round wide smiley smile */}
                <div className="w-3.5 h-2 bg-[#2c1a04] rounded-b-full shadow-inner mt-0.5" />
                
                {/* Cheeks: Soft golden rosy circles */}
                <div className="absolute bottom-[28%] left-[12%] w-[20%] h-[10%] bg-orange-600/25 rounded-full" />
                <div className="absolute bottom-[28%] right-[12%] w-[20%] h-[10%] bg-orange-600/25 rounded-full" />
              </div>

              {/* Hover Sun Label */}
              <span className="absolute bottom-[-18px] bg-orange-500/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap shadow border border-orange-400 z-30 select-none">
                Bintang Induk
              </span>
            </motion.div>

            {/* The Planet Mascot (Orange Character Ball) */}
            <motion.div
              style={{
                width: 52,
                height: 52,
                top: centerY + planetY - 26,
                left: centerX + planetX - 26,
              }}
              className="absolute z-30 flex flex-col items-center justify-center w-[52px] h-[52px] shrink-0 flex-shrink-0 aspect-square rounded-full"
              id="planet-mascot-avatar"
            >
              {/* Dynamic Speech bubble attached upright immediately above planet cursor */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={speechText}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="absolute bottom-[66px] bg-indigo-950/90 border-2 border-indigo-700 text-indigo-100 text-[10px] md:text-xs font-black px-4 py-2 rounded-2xl shadow-2xl w-44 md:w-52 text-center pointer-events-none select-none z-50 backdrop-blur-sm"
                >
                  {speechText}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-950 border-r-2 border-b-2 border-indigo-700 rotate-45 -mt-1.5 pointer-events-none" />
                </motion.div>
              </AnimatePresence>

              {/* Decorative Planet Ring behind ball representation */}
              <div className="absolute w-16 h-4 bg-indigo-400/25 rounded-full border border-indigo-300/30 transform rotate-[18deg] pointer-events-none top-4 scale-[1.3] z-10" />

              {/* THE ORANGE PLANET BALL MASS */}
              <div 
                className="w-[52px] h-[52px] shrink-0 flex-shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-white/50 flex flex-col items-center justify-center relative select-none z-20"
              >
                {/* Specular vector shine gloss */}
                <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg]" />
                <div className="absolute top-[18%] left-[10%] w-[10%] h-[10%] bg-white rounded-full opacity-50" />

                {/* Eyes: Dynamic conditional rendering matching the exact facial parameters */}
                {isNearSun ? (
                  /* ACTIVE STATE: Shocked/Thrilled open round eyes O_O */
                  <div className="flex justify-between gap-3.5 z-10 select-none animate-pulse">
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                      <div className="absolute top-0.5 right-0.5 w-[3px] h-[3px] bg-white rounded-full" />
                    </div>
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                      <div className="absolute top-0.5 right-0.5 w-[3px] h-[3px] bg-white rounded-full" />
                    </div>
                  </div>
                ) : (
                  /* IDLE STATE: Happy, delicate, thin closed inverted-V caret eyes ^_^ */
                  <div className="flex justify-between gap-2 z-10 select-none">
                    <svg width="10" height="8" viewBox="0 0 10 8" className="w-2.5 h-2">
                      <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <svg width="10" height="8" viewBox="0 0 10 8" className="w-2.5 h-2">
                      <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* Mouth: Dynamic matched specs */}
                <div className="z-10 mt-1">
                  {isNearSun ? (
                    /* ACTIVE STATE mouth: surprised open circle */
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-950 shadow-inner" />
                  ) : (
                    /* IDLE STATE mouth: delicate slim horizontal line - */
                    <div className="w-2.5 h-[2px] bg-slate-900 rounded-full" />
                  )}
                </div>

                {/* Cheeks: Cute blush pills */}
                <div className="absolute bottom-[24%] left-[15%] w-[18%] h-[8%] bg-rose-400/90 rounded-full" />
                <div className="absolute bottom-[24%] right-[15%] w-[18%] h-[8%] bg-rose-400/90 rounded-full" />
              </div>

              {/* Micro Planet labeling tag */}
              <span className="bg-amber-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full mt-1.5 shadow border border-amber-500 z-10 select-none uppercase tracking-wider">
                Planet Oranye
              </span>
            </motion.div>

            {/* Ground / Lab Bottom Rail representation */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-indigo-800 flex items-center justify-center shadow-[0_-4px_16px_rgba(0,0,0,0.3)] z-25">
              <span className="text-indigo-300 text-[10px] font-black tracking-widest uppercase opacity-80">
                PROYEKTOR LAB LUAR ANGKASA PROF. JUMP 🛰️
              </span>
            </div>

          </div>

          {/* Pedagogy guidelines footer speech balloon */}
          <div className="bg-amber-100/60 rounded-3xl p-5 border-2 border-amber-200/50 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Laboran Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Ubah Kelonjongan Orbit ke nilai maksimum (e = 0.8) lalu amati pergerakan si Oranye. Kamu akan melihat dia 'dicambuk' dengan hebat saat berada dekat dengan gravitasi Matahari, dan malas berjalan lambat saat berada sangat jauh!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
