import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles, Compass, HelpCircle } from 'lucide-react';

interface PulleySandboxProps {
  onBack: () => void;
}

export default function PulleySandbox({ onBack }: PulleySandboxProps) {
  // 1. Controls Panel State
  const [pulleysCount, setPulleysCount] = useState<number>(2); // Range 1 to 3
  const [mass, setMass] = useState<number>(3); // Range 1 to 5

  // Interactive pull physical states
  const [pulledDistance, setPulledDistance] = useState<number>(60); // 0 (top) to 200 (fully pulled)
  const [isDraggingHandle, setIsDraggingHandle] = useState<boolean>(false);
  
  // Sensation after release
  const [wasDropped, setWasDropped] = useState<boolean>(false);

  // Measure references for absolute tracking
  const arenaRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [canvasHeight, setCanvasHeight] = useState<number>(450);
  const [canvasWidth, setCanvasWidth] = useState<number>(600);

  // Monitor resize for correct coordinate mapping
  useEffect(() => {
    if (arenaRef.current) {
      setCanvasHeight(arenaRef.current.clientHeight);
      setCanvasWidth(arenaRef.current.clientWidth);

      const handleResize = () => {
        if (arenaRef.current) {
          setCanvasHeight(arenaRef.current.clientHeight);
          setCanvasWidth(arenaRef.current.clientWidth);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Handle slide/value drop effect
  const prevDragging = useRef(isDraggingHandle);
  useEffect(() => {
    if (prevDragging.current && !isDraggingHandle && pulledDistance > 30) {
      // Released the string! Roll back down
      setWasDropped(true);
      setPulledDistance(0); // Slide back up
      const timer = setTimeout(() => {
        setWasDropped(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
    prevDragging.current = isDraggingHandle;
  }, [isDraggingHandle, pulledDistance]);

  // Reset the pulley simulation to default
  const handleReset = () => {
    setPulledDistance(0);
    setPulleysCount(2);
    setMass(3);
    setWasDropped(false);
  };

  // 2. Physics & Dimensions
  const ceilingY = 48; // Y coord under top wood beam
  const groundHeight = 56;
  const basketHeight = 64 + (mass * 5); // scales slightly with mass

  // Mechanical advantage calculation: more pulleys -> rope move further, less force (lighter feeling)
  // Distance lifted up = pulledDistance * (1 / pulleysCount)
  const liftFactor = 1 / pulleysCount;
  const liftDistance = pulledDistance * liftFactor;

  // Basket bottom positioning
  const basketRestingBottomY = groundHeight + 10;
  const basketCurrentBottomY = basketRestingBottomY + liftDistance;
  const basketCurrentTopY = canvasHeight - basketCurrentBottomY - basketHeight;

  // Handle layout styling
  const handleTrackTopY = 80;
  const handleTrackHeight = 220;
  const handleCurrentY = handleTrackTopY + pulledDistance;

  // Coordinates for the pulleys
  // Center group coordinates based on selection
  // Completely responsive coordinate mapping for smaller devices
  const basketCenterX = Math.max(90, Math.min(150, canvasWidth * 0.28));
  const handleCenterX = Math.max(260, canvasWidth - Math.min(120, canvasWidth * 0.22));

  // Dynamically place top pulley wheels
  const getPulleyPositions = () => {
    if (pulleysCount === 1) {
      return [{ x: (basketCenterX + handleCenterX) / 2, label: 'A' }];
    } else if (pulleysCount === 2) {
      return [
        { x: basketCenterX + 20, label: 'A' },
        { x: handleCenterX - 50, label: 'B' }
      ];
    } else {
      return [
        { x: basketCenterX + 10, label: 'A' },
        { x: (basketCenterX + handleCenterX) / 2, label: 'B' },
        { x: handleCenterX - 40, label: 'C' }
      ];
    }
  };

  const pulleys = getPulleyPositions();

  // Dynamic Speech Bubble selector
  const getSpeechText = () => {
    if (isDraggingHandle) {
      return "Yaaay aku naik ke atas! Terus tarik! 🎢";
    }
    if (wasDropped) {
      return "Aaaaaa meluncur turuuuun! 😱";
    }
    if (pulleysCount === 1) {
      return "Ukhhh! Tarik lebih kuat! Berat banget nih! 🥵";
    }
    if (pulleysCount === 3) {
      return "Wah, ditariknya gampang banget! Makasih roda pintar! 🤩";
    }
    return "Coba tarik tuas tali di sebelah kanan untuk naikin aku!";
  };

  const speechText = getSpeechText();

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[24px] md:rounded-[40px] border border-orange-100/50 p-4 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left py-1">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-extrabold text-sm bg-white hover:bg-orange-50/50 border-2 border-orange-100 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3 focus:outline-none"
            id="btn-pulley-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2 leading-none">
            Mekanika: Katrol & Tali 🪢
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider mt-1.5 select-none md:mt-2">
            Teori: Pesawat Sederhana
          </p>
        </div>

        {/* Physics badge overlay */}
        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
          <span className="bg-orange-100 text-orange-700 text-[10px] md:text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-orange-200 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse-slow" />
            KEUNTUNGAN MEKANIS
          </span>
          <span className="bg-indigo-100 text-indigo-700 text-[10px] md:text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-indigo-200 whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
            RODA PERINGAN BEBAN
          </span>
        </div>
      </div>

      {/* Split Screen Responsive Grid Layout */}
      <div className="flex flex-col md:flex-row gap-8 items-stretch mt-3 w-full max-w-7xl mx-auto">
        
        {/* Left Column Controls – 30% Width (3 cols) */}
        <div className="w-full md:w-[32%] lg:w-[30%] bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40 order-2 md:order-1 shrink-0">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50 text-left">
              <span className="text-2xl select-none">⚙️</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Panel Kontrol Katrol
              </h2>
            </div>

            {/* Range Slider 1: Jumlah Roda Katrol */}
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50 gap-2">
                <span className="text-[10px] sm:text-xs font-extrabold text-slate-700 tracking-wider uppercase truncate select-none">
                  🎡 Jumlah Roda Katrol
                </span>
                <span className="text-xs sm:text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                  {pulleysCount} Roda
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="3"
                step="1"
                value={pulleysCount}
                onChange={(e) => setPulleysCount(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-pulleys-count"
              />
              <div className="flex justify-between w-full gap-1 text-[10px] md:text-xs xl:text-sm font-bold text-slate-400 select-none">
                <span className="whitespace-nowrap">1 Katrol (Biasa)</span>
                <span className="whitespace-nowrap">2 Katrol (Sedang)</span>
                <span className="whitespace-nowrap">3 Katrol (Tersistem)</span>
              </div>
            </div>

            {/* Range Slider 2: Berat Beban (Massa) */}
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50 gap-2">
                <span className="text-[10px] sm:text-xs font-extrabold text-slate-700 tracking-wider uppercase truncate select-none">
                  🏋️‍♂️ Berat Beban Keranjang
                </span>
                <span className="text-xs sm:text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                  {mass} kg
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
                id="slider-pulley-mass"
              />
              <div className="flex justify-between w-full gap-1 text-[10px] md:text-xs xl:text-sm font-bold text-slate-400 select-none">
                <span className="whitespace-nowrap">Ringan (1 kg)</span>
                <span className="whitespace-nowrap">Sedang (3 kg)</span>
                <span className="whitespace-nowrap">Berat (5 kg)</span>
              </div>
            </div>

            {/* Live Pulley Physics Stats Indicator and Pedagogy */}
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100/40 text-slate-700 text-left">
              <h4 className="text-xs font-black uppercase text-orange-600 tracking-wider flex items-center gap-1 select-none">
                <span>📏</span> ANALISIS FISIKA
              </h4>
              <div className="mt-2 text-xs font-bold text-slate-600 space-y-2.5">
                <div className="flex justify-between items-center w-full gap-2">
                  <span className="text-slate-500 truncate">Keuntungan Mekanis:</span>
                  <span className="text-orange-600 font-black whitespace-nowrap shrink-0">{pulleysCount}x Lebih Ringan</span>
                </div>
                <div className="flex justify-between items-center w-full gap-2">
                  <span className="text-slate-500 truncate">Gaya Tarik Diperlukan:</span>
                  <span className="text-emerald-600 font-extrabold whitespace-nowrap shrink-0">{((mass * 9.8) / pulleysCount).toFixed(1)} N</span>
                </div>
                <div className="flex justify-between items-center w-full gap-2">
                  <span className="text-slate-500 truncate">Panjang Tali Ditarik:</span>
                  <span className="text-blue-600 font-extrabold whitespace-nowrap shrink-0">{Math.round(pulledDistance)} cm</span>
                </div>
                <div className="flex justify-between items-center w-full gap-2">
                  <span className="text-slate-500 truncate">Ketinggian Naik:</span>
                  <span className="text-indigo-600 font-extrabold whitespace-nowrap shrink-0">{Math.round(liftDistance)} cm</span>
                </div>
              </div>
            </div>

            {/* Child Pedagogy Message block */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-orange-100/60 text-slate-600 text-left">
              <h4 className="text-xs font-extrabold text-orange-600 uppercase tracking-widest flex items-center gap-1 select-none">
                <span>💡</span> TRIVIA KATROL
              </h4>
              <p className="text-[11px] font-semibold leading-relaxed text-slate-500 mt-1.5 align-middle select-none">
                Katrol majemuk membagi berat beban ke beberapa tali penyangga. Semakin banyak katrol, semakin ringan kamu menarik tali!
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-sm uppercase py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer focus:outline-none"
              id="btn-pulley-reset"
            >
              <RotateCcw className="w-4 h-4" /> Lepas Tali
            </button>
          </div>

        </div>

        {/* Right Column (Simulation Canvas) – stacks on top on mobile, right on desktop */}
        <div className="w-full md:w-[68%] lg:w-[70%] flex flex-col gap-4 order-1 md:order-2">
          
          <div 
            ref={arenaRef}
            className="w-full h-[400px] md:h-[450px] bg-white rounded-[32px] border-2 border-orange-100/40 shadow-[0_16_40px_rgba(0,0,0,0.03)] relative overflow-hidden select-none"
            id="pulley-canvas"
          >
            {/* Lab floor grid dot pattern background */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#F97316 2px, transparent 2px)', 
                backgroundSize: '24px 24px' 
              }} 
            />

            {/* Ceiling styled beam at the top holding the pulleys */}
            <div className="absolute top-4 left-6 right-6 h-6 bg-gradient-to-r from-amber-800 to-amber-900 rounded-full border-2 border-amber-950 shadow-md z-20 flex items-center justify-center">
              <div className="text-amber-100 text-[10px] font-bold uppercase tracking-widest opacity-80">
                BALOK KATROL UTAMA
              </div>
            </div>

            {/* Absolute SVG rope drawing background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
              {/* Dynamic Rope Drawing */}
              {/* Connects from Basket Top Center up around pulley wheels and ends at the Handle Handlebar */}
              {pulleys.length === 1 && (
                <>
                  {/* Left Rope: Basket up to Pulley left hook */}
                  <line 
                    x1={basketCenterX} 
                    y1={basketCurrentTopY + 2} 
                    x2={pulleys[0].x - 12} 
                    y2={ceilingY + 16} 
                    stroke="#D97706" 
                    strokeWidth="4.5"
                    strokeDasharray="4 2" 
                    className="shadow-sm"
                  />
                  {/* Right Rope: Pulley right hook down to User Handle */}
                  <line 
                    x1={pulleys[0].x + 12} 
                    y1={ceilingY + 16} 
                    x2={handleCenterX} 
                    y2={handleCurrentY} 
                    stroke="#D97706" 
                    strokeWidth="4.5"
                    strokeDasharray="4 2"
                  />
                </>
              )}

              {pulleys.length === 2 && (
                <>
                  {/* Rope goes from basket up, around pulley A, back down, around movable system, and then to handle */}
                  {/* Rope 1: Basket to Pulley A (Left) */}
                  <line 
                    x1={basketCenterX} 
                    y1={basketCurrentTopY + 2} 
                    x2={pulleys[0].x - 12} 
                    y2={ceilingY + 16} 
                    stroke="#D97706" 
                    strokeWidth="4.5"
                    strokeDasharray="4 2"
                  />
                  {/* Connection from Pulley A around middle systems to Pulley B */}
                  <path 
                    d={`M ${pulleys[0].x + 12} ${ceilingY + 16} Q ${(pulleys[0].x + pulleys[1].x) / 2} ${ceilingY + 50} ${pulleys[1].x - 12} ${ceilingY + 16}`}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="4"
                    strokeDasharray="4 2"
                  />
                  {/* Rope 2: Pulley B down to user handle */}
                  <line 
                    x1={pulleys[1].x + 12} 
                    y1={ceilingY + 16} 
                    x2={handleCenterX} 
                    y2={handleCurrentY} 
                    stroke="#D97706" 
                    strokeWidth="4.5"
                    strokeDasharray="4 2"
                  />
                </>
              )}

              {pulleys.length === 3 && (
                <>
                  {/* Beautiful Multi-loop weave routing ropes */}
                  <line 
                    x1={basketCenterX} 
                    y1={basketCurrentTopY} 
                    x2={pulleys[0].x - 12} 
                    y2={ceilingY + 16} 
                    stroke="#D97706" 
                    strokeWidth="4.5"
                    strokeDasharray="4 2"
                  />
                  <path 
                    d={`M ${pulleys[0].x + 12} ${ceilingY + 16} Q ${(pulleys[0].x + pulleys[1].x) / 2} ${ceilingY + 32} ${pulleys[1].x - 12} ${ceilingY + 16}`}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="4.5"
                    strokeDasharray="4 2"
                  />
                  <path 
                    d={`M ${pulleys[1].x + 12} ${ceilingY + 16} Q ${(pulleys[1].x + pulleys[2].x) / 2} ${ceilingY + 32} ${pulleys[2].x - 12} ${ceilingY + 16}`}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="4.5"
                    strokeDasharray="4 2"
                  />
                  <line 
                    x1={pulleys[2].x + 12} 
                    y1={ceilingY + 16} 
                    x2={handleCenterX} 
                    y2={handleCurrentY} 
                    stroke="#D97706" 
                    strokeWidth="4.5"
                    strokeDasharray="4 2"
                  />
                </>
              )}
            </svg>

            {/* Pulleys rendering at the ceiling beam */}
            <div className="absolute top-8 left-0 right-0 h-10 flex select-none pointer-events-none z-20">
              {pulleys.map((pulley, idx) => {
                // Determine wheel rotation angle based on pulledDistance to make it ultra interactive
                const rot = pulledDistance * 2.8 * (idx + 1);

                return (
                  <motion.div
                    key={idx}
                    style={{ left: pulley.x - 20 }}
                    className="absolute top-2.5 flex flex-col items-center"
                  >
                    {/* Metal bracket hooking to ceiling */}
                    <div className="w-2.5 h-3 bg-slate-500 rounded-t border-r border-l border-slate-600 shadow-sm" />
                    
                    {/* The pulley wheel itself */}
                    <motion.div
                      animate={{ rotate: rot }}
                      transition={{ type: 'tween', duration: 0.04 }}
                      style={{ transformOrigin: 'center center' }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 border-2 border-slate-500 shadow-sm flex items-center justify-center relative"
                    >
                      {/* Pulley grooves and spoke markings to visualize rotational movement */}
                      <div className="absolute inset-1.5 rounded-full border border-dashed border-slate-600/40" />
                      <div className="w-1 h-5 bg-slate-700/60 rounded-full absolute" />
                      <div className="w-5 h-1 bg-slate-700/60 rounded-full absolute" />
                      <div className="w-2.5 h-2.5 bg-slate-600 rounded-full shadow-inner flex items-center justify-center">
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      </div>
                    </motion.div>

                    {/* Lower label index */}
                    <span className="text-[8px] font-black text-slate-500 bg-slate-100 text-center px-1 rounded-full mt-0.5 border border-slate-200">
                      Roda {idx + 1}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Left Side: Basket containing our Mascot Orange Face */}
            <motion.div
              animate={{ y: basketCurrentTopY }}
              transition={isDraggingHandle ? { type: 'tween', duration: 0 } : { type: 'spring', stiffness: 100, damping: 15 }}
              style={{
                width: mass * 6 + 76,
                position: 'absolute',
                left: basketCenterX - (mass * 3 + 38)
              }}
              className="z-30 flex flex-col items-center"
              id="pulley-basket-load"
            >
              
              {/* Animated Speech bubble above the mascot inside basket */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={speechText}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="mb-3 bg-white border-2 border-orange-200 text-slate-700 text-[10px] md:text-xs font-black px-4 py-2.5 rounded-2xl shadow-lg border-b-4 border-orange-100 w-40 md:w-48 text-center pointer-events-none relative select-none"
                >
                  {speechText}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-orange-200 rotate-45 -mt-1.5" />
                </motion.div>
              </AnimatePresence>

              {/* The Orange Ball inside basket */}
              <div 
                style={{ 
                  width: mass * 6 + 32, 
                  height: mass * 6 + 32,
                  marginBottom: -8
                }}
                className="rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-white/50 flex flex-col items-center justify-center relative select-none z-20"
              >
                {/* 3D clay glossy highlight lines */}
                <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg]" />
                <div className="absolute top-[18%] left-[10%] w-[10%] h-[10%] bg-white rounded-full opacity-50" />

                {/* Eyes: Dynamic conditional rendering representing the physical status */}
                {isDraggingHandle || wasDropped ? (
                  /* ACTIVE STATE: Wide open round eyes */
                  <div className="flex justify-between gap-3.5 z-10 animate-fade-in">
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

                {/* Mouth: Dynamic conditional rendering */}
                <div className="z-10 mt-1">
                  {isDraggingHandle || wasDropped ? (
                    /* ACTIVE STATE: Surprised "O" mouth */
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-950 shadow-inner" />
                  ) : (
                    /* IDLE STATE: Clean happy straight smile overlay - (smaller, thinner) */
                    <div className="w-2.5 h-[2px] bg-slate-900 rounded-full" />
                  )}
                </div>

                {/* Cheeks: Two small soft pink ovals/pills below the eyes */}
                <div className="absolute bottom-[24%] left-[15%] w-[18%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                <div className="absolute bottom-[24%] right-[15%] w-[18%] h-[8%] bg-rose-400 rounded-full opacity-75" />
              </div>

              {/* Wooden-styled load basket casing */}
              <div 
                style={{ height: basketHeight }}
                className="w-full bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-2xl border-4 border-amber-950 flex flex-col justify-end items-center p-1.5 shadow-md relative"
              >
                {/* Decorative ropes attaching basket upwards */}
                <div className="absolute top-[-10px] left-2 w-1.5 h-3.5 bg-amber-950 rounded" />
                <div className="absolute top-[-10px] right-2 w-1.5 h-3.5 bg-amber-950 rounded" />
                <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-1 h-5 bg-amber-900" />

                {/* Grid planks inside wood */}
                <div className="w-full h-1/2 border-t-2 border-amber-900 border-dashed opacity-40" />

                <span className="bg-amber-950 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-inner z-10 select-none">
                  {mass} kg
                </span>
              </div>

            </motion.div>

            {/* Right Side: Pull Handle and Draggable Track */}
            <div 
              ref={trackRef}
              style={{ left: handleCenterX - 20 }}
              className="absolute top-[80px] w-10 h-[220px] bg-slate-100/50 hover:bg-slate-100 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-between py-1 z-25 cursor-pointer"
            >
              {/* Top & Bottom physical anchors for the track */}
              <div className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
              <div className="text-[8px] text-slate-400 font-extrabold rotate-[270deg] select-none uppercase tracking-wide">
                TARIK DISINI
              </div>
              <div className="w-2.5 h-2.5 bg-slate-400 rounded-full" />

              {/* The Draggable Clattered Wood Core Handle bar */}
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 200 }}
                dragElastic={0.05}
                dragMomentum={false}
                onDragStart={() => setIsDraggingHandle(true)}
                onDragEnd={() => setIsDraggingHandle(false)}
                onDrag={(event, info) => {
                  if (trackRef.current) {
                    const rect = trackRef.current.getBoundingClientRect();
                    const relativeY = info.point.y - rect.top;
                    const clamped = Math.max(0, Math.min(200, relativeY));
                    setPulledDistance(clamped);
                  }
                }}
                animate={{ y: pulledDistance }}
                transition={isDraggingHandle ? { type: 'tween', duration: 0 } : { type: 'spring', stiffness: 120, damping: 15 }}
                className="absolute left-1/2 -translate-x-1/2 w-12 h-6 md:w-14 md:h-7 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing z-35"
              >
                {/* Horizontal inner grooves */}
                <div className="w-[60%] h-1.5 bg-white/40 rounded-full shadow-inner" />
              </motion.div>
            </div>

            {/* Ground design footer container */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-emerald-600 to-emerald-500 border-t-4 border-emerald-400 flex items-center justify-center shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
              <span className="text-white text-xs font-black tracking-widest uppercase opacity-90 drop-shadow-md">
                LANTAI LABORATORIUM 🏕️
              </span>
            </div>

          </div>

          {/* Pedagogy guidelines footer speech balloon */}
          <div className="bg-amber-100/60 rounded-3xl p-5 border-2 border-amber-200/50 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Laboran Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Hubungkan beberapa katrol bersama-sama! Kamu akan menyadari bahwa meskipun kamu harus menarik tali ke bawah lebih jauh untuk mengangkatku ke atas, kekuatan otot yang diperlukan menjadi jauh lebih kecil!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
