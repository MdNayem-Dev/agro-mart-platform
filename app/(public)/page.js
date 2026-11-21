export const dynamic = 'force-dynamic';
export const revalidate = 0;
import Hero from '@/components/Hero';
import CategorySlider from '@/components/CategorySlider';
import FeaturedProducts from '@/components/FeaturedProducts';
import TrustBadges from '@/components/TrustBadges';
import FaqSection from '@/components/FaqSection';
import AllProductsSection from '@/components/AllProductsSection';
import { getLatestProducts, getAllProducts, getWebsiteAssets } from '@/lib/api';
import { getStorefrontProducts } from '@/lib/wc-api';
import { getFaqData } from '@/lib/faq';
import { getTrustServicesData } from '@/lib/trustServices';

export const metadata = {
  title: {
    absolute: 'Smart Agro Source - স্মার্ট কৃষি, সমৃদ্ধ আগামী | আধুনিক কৃষি ও খামার যন্ত্রপাতি',
  },
  description: 'Smart Agro Source (স্মার্ট এগ্রো সোর্স) - বাংলাদেশে আধুনিক কৃষি ও ডেইরি/পোল্ট্রি খামার যন্ত্রপাতির বিশ্বস্ত অনলাইন শপ। সাশ্রয়ী মূল্যে সেরা মানের এগ্রো পণ্য, স্পেয়ার পার্টস ও নির্ভরযোগ্য ডেলিভারি সেবা।',
  alternates: {
    canonical: 'https://smartagrosource.com',
  },
  openGraph: {
    title: 'Smart Agro Source - স্মার্ট কৃষি, সমৃদ্ধ আগামী | আধুনিক কৃষি ও খামার যন্ত্রপাতি',
    description: 'বাংলাদেশে আধুনিক কৃষি ও ডেইরি/পোল্ট্রি খামার যন্ত্রপাতির বিশ্বস্ত অনলাইন শপ। সুলভ মূল্যে উন্নত মানের আধুনিক যন্ত্রপাতি ও নির্ভরযোগ্য সেবা।',
    url: 'https://smartagrosource.com',
    siteName: 'Smart Agro Source',
    images: [
      {
        url: 'https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png',
        width: 800,
        height: 400,
        alt: 'Smart Agro Source Logo',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
};

export default async function Home() {
  let popularProducts = [];
  let allSectionProducts = [];
  let siteAssets = null;
  let faqData = null;
  let trustServicesData = null;

  try {
    const [wcProducts, assets, faq, trustServices] = await Promise.all([
      getStorefrontProducts().catch(() => null),
      getWebsiteAssets().catch(() => null),
      getFaqData().catch(() => null),
      getTrustServicesData().catch(() => null)
    ]);
    siteAssets = assets;
    faqData = faq;
    trustServicesData = trustServices;

    if (wcProducts && Array.isArray(wcProducts) && wcProducts.length > 0) {
      popularProducts = wcProducts.filter(p => p.displaySection === 'popular' || p.displaySection === 'both');
      allSectionProducts = wcProducts.filter(p => p.displaySection === 'all' || p.displaySection === 'both');
    }
  } catch (err) {
    console.error("Storefront WC API loading error:", err);
  }

  // Fallback to GraphQL if WC products are empty or encountered an error
  if (!popularProducts.length || !allSectionProducts.length) {
    try {
      const [products, allProducts] = await Promise.all([
        getLatestProducts().catch(() => []),
        getAllProducts(60).catch(() => [])
      ]);
      if (!popularProducts.length) {
        popularProducts = products || [];
      }
      if (!allSectionProducts.length) {
        allSectionProducts = allProducts && allProducts.length > 0 ? allProducts : (products || []);
      }
    } catch (err) {
      console.error("Storefront GraphQL fallback error:", err);
    }
  }

  return (
    <div className="max-w-[1300px] w-full mx-auto bg-white shadow-sm overflow-hidden">
      <div className="w-full flex flex-col gap-4 sm:gap-5">
        <Hero homeBanner={siteAssets?.homeBanner} homeBanners={siteAssets?.homeBanners} />
        
        <div className="px-3 sm:px-4 w-full flex flex-col gap-4 sm:gap-5">
          <CategorySlider />
          
          <FeaturedProducts products={popularProducts} />
        </div>
      </div>

      {/* Full width section below main content */}
      <div className="mt-2 sm:mt-3">
        <TrustBadges initialData={trustServicesData} />
      </div>

      {/* All Products (সকল পণ্য) Section */}
      <div>
        <AllProductsSection products={allSectionProducts} />
      </div>

      {/* Frequently Asked Questions (FAQ) Section - Placed right above Footer */}
      <div>
        <FaqSection initialData={faqData} />
      </div>
    </div>
  );
}
