'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { getOrderById, AdminOrder } from '@/lib/orderStore';
import { Printer } from 'lucide-react';

export default function PublicOrderSlipPage() {
  const routeParams = useParams();
  const routeId = typeof routeParams?.id === 'string' ? routeParams.id : Array.isArray(routeParams?.id) ? routeParams.id[0] : '';
  
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let currentId = routeId;
    if (!currentId && typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/');
      currentId = parts[parts.length - 1] || '';
    }

    if (currentId) {
      const decodedId = decodeURIComponent(currentId);
      const foundOrder = getOrderById(decodedId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
    setIsLoading(false);
  }, [routeId]);

  useEffect(() => {
    if (order && typeof window !== 'undefined') {
      const origin = window.location.origin.includes('localhost')
        ? window.location.origin.replace('localhost', '192.168.1.143')
        : window.location.origin;
      const url = `${origin}/slip/${encodeURIComponent(order.id)}`;

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
  }, [order]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-sm w-full text-center space-y-3">
          <h2 className="text-base font-bold text-gray-800">Order Slip Not Found</h2>
          <p className="text-xs text-gray-500">The scanned order slip reference could not be found or has expired.</p>
        </div>
      </div>
    );
  }

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const cityCode = (order.shippingAddress.city || 'NSK').slice(0, 3).toUpperCase();
  const routingHub = `(N) BOM/${cityCode}`;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-2 sm:p-4 text-black selection:bg-neutral-200">
      <div className="mb-3 flex justify-end w-[380px] max-w-full print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black text-white text-xs font-bold shadow-md hover:bg-neutral-800 transition-colors"
        >
          <Printer size={13} />
          <span>Print Slip</span>
        </button>
      </div>

      <div className="w-[380px] max-w-full bg-white text-black font-sans border-2 border-black border-dashed p-3.5 shadow-lg print:shadow-none print:p-0 print:border-2 print:m-0">
        <div className="grid grid-cols-12 border-b border-black">
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

        <div className="p-2 text-[10px] border-b border-black leading-tight bg-gray-50/50">
          <p>
            <span className="font-black">Sold By:</span> Urbn Furnish Retail Pvt Ltd, Baner High Street, Pune, MH - 411045
          </p>
          <p className="font-mono font-bold text-gray-900 pt-0.5">
            <span className="font-sans font-bold text-black">GSTIN No:</span> 27AABCU1289P1ZM
          </p>
        </div>

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

          <div className="flex justify-end p-1.5 bg-gray-200/90 border-t border-black font-mono font-black text-[11px]">
            <span>{routingHub}</span>
          </div>
        </div>

        <div className="p-2 flex items-center justify-end gap-1.5 text-[9.5px] text-gray-700">
          <span className="italic font-medium">Ordered Through</span>
          <img
            src="/logo.png"
            alt="URBN FURNISH"
            className="h-4 sm:h-[18px] w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
