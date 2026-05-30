import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles, Compass, HelpCircle } from 'lucide-react';

interface LeverSandboxProps {
  onBack: () => void;
}

export default function LeverSandbox({ onBack }: LeverSandboxProps) {
  // 1. Controls Panel State
  const [fulcrumPos, setFulcrumPos] = useState<number>(0); // Range -50 to 50
  const [leftMass, setLeftMass] = useState<number>(3); // Range 1 to 5
  const [rightMass, setRightMass] = useState<number>(3); // Range 1 to 5

  // Mascot expression state
  const [expression, setExpression] = useState<'happy' | 'gasp' | 'excited' | 'dizzy'>('happy');

  // Torque and Tilt Calculation
  // Standard distance from center of plank of left/right seat is 150px
  const leftDistance = 150 + fulcrumPos;
  const rightDistance = 150 - fulcrumPos;

  const leftTorque = leftMass * leftDistance;
  const rightTorque = rightMass * rightDistance;
  
  const torqueDiff = leftTorque - rightTorque;
  
  // Calculate angle based on torque difference: left heavy means negative angle (tilts left counterclockwise)
  // or positive. Let's make Left Torque > Right Torque tilt down on left (positive counter-clockwise tilt, say -15 deg)
  // Left side goes down: rotation is counter-clockwise (so negative angle)
  // Let's map it: angle = - (torqueDiff / maxTorqueDiff) * maxAngle
  const maxPossibleDiff = (5 * 200) - (1 * 100); // approx max range
  const rawAngle = -(torqueDiff / 150) * 12;
  const angle = Math.max(-15, Math.min(15, rawAngle));

  // Determine speech text for the Orange mascot
  const getSpeechText = () => {
    // If we're exactly balanced (within small threshold)
    if (Math.abs(torqueDiff) < 1) {
      return "HOREEE! Seimbang! Kita berhasil! 🎉";
    }
    // If left is heavier (tilted to the left, so left side is down)
    if (torqueDiff > 0) {
      return "Wahhh, aku jomplang ke bawah! Berat banget! 😲";
    }
    // If right is heavier (tilted to the right, so left side is up)
    return "Eh eh, aku terbang ke atas! Kurang beban nih! 🎈";
  };

  const speechText = getSpeechText();

  // Handle reset of leverage simulation
  const handleReset = () => {
    setFulcrumPos(0);
    setLeftMass(3);
    setRightMass(3);
    setExpression('happy');
  };

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Header section consistent with design */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-extrabold text-sm bg-white hover:bg-orange-50/50 border-2 border-orange-100 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3 animate-fade-in"
            id="btn-lever-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Mekanika: Tuas & Pengungkit ⚖️
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Teori: Kesetimbangan Torsi
          </p>
        </div>

        {/* Informational Physics badges */}
        <div className="flex gap-2">
          <span className="bg-orange-100 text-orange-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            EKSKUSI LENGKAP
          </span>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-emerald-200">
            <Compass className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
            TORSI & TITIK TUMPU
          </span>
        </div>
      </div>

      {/* Main Split Screen Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Column Controls Panel (30% equivalent / 3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Panel Kontrol Kesetimbangan
              </h2>
            </div>

            {/* Range Slider 1: Posisi Titik Tumpu */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  📐 Posisi Titik Tumpu
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
                  {fulcrumPos > 0 ? `+${fulcrumPos}` : fulcrumPos} cm
                </span>
              </div>
              <input 
                type="range"
                min="-50"
                max="50"
                step="1"
                value={fulcrumPos}
                onChange={(e) => setFulcrumPos(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-fulcrum"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Lebih Kiri</span>
                <span>Tengah (0)</span>
                <span>Lebih Kanan</span>
              </div>
            </div>

            {/* Range Slider 2: Beban Kiri (Mascot) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  ☄️ Beban Kiri (Wajah Oranye)
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
                  {leftMass} kg
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="5"
                step="1"
                value={leftMass}
                onChange={(e) => setLeftMass(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-left-mass"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Kecil (1 kg)</span>
                <span>Sedang (3 kg)</span>
                <span>Raksasa (5 kg)</span>
              </div>
            </div>

            {/* Range Slider 3: Beban Kanan (Kotak Mainan) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-orange-50/60 p-3 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  📦 Beban Kanan (Kotak Mainan)
                </span>
                <span className="text-sm font-black text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
                  {rightMass} kg
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="5"
                step="1"
                value={rightMass}
                onChange={(e) => setRightMass(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
                id="slider-right-mass"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Ringan (1 kg)</span>
                <span>Sedang (3 kg)</span>
                <span>Berat (5 kg)</span>
              </div>
            </div>

            {/* Pedagogy explanation card */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-orange-100/60 text-slate-600">
              <h4 className="text-xs font-extrabold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                <span>💡</span> RUMUS TORSI
              </h4>
              <p className="text-[11.5px] font-semibold leading-relaxed text-slate-500 mt-1.5">
                <strong className="text-slate-700">Torsi (τ) = Gaya × Jarak</strong>.<br />
                Meskipun berat sebelah kanan kecil, jarak yang jauh dari titik tumpu bisa menghasilkan dorongan memutar yang sangat besar!
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-sm uppercase py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              id="btn-lever-reset"
            >
              <RotateCcw className="w-4 h-4" /> Reset Keseimbangan
            </button>
          </div>

        </div>

        {/* Right Column Seesaw Simulation (70% equivalent / 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            className="w-full h-[400px] md:h-[450px] bg-white rounded-[32px] border-2 border-orange-100/40 shadow-[0_16_40px_rgba(0,0,0,0.03)] relative overflow-hidden select-none flex flex-col items-center justify-end"
            id="lever-canvas"
          >
            {/* science lab grid pattern */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#F97316 2px, transparent 2px)', 
                backgroundSize: '24px 24px' 
              }} 
            />

            {/* Title overlay in sandbox */}
            <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none">
              <span className="text-[10px] text-orange-400 font-extrabold tracking-widest uppercase bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                PAPAN JOMPLANG-JAMPLIG
              </span>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[10px] text-sky-500 font-black tracking-wider uppercase bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
                  Torsi Kiri: {leftTorque.toFixed(0)} N·m
                </span>
                <span className="text-[10px] text-purple-500 font-black tracking-wider uppercase bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                  Torsi Kanan: {rightTorque.toFixed(0)} N·m
                </span>
              </div>
            </div>

            {/* SEESAW PLANK WORKSPACE */}
            <div className="w-full h-[280px] relative flex flex-col items-center justify-end pb-14">
              
              {/* Wooden Plank + Mascots sitting on top */}
              {/* We calculate horizontal tilt offset shift to anchor onto the shifting Fulcrum Triangle */}
              {/* Fulcrum point is at x = fulcrumPos (mapped horizontally) */}
              <motion.div
                animate={{ 
                  rotate: angle,
                  x: fulcrumPos * 2.8 // Multiplier to visually align center of tilt with shifting fulcrum
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                className="w-[420px] md:w-[480px] h-6 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-full border-2 border-amber-900 shadow-md relative flex items-center justify-between"
                style={{ originX: 0.5 - (fulcrumPos * 0.005) }} // Pivot changes based on fulcrum horizontal displacement
              >
                {/* Visual wood stripes pattern */}
                <div className="absolute inset-x-4 inset-y-1 border-t border-b border-amber-500/20 rounded-full pointer-events-none" />

                {/* Left Side: Mascot Ball sitting on top of the plank */}
                {/* Placed absolutely above the far left side or relative seat */}
                <div 
                  className="absolute bottom-6 left-6 flex flex-col items-center"
                  style={{ transform: 'translateX(0)' }}
                >
                  
                  {/* Speech Bubble above the mascot inside the rotating parent so it remains linked */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={speechText}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      className="mb-3 bg-white border-2 border-orange-200 text-slate-700 text-[10px] md:text-xs font-black px-3.5 py-2 rounded-2xl shadow-lg border-b-4 border-orange-100 w-36 md:w-44 text-center pointer-events-none relative"
                      // Keep the speech bubble upright even when the plank tilts!
                      style={{ transform: `rotate(${-angle}deg)` }}
                    >
                      {speechText}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-orange-200 rotate-45 -mt-1.5" />
                    </motion.div>
                  </AnimatePresence>

                  {/* The Orange Ball Mascot */}
                  <div 
                    style={{ 
                      width: leftMass * 14 + 32, 
                      height: leftMass * 14 + 32,
                    }}
                    className="rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] border-[3px] border-white/40 drop-shadow-md flex flex-col items-center justify-center relative select-none"
                  >
                    {/* Shiny clay reflection */}
                    <div className="absolute top-1.5 left-2.5 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg]" />
                    
                    {/* Smiley face detail */}
                    <div className="flex flex-col items-center justify-center gap-0.5 mt-0.5">
                      <div className="flex justify-between gap-3">
                        {Math.abs(angle) > 10 ? (
                          <span className="text-[14px] font-black text-slate-800">😋</span>
                        ) : (
                          <>
                            <span className="text-xs font-black text-slate-800">^</span>
                            <span className="text-xs font-black text-slate-800">^</span>
                          </>
                        )}
                      </div>
                      <div className="w-3.5 h-1 bg-slate-800 rounded-full" />
                    </div>
                  </div>

                  <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full mt-1.5 shadow-sm">
                    {leftMass} kg
                  </span>
                </div>

                {/* Right Side: Toy Box sitting on top of the plank */}
                <div 
                  className="absolute bottom-6 right-6 flex flex-col items-center"
                  style={{ transform: 'translateX(0)' }}
                >
                  {/* The Interactive Red/Yellow Toy Code Sandbox box */}
                  <div 
                    style={{ 
                      width: rightMass * 14 + 32, 
                      height: rightMass * 14 + 32,
                    }}
                    className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl border-[3px] border-amber-900/60 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.15),inset_0_4px_8px_rgba(255,255,255,0.6)] drop-shadow-md flex flex-col items-center justify-center relative p-1 leading-none select-none"
                  >
                    {/* Gift stripes visual wrapping */}
                    <div className="w-full h-full border border-amber-200/50 rounded-xl relative flex items-center justify-center">
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[30%] bg-amber-200/40" />
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[30%] bg-amber-200/40" />
                      <span className="text-lg md:text-xl drop-shadow">🎁</span>
                    </div>
                  </div>

                  <span className="bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full mt-1.5 shadow-sm">
                    {rightMass} kg
                  </span>
                </div>

              </motion.div>

              {/* Fulcrum Triangle - absolute position directly under Plank pivot point */}
              {/* Moving horizontally along with fulcrumPos */}
              <motion.div
                animate={{ x: fulcrumPos * 2.8 }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                className="absolute z-10 bottom-0 select-none cursor-pointer"
                style={{ width: 64, height: 56 }}
              >
                {/* Styled Claymorphic triangle triangle */}
                <div className="w-full h-full relative">
                  <svg viewBox="0 0 60 55" className="w-[60px] h-[55px] drop-shadow-md">
                    <path 
                      d="M25 5 L5 48 C 3 53, 57 53, 55 48 L35 5 C32 1, 28 1, 25 5 Z" 
                      fill="url(#clay-triangle-gradient)" 
                      stroke="#475569" 
                      strokeWidth="3"
                    />
                    <defs>
                      <linearGradient id="clay-triangle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#94A3B8" />
                        <stop offset="50%" stopColor="#64748B" />
                        <stop offset="100%" stopColor="#475569" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Decorative pivot metallic screw dot */}
                  <div className="absolute top-[22px] left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full border border-slate-600 shadow-inner flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Ground design alignment */}
            <div className="w-full h-14 bg-gradient-to-t from-emerald-600 to-emerald-500 border-t-4 border-emerald-400 flex items-center justify-center shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
              <span className="text-white text-xs font-black tracking-widest uppercase opacity-90 drop-shadow-md">
                LANTAI LABORATORIUM Kesetimbangan 🏕️
              </span>
            </div>
            
          </div>

          {/* Pedagogy guidelines footer speech balloon */}
          <div className="bg-amber-100/60 rounded-3xl p-5 border-2 border-amber-200/50 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Laboran Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5 font-sans">
                "Coba geser titik tumpu lebih dekat ke si Jingga, lalu tambahkan beban di kotak kado. Kamu akan melihat bahwa beban kecil bisa mengalahkan beban besar jika diletakkan sejauh mungkin dari titik tumpu!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
