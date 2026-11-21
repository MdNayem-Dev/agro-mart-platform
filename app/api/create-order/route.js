import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, phone, address, note, shippingCost, cartItems } = data;

    if (!name || !phone || !address) {
      return NextResponse.json(
        { success: false, message: 'অনুগ্রহ করে নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা প্রদান করুন।' },
        { status: 400 }
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'কার্ট খালি রয়েছে। অনুগ্রহ করে পণ্য যোগ করুন।' },
        { status: 400 }
      );
    }

    let dbDeliveryTotal = 0;
    let validIdSet = new Set();
    if (prospectiveIds.length > 0) {
      try {
        const foundProducts = await prisma.product.findMany({
          where: { id: { in: prospectiveIds } },
          select: { id: true, deliveryCharge: true },
        });
        validIdSet = new Set(foundProducts.map((p) => p.id));
        dbDeliveryTotal = foundProducts.reduce((sum, p) => sum + (Number(p.deliveryCharge) || 0), 0);
      } catch (err) {
        console.warn("Could not verify product IDs in database:", err);
      }
    }

    const shipping = shippingCost !== undefined && shippingCost !== null && !isNaN(parseFloat(shippingCost))
      ? parseFloat(shippingCost)
      : dbDeliveryTotal;
    let subtotal = 0;

    const formattedItems = cartItems.map((item) => {
      const price = parseFloat(item.salePrice ?? item.regularPrice ?? item.price ?? 0);
      const qty = parseInt(item.quantity, 10) || 1;
      const total = price * qty;
      subtotal += total;

      const numId = parseInt(item.id, 10);
      const validProductId = !isNaN(numId) && validIdSet.has(numId) ? numId : null;

      return {
        productId: validProductId,
        name: item.title || item.name || 'Product',
        price: price,
        quantity: qty,
        total: total,
      };
    });

    const totalAmount = subtotal + shipping;

    // Create Order and associated OrderItems in MySQL
    const newOrder = await prisma.order.create({
      data: {
        customerName: String(name).trim(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        note: note ? String(note).trim() : null,
        subtotal: subtotal,
        shippingCost: shipping,
        totalAmount: totalAmount,
        paymentMethod: 'cod',
        status: 'pending',
        items: {
          create: formattedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      message: 'Order placed successfully!',
    });
  } catch (error) {
    console.error('Create Order API Route Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
