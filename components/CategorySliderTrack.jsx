"use client";

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategorySliderTrack({ categories = [] }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(7);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const n = categories.length;
  // Start from the middle set
  const [currentIndex, setCurrentIndex] = useState(n > 0 ? n : 0);

  // Measure container width and responsive visible count
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    setContainerWidth(width);

    let count = 7;
    if (width < 480) {
      count = 3;
    } else if (width < 640) {
      count = 4;
    } else if (width < 1024) {
      count = 5;
    } else {
      count = 7;
    }

    // STRICT RULE: visibleCount MUST BE strictly less than total unique categories
    // so the same category NEVER shows on both sides at the same time!
    if (n > 1) {
      count = Math.min(count, n - 1);
    }
    setVisibleCount(Math.max(1, count));
  }, [n]);

  useEffect(() => {
    setMounted(true);
    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);

  // Next Slide Action
  const handleNext = useCallback(() => {
    if (n <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [n, isTransitioning]);

  // Prev Slide Action
  const handlePrev = useCallback(() => {
    if (n <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [n, isTransitioning]);

  // Reset seamlessly after transition completes (Infinite Loop Magic)
  const handleTransitionEnd = () => {
    if (n <= 1) return;
    if (currentIndex >= 2 * n) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - n);
    } else if (currentIndex < n) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + n);
    } else {
      setIsTransitioning(false);
    }
  };

  // Autoplay functionality: smoothly slides every 3.8 seconds
  useEffect(() => {
    if (n <= 1 || isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 3800);

    return () => clearInterval(interval);
  }, [n, isPaused, handleNext]);

  // Touch Swipe Handling for Mobile & Tablets
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  // If only 1 category, show it statically
  if (categories.length === 1) {
    const cat = categories[0];
    return (
      <div className="flex justify-center py-2">
        <Link
          href={`/category/${cat.slug}`}
          className="flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div className="w-[110px] h-[110px] rounded-2xl bg-gray-50 dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cat.image || "https://placehold.co/150x150/f3f4f6/333333?text=Category"}
              alt={cat.name}
              className="w-full h-full object-contain"
              loading="eager"
              decoding="async"
            />
          </div>
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{cat.name}</span>
        </Link>
      </div>
    );
  }

  // Extended 3-set list for seamless infinite circular looping
  const extendedCategories = [...categories, ...categories, ...categories];

  // Calculate pixel-perfect item and step dimensions
  const gap = visibleCount <= 4 ? 12 : 16;
  const itemWidth = containerWidth > 0
    ? (containerWidth - (visibleCount - 1) * gap) / visibleCount
    : 110;
  const stepWidth = itemWidth + gap;

  return (
    <div
      className="relative w-full group/slider py-1 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Arrow - Left */}
      <button
        onClick={handlePrev}
        aria-label="Previous categories"
        className="absolute -left-2 sm:-left-3 top-[44%] -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-white/95 dark:bg-gray-800/95 hover:bg-[#488e14] text-gray-700 dark:text-gray-200 hover:text-white shadow-md rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 transition-all opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 text-current" />
      </button>

      {/* Navigation Arrow - Right */}
      <button
        onClick={handleNext}
        aria-label="Next categories"
        className="absolute -right-2 sm:-right-3 top-[44%] -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-white/95 dark:bg-gray-800/95 hover:bg-[#488e14] text-gray-700 dark:text-gray-200 hover:text-white shadow-md rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 transition-all opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 text-current" />
      </button>

      {/* Viewport: Strict overflow-hidden hides scrollbars & off-screen items completely */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full overflow-hidden px-1 py-1"
      >
        {/* Animated Sliding Track */}
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex items-start"
          style={{
            gap: `${gap}px`,
            transform: `translate3d(-${currentIndex * stepWidth}px, 0, 0)`,
            transition: isTransitioning
              ? 'transform 450ms cubic-bezier(0.25, 1, 0.5, 1)'
              : 'none',
            willChange: 'transform',
          }}
        >
          {extendedCategories.map((cat, index) => (
            <Link
              href={`/category/${cat.slug}`}
              key={`${cat.id}-${index}`}
              className="flex flex-col items-center gap-2 group cursor-pointer shrink-0 transition-transform duration-200 hover:-translate-y-1.5 focus:outline-none"
              style={{ width: `${itemWidth}px` }}
            >
              {/* Image Container */}
              <div
                className="w-full aspect-square rounded-2xl md:rounded-3xl bg-green-50/70 md:bg-gray-50 dark:bg-gray-800/80 overflow-hidden border border-green-200/90 md:border-gray-200/90 dark:border-gray-700 shadow-[0_3px_10px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_22px_rgba(72,142,20,0.22)] group-hover:border-[#488e14] transition-all flex items-center justify-center p-2.5 sm:p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image || "https://placehold.co/150x150/f3f4f6/333333?text=Category"}
                  alt={cat.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 mix-blend-multiply dark:mix-blend-normal pointer-events-none"
                  loading={index >= n && index < n + 8 ? "eager" : "lazy"}
                  fetchPriority={index >= n && index < n + 4 ? "high" : "auto"}
                  decoding="async"
                />
              </div>

              {/* Title */}
              <span className="text-[12.5px] sm:text-[13px] md:text-[13.5px] text-gray-800 dark:text-gray-200 text-center font-bold group-hover:text-[#488e14] transition-colors leading-snug line-clamp-2 px-1 min-h-[34px] flex items-center justify-center">
                {cat.name} {cat.count > 0 && <span className="hidden md:inline text-gray-400 font-normal ml-0.5">({cat.count})</span>}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
