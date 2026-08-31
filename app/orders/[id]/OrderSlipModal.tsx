'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { AdminOrder } from '@/lib/orderStore';
import { Printer, Copy, Check, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderSlipModalProps {
  order: AdminOrder;
  isOpen: boolean;
  onClose: () => void;
  onSwitchToTaxInvoice?: () => void;
}

export default function OrderSlipModal({
  order,
  isOpen,
  onClose,
  onSwitchToTaxInvoice,
}: OrderSlipModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [orderSlipUrl, setOrderSlipUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Generate target URL for the QR code (scanning this opens the order / bill details)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin.includes('localhost') 
        ? window.location.origin.replace('localhost', '192.168.1.143')
        : window.location.origin;
      const url = `${origin}/orders/${encodeURIComponent(order.id)}`;
      setOrderSlipUrl(url);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then((dataUri) => {
          setQrCodeUrl(dataUri);
        })
        .catch((err) => {
          console.error('Error generating QR code', err);
        });
    }
  }, [order.id]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (orderSlipUrl) {
      navigator.clipboard.writeText(orderSlipUrl);
      setCopiedUrl(true);
      toast.success('Order Bill URL copied to clipboard');
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const handlePrint = () => {
    const itemRows = order.items.map(item => `
      <tr>
        <td style="padding:6px 8px;border-right:1px solid #000;vertical-align:top;">
          <span style="font-weight:700;font-size:11px;color:#000;display:block;">${item.name}</span>
          ${item.variant ? `<span style="font-size:9.5px;color:#555;font-family:monospace;display:block;">[${item.variant}]</span>` : ''}
          <span style="font-size:9px;color:#666;font-family:monospace;display:block;">SKU: ${item.sku}</span>
        </td>
        <td style="padding:6px 8px;text-align:center;font-weight:700;font-family:monospace;font-size:11px;color:#000;vertical-align:middle;">${item.quantity}</td>
      </tr>`).join('');

    const printWindow = window.open('', '_blank', 'width=500,height=700');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Order Slip – ${order.orderNumber || order.id}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0; -webkit-print-color-adjust: exact; print-color-adjust: exact;}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;display:flex;justify-content:center;align-items:flex-start;padding:24px;}
    table{width:100%;border-collapse:collapse;font-size:10.5px;}
    thead tr{border-bottom:1px solid #000;background:#e5e5e5;}
    th{padding:6px 8px;font-weight:900;text-align:left;font-size:10.5px;}
    tbody tr{border-bottom:1px solid #ddd;}
    @media print{body{padding:0;}@page{margin:8mm;}}
  </style>
</head>
<body>
<div style="width:380px;background:#fff;color:#000;border:2px dashed #000;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- 1. Address + QR -->
  <div style="display:grid;grid-template-columns:7fr 5fr;border-bottom:1px solid #000;">
    <!-- Left: Address -->
    <div style="padding:10px 8px 10px 10px;border-right:1px solid #000;font-size:11.5px;line-height:1.4;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <p style="font-weight:900;font-size:11.5px;text-transform:uppercase;margin-bottom:4px;">
          DELIVERY ADDRESS:
          <span style="font-weight:700;display:block;margin-top:2px;text-transform:none;">
            ${order.shippingAddress.fullName || order.customer.name},
          </span>
        </p>
        <p style="font-weight:400;font-size:11px;line-height:1.4;color:#111;">
          ${order.shippingAddress.street}${order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}${order.shippingAddress.landmark ? `, near ${order.shippingAddress.landmark}` : ''},
        </p>
        <p style="font-weight:700;margin-top:4px;">
          ${order.shippingAddress.city} –
          <span style="font-weight:900;font-size:12.5px;background:#fef9c3;padding:1px 4px;border:1px solid rgba(0,0,0,0.25);">
            ${order.shippingAddress.pinCode}
          </span>
          , IN-${(order.shippingAddress.state || 'KA').slice(0,2).toUpperCase()}
        </p>
        <p style="font-size:11px;margin-top:4px;font-weight:600;">Ph: ${order.shippingAddress.phone || order.customer.phone}</p>
      </div>
      <div style="border-top:1px dashed #ccc;margin-top:8px;padding-top:8px;">
        <p style="font-size:10.5px;font-family:monospace;font-weight:700;"><span style="font-family:'Segoe UI',Arial,sans-serif;font-weight:700;">Order ID:</span> ${order.orderNumber || order.id}</p>
      </div>
    </div>
    <!-- Right: QR -->
    <div style="padding:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;">
      ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR" style="width:112px;height:112px;object-fit:contain;"/>` : '<div style="width:112px;height:112px;background:#eee;display:flex;align-items:center;justify-content:center;font-size:10px;color:#888;">QR</div>'}
      <span style="font-size:8.5px;font-family:monospace;text-align:center;font-weight:700;margin-top:4px;color:#444;">SCAN FOR BILL / URL</span>
    </div>
  </div>

  <!-- 2. Seller Info -->
  <div style="padding:8px;font-size:10px;border-bottom:1px solid #000;line-height:1.5;background:#f9f9f9;">
    <p><span style="font-weight:900;">Sold By:</span> Urbn Furnish Retail Pvt Ltd, Baner High Street, Pune, MH – 411045</p>
    <p style="font-family:monospace;font-weight:700;color:#111;margin-top:2px;"><span style="font-family:'Segoe UI',Arial,sans-serif;font-weight:700;">GSTIN No:</span> 27AABCU1289P1ZM</p>
  </div>

  <!-- 3. Products Table -->
  <div style="border-bottom:1px solid #000;">
    <table>
      <thead>
        <tr>
          <th style="border-right:1px solid #000;">Product</th>
          <th style="text-align:center;width:52px;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr style="border-top:2px solid #000;background:#f0f0f0;">
          <td style="padding:6px 8px;border-right:1px solid #000;font-weight:700;font-size:10.5px;">Total</td>
          <td style="padding:6px 8px;text-align:center;font-weight:700;font-family:monospace;font-size:11px;">${totalQuantity}</td>
        </tr>
      </tbody>
    </table>
    <!-- Routing Hub -->
    <div style="display:flex;justify-content:flex-end;padding:6px 8px;background:#e5e5e5;border-top:1px solid #000;font-family:monospace;font-weight:900;font-size:11px;">
      ${routingHub}
    </div>
  </div>

  <!-- 4. Footer -->
  <div style="padding:8px;display:flex;align-items:center;justify-content:flex-end;gap:6px;font-size:9.5px;color:#555;">
    <span style="font-style:italic;">Ordered Through</span>
    <div style="display:flex;align-items:center;gap:4px;font-weight:900;font-size:11.5px;text-transform:uppercase;color:#000;">
      <span style="width:12px;height:12px;background:#e27429;display:inline-block;border-radius:2px;"></span>
      <span>URBN FURNISH</span>
    </div>
  </div>

</div>
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
</body>
</html>`);
    printWindow.document.close();
  };

  // Determine payment amount text
  const isCOD = order.paymentMethod === 'Cash on Delivery';
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Formatting dates
  const orderDateObj = new Date(order.createdAt || Date.now());
  const hbdDate = `${String(orderDateObj.getDate()).padStart(2, '0')} - ${String(orderDateObj.getMonth() + 1).padStart(2, '0')}`;
  
  const deliveryDateObj = new Date(orderDateObj.getTime() + 4 * 24 * 60 * 60 * 1000);
  const cpdDate = `${String(deliveryDateObj.getDate()).padStart(2, '0')} - ${String(deliveryDateObj.getMonth() + 1).padStart(2, '0')}`;

  // Hub short code
  const cityCode = (order.shippingAddress.city || 'NSK').slice(0, 3).toUpperCase();
  const routingHub = `(N) BOM/${cityCode}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:static print:p-0 print:bg-white print:z-auto">
      {/* Top Modal Controls Header - Hidden completely during print */}
      <div className="bg-surfaceColor border border-borderColor rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto print:hidden">
        <div className="flex items-center justify-between border-b border-borderColor pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-textColor flex items-center gap-2">
              <Printer className="text-primary" size={18} />
              Print Order Slip (Shipping Label)
            </h2>
            <p className="text-xs text-textMuted font-mono">Order #{order.id} • Live Scannable QR</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-sidebarHover text-textMuted hover:text-textColor transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between gap-2 flex-wrap bg-bgColor p-3 rounded-xl border border-borderColor text-xs">
          <div className="flex items-center gap-2 text-textMuted">
            <span className="font-semibold text-textColor">QR Scan Target:</span>
            <span className="font-mono truncate max-w-[200px] text-[11px]">{orderSlipUrl}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surfaceColor border border-borderColor hover:bg-sidebarHover text-textColor font-medium shadow-xs"
            >
              {copiedUrl ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
            </button>

            {onSwitchToTaxInvoice && (
              <button
                onClick={onSwitchToTaxInvoice}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surfaceColor border border-borderColor hover:bg-sidebarHover text-textColor font-medium shadow-xs"
              >
                <FileText size={13} className="text-primary" />
                <span>Tax Invoice</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-hover font-bold shadow-xs transition-all"
            >
              <Printer size={13} />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* Slip Preview Wrapper */}
        <div className="overflow-x-auto py-2 flex justify-center bg-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="w-[380px] sm:w-[410px] bg-white text-black font-sans border-2 border-black border-dashed p-3.5 shadow-md selection:bg-gray-200">
            {/* 1. Delivery Address + QR Code Section */}
            <div className="grid grid-cols-12 border-b border-black">
              {/* Left Address Column (7 cols) */}
              <div className="col-span-7 p-2.5 pr-2 border-r border-black flex flex-col justify-between text-[11.5px] leading-[1.4]">
                <div>
                  <p className="font-black text-[11.5px] tracking-tight uppercase mb-1 text-black">
                    DELIVERY ADDRESS:{' '}
                    <span className="font-bold text-black normal-case block mt-0.5">
                      {order.shippingAddress.fullName || order.customer.name},
                    </span>
                  </p>
                  <p className="text-black font-normal break-words leading-tight">
                    {order.shippingAddress.street}
                    {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                    {order.shippingAddress.landmark && `, near ${order.shippingAddress.landmark}`},
                  </p>
                  <p className="font-bold text-black pt-1">
                    {order.shippingAddress.city} -{' '}
                    <span className="font-black text-[12.5px] bg-yellow-100 px-1 py-0.5 border border-black/30">
                      {order.shippingAddress.pinCode}
                    </span>
                    , IN-{order.shippingAddress.state?.slice(0, 2)?.toUpperCase() || 'MH'}
                  </p>
                  <p className="text-[11px] text-gray-900 pt-1 font-semibold">
                    Ph: {order.shippingAddress.phone || order.customer.phone}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-dashed border-gray-300">
                  <p className="text-[10.5px] font-mono font-bold text-black">
                    <span className="font-sans font-bold">Order ID:</span> {order.orderNumber || order.id}
                  </p>
                </div>
              </div>

              {/* Right QR Code Column (5 cols) */}
              <div className="col-span-5 p-2 flex flex-col items-center justify-center bg-white">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Order QR Code"
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-mono">
                    Generating...
                  </div>
                )}
                <span className="text-[8.5px] font-mono text-center font-bold tracking-tight mt-1 text-gray-800">
                  SCAN FOR BILL / URL
                </span>
              </div>
            </div>

            {/* 2. Seller Info */}
            <div className="p-2 text-[10px] border-b border-black leading-tight bg-gray-50/50">
              <p>
                <span className="font-black">Sold By:</span> Urbn Furnish Retail Pvt Ltd, Baner High Street, Pune, MH - 411045
              </p>
              <p className="font-mono font-bold text-gray-900 pt-0.5">
                <span className="font-sans font-bold text-black">GSTIN No:</span> 27AABCU1289P1ZM
              </p>
            </div>

            {/* 3. Product Details Table */}
            <div className="border-b border-black">
              <table className="w-full text-left text-[10.5px] border-collapse">
                <thead>
                  <tr className="border-b border-black font-black bg-gray-200/90 text-black">
                    <th className="p-1.5 border-r border-black">Product</th>
                    <th className="p-1.5 text-center w-14">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-1.5 border-r border-black leading-snug">
                        <span className="font-bold text-black block">{item.name}</span>
                        {item.variant && (
                          <span className="text-[9.5px] text-gray-700 block font-mono">
                            [{item.variant}]
                          </span>
                        )}
                        <span className="text-[9px] text-gray-600 font-mono block">
                          SKU: {item.sku}
                        </span>
                      </td>
                      <td className="p-1.5 text-center font-bold text-black align-middle font-mono text-xs">
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-black font-black bg-gray-100">
                    <td className="p-1.5 border-r border-black font-bold text-black">Total</td>
                    <td className="p-1.5 text-center font-mono font-bold text-black">{totalQuantity}</td>
                  </tr>
                </tbody>
              </table>

              {/* Routing Hub Tag */}
              <div className="flex justify-end p-1.5 bg-gray-200/90 border-t border-black font-mono font-black text-[11px]">
                <span>{routingHub}</span>
              </div>
            </div>

            {/* 4. Footer: Ordered Through Branding */}
            <div className="p-2 flex items-center justify-end gap-1.5 text-[9.5px] text-gray-700">
              <span className="italic">Ordered Through</span>
              <div className="flex items-center gap-1 font-black tracking-tight text-black text-[11.5px] uppercase">
                <span className="w-3 h-3 rounded-xs bg-[#e27429] inline-block" />
                <span>URBN FURNISH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close & Print */}
        <div className="flex items-center justify-between pt-2 border-t border-borderColor">
          <p className="text-[11px] text-textMuted">
            Clean delivery slip format with active scannable URL QR code.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-borderColor rounded-xl text-xs font-bold text-textColor hover:bg-sidebarHover transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover shadow-xs transition-all flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Clean Print Target */}
      <div id="printable-order-slip-target" className="hidden print:block w-[380px] bg-white text-black font-sans border-2 border-black border-dashed p-3.5 shadow-none">
        {/* 1. Delivery Address + QR Code Section */}
        <div className="grid grid-cols-12 border-b border-black">
          {/* Left Address Column (7 cols) */}
          <div className="col-span-7 p-2.5 pr-2 border-r border-black flex flex-col justify-between text-[11.5px] leading-[1.4]">
            <div>
              <p className="font-black text-[11.5px] tracking-tight uppercase mb-1 text-black">
                DELIVERY ADDRESS:{' '}
                <span className="font-bold text-black normal-case block mt-0.5">
                  {order.shippingAddress.fullName || order.customer.name},
                </span>
              </p>
              <p className="text-black font-normal break-words leading-tight">
                {order.shippingAddress.street}
                {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                {order.shippingAddress.landmark && `, near ${order.shippingAddress.landmark}`},
              </p>
              <p className="font-bold text-black pt-1">
                {order.shippingAddress.city} -{' '}
                <span className="font-black text-[12.5px] bg-yellow-100 px-1 py-0.5 border border-black/30">
                  {order.shippingAddress.pinCode}
                </span>
                , IN-{order.shippingAddress.state?.slice(0, 2)?.toUpperCase() || 'MH'}
              </p>
              <p className="text-[11px] text-gray-900 pt-1 font-semibold">
                Ph: {order.shippingAddress.phone || order.customer.phone}
              </p>
            </div>

            <div className="pt-2 mt-2 border-t border-dashed border-gray-300">
              <p className="text-[10.5px] font-mono font-bold text-black">
                <span className="font-sans font-bold">Order ID:</span> {order.orderNumber || order.id}
              </p>
            </div>
          </div>

          {/* Center QR Code Column (5 cols) */}
          <div className="col-span-5 p-2 flex flex-col items-center justify-center bg-white">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Order QR Code"
                className="w-28 h-28 object-contain"
              />
            ) : null}
            <span className="text-[8.5px] font-mono text-center font-bold tracking-tight mt-1 text-gray-800">
              SCAN FOR BILL / URL
            </span>
          </div>
        </div>

        {/* 2. Seller Info */}
        <div className="p-2 text-[10px] border-b border-black leading-tight bg-gray-50">
          <p>
            <span className="font-black">Sold By:</span> Urbn Furnish Retail Pvt Ltd, Baner High Street, Pune, MH - 411045
          </p>
          <p className="font-mono font-bold text-gray-900 pt-0.5">
            <span className="font-sans font-bold text-black">GSTIN No:</span> 27AABCU1289P1ZM
          </p>
        </div>

        {/* 3. Product Details Table */}
        <div className="border-b border-black">
          <table className="w-full text-left text-[10.5px] border-collapse">
            <thead>
              <tr className="border-b border-black font-black bg-gray-200 text-black">
                <th className="p-1.5 border-r border-black">Product</th>
                <th className="p-1.5 text-center w-14">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-1.5 border-r border-black leading-snug">
                    <span className="font-bold text-black block">{item.name}</span>
                    {item.variant && (
                      <span className="text-[9.5px] text-gray-700 block font-mono">
                        [{item.variant}]
                      </span>
                    )}
                    <span className="text-[9px] text-gray-600 font-mono block">
                      SKU: {item.sku}
                    </span>
                  </td>
                  <td className="p-1.5 text-center font-bold text-black align-middle font-mono text-xs">
                    {item.quantity}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-black font-black bg-gray-100">
                <td className="p-1.5 border-r border-black font-bold text-black">Total</td>
                <td className="p-1.5 text-center font-mono font-bold text-black">{totalQuantity}</td>
              </tr>
            </tbody>
          </table>

          {/* Routing Hub Tag */}
          <div className="flex justify-end p-1.5 bg-gray-200 border-t border-black font-mono font-black text-[11px]">
            <span>{routingHub}</span>
          </div>
        </div>

        {/* 4. Footer */}
        <div className="p-2 flex items-center justify-end gap-1.5 text-[9.5px] text-gray-700">
          <span className="italic">Ordered Through</span>
          <div className="flex items-center gap-1 font-black tracking-tight text-black text-[11.5px] uppercase">
            <span className="w-3 h-3 rounded-xs bg-[#e27429] inline-block" />
            <span>URBN FURNISH</span>
          </div>
        </div>
      </div>
    </div>
  );
}
