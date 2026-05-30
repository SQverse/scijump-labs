import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles, Compass, Gauge, Play } from 'lucide-react';

interface FrictionSandboxProps {
  onBack: () => void;
}

export default function FrictionSandbox({ onBack }: FrictionSandboxProps) {
  // 1. Controls Panel State
  const [surface, setSurface] = useState<number>(2); // 1 = Es Licin, 2 = Lantai Kayu, 3 = Karpet Kasar
  const [force, setForce] = useState<number>(6); // 1 to 10
  const [mass, setMass] = useState<number>(3); // 1 to 5

  // Sled motion states
  const [slideDistance, setSlideDistance] = useState<number>(0);
  const [isSliding, setIsSliding] = useState<boolean>(false);
  const [hasSlid, setHasSlid] = useState<boolean>(false);

  // Resize boundaries tracking
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

  // Calculate maximum allowed X offset dynamically so character does not fly off screen
  const maxTravel = Math.max(150, canvasWidth - (mass * 6 + 130));

  // Handle Push sequence
  const handlePush = () => {
    if (isSliding) return; // Prevent double pushes during motion

    setIsSliding(true);
    setHasSlid(true);

    // Calculate displacement based on surface friction and force/mass ratio
    // Es Licin (1): travels maximum
    // Lantai Kayu (2): travels moderately
    // Karpet Kasar (3): barely travels
    const surfaceMultiplier = surface === 1 ? 80 : surface === 2 ? 38 : 10;
    const computedDisplacement = (force / mass) * surfaceMultiplier;
    
    // Clamp to arena width safely
    const finalX = Math.min(maxTravel, computedDisplacement);
    setSlideDistance(finalX);
  };

  // Reset Sled back to initial starting line
  const handleReset = () => {
    setSlideDistance(0);
    setIsSliding(false);
    setHasSlid(false);
  };

  // On change of any values, automatically slide back to 0 to prevent issues
  useEffect(() => {
    handleReset();
  }, [surface, force, mass]);

  // Translate Surface type index to readable text
  const getSurfaceName = () => {
    if (surface === 1) return 'Es Licin 🧊';
    if (surface === 2) return 'Lantai Kayu 🪵';
    return 'Karpet Kasar 🧶';
  };

  // Get surface color for CSS styling
  const getSurfaceBgColor = () => {
    if (surface === 1) return 'bg-cyan-200 border-cyan-300';
    if (surface === 2) return 'bg-amber-700 border-amber-800';
    return 'bg-rose-800 border-rose-900';
  };

  // Dynamic Speech Bubble selector for the Orange Face Sled
  const getSpeechText = () => {
    if (isSliding) {
      return "Wusssss! 💨";
    }
    if (hasSlid) {
      // Secret Easter Egg condition!
      if (force === 10 && mass === 1 && surface === 1) {
        return "Aaaaaaa remnya blooong!!! 🚀";
      }
      if (surface === 1) {
        return "Wah licin banget, aku meluncur jauuuh! 🧊";
      }
      if (surface === 3) {
        return "Ugh, seret banget! Susah jalannya! 🧶";
      }
      return "Laju luncuranku lumayan asyik di panggung! 🛹";
    }
    return "Pilih jalan dan dorong aku sekuat tenaga!";
  };

  const speechText = getSpeechText();

  // Animation Transition configuration depending on friction
  // Slippery surfaces take longer time (low stiff/damp), rough surfaces stop instantly (high stiff)
  const getSpringConfig = () => {
    if (surface === 1) {
      // Slick sliding glide
      return { type: 'spring', stiffness: 22, damping: 8 };
    }
    if (surface === 2) {
      // Normal wood resistance
      return { type: 'spring', stiffness: 50, damping: 14 };
    }
    // Heavy resistive rug brake
    return { type: 'spring', stiffness: 110, damping: 20 };
  };

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-extrabold text-sm bg-white hover:bg-orange-50/50 border-2 border-orange-100 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-friction-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Mekanika: Gaya Gesek 🛷
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Teori: Gaya Friksi Permukaan
          </p>
        </div>

        {/* Physics Info overlays */}
        <div className="flex gap-2">
          <span className="bg-orange-100 text-orange-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            KOEFISIEN FRIKSI
          </span>
          <span className="bg-rose-100 text-rose-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-rose-200">
            <Compass className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
            HUKUM GESEK KINETIK
          </span>
        </div>
      </div>

      {/* Split Screen Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Column Controls: 30% Width (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Insting Gesek Sled
              </h2>
            </div>

            {/* Selector 1: Permukaan Jalan (Friction Options) */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase block bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50">
                🛣️ Permukaan Jalan (Friksi)
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 1, label: 'Es Licin 🧊' },
                  { id: 2, label: 'Lantai Kayu 🪵' },
                  { id: 3, label: 'Karpet Kasar 🧶' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSurface(opt.id)}
                    className={`py-3 px-1 text-center rounded-2xl text-[11px] font-black transition-all border-2 cursor-pointer ${
                      surface === opt.id
                        ? 'bg-orange-500 text-white border-orange-600 shadow-md scale-[1.03]'
                        : 'bg-orange-50/40 text-slate-600 border-orange-100 hover:bg-orange-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 2: Kekuatan Dorong */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  💨 Kekuatan Dorong
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
                  F = {force} N
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="10"
                step="1"
                value={force}
                onChange={(e) => setForce(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-friction-force"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Colek (1)</span>
                <span>Normal (5)</span>
                <span>Super Push (10)</span>
              </div>
            </div>

            {/* Slider 3: Massa Sled */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  📦 Massa Sled (Berat)
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
                  m = {mass} kg
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="5"
                step="1"
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-friction-mass"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Enteng (1)</span>
                <span>Sedang (3)</span>
                <span>Mantap (5)</span>
              </div>
            </div>

            {/* Physics Stats Formula container */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-orange-100/60 text-slate-600">
              <h4 className="text-xs font-extrabold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                <span>📐</span> HUKUM GERAK & GESEK
              </h4>
              <p className="text-[11px] font-semibold leading-relaxed text-slate-500 mt-1.5 font-sans">
                Gesekan selalu menghambat gerakan benda: <strong className="text-slate-700">F_gesek = μ × m × g</strong>.<br />
                Massa Sled yang besar akan menekan jalan lebih kuat, melipatgandakan hambatan gesek sehingga sled sulit meluncur.
              </p>
            </div>
          </div>

          {/* Sled Push Trigger button set */}
          <div className="space-y-3 mt-8 pt-4 border-t-2 border-orange-50">
            <button
              onClick={handlePush}
              disabled={isSliding}
              className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer ${
                isSliding 
                  ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/20'
              }`}
              id="btn-friction-push"
            >
              <Play className="w-4 h-4" /> Dorong! 💨
            </button>
            <button 
              onClick={handleReset}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs uppercase py-3 rounded-2xl border-2 border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              id="btn-friction-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Lintasan
            </button>
          </div>

        </div>

        {/* Right Column Sled Simulation: 70% Width (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            ref={arenaRef}
            className="w-full h-[400px] md:h-[450px] bg-white rounded-[32px] border-2 border-orange-100/40 shadow-[0_16_40px_rgba(0,0,0,0.03)] relative overflow-hidden select-none flex flex-col justify-end"
            id="friction-canvas"
          >
            {/* Laboratory GRID dots */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#F97316 2px, transparent 2px)', 
                backgroundSize: '24px 24px' 
              }} 
            />

            {/* Lab overhead badge overlay */}
            <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none z-10">
              <span className="text-[10px] text-orange-400 font-extrabold tracking-widest uppercase bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                PANGGUNG LUNCUR FRIKSI
              </span>
              <div className="text-right flex flex-col items-end gap-1 font-sans">
                <span className="text-[10px] text-zinc-500 font-black tracking-wider uppercase bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
                  Permukaan: {getSurfaceName()}
                </span>
                <span className="text-[10px] text-emerald-600 font-black tracking-wider uppercase bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                  Jarak Luncur: {Math.round(slideDistance)} cm
                </span>
              </div>
            </div>

            {/* Sled tracks / path guidance lanes */}
            <div className="absolute left-6 right-6 bottom-[140px] border-b-2 border-dashed border-slate-200 opacity-60 pointer-events-none" />

            {/* Simulation track space */}
            <div className="w-full h-[250px] relative flex items-end px-10 pb-1 w-full relative">
              
              {/* THE MAIN SLED COMPONENT containing mascot */}
              <motion.div
                animate={{ x: slideDistance }}
                onAnimationStart={() => setIsSliding(true)}
                onAnimationComplete={() => setIsSliding(false)}
                transition={getSpringConfig()}
                style={{
                  width: mass * 6 + 92,
                  position: 'absolute',
                  left: 30,
                  bottom: 30
                }}
                className="z-30 flex flex-col items-center"
                id="pulley-sled-mascot"
              >
                {/* Speech Bubble linked instantly inline above mascot */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={speechText}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                    className="mb-3.5 bg-white border-2 border-orange-200 text-slate-700 text-[10px] md:text-xs font-black px-4 py-2.5 rounded-2xl shadow-lg border-b-4 border-orange-100 w-44 md:w-52 text-center pointer-events-none relative select-none"
                  >
                    {speechText}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-orange-200 rotate-45 -mt-1.5" />
                  </motion.div>
                </AnimatePresence>

                {/* THE CUTE ORANGE CHARACTER BALL */}
                <div 
                  style={{ 
                    width: mass * 4 + 48, 
                    height: mass * 4 + 48,
                    marginBottom: -5
                  }}
                  className="rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-white/50 flex flex-col items-center justify-center relative select-none z-20 transition-all"
                >
                  {/* Glossy clay 3D highlight contours */}
                  <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg]" />
                  <div className="absolute top-[18%] left-[10%] w-[10%] h-[10%] bg-white rounded-full opacity-50" />

                  {/* Eyes: Dynamic conditional rendering matching specified facial logic */}
                  {isSliding ? (
                    /* ACTIVE STATE: Sliding results in wide open surprised eyes O_O */
                    <div className="flex justify-between gap-3.5 z-10 select-none">
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative animate-pulse">
                        <div className="absolute top-0.5 right-0.5 w-[3px] h-[3px] bg-white rounded-full" />
                      </div>
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative animate-pulse">
                        <div className="absolute top-0.5 right-0.5 w-[3px] h-[3px] bg-white rounded-full" />
                      </div>
                    </div>
                  ) : (
                    /* IDLE STATE: Cute, delicate, thin closed inverted-V caret eyes ^_^ */
                    <div className="flex justify-between gap-2 z-10 select-none">
                      <svg width="10" height="8" viewBox="0 0 10 8" className="w-2.5 h-2">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <svg width="10" height="8" viewBox="0 0 10 8" className="w-2.5 h-2">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* Mouth: Dynamic matched logic */}
                  <div className="z-10 mt-1">
                    {isSliding ? (
                      /* ACTIVE STATE mouth: surprised open circle */
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-950 shadow-inner" />
                    ) : (
                      /* IDLE STATE mouth: delicate slim horizontal line - */
                      <div className="w-2.5 h-[2px] bg-slate-900 rounded-full" />
                    )}
                  </div>

                  {/* Cheeks: Soft cosmetic pink blush */}
                  <div className="absolute bottom-[24%] left-[15%] w-[18%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                  <div className="absolute bottom-[24%] right-[15%] w-[18%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                </div>

                {/* Wooden Clay-styled Sled Box container */}
                <div className="w-full h-8 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 rounded-b-xl rounded-t border-4 border-amber-950 flex justify-between items-center px-4 relative shadow">
                  
                  {/* Sled wooden metal visual skids runners underneath */}
                  <div className="absolute bottom-[-6px] left-1 right-1 h-2 bg-slate-500 rounded-full border border-slate-600 z-10 shadow-sm" />

                  {/* Sled rope ties */}
                  <div className="absolute left-[-8px] top-1 w-2.5 h-1 bg-amber-900 rounded-full" />
                  <div className="absolute right-[-8px] top-1 w-2.5 h-1 bg-amber-900 rounded-full" />

                  <span className="text-[9px] font-black text-amber-200">🛷 Sled</span>
                  <span className="bg-amber-950 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-inner select-none">
                    {mass} kg
                  </span>
                </div>

              </motion.div>

            </div>

            {/* SURFACE LAND LAYER (Changes Y background coloring based on selection) */}
            <div className={`w-full h-14 ${getSurfaceBgColor()} border-t-8 flex items-center justify-center transition-all duration-300 z-20 relative`}>
              {/* Ground visual details like snow lines or wood grain */}
              <div className="absolute inset-0 opacity-10 flex justify-between items-center px-10 pointer-events-none">
                <span className="h-0.5 w-[20%] bg-white rounded-full" />
                <span className="h-0.5 w-[30%] bg-white rounded-full" />
                <span className="h-0.5 w-[15%] bg-white rounded-full" />
              </div>
              <span className="text-slate-800 text-xs font-black tracking-widest uppercase opacity-90 drop-shadow-sm font-sans flex items-center gap-1.5">
                PERMUKAAN JALAN: {getSurfaceName()}
              </span>
            </div>

          </div>

          {/* Pedagogy explanation balloon */}
          <div className="bg-amber-100/60 rounded-3xl p-5 border-2 border-amber-200/50 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Laboran Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Ubah jalan ke Es Licin untuk mereduksi hambatan friksi sampai nol! Lalu pacu Kekuatan Dorong ke tingkat maksimal. Kamu akan melihat bahwa gaya dorong kecil sekalipun sanggup menembus jarak yang sangat jauh tanpa hambatan!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
