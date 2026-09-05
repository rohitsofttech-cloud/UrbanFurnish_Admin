/**
 * Custom Quotation Store — Urbn Furnish Admin
 * Handles types, calculations, seed data, and localStorage persistence.
 */

// ─── Unit Options ──────────────────────────────────────────────────────────────
export const QTY_UNITS = ['PCS', 'SQR FEET', 'MTR', 'SET'] as const;
export type QtyUnit = (typeof QTY_UNITS)[number];

export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GstRate = (typeof GST_RATES)[number];

// ─── Quotation Item ────────────────────────────────────────────────────────────
export interface QuotationItem {
  id: string;
  name: string;
  hsnCode: string;
  imageUrl?: string;
  qty: number;
  qtyUnit: QtyUnit;
  rate: number; // ex-tax price per unit
  gstPercent: number; // e.g. 18
  taxAmount: number; // computed
  amount: number; // computed = rate*qty + taxAmount
  isCustom: boolean; // true = ad-hoc item not from catalogue
  catalogProductId?: string; // set when pulled from admin products
}

// ─── Extra Charge (dynamic additional charges) ─────────────────────────────────
export interface ExtraCharge {
  id: string;
  label: string;
  amount: number;
}

// ─── Client Info ───────────────────────────────────────────────────────────────
export interface QuotationClient {
  name: string;
  address: string;
  placeOfSupply: string;
}

// ─── Full Quotation ────────────────────────────────────────────────────────────
export interface Quotation {
  id: string;
  quotationNo: string;
  quotationDate: string; // ISO date string
  expiryDate: string; // ISO date string
  billTo: QuotationClient;
  shipTo: QuotationClient;
  driverNumber: string;
  items: QuotationItem[];
  packagingCharges: number;
  extraCharges: ExtraCharge[];
  // Computed totals (stored for display / persistence)
  subtotal: number; // sum of (rate * qty) across items
  totalTaxAmount: number; // sum of taxAmount across items
  taxableAmount: number; // subtotal (after packaging & extra charges are excluded from taxable)
  cgst: number; // totalTaxAmount / 2
  sgst: number; // totalTaxAmount / 2
  grandTotal: number; // taxableAmount + cgst + sgst + packagingCharges + extraCharges
  termsAndConditions: string;
  notes: string;
  createdAt: string; // ISO datetime
}

// ─── Calculation Helpers ────────────────────────────────────────────────────────

/** Recalculate a single item's tax and total amount */
export function computeItemTotals(
  item: Omit<QuotationItem, 'taxAmount' | 'amount'>
): { taxAmount: number; amount: number } {
  const base = item.rate * item.qty;
  const taxAmount = parseFloat(((base * item.gstPercent) / 100).toFixed(2));
  const amount = parseFloat((base + taxAmount).toFixed(2));
  return { taxAmount, amount };
}

/** Recalculate all quotation-level totals from items + charges */
export function computeQuotationTotals(
  items: QuotationItem[],
  packagingCharges: number,
  extraCharges: ExtraCharge[]
): {
  subtotal: number;
  totalTaxAmount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
} {
  const subtotal = parseFloat(
    items.reduce((s, i) => s + i.rate * i.qty, 0).toFixed(2)
  );
  const totalTaxAmount = parseFloat(
    items.reduce((s, i) => s + i.taxAmount, 0).toFixed(2)
  );
  const taxableAmount = parseFloat(subtotal.toFixed(2));
  const cgst = parseFloat((totalTaxAmount / 2).toFixed(2));
  const sgst = parseFloat((totalTaxAmount / 2).toFixed(2));
  const extraTotal = extraCharges.reduce((s, c) => s + c.amount, 0);
  const grandTotal = parseFloat(
    (taxableAmount + cgst + sgst + packagingCharges + extraTotal).toFixed(2)
  );
  return { subtotal, totalTaxAmount, taxableAmount, cgst, sgst, grandTotal };
}

/** Convert number to Indian words (for quotation footer) */
export function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
    'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy',
    'Eighty', 'Ninety',
  ];

  const inWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000)
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000)
      return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000)
      return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = inWords(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + inWords(paise) + ' Paise';
  result += ' Only';
  return result;
}

// ─── Company Details (for print) ──────────────────────────────────────────────
export const QUOTATION_COMPANY = {
  name: 'URBN FURNISH PRIVATE LIMITED',
  address: 'Plot No. 42, Furniture Tech Park, Phase 2, Industrial Area, Bangalore, Karnataka - 560066',
  gstin: '29AAACU8921K1ZM',
  email: 'sales@urbnfurnish.com',
  website: 'www.urbnfurnish.com',
  dispatchFrom: 'Vivek Vihar Yojna Sector 9 Sangaria Riico Phase 2 Jodhpur-342013',
};

// ─── Default Terms ─────────────────────────────────────────────────────────────
export const DEFAULT_TERMS = `Payment Terms : 50% advance and Rest before dispatch
Transport : Transport charges will be extra as actual.`;

// ─── Seed Data ─────────────────────────────────────────────────────────────────
export const SEED_QUOTATIONS: Quotation[] = [
  {
    id: 'QUO-2026-001',
    quotationNo: '73',
    quotationDate: '2026-06-13',
    expiryDate: '2026-07-13',
    billTo: { name: 'Satinder Singh Gill', address: 'Maharashtra', placeOfSupply: 'Maharashtra' },
    shipTo: { name: 'Satinder Singh Gill', address: 'Maharashtra', placeOfSupply: 'Maharashtra' },
    driverNumber: '+91 96436 30336',
    items: [
      {
        id: 'qi-1',
        name: 'RESTAURENT CHAIR',
        hsnCode: '94016100',
        imageUrl: 'https://images.unsplash.com/photo-1580481077194-436f58637ae7?w=400&auto=format&fit=crop&q=80',
        qty: 1,
        qtyUnit: 'PCS',
        rate: 2900,
        gstPercent: 18,
        taxAmount: 522,
        amount: 3422,
        isCustom: false,
      },
      {
        id: 'qi-2',
        name: 'RESTAURENT CHAIR 2',
        hsnCode: '94016100',
        imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&auto=format&fit=crop&q=80',
        qty: 1,
        qtyUnit: 'PCS',
        rate: 3600,
        gstPercent: 18,
        taxAmount: 648,
        amount: 4248,
        isCustom: false,
      },
    ],
    packagingCharges: 5500,
    extraCharges: [],
    subtotal: 6500,
    totalTaxAmount: 1170,
    taxableAmount: 34600,
    cgst: 3114,
    sgst: 3114,
    grandTotal: 46328,
    termsAndConditions: DEFAULT_TERMS,
    notes: '',
    createdAt: '2026-06-13T10:00:00Z',
  },
];

// ─── LocalStorage ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'urbn_quotations_v1';

export function getStoredQuotations(): Quotation[] {
  if (typeof window === 'undefined') return SEED_QUOTATIONS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: Quotation[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Backfill image URLs if empty for seed items
        const defaultImgs: Record<string, string> = {
          'qi-1': 'https://images.unsplash.com/photo-1580481077194-436f58637ae7?w=400&auto=format&fit=crop&q=80',
          'qi-2': 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&auto=format&fit=crop&q=80',
        };
        const updated = parsed.map((q) => ({
          ...q,
          items: q.items.map((it) => {
            if (!it.imageUrl && defaultImgs[it.id]) {
              return { ...it, imageUrl: defaultImgs[it.id] };
            }
            if (!it.imageUrl && it.name.toUpperCase().includes('CHAIR')) {
              return { ...it, imageUrl: 'https://images.unsplash.com/photo-1580481077194-436f58637ae7?w=400&auto=format&fit=crop&q=80' };
            }
            return it;
          }),
        }));
        return updated;
      }
    }
  } catch {
    // ignore parse errors
  }
  return SEED_QUOTATIONS;
}

export function saveStoredQuotations(quotations: Quotation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
  } catch {
    // ignore storage errors
  }
}

export function generateQuotationNo(existing: Quotation[]): string {
  const maxNo = existing.reduce((m, q) => {
    const n = parseInt(q.quotationNo, 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return String(maxNo + 1);
}
