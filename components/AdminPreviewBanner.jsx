"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPreviewBanner({ initialShow = false }) {
  const [show, setShow] = useState(initialShow);

  useEffect(() => {
    if (initialShow) return;
    // Check if maintenance mode is active
    fetch("/api/maintenance-status")
      .then((res) => res.json())
      .then((data) => {
        if (data?.enabled) {
          // If maintenance is on, check if logged in as admin
          fetch("/api/admin-session")
            .then((res) => res.json())
            .then((sessionData) => {
              if (sessionData?.authenticated) {
                setShow(true);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [initialShow]);

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white px-4 py-2.5 text-xs font-bold text-center flex flex-wrap items-center justify-center gap-2.5 shadow-md z-50 sticky top-0 print:hidden">
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        <span>মেইনটেইনেন্স মোড সক্রিয় (সাধারণ ভিজিটরদের জন্য সাইট বন্ধ • আপনি এডমিন হিসেবে লাইভ সাইট দেখতে পাচ্ছেন)</span>
      </span>
      <div className="flex items-center gap-2">
        <Link 
          href="/under-development" 
          prefetch={false}
          className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-md transition-colors font-semibold"
        >
          <span>ভিজিটর ভিউ দেখুন (Test Maintenance Page) →</span>
        </Link>
        <Link 
          href="/admin" 
          prefetch={false}
          className="inline-flex items-center gap-1 bg-black/40 hover:bg-black/60 text-white px-2.5 py-1 rounded-md transition-colors font-semibold"
        >
          <span>এডমিন প্যানেল ⚙️</span>
        </Link>
      </div>
    </div>
  );
}
