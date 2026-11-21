"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Hero({ homeBanner, homeBanners = [] }) {
  // Normalize banner list (filter empty strings)
  const bannerList = (
    Array.isArray(homeBanners) && homeBanners.length > 0
      ? homeBanners
      : homeBanner
      ? [homeBanner]
      : []
  ).filter(Boolean);

  const displayBanners =
    bannerList.length > 0
      ? bannerList
      : ["https://placehold.co/1200x350/e2e8f0/64748b?text=Promotional+Banner+(1200x350)"];

  const isMultiple = displayBanners.length > 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Auto-play carousel when there are multiple banners
  useEffect(() => {
    if (!isMultiple || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isMultiple, isHovered, displayBanners.length]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? displayBanners.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Swiped left -> next
      handleNext();
    } else if (diff < -45) {
      // Swiped right -> prev
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // 1. Single Banner Mode
  if (!isMultiple) {
    return (
      <div className="w-full animate-fade-in relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayBanners[0]}
          alt="Smart Agro Source Banner"
          className="w-full h-auto object-cover select-none"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    );
  }

  // 2. Carousel Mode (2 to 4 Banners)
  return (
    <div
      className="w-full animate-fade-in relative group overflow-hidden rounded-xl sm:rounded-2xl shadow-xs bg-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Track */}
      <div
        className="flex w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayBanners.map((src, idx) => (
          <div key={idx} className="w-full flex-shrink-0 relative select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Smart Agro Source Banner ${idx + 1}`}
              className="w-full h-auto object-cover select-none pointer-events-none"
              loading={idx === 0 ? "eager" : "lazy"}
              fetchPriority={idx === 0 ? "high" : "low"}
              decoding="async"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 bg-black/35 hover:bg-black/65 text-white backdrop-blur-xs p-1.5 sm:p-2 rounded-full transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 bg-black/35 hover:bg-black/65 text-white backdrop-blur-xs p-1.5 sm:p-2 rounded-full transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-full">
        {displayBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIndex === idx
                ? "w-5 sm:w-7 h-1.5 sm:h-2 bg-[#488e14] shadow-xs"
                : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
