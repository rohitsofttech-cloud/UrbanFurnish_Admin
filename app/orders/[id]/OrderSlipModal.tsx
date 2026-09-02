'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { AdminOrder } from '@/lib/orderStore';
import { Printer, Copy, Check, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import PrintableDocumentButton from '@/app/common/PrintableDocument';

interface OrderSlipModalProps {
  order: AdminOrder;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderSlipModal({
  order,
  isOpen,
  onClose,
}: OrderSlipModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [orderSlipUrl, setOrderSlipUrl] = useState<string>('');
  const [productQrs, setProductQrs] = useState<Record<string, { qr: string; url: string }>>({});
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [previewQr, setPreviewQr] = useState<{ id: string; name: string; qr: string; url: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin.includes('localhost')
        ? window.location.origin.replace('localhost', '192.168.1.143')
        : window.location.origin;
      const url = `${origin}/slip/${encodeURIComponent(order.id)}`;
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

      // Generate per-product manufacturing spec QR codes
      const qrs: Record<string, { qr: string; url: string }> = {};
      const promises = order.items.map(async (item) => {
        const specUrl = `${origin}/manufacturing/${encodeURIComponent(item.id)}`;
        try {
          const qrUri = await QRCode.toDataURL(specUrl, {
            width: 200,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          });
          qrs[item.id] = { qr: qrUri, url: specUrl };
        } catch (e) {
          console.error(`Error generating QR for item ${item.id}:`, e);
        }
      });

      Promise.all(promises).then(() => {
        setProductQrs({ ...qrs });
      });
    }
  }, [order.id, order.items]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (orderSlipUrl) {
      navigator.clipboard.writeText(orderSlipUrl);
      setCopiedUrl(true);
      toast.success('Order Bill URL copied to clipboard');
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const cityCode = (order.shippingAddress.city || 'NSK').slice(0, 3).toUpperCase();
  const routingHub = `(N) BOM/${cityCode}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:static print:block print:bg-white print:z-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs print:hidden"
        onClick={onClose}
      />

      <div className="relative bg-surfaceColor rounded-2xl border border-borderColor shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-h-none print:w-full print:max-w-none print:rounded-none print:p-0 print:m-0 print:bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor bg-bgColor/50 shrink-0 print:hidden">
          <div>
            <h2 className="text-base sm:text-lg font-black text-textColor flex items-center gap-2">
              <Printer className="text-primary" size={18} />
              Print Order Slip (Shipping Label)
            </h2>
            <p className="text-xs text-textMuted font-mono">Order #{order.orderNumber || order.id} • Live Scannable QR</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-sidebarHover text-textMuted hover:text-textColor transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar print:overflow-visible print:p-0 print:m-0 print:border-none space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap bg-bgColor p-3 rounded-xl border border-borderColor text-xs print:hidden">
            <div className="flex items-center gap-2 text-textMuted min-w-0">
              <span className="font-semibold text-textColor shrink-0">QR Scan Target:</span>
              <span className="font-mono truncate text-[11px]">{orderSlipUrl}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surfaceColor border border-borderColor hover:bg-sidebarHover text-textColor font-medium shadow-xs"
              >
                {copiedUrl ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>

              <PrintableDocumentButton
                type="order-slip"
                order={order}
                qrCodeUrl={qrCodeUrl}
                productQrs={productQrs}
                buttonText="Print Slip"
                className="shadow-xs"
              />
            </div>
          </div>

          <div className="py-2 flex justify-center bg-gray-100 dark:bg-black/30 rounded-xl p-4 border border-gray-200 dark:border-borderColor">
            <div className="w-[380px] sm:w-[410px] bg-white text-black font-sans border-2 border-black border-dashed p-3.5 shadow-md selection:bg-gray-200">
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
                      <th className="p-1.5 border-r border-black w-10 text-center">Img</th>
                      <th className="p-1.5 border-r border-black text-center w-14">Spec QR</th>
                      <th className="p-1.5 border-r border-black">Product &amp; SKU</th>
                      <th className="p-1.5 text-center w-12">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {order.items.map((item) => {
                      const pqr = productQrs[item.id];
                      return (
                        <tr key={item.id}>
                          <td className="p-1.5 border-r border-black align-middle text-center">
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ url: item.imageUrl, name: item.name })}
                              className="group relative block w-8 h-8 mx-auto rounded overflow-hidden border border-gray-300 hover:border-black transition-all cursor-pointer"
                              title="Click to view large preview"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            </button>
                          </td>
                          <td className="p-1 border-r border-black align-middle text-center">
                            {pqr?.qr ? (
                              <button
                                type="button"
                                onClick={() => setPreviewQr({ id: item.id, name: item.name, qr: pqr.qr, url: pqr.url })}
                                className="group inline-flex flex-col items-center justify-center p-0.5 rounded hover:bg-yellow-50 border border-transparent hover:border-black/30 transition-all cursor-pointer"
                                title="Click to enlarge Manufacturing Spec QR Code"
                              >
                                <img
                                  src={pqr.qr}
                                  alt={`Spec QR for ${item.id}`}
                                  className="w-8 h-8 object-contain border border-black/80 rounded-xs bg-white"
                                />
                                <span className="font-mono text-[8px] font-black text-black group-hover:text-amber-700 block leading-tight">
                                  {item.id}
                                </span>
                              </button>
                            ) : (
                              <Link
                                href={`/manufacturing/${encodeURIComponent(item.id)}`}
                                target="_blank"
                                className="font-mono font-bold text-[9.5px] text-black hover:text-amber-700 underline"
                              >
                                {item.id}
                              </Link>
                            )}
                          </td>
                          <td className="p-1.5 border-r border-black leading-snug">
                            <Link
                              href={`/manufacturing/${encodeURIComponent(item.id)}`}
                              target="_blank"
                              className="font-bold text-black hover:text-amber-800 block text-[10.5px] group"
                              title="Open Manufacturing Spec in new tab"
                            >
                              <span>{item.name}</span>
                              <ExternalLink size={10} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            {item.variant && (
                              <span className="text-[9px] text-gray-700 block font-mono">
                                [{item.variant}]
                              </span>
                            )}
                            <span className="text-[8.5px] text-gray-600 font-mono block mt-0.5">
                              SKU: {item.sku}
                            </span>
                          </td>
                          <td className="p-1.5 text-center font-bold text-black align-middle font-mono text-xs">
                            {item.quantity}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-black font-black bg-gray-100">
                      <td colSpan={3} className="p-1.5 border-r border-black font-bold text-black">Total</td>
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
        </div>

        {/* Product Image Popup Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-2xl w-full bg-surfaceColor border border-borderColor rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-textColor truncate max-w-[85%]">{previewImage.name}</h4>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-lg bg-bgColor text-textMuted hover:text-textColor hover:bg-sidebarHover transition-colors"
                >
                  <X size={18} />
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

        {/* Product Spec QR Popup Modal */}
        {previewQr && (
          <div
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setPreviewQr(null)}
          >
            <div
              className="relative max-w-sm w-full bg-surfaceColor border border-borderColor rounded-2xl overflow-hidden shadow-2xl p-6 text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewQr(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-bgColor text-textMuted hover:text-textColor hover:bg-sidebarHover transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono inline-block">
                  SPEC ID: {previewQr.id}
                </span>
                <h3 className="text-base font-bold text-textColor">{previewQr.name}</h3>
                <p className="text-xs text-textMuted">
                  Scan this QR code with a workshop tablet to view live technical manufacturing specs.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border-2 border-black inline-block shadow-md">
                <img
                  src={previewQr.qr}
                  alt={`QR for ${previewQr.id}`}
                  className="w-48 h-48 object-contain mx-auto"
                />
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <Link
                  href={previewQr.url}
                  target="_blank"
                  className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ExternalLink size={14} />
                  <span>Open Spec Sheet Directly</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(previewQr.url);
                    toast.success(`Copied spec link for ${previewQr.id}`);
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-bgColor border border-borderColor text-textColor font-bold text-xs hover:bg-sidebarHover transition-colors flex items-center justify-center gap-1.5"
                >
                  <Copy size={13} />
                  <span>Copy Direct Spec URL</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-borderColor shrink-0 bg-bgColor/30 print:hidden">
          <p className="text-[11px] text-textMuted">
            Includes per-product scannable manufacturing spec QR codes.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-borderColor rounded-xl text-xs font-bold text-textColor hover:bg-sidebarHover transition-colors"
            >
              Close
            </button>
            <PrintableDocumentButton
              type="order-slip"
              order={order}
              qrCodeUrl={qrCodeUrl}
              productQrs={productQrs}
              buttonText="Print Slip"
              className="shadow-xs"
            />
          </div>
        </div>
      </div>

      <div id="printable-order-slip-target" className="hidden print:block w-[380px] bg-white text-black font-sans border-2 border-black border-dashed p-3.5 shadow-none">
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
            ) : null}
            <span className="text-[8.5px] font-mono text-center font-bold tracking-tight mt-1 text-gray-800">
              SCAN FOR BILL / URL
            </span>
          </div>
        </div>

        <div className="p-2 text-[10px] border-b border-black leading-tight bg-gray-50">
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
              <tr className="border-b border-black font-black bg-gray-200 text-black">
                <th className="p-1.5 border-r border-black w-10 text-center">Img</th>
                <th className="p-1.5 border-r border-black text-center w-14">Spec QR</th>
                <th className="p-1.5 border-r border-black">Product</th>
                <th className="p-1.5 text-center w-12">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {order.items.map((item) => {
                const pqr = productQrs[item.id];
                return (
                  <tr key={item.id}>
                    <td className="p-1.5 border-r border-black align-middle text-center">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-8 h-8 object-cover mx-auto rounded border border-gray-300"
                      />
                    </td>
                    <td className="p-1 border-r border-black align-middle text-center">
                      {pqr?.qr ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={pqr.qr}
                            alt="QR"
                            className="w-8 h-8 object-contain border border-black rounded-xs"
                          />
                          <span className="font-mono text-[7.5px] font-black">{item.id}</span>
                        </div>
                      ) : (
                        <span className="font-mono text-[9px] font-bold">{item.id}</span>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-black leading-snug">
                      <span className="font-bold text-black block">{item.name}</span>
                      {item.variant && (
                        <span className="text-[9.5px] text-gray-700 block font-mono">
                          [{item.variant}]
                        </span>
                      )}
                      <span className="text-[9px] text-gray-600 font-mono block mt-0.5">
                        SKU: {item.sku}
                      </span>
                    </td>
                    <td className="p-1.5 text-center font-bold text-black align-middle font-mono text-xs">
                      {item.quantity}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-black font-black bg-gray-100">
                <td colSpan={3} className="p-1.5 border-r border-black font-bold text-black">Total</td>
                <td className="p-1.5 text-center font-mono font-bold text-black">{totalQuantity}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end p-1.5 bg-gray-200 border-t border-black font-mono font-black text-[11px]">
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
