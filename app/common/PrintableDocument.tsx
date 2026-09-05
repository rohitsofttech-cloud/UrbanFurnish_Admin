'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { openPrintWindow, createPrintDocumentShell } from '@/lib/printService';
import { AdminProduct } from '@/lib/productData';
import { Invoice } from '@/lib/billingStore';
import { AdminOrder } from '@/lib/orderStore';
import { Quotation, numberToWords, QUOTATION_COMPANY } from '@/lib/quotationStore';

export type PrintableDocumentType = 'manufacturing' | 'invoice' | 'order-slip' | 'quotation';

export interface PrintableDocumentProps {
  type: PrintableDocumentType;
  // Payload objects based on document type
  product?: AdminProduct | null;
  qrCodeUrl?: string;
  invoice?: Invoice | null;
  order?: AdminOrder | null;
  quotation?: Quotation | null;
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
      <div style="display: flex; align-items: center ; gap: 14px;">
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
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 11px; color: #111; background: #fff; padding: 16px 12px; display: flex; justify-content: center; align-items: flex-start; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .wrap { max-width: 100%; width: 100%; margin: 0; }

    /* ── Top badge ── */
    .top-badge { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; color: #e27429; margin-bottom: 8px; text-align: right; }

    /* ── Header company section ── */
    .header-layout { display: flex; align-items: center; gap: 18px; margin-bottom: 12px; }
    .logo-container { width: 150px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #ffffff; border-radius: 10px; padding: 4px; overflow: hidden; }
    .company-logo { width: 100%; height: auto; max-height: 85px; object-fit: contain; display: block; }
    .company-details { flex: 1; }
    .company-name { font-size: 20px; font-weight: 900; color: #e27429; letter-spacing: -0.3px; margin-bottom: 4px; line-height: 1.15; text-transform: uppercase; }
    .company-info-line { font-size: 10.5px; color: #1f2937; line-height: 1.45; }
    .company-info-line strong { color: #000000; font-weight: 700; }

    /* ── Divider ── */
    .primary-divider { height: 3px; background: #000000; margin-bottom: 0px; }

    /* ── Meta bar ── */
    .meta-bar { display: grid; grid-template-columns: 1.4fr 1.2fr 1.2fr 1.2fr; background: #e2e8f0; padding: 7px 12px; font-size: 11px; color: #000000; align-items: center; margin-bottom: 14px; }
    .meta-item strong { font-weight: 700; }

    /* ── Address grid ── */
    .addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; background: #f8fafc; margin-bottom: 16px; font-size: 11px; }
    .addr-label { font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; color: #000; display: block; margin-bottom: 4px; }
    .addr-name { font-weight: 700; font-size: 12.5px; color: #000; margin-bottom: 2px; }
    .addr-detail { color: #334155; line-height: 1.5; }

    /* ── Items table ── */
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
    thead tr { background: #f1f5f9; border-top: 2px solid #000; border-bottom: 2px solid #000; }
    th { padding: 8px 9px; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 10px; color: #000; letter-spacing: 0.3px; }
    tbody tr { border-bottom: 1px solid #e2e8f0; page-break-inside: avoid; }
    tbody tr:last-child { border-bottom: none; }
    td { padding: 8px 9px; vertical-align: middle; }
    .right { text-align: right; }
    .center { text-align: center; }
    .mono { font-family: 'Courier New', monospace; }
    .bold { font-weight: 700; }

    /* ── Footer: Notes + Totals ── */
    .footer { display: flex; justify-content: space-between; gap: 24px; border-top: 2px solid #000; padding-top: 14px; margin-top: 4px; page-break-inside: avoid; }
    .notes { max-width: 380px; }
    .notes-label { font-weight: 800; text-transform: uppercase; font-size: 10px; color: #000; display: block; margin-bottom: 4px; }
    .notes p { font-size: 10.5px; color: #475569; line-height: 1.5; }
    .notes em { font-style: italic; font-size: 9.5px; color: #64748b; display: block; margin-top: 6px; }
    .totals { min-width: 270px; font-size: 11px; }
    .t-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .t-row:last-of-type { border-bottom: none; }
    .t-row .v { font-family: 'Courier New', monospace; font-weight: 600; color: #000; }
    .t-grand { display: flex; justify-content: space-between; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 6px 0; margin-top: 6px; font-weight: 900; font-size: 12.5px; color: #000; }
    .t-grand .v { font-family: 'Courier New', monospace; color: #e27429; font-weight: 900; }

    /* ── Signature bar ── */
    .sig-bar { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #cbd5e1; margin-top: 28px; padding-top: 12px; font-size: 10.5px; color: #64748b; }
    .sig-right { text-align: right; }
    .sig-line { border-top: 1px solid #000; margin-top: 20px; padding-top: 4px; font-size: 10px; color: #334155; font-weight: 600; }

    @media print { body { padding: 0; } .wrap { max-width: 100%; } @page { margin: 6mm 6mm; size: A4 portrait; } }
  `;

  const bodyContent = `
  <div class="wrap">
    <!-- Top Badge -->
    <div class="top-badge">TAX INVOICE</div>

    <!-- Company Branding Header -->
    <div class="header-layout">
      <div class="logo-container">
        <img src="/logo.png" alt="Company Logo" class="company-logo" onerror="this.style.display='none'" />
      </div>
      <div class="company-details">
        <h1 class="company-name">URBN FURNISH PVT LTD</h1>
        <div class="company-info-line">Office: Plot No. 42, Furniture Tech Park, Phase 2, Industrial Area, Bangalore, Karnataka – 560066</div>
        <div class="company-info-line"><strong>GSTIN:</strong> ${inv.companyGst || '29AAAAU1234A1Z5'} &bull; <strong>PAN:</strong> ${inv.companyPan || 'AAAAU1234A'}</div>
        <div class="company-info-line"><strong>Email:</strong> billing@urbnfurnish.com &bull; <strong>Website:</strong> https://urbnfurnish.com</div>
        <div class="company-info-line"><strong>Dispatch From:</strong> Central Logistics Warehouse, Electronic City, Bangalore</div>
      </div>
    </div>

    <!-- Top Solid Black Divider -->
    <div class="primary-divider"></div>

    <!-- Meta Info Strip -->
    <div class="meta-bar">
      <div class="meta-item"><strong>Invoice No:</strong> ${inv.invoiceNumber}</div>
      <div class="meta-item"><strong>Invoice Date:</strong> ${inv.date}</div>
      <div class="meta-item"><strong>Due Date:</strong> ${inv.dueDate}</div>
      <div class="meta-item"><strong>Payment Mode:</strong> ${inv.paymentMethod}</div>
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
 * Generates the HTML string for Quotation
 */
export function generateQuotationPrintHtml(q: Quotation): string {
  // ─── Items Rows ────────────────────────────────────────────────────────────
  const defaultFallbackImage = 'https://images.unsplash.com/photo-1580481077194-436f58637ae7?w=400&auto=format&fit=crop&q=80';

  const itemRows = q.items
    .map(
      (item) => {
        const imgSrc = item.imageUrl && item.imageUrl.trim() ? item.imageUrl : defaultFallbackImage;
        return `
    <tr class="item-row">
      <td class="col-item">
        <div class="item-cell-content">
          <img src="${imgSrc}" class="item-img" alt="${item.name}" onerror="this.onerror=null; this.src='${defaultFallbackImage}';" />
          <div class="item-text-wrap">
            <div class="item-name">${item.name}</div>
            ${item.hsnCode ? `<div class="item-sub">HSN: ${item.hsnCode}</div>` : ''}
          </div>
        </div>
      </td>
      <td class="col-qty">${item.qty} ${item.qtyUnit || 'PCS'}</td>
      <td class="col-rate">${item.rate.toLocaleString('en-IN')}</td>
      <td class="col-tax">
        <div>${item.taxAmount.toLocaleString('en-IN')}</div>
        <div class="tax-pct">(${item.gstPercent || 18}%)</div>
      </td>
      <td class="col-amount">${item.amount.toLocaleString('en-IN')}</td>
    </tr>`;
      }
    )
    .join('');

  // ─── Extra Charges Rows ───────────────────────────────────────────────────
  const extraChargesRows = (q.extraCharges || [])
    .map(
      (c) => `
    <tr class="calc-row">
      <td class="calc-label">${c.label}</td>
      <td class="calc-val">₹ ${c.amount.toLocaleString('en-IN')}</td>
    </tr>`
    )
    .join('');

  const totalQty = q.items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const formattedQuotationDate = q.quotationDate
    ? new Date(q.quotationDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';
  const formattedExpiryDate = q.expiryDate
    ? new Date(q.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  const styles = `
    @page {
      size: A4 portrait;
      margin: 6mm 6mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #ffffff;
      color: #000000;
      font-size: 11px;
      line-height: 1.35;
      padding: 16px 12px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      background: #ffffff;
    }
    
    /* Top title */
    .top-badge {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #e27429;
      margin-bottom: 8px;
    }

    /* Header company section */
    .header-layout {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
    }
    .logo-container {
      width: 150px;
      height: 200pxs;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border-radius: 10px;
      padding: 6px;
      box-shadow: 0 2px 6px rgba(226, 116, 41, 0.08);
      overflow: hidden;
    }
    .company-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .company-details {
      flex: 1;
    }
    .company-name {
      font-size: 22px;
      font-weight: 900;
      color: #e27429;
      letter-spacing: -0.3px;
      margin-bottom: 4px;
      line-height: 1.15;
      text-transform: uppercase;
    }
    .company-info-line {
      font-size: 10px;
      color: #1f2937;
      line-height: 1.45;
    }
    .company-info-line strong {
      color: #000000;
      font-weight: 700;
    }

    /* Top heavy divider */
    .primary-divider {
      height: 3px;
      background: #000000;
      margin-bottom: 0px;
    }

    /* Meta bar with Quotation No, Date, Expiry */
    .meta-bar {
      display: grid;
      grid-template-columns: 1.2fr 1.4fr 1.4fr;
      background: #e2e8f0;
      padding: 7px 12px;
      font-size: 11.5px;
      color: #000000;
      align-items: center;
      margin-bottom: 12px;
    }
    .meta-item strong {
      font-weight: 700;
    }

    /* Client / Address Grid */
    .address-section {
      display: grid;
      grid-template-columns: 1.3fr 1.3fr 1.4fr;
      gap: 12px;
      padding: 0 4px;
      margin-bottom: 14px;
      font-size: 11px;
    }
    .addr-heading {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #000000;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }
    .addr-name {
      font-weight: 700;
      color: #000000;
      font-size: 12px;
      margin-bottom: 2px;
    }
    .addr-sub {
      font-size: 10.5px;
      color: #374151;
      line-height: 1.35;
    }
    .driver-val {
      font-weight: 700;
      font-size: 11px;
      color: #000000;
    }

    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
    }
    .items-table thead th {
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
      padding: 7px 8px;
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #000000;
    }
    .items-table th.col-items { text-align: left; padding-left: 6px; }
    .items-table th.col-qty { text-align: center; width: 85px; }
    .items-table th.col-rate { text-align: right; width: 90px; }
    .items-table th.col-tax { text-align: right; width: 90px; }
    .items-table th.col-amount { text-align: right; width: 100px; padding-right: 6px; }

    .items-table tbody tr.item-row td {
      padding: 7px 8px;
      vertical-align: middle;
      font-size: 11px;
      border-bottom: 1px solid #f1f5f9;
    }
    .item-cell-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .item-img {
      width: 44px;
      height: 44px;
      object-fit: cover;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      flex-shrink: 0;
      display: block;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }
    .item-img-placeholder {
      width: 44px;
      height: 44px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .item-text-wrap {
      flex: 1;
    }
    .item-name {
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      color: #000000;
      line-height: 1.25;
    }
    .item-sub {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 2px;
    }
    .col-qty {
      text-align: center;
      font-weight: 600;
      color: #000000;
      white-space: nowrap;
    }
    .col-rate {
      text-align: right;
      font-weight: 600;
      color: #000000;
    }
    .col-tax {
      text-align: right;
      font-weight: 600;
      color: #000000;
    }
    .tax-pct {
      font-size: 9px;
      color: #64748b;
    }
    .col-amount {
      text-align: right;
      font-weight: 700;
      color: #000000;
      padding-right: 6px;
    }

    /* Subtotal Bar */
    .subtotal-table-row td {
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
      padding: 6px 8px;
      font-weight: 800;
      font-size: 11.5px;
      text-transform: uppercase;
      color: #000000;
    }
    .subtotal-label {
      padding-left: 6px !important;
    }
    .subtotal-qty {
      text-align: center;
    }
    .subtotal-tax {
      text-align: right;
    }
    .subtotal-amt {
      text-align: right;
      padding-right: 6px !important;
    }

    /* Bottom Split: Terms & Conditions on Left, Totals on Right */
    .bottom-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 10px;
      gap: 20px;
    }
    .terms-column {
      flex: 1;
      max-width: 420px;
      padding-left: 4px;
    }
    .terms-heading {
      font-weight: 800;
      font-size: 10.5px;
      text-transform: uppercase;
      color: #000000;
      margin-bottom: 4px;
    }
    .terms-body {
      font-size: 10px;
      color: #111827;
      line-height: 1.5;
    }

    .totals-column {
      width: 290px;
    }
    .calc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .calc-table td {
      padding: 3px 0;
    }
    .calc-label {
      text-align: right;
      color: #111827;
      padding-right: 18px;
    }
    .calc-val {
      text-align: right;
      font-weight: 600;
      color: #000000;
      width: 95px;
      white-space: nowrap;
    }
    .grand-total-row td {
      border-top: 1px solid #000000;
      border-bottom: 1px solid #000000;
      padding: 6px 0;
      font-size: 12px;
      font-weight: 800;
      color: #000000;
    }

    /* Words in Bottom Right */
    .words-section {
      margin-top: 16px;
      text-align: right;
      padding-right: 4px;
    }
    .words-label {
      font-weight: 800;
      font-size: 11px;
      color: #000000;
      margin-bottom: 3px;
    }
    .words-text {
      font-size: 10.5px;
      color: #111827;
    }

    @media print {
      body {
        padding: 0;
      }
      .sheet {
        max-width: 100%;
      }
    }
  `;

  const bodyContent = `
  <div class="sheet">
    <!-- Top Title -->
    <div class="top-badge">QUOTATION</div>

    <!-- Company Branding Header -->
    <div class="header-layout">
      <div class="logo-container">
        <img src="/logo.png" alt="Company Logo" class="company-logo" onerror="this.style.display='none'" />
      </div>
      <div class="company-details">
        <h1 class="company-name">${QUOTATION_COMPANY.name}</h1>
        <div class="company-info-line">Office : ${QUOTATION_COMPANY.address}</div>
        <div class="company-info-line"><strong>GSTIN:</strong> ${QUOTATION_COMPANY.gstin}</div>
        <div class="company-info-line"><strong>Email:</strong> ${QUOTATION_COMPANY.email}</div>
        <div class="company-info-line"><strong>Website:</strong> ${QUOTATION_COMPANY.website}</div>
        <div class="company-info-line"><strong>Dispatch From:</strong> ${QUOTATION_COMPANY.dispatchFrom}</div>
      </div>
    </div>

    <!-- Top Solid Black Divider -->
    <div class="primary-divider"></div>

    <!-- Meta Info Strip -->
    <div class="meta-bar">
      <div class="meta-item"><strong>Quotation No.:</strong> ${q.quotationNo}</div>
      <div class="meta-item"><strong>Quotation Date:</strong> ${formattedQuotationDate}</div>
      <div class="meta-item"><strong>Expiry Date:</strong> ${formattedExpiryDate}</div>
    </div>

    <!-- Bill To, Ship To, Driver Info -->
    <div class="address-section">
      <div>
        <div class="addr-heading">BILL TO</div>
        <div class="addr-name">${q.billTo.name || '—'}</div>
        ${q.billTo.placeOfSupply ? `<div class="addr-sub">Place of Supply: ${q.billTo.placeOfSupply}</div>` : ''}
        ${q.billTo.address && q.billTo.address !== q.billTo.placeOfSupply ? `<div class="addr-sub">${q.billTo.address}</div>` : ''}
      </div>
      <div>
        <div class="addr-heading">SHIP TO</div>
        <div class="addr-name">${q.shipTo.name || q.billTo.name || '—'}</div>
        ${q.shipTo.address ? `<div class="addr-sub">${q.shipTo.address}</div>` : ''}
      </div>
      <div style="text-align: right;">
        <div class="addr-heading" style="display: flex; justify-content: flex-end; gap: 8px;">
          <span>Driver Number</span>
          <span class="driver-val">${q.driverNumber || '—'}</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th class="col-items">ITEMS</th>
          <th class="col-qty">QTY.</th>
          <th class="col-rate">RATE</th>
          <th class="col-tax">TAX</th>
          <th class="col-amount">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <!-- Subtotal Row -->
        <tr class="subtotal-table-row">
          <td class="subtotal-label">SUBTOTAL</td>
          <td class="subtotal-qty">${totalQty}</td>
          <td></td>
          <td class="subtotal-tax">₹ ${q.totalTaxAmount.toLocaleString('en-IN')}</td>
          <td class="subtotal-amt">₹ ${q.subtotal.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    <!-- Bottom Section: Terms on Left, Summary Calculations on Right -->
    <div class="bottom-section">
      <div class="terms-column">
        <div class="terms-heading">TERMS AND CONDITIONS</div>
        <div class="terms-body">
          ${(q.termsAndConditions || '').replace(/\n/g, '<br/>')}
        </div>
      </div>

      <div class="totals-column">
        <table class="calc-table">
          <tbody>
            ${q.packagingCharges > 0
      ? `<tr class="calc-row"><td class="calc-label">packing charges</td><td class="calc-val">₹ ${q.packagingCharges.toLocaleString('en-IN')}</td></tr>`
      : ''
    }
            ${extraChargesRows}
            <tr class="calc-row">
              <td class="calc-label">Taxable Amount</td>
              <td class="calc-val">₹ ${q.taxableAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="calc-row">
              <td class="calc-label">CGST @9%</td>
              <td class="calc-val">₹ ${q.cgst.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="calc-row">
              <td class="calc-label">SGST @9%</td>
              <td class="calc-val">₹ ${q.sgst.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="grand-total-row">
              <td class="calc-label" style="font-weight:800; color:#000;">Total Amount</td>
              <td class="calc-val" style="font-weight:800; color:#000;">₹ ${q.grandTotal.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Total Amount in Words -->
    <div class="words-section">
      <div class="words-label">Total Amount (in words)</div>
      <div class="words-text">${numberToWords(q.grandTotal)}</div>
    </div>
  </div>`;

  return createPrintDocumentShell({
    title: `Quotation #${q.quotationNo} — ${q.billTo.name}`,
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
  quotation,
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
    } else if (type === 'quotation') {
      if (!quotation) return;
      title = `Quotation #${quotation.quotationNo}`;
      htmlContent = generateQuotationPrintHtml(quotation);
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
    quotation: 'Print Quotation',
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
