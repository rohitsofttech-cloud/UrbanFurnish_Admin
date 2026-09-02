export type TransactionStatus = 'Settled' | 'Processing' | 'Pending' | 'Failed' | 'Refunded';
export type PaymentGateway = 'Razorpay' | 'Stripe' | 'PayTM' | 'Cashfree' | 'UPI / Direct' | 'COD Settlement';
export type TransactionType = 'Order Payment' | 'Refund Payout' | 'Gateway Fee Charge' | 'Escrow Release' | 'Vendor Payout';

export interface FinancialTransaction {
  id: string;
  orderId?: string;
  invoiceNumber?: string;
  customerName: string;
  customerEmail?: string;
  timestamp: string;
  gateway: PaymentGateway;
  gatewayTxnId: string;
  type: TransactionType;
  grossAmount: number;
  fee: number;
  taxOnFee: number;
  netAmount: number;
  status: TransactionStatus;
  payoutBatch?: string;
  settlementDate?: string;
}

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'TXN-88401',
    orderId: 'ORD-9821',
    invoiceNumber: 'UF-INV-2026-0091',
    customerName: 'Eleanor Vance',
    customerEmail: 'eleanor.vance@example.com',
    timestamp: 'Today, 02:45 PM',
    gateway: 'Razorpay',
    gatewayTxnId: 'pay_NqR71X8kM2a9Z',
    type: 'Order Payment',
    grossAmount: 99999.0,
    fee: 1999.98,
    taxOnFee: 359.99,
    netAmount: 97639.03,
    status: 'Settled',
    payoutBatch: 'BATCH-2026-0901-A',
    settlementDate: '2026-09-01',
  },
  {
    id: 'TXN-88400',
    orderId: 'ORD-9820',
    invoiceNumber: 'UF-INV-2026-0092',
    customerName: 'Aarav Patel',
    customerEmail: 'aarav.patel@example.com',
    timestamp: 'Today, 01:15 PM',
    gateway: 'UPI / Direct',
    gatewayTxnId: 'upi_994821034857',
    type: 'Order Payment',
    grossAmount: 28999.0,
    fee: 0.0,
    taxOnFee: 0.0,
    netAmount: 28999.0,
    status: 'Settled',
    payoutBatch: 'BATCH-2026-0901-A',
    settlementDate: '2026-09-01',
  },
  {
    id: 'TXN-88399',
    orderId: 'ORD-9819',
    invoiceNumber: 'UF-INV-2026-0093',
    customerName: 'Rohan Deshmukh',
    customerEmail: 'rohan.deshmukh@example.com',
    timestamp: 'Today, 11:30 AM',
    gateway: 'Stripe',
    gatewayTxnId: 'ch_3N8Fj52eZvKYlo2C1',
    type: 'Order Payment',
    grossAmount: 42999.0,
    fee: 1289.97,
    taxOnFee: 232.19,
    netAmount: 41476.84,
    status: 'Settled',
    payoutBatch: 'BATCH-2026-0901-A',
    settlementDate: '2026-09-01',
  },
  {
    id: 'TXN-88398',
    orderId: 'ORD-9818',
    customerName: 'Meera Nambiar',
    customerEmail: 'meera.nambiar@example.com',
    timestamp: 'Today, 09:20 AM',
    gateway: 'PayTM',
    gatewayTxnId: 'ptm_tx_771829304',
    type: 'Refund Payout',
    grossAmount: -12499.0,
    fee: 0.0,
    taxOnFee: 0.0,
    netAmount: -12499.0,
    status: 'Refunded',
    payoutBatch: 'BATCH-2026-0901-B',
    settlementDate: '2026-09-01',
  },
  {
    id: 'TXN-88397',
    orderId: 'ORD-9817',
    invoiceNumber: 'UF-INV-2026-0094',
    customerName: 'Kavita Sundaram',
    customerEmail: 'kavita.s@example.com',
    timestamp: 'Yesterday, 07:15 PM',
    gateway: 'Cashfree',
    gatewayTxnId: 'cf_order_84920482',
    type: 'Order Payment',
    grossAmount: 24999.0,
    fee: 499.98,
    taxOnFee: 90.0,
    netAmount: 24409.02,
    status: 'Settled',
    payoutBatch: 'BATCH-2026-0831-C',
    settlementDate: '2026-08-31',
  },
  {
    id: 'TXN-88396',
    orderId: 'ORD-9816',
    invoiceNumber: 'UF-INV-2026-0095',
    customerName: 'Vikramaditya Roy',
    customerEmail: 'vikram.roy@example.com',
    timestamp: 'Yesterday, 04:40 PM',
    gateway: 'Razorpay',
    gatewayTxnId: 'pay_NpM82J3kA9pL',
    type: 'Order Payment',
    grossAmount: 76500.0,
    fee: 1530.0,
    taxOnFee: 275.4,
    netAmount: 74694.6,
    status: 'Settled',
    payoutBatch: 'BATCH-2026-0831-C',
    settlementDate: '2026-08-31',
  },
  {
    id: 'TXN-88395',
    orderId: 'ORD-9815',
    customerName: 'Nisha Gupta',
    customerEmail: 'nisha.gupta@example.com',
    timestamp: 'Yesterday, 02:10 PM',
    gateway: 'COD Settlement',
    gatewayTxnId: 'cod_remit_55102',
    type: 'Order Payment',
    grossAmount: 18450.0,
    fee: 150.0,
    taxOnFee: 27.0,
    netAmount: 18273.0,
    status: 'Processing',
    payoutBatch: 'BATCH-PENDING-COURIER',
  },
  {
    id: 'TXN-88394',
    orderId: 'ORD-9814',
    customerName: 'Sanjay Dutt',
    customerEmail: 'sanjay.d@example.com',
    timestamp: '28 Aug, 06:25 PM',
    gateway: 'Razorpay',
    gatewayTxnId: 'pay_NnQ11Z7wP4qR',
    type: 'Order Payment',
    grossAmount: 34990.0,
    fee: 699.8,
    taxOnFee: 125.96,
    netAmount: 34164.24,
    status: 'Settled',
    payoutBatch: 'BATCH-2026-0829-A',
    settlementDate: '2026-08-29',
  },
  {
    id: 'TXN-88393',
    orderId: 'ORD-9813',
    customerName: 'Pooja Hegde',
    customerEmail: 'pooja.hegde@example.com',
    timestamp: '28 Aug, 01:10 PM',
    gateway: 'Stripe',
    gatewayTxnId: 'ch_3N7Tk12eZvKYlo2B9',
    type: 'Order Payment',
    grossAmount: 56200.0,
    fee: 1686.0,
    taxOnFee: 303.48,
    netAmount: 54210.52,
    status: 'Settled',
    payoutBatch: 'BATCH-2026-0829-A',
    settlementDate: '2026-08-29',
  },
];

const FINANCIALS_STORAGE_KEY = 'urbn_admin_financials_v1';

export function getStoredTransactions(): FinancialTransaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  try {
    const data = localStorage.getItem(FINANCIALS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem(FINANCIALS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(txns: FinancialTransaction[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FINANCIALS_STORAGE_KEY, JSON.stringify(txns));
}
