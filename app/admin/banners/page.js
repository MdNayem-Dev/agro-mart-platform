export const dynamic = 'force-dynamic';
import { getWebsiteAssets } from "@/lib/api";
import BannersClient from "./BannersClient";

export const metadata = {
  title: "Logo & Banners Management | Admin Dashboard",
  description: "Manage homepage banners and site logo for Smart Agro Source",
};

export default async function AdminBannersPage() {
  const assets = await getWebsiteAssets();
  const activeBanners = Array.isArray(assets?.homeBanners) && assets.homeBanners.length > 0 
    ? assets.homeBanners 
    : (assets?.homeBanner ? [assets.homeBanner] : []);

  return (
    <BannersClient
      initialLogo={assets?.siteLogo || ""}
      initialBanners={activeBanners}
    />
  );
}
