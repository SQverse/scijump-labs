import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, X, BookOpen, Smile, Info } from 'lucide-react';
import Sidebar from './components/Sidebar';
import AdventureHub from './components/AdventureHub';
import PhysicsSandbox from './components/PhysicsSandbox';
import KeplerSimulation from './components/KeplerSimulation';
import ThermalSimulation from './components/ThermalSimulation';
import StaticSimulation from './components/StaticSimulation';
import SoundSimulation from './components/SoundSimulation';
import PrismSimulation from './components/PrismSimulation';
import MirrorSimulation from './components/MirrorSimulation';
import ArchimedesSimulation from './components/ArchimedesSimulation';
import BoyleSimulation from './components/BoyleSimulation';
import AstrophysicsSimulation from './components/AstrophysicsSimulation';
import RelativitySimulation from './components/RelativitySimulation';
import WelcomePage from './components/WelcomePage';
import { ScreenType } from './types';

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('welcome');
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [funFactIndex, setFunFactIndex] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Indonesian educational fun facts list for kid scientists
  const funFacts = [
    "Tahukah kamu? Di gravitasi Nol (Luar Angkasa), jika kamu memeras handuk basah, airnya tidak jatuh tapi akan membungkus tanganmu seperti jeli! 💦",
    "Bumi memiliki gaya tarik (gravitasi) sebesar 9.8 m/s², sedangkan Bulan hanya memiliki 1.6 m/s². Kamu akan 6x lebih ringan di Bulan! 🌑",
    "Planet kita bumi bergerak mengelilingi matahari dengan kecepatan luar biasa: sekitar 107.000 kilometer per jam! 🌍💨",
    "Suhu nol mutlak (0 Kelvin) adalah kondisi di mana semua partikel gas diam sepenuhnya tanpa ada getaran sedikitpun! ❄️",
    "Albert Einstein menyatakan bahwa gravitasi bukanlah gaya misterius biasa, melainkan kelengkungan ruang dan waktu oleh benda masif! 🌌",
    "Cermin cembung selalu menghasilkan bayangan tegak dan diperkecil, makanya dipakai di spion mobil agar bisa melihat area jalanan lebih luas! 🚗",
    "Cermin cekung bisa mengumpulkan sinar panas matahari di satu titik api lho! Prinsip ini dipakai untuk kompor tenaga surya raksasa! ☀️",
    "Hukum Archimedes ditemukan ketika ilmuwan Yunani kuno Archimedes sedang mandi dan menyadari air tumpah sebanding volume tubuhnya, dia langsung berteriak 'EUREKA!'! 🛀🏼",
    "Kapal baja raksasa bermuatan ribuan ton bisa mengapung karena rancangan lambung kapal berongga udara besar membuat massa jenis totalnya lebih kecil dari air laut! 🚢"
  ];

  const handleNextFact = () => {
    setFunFactIndex((prev) => (prev + 1) % funFacts.length);
  };

  if (screen === 'welcome') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="welcome-page-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <WelcomePage onStartExplore={() => setScreen('adventure-hub')} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F0] text-slate-800 font-sans selection:bg-orange-200 select-none pb-32 md:pb-6 relative">
      {/* Background Graphic Blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-sky-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      
      {/* Upper subtle bar mimicking sci-bar in Image 1 */}
      <div className="w-full bg-white/45 border-b border-[#F1EFCF]/40 backdrop-blur-sm py-2 px-6 flex items-center justify-between">
        <span className="text-xs font-mono font-bold tracking-widest text-[#F97316]">
          SCIPLAY LEARNING LABS ★ v1.0
        </span>
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors flex items-center gap-1.5 cursor-pointer"
          id="btn-header-bantuan"
        >
          <Info className="w-3.5 h-3.5 text-[#0EA5E9]" />
          Petunjuk Laboratorium
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-4 pt-4 md:pt-8 md:p-8 lg:p-10">
        
        {/* Main Routed Components with slide fade transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {screen === 'adventure-hub' && (
              <AdventureHub 
                onSelectScreen={(next, preset) => {
                  setScreen(next);
                  setSelectedPreset(preset);
                }} 
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            )}

            {screen === 'physics-sandbox' && (
              <PhysicsSandbox 
                onBack={() => {
                  setScreen('adventure-hub');
                  setSelectedPreset(undefined);
                }} 
                initialPreset={selectedPreset}
              />
            )}

            {screen === 'kepler-simulation' && (
              <KeplerSimulation onBack={() => setScreen('adventure-hub')} />
            )}

            {screen === 'astrophysics-simulation' && (
              <AstrophysicsSimulation onBack={() => setScreen('adventure-hub')} />
            )}

            {screen === 'thermal-simulation' && (
              <ThermalSimulation onBack={() => setScreen('adventure-hub')} />
            )}

            {screen === 'static-simulation' && (
              <StaticSimulation onBack={() => setScreen('adventure-hub')} />
            )}

            {screen === 'sound-simulation' && (
              <SoundSimulation onBack={() => setScreen('adventure-hub')} />
            )}

            {screen === 'prism-simulation' && (
              <PrismSimulation onBack={() => setScreen('adventure-hub')} />
            )}

            {screen === 'mirror-simulation' && (
              <MirrorSimulation onBack={() => setScreen('adventure-hub')} />
            )}

            {screen === 'archimedes-simulation' && (
              <ArchimedesSimulation onBack={() => setScreen('adventure-hub')} />
            )}

            {screen === 'boyle-simulation' && (
              <BoyleSimulation onBack={() => setScreen('adventure-hub')} />
            )}

            {screen === 'relativity-simulation' && (
              <RelativitySimulation onBack={() => setScreen('adventure-hub')} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Floating Sidebar attached to Left workspace */}
        <Sidebar 
          currentScreen={screen} 
          onScreenChange={(next) => setScreen(next)} 
          onOpenHelp={() => setIsHelpOpen(true)}
          activeCategory={activeCategory}
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            setScreen('adventure-hub');
          }}
        />
      </div>

      {/* Guide Help Modal Dialog - Greeting "HI" Trigger */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-[40px] border-4 border-[#F1EFCF] p-8 max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.15)] relative flex flex-col gap-5 text-left"
              id="help-modal"
            >
              {/* Hotpink/orange round close button */}
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 cursor-pointer"
                id="btn-modal-close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-1">
                <span className="text-3xl">🧑‍🔬</span>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Prof. Jump!</h3>
                  <p className="text-xs text-orange-500 font-extrabold tracking-uppercase">SCIJUMP LABS HOST</p>
                </div>
              </div>

              {/* Chat speech balloon */}
              <div className="bg-orange-100/40 rounded-3xl p-5 border border-orange-100 relative">
                <div className="absolute top-[-8px] left-6 w-4 h-4 bg-orange-50/50 border-l border-t border-orange-100 rotate-45" />
                <p className="text-sm font-semibold leading-relaxed text-slate-700">
                  "Halo Ilmuwan Cilik! Selamat datang di laboratorium eksperimen rahasia semesta. Di sini kamu bisa bebas memodifikasi hukum fisika alam semesta sesukamu!"
                </p>
              </div>

              {/* Interesting Science Fact Zone */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-[#0EA5E9] font-black flex items-center gap-1">
                  <Smile className="w-4 h-4 text-amber-500" /> APAKAH KAMU TAHU?
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[96px] flex items-center justify-center">
                  <p className="text-xs leading-relaxed text-slate-600 font-semibold text-center italic">
                    {funFacts[funFactIndex]}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleNextFact}
                    className="text-xs font-black text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
                    id="btn-next-fact"
                  >
                    Fakta Selanjutnya ▷
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="bg-slate-800 text-white font-black text-xs py-3.5 px-6 rounded-2xl shadow-md cursor-pointer hover:bg-slate-900 transition-colors"
                  id="btn-modal-confirm"
                >
                  Siap, Ayo Bereksperimen! ★
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
