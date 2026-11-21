export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { ShoppingCart, Phone, Search, Smartphone } from 'lucide-react';
import Link from 'next/link';
import AddToCartButtons from '@/components/AddToCartButtons';
import RelatedProducts from '@/components/RelatedProducts';
import JsonLd from '@/components/JsonLd';
import { getProductBySlug } from '@/lib/api';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'পণ্যটি পাওয়া যায়নি (Product Not Found)',
      description: 'অনুরোধকৃত পণ্যটি Smart Agro Source এ খুঁজে পাওয়া যায়নি।',
      robots: { index: false, follow: true },
    };
  }

  const cleanDesc = stripHtml(product.shortDescription || product.description) ||
    `${product.title} - সেরা মানের কৃষি ও খামার যন্ত্রপাতি কিনুন সাশ্রয়ী মূল্যে Smart Agro Source থেকে। সারাদেশে দ্রুত হোম ডেলিভারি সুবিধা।`;
  const metaDescription = cleanDesc.slice(0, 160);

  const safeSlug = encodeURIComponent(decodeURIComponent(slug));
  const canonicalUrl = `https://smartagrosource.com/product/${safeSlug}`;

  const images = [];
  if (product.image) images.push(product.image);
  if (Array.isArray(product.gallery)) {
    product.gallery.forEach((img) => {
      if (img && !images.includes(img)) images.push(img);
    });
  }

  return {
    title: `${product.title} - দাম ও বিস্তারিত`,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.title} | Smart Agro Source`,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'Smart Agro Source',
      locale: 'bn_BD',
      type: 'article',
      images: images.map((img) => ({
        url: img,
        alt: product.title,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Smart Agro Source`,
      description: metaDescription,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductDetailsPage({ params }) {
  // Wait for params in Next.js 15+ (App Router standard for dynamic params)
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  // Single fast GraphQL query that fetches product, video metadata and related products
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <div className="max-w-[1300px] mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Product Not Found</h1>
        <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  const youtubeUrl = product.youtubeUrl || null;
  const relatedProducts = product.relatedProducts || [];

  const safeSlug = encodeURIComponent(decodeURIComponent(slug));
  const productUrl = `https://smartagrosource.com/product/${safeSlug}`;
  const cleanDesc = stripHtml(product.shortDescription || product.description);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.gallery?.length ? [product.image, ...product.gallery] : [product.image],
    description: cleanDesc || product.title,
    sku: `SAS-${product.id}`,
    mpn: `SAS-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Smart Agro Source',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BDT',
      price: (product.salePrice || product.regularPrice || 0).toString(),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: (String(product.stockStatus || '').toLowerCase().trim() === 'outofstock')
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Smart Agro Source',
        url: 'https://smartagrosource.com',
      },
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
        name: product.title,
        item: productUrl,
      },
    ],
  };

  // Extract YouTube video ID
  let youtubeId = null;
  if (youtubeUrl) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    if (match && match[2].length === 11) {
      youtubeId = match[2];
    }
  }

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-8">
      {/* Product & Breadcrumb JSON-LD Schemas */}
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />

      
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* Left Column: Image Area */}
        <div className="relative border border-gray-200 bg-white p-4 group cursor-zoom-in overflow-hidden">
          {/* Zoom Icon */}
          <div className="absolute top-4 right-4 bg-white text-gray-700 w-8 h-8 rounded-full shadow-sm z-10 flex items-center justify-center">
            <Search size={16} />
          </div>

          <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-125 transition-transform duration-500 origin-center mix-blend-multiply"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>

        {/* Right Column: Product Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {product.title}
          </h1>
          <p className="text-gray-600 italic text-sm mb-4">
            * সেরা মানের পণ্য, সাশ্রয়ী মূল্যে!
          </p>

          {product.shortDescription && (
            <div 
              className="text-gray-700 product-rich-description mb-6 leading-relaxed text-[15px] break-words overflow-hidden"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          {(() => {
            const stockQty = (product.stockQuantity !== null && product.stockQuantity !== undefined && product.stockQuantity !== '')
              ? Number(product.stockQuantity)
              : null;
            const statusStr = String(product.stockStatus || '').toLowerCase().trim();
            const isOutOfStock = statusStr === 'outofstock' || statusStr === 'out_of_stock' || statusStr === 'out of stock';
            const hasSpecificQuantity = !isOutOfStock && stockQty !== null && stockQty > 0;

            return (
              <>
                <div className="flex flex-col gap-3 mb-6 pb-5 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {product.regularPrice > product.salePrice && (
                        <span className="text-gray-400 line-through text-lg">৳ {product.regularPrice.toLocaleString()}</span>
                      )}
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#488e14] product-price-bold">৳ {product.salePrice.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Delivery Charge Badge */}
                      <span className={`text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-lg border ${
                        (product.deliveryCharge || 0) > 0
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-[#488e14] border-emerald-200'
                      }`}>
                        🚚 ডেলিভারি: {(product.deliveryCharge || 0) > 0 ? `৳${Number(product.deliveryCharge).toLocaleString()}` : 'ফ্রি'}
                      </span>

                      {/* Stock Status Badge */}
                      {isOutOfStock ? (
                        <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-lg border bg-rose-50 text-rose-700 border-rose-200 inline-flex items-center gap-1.5 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          ❌ স্টক শেষ (Out of Stock)
                        </span>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-lg border bg-emerald-50 text-[#2d6b0b] border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          {hasSpecificQuantity ? (
                            <span>✅ স্টকে আছে: <strong className="text-gray-900 font-black">{stockQty}</strong> পিস</span>
                          ) : (
                            <span>✅ ইন স্টক</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Low Stock Alert */}
                  {hasSpecificQuantity && stockQty <= 15 && (
                    <div className="w-full flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-amber-900 bg-amber-50/90 border border-amber-200 px-3.5 py-2 rounded-xl shadow-2xs">
                      <span className="inline-block animate-bounce text-base">⚡</span>
                      <span>তাড়াতাড়ি অর্ডার করুন! মাত্র <strong className="font-extrabold text-amber-950 underline decoration-amber-400">{stockQty} পিস</strong> পণ্য স্টকে অবশিষ্ট আছে</span>
                    </div>
                  )}
                </div>

                <AddToCartButtons product={{ ...product, stockQuantity: stockQty, stockStatus: isOutOfStock ? 'outofstock' : 'instock' }} />
              </>
            );
          })()}
        </div>

      </div>

      {/* Middle Section: Info & Video */}
      <div className="w-full max-w-4xl mx-auto">
        
        {youtubeId && (
          <div className="w-full aspect-video bg-gray-900 mb-8 rounded-xl overflow-hidden relative shadow-md">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#488e14] inline-block">
          পণ্যটি সম্পর্কে কিছু তথ্য -
        </h2>

        <div 
          className="border border-[#488e14] p-6 rounded-xl bg-white text-gray-800 product-rich-description text-[15px] leading-relaxed break-words overflow-hidden shadow-xs"
          dangerouslySetInnerHTML={{ __html: product.description || '<p>কোনো বর্ণনা দেওয়া নেই।</p>' }}
        />
      </div>

      {/* Phone Order & Delivery Info Section */}
      <div className="w-full max-w-4xl mx-auto mt-12 mb-12 flex flex-col items-center">
        <div className="flex flex-col items-center text-[#488e14] mb-6">
          <Smartphone size={32} className="mb-2" />
          <p className="text-lg mb-1">ফোনে অর্ডার করতে কল করুন</p>
          <a href="tel:+8801601471471" className="text-xl font-bold hover:underline cursor-pointer">
            +880 1601-471471
          </a>
        </div>

        <div className="w-full border-2 border-[#b2e59e] p-8 bg-white shadow-sm">
          <ul className="list-disc pl-5 space-y-2 text-gray-700 text-[15px] leading-relaxed font-medium">
            <li>ঢাকা মেট্রো এরিয়ার মধ্যে ফুল ক্যাশ অন ডেলিভারীতে পণ্য অর্ডার করতে পারবেন। (হোম ডেলিভারী)</li>
            <li>আমরা সারা বাংলাদেশ হোম ডেলিভারীতে পণ্য ডেলিভারী করি সুতরাং পণ্য গ্রহণ করার সময় চেক করে নিতে পারবেন।</li>
            <li>অর্ডার করা পণ্য ডেলিভারীর পর এক্সচেঞ্জ করতে চাইলে অবশ্যই পণ্য গ্রহণ করার ২৪ ঘন্টার মধ্যে আমাদের কল করে অবগত করবেন।</li>
          </ul>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}

    </div>
  );
}
