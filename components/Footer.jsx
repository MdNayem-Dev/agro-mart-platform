import Link from 'next/link';
import { 
  Phone, Mail, MapPin, 
  ChevronRight, 
  FileText, Settings, Leaf,
  MessageCircle, Clock,
  ArrowUp
} from 'lucide-react';

export default function Footer({ siteAssets = {} }) {
  const { siteLogo } = siteAssets;
  return (
    <footer className="bg-[#0b1618] text-gray-300 font-sans mt-4 relative overflow-hidden">
      {/* Background Decorative Leaf (Optional) */}
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
        <Leaf size={400} />
      </div>

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-4">
          
          {/* Column 1: Brand & Contact (5 cols width on lg) */}
          <div className="md:col-span-12 lg:col-span-5 pr-0 lg:pr-8">
            <Link href="/" className="inline-block mb-3 group">
              <span className="text-2xl md:text-3xl font-bold text-white tracking-wide group-hover:text-gray-100 transition-colors">
                Smart<span className="text-[#488e14]">Agro</span>Source
              </span>
            </Link>

            <ul className="space-y-2 mb-2">
              <li className="flex items-center gap-3 group">
                <div className="bg-[#112a21] group-hover:bg-[#488e14] transition-colors p-2.5 rounded-full text-[#4ecc6b] group-hover:text-white shrink-0">
                  <Phone size={18} />
                </div>
                <div className="text-[14px] text-gray-300">
                  <span className="font-semibold text-white block">কল করুন:</span>
                  <a href="tel:+8801601471471" className="hover:text-white transition-colors">+880 1601-471471</a>
                </div>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="bg-[#112a21] group-hover:bg-[#488e14] transition-colors p-2.5 rounded-full text-[#4ecc6b] group-hover:text-white shrink-0">
                  <Mail size={18} />
                </div>
                <div className="text-[14px] text-gray-300">
                  <span className="font-semibold text-white block">ইমেইল:</span>
                  <a href="mailto:smartagresource@gmail.com" className="hover:text-white transition-colors">smartagresource@gmail.com</a>
                </div>
              </li>
            </ul>


          </div>

          {/* Divider line for large screens */}
          <div className="hidden lg:block lg:col-span-1 footer-desktop-only">
            <div className="w-[1px] h-full bg-gray-800 mx-auto"></div>
          </div>

          {/* Column 2: Quick Links (3 cols width) - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block md:col-span-6 lg:col-span-3 lg:-ml-6 xl:-ml-10 footer-desktop-only">
            <h4 className="text-white font-bold text-lg mb-1">প্রয়োজনীয় লিংক</h4>
            <div className="w-10 h-1 bg-[#488e14] rounded-full mb-3"></div>
            
            <ul className="space-y-1.5">
              {[
                { name: "হোম", link: "/" },
                { name: "আমাদের সম্পর্কে", link: "/page/about-us" },
                { name: "সাধারণ জিজ্ঞাসা (FAQ)", link: "/#faq" },
                { name: "প্রাইভেসি পলিসি", link: "/page/privacy-policy" },
                { name: "শর্তাবলী", link: "/page/terms-and-conditions" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href={item.link} className="flex items-center gap-2 text-[15px] text-gray-400 hover:text-white transition-colors group">
                    <ChevronRight size={16} className="text-[#488e14] group-hover:translate-x-1 transition-transform" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <h4 className="text-white font-bold text-lg mb-1">সময়সূচী</h4>
              <div className="w-10 h-1 bg-[#488e14] rounded-full mb-3"></div>
              <div className="flex items-start gap-3 group">
                <div className="bg-[#112a21] group-hover:bg-[#488e14] transition-colors p-2.5 rounded-full text-[#4ecc6b] group-hover:text-white shrink-0">
                  <Clock size={18} />
                </div>
                <span className="text-[14px] font-medium tracking-wide text-gray-400 mt-1 leading-snug">সকাল ৮টা - রাত ১০ টা (সাপ্তাহিক ছুটির দিন)</span>
              </div>
            </div>
          </div>

          {/* Column 3: Categories (3 cols width) - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block md:col-span-6 lg:col-span-3 footer-desktop-only">
            <h4 className="text-white font-bold text-lg mb-1">জনপ্রিয় ক্যাটাগরি</h4>
            <div className="w-10 h-1 bg-[#488e14] rounded-full mb-3"></div>
            
            <ul className="space-y-1.5">
              <li className="flex items-center gap-4 group cursor-pointer">
                <div className="bg-[#112a21] group-hover:bg-[#488e14] transition-colors p-2.5 rounded-full text-[#4ecc6b] group-hover:text-white shadow-sm">
                  <FileText size={18} />
                </div>
                <Link href="/categories" className="text-[15px] text-gray-400 group-hover:text-white transition-colors">মেশিনারিজ</Link>
              </li>
              <li className="flex items-center gap-4 group cursor-pointer">
                <div className="bg-[#112a21] group-hover:bg-[#488e14] transition-colors p-2.5 rounded-full text-[#4ecc6b] group-hover:text-white shadow-sm">
                  <Settings size={18} />
                </div>
                <Link href="/categories" className="text-[15px] text-gray-400 group-hover:text-white transition-colors">দুধ দোহন মেশিন</Link>
              </li>
              <li className="flex items-center gap-4 group cursor-pointer">
                <div className="bg-[#112a21] group-hover:bg-[#488e14] transition-colors p-2.5 rounded-full text-[#4ecc6b] group-hover:text-white shadow-sm">
                  <Leaf size={18} />
                </div>
                <Link href="/categories" className="text-[15px] text-gray-400 group-hover:text-white transition-colors">বায়োগ্যাস পণ্য</Link>
              </li>
            </ul>

            <div className="mt-4 flex flex-col gap-4">
              {/* Payment Methods */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <div className="bg-[#E2136E] text-white text-xs font-bold px-3 py-1.5 rounded-sm flex items-center shadow-md">
                  bKash
                </div>
                <div className="bg-[#F75A27] text-white text-xs font-bold px-3 py-1.5 rounded-sm flex items-center shadow-md">
                  নগদ
                </div>
                <div className="bg-[#8C1595] text-white text-xs font-bold px-3 py-1.5 rounded-sm flex items-center shadow-md">
                  রকেট
                </div>
                <div className="bg-gradient-to-r from-[#0088CC] to-[#00AEEF] text-white text-[10px] leading-tight font-bold px-3 py-1.5 rounded-sm flex flex-col justify-center shadow-md">
                  <span>Cash on</span>
                  <span>Delivery</span>
                </div>
              </div>
              
              {/* Social Icons */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-400">আমাদের ফলো করুন:</span>
                <div className="flex items-center gap-4">
                  <a href="https://www.facebook.com/SmartAgroSource" target="_blank" rel="noopener noreferrer" title="Facebook" className="text-gray-400 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://www.youtube.com/@SmartAgroSource" target="_blank" rel="noopener noreferrer" title="YouTube" className="text-gray-400 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/smartagrosource/" target="_blank" rel="noopener noreferrer" title="Instagram" className="text-gray-400 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://www.tiktok.com/@smartagrosource" target="_blank" rel="noopener noreferrer" title="TikTok" className="text-gray-400 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                  </a>
                  <a href="https://www.threads.net/@smartagrosource" target="_blank" rel="noopener noreferrer" title="Threads" className="text-gray-400 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.186 24h-.007c-3.585-.02-6.54-1.325-8.544-3.774-1.93-2.357-2.884-5.625-2.834-9.712.05-4.184 1.144-7.469 3.255-9.764C6.115 1.554 8.928.307 12.417.307c3.355 0 6.082 1.137 8.106 3.38 1.942 2.152 2.977 5.219 2.993 8.868v.548h-4.328v-.548c-.013-2.585-.688-4.664-1.954-6.012-1.31-1.393-3.092-2.127-5.297-2.127-2.38 0-4.23.829-5.498 2.464-1.368 1.764-2.072 4.354-2.103 7.697-.038 3.189.605 5.688 1.91 7.23 1.348 1.594 3.315 2.441 5.847 2.455 2.106.012 3.864-.537 5.226-1.632.744-.597 1.306-1.385 1.7-2.368-1.52.28-3.088.304-4.598.073-2.227-.34-3.955-1.34-4.866-2.815-.794-1.285-.98-2.83-.524-4.352.486-1.621 1.7-2.894 3.33-3.493 1.258-.462 2.687-.549 4.133-.251 1.255.258 2.378.828 3.248 1.649.333-.949.49-1.968.49-3.036 0-.256-.008-.51-.024-.763l-.004-.047h4.032l.003.055c.032.532.048 1.077.048 1.625 0 1.66-.356 3.226-1.028 4.673-.133.287-.282.564-.445.831.62 1.134.954 2.428.97 3.791.037 3.125-.853 5.76-2.574 7.618C18.667 22.793 15.82 24 12.186 24zm-.503-8.814c1.173 0 2.26-.206 3.155-.598-.291-.84-.793-1.545-1.468-2.062-.733-.563-1.666-.867-2.701-.88-.934-.012-1.748.257-2.292.759-.516.475-.769 1.135-.712 1.857.067.854.498 1.526 1.216 1.892.493.252 1.127.382 1.802.382z"/></svg>
                  </a>
                  <a href="https://x.com/SmartAgroSource" target="_blank" rel="noopener noreferrer" title="X (Twitter)" className="text-gray-400 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-800 relative z-10">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-3 flex items-center justify-center">
          
          <p className="text-[13px] text-gray-400 text-center">
            © 2026 <span className="text-[#488e14] font-medium">smartagrosource.com</span>. Developing by <a href="https://wa.me/8801766392692?text=Hello%20Renovra%20IT" target="_blank" rel="noopener noreferrer" className="text-[#488e14] underline underline-offset-2 hover:text-green-500 transition-colors font-bold">Renovra IT</a>
          </p>

        </div>
      </div>
    </footer>
  );
}
