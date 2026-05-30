import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles } from 'lucide-react';

interface WelcomePageProps {
  onStartExplore: () => void;
}

export default function WelcomePage({ onStartExplore }: WelcomePageProps) {
  const [isJumping, setIsJumping] = useState(false);

  // Generate 60 randomized star particles for the cosmic starfield
  const stars = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage left
      y: Math.random() * 100, // percentage top
      size: Math.random() * 3 + 1, // 1px to 4px
      duration: Math.random() * 3 + 1.5, // 1.5s to 4.5s
      delay: Math.random() * 2, // 0s to 2s delay
    }));
  }, []);

  // Split greeting words/letters for typewriter stagger effect
  const greetingText = "Halo Pahlawan Cilik! 🌟";
  const greetingLetters = Array.from(greetingText);

  // Framer Motion text typewriter variants
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 150,
      }
    }
  };

  const handleJump = () => {
    if (isJumping) return;
    setIsJumping(true);
  };

  return (
    <div className="relative w-screen h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden select-none font-sans">
      
      {/* 1. CSS/Framer Motion-driven Starfield background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white opacity-20"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [0.15, 0.9, 0.15],
              scale: [0.9, 1.25, 0.9],
            }}
            transition={{
              repeat: Infinity,
              duration: star.duration,
              delay: star.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
        {/* Soft glowing nebulae */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Header Badges: Locked at the very top */}
      <div className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 flex items-center justify-between border-b border-white/10 pb-3 md:pb-4 z-40">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            >
              <Compass className="w-5 h-5" />
            </motion.div>
          </span>
          <span className="font-mono text-[9px] min-[380px]:text-xs font-black tracking-widest text-slate-300 uppercase">
            SCIJUMP! LABS ★ PORTAL UTAMA
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
            Sistem Siap
          </span>
        </div>
      </div>

      {/* Main Vertically Stacked Content Wrapper: Perfectly centered, no overlapping */}
      <div className="flex flex-col items-center gap-5 md:gap-7 z-10 w-full max-w-xl text-center mt-12 md:mt-16 pb-16 md:pb-24">
        
        {/* 2. CUTE COSMIC PORTAL (Mascot and Swirling portal rings) */}
        <div className="relative w-48 h-48 min-[380px]:w-52 min-[380px]:h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-[320px] lg:h-[320px] flex items-center justify-center flex-shrink-0">
          
          {/* A. CUTE ORANGE MASCOT (Peeking from behind, waving) */}
          <motion.div
            className="absolute z-10"
            style={{
              top: '5px',
              left: '50%',
              x: '-45%',
              y: '-25%', // peeking outside the top boundary of the portal
            }}
            animate={{
              y: ['-25%', '-28%', '-25%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: 'easeInOut',
            }}
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center">
              
              {/* Starry highlight over mascot */}
              <div className="absolute top-[-8px] left-[-8px] md:top-[-10px] md:left-[-10px] text-amber-300">
                <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 animate-bounce" />
              </div>

              {/* Antenna with a glowing little star */}
              <div className="absolute -top-4 sm:-top-5 md:-top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <motion.div 
                  animate={{ rotate: [-8, 8, -8] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="w-0.5 md:w-1 h-5 md:h-6 bg-gradient-to-t from-orange-500 to-amber-300 origin-bottom flex flex-col items-center justify-start"
                >
                  <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-amber-300 rounded-full flex items-center justify-center -mt-1.5 md:-mt-2 shadow-[0_0_12px_rgba(252,211,77,0.8)]">
                    <span className="text-[6px] md:text-[8px] text-orange-600 font-bold">★</span>
                  </div>
                </motion.div>
              </div>

              {/* Mascot Body: Semi-circle/dome */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full border-2 md:border-[3px] border-amber-300/60 shadow-lg flex flex-col items-center justify-center px-1 md:px-2 relative overflow-hidden">
                {/* Shiny highlight reflection */}
                <div className="absolute top-0.5 left-2 w-10 h-3 sm:w-12 sm:h-4 bg-white/20 rounded-full rotate-[-15deg] blur-xs" />
                
                {/* Large cute eyes with stars inside */}
                <div className="flex gap-2.5 sm:gap-3 mt-1.5 sm:mt-2 relative z-10">
                  {/* Left Eye */}
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center relative shadow-inner">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-slate-900 rounded-full flex items-center justify-center relative">
                      <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 left-0.5" />
                      <span className="text-[5px] sm:text-[6px] text-amber-300 absolute bottom-0 right-0">★</span>
                    </div>
                  </div>
                  {/* Right Eye */}
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center relative shadow-inner">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-slate-900 rounded-full flex items-center justify-center relative">
                      <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 left-0.5" />
                      <span className="text-[5px] sm:text-[6px] text-amber-300 absolute bottom-0 right-0">★</span>
                    </div>
                  </div>
                </div>

                {/* Cute rosy cheeks */}
                <div className="absolute bottom-5 sm:bottom-6 w-2.5 h-2 bg-red-400 rounded-full opacity-60 blur-xs left-1.5" />
                <div className="absolute bottom-5 sm:bottom-6 w-2.5 h-2 bg-red-400 rounded-full opacity-60 blur-xs right-1.5" />

                {/* Happy smile */}
                <div className="w-4 h-1.5 sm:w-5 sm:h-2 border-b-2 sm:border-b-[3px] border-slate-900 rounded-b-full mt-1 mb-0.5 z-10" />
              </div>

              {/* Cute Waving Arm peeking from right side */}
              <motion.div
                className="absolute right-[-2px] bottom-3 sm:bottom-4 origin-bottom-left z-20"
                animate={{
                  rotate: [15, -25, 15],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: 'easeInOut',
                }}
              >
                {/* Waving hand graphic */}
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-400 rounded-full border border-amber-300/70 flex items-center justify-center font-extrabold shadow-md">
                  <span className="text-[10px] sm:text-xs select-none">👋</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* B. OUTER SPINNING CELESTIAL RINGS */}
          <motion.div
            className="absolute inset-0 rounded-full border border-dashed border-amber-300/35 p-1.5"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          />

          <motion.div
            className="absolute inset-[8px] rounded-full border-2 border-orange-500/30 p-1.5"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          />

          {/* C. COSMIC PORTAL CIRCLE (Scales with the parent) */}
          <motion.div
            className="absolute w-[86%] h-[86%] rounded-full flex items-center justify-center overflow-hidden z-20 shadow-[0_0_30px_rgba(251,146,60,0.55)] md:shadow-[0_0_50px_rgba(251,146,60,0.6)] border-[3px] border-orange-400 cursor-pointer"
            id="portal-center"
            onClick={handleJump}
            animate={
              isJumping
                ? {
                    scale: 60,
                    transition: { duration: 1.0, ease: [0.89, 0.03, 0.06, 0.99] },
                  }
                : {
                    scale: [0.97, 1.02, 0.97],
                    boxShadow: [
                      '0 0 25px rgba(251,146,60,0.4)',
                      '0 0 45px rgba(251,146,60,0.7)',
                      '0 0 25px rgba(251,146,60,0.4)'
                    ],
                  }
            }
            transition={
              isJumping
                ? {}
                : {
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  }
            }
            onAnimationComplete={(definition: any) => {
              if (isJumping) {
                onStartExplore();
              }
            }}
          >
            {/* Swirling energy inside the portal */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#311042] via-[#0f172a] to-[#251b4a]" />
            
            {/* Spinning galactic spiral overlay */}
            <motion.div
              className="absolute inset-[-40px] opacity-85"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(234,88,12,0.45) 0%, rgba(217,119,6,0.2) 50%, transparent 80%)',
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.15, 1],
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 10, ease: 'linear' },
                scale: { repeat: Infinity, duration: 4, ease: 'easeInOut' }
              }}
            />

            <motion.div
              className="absolute w-24 h-24 sm:w-36 sm:h-36 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(253,186,116,0.8) 0%, rgba(249,115,22,0.3) 60%, transparent 100%)',
                filter: 'blur(8px)',
              }}
              animate={{
                scale: [0.85, 1.2, 0.85],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: 'easeInOut',
              }}
            />

            {/* Portal Core Center Hole */}
            <div className="absolute w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-full mix-blend-overlay shadow-[0_0_20px_#ffffff] animate-ping" />
            <div className="absolute w-6 h-6 sm:w-8 sm:h-8 bg-[#FFedd5] rounded-full shadow-[0_0_12px_#ffdca4]" />
          </motion.div>
        </div>

        {/* 3. INTERACTIVE GREETING TEXT LAYER */}
        <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 text-center max-w-sm sm:max-w-md md:max-w-2xl px-6">
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-amber-300 tracking-tight font-comfortaa leading-snug md:leading-normal"
          >
            {greetingLetters.map((char, index) => (
              <motion.span key={index} variants={letterVariants}>
                {char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.8 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-300 font-medium leading-relaxed max-w-xs sm:max-w-sm md:max-w-xl mx-auto drop-shadow-md"
          >
            Kamu sudah siap menjelajahi rahasia semesta hari ini? Ayo lompat ke dalam portal dan mulai petualangannya!
          </motion.p>
        </div>

        {/* 4. THE "JUMP" INTERACTIVE BUTTON */}
        <div className="flex-shrink-0 mt-1 md:mt-2">
          <motion.button
            onClick={handleJump}
            whileHover={{ scale: 1.05, boxShadow: '0 6px 16px rgba(249,115,22,0.45)' }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 text-white font-black text-xs sm:text-sm px-6 py-3 md:px-7 md:py-3.5 rounded-full shadow-lg shadow-orange-500/35 transition-all flex items-center justify-center gap-2 active:outline-none cursor-pointer border border-amber-300/45 relative overflow-hidden group font-comfortaa"
            id="btn-portal-jump"
          >
            {/* Internal shine reflection on hover */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
            
            <span>Lompat ke Atlas!</span>
            <span className="text-base sm:text-lg">✨</span>
          </motion.button>
        </div>

      </div>

      {/* Footer Instructions: Locked at the very bottom */}
      <div className="absolute bottom-6 md:bottom-8 w-full z-30 flex justify-center pointer-events-none px-6">
        <p className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold select-none text-center max-w-sm drop-shadow-md">
          Tekan tombol atau klik lingkaran portal untuk melompat 🌌
        </p>
      </div>

    </div>
  );
}
