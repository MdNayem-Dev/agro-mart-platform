import { getProductCategories, getWebsiteAssets } from '@/lib/api';
import { getMaintenanceModeFromWC } from '@/lib/maintenance';
import { cookies } from 'next/headers';
import UnderDevelopmentPage from '@/app/under-development/page';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import MenuDrawer from '@/components/MenuDrawer';
import BottomNav from '@/components/BottomNav';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import AdminPreviewBanner from '@/components/AdminPreviewBanner';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }) {
  // Check maintenance status directly from MySQL
  const isMaintenanceActive = await getMaintenanceModeFromWC();

  let hasValidAdminSession = false;
  if (isMaintenanceActive) {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("admin_session")?.value;
      if (sessionCookie) {
        let rawVal = sessionCookie;
        if (rawVal.startsWith("%7B") || rawVal.startsWith("%7b") || rawVal.includes("%22")) {
          try { rawVal = decodeURIComponent(rawVal); } catch {}
        }
        const session = JSON.parse(rawVal);
        if (session && (session.token || session.user)) {
          if (!session.expiresAt || session.expiresAt > Date.now()) {
            hasValidAdminSession = true;
          }
        }
      }
    } catch {}
  }

  // If maintenance is active and user is NOT an admin, display the Under Development page directly!
  if (isMaintenanceActive && !hasValidAdminSession) {
    return <UnderDevelopmentPage />;
  }

  const [categories, siteAssets] = await Promise.all([
    getProductCategories().catch(() => []),
    getWebsiteAssets().catch(() => null),
  ]);

  return (
    <>
      <AdminPreviewBanner initialShow={isMaintenanceActive && hasValidAdminSession} />

      <div className="print:hidden">
        <Navbar siteAssets={siteAssets} />
        <CartDrawer />
        <MenuDrawer categories={categories} siteLogo={siteAssets?.siteLogo} />
      </div>
      
      <div className="flex-grow">
        {children}
      </div>
      
      <div className="print:hidden">
        <Footer siteAssets={siteAssets} />
      </div>
      <div className="print:hidden">
        <BottomNav />
      </div>
      <FloatingWhatsApp />
    </>
  );
}
