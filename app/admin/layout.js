"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package,
  Grid,
  LogOut,
  Search,
  Bell,
  ArrowUpRight,
  Menu,
  X,
  Layers,
  HelpCircle,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminLogout } from '@/app/actions/adminAuth';
import { getRecentNotificationsAction } from '@/app/admin/actions/orderActions';
import MaintenanceToggle from '@/components/MaintenanceToggle';
import AdminThemeProvider from '@/components/AdminThemeProvider';
import AdminThemeToggle from '@/components/AdminThemeToggle';

function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  try {
    const orderDate = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    const diffSec = Math.floor((Date.now() - orderDate.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return 'Recent';
  }
}

const READ_NOTIFS_STORAGE_KEY = 'admin_read_notification_ids';

function getStoredReadIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(READ_NOTIFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistReadIds(ids) {
  if (typeof window === 'undefined') return;
  try {
    const safeList = Array.from(new Set(ids)).slice(-300);
    localStorage.setItem(READ_NOTIFS_STORAGE_KEY, JSON.stringify(safeList));
  } catch (err) {
    console.error('Failed to save read notification IDs:', err);
  }
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readIds, setReadIds] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Initialize read notification IDs from localStorage on mount
  useEffect(() => {
    setReadIds(getStoredReadIds());
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        setIsLoadingNotifications(true);
        const data = await getRecentNotificationsAction();
        if (isMounted && data) {
          setNotifications(data);
          const currentRead = getStoredReadIds();
          setReadIds(currentRead);
          const unreadList = data.filter((n) => !currentRead.includes(n.id));
          setUnreadCount(unreadList.length);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        if (isMounted) setIsLoadingNotifications(false);
      }
    }

    loadNotifications();

    // Poll every 2 minutes for new orders (conserves database connection limit)
    const interval = setInterval(loadNotifications, 120000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const currentRead = getStoredReadIds();
    const updated = Array.from(new Set([...currentRead, ...allIds]));
    persistReadIds(updated);
    setReadIds(updated);
    setUnreadCount(0);
  };

  const handleNotificationClick = (orderId) => {
    setIsNotificationsOpen(false);
    const currentRead = getStoredReadIds();
    if (!currentRead.includes(orderId)) {
      const updated = [...currentRead, orderId];
      persistReadIds(updated);
      setReadIds(updated);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // If user is on the login page, render children cleanly without sidebar/admin layout
  if (pathname === '/admin/login' || pathname?.startsWith('/admin/login')) {
    return <AdminThemeProvider>{children}</AdminThemeProvider>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Visitor Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Grid },
    { name: 'Logo & Banners', href: '/admin/banners', icon: Layers },
    { name: 'Trust & Services', href: '/admin/services', icon: ShieldCheck },
    { name: 'FAQ Manager', href: '/admin/faq', icon: HelpCircle },
  ];

  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex font-sans transition-colors duration-200">
        
        {/* Sidebar - Desktop */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden lg:flex flex-col h-screen sticky top-0 shrink-0 shadow-sm z-40 transition-colors duration-200">
          <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-xs border border-gray-100 dark:border-gray-700/50 flex items-center justify-center">
                <img 
                  src="https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png" 
                  alt="Smart Agro Source" 
                  className="h-8 w-auto object-contain max-w-[130px]"
                />
              </div>
              <span className="text-[10px] bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400 font-bold px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800 uppercase tracking-wider">
                Admin
              </span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
            <div className="mb-8">
              <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-4 tracking-wider uppercase">Main Menu</p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      prefetch={true}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
                        isActive 
                          ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-transparent dark:border-green-800/40' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-2">
            <Link 
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title="লাইভ সাইট দেখুন ও টেস্ট করুন (এডমিন প্রিভিউ)"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors text-sm font-semibold"
            >
              <ArrowUpRight className="w-4 h-4" />
              লাইভ সাইট দেখুন
            </Link>
            <button 
              onClick={() => adminLogout()}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 transition-colors text-sm font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              লগআউট (Logout)
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Header */}
          <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm transition-colors duration-200">
            
            <div className="flex items-center gap-4 flex-1">
              <button 
                className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = e.target.search.value.trim();
                  if (q) router.push(`/admin/products?search=${encodeURIComponent(q)}`);
                }}
                className="hidden md:flex relative max-w-md w-full"
              >
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input 
                  name="search"
                  type="text" 
                  placeholder="Search products globally..." 
                  className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </form>
            </div>

            <div className="flex items-center gap-3 sm:gap-5 relative">
              {/* Maintenance Mode Toggle Switch */}
              <MaintenanceToggle />

              {/* Light & Dark Mode Toggle Button */}
              <AdminThemeToggle />

              <div className="relative">
                <button 
                  onClick={() => {
                    const nextState = !isNotificationsOpen;
                    setIsNotificationsOpen(nextState);
                    if (nextState) {
                      getRecentNotificationsAction().then((data) => {
                        if (data) {
                          setNotifications(data);
                          const currentRead = getStoredReadIds();
                          setReadIds(currentRead);
                          const unreadItems = data.filter((n) => !currentRead.includes(n.id));
                          setUnreadCount(unreadItems.length);
                        }
                      });
                    }
                  }}
                  className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-84 sm:w-96 max-w-[92vw] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/70 dark:bg-gray-800/60">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Notifications</h3>
                          {unreadCount > 0 ? (
                            <span className="bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                              {unreadCount} new
                            </span>
                          ) : (
                            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] px-2 py-0.5 rounded-full font-medium">
                              All caught up ✓
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={handleMarkAllAsRead}
                          disabled={unreadCount === 0}
                          className={`text-xs font-semibold cursor-pointer transition-colors ${
                            unreadCount > 0
                              ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                              : 'text-gray-400 dark:text-gray-500 opacity-60 cursor-default'
                          }`}
                        >
                          {unreadCount > 0 ? 'Mark all as read' : 'All read'}
                        </button>
                      </div>

                      <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoadingNotifications && notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                            Loading latest notifications...
                          </div>
                        ) : notifications.length > 0 ? (
                          notifications.map((item) => {
                            const isUnread = !readIds.includes(item.id);
                            return (
                              <Link
                                key={item.id}
                                href={`/admin/orders?search=${item.id}`}
                                onClick={() => handleNotificationClick(item.id)}
                                className={`p-3.5 block transition-colors group relative ${
                                  isUnread
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/25 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30'
                                    : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/60'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {isUnread && (
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Unread" />
                                    )}
                                    <p className={`text-xs truncate ${
                                      isUnread
                                        ? 'font-bold text-gray-900 dark:text-white'
                                        : 'font-semibold text-gray-700 dark:text-gray-300'
                                    } group-hover:text-emerald-700 dark:group-hover:text-emerald-400`}>
                                      {item.title}
                                    </p>
                                  </div>
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                                    {formatTimeAgo(item.date_created)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {item.message}
                                </p>
                                <div className="mt-1.5 flex items-center gap-2">
                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                    item.status === 'pending' 
                                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
                                      : item.status === 'completed'
                                      ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {item.status.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">
                                    ৳{item.total}
                                  </span>
                                </div>
                              </Link>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                            কোনো নতুন নোটিফিকেশন নেই
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 border-t border-gray-100 dark:border-gray-800 text-center bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center px-4">
                        <Link 
                          href="/admin/orders"
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold"
                        >
                          সব অর্ডার দেখুন →
                        </Link>
                        <button 
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Link 
                href="/" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="লাইভ সাইট দেখুন ও টেস্ট করুন (এডমিন প্রিভিউ)"
                className="hidden sm:flex items-center gap-1.5 bg-[#488e14] hover:bg-[#3d7a11] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>লাইভ সাইট দেখুন</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            {children}
          </main>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <aside className="relative w-64 bg-white dark:bg-gray-900 h-full flex flex-col shadow-2xl border-r border-gray-200 dark:border-gray-800 transition-colors duration-200">
              <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                  <div className="bg-white rounded-xl px-2 py-1 shadow-xs border border-gray-100 dark:border-gray-700/50 flex items-center justify-center">
                    <img 
                      src="https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png" 
                      alt="Smart Agro Source" 
                      className="h-7 w-auto object-contain max-w-[120px]"
                    />
                  </div>
                  <span className="text-[10px] bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400 font-bold px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800 uppercase">
                    Admin
                  </span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        pathname === item.href 
                          ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-2">
                <Link 
                  href="/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#488e14] hover:bg-[#3d7a11] text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  লাইভ সাইট দেখুন
                </Link>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    adminLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  লগআউট (Logout)
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AdminThemeProvider>
  );
}
