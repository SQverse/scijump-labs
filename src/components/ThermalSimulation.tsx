import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Flame, Snowflake, RotateCcw, AlertCircle, Sparkles, Thermometer } from 'lucide-react';

interface ThermalSimulationProps {
  onBack: () => void;
}

interface Molecule {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function ThermalSimulation({ onBack }: ThermalSimulationProps) {
  // 1. Controls Panel State
  const [temperature, setTemperature] = useState<number>(25); // Range -50 (Beku) to 100 (Mendidih)
  const [numMolecules, setNumMolecules] = useState<number>(12); // Range 5 to 20

  // 2. Local Tick and Render state
  const [renderTrigger, setRenderTrigger] = useState<number>(0);

  // References for measurements
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 500, height: 320 });

  // Physics particles lists
  const mascotRef = useRef({
    x: 150,
    y: 120,
    vx: 2.2,
    vy: 1.8
  });

  const moleculesRef = useRef<Molecule[]>([]);

  // Observe and measure the molecule container boundaries dynamically
  useEffect(() => {
    if (containerRef.current) {
      const handleResize = () => {
        if (containerRef.current) {
          setContainerSize({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight
          });
        }
      };

      handleResize();
      const observer = new ResizeObserver(handleResize);
      observer.observe(containerRef.current);

      return () => observer.disconnect();
    }
  }, []);

  // Initialize the molecules and position boundaries
  useEffect(() => {
    if (containerSize.width > 100 && containerSize.height > 100) {
      // If array is empty, initialize fully
      if (moleculesRef.current.length === 0) {
        const initialMolecules: Molecule[] = [];
        const colors = [
          '#3B82F6', // Ice Blue
          '#EF4444', // Hot Crimson
          '#10B981', // Jade Green
          '#F59E0B', // Sun Amber
          '#EC4899', // Cotton Pink
          '#8B5CF6', // Magic Purple
          '#14B8A6'  // Aurora Teal
        ];
        for (let i = 0; i < numMolecules; i++) {
          initialMolecules.push({
            id: i,
            x: 40 + Math.random() * (containerSize.width - 80),
            y: 40 + Math.random() * (containerSize.height - 80),
            vx: (Math.random() - 0.5) * 4 || 1.5,
            vy: (Math.random() - 0.5) * 4 || -1.5,
            color: colors[i % colors.length]
          });
        }
        moleculesRef.current = initialMolecules;

        // Position mascot character safely centered
        mascotRef.current = {
          x: containerSize.width / 2 - 32,
          y: containerSize.height / 2 - 32,
          vx: 2.1,
          vy: 1.6
        };
      }
    }
  }, [containerSize]);

  // Adjust particle size array on the fly based on numMolecules state
  useEffect(() => {
    if (containerSize.width <= 100 || containerSize.height <= 100) return;

    const currentLength = moleculesRef.current.length;
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'
    ];

    if (currentLength < numMolecules) {
      const toAdd = numMolecules - currentLength;
      const nextArr = [...moleculesRef.current];
      for (let i = 0; i < toAdd; i++) {
        nextArr.push({
          id: Date.now() + i + Math.random(),
          x: 40 + Math.random() * (containerSize.width - 80),
          y: 40 + Math.random() * (containerSize.height - 80),
          vx: (Math.random() - 0.5) * 4 || 1.5,
          vy: (Math.random() - 0.5) * 4 || -1.5,
          color: colors[(currentLength + i) % colors.length]
        });
      }
      moleculesRef.current = nextArr;
    } else if (currentLength > numMolecules) {
      moleculesRef.current = moleculesRef.current.slice(0, numMolecules);
    }
  }, [numMolecules, containerSize]);

  // Main physics kinematics coordinate update ticks loops
  useEffect(() => {
    let animId: number;
    const tick = () => {
      if (containerSize.width > 100 && containerSize.height > 100) {
        // Map Temperature to kinetic energy index factor:
        // Speed multiplier is proportional to heat!
        // Cold (-50): moves incredibly slowly (factor of ~0.2)
        // Hot (100): moves incredibly rapidly (factor of ~3.6)
        const speedFactor = Math.max(0.12, (temperature + 60) / 45);

        // A. Update Cute Mascot Physics
        let mx = mascotRef.current.x + mascotRef.current.vx * speedFactor;
        let my = mascotRef.current.y + mascotRef.current.vy * speedFactor;
        let mvx = mascotRef.current.vx;
        let mvy = mascotRef.current.vy;

        const mascotSize = 64; // w-16
        if (mx < 0) {
          mx = 0;
          mvx = Math.abs(mvx);
        } else if (mx > containerSize.width - mascotSize) {
          mx = containerSize.width - mascotSize;
          mvx = -Math.abs(mvx);
        }

        if (my < 0) {
          my = 0;
          mvy = Math.abs(mvy);
        } else if (my > containerSize.height - mascotSize) {
          my = containerSize.height - mascotSize;
          mvy = -Math.abs(mvy);
        }

        mascotRef.current = { x: mx, y: my, vx: mvx, vy: mvy };

        // B. Update gas molecules physics
        moleculesRef.current.forEach((mol) => {
          let px = mol.x + mol.vx * speedFactor;
          let py = mol.y + mol.vy * speedFactor;
          let pvx = mol.vx;
          let pvy = mol.vy;

          const molSize = 16; // diameter
          if (px < 0) {
            px = 0;
            pvx = Math.abs(pvx);
          } else if (px > containerSize.width - molSize) {
            px = containerSize.width - molSize;
            pvx = -Math.abs(pvx);
          }

          if (py < 0) {
            py = 0;
            pvy = Math.abs(pvy);
          } else if (py > containerSize.height - molSize) {
            py = containerSize.height - molSize;
            pvy = -Math.abs(pvy);
          }

          mol.x = px;
          mol.y = py;
          mol.vx = pvx;
          mol.vy = pvy;
        });

        setRenderTrigger(prev => prev + 1);
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [temperature, containerSize]);

  // Reset Thermostat buttons functions
  const handleResetTermostat = () => {
    setTemperature(25);
    setNumMolecules(12);
    if (containerSize.width > 0 && containerSize.height > 0) {
      mascotRef.current = {
        x: containerSize.width / 2 - 32,
        y: containerSize.height / 2 - 32,
        vx: 2.1,
        vy: 1.6
      };
    }
  };

  // Get Speech bubble text dynamically
  const getSpeechText = () => {
    if (temperature <= -20) {
      return "B-b-b-beku! Gerakanku jadi lambat banget... ❄️🥶";
    }
    if (temperature < 40) {
      return "Suhu yang pas! Aku suka menari santai di sini. ✨";
    }
    if (temperature < 80) {
      return "Mulai panas nih, atom-atom di sekitarku jadi lincah! 🌡️";
    }
    return "WAAAA! TERLALU PANAS! Aku nggak bisa berhenti lari! 🥵🔥";
  };

  const speechText = getSpeechText();

  // Shaking coordinate calculations for cold shivering
  let shiverX = 0;
  let shiverY = 0;
  if (temperature < 0) {
    // Amplitude increases based on cold extreme limit
    const amp = Math.abs(temperature) / 10;
    shiverX = (Math.random() - 0.5) * amp;
    shiverY = (Math.random() - 0.5) * amp;
  }

  // Linear color interpolation for container's backdrop-blur-sm ambient glows
  const getContainerBgColor = () => {
    if (temperature < 0) {
      // Ratio: 0 (-50 Cold) to 1 (0 Neutral)
      const ratio = (temperature + 50) / 50;
      const r = Math.round(219 + (255 - 219) * ratio); // blue-200 starts at 191
      const g = Math.round(234 + (255 - 234) * ratio);
      const b = Math.round(254 + (255 - 254) * ratio);
      return `rgba(${r}, ${g}, ${b}, 0.75)`;
    } else {
      // Ratio: 0 (0 Neutral) to 1 (100 Hot)
      const ratio = temperature / 100;
      const r = Math.round(255);
      const g = Math.round(255 - (255 - 224) * ratio); // red-100/200 shades
      const b = Math.round(255 - (255 - 224) * ratio);
      return `rgba(${r}, ${g}, ${b}, 0.75)`;
    }
  };

  const ambientBgColor = getContainerBgColor();

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Top Header Sections consistent layout style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#7C3AED] font-extrabold text-sm bg-white hover:bg-[#7C3AED]/5 border-2 border-[#7C3AED]/10 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-thermal-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Energi: Suhu & Kalor 🌡️
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Materi: Ruang Termodinamika & Teori Kinetik Gas Atom
          </p>
        </div>

        {/* Informative space context badges */}
        <div className="flex gap-2">
          <span className="bg-red-50 text-red-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-red-200">
            <Thermometer className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            TERMODINAMIKA I
          </span>
          <span className="bg-orange-100 text-orange-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            PARTICLES: {numMolecules + 1} ATOMS
          </span>
        </div>
      </div>

      {/* Split Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Side: 30% Width Controls Panel */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Termostat Energi
              </h2>
            </div>

            {/* Slider 1: Temperature Setup */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-orange-50/70 p-3.5 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase flex items-center gap-1">
                  🌡️ Suhu Kalor
                </span>
                <span className={`text-sm font-black px-3 py-1 rounded-full ${
                  temperature < 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600 animate-pulse'
                }`}>
                  {temperature}°C
                </span>
              </div>
              
              <input 
                type="range"
                min="-50"
                max="100"
                step="1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-[#F97316] outline-none"
                id="slider-termal-temp"
              />

              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span className="text-blue-500 font-extrabold flex items-center gap-0.5">
                  <Snowflake className="w-3 h-3" /> -50°C (Beku)
                </span>
                <span className="text-slate-400">25°C Room</span>
                <span className="text-red-500 font-extrabold flex items-center gap-0.5">
                  <Flame className="w-3 h-3" /> 100°C (Mendidih)
                </span>
              </div>
            </div>

            {/* Slider 2: Molecule counts */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/40">
                <span className="text-xs font-extrabold text-purple-700 tracking-wider uppercase">
                  ⚛️ Jumlah Molekul
                </span>
                <span className="text-sm font-black text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  {numMolecules} Atom
                </span>
              </div>

              <input 
                type="range"
                min="5"
                max="20"
                step="1"
                value={numMolecules}
                onChange={(e) => setNumMolecules(Number(e.target.value))}
                className="w-full h-3 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600 outline-none"
                id="slider-termal-atoms"
              />

              <div className="flex justify-between text-[11px] font-bold text-purple-400">
                <span>Minimal (5)</span>
                <span>Normal (12)</span>
                <span>Maksimal (20)</span>
              </div>
            </div>

            {/* Micro kinetic theory stat display */}
            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/40 space-y-2">
              <span className="text-[10px] font-black text-indigo-700 tracking-wider uppercase bg-indigo-100/70 py-1 px-2.5 rounded-full">
                📊 KINETIC TELEMETRY
              </span>
              <div className="grid grid-cols-2 gap-2 pt-2 text-center">
                <div className="bg-white rounded-xl p-2 shadow-sm border border-indigo-50">
                  <p className="text-[10px] text-slate-400 font-bold">Energi Rata-rata</p>
                  <p className="text-xs font-black text-indigo-800 mt-0.5">
                    {Math.max(1, Math.round((temperature + 55) * 4.2))} Joule
                  </p>
                </div>
                <div className="bg-white rounded-xl p-2 shadow-sm border border-indigo-50">
                  <p className="text-[10px] text-slate-400 font-bold">Laju Rata (v)</p>
                  <p className="text-xs font-black text-indigo-800 mt-0.5">
                    {Math.max(0.12, (temperature + 60) / 45).toFixed(2)} m/s
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Core trigger action */}
          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={handleResetTermostat}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-slate-200/50 shadow-sm"
              id="btn-thermal-reset"
            >
              <RotateCcw className="w-4 h-4" /> Reset Termostat 🔄
            </button>
          </div>

        </div>

        {/* Right Side: 70% Width Molecule Simulation Chamber Canvas */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            ref={containerRef}
            className="w-full h-[450px] md:h-[480px] bg-[#0c1221] rounded-[32px] border-[3px] border-[#1e294b] shadow-[0_16px_40px_rgba(0,0,0,0.15)] relative overflow-hidden select-none"
            id="thermal-canvas"
          >
            {/* Ambient vector stars/grid styling behind the test bubble */}
            <div 
              className="absolute inset-0 opacity-[0.06] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)', 
                backgroundSize: '20px 20px' 
              }} 
            />

            {/* Ambient background shift based on warmth states */}
            <div 
              className="absolute inset-4 rounded-[28px] border-2 border-white/5 shadow-inner transition-colors duration-150 relative"
              style={{ backgroundColor: ambientBgColor }}
              id="bouncing-atoms-membrane"
            >
              
              {/* Decorative thermometer tube gauge inside chamber background */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-xl bg-slate-900/90 text-orange-300 border border-slate-800 backdrop-blur-sm shadow">
                <div className={`w-2 h-2 rounded-full ${temperature > 40 ? 'bg-red-500 animate-ping' : 'bg-blue-400 animate-pulse'}`} />
                Status Ruang: {temperature <= -20 ? '🧊 PADAT' : temperature >= 80 ? '🔥 PLASMA / GAS' : '💧 CAIR'}
              </div>

              {/* Dynamic Speech bubble attached upright immediately above moving mascot cursor */}
              <div
                className="absolute z-30 pointer-events-none transition-all duration-75 select-none"
                style={{
                  left: `${mascotRef.current.x - 64}px`, // Centered beautifully on mascot (width 192px offsets to 64px left)
                  top: `${mascotRef.current.y - 68}px`,
                }}
              >
                <div className="bg-slate-900/95 border-2 border-orange-400 text-orange-200 text-[10px] md:text-xs font-black px-4 py-2 rounded-2xl shadow-2xl w-48 text-center backdrop-blur-sm leading-tight relative">
                  {speechText}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-r-2 border-b-2 border-orange-400 rotate-45 -mt-1.5 pointer-events-none" />
                </div>
              </div>

              {/* THE CUTE ORANGE CHARACTER FACE ATOM */}
              {/* STRICTLY LOCKED ASPECT RATIO AND GEOMETRY PERFECTION */}
              <div 
                className="absolute shrink-0 flex-shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-white/50 flex flex-col items-center justify-center select-none z-20"
                style={{
                  width: '64px',
                  height: '64px',
                  left: `${mascotRef.current.x + shiverX}px`,
                  top: `${mascotRef.current.y + shiverY}px`,
                  transition: 'background-color 0.2s ease',
                }}
                id="mascot-orange-atom"
              >
                {/* Icy blue overlay tint when temperature is freezing (< 0) */}
                {temperature < 0 && (
                  <div 
                    className="absolute inset-0 rounded-full bg-[#38BDF8]/25 border-2 border-[#0284C7]/40 pointer-events-none"
                    style={{
                      opacity: Math.min(1, Math.abs(temperature) / 50)
                    }}
                  />
                )}

                {/* Hot glowing thermal distortion visual (when boiling > 75) */}
                {temperature > 75 && (
                  <div className="absolute -inset-2 rounded-full border-2 border-red-500/40 animate-ping pointer-events-none" />
                )}

                {/* 3D premium clay specular shines */}
                <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg] pointer-events-none" />
                <div className="absolute top-[18%] left-[8%] w-[10%] h-[10%] bg-white rounded-full opacity-50 pointer-events-none" />

                {/* Faces: Shivering / Happy vs Panic */}
                {temperature > 70 ? (
                  // PANIC/HEAT STATE: Wide Shocked O_O eyes
                  <div className="flex justify-between gap-3.5 z-10 select-none animate-bounce">
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                      <div className="absolute top-0.5 right-0.5 w-[2.5px] h-[2.5px] bg-white rounded-full" />
                    </div>
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                      <div className="absolute top-0.5 right-0.5 w-[2.5px] h-[2.5px] bg-white rounded-full" />
                    </div>
                  </div>
                ) : (
                  // HAPPY / IDLE SHIVERING STATE: Caret eyes ^_^
                  <div className="flex justify-between gap-2.5 z-10 select-none">
                    <svg width="12" height="8" viewBox="0 0 10 8" className="w-3.5 h-2.5">
                      <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <svg width="12" height="8" viewBox="0 0 10 8" className="w-3.5 h-2.5">
                      <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* Mouth structures based on temperature states */}
                <div className="z-10 mt-1">
                  {temperature > 70 ? (
                    /* Surprised open mouth */
                    <div className="w-3 h-3 bg-slate-900 rounded-full border border-slate-950 shadow-inner" />
                  ) : temperature < 0 ? (
                    /* Shivering squiggly mouth */
                    <svg width="16" height="6" viewBox="0 0 16 6" className="w-4 h-1.5">
                      <path d="M 1 3 Q 4 1, 8 3 T 15 3" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    /* Happy smile or calm line */
                    <div className="w-3.5 h-[2px] bg-slate-900 rounded-full" />
                  )}
                </div>

                {/* Blushing cheeks */}
                <div className="absolute bottom-[20%] left-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75" />
                <div className="absolute bottom-[20%] right-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75" />

                {/* Tiny blue frozen melt drops when cold (< -20) */}
                {temperature <= -20 && (
                  <div className="absolute bottom-[8%] left-[25%] text-[10px] animate-bounce select-none">💧</div>
                )}
              </div>

              {/* MOLECULES ATOMS FLOATING & BOUNCING */}
              {moleculesRef.current.map((mol) => {
                // Determine if molecular velocity glows are active
                const isGlowing = temperature > 45;
                return (
                  <div
                    key={mol.id}
                    className="absolute rounded-full border border-white/50 transition-shadow duration-100"
                    style={{
                      width: '16px',
                      height: '16px',
                      left: `${mol.x}px`,
                      top: `${mol.y}px`,
                      backgroundColor: mol.color,
                      boxShadow: isGlowing 
                        ? `0 0 12px ${mol.color}, inset 0 2px 4px rgba(255,255,255,0.8)`
                        : 'inset 0 2px 4px rgba(255,255,255,0.7), 0 2px 6px rgba(0,0,0,0.12)'
                    }}
                  />
                );
              })}

            </div>

            {/* Bottom Horizon line HUD branding matching Relativity */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-orange-500 flex items-center justify-center opacity-90 z-[40]">
              <span className="text-orange-300 text-[10px] font-black tracking-widest uppercase">
                ATOR TERMODINAMIKA PENELITI CILIK PROF. JUMP 🧪
              </span>
            </div>

          </div>

          {/* Pedagogy Lab Instruction Card */}
          <div className="bg-amber-100/60 rounded-3xl p-5 border-2 border-amber-200/50 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-amber-800">Petunjuk Suhu & Kalor Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Ubah 'Atur Suhu (Temperatur)' ke -50°C untuk membekukan gas! Lihat si Oranye bergetar kedinginan dan molekul melambat. Saat kamu naikkan ke 100°C, mereka menjadi lincah dan berbenturan berkat energi kalor!"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
