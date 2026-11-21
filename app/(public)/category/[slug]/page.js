export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getProductsByCategory } from '@/lib/api';
import FeaturedProducts from '@/components/FeaturedProducts';
import Link from 'next/link';
import { ShoppingBag, ChevronDown, LayoutGrid, List } from 'lucide-react';
import JsonLd from '@/components/JsonLd';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const categoryData = await getProductsByCategory(slug);

  if (!categoryData) {
    return {
      title: 'ক্যাটাগরি পাওয়া যায়নি (Category Not Found)',
      description: 'অনুরোধকৃত ক্যাটাগরিটি Smart Agro Source এ খুঁজে পাওয়া যায়নি।',
      robots: { index: false, follow: true },
    };
  }

  const categoryName = categoryData.categoryName || slug;
  const safeSlug = encodeURIComponent(decodeURIComponent(slug));
  const canonicalUrl = `https://smartagrosource.com/category/${safeSlug}`;
  const description = `${categoryName} এর সেরা মানের সরঞ্জাম ও আধুনিক কৃষি যন্ত্রপাতি সাশ্রয়ী মূল্যে কিনুন Smart Agro Source থেকে। সারাদেশে দ্রুত হোম ডেলিভারি সুবিধা।`;

  return {
    title: `${categoryName} - আধুনিক কৃষি ও খামার পণ্য`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${categoryName} | Smart Agro Source`,
      description,
      url: canonicalUrl,
      siteName: 'Smart Agro Source',
      locale: 'bn_BD',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} | Smart Agro Source`,
      description,
    },
  };
}

export default async function CategoryPage({ params }) {
  // Wait for params in Next.js 15+
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  const categoryData = await getProductsByCategory(slug);
  
  if (!categoryData) {
    return (
      <div className="max-w-[1300px] mx-auto px-4 py-20 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <ShoppingBag size={48} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">ক্যাটাগরিটি খুঁজে পাওয়া যায়নি</h1>
        <Link href="/" className="bg-[#488e14] text-white px-6 py-2 rounded-sm font-bold mt-4 hover:bg-green-700 transition-colors">
          হোম পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  const { categoryName, products } = categoryData;
  const safeSlug = encodeURIComponent(decodeURIComponent(slug));
  const categoryUrl = `https://smartagrosource.com/category/${safeSlug}`;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} - Smart Agro Source`,
    description: `${categoryName} এর সকল পণ্য ও যন্ত্রপাতি`,
    url: categoryUrl,
    mainEntity: {
      '@type': 'ItemList',
      name: categoryName,
      itemListElement: (products || []).map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://smartagrosource.com/product/${encodeURIComponent(decodeURIComponent(item.slug))}`,
        name: item.title,
        image: item.image,
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'হোম',
        item: 'https://smartagrosource.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'সকল ক্যাটাগরি',
        item: 'https://smartagrosource.com/categories',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: categoryUrl,
      },
    ],
  };

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-8">
      {/* Category Collection & Breadcrumb JSON-LD Schemas */}
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbSchema} />
      
      {/* Dynamic Banner Section */}
      {categoryData.categoryBanner ? (
        <div className="w-full mb-8 rounded-2xl overflow-hidden relative shadow-sm border border-gray-100 max-h-[360px] bg-gray-50 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={categoryData.categoryBanner} 
            alt={categoryName}
            className="w-full h-auto max-h-[360px] object-cover"
          />
        </div>
      ) : (
        <div className="w-full mb-8 rounded-2xl overflow-hidden relative bg-green-50/50 border border-green-100 flex items-center justify-between px-6 sm:px-8 py-8 sm:py-10 shadow-sm min-h-[200px]">
          {/* Banner Content */}
          <div className="z-10 relative max-w-[85%] sm:max-w-[65%]">
            <span className="bg-[#e6eedf] text-[#488e14] text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block border border-green-200 shadow-xs">
              {categoryName} এর জন্য সেরা সরঞ্জাম
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
              আধুনিক প্রযুক্তিতে <br /> 
              <span className="text-[#488e14]">সহজ ও দ্রুত উৎপাদন</span>
            </h1>
            <p className="text-gray-600 font-medium text-xs sm:text-sm">
              উন্নত মানের কৃষি সরঞ্জাম এবং খামার সরঞ্জাম এখন আপনার হাতের নাগালে।
            </p>
          </div>
          
          {/* Banner Decorative Elements */}
          <div className="absolute right-0 top-0 bottom-0 w-[50%] bg-gradient-to-l from-[#e6eedf] to-transparent z-0"></div>
          <div className="absolute right-8 sm:right-16 top-1/2 -translate-y-1/2 z-10 hidden md:block">
             <div className="w-28 h-28 lg:w-32 lg:h-32 bg-[#488e14] rounded-full flex flex-col items-center justify-center text-white text-center p-3 lg:p-4 shadow-lg border-4 border-white">
               <span className="font-bold text-xs lg:text-[14px] leading-tight text-white">খামারের<br/>উৎপাদন বাড়ান</span>
             </div>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="max-w-[1300px] mx-auto px-4 py-16 text-center min-h-[40vh] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <ShoppingBag size={48} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।</h2>
          <p className="text-gray-500 mb-6">আমরা শীঘ্রই নতুন পণ্য যোগ করব।</p>
          <Link href="/" className="bg-[#488e14] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm">
            হোম পেজে ফিরে যান
          </Link>
        </div>
      ) : (
        <>
          {/* Filter and Sort Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-gray-100 pb-3 mb-6 gap-4">
        
        {/* Title */}
        <div className="relative w-full md:w-auto">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">ক্যাটাগরি পণ্যসমূহ</h2>
          <div className="absolute -bottom-[14px] left-0 w-1/2 h-[3px] bg-[#488e14]"></div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          
          <button className="hidden md:flex items-center justify-center w-9 h-9 border border-gray-200 rounded-sm text-gray-500 hover:text-[#488e14] hover:bg-green-50 transition-colors">
            <List size={18} />
          </button>
          
          {/* Custom Select / Dropdown */}
          <div className="relative">
            <button className="flex items-center justify-between gap-4 border border-gray-200 rounded-sm px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-w-[140px] focus:outline-none focus:ring-1 focus:ring-[#488e14]">
              জনপ্রিয় পণ্য
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </div>

          <button className="flex items-center justify-center w-9 h-9 bg-[#488e14] border border-[#488e14] rounded-sm text-white shadow-sm ml-2">
            <LayoutGrid size={18} />
          </button>
          
          <button className="flex items-center justify-center w-9 h-9 border border-gray-200 rounded-sm text-gray-500 hover:text-[#488e14] hover:bg-green-50 transition-colors">
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <FeaturedProducts products={products} title={null} />
    </>
  )}
</div>
  );
}
