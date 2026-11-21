export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';
import PrintButton from '@/components/PrintButton';

export const metadata = {
  title: 'অর্ডার সম্পন্ন হয়েছে (Order Confirmed)',
  robots: {
    index: false,
    follow: false,
  },
};

// Server-side order fetching function from Prisma
async function getOrderData(orderId) {
  if (!orderId || orderId === 'N/A') return null;
  const numericId = parseInt(orderId, 10);
  if (isNaN(numericId)) return null;

  try {
    const order = await prisma.order.findUnique({
      where: { id: numericId },
      include: { items: true },
    });

    if (!order) return null;

    return {
      id: order.id,
      status: order.status,
      payment_method_title: 'Cash on Delivery (ক্যাশ অন ডেলিভারি)',
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
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total),
      })),
      shipping_lines: [
        {
          total: Number(order.shippingCost),
        },
      ],
    };
  } catch (error) {
    console.error('Failed to get order data from Prisma:', error);
    return null;
  }
}

export default async function OrderSuccessPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams?.orderId || 'N/A';

  const order = await getOrderData(orderId);

  const orderDate = order ? new Date(order.date_created).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('bn-BD');

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 print:py-0 print:px-0 print:bg-white">
      {/* Success Header - Hidden on Print */}
      <div className="text-center mb-8 print:hidden">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ধন্যবাদ!</h1>
        <p className="text-gray-600 text-lg">আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।</p>
      </div>

      {/* Invoice Card - Visible on Print */}
      <div className="bg-white w-full max-w-[800px] border border-gray-200 rounded-sm shadow-sm overflow-hidden print:shadow-none print:border-none print:max-w-full">
        <div className="p-8 print:p-0">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6 mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#488e14] tracking-tight">Smart Agro Source</h2>
              <p className="text-gray-500 text-sm mt-1">কৃষি ও খামার শিল্পের বিশ্বস্ত নাম</p>
              <p className="text-gray-500 text-sm mt-1">হেল্পলাইন: +880 1601-471471</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800 tracking-wider">INVOICE</p>
              <p className="text-sm font-semibold text-gray-600 mt-2">অর্ডার আইডি: <span className="text-[#488e14]">#{orderId}</span></p>
              <p className="text-sm font-semibold text-gray-600">তারিখ: <span className="font-normal text-gray-800">{orderDate}</span></p>
            </div>
          </div>

          {/* Customer Details */}
          {order && (
            <div className="flex justify-between mb-8 text-sm border-b border-gray-100 pb-6">
              <div className="w-1/2 pr-4">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-2 text-xs">বিল টু (Bill To):</p>
                <p className="font-bold text-gray-800 text-base">{order.billing.first_name}</p>
                <p className="text-gray-600 mt-1">{order.billing.address_1}</p>
                <p className="text-gray-600 mt-1">ফোন: {order.billing.phone}</p>
              </div>
              <div className="w-1/2 text-right pl-4">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-2 text-xs">স্ট্যাটাস:</p>
                <p className="font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-sm inline-block border border-orange-100 print:border-orange-200 uppercase text-xs">
                  {order.status === 'processing' ? 'প্রসেসিং (Processing)' : order.status}
                </p>
                <p className="text-gray-400 font-bold uppercase tracking-wider mt-4 mb-2 text-xs">পেমেন্ট মেথড:</p>
                <p className="text-gray-700 font-semibold">{order.payment_method_title}</p>
              </div>
            </div>
          )}

          {/* Items Table */}
          {order && (
            <div className="mb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-t border-gray-200">
                    <th className="py-3 px-4 font-bold">পণ্যের বিবরণ</th>
                    <th className="py-3 px-4 font-bold text-center">পরিমাণ</th>
                    <th className="py-3 px-4 font-bold text-right">মূল্য</th>
                    <th className="py-3 px-4 font-bold text-right">মোট</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {order.line_items.map((item, index) => (
                    <tr key={item.id} className={index !== order.line_items.length - 1 ? "border-b border-gray-100" : ""}>
                      <td className="py-4 px-4 font-medium text-gray-800">{item.name}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-gray-600">৳ {item.price}</td>
                      <td className="py-4 px-4 text-right font-bold text-gray-800">৳ {item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals Section */}
          {order && (
            <div className="flex justify-end mb-8 border-t border-gray-200 pt-6">
              <div className="w-full max-w-[300px]">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>সাব-টোটাল (Subtotal):</span>
                  <span>৳ {order.line_items.reduce((acc, item) => acc + parseFloat(item.total), 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                  <span>ডেলিভারি চার্জ (Shipping):</span>
                  <span>৳ {order.shipping_lines[0]?.total || 0}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-sm">
                  <span>সর্বমোট (Total):</span>
                  <span>৳ {order.total}</span>
                </div>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="bg-green-50 border border-green-200 p-5 rounded-sm print:bg-transparent print:border-green-300">
            <p className="text-[14px] text-gray-800 text-center font-medium leading-relaxed">
              আপনার অর্ডারটি আমরা পেয়েছি। আপনার দেওয়া নাম্বারে সরাসরি কথা বলে অর্ডারটি কনফার্ম (Confirm) করা হবে। <br className="hidden md:block"/>
              আপনি চাইলে সরাসরি আমাদের <a href="https://wa.me/8801601471471" target="_blank" rel="noopener noreferrer" className="text-[#488e14] font-bold hover:underline">WhatsApp</a>-এও যোগাযোগ করতে পারেন।
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons - Hidden on Print */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 print:hidden">
        <PrintButton />
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 bg-[#488e14] hover:bg-green-700 text-white px-6 py-3 rounded-sm font-bold transition-colors shadow-sm"
        >
          <Home size={20} />
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
