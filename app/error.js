"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, MessageCircle } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50/50">
      <div className="max-w-lg w-full bg-white border border-red-100 rounded-3xl p-8 sm:p-10 text-center shadow-sm relative overflow-hidden">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-amber-500"></div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5 text-red-600 shadow-xs">
          <AlertTriangle size={32} />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          সাময়িক সংযোগে সমস্যা হয়েছে
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          সার্ভারের সাথে সংযোগ করতে কিছুটা সময় লাগছে বা সাময়িক ত্রুটি দেখা দিয়েছে। পৃষ্ঠাটি রিফ্রেশ বা পুনরায় চেষ্টা করুন।
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#488e14] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>পুনরায় চেষ্টা করুন</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Home size={16} className="text-[#488e14]" />
            <span>হোমে ফিরুন</span>
          </Link>

          <a
            href="https://wa.me/8801601471471"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <MessageCircle size={16} className="text-[#25D366]" />
            <span>সহায়তা নিন</span>
          </a>
        </div>
      </div>
    </div>
  );
}
