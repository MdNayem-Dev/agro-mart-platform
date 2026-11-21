import prisma from '@/lib/prisma';
import productsBackup from '@/lib/productsBackup.json';
import categoriesBackup from '@/lib/categoriesBackup.json';

/**
 * Legacy stub for any remaining GraphQL callers
 */
export async function fetchAPI(query, { variables } = {}) {
  console.warn("fetchAPI (WPGraphQL) called after MySQL migration. Please migrate caller to Prisma.");
  return null;
}

/**
 * Fetch latest 12 products for homepage / widgets
 */
export async function getLatestProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
    });

    if (products && products.length > 0) {
      return products.map((p) => {
        const reg = Number(p.regularPrice) || 0;
        const sale = p.salePrice ? Number(p.salePrice) : reg;

        return {
          id: p.id,
          title: p.name,
          slug: p.slug,
          image: p.imageUrl || "https://placehold.co/300x300/f3f4f6/333333?text=No+Image",
          regularPrice: reg,
          salePrice: sale,
          deliveryCharge: p.deliveryCharge ? Number(p.deliveryCharge) : 0,
          stockStatus: p.stockStatus || 'instock',
          stockQuantity: p.stockQuantity ?? 0,
        };
      });
    }
  } catch (error) {
    console.error("Notice: Prisma latest products unavailable, using cached backup:", error.message);
  }

  return productsBackup.slice(0, 12).map((p) => ({
    id: p.id,
    title: p.name,
    slug: p.slug,
    image: p.images?.[0]?.src || "https://placehold.co/300x300/f3f4f6/333333?text=No+Image",
    regularPrice: p.regular_price || p.price,
    salePrice: p.sale_price || p.regular_price,
    deliveryCharge: p.delivery_charge || 0,
    stockStatus: p.stock_status || p.stockStatus || 'instock',
    stockQuantity: p.stock_quantity ?? p.stockQuantity ?? 0,
  }));
}

/**
 * Fetch all products up to specified limit
 */
export async function getAllProducts(limit = 60) {
  try {
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    if (products && products.length > 0) {
      return products.map((p) => {
        const reg = Number(p.regularPrice) || 0;
        const sale = p.salePrice ? Number(p.salePrice) : reg;

        return {
          id: p.id,
          title: p.name,
          slug: p.slug,
          image: p.imageUrl || "https://placehold.co/300x300/f3f4f6/333333?text=No+Image",
          regularPrice: reg,
          salePrice: sale,
          deliveryCharge: p.deliveryCharge ? Number(p.deliveryCharge) : 0,
          stockStatus: p.stockStatus || 'instock',
          stockQuantity: p.stockQuantity ?? 0,
        };
      });
    }
  } catch (error) {
    console.error("Notice: Prisma getAllProducts unavailable, using cached backup:", error.message);
  }

  return productsBackup.slice(0, limit).map((p) => ({
    id: p.id,
    title: p.name,
    slug: p.slug,
    image: p.images?.[0]?.src || "https://placehold.co/300x300/f3f4f6/333333?text=No+Image",
    regularPrice: p.regular_price || p.price,
    salePrice: p.sale_price || p.regular_price,
    deliveryCharge: p.delivery_charge || 0,
    stockStatus: p.stock_status || p.stockStatus || 'instock',
    stockQuantity: p.stock_quantity ?? p.stockQuantity ?? 0,
  }));
}

/**
 * Fetch single product by slug with category and related products
 */
export async function getProductBySlug(slug) {
  const decodedSlug = (() => {
    try { return decodeURIComponent(slug); } catch { return slug; }
  })();

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { slug: decodedSlug },
        ],
      },
      include: {
        category: true,
      },
    });

    if (product) {
      const reg = Number(product.regularPrice) || 0;
      const sale = product.salePrice ? Number(product.salePrice) : reg;

      // Fetch related products from the same category
      let relatedProducts = [];
      if (product.categoryId) {
        const related = await prisma.product.findMany({
          where: {
            categoryId: product.categoryId,
            id: { not: product.id },
          },
          take: 4,
          orderBy: { createdAt: 'desc' },
        });

        relatedProducts = related.map((r) => {
          const rReg = Number(r.regularPrice) || 0;
          const rSale = r.salePrice ? Number(r.salePrice) : rReg;
          return {
            id: r.id,
            title: r.name,
            slug: r.slug,
            image: r.imageUrl || "https://placehold.co/400x400/eeeeee/aaaaaa?text=No+Image",
            regularPrice: rReg,
            salePrice: rSale,
            deliveryCharge: r.deliveryCharge ? Number(r.deliveryCharge) : 0,
            stockStatus: r.stockStatus || 'instock',
            stockQuantity: r.stockQuantity ?? 0,
          };
        });
      }

      // Parse gallery images if stored as JSON
      let gallery = [];
      if (product.galleryImages) {
        try {
          gallery = JSON.parse(product.galleryImages);
        } catch {
          gallery = [product.galleryImages];
        }
      }

      return {
        id: product.id,
        title: product.name,
        slug: product.slug,
        description: product.fullDescription || '',
        shortDescription: product.shortDescription || '',
        image: product.imageUrl || "https://placehold.co/600x600/f3f4f6/333333?text=No+Image",
        gallery: Array.isArray(gallery) ? gallery : [],
        regularPrice: reg,
        salePrice: sale,
        deliveryCharge: product.deliveryCharge ? Number(product.deliveryCharge) : 0,
        stockStatus: product.stockStatus || 'instock',
        stockQuantity: product.stockQuantity ?? 0,
        youtubeUrl: product.youtubeUrl || null,
        relatedProducts,
      };
    }
  } catch (error) {
    console.error("Notice: Prisma product fetch unavailable, falling back to cached backup:", error.message);
  }

  // Fallback to offline cached product
  const fallback = productsBackup.find(
    (p) => p.slug === slug || p.slug === decodedSlug || String(p.id) === slug
  );

  if (fallback) {
    const reg = Number(fallback.regular_price || fallback.price) || 0;
    const sale = Number(fallback.sale_price || fallback.regular_price || fallback.price) || reg;
    return {
      id: fallback.id,
      title: fallback.name,
      slug: fallback.slug,
      description: fallback.description || fallback.short_description || '',
      shortDescription: fallback.short_description || '',
      image: fallback.images?.[0]?.src || "https://placehold.co/600x600/f3f4f6/333333?text=No+Image",
      gallery: fallback.images?.map((i) => i.src) || [],
      regularPrice: reg,
      salePrice: sale,
      deliveryCharge: fallback.delivery_charge ? Number(fallback.delivery_charge) : 0,
      stockStatus: fallback.stock_status || fallback.stockStatus || 'instock',
      stockQuantity: fallback.stock_quantity ?? fallback.stockQuantity ?? 0,
      youtubeUrl: fallback.meta_data?.find((m) => m.key === 'youtube_video_url')?.value || null,
      relatedProducts: [],
    };
  }

  return null;
}

/**
 * Fetch category and its associated products by slug
 */
export async function getProductsByCategory(slug) {
  try {
    const decodedSlug = (() => {
      try { return decodeURIComponent(slug); } catch { return slug; }
    })();

    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: slug },
          { slug: decodedSlug },
        ],
      },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!category) return null;

    const products = category.products.map((node) => {
      const reg = Number(node.regularPrice) || 0;
      const sale = node.salePrice ? Number(node.salePrice) : reg;

      return {
        id: node.id,
        title: node.name,
        slug: node.slug,
        image: node.imageUrl || "https://placehold.co/600x600/f3f4f6/333333?text=No+Image",
        regularPrice: reg,
        salePrice: sale,
        deliveryCharge: node.deliveryCharge ? Number(node.deliveryCharge) : 0,
        stockStatus: node.stockStatus || 'instock',
        stockQuantity: node.stockQuantity ?? 0,
      };
    });

    return {
      categoryName: category.name,
      categoryBanner: category.bannerUrl || null,
      products,
    };
  } catch (error) {
    console.error("Error in getProductsByCategory from Prisma:", error);
    return null;
  }
}

/**
 * Fetch all categories with product counts
 */
export async function getProductCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    if (categories && categories.length > 0) {
      return categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat._count?.products || 0,
        image: cat.imageUrl || "https://placehold.co/150x150/f3f4f6/333333?text=Category",
        banner: cat.bannerUrl || null,
      }));
    }
  } catch (error) {
    console.error("Notice: Prisma categories unavailable, using cached backup:", error.message);
  }

  return categoriesBackup.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    count: cat.count || 0,
    image: cat.image_url || "https://placehold.co/150x150/f3f4f6/333333?text=Category",
    banner: cat.banner_url || null,
  }));
}

/**
 * Fetch website assets (Logo, Banners, Title, Description)
 */
export async function getWebsiteAssets() {
  const defaultAssets = {
    title: 'Smart Agro Source',
    description: 'কৃষি ও খামার শিল্পের বিশ্বস্ত নাম',
    siteLogo: "https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png",
    homeBanner: null,
    homeBanners: [],
  };

  try {
    const brandingSetting = await prisma.setting.findUnique({
      where: { key: 'branding' },
    });

    if (!brandingSetting?.value) return defaultAssets;

    let parsed = {};
    try {
      parsed = JSON.parse(brandingSetting.value);
    } catch {
      return defaultAssets;
    }

    const homeBanners = Array.isArray(parsed.banners) ? parsed.banners : [];
    const homeBanner = homeBanners[0] || parsed.homeBanner || null;

    return {
      title: parsed.title || defaultAssets.title,
      description: parsed.description || defaultAssets.description,
      siteLogo: parsed.logo || defaultAssets.siteLogo,
      homeBanner,
      homeBanners,
    };
  } catch (error) {
    console.error("Error fetching website assets from Prisma:", error);
    return defaultAssets;
  }
}

/**
 * Search products by keyword
 */
export async function searchProducts(searchTerm) {
  if (!searchTerm || !searchTerm.trim()) return [];

  try {
    const term = searchTerm.trim();
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: term } },
          { slug: { contains: term } },
        ],
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => {
      const reg = Number(p.regularPrice) || 0;
      const sale = p.salePrice ? Number(p.salePrice) : reg;

      return {
        id: p.id,
        title: p.name,
        slug: p.slug,
        image: p.imageUrl || "https://placehold.co/100x100/f3f4f6/333333?text=Product",
        price: sale,
        regularPrice: reg,
        salePrice: sale,
        stockStatus: p.stockStatus || 'instock',
        stockQuantity: p.stockQuantity ?? 0,
      };
    });
  } catch (error) {
    console.error("Error searching products from Prisma:", error);
    return [];
  }
}

/**
 * Sitemap generators
 */
export async function getAllProductsForSitemap() {
  try {
    const products = await prisma.product.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      take: 100,
    });

    return products.map((p) => ({
      slug: p.slug,
      modified: p.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    return [];
  }
}

export async function getAllCategoriesForSitemap() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
      },
      take: 100,
    });

    return categories.map((c) => ({
      slug: c.slug,
    }));
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}
