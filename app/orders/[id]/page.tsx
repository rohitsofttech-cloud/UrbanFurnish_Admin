'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/app/common/AdminLayout';
import { useOrders } from '@/context/OrderContext';
import { OrderStatus, AdminOrder, FulfillmentInfo } from '@/lib/orderStore';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Printer,
  Mail,
  Copy,
  Check,
  Phone,
  ShieldCheck,
  Calendar,
  CreditCard,
  User,
  Package,
  Edit3,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import OrderSlipModal from './OrderSlipModal';

const STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'Pending', label: 'Order Placed', desc: 'Received & Queued' },
  { key: 'Confirmed', label: 'Confirmed', desc: 'Inventory Verified' },
  { key: 'Processing', label: 'Processing', desc: 'QC & Packaging' },
  { key: 'Shipped', label: 'Shipped', desc: 'Carrier Dispatched' },
  { key: 'Delivered', label: 'Delivered', desc: 'Completed' },
];

const STATUS_ORDER_INDEX: Record<OrderStatus, number> = {
  Pending: 0,
  Confirmed: 1,
  Processing: 2,
  Shipped: 3,
  'Out for Delivery': 3,
  Delivered: 4,
  Cancelled: -1,
  Refunded: -1,
};

const getStatusStyle = (status: OrderStatus) => {
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

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'Pending':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'Refunded':
      return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
    default:
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
  }
};

export default function OrderDetailPage() {
  const routeParams = useParams();
  const routeId = typeof routeParams?.id === 'string' ? routeParams.id : Array.isArray(routeParams?.id) ? routeParams.id[0] : '';
  const { orders, getOrder, updateStatus } = useOrders();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('Processing');
  const [statusNote, setStatusNote] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isOrderSlipModalOpen, setIsOrderSlipModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    let resolvedId = routeId;
    if (!resolvedId && typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const idFromPath = pathParts[pathParts.length - 1];
      if (idFromPath && idFromPath !== '[id]') {
        resolvedId = decodeURIComponent(idFromPath);
      }
    }

    if (resolvedId) {
      const found = getOrder(resolvedId);
      if (found) {
        setOrder(found);
        setSelectedStatus(found.status);
        setCarrier(found.fulfillment.carrier || '');
        setTrackingNumber(found.fulfillment.trackingNumber || '');
        setTrackingUrl(found.fulfillment.trackingUrl || '');
        setEstimatedDelivery(found.fulfillment.estimatedDelivery || '');
      }
    }
  }, [routeId, orders, getOrder]);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    const trackingUpdates: Partial<FulfillmentInfo> = {};
    if (carrier) trackingUpdates.carrier = carrier;
    if (trackingNumber) trackingUpdates.trackingNumber = trackingNumber;
    if (trackingUrl) trackingUpdates.trackingUrl = trackingUrl;
    if (estimatedDelivery) trackingUpdates.estimatedDelivery = estimatedDelivery;

    const success = updateStatus(order.id, selectedStatus, statusNote, trackingUpdates);
    if (success) {
      setIsStatusModalOpen(false);
      setStatusNote('');
    }
  };

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surfaceColor border border-borderColor flex items-center justify-center text-textMuted">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-xl font-bold text-textColor">Order Not Found</h2>
          <p className="text-sm text-textMuted max-w-md">
            The requested order ID <span className="font-mono text-primary font-semibold">{routeId || '...'}</span> does not exist or has been removed.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-hover"
          >
            <ArrowLeft size={14} /> Back to Orders
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const currentStepIndex = STATUS_ORDER_INDEX[order.status];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-textMuted">
            <Link href="/dashboard" className="hover:text-textColor transition-colors">
              Dashboard
            </Link>
            <ChevronRight size={13} />
            <Link href="/orders" className="hover:text-textColor transition-colors">
              Orders
            </Link>
            <ChevronRight size={13} />
            <span className="font-mono text-textColor font-bold">{order.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOrderSlipModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surfaceColor border border-borderColor hover:bg-sidebarHover text-xs font-semibold text-textColor shadow-xs transition-colors"
            >
              <Printer size={14} className="text-primary" />
              <span>Print Order Slip</span>
            </button>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-bold shadow-sm transition-all"
            >
              <Edit3 size={14} />
              <span>Update Status</span>
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-textColor tracking-tight flex items-center gap-2 font-mono">
                  {order.id}
                  <button
                    onClick={() => handleCopy(order.id, 'orderId')}
                    className="p-1 rounded-md hover:bg-sidebarHover text-textMuted hover:text-textColor"
                    title="Copy Order ID"
                  >
                    {copiedField === 'orderId' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </h1>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusStyle(order.status)}`}>
                  ● {order.status}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getPaymentStatusStyle(order.paymentStatus)}`}>
                  Payment: {order.paymentStatus}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-textMuted flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} /> Placed on {order.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CreditCard size={13} /> {order.paymentMethod} ({order.transactionId})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium text-textColor">
                  {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items Total
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-bgColor/80 border border-borderColor p-2.5 rounded-xl self-start lg:self-auto">
              <div className="text-left pr-2 border-r border-borderColor">
                <p className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Quick Status</p>
                <p className="text-xs font-bold text-textColor">{order.status}</p>
              </div>
              <select
                value={order.status}
                onChange={(e) => {
                  const newStat = e.target.value as OrderStatus;
                  updateStatus(order.id, newStat);
                }}
                className="text-xs font-bold bg-surfaceColor text-textColor border border-borderColor rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-primary transition-colors"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          {order.status !== 'Cancelled' && order.status !== 'Refunded' ? (
            <div className="mt-8 pt-6 border-t border-borderColor/60">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
                {STEPS.map((step, idx) => {
                  const isCompleted = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div
                      key={step.key}
                      onClick={() => updateStatus(order.id, step.key)}
                      className={`cursor-pointer group flex flex-col p-3 rounded-xl border transition-all ${isCurrent
                        ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30'
                        : isCompleted
                          ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                          : 'bg-bgColor/50 border-borderColor/60 opacity-60 hover:opacity-100'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-textMuted">
                          Step 0{idx + 1}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 size={15} className="text-emerald-500" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-borderColor" />
                        )}
                      </div>
                      <p className={`text-xs font-bold ${isCurrent ? 'text-primary' : isCompleted ? 'text-textColor' : 'text-textMuted'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-textMuted mt-0.5">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <AlertCircle size={18} />
              <span>
                This order is marked as <strong>{order.status}</strong>. Standard shipping progression has halted.
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-borderColor flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-textColor flex items-center gap-2">
                    <Package size={18} className="text-primary" />
                    Items Ordered ({order.items.length})
                  </h2>
                  <p className="text-xs text-textMuted">Manufactured & Fulfilled by Urbn Furnish Direct</p>
                </div>
                <span className="text-xs font-mono font-bold text-textColor bg-bgColor px-3 py-1 rounded-lg border border-borderColor">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} Total Qty
                </span>
              </div>

              <div className="divide-y divide-borderColor/60">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-sidebarHover/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => setPreviewImage({ url: item.imageUrl, name: item.name })}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-bgColor border border-borderColor overflow-hidden shrink-0 relative cursor-pointer group hover:border-primary transition-all"
                        title="Click to view full image"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                          View
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <h3 className="text-sm font-bold text-textColor">{item.name}</h3>
                        <p className="text-xs text-textMuted font-mono">SKU: {item.sku}</p>
                        {item.variant && (
                          <p className="text-xs text-textMuted flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary/60 inline-block"></span>
                            {item.variant}
                          </p>
                        )}
                        {item.dimensions && (
                          <p className="text-[11px] text-textMuted font-mono">Dim: {item.dimensions}</p>
                        )}
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <ShieldCheck size={13} /> {item.warranty}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-borderColor/40 flex sm:flex-col justify-between items-center sm:items-end">
                      <p className="text-xs text-textMuted font-medium">
                        Quantity
                      </p>
                      <p className="text-sm sm:text-base font-extrabold text-textColor font-mono bg-bgColor px-3 py-1 rounded-lg border border-borderColor">
                        {item.quantity} Qty
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs p-5 space-y-4">
              <h2 className="text-sm font-bold text-textColor uppercase tracking-wider flex items-center justify-between">
                <span>Customer Profile</span>
                <User size={16} className="text-primary" />
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-bgColor border border-borderColor shrink-0">

                  <div className="w-full h-full flex items-center justify-center font-bold text-textColor bg-primary/20">
                    {order.customer.name.slice(0, 2).toUpperCase()}
                  </div>

                </div>
                <div>
                  <h3 className="text-sm font-bold text-textColor">{order.customer.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/15 text-primary">
                    {order.customer.customerType}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs p-5 space-y-3">
              <h2 className="text-sm font-bold text-textColor uppercase tracking-wider flex items-center justify-between">
                <span>Shipping Address</span>
                <MapPin size={16} className="text-primary" />
              </h2>

              <div className="text-xs space-y-1 text-textMuted leading-relaxed">
                <p className="font-bold text-textColor">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
                {order.shippingAddress.landmark && <p className="text-primary font-medium">Near: {order.shippingAddress.landmark}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  <span className="font-mono font-bold text-textColor">{order.shippingAddress.pinCode}</span>
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Image Popup Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-2xl w-full bg-surfaceColor border border-borderColor rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-textColor truncate max-w-[85%]">{previewImage.name}</h4>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded-lg bg-bgColor text-textMuted hover:text-textColor hover:bg-sidebarHover transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="w-full h-[60vh] max-h-[500px] rounded-xl overflow-hidden bg-black/20 flex items-center justify-center border border-borderColor">
                <img
                  src={previewImage.url}
                  alt={previewImage.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surfaceColor border border-borderColor rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-borderColor pb-4">
                <div>
                  <h3 className="text-lg font-bold text-textColor">Update Order Status</h3>
                  <p className="text-xs text-textMuted">Order #{order.id}</p>
                </div>
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="text-textMuted hover:text-textColor p-1 rounded-lg hover:bg-bgColor"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-textColor mb-1.5">Select New Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        'Pending',
                        'Confirmed',
                        'Processing',
                        'Shipped',
                        'Out for Delivery',
                        'Delivered',
                        'Cancelled',
                        'Refunded',
                      ] as OrderStatus[]
                    ).map((st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setSelectedStatus(st)}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${selectedStatus === st
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-bgColor border-borderColor text-textColor hover:bg-sidebarHover'
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedStatus === 'Shipped' && (
                  <div className="space-y-3 p-3 rounded-xl bg-bgColor border border-borderColor">
                    <p className="text-xs font-bold text-textColor">Shipment Carrier Details</p>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="Carrier (e.g. Blue Dart, Delhivery)"
                      className="w-full bg-surfaceColor border border-borderColor rounded-lg px-3 py-2 text-xs text-textColor"
                    />
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="AWB / Tracking Number"
                      className="w-full bg-surfaceColor border border-borderColor rounded-lg px-3 py-2 text-xs font-mono text-textColor"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-textColor mb-1.5">
                    Internal Reason / Status Memo (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Provide context for this status change..."
                    className="w-full bg-bgColor border border-borderColor rounded-xl p-3 text-xs text-textColor outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderColor">
                  <button
                    type="button"
                    onClick={() => setIsStatusModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-borderColor hover:bg-sidebarHover text-xs font-semibold text-textColor"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-bold shadow-xs"
                  >
                    Confirm & Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <OrderSlipModal
          order={order}
          isOpen={isOrderSlipModalOpen}
          onClose={() => setIsOrderSlipModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
