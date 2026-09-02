'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { openPrintWindow, createPrintDocumentShell } from '@/lib/printService';
import { AdminProduct } from '@/lib/productData';
import { Invoice } from '@/lib/billingStore';
import { AdminOrder } from '@/lib/orderStore';

export type PrintableDocumentType = 'manufacturing' | 'invoice' | 'order-slip';

export interface PrintableDocumentProps {
  type: PrintableDocumentType;
  // Payload objects based on document type
  product?: AdminProduct | null;
  qrCodeUrl?: string;
  invoice?: Invoice | null;
  order?: AdminOrder | null;
  productQrs?: Record<string, { qr: string; url: string }>;
  // Optional button styling customizations
  className?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
  disabled?: boolean;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

/**
 * Generates the HTML string for Manufacturing Workshop Job Card
 */
export function generateManufacturingSpecHtml(
  product: AdminProduct,
  qrCodeUrl?: string
): string {
  const p = product;
  const allImagesList = [p.imageUrl, p.secondaryImageUrl, ...(p.images || [])]
    .filter(Boolean)
    .slice(0, 4);

  const imagesHtml = allImagesList
    .map(
      (img, idx) => `
      <div style="border:1px solid #0f172a; border-radius:4px; overflow:hidden; background:#fff; text-align:center; padding:4px;">
        <img src="${img}" style="width:100%; height:130px; object-fit:contain; display:block;" alt="Angle ${idx + 1}" />
        <span style="font-size:9px; font-weight:700; color:#475569; display:block; margin-top:2px;">VIEW ${idx + 1}</span>
      </div>`
    )
    .join('');

  const featuresHtml = (
    p.features && p.features.length > 0
      ? p.features
      : [
          'High-grade structural alignment as per technical blueprint',
          'Anti-termite and moisture-resistant kiln seasoned treatment',
          'Reinforced internal joint brackets and load-bearing corners',
          'Smooth sanded surface with uniform poly-coating finish',
        ]
  )
    .map(
      (f) => `
      <li style="margin-bottom:6px; font-size:11px; line-height:1.4; color:#1e293b;">
        <span style="display:inline-block; width:12px; height:12px; border:1.5px solid #0f172a; margin-right:6px; vertical-align:middle;"></span>
        ${f}
      </li>`
    )
    .join('');

  const styles = `
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0f172a; padding: 20px; }
    .sheet { max-width: 820px; margin: 0 auto; border: 2px solid #0f172a; padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 12px; }
    .title { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
    .badge { background: #0f172a; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; display: inline-block; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11.5px; }
    .meta-table th { background: #f1f5f9; text-align: left; padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800; width: 22%; text-transform: uppercase; font-size: 10px; }
    .meta-table td { padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 600; color: #0f172a; }
    .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; background: #0f172a; color: #fff; padding: 4px 8px; margin: 12px 0 8px 0; letter-spacing: 0.5px; }
    .gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
    .qa-box { border: 1.5px dashed #64748b; padding: 10px; border-radius: 4px; background: #f8fafc; margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 10.5px; }
    .sign-line { border-bottom: 1px solid #0f172a; height: 28px; margin-top: 6px; }
    @media print {
      body { padding: 0; }
      .sheet { border: 2px solid #000; }
      @page { margin: 8mm; size: A4 portrait; }
    }
  `;

  const bodyContent = `
  <div class="sheet">
    <div class="header">
      <div style="display: flex; align-items: flex-start; gap: 14px;">
        <img src="/logo.png" alt="Urbn Furnish" style="height: 48px; width: auto; object-fit: contain;" />
        <div>
          <span class="badge">FACTORY WORKSHOP JOB CARD</span>
          <h1 class="title" style="margin-top:4px;">${p.name}</h1>
          <p style="font-size:11.5px; color:#475569; font-weight:600; margin-top:2px;">
            Product SKU / Model Code: <strong style="color:#0f172a; font-family:monospace; font-size:13px;">${p.id}</strong> | Room: ${p.room} | Category: ${p.category}
          </p>
        </div>
      </div>
      <div style="text-align:right;">
        ${qrCodeUrl ? `<img src="${qrCodeUrl}" style="width:75px; height:75px; border:1px solid #0f172a; padding:2px;" alt="QR"/>` : ''}
        <div style="font-size:9px; font-family:monospace; font-weight:700; margin-top:2px;">JOB ID: ${p.id}-MFG</div>
      </div>
    </div>

    <!-- Visual Angle References -->
    <div class="section-title">1. VISUAL REFERENCE &amp; SHAPE PROFILE</div>
    <div class="gallery-grid">
      ${imagesHtml}
    </div>

    <!-- Technical Specifications Matrix -->
    <div class="section-title">2. MANUFACTURING &amp; MATERIAL SPECIFICATIONS</div>
    <table class="meta-table">
      <tr>
        <th>Primary Material</th>
        <td><strong>${p.material || 'Solid Hardwood'}</strong></td>
        <th>Finish / Color</th>
        <td><strong style="color:#b45309;">${p.finish || 'Natural Finish'}</strong></td>
      </tr>
      <tr>
        <th>Physical Dimensions</th>
        <td><strong style="font-family:monospace; font-size:12px;">${p.dimensions || 'Standard'}</strong></td>
        <th>Seating / Config</th>
        <td>${p.seatingCapacity || 'N/A'}</td>
      </tr>
      <tr>
        <th>Storage Structure</th>
        <td>${p.storageType || 'Without Storage'}</td>
        <th>Warranty Standard</th>
        <td>${p.warrantyYears ? `${p.warrantyYears} Years Structural` : '5 Years Standard'}</td>
      </tr>
      <tr>
        <th>Batch Stock Target</th>
        <td>${p.stock || 0} units active queue</td>
        <th>Delivery Target</th>
        <td>${p.deliveryDays || '3-5 Days'}</td>
      </tr>
    </table>

    <!-- Build Steps Checklist -->
    <div class="section-title">3. PRODUCTION QUALITY &amp; STRUCTURAL CHECKPOINTS</div>
    <ul style="list-style:none; padding:4px 8px;">
      ${featuresHtml}
      <li style="margin-bottom:6px; font-size:11px; line-height:1.4; color:#1e293b;">
        <span style="display:inline-block; width:12px; height:12px; border:1.5px solid #0f172a; margin-right:6px; vertical-align:middle;"></span>
        Final Quality Control stamp and dimensional tolerance inspection (±2mm max deviation)
      </li>
    </ul>

    <!-- Sign off boxes -->
    <div class="qa-box">
      <div>
        <strong>CARPENTRY / FRAME LEAD:</strong>
        <div class="sign-line"></div>
        <span style="font-size:9px; color:#64748b;">Signature &amp; Date</span>
      </div>
      <div>
        <strong>FINISH / UPHOLSTERY LEAD:</strong>
        <div class="sign-line"></div>
        <span style="font-size:9px; color:#64748b;">Signature &amp; Date</span>
      </div>
      <div>
        <strong>QC INSPECTION LEAD:</strong>
        <div class="sign-line"></div>
        <span style="font-size:9px; color:#64748b;">Passed [  ]  Rework [  ]</span>
      </div>
    </div>

    <div style="margin-top:12px; text-align:center; font-size:9.5px; color:#64748b; border-top:1px solid #cbd5e1; padding-top:6px;">
      URBN FURNISH MANUFACTURING DIVISION &bull; STRICTLY FOR PRODUCTION FLOOR USE &bull; CONFIDENTIAL
    </div>
  </div>
  `;

  return createPrintDocumentShell({
    title: `WORKSHOP PRODUCTION ORDER - ${p.id}`,
    styles,
    bodyContent,
  });
}

/**
 * Generates the HTML string for Official GST Tax Invoice
 */
export function generateTaxInvoiceHtml(invoice: Invoice): string {
  const inv = invoice;

  const itemRows = inv.items
    .map((item, idx) => {
      const taxableAmt =
        item.unitPrice * item.quantity * (1 - (item.discountPercentage || 0) / 100);
      return `
        <tr>
          <td>${idx + 1}</td>
          <td class="bold">${item.description}</td>
          <td class="mono center">${item.hsnCode || '—'}</td>
          <td class="center bold">${item.quantity}</td>
          <td class="mono right">₹${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td class="mono right">₹${taxableAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td class="mono right">₹${item.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td class="mono right bold">₹${item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>`;
    })
    .join('');

  const styles = `
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; background: #fff; padding: 28px 32px; display: flex; justify-content: center; align-items: flex-start; }
    .wrap { max-width: 860px; width: 100%; margin: 0; }

    /* ── Header ── */
    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 18px; }
    .brand-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .brand-icon { width: 38px; height: 38px; object-fit: contain; }
    .brand-name { font-size: 16px; font-weight: 900; letter-spacing: -0.2px; text-transform: uppercase; color: #e27429; }
    .brand-meta { font-size: 11px; color: #444; line-height: 1.55; }
    .inv-meta { text-align: right; }
    .inv-meta .title { font-size: 22px; font-weight: 900; text-transform: uppercase; color: #e27429; letter-spacing: 1px; }
    .inv-meta p { font-size: 11px; color: #333; margin-top: 4px; line-height: 1.65; }
    .inv-meta strong { color: #000; }

    /* ── Address grid ── */
    .addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border: 1px solid #ccc; border-radius: 6px; padding: 13px 16px; background: #f9f9f9; margin-bottom: 18px; font-size: 11px; }
    .addr-label { font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; color: #555; display: block; margin-bottom: 5px; }
    .addr-name { font-weight: 700; font-size: 13px; color: #000; margin-bottom: 3px; }
    .addr-detail { color: #444; line-height: 1.55; }

    /* ── Items table ── */
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 11px; }
    thead tr { background: #f0f0f0; border-top: 2px solid #000; border-bottom: 2px solid #000; }
    th { padding: 8px 9px; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 10px; color: #222; }
    tbody tr { border-bottom: 1px solid #e0e0e0; page-break-inside: avoid; }
    tbody tr:last-child { border-bottom: none; }
    td { padding: 9px; vertical-align: top; }
    .right { text-align: right; }
    .center { text-align: center; }
    .mono { font-family: 'Courier New', monospace; }
    .bold { font-weight: 700; }

    /* ── Footer: Notes + Totals ── */
    .footer { display: flex; justify-content: space-between; gap: 24px; border-top: 1.5px solid #000; padding-top: 16px; margin-top: 4px; page-break-inside: avoid; }
    .notes { max-width: 360px; }
    .notes-label { font-weight: 700; text-transform: uppercase; font-size: 10px; color: #333; display: block; margin-bottom: 5px; }
    .notes p { font-size: 10.5px; color: #555; line-height: 1.6; }
    .notes em { font-style: italic; font-size: 10px; color: #777; display: block; margin-top: 5px; }
    .totals { min-width: 250px; font-size: 11.5px; }
    .t-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; color: #444; }
    .t-row:last-of-type { border-bottom: none; }
    .t-row .v { font-family: 'Courier New', monospace; font-weight: 600; color: #111; }
    .t-grand { display: flex; justify-content: space-between; border-top: 2px solid #000; padding-top: 7px; margin-top: 6px; font-weight: 900; font-size: 13.5px; color: #000; }
    .t-grand .v { font-family: 'Courier New', monospace; color: #e27429; }

    /* ── Signature bar ── */
    .sig-bar { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #aaa; margin-top: 34px; padding-top: 12px; font-size: 10.5px; color: #555; }
    .sig-right { text-align: right; }
    .sig-line { border-top: 1px solid #555; margin-top: 22px; padding-top: 4px; font-size: 10px; color: #666; }

    @media print { body { padding: 14px; } @page { margin: 10mm; size: A4; } }
  `;

  const bodyContent = `
  <div class="wrap">
    <!-- Header -->
    <div class="inv-header">
      <div>
        <div class="brand-row">
          <img src="/logo.png" alt="Logo" class="brand-icon" />
          <span class="brand-name">URBN FURNISH PVT LTD</span>
        </div>
        <div class="brand-meta">
          Plot No. 42, Furniture Tech Park, Phase 2, Industrial Area,<br/>
          Bangalore, Karnataka – 560066<br/>
          <strong>GSTIN:</strong> ${inv.companyGst} &bull; <strong>PAN:</strong> ${inv.companyPan}<br/>
          Email: billing@urbnfurnish.com &bull; Web: https://urbnfurnish.com
        </div>
      </div>
      <div class="inv-meta">
        <div class="title">TAX INVOICE</div>
        <p><strong>Invoice No:</strong> ${inv.invoiceNumber}</p>
        <p>Invoice Date: ${inv.date}</p>
        <p>Due Date: ${inv.dueDate}</p>
        <p>Payment Mode: <strong>${inv.paymentMethod}</strong></p>
      </div>
    </div>

    <!-- Address -->
    <div class="addr-grid">
      <div>
        <span class="addr-label">Billed To:</span>
        <div class="addr-name">${inv.customerName}</div>
        <div class="addr-detail">
          ${inv.billingAddress}<br/>
          Phone: ${inv.customerPhone} &bull; Email: ${inv.customerEmail}
          ${inv.customerGst ? `<br/><strong>Buyer GSTIN:</strong> ${inv.customerGst}` : ''}
        </div>
      </div>
      <div>
        <span class="addr-label">Shipped / Delivered To:</span>
        <div class="addr-name">${inv.customerName}</div>
        <div class="addr-detail">
          ${inv.shippingAddress}<br/>
          State: Karnataka (Code: 29) &bull; Place of Supply: Inter-city Hub
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item Description</th>
          <th class="center">HSN Code</th>
          <th class="center">Qty</th>
          <th class="right">Unit Price</th>
          <th class="right">Taxable Amt</th>
          <th class="right">GST (18%)</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Footer: Notes + Totals -->
    <div class="footer">
      <div class="notes">
        <span class="notes-label">Terms &amp; Notes:</span>
        <p>${inv.notes}</p>
        <em>This is a computer generated invoice and requires no physical signature under GST Rule 46.</em>
      </div>
      <div class="totals">
        <div class="t-row"><span>Taxable Amount (Subtotal):</span><span class="v">₹${inv.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
        <div class="t-row"><span>CGST (9%):</span><span class="v">₹${inv.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
        <div class="t-row"><span>SGST (9%):</span><span class="v">₹${inv.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
        ${inv.igst > 0 ? `<div class="t-row"><span>IGST (18%):</span><span class="v">₹${inv.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>` : ''}
        <div class="t-grand"><span>Grand Total (INR):</span><span class="v">₹${inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
      </div>
    </div>

    <!-- Signature bar -->
    <div class="sig-bar">
      <div>
        <p style="font-family:monospace;font-size:10px;color:#777;">Invoice Ref: ${inv.id} &bull; Order: ${inv.orderId}</p>
      </div>
      <div class="sig-right">
        <p style="font-weight:700;color:#000;font-size:11px;">For URBN FURNISH PVT LTD</p>
        <div class="sig-line">Authorized Signatory (Finance)</div>
      </div>
    </div>
  </div>
  `;

  return createPrintDocumentShell({
    title: `Tax Invoice – ${inv.invoiceNumber}`,
    styles,
    bodyContent,
  });
}

/**
 * Generates the HTML string for Logistics / Shipping Order Slip
 */
export function generateOrderSlipHtml(
  order: AdminOrder,
  qrCodeUrl?: string,
  productQrs?: Record<string, { qr: string; url: string }>
): string {
  const itemRows = order.items
    .map((item) => {
      const pqr = productQrs?.[item.id]?.qr;
      return `
      <tr>
        <td style="padding:6px 8px;border-right:1px solid #000;vertical-align:top;width:44px;text-align:center;">
          <img src="${item.imageUrl}" alt="${item.name}" style="width:38px;height:38px;object-fit:cover;border:1px solid #ccc;border-radius:4px;display:block;margin:auto;" />
        </td>
        <td style="padding:4px 6px;border-right:1px solid #000;vertical-align:middle;text-align:center;width:55px;">
          ${pqr ? `<img src="${pqr}" style="width:48px;height:48px;object-fit:contain;display:block;margin:0 auto;border:1px solid #000;padding:1px;" alt="QR" />` : ''}
          <span style="font-family:monospace;font-size:8.5px;font-weight:900;color:#000;display:block;margin-top:2px;">${item.id}</span>
        </td>
        <td style="padding:6px 8px;border-right:1px solid #000;vertical-align:top;">
          <span style="font-weight:700;font-size:11px;color:#000;display:block;">${item.name}</span>
          ${item.variant ? `<span style="font-size:9.5px;color:#555;font-family:monospace;display:block;">[${item.variant}]</span>` : ''}
          <span style="font-size:9px;color:#666;font-family:monospace;display:block;margin-top:2px;">SKU: ${item.sku}</span>
        </td>
        <td style="padding:6px 8px;text-align:center;font-weight:700;font-family:monospace;font-size:11px;color:#000;vertical-align:middle;">${item.quantity}</td>
      </tr>`;
    })
    .join('');

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const cityCode = (order.shippingAddress.city || 'NSK').slice(0, 3).toUpperCase();
  const routingHub = `(N) BOM/${cityCode}`;

  const styles = `
    body { font-family:'Segoe UI',Arial,sans-serif;background:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:24px; }
    table { width:100%;border-collapse:collapse;font-size:10.5px; }
    thead tr { border-bottom:1px solid #000;background:#e5e5e5; }
    th { padding:6px 8px;font-weight:900;text-align:left;font-size:10.5px; }
    tbody tr { border-bottom:1px solid #ddd; }
    @media print { body{display:block;padding:0;min-height:auto;} @page{margin:8mm;} }
  `;

  const bodyContent = `
  <div style="width:380px;background:#fff;color:#000;border:2px dashed #000;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="display:grid;grid-template-columns:7fr 5fr;border-bottom:1px solid #000;">
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
            , IN-${(order.shippingAddress.state || 'KA').slice(0, 2).toUpperCase()}
          </p>
        </div>
        <div style="border-top:1px dashed #ccc;margin-top:8px;padding-top:8px;">
          <p style="font-size:10.5px;font-family:monospace;font-weight:700;"><span style="font-family:'Segoe UI',Arial,sans-serif;font-weight:700;">Order ID:</span> ${order.orderNumber || order.id}</p>
        </div>
      </div>
      <div style="padding:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;">
        ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR" style="width:112px;height:112px;object-fit:contain;"/>` : '<div style="width:112px;height:112px;background:#eee;display:flex;align-items:center;justify-content:center;font-size:10px;color:#888;">QR</div>'}
        <span style="font-size:8.5px;font-family:monospace;text-align:center;font-weight:700;margin-top:4px;color:#444;">SCAN FOR BILL / URL</span>
      </div>
    </div>

    <div style="padding:8px;font-size:10px;border-bottom:1px solid #000;line-height:1.5;background:#f9f9f9;">
      <p><span style="font-weight:900;">Sold By:</span> Urbn Furnish Retail Pvt Ltd, Baner High Street, Pune, MH – 411045</p>
      <p style="font-family:monospace;font-weight:700;color:#111;margin-top:2px;"><span style="font-family:'Segoe UI',Arial,sans-serif;font-weight:700;">GSTIN No:</span> 27AABCU1289P1ZM</p>
    </div>

    <div style="border-bottom:1px solid #000;">
      <table>
        <thead>
          <tr>
            <th style="border-right:1px solid #000;width:44px;text-align:center;">Img</th>
            <th style="border-right:1px solid #000;text-align:center;width:75px;">Product ID</th>
            <th style="border-right:1px solid #000;">Product</th>
            <th style="text-align:center;width:52px;">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          <tr style="border-top:2px solid #000;background:#f0f0f0;">
            <td colspan="3" style="padding:6px 8px;border-right:1px solid #000;font-weight:700;font-size:10.5px;">Total</td>
            <td style="padding:6px 8px;text-align:center;font-weight:700;font-family:monospace;font-size:11px;">${totalQuantity}</td>
          </tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;padding:6px 8px;background:#e5e5e5;border-top:1px solid #000;font-family:monospace;font-weight:900;font-size:11px;">
        ${routingHub}
      </div>
    </div>

    <div style="padding:8px 10px;display:flex;align-items:center;justify-content:flex-end;gap:8px;font-size:10px;color:#555;">
      <span style="font-style:italic;">Ordered Through</span>
      <img src="/logo.png" alt="URBN FURNISH" style="height:18px;width:auto;object-fit:contain;vertical-align:middle;display:inline-block;" />
    </div>
  </div>
  `;

  return createPrintDocumentShell({
    title: `Order Slip – ${order.orderNumber || order.id}`,
    styles,
    bodyContent,
  });
}

/**
 * Unified Print Document Trigger Button / Component
 */
export default function PrintableDocumentButton({
  type,
  product,
  qrCodeUrl,
  invoice,
  order,
  productQrs,
  className = '',
  buttonText,
  variant = 'primary',
  disabled = false,
  onBeforePrint,
  onAfterPrint,
}: PrintableDocumentProps) {
  const handleTriggerPrint = () => {
    if (disabled) return;
    if (onBeforePrint) onBeforePrint();

    let title = 'Print Document';
    let htmlContent = '';

    if (type === 'manufacturing') {
      if (!product) return;
      title = `WORKSHOP PRODUCTION ORDER - ${product.id}`;
      htmlContent = generateManufacturingSpecHtml(product, qrCodeUrl);
    } else if (type === 'invoice') {
      if (!invoice) return;
      title = `Tax Invoice – ${invoice.invoiceNumber}`;
      htmlContent = generateTaxInvoiceHtml(invoice);
    } else if (type === 'order-slip') {
      if (!order) return;
      title = `Order Slip – ${order.orderNumber || order.id}`;
      htmlContent = generateOrderSlipHtml(order, qrCodeUrl, productQrs);
    }

    if (htmlContent) {
      openPrintWindow({ title, htmlContent });
      if (onAfterPrint) onAfterPrint();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-secondary text-white hover:bg-secondary-light';
      case 'outline':
        return 'bg-bgColor border border-borderColor hover:bg-sidebarHover text-textColor';
      case 'icon':
        return 'p-2 rounded-xl bg-bgColor border border-borderColor text-textMuted hover:text-textColor hover:bg-sidebarHover';
      case 'primary':
      default:
        return 'bg-primary text-white hover:bg-primary-hover shadow-xs shadow-primary/30';
    }
  };

  const defaultLabels: Record<PrintableDocumentType, string> = {
    manufacturing: 'Print Workshop Job Card',
    invoice: 'Print Invoice (PDF)',
    'order-slip': 'Print Order Slip',
  };

  return (
    <button
      type="button"
      onClick={handleTriggerPrint}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${getVariantStyles()} ${className}`}
      title={buttonText || defaultLabels[type]}
    >
      <Printer size={15} />
      {variant !== 'icon' && <span>{buttonText || defaultLabels[type]}</span>}
    </button>
  );
}
