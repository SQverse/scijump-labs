import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles, Clock, Zap, ShieldAlert, Sliders, Hand } from 'lucide-react';

interface StaticSimulationProps {
  onBack: () => void;
}

export default function StaticSimulation({ onBack }: StaticSimulationProps) {
  // 1. Controls Panel State
  const [charge, setCharge] = useState<number>(0); // Range 0 to 100 (Elektron)
  const [pullForce, setPullForce] = useState<number>(3); // Range 1 to 5 (Kekuatan Tarik)

  // 2. Balloon positioning and dragging states
  const [balloonPos, setBalloonPos] = useState({ x: 420, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 3. Canvas constraints measuring
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 420 });

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasSize({
        width: canvasRef.current.clientWidth,
        height: canvasRef.current.clientHeight
      });
      const handleResize = () => {
        if (canvasRef.current) {
          setCanvasSize({
            width: canvasRef.current.clientWidth,
            height: canvasRef.current.clientHeight
          });
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Set default starting positions once canvas is ready
  useEffect(() => {
    if (canvasSize.width > 200) {
      setBalloonPos({
        x: Math.round(canvasSize.width * 0.7),
        y: Math.round(canvasSize.height * 0.35)
      });
    }
  }, [canvasSize.width]);

  // Mascot coordinate calculations
  // Mascot base position is left-middle: { x: 80, y: 160 }
  // If Charge > 80, it gets pulled towards the balloon!
  const isAttracted = charge > 80;
  
  const mascotBaseX = 80;
  const mascotBaseY = 160;

  // Compute actual target position of Mascot if attracted
  // We keep it slightly offset horizontally so they don't overlap completely (-94px)
  const mascotTargetX = Math.max(20, balloonPos.x - 90);
  const mascotTargetY = balloonPos.y + 20;

  // Active coordinates of mascot (approximate fallback used for distance check)
  const mascotCurrentX = isAttracted ? mascotTargetX : mascotBaseX;
  const mascotCurrentY = isAttracted ? mascotTargetY : mascotBaseY;

  // Distance computation
  const dx = (balloonPos.x + 50) - (mascotCurrentX + 40);
  const dy = (balloonPos.y + 60) - (mascotCurrentY + 40);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Auto charge increment on "rubbing":
  // When dragging the balloon and it touches/rubs the mascot, we automatically transfer charge!
  useEffect(() => {
    if (isDragging) {
      if (distance < 150) {
        setCharge((prev) => Math.min(100, Math.round(prev + 1)));
      }
    }
  }, [balloonPos, isDragging, distance]);

  // Pointer event coordinate offset calculations for dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      setDragOffset({
        x: clickX - balloonPos.x,
        y: clickY - balloonPos.y
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      let newX = clickX - dragOffset.x;
      let newY = clickY - dragOffset.y;

      // Restrict inside boundary
      newX = Math.max(10, Math.min(newX, rect.width - 110));
      newY = Math.max(10, Math.min(newY, rect.height - 130));

      setBalloonPos({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
  };

  // Grounded Reset button function
  const handleGrounded = () => {
    setCharge(0);
    if (canvasSize.width > 200) {
      setBalloonPos({
        x: Math.round(canvasSize.width * 0.7),
        y: Math.round(canvasSize.height * 0.35)
      });
    }
  };

  // Mascot Hair Mechanics:
  // Math vector to calculate target rotation angle towards balloon
  const headTopX = mascotCurrentX + 40;
  const headTopY = mascotCurrentY;
  const balloonCenterX = balloonPos.x + 50;
  const balloonCenterY = balloonPos.y + 60;

  const hdx = balloonCenterX - headTopX;
  const hdy = balloonCenterY - headTopY;
  
  // Angle relative to straight-up vector (0, -1) in degrees
  const angleToBalloonRad = Math.atan2(hdy, hdx);
  const angleToBalloonDeg = angleToBalloonRad * (180 / Math.PI) + 90;

  // Clamp angle to safe ranges so hair doesn't turn upside down
  const clampedAngle = Math.max(-85, Math.min(85, angleToBalloonDeg));

  // Charge response interpolation
  const chargeFactor = charge / 100; // 0 to 1

  // Hair Stand angles
  const hairAngle1 = (1 - chargeFactor) * (-25) + chargeFactor * clampedAngle;
  const hairAngle2 = (1 - chargeFactor) * (0) + chargeFactor * clampedAngle;
  const hairAngle3 = (1 - chargeFactor) * (25) + chargeFactor * clampedAngle;

  const hairScaleY = 1 + chargeFactor * 0.45; // Hairs stretch outward when charged!

  // Speech bubble text based on current electrostatic charge
  const getSpeechText = () => {
    if (charge === 0) {
      return "Gosok balonnya ke aku biar ada listriknya! 🎈✨";
    }
    if (charge < 60) {
      return "Eh, rambutku mulai berdiri! Rasanya geli-geli gimana gitu... ⚡️🙈";
    }
    if (charge < 90) {
      return "Waaaa! Balonnya narik aku kuat banget! 🎈🧲";
    }
    return "ZAPPP! Hati-hati, muatannya terlalu penuh! ⚡️😱";
  };

  const speechText = getSpeechText();

  // Highlight electrostatic electron stickers on balloon
  const electronCoordinates = [
    { x: 30, y: 35 },
    { x: 55, y: 25 },
    { x: 45, y: 48 },
    { x: 25, y: 60 },
    { x: 68, y: 45 },
    { x: 38, y: 75 },
    { x: 58, y: 65 },
    { x: 50, y: 88 },
    { x: 18, y: 45 },
    { x: 74, y: 62 },
    { x: 52, y: 15 },
    { x: 34, y: 20 },
    { x: 28, y: 82 },
    { x: 64, y: 80 },
    { x: 44, y: 34 }
  ];

  // Number of electrons visible scales up with the charge value
  const numElectronsToShow = Math.floor((charge / 100) * electronCoordinates.length);

  // Electrical spark discharge logic
  const isCloseEnoughForSpark = distance < 210 && charge >= 50;

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Header section consistent with design guidelines */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#7C3AED] font-extrabold text-sm bg-white hover:bg-[#7C3AED]/5 border-2 border-[#7C3AED]/10 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-static-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Energi: Listrik Statis ⚡
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Materi: Gaya Elektrostatik & Hukum Coulomb Penarik Muatan
          </p>
        </div>

        {/* Space contextual badges */}
        <div className="flex gap-2">
          <span className="bg-amber-50 text-amber-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-200">
            <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            ELECTROSTATIC CHARGE
          </span>
          <span className="bg-orange-100 text-orange-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin-slow" />
            ATTRACT FORCE: {pullForce}x
          </span>
        </div>
      </div>

      {/* Split Interactive Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Controls column: 30% width (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">🔋</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Generator Statis
              </h2>
            </div>

            {/* Slider 1: Elektron Charge */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-orange-50/70 p-3.5 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase flex items-center gap-1">
                  🎈 Muatan Elektron
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full animate-bounce">
                  {charge} e⁻
                </span>
              </div>
              
              <input 
                type="range"
                min="0"
                max="100"
                step="1"
                value={charge}
                onChange={(e) => setCharge(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-[#F97316] outline-none"
                id="slider-static-electrons"
              />

              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>0 e⁻ (Netral)</span>
                <span>50 e⁻ (Sedang)</span>
                <span>100 e⁻ (Ekstrem)</span>
              </div>
            </div>

            {/* Slider 2: Force Pull strength */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/40">
                <span className="text-xs font-extrabold text-purple-700 tracking-wider uppercase">
                  🧲 Kekuatan Tarik
                </span>
                <span className="text-sm font-black text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  Level {pullForce}
                </span>
              </div>

              <input 
                type="range"
                min="1"
                max="5"
                step="1"
                value={pullForce}
                onChange={(e) => setPullForce(Number(e.target.value))}
                className="w-full h-3 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600 outline-none"
                id="slider-static-force"
              />

              <div className="flex justify-between text-[11px] font-bold text-purple-400">
                <span>Lemah (1)</span>
                <span>Sedang (3)</span>
                <span>Kuat (5)</span>
              </div>
            </div>

            {/* Coulomb calculation stat show */}
            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/40 space-y-2">
              <span className="text-[10px] font-black text-indigo-700 tracking-wider uppercase bg-indigo-100/70 py-1 px-2.5 rounded-full">
                📐 HUKUM COULOMB INFO
              </span>
              <div className="space-y-1.5 pt-2 text-xs text-slate-500 font-semibold leading-relaxed">
                <div className="flex justify-between">
                  <span>Gaya Tarik (F):</span>
                  <span className="font-extrabold text-indigo-900">
                    {charge === 0 ? '0' : ((charge * pullForce) / Math.max(1, distance / 40)).toFixed(1)} N
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Jarak Balon - Mascot:</span>
                  <span className="font-extrabold text-indigo-900">{Math.round(distance)} px</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 italic font-sans">
                  "Gaya tarik elektrostatik sebanding dengan besar muatan kedua benda, dan berbanding terbalik dengan kuadrat jarak!"
                </div>
              </div>
            </div>

            {/* Quick help label */}
            <div className="bg-amber-100/40 rounded-2xl p-3 border border-amber-200/50 text-[11px] text-amber-800 font-bold flex gap-2">
              <Hand className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>GOSOK CARA ALAMI: Geser balon biru dan gosokkan langsung ke tubuh Mascot untuk mengisi daya listrik statis!</span>
            </div>

          </div>

          {/* Grounded discharging trigger */}
          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={handleGrounded}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-slate-200/50 shadow-sm"
              id="btn-static-reset"
            >
              <RotateCcw className="w-4 h-4" /> Hilangkan Muatan (Grounded) 🔄
            </button>
          </div>

        </div>

        {/* Right Side: 70% Width Electrostatic Sandbox Canvas */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            ref={canvasRef}
            className="w-full h-[450px] md:h-[480px] bg-[#0b0c16] rounded-[32px] border-[3px] border-[#18192a] shadow-[0_16px_40px_rgba(0,0,0,0.15)] relative overflow-hidden select-none"
            id="static-canvas"
          >
            {/* Soft background futuristic blueprint vectors */}
            <div 
              className="absolute inset-0 opacity-[0.06] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)', 
                backgroundSize: '24px 24px' 
              }} 
            />

            {/* Field lines radiating from charged balloon when high charge is active */}
            {charge > 10 && (
              <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
                <svg className="w-full h-full">
                  <defs>
                    <radialGradient id="electricField" cx={`${balloonPos.x + 50}px`} cy={`${balloonPos.y + 60}px`} r="300px" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="rgba(245, 158, 11, 0.25)" />
                      <stop offset="60%" stopColor="rgba(245, 158, 11, 0.05)" />
                      <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
                    </radialGradient>
                  </defs>
                  <circle cx={balloonPos.x + 50} cy={balloonPos.y + 60} r={Math.min(300, charge * 3)} fill="url(#electricField)" />
                </svg>
              </div>
            )}

            {/* HUD Status overlay details */}
            <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none z-[45]">
              <span className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase bg-indigo-950/60 px-3.5 py-2 rounded-full border border-amber-500/30 backdrop-blur-sm shadow-sm">
                COULOMB LABS MEMBRANE 🧫
              </span>
              <div className="text-right flex flex-col items-end gap-1.5">
                <span className="text-[10px] text-purple-200 font-black tracking-wider uppercase bg-indigo-950/60 px-3.5 py-1.5 rounded-full border border-purple-800/40 backdrop-blur-sm shadow-sm flex items-center gap-1">
                  Status Rambut: {charge === 0 ? 'REBAH' : (charge > 85 ? 'JINGKRAK' : 'MENGARAH')}
                </span>
                <span className="text-[10px] text-yellow-300 font-black tracking-wider uppercase bg-indigo-950/60 px-3 py-1.5 rounded-full border border-yellow-500/30 backdrop-blur-sm shadow-sm">
                  Kuat Medan (E): {charge === 0 ? '0 N/C' : ((charge * 8.9) / Math.max(1, distance / 100)).toFixed(0) + ' N/C'}
                </span>
              </div>
            </div>

            {/* CORE SIMULATED COMPONENT A: Mascot character */}
            {/* Framer motion spring coordinates movement pull response */}
            <motion.div
              animate={{
                x: mascotCurrentX,
                y: mascotCurrentY
              }}
              transition={{
                type: 'spring',
                stiffness: 40 + pullForce * 35, // Adjust response based on slider
                damping: 14
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 40
              }}
              className="flex flex-col items-center pointer-events-none"
              id="mascot-static-ball"
            >
              {/* Dynamic Speech bubble bound strictly upright immediately above character */}
              <div className="relative mb-5 pointer-events-none select-none z-[60]">
                <div className="bg-slate-900/95 border-2 border-orange-400 text-orange-200 text-[10px] md:text-xs font-black px-4 py-2 rounded-2xl shadow-2xl w-48 text-center backdrop-blur-sm leading-tight relative">
                  {speechText}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-r-2 border-b-2 border-orange-400 rotate-45 -mt-1.5 pointer-events-none" />
                </div>
              </div>

              {/* Character container relative block */}
              <div className="relative w-23 h-23 flex items-center justify-center">

                {/* ATTACHED Mascot Hair lines layers deflected toward balloon */}
                {/* 3 thin, curved lines representing hair */}
                <div className="absolute top-[-4px] left-0 right-0 h-[22px] flex justify-center gap-2.5 pointer-events-none z-10">
                  {/* Left Hair */}
                  <motion.div 
                    animate={{ rotate: hairAngle1, scaleY: hairScaleY }}
                    style={{ transformOrigin: 'bottom center' }}
                    className="w-1.5 h-6 bg-slate-300 rounded-full border border-slate-700/80 shadow-sm"
                  />
                  {/* Middle Hair */}
                  <motion.div 
                    animate={{ rotate: hairAngle2, scaleY: hairScaleY }}
                    style={{ transformOrigin: 'bottom center' }}
                    className="w-1.5 h-7 bg-slate-300 rounded-full border border-slate-700/80 shadow-sm"
                  />
                  {/* Right Hair */}
                  <motion.div 
                    animate={{ rotate: hairAngle3, scaleY: hairScaleY }}
                    style={{ transformOrigin: 'bottom center' }}
                    className="w-1.5 h-6 bg-slate-300 rounded-full border border-slate-700/80 shadow-sm"
                  />
                </div>

                {/* THE CUTE ORANGE FAMILY ATOM */}
                {/* GEOMETRY LOCKED PERFECT CIRCLE OF DEFINITION */}
                <div 
                  className="w-20 h-20 shrink-0 flex-shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-white/50 flex flex-col items-center justify-center relative select-none z-20"
                  style={{ width: '80px', height: '80px' }}
                >
                  {/* Specular glare */}
                  <div className="absolute top-2 left-2.5 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg] pointer-events-none" />
                  <div className="absolute top-[18%] left-[8%] w-[10%] h-[10%] bg-white rounded-full opacity-50 pointer-events-none" />

                  {/* Faces: Shivering / Happy vs Shocked Wide Eyes */}
                  {charge >= 50 ? (
                    // SHOCKED WIDE O_O Eyes
                    <div className="flex justify-between gap-3.5 z-10 select-none animate-bounce">
                      <div className="w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center relative border border-slate-950">
                        <div className="absolute top-0.5 right-0.5 w-[3px] h-[3px] bg-white rounded-full" />
                      </div>
                      <div className="w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center relative border border-slate-950">
                        <div className="absolute top-0.5 right-0.5 w-[3px] h-[3px] bg-white rounded-full" />
                      </div>
                    </div>
                  ) : (
                    // HAPPY IDLE: Caret eyes ^_^
                    <div className="flex justify-between gap-2.5 z-10 select-none">
                      <svg width="14" height="8" viewBox="0 0 10 8" className="w-4 h-3">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <svg width="14" height="8" viewBox="0 0 10 8" className="w-4 h-3">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* Mouth structures based on temperature states */}
                  <div className="z-10 mt-1">
                    {charge >= 50 ? (
                      /* Shocked wide open mouth */
                      <div className="w-3.5 h-3.5 bg-slate-900 rounded-full border border-slate-950 shadow-inner" />
                    ) : (
                      /* Flat happy cute straight smile outline */
                      <div className="w-4 h-[2px] bg-slate-900 rounded-full" />
                    )}
                  </div>

                  {/* Blushing checks */}
                  <div className="absolute bottom-[20%] left-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                  <div className="absolute bottom-[20%] right-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                </div>

              </div>
            </motion.div>


            {/* CORE SIMULATED COMPONENT B: Interactive Drag Balloon */}
            <motion.div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              animate={{
                scale: isDragging ? 1.05 : 1,
                rotate: isDragging ? -3 : 0
              }}
              style={{
                position: 'absolute',
                left: `${balloonPos.x}px`,
                top: `${balloonPos.y}px`,
                width: '100px',
                height: '120px',
                zIndex: 50,
                touchAction: 'none'
              }}
              className="cursor-grab active:cursor-grabbing relative flex items-center justify-center group"
              id="balloon-draggable"
            >
              {/* Inner clay design premium SVG */}
              <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl select-none pointer-events-none">
                <defs>
                  <radialGradient id="blueBalloon" cx="50%" cy="40%" r="50%" fx="30%" fy="30%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="70%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </radialGradient>
                </defs>
                {/* Balloon body */}
                <path 
                  d="M 50 10 C 20 10, 10 35, 10 60 C 10 82, 35 102, 50 102 C 65 102, 90 82, 90 60 C 90 35, 80 10, 50 10 Z" 
                  fill="url(#blueBalloon)"
                  stroke="#1E3A8A"
                  strokeWidth="2.5"
                />
                {/* Small knot at bottom */}
                <polygon points="45,102 55,102 50,108" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="1.5" />
                {/* Curly dangling string */}
                <path d="M 50 108 Q 48 114, 52 118 T 48 126" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
                {/* Glossy shine glare */}
                <ellipse cx="32" cy="30" rx="8" ry="14" fill="#FFFFFF" opacity="0.45" transform="rotate(-25 32 30)" />
              </svg>

              {/* Electron particles sticker layer ("-" minus signs overlay) */}
              <div className="absolute inset-0 pointer-events-none select-none z-30">
                {electronCoordinates.slice(0, numElectronsToShow).map((coord, idx) => (
                  <span
                    key={idx}
                    className="absolute font-mono font-black text-amber-300 text-sm select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] bg-slate-900/60 w-4 h-4 rounded-full flex items-center justify-center leading-none border border-amber-300/30"
                    style={{
                      left: `${coord.x}%`,
                      top: `${coord.y}%`,
                    }}
                  >
                    -
                  </span>
                ))}
              </div>

              {/* Small "DRAG ME!" overlay prompt on balloon hover */}
              {!isDragging && charge === 0 && (
                <div className="absolute bottom-[-24px] bg-indigo-950/90 border border-cyan-400 text-cyan-300 text-[9px] font-black uppercase py-0.5 px-2 rounded-full shadow animate-pulse group-hover:scale-105 transition-all">
                  TARIK AKU! 🎈
                </div>
              )}
            </motion.div>


            {/* CORE VISUAL C: Lightning Discharge Zap spark */}
            {isCloseEnoughForSpark && (
              <motion.svg 
                animate={{ 
                  opacity: [1, 0.3, 1, 0.1, 0.9, 0.2, 1],
                  scale: [1, 1.2, 0.9, 1.1, 1]
                }}
                transition={{ repeat: Infinity, duration: 0.24 }}
                className="absolute pointer-events-none z-45 filter drop-shadow-[0_0_12px_#F59E0B]"
                style={{
                  left: `${(mascotCurrentX + 40 + balloonPos.x + 50) / 2 - 24}px`,
                  top: `${(mascotCurrentY + 40 + balloonPos.y + 60) / 2 - 24}px`,
                  width: '48px',
                  height: '48px'
                }}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FBBF24" stroke="#FFF" strokeWidth="2" strokeLinejoin="round" />
              </motion.svg>
            )}

            {/* Glowing neon sparks sound bubbles popping up */}
            {isCloseEnoughForSpark && (
              <motion.div
                animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.35 }}
                style={{
                  position: 'absolute',
                  left: `${(mascotCurrentX + 45 + balloonPos.x + 50) / 2 - 25}px`,
                  top: `${(mascotCurrentY + 45 + balloonPos.y + 60) / 2 + 18}px`
                }}
                className="text-amber-400 text-[10px] font-black tracking-widest bg-slate-900 border border-amber-400/50 py-0.5 px-1.5 rounded-md shadow-lg pointer-events-none z-50 text-center uppercase"
              >
                ⚡ ZAP!
              </motion.div>
            )}

            {/* Bottom Horizon line HUD branding matching siblings */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-orange-500 flex items-center justify-center opacity-90 z-[40]">
              <span className="text-orange-300 text-[10px] font-black tracking-widest uppercase">
                ATOR ELEKTROSTATIK PENELITI CILIK PROF. JUMP ⚡
              </span>
            </div>

          </div>

          {/* Pedagogy Lab Instruction Card */}
          <div className="bg-amber-100/60 rounded-3xl p-5 border-2 border-amber-200/50 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Listrik Statis Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Coba geser 'Muatan Elektron' ke level tinggi atau gosokkan langsung balon biru ke tubuh Mascot! Saat muatan penuh, rambut Mascot akan berjingkrak ditarik ke arah balon, bahkan Mascot bisa ikut melayang tertarik ke balon! Keren!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
