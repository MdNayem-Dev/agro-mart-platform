"use client";
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { CheckSquare, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cartItems, totalPrice, isLoaded, clearCart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  
  // Dynamic product delivery charges state
  const [dbDeliveryCharges, setDbDeliveryCharges] = useState({});

  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch product-specific delivery charges dynamically from database
  useEffect(() => {
    if (!isLoaded || cartItems.length === 0) return;

    const ids = cartItems.map(item => item.id).filter(Boolean);
    if (ids.length === 0) return;

    let isMounted = true;
    fetch('/api/product-delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && data.deliveryCharges) {
          setDbDeliveryCharges(data.deliveryCharges);
        }
      })
      .catch(err => {
        console.warn("Failed to fetch product delivery charges:", err);
      });

    return () => { isMounted = false; };
  }, [cartItems, isLoaded]);

  const getItemDeliveryCharge = (item) => {
    if (dbDeliveryCharges[item.id] !== undefined) {
      return Number(dbDeliveryCharges[item.id]) || 0;
    }
    return Number(item.deliveryCharge ?? item.delivery_charge ?? 0);
  };

  // Dynamic delivery charge calculation from cart items
  const shippingCost = cartItems.reduce((acc, item) => {
    return acc + getItemDeliveryCharge(item);
  }, 0);

  const finalTotal = totalPrice + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          shippingCost,
          cartItems
        })
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        router.push('/order-success?orderId=' + result.orderId);
      } else {
        setErrorMsg(result.message || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('সার্ভারে সমস্যা হয়েছে। Please Try Again।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoaded && cartItems.length === 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="text-gray-400 mb-4">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">আপনার কার্টে কোনো পণ্য নেই</h2>
        <p className="text-gray-500 mb-6">প্রোডাক্ট কিনতে Shop Page ফিরে যান</p>
        <a href="/" className="bg-[#488e14] text-white px-8 py-3 rounded-md font-bold hover:bg-green-700 transition-colors">
          শপিং শুরু করুন
        </a>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 flex flex-col items-center justify-start py-4 sm:py-8 px-3 sm:px-6">
      {/* Centered responsive card */}
      <div className="w-full max-w-xl md:max-w-4xl bg-white shadow-md border border-[#488e14] rounded-lg overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-[#488e14] py-3 sm:py-3.5 px-4 text-center border-b border-[#387010]">
          <h1 className="text-white text-base sm:text-lg font-bold tracking-wide flex items-center justify-center gap-2">
            <span>🚚</span>
            <span>হোম ডেলিভারির তথ্য দিন</span>
            <span>🚛</span>
          </h1>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 md:p-7">
          
          {errorMsg && (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-md text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-7 items-start">
            
            {/* Left Column: Customer Delivery Info (7 of 12 cols on desktop) */}
            <div className="md:col-span-7 flex flex-col gap-4">
              <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
                <span className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-1.5">
                  📍 ডেলিভারি তথ্য
                </span>
                <span className="text-xs text-gray-400">* চিহ্নিত ঘরগুলো আবশ্যক</span>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-800 font-semibold text-sm sm:text-base flex items-center gap-1.5">
                  👤 আপনার নাম লিখুন <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                  className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-[#488e14] focus:ring-2 focus:ring-[#488e14]/20 bg-white transition-all"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-800 font-semibold text-sm sm:text-base flex items-center gap-1.5">
                  📱 মোবাইল নাম্বার <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="01xxxxxxxxx"
                  className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-[#488e14] focus:ring-2 focus:ring-[#488e14]/20 bg-white transition-all"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-800 font-semibold text-sm sm:text-base flex items-center gap-1.5">
                  🏠 ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="সম্পূর্ণ ঠিকানা লিখুন (বাসা/রোড, থানা, জেলা সহ)"
                  className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-[#488e14] focus:ring-2 focus:ring-[#488e14]/20 bg-white transition-all resize-none"
                />
              </div>

              {/* Note */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-800 font-semibold text-sm sm:text-base flex items-center justify-between">
                  <span>📝 নোট</span>
                  <span className="text-gray-400 font-normal text-xs sm:text-sm">(ঐচ্ছিক)</span>
                </label>
                <textarea 
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন..."
                  className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-[#488e14] focus:ring-2 focus:ring-[#488e14]/20 bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Right Column: Order Summary & Submit (5 of 12 cols on desktop) */}
            <div className="md:col-span-5 flex flex-col gap-3.5 bg-gray-50/80 border border-gray-200 p-3.5 sm:p-4 md:p-5 rounded-md">
              <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
                <span className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-1.5">
                  🛒 আপনার অর্ডার
                </span>
                <span className="text-xs sm:text-sm text-gray-600 font-medium bg-gray-200/70 px-2 py-0.5 rounded-full">
                  {cartItems.length} টি পণ্য
                </span>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-200 space-y-3 pt-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pt-3 first:pt-0 relative items-start">
                    {/* Big Clear Product Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-300 p-1 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow min-w-0 pr-6">
                      <p className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 leading-snug" title={item.title}>
                        {item.title}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs sm:text-sm text-gray-500">
                          ৳{Number(item.salePrice ?? item.regularPrice ?? item.price ?? 0).toLocaleString()}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className={`text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md ${
                          getItemDeliveryCharge(item) > 0 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          ডেলিভারি: {getItemDeliveryCharge(item) > 0 ? `৳${getItemDeliveryCharge(item).toLocaleString()}` : 'ফ্রি'}
                        </span>
                      </div>

                      {/* Quantity Controller (+ / -) */}
                      <div className="flex items-center gap-2 mt-2 border border-gray-300 rounded w-fit bg-white">
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.id, -1)} 
                          className="px-2.5 py-0.5 text-gray-600 hover:text-black hover:bg-gray-100 font-bold text-sm transition-colors cursor-pointer"
                          title="কমান"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold w-6 text-center text-gray-800 select-none">
                          {Number(item.quantity) || 1}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.id, 1)} 
                          className="px-2.5 py-0.5 text-gray-600 hover:text-black hover:bg-gray-100 font-bold text-sm transition-colors cursor-pointer"
                          title="বাড়ান"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-sm sm:text-base font-bold text-[#488e14] mt-1.5">
                        মোট: ৳{(Number(item.salePrice ?? item.regularPrice ?? item.price ?? 0) * (Number(item.quantity) || 1)).toLocaleString()}
                      </div>
                    </div>

                    {/* Remove button */}
                    {cartItems.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="absolute top-0 right-0 text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="রিমুভ করুন"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-gray-200 pt-3 flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>সাব-টোটাল:</span>
                  <span className="font-semibold text-gray-800">৳ {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span className="flex items-center gap-1">
                    <span>ডেলিভারি চার্জ:</span>
                    {shippingCost > 0 && (
                      <span className="text-[11px] text-gray-400 font-normal">(পণ্যভিত্তিক নির্দিষ্ট চার্জ)</span>
                    )}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {shippingCost === 0 ? 'ফ্রি ডেলিভারি' : `৳ ${shippingCost.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base sm:text-lg font-bold text-gray-900 border-t border-dashed border-gray-300 pt-2 mt-1">
                  <span>সর্বমোট বিল:</span>
                  <span className="text-[#488e14] text-lg sm:text-xl font-bold product-price-bold">৳ {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Confirmation Call Notice */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-2.5 text-center">
                <p className="text-xs sm:text-sm font-medium text-emerald-800 leading-normal">
                  📞 আপনার অর্ডারটি কনফার্ম করার জন্য আমাদের প্রতিনিধি আপনার দেওয়া নাম্বার এ কল করবেন।
                </p>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full bg-[#488e14] hover:bg-green-700 active:scale-[0.99] text-white font-bold py-3.5 sm:py-4 rounded-md flex items-center justify-center gap-2 transition-all text-base sm:text-lg shadow-md disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckSquare size={22} />
                    <span>অর্ডার করুন ৳ {isLoaded ? finalTotal.toLocaleString() : '...'}</span>
                  </>
                )}
              </button>

              {/* Cash on delivery guarantee */}
              <p className="text-xs text-center text-gray-500 font-medium">
                🛡️ ক্যাশ অন ডেলিভারি • সারাদেশে হোম ডেলিভারি
              </p>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}
