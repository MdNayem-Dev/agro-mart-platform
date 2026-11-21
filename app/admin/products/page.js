export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import ProductsClient from './ProductsClient';
import { Suspense } from 'react';

export const metadata = {
  title: 'Products | Admin',
};

import productsBackup from '@/lib/productsBackup.json';
import categoriesBackup from '@/lib/categoriesBackup.json';

export default async function AdminProductsPage() {
  let safeProducts = [];
  let safeCategories = [];

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    if (products && products.length > 0) {
      safeProducts = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        regular_price: Number(p.regularPrice),
        price: Number(p.regularPrice),
        sale_price: p.salePrice ? Number(p.salePrice) : '',
        short_description: p.shortDescription || '',
        description: p.fullDescription || '',
        images: p.imageUrl ? [{ src: p.imageUrl }] : [],
        categories: p.category ? [{ id: p.category.id, name: p.category.name }] : [],
        meta_data: [
          { key: 'youtube_video_url', value: p.youtubeUrl || '' },
          { key: 'display_section', value: p.displaySection || 'both' },
        ],
        display_section: p.displaySection,
        is_popular: p.isPopular,
        delivery_charge: p.deliveryCharge ? Number(p.deliveryCharge) : 0,
        stock_status: p.stockStatus || 'instock',
        stock_quantity: p.stockQuantity ?? 0,
      }));
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    if (categories && categories.length > 0) {
      safeCategories = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }));
    }
  } catch (error) {
    console.error("Notice: Prisma product fetch unavailable (rate limit/reconnecting). Using cached backup:", error.message);
  }

  // Fallback to offline cached products if DB rate limit was hit
  if (safeProducts.length === 0 && productsBackup && productsBackup.length > 0) {
    safeProducts = productsBackup;
  }

  if (safeCategories.length === 0 && categoriesBackup && categoriesBackup.length > 0) {
    safeCategories = categoriesBackup.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }));
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading products...</div>}>
      <ProductsClient initialProducts={safeProducts} initialCategories={safeCategories} />
    </Suspense>
  );
}
