import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ success: true, deliveryCharges: {} });
    }

    const numericIds = ids
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id) && id > 0);

    if (numericIds.length === 0) {
      return NextResponse.json({ success: true, deliveryCharges: {} });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: numericIds } },
      select: {
        id: true,
        deliveryCharge: true,
      },
    });

    const deliveryCharges = {};
    products.forEach((p) => {
      deliveryCharges[p.id] = p.deliveryCharge !== null && p.deliveryCharge !== undefined
        ? Number(p.deliveryCharge)
        : 0;
    });

    return NextResponse.json({
      success: true,
      deliveryCharges,
    });
  } catch (error) {
    console.error("Error in /api/product-delivery:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch delivery charges' },
      { status: 500 }
    );
  }
}
