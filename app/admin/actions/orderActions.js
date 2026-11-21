"use server";

import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateOrderStatusAction(orderId, newStatus) {
  try {
    const numericId = parseInt(orderId, 10);
    if (!numericId) throw new Error('Invalid order ID');

    let finalStatus = newStatus;
    if (newStatus === 'approved') finalStatus = 'completed';
    if (newStatus === 'rejected') finalStatus = 'cancelled';

    const updatedOrder = await prisma.order.update({
      where: { id: numericId },
      data: { status: finalStatus },
      include: { items: true },
    });

    try {
      revalidateTag('wc-orders');
      revalidateTag('wc-api');
    } catch {}

    revalidatePath('/admin/orders');
    revalidatePath('/admin');

    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("Failed to update order status in Prisma:", error);
    return { success: false, error: error.message || 'অর্ডার স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।' };
  }
}

export async function deleteOrderAction(orderId) {
  try {
    const numericId = parseInt(orderId, 10);
    if (!numericId) throw new Error('Invalid order ID');

    await prisma.order.delete({
      where: { id: numericId },
    });

    try {
      revalidateTag('wc-orders');
      revalidateTag('wc-api');
    } catch {}

    revalidatePath('/admin/orders');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error("Failed to delete order in Prisma:", error);
    return { success: false, error: error.message || 'অর্ডার মুছতে সমস্যা হয়েছে।' };
  }
}

export async function getRecentNotificationsAction() {
  try {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return orders.map((order) => {
      const customerName = order.customerName || 'Customer';
      const itemsCount = order.items?.length || 1;
      const firstItem = order.items?.[0]?.name || 'Product';

      return {
        id: order.id,
        title: order.status === 'pending' ? 'New order received!' : `Order #${order.id} (${order.status})`,
        message: `Order #${order.id} from ${customerName} (${firstItem}${itemsCount > 1 ? ` +${itemsCount - 1} more` : ''})`,
        status: order.status,
        date_created: order.createdAt.toISOString(),
        total: Number(order.totalAmount),
        customer: customerName,
      };
    });
  } catch (error) {
    console.error("Failed to fetch notifications from Prisma:", error);
    return [];
  }
}
