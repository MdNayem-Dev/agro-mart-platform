"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function AdminThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50" />
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-2 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-300 transition-all duration-200 shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 group cursor-pointer"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon (Rotates & Scales into view in Dark Mode) */}
        <Sun
          className={`w-5 h-5 text-amber-400 absolute transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
        {/* Moon Icon (Rotates & Scales into view in Light Mode) */}
        <Moon
          className={`w-5 h-5 text-gray-600 dark:text-gray-300 absolute transition-all duration-300 ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 group-hover:text-indigo-600"
          }`}
        />
      </div>
    </button>
  );
}
