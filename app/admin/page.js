export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export default async function AdminDashboardPage() {
  let safeOrders = [];
  let stats = {
    totalOrders: 0,
    pendingCount: 0,
    processingCount: 0,
    completedCount: 0,
    totalSales: 0,
  };

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      take: 100,
    });

    safeOrders = orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: Number(order.totalAmount),
      date_created: order.createdAt.toISOString(),
      billing: {
        first_name: order.customerName,
        phone: order.phone,
        address_1: order.address,
      },
      line_items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        total: Number(item.total).toString(),
      })),
    }));

    let totalSales = 0;
    let pendingCount = 0;
    let processingCount = 0;
    let completedCount = 0;

    orders.forEach((order) => {
      if (order.status === 'pending') pendingCount++;
      if (order.status === 'processing') processingCount++;
      if (order.status === 'completed') {
        completedCount++;
        totalSales += Number(order.totalAmount || 0);
      }
    });

    stats = {
      totalOrders: orders.length,
      pendingCount,
      processingCount,
      completedCount,
      totalSales,
    };
  } catch (error) {
    console.error('Failed to load admin dashboard stats from Prisma:', error);
  }

  return <DashboardClient stats={stats} initialOrders={safeOrders.slice(0, 50)} />;
}
