import { getAllProductsForSitemap, getAllCategoriesForSitemap } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const baseUrl = 'https://smartagrosource.com';
  const now = new Date();

  // 1. Static high-value routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/page/about-us`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/page/solutions`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/page/how-to-order`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/page/delivery-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/page/terms-and-conditions`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/page/refund-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/page/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Dynamic Categories
  let categoryRoutes = [];
  try {
    const categories = await Promise.race([
      getAllCategoriesForSitemap(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
    ]).catch(() => []);
    categoryRoutes = (categories || []).map((cat) => {
      const safeSlug = encodeURIComponent(decodeURIComponent(cat.slug));
      return {
        url: `${baseUrl}/category/${safeSlug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });
  } catch (error) {
    console.warn('Categories sitemap fallback:', error?.message);
  }

  // 3. Dynamic Products
  let productRoutes = [];
  try {
    const products = await Promise.race([
      getAllProductsForSitemap(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
    ]).catch(() => []);
    productRoutes = (products || []).map((product) => {
      const safeSlug = encodeURIComponent(decodeURIComponent(product.slug));
      return {
        url: `${baseUrl}/product/${safeSlug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
        changeFrequency: 'daily',
        priority: 0.8,
      };
    });
  } catch (error) {
    console.warn('Products sitemap fallback:', error?.message);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
