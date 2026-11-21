"use client";

import { useState, useTransition, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Download,
  Package,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { updateOrderStatusAction, deleteOrderAction } from '../actions/orderActions';

export default function OrdersClient({ initialOrders }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams?.get('search') || '';
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState(null);
  const [ordersList, setOrdersList] = useState(initialOrders || []);

  useEffect(() => {
    setOrdersList(initialOrders || []);
  }, [initialOrders]);

  useEffect(() => {
    const s = searchParams?.get('search');
    if (s !== null && s !== undefined) {
      setSearchQuery(s);
    }
  }, [searchParams]);

  const mapStatusToFilter = (status) => {
    if (status === 'completed') return 'approved';
    if (status === 'cancelled' || status === 'refunded' || status === 'failed') return 'rejected';
    return 'pending'; 
  };

  const filteredOrders = ordersList.filter(p => {
    const pStatus = mapStatusToFilter(p.status);
    const matchesFilter = activeFilter === 'All' || pStatus === activeFilter.toLowerCase();
    
    const searchLower = (searchQuery || '').toLowerCase().trim();
    if (!searchLower) return matchesFilter;

    const customerName = `${p.billing?.first_name || ''} ${p.billing?.last_name || ''}`.toLowerCase();
    const customerPhone = (p.billing?.phone || '').toString().toLowerCase();
    const customerEmail = (p.billing?.email || '').toLowerCase();
    const hasProductMatch = p.line_items?.some(item => (item.name || '').toLowerCase().includes(searchLower));

    const matchesSearch = p.id.toString().includes(searchLower) || 
                          customerName.includes(searchLower) || 
                          customerPhone.includes(searchLower) ||
                          customerEmail.includes(searchLower) ||
                          hasProductMatch;
                          
    return matchesFilter && matchesSearch;
  });

  const totalOrders = ordersList.length;
  const pendingCount = ordersList.filter(o => mapStatusToFilter(o.status) === 'pending').length;
  const approvedCount = ordersList.filter(o => mapStatusToFilter(o.status) === 'approved').length;
  const rejectedCount = totalOrders - (pendingCount + approvedCount);

  const filters = ['All', 'Pending', 'Approved', 'Rejected'];

  const exportToCSV = () => {
    if (!filteredOrders.length) {
      alert('এক্সপোর্ট করার মতো কোনো অর্ডার পাওয়া যায়নি।');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Items', 'Total (BDT)', 'Payment Method', 'Status'];
    const rows = filteredOrders.map(order => [
      order.id,
      `"${new Date(order.date_created).toLocaleDateString('en-US')}"`,
      `"${(`${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`).trim().replace(/"/g, '""')}"`,
      `"${(order.billing?.phone || '').toString().replace(/"/g, '""')}"`,
      `"${(order.billing?.email || '').replace(/"/g, '""')}"`,
      `"${(order.line_items || []).map(i => `${i.name} (x${i.quantity})`).join(', ').replace(/"/g, '""')}"`,
      order.total,
      `"${(order.payment_method_title || order.payment_method || '').replace(/"/g, '""')}"`,
      `"${order.status}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smart-agro-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    let wcStatus = newStatus;
    if (newStatus === 'approved') wcStatus = 'completed';
    if (newStatus === 'rejected') wcStatus = 'cancelled';

    const previousOrders = [...ordersList];
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: wcStatus } : o));
    setLoadingId(orderId);

    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res?.success) {
        router.refresh();
      } else {
        setOrdersList(previousOrders);
        alert(res?.error || 'Failed to update order status');
      }
      setLoadingId(null);
    });
  };

  const handleDelete = (orderId) => {
    if (confirm("Are you sure you want to permanently delete this order?")) {
      const previousOrders = [...ordersList];
      setOrdersList(prev => prev.filter(o => o.id !== orderId));
      setLoadingId(orderId);

      startTransition(async () => {
        const res = await deleteOrderAction(orderId);
        if (res?.success) {
          router.refresh();
        } else {
          setOrdersList(previousOrders);
          alert(res?.error || 'Failed to delete order');
        }
        setLoadingId(null);
      });
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track status, update progress & manage transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors shadow-sm cursor-pointer"
            title="Export filtered orders to CSV"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Table Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder="Search order ID, phone or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
              {filters.map(filter => {
                const count = filter === 'All' ? totalOrders : 
                              filter === 'Pending' ? pendingCount : 
                              filter === 'Approved' ? approvedCount : rejectedCount;
                return (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeFilter === filter 
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {filter}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      activeFilter === filter ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60">
                <th className="px-6 py-4 font-semibold">Order Details</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Items</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((payment) => {
                  const mappedStatus = mapStatusToFilter(payment.status);
                  const isPendingStatus = mappedStatus === 'pending';
                  const isApproved = mappedStatus === 'approved';
                  const isRowLoading = isPending && loadingId === payment.id;
                  
                  return (
                    <tr key={payment.id} className={`transition-colors group ${isRowLoading ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                      {/* Order */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            #{payment.id}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(payment.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      
                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-bold shrink-0">
                            {payment.billing?.first_name?.substring(0, 1) || 'C'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{payment.billing?.first_name} {payment.billing?.last_name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{payment.billing?.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                              {payment.line_items?.[0]?.name || 'Unknown Product'}
                            </span>
                            {payment.line_items?.length > 1 && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">+{payment.line_items.length - 1} more items</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 dark:text-gray-100">৳{payment.total}</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">{payment.payment_method_title || payment.payment_method}</div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                          ${isPendingStatus 
                            ? 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50' 
                            : isApproved 
                              ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50' 
                              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50'}`}>
                          {isRowLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full ${isPendingStatus ? 'bg-yellow-500' : isApproved ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          )}
                          <span className="capitalize">{payment.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Approve */}
                          <button 
                            onClick={() => handleStatusUpdate(payment.id, 'approved')}
                            disabled={isPending}
                            className={`p-2 rounded-lg transition-colors ${mappedStatus === 'approved' ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 cursor-default' : 'text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30'}`}
                            title="Approve Order"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          
                          {/* Pending */}
                          <button 
                            onClick={() => handleStatusUpdate(payment.id, 'pending')}
                            disabled={isPending}
                            className={`p-2 rounded-lg transition-colors ${mappedStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-400 cursor-default' : 'text-gray-400 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30'}`}
                            title="Mark as Pending"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          
                          {/* Reject */}
                          <button 
                            onClick={() => handleStatusUpdate(payment.id, 'rejected')}
                            disabled={isPending}
                            className={`p-2 rounded-lg transition-colors ${mappedStatus === 'rejected' ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 cursor-default' : 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'}`}
                            title="Reject Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>

                          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>

                          {/* Delete */}
                          <button 
                            onClick={() => handleDelete(payment.id)}
                            disabled={isPending}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
