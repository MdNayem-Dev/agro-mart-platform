export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import OrdersClient from './OrdersClient';
import { Suspense } from 'react';

export const metadata = {
  title: 'Orders | Admin',
};

export default async function AdminOrdersPage() {
  let safeOrders = [];

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
      subtotal: Number(order.subtotal),
      shipping_total: Number(order.shippingCost),
      date_created: order.createdAt.toISOString(),
      customer_note: order.note || '',
      billing: {
        first_name: order.customerName,
        last_name: '',
        phone: order.phone,
        email: '',
        address_1: order.address,
      },
      shipping: {
        first_name: order.customerName,
        address_1: order.address,
      },
      shipping_lines: [
        {
          method_title: 'Home Delivery',
          total: Number(order.shippingCost).toString(),
        },
      ],
      line_items: order.items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        total: Number(item.total).toString(),
      })),
    }));
  } catch (error) {
    console.error('Failed to fetch admin orders from Prisma:', error);
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading orders...</div>}>
      <OrdersClient initialOrders={safeOrders} />
    </Suspense>
  );
}
