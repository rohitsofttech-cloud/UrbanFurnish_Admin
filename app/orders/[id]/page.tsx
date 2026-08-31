'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/app/common/AdminLayout';
import { useOrders } from '@/context/OrderContext';
import { OrderStatus, AdminOrder, FulfillmentInfo } from '@/lib/orderStore';
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Printer,
  FileText,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Phone,
  MessageSquare,
  ShieldCheck,
  Calendar,
  CreditCard,
  Building,
  User,
  Package,
  ArrowUpRight,
  Send,
  Edit3,
  MapPin,
  ChevronRight,
  Sparkles,
  Info,
  DollarSign,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import OrderSlipModal from './OrderSlipModal';

export default function OrderDetailPage() {
  const routeParams = useParams();
  const routeId = typeof routeParams?.id === 'string' ? routeParams.id : Array.isArray(routeParams?.id) ? routeParams.id[0] : '';
  const [resolvedId, setResolvedId] = useState<string>(routeId);
  const { orders, getOrder, updateStatus, addNote } = useOrders();

  // Opens a popup that looks exactly like the on-screen tax invoice (matches screenshot)
  const handleInvoicePrint = () => {
    if (!order) return;
    const o = order;

    const itemRows = o.items.map((item, idx) => `
      <tr>
        <td style="padding:9px 10px;color:#666;">${idx + 1}</td>
        <td style="padding:9px 10px;">
          <p style="font-weight:700;color:#111;margin:0;">${item.name}</p>
          ${item.variant ? `<p style="font-size:10px;color:#666;margin:2px 0;">[${item.variant}]</p>` : ''}
          <p style="font-size:10px;color:#888;font-family:monospace;margin:2px 0;">SKU: ${item.sku}</p>
        </td>
        <td style="padding:9px 10px;text-align:center;font-family:monospace;color:#666;">9403</td>
        <td style="padding:9px 10px;text-align:center;font-weight:700;color:#111;">${item.quantity}</td>
        <td style="padding:9px 10px;text-align:right;font-family:monospace;color:#555;">₹${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding:9px 10px;text-align:right;font-family:monospace;font-weight:700;color:#111;">₹${item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>`).join('');

    const taxable = o.pricing.subtotal - o.pricing.discount;

    const printWindow = window.open('', '_blank', 'width=960,height=750');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Tax Invoice – Order #${o.id}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#111;background:#fff;padding:28px 32px;}
    .wrap{max-width:860px;margin:0 auto;}
    table{width:100%;border-collapse:collapse;margin-bottom:18px;}
    thead tr{background:#f0f0f0;border-top:2px solid #000;border-bottom:2px solid #000;}
    th{padding:8px 10px;font-weight:700;text-transform:uppercase;font-size:10px;color:#222;text-align:left;}
    tbody tr{border-bottom:1px solid #e0e0e0;page-break-inside:avoid;}
    @media print{body{padding:14px;}@page{margin:10mm;size:A4;}}
  </style>
</head>
<body>
<div class="wrap">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:18px;">
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <div style="width:34px;height:34px;background:#e27429;color:#fff;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;border-radius:6px;flex-shrink:0;">U</div>
        <span style="font-size:16px;font-weight:900;letter-spacing:-0.2px;text-transform:uppercase;">URBN FURNISH PVT LTD</span>
      </div>
      <div style="font-size:11px;color:#444;line-height:1.55;">
        Plot No. 42, Furniture Tech Park, Phase 2, Industrial Area,<br/>
        Bangalore, Karnataka – 560066<br/>
        <strong>GSTIN:</strong> 27AABCU1289P1ZM &bull; <strong>PAN:</strong> AAACU8921K<br/>
        Email: billing@urbnfurnish.com &bull; Web: https://urbnfurnish.com
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:22px;font-weight:900;text-transform:uppercase;color:#e27429;letter-spacing:1px;">TAX INVOICE</div>
      <p style="font-size:11px;color:#333;margin-top:4px;line-height:1.65;"><strong>Invoice No:</strong> UF-INV-${o.id.replace(/[^0-9]/g,'') || o.id}</p>
      <p style="font-size:11px;color:#333;line-height:1.65;">Date: ${o.date}</p>
      <p style="font-size:11px;color:#333;line-height:1.65;">Payment: <strong>${o.paymentMethod}</strong></p>
    </div>
  </div>

  <!-- Address -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;border:1px solid #ccc;border-radius:6px;padding:13px 16px;background:#f9f9f9;margin-bottom:18px;font-size:11px;">
    <div>
      <span style="font-weight:700;text-transform:uppercase;letter-spacing:0.5px;font-size:10px;color:#555;display:block;margin-bottom:5px;">Billed To:</span>
      <div style="font-weight:700;font-size:13px;color:#000;margin-bottom:3px;">${o.billingAddress.fullName}</div>
      <div style="color:#444;line-height:1.55;">
        ${o.billingAddress.street}<br/>
        ${o.billingAddress.city}, ${o.billingAddress.state} – ${o.billingAddress.pinCode}
        ${o.billingAddress.gstin ? `<br/><strong>Buyer GSTIN:</strong> ${o.billingAddress.gstin}` : ''}
      </div>
    </div>
    <div>
      <span style="font-weight:700;text-transform:uppercase;letter-spacing:0.5px;font-size:10px;color:#555;display:block;margin-bottom:5px;">Shipped / Delivered To:</span>
      <div style="font-weight:700;font-size:13px;color:#000;margin-bottom:3px;">${o.shippingAddress.fullName}</div>
      <div style="color:#444;line-height:1.55;">
        ${o.shippingAddress.street}<br/>
        ${o.shippingAddress.city}, ${o.shippingAddress.state} – ${o.shippingAddress.pinCode}<br/>
        Phone: ${o.shippingAddress.phone}
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        <th style="text-align:center;">HSN</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- Footer -->
  <div style="display:flex;justify-content:space-between;gap:24px;border-top:1.5px solid #000;padding-top:16px;page-break-inside:avoid;">
    <div style="max-width:360px;">
      <span style="font-weight:700;text-transform:uppercase;font-size:10px;color:#333;display:block;margin-bottom:5px;">Terms &amp; Conditions:</span>
      <p style="font-size:10.5px;color:#555;line-height:1.6;">Thank you for choosing Urbn Furnish! Includes 5-Year On-Site Manufacturer Warranty against structural defects.</p>
      <em style="font-style:italic;font-size:10px;color:#777;display:block;margin-top:5px;">This is a computer generated invoice and requires no physical signature under GST Rule 46.</em>
    </div>
    <div style="min-width:240px;font-size:11.5px;">
      <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;color:#444;">
        <span>Taxable Amount:</span><span style="font-family:monospace;font-weight:600;color:#111;">₹${taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;color:#444;">
        <span>CGST (9%):</span><span style="font-family:monospace;font-weight:600;color:#111;">₹${o.pricing.cgst.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:4px 0;color:#444;">
        <span>SGST (9%):</span><span style="font-family:monospace;font-weight:600;color:#111;">₹${o.pricing.sgst.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;border-top:2px solid #000;padding-top:7px;margin-top:6px;font-weight:900;font-size:13.5px;color:#000;">
        <span>Grand Total (INR):</span><span style="font-family:monospace;color:#e27429;">₹${o.pricing.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  </div>

  <!-- Signature -->
  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px dashed #aaa;margin-top:34px;padding-top:12px;font-size:10.5px;color:#555;">
    <p style="font-family:monospace;font-size:10px;color:#777;">Invoice Reference: #${o.id}</p>
    <div style="text-align:right;">
      <p style="font-weight:700;color:#000;font-size:11px;">For URBN FURNISH PVT LTD</p>
      <div style="border-top:1px solid #555;margin-top:22px;padding-top:4px;font-size:10px;color:#666;">Authorized Signatory (Finance)</div>
    </div>
  </div>

</div>
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
</body>
</html>`);
    printWindow.document.close();
  };


  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('Processing');
  const [statusNote, setStatusNote] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Internal Note form state
  const [newNoteText, setNewNoteText] = useState('');
  const [isCustomerVisibleNote, setIsCustomerVisibleNote] = useState(false);

  // Modals & Copy state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isOrderSlipModalOpen, setIsOrderSlipModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (routeId) {
      setResolvedId(routeId);
    } else if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const idFromPath = pathParts[pathParts.length - 1];
      if (idFromPath && idFromPath !== '[id]') {
        setResolvedId(decodeURIComponent(idFromPath));
      }
    }
  }, [routeId]);

  useEffect(() => {
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
  }, [resolvedId, orders, getOrder]);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success(`Copied to clipboard`);
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

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !newNoteText.trim()) return;

    const success = addNote(order.id, newNoteText.trim(), isCustomerVisibleNote);
    if (success) {
      setNewNoteText('');
    }
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

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surfaceColor border border-borderColor flex items-center justify-center text-textMuted">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-xl font-bold text-textColor">Order Not Found</h2>
          <p className="text-sm text-textMuted max-w-md">
            The requested order ID <span className="font-mono text-primary font-semibold">{resolvedId || '...'}</span> does not exist or has been removed.
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

  // Stepper steps calculation
  const STEPS: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'Pending', label: 'Order Placed', desc: 'Received & Queued' },
    { key: 'Confirmed', label: 'Confirmed', desc: 'Inventory Verified' },
    { key: 'Processing', label: 'Processing', desc: 'QC & Packaging' },
    { key: 'Shipped', label: 'Shipped', desc: 'Carrier Dispatched' },
    { key: 'Delivered', label: 'Delivered', desc: 'Completed' },
  ];

  const statusOrderIndex: Record<OrderStatus, number> = {
    Pending: 0,
    Confirmed: 1,
    Processing: 2,
    Shipped: 3,
    'Out for Delivery': 3,
    Delivered: 4,
    Cancelled: -1,
    Refunded: -1,
  };

  const currentStepIndex = statusOrderIndex[order.status];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Breadcrumb Navigation */}
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
              onClick={() => setIsInvoiceModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surfaceColor border border-borderColor hover:bg-sidebarHover text-xs font-semibold text-textColor shadow-xs transition-colors"
            >
              <FileText size={14} className="text-textMuted" />
              <span>Tax Invoice</span>
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

        {/* Order Header / Hero Banner */}
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

            {/* Quick manual status trigger widget */}
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

          {/* Stepper Progress Bar (only for normal fulfillment cycle) */}
          {order.status !== 'Cancelled' && order.status !== 'Refunded' ? (
            <div className="mt-8 pt-6 border-t border-borderColor/60">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
                {STEPS.map((step, idx) => {
                  const isCompleted = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div
                      key={step.key}
                      onClick={() => {
                        updateStatus(order.id, step.key);
                      }}
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

        {/* 2-Column Grid Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ordered Items List Card */}
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
                  ₹{order.pricing.subtotal.toLocaleString('en-IN')} Subtotal
                </span>
              </div>

              <div className="divide-y divide-borderColor/60">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-sidebarHover/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-bgColor border border-borderColor overflow-hidden shrink-0 relative">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
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
                      <p className="text-xs text-textMuted">
                        ₹{item.unitPrice.toLocaleString('en-IN')} × {item.quantity}
                      </p>
                      <p className="text-sm sm:text-base font-extrabold text-textColor font-mono">
                        ₹{item.total.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown Section */}
              <div className="p-5 bg-bgColor/40 border-t border-borderColor space-y-2.5">
                <div className="flex items-center justify-between text-xs text-textMuted">
                  <span>Items Subtotal</span>
                  <span className="font-mono text-textColor font-semibold">₹{order.pricing.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1">
                      Coupon Applied ({order.pricing.couponCode || 'PROMO'})
                    </span>
                    <span className="font-mono font-semibold">- ₹{order.pricing.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-textMuted">
                  <span>Estimated GST / Tax (CGST 9% + SGST 9%)</span>
                  <span className="font-mono text-textColor">₹{order.pricing.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-textMuted">
                  <span>Shipping & Delivery (White Glove)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {order.pricing.shipping === 0 ? 'FREE' : `₹${order.pricing.shipping}`}
                  </span>
                </div>
                <div className="pt-3 border-t border-borderColor flex items-center justify-between text-sm sm:text-base font-black text-textColor">
                  <span>Total Amount Paid</span>
                  <span className="font-mono text-primary text-lg">
                    ₹{order.pricing.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column / Sidebar Info Cards (1/3 width) */}
          <div className="space-y-6">

            {/* Customer Details Card */}
            <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs p-5 space-y-4">
              <h2 className="text-sm font-bold text-textColor uppercase tracking-wider flex items-center justify-between">
                <span>Customer Profile</span>
                <User size={16} className="text-primary" />
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-bgColor border border-borderColor shrink-0">
                  {order.customer.avatar ? (
                    <img
                      src={order.customer.avatar}
                      alt={order.customer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-textColor bg-primary/20">
                      {order.customer.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-textColor">{order.customer.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/15 text-primary">
                    {order.customer.customerType}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-borderColor/60 text-xs">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 text-textMuted">
                    <Mail size={13} />
                    <span className="text-textColor">{order.customer.email}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(order.customer.email, 'custEmail')}
                    className="text-textMuted hover:text-textColor p-1"
                    title="Copy Email"
                  >
                    {copiedField === 'custEmail' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 text-textMuted">
                    <Phone size={13} />
                    <span className="text-textColor">{order.customer.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-bgColor border border-borderColor text-center">
                    <p className="text-[10px] text-textMuted uppercase font-bold">Total Orders</p>
                    <p className="text-sm font-bold text-textColor font-mono">{order.customer.ordersCount}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-bgColor border border-borderColor text-center">
                    <p className="text-[10px] text-textMuted uppercase font-bold">Lifetime Value</p>
                    <p className="text-sm font-bold text-textColor font-mono">₹{order.customer.lifetimeSpend.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
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
                <p className="pt-1 text-textColor font-medium">Contact: {order.shippingAddress.phone}</p>
              </div>

              <div className="pt-2 border-t border-borderColor/60">
                <span className="text-[11px] font-semibold text-textMuted bg-bgColor px-2.5 py-1 rounded-lg border border-borderColor inline-block">
                  Method: {order.fulfillment.shippingMethod}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal: Manual Status Updater */}
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

        {/* Modal: Order Slip (Shipping Label matching Flipkart/E-commerce standard with Scannable QR & Barcode) */}
        <OrderSlipModal
          order={order}
          isOpen={isOrderSlipModalOpen}
          onClose={() => setIsOrderSlipModalOpen(false)}
          onSwitchToTaxInvoice={() => {
            setIsOrderSlipModalOpen(false);
            setIsInvoiceModalOpen(true);
          }}
        />

        {/* Modal: Tax Invoice Preview & Print */}
        {isInvoiceModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:static print:block print:bg-white print:z-auto">
            <div id="printable-invoice-target" className="bg-white text-gray-900 rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 my-8 border border-gray-200 print:border-none print:shadow-none print:max-w-none print:p-4 print:my-0 print:rounded-none print:space-y-4">
              {/* Top Modal Controls Header for Screen */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-gray-500">TAX INVOICE PREVIEW</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    Official GST Bill
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleInvoicePrint}
                    className="px-4 py-1.5 bg-[#e27429] text-white rounded-xl text-xs font-bold hover:bg-[#cb611b] flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer size={13} />
                    <span>Print Invoice (PDF)</span>
                  </button>
                  <button
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b border-gray-300 pb-5 print:border-black print:pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#e27429] flex items-center justify-center text-white text-xs font-black">U</span>
                    <span className="text-xl font-black tracking-tight text-gray-900 uppercase">URBN FURNISH PVT LTD</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 max-w-sm">Plot No. 42, Furniture Tech Park, Phase 2, Industrial Area, Bangalore, Karnataka - 560066</p>
                  <p className="text-xs text-gray-700 mt-0.5"><strong>GSTIN:</strong> 27AABCU1289P1ZM • <strong>PAN:</strong> AAACU8921K</p>
                  <p className="text-xs text-gray-600">Email: billing@urbnfurnish.com • Web: https://urbnfurnish.com</p>
                </div>
                <div className="text-right space-y-0.5">
                  <h2 className="text-xl font-black text-[#e27429] print:text-black">TAX INVOICE</h2>
                  <p className="text-xs font-mono font-bold text-gray-800">Invoice No: UF-INV-{order.id.replace(/[^0-9]/g, '') || order.id}</p>
                  <p className="text-xs text-gray-600">Date: {order.date}</p>
                  <p className="text-xs text-gray-600">Payment: <strong>{order.paymentMethod}</strong></p>
                </div>
              </div>

              {/* Billed to & Shipped to */}
              <div className="grid grid-cols-2 gap-4 text-xs border border-gray-200 print:border-black/30 p-3.5 rounded-xl bg-gray-50/50 print:bg-white">
                <div>
                  <p className="font-bold text-gray-800 uppercase tracking-wider mb-1">Billed To:</p>
                  <p className="font-bold text-gray-900 text-sm">{order.billingAddress.fullName}</p>
                  <p className="text-gray-700">{order.billingAddress.street}</p>
                  <p className="text-gray-700">
                    {order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.pinCode}
                  </p>
                  {order.billingAddress.gstin && (
                    <p className="font-mono font-semibold text-gray-900 mt-1">Buyer GSTIN: {order.billingAddress.gstin}</p>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-800 uppercase tracking-wider mb-1">Shipped / Delivered To:</p>
                  <p className="font-bold text-gray-900 text-sm">{order.shippingAddress.fullName}</p>
                  <p className="text-gray-700">{order.shippingAddress.street}</p>
                  <p className="text-gray-700">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}
                  </p>
                  <p className="text-gray-700">Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse print:text-[11px]">
                <thead>
                  <tr className="border-b-2 border-gray-300 print:border-black font-bold text-gray-800 uppercase bg-gray-100/70">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Item Description</th>
                    <th className="py-2 px-2 text-center">HSN</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Price</th>
                    <th className="py-2 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, idx) => (
                    <tr key={item.id} className="print:break-inside-avoid">
                      <td className="py-2.5 px-2 text-gray-600">{idx + 1}</td>
                      <td className="py-2.5 px-2">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        {item.variant && <p className="text-[10px] text-gray-600">[{item.variant}]</p>}
                        <p className="text-[10px] text-gray-500 font-mono">SKU: {item.sku}</p>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-gray-600">9403</td>
                      <td className="py-2.5 px-2 text-center font-bold text-gray-900">{item.quantity}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-gray-700">₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-gray-900">₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation & Terms */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 border-t border-gray-300 print:border-black pt-4 text-xs print:break-inside-avoid">
                <div className="space-y-1.5 max-w-sm text-gray-600">
                  <p className="font-bold uppercase text-gray-800">Terms &amp; Conditions:</p>
                  <p className="text-[11px] leading-relaxed">Thank you for choosing Urbn Furnish! Includes 5-Year On-Site Manufacturer Warranty against structural defects.</p>
                  <p className="text-[10px] italic">This is a computer generated invoice and requires no physical signature under GST Rule 46.</p>
                </div>

                <div className="space-y-1.5 min-w-[240px] text-right">
                  <div className="flex justify-between text-gray-600">
                    <span>Taxable Amount:</span>
                    <span className="font-mono font-semibold text-gray-900">₹{(order.pricing.subtotal - order.pricing.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono text-gray-800">₹{order.pricing.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono text-gray-800">₹{order.pricing.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-300 print:border-black">
                    <span>Grand Total (INR):</span>
                    <span className="font-mono text-[#e27429] print:text-black font-bold">
                      ₹{order.pricing.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Authorized Signatory Line for Print */}
              <div className="hidden print:flex items-center justify-between pt-6 border-t border-dashed border-gray-400 text-xs">
                <div>
                  <p className="text-[10px] text-gray-500 font-mono">Invoice Reference: #{order.id}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-black text-xs">For URBN FURNISH PVT LTD</p>
                  <div className="h-6" />
                  <p className="text-[10.5px] text-gray-700 border-t border-black/50 pt-0.5">Authorized Signatory (Finance)</p>
                </div>
              </div>

              {/* Bottom modal actions on screen */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 print:hidden">
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={handleInvoicePrint}
                  className="px-5 py-2 bg-[#e27429] text-white rounded-xl text-xs font-bold hover:bg-[#cb611b] flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
