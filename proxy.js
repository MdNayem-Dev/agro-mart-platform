import { NextResponse } from "next/server";

// In-memory cache for maintenance mode to eliminate external network latency on every request
let maintenanceCache = {
  active: false,
  timestamp: 0,
};

async function isMaintenanceModeActive(request) {
  // 1. Instant check via cookie
  const cookieVal = request.cookies.get("site_maintenance_mode")?.value;
  if (cookieVal === "1") return true;
  if (cookieVal === "0") return false;

  // 2. In-memory cache check (TTL: 30 seconds)
  const now = Date.now();
  if (now - maintenanceCache.timestamp < 30000) {
    return maintenanceCache.active;
  }

  // 3. Fast internal fetch with strict 1s timeout to ensure page never hangs
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    const origin = request.nextUrl.origin;
    const res = await fetch(`${origin}/api/maintenance-status`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      maintenanceCache.active = Boolean(data?.enabled);
      maintenanceCache.timestamp = now;
      return maintenanceCache.active;
    }
  } catch (error) {
    // On timeout or failure, preserve last known status and prevent retry storm for 30s
    maintenanceCache.timestamp = now;
  }

  return maintenanceCache.active;
}

export async function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Normalize path by stripping any trailing slash (except root '/')
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  // Always allow the maintenance page itself
  if (normalizedPath === "/under-development") {
    return NextResponse.next();
  }

  // Always allow search engine crawlers to access robots.txt and sitemap.xml
  if (
    normalizedPath === "/robots.txt" ||
    normalizedPath === "/sitemap.xml" ||
    normalizedPath.endsWith(".xml") ||
    normalizedPath.endsWith(".txt")
  ) {
    return NextResponse.next();
  }

  const isAdminRoute = normalizedPath.startsWith("/admin");
  const isLoginPage = normalizedPath === "/admin/login";

  // Check admin session cookie
  const sessionCookie = request.cookies.get("admin_session")?.value;
  let hasValidSession = false;

  if (sessionCookie) {
    try {
      let rawVal = sessionCookie;
      if (rawVal.startsWith("%7B") || rawVal.startsWith("%7b") || rawVal.includes("%22")) {
        try { rawVal = decodeURIComponent(rawVal); } catch {}
      }
      const session = JSON.parse(rawVal);
      if (session && (session.token || session.user)) {
        if (!session.expiresAt || session.expiresAt > Date.now()) {
          hasValidSession = true;
        }
      }
    } catch {
      hasValidSession = false;
    }
  }

  // --- ADMIN ROUTE PROTECTION ---
  if (isAdminRoute) {
    // 1. If already authenticated and trying to visit /admin/login -> redirect to /admin
    if (isLoginPage) {
      if (hasValidSession) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // 2. If not authenticated and trying to access any protected /admin route -> redirect to /admin/login
    if (!hasValidSession) {
      const loginUrl = new URL("/admin/login", request.url);
      if (normalizedPath !== "/admin") {
        loginUrl.searchParams.set("redirect", normalizedPath);
      }

      const response = NextResponse.redirect(loginUrl);
      if (sessionCookie && !hasValidSession) {
        response.cookies.delete("admin_session");
      }
      return response;
    }

    return NextResponse.next();
  }

  // --- PUBLIC ROUTE: MAINTENANCE MODE CHECK ---
  // Authenticated Admin with a valid session can ALWAYS view and test the live site freely
  if (hasValidSession) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
    return response;
  }

  // Check if maintenance mode is enabled for public visitors
  const maintenanceMode = await isMaintenanceModeActive(request);
  if (maintenanceMode) {
    // Rewrite URL to Under Development page seamlessly for all public visitors
    const response = NextResponse.rewrite(new URL("/under-development", request.url));
    response.headers.set("Cache-Control", "no-cache, must-revalidate");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml
     * - public assets with extensions (.svg, .png, .jpg, .xml, .txt, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|xml|txt)$).*)",
  ],
};
