import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/app/actions/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // 1. Authenticate admin
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    const now = new Date();
    let startDate = new Date();
    let endDate = now;

    // Bangladesh is UTC+6
    const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
    const bdNow = new Date(now.getTime() + BD_OFFSET_MS);

    if (period === 'today') {
      const bdStartOfToday = new Date(Date.UTC(bdNow.getUTCFullYear(), bdNow.getUTCMonth(), bdNow.getUTCDate()));
      startDate = new Date(bdStartOfToday.getTime() - BD_OFFSET_MS);
    } else if (period === 'yesterday') {
      const bdStartOfToday = new Date(Date.UTC(bdNow.getUTCFullYear(), bdNow.getUTCMonth(), bdNow.getUTCDate()));
      endDate = new Date(bdStartOfToday.getTime() - BD_OFFSET_MS);
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === 'all') {
      startDate = new Date(0);
    }

    // Real-time active visitors in the last 30 minutes
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const recentLogsForActive = await prisma.visitorLog.findMany({
      where: {
        createdAt: { gte: thirtyMinsAgo },
        isBot: false,
      },
      select: { sessionId: true },
    });
    const realtimeActive = new Set(recentLogsForActive.map(l => l.sessionId)).size;

    // Fetch logs within selected period
    const logs = await prisma.visitorLog.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        isBot: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 2000, // safe upper limit for instant in-memory analytics calculation
    });

    const totalPageviews = logs.length;
    const uniqueSessionIds = new Set(logs.map(l => l.sessionId));
    const uniqueVisitors = uniqueSessionIds.size;

    // 1. Device Breakdown
    const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
    logs.forEach(l => {
      const dev = (l.deviceType || 'desktop').toLowerCase();
      if (deviceCounts[dev] !== undefined) {
        deviceCounts[dev]++;
      } else {
        deviceCounts.desktop++;
      }
    });

    const deviceBreakdown = [
      { name: 'Mobile (স্মার্টফোন)', key: 'mobile', count: deviceCounts.mobile, percentage: totalPageviews ? Math.round((deviceCounts.mobile / totalPageviews) * 100) : 0 },
      { name: 'Desktop (কম্পিউটার)', key: 'desktop', count: deviceCounts.desktop, percentage: totalPageviews ? Math.round((deviceCounts.desktop / totalPageviews) * 100) : 0 },
      { name: 'Tablet (ট্যাবলেট)', key: 'tablet', count: deviceCounts.tablet, percentage: totalPageviews ? Math.round((deviceCounts.tablet / totalPageviews) * 100) : 0 },
    ].filter(d => d.count > 0 || d.key === 'mobile' || d.key === 'desktop');

    // 2. Traffic Source Breakdown
    const sourceMap = {};
    logs.forEach(l => {
      const src = l.source || 'Direct';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    const sourceBreakdown = Object.entries(sourceMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalPageviews ? Math.round((count / totalPageviews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 3. Location / City Breakdown
    const cityMap = {};
    logs.forEach(l => {
      const city = l.city || 'অন্যান্য / অজানা';
      cityMap[city] = (cityMap[city] || 0) + 1;
    });

    const cityBreakdown = Object.entries(cityMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalPageviews ? Math.round((count / totalPageviews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 4. Top Visited Pages / Products
    const pageMap = {};
    logs.forEach(l => {
      const p = l.path || '/';
      pageMap[p] = (pageMap[p] || 0) + 1;
    });

    const topPages = Object.entries(pageMap)
      .map(([path, count]) => ({
        path,
        count,
        percentage: totalPageviews ? Math.round((count / totalPageviews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 5. Timeline Chart Data
    let chartData = [];
    if (period === 'today' || period === 'yesterday') {
      // 24 Hourly buckets
      const hourly = Array.from({ length: 24 }, (_, i) => ({
        label: `${i.toString().padStart(2, '0')}:00`,
        pageviews: 0,
        sessions: new Set(),
      }));

      logs.forEach(l => {
        const bdTime = new Date(new Date(l.createdAt).getTime() + BD_OFFSET_MS);
        const hour = bdTime.getUTCHours();
        if (hourly[hour]) {
          hourly[hour].pageviews++;
          hourly[hour].sessions.add(l.sessionId);
        }
      });

      chartData = hourly.map(h => ({
        label: h.label,
        pageviews: h.pageviews,
        visitors: h.sessions.size,
      }));
    } else {
      // Daily buckets for 7d, 30d, all
      const days = period === '30d' ? 30 : 7;
      const dailyMap = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(bdNow.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        dailyMap[key] = { label: key, pageviews: 0, sessions: new Set() };
      }

      logs.forEach(l => {
        const bdTime = new Date(new Date(l.createdAt).getTime() + BD_OFFSET_MS);
        const key = bdTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        if (dailyMap[key]) {
          dailyMap[key].pageviews++;
          dailyMap[key].sessions.add(l.sessionId);
        }
      });

      chartData = Object.values(dailyMap).map(d => ({
        label: d.label,
        pageviews: d.pageviews,
        visitors: d.sessions.size,
      }));
    }

    // 6. Recent 100 Live Visitor Stream (paginated on client)
    const recentVisits = logs.slice(0, 100).map(l => ({
      id: l.id,
      path: l.path,
      source: l.source,
      deviceType: l.deviceType,
      city: l.city,
      country: l.country,
      browser: l.browser,
      os: l.os,
      createdAt: l.createdAt,
    }));

    return NextResponse.json({
      summary: {
        totalPageviews,
        uniqueVisitors,
        realtimeActive,
        mobilePercentage: totalPageviews ? Math.round((deviceCounts.mobile / totalPageviews) * 100) : 0,
        topSource: sourceBreakdown[0]?.name || 'Direct',
      },
      chartData,
      deviceBreakdown,
      sourceBreakdown,
      cityBreakdown,
      topPages,
      recentVisits,
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
