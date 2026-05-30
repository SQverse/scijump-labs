import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Sparkles, Compass, HelpCircle } from 'lucide-react';
import LeverSandbox from './LeverSandbox';
import PulleySandbox from './PulleySandbox';
import FrictionSandbox from './FrictionSandbox';

interface PhysicsSandboxProps {
  onBack: () => void;
  initialPreset?: string;
}

export default function PhysicsSandbox({ onBack, initialPreset }: PhysicsSandboxProps) {
  if (initialPreset === 'tuas-pengungkit') {
    return <LeverSandbox onBack={onBack} />;
  }

  if (initialPreset === 'katrol-tali') {
    return <PulleySandbox onBack={onBack} />;
  }

  if (initialPreset === 'gaya-gesek') {
    return <FrictionSandbox onBack={onBack} />;
  }

  // 1. Interactive Control States
  const [gravity, setGravity] = useState<number>(5.0); // Range 1 to 10
  const [bounciness, setBounciness] = useState<number>(0.7); // Range 0 to 1
  const [mass, setMass] = useState<number>(3); // Range 1 to 5

  // Mascot Face interaction states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [expression, setExpression] = useState<'happy' | 'gasp' | 'excited' | 'dizzy'>('happy');

  // 2. Responsive Simulation Canvas Measurement Ref
  const arenaRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const [canvasHeight, setCanvasHeight] = useState<number>(450);
  const [canvasWidth, setCanvasWidth] = useState<number>(600);

  // Measure size dynamically
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

  // 3. Dynamic Physics Calculation
  const groundHeight = 56;
  const topOffset = 24;
  const charSize = mass * 16 + 48; // Size escalates dynamically with mass state
  const bottomY = Math.max(0, canvasHeight - groundHeight - topOffset - charSize);

  // Character Y Coordinate State relative to initial top
  const [posY, setPosY] = useState<number>(bottomY);

  // Synchronize target resting posY position when parameters adjust
  useEffect(() => {
    if (!isDragging) {
      setPosY(bottomY);
    }
  }, [bottomY, isDragging]);

  // Framer Motion Spring Transition tied to sliders
  const stiffness = gravity * 70; // Higher gravity -> pulls down faster and tighter
  const damping = (1 - bounciness) * 20 + 4; // Higher bounciness -> lower damping (oscillates more)

  // 4. Reset sequence dropping from sky
  const handleReset = () => {
    setExpression('gasp');
    // Teleport character above the boundaries
    setPosY(-250);
    // Let spring drop it back down after clean delay
    setTimeout(() => {
      setPosY(bottomY);
      setExpression('excited');
    }, 120);

    // Timeout to revert expression back to normal
    setTimeout(() => {
      setExpression('happy');
    }, 1500);
  };

  // Change expression based on physics variables
  useEffect(() => {
    if (bounciness > 0.8) {
      setExpression('excited');
    } else {
      setExpression('happy');
    }
  }, [bounciness]);

  // Dynamic Speech Bubble text solver based on priority conditions
  const getSpeechText = () => {
    if (isDragging) {
      return "Waaaa! Jangan dilempar kenceng-kenceng! 😱";
    }
    if (gravity >= 8) {
      return "Aduh, gravitasi seberat ini bikin aku gepeng! 😫";
    }
    if (gravity <= 2) {
      return "Wuhuuu! Berasa melayang di luar angkasa! 🚀";
    }
    if (bounciness >= 0.8) {
      return "Boing! Boing! Aku super membal! 🎾";
    }
    if (mass === 5) {
      return "Lihat ototku! Aku jadi raksasa bulat! 😎";
    }
    if (mass === 1) {
      return "Aku ringan banget kayak kapas! ☁️";
    }
    return "Ayo tarik dan pantulkan aku ke lantai! ^_^";
  };

  const speechText = getSpeechText();

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[24px] md:rounded-[40px] border border-orange-100/50 p-4 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-extrabold text-sm bg-white hover:bg-orange-50/50 border-2 border-orange-100 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-physics-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Mekanika: Gaya & Gerak 🚀
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Redesigned Claymorphic Newtonian Sandbox
          </p>
        </div>

        {/* Info Badges */}
        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
          <span className="bg-orange-100 text-orange-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-orange-200 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            FISIKA AKTIF
          </span>
          <span className="bg-sky-100 text-sky-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-sky-200 whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 text-sky-500 animate-spin-slow" />
            NEWTON I, II, III
          </span>
        </div>
      </div>

      {/* Split Screen Responsive Grid Layout */}
      <div className="flex flex-col md:flex-row gap-8 items-stretch mt-3 w-full max-w-7xl mx-auto">
        
        {/* Left Column (Controls Panel) - Stacks at bottom on mobile (<768px), left on desktop */}
        <div className="w-full md:w-[32%] lg:w-[30%] bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40 order-2 md:order-1 shrink-0">
          
          {/* Controls Wrapper */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Panel Kontrol
              </h2>
            </div>

            {/* Range Slider 1: Gravitasi */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50 gap-2">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 tracking-wider uppercase truncate">
                  🪐 Gravitasi (Gravity)
                </span>
                <span className="text-xs sm:text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                  {gravity} G
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="10"
                step="1"
                value={gravity}
                onChange={(e) => setGravity(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-gravity"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Ringan (1)</span>
                <span>Standar (5)</span>
                <span>Raksasa (10)</span>
              </div>
            </div>

            {/* Range Slider 2: Kelenturan */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50 gap-2">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 tracking-wider uppercase truncate">
                  🥎 Kelenturan (Bouncy)
                </span>
                <span className="text-xs sm:text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                  {Math.round(bounciness * 100)}%
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={bounciness}
                onChange={(e) => setBounciness(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-bounciness"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Keras (0)</span>
                <span>Mantul (0.5)</span>
                <span>Super (1)</span>
              </div>
            </div>

            {/* Range Slider 3: Massa */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50 gap-2">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 tracking-wider uppercase truncate">
                  🏋️‍♂️ Massa (Mass)
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
                id="slider-mass"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Kecil (1)</span>
                <span>Sedang (3)</span>
                <span>Raksasa (5)</span>
              </div>
            </div>

            {/* Cute Child Explanation */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-orange-100/60 text-slate-600 text-left">
              <h4 className="text-xs font-extrabold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                <span>💡</span> LAB TRIVIA
              </h4>
              <p className="text-[11.5px] font-semibold leading-relaxed text-slate-500 mt-1.5">
                Gravitasi menarik si Jingga ke bawah, sementara kelenturan menentukan seberapa besar reaksi dorong lantai (Hukum Gerak III Newton)!
              </p>
            </div>
          </div>

          {/* Action Trigger Box */}
          <div className="mt-8 pt-4 border-t-2 border-orange-50 text-left">
            <button 
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-sm uppercase py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              id="btn-physics-reset"
            >
              <RotateCcw className="w-4 h-4" /> Reset Posisi
            </button>
          </div>

        </div>

        {/* Right Column (Simulation Canvas) - Stacks at top on mobile (<768px), right on desktop */}
        <div className="w-full md:w-[68%] lg:w-[70%] flex flex-col gap-4 order-1 md:order-2">
          
          {/* Simulation Viewport Container */}
          <div 
            ref={arenaRef}
            className="w-full h-[380px] md:h-[450px] bg-white rounded-[32px] border-2 border-orange-100/40 shadow-[0_16px_40px_rgba(0,0,0,0.03)] relative overflow-hidden select-none"
            id="physics-canvas"
          >
            {/* science lab grid floor pattern */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#F97316 2px, transparent 2px)', 
                backgroundSize: '24px 24px' 
              }} 
            />

            {/* Inner Drag Bounding Boundaries visual panel */}
            <div 
              ref={constraintsRef}
              className="absolute left-6 right-6 top-6 bottom-14 border border-dashed border-orange-100 rounded-3xl pointer-events-none bg-orange-50/5 flex items-start justify-between p-3"
            >
              <span className="text-[10px] text-orange-400 font-extrabold tracking-widest uppercase">
                ARENA EKSPERIMEN
              </span>
              <span className="text-[10px] text-orange-300 font-bold font-mono">
                {canvasWidth}x{canvasHeight}
              </span>
            </div>

            {/* Character Object: SURPRISED CLAYMASCOT */}
            <motion.div
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.08}
              dragMomentum={false}
              onDragStart={() => {
                setIsDragging(true);
                setExpression('gasp');
              }}
              onDragEnd={(event, info) => {
                setIsDragging(false);
                setPosY(bottomY);
                // Random cheeky reaction on drop height
                if (info.offset.y < -100) {
                  setExpression('excited');
                } else {
                  setExpression(bounciness > 0.8 ? 'excited' : 'happy');
                }
              }}
              animate={isDragging ? {} : { y: posY }}
              transition={isDragging ? { duration: 0 } : { type: 'spring', stiffness, damping }}
              style={{
                width: charSize,
                height: charSize,
                position: 'absolute',
                top: topOffset,
                left: `calc(50% - ${charSize / 2}px)` // Center horizontally by default
              }}
              className="cursor-grab active:cursor-grabbing z-30"
              id="cute-orange-mascot"
            >
              {/* Dynamic Animated Speech Bubble */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={speechText}
                  initial={{ opacity: 0, scale: 0.8, x: "-50%", y: 12 }}
                  animate={{ opacity: 1, scale: 1, x: "-50%", y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: "-50%", y: 12 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="absolute bottom-full left-1/2 mb-5 bg-white border-2 border-orange-200 text-slate-700 text-[11px] md:text-xs font-black px-4 py-2.5 rounded-2xl shadow-[0_8px_24px_rgba(249,115,22,0.18)] border-b-4 border-orange-100 w-44 md:w-52 text-center pointer-events-none z-50 select-none pb-3"
                >
                  {speechText}
                  {/* Speech Bubble Arrow Tail */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-orange-200 rotate-45 -mt-1.5" />
                </motion.div>
              </AnimatePresence>

              <div 
                className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-6px_10px_rgba(0,0,0,0.2),inset_0_6px_10px_rgba(255,255,255,0.7)] hover:scale-105 duration-100 ease-out border-4 border-white/40 drop-shadow-xl flex flex-col items-center justify-center relative select-none"
              >
                {/* 3D clay glossy highlight lines */}
                <div className="absolute top-2.5 left-5 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg]" />
                <div className="absolute top-[18%] left-[10%] w-[10%] h-[10%] bg-white rounded-full opacity-50" />

                {/* Animated Smiley Eyes & Mouth */}
                <div className="flex flex-col items-center justify-center gap-0.5 mt-1.5">
                  <div className="flex justify-between gap-5">
                    {/* Surprised gasped eyes vs normal squinty smiley */}
                    {expression === 'gasp' ? (
                      <>
                        <div className="w-3.5 h-3.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                        <div className="w-3.5 h-3.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      </>
                    ) : expression === 'excited' ? (
                      <>
                        <span className="text-xl md:text-2xl font-black text-slate-800 leading-none select-none">👀</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl md:text-2xl font-black text-slate-800 leading-none select-none">^</span>
                        <span className="text-xl md:text-2xl font-black text-slate-800 leading-none select-none">^</span>
                      </>
                    )}
                  </div>

                  {/* Mouth representation based on status */}
                  <div className={`mt-0.5 bg-slate-800 rounded-full transition-all duration-200 ${
                    expression === 'gasp' 
                      ? 'w-4 h-4 border-2 border-slate-900 bg-red-400' 
                      : expression === 'excited'
                      ? 'w-5 h-2.5 rounded-b-full bg-slate-800'
                      : 'w-4 h-1'
                  }`} />
                </div>

                {/* Puffy round 3D blushes */}
                <div className="absolute bottom-[28%] left-[12%] w-[20%] h-[10%] bg-rose-400/80 rounded-full blur-[0.5px]" />
                <div className="absolute bottom-[28%] right-[12%] w-[20%] h-[10%] bg-rose-400/80 rounded-full blur-[0.5px]" />
              </div>
            </motion.div>

            {/* Submerged bouncy floor visual */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-emerald-600 to-emerald-500 border-t-4 border-emerald-400 flex items-center justify-center shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
              <span className="text-white text-xs font-black tracking-widest uppercase opacity-90 drop-shadow-md">
                LANTAI LABORATORIUM 🏕️
              </span>
            </div>
            
          </div>

          {/* Tips Instruction card at bottom of right canvas */}
          <div className="bg-amber-100/60 rounded-3xl p-5 border-2 border-amber-200/50 flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 text-left">
            <span className="text-3xl animate-bounce shrink-0">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Laboran Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Seret karakterku ke udara dan lepaskan! Kamu akan melihat bagaimana Hukum Newton I tentang kelembaman bekerjasama dengan percepatan gravitasi bumi."
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
