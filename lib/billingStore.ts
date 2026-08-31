/**
 * Invoicing & Billing Store for Urbn Furnish E-Commerce Admin
 * Supports GST tax calculations, invoice generation, status updates, and print/download formatting.
 */

export interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxRate: number; // e.g. 18 for 18% GST
  taxAmount: number;
  total: number;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Refunded' | 'Draft';
export type PaymentMethod = 'UPI / QR' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash on Delivery' | 'Bank Transfer';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGst?: string;
  billingAddress: string;
  shippingAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  companyGst: string;
  companyPan: string;
  createdAt: string;
}

export const COMPANY_DETAILS = {
  name: 'URBN FURNISH PRIVATE LIMITED',
  address: 'Plot No. 42, Furniture Tech Park, Phase 2, Industrial Area, Bangalore, Karnataka - 560066',
  email: 'billing@urbnfurnish.com',
  phone: '+91 (080) 4920-8800',
  website: 'https://urbnfurnish.com',
  companyGst: '29AAACU8921K1ZM',
  companyPan: 'AAACU8921K',
};

export const SEED_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-001',
    invoiceNumber: 'UF-INV-2026-0089',
    orderId: 'ORD-9821',
    date: '2026-02-28',
    dueDate: '2026-02-28',
    customerName: 'Eleanor Vance',
    customerEmail: 'eleanor.v@example.com',
    customerPhone: '+91 98451 23456',
    customerGst: '29ABCDE1234F1Z5',
    billingAddress: '402, Highline Residency, Indiranagar 100ft Road, Bangalore - 560038',
    shippingAddress: '402, Highline Residency, Indiranagar 100ft Road, Bangalore - 560038',
    items: [
      {
        id: 'item-1',
        description: 'Lorenz 3+1+1 Seater Sofa Set (Velvet, Salmon Pink)',
        hsnCode: '94016100',
        quantity: 1,
        unitPrice: 99999,
        discountPercentage: 0,
        taxRate: 18,
        taxAmount: 15254.1,
        total: 99999,
      },
      {
        id: 'item-2',
        description: 'Brass Architectural Floor Lamp',
        hsnCode: '94052000',
        quantity: 2,
        unitPrice: 8499,
        discountPercentage: 10,
        taxRate: 18,
        taxAmount: 2333.6,
        total: 15298.2,
      },
    ],
    subtotal: 97709.5,
    discountAmount: 1699.8,
    cgst: 8793.85,
    sgst: 8793.85,
    igst: 0,
    taxTotal: 17587.7,
    grandTotal: 115297.2,
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    notes: 'Thank you for choosing Urbn Furnish! Includes 5-Year On-Site Manufacturer Warranty.',
    companyGst: COMPANY_DETAILS.companyGst,
    companyPan: COMPANY_DETAILS.companyPan,
    createdAt: '2026-02-28T09:30:00Z',
  },
  {
    id: 'INV-2026-002',
    invoiceNumber: 'UF-INV-2026-0090',
    orderId: 'ORD-9820',
    date: '2026-02-27',
    dueDate: '2026-03-05',
    customerName: 'Marcus Thorne',
    customerEmail: 'm.thorne@example.com',
    customerPhone: '+91 97312 98765',
    billingAddress: 'Flat 12B, Ocean Crest Apartments, Bandra West, Mumbai - 400050',
    shippingAddress: 'Flat 12B, Ocean Crest Apartments, Bandra West, Mumbai - 400050',
    items: [
      {
        id: 'item-3',
        description: 'Marriott 3 Seater Wooden Sofa (Teak Finish)',
        hsnCode: '94016100',
        quantity: 1,
        unitPrice: 24999,
        discountPercentage: 0,
        taxRate: 18,
        taxAmount: 3813.4,
        total: 24999,
      },
    ],
    subtotal: 21185.6,
    discountAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 3813.4,
    taxTotal: 3813.4,
    grandTotal: 24999,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI / QR',
    notes: 'Interstate sale (IGST 18%). Assembly scheduled on delivery.',
    companyGst: COMPANY_DETAILS.companyGst,
    companyPan: COMPANY_DETAILS.companyPan,
    createdAt: '2026-02-27T11:15:00Z',
  },
  {
    id: 'INV-2026-003',
    invoiceNumber: 'UF-INV-2026-0091',
    orderId: 'ORD-9819',
    date: '2026-02-26',
    dueDate: '2026-03-02',
    customerName: 'Sophia Lin',
    customerEmail: 'sophia.lin@example.com',
    customerPhone: '+91 99801 45678',
    billingAddress: 'Villa 78, Prestige Golfshire, Nandi Hills, Bangalore - 562164',
    shippingAddress: 'Villa 78, Prestige Golfshire, Nandi Hills, Bangalore - 562164',
    items: [
      {
        id: 'item-4',
        description: 'Sensa 4 Seater Dining Set',
        hsnCode: '94036000',
        quantity: 1,
        unitPrice: 21988,
        discountPercentage: 5,
        taxRate: 18,
        taxAmount: 3186.3,
        total: 20888.6,
      },
      {
        id: 'item-5',
        description: 'Hampton 3 Tier Solid Wood Shoe Rack',
        hsnCode: '94036000',
        quantity: 1,
        unitPrice: 5999,
        discountPercentage: 0,
        taxRate: 18,
        taxAmount: 915.1,
        total: 5999,
      },
    ],
    subtotal: 22786.2,
    discountAmount: 1099.4,
    cgst: 2050.7,
    sgst: 2050.7,
    igst: 0,
    taxTotal: 4101.4,
    grandTotal: 26887.6,
    paymentStatus: 'Pending',
    paymentMethod: 'Net Banking',
    notes: 'Awaiting bank NEFT confirmation.',
    companyGst: COMPANY_DETAILS.companyGst,
    companyPan: COMPANY_DETAILS.companyPan,
    createdAt: '2026-02-26T14:20:00Z',
  },
  {
    id: 'INV-2026-004',
    invoiceNumber: 'UF-INV-2026-0092',
    orderId: 'ORD-9818',
    date: '2026-02-24',
    dueDate: '2026-02-25',
    customerName: 'David K.',
    customerEmail: 'david.k@example.com',
    customerPhone: '+91 98860 11223',
    billingAddress: 'Tower 4, Apt 1102, Cyber Heights, Gachibowli, Hyderabad - 500032',
    shippingAddress: 'Tower 4, Apt 1102, Cyber Heights, Gachibowli, Hyderabad - 500032',
    items: [
      {
        id: 'item-6',
        description: 'Aurora Hydraulic Lift-Up Queen Bed',
        hsnCode: '94035000',
        quantity: 1,
        unitPrice: 33499,
        discountPercentage: 0,
        taxRate: 18,
        taxAmount: 5109.9,
        total: 33499,
      },
    ],
    subtotal: 28389.1,
    discountAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 5109.9,
    taxTotal: 5109.9,
    grandTotal: 33499,
    paymentStatus: 'Overdue',
    paymentMethod: 'Credit Card',
    notes: 'Payment gateway transaction timed out. Follow-up reminder sent.',
    companyGst: COMPANY_DETAILS.companyGst,
    companyPan: COMPANY_DETAILS.companyPan,
    createdAt: '2026-02-24T16:45:00Z',
  },
];

const BILLING_STORAGE_KEY = 'urbn_furnish_invoices_v1';

export function getStoredInvoices(): Invoice[] {
  if (typeof window === 'undefined') return SEED_INVOICES;
  try {
    const saved = localStorage.getItem(BILLING_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load invoices from localStorage', e);
  }
  return SEED_INVOICES;
}

export function saveStoredInvoices(invoices: Invoice[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoices to localStorage', e);
  }
}
