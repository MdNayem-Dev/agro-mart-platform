"use client";

import { useState, useEffect } from 'react';

const PHRASES = [
  "Developing by Renovra IT",
  "Under Development by Renovra IT",
  "System Upgrade",
  "Coming Soon"
];

export default function TypewriterHeadline() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = PHRASES[phraseIndex];
    let timer;

    if (!isDeleting) {
      // Typing phase
      if (currentText.length < fullText.length) {
        timer = setTimeout(() => {
          setCurrentText(fullText.slice(0, currentText.length + 1));
        }, 90);
      } else {
        // Full text reached, pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 3200);
      }
    } else {
      // Deleting phase
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(fullText.slice(0, currentText.length - 1));
        }, 45);
      } else {
        // Fully deleted, move to next phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex]);

  // Dual-tone styling: Highlight "Renovra IT" in phrases containing "by ", and the second word in other phrases
  let prefix = currentText;
  let highlight = "";

  if (currentText.includes("by ")) {
    const splitIndex = currentText.lastIndexOf("by ");
    if (splitIndex !== -1 && currentText.length >= splitIndex + 3) {
      prefix = currentText.slice(0, splitIndex + 3);
      highlight = currentText.slice(splitIndex + 3);
    }
  } else {
    const splitIndex = currentText.indexOf(" ");
    if (splitIndex !== -1) {
      prefix = currentText.slice(0, splitIndex + 1);
      highlight = currentText.slice(splitIndex + 1);
    }
  }

  return (
    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-black tracking-tight mb-4 text-white leading-tight whitespace-nowrap min-h-[1.25em] flex items-center justify-center lg:justify-start">
      <span>{prefix}</span>
      {highlight && (
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 ml-1.5">
          {highlight}
        </span>
      )}
      {/* Blinking Glowing Cursor */}
      <span 
        className="inline-block w-[3px] sm:w-1 md:w-1.5 h-[0.85em] bg-emerald-400 ml-1.5 sm:ml-2 align-middle rounded-full animate-pulse shadow-[0_0_10px_#34d399]" 
        aria-hidden="true"
      />
    </h1>
  );
}
