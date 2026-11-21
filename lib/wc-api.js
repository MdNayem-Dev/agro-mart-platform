const WC_KEY = process.env.WC_CONSUMER_KEY || 'ck_bbc884c3a140ce85043d542123154ee16e7b76b7';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || 'cs_402b14d488c319d4b98c064903153a5165473caf';
const WP_URL = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://api.smartagrosource.com/graphql').replace('/graphql', '');

export async function fetchWooCommerceAPI(endpoint, method = 'GET', body = null, customOptions = {}) {
  const url = `${WP_URL}/wp-json/wc/v3/${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')}`
  };

  const options = {
    method,
    headers,
    ...customOptions
  };

  if (method === 'GET' && !customOptions.cache && !customOptions.next) {
    let tag = 'wc-api';
    if (endpoint.startsWith('orders')) tag = 'wc-orders';
    else if (endpoint.startsWith('products/categories')) tag = 'wc-categories';
    else if (endpoint.startsWith('products')) tag = 'wc-products';

    options.next = {
      revalidate: 15,
      tags: ['wc-api', tag]
    };
  } else if (method !== 'GET' && !customOptions.cache) {
    options.cache = 'no-store';
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`WooCommerce API Error (${endpoint}):`, error);
    return null;
  }
}

export async function getOrders() {
  const data = await fetchWooCommerceAPI('orders?per_page=50');
  return Array.isArray(data) ? data : [];
}

export async function getProducts() {
  const data = await fetchWooCommerceAPI('products?per_page=50');
  return Array.isArray(data) ? data : [];
}

export async function getProductBySlugWC(slug) {
  const products = await fetchWooCommerceAPI(`products?slug=${slug}`);
  return products && products.length > 0 ? products[0] : null;
}

export async function getRelatedProductsWC(categoryId, currentProductId) {
  const products = await fetchWooCommerceAPI(`products?category=${categoryId}&per_page=5`);
  if (!products || !Array.isArray(products)) return [];
  // Filter out the current product and return up to 4
  return products.filter(p => p.id !== currentProductId).slice(0, 4);
}

export function calculateStatsFromOrders(orders) {
  if (!orders || !Array.isArray(orders)) {
    return {
      totalOrders: 0,
      pendingCount: 0,
      processingCount: 0,
      completedCount: 0,
      totalSales: 0
    };
  }

  let totalSales = 0;
  let pendingCount = 0;
  let processingCount = 0;
  let completedCount = 0;

  orders.forEach(order => {
    if (order.status === 'pending') pendingCount++;
    if (order.status === 'processing') processingCount++;
    if (order.status === 'completed') {
      completedCount++;
      totalSales += parseFloat(order.total || 0);
    }
  });

  return {
    totalOrders: orders.length,
    pendingCount,
    processingCount,
    completedCount,
    totalSales
  };
}

export async function getDashboardStats() {
  const orders = await fetchWooCommerceAPI('orders?per_page=100');
  return calculateStatsFromOrders(orders);
}

export async function getStorefrontProducts() {
  try {
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default || prismaModule.prisma;
    const dbProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (dbProducts && Array.isArray(dbProducts)) {
      return dbProducts.map(node => {
        const reg = Number(node.regularPrice) || 0;
        const sale = node.salePrice ? Number(node.salePrice) : reg;

        return {
          id: node.id,
          title: node.name || 'Product',
          slug: node.slug || '',
          image: node.imageUrl || "https://placehold.co/300x300/f3f4f6/333333?text=No+Image",
          regularPrice: reg,
          salePrice: sale,
          deliveryCharge: node.deliveryCharge ? Number(node.deliveryCharge) : 0,
          stockStatus: node.stockStatus || 'instock',
          stockQuantity: node.stockQuantity ?? 0,
          displaySection: node.displaySection || 'both',
          dateCreated: node.createdAt,
        };
      });
    }
    return [];
  } catch (dbErr) {
    console.error("Prisma query in getStorefrontProducts error:", dbErr?.message);
    return [];
  }
}
