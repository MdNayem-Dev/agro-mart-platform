"use client";

import Link from 'next/link';
import { 
  ArrowRight, 
  Package, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  PhoneCall, 
  Home, 
  ChevronRight 
} from 'lucide-react';
import FadeInScroll from '@/components/FadeInScroll';

export default function CategoriesClient({ categories = [] }) {
  return (
    <div className="w-full bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50 min-h-screen py-6 sm:py-10">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#488e14] flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>হোম</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-bold">সকল ক্যাটাগরি</span>
        </nav>

        {/* Page Title */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>সকল ক্যাটাগরি</span>
          </h1>
          <span className="text-xs sm:text-sm text-gray-500 font-semibold">
            মোট {categories.length}টি বিভাগ
          </span>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 shadow-xs">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">
              কোনো ক্যাটাগরি পাওয়া যায়নি
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              শীঘ্রই নতুন ক্যাটাগরি যোগ করা হবে।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
            {categories.map((category, idx) => {
              const countNumber = Number(category.count) || 0;
              return (
                <FadeInScroll delay={idx * 30} key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="group relative bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-[#488e14] p-3 sm:p-3.5 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(72,142,20,0.18)] hover:-translate-y-2 transition-all duration-300 ease-out overflow-hidden h-full cursor-pointer"
                  >
                    {/* Top Floating Count Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="bg-emerald-500/10 text-[#2d5c0c] border border-emerald-500/20 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full shadow-2xs backdrop-blur-xs flex items-center gap-1">
                        <span>{countNumber}টি</span>
                      </span>
                    </div>

                    {/* Image Area */}
                    <div className="w-full aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50/60 via-gray-50/80 to-white flex items-center justify-center p-3 overflow-hidden relative mb-2.5 border border-emerald-100/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out select-none mix-blend-multiply"
                        loading="lazy"
                      />
                    </div>

                    {/* Text & Button Area */}
                    <div className="flex flex-col flex-grow justify-between mt-1">
                      <h2 
                        className="font-extrabold text-xs sm:text-sm text-gray-900 group-hover:text-[#488e14] transition-colors text-center line-clamp-2 leading-snug mb-2.5 flex-grow"
                        title={category.name}
                      >
                        {category.name}
                      </h2>

                      {/* Explore CTA Button */}
                      <div className="w-full py-1.5 px-2 bg-gray-50 group-hover:bg-[#488e14] text-gray-700 group-hover:text-white rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs">
                        <span>পণ্য দেখুন</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </FadeInScroll>
              );
            })}
          </div>
        )}

        {/* Feature Highlights Banner */}
        <div className="mt-14 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#488e14] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">দেশব্যাপী ডেলিভারি</h4>
                <p className="text-[11px] text-gray-500">৬৪ জেলায় দ্রুততম সেবা</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#488e14] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">১০০% অরিজিনাল পার্টস</h4>
                <p className="text-[11px] text-gray-500">সেরা ব্র্যান্ডের নিশ্চয়তা</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#488e14] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">সার্ভিস ওয়ারেন্টি</h4>
                <p className="text-[11px] text-gray-500">নির্ভরযোগ্য টেকনিক্যাল সেবা</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#488e14] flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">২৪/৭ কাস্টমার সাপোর্ট</h4>
                <p className="text-[11px] text-gray-500">সরাসরি কল বা WhatsApp</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
