import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  Activity, 
  Eye, 
  Info,
  Layers,
  Flame,
  Lightbulb,
  Compass
} from 'lucide-react';

interface PrismSimulationProps {
  onBack: () => void;
}

export default function PrismSimulation({ onBack }: PrismSimulationProps) {
  // 1. Controls Panel State
  const [laserAngle, setLaserAngle] = useState<number>(0); // Range -30 to 30 degrees
  const [materialIndex, setMaterialIndex] = useState<number>(3); // 1 = Udara, 2 = Air, 3 = Kaca, 4 = Berlian
  const [isLaserOn, setIsLaserOn] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);

  // Web Audio Context References for Laser humming pitch synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Lazy Initializer for futuristic audio synthesizer hum
  const initSynth = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      // Lower pitch humming
      osc.frequency.setValueAtTime(100 + materialIndex * 35, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500 + Math.abs(laserAngle) * 15, ctx.currentTime);

      gain.gain.setValueAtTime(isAudioEnabled && isLaserOn ? 0.08 : 0, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      filterRef.current = filter;
      gainRef.current = gain;
    } catch (e) {
      console.warn("Web Audio failing to boot: ", e);
    }
  };

  // Synchronize synth audio parameters based on state settings
  useEffect(() => {
    if (audioCtxRef.current && oscRef.current && filterRef.current && gainRef.current) {
      const baseFreq = 90 + materialIndex * 35;
      const pitchWobble = 1 + (laserAngle / 120);
      oscRef.current.frequency.setTargetAtTime(baseFreq * pitchWobble, audioCtxRef.current.currentTime, 0.1);
      
      const filterCutoff = 450 + Math.abs(laserAngle) * 18 + (materialIndex * 80);
      filterRef.current.frequency.setTargetAtTime(filterCutoff, audioCtxRef.current.currentTime, 0.1);

      const targetGain = isAudioEnabled && isLaserOn ? 0.07 : 0;
      gainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.15);
    }
  }, [laserAngle, materialIndex, isLaserOn, isAudioEnabled]);

  // Cleanup synthesizer audio nodes
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch(e){}
        oscRef.current.disconnect();
      }
      if (filterRef.current) {
        filterRef.current.disconnect();
      }
      if (gainRef.current) {
        gainRef.current.disconnect();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const toggleSoundPlay = () => {
    if (!isAudioEnabled) {
      setIsAudioEnabled(true);
      if (!audioCtxRef.current) {
        initSynth();
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } else {
      setIsAudioEnabled(false);
    }
  };

  // Material constant list specs
  const materials = [
    { name: 'Udara', n: 1.00, color: 'text-slate-400', desc: 'Indeks bias n = 1.00 (Cahaya lurus tanpa hambatan)' },
    { name: 'Air', n: 1.33, color: 'text-teal-500', desc: 'Indeks bias n = 1.33 (Membias pelangi tipis / halus)' },
    { name: 'Kaca', n: 1.52, color: 'text-sky-500', desc: 'Indeks bias n = 1.52 (Sangat pas memisahkan dispersi warna)' },
    { name: 'Berlian', n: 2.42, color: 'text-purple-600', desc: 'Indeks bias n = 2.42 (Padat ekstrim, melengkungkan pelangi lebar!)' }
  ];

  const currentMaterial = materials[materialIndex - 1];
  const n = currentMaterial.n;

  // --- MATHEMATICAL REFRACTION ENGINE (SVG VIEWBOX 600 x 400) ---
  const theta = (laserAngle * Math.PI) / 180;
  
  // Laser emitter position
  const xOrigin = 60;
  const yOrigin = 200;

  // Tip of laser pointer gun (length 35px)
  const xTip = xOrigin + Math.cos(theta) * 35;
  const yTip = yOrigin + Math.sin(theta) * 35;

  // Triangle Prism coordinates
  const pA = { x: 300, y: 110 };  // Top Peak
  const pB = { x: 220, y: 260 };  // Bottom Left
  const pC = { x: 380, y: 260 };  // Bottom Right

  // Segment BA equation: 150*x + 80*y = 53800
  // Line parametric form: x(t) = xTip + t * cos(theta), y(t) = yTip + t * sin(theta)
  // Let solve: 150(xTip + t*cos) + 80(yTip + t*sin) = 53800 
  // t * (150*cos + 80*sin) = 53800 - 150*xTip - 80*yTip
  const denom1 = 150 * Math.cos(theta) + 80 * Math.sin(theta);
  let tInt = 0;
  if (Math.abs(denom1) > 0.0001) {
    tInt = (53800 - (150 * xTip + 80 * yTip)) / denom1;
  }
  // Intersection coordinates on Left edge (BA)
  const xInt = xTip + Math.cos(theta) * tInt;
  const yInt = yTip + Math.sin(theta) * tInt;

  // Refracted angle inside the prism:
  // Snellius angle adjustment
  const phi = theta / n;

  // Segment AC equation: 150*x - 80*y = 36200
  // Inside the prism, ray starts at (xInt, yInt) travels at angle phi.
  // Parametric: x(s) = xInt + s * cos(phi), y(s) = yInt + s * sin(phi)
  // Let solve: 150(xInt + s*cos) - 80(yInt + s*sin) = 36200
  // s * (150*cos - 80*sin) = 36200 - 150*xInt + 80*yInt
  const denom2 = 150 * Math.cos(phi) - 80 * Math.sin(phi);
  let sInt = 0;
  if (Math.abs(denom2) > 0.0001) {
    sInt = (36200 - (150 * xInt - 80 * yInt)) / denom2;
  }
  // Exit coordinates on Right edge (AC)
  const xExit = xInt + Math.cos(phi) * sInt;
  const yExit = yInt + Math.sin(phi) * sInt;

  // Define 6 Spectrum colors of rainbow
  const spectrum = [
    { name: 'Merah', color: '#FF3B30', labelColor: 'bg-red-500' },
    { name: 'Jingga', color: '#FF9500', labelColor: 'bg-orange-500' },
    { name: 'Kuning', color: '#FFCC00', labelColor: 'bg-yellow-400' },
    { name: 'Hijau', color: '#34C759', labelColor: 'bg-green-500' },
    { name: 'Biru', color: '#007AFF', labelColor: 'bg-blue-500' },
    { name: 'Ungu', color: '#AF52DE', labelColor: 'bg-purple-600' }
  ];

  // Refraction dispersion angles on exit
  // Red (idx 0) bends less, violet (idx 5) bends more.
  // Central exit point angle
  const baseExitDegrees = laserAngle * 0.75 + (n - 1) * 14;
  
  // Calculate specific spectral refracted beams
  const spectralBeams = spectrum.map((spec, idx) => {
    // Spread coefficient expands greatly with high refractive density indices (Diamond spreads best)
    const dispersionSpread = (idx - 2.5) * (n - 1) * 5.2;
    const colorDegrees = baseExitDegrees + dispersionSpread;
    const alpha = (colorDegrees * Math.PI) / 180;

    // Ending point aligned on right grid offset
    const xEnd = 580;
    const yEnd = yExit + Math.sin(alpha) * (xEnd - xExit);

    return {
      name: spec.name,
      color: spec.color,
      yEnd
    };
  });

  // Calculate dynamic vertical placement of Orange Mascot to catch the central rainbow path beautifully!
  let mascotTargetY = 200;
  if (isLaserOn) {
    if (n === 1.0) {
      mascotTargetY = yExit + Math.tan(theta) * (490 - xExit);
    } else {
      // Use center of green/yellow beam dispersion formula as tracking center
      const centerAlpha = (baseExitDegrees * Math.PI) / 180;
      mascotTargetY = yExit + Math.sin(centerAlpha) * (490 - xExit);
    }
  }
  // Constrain target visually so it stays in canvas vertical limit comfortably
  const finalMascotY = Math.max(130, Math.min(270, mascotTargetY));

  // Speech bubble wording matching user requirements
  const getMascotSpeech = () => {
    if (!isLaserOn) {
      return "Gelap nih, ayo pencet tombol Nyalakan Laser! 🔦✨";
    }
    if (materialIndex === 1) {
      return "Yah, cahayanya tembus lurus aja, nggak jadi pelangi... 😕🔍";
    }
    if (materialIndex === 2) {
      return "Wah, baru kelihatan pelangi tipis! Ayo ganti material yang lebih padat! 💧🌈";
    }
    if (materialIndex === 3) {
      return "Wahhh! Cahaya putihnya pecah jadi pelangi! Indah banget! 🌈💖";
    }
    if (materialIndex === 4) {
      return "Silauuu men! Pelanginya lebar banget karena berlian itu padat! 💎🤩🍿";
    }
    return "Eksperimen yang menyenangkan sekali!";
  };

  const handleReset = () => {
    setLaserAngle(0);
    setMaterialIndex(3);
    setIsLaserOn(true);
    setIsAudioEnabled(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#FFF9C4]/30 rounded-[40px] border border-orange-100/50 p-6 md:p-10 flex flex-col gap-6 selection:bg-orange-200">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#7C3AED] font-extrabold text-sm bg-white hover:bg-[#7C3AED]/5 border-2 border-[#7C3AED]/10 shadow-sm py-2 px-5 rounded-full transition-all cursor-pointer mb-3"
            id="btn-optics-back"
          >
            ← Kembali ke Atlas
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Cahaya: Prisma Pelangi 🌈
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Materi: Refraksi, Indeks Bias Material, & Pembiasan Hukum Snellius
          </p>
        </div>

        {/* Informative info badges */}
        <div className="flex gap-2">
          <span className="bg-sky-50 text-sky-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-sky-200">
            <Compass className="w-3.5 h-3.5 text-sky-500 animate-spin" />
            OPTIK REFRAKSI
          </span>
          <span className="bg-amber-100 text-amber-700 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            EKSPERIMEN CAHAYA
          </span>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch mt-3">
        
        {/* Left Side Controls Panel: 30% width */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between border-2 border-orange-100/40">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-orange-50">
              <span className="text-2xl">🎛️</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Konsol Pembiasan
              </h2>
            </div>

            {/* Futuristic Sound hum audio option */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 tracking-wider uppercase">
                  ⚡ Efek Dengung Laser (Audio)
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${isAudioEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                Suara synthesizer akan berubah nada berdasarkan indeks bias medium kristal prisma yang digunakan!
              </p>
              <button
                onClick={toggleSoundPlay}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2 ${
                  isAudioEnabled 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-white hover:bg-orange-50 text-orange-600 border border-orange-200'
                }`}
                id="btn-optics-speakers-active"
              >
                {isAudioEnabled ? '🔊 AUDIO LASER: AKTIF' : '🔊 AKTIFKAN AUDIO LASER'}
              </button>
            </div>

            {/* Slider 1: Laser Angle */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-orange-50/70 p-3.5 rounded-2xl border border-orange-100/50">
                <span className="text-xs font-extrabold text-slate-700 tracking-wider uppercase flex items-center gap-1">
                  🔦 Sudut Kepala Laser
                </span>
                <span className="text-xs font-black text-white bg-orange-500 px-3 py-1 rounded-full">
                  {laserAngle}° Derajat
                </span>
              </div>
              
              <input 
                type="range"
                min="-30"
                max="30"
                step="2"
                value={laserAngle}
                onChange={(e) => setLaserAngle(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-[#F97316] outline-none"
                id="slider-optics-angle"
              />

              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>◀️ Dongak Atas (-30°)</span>
                <span>Lurus (0°)</span>
                <span>Tunduk Bawah (+30°) ▶️</span>
              </div>
            </div>

            {/* Slider 2: Prisma Material Indices */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-violet-50 p-3.5 rounded-2xl border border-violet-100">
                <span className="text-xs font-extrabold text-violet-700 tracking-wider uppercase">
                  💎 Kepadatan Prisma (Material)
                </span>
                <span className="text-xs font-black text-violet-600 bg-violet-100 px-3 py-1 rounded-full uppercase">
                  Level {materialIndex}
                </span>
              </div>

              <input 
                type="range"
                min="1"
                max="4"
                step="1"
                value={materialIndex}
                onChange={(e) => setMaterialIndex(Number(e.target.value))}
                className="w-full h-3 bg-violet-100 rounded-lg appearance-none cursor-pointer accent-violet-600 outline-none"
                id="slider-optics-material"
              />

              <div className="flex justify-between text-[11px] font-extrabold">
                <span className={materialIndex === 1 ? "text-violet-600 animate-pulse" : "text-slate-400"}>1. Udara</span>
                <span className={materialIndex === 2 ? "text-teal-600 animate-pulse" : "text-slate-400"}>2. Air</span>
                <span className={materialIndex === 3 ? "text-sky-600 animate-pulse" : "text-slate-400"}>3. Kaca</span>
                <span className={materialIndex === 4 ? "text-red-500 animate-pulse" : "text-slate-400"}>4. Berlian</span>
              </div>
            </div>

            {/* Selected Material Info Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-slate-600 space-y-2">
              <span className="text-[9px] font-black tracking-widest text-[#7C3AED] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full inline-block">
                SPEK METODE PENARIKAN CAHAYA
              </span>
              <p className="text-xs font-bold text-slate-700">
                {currentMaterial.desc}
              </p>
              <div className="text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-200/50 flex justify-between">
                <span>Konstanta Snellius (n):</span>
                <span className="font-extrabold text-[#7C3AED]">{n.toFixed(2)}</span>
              </div>
            </div>

            {/* Laser Active toggle */}
            <div className="pt-2">
              <button
                onClick={() => setIsLaserOn(!isLaserOn)}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isLaserOn 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                    : 'bg-slate-800 hover:bg-slate-900 text-slate-200'
                }`}
                id="btn-optics-laser-toggle"
              >
                <div className={`w-3.5 h-3.5 rounded-full ${isLaserOn ? 'bg-white animate-ping' : 'bg-red-400'}`} />
                {isLaserOn ? 'MATIKAN LASER! 🔦' : 'NYALAKAN LASER! 🔦'}
              </button>
            </div>

          </div>

          {/* Reset Action */}
          <div className="mt-8 pt-4 border-t-2 border-orange-50">
            <button 
              onClick={handleReset}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-slate-200/50 shadow-sm"
              id="btn-optics-reset"
            >
              <RotateCcw className="w-4 h-4" /> Reset Simulasi
            </button>
          </div>

        </div>

        {/* Right Side Column: 70% width Optics Area */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div 
            className="w-full h-[450px] md:h-[480px] bg-slate-950 rounded-[32px] border-[3px] border-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.15)] relative overflow-hidden select-none"
            id="optics-canvas"
          >
            {/* Ambient molecular physics mesh coordinate background */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
                backgroundSize: '24px 24px' 
              }} 
            />

            {/* Grid metrics markings overlay */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-none z-30">
              <span className="text-[10px] text-amber-300 font-extrabold tracking-widest uppercase bg-indigo-950/60 px-3.5 py-2 rounded-full border border-orange-500/20 backdrop-blur-sm shadow-sm flex items-center gap-1">
                🔬 SNELLIUS REFRACTION CHAMBER
              </span>
              <span className="text-[10px] text-sky-400 font-black tracking-widest uppercase bg-indigo-950/60 px-3 py-1.5 rounded-full border border-sky-500/20 backdrop-blur-sm shadow-sm">
                MEDIUM EKSTERNAL: KACA PRISMA 🔮
              </span>
            </div>

            {/* RENDER DYNAMIC SVG GLOW LIGHT BEAMS */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {/* Neon Glow filters definition */}
              <defs>
                <filter id="beamGlow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <filter id="prismGlassGlow">
                  <feGaussianBlur stdDeviation="6" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* DRAW SPECTRUM LIGHTS WHEN LASER IS CONFIGURED TO ACTIVE */}
              {isLaserOn && (
                <>
                  {/* 1. Incoming Incident pure white beam line */}
                  <line 
                    x1={xTip} 
                    y1={yTip} 
                    x2={xInt} 
                    y2={yInt} 
                    stroke="#FFFFFF" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    filter="url(#beamGlow)"
                  />

                  {/* 2. Refracted Light path INSIDE the Prism (straight refraction ray segment) */}
                  {/* For Udara n = 1.0, light inside is pure white. Otherwise multiple paths blur beautifully internally */}
                  {n === 1.0 ? (
                    <line 
                      x1={xInt} 
                      y1={yInt} 
                      x2={xExit} 
                      y2={yExit} 
                      stroke="#FFFFFF" 
                      strokeWidth="3.5" 
                      opacity="0.9"
                    />
                  ) : (
                    // Draw multiple internal splitting colors slightly spreading for realistic transition
                    spectrum.map((spec, idx) => {
                      const internalShift = (idx - 2.5) * 1.5;
                      return (
                        <line 
                          key={`int-${idx}`}
                          x1={xInt} 
                          y1={yInt + internalShift} 
                          x2={xExit} 
                          y2={yExit + internalShift} 
                          stroke={spec.color} 
                          strokeWidth="1.8" 
                          opacity="0.75"
                        />
                      );
                    })
                  )}

                  {/* 3. Emerging Refracted beam light rays beyond exit boundary */}
                  {n === 1.0 ? (
                    // Udara: Pure straight passed white beam line
                    <line 
                      x1={xExit} 
                      y1={yExit} 
                      x2={580} 
                      y2={yExit + Math.tan(theta) * (580 - xExit)} 
                      stroke="#FFFFFF" 
                      strokeWidth="4" 
                      strokeLinecap="round"
                      filter="url(#beamGlow)"
                    />
                  ) : (
                    // Spectra: Multiple radiating color pathways!
                    spectralBeams.map((beam, idx) => (
                      <line 
                        key={`beam-${idx}`}
                        x1={xExit} 
                        y1={yExit} 
                        x2={580} 
                        y2={beam.yEnd} 
                        stroke={beam.color} 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        filter="url(#beamGlow)"
                        opacity="0.95"
                      />
                    ))
                  )}
                </>
              )}

              {/* Draw visual intersection indicator dots */}
              {isLaserOn && (
                <>
                  <circle cx={xInt} cy={yInt} r="4.5" fill="#EF4444" opacity="0.9" />
                  <circle cx={xExit} cy={yExit} r="4.5" fill="#EAB308" opacity="0.9" />
                </>
              )}
            </svg>

            {/* THE PRISM GLASS CRYSTAL (CENTER) */}
            <div className="absolute inset-0 pointer-events-none z-[15] flex items-center justify-center">
              <svg className="w-full h-full">
                {/* Visual Glass glowing crystal design triangle using linear gradient fill */}
                <polygon 
                  points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`}
                  fill="url(#crystalGrad)"
                  stroke="#93C5FD"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  opacity="0.82"
                  style={{ backdropFilter: 'blur(4px)' }}
                />

                {/* Sparkling crystal facets reflections cuts overlay */}
                <line x1={pA.x} y1={pA.y} x2={300} y2={260} stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" strokeDasharray="3 3" />
                <line x1={pB.x} y1={pB.y} x2={300} y2={210} stroke="#FFFFFF" strokeWidth="1.2" opacity="0.3" />
                <line x1={pC.x} y1={pC.y} x2={300} y2={210} stroke="#FFFFFF" strokeWidth="1.2" opacity="0.3" />

                <defs>
                  <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#BAE6FD" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.35" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Floating physical material index tag */}
              <div className="absolute top-[270px] bg-indigo-950 border border-slate-700/60 px-3.5 py-1.5 rounded-full text-[9px] font-black text-indigo-300 uppercase shadow">
                Prisma: {currentMaterial.name} ({n.toFixed(2)})
              </div>
            </div>


            {/* THE CUTE CLAY-STYLED LASER GUN EMITTER (LEFT SIDE) */}
            {/* Emitter resides at coordinate xOrigin, yOrigin. We rotate it around center (xOrigin, yOrigin) */}
            <motion.div
              animate={{
                rotate: laserAngle
              }}
              style={{
                transformOrigin: '20px 20px', // center pivot
                left: `${xOrigin - 20}px`,
                top: `${yOrigin - 20}px`
              }}
              className="absolute w-20 h-10 z-[25] cursor-pointer"
              id="laser-gun-emitter"
            >
              {/* Emitter metallic housing body */}
              <div className="w-[50px] h-[24px] bg-slate-800 rounded-lg border-2 border-slate-700 shadow-xl flex items-center justify-end p-1 relative">
                {/* Decorative glowing power line on gun */}
                <div className={`w-[26px] h-1.5 rounded-full mr-2 transition-colors ${isLaserOn ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                {/* Emitter tip gold nozzle */}
                <div className="w-[12px] h-[16px] bg-amber-500 rounded border border-amber-400 absolute right-[-8px] top-1 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                </div>
              </div>
              <div className="absolute top-[-14px] bg-gradient-to-r from-slate-900 to-indigo-900 text-slate-300 text-[8px] font-black py-0.5 px-2 rounded-full border border-slate-700 uppercase">
                LASER EMITTER
              </div>
            </motion.div>


            {/* THE CUTE LISTENER MASCOT (RIGHT SIDE OF CANVAS) */}
            {/* Relocates dynamically to catch the refracted spectrum rays on its face */}
            <motion.div
              animate={{
                left: 490,
                y: finalMascotY - 32 // offset centers
              }}
              transition={{
                type: 'spring',
                stiffness: 85,
                damping: 15
              }}
              className="absolute z-20"
              id="mascot-optics-listener"
            >
              {/* THE CUTE ORANGE SPHERICAL MASCOT */}
              {/* CRITICAL GEOMETRY LOCK: Aspect ratio and rounded-full circle */}
              <div 
                className="w-16 h-16 shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] border-2 border-white/50 flex flex-col items-center justify-center relative select-none"
                style={{ width: '64px', height: '64px' }}
              >
                {/* Headphone arch overlay on top of mascot for children friendliness */}
                <div className="absolute top-[-4px] left-[-4px] right-[-4px] h-[20px] border-t-4 border-slate-700 rounded-t-full pointer-events-none opacity-40 z-0" />

                {/* 3D clay specular gloss finishes */}
                <div className="absolute top-1.5 left-2 w-[25%] h-[12%] bg-white rounded-full opacity-60 rotate-[-15deg] pointer-events-none" />
                <div className="absolute top-[18%] left-[8%] w-[10%] h-[10%] bg-white rounded-full opacity-50 pointer-events-none" />

                {/* Facial expressions mapping depending on laser and material configurations */}
                {!isLaserOn ? (
                  // Sleepy / laser is OFF: Sleepy eyes - - and neutral mouth
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex justify-between gap-4 z-10 font-bold text-slate-900 text-sm mt-0.5 select-none">
                      <span>ー</span>
                      <span>ー</span>
                    </div>
                    <div className="w-2.5 h-[2px] bg-slate-900 rounded-full mt-1.5" />
                  </div>
                ) : materialIndex === 1 ? (
                  // Laser ON but Udara: confused O_O eyes
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex justify-between gap-3 z-10 mt-1 select-none">
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                        <div className="absolute top-0.5 right-0.5 w-[2px] h-[2px] bg-white rounded-full" />
                      </div>
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full flex items-center justify-center relative">
                        <div className="absolute top-0.5 right-0.5 w-[2px] h-[2px] bg-white rounded-full" />
                      </div>
                    </div>
                    {/* Small circle mouth */}
                    <div className="w-2 h-2 bg-slate-900 rounded-full mt-1 border border-slate-900 shadow-inner" />
                  </div>
                ) : (
                  // Air, Kaca, Berlian: Happy ^_^ bathed in beautiful colored rainbow
                  <div className="flex flex-col items-center justify-center animate-bounce">
                    <div className="flex justify-between gap-2.5 z-10 select-none">
                      <svg width="12" height="8" viewBox="0 0 10 8" className="w-3.5 h-2.5">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <svg width="12" height="8" viewBox="0 0 10 8" className="w-3.5 h-2.5">
                        <path d="M 1.5 6.5 L 5 1.5 L 8.5 6.5" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {/* Broad happy kid smile */}
                    <div className="w-3.5 h-1.5 bg-slate-950 rounded-b-full mt-0.5" />
                  </div>
                )}

                {/* Rosy blush cheeks layout */}
                <div className="absolute bottom-[20%] left-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75 animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-[16%] h-[8%] bg-rose-400 rounded-full opacity-75 animate-pulse" />
              </div>
            </motion.div>


            {/* THE SPEECH BUBBLE STATIONED COHESIVELY ABOVE THE FLOATING MASCOT */}
            {/* Follows finalMascotY vertical heights flawlessly */}
            <motion.div 
              animate={{
                left: 395, // elegant positioning overlap
                y: finalMascotY - 110
              }}
              transition={{
                type: 'spring',
                stiffness: 85,
                damping: 15
              }}
              className="absolute pointer-events-none select-none z-30"
            >
              <div className="bg-slate-900/95 border-2 border-orange-400 text-orange-200 text-[10px] md:text-xs font-black px-4 py-2.5 rounded-2xl shadow-2xl w-48 text-center backdrop-blur-sm leading-tight relative">
                {getMascotSpeech()}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-r-2 border-b-2 border-orange-400 rotate-45 -mt-1.2 pointer-events-none" />
              </div>
            </motion.div>


            {/* Bottom Horizon status line matching layout */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-orange-500 flex items-center justify-center opacity-90 z-[40]">
              <span className="text-orange-300 text-[10px] font-black tracking-widest uppercase">
                ATOR REFRAKSI PENELITI CILIK PROF. JUMP 🌈
              </span>
            </div>

          </div>

          {/* Pedagogy Instruction Panel */}
          <div className="bg-sky-50 text-sky-900 rounded-3xl p-5 border-2 border-sky-100 flex items-center gap-4">
            <span className="text-3xl animate-bounce">🤖</span>
            <div>
              <h4 className="text-sm font-black text-sky-800">Petunjuk Pembiasan Prof. Jump</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-semibold mt-0.5">
                "Cahaya putih terbuat dari gabungan semua warna pelangi! Saat memasuki kristal yang padat, setiap warna membelok dengan sudut berbeda karena memiliki panjang gelombang berbeda. Fenomena dispersi inilah yang menciptakan **Pelangi Indah**!"
              </p>
            </div>
          </div>

          {/* Color Spectrum Table Metrics */}
          {isLaserOn && n > 1.0 && (
            <div className="bg-white rounded-2xl p-4 border border-orange-100/40 grid grid-cols-2 md:grid-cols-6 gap-2">
              {spectrum.map((spec, index) => {
                const degrees = Math.round(baseExitDegrees + (index - 2.5) * (n - 1) * 5.2);
                return (
                  <div key={index} className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className={`w-3.5 h-3.5 rounded-full ${spec.labelColor} mb-1`} />
                    <span className="text-[10px] font-bold text-slate-700">{spec.name}</span>
                    <span className="text-[9px] font-black text-indigo-600 mt-0.5">({degrees}°)</span>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
