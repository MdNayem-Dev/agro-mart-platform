"use client";
import { X, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, totalPrice, isLoaded } = useCart();

  if (!isLoaded) return null;

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-[350px] md:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart size={20} />
            আপনার কার্ট
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-gray-500 hover:text-red-500 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 gap-4">
              <ShoppingCart size={64} className="text-gray-300" />
              <p>আপনার কার্টে কোনো পণ্য নেই।</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="bg-[#488e14] hover:bg-green-700 text-white px-6 py-2 rounded-sm font-bold transition-colors mt-2"
              >
                Shop Now
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex gap-4 border border-gray-100 p-3 rounded-md shadow-sm relative">
                
                {/* Remove Icon */}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                {/* Thumbnail */}
                <div className="w-20 h-20 bg-gray-50 border border-gray-200 flex-shrink-0 flex items-center justify-center p-1 rounded-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between flex-1 pr-4">
                  <Link href={`/product/${item.slug}`} onClick={() => setIsCartOpen(false)} className="text-sm font-bold text-gray-800 line-clamp-2 hover:text-[#488e14]">
                    {item.title}
                  </Link>
                  <div className="text-[#488e14] font-bold mt-1 product-price-bold">
                    ৳ {(Number(item.salePrice ?? item.regularPrice ?? 0)).toLocaleString()}
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3 mt-2 border border-gray-300 w-fit rounded-sm">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-2 py-0.5 text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-2 py-0.5 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-gray-700">সর্বমোট:</span>
              <span className="font-bold text-xl text-[#488e14] product-price-bold">৳ {totalPrice.toLocaleString()}</span>
            </div>
            <Link 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-[#488e14] hover:bg-green-700 text-white font-bold py-3 rounded-sm transition-colors text-lg flex items-center justify-center"
            >
              চেকআউট
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
