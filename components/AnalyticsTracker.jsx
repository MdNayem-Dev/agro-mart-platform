"use client";

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return '';
  try {
    const STORAGE_KEY = 'sas_visitor_session';
    const EXPIRY_KEY = 'sas_session_expiry';
    const now = Date.now();
    const expiry = Number(localStorage.getItem(EXPIRY_KEY) || 0);

    // If session expired (more than 30 minutes of inactivity), generate a new session
    let sessionId = localStorage.getItem(STORAGE_KEY);
    if (!sessionId || now > expiry) {
      sessionId = `s_${now}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, sessionId);
    }

    // Refresh 30-minute rolling expiration
    localStorage.setItem(EXPIRY_KEY, String(now + 30 * 60 * 1000));
    return sessionId;
  } catch {
    return `s_${Date.now()}`;
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef('');

  useEffect(() => {
    // Never track admin panel pages or under-development page
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname === '/under-development') {
      return;
    }

    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Prevent duplicate firing for the exact same URL state within short interval
    if (lastTrackedRef.current === fullUrl) {
      return;
    }
    lastTrackedRef.current = fullUrl;

    const timer = setTimeout(() => {
      try {
        const sessionId = getOrCreateSessionId();
        const payload = {
          sessionId,
          path: pathname,
          title: typeof document !== 'undefined' ? document.title : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          search: typeof window !== 'undefined' ? window.location.search : '',
          screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
        };

        const jsonStr = JSON.stringify(payload);
        const endpoint = '/api/analytics/track';

        // 1. Try modern navigator.sendBeacon (instant, doesn't delay page unloads)
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const sent = navigator.sendBeacon(endpoint, blob);
          if (sent) return;
        }

        // 2. Fallback to background fetch with keepalive
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStr,
          keepalive: true,
        }).catch(() => {});
      } catch (err) {
        // Silent failure so user experience is never impacted
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}
