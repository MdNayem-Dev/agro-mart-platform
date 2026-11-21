"use client";
import { X, Home, Leaf, Glasses, Folder, Bookmark, Database, Tag, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function MenuDrawer({ categories = [], siteLogo = null }) {
  const { isMenuOpen, setIsMenuOpen, isLoaded } = useCart();
  const logoUrl = siteLogo || "https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png";

  if (!isLoaded) return null;

  return (
    <>
      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-[300px] bg-white z-50 shadow-2xl transform origin-left flex flex-col overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isMenuOpen ? 'scale-100 opacity-100 translate-x-0' : 'scale-75 opacity-0 -translate-x-10 pointer-events-none'
        }`}
      >
        {/* Header Block (Green) */}
        <div className="bg-[#488e14] w-full py-5 px-4 flex justify-center items-center border-b-[6px] border-[#387010]">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-xl shadow-md flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={logoUrl} 
                alt="Smart Agro Source Logo" 
                className="h-11 w-auto max-w-[200px] object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Close Button below Header */}
        <div className="flex justify-center -mt-3 mb-4">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="bg-[#488e14] hover:bg-[#387010] text-white p-1 rounded-sm shadow-md transition-colors border-2 border-white relative z-10"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Main Links */}
        <div className="flex flex-col px-4 text-gray-800 font-bold text-[15px] gap-4 mb-4">
          <Link href="/" className="flex items-center gap-3 hover:text-[#488e14] transition-colors" onClick={() => setIsMenuOpen(false)}>
            <Home size={20} />
            হোম
          </Link>
          <Link href="/page/new-products" className="flex items-center gap-3 hover:text-[#488e14] transition-colors" onClick={() => setIsMenuOpen(false)}>
            <Leaf size={20} />
            নতুন পণ্য
          </Link>
          <Link href="/page/offers" className="flex items-center gap-3 hover:text-[#488e14] transition-colors" onClick={() => setIsMenuOpen(false)}>
            <Glasses size={20} />
            অফার
          </Link>
          <Link href="/categories" className="flex items-center gap-3 hover:text-[#488e14] transition-colors" onClick={() => setIsMenuOpen(false)}>
            <Folder size={20} />
            সকল ক্যাটাগরি
          </Link>
          <Link href="/page/sitemap" className="flex items-center gap-3 hover:text-[#488e14] transition-colors" onClick={() => setIsMenuOpen(false)}>
            <Bookmark size={20} />
            ক্যাটাগরি লিস্ট সাইটম্যাপ
          </Link>
          <Link href="/page/brands" className="flex items-center gap-3 hover:text-[#488e14] transition-colors" onClick={() => setIsMenuOpen(false)}>
            <Database size={20} />
            সকল ব্র্যান্ড
          </Link>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 my-2 mx-4" />

        {/* Categories List (Tags) */}
        <div className="flex flex-col px-4 text-gray-800 font-bold text-[15px] gap-4 py-4 pb-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="flex items-center gap-3 hover:text-[#488e14] transition-colors" onClick={() => setIsMenuOpen(false)}>
              <Tag size={20} className="transform rotate-90" />
              {cat.name}
            </Link>
          ))}
          {categories.length === 0 && (
            <span className="text-gray-400 italic text-sm">কোনো ক্যাটাগরি নেই</span>
          )}
        </div>

        {/* Contact & Social Section in Drawer */}
        <div className="mt-auto border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2 mb-3 text-xs text-gray-700">
            <a 
              href="https://wa.me/8801601471471" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 font-bold text-green-700 hover:text-green-800"
            >
              <MessageCircle size={15} />
              <span>WhatsApp: +880 1601-471471</span>
            </a>
            <a 
              href="tel:+8801601471471" 
              className="flex items-center gap-2 font-medium hover:text-[#488e14]"
            >
              <Phone size={14} className="text-[#488e14]" />
              <span>কল করুন: +880 1601-471471</span>
            </a>
            <div className="flex items-start gap-1.5 text-gray-600 leading-tight pt-1">
              <MapPin size={14} className="text-[#488e14] shrink-0 mt-0.5" />
              <span className="text-[11px]">পিটিআই মোড়, বগুড়া সদর , ৫৮০০</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-[11px] font-semibold text-gray-500 mb-2">সোশ্যাল মিডিয়া:</p>
            <div className="flex flex-wrap gap-2">
              <a href="https://www.facebook.com/SmartAgroSource" target="_blank" rel="noopener noreferrer" title="Facebook" className="bg-[#1877F2] text-white p-1.5 rounded-full hover:opacity-90 flex items-center justify-center w-7 h-7 shadow-xs">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.youtube.com/@SmartAgroSource" target="_blank" rel="noopener noreferrer" title="YouTube" className="bg-[#FF0000] text-white p-1.5 rounded-full hover:opacity-90 flex items-center justify-center w-7 h-7 shadow-xs">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://www.instagram.com/smartagrosource/" target="_blank" rel="noopener noreferrer" title="Instagram" className="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white p-1.5 rounded-full hover:opacity-90 flex items-center justify-center w-7 h-7 shadow-xs">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@smartagrosource" target="_blank" rel="noopener noreferrer" title="TikTok" className="bg-[#000000] text-white p-1.5 rounded-full hover:opacity-90 flex items-center justify-center w-7 h-7 shadow-xs border border-gray-700">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a href="https://www.threads.net/@smartagrosource" target="_blank" rel="noopener noreferrer" title="Threads" className="bg-[#000000] text-white p-1.5 rounded-full hover:opacity-90 flex items-center justify-center w-7 h-7 shadow-xs border border-gray-700">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12.186 24h-.007c-3.585-.02-6.54-1.325-8.544-3.774-1.93-2.357-2.884-5.625-2.834-9.712.05-4.184 1.144-7.469 3.255-9.764C6.115 1.554 8.928.307 12.417.307c3.355 0 6.082 1.137 8.106 3.38 1.942 2.152 2.977 5.219 2.993 8.868v.548h-4.328v-.548c-.013-2.585-.688-4.664-1.954-6.012-1.31-1.393-3.092-2.127-5.297-2.127-2.38 0-4.23.829-5.498 2.464-1.368 1.764-2.072 4.354-2.103 7.697-.038 3.189.605 5.688 1.91 7.23 1.348 1.594 3.315 2.441 5.847 2.455 2.106.012 3.864-.537 5.226-1.632.744-.597 1.306-1.385 1.7-2.368-1.52.28-3.088.304-4.598.073-2.227-.34-3.955-1.34-4.866-2.815-.794-1.285-.98-2.83-.524-4.352.486-1.621 1.7-2.894 3.33-3.493 1.258-.462 2.687-.549 4.133-.251 1.255.258 2.378.828 3.248 1.649.333-.949.49-1.968.49-3.036 0-.256-.008-.51-.024-.763l-.004-.047h4.032l.003.055c.032.532.048 1.077.048 1.625 0 1.66-.356 3.226-1.028 4.673-.133.287-.282.564-.445.831.62 1.134.954 2.428.97 3.791.037 3.125-.853 5.76-2.574 7.618C18.667 22.793 15.82 24 12.186 24zm-.503-8.814c1.173 0 2.26-.206 3.155-.598-.291-.84-.793-1.545-1.468-2.062-.733-.563-1.666-.867-2.701-.88-.934-.012-1.748.257-2.292.759-.516.475-.769 1.135-.712 1.857.067.854.498 1.526 1.216 1.892.493.252 1.127.382 1.802.382z"/></svg>
              </a>
              <a href="https://x.com/SmartAgroSource" target="_blank" rel="noopener noreferrer" title="X (Twitter)" className="bg-[#000000] text-white p-1.5 rounded-full hover:opacity-90 flex items-center justify-center w-7 h-7 shadow-xs border border-gray-700">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
