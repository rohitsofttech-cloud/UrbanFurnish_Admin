/**
 * Quotation Print HTML Generator
 * Re-exports and proxies to the common printable document component.
 */

import { Quotation } from '@/lib/quotationStore';
import { openPrintWindow } from '@/lib/printService';
import { generateQuotationPrintHtml } from '@/app/common/PrintableDocument';

export { generateQuotationPrintHtml };

export function printQuotation(q: Quotation): void {
  const html = generateQuotationPrintHtml(q);
  openPrintWindow({ title: `Quotation #${q.quotationNo}`, htmlContent: html });
}


