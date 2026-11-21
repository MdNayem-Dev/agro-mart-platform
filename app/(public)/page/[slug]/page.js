import Link from "next/link";
import { Wrench, ArrowLeft, Phone, MessageCircle, ShoppingBag, Sparkles, Clock, CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Friendly Bengali titles dictionary for each slug
const PAGE_TITLES = {
  "new-products": {
    title: "নতুন পণ্য (New Products)",
    subtitle: "আমাদের নতুন কালেকশন ও উদ্ভাবনী কৃষি পণ্য খুব শীঘ্রই এই সেকশনে যুক্ত হচ্ছে।",
    tag: "শীঘ্রই আসছে"
  },
  "offers": {
    title: "বিশেষ অফার ও ডিসকাউন্ট (Special Offers)",
    subtitle: "খামারি ও কৃষকদের জন্য বিশেষ ছাড় এবং স্পেশাল অফার প্যাকেজ তৈরি করা হচ্ছে।",
    tag: "অফার লোডিং"
  },
  "others": {
    title: "অন্যান্য পণ্য ও সেবা (Other Services)",
    subtitle: "কৃষি ও খামার সংশ্লিষ্ট অতিরিক্ত পণ্য ও সেবাসমূহ এখানে সাজানো হচ্ছে।",
    tag: "প্রস্তুতি চলছে"
  },
  "delivery-policy": {
    title: "ডেলিভারি পলিসি (Delivery Policy)",
    subtitle: "সারা বাংলাদেশে দ্রুত ও নিরাপদ হোম ডেলিভারির সম্পূর্ণ নিয়মাবলী খুব শীঘ্রই আপডেট হচ্ছে।",
    tag: "পলিসি আপডেট"
  },
  "terms-and-conditions": {
    title: "শর্তাবলী ও নিয়মাবলী (Terms & Conditions)",
    subtitle: "আমাদের সেবা গ্রহণ এবং অর্ডার সংক্রান্ত শর্তাবলী ও গাইডলাইন প্রস্তুত করা হচ্ছে।",
    tag: "টার্মস আপডেট"
  },
  "solutions": {
    title: "কৃষি ও খামার সমস্যার সমাধান (Solutions)",
    subtitle: "ডেইরি ও পোল্ট্রি খামারের বিভিন্ন জটিল সমস্যার কার্যকরী সমাধান ও গাইডলাইন যুক্ত করা হচ্ছে।",
    tag: "পরামর্শ ও গাইড"
  },
  "brands": {
    title: "সকল ব্র্যান্ড (All Brands)",
    subtitle: "শীর্ষস্থানীয় ও বিশ্বস্ত কৃষি যন্ত্রাংশ এবং ফিড ব্র্যান্ডসমূহ এখানে তালিকাভুক্ত করা হচ্ছে।",
    tag: "ব্র্যান্ডস"
  },
  "sitemap": {
    title: "সাইটম্যাপ (Sitemap)",
    subtitle: "স্মার্ট এগ্রো সোর্সের সকল পেজ ও প্রোডাক্ট নেভিগেশন ম্যাপ তৈরি করা হচ্ছে।",
    tag: "সাইটম্যাপ"
  },
  "about-us": {
    title: "আমাদের সম্পর্কে (About Us)",
    subtitle: "স্মার্ট এগ্রো সোর্সের পরিচিতি, লক্ষ্য ও খামারিদের প্রতি আমাদের অঙ্গীকার।",
    tag: "আমাদের গল্প"
  },
  "privacy-policy": {
    title: "প্রাইভেসি পলিসি (Privacy Policy)",
    subtitle: "আপনার ব্যক্তিগত তথ্যের নিরাপত্তা ও সুরক্ষার বিস্তারিত গাইডলাইন প্রস্তুত হচ্ছে।",
    tag: "প্রাইভেসি"
  },
  "how-to-order": {
    title: "কীভাবে অর্ডার করবেন (How to Order)",
    subtitle: "সহজ পদ্ধতিতে ওয়েবসাইট অথবা ফোনে পণ্য ক্রয়ের নিয়মাবলী শীঘ্রই দেখতে পাবেন।",
    tag: "সহায়িকা"
  },
  "refund-policy": {
    title: "রিটার্ন ও রিফান্ড পলিসি (Return & Refund)",
    subtitle: "পণ্য পরিবর্তনের সুযোগ ও সহজ রিফান্ড প্রক্রিয়ার স্পষ্ট নিয়মাবলী যুক্ত হচ্ছে।",
    tag: "রিটার্ন পলিসি"
  }
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  const pageInfo = PAGE_TITLES[slug] || {
    title: slug ? slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "তথ্য ও সহায়িকা",
    subtitle: "Smart Agro Source - স্মার্ট কৃষি, সমৃদ্ধ আগামী। কৃষি ও খামার শিল্পের বিশ্বস্ত নাম।",
  };

  const canonicalUrl = `https://smartagrosource.com/page/${encodeURIComponent(slug)}`;

  return {
    title: pageInfo.title,
    description: pageInfo.subtitle,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${pageInfo.title} | Smart Agro Source`,
      description: pageInfo.subtitle,
      url: canonicalUrl,
      siteName: 'Smart Agro Source',
      locale: 'bn_BD',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageInfo.title} | Smart Agro Source`,
      description: pageInfo.subtitle,
    },
  };
}

export default async function DynamicPlaceholderPage({ params }) {
  // Await params in Next.js 15+ / Next.js 16
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  // Get mapped info or fallback
  const pageInfo = PAGE_TITLES[slug] || {
    title: slug ? slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "পেজটি তৈরি হচ্ছে",
    subtitle: "আমরা এই পেজটি নিয়ে কাজ করছি এবং খুব দ্রুতই প্রয়োজনীয় তথ্য ও ফিচার এখানে যুক্ত করা হবে।",
    tag: "উন্নয়নাধীন"
  };

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-12 md:py-20">
      
      <div className="max-w-2xl mx-auto bg-white border border-green-100 rounded-3xl p-6 sm:p-10 text-center shadow-sm relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#488e14] via-emerald-400 to-[#60b72a]"></div>

        {/* Floating Tag */}
        <div className="inline-flex items-center gap-1.5 bg-green-50 text-[#488e14] border border-green-200/80 px-3.5 py-1 rounded-full text-xs font-bold mb-6">
          <Sparkles size={13} className="text-[#488e14]" />
          <span>{pageInfo.tag}</span>
        </div>

        {/* Animated Icon Circle */}
        <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6 text-[#488e14] shadow-xs">
          <Wrench size={36} className="animate-bounce" />
        </div>

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
          {pageInfo.title}
        </h1>

        {/* Headline text */}
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto">
          {pageInfo.subtitle}
        </p>

        {/* Quick Notification Box */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 mb-8 text-left flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <span className="font-bold">শীঘ্রই লাইভ হচ্ছে:</span> এই সেকশনটিতে দ্রুত নতুন কনটেন্ট যুক্ত করা হবে। কোনো পণ্য বা তথ্যের বিষয়ে তাৎক্ষণিক জানতে আমাদের হটলাইনে সরাসরি যোগাযোগ করতে পারেন।
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#488e14] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md"
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
