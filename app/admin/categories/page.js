export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import CategoriesClient from './CategoriesClient';

export const metadata = {
  title: 'Categories | Admin',
};

import categoriesBackup from '@/lib/categoriesBackup.json';

export default async function CategoriesPage() {
  let formattedCategories = [];

  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (categories && categories.length > 0) {
      formattedCategories = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: '',
        image: { src: c.imageUrl || '' },
        image_url: c.imageUrl || '',
        banner_url: c.bannerUrl || '',
        count: c._count?.products || 0,
      }));
    }
  } catch (error) {
    console.error("Notice: Prisma categories unavailable. Using cached backup:", error.message);
  }

  if (formattedCategories.length === 0 && categoriesBackup && categoriesBackup.length > 0) {
    formattedCategories = categoriesBackup;
  }

  return <CategoriesClient initialCategories={formattedCategories} />;
}
