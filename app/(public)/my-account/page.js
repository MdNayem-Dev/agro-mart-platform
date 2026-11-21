"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function MyAccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login logic
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // --- Login Screen ---
  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-[60vh] bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white shadow-sm border border-gray-200 rounded-sm p-8">
          
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            লগইন করুন
          </h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">ইমেইল অ্যাড্রেস <span className="text-red-500">*</span></label>
              <input 
                type="email" 
                required
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#488e14]"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">পাসওয়ার্ড <span className="text-red-500">*</span></label>
              <input 
                type="password" 
                required
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#488e14]"
              />
            </div>

            {/* Primary Login Button */}
            <button 
              type="submit"
              className="w-full bg-[#488e14] hover:bg-green-700 text-white font-bold py-3 rounded-sm transition-colors mt-2"
            >
              লগইন
            </button>
            
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">অথবা</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Secondary Guest Checkout Button */}
          <Link 
            href="/checkout"
            className="w-full flex items-center justify-center border-2 border-[#488e14] text-[#488e14] hover:bg-[#488e14] hover:text-white font-bold py-3 rounded-sm transition-colors"
          >
            গেস্ট হিসেবে অর্ডার করুন
          </Link>

          {/* Footer Text */}
          <p className="text-center text-sm text-gray-600 mt-6">
            অ্যাকাউন্ট নেই? <Link href="#" className="text-[#488e14] hover:underline font-bold">নতুন অ্যাকাউন্ট তৈরি করুন</Link>
          </p>

        </div>
      </div>
    );
  }

  // --- Dashboard Screen ---
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen">
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="flex flex-col border border-gray-200 bg-white rounded-sm overflow-hidden">
            <Link href="#" className="p-4 border-b border-gray-200 text-[#488e14] font-bold bg-gray-50 hover:bg-gray-100 transition-colors">
              ড্যাশবোর্ড
            </Link>
            <Link href="#" className="p-4 border-b border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              আমার অর্ডার
            </Link>
            <Link href="#" className="p-4 border-b border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              ঠিকানা
            </Link>
            <Link href="#" className="p-4 border-b border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              অ্যাকাউন্টের বিবরণ
            </Link>
            <button 
              onClick={handleLogout}
              className="p-4 text-left text-red-600 font-medium hover:bg-red-50 transition-colors"
            >
              লগআউট
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-full md:w-3/4">
          
          <div className="mb-6">
            <p className="text-gray-700 text-lg">
              স্বাগতম <strong>জনাব ইউজার</strong> (আপনি ইউজার নন? <button onClick={handleLogout} className="text-[#488e14] hover:underline">লগআউট</button> করুন)
            </p>
            <p className="text-gray-600 mt-2">
              আপনার ড্যাশবোর্ড থেকে আপনি সাম্প্রতিক অর্ডার দেখতে পারবেন, ডেলিভারি ও বিলিং ঠিকানা পরিচালনা করতে পারবেন এবং অ্যাকাউন্টের পাসওয়ার্ড ও বিবরণ সম্পাদনা করতে পারবেন।
            </p>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                  <th className="p-4 font-bold text-sm">অর্ডার আইডি</th>
                  <th className="p-4 font-bold text-sm">তারিখ</th>
                  <th className="p-4 font-bold text-sm">স্ট্যাটাস</th>
                  <th className="p-4 font-bold text-sm">সর্বমোট</th>
                  <th className="p-4 font-bold text-sm">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-[#488e14]">#SA-4820</td>
                  <td className="p-4">১০ অক্টোবর, ২০২৬</td>
                  <td className="p-4">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-sm text-xs font-bold">প্রসেসিং</span>
                  </td>
                  <td className="p-4">৳ 3,450 (২টি আইটেম)</td>
                  <td className="p-4">
                    <Link href="#" className="bg-[#488e14] hover:bg-green-700 text-white px-3 py-1.5 rounded-sm font-bold transition-colors text-xs">
                      ভিউ
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-[#488e14]">#SA-4712</td>
                  <td className="p-4">০৫ অক্টোবর, ২০২৬</td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-sm text-xs font-bold">ডেলিভার্ড</span>
                  </td>
                  <td className="p-4">৳ 12,500 (১টি আইটেম)</td>
                  <td className="p-4">
                    <Link href="#" className="bg-[#488e14] hover:bg-green-700 text-white px-3 py-1.5 rounded-sm font-bold transition-colors text-xs">
                      ভিউ
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
