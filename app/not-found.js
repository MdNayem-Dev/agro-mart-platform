import Link from "next/link";
import { Wrench, ArrowLeft, ShoppingBag, MessageCircle, Sparkles } from "lucide-react";

export const metadata = {
  title: 'পেজটি পাওয়া যায়নি (Page Not Found)',
  robots: {
    index: false,
    follow: false,
  },
};


export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50/50">
      <div className="max-w-xl w-full bg-white border border-green-100 rounded-3xl p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#488e14] via-emerald-400 to-[#60b72a]"></div>

        {/* Tag */}
        <div className="inline-flex items-center gap-1.5 bg-green-50 text-[#488e14] border border-green-200/80 px-3.5 py-1 rounded-full text-xs font-bold mb-6">
          <Sparkles size={13} className="text-[#488e14]" />
          <span>শীঘ্রই যুক্ত করা হবে</span>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6 text-[#488e14] shadow-xs">
          <Wrench size={36} className="animate-bounce" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
          এই পেজটি প্রস্তুত করা হচ্ছে
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8">
          আমাদের প্ল্যাটফর্মে এই ফিচার ও পেজটি নিয়ে কাজ চলছে। খুব দ্রুতই এখানে নতুন ও আকর্ষণীয় সব তথ্য ও পণ্য যুক্ত হতে যাচ্ছে!
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#488e14] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>হোমে ফিরে যান</span>
          </Link>

          <Link
            href="/categories"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <ShoppingBag size={16} className="text-[#488e14]" />
            <span>সকল পণ্য দেখুন</span>
          </Link>

          <a
            href="https://wa.me/8801601471471"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20b857] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <MessageCircle size={16} />
            <span>হোয়াটসঅ্যাপ</span>
          </a>
        </div>

      </div>
    </div>
  );
}
