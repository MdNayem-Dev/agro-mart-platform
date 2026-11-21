import { Phone, PhoneCall, MessageCircle, ShieldCheck, Sparkles, Code2, CheckCircle2, MapPin } from "lucide-react";
import TypewriterHeadline from "@/components/TypewriterHeadline";
import Link from "next/link";

export const metadata = {
  title: "Developing by Renovra IT | Smart Agro Source",
  description: "স্মার্ট এগ্রো সোর্স প্ল্যাটফর্মটির উন্নয়নের কাজ চলছে। শীঘ্রই আমরা নতুন রূপে ফিরে আসছি।",
};

export default function UnderDevelopmentPage() {
  const logoUrl = "https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png";

  return (
    <div className="min-h-screen bg-[#061109] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans select-none">
      
      {/* Background Glows & Ambient Lighting */}
      <div className="absolute top-[-15%] left-[20%] w-[650px] h-[650px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[10%] w-[550px] h-[550px] bg-green-500/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-transparent pointer-events-none"></div>

      {/* Top Header / Branding */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 sm:py-4 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white px-3.5 py-1.5 rounded-xl shadow-md border border-white/20 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={logoUrl} 
              alt="Smart Agro Source Logo" 
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">SMART AGRO SOURCE</span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">স্মার্ট কৃষি, সমৃদ্ধ আগামী</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
            <span className="text-xs text-amber-300 font-semibold tracking-wide">Maintenance Mode</span>
          </div>
          <Link 
            href="/admin" 
            className="hidden sm:inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            <span>এডমিন প্যানেল ⚙️</span>
          </Link>
        </div>
      </header>

      {/* Main Content: Organized 2-Column Desktop Grid for balanced width */}
      <main className="w-full max-w-7xl mx-auto my-auto py-8 sm:py-12 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Big Headline & Customer Information */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm mb-5">
              <Sparkles size={14} className="text-amber-400" />
              <span>SYSTEM UPGRADE IN PROGRESS</span>
            </div>

            {/* Headline with Smooth Typewriter Effect */}
            <TypewriterHeadline />

            {/* Explanation Paragraph */}
            <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed mb-6">
              আমাদের ওয়েবসাইটটিতে বর্তমানে নতুন ফিচার ও সিস্টেম আপগ্রেডের কাজ চলছে। 
              অতি দ্রুত নতুন ও আরও চমৎকার অভিজ্ঞতায় আপনাদের সেবায় সাইটটি লাইভ করা হবে।
            </p>

            {/* Highlighted WhatsApp Inquiry Banner */}
            <div className="w-full max-w-xl mb-5 bg-gradient-to-r from-emerald-950/90 via-green-950/60 to-emerald-950/90 border border-emerald-500/40 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-xl shadow-black/40 backdrop-blur-md text-left">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 flex items-center justify-center shrink-0 text-[#25D366] shadow-inner">
                <PhoneCall className="w-5 h-5 text-[#25D366] animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                  যেকোনো পণ্য সম্পর্কিত তথ্য অথবা যেকোনো কিছু জানতে সরাসরি WhatsApp-এ কল করুন
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] sm:text-xs text-emerald-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
                  <span>হোয়াটসঅ্যাপ হটলাইন: 01601-471471</span>
                </div>
              </div>
            </div>

            {/* Support Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-8">
              <a
                href="https://wa.me/8801601471471"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-green-950/60 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
              </a>

              <a
                href="tel:+8801601471471"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold px-6 py-3.5 rounded-xl transition-all backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>জরুরী কল করুন</span>
              </a>
            </div>

            {/* Info Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs text-gray-400">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>নিরাপদ সিস্টেম</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>হটলাইন: +880 1601-471471</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>বগুড়া সদর, বাংলাদেশ</span>
              </div>
            </div>

          </div>

          {/* Right Column: Developer Contact Card (Balances the Screen) */}
          <div className="lg:col-span-5 w-full">
            <div className="relative bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-emerald-950/50 overflow-hidden">
              
              {/* Subtle card glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white font-extrabold text-base shadow-md">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base sm:text-lg">Renovra IT</h3>
                    <p className="text-xs text-emerald-400 font-medium">Digital Agency & Software Development</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Active</span>
                </div>
              </div>

              {/* Developer Body Information */}
              <div className="py-6 space-y-4">
                <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  সাইটের কারিগরি উন্নয়ন, নতুন কোনো ফিচার তৈরি বা ওয়েব ডেভেলপমেন্ট সম্পর্কিত যেকোনো প্রয়োজনে ডেভেলপারের সাথে সরাসরি কথা বলুন।
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-sm">
                      <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Contact with Renovra IT</p>
                      <p className="text-base font-extrabold text-white tracking-wide">01766392692</p>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/8801766392692?text=Hello%20Renovra%20IT,%20I%20am%20contacting%20you%20regarding%20website%20development"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-transform active:scale-95 shadow-md shrink-0 cursor-pointer"
                  >
                    <span>চ্যাট করুন</span>
                  </a>
                </div>
              </div>

              {/* Developer Key Features & Expertise Badges */}
              <div className="pt-5 border-t border-white/10">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Key Features & Expertise</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-200">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>0.5 sec Site Loading</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Custom Admin Panel</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Professional Orders Management</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Custom Next.js Apps</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 sm:col-span-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>24/7 Dedicated Tech Support</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 py-4 border-t border-white/10 text-xs text-gray-400 z-10 text-center">
        <p>© 2026 Smart Agro Source. All rights reserved.</p>
        <p className="flex items-center gap-1.5 text-gray-400">
          <span>Developing by <strong className="text-white">Renovra IT</strong></span>
          <span>•</span>
          <a 
            href="https://wa.me/8801766392692" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-emerald-400 hover:text-emerald-300 underline font-semibold inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            01766392692
          </a>
        </p>
      </footer>

    </div>
  );
}
