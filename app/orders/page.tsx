'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdminLayout from '../common/AdminLayout';
import { useOrders } from '@/context/OrderContext';
import { OrderStatus, AdminOrder } from '@/lib/orderStore';
import {
  Search,
  Eye,
  Download,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  ArrowUpRight,
  ChevronDown,
  Calendar,
  CreditCard,
  User,
  SlidersHorizontal,
  FileSpreadsheet,
  Check,
  Copy,
  ExternalLink,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const { orders, updateStatus } = useOrders();
  const [activeTab, setActiveTab] = useState<'All' | OrderStatus>('All');
  const [search, setSearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: orders.length,
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = activeTab === 'All' || order.status === activeTab;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customer.name.toLowerCase().includes(q) ||
        order.customer.email.toLowerCase().includes(q) ||
        order.customer.phone.toLowerCase().includes(q) ||
        order.items.some((item) => item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, search]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.pricing.grandTotal : sum), 0);
    const pendingCount = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
    const shippedCount = orders.filter((o) => o.status === 'Shipped' || o.status === 'Out for Delivery').length;
    const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

    return {
      totalRev,
      pendingCount,
      shippedCount,
      deliveredCount,
    };
  }, [orders]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = (newStatus: OrderStatus) => {
    selectedOrders.forEach((id) => {
      updateStatus(id, newStatus, `Bulk status updated to ${newStatus}`);
    });
    setSelectedOrders([]);
    toast.success(`Updated ${selectedOrders.length} orders to ${newStatus}`);
  };

  const handleExportCSV = () => {
    const dataToExport = selectedOrders.length > 0
      ? orders.filter((o) => selectedOrders.includes(o.id))
      : filteredOrders;

    if (dataToExport.length === 0) {
      toast.error('No orders to export');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Status',
      'Payment Status',
      'Payment Method',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Items Count',
      'Subtotal (INR)',
      'Tax (INR)',
      'Grand Total (INR)',
      'Shipping City',
      'Shipping State',
      'Tracking Number',
    ];

    const rows = dataToExport.map((o) => [
      `"${o.id}"`,
      `"${o.date}"`,
      `"${o.status}"`,
      `"${o.paymentStatus}"`,
      `"${o.paymentMethod}"`,
      `"${o.customer.name}"`,
      `"${o.customer.email}"`,
      `"${o.customer.phone}"`,
      o.items.reduce((sum, i) => sum + i.quantity, 0),
      o.pricing.subtotal,
      o.pricing.totalTax,
      o.pricing.grandTotal,
      `"${o.shippingAddress.city}"`,
      `"${o.shippingAddress.state}"`,
      `"${o.fulfillment.trackingNumber}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `urbn_furnish_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${dataToExport.length} orders to CSV`);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success('Order ID copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Processing':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'Confirmed':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'Pending':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-textMuted mb-1 font-semibold">
              <span>Fulfillment & Logistics</span>
              <span>•</span>
              <span>Live Order Stream</span>
            </div>
            <h1 className="text-2xl font-black text-textColor tracking-tight">Order Management</h1>
            <p className="text-xs sm:text-sm text-textMuted">
              Track customer orders, manage white-glove shipments, update delivery status, and review tax invoices.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-surfaceColor border border-borderColor hover:bg-sidebarHover font-bold text-xs flex items-center gap-2 text-textColor shadow-xs transition-colors"
            >
              <FileSpreadsheet size={15} className="text-emerald-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Top Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-textMuted font-medium">Total Orders</p>
              <p className="text-xl sm:text-2xl font-black text-textColor font-mono">{orders.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-textMuted font-medium">Pending Fulfillment</p>
              <p className="text-xl sm:text-2xl font-black text-amber-500 font-mono">{metrics.pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-textMuted font-medium">In Transit / Shipped</p>
              <p className="text-xl sm:text-2xl font-black text-purple-500 font-mono">{metrics.shippedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Truck size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-textMuted font-medium">Total Order Volume</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">
                ₹{metrics.totalRev.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-borderColor overflow-x-auto pb-2 scrollbar-none">
          {(['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((tab) => {
            const count = tab === 'All' ? orders.length : tabCounts[tab] || 0;
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap select-none ${isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-textMuted hover:text-textColor hover:bg-surfaceColor'
                  }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-borderColor text-textMuted'
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bulk Action Banner (when items are checked) */}
        {selectedOrders.length > 0 && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-4 flex-wrap animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-textColor">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                {selectedOrders.length}
              </span>
              <span>Orders selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('Processing')}
                className="px-3 py-1.5 rounded-lg bg-surfaceColor border border-borderColor hover:bg-sidebarHover text-xs font-semibold text-textColor"
              >
                Mark Processing
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('Shipped')}
                className="px-3 py-1.5 rounded-lg bg-surfaceColor border border-borderColor hover:bg-sidebarHover text-xs font-semibold text-textColor"
              >
                Mark Shipped
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('Delivered')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold"
              >
                Mark Delivered
              </button>
              <button
                onClick={() => setSelectedOrders([])}
                className="px-2.5 py-1.5 text-xs text-textMuted hover:text-textColor"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Main Orders Table Card */}
        <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-borderColor flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bgColor/30">
            <div className="flex items-center px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor w-full sm:w-80 shadow-2xs">
              <Search size={15} className="text-textMuted mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Search order ID, customer, email, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-textColor outline-none placeholder:text-textMuted"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-textMuted hover:text-textColor text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-xs font-medium text-textMuted">
                Showing <strong className="text-textColor">{filteredOrders.length}</strong> of {orders.length} orders
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-borderColor text-[11px] font-bold text-textMuted uppercase bg-bgColor/40 select-none">
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-borderColor text-primary focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-5 py-3">Order Number</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Items Ordered</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-textMuted">
                      <div className="max-w-xs mx-auto space-y-2">
                        <ShoppingBag size={32} className="mx-auto text-textMuted/60" />
                        <p className="text-sm font-bold text-textColor">No matching orders found</p>
                        <p className="text-xs text-textMuted">Try modifying your search term or switching tabs.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSelected = selectedOrders.includes(order.id);

                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-sidebarHover/40 transition-colors group ${isSelected ? 'bg-primary/5' : ''
                          }`}
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(order.id)}
                            className="rounded border-borderColor text-primary focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Order ID & Badge */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/orders/${order.id}`}
                              className="font-mono font-bold text-xs text-primary hover:underline hover:text-primary-hover inline-flex items-center gap-1"
                            >
                              {order.id}
                            </Link>
                            <button
                              onClick={() => handleCopy(order.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-textMuted hover:text-textColor transition-opacity"
                              title="Copy ID"
                            >
                              {copiedId === order.id ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-textMuted font-mono">
                            {order.orderNumber}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-xs text-textMuted">
                          <div className="font-medium text-textColor">{order.date.split(',')[0]}</div>
                          <div className="text-[11px] text-textMuted">{order.date.split(',')[1]}</div>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-bgColor border border-borderColor shrink-0">
                              {order.customer.avatar ? (
                                <img
                                  src={order.customer.avatar}
                                  alt={order.customer.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-textColor">
                                  {order.customer.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-textColor flex items-center gap-1">
                                {order.customer.name}
                              </p>
                              <p className="text-[11px] text-textMuted">{order.customer.email}</p>
                            </div>
                          </div>
                        </td>


                        {/* Items preview avatars */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 overflow-hidden">
                              {order.items.slice(0, 3).map((item) => (
                                <img
                                  key={item.id}
                                  src={item.imageUrl}
                                  alt={item.name}
                                  title={`${item.name} (x${item.quantity})`}
                                  className="w-7 h-7 rounded-lg object-cover border border-surfaceColor ring-1 ring-borderColor"
                                />
                              ))}
                            </div>
                            <span className="text-xs text-textColor font-medium">
                              {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                            </span>
                          </div>
                        </td>

                        {/* Manual Status Selector Inline */}
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              const newStat = e.target.value as OrderStatus;
                              updateStatus(order.id, newStat);
                            }}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${getStatusBadge(
                              order.status
                            )} bg-surfaceColor`}
                          >
                            <option value="Pending">● Pending</option>
                            <option value="Confirmed">● Confirmed</option>
                            <option value="Processing">● Processing</option>
                            <option value="Shipped">● Shipped</option>
                            <option value="Out for Delivery">● Out for Delivery</option>
                            <option value="Delivered">● Delivered</option>
                            <option value="Cancelled">● Cancelled</option>
                            <option value="Refunded">● Refunded</option>
                          </select>
                        </td>

                        {/* Action buttons */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/orders/${order.id}`}
                              className="px-3 py-1.5 rounded-lg bg-bgColor border border-borderColor hover:bg-sidebarHover text-xs font-semibold text-textColor inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Eye size={13} className="text-primary" />
                              <span>Manage</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-borderColor flex items-center justify-between text-xs text-textMuted bg-bgColor/20">
            <span>
              Showing 1 to {filteredOrders.length} of {filteredOrders.length} results
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-3 py-1 rounded-lg border border-borderColor text-textMuted opacity-50 cursor-not-allowed text-xs"
              >
                Previous
              </button>
              <button
                disabled
                className="px-3 py-1 rounded-lg border border-borderColor text-textMuted opacity-50 cursor-not-allowed text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
