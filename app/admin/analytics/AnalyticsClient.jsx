"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Eye, 
  Smartphone, 
  Laptop, 
  Globe, 
  Search, 
  Share2, 
  MapPin, 
  TrendingUp, 
  RefreshCw, 
  Clock, 
  Download, 
  Calendar,
  Layers,
  MessageCircle,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function AnalyticsClient() {
  const [period, setPeriod] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [data, setData] = useState({
    summary: {
      totalPageviews: 0,
      uniqueVisitors: 0,
      realtimeActive: 0,
      mobilePercentage: 0,
      topSource: 'Direct',
    },
    chartData: [],
    deviceBreakdown: [],
    sourceBreakdown: [],
    cityBreakdown: [],
    topPages: [],
    recentVisits: [],
  });

  const fetchAnalytics = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Real-time auto-refresh interval (every 30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAnalytics]);

  const periods = [
    { key: 'today', label: 'আজ (Today)' },
    { key: 'yesterday', label: 'গতকাল (Yesterday)' },
    { key: '7d', label: 'গত ৭ দিন (7 Days)' },
    { key: '30d', label: 'গত ৩০ দিন (30 Days)' },
    { key: 'all', label: 'সর্বমোট (All Time)' },
  ];

  // Helper to format relative time
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'কিছুক্ষণ আগে';
    try {
      const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return 'এইমাত্র';
      const mins = Math.floor(diffSec / 60);
      if (mins < 60) return `${mins} মিনিট আগে`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
      const days = Math.floor(hrs / 24);
      return `${days} দিন আগে`;
    } catch {
      return 'সম্প্রতি';
    }
  };

  const getSourceIcon = (sourceName = '') => {
    const s = sourceName.toLowerCase();
    if (s.includes('facebook')) return <FacebookIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    if (s.includes('google')) return <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (s.includes('whatsapp')) return <MessageCircle className="w-4 h-4 text-green-500" />;
    if (s.includes('youtube')) return <Video className="w-4 h-4 text-red-500" />;
    if (s.includes('instagram')) return <Share2 className="w-4 h-4 text-pink-500" />;
    return <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
  };

  const exportCSV = () => {
    if (!data.recentVisits.length) {
      alert('এক্সপোর্ট করার মতো কোনো ভিজিটর ডাটা নেই।');
      return;
    }
    const headers = ['ID', 'Date Time', 'Page Path', 'Traffic Source', 'Device Type', 'City', 'Browser', 'OS'];
    const rows = data.recentVisits.map(v => [
      v.id,
      `"${new Date(v.createdAt).toLocaleString('bn-BD')}"`,
      `"${(v.path || '').replace(/"/g, '""')}"`,
      `"${(v.source || '').replace(/"/g, '""')}"`,
      `"${(v.deviceType || '').replace(/"/g, '""')}"`,
      `"${(v.city || '').replace(/"/g, '""')}"`,
      `"${(v.browser || '').replace(/"/g, '""')}"`,
      `"${(v.os || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smart-agro-visitor-analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find max value in chartData to scale bars
  const maxChartVal = Math.max(...(data.chartData?.map(d => Math.max(d.pageviews, d.visitors)) || [1]), 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header with Title & Period Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              ভিজিটর অ্যানালিটিক্স
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              রিয়েল-টাইম ডাটা
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            সাইটের লাইভ ভিজিটর সংখ্যা, উৎস (Facebook/Google/Direct), ফোন বনাম পিসি ও এলাকার সম্পূর্ণ রিপোর্ট
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60 text-xs font-medium">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => {
                  setPeriod(p.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  period === p.key
                    ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchAnalytics(false)}
            disabled={refreshing}
            title="রিফ্রেশ করুন"
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Export button */}
          <button
            onClick={exportCSV}
            title="CSV রিপোর্ট ডাউনলোড করুন"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs font-medium cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            এক্সপোর্ট
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Unique Visitors */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              ইউনিক ভিজিটর
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {data.summary.uniqueVisitors.toLocaleString('en-US')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">আলাদা মানুষ</span>
          </div>
          <div className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
            নির্বাচিত সময়সীমায় স্বতন্ত্র ব্রাউজার সেশন
          </div>
        </div>

        {/* Total Pageviews */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              মোট পেজভিউ
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {data.summary.totalPageviews.toLocaleString('en-US')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">বার পেজ দেখা হয়েছে</span>
          </div>
          <div className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
            গড় ভিজিট: {data.summary.uniqueVisitors ? (data.summary.totalPageviews / data.summary.uniqueVisitors).toFixed(1) : 0} পেজ/ভিজিটর
          </div>
        </div>

        {/* Device Share (Mobile %) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              মোবাইল ফোন ভিজিটর
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400">
              {data.summary.mobilePercentage}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">ফোন থেকে ব্রাউজ করছেন</span>
          </div>
          <div className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
            শীর্ষ উৎস: <strong className="text-gray-800 dark:text-gray-200">{data.summary.topSource}</strong>
          </div>
        </div>

      </div>

      {/* 3. Trend Chart Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ভিজিটর ট্রেন্ড ও কার্যক্রম গ্রাফ
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {period === 'today' || period === 'yesterday' ? '২৪ ঘণ্টার ঘণ্টায় ঘণ্টায় ভিজিট' : 'প্রতিদিনের মোট পেজভিউ ও ইউনিক ভিজিটর'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
              <span className="text-gray-600 dark:text-gray-400">পেজভিউ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>
              <span className="text-gray-600 dark:text-gray-400">ইউনিক ভিজিটর</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        {data.chartData?.length > 0 ? (
          <div className="mt-4">
            <div className="h-56 sm:h-64 flex items-end gap-1.5 sm:gap-3 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
              {data.chartData.map((item, idx) => {
                const pvHeight = Math.max(Math.round((item.pageviews / maxChartVal) * 100), item.pageviews > 0 ? 6 : 0);
                const visHeight = Math.max(Math.round((item.visitors / maxChartVal) * 100), item.visitors > 0 ? 6 : 0);

                return (
                  <div key={idx} className="flex-1 min-w-[20px] sm:min-w-[32px] flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-gray-900 text-white text-[11px] px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap">
                      <span>{item.label}</span>
                      <span className="text-emerald-400 font-semibold">{item.pageviews} পেজভিউ • {item.visitors} ভিজিটর</span>
                    </div>

                    {/* Bars Container */}
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div 
                        style={{ height: `${pvHeight}%` }} 
                        className="w-1/2 max-w-[14px] bg-emerald-500/80 hover:bg-emerald-500 rounded-t-sm transition-all duration-300"
                      />
                      <div 
                        style={{ height: `${visHeight}%` }} 
                        className="w-1/2 max-w-[14px] bg-blue-500/80 hover:bg-blue-500 rounded-t-sm transition-all duration-300"
                      />
                    </div>

                    {/* X-axis Label */}
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 truncate w-full text-center">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-gray-400">
            এই সময়সীমায় কোনো ভিজিটর রেকর্ড নেই।
          </div>
        )}
      </div>

      {/* 4. Two-Column Breakdown: Devices & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Device Breakdown (Phone vs PC vs Tablet) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ডিভাইস বিশ্লেষণ (ফোন নাকি কম্পিউটার)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                গ্রাহকরা কোন ধরনের ডিভাইস থেকে ওয়েবসাইট ব্রাউজ করছেন
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {data.deviceBreakdown?.map((dev, idx) => {
              const isPhone = dev.key === 'mobile';
              const isDesktop = dev.key === 'desktop';
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      {isPhone && <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      {isDesktop && <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      {!isPhone && !isDesktop && <Layers className="w-4 h-4 text-purple-600" />}
                      {dev.name}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {dev.count} ভিজিট ({dev.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPhone ? 'bg-emerald-500' : isDesktop ? 'bg-blue-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${dev.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {(!data.deviceBreakdown || data.deviceBreakdown.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">কোনো ডিভাইস ডাটা পাওয়া যায়নি</p>
            )}
          </div>
        </div>

        {/* Traffic Sources (Facebook, Google, Direct, etc.) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ট্রাফিক উৎস (Traffic Sources)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                ফেসবুক, গুগল সার্চ, সরাসরি লিংক নাকি অন্য সোশ্যাল মিডিয়া
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {data.sourceBreakdown?.map((src, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    {getSourceIcon(src.name)}
                    {src.name === 'Facebook' && 'ফেসবুক (Facebook)'}
                    {src.name === 'Google Search' && 'গুগল সার্চ (Google Search)'}
                    {src.name === 'Direct' && 'সরাসরি ব্রাউজ (Direct Visit)'}
                    {src.name === 'WhatsApp' && 'হোয়াটসঅ্যাপ (WhatsApp)'}
                    {src.name === 'YouTube' && 'ইউটিউব (YouTube)'}
                    {src.name === 'Instagram' && 'ইনস্টাগ্রাম (Instagram)'}
                    {!['Facebook', 'Google Search', 'Direct', 'WhatsApp', 'YouTube', 'Instagram'].includes(src.name) && src.name}
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {src.count} জন ({src.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      src.name.toLowerCase().includes('facebook') ? 'bg-blue-600' :
                      src.name.toLowerCase().includes('google') ? 'bg-emerald-500' :
                      src.name.toLowerCase().includes('direct') ? 'bg-amber-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${src.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            {(!data.sourceBreakdown || data.sourceBreakdown.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">কোনো ট্রাফিক উৎস ডাটা পাওয়া যায়নি</p>
            )}
          </div>
        </div>

      </div>

      {/* 5. Two-Column Breakdown: Location/Cities & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* City / Location Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                শীর্ষ এলাকা ও শহর (Top Locations)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                কোন জেলা/শহর থেকে গ্রাহক বেশি ভিজিট করছেন
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.cityBreakdown?.map((city, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-sm first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {city.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {city.count} জন
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium min-w-[42px] text-center">
                    {city.percentage}%
                  </span>
                </div>
              </div>
            ))}

            {(!data.cityBreakdown || data.cityBreakdown.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">কোনো লোকেশন ডাটা পাওয়া যায়নি</p>
            )}
          </div>
        </div>

        {/* Top Visited Pages & Products */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                জনপ্রিয় পেজ ও প্রোডাক্ট (Top Pages)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                গ্রাহকরা সবচেয়ে বেশি কোন পেজ বা পণ্য দেখছেন
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.topPages?.map((page, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-sm first:pt-0 last:pb-0 gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-mono text-xs text-gray-800 dark:text-gray-300 truncate" title={page.path}>
                    {page.path === '/' ? '🏠 হোমপেজ (Homepage)' : page.path}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {page.count} ভিউ
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                    {page.percentage}%
                  </span>
                </div>
              </div>
            ))}

            {(!data.topPages || data.topPages.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">কোনো পেজভিউ ডাটা পাওয়া যায়নি</p>
            )}
          </div>
        </div>

      </div>

      {/* 6. Recent Live Visitor Stream Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              সাম্প্রতিক লাইভ ভিজিটর স্ট্রিম (Live Stream)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              ওয়েবসাইটে শেষ দেখা ভিজিট এবং তাদের ডিভাইস, ব্রাউজার ও উৎসের বিবরণ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              অটো-রিফ্রেশ (৩০ সেকেন্ড)
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-950/60 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3">সময়</th>
                <th className="px-4 py-3">ভিজিটের পেজ</th>
                <th className="px-4 py-3">উৎস (Source)</th>
                <th className="px-4 py-3">ডিভাইস</th>
                <th className="px-4 py-3">লোকেশন</th>
                <th className="px-4 py-3">ব্রাউজার ও ওএস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(() => {
                const allVisits = data.recentVisits || [];
                const totalPages = Math.max(1, Math.ceil(allVisits.length / pageSize));
                const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
                const startIndex = (safeCurrentPage - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, allVisits.length);
                const paginatedVisits = allVisits.slice(startIndex, endIndex);

                if (paginatedVisits.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                        এখনও কোনো সাম্প্রতিক ভিজিট রেকর্ড নেই। ওয়েবসাইট ভিজিট হলে এখানে তাৎক্ষণিকভাবে দৃশ্যমান হবে।
                      </td>
                    </tr>
                  );
                }

                return paginatedVisits.map((visit) => {
                  const isMobile = visit.deviceType === 'mobile';
                  return (
                    <tr key={visit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatTimeAgo(visit.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-gray-900 dark:text-gray-200 max-w-[220px] truncate block" title={visit.path}>
                          {visit.path === '/' ? 'হোমপেজ (/)' : visit.path}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {getSourceIcon(visit.source)}
                          {visit.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          isMobile 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}>
                          {isMobile ? <Smartphone className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
                          {isMobile ? 'Mobile' : 'Desktop'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{visit.city || 'Bangladesh'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {visit.browser || 'Chrome'} • {visit.os || 'Android'}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {(() => {
          const allVisits = data.recentVisits || [];
          if (allVisits.length === 0) return null;
          const totalPages = Math.max(1, Math.ceil(allVisits.length / pageSize));
          const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
          const startIndex = (safeCurrentPage - 1) * pageSize;
          const endIndex = Math.min(startIndex + pageSize, allVisits.length);

          return (
            <div className="px-4 py-3.5 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900/50 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <span>
                  দেখাচ্ছে <strong className="text-gray-900 dark:text-white">{startIndex + 1}</strong> - <strong className="text-gray-900 dark:text-white">{endIndex}</strong> (মোট <strong className="text-gray-900 dark:text-white">{allVisits.length}</strong>টি ভিজিট)
                </span>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <div className="flex items-center gap-1.5">
                  <span>প্রতি পেজে:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-0.5 text-gray-900 dark:text-gray-100 text-xs focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={8}>৮টি</option>
                    <option value={15}>১৫টি</option>
                    <option value={25}>২৫টি</option>
                  </select>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  পূর্ববর্তী
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && p - prev > 1;
                      return (
                        <span key={p} className="flex items-center">
                          {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                          <button
                            onClick={() => setCurrentPage(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                              safeCurrentPage === p
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      );
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer shadow-2xs"
                >
                  পরবর্তী
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
}
