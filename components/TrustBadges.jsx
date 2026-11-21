"use client";

import { useEffect, useRef, useState } from 'react';
import { 
  Truck, 
  Wallet, 
  ShieldCheck, 
  Headphones, 
  BadgePercent, 
  Users, 
  PackageCheck, 
  Layers,
  Sparkles,
  Star,
  Award,
  Clock,
  HeartHandshake,
  PhoneCall,
  CheckCircle2,
  Zap,
  ThumbsUp
} from 'lucide-react';
import { DEFAULT_TRUST_SERVICES_DATA } from '@/lib/siteDefaults';

// Icons lookup map
const ICON_MAP = {
  Truck, 
  Wallet, 
  ShieldCheck, 
  Headphones, 
  BadgePercent, 
  Users, 
  PackageCheck, 
  Layers,
  Sparkles,
  Star,
  Award,
  Clock,
  HeartHandshake,
  PhoneCall,
  CheckCircle2,
  Zap,
  ThumbsUp
};

// Preset colors lookup map
const COLOR_STYLES = {
  amber: {
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200/60",
    accentDot: "bg-amber-500",
    borderHover: "hover:border-amber-500/50"
  },
  emerald: {
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200/60",
    accentDot: "bg-emerald-500",
    borderHover: "hover:border-emerald-500/50"
  },
  blue: {
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200/60",
    accentDot: "bg-blue-500",
    borderHover: "hover:border-blue-500/50"
  },
  purple: {
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200/60",
    accentDot: "bg-purple-500",
    borderHover: "hover:border-purple-500/50"
  },
  rose: {
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-200/60",
    accentDot: "bg-rose-500",
    borderHover: "hover:border-rose-500/50"
  },
  indigo: {
    badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-200/60",
    accentDot: "bg-indigo-500",
    borderHover: "hover:border-indigo-500/50"
  },
  cyan: {
    badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-200/60",
    accentDot: "bg-cyan-500",
    borderHover: "hover:border-cyan-500/50"
  }
};

function AnimatedNumber({ target = 0, suffix = "+", duration = 1200 }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          const startTime = performance.now();
          const startVal = 0;
          
          const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeOutExpo for ultra-smooth fast start then subtle decel
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = Math.round(startVal + (target - startVal) * ease);
            
            setCount(currentVal);
            
            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(target);
            }
          };
          
          requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.2 }
    );

    const currentElem = elementRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, [target, duration]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function TrustBadges({ initialData }) {
  const data = initialData || DEFAULT_TRUST_SERVICES_DATA;
  const sectionBadge = data.section?.badge || "আমাদের অঙ্গীকার ও সেবা";
  const stats = Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : DEFAULT_TRUST_SERVICES_DATA.stats;
  const features = Array.isArray(data.features) && data.features.length > 0 ? data.features : DEFAULT_TRUST_SERVICES_DATA.features;

  return (
    <div className="w-full flex flex-col py-3.5 sm:py-4.5 bg-gradient-to-b from-white via-gray-50/50 to-white border-t border-gray-100 overflow-hidden">
      
      {/* Top Stats Overview */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center max-w-2xl mx-auto w-full px-4 mb-3">
        {stats.map((stat, idx) => {
          const StatIcon = ICON_MAP[stat.icon] || (idx === 0 ? Users : idx === 1 ? PackageCheck : Layers);
          const duration = idx === 0 ? 1300 : idx === 1 ? 1100 : 800;
          return (
            <div 
              key={stat.id || idx}
              className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_14px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="bg-[#488e14] text-white p-1 sm:p-1.5 rounded-lg shadow-2xs">
                <StatIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
              <h2 className="text-sm md:text-lg font-black text-gray-900 mt-0.5">
                <AnimatedNumber target={Number(stat.target) || 0} suffix={stat.suffix || "+"} duration={duration} />
              </h2>
              <p className="text-gray-500 text-[9.5px] md:text-[10.5px] font-semibold">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Section Sub-heading */}
      <div className="text-center mb-2 px-4">
        <span className="text-[#488e14] font-bold text-[10.5px] sm:text-xs uppercase tracking-wider bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200 shadow-2xs">
          {sectionBadge}
        </span>
      </div>

      {/* Continuous Loop Carousel (Reversed to user preference) */}
      <div className="relative w-full overflow-hidden select-none">
        
        {/* Left & Right Smooth Edge Fade Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Carousel Scrolling Track */}
        <div className="flex w-max animate-scroll gap-3 sm:gap-4 pl-4 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
          
          {/* Multiply array for seamless infinite looping */}
          {[...features, ...features, ...features, ...features].map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || ShieldCheck;
            const colorConfig = COLOR_STYLES[item.color] || COLOR_STYLES.emerald;
            const subtitleText = item.subtitle || data.section?.guaranteeTag || "Smart Agro Guarantee";

            return (
              <div
                key={`${item.id || idx}-${idx}`}
                className={`w-[240px] sm:w-[275px] shrink-0 bg-white border border-gray-200/80 ${colorConfig.borderHover} rounded-xl p-3 sm:p-3.5 shadow-2xs hover:shadow-sm transition-all duration-300 flex flex-col group cursor-pointer`}
              >
                
                {/* Icon & Badge Header */}
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border ${colorConfig.badgeColor} group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                    <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-gray-900 text-xs sm:text-[13.5px] group-hover:text-[#488e14] transition-colors leading-snug">
                      {item.title}
                    </span>
                    <span className="flex items-center gap-1 text-[9.5px] text-gray-400 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${colorConfig.accentDot}`} />
                      <span>{subtitleText}</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] sm:text-xs text-gray-500 leading-snug font-normal line-clamp-2">
                  {item.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}
