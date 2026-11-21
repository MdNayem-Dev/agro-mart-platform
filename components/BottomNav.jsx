"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Home, User, ShoppingCart, Search, X, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { doSearch } from '@/app/actions/search';
import { useRouter } from 'next/navigation';

export default function BottomNav() {
  const { totalItems, setIsCartOpen, isLoaded } = useCart();
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await doSearch(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleProductClick = (slug) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/product/${slug}`);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {/* Home */}
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-green-600 transition-colors">
            <Home size={20} className="mb-1" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* Search */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-green-600 transition-colors"
          >
            <Search size={20} className="mb-1" />
            <span className="text-[10px] font-medium">Search</span>
          </button>

          {/* Cart */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-green-600 transition-colors relative"
          >
            <div className="relative">
              <ShoppingCart size={20} className="mb-1" />
              {isLoaded && totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Cart</span>
          </button>

          {/* Account */}
          <Link href="/my-account" className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-green-600 transition-colors">
            <User size={20} className="mb-1" />
            <span className="text-[10px] font-medium">Account</span>
          </Link>
        </div>
      </div>

      {/* Full Screen Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 h-10">
              <Search size={18} className="text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য বা ক্যাটাগরি খুঁজুন..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-3 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400">
                  <X size={16} />
                </button>
              )}
            </div>
            <button onClick={() => setIsSearchOpen(false)} className="text-sm font-bold text-gray-600">
              বাতিল
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Loader2 size={30} className="animate-spin mb-3 text-green-600" />
                <p className="text-sm">খোঁজা হচ্ছে...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">ফলাফল</h4>
                {searchResults.map(product => (
                  <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product.slug)}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={product.title} className="w-14 h-14 object-cover rounded-lg border border-gray-100" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{product.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {product.salePrice && product.salePrice < product.regularPrice ? (
                          <>
                            <span className="text-[#488e14] font-bold text-[15px]">৳{product.salePrice}</span>
                            <span className="text-xs text-gray-400 line-through">৳{product.regularPrice}</span>
                          </>
                        ) : (
                          <span className="text-[#488e14] font-bold text-[15px]">৳{product.regularPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim().length >= 2 ? (
              <div className="text-center py-10 text-gray-500">
                <Search size={40} className="mx-auto mb-3 opacity-20" />
                <p>কোনো পণ্য পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Search size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">পছন্দের পণ্যের নাম লিখে খুঁজুন</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
