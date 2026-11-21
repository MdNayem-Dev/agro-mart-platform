"use client";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, User, ShoppingCart, Volume2, Phone, AlignJustify, Loader2, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { doSearch } from '@/app/actions/search';

export default function Navbar({ siteAssets = {} }) {
  const { totalItems, totalPrice, setIsCartOpen, setIsMenuOpen, isLoaded } = useCart();
  const { siteLogo, title } = siteAssets;
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await doSearch(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <header className="w-full bg-white font-sans border-b border-gray-200 sticky top-0 z-40">
      
      {/* Top Bar - Hidden on mobile */}
      <div className="border-b border-gray-100 py-1 hidden md:block bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-gray-700 relative">
          <div className="flex-1"></div>
          
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <a href="tel:+8801601471471" className="flex items-center gap-1.5 font-bold hover:text-[#488e14] transition-colors">
              <Phone size={13} className="text-[#488e14]" />
              <span>হেল্পলাইন: +880 1601-471471</span>
            </a>
          </div>

          <div className="flex items-center gap-3 z-10">
            <span className="text-gray-500 font-medium text-[11px]">আমাদের ফলো করুন:</span>
            <div className="flex items-center gap-2.5">
              <a href="https://www.facebook.com/SmartAgroSource" target="_blank" rel="noopener noreferrer" title="Facebook" className="text-gray-500 hover:text-[#1877F2] transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.youtube.com/@SmartAgroSource" target="_blank" rel="noopener noreferrer" title="YouTube" className="text-gray-500 hover:text-[#FF0000] transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://www.instagram.com/smartagrosource/" target="_blank" rel="noopener noreferrer" title="Instagram" className="text-gray-500 hover:text-[#E4405F] transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@smartagrosource" target="_blank" rel="noopener noreferrer" title="TikTok" className="text-gray-500 hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a href="https://www.threads.net/@smartagrosource" target="_blank" rel="noopener noreferrer" title="Threads" className="text-gray-500 hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12.186 24h-.007c-3.585-.02-6.54-1.325-8.544-3.774-1.93-2.357-2.884-5.625-2.834-9.712.05-4.184 1.144-7.469 3.255-9.764C6.115 1.554 8.928.307 12.417.307c3.355 0 6.082 1.137 8.106 3.38 1.942 2.152 2.977 5.219 2.993 8.868v.548h-4.328v-.548c-.013-2.585-.688-4.664-1.954-6.012-1.31-1.393-3.092-2.127-5.297-2.127-2.38 0-4.23.829-5.498 2.464-1.368 1.764-2.072 4.354-2.103 7.697-.038 3.189.605 5.688 1.91 7.23 1.348 1.594 3.315 2.441 5.847 2.455 2.106.012 3.864-.537 5.226-1.632.744-.597 1.306-1.385 1.7-2.368-1.52.28-3.088.304-4.598.073-2.227-.34-3.955-1.34-4.866-2.815-.794-1.285-.98-2.83-.524-4.352.486-1.621 1.7-2.894 3.33-3.493 1.258-.462 2.687-.549 4.133-.251 1.255.258 2.378.828 3.248 1.649.333-.949.49-1.968.49-3.036 0-.256-.008-.51-.024-.763l-.004-.047h4.032l.003.055c.032.532.048 1.077.048 1.625 0 1.66-.356 3.226-1.028 4.673-.133.287-.282.564-.445.831.62 1.134.954 2.428.97 3.791.037 3.125-.853 5.76-2.574 7.618C18.667 22.793 15.82 24 12.186 24zm-.503-8.814c1.173 0 2.26-.206 3.155-.598-.291-.84-.793-1.545-1.468-2.062-.733-.563-1.666-.867-2.701-.88-.934-.012-1.748.257-2.292.759-.516.475-.769 1.135-.712 1.857.067.854.498 1.526 1.216 1.892.493.252 1.127.382 1.802.382z"/></svg>
              </a>
              <a href="https://x.com/SmartAgroSource" target="_blank" rel="noopener noreferrer" title="X (Twitter)" className="text-gray-500 hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 md:py-2 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2">
        
        {/* Mobile Header Top Row (Menu, Logo, Actions) */}
        <div className="flex items-center justify-between w-full md:w-auto md:gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="text-[#488e14] hover:bg-gray-100 p-1 rounded-md transition-colors"
          >
            <AlignJustify size={24} strokeWidth={2.2} />
          </button>
          
          <Link href="/" className="flex items-center gap-2 justify-center flex-1 md:flex-none">
            {siteLogo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={siteLogo} 
                alt={title || "Smart Agro Source"} 
                className="h-8 sm:h-9 md:h-11 md:max-h-12 w-auto object-contain"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div className="text-xl md:text-3xl font-extrabold text-green-700 tracking-tight flex items-center">
                <span className="text-green-600 mr-1 text-3xl md:text-4xl">S</span>
                <div className="flex flex-col leading-none">
                  <span className="text-lg md:text-2xl text-green-800">SMART</span>
                  <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-green-600">Agro Source</span>
                </div>
              </div>
            )}
          </Link>

          {/* Mobile Actions (User + Cart) */}
          <div className="flex items-center gap-3 md:hidden text-[#488e14]">
            <Link href="/my-account" className="hover:text-green-800 transition-colors">
              <User size={22} />
            </Link>
            <div 
              className="flex items-center gap-2 cursor-pointer relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={22} />
              {isLoaded && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Professional subtly rounded shape */}
        <div className="flex-1 w-full md:max-w-2xl mx-auto md:ml-6 md:mr-8 lg:mr-16 relative order-last md:order-none" ref={dropdownRef}>
          <div className="flex w-full items-center bg-gray-50/90 hover:bg-white focus-within:bg-white border border-gray-200 focus-within:border-[#488e14] rounded-xl shadow-xs hover:shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#488e14]/15 transition-all duration-200 p-1">
            <input 
              type="text" 
              placeholder="পণ্য বা ক্যাটাগরি খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              className="w-full px-3 py-1.5 text-sm bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <button 
              className="bg-[#488e14] hover:bg-[#3d7711] active:scale-95 text-white px-4 py-1.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              title="অনুসন্ধান করুন"
            >
              {isSearching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Search size={16} />
                  <span className="hidden sm:inline text-xs font-semibold">খুঁজুন</span>
                </>
              )}
            </button>
          </div>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 w-full bg-white mt-1 rounded-xl md:rounded-md shadow-xl border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
              {searchResults.length > 0 ? (
                <ul className="py-2">
                  {searchResults.map((product) => (
                    <li key={product.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0">
                      <Link 
                        href={`/product/${product.slug}`}
                        onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-4 py-2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-12 h-12 object-cover rounded-sm border border-gray-200"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{product.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.salePrice && product.salePrice < product.regularPrice ? (
                              <>
                                <span className="text-[#488e14] font-bold text-sm">৳{product.salePrice}</span>
                                <span className="text-xs text-gray-400 line-through">৳{product.regularPrice}</span>
                              </>
                            ) : (
                              <span className="text-[#488e14] font-bold text-sm">৳{product.regularPrice}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  কোনো পণ্য পাওয়া যায়নি
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 text-[#488e14]">
          <Link href="/my-account" className="hover:text-green-800 transition-colors p-1" title="আমার অ্যাকাউন্ট">
            <User size={24} />
          </Link>
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="relative">
              <ShoppingCart size={26} className="group-hover:text-green-800 transition-colors" />
              {isLoaded && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="font-bold text-gray-800 text-sm">
              ৳ {isLoaded ? totalPrice.toLocaleString() : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Hidden on mobile */}
      <div className="max-w-7xl mx-auto px-4 pb-1.5 hidden md:block">
        <ul className="flex md:justify-center overflow-x-auto whitespace-nowrap hide-scrollbar gap-1.5 py-0.5 px-1">
          {[
            { label: "সকল ক্যাটাগরি", href: "/categories" },
            { label: "শপ", href: "/categories" },
            { label: "অফার", href: "/page/offers" },
            { label: "অন্যান্য", href: "/page/others" },
            { label: "সমস্যার সমাধান", href: "/page/solutions" },
            { label: "ডেলিভারি পলিসি", href: "/page/delivery-policy" },
            { label: "শর্তাবলী", href: "/page/terms-and-conditions" }
          ].map((item, index) => (
            <li key={index} className="shrink-0">
              <Link 
                href={item.href} 
                className="px-3 py-1 border border-gray-200 rounded-md text-gray-700 text-xs hover:text-[#488e14] hover:border-[#488e14] transition-colors bg-white inline-block font-medium"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Ticker Bar - Visible on mobile & desktop */}
      <div className="border-t border-b border-green-600 flex items-center bg-white text-xs sm:text-sm">
        <div className="bg-[#488e14] text-white px-2.5 sm:px-4 py-1.5 flex items-center font-bold gap-1 shrink-0 text-xs sm:text-sm">
          <Volume2 size={14} className="sm:w-4 sm:h-4" />
          <span>হেডলাইন</span>
        </div>
        <div className="overflow-hidden flex-1 px-2 sm:px-4 text-gray-600 whitespace-nowrap text-xs sm:text-sm flex items-center">
            <marquee scrollamount="4" className="w-full flex items-center">
              <div className="inline-flex items-center justify-center align-middle pb-1 gap-3">
                <span className="font-medium">Welcome to Smart Agro Source</span>
                <span>&bull;</span>
                <span className="font-semibold text-gray-800"><Phone size={12} className="inline mr-1 text-[#488e14]"/> হেল্পলাইন / WhatsApp: +880 1601-471471, 01818 04 6666</span>
                <span>&bull;</span>
                <span>📍 ঠিকানা: পিটিআই মোড়, বগুড়া সদর , ৫৮০০ (বগুড়া সাতমাথা থেকে প্রায় ৪ মিনিট সময়দূরত্বে)</span>
              </div>
            </marquee>
        </div>
      </div>

    </header>
  );
}
