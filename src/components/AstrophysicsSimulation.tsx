import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles, Compass, Star, Gauge, Globe } from 'lucide-react';

interface AstrophysicsSimulationProps {
  onBack: () => void;
}

export default function AstrophysicsSimulation({ onBack }: AstrophysicsSimulationProps) {
  // 1. Controls Panel State
  const [starMass, setStarMass] = useState<number>(3); // 1 to 10
  const [safeDistance, setSafeDistance] = useState<number>(3); // 1 to 5 (Orbit radius scale)

  // Supernova custom animation states
  const [isSupernovaActive, setIsSupernovaActive] = useState<boolean>(false);
  const [supernovaFlash, setSupernovaFlash] = useState<boolean>(false);
  const [supernovaResetMessage, setSupernovaResetMessage] = useState<boolean>(false);

  // Layout boundaries tracking
  const arenaRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(600);
  const [canvasHeight, setCanvasHeight] = useState<number>(450);

  // Time ticker state for smooth orbiting / floating animation
  const [orbitAngle, setOrbitAngle] = useState<number>(0);

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

  // Frame request loop for smooth orbit or swirling suction
  useEffect(() => {
    let animId: number;
    const tick = () => {
      setOrbitAngle((prev) => {
        // Star Mass 9-10 (Black Hole): Spin extremely fast, other states spin normally
        const speedMultiplier = starMass >= 9 ? 0.04 : (starMass >= 5 ? 0.015 : 0.01);
        return (prev + speedMultiplier) % (Math.PI * 2);
      });
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [starMass]);

  // Handle Supernova Trigger of reset
  const handleSupernovaReset = () => {
    if (isSupernovaActive) return;

    setIsSupernovaActive(true);
    setSupernovaFlash(true);
    setSupernovaResetMessage(true);

    // Initial blinding blast flash duration
    setTimeout(() => {
      setSupernovaFlash(false);
    }, 400);

    // Fade out explosion, reset controls back to normal star limits
    setTimeout(() => {
      setStarMass(3);
      setSafeDistance(3);
      setIsSupernovaActive(false);
    }, 1800);

    // Speech text message duration
    setTimeout(() => {
      setSupernovaResetMessage(false);
    }, 3500);
  };

  // Coordinates Calculations
  const centerX = canvasWidth / 2 || 300;
  const centerY = canvasHeight / 2 || 225;

  // Orbit radius calculation based on Slider 2 (safeDistance) and Star Mass size
  // If Mass is high, core star is larger so push orbit radius further out
  const baseRadius = 50 + safeDistance * 28;
  const radiusX = baseRadius + (starMass >= 5 && starMass <= 8 ? 20 : 0);
  const radiusY = radiusX * 0.7; // Elliptical look in 2.5D perspective

  // If Black Hole, the gravity sucks the planet into the absolute center (X: 0, Y: 0)
  const isBlackHole = starMass >= 9;

  // We map the trajectory:
  const targetX = centerX + radiusX * Math.cos(orbitAngle);
  const targetY = centerY + radiusY * Math.sin(orbitAngle);

  // Active / Shocked facial state if Mass >= 8 or being sucked inside black hole
  const isActiveFace = starMass >= 8;

  // Speech bubble selector
  const getSpeechText = () => {
    if (supernovaResetMessage) {
      return "BOOOM! Lahir kembali dari debu bintang! ✨";
    }
    if (isBlackHole) {
      return "TIDAAAAAK! Gravitasinya terlalu kuat, aku tersedoooot! 🕳️😵";
    }
    if (starMass >= 5 && starMass <= 8) {
      return "Uwaaa! Bintangnya jadi Raksasa Merah, aku kepanasan! 🥵";
    }
    return "Wah, hangatnya sinar bintang ini! Nyaman banget~ ☀️";
  };

  const speechText = getSpeechText();

  // Background stars coords list
  const cosmosStars = [
    { left: '12%', top: '18%', size: 2, delay: '0.8s' },
    { left: '26%', top: '78%', size: 3, delay: '1.4s' },
    { left: '48%', top: '14%', size: 4, delay: '0.6s' },
    { left: '72%', top: '26%', size: 2, delay: '2.1s' },
    { left: '86%', top: '82%', size: 3, delay: '1.9s' },
    { left: '18%', top: '46%', size: 2, delay: '2.8s' },
    { left: '90%', top: '38%', size: 4, delay: '0.4s' },
    { left: '58%', top: '86%', size: 3, delay: '1.2s' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Header section consistent with SciJump! templates */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#7C3AED] font-extrabold text-sm bg-white hover:bg-[#7C3AED]/5 border-2 border-[#7C3AED]/10 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-astrophysics-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Antariksa: Astrofisika Bintang 🌟
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Teori: Gravitasi Universal & Evolusi Bintang
          </p>
        </div>

        {/* Space badges layout overlay */}
        <div className="flex gap-2">
          <span className="bg-[#FAF5FF] text-[#7C3AED] text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-[#F3E8FF]">
            <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
            EVOLUSI BINTANG
          </span>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-indigo-200">
            <Compass className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
            BATAS CHANDRASEKHAR
          </span>
        </div>
      </div>

      {/* Main Split Screen Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Column Controls: 30% Width (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">💫</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Menu Astrofisika
              </h2>
            </div>

            {/* Slider 1: Massa Bintang Induk */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-purple-50/60 p-3 rounded-2xl border border-purple-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  ⭐ Massa Bintang Induk
                </span>
                <span className="text-sm font-black text-purple-700 bg-purple-100/80 px-3 py-1 rounded-full">
                  M = {starMass}☉
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="10"
                step="1"
                value={starMass}
                onChange={(e) => setStarMass(Number(e.target.value))}
                className="w-full h-3 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-[#7C3AED] outline-none"
                id="slider-star-mass"
              />
              
              {/* Star phase indicators */}
              <div className="bg-slate-50/70 rounded-2xl p-3 border border-slate-100 space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className={starMass <= 4 ? 'text-amber-600 font-black' : 'text-slate-400'}>
                    ● 1 - 4: Kuning ☀️
                  </span>
                  <span className={starMass >= 5 && starMass <= 8 ? 'text-red-600 font-black' : 'text-slate-400'}>
                    ● 5 - 8: Raksasa Merah 🥵
                  </span>
                </div>
                <div className="text-center text-[11px] font-bold">
                  <span className={starMass >= 9 ? 'text-purple-600 font-black animate-pulse' : 'text-slate-400'}>
                    ● 9 - 10: Lubang Hitam 🕳️😵
                  </span>
                </div>
              </div>
            </div>

            {/* Slider 2: Jarak Aman Orbit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-orange-50/65 p-3 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  🛰️ Jarak Aman (Orbit)
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
                  R = {safeDistance} AU
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="5"
                step="1"
                disabled={isBlackHole}
                value={safeDistance}
                onChange={(e) => setSafeDistance(Number(e.target.value))}
                className={`w-full h-3 rounded-lg appearance-none cursor-pointer outline-none ${
                  isBlackHole ? 'bg-slate-200 cursor-not-allowed opacity-50' : 'bg-orange-100 accent-orange-500'
                }`}
                id="slider-safe-distance"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Dekat (Panas)</span>
                <span>Normal</span>
                <span>Jauh (Dingin)</span>
              </div>
              {isBlackHole && (
                <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2.5 rounded-xl border border-red-100 text-center animate-pulse">
                  ⚠️ Gravitasi runtuh! Jarak aman tidak berlaku!
                </p>
              )}
            </div>

            {/* Science pedagogy description */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-orange-100/60 text-slate-600">
              <h4 className="text-xs font-extrabold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                <span>💡</span> GRAVITASI & EVOLUSI
              </h4>
              <p className="text-[11px] font-semibold leading-relaxed text-slate-500 mt-1.5 leading-relaxed font-sans">
                Setiap bintang memiliki takdir masing-masing tergantung massanya. Bintang kecil menjadi kerdil, bintang raksasa meledak menghasilkan supernova, dan menyisakan gravitasi tak terbatas yaitu <strong className="text-slate-800">Lubang Hitam</strong>!
              </p>
            </div>
          </div>

          {/* Supernova blast button reset set */}
          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={handleSupernovaReset}
              disabled={isSupernovaActive}
              className={`w-full text-white font-black text-sm uppercase py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSupernovaActive
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20 active:scale-95'
              }`}
              id="btn-supernova-reset"
            >
              <RotateCcw className="w-4 h-4 animate-spin-slow" /> Ledakan Supernova! ✨
            </button>
          </div>

        </div>

        {/* Right Column Cosmos Simulation: 70% Width (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 animate-fade-in">
          
          <div 
            ref={arenaRef}
            className="w-full h-[400px] md:h-[450px] bg-[#0c0f1d] rounded-[32px] border-[3px] border-[#1d1b35] shadow-[0_16_40px_rgba(0,0,0,0.15)] relative overflow-hidden select-none"
            id="astrophysics-canvas"
          >
            {/* Blinding screen flash for Supernova explosion effect */}
            <AnimatePresence>
              {supernovaFlash && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-white z-[70] flex items-center justify-center"
                >
                  <div className="text-4xl text-yellow-500 font-extrabold animate-ping">⚡ SUPERNOVA! ⚡</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glowing cosmos spaces grids */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#a78bfa 1.5px, transparent 1.5px)', 
                backgroundSize: '32px 32px' 
              }} 
            />

            {/* Shimmering starry sky background */}
            {cosmosStars.map((star, idx) => (
              <div
                key={idx}
                className="absolute bg-white rounded-full opacity-35 animate-pulse"
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  animationDelay: star.delay
                }}
              />
            ))}

            {/* Ambient Nebula glow paths */}
            <div className="absolute top-[20%] left-[25%] w-[180px] h-[180px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[15%] w-[220px] h-[220px] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />

            {/* Overlord laboratory HUD overlays */}
            <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none z-10">
              <span className="text-[10px] text-purple-400 font-extrabold tracking-widest uppercase bg-indigo-950/60 px-3.5 py-2 rounded-full border border-purple-800/50 backdrop-blur-sm">
                LAB EVOLUSI BINTANG 🔭
              </span>
              <div className="text-right flex flex-col items-end gap-1 font-sans">
                <span className="text-[10px] text-purple-200 font-black tracking-wider uppercase bg-indigo-950/60 px-3 py-1.5 rounded-full border border-purple-800/40 backdrop-blur-sm shadow-sm flex items-center gap-1">
                  Status: {isBlackHole ? 'LUBANG HITAM (Gravitasi Ekstrem)' : (starMass >= 5 ? 'RAKSASA MERAH' : 'BINTANG AKTIF')}
                </span>
                <span className="text-[10px] text-emerald-300 font-black tracking-wider uppercase bg-indigo-950/60 px-3 py-1.5 rounded-full border border-[#059669]/40 backdrop-blur-sm shadow-sm flex items-center gap-1">
                  Tarikan Gravitasi: {(starMass * 1.5).toFixed(1)} g
                </span>
              </div>
            </div>

            {/* Orbit guideline dotted circles representing normal orbital mechanics */}
            {!isBlackHole && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                <ellipse 
                  cx={centerX}
                  cy={centerY}
                  rx={radiusX}
                  ry={radiusY}
                  fill="none"
                  stroke="rgba(167, 139, 250, 0.25)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
              </svg>
            )}

            {/* Center Bintang / Black Hole dynamic graphics */}
            <div
              className="absolute z-20"
              style={{
                left: centerX,
                top: centerY,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* EXPLOSION RING supernovas waves animation overlay */}
              {isSupernovaActive && (
                <motion.div
                  initial={{ scale: 0.1, opacity: 1 }}
                  animate={{ scale: 12, opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="absolute w-24 h-24 rounded-full border-[8px] border-amber-300 bg-white/20 blur-sm pointer-events-none"
                />
              )}

              {/* 1. Yellow/Orange Star (Mass 1-4) */}
              {starMass <= 4 && (
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 + starMass * 0.08 }}
                  className="w-20 h-20 aspect-square shrink-0 flex-shrink-0 relative flex items-center justify-center select-none"
                  style={{ width: '80px', height: '80px' }}
                >
                  {/* High precision SVG circle */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_0_25px_rgba(234,179,8,0.45)]">
                    <defs>
                      <radialGradient id="starGrad" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#fde047" /> {/* yellow-300 */}
                        <stop offset="60%" stopColor="#fbbf24" /> {/* amber-400 */}
                        <stop offset="100%" stopColor="#f97316" /> {/* orange-500 */}
                      </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#starGrad)" />
                    {/* Highlight gloss shine */}
                    <ellipse cx="32" cy="22" rx="12" ry="6" fill="#ffffff" opacity="0.6" transform="rotate(-15, 32, 22)" />
                  </svg>
                  
                  {/* Smiley Face overlays placed perfectly at center */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <div className="flex gap-2 mb-0.5">
                      <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                      <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                    </div>
                    <div className="w-3 h-1.5 bg-slate-900 rounded-b-full" />
                  </div>
                </motion.div>
              )}

              {/* 2. Red Supergiant Star (Mass 5-8) */}
              {starMass >= 5 && starMass <= 8 && (
                <motion.div 
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.1 + (starMass - 4) * 0.12 }}
                  className="w-28 h-28 aspect-square shrink-0 flex-shrink-0 relative flex items-center justify-center select-none"
                  style={{ width: '112px', height: '112px' }}
                >
                  {/* Pulsing glow underlay */}
                  <div className="absolute inset-0 bg-red-500/25 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />

                  {/* High precision Red Supergiant SVG circle */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_0_35px_rgba(239,68,68,0.65)]">
                    <defs>
                      <radialGradient id="redSupergiantGrad" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#ef4444" /> {/* red-500 */}
                        <stop offset="60%" stopColor="#e11d48" /> {/* rose-600 */}
                        <stop offset="100%" stopColor="#ea580c" /> {/* orange-600 */}
                      </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#redSupergiantGrad)" />
                    {/* Soft gloss shine */}
                    <ellipse cx="32" cy="22" rx="11" ry="5.5" fill="#ffffff" opacity="0.5" transform="rotate(-12, 32, 22)" />
                  </svg>

                  {/* Surprised dramatic face overlays */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <div className="flex gap-3.5 mb-1">
                      <div className="w-2 h-2 bg-[#2a040b] rounded-full" />
                      <div className="w-2 h-2 bg-[#2a040b] rounded-full" />
                    </div>
                    <div className="w-4 h-3 bg-[#2a040b] rounded-b-full border border-rose-950/20" />
                  </div>
                </motion.div>
              )}

              {/* 3. Pulsing, Suction swirling Black Hole (Mass 9-10) */}
              {isBlackHole && (
                <div className="relative w-40 h-40 flex items-center justify-center pointer-events-none select-none">
                  
                  {/* Outer glowing cosmic accretion disk (Swirling purple disk) */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="absolute w-36 h-36 border-[12px] border-t-purple-600/90 border-r-indigo-500/80 border-b-sky-400/40 border-l-fuchsia-700/80 rounded-full opacity-90 blur-sm flex items-center justify-center"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    className="absolute w-32 h-32 border-[8px] border-t-fuchsia-500/60 border-r-purple-400/40 border-b-transparent border-l-indigo-500/75 rounded-full opacity-80 blur-[2px]"
                  />

                  {/* Absolute pitch-black Event Horizon Sphere core */}
                  <motion.div 
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="w-16 h-16 bg-black rounded-full shadow-[0_0_40px_rgba(167,139,250,0.8),inset_0_0_20px_rgba(0,0,0,1)] border-2 border-indigo-950 flex flex-col items-center justify-center relative z-10"
                  >
                    {/* Gravitational lenses visual distortion */}
                    <div className="w-12 h-12 rounded-full border border-purple-500/30 opacity-40 animate-ping absolute" />
                    
                    {/* Glowing outer corona light halos */}
                    <div className="absolute inset-[-4px] rounded-full border border-indigo-500/25 opacity-70 animate-pulse" />
                  </motion.div>

                  <span className="absolute bottom-[-16px] bg-indigo-950 text-indigo-300 text-[8px] font-black px-2 py-0.5 rounded-full border border-indigo-800 shadow">
                    SINGULARITAS
                  </span>
                </div>
              )}
            </div>

            {/* THE PLANET ORANGE MASCOT (Fitted elegantly on coordinates track offset) */}
            <motion.div
              style={{
                position: 'absolute',
                zIndex: 35
              }}
              // When Black Hole is active, override position and suction directly into center
              animate={isBlackHole ? {
                x: centerX - 26,
                y: centerY - 26,
                scale: 0.05,
                rotate: 1080,
                opacity: 0
              } : {
                x: targetX - 26,
                y: targetY - 26,
                scale: 1,
                rotate: 0,
                opacity: 1
              }}
              transition={isBlackHole ? {
                type: 'tween',
                duration: 1.9,
                ease: 'easeInOut'
              } : {
                type: 'just' // immediate frame updates aligned with React tick positions
              }}
              className="w-[52px] h-[52px] shrink-0 flex-shrink-0 aspect-square flex flex-col items-center select-none"
              id="planet-oranye-avatar"
            >
              {/* Speech bubble bound strictly upright immediately above character ball */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={speechText}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="absolute bottom-[66px] bg-slate-900/90 border-2 border-purple-400 text-purple-100 text-[10px] md:text-xs font-black px-4 py-2 rounded-2xl shadow-2xl w-44 md:w-52 text-center pointer-events-none select-none z-50 backdrop-blur-sm"
                >
                  {/* Shaking animation class if sucked in black hole */}
                  <span className={isBlackHole ? 'inline-block animate-bounce text-red-400' : ''}>
                    {speechText}
                  </span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r-2 border-b-2 border-purple-400 rotate-45 -mt-1.5 pointer-events-none" />
                </motion.div>
              </AnimatePresence>

              {/* THE CUTE ORANGE CHARACTER FACE BALL (Verbatim replica sizes of fixed specifications) */}
              <div 
                className="w-[52px] h-[52px] shrink-0 flex-shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-white/50 flex flex-col items-center justify-center relative select-none z-20"
              >
                {/* 3D premium clay specular shines */}
                <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg]" />
                <div className="absolute top-[18%] left-[10%] w-[10%] h-[10%] bg-white rounded-full opacity-50" />

                {/* Eyes: Dynamic facial features responsive loop */}
                {isActiveFace || isBlackHole ? (
                  /* ACTIVE STATE: wide open round eyes */
                  <div className="flex justify-between gap-3.5 z-10 select-none animate-pulse">
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                      <div className="absolute top-0.5 right-0.5 w-[3px] h-[3px] bg-white rounded-full" />
                    </div>
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                      <div className="absolute top-0.5 right-0.5 w-[3px] h-[3px] bg-white rounded-full" />
                    </div>
                  </div>
                ) : (
                  /* IDLE STATE: Happy, closed inverted-V caret eyes ^_^ built with SVG (smaller, thinner, closer) */
                  <div className="flex justify-between gap-2 z-10 select-none">
                    <svg width="10" height="8" viewBox="0 0 10 8" className="w-2.5 h-2">
                      <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <svg width="10" height="8" viewBox="0 0 10 8" className="w-2.5 h-2">
                      <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* Mouth: Dynamic matching specifications */}
                <div className="z-10 mt-1">
                  {isActiveFace || isBlackHole ? (
                    /* ACTIVE STATE: surprised open round O mouth */
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-950 shadow-inner" />
                  ) : (
                    /* IDLE STATE: Clean happy straight smile overlay - (smaller, thinner) */
                    <div className="w-2.5 h-[2px] bg-slate-900 rounded-full" />
                  )}
                </div>

                {/* Cheeks: Soft pink cosmetic blushes */}
                <div className="absolute bottom-[24%] left-[15%] w-[18%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                <div className="absolute bottom-[24%] right-[15%] w-[18%] h-[8%] bg-rose-400 rounded-full opacity-75" />
              </div>

              {/* Small micro tags identifier */}
              <span className="bg-amber-600/95 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full mt-1.5 shadow border border-amber-500 z-10 select-none">
                Planet Oranye
              </span>
            </motion.div>

            {/* Bottom Laboratory Rail boundary spacer */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-purple-900 flex items-center justify-center opacity-90 z-[40]">
              <span className="text-purple-300 text-[10px] font-black tracking-widest uppercase">
                PROYEKTOR ASTROFISIKA PROF. JUMP 🪐
              </span>
            </div>

          </div>

          {/* Pedagogy explanation balloon */}
          <div className="bg-amber-100/60 rounded-3xl p-5 border-2 border-amber-200/50 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Laboran Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Coba geser Massa Bintang ke level 10! Tarikan gravitasi masifnya akan mengerutkan bintang menjadi Lubang Hitam ultra-pekat. Lihat bagaimana jalinan ruang waktu menekuk hebat hingga mengisap si Oranye!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
