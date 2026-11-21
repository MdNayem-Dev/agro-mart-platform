"use client";
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-sm font-bold transition-colors shadow-sm"
    >
      <Printer size={20} />
      ইনভয়েস ডাউনলোড / প্রিন্ট করুন
    </button>
  );
}
