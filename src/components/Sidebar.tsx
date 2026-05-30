import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutGrid, 
  Rocket, 
  Atom, 
  Zap, 
  Sun, 
  Waves, 
  Sparkles, 
  HelpCircle
} from 'lucide-react';
import { ScreenType } from '../types';

interface SidebarProps {
  currentScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
  onOpenHelp: () => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function Sidebar({ 
  currentScreen, 
  onScreenChange, 
  onOpenHelp, 
  activeCategory, 
  onCategoryChange 
}: SidebarProps) {
  
  const categories = [
    { 
      id: 'all', 
      label: 'Semua', 
      icon: LayoutGrid, 
      color: '#F97316', 
      bgLight: 'bg-[#FFF3E0]', 
      textAccent: 'text-[#F97316]',
      borderAccent: 'border-orange-200',
    },
    { 
      id: 'mekanika-gerak', 
      label: 'Mekanika', 
      icon: Rocket, 
      color: '#F97316', 
      bgLight: 'bg-orange-50', 
      textAccent: 'text-orange-600',
      borderAccent: 'border-orange-200',
    },
    { 
      id: 'rahasia-antariksa', 
      label: 'Antariksa', 
      icon: Atom, 
      color: '#3B82F6', 
      bgLight: 'bg-blue-50', 
      textAccent: 'text-blue-600',
      borderAccent: 'border-blue-200',
    },
    { 
      id: 'energi-molekul', 
      label: 'Energi', 
      icon: Zap, 
      color: '#0D9488', 
      bgLight: 'bg-teal-50', 
      textAccent: 'text-teal-600',
      borderAccent: 'border-teal-200',
    },
    { 
      id: 'getaran-cahaya', 
      label: 'Cahaya', 
      icon: Sun, 
      color: '#D97706', 
      bgLight: 'bg-amber-50', 
      textAccent: 'text-amber-600',
      borderAccent: 'border-amber-200',
    },
    { 
      id: 'fluida-tekanan', 
      label: 'Fluida', 
      icon: Waves, 
      color: '#059669', 
      bgLight: 'bg-emerald-50', 
      textAccent: 'text-emerald-600',
      borderAccent: 'border-emerald-200',
    }
  ];

  return (
    <>
      {/* 1. FLOATING CAPSULE BOTTOM NAV FOR MOBILE (< 768px) */}
      <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden bg-white/70 backdrop-blur-lg border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.15)] rounded-full px-2 py-2 flex items-center justify-around select-none">
        {categories.map((cat) => {
          const isActive = currentScreen === 'adventure-hub' && activeCategory === cat.id;
          const Icon = cat.icon;
          
          return (
            <button
              key={cat.id}
              onClick={() => {
                onCategoryChange(cat.id);
                onScreenChange('adventure-hub');
              }}
              className="relative p-3 rounded-full flex items-center justify-center transition-all cursor-pointer focus:outline-none w-12 h-12"
              title={cat.label}
              id={`mobile-nav-cat-${cat.id}`}
            >
              {/* Sliding Background Fluid Bubble */}
              {isActive && (
                <motion.div
                  layoutId="activeBubbleMobile"
                  className="absolute inset-0 bg-[#F97316] rounded-full shadow-lg shadow-orange-500/20"
                  transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                />
              )}
              
              {/* Icon */}
              <span className={`relative z-10 transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800'
              }`}>
                <Icon className="w-5.5 h-5.5" />
              </span>
            </button>
          );
        })}

        {/* Floating Capsule Help button */}
        <button
          onClick={onOpenHelp}
          className="relative p-3 rounded-full flex items-center justify-center bg-orange-50/50 border border-orange-200/40 text-[#F97316] hover:bg-orange-100 transition-colors cursor-pointer focus:outline-none w-12 h-12"
          title="Bantuan & Petunjuk!"
          id="mobile-nav-help"
        >
          <HelpCircle className="w-5.5 h-5.5" />
        </button>
      </div>

      {/* 2. SPECIFIED VERTICAL DESKTOP FLOATING SIDEBAR (Visible ONLY on md:flex) */}
      <div className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 w-20 flex-col items-center justify-start bg-white/95 rounded-[2.5rem] py-6 border border-[#EBE9D8] shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md">
        
        {/* SciJump Labs Logo Brand Button */}
        <motion.button
          onClick={() => {
            onCategoryChange('all');
            onScreenChange('adventure-hub');
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-3 rounded-2xl transition-all duration-250 cursor-pointer focus:outline-none ${
            currentScreen === 'adventure-hub' && activeCategory === 'all'
              ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/20' 
              : 'hover:bg-[#FFF3E0] text-[#F97316]'
          }`}
          title="SciJump Hub"
          id="btn-scijump-logo"
        >
          <Sparkles className="w-6 h-6" />
        </motion.button>

        {/* Separator / Spacer in Desktop */}
        <div className="w-8 h-[2px] bg-[#EBE9D8] rounded-full my-4" />

        {/* Interactive Category Buttons Stack */}
        <div className="flex flex-col gap-4 w-full items-center">
          {categories.map((cat) => {
            const isActive = currentScreen === 'adventure-hub' && activeCategory === cat.id;
            const Icon = cat.icon;
            
            return (
              <div key={cat.id} className="relative flex items-center justify-center w-full group">
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicatorDesktop"
                    className="absolute -left-1 w-1.5 h-6 bg-[#F97316] rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                <motion.button
                  onClick={() => {
                    onCategoryChange(cat.id);
                    onScreenChange('adventure-hub');
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.93 }}
                  className={`p-3 rounded-2xl transition-all duration-200 cursor-pointer relative focus:outline-none ${
                    isActive 
                      ? `${cat.bgLight} ${cat.textAccent} shadow-sm` 
                      : 'text-slate-300 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                  title={cat.label}
                  id={`btn-nav-cat-${cat.id}`}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>

                {/* Modern Hover Tooltip label popup */}
                <div className="absolute left-20 hidden group-hover:flex items-center">
                  <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap z-[60]">
                    {cat.label}
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -ml-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Spacer to push greeting button down in desktop view */}
        <div className="flex-grow min-h-[40px]" />

        {/* Desktop Greeting Info HI speak bubble button */}
        <motion.button
          onClick={onOpenHelp}
          whileHover={{ scale: 1.10 }}
          whileTap={{ scale: 0.92 }}
          className="w-11 h-11 rounded-2xl border-2 border-[#F97316] bg-white text-[#F97316] font-bold text-xs uppercase tracking-tighter flex items-center justify-center hover:bg-[#FFF3E0] transition-colors cursor-pointer shadow-sm mt-3 focus:outline-none"
          title="Bantuan & Petunjuk!"
          id="btn-nav-hi"
        >
          HI
        </motion.button>
      </div>
    </>
  );
}
