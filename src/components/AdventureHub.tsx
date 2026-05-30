import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight,
  Compass
} from 'lucide-react';
import { ScreenType, CardItem } from '../types';

interface AdventureHubProps {
  onSelectScreen: (screen: ScreenType, preset?: string) => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

interface Category {
  id: string;
  title: string;
  topics: CardItem[];
}

export default function AdventureHub({ onSelectScreen, activeCategory, onSelectCategory }: AdventureHubProps) {
  const categories: Category[] = [
    {
      id: 'mekanika-gerak',
      title: '🚀 Mekanika & Gerak',
      topics: [
        {
          id: 'gaya-gerak',
          category: 'MEKANIKA',
          title: 'Gaya & Gerak',
          theoryName: 'Teori: Hukum Gerak Newton',
          description: 'Eksperimen gaya gravitasi, bounciness, dan hukum Newton!',
          iconType: 'emoji',
          emoji: '☄️',
          colorTheme: 'orange',
          screen: 'physics-sandbox',
          badge: 'POPULAR',
          preset: 'gaya-gerak'
        },
        {
          id: 'tuas-pengungkit',
          category: 'MEKANIKA',
          title: 'Tuas & Pengungkit',
          theoryName: 'Teori: Kesetimbangan Torsi',
          description: 'Angkat beban berat jadi super ringan dengan titik tumpu.',
          iconType: 'emoji',
          emoji: '⚖️',
          colorTheme: 'orange',
          screen: 'physics-sandbox',
          preset: 'tuas-pengungkit'
        },
        {
          id: 'katrol-tali',
          category: 'MEKANIKA',
          title: 'Katrol & Tali',
          theoryName: 'Teori: Pesawat Sederhana',
          description: 'Tarik benda ke atas gedung menggunakan kombinasi roda pintar.',
          iconType: 'emoji',
          emoji: '🪢',
          colorTheme: 'orange',
          screen: 'physics-sandbox',
          preset: 'katrol-tali'
        },
        {
          id: 'gaya-gesek',
          category: 'MEKANIKA',
          title: 'Gaya Gesek',
          theoryName: 'Teori: Gaya Friksi',
          description: 'Luncurkan balok di atas es dan karpet untuk melihat efek hambatan.',
          iconType: 'emoji',
          emoji: '🛷',
          colorTheme: 'orange',
          screen: 'physics-sandbox',
          preset: 'gaya-gesek'
        }
      ]
    },
    {
      id: 'rahasia-antariksa',
      title: '🌌 Rahasia Antariksa',
      topics: [
        {
          id: 'hukum-kepler',
          category: 'ASTRONOMI',
          title: 'Hukum Kepler',
          theoryName: 'Teori: Hukum Gerak Planet',
          description: 'Selidiki lintasan elips planet mengelilingi bintang induk.',
          iconType: 'emoji',
          emoji: '🪐',
          colorTheme: 'blue',
          screen: 'kepler-simulation',
          badge: 'NEW'
        },
        {
          id: 'astrofisika-bintang',
          category: 'ASTROFISIKA',
          title: 'Astrofisika Bintang',
          theoryName: 'Teori: Gravitasi Universal',
          description: 'Buka rahasia lubang hitam, supernova, dan gravitasi ekstrem.',
          iconType: 'emoji',
          emoji: '✨',
          colorTheme: 'purple',
          screen: 'astrophysics-simulation'
        },
        {
          id: 'relativitas-waktu',
          category: 'FISIKA TEORITIS',
          title: 'Relativitas Waktu',
          theoryName: 'Teori: Relativitas Khusus',
          description: 'Lihat bagaimana waktu melambat saat kamu naik roket super cepat!',
          iconType: 'emoji',
          emoji: '⏳',
          colorTheme: 'purple',
          screen: 'relativity-simulation'
        }
      ]
    },
    {
      id: 'energi-molekul',
      title: '⚡ Energi & Molekul',
      topics: [
        {
          id: 'suhu-kalor',
          category: 'TERMODINAMIKA',
          title: 'Suhu & Kalor',
          theoryName: 'Teori: Termodinamika Dasar',
          description: 'Amati atom bergerak liar saat dipanaskan atau membeku.',
          iconType: 'emoji',
          emoji: '🌡️',
          colorTheme: 'teal',
          screen: 'thermal-simulation'
        },
        {
          id: 'listrik-statis',
          category: 'ELEKTROSTATIK',
          title: 'Listrik Statis',
          theoryName: 'Teori: Hukum Coulomb',
          description: 'Gosok balon virtual dan kumpulkan elektron yang melompat!',
          iconType: 'emoji',
          emoji: '🎈',
          colorTheme: 'teal',
          screen: 'static-simulation'
        },
        {
          id: 'gelombang-suara',
          category: 'AKUSTIK',
          title: 'Gelombang Suara',
          theoryName: 'Teori: Akustik & Efek Doppler',
          description: 'Petik senar dan lihat bagaimana nada menciptakan gelombang di udara.',
          iconType: 'emoji',
          emoji: '🎸',
          colorTheme: 'teal',
          screen: 'sound-simulation'
        }
      ]
    },
    {
      id: 'getaran-cahaya',
      title: '🔮 Getaran & Cahaya',
      topics: [
        {
          id: 'prisma-pelangi',
          category: 'OPTIK',
          title: 'Prisma Pelangi',
          theoryName: 'Teori: Refraksi & Hukum Snellius',
          description: 'Tembakkan laser dan lihat kaca prisma memecah cahaya jadi pelangi!',
          iconType: 'emoji',
          emoji: '🌈',
          colorTheme: 'blue',
          screen: 'prism-simulation'
        },
        {
          id: 'cermin-ajaib',
          category: 'OPTIK',
          title: 'Cermin Ajaib',
          theoryName: 'Teori: Pemantulan Cahaya & Optik',
          description: 'Bereksperimen dengan cermin datar, cembung, dan cekung untuk melihat bayangan ajaib!',
          iconType: 'emoji',
          emoji: '🪞',
          colorTheme: 'blue',
          screen: 'mirror-simulation'
        }
      ]
    },
    {
      id: 'fluida-tekanan',
      title: '🌊 Fluida & Tekanan',
      topics: [
        {
          id: 'mengapung-tenggelam',
          category: 'FLUIDA',
          title: 'Mengapung & Tenggelam',
          theoryName: 'Teori: Hukum Archimedes',
          description: 'Bereksperimen dengan bermacam cairan dan benda untuk belajar hukum Archimedes!',
          iconType: 'emoji',
          emoji: '🌊',
          colorTheme: 'green',
          screen: 'archimedes-simulation'
        },
        {
          id: 'tekanan-udara',
          category: 'FLUIDA',
          title: 'Tekanan Udara',
          theoryName: 'Teori: Hukum Boyle',
          description: 'Ubah volume tabung piston untuk melihat pengaruh tekanan udara terhadap gas!',
          iconType: 'emoji',
          emoji: '💨',
          colorTheme: 'green',
          screen: 'boyle-simulation'
        }
      ]
    }
  ];

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'orange':
        return {
          bg: 'bg-orange-50 border-orange-100',
          iconBg: 'bg-orange-100/80 shadow-orange-100/50',
          badge: 'bg-orange-500 text-white',
          textAccent: 'text-[#F97316]',
          hoverBorder: 'hover:border-orange-400 hover:shadow-orange-100/40'
        };
      case 'blue':
        return {
          bg: 'bg-blue-50/50 border-blue-100',
          iconBg: 'bg-blue-100/85 shadow-blue-100/50',
          badge: 'bg-blue-600 text-white',
          textAccent: 'text-blue-600',
          hoverBorder: 'hover:border-blue-400 hover:shadow-blue-100/40'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50/40 border-purple-100',
          iconBg: 'bg-purple-100/80 shadow-purple-100/50',
          badge: 'bg-purple-600 text-white',
          textAccent: 'text-purple-600',
          hoverBorder: 'hover:border-purple-400 hover:shadow-purple-100/40'
        };
      case 'green':
        return {
          bg: 'bg-emerald-50/40 border-emerald-100',
          iconBg: 'bg-emerald-100/80 shadow-emerald-100/50',
          badge: 'bg-emerald-600 text-white',
          textAccent: 'text-emerald-700',
          hoverBorder: 'hover:border-emerald-400 hover:shadow-emerald-100/40'
        };
      default:
        return {
          bg: 'bg-teal-50/40 border-teal-100',
          iconBg: 'bg-teal-100/80 shadow-teal-100/50',
          badge: 'bg-teal-600 text-white',
          textAccent: 'text-teal-600',
          hoverBorder: 'hover:border-teal-400 hover:shadow-teal-100/40'
        };
    }
  };

  const renderTopicIcon = (id: string) => {
    switch (id) {
      case 'gaya-gerak':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-pink-400 to-red-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Claymorphic Rocket */}
            <g transform="translate(4, 4)">
              {/* Core flame trail */}
              <path d="M25 75 Q10 85 5 95 Q15 90 25 75 Z" fill="#FBBF24" opacity="0.9" filter="blur(1px)" />
              <path d="M23 77 Q14 84 10 90 Q18 87 23 77 Z" fill="#EF4444" />
              {/* Outer Shadow offset shape */}
              <path d="M35 65 C30 50 50 16 82 16 C82 48 50 68 35 65 Z" fill="rgba(0,0,0,0.12)" transform="translate(-1, 2)" />
              {/* Left Wing */}
              <path d="M30 65 C18 73 14 62 25 52 Z" fill="#E2E8F0" stroke="#FFFFFF" strokeWidth="2" />
              {/* Right Wing */}
              <path d="M30 65 C38 82 48 78 42 67 Z" fill="#E2E8F0" stroke="#FFFFFF" strokeWidth="2" />
              {/* Volumetric Rocket Body */}
              <path d="M35 65 C30 50 50 16 82 16 C82 48 50 68 35 65 Z" fill="#FFFFFF" />
              {/* Cute soft nose cone in coral pink */}
              <path d="M62 36 C68 24 76 18 82 16 C80 22 74 30 62 36 Z" fill="#FF5C8A" />
              {/* Glossy round window */}
              <circle cx="53" cy="47" r="8" fill="#22D3EE" stroke="#E2E8F0" strokeWidth="2.5" />
              <circle cx="51" cy="45" r="3" fill="#FFFFFF" opacity="0.8" />
              {/* Inner highlight arc */}
              <path d="M37 58 C34 48 48 24 72 20" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
            </g>
          </svg>
        );
      case 'tuas-pengungkit':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Lever Scale */}
            <g transform="translate(2, 2)">
              {/* Ground Anchor */}
              <rect x="18" y="78" width="60" height="6" rx="3" fill="#D97706" opacity="0.5" />
              {/* Pivot Triangle */}
              <polygon points="48,56 36,78 60,78" fill="#FFFBEB" stroke="#B45309" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="48" cy="71" r="3" fill="#B45309" />
              {/* Soft Lever Board */}
              <rect x="14" y="50" width="68" height="8" rx="4" fill="#FFFFFF" stroke="#D97706" strokeWidth="2" />
              <path d="M16 52 L80 52" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
              {/* Heavy weight box on left side */}
              <rect x="20" y="26" width="22" height="24" rx="6" fill="#FEE2E2" stroke="#FFFFFF" strokeWidth="3" />
              <rect x="25" y="31" width="12" height="12" rx="2" fill="#EF4444" opacity="0.8" />
              {/* Puffy ball weight on right side */}
              <circle cx="68" cy="38" r="12" fill="#DDB1FF" stroke="#FFFFFF" strokeWidth="3" />
              <circle cx="68" cy="38" r="7" fill="#8B5CF6" opacity="0.85" />
              <circle cx="65" cy="35" r="3" fill="#FFFFFF" opacity="0.8" />
            </g>
          </svg>
        );
      case 'katrol-tali':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Pulley Gear */}
            <g transform="translate(2, 2)">
              {/* Top Support */}
              <path d="M48 10 L48 30" stroke="#FEF3C7" strokeWidth="5" strokeLinecap="round" />
              {/* Thick Yellow Ropes */}
              <line x1="33" y1="36" x2="33" y2="82" stroke="#FFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
              <line x1="63" y1="36" x2="63" y2="65" stroke="#FFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
              {/* Puffy Pulley Wheel */}
              <circle cx="48" cy="36" r="18" fill="#FFFFFF" stroke="#D97706" strokeWidth="3" />
              <circle cx="48" cy="36" r="10" fill="#FEF3C7" />
              <circle cx="48" cy="36" r="5" fill="#B45309" />
              {/* Hanging Metal Weight on the right */}
              <rect x="52" y="62" width="22" height="18" rx="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="3" />
              <circle cx="58" cy="67" r="2" fill="#FFFFFF" opacity="0.7" />
            </g>
          </svg>
        );
      case 'gaya-gesek':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 via-orange-400 to-amber-600 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Friction slide */}
            <g transform="translate(2, 2)">
              {/* Bumpy Ground */}
              <path d="M10 76 L86 76" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
              <path d="M15 76 Q25 84 35 76 Q45 84 55 76 Q65 84 75 76" fill="none" stroke="#FFC09F" strokeWidth="3" strokeLinecap="round" />
              {/* Volumetric box sliding */}
              <rect x="28" y="34" width="36" height="34" rx="8" fill="#FFFFFF" stroke="#9A3412" strokeWidth="3" />
              {/* Wood Crate stripes for 3D look */}
              <line x1="36" y1="34" x2="36" y2="68" stroke="#FFE4D6" strokeWidth="3" />
              <line x1="56" y1="34" x2="56" y2="68" stroke="#FFE4D6" strokeWidth="3" />
              {/* 3D Highlight sheen */}
              <rect x="30" y="36" width="32" height="6" rx="3" fill="#FFEFE6" opacity="0.6" />
              {/* Dynamic friction sparks */}
              <circle cx="70" cy="58" r="4.5" fill="#FBBF24" />
              <circle cx="78" cy="64" r="3" fill="#EF4444" />
              <path d="M22 55 L12 55" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          </svg>
        );
      case 'hukum-kepler':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Solar Orbit */}
            <g transform="translate(2, 2)">
              {/* Elliptical Track orbit with glowing tube style */}
              <ellipse cx="48" cy="50" rx="38" ry="18" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" opacity="0.25" />
              <ellipse cx="48" cy="50" rx="38" ry="18" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="6 8" strokeLinecap="round" />
              {/* Glowing Sun core */}
              <circle cx="48" cy="50" r="16" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="3" />
              <circle cx="48" cy="50" r="10" fill="#FBBF24" />
              <circle cx="45" cy="47" r="4" fill="#FFFFFF" opacity="0.8" />
              {/* Super puffy orbiting planet with ring */}
              <g transform="translate(76, 42)">
                <ellipse cx="0" cy="0" rx="11" ry="3.5" fill="none" stroke="#67E8F9" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="7" fill="#67E8F9" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="-2" cy="-2" r="2.2" fill="#FFFFFF" opacity="0.9" />
              </g>
            </g>
          </svg>
        );
      case 'astrofisika-bintang':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Star Burst */}
            <g transform="translate(2, 2)">
              {/* Energy ring */}
              <circle cx="48" cy="48" r="32" fill="none" stroke="#D8B4FE" strokeWidth="3.5" strokeDasharray="8 6" opacity="0.5" />
              {/* Super tactile main volumetric star */}
              <path 
                d="M48 12 L58 36 L84 38 L65 55 L71 80 L48 67 L25 80 L31 55 L12 38 L38 36 Z" 
                fill="#FFFFFF" 
                stroke="#F3E8FF" 
                strokeWidth="4" 
                strokeLinejoin="round" 
              />
              {/* Puffy inner star shape */}
              <path 
                d="M48 20 L55 38 L74 39 L60 52 L64 71 L48 61 L32 71 L36 52 L22 39 L41 38 Z" 
                fill="#E9D5FF" 
                opacity="0.85" 
              />
              {/* Sparkles of light */}
              <circle cx="42" cy="40" r="5" fill="#FFFFFF" opacity="0.95" />
              <circle cx="78" cy="22" r="3" fill="#FFFBEB" />
              <circle cx="18" cy="70" r="2" fill="#FFFBEB" />
            </g>
          </svg>
        );
      case 'relativitas-waktu':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 via-fuchsia-600 to-indigo-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Hourglass */}
            <g transform="translate(2, 2)">
              {/* Chunky top/bottom plates */}
              <rect x="22" y="14" width="52" height="10" rx="5" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="2" />
              <rect x="22" y="74" width="52" height="10" rx="5" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="2" />
              {/* Glass capsule bulb */}
              <path 
                d="M28 24 C28 46 44 49 44 49 C44 49 28 52 28 74 L68 74 C68 52 52 49 52 49 C52 49 68 46 68 24 Z" 
                fill="none" 
                stroke="#FFFFFF" 
                strokeWidth="5" 
                strokeLinejoin="round" 
                opacity="0.9"
              />
              {/* Glowing pink sand upper heap */}
              <path d="M33 30 C38 45 58 45 63 30 Z" fill="#F472B6" />
              {/* Gravity Sand stream */}
              <line x1="48" y1="42" x2="48" y2="64" stroke="#F472B6" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="3 4" />
              {/* Golden sand bottom heap */}
              <path d="M32 70 C38 52 58 52 64 70 Z" fill="#FBBF24" />
              {/* Glass highlights */}
              <path d="M31 32 C31 43 40 46 40 46" fill="none" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            </g>
          </svg>
        );
      case 'suhu-kalor':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Thermometer */}
            <g transform="translate(2, 2)">
              {/* outer glass cylinder tube */}
              <rect x="42" y="14" width="14" height="48" rx="7" fill="#FFFFFF" stroke="#047857" strokeWidth="3" />
              {/* mercury fluid rounded bulb base */}
              <circle cx="49" cy="70" r="16" fill="#FFFFFF" stroke="#047857" strokeWidth="3" />
              {/* Rising hot fluid core */}
              <rect x="46" y="28" width="6" height="34" rx="3" fill="#EF4444" />
              <circle cx="49" cy="70" r="10" fill="#EF4444" />
              <circle cx="46" cy="67" r="3.5" fill="#FFFFFF" opacity="0.8" />
              {/* Air molecule spheres floating */}
              <circle cx="23" cy="28" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="21" cy="48" r="3.5" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="76" cy="32" r="5.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="77" cy="54" r="3.5" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>
          </svg>
        );
      case 'listrik-statis':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Static Balloon & Sparks */}
            <g transform="translate(1, 1)">
              {/* Balloon tie string */}
              <polygon points="49,69 43,77 55,77" fill="#FDBA74" stroke="#FFF" strokeWidth="1.5" />
              {/* Giant volumetric balloon body */}
              <ellipse cx="49" cy="42" rx="22" ry="26" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1" />
              <ellipse cx="49" cy="42" rx="20" ry="24" fill="#FF8A8A" />
              {/* Deep 3D glare reflection paths */}
              <path d="M38 28 Q46 22 55 26" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
              {/* Crackling neon lightning arcs */}
              <path d="M12 32 L22 43 L15 48 L27 60" fill="none" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M86 28 L74 38 L81 44 L70 56" fill="none" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        );
      case 'gelombang-suara':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Audio Frequency Wave */}
            <g transform="translate(2, 2)">
              {/* Rounded 3D sound waves pill shapes */}
              <rect x="23" y="44" width="11" height="38" rx="5.5" fill="#FFFFFF" stroke="#047857" strokeWidth="2.5" />
              <rect x="43" y="22" width="11" height="60" rx="5.5" fill="#FFFFFF" stroke="#047857" strokeWidth="2.5" />
              <rect x="63" y="34" width="11" height="48" rx="5.5" fill="#FFFFFF" stroke="#047857" strokeWidth="2.5" />
              {/* Sound expanding auras */}
              <path d="M26 14 Q48 4 70 14" fill="none" stroke="#D1FAE5" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
              <path d="M36 21 Q48 13 60 21" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        );
      case 'prisma-pelangi':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Prism Rainbow Refraction */}
            <g transform="translate(2, 2)">
              {/* Beautiful thick shiny crystal triangle */}
              <polygon points="48,18 16,74 80,74" fill="#F1F5F9" stroke="#FFFFFF" strokeWidth="5.5" strokeLinejoin="round" opacity="0.9" />
              <line x1="48" y1="18" x2="16" y2="74" stroke="#FFF" strokeWidth="3" opacity="0.9" />
              {/* Thick incident white light beam */}
              <line x1="4" y1="48" x2="36" y2="48" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              {/* Spectral refracted color pathways radiating from the right */}
              <path d="M58 46 L90 32" stroke="#FF4D4D" strokeWidth="4" strokeLinecap="round" />
              <path d="M59 52 L91 46" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
              <path d="M57 59 L91 62" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
              <path d="M54 66 L90 76" stroke="#A78BFA" strokeWidth="4" strokeLinecap="round" />
            </g>
          </svg>
        );
      case 'cermin-ajaib':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-300 via-indigo-400 to-sky-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Handheld Mirror */}
            <g transform="translate(2, 2)">
              {/* Soft thick loop mirror frame and handle */}
              <circle cx="48" cy="38" r="23" fill="#FFFFFF" stroke="#312E81" strokeWidth="4" />
              <rect x="43" y="58" width="10" height="26" rx="5" fill="#FFFFFF" stroke="#312E81" strokeWidth="4" />
              {/* Shiny soft cyan magic glass core */}
              <circle cx="48" cy="38" r="17" fill="#22D3EE" />
              {/* Glowing gleam highlights */}
              <path d="M38 32 L58 44" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
              <circle cx="40" cy="42" r="2.5" fill="#FFFFFF" />
              <circle cx="56" cy="34" r="3" fill="#FFFFFF" />
            </g>
          </svg>
        );
      case 'mengapung-tenggelam':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Anchor & Waves */}
            <g transform="translate(2, 2)">
              {/* Puffy submerged cartoon metal anchor */}
              <circle cx="48" cy="20" r="7" fill="none" stroke="#FFFFFF" strokeWidth="4.5" />
              <line x1="48" y1="27" x2="48" y2="62" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
              <line x1="34" y1="36" x2="62" y2="36" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
              <path d="M22 48 C27 75 69 75 74 48" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
              <polygon points="22,48 15,44 26,38" fill="#FFFFFF" />
              <polygon points="74,48 81,44 70,38" fill="#FFFFFF" />
              {/* 3D tactile cresting blue ocean wave curves */}
              <path d="M8 64 Q23 54 38 64 Q53 54 68 64 Q83 54 90 64" fill="none" stroke="#0284C7" strokeWidth="6.5" strokeLinecap="round" />
              <path d="M8 73 Q23 66 38 73 Q53 66 68 73 Q83 66 90 73" fill="none" stroke="#FFF" strokeWidth="4" strokeLinecap="round" opacity="0.65" />
            </g>
          </svg>
        );
      case 'tekanan-udara':
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-300 via-emerald-400 to-cyan-400 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            {/* 3D Pressure Cloud & Squall */}
            <g transform="translate(2, 2)">
              {/* Fluffy white clay cloud bubbles */}
              <circle cx="34" cy="56" r="13" fill="#FFFFFF" />
              <circle cx="50" cy="44" r="17" fill="#FFFFFF" />
              <circle cx="66" cy="56" r="13" fill="#FFFFFF" />
              <rect x="34" y="48" width="32" height="21" fill="#FFFFFF" />
              {/* Tactile neon wind drafts curving dynamically */}
              <path d="M10 26 Q28 16 46 26 Q55 31 50 36 Q42 33 46 26" fill="none" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M24 74 Q44 84 64 74 Q71 70 67 65 Q59 67 64 74" fill="none" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          </svg>
        );
      default:
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] drop-shadow-xl p-1.5 flex items-center justify-center text-white select-none"
          >
            <circle cx="50" cy="50" r="18" fill="#FFFFFF" stroke="#475569" strokeWidth="3.5" />
            <circle cx="50" cy="50" r="10" fill="#CBD5E1" />
          </svg>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const filteredCategories = activeCategory === 'all'
    ? categories
    : categories.filter(category => category.id === activeCategory);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12 md:pl-28 pb-32">
      {/* SciJump Labs Branding Header inside Hero */}
      <div className="flex flex-col mb-10 text-left">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-2"
        >
          <span className="text-3xl font-extrabold tracking-tight text-orange-600 select-none">
            SciJump! <span className="text-slate-800">Labs</span>
          </span>
          <span className="text-2xl">🧪</span>
        </motion.div>
        <p className="text-sm font-semibold tracking-wide text-slate-400 uppercase select-none">
          EXPERIMENT WITH THE UNIVERSE!
        </p>
      </div>

      {/* Golden Badge Sticker matching image 1 */}
      <motion.div 
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FEF08A]/80 border border-[#FDE047] text-[#854D0E] rounded-full text-xs font-black tracking-wider uppercase mb-6 shadow-sm shadow-yellow-200/50 w-fit select-none"
      >
        <Compass className="w-3.5 h-3.5 text-yellow-700 animate-spin-slow" />
        SCIJUMP! ADVENTURE ATLAS
      </motion.div>

      {/* Main Indonesian Question Banner Header */}
      <div className="space-y-4 mb-10 text-left">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-5xl font-black text-slate-800 leading-tight tracking-tight whitespace-pre-line select-none"
        >
          {"Halo Ilmuwan Cilik! 🚀\nMau belajar apa hari ini?"}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-base text-slate-500/90 font-semibold max-w-2xl leading-relaxed"
        >
          Pilih petualangan serumu di bawah ini dan jelajahi indahnya rahasia semesta yang menakjubkan!
        </motion.p>
      </div>

      {/* 🌟 Beautiful Horizontal Category Switcher Row (Mobile Responsive Swipe-bar) */}
      <div className="flex overflow-x-auto md:flex-wrap gap-2 pb-4 mb-10 text-left scrollbar-thin select-none scrollbar-none shrink-0 -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { id: 'all', label: '🌟 Semua' },
          { id: 'mekanika-gerak', label: '🚀 Mekanika' },
          { id: 'rahasia-antariksa', label: '🌌 Antariksa' },
          { id: 'energi-molekul', label: '⚡ Energi' },
          { id: 'getaran-cahaya', label: '🔮 Cahaya' },
          { id: 'fluida-tekanan', label: '🌊 Fluida' }
        ].map((catItem) => {
          const isActive = activeCategory === catItem.id;
          return (
            <motion.button
              key={catItem.id}
              onClick={() => onSelectCategory(catItem.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-200 cursor-pointer border shadow-sm flex items-center justify-center whitespace-nowrap ${
                isActive
                  ? 'bg-[#F97316] border-[#F97316] text-white shadow-orange-200/50'
                  : 'bg-white border-[#EBE9D8] text-slate-600 hover:border-slate-300'
              }`}
            >
              {catItem.label}
            </motion.button>
          );
        })}
      </div>

      {/* Categories stack */}
      <div className="space-y-16">
        {filteredCategories.map((category, catIdx) => (
          <motion.div 
            key={category.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: catIdx * 0.15 }}
            className="space-y-6"
          >
            {/* Category Header with beautiful underline and bottom accent line */}
            <div className="flex flex-col text-left">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight select-none">
                {category.title}
              </h2>
              <div className="h-1 w-20 bg-orange-500 rounded-full mt-2" />
            </div>

            {/* Responsive Grid of Cards under Category */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {category.topics.map((card) => {
                const style = getThemeClasses(card.colorTheme);
                const isPopularOrActive = card.id === 'gaya-gerak';
                
                return (
                  <motion.div
                    key={card.id}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -6, 
                      transition: { duration: 0.2 } 
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectScreen(card.screen, card.preset);
                    }}
                    className={`relative bg-white rounded-[2.5rem] p-6 cursor-pointer border-2 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col justify-between ${
                      isPopularOrActive 
                        ? 'border-orange-100 ring-4 ring-orange-50/30' 
                        : 'border-[#EBE9D8] hover:border-[#F97316]/40'
                    }`}
                    id={`card-topic-${card.id}`}
                  >
                    <div className="flex flex-col items-start gap-4 h-full">
                      {/* Floating tags */}
                      <div className="flex justify-between items-center w-full">
                        <span className={`text-[9px] font-black tracking-widest uppercase py-0.5 px-2.5 rounded-full bg-[#FFF3E0] text-[#F97316]`}>
                          {card.category}
                        </span>
                        
                        {card.badge && (
                          <span className={`text-[9px] font-extrabold tracking-wider py-0.5 px-2.5 rounded-full shadow-sm ${
                            card.badge === 'NEW'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-[#F97316] text-white'
                          }`}>
                            {card.badge}
                          </span>
                        )}
                      </div>

                      {/* Soft Rounded Icon Block with Beautiful Custom SVG Components */}
                      <div className={`p-4 rounded-3xl ${style.iconBg} flex items-center justify-center transition-transform shadow-sm`}>
                        {renderTopicIcon(card.id)}
                      </div>

                      {/* Typography metadata */}
                      <div className="space-y-2 mt-1 mb-6 flex-grow text-left">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug line-clamp-1 flex items-center gap-1.5">
                          {card.title}
                        </h3>
                        {card.theoryName && (
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 truncate leading-normal">
                            {card.theoryName}
                          </div>
                        )}
                        <p className="text-xs leading-relaxed text-slate-500 font-semibold h-[48px] overflow-hidden text-ellipsis line-clamp-2">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Interactive Section - All Unlocked Open Catalog */}
                    <div className="pt-4 border-t border-[#EBE9D8]/50 flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold text-[#F97316]">
                        Mulai Eksperimen →
                      </span>
                      
                      <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-orange-50 text-[#F97316] hover:bg-orange-100">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
