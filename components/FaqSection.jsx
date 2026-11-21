"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  ChevronDown, 
  PhoneCall, 
  MessageCircle, 
  Truck, 
  Wrench, 
  ShieldCheck, 
  CreditCard,
  Sparkles
} from 'lucide-react';
import { DEFAULT_FAQ_DATA } from '@/lib/siteDefaults';

export default function FaqSection({ initialData = null }) {
  const header = initialData?.header || DEFAULT_FAQ_DATA.header;
  const cta = initialData?.cta || DEFAULT_FAQ_DATA.cta;
  const faqList = (Array.isArray(initialData?.faqs) && initialData.faqs.length > 0)
    ? initialData.faqs
    : DEFAULT_FAQ_DATA.faqs;

  const [activeCategory, setActiveCategory] = useState('all');
  const [openIds, setOpenIds] = useState(() => (faqList.length > 0 ? [faqList[0].id] : []));
  const [showAll, setShowAll] = useState(false);
  const INITIAL_LIMIT = 4;

  const toggleAccordion = (id) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const categories = [
    { key: 'all', label: 'সকল প্রশ্ন' },
    { key: 'order', label: 'অর্ডার ও ডেলিভারি', icon: Truck },
    { key: 'machinery', label: 'ডেইরি ও কৃষি যন্ত্রপাতি', icon: Wrench },
    { key: 'payment', label: 'পেমেন্ট ও ওয়ারেন্টি', icon: ShieldCheck },
    { key: 'service', label: 'সার্ভিস ও স্পেয়ার পার্টস', icon: Sparkles },
  ];

  const filteredFaqs = activeCategory === 'all'
    ? faqList
    : faqList.filter(faq => faq.category === activeCategory);

  const displayedFaqs = showAll ? filteredFaqs : filteredFaqs.slice(0, INITIAL_LIMIT);

  // Schema.org FAQPage JSON-LD for Search Engine SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="w-full bg-gradient-to-b from-white via-emerald-50/20 to-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-100 relative">
      {/* FAQ Schema Injection for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Animated Quick Assistance Helpline Banner (Positioned Professionally at Top of FAQ Section) */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-[#0d4f1c] via-[#145e26] to-[#0a4216] rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-emerald-400/30 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group">
          {/* Shimmer light sweep animation */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* Background Ambient Glows */}
          <div className="absolute -top-14 -right-14 w-48 h-48 bg-emerald-400/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-14 -left-14 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Left Text Content */}
          <div className="text-center sm:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>{cta.tag || 'কাস্টমার হেল্পলাইন'}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
              {cta.title || 'আপনার কি অন্য কোনো প্রশ্ন বা জানার আছে?'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-lg leading-relaxed">
              {cta.subtitle || 'আমাদের অভিজ্ঞ কৃষি ও ডেইরি এক্সপার্টদের সাথে এখনই কথা বলুন এবং সঠিক সমাধান পান।'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 relative z-10 shrink-0">
            <a
              href="tel:+8801601471471"
              className="inline-flex items-center gap-1.5 bg-white text-emerald-950 hover:bg-emerald-50 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 group/call"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#488e14] group-hover/call:animate-phone-ring" />
              <span className="hidden sm:inline">কল করুন (+880 1601-471471)</span>
              <span className="sm:hidden">কল: 01601-471471</span>
            </a>

            <a
              href="https://wa.me/8801601471471?text=হ্যালো,%20স্মার্ট%20এগ্রো%20সোর্স%20সম্পর্কে%20কিছু%20জানতে%20চাই"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 animate-whatsapp-glow"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>WhatsApp চ্যাট</span>
            </a>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-[11px] font-bold tracking-wide uppercase mb-2 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{header.badge || 'সাধারণ জিজ্ঞাসা • Frequently Asked Questions'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {header.title || 'আপনার মনে থাকা প্রয়োজনীয় প্রশ্নের উত্তর'}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {header.subtitle || 'স্মার্ট এগ্রো সোর্স থেকে কেনাকাটা, দেশব্যাপী হোম ডেলিভারি, আধুনিক কৃষি ও ডেইরি মেশিনের ব্যবহার এবং বিক্রয়োত্তর সেবা সম্পর্কে জেনে নিন।'}
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.key);
                    setShowAll(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#488e14] text-white shadow-md shadow-emerald-700/20 scale-[1.02]'
                      : 'bg-white hover:bg-emerald-50/60 text-gray-700 border border-gray-200/90 shadow-2xs'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion Questions List */}
        <div className="space-y-2 sm:space-y-2.5">
          {displayedFaqs.map((faq, index) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-emerald-400 shadow-md ring-1 ring-emerald-200/60'
                    : 'bg-white border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-emerald-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-[#488e14] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                      {faq.question}
                    </span>
                  </div>

                  <div className={`p-1 rounded-full shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-emerald-600 bg-emerald-50' : 'text-gray-400'
                  }`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4.5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 animate-in fade-in duration-200">
                    <div className="pl-10 sm:pl-11 pr-2 pt-3">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show More / Show Less Button */}
        {filteredFaqs.length > INITIAL_LIMIT && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowAll(prev => !prev)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-[#488e14] bg-white border border-[#488e14]/40 hover:bg-emerald-50 hover:border-[#488e14] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>
                {showAll 
                  ? 'কম প্রশ্ন দেখুন' 
                  : `আরও ${filteredFaqs.length - INITIAL_LIMIT}টি প্রশ্ন দেখুন (Show More)`
                }
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
