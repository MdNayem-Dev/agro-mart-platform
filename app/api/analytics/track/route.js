import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// In-memory cache for IP -> Geolocation to keep requests instantaneous and avoid rate-limits
const geoCache = new Map();
const MAX_GEO_CACHE_SIZE = 5000;

function parseUserAgent(ua = '', screenWidth = 1200) {
  const uaLower = ua.toLowerCase();

  // 1. Bot detection
  const isBot = /bot|crawler|spider|crawling|googlebot|bingbot|yandex|baiduspider|ahrefs|semrush|petalbot|facebookexternalhit|slackbot|twitterbot/i.test(uaLower);

  // 2. Device Type
  let deviceType = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(uaLower) || (screenWidth >= 768 && screenWidth < 1024)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(uaLower) || screenWidth < 768) {
    deviceType = 'mobile';
  }

  // 3. Browser
  let browser = 'Other';
  if (/fban|fbav/i.test(ua)) browser = 'Facebook App';
  else if (/instagram/i.test(ua)) browser = 'Instagram App';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Browser';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';

  // 4. Operating System
  let os = 'Other';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod|ios/i.test(ua)) os = 'iOS';
  else if (/mac os x|macintosh/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { isBot, deviceType, browser, os };
}

function parseTrafficSource(referrer = '', search = '') {
  const refLower = (referrer || '').toLowerCase();
  const searchLower = (search || '').toLowerCase();

  // 1. Check URL parameters first (most reliable for marketing campaigns)
  if (searchLower.includes('fbclid') || searchLower.includes('utm_source=facebook')) return 'Facebook';
  if (searchLower.includes('gclid') || searchLower.includes('utm_source=google')) return 'Google Search';
  if (searchLower.includes('utm_source=instagram')) return 'Instagram';
  if (searchLower.includes('utm_source=youtube')) return 'YouTube';
  if (searchLower.includes('utm_source=tiktok')) return 'TikTok';
  if (searchLower.includes('utm_source=whatsapp')) return 'WhatsApp';

  const customUtm = searchLower.match(/utm_source=([^&]+)/);
  if (customUtm && customUtm[1]) {
    return customUtm[1].charAt(0).toUpperCase() + customUtm[1].slice(1);
  }

  // 2. Check Referrer URL
  if (!refLower || refLower === 'direct') return 'Direct';
  if (refLower.includes('facebook.com') || refLower.includes('fb.me') || refLower.includes('android-app://com.facebook')) return 'Facebook';
  if (refLower.includes('google.com') || refLower.includes('google.')) return 'Google Search';
  if (refLower.includes('instagram.com')) return 'Instagram';
  if (refLower.includes('youtube.com') || refLower.includes('youtu.be')) return 'YouTube';
  if (refLower.includes('tiktok.com')) return 'TikTok';
  if (refLower.includes('whatsapp.com') || refLower.includes('wa.me')) return 'WhatsApp';
  if (refLower.includes('bing.com')) return 'Bing Search';
  if (refLower.includes('yahoo.com')) return 'Yahoo';

  // Internal referrers
  if (refLower.includes('smartagrosource.com') || refLower.includes('localhost')) {
    return 'Direct';
  }

  // Other external domain
  try {
    const url = new URL(referrer.startsWith('http') ? referrer : `https://${referrer}`);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'Other';
  }
}

async function resolveLocation(req, ip) {
  // Check Cloudflare / Hostinger proxy headers first
  const cfCity = req.headers.get('cf-ipcity');
  const cfCountry = req.headers.get('cf-ipcountry');
  if (cfCity) {
    return {
      city: cfCity,
      country: cfCountry || 'Bangladesh',
    };
  }

  // Private or Localhost IP fallback
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      city: 'Localhost (Dev)',
      country: 'Bangladesh',
    };
  }

  // Check in-memory cache
  if (geoCache.has(ip)) {
    return geoCache.get(ip);
  }

  // Fallback to free GeoIP lookup with 1.2s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SmartAgroAnalytics/1.0' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        const result = {
          city: data.city || 'Dhaka',
          country: data.country || 'Bangladesh',
        };
        if (geoCache.size > MAX_GEO_CACHE_SIZE) geoCache.clear();
        geoCache.set(ip, result);
        return result;
      }
    }
  } catch {
    // On timeout or failure, return default
  }

  return {
    city: 'Bangladesh',
    country: 'Bangladesh',
  };
}

export async function POST(request) {
  try {
    let body = {};
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const {
      sessionId = `s_${Date.now()}`,
      path = '/',
      title = '',
      referrer = '',
      search = '',
      screenWidth = 1200,
    } = body;

    // Do not track admin routes or API calls
    if (path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/_next')) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // Extract IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');
    const ip = (cfIp || forwarded?.split(',')[0] || realIp || '127.0.0.1').trim();

    // Generate anonymized hash of IP
    const ipHash = crypto.createHash('sha256').update(ip + 'smart_agro_salt').digest('hex').substring(0, 16);

    // Parse User Agent
    const ua = request.headers.get('user-agent') || '';
    const { isBot, deviceType, browser, os } = parseUserAgent(ua, screenWidth);

    // Parse Traffic Source
    const source = parseTrafficSource(referrer, search);

    // Resolve Location
    const { city, country } = await resolveLocation(request, ip);

    // Save to Database asynchronously
    await prisma.visitorLog.create({
      data: {
        sessionId: String(sessionId).slice(0, 100),
        path: String(path).slice(0, 500),
        title: title ? String(title).slice(0, 255) : null,
        referrer: referrer ? String(referrer).slice(0, 1000) : null,
        source: String(source).slice(0, 100),
        deviceType: String(deviceType).slice(0, 50),
        browser: String(browser).slice(0, 100),
        os: String(os).slice(0, 100),
        country: String(country).slice(0, 100),
        city: String(city).slice(0, 100),
        ipHash: ipHash,
        isBot: isBot,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Never throw error or break caller
    console.error('Analytics tracking error:', err?.message);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
